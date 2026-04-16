import { Injectable, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { firstValueFrom } from 'rxjs'; // Convierte el flujo de datos de Axios en una Promesa (async/await)

@Injectable()
export class PaymentsService {
  // Logger nos permite imprimir mensajes en la consola de Docker para saber qué está pasando
  private readonly logger = new Logger(PaymentsService.name);

  // El constructor es donde pedimos las herramientas que vamos a usar.
  // configService: Para leer el archivo .env oculto.
  // httpService: Para mandar la petición a internet.
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  // Esta es la función principal que procesa el pago. Es "async" porque la comunicación
  // con Wompi toma un par de segundos y el código debe esperar la respuesta.
  async processPayment(createPaymentDto: CreatePaymentDto) {
    
    // 1. Extraemos tu llave secreta del archivo .env. ¡Nunca la escribas directo aquí!
    const privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY');
    
    // 2. Esta es la URL oficial de Wompi para hacer transacciones de prueba (Sandbox)
    const wompiUrl = 'https://sandbox.wompi.co/v1/transactions';

    // 3. Wompi exige que los nombres de las variables tengan guión bajo (snake_case).
    // Aquí traducimos los datos que llegaron de tu DTO al formato estricto de Wompi.
    const payload = {
      amount_in_cents: createPaymentDto.amountInCents, // El dinero (ej. 50000)
      currency: createPaymentDto.currency,             // La moneda (ej. COP)
      customer_email: createPaymentDto.customerEmail,  // Correo del paciente o cliente
      payment_method: {
        type: 'CARD',                                  // Método de pago: Tarjeta
        token: createPaymentDto.paymentMethodToken,    // El token de la tarjeta que generó el Frontend
        installments: 1,                               // Número de cuotas (1 por defecto)
      },
      reference: createPaymentDto.reference,           // Número de la reserva o cita
    };

    try {
      this.logger.log(`Iniciando cobro para la reserva: ${createPaymentDto.reference}`);

      // 4. Hacemos el envío de los datos. 
      // Usamos .post porque estamos "enviando" información.
      const response = await firstValueFrom(
        this.httpService.post(wompiUrl, payload, {
          headers: {
            // El encabezado Authorization es nuestra credencial de seguridad. 
            // Así Wompi sabe que somos nosotros y no un atacante.
            Authorization: `Bearer ${privateKey}`, 
          },
        }),
      );

      // 5. Si Wompi acepta la petición, devolvemos los datos importantes al Frontend.
      return {
        message: 'Transacción creada exitosamente.',
        transactionId: response.data.data.id,        // El ID único del pago en Wompi
        status: response.data.data.status,           // El estado actual (generalmente PENDING)
      };

    } catch (error) {
      // 6. Si Wompi nos rechaza (por ejemplo, si usamos el token inventado "tok_test_12345"),
      // el código entra aquí. Extraemos el error real de Wompi para saber qué falló.
      const wompiError = error.response?.data || error.message;
      this.logger.error('Wompi rechazó la transacción', wompiError);
      
      // Lanzamos el error hacia Postman para que tú puedas leerlo en la pantalla
      throw new HttpException(
        {
          message: 'Error al procesar el pago con Wompi',
          detalle: wompiError, // Ahora verás si fue error de token, llave, o monto
        },
        error.response?.status || 500,
      );
    }
  }
}