# Fitur Registrasi User dan Manajemen Session

## Deskripsi Tugas
Tugas ini adalah untuk mengimplementasikan fungsionalitas registrasi pengguna baru dan merancang skema database untuk sesi masuk (session) yang akan mendampingi implementasi JWT di masa mendatang. 

Tugas ini harus dikerjakan dengan menggunakan **ElysiaJS** untuk web server dan **Drizzle ORM** untuk interaksi dengan database MySQL, serta mengikuti struktur proyek yang lebih modular.

---

## 1. Spesifikasi Skema Database

Gunakan Drizzle ORM untuk menterjemahkan spesifikasi tabel di bawah ini. Tuliskan kodenya di dalam file `src/db/schema.ts` (Anda dapat menghapus/menimpa tabel `users` bawaan sebelumnya).

### Tabel `users`
- `id` : INT AUTO_INCREMENT PRIMARY KEY
- `tenant_id` : INT NULL (Nilai NULL menandakan bahwa entitas ini adalah superadmin aplikasi secara keseluruhan)
- `role` : ENUM('superadmin', 'tenant_admin', 'customer') NOT NULL
- `name` : VARCHAR(100) NOT NULL
- `email` : VARCHAR(100) UNIQUE NOT NULL
- `phone` : VARCHAR(100) NOT NULL
- `password_hash` : VARCHAR(255) NOT NULL (Menyimpan password yang di-hash menggunakan algoritma `bcrypt`)
- `status` : ENUM('pending', 'active', 'rejected', 'suspended') DEFAULT 'pending'
- `created_at` : TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### Tabel `sessions`
Tabel ini digunakan untuk melayani status "Log Masuk" (Login Session) untuk setiap user.
- `id` : VARCHAR(255) PRIMARY KEY (Ini berfungsi sebagai JWT ID atau JTI)
- `user_id` : INT NOT NULL
- `ip_address` : VARCHAR(45)
- `user_agent` : TEXT
- `is_active` : BOOLEAN DEFAULT TRUE (Akan digunakan untuk *force logout* atau menendang session out secara paksa)
- `last_activity` : TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- *Foreign Key* : `user_id` harus mereferensikan `id` pada tabel `users`, dengan pengaturan `ON DELETE CASCADE`.

---

## 2. API Registrasi User Baru

Anda harus menyediakan sebuah endpoint REST API untuk melakukan registrasi user baru.

**Endpoint**: `POST /api/users`

**Request Body** (Berupa Payload JSON):
```json
{
    "name" : "Eko",
    "email" : "eko@localhost",
    "phone" : "08123456789",
    "password" : "rahasia",
    "role" : "tenant_admin",
    "tenant_id" : 1
}
```

**Response Body - Saat Sukses** (Status Code `200` atau `201`):
```json
{
    "message" : "User created successfully",
    "data" : "OK"
}
```

**Response Body - Saat Gagal karena Email Duplikat** (Status Code `400` BadRequest atau sejenisnya):
```json
{
    "error" : "user sudah terdaftar"
}
```

---

## 3. Ketentuan Struktur Folder & File

Kode tidak boleh dijadikan satu blok besar di dalam `index.ts`. Letakkan file tambahan di dalam folder `src/` dengan ketentuan berikut:

- Folder **`routes/`** : Membuat grup modul untuk meletakkan rute-rute endpoint API (routing ElysiaJS).
  - Penamaan file harus menggunakan akhiran `-route.ts` (misal: `users-route.ts`).
- Folder **`services/`** : Berisi file implementasi inti dan logika bisnis yang memproses input dan berinteraksi dengan tabel database.
  - Penamaan file harus menggunakan akhiran `-service.ts` (misal: `users-service.ts`).

---

## 4. Tahapan Pengerjaan (Step-by-Step Guide)

Untuk programmer yang menerima tiket ini, ikuti langkah-langkah di bawah untuk kelancaran integrasi:

1. **Membuat Definisi Database**:
   - Buka `src/db/schema.ts` dan tulislah skema deklaratif Drizzle untuk `users` dan `sessions`. 
   - Pastikan tipe data sesuai, misal menggunakan tipe enumerasi MySQL (contoh: `mysqlEnum("role", ['superadmin', 'tenant_admin', 'customer'])`).
   - Terapkan skema tersebut ke database dengan menjalankan perintah:
     ```bash
     bun run db:generate
     bun run db:push
     ```

2. **Logika Bisnis di Layer Service (`src/services/users-service.ts`)**:
   - Buat fungsi, misal `registerUser(payload)`.
   - Di dalam fungsi ini, jalankan query untuk mencari entri di tabel `users` di mana kolom `email` cocok dengan payload.
   - Jika `email` ditemukan, hentikan proses (return error atau throw exception spesifik).
   - Lakukan hashing pada data `password` yang dikirim menggunakan `Bun.password.hash(..., { algorithm: "bcrypt" })`.
   - Sisipkan (*insert*) user ke database. Pastikan untuk menempatkan hasil hash dari password ke kolom `password_hash`. Teruskan sisa data (seperti `tenant_id` dan `role`).

3. **Controller/Routing Layer (`src/routes/users-route.ts`)**:
   - Impor framework Elysia dan buat instance sub-router.
   - Sambungkan route `POST /api/users`.
   - Disarankan untuk memvalidasi *request body* dengan plugin `t` bawaan ElysiaJS (TypeBox) untuk memastikan skema request valid.
   - Dalam *handler*, panggil fungsi `registerUser(body)` dari file *service*.
   - Evaluasi kembalian *service*. Kirim JSON respons sukses atau return objek error dengan pola persis sesuai spesifikasi.

4. **Integrasikan ke Aplikasi Utama (`src/index.ts`)**:
   - Impor modul default atau plugin dari `users-route.ts`.
   - Integrasikan ke router utama menggunakan fungsionalitas kompoosis Elysia (misal: `app.use(usersRoute)`).

5. **Lakukan Pengujian (Testing)**:
   - Gunakan `bun run dev` untuk menyalakan API.
   - Tembak `POST /api/users` melalui cURL/Postman berulang kali untuk menguji format sukses dan respon penolakan dari "user sudah terdaftar".
