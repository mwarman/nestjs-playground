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

| Name          | Description                                                                                    | Default Value |
| ------------- | ---------------------------------------------------------------------------------------------- | ------------- |
| APP_PORT      | The port on which the application will run.                                                    | 3000          |
| LOGGING_LEVEL | The logging level for the application. Allowed values: verbose, debug, log, warn, error, fatal | log           |

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

### Example `.env` file

```dotenv
############################################################
# Example .env file for NestJS Playground
#
# Copy this file to `.env` and adjust values as needed.
############################################################

# Application Settings
APP_PORT=3000

# Logging Settings
LOGGING_LEVEL=log
```

## Tips for New Engineers

- Always keep your `.env` file out of version control (it should be in `.gitignore`).
- Refer to `.env.example` for the latest list of supported variables.
- If you add new configuration options, update `.env.example` and this documentation.
- For questions about configuration, ask your team or check the NestJS documentation.
