# Product Requirements Document (PRD)

**Project Name:** POS Restaurant Management System

**Version:** 1.0.0

**Document Status:** Draft

**Document Type:** Product Requirements Document

**Development Methodology:** Incremental Development

**Prepared By:** Afhwan Rez & ChatGPT

**Last Updated:** July 2026

---

# Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | July 2026 | Initial PRD |

---

# Table of Contents

1. Executive Summary
2. Product Vision
3. Background
4. Business Objectives
5. Project Scope
6. Out of Scope
7. Stakeholders
8. User Roles
9. Product Overview
10. Technology Stack
11. High Level System Architecture
12. Success Metrics

---

# 1. Executive Summary

POS Restaurant Management System merupakan aplikasi Point of Sale (POS) berbasis web yang dirancang untuk membantu operasional restoran, cafe, maupun usaha kuliner skala kecil hingga menengah.

Aplikasi ini tidak hanya berfungsi sebagai sistem kasir, tetapi juga menyediakan fitur manajemen produk, pelanggan, supplier, inventaris, transaksi, pelaporan, barcode scanning, QR Table, serta dashboard berbeda sesuai hak akses pengguna.

Project ini dikembangkan menggunakan teknologi web modern yang ringan tanpa frontend framework agar mudah dipelajari, mudah dipelihara, dan memenuhi kebutuhan akademik sekaligus dapat dijadikan portfolio software engineering.

---

# 2. Product Vision

Membangun sistem Point of Sale modern yang:

- Cepat
- Ringan
- Aman
- Mudah digunakan
- Modular
- Mudah dikembangkan
- Memiliki arsitektur profesional
- Mengikuti praktik pengembangan perangkat lunak modern

Produk akhir diharapkan dapat digunakan sebagai:

- Project akademik
- Portfolio
- Dasar pengembangan POS skala produksi

---

# 3. Background

Sebagian besar aplikasi kasir sederhana hanya mampu menghitung total pembayaran.

Sistem yang akan dikembangkan pada project ini memiliki cakupan yang lebih luas, yaitu:

- Authentication
- Authorization
- Inventory Management
- Customer Management
- Supplier Management
- Transaction Management
- Order Management
- Reporting
- Barcode Scanner
- QR Table
- Dummy Payment
- Audit Logging
- Stock History

Walaupun memiliki banyak fitur, sistem tetap mengutamakan performa, kesederhanaan antarmuka, dan kemudahan penggunaan.

---

# 4. Business Objectives

## Objective 1

Membangun aplikasi POS yang memenuhi seluruh requirement project.

---

## Objective 2

Mengimplementasikan arsitektur software yang profesional.

---

## Objective 3

Menggunakan PostgreSQL sebagai Database Management System.

---

## Objective 4

Menerapkan konsep REST API.

---

## Objective 5

Menerapkan keamanan aplikasi dasar yang sesuai dengan praktik terbaik.

---

## Objective 6

Menghasilkan source code yang bersih, modular, dan mudah dikembangkan.

---

# 5. Project Scope

Versi pertama aplikasi mencakup fitur berikut.

## Authentication

- Login
- Logout
- Session
- Role Based Access

---

## Dashboard

- Dashboard Admin
- Dashboard Kasir
- Dashboard Customer
- Dashboard Supplier

---

## Product

- CRUD Product
- CRUD Category
- Barcode
- Stock

---

## Customer

- Login Guest
- Customer Profile
- Customer Session
- Customer History

---

## Supplier

- CRUD Supplier
- Purchase History

---

## Table

- QR Table
- Table Status

---

## Order

- Create Order
- Update Status
- Cancel Order
- History

---

## Transaction

- Checkout
- Payment
- Receipt
- History

---

## Report

- Daily Report
- Weekly Report
- Monthly Report
- Export PDF
- Export Excel

---

## Inventory

- Stock Update
- Stock History
- Low Stock Warning

---

## Security

- Authentication
- Authorization
- Password Hashing
- Session Management
- Audit Log

---

# 6. Out of Scope

Versi pertama TIDAK mencakup:

- Online Payment Gateway
- Midtrans
- Xendit
- Payment API
- Email Notification
- WhatsApp Notification
- Loyalty Point
- Membership
- Kitchen Display System
- Multi Branch
- Mobile Application
- AI Recommendation
- Cloud Deployment
- Online Ordering

Semua metode pembayaran digital merupakan simulasi (Dummy).

---

# 7. Stakeholders

## Owner

Pemilik restoran.

Memiliki akses penuh terhadap seluruh sistem.

---

## Administrator

Mengelola seluruh data sistem.

---

## Cashier

Melakukan transaksi.

---

## Customer

Melakukan pemesanan makanan.

---

## Supplier

Mengelola data supplier.

---

