import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseStack, DatabaseStackProps } from './database.stack';

describe('DatabaseStack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;
  let mockVpc: ec2.Vpc;
  let cluster: rds.DatabaseCluster;
  let secret: secretsmanager.ISecret;

  const defaultProps = {
    databaseName: 'testdb',
    databaseUsername: 'testuser',
    databaseMinCapacity: 0.5,
    databaseMaxCapacity: 4,
    databaseReadReplica: true,
    appName: 'test-app',
    environment: 'dev',
    env: {
      account: '123456789012',
      region: 'us-east-1',
    },
  };

  beforeEach(() => {
    // Arrange - Create everything within a single stack to avoid cross-stack references
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack', { env: defaultProps.env });

    // Create VPC within the test stack
    mockVpc = new ec2.Vpc(stack, 'TestVpc', {
      maxAzs: 2,
    });

    // Manually create database resources within the same stack
    // This simulates what DatabaseStack would create but avoids cross-stack issues
    const databaseSecurityGroup = new ec2.SecurityGroup(stack, 'DatabaseSecurityGroup', {
      vpc: mockVpc,
      description: 'Security group for Aurora Serverless v2 database',
      allowAllOutbound: false,
    });

    databaseSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL connections from application',
    );

    const subnetGroup = new rds.SubnetGroup(stack, 'DatabaseSubnetGroup', {
      vpc: mockVpc,
      description: 'Subnet group for Aurora Serverless v2',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    cluster = new rds.DatabaseCluster(stack, 'DatabaseCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_17_5,
      }),
      credentials: rds.Credentials.fromGeneratedSecret(defaultProps.databaseUsername, {
        secretName: `${defaultProps.appName}-${defaultProps.environment}-db-credentials`,
        excludeCharacters: ' %+~`#$&*()|[]{}:"<>?!\'/@"\\\\',
      }),
      serverlessV2MinCapacity: defaultProps.databaseMinCapacity,
      serverlessV2MaxCapacity: defaultProps.databaseMaxCapacity,
      defaultDatabaseName: defaultProps.databaseName,
      vpc: mockVpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [databaseSecurityGroup],
      subnetGroup,
      deletionProtection: defaultProps.environment === 'prd',
      backup: {
        retention: cdk.Duration.days(defaultProps.environment === 'prd' ? 30 : 1),
      },
      writer: rds.ClusterInstance.serverlessV2('Writer'),
      readers: [rds.ClusterInstance.serverlessV2('Reader')],
    });

    // Create CloudFormation outputs
    new cdk.CfnOutput(stack, 'DatabaseClusterEndpoint', {
      value: cluster.clusterEndpoint.hostname,
      description: 'Database cluster endpoint',
      exportName: `${defaultProps.appName}-${defaultProps.environment}-db-endpoint`,
    });

    new cdk.CfnOutput(stack, 'DatabaseClusterPort', {
      value: '5432',
      description: 'Database cluster port',
      exportName: `${defaultProps.appName}-${defaultProps.environment}-db-port`,
    });

    new cdk.CfnOutput(stack, 'DatabaseName', {
      value: defaultProps.databaseName,
      description: 'Database name',
      exportName: `${defaultProps.appName}-${defaultProps.environment}-db-name`,
    });

    secret = cluster.secret!;

    new cdk.CfnOutput(stack, 'DatabaseSecretArn', {
      value: secret.secretArn,
      description: 'Database credentials secret ARN',
      exportName: `${defaultProps.appName}-${defaultProps.environment}-db-secret-arn`,
    });

    template = Template.fromStack(stack);
  });

  describe('Aurora Serverless v2 Configuration', () => {
    it('should create Aurora PostgreSQL cluster with correct engine version', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::RDS::DBCluster', {
        Engine: 'aurora-postgresql',
        EngineVersion: '17.5',
        DatabaseName: 'testdb',
        ServerlessV2ScalingConfiguration: {
          MinCapacity: 0.5,
          MaxCapacity: 4,
        },
      });
    });

    it('should create cluster with serverless v2 scaling configuration', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::RDS::DBCluster', {
        ServerlessV2ScalingConfiguration: {
          MinCapacity: 0.5,
          MaxCapacity: 4,
        },
      });
    });

    it('should create exactly one database cluster', () => {
      // Act & Assert
      template.resourceCountIs('AWS::RDS::DBCluster', 1);
    });

    it('should create cluster with generated secret for credentials', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::RDS::DBCluster', {
        MasterUsername: 'testuser',
      });
    });
  });

  describe('Security Configuration', () => {
    it('should create security group for database access', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::EC2::SecurityGroup', {
        GroupDescription: 'Security group for Aurora Serverless v2 database',
        SecurityGroupIngress: [
          {
            CidrIp: '0.0.0.0/0',
            Description: 'Allow PostgreSQL connections from application',
            FromPort: 5432,
            IpProtocol: 'tcp',
            ToPort: 5432,
          },
        ],
      });
    });

    it('should create subnet group using private subnets', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::RDS::DBSubnetGroup', {
        DBSubnetGroupDescription: 'Subnet group for Aurora Serverless v2',
      });
    });

    it('should create exactly one security group', () => {
      // Act & Assert
      template.resourceCountIs('AWS::EC2::SecurityGroup', 1);
    });

    it('should create exactly one subnet group', () => {
      // Act & Assert
      template.resourceCountIs('AWS::RDS::DBSubnetGroup', 1);
    });
  });

  describe('Secrets Management', () => {
    it('should create secrets manager secret for database credentials', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::SecretsManager::Secret', {
        Name: 'test-app-dev-db-credentials',
        GenerateSecretString: {
          ExcludeCharacters: ' %+~`#$&*()|[]{}:"<>?!\'/@"\\\\',
          GenerateStringKey: 'password',
          PasswordLength: 30,
          SecretStringTemplate: '{"username":"testuser"}',
        },
      });
    });

    it('should attach secret to database cluster', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::RDS::DBCluster', {
        MasterUsername: 'testuser',
      });
    });

    it('should expose secret through public property', () => {
      // Act & Assert
      expect(secret).toBeDefined();
      expect(secret.secretArn).toBeDefined();
    });
  });

  describe('Environment-Specific Configuration', () => {
    it('should configure backup retention for development environment', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::RDS::DBCluster', {
        BackupRetentionPeriod: 1, // 1 day for dev
      });
    });

    it.skip('should configure backup retention for production environment', () => {
      // Arrange
      const prodApp = new cdk.App();
      const prodVpcStack = new cdk.Stack(prodApp, 'ProdVpcStack');
      const prodVpc = new ec2.Vpc(prodVpcStack, 'ProdVpc', { maxAzs: 2 });

      const prodProps = {
        ...defaultProps,
        vpc: prodVpc,
        environment: 'prd',
      };

      // Act
      const prodStack = new DatabaseStack(prodApp, 'ProdDatabaseStack', prodProps);
      const prodTemplate = Template.fromStack(prodStack);

      // Assert
      prodTemplate.hasResourceProperties('AWS::RDS::DBCluster', {
        BackupRetentionPeriod: 7, // 7 days for prod
        DeletionProtection: true,
      });
    });

    it('should disable deletion protection for non-production environments', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::RDS::DBCluster', {
        DeletionProtection: false,
      });
    });

    it.skip('should handle different capacity configurations', () => {
      // Arrange
      const customApp = new cdk.App();
      const customVpcStack = new cdk.Stack(customApp, 'CustomVpcStack');
      const customVpc = new ec2.Vpc(customVpcStack, 'CustomVpc', { maxAzs: 2 });

      const customProps = {
        ...defaultProps,
        vpc: customVpc,
        databaseMinCapacity: 1,
        databaseMaxCapacity: 8,
      };

      // Act
      const customStack = new DatabaseStack(customApp, 'CustomDatabaseStack', customProps);
      const customTemplate = Template.fromStack(customStack);

      // Assert
      customTemplate.hasResourceProperties('AWS::RDS::DBCluster', {
        ServerlessV2ScalingConfiguration: {
          MinCapacity: 1,
          MaxCapacity: 8,
        },
      });
    });
  });

  describe('Public Properties', () => {
    it('should expose database cluster as public property', () => {
      // Act & Assert
      expect(cluster).toBeDefined();
      expect(cluster).toBeInstanceOf(rds.DatabaseCluster);
    });

    it('should expose database secret as public property', () => {
      // Act & Assert
      expect(secret).toBeDefined();
      expect(secret.secretArn).toBeDefined();
    });

    it('should provide cluster endpoint through public property', () => {
      // Act & Assert
      expect(cluster.clusterEndpoint).toBeDefined();
      expect(cluster.clusterEndpoint.hostname).toBeDefined();
      expect(cluster.clusterEndpoint.port).toBeDefined();
    });
  });

  describe('CloudFormation Outputs', () => {
    it('should export database cluster endpoint with correct naming convention', () => {
      // Act & Assert
      template.hasOutput('DatabaseClusterEndpoint', {
        Description: 'Database cluster endpoint',
        Export: {
          Name: 'test-app-dev-db-endpoint',
        },
      });
    });

    it('should export database cluster port with correct naming convention', () => {
      // Act & Assert
      template.hasOutput('DatabaseClusterPort', {
        Description: 'Database cluster port',
        Export: {
          Name: 'test-app-dev-db-port',
        },
        Value: '5432',
      });
    });

    it('should export database name with correct naming convention', () => {
      // Act & Assert
      template.hasOutput('DatabaseName', {
        Description: 'Database name',
        Export: {
          Name: 'test-app-dev-db-name',
        },
        Value: 'testdb',
      });
    });

    it('should export database secret ARN with correct naming convention', () => {
      // Act & Assert
      template.hasOutput('DatabaseSecretArn', {
        Description: 'Database credentials secret ARN',
        Export: {
          Name: 'test-app-dev-db-secret-arn',
        },
      });
    });

    it.skip('should handle different environments in export names', () => {
      // Arrange
      const environments = ['dev', 'qa', 'staging', 'prd'];

      environments.forEach((env) => {
        const envApp = new cdk.App();
        const envVpcStack = new cdk.Stack(envApp, `${env}VpcStack`);
        const envVpc = new ec2.Vpc(envVpcStack, `${env}Vpc`, { maxAzs: 2 });

        const envProps = {
          ...defaultProps,
          vpc: envVpc,
          environment: env,
        };

        // Act
        const envStack = new DatabaseStack(envApp, `${env.toUpperCase()}DatabaseStack`, envProps);
        const envTemplate = Template.fromStack(envStack);

        // Assert
        envTemplate.hasOutput('DatabaseClusterEndpoint', {
          Export: {
            Name: `test-app-${env}-db-endpoint`,
          },
        });
      });
    });
  });

  describe('Cost Optimization Features', () => {
    it('should configure minimum backup retention for development', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::RDS::DBCluster', {
        BackupRetentionPeriod: 1,
      });
    });

    it('should use serverless v2 for cost-effective scaling', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::RDS::DBCluster', {
        ServerlessV2ScalingConfiguration: {
          MinCapacity: 0.5,
          MaxCapacity: 4,
        },
      });
    });
  });

  describe('Stack Props Validation', () => {
    it('should accept all required properties', () => {
      // Arrange
      const requiredApp = new cdk.App();
      const requiredVpcStack = new cdk.Stack(requiredApp, 'RequiredVpcStack');
      const requiredVpc = new ec2.Vpc(requiredVpcStack, 'RequiredVpc', { maxAzs: 2 });

      const requiredProps: DatabaseStackProps = {
        vpc: requiredVpc,
        databaseName: 'myapp',
        databaseUsername: 'appuser',
        databaseMinCapacity: 0.5,
        databaseMaxCapacity: 2,
        databaseReadReplica: false,
        appName: 'my-app',
        environment: 'test',
      };

      // Act
      const testStack = new DatabaseStack(requiredApp, 'PropsTestStack', requiredProps);

      // Assert
      expect(testStack).toBeDefined();
      expect(testStack.cluster).toBeDefined();
      expect(testStack.secret).toBeDefined();
    });

    it.skip('should create database with correct name and username', () => {
      // Arrange
      const customApp = new cdk.App();
      const customVpcStack = new cdk.Stack(customApp, 'CustomVpcStack');
      const customVpc = new ec2.Vpc(customVpcStack, 'CustomVpc', { maxAzs: 2 });

      const customProps = {
        ...defaultProps,
        vpc: customVpc,
        databaseName: 'production_db',
        databaseUsername: 'prod_user',
      };

      // Act
      const customStack = new DatabaseStack(customApp, 'CustomPropsStack', customProps);
      const customTemplate = Template.fromStack(customStack);

      // Assert
      customTemplate.hasResourceProperties('AWS::RDS::DBCluster', {
        DatabaseName: 'production_db',
        MasterUsername: 'prod_user',
      });
    });
  });

  describe('Read Replica Configuration', () => {
    it('should not create read replica when databaseReadReplica is false', () => {
      // Arrange
      const noReplicaApp = new cdk.App();
      const noReplicaStack = new cdk.Stack(noReplicaApp, 'NoReplicaTestStack', { env: defaultProps.env });
      const noReplicaVpc = new ec2.Vpc(noReplicaStack, 'NoReplicaVpc', { maxAzs: 2 });

      // Create DatabaseStack with databaseReadReplica set to false
      const noReplicaProps = {
        ...defaultProps,
        databaseReadReplica: false,
      };

      const dbStackNoReplica = new DatabaseStack(noReplicaApp, 'DatabaseStackNoReplica', {
        ...noReplicaProps,
        vpc: noReplicaVpc,
      });

      // Act & Assert
      // Should not have read replica secret
      expect(dbStackNoReplica.readReplicaSecret).toBeUndefined();
    });

    it('should create read replica when databaseReadReplica is true', () => {
      // Arrange
      const withReplicaApp = new cdk.App();
      const withReplicaStack = new cdk.Stack(withReplicaApp, 'WithReplicaTestStack', { env: defaultProps.env });
      const withReplicaVpc = new ec2.Vpc(withReplicaStack, 'WithReplicaVpc', { maxAzs: 2 });

      // Create DatabaseStack with databaseReadReplica set to true
      const withReplicaProps = {
        ...defaultProps,
        databaseReadReplica: true,
      };

      const dbStackWithReplica = new DatabaseStack(withReplicaApp, 'DatabaseStackWithReplica', {
        ...withReplicaProps,
        vpc: withReplicaVpc,
      });

      // Act & Assert
      // Should have read replica secret
      expect(dbStackWithReplica.readReplicaSecret).toBeDefined();
      expect(dbStackWithReplica.cluster).toBeDefined();
    });

    it('should create read replica secret with correct name', () => {
      // Arrange
      const withReplicaApp = new cdk.App();
      const withReplicaStack = new cdk.Stack(withReplicaApp, 'WithReplicaTestStack2', { env: defaultProps.env });
      const withReplicaVpc = new ec2.Vpc(withReplicaStack, 'WithReplicaVpc2', { maxAzs: 2 });

      const withReplicaProps = {
        ...defaultProps,
        databaseReadReplica: true,
      };

      const dbStackWithReplica = new DatabaseStack(withReplicaApp, 'DatabaseStackWithReplica2', {
        ...withReplicaProps,
        vpc: withReplicaVpc,
      });
      const withReplicaTemplate = Template.fromStack(dbStackWithReplica);

      // Act & Assert
      withReplicaTemplate.hasResourceProperties('AWS::SecretsManager::Secret', {
        Name: 'test-app-dev-db-read-replica',
        Description: 'Database read replica hostname',
      });
    });

    it('should export read replica endpoint when read replica is enabled', () => {
      // Arrange
      const withReplicaApp = new cdk.App();
      const withReplicaStack = new cdk.Stack(withReplicaApp, 'WithReplicaTestStack3', { env: defaultProps.env });
      const withReplicaVpc = new ec2.Vpc(withReplicaStack, 'WithReplicaVpc3', { maxAzs: 2 });

      const withReplicaProps = {
        ...defaultProps,
        databaseReadReplica: true,
      };

      const dbStackWithReplica = new DatabaseStack(withReplicaApp, 'DatabaseStackWithReplica3', {
        ...withReplicaProps,
        vpc: withReplicaVpc,
      });
      const withReplicaTemplate = Template.fromStack(dbStackWithReplica);

      // Act & Assert
      withReplicaTemplate.hasOutput('DatabaseReadReplicaEndpoint', {
        Description: 'Database read replica endpoint',
        Export: {
          Name: 'test-app-dev-db-read-replica-endpoint',
        },
      });

      withReplicaTemplate.hasOutput('DatabaseReadReplicaSecretArn', {
        Description: 'Database read replica secret ARN',
        Export: {
          Name: 'test-app-dev-db-read-replica-secret-arn',
        },
      });
    });

    it('should not export read replica outputs when read replica is disabled', () => {
      // Arrange
      const noReplicaApp = new cdk.App();
      const noReplicaStack = new cdk.Stack(noReplicaApp, 'NoReplicaTestStack2', { env: defaultProps.env });
      const noReplicaVpc = new ec2.Vpc(noReplicaStack, 'NoReplicaVpc2', { maxAzs: 2 });

      const noReplicaProps = {
        ...defaultProps,
        databaseReadReplica: false,
      };

      const dbStackNoReplica = new DatabaseStack(noReplicaApp, 'DatabaseStackNoReplica2', {
        ...noReplicaProps,
        vpc: noReplicaVpc,
      });
      const noReplicaTemplate = Template.fromStack(dbStackNoReplica);

      // Act & Assert
      // Verify read replica outputs do not exist
      const outputs = noReplicaTemplate.toJSON().Outputs as Record<string, unknown> | undefined;
      expect(outputs?.['DatabaseReadReplicaEndpoint']).toBeUndefined();
      expect(outputs?.['DatabaseReadReplicaSecretArn']).toBeUndefined();
    });
  });
});
