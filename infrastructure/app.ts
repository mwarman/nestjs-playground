#!/usr/bin/env node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';

import { NetworkStack } from './stacks/network.stack';
import { EcrStack } from './stacks/ecr.stack';
import { DatabaseStack } from './stacks/database.stack';
import { ComputeStack } from './stacks/compute.stack';

// Environment configuration from environment variables
const appName = process.env.CDK_APP_NAME || 'nestjs-playground';
const appPort = parseInt(process.env.CDK_APP_PORT || '3000', 10);
const loggingLevel = process.env.CDK_APP_LOGGING_LEVEL || 'info';
const environment = process.env.CDK_ENVIRONMENT || 'dev';
const account = process.env.CDK_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_REGION || process.env.CDK_DEFAULT_REGION;

// Compute configuration
const taskMemoryMb = parseInt(process.env.CDK_TASK_MEMORY_MB || '512', 10);
const taskCpuUnits = parseInt(process.env.CDK_TASK_CPU_UNITS || '256', 10);
const serviceDesiredCount = parseInt(process.env.CDK_SERVICE_DESIRED_COUNT || '0', 10);
const serviceMinCapacity = parseInt(process.env.CDK_SERVICE_MIN_CAPACITY || '0', 10);
const serviceMaxCapacity = parseInt(process.env.CDK_SERVICE_MAX_CAPACITY || '4', 10);

// Database configuration
const databaseMinCapacity = parseFloat(process.env.CDK_DATABASE_MIN_CAPACITY || '0.5');
const databaseMaxCapacity = parseFloat(process.env.CDK_DATABASE_MAX_CAPACITY || '1');

// Validate required environment variables
const requiredEnvVars = ['CDK_HOSTED_ZONE_ID', 'CDK_HOSTED_ZONE_NAME', 'CDK_CERTIFICATE_ARN', 'CDK_DOMAIN_NAME'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}

// Environment configuration
const env = {
  account,
  region,
};

// Common tags for all resources
const tags = {
  App: process.env.CDK_TAG_APP || appName,
  Env: process.env.CDK_TAG_ENV || environment,
  OU: process.env.CDK_TAG_OU || 'engineering',
  Owner: process.env.CDK_TAG_OWNER || 'team@example.com',
};

// Create CDK app
const app = new cdk.App();

// Network Stack
const networkStack = new NetworkStack(app, `${appName}-network-${environment}`, {
  description: 'Network stack for NestJS Playground',
  env,
  hostedZoneId: process.env.CDK_HOSTED_ZONE_ID!,
  hostedZoneName: process.env.CDK_HOSTED_ZONE_NAME!,
  certificateArn: process.env.CDK_CERTIFICATE_ARN!,
  domainName: process.env.CDK_DOMAIN_NAME!,
  appName,
  environment,
});

// ECR Stack
const ecrStack = new EcrStack(app, `${appName}-ecr-${environment}`, {
  description: 'ECR stack for NestJS Playground',
  env,
  appName,
  environment,
});

// Database Stack
const databaseStack = new DatabaseStack(app, `${appName}-database-${environment}`, {
  description: 'Database stack for NestJS Playground',
  env,
  vpc: networkStack.vpc,
  databaseName: process.env.CDK_DATABASE_NAME || 'nestjs_playground',
  databaseUsername: process.env.CDK_DATABASE_USERNAME || 'postgres',
  databaseMinCapacity,
  databaseMaxCapacity,
  appName,
  environment,
});

// Compute Stack
const computeStack = new ComputeStack(app, `${appName}-compute-${environment}`, {
  description: 'Compute stack for NestJS Playground',
  env,
  vpc: networkStack.vpc,
  repository: ecrStack.repository,
  databaseSecret: databaseStack.secret,
  hostedZone: networkStack.hostedZone,
  certificate: networkStack.certificate,
  fqdn: networkStack.fqdn,
  appName,
  appPort,
  loggingLevel,
  taskMemoryMb,
  taskCpuUnits,
  serviceDesiredCount,
  serviceMinCapacity,
  serviceMaxCapacity,
  environment,
});

// Add dependencies
databaseStack.addDependency(networkStack);
computeStack.addDependency(networkStack);
computeStack.addDependency(ecrStack);
computeStack.addDependency(databaseStack);

// Add tags to the app
Object.entries(tags).forEach(([key, value]) => {
  cdk.Tags.of(app).add(key, value);
});
