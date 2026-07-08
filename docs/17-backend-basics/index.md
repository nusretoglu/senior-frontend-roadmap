# Backend Basics for Frontend Developers

Bu bo'lim frontend dasturchilari uchun backend texnologiyalarini tushuntirishga bag'ishlangan. Full-stack rivojlanish uchun zarur bo'lgan barcha fundamental tushunchalar qamrab olingan.

## Nima Uchun Frontend Dasturchisiga Backend Kerak?

### 1. Yaxshiroq Kommunikatsiya
Backend jamoasi bilan samarali muloqot qilish uchun ularning texnologiyalarini tushunish kerak.

### 2. API Dizayn
Qanday API'lar qulay va samarali ekanligini bilish frontend ishini osonlashtiradi.

### 3. Performance Tushunish
Ma'lumotlar qayerdan kelayotganini va qancha vaqt olishini bilish UX yaxshilaydi.

### 4. Full-Stack Imkoniyat
Kichik loyihalarni mustaqil yaratish yoki startup'da ishlash uchun zarur.

### 5. Interview
Senior poziitsiyalar uchun backend bilimi talab qilinadi.

## Bo'lim Tarkibi

| # | Mavzu | Tavsif |
|---|-------|--------|
| 01 | [Databases](./01-databases.md) | SQL vs NoSQL, indexing, normalization, ACID, transactions |
| 02 | [SQL Basics](./02-sql-basics.md) | SELECT, JOIN, aggregation, subqueries, optimization |
| 03 | [Caching & Redis](./03-caching-redis.md) | Cache strategies, Redis data structures, invalidation |
| 04 | [Message Queues](./04-queues.md) | RabbitMQ, Bull, async processing, event-driven architecture |
| 05 | [Node.js Basics](./05-nodejs-basics.md) | Event loop, streams, clustering, process management |
| 06 | [API Design](./06-api-design.md) | REST, GraphQL, versioning, pagination, error handling |

## Frontend-Backend Aloqasi

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Vue/React │  │    State    │  │  API Client │             │
│  │  Components │◄─┤  Management │◄─┤  (Axios/Fetch)            │
│  └─────────────┘  └─────────────┘  └──────┬──────┘             │
└───────────────────────────────────────────┼─────────────────────┘
                                            │
                                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                         BACKEND                                    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                      API Layer                                │ │
│  │  ┌─────────┐  ┌──────────────┐  ┌────────────────┐          │ │
│  │  │  REST   │  │   GraphQL    │  │   WebSocket    │          │ │
│  │  │  API    │  │   Server     │  │   Server       │          │ │
│  │  └────┬────┘  └──────┬───────┘  └───────┬────────┘          │ │
│  └───────┼──────────────┼──────────────────┼────────────────────┘ │
│          │              │                  │                      │
│          ▼              ▼                  ▼                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                   Service Layer                               │ │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐ │ │
│  │  │ Business │  │  Auth     │  │  Cache   │  │   Queue     │ │ │
│  │  │  Logic   │  │  Service  │  │  Manager │  │   Manager   │ │ │
│  │  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └──────┬──────┘ │ │
│  └───────┼──────────────┼─────────────┼───────────────┼─────────┘ │
│          │              │             │               │           │
│          ▼              ▼             ▼               ▼           │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    Data Layer                                 │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │ │
│  │  │ Database │  │  Redis   │  │  S3/CDN  │  │  Queue Store │ │ │
│  │  │PostgreSQL│  │  Cache   │  │  Files   │  │  (RabbitMQ)  │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

## Asosiy Konseptlar

### Request-Response Cycle

```javascript
// Frontend: API so'rov yuborish
const response = await fetch('/api/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Backend: So'rovni qayta ishlash
app.get('/api/users', async (req, res) => {
  // 1. Authentication tekshirish
  const user = await verifyToken(req.headers.authorization);

  // 2. Cache tekshirish
  const cached = await redis.get('users:list');
  if (cached) return res.json(JSON.parse(cached));

  // 3. Database so'rov
  const users = await db.query('SELECT * FROM users');

  // 4. Cache saqlash
  await redis.setex('users:list', 3600, JSON.stringify(users));

  // 5. Response qaytarish
  res.json(users);
});
```

### Latency Tushunish

| Operatsiya | Vaqt | Frontend Ta'siri |
|------------|------|------------------|
| L1 cache | ~1ns | - |
| L2 cache | ~4ns | - |
| RAM | ~100ns | - |
| Redis read | ~1ms | Spinner kerak emas |
| DB query (indexed) | ~5ms | Spinner kerak emas |
| DB query (table scan) | ~100ms | Loading state kerak |
| Network request | ~50-500ms | Loading state kerak |
| External API | ~100ms-2s | Skeleton/spinner kerak |

## O'rganish Tartibi

1. **Databases** - Ma'lumotlar qanday saqlanishini tushunish
2. **SQL Basics** - So'rovlar yozishni o'rganish
3. **Caching** - Tezlikni oshirish usullari
4. **Queues** - Og'ir ishlarni async bajarish
5. **Node.js** - Backend runtime tushunish
6. **API Design** - Yaxshi API qanday bo'lishini bilish

## Instrumentlar

### Local Development

```bash
# PostgreSQL (Docker)
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  postgres:15

# Redis (Docker)
docker run -d --name redis \
  -p 6379:6379 \
  redis:7

# RabbitMQ (Docker)
docker run -d --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:3-management
```

### GUI Tools

- **Database:** TablePlus, DBeaver, pgAdmin
- **Redis:** RedisInsight, Redis Commander
- **API Testing:** Postman, Insomnia, HTTPie
- **Queue Monitoring:** RabbitMQ Management UI, Bull Board

## Senior Interview Mavzulari

### Must Know
- [ ] SQL vs NoSQL qachon ishlatiladi?
- [ ] Index qanday ishlaydi?
- [ ] Cache invalidation strategiyalari
- [ ] REST vs GraphQL farqlari
- [ ] N+1 query muammosi

### Good to Know
- [ ] Database sharding
- [ ] Event sourcing
- [ ] CQRS pattern
- [ ] Microservices vs monolith
- [ ] Database replication

### Expert Level
- [ ] Distributed transactions
- [ ] CAP theorem
- [ ] Consensus algorithms
- [ ] Database internals
- [ ] Query optimizer

## Foydali Resurslar

### Kitoblar
- "Designing Data-Intensive Applications" - Martin Kleppmann
- "Database Internals" - Alex Petrov
- "System Design Interview" - Alex Xu

### Online
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis University](https://university.redis.com/)
- [Node.js Guides](https://nodejs.org/en/docs/guides/)

### Video
- Hussein Nasser (Database/Backend)
- Fireship (Quick overviews)
- ThePrimeagen (Performance)
