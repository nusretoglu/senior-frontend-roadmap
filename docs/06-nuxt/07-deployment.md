# Deployment

Nuxt.js turli deployment strategiyalarini qo'llab-quvvatlaydi - static hosting'dan serverless'gacha. Nitro server engine'i tufayli deyarli har qanday platformaga deploy qilish mumkin.

## Nazariya

### Deployment Turlari

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Types                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. STATIC HOSTING (SSG)                                    │
│     npm run generate → .output/public/                      │
│     Deploy to: Netlify, Vercel, GitHub Pages, Cloudflare    │
│     Server: NOT REQUIRED                                    │
│                                                              │
│  2. NODE.JS SERVER (SSR)                                    │
│     npm run build → .output/server/                         │
│     Deploy to: VPS, DigitalOcean, Railway, Render           │
│     Server: Node.js REQUIRED                                │
│                                                              │
│  3. SERVERLESS (SSR)                                        │
│     npm run build → platform-specific                       │
│     Deploy to: Vercel, Netlify, AWS Lambda, Cloudflare      │
│     Server: Platform provides                               │
│                                                              │
│  4. EDGE (SSR)                                              │
│     npm run build → edge runtime                            │
│     Deploy to: Cloudflare Workers, Vercel Edge, Deno Deploy │
│     Server: Edge network                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Build Commands

```bash
# Development
npm run dev

# Production build (SSR)
npm run build
# Output: .output/server/index.mjs

# Static generation (SSG)
npm run generate
# Output: .output/public/

# Preview production
npm run preview
```

### .output Structure

```
.output/
├── public/                    # Static assets
│   ├── _nuxt/                 # Client JS/CSS bundles
│   │   ├── entry.xxxxx.js
│   │   └── style.xxxxx.css
│   ├── index.html             # (SSG only)
│   └── favicon.ico
│
├── server/                    # Server build (SSR only)
│   ├── index.mjs              # Server entry
│   ├── chunks/                # Server chunks
│   └── package.json
│
└── nitro.json                 # Nitro config
```

## Platform-Specific Deployment

### Vercel

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Vercel auto-detected, explicit preset optional
  nitro: {
    preset: 'vercel'
  }
})
```

```json
// vercel.json (optional)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output",
  "framework": "nuxt"
}
```

```bash
# Deploy
npx vercel

# Or connect GitHub repo in Vercel dashboard
```

### Netlify

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'netlify'
  }
})
```

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200
```

### Cloudflare Pages

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare-pages'
  }
})
```

```bash
# Deploy
npx wrangler pages deploy .output/public
```

### AWS Lambda

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'aws-lambda'
  }
})
```

```yaml
# serverless.yml
service: nuxt-app

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1

functions:
  server:
    handler: .output/server/index.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
      - http:
          path: /
          method: ANY

plugins:
  - serverless-offline
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy build output
COPY --from=builder /app/.output ./.output

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Start server
CMD ["node", ".output/server/index.mjs"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  nuxt:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NUXT_PUBLIC_API_BASE=https://api.example.com
    restart: unless-stopped
```

```bash
# Build and run
docker build -t nuxt-app .
docker run -p 3000:3000 nuxt-app
```

### Node.js VPS (PM2)

```bash
# Server'da
git clone https://github.com/user/nuxt-app.git
cd nuxt-app

npm ci
npm run build

# PM2 bilan ishga tushirish
pm2 start .output/server/index.mjs --name nuxt-app

# PM2 config
pm2 ecosystem
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'nuxt-app',
    script: '.output/server/index.mjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Static Hosting (GitHub Pages, S3)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // SSG mode
  ssr: true,

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true
    }
  },

  // For GitHub Pages subdirectory
  app: {
    baseURL: '/repo-name/'
  }
})
```

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate static site
        run: npm run generate

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .output/public
```

## Environment Variables

### Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Private (server-only)
    apiSecret: process.env.API_SECRET,
    databaseUrl: process.env.DATABASE_URL,

    // Public (client + server)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      appName: 'My App'
    }
  }
})
```

```bash
# .env
API_SECRET=secret123
DATABASE_URL=postgres://localhost/db

# NUXT_PUBLIC_ prefix for public vars
NUXT_PUBLIC_API_BASE=https://api.example.com
```

### Platform-Specific Env

```bash
# Vercel
# Settings → Environment Variables

# Netlify
# Site settings → Environment variables

# Docker
docker run -e API_SECRET=xxx -e NUXT_PUBLIC_API_BASE=xxx nuxt-app
```

### Using Runtime Config

```vue
<script setup>
const config = useRuntimeConfig()

// Server-only (in server routes, plugins)
// config.apiSecret
// config.databaseUrl

// Everywhere
console.log(config.public.apiBase)
console.log(config.public.appName)
</script>
```

## Build Optimization

### Analyze Bundle

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  build: {
    analyze: true
  }
})
```

```bash
npm run build -- --analyze
# Opens bundle analyzer
```

