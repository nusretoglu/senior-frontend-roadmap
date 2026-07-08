# SQL Basics - SQL Asoslari

## Kirish

SQL (Structured Query Language) - bu relational database'lar bilan ishlash uchun standart til. Frontend dasturchi sifatida SQL bilish sizga backend jamoasi bilan yaxshiroq kommunikatsiya qilishga, API endpoint'larni to'g'ri ishlatishga va muammolarni tezroq aniqlashga yordam beradi.

## SELECT - Ma'lumotlarni Olish

### Asosiy Sintaksis

```sql
-- Eng oddiy SELECT
SELECT * FROM users;

-- Kerakli ustunlarni tanlash
SELECT id, name, email FROM users;

-- Alias (taxallus) bilan
SELECT
    id AS user_id,
    name AS full_name,
    email AS contact_email
FROM users;
```

### WHERE - Filterlash

```sql
-- Oddiy shart
SELECT * FROM users WHERE status = 'active';

-- Bir nechta shart
SELECT * FROM products
WHERE price > 100 AND category = 'electronics';

SELECT * FROM orders
WHERE status = 'pending' OR status = 'processing';

-- NOT operatori
SELECT * FROM users WHERE NOT is_deleted;

-- IN operatori
SELECT * FROM products
WHERE category IN ('electronics', 'books', 'clothing');

-- BETWEEN (qiymatlar oralig'i)
SELECT * FROM orders
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';

-- LIKE (pattern matching)
SELECT * FROM users WHERE email LIKE '%@gmail.com';
SELECT * FROM products WHERE name LIKE 'iPhone%';
SELECT * FROM users WHERE name LIKE '_ohn';  -- John, Bohn, etc.

-- NULL tekshirish
SELECT * FROM users WHERE deleted_at IS NULL;
SELECT * FROM orders WHERE shipping_address IS NOT NULL;
```

### ORDER BY - Tartiblash

```sql
-- Ascending (default)
SELECT * FROM products ORDER BY price;
SELECT * FROM products ORDER BY price ASC;

-- Descending
SELECT * FROM products ORDER BY price DESC;

-- Bir nechta ustun bo'yicha
SELECT * FROM products
ORDER BY category ASC, price DESC;

-- NULL qiymatlarni oxirida
SELECT * FROM users
ORDER BY last_login NULLS LAST;
```

### LIMIT va OFFSET - Pagination

```sql
-- Birinchi 10 ta yozuv
SELECT * FROM products LIMIT 10;

-- 2-sahifa (11-20 yozuvlar)
SELECT * FROM products LIMIT 10 OFFSET 10;

-- PostgreSQL: LIMIT + OFFSET shortcut
SELECT * FROM products LIMIT 10 OFFSET 20;

-- Performance maslahat: Katta OFFSET sekin!
-- 1000000 ta skip qilish = 1000000 ta o'qish

-- Cursor-based pagination (tezroq)
SELECT * FROM products
WHERE id > 1000  -- Oxirgi ko'rilgan ID
ORDER BY id
LIMIT 10;
```

## JOIN - Jadvallarni Birlashtirish

### JOIN Turlari

```
┌────────────────────────────────────────────────────────────────┐
│                        JOIN TYPES                               │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INNER JOIN          LEFT JOIN           RIGHT JOIN            │
│   ┌───┬───┐          ┌───┬───┐          ┌───┬───┐             │
│   │   │░░░│          │███│░░░│          │   │███│             │
│   │ A │░B░│          │ A │░B░│          │ A │ B │             │
│   │   │░░░│          │███│░░░│          │   │███│             │
│   └───┴───┘          └───┴───┘          └───┴───┘             │
│  Faqat mos kelgan    A to'liq +         B to'liq +            │
│  yozuvlar            mos B              mos A                  │
│                                                                 │
│  FULL OUTER JOIN     CROSS JOIN                                │
│   ┌───┬───┐          A x B                                     │
│   │███│███│          Har bir A uchun                           │
│   │ A │ B │          barcha B                                  │
│   │███│███│          (Cartesian product)                       │
│   └───┴───┘                                                    │
│  Ikkalasi to'liq                                               │
└────────────────────────────────────────────────────────────────┘
```

