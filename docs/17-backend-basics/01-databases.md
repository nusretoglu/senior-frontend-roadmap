# Databases - Ma'lumotlar Bazasi Asoslari

## Kirish

Database - bu ma'lumotlarni tizimli saqlash, boshqarish va olish uchun mo'ljallangan dasturiy ta'minot. Frontend dasturchi sifatida siz database'dan bevosita foydalanmasangiz-da, uning qanday ishlashini tushunish API dizayn va performance optimization uchun juda muhim.

## SQL vs NoSQL

### SQL (Relational) Databases

**Xususiyatlari:**
- Strukturalangan ma'lumotlar (jadvallar, ustunlar, qatorlar)
- ACID kafolatlari
- SQL query tili
- Munosabatlar (relations) orqali bog'lanish

**Mashhur misollar:** PostgreSQL, MySQL, SQLite, Oracle, SQL Server

```sql
-- SQL database strukturasi
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### NoSQL Databases

**Xususiyatlari:**
- Flexible schema (yoki schemeless)
- Horizontal scaling
- Turli data modellari (document, key-value, graph, column)
- Eventual consistency (ko'pincha)

**Turlari va misollar:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      NoSQL Database Types                        │
├─────────────────┬─────────────────┬─────────────────┬───────────┤
│   Document      │   Key-Value     │     Graph       │  Column   │
├─────────────────┼─────────────────┼─────────────────┼───────────┤
│   MongoDB       │     Redis       │     Neo4j       │ Cassandra │
│   CouchDB       │   DynamoDB      │   ArangoDB      │  HBase    │
│   Firestore     │   Memcached     │   Amazon Neptune│ ScyllaDB  │
└─────────────────┴─────────────────┴─────────────────┴───────────┘
```

### Document Database Misol (MongoDB)

```javascript
// MongoDB document strukturasi
const userDocument = {
  _id: ObjectId("507f1f77bcf86cd799439011"),
  email: "user@example.com",
  name: "John Doe",
  profile: {
    avatar: "https://...",
    bio: "Developer",
    social: {
      twitter: "@johndoe",
      github: "johndoe"
    }
  },
  orders: [
    { id: "ord_1", total: 99.99, status: "completed" },
    { id: "ord_2", total: 149.99, status: "pending" }
  ],
  createdAt: ISODate("2024-01-15T10:30:00Z")
};
```

### Qachon Qaysi Birini Tanlash?

