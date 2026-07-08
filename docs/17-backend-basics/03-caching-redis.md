# Caching & Redis - Keshlash va Redis

## Kirish

Caching - bu tez-tez so'raladigan ma'lumotlarni tez kirish mumkin bo'lgan joyda saqlash texnikasi. Redis - bu eng mashhur in-memory data store bo'lib, caching, session management va real-time aplikatsiyalar uchun ishlatiladi.

## Nima Uchun Cache Kerak?

### Muammo

```
┌─────────────────────────────────────────────────────────────────┐
│                    WITHOUT CACHE                                 │
│                                                                  │
│  Client ─────► API ─────► Database                              │
│    │                         │                                   │
│    │         100ms           │        50-500ms                  │
│    │◄────────────────────────┤                                   │
│                                                                  │
│  Har bir so'rov = Database query                                │
│  1000 so'rov/sekund = 1000 query/sekund                         │
│  Database yuklanadi, sekinlashadi                               │
└─────────────────────────────────────────────────────────────────┘
```

### Yechim

```
┌─────────────────────────────────────────────────────────────────┐
│                     WITH CACHE                                   │
│                                                                  │
│  Client ─────► API ─────► Cache ─────► Database                 │
│    │                  │      │                                   │
│    │       1-5ms     │      │   (faqat cache miss)             │
│    │◄────────────────┤      │                                   │
│                      │      │                                   │
│                  Cache Hit  │    Cache Miss → DB → Cache        │
│                    (95%)    │         (5%)                      │
│                                                                  │
│  1000 so'rov/sekund:                                            │
│  - 950 ta cache'dan (1ms) = 950ms umumiy                        │
│  - 50 ta DB'dan (100ms) = 5000ms umumiy                         │
│  Total: ~6 sekund vs 100 sekund (cache'siz)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Latency Comparison

| Operatsiya | Vaqt | Tezlik farqi |
|------------|------|--------------|
| L1 Cache | ~1ns | Baseline |
| L2 Cache | ~4ns | 4x |
| RAM | ~100ns | 100x |
| **Redis (localhost)** | ~0.5ms | 500,000x |
| **Redis (network)** | ~1-2ms | 1,000,000x |
| SSD read | ~100μs | 100,000x |
| HDD read | ~10ms | 10,000,000x |
| Database query | ~10-100ms | 10-100,000,000x |
| External API | ~100ms-1s | 100,000,000x+ |

## Redis Asoslari

### Redis O'rnatish va Bog'lanish

```bash
# Docker bilan Redis
docker run -d --name redis -p 6379:6379 redis:7

# Yoki local install
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis
```

### Redis CLI

```bash
# Redis CLI'ga kirish
redis-cli

# Asosiy commands
SET name "John"
GET name
# "John"

DEL name
# (integer) 1

EXISTS name
# (integer) 0

# TTL bilan
SET session "abc123" EX 3600  # 1 soat
TTL session
# (integer) 3598

# Multiple keys
MSET user:1:name "John" user:1:email "john@example.com"
MGET user:1:name user:1:email
# 1) "John"
# 2) "john@example.com"
```

### Node.js bilan Redis

```javascript
// ioredis - eng mashhur Node.js Redis client
import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  // Connection pool
  maxRetriesPerRequest: 3,
  // Reconnect strategy
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 100, 3000);
  }
});

// Error handling
redis.on('error', (err) => console.error('Redis error:', err));
redis.on('connect', () => console.log('Redis connected'));

// Asosiy operatsiyalar
async function basicOperations() {
  // SET/GET
  await redis.set('user:1', JSON.stringify({ name: 'John', age: 30 }));
  const user = JSON.parse(await redis.get('user:1'));

  // TTL bilan
  await redis.setex('session:abc', 3600, 'user_data');

  // Conditional set
  await redis.setnx('lock:resource', '1'); // Faqat mavjud emas bo'lsa

  // Increment
  await redis.incr('page:views');
  await redis.incrby('stats:visits', 10);

  // Delete
  await redis.del('user:1');
}
```

## Redis Data Structures

### Strings

```javascript
// Eng oddiy va ko'p ishlatiladigan

// Oddiy qiymatlar
await redis.set('api:status', 'healthy');
await redis.get('api:status');

