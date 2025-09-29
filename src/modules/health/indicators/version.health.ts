import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

import { version } from '../../../../package.json';

@Injectable()
export class VersionHealthIndicator extends HealthIndicatorService {
  constructor(private readonly healthIndicatorService: HealthIndicatorService) {
    super();
  }

  isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    if (!version) {
      return indicator.down({ error: 'Version not found' });
    }

    return indicator.up({ version });
  }
}
