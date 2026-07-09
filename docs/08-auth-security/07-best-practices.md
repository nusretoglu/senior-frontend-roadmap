# Security Best Practices

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchi sifatida biz yozayotgan ilovalarda yuzlab ulanish nuqtalari, formalar, API chaqiriqlar va ma'lumot saqlash joylari bo'ladi. Xavfsizlik bo'yicha eng yaxshi amaliyotlarni (Best Practices) bilmaslik va tizimni faqat bitta himoya vositasiga (masalan, faqat auth tokenga) ishonib topshirish — uyni faqatgina eshik qulfi bilan himoya qilishga o'xshaydi. Ko'p qatlamli xavfsizlik (Defense in depth) usullarini bilish va ularni har kuni qo'llash loyihamizni har qanday professional kiberhujumdan saqlab qoladi.

> [!NOTE]
> **Real-hayot analogiyasi: "Bankni Himoya Qilish (Defense in Depth)"**  
> Tasavvur qiling, siz bank binosini himoya qilishingiz kerak.  
> - **Faqat bitta himoya (Yomon):** Faqatgina bankning old eshigiga kalit o'rnatgansiz (masalan, oddiy login-parol). Agar o'g'ri kalitni o'g'irlasa yoki eshikni buzsa, to'g'ridan-to'g'ri pul seyfiga kirib oladi.  
> - **Ko'p qatlamli himoya (Yaxshi - Defense in depth):** Bank oldida qorovul bor (Layer 1 - WAF/Network). Eshikda kalit bor (Layer 2 - Auth). Ichkarida kameralar bor (Layer 3 - Audit/Monitoring). Pul seyfining o'zida ham alohida seyf kodi va barmoq izi tekshiruvi bor (Layer 4 - Data Encryption/Authorization). Agar o'g'ri birinchi va ikkinchi qatlamdan o'tsa ham, baribir seyfni ocha olmaydi.

---

## Defense in Depth

### Multi-Layer Security

```
### Defense in Depth (Ko'p Qatlamli Himoya)

```mermaid
graph TD
    subgraph Ko'p Qatlamli Himoya Tizimi
        L1[Layer 1: Network Security <br/> CDN/WAF, DDoS Protection, Rate Limiting]
        L2[Layer 2: Transport Security <br/> HTTPS/TLS 1.3, HSTS Headers]
        L3[Layer 3: Application Security <br/> Input validation, CSP, Auth, XSS/CSRF Prevention]
        L4[Layer 4: Data Security <br/> Encryption at rest/in transit, Key management]
        
        L1 --> L2
        L2 --> L3
        L3 --> L4
    end
    
    style L1 fill:#e3f2fd,stroke:#1565c0
    style L2 fill:#fff3e0,stroke:#e65100
    style L3 fill:#e8f5e9,stroke:#2e7d32
    style L4 fill:#f3e5f5,stroke:#7b1fa2
```
```

### Bir qatlam buzilsa

```
Scenario: XSS vulnerability topildi

Agar faqat XSS himoya bo'lsa:
  → Cookie'lar o'g'iriladi
  → Session hijacking
  → Account takeover

Defense in Depth bilan:
  Layer 1: XSS payload WAF da bloklanishi mumkin
  Layer 2: HttpOnly cookie - JS o'qiy olmaydi
  Layer 3: CSP - inline script bloklanadi
  Layer 4: Short session lifetime - damage limited

Natija: Hujum qiyinlashadi, impact kamayadi
```

---

## Authentication Best Practices

### Password Handling

```javascript
// ❌ XATO: Plain text password
const user = await db.users.create({
  email: req.body.email,
  password: req.body.password  // Never store plain text!
});

// ❌ XATO: Weak hashing
const hash = crypto.createHash('md5').update(password).digest('hex');
const hash = crypto.createHash('sha256').update(password).digest('hex');

// ✅ TO'G'RI: bcrypt yoki argon2
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Registration
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
await db.users.create({ email, password: hashedPassword });

// Login
const isValid = await bcrypt.compare(submittedPassword, storedHash);

// Yoki Argon2 (recommended)
const argon2 = require('argon2');

// Hash
const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64MB
  timeCost: 3,
  parallelism: 4
});

// Verify
const isValid = await argon2.verify(hash, password);
```

### Password Policy

