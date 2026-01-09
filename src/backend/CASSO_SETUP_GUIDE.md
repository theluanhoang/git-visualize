# Hướng dẫn thiết lập Casso từng bước

## Bước 1: Đăng ký tài khoản Casso

1. Truy cập: **https://casso.vn/**
2. Click **"Đăng ký"** hoặc **"Tạo tài khoản"**
3. Điền thông tin:
   - Email
   - Số điện thoại
   - Mật khẩu
   - Thông tin doanh nghiệp/cá nhân
4. Xác thực email và số điện thoại
5. Hoàn tất đăng ký

## Bước 2: Liên kết tài khoản ngân hàng

1. Đăng nhập vào dashboard Casso
2. Vào mục **"Tài khoản ngân hàng"** hoặc **"Ngân hàng"**
3. Chọn ngân hàng của bạn từ danh sách
4. Nhập thông tin:
   - Số tài khoản
   - Mật khẩu Internet Banking (hoặc OTP)
5. Xác thực và liên kết thành công
6. **Lưu lại:**
   - Số tài khoản → `CASSO_BANK_ACCOUNT`
   - Mã ngân hàng → `CASSO_BANK_NAME` (xem bảng dưới)

### Bảng mã ngân hàng phổ biến:

| Ngân hàng | Mã VietQR | Ví dụ |
|-----------|-----------|-------|
| Vietcombank | VCB | `VCB` |
| Techcombank | TCB | `TCB` |
| VietinBank | VTB | `VTB` |
| ACB | ACB | `ACB` |
| VPBank | VPB | `VPB` |
| MSB | MSB | `MSB` |
| TPBank | TPB | `TPB` |
| HDBank | HDB | `HDB` |
| OCB | OCB | `OCB` |
| MBBank | MB | `MB` |
| BIDV | BID | `BID` |
| Agribank | VBA | `VBA` |

**Xem đầy đủ:** https://vietqr.io/danh-sach-ngan-hang

## Bước 3: Tạo API Credentials

1. Trong dashboard Casso, tìm mục:
   - **"API"** hoặc
   - **"Developer"** hoặc
   - **"Tích hợp"** hoặc
   - **"Cài đặt" → "API"**

2. Click **"Tạo API Key"** hoặc **"Tạo mới"**

3. Điền thông tin:
   - Tên ứng dụng: `Git Visualize Engine`
   - Mô tả: `Payment integration for subscription`
   - Quyền truy cập: Chọn các quyền cần thiết

4. Sau khi tạo, hệ thống sẽ hiển thị:
   - **API Key** → Copy và lưu → `CASSO_API_KEY`

5. Lưu vào file `.env`:
   ```env
   CASSO_API_KEY=sk_live_xxxxxxxxxxxxx
   ```

## Bước 4: Thiết lập Webhook

1. Trong dashboard Casso, vào mục **"Webhook"** hoặc **"Thông báo"**

2. Click **"Tạo Webhook mới"** hoặc **"Thêm Webhook"**

3. Điền thông tin:
   - **URL Webhook:** `https://your-domain.com/api/v1/webhooks/casso`
     - Development: `http://localhost:8000/api/v1/webhooks/casso`
     - Production: `https://api.yourdomain.com/api/v1/webhooks/casso`
   - **Sự kiện:** Chọn `Giao dịch mới` hoặc `Transaction Created`
   - **Method:** `POST`

4. Sau khi tạo, hệ thống sẽ cung cấp:
   - **Webhook Secret** → Copy và lưu → `CASSO_WEBHOOK_SECRET`

5. Lưu vào file `.env`:
   ```env
   CASSO_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

6. **Test Webhook:**
   - Casso có thể gửi test webhook
   - Hoặc bạn có thể test bằng cách tạo giao dịch thử

## Bước 5: Thiết lập giá subscription

Giá subscription đã được hardcode trong code:
- **Gói tháng:** 99,000 VND
- **Gói năm:** 990,000 VND

**Để thay đổi giá:**

Chỉnh sửa trong file `src/backend/src/modules/subscription/payment.service.ts`:

```typescript
// Tính toán số tiền (hardcoded prices)
const monthlyPrice = 99000; // Thay đổi giá tháng ở đây
const yearlyPrice = 990000; // Thay đổi giá năm ở đây
```

## Bước 6: Hoàn tất cấu hình

File `.env` của bạn sẽ trông như sau:

```env
# Casso Configuration
CASSO_API_KEY=sk_live_xxxxxxxxxxxxx
CASSO_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
CASSO_BANK_ACCOUNT=1234567890
CASSO_BANK_NAME=VCB
CASSO_BASE_URL=https://oauth.casso.vn/v2

# Subscription Currency
SUBSCRIPTION_CURRENCY=VND
```

**Lưu ý:** Giá subscription (99,000 VND/tháng và 990,000 VND/năm) đã được hardcode trong code tại `payment.service.ts`.

## Bước 7: Test kết nối

1. **Chạy migration:**
   ```bash
   cd src/backend
   npm run migration:run
   ```

2. **Khởi động server:**
   ```bash
   npm run start:dev
   ```

3. **Test API:**
   - Tạo subscription: `POST /api/v1/subscription/payment/create-subscription`
   - Kiểm tra payment được tạo và có QR code
   - Test webhook với dữ liệu mẫu

## Troubleshooting

### Không tìm thấy mục "API" trong dashboard?
- Liên hệ support Casso: support@casso.vn
- Hoặc hotline: 0974 792 484
- Có thể cần nâng cấp gói dịch vụ để có quyền truy cập API

### Webhook không nhận được?
- Kiểm tra URL webhook có đúng không
- Kiểm tra server có expose được public URL không
- Sử dụng ngrok để test local: `ngrok http 8000`
- Kiểm tra firewall và security groups

### API Key không hoạt động?
- Kiểm tra API Key có đúng không
- Kiểm tra quyền truy cập của API Key
- Kiểm tra base URL có đúng không
- Xem logs để biết lỗi cụ thể

## Tài liệu tham khảo

- **Casso Website:** https://casso.vn/
- **Casso Developer:** https://developer.casso.vn/
- **Casso API Docs:** https://api.casso.vn/
- **VietQR:** https://vietqr.io/
- **Support:** support@casso.vn | 0974 792 484

