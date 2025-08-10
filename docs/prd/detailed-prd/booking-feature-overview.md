# Detailed PRD: Booking Feature

## 1. Gambaran Umum Fitur

### 1.1. Deskripsi Fitur
Fitur Booking pada platform PetPro memungkinkan pengguna untuk memesan layanan perawatan hewan di klinik-klinik yang tergabung dalam platform. Fitur ini mencakup seluruh alur pemesanan mulai dari pencarian klinik, pemilihan layanan, pemilihan slot waktu, proses pembayaran, hingga konfirmasi dan notifikasi.

### 1.2. Tujuan Bisnis
- Meningkatkan aksesibilitas layanan kesehatan hewan
- Mengoptimalkan penggunaan kapasitas klinik hewan
- Mengurangi waktu tunggu dan meningkatkan efisiensi operasional klinik
- Meningkatkan pengalaman konsumen dalam mengakses layanan kesehatan hewan
- Menciptakan aliran pendapatan baru melalui komisi dari setiap booking

### 1.3. Metrik Kesuksesan
- Jumlah booking yang berhasil per bulan: target 5.000 booking pada bulan ke-6
- Tingkat konversi dari pencarian ke booking: target 15%
- Tingkat pembatalan booking: target <10%
- Rata-rata jumlah booking per pengguna: target 2 booking per tahun
- NPS (Net Promoter Score) untuk pengalaman booking: target >50

### 1.4. Persona Pengguna

#### 1.4.1. Pemilik Hewan Peliharaan
- **Profil**: Dewasa berusia 25-45 tahun, tinggal di perkotaan, memiliki 1-3 hewan peliharaan
- **Pain Points**: 
  - Kesulitan mendapatkan jadwal yang sesuai di klinik hewan
  - Waktu tunggu yang lama di klinik
  - Ketidakjelasan biaya layanan
- **Goals**: 
  - Mendapatkan perawatan terbaik untuk hewan peliharaan
  - Menghemat waktu dengan mengurangi waktu tunggu
  - Transparansi harga layanan sebelum kunjungan

#### 1.4.2. Admin Klinik
- **Profil**: Staf administrasi atau dokter hewan yang mengelola jadwal klinik
- **Pain Points**: 
  - Kesulitan mengelola jadwal yang padat
  - No-show dari pasien
  - Kesalahan komunikasi mengenai jenis layanan yang dibutuhkan
- **Goals**: 
  - Memaksimalkan efisiensi jadwal klinik
  - Mengurangi no-show dan pembatalan mendadak
  - Memiliki informasi yang lengkap tentang pasien sebelum kedatangan

## 2. Fitur dan Fungsionalitas Level 2

### 2.1. Pencarian dan Pemilihan Klinik

#### 2.1.1. Pencarian Klinik
- **Deskripsi**: Pengguna dapat mencari klinik berdasarkan lokasi, jenis layanan, rating, dan ketersediaan jadwal
- **Fungsionalitas**:
  - Pencarian berdasarkan lokasi (radius, kota, wilayah)
  - Filter berdasarkan rating klinik (1-5 bintang)
  - Filter berdasarkan jenis layanan (vaksinasi, grooming, konsultasi, dll)
  - Filter berdasarkan ketersediaan jadwal (hari ini, besok, pilihan tanggal spesifik)
  - Tampilan hasil dalam bentuk list dan peta

#### 2.1.2. Detail Klinik
- **Deskripsi**: Pengguna dapat melihat informasi detail tentang klinik sebelum memutuskan untuk booking
- **Fungsionalitas**:
  - Profil klinik (nama, alamat, jam operasional, fasilitas)
  - Daftar dokter hewan beserta kualifikasi
  - Galeri foto klinik
  - Ulasan dan rating dari pengguna lain
  - Daftar layanan beserta harga
  - Informasi kontak dan petunjuk arah

### 2.2. Pemilihan Layanan dan Slot Waktu

#### 2.2.1. Pemilihan Layanan
- **Deskripsi**: Pengguna dapat memilih layanan spesifik yang dibutuhkan dari daftar yang disediakan klinik
- **Fungsionalitas**:
  - Daftar layanan dengan detail (nama, deskripsi, durasi, harga)
  - Rekomendasi layanan berdasarkan jenis dan usia hewan peliharaan
  - Informasi dokter yang akan menangani layanan (jika tersedia)
  - Opsi layanan tambahan (add-ons)

