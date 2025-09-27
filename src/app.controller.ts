import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { AppService } from './app.service';

type Message = { message: string };

@Controller({ version: '1' })
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch the welcome message' })
  @ApiOkResponse({ description: 'Welcome message', type: Object })
  getHello(): Message {
    this.logger.log('> getHello');

    const message = this.appService.getHello();
    this.logger.debug(`app service message: ${message}`);

    this.logger.log('< getHello');
    return { message: message };
  }
}
