import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Categories } from './Categories';
import { Users } from './Users';
import { Shows } from './Shows';
import { Settings } from './Settings';
import { PaymentEvent } from './PaymentEvent';
import { Orders } from './Orders';
import { Payments } from './Payments';
import { EventMemberships } from './EventMemberships';
import { ApprovalStatus } from '../../common/enums/event.enum';
import { BaseEntity } from '../../common/base/base.entity';
import { Carts } from './Carts';

@Entity('events')
export class Events extends BaseEntity {

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 250, nullable: true })
  thumbnail: string;

  @Column({ length: 250, nullable: true })
  banner: string;

  @Column({ length: 50, unique: true })
  slug: string;

  @Column({ type: 'enum', enum: ['offline', 'online'] })
  type: 'offline' | 'online';

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.DRAFT,
  })
  status: ApprovalStatus;
  @Column({ length: 255, nullable: true })
  name_address: string;

  @Column({ length: 255, nullable: true })
  province: string;

  @Column({ length: 255, nullable: true })
  district: string;

  @Column({ length: 255, nullable: true })
  ward: string;

  @Column({ length: 255, nullable: true })
  street: string;

  @Column()
  category_id: number;

  @Column()
  created_by: number;

  @Column({ length: 255, nullable: true })
  org_name: string;

  @Column({ length: 255, nullable: true })
  org_description: string;

  @Column({ length: 255, nullable: true })
  org_thumbnail: string;

  @Column({ type: 'boolean', default: false })
  is_special: boolean;

  @Column({ type: 'boolean', default: false })
  is_trending: boolean;

  @Column({ length: 250, nullable: true })
  videoUrl: string;

  @ManyToOne(() => Categories, (category) => category.events)
  @JoinColumn({ name: 'category_id' })
  category: Categories;

  @ManyToOne(() => Users, (user) => user.createdEvents)
  @JoinColumn({ name: 'created_by' })
  createdBy: Users;

  @OneToMany(() => Shows, (show) => show.event)
  shows: Shows[];

  @OneToMany(() => Settings, (setting) => setting.event)
  settings: Settings[];

  @OneToMany(() => PaymentEvent, (pe) => pe.event)
  paymentEvents: PaymentEvent[];

  @OneToMany(() => Orders, (order) => order.event)
  orders: Orders[];

  @OneToMany(() => Payments, (payment) => payment.event)
  payments: Payments[];

  @OneToMany(() => EventMemberships, (membership) => membership.event)
  eventMemberships: EventMemberships[];

  @OneToMany(() => Carts, (cart) => cart.event)
  carts: Carts[];
}
