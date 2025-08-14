-- PostgreSQL initialization script for PetPro development environment
-- Enhanced version with comprehensive user management, monitoring, and best practices

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Set up comprehensive role-based access
-- 1. Roles for application access
DO $$ 
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
  
  -- 2. Individual user accounts with passwords
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'petpro_readonly') THEN
    CREATE USER petpro_readonly WITH PASSWORD 'readonly_password_changeme' LOGIN;
    GRANT app_readonly TO petpro_readonly;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'petpro_app') THEN
    CREATE USER petpro_app WITH PASSWORD 'app_password_changeme' LOGIN;
    GRANT app_readwrite TO petpro_app;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'petpro_admin') THEN
    CREATE USER petpro_admin WITH PASSWORD 'admin_password_changeme' LOGIN;
    GRANT app_admin TO petpro_admin;
  END IF;
  
  -- 3. Create replication user for backups
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'replicator') THEN
    CREATE USER replicator WITH REPLICATION PASSWORD 'repl_password_changeme' LOGIN;
  END IF;

  -- 4. Create monitoring user
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres_exporter') THEN
    CREATE USER postgres_exporter WITH PASSWORD 'monitoring_password_changeme' LOGIN;
    GRANT pg_monitor TO postgres_exporter;
  END IF;
END $$;

-- Grant appropriate privileges
-- 1. Read-only role permissions
GRANT USAGE ON SCHEMA public TO app_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO app_readonly;

-- 2. Read-write role permissions
GRANT USAGE ON SCHEMA public TO app_readwrite;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_readwrite;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO app_readwrite;

-- 3. Admin role permissions (everything including DDL)
GRANT app_readwrite TO app_admin;
GRANT CREATE ON SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO app_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO app_admin;

-- Configure monitoring permissions
GRANT SELECT ON pg_stat_activity TO postgres_exporter;
GRANT SELECT ON pg_stat_statements TO postgres_exporter;
GRANT SELECT ON pg_stat_replication TO postgres_exporter;

-- Create development databases (for multi-environment setup)
DO $$ 
BEGIN
  -- Test database
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'petpro_test') THEN
    CREATE DATABASE petpro_test WITH OWNER postgres;
  END IF;
  
  -- Development database
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'petpro_dev') THEN
    CREATE DATABASE petpro_dev WITH OWNER postgres;
  END IF;
  
  -- Staging database
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'petpro_staging') THEN
    CREATE DATABASE petpro_staging WITH OWNER postgres;
  END IF;
END $$;

-- Enable query performance statistics collection
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Create tablespace for large tables (if needed)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tablespace WHERE spcname = 'petpro_data') THEN
    -- Skip for Docker setup as custom tablespaces require host directories
    -- For production, uncomment and configure:
    -- CREATE TABLESPACE petpro_data OWNER postgres LOCATION '/var/lib/postgresql/tablespaces/petpro_data';
    RAISE NOTICE 'Skipping tablespace creation in Docker environment';
  END IF;
END $$;
