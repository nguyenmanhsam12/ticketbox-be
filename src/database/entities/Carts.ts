import { BaseEntity } from '../../common/base/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  RelationId,
} from 'typeorm';
import { Users } from './Users';
import { Events } from './Events';
import { CartItems } from './CartItems';
import { Shows } from './Shows';
import { CartStep } from 'src/common/enums/cartStep.enum';

@Entity('carts')
export class Carts extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: true })
  order_code: string | null;

  @Column({ type: 'varchar', length: 100 })
  booking_code: string;

  @Column({ type: 'datetime' })
  expired_at: Date;

  @Column({ type: 'int' })
  total_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({
    type: 'enum',
    enum: CartStep,
    default: CartStep.BOOK_NOW,
  })
  step: CartStep;

  @ManyToOne(() => Users, (user) => user.carts)
  @JoinColumn({ name: 'user_id' })
  user: Users;
  @RelationId((cart: Carts) => cart.user)
  user_id: number;

  @ManyToOne(() => Events, (event) => event.carts)
  @JoinColumn({ name: 'event_id' })
  event: Events;
  @RelationId((cart: Carts) => cart.event)
  event_id: number;

  @ManyToOne(() => Shows, (show) => show.carts)
  @JoinColumn({ name: 'show_id' })
  show: Shows;
  @RelationId((cart: Carts) => cart.show)
  show_id: number;

  @OneToMany(() => CartItems, (cartItem) => cartItem.cart)
  cart_items: CartItems[];
}
