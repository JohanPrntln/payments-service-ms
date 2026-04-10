import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ¡Esta línea es la magia! Activa la validación de los DTOs en todo el proyecto
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Si el frontend envía datos extra que no están en el DTO, los ignora
    forbidNonWhitelisted: true, // Si envían datos extra, rechaza la petición por completo
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
