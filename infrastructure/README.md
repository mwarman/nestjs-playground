# NestJS Playground Infrastructure

This directory contains the AWS CDK infrastructure code for the NestJS Playground application. The infrastructure is defined using TypeScript and AWS CDK v2, providing Infrastructure as Code (IaC) for deploying the application to AWS.

## Directory Structure

```
infrastructure/
├── app.ts                      # CDK app entry point
├── cdk.json                   # CDK configuration
├── package.json               # NPM dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── .env.example               # Example environment variables
├── .env                       # Environment variables (create from .env.example)
├── README.md                  # This file
└── stacks/                    # CDK stack definitions
   ├── network.stack.ts       # Network infrastructure (VPC, Route 53, SSL)
   ├── database.stack.ts      # Database infrastructure (Aurora Serverless v2)
   ├── compute.stack.ts       # Compute infrastructure (ECS, ALB)
   ├── ecr.stack.ts           # ECR repository stack (container registry)
   └── scheduled-task.stack.ts # Scheduled task infrastructure (optional)
```

## Architecture Overview

The infrastructure is organized into five logical stacks:

### 1. Network Stack (`network.stack.ts`)

- **VPC**: Uses an existing VPC specified by `CDK_VPC_ID`
- **Route 53**: Uses an existing hosted zone for DNS management
- **SSL Certificate**: Uses an existing ACM certificate for HTTPS
- **Domain**: Creates an alias record for the application

### 2. Database Stack (`database.stack.ts`)

- **Aurora Serverless v2**: PostgreSQL database with cost optimization
- **Security**: Database security group with restricted access
- **Secrets**: Managed database credentials in AWS Secrets Manager
- **Networking**: Deployed in private subnets

### 3. ECR Stack (`ecr.stack.ts`)

- **ECR Repository**: Creates and manages an Amazon ECR repository for application container images
- **Image Scanning**: Enables image scan on push for vulnerability detection
- **Tag Mutability**: Allows mutable image tags
- **Removal Policy**: Retains repository in production, destroys in non-prod environments
- **Outputs**: Exports repository URI, name, and ARN for use in other stacks

### 4. Compute Stack (`compute.stack.ts`)

- **ECS Fargate**: Serverless container hosting
- **Application Load Balancer**: HTTP/HTTPS load balancing with health checks
- **Auto Scaling**: CPU-based scaling (1-4 instances, 70% CPU threshold)
- **Route 53**: DNS alias record pointing to the load balancer

### 5. Scheduled Task Stack (`scheduled-task.stack.ts`)

- **Conditional Deployment**: Only creates resources when `CDK_SCHEDULE_TASK_CLEANUP_CRON` is configured
- **ECS Fargate Service**: Dedicated service for running scheduled tasks (1 instance)
- **No Load Balancer**: Service doesn't receive HTTP requests, only runs scheduled processes
- **Automatic Restart**: ECS service ensures the instance restarts if it fails
- **Isolated Logging**: Separate CloudWatch log group for scheduled task logs
- **Database Access**: Same database credentials as the main application

## Prerequisites

Before deploying the infrastructure, ensure you have:

1. **AWS CLI** configured with appropriate credentials
2. **Node.js** (version specified in `.nvmrc` in the root directory)
3. **AWS CDK** installed globally (`npm install -g aws-cdk`)
4. **Environment variables** configured (see Configuration section)

## Configuration

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your specific values:

   ```bash
   # Required variables
   CDK_ACCOUNT=123456789012          # Your AWS account ID
   CDK_REGION=us-east-1              # AWS region
   CDK_ENVIRONMENT=dev               # Environment (dev, qa, prd)
   CDK_VPC_ID=vpc-xxxxxxxxxxxxxxxxx  # Existing VPC ID
   CDK_HOSTED_ZONE_ID=Z1234567890ABC # Existing Route 53 hosted zone ID
   CDK_HOSTED_ZONE_NAME=example.com  # Hosted zone domain name
   CDK_CERTIFICATE_ARN=arn:aws:acm:... # Existing SSL certificate ARN
   CDK_DOMAIN_NAME=nestjs-playground-api # Subdomain for the application

   # Optional: Scheduled Task Configuration
   CDK_SCHEDULE_TASK_CLEANUP_CRON=*/10 * * * * * # Cron expression for task cleanup
   ```

All environment variables are prefixed with `CDK_` and documented in `.env.example`.

### Scheduled Task Configuration

The scheduled task infrastructure is optional and controlled by the `CDK_SCHEDULE_TASK_CLEANUP_CRON` environment variable:

- **When configured**: Creates a dedicated ECS service that runs exactly 1 instance for scheduled tasks
- **When not configured**: Skips scheduled task stack creation entirely
- **Cron format**: Uses 6-field cron expressions (second minute hour day month weekday)
- **Examples**:
  - `*/10 * * * * *` - Every 10 seconds
  - `0 * * * * *` - Every minute
  - `0 0 * * * *` - Every hour
  - `0 0 0 * * *` - Every day at midnight

