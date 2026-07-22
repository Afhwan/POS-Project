# 1. API Overview

## 1.1 Purpose

Dokumen ini mendefinisikan REST API untuk:

**Restaurant POS Management System**

API bertugas sebagai komunikasi antara:

```
Frontend Application

        |

        |

REST API

        |

        |

Backend Express.js

        |

        |

PostgreSQL
```

---

# 1.2 API Technology

Backend:

```
Node.js
Express.js
```

Protocol:

```
HTTP / HTTPS
```

Data Format:

```
JSON
```

Architecture:

```
RESTful API
```

---

# 2. API Design Principle

API mengikuti prinsip:

## Resource Oriented

Endpoint menggunakan noun.

Benar:

```
GET /api/v1/products
```

Salah:

```
GET /api/v1/getProducts
```

---

## Stateless Request

Setiap request membawa informasi yang diperlukan.

---

## Consistent Response

Semua endpoint memiliki format response yang sama.

---

# 3. Base URL

Development:

```
http://localhost:3000/api/v1
```

---

Contoh:

```
GET

http://localhost:3000/api/v1/products
```

---

# 4. API Versioning

Format:

```
/api/v1/
```

---

Contoh:

```
/api/v1/products

/api/v1/orders

/api/v1/payments
```

---

Tujuan:

Future:

```
/api/v2/
```

dapat dibuat tanpa merusak API lama.

---

# 5. HTTP Method Standard

| Method | Purpose            |
| ------ | ------------------ |
| GET    | Retrieve data      |
| POST   | Create data        |
| PUT    | Full update        |
| PATCH  | Partial update     |
| DELETE | Delete/soft delete |

---

Contoh:

Mendapatkan produk:

```
GET /products
```

---

Membuat produk:

```
POST /products
```

---

Update harga:

```
PATCH /products/{id}
```

---

# 6. Authentication Architecture

System memiliki dua jenis authentication.

---

# 6.1 Internal User Authentication

Untuk:

* Admin.
* Cashier.

Menggunakan:

```
Session Authentication
```

Flow:

```
Login

 |

Validate username/password

 |

Create Session

 |

Set Cookie

 |

Access Protected API

```

---

# 6.2 Customer Guest Authentication

Untuk:

* Customer restaurant.

Menggunakan:

```
QR Table Session
```

Flow:

```
Scan QR

 |

Input Name + Phone

 |

Normalize Phone

 |

Find/Create Customer

 |

Create Customer Session

 |

Order

```

---

# 7. Authentication Header

Internal user:

Menggunakan cookie:

```
session_id
```

---

Contoh:

```
Cookie:

connect.sid=xxxxx
```

---

Customer:

Menggunakan:

```
customer-session-token
```

---

Header:

```
X-Customer-Session: token
```

---

# 8. API Request Standard

Request JSON:

```json
{
    "field":"value"
}
```

---

Contoh:

Create product:

```json
{
    "name":"Burger",
    "barcode":"899123456",
    "price":25000,
    "category_id":
    "uuid"
}
```

---

# 9. API Response Standard

Semua response:

```json
{
    "success":true,
    "message":"Operation success",
    "data":{}
}
```

---

# 9.1 Success Response Example

HTTP:

```
200 OK
```

Response:

```json
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

# 9.2 Create Response

HTTP:

```
201 CREATED
```

Example:

```json
{
    "success":true,
    "message":"Product created",
    "data":{
        "id":"uuid"
    }
}
```

---

# 9.3 Error Response

HTTP:

```
400 BAD REQUEST
```

Example:

```json
{
    "success":false,
    "message":"Invalid product data",
    "error_code":
    "VALIDATION_ERROR"
}
```

---

# 10. Pagination Standard

Untuk data besar:

Contoh:

```
GET /products?page=1&limit=20
```

---

Response:

```json
{
    "success":true,
    "data":[
        
    ],
    "pagination":{
        "page":1,
        "limit":20,
        "total":200
    }
}
```

---

# 11. Filtering Standard

Menggunakan query parameter.

Contoh:

Filter category:

```
GET /products?category=drink
```

---

Filter status:

```
GET /orders?status=PENDING
```

---

# 12. Sorting Standard

Format:

```
sort_by
sort_order
```

---

Contoh:

```
GET /products?

sort_by=price

sort_order=desc
```

---

# 13. Error Handling

Semua error melewati:

```
Controller

 |

 |

Error Middleware

 |

 |

Logger

 |

 |

Response

```

---

# 14. Standard Error Code

| Code             | Meaning              |
| ---------------- | -------------------- |
| AUTH_FAILED      | Login gagal          |
| TOKEN_INVALID    | Session invalid      |
| FORBIDDEN        | Tidak punya akses    |
| NOT_FOUND        | Data tidak ditemukan |
| VALIDATION_ERROR | Input salah          |
| DUPLICATE_DATA   | Data sudah ada       |
| STOCK_NOT_ENOUGH | Stock kurang         |
| PAYMENT_FAILED   | Pembayaran gagal     |
| SERVER_ERROR     | Internal error       |

---

# 15. HTTP Status Mapping

| Status | Usage             |
| ------ | ----------------- |
| 200    | Success           |
| 201    | Created           |
| 204    | Deleted success   |
| 400    | Bad Request       |
| 401    | Unauthenticated   |
| 403    | Unauthorized      |
| 404    | Not Found         |
| 409    | Conflict          |
| 422    | Validation Failed |
| 500    | Server Error      |

---

# 16. API Security Standard

API wajib menerapkan:

---

## Authentication

Menggunakan:

```
express-session
```

---

## Authorization

Menggunakan:

```
RBAC
```

Contoh:

Admin:

```
POST /users
```

Cashier:

```
403 Forbidden
```

---

## Input Validation

Backend melakukan validasi:

* Required field.
* Data type.
* Range.
* Format.

---

Frontend validation hanya:

```
UX improvement
```

---

## SQL Injection Prevention

Menggunakan:

Parameterized Query.

Contoh:

Benar:

```javascript
db.query(
"SELECT * FROM products WHERE id=$1",
[id]
)
```

---

Tidak:

```javascript
"SELECT * FROM products WHERE id="+id
```

---

## Rate Limiting

Melindungi:

* Login brute force.
* API abuse.

---

## Helmet

Mengaktifkan:

* Security headers.
* CSP.

---

# 17. API Architecture Diagram

```
Frontend

