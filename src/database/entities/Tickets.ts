import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Shows } from './Shows';
import { BaseEntity } from '../../common/base/base.entity';
import { CartItems } from './CartItems';
import { OrderItems } from './OrderItem';

@Entity('tickets')
export class Tickets extends BaseEntity {

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column()
  total_ticket: number;

  @Column({ type: 'int', nullable: true })
  remaining_ticket: number | null;

  @Column({ default: 1 })
  min_ticket: number;

  @Column({ default: 10 })
  max_ticket: number;

  @Column()
  show_id: number;

  @Column({ length: 250, nullable: true })
  description: string;

  @Column({ length: 250, nullable: true })
  thumbnail: string;

  @Column({ length: 50, nullable: true })
  slug: string;

  @Column({ type: 'datetime', nullable: true })
  start_time: Date;

  @Column({ type: 'datetime', nullable: true })
  end_time: Date;

  @Column({ type: 'bool', nullable: true })
  is_free: boolean;

  @ManyToOne(() => Shows, (show) => show.tickets)
  @JoinColumn({ name: 'show_id' })
  show: Shows;

  @OneToMany(() => CartItems, (cartItem) => cartItem.ticket)
  cart_items: CartItems[];

  @OneToOne(() => OrderItems, (orderItem) => orderItem.ticket)
  orderItem : OrderItems;
}
