import { Product } from "../schemas/product.schema";

export class MetaDto {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class GetProductsDto {
    meta?: MetaDto;
    data: Product[];
}