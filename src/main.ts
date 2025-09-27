import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { VersioningType } from '@nestjs/common';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { Config } from './config/configuration';

async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Enable URI versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // Retrieve configuration service to access application settings
  const configService = app.get(ConfigService<Config>);

  // Apply security middleware
  app.use(helmet()); // Must be before any other middleware
  app.enableCors({
    origin: configService.get<string | string[]>('CORS_ALLOWED_ORIGIN')!,
  });

  // Use the Pino logger for structured logging
  app.useLogger(app.get(Logger));

  // Set up Swagger for API documentation
  const documentBuilder = new DocumentBuilder()
    .setTitle('NestJS Playground')
    .setDescription('API documentation for the NestJS Playground application.')
    .setVersion('1.0')
    .addGlobalResponse(
      { status: 400, description: 'Bad Request' },
      { status: 500, description: 'Internal Server Error' },
    )
    .build();
  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('apidoc', app, document);

  // Start the application and listen on the configured port
  await app.listen(configService.get<number>('APP_PORT')!);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