### INNER JOIN

```sql
-- INNER JOIN - faqat ikki jadvalda ham mavjud yozuvlar
SELECT
    o.id AS order_id,
    o.total,
    c.name AS customer_name,
    c.email
FROM orders o
INNER JOIN customers c ON c.id = o.customer_id;

-- Bir nechta JOIN
SELECT
    o.id AS order_id,
    c.name AS customer_name,
    p.name AS product_name,
    oi.quantity,
    oi.price
FROM orders o
INNER JOIN customers c ON c.id = o.customer_id
INNER JOIN order_items oi ON oi.order_id = o.id
INNER JOIN products p ON p.id = oi.product_id;
```

### LEFT JOIN

```sql
-- LEFT JOIN - chap jadvaldan hamma, o'ng jadvaldan mos kelganlar
SELECT
    c.id,
    c.name,
    COUNT(o.id) AS order_count
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name;

-- Buyurtma qilmagan mijozlar
SELECT c.*
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

### RIGHT JOIN va FULL OUTER JOIN

```sql
-- RIGHT JOIN - kamroq ishlatiladi, LEFT JOIN o'rniga jadvallarni almashtirish mumkin
SELECT
    p.name AS product_name,
    COUNT(oi.id) AS times_ordered
FROM order_items oi
RIGHT JOIN products p ON p.id = oi.product_id
GROUP BY p.id, p.name;

-- FULL OUTER JOIN - ikki jadvaldan ham hamma yozuvlar
SELECT
    c.name AS customer_name,
    o.id AS order_id
FROM customers c
FULL OUTER JOIN orders o ON o.customer_id = c.id;
```

### Self JOIN

```sql
-- Bir jadvalning o'zini o'zi bilan JOIN
-- Masalan: Employees va ularning manager'lari

SELECT
    e.name AS employee,
    m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;

-- Kategoriyalar ierarxiyasi
SELECT
    c.name AS category,
    p.name AS parent_category
FROM categories c
LEFT JOIN categories p ON p.id = c.parent_id;
```

## Aggregation - Ma'lumotlarni Jamlash

### Asosiy Agregat Funksiyalar

```sql
-- COUNT - qatorlar sonini hisoblash
SELECT COUNT(*) FROM users;
SELECT COUNT(DISTINCT category) FROM products;

-- SUM - yig'indi
SELECT SUM(total) FROM orders WHERE status = 'completed';

-- AVG - o'rtacha
SELECT AVG(price) FROM products;

-- MIN / MAX
SELECT MIN(price), MAX(price) FROM products;

-- Birgalikda
SELECT
    COUNT(*) AS total_orders,
    SUM(total) AS revenue,
    AVG(total) AS avg_order_value,
    MIN(total) AS min_order,
    MAX(total) AS max_order
FROM orders
WHERE status = 'completed';
```

### GROUP BY - Guruhlash

```sql
-- Kategoriya bo'yicha mahsulotlar soni
SELECT
    category,
    COUNT(*) AS product_count,
    AVG(price) AS avg_price
FROM products
GROUP BY category;

-- Oylik daromad
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS orders,
    SUM(total) AS revenue
FROM orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- Bir nechta ustun bo'yicha guruhlash
SELECT
    category,
    status,
    COUNT(*) AS count
FROM products
GROUP BY category, status;
```

### HAVING - Guruhlarni Filterlash

```sql
-- HAVING - GROUP BY natijalarini filterlash
-- WHERE - guruhlashdan OLDIN
-- HAVING - guruhlashdan KEYIN

SELECT
    category,
    COUNT(*) AS product_count,
    AVG(price) AS avg_price
FROM products
WHERE is_active = true        -- Avval filter
GROUP BY category
HAVING COUNT(*) > 5           -- Keyin guruhlarni filter
ORDER BY avg_price DESC;

