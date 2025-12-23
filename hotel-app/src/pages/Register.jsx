// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../utils/api';
import Header from '../components/Header';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', password: '', confirmPassword: '', full_name: '', email: '', phone: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleRegister = async () => {
    // 1. Validate cơ bản
    if (!formData.username || !formData.password || !formData.email) {
        return toast.warning("Vui lòng nhập đủ thông tin bắt buộc!");
    }
    if (formData.password !== formData.confirmPassword) {
        return toast.error("Mật khẩu xác nhận không khớp!");
    }

    // 2. Gọi API đăng ký
    const result = await authService.register(formData);
    
    if (result.success) {
      toast.success("Đăng ký thành công! Đang chuyển trang đăng nhập...");
      setTimeout(() => navigate('/login'), 1500);
    } else {
      toast.error(result.message || "Đăng ký thất bại!");
    }
  };

  return (
    <>
      <Header />
      <section className="contact-form-area mb-100" style={{marginTop: '120px'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-6">
              <div className="section-heading text-center">
                <div className="line-"></div>
                <h2>Đăng Ký Tài Khoản</h2>
              </div>
              
              <div className="card shadow-sm p-4">
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input className="form-control" name="full_name" onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Tên đăng nhập <span className="text-danger">*</span></label>
                    <input className="form-control" name="username" onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Email <span className="text-danger">*</span></label>
                    <input type="email" className="form-control" name="email" onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input className="form-control" name="phone" onChange={handleChange} />
                  </div>
                  <div className="row">
                      <div className="col-6 form-group">
                        <label>Mật khẩu <span className="text-danger">*</span></label>
                        <input type="password" class="form-control" name="password" onChange={handleChange} />
                      </div>
                      <div className="col-6 form-group">
                        <label>Nhập lại mật khẩu <span className="text-danger">*</span></label>
                        <input type="password" class="form-control" name="confirmPassword" onChange={handleChange} />
                      </div>
                  </div>

                  <button className="btn palatin-btn btn-block mt-3" onClick={handleRegister}>Đăng Ký Ngay</button>
                  
                  <div className="text-center mt-3">
                      <small>Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link></small>
                  </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;