```javascript
const validatePassword = (password) => {
  const errors = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }

  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  // Complexity (optional but recommended)
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }

  // Common password check
  const commonPasswords = ['password123', '12345678', 'qwerty123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }

  // Pwned passwords API (production)
  // await checkPwnedPasswords(password);

  return { valid: errors.length === 0, errors };
};
```

### Multi-Factor Authentication (MFA)

```javascript
// TOTP implementation (Google Authenticator compatible)
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Setup MFA
const setupMFA = async (userId) => {
  const secret = speakeasy.generateSecret({
    name: `MyApp:${userId}`,
    issuer: 'MyApp'
  });

  // Store secret (encrypted)
  await db.users.update(userId, {
    mfaSecret: encrypt(secret.base32),
    mfaEnabled: false  // Enable after verification
  });

  // Generate QR code
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,  // Backup code
    qrCode: qrCodeUrl
  };
};

// Verify MFA
const verifyMFA = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1  // Allow 30 second clock drift
  });
};

// Login with MFA
const login = async (email, password, mfaToken) => {
  const user = await authenticate(email, password);

  if (user.mfaEnabled) {
    const isValidMFA = verifyMFA(
      decrypt(user.mfaSecret),
      mfaToken
    );

    if (!isValidMFA) {
      throw new Error('Invalid MFA token');
    }
  }

  return generateSession(user);
};
```

### Session Management

```javascript
// Secure session configuration
const session = require('express-session');
const RedisStore = require('connect-redis').default;

app.use(session({
  store: new RedisStore({ client: redisClient }),
  name: '__Host-sessionId',  // Cookie prefix for security
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,  // Reset expiration on activity
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 30 * 60 * 1000,  // 30 minutes
    path: '/'
  }
}));

// Session regeneration on privilege change
app.post('/login', async (req, res) => {
  const user = await authenticate(req.body);

  // Regenerate session ID (prevent fixation)
  req.session.regenerate((err) => {
    req.session.userId = user.id;
    req.session.createdAt = Date.now();
    req.session.ipAddress = req.ip;
    req.session.userAgent = req.headers['user-agent'];

    res.json({ success: true });
  });
});

// Session validation middleware
const validateSession = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Absolute timeout (8 hours max)
  const maxAge = 8 * 60 * 60 * 1000;
  if (Date.now() - req.session.createdAt > maxAge) {
    req.session.destroy();
    return res.status(401).json({ error: 'Session expired' });
  }

  // IP/User-Agent change detection (optional)
  if (req.session.ipAddress !== req.ip) {
    console.warn(`IP change detected for user ${req.session.userId}`);
    // Log but don't necessarily block
  }

  next();
};
```

---

## Authorization Best Practices

### Role-Based Access Control (RBAC)

```javascript
// Permission definitions
const PERMISSIONS = {
  'users.read': 'View user list',
  'users.create': 'Create new users',
  'users.update': 'Update user details',
  'users.delete': 'Delete users',
  'posts.read': 'View posts',
  'posts.create': 'Create posts',
  'posts.update': 'Update own posts',
  'posts.update.any': 'Update any post',
  'posts.delete': 'Delete own posts',
  'posts.delete.any': 'Delete any post',
  'admin.access': 'Access admin panel'
};

// Role definitions
const ROLES = {
  user: [
    'posts.read',
    'posts.create',
    'posts.update',
    'posts.delete'
  ],
  moderator: [
    'posts.read',
    'posts.create',
    'posts.update.any',
    'posts.delete.any',
    'users.read'
  ],
  admin: [
    ...Object.keys(PERMISSIONS)  // All permissions
  ]
};

// Permission check middleware
const requirePermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    const user = await db.users.findById(req.session.userId);
    const userPermissions = ROLES[user.role] || [];

    const hasPermission = requiredPermissions.every(
      p => userPermissions.includes(p)
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: requiredPermissions
      });
    }

    next();
  };
};

// Usage
app.delete('/api/users/:id',
  requirePermission('users.delete'),
  async (req, res) => {
    await db.users.delete(req.params.id);
    res.json({ success: true });
  }
);
```

### Attribute-Based Access Control (ABAC)

