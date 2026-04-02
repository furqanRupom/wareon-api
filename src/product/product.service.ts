import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto';
import { ProductStatus } from './schemas/product.schema';
import { GetProductsDto } from './dto/get-products.dto';

@Injectable()
export class ProductService {
    constructor(
        private readonly productRepository: ProductRepository
    ) { }

    async createProduct(userId: string, dto: CreateProductDto) {
        return await this.productRepository.createProduct(userId, dto);
    }
    async getAllProducts(query:Record<string, unknown>) : Promise<GetProductsDto> {
        return await this.productRepository.findAll(query);
    }
    async getProductById(id: string) {
        return await this.productRepository.findById(id);
    }
    async updateProduct(id: string, dto: CreateProductDto) {
        return await this.productRepository.updateProduct(id, dto);
    }

    async updateStatus(id: string, status: { status: ProductStatus }, userId: string) {
        return await this.productRepository.updateStatus(id, status, userId);
    }
    async restockProduct(id: string, dto: { quantity: number }, userId: string) {
        return await this.productRepository.restock(id, dto, userId);
    }
    async deleteProduct(id: string) {
        return await this.productRepository.deleteProduct(id);
    }
}
