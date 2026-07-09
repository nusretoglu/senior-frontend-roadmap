# API Design - API Dizayn Asoslari

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchilar API ni faqat qanaqadir URL ga so'rov jo'natib JSON olib kelish deb tushunishadi. Ammo API (Application Programming Interface) — bu siz (Frontend) va Backend o'rtasidagi "Shartnoma"dir. Agar Backend sizga 1000 ta ro'yxatni Pagination (sahifalash) siz jo'natsa, dasturingiz qotadi. Agar xatolikni `500 Server Error` o'rniga doim `200 OK` deb oddiy matn bilan qaytaraversa, siz xatoni tuta olmaysiz. To'g'ri dizayn qilingan API (REST, GraphQL) loyihaning umrini uzaytiradi va ishingizni 10 barobar osonlashtiradi.

> [!NOTE]
> **Real-hayot analogiyasi: "Restoran Ofitsianti"**  
> Siz (Frontend) restoranda o'tiribsiz, Oshpaz (Backend) esa oshxonada.  
> **API bu — Ofitsiant.**  
> Siz ofitsiantga "Menga bitta kabob keltir" (Request: `GET /api/food/kabob`) deysiz. Ofitsiant bu buyurtmani olib oshxonaga boradi, oshpaz pishiradi va ofitsiant sizga kabobni (Response: `JSON`) olib keladi. Agar ofitsiant (API) karlar kabi nima deyayotganingizni tushunmasa yoki xatoga (Kabob tugagan) "Muammo yo'q" (200 OK) deyaversa, siz bu restoranda (loyihada) uzoq ishlay olmaysiz.

API (Application Programming Interface) - bu tizimlar o'rtasida aloqa qilish uchun belgilangan interfeysdir. Frontend dasturchi sifatida yaxshi API dizaynni tushunish sizga backend jamoasi bilan samarali ishlash, API muammolarini aniqlash va hatto o'z API'laringizni yaratish imkonini beradi.
## REST API Asoslari

### REST Printsiplari

```
┌─────────────────────────────────────────────────────────────────┐
│                    REST PRINCIPLES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Client-Server                                               │
│     Frontend va Backend mustaqil rivojlanadi                    │
│                                                                  │
│  2. Stateless                                                   │
│     Har bir request to'liq ma'lumot o'z ichiga oladi            │
│     Server client state saqlamaydi                              │
│                                                                  │
│  3. Cacheable                                                   │
│     Response'lar cache qilinishi mumkin                         │
│                                                                  │
│  4. Uniform Interface                                           │
│     Standart HTTP methods va status codes                       │
│     Resource-based URLs                                         │
│                                                                  │
│  5. Layered System                                              │
│     Client va server o'rtasida proxy/load balancer bo'lishi     │
│     mumkin                                                      │
│                                                                  │
│  6. Code on Demand (optional)                                   │
│     Server executable code yuborishi mumkin                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### HTTP Methods

```
┌─────────────┬──────────────────────────────────────────────────┐
│   Method    │                   Description                    │
├─────────────┼──────────────────────────────────────────────────┤
│   GET       │ Resource olish (read)                            │
│             │ Safe, Idempotent, Cacheable                      │
│             │ GET /api/users/123                               │
├─────────────┼──────────────────────────────────────────────────┤
│   POST      │ Yangi resource yaratish (create)                 │
│             │ Not Safe, Not Idempotent                         │
│             │ POST /api/users                                  │
├─────────────┼──────────────────────────────────────────────────┤
│   PUT       │ Resource to'liq yangilash (replace)              │
│             │ Not Safe, Idempotent                             │
│             │ PUT /api/users/123                               │
├─────────────┼──────────────────────────────────────────────────┤
│   PATCH     │ Resource qisman yangilash (partial update)       │
│             │ Not Safe, Not Idempotent                         │
│             │ PATCH /api/users/123                             │
├─────────────┼──────────────────────────────────────────────────┤
│   DELETE    │ Resource o'chirish                               │
│             │ Not Safe, Idempotent                             │
│             │ DELETE /api/users/123                            │
├─────────────┼──────────────────────────────────────────────────┤
│   OPTIONS   │ Allowed methods so'rash (CORS preflight)         │
│             │ Safe, Idempotent                                 │
├─────────────┼──────────────────────────────────────────────────┤
│   HEAD      │ GET kabi, lekin body'siz (metadata only)         │
│             │ Safe, Idempotent                                 │
└─────────────┴──────────────────────────────────────────────────┘

