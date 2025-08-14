-- PostgreSQL indexes optimization script
-- Run this after applying Prisma migrations

-- User indexes for common query patterns
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "users_user_type_idx" ON "users" ("user_type") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" ("created_at");

-- User profile optimization
CREATE INDEX IF NOT EXISTS "user_profiles_user_id_idx" ON "user_profiles" ("user_id");
CREATE INDEX IF NOT EXISTS "user_profiles_name_search_idx" ON "user_profiles" ("first_name", "last_name");

-- Pet indexes
CREATE INDEX IF NOT EXISTS "pets_user_id_idx" ON "pets" ("user_id");
CREATE INDEX IF NOT EXISTS "pets_species_idx" ON "pets" ("species");
CREATE INDEX IF NOT EXISTS "pets_birth_date_idx" ON "pets" ("birth_date");
CREATE INDEX IF NOT EXISTS "pets_microchip_id_idx" ON "pets" ("microchip_id") WHERE "microchip_id" IS NOT NULL;

-- Pet health records
CREATE INDEX IF NOT EXISTS "pet_health_records_pet_id_idx" ON "pet_health_records" ("pet_id");
CREATE INDEX IF NOT EXISTS "pet_health_records_record_date_idx" ON "pet_health_records" ("record_date");

-- Pet vaccinations
CREATE INDEX IF NOT EXISTS "pet_vaccinations_pet_id_idx" ON "pet_vaccinations" ("pet_id");
CREATE INDEX IF NOT EXISTS "pet_vaccinations_expiration_date_idx" ON "pet_vaccinations" ("expiration_date");

-- Clinics indexes including geospatial
CREATE INDEX IF NOT EXISTS "clinics_user_id_idx" ON "clinics" ("user_id");
CREATE INDEX IF NOT EXISTS "clinics_name_idx" ON "clinics" ("name");
CREATE INDEX IF NOT EXISTS "clinics_ratings_idx" ON "clinics" ("average_rating", "total_reviews");

-- Create GiST index for geospatial queries if PostGIS is installed
-- If not using PostGIS, use the following:
CREATE INDEX IF NOT EXISTS "clinics_coordinates_idx" ON "clinics" ("latitude", "longitude") 
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

-- Services and Staff indexes
CREATE INDEX IF NOT EXISTS "clinic_services_clinic_id_idx" ON "clinic_services" ("clinic_id");
CREATE INDEX IF NOT EXISTS "clinic_staff_clinic_id_idx" ON "clinic_staff" ("clinic_id");
CREATE INDEX IF NOT EXISTS "staff_availability_staff_id_idx" ON "staff_availability" ("staff_id", "day_of_week");

-- Appointments
CREATE INDEX IF NOT EXISTS "appointments_clinic_id_idx" ON "appointments" ("clinic_id");
CREATE INDEX IF NOT EXISTS "appointments_user_id_idx" ON "appointments" ("user_id");
CREATE INDEX IF NOT EXISTS "appointments_pet_id_idx" ON "appointments" ("pet_id");
CREATE INDEX IF NOT EXISTS "appointments_staff_id_idx" ON "appointments" ("staff_id");
CREATE INDEX IF NOT EXISTS "appointments_service_id_idx" ON "appointments" ("service_id");
CREATE INDEX IF NOT EXISTS "appointments_date_time_idx" ON "appointments" ("appointment_date", "start_time");
CREATE INDEX IF NOT EXISTS "appointments_status_idx" ON "appointments" ("status");

-- Notifications
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" ("user_id");
CREATE INDEX IF NOT EXISTS "notifications_user_status_idx" ON "notifications" ("user_id", "status", "read");
CREATE INDEX IF NOT EXISTS "notifications_scheduled_idx" ON "notifications" ("status", "scheduled_for") 
WHERE "status" = 'scheduled';
CREATE INDEX IF NOT EXISTS "notifications_entity_idx" ON "notifications" ("related_entity_type", "related_entity_id") 
WHERE "related_entity_id" IS NOT NULL;

-- Reviews
CREATE INDEX IF NOT EXISTS "reviews_target_idx" ON "reviews" ("target_type", "target_id");
CREATE INDEX IF NOT EXISTS "reviews_user_id_idx" ON "reviews" ("user_id");
CREATE INDEX IF NOT EXISTS "reviews_rating_idx" ON "reviews" ("rating");

-- Products and inventory
CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products" ("category_id");
CREATE INDEX IF NOT EXISTS "product_variants_product_id_idx" ON "product_variants" ("product_id");
CREATE INDEX IF NOT EXISTS "inventory_items_variant_id_idx" ON "inventory_items" ("variant_id");
CREATE INDEX IF NOT EXISTS "inventory_items_location_id_idx" ON "inventory_items" ("location_id");

-- Orders and shopping cart
CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders" ("user_id");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items" ("order_id");
CREATE INDEX IF NOT EXISTS "shopping_cart_items_cart_id_idx" ON "shopping_cart_items" ("cart_id");

-- Create functional index for case-insensitive text search on common fields
CREATE INDEX IF NOT EXISTS "users_email_lower_idx" ON "users" (LOWER("email")) WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "clinics_name_lower_idx" ON "clinics" (LOWER("name"));
CREATE INDEX IF NOT EXISTS "pets_name_lower_idx" ON "pets" (LOWER("name"));

-- Full Text Search indexes for PostgreSQL 12+
-- Uncomment these if you're using PostgreSQL 12 or higher and need advanced text search capabilities

-- ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;
-- CREATE INDEX IF NOT EXISTS "clinics_search_idx" ON "clinics" USING GIN ("search_vector");
-- 
-- CREATE OR REPLACE FUNCTION clinic_search_vector_update() RETURNS trigger AS $$
-- BEGIN
--   NEW.search_vector := 
--     setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
--     setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
-- 
-- CREATE TRIGGER clinic_search_update
--   BEFORE INSERT OR UPDATE ON "clinics"
--   FOR EACH ROW EXECUTE FUNCTION clinic_search_vector_update();

-- Index for audit logs for better performance on time-series data
CREATE INDEX IF NOT EXISTS "audit_logs_entity_type_id_idx" ON "audit_logs" ("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" ("created_at");

-- Add appropriate indexes for permission and role checks
CREATE INDEX IF NOT EXISTS "user_roles_user_id_idx" ON "user_roles" ("user_id");
CREATE INDEX IF NOT EXISTS "user_roles_role_id_idx" ON "user_roles" ("role_id");
CREATE INDEX IF NOT EXISTS "role_permissions_role_id_idx" ON "role_permissions" ("role_id");

-- Optimize statistics and query planner
ANALYZE;
