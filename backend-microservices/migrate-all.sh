#!/bin/bash

# Script to run database migrations for all services
# Make sure to set DB_HOST environment variable before running

echo "🚀 Running database migrations for all services..."
echo "DB_HOST: $DB_HOST"
echo ""

# Services that have migrations
services=("auth-service" "admin-service" "booking-service")

for service in "${services[@]}"; do
    if [ -d "$service" ]; then
        echo "📦 Running migrations for $service..."
        cd "$service"
        
        # Check if package.json exists and has db:migrate script
        if [ -f "package.json" ] && grep -q "db:migrate" package.json; then
            npm run db:migrate
            echo "✅ $service migrations completed"
        else
            echo "❌ $service: No migration script found"
        fi
        
        cd ..
        echo ""
    else
        echo "❌ $service directory not found"
        echo ""
    fi
done

echo "🎉 All migration attempts completed!"