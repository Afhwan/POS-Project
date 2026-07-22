# 1. Executive Overview

## 1.1 Document Purpose

Dokumen ini menjelaskan rancangan arsitektur teknis untuk **Restaurant Point of Sale (POS) Management System**.

Tujuan utama dokumen ini adalah memberikan blueprint teknis sebelum tahap implementasi dimulai.

Architecture document ini menjadi referensi untuk:

* Struktur aplikasi.
* Pembagian tanggung jawab setiap komponen.
* Alur komunikasi antar sistem.
* Standar pengembangan backend dan frontend.
* Keamanan aplikasi.
* Pola akses database.
* Strategi pengembangan jangka panjang.

Dokumen ini memastikan bahwa aplikasi dibangun secara terstruktur, mudah dipelihara, dan dapat dikembangkan.

---

# 2. System Overview

## 2.1 Product Description

Restaurant POS Management System adalah aplikasi berbasis web yang digunakan untuk mengelola operasional restoran, meliputi:

* Manajemen produk.
* Kategori menu.
* Transaksi penjualan.
* Pemesanan pelanggan.
* Pembayaran.
* Inventory management.
* Supplier management.
* Customer history.
* Table management.
* Reporting.

Sistem memiliki beberapa jenis pengguna:

| Role          | Description                                          |
| ------------- | ---------------------------------------------------- |
| Administrator | Mengelola seluruh sistem dan konfigurasi             |
| Cashier       | Mengelola order, transaksi, pembayaran, dan receipt  |
| Customer      | Guest user yang melakukan pemesanan melalui QR table |
| Supplier      | Entitas eksternal untuk pengadaan barang             |

---

# 3. Architectural Goals

Arsitektur sistem dirancang dengan beberapa tujuan utama.

---

# 3.1 Maintainability

Sistem harus mudah dipahami dan dikembangkan oleh developer lain.

Implementasi:

* Separation of concern.
* Modular folder structure.
* Clear responsibility setiap layer.
* Dokumentasi lengkap.

Contoh:

Controller tidak boleh memiliki query SQL.

Buruk:

```javascript
// controller
const users = await db.query(
    "SELECT * FROM users"
);
```

Baik:

```javascript
// controller
const users = await userService.getUsers();
```

---

# 3.2 Scalability

Sistem harus dapat dikembangkan apabila kebutuhan bertambah.

Contoh pengembangan masa depan:

* Multi restaurant branch.
* Online ordering.
* Real payment gateway.
* Mobile application.
* Cloud deployment.
* Advanced analytics.

Arsitektur tidak boleh menghambat perkembangan tersebut.

---

# 3.3 Security

Security menjadi bagian utama sejak awal desain.

Sistem menerapkan:

* Password hashing.
* Session authentication.
* Role Based Access Control.
* Input validation.
* SQL injection prevention.
* Security headers.
* Audit logging.
* Environment variable protection.

---

# 3.4 Performance

Sistem harus mampu memberikan respons cepat untuk operasi utama.

Contoh:

* Product search.
* Barcode lookup.
* Transaction creation.
* Inventory update.

Strategi:

* Database indexing.
* Efficient query.
* Pagination.
* Avoid unnecessary database call.
* Connection pooling.

---

# 3.5 Reliability

Sistem harus menjaga konsistensi data.

Contoh:

Ketika transaksi berhasil:

```
Transaction Created

↓

Payment Success

↓

Inventory Reduced

↓

Audit Log Created
```

Semua proses harus berjalan konsisten.

Jika terjadi kegagalan:

```
Rollback Transaction
```

Database harus tetap dalam kondisi valid.

---

# 4. Architectural Style

Sistem menggunakan:

# Layered Architecture

Pattern:

```
Presentation Layer

        ↓

Controller Layer

        ↓

Service Layer

        ↓

Repository Layer

        ↓

Database Layer
```

---

## 4.1 Why Layered Architecture?

Alasan menggunakan architecture ini:

### Mudah dipahami

Cocok untuk project portfolio dan pembelajaran software engineering.

---

### Separation of Responsibility

Setiap bagian memiliki tugas spesifik.

Contoh:

Controller:

```
Menerima HTTP Request
Mengirim HTTP Response
```

Service:

```
Business Logic
Validation Rules
Process Flow
```

Repository:

```
Database Communication
SQL Query
```

---

### Mudah Testing

Setiap layer dapat diuji secara terpisah.

Contoh:

Service dapat dites tanpa menjalankan HTTP server.

---

# 5. System Architecture Overview

Gambaran besar sistem:

```
                 USER

                  |
                  |

        Browser / Web Client

                  |
                  |

             Frontend

       HTML / CSS / JavaScript

                  |
                  |

              REST API

                  |
                  |

              Express.js

                  |
                  |

        --------------------

        Controller Layer

        --------------------

                  |
                  |

        --------------------

          Service Layer

        --------------------

                  |
                  |

        --------------------

       Repository Layer

        --------------------

                  |
                  |

             PostgreSQL

```

---

# 6. Component Architecture

## 6.1 Frontend Component

Frontend bertanggung jawab untuk:

* User interface.
* User interaction.
* Client-side validation.
* API communication.
* Data rendering.

Technology:

```
HTML5
CSS3
Vanilla JavaScript
```

Frontend tidak memiliki akses langsung ke database.

---

## 6.2 Backend Component

Backend bertanggung jawab untuk:

* Business logic.
* Authentication.
* Authorization.
* Data processing.
* API handling.
* Security enforcement.

Technology:

```
Node.js
Express.js
```

---

## 6.3 Database Component

Database menyimpan:

* User data.
* Customer data.
* Product data.
* Transaction data.
* Inventory data.
* Audit data.

Technology:

```
PostgreSQL
```

---

# 7. Backend Architecture

Struktur backend:

```
Backend

│
├── Routes
│
├── Controllers
│
├── Services
│
├── Repositories
│
├── Models
│
├── Validators
│
├── Middlewares
│
├── Utils
│
└── Config

```

---

# 8. Layer Responsibilities

## 8.1 Routes Layer

Tugas:

* Mendefinisikan endpoint API.
* Menghubungkan endpoint dengan controller.
* Menentukan middleware.

Contoh:

```
POST /api/products
```

mengarah ke:

```
productController.createProduct()
```

---

Tidak boleh:

* Business logic.
* Query database.

---

# 8.2 Controller Layer

Controller bertanggung jawab menerima request.

Tugas:

* Parsing request.
* Memanggil service.
* Mengirim response.

Flow:

```
Request

↓

Controller

↓

Service

↓

Response

```

---

Controller tidak boleh:

* Melakukan SQL query.
* Mengatur business rules.
* Mengubah data secara langsung.

---

# 8.3 Service Layer

Service adalah pusat business logic.

Contoh:

Membuat transaksi:

```
Check Product Availability

↓

Calculate Total Price

↓

Validate Payment

↓

Create Transaction

↓

Update Inventory

↓

Create Audit Log

```

Semua proses tersebut berada di Service.

---

# 8.4 Repository Layer

Repository bertanggung jawab terhadap database.

Contoh:

```
productRepository.findByBarcode()
```

melakukan:

```sql
SELECT *
FROM products
WHERE barcode = $1;
```

---

Repository tidak mengetahui:

* HTTP request.
* User role.
* Business rules.

---

# 8.5 Database Layer

PostgreSQL bertanggung jawab untuk:

* Data persistence.
* Constraint enforcement.
* Relationship management.
* Transaction management.

---

# 9. Frontend Architecture

Frontend menggunakan struktur modular:

```
frontend/

│
├── pages/
│
├── components/
│
├── js/
│
├── css/
│
└── assets/

```

---

## Pages

Berisi halaman utama.

Contoh:

```
login.html

dashboard.html

products.html

transaction.html

inventory.html

```

---

## Components

Komponen reusable:

Contoh:

```
navbar

sidebar

modal

table

notification

```

---

## JavaScript Modules

Berisi:

```
api.js

auth.js

product.js

transaction.js

inventory.js

```

---

# 10. Communication Pattern

Komunikasi frontend dan backend menggunakan:

```
REST API
```

Format data:

```
JSON
```

Contoh:

Request:

```json
{
    "barcode":"899123456789",
    "quantity":2
}
```

Response:

```json
{
    "success":true,
    "message":"Product added",
    "data":{
        "product_id":"uuid"
    }
}
```

---

# 11. Deployment Architecture (Current)

Untuk tahap awal:

```
Local Machine

        |

        |

Frontend Server

        |

        |

Backend Server

        |

        |

PostgreSQL Database

```

Semua berjalan pada localhost.

---

# 12. Future Deployment Architecture

Arsitektur memungkinkan migrasi:

```
User

 |

Cloud CDN

 |

Frontend Hosting

 |

Backend API Server

 |

PostgreSQL Server

 |

Storage / Monitoring

```

Contoh future:

* Docker container.
* VPS.
* Cloud database.
* CI/CD pipeline.

---

# 13. Architecture Principles Summary

Sistem mengikuti prinsip:

| Principle             | Implementation           |
| --------------------- | ------------------------ |
| Separation of Concern | Layered Architecture     |
| Single Responsibility | Service per domain       |
| Security First        | Validation + RBAC        |
| Database Integrity    | Constraint + Transaction |
| Maintainability       | Modular structure        |
| Scalability           | API-based design         |
| Testability           | Layer isolation          |

---


---

# 14. Project Folder Architecture

Struktur folder dirancang untuk menjaga modularitas dan memisahkan tanggung jawab setiap komponen.

Final structure:

```
POS-System/

│
├── docs/
│   │
│   ├── 01-PRD.md
│   ├── 02-ARCHITECTURE.md
│   ├── 03-ERD.md
│   ├── 04-API_SPEC.md
│   ├── 05-DEVELOPMENT_PLAN.md
│   ├── 06-CODING_STANDARD.md
│   └── 07-TEST_PLAN.md
│
│
├── backend/
│
│   ├── src/
│   │
│   ├── config/
│   │   ├── database.js
│   │   ├── session.js
│   │   └── environment.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── transactionController.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   └── inventoryService.js
│   │
│   ├── repositories/
│   │   ├── userRepository.js
│   │   ├── productRepository.js
│   │   └── orderRepository.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validationMiddleware.js
│   │
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── productValidator.js
│   │   └── orderValidator.js
│   │
│   ├── models/
│   │
│   ├── utils/
│   │   ├── response.js
│   │   ├── logger.js
│   │   └── uuid.js
│   │
│   ├── logs/
│   │
│   ├── app.js
│   └── server.js
│
│
├── frontend/
│
│   ├── pages/
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── cashier.html
│   │   ├── customer.html
│   │   └── inventory.html
│   │
│   ├── components/
│   │
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── orders.js
│   │
│   ├── css/
│   │
│   └── assets/
│
│
├── database/
│
│   ├── migrations/
│   ├── seeds/
│   └── scripts/
│
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md

```

---

# 15. Folder Responsibility

## 15.1 Config

Berisi konfigurasi aplikasi.

Contoh:

```javascript
database.js
```

Tanggung jawab:

* PostgreSQL connection.
* Connection pool.
* Database settings.

```javascript
session.js
```

Tanggung jawab:

* Session configuration.
* Cookie settings.
* Security options.

---

# 15.2 Controllers

Controller adalah entry point request.

Contoh:

```
productController.js
```

Menangani:

```
GET /products

POST /products

PUT /products/:id

DELETE /products/:id
```

Tidak boleh:

* SQL Query.
* Perhitungan bisnis.
* Manipulasi inventory langsung.

---

# 15.3 Services

Service merupakan pusat logic aplikasi.

Contoh:

```
orderService.js
```

Mengatur:

* Validasi order.
* Perhitungan total.
* Status transition.
* Pemanggilan repository.

---

# 15.4 Repository

Repository mengabstraksi database.

Contoh:

```
productRepository.js
```

Berisi:

```javascript
findById()

findByBarcode()

create()

update()

delete()

```

Repository tidak mengetahui:

* Siapa user.
* Role user.
* Tujuan bisnis.

---

# 15.5 Middleware

Middleware menangani proses sebelum controller.

Contoh:

Request:

```
GET /api/products
```

Flow:

```
Request

↓

Authentication Middleware

↓

Role Middleware

↓

Validation Middleware

↓

Controller

```

---

# 15.6 Validators

Validasi input.

Contoh:

Create Product:

Input:

```json
{
"name":"Ayam Goreng",
"price":15000
}
```

Validator mengecek:

* Nama tidak kosong.
* Harga valid.
* Format benar.

---

# 16. Backend Request Flow

Semua request mengikuti pola:

```
Client

 |

 |

HTTP Request

 |

 |

Express Router

 |

 |

Middleware

 |

 |

Controller

 |

 |

Service

 |

 |

Repository

 |

 |

PostgreSQL

```

---

# 17. Example Request Flow

Contoh:

Kasir menambahkan produk ke transaksi.

Request:

```
POST /api/orders/items
```

---

## Step 1 — Router

Router menerima:

```
POST /orders/items
```

Kemudian mengarahkan:

```
orderController.addItem()
```

---

## Step 2 — Authentication Middleware

Memeriksa:

* Session aktif.
* User login.
* Role cashier.

Jika gagal:

```
401 Unauthorized
```

---

## Step 3 — Controller

Controller:

* Mengambil request body.
* Memanggil service.

Contoh:

```
orderService.addProduct()
```

---

## Step 4 — Service

Service:

1. Mengecek produk tersedia.
2. Mengecek stok.
3. Menghitung harga.
4. Membuat order item.

---

## Step 5 — Repository

Repository menjalankan query:

```sql
SELECT *
FROM products
WHERE id=$1;
```

---

## Step 6 — Response

Backend mengembalikan:

```json
{
"success":true,
"message":"Product added"
}
```

---

# 18. Authentication Architecture

Sistem menggunakan:

```
Session Based Authentication
```

Bukan JWT.

---

# 18.1 Why Session?

Untuk aplikasi POS lokal:

Keuntungan:

* Lebih sederhana.
* Cocok untuk internal application.
* Mudah revoke session.
* Tidak perlu token management.

---

# 18.2 Authentication Flow

```
User

 |

Login Page

 |

POST /api/auth/login

 |

Auth Controller

 |

Auth Service

 |

User Repository

 |

Database

```

---

# 18.3 Login Process

Input:

```
username
password
```

---

Backend:

1. Cari user berdasarkan username.

2. Ambil password hash.

3. Compare menggunakan bcrypt.

```
bcrypt.compare()
```

4. Buat session.

5. Simpan user identity.

---

Session:

```javascript
{
 user_id:"uuid",
 role:"cashier"
}
```

---

Response:

```
Login Success
```

---

# 19. Authorization Architecture

Authentication:

"Siapa user?"

Authorization:

"Apa yang boleh dilakukan?"

---

Contoh:

User:

```
cashier
```

Request:

```
DELETE /products/:id
```

Middleware:

```
Check Role

↓

Not Allowed

```

Response:

```
403 Forbidden
```

---

# 20. Role Based Access Control

Matrix:

| Feature            | Admin | Cashier | Customer | Supplier |
| ------------------ | ----- | ------- | -------- | -------- |
| Manage User        | ✅     | ❌       | ❌        | ❌        |
| Manage Product     | ✅     | ❌       | ❌        | ❌        |
| Create Transaction | ✅     | ✅       | ❌        | ❌        |
| View Receipt       | ✅     | ✅       | Own Only | ❌        |
| Order Food         | ❌     | ❌       | ✅        | ❌        |
| Inventory          | ✅     | Limited | ❌        | ❌        |

---

# 21. Customer Guest Architecture

Customer tidak menggunakan akun password.

Customer menggunakan:

```
Guest Authentication
```

---

Flow:

```
QR Table

↓

Customer Scan

↓

Customer Login Form

↓

Phone Number Input

↓

Backend Normalize Phone

↓

Search Customer

↓

Create / Use Existing Customer

↓

Create Customer Session

```

---

# 22. Customer Identity Flow

Input:

```
Name:
Afhwan

Phone:
08123456789

```

---

Normalization:

```
08123456789

↓

628123456789

```

---

Database lookup:

```sql
SELECT *
FROM customers
WHERE phone='628123456789';
```

---

Jika ditemukan:

Gunakan:

```
customer_id existing
```

Nama input diabaikan.

---

Jika tidak ditemukan:

Create:

```
customers
```

---

# 23. Customer Session

Customer session menyimpan:

```
customer_id

table_id

session_start

session_end

```

---

Contoh:

```
Customer A

↓

Table 05

↓

Order Food

↓

Transaction

↓

Session Closed

```

---

# 24. Order Architecture

Order dipisahkan dari Transaction.

Alasan:

Karena:

```
Order ≠ Payment
```

Customer dapat memesan terlebih dahulu sebelum membayar.

---

# 25. Order Lifecycle

Status:

```
PENDING

↓

PROCESSING

↓

READY

↓

COMPLETED

```

atau:

```
PENDING

↓

CANCELLED

```

---

# 26. Order State Rules

Tidak boleh:

```
PENDING

↓

COMPLETED

```

atau:

```
PROCESSING

↓

PENDING
```

---

Service harus melakukan validasi:

```javascript
validateOrderTransition()
```

---

# 27. Order Flow

```
Customer

↓

Create Order

↓

Order Status Pending

↓

Kitchen Process

↓

Processing

↓

Food Ready

↓

Ready

↓

Customer Receive

↓

Completed

```

