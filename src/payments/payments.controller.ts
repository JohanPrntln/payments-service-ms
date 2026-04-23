import { Controller, Post, Body, Patch, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { WompiWebhookDto } from './dto/webhook.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ------------------------------------------------------------------
  // 1. ENDPOINT : POST /payments (Crear el pago)
  // ------------------------------------------------------------------
  @Post()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      // Delegamos el trabajo pesado al servicio
      const data = await this.paymentsService.processPayment(createPaymentDto);
      
      // Retornamos estrictamente el formato de ÉXITO 
      return {
        success: true,
        message: 'Pago procesado correctamente',
        data: data
      };
    } catch (error) {
      // Retornamos estrictamente el formato de ERROR 
      return {
        success: false,
        message: 'Error al procesar el pago',
        error: {
          code: 'PAYMENT_CREATION_FAILED',
          details: [error.message || 'Fallo de conexión interno']
        }
      };
    }
  }

  // ------------------------------------------------------------------
  // 2. ENDPOINT : PATCH /payments/:id/status
  // ------------------------------------------------------------------
  @Patch(':id/status')
  async updatePaymentStatus(
    @Param('id') id: string, 
    @Body() body: { status: string } // Recibimos el nuevo estado desde Postman
  ) {
    try {
      // Llamamos al servicio real
      const data = await this.paymentsService.updatePaymentStatus(id, body.status);
      
      return {
        success: true,
        message: 'Estado del pago actualizado correctamente',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al actualizar el estado',
        error: {
          code: 'PAYMENT_UPDATE_FAILED',
          details: [error.message]
        }
      };
    }
  }

  // ------------------------------------------------------------------
  // 3. ENDPOINT INTERNO: Webhook de Wompi (Recibe actualizaciones de pago)
  // ------------------------------------------------------------------
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  wompiWebhook(@Body() webhookDto: WompiWebhookDto) {
    // Wompi no lee formatos de éxito/error, solo necesita un 200 OK.
    console.log('Actualización de transacción recibida desde Wompi:', webhookDto);
    return { received: true };
  }
}