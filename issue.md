# Fitur Get Current Login User (Profile API)

## Deskripsi Tugas
Tugas ini adalah untuk mengimplementasikan sebuah endpoint API autentikasi yang mengembalikan data profil pengguna yang saat ini sedang login. Endpoint ini memerlukan otorisasi menggunakan JSON Web Token (JWT) yang didapatkan saat proses login, dan dikirimkan melalui header HTTP.

Tugas ini harus dikerjakan dengan menggunakan **ElysiaJS** untuk routing dan **Drizzle ORM** untuk pengambilan data ke database.

---

## 1. Spesifikasi API

**Endpoint**: `GET /api/users/current`

**Headers yang Diwajibkan**:
- `Authorization` : `Bearer <token_jwt>` (Token JWT ini didapatkan sebelumnya dari respons API Login).

**Response Body - Saat Sukses** (Status Code `200`):
```json
{
    "data" : {
        "id" : 1,
        "name" : "eko",
        "email" : "eko@localhost",
        "role" : "admin",
        "tenant_id" : 1,
        "created_at" : "timestamp"
    }
}
```

**Response Body - Saat Gagal/Tidak Terautentikasi** (Status Code `401` Unauthorized):
```json
{
    "error" : "Unauthorized"
}
```
*Catatan: Kondisi ini terjadi jika token tidak ada, format token salah, JWT kedaluwarsa, atau sesi di database sudah tidak aktif.*

---

## 2. Ketentuan Struktur Folder & File

Silakan mengacu pada struktur file modular yang sudah berjalan:

- **Layer Service (`src/services/users-service.ts`)**:
  - File ini digunakan untuk menempatkan logika kuari ke database.
  - Buat fungsi, contoh `getCurrentUser(userId)`.
  - Fungsi ini mengambil data dari tabel `users` tanpa memaparkan informasi sensitif (seperti `password_hash`).

- **Layer Routing (`src/routes/users-route.ts`)**:
  - File ini berisi daftar *endpoint* yang berurusan secara langsung dengan resource `users`.
  - Daftarkan endpoint `GET /current` di rute ini.
  - Terapkan mekanisme verifikasi JWT sebelum handler (kontroler) mengeksekusi layanan pengambilan data profil.

---

## 3. Tahapan Implementasi (Step-by-Step Guide)

Bagi programer atau AI yang bertugas mengerjakan fitur ini, silakan ikuti alur kerja berikut:

### Langkah 1: Logika Service (`src/services/users-service.ts`)
1. Di dalam file ini, buat sebuah fungsi `getCurrentUser(userId: number)`.
2. Gunakan **Drizzle ORM** untuk memanggil query ke database (contoh: `db.query.users.findFirst({ ... })`).
3. Saring (*filter*) pencarian menggunakan kondisi ID yang dicocokkan dengan argumen fungsi.
4. Jika tidak ada hasil, *throw error* spesifik seperti `"Unauthorized"`.
5. Jika berhasil, segera return/kembalikan sekumpulan objek data diri user (`id`, `name`, `email`, `role`, `tenantId`, dan `createdAt`), hindari mengikutsertakan `passwordHash`.

### Langkah 2: Persiapan Verifikasi Token di Router
1. Buka file routing autentikasi atau plugin JWT.
2. (Disarankan) Buat sebuah plugin *middleware* atau fungsionalitas turunan (*derive*) di ElysiaJS yang mengekstrak Header `Authorization`.
3. Parse header tersebut dengan menghilangkan awalan string `"Bearer "`.
4. Dekode dan verifikasi tanda tangan token menggunakan fitur `.verify()` dari plugin `@elysiajs/jwt`.

### Langkah 3: Eksekusi Route (`src/routes/users-route.ts`)
1. Tambahkan metode sub-rute `.get("/current", async ({ set, ... }) => { ... })`.
2. Pasang plugin/middleware JWT Anda agar Anda punya instansiasi fungsi verifikasi token.
3. Terjemahkan JWT payload. Di sana, amankan `sub` atau field pengenal spesifik (berisi string ID User).
4. **Proteksi sesi via DB**: Tangkap juga field identifikasi token/`jti`. Cek apakah `jti` ada sebagai `token` di dalam tabel `sessions` dan di mana kondisinya masih bernilai aktif (`isActive: true`). Jika JWT valid secara checksum namun di database sudah dideaktivasi (revoked/logged out), tolak permintaan tersebut.
5. Jika semua lapisan pemeriksaan berhasil, konversi `sub` ID string menjadi *number*, lalu panggil `getCurrentUser(id)` dari *Layer Service*.
6. Susun luaran JSON dan bungkus kedalam property `"data" : { ... }`.
7. **Penanganan Error**: Kalau di tengah alur pemeriksaan ini ada kekeliruan (token gagal diparse, sesi tak aktif, atau user raib), set context HTTP `set.status = 401`, dan selesaikan dengan return JSON `{"error": "Unauthorized"}`.

### Langkah 4: Pengujian Lokal Terpadu
1. Nyalakan sistem backend (`bun run dev`).
2. Gunakan Postman/Insomnia/cURL. Buka request dan peragakan "Login" di `POST /api/login`.
3. Kopi (salin) string token dari luaran.
4. Buat request baru tipe `GET` ke endpoint `/api/users/current`.
5. Buka tab `Headers`, centumkan `Authorization` bernilai `Bearer <TOKEN_YANG_BERHASIL_DIBUAT>`.
6. Tembak koneksi. Hasil yang diantisipasi wajib menunjukkan format JSON profil user.
7. Lakukan pengetesan perusakan: gunakan sembarang token lain yang asimetris, dan expect respons sistem memblok dengan keterangan "Unauthorized" disertai status `401`.