# 8. User Roles

## 8.1 Administrator

Administrator merupakan role tertinggi.

Administrator memiliki hak akses terhadap seluruh sistem.

Hak akses:

- Dashboard
- User Management
- Product Management
- Category Management
- Supplier Management
- Customer Management
- Table Management
- Reporting
- Inventory
- Audit Log
- Setting

---

## 8.2 Cashier

Kasir bertugas menjalankan operasional penjualan.

Hak akses:

- Login
- Dashboard
- Search Product
- Barcode Scanner
- Cart
- Checkout
- Payment
- Receipt
- Update Order Status

Kasir tidak memiliki hak akses terhadap:

- User Management
- Setting
- Audit Log
- Supplier Management

---

## 8.3 Customer

Customer menggunakan sistem sebagai Guest.

Customer tidak memiliki password.

Customer hanya mengisi:

- Nama
- Nomor Telepon

Nomor telepon menjadi identitas utama customer.

Nomor telepon harus unik.

Sistem melakukan normalisasi nomor telepon sebelum pencarian data.

Contoh:

08123456789

↓

628123456789

Jika nomor telepon ditemukan:

- gunakan profile customer lama
- abaikan nama yang baru dimasukkan

Jika nomor telepon belum ditemukan:

- buat profile customer baru

Customer dapat:

- Melihat Menu
- Membuat Order
- Melihat Status Order
- Melihat Riwayat Order

---

## 8.4 Supplier

Supplier memiliki dashboard sendiri.

Hak akses:

- Login
- Melihat Purchase Order
- Mengelola Informasi Supplier
- Melihat Riwayat Pengiriman

---

# 9. Product Overview

## Dashboard Admin

Dashboard Admin menyediakan informasi bisnis secara menyeluruh.

Fitur:

- Ringkasan Penjualan
- Pendapatan Hari Ini
- Pendapatan Mingguan
- Pendapatan Bulanan
- Produk Terlaris
- Produk Stok Menipis
- Grafik Penjualan
- Customer Hari Ini
- Audit Log Ringkas

---

## Dashboard Cashier

Dashboard Kasir merupakan pusat transaksi.

Fitur:

- Search Product
- Barcode Scanner
- Product List
- Shopping Cart
- Discount
- Tax
- Payment
- Receipt Preview
- Print Receipt

---

## Dashboard Customer

Dashboard Customer digunakan setelah login tamu.

Fitur:

- Menu
- Order
- Cart
- Order History
- Order Status

---

## Dashboard Supplier

Dashboard Supplier digunakan untuk mengelola hubungan pemasok.

Fitur:

- Purchase History
- Supplier Information

---

# 10. Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript (Vanilla)

---

## Backend

- Node.js
- Express.js

---

## Database

- PostgreSQL

---

## Authentication

- express-session
- bcrypt

---

## Libraries

- Chart.js
- SheetJS
- jsPDF
- html2pdf
- html5-qrcode
- QuaggaJS (fallback jika BarcodeDetector API tidak tersedia)

---

## Development Tools

- Visual Studio Code
- PostgreSQL
- pgAdmin
- Git
- GitHub
- Postman

---

# 11. High Level System Architecture

Client Browser

↓

Frontend

↓

REST API

↓

Authentication Middleware

↓

Authorization Middleware

↓

Controllers

↓

Services

↓

Repositories

↓

PostgreSQL

Seluruh komunikasi database hanya dilakukan melalui Repository Layer.

Frontend tidak boleh mengakses database secara langsung.

---

# 12. Success Metrics

Project dianggap berhasil apabila:

- Seluruh requirement guru terpenuhi.
- Seluruh dashboard dapat digunakan.
- Login seluruh role berjalan.
- Customer lama tidak membuat profile baru.
- Barcode scanner berfungsi.
- QR Table berfungsi.
- Dummy Payment berjalan.
- Laporan dapat dibuat.
- Export PDF berhasil.
- Export Excel berhasil.
- Seluruh transaksi tersimpan ke PostgreSQL.
- Stock berkurang otomatis.
- Audit Log berjalan.
- Riwayat customer tersimpan.
- Source code bersih dan modular.
- Seluruh fitur dapat berjalan secara lokal tanpa error.

---

# ============================================================
# 13. Business Rules
# ============================================================

Business Rules merupakan aturan utama yang wajib dipatuhi oleh seluruh sistem.

Seluruh proses pada backend harus mengikuti aturan berikut.

---

## BR-001 Authentication

Seluruh pengguna wajib login sebelum mengakses dashboard.

Kecuali:

- Halaman Login
- Halaman Customer Login (Guest)

---

## BR-002 Role Based Access

Setiap role hanya boleh mengakses dashboard miliknya.

Administrator
→ Dashboard Admin

