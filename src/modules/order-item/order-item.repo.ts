import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseRepository } from "src/common/base/base.repository";
import { OrderItems } from "src/database/entities/OrderItem";
import { Repository } from "typeorm";

@Injectable()

export class OrderItemRepository extends BaseRepository<OrderItems>{
    constructor(@InjectRepository(OrderItems) private readonly orderItemRepo : Repository<OrderItems>){
        super(orderItemRepo);
    }
}