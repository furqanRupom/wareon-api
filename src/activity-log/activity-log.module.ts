import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from './activity-log.service';
import { ActivityLog, ActivityLogSchema } from './schemas/activity-log.schema';
import { ActivityLogRepository } from './activity-log.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivityLog.name, schema: ActivityLogSchema },
    ]),
  ],
  controllers: [ActivityLogController],
  providers: [ActivityLogService,ActivityLogRepository],
  exports: [ActivityLogService], 
})
export class ActivityLogModule { }
