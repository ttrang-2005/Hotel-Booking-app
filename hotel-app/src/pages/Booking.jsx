// src/pages/Booking.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { roomService, bookingService, authService } from '../utils/api';
import { toast } from 'react-toastify';

const Booking = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  
  // State quản lý chế độ đặt phòng (Tự đặt hay Đặt hộ)
  const [isBookForSelf, setIsBookForSelf] = useState(true);

  // State form dữ liệu
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    fullName: '',
    phone: '',
    email: '',
    peopleCount: 1, // Mặc định 1 người
    roomCount: 1,   // Mặc định 1 phòng
    requests: ''
  });

  const [totalPrice, setTotalPrice] = useState(0);

  // 1. Load thông tin phòng
  useEffect(() => {
    const fetchRoom = async () => {
      const rooms = await roomService.getAll();
      const selectedRoom = rooms.find(r => r.id === parseInt(roomId));
      if (selectedRoom) setRoom(selectedRoom);
      else navigate('/rooms');
    };
    fetchRoom();
  }, [roomId, navigate]);

  // 2. Xử lý Tự động điền thông tin (Logic mới)
  useEffect(() => {
    const user = authService.getCurrentUser();
    
    if (isBookForSelf && user) {
        // Nếu chọn "Đặt cho bản thân" -> Lấy thông tin user điền vào
        setFormData(prev => ({
            ...prev,
            fullName: user.full_name || '', // Lấy full_name từ database
            email: user.email || '',
            phone: user.phone || ''
        }));
    } else if (!isBookForSelf) {
        // Nếu chọn "Đặt hộ" -> Xóa thông tin cá nhân để nhập mới
        setFormData(prev => ({
            ...prev,
            fullName: '',
            email: '',
            phone: ''
        }));
    }
  }, [isBookForSelf]); // Chạy lại khi nút chuyển chế độ thay đổi

  // 3. Tính tiền tự động khi đổi ngày hoặc số phòng
  useEffect(() => {
    if (room && formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays > 0) {
        // Giá = Giá phòng * Số đêm * Số lượng phòng
        setTotalPrice(room.price * diffDays * formData.roomCount);
      } else {
        setTotalPrice(0);
      }
    }
  }, [formData.checkIn, formData.checkOut, formData.roomCount, room]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.checkIn || !formData.checkOut || !formData.fullName || !formData.phone || !formData.email) {
        return toast.warning("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }
    
    // Validate ngày
    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
        return toast.error("Ngày check-out phải sau ngày check-in!");
    }

    // Validate số lượng
    if (formData.peopleCount < 1 || formData.roomCount < 1) {
        return toast.error("Số người và số phòng phải ít nhất là 1");
    }

    const bookingData = {
        roomId: room.id,
        price: totalPrice,
        customer: formData
    };

    const result = await bookingService.book(bookingData);
    if (result.success) {
        toast.success("Đặt phòng thành công! Chuyển sang thanh toán...");
        setTimeout(() => navigate(`/payment/${result.booking.id}`), 1500);
    } else {
        toast.error(result.message);
    }
  };

  if (!room) return <div className="text-center mt-5">Đang tải...</div>;

  return (
    <>
      <Header />
      <div className="container" style={{ marginTop: '150px', marginBottom: '100px' }}>
        <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
                <div className="card shadow border-0">
                    <div className="card-header bg-primary text-white">
                        <h4 className="m-0 text-white">Xác Nhận Đặt Phòng</h4>
                    </div>
                    <div className="card-body p-5">
                        
                        {/* Thông tin phòng tóm tắt */}
                        <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
                            <img src={room.image} alt={room.name} style={{width: '100px', height: '70px', objectFit: 'cover', borderRadius: '5px', marginRight: '15px'}} />
                            <div>
                                <h5 className="m-0 text-primary">{room.name}</h5>
                                <p className="m-0 text-muted">Giá niêm yết: ${room.price}/đêm</p>
                            </div>
                        </div>

                        {/* --- PHẦN CHỌN CHẾ ĐỘ ĐẶT (MỚI) --- */}
                        <div className="mb-4">
                            <label className="d-block font-weight-bold mb-2">Bạn đang đặt phòng cho ai?</label>
                            <div className="btn-group btn-group-toggle" style={{width: '100%'}}>
                                <label className={`btn ${isBookForSelf ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setIsBookForSelf(true)}>
                                    <input type="radio" name="options" defaultChecked={isBookForSelf} /> 
                                    <i className="fa fa-user mr-2"></i> Đặt phòng cho bản thân
                                </label>
                                <label className={`btn ${!isBookForSelf ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setIsBookForSelf(false)}>
                                    <input type="radio" name="options" /> 
                                    <i className="fa fa-users mr-2"></i> Đặt phòng hộ người khác
                                </label>
                            </div>
                        </div>
                        {/* ---------------------------------- */}

                        <div className="row">
                            <div className="col-md-6 form-group">
                                <label>Ngày nhận phòng (Check-in) <span className="text-danger">*</span></label>
                                <input type="date" className="form-control" name="checkIn" onChange={handleChange} />
                            </div>
                            <div className="col-md-6 form-group">
                                <label>Ngày trả phòng (Check-out) <span className="text-danger">*</span></label>
                                <input type="date" className="form-control" name="checkOut" onChange={handleChange} />
                            </div>

                            <div className="col-md-6 form-group">
                                <label>Họ và tên khách ở <span className="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    name="fullName" 
                                    value={formData.fullName} 
                                    onChange={handleChange} 
                                    placeholder="Nhập tên người nhận phòng"
                                    // Có thể thêm readOnly nếu muốn cấm sửa khi chọn 'Cho bản thân'
                                    // readOnly={isBookForSelf} 
                                />
                            </div>
                            <div className="col-md-6 form-group">
                                <label>Số điện thoại liên hệ <span className="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    placeholder="09xxx..."
                                />
                            </div>

                            <div className="col-md-12 form-group">
                                <label>Email nhận thông tin <span className="text-danger">*</span></label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="col-md-6 form-group">
                                <label>Số người (Người lớn + Trẻ em)</label>
                                <input type="number" min="1" className="form-control" name="peopleCount" value={formData.peopleCount} onChange={handleChange} />
                            </div>

                            <div className="col-md-6 form-group">
                                <label>Số lượng phòng muốn đặt</label>
                                <input type="number" min="1" className="form-control" name="roomCount" value={formData.roomCount} onChange={handleChange} />
                            </div>

                            <div className="col-md-12 form-group">
                                <label>Yêu cầu đặc biệt (nếu có)</label>
                                <textarea className="form-control" rows="3" name="requests" onChange={handleChange} placeholder="Ví dụ: Phòng tầng cao, view biển, check-in sớm..."></textarea>
                            </div>
                        </div>

                        <hr />
                        
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-0">Tổng tiền tạm tính:</h5>
                                <small className="text-muted">(Chưa bao gồm VAT và phí dịch vụ)</small>
                            </div>
                            <h2 className="text-success m-0">${totalPrice}</h2>
                        </div>

                        <button className="btn palatin-btn btn-block mt-4" onClick={handleSubmit} disabled={totalPrice === 0}>
                            XÁC NHẬN ĐẶT PHÒNG
                        </button>

                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default Booking;