Cashier
→ Dashboard Kasir

Supplier
→ Dashboard Supplier

Customer
→ Dashboard Customer

Akses dashboard milik role lain harus ditolak dengan HTTP 403 Forbidden.

---

## BR-003 Customer Identity

Identitas customer ditentukan berdasarkan:

Nomor Telepon

Bukan berdasarkan nama.

Nomor telepon harus UNIQUE.

---

## BR-004 Phone Normalization

Sebelum pencarian database dilakukan,
nomor telepon wajib dinormalisasi.

Contoh:

08123456789

↓

628123456789

Semua nomor disimpan dalam format:

62xxxxxxxxxx

---

## BR-005 Existing Customer

Jika nomor telepon ditemukan:

- gunakan customer lama
- gunakan nama lama
- abaikan nama baru

Tidak boleh membuat customer baru.

---

## BR-006 New Customer

Jika nomor telepon belum ditemukan:

buat customer baru.

---

## BR-007 Customer Session

Setiap customer yang login harus memiliki Session.

Session berisi:

- customer_id
- table_id
- login_time
- status

---

## BR-008 Product Stock

Stok produk tidak boleh bernilai negatif.

---

## BR-009 Stock Update

Setelah transaksi selesai:

stok otomatis berkurang.

---

## BR-010 Stock History

Setiap perubahan stok wajib tercatat.

Misalnya:

+50 Pembelian

-2 Penjualan

-1 Koreksi

+5 Retur

---

## BR-011 Order Creation

Order dibuat oleh Customer.

Order BELUM dianggap transaksi.

---

## BR-012 Transaction Creation

Transaction hanya dibuat ketika pembayaran selesai.

---

## BR-013 Payment

Metode pembayaran:

- Cash
- QRIS (Dummy)
- Debit (Dummy)
- Transfer (Dummy)

---

## BR-014 Dummy Payment

Untuk QRIS

Debit

Transfer

tidak menggunakan payment gateway.

Kasir hanya menekan tombol

"Lanjutkan"

untuk menyelesaikan pembayaran.

---

## BR-015 Order Status

Status order:

Pending

↓

Processing

↓

Ready

↓

Completed

↓

Cancelled

Status tidak boleh melompat.

Contoh:

Pending

↓

Completed

(TIDAK BOLEH)

---

## BR-016 Invoice

Invoice dibuat otomatis.

Format:

INV-YYYYMMDD-000001

Nomor invoice tidak boleh sama.

---

## BR-017 Barcode

Setiap produk wajib memiliki barcode unik.

---

## BR-018 Delete Data

Data penting tidak boleh langsung dihapus.

Gunakan Soft Delete.

---

## BR-019 Audit Log

Seluruh aktivitas penting wajib dicatat.

---

## BR-020 Session Timeout

Session user akan berakhir setelah periode tidak aktif yang ditentukan.

---

# ============================================================
# 14. Functional Requirements
# ============================================================

Seluruh Functional Requirement menggunakan format:

FR-XXX

---

# Authentication Module

---

FR-001

Sistem menyediakan halaman login.

---

FR-002

User dapat login menggunakan:

Username

Password

---

FR-003

Password disimpan menggunakan bcrypt.

---

FR-004

Sistem membuat session.

---

FR-005

Session disimpan menggunakan Express Session.

---

FR-006

Logout menghapus Session.

---

FR-007

Redirect dashboard berdasarkan Role.

---

FR-008

Login gagal menampilkan pesan error.

---

FR-009

Maksimal 5 percobaan login.

---

FR-010

Setelah 5 kali gagal

akun dikunci sementara.

---

# Customer Login Module

---

FR-011

Customer login tanpa password.

---

FR-012

Customer mengisi:

Nama

Nomor Telepon

---

FR-013

Nomor telepon divalidasi.

---

FR-014

Nomor telepon dinormalisasi.

---

FR-015

Nomor dicari ke PostgreSQL.

---

FR-016

Jika ditemukan

gunakan customer lama.

---

FR-017

Nama lama tetap digunakan.

---

FR-018

Jika tidak ditemukan

buat customer baru.

---

FR-019

Customer Session dibuat otomatis.

---

FR-020

Customer diarahkan ke Dashboard Customer.

---

# Product Module

---

FR-021

Admin dapat menambah produk.

---

FR-022

Admin dapat mengubah produk.

---

FR-023

Admin dapat menghapus produk.

---

FR-024

Produk memiliki:

Nama

Kategori

Harga

Barcode

Stok

Supplier

Status

---

FR-025

Barcode wajib unik.

---

FR-026

Harga harus lebih besar dari nol.

---

FR-027

Stok tidak boleh negatif.

---

FR-028

Admin dapat mencari produk.

---

FR-029

Admin dapat memfilter produk.