HTML
CSS
JavaScript

        |

        |

HTTP Request

        |

        |

Express Router

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

# 18. API Endpoint Naming Convention

Menggunakan plural resource.

---

Benar:

```
/products

/orders

/customers

/payments
```

---

Tidak:

```
/product

/orderData

/createPayment
```

---

# 19. API Documentation Format

Setiap endpoint akan memiliki format:

```
METHOD Endpoint

Purpose

Authentication

Authorization

Request Body

Response

Possible Error
```

---

Contoh:

```
POST /api/v1/products

Purpose:
Create product

Auth:
Required

Role:
Admin

Body:
{
 name,
 price
}

Response:
201 Created

```

---


# 20. Authentication API Overview

Authentication API menangani:

* Login user internal.
* Logout.
* Session verification.
* Current user information.

Digunakan oleh:

* Administrator.
* Cashier.

Customer tidak menggunakan endpoint ini.

---

# 21. Login API

## Endpoint

```http
POST /api/v1/auth/login
```

---

## Purpose

Melakukan autentikasi user internal.

---

## Authentication

Tidak membutuhkan authentication.

---

## Authorization

Public endpoint.

---

## Request Body

```json
{
    "username":"admin",
    "password":"password123"
}
```

---

## Backend Process

Flow:

```text
Receive Credential

        |

Find User

        |

Compare bcrypt hash

        |

Create Session

        |

Set Cookie

        |

Return User Data

```

---

## Success Response

HTTP:

```http
200 OK
```

Response:

```json
{
    "success":true,
    "message":"Login successful",
    "data":{
        "user":{
            "id":"uuid",
            "username":"admin",
            "role":"admin"
        }
    }
}
```

---

## Error Response

Wrong password:

HTTP:

```http
401 Unauthorized
```

```json
{
    "success":false,
    "message":"Invalid username or password",
    "error_code":"AUTH_FAILED"
}
```

---

Inactive account:

```json
{
    "success":false,
    "message":"Account inactive",
    "error_code":"ACCOUNT_DISABLED"
}
```

---

# 22. Logout API

## Endpoint

```http
POST /api/v1/auth/logout
```

---

## Purpose

Menghapus session aktif.

---

## Authentication

Required.

---

## Request

Tidak ada body.

---

## Process

```text
Request Logout

        |

Destroy Session

        |

Clear Cookie

        |

Return Success

```

---

## Response

```json
{
    "success":true,
    "message":"Logout successful"
}
```

---

# 23. Current User API

## Endpoint

```http
GET /api/v1/auth/me
```

---

## Purpose

Mendapatkan informasi user yang sedang login.

---

## Authentication

Required.

---

## Response

```json
{
    "success":true,
    "data":{
        "id":"uuid",
        "username":"cashier01",
        "name":"Budi",
        "role":"cashier"
    }
}
```

---

# 24. Session Validation API

## Endpoint

```http
GET /api/v1/auth/session
```

---

## Purpose

Mengecek apakah session masih valid.

---

## Response

Valid:

```json
{
    "success":true,
    "data":{
        "authenticated":true
    }
}
```

---

Invalid:

```json
{
    "success":false,
    "data":{
        "authenticated":false
    }
}
```

---

# 25. User Management API Overview

User Management digunakan oleh Administrator.

Fungsi:

* Membuat user.
* Melihat user.
* Update user.
* Disable user.
* Delete user.

---

# 26. Get All Users

## Endpoint

```http
GET /api/v1/users
```

---

## Authorization

Role:

```text
ADMIN
```

---

## Query Parameter

Pagination:

```http
?page=1&limit=20
```

Filter:

```http
?role=cashier
```

---

## Response

```json
{
    "success":true,
    "data":[
        {
            "id":"uuid",
            "username":"cashier01",
            "role":"cashier",
            "is_active":true
        }
    ]
}
```

---

# 27. Get User Detail

## Endpoint

```http
GET /api/v1/users/{id}
```

---

## Response

```json
{
    "success":true,
    "data":{
        "id":"uuid",
        "username":"admin",
        "email":"admin@mail.com",
        "role":"admin"
    }
}
```

---

# 28. Create User

## Endpoint

```http
POST /api/v1/users
```

---

## Authorization

ADMIN only.

---

## Request Body

```json
{
    "username":"cashier01",
    "password":"password123",
    "full_name":"Andi",
    "role_id":"uuid"
}
```

---

## Backend Process

```text
Validate Input

        |

Hash Password

        |

Create User

        |

Create Audit Log

```

---

## Response

HTTP:

```http
201 Created
```

```json
{
    "success":true,
    "message":"User created",
    "data":{
        "id":"uuid"
    }
}
```

---

# 29. Update User

## Endpoint

```http
PATCH /api/v1/users/{id}
```

---

## Request Body

Example:

```json
{
    "full_name":"Andi Saputra",
    "role_id":"uuid"
}
```

---

## Response

```json
{
    "success":true,
    "message":"User updated"
}
```

---

# 30. Disable User

## Endpoint

```http
PATCH /api/v1/users/{id}/status
```

---

## Request

```json
{
    "is_active":false
}
```

---

## Purpose

Tidak menghapus akun.

---

Database:

Before:

```text
is_active=true
```

After:

```text
is_active=false
```

---

# 31. Delete User

## Endpoint

```http
DELETE /api/v1/users/{id}
```

---

## Implementation

Soft delete:

```sql
deleted_at = NOW()
```

---

## Response

```json
{
    "success":true,
    "message":"User deleted"
}
```

---

# 32. Role API Overview

Role digunakan untuk:

* Menentukan akses user.
* Implementasi RBAC.

---

# 33. Get Roles

## Endpoint

```http
GET /api/v1/roles
```

---

## Response

```json
{
    "success":true,
    "data":[
        {
            "id":"uuid",
            "name":"admin"
        },
        {
            "id":"uuid",
            "name":"cashier"
        }
    ]
}
```

---

# 34. Create Role

## Endpoint

```http
POST /api/v1/roles
```

---

## Authorization

ADMIN.

---

## Request

```json
{
    "name":"manager",
    "description":"Restaurant manager"
}
```

---

# 35. Update Role

## Endpoint

```http
PATCH /api/v1/roles/{id}
```

---

Request:

```json
{
    "description":"Updated description"
}
```

---

# 36. Delete Role

## Endpoint

```http
DELETE /api/v1/roles/{id}
```

---

Constraint:

Role tidak boleh dihapus jika masih digunakan.

---

Response error:

```json
{
    "success":false,
    "message":"Role still assigned to users",
    "error_code":"ROLE_IN_USE"
}
```

---

# 37. Permission API Overview

Permission digunakan untuk akses granular.

---

Contoh:

```text
product.create

product.delete

transaction.cancel

inventory.adjust

```

---

# 38. Get Permissions

## Endpoint

```http
GET /api/v1/permissions
```

---

Response:

```json
{
    "success":true,
    "data":[
        {
            "name":"product.create"
        },
        {
            "name":"payment.process"
        }
    ]
}
```

---

# 39. Assign Permission To Role

## Endpoint

```http
POST /api/v1/roles/{id}/permissions
```

---

Request:

```json
{
    "permission_id":"uuid"
}
```

---

Example:

Admin:

```text
product.create

product.delete

user.manage

```

Cashier:

```text
transaction.create

payment.process

```

---

# 40. Remove Permission From Role

## Endpoint

```http
DELETE /api/v1/roles/{roleId}/permissions/{permissionId}
```

---

# 41. Authentication API Security Rules

Semua endpoint auth wajib:

## Login Protection

Rate limit:

```text
5 attempts / minute
```

---

## Password Rule

Password:

* Tidak disimpan plain text.
* Minimal panjang ditentukan validator.
* Hash menggunakan bcrypt.

---

## Session Rule

Session:

* Memiliki expiration.
* Dihapus ketika logout.
* Tidak dapat digunakan ulang.

---

# 42. Authentication Endpoint Summary

| Method | Endpoint      | Role   |
| ------ | ------------- | ------ |
| POST   | /auth/login   | Public |
| POST   | /auth/logout  | User   |
| GET    | /auth/me      | User   |
| GET    | /auth/session | User   |
| GET    | /users        | Admin  |
| POST   | /users        | Admin  |
| PATCH  | /users/:id    | Admin  |
| DELETE | /users/:id    | Admin  |
| GET    | /roles        | Admin  |
| POST   | /roles        | Admin  |
| GET    | /permissions  | Admin  |

---


# 43. Customer API Overview

Customer API mengelola data pelanggan restaurant.

Customer berbeda dengan User.

Customer:

* Tidak memiliki password.
* Tidak menggunakan RBAC.
* Login melalui QR Table.
* Identifikasi menggunakan nomor telepon.

---

# 44. Customer Guest Authentication Flow

Flow lengkap:

```text id="c2g6mk"
Customer Scan QR

        |

        |

Input Name + Phone

        |

        |

Normalize Phone Number

        |

        |

Search Customer Database

        |

        |

Existing Customer?

      /       \

    Yes        No

     |          |

Use Profile   Create Customer

        |

        |

Create Customer Session

        |

        |

Access Menu

```

---

# 45. Phone Number Normalization

Backend wajib melakukan normalisasi.

Input:

```text id="5njf1d"
08123456789
```

Menjadi:

```text id="8z6q7h"
628123456789
```

---

Format database:

```text id="7i7m6j"
+62 tidak digunakan

Spasi dihapus

Nomor disimpan konsisten

```

---

# 46. Customer Login API

## Endpoint

```http id="b2h1ls"
POST /api/v1/customers/login
```

---

## Authentication

Public.

---

## Request Body

```json id="8k0w7s"
{
    "name":"Afhwan",
    "phone_number":"08123456789",
    "table_token":"abc123xyz"
}
```

---

# 46.1 Backend Process

```text id="q7k3pr"
Receive Data

 |

Validate Input

 |

Normalize Phone

 |

Find Customer

 |

Create if Not Exists

 |

Create Customer Session

 |

Return Session Token

```

---

# 46.2 Existing Customer Example

Database:

```json id="9xq4sy"
{
"name":"Afhwan Rez",
"phone_number":"628123456789"
}
```

Input:

