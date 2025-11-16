#!/usr/bin/env node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';

import { loadConfiguration, getEnvironmentConfig, getCommonTags } from './utils/configuration';
import { NetworkStack } from './stacks/network.stack';
import { EcrStack } from './stacks/ecr.stack';
import { DatabaseStack } from './stacks/database.stack';
import { ComputeStack } from './stacks/compute.stack';
import { ScheduledTaskStack } from './stacks/scheduled-task.stack';

// Load and validate configuration
const config = loadConfiguration();
const env = getEnvironmentConfig(config);
const tags = getCommonTags(config);

// Create CDK app
const app = new cdk.App();

// Get appVersion from CDK context (passed via --context flag)
const appVersion = app.node.tryGetContext('appVersion') as string | undefined;

// Network Stack
const networkStack = new NetworkStack(app, `${config.CDK_APP_NAME}-network-${config.CDK_ENVIRONMENT}`, {
  description: 'Network stack for NestJS Playground',
  env,
  hostedZoneId: config.CDK_HOSTED_ZONE_ID,
  hostedZoneName: config.CDK_HOSTED_ZONE_NAME,
  certificateArn: config.CDK_CERTIFICATE_ARN,
  domainName: config.CDK_DOMAIN_NAME,
  appName: config.CDK_APP_NAME,
  environment: config.CDK_ENVIRONMENT,
});

// ECR Stack
const ecrStack = new EcrStack(app, `${config.CDK_APP_NAME}-ecr-${config.CDK_ENVIRONMENT}`, {
  description: 'ECR stack for NestJS Playground',
  env,
  appName: config.CDK_APP_NAME,
  environment: config.CDK_ENVIRONMENT,
});

// Database Stack
const databaseStack = new DatabaseStack(app, `${config.CDK_APP_NAME}-database-${config.CDK_ENVIRONMENT}`, {
  description: 'Database stack for NestJS Playground',
  env,
  vpc: networkStack.vpc,
  databaseName: config.CDK_DATABASE_NAME,
  databaseUsername: config.CDK_DATABASE_USERNAME,
  databaseMinCapacity: config.CDK_DATABASE_MIN_CAPACITY,
  databaseMaxCapacity: config.CDK_DATABASE_MAX_CAPACITY,
  databaseReadReplica: config.CDK_DATABASE_READ_REPLICA,
  appName: config.CDK_APP_NAME,
  environment: config.CDK_ENVIRONMENT,
});

// Compute Stack
const computeStack = new ComputeStack(app, `${config.CDK_APP_NAME}-compute-${config.CDK_ENVIRONMENT}`, {
  description: 'Compute stack for NestJS Playground',
  env,
  vpc: networkStack.vpc,
  repository: ecrStack.repository,
  databaseSecret: databaseStack.secret,
  databaseReadReplicaSecret: databaseStack.readReplicaSecret,
  hostedZone: networkStack.hostedZone,
  certificate: networkStack.certificate,
  fqdn: networkStack.fqdn,
  appName: config.CDK_APP_NAME,
  appPort: config.CDK_APP_PORT,
  loggingLevel: config.CDK_APP_LOGGING_LEVEL,
  corsAllowedOrigin: config.CDK_APP_CORS_ALLOWED_ORIGIN,
  jwtExpiresIn: config.CDK_APP_JWT_EXPIRES_IN,
  taskMemoryMb: config.CDK_TASK_MEMORY_MB,
  taskCpuUnits: config.CDK_TASK_CPU_UNITS,
  serviceDesiredCount: config.CDK_SERVICE_DESIRED_COUNT,
  serviceMinCapacity: config.CDK_SERVICE_MIN_CAPACITY,
  serviceMaxCapacity: config.CDK_SERVICE_MAX_CAPACITY,
  environment: config.CDK_ENVIRONMENT,
  appVersion,
});

// Scheduled Task Stack (always created but with 0 desired count when hasScheduledTasks is false)
const scheduledTaskStack = new ScheduledTaskStack(
  app,
  `${config.CDK_APP_NAME}-scheduled-task-${config.CDK_ENVIRONMENT}`,
  {
    description: 'Scheduled Task stack for NestJS Playground',
    env,
    vpc: networkStack.vpc,
    cluster: computeStack.cluster,
    repository: ecrStack.repository,
    databaseSecret: databaseStack.secret,
    databaseReadReplicaSecret: databaseStack.readReplicaSecret,
    appName: config.CDK_APP_NAME,
    loggingLevel: config.CDK_APP_LOGGING_LEVEL,
    taskMemoryMb: config.CDK_SCHEDULER_TASK_MEMORY_MB,
    taskCpuUnits: config.CDK_SCHEDULER_TASK_CPU_UNITS,
    scheduleTaskCleanupCron: config.CDK_SCHEDULE_TASK_CLEANUP_CRON,
    hasScheduledTasks: config.hasScheduledTasks,
    environment: config.CDK_ENVIRONMENT,
    appVersion,
  },
);

// Add dependencies
databaseStack.addDependency(networkStack);
computeStack.addDependency(networkStack);
computeStack.addDependency(ecrStack);
computeStack.addDependency(databaseStack);
scheduledTaskStack.addDependency(computeStack);
scheduledTaskStack.addDependency(databaseStack);

// Add tags to the app
Object.entries(tags).forEach(([key, value]) => {
  cdk.Tags.of(app).add(key, value);
});
