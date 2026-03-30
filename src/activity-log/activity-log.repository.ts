import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    ActivityLog,
    ActivityLogDocument,
} from './schemas/activity-log.schema';
import { Model } from 'mongoose';

@Injectable()
export class ActivityLogRepository {
    constructor(
        @InjectModel(ActivityLog.name)
        private activityModel: Model<ActivityLogDocument>,
    ) { }

    async create(data: Partial<ActivityLog>) {
        return await this.activityModel.create(data);
    }

    async findAll(query: Record<string, unknown>, limit: number) {
        return await this.activityModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('userId', 'name email')
            .lean();
    }
}