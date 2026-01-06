# Đề Xuất Tính Năng Pro Subscription

## 📋 Tổng Quan

Tính năng cho phép người dùng nâng cấp lên tài khoản Pro (trả phí) để có thể:
- Tự tạo bài học
- Tự quản lý bài học đã tạo
- Có các quyền hạn đặc biệt so với tài khoản free

---

## 🏗️ Kiến Trúc Tổng Thể

### 1. Database Schema

#### 1.1. Bảng `subscription`
```sql
- id: UUID (PK)
- userId: UUID (FK -> user.id)
- planType: ENUM('MONTHLY', 'YEARLY')
- status: ENUM('ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING')
- startDate: TIMESTAMP
- endDate: TIMESTAMP
- autoRenew: BOOLEAN
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### 1.2. Bảng `payment`
```sql
- id: UUID (PK)
- subscriptionId: UUID (FK -> subscription.id)
- amount: DECIMAL(10,2)
- currency: VARCHAR(3) DEFAULT 'VND'
- paymentMethod: ENUM('STRIPE', 'PAYPAL', 'VNPAY', 'MANUAL')
- paymentStatus: ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')
- transactionId: VARCHAR(255) (từ payment gateway)
- paymentDate: TIMESTAMP
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### 1.3. Cập nhật bảng `user`
```sql
- Thêm cột: subscriptionStatus: ENUM('FREE', 'PRO', 'EXPIRED')
- Thêm cột: subscriptionExpiresAt: TIMESTAMP (nullable)
```

#### 1.4. Cập nhật bảng `lesson`
```sql
- Thêm cột: authorId: UUID (FK -> user.id, nullable)
- Thêm cột: isPublic: BOOLEAN DEFAULT true
- Thêm cột: isProContent: BOOLEAN DEFAULT false
```

---

## 🔧 Backend Implementation

### 2. Module Structure

```
src/backend/src/modules/
├── subscription/
│   ├── subscription.module.ts
│   ├── subscription.controller.ts
│   ├── admin-subscription.controller.ts (Admin endpoints)
│   ├── subscription.service.ts
│   ├── subscription.entity.ts
│   ├── payment.entity.ts
│   ├── dto/
│   │   ├── create-subscription.dto.ts
│   │   ├── update-subscription.dto.ts
│   │   ├── create-payment.dto.ts
│   │   ├── subscription-response.dto.ts
│   │   ├── admin-subscription-query.dto.ts
│   │   └── admin-payment-query.dto.ts
│   └── guards/
│       └── pro-subscription.guard.ts
```

### 3. Core Features

#### 3.1. Subscription Service
- `createSubscription()`: Tạo subscription mới
- `getUserSubscription()`: Lấy subscription của user
- `checkSubscriptionStatus()`: Kiểm tra trạng thái subscription
- `cancelSubscription()`: Hủy subscription
- `renewSubscription()`: Gia hạn subscription
- `expireSubscription()`: Đánh dấu subscription hết hạn (cron job)
- `getAllSubscriptions()`: Lấy tất cả subscriptions (Admin)
- `getSubscriptionById()`: Lấy subscription theo ID (Admin)
- `activateSubscription()`: Kích hoạt subscription thủ công (Admin)
- `deactivateSubscription()`: Vô hiệu hóa subscription (Admin)
- `extendSubscription()`: Gia hạn subscription thủ công (Admin)
- `getSubscriptionStats()`: Thống kê subscriptions (Admin)

#### 3.2. Payment Service
- `createPayment()`: Tạo payment record
- `processPayment()`: Xử lý thanh toán qua gateway
- `verifyPayment()`: Xác minh thanh toán
- `refundPayment()`: Hoàn tiền
- `getAllPayments()`: Lấy tất cả payments (Admin)
- `getPaymentById()`: Lấy payment theo ID (Admin)
- `getPaymentStats()`: Thống kê payments (Admin)
- `processManualRefund()`: Xử lý hoàn tiền thủ công (Admin)

#### 3.3. Pro Subscription Guard
- Kiểm tra user có subscription active không
- Sử dụng decorator `@RequirePro()` để bảo vệ routes

