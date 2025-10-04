# Application Configuration Guide

This document explains how to configure the application. Proper configuration ensures the application runs as expected in different environments, for example development, quality, staging, or production.

## Getting Started

1. **Copy the Example Environment File:**
   - Duplicate `.env.example` as `.env` in the project root.
   - Adjust the values as needed for your local setup.

2. **Edit Environment Variables:**
   - Open `.env` and update variables to match your requirements.
   - The application loads these variables at startup.

3. **Run the Application:**
   - Use `npm run start` or your preferred command to launch the app.

## Environment Variables

The following environment variables are available for configuration:

| Name                       | Description                                                                                                                                                     | Default Value   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| APP_PORT                   | The port on which the application will run.                                                                                                                     | 3001            |
| LOGGING_LEVEL              | The logging level for the application. Allowed values: verbose, debug, log, warn, error, fatal                                                                  | log             |
| CORS_ALLOWED_ORIGIN        | CORS allowed origins. Use "\*" to allow all origins, or comma-separated list for specific origins (e.g., "https://app.com,http://localhost:3000")               | \*              |
| DB_HOST                    | PostgreSQL database host                                                                                                                                        | localhost       |
| DB_PORT                    | PostgreSQL database port                                                                                                                                        | 5432            |
| DB_USER                    | PostgreSQL database username                                                                                                                                    | nestuser        |
| DB_PASS                    | PostgreSQL database password                                                                                                                                    | nestpassword    |
| DB_DATABASE                | PostgreSQL database name                                                                                                                                        | nestdb          |
| DB_SSL                     | Enable SSL for PostgreSQL connection. Allowed: true, false, "true", "false", 1, 0. Useful for cloud DBs or production.                                          | true            |
| DB_MIGRATIONS_RUN          | Automatically run migrations at startup.                                                                                                                        | true            |
| SCHEDULE_TASK_CLEANUP_CRON | **Optional.** Cron expression for scheduled task cleanup. Format: second minute hour day month weekday. If not provided, the cleanup job will not be scheduled. | _Not set_       |
| JWT_SECRET                 | Secret key used to sign JWT tokens for authentication. Store this value in a secure location.                                                                   | your-secret-key |
| JWT_EXPIRES_IN             | JWT token expiration time (e.g., "1h", "30m").                                                                                                                  | 1h              |

## Environment Variable Precedence in NestJS

NestJS applications resolve environment variables using the following precedence order:

1. **Process Environment (`process.env`)**: Values set in the running environment (e.g., via shell, Docker, CI/CD) override all others.
2. **`.env` File**: Variables defined in the `.env` file in the project root are loaded at startup if not already set in `process.env`.
3. **Default Values in Code**: If a variable is not set in either `process.env` or `.env`, the application may fall back to defaults defined in the code (e.g., in configuration service or module).

**Note:**

- If a variable is set in multiple places, the value from `process.env` takes precedence.
- `.env.example` is only a template and is not loaded by the application.
- For production deployments, environment variables should be set securely at the infrastructure level.

For more details, see the [NestJS documentation on configuration](https://docs.nestjs.com/techniques/configuration).

## Scheduled Task Configuration

The application includes an optional scheduled task feature that can automatically clean up tasks from the database at regular intervals.

### Enabling Scheduled Task Cleanup

To enable the scheduled task cleanup:

1. Set the `SCHEDULE_TASK_CLEANUP_CRON` environment variable with a valid cron expression
2. Example: `SCHEDULE_TASK_CLEANUP_CRON=0 */5 * * * *` (runs every 5 minutes)

### Disabling Scheduled Task Cleanup

To disable the scheduled task cleanup feature:

- **Option 1**: Comment out the variable in your `.env` file:

  ```dotenv
  # SCHEDULE_TASK_CLEANUP_CRON=0 * * * * *
  ```

- **Option 2**: Remove the variable entirely from your `.env` file

- **Option 3**: Do not set the variable in your deployment environment

When the `SCHEDULE_TASK_CLEANUP_CRON` variable is not configured, the application will log an informational message and continue running without scheduling the cleanup job.

### Cron Expression Format

The cron expression follows the standard 6-field format:

```
* * * * * *
│ │ │ │ │ │
│ │ │ │ │ └─── day of week (0-7, where 0 and 7 represent Sunday)
│ │ │ │ └───── month (1-12)
│ │ │ └─────── day of month (1-31)
│ │ └───────── hour (0-23)
│ └─────────── minute (0-59)
└───────────── second (0-59)
```

Common examples:

- `0 * * * * *` - Every minute
- `0 0 * * * *` - Every hour
- `0 0 0 * * *` - Every day at midnight
- `0 0 0 * * 0` - Every Sunday at midnight

## Example `.env` file

```dotenv
############################################################
# Example .env file for NestJS Playground
#
# Copy this file to `.env` and adjust values as needed.
############################################################

# Application Settings
APP_PORT=3001

# Logging Settings
LOGGING_LEVEL=log

# CORS Settings
# CORS_ALLOWED_ORIGIN: Allowed origins for Cross-Origin Resource Sharing
# Use "*" to allow all origins (development only)
# Use comma-separated list for specific origins: "https://app.com,http://localhost:3000"
CORS_ALLOWED_ORIGIN=*

# Database Settings
# PostgreSQL database connection configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=nestuser
DB_PASS=nestpassword
DB_DATABASE=nestdb
# Enable SSL for PostgreSQL connection (true/false/1/0)
DB_SSL=false
# DB_MIGRATIONS_RUN: Automatically run migrations on startup (true/false) Default: true
DB_MIGRATIONS_RUN=true

# Scheduled Task Settings
# Cron expression for task cleanup schedule (OPTIONAL)
# Format: second minute hour day month weekday
# To disable scheduled task cleanup, comment out or remove this variable
SCHEDULE_TASK_CLEANUP_CRON=0 * * * * *

# JWT Authentication Settings
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
```

## Tips for New Engineers

- Always keep your `.env` file out of version control (it should be in `.gitignore`).
- Refer to `.env.example` for the latest list of supported variables.
- If you add new configuration options, update `.env.example` and this documentation.
- Never commit sensitive credentials to version control.
- For questions about configuration, ask your team or check the NestJS documentation.
