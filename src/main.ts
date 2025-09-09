import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { LogLevel } from '@nestjs/common';

import { AppModule } from './app.module';
import { DEFAULT_LOGGING_LEVEL, Config } from './config/configuration';

async function bootstrap() {
  const logLevel: LogLevel = (process.env.LOGGING_LEVEL as LogLevel) || DEFAULT_LOGGING_LEVEL;

  const app = await NestFactory.create(AppModule, { bufferLogs: true, logger: [logLevel] });

  const configService = app.get(ConfigService<Config>);

  await app.listen(configService.get<number>('APP_PORT')!);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
