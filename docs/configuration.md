# Application Configuration

This document explains how to configure the NestJS Playground application. Proper configuration ensures the application runs as expected in different environments (development, staging, production).

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

| Name          | Description                                 | Default Value |
| ------------- | ------------------------------------------- | ------------- |
| APP_PORT      | The port on which the application will run. | 3001          |
| LOGGING_LEVEL | The logging level for the application.      | debug         |

### Example `.env` file

```dotenv
############################################################
# Example .env file for NestJS Playground
#
# Copy this file to `.env` and adjust values as needed.
############################################################

# Application Settings
APP_PORT=3001

# Logging Settings
LOGGING_LEVEL=debug
```

## Tips for New Engineers

- Always keep your `.env` file out of version control (it should be in `.gitignore`).
- Refer to `.env.example` for the latest list of supported variables.
- If you add new configuration options, update `.env.example` and this documentation.
- For questions about configuration, ask your team or check the NestJS documentation.
