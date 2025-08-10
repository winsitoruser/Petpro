# Level 2 Architecture: Booking Service

## 1. Gambaran Umum

Booking Service adalah salah satu komponen inti pada platform PetPro yang bertanggung jawab untuk mengelola seluruh alur reservasi dan booking layanan klinik hewan. Service ini dirancang dengan arsitektur microservice yang mengutamakan kehandalan, skalabilitas, dan konsistensi data.

## 2. Arsitektur Internal

### 2.1. Komponen Utama

![Booking Service Architecture - Level 2](../diagrams/booking-service-architecture-l2.png)

#### 2.1.1. API Layer
- **BookingController**: Menangani seluruh API endpoint terkait booking
- **SlotController**: Menangani API endpoint untuk ketersediaan dan manajemen slot waktu
- **ReservationController**: Menangani API endpoint untuk reservasi sementara

#### 2.1.2. Service Layer
- **BookingService**: Logika bisnis utama terkait booking
- **SlotService**: Logika bisnis untuk manajemen slot waktu dan ketersediaan
- **ReservationService**: Logika bisnis untuk reservasi slot sementara
- **PaymentIntegrationService**: Integrasi dengan Payment Service
- **NotificationDispatchService**: Mengirim notifikasi melalui Message Queue

#### 2.1.3. Domain Layer
- **BookingDomain**: Entitas dan business rules terkait booking
- **SlotDomain**: Entitas dan business rules terkait slot waktu
- **ReservationDomain**: Entitas dan business rules terkait reservasi

#### 2.1.4. Repository Layer
- **BookingRepository**: Akses data untuk entitas booking
- **SlotRepository**: Akses data untuk entitas slot
- **ReservationRepository**: Akses data untuk entitas reservasi

#### 2.1.5. Infrastructure Layer
- **DistributedLockManager**: Mengelola locking pada slot untuk mencegah double booking
- **EventPublisher**: Mempublikasikan domain events ke Message Queue
- **CacheManager**: Mengelola cache untuk data yang sering diakses

## 3. Interaksi dengan External Services

### 3.1. Dependencies (Incoming)

#### 3.1.1. User Service
- **Deskripsi**: Menyediakan informasi pengguna dan hewan peliharaan
- **Interface**: REST API
- **Endpoint**: `/api/v1/users/{userId}`, `/api/v1/users/{userId}/pets`
- **Authentication**: JWT Bearer Token (service-to-service)
- **Timeout**: 1000ms
- **Retry Policy**: Max 2 retries dengan exponential backoff
- **Circuit Breaker**: Threshold 5 failures dalam 10 detik

#### 3.1.2. Clinic Service
- **Deskripsi**: Menyediakan informasi klinik dan layanan
- **Interface**: REST API
- **Endpoint**: `/api/v1/clinics/{clinicId}`, `/api/v1/clinics/{clinicId}/services`
- **Authentication**: JWT Bearer Token (service-to-service)
- **Timeout**: 1000ms
- **Retry Policy**: Max 2 retries dengan exponential backoff
- **Circuit Breaker**: Threshold 5 failures dalam 10 detik

### 3.2. Dependencies (Outgoing)

#### 3.2.1. Payment Service
- **Deskripsi**: Menangani proses pembayaran booking
- **Interface**: REST API dan Webhook
- **Endpoint**: `/api/v1/payments/create`, `/api/v1/payments/{paymentId}`
- **Authentication**: API Key
- **Timeout**: 3000ms
- **Retry Policy**: Max 3 retries dengan exponential backoff
- **Idempotency**: Key berbasis BookingId dan timestamp

#### 3.2.2. Notification Service (via Message Queue)
- **Deskripsi**: Mengirim notifikasi terkait booking
- **Interface**: Message Queue (Kafka/RabbitMQ)
- **Topics/Queues**: 
  - `booking.notification.email`
  - `booking.notification.push`
  - `booking.notification.sms`
- **Message Format**: JSON dengan schema validasi
- **Delivery Guarantee**: At-least-once

