import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Model } from 'mongoose';

@Injectable()
export class OrderRepository {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) { }

    async create(data: Partial<Order>): Promise<OrderDocument> {
        return this.orderModel.create(data);
    }

    async findAll(query: Record<string,unknown>, options?: { skip?: number; limit?: number }) {
        return this.orderModel
            .find(query)
            .skip(options?.skip || 0)
            .limit(options?.limit || 10)
            .sort({ createdAt: -1 });
    }

    async count(query: any) {
        return this.orderModel.countDocuments(query);
    }

    async findToday(start: Date, end: Date): Promise<Order[]> {
        return this.orderModel
            .find({ createdAt: { $gte: start, $lte: end } })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    async findById(id: string): Promise<OrderDocument | null> {
        return this.orderModel
            .findById(id)
            .populate('createdBy', 'name email')
            .exec();
    }

    async save(order: OrderDocument): Promise<OrderDocument> {
        return order.save();
    }

    async aggregate(pipeline: any[]): Promise<any[]> {
        return this.orderModel.aggregate(pipeline);
    }
}