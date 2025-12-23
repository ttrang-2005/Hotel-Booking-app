// back-end/routes/bookings.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. TẠO ĐƠN ĐẶT PHÒNG (SỬA: Lưu thêm people_count và room_count)
router.post('/', async (req, res) => {
    const { 
        users_id, rooms_id, check_in_date, check_out_date, total_price, 
        guest_name, guest_phone, guest_email, guest_requests,
        people_count, room_count // <--- Nhận thêm 2 biến này
    } = req.body;

    try {
        const sqlBooking = `
            INSERT INTO bookings 
            (users_id, rooms_id, check_in_date, check_out_date, total_price, guest_name, guest_phone, guest_email, guest_requests, people_count, room_count) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(sqlBooking, [
            users_id, rooms_id, check_in_date, check_out_date, total_price, 
            guest_name, guest_phone, guest_email, guest_requests,
            people_count, room_count
        ]);

        await db.query(`UPDATE rooms SET status = 'booked' WHERE id = ?`, [rooms_id]);

        res.status(201).json({ success: true, message: "Đặt phòng thành công!", bookingId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. XEM LỊCH SỬ (Khách hàng)
router.get('/my-bookings/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const sql = `
            SELECT b.*, r.room_number, rt.type as room_type, rt.price as original_price
            FROM bookings b
            JOIN rooms r ON b.rooms_id = r.id
            JOIN room_types rt ON r.room_types_id = rt.id
            WHERE b.users_id = ?
            ORDER BY b.check_in_date DESC
        `;
        const [rows] = await db.query(sql, [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. CHI TIẾT ĐƠN (Thanh toán)
router.get('/:id', async (req, res) => {
    try {
        const sql = `
            SELECT b.*, r.room_number, rt.type as roomName
            FROM bookings b
            JOIN rooms r ON b.rooms_id = r.id
            JOIN room_types rt ON r.room_types_id = rt.id
            WHERE b.id = ?
        `;
        const [rows] = await db.query(sql, [req.params.id]);
        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).json({ message: "Không tìm thấy đơn" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. LẤY TẤT CẢ (Cho Admin - SỬA: Lấy đúng số người/phòng thực tế)
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT b.*, r.room_number, rt.type as roomName, 
                   u.username as account_name,
                   b.guest_name, b.guest_phone, b.guest_email, b.guest_requests
            FROM bookings b
            JOIN rooms r ON b.rooms_id = r.id
            JOIN room_types rt ON r.room_types_id = rt.id
            JOIN users u ON b.users_id = u.id
            ORDER BY b.id DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. UPDATE TRẠNG THÁI
router.put('/:id', async (req, res) => {
    const { status, paymentMethod, finalPrice } = req.body;
    try {
        const sql = `UPDATE bookings SET status = ?, paymentMethod = ?, total_price = ? WHERE id = ?`;
        await db.query(sql, [status, paymentMethod, finalPrice, req.params.id]);
        res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. XÓA ĐƠN
router.delete('/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const [booking] = await db.query(`SELECT rooms_id FROM bookings WHERE id = ?`, [bookingId]);
        
        if (booking.length > 0) {
            const roomId = booking[0].rooms_id;
            await db.query(`DELETE FROM bookings WHERE id = ?`, [bookingId]);
            await db.query(`UPDATE rooms SET status = 'available' WHERE id = ?`, [roomId]);
            res.json({ success: true, message: "Đã xóa đơn!" });
        } else {
            res.status(404).json({ message: "Không tìm thấy đơn" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;