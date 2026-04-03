import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../auth/enums/role.enum';
import { CreateProductDto, UpdateProductDto } from './dto';
import type { AuthRequest } from '../auth/types/auth-request.types';
import { ProductStatus } from './schemas/product.schema';

@Controller('product')

export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.Manager)
    @Post()
    async createProduct(@Body() dto: CreateProductDto, @Req() req : AuthRequest) {
        const result = await this.productService.createProduct(req.user.id,dto);
        return {
            success:true,
            message:'Product created successfully',
            data:result
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.Manager)
    @Put(':id')
    async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        const result = await this.productService.updateProduct(id, dto);
        return {
            success:true,
            message:'Product updated successfully',
            data:result
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.Manager)
    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body() status: { status: ProductStatus }, @Req() req: AuthRequest) {
        const result = await this.productService.updateStatus(id, status, req.user.id);
        return {
            success:true,
            message:'Product status updated successfully',
            data:result
        }
    }

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.Manager)
    @Patch(':id/restock')
    async restockProduct(@Param('id') id: string, @Body() dto: { quantity: number }, @Req() req: AuthRequest) {
        const result = await this.productService.restockProduct(id, dto, req.user.id);
        return {
            success:true,
            message:'Product restocked successfully',
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
    async getAllProducts(@Query() query: Record<string, unknown>) {
        const result = await this.productService.getAllProducts(query);
        return {
            success:true,
            message:'Products fetched successfully',
            meta:result.meta,
            data:result.data
        }
    }
}
