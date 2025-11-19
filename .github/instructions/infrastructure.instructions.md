---
applyTo: 'infrastructure/**'
---

# AWS CDK Infrastructure Guidelines

- Define one CDK stack per major grouping of resources (e.g., Network stack, database stack, compute stack).
- Use **.env** for environment variables prefixed with `CDK_`, but avoid committing this file
- Tag all CDK resources appropriately (`App`, `Env`, `OU`, `Owner`).
- Deploy separate environments (dev/qa/prd) using configuration values.

## Commands & Scripts

- Use `npm run build` to compile the CDK TypeScript code.
- Use `npm run synth` to synthesize the CDK app.
- Use `npm run test` to run CDK unit tests.
- Use `npm run test <component>` to run tests for a specific component, e.g., `npm run test network`.
