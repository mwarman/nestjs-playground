import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface DatabaseStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  databaseName: string;
  databaseUsername: string;
  appName: string;
  environment: string;
}

export class DatabaseStack extends cdk.Stack {
  public readonly cluster: rds.DatabaseCluster;
  public readonly secret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    // Create security group for the database
    const databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for Aurora Serverless v2 database',
      allowAllOutbound: false,
    });

    // Allow inbound connections from application on PostgreSQL port
    databaseSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL connections from application',
    );

    // Create database subnet group using private subnets
    const subnetGroup = new rds.SubnetGroup(this, 'DatabaseSubnetGroup', {
      vpc: props.vpc,
      description: 'Subnet group for Aurora Serverless v2',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    // Create Aurora Serverless v2 cluster
    this.cluster = new rds.DatabaseCluster(this, 'DatabaseCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_17_5,
      }),
      credentials: rds.Credentials.fromGeneratedSecret(props.databaseUsername, {
        secretName: `${props.appName}-${props.environment}-db-credentials`,
      }),
      writer: rds.ClusterInstance.serverlessV2('writer', {
        scaleWithWriter: true,
      }),
      readers: [
        // Cost optimization: no readers initially, can be added later if needed
      ],
      serverlessV2MinCapacity: 0.5, // Minimum ACUs for cost optimization
      serverlessV2MaxCapacity: 1, // Maximum ACUs for cost optimization
      vpc: props.vpc,
      securityGroups: [databaseSecurityGroup],
      subnetGroup,
      defaultDatabaseName: props.databaseName,
      // Cost optimization settings
      backup: {
        retention: props.environment === 'prd' ? cdk.Duration.days(7) : cdk.Duration.days(1), // Minimum backup retention
      },
      deletionProtection: props.environment === 'prd' ? true : false, // Allow deletion for dev environments
      removalPolicy: props.environment === 'prd' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY, // Allow destruction of resources
    });

    // Store reference to the generated secret
    this.secret = this.cluster.secret!;

    // Outputs
    new cdk.CfnOutput(this, 'DatabaseClusterEndpoint', {
      value: this.cluster.clusterEndpoint.hostname,
      description: 'Database cluster endpoint',
      exportName: `${props.appName}-${props.environment}-db-endpoint`,
    });

    new cdk.CfnOutput(this, 'DatabaseClusterPort', {
      value: this.cluster.clusterEndpoint.port.toString(),
      description: 'Database cluster port',
      exportName: `${props.appName}-${props.environment}-db-port`,
    });

    new cdk.CfnOutput(this, 'DatabaseName', {
      value: props.databaseName,
      description: 'Database name',
      exportName: `${props.appName}-${props.environment}-db-name`,
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.secret.secretArn,
      description: 'Database credentials secret ARN',
      exportName: `${props.appName}-${props.environment}-db-secret-arn`,
    });
  }
}