### Code Splitting

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Automatic code splitting by default

  // Manual chunks
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router'],
            'utils': ['lodash-es', 'date-fns']
          }
        }
      }
    }
  }
})
```

### Compression

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    compressPublicAssets: true,

    // Brotli compression
    compress: true
  }
})
```

### Caching Headers

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // Static assets - long cache
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },

    // API - short cache
    '/api/**': {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600'
      }
    },

    // HTML - revalidate
    '/**': {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=3600, must-revalidate'
      }
    }
  }
})
```

## Real-World Cases

### Case 1: E-Commerce (Vercel + ISR)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel'
  },

  routeRules: {
    // Static marketing pages
    '/': { prerender: true },
    '/about': { prerender: true },

    // ISR for products (revalidate every hour)
    '/products/**': { isr: 3600 },

    // SSR for cart/checkout
    '/cart': { ssr: true },
    '/checkout/**': { ssr: true },

    // CSR for user dashboard
    '/account/**': { ssr: false }
  },

  runtimeConfig: {
    stripeSecret: process.env.STRIPE_SECRET_KEY,
    public: {
      stripePublic: process.env.STRIPE_PUBLIC_KEY,
      apiBase: process.env.API_URL
    }
  }
})
```

```json
// vercel.json
{
  "functions": {
    ".output/server/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/_nuxt/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Case 2: Blog (Netlify + SSG)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/content'],

  nitro: {
    preset: 'netlify',
    prerender: {
      routes: ['/sitemap.xml', '/rss.xml'],
      crawlLinks: true
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/blog/**': { prerender: true },
    '/about': { prerender: true }
  },

  content: {
    highlight: {
      theme: 'github-dark'
    }
  }
})
```

```toml
# netlify.toml
[build]
  command = "npm run generate"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "18"

# Redirects for pretty URLs
[[redirects]]
  from = "/blog/*"
  to = "/blog/:splat.html"
  status = 200

# Headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"

[[headers]]
  for = "/_nuxt/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Case 3: SaaS Dashboard (Docker + K8s)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'node-server'
  },

  routeRules: {
    // Marketing (SSG)
    '/': { prerender: true },
    '/pricing': { prerender: true },
    '/features': { prerender: true },

    // App (CSR)
    '/app/**': { ssr: false },

    // API proxy
    '/api/**': {
      proxy: process.env.API_URL + '/**'
    }
  },

  runtimeConfig: {
    public: {
      apiBase: '/api',
      wsUrl: process.env.WS_URL
    }
  }
})
```

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npm run build

# Runner
FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output

USER nuxtjs
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nuxt-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nuxt-app
  template:
    metadata:
      labels:
        app: nuxt-app
    spec:
      containers:
        - name: nuxt-app
          image: registry.example.com/nuxt-app:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: NUXT_PUBLIC_API_BASE
              valueFrom:
                configMapKeyRef:
                  name: nuxt-config
                  key: api_base
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: nuxt-app
spec:
  selector:
    app: nuxt-app
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nuxt-app
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - example.com
      secretName: nuxt-tls
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nuxt-app
                port:
                  number: 80
```

### Case 4: Multi-Region (Cloudflare)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare-pages',

    // Edge-compatible settings
    cloudflare: {
      pages: {
        routes: {
          exclude: ['/api/*']
        }
      }
    }
  },

  routeRules: {
    // Static pages
    '/': { prerender: true },

    // Edge SSR
    '/products/**': {
      isr: 3600,
      headers: {
        'CDN-Cache-Control': 'public, max-age=3600'
      }
    }
  }
})
```

```toml
# wrangler.toml
name = "nuxt-app"
compatibility_date = "2024-01-01"

[site]
bucket = ".output/public"

[[kv_namespaces]]
binding = "CACHE"
id = "xxxxx"
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Test
        run: npm run test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NUXT_PUBLIC_API_BASE: ${{ secrets.API_BASE }}

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: nuxt-build
          path: .output

  deploy-preview:
    needs: build
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: nuxt-build
          path: .output

      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: nuxt-build
          path: .output

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Health Checks and Monitoring

```typescript
// server/api/health.get.ts
export default defineEventHandler(() => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  }
})

// server/api/ready.get.ts
export default defineEventHandler(async (event) => {
  try {
    // Check database connection
    // await db.query('SELECT 1')

    // Check external services
    // await fetch('https://api.example.com/health')

    return { status: 'ready' }
  } catch (error) {
    throw createError({
      statusCode: 503,
      message: 'Service unavailable'
    })
  }
})
```

```typescript
// plugins/error-tracking.client.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  if (config.public.sentryDsn) {
    // Initialize Sentry
    Sentry.init({
      dsn: config.public.sentryDsn,
      environment: process.env.NODE_ENV
    })
  }
})
```

## Interview Savollari

### Savol 1: npm run build va npm run generate farqi?

**Javob:**

**npm run build (SSR):**
- Server + client bundle yaratadi
- `.output/server/` va `.output/public/`
- Node.js server kerak
- Dynamic rendering har request'da

**npm run generate (SSG):**
- Faqat static HTML yaratadi
- `.output/public/`
- Server kerak emas (CDN serve)
- Build vaqtida barcha sahifalar render qilinadi

```bash
# SSR - server kerak
npm run build
node .output/server/index.mjs

