#!/bin/bash
set -e

# This script initializes the PostgreSQL database schema
# It runs migrations and creates necessary roles/permissions

echo "Initializing PetPro database schema..."

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -p 5432; do
  echo "Waiting for PostgreSQL to start..."
  sleep 1
done

# Create application databases for different environments
for DB_NAME in petpro_dev petpro_test petpro_staging petpro_prod; do
  echo "Creating database $DB_NAME if it doesn't exist..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    SELECT 'CREATE DATABASE $DB_NAME' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME');
EOSQL
done

# Create application users and roles if they don't exist
echo "Setting up database roles and users..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
  -- Create application roles
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_readonly') THEN
      CREATE ROLE app_readonly;
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_readwrite') THEN
      CREATE ROLE app_readwrite;
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_admin') THEN
      CREATE ROLE app_admin;
    END IF;
    
    -- Create application users if they don't exist
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'petpro_readonly') THEN
      CREATE USER petpro_readonly WITH PASSWORD '${PETPRO_READONLY_PASSWORD:-petpro123}';
      GRANT app_readonly TO petpro_readonly;
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'petpro_app') THEN
      CREATE USER petpro_app WITH PASSWORD '${PETPRO_APP_PASSWORD:-petpro123}';
      GRANT app_readwrite TO petpro_app;
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'petpro_admin') THEN
      CREATE USER petpro_admin WITH PASSWORD '${PETPRO_ADMIN_PASSWORD:-petpro123}';
      GRANT app_admin TO petpro_admin;
    END IF;
  END
  \$\$;
  
  -- Grant appropriate privileges to roles
  GRANT CONNECT ON DATABASE petpro_dev TO app_readonly, app_readwrite, app_admin;
  GRANT CONNECT ON DATABASE petpro_test TO app_readonly, app_readwrite, app_admin;
  GRANT CONNECT ON DATABASE petpro_staging TO app_readonly, app_readwrite, app_admin;
  GRANT CONNECT ON DATABASE petpro_prod TO app_readonly, app_readwrite, app_admin;
EOSQL

# Copy migration files from mounted volume to accessible location
echo "Preparing migration files..."
MIGRATIONS_SOURCE="/docker-entrypoint-initdb.d/migrations"
MIGRATIONS_DEST="/tmp/migrations"

if [ -d "$MIGRATIONS_SOURCE" ]; then
  mkdir -p "$MIGRATIONS_DEST"
  cp "$MIGRATIONS_SOURCE"/*.sql "$MIGRATIONS_DEST/"
  
  # Run migrations on each database
  for DB_NAME in petpro_dev petpro_test petpro_staging petpro_prod; do
    echo "Applying migrations to $DB_NAME..."
    
    # Create migrations table if it doesn't exist
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-EOSQL
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
EOSQL
    
    # Apply migrations in order
    for migration in $(ls -1 "$MIGRATIONS_DEST"/*.sql | sort); do
      filename=$(basename "$migration")
      
      # Check if migration has already been applied
      migration_exists=$(psql -t --username "$POSTGRES_USER" --dbname "$DB_NAME" -c "SELECT COUNT(*) FROM migrations WHERE name = '$filename';")
      
      if [ "$migration_exists" -eq "0" ]; then
        echo "Applying migration $filename to $DB_NAME..."
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" -f "$migration"
        
        # Record migration
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" -c "INSERT INTO migrations (name) VALUES ('$filename');"
      else
        echo "Migration $filename already applied to $DB_NAME, skipping."
      fi
    done
  done

  # Set permissions for application roles on all objects
  for DB_NAME in petpro_dev petpro_test petpro_staging petpro_prod; do
    echo "Setting permissions for $DB_NAME..."
    
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-EOSQL
      -- Grant read-only access
      GRANT USAGE ON SCHEMA public TO app_readonly;
      GRANT USAGE ON SCHEMA audit TO app_readonly;
      GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
      GRANT SELECT ON ALL TABLES IN SCHEMA audit TO app_readonly;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO app_readonly;
      ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT SELECT ON TABLES TO app_readonly;
      
      -- Grant read-write access
      GRANT USAGE ON SCHEMA public TO app_readwrite;
      GRANT USAGE ON SCHEMA audit TO app_readwrite;
      GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_readwrite;
      GRANT SELECT ON ALL TABLES IN SCHEMA audit TO app_readwrite;
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_readwrite;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_readwrite;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_readwrite;
      ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT SELECT ON TABLES TO app_readwrite;
      
      -- Grant admin access
      GRANT ALL PRIVILEGES ON SCHEMA public TO app_admin;
      GRANT ALL PRIVILEGES ON SCHEMA audit TO app_admin;
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO app_admin;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA audit TO app_admin;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO app_admin;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO app_admin;
      ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT ALL PRIVILEGES ON TABLES TO app_admin;
      ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT ALL PRIVILEGES ON SEQUENCES TO app_admin;
EOSQL
  done
  
  echo "All migrations applied successfully!"
else
  echo "No migrations directory found at $MIGRATIONS_SOURCE"
fi

echo "PetPro database initialization complete!"