---

# 28. Cashier Order Flow

Kasir:

```
Open Transaction

↓

Select Customer/Table

↓

Add Product

↓

Confirm Order

↓

Send To Kitchen

↓

Payment

↓

Receipt

```

---


# 29. Transaction Architecture

## 29.1 Transaction Overview

Transaction merupakan proses finalisasi pembelian yang terjadi setelah order.

Dalam sistem ini:

```
Order

↓

Transaction

↓

Payment

↓

Receipt

```

Order dan Transaction sengaja dipisahkan.

Alasan:

* Customer dapat membuat order sebelum pembayaran.
* Status dapur tidak bergantung langsung pada pembayaran.
* Riwayat order dan keuangan memiliki kebutuhan data berbeda.
* Memudahkan integrasi payment gateway di masa depan.

---

# 29.2 Transaction Responsibility

Transaction bertanggung jawab untuk:

* Menyimpan detail pembelian.
* Menghitung total pembayaran.
* Menghubungkan customer.
* Menghubungkan cashier.
* Menyimpan item yang dibeli.
* Menghasilkan receipt.

---

# 29.3 Transaction Flow

High-level flow:

```
Customer Order

        |

        |

Order Confirmed

        |

        |

Cashier Review

        |

        |

Create Transaction

        |

        |

Payment Process

        |

        |

Payment Success

        |

        |

Reduce Inventory

        |

        |

Generate Receipt

```

---

# 30. Transaction Creation Flow

## Step 1 — Order Verification

Sebelum membuat transaction:

System melakukan pengecekan:

* Order exists.
* Order status valid.
* Item masih tersedia.
* Customer valid.
* Table valid.

---

## Step 2 — Calculate Transaction

Service menghitung:

```
Subtotal

+

Tax (future)

+

Discount (future)

=

Grand Total

```

Contoh:

```
Ayam Goreng
15.000 x 2

Nasi
5.000 x 2

----------------

Subtotal
40.000

```

---

## Step 3 — Create Transaction Record

Database:

```
transactions

transaction_items

```

dibuat dalam satu database transaction.

---

Database transaction:

```sql
BEGIN;

INSERT transaction;

INSERT transaction_items;

COMMIT;

```

Jika gagal:

```sql
ROLLBACK;

```

---

# 31. Transaction Status Architecture

Transaction memiliki status:

```
PENDING_PAYMENT

        |

        |

PAID

        |

        |

COMPLETED

```

atau:

```
PENDING_PAYMENT

        |

        |

CANCELLED

```

---

## Status Rules

Valid:

```
PENDING_PAYMENT → PAID

PAID → COMPLETED

PENDING_PAYMENT → CANCELLED

```

Tidak valid:

```
PENDING_PAYMENT → COMPLETED

```

---

# 32. Payment Architecture

## 32.1 Payment Overview

Payment merupakan modul terpisah dari transaction.

Tujuan:

* Mendukung banyak metode pembayaran.
* Menyimpan history pembayaran.
* Mempermudah integrasi gateway.

---

# 32.2 Payment Methods

Versi awal:

```
Cash

QRIS Dummy

Debit Dummy

Transfer Dummy

```

Future:

```
Midtrans

Xendit

Stripe

Bank API

```

---

# 33. Payment Flow

General payment:

```
Transaction Created

        |

        |

Select Payment Method

        |

        |

Process Payment

        |

        |

Payment Verification

        |

        |

Update Transaction

        |

        |

Receipt Generated

```

---

# 34. Cash Payment Flow

```
Cashier

↓

Select Cash

↓

Input Amount Received

↓

System Calculate Change

↓

Payment Success

↓

Transaction Paid

```

---

Example:

```
Total:

50.000


Cash:

100.000


Change:

50.000

```

---

# 35. QRIS Dummy Flow

QRIS tidak menggunakan payment gateway.

Flow:

```
Customer/Cashier

↓

Choose QRIS

↓

Display Dummy QR

↓

Waiting Payment

↓

Cashier Click Continue

↓

Payment Success

```

---

Database:

```
payments

status:

WAITING

↓

SUCCESS

```

---

# 36. Debit Dummy Flow

Flow:

```
Choose Debit

↓

Show Payment Dialog

↓

Continue

↓

Success

```

Simulasi terminal pembayaran.

---

# 37. Transfer Dummy Flow

Flow:

```
Choose Transfer

↓

Display Bank Information

↓

Customer Confirms

↓

Cashier Approves

↓

Success

```

---

# 38. Inventory Architecture

## 38.1 Inventory Overview

Inventory digunakan untuk mengontrol jumlah stok produk.

Sistem menyimpan:

* Current stock.
* Stock movement.
* Stock adjustment.
* Stock history.

---

# 39. Inventory Data Flow

```
Incoming Stock

        |

        |

Inventory

        |

        |

Stock History


```

atau:

```
Transaction Completed

        |

        |

Inventory Reduction

        |

        |

Stock History

```

---

# 40. Stock Management Principle

Prinsip utama:

> Semua perubahan stok harus memiliki catatan history.

Tidak boleh:

```
Stock = Stock - 10

```

tanpa membuat log.

---

Benar:

```
Transaction

↓

Inventory Update

↓

Inventory History

```

---

# 41. Inventory Operation Flow

## 41.1 Stock Incoming

Contoh:

Supplier mengirim barang.

Flow:

```
Supplier

↓

Admin Input Stock

↓

Validate Product

↓

Increase Stock

↓

Create History

```

---

History:

```
TYPE:

INCOMING

```

---

## 41.2 Stock Outgoing

Terjadi ketika transaksi selesai.

Flow:

```
Payment Success

↓

Inventory Service

↓

Check Stock

↓

Reduce Stock

↓

Create History

```

---

History:

```
TYPE:

OUTGOING

```

---

# 42. Stock Validation

Sistem harus memastikan:

```
Current Stock >= Requested Quantity

```

