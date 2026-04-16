import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // Importamos la herramienta que permite hacer peticiones web (como si fuera el navegador)
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [
    // Al colocar HttpModule aquí, le damos permiso a todo nuestro departamento
    // de pagos para enviar y recibir datos de servidores externos (como Wompi).
    HttpModule
  ], 
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}