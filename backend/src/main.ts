import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // ─── Global prefix ────────────────────────────
  // app.setGlobalPrefix('api'); // optional

  // ─── CORS ─────────────────────────────────────
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true,
  });

  // ─── Validation ───────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Swagger ──────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BizFlow API')
    .setDescription('API de gestion pour petites entreprises')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification')
    .addTag('dashboard', 'Tableau de bord')
    .addTag('clients', 'Gestion des clients')
    .addTag('invoices', 'Facturation')
    .addTag('products', 'Catalogue produits')
    .addTag('stock', 'Mouvements de stock')
    .addTag('expenses', 'Dépenses')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Application démarrée sur http://localhost:${port}`);
  logger.log(`📚 Swagger disponible sur http://localhost:${port}/api`);
}

bootstrap();
