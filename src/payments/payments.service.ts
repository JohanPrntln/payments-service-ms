import { Injectable, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm'; 
import { Repository } from 'typeorm';               
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity'; 
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    
    // Inyectamos el repositorio. Esto le da al servicio el poder de hacer INSERT, SELECT, UPDATE en la BD.
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async processPayment(createPaymentDto: CreatePaymentDto) {
    
    // 1. GENERAR ID Y REFERENCIA NOSOTROS MISMOS
    // Usamos el timestamp (milisegundos) para garantizar que nunca se repitan
    const timestamp = Date.now();
    const paymentId = `pay_${timestamp}`;        // Cumple el formato del contrato: "pay_..."
    const referenceCode = `ref_${timestamp}`;    // Referencia interna para Wompi

    // 2. Preparamos los datos para la base de datos
    const newPayment = this.paymentRepository.create({
      id: paymentId, 
      appointmentId: createPaymentDto.appointmentId,
      userId: createPaymentDto.userId,
      amount: createPaymentDto.amount,
      currency: createPaymentDto.currency,
      method: createPaymentDto.method,
      reference: referenceCode,
      status: 'pending', 
    });

    // Ejecutamos el guardado en la base de datos
    const savedPayment = await this.paymentRepository.save(newPayment);
    this.logger.log(`Pago guardado en BD con ID: ${savedPayment.id}. Iniciando Wompi...`);

    // 3. PREPARAR CONEXIÓN A WOMPI
    const privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY');
    const wompiUrl = 'https://sandbox.wompi.co/v1/transactions';

    // 4. MAPEO ESTRICTO PARA WOMPI
    const payload = {
      amount_in_cents: createPaymentDto.amount, 
      currency: createPaymentDto.currency,
      customer_email: createPaymentDto.customerEmail,
      payment_method: {
        type: 'CARD',
        token: createPaymentDto.paymentMethodToken,
        installments: 1,
      },
      reference: referenceCode, 
    };

    try {
      // 5. ENVÍO A WOMPI
      const response = await firstValueFrom(
        this.httpService.post(wompiUrl, payload, {
          headers: {
            Authorization: `Bearer ${privateKey}`,
          },
        }),
      );

      // 6. RESPUESTA FINAL SI WOMPI ACEPTA
      // Actualizamos el estado en base de datos a aprobado
      savedPayment.status = 'approved';
      await this.paymentRepository.save(savedPayment);

      return {
        id: savedPayment.id,
        appointmentId: savedPayment.appointmentId,
        reference: referenceCode,
        wompiTransactionId: response.data.data.id,
        status: savedPayment.status
      };

    } catch (error) {
      // 7. MANEJO DE ERROR (SI EL TOKEN DE WOMPI ES FALSO)
      // Cambiamos a fallido en BD y guardamos
      savedPayment.status = 'failed';
      await this.paymentRepository.save(savedPayment);

      const wompiError = error.response?.data || error.message;
      this.logger.error('Wompi rechazó la transacción', wompiError);
      
      throw new HttpException(
        {
          message: 'Error al procesar el pago con Wompi',
          detalle: wompiError,
        },
        error.response?.status || 500,
      );
    }
  }
  // Esta función busca un pago por su ID y le cambia el estado
  async updatePaymentStatus(id: string, newStatus: string) {
    // 1. Buscamos el pago en la base de datos
    const payment = await this.paymentRepository.findOne({ where: { id } });
    
    if (!payment) {
      throw new HttpException('Pago no encontrado', 404);
    }

    // 2. Actualizamos el estado y guardamos
    payment.status = newStatus;
    const updatedPayment = await this.paymentRepository.save(payment);

    return {
      id: updatedPayment.id,
      status: updatedPayment.status
    };
  }

  // Esta función obtiene un pago por su ID
  async getPaymentById(id: string) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    
    if (!payment) {
      throw new HttpException('Pago no encontrado', 404);
    }

    return {
      id: payment.id,
      appointmentId: payment.appointmentId,
      userId: payment.userId,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      reference: payment.reference,
      status: payment.status,
    };
  }

  // Esta función obtiene todos los pagos asociados a una cita (appointmentId)
  async getPaymentsByAppointmentId(appointmentId: string) {
    const payments = await this.paymentRepository.find({
      where: { appointmentId }
    });

    if (!payments || payments.length === 0) {
      throw new HttpException('No se encontraron pagos para esta cita', 404);
    }

    return payments.map(payment => ({
      id: payment.id,
      appointmentId: payment.appointmentId,
      userId: payment.userId,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      reference: payment.reference,
      status: payment.status,
    }));
  }
}