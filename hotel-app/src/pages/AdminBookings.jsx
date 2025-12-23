// src/pages/AdminBookings.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { bookingService, authService } from '../utils/api';
import { toast } from 'react-toastify';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  // Load danh sách đơn hàng từ Database
  useEffect(() => {
    const fetchBookings = async () => {
        const user = authService.getCurrentUser();
        if (!user || user.role !== 'admin') {
            toast.error("Bạn không có quyền truy cập trang này!");
            navigate('/login');
            return;
        }
        
        try {
            const data = await bookingService.getAll();
            if (Array.isArray(data)) setBookings(data);
        } catch (error) {
            toast.error("Lỗi tải danh sách đơn hàng!");
        }
    };
    fetchBookings();
  }, [navigate]);

  const handleDelete = (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa đơn đặt phòng này? Hành động này sẽ trả phòng về trạng thái trống.")) {
        const performDelete = async () => {
            try {
                const updatedList = await bookingService.delete(id);
                if (Array.isArray(updatedList)) setBookings(updatedList);
                toast.success(`Đã xóa đơn #${id} thành công!`);
            } catch (error) {
                toast.error("Lỗi khi xóa đơn hàng!");
            }
        };
        performDelete();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="badge badge-success">Đã thanh toán</span>;
      case 'Pay at Hotel': return <span className="badge badge-warning">Thanh toán tại KS</span>;
      default: return <span className="badge badge-danger">Chưa thanh toán</span>;
    }
  };

  return (
    <>
      <Header />
      <div className="container" style={{ marginTop: '150px', marginBottom: '100px' }}>
        <h2 className="mb-4 text-center text-lobster" style={{color: '#626ad4ff', fontSize: '50px' }}>
            Danh Sách Đơn Đặt Phòng
        </h2>
        
        <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
                <h5 className="m-0 text-white">Quản lý Booking của khách hàng</h5>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover table-striped mb-0">
                        <thead className="thead-dark">
                            <tr>
                                <th>Mã Đơn</th>
                                <th>Thông tin Khách</th>
                                <th>Thời Gian Lưu Trú</th>
                                <th>Chi Tiết Phòng</th>
                                <th>Thanh Toán</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? bookings.map(b => (
                            <tr key={b.id}>
                                <td className="align-middle text-center">
                                    <strong>#{b.id}</strong>
                                </td>
                                
                                <td className="align-middle">
                                    <strong>{b.customer.fullName}</strong><br/>
                                    <small><i className="fa fa-phone"></i> {b.customer.phone}</small><br/>
                                    <small><i className="fa fa-envelope"></i> {b.customer.email}</small>
                                </td>

                                <td className="align-middle">
                                    <span className="text-muted">Check-in:</span> <strong>{b.customer.checkIn}</strong><br/>
                                    <span className="text-muted">Check-out:</span> <strong>{b.customer.checkOut}</strong>
                                </td>

                                <td className="align-middle">
                                    <span style={{color: '#626ad4ff', fontWeight: 'bold'}}>{b.roomName}</span><br/>
                                    <small>SL: {b.customer.roomCount} phòng</small>
                                </td>

                                <td className="align-middle">
                                    {getStatusBadge(b.status)}<br/>
                                    <small>Tổng: <strong className="text-dark">${b.finalPrice}</strong></small><br/>
                                    {b.paymentMethod && <small>Qua: {b.paymentMethod}</small>}
                                </td>

                                <td className="align-middle text-center">
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(b.id)} title="Xóa đơn">
                                        <i className="fa fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <h5 className="text-muted">Chưa có đơn đặt phòng nào!</h5>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default AdminBookings;