Safe = Server state o'zgarmaydi
Idempotent = Bir necha marta bajarilsa ham natija bir xil
```

### Resource Naming

```javascript
// ✅ Yaxshi URL'lar - Noun (ot) ishlatish
GET    /api/users              // Barcha users
GET    /api/users/123          // Bitta user
POST   /api/users              // Yangi user yaratish
PUT    /api/users/123          // User yangilash
DELETE /api/users/123          // User o'chirish

// ✅ Nested resources
GET    /api/users/123/orders   // User ning buyurtmalari
GET    /api/orders/456/items   // Order ning itemlari
POST   /api/users/123/orders   // User uchun buyurtma yaratish

// ❌ Yomon URL'lar - Verb (fe'l) ishlatish
GET    /api/getUsers           // ❌
POST   /api/createUser         // ❌
POST   /api/deleteUser/123     // ❌

// ❌ Inconsistent
GET    /api/user/123           // ❌ Singular
GET    /api/Users              // ❌ Capital

// Actions (istisnolar)
POST   /api/users/123/activate      // ✅ Action
POST   /api/orders/456/cancel       // ✅ Action
POST   /api/auth/login              // ✅ Auth action
POST   /api/auth/logout             // ✅ Auth action
```

### HTTP Status Codes

```javascript
// 2xx - Success
200 OK                    // GET/PUT/PATCH muvaffaqiyatli
201 Created               // POST yangi resource yaratildi
204 No Content            // DELETE muvaffaqiyatli (body yo'q)

// 3xx - Redirection
301 Moved Permanently     // URL o'zgargan
304 Not Modified          // Cacheable, o'zgarmagan

// 4xx - Client Errors
400 Bad Request           // Noto'g'ri so'rov (validation error)
401 Unauthorized          // Authentication kerak
403 Forbidden             // Authorization yo'q
404 Not Found             // Resource topilmadi
405 Method Not Allowed    // Bu method qo'llab-quvvatlanmaydi
409 Conflict              // Resource conflict (duplicate)
422 Unprocessable Entity  // Validation xatosi (semantik)
429 Too Many Requests     // Rate limit

// 5xx - Server Errors
500 Internal Server Error // Server xatosi
502 Bad Gateway           // Upstream server xatosi
503 Service Unavailable   // Server vaqtinchalik ishlamayapti
504 Gateway Timeout       // Upstream timeout
```

## Request va Response Format

### Request Structure

```javascript
// Headers
const headers = {
  'Content-Type': 'application/json',    // Body format
  'Accept': 'application/json',          // Qabul qilinadigan format
  'Authorization': 'Bearer <token>',     // Authentication
  'X-Request-ID': 'uuid',                // Request tracking
  'Accept-Language': 'uz, ru, en',       // Language preference
  'If-None-Match': 'etag-value',         // Conditional request
  'X-Api-Version': '2024-01-01'          // API version
};

// Query Parameters
// GET /api/products?category=electronics&minPrice=100&sort=-price&page=1&limit=20

// Path Parameters
// GET /api/users/:userId/orders/:orderId
// GET /api/users/123/orders/456

// Request Body
const createUser = {
  email: 'user@example.com',
  name: 'John Doe',
  profile: {
    avatar: 'https://...',
    bio: 'Developer'
  },
  preferences: {
    newsletter: true,
    language: 'uz'
  }
};
```

### Response Structure

```javascript
// Success Response
// GET /api/users/123
{
  "data": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T15:45:00Z"
  }
}

// Collection Response
// GET /api/users?page=2&limit=20
{
  "data": [
    { "id": 123, "name": "John" },
    { "id": 124, "name": "Jane" }
  ],
  "meta": {
    "total": 150,
    "page": 2,
    "limit": 20,
    "totalPages": 8
  },
  "links": {
    "self": "/api/users?page=2&limit=20",
    "first": "/api/users?page=1&limit=20",
    "prev": "/api/users?page=1&limit=20",
    "next": "/api/users?page=3&limit=20",
    "last": "/api/users?page=8&limit=20"
  }
}

