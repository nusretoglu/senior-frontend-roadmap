# Scalability - Loyihani Kengaytirish Strategiyalari

## Kirish

Scalability (kengaytiriluvchanlik) - bu loyihaning foydalanuvchilar soni, ma'lumotlar hajmi, funksionallik va jamoa o'sishi bilan birga samarali ishlashni davom ettirish qobiliyatidir. Frontend arxitekturasida scalability faqat performance emas, balki kod bazasining boshqariluvchanligini ham o'z ichiga oladi.

## Nazariy Asos

### Scalability Turlari

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCALABILITY DIMENSIONS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐     │
│   │  VERTICAL   │    │ HORIZONTAL  │    │  TEAM           │     │
│   │  Scaling    │    │ Scaling     │    │  Scaling        │     │
│   │             │    │             │    │                 │     │
│   │  • Bundle   │    │  • Module   │    │  • Independent  │     │
│   │    size     │    │    federation│   │    teams        │     │
│   │  • Memory   │    │  • Micro-   │    │  • Clear        │     │
│   │  • CPU      │    │    frontends│    │    ownership    │     │
│   │             │    │  • CDN      │    │  • Contracts    │     │
│   └─────────────┘    └─────────────┘    └─────────────────┘     │
│         │                  │                    │                │
│         ▼                  ▼                    ▼                │
│   Performance        Distribution          Organization         │
│   Optimization       Strategy             Structure             │
└─────────────────────────────────────────────────────────────────┘
```

### Murakkablik O'sishi

| Loyiha Darajasi | Fayl Soni | Jamoa Hajmi | Asosiy Muammo |
|-----------------|-----------|-------------|---------------|
| Kichik | 50-200 | 1-3 | Yetarli abstraksiya yo'q |
| O'rta | 200-1000 | 3-10 | Coupling, shared state |
| Katta | 1000-5000 | 10-30 | Team coordination |
| Enterprise | 5000+ | 30+ | Independent deployment |

## Code Misollari

### 1. Feature-based Module Scaling

```javascript
// ========================================
// YOMON: Flat structure - kengaytirish qiyin
// ========================================

// src/components/
//   Button.vue
//   UserCard.vue
//   UserProfile.vue
//   UserSettings.vue
//   ProductCard.vue
//   ProductList.vue
//   CartItem.vue
//   CartSummary.vue
//   ... 100+ files

// Muammo: Qaysi komponent qaysi feature'ga tegishli?
// Muammo: Team ownership aniq emas
// Muammo: Code review scope katta

// ========================================
// YAXSHI: Feature-based modules
// ========================================

// src/
// ├── features/
// │   ├── auth/
// │   │   ├── components/
// │   │   │   ├── LoginForm.vue
// │   │   │   └── RegisterForm.vue
// │   │   ├── composables/
// │   │   │   └── useAuth.js
// │   │   ├── stores/
// │   │   │   └── auth.store.js
// │   │   ├── api/
// │   │   │   └── auth.api.js
// │   │   └── index.js          // Public API
// │   │
// │   ├── users/
// │   │   ├── components/
// │   │   ├── composables/
// │   │   ├── stores/
// │   │   └── index.js
// │   │
// │   └── products/
// │       ├── components/
// │       ├── composables/
// │       ├── stores/
// │       └── index.js
// │
// └── shared/
//     ├── components/          // BaseButton, BaseInput
//     ├── composables/         // useApi, useForm
//     └── utils/               // formatDate, validators

// Feature module public API
// features/auth/index.js
export { default as LoginForm } from './components/LoginForm.vue'
export { default as RegisterForm } from './components/RegisterForm.vue'
export { useAuth } from './composables/useAuth'
export { useAuthStore } from './stores/auth.store'

// Foydalanish
import { LoginForm, useAuth } from '@/features/auth'
```

### 2. State Scaling Patterns

```javascript
// ========================================
// YOMON: Markazlashgan giant store
// ========================================
// stores/index.js
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    // Auth
    user: null,
    token: null,
    isAuthenticated: false,

    // Products
    products: [],
    selectedProduct: null,
    productFilters: {},

    // Cart
    cartItems: [],
    cartTotal: 0,

    // Orders
    orders: [],
    currentOrder: null,

    // UI
    sidebarOpen: false,
    theme: 'light',
    notifications: [],

    // ... 50+ more properties
  }),

  actions: {
    // 100+ actions mixed together
    async login() { /* ... */ },
    async fetchProducts() { /* ... */ },
    addToCart() { /* ... */ },
    // ...
  }
})

