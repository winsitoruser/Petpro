#!/bin/bash
# SSH Deployment Script for PetPro
# Usage: ./ssh-deploy.sh [environment] [branch]

set -e

# Default values
ENV=${1:-"development"}
BRANCH=${2:-"develop"}

# Configuration
SSH_KEY="$PWD/.ssh/petpro_ed25519"
REPO_URL="git@github.com:yourusername/petpro.git"
REMOTE_DIR="/var/www/petpro"

# Server mappings
case $ENV in
  "production")
    SERVER="petpro-naincode"
    BRANCH="main"
    ;;
  "staging")
    SERVER="petpro-staging"
    ;;
  "development")
    SERVER="petpro-development"
    ;;
  *)
    echo "Unknown environment: $ENV"
    echo "Usage: $0 [environment] [branch]"
    echo "Environments: development, staging, production"
    exit 1
    ;;
esac

echo "🚀 Deploying to $ENV environment on $SERVER using branch $BRANCH..."

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
  echo "❌ SSH key not found: $SSH_KEY"
  exit 1
fi

# Test SSH connection
echo "📡 Testing SSH connection to $SERVER..."
ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$SERVER" "echo Connection successful" || {
  echo "❌ Failed to connect to $SERVER"
  exit 1
}

# Deploy application
echo "📦 Deploying application to $SERVER..."
ssh -i "$SSH_KEY" "$SERVER" << EOF
  set -e
  echo "📥 Preparing deployment directory..."
  mkdir -p $REMOTE_DIR
  cd $REMOTE_DIR
  
  if [ -d ".git" ]; then
    echo "🔄 Updating existing repository..."
    git fetch --all
    git checkout $BRANCH
    git pull origin $BRANCH
  else
    echo "🔄 Cloning repository..."
    git clone --branch $BRANCH $REPO_URL .
  fi
  
  echo "📦 Installing dependencies..."
  if [ -f "package.json" ]; then
    npm ci
  fi
  
  if [ -f "docker-compose.$ENV.yml" ]; then
    echo "🐳 Running Docker Compose..."
    docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml up -d
  fi
  
  echo "🔄 Running migrations if needed..."
  if [ -f ".env.$ENV" ]; then
    source .env.$ENV
    if [ -f "package.json" ]; then
      npm run migrate
    fi
  fi
  
  echo "🧹 Cleaning up..."
  if [ -d "node_modules" ]; then
    npm prune --production
  fi
  
  echo "✅ Deployment completed successfully!"
EOF

echo "🎉 Deployment to $ENV environment completed!"
