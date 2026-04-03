import { MetaDto } from "../../common/dto/meta.dto";
import { Category } from "../schemas/category.schema";

export class GetCategoryDto {
    meta: MetaDto
    data: Category[]
}