import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface ComputeStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  repository: ecr.IRepository;
  databaseSecret: secretsmanager.ISecret;
  hostedZone: route53.IHostedZone;
  certificate: certificatemanager.ICertificate;
  fqdn: string;
  appName: string;
  appPort: number;
  loggingLevel: string;
  corsAllowedOrigin: string;
  taskMemoryMb: number;
  taskCpuUnits: number;
  serviceDesiredCount: number;
  serviceMinCapacity: number;
  serviceMaxCapacity: number;
  environment: string;
}

export class ComputeStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;
  public readonly service: ecs.FargateService;
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    // Create ECS cluster
    this.cluster = new ecs.Cluster(this, 'ApplicationCluster', {
      vpc: props.vpc,
      clusterName: `${props.appName}-${props.environment}`,
      containerInsightsV2: ecs.ContainerInsights.ENABLED,
    });

    // Create task definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'ApplicationTaskDefinition', {
      memoryLimitMiB: props.taskMemoryMb,
      cpu: props.taskCpuUnits,
      family: `${props.appName}-${props.environment}`,
    });

    // Grant task access to database secret
    props.databaseSecret.grantRead(taskDefinition.taskRole);

    // Create log group
    const logGroup = new logs.LogGroup(this, 'ApplicationLogGroup', {
      logGroupName: `/ecs/${props.appName}-${props.environment}`,
      retention: props.environment === 'prd' ? logs.RetentionDays.ONE_MONTH : logs.RetentionDays.ONE_WEEK, // Cost optimization
      removalPolicy: props.environment === 'prd' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Add container to task definition
    const container = taskDefinition.addContainer('ApplicationContainer', {
      image: ecs.ContainerImage.fromEcrRepository(props.repository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'ecs',
        logGroup,
        mode: ecs.AwsLogDriverMode.NON_BLOCKING,
        maxBufferSize: cdk.Size.mebibytes(25),
      }),
      environment: {
        NODE_ENV: 'production',
        APP_PORT: props.appPort.toString(),
        LOGGING_LEVEL: props.loggingLevel,
        LOGGING_FORMAT: 'json', // Enable JSON logging in the application
        CORS_ALLOWED_ORIGIN: props.corsAllowedOrigin,
      },
      secrets: {
        DB_HOST: ecs.Secret.fromSecretsManager(props.databaseSecret, 'host'),
        DB_PORT: ecs.Secret.fromSecretsManager(props.databaseSecret, 'port'),
        DB_USER: ecs.Secret.fromSecretsManager(props.databaseSecret, 'username'),
        DB_PASS: ecs.Secret.fromSecretsManager(props.databaseSecret, 'password'),
        DB_DATABASE: ecs.Secret.fromSecretsManager(props.databaseSecret, 'dbname'),
      },
    });

    // Add port mapping
    container.addPortMappings({
      containerPort: props.appPort,
      protocol: ecs.Protocol.TCP,
    });

    // Create security group for ALB
    const albSecurityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for Application Load Balancer',
      allowAllOutbound: true,
    });

    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic');

    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS traffic');

    // Create security group for ECS tasks
    const ecsSecurityGroup = new ec2.SecurityGroup(this, 'ECSSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for ECS tasks',
      allowAllOutbound: true,
    });

    ecsSecurityGroup.addIngressRule(albSecurityGroup, ec2.Port.tcp(props.appPort), 'Allow traffic from ALB');

    // Create Application Load Balancer
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
      loadBalancerName: `${props.appName}-${props.environment}-alb`,
    });

    // Create target group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'ApplicationTargetGroup', {
      vpc: props.vpc,
      port: props.appPort,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        enabled: true,
        path: '/health',
        protocol: elbv2.Protocol.HTTP,
        port: props.appPort.toString(),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 5,
        timeout: cdk.Duration.seconds(10),
        interval: cdk.Duration.seconds(30),
      },
    });

    // Add HTTPS listener
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const httpsListener = this.loadBalancer.addListener('HTTPSListener', {
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [props.certificate],
      defaultTargetGroups: [targetGroup],
    });

    // Add HTTP listener that redirects to HTTPS
    this.loadBalancer.addListener('HTTPListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    });

    // Create ECS service
    this.service = new ecs.FargateService(this, 'ApplicationService', {
      cluster: this.cluster,
      taskDefinition,
      serviceName: `${props.appName}-${props.environment}`,
      securityGroups: [ecsSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      desiredCount: props.serviceDesiredCount,
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      propagateTags: ecs.PropagatedTagSource.SERVICE,
    });

    // Attach service to target group
    this.service.attachToApplicationTargetGroup(targetGroup);

    // Configure auto scaling
    const scalableTarget = this.service.autoScaleTaskCount({
      minCapacity: props.serviceMinCapacity,
      maxCapacity: props.serviceMaxCapacity,
    });

    // Scale based on CPU utilization
    scalableTarget.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.minutes(5),
      scaleOutCooldown: cdk.Duration.minutes(1),
    });

    // Create Route 53 alias record
    new route53.ARecord(this, 'AliasRecord', {
      zone: props.hostedZone,
      recordName: props.fqdn,
      target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(this.loadBalancer)),
    });

    // Outputs
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: this.loadBalancer.loadBalancerDnsName,
      description: 'Application Load Balancer DNS name',
      exportName: `${props.appName}-${props.environment}-alb-dns`,
    });

    new cdk.CfnOutput(this, 'ApplicationURL', {
      value: `https://${props.fqdn}`,
      description: 'Application URL',
      exportName: `${props.appName}-${props.environment}-app-url`,
    });

    new cdk.CfnOutput(this, 'ECSClusterName', {
      value: this.cluster.clusterName,
      description: 'ECS Cluster name',
      exportName: `${props.appName}-${props.environment}-ecs-cluster`,
    });

    new cdk.CfnOutput(this, 'ECSServiceName', {
      value: this.service.serviceName,
      description: 'ECS Service name',
      exportName: `${props.appName}-${props.environment}-ecs-service`,
    });
  }
}