-- 1000$ dan ortiq xarid qilgan mijozlar
SELECT
    c.id,
    c.name,
    SUM(o.total) AS total_spent
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'completed'
GROUP BY c.id, c.name
HAVING SUM(o.total) > 1000
ORDER BY total_spent DESC;
```

## Subqueries - Ichki So'rovlar

### WHERE da Subquery

```sql
-- O'rtacha narxdan qimmat mahsulotlar
SELECT * FROM products
WHERE price > (SELECT AVG(price) FROM products);

-- Xarid qilgan mijozlar
SELECT * FROM customers
WHERE id IN (
    SELECT DISTINCT customer_id FROM orders
);

-- Xarid qilmagan mijozlar
SELECT * FROM customers
WHERE id NOT IN (
    SELECT DISTINCT customer_id FROM orders
    WHERE customer_id IS NOT NULL
);

-- EXISTS - samarali tekshirish
SELECT * FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id
    AND o.total > 500
);
```

### FROM da Subquery (Derived Table)

```sql
-- Kategoriya statistikasi
SELECT
    category_stats.category,
    category_stats.avg_price,
    CASE
        WHEN category_stats.avg_price > 100 THEN 'Premium'
        WHEN category_stats.avg_price > 50 THEN 'Mid-range'
        ELSE 'Budget'
    END AS tier
FROM (
    SELECT
        category,
        AVG(price) AS avg_price,
        COUNT(*) AS product_count
    FROM products
    GROUP BY category
) AS category_stats
WHERE category_stats.product_count > 5;
```

### SELECT da Subquery (Scalar Subquery)

```sql
-- Har bir mahsulotning kategoriya o'rtacha narxidan farqi
SELECT
    p.name,
    p.price,
    (
        SELECT AVG(price)
        FROM products p2
        WHERE p2.category = p.category
    ) AS category_avg,
    p.price - (
        SELECT AVG(price)
        FROM products p2
        WHERE p2.category = p.category
    ) AS price_diff
FROM products p;
```

### Common Table Expressions (CTE)

```sql
-- CTE - o'qilishi oson subquery
WITH monthly_sales AS (
    SELECT
        DATE_TRUNC('month', created_at) AS month,
        SUM(total) AS revenue,
        COUNT(*) AS order_count
    FROM orders
    WHERE status = 'completed'
    GROUP BY DATE_TRUNC('month', created_at)
),
avg_monthly AS (
    SELECT AVG(revenue) AS avg_revenue
    FROM monthly_sales
)
SELECT
    ms.month,
    ms.revenue,
    ms.order_count,
    am.avg_revenue,
    CASE
        WHEN ms.revenue > am.avg_revenue THEN 'Above Average'
        ELSE 'Below Average'
    END AS performance
FROM monthly_sales ms
CROSS JOIN avg_monthly am
ORDER BY ms.month;
```

### Recursive CTE

```sql
-- Kategoriya ierarxiyasi
WITH RECURSIVE category_tree AS (
    -- Base case: root kategoriyalar
    SELECT id, name, parent_id, 1 AS level, name::text AS path
    FROM categories
    WHERE parent_id IS NULL

    UNION ALL

    -- Recursive case: bolalar
    SELECT c.id, c.name, c.parent_id, ct.level + 1, ct.path || ' > ' || c.name
    FROM categories c
    JOIN category_tree ct ON ct.id = c.parent_id
)
SELECT * FROM category_tree ORDER BY path;

-- Natija:
-- id | name         | level | path
-- 1  | Electronics  | 1     | Electronics
-- 2  | Phones       | 2     | Electronics > Phones
-- 3  | Smartphones  | 3     | Electronics > Phones > Smartphones
```

## Window Functions - Oyna Funksiyalari

Window functions - GROUP BY'siz agregatsiya va ranking qilish imkonini beradi.

### ROW_NUMBER, RANK, DENSE_RANK

```sql
-- Har bir kategoriyada narx bo'yicha reyting
SELECT
    name,
    category,
    price,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS row_num,
    RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rank,
    DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC) AS dense_rank
