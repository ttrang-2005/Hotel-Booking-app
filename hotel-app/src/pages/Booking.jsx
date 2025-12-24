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
  const [isBookForSelf, setIsBookForSelf] = useState(true);

  // State form dữ liệu
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    fullName: '',
    phone: '',
    email: '',
    peopleCount: 1,
    roomCount: 1,
    requests: ''
  });

  const [totalPrice, setTotalPrice] = useState(0);

  // --- [FIX LỖI MÚI GIỜ] ---
  // Lấy ngày theo giờ địa phương (Local Time) thay vì UTC
  const dt = new Date();
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`; 
  // -------------------------

  useEffect(() => {
    const fetchRoom = async () => {
      const rooms = await roomService.getAll();
      const selectedRoom = rooms.find(r => r.id === parseInt(roomId));
      if (selectedRoom) setRoom(selectedRoom);
      else navigate('/rooms');
    };
    fetchRoom();
  }, [roomId, navigate]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (isBookForSelf && user) {
        setFormData(prev => ({
            ...prev,
            fullName: user.full_name || '',
            email: user.email || '',
            phone: user.phone || ''
        }));
    } else if (!isBookForSelf) {
        setFormData(prev => ({
            ...prev,
            fullName: '',
            email: '',
            phone: ''
        }));
    }
  }, [isBookForSelf]);

  useEffect(() => {
    if (room && formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const diffTime = end - start; 
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays > 0) {
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
    if (!formData.checkIn || !formData.checkOut || !formData.fullName || !formData.phone || !formData.email) {
        return toast.warning("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }
    
    // Validate ngày tháng (Chặt chẽ hơn)
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const now = new Date();
    
    // Đặt giờ về 0 để so sánh chính xác ngày
    now.setHours(0, 0, 0, 0);
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate < now) {
        return toast.error("Ngày nhận phòng không thể ở trong quá khứ!");
    }

    if (checkInDate >= checkOutDate) {
        return toast.error("Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm!");
    }

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
        toast.success("Đặt phòng thành công!");
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
                        <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
                            <img src={room.image} alt={room.name} style={{width: '100px', height: '70px', objectFit: 'cover', borderRadius: '5px', marginRight: '15px'}} />
                            <div>
                                <h5 className="m-0 text-primary">{room.name}</h5>
                                <p className="m-0 text-muted">Giá niêm yết: ${room.price}/đêm</p>
                            </div>
                        </div>

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

                        <div className="row">
                            <div className="col-md-6 form-group">
                                <label>Ngày nhận phòng (Check-in) <span className="text-danger">*</span></label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    name="checkIn" 
                                    min={today} 
                                    onChange={handleChange} 
                                />
                            </div>

                            <div className="col-md-6 form-group">
                                <label>Ngày trả phòng (Check-out) <span className="text-danger">*</span></label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    name="checkOut" 
                                    min={formData.checkIn ? formData.checkIn : today}
                                    onChange={handleChange} 
                                />
                            </div>

                            <div className="col-md-6 form-group">
                                <label>Họ và tên khách ở <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nhập tên người nhận phòng"/>
                            </div>
                            <div className="col-md-6 form-group">
                                <label>Số điện thoại liên hệ <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} placeholder="09xxx..."/>
                            </div>
                            <div className="col-md-12 form-group">
                                <label>Email nhận thông tin <span className="text-danger">*</span></label>
                                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com"/>
                            </div>
                            <div className="col-md-6 form-group">
                                <label>Số người</label>
                                <input type="number" min="1" className="form-control" name="peopleCount" value={formData.peopleCount} onChange={handleChange} />
                            </div>
                            <div className="col-md-6 form-group">
                                <label>Số lượng phòng</label>
                                <input type="number" min="1" className="form-control" name="roomCount" value={formData.roomCount} onChange={handleChange} />
                            </div>
                            <div className="col-md-12 form-group">
                                <label>Yêu cầu đặc biệt</label>
                                <textarea className="form-control" rows="3" name="requests" onChange={handleChange} placeholder="Yêu cầu thêm..."></textarea>
                            </div>
                        </div>

                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                            <div><h5 className="mb-0">Tổng tiền tạm tính:</h5></div>
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