### 4. Lesson Module Updates

#### 4.1. Cập nhật Lesson Entity
- Thêm `authorId` và relation với User
- Thêm `isPublic` và `isProContent`

#### 4.2. Cập nhật Lesson Service
- `createLesson()`: Gán `authorId` từ authenticated user
- `getMyLessons()`: Lấy danh sách bài học của user
- `updateMyLesson()`: Cập nhật bài học của chính user
- `deleteMyLesson()`: Xóa bài học của chính user
- Kiểm tra quyền: chỉ author hoặc admin mới được sửa/xóa

#### 4.3. Cập nhật Lesson Controller
- Thêm guard `@RequirePro()` cho các endpoint tạo/sửa/xóa
- Thêm endpoint `GET /lesson/my-lessons` để lấy bài học của user
- Cập nhật `POST /lesson` để yêu cầu Pro subscription

---

## 🎨 Frontend Implementation

### 5. Component Structure

```
src/frontend/src/
├── app/
│   ├── subscription/
│   │   ├── page.tsx (Trang đăng ký Pro)
│   │   ├── success/page.tsx (Thanh toán thành công)
│   │   └── cancel/page.tsx (Hủy subscription)
│   ├── my-lessons/
│   │   ├── page.tsx (Danh sách bài học của tôi)
│   │   └── [id]/
│   │       └── edit/page.tsx (Chỉnh sửa bài học)
│   └── admin/
│       ├── subscriptions/
│       │   ├── page.tsx (Quản lý subscriptions)
│       │   └── [id]/
│       │       └── page.tsx (Chi tiết subscription)
│       └── payments/
│           ├── page.tsx (Quản lý payments)
│           └── [id]/
│               └── page.tsx (Chi tiết payment)
├── components/
│   ├── subscription/
│   │   ├── SubscriptionCard.tsx
│   │   ├── PaymentForm.tsx
│   │   └── SubscriptionStatus.tsx
│   ├── lessons/
│   │   └── MyLessonsList.tsx
│   └── admin/
│       ├── subscriptions/
│       │   ├── SubscriptionList.tsx
│       │   ├── SubscriptionDetail.tsx
│       │   ├── SubscriptionActions.tsx
│       │   └── ProUsersTable.tsx
│       └── payments/
│           ├── PaymentList.tsx
│           ├── PaymentDetail.tsx
│           ├── RefundModal.tsx
│           └── RevenueDashboard.tsx
├── services/
│   ├── subscription.ts
│   ├── payment.ts
│   └── admin-subscription.ts
└── hooks/
    ├── use-subscription.ts
    ├── use-pro-access.ts
    └── use-admin-subscriptions.ts
```

### 6. Features

#### 6.1. Subscription Page
- Hiển thị các gói subscription (Monthly/Yearly)
- So sánh tính năng Free vs Pro
- Form thanh toán tích hợp payment gateway
- Hiển thị trạng thái subscription hiện tại

#### 6.2. My Lessons Page
- Danh sách bài học đã tạo
- Filter/Search bài học
- Actions: Edit, Delete, View Stats
- Chỉ hiển thị cho Pro users

#### 6.3. Lesson Form Updates
- Thêm badge "Pro Required" khi chưa có subscription
- Disable form nếu không phải Pro
- Hiển thị thông báo yêu cầu nâng cấp

#### 6.4. Admin Subscription Management
- Trang quản lý subscriptions (`/admin/subscriptions`)
- Danh sách tất cả Pro users với filter/search
- Chi tiết subscription của từng user
- Actions: Activate, Deactivate, Extend, Cancel
- Payment history và refund management
- Revenue dashboard và analytics

---

## 🔐 Security & Authorization

### 7. Guards & Decorators

#### 7.1. Pro Subscription Guard
```typescript
@Injectable()
export class ProSubscriptionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest().user;
    const subscription = await this.subscriptionService.getActiveSubscription(user.id);
    
    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new ForbiddenException('Pro subscription required');
    }
    
    return true;
  }
}
```

