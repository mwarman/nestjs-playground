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

The NestJS Playground backend application is deployed on AWS using a modern, serverless-first architecture designed for cost optimization, scalability, and maintainability. The infrastructure is organized into four logical stacks:

### High-Level Architecture

```
┌─────────────────┐    ┌───────────────────┐    ┌────────────────────┐
│  Application    │    │      Data         │    │   Container Image   │
│      Tier       │    │      Tier         │    │      Registry       │
├─────────────────┤    ├───────────────────┤    ├────────────────────┤
│ Route 53        │    │ Aurora Serverless │    │ Amazon ECR         │
│ SSL Certificate │    │ v2 PostgreSQL     │    │ (ECR Stack)        │
│ Load Balancer   │    │ Secrets Manager   │    │                    │
│ ECS Fargate     │    │                   │    │                    │
└─────────────────┘    └───────────────────┘    └────────────────────┘
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
CDK_VPC_ID=vpc-xxxxxxxxxxxxxxxxx
CDK_HOSTED_ZONE_ID=Z1234567890ABC
CDK_HOSTED_ZONE_NAME=example.com
CDK_CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/...
CDK_DOMAIN_NAME=nestjs-playground-api
```

### Database Stack (`database.stack.ts`)

**Purpose**: Provides managed PostgreSQL database with automatic scaling.

**Key Resources**:

- **Aurora Serverless v2**: PostgreSQL 15.4 with 0.5-1 ACU capacity
- **Security Group**: Restricts access to port 5432 from application only
- **Subnet Group**: Database deployed in private subnets
- **Secrets Manager**: Automatic credential generation and rotation

**Cost Optimization Features**:

- Minimum capacity: 0.5 ACUs ($0.06/hour when active)
- Maximum capacity: 1 ACU ($0.12/hour when active)
- Automatic pausing when inactive (scale-to-zero capability)
- 7-day backup retention (minimum)

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
- **Task Definition**: Fargate task with 256 CPU, 512 MB memory
- **Service**: Maintains desired instance count with rolling deployments
- **Auto Scaling**: CPU-based scaling (70% threshold, 1-4 instances)
- **Application Load Balancer**: Internet-facing with HTTPS termination
- **Target Group**: Health checks on `/health` endpoint
- **Listeners**:
  - Port 443 (HTTPS): Routes to application
  - Port 80 (HTTP): Redirects to HTTPS
- **Security Groups**: Restrictive ingress/egress rules
- **Subnets**: Application deployed in private subnets with NAT Gateway access

## Deployment Process

### Prerequisites

1. **AWS Account Setup**:
   - AWS CLI configured with appropriate credentials
   - CDK bootstrap completed in target account/region

2. **Existing Resources**:
   - VPC with public and private subnets
   - Route 53 hosted zone
   - SSL certificate in ACM

3. **Local Environment**:
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

**Stack Dependency Diagram:**

```
Network Stack
   ↓
Database Stack
   ↓
ECR Stack
   ↓
Compute Stack
```

## Environment Management

### Environment Variables

All configuration uses environment variables prefixed with `CDK_`:

| Variable              | Purpose             | Example                 |
| --------------------- | ------------------- | ----------------------- |
| `CDK_ACCOUNT`         | AWS Account ID      | `123456789012`          |
| `CDK_REGION`          | AWS Region          | `us-east-1`             |
| `CDK_ENVIRONMENT`     | Environment name    | `dev`, `qa`, `prd`      |
| `CDK_VPC_ID`          | Existing VPC ID     | `vpc-0123456789abcdef0` |
| `CDK_HOSTED_ZONE_ID`  | Route 53 zone ID    | `Z1234567890ABC`        |
| `CDK_CERTIFICATE_ARN` | SSL certificate ARN | `arn:aws:acm:...`       |

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
3. **Secrets Management**: Database credentials in AWS Secrets Manager
4. **IAM Roles**: Least privilege access for ECS tasks

### Data Security

1. **Encryption at Rest**: Aurora Serverless v2 encryption enabled
2. **Encryption in Transit**: SSL connections to database
3. **Access Control**: Database security groups restrict access to application tier only
4. **Backup Encryption**: Automated backups encrypted

## Cost Optimization

### Database Costs

- **Aurora Serverless v2**: Pay-per-use with scale-to-zero capability
- **Minimum Configuration**: 0.5 ACU starting capacity
- **Short Backup Retention**: 7 days (minimum)
- **No Read Replicas**: Single writer instance for development

### Compute Costs

- **Fargate Pricing**: Pay only for running containers
- **Right-Sizing**: 256 CPU / 512 MB memory for development workloads
- **Auto Scaling**: Scale down to 1 instance during low usage
- **Log Retention**: 1-week retention for cost optimization

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

1. **Health Checks**: ALB health checks on `/health` endpoint
2. **Container Logs**: Centralized logging in CloudWatch
3. **Container Insights**: ECS cluster-level metrics
4. **Custom Metrics**: Application-specific metrics via CloudWatch

### Infrastructure Monitoring

1. **CloudWatch Alarms**: CPU, memory, and connection metrics
2. **AWS X-Ray**: Distributed tracing (optional)
3. **VPC Flow Logs**: Network traffic analysis (optional)

### Alerting Strategy

Set up alerts for:

- High CPU utilization (>80%)
- Database connection failures
- Application health check failures
- High error rates in logs

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
   - Confirm `/health` endpoint is responding
   - Check security group rules for ALB → ECS communication
   - Verify application is listening on correct port

### Debugging Commands

```bash
# Check stack status
aws cloudformation describe-stacks \
  --stack-name nestjs-playground-dev-compute

# View ECS service events
aws ecs describe-services \
  --cluster nestjs-playground-dev \
  --services nestjs-playground-dev

# Get recent logs
aws logs filter-log-events \
  --log-group-name /ecs/nestjs-playground-dev \
  --start-time $(date -d '1 hour ago' +%s)000
```

## Best Practices

### Development Workflow

1. **Local Testing**: Test infrastructure changes in development environment first
2. **Progressive Deployment**: Deploy to dev → qa → production
3. **Infrastructure Validation**: Use `cdk diff` before deployments
4. **Resource Cleanup**: Regularly destroy development environments to save costs

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

1. **Stack Separation**: Maintain logical separation between network, database, ECR, and compute
2. **Configuration Management**: Use environment variables for all environment-specific values
3. **Version Control**: Tag infrastructure releases for rollback capability
4. **Code Reviews**: Review all infrastructure changes before deployment

---

This infrastructure provides a solid foundation for the NestJS Playground application with built-in scalability, security, and cost optimization. Regular review and updates ensure the infrastructure continues to meet application requirements as it evolves.
