# Database Implementation: Booking Service
# データベース実装：予約サービス

## 1. Database Architecture
## 1. データベースアーキテクチャ

### 1.1. Database Technology
### 1.1. データベース技術

**English**

The Booking Service uses PostgreSQL as the main database for the following advantages:

- **Data Integrity**: Supports ACID transactions, constraints, and foreign keys
- **Performance**: Advanced query optimization and indexing
- **Scalability**: Supports table partitioning, replication, and connection pooling
- **JSON Support**: Ability to store and query JSON data for flexibility
- **Extensibility**: Can be extended with extensions like PostGIS, pg_partman, etc.

**日本語**

予約サービスは以下の利点からメインデータベースとしてPostgreSQLを使用しています：

- **データ整合性**：ACIDトランザクション、制約、外部キーをサポート
- **パフォーマンス**：高度なクエリ最適化とインデックス作成
- **スケーラビリティ**：テーブルパーティショニング、レプリケーション、接続プーリングをサポート
- **JSONサポート**：柔軟性のためのJSONデータの保存とクエリ機能
- **拡張性**：PostGIS、pg_partmanなどの拡張機能で拡張可能

### 1.2. Deployment Architecture
### 1.2. デプロイメントアーキテクチャ

#### 1.2.1. Production Environment
#### 1.2.1. 本番環境

**English**
- **Primary**: 1 instance (8 vCPU, 32GB RAM, 500GB SSD)
- **Read Replicas**: 2 instances (4 vCPU, 16GB RAM, 500GB SSD)
- **Connection Pooling**: PgBouncer with max 500 connections
- **High Availability**: Automated failover with Patroni and etcd
- **Backup**: Point-in-time recovery with WAL archiving to object storage

**日本語**
- **プライマリ**: 1インスタンス (8 vCPU, 32GB RAM, 500GB SSD)
- **リードレプリカ**: 2インスタンス (4 vCPU, 16GB RAM, 500GB SSD)
- **接続プーリング**: PgBouncer、最大500接続
- **高可用性**: Patroniとetcdによる自動フェイルオーバー
- **バックアップ**: オブジェクトストレージへのWALアーカイブによる特定時点へのリカバリ

#### 1.2.2. Non-Production Environments
#### 1.2.2. 非本番環境

**English**
- **Staging**: 1 primary + 1 read replica (4 vCPU, 16GB RAM, 200GB SSD)
- **Development**: Single instance (2 vCPU, 8GB RAM, 100GB SSD)
- **Testing**: Single instance, periodically refreshed from production with data masking

**日本語**
- **ステージング**: 1プライマリ + 1リードレプリカ (4 vCPU, 16GB RAM, 200GB SSD)
- **開発**: 単一インスタンス (2 vCPU, 8GB RAM, 100GB SSD)
- **テスト**: 単一インスタンス、データマスキングを行い、本番から定期的に更新

## 2. Schema Design
## 2. スキーマ設計

### 2.1. Tables
### 2.1. テーブル

#### 2.1.1. `bookings`

**English**
Stores main information about confirmed bookings.

**日本語**
確認済みの予約に関する主要な情報を保存します。

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

**English**
Stores information about time slots available for booking.

**日本語**
予約用の利用可能な時間枠に関する情報を保存します。

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

**English**
Stores information about temporary reservations before booking is confirmed.

**日本語**
予約が確認される前の一時的な予約に関する情報を保存します。

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

**English**
Stores information about payments related to bookings.

**日本語**
予約に関連する支払い情報を保存します。

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

**English**
Stores the history of booking status changes for audit trail.

**日本語**
監査証跡のための予約ステータス変更の履歴を保存します。

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

## 3. Performance Optimization
## 3. パフォーマンス最適化

### 3.1. Indexing Strategy
### 3.1. インデックス作成戦略

#### 3.1.1. Primary Indexes
#### 3.1.1. プライマリインデックス

**English**
Each table has a primary key with UUID as globally unique identifier.

**日本語**
各テーブルはグローバルに一意な識別子としてUUIDをプライマリキーとして持っています。

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
### 3.2. マテリアライズドビュー

