import { z } from 'zod';

export const DEFAULT_APP_PORT = 3001;
export const DEFAULT_LOGGING_LEVEL = 'log';
export const DEFAULT_DB_HOST = 'localhost';
export const DEFAULT_DB_PORT = 5432;
export const DEFAULT_DB_USER = 'nestuser';
export const DEFAULT_DB_PASS = 'nestpassword';
export const DEFAULT_DB_DATABASE = 'nestdb';

const configSchema = z.object({
  APP_PORT: z.coerce.number().min(1).max(65535).default(DEFAULT_APP_PORT),
  LOGGING_LEVEL: z.enum(['verbose', 'debug', 'log', 'warn', 'error', 'fatal']).default(DEFAULT_LOGGING_LEVEL),
  DB_HOST: z.string().default(DEFAULT_DB_HOST),
  DB_PORT: z.coerce.number().min(1).max(65535).default(DEFAULT_DB_PORT),
  DB_USER: z.string().default(DEFAULT_DB_USER),
  DB_PASS: z.string().default(DEFAULT_DB_PASS),
  DB_DATABASE: z.string().default(DEFAULT_DB_DATABASE),
  DB_MIGRATIONS_RUN: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val.toLowerCase() === 'false' || val === '0') return false;
      if (val.toLowerCase() === 'true' || val === '1') return true;
    }
    return val;
  }, z.boolean().default(true)),
  DB_SSL: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val.toLowerCase() === 'false' || val === '0') return false;
      if (val.toLowerCase() === 'true' || val === '1') return true;
    }
    return val;
  }, z.boolean().default(true)),
  SCHEDULE_TASK_CLEANUP_CRON: z.string().optional(),
});

export type Config = z.infer<typeof configSchema>;

export const validate = (config: Record<string, unknown>): Config => {
  const result = configSchema.safeParse(config);

  if (!result.success) {
    const message = result.error.issues.map((issue) => `${issue.path.join('.')} - ${issue.message}`).join(', ');
    throw new Error(`Config validation error: ${message}`);
  }

  return result.data;
};
