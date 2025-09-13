import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Orders } from './Orders';
import { Payments } from './Payments';
import { EventMemberships } from './EventMemberships';
import { Events } from './Events';
import { USER_GENDER } from '../../common/enums/user.enum';
import { Exclude } from 'class-transformer';
import { Roles } from './Roles';
import { BaseEntity } from '../../common/base/base.entity';
import { Carts } from './Carts';

@Entity('users')
export class Users extends BaseEntity {

  @Column({ length: 255, nullable: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ length: 50, unique: true, nullable: true })
  slug: string;

  @Column({ nullable: true })
  role_id: number;

  @Column({ length: 255 })
  @Exclude()
  password: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: USER_GENDER,
    nullable: true,
  })
  gender: USER_GENDER;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @OneToMany(() => Roles, (role) => role.id)
  role: Roles;

  @OneToMany(() => Orders, (order) => order.user)
  orders: Orders[];

  @OneToMany(() => Payments, (payment) => payment.user)
  payments: Payments[];

  @OneToMany(() => EventMemberships, (membership) => membership.user)
  eventMemberships: EventMemberships[];

  @OneToMany(() => Events, (event) => event.created_by)
  createdEvents: Events[];

  @OneToMany(() => Carts, (cart) => cart.user)
  carts: Carts[];
}
