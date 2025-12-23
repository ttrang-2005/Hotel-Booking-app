// src/pages/Rooms.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { roomService } from '../utils/api';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);           // Dữ liệu gốc
  const [filteredRooms, setFilteredRooms] = useState([]); // Dữ liệu đã lọc để hiển thị
  
  // --- STATE QUẢN LÝ TÌM KIẾM ---
  const [filters, setFilters] = useState({
    keyword: '',
    priceRange: 'all', // all, low (<200), medium (200-500), high (>500)
    sort: 'default'    // default, price-asc, price-desc
  });

  // Load dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
        const data = await roomService.getAll(); // Thêm await
        setRooms(data);
        setFilteredRooms(data);
    };
    fetchData();
    window.scrollTo(0, 0);
}, []);

  // --- HÀM LỌC & XỬ LÝ LOGIC ---
  useEffect(() => {
    let result = [...rooms];

    // 1. Lọc theo Từ khóa (Tên hoặc Mô tả)
    if (filters.keyword) {
      const lowerKeyword = filters.keyword.toLowerCase();
      result = result.filter(room => 
        room.name.toLowerCase().includes(lowerKeyword) || 
        room.description.toLowerCase().includes(lowerKeyword)
      );
    }

    // 2. Lọc theo Giá
    if (filters.priceRange !== 'all') {
      result = result.filter(room => {
        const price = parseInt(room.price);
        if (filters.priceRange === 'low') return price < 200;
        if (filters.priceRange === 'medium') return price >= 200 && price <= 500;
        if (filters.priceRange === 'high') return price > 500;
        return true;
      });
    }

    // 3. Sắp xếp
    if (filters.sort === 'price-asc') {
      result.sort((a, b) => parseInt(a.price) - parseInt(b.price));
    } else if (filters.sort === 'price-desc') {
      result.sort((a, b) => parseInt(b.price) - parseInt(a.price));
    }

    setFilteredRooms(result);
  }, [filters, rooms]);

  // Hàm xử lý khi người dùng nhập liệu
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Header />

      {/* --- BANNER TRANG ROOMS --- */}
      <section className="breadcumb-area bg-img d-flex align-items-center justify-content-center" style={{backgroundImage: "url('/img/bg-img/bg-1.jpg')"}}>
        <div className="bradcumbContent">
          <h2>Rooms</h2>
        </div>
      </section>

      {/* --- THANH TÌM KIẾM & LỌC (SEARCH BAR) --- */}
      <section className="room-search-area mb-50 mt-50">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="search-form-container p-4 shadow-sm" style={{backgroundColor: '#f8f9fa', borderRadius: '5px', borderLeft: '5px solid #8586e9'}}>
                <h4 className="mb-3" style={{color: '#555'}}>Tìm phòng theo nhu cầu</h4>
                <div className="row">
                  
                  {/* Input Tìm tên/mô tả */}
                  <div className="col-md-5 mb-3">
                    <label>Tên phòng hoặc đặc điểm</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="VD: View biển, Deluxe..." 
                      name="keyword"
                      value={filters.keyword}
                      onChange={handleFilterChange}
                    />
                  </div>

                  {/* Select Khoảng giá */}
                  <div className="col-md-3 mb-3">
                    <label>Khoảng giá</label>
                    <select className="form-control" name="priceRange" value={filters.priceRange} onChange={handleFilterChange}>
                      <option value="all">Tất cả mức giá</option>
                      <option value="low">Giá rẻ (Dưới $200)</option>
                      <option value="medium">Phổ thông ($200 - $500)</option>
                      <option value="high">Cao cấp (Trên $500)</option>
                    </select>
                  </div>

                  {/* Select Sắp xếp */}
                  <div className="col-md-4 mb-3">
                    <label>Sắp xếp theo</label>
                    <select className="form-control" name="sort" value={filters.sort} onChange={handleFilterChange}>
                      <option value="default">Mặc định</option>
                      <option value="price-asc">Giá: Thấp đến Cao</option>
                      <option value="price-desc">Giá: Cao đến Thấp</option>
                    </select>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- DANH SÁCH PHÒNG (HIỂN THỊ KẾT QUẢ) --- */}
      <section className="rooms-area section-padding-0-100">
        <div className="container">
          <div className="row justify-content-center">
            
            {/* Nếu có kết quả thì map ra, nếu không thì báo lỗi */}
            {filteredRooms.length > 0 ? (
              filteredRooms.map(room => (
                <div className="col-12 col-md-6 col-lg-4" key={room.id}>
                  <div className="single-rooms-area wow fadeInUp" data-wow-delay="100ms">
                    
                    {/* Ảnh phòng */}
                    <div className="bg-thumbnail bg-img" style={{backgroundImage: `url(${room.image})`}}></div>
                    
                    {/* Giá tiền nổi bật */}
                    <p className="price-from">Chỉ từ ${room.price}/đêm</p>
                    
                    {/* Nội dung mô tả */}
                    <div className="rooms-text">
                      <div className="line"></div>
                      <h4>{room.name}</h4>
                      <p>{room.description.length > 80 ? room.description.substring(0, 80) + '...' : room.description}</p>
                    </div>
                    
                    {/* Nút đặt phòng */}
                    <Link to={`/booking/${room.id}`} className="book-room-btn btn palatin-btn">Đặt Phòng</Link>
                  </div>
                </div>
              ))
            ) : (
              // Giao diện khi không tìm thấy phòng
              <div className="col-12 text-center py-5">
                <h3 className="text-muted">😢 Không tìm thấy phòng nào phù hợp!</h3>
                <p>Vui lòng thử lại với từ khóa hoặc khoảng giá khác.</p>
                <button 
                  className="btn palatin-btn mt-3" 
                  onClick={() => setFilters({keyword: '', priceRange: 'all', sort: 'default'})}
                >
                  Xem tất cả phòng
                </button>
              </div>
            )}

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Rooms;