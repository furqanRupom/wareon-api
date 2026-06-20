import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument, ProductStatus } from './schemas/product.schema';
import { Model } from 'mongoose';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Category, CategoryDocument } from '../category/schemas/category.schema';
import { RestockQueueService } from '../restock-queue/restock-queue.service';
import { GetProductsDto, GetProductsQueryDto } from './dto/get-products.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private restockQueueService: RestockQueueService,
  ) { }

  async createProduct(userId: string, dto: CreateProductDto): Promise<Product> {
    const category = await this.categoryModel.findById(dto.category).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const createdProduct = new this.productModel(dto);

    const product = await createdProduct.save();
    if (product.stock < product.minStockThreshold) {
      await this.restockQueueService.addIfNeeded(
        product._id.toString(),
        product.name,
        product.stock,
        product.minStockThreshold,
        userId
      );
    }
    return product;
  }

  async findAll(query: GetProductsQueryDto): Promise<GetProductsDto> {
    const filter: any = {};

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const skip = (page - 1) * limit;

    // Search across name + sku, case-insensitive
    if (query.search) {
      const regex = { $regex: query.search, $options: 'i' };
      filter.$or = [{ name: regex }, { sku: regex }];
    }

    // Multi-category support: ?category=id1,id2
    if (query.category) {
      const categoryIds = String(query.category)
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      if (categoryIds.length === 1) {
        filter.category = categoryIds[0];
      } else if (categoryIds.length > 1) {
        filter.category = { $in: categoryIds };
      }
    }

    // Price range
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) filter.price.$gte = Number(query.minPrice);
      if (query.maxPrice !== undefined) filter.price.$lte = Number(query.maxPrice);
    }

    // Status filter: supports multiple statuses, e.g. "ACTIVE,OUT_OF_STOCK"
    if (query.status) {
      const statuses = String(query.status)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    } else {
      // default: never show inactive products on the public shop
      filter.status = { $ne: 'INACTIVE' };
    }

    // In-stock only toggle
    if (query.inStock === 'true') {
      filter.stock = { ...(filter.stock ?? {}), $gt: 0 };
    }

    // Sorting
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'name-asc': { name: 1 },
      'name-desc': { name: -1 },
      'stock-asc': { stock: 1 },
      'stock-desc': { stock: -1 },
    };
    const sort = sortMap[query.sort ?? 'newest'] ?? sortMap.newest;

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };

  }

  async findById(id: string): Promise<Product | null> {
    return this.productModel.findById(id).populate('category').exec();
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product | null> {
    const category = await this.categoryModel.findById(dto.category).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.productModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async updateStatus(id: string, dto: { status: ProductStatus }, userId: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    if (dto.status === ProductStatus.ACTIVE && product.stock === 0) {
      throw new BadRequestException('Cannot set Active when stock is 0. Restock first.');
    }

    product.status = dto.status;
    await product.save();

    if (dto.status === ProductStatus.INACTIVE) {
      await this.restockQueueService.remove(id, product.name, userId);
    }

    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productModel.findByIdAndDelete(id).exec();
  }

  async restoreStock(id: string, quantity: number, userId = 'system'): Promise<ProductDocument> {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    product.stock += quantity;
    await product.save();

    if (product.stock >= product.minStockThreshold) {
      await this.restockQueueService.remove(id, product.name, userId);
    }

    return product;
  }

  async restock(
    id: string,
    dto: { quantity: number },
    userId: string,
  ): Promise<{ product: ProductDocument; removedFromQueue: boolean }> {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    product.stock += dto.quantity;
    await product.save();


    let removedFromQueue = false;
    if (product.stock >= product.minStockThreshold) {
      removedFromQueue = await this.restockQueueService.remove(id, product.name, userId);
    }

    return { product, removedFromQueue };
  }

  async deductStock(id: string, quantity: number, userId = 'system'): Promise<ProductDocument> {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Only ${product.stock} item(s) available for "${product.name}"`,
      );
    }
    if (product.status === ProductStatus.INACTIVE) {
      throw new BadRequestException(`Product "${product.name}" is currently unavailable`);
    }

    product.stock -= quantity;
    await product.save();

    if (product.stock < product.minStockThreshold) {
      await this.restockQueueService.addIfNeeded(
        id,
        product.name,
        product.stock,
        product.minStockThreshold,
        userId,
      );
    }

    return product;
  }
}
