#!/bin/bash

# PetPro CI/CD Environment Setup Script
# This script is used in CI/CD pipelines to set up the correct environment

# Determine environment based on branch
if [[ "$GITHUB_REF" == "refs/heads/main" ]]; then
  ENV="production"
elif [[ "$GITHUB_REF" == "refs/heads/develop" ]]; then
  ENV="staging"
else
  ENV="development"
fi

echo "Setting up $ENV environment for CI/CD pipeline..."

# Copy the appropriate environment file
cp .env.$ENV .env

# Output the environment for logging purposes
echo "ENV=$ENV" >> $GITHUB_ENV
echo "Using environment: $ENV"

# If environment-specific docker-compose override exists, use it
if [ -f "docker-compose.$ENV.yml" ]; then
  echo "Using docker-compose.$ENV.yml for overrides"
  cp docker-compose.$ENV.yml docker-compose.override.yml
fi

# Setup environment-specific variables based on the environment
if [[ "$ENV" == "production" ]]; then
  # Production-specific setup
  echo "Setting up production-specific configurations..."
  echo "NODE_ENV=production" >> $GITHUB_ENV
  echo "API_URL=https://api.petpro.com" >> $GITHUB_ENV
elif [[ "$ENV" == "staging" ]]; then
  # Staging-specific setup
  echo "Setting up staging-specific configurations..."
  echo "NODE_ENV=staging" >> $GITHUB_ENV
  echo "API_URL=https://api.staging.petpro.com" >> $GITHUB_ENV
else
  # Development-specific setup
  echo "Setting up development-specific configurations..."
  echo "NODE_ENV=development" >> $GITHUB_ENV
  echo "API_URL=http://localhost:8080" >> $GITHUB_ENV
fi

echo "Environment setup complete!"
