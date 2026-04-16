import { IsNumber, IsString, IsNotEmpty, Min, IsEmail } from 'class-validator';

export class CreatePaymentDto {
  // El monto de la cita  debe ser un número y no puede estar vacío
  @IsNumber()
  @IsNotEmpty()
  @Min(1000) // Wompi y pasarelas en COP no suelen aceptar transacciones menores a ciertos montos
  amountInCents: number;

  // La moneda (ej. "COP")
  @IsString()
  @IsNotEmpty()
  currency: string;

  // El correo del paciente al que se le va a cobrar
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  // El token de la tarjeta de crédito que generará el frontend
  @IsString()
  @IsNotEmpty()
  paymentMethodToken: string;

  // Una referencia única para saber de qué cita médica es este pago
  @IsString()
  @IsNotEmpty()
  reference: string;
}