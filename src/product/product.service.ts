import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto';

@Injectable()
export class ProductService {
    constructor(
        private readonly productRepository: ProductRepository
    ) { }

    async createProduct(dto: CreateProductDto) {
        return this.productRepository.createProduct(dto);
    }
    async getAllProducts() {
        return this.productRepository.findAll();
    }
    async getProductById(id: string) {
        return this.productRepository.findById(id);
    }
    async updateProduct(id: string, dto: CreateProductDto) {
        return this.productRepository.updateProduct(id, dto);
    }
    async deleteProduct(id: string) {
        return this.productRepository.deleteProduct(id);
    }
}
