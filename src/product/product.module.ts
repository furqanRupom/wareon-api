import { Module, forwardRef } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductRepository } from './product.repository';
import { CategoryModule } from '../category/category.module';
import { RestockQueueModule } from '../restock-queue/restock-queue.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]), CategoryModule, forwardRef(() => RestockQueueModule), ActivityLogModule],
  providers: [ProductService, ProductRepository],
  controllers: [ProductController],
  exports: [ProductRepository, MongooseModule],
})
export class ProductModule { }
