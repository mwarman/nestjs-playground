import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { Config } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService<Config>);

  const logger = app.get(Logger);
  app.useLogger(logger);

  await app.listen(configService.get<number>('APP_PORT')!);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
