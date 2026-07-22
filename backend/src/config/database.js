// file ini bertugas menghubungkan aplikasi ke postgresql

const { Pool } = require('pg');
require('dotenv').config();

//Kumpulan koneksi (Connection pool)
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

//tesf koneksi (untuk debugging)
pool.connect((err, client, release) => {
    if (err) {
        console.error('database connection failed:', err.stack);
    } else {
        console.log('database connected succesfully');
        release();
    }
});

module.exports = pool;
