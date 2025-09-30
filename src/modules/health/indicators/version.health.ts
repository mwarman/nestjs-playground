import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { valid } from 'semver';

import { version } from '../../../../package.json';

/**
 * Additional data returned when the version health check is healthy.
 */
type VersionHealthUpAdditionalData = {
  value: string;
};

/**
 * Additional data returned when the version health check is unhealthy.
 */
type VersionHealthDownAdditionalData = {
  error: string;
};

@Injectable()
export class VersionHealthIndicator extends HealthIndicatorService {
  constructor(private readonly healthIndicatorService: HealthIndicatorService) {
    super();
  }

  /**
   * Get the application version value. If the version is not found or not a valid semver, it returns a down status.
   * @param key - The key to identify the version health check
   * @returns The version information
   */
  getValue(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    const value = valid(version) ? version : null;

    if (!value) {
      return indicator.down<VersionHealthDownAdditionalData>({ error: 'Version not found or not valid semver' });
    }

    return indicator.up<VersionHealthUpAdditionalData>({ value });
  }
}
