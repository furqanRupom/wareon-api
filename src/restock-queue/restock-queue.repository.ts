import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    RestockQueue,
    RestockQueueDocument,
} from './schemas/restock-queue.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class RestockQueueRepository {
    constructor(
        @InjectModel(RestockQueue.name)
        private queueModel: Model<RestockQueueDocument>,
    ) { }

    upsert(productId: string, data: Partial<RestockQueue>) {
        return this.queueModel.findOneAndUpdate(
            { product: new Types.ObjectId(productId) },
            { $set: data },
            { upsert: true, new: true },
        );
    }

    deleteByProduct(productId: string) {
        return this.queueModel.findOneAndDelete({
            product: new Types.ObjectId(productId),
        });
    }

    findAll() {
        return this.queueModel
            .find()
            .populate('product', 'name stock price category status sku')
            .sort({ stockAtTimeOfAdding: 1 })
            .lean();
    }

    count() {
        return this.queueModel.countDocuments();
    }

    findOneWithProduct(productId: string) {
        return this.queueModel
            .findOne({ product: new Types.ObjectId(productId) })
            .populate('product', 'name stock minStockThreshold');
    }

    findOne(productId: string) {
        return this.queueModel.findOne({
            product: new Types.ObjectId(productId),
        });
    }

    deleteDocument(doc: RestockQueueDocument) {
        return doc.deleteOne();
    }
}