// Create Response
// POST /api/users
// 201 Created
{
  "data": {
    "id": 125,
    "email": "new@example.com",
    "name": "New User",
    "createdAt": "2024-01-25T10:00:00Z"
  }
}

// Error Response
// 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}

// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found"
  }
}

// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "requestId": "req_abc123"  // Debugging uchun
  }
}
```

## Pagination

### Offset-Based Pagination

```javascript
// Request
GET /api/products?page=3&limit=20

// Response
{
  "data": [...],
  "meta": {
    "total": 500,
    "page": 3,
    "limit": 20,
    "totalPages": 25
  }
}

// Frontend implementation
function usePagination(initialPage = 1, limit = 20) {
  const [page, setPage] = useState(initialPage);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, limit],
    queryFn: () => api.get('/products', { params: { page, limit } })
  });

  return {
    data: data?.data,
    meta: data?.meta,
    page,
    setPage,
    hasNext: page < data?.meta?.totalPages,
    hasPrev: page > 1
  };
}
```

### Cursor-Based Pagination

```javascript
// Request (birinchi sahifa)
GET /api/products?limit=20

// Response
{
  "data": [...],
  "meta": {
    "hasMore": true,
    "nextCursor": "eyJpZCI6MTAwfQ=="  // Base64 encoded
  }
}

// Request (keyingi sahifa)
GET /api/products?cursor=eyJpZCI6MTAwfQ==&limit=20

// Frontend: Infinite scroll
function useInfiniteProducts() {
  return useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam }) =>
      api.get('/products', {
        params: { cursor: pageParam, limit: 20 }
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined,
    initialPageParam: undefined
  });
}
```

### Keyset Pagination

```javascript
// Eng samarali - katta dataset uchun
GET /api/products?after_id=100&limit=20

// Sorting bilan
GET /api/products?after_created=2024-01-15T10:00:00Z&after_id=100&limit=20

// Backend implementation
async function getProducts(afterId, limit = 20) {
  const products = await db.query(`
    SELECT * FROM products
    WHERE id > $1
    ORDER BY id
    LIMIT $2
  `, [afterId || 0, limit + 1]);

  const hasMore = products.length > limit;
  if (hasMore) products.pop();

  return {
    data: products,
    meta: {
      hasMore,
      nextId: hasMore ? products[products.length - 1].id : null
    }
  };
}
```

## Filtering, Sorting, va Field Selection

### Filtering

```javascript
// Simple filters
GET /api/products?category=electronics
GET /api/products?status=active&inStock=true

// Range filters
GET /api/products?minPrice=100&maxPrice=500
GET /api/products?createdAfter=2024-01-01

// Advanced filtering (operators)
GET /api/products?price[gte]=100&price[lte]=500
GET /api/products?name[contains]=phone
GET /api/products?status[in]=active,pending

// Backend: Query builder
function buildFilters(query) {
  const where = {};

  if (query.category) {
    where.category = query.category;
  }

  if (query.minPrice) {
    where.price = { ...where.price, $gte: Number(query.minPrice) };
  }

  if (query.maxPrice) {
    where.price = { ...where.price, $lte: Number(query.maxPrice) };
  }

  if (query.search) {
    where.name = { $ilike: `%${query.search}%` };
  }

  return where;
}
```

### Sorting

```javascript
// Single field
GET /api/products?sort=price        // ASC
GET /api/products?sort=-price       // DESC

// Multiple fields
GET /api/products?sort=-createdAt,name

// Alternative syntax
GET /api/products?sortBy=price&sortOrder=desc

// Backend implementation
function buildSort(sortParam) {
  if (!sortParam) return { id: 'asc' };

  const fields = sortParam.split(',');
  const orderBy = {};

  for (const field of fields) {
    if (field.startsWith('-')) {
      orderBy[field.slice(1)] = 'desc';
    } else {
      orderBy[field] = 'asc';
    }
  }

  return orderBy;
}
```

### Field Selection (Sparse Fieldsets)

```javascript
// Faqat kerakli fieldlar
GET /api/users?fields=id,name,email
GET /api/products?fields=id,name,price,thumbnail

