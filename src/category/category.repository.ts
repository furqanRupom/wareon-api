import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto';
import { generateSlug } from '../common/utils/slugify';

@Injectable()
export class CategoryRepository {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>
    ) { }

    async createCategory(dto: CreateCategoryDto): Promise<Category> {
        const slug = generateSlug(dto.name);
        const createdCategory = new this.categoryModel({ ...dto, slug });
        return createdCategory.save();
    }

    async findAll(): Promise<Category[]> {
        return this.categoryModel.find().exec();
    }

    async findById(id: string): Promise<Category | null> {
        return this.categoryModel.findById(id).exec();
    }
    async findBySlug(slug: string): Promise<Category | null> {
        return this.categoryModel.findOne({ slug }).exec();
    }

    async updateCategory(id: string, dto: CreateCategoryDto): Promise<Category | null> {
        const slug = generateSlug(dto.name);
        return this.categoryModel.findByIdAndUpdate(id, { ...dto, slug }, { new: true }).exec();
    }

    async deleteCategory(id: string): Promise<void> {
        await this.categoryModel.findByIdAndDelete(id).exec();
    }
}
