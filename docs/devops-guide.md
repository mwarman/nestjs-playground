# DevOps Guide

Welcome to the DevOps guide for the `nestjs-playground` project! This document is designed to help engineers understand the DevOps practices, tools, and workflows used in this repository.

## Overview

DevOps in this project focuses on automation, reliability, and maintainability. The main goals are to ensure code quality, automate testing, and streamline deployment processes.

## DevOps Tools Used

### GitHub Actions

- **Purpose:** Automates CI/CD workflows, including running tests, building the project, and deploying code.
- **Location:** All workflow files are stored in the `.github/workflows/` directory (if present).
- **Common Workflows:**
  - **CI (Continuous Integration):** Runs tests and checks code quality on every push or pull request.
  - **CD (Continuous Deployment):** Deploys application to development environment with full infrastructure provisioning.
  - **Code Quality:** Performs automated code quality checks, formatting, security audits, and package analysis on a schedule, on push, or manually.

## GitHub Actions Workflows

Currently, the project uses GitHub Actions for CI/CD. Below is a detailed description of the main workflow:

### Code Quality Workflow (`code-quality.yml`)

- **Purpose:** Automates code quality checks, formatting, testing, build validation, security audits, and package analysis.
- **Triggers:**
  - Scheduled: Daily at 2 AM UTC
  - Manual: Via GitHub Actions UI
  - On push to `main` branch or changes to relevant files
- **Main Steps:**
  1. Checkout repository (full history)
  2. Setup Node.js (from `.nvmrc`, with npm cache)
  3. Install dependencies (`npm ci`)
  4. Run ESLint and summarize results
  5. Check code formatting with Prettier
  6. Run tests with coverage and summarize results
  7. Build check
  8. Security audit (`npm audit`)
  9. Package analysis (`npm outdated`)
  10. Archive results as artifacts (retained for 7 days)
- **Importance:** Maintains code quality, security, and up-to-date dependencies. Summarizes results for easy review.

### Continuous Integration Workflow (`ci.yml`)

- **Purpose:** Validates every pull request to the `main` branch by building, linting, formatting, and testing the code.
- **Triggers:**
  - On pull requests targeting the `main` branch
  - Manual: Via GitHub Actions UI
- **Concurrency:**
  - Ensures only one workflow runs per branch/ref at a time; cancels in-progress runs for the same branch/ref.
- **Main Steps:**
  1. Checkout repository
  2. Setup Node.js (from `.nvmrc`, with npm cache)
  3. Install dependencies (`npm ci`)
  4. Lint code (`npm run lint`)
  5. Check code formatting (`npm run format:check`)
  6. Build application (`npm run build`)
  7. Run tests with coverage (`npm run test:cov`)
  8. Install infrastructure dependencies (`npm ci` in `infrastructure/`)
  9. Build infrastructure TypeScript code (`npm run build` in `infrastructure/`)
  10. Create infrastructure `.env` file from GitHub variable (`CDK_ENV_DEV`)
  11. Configure AWS credentials for synth (OIDC, role assumption)
  12. Synthesize CDK stacks (`npm run synth` in `infrastructure/`)
- **Importance:** Ensures that all code merged into `main` passes linting, formatting, builds successfully, is covered by tests, and that the AWS CDK infrastructure code is valid and synthesizes successfully. This prevents broken or low-quality code and infrastructure from being merged and keeps the main branch stable.

### Deploy to DEV Workflow (`deploy-dev.yml`)

- **Purpose:** Automatically deploys the application to the development environment on AWS, including infrastructure provisioning, application building, and container deployment.
- **Triggers:**
  - Manual: Via GitHub Actions UI with optional force bootstrap parameter
- **Prerequisites:**
  - GitHub Actions variables must be configured:
    - `AWS_ROLE_ARN_DEV` - AWS IAM Role ARN for development environment
    - `AWS_REGION` - AWS Region for deployment
    - `CDK_ENV_DEV` - Complete `.env` file content for CDK infrastructure
- **Main Steps:**
  1. **Application Build & Test:**
     - Checkout repository
     - Setup Node.js (from `.nvmrc`)
     - Install app dependencies
     - Build application
     - Run unit tests
  2. **Infrastructure Setup:**
     - Install infrastructure dependencies
     - Create infrastructure `.env` file from GitHub variables
     - Build infrastructure TypeScript code
     - Bootstrap CDK (smart check for existing bootstrap)
     - Synthesize CDK CloudFormation templates
  3. **Deployment Process:**
     - Deploy ECR stack (container registry)
     - Build and push Docker image to ECR
     - Deploy Network stack (VPC, subnets, security groups)
     - Deploy Database stack (RDS Aurora Serverless)
     - Deploy Compute stack (ECS Fargate service)
     - Force ECS service update to deploy latest image
  4. **Cleanup:**
     - Remove sensitive files (`.env`, `cdk.out`)
- **Security Features:**
  - Uses OIDC for AWS authentication (no long-lived credentials)
  - Automatic cleanup of sensitive files
  - Proper IAM role assumption with session naming
- **Timeout:** 30 minutes to prevent runaway deployments
- **Importance:** Enables rapid deployment of latest changes to development environment for testing and validation. Follows infrastructure-as-code principles with proper dependency management and security practices.

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Documentation](https://jestjs.io/)
- [ESLint Documentation](https://eslint.org/)

---

If you have questions or need help, reach out to your team or check the documentation above.
