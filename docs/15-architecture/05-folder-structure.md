# Folder Structure - Loyiha Tuzilmasi va Fayl Organizatsiyasi

## Kirish

Folder Structure - bu loyiha fayllarini qanday tashkil qilish bo'yicha strategik qaror. Yaxshi folder structure yangi developerlar uchun onboardingni osonlashtiradi, kod navigatsiyasini tezlashtiradi va jamoa samaradorligini oshiradi. Yomon struktura esa "qaerda nima bor" degan savolga doimiy javob izlashga olib keladi.

## Nazariy Asos

### Folder Structure Evolution

```
┌─────────────────────────────────────────────────────────────────┐
│                 FOLDER STRUCTURE EVOLUTION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   STAGE 1: By Type (Boshlang'ich)                               │
│   ─────────────────────────────────                              │
│   src/                                                           │
│   ├── components/     # 50+ files mixed                         │
│   ├── stores/         # all stores together                     │
│   ├── utils/          # growing mess                            │
│   └── views/          # flat list of pages                      │
│                                                                  │
│   Problem: "UserCard.vue qayerda?" - 100+ fayl ichida qidirish │
│                                                                  │
│                           ▼                                      │
│                                                                  │
│   STAGE 2: By Feature (O'rta)                                   │
│   ─────────────────────────────                                  │
│   src/                                                           │
│   ├── features/                                                  │
│   │   ├── auth/       # auth related everything                 │
│   │   ├── users/      # user management                         │
│   │   └── products/   # product catalog                         │
│   └── shared/         # cross-feature code                      │
│                                                                  │
│   Benefit: Cohesive modules, clear ownership                    │
│                                                                  │
│                           ▼                                      │
│                                                                  │
│   STAGE 3: Domain-Driven (Katta)                                │
│   ────────────────────────────────                               │
│   src/                                                           │
│   ├── domains/        # Business domains                        │
│   │   ├── catalog/                                              │
│   │   ├── checkout/                                             │
│   │   └── customer/                                             │
│   ├── shared/         # Shared kernel                           │
│   └── infrastructure/ # Technical concerns                      │
│                                                                  │
│   Benefit: Bounded contexts, team boundaries                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Structure Selection Matrix

| Loyiha Hajmi | Team Size | Recommended Structure |
|--------------|-----------|----------------------|
| Kichik (< 50 files) | 1-2 dev | By Type (flat) |
| O'rta (50-200 files) | 2-5 dev | Feature-based |
| Katta (200-500 files) | 5-15 dev | Feature + Layered |
| Enterprise (500+ files) | 15+ dev | Domain-Driven |

### Golden Rules

```
┌─────────────────────────────────────────────────────────────────┐
│                    FOLDER STRUCTURE RULES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. COLOCATION                                                  │
│      Keep related files together                                 │
│      ✓ UserCard.vue + UserCard.test.ts + UserCard.stories.ts   │
│      ✗ components/UserCard.vue + tests/UserCard.test.ts        │
│                                                                  │
│   2. ENCAPSULATION                                               │
│      Each module has clear boundaries                           │
│      ✓ features/auth/index.ts exports public API               │
│      ✗ Direct imports: features/auth/utils/validate.ts         │
│                                                                  │
│   3. DEPENDENCY DIRECTION                                        │
│      Dependencies flow inward (to core)                         │
│      ✓ features → shared → core                                 │
│      ✗ shared → features (cyclic dependency)                    │
│                                                                  │
│   4. EXPLICIT IS BETTER THAN IMPLICIT                           │
│      Naming should reveal intent                                │
│      ✓ /features/products/api/products.api.ts                  │
│      ✗ /features/products/index.ts (what's inside?)            │
│                                                                  │
│   5. SCALABILITY                                                 │
│      Structure should grow with project                         │
│      ✓ Nested when needed, flat when possible                  │
│      ✗ Deep nesting from start (over-engineering)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Code Misollari

### 1. Small Project - Type-based Structure

```
# ========================================
# KICHIK LOYIHA (< 50 fayl)
# Oddiy, flat struktura
# ========================================

my-app/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── styles/
│   │       ├── main.css
│   │       └── variables.css
│   │
│   ├── components/
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseModal.vue
│   │   ├── UserCard.vue
│   │   ├── ProductCard.vue
│   │   └── Navbar.vue
│   │
│   ├── composables/
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   └── useForm.js
│   │
│   ├── stores/
│   │   ├── auth.js
│   │   └── cart.js
│   │
│   ├── views/
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── Products.vue
│   │   └── ProductDetail.vue
│   │
│   ├── router/
│   │   └── index.js
│   │
│   ├── utils/
│   │   ├── format.js
│   │   └── validators.js
│   │
│   ├── App.vue
│   └── main.js
│
├── index.html
├── package.json
└── vite.config.js

# Afzalliklari:
# - Oddiy, tez tushuniladi
# - Kam abstraksiya
# - Yangi developerlar uchun oson

# Kamchiliklari:
# - 50+ komponent bo'lganda chalkash
# - Feature ownership aniq emas
# - Scaling qiyin
```

### 2. Medium Project - Feature-based Structure

```
# ========================================
# O'RTA LOYIHA (50-200 fayl)
# Feature-based modular struktura
# ========================================

my-app/
├── public/
│   └── ...
│
├── src/
│   │
│   ├── app/                    # Application shell
│   │   ├── App.vue
│   │   ├── router.js
│   │   └── plugins/
│   │       ├── pinia.js
│   │       └── i18n.js
│   │
│   ├── features/               # Feature modules
│   │   │
│   │   ├── auth/               # Auth feature
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.vue
│   │   │   │   ├── RegisterForm.vue
│   │   │   │   └── ForgotPasswordForm.vue
│   │   │   │
│   │   │   ├── composables/
│   │   │   │   └── useAuth.js
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   └── auth.store.js
│   │   │   │
│   │   │   ├── api/
│   │   │   │   └── auth.api.js
│   │   │   │
│   │   │   ├── views/
│   │   │   │   ├── LoginPage.vue
│   │   │   │   └── RegisterPage.vue
│   │   │   │
│   │   │   ├── routes.js       # Feature routes
│   │   │   └── index.js        # Public API
│   │   │
│   │   ├── products/           # Products feature
│   │   │   ├── components/
│   │   │   │   ├── ProductCard.vue
│   │   │   │   ├── ProductList.vue
│   │   │   │   ├── ProductFilters.vue
│   │   │   │   └── ProductDetail.vue
│   │   │   │
│   │   │   ├── composables/
│   │   │   │   ├── useProducts.js
│   │   │   │   └── useProductFilters.js
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   └── products.store.js
│   │   │   │
│   │   │   ├── api/
│   │   │   │   └── products.api.js
│   │   │   │
│   │   │   ├── types/
│   │   │   │   └── product.types.ts
│   │   │   │
│   │   │   ├── views/
│   │   │   │   ├── ProductsPage.vue
│   │   │   │   └── ProductDetailPage.vue
│   │   │   │
│   │   │   ├── routes.js
│   │   │   └── index.js
│   │   │
│   │   ├── cart/               # Cart feature
│   │   │   ├── components/
│   │   │   ├── composables/
│   │   │   ├── stores/
│   │   │   └── index.js
│   │   │
│   │   └── checkout/           # Checkout feature
│   │       ├── components/
│   │       ├── composables/
│   │       ├── stores/
│   │       └── index.js
│   │
│   ├── shared/                 # Cross-feature shared code
│   │   │
│   │   ├── components/         # Base/UI components
│   │   │   ├── base/
│   │   │   │   ├── BaseButton.vue
│   │   │   │   ├── BaseInput.vue
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── feedback/
│   │   │   │   ├── Toast.vue
│   │   │   │   ├── Modal.vue
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── layout/
│   │   │       ├── AppHeader.vue
│   │   │       ├── AppFooter.vue
│   │   │       └── AppSidebar.vue
│   │   │
│   │   ├── composables/        # Shared composables
│   │   │   ├── useApi.js
│   │   │   ├── useForm.js
│   │   │   ├── usePagination.js
│   │   │   └── index.js
│   │   │
│   │   ├── utils/              # Utility functions
│   │   │   ├── format.js
│   │   │   ├── validators.js
│   │   │   ├── storage.js
│   │   │   └── index.js
│   │   │
│   │   └── constants/          # App-wide constants
│   │       ├── routes.js
│   │       ├── api.js
│   │       └── index.js
│   │
│   ├── assets/                 # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── main.css
│   │       ├── variables.css
│   │       └── utilities.css
│   │
│   └── main.js
│
├── tests/                      # Test configuration
│   ├── setup.js
│   └── mocks/
│
└── package.json

# ========================================
# Feature Module Public API
# ========================================

// features/products/index.js
// Public API - faqat shu orqali import qilish

// Components
export { default as ProductCard } from './components/ProductCard.vue'
export { default as ProductList } from './components/ProductList.vue'

// Composables
export { useProducts } from './composables/useProducts'
export { useProductFilters } from './composables/useProductFilters'

// Store
export { useProductsStore } from './stores/products.store'

// Routes
export { default as productRoutes } from './routes'

// Types
export type { Product, ProductFilter } from './types/product.types'
```

### 3. Large Project - Layered Feature Structure

```
# ========================================
# KATTA LOYIHA (200-500 fayl)
# Feature-based + Layered Architecture
# ========================================

my-app/
├── src/
│   │
│   ├── app/                        # Application Layer
│   │   ├── App.vue
│   │   ├── main.ts
│   │   │
│   │   ├── providers/              # App-level providers
│   │   │   ├── AppProviders.vue
│   │   │   ├── AuthProvider.vue
│   │   │   └── ThemeProvider.vue
│   │   │
│   │   ├── router/
│   │   │   ├── index.ts
│   │   │   ├── guards.ts
│   │   │   └── routes.ts
│   │   │
│   │   └── plugins/
│   │       ├── pinia.ts
│   │       ├── i18n.ts
│   │       └── errorHandler.ts
│   │
│   ├── domains/                    # Domain Layer (Business Logic)
│   │   │
│   │   ├── catalog/                # Catalog bounded context
│   │   │   ├── products/
│   │   │   │   ├── models/
│   │   │   │   │   ├── Product.ts
│   │   │   │   │   └── ProductVariant.ts
│   │   │   │   │
│   │   │   │   ├── services/
│   │   │   │   │   ├── ProductService.ts
│   │   │   │   │   └── ProductSearchService.ts
│   │   │   │   │
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── categories/
│   │   │   │   ├── models/
│   │   │   │   ├── services/
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── ordering/               # Ordering bounded context
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── orders/
│   │   │   └── index.ts
│   │   │
│   │   └── identity/               # Identity bounded context
│   │       ├── authentication/
│   │       ├── authorization/
│   │       ├── profiles/
│   │       └── index.ts
│   │
│   ├── features/                   # Feature Layer (UI Features)
│   │   │
│   │   ├── product-catalog/        # Product catalog feature
│   │   │   ├── components/
│   │   │   │   ├── ProductCard/
│   │   │   │   │   ├── ProductCard.vue
│   │   │   │   │   ├── ProductCard.test.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── ProductGrid/
│   │   │   │   ├── ProductFilters/
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── composables/
│   │   │   │   ├── useProductCatalog.ts
│   │   │   │   └── useProductSearch.ts
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   └── productCatalog.store.ts
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── ProductListPage.vue
│   │   │   │   └── ProductDetailPage.vue
│   │   │   │
│   │   │   ├── routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── shopping-cart/          # Shopping cart feature
│   │   │   ├── components/
│   │   │   ├── composables/
│   │   │   ├── stores/
│   │   │   ├── pages/
│   │   │   └── index.ts
│   │   │
│   │   └── user-profile/           # User profile feature
│   │       ├── components/
│   │       ├── composables/
│   │       ├── stores/
│   │       ├── pages/
│   │       └── index.ts
│   │
│   ├── shared/                     # Shared Layer
│   │   │
│   │   ├── ui/                     # UI Kit / Design System
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── layouts/
│   │   │   │   ├── MainLayout.vue
│   │   │   │   ├── AuthLayout.vue
│   │   │   │   └── AdminLayout.vue
│   │   │   │
│   │   │   └── styles/
│   │   │       ├── tokens/
│   │   │       └── utilities/
│   │   │
│   │   ├── lib/                    # Shared libraries
│   │   │   ├── api/
│   │   │   │   ├── client.ts
│   │   │   │   ├── interceptors.ts
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── validation/
│   │   │   │   ├── rules.ts
│   │   │   │   └── schemas.ts
│   │   │   │
│   │   │   └── storage/
│   │   │       ├── localStorage.ts
│   │   │       └── sessionStorage.ts
│   │   │
│   │   ├── composables/            # Shared composables
│   │   │   ├── useApi.ts
│   │   │   ├── useForm.ts
│   │   │   ├── useInfiniteScroll.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/                  # Pure utility functions
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   ├── object.ts
│   │   │   └── index.ts
│   │   │
│   │   └── types/                  # Shared types
│   │       ├── api.types.ts
│   │       ├── common.types.ts
│   │       └── index.ts
│   │
│   └── infrastructure/             # Infrastructure Layer
│       │
│       ├── api/                    # API adapters
│       │   ├── rest/
│       │   │   └── RestApiClient.ts
│       │   │
│       │   └── graphql/
│       │       └── GraphQLClient.ts
│       │
│       ├── analytics/              # Analytics integration
│       │   ├── GoogleAnalytics.ts
│       │   └── Mixpanel.ts
│       │
│       ├── monitoring/             # Error tracking
│       │   └── Sentry.ts
│       │
│       └── auth/                   # Auth providers
│           ├── OAuth.ts
│           └── JWT.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── package.json
```

### 4. Nuxt.js Specific Structure

```
# ========================================
# NUXT 3 LOYIHA STRUKTURASI
# File-based routing + Layers
# ========================================

my-nuxt-app/
├── .nuxt/                      # Generated (gitignored)
├── .output/                    # Build output (gitignored)
│
├── app/                        # App configuration
│   ├── app.vue                 # Root component
│   ├── error.vue               # Error page
│   └── app.config.ts           # Runtime config
│
├── assets/                     # Processed by build
│   ├── css/
│   │   ├── main.css
│   │   └── variables.css
│   │
│   ├── images/
│   └── fonts/
│
├── components/                 # Auto-imported components
│   │
│   ├── base/                   # Base components
│   │   ├── Button.vue          # → <BaseButton>
│   │   ├── Input.vue           # → <BaseInput>
│   │   └── Modal.vue           # → <BaseModal>
│   │
│   ├── global/                 # Global components
│   │   ├── Header.vue          # → <GlobalHeader>
│   │   └── Footer.vue          # → <GlobalFooter>
│   │
│   └── feature/                # Feature-specific
│       ├── product/
│       │   ├── Card.vue        # → <FeatureProductCard>
│       │   └── List.vue        # → <FeatureProductList>
│       │
│       └── cart/
│           ├── Item.vue        # → <FeatureCartItem>
│           └── Summary.vue     # → <FeatureCartSummary>
│
├── composables/                # Auto-imported composables
│   ├── useAuth.ts
│   ├── useApi.ts
│   ├── useCart.ts
│   └── useProducts.ts
│
├── content/                    # @nuxt/content files
│   ├── blog/
│   │   ├── 1.first-post.md
│   │   └── 2.second-post.md
│   │
│   └── docs/
│       └── getting-started.md
│
├── layouts/                    # Page layouts
│   ├── default.vue
│   ├── auth.vue
│   └── admin.vue
│
├── middleware/                 # Route middleware
│   ├── auth.ts
│   └── admin.ts
│
├── pages/                      # File-based routes
│   │
│   ├── index.vue               # → /
│   ├── about.vue               # → /about
│   │
│   ├── products/
│   │   ├── index.vue           # → /products
│   │   └── [id].vue            # → /products/:id
│   │
│   ├── auth/
│   │   ├── login.vue           # → /auth/login
│   │   └── register.vue        # → /auth/register
│   │
│   └── admin/
│       ├── index.vue           # → /admin
│       └── [...slug].vue       # → /admin/*
│
├── plugins/                    # Nuxt plugins
│   ├── api.ts
│   └── analytics.client.ts     # Client-only
│
├── public/                     # Static files (as-is)
│   ├── favicon.ico
│   ├── robots.txt
│   └── images/
│
├── server/                     # Server-side code
│   │
│   ├── api/                    # API routes
│   │   ├── products/
│   │   │   ├── index.get.ts    # GET /api/products
│   │   │   ├── index.post.ts   # POST /api/products
│   │   │   └── [id].get.ts     # GET /api/products/:id
│   │   │
│   │   └── auth/
│   │       ├── login.post.ts
│   │       └── me.get.ts
│   │
│   ├── middleware/             # Server middleware
│   │   └── log.ts
│   │
│   ├── plugins/                # Nitro plugins
│   │   └── database.ts
│   │
│   └── utils/                  # Server utilities
│       └── db.ts
│
├── stores/                     # Pinia stores
│   ├── auth.ts
│   ├── cart.ts
│   └── products.ts
│
├── types/                      # TypeScript types
│   ├── api.d.ts
│   └── models.d.ts
│
├── utils/                      # Auto-imported utilities
│   ├── format.ts
│   └── validators.ts
│
├── nuxt.config.ts
├── package.json
└── tsconfig.json

# ========================================
# Nuxt Layer (Reusable Module)
# ========================================

layers/
└── admin/                      # Admin layer
    ├── nuxt.config.ts
    │
    ├── components/
    │   └── admin/
    │       ├── Sidebar.vue
    │       └── Dashboard.vue
    │
    ├── composables/
    │   └── useAdmin.ts
    │
    ├── layouts/
    │   └── admin.vue
    │
    ├── pages/
    │   └── admin/
    │       ├── index.vue
    │       └── users.vue
    │
    └── server/
        └── api/
            └── admin/
```

### 5. Component Folder Organization

```
# ========================================
# KOMPONENT FOLDER PATTERNS
# ========================================

# Pattern 1: Flat (kichik komponentlar)
components/
├── Button.vue
├── Button.test.ts
├── Input.vue
├── Input.test.ts
└── Modal.vue

# Pattern 2: Folder per Component (katta komponentlar)
components/
├── Button/
│   ├── Button.vue           # Main component
│   ├── Button.test.ts       # Tests
│   ├── Button.stories.ts    # Storybook
│   ├── Button.types.ts      # TypeScript types
│   └── index.ts             # Export
│
├── DataTable/
│   ├── DataTable.vue
│   ├── DataTable.test.ts
│   ├── DataTable.stories.ts
│   ├── DataTableHeader.vue  # Sub-component
│   ├── DataTableRow.vue     # Sub-component
│   ├── DataTableCell.vue    # Sub-component
│   ├── useDataTable.ts      # Component-specific composable
│   └── index.ts
│
└── Form/
    ├── Form.vue
    ├── FormField.vue
    ├── FormGroup.vue
    ├── FormActions.vue
    ├── useForm.ts
    └── index.ts

# Pattern 3: Grouped by Type (design system)
components/
├── base/                    # Atoms
│   ├── Button/
│   ├── Input/
│   ├── Badge/
│   └── index.ts
│
├── forms/                   # Form-related
│   ├── FormField/
│   ├── FormGroup/
│   ├── FormSelect/
│   └── index.ts
│
├── data-display/            # Data visualization
│   ├── Table/
│   ├── Card/
│   ├── List/
│   └── index.ts
│
├── feedback/                # User feedback
│   ├── Toast/
│   ├── Modal/
│   ├── Alert/
│   └── index.ts
│
├── navigation/              # Navigation
│   ├── Navbar/
│   ├── Sidebar/
│   ├── Breadcrumb/
│   └── index.ts
│
└── layout/                  # Layout
    ├── Container/
    ├── Grid/
    ├── Stack/
    └── index.ts
```

### 6. Index Files - Barrel Exports

```typescript
// ========================================
// BARREL EXPORT PATTERN
// ========================================

// components/base/index.ts
// Re-export all base components
export { default as Button } from './Button/Button.vue'
export { default as Input } from './Input/Input.vue'
export { default as Badge } from './Badge/Badge.vue'
export { default as Avatar } from './Avatar/Avatar.vue'

// Also export types
export type { ButtonProps, ButtonVariant } from './Button/Button.types'
export type { InputProps } from './Input/Input.types'

// ========================================
// FEATURE MODULE INDEX
// ========================================

// features/products/index.ts

// Components (selective export)
export { default as ProductCard } from './components/ProductCard.vue'
export { default as ProductList } from './components/ProductList.vue'
export { default as ProductFilters } from './components/ProductFilters.vue'

// Composables
export { useProducts } from './composables/useProducts'
export { useProductSearch } from './composables/useProductSearch'

// Store
export { useProductsStore } from './stores/products.store'

// Types
export type {
  Product,
  ProductCategory,
  ProductFilter,
} from './types'

// Routes (for app router)
export { default as productRoutes } from './routes'

// ========================================
// FOYDALANISH
// ========================================

// Toza import
import { ProductCard, useProducts } from '@/features/products'
import { Button, Input } from '@/shared/ui'

// Yomon - internal import
import ProductCard from '@/features/products/components/ProductCard.vue'
import { validateProduct } from '@/features/products/utils/validators'
```

### 7. Path Aliases Configuration

```typescript
// ========================================
// VITE PATH ALIASES
// ========================================

// vite.config.ts
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/shared/ui/components'),
      '@composables': resolve(__dirname, 'src/shared/composables'),
      '@features': resolve(__dirname, 'src/features'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@utils': resolve(__dirname, 'src/shared/utils'),
      '@types': resolve(__dirname, 'src/shared/types'),
      '@assets': resolve(__dirname, 'src/assets'),
    },
  },
})

// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/shared/ui/components/*"],
      "@composables/*": ["src/shared/composables/*"],
      "@features/*": ["src/features/*"],
      "@stores/*": ["src/stores/*"],
      "@utils/*": ["src/shared/utils/*"],
      "@types/*": ["src/shared/types/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}

// ========================================
// FOYDALANISH
// ========================================

// Clean imports with aliases
import { Button, Input } from '@components'
import { useAuth } from '@composables'
import { ProductCard } from '@features/products'
import { formatDate } from '@utils'
import type { User } from '@types'

// Instead of
import { Button } from '../../../shared/ui/components'
```

## Real-World Case Study

### Case: Startup to Scale-up Migration

**Vaziyat:** 2 yillik startup loyiha. Dastlab 3 developer, hozir 15 developer. Flat struktura scale qila olmay qoldi.

**Muammolar:**
1. 200+ komponent bir papkada - navigatsiya qiyin
2. Circular dependencies - build xatolari
3. Team ownership aniq emas
4. Onboarding 2 hafta davom etadi

**Yechim - Incremental Migration:**

```
Phase 1: Identify Domains (1 hafta)
────────────────────────────────────
├── Team workshop - domain mapping
├── Dependency analysis (madge)
├── Feature boundaries aniqlash
└── Output: Migration plan

Phase 2: Create Shared Layer (2 hafta)
────────────────────────────────────
├── shared/ui - base components
├── shared/composables - common logic
├── shared/utils - pure functions
└── Index files - barrel exports

Phase 3: Extract Features (4 hafta)
────────────────────────────────────
├── auth/ - authentication
├── products/ - catalog
├── orders/ - order management
├── users/ - user profiles
└── Each with: components/, stores/, api/

Phase 4: Enforce Boundaries (2 hafta)
────────────────────────────────────
├── ESLint import rules
├── Path aliases setup
├── Index.js public APIs
└── Documentation

Results:
├── Onboarding: 2 weeks → 3 days
├── Feature ownership: Clear
├── Build time: -40% (tree shaking)
├── Bug isolation: Improved
└── Team velocity: +30%
```

## Interview Savollari

### 1. Junior-Middle Level
**Savol:** Feature-based struktura nima uchun flat strukturadan yaxshiroq?

**Javob:**
- **Cohesion** - Bog'liq fayllar birgalikda joylashgan
- **Encapsulation** - Har bir feature o'z chegaralariga ega
- **Scalability** - Yangi feature qo'shish oson
- **Team ownership** - Har feature uchun mas'ul aniq
- **Navigation** - Kod topish oson

### 2. Middle-Senior Level
**Savol:** Folder strukturada circular dependency qanday oldini olasiz?

**Javob:**
```
1. DEPENDENCY DIRECTION RULE
   features → shared → core
   (Higher level depends on lower level)

2. LAYER BOUNDARIES
   ├── UI layer → Business layer → Data layer
   └── Never reverse direction

3. INDEX FILES AS PUBLIC API
   ├── Only export what's needed
   └── Internal files are private

4. TOOLING
   ├── eslint-plugin-import
   ├── madge (dependency visualization)
   └── dependency-cruiser

5. SHARED MODULE FOR COMMON CODE
   ├── Extract to shared/ when needed
   └── Avoid feature-to-feature imports
```

### 3. Senior Level
**Savol:** Domain-Driven Design strukturasiga qachon o'tish kerak?

**Javob:**
```
Qachon kerak:
├── 10+ developers
├── Multiple teams
├── Complex business domain
├── Independent deployments needed
├── Different bounded contexts

Structure:
src/
├── domains/           # Business domains
│   ├── catalog/       # Bounded context 1
│   ├── ordering/      # Bounded context 2
│   └── identity/      # Bounded context 3
│
├── features/          # UI features
├── shared/            # Shared kernel
└── infrastructure/    # Technical concerns

Key principles:
├── Ubiquitous language per domain
├── Clear context boundaries
├── Minimal cross-domain coupling
└── Domain services in domains/
```

### 4. Senior/Lead Level
**Savol:** Mono-repo'da folder strukturani qanday tashkil qilasiz?

**Javob:**
```
monorepo/
├── apps/                    # Deployable applications
│   ├── web/                 # Main web app
│   ├── admin/               # Admin panel
│   └── mobile/              # Mobile app
│
├── packages/                # Shared packages
│   ├── ui/                  # Design system
│   ├── core/                # Business logic
│   ├── api-client/          # API client
│   └── config/              # Shared configs
│
├── tools/                   # Build/dev tools
│   ├── eslint-config/
│   └── tsconfig/
│
└── package.json             # Workspace config

Key considerations:
├── Package boundaries = npm packages
├── Versioning strategy (independent/unified)
├── Build caching (Turborepo, Nx)
└── Dependency management
```

### 5. Architect Level
**Savol:** Micro-frontend arxitekturasida folder struktura qanday bo'ladi?

**Javob:**
```
micro-frontends/
├── shell/                   # Host application
│   ├── src/
│   │   ├── app/
│   │   ├── routing/         # MFE routing
│   │   └── shared/          # Shared components
│   └── package.json
│
├── mfe-catalog/             # Catalog MFE (Team A)
│   ├── src/
│   │   ├── features/
│   │   └── shared/
│   ├── webpack.config.js    # Module Federation
│   └── package.json
│
├── mfe-checkout/            # Checkout MFE (Team B)
│   └── ...
│
├── mfe-account/             # Account MFE (Team C)
│   └── ...
│
└── packages/                # Shared packages
    ├── design-system/
    ├── auth-sdk/
    └── analytics/

Communication:
├── Custom events (loosely coupled)
├── Shared state (minimal)
├── URL parameters
└── Backend for frontend
```

## Senior vs Middle Farqi

| Aspekt | Middle | Senior |
|--------|--------|--------|
| **Structure choice** | Copy existing pattern | Analyze requirements, choose appropriate |
| **Evolution** | Follows structure | Plans for growth |
| **Boundaries** | Creates folders | Enforces module boundaries |
| **Documentation** | Folder names | ADRs, READMEs, diagrams |
| **Tooling** | Uses aliases | Sets up linting rules |
| **Migration** | Follows plan | Creates migration strategy |

### Middle Developer
- Feature-based struktura ishlatadi
- Path aliases sozlaydi
- Index files yozadi
- Colocation qiladi

### Senior Developer
- Struktura strategiyasini belgilaydi
- Module boundaries'ni dizayn qiladi
- Dependency rules'ni enforce qiladi
- Migration strategiyasini rejalashtiradi
- Architecture Decision Records yozadi
- Tooling o'rnatadi (linting, analysis)

---

> **Eslatma:** Folder struktura - bu "to'g'ri" yoki "noto'g'ri" emas, balki kontekstga mos yoki mos emas. Loyiha hajmi, jamoa tuzilmasi va biznes talablari asosida qaror qiling.
