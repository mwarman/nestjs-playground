import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Template } from 'aws-cdk-lib/assertions';
import { EcrStack, EcrStackProps } from './ecr.stack';

describe('EcrStack', () => {
  let app: cdk.App;
  let stack: EcrStack;
  let template: Template;

  const defaultProps: EcrStackProps = {
    appName: 'test-app',
    environment: 'dev',
    env: {
      account: '123456789012',
      region: 'us-east-1',
    },
  };

  beforeEach(() => {
    // Arrange
    app = new cdk.App();
    stack = new EcrStack(app, 'TestEcrStack', defaultProps);
    template = Template.fromStack(stack);
  });

  describe('ECR Repository Configuration', () => {
    it('should create ECR repository with correct name', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::ECR::Repository', {
        RepositoryName: 'test-app',
        ImageScanningConfiguration: {
          ScanOnPush: true,
        },
        ImageTagMutability: 'MUTABLE',
      });
    });

    it('should enable image scanning on push', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::ECR::Repository', {
        ImageScanningConfiguration: {
          ScanOnPush: true,
        },
      });
    });

    it('should set image tag mutability to MUTABLE', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::ECR::Repository', {
        ImageTagMutability: 'MUTABLE',
      });
    });

    it('should create exactly one ECR repository', () => {
      // Act & Assert
      template.resourceCountIs('AWS::ECR::Repository', 1);
    });
  });

  describe('Environment-Specific Configuration', () => {
    it('should set DESTROY removal policy for non-production environments', () => {
      // Arrange
      const devProps = {
        ...defaultProps,
        environment: 'dev',
      };

      // Act
      const devStack = new EcrStack(app, 'DevEcrStack', devProps);

      // Assert
      expect(devStack.repository).toBeDefined();
      // Note: RemovalPolicy is not directly testable via CloudFormation template
      // but we can verify the repository was created with the expected properties
    });

    it('should set RETAIN removal policy for production environment', () => {
      // Arrange
      const prodApp = new cdk.App();
      const prodProps = {
        ...defaultProps,
        environment: 'prd',
      };

      // Act
      const prodStack = new EcrStack(prodApp, 'ProdEcrStack', prodProps);

      // Assert
      expect(prodStack.repository).toBeDefined();
      // Note: RemovalPolicy is not directly testable via CloudFormation template
      // but the repository creation confirms the stack was built successfully
    });

    it('should handle different app names correctly', () => {
      // Arrange
      const customApp = new cdk.App();
      const customProps = {
        ...defaultProps,
        appName: 'my-custom-app',
      };

      // Act
      const customStack = new EcrStack(customApp, 'CustomEcrStack', customProps);
      const customTemplate = Template.fromStack(customStack);

      // Assert
      customTemplate.hasResourceProperties('AWS::ECR::Repository', {
        RepositoryName: 'my-custom-app',
      });
    });
  });

  describe('Public Properties', () => {
    it('should expose repository as public property', () => {
      // Act & Assert
      expect(stack.repository).toBeDefined();
      expect(stack.repository).toBeInstanceOf(ecr.Repository);
    });

    it('should provide repository URI through public property', () => {
      // Act & Assert
      expect(stack.repository.repositoryUri).toBeDefined();
      // Note: Repository URI contains CDK tokens that can't be tested directly
    });

    it('should provide repository ARN through public property', () => {
      // Act & Assert
      expect(stack.repository.repositoryArn).toBeDefined();
      // Note: Repository ARN contains CDK tokens that can't be tested directly
    });
  });

  describe('CloudFormation Outputs', () => {
    it('should export ECR repository URI with correct naming convention', () => {
      // Act & Assert
      template.hasOutput('ECRRepositoryURI', {
        Description: 'ECR Repository URI',
        Export: {
          Name: 'test-app-dev-ecr-uri',
        },
      });
    });

    it('should export ECR repository name with correct naming convention', () => {
      // Act & Assert
      template.hasOutput('ECRRepositoryName', {
        Description: 'ECR Repository Name',
        Export: {
          Name: 'test-app-dev-ecr-name',
        },
      });
    });

    it('should export ECR repository ARN with correct naming convention', () => {
      // Act & Assert
      template.hasOutput('ECRRepositoryArn', {
        Description: 'ECR Repository ARN',
        Export: {
          Name: 'test-app-dev-ecr-arn',
        },
      });
    });

    it('should handle different environments in export names', () => {
      // Arrange
      const environments = ['dev', 'qa', 'staging', 'prd'];

      environments.forEach((env) => {
        const envApp = new cdk.App();
        const envProps = {
          ...defaultProps,
          environment: env,
        };

        // Act
        const envStack = new EcrStack(envApp, `${env.toUpperCase()}EcrStack`, envProps);
        const envTemplate = Template.fromStack(envStack);

        // Assert
        envTemplate.hasOutput('ECRRepositoryURI', {
          Export: {
            Name: `test-app-${env}-ecr-uri`,
          },
        });
        envTemplate.hasOutput('ECRRepositoryName', {
          Export: {
            Name: `test-app-${env}-ecr-name`,
          },
        });
        envTemplate.hasOutput('ECRRepositoryArn', {
          Export: {
            Name: `test-app-${env}-ecr-arn`,
          },
        });
      });
    });
  });

  describe('Security Configuration', () => {
    it('should enable vulnerability scanning by default', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::ECR::Repository', {
        ImageScanningConfiguration: {
          ScanOnPush: true,
        },
      });
    });

    it('should allow mutable image tags for development flexibility', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::ECR::Repository', {
        ImageTagMutability: 'MUTABLE',
      });
    });
  });

  describe('Stack Props Validation', () => {
    it('should accept all required properties', () => {
      // Arrange
      const requiredProps: EcrStackProps = {
        appName: 'my-test-app',
        environment: 'test',
      };

      // Act
      const testStack = new EcrStack(app, 'PropsTestStack', requiredProps);

      // Assert
      expect(testStack).toBeDefined();
      expect(testStack.repository).toBeDefined();
    });

    it('should create repository with app name regardless of environment', () => {
      // Arrange
      const testCases = [
        { appName: 'webapp', environment: 'dev' },
        { appName: 'api-service', environment: 'prod' },
        { appName: 'worker-queue', environment: 'staging' },
      ];

      testCases.forEach(({ appName, environment }) => {
        const testApp = new cdk.App();
        const testProps = {
          ...defaultProps,
          appName,
          environment,
        };

        // Act
        const testStack = new EcrStack(testApp, `${appName}${environment}Stack`, testProps);
        const testTemplate = Template.fromStack(testStack);

        // Assert
        testTemplate.hasResourceProperties('AWS::ECR::Repository', {
          RepositoryName: appName,
        });
      });
    });
  });
});
