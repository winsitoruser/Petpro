#!/bin/bash
set -e

# Migration runner script for PetPro PostgreSQL database
# This script applies SQL migrations in numerical order

# Configuration
DB_HOST=${POSTGRES_HOST:-"localhost"}
DB_PORT=${POSTGRES_PORT:-5432}
DB_NAME=${POSTGRES_DB:-"petpro"}
DB_USER=${POSTGRES_USER:-"postgres"}
DB_PASSWORD=${POSTGRES_PASSWORD:-"postgres"}

# Get directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="${SCRIPT_DIR}/migrations"

# Function to display help
show_help() {
  echo "PetPro Database Migration Tool"
  echo
  echo "Usage: $0 [options]"
  echo
  echo "Options:"
  echo "  -h, --help              Show this help message"
  echo "  -d, --database DATABASE Specify database name (default: $DB_NAME)"
  echo "  -u, --user USER         Specify database user (default: $DB_USER)"
  echo "  -p, --password PASSWORD Specify database password"
  echo "  --host HOST             Specify database host (default: $DB_HOST)"
  echo "  --port PORT             Specify database port (default: $DB_PORT)"
  echo "  -f, --file FILE         Run a specific migration file"
  echo "  -r, --reset             Reset database (drop and recreate)"
  echo "  -s, --status            Show migration status"
  echo
}

# Function to run migrations
run_migrations() {
  local specific_file=$1
  
  echo "Checking for existing migrations table..."
  if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'migrations'" | grep -q 1; then
    echo "Creating migrations table..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );"
  fi

  if [ -n "$specific_file" ]; then
    # Run a specific migration file
    if [ ! -f "$specific_file" ]; then
      echo "Error: Migration file '$specific_file' not found"
      exit 1
    fi
    
    filename=$(basename "$specific_file")
    
    echo "Running migration: $filename"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$specific_file"
    
    # Record the migration
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
      INSERT INTO migrations (name) VALUES ('$filename')
      ON CONFLICT (name) DO NOTHING;"
    
    echo "Migration '$filename' completed successfully"
  else
    # Get list of migration files
    migrations=($(ls -1 "$MIGRATIONS_DIR"/*.sql | sort))
    
    if [ ${#migrations[@]} -eq 0 ]; then
      echo "No migration files found in $MIGRATIONS_DIR"
      exit 0
    fi
    
    # Get applied migrations
    applied_migrations=($(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT name FROM migrations ORDER BY id"))
    
    for migration in "${migrations[@]}"; do
      filename=$(basename "$migration")
      
      # Check if migration has been applied
      if [[ " ${applied_migrations[@]} " =~ " ${filename} " ]]; then
        echo "Skipping already applied migration: $filename"
        continue
      fi
      
      echo "Applying migration: $filename"
      if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration"; then
        # Record successful migration
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
          INSERT INTO migrations (name) VALUES ('$filename');"
        echo "Migration '$filename' applied successfully"
      else
        echo "Error applying migration '$filename'"
        exit 1
      fi
    done
    
    echo "All migrations have been applied successfully"
  fi
}

# Function to reset the database
reset_database() {
  echo "WARNING: You are about to reset the database '$DB_NAME'. All data will be lost."
  echo "Are you sure you want to continue? [y/N]"
  read -r confirm
  
  if [[ $confirm =~ ^[Yy]$ ]]; then
    echo "Dropping database $DB_NAME..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
    
    echo "Creating database $DB_NAME..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
    
    echo "Database reset complete"
  else
    echo "Database reset cancelled"
    exit 0
  fi
}

# Function to show migration status
show_status() {
  echo "Migration Status:"
  echo "-----------------"
  
  # Get list of migration files
  migrations=($(ls -1 "$MIGRATIONS_DIR"/*.sql | sort))
  
  if [ ${#migrations[@]} -eq 0 ]; then
    echo "No migration files found in $MIGRATIONS_DIR"
    exit 0
  fi
  
  # Create migrations table if it doesn't exist
  if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'migrations'" | grep -q 1; then
    echo "Migrations table does not exist. No migrations have been applied."
    return
  fi
  
  # Get applied migrations
  applied_migrations=($(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT name FROM migrations ORDER BY id"))
  
  printf "%-40s %-10s\n" "Migration" "Status"
  printf "%-40s %-10s\n" "----------------------------------------" "----------"
  
  for migration in "${migrations[@]}"; do
    filename=$(basename "$migration")
    
    # Check if migration has been applied
    if [[ " ${applied_migrations[@]} " =~ " ${filename} " ]]; then
      status="Applied"
    else
      status="Pending"
    fi
    
    printf "%-40s %-10s\n" "$filename" "$status"
  done
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -d|--database)
      DB_NAME="$2"
      shift 2
      ;;
    -u|--user)
      DB_USER="$2"
      shift 2
      ;;
    -p|--password)
      DB_PASSWORD="$2"
      shift 2
      ;;
    --host)
      DB_HOST="$2"
      shift 2
      ;;
    --port)
      DB_PORT="$2"
      shift 2
      ;;
    -f|--file)
      SPECIFIC_FILE="$2"
      shift 2
      ;;
    -r|--reset)
      RESET_DB=true
      shift
      ;;
    -s|--status)
      SHOW_STATUS=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Main execution
if [ -n "$RESET_DB" ] && [ "$RESET_DB" = true ]; then
  reset_database
fi

if [ -n "$SHOW_STATUS" ] && [ "$SHOW_STATUS" = true ]; then
  show_status
  exit 0
fi

run_migrations "$SPECIFIC_FILE"
