SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0; -- (Dòng này thường có sẵn)
CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

-- 1. XÓA SẠCH DỮ LIỆU CŨ
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `room_types`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;


-- 2. TẠO LẠI CÁC BẢNG
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `room_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(100) NOT NULL,
  `price` int NOT NULL,
  `description` text,
  `adult` int DEFAULT 2,
  `children` int DEFAULT 1,
  `image` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(20) NOT NULL,
  `room_types_id` int NOT NULL,
  `status` enum('available','booked','maintenance') DEFAULT 'available',
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_number` (`room_number`),
  KEY `fk_room_type` (`room_types_id`),
  CONSTRAINT `fk_room_type` FOREIGN KEY (`room_types_id`) REFERENCES `room_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `users_id` int NOT NULL,
  `rooms_id` int NOT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `total_price` int NOT NULL,
  `status` enum('Unpaid','Paid','Pay at Hotel') DEFAULT 'Unpaid',
  `paymentMethod` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_booking_user` (`users_id`),
  KEY `fk_booking_room` (`rooms_id`),
  CONSTRAINT `fk_booking_room` FOREIGN KEY (`rooms_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_user` FOREIGN KEY (`users_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. NẠP DỮ LIỆU (CHỈ 1 PHÒNG CHO MỖI LOẠI)

-- Thêm Users
INSERT INTO `users` (`username`, `password`, `full_name`, `email`, `phone`) VALUES 
('admin', 'admin123', 'Quản Trị Viên', 'admin@hotel.com', '0909000111'),
('user', '123456', 'Nguyễn Văn A', 'khachhang@gmail.com', '0909000222');

-- Thêm 5 Loại phòng
INSERT INTO `room_types` (`id`, `type`, `price`, `description`, `image`) VALUES 
(1, 'Deluxe Sea View', 300, 'Phòng hướng biển tuyệt đẹp với ban công rộng.', 'https://theempyreanhotel.com/storage/deluxe-ocean-view-01-852xauto.jpg'),
(2, 'Single Room Corner', 120, 'Phòng đơn góc yên tĩnh, view vườn.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'),
(3, 'Single Room Sea View', 180, 'Phòng đơn view biển, thoáng đãng.', 'https://lh4.googleusercontent.com/proxy/zWEkphlfnVRYNsa5Td8xMjNR7f9QVcAe7F_lHjMRnYuKbtkxwudm-0VBYwcYvR5FGOfBQWaOZDkSKbpn'),
(4, 'Family Suite', 550, 'Căn hộ gia đình 2 phòng ngủ.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'),
(5, 'Deluxe Top', 900, 'Penthouse tầng cao nhất.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80');

-- Thêm ĐÚNG 5 PHÒNG (Mỗi loại 1 phòng duy nhất để không bị trùng hiển thị)
INSERT INTO `rooms` (`room_number`, `room_types_id`, `status`) VALUES 
('101', 1, 'available'), -- 1 phòng Deluxe Sea
('102', 2, 'available'), -- 1 phòng Single Corner
('103', 3, 'available'), -- 1 phòng Single Sea
('104', 4, 'available'), -- 1 phòng Family
('105', 5, 'available'); -- 1 phòng Deluxe Top


ALTER TABLE bookings
ADD COLUMN people_count INT DEFAULT 1,
ADD COLUMN room_count INT DEFAULT 1;

ALTER TABLE bookings
ADD COLUMN guest_name VARCHAR(100),
ADD COLUMN guest_phone VARCHAR(20),
ADD COLUMN guest_email VARCHAR(100),
ADD COLUMN guest_requests TEXT;
USE hotel_db;

-- 1. Cho phép mật khẩu để trống (cho user Google)
ALTER TABLE users MODIFY password VARCHAR(255) NULL;