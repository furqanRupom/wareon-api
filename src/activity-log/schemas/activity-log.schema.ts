import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityLogDocument = ActivityLog & Document & {createdAt:Date,updatedAt:Date};

export enum LogAction {
    // Auth
    USER_SIGNUP = 'USER_SIGNUP',
    USER_LOGIN = 'USER_LOGIN',
    // Orders
    ORDER_CREATED = 'ORDER_CREATED',
    ORDER_CONFIRMED = 'ORDER_CONFIRMED',
    ORDER_SHIPPED = 'ORDER_SHIPPED',
    ORDER_DELIVERED = 'ORDER_DELIVERED',
    ORDER_CANCELLED = 'ORDER_CANCELLED',
    ORDER_ITEMS_UPDATED = 'ORDER_ITEMS_UPDATED',
    // Products
    PRODUCT_CREATED = 'PRODUCT_CREATED',
    PRODUCT_UPDATED = 'PRODUCT_UPDATED',
    PRODUCT_RESTOCKED = 'PRODUCT_RESTOCKED',
    PRODUCT_DEACTIVATED = 'PRODUCT_DEACTIVATED',
    // Stock / Restock
    STOCK_DEDUCTED = 'STOCK_DEDUCTED',
    STOCK_RESTORED = 'STOCK_RESTORED',
    RESTOCK_QUEUE_ADDED = 'RESTOCK_QUEUE_ADDED',
    RESTOCK_QUEUE_REMOVED = 'RESTOCK_QUEUE_REMOVED',
    // Categories
    CATEGORY_CREATED = 'CATEGORY_CREATED',
    CATEGORY_UPDATED = 'CATEGORY_UPDATED',
    CATEGORY_DELETED = 'CATEGORY_DELETED',
}

@Schema({ timestamps: true })
export class ActivityLog {
    @Prop({ required: true, enum: LogAction })
    action: LogAction;

    @Prop({ required: true }) // 'order' | 'product' | 'category' | 'user'
    entity: string;

    @Prop({ required: true })
    entityId: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Object, default: {} })
    meta: Record<string, any>;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ entity: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });