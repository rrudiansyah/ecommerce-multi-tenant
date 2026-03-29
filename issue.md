# Bug: Internal Server Error saat Panjang Karakter Payload Melebihi Kapasitas Database

## Deskripsi Isu
Saat ini, proses pendaftaran *user* baru (`POST /api/users`) tidak divalidasi dengan baik terkait panjang maksimal karakternya. Jika kita mencoba mengirim *payload* (seperti profil `name`) yang memiliki kepanjangan lebih dari 100 karakter, API gagal merespons dengan wajar (seperti memberikan pesan "Validasi gagal"). Alih-alih demikian, aplikasi tersebut merespons dramatis dengan meluncurkan respons **500 Internal Server Error**.

**Penyebab:** Pada sisi skema *database* (di `schema.ts`), atribut `name`, `email`, dan `phone` dikonfigurasikan setinggi-tingginya `varchar(100)`. Saat muatan (payload) yang lewat dari *route* belum dipagari oleh batas atas karakter, muatan itu dibiarkan melaju ke *database*, sehingga MySQL memberikan perlawanan/penolakan error (`ER_DATA_TOO_LONG`). Kemudian rute menangkap eksepsi ini dan menggeneralisirnya sebagai kesalahan internal `500`.

Tugas ini difokuskan untuk memperbaiki pencegahan di awal, yakni menambahkan kontrol batas karakter ke dalam lapisan rute ElysiaJS.

---

## File Target
Tugas bertempat di berkas:
- **Routing Layer (`src/routes/users-route.ts`)**

---

## Tahapan Implementasi Perbaikan (Panduan Bertahap)

Untuk eksekutor yang menyempurnakan struktur *bug* ini, ini adalah langkah yang harus dilakukan:

### Langkah 1: Pahami Skema Basis Data (Database)
1. Tinjau file `src/db/schema.ts`.
2. Lihat deklarasi tabel `users` pada properti kolom `name`, `email`, serta `phone` yang masing-masing tercetak `varchar("...", { length: 100 })`.
3. Dari skema itu dapat kita ketahui bahwa batas toleransi adalah **100 karakter**.

### Langkah 2: Tambahkan Pertahanan Panjang pada Tipe Objek Rute
1. Buka pengontrol API pengguna di `src/routes/users-route.ts`.
2. Carilah baris di mana deklarasi rute registrasi (`.post("/users", ...)`) diakhiri oleh properti proteksi:
   ```typescript
   body: t.Object({ ... })
   ```
3. Tambahkan restriksi maksimal ke properti TypeBox tersebut dengan memasukkan konfigurasi `{ maxLength: 100 }`. Lebih dianjurkan untuk tak luput memasang `minLength: 1` untuk memagari masuknya spasi belaka. 
   - Modifikasi `name: t.String()` manjadi `name: t.String({ maxLength: 100, minLength: 1 })`.
   - Modifikasi `email: t.String({ format: "email" })` manjadi `email: t.String({ format: "email", maxLength: 100 })`.
   - Modifikasi `phone: t.String()` manjadi `phone: t.String({ maxLength: 100, minLength: 1 })`.
   - (Opsional) Pada password karena langsung menembus hash bcrypt, Anda sanggup menambahkan `password: t.String({ minLength: 6 })`.

### Langkah 3: Pengujian Validasi
1. Simpan perubahan dan nyalakan ulang server (`bun run dev`).
2. Gunakan *cURL* ataupun jalankan skrip *fetch* buatan yang sengaja me-_looping_ teks karakter melebihi 100 panjangnya untuk bidang nama (contoh sintaksis JS: `"a".repeat(105)`).
3. Evaluasi *response*-nya. Server harus spontan membuahkan penolakan kesalahan **HTTP Status 422 (Unprocessable Content)** atau **HTTP 400 Bad Request** ala Elysia validasi TypeBox, bukan lagi HTTP Status `500`.
4. Anda sudah berhasil menghemat beban *database* server Anda dari pemanggilan dan eksekusi sampah.
