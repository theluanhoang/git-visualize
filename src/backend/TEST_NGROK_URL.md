# Cách test URL Ngrok

## Vấn đề

Khi truy cập `https://knarry-hyperpersonally-louise.ngrok-free.dev/` bạn thấy lỗi 404. Đây **KHÔNG phải lỗi**, đây là hành vi bình thường.

## Giải thích

Backend của bạn có cấu trúc:
- Global prefix: `api`
- API versioning: `v1`
- Tất cả routes có dạng: `/api/v1/...`

Vì vậy:
- ❌ `https://your-ngrok-url.ngrok-free.dev/` → 404 (không có route)
- ✅ `https://your-ngrok-url.ngrok-free.dev/api/v1/...` → Hoạt động

## Cách test URL Ngrok hoạt động

### Option 1: Test với Swagger Docs

Truy cập:
```
https://knarry-hyperpersonally-louise.ngrok-free.dev/api/v1/docs
```

Nếu thấy Swagger UI → URL ngrok hoạt động tốt!

### Option 2: Test Webhook endpoint với curl

```bash
curl -X POST https://knarry-hyperpersonally-louise.ngrok-free.dev/api/v1/webhooks/casso \
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

Nếu nhận được response (dù lỗi hay thành công) → URL hoạt động!

### Option 3: Test trong Browser

Truy cập:
```
https://knarry-hyperpersonally-louise.ngrok-free.dev/api/v1/docs
```

Hoặc bất kỳ endpoint nào bạn biết, ví dụ nếu có health check:
```
https://knarry-hyperpersonally-louise.ngrok-free.dev/api/v1/health
```

## Webhook URL cho Casso

URL webhook chính xác là:
```
https://knarry-hyperpersonally-louise.ngrok-free.dev/api/v1/webhooks/casso
```

**Lưu ý:** Phải có đầy đủ `/api/v1/webhooks/casso` ở cuối!

## Kiểm tra trong Ngrok Web Interface

1. Mở: http://127.0.0.1:4040
2. Xem tab "HTTP Requests"
3. Bạn sẽ thấy tất cả requests đến ngrok tunnel
4. Kiểm tra:
   - Request có đến không?
   - Status code là gì?
   - Response body là gì?

## Kết luận

- ✅ URL ngrok của bạn **ĐANG HOẠT ĐỘNG TỐT**
- ✅ 404 ở `/` là **BÌNH THƯỜNG**
- ✅ Webhook endpoint `/api/v1/webhooks/casso` sẽ hoạt động khi Casso gửi request

Chỉ cần cập nhật webhook URL trong Casso Dashboard và test!



