import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryColumn()
  id: string; // ej. pay_001

  @Column()
  appointmentId: string; // ej. app_001

  @Column()
  userId: string; // ej. usr_001

  @Column('int')
  amount: number; // ej. 50000

  @Column()
  currency: string; // ej. COP

  @Column({ default: 'pending' })
  status: string; // pending, approved, declined, failed

  @Column()
  method: string; // card, nequi, etc.

  @Column({ nullable: true })
  reference: string; // WOMPI_REF_001

  @CreateDateColumn()
  createdAt: Date;
}