// Muammo: Har qanday o'zgarish hamma joyga ta'sir qiladi
// Muammo: Testing murakkab
// Muammo: Team konfliktlari

// ========================================
// YAXSHI: Domain-based distributed stores
// ========================================

// stores/auth.store.js
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role ?? 'guest',
  },

  actions: {
    async login(credentials) {
      const response = await authApi.login(credentials)
      this.token = response.token
      this.user = response.user
    },

    logout() {
      this.token = null
      this.user = null
    },
  },

  // Persist configuration
  persist: {
    paths: ['token'],
  },
})

// stores/cart.store.js
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  },

  actions: {
    addItem(product, quantity = 1) {
      const existing = this.items.find(item => item.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        this.items.push({ ...product, quantity })
      }
    },

    removeItem(productId) {
      const index = this.items.findIndex(item => item.id === productId)
      if (index > -1) {
        this.items.splice(index, 1)
      }
    },
  },
})

// Store composition - cross-store logic
// composables/useCheckout.js
export function useCheckout() {
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const orderStore = useOrderStore()

  async function checkout() {
    if (!authStore.isAuthenticated) {
      throw new Error('Please login first')
    }

    const order = await orderStore.createOrder({
      userId: authStore.user.id,
      items: cartStore.items,
      total: cartStore.totalPrice,
    })

    cartStore.clearCart()
    return order
  }

  return { checkout }
}
```

### 3. API Layer Scaling

```javascript
// ========================================
// YOMON: Inline API calls
// ========================================
// components/ProductList.vue
const products = ref([])
const loading = ref(false)

async function fetchProducts() {
  loading.value = true
  try {
    // API call directly in component
    const response = await fetch('/api/products?category=electronics&limit=20')
    if (!response.ok) throw new Error('Failed to fetch')
    products.value = await response.json()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Muammo: Har bir komponentda takroriy kod
// Muammo: Error handling inconsistent
// Muammo: Caching yo'q
// Muammo: Request cancellation yo'q

// ========================================
// YAXSHI: Layered API architecture
// ========================================

// 1. HTTP Client - Infrastructure layer
// lib/http.js
import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
})

// Request interceptor - auth token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - error handling
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Emit auth error event
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export { http }

// 2. API Services - Domain layer
// api/products.api.js
import { http } from '@/lib/http'

class ProductsApi {
  baseUrl = '/products'

  async getAll(params = {}) {
    const response = await http.get(this.baseUrl, { params })
    return response.data
  }

