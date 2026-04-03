import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto, GetCategoryDto } from './dto';
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

    async findAll(query:Record<string,any>): Promise<GetCategoryDto> {

        if (query.search) {
            query.name = { $regex: query.search, $options: "i" };
        }

        if (query.isActive !== undefined) {
            query.isActive = query.isActive === "true" || query.isActive === true;
        }

        const page = Number(query.page) || 1;
        const limit = Math.min(Number(query.limit) || 10, 100);
        const skip = (page - 1) * limit;

        const total = await this.categoryModel.countDocuments(query);

        const data = await this.categoryModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();

        const meta = {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };

        return {
            meta,
            data,
        };
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
