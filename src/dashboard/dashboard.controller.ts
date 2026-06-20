import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { UserRole } from '../auth/enums/role.enum';
import { Roles } from '../common/decorators';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.User,UserRole.Manager)
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
            data: result,
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
            data: result,
        };
    }

    /**
     * GET /dashboard/charts/revenue-trend?days=7
     * Daily revenue + order count for the last N days (default 7), gap-filled.
     */
    @Get('charts/revenue-trend')
    async getRevenueTrend(
        @Query('days', new ParseIntPipe({ optional: true })) days?: number,
    ) {
        const result = await this.dashboardService.getRevenueTrend(days ?? 7);
        return {
            success: true,
            message: 'Revenue trend fetched successfully',
            data: result,
        };
    }

    /**
     * GET /dashboard/charts/order-status
     * Count of orders grouped by status (pending, confirmed, shipped, delivered, cancelled).
     */
    @Get('charts/order-status')
    async getOrderStatusBreakdown() {
        const result = await this.dashboardService.getOrderStatusBreakdown();
        return {
            success: true,
            message: 'Order status breakdown fetched successfully',
            data: result,
        };
    }

    /**
     * GET /dashboard/charts/top-products?limit=5&days=30
     * Top selling products by quantity sold (optionally scoped to last N days).
     */
    @Get('charts/top-products')
    async getTopSellingProducts(
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
        @Query('days', new ParseIntPipe({ optional: true })) days?: number,
    ) {
        const result = await this.dashboardService.getTopSellingProducts(limit ?? 5, days);
        return {
            success: true,
            message: 'Top selling products fetched successfully',
            data: result,
        };
    }

    /**
     * GET /dashboard/charts/stock-by-category
     * Total stock and product count grouped by category.
     */
    @Get('charts/stock-by-category')
    async getStockByCategory() {
        const result = await this.dashboardService.getStockByCategory();
        return {
            success: true,
            message: 'Stock by category fetched successfully',
            data: result,
        };
    }

    /**
     * GET /dashboard/charts/restock-priority
     * Count of restock queue items grouped by priority (High / Medium / Low).
     */
    @Get('charts/restock-priority')
    async getRestockQueueByPriority() {
        const result = await this.dashboardService.getRestockQueueByPriority();
        return {
            success: true,
            message: 'Restock queue priority breakdown fetched successfully',
            data: result,
        };
    }

    /**
     * GET /dashboard/charts/weekly-comparison
     * Revenue & order count for this week vs last week, with % change.
     */
    @Get('charts/weekly-comparison')
    async getWeeklyComparison() {
        const result = await this.dashboardService.getWeeklyComparison();
        return {
            success: true,
            message: 'Weekly comparison fetched successfully',
            data: result,
        };
    }
}