The scheduled task service:

- Runs the same application image as the main service
- Has access to the same database
- Logs to a separate CloudWatch log group (`/ecs/app-scheduler-env`)
- Automatically restarts if the instance fails
- Does not receive HTTP traffic (no load balancer)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Infrastructure Code

```bash
npm run build
```

### 3. Bootstrap CDK (First Time Only)

```bash
npm run bootstrap
```

### 4. Synthesize CloudFormation Templates

```bash
npm run synth
```

### 5. Deploy Infrastructure

```bash
npm run deploy
```

### 6. Verify Deployment

Check the AWS Console for created resources and test the application URL.

## Available Scripts

| Script              | Description                                        |
| ------------------- | -------------------------------------------------- |
| `npm run build`     | Compile TypeScript to JavaScript                   |
| `npm run watch`     | Watch for changes and auto-compile                 |
| `npm run test`      | Run Jest tests                                     |
| `npm run bootstrap` | Bootstrap CDK in your AWS account/region           |
| `npm run synth`     | Synthesize CloudFormation templates                |
| `npm run deploy`    | Deploy all stacks                                  |
| `npm run destroy`   | Destroy all stacks                                 |
| `npm run diff`      | Show differences between deployed and local stacks |

## Stack Dependencies

The stacks have the following dependencies:

```
Network Stack
   ↓
Database Stack
   ↓
ECR Stack
   ↓
Compute Stack
   ↓
Scheduled Task Stack (optional)
```

- **Database Stack** depends on Network Stack (for VPC)
- **ECR Stack** is independent but typically referenced by Compute Stack for container images
- **Compute Stack** depends on Network Stack (for VPC, DNS), Database Stack (for database connection), and ECR Stack (for container image repository)
- **Scheduled Task Stack** depends on Compute Stack (for ECS cluster), Database Stack (for database connection), and ECR Stack (for container image repository)

## Cost Optimization Features

The infrastructure is designed with cost optimization in mind:

### Database

- Aurora Serverless v2 with minimal capacity (0.5-1 ACU)
- 7-day backup retention
- Minimal monitoring interval
- No read replicas initially

### Compute

- Fargate with minimal CPU/memory allocation (256 CPU, 512 MB)
- 1-week log retention
- Cost-optimized autoscaling (1-4 instances)

### Scheduled Tasks

- Single instance only (no autoscaling)
- Same minimal resource allocation as main service
- Conditional deployment (only when needed)
- Separate log group with same retention policy

### Networking

- Uses existing VPC and certificates (no additional charges)
- Minimal ALB configuration

## Security Considerations

- Database deployed in private subnets
- Security groups restrict access between components
- Database credentials stored in AWS Secrets Manager
- HTTPS-only traffic with automatic HTTP → HTTPS redirection
- Container images scanned for vulnerabilities

## Monitoring and Logging

- ECS container logs sent to CloudWatch
- Application Load Balancer access logs
- Container insights enabled on ECS cluster
- Health checks configured for application endpoint (`/v1/health`)

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Ensure all required variables in `.env.example` are set in `.env`
   - Check for typos in variable names

2. **VPC Not Found**
   - Verify `CDK_VPC_ID` exists in the specified region
   - Ensure AWS credentials have permission to access the VPC

3. **Hosted Zone Issues**
   - Confirm `CDK_HOSTED_ZONE_ID` and `CDK_HOSTED_ZONE_NAME` match
   - Verify hosted zone exists in your AWS account

4. **Certificate Problems**
   - Ensure `CDK_CERTIFICATE_ARN` is valid and in the correct region
   - Certificate must cover the domain specified in `CDK_DOMAIN_NAME`

5. **Scheduled Task Issues**
   - If scheduled tasks aren't running, check the cron expression format (6 fields)
   - Verify `CDK_SCHEDULE_TASK_CLEANUP_CRON` is set correctly
   - Check CloudWatch logs for the scheduled task service
   - Ensure the scheduled task service is running in ECS console

### Debugging Commands

```bash
# Check synthesized templates
npm run synth

# Compare with deployed infrastructure
npm run diff

# Validate environment variables
node -e "require('dotenv').config(); console.log(process.env.CDK_VPC_ID)"
```

## Cleanup

To destroy all infrastructure:

```bash
npm run destroy
```

**Warning**: This will permanently delete all resources created by the stacks. Ensure you have backups of any important data.

## Support

For issues specific to this infrastructure:

1. Check the troubleshooting section above
2. Review AWS CloudFormation events in the AWS Console
3. Check CDK deployment logs
4. Refer to the Infrastructure Guide in `/docs` for more detailed information
