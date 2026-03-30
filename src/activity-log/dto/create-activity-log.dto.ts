import {
    IsEnum,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LogAction } from '../schemas/activity-log.schema';

export class CreateActivityLogDto {
    @IsEnum(LogAction, { message: 'Invalid action type' })
    action: LogAction;

    @IsString()
    @IsNotEmpty()
    entity: string; 

    @IsString()
    @IsNotEmpty()
    entityId: string;

    @IsMongoId({ message: 'Invalid userId format' })
    userId: string;

    @IsOptional()
    @IsObject()
    @Type(() => Object)
    meta?: Record<string, any>;
}