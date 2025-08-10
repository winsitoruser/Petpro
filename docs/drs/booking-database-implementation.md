# Database Implementation: Booking Service

## 1. Database Architecture

### 1.1. Database Technology

Booking Service menggunakan PostgreSQL sebagai database utama karena keunggulan berikut:

- **Integritas Data**: Mendukung ACID transactions, constraints, dan foreign keys
- **Performance**: Optimasi query dan indexing yang canggih
- **Skalabilitas**: Mendukung table partitioning, replication, dan connection pooling
- **JSON Support**: Kemampuan menyimpan dan query data JSON untuk fleksibilitas
- **Extensibility**: Dapat diperluas dengan ekstensi seperti PostGIS, pg_partman, dll

### 1.2. Deployment Architecture

#### 1.2.1. Production Environment
- **Primary**: 1 instance (8 vCPU, 32GB RAM, 500GB SSD)
- **Read Replicas**: 2 instances (4 vCPU, 16GB RAM, 500GB SSD)
- **Connection Pooling**: PgBouncer dengan max 500 connections
- **High Availability**: Automated failover dengan Patroni dan etcd
- **Backup**: Point-in-time recovery dengan WAL archiving ke object storage

#### 1.2.2. Non-Production Environments
- **Staging**: 1 primary + 1 read replica (4 vCPU, 16GB RAM, 200GB SSD)
- **Development**: Single instance (2 vCPU, 8GB RAM, 100GB SSD)
- **Testing**: Single instance, refreshed dari produksi secara berkala dengan data masking

## 2. Schema Design

### 2.1. Tables

#### 2.1.1. `bookings`

Menyimpan informasi utama tentang booking yang telah dikonfirmasi.

```sql
CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES reservations(reservation_id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    pet_id UUID NOT NULL,
    clinic_id UUID NOT NULL,
    service_id UUID NOT NULL,
    slot_id UUID NOT NULL,
    staff_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'pending_payment',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    final_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancellation_reason VARCHAR(50),
    cancellation_notes TEXT,
    payment_id UUID,
    qr_code_url TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    CHECK (status IN ('pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show')),
    CHECK (payment_status IN ('pending', 'paid', 'refunded', 'partially_refunded', 'failed')),
    CHECK (final_amount = total_amount - discount_amount)
);

CREATE INDEX bookings_user_id_idx ON bookings(user_id);
CREATE INDEX bookings_clinic_id_idx ON bookings(clinic_id);
CREATE INDEX bookings_status_idx ON bookings(status);
CREATE INDEX bookings_created_at_idx ON bookings(created_at);
CREATE INDEX bookings_slot_id_idx ON bookings(slot_id);
```

#### 2.1.2. `slots`

Menyimpan informasi tentang slot waktu yang tersedia untuk booking.

```sql
CREATE TABLE slots (
    slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    service_id UUID NOT NULL,
    staff_id UUID,
    date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    capacity INTEGER NOT NULL DEFAULT 1,
    remaining INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    price DECIMAL(12, 2),
    version INTEGER NOT NULL DEFAULT 1,
    CHECK (status IN ('available', 'booked', 'unavailable', 'maintenance')),
    CHECK (capacity > 0),
    CHECK (remaining >= 0 AND remaining <= capacity),
    CHECK (start_time < end_time)
);

CREATE INDEX slots_clinic_id_date_idx ON slots(clinic_id, date);
CREATE INDEX slots_service_id_idx ON slots(service_id);
CREATE INDEX slots_staff_id_idx ON slots(staff_id);
CREATE INDEX slots_date_idx ON slots(date);
CREATE INDEX slots_status_idx ON slots(status);
```

#### 2.1.3. `reservations`

Menyimpan informasi tentang reservasi sementara sebelum booking dikonfirmasi.

```sql
CREATE TABLE reservations (
    reservation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    pet_id UUID NOT NULL,
    slot_id UUID NOT NULL REFERENCES slots(slot_id) ON DELETE CASCADE,
    service_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    lock_token VARCHAR(64) NOT NULL UNIQUE,
    CHECK (status IN ('pending', 'confirmed', 'expired', 'cancelled'))
);

CREATE INDEX reservations_user_id_idx ON reservations(user_id);
CREATE INDEX reservations_slot_id_idx ON reservations(slot_id);
CREATE INDEX reservations_status_idx ON reservations(status);
CREATE INDEX reservations_expires_at_idx ON reservations(expires_at);
```

#### 2.1.4. `payment_records`

Menyimpan informasi tentang pembayaran terkait booking.

