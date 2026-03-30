import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ProductStatus {
    ACTIVE = 'ACTIVE',
    OUT_OF_STOCK = 'OUT_OF_STOCK',
}

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    category: Types.ObjectId;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true, default: 0 })
    stock: number;

    @Prop({ required: true, default: 5 })
    minStockThreshold: number;

    @Prop({ required: false })
    productUrl: string;
    @Prop({
        enum: ProductStatus,
        default: ProductStatus.ACTIVE,
    })
    status: ProductStatus;
}

export const ProductSchema = SchemaFactory.createForClass(Product);