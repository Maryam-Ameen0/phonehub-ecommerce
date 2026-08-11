const mysql = require('mysql2');
require('dotenv').config();

// Connection pool — reuses connections instead of opening a new one per query
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_store',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// .promise() lets us use async/await instead of callbacks everywhere
const db = pool.promise();

// Quick sanity check on startup so a bad DB config fails loudly, not silently
db.query('SELECT 1')
    .then(() => console.log('✅ MySQL connected successfully'))
    .catch((err) => {
        console.error('❌ MySQL connection failed:', err.message);
    });

module.exports = db;
