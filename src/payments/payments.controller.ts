import { Controller, Post, Body, Patch, Param, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { WompiWebhookDto } from './dto/webhook.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ------------------------------------------------------------------
  // 1. ENDPOINT DEL CONTRATO: POST /payments (Crear el pago)
  // ------------------------------------------------------------------
  @Post()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      // Delegamos el trabajo pesado al servicio
      const data = await this.paymentsService.processPayment(createPaymentDto);
      
      // Retornamos estrictamente el formato de ÉXITO del contrato
      return {
        success: true,
        message: 'Pago procesado correctamente',
        data: data
      };
    } catch (error) {
      // Retornamos estrictamente el formato de ERROR del contrato
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
  // 2. ENDPOINT DEL CONTRATO: PATCH /payments/:id/status
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

  // ------------------------------------------------------------------
  // 4. ENDPOINT DEL CONTRATO: GET /payments/appointment/:appointmentId
  // ------------------------------------------------------------------
  @Get('appointment/:appointmentId')
  async getPaymentsByAppointmentId(@Param('appointmentId') appointmentId: string) {
    try {
      const data = await this.paymentsService.getPaymentsByAppointmentId(appointmentId);
      return {
        success: true,
        message: 'Pagos obtenidos correctamente',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener los pagos',
        error: {
          code: 'PAYMENTS_NOT_FOUND',
          details: [error.message]
        }
      };
    }
  }

  // ------------------------------------------------------------------
  // 5. ENDPOINT DEL CONTRATO: GET /payments/:id (Obtener pago por ID)

  // ------------------------------------------------------------------
  @Get(':id')
  async getPaymentById(@Param('id') id: string) {
    try {
      const data = await this.paymentsService.getPaymentById(id);
      return {
        success: true,
        message: 'Pago obtenido correctamente',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener el pago',
        error: {
          code: 'PAYMENT_NOT_FOUND',
          details: [error.message]
        }
      };
    }
  }
}