# Infrastructure Guide

This guide provides a comprehensive overview of the AWS infrastructure for the NestJS Playground backend application, including architectural decisions, deployment instructions, and operational considerations.

> **Note:** This infrastructure provisions only backend/API components. There is no presentation tier (e.g., web frontend, CloudFront) included. All resources are for backend services and APIs.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Infrastructure Components](#infrastructure-components)
3. [Deployment Process](#deployment-process)
4. [Environment Management](#environment-management)
5. [Security Model](#security-model)
6. [Cost Optimization](#cost-optimization)
7. [Monitoring and Observability](#monitoring-and-observability)
8. [Disaster Recovery](#disaster-recovery)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

## Architecture Overview

The NestJS Playground backend application is deployed on AWS using a modern, serverless-first architecture designed for cost optimization, scalability, and maintainability. The infrastructure is organized into five logical stacks:

### High-Level Architecture

```
┌─────────────────┐    ┌───────────────────┐    ┌────────────────────┐    ┌─────────────────┐
│  Application    │    │      Data         │    │   Container Image  │    │   Scheduled     │
│      Tier       │    │      Tier         │    │      Registry      │    │     Tasks       │
├─────────────────┤    ├───────────────────┤    ├────────────────────┤    ├─────────────────┤
│ Route 53        │    │ Aurora Serverless │    │ Amazon ECR         │    │ ECS Fargate     │
│ SSL Certificate │    │ v2 PostgreSQL     │    │ (ECR Stack)        │    │ (No Load        │
│ Load Balancer   │    │ Secrets Manager   │    │                    │    │  Balancer)      │
│ ECS Fargate     │    │                   │    │                    │    │ Background Jobs │
└─────────────────┘    └───────────────────┘    └────────────────────┘    └─────────────────┘
```

> **Note:** There is no presentation tier (such as CloudFront or web frontend) in this architecture. All components are backend/API only.

### Design Principles

1. **Serverless First**: Minimize operational overhead with managed services
2. **Cost Optimization**: Right-sized resources with autoscaling capabilities
3. **Security by Design**: Zero-trust networking with least privilege access
4. **Infrastructure as Code**: All infrastructure defined in CDK TypeScript
5. **Multi-Environment**: Supports dev, qa, and production environments

## Infrastructure Components

### Network Stack (`network.stack.ts`)

**Purpose**: Provides foundational networking, DNS, and SSL capabilities.

**Key Resources**:

- **VPC**: Existing VPC imported by ID for network isolation
- **Route 53 Hosted Zone**: Existing zone for DNS management
- **SSL Certificate**: Existing ACM certificate for HTTPS termination
- **DNS Alias**: A-record pointing to the Application Load Balancer

**Configuration**:

```typescript
// Required environment variables
CDK_HOSTED_ZONE_ID=Z1234567890ABC
CDK_HOSTED_ZONE_NAME=example.com
CDK_CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/...
CDK_DOMAIN_NAME=nestjs-playground-api
```

### Database Stack (`database.stack.ts`)

**Purpose**: Provides managed PostgreSQL database with automatic scaling.

**Key Resources**:

- **Aurora Serverless v2**: PostgreSQL 17.5 with configurable ACU capacity
- **Security Group**: Restricts access to port 5432 from application only
- **Subnet Group**: Database deployed in private subnets
- **Secrets Manager**: Automatic credential generation and rotation

**Configuration**:

```typescript
// Database environment variables
CDK_DATABASE_NAME = nestjs_playground;
CDK_DATABASE_USERNAME = postgres;
CDK_DATABASE_MIN_CAPACITY = 0.5; // Minimum ACUs (configurable)
CDK_DATABASE_MAX_CAPACITY = 1; // Maximum ACUs (configurable)
CDK_DATABASE_READ_REPLICA = false; // Enable read replica (default: false)
```

**Read Replica Support**:

When `CDK_DATABASE_READ_REPLICA=true`:

- Creates a serverless v2 reader instance in the Aurora cluster
- Stores the read endpoint hostname in a separate AWS Secrets Manager secret
- Passes the read replica hostname to the application as `DB_HOST_READ_ONLY`
- Application creates a read-only TypeORM data source using the replica endpoint
- Falls back to primary host if `DB_HOST_READ_ONLY` is not provided

When `CDK_DATABASE_READ_REPLICA=false` (default):

- No reader instances are created (cost optimization)
- Application uses the primary database for all operations

**Cost Optimization Features**:

- Configurable minimum capacity: 0.5-16 ACUs (default: 0.5)
- Configurable maximum capacity: 1-16 ACUs (default: 1)
- Automatic pausing when inactive (scale-to-zero capability)
- Backup retention: 7 days (production) / 1 day (non-production)
- Read replicas are optional and can be disabled for non-production environments

**Connection Details**:

```typescript
// Environment variables injected into containers
DB_HOST: cluster.clusterEndpoint.hostname
DB_PORT: 5432
DB_USERNAME: postgres (from secrets)
DB_PASSWORD: auto-generated (from secrets)
DB_DATABASE: nestjs_playground
```

### ECR Stack (`ecr.stack.ts`)

**Purpose**: Manages the Amazon Elastic Container Registry (ECR) for storing and scanning application container images.

**Key Resources**:

- **ECR Repository**: `${appName}` (named per environment)
- **Image Scanning**: Enabled on push for vulnerability detection
- **Tag Mutability**: Mutable tags for development workflows
- **Removal Policy**: Retain in production, destroy in non-prod environments
- **Outputs**: Exports repository URI, name, and ARN for use in other stacks

### Compute Stack (`compute.stack.ts`)

**Purpose**: Hosts the NestJS application using containerized microservices.

**Key Resources**:

- **ECS Cluster**: Managed ECS cluster with container insights
- **Task Definition**: Fargate task with configurable CPU and memory
- **Service**: Maintains desired instance count with rolling deployments
- **Auto Scaling**: CPU-based scaling (50% threshold, configurable min/max instances)
- **Application Load Balancer**: Internet-facing with HTTPS termination
- **Target Group**: Health checks on `/v1/health` endpoint
- **Listeners**:
  - Port 443 (HTTPS): Routes to application
  - Port 80 (HTTP): Redirects to HTTPS
- **Security Groups**: Restrictive ingress/egress rules
- **Subnets**: Application deployed in private subnets with NAT Gateway access

**Configuration**:

```typescript
// Compute environment variables
CDK_APP_PORT = 3000;
CDK_APP_LOGGING_LEVEL = debug;
CDK_APP_JWT_EXPIRES_IN = 1h; // JWT token expiration time
CDK_TASK_MEMORY_MB = 512; // Task memory in MB (configurable)
CDK_TASK_CPU_UNITS = 256; // Task CPU units (configurable)
CDK_SERVICE_DESIRED_COUNT = 0; // Initial desired count (configurable)
CDK_SERVICE_MIN_CAPACITY = 0; // Auto scaling minimum (configurable)
CDK_SERVICE_MAX_CAPACITY = 4; // Auto scaling maximum (configurable)
```

**Environment Variables Injected into Compute Containers**:

```typescript
// Application environment variables
NODE_ENV: 'production';
APP_PORT: '3000';
LOGGING_LEVEL: 'debug'; // or configured level
LOGGING_FORMAT: 'json';
CORS_ALLOWED_ORIGIN: '*'; // or configured origins
JWT_EXPIRES_IN: '1h'; // JWT token expiration from CDK_APP_JWT_EXPIRES_IN

// Secrets from AWS services
DB_HOST: 'cluster endpoint'; // from Aurora Secrets Manager
DB_PORT: '5432'; // from Aurora Secrets Manager
DB_USER: 'postgres'; // from Aurora Secrets Manager
DB_PASS: 'auto-generated'; // from Aurora Secrets Manager
DB_DATABASE: 'nestjs_playground'; // from Aurora Secrets Manager
DB_HOST_READ_ONLY: 'read endpoint'; // from Read Replica Secrets Manager (optional)
JWT_SECRET: 'secure-jwt-secret'; // from Parameter Store: /nestjs-playground/jwt-secret
```

**Note**: `DB_HOST_READ_ONLY` is only injected when `CDK_DATABASE_READ_REPLICA=true` in the infrastructure configuration.

### Scheduled Task Stack (`scheduled-task.stack.ts`)

**Purpose**: Runs background tasks and scheduled jobs using the same application image without HTTP load balancer overhead.

**Key Resources**:

- **Task Definition**: Fargate task identical to main application but configured for scheduled tasks
- **ECS Service**: Runs exactly 1 instance (or 0 when disabled) for background job processing
- **Security Group**: Restrictive egress-only rules (no inbound HTTP traffic needed)
- **CloudWatch Log Group**: Separate logging for scheduled task output
- **No Load Balancer**: Direct container execution without HTTP routing

**Conditional Deployment**:

- **Resources are only created when `CDK_SCHEDULE_TASK_CLEANUP_CRON` is defined**
- **Service desired count**: 1 when scheduled tasks enabled, 0 when disabled
- **Cost-effective**: No ALB, Target Groups, or HTTP listeners required

**Configuration**:

```typescript
// Scheduled task environment variables (optional)
CDK_SCHEDULE_TASK_CLEANUP_CRON = '0 2 * * *'; // Daily at 2 AM (optional)
CDK_SCHEDULER_TASK_MEMORY_MB = 512; // Task memory in MB (default: 512)
CDK_SCHEDULER_TASK_CPU_UNITS = 256; // Task CPU units (default: 256)
```

**Environment Variables Injected**:

- `SCHEDULE_TASK_CLEANUP_CRON`: Cron expression for task scheduling
- `NODE_ENV=production`: Production mode
- `LOGGING_LEVEL`: Configured logging level
- `LOGGING_FORMAT=json`: JSON logging format
- Database connection secrets (same as main application)

**Use Cases**:

- Database cleanup tasks
- Data aggregation jobs
- Batch processing operations
- Maintenance routines
- Report generation

## Deployment Process

### Prerequisites

1. **AWS Account Setup**:
   - AWS CLI configured with appropriate credentials
   - CDK bootstrap completed in target account/region

2. **Existing Resources**:
   - VPC with public and private subnets
   - Route 53 hosted zone
   - SSL certificate in ACM

3. **Required Secrets**:
   - JWT secret parameter must be created manually in AWS Systems Manager Parameter Store:
     ```bash
     aws ssm put-parameter \
       --name "/nestjs-playground/jwt-secret" \
       --type "SecureString" \
       --value "your-secure-jwt-secret-key"
     ```

4. **Local Environment**:
   - Node.js (version in `.nvmrc`)
   - AWS CDK CLI installed globally

### Step-by-Step Deployment

1. **Environment Configuration**:

   ```bash
   cd infrastructure
   cp .env.example .env
   # Edit .env with your specific values
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Synthesize Templates**:

   ```bash
   npm run synth
   ```

4. **Deploy Infrastructure**:

   ```bash
   npm run deploy
   ```

5. **Verify Deployment**:
   - Check AWS Console for created resources
   - Test application URL: `https://nestjs-playground-api.example.com`

### Deployment Order & Stack Dependencies

The CDK automatically handles dependencies, but the logical order is:

1. **Network Stack**: Sets up VPC references and DNS
2. **Database Stack**: Creates Aurora cluster in VPC
3. **ECR Stack**: Creates ECR repository for container images
4. **Compute Stack**: Deploys application with database connectivity and references ECR for images
5. **Scheduled Task Stack**: Deploys background task service using compute cluster and ECR images

**Stack Dependency Diagram:**

```
Network Stack
   ↓
Database Stack
   ↓
ECR Stack
   ↓
Compute Stack
   ↓
Scheduled Task Stack
```

## Resource Configuration

### Sizing Recommendations

The infrastructure supports configurable resource allocation to match workload requirements and optimize costs:

#### Development Environment

```bash
# Database - Minimal cost configuration
CDK_DATABASE_MIN_CAPACITY=0.5
CDK_DATABASE_MAX_CAPACITY=1

# Compute - Minimal resource configuration
CDK_TASK_MEMORY_MB=512
CDK_TASK_CPU_UNITS=256
CDK_SERVICE_DESIRED_COUNT=0      # Start with 0 to save costs
CDK_SERVICE_MIN_CAPACITY=0
CDK_SERVICE_MAX_CAPACITY=2
```

#### Staging/QA Environment

```bash
# Database - Light production load
CDK_DATABASE_MIN_CAPACITY=0.5
CDK_DATABASE_MAX_CAPACITY=2

# Compute - Higher availability
CDK_TASK_MEMORY_MB=1024
CDK_TASK_CPU_UNITS=512
CDK_SERVICE_DESIRED_COUNT=1
CDK_SERVICE_MIN_CAPACITY=1
CDK_SERVICE_MAX_CAPACITY=4
```

#### Production Environment

```bash
# Database - Production capacity
CDK_DATABASE_MIN_CAPACITY=1
CDK_DATABASE_MAX_CAPACITY=8

# Compute - High availability and performance
CDK_TASK_MEMORY_MB=2048
CDK_TASK_CPU_UNITS=1024
CDK_SERVICE_DESIRED_COUNT=2
CDK_SERVICE_MIN_CAPACITY=2
CDK_SERVICE_MAX_CAPACITY=10
```

### Performance Considerations

- **CPU/Memory Ratio**: Maintain 1:2 ratio (e.g., 512 CPU with 1024 MB memory)
- **Database ACUs**: 1 ACU = 2 GB RAM + proportional CPU and networking
- **Auto Scaling**: Set appropriate min/max to handle traffic spikes while controlling costs
- **Health Checks**: Ensure adequate memory for application startup and health check responsiveness

## Environment Management

### Environment Variables

All configuration uses environment variables prefixed with `CDK_`:

#### Core Infrastructure Variables

| Variable          | Purpose          | Example            | Required |
| ----------------- | ---------------- | ------------------ | -------- |
| `CDK_ACCOUNT`     | AWS Account ID   | `123456789012`     | Optional |
| `CDK_REGION`      | AWS Region       | `us-east-1`        | Optional |
| `CDK_ENVIRONMENT` | Environment name | `dev`, `qa`, `prd` | Yes      |

#### Network & Security Variables

| Variable               | Purpose               | Example                        | Required |
| ---------------------- | --------------------- | ------------------------------ | -------- |
| `CDK_HOSTED_ZONE_ID`   | Route 53 zone ID      | `Z1234567890ABC`               | Yes      |
| `CDK_HOSTED_ZONE_NAME` | Route 53 zone name    | `example.com`                  | Yes      |
| `CDK_DOMAIN_NAME`      | Application subdomain | `nestjs-playground-api`        | Yes      |
| `CDK_CERTIFICATE_ARN`  | SSL certificate ARN   | `arn:aws:acm:us-east-1:123...` | Yes      |

#### Application Variables

| Variable                      | Purpose              | Default             | Example                                 |
| ----------------------------- | -------------------- | ------------------- | --------------------------------------- |
| `CDK_APP_NAME`                | Application name     | `nestjs-playground` | `my-app`                                |
| `CDK_APP_PORT`                | Application port     | `3000`              | `3000`                                  |
| `CDK_APP_LOGGING_LEVEL`       | Log level            | `info`              | `debug`                                 |
| `CDK_APP_CORS_ALLOWED_ORIGIN` | CORS allowed origins | `*`                 | `https://app.com,http://localhost:3000` |
| `CDK_APP_JWT_EXPIRES_IN`      | JWT token expiration | `1h`                | `2h`, `30m`, `7d`                       |

#### Database Variables

| Variable                    | Purpose             | Default             | Range      | Example    |
| --------------------------- | ------------------- | ------------------- | ---------- | ---------- |
| `CDK_DATABASE_NAME`         | Database name       | `nestjs_playground` | -          | `myapp_db` |
| `CDK_DATABASE_USERNAME`     | Database username   | `postgres`          | -          | `admin`    |
| `CDK_DATABASE_MIN_CAPACITY` | Min Aurora ACUs     | `0.5`               | 0.5-16     | `1.0`      |
| `CDK_DATABASE_MAX_CAPACITY` | Max Aurora ACUs     | `1`                 | 1-16       | `4.0`      |
| `CDK_DATABASE_READ_REPLICA` | Enable read replica | `false`             | true/false | `true`     |

**Read Replica Notes:**

- When `CDK_DATABASE_READ_REPLICA=true`: Creates a reader instance and stores hostname in Secrets Manager
- When `CDK_DATABASE_READ_REPLICA=false` (default): No reader instances created (cost optimization)
- The read replica hostname is passed to the application as `DB_HOST_READ_ONLY`
- Application creates a separate read-only TypeORM connection for read operations

#### Compute Variables

| Variable                    | Purpose               | Default | Range     | Example |
| --------------------------- | --------------------- | ------- | --------- | ------- |
| `CDK_TASK_MEMORY_MB`        | Task memory (MB)      | `512`   | 512-30720 | `1024`  |
| `CDK_TASK_CPU_UNITS`        | Task CPU units        | `256`   | 256-4096  | `512`   |
| `CDK_SERVICE_DESIRED_COUNT` | Initial service count | `0`     | 0-100     | `2`     |
| `CDK_SERVICE_MIN_CAPACITY`  | Auto scaling minimum  | `0`     | 0-100     | `1`     |
| `CDK_SERVICE_MAX_CAPACITY`  | Auto scaling maximum  | `4`     | 1-100     | `10`    |

#### Scheduled Task Variables

| Variable                         | Purpose                    | Default | Range     | Example       |
| -------------------------------- | -------------------------- | ------- | --------- | ------------- |
| `CDK_SCHEDULE_TASK_CLEANUP_CRON` | Cron expression (optional) | -       | -         | `"0 2 * * *"` |
| `CDK_SCHEDULER_TASK_MEMORY_MB`   | Scheduler memory (MB)      | `512`   | 512-30720 | `1024`        |
| `CDK_SCHEDULER_TASK_CPU_UNITS`   | Scheduler CPU units        | `256`   | 256-4096  | `512`         |

**Notes:**

- When `CDK_SCHEDULE_TASK_CLEANUP_CRON` is **not set**: No scheduled task resources are created
- When `CDK_SCHEDULE_TASK_CLEANUP_CRON` is **set**: Scheduled task service runs with desired count = 1
- The `hasScheduledTasks` derived property automatically controls resource creation
- Cron format: `"minute hour day month day-of-week"` (e.g., `"0 2 * * *"` = daily at 2 AM)

#### Tagging Variables

| Variable        | Purpose             | Default            | Example             |
| --------------- | ------------------- | ------------------ | ------------------- |
| `CDK_TAG_APP`   | Application tag     | `${APP_NAME}`      | `nestjs-playground` |
| `CDK_TAG_ENV`   | Environment tag     | `${ENVIRONMENT}`   | `production`        |
| `CDK_TAG_OU`    | Organizational unit | `engineering`      | `backend-team`      |
| `CDK_TAG_OWNER` | Resource owner      | `team@example.com` | `john@company.com`  |

### Multi-Environment Strategy

Each environment uses:

- Separate AWS accounts or regions
- Environment-specific `.env` files
- Unique stack names: `${appName}-${environment}-${stackType}`
- Environment-specific resource sizing

Example deployment commands:

```bash
# Development
CDK_ENVIRONMENT=dev npm run deploy

# Production
CDK_ENVIRONMENT=prd npm run deploy
```

## Security Model

### Network Security

1. **VPC Isolation**: Application deployed in existing VPC with proper subnetting
2. **Security Groups**: Restrictive firewall rules between tiers
3. **Private Subnets**: Database and application in non-internet-routable subnets
4. **NAT Gateway**: Outbound internet access for updates and APIs

### Application Security

1. **HTTPS Only**: SSL termination at load balancer with HTTP→HTTPS redirect
2. **Container Security**: Regular image scanning and minimal base images
3. **Secrets Management**: Database credentials in AWS Secrets Manager, JWT secrets in Systems Manager Parameter Store
4. **JWT Authentication**: JWT secret stored securely in `/nestjs-playground/jwt-secret` Parameter Store parameter
5. **IAM Roles**: Least privilege access for ECS tasks and Parameter Store access

### Data Security

1. **Encryption at Rest**: Aurora Serverless v2 encryption enabled
2. **Encryption in Transit**: SSL connections to database
3. **Access Control**: Database security groups restrict access to application tier only
4. **Backup Encryption**: Automated backups encrypted

## Cost Optimization

### Database Costs

- **Aurora Serverless v2**: Pay-per-use with scale-to-zero capability
- **Configurable Capacity**: Adjust `CDK_DATABASE_MIN_CAPACITY` and `CDK_DATABASE_MAX_CAPACITY` based on workload
- **Default Configuration**: 0.5-1 ACU for development (~$0.06-$0.12/hour when active)
- **Short Backup Retention**: 1 day (non-prod) / 7 days (production)
- **No Read Replicas**: Single writer instance for cost optimization

### Compute Costs

- **Fargate Pricing**: Pay only for running containers
- **Configurable Resources**: Adjust `CDK_TASK_MEMORY_MB` and `CDK_TASK_CPU_UNITS` based on needs
- **Default Configuration**: 256 CPU / 512 MB memory for development workloads
- **Auto Scaling**: Configure `CDK_SERVICE_MIN_CAPACITY` and `CDK_SERVICE_MAX_CAPACITY` for optimal cost/performance
- **Desired Count**: Start with `CDK_SERVICE_DESIRED_COUNT=0` for development to minimize costs
- **Log Retention**: 1-week retention (non-prod) / 1-month retention (production)

### Scheduled Task Costs

- **Conditional Deployment**: Resources only created when `CDK_SCHEDULE_TASK_CLEANUP_CRON` is defined
- **No Load Balancer**: Eliminates ALB costs (~$16-22/month) for background tasks
- **Single Instance**: Runs exactly 1 Fargate task when enabled (configurable CPU/memory)
- **Default Configuration**: 256 CPU / 512 MB memory (same as main application)
- **Cost Control**:
  - **Development**: Leave `CDK_SCHEDULE_TASK_CLEANUP_CRON` unset to avoid costs
  - **Production**: Only enable when scheduled tasks are actually needed
- **Resource Sharing**: Uses same ECR images, VPC, and database as main application

### Network Costs

- **Existing Resources**: Leverages existing VPC and certificates
- **NAT Gateway**: Shared across subnets
- **CloudWatch**: Minimal monitoring configuration

### Cost Monitoring

Monitor costs using:

- AWS Cost Explorer
- CloudWatch billing metrics
- Resource tagging for cost allocation

## Monitoring and Observability

### Application Monitoring

1. **Health Checks**: ALB health checks on `/v1/health` endpoint (main application)
2. **Container Logs**: Centralized logging in CloudWatch for both main and scheduled task services
3. **Container Insights**: ECS cluster-level metrics for all services
4. **Scheduled Task Logs**: Separate log group (`/ecs/{appName}-scheduler-{environment}`) for background job output
5. **Custom Metrics**: Application-specific metrics via CloudWatch

### Infrastructure Monitoring

1. **CloudWatch Alarms**: CPU, memory, and connection metrics
2. **AWS X-Ray**: Distributed tracing (optional)
3. **VPC Flow Logs**: Network traffic analysis (optional)

### Alerting Strategy

Set up alerts for:

- High CPU utilization (>80%) for both main and scheduled task services
- Database connection failures
- Application health check failures (main service)
- Scheduled task failures or unexpected exits
- High error rates in logs (both services)
- Scheduled task service not running when expected

## Disaster Recovery

### Backup Strategy

1. **Database Backups**:
   - Automated daily backups (7-day retention)
   - Point-in-time recovery available
   - Cross-region snapshots for production

2. **Application Images**:
   - ECR repository with image versioning
   - Multiple image tags for rollback capability

### Recovery Procedures

1. **Database Recovery**:

   ```bash
   # Restore from backup
   aws rds restore-db-cluster-to-point-in-time \
     --source-db-cluster-identifier original-cluster \
     --db-cluster-identifier restored-cluster \
     --restore-to-time 2025-01-01T00:00:00Z
   ```

2. **Application Rollback**:
   ```bash
   # Deploy previous image version
   aws ecs update-service \
     --cluster nestjs-playground-dev \
     --service nestjs-playground-dev \
     --task-definition nestjs-playground-dev:previous-revision
   ```

## Troubleshooting

### Common Issues

1. **Deployment Failures**:
   - Check CloudFormation events in AWS Console
   - Verify environment variables are correctly set
   - Ensure existing resources (VPC, certificates) are accessible

2. **Application Startup Issues**:
   - Check ECS service events
   - Review CloudWatch logs for error messages
   - Verify database connectivity and credentials

3. **Health Check Failures**:
   - Confirm `/v1/health` endpoint is responding
   - Check security group rules for ALB → ECS communication
   - Verify application is listening on correct port

4. **Scheduled Task Issues**:
   - Verify `CDK_SCHEDULE_TASK_CLEANUP_CRON` is set if tasks are expected
   - Check scheduled task service desired count (should be 1 when enabled, 0 when disabled)
   - Review scheduled task logs in separate log group: `/ecs/{appName}-scheduler-{environment}`
   - Ensure scheduled task service has database connectivity
   - Verify cron expression format is valid

### Debugging Commands

```bash
# Check stack status
aws cloudformation describe-stacks \
  --stack-name nestjs-playground-dev-compute

# View ECS service events
aws ecs describe-services \
  --cluster nestjs-playground-dev \
  --services nestjs-playground-dev

# Get recent application logs
aws logs filter-log-events \
  --log-group-name /ecs/nestjs-playground-dev \
  --start-time $(date -d '1 hour ago' +%s)000

# Get scheduled task logs
aws logs filter-log-events \
  --log-group-name /ecs/nestjs-playground-scheduler-dev \
  --start-time $(date -d '1 hour ago' +%s)000

# Check scheduled task service status
aws ecs describe-services \
  --cluster nestjs-playground-dev \
  --services nestjs-playground-scheduler-dev
```

## Best Practices

### Configuration Management

1. **Environment-Specific Values**: Use different `.env` files for each environment
2. **Resource Sizing**: Start small and scale up based on actual usage metrics
3. **Cost Monitoring**: Regularly review and adjust capacity settings based on usage
4. **Version Control**: Keep `.env.example` updated but never commit actual `.env` files
5. **Validation**: Test configuration changes in development before applying to production

### Development Workflow

1. **Local Testing**: Test infrastructure changes in development environment first
2. **Progressive Deployment**: Deploy to dev → qa → production
3. **Infrastructure Validation**: Use `cdk diff` before deployments
4. **Resource Cleanup**: Regularly destroy development environments to save costs
5. **Scheduled Task Management**: Only enable scheduled tasks (`CDK_SCHEDULE_TASK_CLEANUP_CRON`) when actually needed to avoid unnecessary costs

### Security Best Practices

1. **Credential Management**: Never store credentials in code or environment files
2. **Access Control**: Use IAM roles instead of access keys where possible
3. **Network Segmentation**: Maintain strict security group rules
4. **Regular Updates**: Keep CDK and AWS CLI updated

### Operational Best Practices

1. **Monitoring**: Set up comprehensive monitoring before production deployment
2. **Documentation**: Keep infrastructure documentation updated
3. **Backup Testing**: Regularly test backup and recovery procedures
4. **Cost Optimization**: Review and optimize costs monthly

### Code Organization

1. **Stack Separation**: Maintain logical separation between network, database, ECR, compute, and scheduled tasks
2. **Configuration Management**: Use environment variables for all environment-specific values
3. **Version Control**: Tag infrastructure releases for rollback capability
4. **Code Reviews**: Review all infrastructure changes before deployment

---

This infrastructure provides a solid foundation for the NestJS Playground application with built-in scalability, security, and cost optimization. Regular review and updates ensure the infrastructure continues to meet application requirements as it evolves.
