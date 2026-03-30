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

        const [orderAgg, lowStockCount, productCounts] =
            await Promise.all([
                this.dashboardRepository.getOrderStats(start, end),
                this.dashboardRepository.getLowStockCount(),
                this.dashboardRepository.getProductCounts(),
            ]);

        return {
            ordersToday: orderAgg?.ordersToday?.[0]?.count ?? 0,
            pendingOrders: orderAgg?.pendingOrders?.[0]?.count ?? 0,
            completedOrders:
                orderAgg?.completedOrders?.[0]?.count ?? 0,
            revenueToday: orderAgg?.revenueToday?.[0]?.total ?? 0,
            lowStockCount,
            totalProducts: productCounts.totalProducts,
            outOfStockCount: productCounts.outOfStockCount,
        };
    }

    async getProductSummary() {
        const products =
            await this.dashboardRepository.getProductSummary();

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
}
