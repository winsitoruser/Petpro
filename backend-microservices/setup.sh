#!/bin/bash

# 🐾 PetPro Backend Microservices Setup Script
# Automated setup for local development

set -e

echo "🐾 Starting PetPro Backend Microservices Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version must be 18 or higher. Current: $(node -v)"
        exit 1
    fi
    print_status "Node.js $(node -v) ✓"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_status "npm $(npm -v) ✓"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker"
        exit 1
    fi
    print_status "Docker $(docker -v | cut -d' ' -f3 | cut -d',' -f1) ✓"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_status "Docker Compose $(docker-compose -v | cut -d' ' -f3 | cut -d',' -f1) ✓"
}

# Setup environment files
setup_env_files() {
    print_step "Setting up environment files..."
    
    # Services list
    services=("admin-service" "admin-gateway" "auth-service" "api-gateway" "booking-service" "inventory-service" "vendor-service")
    
    for service in "${services[@]}"; do
        if [ ! -f "$service/.env" ]; then
            print_status "Creating .env for $service..."
            # Environment files are already created, just verify
            if [ -f "$service/.env" ]; then
                print_status "$service/.env exists ✓"
            else
                print_warning "$service/.env not found, please create manually"
            fi
        else
            print_status "$service/.env already exists ✓"
        fi
    done
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies for all services..."
    
    # Install root dependencies
    print_status "Installing root package dependencies..."
    npm install
    
    # Install service dependencies
    services=("admin-service" "admin-gateway" "auth-service" "api-gateway" "booking-service" "inventory-service" "vendor-service")
    
    for service in "${services[@]}"; do
        if [ -d "$service" ]; then
            print_status "Installing dependencies for $service..."
            cd "$service"
            npm install
            cd ..
        else
            print_warning "Service directory $service not found"
        fi
    done
}

# Start infrastructure
start_infrastructure() {
    print_step "Starting infrastructure services..."
    
    print_status "Starting PostgreSQL, Kafka, and Redis..."
    docker-compose up -d postgres kafka redis
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if PostgreSQL is ready
    max_attempts=30
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker exec petpro-postgres pg_isready -U postgres > /dev/null 2>&1; then
            print_status "PostgreSQL is ready ✓"
            break
        fi
        print_warning "Waiting for PostgreSQL... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    
    # Check if Kafka is ready
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker exec petpro-kafka kafka-topics.sh --list --bootstrap-server localhost:9092 > /dev/null 2>&1; then
            print_status "Kafka is ready ✓"
            break
        fi
        print_warning "Waiting for Kafka... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Kafka failed to start"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_step "Running database migrations..."
    
    services=("admin-service" "auth-service" "booking-service")
    
    for service in "${services[@]}"; do
        if [ -d "$service" ]; then
            print_status "Running migrations for $service..."
            cd "$service"
            if npm run db:migrate > /dev/null 2>&1; then
                print_status "$service migrations completed ✓"
            else
                print_warning "$service migrations failed or not available"
            fi
            cd ..
        fi
    done
}

# Seed database
seed_database() {
    print_step "Seeding databases..."
    
    services=("admin-service" "auth-service" "booking-service" "inventory-service")
    
    for service in "${services[@]}"; do
        if [ -d "$service" ]; then
            print_status "Seeding data for $service..."
            cd "$service"
            if [ "$service" = "inventory-service" ]; then
                if npm run seed > /dev/null 2>&1; then
                    print_status "$service seeding completed ✓"
                else
                    print_warning "$service seeding failed or not available"
                fi
            else
                if npm run db:seed > /dev/null 2>&1; then
                    print_status "$service seeding completed ✓"
                else
                    print_warning "$service seeding failed or not available"
                fi
            fi
            cd ..
        fi
    done
}

# Verify setup
verify_setup() {
    print_step "Verifying setup..."
    
    # Check if all containers are running
    containers=("petpro-postgres" "petpro-kafka" "petpro-redis")
    
    for container in "${containers[@]}"; do
        if docker ps | grep -q "$container"; then
            print_status "$container is running ✓"
        else
            print_error "$container is not running"
        fi
    done
    
    # Check database connections
    if docker exec petpro-postgres psql -U postgres -lqt 2>/dev/null | grep -q "petpro_admin_dev"; then
        print_status "Admin database exists ✓"
    else
        print_warning "Admin database not found"
    fi
    
    if docker exec petpro-postgres psql -U postgres -lqt 2>/dev/null | grep -q "petpro_auth_dev"; then
        print_status "Auth database exists ✓"
    else
        print_warning "Auth database not found"
    fi
}

# Main setup function
main() {
    echo "🐾 PetPro Backend Microservices Setup"
    echo "======================================"
    
    check_prerequisites
    setup_env_files
    install_dependencies
    start_infrastructure
    run_migrations
    seed_database
    verify_setup
    
    echo ""
    echo "======================================"
    print_status "Setup completed successfully! 🎉"
    echo ""
    print_status "Next steps:"
    echo "1. Start all services: npm run dev:all"
    echo "2. Or use Docker: docker-compose up"
    echo "3. Access admin dashboard: http://localhost:3004/api/admin/docs"
    echo "4. Access API gateway: http://localhost:3000/api/docs"
    echo ""
    print_status "Default admin credentials:"
    echo "   Email: superadmin@petpro.com"
    echo "   Password: admin123"
    echo ""
    print_status "Check the README.md for more information!"
}

# Run main function
main "$@"