# 1. Database Design Overview

## 1.1 Purpose

Dokumen ini menjelaskan rancangan database untuk:

**Restaurant Point of Sale Management System**

Database bertanggung jawab menyimpan seluruh data utama aplikasi:

* User management.
* Authentication.
* Product catalog.
* Customer data.
* Table management.
* Order.
* Transaction.
* Payment.
* Inventory.
* Audit history.

---

# 2. Database Design Goals

Database dirancang dengan tujuan:

---

## 2.1 Data Integrity

Database harus memastikan data tetap valid.

Implementasi:

* Primary Key.
* Foreign Key.
* Unique Constraint.
* Check Constraint.
* Not Null Constraint.

Contoh:

Harga tidak boleh negatif.

```sql
CHECK(price >= 0)
```

---

# 2.2 Consistency

Data harus konsisten antar tabel.

Contoh:

Transaction item harus selalu memiliki product yang valid.

Relationship:

```
transactions

      |

      |

transaction_items

      |

      |

products
```

---

# 2.3 Scalability

Database harus dapat dikembangkan untuk:

* Multi branch restaurant.
* Online ordering.
* Mobile application.
* Advanced reporting.

---

# 2.4 Auditability

Semua perubahan penting dapat dilacak.

Implementasi:

* created_at
* updated_at
* deleted_at
* audit_logs

---

# 3. Database Technology

Database:

```
PostgreSQL
```

Version target:

```
PostgreSQL 16+
```

---

Alasan:

* Strong relational model.
* ACID transaction.
* Advanced indexing.
* JSON support.
* UUID support.
* Excellent constraint system.

---

# 4. Database Architecture

Application:

```
Node.js Express
        |
        |
Repository Layer
        |
        |
PostgreSQL
```

---

Tidak ada:

```
Frontend

   X

Database
```

---

Frontend tidak pernah mengakses database langsung.

---

# 5. Database Naming Convention

## 5.1 Table Naming

Menggunakan:

```
snake_case
```

dan bentuk plural.

Contoh:

Benar:

```
users

products

transactions

inventory_history
```

---

Tidak:

```
User

Product

Transaction
```

---

# 5.2 Column Naming

Menggunakan:

```
snake_case
```

Contoh:

```
created_at

updated_at

phone_number

product_name
```

---

# 5.3 Primary Key

Semua tabel menggunakan:

```
UUID
```

Format:

```sql
id UUID PRIMARY KEY
```

---

Contoh:

```
550e8400-e29b-41d4-a716-446655440000
```

---

# 5.4 Foreign Key

Format:

```
<table>_id
```

Contoh:

```
user_id

product_id

customer_id

order_id
```

---

# 6. UUID Strategy

Menggunakan:

```
UUID v7
```

---

Alasan:

UUID v7 memiliki:

* Time ordered.
* Better indexing dibanding UUID random.
* Tetap unik secara global.

---

Contoh:

```
0190a123-xxxx-xxxx
```

---

# 7. Timestamp Standard

Semua tabel utama memiliki:

```sql
created_at TIMESTAMP WITH TIME ZONE

updated_at TIMESTAMP WITH TIME ZONE
```

---

Tujuan:

* Tracking perubahan.
* Audit.
* Reporting.

---

# 8. Soft Delete Standard

Tabel utama menggunakan:

```sql
deleted_at TIMESTAMP WITH TIME ZONE
```

---

Jika:

```
deleted_at IS NULL
```

Data aktif.

---

Jika:

```
deleted_at != NULL
```

Data dianggap terhapus.

---

# 9. Common Audit Columns

Semua tabel penting:

```
created_at

updated_at

deleted_at

created_by

updated_by

deleted_by
```

---

Contoh:

products:

```
id

name

price

created_at

updated_at

created_by

```

---

# 10. Monetary Data Type

Harga menggunakan:

```
NUMERIC(12,2)
```

---

Contoh:

```
15000.00
```

---

Alasan:

Menghindari floating point error.

Tidak menggunakan:

```
FLOAT
```

---

# 11. Quantity Data Type

Stock menggunakan:

```
INTEGER
```

---

Constraint:

```sql
CHECK(quantity >= 0)
```

---

# 12. Database Domain Overview

Database dibagi menjadi beberapa domain:

```
Authentication Domain

        |

Product Domain

        |

Customer Domain

        |

Order Domain

        |

Transaction Domain

        |

Inventory Domain

        |

Audit Domain
```

---

# 13. Entity Overview

Total entity utama:

| Domain         | Entity            |
| -------------- | ----------------- |
| Authentication | Users             |
|                | Roles             |
|                | Permissions       |
|                | Sessions          |
| Customer       | Customers         |
|                | Customer Sessions |
| Product        | Categories        |
|                | Products          |
|                | Suppliers         |
|                | Product Suppliers |
| Table          | Restaurant Tables |
|                | QR Tables         |
| Order          | Orders            |
|                | Order Items       |
| Transaction    | Transactions      |
|                | Transaction Items |
| Payment        | Payments          |
| Inventory      | Inventory         |
|                | Inventory History |
| System         | Audit Logs        |
|                | Settings          |

---

# 14. High Level ERD Relationship

Gambaran umum:

```
ROLES
  |
  |
USERS
  |
  |
AUDIT_LOGS


CUSTOMERS
  |
  |
CUSTOMER_SESSIONS
  |
  |
ORDERS
  |
  |
ORDER_ITEMS
  |
  |
PRODUCTS
  |
  |
CATEGORIES


ORDERS
  |
  |
TRANSACTIONS
  |
  |
PAYMENTS


PRODUCTS
  |
  |
INVENTORY
  |
  |
INVENTORY_HISTORY


SUPPLIERS
  |
  |
PRODUCT_SUPPLIERS


TABLES
  |
  |
CUSTOMER_SESSIONS
```

---

# 15. Relationship Cardinality Overview

## User - Role

```
Role

1

|

N

Users
```

Satu role dapat memiliki banyak user.

---

## Category - Product

```
Category

1

|

N

Products
```

Satu kategori memiliki banyak produk.

---

## Customer - Order

```
Customer

1

|

N

Orders
```

Satu customer dapat melakukan banyak order.

---

## Order - Order Item

```
Order

1

|

N

Order Items
```

Satu order memiliki banyak item.

---

## Product - Order Item

```
Product

1

|

N

Order Items
```

Produk dapat muncul pada banyak order.

---

## Transaction - Payment

```
Transaction

1

|

1

Payment
```

Versi awal:

Satu transaksi memiliki satu pembayaran.

Future:

Dapat menjadi:

```
Transaction

1

|

N

Payments
```

untuk partial payment/refund.

---

## Product - Inventory

```
Product

1

|

1

Inventory
```

Satu produk memiliki satu data stok.

---

## Inventory - History

```
Inventory

1

|

N

Inventory History
```

Satu stok memiliki banyak perubahan.

---

# 16. Database Normalization

Database menggunakan:

```
Third Normal Form (3NF)
```

---

Tujuan:

Menghindari:

* Data duplicate.
* Update anomaly.
* Delete anomaly.

---

Contoh buruk:

```
orders

customer_name

customer_phone

product_name

product_price

```

Masalah:

Customer dan product duplicated.

---

Desain benar:

```
customers

products

orders
```

Menggunakan foreign key.

---

# 17. Database Design Principle Summary

| Principle         | Implementation  |
| ----------------- | --------------- |
| Relational Design | PostgreSQL      |
| Normalization     | 3NF             |
| Primary Key       | UUID v7         |
| Naming            | snake_case      |
| Money             | NUMERIC         |
| Audit             | Audit Logs      |
| Deletion          | Soft Delete     |
| Integrity         | Constraint      |
| Security          | FK + Validation |

---


# 18. Authentication Domain Overview

Authentication domain bertanggung jawab untuk mengelola:

* Identitas pengguna internal sistem.
* Hak akses pengguna.
* Session management.
* Permission control.
* Aktivitas pengguna.

Domain ini digunakan oleh:

* Administrator.
* Cashier.

Customer **tidak menggunakan domain authentication ini**, karena customer menggunakan mekanisme **Guest Authentication** yang akan dibahas pada Customer Domain.

---

# 19. Authentication Domain ERD

High-level relationship:

```id="2j4k0m"
                roles

                  |

                  |

                  N

                users

                  |

                  |

                  N

             audit_logs


users

  |

  |

customer_sessions (separate domain)

```

---

# 20. Roles Table

## 20.1 Purpose

Tabel `roles` menyimpan jenis role pengguna dalam sistem.

Contoh:

* Administrator.
* Cashier.

---

## 20.2 Table Structure

```sql
roles
```

| Column      | Data Type   | Constraint      | Description      |
| ----------- | ----------- | --------------- | ---------------- |
| id          | UUID        | PK              | Role identifier  |
| name        | VARCHAR(50) | UNIQUE NOT NULL | Role name        |
| description | TEXT        | NULL            | Role description |
| created_at  | TIMESTAMP   | NOT NULL        | Creation time    |
| updated_at  | TIMESTAMP   | NOT NULL        | Update time      |
| deleted_at  | TIMESTAMP   | NULL            | Soft delete      |

---

# 20.3 Example Data

| id     | name    | description            |
| ------ | ------- | ---------------------- |
| uuid-1 | admin   | Full system access     |
| uuid-2 | cashier | Transaction management |

---

# 20.4 Constraint

Role name harus unik.

```sql
UNIQUE(name)
```

---

Contoh:

Tidak diperbolehkan:

```
admin
admin
```

---

# 21. Users Table

## 21.1 Purpose

Tabel `users` menyimpan akun pengguna internal.

Digunakan untuk:

* Login.
* Authorization.
* Audit tracking.

---

## 21.2 Table Structure

```sql
users
```

| Column        | Data Type    | Constraint      | Description     |
| ------------- | ------------ | --------------- | --------------- |
| id            | UUID         | PK              | User identifier |
| role_id       | UUID         | FK NOT NULL     | User role       |
| username      | VARCHAR(100) | UNIQUE NOT NULL | Login username  |
| email         | VARCHAR(255) | UNIQUE NULL     | Email address   |
| password_hash | TEXT         | NOT NULL        | bcrypt hash     |
| full_name     | VARCHAR(150) | NOT NULL        | User name       |
| phone_number  | VARCHAR(20)  | NULL            | Contact         |
| is_active     | BOOLEAN      | DEFAULT TRUE    | Account status  |
| last_login_at | TIMESTAMP    | NULL            | Last login      |
| created_at    | TIMESTAMP    | NOT NULL        | Creation time   |
| updated_at    | TIMESTAMP    | NOT NULL        | Update time     |
| deleted_at    | TIMESTAMP    | NULL            | Soft delete     |

---

# 21.3 Relationship

```text
roles

1

|

N

users
```

Satu role dapat dimiliki banyak user.

---

# 21.4 Example

Database:

```
users

id:
001

role:
admin

username:
admin01

password_hash:
$2b$12....

```

---

# 21.5 Password Storage

Kolom:

```sql
password_hash TEXT
```

Menyimpan:

```
bcrypt hash
```

Bukan:

```
password asli
```

---

Contoh:

Input:

```
restaurant123
```

Database:

```
$2b$12$8kdh....
```

---

# 21.6 User Status

Menggunakan:

```sql
is_active BOOLEAN
```

---

Contoh:

Aktif:

```
true
```

User dapat login.

---

Nonaktif:

```
false
```

User ditolak login.

---

# 22. Permissions Table

## 22.1 Purpose

Menyimpan daftar izin yang tersedia.

Versi awal project menggunakan RBAC sederhana.

Namun tabel ini disiapkan untuk pengembangan permission-based access.

---

## 22.2 Table Structure

```sql
permissions
```

| Column      | Type         | Constraint      | Description     |
| ----------- | ------------ | --------------- | --------------- |
| id          | UUID         | PK              | Permission ID   |
| name        | VARCHAR(100) | UNIQUE NOT NULL | Permission name |
| description | TEXT         | NULL            | Description     |
| created_at  | TIMESTAMP    | NOT NULL        | Created time    |

---

# 22.3 Example Data

| name               |
| ------------------ |
| user.create        |
| user.delete        |
| product.create     |
| product.delete     |
| transaction.create |
| payment.process    |

---

# 23. Role Permissions Table

## 23.1 Purpose

Menghubungkan role dengan permission.

Relationship:

Many-to-many.

---

ERD:

```text
roles

N

|

N

permissions
```

---

Dibuat tabel penghubung:

```sql
role_permissions
```

---

# 23.2 Table Structure

| Column        | Type      | Constraint |
| ------------- | --------- | ---------- |
| id            | UUID      | PK         |
| role_id       | UUID      | FK         |
| permission_id | UUID      | FK         |
| created_at    | TIMESTAMP |            |

---

# 23.3 Example

Admin:

```
admin

    |
    |
    + product.create
    + product.delete
    + user.manage
```

---

Cashier:

```
cashier

    |
    |
    + transaction.create
    + payment.process
```

---

# 24. Sessions Table

## 24.1 Purpose

Menyimpan session authentication.

Walaupun Express Session dapat menggunakan storage internal, database session disiapkan agar:

* Session persistence.
* Monitoring.
* Multi instance support.

---

## 24.2 Table Structure

```sql
sessions
```

| Column        | Type      | Constraint      | Description         |
| ------------- | --------- | --------------- | ------------------- |
| id            | UUID      | PK              | Session ID          |
| user_id       | UUID      | FK NOT NULL     | Owner user          |
| session_token | TEXT      | UNIQUE NOT NULL | Session identifier  |
| ip_address    | INET      | NULL            | Client IP           |
| user_agent    | TEXT      | NULL            | Browser information |
| expires_at    | TIMESTAMP | NOT NULL        | Expiration          |
| created_at    | TIMESTAMP | NOT NULL        | Created time        |

---

# 24.3 Session Relationship

```text
users

1

|

N

sessions
```

---

Satu user dapat memiliki beberapa session.

Contoh:

```
Admin login laptop

+

Admin login komputer kasir

```

---

# 24.4 Session Lifecycle

```text
LOGIN

 |

CREATE SESSION

 |

ACTIVE

 |

EXPIRE / LOGOUT

 |

DELETE SESSION

```

---

# 25. Audit Logs Table

## 25.1 Purpose

Mencatat aktivitas penting sistem.

Digunakan untuk:

* Security monitoring.
* Debugging.
* Tracking perubahan data.

---

# 25.2 Table Structure

```sql
audit_logs
```

| Column      | Type         | Constraint | Description     |
| ----------- | ------------ | ---------- | --------------- |
| id          | UUID         | PK         | Audit ID        |
| user_id     | UUID         | FK NULL    | Actor           |
| action      | VARCHAR(100) | NOT NULL   | Action type     |
| entity_name | VARCHAR(100) | NOT NULL   | Affected table  |
| entity_id   | UUID         | NULL       | Affected record |
| old_value   | JSONB        | NULL       | Previous data   |
| new_value   | JSONB        | NULL       | New data        |
| ip_address  | INET         | NULL       | Request IP      |
| created_at  | TIMESTAMP    | NOT NULL   | Time            |

---

# 25.3 Example Audit Record

Admin mengubah harga produk.

Before:

```json
{
"price":15000
}
```

After:

```json
{
"price":18000
}
```

Audit:

```json
{
"action":"UPDATE_PRODUCT",
"entity":"products"
}
```

---

# 25.4 Audit Relationship

```text
users

1

|

N

audit_logs
```

---

# 26. Authentication Domain Complete ERD

```text

                 roles

                   |

                   |

                   N

                 users

                   |

        -----------------------

        |                     |

        |                     |

    sessions             audit_logs


roles

  |

  |

role_permissions

  |

  |

permissions

```

---

# 27. Authentication Domain Rules

## Rule 1

User harus memiliki role.

Database:

```sql
role_id NOT NULL
```

---

## Rule 2

Username harus unik.

```sql
UNIQUE(username)
```

---

## Rule 3

Password selalu berupa hash.

Tidak boleh:

```
password VARCHAR
```

---

## Rule 4

User tidak langsung dihapus.

Menggunakan:

```
deleted_at
```

---

## Rule 5

Semua aktivitas penting dicatat.

Contoh:

* Login.
* Logout.
* Delete data.
* Update harga.
* Stock adjustment.

---

# 28. Index Strategy Authentication Domain

## Users

Index:

```sql
CREATE INDEX idx_users_username
ON users(username);
```

Untuk login.

---

Index:

```sql
CREATE INDEX idx_users_role
ON users(role_id);
```

Untuk authorization.

---

## Sessions

Index:

```sql
CREATE INDEX idx_sessions_token
ON sessions(session_token);
```

Untuk lookup session.

---

## Audit Logs

Index:

```sql
CREATE INDEX idx_audit_user
ON audit_logs(user_id);
```

Untuk pencarian aktivitas user.

---

# 29. Authentication Domain Summary

Entity yang selesai:

✅ roles
✅ users
✅ permissions
✅ role_permissions
✅ sessions
✅ audit_logs

Relationship:

```
Role
 |
 |
Users
 |
 |
Sessions

Users
 |
 |
Audit Logs

Role
 |
 |
Permissions
```

---

# 30. Product Domain Overview

Product Domain bertanggung jawab untuk mengelola seluruh data produk yang dijual oleh restoran.

Domain ini menjadi pusat referensi untuk:

* Menu makanan/minuman.
* Kategori produk.
* Harga.
* Barcode.
* Supplier.
* Inventory.

---

Relationship utama:

```text
categories

      |

      |

      N

products

      |

      |

      N

product_suppliers

      |

      |

      N

suppliers

```

---

# 31. Product Domain Entity

Entity dalam domain ini:

| Entity            | Purpose                       |
| ----------------- | ----------------------------- |
| categories        | Mengelompokkan produk         |
| products          | Data menu restoran            |
| suppliers         | Data pemasok barang           |
| product_suppliers | Relasi produk dengan supplier |

---

# 32. Categories Table

## 32.1 Purpose

Tabel `categories` menyimpan kategori produk.

Contoh:

* Makanan.
* Minuman.
* Dessert.
* Snack.
* Paket.

---

# 32.2 Table Structure

```sql
categories
```

| Column      | Data Type    | Constraint      | Description          |
| ----------- | ------------ | --------------- | -------------------- |
| id          | UUID         | PK              | Category identifier  |
| name        | VARCHAR(100) | UNIQUE NOT NULL | Category name        |
| description | TEXT         | NULL            | Category description |
| is_active   | BOOLEAN      | DEFAULT TRUE    | Category status      |
| created_at  | TIMESTAMP    | NOT NULL        | Created time         |
| updated_at  | TIMESTAMP    | NOT NULL        | Updated time         |
| deleted_at  | TIMESTAMP    | NULL            | Soft delete          |
| created_by  | UUID         | FK NULL         | Creator              |
| updated_by  | UUID         | FK NULL         | Updater              |
| deleted_by  | UUID         | FK NULL         | Deleter              |

---

# 32.3 Example Data

| name    | description    |
| ------- | -------------- |
| Food    | Main dishes    |
| Drink   | Beverages      |
| Dessert | Sweet products |

---

# 32.4 Category Relationship

```text
categories

1

|

N

products
```

---

Satu kategori dapat memiliki banyak produk.

Contoh:

```text
Food

 |
 +-- Fried Rice
 +-- Burger
 +-- Chicken
```

---

# 33. Products Table

## 33.1 Purpose

Tabel `products` merupakan tabel utama menu restoran.

Menyimpan:

* Nama produk.
* Harga.
* Barcode.
* Kategori.
* Status penjualan.

---

# 33.2 Table Structure

```sql
products
```

| Column       | Data Type     | Constraint      | Description         |
| ------------ | ------------- | --------------- | ------------------- |
| id           | UUID          | PK              | Product identifier  |
| category_id  | UUID          | FK NOT NULL     | Product category    |
| name         | VARCHAR(150)  | NOT NULL        | Product name        |
| description  | TEXT          | NULL            | Product description |
| barcode      | VARCHAR(100)  | UNIQUE NOT NULL | Product barcode     |
| sku          | VARCHAR(100)  | UNIQUE NULL     | Stock keeping unit  |
| price        | NUMERIC(12,2) | CHECK >= 0      | Selling price       |
| cost_price   | NUMERIC(12,2) | CHECK >= 0      | Purchase cost       |
| is_available | BOOLEAN       | DEFAULT TRUE    | Availability        |
| image_url    | TEXT          | NULL            | Product image       |
| created_at   | TIMESTAMP     | NOT NULL        | Created time        |
| updated_at   | TIMESTAMP     | NOT NULL        | Updated time        |
| deleted_at   | TIMESTAMP     | NULL            | Soft delete         |
| created_by   | UUID          | FK NULL         | Creator             |
| updated_by   | UUID          | FK NULL         | Updater             |
| deleted_by   | UUID          | FK NULL         | Deleter             |

---

# 33.3 Product Relationship

```text
categories

1

|

N

products
```

---

# 33.4 Barcode Design

Barcode wajib:

```sql
UNIQUE(barcode)
```

---

Contoh:

```
8991234567890
```

---

Alasan:

* Scanner dapat langsung mencari satu produk.
* Tidak terjadi duplikasi barcode.

---

# 33.5 SKU Design

SKU bersifat opsional.

Contoh:

```
FD-BRG-001
```

---

Perbedaan:

| Barcode           | SKU                       |
| ----------------- | ------------------------- |
| Untuk scanner     | Untuk internal management |
| Dari manufacturer | Dibuat restaurant         |

---

# 33.6 Product Price Design

Harga menggunakan:

```sql
NUMERIC(12,2)
```

Contoh:

```
15000.00
```

---

Tidak menggunakan:

```sql
FLOAT
```

Karena dapat menyebabkan:

```
15000.00000001
```

akibat floating point error.

---

# 33.7 Product Status

Produk tidak langsung dihapus ketika tidak dijual.

Menggunakan:

```sql
is_available
```

---

Contoh:

Produk seasonal:

```
is_available = false
```

Tetapi history transaksi tetap aman.

---

# 34. Suppliers Table

## 34.1 Purpose

Menyimpan informasi supplier.

Supplier digunakan untuk:

* Pengadaan bahan.
* Restock inventory.
* Supplier tracking.

---

# 34.2 Table Structure

```sql
suppliers
```

| Column       | Data Type    | Constraint   | Description         |
| ------------ | ------------ | ------------ | ------------------- |
| id           | UUID         | PK           | Supplier identifier |
| name         | VARCHAR(150) | NOT NULL     | Supplier name       |
| phone_number | VARCHAR(20)  | NULL         | Contact             |
| email        | VARCHAR(255) | NULL         | Email               |
| address      | TEXT         | NULL         | Address             |
| is_active    | BOOLEAN      | DEFAULT TRUE | Supplier status     |
| created_at   | TIMESTAMP    | NOT NULL     | Created time        |
| updated_at   | TIMESTAMP    | NOT NULL     | Updated time        |
| deleted_at   | TIMESTAMP    | NULL         | Soft delete         |
| created_by   | UUID         | FK NULL      | Creator             |
| updated_by   | UUID         | FK NULL      | Updater             |
| deleted_by   | UUID         | FK NULL      | Deleter             |

---

# 34.3 Example Data

| Name              | Phone       |
| ----------------- | ----------- |
| PT Supplier Food  | 08123456789 |
| Fresh Beverage Co | 08987654321 |

---

# 35. Product Suppliers Table

## 35.1 Purpose

Relasi antara produk dan supplier.

Menggunakan:

```text
Many-to-Many Relationship
```

---

Alasan:

Satu produk dapat memiliki banyak supplier.

Contoh:

```
Ayam

 |
 + Supplier A
 + Supplier B
```

---

Supplier juga dapat menyediakan banyak produk.

---

# 35.2 Table Structure

```sql
product_suppliers
```

| Column                | Data Type     | Constraint  | Description   |
| --------------------- | ------------- | ----------- | ------------- |
| id                    | UUID          | PK          | Identifier    |
| product_id            | UUID          | FK NOT NULL | Product       |
| supplier_id           | UUID          | FK NOT NULL | Supplier      |
| supplier_product_code | VARCHAR(100)  | NULL        | Supplier code |
| purchase_price        | NUMERIC(12,2) | CHECK >=0   | Buying price  |
| created_at            | TIMESTAMP     | NOT NULL    | Created time  |
| updated_at            | TIMESTAMP     | NOT NULL    | Updated time  |

---

# 35.3 Relationship

```text
products

N

|

N

suppliers
```

Dengan bridge table:

```
product_suppliers
```

---

# 35.4 Example

Product:

```
Mineral Water
```

Supplier:

```
Supplier A
Supplier B
```

Database:

```
product_suppliers

Mineral Water | Supplier A
Mineral Water | Supplier B

```

---

# 36. Product Domain Business Rules

---

## Rule 1 — Product Must Have Category

Tidak boleh:

```
Product
    |
    NULL category
```

Constraint:

```sql
category_id NOT NULL
```

---

## Rule 2 — Barcode Unique

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

Constraint:

```sql
UNIQUE(barcode)
```

---

## Rule 3 — Price Cannot Be Negative

Constraint:

```sql
CHECK(price >= 0)
```

---

## Rule 4 — Deleted Product Cannot Affect History

Jika produk tidak dijual:

```
deleted_at != NULL
```

Tetapi:

Transaction lama tetap memiliki referensi.

---

# 37. Product Domain Index Strategy

## Categories

Index:

```sql
CREATE INDEX idx_categories_name
ON categories(name);
```

Digunakan untuk:

* Category search.

---

## Products

Index barcode:

```sql
CREATE INDEX idx_products_barcode
ON products(barcode);
```

Digunakan oleh:

* Barcode scanner.
* Checkout.

---

Index category:

```sql
CREATE INDEX idx_products_category
ON products(category_id);
```

Digunakan untuk:

* Filter menu.

---

Index name:

```sql
CREATE INDEX idx_products_name
ON products(name);
```

Digunakan untuk:

* Search product.

---

## Suppliers

Index:

```sql
CREATE INDEX idx_suppliers_name
ON suppliers(name);
```

---

# 38. Product Domain ERD

```text
                 categories

                      |

                      |

                      N

                 products

                      |

          ----------------------

          |                    |

          |                    |

product_suppliers          inventory

          |

          |

      suppliers

```

---

# 39. Product Domain Summary

Entity selesai:

✅ categories
✅ products
✅ suppliers
✅ product_suppliers

Relationship:

```text
Category

1 ─── N

Product


Product

N ─── N

Supplier

```

---

Keputusan desain penting:

* Barcode dibuat unique untuk scanner.
* Product menggunakan soft delete.
* Supplier menggunakan many-to-many.
* Harga menggunakan NUMERIC.
* Product dipisahkan dari inventory.

---

# 40. Customer & Order Domain Overview

Customer dan Order Domain merupakan bagian inti dari workflow restoran.

Domain ini mengatur:

* Identitas customer.
* Guest authentication.
* Meja restoran.
* QR Table.
* Sesi customer.
* Pemesanan makanan.
* Detail item pesanan.

---

High-level relationship:

```text
customers

    |

    |

    N

customer_sessions

    |

    |

    N

orders

    |

    |

    N

order_items

    |

    |

    N

products


restaurant_tables

    |

    |

customer_sessions

```

---

# 41. Customers Table

## 41.1 Purpose

Tabel `customers` menyimpan data pelanggan.

Customer berbeda dengan User.

Perbedaan:

| Users                | Customers        |
| -------------------- | ---------------- |
| Internal system user | Restaurant guest |
| Login password       | No password      |
| Admin/Cashier        | Customer         |
| RBAC                 | Guest session    |

---

# 41.2 Customer Identity

Customer menggunakan:

```id="c0u1kj"
Phone Number
```

sebagai identitas utama.

---

Flow:

Input:

```id="f9pjz8"
08123456789
```

Normalize:

```id="y4lk2d"
628123456789
```

Database lookup:

```sql id="e8hkxv"
SELECT *
FROM customers
WHERE phone_number='628123456789';
```

---

# 41.3 Table Structure

```sql id="o7g8hw"
customers
```

| Column        | Data Type    | Constraint      | Description         |
| ------------- | ------------ | --------------- | ------------------- |
| id            | UUID         | PK              | Customer identifier |
| name          | VARCHAR(150) | NOT NULL        | Customer name       |
| phone_number  | VARCHAR(20)  | UNIQUE NOT NULL | Normalized phone    |
| email         | VARCHAR(255) | NULL            | Email               |
| total_visit   | INTEGER      | DEFAULT 0       | Visit count         |
| last_visit_at | TIMESTAMP    | NULL            | Last visit          |
| created_at    | TIMESTAMP    | NOT NULL        | Created time        |
| updated_at    | TIMESTAMP    | NOT NULL        | Updated time        |
| deleted_at    | TIMESTAMP    | NULL            | Soft delete         |
| created_by    | UUID         | FK NULL         | Creator             |
| updated_by    | UUID         | FK NULL         | Updater             |

---

# 41.4 Customer Rules

## Rule 1 — Phone Unique

Tidak boleh:

```text
Customer A

Phone:
628123456789


Customer B

Phone:
628123456789

```

Constraint:

```sql
UNIQUE(phone_number)
```

---

## Rule 2 — Existing Customer Reuse

Contoh:

Database:

```
Name:
Afhwan Rez

Phone:
628123456789
```

Input customer:

```
Name:
afhwan

Phone:
08123456789
```

Backend:

```
Normalize Phone

↓

Find Existing Customer

↓

Use Existing Customer

```

Tidak membuat data baru.

---

# 42. Restaurant Tables Table

## 42.1 Purpose

Menyimpan data meja restoran.

Digunakan untuk:

* QR ordering.
* Table tracking.
* Reservation future.

---

# 42.2 Table Structure

```sql
restaurant_tables
```

| Column       | Data Type    | Constraint      | Description      |
| ------------ | ------------ | --------------- | ---------------- |
| id           | UUID         | PK              | Table identifier |
| table_number | VARCHAR(20)  | UNIQUE NOT NULL | Table label      |
| capacity     | INTEGER      | CHECK >0        | Maximum guest    |
| status       | VARCHAR(30)  | NOT NULL        | Current status   |
| location     | VARCHAR(100) | NULL            | Area location    |
| created_at   | TIMESTAMP    | NOT NULL        | Created time     |
| updated_at   | TIMESTAMP    | NOT NULL        | Updated time     |
| deleted_at   | TIMESTAMP    | NULL            | Soft delete      |

---

# 42.3 Example

| table_number | capacity | status    |
| ------------ | -------- | --------- |
| T01          | 4        | AVAILABLE |
| T02          | 6        | OCCUPIED  |

---

# 42.4 Table Status

Allowed:

```text
AVAILABLE

OCCUPIED

RESERVED

CLEANING

MAINTENANCE

```

---

# 42.5 Table State Flow

```text
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

# 43. QR Tables Table

## 43.1 Purpose

Menyimpan informasi QR Code untuk setiap meja.

QR digunakan untuk:

* Identifikasi meja.
* Membuka customer ordering page.

---

QR bukan:

* Payment QR.
* Customer permanent account.

---

# 43.2 Table Structure

```sql
qr_tables
```

| Column     | Data Type    | Constraint      | Description      |
| ---------- | ------------ | --------------- | ---------------- |
| id         | UUID         | PK              | QR identifier    |
| table_id   | UUID         | FK UNIQUE       | Restaurant table |
| qr_token   | VARCHAR(255) | UNIQUE NOT NULL | QR identifier    |
| is_active  | BOOLEAN      | DEFAULT TRUE    | QR status        |
| created_at | TIMESTAMP    | NOT NULL        | Created time     |
| updated_at | TIMESTAMP    | NOT NULL        | Updated time     |

---

# 43.3 Relationship

```text
restaurant_tables

1

|

1

qr_tables
```

---

Satu meja memiliki satu QR aktif.

---

# 43.4 QR Flow

QR berisi:

```
restaurant.local/table/{qr_token}
```

---

Ketika scan:

```
QR

↓

Find qr_token

↓

Find table

↓

Create customer session

```

---

# 44. Customer Sessions Table

## 44.1 Purpose

Menyimpan sesi customer saat berada di restoran.

Berbeda dengan:

```
users.sessions
```

karena customer tidak login menggunakan akun.

---

# 44.2 Table Structure

```sql
customer_sessions
```

| Column        | Data Type    | Constraint  | Description        |
| ------------- | ------------ | ----------- | ------------------ |
| id            | UUID         | PK          | Session identifier |
| customer_id   | UUID         | FK NOT NULL | Customer           |
| table_id      | UUID         | FK NOT NULL | Occupied table     |
| session_token | VARCHAR(255) | UNIQUE      | Guest token        |
| started_at    | TIMESTAMP    | NOT NULL    | Session start      |
| ended_at      | TIMESTAMP    | NULL        | Session end        |
| status        | VARCHAR(30)  | NOT NULL    | Session status     |

---

# 44.3 Relationship

```text
customers

1

|

N

customer_sessions


restaurant_tables

1

|

N

customer_sessions

```

---

# 44.4 Session Lifecycle

```text
SCAN QR

↓

LOGIN GUEST

↓

CREATE SESSION

↓

ORDER

↓

PAYMENT

↓

END SESSION

```

---

# 45. Orders Table

## 45.1 Purpose

Menyimpan data pemesanan customer.

Order dibuat sebelum transaction.

---

Relationship:

```text
orders

1

|

N

order_items
```

---

# 45.2 Table Structure

```sql
orders
```

| Column       | Data Type   | Constraint      | Description             |
| ------------ | ----------- | --------------- | ----------------------- |
| id           | UUID        | PK              | Order identifier        |
| customer_id  | UUID        | FK NOT NULL     | Customer                |
| session_id   | UUID        | FK NULL         | Customer session        |
| table_id     | UUID        | FK NULL         | Table                   |
| order_number | VARCHAR(50) | UNIQUE NOT NULL | Human readable order ID |
| status       | VARCHAR(30) | NOT NULL        | Order status            |
| notes        | TEXT        | NULL            | Special request         |
| ordered_at   | TIMESTAMP   | NOT NULL        | Order time              |
| completed_at | TIMESTAMP   | NULL            | Completion time         |
| created_at   | TIMESTAMP   | NOT NULL        | Created time            |
| updated_at   | TIMESTAMP   | NOT NULL        | Updated time            |

---

# 45.3 Order Status

Allowed:

```text
PENDING

PROCESSING

READY

COMPLETED

CANCELLED

```

---

# 45.4 Order State Transition

Valid:

```text
PENDING

↓

PROCESSING

↓

READY

↓

COMPLETED


PENDING

↓

CANCELLED

```

---

Tidak valid:

```text
PENDING

↓

COMPLETED

```

---

# 46. Order Items Table

## 46.1 Purpose

Menyimpan detail produk dalam sebuah order.

---

# 46.2 Table Structure

```sql
order_items
```

| Column     | Data Type     | Constraint  | Description       |
| ---------- | ------------- | ----------- | ----------------- |
| id         | UUID          | PK          | Item identifier   |
| order_id   | UUID          | FK NOT NULL | Order reference   |
| product_id | UUID          | FK NOT NULL | Product reference |
| quantity   | INTEGER       | CHECK >0    | Amount            |
| unit_price | NUMERIC(12,2) | NOT NULL    | Price snapshot    |
| subtotal   | NUMERIC(12,2) | NOT NULL    | Calculated price  |
| notes      | TEXT          | NULL        | Item notes        |
| created_at | TIMESTAMP     | NOT NULL    | Created time      |

---

# 46.3 Price Snapshot Principle

Ketika order dibuat:

Product:

```
Price:
15000
```

Order Item:

```
unit_price:
15000
```

---

Jika besok harga berubah:

Product:

```
18000
```

Order lama tetap:

```
15000
```

---

Alasan:

History transaksi harus immutable.

---

# 47. Order Domain Flow

Full flow:

```text
Customer

↓

QR Table

↓

Customer Session

↓

Create Order

↓

Add Order Items

↓

Kitchen Processing

↓

Ready

↓

Transaction

```

---

# 48. Customer & Order Domain ERD

```text

customers

    |

    |

customer_sessions

    |

    |

orders

    |

    |

order_items

    |

    |

products



restaurant_tables

    |

    |

qr_tables


restaurant_tables

    |

    |

customer_sessions