---

FR-030

Admin dapat melihat stok menipis.

---

FR-031

Soft Delete digunakan.

---

FR-032

Perubahan produk dicatat ke Audit Log.

---

# Category Module

---

FR-033

CRUD Category.

---

FR-034

Kategori dapat digunakan banyak produk.

---

# Supplier Module

---

FR-035

CRUD Supplier.

---

FR-036

Supplier memiliki:

Nama

Alamat

Kontak

Telepon

Email (Opsional)

---

FR-037

Supplier dapat login.

---

FR-038

Supplier melihat Purchase History.

---

# Customer Module

---

FR-039

Admin dapat melihat seluruh customer.

---

FR-040

Admin dapat mencari customer.

---

FR-041

Riwayat customer dapat dilihat.

---

FR-042

Customer tidak dapat dihapus permanen.

---

FR-043

Nomor telepon wajib unik.

---

FR-044

Customer memiliki histori order.

---

FR-045

Customer memiliki histori transaksi.

---

# Table Module

---

FR-046

Admin dapat CRUD meja.

---

FR-047

Setiap meja memiliki QR Code.

---

FR-048

QR Code mengarah ke halaman login customer.

---

FR-049

Status meja:

Kosong

Digunakan

Reserved

Cleaning

---

FR-050

Status meja berubah otomatis berdasarkan sesi customer.

---

# ============================================================
# 15. Dashboard Specification
# ============================================================

Seluruh dashboard menggunakan konsep:

Role Based Access Control (RBAC)

Setiap role hanya dapat mengakses dashboard sesuai hak aksesnya.

Dashboard lain harus mengembalikan HTTP 403 Forbidden.

---

# 15.1 Dashboard Administrator

Dashboard Administrator merupakan pusat kontrol seluruh sistem.

Administrator memiliki akses penuh terhadap seluruh modul.

## Menu

Dashboard

Products

Categories

Suppliers

Customers

Tables

Orders

Transactions

Reports

Inventory

Audit Log

Settings

Logout

---

## Dashboard Widgets

Dashboard harus menampilkan:

Total Revenue Today

Total Revenue This Week

Total Revenue This Month

Total Orders Today

Total Active Customers

Total Products

Low Stock Products

Recent Transactions

Recent Orders

Top Selling Products

Sales Chart

---

## Dashboard Actions

Administrator dapat:

Melihat seluruh data

Mengelola seluruh data

Menghapus data (Soft Delete)

Restore data

Export laporan

Backup database

Melihat Audit Log

---

# 15.2 Dashboard Cashier

Dashboard kasir merupakan pusat transaksi.

Dashboard ini dirancang agar proses checkout dapat dilakukan secepat mungkin.

---

## Layout

Sidebar

Header

Search Product

Barcode Scanner

Product List

Shopping Cart

Payment Panel

Receipt Preview

---

## Menu

Dashboard

New Transaction

Orders

Products

Customers

Logout

---

## Search Product

Kasir dapat mencari produk berdasarkan:

Nama

Barcode

Kategori

---

Pencarian dilakukan secara realtime.

---

## Barcode Scanner

Dashboard harus menyediakan dua mode.

### USB Scanner

Scanner bertindak sebagai Keyboard.

Barcode otomatis masuk ke Search Box.

Produk otomatis masuk Cart.

---

### Camera Scanner

Kasir dapat menekan tombol:

Scan Barcode

Camera aktif.

Barcode dipindai.

Produk otomatis ditambahkan ke Cart.

Apabila barcode tidak ditemukan:

Tampilkan pesan:

"Produk tidak ditemukan."

---

## Shopping Cart

Setiap item menampilkan:

Nama

Harga

Qty

Subtotal

Aksi

---

Aksi:

Tambah Qty

Kurangi Qty

Hapus Item

---

Subtotal berubah otomatis.

---

## Payment Panel

Menampilkan:

Subtotal

Discount

Tax (PPN)

Grand Total

Payment Method

Nominal Payment

Change

---

Metode pembayaran:

Cash

QRIS (Dummy)

Debit (Dummy)

Transfer (Dummy)

---

### Cash

Input nominal.

Hitung kembalian otomatis.

---

### QRIS

Klik QRIS.

Muncul QR Dummy.

Status:

Waiting Payment

Kasir menunggu konfirmasi.

Klik:

Continue Payment

↓

Transaksi selesai.

---

### Debit

Klik Debit.

Muncul dialog:

Silakan lakukan pembayaran menggunakan mesin EDC.

↓

Continue Payment

↓

Transaksi selesai.

---

### Transfer

Klik Transfer.

Muncul dialog:

Silakan lakukan transfer.

↓

Continue Payment

↓

Transaksi selesai.

---

## Receipt

Kasir dapat:

