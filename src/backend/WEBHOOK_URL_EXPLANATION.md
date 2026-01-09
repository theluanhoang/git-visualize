# Webhook URL là gì?

## Khái niệm Webhook

**Webhook** là một cách để một ứng dụng (Casso) gửi thông báo tự động đến ứng dụng khác (server của bạn) khi có sự kiện xảy ra (ví dụ: có giao dịch thanh toán mới).

Thay vì bạn phải liên tục hỏi Casso "có giao dịch mới chưa?" (polling), Casso sẽ **tự động gọi** đến URL của bạn khi có giao dịch.

## Webhook URL trong hệ thống này

### URL đầy đủ

Dựa vào cấu hình trong code:

- **Controller:** `@Controller('webhooks')` → route: `/webhooks`
- **Endpoint:** `@Post('casso')` → route: `/webhooks/casso`
- **Global prefix:** `api` (từ `main.ts`)
- **API versioning:** `v1` (từ `main.ts`)

**Webhook URL đầy đủ:**

```
https://your-domain.com/api/v1/webhooks/casso
```

### Phân tích URL

```
https://your-domain.com  ← Domain của bạn
/api                     ← Global prefix
/v1                      ← API version
/webhooks                ← Controller route
/casso                   ← Endpoint route
```

## Các môi trường

### 1. Development (Local)

```
http://localhost:8000/api/v1/webhooks/casso
```

**Lưu ý:** URL này chỉ hoạt động trên máy local. Để test với Casso, bạn cần:

- Sử dụng **ngrok** để expose local server ra internet:
  ```bash
  ngrok http 8000
  ```
  
- Sau đó dùng URL ngrok:
  ```
  https://xxxx-xxx-xxx-xxx.ngrok.io/api/v1/webhooks/casso
  ```

### 2. Staging/Production

```
https://api.yourdomain.com/api/v1/webhooks/casso
```

hoặc

```
https://yourdomain.com/api/v1/webhooks/casso
```

## Cách thiết lập trong Casso Dashboard

1. **Đăng nhập vào Casso Dashboard**
   - Truy cập: https://casso.vn/
   - Đăng nhập với tài khoản của bạn

2. **Vào mục Webhook**
   - Tìm mục **"Webhook"** hoặc **"Thông báo"** hoặc **"Cài đặt" → "Webhook"**

3. **Tạo Webhook mới**
   - Click **"Tạo Webhook"** hoặc **"Thêm Webhook"**
   - Điền thông tin:
     - **URL:** `https://your-domain.com/api/v1/webhooks/casso`
     - **Method:** `POST`
     - **Sự kiện:** Chọn `Giao dịch mới` hoặc `Transaction Created`
     - **Mô tả:** `Webhook for payment notifications`

4. **Lưu Webhook Secret**
   - Sau khi tạo, Casso sẽ cung cấp **Webhook Secret**
   - Copy và lưu vào `.env`:
     ```env
     CASSO_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
     ```

## Cách Webhook hoạt động

### Luồng xử lý:

1. **User thanh toán:**
   - User quét QR code và chuyển tiền
   - Ngân hàng xử lý giao dịch

2. **Casso nhận thông báo:**
   - Casso nhận được thông báo từ ngân hàng
   - Casso xử lý và lưu giao dịch

3. **Casso gửi Webhook:**
   - Casso gửi POST request đến Webhook URL của bạn
   - Kèm theo:
     - **Body:** Dữ liệu giao dịch (CassoWebhookData)
     - **Header:** `x-casso-signature` (chữ ký để verify)

4. **Server xử lý:**
   - Server nhận webhook tại `/api/v1/webhooks/casso`
   - Verify signature với `CASSO_WEBHOOK_SECRET`
   - Cập nhật payment status thành `COMPLETED`
   - Tự động kích hoạt subscription

## Code xử lý Webhook

Trong file `webhook.controller.ts`:

```typescript
@Post('casso')
async handleCassoWebhook(
  @Body() webhookData: CassoWebhookData,
  @Headers('x-casso-signature') signature?: string,
) {
  // Xử lý webhook data
  const payment = await this.paymentService.handleCassoWebhook(
    webhookData,
    signature,
  );
  
  return {
    success: true,
    paymentId: payment.id,
    status: payment.status,
  };
}
```

## Test Webhook

### 1. Test với ngrok (Development)

```bash
# Terminal 1: Start server
cd src/backend
npm run start:dev

# Terminal 2: Start ngrok
ngrok http 8000
```

Sau đó dùng URL ngrok trong Casso dashboard:
```
https://xxxx-xxx-xxx-xxx.ngrok.io/api/v1/webhooks/casso
```

### 2. Test với curl

```bash
curl -X POST http://localhost:8000/api/v1/webhooks/casso \
  -H "Content-Type: application/json" \
  -H "x-casso-signature: test-signature" \
  -d '{
    "id": "test-id",
    "tid": "test-tid",
    "amount": 99000,
    "description": "Test payment",
    "when": "2024-01-01T00:00:00Z",
    "corresponsiveAccount": "1234567890",
    "corresponsiveBankName": "VCB"
  }'
```

### 3. Test với Postman

- **Method:** POST
- **URL:** `http://localhost:8000/api/v1/webhooks/casso`
- **Headers:**
  - `Content-Type: application/json`
  - `x-casso-signature: test-signature`
- **Body:** JSON với dữ liệu mẫu từ Casso

## Lưu ý quan trọng

1. **HTTPS bắt buộc:** 
   - Production phải dùng HTTPS
   - Casso không gửi webhook đến HTTP (trừ localhost)

2. **Webhook Secret:**
   - Luôn verify signature để đảm bảo request đến từ Casso
   - Không chia sẻ Webhook Secret

3. **Idempotency:**
   - Webhook có thể được gửi nhiều lần
   - Code phải xử lý trường hợp duplicate

4. **Timeout:**
   - Casso sẽ retry nếu server không phản hồi trong 30 giây
   - Nên xử lý webhook nhanh hoặc dùng queue

5. **Logging:**
   - Luôn log webhook để debug
   - Check logs nếu webhook không hoạt động

## Troubleshooting

### Webhook không nhận được?

1. **Kiểm tra URL:**
   - URL có đúng không?
   - Có HTTPS không? (production)
   - Server có chạy không?

2. **Kiểm tra Firewall:**
   - Port có mở không?
   - Security groups có cho phép không?

3. **Kiểm tra Logs:**
   - Xem logs của server
   - Xem logs trong Casso dashboard

4. **Test với ngrok:**
   - Dùng ngrok để test local
   - Xem request có đến không

### Webhook nhận được nhưng lỗi?

1. **Kiểm tra Signature:**
   - Verify signature có đúng không?
   - Webhook Secret có đúng không?

2. **Kiểm tra Data:**
   - Dữ liệu có đúng format không?
   - Payment có tồn tại không?

3. **Kiểm tra Code:**
   - Xem logs để biết lỗi cụ thể
   - Check exception handling

## Tài liệu tham khảo

- [Casso Webhook Documentation](https://developer.casso.vn/webhook/)
- [Ngrok Documentation](https://ngrok.com/docs)
- [Webhook Best Practices](https://webhooks.fyi/)



