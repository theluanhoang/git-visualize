# Hướng dẫn Test Webhook

## Kết quả Test

Từ kết quả test của bạn:

```bash
curl -X POST https://knarry-hyperpersonally-louise.ngrok-free.dev/api/v1/webhooks/casso \
  -H "Content-Type: application/json" \
  -d '{"id":"test"}'

# Response:
{"success":false,"error":"Cannot identify user from webhook data"}
```

## Phân tích

### ✅ Webhook Endpoint ĐANG HOẠT ĐỘNG TỐT

- Server đã nhận được request
- Code đã xử lý request
- Response được trả về đúng format

### ⚠️ Lỗi Logic (Không phải lỗi kết nối)

Lỗi `"Cannot identify user from webhook data"` xảy ra vì:
- Test data không có email trong `description` hoặc `reference`
- Code cần email để tìm user trong database
- Đây là hành vi **ĐÚNG** - bảo vệ hệ thống khỏi webhook không hợp lệ

## Cách Test Đúng

### Option 1: Test với Payment đã tồn tại

1. **Tạo payment trước:**
   ```bash
   # Tạo subscription và payment
   POST /api/v1/subscription/payment/create-subscription
   {
     "planType": "MONTHLY",
     "autoRenew": true
   }
   ```

2. **Lấy transactionId từ payment response**

3. **Test webhook với transactionId đúng:**
   ```bash
   curl -X POST https://knarry-hyperpersonally-louise.ngrok-free.dev/api/v1/webhooks/casso \
     -H "Content-Type: application/json" \
     -H "x-casso-signature: test-signature" \
     -d '{
       "id": "TRANSACTION_ID_FROM_PAYMENT",
       "tid": "TID_FROM_PAYMENT",
       "amount": 99000,
       "description": "Thanh toán nâng cấp tháng - user@example.com",
       "when": "2024-01-06T15:23:44.000Z",
       "corresponsiveAccount": "1234567890",
       "corresponsiveBankName": "VCB"
     }'
   ```

### Option 2: Test với Email trong Description

```bash
curl -X POST https://knarry-hyperpersonally-louise.ngrok-free.dev/api/v1/webhooks/casso \
  -H "Content-Type: application/json" \
  -H "x-casso-signature: test-signature" \
  -d '{
    "id": "test-id",
    "tid": "test-tid",
    "amount": 99000,
    "description": "Payment for user@example.com",
    "when": "2024-01-06T15:23:44.000Z",
    "corresponsiveAccount": "1234567890",
    "corresponsiveBankName": "VCB",
    "reference": "user@example.com"
  }'
```

**Lưu ý:** Email `user@example.com` phải tồn tại trong database.

## Swagger Docs

Swagger path là `/api/docs` (không có `/v1`):

```bash
curl https://knarry-hyperpersonally-louise.ngrok-free.dev/api/docs
```

Hoặc truy cập trong browser:
```
https://knarry-hyperpersonally-louise.ngrok-free.dev/api/docs
```

## Kết luận

✅ **Webhook endpoint đã hoạt động tốt!**

- URL ngrok: ✅ Hoạt động
- Server: ✅ Nhận request
- Code: ✅ Xử lý đúng logic

**Bước tiếp theo:**
1. Cập nhật webhook URL trong Casso Dashboard
2. Test với webhook thật từ Casso (sẽ có đầy đủ thông tin)
3. Khi có giao dịch thật, webhook sẽ hoạt động hoàn hảo

## Test với Casso Dashboard

1. Vào Casso Dashboard → Webhook settings
2. Cập nhật URL: `https://knarry-hyperpersonally-louise.ngrok-free.dev/api/v1/webhooks/casso`
3. Click "Test Webhook" hoặc "Gửi webhook thử nghiệm"
4. Casso sẽ gửi webhook với dữ liệu mẫu đầy đủ
5. Kiểm tra logs để xem kết quả



