# Production Sync Setup - Indexes và Performance Optimization

## 📋 Tổng Quan

Production environment sử dụng **synchronize()** thay vì migrations để tự động tạo schema và indexes. Tài liệu này mô tả cách setup và verify indexes được tạo đúng cách.

## ✅ Đã Triển Khai

### 1. Indexes trong Entity Definitions

#### Practice Entity (`practice.entity.ts`)
Đã thêm các indexes sau vào entity definition:
- `IDX_practice_lessonId` - Index trên `lessonId`
- `IDX_practice_isActive` - Index trên `isActive`
- `IDX_practice_order` - Index trên `order`
- `IDX_practice_lessonId_isActive` - Composite index cho queries filter by lessonId + isActive
- `IDX_practice_lessonId_isActive_order` - Composite index cho queries filter + order (QUAN TRỌNG cho performance)

#### Lesson Entity (`lesson.entity.ts`)
Đã thêm các indexes sau:
- `IDX_lesson_slug` - Index trên `slug` cho fast lookups
- `IDX_lesson_slug_status` - Composite index cho queries filter by slug + status

### 2. Sync Script Enhancement

Script `sync-before-migrate.ts` đã được cập nhật để:
- ✅ Synchronize schema (tables, indexes, constraints)
- ✅ Verify critical indexes sau khi sync
- ✅ Log warnings nếu indexes bị thiếu
- ✅ Better error handling và logging

### 3. Database Connection Optimization

Đã tối ưu connection pool settings:
- ✅ Query timeout: 10 seconds (kill slow queries)
- ✅ Connection pool: min 5, max 50
- ✅ Keep-alive connections
- ✅ Application name for monitoring

## 🚀 Deployment Process

### Bước 1: Build và Deploy

```bash
# Build backend
cd src/backend
npm run build

# Deploy (tùy vào setup của bạn)
docker-compose -f docker-compose.prod.yml up -d --build
# hoặc
docker-compose -f docker-compose.vercel.yml up -d --build
```

### Bước 2: Verify Sync Process

Check logs của backend container:

```bash
docker logs gv_backend_prod
# hoặc
docker logs gv_backend_vercel
```

Bạn sẽ thấy output như:
```
🔄 Initializing database connection...
✅ Database connection established.
🔄 Synchronizing schema (tables, indexes, constraints)...
✅ Schema synchronized successfully.
🔍 Verifying critical indexes...
✅ All critical indexes verified.
✅ Database connection closed.
```

### Bước 3: Verify Indexes trong Database

Connect vào PostgreSQL và verify:

```sql
-- Check Practice indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'practice' 
AND schemaname = 'public'
ORDER BY indexname;

-- Check Lesson indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'lesson' 
AND schemaname = 'public'
ORDER BY indexname;

-- Expected indexes for Practice:
-- IDX_practice_lessonId
-- IDX_practice_isActive
-- IDX_practice_order
-- IDX_practice_lessonId_isActive
-- IDX_practice_lessonId_isActive_order

-- Expected indexes for Lesson:
-- IDX_lesson_slug
-- IDX_lesson_slug_status
```

### Bước 4: Test API Performance

```bash
# Test API với lessonSlug query
curl "https://your-domain.com/api/v1/practices?lessonSlug=git-switch-chuyen-doi-tao-nhanh-hieu-qua&limit=9"

# Response time nên < 1s (từ 7s xuống < 1s)
```

## 🔍 Troubleshooting

### Vấn Đề: Indexes không được tạo

**Triệu chứng**: Logs show "Some indexes are missing"

**Giải pháp**:
1. Check TypeORM version - cần >= 0.3.x để support @Index() decorator
2. Verify entity files được import đúng trong app.module.ts
3. Manually create indexes nếu cần:

```sql
-- Create missing indexes manually
CREATE INDEX IF NOT EXISTS "IDX_practice_lessonId_isActive_order" 
ON "practice" ("lessonId", "isActive", "order");

CREATE INDEX IF NOT EXISTS "IDX_practice_lessonId_isActive" 
ON "practice" ("lessonId", "isActive");

CREATE INDEX IF NOT EXISTS "IDX_lesson_slug_status" 
ON "lesson" ("slug", "status");
```