  async getById(id) {
    const response = await http.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  async create(data) {
    const response = await http.post(this.baseUrl, data)
    return response.data
  }

  async update(id, data) {
    const response = await http.put(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  async delete(id) {
    await http.delete(`${this.baseUrl}/${id}`)
  }
}

export const productsApi = new ProductsApi()

// 3. Data Fetching Composable - Application layer
// composables/useProducts.js
import { ref, computed } from 'vue'
import { productsApi } from '@/api/products.api'

export function useProducts(initialParams = {}) {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const params = ref(initialParams)

  // Pagination
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
  })

  const hasMore = computed(() => {
    return products.value.length < pagination.value.total
  })

  async function fetch() {
    loading.value = true
    error.value = null

    try {
      const response = await productsApi.getAll({
        ...params.value,
        page: pagination.value.page,
        limit: pagination.value.limit,
      })

      products.value = response.data
      pagination.value.total = response.total
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (loading.value || !hasMore.value) return

    pagination.value.page++
    loading.value = true

    try {
      const response = await productsApi.getAll({
        ...params.value,
        page: pagination.value.page,
        limit: pagination.value.limit,
      })

      products.value.push(...response.data)
    } catch (err) {
      pagination.value.page--
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function setFilter(key, value) {
    params.value[key] = value
    pagination.value.page = 1
    fetch()
  }

  return {
    products,
    loading,
    error,
    pagination,
    hasMore,
    fetch,
    loadMore,
    setFilter,
  }
}
```

### 4. Component Scaling with Composition

```javascript
// ========================================
// YOMON: Monolithic component
// ========================================
// components/DataTable.vue - 800+ lines
export default {
  props: {
    data: Array,
    columns: Array,
    sortable: Boolean,
    filterable: Boolean,
    paginated: Boolean,
    selectable: Boolean,
    exportable: Boolean,
    // 20+ more props
  },

  data() {
    return {
      sortColumn: null,
      sortDirection: 'asc',
      filters: {},
      currentPage: 1,
      pageSize: 10,
      selectedRows: [],
      // All logic mixed together
    }
  },

  methods: {
    // 50+ methods for all features
  },
}

// ========================================
// YAXSHI: Composable-based scaling
// ========================================

// composables/table/useTableSort.js
export function useTableSort(data) {
  const sortColumn = ref(null)
  const sortDirection = ref('asc')

  const sortedData = computed(() => {
    if (!sortColumn.value) return data.value

    return [...data.value].sort((a, b) => {
      const aVal = a[sortColumn.value]
      const bVal = b[sortColumn.value]
      const direction = sortDirection.value === 'asc' ? 1 : -1

      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * direction
      }
      return (aVal - bVal) * direction
    })
  })

  function sort(column) {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
  }

  return {
    sortColumn,
    sortDirection,
    sortedData,
    sort,
  }
}

// composables/table/useTableFilter.js
export function useTableFilter(data, columns) {
  const filters = ref({})

  const filteredData = computed(() => {
    return data.value.filter(row => {
      return Object.entries(filters.value).every(([key, value]) => {
        if (!value) return true
        const cellValue = String(row[key]).toLowerCase()
        return cellValue.includes(value.toLowerCase())
      })
    })
  })

  function setFilter(column, value) {
    filters.value[column] = value
  }

  function clearFilters() {
    filters.value = {}
  }

  return {
    filters,
    filteredData,
    setFilter,
    clearFilters,
  }
}

// composables/table/useTablePagination.js
export function useTablePagination(data, initialPageSize = 10) {
  const currentPage = ref(1)
  const pageSize = ref(initialPageSize)

  const totalPages = computed(() =>
    Math.ceil(data.value.length / pageSize.value)
  )

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return data.value.slice(start, start + pageSize.value)
  })

  function goToPage(page) {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  function nextPage() {
    goToPage(currentPage.value + 1)
  }

  function prevPage() {
    goToPage(currentPage.value - 1)
  }

  // Watch data changes - reset to page 1
  watch(() => data.value.length, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = 1
    }
  })

  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
  }
}

// composables/table/useTableSelection.js
export function useTableSelection(data, idKey = 'id') {
  const selectedIds = ref(new Set())

  const selectedRows = computed(() =>
    data.value.filter(row => selectedIds.value.has(row[idKey]))
  )

  const allSelected = computed(() =>
    data.value.length > 0 && selectedIds.value.size === data.value.length
  )

  const someSelected = computed(() =>
    selectedIds.value.size > 0 && !allSelected.value
  )

  function toggleRow(row) {
    const id = row[idKey]
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }

  function toggleAll() {
    if (allSelected.value) {
      selectedIds.value.clear()
    } else {
      data.value.forEach(row => selectedIds.value.add(row[idKey]))
    }
  }

  function clearSelection() {
    selectedIds.value.clear()
  }

  return {
    selectedIds,
    selectedRows,
    allSelected,
    someSelected,
    toggleRow,
    toggleAll,
    clearSelection,
  }
}

// Final: Composed DataTable
// components/DataTable.vue
<script setup>
import { useTableSort } from '@/composables/table/useTableSort'
import { useTableFilter } from '@/composables/table/useTableFilter'
import { useTablePagination } from '@/composables/table/useTablePagination'
import { useTableSelection } from '@/composables/table/useTableSelection'

const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true },
  sortable: { type: Boolean, default: false },
  filterable: { type: Boolean, default: false },
  paginated: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false },
})