#### 7.2. Decorator
```typescript
export const RequirePro = () => SetMetadata('requirePro', true);
```

#### 7.3. Lesson Ownership Check
- Kiểm tra `authorId === userId` hoặc `role === ADMIN`
- Middleware để verify ownership trước khi update/delete

---

## 💳 Payment Integration

### 8. Payment Gateway Options

#### 8.1. VNPay (Recommended for Vietnam)
- Tích hợp VNPay SDK
- Webhook để xử lý payment callback
- Support các phương thức: Credit Card, Bank Transfer

#### 8.2. Stripe (International)
- Stripe Checkout
- Stripe Webhooks
- Support nhiều currency

#### 8.3. PayPal
- PayPal SDK
- Webhook integration

### 9. Payment Flow

1. User chọn gói subscription
2. Tạo payment record với status `PENDING`
3. Redirect đến payment gateway
4. User thanh toán
5. Payment gateway callback (webhook)
6. Verify payment và update subscription status
7. Send confirmation email

---

## 📊 Database Migrations

### 10. Migration Files

1. `CreateSubscriptionAndPaymentTables.ts`
   - Tạo bảng subscription và payment
   - Thêm indexes

2. `AddSubscriptionToUser.ts`
   - Thêm cột subscriptionStatus và subscriptionExpiresAt vào user

3. `AddAuthorToLesson.ts`
   - Thêm cột authorId, isPublic, isProContent vào lesson
   - Thêm foreign key constraint

---

## 🚀 Implementation Steps

### Phase 1: Database & Entities (Week 1)
- [ ] Tạo migration cho subscription và payment tables
- [ ] Tạo migration cập nhật user và lesson tables
- [ ] Tạo entities: Subscription, Payment
- [ ] Cập nhật User và Lesson entities

### Phase 2: Backend Core (Week 2)
- [ ] Tạo SubscriptionModule, Service, Controller
- [ ] Tạo PaymentModule, Service, Controller
- [ ] Implement ProSubscriptionGuard
- [ ] Tạo decorator @RequirePro()
- [ ] Cập nhật LessonService với author tracking
- [ ] Cập nhật LessonController với Pro guards
- [ ] Tạo AdminSubscriptionController
- [ ] Implement admin subscription management methods
- [ ] Implement admin payment management methods

### Phase 3: Payment Integration (Week 3)
- [ ] Tích hợp payment gateway (VNPay/Stripe)
- [ ] Implement webhook handlers
- [ ] Payment verification logic
- [ ] Email notifications

### Phase 4: Frontend (Week 4)
- [ ] Tạo subscription page
- [ ] Tạo my-lessons page
- [ ] Cập nhật lesson form với Pro checks
- [ ] Tạo subscription status component
- [ ] Payment flow UI
- [ ] Admin subscription management page
- [ ] Admin payment management page
- [ ] Admin revenue dashboard
- [ ] Pro users list component

### Phase 5: Testing & Polish (Week 5)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Security audit
- [ ] Performance optimization

---

## 📝 API Endpoints

### Subscription APIs
```
POST   /api/v1/subscription              - Tạo subscription mới
GET    /api/v1/subscription/my          - Lấy subscription của user
PATCH  /api/v1/subscription/:id/cancel  - Hủy subscription
POST   /api/v1/subscription/:id/renew   - Gia hạn subscription
```

### Payment APIs
```
POST   /api/v1/payment                   - Tạo payment
POST   /api/v1/payment/:id/verify       - Verify payment
GET    /api/v1/payment/my               - Lấy payment history
POST   /api/v1/payment/webhook          - Webhook từ payment gateway
```

### Lesson APIs (Updated)
```
POST   /api/v1/lesson                   - Tạo bài học (Require Pro)
GET    /api/v1/lesson/my-lessons        - Lấy bài học của tôi (Require Pro)
PATCH  /api/v1/lesson/:id               - Cập nhật (Require ownership/Pro)
DELETE /api/v1/lesson/:id               - Xóa (Require ownership/Pro)
```

