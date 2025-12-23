// back-end/config/db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
    // Nếu có biến môi trường DB_HOST (từ Docker) thì dùng, không thì dùng localhost
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '290605', // Pass máy thật của bạn
    database: process.env.DB_NAME || 'hotel_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

console.log(`Đang kết nối tới Database: ${process.env.DB_HOST || 'localhost'}...`);

module.exports = pool.promise();