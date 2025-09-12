# Docker Compose Guide

## Purpose

This project uses Docker Compose for local development. Docker Compose orchestrates the PostgreSQL database and pgAdmin services, making it easy to set up and manage your development environment without manual installation.

## What Does This Compose Project Do?

- **PostgreSQL Database**: Runs a PostgreSQL container with default credentials for local development.
- **pgAdmin**: Runs pgAdmin, a web-based database management tool, allowing you to interact with your PostgreSQL database via a browser.
- **Networking**: Both services are connected to a custom Docker network for secure communication.
- **Persistent Storage**: Data is stored in Docker volumes to persist between container restarts.

## How to Use

### 1. Start the Docker Compose Project

```bash
docker compose up -d
```

This command will start both the PostgreSQL and pgAdmin containers in detached mode.

### 2. Stop the Docker Compose Project

```bash
docker compose down
```

This will stop and remove the containers, but your data will persist in the Docker volumes.

### 3. Access pgAdmin

- Open your browser and go to: [http://localhost:8080](http://localhost:8080)
- Login with:
  - **Email**: `admin@admin.com`
  - **Password**: `admin`
- Add a new server in pgAdmin:
  - **Host**: `postgres`
  - **Port**: `5432`
  - **Username**: `nestuser`
  - **Password**: `nestpassword`

### 4. View Logs

```bash
docker compose logs
```

### 5. Restart Services

```bash
docker compose restart
```

## Environment Variables

You can adjust database credentials and pgAdmin settings in the `docker-compose.yml` file as needed for your local setup.

## Troubleshooting

- If you encounter issues, check container logs with `docker compose logs`.
- Ensure Docker is running and ports `5432` (Postgres) and `8080` (pgAdmin) are available.

---

For more details on Docker usage, see the main [Docker Guide](./docker-guide.md).