Preview Receipt

Print Receipt

Download PDF

---

# 15.3 Dashboard Customer

Customer masuk melalui QR Code meja.

Customer tidak memiliki password.

---

## Login

Input:

Nama

Nomor Telepon

---

Backend melakukan:

Normalisasi nomor.

Cari database.

Jika ditemukan:

Gunakan customer lama.

Jika tidak:

Buat customer baru.

---

## Menu

Home

Menu

Cart

Orders

History

Profile

Logout

---

## Home

Menampilkan:

Nomor Meja

Status Meja

Jumlah Order Aktif

---

## Menu

Daftar makanan.

Kategori.

Search.

Filter.

---

## Product Detail

Customer dapat melihat:

Nama

Harga

Foto

Deskripsi

Status

---

## Cart

Customer dapat:

Tambah Qty

Kurangi Qty

Hapus Item

Tambah Catatan

---

## Checkout

Checkout menghasilkan:

Order

Bukan Transaction.

---

## Order Status

Status:

Pending

Processing

Ready

Completed

Cancelled

Customer dapat melihat perubahan status secara realtime.

Polling dilakukan setiap 5 detik.

---

## History

Riwayat berdasarkan:

customer_id

Bukan Nama.

---

History menampilkan:

Invoice

Tanggal

Total

Status

Payment Method

---

# 15.4 Dashboard Supplier

Supplier memiliki dashboard sederhana.

---

Menu

Dashboard

Purchase History

Company Profile

Logout

---

Supplier hanya dapat melihat data miliknya sendiri.

---

# ============================================================
# 16. Order Management
# ============================================================

Order dipisahkan dari Transaction.

Order dibuat Customer.

Transaction dibuat Kasir.

---

## Order Lifecycle

Pending

↓

Processing

↓

Ready

↓

Completed

atau

Cancelled

---

Status tidak boleh melompat.

---

## Order Detail

Order memiliki:

Order Number

Customer

Table

Items

Total

Status

Created Time

Updated Time

---

## Order Item

Setiap item memiliki:

Product

Qty

Price

Subtotal

Note

---

## Business Rule

Order yang sudah Completed tidak boleh diedit.

Order yang Cancelled tidak boleh dibayar.

---

# ============================================================
# 17. Cart Management
# ============================================================

Cart bersifat sementara.

Belum tersimpan menjadi transaksi.

---

Customer dapat:

Tambah Item

Kurangi Item

Hapus Item

Tambah Catatan

Kosongkan Cart

---

Kasir dapat:

Edit Qty

Tambah Diskon

Tambah Pajak

Batalkan Checkout

---

# ============================================================
# 18. Transaction Management
# ============================================================

Transaction dibuat setelah pembayaran berhasil.

---

Transaction berisi:

Invoice

Order

Customer

Cashier

Payment Method

Discount

Tax

Grand Total

Payment Time

---

Invoice dibuat otomatis.

Format:

INV-YYYYMMDD-000001

---

Invoice bersifat unik.

Tidak dapat diubah.

---

# ============================================================
# 19. Barcode Scanner
# ============================================================

Produk memiliki barcode unik.

Barcode digunakan untuk:

Pencarian

Checkout

Inventory

---

Metode Scanner

USB

Camera

---

Jika barcode ditemukan:

Produk otomatis masuk Cart.

---

Jika barcode tidak ditemukan:

Tampilkan notifikasi.

---

# ============================================================
# 20. Receipt
# ============================================================

Receipt dapat:

Preview

Print

Download PDF

---

Receipt memuat:

Nama Toko

Alamat

Invoice

Tanggal

Kasir

Customer

Nomor Meja

Daftar Produk

Subtotal

Discount

PPN

Grand Total

Payment Method

Cash Received

Change

Ucapan Terima Kasih

---

# ============================================================
# 21. Reporting
# ============================================================

Laporan tersedia untuk:

Harian

Mingguan

Bulanan

Custom Range

---

Dashboard menampilkan:

Revenue

Orders

Customers

Best Seller

Low Stock

Top Category

---

Export:

PDF

Excel

---

Chart:

Revenue

Orders

Best Selling Product

Payment Method

Customer Growth

---

# ============================================================
# ============================================================
# 22. Inventory Management
# ============================================================

## Overview

Inventory Management bertanggung jawab terhadap seluruh perubahan stok
produk yang terjadi di dalam sistem.

Setiap perubahan stok wajib memiliki histori.

Administrator dapat melihat seluruh histori perubahan stok.

Cashier hanya dapat menyebabkan perubahan stok melalui transaksi.

Customer tidak memiliki akses terhadap Inventory.

---

## Inventory Features

- Current Stock
- Stock History
- Low Stock Alert
- Stock Adjustment
- Incoming Stock
- Outgoing Stock
- Inventory Search
- Inventory Filter

