import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface ScheduledTaskStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  cluster: ecs.ICluster;
  repository: ecr.IRepository;
  databaseSecret: secretsmanager.ISecret;
  appName: string;
  loggingLevel: string;
  taskMemoryMb: number;
  taskCpuUnits: number;
  scheduleTaskCleanupCron?: string;
  hasScheduledTasks: boolean;
  environment: string;
}

export class ScheduledTaskStack extends cdk.Stack {
  public readonly service: ecs.FargateService;

  constructor(scope: Construct, id: string, props: ScheduledTaskStackProps) {
    super(scope, id, props);

    // Only create resources if scheduled tasks are enabled
    if (!props.hasScheduledTasks) {
      return;
    }

    // Create task definition for scheduled tasks
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'ScheduledTaskDefinition', {
      memoryLimitMiB: props.taskMemoryMb,
      cpu: props.taskCpuUnits,
      family: `${props.appName}-scheduler-${props.environment}`,
    });

    // Grant task access to database secret
    props.databaseSecret.grantRead(taskDefinition.taskRole);

    // Create log group for scheduled tasks
    const logGroup = new logs.LogGroup(this, 'ScheduledTaskLogGroup', {
      logGroupName: `/ecs/${props.appName}-scheduler-${props.environment}`,
      retention: props.environment === 'prd' ? logs.RetentionDays.ONE_MONTH : logs.RetentionDays.ONE_WEEK,
      removalPolicy: props.environment === 'prd' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Add container to task definition - same image but configured for scheduled tasks
    taskDefinition.addContainer('ScheduledTaskContainer', {
      image: ecs.ContainerImage.fromEcrRepository(props.repository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'ecs-scheduler',
        logGroup,
        mode: ecs.AwsLogDriverMode.NON_BLOCKING,
        maxBufferSize: cdk.Size.mebibytes(25),
      }),
      environment: {
        NODE_ENV: 'production',
        LOGGING_LEVEL: props.loggingLevel,
        LOGGING_FORMAT: 'json', // Enable JSON logging in the application
        // This environment variable tells the NestJS app to run scheduled tasks
        SCHEDULE_TASK_CLEANUP_CRON: props.scheduleTaskCleanupCron!, // Safe to use ! since hasScheduledTasks guarantees this exists
      },
      secrets: {
        DB_HOST: ecs.Secret.fromSecretsManager(props.databaseSecret, 'host'),
        DB_PORT: ecs.Secret.fromSecretsManager(props.databaseSecret, 'port'),
        DB_USER: ecs.Secret.fromSecretsManager(props.databaseSecret, 'username'),
        DB_PASS: ecs.Secret.fromSecretsManager(props.databaseSecret, 'password'),
        DB_DATABASE: ecs.Secret.fromSecretsManager(props.databaseSecret, 'dbname'),
      },
    });

    // No port mappings needed since this service doesn't receive HTTP requests

    // Create security group for scheduled task ECS service
    const scheduledTaskSecurityGroup = new ec2.SecurityGroup(this, 'ScheduledTaskSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for scheduled task ECS service',
      allowAllOutbound: true, // Needs outbound access for database and ECR
    });

    // Create ECS service for scheduled tasks
    // This service runs exactly 1 instance when hasScheduledTasks is true, otherwise 0
    this.service = new ecs.FargateService(this, 'ScheduledTaskService', {
      cluster: props.cluster,
      taskDefinition,
      serviceName: `${props.appName}-scheduler-${props.environment}`,
      securityGroups: [scheduledTaskSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      desiredCount: props.hasScheduledTasks ? 1 : 0, // 1 instance when scheduled tasks are enabled, 0 otherwise
      minHealthyPercent: 0, // Allow the service to be temporarily down during updates
      maxHealthyPercent: 200, // Allow up to 2 instances during updates
      propagateTags: ecs.PropagatedTagSource.SERVICE,
      enableExecuteCommand: props.environment !== 'prd', // Enable ECS Exec for debugging in non-prod
    });

    // Outputs
    new cdk.CfnOutput(this, 'ScheduledTaskServiceName', {
      value: this.service.serviceName,
      description: 'Scheduled Task ECS Service name',
      exportName: `${props.appName}-${props.environment}-scheduler-service`,
    });
  }
}
