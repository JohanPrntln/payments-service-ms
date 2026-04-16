import { IsString, IsNotEmpty, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

// 1. Definimos la estructura interna de los datos de la transacción
class WompiEventData {
  // ID único de la transacción en la base de datos de Wompi
  @IsString()
  @IsNotEmpty()
  id: string;

  // Estado definitivo del pago (ej. 'APPROVED' o 'DECLINED')
  @IsString()
  @IsNotEmpty()
  status: string;
}

// 2. Definimos la estructura principal del payload que envía el Webhook
export class WompiWebhookDto {
  // Tipo de evento que Wompi está reportando (ej. 'transaction.updated')
  @IsString()
  @IsNotEmpty()
  event: string;

  // Objeto anidado que contiene los detalles de la transacción
  @IsObject()
  @ValidateNested()
  @Type(() => WompiEventData) // Permite a class-transformer validar la clase interna
  data: WompiEventData;

  // Firma criptográfica enviada por Wompi para verificar la autenticidad del mensaje
  @IsString()
  @IsNotEmpty()
  signature: string;
}