**English**
To accelerate reporting and analytics, use materialized views that are refreshed periodically:

**日本語**
レポーティングと分析を高速化するために、定期的に更新されるマテリアライズドビューを使用します：

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

#### 3.3.2. Creating Booking with Distributed Lock
#### 3.3.2. 分散ロックによる予約作成

**English**
```sql
-- 1. Get and verify slot
BEGIN;

-- 2. Create lock
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
-- Example transaction for booking cancellation and refund
-- 予約キャンセルと払い戻しのトランザクション例
BEGIN;

-- 1. Update booking status
-- 1. 予約ステータスの更新
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

### 4.3. Triggers and Stored Procedures
### 4.3. トリガーとストアドプロシージャ

**English**
Implement triggers and stored procedures to maintain data consistency:

**日本語**
データの一貫性を維持するためにトリガーとストアドプロシージャを実装します：

```sql
-- Trigger for updating timestamp
-- タイムスタンプを更新するトリガー
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
### 4.4. 並行制御

**English**
To handle concurrent access to data:

**日本語**
データへの同時アクセスを処理するために：

```sql
-- Optimistic Locking with version column
-- バージョン列を使用した楽観的ロック
UPDATE bookings
SET status = 'cancelled',
    cancelled_at = NOW(),
    version = version + 1
WHERE booking_id = '123e4567-e89b-12d3-a456-426614174006'
  AND version = 1;

-- Row-level locking for critical operations
-- 重要な操作のための行レベルロック
SELECT * FROM slots
WHERE slot_id = '123e4567-e89b-12d3-a456-426614174004'
  AND status = 'available'
  AND remaining > 0
FOR UPDATE SKIP LOCKED;
```

## 5. Schema Evolution & Migration
## 5. スキーマ進化とマイグレーション

### 5.1. Migration Strategy
### 5.1. マイグレーション戦略

**English**
Use Flyway or Liquibase for versioned migrations with the following approach:

1. **Forward-only migrations**: No rollback in production, only roll-forward
2. **Blue-Green deployments**: Deploy new schema to blue environment, then switch traffic
3. **Schema versioning**: Each migration has a sequential version number

**日本語**
以下のアプローチでバージョン管理されたマイグレーションにFlywayまたはLiquibaseを使用します：

1. **フォワードオンリーマイグレーション**：本番環境ではロールバックなし、前方移行のみ
2. **ブルー・グリーンデプロイメント**：新しいスキーマをブルー環境にデプロイし、その後トラフィックを切り替え
3. **スキーマバージョニング**：各マイグレーションは連続したバージョン番号を持つ

### 5.2. Example Migration Scripts
### 5.2. マイグレーションスクリプト例