---

## Current Stock

Setiap produk memiliki nilai stok saat ini.

Stok tidak boleh bernilai negatif.

Jika stok mencapai nol,
produk otomatis diberi status:

Out of Stock

Produk tetap muncul di katalog,
namun tidak dapat dipesan.

---

## Low Stock

Administrator dapat menentukan batas minimum stok.

Contoh

Minimum Stock

10

Jika stok

<=10

maka dashboard menampilkan

Low Stock Warning.

---

## Stock Adjustment

Administrator dapat melakukan penyesuaian stok.

Jenis Adjustment

- Correction
- Damaged Item
- Expired Item
- Initial Stock

Semua perubahan wajib masuk ke Stock History.

---

## Stock History

Seluruh perubahan stok wajib tercatat.

Field

Date

Product

Previous Stock

Current Stock

Difference

Reason

Performed By

Reference

---

Contoh

+20

Incoming Stock

-5

Transaction

-2

Damaged

+10

Correction

---

## Incoming Stock

Incoming Stock berasal dari Supplier.

Incoming Stock akan:

Menambah Current Stock

Menambah Stock History

Menambah Purchase History

---

## Outgoing Stock

Outgoing Stock berasal dari:

Transaction

Damage

Expired Product

Manual Adjustment

---

## Business Rules

Stok tidak boleh negatif.

Seluruh perubahan stok harus masuk Stock History.

Stock History tidak dapat diedit.

Stock History tidak dapat dihapus.

---

# ============================================================
# 23. QR Table Management
# ============================================================

## Overview

Setiap meja memiliki QR Code unik.

QR digunakan customer
untuk login sebagai Guest.

QR Code bukan digunakan untuk pembayaran.

---

## QR Code Flow

Customer

↓

Scan QR

↓

Halaman Login Customer

↓

Input

Nama

Nomor Telepon

↓

Dashboard Customer

---

## Table Status

Setiap meja memiliki status.

Available

Occupied

Reserved

Cleaning

Maintenance

---

Status berubah otomatis.

Contoh

Customer Login

↓

Occupied

Customer Logout

↓

Available

---

## Table Information

Setiap meja memiliki

ID

Nomor

QR Code

Status

Capacity

Description

---

## Business Rules

QR Code bersifat unik.

Nomor meja tidak boleh sama.

Satu meja hanya boleh memiliki
satu Customer Session aktif.

---

# ============================================================
# 24. Payment Module
# ============================================================

## Overview

Payment dilakukan oleh Cashier.

Customer tidak melakukan pembayaran langsung.

---

## Payment Methods

Cash

QRIS (Dummy)

Debit (Dummy)

Transfer (Dummy)

---

## Cash

Cashier memasukkan nominal uang.

Sistem menghitung:

Subtotal

Tax

Discount

Grand Total

Change

---

## QRIS Dummy

Flow

Pilih QRIS

↓

Generate QR Dummy

↓

Status

Waiting Payment

↓

Cashier mengkonfirmasi

↓

Klik Continue

↓

Payment Success

↓

Transaction dibuat

---

## Debit Dummy

Flow

Debit

↓

Dialog

Silakan lakukan pembayaran menggunakan mesin EDC.

↓

Continue

↓

Success

---

## Transfer Dummy

Flow

Transfer

↓

Dialog

Silakan lakukan transfer.

↓

Continue

↓

Success

---

## Business Rules

Transaction dibuat setelah payment success.

Payment tidak dapat dibatalkan
setelah receipt dicetak.

Payment Method tidak dapat diubah
setelah transaction selesai.

---

# ============================================================
# 25. Barcode Module
# ============================================================

## Overview

Seluruh produk memiliki barcode unik.

Barcode digunakan untuk:

Search

Checkout

Inventory

---

## Barcode Sources

USB Barcode Scanner

Camera Scanner

Manual Input

---

## USB Scanner

Scanner bekerja seperti keyboard.

Barcode langsung masuk ke Search Box.

Produk otomatis ditemukan.

---

## Camera Scanner

Browser membuka kamera.

Barcode dipindai.

Produk otomatis masuk Cart.

---

## Barcode Not Found

Jika barcode tidak ditemukan.

Sistem menampilkan:

Produk tidak ditemukan.

Tidak ada perubahan pada Cart.

---

## Business Rules

Barcode wajib UNIQUE.

Produk tanpa barcode
tidak dapat dipindai.

---

# ============================================================
# 26. Database Requirements
# ============================================================

Database menggunakan

PostgreSQL.

---

## Database Principles

Normalization

Foreign Key

Primary Key

Unique Constraint

Check Constraint

Index

Soft Delete

Audit Ready

---

## Primary Entity

Users

Roles

Customers

