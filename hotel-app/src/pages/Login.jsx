// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../utils/api';
import Header from '../components/Header';
import { toast } from 'react-toastify';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
        toast.warning("Vui lòng nhập tài khoản và mật khẩu!");
        return;
    }
    
    const result = await authService.login(username, password);
    
    if (result.success) {
      toast.success(`Chào mừng ${result.user.full_name || result.user.username}!`);
      // Chuyển trang: Admin về trang quản trị, User về trang chủ
      navigate(result.user.role === 'admin' ? '/admin' : '/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <Header />
      <section className="contact-form-area mb-100" style={{marginTop: '150px'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-5">
              <div className="card shadow-lg border-0 p-4">
                  <div className="section-heading text-center mb-4">
                    <h3 className="text-lobster" style={{color: '#cb8670'}}>Đăng Nhập</h3>
                  </div>

                  <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input 
                      className="form-control" 
                      placeholder="Username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <button className="btn palatin-btn btn-block mb-3" onClick={handleLogin}>
                    Đăng Nhập
                  </button>

                  <hr />
                  <div className="text-center">
                      <p>Chưa có tài khoản?</p>
                      <Link to="/register" className="btn btn-outline-secondary btn-sm">Đăng ký tài khoản mới</Link>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;