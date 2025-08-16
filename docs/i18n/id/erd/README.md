# Diagram Hubungan Entitas

## Ikhtisar
Bagian ini berisi Diagram Hubungan Entitas (ERD) untuk sistem PetPro, yang menunjukkan hubungan antara entitas data yang berbeda di seluruh arsitektur layanan mikro.

## Diagram yang Tersedia

- [ERD Domain Layanan Mikro](./microservices-domain-erd.md): Tampilan komprehensif semua domain dan hubungannya
- [ERD Layanan Vendor](./vendor-service-erd.md): Entitas dan hubungan detail dalam layanan vendor
- [ERD Layanan Otentikasi](./auth-service-erd.md): Model data autentikasi dan otorisasi pengguna
- [ERD Layanan Pemesanan](./booking-service-erd.md): Model data manajemen janji temu dan pemesanan
- [ERD Layanan Inventaris](./inventory-service-erd.md): Model data manajemen produk dan inventaris
- [ERD Layanan Pembayaran](./payment-service-erd.md): Model data pemrosesan pembayaran dan transaksi
- [ERD Layanan Hewan Peliharaan](./pet-service-erd.md): Model data profil hewan peliharaan dan catatan kesehatan
- [ERD Layanan Pelanggan](./customer-service-erd.md): Model data manajemen pelanggan

## Notasi yang Digunakan

ERD mengikuti notasi Entitas-Hubungan standar:
- Persegi panjang mewakili entitas
- Berlian mewakili hubungan
- Garis menghubungkan entitas ke hubungan
- Notasi kaki gagak menunjukkan kardinalitas (satu-ke-banyak, banyak-ke-banyak)

## Implementasi Database

Sistem PetPro menggunakan PostgreSQL sebagai database utama. Model data diimplementasikan dengan:
- Batasan kunci asing yang tepat
- Strategi pengindeksan untuk optimasi kinerja
- Pemisahan skema berdasarkan domain
- Kontrol akses berbasis peran di tingkat database

Untuk detail tentang implementasi database, lihat [Dokumentasi Pengaturan Database](../../id/architecture/database-setup.md).
