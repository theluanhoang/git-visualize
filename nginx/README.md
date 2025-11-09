# Nginx Configuration

Cấu trúc folder chuyên nghiệp cho Nginx configuration.

## Cấu Trúc

```
nginx/
├── nginx.conf              # Main configuration file
├── conf.d/                 # Configuration directory
│   ├── upstream.conf       # Upstream definitions (backend, frontend)
│   ├── server.conf         # Server block configuration
│   ├── ssl.conf.example    # SSL/HTTPS configuration example
│   └── rate-limiting.conf  # Rate limiting configuration
└── README.md               # This file
```

## Files

### `nginx.conf`
Main configuration file. Includes upstream and server configurations.

### `conf.d/upstream.conf`
Định nghĩa upstream servers cho backend và frontend.
- Có thể thêm nhiều backend/frontend instances cho load balancing
- Cấu hình keepalive connections

### `conf.d/server.conf`
Server block configuration cho HTTP (port 80).
- API routes (`/api`)
- WebSocket support (`/socket.io`)
- Swagger docs (`/docs`)
- Frontend routes (`/`)
- Health check (`/health`)

### `conf.d/ssl.conf.example`
Example configuration cho SSL/HTTPS.
- Copy thành `ssl.conf` và cấu hình certificates
- Uncomment để enable HTTPS

### `conf.d/rate-limiting.conf`
Rate limiting configuration.
- Uncomment và điều chỉnh limits theo nhu cầu
- Bảo vệ API khỏi abuse

## Cách Sử Dụng

### Development
Sử dụng cấu hình mặc định (HTTP only):
```yaml
volumes:
  - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  - ./nginx/conf.d:/etc/nginx/conf.d:ro
```

### Production với SSL
1. Copy `ssl.conf.example` thành `ssl.conf`
2. Cấu hình SSL certificates
3. Uncomment các dòng trong `ssl.conf`
4. Mount thêm SSL certificates:
```yaml
volumes:
  - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  - ./nginx/conf.d:/etc/nginx/conf.d:ro
  - ./nginx/ssl:/etc/nginx/ssl:ro  # SSL certificates
```

## Cấu Hình SSL

1. Tạo folder cho SSL certificates:
```bash
mkdir -p nginx/ssl
```

2. Copy certificates vào `nginx/ssl/`:
```bash
cp cert.pem nginx/ssl/
cp key.pem nginx/ssl/
```

3. Cập nhật `conf.d/ssl.conf` với đường dẫn certificates

4. Uncomment các dòng trong `ssl.conf`

## Rate Limiting

Để enable rate limiting:

1. Uncomment các dòng trong `conf.d/rate-limiting.conf`
2. Điều chỉnh limits theo nhu cầu:
   - `rate=10r/s`: 10 requests per second
   - `burst=20`: Allow burst of 20 requests

## Load Balancing

Để thêm load balancing, uncomment và cấu hình trong `conf.d/upstream.conf`:

```nginx
upstream backend {
    server backend:8000;
    server backend2:8000;  # Add more instances
    keepalive 32;
}
```

## Troubleshooting

### Kiểm tra cấu hình
```bash
docker exec gv_nginx_prod nginx -t
```

### Xem logs
```bash
docker logs gv_nginx_prod
```

### Reload configuration
```bash
docker exec gv_nginx_prod nginx -s reload
```