const dataRef = toRef(props, 'data')

// Compose features as needed
const { sortedData, sort, sortColumn, sortDirection } =
  useTableSort(dataRef)

const { filteredData, setFilter, clearFilters } =
  useTableFilter(sortedData, props.columns)

const { paginatedData, currentPage, totalPages, goToPage } =
  useTablePagination(filteredData)

const { selectedRows, toggleRow, toggleAll, allSelected } =
  useTableSelection(paginatedData)

// Final displayed data - composition chain
const displayedData = paginatedData
</script>
```

### 5. Code Splitting for Scale

```javascript
// ========================================
// YOMON: Hamma narsa bir bundle'da
// ========================================
// router/index.js
import Home from '@/views/Home.vue'
import Products from '@/views/Products.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import Cart from '@/views/Cart.vue'
import Checkout from '@/views/Checkout.vue'
import AdminDashboard from '@/views/admin/Dashboard.vue'
import AdminProducts from '@/views/admin/Products.vue'
import AdminOrders from '@/views/admin/Orders.vue'
// ... all imports loaded at startup

const routes = [
  { path: '/', component: Home },
  { path: '/products', component: Products },
  // ...
]

// ========================================
// YAXSHI: Route-based code splitting
// ========================================
// router/index.js
const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/products',
    component: () => import('@/views/Products.vue'),
  },
  {
    path: '/products/:id',
    component: () => import('@/views/ProductDetail.vue'),
  },
  // Group admin routes
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/admin/Dashboard.vue'),
      },
      {
        path: 'products',
        component: () => import('@/views/admin/Products.vue'),
      },
    ],
  },
]

// Named chunks for better debugging
const routes = [
  {
    path: '/products',
    component: () => import(
      /* webpackChunkName: "products" */
      '@/views/Products.vue'
    ),
  },
]

// ========================================
// Component-level lazy loading
// ========================================
// Heavy component loaded on demand
<template>
  <div>
    <button @click="showChart = true">Show Analytics</button>

    <Suspense v-if="showChart">
      <template #default>
        <AnalyticsChart :data="chartData" />
      </template>
      <template #fallback>
        <ChartSkeleton />
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'

const showChart = ref(false)

// Lazy load heavy component
const AnalyticsChart = defineAsyncComponent(() =>
  import('@/components/AnalyticsChart.vue')
)
</script>
```

## Real-World Case Study

### Case: E-commerce Platform Scaling

**Vaziyat:** 5 ta developer bilan boshlangan startup 2 yil ichida 30 ta developerga o'sdi. Dastlabki monolitik Vue.js ilovasi scale qila olmay qoldi.

**Muammolar:**
1. Build vaqti 15 daqiqadan oshdi
2. Har bir PR merge'da konfliktlar
3. Bir feature'dagi xato boshqa feature'larga ta'sir qildi
4. Yangi developerlar onboarding 2-3 hafta davom etdi

**Yechim - Incremental migration:**

```
Bosqich 1: Feature Modules (2 oy)
────────────────────────────────────────
Monolith → Feature-based folders
├── Har bir feature'ga owner tayinlandi
├── Public API (index.js) aniqlandi
└── Cross-feature import'lar cheklandi

Bosqich 2: Store Decomposition (1 oy)
────────────────────────────────────────
Giant Vuex store → Domain Pinia stores
├── auth.store.js
├── cart.store.js
├── products.store.js
└── orders.store.js

Bosqich 3: Micro-frontends (6 oy)
────────────────────────────────────────
Monolith → Module Federation
├── Shell App (routing, auth)
├── Products MFE (Team A)
├── Cart/Checkout MFE (Team B)
└── Admin MFE (Team C)