**English**
```sql
-- V1__create_initial_schema.sql
CREATE TABLE bookings (
    -- definition as above
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

**日本語**
```sql
-- V1__create_initial_schema.sql
CREATE TABLE bookings (
    -- 上記と同じ定義
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
### 5.3. ゼロダウンタイムマイグレーション

**English**
For potentially heavy changes:

1. **Expand phase**: Add new columns/tables without constraints
2. **Migrate phase**: Dual-write to old and new columns/structures
3. **Contract phase**: Remove old columns/structures after all applications use the new ones

**日本語**
潜在的に重い変更のため：

1. **拡張フェーズ**: 制約なしで新しいカラム/テーブルを追加
2. **移行フェーズ**: 古い構造と新しい構造の両方にデュアル書き込み
3. **縮小フェーズ**: すべてのアプリケーションが新しい構造を使用した後、古いカラム/構造を削除

## 6. Sharding & Scaling Strategy
## 6. シャーディングとスケーリング戦略

### 6.1. Vertical Scaling
### 6.1. 垂直スケーリング

**English**
- **Connection Pooling**: PgBouncer with connection limits
- **Resource Allocation**: Tune memory for shared_buffers (25% RAM), work_mem, etc.
- **Hardware Scaling**: Scale up instances as needed

**日本語**
- **接続プーリング**: 接続制限付きのPgBouncer
- **リソース割り当て**: shared_buffers（RAMの25％）、work_memなどのメモリチューニング
- **ハードウェアスケーリング**: 必要に応じてインスタンスをスケールアップ

### 6.2. Horizontal Scaling
### 6.2. 水平スケーリング

**English**
#### 6.2.1. Read/Write Split
```sql
-- Primary for write
INSERT INTO bookings (...) VALUES (...);

-- Read replicas for queries
SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY;
SELECT * FROM bookings WHERE user_id = '123e4567-e89b-12d3-a456-426614174002';
```

**日本語**
#### 6.2.1. 読み書き分割
```sql
-- 書き込み用プライマリ
INSERT INTO bookings (...) VALUES (...);

-- クエリ用リードレプリカ
SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY;
SELECT * FROM bookings WHERE user_id = '123e4567-e89b-12d3-a456-426614174002';
```

**English**
#### 6.2.2. Future Sharding Strategy

When data reaches threshold (>10M bookings), implement sharding based on clinic_id:

```
booking_service_0001: clinic_id hash range 0000-3FFF
booking_service_0002: clinic_id hash range 4000-7FFF
booking_service_0003: clinic_id hash range 8000-BFFF
booking_service_0004: clinic_id hash range C000-FFFF
```

**日本語**
#### 6.2.2. 将来のシャーディング戦略

データがしきい値（1000万予約以上）に達したとき、clinic_idに基づいたシャーディングを実装します：

```
booking_service_0001: clinic_idハッシュ範囲 0000-3FFF
booking_service_0002: clinic_idハッシュ範囲 4000-7FFF
booking_service_0003: clinic_idハッシュ範囲 8000-BFFF
booking_service_0004: clinic_idハッシュ範囲 C000-FFFF
```

## 7. Backup & Recovery
## 7. バックアップと復旧

### 7.1. Backup Strategy
### 7.1. バックアップ戦略

**English**
- **Daily Full Backup**: Every day at 01:00 AM
- **Continuous WAL Archiving**: Every 15 minutes
- **Retention Policy**: 30 days for daily backups, 90 days for monthly backups

**日本語**
- **日次完全バックアップ**: 毎日午前1時00分
- **継続的WALアーカイブ**: 15分毎
- **保存ポリシー**: 日次バックアップは30日間、月次バックアップは90日間

### 7.2. Recovery Procedures
### 7.2. 復旧手順

**English**
- **Point-in-Time Recovery**: Using base backup + WAL files
- **Recovery Time Objective (RTO)**: 1 hour
- **Recovery Point Objective (RPO)**: 15 minutes

**日本語**
- **特定時点復旧**: ベースバックアップ + WALファイルを使用
- **目標復旧時間 (RTO)**: 1時間
- **目標復旧ポイント (RPO)**: 15分

### 7.3. Backup Validation
### 7.3. バックアップの検証

**English**
- Weekly restore test to isolated environment
- Data integrity check after restore

**日本語**
- 隔離環境への週次復元テスト
- 復元後のデータ整合性チェック

## 8. Performance Monitoring
## 8. パフォーマンスモニタリング

### 8.1. Key Metrics
### 8.1. 主要な指標

**English**
- Query execution time (p95, p99)
- Transaction throughput
- Lock contention
- Index hit ratio
- Table bloat
- Vacuum effectiveness

**日本語**
- クエリ実行時間 (p95, p99)
- トランザクションスループット
- ロックの競合
- インデックスヒット率
- テーブルの胃減れ
- VACUUMの有効性

### 8.2. Monitoring Queries
### 8.2. モニタリングクエリ

**English**
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

**日本語**
```sql
-- 低速クエリの特定
SELECT 
    query, calls, total_time, mean_time, 
    rows, 100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_ratio
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- インデックス使用状況
SELECT 
    schemaname, relname, indexrelname, idx_scan, 
    idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
JOIN pg_stat_user_tables USING (relid)
ORDER BY idx_scan DESC;
```
