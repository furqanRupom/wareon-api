import { Body, Controller, Get, Post, Req, UseGuards, Query, Param, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateOrderDto, UpdateOrderItemsDto, UpdateOrderStatusDto, } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../auth/enums/role.enum';
import type { AuthRequest } from '../auth/types/auth-request.types';
import { OrderService } from './order.service';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Roles(UserRole.User)
    @Post()
    async create(@Body() dto: CreateOrderDto, @Req() req: AuthRequest) {
        const result = await  this.orderService.create(dto, req.user.id);
        return {
            success: true,
            message: 'Order created successfully',
            data: result
        }
    }

    @Roles(UserRole.User,UserRole.Manager)
    @Get()
    async findAll(
        @Query() query:Record<string,unknown>
    ) {
        const result = await this.orderService.findAll(query);
        return {
            success: true,
            message: 'Orders fetched successfully',
            meta:result.meta,
            data: result.data
        }
    }


    @Roles(UserRole.User)
    @Get('user')
    async findAllByUser(
        @Req() req: AuthRequest,
        @Query() query: Record<string, unknown>
    ) {
        const result = await this.orderService.findAllByUser(req.user.id, query);
        return {
            success: true,
            message: 'Orders fetched successfully',
            meta:result.meta,
            data: result.data
        }
    }



    @Roles(UserRole.User,UserRole.Manager,UserRole.Admin)
    @Get('today')
    async findToday() {
        const result = await this.orderService.revenueToday();
        return {
            success: true,
            message: 'Today\'s revenue fetched successfully',
            data: result
        }
    }


    @Roles(UserRole.User,UserRole.Manager,UserRole.Admin)
    @Get('revenue/today')
    async revenueToday() {
        const result = await this.orderService.revenueToday();
        return {
            success: true,
            message: 'Today\'s revenue fetched successfully',
            data: result
        }
    }


    @Roles(UserRole.User, UserRole.Manager, UserRole.Admin)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        const result = await this.orderService.findOne(id);
        return {
            success: true,
            message: 'Order fetched successfully',
            data: result
        }
    }



    @Roles(UserRole.User, UserRole.Manager, UserRole.Admin)
    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateOrderStatusDto,
        @Req() req: AuthRequest
    ) {
        const result = await this.orderService.updateStatus(id, dto, req.user.id);
        return {
            success: true,
            message: 'Order status updated successfully',
            data: result
        }
    }



    @Roles(UserRole.User, UserRole.Manager, UserRole.Admin)
    @Patch(':id/cancel')
    @HttpCode(HttpStatus.OK)
    async cancel(@Param('id') id: string, @Req() req: AuthRequest) {
        const result = await this.orderService.cancel(id,req.user.id);
        return {
            success: true,
            message: 'Order cancelled successfully',
            data: result
        }
    }



    @Roles(UserRole.User, UserRole.Manager, UserRole.Admin)
    @Patch(':id/items')
    async updateItems(
        @Param('id') id: string,
        @Body() dto: UpdateOrderItemsDto,
        @Req() req: AuthRequest
    ) {
        const result = await this.orderService.updateItems(id, dto,req.user.id);
        return {
            success: true,
            message: 'Order items updated successfully',
            data: result
        }
    }
}