### Admin Subscription APIs (Require Admin Role)
```
GET    /api/v1/admin/subscriptions      - Lấy danh sách subscriptions
GET    /api/v1/admin/subscriptions/:id  - Lấy chi tiết subscription
GET    /api/v1/admin/subscriptions/stats - Thống kê subscriptions
POST   /api/v1/admin/subscriptions/:id/activate - Kích hoạt subscription
POST   /api/v1/admin/subscriptions/:id/deactivate - Vô hiệu hóa subscription
POST   /api/v1/admin/subscriptions/:id/extend - Gia hạn subscription
POST   /api/v1/admin/subscriptions/:id/cancel - Hủy subscription (Admin)
GET    /api/v1/admin/subscriptions/pro-users - Lấy danh sách Pro users
```

### Admin Payment APIs (Require Admin Role)
```
GET    /api/v1/admin/payments           - Lấy danh sách payments
GET    /api/v1/admin/payments/:id       - Lấy chi tiết payment
GET    /api/v1/admin/payments/stats     - Thống kê payments
POST   /api/v1/admin/payments/:id/refund - Hoàn tiền thủ công
GET    /api/v1/admin/payments/revenue   - Báo cáo doanh thu
```

---

## 🎯 Pricing Strategy

### Suggested Plans
- **Monthly Pro**: 99,000 VND/tháng
- **Yearly Pro**: 990,000 VND/năm (tiết kiệm 2 tháng)

### Features Comparison
| Feature | Free | Pro |
|---------|------|-----|
| Xem bài học | ✅ | ✅ |
| Tạo bài học | ❌ | ✅ |
| Quản lý bài học | ❌ | ✅ |
| Practice sessions | Limited | Unlimited |
| AI Assistant | Limited | Unlimited |

---

## 🔔 Notifications

### Email Templates
1. **Subscription Activated**: Chào mừng Pro
2. **Payment Success**: Xác nhận thanh toán
3. **Subscription Expiring**: Cảnh báo sắp hết hạn (7 ngày trước)
4. **Subscription Expired**: Thông báo hết hạn
5. **Payment Failed**: Thông báo thanh toán thất bại

---

## 📈 Analytics & Monitoring

### Metrics to Track
- Subscription conversion rate
- Churn rate
- Revenue (MRR/ARR)
- Active Pro users
- Lesson creation rate by Pro users
- Payment success rate

### Dashboard
- Admin dashboard để quản lý subscriptions
- Revenue reports
- User analytics

### Admin Subscription Management Features

#### 7.1. Subscription List View
- **Danh sách tất cả subscriptions**:
  - Filter theo status (ACTIVE, CANCELLED, EXPIRED, PENDING)
  - Filter theo planType (MONTHLY, YEARLY)
  - Search theo email/username
  - Sort theo ngày tạo, ngày hết hạn, amount
  - Pagination

- **Thông tin hiển thị**:
  - User info (email, name, avatar)
  - Subscription status
  - Plan type và giá
  - Start date và end date
  - Auto-renew status
  - Total payments
  - Actions: View detail, Activate, Deactivate, Extend, Cancel

#### 7.2. Subscription Detail View
- **Thông tin chi tiết**:
  - User profile
  - Subscription history
  - Payment history
  - Lesson created count
  - Usage statistics

- **Actions**:
  - Activate/Deactivate subscription
  - Extend subscription (thêm ngày)
  - Cancel subscription
  - View payment details
  - Process refund

#### 7.3. Pro Users Management
- **Danh sách Pro users**:
  - Filter theo subscription status
  - Search users
  - View subscription details
  - Quick actions

- **User statistics**:
  - Subscription duration
  - Total spent
  - Lessons created
  - Last activity

#### 7.4. Payment Management
- **Payment list**:
  - Filter theo payment status
  - Filter theo payment method
  - Search theo transaction ID
  - Date range filter

- **Payment actions**:
  - View payment details
  - Process refund
  - Mark as completed/failed
  - Export payment history

#### 7.5. Revenue Dashboard
- **Metrics**:
  - Total revenue (MRR/ARR)
  - Active subscriptions count
  - New subscriptions (today/week/month)
  - Churn rate
  - Average revenue per user (ARPU)
  - Revenue by plan type

