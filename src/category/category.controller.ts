import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { UserRole } from '../auth/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorators';
import { CreateCategoryDto } from './dto';

@Controller('category')
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.Manager)
    @Post()
    async createCategory(@Body() dto: CreateCategoryDto) {
        const result = await this.categoryService.createCategory(dto);
        return {
            success:true,
            message:'Category created successfully',
            data:result
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.Manager)
    @Put(':id')
    async updateCategory(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
        const result = await this.categoryService.updateCategory(id, dto);
        return {
            success:true,
            message:'Category updated successfully',
            data:result
        }
    }
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.Manager)
    @Delete(':id')
    async deleteCategory(@Param('id') id: string) {
        await this.categoryService.deleteCategory(id);
        return {
            success:true,
            message:'Category deleted successfully',
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.Manager)
    @Get('slug/:slug')
    async getCategoryBySlug(@Param('slug') slug: string) {
        const result = await this.categoryService.getCategoryBySlug(slug);
        return {
            success:true,
            message:'Category fetched successfully',
            data:result
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllCategories() {
        const result = await this.categoryService.getAllCategories();
        return {
            success: true,
            message: 'Categories fetched successfully',
            data: result
        }
    }
}