// Nested fields
GET /api/orders?fields=id,total,customer.name

// Exclude fields
GET /api/users?exclude=password,createdAt

// Response
// GET /api/users/123?fields=id,name
{
  "data": {
    "id": 123,
    "name": "John Doe"
    // boshqa fieldlar yo'q
  }
}
```

### Include/Expand (Related Resources)

```javascript
// Include related resources
GET /api/orders?include=customer,items
GET /api/products?include=category,reviews

// Response
{
  "data": {
    "id": 1,
    "total": 99.99,
    "customer": {
      "id": 123,
      "name": "John Doe"
    },
    "items": [
      { "id": 1, "productId": 456, "quantity": 2 }
    ]
  }
}

// Depth control
GET /api/orders?include=items.product
```

## Versioning

### URL Versioning

```javascript
// Eng keng tarqalgan
GET /api/v1/users
GET /api/v2/users

// Afzalliklari:
// - Aniq va ko'rinib turibdi
// - Dokumentatsiya oson
// - Cache-friendly

// Kamchiliklari:
// - URL o'zgaradi
// - Client yangilanishi kerak
```

### Header Versioning

```javascript
// Custom header
GET /api/users
X-Api-Version: 2

// Accept header
GET /api/users
Accept: application/vnd.myapi.v2+json

// Afzalliklari:
// - URL toza
// - Semantic

// Kamchiliklari:
// - Ko'rinmaydi
// - Testing qiyinroq
```

### Query Parameter Versioning

```javascript
GET /api/users?version=2

// Afzalliklari:
// - URL toza
// - Oson test

// Kamchiliklari:
// - Kam professional
// - Caching muammolari
```

### Date-Based Versioning (Stripe style)

```javascript
// Header
Stripe-Version: 2024-01-01

// Har bir sana - API snapshot
// Mijoz o'z vaqtida yangilashi mumkin
// Deprecation aniq

// Best practice:
// - Breaking changes = new version
// - Additive changes = no version
// - Deprecation notice = 6-12 months
```

## Error Handling

### Error Response Structure

```javascript
// Standard error format
{
  "error": {
    "code": "VALIDATION_ERROR",       // Machine-readable
    "message": "Validation failed",   // Human-readable
    "details": [...],                 // Field-level errors
    "requestId": "req_abc123",        // For debugging
    "timestamp": "2024-01-25T10:30:00Z",
    "path": "/api/users",
    "documentation": "https://api.example.com/docs/errors#VALIDATION_ERROR"
  }
}

// Validation errors
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Must be a valid email address",
        "value": "invalid-email"
      },
      {
        "field": "age",
        "code": "OUT_OF_RANGE",
        "message": "Must be between 18 and 120",
        "value": 15
      }
    ]
  }
}
```

### Error Codes

```javascript
// Authentication/Authorization
UNAUTHORIZED          // 401 - Auth kerak
INVALID_TOKEN         // 401 - Token noto'g'ri
TOKEN_EXPIRED         // 401 - Token muddati o'tgan
FORBIDDEN             // 403 - Ruxsat yo'q
INSUFFICIENT_SCOPE    // 403 - Token scope yetarli emas

// Validation
VALIDATION_ERROR      // 400 - Input noto'g'ri
INVALID_FORMAT        // 400 - Format noto'g'ri
REQUIRED_FIELD        // 400 - Majburiy field yo'q
OUT_OF_RANGE          // 400 - Qiymat chegaradan tashqarida

// Resource
NOT_FOUND             // 404 - Resource topilmadi
ALREADY_EXISTS        // 409 - Dublikat
CONFLICT              // 409 - Conflict

// Rate limiting
RATE_LIMITED          // 429 - Too many requests

// Server
INTERNAL_ERROR        // 500 - Server xatosi
SERVICE_UNAVAILABLE   // 503 - Service down
```

### Frontend Error Handling

```javascript
// API client with error handling
class ApiClient {
  async request(config) {
    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: config.data ? JSON.stringify(config.data) : undefined
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(response.status, error);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, { code: 'NETWORK_ERROR', message: error.message });
    }
  }
}

