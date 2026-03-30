import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { ProductModule } from '../product/product.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Order.name, schema:OrderSchema }]),ProductModule,ActivityLogModule],
  providers: [OrderService,OrderRepository],
  controllers: [OrderController],
  exports: [OrderService, MongooseModule],
})
export class OrderModule {}