// JSON saqlash
const user = { id: 1, name: 'John', email: 'john@example.com' };
await redis.set('user:1', JSON.stringify(user));
const cached = JSON.parse(await redis.get('user:1'));

// Counter
await redis.set('page:home:views', 0);
await redis.incr('page:home:views');  // 1
await redis.incr('page:home:views');  // 2
await redis.incrby('page:home:views', 10);  // 12

// Flags/Locks
await redis.setnx('lock:order:123', process.pid);  // Distributed lock
```

### Hashes

```javascript
// Object sifatida saqlash (JSON'dan samarali)

// Set
await redis.hset('user:1', {
  name: 'John',
  email: 'john@example.com',
  age: 30
});

// Get single field
const name = await redis.hget('user:1', 'name');

// Get all
const user = await redis.hgetall('user:1');
// { name: 'John', email: 'john@example.com', age: '30' }

// Update single field
await redis.hset('user:1', 'age', 31);

// Increment field
await redis.hincrby('user:1', 'login_count', 1);

// Check field exists
await redis.hexists('user:1', 'email');  // 1

// Delete field
await redis.hdel('user:1', 'temporary_field');
```

### Lists

```javascript
// Queue, stack, recent items

// Push
await redis.lpush('notifications:user:1', JSON.stringify({
  type: 'message',
  text: 'New message'
}));

// Pop (queue - FIFO)
const notification = await redis.rpop('notifications:user:1');

// Pop (stack - LIFO)
const lastNotification = await redis.lpop('notifications:user:1');

// Range (pagination)
const recent = await redis.lrange('notifications:user:1', 0, 9);  // First 10

// Trim (keep only recent)
await redis.ltrim('activity:user:1', 0, 99);  // Keep last 100

// Blocking pop (real-time)
const item = await redis.brpop('queue:tasks', 5);  // 5 second timeout
```

### Sets

```javascript
// Unique values, membership, intersections

// Add
await redis.sadd('tags:post:1', 'javascript', 'nodejs', 'redis');
await redis.sadd('tags:post:2', 'javascript', 'react', 'frontend');

// Members
const tags = await redis.smembers('tags:post:1');
// ['javascript', 'nodejs', 'redis']

// Check membership
const hasTag = await redis.sismember('tags:post:1', 'javascript');  // 1

// Count
const tagCount = await redis.scard('tags:post:1');  // 3

// Remove
await redis.srem('tags:post:1', 'redis');

// Set operations
const commonTags = await redis.sinter('tags:post:1', 'tags:post:2');  // ['javascript']
const allTags = await redis.sunion('tags:post:1', 'tags:post:2');
```

### Sorted Sets

```javascript
// Ranked data, leaderboards, time-series

// Add with score
await redis.zadd('leaderboard:game:1', 1500, 'player:1');
await redis.zadd('leaderboard:game:1', 2000, 'player:2');
await redis.zadd('leaderboard:game:1', 1800, 'player:3');

// Top 10
const top10 = await redis.zrevrange('leaderboard:game:1', 0, 9, 'WITHSCORES');
// ['player:2', '2000', 'player:3', '1800', 'player:1', '1500']

// Player rank
const rank = await redis.zrevrank('leaderboard:game:1', 'player:1');  // 2 (0-indexed)

// Score range
const players = await redis.zrangebyscore('leaderboard:game:1', 1500, 2000);

// Increment score
await redis.zincrby('leaderboard:game:1', 100, 'player:1');

// Real-time trending (time-decay)
const score = Date.now() / 1000;  // Unix timestamp
await redis.zadd('trending:articles', score, 'article:123');
```

## Caching Patterns

### 1. Cache-Aside (Lazy Loading)

```javascript
// Eng mashhur pattern - cache'dan o'qi, yo'q bo'lsa DB'dan ol va cache'la

async function getUser(userId) {
  const cacheKey = `user:${userId}`;

  // 1. Cache'dan tekshir
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. DB'dan ol
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

  // 3. Cache'ga saqla
  if (user) {
    await redis.setex(cacheKey, 3600, JSON.stringify(user));  // 1 soat TTL
  }

  return user;
}

// Write - cache invalidation
async function updateUser(userId, data) {
  await db.query('UPDATE users SET name = $1 WHERE id = $2', [data.name, userId]);

  // Cache ni o'chir (keyingi read yangilab saqlaydi)
  await redis.del(`user:${userId}`);
}
```

### 2. Write-Through

```javascript
// Har bir write cache va DB'ga birga yoziladi

async function updateUser(userId, data) {
  // 1. DB'ga yoz
  const user = await db.query(
    'UPDATE users SET name = $1 WHERE id = $2 RETURNING *',
    [data.name, userId]
  );

  // 2. Cache'ga yoz
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));

  return user;
}
```

### 3. Write-Behind (Write-Back)

```javascript
// Avval cache'ga yoz, keyin async DB'ga yoz

async function updateUserAsync(userId, data) {
  // 1. Cache'ga yoz
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(data));

  // 2. Queue'ga qo'sh (async DB write)
  await redis.lpush('db:write:queue', JSON.stringify({
    table: 'users',
    id: userId,
    data: data,
    timestamp: Date.now()
  }));

  return data;
}

// Background worker
async function processWriteQueue() {
  while (true) {
    const item = await redis.brpop('db:write:queue', 5);
    if (item) {
      const { table, id, data } = JSON.parse(item[1]);
      await db.query(`UPDATE ${table} SET ... WHERE id = $1`, [id]);
    }
  }
}
```

### 4. Read-Through

```javascript
// Cache library o'zi DB'dan o'qiydi

class CacheManager {
  constructor(redis, db) {
    this.redis = redis;
    this.db = db;
  }

  async get(key, fetcher, ttl = 3600) {
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await fetcher();
    if (data) {
      await this.redis.setex(key, ttl, JSON.stringify(data));
    }

    return data;
  }
}

// Usage
const cache = new CacheManager(redis, db);

const user = await cache.get(
  `user:${userId}`,
  () => db.query('SELECT * FROM users WHERE id = $1', [userId]),
  3600
);
```

## Cache Invalidation Strategies

Cache invalidation - bu eng qiyin muammolardan biri kompyuter fanida.

### 1. Time-Based (TTL)

```javascript
// Vaqt bo'yicha expire

// Short TTL - tez o'zgaradigan data
await redis.setex('stock:price', 60, price);  // 1 min

// Medium TTL - user sessions
await redis.setex('session:abc', 3600, data);  // 1 soat

// Long TTL - kamdan-kam o'zgaradigan
await redis.setex('config:settings', 86400, config);  // 1 kun

// Refresh TTL on read
async function getWithRefresh(key, ttl) {
  const value = await redis.get(key);
  if (value) {
    await redis.expire(key, ttl);  // TTL yangilash
  }
  return value;
}
```

### 2. Event-Based

```javascript
// Ma'lumot o'zgarganda cache o'chirish

// User update event
eventEmitter.on('user:updated', async (userId) => {
  await redis.del(`user:${userId}`);
  await redis.del(`user:${userId}:profile`);
  await redis.del(`user:${userId}:settings`);
});

// Pattern-based delete
async function invalidateUserCache(userId) {
  const keys = await redis.keys(`user:${userId}:*`);
  if (keys.length > 0) {
    await redis.del(keys);
  }
}

// Pub/Sub bilan distributed invalidation
redis.publish('cache:invalidate', JSON.stringify({
  pattern: `user:${userId}:*`
}));

// Subscriber
subscriber.subscribe('cache:invalidate');
subscriber.on('message', async (channel, message) => {
  const { pattern } = JSON.parse(message);
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(keys);
  }
});
```

### 3. Version-Based

```javascript
// Cache key'ga version qo'shish

class VersionedCache {
  constructor(redis) {
    this.redis = redis;
  }

  async get(key) {
    const version = await this.redis.get(`version:${key}`);
    const versionedKey = `${key}:v${version || 1}`;
    return this.redis.get(versionedKey);
  }

  async set(key, value, ttl) {
    const version = await this.redis.get(`version:${key}`) || 1;
    const versionedKey = `${key}:v${version}`;
    return this.redis.setex(versionedKey, ttl, value);
  }

  async invalidate(key) {
    // Version oshirish = eski cache invalid
    await this.redis.incr(`version:${key}`);
  }
}
```

### 4. Stale-While-Revalidate

```javascript
// Eski data qaytarib, background'da yangilash

