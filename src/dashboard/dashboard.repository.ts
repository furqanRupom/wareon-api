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

  async getRevenueTrend(days: number) {
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    return this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start },
          status: { $ne: OrderStatus.CANCELLED },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getOrderStatusBreakdown() {
    return this.orderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getTopSellingProducts(limit: number, days?: number) {
    const match: any = { status: { $ne: OrderStatus.CANCELLED } };
    if (days) {
      const start = new Date();
      start.setDate(start.getDate() - days);
      match.createdAt = { $gte: start };
    }

    return this.orderModel.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);
  }

  async getStockByCategory() {
    return this.productModel.aggregate([
      { $match: { status: { $ne: ProductStatus.INACTIVE } } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$category',
          categoryName: { $first: '$categoryInfo.name' },
          totalStock: { $sum: '$stock' },
          productCount: { $sum: 1 },
        },
      },
      { $sort: { totalStock: -1 } },
    ]);
  }

  async getRestockQueueByPriority() {
    return this.queueModel.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getWeeklyRevenueComparison() {
    const now = new Date();

    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1);

    const [result] = await this.orderModel.aggregate([
      {
        $facet: {
          thisWeek: [
            {
              $match: {
                createdAt: { $gte: thisWeekStart },
                status: { $ne: OrderStatus.CANCELLED },
              },
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
          ],
          lastWeek: [
            {
              $match: {
                createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
                status: { $ne: OrderStatus.CANCELLED },
              },
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
          ],
        },
      },
    ]);

    return result;
  }


  async getRecentOrders(limit: number, userId?: string) {
    const filter = userId ? { createdBy: userId } : {};
    return this.orderModel
      .find(filter)
      .select('customerName status totalPrice createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