```javascript
// More flexible than RBAC
const canAccess = (user, resource, action) => {
  const rules = {
    'post.update': (user, post) => {
      // Author can update their own posts
      if (post.authorId === user.id) return true;

      // Moderators can update any post
      if (user.role === 'moderator') return true;

      // Admins can do anything
      if (user.role === 'admin') return true;

      return false;
    },

    'post.delete': (user, post) => {
      // Only author or admin can delete
      return post.authorId === user.id || user.role === 'admin';
    },

    'document.view': (user, doc) => {
      // Check department access
      if (doc.department !== user.department) return false;

      // Check classification level
      if (doc.classification > user.clearanceLevel) return false;

      return true;
    }
  };

  const key = `${resource.type}.${action}`;
  const rule = rules[key];

  if (!rule) return false;

  return rule(user, resource);
};

// Middleware
const authorize = (action) => {
  return async (req, res, next) => {
    const resource = req.resource;  // Set by previous middleware
    const user = req.user;

    if (!canAccess(user, resource, action)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};
```

### IDOR Prevention

```javascript
// ❌ ZAIF: Direct object reference
app.get('/api/invoices/:id', async (req, res) => {
  const invoice = await db.invoices.findById(req.params.id);
  res.json(invoice);  // Any user can access any invoice!
});

// ✅ XAVFSIZ: Authorization check
app.get('/api/invoices/:id', async (req, res) => {
  const invoice = await db.invoices.findById(req.params.id);

  if (!invoice) {
    return res.status(404).json({ error: 'Not found' });
  }

  // Check ownership
  if (invoice.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(invoice);
});

// ✅ YAXSHIROQ: Query-level filtering
app.get('/api/invoices/:id', async (req, res) => {
  const invoice = await db.invoices.findOne({
    id: req.params.id,
    userId: req.user.id  // Always filter by user
  });

  if (!invoice) {
    // Don't reveal if exists - return 404 for both
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(invoice);
});
```

---

## Data Protection

### Input Validation

```javascript
const Joi = require('joi');

// Schema definition
const schemas = {
  user: {
    create: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(12).max(128).required(),
      name: Joi.string().min(2).max(100).required(),
      age: Joi.number().integer().min(18).max(150).optional()
    }),

    update: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      age: Joi.number().integer().min(18).max(150).optional()
    }).min(1)  // At least one field required
  },

  post: {
    create: Joi.object({
      title: Joi.string().min(1).max(200).required(),
      content: Joi.string().min(1).max(50000).required(),
      tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
    })
  }
};

// Validation middleware
const validate = (schemaPath) => {
  return (req, res, next) => {
    const [resource, action] = schemaPath.split('.');
    const schema = schemas[resource]?.[action];

    if (!schema) {
      return res.status(500).json({ error: 'Schema not found' });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true  // Remove unknown fields
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }

    req.body = value;  // Use sanitized value
    next();
  };
};

// Usage
app.post('/api/users', validate('user.create'), createUser);
```

### Output Encoding

```javascript
// Context-aware encoding
const encode = {
  // HTML context
  html: (str) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return String(str).replace(/[&<>"'/]/g, c => map[c]);
  },

  // HTML attribute context
  attr: (str) => {
    return String(str).replace(/[^a-zA-Z0-9]/g, c =>
      `&#${c.charCodeAt(0)};`
    );
  },

  // JavaScript context
  js: (str) => {
    return JSON.stringify(String(str));
  },

  // URL context
  url: (str) => {
    return encodeURIComponent(String(str));
  },

  // CSS context
  css: (str) => {
    return String(str).replace(/[^a-zA-Z0-9]/g, c =>
      `\\${c.charCodeAt(0).toString(16)} `
    );
  }
};

// Template helper
const safeHtml = (strings, ...values) => {
  return strings.reduce((result, str, i) => {
    const value = values[i] !== undefined ? encode.html(values[i]) : '';
    return result + str + value;
  }, '');
};

// Usage
const html = safeHtml`<h1>Welcome, ${userName}!</h1>`;
```

### Sensitive Data Handling

```javascript
// Environment variables
// .env
DATABASE_URL=postgresql://user:pass@localhost/db
JWT_SECRET=your-256-bit-secret
ENCRYPTION_KEY=your-32-byte-key

// Never commit secrets
// .gitignore
.env
.env.local
*.pem
*.key

// Encryption at rest
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

const encrypt = (plaintext) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    encrypted,
    authTag: authTag.toString('hex')
  };
};

