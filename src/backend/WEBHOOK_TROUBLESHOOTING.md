# Khắc phục lỗi Webhook: ECONNREFUSED 127.0.0.1:8000

## Vấn đề

Khi test webhook từ Casso, bạn gặp lỗi:
```json
{
  "httpStatusCode": 500,
  "errorMessage": "connect ECONNREFUSED 127.0.0.1:8000",
  "responseBody": "{}"
}
```

## Nguyên nhân

**Casso không thể kết nối đến `localhost` hoặc `127.0.0.1`** vì:
- Localhost chỉ có thể truy cập từ máy tính của bạn
- Casso server ở xa không thể truy cập localhost của bạn
- Cần một URL công khai (public URL) để Casso gửi webhook

## Giải pháp

### Giải pháp 1: Sử dụng Ngrok (Development/Testing)

**Ngrok** là công cụ tạo tunnel để expose local server ra internet.

#### Bước 1: Đăng ký tài khoản Ngrok

1. Truy cập: https://dashboard.ngrok.com/signup
2. Đăng ký tài khoản miễn phí (có thể dùng GitHub/Google)
3. Xác thực email

#### Bước 2: Lấy và cấu hình Authtoken

1. Vào: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy **authtoken** của bạn
3. Cấu hình authtoken:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```
   (Thay `YOUR_AUTHTOKEN` bằng token bạn vừa copy)

#### Bước 3: Khởi động server của bạn

```bash
cd src/backend
npm run start:dev
```

Server sẽ chạy tại `http://localhost:8000`

#### Bước 4: Khởi động Ngrok

Mở terminal mới và chạy:
```bash
ngrok http 8000
```

Bạn sẽ thấy output như sau:
```
ngrok

Session Status                online
Account                       Your Account
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy URL forwarding:** `https://abc123.ngrok-free.app`

#### Bước 5: Cập nhật Webhook URL trong Casso

1. Vào Casso Dashboard → Webhook settings
2. Cập nhật Webhook URL thành:
   ```
   https://abc123.ngrok-free.app/api/v1/webhooks/casso
   ```
   (Thay `abc123.ngrok-free.app` bằng URL ngrok của bạn)

3. Lưu và test lại

#### Bước 6: Test Webhook

- Casso sẽ gửi test webhook đến URL mới
- Kiểm tra terminal của ngrok để xem request
- Kiểm tra logs của server để xem webhook data

**Lưu ý:**
- URL ngrok miễn phí sẽ thay đổi mỗi lần restart
- Để có URL cố định, cần upgrade ngrok plan
- Ngrok chỉ dùng cho development/testing

### Giải pháp 2: Sử dụng LocalTunnel (Không cần đăng ký)

**LocalTunnel** là công cụ miễn phí, không cần đăng ký để expose local server.

#### Bước 1: Cài đặt LocalTunnel

```bash
npm install -g localtunnel
```

#### Bước 2: Khởi động Server

```bash
cd src/backend
npm run start:dev
```

#### Bước 3: Chạy LocalTunnel

```bash
lt --port 8000
```

Bạn sẽ thấy output:
```
your url is: https://random-name.loca.lt
```

#### Bước 4: Cập nhật Webhook URL

Cập nhật trong Casso Dashboard:
```
https://random-name.loca.lt/api/v1/webhooks/casso
```

**Lưu ý:**
- URL sẽ thay đổi mỗi lần chạy
- Có thể chỉ định subdomain: `lt --port 8000 --subdomain myapp`
- Miễn phí, không cần đăng ký

### Giải pháp 3: Sử dụng Cloudflare Tunnel (Miễn phí, URL cố định)

**Cloudflare Tunnel** cho phép expose local server với URL cố định miễn phí.

#### Bước 1: Cài đặt cloudflared

```bash
# Linux
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Hoặc dùng snap
sudo snap install cloudflared
```

#### Bước 2: Đăng nhập Cloudflare

```bash
cloudflared tunnel login
```

#### Bước 3: Tạo Tunnel

```bash
cloudflared tunnel create git-visualize
```

#### Bước 4: Chạy Tunnel

```bash
cloudflared tunnel run git-visualize
```

Sẽ có URL như: `https://xxxx.trycloudflare.com`

#### Bước 5: Cập nhật Webhook URL

