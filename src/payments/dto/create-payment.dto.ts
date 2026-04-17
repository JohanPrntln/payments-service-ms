import { IsNumber, IsString, IsNotEmpty, Min, IsEmail } from 'class-validator';

export class CreatePaymentDto {
  // ID de la cita médica que nos enviará el microservicio de Appointments
  @IsString()
  @IsNotEmpty()
  appointmentId: string;

  // ID del paciente que nos enviará el API Gateway
  @IsString()
  @IsNotEmpty()
  userId: string;

  // El monto a cobrar (se define como 'amount')
  @IsNumber()
  @IsNotEmpty()
  @Min(1000) 
  amount: number;

  // La moneda (ej. "COP")
  @IsString()
  @IsNotEmpty()
  currency: string;

  // El método de pago exigido (ej. "card")
  @IsString()
  @IsNotEmpty()
  method: string;

  // El correo del paciente al que se le va a cobrar en Wompi
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  // El token de la tarjeta de crédito que generará el frontend
  @IsString()
  @IsNotEmpty()
  paymentMethodToken: string;
}