const decrypt = ({ iv, encrypted, authTag }) => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

// PII encryption
const saveSensitiveData = async (userId, ssn) => {
  const encrypted = encrypt(ssn);

  await db.sensitiveData.create({
    userId,
    encryptedSsn: JSON.stringify(encrypted),
    // Store only last 4 for display
    ssnLast4: ssn.slice(-4)
  });
};
```

---

## Secure Development Lifecycle

### Security in CI/CD

```yaml
# .github/workflows/security.yml
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Dependency audit
      - name: NPM Audit
        run: npm audit --audit-level=high

      # SAST (Static Analysis)
      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/secrets
            p/owasp-top-ten

      # Secret scanning
      - name: GitLeaks
        uses: gitleaks/gitleaks-action@v2

      # Container scanning
      - name: Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:${{ github.sha }}'
          severity: 'HIGH,CRITICAL'

      # DAST (Dynamic Analysis)
      - name: OWASP ZAP
        uses: zaproxy/action-baseline@v0.9.0
        with:
          target: 'https://staging.example.com'
```

### Code Review Checklist

```markdown
## Security Code Review Checklist

### Authentication
- [ ] Password properly hashed (bcrypt/argon2)
- [ ] No hardcoded credentials
- [ ] Session regenerated after login
- [ ] Session properly invalidated on logout
- [ ] Rate limiting on auth endpoints

### Authorization
- [ ] Every endpoint has authorization check
- [ ] IDOR vulnerabilities checked
- [ ] Role/permission checks at correct level
- [ ] No authorization bypass possible

### Input Validation
- [ ] All user input validated (server-side)
- [ ] Type, length, format checked
- [ ] SQL injection prevention (parameterized queries)
- [ ] File upload validation (type, size, name)

### Output Encoding
- [ ] HTML output encoded (XSS prevention)
- [ ] JSON response properly serialized
- [ ] URLs properly encoded
- [ ] No sensitive data in responses

### Security Headers
- [ ] CSP configured
- [ ] HSTS enabled
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options set

### Cryptography
- [ ] Strong algorithms used
- [ ] No weak random number generation
- [ ] Keys properly managed
- [ ] TLS 1.2+ required

### Logging
- [ ] Security events logged
- [ ] No sensitive data in logs
- [ ] Log injection prevented
```

---

## Security Headers

### Complete Headers Configuration

```javascript
const helmet = require('helmet');

app.use(helmet());

// Custom configuration
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'nonce-{{nonce}}'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.example.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: [],
    blockAllMixedContent: []
  }
}));

app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));

// Additional headers
app.use((req, res, next) => {
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // XSS filter (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  );

  next();
});
```

### Headers Explanation

```
┌────────────────────────────────────────────────────────────────────────┐
│                     Security Headers Reference                          │
├─────────────────────────────┬──────────────────────────────────────────┤
│ Header                      │ Purpose                                  │
├─────────────────────────────┼──────────────────────────────────────────┤
│ Content-Security-Policy     │ Prevent XSS, control resource loading   │
│ Strict-Transport-Security   │ Force HTTPS, prevent downgrade attacks  │
│ X-Content-Type-Options      │ Prevent MIME type sniffing              │
│ X-Frame-Options             │ Prevent clickjacking                    │
│ X-XSS-Protection            │ Enable browser XSS filter (legacy)      │
│ Referrer-Policy             │ Control referrer information            │
│ Permissions-Policy          │ Control browser features                │
│ Cache-Control               │ Prevent sensitive data caching          │
└─────────────────────────────┴──────────────────────────────────────────┘
```

---

## Audit va Monitoring

### Security Logging

```javascript
const winston = require('winston');

// Security-focused logger
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'security-audit' },
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.Console()
  ]
});

// Log security events
const logSecurityEvent = (event, metadata = {}) => {
  securityLogger.info({
    event,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

// Usage examples
// Login success
logSecurityEvent('LOGIN_SUCCESS', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent']
});

// Login failure
logSecurityEvent('LOGIN_FAILURE', {
  email: req.body.email,
  reason: 'invalid_password',
  ip: req.ip,
  attemptCount: failedAttempts
});

// Suspicious activity
logSecurityEvent('SUSPICIOUS_ACTIVITY', {
  userId: req.user?.id,
  action: 'multiple_failed_mfa',
  ip: req.ip,
  details: { attemptCount: 5, timeWindow: '5 minutes' }
});

// Authorization failure
logSecurityEvent('AUTHORIZATION_FAILURE', {
  userId: req.user.id,
  resource: req.path,
  action: req.method,
  reason: 'insufficient_permissions'
});
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;

// General rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' }
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts' }
});