#### 2.2.2. Pemilihan Slot Waktu
- **Deskripsi**: Pengguna dapat memilih slot waktu yang tersedia untuk layanan yang dipilih
- **Fungsionalitas**:
  - Kalender interaktif untuk pemilihan tanggal
  - Tampilan slot waktu yang tersedia per tanggal
  - Indikasi visual untuk slot yang sudah terisi, tersedia, dan hampir penuh
  - Opsi untuk memilih dokter hewan spesifik (jika tersedia)
  - Pemesanan slot secara real-time dengan sistem locking

### 2.3. Proses Booking dan Pembayaran

#### 2.3.1. Informasi Booking
- **Deskripsi**: Pengguna memasukkan informasi yang diperlukan untuk booking
- **Fungsionalitas**:
  - Pemilihan hewan peliharaan dari profil yang sudah ada
  - Opsi untuk menambahkan hewan peliharaan baru
  - Form untuk catatan tambahan atau keluhan khusus
  - Konfirmasi detail booking (klinik, layanan, waktu, hewan peliharaan)

#### 2.3.2. Pembayaran
- **Deskripsi**: Pengguna menyelesaikan pembayaran untuk booking
- **Fungsionalitas**:
  - Pilihan metode pembayaran (kartu kredit, e-wallet, transfer bank, QRIS)
  - Opsi untuk menyimpan metode pembayaran untuk penggunaan di masa depan
  - Tampilan rincian biaya (harga layanan, PPN, biaya platform)
  - Kode promo dan diskon
  - Pembayaran langsung vs pembayaran di tempat (bergantung kebijakan klinik)

### 2.4. Konfirmasi dan Notifikasi

#### 2.4.1. Konfirmasi Booking
- **Deskripsi**: Pengguna menerima konfirmasi setelah booking berhasil
- **Fungsionalitas**:
  - Halaman konfirmasi dengan detail booking
  - Kode referensi booking
  - Opsi untuk menambahkan ke kalender perangkat
  - Petunjuk persiapan (jika ada)
  - Tombol untuk melihat booking di halaman booking saya

#### 2.4.2. Notifikasi
- **Deskripsi**: Pengguna menerima notifikasi terkait booking
- **Fungsionalitas**:
  - Email konfirmasi booking
  - Pengingat booking (H-1 dan H-3)
  - Notifikasi perubahan status booking
  - Notifikasi pembatalan dari klinik (jika terjadi)
  - Notifikasi untuk mengingatkan review setelah layanan selesai

### 2.5. Manajemen Booking

#### 2.5.1. Daftar Booking
- **Deskripsi**: Pengguna dapat melihat dan mengelola seluruh booking yang telah dibuat
- **Fungsionalitas**:
  - Tampilan daftar booking (upcoming, past, cancelled)
  - Detail setiap booking
  - Fitur pencarian dan filter booking
  - Status booking (confirmed, completed, cancelled)

#### 2.5.2. Perubahan dan Pembatalan
- **Deskripsi**: Pengguna dapat mengubah atau membatalkan booking yang telah dibuat
- **Fungsionalitas**:
  - Reschedule booking (tunduk pada kebijakan klinik)
  - Pembatalan booking (tunduk pada kebijakan refund)
  - Informasi tentang kebijakan perubahan dan pembatalan
  - Alasan pembatalan untuk feedback

## 3. User Flow Detail (Level 3)

### 3.1. Pencarian dan Pemilihan Klinik
1. Pengguna membuka aplikasi dan memilih menu "Booking"
2. Pengguna memilih lokasi pencarian (lokasi saat ini atau lokasi spesifik)
3. Pengguna dapat menyesuaikan radius pencarian (default: 5km)
4. Pengguna dapat menambahkan filter tambahan:
   - Jenis layanan (vaksinasi, grooming, konsultasi, operasi, dll)
   - Rating klinik (minimum 3 bintang, 4 bintang, dll)
   - Ketersediaan (hari ini, besok, pilihan tanggal)
5. Sistem menampilkan hasil pencarian dalam dua format:
   - List view: menampilkan nama klinik, rating, jarak, dan highlight layanan
   - Map view: menampilkan lokasi klinik dalam peta interaktif
