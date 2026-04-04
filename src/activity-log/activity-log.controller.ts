import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
    constructor(private readonly activityLogService: ActivityLogService) { }

    @Get()
   async findAll(
        @Query('limit') limit?: number,
        @Query('entity') entity?: string,
    ) {
        const result = await this.activityLogService.findAllFormatted({ limit, entity });
        return {
            success: true,
            message: 'Activity logs fetched successfully',
            data: result,
        };
    }
}