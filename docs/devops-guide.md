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
  - **CD (Continuous Deployment):** Deploys code to production or staging environments (if configured).
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
- **Importance:** Ensures that all code merged into `main` passes linting, formatting, builds successfully, and is covered by tests. This prevents broken or low-quality code from being merged and keeps the main branch stable.

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Documentation](https://jestjs.io/)
- [ESLint Documentation](https://eslint.org/)

---

If you have questions or need help, reach out to your team or check the documentation above.
