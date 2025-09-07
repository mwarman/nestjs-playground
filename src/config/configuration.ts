import { z } from 'zod';

export const DEFAULT_APP_PORT = 3000;
export const DEFAULT_LOGGING_LEVEL = 'info';

const configSchema = z.object({
  APP_PORT: z.coerce.number().min(1).max(65535).default(DEFAULT_APP_PORT),
  LOGGING_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default(DEFAULT_LOGGING_LEVEL),
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
