import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './Users';
import { Events } from './Events';
import { BaseEntity } from '../../common/base/base.entity';

@Entity('orders')
export class Orders extends BaseEntity {

  @Column()
  user_id: number;

  @Column()
  event_id: number;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 255, nullable: true })
  province: string;

  @Column({ length: 255, nullable: true })
  district: string;

  @Column({ length: 255, nullable: true })
  ward: string;

  @Column({ length: 255, nullable: true })
  street: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 255, nullable: true })
  note: string;

  @ManyToOne(() => Users, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => Events, (event) => event.orders)
  @JoinColumn({ name: 'event_id' })
  event: Events;
}
