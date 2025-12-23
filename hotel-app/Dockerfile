# hotel-app/Dockerfile

# --- STAGE 1: Build ---
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- STAGE 2: Serve bằng Nginx ---
FROM nginx:alpine as production-stage
# Copy file đã build từ Stage 1 sang folder của Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy file cấu hình Nginx (ta sẽ tạo ở bước sau)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]