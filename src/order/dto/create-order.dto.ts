import {
    IsString,
    IsNotEmpty,
    IsArray,
    ValidateNested,
    ArrayMinSize,
    IsMongoId,
    IsNumber,
    IsPositive,
    IsOptional,
    IsEnum,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
    @IsMongoId()
    productId: string;

    @IsNumber()
    @IsPositive()
    quantity: number;
}

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    customerName: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}

