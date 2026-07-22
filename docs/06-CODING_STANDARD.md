# 1. Coding Standard Overview

## 1.1 Purpose

Dokumen ini mendefinisikan standar penulisan kode untuk:

**Restaurant POS Management System**

Tujuan:

* Menjaga kualitas kode.
* Menghindari inconsistent code style.
* Mempermudah debugging.
* Mempermudah kolaborasi.
* Membiasakan workflow industri.

---

# 1.2 Core Principles

Development mengikuti prinsip:

---

## Clean Code

Kode harus:

* Mudah dibaca.
* Memiliki tujuan jelas.
* Tidak memiliki kompleksitas tidak perlu.

---

## SOLID Principle

Terutama:

### Single Responsibility Principle

Satu file/class/function memiliki satu tanggung jawab.

Contoh:

Buruk:

```javascript
userController.js
```

berisi:

```text
Database query

Password hashing

Validation

Response formatting
```

---

Baik:

```text
Controller

↓

Service

↓

Repository
```

---

## DRY (Don't Repeat Yourself)

Tidak menduplikasi logic.

Buruk:

```javascript
calculateTotal()
```

ditulis di:

```
order.js

transaction.js

payment.js
```

---

Baik:

```text
utils/calculation.js
```

---

## KISS (Keep It Simple)

Jangan membuat abstraksi yang belum diperlukan.

---

# 2. General Programming Rules

---

# 2.1 Language

Backend:

```text
JavaScript (Node.js)
```

Frontend:

```text
HTML5

CSS3

JavaScript ES6+
```

Database:

```text
PostgreSQL SQL
```

---

# 2.2 Async Programming

Wajib menggunakan:

```javascript
async/await
```

---

Tidak menggunakan callback.

Buruk:

```javascript
db.query(sql, function(err,result){

});
```

---

Baik:

```javascript
const result = await db.query(sql);
```

---

# 2.3 Error Handling

Tidak boleh:

```javascript
try {

}
catch(error){

console.log(error)

}
```

---

Karena error harus masuk middleware.

---

Pattern:

```javascript
try {

    const data = await service.execute();

    return res.json(data);

}

catch(error){

    next(error);

}
```

---

Flow:

```
Controller

↓

Error Middleware

↓

Logger

↓

Response
```

---

# 2.4 Naming Convention

## General Rule

Gunakan:

```text
camelCase
```

untuk JavaScript.

---

Contoh:

```javascript
customerName

productPrice

transactionId
```

---

# 3. Variable Naming

---

## Variable

Gunakan noun.

Benar:

```javascript
customer

product

transaction
```

---

Salah:

```javascript
data1

temp

abc
```

---

## Boolean

Gunakan:

```text
is
has
can
should
```

---

Contoh:

```javascript
isActive

hasPermission

canDelete
```

---

# 4. Function Naming

Function menggunakan verb.

---

Benar:

```javascript
createProduct()

updateOrderStatus()

calculateTotal()
```

---

Salah:

```javascript
product()

order()
```

---

# 5. Constant Naming

Gunakan:

```text
UPPER_SNAKE_CASE
```

---

Contoh:

```javascript
const MAX_LOGIN_ATTEMPTS = 5;

const DEFAULT_PAGE_SIZE = 20;
```

---

# 6. File Naming Convention

---

## Backend

Gunakan:

```text
camelCase
```

---

Contoh:

```
userController.js

productService.js

orderRepository.js
```

---

## Frontend

HTML:

```
kebab-case
```

Contoh:

```
product-management.html
```

---

CSS:

```
kebab-case
```

Contoh:

```
dashboard-card.css
```

---

JavaScript:

```
camelCase
```

Contoh:

```
product.js
```

---

# 7. Folder Naming

Gunakan:

```text
lowercase
```

---

Contoh:

```
controllers

services

repositories

middlewares
```

---

# 8. Backend Architecture Standard

Backend wajib mengikuti:

