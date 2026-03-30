import { Module } from '@nestjs/common';
import { RestockQueueService } from './restock-queue.service';
import { RestockQueueController } from './restock-queue.controller';
import { RestockQueueRepository } from './restock-queue.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { RestockQueueSchema } from './schemas/restock-queue.schema';

@Module({
  imports :[MongooseModule.forFeature([{ name: 'RestockQueue', schema: RestockQueueSchema }]),],
  providers: [RestockQueueService, RestockQueueRepository],
  controllers: [RestockQueueController],
  exports: [RestockQueueService],
})
export class RestockQueueModule {}
