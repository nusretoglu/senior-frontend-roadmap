# Monorepo - Mono-Repository Arxitekturasi

## Kirish

Monorepo (mono-repository) - bu bir nechta loyiha, paket yoki service'larni bitta Git repositoriyasida saqlash strategiyasidir. Google, Meta, Microsoft kabi gigantlar monorepo yondashuvini qo'llaydi. Yaxshi tashkil qilingan monorepo jamoa samaradorligini oshiradi, kod almashishni osonlashtiradi va atomic deployment imkonini beradi.

## Nazariy Asos

### Monorepo vs Polyrepo

```
┌─────────────────────────────────────────────────────────────────┐
│                   MONOREPO vs POLYREPO                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   POLYREPO (Multi-repo)              MONOREPO                   │
│   ─────────────────────              ────────                   │
│                                                                  │
│   ┌───────────┐                      ┌───────────────────────┐  │
│   │  repo-a   │                      │                       │  │
│   └───────────┘                      │   monorepo/           │  │
│   ┌───────────┐                      │   ├── apps/           │  │
│   │  repo-b   │        →             │   │   ├── web/        │  │
│   └───────────┘                      │   │   └── mobile/     │  │
│   ┌───────────┐                      │   │                   │  │
│   │  repo-c   │                      │   ├── packages/       │  │
│   └───────────┘                      │   │   ├── ui/         │  │
│   ┌───────────┐                      │   │   └── core/       │  │
│   │  repo-d   │                      │   │                   │  │
│   └───────────┘                      │   └── tools/          │  │
│                                      │                       │  │
│                                      └───────────────────────┘  │
│                                                                  │
│   Pros:                              Pros:                      │
│   • Independent versioning           • Atomic changes           │
│   • Clear ownership                  • Code sharing easy        │
│   • Simple CI/CD                     • Unified tooling          │
│   • Small repo size                  • Cross-project refactor   │
│                                      • Single source of truth   │
│   Cons:                                                         │
│   • Code duplication                 Cons:                      │
│   • Version sync pain                • Large repo size          │
│   • Cross-repo changes hard          • Complex CI/CD            │
│   • Inconsistent tooling             • Tooling required         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Monorepo Tools Comparison

| Tool | Speed | Learning Curve | Features | Best For |
|------|-------|----------------|----------|----------|
| **Turborepo** | Very Fast | Low | Caching, parallel | JS/TS projects |
| **Nx** | Fast | Medium | Full-featured, plugins | Enterprise |
| **pnpm Workspaces** | Fast | Low | Native npm | Simple setups |
| **Lerna** | Medium | Low | Publishing | npm packages |
| **Rush** | Fast | High | Enterprise features | Large orgs |
| **Bazel** | Very Fast | High | Language agnostic | Google-scale |

### Monorepo Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONOREPO ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                      APPS LAYER                          │   │
│   │   Deployable applications                                │   │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│   │   │   Web   │  │  Admin  │  │ Mobile  │  │   API   │    │   │
│   │   └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│   └───────────────────────────┬─────────────────────────────┘   │
│                               │                                  │
│                               ▼                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   PACKAGES LAYER                         │   │
│   │   Shared libraries                                       │   │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│   │   │   UI    │  │  Core   │  │   API   │  │  Utils  │    │   │
│   │   │ Library │  │ Logic   │  │ Client  │  │ Helpers │    │   │
│   │   └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│   └───────────────────────────┬─────────────────────────────┘   │
│                               │                                  │
│                               ▼                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    CONFIG LAYER                          │   │
│   │   Shared configurations                                  │   │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│   │   │ ESLint  │  │  TS     │  │ Prettier│  │ Tailwind│    │   │
│   │   │ Config  │  │ Config  │  │ Config  │  │ Config  │    │   │
│   │   └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Code Misollari

### 1. Turborepo Setup

```bash
# ========================================
# TURBOREPO YARATISH
# ========================================

# Yangi monorepo yaratish
npx create-turbo@latest my-monorepo

