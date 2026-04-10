import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('charge')
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    // Si la petición llega a este punto, significa que pasó todas las validaciones del DTO
    return this.paymentsService.processPayment(createPaymentDto);
  }
}