# 1. Test Plan Overview

## 1.1 Purpose

Dokumen ini menjelaskan metode testing yang digunakan pada:

**Restaurant POS Management System**

Testing mencakup:

```text
Database

↓

Backend API

↓

Frontend

↓

Security

↓

Business Flow

↓

User Acceptance
```

---

# 1.2 Testing Objectives

Tujuan testing:

## Functional Correctness

Memastikan fitur berjalan sesuai requirement.

Contoh:

```text
Customer membuat order

↓

Kasir menerima order

↓

Payment berhasil

↓

Stock berkurang
```

---

## Security Assurance

Memastikan:

* Data user aman.
* Tidak ada akses ilegal.
* Input berbahaya ditolak.

---

## Reliability

Memastikan aplikasi:

* Tidak crash.
* Menangani error dengan baik.
* Konsisten.

---

## Maintainability

Memastikan:

* Code mudah diuji.
* Module tidak saling bergantung berlebihan.

---

# 2. Testing Philosophy

Testing menggunakan pendekatan:

```text
Test Early

↓

Test Often

↓

Test Before Merge
```

---

Artinya:

Bug ditemukan sedini mungkin.

---

# 3. Testing Levels

Testing dibagi menjadi:

```text
Level 1

Unit Testing


Level 2

Integration Testing


Level 3

System Testing


Level 4

Security Testing


Level 5

User Acceptance Testing
```

---

# 4. Testing Environment

Environment testing:

```text
OS:

Linux / Windows


Backend:

Node.js


Database:

PostgreSQL


Browser:

Chrome / Firefox


Tools:

Postman

pgAdmin

Browser DevTools
```

---

# 5. Testing Tools

Tools yang digunakan:

---

## API Testing

Tool:

```text
Postman
```

Digunakan untuk:

* Endpoint testing.
* Authentication testing.
* Response validation.

---

## Database Testing

Tool:

```text
pgAdmin

psql
```

Digunakan untuk:

* Query testing.
* Constraint testing.
* Data integrity.

---

## Browser Testing

Tool:

```text
Chrome DevTools
```

Untuk:

* UI testing.
* Network inspection.
* Console error.

---

## Automated Testing (Future)

Optional:

Backend:

```text
Jest

Supertest
```

Frontend:

```text
Playwright
```

---

# 6. Testing Scope

Testing mencakup:

---

# Authentication

Testing:

* Login.
* Logout.
* Session.
* Password security.

---

# User Management

Testing:

* Create user.
* Role assignment.
* Permission.

---

# Product Management

Testing:

* CRUD product.
* Barcode.
* Category.

---

# Customer System

Testing:

* Guest login.
* Phone normalization.
* Customer identification.

---

# Order System

Testing:

* Create order.
* Status transition.
* Order cancellation.

---

# Transaction

Testing:

* Checkout.
* Total calculation.
* Receipt.

---

# Payment

Testing:

* Cash.
* QRIS dummy.
* Debit dummy.
* Transfer dummy.

---

# Inventory

Testing:

* Stock update.
* Stock history.
* Stock protection.

---

# Reporting

Testing:

* Calculation.
* Filtering.
* Export.

---

# 7. Test Case Format

Setiap test case menggunakan format:

| Field           | Description        |
| --------------- | ------------------ |
| Test ID         | Unique identifier  |
| Module          | Feature tested     |
| Scenario        | Testing scenario   |
| Precondition    | Required condition |
| Steps           | Testing steps      |
| Expected Result | Expected output    |
| Actual Result   | Real output        |
| Status          | PASS/FAIL          |

---

Example:

| Field        | Value                   |
| ------------ | ----------------------- |
| ID           | AUTH-001                |
| Module       | Authentication          |
| Scenario     | Valid login             |
| Precondition | User exists             |
| Steps        | Input username/password |
| Expected     | Dashboard displayed     |
| Status       | PASS                    |

---

# 8. Test Priority

Testing priority:

| Priority | Meaning     |
| -------- | ----------- |
| Critical | Must pass   |
| High     | Important   |
| Medium   | Should pass |
| Low      | Optional    |

---

Critical modules:

```text
Authentication

Order

Transaction

Payment

Inventory
```

---

# 9. Definition of Done

Feature dianggap selesai jika:

```text
✓ Code completed

✓ Unit tested

✓ API tested

✓ Validation tested

✓ Security checked

✓ Documentation updated
```

---

# 10. Regression Testing

Setiap perubahan besar harus melakukan regression test.

---

Contoh:

Jika mengubah:

```text
Payment System
```

Maka test ulang:

```text
Transaction

Inventory

Report
```

Karena saling terhubung.

---

# 11. Testing Workflow

Flow testing:

```text
Developer Complete Feature

↓

Run Unit Test

↓

API Testing

↓

Manual Testing

↓

Security Check

↓

Merge
```

---

# 12. Bug Reporting Standard

Bug harus dicatat dengan format:

```
BUG-ID

Title

Description

Steps to reproduce

Expected result

Actual result

Severity

Status
```

---

Contoh:

```
BUG-001

Stock becomes negative

Steps:
1. Buy product
2. Payment success
3. Repeat transaction

Expected:
Transaction rejected

Actual:
Stock -5

Severity:
High
```

---

# 13. Unit Testing Strategy

## 13.1 Purpose

Unit testing dilakukan untuk menguji bagian terkecil dari aplikasi secara terisolasi.

Target:

```text id="w1c9kt"
Function

↓

Class / Module

↓

Service Logic

↓

Utility Function
```

---

# 13.2 Unit Testing Scope

Unit testing fokus pada:

* Service layer.
* Utility function.
* Validator.
* Business calculation.

Tidak menguji:

* Database asli.
* External service.
* Browser.

---

# 14. Service Layer Testing

Service adalah bagian paling penting untuk diuji karena berisi business logic.

---

## 14.1 Product Service Test

Test:

### Create Product

Scenario:

```text id="jzq5c1"
Input product valid
```

Expected:

```text id="2t9u8q"
Product created
```

---

### Duplicate Barcode

Input:

```text id="l7sk92"
barcode:
899999999
```

Jika sudah ada:

Expected:

```text id="9s1w7f"
Reject creation
Return conflict error
```

---

### Invalid Price

Input:

```text id="g2z4vp"
price = -1000
```

Expected:

```text id="kw3j4n"
Validation failed
```

---

# 15. Order Service Testing

---

## Create Order

Scenario:

Customer memilih menu.

Input:

```json
{
 "product_id":"uuid",
 "quantity":2
}
```

Expected:

```text
Order created

Status = PENDING
```

---

## Invalid Stock

Scenario:

Product:

```text
Stock = 0
```

Customer:

```text
Order quantity = 1
```

Expected:

```text
Order rejected
```

---

## Order Status Transition

Valid:

```text
PENDING

↓

PROCESSING

↓

READY

↓

COMPLETED
```

---

Invalid:

```text
PENDING

↓

COMPLETED
```

Expected:

```text
Rejected
```

---

# 16. Payment Service Testing

---

## Cash Payment

Input:

```text
Total:

50000


Paid:

100000
```

Expected:

```text
Change:

50000
```

---

## Insufficient Payment

Input:

```text
Total:

50000


Paid:

20000
```

Expected:

```text
Payment rejected
```

---

## Duplicate Payment

Scenario:

Transaction:

```text
PAID
```

Attempt:

```text
Pay again
```

Expected:

```text
Rejected
```

---

# 17. Inventory Service Testing

---

## Stock Reduction

Before:

```text
Stock = 10
```

Transaction:

```text
Quantity = 3
```

Expected:

```text
Stock = 7
```

---

## Negative Stock Prevention

Before:

```text
Stock = 2
```

Purchase:

```text
Quantity = 5
```

Expected:

```text
Transaction rejected
```

---

# 18. Utility Testing

Utility yang harus diuji:

---

# Phone Normalizer

Input:

```text
08123456789
```

Expected:

```text
628123456789
```

---

Input:

```text
+628123456789
```

Expected:

```text
628123456789
```

---

# Currency Formatter

Input:

```text
10000
```

Expected:

```text
Rp10.000
```

---

# Date Formatter

Input:

```text
Database timestamp
```

Expected:

```text
Readable date
```

---

# 19. Validator Testing

Validator menguji input sebelum masuk service.

---

## Product Validator

Test:

| Input             | Expected |
| ----------------- | -------- |
| Empty name        | Reject   |
| Negative price    | Reject   |
| Duplicate barcode | Reject   |
| Valid product     | Accept   |

---

## User Validator

Test:

| Input          | Expected |
| -------------- | -------- |
| Empty username | Reject   |
| Weak password  | Reject   |
| Invalid role   | Reject   |

---

# 20. Integration Testing Strategy

Integration testing menguji hubungan antar komponen.

---

Target:

```text
API

↓

Controller

↓

Service

↓

Repository

↓

Database
```

---

# 21. Authentication Integration Test

---

## Login Success

Flow:

```text
POST /auth/login

↓

Validate user

↓

Compare password

↓

Create session

↓

Return user data
```