```json id="1t7y82"
{
"name":"afhwan",
"phone_number":"08123456789"
}
```

Result:

```json id="c2m8p8"
{
"name":"Afhwan Rez"
}
```

---

# 46.3 Response

HTTP:

```http id="jz8n2f"
200 OK
```

```json id="n4tq2k"
{
    "success":true,
    "message":"Customer session created",
    "data":{
        "customer_id":"uuid",
        "session_token":"xxxx",
        "table":{
            "number":"T01"
        }
    }
}
```

---

# 47. Get Customer Profile

## Endpoint

```http id="yt4k6s"
GET /api/v1/customers/me
```

---

## Authentication

Customer session.

Header:

```http id="x8q5h7"
X-Customer-Session: token
```

---

## Response

```json id="3mxp9s"
{
    "success":true,
    "data":{
        "name":"Afhwan",
        "phone_number":"628123456789"
    }
}
```

---

# 48. Customer History API

## Endpoint

```http id="pq7g8v"
GET /api/v1/customers/me/orders
```

---

## Purpose

Melihat riwayat order customer.

---

Response:

```json id="zq3q45"
{
    "success":true,
    "data":[
        {
            "order_number":"ORD-001",
            "status":"COMPLETED",
            "total":50000
        }
    ]
}
```

---

# 49. QR Table API Overview

QR Table digunakan untuk:

* Identifikasi meja.
* Membuat customer session.

QR bukan payment.

---

# 50. Validate QR Table

## Endpoint

```http id="8p7vqa"
GET /api/v1/tables/qr/{token}
```

---

## Purpose

Validasi QR sebelum customer login.

---

Response:

```json id="0z6m3x"
{
    "success":true,
    "data":{
        "table_id":"uuid",
        "table_number":"T01",
        "status":"AVAILABLE"
    }
}
```

---

# 51. Table Management API

Digunakan oleh Admin.

---

# 51.1 Get Tables

```http id="j0u2ki"
GET /api/v1/tables
```

---

Response:

```json id="m1y2h4"
{
"success":true,
"data":[
{
"number":"T01",
"status":"AVAILABLE"
}
]
}
```

---

# 51.2 Create Table

```http id="g8c0sn"
POST /api/v1/tables
```

---

Request:

```json id="e1x2nz"
{
    "table_number":"T05",
    "capacity":4
}
```

---

# 51.3 Update Table Status

```http id="qf9j2m"
PATCH /api/v1/tables/{id}/status
```

---

Request:

```json id="x0r4pa"
{
"status":"CLEANING"
}
```

---

# 52. Customer Session API

---

# 52.1 Get Current Session

## Endpoint

```http id="wq2c6h"
GET /api/v1/customer-session
```

---

Header:

```http id="6pm0sd"
X-Customer-Session
```

---

Response:

```json id="5r8r0j"
{
"success":true,
"data":{
"table":"T01",
"status":"ACTIVE"
}
}
```

---

# 52.2 End Customer Session

## Endpoint

```http id="j8v6rx"
POST /api/v1/customer-session/end
```

---

Process:

```text id="4wq1y8"
Complete Payment

        |

End Session

        |

Release Table

```

---

# 53. Product API Overview

Product API digunakan untuk:

* Menu management.
* Barcode lookup.
* Product search.

---

# 54. Get Products

## Endpoint

```http id="s6k9a2"
GET /api/v1/products
```

---

## Access

Public:

Customer menu.

Internal:

Cashier/Admin.

---

## Query

Search:

```http id="g5m8mz"
?search=burger
```

---

Category:

```http id="6y9j2a"
?category_id=uuid
```

---

Available:

```http id="nv4h6q"
?available=true
```

---

Response:

```json id="yq0v0d"
{
"success":true,
"data":[
{
"id":"uuid",
"name":"Burger",
"price":25000,
"barcode":"899123"
}
]
}
```

---

# 55. Get Product Detail

## Endpoint

```http id="hx7wq1"
GET /api/v1/products/{id}
```

---

Response:

```json id="wq4m9f"
{
"success":true,
"data":{
"name":"Burger",
"price":25000,
"stock":50
}
}
```

---

# 56. Search Product By Barcode

## Endpoint

```http id="8h3j1x"
GET /api/v1/products/barcode/{barcode}
```

---

Purpose:

Digunakan oleh:

* USB barcode scanner.
* Camera scanner.

---

Example:

```http id="v7r9hp"
GET /products/barcode/899123456
```

---

Response:

```json id="m3k8z1"
{
"success":true,
"data":{
"id":"uuid",
"name":"Coffee",
"price":15000
}
}
```

---

# 57. Create Product

## Endpoint

```http id="z9k4t6"
POST /api/v1/products
```

---

Role:

ADMIN.

---

Request:

```json id="p8c2s4"
{
"name":"Coffee",
"barcode":"89912345",
"category_id":"uuid",
"price":15000
}
```

---

# 58. Update Product

## Endpoint

```http id="s1j8r5"
PATCH /api/v1/products/{id}
```

---

Example:

```json id="m0z5y9"
{
"price":18000
}
```

---

# 59. Delete Product

## Endpoint

```http id="v4n8d2"
DELETE /api/v1/products/{id}
```

---

Implementation:

Soft delete.

---

# 60. Category API

---

# 60.1 Get Categories

```http id="v7p1q0"
GET /api/v1/categories
```

---

Response:

```json id="q6n3x9"
{
"success":true,
"data":[
{
"id":"uuid",
"name":"Food"
}
]
}
```

---

# 60.2 Create Category

```http id="r3x7k0"
POST /api/v1/categories
```

---

Request:

```json id="d4y8s2"
{
"name":"Dessert"
}
```

---

# 60.3 Update Category

```http id="p6w0m2"
PATCH /api/v1/categories/{id}
```

---

# 60.4 Delete Category

```http id="n5c9a4"
DELETE /api/v1/categories/{id}
```

---

Constraint:

Tidak boleh delete jika masih digunakan product.

---

# 61. Product Security Rules

## Barcode

Wajib unique:

```text id="7s1z4f"
Duplicate barcode

=

Rejected
```

---

## Price

Tidak boleh:

```text id="9n2m7v"
price < 0
```

---

## Product Delete

Menggunakan:

```text id="5v6x8p"
Soft Delete
```

---

# 62. Customer & Product Endpoint Summary

| Method | Endpoint                | Role          |
| ------ | ----------------------- | ------------- |
| POST   | /customers/login        | Public        |
| GET    | /customers/me           | Customer      |
| GET    | /customers/me/orders    | Customer      |
| GET    | /tables/qr/:token       | Public        |
| GET    | /tables                 | Admin         |
| POST   | /tables                 | Admin         |
| PATCH  | /tables/:id/status      | Admin/Cashier |
| GET    | /products               | Public/User   |
| GET    | /products/:id           | Public/User   |
| GET    | /products/barcode/:code | Cashier       |
| POST   | /products               | Admin         |
| PATCH  | /products/:id           | Admin         |
| DELETE | /products/:id           | Admin         |
| GET    | /categories             | Public/User   |
| POST   | /categories             | Admin         |

---


# 63. Order API Overview

Order API menangani proses pemesanan makanan dari customer sampai siap diproses menjadi transaksi.

Order berada sebelum transaction.

Flow:

```text
Customer

    |

    |

Create Order

    |

    |

Kitchen Processing

    |

    |

Ready

    |

    |

Cashier Create Transaction

    |

    |

Payment

```

---

# 64. Order Lifecycle

Order memiliki state:

```text
PENDING

    |

    v

PROCESSING

    |

    v

READY

    |

    v

COMPLETED

```

---

Cancel flow:

```text
PENDING

    |

    v

CANCELLED

```

---

Invalid:

```text
PENDING

    |

    v

COMPLETED
```

---

Backend wajib melakukan validasi transition.

---

# 65. Create Order API

## Endpoint

```http
POST /api/v1/orders
```

---

## Purpose

Customer membuat pesanan.

---

## Authentication

Customer Session.

Header:

```http
X-Customer-Session: token
```

---

## Request Body

```json
{
    "items":[
        {
            "product_id":"uuid",
            "quantity":2,
            "notes":"Less spicy"
        },
        {
            "product_id":"uuid",
            "quantity":1
        }
    ],
    "notes":"No onion"
}
```

---

# 65.1 Backend Process

```text
Receive Order

        |

Validate Session

        |

Validate Product

        |

Check Availability

        |

Calculate Price

        |

Create Order

        |

Create Order Items

        |

Return Order

```

---

# 65.2 Response

HTTP:

```http
201 Created
```

---

```json
{
    "success":true,
    "message":"Order created",
    "data":{
        "order_id":"uuid",
        "order_number":"ORD-001",
        "status":"PENDING"
    }
}
```

---

# 66. Get Customer Current Orders

## Endpoint

```http
GET /api/v1/orders/my
```

---

## Authentication

Customer Session.

---

Response:

```json
{
    "success":true,
    "data":[
        {
            "order_number":"ORD-001",
            "status":"PROCESSING",
            "items":[]
        }
    ]
}
```

---

# 67. Get All Orders

## Endpoint

```http
GET /api/v1/orders
```

---

## Authorization

Admin:

Cashier:

Kitchen staff (future)

---

## Query Parameter

Filter status:

```http
/orders?status=PENDING
```

---

Example:

```http
/orders?status=READY
```

---

Response:

```json
{
    "success":true,
    "data":[
        {
            "order_number":"ORD-001",
            "table":"T01",
            "status":"READY"
        }
    ]
}
```

---

# 68. Get Order Detail

## Endpoint

```http
GET /api/v1/orders/{id}
```

---

Response:

```json
{
    "success":true,
    "data":{
        "order_number":"ORD-001",
        "items":[
            {
                "name":"Burger",
                "quantity":2
            }
        ]
    }
}
```

---

# 69. Update Order Status

## Endpoint

```http
PATCH /api/v1/orders/{id}/status
```

---

## Authorization

Cashier/Admin.

---

Request:

```json
{
    "status":"PROCESSING"
}
```

---

# 69.1 Status Validation

Allowed:

```text
PENDING

↓

PROCESSING


PROCESSING

↓

READY


READY

↓

COMPLETED
```

---

Jika invalid:

Response:

```json
{
    "success":false,
    "message":"Invalid status transition",
    "error_code":"INVALID_STATUS_FLOW"
}
```

---

# 70. Cancel Order API

## Endpoint

```http
PATCH /api/v1/orders/{id}/cancel
```

---

Request:

```json
{
    "reason":"Customer cancelled"
}
```

---

Rules:

Order hanya dapat dibatalkan:

```text
PENDING
```

---

# 71. Order Item API

## Add Item

```http
POST /api/v1/orders/{id}/items
```

---

Request:

```json
{
    "product_id":"uuid",
    "quantity":2
}
```

---

## Remove Item

```http
DELETE /api/v1/orders/{id}/items/{itemId}
```

---

Rule:

Tidak dapat mengubah item ketika:

```text
PROCESSING
READY
COMPLETED
```

---

# 72. Transaction API Overview

