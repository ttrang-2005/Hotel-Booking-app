# back-end/Dockerfile

# 1. Dùng Node.js bản nhẹ (alpine)
FROM node:18-alpine

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy file package.json trước để cài thư viện (tận dụng cache)
COPY package*.json ./

# 4. Cài đặt thư viện
RUN npm install

# 5. Copy toàn bộ code còn lại vào
COPY . .

# 6. Mở cổng 3000 (Cổng backend của bạn)
EXPOSE 3000

# 7. Lệnh chạy server
CMD ["node", "server.js"]