async function getWithRevalidate(key, fetcher, ttl, staleTTL) {
  const cached = await redis.get(key);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    if (age < ttl * 1000) {
      // Fresh - to'g'ridan qaytarish
      return data;
    }

    if (age < staleTTL * 1000) {
      // Stale - qaytarish + background refresh
      refreshInBackground(key, fetcher, ttl);
      return data;
    }
  }

  // No cache or too old - sync fetch
  return fetchAndCache(key, fetcher, ttl);
}

async function refreshInBackground(key, fetcher, ttl) {
  // Fire and forget
  fetchAndCache(key, fetcher, ttl).catch(console.error);
}

async function fetchAndCache(key, fetcher, ttl) {
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  return data;
}
```

## Redis Advanced Features

### Pub/Sub

```javascript
// Real-time messaging

// Publisher
const publisher = new Redis();

async function notifyUsers(event, data) {
  await publisher.publish('events:global', JSON.stringify({
    event,
    data,
    timestamp: Date.now()
  }));
}

// Subscriber
const subscriber = new Redis();

subscriber.subscribe('events:global', 'events:user:123');

subscriber.on('message', (channel, message) => {
  const { event, data } = JSON.parse(message);
  console.log(`Received ${event} on ${channel}`);

  // WebSocket orqali frontend'ga yuborish
  io.emit(event, data);
});

// Pattern subscription
subscriber.psubscribe('events:user:*');

subscriber.on('pmessage', (pattern, channel, message) => {
  const userId = channel.split(':')[2];
  // User-specific handling
});
```

### Transactions

```javascript
// Atomic operations

// MULTI/EXEC
async function transferBalance(from, to, amount) {
  const multi = redis.multi();

  multi.hincrby(`wallet:${from}`, 'balance', -amount);
  multi.hincrby(`wallet:${to}`, 'balance', amount);
  multi.lpush('transactions', JSON.stringify({
    from, to, amount, timestamp: Date.now()
  }));

  const results = await multi.exec();
  return results;
}

// WATCH - Optimistic locking
async function incrementIfEqual(key, expectedValue, increment) {
  await redis.watch(key);

  const current = await redis.get(key);
  if (current !== expectedValue) {
    await redis.unwatch();
    throw new Error('Value changed');
  }

  const multi = redis.multi();
  multi.incrby(key, increment);

  try {
    const results = await multi.exec();
    return results;
  } catch (err) {
    // Transaction failed - someone else modified
    throw new Error('Transaction failed');
  }
}
```

### Lua Scripts

```javascript
// Atomic complex operations

// Rate limiter script
const rateLimiterScript = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])

  local current = redis.call('incr', key)

  if current == 1 then
    redis.call('expire', key, window)
  end

  if current > limit then
    return 0
  end

  return 1
`;

async function checkRateLimit(ip, limit = 100, window = 60) {
  const result = await redis.eval(
    rateLimiterScript,
    1,  // number of keys
    `ratelimit:${ip}`,  // KEYS[1]
    limit,  // ARGV[1]
    window  // ARGV[2]
  );

  return result === 1;
}

// Leaderboard update with rank return
const updateScoreScript = `
  local key = KEYS[1]
  local member = ARGV[1]
  local score = tonumber(ARGV[2])

  redis.call('zadd', key, score, member)
  local rank = redis.call('zrevrank', key, member)

  return rank
`;
```

### Redis Streams

```javascript
// Event streaming / message queue

// Producer
async function addEvent(streamKey, event) {
  const id = await redis.xadd(
    streamKey,
    '*',  // Auto-generate ID
    'type', event.type,
    'data', JSON.stringify(event.data),
    'timestamp', Date.now()
  );
  return id;
}

// Consumer
async function processEvents(streamKey, lastId = '0') {
  while (true) {
    const events = await redis.xread(
      'BLOCK', 5000,  // 5 second block
      'STREAMS', streamKey, lastId
    );

    if (events) {
      for (const [stream, messages] of events) {
        for (const [id, fields] of messages) {
          await handleEvent(fields);
          lastId = id;
        }
      }
    }
  }
}

// Consumer groups (parallel processing)
async function processWithGroup(streamKey, groupName, consumerName) {
  // Create group if not exists
  try {
    await redis.xgroup('CREATE', streamKey, groupName, '0', 'MKSTREAM');
  } catch (err) {
    // Group already exists
  }

  while (true) {
    const events = await redis.xreadgroup(
      'GROUP', groupName, consumerName,
      'BLOCK', 5000,
      'COUNT', 10,
      'STREAMS', streamKey, '>'
    );

    if (events) {
      for (const [stream, messages] of events) {
        for (const [id, fields] of messages) {
          await handleEvent(fields);
          await redis.xack(streamKey, groupName, id);
        }
      }
    }
  }
}
```

