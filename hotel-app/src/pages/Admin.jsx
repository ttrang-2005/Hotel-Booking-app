// src/pages/Admin.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { roomService, authService } from '../utils/api';
import { toast } from 'react-toastify';

const Admin = () => {
  const [rooms, setRooms] = useState([]);
  
  // State quản lý form
  const [form, setForm] = useState({ name: '', price: '', image: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();

  // Load danh sách phòng từ Database
  useEffect(() => {
    const fetchRooms = async () => {
        const user = authService.getCurrentUser();
        if (!user || user.role !== 'admin') {
            toast.error("Bạn không có quyền truy cập trang!");
            navigate('/login');
            return;
        }
        
        try {
            const data = await roomService.getAll();
            if (Array.isArray(data)) setRooms(data);
        } catch (error) {
            toast.error("Lỗi tải danh sách phòng!");
        }
    };
    fetchRooms();
  }, [navigate]);

  // Xử lý Thêm hoặc Sửa
  const handleSubmit = async () => {
    if(!form.name || !form.price || !form.image || !form.description) {
        return toast.warning("Vui lòng điền đầy đủ thông tin!");
    }

    try {
        let updatedRooms;
        if (isEditing) {
            updatedRooms = await roomService.update(editId, form);
            toast.success(`Cập nhật phòng #${editId} thành công!`);
            setIsEditing(false);
            setEditId(null);
        } else {
            updatedRooms = await roomService.add(form);
            toast.success("Đã thêm phòng mới thành công!");
        }

        if (Array.isArray(updatedRooms)) setRooms(updatedRooms);
        setForm({ name: '', price: '', image: '', description: '' });

    } catch (error) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleEditClick = (room) => {
      setForm(room);
      setIsEditing(true);
      setEditId(room.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
      setIsEditing(false);
      setEditId(null);
      setForm({ name: '', price: '', image: '', description: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này không?")) {
        const deleteRoom = async () => {
            try {
                const updatedRooms = await roomService.delete(id);
                if (Array.isArray(updatedRooms)) setRooms(updatedRooms);
                toast.success("Đã xóa phòng thành công!");
            } catch (error) {
                toast.error("Lỗi khi xóa phòng!");
            }
        };
        deleteRoom();
    }
  };

  return (
    <>
      <Header />
      <div className="container" style={{marginTop: '150px', marginBottom: '100px'}}>
        <h2 className="mb-4 text-center text-lobster" style={{color: '#736de9ff', fontSize: '50px' }}>
            Quản Lý Phòng Khách Sạn
        </h2>
        
        <div className="card shadow-lg border-0">
            <div className="card-header bg-dark text-white">
                <h5 className="m-0 text-white">Danh sách & Cập nhật phòng</h5>
            </div>
            <div className="card-body p-4">

                {/* FORM NHẬP LIỆU */}
                <div 
                    className="p-3 mb-4 rounded" 
                    style={{
                        backgroundColor: isEditing ? '#fff3cd' : '#f8f9fa', 
                        border: isEditing ? '1px solid #ffeeba' : '1px dashed #ced4da'
                    }}
                >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="m-0" style={{color: isEditing ? '#856404' : '#333'}}>
                            {isEditing ? `✏️ Đang sửa phòng ID: ${editId}` : '➕ Thêm phòng mới'}
                        </h5>
                        {isEditing && <button className="btn btn-secondary btn-sm" onClick={handleCancel}>Hủy bỏ</button>}
                    </div>
                    
                    <div className="row">
                        <div className="col-md-3 mb-2">
                            <label>Tên loại phòng</label>
                            <input className="form-control" placeholder="VD: Deluxe Sea View" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                        </div>
                        
                        <div className="col-md-2 mb-2">
                            <label>Giá/đêm ($)</label>
                            <input className="form-control" type="number" placeholder="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                        </div>

                        <div className="col-md-7 mb-2">
                            <label>Link ảnh minh họa</label>
                            <input className="form-control" type="text" placeholder="https://..." value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
                        </div>

                        <div className="col-md-12 mb-3">
                            <label>Mô tả chi tiết</label>
                            <textarea 
                                className="form-control" 
                                rows="2" 
                                placeholder="Mô tả về tiện nghi, view..." 
                                value={form.description} 
                                onChange={e => setForm({...form, description: e.target.value})}
                            ></textarea>
                        </div>

                        <div className="col-md-12 text-right">
                            <button className={`btn px-4 ${isEditing ? 'btn-warning' : 'btn-primary'}`} onClick={handleSubmit}>
                                {isEditing ? 'Lưu thay đổi' : 'Thêm Phòng Ngay'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* BẢNG DANH SÁCH */}
                <div className="table-responsive">
                    <table className="table table-bordered table-hover mb-0">
                        <thead className="thead-light">
                            <tr>
                                <th style={{width: '5%'}}>ID</th>
                                <th style={{width: '15%'}}>Ảnh</th>
                                <th style={{width: '20%'}}>Tên Phòng</th>
                                <th style={{width: '10%'}}>Trạng thái</th>
                                <th style={{width: '10%'}}>Giá</th>
                                <th style={{width: '20%'}}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.length > 0 ? rooms.map(r => (
                                <tr key={r.id}>
                                    <td className="align-middle text-center font-weight-bold">{r.id}</td>
                                    <td className="align-middle">
                                        <img src={r.image} style={{width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} alt="" onError={(e) => e.target.src = 'https://via.placeholder.com/100x60'}/>
                                    </td>
                                    <td className="align-middle font-weight-bold">{r.name}</td>
                                    <td className="align-middle">
                                         {r.status === 'booked' 
                                            ? <span className="badge badge-danger">Đã có khách</span> 
                                            : <span className="badge badge-success">Sẵn sàng</span>
                                        }
                                    </td>
                                    <td className="align-middle text-success font-weight-bold">${r.price}</td>
                                    <td className="align-middle">
                                        <button className="btn btn-warning btn-sm mr-2" onClick={() => handleEditClick(r)}>
                                            <i className="fa fa-pencil"></i>
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                                            <i className="fa fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center py-4">Chưa có phòng nào trong hệ thống.</td></tr>
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

export default Admin;