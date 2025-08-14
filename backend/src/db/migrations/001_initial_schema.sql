-- Initial schema migration for PetPro
-- Creates core tables, relationships, constraints, indexes, and audit functionality

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create audit schema
CREATE SCHEMA IF NOT EXISTS audit;

-- Create enum types
CREATE TYPE user_type AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE pet_species AS ENUM ('dog', 'cat', 'bird', 'fish', 'reptile', 'small_mammal', 'other');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'authorized', 'paid', 'failed', 'refunded');
CREATE TYPE review_target_type AS ENUM ('product', 'clinic', 'service');

-- Create function for updating timestamps on tables with updated_at column
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create audit trail function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_row_data JSONB;
    new_row_data JSONB;
    excluded_cols TEXT[] := ARRAY['updated_at'];
BEGIN
    IF TG_OP = 'DELETE' THEN
        old_row_data = to_jsonb(OLD);
        INSERT INTO audit.entity_changes(
            entity_type, entity_id, action, changed_by, old_values
        ) VALUES (
            TG_TABLE_NAME,
            OLD.id,
            TG_OP,
            current_setting('app.current_user_id', true)::UUID,
            old_row_data
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        old_row_data = to_jsonb(OLD);
        new_row_data = to_jsonb(NEW);

        -- Remove excluded columns
        FOREACH col IN ARRAY excluded_cols
        LOOP
            old_row_data = old_row_data - col;
            new_row_data = new_row_data - col;
        END LOOP;

        -- Only log if there are actual changes
        IF new_row_data <> old_row_data THEN
            INSERT INTO audit.entity_changes(
                entity_type, entity_id, action, changed_by, old_values, new_values
            ) VALUES (
                TG_TABLE_NAME,
                NEW.id,
                TG_OP,
                current_setting('app.current_user_id', true)::UUID,
                old_row_data,
                new_row_data
            );
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        new_row_data = to_jsonb(NEW);
        
        -- Remove excluded columns
        FOREACH col IN ARRAY excluded_cols
        LOOP
            new_row_data = new_row_data - col;
        END LOOP;
        
        INSERT INTO audit.entity_changes(
            entity_type, entity_id, action, changed_by, new_values
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            current_setting('app.current_user_id', true)::UUID,
            new_row_data
        );
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit table for tracking changes
CREATE TABLE audit.entity_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    old_values JSONB,
    new_values JSONB
);

-- Create indexes on audit table
CREATE INDEX idx_audit_entity_type ON audit.entity_changes(entity_type);
CREATE INDEX idx_audit_entity_id ON audit.entity_changes(entity_id);
CREATE INDEX idx_audit_changed_by ON audit.entity_changes(changed_by);
CREATE INDEX idx_audit_changed_at ON audit.entity_changes(changed_at);
CREATE INDEX idx_audit_action ON audit.entity_changes(action);

-- Create partial indexes for better performance
CREATE INDEX idx_audit_entity_type_id ON audit.entity_changes(entity_type, entity_id);
CREATE INDEX idx_audit_changed_at_action ON audit.entity_changes(changed_at, action);

COMMENT ON TABLE audit.entity_changes IS 'Stores audit trail for all tracked entity changes';
