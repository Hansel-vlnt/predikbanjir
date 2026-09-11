const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const isVercel = !!process.env.VERCEL;

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'banjir_prediksi',
    waitForConnections: true,
    // Di serverless Vercel, batasi connectionLimit agar tidak menghabiskan pool database cloud
    connectionLimit: isVercel ? 2 : 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
};

// Aktifkan SSL jika DB_SSL=true ATAU jika berjalan di Vercel (karena Vercel selalu terkoneksi ke remote cloud MySQL)
if (process.env.DB_SSL === 'true' || (isVercel && config.host !== 'localhost' && config.host !== '127.0.0.1')) {
    config.ssl = { rejectUnauthorized: false };
}

// Dukungan jika cloud hosting menyediakan DATABASE_URL atau MYSQL_URL tunggal
const pool = process.env.MYSQL_URL || process.env.DATABASE_URL 
    ? mysql.createPool(process.env.MYSQL_URL || process.env.DATABASE_URL)
    : mysql.createPool(config);

module.exports = pool.promise();