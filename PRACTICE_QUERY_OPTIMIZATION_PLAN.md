# Kế Hoạch Tối Ưu Query Practice - Dựa Trên Best Practices Của Các Công Ty Lớn

## 📊 Phân Tích Hiện Trạng

### Vấn Đề Hiện Tại
- **Thời gian load**: 10+ giây cho lần đầu tiên
- **Bottlenecks được xác định**:
  1. `getManyAndCount()` thực hiện 2 queries riêng biệt
  2. Không có caching layer
  3. Query builder không tối ưu (load tất cả columns)
  4. N+1 query problem tiềm ẩn với relations
  5. Không có query result caching

### Phân Tích Query Hiện Tại
```typescript
// Vấn đề 1: getManyAndCount() = 2 queries
const [practices, total] = await queryBuilder.getManyAndCount();
// Query 1: SELECT * FROM practice ... (load all columns)
// Query 2: SELECT COUNT(*) FROM practice ... (duplicate work)

// Vấn đề 2: Không select cụ thể
// TypeORM load tất cả columns ngay cả khi không cần

// Vấn đề 3: Join không tối ưu
// Left join với lesson ngay cả khi không cần filter
```

---

## 🏢 Best Practices Từ Các Công Ty Lớn

### 1. **Facebook/Meta - Query Optimization**
- ✅ **Select only needed columns**: Chỉ select những field cần thiết
- ✅ **Use raw queries for critical paths**: Raw SQL cho performance-critical queries
- ✅ **Implement query result caching**: Cache kết quả query với TTL phù hợp
- ✅ **Batch operations**: Group multiple queries thành batch

### 2. **Google - Database Performance**
- ✅ **Index optimization**: Composite indexes cho query patterns phổ biến
- ✅ **Query plan analysis**: Analyze và optimize query execution plan
- ✅ **Connection pooling**: Tối ưu database connections
- ✅ **Read replicas**: Separate read/write operations

### 3. **Amazon - Scalability Patterns**
- ✅ **Caching layers**: Multi-level caching (in-memory, Redis)
- ✅ **Lazy loading**: Load relations chỉ khi cần
- ✅ **Pagination optimization**: Cursor-based pagination thay vì offset
- ✅ **Query result memoization**: Cache query results với smart invalidation

### 4. **Netflix - Performance Engineering**
- ✅ **Query result caching**: Cache với smart TTL
- ✅ **Precomputed aggregations**: Pre-compute counts và aggregations
- ✅ **Database query optimization**: Use EXPLAIN ANALYZE để optimize
- ✅ **Materialized views**: Cho complex queries

---

## 🎯 Giải Pháp Đề Xuất

### Phase 1: Query Optimization (Immediate Impact)

#### 1.1. Tối Ưu `getManyAndCount()`
**Vấn đề**: 2 queries riêng biệt
**Giải pháp**: Sử dụng subquery hoặc raw query để combine

```typescript
// Thay vì:
const [practices, total] = await queryBuilder.getManyAndCount();

// Sử dụng:
const practices = await queryBuilder.getMany();
const total = practices.length; // Nếu không cần exact count
// HOẶC
const total = await queryBuilder.getCount(); // Chỉ khi cần exact
```

#### 1.2. Select Specific Columns
**Vấn đề**: Load tất cả columns
**Giải pháp**: Chỉ select fields cần thiết

```typescript
queryBuilder.select([
  'practice.id',
  'practice.title',
  'practice.scenario',
  'practice.difficulty',
  'practice.estimatedTime',
  'practice.isActive',
  'practice.order',
  'practice.views',
  'practice.completions',
  'practice.createdAt',
]);
```

#### 1.3. Optimize Join Conditions
**Vấn đề**: Join không cần thiết
**Giải pháp**: Conditional joins, sử dụng INNER JOIN thay vì LEFT JOIN khi có thể

```typescript
// Chỉ join khi thực sự cần
if (lessonSlug || publishedOnly !== false) {
  queryBuilder.innerJoin('practice.lesson', 'lesson');
}
```

### Phase 2: Caching Layer (High Impact)

#### 2.1. Implement Redis Caching
**Mục tiêu**: Cache query results với TTL 5-10 phút

```typescript
// Cache key pattern: practice:list:{lessonSlug}:{filters}
// Cache TTL: 5 minutes (300 seconds)
```

#### 2.2. In-Memory Caching cho Hot Data
**Mục tiêu**: Cache practices list trong memory với LRU cache

```typescript
// Sử dụng node-cache hoặc lru-cache
// Cache size: 100 items
// TTL: 2 minutes
```

### Phase 3: Database Optimization (Medium Impact)

#### 3.1. Composite Indexes
```sql
-- Index cho query pattern phổ biến
CREATE INDEX idx_practice_lesson_active_order 
ON practice(lessonId, isActive, "order");

-- Index cho slug lookup
CREATE INDEX idx_lesson_slug_status 
ON lesson(slug, status);
```

#### 3.2. Query Plan Analysis
- Sử dụng `EXPLAIN ANALYZE` để analyze queries
- Optimize dựa trên query execution plan

### Phase 4: Advanced Optimizations (Long-term)

#### 4.1. Materialized Views
- Pre-compute practices list cho từng lesson
- Refresh định kỳ hoặc on-demand

#### 4.2. Read Replicas
- Separate read/write operations
- Route read queries đến read replicas

#### 4.3. Query Result Pre-computation
- Pre-compute và cache popular queries
- Background jobs để refresh cache

---

## 📋 Kế Hoạch Triển Khai Chi Tiết

### Week 1: Immediate Optimizations (Quick Wins)