Transaction dibuat ketika order selesai diproses dan customer melakukan pembayaran.

---

Relationship:

```text
Order

   |

   |

Transaction

   |

   |

Payment

```

---

# 73. Create Transaction API

## Endpoint

```http
POST /api/v1/transactions
```

---

## Authorization

Cashier.

---

## Purpose

Mengubah order menjadi transaksi.

---

## Request Body

```json
{
    "order_id":"uuid"
}
```

---

# 73.1 Backend Process

```text
Receive Order ID

        |

Validate Order

        |

Calculate Total

        |

Create Transaction

        |

Create Transaction Items

        |

Return Transaction

```

---

# 73.2 Response

HTTP:

```http
201 Created
```

---

```json
{
    "success":true,
    "data":{
        "transaction_id":"uuid",
        "transaction_number":"TRX-001",
        "total_amount":50000
    }
}
```

---

# 74. Get Transactions

## Endpoint

```http
GET /api/v1/transactions
```

---

## Authorization

Admin/Cashier.

---

Query:

Tanggal:

```http
/transactions?date=2026-07-22
```

---

Status:

```http
/transactions?status=PAID
```

---

Response:

```json
{
    "success":true,
    "data":[
        {
            "transaction_number":"TRX-001",
            "total_amount":50000,
            "status":"PAID"
        }
    ]
}
```

---

# 75. Get Transaction Detail

## Endpoint

```http
GET /api/v1/transactions/{id}
```

---

Response:

```json
{
    "success":true,
    "data":{
        "transaction_number":"TRX-001",
        "items":[
            {
                "name":"Coffee",
                "price":15000
            }
        ],
        "payment":{
            "method":"CASH"
        }
    }
}
```

---

# 76. Generate Receipt API

## Endpoint

```http
GET /api/v1/transactions/{id}/receipt
```

---

Purpose:

Generate:

* Struk digital.
* PDF receipt.

---

Response:

```json
{
    "success":true,
    "data":{
        "receipt_url":
        "/files/receipt/TRX-001.pdf"
    }
}
```

---

# 77. Payment API Overview

Payment menangani pembayaran customer.

Supported:

```text
CASH

QRIS

DEBIT

TRANSFER

```

---

# 78. Create Payment

## Endpoint

```http
POST /api/v1/payments
```

---

## Authorization

Cashier.

---

## Request

```json
{
    "transaction_id":"uuid",
    "method":"CASH",
    "amount":50000
}
```

---

# 78.1 Cash Payment Flow

```text
Create Payment

        |

Validate Amount

        |

Success

        |

Update Transaction PAID

```

---

Response:

```json
{
    "success":true,
    "message":"Payment successful"
}
```

---

# 79. QRIS Payment API

## Endpoint

```http
POST /api/v1/payments/qris
```

---

Request:

```json
{
    "transaction_id":"uuid"
}
```

---

Process:

```text
Create Payment

        |

Status WAITING

        |

Generate Dummy QR

        |

Customer Scan

        |

Continue Payment

        |

SUCCESS

```

---

Response:

```json
{
    "success":true,
    "data":{
        "qr_code":
        "dummy-qris-image",
        "status":"WAITING"
    }
}
```

---

# 80. Confirm QRIS Payment

## Endpoint

```http
POST /api/v1/payments/{id}/confirm
```

---

Purpose:

Simulasi payment success.

---

Response:

```json
{
    "success":true,
    "message":"Payment successful"
}
```

---

# 81. Debit Payment API

## Endpoint

```http
POST /api/v1/payments/debit
```

---

Request:

```json
{
    "transaction_id":"uuid"
}
```

---

Flow:

```text
Insert Card Dummy

        |

Continue

        |

Success

```

---

Response:

```json
{
    "success":true,
    "status":"SUCCESS"
}
```

---

# 82. Transfer Payment API

## Endpoint

```http
POST /api/v1/payments/transfer
```

---

Flow:

```text
Show Bank Account Dummy

        |

Continue

        |

Success

```

---

# 83. Cancel Payment

## Endpoint

```http
PATCH /api/v1/payments/{id}/cancel
```

---

Rules:

Payment hanya dapat dibatalkan:

```text
WAITING
```

---

# 84. Refund Transaction

## Endpoint

```http
POST /api/v1/transactions/{id}/refund
```

---

Authorization:

ADMIN.

---

Request:

```json
{
    "reason":"Wrong order"
}
```

---

Flow:

```text
PAID

 |

 v

REFUNDED

```

---

# 85. Payment Security Rules

## Amount Validation

Backend menghitung ulang.

Tidak percaya:

```json
{
"amount":1
}
```

---

Backend:

```text
Transaction Total

=

Payment Amount
```

---

## Double Payment Prevention

Tidak boleh:

```text
Transaction

PAID

+

Payment Success kedua
```

---

# 86. Order & Payment Endpoint Summary

| Method | Endpoint                  | Role          |
| ------ | ------------------------- | ------------- |
| POST   | /orders                   | Customer      |
| GET    | /orders/my                | Customer      |
| GET    | /orders                   | Cashier/Admin |
| GET    | /orders/:id               | User          |
| PATCH  | /orders/:id/status        | Cashier       |
| PATCH  | /orders/:id/cancel        | Cashier       |
| POST   | /transactions             | Cashier       |
| GET    | /transactions             | Cashier/Admin |
| GET    | /transactions/:id         | Cashier/Admin |
| GET    | /transactions/:id/receipt | User          |
| POST   | /payments                 | Cashier       |
| POST   | /payments/qris            | Cashier       |
| POST   | /payments/debit           | Cashier       |
| POST   | /payments/transfer        | Cashier       |
| POST   | /payments/:id/confirm     | Cashier       |
| POST   | /transactions/:id/refund  | Admin         |

