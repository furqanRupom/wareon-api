import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { Roles } from 'src/common/decorators';
import { UserRole } from 'src/auth/enums/role.enum';
import { CreateProductDto } from './dto';

@Controller('product')
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.Manager)
    @Post()
    async createProduct(@Body() dto: CreateProductDto) {
        const result = await this.productService.createProduct(dto);
        return {
            success:true,
            message:'Product created successfully',
            data:result
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.Manager)
    @Put(':id')
    async updateProduct(@Param('id') id: string, @Body() dto: CreateProductDto) {
        const result = await this.productService.updateProduct(id, dto);
        return {
            success:true,
            message:'Product updated successfully',
            data:result
        }
    }
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.Manager)
    @Delete(':id')
    async deleteProduct(@Param('id') id: string) {
        await this.productService.deleteProduct(id);
        return {
            success:true,
            message:'Product deleted successfully',
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.Manager)
    @Get(':id')
    async getProductById(@Param('id') id: string) {
        const result = await this.productService.getProductById(id);
        return {
            success:true,
            message:'Product fetched successfully',
            data:result
        }
    }

    @Get()
    async getAllProducts() {
        const result = await this.productService.getAllProducts();
        return {
            success:true,
            message:'Products fetched successfully',
            data:result
        }
    }
}