```
Route

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

# 9. Route Layer Rules

Route hanya:

* Mendefinisikan endpoint.
* Memasang middleware.
* Menghubungkan controller.

---

Contoh:

```javascript
router.post(
"/products",
auth,
requireRole("ADMIN"),
productController.create
);
```

---

Route tidak boleh:

* Query database.
* Business logic.

---

# 10. Controller Layer Rules

Controller bertugas:

* Receive request.
* Validate request.
* Call service.
* Return response.

---

Controller tidak boleh:

* SQL query.
* Business calculation.

---

Contoh:

```javascript
const createProduct = async(req,res,next)=>{

try{

const product =
await productService.create(req.body);

res.status(201).json({
success:true,
data:product
});

}

catch(error){

next(error);

}

};
```

---

# 11. Service Layer Rules

Service berisi:

Business logic.

---

Contoh:

```javascript
async function createProduct(data){

validatePrice(data.price);

checkBarcode(data.barcode);

return repository.create(data);

}
```

---

Service menangani:

* Validation bisnis.
* Calculation.
* Workflow.

---

# 12. Repository Layer Rules

Repository hanya:

Database interaction.

---

Boleh:

```javascript
SELECT

INSERT

UPDATE

DELETE
```

---

Tidak boleh:

```javascript
if(role==="ADMIN")

calculateDiscount()

sendEmail()
```

---

# 13. Database Query Rules

---

## Parameterized Query

Wajib.

---

Buruk:

```javascript
`
SELECT *
FROM users
WHERE username='${username}'
`
```

---

Baik:

```javascript
`
SELECT *
FROM users
WHERE username=$1
`,
[
username
]
```

---

Tujuan:

Mencegah SQL Injection.

---

# 14. Response Standard

Semua API menggunakan format:

Success:

```json
{
    "success":true,
    "message":"Success",
    "data":{}
}
```

---

Error:

```json
{
    "success":false,
    "message":"Error message",
    "error_code":"ERROR_CODE"
}
```

---

# 15. HTTP Status Code Standard

Gunakan:

| Status | Usage            |
| ------ | ---------------- |
| 200    | Success          |
| 201    | Created          |
| 204    | No Content       |
| 400    | Validation Error |
| 401    | Unauthorized     |
| 403    | Forbidden        |
| 404    | Not Found        |
| 409    | Conflict         |
| 500    | Server Error     |

---

# 16. Environment Variable Rules

Tidak boleh:

```javascript
const password="12345";
```

---

Gunakan:

`.env`

---

Contoh:

```
DATABASE_URL=

SESSION_SECRET=

PORT=

NODE_ENV=
```

---

Commit:

Tidak boleh:

```
.env
```

---

Wajib:

```
.env.example
```

---

# 17. Comment Rules

Komentar digunakan untuk menjelaskan:

* Kenapa kode dibuat.
* Logic kompleks.

---

Tidak perlu:

```javascript
// create user
createUser();
```

---

Gunakan:

```javascript
// Prevent duplicate payment
// because transaction can only have one successful payment
```

---

# 18. Import Order

Urutan:

1. External library.
2. Internal module.
3. Constants.

---

Contoh:

```javascript
const express=require("express");

const productService=
require("../services/productService");

const {
STATUS_ACTIVE
}=require("../constants");
```

---

# 19. Backend Project Structure Standard

Backend harus menggunakan struktur modular.

Final structure:

```text
backend/

src/

├── config/
│   ├── database.js
│   ├── session.js
│   └── environment.js
│
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── productRoutes.js
│   └── orderRoutes.js
│
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   └── productController.js
│
├── services/
│   ├── authService.js
│   ├── userService.js
│   └── productService.js
│
├── repositories/
│   ├── userRepository.js
│   ├── productRepository.js
│   └── orderRepository.js
│
├── middlewares/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validationMiddleware.js
│
├── validators/
│   ├── userValidator.js
│   └── productValidator.js
│
├── utils/
│   ├── response.js
│   ├── logger.js
│   └── phoneNormalizer.js
│
├── constants/
│
├── app.js
└── server.js
```

---

# 20. Module Organization Rule

Setiap fitur harus memiliki komponen lengkap.

Contoh:

Product Module:

```text
products/

