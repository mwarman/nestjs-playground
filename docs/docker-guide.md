# Docker Guide

This guide provides comprehensive instructions for building, running, and managing Docker containers for the NestJS Playground application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Building the Docker Image](#building-the-docker-image)
- [Running the Container](#running-the-container)
- [Environment Variables](#environment-variables)
- [Container Management](#container-management)
- [Cleanup](#cleanup)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have Docker installed on your system:

- **Docker Desktop** (recommended for Windows and macOS)
- **Docker Engine** (for Linux)

Verify your installation:

```bash
docker --version
docker-compose --version
```

## Building the Docker Image

The application uses a multi-stage Dockerfile for optimized production builds.

### Basic Build

Build the Docker image with a tag:

```bash
docker build -t nestjs-playground .
```

### Build with Custom Tag

```bash
docker build -t nestjs-playground:latest .
docker build -t nestjs-playground:v1.0.0 .
```

### Build with No Cache

Force a fresh build without using cached layers:

```bash
docker build --no-cache -t nestjs-playground .
```

### Build for Specific Platform

Build for a specific platform (useful for cross-platform deployment):

```bash
# For ARM64 (Apple Silicon, ARM servers)
docker build --platform linux/arm64 -t nestjs-playground:arm64 .

# For AMD64 (Intel/AMD x86_64)
docker build --platform linux/amd64 -t nestjs-playground:amd64 .
```

## Running the Container

### Basic Run

Start the container and map port 3000:

```bash
docker run -p 3000:3000 nestjs-playground
```

### Run in Detached Mode

Run the container in the background:

```bash
docker run -d -p 3000:3000 --name nestjs-app nestjs-playground
```

### Run with Custom Port Mapping

Map to a different host port:

```bash
docker run -d -p 8080:3000 --name nestjs-app nestjs-playground
```

Access the application at `http://localhost:8080`

### Run with Restart Policy

Automatically restart the container if it stops:

```bash
docker run -d -p 3000:3000 --name nestjs-app --restart unless-stopped nestjs-playground
```

## Environment Variables

### Passing Environment Variables

#### Single Environment Variable

```bash
docker run -p 3000:3000 -e NODE_ENV=production nestjs-playground
```

#### Multiple Environment Variables

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  nestjs-playground
```

#### Using Environment File

Create a `.env` file:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
LOG_LEVEL=info
```

Run with environment file:

```bash
docker run -p 3000:3000 --env-file .env nestjs-playground
```

#### Environment Variables in Detached Mode

```bash
docker run -d -p 3000:3000 \
  --name nestjs-app \
  --env-file .env \
  --restart unless-stopped \
  nestjs-playground
```

### Common Environment Variables

For a complete list of supported environment variables and their descriptions, see the [Configuration Guide](./configuration-guide.md).

The following are commonly used environment variables when running the application in Docker:

| Variable        | Description                                | Default      | Example                               |
| --------------- | ------------------------------------------ | ------------ | ------------------------------------- |
| `NODE_ENV`      | Node.js environment                        | `production` | `production`, `development`           |
| `APP_PORT`      | Application port (see Configuration Guide) | `3001`       | `3000`, `8080`                        |
| `LOGGING_LEVEL` | Logging level (see Configuration Guide)    | `debug`      | `debug`, `info`, `warn`, `error`      |
| `DATABASE_URL`  | Database connection string                 | -            | `postgresql://user:pass@host:5432/db` |

## Container Management

### List Running Containers

```bash
docker ps
```

### List All Containers (including stopped)

```bash
docker ps -a
```

### View Container Logs

```bash
# View logs
docker logs nestjs-app

# Follow logs in real-time
docker logs -f nestjs-app

# View last 100 lines
docker logs --tail 100 nestjs-app
```

### Execute Commands in Running Container

```bash
# Open interactive shell
docker exec -it nestjs-app sh

# Run a single command
docker exec nestjs-app node --version
```

### Stop Container

```bash
docker stop nestjs-app
```

### Start Stopped Container

```bash
docker start nestjs-app
```

### Restart Container

```bash
docker restart nestjs-app
```

### Remove Container

```bash
# Stop and remove
docker stop nestjs-app
docker rm nestjs-app

# Force remove (stops and removes)
docker rm -f nestjs-app
```

## Cleanup

### Remove Unused Resources

#### Remove Stopped Containers

```bash
docker container prune
```

#### Remove Unused Images

```bash
docker image prune
```

#### Remove All Unused Resources

```bash
docker system prune
```

#### Remove Everything (including volumes)

```bash
docker system prune -a --volumes
```

### Remove Specific Resources

#### Remove Specific Image

```bash
docker rmi nestjs-playground
docker rmi nestjs-playground:v1.0.0
```

#### Remove Multiple Images

```bash
docker rmi $(docker images nestjs-playground -q)
```

## Development Workflow

### Development with Volume Mounting

For development, you might want to mount your source code:

```bash
docker run -p 3000:3000 \
  -v $(pwd)/src:/usr/src/app/src \
  -e NODE_ENV=development \
  nestjs-playground
```

### Docker Compose for Development

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
      - PORT=3000
    volumes:
      - ./src:/usr/src/app/src
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=nestjs_playground
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with Docker Compose:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Quick Development Commands

```bash
# Build and run in one command
docker build -t nestjs-playground . && docker run -p 3000:3000 nestjs-playground

# Rebuild and restart
docker stop nestjs-app || true
docker rm nestjs-app || true
docker build -t nestjs-playground .
docker run -d -p 3000:3000 --name nestjs-app nestjs-playground
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
docker run -p 3001:3000 nestjs-playground
```

#### Container Exits Immediately

Check logs for errors:

```bash
docker logs nestjs-app
```

Run with interactive mode to debug:

```bash
docker run -it nestjs-playground sh
```

#### Image Build Fails

Build with verbose output:

```bash
docker build --progress=plain -t nestjs-playground .
```

#### Container Cannot Connect to External Services

Check network configuration:

```bash
# Inspect container network
docker inspect nestjs-app

# Use host network (Linux only)
docker run --network host nestjs-playground
```

### Debugging Commands

```bash
# Inspect image
docker inspect nestjs-playground

# Check image history
docker history nestjs-playground

# Check container stats
docker stats nestjs-app

# Export container filesystem
docker export nestjs-app > container.tar
```

### Health Checks

Add health check to Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

Check health status:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## Best Practices

1. **Use .dockerignore**: Keep build context small
2. **Multi-stage builds**: Separate build and runtime dependencies
3. **Non-root user**: Run containers with non-root user for security
4. **Environment variables**: Use for configuration, never hardcode secrets
5. **Health checks**: Implement health check endpoints
6. **Resource limits**: Set memory and CPU limits in production
7. **Logging**: Use structured logging and external log aggregation
8. **Security scanning**: Regularly scan images for vulnerabilities

```bash
# Example with resource limits
docker run -d -p 3000:3000 \
  --name nestjs-app \
  --memory="512m" \
  --cpus="1.0" \
  --restart unless-stopped \
  nestjs-playground
```

## Additional Resources

- [Docker Official Documentation](https://docs.docker.com/)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Container Security Best Practices](https://docs.docker.com/engine/security/)
