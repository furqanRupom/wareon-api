import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepository: CategoryRepository
    ) { }
    async createCategory(dto: CreateCategoryDto) {
        return this.categoryRepository.createCategory(dto);
    }
    async getAllCategories(query:Record<string,unknown>) {
        return this.categoryRepository.findAll(query);
    }
    async getCategoryById(id: string) {
        return this.categoryRepository.findById(id);
    }
    async getCategoryBySlug(slug: string) {
        return this.categoryRepository.findBySlug(slug);
    }
    async updateCategory(id: string, dto: CreateCategoryDto) {
        return this.categoryRepository.updateCategory(id, dto);
    }
    async deleteCategory(id: string) {
        return this.categoryRepository.deleteCategory(id);
    }
}
