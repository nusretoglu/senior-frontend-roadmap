# REST API

## Kirish

REST (Representational State Transfer) - Roy Fielding tomonidan 2000-yilda PhD dissertatsiyasida taqdim etilgan arxitektura uslubi. Bu HTTP protokoli ustiga qurilgan, stateless, client-server arxitektura bo'lib, zamonaviy web API'larning de-facto standarti hisoblanadi.

## REST Principlari (Constraints)

### 1. Client-Server Architecture

Client va server mustaqil rivojlanadi. Server data storage va business logic uchun javobgar, client esa UI va user experience uchun.

```javascript
// Client (Frontend) - faqat data so'rash va ko'rsatish
async function getUsers() {
  const response = await fetch('/api/users');
  const users = await response.json();
  renderUsers(users);
}

// Server (Backend) - data saqlash va qaytarish
// Bu frontend developer uchun "black box"
```

### 2. Statelessness

Har bir request o'zida barcha kerakli ma'lumotni olib kelishi kerak. Server client session'ni saqlamaydi.

```javascript
// ❌ Noto'g'ri - server session'ga bog'liq
fetch('/api/orders'); // Server "qaysi user?" deb so'raydi

// ✅ To'g'ri - har bir request o'z-o'zini ta'riflaydi
fetch('/api/orders', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
  }
});
```

### 3. Cacheability

Response'lar cacheable yoki non-cacheable deb belgilanishi kerak.

```javascript
// Cache-Control header orqali
const response = await fetch('/api/products');
// Response headers: Cache-Control: max-age=3600, public

// ETag orqali conditional request
const response = await fetch('/api/products', {
  headers: {
    'If-None-Match': '"abc123"' // oldingi ETag
  }
});
// Agar o'zgarmagan bo'lsa: 304 Not Modified
```

### 4. Uniform Interface

Barcha resource'lar bir xil interface orqali accessible bo'lishi kerak.

```javascript
// Resource identification - URI orqali
GET /api/users/123        // Bitta user
GET /api/users            // Barcha userlar
GET /api/users/123/orders // User'ning orderlari

// Resource manipulation - HTTP methods orqali
POST /api/users           // Yaratish
PUT /api/users/123        // To'liq yangilash
PATCH /api/users/123      // Qisman yangilash
DELETE /api/users/123     // O'chirish
```

### 5. Layered System

Client intermediate server'lar haqida bilmasligi kerak (load balancer, proxy, cache).

### 6. Code on Demand (Optional)

Server executable code yuborishi mumkin (JavaScript, applets).

## HTTP Methods Chuqur

### GET - Resource Olish

```javascript
// Simple GET
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// GET with query parameters
async function searchUsers(params) {
  const query = new URLSearchParams({
    search: params.search || '',
    page: params.page || 1,
    limit: params.limit || 20,
    sort: params.sort || 'created_at',
    order: params.order || 'desc'
  });

  const response = await fetch(`/api/users?${query}`);
  return response.json();
}

// Real-world example: filtered product list
async function getProducts(filters) {
  const query = new URLSearchParams();

  if (filters.category) query.append('category', filters.category);
  if (filters.minPrice) query.append('min_price', filters.minPrice);
  if (filters.maxPrice) query.append('max_price', filters.maxPrice);
  if (filters.inStock !== undefined) query.append('in_stock', filters.inStock);

  // Array parameter
  if (filters.tags?.length) {
    filters.tags.forEach(tag => query.append('tags[]', tag));
  }

  const response = await fetch(`/api/products?${query}`);
  return response.json();
}
```

### POST - Resource Yaratish

```javascript
// Basic POST
async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create user');
  }

  // 201 Created - yangi resource URL Location header'da
  const location = response.headers.get('Location');
  console.log('Created at:', location); // /api/users/456

  return response.json();
}

// File upload with FormData
async function uploadAvatar(userId, file) {
  const formData = new FormData();
  formData.append('avatar', file);
  formData.append('userId', userId);

  // Content-Type avtomatik set bo'ladi (multipart/form-data)
  const response = await fetch('/api/users/avatar', {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

// Nested resource creation
async function createOrder(userId, orderData) {
  const response = await fetch(`/api/users/${userId}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: orderData.items,
      shipping_address_id: orderData.shippingAddressId,
      payment_method_id: orderData.paymentMethodId,
    }),
  });

  return response.json();
}
```

### PUT vs PATCH

```javascript
// PUT - To'liq almashtirish (idempotent)
// Barcha fieldlar yuborilishi kerak
async function updateUser(id, userData) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      // Agar field yuborilmasa, null/default bo'ladi
    }),
  });

  return response.json();
}