```

---

# 49. Customer & Order Domain Index Strategy

## Customers

```sql
CREATE INDEX idx_customers_phone
ON customers(phone_number);
```

Digunakan untuk:

* Guest login lookup.

---

## Orders

```sql
CREATE INDEX idx_orders_customer
ON orders(customer_id);
```

---

```sql
CREATE INDEX idx_orders_status
ON orders(status);
```

Untuk:

* Kitchen dashboard.
* Cashier dashboard.

---

## Order Items

```sql
CREATE INDEX idx_order_items_order
ON order_items(order_id);
```

---

# 50. Customer & Order Domain Summary

Entity selesai:

✅ customers
✅ restaurant_tables
✅ qr_tables
✅ customer_sessions
✅ orders
✅ order_items

Relationship:

```text
Customer

1 ─── N

Orders


Order

1 ─── N

Order Items


Product

1 ─── N

Order Items


Table

1 ─── N

Customer Sessions

```

---

Keputusan desain penting:

* Customer menggunakan phone identity.
* QR hanya identifikasi meja.
* Session customer terpisah dari user authentication.
* Order dipisahkan dari transaction.
* Order item menyimpan price snapshot.

---


# 51. Transaction Domain Overview

Transaction Domain bertanggung jawab untuk mencatat transaksi final setelah order diproses.

Perbedaan:

| Order                | Transaction                     |
| -------------------- | ------------------------------- |
| Permintaan pembelian | Bukti transaksi                 |
| Kitchen workflow     | Financial record                |
| Dapat berubah status | Harus immutable setelah selesai |
| Sebelum pembayaran   | Setelah pembayaran              |

---

Flow:

```text
Customer Order

        |

        |

Processing

        |

        |

Transaction Created

        |

        |

Payment

        |

        |

Completed

```

---

# 52. Transactions Table

## 52.1 Purpose

Menyimpan informasi transaksi utama.

---

## 52.2 Table Structure

```sql
transactions
```

| Column             | Data Type     | Constraint         | Description            |
| ------------------ | ------------- | ------------------ | ---------------------- |
| id                 | UUID          | PK                 | Transaction identifier |
| order_id           | UUID          | FK UNIQUE NOT NULL | Related order          |
| transaction_number | VARCHAR(50)   | UNIQUE NOT NULL    | Receipt number         |
| customer_id        | UUID          | FK NOT NULL        | Customer reference     |
| subtotal           | NUMERIC(12,2) | CHECK >=0          | Before discount        |
| tax_amount         | NUMERIC(12,2) | CHECK >=0          | Tax                    |
| discount_amount    | NUMERIC(12,2) | CHECK >=0          | Discount               |
| total_amount       | NUMERIC(12,2) | CHECK >=0          | Final amount           |
| status             | VARCHAR(30)   | NOT NULL           | Transaction status     |
| transaction_date   | TIMESTAMP     | NOT NULL           | Transaction time       |
| created_at         | TIMESTAMP     | NOT NULL           | Created time           |
| updated_at         | TIMESTAMP     | NOT NULL           | Updated time           |

---

# 52.3 Relationship

```text
orders

1

|

1

transactions

```

---

Satu order menghasilkan satu transaksi.

---

# 52.4 Transaction Status

Allowed:

```text
PENDING

PAID

FAILED

CANCELLED

REFUNDED

```

---

# 52.5 Transaction State Flow

Normal:

```text
PENDING

   |

   |

PAID

```

Failed payment:

```text
PENDING

   |

   |

FAILED

```

Refund:

```text
PAID

   |

   |

REFUNDED

```

---

# 53. Transaction Items Table

## 53.1 Purpose

Menyimpan detail item transaksi.

Walaupun sudah ada `order_items`, transaction tetap memiliki snapshot sendiri.

---

Alasan:

Jika product berubah:

* Nama.
* Harga.
* Kategori.

History transaksi tetap aman.

---

# 53.2 Table Structure

```sql
transaction_items
```

| Column         | Data Type     | Constraint  | Description    |
| -------------- | ------------- | ----------- | -------------- |
| id             | UUID          | PK          | Identifier     |
| transaction_id | UUID          | FK NOT NULL | Transaction    |
| product_id     | UUID          | FK NOT NULL | Product        |
| product_name   | VARCHAR(150)  | NOT NULL    | Snapshot name  |
| quantity       | INTEGER       | CHECK >0    | Quantity       |
| unit_price     | NUMERIC(12,2) | NOT NULL    | Snapshot price |
| subtotal       | NUMERIC(12,2) | NOT NULL    | Subtotal       |
| created_at     | TIMESTAMP     | NOT NULL    | Created time   |

---

# 53.3 Why Store Product Name?

Contoh:

Saat transaksi:

```text
Burger Special
Rp25.000
```

Kemudian admin mengganti nama:

```text
Burger Premium
Rp30.000
```

Receipt lama tetap:

```text
Burger Special
Rp25.000

```

---

# 54. Payment Domain Overview

Payment Domain mengelola proses pembayaran.

Supported:

* Cash.
* QRIS Dummy.
* Debit Dummy.
* Transfer Dummy.

---

Relationship:

```text
transactions

        |

        |

payments

```

---

# 55. Payments Table

## 55.1 Purpose

Menyimpan informasi pembayaran.

---

# 55.2 Table Structure

```sql
payments
```

| Column           | Data Type     | Constraint  | Description        |
| ---------------- | ------------- | ----------- | ------------------ |
| id               | UUID          | PK          | Payment identifier |
| transaction_id   | UUID          | FK NOT NULL | Transaction        |
| method           | VARCHAR(30)   | NOT NULL    | Payment method     |
| amount           | NUMERIC(12,2) | CHECK >=0   | Paid amount        |
| status           | VARCHAR(30)   | NOT NULL    | Payment status     |
| reference_number | VARCHAR(100)  | NULL        | External reference |
| paid_at          | TIMESTAMP     | NULL        | Payment time       |
| created_at       | TIMESTAMP     | NOT NULL    | Created time       |
| updated_at       | TIMESTAMP     | NOT NULL    | Updated time       |

---

# 55.3 Payment Method

Allowed:

```text
CASH

QRIS

DEBIT

TRANSFER

```

---

# 55.4 Payment Status

Allowed:

```text
WAITING

SUCCESS

FAILED

CANCELLED

```

---

# 55.5 Payment Flow

Contoh QRIS:

```text
Transaction Created

        |

        |

Payment Waiting

        |

        |

QR Dummy Display

        |

        |

Continue Payment

        |

        |

Payment Success

