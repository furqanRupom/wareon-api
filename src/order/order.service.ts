import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { OrderRepository } from "./order.repository";
import { CreateOrderDto, GetOrdersDto, UpdateOrderItemsDto, UpdateOrderStatusDto } from "./dto";
import { ProductRepository } from "../product/product.repository";
import { Types } from "mongoose";
import { OrderDocument, OrderStatus } from "./schemas/order.schema";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { LogAction } from "../activity-log/schemas/activity-log.schema";
import { AuthRepository } from "src/auth/auth.repository";

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
};

const STATUS_TO_LOG_ACTION: Record<OrderStatus, LogAction> = {
    pending: LogAction.ORDER_CREATED,
    confirmed: LogAction.ORDER_CONFIRMED,
    shipped: LogAction.ORDER_SHIPPED,
    delivered: LogAction.ORDER_DELIVERED,
    cancelled: LogAction.ORDER_CANCELLED,
};

@Injectable()
export class OrderService {
    constructor(
        private readonly ordersRepository: OrderRepository,
        private readonly productRepository: ProductRepository,
        private readonly activityLogService: ActivityLogService,
        private readonly authRepository: AuthRepository
    ) { }

    async create(dto: CreateOrderDto, userId: string) {
        const ids = dto.items.map((i) => i.productId);

        if (new Set(ids).size !== ids.length) {
            throw new ConflictException('Duplicate product in order');
        }

        const products = await Promise.all(
            ids.map((id) => this.productRepository.findById(id)),
        );

        const inactive = products.filter((p) => p?.status === 'INACTIVE');
        if (inactive.length) {
            throw new ConflictException(
                `Unavailable: ${inactive.map((p) => p?.name).join(', ')}`,
            );
        }

        const stockErrors: string[] = [];
        for (let i = 0; i < dto.items.length; i++) {
            const product = products[i];
            if (!product) {
                stockErrors.push(`Product not found: ${dto.items[i].productId}`);
                continue;
            }

            if (dto.items[i].quantity > product.stock) {
                stockErrors.push(`Only ${product.stock} available for ${product.name}`);
            }
        }

        if (stockErrors.length) {
            throw new BadRequestException(stockErrors.join(' | '));
        }

        const orderItems = dto.items.map((item, i) => {
            const product = products[i]!;
            return {
                productId: new Types.ObjectId(item.productId),
                productName: product.name,
                quantity: item.quantity,
                unitPrice: product.price,
                subtotal: product.price * item.quantity,
            };
        });

        const totalPrice = orderItems.reduce((s, i) => s + i.subtotal, 0);

        // deduct stock
        for (const item of dto.items) {
            await this.productRepository.deductStock(item.productId, item.quantity);
        }

        const user = await this.authRepository.findOne(userId)
        if (!user) {
            throw new NotFoundException("User not found")
        }
        const order = await this.ordersRepository.create({
            customerName: dto.customerName,
            items: orderItems,
            totalPrice,
            notes: dto.notes || '',
            status: OrderStatus.PENDING,
            createdBy: new Types.ObjectId(user._id),
        });

        await this.activityLogService.log({
            action: LogAction.ORDER_CREATED,
            entity: 'order',
            entityId: order._id.toString(),
            userId:user._id as unknown as string
        });

        return order;
    }
    async findAll(filters: Record<string, any>): Promise<GetOrdersDto> {
        const query: any = {};

        // Filters
        if (filters.status) query.status = filters.status;

        if (filters.search) {
            query.customerName = { $regex: filters.search, $options: 'i' };
        }

        if (filters.date) {
            const start = new Date(filters.date);
            const end = new Date(filters.date);
            end.setDate(end.getDate() + 1);

            query.createdAt = { $gte: start, $lt: end };
        }

        const page = Number(filters.page) || 1;
        const limit = Number(filters.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await this.ordersRepository.count(query);

        const data = await this.ordersRepository.findAll(query, { skip, limit });

        const meta = {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };

        return {
            meta,
            data,
        };
    }
    async findAllByUser(userId: string, filters: Record<string, any>): Promise<GetOrdersDto> {
        const user = await this.authRepository.findOne(userId)
        if(!user){
            throw new NotFoundException('User not found!')
        }
        const query: any = {
            createdBy: new Types.ObjectId(user._id),
        };

        if (filters.status) query.status = filters.status;

        if (filters.search) {
            query.customerName = { $regex: filters.search, $options: 'i' };
        }

        if (filters.date) {
            const start = new Date(filters.date);
            const end = new Date(filters.date);
            end.setDate(end.getDate() + 1);

            query.createdAt = { $gte: start, $lt: end };
        }

        const page = Number(filters.page) || 1;
        const limit = Number(filters.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await this.ordersRepository.count(query);
        const data = await this.ordersRepository.findAll(query, { skip, limit });

        const meta = {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };

        return {
            meta,
            data,
        };
    }
    async findOne(id: string) {
        const order = await this.ordersRepository.findById(id);
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }
    async updateStatus(id: string, dto: UpdateOrderStatusDto, userId: string) {
        const order = await this.ordersRepository.findById(id);
        if (!order) throw new NotFoundException('Order not found');

        const allowed = STATUS_TRANSITIONS[order.status];

        if (!allowed.includes(dto.status)) {
            throw new BadRequestException('Invalid status transition');
        }

        order.status = dto.status;
        await this.ordersRepository.save(order);

        await this.activityLogService.log({
            action: STATUS_TO_LOG_ACTION[dto.status],
            entity: 'order',
            entityId: id,
        });

        return order;
    }
    async cancel(id: string, userId: string) {
        const order = await this.ordersRepository.findById(id);
        if (!order) throw new NotFoundException('Order not found');

        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException('Order is already cancelled');
        }
        if (order.status === OrderStatus.DELIVERED) {
            throw new BadRequestException('Cannot cancel a delivered order');
        }

        // Restore stock for each item
        for (const item of order.items) {
            await this.productRepository.restoreStock(
                item.productId.toString(),
                item.quantity,
            );
        }

        order.status = OrderStatus.CANCELLED;
        await order.save();

        await this.activityLogService.log({
            action: LogAction.ORDER_CANCELLED,
            entity: 'order',
            entityId: id,
            meta: { customerName: order.customerName },
        });

        return order;
    }
    async updateItems(
        id: string,
        dto: UpdateOrderItemsDto,
        userId: string
    ): Promise<OrderDocument> {
        const order = await this.ordersRepository.findById(id);
        if (!order) throw new NotFoundException('Order not found');

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException(
                'Only Pending orders can have their items updated',
            );
        }

        // Restore old stock first
        for (const item of order.items) {
            await this.productRepository.restoreStock(
                item.productId.toString(),
                item.quantity,
            );
        }


        // Duplicate check
        const ids = dto.items.map((i) => i.productId);
        if (new Set(ids).size !== ids.length) {
            // Re-deduct old stock before throwing
            for (const item of order.items) {
                await this.productRepository.deductStock(
                    item.productId.toString(),
                    item.quantity,
                );
            }
            throw new ConflictException('Duplicate product found in updated items');
        }

        const products = await Promise.all(
            ids.map((pid) => this.productRepository.findById(pid)),
        );

        // Inactive check
        const inactive = products.filter((p) => p?.status === 'INACTIVE');
        if (inactive.length > 0) {
            for (const item of order.items) {
                await this.productRepository.deductStock(item.productId.toString(), item.quantity);
            }
            throw new ConflictException(
                `Unavailable product(s): ${inactive.map((p) => p?.name).join(', ')}`,
            );
        }

        // Stock check
        const stockErrors: string[] = [];
        for (let i = 0; i < dto.items.length; i++) {
            if (!products[i]) {
                stockErrors.push(`Product not found: ${dto.items[i].productId}`);
                continue;
            }
            if (dto.items[i].quantity > products[i]!.stock) {
                stockErrors.push(
                    `Only ${products[i]!.stock} available for "${products[i]!.name}"`,
                );
            }
        }
        if (stockErrors.length > 0) {
            for (const item of order.items) {
                await this.productRepository.deductStock(item.productId.toString(), item.quantity);
            }
            throw new BadRequestException(stockErrors.join(' | '));
        }

        const newItems = dto.items.map((item, i) => ({
            productId: new Types.ObjectId(item.productId),
            productName: products[i]!.name,
            quantity: item.quantity,
            unitPrice: products[i]!.price,
            subtotal: products[i]!.price * item.quantity,
        }));

        // Deduct new stock
        for (let i = 0; i < dto.items.length; i++) {
            await this.productRepository.deductStock(dto.items[i].productId, dto.items[i].quantity);
        }

        order.items = newItems as any;
        order.totalPrice = newItems.reduce((s, i) => s + i.subtotal, 0);
        // if (dto.items?.customerName) order.customerName = dto.customerName;
        // if (dto.notes !== undefined) order.notes = dto.notes;

        await order.save();

        await this.activityLogService.log({
            action: LogAction.ORDER_ITEMS_UPDATED,
            entity: 'order',
            entityId: id,
            meta: { customerName: order.customerName },
        });

        return order;
    }


    async revenueToday(): Promise<number> {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const result = await this.ordersRepository.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    status: { $ne: OrderStatus.CANCELLED },
                },
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);

        return result[0]?.total ?? 0;
    }

}