# Fitur Manajemen Data Tenant (Toko)

## Deskripsi Tugas
Tugas ini bertujuan untuk membangun struktur dasar pilar arsitektur *multi-tenant* di dalam aplikasi. Kita membutuhkan sebuah tabel baru untuk menyimpan data profil *tenant* (toko bisnis) dan menghubungkannya dengan tabel `users` yang ada melalui Foreign Key. Selain itu, diperlukan juga sebuah endpoint API untuk meregistrasikan tenant baru ke dalam platform.

Tugas ini harus menggunakan **ElysiaJS** untuk sistem routing/validasi HTTP, bersama dengan **Drizzle ORM** untuk modifikasi skema (*schema registry*) dan manipulasi basis data pada MySQL.

---

## 1. Spesifikasi Skema Database

**Tabel Baru: `tenants`**
- `id`: INT AUTO_INCREMENT PRIMARY KEY
- `name`: VARCHAR(100) NOT NULL
- `business_type`: ENUM('coffee_shop', 'fashion', 'laundry', 'restoran', 'bakery') NOT NULL
- `domain`: VARCHAR(100) UNIQUE
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

**Modifikasi Tabel yang Ada: `users`**
- Hubungkan kolom `tenant_id` sebagai **Foreign Key** yang merujuk pada `tenants(id)`.
- Atur perilaku Constraint *on delete* menjadi `CASCADE` (artinya: jika suatu data tenant dihapus dari tabel parent, semua record user/pegawai yang dimiliki tenant tersebut akan ikut musnah).

---

## 2. Spesifikasi API Registrasi Tenant

**Endpoint**: `POST /api/tenants`

**Request Body**:
```json
{
    "name" : "eko_coffee_shop",
    "business_type" : "coffee_shop",
    "created_at" : "timestamp" 
}
```
*(Catatan: Atribut `created_at` bisa berbentuk unix epoch, ISO string, atau secara fungsionalitas backend mengabaikan inputnya dan menyerahkan nilai otomatisasi ke `defaultNow()` di database).*

**Response Body - Saat Sukses** (Status Code `200` / `201`):
```json
{
    "data" : "OK"
}
```

**Response Body - Saat Terjadi Kesalahan** (Kondisi apapun, Status Code `400` / `500`):
```json
{
    "error" : "error"
}
```

---

## 3. Ketentuan Struktur Folder & File

Penerapan kode harus sejalan dengan arsitektur modular (*Layered Architecture*) yang ada di dalam berkas aplikasi:
- **Layer Service (`src/services/tenants-service.ts`)**: Terdedikasi untuk logika aplikasi intinya, validasi nilai unik, dan mengeksekusi *command* Drizzle ORM (`db.insert()`).
- **Layer Routing (`src/routes/tenants-route.ts`)**: Terdedikasi menerima asupan request HTTP, membatasi serta memvalidasi tipe data Payload (`body`) menggunakan *TypeBox*, dan melewatkan asupan tersebut ke fungsi service, dan merangkai balikan (*response*) HTTP JSON yang seragam.

---

## 4. Tahapan Implementasi (Step-by-Step Guide)

Dalam merakit fitur ini, perancang atau implementator spesialis harap mempedomani pedoman langkah di bawah ini:

### Langkah 1: Merancang Skema Baru Drizzle.
1. Buka manifest definisi database: `src/db/schema.ts`.
2. Di atas deklarasi tabel `users`, letakkan deklarasi spesifikasi untuk konstanta tabel MySQL bernama `tenants`.
3. Definisikan kolom menggunakan representasi tipe milik Drizzle:
   - `id`: `serial("id").primaryKey()`
   - `name`: `varchar("name", { length: 100 }).notNull()`
   - `businessType`: `mysqlEnum("business_type", ["coffee_shop", "fashion", "laundry", "restoran", "bakery"]).notNull()`
   - `domain`: `varchar("domain", { length: 100 }).unique()`
   - `createdAt`: `timestamp("created_at").defaultNow()`
4. Pada blok *schema* tabel `users`, mutasikan field `tenantId` agar dikompilasi ke wujud *Foreign Key*. Revisi baris kodenya menggunakan properti `references`. Contoh rujukan: `int("tenant_id").references(() => tenants.id, { onDelete: "cascade" })`.

### Langkah 2: Upacara Migrasi Database
1. Eksekusi `bun run db:generate` agar Drizzle dapat mengalkulasikan kalkulus selisih dari modifikasi schema dan menuliskannya di direktori `drizzle/`.
2. Segera jalankan `bun run db:push` untuk membebankan perubahannya ke peladen DBMS.
*Peringatan:* Menambah restriksi kardinalitas `FOREIGN KEY` pada tabel yang sudah terlampau mapan bisa memicu isu jika ada anomali nilainya, pastikan data yang mendiami `users` tidak bertentangan.

### Langkah 3: Merekayasa Logika Perangkat (*Service Model*)
1. Pahat file program anyar di `src/services/tenants-service.ts`.
2. Sedot instance `db` beserta perantara skema `tenants` dari pustaka Anda (e.g. `import { db } from "../db"; import { tenants } from "../db/schema";`).
3. Rumuskan mekanisme satu unit *arrow function*: e.g. `export const createTenant = async (payload) => { ... }`.
4. Berikan instruksi persuratan ke Drizzle untuk menyimpan nilai ke `tenants`: `await db.insert(tenants).values(...)`.
5. Apapun respon kembalian dari MySQL, bungkus eksekusi `createTenant` tersebut agar ia mengembalikan (return value) seuntai *string*: `"OK"`.

### Langkah 4: Mencetak Terminal Komunikasi (*Routing*)
1. Tambahkan titik koordinat di berkas baru `src/routes/tenants-route.ts`.
2. Di lapis ini wajib menghadirkan modul `Elysia`, validator `t`, serta perancang panggil `createTenant` yang di-*export* dari perumusan service.
3. Buat kerangka ruter: `export const tenantsRoute = new Elysia({ prefix: "/api" }).post("/tenants", async ({ body, set }) => { ... }, { body: t.Object({ ... }) })`.
4. Patuhi desain skema dengan mencangkokkan TypedBox untuk me-raster/validasi struktur *request body*. Definisikan properti dan atur properti string `name`, beserta enumerasi `business_type`.
5. Di ruang kontrol blok `try`, panggil pengemudi bisnis service (`createTenant`). Balas dengan obyek `{"data": "OK"}`.
6. Bila program mendeteksi hal janggal di parameter kontrol fungsi, lempar raga *Catch Error*, intersep ke variabel HTTP respons status (`400/500`) dan cetak konklusi `"error": "error"`.

### Langkah 5: Pemasangan Modul Purnalayanan & Pengujian
1. Masuk ke modul induk `src/index.ts`.
2. Angkut dan instalasikan stasiun terminal `tenantsRoute`.
3. Gunakan kaidah *.use()* (`app.use(tenantsRoute)`).
4. Selesaikan misi dengan pengujian keaslian mengandalkan peranti simulasi request Postman/cURL, di-post ke `/api/tenants` dan periksa refleksi kemapanan data barunya dengan `SELECT * FROM tenants`.
