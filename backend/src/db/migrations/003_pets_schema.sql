-- Pets Schema for PetPro
-- Creates tables for pets, health records, and related information

-- Pet Management
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    species pet_species NOT NULL,
    breed VARCHAR(100),
    birth_date DATE,
    weight_kg DECIMAL(5,2),
    sex VARCHAR(10),
    microchip_id VARCHAR(50),
    description TEXT,
    profile_image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE pets IS 'Stores information about customer pets';

CREATE TABLE pet_health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    record_type VARCHAR(50) NOT NULL, -- vaccination, checkup, treatment, surgery, etc.
    record_date DATE NOT NULL,
    description TEXT NOT NULL,
    performed_by VARCHAR(255), -- Name of veterinarian/technician
    clinic_id UUID, -- Will reference clinics table
    diagnosis TEXT,
    treatment TEXT,
    medications TEXT,
    notes TEXT,
    follow_up_date DATE,
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE pet_health_records IS 'Medical and health records for pets';

CREATE TABLE pet_vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    vaccination_type VARCHAR(100) NOT NULL,
    administered_date DATE NOT NULL,
    expiration_date DATE,
    administered_by VARCHAR(255),
    clinic_id UUID, -- Will reference clinics table
    lot_number VARCHAR(100),
    notes TEXT,
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE pet_vaccinations IS 'Vaccination records for pets';

CREATE TABLE pet_allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    allergen VARCHAR(255) NOT NULL,
    severity VARCHAR(50), -- mild, moderate, severe
    diagnosed_date DATE,
    symptoms TEXT,
    treatment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE pet_allergies IS 'Allergy information for pets';

CREATE TABLE pet_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    prescribed_by VARCHAR(255),
    clinic_id UUID, -- Will reference clinics table
    condition_treated TEXT,
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE pet_medications IS 'Current and past medications for pets';

-- Create indexes
CREATE INDEX idx_pets_owner_id ON pets(owner_id);
CREATE INDEX idx_pets_species ON pets(species);
CREATE INDEX idx_pets_breed ON pets(breed);
CREATE INDEX idx_pets_active ON pets(active) WHERE active = TRUE;

CREATE INDEX idx_pet_health_records_pet_id ON pet_health_records(pet_id);
CREATE INDEX idx_pet_health_records_record_date ON pet_health_records(record_date);
CREATE INDEX idx_pet_health_records_record_type ON pet_health_records(record_type);

CREATE INDEX idx_pet_vaccinations_pet_id ON pet_vaccinations(pet_id);
CREATE INDEX idx_pet_vaccinations_type ON pet_vaccinations(vaccination_type);
CREATE INDEX idx_pet_vaccinations_expiration ON pet_vaccinations(expiration_date);

CREATE INDEX idx_pet_allergies_pet_id ON pet_allergies(pet_id);
CREATE INDEX idx_pet_medications_pet_id ON pet_medications(pet_id);
CREATE INDEX idx_pet_medications_active ON pet_medications(active) WHERE active = TRUE;

-- Set up automatic updated_at timestamp triggers
CREATE TRIGGER set_timestamp_pets
BEFORE UPDATE ON pets
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_pet_health_records
BEFORE UPDATE ON pet_health_records
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_pet_vaccinations
BEFORE UPDATE ON pet_vaccinations
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_pet_allergies
BEFORE UPDATE ON pet_allergies
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_pet_medications
BEFORE UPDATE ON pet_medications
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

-- Set up audit triggers
CREATE TRIGGER audit_pets_changes
AFTER INSERT OR UPDATE OR DELETE ON pets
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

CREATE TRIGGER audit_pet_health_records_changes
AFTER INSERT OR UPDATE OR DELETE ON pet_health_records
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

CREATE TRIGGER audit_pet_vaccinations_changes
AFTER INSERT OR UPDATE OR DELETE ON pet_vaccinations
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

CREATE TRIGGER audit_pet_allergies_changes
AFTER INSERT OR UPDATE OR DELETE ON pet_allergies
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

CREATE TRIGGER audit_pet_medications_changes
AFTER INSERT OR UPDATE OR DELETE ON pet_medications
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();