```sql
CREATE TABLE payment_records (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    payment_method VARCHAR(30) NOT NULL,
    payment_provider VARCHAR(30) NOT NULL,
    provider_payment_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_url TEXT,
    expiry_time TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    refund_amount DECIMAL(12, 2),
    transaction_fee DECIMAL(10, 2),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    idempotency_key VARCHAR(64) UNIQUE,
    CHECK (status IN ('pending', 'completed', 'failed', 'expired', 'refunded', 'partially_refunded'))
);

CREATE INDEX payment_records_booking_id_idx ON payment_records(booking_id);
CREATE INDEX payment_records_status_idx ON payment_records(status);
CREATE INDEX payment_records_provider_payment_id_idx ON payment_records(provider_payment_id);
```

#### 2.1.5. `booking_history`

Menyimpan riwayat perubahan status booking untuk audit trail.

```sql
CREATE TABLE booking_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    previous_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changed_by UUID,
    change_reason TEXT,
    metadata JSONB
);

CREATE INDEX booking_history_booking_id_idx ON booking_history(booking_id);
CREATE INDEX booking_history_changed_at_idx ON booking_history(changed_at);
```

### 2.2. Partitioning Strategy

Untuk meningkatkan performa pada tabel dengan volume data tinggi, implementasikan partitioning sebagai berikut:

#### 2.2.1. Time-Based Partitioning untuk `bookings`

```sql
-- Membuat parent table dengan partitioning
CREATE TABLE bookings (
    -- kolom yang sama seperti di atas
) PARTITION BY RANGE (created_at);

-- Membuat partisi bulanan
CREATE TABLE bookings_202508 PARTITION OF bookings
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE bookings_202509 PARTITION OF bookings
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

-- Menambahkan partisi otomatis dengan pg_partman
SELECT create_parent('public.bookings', 'created_at', 'monthly', 3);
```

#### 2.2.2. Time-Based Partitioning untuk `slots`

```sql
-- Membuat parent table dengan partitioning
CREATE TABLE slots (
    -- kolom yang sama seperti di atas
) PARTITION BY RANGE (date);

-- Membuat partisi bulanan
CREATE TABLE slots_202508 PARTITION OF slots
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE slots_202509 PARTITION OF slots
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
    
-- Menambahkan partisi otomatis dengan pg_partman
SELECT create_parent('public.slots', 'date', 'monthly', 3);
```

## 3. Query Optimization

### 3.1. Indexes

Selain index yang didefinisikan pada definisi tabel di atas, berikut adalah index tambahan untuk optimasi query:

```sql
-- Untuk pencarian booking berdasarkan periode
CREATE INDEX bookings_created_at_range_idx ON bookings USING BRIN (created_at);

-- Untuk pencarian slot berdasarkan multiple kriteria
CREATE INDEX slots_composite_search_idx ON slots(clinic_id, date, status);
CREATE INDEX slots_availability_idx ON slots(clinic_id, date, status) WHERE status = 'available';

-- Index untuk query analytics
CREATE INDEX bookings_clinic_service_idx ON bookings(clinic_id, service_id, created_at);

-- Index untuk full text search pada notes
CREATE INDEX bookings_notes_idx ON bookings USING GIN (to_tsvector('indonesian', notes));
```

### 3.2. Materialized Views

Untuk mempercepat reporting dan analytics, gunakan materialized views yang direfresh secara berkala:

```sql
CREATE MATERIALIZED VIEW booking_analytics_daily AS
SELECT
    clinic_id,
    DATE_TRUNC('day', created_at) AS booking_date,
    service_id,
    COUNT(*) AS total_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_bookings,
    COUNT(CASE WHEN status = 'no_show' THEN 1 END) AS no_show_bookings,
    SUM(final_amount) AS total_revenue,
    AVG(final_amount) AS avg_booking_value
FROM
    bookings
GROUP BY
    clinic_id, DATE_TRUNC('day', created_at), service_id;

CREATE UNIQUE INDEX booking_analytics_daily_unique_idx 
ON booking_analytics_daily(clinic_id, booking_date, service_id);

-- Refresh setiap 1 jam
-- Implementasikan sebagai scheduled job
```

### 3.3. Common Query Patterns

#### 3.3.1. Mencari Slot yang Tersedia

```sql
EXPLAIN ANALYZE
SELECT s.* 
FROM slots s
WHERE s.clinic_id = '123e4567-e89b-12d3-a456-426614174000'
  AND s.date = '2025-08-15'
  AND s.service_id = '123e4567-e89b-12d3-a456-426614174001'
  AND s.status = 'available'
  AND s.remaining > 0
ORDER BY s.start_time ASC;
```

#### 3.3.2. Membuat Booking dengan Distributed Lock

