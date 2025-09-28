// Jest setup file for CDK-specific test utilities
// This file can be used to set up common CDK testing utilities

import { Template } from 'aws-cdk-lib/assertions';
import { App, Stack } from 'aws-cdk-lib';

// Set longer timeout for CDK synthesis operations which can be slow
jest.setTimeout(30000);

// Suppress CDK warnings/info messages during tests
process.env.CDK_DISABLE_VERSION_CHECK = '1';
process.env.CDK_DISABLE_ANALYTICS = '1';

// Helper function to create a test stack
export function createTestStack(): [App, Stack] {
  const app = new App();
  const stack = new Stack(app, 'TestStack');
  return [app, stack];
}

// Helper function to get CloudFormation template from stack
export function getTemplate(stack: Stack): Template {
  return Template.fromStack(stack);
}