| Kriteriya | SQL | NoSQL |
|-----------|-----|-------|
| **Structured data** | Ha | Yo'q/Flexible |
| **ACID kerak** | Ha | Qisman (ba'zilari) |
| **Complex queries/JOINs** | Ha | Yo'q |
| **Scaling** | Vertical | Horizontal |
| **Schema evolution** | Qiyin | Oson |
| **Transactions** | Ha | Cheklangan |
| **Read-heavy** | Yaxshi | Juda yaxshi |
| **Write-heavy** | O'rtacha | Juda yaxshi |

**Tanlash bo'yicha qoidalar:**

```javascript
// SQL tanlang agar:
// 1. Moliyaviy ma'lumotlar (banklar, to'lovlar)
// 2. Murakkab munosabatlar (e-commerce, ERP)
// 3. Reporting va analytics
// 4. ACID zarur

// NoSQL tanlang agar:
// 1. Flexible schema (CMS, user profiles)
// 2. High write throughput (logs, events)
// 3. Caching (sessions, real-time data)
// 4. Geographic distribution
```

## ACID Xususiyatlari

ACID - bu transaction ishonchliligini ta'minlaydigan to'rt xususiyat:

```
┌─────────────────────────────────────────────────────────────────┐
│                         ACID                                     │
├──────────────┬──────────────────────────────────────────────────┤
│  Atomicity   │  Transaction to'liq bajariladi yoki umuman       │
│              │  bajarilmaydi. Yarim holat yo'q.                 │
├──────────────┼──────────────────────────────────────────────────┤
│  Consistency │  Ma'lumotlar har doim valid holatda bo'ladi.     │
│              │  Constraintlar buzilmaydi.                       │
├──────────────┼──────────────────────────────────────────────────┤
│  Isolation   │  Parallel transactionlar bir-biriga             │
│              │  ta'sir qilmaydi.                                │
├──────────────┼──────────────────────────────────────────────────┤
│  Durability  │  Commit qilingan ma'lumotlar yo'qolmaydi.       │
│              │  Server crash bo'lsa ham.                        │
└──────────────┴──────────────────────────────────────────────────┘
```

### ACID Misoli

```javascript
// Pul o'tkazish - ACID zarur
async function transferMoney(fromAccount, toAccount, amount) {
  const client = await pool.connect();

  try {
    // Transaction boshlash
    await client.query('BEGIN');

    // 1. Hisobdan yechish
    const debit = await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1 RETURNING balance',
      [amount, fromAccount]
    );

    if (debit.rowCount === 0) {
      throw new Error('Insufficient funds');
    }

    // 2. Hisobga qo'shish
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toAccount]
    );

    // 3. Transaction log
    await client.query(
      'INSERT INTO transactions (from_account, to_account, amount) VALUES ($1, $2, $3)',
      [fromAccount, toAccount, amount]
    );

    // Commit - hammasi muvaffaqiyatli
    await client.query('COMMIT');

    return { success: true };
  } catch (error) {
    // Rollback - xato bo'lsa hammasi bekor
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

## Indexing

Index - bu ma'lumotlarni tez topish uchun ishlatiladigan ma'lumotlar strukturasi. Kitob oxiridagi index kabi ishlaydi.

### Index Qanday Ishlaydi?

```
┌─────────────────────────────────────────────────────────────────┐
│                    WITHOUT INDEX (Table Scan)                    │
│                                                                  │
│  Query: SELECT * FROM users WHERE email = 'john@example.com'     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Row 1 │ Row 2 │ Row 3 │ ... │ Row 999,999 │ Row 1,000,000 │ │
│  │  ✓    │  ✓    │  ✓    │ ... │     ✓       │      ✓        │ │
│  └────────────────────────────────────────────────────────────┘ │
│  Har bir qatorni tekshirish kerak = O(n) = 1,000,000 qiyoslash  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    WITH INDEX (B-Tree Lookup)                    │
│                                                                  │
│  Query: SELECT * FROM users WHERE email = 'john@example.com'     │
│                                                                  │
│                      ┌─────────────┐                            │
│                      │   M-Z       │                            │
│                      │   A-L  ◄────┼─── Root node               │
│                      └──────┬──────┘                            │
│                             │                                   │
│                      ┌──────▼──────┐                            │
│                      │   J-L       │                            │
│                      │   A-I       │◄── Intermediate            │
│                      └──────┬──────┘                            │
│                             │                                   │
│                      ┌──────▼──────┐                            │
│                      │ john@...    │◄── Leaf node               │
│                      │   → Row 42  │                            │
│                      └─────────────┘                            │
│                                                                  │
│  Faqat 3 qadam = O(log n) = ~20 qiyoslash (1M rows uchun)       │
└─────────────────────────────────────────────────────────────────┘
```

### Index Turlari

```sql
-- 1. B-Tree Index (default, eng ko'p ishlatiladigan)
CREATE INDEX idx_users_email ON users(email);

-- 2. Unique Index (dublikatlarni oldini oladi)
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- 3. Composite Index (bir nechta ustun)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- 4. Partial Index (faqat ba'zi qatorlar)
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'pending';

-- 5. GIN Index (full-text search, JSONB)
CREATE INDEX idx_products_tags ON products USING GIN(tags);

-- 6. BRIN Index (katta, tartiblangan ma'lumotlar)
CREATE INDEX idx_logs_created ON logs USING BRIN(created_at);
```

### Index Qachon Kerak?

```javascript
// INDEX kerak:
// 1. WHERE clause'da tez-tez ishlatiladigan ustunlar
// 2. JOIN'da ishlatiladigan ustunlar (foreign keys)
// 3. ORDER BY ustunlari
// 4. UNIQUE constraint'lar

// INDEX kerak EMAS:
// 1. Kichik jadvallar (< 1000 rows)
// 2. Tez-tez o'zgaradigan ustunlar
// 3. Kam selectivity (masalan, boolean, status)
// 4. Kam ishlatiladigan so'rovlar
```

### Index Performance Impact

```sql
-- Query EXPLAIN bilan tahlil
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john@example.com';

-- Index'siz natija:
-- Seq Scan on users (cost=0.00..25.00 rows=1 width=100)
--   Filter: (email = 'john@example.com'::text)
-- Planning Time: 0.1 ms
-- Execution Time: 15.2 ms  ◄── Sekin

-- Index bilan natija:
-- Index Scan using idx_users_email on users (cost=0.00..8.27 rows=1 width=100)
--   Index Cond: (email = 'john@example.com'::text)
-- Planning Time: 0.1 ms
-- Execution Time: 0.05 ms  ◄── 300x tez!
```

## Normalization

Normalization - bu ma'lumotlar takrorlanishini kamaytirish va ma'lumotlar yaxlitligini ta'minlash uchun database strukturasini optimallashtirish jarayoni.

### Normal Formlar

```
┌─────────────────────────────────────────────────────────────────┐
│                     NORMALIZATION LEVELS                         │
├─────────────────────────────────────────────────────────────────┤
│  1NF │ Har bir ustun atomic (bo'linmas) qiymatga ega            │
│      │ Takrorlanuvchi guruhlar yo'q                             │
├──────┼──────────────────────────────────────────────────────────┤
│  2NF │ 1NF + barcha non-key attributes to'liq primary key'ga   │
│      │ bog'liq (partial dependency yo'q)                       │
├──────┼──────────────────────────────────────────────────────────┤
│  3NF │ 2NF + transitive dependencies yo'q                      │
│      │ (non-key → non-key bog'liqlik yo'q)                     │
├──────┼──────────────────────────────────────────────────────────┤
│ BCNF │ 3NF ning kuchaytirilgan versiyasi                       │
│      │ Har bir determinant candidate key                        │
└──────┴──────────────────────────────────────────────────────────┘
```

### Normalization Misoli

```sql
-- ❌ DENORMALIZED (1NF emas)
CREATE TABLE orders_bad (
    id INT,
    customer_name VARCHAR(100),
    customer_email VARCHAR(255),
    products VARCHAR(500),  -- "iPhone, MacBook, AirPods" ◄── Atomic emas!
    total DECIMAL
);

-- ✅ NORMALIZED (3NF)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL  -- Buyurtma vaqtidagi narx
);
```

### Denormalization - Qachon?

Ba'zan performance uchun qasddan denormalize qilamiz:

```sql
-- Read-heavy query'lar uchun denormalization
CREATE TABLE order_summary (
    order_id INTEGER PRIMARY KEY,
    customer_name VARCHAR(100),      -- customers dan nusxa
    customer_email VARCHAR(255),     -- customers dan nusxa
    total DECIMAL(10, 2),
    item_count INTEGER,              -- Hisoblab saqlangan
    created_at TIMESTAMP
);

-- Trigger orqali sync
CREATE OR REPLACE FUNCTION update_order_summary()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO order_summary (order_id, customer_name, customer_email, total, item_count, created_at)
    SELECT
        NEW.id,
        c.name,
        c.email,
        NEW.total,
        (SELECT COUNT(*) FROM order_items WHERE order_id = NEW.id),
        NEW.created_at
    FROM customers c
    WHERE c.id = NEW.customer_id
    ON CONFLICT (order_id) DO UPDATE SET
        total = EXCLUDED.total,
        item_count = EXCLUDED.item_count;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Transactions va Isolation Levels

### Isolation Level'lar

```
┌─────────────────┬────────────────┬────────────────┬────────────────┐
│  Isolation      │  Dirty Read    │  Non-Repeatable│  Phantom       │
│  Level          │                │  Read          │  Read          │
├─────────────────┼────────────────┼────────────────┼────────────────┤
│ READ UNCOMMITTED│     Mumkin     │     Mumkin     │     Mumkin     │
├─────────────────┼────────────────┼────────────────┼────────────────┤
│ READ COMMITTED  │    Oldini      │     Mumkin     │     Mumkin     │
│ (PostgreSQL)    │    olingan     │                │                │
├─────────────────┼────────────────┼────────────────┼────────────────┤
│ REPEATABLE READ │    Oldini      │    Oldini      │     Mumkin     │
│                 │    olingan     │    olingan     │  (Postgres'da) │
├─────────────────┼────────────────┼────────────────┼────────────────┤
│ SERIALIZABLE    │    Oldini      │    Oldini      │    Oldini      │
│                 │    olingan     │    olingan     │    olingan     │
└─────────────────┴────────────────┴────────────────┴────────────────┘
```

### Transaction Misollari

```javascript
// Isolation level o'rnatish
async function updateInventory(productId, quantity) {
  const client = await pool.connect();

  try {
    // Serializable isolation - eng xavfsiz
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    // Stock tekshirish
    const result = await client.query(
      'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
      [productId]
    );

    if (result.rows[0].stock < quantity) {
      throw new Error('Not enough stock');
    }

    // Stock kamaytirish
    await client.query(
      'UPDATE products SET stock = stock - $1 WHERE id = $2',
      [quantity, productId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');

    // Serialization failure - retry
    if (error.code === '40001') {
      return updateInventory(productId, quantity); // Recursive retry
    }
    throw error;
  } finally {
    client.release();
  }
}
```

## N+1 Query Muammosi

Frontend uchun eng muhim backend muammolaridan biri:

```javascript
// ❌ N+1 MUAMMO
async function getOrdersWithCustomers() {
  // 1 query - barcha orderlar
  const orders = await db.query('SELECT * FROM orders');

  // N queries - har bir order uchun customer
  for (const order of orders) {
    order.customer = await db.query(
      'SELECT * FROM customers WHERE id = $1',
      [order.customer_id]
    );
  }

  return orders;
}
// 100 ta order = 101 query! 😱

// ✅ JOIN bilan hal qilish
async function getOrdersWithCustomersOptimized() {
  const orders = await db.query(`
    SELECT
      o.*,
      c.name as customer_name,
      c.email as customer_email
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
  `);

  return orders;
}
// 100 ta order = 1 query! ✅

// ✅ Yoki IN clause bilan
async function getOrdersWithCustomersBatch() {
  const orders = await db.query('SELECT * FROM orders');

  const customerIds = [...new Set(orders.map(o => o.customer_id))];
  const customers = await db.query(
    'SELECT * FROM customers WHERE id = ANY($1)',
    [customerIds]
  );

  const customerMap = new Map(customers.map(c => [c.id, c]));
  orders.forEach(o => {
    o.customer = customerMap.get(o.customer_id);
  });

  return orders;
}
// 100 ta order = 2 query! ✅
```

## Frontend Uchun Muhim Bilimlar

### 1. API Response Tuzilishi

```javascript
// ❌ Yomon - nested N+1 chaqiruvlar kerak bo'ladi
{
  "users": [
    { "id": 1, "name": "John" }
  ]
}
// Frontend: Har bir user uchun alohida orders fetch

// ✅ Yaxshi - Include bilan
{
  "users": [
    {
      "id": 1,
      "name": "John",
      "orders": [
        { "id": 1, "total": 99.99 }
      ]
    }
  ]
}
```

### 2. Pagination

```javascript
// Backend pagination types
// Offset-based (oddiy, lekin katta offset sekin)
GET /api/users?page=5&limit=20

// Cursor-based (tez, infinite scroll uchun ideal)
GET /api/users?cursor=eyJpZCI6MTAwfQ&limit=20
```

### 3. Loading States

```javascript
// Frontend: Database latency ni hisobga olish
const fetchData = async () => {
  setLoading(true);

  try {
    // Simple query: 5-50ms
    // Complex JOIN: 50-200ms
    // Aggregation: 100-500ms
    // Unoptimized: 1-10s
    const data = await api.get('/orders/summary');
    setData(data);
  } catch (error) {
    setError(error);
  } finally {
    setLoading(false);
  }
};
```

## Real-World Case: E-commerce Database

```sql
-- E-commerce uchun minimal schema
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES categories(id)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance uchun indexlar
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_slug ON products(slug);

-- Full-text search
ALTER TABLE products ADD COLUMN search_vector tsvector;
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- Search vector yangilash trigger
CREATE OR REPLACE FUNCTION update_product_search()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('russian', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('russian', coalesce(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_search
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_search();
```

## Interview Savollari

### 1. SQL va NoSQL o'rtasidagi asosiy farq nima va qachon qaysi birini tanlaysiz?

**Javob:**
```
SQL (Relational):
- Strukturalangan ma'lumotlar uchun
- ACID kafolatlari kerak bo'lganda (moliya, buyurtmalar)
- Complex queries va JOINlar kerak bo'lganda
- Misol: PostgreSQL, MySQL

NoSQL:
- Flexible schema kerak bo'lganda
- Horizontal scaling zarur bo'lganda
- High write throughput kerak (logs, analytics)
- Misol: MongoDB (documents), Redis (cache), Neo4j (graphs)

Tanlash:
- E-commerce, bank: SQL (ACID, relations)
- Social media posts, logs: NoSQL (scale, flexibility)
- Ko'pincha: ikkalasini birga (polyglot persistence)
```

### 2. Index nima va u qanday ishlaydi?

**Javob:**
```
Index - bu database'da ma'lumotlarni tez topish uchun
ishlatiladigan ma'lumotlar strukturasi (odatda B-Tree).

Qanday ishlaydi:
- Index alohida struktura sifatida saqlanadi
- Ustun qiymatlarini tartiblangan holda saqlaydi
- Har bir qiymat uchun row location'ni ko'rsatadi
- O(log n) murakkablik - 1M rowda ~20 qadam

Afzalliklari:
- Tez qidiruv (WHERE, JOIN)
- Tez tartiblash (ORDER BY)

Kamchiliklari:
- Qo'shimcha disk space
- INSERT/UPDATE sekinlashadi
- Maintenance kerak (REINDEX)

Qachon kerak:
- WHERE clause'da tez-tez ishlatiladigan ustunlar
- Foreign key ustunlari
- UNIQUE constraint'lar
```

### 3. N+1 query muammosi nima va qanday hal qilinadi?

**Javob:**
```javascript
// N+1 muammo:
// 1 query + N qo'shimcha query har bir item uchun

// Misol:
const posts = await db.query('SELECT * FROM posts');
for (const post of posts) {
  // Har bir post uchun alohida query
  post.author = await db.query(
    'SELECT * FROM users WHERE id = ?',
    [post.author_id]
  );
}
// 100 posts = 101 queries

// Yechimlar:

// 1. JOIN
const posts = await db.query(`
  SELECT p.*, u.name as author_name
  FROM posts p
  JOIN users u ON u.id = p.author_id
`);

// 2. Batching (IN clause)
const authorIds = [...new Set(posts.map(p => p.author_id))];
const authors = await db.query(
  'SELECT * FROM users WHERE id = ANY(?)',
  [authorIds]
);

// 3. ORM dataloader (GraphQL)
// Automatic batching
```

### 4. ACID nima va nima uchun muhim?

**Javob:**
```
ACID - transaction xavfsizligini ta'minlaydigan 4 xususiyat:

A - Atomicity (Atomiklik):
  Transaction to'liq bajariladi yoki umuman bajarilmaydi.
  Misol: Pul o'tkazishda bir hisobdan yechildi, ikkinchisiga
         qo'shilmadi - rollback bo'ladi.

C - Consistency (Izchillik):
  Ma'lumotlar har doim valid holatda.
  Constraints buzilmaydi (foreign key, unique, check).

I - Isolation (Izolyatsiya):
  Parallel transactionlar bir-biriga ta'sir qilmaydi.
  Isolation levellar: Read Uncommitted → Serializable.

D - Durability (Bardoshlilik):
  Commit qilingan ma'lumotlar yo'qolmaydi.
  Server crash bo'lsa ham disk'da saqlanadi.

Nima uchun muhim:
- Moliyaviy operatsiyalar (bank, to'lovlar)
- Inventory management (stock)
- Booking systems (concurrent requests)
```

### 5. Database normalization nima va qachon denormalize qilish kerak?

**Javob:**
```
Normalization:
- Ma'lumotlar takrorlanishini kamaytirish
- Data integrity ta'minlash
- Update anomalies oldini olish

Normal formlar:
1NF - Atomic values, no repeating groups
2NF - 1NF + no partial dependencies
3NF - 2NF + no transitive dependencies

Denormalization qachon:
1. Read-heavy workloads
   - Complex JOINlar sekin bo'lganda
   - Aggregated data tez-tez kerak bo'lganda

2. Reporting/Analytics
   - OLAP vs OLTP

3. Caching layer sifatida
   - Materialized views
   - Summary tables

Trade-off:
- Normalization: Write tez, Read sekin, Space kam
- Denormalization: Read tez, Write sekin, Space ko'p
```

## Frontend-Backend Aloqa

### Database Latency Frontend'da

```javascript
// API response time = Network + Server + Database

// Database query types va taxminiy vaqt:
const queryTimes = {
  'Simple SELECT with index': '1-5ms',
  'JOIN 2-3 tables': '5-20ms',
  'Complex aggregation': '20-100ms',
  'Full table scan': '100ms - seconds',
  'Unoptimized query': 'seconds - timeout'
};

// Frontend: Loading state strategiyasi
function OrderList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    // Query tezligiga qarab stale time
    staleTime: 30 * 1000, // Simple query - 30s
    // Aggregation uchun
    // staleTime: 5 * 60 * 1000, // 5 min
  });

  // Skeleton for expected latency
  if (isLoading) {
    return <OrderListSkeleton count={10} />;
  }

  return <OrderListView data={data} />;
}
```

### Optimistic Updates

```javascript
// Frontend: Database write kutmasdan UI yangilash
const queryClient = useQueryClient();

const updateOrder = useMutation({
  mutationFn: (order) => api.put(`/orders/${order.id}`, order),

  // Optimistic update
  onMutate: async (newOrder) => {
    await queryClient.cancelQueries({ queryKey: ['orders'] });

    const previousOrders = queryClient.getQueryData(['orders']);

    queryClient.setQueryData(['orders'], (old) =>
      old.map(o => o.id === newOrder.id ? newOrder : o)
    );

    return { previousOrders };
  },

  // Xato bo'lsa rollback
  onError: (err, newOrder, context) => {
    queryClient.setQueryData(['orders'], context.previousOrders);
  },

  // Muvaffaqiyatli bo'lsa server data bilan sync
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  },
});
```

### Real-time Updates

```javascript
// WebSocket orqali database changes
// Backend: Database trigger → Queue → WebSocket

// Frontend
useEffect(() => {
  const ws = new WebSocket('wss://api.example.com/orders');

  ws.onmessage = (event) => {
    const change = JSON.parse(event.data);

    switch (change.type) {
      case 'INSERT':
        queryClient.setQueryData(['orders'], (old) =>
          [...old, change.data]
        );
        break;
      case 'UPDATE':
        queryClient.setQueryData(['orders'], (old) =>
          old.map(o => o.id === change.data.id ? change.data : o)
        );
        break;
      case 'DELETE':
        queryClient.setQueryData(['orders'], (old) =>
          old.filter(o => o.id !== change.data.id)
        );
        break;
    }
  };

  return () => ws.close();
}, []);
```

## Xulosa

Database bilimi frontend dasturchi uchun:

1. **API dizayn** - Qanday so'rovlar samarali
2. **Performance** - Nima uchun ba'zi so'rovlar sekin
3. **Error handling** - Transaction xatolari
4. **Optimistic UI** - Qachon xavfsiz
5. **Real-time** - Qanday ishlaydi
6. **Communication** - Backend jamoasi bilan
