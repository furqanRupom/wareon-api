import { MetaDto } from "src/common/dto/meta.dto";
import { Product } from "../schemas/product.schema";



export class GetProductsDto {
    meta?: MetaDto;
    data: Product[];
}