import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { NetworkStack, NetworkStackProps } from './network.stack';

describe('NetworkStack', () => {
  let app: cdk.App;
  let stack: NetworkStack;
  let template: Template;

  const defaultProps: NetworkStackProps = {
    hostedZoneId: 'Z1234567890ABC',
    hostedZoneName: 'example.com',
    certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012',
    domainName: 'api',
    appName: 'test-app',
    environment: 'test',
    env: {
      account: '123456789012',
      region: 'us-east-1',
    },
  };

  beforeEach(() => {
    // Arrange
    app = new cdk.App();
    stack = new NetworkStack(app, 'TestNetworkStack', defaultProps);
    template = Template.fromStack(stack);
  });

  describe('VPC Configuration', () => {
    it('should create a VPC with correct CIDR block', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::EC2::VPC', {
        CidrBlock: '10.0.0.0/16',
        EnableDnsHostnames: true,
        EnableDnsSupport: true,
      });
    });

    it('should create public subnets in 2 availability zones', () => {
      // Act & Assert
      template.resourceCountIs('AWS::EC2::Subnet', 4); // 2 public + 2 private

      // Check for public subnets
      template.hasResourceProperties('AWS::EC2::Subnet', {
        MapPublicIpOnLaunch: true,
      });
    });

    it('should create private subnets with egress capability', () => {
      // Act & Assert
      template.hasResourceProperties('AWS::EC2::Subnet', {
        MapPublicIpOnLaunch: false,
      });
    });

    it('should create exactly one NAT Gateway for cost optimization', () => {
      // Act & Assert
      template.resourceCountIs('AWS::EC2::NatGateway', 1);
    });

    it('should create an Internet Gateway', () => {
      // Act & Assert
      template.resourceCountIs('AWS::EC2::InternetGateway', 1);
    });

    it('should create route tables for public and private subnets', () => {
      // Act & Assert
      template.resourceCountIs('AWS::EC2::RouteTable', 4); // 1 main + 1 public + 2 private (one per AZ for private)
    });
  });

  describe('DNS and SSL Configuration', () => {
    it('should import existing hosted zone with correct attributes', () => {
      // Arrange
      const hostedZoneId = 'Z9876543210XYZ';
      const hostedZoneName = 'mydomain.com';
      const customProps = {
        ...defaultProps,
        hostedZoneId,
        hostedZoneName,
      };

      // Act
      const customStack = new NetworkStack(app, 'CustomNetworkStack', customProps);

      // Assert
      expect(customStack.hostedZone.hostedZoneId).toBe(hostedZoneId);
      expect(customStack.hostedZone.zoneName).toBe(hostedZoneName);
    });

    it('should import existing SSL certificate with correct ARN', () => {
      // Arrange
      const certificateArn = 'arn:aws:acm:us-west-2:987654321098:certificate/abcdef12-3456-7890-abcd-ef1234567890';
      const customProps = {
        ...defaultProps,
        certificateArn,
      };

      // Act
      const customStack = new NetworkStack(app, 'CustomNetworkStack', customProps);

      // Assert
      expect(customStack.certificate.certificateArn).toBe(certificateArn);
    });

    it('should generate correct FQDN from domain name and hosted zone', () => {
      // Arrange
      const domainName = 'api';
      const hostedZoneName = 'mycompany.com';
      const customProps = {
        ...defaultProps,
        domainName,
        hostedZoneName,
      };

      // Act
      const customStack = new NetworkStack(app, 'CustomNetworkStack', customProps);

      // Assert
      expect(customStack.fqdn).toBe('api.mycompany.com');
    });
  });

  describe('CloudFormation Outputs', () => {
    it('should export VPC ID with correct naming convention', () => {
      // Act & Assert
      template.hasOutput('VpcId', {
        Description: 'VPC ID',
        Export: {
          Name: 'test-app-test-vpc-id',
        },
      });
    });

    it('should export Hosted Zone ID with correct naming convention', () => {
      // Act & Assert
      template.hasOutput('HostedZoneId', {
        Description: 'Hosted Zone ID',
        Export: {
          Name: 'test-app-test-hosted-zone-id',
        },
      });
    });

    it('should export Domain Name with correct FQDN', () => {
      // Act & Assert
      template.hasOutput('DomainName', {
        Description: 'Application Domain Name',
        Export: {
          Name: 'test-app-test-domain-name',
        },
        Value: 'api.example.com',
      });
    });

    it('should export Certificate ARN with correct naming convention', () => {
      // Act & Assert
      template.hasOutput('CertificateArn', {
        Description: 'SSL Certificate ARN',
        Export: {
          Name: 'test-app-test-certificate-arn',
        },
        Value: defaultProps.certificateArn,
      });
    });
  });

  describe('Public Properties', () => {
    it('should expose VPC as public property', () => {
      // Act & Assert
      expect(stack.vpc).toBeDefined();
      expect(stack.vpc).toBeInstanceOf(Object);
    });

    it('should expose hosted zone as public property', () => {
      // Act & Assert
      expect(stack.hostedZone).toBeDefined();
      expect(stack.hostedZone.hostedZoneId).toBe(defaultProps.hostedZoneId);
    });

    it('should expose certificate as public property', () => {
      // Act & Assert
      expect(stack.certificate).toBeDefined();
      expect(stack.certificate.certificateArn).toBe(defaultProps.certificateArn);
    });

    it('should expose FQDN as public property', () => {
      // Act & Assert
      expect(stack.fqdn).toBe('api.example.com');
    });
  });

  describe('Cost Optimization Features', () => {
    it('should use maximum of 2 availability zones', () => {
      // Act & Assert
      // Check that we have exactly 2 public and 2 private subnets (one pair per AZ)
      template.resourceCountIs('AWS::EC2::Subnet', 4);
    });

    it('should use only 1 NAT Gateway for cost optimization', () => {
      // Act & Assert
      template.resourceCountIs('AWS::EC2::NatGateway', 1);
    });
  });

  describe('Stack Props Validation', () => {
    it('should accept all required properties', () => {
      // Arrange
      const requiredProps: NetworkStackProps = {
        hostedZoneId: 'Z1111111111111',
        hostedZoneName: 'test.example.com',
        certificateArn: 'arn:aws:acm:us-east-1:111111111111:certificate/test-cert',
        domainName: 'webapp',
        appName: 'my-app',
        environment: 'prod',
      };

      // Act
      const testStack = new NetworkStack(app, 'PropsTestStack', requiredProps);

      // Assert
      expect(testStack).toBeDefined();
      expect(testStack.fqdn).toBe('webapp.test.example.com');
    });

    it('should handle different environment values correctly', () => {
      // Arrange
      const environments = ['dev', 'qa', 'staging', 'prod'];

      environments.forEach((env) => {
        const envApp = new cdk.App(); // Create fresh app instance for each test
        const envProps = {
          ...defaultProps,
          environment: env,
          appName: 'test-app',
        };

        // Act
        const envStack = new NetworkStack(envApp, `${env}NetworkStack`, envProps);
        const envTemplate = Template.fromStack(envStack);

        // Assert
        envTemplate.hasOutput('VpcId', {
          Export: {
            Name: `test-app-${env}-vpc-id`,
          },
        });
      });
    });
  });
});
