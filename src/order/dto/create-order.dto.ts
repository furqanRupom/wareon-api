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
    MaxLength,
    Matches,
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

    @IsString()
    @IsNotEmpty()
    @MaxLength(300)
    address: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[0-9+\-\s()]{7,20}$/, { message: 'Invalid phone number format' })
    phone: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9+\-\s()]{7,20}$/, { message: 'Invalid alternate phone format' })
    alternatePhone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    landmark?: string;
}
