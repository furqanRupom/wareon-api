import { MetaDto } from "src/common/dto/meta.dto";
import { Product } from "../schemas/product.schema";
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsIn,  Min } from 'class-validator';


export class GetProductsDto {
    meta?: MetaDto;
    data: Product[];
}



export const PRODUCT_SORT_OPTIONS = [
    'newest',
    'oldest',
    'price-asc',
    'price-desc',
    'name-asc',
    'name-desc',
    'stock-asc',
    'stock-desc',
] as const;

export type ProductSort = typeof PRODUCT_SORT_OPTIONS[number];

export class GetProductsQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 12;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxPrice?: number;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    inStock?: string;

    @IsOptional()
    @IsIn(PRODUCT_SORT_OPTIONS)
    sort?: ProductSort;
}
