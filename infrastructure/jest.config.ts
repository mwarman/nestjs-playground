import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['utils/**/*.ts', 'stacks/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  // CDK-specific settings
  testTimeout: 30000, // CDK tests can take longer
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Handle CDK imports properly
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Ignore CDK generated files
  testPathIgnorePatterns: ['/node_modules/', '/cdk.out/', '/coverage/'],
  // Clear mocks between tests for better isolation
  clearMocks: true,
  restoreMocks: true,
};

export default config;
