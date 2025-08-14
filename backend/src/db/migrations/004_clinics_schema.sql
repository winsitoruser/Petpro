-- Clinics Schema for PetPro
-- Creates tables for clinics, services, appointments, and staff

-- Clinic Management
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website_url VARCHAR(255),
    logo_url TEXT,
    banner_url TEXT,
    operating_hours JSONB DEFAULT '{}'::jsonb,
    average_rating DECIMAL(3,2),
    verified BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE clinics IS 'Veterinary clinics and service providers';

CREATE TABLE clinic_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE clinic_services IS 'Services offered by veterinary clinics';

CREATE TABLE clinic_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    specialties TEXT[],
    bio TEXT,
    profile_image_url TEXT,
    email VARCHAR(255),
    phone VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE clinic_staff IS 'Staff members at veterinary clinics';

CREATE TABLE clinic_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES clinic_staff(id) ON DELETE CASCADE,
    service_id UUID REFERENCES clinic_services(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (end_time > start_time),
    capacity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE clinic_availability IS 'Schedule and availability for clinics and staff';

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES clinic_services(id) ON DELETE RESTRICT,
    staff_id UUID REFERENCES clinic_staff(id) ON DELETE SET NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE appointments IS 'Appointments for pet services at clinics';

CREATE TABLE appointment_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES clinic_staff(id) ON DELETE SET NULL,
    note_text TEXT NOT NULL,
    private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE appointment_notes IS 'Notes and follow-ups for appointments';

-- Create indexes
CREATE INDEX idx_clinics_vendor_id ON clinics(vendor_id);
CREATE INDEX idx_clinics_active ON clinics(active) WHERE active = TRUE;
CREATE INDEX idx_clinics_verified ON clinics(verified) WHERE verified = TRUE;
CREATE INDEX idx_clinics_rating ON clinics(average_rating);

CREATE INDEX idx_clinic_services_clinic_id ON clinic_services(clinic_id);
CREATE INDEX idx_clinic_services_category ON clinic_services(category);
CREATE INDEX idx_clinic_services_available ON clinic_services(available) WHERE available = TRUE;

CREATE INDEX idx_clinic_staff_clinic_id ON clinic_staff(clinic_id);
CREATE INDEX idx_clinic_staff_user_id ON clinic_staff(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX idx_clinic_availability_clinic_id ON clinic_availability(clinic_id);
CREATE INDEX idx_clinic_availability_staff_id ON clinic_availability(staff_id) WHERE staff_id IS NOT NULL;
CREATE INDEX idx_clinic_availability_service_id ON clinic_availability(service_id) WHERE service_id IS NOT NULL;
CREATE INDEX idx_clinic_availability_day_time ON clinic_availability(day_of_week, start_time, end_time);

CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id) WHERE staff_id IS NOT NULL;
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_date ON appointments((start_time::date));

-- Set up automatic updated_at timestamp triggers
CREATE TRIGGER set_timestamp_clinics
BEFORE UPDATE ON clinics
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_clinic_services
BEFORE UPDATE ON clinic_services
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_clinic_staff
BEFORE UPDATE ON clinic_staff
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_clinic_availability
BEFORE UPDATE ON clinic_availability
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_appointments
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER set_timestamp_appointment_notes
BEFORE UPDATE ON appointment_notes
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

-- Set up audit triggers
CREATE TRIGGER audit_clinics_changes
AFTER INSERT OR UPDATE OR DELETE ON clinics
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

CREATE TRIGGER audit_clinic_services_changes
AFTER INSERT OR UPDATE OR DELETE ON clinic_services
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

CREATE TRIGGER audit_clinic_staff_changes
AFTER INSERT OR UPDATE OR DELETE ON clinic_staff
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

CREATE TRIGGER audit_appointments_changes
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

-- Add foreign key constraint to pet_health_records and pet_vaccinations
ALTER TABLE pet_health_records ADD CONSTRAINT fk_pet_health_records_clinic
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL;
    
ALTER TABLE pet_vaccinations ADD CONSTRAINT fk_pet_vaccinations_clinic
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL;
    
ALTER TABLE pet_medications ADD CONSTRAINT fk_pet_medications_clinic
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL;
