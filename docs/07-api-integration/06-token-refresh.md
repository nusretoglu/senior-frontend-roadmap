# Token Refresh

## Kirish

Zamonaviy web ilovalar JWT (JSON Web Token) yoki shunga o'xshash token-based authentication ishlatadi. Access token'lar qisqa muddatli (15 daqiqa - 1 soat), refresh token'lar esa uzoq muddatli (7-30 kun). Token refresh - foydalanuvchi tajribasini buzmasdan authentication'ni davom ettirish mexanizmi.

## Token Types va Lifecycle

### Access Token vs Refresh Token

```javascript
// Access Token
// - Qisqa muddatli (15 min - 1 hour)
// - Har bir API request'da yuboriladi
// - Steal qilinsa ham tez expire bo'ladi
// - Stateless (server'da saqlanmaydi)

// Refresh Token
// - Uzoq muddatli (7-30 days)
// - Faqat token refresh uchun ishlatiladi
// - HttpOnly cookie'da saqlanadi (XSS himoya)
// - Server'da revoke qilish mumkin

// JWT Token structure
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Decoded payload
{
  "sub": "1234567890",       // user id
  "name": "John Doe",
  "iat": 1516239022,         // issued at
  "exp": 1516242622,         // expires at (1 hour later)
  "roles": ["user", "admin"]
}
```

### Token Storage

```javascript
// ❌ Noto'g'ri - XSS ga zaif
localStorage.setItem('accessToken', token);

// ❌ Noto'g'ri - JavaScript accessible
document.cookie = `accessToken=${token}`;

// ✅ To'g'ri - Access token memory'da
let accessToken = null;

// ✅ To'g'ri - Refresh token HttpOnly cookie'da
// Server tomonidan set qilinadi:
// Set-Cookie: refreshToken=xyz; HttpOnly; Secure; SameSite=Strict; Path=/api/auth

// Token manager
class TokenManager {
  #accessToken = null;
  #refreshPromise = null;

  setAccessToken(token) {
    this.#accessToken = token;
  }

  getAccessToken() {
    return this.#accessToken;
  }

  clearTokens() {
    this.#accessToken = null;
    // Refresh token is cleared by server via cookie
  }

  isTokenExpired(token) {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // 30 second buffer
      return payload.exp * 1000 < Date.now() + 30000;
    } catch {
      return true;
    }
  }

  async getValidToken() {
    if (!this.isTokenExpired(this.#accessToken)) {
      return this.#accessToken;
    }

    // Refresh if expired
    return this.refreshToken();
  }
}
```

## Silent Token Refresh

### Basic Implementation

```javascript
class AuthService {
  constructor() {
    this.accessToken = null;
    this.refreshPromise = null;
  }

  async refreshToken() {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  async doRefresh() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Send HttpOnly cookie
      });

      if (!response.ok) {
        throw new AuthError('Refresh failed');
      }

      const { accessToken } = await response.json();
      this.accessToken = accessToken;

      return accessToken;
    } catch (error) {
      // Refresh failed - logout
      this.logout();
      throw error;
    }
  }

  logout() {
    this.accessToken = null;

    // Clear refresh token cookie
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    // Redirect to login
    window.location.href = '/login';
  }
}

const authService = new AuthService();
```

### Axios Interceptor ile Token Refresh

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  withCredentials: true, // Cookie'larni yuborish uchun
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - add access token
api.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 and non-retry requests
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Refresh token
      const response = await axios.post(
        '/api/auth/refresh',
        {},
        { withCredentials: true }
      );

      const { accessToken } = response.data;
      authService.setAccessToken(accessToken);

      // Process queued requests
      processQueue(null, accessToken);

      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      authService.logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
```

### Fetch API ile Token Refresh

```javascript
class AuthenticatedFetch {
  constructor(authService) {
    this.authService = authService;
    this.refreshPromise = null;
  }

  async fetch(url, options = {}) {
    // Get valid token (refresh if needed)
    const token = await this.getValidToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle 401
    if (response.status === 401) {
      // Force refresh
      const newToken = await this.forceRefresh();

      // Retry request
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }

    return response;
  }