// Per-user limit
const userLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'Rate limit exceeded' }
});

// Distributed rate limiting (Redis)
const distributedLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }),
  windowMs: 60 * 1000,
  max: 100
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/user/', userLimiter);
```

### Security Monitoring Dashboard

```javascript
// Metrics collection
const metrics = {
  loginAttempts: 0,
  failedLogins: 0,
  suspiciousActivities: 0,
  blockedRequests: 0,

  record(event) {
    switch(event) {
      case 'LOGIN_ATTEMPT': this.loginAttempts++; break;
      case 'LOGIN_FAILURE': this.failedLogins++; break;
      case 'SUSPICIOUS': this.suspiciousActivities++; break;
      case 'BLOCKED': this.blockedRequests++; break;
    }
  },

  getSnapshot() {
    return {
      loginAttempts: this.loginAttempts,
      failedLogins: this.failedLogins,
      failureRate: this.loginAttempts > 0
        ? (this.failedLogins / this.loginAttempts * 100).toFixed(2)
        : 0,
      suspiciousActivities: this.suspiciousActivities,
      blockedRequests: this.blockedRequests,
      timestamp: new Date().toISOString()
    };
  }
};

// Anomaly detection
const detectAnomalies = async () => {
  const failureRate = metrics.failedLogins / metrics.loginAttempts;

  if (failureRate > 0.5) {  // 50% failure rate
    await alertSecurityTeam({
      type: 'HIGH_LOGIN_FAILURE_RATE',
      rate: failureRate,
      message: 'Possible credential stuffing attack'
    });
  }

  if (metrics.blockedRequests > 1000) {
    await alertSecurityTeam({
      type: 'HIGH_BLOCKED_REQUESTS',
      count: metrics.blockedRequests,
      message: 'Possible DDoS attack'
    });
  }
};
```

---

## Interview Savollari

### 1. Defense in Depth nimani anglatadi?

**Javob:**

Defense in Depth - bu xavfsizlikni ko'p qatlamda ta'minlash strategiyasidir. Bir qatlam buzilsa ham boshqalari himoya qiladi.

**Qatlamlar:**
1. **Network:** WAF, firewall, DDoS protection
2. **Transport:** HTTPS, TLS, HSTS
3. **Application:** Input validation, authentication, authorization
4. **Data:** Encryption, access control, backups

**Misol:**
```
XSS hujum:
├── WAF → Payload pattern detect (Layer 1)
├── CSP → Inline script block (Layer 3)
├── HttpOnly → Cookie o'qib bo'lmaydi (Layer 3)
└── Short session → Damage limited (Layer 3)
```

Bitta himoya yetarli emas, har bir qatlam redundancy qo'shadi.

---

### 2. OWASP Top 10 dan qaysilarini bilasiz?

**Javob:**

**OWASP Top 10 2021:**

1. **Broken Access Control** (A01)
   - IDOR, privilege escalation
   - Himoya: Authorization checks, RBAC/ABAC

2. **Cryptographic Failures** (A02)
   - Weak encryption, exposed data
   - Himoya: Strong algorithms, TLS, encryption at rest

3. **Injection** (A03)
   - SQL, NoSQL, Command injection
   - Himoya: Parameterized queries, input validation

4. **Insecure Design** (A04)
   - Architecture flaws
   - Himoya: Threat modeling, secure design patterns

5. **Security Misconfiguration** (A05)
   - Default passwords, verbose errors
   - Himoya: Hardening, security headers

6. **Vulnerable Components** (A06)
   - Outdated dependencies
   - Himoya: Regular updates, dependency scanning

7. **Identification Failures** (A07)
   - Weak authentication
   - Himoya: MFA, secure session management

8. **Software/Data Integrity Failures** (A08)
   - CI/CD vulnerabilities
   - Himoya: Integrity checks, signed updates

9. **Security Logging Failures** (A09)
   - Missing audit logs
   - Himoya: Comprehensive logging, monitoring

10. **SSRF** (A10)
    - Server-side request forgery
    - Himoya: URL validation, network segmentation

---

### 3. Secure session management qanday implement qilinadi?

**Javob:**

**Key principles:**

1. **Session ID:**
```javascript
// Cryptographically random, 128+ bits
const sessionId = crypto.randomBytes(32).toString('hex');
```

2. **Secure storage:**
```javascript
res.cookie('sessionId', id, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

3. **Session regeneration:**
```javascript
// Login'dan keyin
req.session.regenerate(() => {
  req.session.userId = user.id;
});
```

4. **Timeouts:**
- Idle timeout: 30 daqiqa
- Absolute timeout: 8 soat

5. **Logout:**
```javascript
req.session.destroy();
res.clearCookie('sessionId');
// Server-side session invalidation
```

6. **Concurrent session control:**
- Limit active sessions per user
- Alert on new device login

---

### 4. Sensitive data qanday himoya qilinadi?

**Javob:**

**In Transit:**
- TLS 1.2+ majburiy
- HSTS header
- Certificate validation

**At Rest:**
- AES-256-GCM encryption
- Secure key management (HSM, Vault)
- Column-level encryption for PII

**In Use:**
- Memory protection
- Secure enclaves (TEE)
- Data masking in logs

**Example:**
```javascript
// Password - never store plain
const hash = await argon2.hash(password);

// PII - encrypt
const encrypted = encrypt(ssn);

// Logs - mask
console.log(`User SSN: ***-**-${ssn.slice(-4)}`);

// API response - filter
const safeUser = { id, name };  // No password, SSN
```

---

### 5. Security audit/penetration testing haqida nima bilasiz?

**Javob:**

**Audit types:**
1. **Code Review (SAST):**
   - Semgrep, SonarQube
   - Static analysis
   - CI/CD integration

2. **Dependency Scan:**
   - npm audit, Snyk
   - CVE database check
   - Automated updates

3. **Dynamic Testing (DAST):**
   - OWASP ZAP, Burp Suite
   - Running application test
   - Real attack simulation

4. **Penetration Testing:**
   - Professional testers
   - Black/white box
   - Real-world attack scenarios

**Frequency (Tekshiruvlar davriyligi):**
- **Avtomatlashtirilgan:** Har bir commit va PR da (CI/CD pipeline)
- **Qo'lda tahlil (Manual Audit):** Har chorakda (har 3 oyda)
- **Pentest (Hujum simulyatsiyasi):** Har yili yoki yirik o'zgarishlardan so'ng

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Ko'p qatlamli xavfsizlik (Defense in Depth) madaniyatini shakllantiring:** Hech qachon xavfsizlik uchun faqatgina bitta qatlam (masalan, faqat input validation) etarli deb o'ylamang. Network, Transport, Application va Data darajasida himoyani barpo qiling.
2. **Uchinchi tomon paketlarini (NPM) muntazam tekshiring:** `npm audit` yoki Snyk toollari orqali loyihangizdagi kutubxonalarning zaifliklarini avtomatik tekshirib boring va ularni o'z vaqtida yangilang.
3. **Mijozlar maxfiyligini birinchi o'ringa qo'ying:** Foydalanuvchilarning parollarini serverda aslo ochiq holda saqlamang (`bcrypt` yoki `argon2` yordamida hashlang). Kliyent tomonida (brauzerda) esa hech qanday maxfiy API kalitlarni qoldirmang.

---

## Xulosa

Security Best Practices bo'yicha yakuniy xulosa:

| Xavfsizlik Qatlami | Asosiy Vositalar | Maqsadi |
| --- | --- | --- |
| **Network (Tarmoq)** | CDN, Cloudflare WAF, Rate limiting | DDoS va avtomatlashgan botlar hujumidan himoya |
| **Transport (Uzatish)** | HTTPS, HSTS, Secure Ciphers | Ma'lumotlarni yo'lda o'g'irlash (MitM) dan himoyalash |
| **Application (Dastur)** | Input validation, CSP, JWT/Cookie, CORS | XSS, CSRF, Injection va ruxsatsiz kirishlarni to'sish |
| **Data (Ma'lumot)** | Hash (bcrypt), AES Encryption, Key vaults | Ma'lumotlar bazasi sizib chiqqanda ma'lumotlarni o'qib bo'lmasligini ta'minlash |