FROM products;

-- Farq:
-- ROW_NUMBER: 1, 2, 3, 4 (har doim unikal)
-- RANK:       1, 2, 2, 4 (teng bo'lsa skip)
-- DENSE_RANK: 1, 2, 2, 3 (teng bo'lsa skip qilmaydi)
```

### Aggregation Window Functions

```sql
-- Har bir buyurtma + umumiy statistika
SELECT
    id,
    customer_id,
    total,
    SUM(total) OVER () AS grand_total,
    AVG(total) OVER () AS avg_order,
    total / SUM(total) OVER () * 100 AS percentage_of_total
FROM orders;

-- Mijoz bo'yicha running total
SELECT
    id,
    customer_id,
    total,
    SUM(total) OVER (
        PARTITION BY customer_id
        ORDER BY created_at
    ) AS running_total
FROM orders;
```

### LAG va LEAD

```sql
-- Oldingi va keyingi qiymatlarni olish
SELECT
    id,
    created_at,
    total,
    LAG(total) OVER (ORDER BY created_at) AS prev_order_total,
    LEAD(total) OVER (ORDER BY created_at) AS next_order_total,
    total - LAG(total) OVER (ORDER BY created_at) AS diff_from_prev
FROM orders;

-- Oylik o'sish
WITH monthly AS (
    SELECT
        DATE_TRUNC('month', created_at) AS month,
        SUM(total) AS revenue
    FROM orders
    GROUP BY DATE_TRUNC('month', created_at)
)
SELECT
    month,
    revenue,
    LAG(revenue) OVER (ORDER BY month) AS prev_month,
    ROUND(
        (revenue - LAG(revenue) OVER (ORDER BY month)) /
        LAG(revenue) OVER (ORDER BY month) * 100,
        2
    ) AS growth_percent
FROM monthly;
```

## Query Optimization

### EXPLAIN ANALYZE

```sql
-- Query execution plan'ni ko'rish
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'john@example.com';

-- Output tahlili:
-- Seq Scan = Yomon (index yo'q)
-- Index Scan = Yaxshi
-- Bitmap Index Scan = O'rtacha
-- cost = Taxminiy narx
-- actual time = Haqiqiy vaqt
-- rows = Qatorlar soni
```

### Index Optimization

```sql
-- Ko'p ishlatiladigan WHERE uchun index
CREATE INDEX idx_users_email ON users(email);

-- Composite index (ustunlar tartibi muhim!)
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);

-- Partial index (faqat kerakli qatorlar)
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'pending';

-- Index ishlatilayotganini tekshirish
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';
-- Index Scan using idx_users_email ✅
```

### Query Performance Tips

```sql
-- ❌ Yomon: SELECT *
SELECT * FROM orders;

-- ✅ Yaxshi: Faqat kerakli ustunlar
SELECT id, total, status FROM orders;

-- ❌ Yomon: OR (index ishlamaydi)
SELECT * FROM users WHERE email = 'a@b.com' OR email = 'c@d.com';

-- ✅ Yaxshi: IN
SELECT * FROM users WHERE email IN ('a@b.com', 'c@d.com');

-- ❌ Yomon: Function on column (index ishlamaydi)
SELECT * FROM users WHERE LOWER(email) = 'john@example.com';

-- ✅ Yaxshi: Functional index yoki to'g'ri saqlash
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- ❌ Yomon: LIKE '%text' (index ishlamaydi)
SELECT * FROM products WHERE name LIKE '%phone%';

-- ✅ Yaxshi: Full-text search
SELECT * FROM products
WHERE search_vector @@ to_tsquery('phone');
```

## Real-World SQL Patterns

### Pagination

```sql
-- Offset-based (oddiy, katta offset sekin)
SELECT * FROM products
ORDER BY id
LIMIT 20 OFFSET 40;

-- Cursor-based (tezroq)
SELECT * FROM products
WHERE id > 60  -- Oxirgi ko'rilgan ID
ORDER BY id
LIMIT 20;

-- Keyset pagination with compound sort
SELECT * FROM products
WHERE (created_at, id) > ('2024-01-01', 1000)
ORDER BY created_at, id
LIMIT 20;
```

### Search

```sql
-- Simple LIKE search
SELECT * FROM products
WHERE name ILIKE '%' || $1 || '%';

-- Full-text search (PostgreSQL)
SELECT
    id,
    name,
    ts_rank(search_vector, query) AS rank
FROM products,
    to_tsquery('english', 'wireless & headphones') AS query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;
```

### Upsert (INSERT or UPDATE)

```sql
-- PostgreSQL UPSERT
INSERT INTO users (email, name, login_count)
VALUES ('john@example.com', 'John', 1)
ON CONFLICT (email)
DO UPDATE SET
    login_count = users.login_count + 1,
    last_login = CURRENT_TIMESTAMP;
```

### Soft Delete

```sql
-- Soft delete pattern
UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = 1;

-- Faol foydalanuvchilarni olish
SELECT * FROM users WHERE deleted_at IS NULL;

-- View orqali avtomatik filter
CREATE VIEW active_users AS
SELECT * FROM users WHERE deleted_at IS NULL;
```

## Frontend Uchun SQL Bilimi

### API Endpoint Design

```javascript
// Backend API ni SQL bilan tushunish

// GET /api/products?category=electronics&minPrice=100&sort=price&order=desc
// SQL ekvivalenti:
// SELECT * FROM products
// WHERE category = 'electronics' AND price >= 100
// ORDER BY price DESC

// GET /api/products?page=2&limit=20
// SQL ekvivalenti:
// SELECT * FROM products
// ORDER BY id
// LIMIT 20 OFFSET 20

// GET /api/orders?include=customer,items
// SQL ekvivalenti:
// SELECT o.*, c.name, c.email, json_agg(oi.*) as items
// FROM orders o
// JOIN customers c ON c.id = o.customer_id
// LEFT JOIN order_items oi ON oi.order_id = o.id
// GROUP BY o.id, c.id
```

### N+1 Muammosini Tushunish

```javascript
// ❌ N+1 muammo - Frontend tomondan ko'rinishi
// 1. GET /api/posts         -> 100 posts
// 2. GET /api/users/1       -> author for post 1
// 3. GET /api/users/2       -> author for post 2
// ... 100 ta so'rov

// ✅ To'g'ri - bitta so'rov
// GET /api/posts?include=author
// Backend SQL:
// SELECT p.*, u.name, u.avatar
// FROM posts p
// JOIN users u ON u.id = p.author_id
```

### Filter Parameters

```javascript
// Frontend filter → Backend SQL

const filters = {
  category: 'electronics',
  minPrice: 100,
  maxPrice: 500,
  search: 'phone',
  sort: 'price',
  order: 'desc',
  page: 1,
  limit: 20
};

// Backend tomonida:
const buildQuery = (filters) => {
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (filters.category) {
    query += ` AND category = $${paramIndex++}`;
    params.push(filters.category);
  }

  if (filters.minPrice) {
    query += ` AND price >= $${paramIndex++}`;
    params.push(filters.minPrice);
  }

  if (filters.maxPrice) {
    query += ` AND price <= $${paramIndex++}`;
    params.push(filters.maxPrice);
  }

  if (filters.search) {
    query += ` AND name ILIKE $${paramIndex++}`;
    params.push(`%${filters.search}%`);
  }

  // Sort
  const sortColumn = ['price', 'name', 'created_at'].includes(filters.sort)
    ? filters.sort
    : 'id';
  const sortOrder = filters.order === 'desc' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${sortColumn} ${sortOrder}`;

  // Pagination
  const limit = Math.min(filters.limit || 20, 100);
  const offset = ((filters.page || 1) - 1) * limit;
  query += ` LIMIT ${limit} OFFSET ${offset}`;

  return { query, params };
};
```

## Interview Savollari

### 1. INNER JOIN va LEFT JOIN farqi nima?

**Javob:**
```sql
-- INNER JOIN: Faqat ikkala jadvalda ham mavjud yozuvlar
-- Agar customer_id NULL bo'lsa, order ko'rinmaydi
SELECT o.*, c.name
FROM orders o
INNER JOIN customers c ON c.id = o.customer_id;

-- LEFT JOIN: Chap jadvaldan hamma, o'ng jadvaldan mos kelganlar
-- Customer yo'q bo'lsa ham order ko'rinadi (c.* NULL bo'ladi)
SELECT o.*, c.name
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id;

-- Amaliy farq:
-- - Buyurtmalar + mijoz ma'lumotlari: INNER (mijozi yo'q order kerak emas)
-- - Mijozlar + ularning buyurtmalari: LEFT (buyurtmasiz mijozlar ham kerak)
-- - Buyurtma qilmagan mijozlar: LEFT JOIN + WHERE ... IS NULL
```

### 2. GROUP BY va HAVING farqi nima?

**Javob:**
```sql
-- GROUP BY: Natijalarni guruhlash uchun
-- HAVING: Guruhlarni filterlash uchun
-- WHERE: Guruhlashdan OLDIN filterlash

-- Misol: 5 tadan ortiq mahsulotli kategoriyalar
SELECT category, COUNT(*) as product_count
FROM products
WHERE is_active = true      -- 1. Avval: faqat faol mahsulotlar
GROUP BY category           -- 2. Keyin: kategoriya bo'yicha guruhlash
HAVING COUNT(*) > 5         -- 3. Oxirida: 5+ mahsulotli guruhlar
ORDER BY product_count DESC;

-- WHERE vs HAVING:
-- WHERE: Individual row'larni filter (GROUP BY dan oldin)
-- HAVING: Aggregated qiymatlarni filter (GROUP BY dan keyin)

-- ❌ Xato: WHERE da aggregate
SELECT category, COUNT(*) FROM products
WHERE COUNT(*) > 5;  -- ERROR!

-- ✅ To'g'ri: HAVING da aggregate
SELECT category, COUNT(*) FROM products
GROUP BY category
HAVING COUNT(*) > 5;
```

### 3. Subquery vs JOIN - qachon qaysi birini ishlatish kerak?

**Javob:**
```sql
-- JOIN ishlatish kerak:
-- 1. Bir nechta jadvaldan ma'lumot olish kerak
-- 2. Performance muhim (JOIN odatda tezroq)
-- 3. Related data ko'rsatish

SELECT o.id, c.name
FROM orders o
JOIN customers c ON c.id = o.customer_id;

-- Subquery ishlatish kerak:
-- 1. Aggregated qiymat bilan solishtirish
-- 2. EXISTS/NOT EXISTS tekshirish
-- 3. Murakkab logic

SELECT * FROM products
WHERE price > (SELECT AVG(price) FROM products);

-- EXISTS vs IN:
-- EXISTS: Tezroq (topilgach to'xtaydi)
-- IN: NULL bilan muammo, lekin o'qilishi oson

-- ❌ NOT IN NULL bilan xavfli
SELECT * FROM customers
WHERE id NOT IN (SELECT customer_id FROM orders);
-- Agar birorta customer_id NULL bo'lsa, hech narsa qaytmaydi!

-- ✅ NOT EXISTS xavfsiz
SELECT * FROM customers c
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id
);
```

### 4. Window Functions nima va qachon ishlatiladi?

**Javob:**
```sql
-- Window Functions - GROUP BY qilmasdan agregatsiya

-- Use case 1: Running total
SELECT
    id, total,
    SUM(total) OVER (ORDER BY created_at) as running_total
FROM orders;

-- Use case 2: Ranking
SELECT
    name, category, price,
    RANK() OVER (PARTITION BY category ORDER BY price DESC) as rank
FROM products;

-- Use case 3: Oldingi/keyingi qiymat
SELECT
    id, total,
    LAG(total) OVER (ORDER BY created_at) as prev_order,
    total - LAG(total) OVER (ORDER BY created_at) as diff
FROM orders;

-- GROUP BY vs Window:
-- GROUP BY: Guruhlarni yig'adi (row'lar soni kamayadi)
-- Window: Har bir row saqlanadi + aggregate qo'shiladi

-- GROUP BY: 3 kategoriya → 3 row
SELECT category, AVG(price) FROM products GROUP BY category;

-- Window: 100 mahsulot → 100 row (har birida avg)
SELECT name, price, AVG(price) OVER (PARTITION BY category)
FROM products;
```

### 5. SQL Injection nima va qanday oldini olinadi?

**Javob:**
```javascript
// SQL Injection - zararli SQL kodni kiritish

// ❌ XAVFLI: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;
// Agar email = "'; DROP TABLE users; --"
// SELECT * FROM users WHERE email = ''; DROP TABLE users; --'

// ✅ XAVFSIZ: Parameterized queries
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);

// ✅ XAVFSIZ: ORM (Prisma, Drizzle, etc.)
const user = await prisma.user.findUnique({
  where: { email: email }  // Avtomatik escape qilinadi
});

// Qo'shimcha himoya:
// 1. Input validation
// 2. Least privilege (faqat kerakli permissions)
// 3. WAF (Web Application Firewall)
// 4. Prepared statements
```

## Frontend-Backend Aloqa

### Query Performance ta'siri Frontend'ga

```javascript
// Query tezligiga qarab UI strategiyasi

// Tez query (< 100ms) - Loading kerak emas
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => api.get(`/users/${userId}`),
  staleTime: 5 * 60 * 1000,  // 5 min cache
});

// O'rtacha query (100-500ms) - Skeleton loading
const { data, isLoading } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => api.get('/products', { params: filters }),
  staleTime: 1 * 60 * 1000,  // 1 min cache
});

if (isLoading) return <ProductSkeleton count={12} />;

// Sekin query (> 500ms) - Progress indicator
const { data, isLoading, fetchStatus } = useQuery({
  queryKey: ['analytics', range],
  queryFn: () => api.get('/analytics', { params: range }),
  staleTime: 10 * 60 * 1000,  // 10 min cache
});

// Juda sekin query - Background refresh
const { data } = useQuery({
  queryKey: ['report'],
  queryFn: () => api.get('/report'),
  staleTime: 60 * 60 * 1000,      // 1 soat cache
  refetchOnWindowFocus: false,    // Focus'da refresh qilma
  refetchOnReconnect: false,      // Reconnect'da refresh qilma
});
```

### Debugging SQL Issues

```javascript
// Backend loglardan SQL muammolarni aniqlash

// 1. Slow queries
// Backend log: "Query took 2500ms: SELECT * FROM orders..."
// Yechim: Index qo'shish, query optimize

// 2. N+1 problem
// Backend log:
// "Query: SELECT * FROM posts" (1 ms)
// "Query: SELECT * FROM users WHERE id = 1" (0.5 ms)
// "Query: SELECT * FROM users WHERE id = 2" (0.5 ms)
// ... 100 marta
// Yechim: JOIN yoki batch loading

// 3. Connection pool exhausted
// Backend log: "Error: Connection pool exhausted"
// Yechim: Query optimize, pool size oshirish

// Frontend'da monitoring
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        // Backend SQL xatosi
        if (error.response?.status === 500) {
          console.error('Server error - possible SQL issue');
        }
      },
    },
  },
});
```

## Xulosa

SQL bilimi frontend dasturchi uchun:

1. **API tushunish** - Backend qanday ma'lumot qaytarayotganini bilish
2. **Performance** - Nima uchun ba'zi API'lar sekin
3. **Debugging** - Muammolarni tezroq aniqlash
4. **Communication** - Backend jamoasi bilan samarali muloqot
5. **Full-stack** - Mustaqil loyihalar yaratish imkoniyati
