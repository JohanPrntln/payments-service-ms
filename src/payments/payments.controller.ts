import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { WompiWebhookDto } from './dto/webhook.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('charge')
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.processPayment(createPaymentDto);
  }

  // Endpoint dedicado a recibir eventos asíncronos desde Wompi
  @Post('webhook')
  @HttpCode(HttpStatus.OK) // Fuerza la respuesta a 200 OK según la especificación de Webhooks
  wompiWebhook(@Body() webhookDto: WompiWebhookDto) {
    
    // Imprime el payload en la salida estándar de Docker para auditoría
    console.log('Actualización de transacción recibida desde Wompi:', webhookDto);
    
    // Retorna una confirmación estándar para que Wompi cierre el ciclo de reintentos
    return { received: true };
  }
}