#### 3.2.3. Analytics Service (via Message Queue)
- **Deskripsi**: Mengumpulkan data analitik terkait booking
- **Interface**: Message Queue (Kafka)
- **Topics**: `booking.events.analytics`
- **Message Format**: JSON dengan event timestamp dan metadata
- **Delivery Guarantee**: At-least-once

## 4. Data Management

### 4.1. Database

#### 4.1.1. Primary Database
- **Type**: PostgreSQL
- **Schema**: `booking_service`
- **Primary Tables**: 
  - `bookings`
  - `slots`
  - `reservations`
  - `payment_records`
  - `booking_history`
- **Replikasi**: Master-Slave dengan 2 read replicas
- **Backup Strategy**: Daily full backup, hourly incremental backup

#### 4.1.2. Cache Layer
- **Type**: Redis Cluster
- **TTL Settings**:
  - Slot availability: 5 menit
  - Clinic service info: 30 menit
  - User preferences: 60 menit
- **Eviction Policy**: Volatile-LRU
- **Cache Invalidation**: Event-based + time-based

### 4.2. Distributed Locking

#### 4.2.1. Mekanisme
- **Technology**: Redis dengan Redlock algorithm
- **Lock TTL**: 30 detik (bisa diperpanjang)
- **Lock Resources**: Berbasis `clinic_id + service_id + slot_id`
- **Retry Mechanism**: Exponential backoff dengan jitter

#### 4.2.2. Race Condition Handling
- Optimistic locking pada database menggunakan version column
- Reservasi dua fase (temporary lock + confirm)
- Transaction isolation level: SERIALIZABLE untuk operasi booking

### 4.3. Event Sourcing

#### 4.3.1. Domain Events
- `SlotCreated`
- `SlotUpdated`
- `ReservationCreated`
- `ReservationConfirmed`
- `ReservationExpired`
- `BookingCreated`
- `BookingPaid`
- `BookingConfirmed`
- `BookingCancelled`
- `BookingRescheduled`

#### 4.3.2. Event Store
- **Type**: Dedicated event table dalam PostgreSQL
- **Struktur**: `event_id`, `aggregate_id`, `event_type`, `payload`, `metadata`, `created_at`
- **Indexing**: Index pada `aggregate_id` dan `created_at`

## 5. Non-Functional Requirements (Level 2)

### 5.1. Performance

#### 5.1.1. Latency Targets
- API Response Time (95th percentile):
  - GET operations: < 200ms
  - POST/PUT operations: < 500ms
  - Slot search operations: < 300ms
- Database Query Time:
  - Simple queries: < 50ms
  - Complex queries: < 200ms

#### 5.1.2. Throughput
- Peak load: 500 requests/second
- Average load: 100 requests/second
- Batch processing capacity: 1000 bookings/minute untuk pembersihan reservasi

### 5.2. Scalability

#### 5.2.1. Horizontal Scaling
- Stateless API layer untuk scaling out
- Database connection pooling: 20-50 koneksi per instance
- Auto-scaling policy berdasarkan CPU (70%) dan request rate

#### 5.2.2. Caching Strategy
- Multi-level caching (application + Redis)
- Cache warming untuk data yang sering diakses (slot populer)
- Consistent hashing untuk distribusi cache di cluster

### 5.3. Availability & Reliability

#### 5.3.1. SLA Target
- Uptime: 99.95% (monthly)
- Planned maintenance window: 2 jam per bulan (off-peak)

#### 5.3.2. Fault Tolerance
- Multiple availability zones
- Database failover otomatis
- Circuit breakers untuk dependencies
- Graceful degradation (mode offline untuk beberapa fungsi)

#### 5.3.3. Monitoring & Alerting
- Health checks setiap 30 detik
- Alert pada:
  - Error rate > 1%
  - P95 latency > 1000ms
  - Database connection pool utilization > 80%

### 5.4. Security

#### 5.4.1. Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Resource-level permissions

#### 5.4.2. Data Protection
- Encryption at rest untuk semua data sensitif
- TLS 1.3 untuk semua komunikasi
- PII data handling sesuai GDPR