```sql
-- 1. Mendapatkan dan verifikasi slot
BEGIN;

-- 2. Membuat lock
INSERT INTO reservations (
    user_id, pet_id, slot_id, service_id, expires_at, lock_token
) VALUES (
    '123e4567-e89b-12d3-a456-426614174002',
    '123e4567-e89b-12d3-a456-426614174003',
    '123e4567-e89b-12d3-a456-426614174004',
    '123e4567-e89b-12d3-a456-426614174001',
    NOW() + INTERVAL '10 minutes',
    'unique-lock-token-123'
);

-- 3. Update slot remaining
UPDATE slots 
SET remaining = remaining - 1,
    updated_at = NOW(),
    version = version + 1
WHERE slot_id = '123e4567-e89b-12d3-a456-426614174004'
  AND remaining > 0
  AND version = 1
RETURNING *;

COMMIT;
```

#### 3.3.3. Konfirmasi Booking dari Reservasi

```sql
BEGIN;

-- 1. Verifikasi reservasi
SELECT * FROM reservations 
WHERE reservation_id = '123e4567-e89b-12d3-a456-426614174005'
  AND status = 'pending'
  AND expires_at > NOW()
  AND lock_token = 'unique-lock-token-123'
FOR UPDATE;

-- 2. Membuat booking
INSERT INTO bookings (
    reservation_id, user_id, pet_id, clinic_id, service_id,
    slot_id, total_amount, final_amount, currency
) 
SELECT 
    r.reservation_id, r.user_id, r.pet_id, s.clinic_id, r.service_id,
    r.slot_id, COALESCE(s.price, 0), COALESCE(s.price, 0), 'IDR'
FROM reservations r
JOIN slots s ON r.slot_id = s.slot_id
WHERE r.reservation_id = '123e4567-e89b-12d3-a456-426614174005';

-- 3. Update status reservasi
UPDATE reservations
SET status = 'confirmed',
    updated_at = NOW()
WHERE reservation_id = '123e4567-e89b-12d3-a456-426614174005';

-- 4. Update status slot jika fully booked
UPDATE slots
SET status = CASE WHEN remaining = 0 THEN 'booked' ELSE status END,
    updated_at = NOW()
WHERE slot_id = '123e4567-e89b-12d3-a456-426614174004';

COMMIT;
```

## 4. Data Integrity & Consistency

### 4.1. Constraints

Selain constraints pada definisi tabel, implementasikan constraints berikut untuk menjaga integritas data:

```sql
-- Mencegah overlap booking untuk staff yang sama
CREATE UNIQUE INDEX no_staff_overlap_idx 
ON slots (staff_id, daterange(start_time, end_time)) 
WHERE staff_id IS NOT NULL;

-- Memastikan payment_status konsisten dengan status
ALTER TABLE bookings
ADD CONSTRAINT check_payment_status
CHECK (
    (status = 'pending_payment' AND payment_status = 'pending') OR
    (status = 'confirmed' AND payment_status = 'paid') OR
    (status = 'cancelled' AND payment_status IN ('refunded', 'partially_refunded', 'failed')) OR
    (status IN ('in_progress', 'completed', 'no_show'))
);

-- Foreign keys dengan proper indexing
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_slot
FOREIGN KEY (slot_id) REFERENCES slots(slot_id);
```

### 4.2. Transactions

Implementasikan transactions untuk operasi kritikal:

```sql
-- Contoh transaction untuk pembatalan booking dan refund
BEGIN;

-- 1. Update booking status
UPDATE bookings
SET status = 'cancelled',
    cancelled_at = NOW(),
    cancellation_reason = 'customer_request',
    cancellation_notes = 'Customer requested cancellation due to schedule conflict',
    updated_at = NOW(),
    version = version + 1
WHERE booking_id = '123e4567-e89b-12d3-a456-426614174006'
  AND status = 'confirmed'
  AND version = 1;

-- 2. Update slot availability
UPDATE slots
SET remaining = remaining + 1,
    status = 'available',
    updated_at = NOW()
WHERE slot_id = (
    SELECT slot_id FROM bookings
    WHERE booking_id = '123e4567-e89b-12d3-a456-426614174006'
);

-- 3. Create refund record
INSERT INTO payment_records (
    booking_id, amount, currency, payment_method, 
    payment_provider, status, refunded_at
)
SELECT 
    booking_id, final_amount * 0.9, currency, 'refund', 
    'system', 'refunded', NOW()
FROM bookings
WHERE booking_id = '123e4567-e89b-12d3-a456-426614174006';

-- 4. Insert history record
INSERT INTO booking_history (
    booking_id, previous_status, new_status, 
    change_reason, metadata
)
VALUES (
    '123e4567-e89b-12d3-a456-426614174006',
    'confirmed', 'cancelled',
    'customer_request',
    '{"refund_percentage": 90, "policy_applied": "standard_cancellation"}'::jsonb
);

COMMIT;
```

### 4.3. Triggers dan Stored Procedures

