// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import các trang
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import AdminBookings from './pages/AdminBookings';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import History from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-bookings" element={<AdminBookings />} />
        <Route path="/booking/:roomId" element={<Booking />} />
        <Route path="/payment/:bookingId" element={<Payment />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;