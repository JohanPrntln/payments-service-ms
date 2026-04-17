import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm'; 

@Entity('payments') 
export class Payment {
  
  @PrimaryColumn({ type: 'varchar' }) 
  id: string; 

  @Column({ type: 'varchar' })
  appointmentId: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string; 

  @Column({ type: 'varchar', default: 'pending' })
  status: string; 

  @Column({ type: 'varchar' })
  method: string; 

  @Column({ type: 'varchar', nullable: true })
  reference: string; 

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}