import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';
import { valid } from 'semver';

import { version } from '../../../../package.json';
import { Config } from '../../../config/configuration';

/**
 * Additional data returned when the version health check is healthy.
 */
type VersionHealthUpAdditionalData = {
  value: string;
  source: 'env' | 'package.json';
};

/**
 * Additional data returned when the version health check is unhealthy.
 */
type VersionHealthDownAdditionalData = {
  error: string;
};

@Injectable()
export class VersionHealthIndicator extends HealthIndicatorService {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly configService: ConfigService<Config, true>,
  ) {
    super();
  }

  /**
   * Get the application version value. If the version is not found or not a valid semver, it returns a down status.
   * Version is sourced from APP_VERSION environment variable with fallback to package.json.
   * @param key - The key to identify the version health check
   * @returns The version information including source
   */
  getValue(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    // Try to get version from environment variable first
    const envVersion = this.configService.get('APP_VERSION', { infer: true });
    let value: string | null = null;
    let source: 'env' | 'package.json' = 'package.json';

    if (envVersion && valid(envVersion)) {
      value = envVersion;
      source = 'env';
    } else if (valid(version)) {
      value = version;
      source = 'package.json';
    }

    if (!value) {
      return indicator.down<VersionHealthDownAdditionalData>({ error: 'Version not found or not valid semver' });
    }

    return indicator.up<VersionHealthUpAdditionalData>({ value, source });
  }
}