#### 5.4.3. Rate Limiting
- Per-user: 60 requests/minute
- Per-IP: 120 requests/minute
- Whitelist untuk service-to-service communication

## 6. Deployment Architecture

### 6.1. Container Strategy

#### 6.1.1. Containerization
- Docker images berdasarkan distroless base image
- Multi-stage builds untuk meminimalkan image size
- Resource limits: 1 CPU, 1GB memory per container

#### 6.1.2. Orchestration
- Kubernetes deployment dengan 3-5 replicas
- Horizontal Pod Autoscaler (HPA) berdasarkan CPU dan memory
- Pod anti-affinity untuk availability
- Readiness dan liveness probes

### 6.2. CI/CD Pipeline

#### 6.2.1. Build & Test
- Build: Maven/Gradle dengan versioning otomatis
- Unit tests: JUnit/TestNG dengan min 80% code coverage
- Integration tests: Testcontainers dan WireMock

#### 6.2.2. Deployment Strategy
- Blue/Green deployment
- Canary release untuk fitur baru (10% traffic)
- Rollback otomatis jika health check gagal

## 7. Operational Considerations

### 7.1. Logging

#### 7.1.1. Log Format
- JSON structured logging
- Mandatory fields: timestamp, service, traceId, spanId, level, message
- Context-specific fields: userId, bookingId, clinicId, etc.

#### 7.1.2. Log Management
- Centralized logging dengan ELK stack
- Log retention: 30 hari online, 1 tahun archived
- Log level: INFO pada production, DEBUG pada staging

### 7.2. Monitoring & Tracing

#### 7.2.1. Metrics
- Technical metrics: CPU, memory, disk, network
- Business metrics: booking rate, completion rate, cancellation rate
- SLA metrics: availability, latency, error rate

#### 7.2.2. Distributed Tracing
- OpenTelemetry implementation
- Sampling rate: 10% pada production, 100% pada staging
- Critical path tracing untuk booking flow

### 7.3. Disaster Recovery

#### 7.3.1. Backup Strategy
- Database: Daily full backup, hourly incremental
- Config & secrets: Version-controlled and encrypted
- Recovery Time Objective (RTO): 1 jam
- Recovery Point Objective (RPO): 15 menit

#### 7.3.2. Failover Process
- Automated failover untuk database
- Regional failover dengan manual approval
- Data consistency check setelah recovery

## 8. Architecture Decision Records

### 8.1. ADR-001: Distributed Locking dengan Redis

**Konteks**: Perlu mekanisme untuk mencegah double-booking pada slot yang sama.

**Keputusan**: Menggunakan Redis dengan algoritma Redlock untuk distributed locking.

**Alasan**:
- Performance: Redis memiliki latency yang sangat rendah
- Reliability: Dengan implementasi Redlock, fault-tolerance meningkat
- Simplicity: API sederhana dan mudah diimplementasikan

**Alternatif**:
- Database locking: Terlalu berat dan menyebabkan contention
- Zookeeper: Kompleks untuk kasus penggunaan sederhana
- Etcd: Memerlukan infrastruktur tambahan

**Konsekuensi**:
- Memerlukan cluster Redis yang reliable
- Perlu handling untuk kasus Redis failure
- Perlu mempertimbangkan clock drift antar node

### 8.2. ADR-002: Event-Driven Architecture untuk Notifikasi

**Konteks**: Notifikasi booking perlu dikirim melalui berbagai channel (email, push, SMS).

**Keputusan**: Menggunakan event-driven architecture dengan Message Queue.

**Alasan**:
- Decoupling: Booking service tidak perlu tahu detail implementasi notifikasi
- Scalability: Notifikasi dapat diproses secara asynchronous
- Reliability: Message queue menjamin delivery bahkan saat notification service down

**Alternatif**:
- Synchronous API calls: Menambah latency pada booking process
- Webhook: Kompleks untuk scale dan monitor
- Database polling: Resource intensive dan tidak real-time

**Konsekuensi**:
- Perlu mengelola infrastruktur message queue
- Eventual consistency untuk status notifikasi
- Perlu handling untuk idempotency