Customer Sessions

Products

Categories

Suppliers

Tables

Orders

Order Items

Transactions

Transaction Items

Payments

Inventory

Inventory History

Audit Logs

Settings

---

## UUID

Seluruh tabel utama menggunakan UUID.

Contoh

customer_id

product_id

order_id

transaction_id

supplier_id

user_id

---

## Constraints

Phone

UNIQUE

Barcode

UNIQUE

Invoice

UNIQUE

Username

UNIQUE

---

## Check Constraint

Price > 0

Qty > 0

Stock >= 0

---

## Index

Phone

Barcode

Invoice

Transaction Date

Order Date

Product Name

Customer Name

---

## Database Transaction

Checkout harus menggunakan PostgreSQL Transaction.

BEGIN

↓

Insert Order

↓

Insert Items

↓

Insert Payment

↓

Update Stock

↓

Insert Stock History

↓

Insert Audit Log

↓

COMMIT

Apabila salah satu gagal.

ROLLBACK

---

## Backup

Administrator dapat membuat backup database.

Restore tidak termasuk versi pertama.

---

# ============================================================
# ============================================================
# 27. Security Requirements
# ============================================================

## Overview

Keamanan merupakan aspek utama dalam pengembangan aplikasi.

Sistem harus menerapkan prinsip Defense in Depth,
yaitu keamanan diterapkan pada setiap lapisan aplikasi.

---

## Authentication

SEC-001

Seluruh password user disimpan menggunakan bcrypt.

---

SEC-002

Password tidak boleh disimpan dalam bentuk plaintext.

---

SEC-003

Customer Guest tidak menggunakan password.

---

SEC-004

Session menggunakan Express Session.

---

SEC-005

Session ID harus dihasilkan secara acak.

---

SEC-006

Logout wajib menghapus session.

---

## Authorization

SEC-007

Semua endpoint harus memeriksa role pengguna.

---

SEC-008

Role yang tidak memiliki izin harus menerima:

HTTP 403 Forbidden

---

SEC-009

Customer tidak dapat mengakses endpoint Admin.

---

SEC-010

Cashier tidak dapat mengubah data User.

---

SEC-011

Supplier hanya dapat melihat data supplier miliknya.

---

## Database Security

SEC-012

Seluruh query menggunakan parameterized query.

Dilarang menggunakan string concatenation.

---

SEC-013

Prepared Statement wajib digunakan.

---

SEC-014

Foreign Key wajib diterapkan.

---

SEC-015

Constraint wajib digunakan.

---

SEC-016

Database credential disimpan di file .env.

---

SEC-017

File .env tidak boleh masuk Git Repository.

---

## Input Validation

SEC-018

Seluruh input wajib divalidasi di backend.

---

SEC-019

Validasi frontend hanya sebagai kenyamanan pengguna.

---

SEC-020

Backend tetap melakukan validasi.

---

SEC-021

Semua input teks dibersihkan dari karakter berbahaya.

---

## HTTP Security

SEC-022

Gunakan Helmet Middleware.

---

SEC-023

Gunakan Content Security Policy (CSP).

---

SEC-024

Sembunyikan header X-Powered-By.

---

## Login Protection

SEC-025

Maksimal 5 kali login gagal.

---

SEC-026

Rate Limiter diterapkan pada endpoint login.

---

## Audit

SEC-027

Aktivitas penting wajib dicatat.

---

SEC-028

Audit Log tidak boleh diedit.

---

SEC-029

Audit Log tidak boleh dihapus.

---

# ============================================================
# 28. Non Functional Requirements
# ============================================================

## Performance

NFR-001

Waktu respon API maksimal 500 ms pada data normal.

---

NFR-002

Pencarian produk maksimal 1 detik.

---

NFR-003

Checkout maksimal 2 detik.

---

## Reliability

NFR-004

Database transaction wajib menggunakan COMMIT dan ROLLBACK.

---

NFR-005

Tidak boleh terjadi data transaksi setengah tersimpan.

---

## Availability

NFR-006

Aplikasi berjalan secara lokal tanpa koneksi internet.

---

## Scalability

NFR-007

Struktur kode harus mendukung penambahan fitur baru.

---

## Maintainability

NFR-008

Layered Architecture wajib digunakan.

Routes

↓

Controllers

↓

Services

↓

Repositories

↓

Database

---

NFR-009

Setiap file memiliki satu tanggung jawab utama (Single Responsibility Principle).

---

## Compatibility

NFR-010

Browser yang didukung:

Google Chrome

Microsoft Edge

Mozilla Firefox

---

# ============================================================
# 29. Validation Rules
# ============================================================

## Customer

Nama

Minimal 2 karakter

Maksimal 50 karakter

---

Nomor Telepon

10–15 digit