- **Charts**:
  - Revenue trend (line chart)
  - Subscription growth (bar chart)
  - Payment method distribution (pie chart)
  - Revenue by month (area chart)

- **Reports**:
  - Export revenue report (PDF/Excel)
  - Custom date range reports
  - Subscription analytics

---

## 🛡️ Security Considerations

1. **Payment Security**
   - Never store credit card info
   - Use payment gateway tokens
   - Verify webhook signatures
   - Rate limiting on payment endpoints

2. **Authorization**
   - Always verify subscription status server-side
   - Check lesson ownership before update/delete
   - Audit logs for sensitive operations

3. **Data Privacy**
   - Encrypt sensitive payment data
   - GDPR compliance for user data
   - Secure webhook endpoints

---

## 🧪 Testing Strategy

### Unit Tests
- Subscription service methods
- Payment processing logic
- Guard implementations
- Lesson ownership checks

### Integration Tests
- Payment gateway integration
- Webhook handling
- Subscription lifecycle
- Lesson CRUD with Pro requirements

### E2E Tests
- Complete subscription flow
- Payment process
- Lesson creation/editing as Pro user
- Access control scenarios

---

## 📚 Documentation

1. **API Documentation** (Swagger)
   - Subscription endpoints
   - Payment endpoints
   - Updated lesson endpoints

2. **User Guide**
   - How to upgrade to Pro
   - How to create lessons
   - How to manage lessons

3. **Admin Guide**
   - Managing subscriptions
   - Activating/deactivating subscriptions
   - Extending subscriptions manually
   - Handling refunds
   - Monitoring payments
   - Viewing revenue reports
   - Managing Pro users

---

## 👨‍💼 Admin Subscription Management - Chi Tiết

### 8. Admin Module Updates

#### 8.1. Admin Subscription Controller
```typescript
@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(EUserRole.ADMIN)
export class AdminSubscriptionController {
  // Lấy danh sách subscriptions với filter
  @Get()
  async getSubscriptions(@Query() query: AdminSubscriptionQueryDto)
  
  // Lấy chi tiết subscription
  @Get(':id')
  async getSubscriptionById(@Param('id') id: string)
  
  // Thống kê subscriptions
  @Get('stats/overview')
  async getSubscriptionStats()
  
  // Kích hoạt subscription thủ công
  @Post(':id/activate')
  async activateSubscription(@Param('id') id: string)
  
  // Vô hiệu hóa subscription
  @Post(':id/deactivate')
  async deactivateSubscription(@Param('id') id: string)
  
  // Gia hạn subscription
  @Post(':id/extend')
  async extendSubscription(
    @Param('id') id: string,
    @Body() dto: ExtendSubscriptionDto
  )
  
  // Hủy subscription (Admin)
  @Post(':id/cancel')
  async cancelSubscription(@Param('id') id: string)
  
  // Lấy danh sách Pro users
  @Get('pro-users')
  async getProUsers(@Query() query: ProUsersQueryDto)
}
```

#### 8.2. Admin Payment Controller
```typescript
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(EUserRole.ADMIN)
export class AdminPaymentController {
  // Lấy danh sách payments
  @Get()
  async getPayments(@Query() query: AdminPaymentQueryDto)
  
  // Lấy chi tiết payment
  @Get(':id')
  async getPaymentById(@Param('id') id: string)
  
  // Thống kê payments
  @Get('stats/overview')
  async getPaymentStats()
  
  // Hoàn tiền thủ công
  @Post(':id/refund')
  async processRefund(
    @Param('id') id: string,
    @Body() dto: RefundDto
  )
  
  // Báo cáo doanh thu
  @Get('revenue/report')
  async getRevenueReport(@Query() query: RevenueReportQueryDto)
}
```

### 9. Admin UI Components

#### 9.1. Subscription Management Page
- **Layout**: Table với filters và search
- **Columns**:
  - User (avatar, name, email)
  - Plan Type
  - Status (badge với màu)
  - Start Date / End Date
  - Amount
  - Auto Renew
  - Actions (dropdown menu)

