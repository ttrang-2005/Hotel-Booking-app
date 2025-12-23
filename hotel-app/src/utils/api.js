// src/utils/api.js
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' }
});

const getCurrentUser = () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
};

// --- AUTH SERVICE (Đã gỡ Google) ---
export const authService = {
    login: async (username, password) => {
        try {
            const res = await API.post('/auth/login', { username, password });
            if (res.data.success) {
                localStorage.setItem('currentUser', JSON.stringify(res.data.user));
            }
            return res.data;
        } catch (error) {
            return { success: false, message: "Sai tài khoản hoặc lỗi kết nối" };
        }
    },
    
    register: async (formData) => {
        try {
            const res = await API.post('/auth/register', formData);
            return res.data;
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Lỗi đăng ký" };
        }
    },

    getCurrentUser,
    logout: () => {
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
    }
};

// --- ROOM SERVICE (Giữ nguyên) ---
export const roomService = {
    getAll: async () => { try { const res = await API.get('/rooms'); return res.data; } catch { return []; } },
    add: async (room) => { try { await API.post('/rooms', room); return await roomService.getAll(); } catch { return []; } },
    update: async (id, room) => { try { await API.put(`/rooms/${id}`, room); return await roomService.getAll(); } catch { return []; } },
    delete: async (id) => { try { await API.delete(`/rooms/${id}`); return await roomService.getAll(); } catch { return []; } }
};

// --- BOOKING SERVICE (Giữ nguyên) ---
export const bookingService = {
    book: async (data) => {
        try {
            const user = getCurrentUser();
            if (!user) return { success: false, message: "Chưa đăng nhập" };
            const payload = {
                users_id: user.id,
                rooms_id: data.roomId,
                check_in_date: data.customer.checkIn,
                check_out_date: data.customer.checkOut,
                total_price: data.price,
                guest_name: data.customer.fullName,
                guest_phone: data.customer.phone,
                guest_email: data.customer.email,
                guest_requests: data.customer.requests,
                people_count: data.customer.peopleCount,
                room_count: data.customer.roomCount
            };
            const res = await API.post('/bookings', payload);
            return { success: true, booking: { id: res.data.bookingId } };
        } catch (error) { return { success: false, message: "Lỗi đặt phòng" }; }
    },
    getAll: async () => { try { const res = await API.get('/bookings'); return res.data.map(item => ({ ...item, customer: { fullName: item.guest_name || item.account_name, phone: item.guest_phone || item.phone, email: item.guest_email || item.email, requests: item.guest_requests, checkIn: new Date(item.check_in_date).toLocaleDateString(), checkOut: new Date(item.check_out_date).toLocaleDateString(), peopleCount: item.people_count || 1, roomCount: item.room_count || 1 } })); } catch { return []; } },
    getById: async (id) => { try { const res = await API.get(`/bookings/${id}`); const item = res.data; return { id: item.id, price: item.total_price, roomName: item.roomName, customer: { fullName: item.guest_name, checkIn: new Date(item.check_in_date).toISOString().split('T')[0], checkOut: new Date(item.check_out_date).toISOString().split('T')[0] } }; } catch { return null; } },
    getHistory: async () => { try { const user = getCurrentUser(); if (!user) return []; const res = await API.get(`/bookings/my-bookings/${user.id}`); return res.data.map(item => ({ id: item.id, status: item.status || 'Unpaid', roomName: item.room_type || `Phòng ${item.room_number}`, finalPrice: item.total_price, customer: { fullName: item.guest_name, checkIn: new Date(item.check_in_date).toISOString().split('T')[0], checkOut: new Date(item.check_out_date).toISOString().split('T')[0] } })); } catch { return []; } },
    updateStatus: async (id, status, method, finalPrice) => { try { await API.put(`/bookings/${id}`, { status, paymentMethod: method, finalPrice }); } catch {} },
    delete: async (id) => { try { await API.delete(`/bookings/${id}`); return await bookingService.getAll(); } catch { return []; } }
};

export const initData = () => {};