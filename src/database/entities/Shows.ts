import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Events } from './Events';
import { Tickets } from './Tickets';
import { BaseEntity } from '../../common/base/base.entity';
import { Carts } from './Carts';
import { Orders } from './Orders';

@Entity('shows')
export class Shows extends BaseEntity {
  @Column()
  event_id: number;

  @Column({ type: 'timestamp' })
  time_start: Date;

  @Column({ type: 'timestamp', nullable: true })
  time_end: Date;

  @ManyToOne(() => Events, (event) => event.shows)
  @JoinColumn({ name: 'event_id' })
  event: Events;

  @OneToMany(() => Tickets, (ticket) => ticket.show)
  tickets: Tickets[];

  @OneToMany(() => Carts, (cart) => cart.show)
  carts: Carts[];

  @OneToMany(() => Orders, (order) => order.show)
  orders: Orders[];

}
