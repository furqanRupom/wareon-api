import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DashboardRepository } from './dashboard.repository';
import { RestockQueue, RestockQueueSchema } from '../restock-queue/schemas/restock-queue.schema';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { Order, OrderSchema } from '../order/schemas/order.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: RestockQueue.name, schema: RestockQueueSchema },
    ]),
  ],
  providers: [DashboardService, DashboardRepository],
  controllers: [DashboardController]
})
export class DashboardModule {}
