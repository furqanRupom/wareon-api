import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestockQueueDocument = RestockQueue & Document;

export enum RestockPriority {
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
}

@Schema({ timestamps: true })
export class RestockQueue {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true, unique: true })
    product: Types.ObjectId; 

    @Prop({
        type: String,
        enum: RestockPriority,
        default: RestockPriority.LOW,
    })
    priority: RestockPriority;

    @Prop({ required: true, min: 0 })
    stockAtTimeOfAdding: number; 

    @Prop({ required: true, min: 0 })
    threshold: number; 
}

export const RestockQueueSchema = SchemaFactory.createForClass(RestockQueue);
RestockQueueSchema.index({
    priority: 1,
    stockAtTimeOfAdding: 1,
});