// PATCH - Qisman yangilash
// Faqat o'zgargan fieldlar
async function patchUser(id, changes) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(changes), // { name: 'New Name' }
  });

  return response.json();
}

// JSON Patch format (RFC 6902)
async function applyPatch(id, operations) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json-patch+json',
    },
    body: JSON.stringify([
      { op: 'replace', path: '/name', value: 'New Name' },
      { op: 'add', path: '/tags/-', value: 'premium' },
      { op: 'remove', path: '/temporary_field' },
    ]),
  });

  return response.json();
}
```

### DELETE - Resource O'chirish

```javascript
// Simple DELETE
async function deleteUser(id) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  });

  // 204 No Content - success, body yo'q
  // 200 OK - success, deleted resource qaytarildi
  // 202 Accepted - async deletion queued

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Soft delete (archive)
async function archiveUser(id) {
  const response = await fetch(`/api/users/${id}/archive`, {
    method: 'POST',
  });

  return response.json();
}

// Bulk delete
async function deleteUsers(ids) {
  // Variant 1: Query param
  const query = new URLSearchParams();
  ids.forEach(id => query.append('ids[]', id));

  const response = await fetch(`/api/users?${query}`, {
    method: 'DELETE',
  });

  // Variant 2: Body (ba'zi API'lar qo'llab-quvvatlamaydi)
  const response2 = await fetch('/api/users/batch-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  return response.json();
}
```

## HTTP Status Codes

### 2xx Success

```javascript
const STATUS_CODES = {
  200: 'OK - Request muvaffaqiyatli',
  201: 'Created - Yangi resource yaratildi',
  202: 'Accepted - Request qabul qilindi, processing davom etmoqda',
  204: 'No Content - Success, lekin body yo'q',
};

// Status code handling
async function handleResponse(response) {
  switch (response.status) {
    case 200:
      return response.json();

    case 201:
      const location = response.headers.get('Location');
      const data = await response.json();
      return { ...data, _location: location };

    case 202:
      // Async operation - polling kerak
      const { jobId } = await response.json();
      return pollJobStatus(jobId);

    case 204:
      return null;

    default:
      return response.json();
  }
}
```

### 4xx Client Errors

```javascript
async function handleClientError(response) {
  const status = response.status;
  const body = await response.json().catch(() => ({}));

  switch (status) {
    case 400:
      // Bad Request - validation xatosi
      throw new ValidationError(body.errors || body.message);

    case 401:
      // Unauthorized - auth kerak
      redirectToLogin();
      throw new AuthError('Please login to continue');

    case 403:
      // Forbidden - ruxsat yo'q
      throw new ForbiddenError('You do not have permission');

    case 404:
      // Not Found - resource topilmadi
      throw new NotFoundError(body.message || 'Resource not found');

    case 409:
      // Conflict - concurrent update
      throw new ConflictError('Resource was modified by another user');

    case 422:
      // Unprocessable Entity - semantic error
      throw new ValidationError(body.errors);

    case 429:
      // Too Many Requests - rate limit
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(`Rate limited. Retry after ${retryAfter}s`);

    default:
      throw new ClientError(`Client error: ${status}`);
  }
}

// Custom error classes
class ValidationError extends Error {
  constructor(errors) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}
```

### 5xx Server Errors

```javascript
async function handleServerError(response) {
  const status = response.status;

  switch (status) {
    case 500:
      // Internal Server Error
      console.error('Server error occurred');
      throw new ServerError('Something went wrong on our end');

    case 502:
      // Bad Gateway
      throw new ServerError('Server is temporarily unavailable');

    case 503:
      // Service Unavailable
      const retryAfter = response.headers.get('Retry-After');
      throw new ServiceUnavailableError(retryAfter);

    case 504:
      // Gateway Timeout
      throw new TimeoutError('Request timed out');

    default:
      throw new ServerError(`Server error: ${status}`);
  }
}
```

## HATEOAS (Hypermedia as the Engine of Application State)

REST'ning eng advanced prinsipi - response'lar keyingi mumkin bo'lgan action'larni o'z ichiga oladi.

```javascript
// HATEOAS response example
const orderResponse = {
  id: 123,
  status: 'pending',
  total: 99.99,
  items: [...],

  // Hypermedia links
  _links: {
    self: { href: '/api/orders/123' },
    payment: { href: '/api/orders/123/payment', method: 'POST' },
    cancel: { href: '/api/orders/123/cancel', method: 'POST' },
    customer: { href: '/api/customers/456' },
  }
};

// HATEOAS-aware client
class HATEOASClient {
  async followLink(resource, rel, data = null) {
    const link = resource._links?.[rel];

    if (!link) {
      throw new Error(`Link '${rel}' not available`);
    }

    const options = {
      method: link.method || 'GET',
    };

    if (data && options.method !== 'GET') {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(data);
    }

    const response = await fetch(link.href, options);
    return response.json();
  }
}

// Usage
const client = new HATEOASClient();
const order = await client.get('/api/orders/123');

// Order status'ga qarab available actions
if (order._links.payment) {
  // Payment button ko'rsatish
  await client.followLink(order, 'payment', { method: 'credit_card' });
}

if (order._links.cancel) {
  // Cancel button ko'rsatish
  await client.followLink(order, 'cancel');
}
```

## Error Handling Patterns

### Unified Error Response Format

```javascript
// Backend response format (standard)
const errorResponse = {
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details: [
      { field: 'email', message: 'Invalid email format' },
      { field: 'password', message: 'Password must be at least 8 characters' },
    ],
    timestamp: '2024-01-15T10:30:00Z',
    requestId: 'req_abc123',
  }
};