## Real-World Caching Examples

### 1. API Response Caching

```javascript
// Express middleware

function cacheMiddleware(options = {}) {
  const { ttl = 300, keyPrefix = 'api' } = options;

  return async (req, res, next) => {
    // Skip non-GET requests
    if (req.method !== 'GET') return next();

    const cacheKey = `${keyPrefix}:${req.originalUrl}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      console.error('Cache read error:', err);
    }

    // Override res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      try {
        await redis.setex(cacheKey, ttl, JSON.stringify(data));
      } catch (err) {
        console.error('Cache write error:', err);
      }

      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}

// Usage
app.get('/api/products', cacheMiddleware({ ttl: 60 }), productsController);
```

### 2. Session Management

```javascript
// Session store with Redis

import session from 'express-session';
import RedisStore from 'connect-redis';

const redisStore = new RedisStore({
  client: redis,
  prefix: 'session:',
  ttl: 86400  // 24 hours
});

app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 86400000  // 24 hours
  }
}));

// Session usage
app.get('/api/me', (req, res) => {
  if (req.session.userId) {
    // User logged in
  }
});

app.post('/api/login', async (req, res) => {
  const user = await authenticate(req.body);
  req.session.userId = user.id;
  req.session.role = user.role;
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
});
```

### 3. Rate Limiting

```javascript
// Sliding window rate limiter

class RateLimiter {
  constructor(redis, options = {}) {
    this.redis = redis;
    this.limit = options.limit || 100;
    this.window = options.window || 60;
  }

  async isAllowed(identifier) {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - (this.window * 1000);

    // Remove old entries
    await this.redis.zremrangebyscore(key, 0, windowStart);

    // Count current window
    const count = await this.redis.zcard(key);

    if (count >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: windowStart + (this.window * 1000)
      };
    }

    // Add new request
    await this.redis.zadd(key, now, `${now}-${Math.random()}`);
    await this.redis.expire(key, this.window);

    return {
      allowed: true,
      remaining: this.limit - count - 1,
      resetAt: null
    };
  }
}

// Middleware
const rateLimiter = new RateLimiter(redis, { limit: 100, window: 60 });

async function rateLimitMiddleware(req, res, next) {
  const identifier = req.ip || req.headers['x-forwarded-for'];
  const result = await rateLimiter.isAllowed(identifier);

  res.set('X-RateLimit-Limit', rateLimiter.limit);
  res.set('X-RateLimit-Remaining', result.remaining);

  if (!result.allowed) {
    res.set('X-RateLimit-Reset', result.resetAt);
    return res.status(429).json({ error: 'Too many requests' });
  }

  next();
}
```

### 4. Distributed Locking

```javascript
// Redlock algorithm for distributed locks

import Redlock from 'redlock';

const redlock = new Redlock([redis], {
  retryCount: 3,
  retryDelay: 200,
  retryJitter: 100
});

async function processOrderExclusive(orderId) {
  let lock;

  try {
    // Acquire lock
    lock = await redlock.acquire([`lock:order:${orderId}`], 5000);

    // Critical section
    const order = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    await processOrder(order);
    await db.query('UPDATE orders SET status = $1 WHERE id = $2', ['processed', orderId]);

  } catch (err) {
    if (err instanceof Redlock.LockError) {
      // Could not acquire lock
      console.log('Order already being processed');
    }
    throw err;
  } finally {
    // Release lock
    if (lock) {
      await lock.release();
    }
  }
}
```

## Frontend Uchun Cache Bilimi

### 1. Cache Headers Tushunish

```javascript
// HTTP Cache headers

