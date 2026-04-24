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
  // 3. ENDPOINT INTERNO: Webhook de Wompi (Automatizado)
  // ------------------------------------------------------------------
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async wompiWebhook(@Body() webhookPayload: any) {
    // Imprimimos para auditoría
    console.log('Evento real recibido de Wompi:', webhookPayload.event);

    // Si el evento es una actualización de transacción...
    if (webhookPayload.event === 'transaction.updated') {
      // Navegamos por el JSON real de Wompi para sacar la referencia y el estado
      const reference = webhookPayload.data.transaction.reference;
      const status = webhookPayload.data.transaction.status;

      // Mandamos al servicio a que actualice la base de datos en silencio
      if (reference && status) {
        await this.paymentsService.updatePaymentStatusByReference(reference, status);
      }
    }
    
    // Siempre debemos responder 200 OK rápido para que Wompi no se enoje
    return { received: true };
  }
}