import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

import { version } from '../../../../package.json';

@Injectable()
export class VersionHealthIndicator extends HealthIndicatorService {
  constructor(private readonly healthIndicatorService: HealthIndicatorService) {
    super();
  }

  /**
   * Get the application version.
   * @param key - The key to identify the version health check
   * @returns The version information
   */
  getVersion(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    if (!version) {
      return indicator.down({ error: 'Version not found' });
    }

    return indicator.up({ version });
  }
}