class ApiError extends Error {
  constructor(status, data) {
    super(data.error?.message || 'Unknown error');
    this.status = status;
    this.code = data.error?.code;
    this.details = data.error?.details;
    this.requestId = data.error?.requestId;
  }
}

// Usage with React Query
const mutation = useMutation({
  mutationFn: createUser,
  onError: (error) => {
    if (error.code === 'VALIDATION_ERROR') {
      // Show field errors
      error.details.forEach(detail => {
        setFieldError(detail.field, detail.message);
      });
    } else if (error.status === 401) {
      // Redirect to login
      router.push('/login');
    } else {
      // Generic error
      toast.error(error.message);
    }
  }
});
```

## GraphQL vs REST

### GraphQL Overview

```javascript
// GraphQL Query
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    orders(first: 5) {
      id
      total
      items {
        product {
          name
          price
        }
        quantity
      }
    }
  }
}

// GraphQL Mutation
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}
```

### REST vs GraphQL

```
┌─────────────────────────────────────────────────────────────────┐
│                    REST vs GraphQL                               │
├──────────────────┬──────────────────────────────────────────────┤
│     Feature      │          REST          │       GraphQL       │
├──────────────────┼──────────────────────────────────────────────┤
│ Data fetching    │ Multiple endpoints     │ Single endpoint     │
│                  │ Over/under fetching    │ Exact data needed   │
├──────────────────┼──────────────────────────────────────────────┤
│ Caching          │ HTTP cache (easy)      │ Manual (complex)    │
├──────────────────┼──────────────────────────────────────────────┤
│ Versioning       │ URL/Header versioning  │ Schema evolution    │
├──────────────────┼──────────────────────────────────────────────┤
│ Documentation    │ OpenAPI/Swagger        │ Schema introspection│
├──────────────────┼──────────────────────────────────────────────┤
│ Error handling   │ HTTP status codes      │ errors array        │
├──────────────────┼──────────────────────────────────────────────┤
│ Learning curve   │ Lower                  │ Higher              │
├──────────────────┼──────────────────────────────────────────────┤
│ File upload      │ Native                 │ Complex             │
├──────────────────┼──────────────────────────────────────────────┤
│ Best for         │ Simple CRUD,           │ Complex data needs, │
│                  │ Public APIs            │ Mobile apps         │
└──────────────────┴──────────────────────────────────────────────┘
```

### Frontend Integration

```javascript
// REST
const user = await api.get('/users/123');
const orders = await api.get('/users/123/orders');
const products = await Promise.all(
  orders.map(order =>
    api.get(`/orders/${order.id}/items`)
  )
);
// 3+ API calls, over-fetching

// GraphQL
const { data } = await graphqlClient.query({
  query: GET_USER_WITH_ORDERS,
  variables: { id: '123' }
});
// 1 API call, exact data

// Apollo Client
import { gql, useQuery } from '@apollo/client';

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      orders {
        id
        total
      }
    }
  }
`;

function UserProfile({ userId }) {
  const { loading, error, data } = useQuery(GET_USER, {
    variables: { id: userId }
  });

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <Profile user={data.user} />;
}
```

## Authentication va Authorization

### Authentication Methods

```javascript
// 1. API Key (simple, static)
GET /api/data
X-API-Key: your-api-key

// 2. Bearer Token (JWT)
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 3. OAuth 2.0
GET /api/users
Authorization: Bearer access_token_from_oauth

// 4. Session Cookie
GET /api/users
Cookie: session_id=abc123
```

### JWT Structure

```javascript
// JWT = Header.Payload.Signature

// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "123",           // Subject (user id)
  "iat": 1706176200,      // Issued at
  "exp": 1706262600,      // Expiration
  "iss": "api.example.com", // Issuer
  "role": "admin",        // Custom claims
  "permissions": ["read", "write"]
}

// Frontend: Token management
const authStore = {
  accessToken: null,
  refreshToken: null,

  setTokens(access, refresh) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('refreshToken', refresh);
  },

  async refreshAccessToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    if (response.ok) {
      const { accessToken } = await response.json();
      this.accessToken = accessToken;
      return accessToken;
    }

    this.logout();
    throw new Error('Refresh failed');
  }
};

// Axios interceptor
axios.interceptors.request.use(
  (config) => {
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
  }
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const token = await authStore.refreshAccessToken();
        error.config.headers.Authorization = `Bearer ${token}`;
        return axios(error.config);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
```

