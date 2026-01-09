# Tích hợp Thanh toán Casso

Tài liệu này mô tả cách tích hợp thanh toán Casso cho chức năng upgrade subscription.

## Tổng quan

Hệ thống đã được tích hợp với Casso để xử lý thanh toán cho subscription upgrade. Khi người dùng muốn nâng cấp, hệ thống sẽ:

1. Tạo subscription với status `PENDING`
2. Tạo payment request với Casso
3. Tạo mã QR VietQR để người dùng thanh toán
4. Nhận webhook từ Casso khi thanh toán thành công
5. Tự động kích hoạt subscription khi thanh toán hoàn tất

## Cấu hình môi trường

Thêm các biến môi trường sau vào file `.env`:

```env
# Casso Configuration
CASSO_API_KEY=your_casso_api_key
CASSO_WEBHOOK_SECRET=your_webhook_secret
CASSO_BANK_ACCOUNT=your_bank_account_number
CASSO_BANK_NAME=your_bank_name
CASSO_BASE_URL=https://oauth.casso.vn/v2

# Subscription Currency
SUBSCRIPTION_CURRENCY=VND
```

**Lưu ý:** Giá subscription đã được hardcode trong code:
- Gói tháng: 99,000 VND
- Gói năm: 990,000 VND

Để thay đổi giá, chỉnh sửa trong file `payment.service.ts`.

## Hướng dẫn lấy thông tin cấu hình

### 1. CASSO_API_KEY

**Cách lấy:**

1. **Đăng ký tài khoản Casso:**
   - Truy cập: https://casso.vn/
   - Đăng ký tài khoản doanh nghiệp/cá nhân
   - Xác thực thông tin theo yêu cầu

2. **Tạo API Key:**
   - Đăng nhập vào dashboard Casso
   - Vào mục **"API"** hoặc **"Developer"** hoặc **"Cài đặt"**
   - Tạo mới **API Key**
   - Copy và lưu API Key

3. **Tài liệu tham khảo:**
   - https://developer.casso.vn/
   - https://api.casso.vn/

### 2. CASSO_WEBHOOK_SECRET

**Cách lấy:**

1. **Thiết lập Webhook trong Casso Dashboard:**
   - Vào phần **"Webhook"** hoặc **"Thông báo"**
   - Tạo webhook mới với URL: `https://your-domain.com/api/v1/webhooks/casso`
   - Hệ thống sẽ cung cấp **Webhook Secret** để xác thực
   - Copy và lưu secret này

2. **Lưu ý:**
   - Webhook Secret dùng để verify request từ Casso là hợp lệ
   - Nên sử dụng HTTPS cho webhook URL
   - Test webhook trong môi trường development trước

### 3. CASSO_BANK_ACCOUNT và CASSO_BANK_NAME

**Cách lấy:**

1. **Thông tin tài khoản ngân hàng của bạn:**
   - Đây là **số tài khoản ngân hàng** mà bạn muốn nhận thanh toán
   - Ví dụ: `1234567890` (không có dấu cách, dấu chấm)

2. **CASSO_BANK_NAME:**
   - Tên ngân hàng theo format của VietQR (viết tắt, không dấu)
   - Các ngân hàng phổ biến:
     - `VCB` - Vietcombank
     - `TCB` - Techcombank
     - `VTB` - VietinBank
     - `ACB` - ACB
     - `VPB` - VPBank
     - `MSB` - MSB
     - `TPB` - TPBank
     - `HDB` - HDBank
     - `OCB` - OCB
     - `MB` - MBBank
     - Xem đầy đủ tại: https://vietqr.io/danh-sach-ngan-hang

3. **Ví dụ:**
   ```env
   CASSO_BANK_ACCOUNT=1234567890
   CASSO_BANK_NAME=VCB
   ```

### 4. Giá Subscription

**Giá đã được hardcode trong code:**

Giá subscription được định nghĩa trực tiếp trong file `payment.service.ts`:
- **Gói tháng:** 99,000 VND
- **Gói năm:** 990,000 VND

**Để thay đổi giá:**

Chỉnh sửa trong file `src/backend/src/modules/subscription/payment.service.ts`:

```typescript
// Tính toán số tiền (hardcoded prices)
const monthlyPrice = 99000; // Thay đổi giá tháng ở đây
const yearlyPrice = 990000; // Thay đổi giá năm ở đây
```

