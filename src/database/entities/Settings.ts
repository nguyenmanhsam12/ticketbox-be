import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Events } from './Events';
import { SETTING_TYPE } from '../../common/enums/setting.enum';
import { BaseEntity } from '../../common/base/base.entity';

@Entity('settings')
export class Settings extends BaseEntity {

  @Column()
  event_id: number;

  @Column({
    type: 'enum',
    enum: SETTING_TYPE,
    default: SETTING_TYPE.PUBLIC,
  })
  type: SETTING_TYPE;

  @Column({ length: 255, nullable: true })
  link: string;

  @ManyToOne(() => Events, (event) => event.settings)
  @JoinColumn({ name: 'event_id' })
  event: Events;
}
