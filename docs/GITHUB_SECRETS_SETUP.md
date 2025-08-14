# GitHub Secrets and Environment Setup Guide

This document provides instructions for setting up the necessary GitHub secrets and environment variables required for the PetPro CI/CD workflows.

## Required Secrets

The following secrets need to be configured in your GitHub repository settings for the CI/CD pipelines to function correctly:

### General Secrets

| Secret Name | Description | Used In |
|-------------|-------------|---------|
| `CODECOV_TOKEN` | Token for Codecov.io integration | All CI workflows |

### AWS Credentials

| Secret Name | Description | Used In |
|-------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS IAM Access Key ID with appropriate permissions | All deployment workflows |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Secret Access Key | All deployment workflows |

### Backend Deployment Secrets

| Secret Name | Description | Used In |
|-------------|-------------|---------|
| `DATABASE_URL_STAGING` | PostgreSQL connection URL for staging | Backend deployment |
| `DATABASE_URL_PRODUCTION` | PostgreSQL connection URL for production | Backend deployment |
| `REDIS_URL_STAGING` | Redis connection URL for staging | Backend deployment |
| `REDIS_URL_PRODUCTION` | Redis connection URL for production | Backend deployment |
| `JWT_SECRET_STAGING` | JWT signing key for staging | Backend deployment |
| `JWT_SECRET_PRODUCTION` | JWT signing key for production | Backend deployment |

### Web Vendor Portal Deployment Secrets

| Secret Name | Description | Used In |
|-------------|-------------|---------|
| `AWS_STAGING_VENDOR_BUCKET` | S3 bucket name for staging vendor portal | Web vendor deployment |
| `AWS_PRODUCTION_VENDOR_BUCKET` | S3 bucket name for production vendor portal | Web vendor deployment |
| `AWS_STAGING_VENDOR_DISTRIBUTION` | CloudFront distribution ID for staging vendor portal | Web vendor deployment |
| `AWS_PRODUCTION_VENDOR_DISTRIBUTION` | CloudFront distribution ID for production vendor portal | Web vendor deployment |

### Web Admin Portal Deployment Secrets

| Secret Name | Description | Used In |
|-------------|-------------|---------|
| `AWS_STAGING_ADMIN_BUCKET` | S3 bucket name for staging admin portal | Web admin deployment |
| `AWS_PRODUCTION_ADMIN_BUCKET` | S3 bucket name for production admin portal | Web admin deployment |
| `AWS_STAGING_ADMIN_DISTRIBUTION` | CloudFront distribution ID for staging admin portal | Web admin deployment |
| `AWS_PRODUCTION_ADMIN_DISTRIBUTION` | CloudFront distribution ID for production admin portal | Web admin deployment |

### Mobile App Deployment Secrets

| Secret Name | Description | Used In |
|-------------|-------------|---------|
| `EXPO_TOKEN` | Expo CLI token for publishing | Mobile app deployment |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password for App Store Connect | Mobile app deployment |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Google Play service account JSON (base64 encoded) | Mobile app deployment |

## Setting Up Secrets

1. Navigate to your GitHub repository
2. Go to Settings > Secrets and variables > Actions
3. Click on "New repository secret"
4. Add each required secret with its corresponding value
5. Click "Add secret"

## Environment-Specific Variables

The CI/CD workflows use environment-specific variables that are loaded from the corresponding `.env` files. The deployment workflows automatically select the appropriate environment variables based on the target branch:

- `develop` branch → Staging environment
- `main` branch → Production environment

## Working with Environment Variables in CI/CD

When adding new environment variables to your application:

1. Update the corresponding `.env.example` file with the new variable
2. Add the variable to all environment-specific files (`.env.development`, `.env.staging`, `.env.production`)
3. If the variable contains sensitive information, add it as a GitHub secret following the naming convention:
   - For staging: `VARIABLE_NAME_STAGING`
   - For production: `VARIABLE_NAME_PRODUCTION`
4. Update the deployment workflows if necessary to pass these variables to the build or deployment process

## Troubleshooting

### Missing Secrets

If your workflows fail with errors about missing secrets, check:

1. That all required secrets are configured in the GitHub repository settings
2. That the secret names match exactly what's expected in the workflows
3. That you have the necessary permissions to access the secrets

### Invalid Credentials

If your workflows fail with authentication errors:

1. Verify that the AWS credentials are valid and have the necessary permissions
2. Check if any tokens have expired and need to be refreshed
3. Ensure that service account credentials have the correct access rights

## Best Practices

1. Rotate secrets regularly for security
2. Use GitHub environments to separate production secrets from development/staging
3. Limit access to secrets to only those who need it
4. Never commit secrets to the repository
5. Use the fallback pattern `${{ secrets.SECRET_NAME || '' }}` in workflows to prevent failures when secrets might not exist in certain environments
