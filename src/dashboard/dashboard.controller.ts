import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    /**
     * GET /dashboard/stats
     * Returns all key metrics in a single response:
     * ordersToday, pendingOrders, completedOrders, revenueToday,
     * lowStockCount, totalProducts, outOfStockCount
     */
    @Get('stats')
    async getStats() {
        const result = await this.dashboardService.getStats();
        return {
            success: true,
            message: 'Dashboard stats fetched successfully',
            data: result
        };

    }

    /**
     * GET /dashboard/product-summary
     * Top 20 products sorted by lowest stock first.
     * Each item includes: name, stock, status, category, label (OK / Low Stock / Out of Stock)
     */
    @Get('product-summary')
    async getProductSummary() {
        const result = await this.dashboardService.getProductSummary();
        return {
            success: true,
            message: 'Product summary fetched successfully',
            data: result
        };
    }
}
