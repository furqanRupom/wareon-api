import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
  ) { }

  async getStats() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const [orderAgg, lowStockCount, productCounts] = await Promise.all([
      this.dashboardRepository.getOrderStats(start, end),
      this.dashboardRepository.getLowStockCount(),
      this.dashboardRepository.getProductCounts(),
    ]);

    return {
      ordersToday: orderAgg?.ordersToday?.[0]?.count ?? 0,
      pendingOrders: orderAgg?.pendingOrders?.[0]?.count ?? 0,
      completedOrders: orderAgg?.completedOrders?.[0]?.count ?? 0,
      revenueToday: orderAgg?.revenueToday?.[0]?.total ?? 0,
      lowStockCount,
      totalProducts: productCounts.totalProducts,
      outOfStockCount: productCounts.outOfStockCount,
    };
  }

  async getProductSummary() {
    const products = await this.dashboardRepository.getProductSummary();
    return products.map((p: any) => ({
      _id: p._id,
      name: p.name,
      stock: p.stock,
      status: p.status,
      category: p.category?.name ?? '',
      label:
        p.stock === 0
          ? 'Out of Stock'
          : p.stock < p.minStockThreshold
            ? 'Low Stock'
            : 'OK',
    }));
  }

  async getRevenueTrend(days = 7) {
    const data = await this.dashboardRepository.getRevenueTrend(days);

    // fill missing dates with 0 so the chart has no gaps
    const map = new Map(data.map((d: any) => [d._id, d]));
    const result: { date: string; revenue: number; orders: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const entry: any = map.get(key);
      result.push({
        date: key,
        revenue: entry?.revenue ?? 0,
        orders: entry?.orders ?? 0,
      });
    }
    return result;
  }

  async getOrderStatusBreakdown() {
    const data = await this.dashboardRepository.getOrderStatusBreakdown();
    return data.map((d: any) => ({ status: d._id, count: d.count }));
  }

  async getTopSellingProducts(limit = 5, days?: number) {
    const data = await this.dashboardRepository.getTopSellingProducts(limit, days);
    return data.map((d: any) => ({
      productId: d._id,
      name: d.productName,
      quantitySold: d.totalQuantity,
      revenue: d.totalRevenue,
    }));
  }

  async getStockByCategory() {
    const data = await this.dashboardRepository.getStockByCategory();
    return data.map((d: any) => ({
      categoryId: d._id,
      categoryName: d.categoryName ?? 'Uncategorized',
      totalStock: d.totalStock,
      productCount: d.productCount,
    }));
  }

  async getRestockQueueByPriority() {
    const data = await this.dashboardRepository.getRestockQueueByPriority();
    const result: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    data.forEach((d: any) => {
      result[d._id] = d.count;
    });
    return result;
  }

  async getWeeklyComparison() {
    const data = await this.dashboardRepository.getWeeklyRevenueComparison();
    const thisWeek = data?.thisWeek?.[0] ?? { total: 0, orders: 0 };
    const lastWeek = data?.lastWeek?.[0] ?? { total: 0, orders: 0 };

    const revenueChange =
      lastWeek.total === 0
        ? thisWeek.total > 0 ? 100 : 0
        : ((thisWeek.total - lastWeek.total) / lastWeek.total) * 100;

    return {
      thisWeek: { revenue: thisWeek.total, orders: thisWeek.orders },
      lastWeek: { revenue: lastWeek.total, orders: lastWeek.orders },
      revenueChangePercent: Math.round(revenueChange * 100) / 100,
    };
  }


  async getRecentOrders(limit = 5, userId?: string) {
    const orders = await this.dashboardRepository.getRecentOrders(limit, userId);
    return orders.map((o: any) => ({
      id: o._id,
      customerName: o.customerName,
      status: o.status,
      totalPrice: o.totalPrice,
      createdAt: o.createdAt,
    }));
  }
}