├── product.route.js

├── product.controller.js

├── product.service.js

├── product.repository.js

├── product.validator.js

```

---

Tujuan:

Menghindari file besar.

---

Buruk:

```text
productController.js

3000 lines
```

---

Baik:

```text
productController.js

100 lines
```

---

# 21. Controller Coding Pattern

Controller harus tipis.

---

Contoh:

```javascript
const productService = require("../services/productService");


async function create(req,res,next){

    try{

        const result =
        await productService.create(req.body);


        res.status(201).json({
            success:true,
            data:result
        });

    }

    catch(error){

        next(error);

    }

}


module.exports={
    create
};
```

---

Controller tidak boleh:

❌ SQL Query
❌ bcrypt hashing
❌ Calculation
❌ Complex validation

---

# 22. Service Coding Pattern

Service menangani business rule.

---

Contoh:

```javascript
async function createProduct(data){

    const exists =
    await repository.findByBarcode(
        data.barcode
    );


    if(exists){

        throw new ConflictError(
            "Barcode already exists"
        );

    }


    return repository.create(data);

}
```

---

Service bertanggung jawab:

* Business validation.
* Workflow.
* Transaction logic.

---

# 23. Repository Coding Pattern

Repository hanya database.

---

Contoh:

```javascript
async function findById(id){

const query = `
SELECT *
FROM products
WHERE id=$1
`;

const result =
await db.query(query,[id]);


return result.rows[0];

}
```

---

Repository tidak boleh:

```javascript
if(product.stock < 0)
```

Karena itu business rule.

---

# 24. Database Naming Convention

PostgreSQL menggunakan:

```text
snake_case
```

---

## Table

Plural.

Benar:

```sql
users

products

orders

transactions
```

---

Salah:

```sql
user

product
```

---

## Column

Snake case.

Benar:

```sql
created_at

updated_at

phone_number

product_id
```

---

Salah:

```sql
createdAt

phoneNumber
```

---

# 25. Primary Key Convention

Semua tabel:

```sql
id UUID PRIMARY KEY
```

---

Contoh:

```sql
CREATE TABLE products(

id UUID PRIMARY KEY,

name VARCHAR(100)

);
```

---

# 26. Foreign Key Convention

Format:

```text
<table>_id
```

---

Contoh:

```sql
customer_id

product_id

order_id

supplier_id
```

---

# 27. Timestamp Convention

Semua tabel:

Wajib memiliki:

```sql
created_at TIMESTAMP

updated_at TIMESTAMP
```

---

Soft delete:

```sql
deleted_at TIMESTAMP NULL
```

---

# 28. Database Constraint Rules

Business rule penting harus berada di database.

---

Contoh:

Barcode unique:

```sql
UNIQUE(barcode)
```

---

Harga tidak negatif:

```sql
CHECK(price >= 0)
```

---

Stock:

```sql
CHECK(stock >=0)
```

---

# 29. Index Convention

Index diberikan pada:

## Foreign Key

Contoh:

```sql
CREATE INDEX idx_orders_customer
ON orders(customer_id);
```

---

## Search Field

Contoh:

```sql
CREATE INDEX idx_product_barcode
ON products(barcode);
```

---

## Frequently Filtered Column

Contoh:

```sql
status

created_at
```

---

# 30. Frontend Coding Standard

Frontend menggunakan:

```text
HTML5

CSS3

JavaScript ES6+
```

---

# 31. HTML Standard

Gunakan semantic HTML.

---

Benar:

```html
<header>

<nav>

<main>

<section>

<footer>

```

---

Hindari:

```html
<div id="header">
```

jika semantic element tersedia.

---

# 32. HTML Naming

Class:

Gunakan:

```text
kebab-case
```

---

Contoh:

```html
<div class="product-card">
```

---

ID:

Gunakan:

```text
camelCase
```

---

Contoh:

```html
<button id="submitButton">
```

---

# 33. CSS Standard

Gunakan:

```text
BEM Method
```

---

Format:

```text
block__element--modifier
```

---

Contoh:

```css
.card {}

.card__title {}