Expected:

```json
{
"success":true
}
```

---

## Wrong Password

Input:

```text
username valid

password wrong
```

Expected:

```text
401 Unauthorized
```

---

## Session Validation

Request:

```text
GET /auth/me
```

Tanpa session.

Expected:

```text
401 Unauthorized
```

---

# 22. Product API Integration Test

---

## Create Product

Endpoint:

```http
POST /api/products
```

Input:

```json
{
"name":"Nasi Goreng",
"price":20000,
"barcode":"899123456"
}
```

Expected:

```text
201 Created
```

---

## Get Product

Endpoint:

```http
GET /api/products
```

Expected:

```json
{
"success":true,
"data":[]
}
```

---

## Delete Product

Expected:

```text
Soft delete applied
```

Database:

```sql
deleted_at IS NOT NULL
```

---

# 23. Customer Order Integration Test

Flow:

```text
Customer Scan QR

↓

Guest Login

↓

Browse Product

↓

Create Order

↓

Cashier Receive
```

---

Test:

## Existing Customer

Input:

```text
Phone:

08123456789
```

Database:

```text
628123456789 exists
```

Expected:

```text
Use existing customer
```

---

## New Customer

Input:

```text
Phone not found
```

Expected:

```text
Create customer
```

---

# 24. Transaction Integration Test

Flow:

```text
Order

↓

Transaction

↓

Payment

↓

Inventory
```

---

Test:

Order:

```text
2 Coffee

2 Sandwich
```

Expected:

Transaction:

```text
4 items

Correct total
```

---

# 25. API Testing Strategy

API testing dilakukan menggunakan Postman.

---

# 25.1 Authentication API

Test:

| Endpoint     | Method | Test    |
| ------------ | ------ | ------- |
| /auth/login  | POST   | Login   |
| /auth/logout | POST   | Logout  |
| /auth/me     | GET    | Session |

---

# 25.2 Product API

| Endpoint      | Method | Test   |
| ------------- | ------ | ------ |
| /products     | GET    | List   |
| /products     | POST   | Create |
| /products/:id | PUT    | Update |
| /products/:id | DELETE | Delete |

---

# 25.3 Order API

| Endpoint           | Method | Test          |
| ------------------ | ------ | ------------- |
| /orders            | POST   | Create        |
| /orders            | GET    | List          |
| /orders/:id        | GET    | Detail        |
| /orders/:id/status | PATCH  | Update status |

---

# 25.4 Transaction API

| Endpoint          | Method | Test   |
| ----------------- | ------ | ------ |
| /transactions     | POST   | Create |
| /transactions/:id | GET    | Detail |

---

# 25.5 Payment API

| Endpoint      | Method | Test           |
| ------------- | ------ | -------------- |
| /payments     | POST   | Create payment |
| /payments/:id | GET    | Status         |

---

# 26. API Response Testing

Setiap response harus dicek:

---

Success:

```json
{
"success":true,
"message":"Success",
"data":{}
}
```

Check:

```text
Status code

Response format

Data accuracy
```

---

Error:

```json
{
"success":false,
"message":"Error"
}
```

Check:

```text
Correct error code

No sensitive information leaked
```

---

# 27. Database Testing Strategy

Database testing memastikan:

* Data integrity.
* Constraint berjalan.
* Relasi benar.

---

# 28. Schema Testing

Check:

## Primary Key

Semua tabel:

```sql
id UUID PRIMARY KEY
```

---

## Foreign Key

Contoh:

```sql
orders.customer_id

REFERENCES customers(id)
```

---

Test:

Delete customer.

Expected:

```text
Rejected
```

atau:

```text
Cascade sesuai aturan
```

---

# 29. Constraint Testing

---

## Unique Constraint

Test:

Insert duplicate barcode.

Expected:

```text
Database reject
```

---

## Check Constraint

Test:

```sql
price=-1000
```

Expected:

```text
Rejected
```

---

## Not Null

Test:

```sql
name=NULL
```

Expected:

```text
Rejected
```

---

# 30. Transaction Database Testing

Test:

Payment berhasil.

Check:

Database:

```text
transactions

payments

inventory_history
```

Harus berubah secara konsisten.

---

Jika payment gagal:

Tidak boleh:

```text
Transaction created

Stock reduced
```

---

# 31. Database Backup Testing

Test:

Create backup:

```bash
pg_dump
```

Restore:

```bash
pg_restore
```

Expected:

Database kembali normal.

---

# 32. Security Testing Strategy

## 32.1 Purpose

Security testing dilakukan untuk memastikan aplikasi:

