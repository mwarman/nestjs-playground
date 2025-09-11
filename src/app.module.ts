import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validate } from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './modules/tasks/tasks.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate }), TasksModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
