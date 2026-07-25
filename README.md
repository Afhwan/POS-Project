# PROJECT P O S

Proyek ini adalah backend Point of Sale (POS) dengan autentikasi user, manajemen session, dan API guest/customer table session untuk restoran.

## Struktur Utama

- `backend/` - kode server Node.js / Express
- `backend/index.js` - entrypoint aplikasi utama
- `backend/package.json` - dependensi dan script
- `backend/src/` - versi terstruktur dari aplikasi dengan pemisahan controller, repository, routes, dan middleware
- `database/schema.sql` - skema basis data PostgreSQL
- `database/seeds/seed.sql` - data seed awal
- `frontend/frontendcontoh.html` - contoh frontend sederhana

## Fitur Utama

- Login user dengan session server-side menggunakan `express-session`
- Logout, pemeriksaan autentikasi, dan endpoint `me`
- Middleware otorisasi untuk `admin` dan `cashier`
- Manajemen sesi pelanggan melalui token QR table
- Endpoint untuk melihat detail meja, membuat meja baru, dan mengakses sesi/customer orders
- Koneksi database PostgreSQL dengan pooling
- Proteksi header dasar menggunakan `helmet`

## Dependensi Utama

- `express`
- `express-session`
- `cors`
- `dotenv`
- `helmet`
- `bcrypt`
- `pg`
- `express-validator`
- `nodemon` (dev dependency)

## Persiapan dan Jalankan

1. Masuk ke folder backend:

   ```bash
   cd backend
   ```

2. Pasang dependensi:

   ```bash
   npm install
   ```

3. Buat file `.env` di folder `backend/` dengan placeholder yang sesuai. Jangan commit file ini ke repositori.

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=<your_db_user>
   DB_PASSWORD=<your_db_password>
   DB_NAME=<your_db_name>
   SESSION_SECRET=<your_secret_key>
   PORT=3000
   NODE_ENV=development
   ```

4. Pastikan database PostgreSQL sudah tersedia dan jalankan skema:
   - `database/schema.sql`
   - `database/seeds/seed.sql` jika ingin data awal

5. Jalankan server:

   ```bash
   npm run dev
   ```

6. Buka health check:
   ```
   http://localhost:3000/api/v1/health
   ```

## API Utama

### Autentikasi

- `POST /api/v1/auth/login` - login user
- `POST /api/v1/auth/logout` - logout user
- `GET /api/v1/auth/me` - ambil data user yang sedang login

### Pelanggan / Meja

- `POST /api/v1/customers/login` - buat sesi customer dari token QR meja
- `GET /api/v1/customers/me` - ambil data customer aktif
- `GET /api/v1/customers/me/orders` - daftar order customer aktif
- `GET /api/v1/tables/qr/:token` - validasi token QR meja

### Meja (Admin)

- `GET /api/v1/tables` - daftar meja (admin)
- `POST /api/v1/tables` - buat meja baru (admin)

## Catatan

- Jangan publikasikan detail database, token, atau credential apa pun.
- File `.env` harus disimpan secara lokal dan tidak dikomitkan ke repositori.
- Asal CORS dikunci ke `http://localhost:5500` pada konfigurasi saat ini.
- Pastikan `SESSION_SECRET` di `.env` diset untuk keamanan session.
- Struktur kode di `backend/src/` menyediakan arsitektur yang lebih modular dibandingkan `backend/index.js`.

- Asal CORS dikunci ke `http://localhost:5500` pada konfigurasi saat ini.
- Pastikan `SESSION_SECRET` di `.env` diset untuk keamanan session.
- Struktur kode di `backend/src/` menyediakan arsitektur yang lebih modular dibandingkan `backend/index.js`.

## Dokumentasi


---

Jika ingin menambahkan frontend, gunakan `frontend/frontendcontoh.html` sebagai contoh awal.