* Melindungi data user.
* Mencegah akses tidak sah.
* Menolak input berbahaya.
* Menjaga integritas transaksi.

---

# 33. Security Testing Scope

Security testing mencakup:

```text
Authentication

↓

Authorization

↓

Input Validation

↓

Database Security

↓

Session Security

↓

Application Security
```

---

# 34. Authentication Security Testing

---

# AUTH-SEC-001 — Brute Force Protection

## Scenario

User mencoba login berkali-kali dengan password salah.

---

Input:

```text
username:
admin

password:
wrong_password
```

Percobaan:

```text
5+ kali
```

---

Expected:

```text
Request dibatasi

Account/session protection aktif
```

---

Check:

```text
Rate limiter bekerja

Tidak ada server crash
```

---

# AUTH-SEC-002 — Password Storage Testing

## Scenario

Memeriksa database user.

---

Expected:

Password tidak boleh:

```text
plaintext
```

---

Database:

Salah:

```text
password123
```

---

Benar:

```text
$2b$12$....
```

---

# AUTH-SEC-003 — Session Security

Test:

Session cookie harus memiliki:

```text
httpOnly

sameSite

secure (production)
```

---

Expected:

JavaScript browser tidak dapat membaca session cookie.

---

# 35. Authorization Security Testing

---

# AUTHZ-001 — Role Bypass

## Scenario

Cashier mencoba mengakses halaman admin.

---

Request:

```http
GET /api/users
```

Dengan role:

```text
CASHIER
```

---

Expected:

```http
403 Forbidden
```

---

# AUTHZ-002 — Direct API Access

Scenario:

User membuka endpoint admin langsung.

Contoh:

```text
/api/admin/settings
```

tanpa permission.

---

Expected:

```text
Access denied
```

---

# 36. Input Validation Security Testing

---

# INPUT-001 — SQL Injection Test

Payload:

```sql
' OR 1=1 --
```

---

Target:

Login:

```text
username
```

---

Expected:

```text
Login gagal

Database aman
```

---

# INPUT-002 — XSS Testing

Input:

```html
<script>alert('xss')</script>
```

---

Target:

```text
Customer name

Product name
```

---

Expected:

```text
Script tidak dijalankan

Input disimpan aman
```

---

# INPUT-003 — Invalid Data Testing

Input:

Product:

```json
{
"name":"",
"price":-5000
}
```

---

Expected:

```text
Validation error
```

---

# 37. File Upload Security Testing

(Future enhancement jika terdapat upload gambar produk)

---

Test:

Upload:

```text
.exe

.js

malicious file
```

---

Expected:

```text
Rejected
```

---

Allowed:

```text
jpg

png

webp
```

---

# 38. Database Security Testing

---

# DB-001 — SQL Injection Prevention

Check:

Semua query menggunakan:

```javascript
parameterized query
```

---

Tidak boleh:

```javascript
`${input}`
```

dalam query.

---

# DB-002 — Data Integrity

Test:

Menghapus data yang masih digunakan.

Contoh:

Product memiliki transaksi.

Attempt:

```sql
DELETE product
```

---

Expected:

```text
Rejected

atau

Soft delete
```

---

# DB-003 — Negative Stock Prevention

Attempt:

```sql
UPDATE inventory

SET stock=-10
```

---

Expected:

```text
Constraint gagal
```

---

# 39. Security Checklist

Sebelum release:

```text
✓ Password menggunakan bcrypt

✓ Session aman

✓ Rate limiter aktif

✓ Helmet aktif

✓ CSP aktif

✓ SQL injection dicegah

✓ XSS dicegah

✓ Input divalidasi

✓ RBAC berjalan

✓ Sensitive data tidak muncul di response
```

---

# 40. Performance Testing Strategy

## 40.1 Purpose

Performance testing memastikan aplikasi tetap responsif.

---

# 41. Performance Testing Scope

Meliputi:

```text
API Response Time

↓

Database Query

↓

Frontend Loading

↓

Concurrent User
```

---

# 42. API Response Testing

Target:

Response API:

```text
< 500ms
```

untuk operasi normal.

---

Contoh:

```http
GET /products
```

Expected:

```text
Response < 500ms
```

---

# 43. Database Performance Testing

Check:

Query:

```sql
SELECT products
```

---

Harus menggunakan:

```text
Index

Proper WHERE condition

Limit pagination
```

---

Contoh:

Buruk:

```sql
SELECT *
FROM products;
```

---

Lebih baik:

```sql
SELECT *
FROM products
LIMIT 20;
```

---

# 44. Load Testing

Tujuan:

Mengetahui batas aplikasi.

---