.card__title--active {}

```

---

# 34. CSS Rules

Hindari:

```css
!important
```

kecuali alasan khusus.

---

Buruk:

```css
color:red!important;
```

---

Baik:

Perbaiki specificity.

---

# 35. JavaScript Frontend Standard

Gunakan:

```javascript
const

let
```

---

Tidak menggunakan:

```javascript
var
```

---

---

Gunakan:

```javascript
arrow function
```

---

Contoh:

```javascript
const loadProducts = async()=>{

}
```

---

# 36. DOM Manipulation

Pisahkan:

UI logic

dan

Business logic.

---

Buruk:

```javascript
button.onclick=()=>{

fetch()

calculate()

updateHTML()

}
```

---

Baik:

```javascript
button.onclick =
handleCheckout;


async function handleCheckout(){

const result =
await checkoutService();

renderResult(result);

}
```

---

# 37. API Calling Standard

Gunakan wrapper.

---

Jangan:

```javascript
fetch(
"/api/products"
)
```

di semua file.

---

Buat:

```text
js/

api/

productApi.js
```

---

Contoh:

```javascript
async function getProducts(){

return api.get("/products");

}
```

---

# 38. Security Coding Standard

---

# 38.1 Authentication

Password:

Wajib:

```text
bcrypt
```

---

Tidak boleh:

```javascript
password === databasePassword
```

---

# 38.2 Session Security

Session harus:

```javascript
httpOnly:true

secure:true (production)

sameSite:"strict"
```

---

# 38.3 Input Validation

Semua input:

Backend validation.

---

Contoh:

Product:

```text
name required

price >= 0

barcode unique
```

---

Frontend validation hanya:

UX.

---

# 38.4 SQL Injection Prevention

Wajib:

Parameterized query.

---

Tidak boleh:

```javascript
`SELECT * FROM users WHERE id=${id}`
```

---

# 38.5 XSS Prevention

Output user:

Harus di sanitize.

---

Contoh:

Customer name:

```text
<script>alert()</script>
```

Tidak boleh dieksekusi.

---

# 38.6 Authorization

Semua endpoint sensitif:

Wajib middleware.

---

Contoh:

```javascript
router.delete(
"/products/:id",

auth,

adminOnly,

controller.delete

);
```

---

# 39. Logging Standard

Gunakan logger.

---

Tidak menggunakan:

```javascript
console.log(error)
```

---

Gunakan:

```javascript
logger.error(error)
```

---

Log:

```text
logs/

├── error.log

├── access.log

└── audit.log
```

---

# 40. Git Standard

---

# 40.1 Commit Message

Format:

```text
type(scope): description
```

---

Type:

| Type     | Usage            |
| -------- | ---------------- |
| feat     | New feature      |
| fix      | Bug fix          |
| docs     | Documentation    |
| refactor | Code improvement |
| test     | Testing          |
| chore    | Maintenance      |

---

Example:

```text
feat(product): add barcode search

fix(payment): prevent duplicate payment

docs(api): update order endpoint
```

---

# 40.2 Commit Size

Commit harus kecil.

Buruk:

```text
update everything
```

---

Baik:

```text
feat(auth): add login controller

feat(auth): add session middleware
```

---

# 41. Code Review Checklist

Sebelum merge:

---

## Architecture

Checklist:

```
[ ] Controller tidak memiliki business logic

[ ] Repository hanya database

[ ] Service menangani business rule
```

---

## Security

```
[ ] Input validated

[ ] SQL injection prevented

[ ] Authorization checked
```

---

## Quality

```
[ ] Naming jelas

[ ] Tidak ada duplicate code

[ ] Error handling benar
```

---

# 42. Final Coding Standard Checklist

Sebelum fitur dianggap selesai:

```
✓ Mengikuti folder structure

✓ Menggunakan async/await

✓ Menggunakan service layer

✓ Menggunakan repository layer

✓ Menggunakan validation

✓ Menggunakan error middleware

✓ Menggunakan parameterized query

✓ Memiliki testing

✓ Dokumentasi diperbarui
```

---

