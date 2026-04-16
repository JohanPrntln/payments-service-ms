import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

// La ruta principal será localhost:3000/payments
@Controller('payments')
export class PaymentsController {
  
  // Inyectamos a nuestro obrero (el servicio) para delegarle el trabajo
  constructor(private readonly paymentsService: PaymentsService) {}

  // ------------------------------------------------------------------
  // PUERTA 1: Para crear un pago (La usa el Frontend / API Gateway)
  // Ruta: POST localhost:3000/payments/charge
  // ------------------------------------------------------------------
  @Post('charge')
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    // Tomamos los datos validados por el DTO y se los pasamos al servicio
    return this.paymentsService.processPayment(createPaymentDto);
  }

  // ------------------------------------------------------------------
  // PUERTA 2: El Webhook (Exclusivo para Wompi)
  // Ruta: POST localhost:3000/payments/webhook
  // ------------------------------------------------------------------
  @Post('webhook')
  wompiWebhook(@Body() eventData: any) {
    // Cuando el banco aprueba o rechaza el pago, Wompi hace una petición a esta ruta.
    // Recibimos los datos del evento (eventData) que contienen el estado final de la transacción.
    
    // Por ahora solo vamos a imprimir en consola lo que Wompi nos manda,
    // para poder investigar la estructura del mensaje antes de programar la base de datos.
    console.log('¡Wompi nos envió una actualización de pago!', eventData);
    
    // Es obligatorio responderle a Wompi rápidamente con un "OK" (status 200)
    // para que sepan que recibimos el mensaje y no nos lo vuelvan a enviar.
    return { received: true };
  }
}