  async getValidToken() {
    const token = this.authService.getAccessToken();

    if (token && !this.isExpired(token)) {
      return token;
    }

    return this.forceRefresh();
  }

  async forceRefresh() {
    // Singleton pattern
    if (!this.refreshPromise) {
      this.refreshPromise = this.authService.refreshToken()
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return this.refreshPromise;
  }

  isExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now() + 30000; // 30s buffer
    } catch {
      return true;
    }
  }
}

// Usage
const authenticatedFetch = new AuthenticatedFetch(authService);

const users = await authenticatedFetch.fetch('/api/users');
```

## Proactive Token Refresh

Token expire bo'lishidan oldin yangilash - 401 error'larni kamaytiradi.

```javascript
class ProactiveTokenManager {
  constructor() {
    this.accessToken = null;
    this.refreshTimer = null;
    this.refreshThreshold = 60000; // 1 minute before expiry
  }

  setToken(token) {
    this.accessToken = token;
    this.scheduleRefresh(token);
  }

  scheduleRefresh(token) {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      const refreshAt = expiresAt - this.refreshThreshold;
      const delay = refreshAt - Date.now();

      if (delay > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refreshToken();
        }, delay);

        console.log(`Token refresh scheduled in ${delay / 1000}s`);
      } else {
        // Already near expiry - refresh immediately
        this.refreshToken();
      }
    } catch (error) {
      console.error('Failed to schedule refresh:', error);
    }
  }

  async refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const { accessToken } = await response.json();
      this.setToken(accessToken);

      return accessToken;
    } catch (error) {
      // Handle refresh failure
      this.handleRefreshFailure();
      throw error;
    }
  }

  handleRefreshFailure() {
    this.accessToken = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Notify app
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }

  cleanup() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
  }
}
```

## Multi-Tab Synchronization

Bir tab'da logout/login bo'lganda boshqa tab'lar ham sync bo'lishi kerak.

```javascript
class MultiTabAuthSync {
  constructor(authService) {
    this.authService = authService;
    this.channel = new BroadcastChannel('auth');
    this.setupListeners();
  }

  setupListeners() {
    // Listen for auth events from other tabs
    this.channel.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'LOGIN':
          this.authService.setToken(payload.accessToken);
          break;

        case 'LOGOUT':
          this.authService.clearTokens();
          window.location.href = '/login';
          break;

        case 'TOKEN_REFRESH':
          this.authService.setToken(payload.accessToken);
          break;

        case 'REQUEST_TOKEN':
          // Another tab is requesting current token
          if (this.authService.getAccessToken()) {
            this.channel.postMessage({
              type: 'TOKEN_RESPONSE',
              payload: { accessToken: this.authService.getAccessToken() },
            });
          }
          break;
      }
    };

    // Request token on page load (in case refreshed)
    this.requestTokenFromOtherTabs();
  }

  requestTokenFromOtherTabs() {
    this.channel.postMessage({ type: 'REQUEST_TOKEN' });

    // Wait for response
    return new Promise((resolve) => {
      const handler = (event) => {
        if (event.data.type === 'TOKEN_RESPONSE') {
          this.authService.setToken(event.data.payload.accessToken);
          resolve(event.data.payload.accessToken);
          this.channel.removeEventListener('message', handler);
        }
      };

      this.channel.addEventListener('message', handler);

      // Timeout after 100ms
      setTimeout(() => {
        this.channel.removeEventListener('message', handler);
        resolve(null);
      }, 100);
    });
  }

  broadcastLogin(accessToken) {
    this.channel.postMessage({
      type: 'LOGIN',
      payload: { accessToken },
    });
  }

  broadcastLogout() {
    this.channel.postMessage({ type: 'LOGOUT' });
  }

  broadcastTokenRefresh(accessToken) {
    this.channel.postMessage({
      type: 'TOKEN_REFRESH',
      payload: { accessToken },
    });
  }

  cleanup() {
    this.channel.close();
  }
}

// Usage
const authSync = new MultiTabAuthSync(authService);

// On login
async function login(credentials) {
  const { accessToken } = await api.post('/auth/login', credentials);
  authService.setToken(accessToken);
  authSync.broadcastLogin(accessToken);
}