#### Day 1-2: Query Optimization
- [ ] Tối ưu `getManyAndCount()` - chỉ count khi cần
- [ ] Implement select specific columns
- [ ] Optimize join conditions
- [ ] Test và measure performance improvement

**Expected Impact**: 30-50% improvement

#### Day 3-4: Database Indexes
- [ ] Run migration để thêm indexes
- [ ] Analyze query plans với EXPLAIN
- [ ] Optimize indexes dựa trên analysis

**Expected Impact**: 20-30% improvement

#### Day 5: Testing & Validation
- [ ] Load testing với realistic data
- [ ] Measure response times
- [ ] Document improvements

### Week 2: Caching Implementation

#### Day 1-2: Setup Caching Infrastructure
- [ ] Install và configure Redis (hoặc in-memory cache)
- [ ] Setup cache module trong NestJS
- [ ] Implement cache decorators/interceptors

#### Day 3-4: Implement Caching Layer
- [ ] Cache `getPracticesByLessonSlug` results
- [ ] Implement cache invalidation strategy
- [ ] Add cache hit/miss metrics

**Expected Impact**: 60-80% improvement cho cached requests

#### Day 5: Testing & Monitoring
- [ ] Test cache performance
- [ ] Setup monitoring cho cache hit rate
- [ ] Tune cache TTL based on usage patterns

### Week 3: Advanced Optimizations

#### Day 1-3: Query Plan Optimization
- [ ] Analyze all queries với EXPLAIN ANALYZE
- [ ] Optimize slow queries
- [ ] Implement query result memoization

#### Day 4-5: Performance Testing & Documentation
- [ ] Comprehensive load testing
- [ ] Performance benchmarking
- [ ] Document optimization results
- [ ] Setup performance monitoring

---

## 🛠️ Implementation Details

### 1. Query Optimization Service

```typescript
// practice-optimized.service.ts
@Injectable()
export class PracticeOptimizedService {
  async getPracticesByLessonSlugOptimized(
    lessonSlug: string,
    options?: { includeRelations?: boolean }
  ): Promise<Practice[]> {
    // 1. Check cache first
    const cacheKey = `practice:list:${lessonSlug}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    // 2. Build optimized query
    const queryBuilder = this.dataSource
      .createQueryBuilder(Practice, 'practice')
      .select([
        'practice.id',
        'practice.title',
        'practice.scenario',
        'practice.difficulty',
        'practice.estimatedTime',
        'practice.isActive',
        'practice.order',
        'practice.views',
        'practice.completions',
      ])
      .innerJoin('practice.lesson', 'lesson')
      .where('lesson.slug = :slug', { slug: lessonSlug })
      .andWhere('practice.isActive = :isActive', { isActive: true })
      .andWhere('lesson.status = :status', { status: 'PUBLISHED' })
      .orderBy('practice.order', 'ASC');

    // 3. Execute query
    const practices = await queryBuilder.getMany();

    // 4. Cache result
    await this.cacheService.set(cacheKey, practices, 300); // 5 minutes

    return practices;
  }
}
```

### 2. Caching Module Setup

```typescript
// cache.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: 300, // 5 minutes default
    }),
  ],
})
export class AppCacheModule {}
```

### 3. Cache Invalidation Strategy

```typescript
// Invalidate cache khi:
// - Practice được create/update/delete
// - Lesson được update (nếu ảnh hưởng đến practices)
// - Manual cache clear

@Injectable()
export class PracticeCacheService {
  async invalidateLessonCache(lessonSlug: string) {
    await this.cacheService.del(`practice:list:${lessonSlug}`);
  }
}
```

---

## 📈 Metrics & Monitoring

### Key Metrics to Track
1. **Response Time**: Target < 500ms cho cached, < 2s cho uncached
2. **Cache Hit Rate**: Target > 80%
3. **Database Query Time**: Target < 100ms
4. **Throughput**: Requests per second

### Monitoring Setup
- Setup APM tool (New Relic, Datadog, hoặc tự build)
- Log slow queries (> 1s)
- Monitor cache performance
- Alert on performance degradation

---

## ✅ Success Criteria

### Performance Targets
- ✅ Initial load: < 1s (from 10s+)
- ✅ Cached requests: < 100ms
- ✅ Database query time: < 200ms
- ✅ Cache hit rate: > 70%

### Quality Targets
- ✅ No breaking changes
- ✅ Backward compatible
- ✅ Comprehensive tests
- ✅ Performance monitoring in place

---

## 🚀 Quick Start Implementation

### Step 1: Install Dependencies
```bash
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store
# hoặc cho in-memory only:
npm install @nestjs/cache-manager cache-manager
```

### Step 2: Implement Optimized Query
- Copy code từ section "Query Optimization Service"
- Update `practice-aggregate.service.ts`

### Step 3: Add Caching
- Setup cache module
- Implement cache layer
- Add cache invalidation

### Step 4: Run Migrations
```bash
npm run migration:run
```

### Step 5: Test & Monitor
- Run load tests
- Monitor performance
- Tune based on results

---

## 📝 Notes

- **Priority**: Phase 1 & 2 có impact cao nhất, nên implement trước
- **Risk**: Caching có thể gây stale data, cần invalidation strategy tốt
- **Testing**: Cần test với realistic data volume
- **Monitoring**: Critical để track improvements và catch regressions

---

## 🔗 References

- [NestJS Caching](https://docs.nestjs.com/techniques/caching)
- [TypeORM Query Optimization](https://typeorm.io/select-query-builder)
- [PostgreSQL Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html)
- [Facebook Engineering Blog - Database Optimization](https://engineering.fb.com/)
- [Google SRE Book - Performance](https://sre.google/sre-book/table-of-contents/)