# Yoki mavjud loyihaga qo'shish
npm install turbo --save-dev
```

```
# ========================================
# FOLDER STRUCTURE
# ========================================

my-monorepo/
├── apps/                       # Deployable applications
│   ├── web/                    # Main web app
│   │   ├── src/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   ├── admin/                  # Admin panel
│   │   ├── src/
│   │   ├── package.json
│   │   └── nuxt.config.ts
│   │
│   ├── mobile/                 # Mobile app (React Native)
│   │   ├── src/
│   │   └── package.json
│   │
│   └── api/                    # Backend API
│       ├── src/
│       └── package.json
│
├── packages/                   # Shared packages
│   ├── ui/                     # Design system
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── styles/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── core/                   # Business logic
│   │   ├── src/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── api-client/             # API client SDK
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── utils/                  # Utility functions
│   │   ├── src/
│   │   └── package.json
│   │
│   └── types/                  # Shared TypeScript types
│       ├── src/
│       └── package.json
│
├── tools/                      # Build/dev tools
│   ├── eslint-config/          # Shared ESLint config
│   │   ├── index.js
│   │   └── package.json
│   │
│   ├── tsconfig/               # Shared TypeScript config
│   │   ├── base.json
│   │   ├── vue.json
│   │   ├── node.json
│   │   └── package.json
│   │
│   └── prettier-config/        # Shared Prettier config
│       ├── index.js
│       └── package.json
│
├── turbo.json                  # Turborepo config
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # pnpm workspaces
└── .gitignore
```

### 2. Root Configuration Files

```json
// package.json (root)
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "format": "prettier --write \"**/*.{ts,tsx,vue,md,json}\"",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "prettier": "^3.2.0",
    "turbo": "^2.0.0",
    "typescript": "^5.3.0"
  },
  "packageManager": "pnpm@8.14.0"
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tools/*"
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env*"],
  "globalEnv": ["NODE_ENV", "API_URL"],

  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", ".nuxt/**"],
      "cache": true
    },

    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },

    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": true
    },

    "lint": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },

    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },

    "clean": {
      "cache": false
    }
  }
}
```

### 3. Package Configuration

```json
// packages/ui/package.json
{
  "name": "@monorepo/ui",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./components/*": {
      "import": "./dist/components/*.mjs",
      "require": "./dist/components/*.js",
      "types": "./dist/components/*.d.ts"
    },
    "./styles/*": "./dist/styles/*"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@monorepo/eslint-config": "workspace:*",
    "@monorepo/tsconfig": "workspace:*",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0"
  }
}
```

```json
// packages/ui/tsconfig.json
{
  "extends": "@monorepo/tsconfig/vue.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

```typescript
// packages/ui/src/index.ts
// Public API - barrel export

// Components
export { default as Button } from './components/Button.vue'
export { default as Input } from './components/Input.vue'
export { default as Modal } from './components/Modal.vue'
export { default as Card } from './components/Card.vue'

// Composables
export { useModal } from './composables/useModal'
export { useToast } from './composables/useToast'

// Types
export type { ButtonProps, ButtonVariant } from './components/Button.vue'
export type { InputProps } from './components/Input.vue'

// Styles
export { default as styles } from './styles/index.css'
```

### 4. App Configuration

```json
// apps/web/package.json
{
  "name": "@monorepo/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "typecheck": "vue-tsc --noEmit",
    "test": "vitest"
  },
  "dependencies": {
    "@monorepo/ui": "workspace:*",
    "@monorepo/core": "workspace:*",
    "@monorepo/api-client": "workspace:*",
    "@monorepo/utils": "workspace:*",
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0"
  },
  "devDependencies": {
    "@monorepo/eslint-config": "workspace:*",
    "@monorepo/tsconfig": "workspace:*",
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "vue-tsc": "^1.8.0"
  }
}
```

```typescript
// apps/web/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // Optimize deps from monorepo packages
  optimizeDeps: {
    include: [
      '@monorepo/ui',
      '@monorepo/core',
      '@monorepo/utils',
    ],
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['@monorepo/ui'],
        },
      },
    },
  },
})
```

### 5. Shared Configuration Packages

```javascript
// tools/eslint-config/index.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
}
```

```json
// tools/tsconfig/base.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

```json
// tools/tsconfig/vue.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue"
  }
}
```

### 6. Shared Types Package

```typescript
// packages/types/src/user.ts
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'admin' | 'moderator' | 'user'

export interface CreateUserDTO {
  email: string
  name: string
  password: string
  role?: UserRole
}

export interface UpdateUserDTO {
  name?: string
  avatar?: string
}
```

```typescript
// packages/types/src/api.ts
export interface ApiResponse<T> {
  data: T
  meta: {
    timestamp: number
    requestId: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}
```

```typescript
// packages/types/src/index.ts
export * from './user'
export * from './api'
export * from './product'
export * from './order'
```

### 7. API Client Package

```typescript
// packages/api-client/src/client.ts
import type { ApiResponse, ApiError } from '@monorepo/types'

interface ClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

class ApiClient {
  private baseURL: string
  private timeout: number
  private headers: Record<string, string>

  constructor(config: ClientConfig) {
    this.baseURL = config.baseURL
    this.timeout = config.timeout ?? 10000
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
  }

  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`
  }

  clearAuthToken() {
    delete this.headers['Authorization']
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: this.headers,
        signal: controller.signal,
        ...options,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error: ApiError = await response.json()
        throw new ApiClientError(error.message, error.code, response.status)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof ApiClientError) throw error
      throw new ApiClientError('Network error', 'NETWORK_ERROR')
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>) {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : ''
    return this.request<T>('GET', `${endpoint}${queryString}`)
  }

  async post<T>(endpoint: string, body?: unknown) {
    return this.request<T>('POST', endpoint, {
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body?: unknown) {
    return this.request<T>('PUT', endpoint, {
      body: JSON.stringify(body),
    })
  }

  async patch<T>(endpoint: string, body?: unknown) {
    return this.request<T>('PATCH', endpoint, {
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string) {
    return this.request<T>('DELETE', endpoint)
  }
}

class ApiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

export { ApiClient, ApiClientError }
export type { ClientConfig }
```

```typescript
// packages/api-client/src/services/users.ts
import type { User, CreateUserDTO, UpdateUserDTO, PaginatedResponse } from '@monorepo/types'
import type { ApiClient } from '../client'

export function createUsersService(client: ApiClient) {
  return {
    async getAll(params?: { page?: number; pageSize?: number }) {
      const response = await client.get<PaginatedResponse<User>>('/users', params)
      return response.data
    },

    async getById(id: string) {
      const response = await client.get<User>(`/users/${id}`)
      return response.data
    },

    async create(data: CreateUserDTO) {
      const response = await client.post<User>('/users', data)
      return response.data
    },

    async update(id: string, data: UpdateUserDTO) {
      const response = await client.patch<User>(`/users/${id}`, data)
      return response.data
    },

    async delete(id: string) {
      await client.delete(`/users/${id}`)
    },
  }
}
```

### 8. CI/CD Configuration

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # Turborepo remote caching
      - name: Setup Turbo cache
        uses: actions/cache@v3
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build

  # Detect affected packages
  affected:
    runs-on: ubuntu-latest
    outputs:
      packages: ${{ steps.affected.outputs.packages }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get affected packages
        id: affected
        run: |
          AFFECTED=$(pnpm turbo build --filter='...[origin/main]' --dry-run=json | jq -r '.packages | join(",")')
          echo "packages=$AFFECTED" >> $GITHUB_OUTPUT

  # Deploy only affected apps
  deploy-web:
    needs: [build, affected]
    if: contains(needs.affected.outputs.packages, '@monorepo/web')
    runs-on: ubuntu-latest

    steps:
      - name: Deploy web app
        run: echo "Deploying web app..."
        # Add deployment steps

  deploy-admin:
    needs: [build, affected]
    if: contains(needs.affected.outputs.packages, '@monorepo/admin')
    runs-on: ubuntu-latest

    steps:
      - name: Deploy admin panel
        run: echo "Deploying admin panel..."
        # Add deployment steps
```

### 9. Nx Workspace Example

```json
// nx.json (alternative to Turborepo)
{
  "$schema": "https://raw.githubusercontent.com/nrwl/nx/master/packages/nx/schemas/nx-schema.json",
  "defaultBase": "main",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.ts",
      "!{projectRoot}/tsconfig.spec.json"
    ],
    "sharedGlobals": ["{workspaceRoot}/tsconfig.base.json"]
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    },
    "test": {
      "inputs": ["default", "^production"],
      "cache": true
    },
    "lint": {
      "inputs": ["default"],
      "cache": true
    }
  },
  "plugins": [
    {
      "plugin": "@nx/vite/plugin",
      "options": {
        "buildTargetName": "build",
        "testTargetName": "test"
      }
    }
  ],
  "generators": {
    "@nx/vue:component": {
      "style": "css"
    }
  }
}
```

### 10. Version Management with Changesets

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [
    ["@monorepo/ui", "@monorepo/core", "@monorepo/utils"]
  ],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@monorepo/web", "@monorepo/admin"]
}
```

```bash
# Changeset workflow
# 1. Add changeset for your changes
pnpm changeset

# 2. Version packages (CI usually does this)
pnpm changeset version

# 3. Publish to npm (CI usually does this)
pnpm changeset publish
```

## Real-World Case Study

### Case: Multi-product Startup Migration

**Vaziyat:** Startup 3 ta alohida repo'da 3 ta mahsulotni boshqarmoqda. Kod takrorlanishi, versiya sinxronlash muammolari, inconsistent tooling.

**Muammolar:**
1. Bitta UI komponentni o'zgartirish uchun 3 ta PR
2. Type definitions 3 joyda duplicate
3. Har repoda o'z ESLint, Prettier config
4. CI/CD 3 marta setup

**Yechim - Monorepo Migration:**

```
Migration Plan (12 hafta):
────────────────────────────────────────

Week 1-2: Preparation
├── Monorepo structure design
├── Tooling selection (Turborepo + pnpm)
├── CI/CD pipeline design
└── Team training

Week 3-4: Foundation
├── Create monorepo scaffold
├── Setup shared configs (ESLint, TS, Prettier)
├── Setup CI/CD pipelines
└── Create initial packages (types, utils)

Week 5-6: Shared Packages
├── Extract UI components → @monorepo/ui
├── Extract business logic → @monorepo/core
├── Extract API client → @monorepo/api-client
└── Test in isolation

Week 7-9: App Migration
├── Migrate Product A → apps/product-a
├── Migrate Product B → apps/product-b
├── Migrate Product C → apps/product-c
└── Update imports to use packages

Week 10-11: Testing & Polish
├── Integration testing
├── Performance testing
├── Documentation
└── Team feedback

Week 12: Go Live
├── Final migration
├── Archive old repos
├── Monitor & fix issues
└── Retrospective

Results:
├── PR count: -60%
├── Build time: -40% (with caching)
├── Code duplication: -70%
├── Onboarding: 1 week → 2 days
└── Cross-team collaboration: +50%
```

## Interview Savollari

### 1. Junior-Middle Level
**Savol:** Monorepo va polyrepo o'rtasidagi asosiy farqlar nimalar?

**Javob:**
- **Monorepo:** Barcha kodlar bitta repo'da. Atomic changes, oson code sharing, unified tooling. Lekin: katta repo hajmi, murakkab CI/CD.
- **Polyrepo:** Har loyiha alohida repo. Clear ownership, oddiy CI/CD, kichik repo. Lekin: code duplication, version sync muammolari.

### 2. Middle-Senior Level
**Savol:** Monorepo'da package'lar orasidagi dependency'larni qanday boshqarasiz?

**Javob:**
```json
// package.json da workspace protocol
{
  "dependencies": {
    "@monorepo/ui": "workspace:*",      // Doim latest
    "@monorepo/core": "workspace:^1.0.0" // Semver range
  }
}

// turbo.json da task dependencies
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]  // Avval dependencies build bo'ladi
    }
  }
}

// Best practices:
// 1. Types package eng past darajada
// 2. Circular dependency'lar TAQIQ
// 3. Dependency graph visualization (nx graph)
```

### 3. Senior Level
**Savol:** Monorepo'da CI/CD qanday optimize qilinadi?

**Javob:**
```yaml
# 1. AFFECTED DETECTION
# Faqat o'zgargan package'larni build/test qilish
turbo build --filter='...[origin/main]'

# 2. REMOTE CACHING
# Turborepo Remote Cache yoki custom
TURBO_TEAM=my-team
TURBO_TOKEN=xxx
turbo build --remote-only

# 3. PARALLEL EXECUTION
turbo build --concurrency=10

# 4. TASK PIPELINE
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "cache": true },
    "test": { "dependsOn": ["build"], "cache": true }
  }
}

# 5. SELECTIVE DEPLOYMENT
# Deploy faqat affected apps
if [affected apps includes 'web']; deploy_web; fi
```

### 4. Senior/Lead Level
**Savol:** Katta monorepo'da team ownership qanday aniqlanadi?

**Javob:**
```
1. CODEOWNERS FILE
   /apps/product-a/    @team-a
   /packages/ui/       @design-system-team
   /packages/core/     @platform-team

2. PACKAGE BOUNDARIES
   ├── Each package = one team
   ├── Clear public API (index.ts)
   └── Breaking changes = coordination

3. GOVERNANCE
   ├── RFC process for shared changes
   ├── Breaking change approval
   └── Deprecation policy

4. TOOLING
   ├── Nx project tags
   ├── ESLint boundaries plugin
   └── Import restrictions

5. COMMUNICATION
   ├── Shared package changelog
   ├── Breaking change announcements
   └── Office hours for platform team
```

### 5. Architect Level
**Savol:** Monorepo'dan micro-frontend'larga qanday o'tiladi?

**Javob:**
```
Monorepo → Micro-frontends:
─────────────────────────────

1. SAME REPO, MODULE FEDERATION
   ├── Keep monorepo structure
   ├── Add Module Federation to each app
   ├── Share packages at runtime
   └── Independent deployments

2. HYBRID APPROACH
   monorepo/
   ├── apps/
   │   ├── shell/           # Host app
   │   ├── mfe-products/    # Product MFE
   │   └── mfe-checkout/    # Checkout MFE
   │
   └── packages/
       ├── shared-ui/       # Runtime shared
       └── types/           # Build-time shared

3. TRANSITION STEPS
   ├── Start with monorepo (simpler)
   ├── Add Module Federation when needed
   ├── Gradually extract to separate repos
   └── Keep shared packages in monorepo

4. KEY DECISIONS
   ├── Runtime vs build-time sharing
   ├── Versioning strategy
   ├── Deployment orchestration
   └── Team autonomy vs consistency
```

## Senior vs Middle Farqi

| Aspekt | Middle | Senior |
|--------|--------|--------|
| **Setup** | Use existing config | Design monorepo architecture |
| **Packages** | Create basic packages | Design package boundaries |
| **CI/CD** | Configure pipelines | Optimize with caching, affected |
| **Versioning** | Use changesets | Design versioning strategy |
| **Team** | Work within structure | Define ownership, governance |
| **Scale** | Handle current size | Plan for growth |

### Middle Developer
- Monorepo'da ishlaydi
- Package'lar yaratadi
- turbo/nx commands ishlatadi
- Basic CI/CD setup

### Senior Developer
- Monorepo arxitekturasini dizayn qiladi
- Package boundaries belgilaydi
- Caching strategiyasini optimize qiladi
- Team ownership va governance o'rnatadi
- Migration strategiyasini rejalashtiradi
- Performance va scale muammolarini hal qiladi

---

> **Eslatma:** Monorepo - bu tool, silver bullet emas. Kichik jamoa uchun polyrepo yetarli bo'lishi mumkin. Monorepo'ga o'tish - bu investitsiya, foyda ko'rish uchun vaqt kerak.
