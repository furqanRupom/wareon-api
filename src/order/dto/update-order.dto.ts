import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { OrderStatus } from "../schemas/order.schema";
import { OrderItemDto } from "./create-order.dto";
import { Type } from 'class-transformer';

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;
}

export class UpdateOrderItemsDto {
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}

export class UpdateOrderDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    customerName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}