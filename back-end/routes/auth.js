// back-end/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. ĐĂNG KÝ TÀI KHOẢN
router.post('/register', async (req, res) => {
    const { username, password, full_name, email, phone } = req.body;
    try {
        // Kiểm tra trùng lặp trước
        const [exists] = await db.query("SELECT * FROM users WHERE username = ? OR email = ?", [username, email]);
        if (exists.length > 0) {
            return res.status(400).json({ success: false, message: "Tên đăng nhập hoặc Email đã tồn tại!" });
        }

        const sql = `INSERT INTO users (username, password, full_name, email, phone) VALUES (?, ?, ?, ?, ?)`;
        await db.query(sql, [username, password, full_name, email, phone]);
        
        res.status(201).json({ success: true, message: "Đăng ký thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. ĐĂNG NHẬP
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
        const [rows] = await db.query(sql, [username, password]);

        if (rows.length > 0) {
            const user = rows[0];
            // Logic phân quyền cứng (admin / user)
            const role = (user.username === 'admin') ? 'admin' : 'user';
            
            res.json({ 
                success: true, 
                user: { 
                    id: user.id, 
                    username: user.username, 
                    full_name: user.full_name, 
                    role: role,
                    email: user.email,
                    phone: user.phone
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;