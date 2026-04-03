import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument, ProductStatus } from './schemas/product.schema';
import { Model } from 'mongoose';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Category, CategoryDocument } from '../category/schemas/category.schema';
import { RestockQueueService } from '../restock-queue/restock-queue.service';
import { GetProductsDto } from './dto/get-products.dto';

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

    async findAll(query: any): Promise<GetProductsDto> {
        const filter: any = {};
        const page = Number(query.page) || 1
        const limit = Number(query.limit) || 10
        const skip = (page - 1) * limit
        if (query.search) {
            filter.name = { $regex: query.search, $options: "i" };
        }

        if (query.category) {
            filter.category = query.category;
        }

        if (query.minPrice || query.maxPrice) {
            filter.price = {};

            if (query.minPrice) {
                filter.price.$gte = Number(query.minPrice);
            }

            if (query.maxPrice) {
                filter.price.$lte = Number(query.maxPrice);
            }
        }


        const data = await this.productModel
            .find(filter)
            .populate("category")
            .skip(skip)
            .limit(limit)
            .exec();

        const total = await this.productModel.countDocuments(filter);

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
