import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'; // <-- Importamos la herramienta de conexión
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    // 1. Cargamos las variables del .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 2. Configuramos la conexión a la Base de Datos de forma asíncrona
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: 5432,
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true, // Carga las tablas automáticamente
        synchronize: true,      // Crea las tablas en la BD si no existen (Solo para desarrollo)
      }),
    }),

    // 3. Nuestro módulo de pagos
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}