## Rate Limiting

### Rate Limit Headers

```javascript
// Response headers
X-RateLimit-Limit: 100          // Max requests
X-RateLimit-Remaining: 95       // Qolgan requests
X-RateLimit-Reset: 1706176200   // Unix timestamp

// 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
Retry-After: 60

// Frontend handling
async function makeRequest(config, retries = 3) {
  try {
    const response = await api.request(config);

    // Track rate limits
    const remaining = response.headers.get('X-RateLimit-Remaining');
    if (remaining && parseInt(remaining) < 10) {
      console.warn('Rate limit approaching');
    }

    return response;
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      const retryAfter = error.response?.headers?.get('Retry-After') || 60;
      await sleep(retryAfter * 1000);
      return makeRequest(config, retries - 1);
    }
    throw error;
  }
}
```

## Real-World API Design Example

### E-commerce API

```javascript
// Products
GET    /api/v1/products                    // List products
GET    /api/v1/products/:id                // Get product
POST   /api/v1/products                    // Create product (admin)
PUT    /api/v1/products/:id                // Update product (admin)
DELETE /api/v1/products/:id                // Delete product (admin)
GET    /api/v1/products/:id/reviews        // Product reviews
POST   /api/v1/products/:id/reviews        // Add review

// Cart
GET    /api/v1/cart                        // Get current cart
POST   /api/v1/cart/items                  // Add item
PUT    /api/v1/cart/items/:id              // Update quantity
DELETE /api/v1/cart/items/:id              // Remove item
POST   /api/v1/cart/checkout               // Checkout

// Orders
GET    /api/v1/orders                      // List user orders
GET    /api/v1/orders/:id                  // Get order details
POST   /api/v1/orders/:id/cancel           // Cancel order
GET    /api/v1/orders/:id/tracking         // Tracking info

// Users
GET    /api/v1/users/me                    // Current user
PUT    /api/v1/users/me                    // Update profile
GET    /api/v1/users/me/addresses          // Addresses
POST   /api/v1/users/me/addresses          // Add address

// Auth
POST   /api/v1/auth/register               // Register
POST   /api/v1/auth/login                  // Login
POST   /api/v1/auth/logout                 // Logout
POST   /api/v1/auth/refresh                // Refresh token
POST   /api/v1/auth/forgot-password        // Password reset
POST   /api/v1/auth/reset-password         // Reset password

// Search
GET    /api/v1/search?q=phone&category=electronics&minPrice=100

// Example responses
// GET /api/v1/products?category=electronics&sort=-price&page=1&limit=12
{
  "data": [
    {
      "id": "prod_123",
      "name": "Smartphone X",
      "slug": "smartphone-x",
      "price": 599.99,
      "originalPrice": 699.99,
      "currency": "USD",
      "images": [
        { "url": "...", "alt": "Front view" }
      ],
      "category": {
        "id": "cat_1",
        "name": "Electronics"
      },
      "rating": 4.5,
      "reviewCount": 128,
      "inStock": true,
      "badges": ["sale", "new"]
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 12,
    "totalPages": 13
  },
  "links": { ... }
}
```

## Interview Savollari

### 1. REST va RESTful farqi nima?

**Javob:**
```
REST (Representational State Transfer):
- Architectural style (arxitektura uslubi)
- Roy Fielding tomonidan 2000 yilda taqdim etilgan
- 6 ta constraint (cheklov) belgilaydi

RESTful:
- REST prinsiplariga amal qiluvchi API
- Har bir API'ni REST deb bo'lmaydi

REST Constraints:
1. Client-Server
2. Stateless
3. Cacheable
4. Uniform Interface
4.1 Resource identification (URL)
4.2 Resource manipulation (HTTP methods)
4.3 Self-descriptive messages
4.4 HATEOAS (hypermedia)
5. Layered System
6. Code on Demand (optional)

Ko'p API'lar "RESTful" deyiladi, lekin
HATEOAS'ni qo'llab-quvvatlamaydi - bu to'liq
REST emas, lekin pragmatik yechim.
```

