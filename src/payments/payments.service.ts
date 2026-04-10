import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  
  // Aquí creamos la función que el controlador estaba buscando
  processPayment(createPaymentDto: CreatePaymentDto) {
    
    // Por ahora, solo devolveremos un mensaje confirmando que el DTO funcionó.
    // Más adelante, aquí irá el código de Axios para conectarnos a Wompi.
    return {
      message: 'Datos validados correctamente por el DTO. Listo para Wompi.',
      dataRecibida: createPaymentDto,
    };
  }
}