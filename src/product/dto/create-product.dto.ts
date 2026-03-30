import {
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../schemas/product.schema';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsMongoId()
    category: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    stock?: number;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    minStockThreshold?: number;

    @IsOptional()
    @IsString()
    productUrl?: string[];

    @IsEnum(ProductStatus)
    @IsOptional()
    status?: ProductStatus;

    @IsOptional()
    @IsString()
    sku?: string;
}