6. Pengguna memilih klinik dari hasil pencarian untuk melihat detail
7. Sistem menampilkan halaman detail klinik dengan informasi lengkap

### 3.2. Pemilihan Layanan dan Slot Waktu
1. Dari halaman detail klinik, pengguna memilih tab "Layanan"
2. Pengguna melihat daftar layanan yang dikelompokkan berdasarkan kategori
3. Pengguna memilih layanan yang diinginkan
4. Sistem menampilkan detail layanan (deskripsi, durasi, harga)
5. Pengguna menekan tombol "Pilih Jadwal"
6. Sistem menampilkan kalender dengan tanggal yang tersedia
7. Pengguna memilih tanggal yang diinginkan
8. Sistem menampilkan slot waktu yang tersedia pada tanggal tersebut
9. Pengguna memilih slot waktu yang diinginkan
10. Sistem melakukan reservasi sementara pada slot tersebut (valid 10 menit)

### 3.3. Proses Booking
1. Setelah memilih slot waktu, sistem meminta pengguna untuk memilih hewan peliharaan
2. Pengguna memilih hewan peliharaan dari profil yang tersedia atau menambahkan baru
3. Jika menambahkan baru, pengguna mengisi informasi dasar hewan (nama, jenis, ras, usia, berat)
4. Pengguna dapat menambahkan catatan tambahan untuk klinik
5. Sistem menampilkan ringkasan booking untuk konfirmasi:
   - Detail klinik
   - Layanan yang dipilih
   - Tanggal dan waktu
   - Hewan peliharaan
   - Harga
6. Pengguna mengkonfirmasi detail booking dan menekan "Lanjutkan ke Pembayaran"

### 3.4. Proses Pembayaran
1. Sistem menampilkan halaman pembayaran dengan rincian biaya
2. Pengguna dapat memasukkan kode promo (jika ada)
3. Pengguna memilih metode pembayaran:
   - Kartu kredit/debit yang tersimpan
   - Tambahkan kartu baru
   - E-wallet (GoPay, OVO, DANA, dll)
   - Virtual account bank
   - QRIS
4. Bergantung pada metode pembayaran:
   - Kartu: Pengguna memasukkan detail kartu atau menggunakan yang tersimpan
   - E-wallet: Pengguna diarahkan ke aplikasi e-wallet
   - Virtual account: Sistem menampilkan nomor VA untuk ditransfer
   - QRIS: Sistem menampilkan kode QR untuk dipindai
5. Pengguna menyelesaikan pembayaran
6. Sistem memproses pembayaran dan menunggu konfirmasi dari payment gateway
7. Setelah konfirmasi pembayaran diterima, sistem mengkonfirmasi booking

### 3.5. Konfirmasi dan Notifikasi
1. Sistem menampilkan halaman konfirmasi booking dengan:
   - Kode referensi booking
   - QR code untuk check-in di klinik
   - Detail booking lengkap
   - Tombol "Tambahkan ke Kalender"
   - Petunjuk atau persiapan khusus (jika ada)
2. Sistem mengirimkan email konfirmasi booking
3. Sistem mengirimkan notifikasi push di aplikasi
4. Booking ditambahkan ke daftar "Upcoming Bookings" pengguna
5. Sistem menjadwalkan pengingat untuk H-3 dan H-1 sebelum jadwal booking

### 3.6. Manajemen Booking
1. Pengguna dapat melihat semua booking di menu "My Bookings"
2. Booking dikelompokkan menjadi:
   - Upcoming: booking yang akan datang
   - Past: booking yang sudah lewat
   - Cancelled: booking yang dibatalkan
3. Untuk setiap booking, pengguna dapat:
   - Melihat detail lengkap
   - Mengubah jadwal (jika diizinkan oleh kebijakan klinik)
   - Membatalkan booking (tunduk pada kebijakan refund)
   - Menghubungi klinik
   - Mendapatkan petunjuk arah ke klinik
4. Setelah layanan selesai, pengguna dapat:
   - Memberikan rating dan review
   - Melihat riwayat medis/layanan
   - Melihat rekomendasi follow-up (jika ada)

## 4. User Stories dan Acceptance Criteria (Level 3)

### 4.1. Pencarian dan Pemilihan Klinik

#### 4.1.1. User Story: Pencarian Klinik Berdasarkan Lokasi
**Sebagai** pemilik hewan peliharaan  
**Saya ingin** mencari klinik hewan berdasarkan lokasi terdekat  
**Sehingga** saya dapat menemukan klinik yang mudah dijangkau