Natijalar:
├── Build time: 15 min → 3 min (per MFE)
├── Deploy: Daily → On-demand per team
├── Onboarding: 3 weeks → 1 week
└── Bug isolation: 100% improved
```

## Interview Savollari

### 1. Junior-Middle Level
**Savol:** Feature-based folder structure'ning flat structure'dan afzalligi nimada?

**Javob:** Feature-based structure quyidagi afzalliklarga ega:
- **Cohesion** - Bog'liq fayllar birgalikda joylashgan
- **Encapsulation** - Har bir feature o'z API'si orqali expose qilinadi
- **Team ownership** - Aniq mas'uliyat chegaralari
- **Scaling** - Yangi feature qo'shish mavjudlarga ta'sir qilmaydi

### 2. Middle-Senior Level
**Savol:** State management'ni qanday scale qilasiz? Global store vs distributed stores?

**Javob:**
```javascript
// Kichik loyiha - global store yetarli
// O'rta loyiha - domain-based stores
// Katta loyiha - store per feature + composition

// Scale pattern:
// 1. Har bir domain o'z store'iga ega
// 2. Cross-domain logic → composables
// 3. Store inter-communication → events yoki shared composables
// 4. Server state → TanStack Query kabi kutubxonalar
```

### 3. Senior Level
**Savol:** Micro-frontends arxitekturasiga qachon o'tish kerak? Qanday qiyinchiliklar bor?

**Javob:**
```
Qachon kerak:
├── 3+ mustaqil jamoa
├── Har xil deploy sikllari kerak
├── Monolith build 10+ daqiqa
└── Team autonomy zarur

Qiyinchiliklar:
├── Shared state management
├── Consistent UX/UI
├── Authentication flow
├── Performance (multiple bundles)
├── Debugging complexity
└── Team coordination

Yechimlar:
├── Module Federation (Webpack 5 / Vite)
├── Shared component library
├── Design system
└── Contract testing
```

### 4. Senior/Lead Level
**Savol:** Loyiha exponential o'sishini qanday oldini olasiz (complexity)?

**Javob:**
```
1. ARCHITECTURAL BOUNDARIES
   ├── Clear module boundaries
   ├── Dependency direction rules
   └── Public API contracts

2. INCREMENTAL SCALING
   ├── Start simple, evolve as needed
   ├── Refactor before it's too late
   └── Architecture fitness functions

3. TECHNICAL DEBT MANAGEMENT
   ├── Regular refactoring sprints
   ├── Code quality metrics
   └── Architecture Decision Records

4. TEAM TOPOLOGY
   ├── Feature teams vs component teams
   ├── Clear ownership
   └── Minimal cross-team dependencies
```

### 5. Architect Level
**Savol:** Qanday qilib arxitektura qarorlarini obyektiv baholaysiz?

**Javob:**
```javascript
// Architecture Fitness Functions
const metrics = {
  // Build metrics
  buildTime: '< 5 min per module',
  bundleSize: '< 200KB initial load',

  // Code metrics
  moduleCount: 'N modules, O(N) complexity',
  dependencyCycles: '0 cycles allowed',
  publicApiSize: '< 20 exports per module',

  // Team metrics
  deployFrequency: 'Independent per team',
  changeFailureRate: '< 5%',
  leadTime: '< 1 day',
}

// Automated checks in CI
// - Bundle analyzer
// - Dependency graph validation
// - Architecture linting (e.g., dependency-cruiser)
```

## Senior vs Middle Farqi

| Aspekt | Middle | Senior |
|--------|--------|--------|
| **Fokus** | Funksionallik ishlashi | Uzun muddatli barqarorlik |
| **Qaror** | Framework best practices | Custom architecture decisions |
| **Scaling** | Add more code | Refactor for scale |
| **Perspective** | Current sprint | 6-12 months ahead |
| **Metrics** | Works/doesn't work | Performance, maintainability, team velocity |

### Middle Developer
- Feature-based folders ishlatadi
- Store'larni ajratadi
- Code splitting qo'llaydi
- Composables yozadi

### Senior Developer
- Module boundaries'ni design qiladi
- Team topology'ni hisobga oladi
- Migration strategiyalarini rejalashtiradi
- Architecture fitness functions yozadi
- Trade-off'larni hujjatlashtiradi (ADR)
- Technical debt'ni boshqaradi

---

> **Eslatma:** Scalability - bu marathon, sprint emas. Eng yaxshi vaqt refactor qilish uchun - hozir. Eng yomon vaqt - "keyinroq qilamiz" deganda.
