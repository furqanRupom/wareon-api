import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export enum PaymentMethod {
    COD = 'COD',
}
@Schema({ _id: false })
export class OrderItem {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ required: true })
    productName: string;

    @Prop({ required: true, min: 1 })
    quantity: number;

    @Prop({ required: true, min: 0 })
    unitPrice: number; 

    @Prop({ required: true, min: 0 })
    subtotal: number; 
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
    @Prop({ required: true, trim: true, maxlength: 120 })
    customerName: string;

    @Prop({ type: [OrderItemSchema], required: true, minlength: 1 })
    items: OrderItem[];

    @Prop({ required: true, min: 0 })
    totalPrice: number; 

    @Prop({
        type: String,
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ trim: true, maxlength: 500, default: '' })
    notes: string;

    
    @Prop({ required: true, trim: true, maxlength: 300 })
    address: string;

    @Prop({ required: true, trim: true, maxlength: 20 })
    phone: string;

    @Prop({ trim: true, maxlength: 20 })
    alternatePhone?: string;

    @Prop({ trim: true, maxlength: 100 })
    city?: string;

    @Prop({ trim: true, maxlength: 150 })
    landmark?: string;

    @Prop({
        type: String,
        enum: PaymentMethod,
        default: PaymentMethod.COD,
    })
    paymentMethod: PaymentMethod;

    @Prop({ required: true, min: 0, default: 0 })
    deliveryFee: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdBy: 1, status: 1 });
OrderSchema.index({ customerName: 'text' });
