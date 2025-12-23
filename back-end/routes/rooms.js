// back-end/routes/rooms.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. LẤY DANH SÁCH (GET)
router.get('/', async (req, res) => {
    try {
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
        // Bước 1: Tạo loại phòng trước
        const sqlType = `INSERT INTO room_types (type, price, description, image, adult, children) VALUES (?, ?, ?, ?, 2, 1)`;
        const [typeResult] = await db.query(sqlType, [name, price, description, image]);
        
        // Bước 2: Tạo phòng vật lý (Room) và gắn với loại phòng vừa tạo
        const roomNumber = "R" + Math.floor(100 + Math.random() * 900); // Random số phòng
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
    const roomId = req.params.id; // Đây là ID của phòng (rooms)
    try {
        // Bước 1: Tìm xem phòng này thuộc loại (room_types_id) nào?
        const [rooms] = await db.query("SELECT room_types_id FROM rooms WHERE id = ?", [roomId]);
        
        if (rooms.length === 0) return res.status(404).json({ message: "Phòng không tồn tại" });

        const typeId = rooms[0].room_types_id;

        // Bước 2: Cập nhật thông tin vào bảng room_types
        const sql = `UPDATE room_types SET type=?, price=?, description=?, image=? WHERE id=?`;
        await db.query(sql, [name, price, description, image, typeId]);

        res.json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. XÓA PHÒNG (DELETE) - [ĐÃ SỬA LOGIC]
router.delete('/:id', async (req, res) => {
    const roomId = req.params.id; // Đây là ID của phòng (bảng rooms)

    try {
        // Bước 1: Lấy thông tin phòng để biết nó thuộc loại nào (để tí nữa xóa luôn loại cho sạch)
        const [roomInfo] = await db.query("SELECT room_types_id FROM rooms WHERE id = ?", [roomId]);
        if (roomInfo.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng để xóa" });
        }
        const typeId = roomInfo[0].room_types_id;

        // Bước 2: QUAN TRỌNG - Kiểm tra bảng BOOKINGS (đơn đặt)
        // Nếu phòng này (roomId) đang có đơn đặt -> Cấm xóa
        const [bookings] = await db.query("SELECT id FROM bookings WHERE rooms_id = ?", [roomId]);
        
        if (bookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Không thể xóa! Phòng này đang có lịch sử đặt phòng (Booking). Hãy ẩn nó đi thay vì xóa."
            });
        }

        // Bước 3: Nếu sạch sẽ -> Xóa Phòng (bảng rooms) trước
        await db.query("DELETE FROM rooms WHERE id = ?", [roomId]);

        // Bước 4: Xóa luôn Loại phòng (bảng room_types) vì code POST của bạn tạo mỗi phòng 1 loại riêng
        // (Nếu không xóa dòng này, database sẽ đầy rác room_types không ai dùng)
        await db.query("DELETE FROM room_types WHERE id = ?", [typeId]);

        res.json({ success: true, message: "Đã xóa phòng thành công!" });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;