// Backend response headers
res.set('Cache-Control', 'public, max-age=3600');  // Browser cache 1 soat
res.set('ETag', 'abc123');  // Conditional request uchun
res.set('Last-Modified', 'Wed, 01 Jan 2024 00:00:00 GMT');

// Frontend fetch with cache
fetch('/api/products', {
  headers: {
    'If-None-Match': 'abc123',  // ETag
    'If-Modified-Since': 'Wed, 01 Jan 2024 00:00:00 GMT'
  }
});

// 304 Not Modified = cache'dan foydalanish
```

### 2. Frontend Cache Strategies

```javascript
// React Query / TanStack Query cache

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache vaqti - backend cache bilan sync
      staleTime: 5 * 60 * 1000,  // 5 min
      cacheTime: 30 * 60 * 1000,  // 30 min

      // Retry
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch conditions
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    }
  }
});

// Query-specific cache
const { data } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => api.get('/products', { params: filters }),
  staleTime: 60 * 1000,  // Products tez o'zgaradi
});

const { data: config } = useQuery({
  queryKey: ['config'],
  queryFn: () => api.get('/config'),
  staleTime: Infinity,  // Config kam o'zgaradi
});
```

### 3. Cache Invalidation Frontend'da

```javascript
// Mutation keyin cache invalidation

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (newProduct) => api.post('/products', newProduct),
  onSuccess: () => {
    // Related queries'ni invalidate
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  }
});

// Optimistic update
const mutation = useMutation({
  mutationFn: updateProduct,
  onMutate: async (newProduct) => {
    await queryClient.cancelQueries({ queryKey: ['products', newProduct.id] });

    const previousProduct = queryClient.getQueryData(['products', newProduct.id]);

    queryClient.setQueryData(['products', newProduct.id], newProduct);

    return { previousProduct };
  },
  onError: (err, newProduct, context) => {
    queryClient.setQueryData(
      ['products', newProduct.id],
      context.previousProduct
    );
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }
});
```

## Interview Savollari

### 1. Cache-aside va write-through pattern'lar o'rtasidagi farq nima?

**Javob:**
```
Cache-Aside (Lazy Loading):
1. Application avval cache'dan o'qiydi
2. Cache miss bo'lsa DB'dan o'qiydi
3. Ma'lumotni cache'ga yozadi
4. Write: Faqat DB'ga yoziladi, cache invalidate

Afzalliklari:
- Cache faqat kerakli data bilan to'ladi
- Cache unavailable bo'lsa ham ishlaydi

Kamchiliklari:
- Birinchi request sekin (cold cache)
- Cache va DB sync muammosi

Write-Through:
1. Har bir write cache va DB'ga birga yoziladi
2. Read har doim cache'dan

Afzalliklari:
- Cache har doim fresh
- Read har doim tez

Kamchiliklari:
- Write sekinroq (2 ta yozish)
- Cache kerak bo'lmagan data bilan to'lishi mumkin

Qachon qaysi:
- Read-heavy: Cache-aside
- Write-heavy + consistency muhim: Write-through
```

### 2. Cache invalidation qanday amalga oshiriladi?

**Javob:**
```
1. TTL (Time-To-Live):
   - Eng oddiy
   - Automatic expire
   - Stale data muammosi (TTL tugaguncha)

2. Event-based:
   - Data o'zgarganda invalidate
   - Pub/Sub bilan distributed
   - Real-time consistency

3. Version-based:
   - Cache key'ga version qo'shish
   - Version oshirish = invalidation
   - Atomic, race condition yo'q

4. Stale-While-Revalidate:
   - Stale data qaytarib, background refresh
   - Tez response + fresh data

Best practice:
- Kritik data: Event-based + qisqa TTL
- Static content: Uzoq TTL + manual invalidation
- User data: Event-based
- Aggregations: Scheduled refresh
```

### 3. Redis'da qanday data structure'larni bilasiz va qachon ishlatiladi?

**Javob:**
```
1. Strings:
   - Simple cache
   - Counters
   - Sessions

2. Hashes:
   - Objects (user profiles)
   - Field-level updates
   - Memory efficient

3. Lists:
   - Queues (FIFO/LIFO)
   - Recent items
   - Activity feeds

4. Sets:
   - Unique values
   - Tags, categories
   - Intersections (common friends)

