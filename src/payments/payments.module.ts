import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm'; // <-- Herramienta de BD
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity'; // <-- Importamos la tabla del archivo payment.entity.ts

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Payment]), 
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}