Contoh:

Stock:

```
5

```

Customer membeli:

```
7

```

Result:

```
Rejected

Insufficient Stock

```

---

# 43. Stock Adjustment

Digunakan untuk:

* Barang rusak.
* Salah input.
* Stock opname.

Flow:

```
Admin

↓

Adjustment Request

↓

Reason Required

↓

Update Stock

↓

Create Audit Log

```

---

Reason wajib:

```
Expired

Damaged

Lost

Correction

```

---

# 44. Low Stock Alert

System melakukan pengecekan:

```
Current Stock <= Minimum Stock

```

Contoh:

```
Stock:

5


Minimum:

10


Status:

LOW STOCK

```

---

# 45. Barcode Architecture

## 45.1 Barcode Purpose

Barcode digunakan untuk:

* Product lookup.
* Faster checkout.
* Inventory management.

---

# 46. Barcode Components

Support:

```
USB Barcode Scanner

Camera Scanner

```

---

# 47. USB Barcode Flow

USB scanner bekerja sebagai keyboard input.

Flow:

```
Scanner

↓

Input Barcode

↓

Frontend Capture

↓

API Request

↓

Product Search

```

---

Example:

Scanner mengirim:

```
899123456789

```

Frontend:

```
GET /api/products/barcode/899123456789

```

---

# 48. Camera Scanner Flow

Menggunakan:

```
html5-qrcode

```

atau:

```
QuaggaJS

```

Flow:

```
Camera

↓

Decode Barcode

↓

Get Barcode Number

↓

API Search

```

---

# 49. Barcode Rules

Setiap product:

```
barcode UNIQUE

```

Tidak boleh:

```
Product A

Barcode:

12345


Product B

Barcode:

12345

```

---

# 50. QR Table Architecture

## 50.1 Purpose

QR Table digunakan untuk:

* Identifikasi meja.
* Customer guest login.
* Menghubungkan order dengan meja.

---

QR bukan:

* Payment QR.
* Authentication permanent.
* Customer account.

---

# 51. QR Table Flow

```
Table

↓

QR Code

↓

Customer Scan

↓

Open Web Application

↓

Identify Table

↓

Guest Login

↓

Create Customer Session

```

---

# 52. QR Table Data

QR menyimpan:

```
table_id

```

Contoh URL:

```
restaurant.local/table/uuid

```

---

Backend:

```
GET /table/:id

```

melakukan:

```
Check Table

↓

Set Current Table

```

---

# 53. Table Status Architecture

Status:

```
AVAILABLE

        |

        |

OCCUPIED

        |

        |

CLEANING

        |

        |

AVAILABLE

```

---

Status tambahan:

```
RESERVED

MAINTENANCE

```

---

# 54. Table State Rules

Tidak boleh:

```
AVAILABLE

↓

CLEANING

```

tanpa proses selesai.

Contoh valid:

```
COMPLETED ORDER

↓

CLEANING

↓

AVAILABLE

```

---

# 55. Complete Business Flow

Full POS flow:

```
CUSTOMER

↓

Scan QR Table

↓

Guest Login

↓

Create Order

↓

Kitchen Processing

↓

Ready

↓

Cashier Create Transaction

↓

Payment

↓

Success

↓

Inventory Update

↓

Receipt

↓

Table Cleaning

↓

Available

```

---

# 56. Module Interaction Overview

```
                 Customer

                    |

                    |

               Order Service

                    |

        -----------------------

        |                     |

Transaction Service     Inventory Service

        |

        |

Payment Service

        |

        |

Receipt Service

```

---


# 57. Security Architecture Overview

## 57.1 Security Objective

Security architecture dirancang untuk memastikan:

* Data pengguna terlindungi.
* Hak akses sesuai role.
* Database aman dari manipulasi.
* Aktivitas penting dapat dilacak.
* Kesalahan sistem tidak membocorkan informasi sensitif.

Security bukan fitur tambahan, tetapi bagian dari desain utama aplikasi.

---

# 58. Security Principles

Sistem mengikuti prinsip:

## 58.1 Defense in Depth

Keamanan tidak hanya bergantung pada satu lapisan.

Implementasi:

```
Frontend Validation

        ↓

Backend Validation

        ↓

Authorization Check

        ↓

Database Constraint

        ↓

Audit Logging
```

Jika satu lapisan gagal, lapisan lain tetap melindungi sistem.

---

# 58.2 Least Privilege

Setiap user hanya mendapatkan akses minimum yang diperlukan.

Contoh:

Cashier:

Boleh:

```
Create Transaction
View Product
Process Payment
Print Receipt
```

Tidak boleh:

```
Delete User
Modify System Settings
Change Role
```

---

# 58.3 Secure by Default

Default sistem harus aman.

Contoh:

* Password tidak pernah disimpan plaintext.
* Error database tidak dikirim ke client.
* Session memiliki expiry.
* API membutuhkan authorization.

---

# 59. Authentication Security

## 59.1 Password Storage

Password menggunakan:

```
bcrypt
```

Tidak menggunakan:

* Plain text.
* MD5.
* SHA1.

---

Contoh:

Password asli:

```
mypassword123
```

Database:

```
$2b$12$7K8.......
```

---

# 59.2 Password Hashing Flow

```
User Register/Create Account

          |

          |

Password Input

          |

          |

bcrypt.hash()

          |

          |

Store Hash

          |

          |

Database

```

---

# 59.3 Password Verification

Saat login:

```
Input Password

        |

        |

bcrypt.compare()

        |

        |

Match / Reject

```

---

# 60. Session Security

Sistem menggunakan:

```
express-session
```

---

# 60.1 Session Data

Session menyimpan informasi minimal:

```javascript
{
    user_id: "uuid",
    role: "cashier"
}
```

Tidak menyimpan:

* Password.
* Data sensitif.
* Informasi pembayaran.

---

# 60.2 Session Lifecycle