// On logout
function logout() {
  authService.clearTokens();
  authSync.broadcastLogout();
}
```

## Race Condition Handling

Bir vaqtda bir nechta request 401 olib, hammasi refresh qilmoqchi bo'lganda.

```javascript
class SafeTokenRefresher {
  constructor() {
    this.refreshPromise = null;
    this.accessToken = null;
    this.subscribers = [];
  }

  async getToken() {
    if (this.accessToken && !this.isExpired(this.accessToken)) {
      return this.accessToken;
    }

    return this.refreshToken();
  }

  async refreshToken() {
    // If already refreshing, wait for that promise
    if (this.refreshPromise) {
      return new Promise((resolve, reject) => {
        this.subscribers.push({ resolve, reject });
      });
    }

    // Start refresh
    this.refreshPromise = this.doRefresh();

    try {
      const token = await this.refreshPromise;
      this.accessToken = token;

      // Notify all waiting subscribers
      this.subscribers.forEach(sub => sub.resolve(token));
      this.subscribers = [];

      return token;
    } catch (error) {
      // Notify all waiting subscribers of failure
      this.subscribers.forEach(sub => sub.reject(error));
      this.subscribers = [];
      throw error;
    } finally {
      this.refreshPromise = null;
    }
  }

  async doRefresh() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new AuthError('Refresh failed');
    }

    const { accessToken } = await response.json();
    return accessToken;
  }

  isExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

// Concurrent requests example
const refresher = new SafeTokenRefresher();

// 10 concurrent requests - faqat 1 refresh call
const results = await Promise.all([
  refresher.getToken(),
  refresher.getToken(),
  refresher.getToken(),
  refresher.getToken(),
  refresher.getToken(),
  refresher.getToken(),
  refresher.getToken(),
  refresher.getToken(),
  refresher.getToken(),
  refresher.getToken(),
]);
// All 10 get the same token from single refresh call
```

## Error Handling

```javascript
class TokenRefreshError extends Error {
  constructor(message, type) {
    super(message);
    this.name = 'TokenRefreshError';
    this.type = type;
  }
}

const RefreshErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  SERVER_ERROR: 'SERVER_ERROR',
};

async function refreshTokenWithErrorHandling() {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      // Parse error from server
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }

      switch (response.status) {
        case 401:
          // Token revoked or invalid
          throw new TokenRefreshError(
            'Session expired',
            RefreshErrorType.TOKEN_REVOKED
          );

        case 403:
          // Account suspended or deleted
          throw new TokenRefreshError(
            'Access denied',
            RefreshErrorType.INVALID_TOKEN
          );

        case 500:
        case 502:
        case 503:
          // Server error - could retry
          throw new TokenRefreshError(
            'Server error',
            RefreshErrorType.SERVER_ERROR
          );

        default:
          throw new TokenRefreshError(
            errorData.message || 'Refresh failed',
            RefreshErrorType.INVALID_TOKEN
          );
      }
    }

    return response.json();
  } catch (error) {
    if (error instanceof TokenRefreshError) {
      throw error;
    }

    // Network error
    throw new TokenRefreshError(
      'Network error',
      RefreshErrorType.NETWORK_ERROR
    );
  }
}

// Usage with error handling
async function handleAuthenticatedRequest(requestFn) {
  try {
    return await requestFn();
  } catch (error) {
    if (error instanceof TokenRefreshError) {
      switch (error.type) {
        case RefreshErrorType.TOKEN_REVOKED:
          // Redirect to login
          clearAuth();
          window.location.href = '/login?reason=session_expired';
          break;

        case RefreshErrorType.NETWORK_ERROR:
          // Show offline message
          showNotification('Network error. Please check your connection.');
          break;

        case RefreshErrorType.SERVER_ERROR:
          // Retry after delay
          await delay(5000);
          return handleAuthenticatedRequest(requestFn);

        default:
          showNotification('Authentication error. Please login again.');
          clearAuth();
          window.location.href = '/login';
      }
    }
    throw error;
  }
}
```

## Real-World Case: Complete Auth Flow

```javascript
// Complete authentication system
class AuthenticationSystem {
  constructor(config) {
    this.config = config;
    this.accessToken = null;
    this.user = null;
    this.refreshTimer = null;
    this.refreshPromise = null;
    this.listeners = new Set();

    // Multi-tab sync
    this.channel = new BroadcastChannel('auth');
    this.setupMultiTabSync();

    // Check initial auth state
    this.initializeAuth();
  }

