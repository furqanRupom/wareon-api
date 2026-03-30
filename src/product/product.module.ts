import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductRepository } from './product.repository';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),CategoryModule],
  providers: [ProductService,ProductRepository],
  controllers: [ProductController]
})
export class ProductModule {}