```
Login

 |

Create Session

 |

User Activity

 |

Session Active

 |

Logout / Expired

 |

Destroy Session

```

---

# 60.3 Session Configuration

Konfigurasi keamanan:

```javascript
{
    httpOnly: true,
    secure: false,
    sameSite: "strict"
}
```

Untuk production:

```
secure: true
```

dengan HTTPS.

---

# 61. Authorization Architecture

Authentication menjawab:

```
Who are you?
```

Authorization menjawab:

```
What can you do?
```

---

# 62. Role Based Access Control (RBAC)

Flow:

```
Request

 |

Authentication Middleware

 |

Get User Role

 |

Permission Check

 |

Controller

```

---

Contoh:

Request:

```
DELETE /api/products/123
```

User:

```
cashier
```

Middleware:

```
Role Check

↓

Denied
```

Response:

```json
{
    "success":false,
    "message":"Forbidden"
}
```

---

# 63. Permission Architecture

Hak akses dapat dikembangkan menggunakan permission table.

Future:

```
roles

permissions

role_permissions

```

Contoh:

```
Admin

    |
    |
    +-- product.create
    +-- product.delete
    +-- user.manage


Cashier

    |
    |
    +-- transaction.create
    +-- payment.process

```

---

# 64. Input Validation Architecture

## 64.1 Validation Principle

Frontend validation hanya untuk UX.

Backend validation adalah sumber kebenaran.

---

Flow:

```
User Input

 |

Frontend Validation

 |

HTTP Request

 |

Backend Validation

 |

Business Logic

 |

Database

```

---

# 65. Validation Layer

Validasi dilakukan sebelum Service.

Flow:

```
Controller

 |

Validation Middleware

 |

Service

```

---

# 66. Validation Types

## 66.1 Required Validation

Contoh:

Product:

```
name required

price required

category required

```

---

## 66.2 Data Type Validation

Contoh:

Price:

Benar:

```
15000
```

Salah:

```
"abc"
```

---

## 66.3 Format Validation

Phone:

Input:

```
08123456789
```

Normalize:

```
628123456789
```

---

## 66.4 Business Validation

Contoh:

Stock:

```
Stock tidak boleh negatif
```

Database constraint:

```sql
CHECK(stock >= 0)
```

---

# 67. SQL Injection Prevention

Database access menggunakan:

```
Parameterized Query
```

---

Tidak boleh:

```javascript
const query =
"SELECT * FROM users WHERE username='"
+ username +
"'";

```

---

Karena:

Input:

```
admin' OR '1'='1
```

dapat memanipulasi query.

---

Yang benar:

```javascript
db.query(
`
SELECT *
FROM users
WHERE username=$1
`,
[
 username
]
);

```

---

# 68. Database Security

PostgreSQL menggunakan:

## Constraint

Untuk menjaga integritas:

```
PRIMARY KEY

FOREIGN KEY

UNIQUE

CHECK

NOT NULL

```

---

Contoh:

Barcode:

```sql
UNIQUE(barcode)
```

---

Harga:

```sql
CHECK(price >= 0)
```

---

# 69. Soft Delete Architecture

Data tidak langsung dihapus.

Menggunakan:

```
deleted_at
```

---

Contoh:

Sebelum:

```
Product

id:
123

deleted_at:
NULL

```

---

Delete:

```
deleted_at:

2026-07-22 10:00:00

```

---

Keuntungan:

* Audit.
* Recovery.
* History transaksi tetap aman.

---

# 70. Audit Log Architecture

## 70.1 Purpose

Audit log mencatat aktivitas penting.

Contoh:

```
Admin menghapus produk

Cashier membuat transaksi

Stock adjustment dilakukan

```

---

# 70.2 Audit Data

Contoh:

```
audit_logs

id

user_id

action

entity

entity_id

old_value

new_value

timestamp

```

---

# 70.3 Audit Flow

```
User Action

 |

Service

 |

Database Change

 |

Create Audit Log

```

---

Contoh:

Admin mengubah harga:

Before:

```
15000
```

After:

```
18000
```

Log:

```
UPDATE_PRODUCT_PRICE

old:15000

new:18000

```

---

# 71. HTTP Security

Menggunakan:

```
Helmet.js
```

---

Protection:

* Security headers.
* XSS mitigation.
* Clickjacking protection.

---

# 72. Content Security Policy (CSP)

CSP membatasi sumber resource.

Contoh:

```
script-src 'self'

style-src 'self'

```

Tujuan:

Mengurangi risiko:

* XSS.
* Malicious script injection.

---

# 73. Rate Limiting

Digunakan untuk endpoint sensitif.

Contoh:

```
POST /api/auth/login
```

---

Tanpa protection:

```
Attacker

↓

10000 login attempt

```

---

Dengan rate limiter:

```
5 attempts / minute

↓

Blocked

```

---

# 74. Error Handling Architecture

## 74.1 Error Principle

Error harus:

* Aman.
* Konsisten.
* Mudah debugging.

---

Tidak boleh:

Mengirim:

```
Postgres Error:
relation users does not exist

```

ke user.

---

# 75. Error Flow

```
Controller

 |

Service Error

 |

Error Middleware

 |

Logger

 |

Client Response

```

---

# 76. API Error Response Standard

Format:

```json
{
    "success":false,
    "message":"Invalid request",
    "error_code":"VALIDATION_ERROR"
}
```

---

Contoh:

404:

```json
{
"success":false,
"message":"Product not found",
"error_code":"NOT_FOUND"
}
```

---

500:

```json
{
"success":false,
"message":"Internal server error"
}
```

---

# 77. Logging Architecture

## 77.1 Logging Purpose

Logging digunakan untuk:

* Debugging.
* Monitoring.
* Security investigation.

---

# 78. Log Level

Menggunakan:

```
INFO

WARN

ERROR

DEBUG

```

---

Contoh:

INFO:

```
User login success

```

WARN:

```
Failed login attempt

```

