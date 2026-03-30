import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    RestockQueue,
    RestockQueueDocument,
} from '../restock-queue/schemas/restock-queue.schema';
import { Order, OrderDocument, OrderStatus } from '../order/schemas/order.schema';
import { Product, ProductDocument, ProductStatus } from '../product/schemas/product.schema';

@Injectable()
export class DashboardRepository {
    constructor(
        @InjectModel(Order.name)
        private readonly orderModel: Model<OrderDocument>,

        @InjectModel(Product.name)
        private readonly productModel: Model<ProductDocument>,

        @InjectModel(RestockQueue.name)
        private readonly queueModel: Model<RestockQueueDocument>,
    ) { }

    async getOrderStats(start: Date, end: Date) {
        const [result] = await this.orderModel.aggregate([
            {
                $facet: {
                    ordersToday: [
                        { $match: { createdAt: { $gte: start, $lte: end } } },
                        { $count: 'count' },
                    ],
                    pendingOrders: [
                        { $match: { status: OrderStatus.PENDING } },
                        { $count: 'count' },
                    ],
                    completedOrders: [
                        { $match: { status: OrderStatus.DELIVERED } },
                        { $count: 'count' },
                    ],
                    revenueToday: [
                        {
                            $match: {
                                createdAt: { $gte: start, $lte: end },
                                status: { $ne: OrderStatus.CANCELLED },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$totalPrice' },
                            },
                        },
                    ],
                },
            },
        ]);

        return result;
    }

    async getProductCounts() {
        const [totalProducts, outOfStockCount] = await Promise.all([
            this.productModel.countDocuments({
                status: { $ne: ProductStatus.INACTIVE },
            }),
            this.productModel.countDocuments({
                status: ProductStatus.OUT_OF_STOCK,
            }),
        ]);

        return { totalProducts, outOfStockCount };
    }

    async getLowStockCount() {
        return this.queueModel.countDocuments();
    }

    async getProductSummary() {
        return this.productModel
            .find({ status: { $ne: ProductStatus.INACTIVE } })
            .select('name stock minStockThreshold status category')
            .populate('category', 'name')
            .sort({ stock: 1 })
            .limit(20)
            .lean();
    }
}