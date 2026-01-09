# Hướng dẫn thiết lập Ngrok

## Bước 1: Đăng ký tài khoản Ngrok

1. Truy cập: https://dashboard.ngrok.com/signup
2. Đăng ký tài khoản miễn phí (có thể dùng GitHub/Google)
3. Xác thực email

## Bước 2: Lấy Authtoken

1. Sau khi đăng nhập, vào: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy **authtoken** của bạn (dạng: `2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5`)

## Bước 3: Cấu hình Authtoken

Chạy lệnh sau (thay `YOUR_AUTHTOKEN` bằng token bạn vừa copy):

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

Ví dụ:
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5
```

## Bước 4: Khởi động Ngrok

```bash
ngrok http 8000
```

Bạn sẽ thấy output:
```
Session Status                online
Account                       Your Account
Version                       3.x.x
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:8000
```

## Bước 5: Sử dụng URL cho Webhook

Copy URL forwarding và cập nhật trong Casso Dashboard:
```
https://abc123.ngrok-free.app/api/v1/webhooks/casso
```

## Giải pháp thay thế (Không cần đăng ký)

Nếu không muốn đăng ký ngrok, có thể dùng các công cụ khác:

### Option 1: Cloudflare Tunnel (Miễn phí, URL cố định)

```bash
# Cài đặt cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Đăng nhập
cloudflared tunnel login

# Tạo tunnel
cloudflared tunnel create git-visualize

# Chạy tunnel
cloudflared tunnel run git-visualize
```

### Option 2: LocalTunnel (Không cần đăng ký)

```bash
# Cài đặt
npm install -g localtunnel

# Chạy tunnel
lt --port 8000
```

Sẽ có URL như: `https://random-name.loca.lt`

### Option 3: Serveo (SSH Tunnel, không cần cài đặt)

```bash
ssh -R 80:localhost:8000 serveo.net
```

### Option 4: Deploy lên Server công khai

Deploy code lên VPS/Cloud và sử dụng domain công khai.



