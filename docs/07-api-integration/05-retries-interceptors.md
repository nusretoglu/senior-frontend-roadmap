# Retries & Interceptors

## Kirish

Network request'lar har doim muvaffaqiyatli bo'lmaydi - server vaqtincha unavailable, connection timeout, yoki transient error bo'lishi mumkin. Retry logic va interceptors - robust network layer yaratishning asosiy qismlari.

## Retry Strategies

### 1. Simple Retry

```javascript
// Basic retry with fixed delay
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        // Fixed delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError;
}
```

### 2. Exponential Backoff

Har retry'da kutish vaqti exponensial oshadi - server'ga ortiqcha yuk tushirmaslik uchun.

```javascript
class ExponentialBackoff {
  constructor(options = {}) {
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.maxRetries = options.maxRetries || 5;
    this.factor = options.factor || 2;
    this.jitter = options.jitter || true;
  }

  getDelay(attempt) {
    // Exponential delay: 1s, 2s, 4s, 8s, 16s
    let delay = this.baseDelay * Math.pow(this.factor, attempt - 1);

    // Cap at maxDelay
    delay = Math.min(delay, this.maxDelay);

    // Add jitter to prevent thundering herd
    if (this.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return delay;
  }

  async execute(fn) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (this.isNonRetryable(error)) {
          throw error;
        }

        if (attempt < this.maxRetries) {
          const delay = this.getDelay(attempt);
          console.log(`Retry ${attempt}/${this.maxRetries} after ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    throw new RetryExhaustedError(
      `Failed after ${this.maxRetries} attempts`,
      lastError
    );
  }

  isNonRetryable(error) {
    // Client errors (4xx) - don't retry
    if (error.status >= 400 && error.status < 500) {
      // Except 408 (timeout) and 429 (rate limit)
      return error.status !== 408 && error.status !== 429;
    }
    return false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const backoff = new ExponentialBackoff({
  baseDelay: 1000,
  maxDelay: 30000,
  maxRetries: 5,
});

const data = await backoff.execute(() =>
  fetch('/api/data').then(r => {
    if (!r.ok) throw new HttpError(r.status);
    return r.json();
  })
);
```

### 3. Circuit Breaker Pattern

Server'da muammo bo'lganda, request'larni to'xtatish - server'ga yuklama, client'ga tez javob.

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.monitorTimeout = options.monitorTimeout || 10000;

    this.state = 'CLOSED'; // CLOSED -> OPEN -> HALF_OPEN -> CLOSED
    this.failures = 0;
    this.lastFailure = null;
    this.nextAttempt = null;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new CircuitOpenError(
          `Circuit is open. Retry after ${this.nextAttempt - Date.now()}ms`
        );
      }
      // Try half-open
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    this.lastFailure = Date.now();

    if (this.state === 'HALF_OPEN') {
      // Failed during half-open - reopen
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    } else if (this.failures >= this.failureThreshold) {
      // Threshold reached - open circuit
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }

  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailure,
      nextAttempt: this.nextAttempt,
    };
  }
}

// Usage
const apiCircuit = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
});

async function fetchData() {
  return apiCircuit.execute(async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  });
}

// UI'da circuit status ko'rsatish
function ApiStatus() {
  const status = apiCircuit.getStatus();

  if (status.state === 'OPEN') {
    return (
      <Banner type="warning">
        Service is temporarily unavailable. Retrying in{' '}
        {Math.ceil((status.nextAttempt - Date.now()) / 1000)}s
      </Banner>
    );
  }

  return null;
}
```

### 4. Retry with Rate Limiting

```javascript
class RateLimitedRetry {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.retryAfterHeader = 'Retry-After';
  }

  async execute(fn) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (error.status === 429) {
          // Rate limited - respect Retry-After header
          const retryAfter = this.getRetryAfter(error);
          console.log(`Rate limited. Waiting ${retryAfter}ms`);
          await this.sleep(retryAfter);
          continue;
        }

        if (attempt < this.maxRetries && this.isRetryable(error)) {
          await this.sleep(this.getBackoffDelay(attempt));
        } else {
          throw error;
        }
      }
    }

    throw lastError;
  }

  getRetryAfter(error) {
    const header = error.headers?.get(this.retryAfterHeader);

    if (!header) return 5000; // Default 5 seconds

    // Header can be seconds or HTTP date
    const seconds = parseInt(header, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }

    const date = new Date(header);
    return Math.max(0, date.getTime() - Date.now());
  }

  isRetryable(error) {
    const retryableStatuses = [408, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }

  getBackoffDelay(attempt) {
    return Math.min(1000 * Math.pow(2, attempt - 1), 10000);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Axios Interceptors

### Request Interceptors

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

// 1. Auth token injection
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Request logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
    config.metadata = { startTime: Date.now() };
    return config;
  }
);

// 3. Request transformation
api.interceptors.request.use(
  (config) => {
    // Convert dates to ISO strings
    if (config.data) {
      config.data = JSON.parse(JSON.stringify(config.data, (key, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      }));
    }
    return config;
  }
);

// 4. Add correlation ID
api.interceptors.request.use(
  (config) => {
    config.headers['X-Correlation-ID'] = generateUUID();
    return config;
  }
);

// 5. Cache check (prevent duplicate requests)
const pendingRequests = new Map();

api.interceptors.request.use(
  (config) => {
    const key = `${config.method}:${config.url}:${JSON.stringify(config.params)}`;

    if (pendingRequests.has(key)) {
      // Return cached promise
      const controller = new AbortController();
      controller.abort();
      config.signal = controller.signal;

      return {
        ...config,
        __cached: pendingRequests.get(key),
      };
    }

    return config;
  }
);
```

### Response Interceptors

```javascript
// 1. Response logging
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata?.startTime;
    console.log(`[API] ${response.status} ${response.config.url} (${duration}ms)`);
    return response;
  }
);

// 2. Data extraction
api.interceptors.response.use(
  (response) => {
    // Return only data, not full response
    return response.data;
  }
);

// 3. Error transformation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const apiError = new APIError(
        error.response.data?.message || error.message,
        error.response.status,
        error.response.data
      );
      return Promise.reject(apiError);
    }

    if (error.request) {
      // No response received
      return Promise.reject(new NetworkError('Network error'));
    }

    return Promise.reject(error);
  }
);

// 4. Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Unauthorized - redirect to login
    if (error.response?.status === 401) {
      store.dispatch(logout());
      router.push('/login');
    }

    // Server error - show notification
    if (error.response?.status >= 500) {
      notification.error({
        message: 'Server Error',
        description: 'Something went wrong. Please try again later.',
      });
    }

    return Promise.reject(error);
  }
);

// 5. Token refresh
let isRefreshing = false;
let refreshSubscribers = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { accessToken } = await refreshToken();
        setAuthToken(accessToken);

        // Retry queued requests
        refreshSubscribers.forEach(cb => cb(accessToken));
        refreshSubscribers = [];

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

## Fetch Interceptors (Custom Implementation)

Fetch API'da built-in interceptors yo'q, lekin wrapper bilan qilish mumkin.

```javascript
class FetchClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }

  // Add interceptors
  addRequestInterceptor(fulfilled, rejected) {
    this.requestInterceptors.push({ fulfilled, rejected });
    return this.requestInterceptors.length - 1;
  }

  addResponseInterceptor(fulfilled, rejected) {
    this.responseInterceptors.push({ fulfilled, rejected });
    return this.responseInterceptors.length - 1;
  }

  removeInterceptor(type, index) {
    this[`${type}Interceptors`][index] = null;
  }

  // Execute request
  async request(url, options = {}) {
    let config = {
      url: `${this.baseURL}${url}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    // Run request interceptors
    for (const interceptor of this.requestInterceptors) {
      if (!interceptor) continue;
      try {
        config = await interceptor.fulfilled(config);
      } catch (error) {
        if (interceptor.rejected) {
          config = await interceptor.rejected(error);
        } else {
          throw error;
        }
      }
    }

    // Make request
    let response;
    try {
      response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: config.signal,
      });

      // Attach config to response
      response.config = config;

      // Run response interceptors
      for (const interceptor of this.responseInterceptors) {
        if (!interceptor) continue;
        try {
          response = await interceptor.fulfilled(response);
        } catch (error) {
          if (interceptor.rejected) {
            response = await interceptor.rejected(error);
          } else {
            throw error;
          }
        }
      }

      return response;
    } catch (error) {
      // Run error interceptors
      for (const interceptor of this.responseInterceptors) {
        if (!interceptor?.rejected) continue;
        try {
          return await interceptor.rejected(error);
        } catch (e) {
          error = e;
        }
      }
      throw error;
    }
  }

  // Convenience methods
  get(url, options) {
    return this.request(url, { ...options, method: 'GET' });
  }

  post(url, data, options) {
    return this.request(url, { ...options, method: 'POST', body: data });
  }

  put(url, data, options) {
    return this.request(url, { ...options, method: 'PUT', body: data });
  }

  patch(url, data, options) {
    return this.request(url, { ...options, method: 'PATCH', body: data });
  }

  delete(url, options) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// Usage
const api = new FetchClient('https://api.example.com');

// Add auth interceptor
api.addRequestInterceptor((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor
api.addResponseInterceptor(
  async (response) => {
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.response = response;
      throw error;
    }
    return response.json();
  },
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

// Make requests
const users = await api.get('/users');
const newUser = await api.post('/users', { name: 'John' });
```

## Advanced Patterns

### 1. Request Deduplication

```javascript
class DedupedFetch {
  constructor() {
    this.pending = new Map();
  }

  async fetch(url, options = {}) {
    // Only dedupe GET requests
    if (options.method && options.method !== 'GET') {
      return fetch(url, options);
    }

    const key = `${url}:${JSON.stringify(options)}`;

    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    const promise = fetch(url, options)
      .then(response => {
        this.pending.delete(key);
        return response;
      })
      .catch(error => {
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, promise);
    return promise;
  }
}

// Usage
const client = new DedupedFetch();

// 3 concurrent calls = 1 actual request
const [res1, res2, res3] = await Promise.all([
  client.fetch('/api/users'),
  client.fetch('/api/users'),
  client.fetch('/api/users'),
]);
```

### 2. Request Cancellation

```javascript
class CancellableRequests {
  constructor() {
    this.controllers = new Map();
  }

  async fetch(key, url, options = {}) {
    // Cancel previous request with same key
    this.cancel(key);

    const controller = new AbortController();
    this.controllers.set(key, controller);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      this.controllers.delete(key);
    }
  }

  cancel(key) {
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort();
      this.controllers.delete(key);
    }
  }

  cancelAll() {
    for (const [key, controller] of this.controllers) {
      controller.abort();
    }
    this.controllers.clear();
  }
}

// Usage - search input
const requests = new CancellableRequests();

async function handleSearch(query) {
  try {
    const response = await requests.fetch('search', `/api/search?q=${query}`);
    const data = await response.json();
    displayResults(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      // Request was cancelled - ignore
      return;
    }
    throw error;
  }
}

// Har keystroke'da chaqirilsa, faqat oxirgi request bajariladi
input.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});
```

### 3. Request Queue

```javascript
class RequestQueue {
  constructor(options = {}) {
    this.concurrency = options.concurrency || 3;
    this.queue = [];
    this.running = 0;
    this.paused = false;
  }

  add(requestFn, priority = 0) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        priority,
        resolve,
        reject,
      });

      // Sort by priority (higher first)
      this.queue.sort((a, b) => b.priority - a.priority);

      this.process();
    });
  }

  async process() {
    if (this.paused || this.running >= this.concurrency) {
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.running++;

    try {
      const result = await item.requestFn();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    // Process all pending
    while (this.running < this.concurrency && this.queue.length > 0) {
      this.process();
    }
  }

  clear() {
    const pending = this.queue.splice(0);
    pending.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
  }

  get size() {
    return this.queue.length;
  }
}

// Usage
const queue = new RequestQueue({ concurrency: 3 });

// High priority requests
const userData = await queue.add(
  () => fetch('/api/user').then(r => r.json()),
  10 // priority
);

// Low priority requests (analytics)
queue.add(
  () => fetch('/api/analytics', { method: 'POST' }),
  1
);

// Background tasks (can wait)
queue.add(
  () => fetch('/api/sync'),
  0
);
```

## Error Handling Patterns

```javascript
// Comprehensive error handling
class RobustHttpClient {
  constructor(options = {}) {
    this.baseURL = options.baseURL || '';
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
  }

  async request(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    let lastError;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}${url}`, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle non-2xx responses
        if (!response.ok) {
          const error = await this.createErrorFromResponse(response);

          // Don't retry client errors (except rate limit)
          if (response.status >= 400 && response.status < 500) {
            if (response.status !== 429) {
              throw error;
            }
          }

          throw error;
        }

        return response;
      } catch (error) {
        lastError = error;

        // Don't retry on abort
        if (error.name === 'AbortError') {
          throw new TimeoutError(`Request timed out after ${this.timeout}ms`);
        }

        // Retry with backoff
        if (attempt < this.retries) {
          const delay = this.getRetryDelay(attempt, error);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  async createErrorFromResponse(response) {
    let body;
    try {
      body = await response.json();
    } catch {
      body = { message: response.statusText };
    }

    const error = new APIError(
      body.message || `HTTP ${response.status}`,
      response.status
    );
    error.body = body;
    error.response = response;

    return error;
  }

  getRetryDelay(attempt, error) {
    // Respect Retry-After header
    if (error.response?.headers?.get('Retry-After')) {
      const retryAfter = parseInt(error.response.headers.get('Retry-After'), 10);
      if (!isNaN(retryAfter)) {
        return retryAfter * 1000;
      }
    }

    // Exponential backoff with jitter
    const baseDelay = 1000;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    return delay * (0.5 + Math.random() * 0.5);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Custom error classes
class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}
```

## Real-World Case: API Client with Full Features

```javascript
// Production-ready API client
class ProductionAPIClient {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000;

    this.retryConfig = {
      maxRetries: config.maxRetries || 3,
      baseDelay: 1000,
      maxDelay: 30000,
    };

    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000,
    });

    this.requestQueue = new RequestQueue({
      concurrency: 6,
    });

    this.pendingRequests = new Map();
    this.tokenManager = config.tokenManager;
    this.onError = config.onError;
  }

  async request(endpoint, options = {}) {
    // Circuit breaker check
    return this.circuitBreaker.execute(async () => {
      // Deduplication for GET
      if (!options.method || options.method === 'GET') {
        const key = `${endpoint}:${JSON.stringify(options.params)}`;
        if (this.pendingRequests.has(key)) {
          return this.pendingRequests.get(key);
        }

        const promise = this.executeRequest(endpoint, options);
        this.pendingRequests.set(key, promise);

        try {
          return await promise;
        } finally {
          this.pendingRequests.delete(key);
        }
      }

      return this.executeRequest(endpoint, options);
    });
  }

  async executeRequest(endpoint, options) {
    return this.requestQueue.add(async () => {
      const url = new URL(endpoint, this.baseURL);

      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, value);
          }
        });
      }

      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add auth token
      const token = await this.tokenManager?.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Retry logic
      let lastError;
      for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          options.timeout || this.timeout
        );

        try {
          const response = await fetch(url.toString(), {
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Handle 401 - token refresh
          if (response.status === 401 && this.tokenManager) {
            try {
              await this.tokenManager.refreshToken();
              // Retry with new token
              continue;
            } catch {
              // Refresh failed
              this.onError?.(new APIError('Session expired', 401));
              throw new APIError('Session expired', 401);
            }
          }

          if (!response.ok) {
            const error = await this.createError(response);

            // Retry on server errors
            if (response.status >= 500 && attempt < this.retryConfig.maxRetries) {
              lastError = error;
              await this.wait(attempt);
              continue;
            }

            throw error;
          }

          // Parse response
          const contentType = response.headers.get('Content-Type');
          if (contentType?.includes('application/json')) {
            return response.json();
          }
          return response.text();

        } catch (error) {
          clearTimeout(timeoutId);
          lastError = error;

          if (error.name === 'AbortError') {
            throw new TimeoutError('Request timed out');
          }

          // Network error - retry
          if (error instanceof TypeError && attempt < this.retryConfig.maxRetries) {
            await this.wait(attempt);
            continue;
          }

          throw error;
        }
      }

      throw lastError;
    }, options.priority || 5);
  }

  async createError(response) {
    let body;
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    const error = new APIError(
      body.message || body.error || `HTTP ${response.status}`,
      response.status
    );
    error.body = body;
    error.code = body.code;

    return error;
  }

  wait(attempt) {
    const { baseDelay, maxDelay } = this.retryConfig;
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    const jitteredDelay = delay * (0.5 + Math.random() * 0.5);
    return new Promise(resolve => setTimeout(resolve, jitteredDelay));
  }

  // Convenience methods
  get(endpoint, params, options) {
    return this.request(endpoint, { ...options, params, method: 'GET' });
  }

  post(endpoint, body, options) {
    return this.request(endpoint, { ...options, body, method: 'POST' });
  }

  put(endpoint, body, options) {
    return this.request(endpoint, { ...options, body, method: 'PUT' });
  }

  patch(endpoint, body, options) {
    return this.request(endpoint, { ...options, body, method: 'PATCH' });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Usage
const api = new ProductionAPIClient({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  maxRetries: 3,
  tokenManager: authService,
  onError: (error) => {
    if (error.status === 401) {
      router.push('/login');
    }
  },
});

const users = await api.get('/users', { page: 1, limit: 20 });
const newUser = await api.post('/users', { name: 'John', email: 'john@example.com' });
```

## Interview Savollari

### 1. Exponential backoff nima va nima uchun ishlatiladi?

**Javob:** Har retry'da kutish vaqtini exponensial (2x) oshirish strategiyasi. Server'ga ortiqcha yuk tushirmaslik va "thundering herd" muammosini oldini olish uchun.

```javascript
// Retry delays: 1s, 2s, 4s, 8s, 16s...
const delay = baseDelay * Math.pow(2, attemptNumber - 1);

// Jitter qo'shish - barcha client'lar bir vaqtda retry qilmasligi uchun
const jitteredDelay = delay * (0.5 + Math.random() * 0.5);
```

### 2. Circuit breaker pattern qanday ishlaydi?

**Javob:** Elektr circuit breaker'ga o'xshash - muammo bo'lganda "ochiladi" va request'larni to'xtatadi.

```
CLOSED (normal) → X failures → OPEN (block all)
     ↑                              ↓
     └── success ← HALF_OPEN ← timeout (try one)
```

```javascript
// States:
// CLOSED - normal, requests go through
// OPEN - all requests fail immediately
// HALF_OPEN - one test request allowed

// Benefits:
// 1. Fast failure (no waiting for timeout)
// 2. Server gets time to recover
// 3. Client resources saved
```

### 3. Interceptor pattern qanday foyda beradi?

**Javob:**

1. **DRY** - auth header, logging bir joyda
2. **Separation of concerns** - business logic ajratilgan
3. **Global handling** - error handling, token refresh
4. **Testability** - interceptor'larni alohida test qilish

```javascript
// Without interceptors - har joyda
const response = await fetch('/api/users', {
  headers: {
    Authorization: `Bearer ${token}`,
    'X-Request-ID': uuid(),
  },
});
logRequest(response);
if (response.status === 401) refreshToken();

// With interceptors - bir joyda
const response = await api.get('/users');
// Auth, logging, error handling avtomatik
```

### 4. Request deduplication qachon kerak?

**Javob:** Bir xil request bir vaqtda bir necha marta yuborilganda - masalan, komponent re-render'da yoki button double-click'da.

```javascript
// Problem: 3 component mount = 3 identical requests
useEffect(() => {
  fetch('/api/user'); // x3
}, []);

// Solution: dedupe
const pending = new Map();
function dedupedFetch(url) {
  if (pending.has(url)) return pending.get(url);
  const promise = fetch(url);
  pending.set(url, promise);
  promise.finally(() => pending.delete(url));
  return promise;
}
```

### 5. Timeout va cancellation farqi nima?

**Javob:**
- **Timeout** - belgilangan vaqtdan keyin avtomatik cancel
- **Cancellation** - user yoki code tomonidan manual cancel

```javascript
// Timeout - automatic
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

// Cancellation - manual (e.g., user navigates away)
useEffect(() => {
  const controller = new AbortController();
  fetch('/api/data', { signal: controller.signal });

  return () => controller.abort(); // cleanup on unmount
}, []);
```

## Xulosa

Retry va interceptors - production-ready API client'ning asosiy qismlari. Exponential backoff va circuit breaker server'ni himoya qiladi, interceptors esa kodni toza va maintainable qiladi. Har bir pattern o'z use case'iga ega.

**Keyingi qadam:** [06-token-refresh.md](./06-token-refresh.md) - JWT token'larni xavfsiz boshqarish va silent refresh.
