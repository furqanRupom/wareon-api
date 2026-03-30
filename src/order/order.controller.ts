import { Body, Controller, Get, Post, Req, UseGuards, Query, Param, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateOrderDto, UpdateOrderItemsDto, UpdateOrderStatusDto, } from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
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
    create(@Body() dto: CreateOrderDto, @Req() req: AuthRequest) {
        const result = this.orderService.create(dto, req.user.id);
        return {
            success: true,
            message: 'Order created successfully',
            data: result
        }
    }

    @Roles(UserRole.User)
    @Get()
    findAll(
        @Query('status') status?: string,
        @Query('date') date?: string,
        @Query('search') search?: string,
    ) {
        const result = this.orderService.findAll({ status, date, search });
        return {
            success: true,
            message: 'Orders fetched successfully',
            data: result
        }
    }


    @Roles(UserRole.User)
    @Get('user')
    findAllByUser(
        @Req() req: AuthRequest,
        @Query('status') status?: string,
        @Query('date') date?: string,
        @Query('search') search?: string,
    ) {
        const result = this.orderService.findAllByUser(req.user.id, { status, date, search });
        return {
            success: true,
            message: 'Orders fetched successfully',
            data: result
        }
    }



    @Roles(UserRole.User,UserRole.Manager,UserRole.Admin)
    @Get('today')
    findToday() {
        const result =  this.orderService.revenueToday();
        return {
            success: true,
            message: 'Today\'s revenue fetched successfully',
            data: result
        }
    }


    @Roles(UserRole.User,UserRole.Manager,UserRole.Admin)
    @Get('revenue/today')
    revenueToday() {
        const result = this.orderService.revenueToday();
        return {
            success: true,
            message: 'Today\'s revenue fetched successfully',
            data: result
        }
    }


    @Roles(UserRole.User, UserRole.Manager, UserRole.Admin)
    @Get(':id')
    findOne(@Param('id') id: string) {
        const result = this.orderService.findOne(id);
        return {
            success: true,
            message: 'Order fetched successfully',
            data: result
        }
    }



    @Roles(UserRole.User, UserRole.Manager, UserRole.Admin)
    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateOrderStatusDto,
        @Req() req: AuthRequest
    ) {
        const result = this.orderService.updateStatus(id, dto, req.user.id);
        return {
            success: true,
            message: 'Order status updated successfully',
            data: result
        }
    }



    @Roles(UserRole.User, UserRole.Manager, UserRole.Admin)
    @Patch(':id/cancel')
    @HttpCode(HttpStatus.OK)
    cancel(@Param('id') id: string, @Req() req: AuthRequest) {
        const result = this.orderService.cancel(id,req.user.id);
        return {
            success: true,
            message: 'Order cancelled successfully',
            data: result
        }
    }



    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.User, UserRole.Manager, UserRole.Admin)
    @Patch(':id/items')
    updateItems(
        @Param('id') id: string,
        @Body() dto: UpdateOrderItemsDto,
        @Req() req: AuthRequest
    ) {
        const result = this.orderService.updateItems(id, dto,req.user.id);
        return {
            success: true,
            message: 'Order items updated successfully',
            data: result
        }
    }
}
