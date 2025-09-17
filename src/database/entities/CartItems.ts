import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Carts } from './Carts';
import { Tickets } from './Tickets';

@Entity('cart_items')
export class CartItems extends BaseEntity {
  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'bool', nullable: true })
  is_free: boolean | null;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @ManyToOne(() => Carts, (cart) => cart.cart_items)
  @JoinColumn({ name: 'cart_id' })
  cart: Carts;

  @ManyToOne(() => Tickets, (ticket) => ticket.cart_items)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Tickets;
}
