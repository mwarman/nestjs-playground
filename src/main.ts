import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { DEFAULT_LOGGING_LEVEL, Config } from './config/configuration';

async function bootstrap() {
  // Determine log level from environment variable or use default
  const logLevel: LogLevel = (process.env.LOGGING_LEVEL as LogLevel) || DEFAULT_LOGGING_LEVEL;

  // Create the NestJS application with specified log level
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: new ConsoleLogger({ logLevels: [logLevel], json: true }),
  });

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

  // Retrieve configuration service to access application settings
  const configService = app.get(ConfigService<Config>);

  // Start the application and listen on the configured port
  await app.listen(configService.get<number>('APP_PORT')!);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