**Acceptance Criteria:**
- Aplikasi dapat mengakses lokasi pengguna dengan izin yang sesuai
- Pengguna dapat mencari klinik dalam radius tertentu (1km, 3km, 5km, 10km)
- Pengguna dapat memasukkan lokasi lain selain lokasi saat ini
- Hasil pencarian menampilkan jarak dari lokasi pengguna ke masing-masing klinik
- Hasil pencarian diurutkan berdasarkan jarak terdekat secara default
- Pengguna dapat melihat hasil pencarian dalam bentuk peta

#### 4.1.2. User Story: Filter Klinik Berdasarkan Kriteria
**Sebagai** pemilik hewan peliharaan  
**Saya ingin** memfilter klinik berdasarkan rating, jenis layanan, dan ketersediaan  
**Sehingga** saya dapat menemukan klinik yang sesuai dengan kebutuhan saya

**Acceptance Criteria:**
- Pengguna dapat memfilter klinik berdasarkan rating minimum (3 bintang, 4 bintang, dll)
- Pengguna dapat memfilter klinik berdasarkan jenis layanan yang dibutuhkan
- Pengguna dapat memfilter klinik berdasarkan ketersediaan jadwal
- Filter dapat diterapkan secara bersamaan dan dapat direset
- Hasil pencarian diperbarui secara real-time saat filter diubah
- Jumlah hasil pencarian ditampilkan dan diperbarui saat filter diubah

#### 4.1.3. User Story: Melihat Detail Klinik
**Sebagai** pemilik hewan peliharaan  
**Saya ingin** melihat informasi detail tentang klinik  
**Sehingga** saya dapat mengevaluasi apakah klinik tersebut sesuai untuk hewan peliharaan saya

**Acceptance Criteria:**
- Halaman detail klinik menampilkan informasi dasar (nama, alamat, jam operasional)
- Halaman detail menampilkan galeri foto klinik
- Halaman detail menampilkan daftar dokter hewan beserta kualifikasi
- Halaman detail menampilkan ulasan dan rating dari pengguna lain
- Pengguna dapat melihat daftar layanan yang disediakan beserta harga
- Pengguna dapat melihat fasilitas yang tersedia di klinik
- Pengguna dapat melihat petunjuk arah ke klinik
- Pengguna dapat menghubungi klinik melalui telepon atau chat

### 4.2. Pemilihan Layanan dan Slot Waktu

#### 4.2.1. User Story: Pemilihan Layanan
**Sebagai** pemilik hewan peliharaan  
**Saya ingin** memilih layanan spesifik yang dibutuhkan oleh hewan peliharaan saya  
**Sehingga** saya mendapatkan perawatan yang tepat dengan harga yang jelas

**Acceptance Criteria:**
- Pengguna dapat melihat daftar layanan yang dikelompokkan berdasarkan kategori
- Setiap layanan menampilkan informasi nama, deskripsi singkat, dan harga
- Pengguna dapat melihat detail lengkap layanan termasuk durasi estimasi
- Sistem dapat menampilkan rekomendasi layanan berdasarkan jenis dan usia hewan
- Pengguna dapat memilih lebih dari satu layanan jika kompatibel
- Sistem menghitung total harga dan durasi jika memilih multiple layanan

#### 4.2.2. User Story: Pemilihan Slot Waktu
**Sebagai** pemilik hewan peliharaan  
**Saya ingin** memilih slot waktu yang tersedia dan sesuai dengan jadwal saya  
**Sehingga** saya dapat mengatur waktu kunjungan yang nyaman

**Acceptance Criteria:**
- Pengguna dapat melihat kalender dengan tanggal yang tersedia untuk booking
- Sistem menandai tanggal yang tidak tersedia atau penuh
- Setelah memilih tanggal, sistem menampilkan slot waktu yang tersedia
- Slot waktu ditampilkan dalam interval yang sesuai dengan durasi layanan
- Sistem melakukan reservasi sementara saat slot dipilih (valid 10 menit)
- Jika ada dokter hewan spesifik, pengguna dapat memilih berdasarkan dokter
- Sistem menunjukkan jika slot hampir penuh (high demand)
- Sistem mencegah double-booking untuk slot yang sama
