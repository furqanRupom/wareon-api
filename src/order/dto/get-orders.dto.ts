import { MetaDto } from "../../common/dto/meta.dto";
import { Order } from "../schemas/order.schema";

export class GetOrdersDto {
    meta:MetaDto
    data:Order[]
}