```
https://xxxx.trycloudflare.com/api/v1/webhooks/casso
```

### Giải pháp 4: Deploy lên Server công khai (Production)

#### Option A: Deploy lên VPS/Cloud Server

1. **Deploy code lên server:**
   ```bash
   # Clone repo
   git clone your-repo
   cd git-visulize-engine
   
   # Install dependencies
   cd src/backend
   npm install
   
   # Build
   npm run build
   
   # Start với PM2
   pm2 start dist/main.js --name backend
   ```

2. **Cấu hình Domain/Subdomain:**
   - Trỏ domain đến IP server
   - Cấu hình Nginx reverse proxy
   - Setup SSL certificate (Let's Encrypt)

3. **Cập nhật Webhook URL:**
   ```
   https://api.yourdomain.com/api/v1/webhooks/casso
   ```

#### Option B: Sử dụng dịch vụ Cloud

**Vercel/Netlify/Railway:**
- Deploy backend lên các platform này
- Sẽ có URL công khai tự động
- Cập nhật webhook URL trong Casso

**Ví dụ với Railway:**
1. Push code lên GitHub
2. Connect Railway với GitHub repo
3. Deploy tự động
4. Lấy URL từ Railway dashboard
5. Cập nhật webhook: `https://your-app.railway.app/api/v1/webhooks/casso`

### Giải pháp 3: Sử dụng Cloudflare Tunnel (Miễn phí, URL cố định)

Cloudflare Tunnel cho phép expose local server với URL cố định miễn phí.

1. **Cài đặt cloudflared:**
   ```bash
   # Linux
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   ```

2. **Tạo tunnel:**
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create git-visualize
   ```

3. **Cấu hình tunnel:**
   ```bash
   cloudflared tunnel route dns git-visualize webhook.yourdomain.com
   ```

4. **Chạy tunnel:**
   ```bash
   cloudflared tunnel run git-visualize
   ```

5. **Webhook URL:**
   ```
   https://webhook.yourdomain.com/api/v1/webhooks/casso
   ```

## Kiểm tra Webhook hoạt động

### 1. Kiểm tra Server đang chạy

```bash
# Kiểm tra port 8000
curl http://localhost:8000/api/v1/webhooks/casso
# Hoặc
netstat -tuln | grep 8000
```

### 2. Test Webhook thủ công

**Với ngrok:**
```bash
curl -X POST https://your-ngrok-url.ngrok.io/api/v1/webhooks/casso \
  -H "Content-Type: application/json" \
  -H "x-casso-signature: test-signature" \
  -d '{
    "id": "test-id",
    "tid": "test-tid",
    "amount": 99000,
    "description": "Test payment",
    "when": "2024-01-06T15:23:44.000Z",
    "corresponsiveAccount": "1234567890",
    "corresponsiveBankName": "VCB"
  }'
```

### 3. Xem Logs

**Server logs:**
```bash
# Nếu dùng npm run start:dev
# Logs sẽ hiển thị trong terminal

# Nếu dùng PM2
pm2 logs backend
```

**Ngrok logs:**
- Mở http://127.0.0.1:4040 trong browser
- Xem tất cả requests đến ngrok tunnel

## Checklist

- [ ] Server đang chạy tại port 8000
- [ ] Ngrok đang chạy và forwarding đến port 8000
- [ ] Webhook URL trong Casso đã được cập nhật với URL công khai
- [ ] URL sử dụng HTTPS (bắt buộc cho production)
- [ ] Webhook Secret đã được cấu hình đúng
- [ ] Test webhook từ Casso dashboard

## Lưu ý quan trọng

1. **HTTPS bắt buộc:**
   - Production phải dùng HTTPS
   - Ngrok tự động cung cấp HTTPS
   - Localhost chỉ dùng cho development

2. **URL ngrok thay đổi:**
   - URL miễn phí thay đổi mỗi lần restart
   - Cần upgrade để có URL cố định
   - Hoặc dùng Cloudflare Tunnel (miễn phí, URL cố định)

3. **Security:**
   - Luôn verify webhook signature
   - Không expose localhost trong production
   - Sử dụng firewall để bảo vệ server

## Tài liệu tham khảo

- [Ngrok Documentation](https://ngrok.com/docs)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Casso Webhook Documentation](https://developer.casso.vn/webhook/)

