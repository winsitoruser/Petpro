# Rincian Tugas Proyek PetPro (Bagian 1)

## Gambaran Umum Jadwal Proyek

| Fase | Tanggal Mulai | Tanggal Selesai | Fokus |
|-------|------------|----------|-------|
| Fase 1 | 1 Sep 2025 | 31 Okt 2025 | Infrastruktur Dasar & Autentikasi |
| Fase 2 | 1 Nov 2025 | 31 Des 2025 | Manajemen Pengguna & Klinik |
| Fase 3 | 1 Jan 2026 | 28 Feb 2026 | Sistem Pemesanan & Fitur Real-Time |
| Fase 4 | 1 Mar 2026 | 30 Apr 2026 | Katalog Produk & E-Commerce |
| Fase 5 | 1 Mei 2026 | 30 Jun 2026 | Pelaporan & Analitik |
| Fase 6 | 1 Jul 2026 | 31 Agu 2026 | Pengujian Akhir & Rilis Produksi |

## Tugas Microservices Backend

### Layanan API Gateway

#### Fase 1 (1 Sep - 15 Okt 2025)

##### Implementasi Dasar Gateway
- **Tugas**: Menyiapkan fondasi API Gateway
- **Story Points**: 8
- **Tenggat Waktu**: 15 Sep 2025
- **Detail**: Mengimplementasikan dasar API Gateway menggunakan Express.js dengan routing, logging, dan penanganan kesalahan. Mengonfigurasi routing endpoint dasar dan penemuan layanan.

##### Integrasi Autentikasi
- **Tugas**: Integrasi dengan layanan Auth
- **Story Points**: 5
- **Tenggat Waktu**: 30 Sep 2025
- **Detail**: Menyiapkan middleware validasi JWT, mengimplementasikan verifikasi token, dan membuat perlindungan rute berdasarkan peran pengguna.

##### Pembatasan Rate & Keamanan
- **Tugas**: Menerapkan pembatasan rate dan fitur keamanan
- **Story Points**: 5
- **Tenggat Waktu**: 15 Okt 2025
- **Detail**: Menambahkan pembatasan rate untuk endpoint API, mengimplementasikan pemblokiran IP, menambahkan konfigurasi CORS, dan menyiapkan perlindungan DDoS dasar.

#### Fase 2 (1 Nov - 30 Nov 2025)

##### Penemuan Layanan
- **Tugas**: Implementasi mekanisme penemuan layanan
- **Story Points**: 8
- **Tenggat Waktu**: 15 Nov 2025
- **Detail**: Menyiapkan penemuan layanan dinamis untuk secara otomatis mendeteksi dan mengarahkan ke microservices yang tersedia.

##### Dokumentasi API
- **Tugas**: Membuat dokumentasi API yang komprehensif
- **Story Points**: 5
- **Tenggat Waktu**: 30 Nov 2025
- **Detail**: Menyiapkan dokumentasi Swagger/OpenAPI untuk semua endpoint dengan deskripsi detail, contoh permintaan/respons, dan persyaratan autentikasi.

#### Fase 3 (1 Jan - 30 Jan 2026)

##### Proxy WebSocket
- **Tugas**: Mengimplementasikan proxy WebSocket untuk layanan real-time
- **Story Points**: 8
- **Tenggat Waktu**: 15 Jan 2026
- **Detail**: Membuat fungsionalitas proxy WebSocket untuk meneruskan koneksi socket ke layanan yang sesuai dengan autentikasi.

##### Pola Circuit Breaker
- **Tugas**: Mengimplementasikan circuit breaker untuk ketahanan layanan
- **Story Points**: 5
- **Tenggat Waktu**: 30 Jan 2026
- **Detail**: Menambahkan pola circuit breaker untuk menangani kegagalan layanan dengan baik dan mencegah kegagalan beruntun.

### Layanan Autentikasi

#### Fase 1 (1 Sep - 31 Okt 2025)

##### Autentikasi Pengguna
- **Tugas**: Mengimplementasikan sistem autentikasi inti
- **Story Points**: 13
- **Tenggat Waktu**: 20 Sep 2025
- **Detail**: Membuat endpoint autentikasi untuk login, registrasi, reset kata sandi, dan verifikasi akun. Mengimplementasikan pembuatan dan validasi token JWT.

##### Autentikasi Sosial
- **Tugas**: Menambahkan penyedia OAuth
- **Story Points**: 8
- **Tenggat Waktu**: 10 Okt 2025
- **Detail**: Integrasi dengan penyedia autentikasi Google, Facebook, dan Apple. Membuat penggabungan profil terpadu untuk akun di berbagai penyedia.