Scenario:

```text
100 customer membuka menu

50 cashier melakukan transaksi

10 admin membuka dashboard
```

---

Expected:

```text
Application tetap berjalan

Tidak crash

Error rate rendah
```

---

# 45. Stress Testing

Testing ketika sistem menerima beban tinggi.

---

Scenario:

```text
大量 request

Database connection penuh

```

---

Expected:

```text
Graceful error

Tidak kehilangan data
```

---

# 46. User Acceptance Testing (UAT)

## 46.1 Purpose

Memastikan aplikasi sesuai kebutuhan pengguna.

---

User:

```text
Administrator

Cashier

Customer

Supplier
```

---

# 47. Admin UAT Scenario

---

## ADMIN-001 — Manage Product

Flow:

```text
Login Admin

↓

Tambah produk

↓

Edit produk

↓

Hapus produk
```

Expected:

```text
Produk berhasil dikelola
```

---

## ADMIN-002 — View Report

Flow:

```text
Open dashboard

↓

View sales

↓

Export report
```

Expected:

```text
Data benar
```

---

# 48. Cashier UAT Scenario

---

## CASHIER-001 — Process Customer Order

Flow:

```text
Login cashier

↓

Receive order

↓

Process order

↓

Checkout
```

Expected:

```text
Transaction created
```

---

## CASHIER-002 — Payment

Flow:

```text
Select payment

↓

Confirm payment

↓

Print receipt
```

Expected:

```text
Payment success
```

---

# 49. Customer UAT Scenario

---

## CUSTOMER-001 — QR Table Login

Flow:

```text
Scan QR

↓

Input phone

↓

Open menu
```

Expected:

```text
Customer dashboard displayed
```

---

## CUSTOMER-002 — Create Order

Flow:

```text
Choose menu

↓

Add cart

↓

Submit order
```

Expected:

```text
Order created
```

---

# 50. End-to-End Testing Scenario

Testing seluruh bisnis flow.

---

Scenario:

```text
Customer datang

↓

Scan QR Table

↓

Guest login

↓

Pesan makanan

↓

Kasir menerima order

↓

Kitchen memproses

↓

Order selesai

↓

Kasir melakukan pembayaran

↓

Inventory berkurang

↓

Report bertambah
```

---

Expected:

Semua sistem sinkron.

---

# 51. Final QA Checklist

---

# Documentation

```text
✓ PRD selesai

✓ Architecture selesai

✓ ERD selesai

✓ API Spec selesai

✓ Development Plan selesai

✓ Coding Standard selesai

✓ Test Plan selesai
```

---

# Backend

```text
✓ API berjalan

✓ Error handling aktif

✓ Validation aktif

✓ Logging aktif

✓ Security middleware aktif
```

---

# Database

```text
✓ Schema valid

✓ Constraint aktif

✓ Index dibuat

✓ Backup berhasil
```

---

# Frontend

```text
✓ Responsive

✓ Tidak ada console error

✓ Semua flow berjalan
```

---

# Business Flow

```text
✓ Login

✓ Product management

✓ Customer order

✓ Transaction

✓ Payment

✓ Inventory update

✓ Reporting
```

---

# Security

```text
✓ SQL Injection test passed

✓ XSS test passed

✓ Authorization test passed

✓ Session test passed
```

---

# 52. Release Criteria

Project dapat dianggap selesai jika:

```text
ALL Critical Test = PASS

AND

No High Severity Bug

AND

Documentation Complete
```

---

# 53. Final Project Status Definition

## Alpha Version

Fitur utama selesai:

```text
Authentication

Product

Order

Transaction
```

---

## Beta Version

Tambahan:

```text
Payment

Inventory

Report

Security Testing
```

---

## Release Version

Memenuhi:

```text
All Requirement

All Documentation

All Testing
```

---

# 54. Future Testing Improvement

Jika project berkembang:

Tambahkan:

## Automated CI/CD Testing

Menggunakan:

```text
GitHub Actions
```

---

## Automated API Test

Menggunakan:

```text
Jest

Supertest
```

---

## Security Scanner

Menggunakan:

```text
OWASP ZAP
```

---

## Performance Test

Menggunakan:

```text
k6

Apache JMeter
```

---

# END OF `07-TEST_PLAN.md` ✅

---

Dengan selesainya:

```
docs/

01-PRD.md              ✅
02-ARCHITECTURE.md     ✅
03-ERD.md              ✅
04-API_SPEC.md         ✅
05-DEVELOPMENT_PLAN.md ✅
06-CODING_STANDARD.md  ✅
07-TEST_PLAN.md        ✅
```