### 5. CASSO_BASE_URL

**Giá trị mặc định:**
```env
CASSO_BASE_URL=https://oauth.casso.vn/v2
```

- Thường không cần thay đổi
- Chỉ thay đổi nếu Casso cung cấp URL khác cho môi trường test/production

## Checklist thiết lập

- [ ] Đăng ký tài khoản Casso
- [ ] Tạo và lưu API Key + API Secret
- [ ] Thiết lập Webhook và lưu Webhook Secret
- [ ] Xác định số tài khoản ngân hàng nhận tiền
- [ ] Xác định mã ngân hàng (VCB, TCB, etc.)
- [ ] Quyết định giá subscription (tháng/năm)
- [ ] Thêm tất cả vào file `.env`
- [ ] Test kết nối với Casso API
- [ ] Test webhook trong môi trường development

## API Endpoints

### Tạo Payment cho Subscription

```
POST /api/v1/subscription/payment
Authorization: Bearer <token>
Body: {
  "subscriptionId": "uuid"
}
```

### Tạo Subscription và Payment cùng lúc

```
POST /api/v1/subscription/payment/create-subscription
Authorization: Bearer <token>
Body: {
  "planType": "MONTHLY" | "YEARLY",
  "autoRenew": true
}
```

### Lấy danh sách Payments của user

```
GET /api/v1/subscription/payment/my
Authorization: Bearer <token>
```

### Xác minh Payment thủ công

```
POST /api/v1/subscription/payment/:id/verify
Authorization: Bearer <token>
Body: {
  "transactionId": "casso_transaction_id"
}
```

### Webhook từ Casso

```
POST /api/v1/webhooks/casso
Headers: {
  "x-casso-signature": "signature"
}
Body: <Casso webhook data>
```

## Database Migration

Chạy migration để tạo bảng payment:

```bash
npm run migration:run
```

Migration file: `1700000000013-CreatePaymentTable.ts`

## Luồng xử lý thanh toán

1. **User tạo subscription**: 
   - Subscription được tạo với status `PENDING`
   - User chưa được kích hoạt PRO

2. **Tạo payment**:
   - Payment record được tạo với status `PENDING`
   - Gọi Casso API để tạo transaction
   - Tạo mã QR VietQR
   - Trả về payment URL (QR code) cho frontend

3. **User thanh toán**:
   - User quét QR code và thanh toán qua ngân hàng
   - Casso nhận được thông báo từ ngân hàng

4. **Webhook từ Casso**:
   - Casso gửi webhook đến `/api/v1/webhooks/casso`
   - Hệ thống xác minh signature
   - Cập nhật payment status thành `COMPLETED`
   - Tự động kích hoạt subscription (status `ACTIVE`)
   - Cập nhật user status thành `PRO`

5. **Xác minh thủ công** (nếu webhook không hoạt động):
   - User có thể gọi API verify payment
   - Hệ thống kiểm tra với Casso API
   - Kích hoạt subscription nếu thanh toán thành công

## Admin Endpoints

### Lấy tất cả Payments

```
GET /api/v1/admin/payments?page=1&limit=20&status=COMPLETED&paymentMethod=CASSO
Authorization: Bearer <admin_token>
```

### Lấy thống kê Payments

```
GET /api/v1/admin/payments/stats
Authorization: Bearer <admin_token>
```

### Refund Payment

```
POST /api/v1/admin/payments/:id/refund
Authorization: Bearer <admin_token>
Body: {
  "reason": "Refund reason"
}
```

## Lưu ý

1. **Webhook Security**: Cần implement HMAC-SHA256 verification cho webhook signature (hiện tại đang skip verification nếu không có webhookSecret)

2. **VietQR**: Cần cấu hình đúng bankName và bankAccount để tạo QR code chính xác

3. **Error Handling**: Hệ thống sẽ log lỗi nhưng vẫn tạo payment record để có thể xử lý sau

4. **Subscription Status**: Subscription chỉ được kích hoạt sau khi payment status là `COMPLETED`

## Testing

1. Tạo subscription với status PENDING
2. Tạo payment và lấy QR code
3. Test webhook với dữ liệu mẫu từ Casso
4. Verify payment thủ công nếu cần

## Tài liệu tham khảo

- [Casso API Documentation](https://developer.casso.vn/)
- [VietQR API](https://vietqr.io/)

