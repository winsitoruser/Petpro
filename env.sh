#!/bin/bash

# PetPro Environment Switcher
# This script helps switch between development, staging, and production environments

# Set default environment
ENV=${1:-development}

# Validate input
if [[ ! "$ENV" =~ ^(development|staging|production)$ ]]; then
    echo "Error: Environment must be 'development', 'staging', or 'production'"
    echo "Usage: ./env.sh [environment]"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env.$ENV" ]; then
    echo "Error: .env.$ENV file does not exist!"
    exit 1
fi

# Check if docker-compose override file exists
if [ ! -f "docker-compose.$ENV.yml" ]; then
    echo "Error: docker-compose.$ENV.yml file does not exist!"
    exit 1
fi

# Create symlink to the selected environment file
echo "Switching to $ENV environment..."
ln -sf .env.$ENV .env

# Create symlink to the selected docker-compose override file
ln -sf docker-compose.$ENV.yml docker-compose.override.yml

# Display environment info
echo "Environment set to: $ENV"
echo "Using configuration from .env.$ENV"
echo "Using Docker Compose override from docker-compose.$ENV.yml"

# Optional: check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Warning: Docker is not running. Please start Docker to use this environment."
    exit 0
fi

# Ask if user wants to restart services
read -p "Do you want to restart Docker services with the new environment? (y/n): " RESTART

if [[ "$RESTART" =~ ^[Yy]$ ]]; then
    echo "Stopping any running containers..."
    docker-compose down

    echo "Starting containers with $ENV environment..."
    docker-compose up -d

    # Show running services
    echo "\nServices started successfully!"
    echo "Running containers:"
    docker-compose ps
    
    echo "\nYou can access:"
    
    # Only show services that are expected to be running in the current environment
    if [[ "$ENV" == "development" ]]; then
        echo "- Backend API: http://localhost:${API_PORT:-8080}"
        echo "- Web Vendor: http://localhost:3000"
        echo "- Web Admin: http://localhost:3001"
        echo "- Mobile App (Expo): http://localhost:19002"
        echo "- MinIO Console: http://localhost:9001"
        echo "- MailHog UI: http://localhost:8025"
        echo "- Adminer (DB Admin): http://localhost:8081"
    elif [[ "$ENV" == "staging" ]]; then
        echo "- Backend API: http://localhost:${API_PORT:-8080}"
        echo "- Web Vendor: http://localhost:3000"
        echo "- Web Admin: http://localhost:3001"
    elif [[ "$ENV" == "production" ]]; then
        echo "- Backend API: http://localhost:${API_PORT:-8080}"
        echo "- Web Vendor: http://localhost:3000"
        echo "- Web Admin: http://localhost:3001"
    fi
fi

echo "\nEnvironment switch complete!"
echo "To use this environment, run: docker-compose up -d"