  async initializeAuth() {
    // Try to get token from other tabs
    const token = await this.requestTokenFromOtherTabs();

    if (token) {
      this.setAccessToken(token);
      return;
    }

    // Try silent refresh
    try {
      await this.refreshToken();
    } catch {
      // Not authenticated
      this.notifyListeners('unauthenticated');
    }
  }

  async login(email, password) {
    const response = await fetch(`${this.config.authUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AuthError(error.message || 'Login failed');
    }

    const { accessToken, user } = await response.json();

    this.setAccessToken(accessToken);
    this.user = user;

    this.channel.postMessage({
      type: 'LOGIN',
      payload: { accessToken },
    });

    this.notifyListeners('authenticated', user);

    return user;
  }

  async logout() {
    try {
      await fetch(`${this.config.authUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore errors - clear local state anyway
    }

    this.clearAuth();
    this.channel.postMessage({ type: 'LOGOUT' });
    this.notifyListeners('unauthenticated');
  }

  async refreshToken() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefreshToken();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  async doRefreshToken() {
    const response = await fetch(`${this.config.authUrl}/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      this.clearAuth();
      throw new AuthError('Session expired');
    }

    const { accessToken, user } = await response.json();

    this.setAccessToken(accessToken);
    this.user = user;

    this.channel.postMessage({
      type: 'TOKEN_REFRESH',
      payload: { accessToken },
    });

    return accessToken;
  }

  setAccessToken(token) {
    this.accessToken = token;
    this.scheduleRefresh(token);
  }

  scheduleRefresh(token) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const payload = this.parseToken(token);
    if (!payload) return;

    const expiresAt = payload.exp * 1000;
    const refreshAt = expiresAt - this.config.refreshThreshold;
    const delay = refreshAt - Date.now();

    if (delay > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken().catch(() => {
          this.notifyListeners('unauthenticated');
        });
      }, delay);
    }
  }

  clearAuth() {
    this.accessToken = null;
    this.user = null;

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  parseToken(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  setupMultiTabSync() {
    this.channel.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'LOGIN':
        case 'TOKEN_REFRESH':
          this.setAccessToken(payload.accessToken);
          break;

        case 'LOGOUT':
          this.clearAuth();
          this.notifyListeners('unauthenticated');
          break;

        case 'REQUEST_TOKEN':
          if (this.accessToken) {
            this.channel.postMessage({
              type: 'TOKEN_RESPONSE',
              payload: { accessToken: this.accessToken },
            });
          }
          break;
      }
    };
  }

  requestTokenFromOtherTabs() {
    return new Promise((resolve) => {
      this.channel.postMessage({ type: 'REQUEST_TOKEN' });

      const handler = (event) => {
        if (event.data.type === 'TOKEN_RESPONSE') {
          resolve(event.data.payload.accessToken);
          this.channel.removeEventListener('message', handler);
        }
      };

      this.channel.addEventListener('message', handler);
      setTimeout(() => {
        this.channel.removeEventListener('message', handler);
        resolve(null);
      }, 100);
    });
  }

  // Create authenticated fetch
  createAuthenticatedFetch() {
    return async (url, options = {}) => {
      // Get valid token
      let token = this.accessToken;

      if (!token || this.isTokenExpired(token)) {
        try {
          token = await this.refreshToken();
        } catch {
          throw new AuthError('Not authenticated');
        }
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle 401
      if (response.status === 401) {
        try {
          const newToken = await this.refreshToken();
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
        } catch {
          throw new AuthError('Session expired');
        }
      }

      return response;
    };
  }

  isTokenExpired(token) {
    const payload = this.parseToken(token);
    if (!payload) return true;
    return payload.exp * 1000 < Date.now() + 30000;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(listener => listener(event, data));
  }

  destroy() {
    this.clearAuth();
    this.channel.close();
    this.listeners.clear();
  }
}

// Usage
const auth = new AuthenticationSystem({
  authUrl: 'https://api.example.com/auth',
  refreshThreshold: 60000, // Refresh 1 minute before expiry
});

// Subscribe to auth events
auth.subscribe((event, data) => {
  switch (event) {
    case 'authenticated':
      console.log('User logged in:', data);
      router.push('/dashboard');
      break;

    case 'unauthenticated':
      console.log('User logged out');
      router.push('/login');
      break;
  }
});

// Create authenticated API client
const authFetch = auth.createAuthenticatedFetch();
const userData = await authFetch('/api/user');
```

## Interview Savollari

### 1. Access Token va Refresh Token nima uchun ajratilgan?

**Javob:** Security va UX balance uchun.

- **Access Token** - qisqa muddatli (15 min). Steal qilinsa ham tez expire bo'ladi. Har request'da yuboriladi - intercept xavfi yuqori.

- **Refresh Token** - uzoq muddatli (7-30 kun). HttpOnly cookie'da - JavaScript unga kira olmaydi (XSS himoya). Faqat refresh endpoint'ga yuboriladi. Server'da revoke qilish mumkin.

```javascript
// Agar faqat 1 ta uzoq muddatli token bo'lsa:
// - Steal qilinsa, hacker uzoq vaqt foydalanadi
// - Revoke qilish uchun blacklist kerak (stateless buziladi)

// 2 ta token bilan:
// - Access token steal = max 15 min
// - Refresh token HttpOnly = XSS bilan steal qilib bo'lmaydi
```

### 2. Token'ni qayerda saqlash kerak?

**Javob:**

```javascript
// ❌ localStorage - XSS ga zaif
localStorage.setItem('token', token);

// ❌ Regular cookie - XSS ga zaif
document.cookie = `token=${token}`;

// ✅ Memory (variable) - XSS yaxshiroq, lekin refresh'da yo'qoladi
let accessToken = null;

// ✅ HttpOnly cookie (server set) - JavaScript umuman kira olmaydi
// Set-Cookie: refreshToken=xyz; HttpOnly; Secure; SameSite=Strict

// Best practice:
// - Access token: memory
// - Refresh token: HttpOnly cookie
```

### 3. Race condition token refresh'da qanday handle qilinadi?

**Javob:** Singleton pattern - faqat bitta refresh promise.

```javascript
class TokenManager {
  refreshPromise = null;

  async refreshToken() {
    // Agar allaqachon refresh bo'layotgan bo'lsa
    if (this.refreshPromise) {
      return this.refreshPromise; // Mavjud promise'ni kut
    }

    // Yangi refresh boshlash
    this.refreshPromise = this.doRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }
}

// 10 concurrent 401 response = 1 refresh call
```

### 4. Multi-tab sync qanday ishlaydi?

**Javob:** BroadcastChannel API - tab'lar orasida message almashish.

```javascript
const channel = new BroadcastChannel('auth');

// Bir tab'da logout
function logout() {
  clearTokens();
  channel.postMessage({ type: 'LOGOUT' });
}

// Boshqa tab'lar eshitadi
channel.onmessage = (event) => {
  if (event.data.type === 'LOGOUT') {
    clearTokens();
    redirectToLogin();
  }
};
```

### 5. Proactive vs Reactive refresh farqi nima?

**Javob:**

**Reactive** - 401 olgandan keyin refresh:
```javascript
// Request -> 401 -> Refresh -> Retry
// Muammo: User 401 error ko'rishi mumkin
```

**Proactive** - expire bo'lishidan oldin refresh:
```javascript
// Token exp: 10:00
// Refresh at: 9:59 (1 min oldin)
// Benefits:
// - User hech qachon 401 ko'rmaydi
// - Smoother UX
```

## Xulosa

Token refresh - zamonaviy authentication'ning muhim qismi. Access token memory'da, refresh token HttpOnly cookie'da saqlash eng xavfsiz. Race condition'lar va multi-tab sync to'g'ri handle qilinishi kerak. Proactive refresh eng yaxshi UX beradi.

**Keyingi qadam:** [07-axios-vs-fetch.md](./07-axios-vs-fetch.md) - HTTP client tanlash va custom wrapper yaratish.