---

# 87. Inventory API Overview

Inventory API mengelola:

* Stock produk.
* Perubahan stok.
* Stock history.
* Low stock monitoring.
* Stock adjustment.

Inventory memiliki prinsip:

> Setiap perubahan stok wajib memiliki record pada inventory_history.

---

# 88. Get Inventory List

## Endpoint

```http
GET /api/v1/inventory
```

---

## Authorization

Role:

```
ADMIN
CASHIER
```

---

## Query Parameter

Filter low stock:

```http
GET /inventory?low_stock=true
```

---

Search:

```http
GET /inventory?search=coffee
```

---

## Response

```json
{
    "success":true,
    "data":[
        {
            "product_id":"uuid",
            "product_name":"Coffee",
            "current_stock":20,
            "min_stock":10
        }
    ]
}
```

---

# 89. Get Product Stock Detail

## Endpoint

```http
GET /api/v1/inventory/{productId}
```

---

## Purpose

Melihat detail stok sebuah produk.

---

Response:

```json
{
    "success":true,
    "data":{
        "product":"Coffee",
        "current_stock":50,
        "history":[
            {
                "type":"STOCK_IN",
                "change":20
            },
            {
                "type":"SALE",
                "change":-2
            }
        ]
    }
}
```

---

# 90. Add Incoming Stock API

## Endpoint

```http
POST /api/v1/inventory/stock-in
```

---

## Authorization

ADMIN.

---

## Purpose

Menambahkan stok masuk.

---

## Request Body

```json
{
    "product_id":"uuid",
    "quantity":50,
    "supplier_id":"uuid",
    "notes":"Restock monthly"
}
```

---

# 90.1 Backend Process

```text
Receive Request

        |

Validate Product

        |

Increase Stock

        |

Create Inventory History

        |

Create Audit Log

```

---

# 90.2 Response

```json
{
    "success":true,
    "message":"Stock added successfully",
    "data":{
        "new_stock":150
    }
}
```

---

# 91. Stock Adjustment API

## Endpoint

```http
PATCH /api/v1/inventory/{productId}/adjust
```

---

## Authorization

ADMIN.

---

## Purpose

Melakukan koreksi stok.

Contoh:

* Barang rusak.
* Salah input.
* Stock opname.

---

## Request

```json
{
    "quantity_change":-5,
    "reason":"Damaged product"
}
```

---

# 91.1 Rule

Adjustment harus memiliki:

```
reason
```

---

Tidak valid:

```json
{
"quantity_change":-5
}
```

---

Response:

```json
{
    "success":true,
    "message":"Stock adjusted"
}
```

---

# 92. Inventory History API

## Endpoint

```http
GET /api/v1/inventory/history
```

---

## Authorization

ADMIN.

---

Query:

```http
?product_id=uuid
```

---

Response:

```json
{
    "success":true,
    "data":[
        {
            "change_type":"SALE",
            "quantity_change":-2,
            "previous_stock":50,
            "new_stock":48
        }
    ]
}
```

---

# 93. Supplier API Overview

Supplier API mengelola pemasok bahan atau produk.

---

Entity:

```
Supplier

      |

      |

Product Supplier

      |

      |

Product
```

---

# 94. Get Suppliers

## Endpoint

```http
GET /api/v1/suppliers
```

---

Authorization:

ADMIN.

---

Response:

```json
{
    "success":true,
    "data":[
        {
            "id":"uuid",
            "name":"PT Food Supply"
        }
    ]
}
```

---

# 95. Create Supplier

## Endpoint

```http
POST /api/v1/suppliers
```

---

Request:

```json
{
    "name":"PT Food Supply",
    "phone":"08123456789",
    "address":"Jakarta"
}
```

---

Response:

```json
{
    "success":true,
    "message":"Supplier created"
}
```

---

# 96. Update Supplier

## Endpoint

```http
PATCH /api/v1/suppliers/{id}
```

---

Request:

```json
{
    "phone":"089999999"
}
```

---

# 97. Delete Supplier

## Endpoint

```http
DELETE /api/v1/suppliers/{id}
```

---

Implementation:

Soft delete.

---

# 98. Reporting API Overview

Reporting digunakan untuk:

* Dashboard admin.
* Analisis penjualan.
* Monitoring bisnis.

---

Report tersedia:

* Daily sales.
* Monthly sales.
* Best selling product.
* Revenue.
* Transaction count.
* Inventory report.

---

# 99. Sales Report API

## Endpoint

```http
GET /api/v1/reports/sales
```

---

Authorization:

ADMIN.

---

Query:

Tanggal:

```http
?start_date=2026-07-01
&end_date=2026-07-31
```

---

Response:

```json
{
    "success":true,
    "data":{
        "total_sales":15000000,
        "transaction_count":250,
        "average_transaction":60000
    }
}
```

---

# 100. Daily Sales Report

## Endpoint

```http
GET /api/v1/reports/sales/daily
```

---

Response:

```json
{
    "success":true,
    "data":[
        {
            "date":"2026-07-22",
            "sales":500000
        }
    ]
}
```

---

# 101. Best Selling Product Report

## Endpoint

```http
GET /api/v1/reports/products/best-selling
```

---

Response:

```json
{
    "success":true,
    "data":[
        {
            "product":"Burger",
            "sold":200
        }
    ]
}
```

---

# 102. Payment Report

## Endpoint