ERROR:

```
Database connection failed

```

---

# 79. Application Logging

Contoh:

```
logs/

├── app.log

├── error.log

└── audit.log

```

---

# 80. Sensitive Data Protection

Tidak boleh melakukan logging:

```
Password

Credit Card

Full Payment Credential

Session Secret

```

---

Contoh buruk:

```
User login:

username=admin

password=password123

```

---

Contoh benar:

```
User login attempt:

username=admin

status=failed

```

---

# 81. Environment Security

Sensitive configuration disimpan di:

```
.env
```

---

Contoh:

```
DATABASE_URL=

SESSION_SECRET=

PORT=

```

---

Tidak boleh:

```
commit .env ke GitHub
```

---

Menggunakan:

```
.env.example
```

---

# 82. Security Middleware Flow

Full request security:

```
Incoming Request

        |

        |

Helmet

        |

        |

Rate Limiter

        |

        |

Session Check

        |

        |

Authentication

        |

        |

Authorization

        |

        |

Validation

        |

        |

Controller

```

---

# 83. Security Architecture Summary

| Security Area    | Implementation        |
| ---------------- | --------------------- |
| Password         | bcrypt                |
| Authentication   | express-session       |
| Authorization    | RBAC                  |
| SQL Injection    | Parameterized Query   |
| Input Security   | Backend Validation    |
| HTTP Security    | Helmet                |
| XSS Protection   | CSP                   |
| Abuse Prevention | Rate Limiter          |
| Data Recovery    | Soft Delete           |
| Tracking         | Audit Log             |
| Configuration    | Environment Variables |

---


# 84. Database Access Architecture

## 84.1 Database Access Principle

Database hanya dapat diakses melalui **Repository Layer**.

Tidak ada komponen lain yang boleh melakukan query langsung.

Architecture:

```id="h2v5tq"
Controller

      X

      |

      ✓

Service

      |

      |

Repository

      |

      |

PostgreSQL

```

---

# 84.2 Why Repository Pattern?

Repository Pattern digunakan untuk:

* Memisahkan business logic dengan database logic.
* Mempermudah perubahan database.
* Mempermudah testing.
* Menghindari query tersebar di banyak file.

---

Contoh tanpa repository:

```javascript id="6s4n8f"
// Controller

const result = await db.query(
    "SELECT * FROM products"
);

```

Masalah:

* Controller mengetahui database.
* Sulit dites.
* Sulit dirawat.

---

Dengan repository:

```javascript id="1v0t8a"
// Controller

const products =
await productService.getProducts();

```

Service:

```javascript id="5i8k2s"
const products =
await productRepository.findAll();

```

Repository:

```javascript id="e7qkq9"
SELECT *
FROM products;

```

---

# 85. Repository Layer Design

## 85.1 Repository Responsibility

Repository hanya menangani:

* CRUD database.
* Query.
* Database transaction.
* Mapping data database.

---

Repository tidak menangani:

❌ Authentication

❌ Authorization

❌ Business rules

❌ HTTP response

---

# 85.2 Repository Example Structure

```id="8r7w90"
repositories/

├── userRepository.js

├── customerRepository.js

├── productRepository.js

├── orderRepository.js

├── transactionRepository.js

├── inventoryRepository.js

└── paymentRepository.js

```

---

# 85.3 Repository Example

```javascript id="4rqf9v"
class ProductRepository {

async findByBarcode(barcode){

return db.query(
`
SELECT *
FROM products
WHERE barcode=$1
`,
[barcode]
);

}


}

```

---

Repository hanya mengetahui:

```id="l4fj2w"
Bagaimana mengambil data

```

Bukan:

```id="x4cr1q"
Kenapa data harus diambil

```

---

# 86. Service Layer Architecture

## 86.1 Service Responsibility

Service merupakan pusat aturan bisnis.

Service menangani:

* Business rules.
* Workflow.
* Validation lanjutan.
* Transaction management.
* Pemanggilan repository.

---

# 86.2 Service Structure

```id="x9jz7s"
services/

├── authService.js

├── customerService.js

├── productService.js

├── orderService.js

├── transactionService.js

├── paymentService.js

└── inventoryService.js

```

---

# 86.3 Example: Transaction Service

Flow:

```id="8trz9m"
createTransaction()

        |

        |

Validate Order

        |

        |

Calculate Total

        |

        |

Create Transaction

        |

        |

Create Payment

        |

        |

Update Inventory

        |

        |

Create Audit Log

```

---

Pseudocode:

```javascript id="7m9s5h"
async function createTransaction(orderId){

validateOrder(orderId);

calculateTotal();

createTransaction();

processPayment();

updateInventory();

createAuditLog();

}

```

---

# 87. Dependency Direction

Dependency harus satu arah:

```id="jv6vbp"
Controller

     ↓

Service

     ↓

Repository

     ↓

Database

```

---

Tidak boleh:

```id="35fj6v"
Repository

     ↓

Service

```

atau:

```id="c6azcm"
Controller

     ↓

Database

```

---

# 88. Database Transaction Management

Operasi penting harus menggunakan database transaction.

Contoh:

Checkout.

Tanpa transaction:

```id="qz6qkd"
Create Transaction

Success

↓

Update Inventory

Failed

```

Result:

Data tidak konsisten.

---

Dengan transaction:

```id="w48z8h"
BEGIN

↓

Create Transaction

↓

Update Inventory

↓

Create Payment

↓

COMMIT

```

Jika gagal:

```id="d7z8xi"
ROLLBACK

```

---

# 89. API Architecture

## 89.1 API Style

Menggunakan:

```id="k5z7ce"
REST API
```

Format:

```id="2q5g1d"
JSON

```

---

# 90. API Naming Convention

Menggunakan:

```id="4tq3x8"
Noun-based endpoint
```

---

Benar:

```
GET /api/products

POST /api/products

GET /api/orders

POST /api/orders

```

---

Tidak menggunakan:

