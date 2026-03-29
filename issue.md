# Fitur API Login dan Manajemen Token Sesi

## Deskripsi Tugas
Tugas ini adalah untuk mengimplementasikan fungsionalitas **Login** agar pengguna dapat masuk ke aplikasi dan menerima **JSON Web Token (JWT)**. Implementasi ini mencakup penambahan kolom baru pada tabel `sessions` untuk melacak token aktif secara unik di sisi database.

Tugas ini harus menggunakan **ElysiaJS**, **Drizzle ORM**, dan `@elysiajs/jwt` untuk penanganan token.

---

## 1. Perubahan Skema Database

Lakukan modifikasi pada file `src/db/schema.ts` untuk menambahkan field baru pada tabel `sessions`.

### Update Tabel `sessions`
- Tambahkan kolom `token` : `VARCHAR(255) NOT NULL`.
- Kolom ini akan menyimpan **UUID** unik untuk setiap sesi login baru. Hal ini berguna untuk mekanisme *revocation* (pembatalan) token di masa mendatang.

Setelah memperbarui kode skema, jalankan perintah sinkronisasi:
```bash
bun run db:generate
bun run db:push
```

---

## 2. API Login User

Buatlah endpoint baru untuk proses autentikasi.

**Endpoint**: `POST /api/login`

**Request Body** (JSON):
```json
{
    "email" : "eko@localhost",
    "password" : "rahasia",
    "tenant_id" : 1
}
```

**Response Body - Saat Sukses** (Status Code `200`):
```json
{
    "data" : "token_jwt_yang_dihasilkan"
}
```
*Catatan: Token JWT harus mengandung payload minimal `id` user, `email`, `role`, dan `jti` (yang berisi nilai kolom `token` dari tabel `sessions`).*

**Response Body - Saat Gagal** (Status Code `401` Unauthorized):
```json
{
    "error" : "email atau password salah"
}
```

---

## 3. Ketentuan Struktur Folder & File

Ikuti pola arsitektur yang sudah ada:

- **Layer Service (`src/services/auth-service.ts`)**:
  - Implementasikan fungsi `loginUser(email, password, tenantId)`.
  - Cari user berdasarkan email dan tenant_id. Jika tidak ada, kembalikan error.
  - Verifikasi password hash menggunakan `await Bun.password.verify(password, user.passwordHash)`.
  - Jika valid, buat entri baru di tabel `sessions` menggunakan `crypto.randomUUID()` sebagai nilai kolom `token`.
  - Kembalikan data user dan token sesi ke layer routing.

- **Layer Routing (`src/routes/auth-route.ts`)**:
  - Gunakan plugin `@elysiajs/jwt`.
  - Terima request, panggil *auth-service*.
  - Jika login valid, hasilkan JWT menggunakan plugin tersebut.
  - Berikan respons JSON sesuai spesifikasi.

---

## 4. Tahapan Implementasi (Step-by-Step)

1. **Instalasi Plugin JWT**:
   Jalankan perintah:
   ```bash
   bun add @elysiajs/jwt
   ```

2. **Update Database**:
   - Tambahkan kolom `token` ke tabel `sessions` di `src/db/schema.ts`.
   - Lakukan migrasi database.

3. **Buat Auth Service**:
   - Buat file `src/services/auth-service.ts`.
   - Pastikan hanya user dengan `status: 'active'` yang bisa login (opsional, disarankan).
   - Pastikan `tenant_id` diperiksa dengan benar untuk memisahkan login antar tenant.

4. **Buat Auth Route**:
   - Buat file `src/routes/auth-route.ts`.
   - Daftarkan endpoint `POST /login`.
   - Setup konfigurasi JWT (gunakan *secret key* sederhana dari `.env`).

5. **Integrasi ke `src/index.ts`**:
   - Gunakan `.use(authRoute)` pada instance utama Elysia.

6. **Pengujian**:
   - Coba login dengan data yang sudah terdaftar di database.
   - Pastikan token JWT yang dihasilkan valid (bisa dicek lewat jwt.io).
   - Coba login dengan password atau email yang salah, pastikan pesan error sesuai.
