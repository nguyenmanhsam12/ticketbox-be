import {
  IsString,
  IsOptional,
  MaxLength,
  IsIn,
  IsEnum,
  IsDateString,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApprovalStatus } from '../../../common/enums/event.enum';

export class CreateEventDto {
  @MaxLength(120)
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(250)
  thumbnail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(250)
  banner?: string;

  @IsIn(['offline', 'online'])
  @IsOptional()
  type?: 'offline' | 'online';

  @IsEnum(ApprovalStatus)
  @IsOptional()
  status?: ApprovalStatus;

  @IsOptional()
  @IsDateString()
  start_time?: Date;

  @IsOptional()
  @IsDateString()
  end_time?: Date;

  @IsString()
  @MaxLength(255)
  name_address: string;

  @IsString()
  @MaxLength(255)
  province: string;

  @IsString()
  @MaxLength(255)
  district: string;

  @IsString()
  @MaxLength(255)
  ward: string;

  @IsString()
  @MaxLength(255)
  street: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  category_id?: number;

  @IsString()
  @MaxLength(255)
  org_name: string;

  @IsString()
  @MaxLength(255)
  org_description: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  org_thumbnail: string;
}