```
GET /api/getProducts

POST /api/createProduct

```

---

# 91. API Versioning

Menggunakan:

```id="1ryv0s"
/api/v1/
```

---

Contoh:

```
GET /api/v1/products
```

---

Tujuan:

Memungkinkan perubahan API tanpa merusak versi lama.

---

# 92. API Response Standard

Semua response menggunakan format konsisten.

---

## Success Response

```json id="0w3m0c"
{
    "success": true,
    "message": "Product retrieved successfully",
    "data": {}
}

```

---

## Collection Response

```json id="51u5o8"
{
    "success":true,
    "message":"Products retrieved",
    "data":[
        {
            "id":"uuid",
            "name":"Burger",
            "price":25000
        }
    ]
}

```

---

## Error Response

```json id="w2b9yi"
{
    "success":false,
    "message":"Product not found",
    "error_code":"PRODUCT_NOT_FOUND"
}

```

---

# 93. HTTP Status Code Standard

| Status | Usage            |
| ------ | ---------------- |
| 200    | Success          |
| 201    | Created          |
| 400    | Bad Request      |
| 401    | Unauthorized     |
| 403    | Forbidden        |
| 404    | Not Found        |
| 409    | Conflict         |
| 422    | Validation Error |
| 500    | Server Error     |

---

# 94. API Error Handling Flow

```id="j9c4g6"
Service Error

        |

        |

Error Middleware

        |

        |

Logger

        |

        |

Standard Response

```

---

# 95. Architecture Decision Record (ADR)

ADR digunakan untuk mencatat keputusan desain penting.

Format:

```id="2v91k5"
Decision

Context

Problem

Chosen Solution

Alternative

Reason

```

---

# ADR-001

# Layered Architecture

## Context

Aplikasi membutuhkan struktur yang mudah dikembangkan.

---

## Decision

Menggunakan:

```
Controller

↓

Service

↓

Repository

↓

Database

```

---

## Alternative

MVC sederhana:

```
Controller

↓

Model

```

---

## Reason

Layered architecture lebih cocok untuk:

* Portfolio.
* Skalabilitas.
* Separation of concern.

---

# ADR-002

# PostgreSQL Database

## Context

POS membutuhkan relational data.

---

## Decision

Menggunakan PostgreSQL.

---

## Alternative

* MySQL.
* MongoDB.

---

## Reason

PostgreSQL memiliki:

* Strong relation.
* Constraint lengkap.
* Transaction support.
* Advanced SQL feature.

---

# ADR-003

# Session Authentication

## Context

Aplikasi digunakan sebagai internal restaurant system.

---

## Decision

Menggunakan express-session.

---

## Alternative

JWT.

---

## Reason

Session lebih sederhana dan sesuai untuk:

* Local deployment.
* Internal application.
* POS environment.

---

# ADR-004

# UUID Primary Key

## Context

Data membutuhkan identifier unik.

---

## Decision

Menggunakan UUID.

---

## Alternative

Auto increment integer.

---

## Reason

UUID:

* Tidak mudah ditebak.
* Lebih scalable.
* Cocok untuk distributed system.

---

# ADR-005

# Order Separate From Transaction

## Context

Order dan pembayaran memiliki lifecycle berbeda.

---

## Decision

Memisahkan:

```
Orders

Transactions

Payments

```

---

## Reason

Lebih fleksibel untuk:

* Kitchen workflow.
* Payment integration.
* Reporting.

---

# 96. Future Scalability Architecture

Arsitektur saat ini dibuat agar dapat berkembang.

---

# 96.1 Dockerization

Future:

```id="4tbj5m"
Frontend Container

Backend Container

PostgreSQL Container

```

---

# 96.2 Cloud Deployment

Possible architecture:

```id="u3s2yo"
User

 |

CDN

 |

Frontend Hosting

 |

API Server

 |

Database Server

 |

Backup Storage

```

---

# 96.3 Mobile Application

Karena menggunakan REST API:

Future:

```id="zv8m4r"
Web App

      |

      |

REST API

      |

      |

Mobile App

```

Backend tidak perlu dibuat ulang.

---

# 96.4 Multi Branch Restaurant

Future database extension:

Tambah:

```
branches

branch_users

branch_inventory

```

---

Flow:

```id="y9b8ne"
Restaurant A

        |

        |

Same Backend

        |

        |

Restaurant B

```

---

# 96.5 Real Payment Integration

Payment service sudah dipisahkan.

Future:

```id="0n8y6r"
Payment Service

        |

        |

Midtrans API

        |

        |

Payment Gateway

```

---

# 97. Monitoring Future

Future enhancement:

* Application monitoring.
* Error tracking.
* Performance monitoring.

Contoh:

* Prometheus.
* Grafana.
* Sentry.

---

# 98. Complete Architecture Diagram

Final architecture:

```id="1m3yqf"

                    USERS

                      |

                      |

              Frontend Application

              HTML CSS JavaScript

                      |

                      |

                 REST API

                      |

                      |

              Express.js Backend

                      |

        --------------------------------

        |              |              |

   Controller      Middleware     Validator

        |

        |

     Service Layer

        |

        |

   Repository Layer

        |

        |

    PostgreSQL Database

        |

        |

 Inventory / Transaction / Audit Data

```

---

# 99. Architecture Document Conclusion

Architecture POS System dirancang dengan pendekatan:

* Modular.
* Secure.
* Maintainable.
* Scalable.
* Industry-oriented.

Keputusan desain dibuat dengan mempertimbangkan:

* Kebutuhan sekolah.
* Portfolio software engineering.
* Kemampuan implementasi pelajar.
* Kemungkinan pengembangan masa depan.

Architecture ini menjadi fondasi sebelum masuk ke tahap:

```
03-ERD.md
```

yang akan membahas:

* Database schema.
* Entity relationship.
* Table design.
* Primary key.
* Foreign key.
* Constraint.
* Index.
* Normalization.

---