- **Filters**:
  - Status dropdown
  - Plan Type dropdown
  - Date range picker
  - Search input

- **Actions**:
  - View Detail (modal hoặc navigate)
  - Activate/Deactivate (confirmation dialog)
  - Extend (modal với date picker)
  - Cancel (confirmation dialog)

#### 9.2. Subscription Detail Modal/Page
- **Tabs**:
  1. Overview: Thông tin subscription
  2. Payment History: Danh sách payments
  3. User Activity: Lessons created, usage stats
  4. Actions: Quick actions

- **Information Display**:
  - User profile card
  - Subscription timeline
  - Payment summary
  - Usage statistics

#### 9.3. Revenue Dashboard
- **Key Metrics Cards**:
  - Total Revenue (MRR/ARR)
  - Active Subscriptions
  - New Subscriptions (period)
  - Churn Rate
  - ARPU

- **Charts**:
  - Revenue Trend (Line Chart)
  - Subscription Growth (Bar Chart)
  - Payment Methods (Pie Chart)
  - Revenue by Month (Area Chart)

- **Tables**:
  - Top Revenue Users
  - Recent Payments
  - Upcoming Renewals

#### 9.4. Payment Management
- **Payment List**:
  - Transaction ID
  - User info
  - Amount
  - Payment Method
  - Status
  - Date
  - Actions (View, Refund)

- **Refund Modal**:
  - Payment details
  - Refund amount input
  - Reason selection
  - Confirmation

### 10. Admin Service Methods

#### 10.1. Subscription Service (Admin)
```typescript
// Lấy tất cả subscriptions với filter
async getAllSubscriptions(query: AdminSubscriptionQueryDto)

// Lấy subscription theo ID
async getSubscriptionById(id: string)

// Thống kê subscriptions
async getSubscriptionStats()

// Kích hoạt subscription
async activateSubscription(id: string, adminId: string)

// Vô hiệu hóa subscription
async deactivateSubscription(id: string, adminId: string)

// Gia hạn subscription
async extendSubscription(id: string, days: number, adminId: string)

// Hủy subscription (Admin)
async cancelSubscription(id: string, adminId: string, reason?: string)

// Lấy danh sách Pro users
async getProUsers(query: ProUsersQueryDto)
```

#### 10.2. Payment Service (Admin)
```typescript
// Lấy tất cả payments với filter
async getAllPayments(query: AdminPaymentQueryDto)

// Lấy payment theo ID
async getPaymentById(id: string)

// Thống kê payments
async getPaymentStats()

// Xử lý hoàn tiền
async processManualRefund(
  paymentId: string,
  amount: number,
  reason: string,
  adminId: string
)

// Báo cáo doanh thu
async getRevenueReport(query: RevenueReportQueryDto)
```

### 11. Admin Routes (Frontend)

```
/admin/subscriptions          - Danh sách subscriptions
/admin/subscriptions/:id       - Chi tiết subscription
/admin/payments                - Danh sách payments
/admin/payments/:id           - Chi tiết payment
/admin/revenue                 - Revenue dashboard
```

### 12. Admin Sidebar Updates

Thêm menu items vào Admin Sidebar:
- Subscriptions (với badge số lượng active)
- Payments
- Revenue Dashboard

---

## 🎉 Next Steps

1. Review và approve đề xuất này
2. Setup payment gateway account (VNPay/Stripe)
3. Bắt đầu Phase 1: Database & Entities
4. Setup development environment cho payment testing
5. Design UI/UX cho subscription pages
6. Design UI/UX cho admin subscription management

---

## ❓ Questions & Considerations

1. **Payment Gateway**: VNPay hay Stripe? (Recommend VNPay cho thị trường VN)
2. **Trial Period**: Có cho trial 7 ngày không?
3. **Refund Policy**: Chính sách hoàn tiền như thế nào?
4. **Content Moderation**: Ai sẽ review bài học của Pro users?
5. **Revenue Share**: Có chia sẻ doanh thu với content creators không?

---

*Document created: 2024*
*Last updated: 2024*

