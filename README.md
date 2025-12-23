# 🏨 Hotel Booking System (Web Đặt Phòng Khách Sạn)

Dự án Website quản lý và đặt phòng khách sạn Fullstack. Hỗ trợ đặt phòng cho khách hàng và quản lý phòng/đơn hàng cho Admin.

## 🛠️ Công Nghệ Sử Dụng

* **Frontend:** ReactJS (Vite), Bootstrap, Axios.
* **Backend:** Node.js, Express.js.
* **Database:** MySQL.
* **Containerization:** Docker & Docker Compose.

---

## 🚀 CÁCH 1: Chạy Bằng Docker (Khuyên Dùng)
Đây là cách nhanh nhất để chạy dự án mà không cần cài đặt Node.js hay MySQL trên máy.

**Yêu cầu:** Máy tính đã cài [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### Các bước thực hiện:
1.  Mở Terminal tại thư mục gốc của dự án.
2.  Chạy lệnh sau để dựng và khởi động toàn bộ hệ thống:
    ```bash
    docker-compose up --build
    ```
3.  Chờ vài phút cho đến khi quá trình cài đặt hoàn tất.
4.  Truy cập Website tại: **`http://localhost:8080`**

*(Để tắt server, nhấn `Ctrl + C` hoặc chạy lệnh `docker-compose down`)*.

---

## 💻 CÁCH 2: Chạy Thủ Công (Dành cho Dev/Sửa Code)
Dùng cách này nếu bạn muốn chạy môi trường phát triển để sửa code trực tiếp.

**Yêu cầu:** Đã cài Node.js và MySQL Workbench.

### Bước 1: Cài đặt Database
1.  Mở **MySQL Workbench**.
2.  Tạo kết nối localhost (Port 3306).
3.  Import file SQL (`Dump20251222.sql` hoặc file mới nhất) và chạy (Execute) để tạo database `hotel_db`.

### Bước 2: Cài đặt & Chạy Backend
1.  Di chuyển vào thư mục backend:
    ```bash
    cd back-end
    ```
2.  Cài đặt thư viện:
    ```bash
    npm install
    ```
3.  **Cấu hình Database:**
    * Tạo file `back-end/config/db.js`.
    * Điền thông tin kết nối (Thay `290605` bằng mật khẩu MySQL của bạn):
    ```javascript
    const mysql = require('mysql2');
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '290605', // <--- Sửa ở đây
        database: 'hotel_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
    });
    module.exports = pool.promise();
    ```
4.  Chạy server:
    ```bash
    node server.js
    ```
    *(Backend sẽ chạy tại `http://localhost:3000`)*

### Bước 3: Cài đặt & Chạy Frontend
1.  Mở terminal mới, di chuyển vào thư mục frontend:
    ```bash
    cd hotel-app
    ```
2.  Cài đặt thư viện:
    ```bash
    npm install
    ```
3.  Chạy web:
    ```bash
    npm run dev
    ```
4.  Truy cập link hiện ra (thường là `http://localhost:5173`).

---

## 🔑 Tài Khoản Demo

Dưới đây là tài khoản có sẵn để kiểm tra các chức năng:

| Vai trò | Username | Password | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Quản lý phòng, Xem/Xóa đơn đặt phòng. |
| **User** | `user` | `123456` | Xem phòng, Đặt phòng, Lịch sử đặt chỗ. |

---

## 📂 Cấu Trúc Thư Mục

```text
project-root/
├── back-end/               # Mã nguồn Node.js Server
│   ├── config/             # Cấu hình kết nối DB
│   ├── routes/             # Các API (Auth, Rooms, Bookings)
│   └── server.js           # File khởi chạy server
│
├── hotel-app/              # Mã nguồn ReactJS Client
│   ├── src/
│   │   ├── components/     # Các thành phần giao diện chung
│   │   ├── pages/          # Các trang (Home, Admin, Booking...)
│   │   ├── utils/          # api.js (Xử lý gọi API)
│   │   └── App.jsx         # Điều hướng chính
│   └── vite.config.js      # Cấu hình Vite
│
├── docker-compose.yml      # Cấu hình Docker
├── Dockerfile              # Cấu hình build Image
└── README.md               # Hướng dẫn sử dụng