Implementasikan triggers dan stored procedures untuk menjaga konsistensi data:

```sql
-- Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_update_timestamp
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger untuk booking history
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO booking_history (
            booking_id, previous_status, new_status, 
            changed_by, change_reason
        ) VALUES (
            NEW.booking_id, OLD.status, NEW.status, 
            current_setting('app.user_id', true)::uuid, 
            TG_ARGV[0]
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_status_change
AFTER UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION log_booking_status_change('system_update');
```

### 4.4. Concurrency Control

Untuk menangani akses konkuren ke data:

```sql
-- Optimistic Locking dengan version column
UPDATE bookings
SET status = 'cancelled',
    cancelled_at = NOW(),
    version = version + 1
WHERE booking_id = '123e4567-e89b-12d3-a456-426614174006'
  AND version = 1;

-- Row-level locking untuk operasi kritikal
SELECT * FROM slots
WHERE slot_id = '123e4567-e89b-12d3-a456-426614174004'
  AND status = 'available'
  AND remaining > 0
FOR UPDATE SKIP LOCKED;
```

## 5. Schema Evolution & Migration

### 5.1. Migration Strategy

Gunakan Flyway atau Liquibase untuk versioned migrations dengan pendekatan berikut:

1. **Forward-only migrations**: Tidak ada rollback pada prod, hanya roll-forward
2. **Blue-Green deployments**: Deploy schema baru ke blue environment, lalu switch traffic
3. **Schema versioning**: Setiap migration memiliki version number yang sequential

### 5.2. Contoh Migration Scripts

```sql
-- V1__create_initial_schema.sql
CREATE TABLE bookings (
    -- definisi seperti di atas
);

-- V2__add_booking_source.sql
ALTER TABLE bookings
ADD COLUMN booking_source VARCHAR(20) DEFAULT 'app';

-- V3__add_payment_provider_enum.sql
CREATE TYPE payment_provider_enum AS ENUM (
    'midtrans', 'xendit', 'manual', 'system'
);

ALTER TABLE payment_records
ALTER COLUMN payment_provider TYPE payment_provider_enum
USING payment_provider::payment_provider_enum;
```

### 5.3. Zero-Downtime Migration

Untuk perubahan yang potensial berat:

1. **Expand phase**: Tambahkan kolom/tabel baru tanpa constraints
2. **Migrate phase**: Dual-write ke kolom/struktur lama dan baru
3. **Contract phase**: Hapus kolom/struktur lama setelah semua aplikasi menggunakan yang baru

## 6. Sharding & Scaling Strategy

### 6.1. Vertical Scaling

- **Connection Pooling**: PgBouncer dengan connection limits
- **Resource Allocation**: Tune memory untuk shared_buffers (25% RAM), work_mem, etc.
- **Hardware Scaling**: Scale up instances saat diperlukan

### 6.2. Horizontal Scaling

#### 6.2.1. Read/Write Split
```sql
-- Primary untuk write
INSERT INTO bookings (...) VALUES (...);

-- Read replicas untuk query
SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY;
SELECT * FROM bookings WHERE user_id = '123e4567-e89b-12d3-a456-426614174002';
```

#### 6.2.2. Future Sharding Strategy

Saat data mencapai threshold (>10M bookings), implementasikan sharding berdasarkan clinic_id:

```
booking_service_0001: clinic_id hash range 0000-3FFF
booking_service_0002: clinic_id hash range 4000-7FFF
booking_service_0003: clinic_id hash range 8000-BFFF
booking_service_0004: clinic_id hash range C000-FFFF
```

## 7. Backup & Recovery

### 7.1. Backup Strategy

- **Daily Full Backup**: Setiap hari pukul 01:00 WIB
- **Continuous WAL Archiving**: Setiap 15 menit
- **Retention Policy**: 30 hari untuk daily backups, 90 hari untuk monthly backups

### 7.2. Recovery Procedures

- **Point-in-Time Recovery**: Menggunakan base backup + WAL files
- **Recovery Time Objective (RTO)**: 1 jam
- **Recovery Point Objective (RPO)**: 15 menit

### 7.3. Backup Validation

- Weekly restore test ke isolated environment
- Data integrity check setelah restore

## 8. Performance Monitoring

### 8.1. Key Metrics

- Query execution time (p95, p99)
- Transaction throughput
- Lock contention
- Index hit ratio
- Table bloat
- Vacuum effectiveness

### 8.2. Monitoring Queries

```sql
-- Slow query identification
SELECT 
    query, calls, total_time, mean_time, 
    rows, 100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_ratio
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Index usage
SELECT 
    schemaname, relname, indexrelname, idx_scan, 
    idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
JOIN pg_stat_user_tables USING (relid)
ORDER BY idx_scan DESC;
```