##### Kontrol Akses Berbasis Peran
- **Tugas**: Mengimplementasikan sistem RBAC
- **Story Points**: 8
- **Tenggat Waktu**: 31 Okt 2025
- **Detail**: Membuat model peran dan izin, mengimplementasikan middleware kontrol akses, dan menambahkan alat admin untuk manajemen peran.

#### Fase 2 (1 Nov - 30 Nov 2025)

##### Autentikasi Multi-Faktor
- **Tugas**: Menambahkan dukungan MFA
- **Story Points**: 8
- **Tenggat Waktu**: 20 Nov 2025
- **Detail**: Mengimplementasikan opsi MFA SMS dan aplikasi autentikasi dengan kode cadangan dan mekanisme pemulihan akun.

##### Manajemen Sesi
- **Tugas**: Penanganan sesi yang ditingkatkan
- **Story Points**: 5
- **Tenggat Waktu**: 30 Nov 2025
- **Detail**: Menambahkan pelacakan sesi dengan fingerprinting perangkat, batas sesi bersamaan, dan kemampuan logout paksa.

### Layanan Pengguna

#### Fase 2 (1 Nov - 15 Des 2025)

##### Manajemen Profil Pengguna
- **Tugas**: Membuat endpoint profil pengguna
- **Story Points**: 8
- **Tenggat Waktu**: 15 Nov 2025
- **Detail**: Mengimplementasikan operasi CRUD untuk profil pengguna, pelacakan kelengkapan profil, dan manajemen avatar.

##### Manajemen Profil Hewan Peliharaan
- **Tugas**: Mengimplementasikan sistem profil hewan peliharaan
- **Story Points**: 8
- **Tenggat Waktu**: 1 Des 2025
- **Detail**: Membuat operasi CRUD untuk profil hewan peliharaan termasuk spesies, ras, umur, riwayat medis, dan fungsionalitas pengunggahan gambar.

##### Preferensi Pengguna
- **Tugas**: Membangun sistem preferensi pengguna
- **Story Points**: 5
- **Tenggat Waktu**: 15 Des 2025
- **Detail**: Mengimplementasikan penyimpanan preferensi pengguna untuk notifikasi, bahasa, opsi tampilan, dan vendor favorit.

### Layanan Klinik

#### Fase 2 (15 Nov - 31 Des 2025)

##### Manajemen Profil Klinik
- **Tugas**: Mengimplementasikan endpoint profil klinik
- **Story Points**: 8
- **Tenggat Waktu**: 1 Des 2025
- **Detail**: Membuat operasi CRUD untuk profil klinik termasuk layanan yang ditawarkan, jam operasional, data lokasi, dan informasi staf.

##### Manajemen Layanan
- **Tugas**: Membangun sistem katalog layanan
- **Story Points**: 8
- **Tenggat Waktu**: 15 Des 2025
- **Detail**: Mengimplementasikan endpoint untuk mengelola layanan yang ditawarkan oleh klinik termasuk harga, durasi, dan ketersediaan.

##### Alur Onboarding Vendor
- **Tugas**: Membuat sistem onboarding vendor
- **Story Points**: 13
- **Tenggat Waktu**: 31 Des 2025
- **Detail**: Mengimplementasikan proses onboarding multi-langkah dengan verifikasi, pengunggahan dokumen, alur kerja persetujuan, dan alat peninjauan admin.

### Layanan Pemesanan

#### Fase 3 (1 Jan - 28 Feb 2026)

##### Manajemen Ketersediaan
- **Tugas**: Membuat sistem kalender ketersediaan
- **Story Points**: 13
- **Tenggat Waktu**: 20 Jan 2026
- **Detail**: Mengimplementasikan manajemen ketersediaan berbasis kalender dengan slot berulang, waktu yang diblokir, dan penugasan staf.

##### Manajemen Pemesanan
- **Tugas**: Membangun operasi CRUD pemesanan
- **Story Points**: 8
- **Tenggat Waktu**: 31 Jan 2026
- **Detail**: Membuat endpoint untuk pembuatan, modifikasi, pembatalan pemesanan dengan validasi terhadap kalender ketersediaan.

##### Sistem Pemesanan Real-Time
- **Tugas**: Mengimplementasikan pembaruan real-time berbasis WebSocket
- **Story Points**: 13
- **Tenggat Waktu**: 15 Feb 2026
- **Detail**: Membuat server WebSocket untuk notifikasi pemesanan real-time, pembaruan status, dan perubahan ketersediaan.

##### Sistem Pengingat
- **Tugas**: Membangun sistem pengingat janji temu
- **Story Points**: 8
- **Tenggat Waktu**: 28 Feb 2026
- **Detail**: Mengimplementasikan pengingat terjadwal untuk janji temu yang akan datang dengan waktu dan metode pengiriman yang dapat disesuaikan.
