import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity({ name: 'payment_methods' })
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // Tên hiển thị: 'VNPAY', 'ZaloPay'

  @Column({ nullable: true })
  logoUrl: string; // URL logo (nếu có)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}