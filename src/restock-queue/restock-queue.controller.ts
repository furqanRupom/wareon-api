import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import { RestockQueueService } from './restock-queue.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { UserRole } from '../auth/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorators';
import  type { AuthRequest } from '../auth/types/auth-request.types';


@Controller('restock-queue')
@UseGuards(JwtAuthGuard)
export class RestockQueueController {
    constructor(private readonly restockQueueService: RestockQueueService) { }


    @Roles(UserRole.User, UserRole.Manager, UserRole.Admin)
    @Get()
    findAll() {
        const result = this.restockQueueService.findAll();
        return {
            success: true,
            message: 'Restock queue fetched successfully',
            data: result
        }
    }

    @Roles(UserRole.User, UserRole.Manager, UserRole.Admin)
    @Get('count')
    count() {
        const result = this.restockQueueService.count();
        return {
            success: true,
            message: 'Restock queue count fetched successfully',
            data: result
        }
    }

    @Roles(UserRole.User, UserRole.Manager, UserRole.Admin)
    @HttpCode(HttpStatus.CREATED)
    @Post(':productId')
    manualAdd(
        @Param('productId') productId: string,
        @Req() req: AuthRequest
    ) {
        const result =  this.restockQueueService.manualAdd(productId, req.user.id);
        return {
            success: true,
            message: 'Product added to restock queue successfully',
            data: result
        }
    }

 
    @Delete(':productId')
    @HttpCode(HttpStatus.OK)
    manualRemove(
        @Param('productId') productId: string,
        @Req() req: AuthRequest
    ) {
        const result =  this.restockQueueService.manualRemove(productId, req.user.id);
        return {
            success: true,
            message: 'Product removed from restock queue successfully',
            data: result
        }
    }
}