### Vấn Đề: API vẫn chậm sau khi deploy

**Checklist**:
1. ✅ Verify indexes đã được tạo (xem Bước 3)
2. ✅ Check query execution plan:

```sql
EXPLAIN ANALYZE
SELECT practice.*
FROM practice
INNER JOIN lesson ON practice."lessonId" = lesson.id
WHERE lesson.slug = 'git-switch-chuyen-doi-tao-nhanh-hieu-qua'
  AND practice."isActive" = true
  AND lesson.status = 'PUBLISHED'
ORDER BY practice."order" ASC
LIMIT 9;
```

Query plan nên show:
- `Index Scan using IDX_practice_lessonId_isActive_order`
- `Index Scan using IDX_lesson_slug_status`

3. ✅ Check database connection latency:
   - Local: < 1ms
   - Production: có thể 10-50ms (network latency)
   - Nếu > 100ms: check network/firewall settings

4. ✅ Check database resources:
   - CPU usage
   - Memory usage
   - Disk I/O

### Vấn Đề: Query Timeout

**Triệu chứng**: Queries bị kill sau 10 seconds

**Giải pháp**:
1. Check slow queries trong logs
2. Verify indexes được sử dụng
3. Tăng timeout nếu cần (không khuyến khích):

```bash
# In .env.production
DB_STATEMENT_TIMEOUT=30000  # 30 seconds
```

## 📊 Performance Monitoring

### Key Metrics

1. **API Response Time**
   - Target: < 1s cho `/api/v1/practices?lessonSlug=...`
   - Monitor: Application logs, APM tools

2. **Database Query Time**
   - Target: < 200ms cho practice queries
   - Monitor: PostgreSQL slow query log

3. **Index Usage**
   - Verify indexes được sử dụng trong query plans
   - Check index hit rate

### Monitoring Queries

```sql
-- Check index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename IN ('practice', 'lesson')
ORDER BY idx_scan DESC;

-- Check table statistics
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE tablename IN ('practice', 'lesson');
```

## 🔄 Migration từ Migrations sang Sync

Nếu bạn đang dùng migrations và muốn chuyển sang sync:

1. **Backup database** trước khi thay đổi
2. **Set environment variables**:
   ```bash
   TYPEORM_SYNCHRONIZE=true
   TYPEORM_MIGRATIONS_RUN=false
   ```
3. **Deploy** - sync sẽ tự động tạo indexes từ entity definitions
4. **Verify** indexes được tạo đúng

## ⚠️ Lưu Ý Quan Trọng

1. **Synchronize() chỉ nên dùng trong production nếu:**
   - Bạn có full control over database
   - Không có multiple services cùng write vào database
   - Có backup strategy tốt

2. **Indexes từ @Index() decorator:**
   - TypeORM sẽ tự động tạo indexes khi sync
   - Indexes sẽ được tạo mỗi lần sync chạy
   - Nếu index đã tồn tại, TypeORM sẽ skip (không error)

3. **Performance:**
   - Sync có thể mất thời gian nếu có nhiều changes
   - Nên chạy sync trong startup script (đã setup)
   - Monitor sync time trong logs

## 📝 Files Đã Thay Đổi

1. `src/backend/src/modules/practice/entities/practice.entity.ts`
   - Thêm @Index() decorators cho performance indexes

2. `src/backend/src/modules/lessons/lesson.entity.ts`
   - Thêm @Index() decorators cho slug indexes

3. `src/backend/src/scripts/sync-before-migrate.ts`
   - Enhanced với index verification và better logging

4. `src/backend/src/database/database.module.ts`
   - Tối ưu connection pool settings
   - Thêm query timeout

## 🔗 References

- [TypeORM Indexes](https://typeorm.io/decorator-reference#index)
- [TypeORM Synchronize](https://typeorm.io/connection-options#synchronize)
- [PostgreSQL Index Best Practices](https://www.postgresql.org/docs/current/indexes.html)

