// back-end/routes/rooms.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. LẤY DANH SÁCH (GET)
// back-end/routes/rooms.js
router.get('/', async (req, res) => {
    try {
        // Lưu ý dòng SELECT: rt.type as name (để khớp với frontend đang dùng room.name)
        const sql = `
            SELECT r.id, r.room_number, r.status, 
                   rt.type as name,      
                   rt.price, 
                   rt.description, 
                   rt.image, 
                   rt.adult, 
                   rt.children
            FROM rooms r
            JOIN room_types rt ON r.room_types_id = rt.id
            ORDER BY r.id ASC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. LẤY CHI TIẾT (GET /:id)
router.get('/:id', async (req, res) => {
    try {
        const sql = `
            SELECT r.id, r.room_number, r.status, 
                   rt.type as name, rt.price, rt.description, rt.image
            FROM rooms r
            JOIN room_types rt ON r.room_types_id = rt.id
            WHERE r.id = ?
        `;
        const [rows] = await db.query(sql, [req.params.id]);
        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).json({ message: "Not found" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. THÊM PHÒNG (POST) - Dành cho Admin
router.post('/', async (req, res) => {
    const { name, price, description, image } = req.body;
    try {
        // Tạo loại phòng
        const sqlType = `INSERT INTO room_types (type, price, description, image, adult, children) VALUES (?, ?, ?, ?, 2, 1)`;
        const [typeResult] = await db.query(sqlType, [name, price, description, image]);
        
        // Tạo số phòng ngẫu nhiên (VD: R123)
        const roomNumber = "R" + Math.floor(100 + Math.random() * 900);
        const sqlRoom = `INSERT INTO rooms (room_number, room_types_id, status) VALUES (?, ?, 'available')`;
        await db.query(sqlRoom, [roomNumber, typeResult.insertId]);

        res.status(201).json({ success: true, message: "Thêm phòng thành công" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. SỬA PHÒNG (PUT) - Dành cho Admin
router.put('/:id', async (req, res) => {
    const { name, price, description, image } = req.body;
    try {
        // Lấy room_types_id từ bảng rooms
        const [rooms] = await db.query("SELECT room_types_id FROM rooms WHERE id = ?", [req.params.id]);
        if (rooms.length === 0) return res.status(404).json({ message: "Phòng không tồn tại" });

        // Cập nhật thông tin loại phòng
        const sql = `UPDATE room_types SET type=?, price=?, description=?, image=? WHERE id=?`;
        await db.query(sql, [name, price, description, image, rooms[0].room_types_id]);

        res.json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. XÓA PHÒNG (DELETE) - Dành cho Admin
router.delete('/:id', async (req, res) => {
    try {
        // Lấy room_types_id trước khi xóa để xóa sạch sẽ (tùy chọn)
        // Ở đây xóa room trước, database có thể set cascade hoặc giữ lại type rác (chấp nhận được ở bài tập lớn)
        await db.query("DELETE FROM rooms WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: "Xóa thành công" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;