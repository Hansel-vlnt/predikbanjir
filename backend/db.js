const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'banjir_prediksi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
};

// Aktifkan SSL jika environment DB_SSL diset ke 'true' (standar untuk cloud MySQL seperti Aiven / TiDB)
if (process.env.DB_SSL === 'true') {
    config.ssl = { rejectUnauthorized: false };
}

// Dukungan jika cloud hosting menyediakan DATABASE_URL atau MYSQL_URL tunggal
const pool = process.env.MYSQL_URL || process.env.DATABASE_URL 
    ? mysql.createPool(process.env.MYSQL_URL || process.env.DATABASE_URL)
    : mysql.createPool(config);

module.exports = pool.promise();