import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export interface NetworkStackProps extends cdk.StackProps {
  hostedZoneId: string;
  hostedZoneName: string;
  certificateArn: string;
  domainName: string;
  appName: string;
  environment: string;
}

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;
  public readonly hostedZone: route53.IHostedZone;
  public readonly certificate: certificatemanager.ICertificate;
  public readonly fqdn: string;

  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id, props);

    // Create a new VPC with public and private subnets
    this.vpc = new ec2.Vpc(this, 'ApplicationVpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2, // Cost optimization: use only 2 AZs
      natGateways: 1, // Cost optimization: use only 1 NAT Gateway
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    // Import existing hosted zone
    this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'ExistingHostedZone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.hostedZoneName,
    });

    // Import existing certificate
    this.certificate = certificatemanager.Certificate.fromCertificateArn(
      this,
      'ExistingCertificate',
      props.certificateArn,
    );

    // Create FQDN for the application
    this.fqdn = `${props.domainName}.${props.hostedZoneName}`;

    // Output important values
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: `${props.appName}-${props.environment}-vpc-id`,
    });

    new cdk.CfnOutput(this, 'HostedZoneId', {
      value: this.hostedZone.hostedZoneId,
      description: 'Hosted Zone ID',
      exportName: `${props.appName}-${props.environment}-hosted-zone-id`,
    });

    new cdk.CfnOutput(this, 'DomainName', {
      value: this.fqdn,
      description: 'Application Domain Name',
      exportName: `${props.appName}-${props.environment}-domain-name`,
    });

    new cdk.CfnOutput(this, 'CertificateArn', {
      value: this.certificate.certificateArn,
      description: 'SSL Certificate ARN',
      exportName: `${props.appName}-${props.environment}-certificate-arn`,
    });
  }
}