Hanya angka

Harus unik setelah normalisasi

---

## Product

Nama

2–100 karakter

---

Harga

> 0

---

Barcode

Unik

---

Stok

>= 0

---

Kategori

Wajib dipilih

---

## Supplier

Nama

Wajib diisi

---

Nomor Telepon

Format valid

---

## Order

Qty

Minimal 1

---

Subtotal

Tidak boleh negatif

---

Grand Total

Tidak boleh negatif

---

# ============================================================
# 30. Error Handling
# ============================================================

Seluruh error menggunakan format JSON yang konsisten.

Contoh:

{
    "success": false,
    "message": "Product not found",
    "code": "PRODUCT_NOT_FOUND"
}

---

Jenis Error

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error

---

Frontend wajib menampilkan toast notification.

Tidak menggunakan alert().

---

# ============================================================
# 31. Logging
# ============================================================

Sistem mencatat:

Login

Logout

Tambah Produk

Edit Produk

Delete Produk

Tambah Supplier

Checkout

Payment

Backup Database

Perubahan Setting

---

Audit Log menyimpan:

Tanggal

User

Role

Action

Target

IP (opsional)

Keterangan

---

# ============================================================
# 32. Coding Standards
# ============================================================

## Naming Convention

camelCase

Variabel

Function

---

PascalCase

Class

---

UPPER_CASE

Constant

---

snake_case

Nama tabel PostgreSQL

---

## Folder Structure

backend/

config/

controllers/

routes/

services/

repositories/

middlewares/

utils/

validators/

models/

uploads/

logs/

frontend/

assets/

pages/

components/

css/

js/

images/

database/

docs/

---

## Code Style

Gunakan async/await.

Tidak menggunakan callback bersarang.

Pisahkan Business Logic dari Controller.

Repository hanya mengakses database.

---

# ============================================================
# 33. Acceptance Criteria
# ============================================================

Project dianggap selesai apabila:

✓ Seluruh halaman dapat diakses.

✓ Login seluruh role berhasil.

✓ Session berjalan.

✓ Customer lama tidak membuat profil baru.

✓ Nomor telepon dinormalisasi.

✓ Produk dapat ditambah.

✓ Produk dapat diedit.

✓ Produk dapat dihapus (Soft Delete).

✓ Barcode dapat dipindai.

✓ Barcode unik.

✓ Customer dapat membuat order.

✓ Kasir dapat checkout.

✓ Pembayaran Cash berjalan.

✓ Pembayaran QRIS Dummy berjalan.

✓ Pembayaran Debit Dummy berjalan.

✓ Pembayaran Transfer Dummy berjalan.

✓ Invoice otomatis dibuat.

✓ Receipt dapat dipreview.

✓ Receipt dapat dicetak.

✓ Receipt dapat diunduh sebagai PDF.

✓ Stok otomatis berkurang.

✓ Stock History tercatat.

✓ Audit Log tercatat.

✓ Laporan harian tersedia.

✓ Laporan mingguan tersedia.

✓ Laporan bulanan tersedia.

✓ Export PDF berhasil.

✓ Export Excel berhasil.

✓ Seluruh data tersimpan di PostgreSQL.

✓ Tidak ada SQL Injection pada query.

✓ Role Based Access Control berjalan.

✓ Soft Delete berjalan.

✓ Error ditangani dengan benar.

✓ Seluruh fitur berjalan di localhost.

---

# ============================================================
# 34. Development Roadmap
# ============================================================

## Phase 1

Project Setup

Git

Express

PostgreSQL

Folder Structure

Authentication

---

## Phase 2

Database

Migration

Seed

Repository Layer

---

## Phase 3

Admin Dashboard

Product

Category

Supplier

Inventory

---

## Phase 4

Customer Dashboard

QR Table

Order

History

---

## Phase 5

Cashier Dashboard

Cart

Payment

Receipt

Barcode

---

## Phase 6

Reporting

Charts

Export PDF

Export Excel

Audit Log

---

## Phase 7

Testing

Bug Fixing

Performance Optimization

Documentation

---

# ============================================================
# 35. Future Enhancement
# ============================================================

Fitur yang direncanakan untuk versi berikutnya:

- Payment Gateway (Midtrans/Xendit)
- WhatsApp Notification
- Email Notification
- Multi Branch
- Loyalty Point
- Membership
- Kitchen Display System (KDS)
- Mobile Application
- Cloud Deployment
- Real-Time Notification (WebSocket)
- AI Sales Analytics
- AI Stock Prediction
- REST API Versioning
- Docker Deployment
- CI/CD Pipeline
- Unit Testing
- Integration Testing

---

# ============================================================
# End of Product Requirements Document
# ============================================================

Version : 1.0.0

Status : Complete

Document State : Approved for Development