# SSG - static files
npm run generate
# Deploy .output/public/ to CDN
```

### Savol 2: Qaysi hosting platformani tanlash kerak?

**Javob:**

| Platform | Turi | Mos keladi |
|----------|------|------------|
| Vercel | Serverless/Edge | Next.js/Nuxt, ISR kerak, auto-scaling |
| Netlify | Serverless | SSG, Forms, Identity, Edge Functions |
| Cloudflare | Edge | Global latency muhim, Workers |
| AWS | IaaS | Full control, enterprise, complex infra |
| DigitalOcean | VPS | Budget, simple Node.js server |
| Railway | PaaS | Quick deploy, databases, simple |

**Tanlov:**
- SSG + simple forms → Netlify
- SSR + ISR + auto-scale → Vercel
- Global edge + low latency → Cloudflare
- Full control + enterprise → AWS/GCP
- Budget + custom → VPS + Docker

### Savol 3: Nitro presets nima?

**Javob:**

Nitro preset - platforma-specific server bundle configuration:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    // Auto-detect yoki explicit
    preset: 'vercel' // | 'netlify' | 'cloudflare-pages' | 'node-server' | ...
  }
})
```

**Presets:**
- `node-server` - Standard Node.js server
- `vercel` - Vercel serverless
- `netlify` - Netlify functions
- `cloudflare-pages` - Cloudflare Workers
- `cloudflare-module` - Cloudflare module format
- `aws-lambda` - AWS Lambda
- `azure` - Azure Functions
- `deno` - Deno Deploy
- `bun` - Bun runtime

### Savol 4: Environment variables qanday ishlatiladi?

**Javob:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // SERVER ONLY - client'da ko'rinmaydi
    apiSecret: process.env.API_SECRET,
    dbUrl: process.env.DATABASE_URL,

    // PUBLIC - client va server
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE
    }
  }
})
```

```bash
# .env (local development)
API_SECRET=secret123
DATABASE_URL=postgres://localhost/db
NUXT_PUBLIC_API_BASE=http://localhost:4000

# Production - platform settings'da
```

```vue
<script setup>
const config = useRuntimeConfig()

// Server-only (server/ papkasida)
// config.apiSecret

// Everywhere
config.public.apiBase
</script>
```

### Savol 5: Zero-downtime deployment qanday?

**Javob:**

**1. Blue-Green Deployment:**
```yaml
# Two identical environments
# Switch traffic after verification
```

**2. Rolling Update (K8s):**
```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

**3. Serverless (auto):**
```
Vercel/Netlify - har deploy atomic
Old version serve qiladi yangi tayyor bo'lguncha
```

**4. PM2 Cluster:**
```bash
pm2 reload ecosystem.config.js
# Zero-downtime restart
```

## Best Practices

### 1. Security Headers

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'"
      }
    }
  }
})
```

### 2. Error Pages

```vue
<!-- error.vue -->
<script setup>
const props = defineProps<{
  error: {
    statusCode: number
    message: string
  }
}>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="error-page">
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.message }}</p>
    <button @click="handleError">Go Home</button>
  </div>
</template>
```

### 3. Performance Monitoring

```typescript
// plugins/performance.client.ts
export default defineNuxtPlugin(() => {
  if ('web-vitals' in window) {
    import('web-vitals').then(({ onCLS, onINP, onLCP }) => {
      onCLS(console.log)
      onINP(console.log)
      onLCP(console.log)
    })
  }
})
```

### 4. Graceful Shutdown

```typescript
// server/plugins/shutdown.ts
export default defineNitroPlugin((nitro) => {
  const shutdown = () => {
    console.log('Shutting down gracefully...')
    // Close database connections
    // Finish pending requests
    process.exit(0)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
})
```

### 5. Health Checks

```typescript
// server/api/health.get.ts
export default defineEventHandler(() => ({
  status: 'healthy',
  timestamp: Date.now()
}))

// server/api/ready.get.ts
export default defineEventHandler(async () => {
  // Check dependencies
  return { ready: true }
})
```

## Xulosa

Nuxt deployment flexible - static'dan edge'gacha:

1. **SSG (generate)** - Static hosting, CDN, eng tez
2. **SSR (build)** - Node.js server, dynamic content
3. **Serverless** - Auto-scaling, pay-per-use
4. **Edge** - Global, low latency

**Platform tanlash:**
- Simple static → Netlify/GitHub Pages
- SSR + ISR → Vercel
- Enterprise/Custom → AWS/Docker/K8s
- Global edge → Cloudflare

**Muhim:**
- Environment variables properly set
- Security headers configured
- Health checks implemented
- CI/CD automated
- Monitoring enabled