### 2. Idempotency nima va qaysi HTTP methodlar idempotent?

**Javob:**
```
Idempotency - bir xil so'rov bir necha marta
yuborilsa ham natija bir xil bo'lishi.

Idempotent methods:
- GET:    Bir xil ma'lumot qaytaradi
- PUT:    Bir xil state ga olib keladi
- DELETE: Bir xil natija (deleted yoki 404)
- HEAD:   GET kabi
- OPTIONS: Ma'lumot so'raydi

NOT Idempotent:
- POST:   Har safar yangi resource yaratishi mumkin
- PATCH:  Amaliyotga bog'liq (increment emas)

Nima uchun muhim:
- Retry safety
- Network failure handling
- Distributed systems

// POST idempotent qilish
// Idempotency-Key header
POST /api/payments
Idempotency-Key: uuid-123

// Server: Agar shu key bilan
// request bo'lgan bo'lsa, oldingi
// natijani qaytaradi
```

### 3. Pagination qanday implement qilinadi va qaysi usul yaxshiroq?

**Javob:**
```
1. Offset-based:
GET /api/items?page=5&limit=20
SELECT * FROM items LIMIT 20 OFFSET 80

Afzallik: Oddiy, random access
Kamchilik: Katta offset sekin, data shift muammosi

2. Cursor-based:
GET /api/items?cursor=abc123&limit=20
SELECT * FROM items WHERE id > last_id LIMIT 20

Afzallik: Tez, consistent
Kamchilik: Random access yo'q

3. Keyset:
GET /api/items?after_created=2024-01-01&after_id=100
Cursor'ning aniq versiyasi

Qachon qaysi:
- Admin panel, jadval: Offset (page jump kerak)
- Infinite scroll, feed: Cursor (performance)
- Real-time, katta data: Keyset (eng tez)

Best practice:
- Default limit (20)
- Max limit (100)
- Total count (optional, expensive)
```

### 4. API versioning qanday qilinadi?

**Javob:**
```
1. URL Versioning:
/api/v1/users
/api/v2/users

+ Aniq, ko'rinadi
+ Cache-friendly
- URL o'zgaradi

2. Header Versioning:
GET /api/users
X-Api-Version: 2

+ URL toza
- Ko'rinmaydi, test qiyin

3. Accept Header:
Accept: application/vnd.myapi.v2+json

+ REST-compliant
- Murakkab

4. Query Parameter:
/api/users?version=2

+ Oson
- Professional emas

Tavsiya:
- Public API: URL versioning
- Internal: Header/Accept
- Stripe style: Date-based

Breaking changes uchun:
- Yangi version
- 6-12 oy deprecation
- Migration guide
```

### 5. N+1 query muammosi API dizaynda qanday hal qilinadi?

**Javob:**
```
Muammo:
GET /api/posts         # 1 query
foreach post:
  GET /api/users/{id}  # N queries

Yechimlar:

1. Include/Embed:
GET /api/posts?include=author
{
  "posts": [{ "author": {...} }]
}

2. Compound Documents:
{
  "data": [{ "author_id": 1 }],
  "included": {
    "users": [{ "id": 1, "name": "..." }]
  }
}

3. GraphQL:
query {
  posts {
    title
    author { name }
  }
}

4. Batch endpoint:
GET /api/users?ids=1,2,3,4,5

Backend qo'llab-quvvatlashi kerak:
- Eager loading (ORM)
- DataLoader pattern
- JOIN vs separate queries

Best practice:
- Default: Minimal data
- Include parameter: Related data
- Document clearly
```

## Frontend-Backend Aloqa

### API Contract

```javascript
// OpenAPI/Swagger specification
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        200:
          description: Users list
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'

// Frontend: Type generation
// npx openapi-typescript api.yaml -o types.ts
import type { paths } from './types';

type UsersResponse = paths['/users']['get']['responses']['200']['content']['application/json'];
```

### API Client Pattern

