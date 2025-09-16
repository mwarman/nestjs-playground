import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export interface EcrStackProps extends cdk.StackProps {
  appName: string;
  environment: string;
}

export class EcrStack extends cdk.Stack {
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props: EcrStackProps) {
    super(scope, id, props);

    // Create ECR repository for application images
    this.repository = new ecr.Repository(this, 'ApplicationRepository', {
      repositoryName: props.appName,
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.MUTABLE,
      removalPolicy: props.environment === 'prd' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY, // In non-prod, allow deletion of the repo when stack is destroyed
    });

    // Outputs
    new cdk.CfnOutput(this, 'ECRRepositoryURI', {
      value: this.repository.repositoryUri,
      description: 'ECR Repository URI',
      exportName: `${props.appName}-${props.environment}-ecr-uri`,
    });

    new cdk.CfnOutput(this, 'ECRRepositoryName', {
      value: this.repository.repositoryName,
      description: 'ECR Repository Name',
      exportName: `${props.appName}-${props.environment}-ecr-name`,
    });

    new cdk.CfnOutput(this, 'ECRRepositoryArn', {
      value: this.repository.repositoryArn,
      description: 'ECR Repository ARN',
      exportName: `${props.appName}-${props.environment}-ecr-arn`,
    });
  }
}
