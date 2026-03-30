import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto';
import { Category, CategoryDocument } from '../category/schemas/category.schema';

@Injectable()
export class ProductRepository {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>
    ) { }

    async createProduct(dto: CreateProductDto): Promise<Product> {
        const category = await this.categoryModel.findById(dto.category).exec();
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        const createdProduct = new this.productModel(dto);
        return createdProduct.save();
    }

    async findAll(): Promise<Product[]> {
        return this.productModel.find().populate('category').exec();
    }

    async findById(id: string): Promise<Product | null> {
        return this.productModel.findById(id).populate('category').exec();
    }

    async updateProduct(id: string, dto: CreateProductDto): Promise<Product | null> {
        const category = await this.categoryModel.findById(dto.category).exec();
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return this.productModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    }

    async deleteProduct(id: string): Promise<void> {
        const product = await this.productModel.findById(id).exec();
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        await this.productModel.findByIdAndDelete(id).exec();
    }
}