// Frontend error handler
class APIError extends Error {
  constructor(response, body) {
    super(body?.error?.message || 'API Error');
    this.name = 'APIError';
    this.status = response.status;
    this.code = body?.error?.code;
    this.details = body?.error?.details;
    this.requestId = body?.error?.requestId;
  }

  getFieldError(fieldName) {
    return this.details?.find(d => d.field === fieldName)?.message;
  }

  toUserMessage() {
    // User-friendly message
    const messages = {
      VALIDATION_ERROR: 'Please check your input',
      NOT_FOUND: 'The requested item was not found',
      UNAUTHORIZED: 'Please login to continue',
      FORBIDDEN: 'You do not have permission',
      RATE_LIMITED: 'Too many requests. Please try again later',
      SERVER_ERROR: 'Something went wrong. Please try again',
    };

    return messages[this.code] || this.message;
  }
}

// Universal fetch wrapper
async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Success
  if (response.ok) {
    if (response.status === 204) return null;
    return response.json();
  }

  // Error
  const body = await response.json().catch(() => ({}));
  throw new APIError(response, body);
}

// Usage with try-catch
async function submitForm(formData) {
  try {
    const result = await api('/api/users', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    showSuccess('User created successfully');
    return result;

  } catch (error) {
    if (error instanceof APIError) {
      // Field-level errors
      if (error.code === 'VALIDATION_ERROR') {
        const emailError = error.getFieldError('email');
        if (emailError) {
          setFieldError('email', emailError);
        }
      }

      showError(error.toUserMessage());
    } else {
      // Network error
      showError('Network error. Please check your connection');
    }
  }
}
```

### Retry Logic for Transient Errors

```javascript
async function apiWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await api(url, options);
    } catch (error) {
      lastError = error;

      // Faqat transient error'lar uchun retry
      if (error instanceof APIError) {
        const retryableStatus = [408, 429, 500, 502, 503, 504];

        if (!retryableStatus.includes(error.status)) {
          throw error; // Client error - retry qilmaymiz
        }
      }

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
```

## Real-World Case: E-commerce API Integration

```javascript
// Complete e-commerce API client
class EcommerceAPI {
  constructor(baseUrl, authToken) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  async handleError(response) {
    const body = await response.json().catch(() => ({}));

    if (response.status === 401) {
      // Token expired - refresh and retry
      await this.refreshToken();
      throw new RetryableError();
    }

    throw new APIError(response, body);
  }

  // Products
  async getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/products?${params}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  // Cart
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId, quantity = 1) {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async checkout(checkoutData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  async getOrders(page = 1, limit = 20) {
    return this.request(`/orders?page=${page}&limit=${limit}`);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async cancelOrder(id, reason) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }
}

// Usage
const api = new EcommerceAPI('https://api.store.com', userToken);

// Product listing
const products = await api.getProducts({
  category: 'electronics',
  min_price: 100,
  max_price: 500,
  in_stock: true,
});

// Add to cart
await api.addToCart(products[0].id, 2);

// Checkout
const order = await api.checkout({
  shipping_address_id: 'addr_123',
  payment_method: 'credit_card',
  payment_token: 'tok_visa',
});
```

## Interview Savollari

### 1. REST va RESTful farqi nima?

**Javob:** REST - bu arxitektura uslubi (Roy Fielding dissertatsiyasi), RESTful - bu REST prinsiplariga amal qiluvchi API. Ko'pchilik API'lar o'zini RESTful deb ataydi, lekin aslida to'liq REST emas. Masalan, HATEOAS ko'pchilik API'larda yo'q.

```javascript
// REST-ish (partial)
GET /getUsers
POST /createUser
POST /deleteUser

// RESTful
GET /users
POST /users
DELETE /users/{id}

// True REST with HATEOAS
GET /users/123
Response: {
  id: 123,
  name: "John",
  _links: {
    self: { href: "/users/123" },
    orders: { href: "/users/123/orders" },
    delete: { href: "/users/123", method: "DELETE" }
  }
}
```

### 2. PUT va PATCH farqi?

**Javob:**
- **PUT** - to'liq almashtirish (idempotent). Barcha field'lar yuborilishi kerak, yuborilmagan field'lar null/default bo'ladi.
- **PATCH** - qisman yangilash. Faqat o'zgargan field'lar yuboriladi.

```javascript
// Original resource
{ id: 1, name: "John", email: "john@example.com", phone: "123" }

// PUT - to'liq
PUT /users/1
Body: { name: "John Doe", email: "john@example.com" }
Result: { id: 1, name: "John Doe", email: "john@example.com", phone: null }

// PATCH - qisman
PATCH /users/1
Body: { name: "John Doe" }
Result: { id: 1, name: "John Doe", email: "john@example.com", phone: "123" }
```

### 3. Idempotency nima va nima uchun muhim?

**Javob:** Idempotent operation - bir xil request bir necha marta yuborilsa ham bir xil natija beradi. GET, PUT, DELETE idempotent, POST esa yo'q.

```javascript
// Idempotent - xavfsiz retry
PUT /users/123 { name: "John" }
// 3 marta yuborilsa ham faqat 1 ta John bo'ladi

// Non-idempotent - xavfli retry
POST /orders { product: "phone" }
// 3 marta yuborilsa 3 ta order yaratiladi

// Idempotency key bilan POST'ni xavfsiz qilish
POST /orders
Headers: Idempotency-Key: unique-key-123
// Bir xil key bilan 3 marta yuborilsa ham 1 ta order
```

### 4. 401 va 403 farqi?

**Javob:**
- **401 Unauthorized** - authentication yo'q yoki noto'g'ri. "Sen kimsan? O'zingni tanit."
- **403 Forbidden** - authenticated, lekin ruxsat yo'q. "Seni taniyman, lekin bu yerga kira olmaysan."

```javascript
// 401 - login qilmagan
GET /api/admin/users
Response: 401 Unauthorized

// 403 - login qilgan, lekin admin emas
GET /api/admin/users
Headers: Authorization: Bearer regular_user_token
Response: 403 Forbidden
```

### 5. Content Negotiation nima?

**Javob:** Client va server qaysi format ishlatilishini kelishadi (Accept, Content-Type headers).

```javascript
// Client JSON so'ramoqda
GET /api/users
Accept: application/json

// Client XML so'ramoqda
GET /api/users
Accept: application/xml

// Client versiyalangan API so'ramoqda
GET /api/users
Accept: application/vnd.myapi.v2+json

// Server mos format yo'q - 406 Not Acceptable
```

## Xulosa

REST API - zamonaviy web development'ning fundamental qismi. To'g'ri status code'lar, error handling, va HTTP method'larni bilish senior frontend developer uchun majburiy. HATEOAS kabi advanced tushunchalar API design'ni yanada yaxshilaydi.

**Keyingi qadam:** [02-graphql.md](./02-graphql.md) - REST'ning alternativasi va qachon GraphQL tanlash kerakligini o'rganamiz.
