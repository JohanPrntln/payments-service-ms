//aqui escribiremos el codigo de la API de wompi para que decida si fue aprovado o rechazado el pago
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
