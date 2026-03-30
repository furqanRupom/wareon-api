import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ActivityLogRepository } from './activity-log.repository';
import { LogAction } from './schemas/activity-log.schema';
import { CreateActivityLogDto } from './dto';



@Injectable()
export class ActivityLogService {
    constructor(
        private readonly activityLogRepository: ActivityLogRepository,
    ) { }

    async log(dto: CreateActivityLogDto): Promise<void> {
        await this.activityLogRepository.create({
            action: dto.action,
            entity: dto.entity,
            entityId: dto.entityId,
            userId: new Types.ObjectId(dto.userId),
            meta: dto.meta ?? {},
        });
    }

    async findAll(filters: { limit?: number; entity?: string }) {
        const query: any = {};

        if (filters.entity) {
            query.entity = filters.entity;
        }

        const limit = Math.min(filters.limit ?? 10, 50);

        return this.activityLogRepository.findAll(query, limit);
    }

    async findAllFormatted(filters: { limit?: number; entity?: string }) {
        const logs = await this.findAll(filters);

        return logs.map((log) => {
            const user = (log.userId as any)?.name ?? 'System';

            const time = new Date(log.createdAt as any).toLocaleTimeString(
                'en-US',
                { hour: '2-digit', minute: '2-digit' },
            );

            const summary = this.buildSummary(
                log.action as LogAction,
                log.meta,
                log.entityId,
            );

            return {
                _id: log._id,
                time,
                summary,
                action: log.action,
                entity: log.entity,
                entityId: log.entityId,
                user,
                meta: log.meta,
                createdAt: log.createdAt,
            };
        });
    }

    private buildSummary(
        action: LogAction,
        meta: Record<string, any>,
        entityId: string,
    ): string {
        const shortId = entityId.slice(-6).toUpperCase();

        switch (action) {
            case LogAction.ORDER_CREATED:
                return `Order #${shortId} created for ${meta.customerName} — $${meta.totalPrice?.toFixed(2)}`;
            case LogAction.ORDER_CONFIRMED:
                return `Order #${shortId} confirmed`;
            case LogAction.ORDER_SHIPPED:
                return `Order #${shortId} marked as Shipped`;
            case LogAction.ORDER_DELIVERED:
                return `Order #${shortId} marked as Delivered`;
            case LogAction.ORDER_CANCELLED:
                return `Order #${shortId} cancelled — stock restored`;
            case LogAction.ORDER_ITEMS_UPDATED:
                return `Order #${shortId} items updated`;
            case LogAction.PRODUCT_CREATED:
                return `Product "${meta.name}" added`;
            case LogAction.PRODUCT_RESTOCKED:
                return `Stock updated for "${meta.name}" (+${meta.quantity} units)`;
            case LogAction.PRODUCT_DEACTIVATED:
                return `Product "${meta.name}" deactivated`;
            case LogAction.RESTOCK_QUEUE_ADDED:
                return `"${meta.name}" added to Restock Queue`;
            case LogAction.RESTOCK_QUEUE_REMOVED:
                return `"${meta.name}" removed from Restock Queue`;
            case LogAction.CATEGORY_CREATED:
                return `Category "${meta.name}" created`;
            case LogAction.CATEGORY_DELETED:
                return `Category "${meta.name}" deleted`;
            default:
                return `${action.replace(/_/g, ' ').toLowerCase()} — #${shortId}`;
        }
    }
}