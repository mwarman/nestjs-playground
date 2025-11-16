import { z } from 'zod';

/**
 * Zod schema for infrastructure configuration validation
 * Uses actual environment variable names as keys
 */
const configurationSchema = z
  .object({
    // Application configuration
    CDK_APP_NAME: z.string().min(1).default('nestjs-playground'),
    CDK_APP_PORT: z.coerce.number().int().positive().default(3000),
    CDK_APP_LOGGING_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    CDK_APP_CORS_ALLOWED_ORIGIN: z.string().default('*'),
    CDK_APP_JWT_EXPIRES_IN: z.string().min(1).default('1h'),
    CDK_ENVIRONMENT: z.string().min(1).default('dev'),

    // AWS configuration
    CDK_ACCOUNT: z.string().optional(),
    CDK_DEFAULT_ACCOUNT: z.string().optional(),
    CDK_REGION: z.string().optional(),
    CDK_DEFAULT_REGION: z.string().optional(),

    // Compute configuration
    CDK_TASK_MEMORY_MB: z.coerce.number().int().positive().default(512),
    CDK_TASK_CPU_UNITS: z.coerce.number().int().positive().default(256),
    CDK_SERVICE_DESIRED_COUNT: z.coerce.number().int().min(0).default(0),
    CDK_SERVICE_MIN_CAPACITY: z.coerce.number().int().min(0).default(0),
    CDK_SERVICE_MAX_CAPACITY: z.coerce.number().int().positive().default(4),

    // Scheduled task configuration
    CDK_SCHEDULE_TASK_CLEANUP_CRON: z.string().optional(),
    CDK_SCHEDULER_TASK_MEMORY_MB: z.coerce.number().int().positive().default(512),
    CDK_SCHEDULER_TASK_CPU_UNITS: z.coerce.number().int().positive().default(256),

    // Database configuration
    CDK_DATABASE_NAME: z.string().min(1).default('nestjs_playground'),
    CDK_DATABASE_USERNAME: z.string().min(1).default('postgres'),
    CDK_DATABASE_MIN_CAPACITY: z.coerce.number().positive().default(0.5),
    CDK_DATABASE_MAX_CAPACITY: z.coerce.number().positive().default(1),
    CDK_DATABASE_READ_REPLICA: z.preprocess((val) => {
      if (typeof val === 'string') {
        if (val.toLowerCase() === 'false' || val === '0') return false;
        if (val.toLowerCase() === 'true' || val === '1') return true;
      }
      return val;
    }, z.boolean().default(false)),

    // Required AWS infrastructure configuration
    CDK_HOSTED_ZONE_ID: z.string().min(1),
    CDK_HOSTED_ZONE_NAME: z.string().min(1),
    CDK_CERTIFICATE_ARN: z.string().min(1),
    CDK_DOMAIN_NAME: z.string().min(1),

    // Tagging configuration
    CDK_TAG_APP: z.string().optional(),
    CDK_TAG_ENV: z.string().optional(),
    CDK_TAG_OU: z.string().default('engineering'),
    CDK_TAG_OWNER: z.string().default('team@example.com'),
  })
  .transform((data) => ({
    ...data,
    // Derived property: hasScheduledTasks is true when CDK_SCHEDULE_TASK_CLEANUP_CRON is defined
    hasScheduledTasks: Boolean(data.CDK_SCHEDULE_TASK_CLEANUP_CRON),
  }))
  .refine((data) => data.CDK_SERVICE_MIN_CAPACITY <= data.CDK_SERVICE_MAX_CAPACITY, {
    message: 'Service min capacity must be less than or equal to max capacity',
    path: ['CDK_SERVICE_MIN_CAPACITY'],
  })
  .refine((data) => data.CDK_DATABASE_MIN_CAPACITY <= data.CDK_DATABASE_MAX_CAPACITY, {
    message: 'Database min capacity must be less than or equal to max capacity',
    path: ['CDK_DATABASE_MIN_CAPACITY'],
  });

/**
 * Type definition for validated configuration
 */
export type Configuration = z.infer<typeof configurationSchema>;

/**
 * Configuration error class for better error handling
 */
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public readonly validationErrors: z.ZodError,
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Load and validate configuration from environment variables
 *
 * @returns Validated configuration object
 * @throws ConfigurationError if validation fails
 */
export function loadConfiguration(): Configuration {
  try {
    return configurationSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = `Configuration validation failed:\n${error.issues
        .map((err: z.ZodIssue) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n')}`;

      throw new ConfigurationError(errorMessage, error);
    }
    throw error;
  }
}

/**
 * Get environment configuration for CDK
 */
export function getEnvironmentConfig(config: Configuration) {
  return {
    account: config.CDK_ACCOUNT || config.CDK_DEFAULT_ACCOUNT,
    region: config.CDK_REGION || config.CDK_DEFAULT_REGION,
  };
}

/**
 * Get common tags for all resources
 */
export function getCommonTags(config: Configuration) {
  return {
    App: config.CDK_TAG_APP || config.CDK_APP_NAME,
    Env: config.CDK_TAG_ENV || config.CDK_ENVIRONMENT,
    OU: config.CDK_TAG_OU,
    Owner: config.CDK_TAG_OWNER,
  };
}