```

---

# 56. Inventory Domain Overview

Inventory Domain mengelola stok produk.

Tujuan:

* Mengetahui jumlah stok.
* Tracking perubahan stok.
* Mencegah stok negatif.

---

Relationship:

```text
products

    |

    |

inventory

    |

    |

inventory_history

```

---

# 57. Inventory Table

## 57.1 Purpose

Menyimpan jumlah stok saat ini.

---

# 57.2 Table Structure

```sql
inventory
```

| Column        | Data Type | Constraint         | Description          |
| ------------- | --------- | ------------------ | -------------------- |
| id            | UUID      | PK                 | Inventory identifier |
| product_id    | UUID      | FK UNIQUE NOT NULL | Product              |
| current_stock | INTEGER   | CHECK >=0          | Current quantity     |
| min_stock     | INTEGER   | CHECK >=0          | Low stock limit      |
| updated_at    | TIMESTAMP | NOT NULL           | Last update          |

---

# 57.3 Relationship

```text
products

1

|

1

inventory

```

---

# 57.4 Example

Product:

```text
Chicken Rice
```

Inventory:

```text
current_stock:
50

min_stock:
10
```

---

# 58. Inventory History Table

## 58.1 Purpose

Mencatat semua perubahan stok.

---

Tidak boleh hanya:

```text
Stock sekarang = 50

```

karena tidak diketahui:

* Dari mana stok masuk.
* Kapan berubah.
* Siapa yang mengubah.

---

# 58.2 Table Structure

```sql
inventory_history
```

| Column          | Data Type   | Constraint  | Description    |
| --------------- | ----------- | ----------- | -------------- |
| id              | UUID        | PK          | History ID     |
| inventory_id    | UUID        | FK NOT NULL | Inventory      |
| product_id      | UUID        | FK NOT NULL | Product        |
| change_type     | VARCHAR(30) | NOT NULL    | Type           |
| quantity_change | INTEGER     | NOT NULL    | Amount changed |
| previous_stock  | INTEGER     | NOT NULL    | Before         |
| new_stock       | INTEGER     | NOT NULL    | After          |
| reference_type  | VARCHAR(50) | NULL        | Source         |
| reference_id    | UUID        | NULL        | Related data   |
| created_by      | UUID        | FK NULL     | Actor          |
| created_at      | TIMESTAMP   | NOT NULL    | Time           |

---

# 58.3 Change Type

Allowed:

```text
STOCK_IN

SALE

ADJUSTMENT

RETURN

DAMAGED

```

---

# 58.4 Example Stock Flow

Initial:

```text
100
```

Purchase:

```text
+50
```

History:

```text
previous_stock:
100

change:
+50

new_stock:
150

```

---

Sale:

```text
-2
```

History:

```text
previous:
150

change:
-2

new:
148

```

---

# 59. Inventory Business Rules

## Rule 1

Stock tidak boleh negatif.

Constraint:

```sql
CHECK(current_stock >= 0)
```

---

## Rule 2

Semua perubahan stok wajib memiliki history.

Tidak boleh:

```text
Inventory

50

langsung menjadi

40

```

Tanpa:

```text
inventory_history

-10

```

---

## Rule 3

Stock adjustment wajib memiliki alasan.

Contoh:

```text
Damaged product

Expired

Correction

```

---

# 60. Database Constraint Strategy

---

# 60.1 Primary Key

Semua tabel:

```sql
id UUID PRIMARY KEY
```

---

# 60.2 Foreign Key

Contoh:

```sql
products.category_id

REFERENCES categories(id)

```

---

# 60.3 Unique Constraint

Digunakan untuk:

* Username.
* Barcode.
* Phone number.
* Order number.
* Transaction number.

---

# 60.4 Check Constraint

Contoh:

Harga:

```sql
CHECK(price >=0)
```

Stock:

```sql
CHECK(current_stock >=0)
```

Quantity:

```sql
CHECK(quantity >0)
```

---

# 61. Database Index Strategy

Index dibuat berdasarkan query yang sering dilakukan.

---

# Users

```sql
username
role_id
```

Untuk:

* Login.
* Authorization.

---

# Customers

```sql
phone_number
```

Untuk:

* Guest login.

---

# Products

```sql
barcode

name

category_id
```

Untuk:

* Scanner.
* Search.
* Filter.

---

# Orders

```sql
customer_id

status

created_at
```

Untuk:

* Dashboard.
* Reporting.

---

# Transactions

```sql
transaction_number

transaction_date

customer_id
```

Untuk:

* Receipt.
* Report.

---

# Inventory

```sql
product_id
```

Untuk:

* Stock lookup.

---

# 62. Complete Database ERD

Final overview:

```text

                         roles
                           |
                           |
                           N
                         users
                           |
                           |
                    audit_logs


categories
     |
     |
     N
products
     |
     |
 -------------------------------
 |                             |
 |                             |
inventory              product_suppliers
 |                             |
 |
inventory_history          suppliers


customers
     |
     |
customer_sessions
     |
     |
orders
     |
     |
order_items
     |
     |
products


orders
     |
     |
transactions
     |
     |
 ----------------
 |              |
 |              |
transaction_items payments



restaurant_tables

        |

        |

qr_tables


restaurant_tables

        |

        |

customer_sessions

```

---

# 63. Complete Entity List

Database final memiliki:

## Authentication

✅ roles
✅ users
✅ permissions
✅ role_permissions
✅ sessions
✅ audit_logs

---

## Product

✅ categories
✅ products
✅ suppliers
✅ product_suppliers

---

## Customer

✅ customers
✅ customer_sessions

---

## Table

✅ restaurant_tables
✅ qr_tables

---

## Order

✅ orders
✅ order_items

---

## Transaction

✅ transactions
✅ transaction_items
✅ payments

---

## Inventory

✅ inventory
✅ inventory_history

---

Total:

```text
20 Tables
```

---

# 64. Database Design Conclusion

Database POS Restaurant Management System telah dirancang menggunakan prinsip:

## Integrity

Menggunakan:

* Foreign Key.
* Constraint.
* Validation.

---

## Security

Menggunakan:

* UUID.
* Audit log.
* Soft delete.

---

## Scalability

Mendukung:

* REST API.
* Mobile app.
* Multi branch future.

---

## Maintainability

Menggunakan:

* Normalization 3NF.
* Separation domain.
* Clear relationship.

---