```http
GET /api/v1/reports/payments
```

---

Purpose:

Melihat distribusi pembayaran.

---

Response:

```json
{
    "success":true,
    "data":{
        "cash":5000000,
        "qris":3000000,
        "debit":2000000
    }
}
```

---

# 103. Dashboard API

Dashboard dibuat khusus agar frontend mendapatkan data ringkas.

---

# 104. Admin Dashboard

## Endpoint

```http
GET /api/v1/dashboard/admin
```

---

Response:

```json
{
    "success":true,
    "data":{
        "today_sales":1500000,
        "today_transactions":50,
        "low_stock_count":5,
        "active_users":3
    }
}
```

---

# 105. Cashier Dashboard

## Endpoint

```http
GET /api/v1/dashboard/cashier
```

---

Response:

```json
{
    "success":true,
    "data":{
        "pending_orders":10,
        "ready_orders":5,
        "today_transactions":30
    }
}
```

---

# 106. Export API

System mendukung export:

* Excel.
* PDF.

---

# 106.1 Export Sales Excel

## Endpoint

```http
GET /api/v1/reports/sales/export/excel
```

---

Response:

File:

```
sales-report.xlsx
```

---

# 106.2 Export Sales PDF

## Endpoint

```http
GET /api/v1/reports/sales/export/pdf
```

---

Response:

File:

```
sales-report.pdf
```

---

# 107. Settings API

## Endpoint

```http
GET /api/v1/settings
```

---

Purpose:

Mengambil konfigurasi restoran.

Contoh:

```json
{
    "restaurant_name":"My Restaurant",
    "tax":10,
    "currency":"IDR"
}
```

---

# 108. Update Settings

## Endpoint

```http
PATCH /api/v1/settings
```

---

Authorization:

ADMIN.

---

Request:

```json
{
    "restaurant_name":"New Name",
    "tax":11
}
```

---

# 109. Complete API Endpoint List

## Authentication

| Method | Endpoint      |
| ------ | ------------- |
| POST   | /auth/login   |
| POST   | /auth/logout  |
| GET    | /auth/me      |
| GET    | /auth/session |

---

## Users

| Method | Endpoint   |
| ------ | ---------- |
| GET    | /users     |
| POST   | /users     |
| PATCH  | /users/:id |
| DELETE | /users/:id |

---

## Customers

| Method | Endpoint             |
| ------ | -------------------- |
| POST   | /customers/login     |
| GET    | /customers/me        |
| GET    | /customers/me/orders |

---

## Tables

| Method | Endpoint           |
| ------ | ------------------ |
| GET    | /tables            |
| POST   | /tables            |
| GET    | /tables/qr/:token  |
| PATCH  | /tables/:id/status |

---

## Products

| Method | Endpoint                |
| ------ | ----------------------- |
| GET    | /products               |
| POST   | /products               |
| GET    | /products/:id           |
| GET    | /products/barcode/:code |
| PATCH  | /products/:id           |
| DELETE | /products/:id           |

---

## Orders

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /orders            |
| GET    | /orders            |
| GET    | /orders/:id        |
| PATCH  | /orders/:id/status |
| PATCH  | /orders/:id/cancel |

---

## Transactions

| Method | Endpoint                  |
| ------ | ------------------------- |
| POST   | /transactions             |
| GET    | /transactions             |
| GET    | /transactions/:id         |
| GET    | /transactions/:id/receipt |
| POST   | /transactions/:id/refund  |

---

## Payments

| Method | Endpoint              |
| ------ | --------------------- |
| POST   | /payments             |
| POST   | /payments/qris        |
| POST   | /payments/debit       |
| POST   | /payments/transfer    |
| POST   | /payments/:id/confirm |

---

## Inventory

| Method | Endpoint              |
| ------ | --------------------- |
| GET    | /inventory            |
| GET    | /inventory/:productId |
| POST   | /inventory/stock-in   |
| PATCH  | /inventory/:id/adjust |
| GET    | /inventory/history    |

---

## Supplier

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /suppliers     |
| POST   | /suppliers     |
| PATCH  | /suppliers/:id |
| DELETE | /suppliers/:id |

---

## Reports

| Method | Endpoint                       |
| ------ | ------------------------------ |
| GET    | /reports/sales                 |
| GET    | /reports/sales/daily           |
| GET    | /reports/products/best-selling |
| GET    | /reports/payments              |

---

# 110. API Development Rules

Semua API wajib:

## 1. Validate Input

Menggunakan validator middleware.

---

## 2. Handle Error

Tidak boleh:

```javascript
try {

}
catch(err){

}
```

langsung response dari controller.

---

Harus:

```
Controller

↓

next(error)

↓

Error Middleware

```

---

## 3. Logging

Semua error:

```
logs/error.log
```

---

## 4. Audit

Action penting:

* Create product.
* Delete product.
* Adjust stock.
* Refund.

Masuk:

```
audit_logs
```

---

# 111. Final API Architecture

```text
                 FRONTEND

                    |

                    |

              REST API JSON

                    |

                    |

              EXPRESS ROUTER

                    |

                    |

              CONTROLLER

                    |

                    |

               SERVICE LAYER

                    |

                    |

             REPOSITORY LAYER

                    |

                    |

              POSTGRESQL

```

---

# 112. API Specification Conclusion

API POS Restaurant Management System telah dirancang dengan:

✅ REST architecture
✅ Versioning `/api/v1`
✅ Session authentication
✅ Guest customer session
✅ RBAC authorization
✅ Order workflow
✅ Payment workflow
✅ Inventory tracking
✅ Reporting system
✅ Security standard

---

