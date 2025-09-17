import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Users } from './Users';
import { Events } from './Events';
import { BaseEntity } from '../../common/base/base.entity';
import { PaymentMethod } from './PaymentMethod';
import { PaymentStatus } from './PaymentStatus';
import { OrderItems } from './OrderItem';
import { Shows } from './Shows';

@Entity('orders')
export class Orders extends BaseEntity {

  @Column()
  user_id: number;

  @Column()
  event_id: number;

  @Column()
  show_id: number;

  @Column({ nullable : true })
  payment_method_id : number;

  @Column()
  payment_status_id: number;

  @Column({ type : 'varchar' })
  orderCode : string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'int' })
  total_quantity: number;

  @Column({ type: 'varchar', length: 100, nullable : true })
  booking_code: string;

  @Column({ type : 'varchar', length : 50, nullable : true })
  paymentMethod : string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  
  @ManyToOne(() => Users, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => Events, (event) => event.orders)
  @JoinColumn({ name: 'event_id' })
  event: Events;

  @ManyToOne(() => PaymentMethod, (payment_method) => payment_method.orders)
  @JoinColumn({ name : 'payment_method_id' })
  payment_method : PaymentMethod;

  @ManyToOne(() => PaymentStatus, (payment_status) => payment_status.orders)
  @JoinColumn({ name : 'payment_status_id' })
  payment_status : PaymentStatus;

  @OneToMany(() => OrderItems, (order_item) => order_item.order)
  order_items: OrderItems[];

  @ManyToOne(() => Shows, (show) => show.orders )
  @JoinColumn({ name : 'show_id' })
  show : Shows;
}
