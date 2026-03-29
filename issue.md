# Project Initialization: Bun + ElysiaJS + Drizzle + MySQL

## Deskripsi
Tugas ini adalah untuk melakukan inisialisasi proyek baru di dalam direktori ini menggunakan ekosistem **Bun**. Proyek ini akan menjadi layanan backend yang menggunakan **ElysiaJS** sebagai web framework, **Drizzle ORM** untuk manajemen database, dan **MySQL** sebagai database utama.

Dokumen ini merupakan panduan tingkat tinggi (high-level) yang akan diimplementasikan pada tahap selanjutnya. Jangan ragu untuk menentukan struktur 폴더 atau standar koding yang sesuai dengan best practices dari framework tersebut.

## Langkah-langkah Implementasi

### 1. Inisialisasi Proyek
- Jalankan perintah inisialisasi proyek Bun untuk mengatur kerangka kerja awal di direktori saat ini.
- Pastikan file konfigurasi utama seperti `package.json` dan konfigurasi typescript (`tsconfig.json` jika relavan) telah terbuat.

### 2. Instalasi Dependency
- Instal dependency utama yang diperlukan untuk runtime:
  - `elysia`
  - `drizzle-orm`
  - `mysql2`
- Instal dependency development (dev dependencies) yang akan membantu dalam proses pengembangan:
  - `drizzle-kit` (untuk keperluan migrasi Drizzle)
  - `bun-types` (jika menggunakan TypeScript)

### 3. Konfigurasi Database (Drizzle & MySQL)
- Siapkan file `.env` dan dokumentasikan struktur variabel di `.env.example`. Masukkan variabel string koneksi database MySQL (misal: `DATABASE_URL`).
- Buat file konfigurasi inisialisasi koneksi database (misalnya `src/db/index.ts`) menggunakan Drizzle dan driver `mysql2`.
- Buat contoh skema awal menggunakan Drizzle (misalnya tabel `users` sederhana) untuk membuktikan ORM berfungsi.
- Buat file `drizzle.config.ts` untuk keperluan konfigurasi Drizzle Kit.
- Tambahkan skrip di `package.json` untuk melakukan *generate* dan *push* migrasi database ke MySQL menggunakan Drizzle Kit.

### 4. Setup Web Server (ElysiaJS)
- Buat entry point utama aplikasi (misalnya `src/index.ts`).
- Inisialisasi server ElysiaJS untuk "listen" di port tertentu (misalnya port 3000).
- Buat setidaknya satu endpoint sederhana (misal HTTP `GET /`) yang mengembalikan respons untuk memverifikasi bahwa server menyala dengan baik.

### 5. Finalisasi & Skrip
- Pastikan ada skrip di `package.json` untuk memulai server di mode development dengan fitur hot-reload bawaan Bun. (misal: `"dev": "bun run --watch src/index.ts"`).

## Kriteria Penerimaan (Acceptance Criteria)
- [ ] Proyek dapat dijalankan menggunakan command `bun run dev` atau sejenisnya tanpa adanya error.
- [ ] Server merespon request HTTP pada route default (`/`).
- [ ] Koneksi Drizzle ke database MySQL dapat dikonfigurasi sepenuhnya melalui variabel environment (`.env`).
- [ ] Setup Drizzle ORM telah lengkap, siap untuk integrasi query dan migrasi tabel baru.