```javascript
// Typed API client
import type { paths } from './api-types';

type ApiPath = keyof paths;
type ApiMethod<P extends ApiPath> = keyof paths[P];

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  async request<
    P extends ApiPath,
    M extends ApiMethod<P>
  >(
    path: P,
    method: M,
    options?: RequestOptions
  ): Promise<ApiResponse<P, M>> {
    const url = new URL(path as string, this.baseUrl);

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: method as string,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      body: options?.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      throw new ApiError(response);
    }

    return response.json();
  }

  // Convenience methods
  get = <P extends ApiPath>(path: P, params?: object) =>
    this.request(path, 'get', { params });

  post = <P extends ApiPath>(path: P, body: object) =>
    this.request(path, 'post', { body });
}

// Usage
const api = new ApiClient('https://api.example.com');
const users = await api.get('/users', { page: 1 });
```

### Error Boundary

```javascript
// React Error Boundary for API errors
function ApiErrorBoundary({ children }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      if (event.error instanceof ApiError) {
        setError(event.error);
      }
    };

    window.addEventListener('unhandledrejection', handleError);
    return () => window.removeEventListener('unhandledrejection', handleError);
  }, []);

  if (error) {
    if (error.status === 401) {
      return <Redirect to="/login" />;
    }

    if (error.status === 403) {
      return <ForbiddenPage />;
    }

    if (error.status >= 500) {
      return <ServerErrorPage requestId={error.requestId} />;
    }

    return <GenericErrorPage error={error} />;
  }

  return children;
}
```

## Xulosa

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **HTTP Status Kodlarni to'g'ri talab qilish:** Backend dasturchisidan har doim Mantiqiy (Logical) status kodlar qaytarishini talab qiling. Muammosiz o'tsa `200` yoki `201`, Ruxsat yo'q bo'lsa `401 / 403`, topilmasa `404`, formadagi xato uchun `422`, server yiqilsa `500`. Har doim `200` qaytarib, ichida `{ error: "Topilmadi" }` deb yozish — eng yomon (Anti-pattern) API dizayndir.
2. **Versioning (v1, v2) bo'lishi shart:** Agar API URL manzilida versiya ko'rsatilmagan bo'lsa (Masalan: `/api/v1/users`), ertaga Backend eski mantiqni o'zgartirsa, barcha oldingi Frontend va Mobil ilovalar (App) ishdan chiqadi. Eski applar `v1` da, yangilari `v2` da ishlashi API Barqarorligini ta'minlaydi.
3. **Paginatsiya (Pagination) va Qidiruv (Filtering):** Hech qachon array ni to'liq tortib kelmang. Frontend API ni shunday dizayn qilishi kerak-ki, URL da kerakli filtrlar ochiq yozilsin: `GET /api/users?page=2&limit=20&sort=-createdAt&role=admin`.

---

## Xulosa

| Arxitektura Turi | Ta'rifi | Qachon ishlatiladi? |
|------------------|---------|---------------------|
| **REST API** | URL orqali Resurslarni (Noun) CRUD (Get/Post/Put/Delete) qilish tizimi. | Eng mashhur va standart usul. Ochiq API lar (Public API) va klassik loyihalar uchun. |
| **GraphQL** | Frontend qaysi maydonlar (Fields) kerakligini so'raydi, Backend faqat shuni jo'natadi. | N+1 muammosi bo'lganda, ma'lumotlar juda murakkab (Nested) bo'lganda (Masalan: Facebook). |
| **WebSocket** | Server va Mijoz o'rtasida uzilmas ko'prik (Tunnel). Ikki tomonlama ma'lumot almashinadi. | Real vaqtda ishlash uchun (Chat, Birja kotirovkalari, Multiplayer o'yinlar). |
| **gRPC** | Google yechimi. JSON o'rniga Protobuf (binary) formatda ma'lumot uzatiladi. | Mikroservislar o'rtasida (Backend to Backend) gaplashish uchun (Juda tez!). |

API dizayn bilimi frontend dasturchi uchun xatolarni tez topish va jamoa bilan kelisha olish kalitidir. Status kodlar nimani anglatishi, Tokenlar (JWT/Cookie) qayerda yuborilishi va Interceptor lar qanday ishlashini bilsangiz, murakkab biznes mantiqlarni xatosiz Frontendga ulay olasiz. Axborot qayerdan, qanday formatda va qay holatda kelayotgani — zamonaviy Web dasturlashning eng muhim qismidir.
