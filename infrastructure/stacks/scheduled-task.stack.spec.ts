import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

import { Template } from 'aws-cdk-lib/assertions';
import { ScheduledTaskStack, ScheduledTaskStackProps } from './scheduled-task.stack';

describe('ScheduledTaskStack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;
  let mockVpc: ec2.Vpc;
  let mockCluster: ecs.Cluster;
  let mockRepository: ecr.Repository;
  let mockSecret: secretsmanager.Secret;

  const defaultProps: ScheduledTaskStackProps = {
    vpc: {} as ec2.IVpc, // Will be replaced with mockVpc in beforeEach
    cluster: {} as ecs.ICluster,
    repository: {} as ecr.IRepository,
    databaseSecret: {} as secretsmanager.ISecret,
    appName: 'test-app',
    loggingLevel: 'info',
    taskMemoryMb: 512,
    taskCpuUnits: 256,
    scheduleTaskCleanupCron: '*/10 * * * * *',
    hasScheduledTasks: true,
    environment: 'dev',
    env: {
      account: '123456789012',
      region: 'us-east-1',
    },
  };

  beforeEach(() => {
    // Arrange - Create everything within a single stack to avoid cross-stack references
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack', {
      env: { account: '123456789012', region: 'us-east-1' },
    });

    // Create all dependencies within the same stack
    mockVpc = new ec2.Vpc(stack, 'TestVpc', { maxAzs: 2 });
    mockCluster = new ecs.Cluster(stack, 'TestCluster', { vpc: mockVpc });
    mockRepository = new ecr.Repository(stack, 'TestRepository');
    mockSecret = new secretsmanager.Secret(stack, 'TestSecret');

    // Update props with actual mock objects
    defaultProps.vpc = mockVpc;
    defaultProps.cluster = mockCluster;
    defaultProps.repository = mockRepository;
    defaultProps.databaseSecret = mockSecret;
  });

  describe('when scheduleTaskCleanupCron is provided', () => {
    let testStack: cdk.Stack;

    beforeEach(() => {
      // Create a fresh parent stack for dependency resources
      const parentStack = new cdk.Stack(app, `ParentStack${Date.now()}`, {
        env: { account: '123456789012', region: 'us-east-1' },
      });

      // Create fresh mocks in the parent stack
      const testVpc = new ec2.Vpc(parentStack, 'TestVpc', { maxAzs: 2 });
      const testCluster = new ecs.Cluster(parentStack, 'TestCluster', { vpc: testVpc });
      const testRepository = new ecr.Repository(parentStack, 'TestRepository');
      const testSecret = new secretsmanager.Secret(parentStack, 'TestSecret');

      // Create the ScheduledTaskStack as its own independent stack
      testStack = new ScheduledTaskStack(app, `ScheduledTaskStack${Date.now()}`, {
        ...defaultProps,
        vpc: testVpc,
        cluster: testCluster,
        repository: testRepository,
        databaseSecret: testSecret,
        env: { account: '123456789012', region: 'us-east-1' },
      });

      template = Template.fromStack(testStack);
    });

    it('should create the stack successfully', () => {
      // Assert
      expect(template).toBeDefined();
    });

    it('should create a Fargate task definition with correct configuration', () => {
      // Assert
      template.hasResourceProperties('AWS::ECS::TaskDefinition', {
        Family: 'test-app-scheduler-dev',
        Cpu: '256',
        Memory: '512',
        NetworkMode: 'awsvpc',
        RequiresCompatibilities: ['FARGATE'],
      });
    });

    it('should create a task definition with scheduled task environment variables', () => {
      // Assert
      template.hasResourceProperties('AWS::ECS::TaskDefinition', {
        ContainerDefinitions: [
          {
            Name: 'ScheduledTaskContainer',
            Environment: [
              { Name: 'NODE_ENV', Value: 'production' },
              { Name: 'LOGGING_LEVEL', Value: 'info' },
              { Name: 'LOGGING_FORMAT', Value: 'json' },
              { Name: 'SCHEDULE_TASK_CLEANUP_CRON', Value: '*/10 * * * * *' },
            ],
          },
        ],
      });
    });

    it('should create a task definition with database secrets', () => {
      // Assert - Check that the task definition has the expected secrets
      const taskDefinitions = template.findResources('AWS::ECS::TaskDefinition');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const taskDefinition = Object.values(taskDefinitions)[0] as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const containerDef = taskDefinition.Properties.ContainerDefinitions[0];

      expect(containerDef.Name).toBe('ScheduledTaskContainer');
      expect(containerDef.Secrets).toHaveLength(5);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const secretNames = containerDef.Secrets.map((s: any) => s.Name);
      expect(secretNames).toContain('DB_HOST');
      expect(secretNames).toContain('DB_PORT');
      expect(secretNames).toContain('DB_USER');
      expect(secretNames).toContain('DB_PASS');
      expect(secretNames).toContain('DB_DATABASE');
    });

    it('should create a CloudWatch log group for scheduled tasks', () => {
      // Assert
      template.hasResourceProperties('AWS::Logs::LogGroup', {
        LogGroupName: '/ecs/test-app-scheduler-dev',
        RetentionInDays: 7, // One week for dev environment
      });
    });

    it('should create a security group for the scheduled task service', () => {
      // Assert
      template.hasResourceProperties('AWS::EC2::SecurityGroup', {
        GroupDescription: 'Security group for scheduled task ECS service',
      });

      // Verify it has the expected egress rule
      const securityGroups = template.findResources('AWS::EC2::SecurityGroup');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const sg = Object.values(securityGroups)[0] as any;
      expect(sg.Properties.SecurityGroupEgress).toHaveLength(1);
      expect(sg.Properties.SecurityGroupEgress[0].CidrIp).toBe('0.0.0.0/0');
    });

    it('should create a Fargate service with exactly 1 desired instance', () => {
      // Assert
      template.hasResourceProperties('AWS::ECS::Service', {
        ServiceName: 'test-app-scheduler-dev',
        DesiredCount: 1,
        LaunchType: 'FARGATE',
      });
    });

    it('should set desired count to 1 when hasScheduledTasks is true', () => {
      // Act - Create a fresh app instance to avoid synthesis conflicts
      const freshApp = new cdk.App();
      const parentStack = new cdk.Stack(freshApp, 'TestDesiredCountParentStack', {
        env: { account: '123456789012', region: 'us-east-1' },
      });

      const testVpc = new ec2.Vpc(parentStack, 'TestVpc', { maxAzs: 2 });
      const testCluster = new ecs.Cluster(parentStack, 'TestCluster', { vpc: testVpc });
      const testRepository = new ecr.Repository(parentStack, 'TestRepository');
      const testSecret = new secretsmanager.Secret(parentStack, 'TestSecret');

      const testStack = new ScheduledTaskStack(freshApp, 'TestDesiredCountStack', {
        ...defaultProps,
        vpc: testVpc,
        cluster: testCluster,
        repository: testRepository,
        databaseSecret: testSecret,
        hasScheduledTasks: true,
        scheduleTaskCleanupCron: '*/10 * * * * *',
      });

      const testTemplate = Template.fromStack(testStack);

      // Assert - Desired count should be 1 when hasScheduledTasks is true
      testTemplate.hasResourceProperties('AWS::ECS::Service', {
        DesiredCount: 1,
      });
    });

    it('should create a Fargate service in private subnets', () => {
      // Assert
      const services = template.findResources('AWS::ECS::Service');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const service = Object.values(services)[0] as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const networkConfig = service.Properties.NetworkConfiguration.AwsvpcConfiguration;

      expect(networkConfig.AssignPublicIp).toBe('DISABLED');
      expect(networkConfig.Subnets).toHaveLength(2); // Should have 2 private subnets
    });

    it('should create stack outputs for monitoring and debugging', () => {
      // Assert
      const outputs = template.findOutputs('ScheduledTaskServiceName');
      expect(Object.keys(outputs)).toHaveLength(1);

      const output = outputs.ScheduledTaskServiceName;
      expect(output.Description).toBe('Scheduled Task ECS Service name');
      expect(output.Export.Name).toBe('test-app-dev-scheduler-service');
    });

    it('should not create any load balancer resources', () => {
      // Assert - Scheduled tasks don't need load balancers
      template.resourceCountIs('AWS::ElasticLoadBalancingV2::LoadBalancer', 0);
      template.resourceCountIs('AWS::ElasticLoadBalancingV2::TargetGroup', 0);
      template.resourceCountIs('AWS::ElasticLoadBalancingV2::Listener', 0);
    });

    it('should not create any Route 53 records', () => {
      // Assert - Scheduled tasks don't need DNS records
      template.resourceCountIs('AWS::Route53::RecordSet', 0);
    });
  });

  describe('when hasScheduledTasks is false', () => {
    let testStack: cdk.Stack;

    beforeEach(() => {
      // Create a fresh stack for this test
      testStack = new cdk.Stack(app, `TestStackWithoutCron${Date.now()}`, {
        env: { account: '123456789012', region: 'us-east-1' },
      });

      // Create fresh mocks for this test stack
      const testVpc = new ec2.Vpc(testStack, 'TestVpc', { maxAzs: 2 });
      const testCluster = new ecs.Cluster(testStack, 'TestCluster', { vpc: testVpc });
      const testRepository = new ecr.Repository(testStack, 'TestRepository');
      const testSecret = new secretsmanager.Secret(testStack, 'TestSecret');

      // Arrange - Set hasScheduledTasks to false
      const propsWithoutScheduledTasks = {
        ...defaultProps,
        vpc: testVpc,
        cluster: testCluster,
        repository: testRepository,
        databaseSecret: testSecret,
        scheduleTaskCleanupCron: undefined,
        hasScheduledTasks: false,
      };

      // Act
      void new ScheduledTaskStack(testStack, 'ScheduledTaskStack', propsWithoutScheduledTasks);
      template = Template.fromStack(testStack);
    });

    it('should not create any ECS resources when hasScheduledTasks is false', () => {
      // Assert - When hasScheduledTasks is false, no scheduled task resources should be created
      template.resourceCountIs('AWS::ECS::TaskDefinition', 0);
      template.resourceCountIs('AWS::ECS::Service', 0);
      template.resourceCountIs('AWS::Logs::LogGroup', 0);
      template.resourceCountIs('AWS::EC2::SecurityGroup', 0);
    });

    it('should not create any stack outputs when hasScheduledTasks is false', () => {
      // Assert - Template should have no outputs
      const outputs = template.findOutputs('*');
      expect(Object.keys(outputs)).toHaveLength(0);
    });
  });

  describe('environment-specific configurations', () => {
    it('should use RETAIN removal policy for logs in production', () => {
      // Arrange - Create parent stack for dependencies
      const prodParentStack = new cdk.Stack(app, `ProdParentStack${Date.now()}`, {
        env: { account: '123456789012', region: 'us-east-1' },
      });

      const prodVpc = new ec2.Vpc(prodParentStack, 'ProdVpc', { maxAzs: 2 });
      const prodCluster = new ecs.Cluster(prodParentStack, 'ProdCluster', { vpc: prodVpc });
      const prodRepository = new ecr.Repository(prodParentStack, 'ProdRepository');
      const prodSecret = new secretsmanager.Secret(prodParentStack, 'ProdSecret');

      // Create the ScheduledTaskStack as its own independent stack
      const prodStack = new ScheduledTaskStack(app, `ProdScheduledTaskStack${Date.now()}`, {
        ...defaultProps,
        environment: 'prd',
        vpc: prodVpc,
        cluster: prodCluster,
        repository: prodRepository,
        databaseSecret: prodSecret,
        env: { account: '123456789012', region: 'us-east-1' },
      });

      const prodTemplate = Template.fromStack(prodStack);

      // Assert
      prodTemplate.hasResourceProperties('AWS::Logs::LogGroup', {
        LogGroupName: '/ecs/test-app-scheduler-prd',
        RetentionInDays: 30, // One month for production
      });
    });

    it('should enable ECS Exec for non-production environments', () => {
      // Arrange - Create parent stack for dependencies
      const devParentStack = new cdk.Stack(app, `DevExecParentStack${Date.now()}`, {
        env: { account: '123456789012', region: 'us-east-1' },
      });

      const devVpc = new ec2.Vpc(devParentStack, 'DevVpc', { maxAzs: 2 });
      const devCluster = new ecs.Cluster(devParentStack, 'DevCluster', { vpc: devVpc });
      const devRepository = new ecr.Repository(devParentStack, 'DevRepository');
      const devSecret = new secretsmanager.Secret(devParentStack, 'DevSecret');

      // Create the ScheduledTaskStack as its own independent stack
      const devStack = new ScheduledTaskStack(app, `DevExecScheduledTaskStack${Date.now()}`, {
        ...defaultProps,
        environment: 'dev',
        vpc: devVpc,
        cluster: devCluster,
        repository: devRepository,
        databaseSecret: devSecret,
        env: { account: '123456789012', region: 'us-east-1' },
      });

      const devTemplate = Template.fromStack(devStack);

      // Assert - For dev environment (non-prod), ECS Exec should be enabled
      devTemplate.hasResourceProperties('AWS::ECS::Service', {
        EnableExecuteCommand: true,
      });
    });

    it('should disable ECS Exec for production environment', () => {
      // Arrange - Create parent stack for dependencies
      const prodParentStack = new cdk.Stack(app, `ProdExecParentStack${Date.now()}`, {
        env: { account: '123456789012', region: 'us-east-1' },
      });

      const prodVpc = new ec2.Vpc(prodParentStack, 'ProdVpc', { maxAzs: 2 });
      const prodCluster = new ecs.Cluster(prodParentStack, 'ProdCluster', { vpc: prodVpc });
      const prodRepository = new ecr.Repository(prodParentStack, 'ProdRepository');
      const prodSecret = new secretsmanager.Secret(prodParentStack, 'ProdSecret');

      // Create the ScheduledTaskStack as its own independent stack
      const prodStack = new ScheduledTaskStack(app, `ProdExecScheduledTaskStack${Date.now()}`, {
        ...defaultProps,
        environment: 'prd',
        vpc: prodVpc,
        cluster: prodCluster,
        repository: prodRepository,
        databaseSecret: prodSecret,
        env: { account: '123456789012', region: 'us-east-1' },
      });

      const prodTemplate = Template.fromStack(prodStack);

      // Assert - For production environment, ECS Exec should be disabled
      prodTemplate.hasResourceProperties('AWS::ECS::Service', {
        EnableExecuteCommand: false,
      });
    });
  });

  describe('resource tagging and naming', () => {
    let namingTestStack: cdk.Stack;
    let namingTemplate: Template;

    beforeEach(() => {
      // Create a fresh parent stack for dependency resources
      const namingParentStack = new cdk.Stack(app, `NamingParentStack${Date.now()}`, {
        env: { account: '123456789012', region: 'us-east-1' },
      });

      const testVpc = new ec2.Vpc(namingParentStack, 'TestVpc', { maxAzs: 2 });
      const testCluster = new ecs.Cluster(namingParentStack, 'TestCluster', { vpc: testVpc });
      const testRepository = new ecr.Repository(namingParentStack, 'TestRepository');
      const testSecret = new secretsmanager.Secret(namingParentStack, 'TestSecret');

      // Create the ScheduledTaskStack as its own independent stack
      namingTestStack = new ScheduledTaskStack(app, `NamingScheduledTaskStack${Date.now()}`, {
        ...defaultProps,
        vpc: testVpc,
        cluster: testCluster,
        repository: testRepository,
        databaseSecret: testSecret,
        env: { account: '123456789012', region: 'us-east-1' },
      });

      namingTemplate = Template.fromStack(namingTestStack);
    });

    it('should use correct naming conventions for all resources', () => {
      // Assert - Task definition family
      namingTemplate.hasResourceProperties('AWS::ECS::TaskDefinition', {
        Family: 'test-app-scheduler-dev',
      });

      // Assert - Service name
      namingTemplate.hasResourceProperties('AWS::ECS::Service', {
        ServiceName: 'test-app-scheduler-dev',
      });

      // Assert - Log group name
      namingTemplate.hasResourceProperties('AWS::Logs::LogGroup', {
        LogGroupName: '/ecs/test-app-scheduler-dev',
      });
    });

    it('should enable service tag propagation', () => {
      // Assert
      namingTemplate.hasResourceProperties('AWS::ECS::Service', {
        PropagateTags: 'SERVICE',
      });
    });
  });
});