5. Sorted Sets:
   - Leaderboards
   - Time-series
   - Priority queues

6. Streams:
   - Event sourcing
   - Message queues
   - Audit logs

Use case examples:
- Session: String (JSON) or Hash
- Leaderboard: Sorted Set
- Notifications: List
- Online users: Set
- Activity feed: Sorted Set + Stream
```

### 4. Distributed caching'da qanday muammolar bor va qanday hal qilinadi?

**Javob:**
```
1. Cache Stampede / Thundering Herd:
   Muammo: Cache expire bo'lganda ko'p request DB'ga boradi
   Yechim:
   - Lock (faqat 1 ta refresh)
   - Stale-while-revalidate
   - Random TTL jitter

2. Cache Penetration:
   Muammo: Mavjud bo'lmagan key'lar har doim DB'ga boradi
   Yechim:
   - Null qiymatlarni ham cache'lash
   - Bloom filter

3. Hot Key:
   Muammo: Bitta key juda ko'p request oladi
   Yechim:
   - Local cache (L1)
   - Key replication

4. Data Consistency:
   Muammo: Cache va DB sync emas
   Yechim:
   - Event-based invalidation
   - Distributed transactions
   - Eventual consistency accept

5. Cache Avalanche:
   Muammo: Ko'p key bir vaqtda expire
   Yechim:
   - Random TTL
   - Cache warming
   - Circuit breaker
```

### 5. Frontend developer sifatida cache qanday ta'sir qiladi?

**Javob:**
```
1. Response Time:
   - Cache hit: 1-5ms
   - Cache miss: 50-500ms
   - Loading state strategiyasi

2. Stale Data:
   - Cache TTL = qancha eski data ko'rinishi mumkin
   - Real-time features uchun WebSocket

3. Headers:
   - Cache-Control, ETag, Last-Modified
   - Conditional requests (304)

4. Frontend Cache:
   - React Query staleTime = backend TTL ga mos
   - Optimistic updates = immediate UI

5. Debugging:
   - X-Cache header (HIT/MISS)
   - Response time anomalies
   - Stale data reports

Best practices:
- API response time monitoring
- Cache headers'ni tekshirish
- staleTime = backend cache TTL
- Optimistic updates + invalidation
```

## Frontend-Backend Aloqa

### Cache-aware API Design

```javascript
// Backend: Cache headers
app.get('/api/products', cacheMiddleware, async (req, res) => {
  const products = await getProducts();

  // Cache headers
  res.set('Cache-Control', 'public, max-age=300');  // 5 min
  res.set('ETag', generateETag(products));

  res.json(products);
});

// Frontend: Cache headers'ni ishlatish
const { data, isStale } = useQuery({
  queryKey: ['products'],
  queryFn: async () => {
    const response = await fetch('/api/products');

    // Check cache header
    const cacheControl = response.headers.get('Cache-Control');
    const maxAge = parseInt(cacheControl?.match(/max-age=(\d+)/)?.[1] || '0');

    return {
      data: await response.json(),
      staleTime: maxAge * 1000
    };
  },
  staleTime: (query) => query.state.data?.staleTime || 5 * 60 * 1000
});
```

### Real-time Cache Updates

```javascript
// WebSocket orqali cache invalidation

// Backend
io.on('connection', (socket) => {
  socket.on('subscribe:products', () => {
    socket.join('products');
  });
});

// Product update bo'lganda
async function updateProduct(product) {
  await db.update(product);
  await redis.del(`product:${product.id}`);

  // Real-time notification
  io.to('products').emit('product:updated', {
    id: product.id,
    timestamp: Date.now()
  });
}

// Frontend
useEffect(() => {
  socket.on('product:updated', ({ id }) => {
    queryClient.invalidateQueries({ queryKey: ['products', id] });
  });
}, []);
```

## Xulosa

Cache bilimi frontend dasturchi uchun muhim:

1. **Performance** - Nima uchun ba'zi API'lar tez
2. **Stale data** - Qachon yangi data ko'rinishi
3. **Headers** - Cache-Control, ETag tushunish
4. **Frontend cache** - React Query/SWR to'g'ri sozlash
5. **Debugging** - Cache muammolarini aniqlash
6. **Real-time** - Cache invalidation strategies
