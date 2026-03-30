# [Feature Request] Implementasi Tabel `packages` & API Pendaftaran Paket Baru

## Deskripsi
Fitur ini bertujuan untuk menambahkan kapabilitas manajemen paket berlangganan (*subscription packages*) ke dalam platform E-Commerce Multi-Tenant. Paket ini nantinya akan digunakan sebagai acuan limitasi sumber daya (*resource limits*) dan masa langganan *tenant*.

Tugas ini ditujukan bagi *junior programmer* maupun *AI agent*. Harap berpedoman pada spesifikasi lapisan dan urutan kerja berikut ini.

---

## 1. Kebutuhan Skema Database (Tabel `packages`)

Modifikasi file `src/db/schema.ts` dan tambahkan struktur tabel baru dengan properti (properti Drizzle ORM `snake_case`) yang bersesuaian dengan tipe SQL di bawah:

| Kolom | Definisi SQL / Tipe Ekivalen | Keterangan Aturan |
| :--- | :--- | :--- |
| `id` | `INT AUTO_INCREMENT PRIMARY KEY` | Kunci utama/unik |
| `name` | `VARCHAR(100) NOT NULL` | Nama paket (Cth: 'Free Trial 30 Hari', 'Basic 1 Bulan') |
| `price` | `DECIMAL(10, 2) NOT NULL DEFAULT 0.00`| Biaya langganan. Default gratis (0.00) |
| `duration_days` | `INT NOT NULL` | Masa berlaku dalam hitungan hari |
| `max_users` | `INT NULL` | Jumlah maksimal admin/pengguna. Boleh `Null` |
| `max_products` | `INT NULL` | Jumlah maksimal produk di lapak. Boleh `Null` |
| `is_active` | `BOOLEAN DEFAULT TRUE` | Status operasional paket |
| `created_at` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`| Catatan waktu pembuatan |

---

## 2. Kebutuhan Layanan API

Buatkan antarmuka peladen (*Endpoint*) baru untuk merekam data paket.

- **URL Endpoint:** `POST /api/packages`
- **Fungsi:** Pembuatan/registrasi paket berlangganan baru.

### Draf *Request Body*
Spesifikasi tipe beban (*payload/body*) yang harus dipatuhi sistem validasi (misalnya menggunakan **Elysia TypeBox**):

```json
{
    "name": "Basic",
    "duration_days": 30,
    "max_users": 1,
    "max_products": 10
}
```

### Draf *Response Body* (Sukses)
Bila data sah dan penyisipan data ke pangkalan MySQL nihil eror:
```json
{
    "data": "OK"
}
```

### Draf *Response Body* (Error)
Jika terpentok masalah validasi dari sisi *client* atau internal layanan:
```json
{
    "error": "error"
}
```

---

## 3. Langkah-Langkah Implementasi (*Walkthrough*)

Terapkan pengembangan fitur memegang teguh pada *Layered Architecture* (terpisah antara `routes` dan `services`).

- [ ] **Tahap 1: Sinkronisasi Skema Pangkalan Data**
  1. Perbarui `src/db/schema.ts` dengan menyisipkan variabel eksport `packages` memakai cetakan kolom Drizzle (contoh: `decimal`, `int`, `varchar`).
  2. Jangan lupa tembakkan perintah migrasi struktur di terminal lokal: `bun run db:push` (atau perintah sejenis).

- [ ] **Tahap 2: Pembuatan Logika Manipulasi Data (*Services Layer*)**
  1. Ciptakan satu berkas penanganan pada area ini: `src/services/packages-service.ts`.
  2. Implementasikan dan *export* logika pemanggilan Drizzle ORM (insert query) yang menerima parameter paket baru untuk menjebloskannya ke tabel `packages`. 

- [ ] **Tahap 3: Pembuatan Rute Pengontrol (*Routes Layer*)**
  1. Rintis file baru: `src/routes/packages-route.ts`.
  2. Ikat fungsi logika `services` ke dalam wadah `.post(...)` dari kerangka **ElysiaJS**.
  3. Bubuhkan lapis penjagaan Validasi input (*TypeBox Schema*) untuk `body` sebelum izin akses fungsi servis diberikan.

- [ ] **Tahap 4: Pendaftaran Rute Eksekutif (*App Index*)**
  1. Sorot titik lebur utama server di `src/index.ts`.
  2. Impor modul `packagesRoute` eks berkas di Tahap 3. 
  3. Rajut modul tersebut di dalam barisan `.use(packagesRoute)` pada instans utama Elysia.

---
**Tip Cepat:** Apabila ada ketersendatan metode penulisan syntax Drizzle/Elysia, Anda dipersilakan mengintip cara penulisan sistem `tenants` atau `users` (*users-route.ts*, *users-service.ts*) pada repositori proyek ini sebagai *role-model* kodingan. Semangat mengeksekusi!
