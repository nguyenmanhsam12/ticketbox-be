import { BaseEntity } from "src/common/base/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Orders } from "./Orders";
import { Tickets } from "./Tickets";
import { Shows } from "./Shows";


@Entity('order_items')

export class OrderItems extends BaseEntity {
    @Column()
    order_id : number;
    
    @Column()
    ticket_id : number;

    @Column()
    show_id : number;

    @Column({ type: 'varchar', length: 100 })
    ticket_name: string;       

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;              

    @Column({ type: 'int', default: 1 })
    quantity: number;           

    @ManyToOne(() => Orders, (order) => order.order_items)
    @JoinColumn({ name: 'order_id' })
    order: Orders;

    @OneToOne(() => Tickets, (ticket) => ticket.orderItem)
    @JoinColumn({ name : 'ticket_id' })
    ticket : Tickets

    @ManyToOne(() => Shows, (show) => show.order_item)
    @JoinColumn({ name : 'show_id' })
    show : Shows;
}