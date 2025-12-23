// src/pages/History.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer'; 
import { authService, bookingService } from '../utils/api';
import { toast } from 'react-toastify';

const History = () => {
  const [user, setUser] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Tạo hàm async riêng để gọi API
    const fetchData = async () => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            toast.warning("Vui lòng đăng nhập để xem lịch sử!");
            navigate('/login');
            return;
        }
        setUser(currentUser);

        // Thêm 'await' để chờ lấy xong dữ liệu từ Server
        const historyData = await bookingService.getHistory();
        
        // Kiểm tra nếu là mảng thì mới sort
        if (Array.isArray(historyData)) {
            const sortedHistory = historyData.sort((a, b) => b.id - a.id);
            setMyBookings(sortedHistory);
        } else {
            setMyBookings([]);
        }
    };

    fetchData(); // Gọi hàm chạy
  }, [navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="badge badge-success">Đã thanh toán</span>;
      case 'Pay at Hotel': return <span className="badge badge-warning">Thanh toán tại KS</span>;
      default: return <span className="badge badge-danger">Chưa thanh toán</span>;
    }
  };

  if (!user) return null;

  return (
    <>
      <Header />

      {/* Banner nhỏ phía trên */}
      <section 
        className="breadcumb-area bg-img d-flex align-items-center justify-content-center" 
        style={{
            backgroundImage: "url('/img/bg-img/bg-6.jpg')",
            height: '300px'
        }}
      >
        <div className="bradcumbContent">
            <h2>Hồ sơ & Lịch sử</h2>
        </div>
      </section>

      <div className="container" style={{ marginTop: '50px', marginBottom: '100px' }}>
        
        {/* --- PHẦN THÔNG TIN TÀI KHOẢN --- */}
        <div className="row mb-50">
            <div className="col-12 col-md-4">
                <div className="card shadow-sm border-0">
                    <div className="card-body text-center">
                        <img 
                            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
                            alt="User Avatar" 
                            style={{width: '80px', marginBottom: '10px'}}
                        />
                        <h4 style={{color: '#cb8670', fontSize: '20px'}}>{user.username}</h4>
                        <p className="text-muted"><small>Thành viên thân thiết</small></p>
                        <hr/>
                        
                        <div className="text-center">
                            <h2 style={{color: '#FFD700', fontWeight: 'bold', fontSize: '50px'}}>
                                {myBookings.length}
                            </h2>
                            <small style={{fontWeight: 'bold', textTransform: 'uppercase'}}>Lần đặt phòng</small>
                        </div>

                    </div>
                </div>
            </div>
            
            <div className="col-12 col-md-8">
                <div className="card shadow-sm h-100" style={{border: '1px solid #eee'}}>
                    <div className="card-header bg-white">
                        <h5 className="mb-0">Thông tin tài khoản hệ thống</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <small className="text-muted">Họ và tên:</small>
                                <p className="font-weight-bold">{user.full_name || user.username}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <small className="text-muted">Email:</small>
                                <p>{user.email || "Chưa cập nhật"}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <small className="text-muted">Số điện thoại:</small>
                                <p>{user.phone || "Chưa cập nhật"}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <small className="text-muted">Vai trò:</small>
                                <p>{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- BẢNG LỊCH SỬ --- */}
        <div className="row">
            <div className="col-12">
                <h3 className="mb-4" style={{fontFamily: 'Lobster, cursive', color: '#596be3'}}>
                    Lịch sử đặt phòng của bạn
                </h3>
                
                {myBookings.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover shadow-sm">
                            <thead style={{backgroundColor: '#f8f9fa'}}>
                                <tr>
                                    <th>Mã Đơn</th>
                                    <th>Thời gian lưu trú</th>
                                    <th>Phòng & Giá</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myBookings.map(item => (
                                    <tr key={item.id}>
                                        <td className="align-middle"><strong>#{item.id}</strong></td>
                                        
                                        <td className="align-middle" style={{minWidth: '160px'}}>
                                            <small>Check-in:</small> <strong>{item.customer.checkIn}</strong><br/>
                                            <small>Check-out:</small> <strong>{item.customer.checkOut}</strong>
                                        </td>

                                        <td className="align-middle">
                                            <span style={{fontWeight: 'bold', color: '#cb8670', fontSize: '16px'}}>
                                                {item.roomName}
                                            </span>
                                            <br/>
                                            {item.finalPrice ? (
                                                <strong className="text-success">${item.finalPrice}</strong>
                                            ) : (
                                                <span>Liên hệ</span>
                                            )}
                                        </td>

                                        <td className="align-middle">{getStatusBadge(item.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-5 border rounded bg-white">
                        <p className="mb-3">Bạn chưa có đơn đặt phòng nào.</p>
                        <Link to="/rooms" className="btn palatin-btn">Đặt phòng ngay</Link>
                    </div>
                )}
            </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default History;