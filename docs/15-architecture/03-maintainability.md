# Maintainability - Kodni Qo'llab-quvvatlash Osonligi

## Kirish

Maintainability (qo'llab-quvvatlanuvchanlik) - bu kodning vaqt o'tishi bilan qanchalik oson tushunilishi, o'zgartirilishi, kengaytirilishi va xatolardan tozalanishini bildiradi. Statistikaga ko'ra, dasturchilar vaqtining 70-80% mavjud kodni o'qish va tushunishga sarflanadi. Shuning uchun maintainable kod yozish - bu investitsiya.

## Nazariy Asos

### Maintainability Formulasi

```
┌─────────────────────────────────────────────────────────────────┐
│              MAINTAINABILITY INDEX (MI)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   MI = 171 - 5.2 × ln(HV) - 0.23 × CC - 16.2 × ln(LOC)          │
│                                                                  │
│   Where:                                                         │
│   • HV  = Halstead Volume (code complexity)                     │
│   • CC  = Cyclomatic Complexity (decision paths)                │
│   • LOC = Lines of Code                                         │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  MI Score   │  Maintainability  │  Action Required      │   │
│   ├─────────────┼───────────────────┼──────────────────────┤   │
│   │  85-100     │  Excellent        │  No action            │   │
│   │  65-85      │  Good             │  Monitor              │   │
│   │  40-65      │  Moderate         │  Plan refactoring     │   │
│   │  0-40       │  Poor             │  Immediate refactor   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Maintainability Pillars

```
┌─────────────────────────────────────────────────────────────────┐
│                  MAINTAINABILITY PILLARS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│   │ READABILITY │  │ SIMPLICITY  │  │ MODULARITY  │             │
│   │             │  │             │  │             │             │
│   │ • Naming    │  │ • KISS      │  │ • SRP       │             │
│   │ • Comments  │  │ • YAGNI     │  │ • Low       │             │
│   │ • Format    │  │ • Small     │  │   coupling  │             │
│   │ • Structure │  │   functions │  │ • High      │             │
│   │             │  │             │  │   cohesion  │             │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│          │                │                │                     │
│          └────────────────┼────────────────┘                     │
│                           ▼                                      │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│   │ TESTABILITY │  │ CONSISTENCY │  │ DOCUMENTATION│            │
│   │             │  │             │  │              │            │
│   │ • Pure      │  │ • Code      │  │ • JSDoc      │            │
│   │   functions │  │   style     │  │ • README     │            │
│   │ • DI        │  │ • Patterns  │  │ • Examples   │            │
│   │ • Mocking   │  │ • Structure │  │ • ADRs       │            │
│   └─────────────┘  └─────────────┘  └──────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Code Misollari

### 1. Meaningful Naming

```javascript
// ========================================
// YOMON: Tushunarsiz nomlar
// ========================================

// Nima qiladi bu funksiya?
function calc(d, r) {
  const t = d.filter(i => i.s === 'a')
  return t.reduce((a, c) => a + c.p * c.q, 0) * (1 - r)
}

// Bu nima?
const x = users.find(u => u.a && u.r === 'admin')

// Qisqartmalar - faqat author tushunadi
const usrMgr = new UserManager()
const btnClkHndlr = () => {}

// ========================================
// YAXSHI: Aniq, descriptive nomlar
// ========================================

// Funksiya nomi o'z vazifasini tushuntiradi
function calculateDiscountedCartTotal(cartItems, discountRate) {
  const activeItems = cartItems.filter(item => item.status === 'active')

  const subtotal = activeItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  const discountAmount = subtotal * discountRate
  return subtotal - discountAmount
}

// O'qishda hech qanday savol tug'ilmaydi
const activeAdminUser = users.find(
  user => user.isActive && user.role === 'admin'
)

// To'liq nomlar
const userManager = new UserManager()
const handleButtonClick = () => {}

// ========================================
// Naming Conventions Guide
// ========================================

// 1. Boolean - is/has/can/should prefix
const isLoading = true
const hasPermission = user.role === 'admin'
const canEdit = hasPermission && !isLocked
const shouldRefetch = Date.now() - lastFetch > cacheTimeout

// 2. Arrays - plural nouns
const users = []
const selectedProductIds = []
const validationErrors = []

// 3. Functions - verb + noun
function fetchUserData() {}
function calculateTotalPrice() {}
function validateEmailFormat() {}
function transformResponseToModel() {}

// 4. Event handlers - handle + Event
function handleSubmit(event) {}
function handleInputChange(event) {}
function handleUserSelect(user) {}

// 5. Callbacks - on + Event
const props = defineProps({
  onSelect: Function,
  onChange: Function,
  onError: Function,
})

// 6. Constants - SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3
const DEFAULT_PAGE_SIZE = 20
const API_BASE_URL = 'https://api.example.com'

// 7. Types/Interfaces - PascalCase
interface UserProfile {
  id: string
  email: string
  createdAt: Date
}

type PaymentStatus = 'pending' | 'completed' | 'failed'
```

### 2. Function Design

```javascript
// ========================================
// YOMON: God function - juda ko'p vazifa
// ========================================

async function processOrder(orderData, user) {
  // Validation
  if (!orderData.items || orderData.items.length === 0) {
    throw new Error('No items in order')
  }
  if (!user.email) {
    throw new Error('User email required')
  }
  for (const item of orderData.items) {
    if (item.quantity < 1) {
      throw new Error('Invalid quantity')
    }
    if (item.price < 0) {
      throw new Error('Invalid price')
    }
  }

  // Calculate totals
  let subtotal = 0
  for (const item of orderData.items) {
    subtotal += item.price * item.quantity
  }
  const tax = subtotal * 0.12
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + tax + shipping

  // Check inventory
  for (const item of orderData.items) {
    const product = await db.products.findById(item.productId)
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`)
    }
  }

  // Create order
  const order = await db.orders.create({
    userId: user.id,
    items: orderData.items,
    subtotal,
    tax,
    shipping,
    total,
    status: 'pending',
  })

  // Update inventory
  for (const item of orderData.items) {
    await db.products.updateOne(
      { _id: item.productId },
      { $inc: { stock: -item.quantity } }
    )
  }

  // Send email
  await sendEmail({
    to: user.email,
    subject: 'Order Confirmation',
    body: `Your order #${order.id} has been placed.`,
  })

  // Log analytics
  await analytics.track('order_placed', {
    orderId: order.id,
    userId: user.id,
    total,
  })

  return order
}

// ========================================
// YAXSHI: Single Responsibility functions
// ========================================

// 1. Validation - pure function
function validateOrderData(orderData) {
  const errors = []

  if (!orderData.items?.length) {
    errors.push({ field: 'items', message: 'Order must have at least one item' })
  }

  orderData.items?.forEach((item, index) => {
    if (item.quantity < 1) {
      errors.push({ field: `items[${index}].quantity`, message: 'Quantity must be positive' })
    }
    if (item.price < 0) {
      errors.push({ field: `items[${index}].price`, message: 'Price cannot be negative' })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// 2. Calculation - pure function
function calculateOrderTotals(items, options = {}) {
  const { taxRate = 0.12, freeShippingThreshold = 100, shippingCost = 10 } = options

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const tax = subtotal * taxRate
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost
  const total = subtotal + tax + shipping

  return { subtotal, tax, shipping, total }
}

// 3. Inventory check - async, single purpose
async function checkInventoryAvailability(items) {
  const unavailableItems = []

  for (const item of items) {
    const product = await db.products.findById(item.productId)

    if (!product) {
      unavailableItems.push({
        productId: item.productId,
        reason: 'Product not found',
      })
    } else if (product.stock < item.quantity) {
      unavailableItems.push({
        productId: item.productId,
        productName: product.name,
        requested: item.quantity,
        available: product.stock,
        reason: 'Insufficient stock',
      })
    }
  }

  return {
    isAvailable: unavailableItems.length === 0,
    unavailableItems,
  }
}

// 4. Order creation - transaction boundary
async function createOrder(userId, items, totals) {
  return db.orders.create({
    userId,
    items,
    ...totals,
    status: 'pending',
    createdAt: new Date(),
  })
}

// 5. Inventory update - transaction boundary
async function decrementInventory(items) {
  const operations = items.map(item => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { stock: -item.quantity } },
    },
  }))

  return db.products.bulkWrite(operations)
}

// 6. Notification - fire and forget
async function sendOrderConfirmation(order, user) {
  try {
    await sendEmail({
      to: user.email,
      subject: `Order Confirmation #${order.id}`,
      template: 'order-confirmation',
      data: { order, user },
    })
  } catch (error) {
    // Log but don't fail the order
    console.error('Failed to send order confirmation:', error)
    await errorTracker.capture(error, { orderId: order.id })
  }
}

// 7. Analytics - fire and forget
function trackOrderPlaced(order, user) {
  // Non-blocking analytics
  analytics.track('order_placed', {
    orderId: order.id,
    userId: user.id,
    total: order.total,
    itemCount: order.items.length,
  }).catch(console.error)
}

// Main orchestrator - clean, readable flow
async function processOrder(orderData, user) {
  // Step 1: Validate
  const validation = validateOrderData(orderData)
  if (!validation.isValid) {
    throw new ValidationError('Invalid order data', validation.errors)
  }

  // Step 2: Check inventory
  const inventory = await checkInventoryAvailability(orderData.items)
  if (!inventory.isAvailable) {
    throw new InventoryError('Items unavailable', inventory.unavailableItems)
  }

  // Step 3: Calculate totals
  const totals = calculateOrderTotals(orderData.items)

  // Step 4: Create order (transaction)
  const order = await db.transaction(async (session) => {
    const newOrder = await createOrder(user.id, orderData.items, totals)
    await decrementInventory(orderData.items)
    return newOrder
  })

  // Step 5: Side effects (non-blocking)
  sendOrderConfirmation(order, user)
  trackOrderPlaced(order, user)

  return order
}
```

### 3. Code Comments - When and How

```javascript
// ========================================
// YOMON: Keraksiz yoki eskirgan commentlar
// ========================================

// Get user by ID
function getUserById(id) {
  return db.users.findById(id) // Find user in database
}

// Loop through users
for (const user of users) {
  // Check if user is active
  if (user.isActive) {
    // Add user to active users array
    activeUsers.push(user)
  }
}

// TODO: Fix this later (6 oy oldin yozilgan)
// FIXME: This is a hack
// Author: John, Date: 2023-01-15 (eskirgan)

// ========================================
// YAXSHI: Faqat "nima uchun" ni tushuntiradigan commentlar
// ========================================

/**
 * Calculates shipping cost based on order total and destination.
 *
 * Business rule: Free shipping for orders over $100.
 * International orders have a flat $25 surcharge.
 *
 * @param {number} orderTotal - Total order amount in USD
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {number} Shipping cost in USD
 */
function calculateShippingCost(orderTotal, countryCode) {
  // Free shipping for domestic orders over $100
  // (Marketing decision Q2 2024, ticket: SHIP-123)
  if (countryCode === 'US' && orderTotal >= 100) {
    return 0
  }

  const baseRate = 10

  // International surcharge accounts for customs processing
  // and longer delivery times (agreed with logistics team)
  const internationalSurcharge = countryCode !== 'US' ? 25 : 0

  return baseRate + internationalSurcharge
}

// ========================================
// Comment Types Guide
// ========================================

// 1. INTENT - Why, not what
// Correct: Explain WHY this approach was chosen
// Retry with exponential backoff to handle transient network issues
// without overwhelming the server during outages
async function fetchWithRetry(url, maxAttempts = 3) {
  // ...
}

// 2. WARNING - Non-obvious gotchas
// WARNING: This regex is intentionally permissive because we sanitize
// input separately. Don't use for security validation!
const LOOSE_EMAIL_REGEX = /\S+@\S+/

// 3. TODO with context
// TODO(ticket: AUTH-456): Implement refresh token rotation
// Currently using single-use tokens which expire after 1 hour.
// See RFC: docs/auth-token-rotation.md

// 4. Legal/License headers (when required)
/**
 * @license MIT
 * Copyright (c) 2024 Company Name
 */

// 5. Complex algorithm explanation
/**
 * Implements Levenshtein distance algorithm for fuzzy string matching.
 *
 * Time complexity: O(m*n) where m, n are string lengths
 * Space complexity: O(min(m,n)) using optimized single-row approach
 *
 * Used for search autocomplete to suggest corrections.
 * See: https://en.wikipedia.org/wiki/Levenshtein_distance
 */
function levenshteinDistance(str1, str2) {
  // ...
}

// 6. Configuration explanation
export default {
  // Aggressive caching for static assets (versioned via hash)
  staticAssets: {
    maxAge: 31536000, // 1 year in seconds
    immutable: true,
  },

  // Short cache for API responses to balance freshness and performance
  // Based on traffic analysis: 90% of requests are repeat within 5 min
  apiResponses: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 60,
  },
}
```

### 4. Error Handling for Maintainability

```javascript
// ========================================
// YOMON: Silent failures, cryptic errors
// ========================================

async function loadUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  } catch (e) {
    // Silent failure - what happened?
    return null
  }
}

// Generic error - where to look?
throw new Error('Something went wrong')

// Console only - production'da ko'rinmaydi
console.error('Failed to load data')

// ========================================
// YAXSHI: Informative, actionable errors
// ========================================

// Custom error classes
class AppError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = this.constructor.name
    this.code = options.code || 'UNKNOWN_ERROR'
    this.statusCode = options.statusCode || 500
    this.isOperational = options.isOperational ?? true
    this.context = options.context || {}

    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
    }
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      context: { errors },
    })
    this.errors = errors
  }
}

class NotFoundError extends AppError {
  constructor(resource, identifier) {
    super(`${resource} not found: ${identifier}`, {
      code: 'NOT_FOUND',
      statusCode: 404,
      context: { resource, identifier },
    })
  }
}

class NetworkError extends AppError {
  constructor(operation, originalError) {
    super(`Network error during ${operation}`, {
      code: 'NETWORK_ERROR',
      statusCode: 503,
      context: {
        operation,
        originalMessage: originalError.message,
      },
    })
    this.originalError = originalError
  }
}

// Error handling with context
async function loadUserData(userId) {
  const operation = `loadUserData(${userId})`

  try {
    const response = await fetch(`/api/users/${userId}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError('User', userId)
      }
      throw new AppError(`Failed to load user: ${response.statusText}`, {
        code: 'API_ERROR',
        statusCode: response.status,
        context: { userId, status: response.status },
      })
    }

    return response.json()
  } catch (error) {
    // Network error (fetch failed completely)
    if (error instanceof TypeError) {
      throw new NetworkError(operation, error)
    }

    // Re-throw app errors as is
    if (error instanceof AppError) {
      throw error
    }

    // Wrap unknown errors
    throw new AppError(`Unexpected error in ${operation}`, {
      context: { originalError: error.message },
    })
  }
}

// Centralized error handler (Vue example)
// plugins/errorHandler.js
export function setupErrorHandler(app) {
  app.config.errorHandler = (error, instance, info) => {
    // Log with context
    console.error('Vue Error:', {
      error: error.message,
      component: instance?.$options?.name,
      info,
      stack: error.stack,
    })

    // Report to monitoring service
    if (import.meta.env.PROD) {
      errorTracker.capture(error, {
        component: instance?.$options?.name,
        info,
        user: authStore.user?.id,
      })
    }

    // Show user-friendly message
    if (error instanceof AppError && error.isOperational) {
      toast.error(error.message)
    } else {
      toast.error('Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.')
    }
  }
}
```

### 5. Code Structure for Readability

```javascript
// ========================================
// YOMON: Jumbled, hard to follow
// ========================================

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/api'
import { formatDate } from '@/utils/date'
import BaseButton from '@/components/BaseButton.vue'

const router = useRouter()
const userStore = useUserStore()
const users = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedUser = ref(null)
const isModalOpen = ref(false)
const sortField = ref('name')
const sortOrder = ref('asc')
const currentPage = ref(1)
const pageSize = ref(20)
const error = ref(null)

const filteredUsers = computed(() => users.value.filter(u =>
  u.name.toLowerCase().includes(searchQuery.value.toLowerCase())
))
const sortedUsers = computed(() => [...filteredUsers.value].sort((a, b) => {
  const modifier = sortOrder.value === 'asc' ? 1 : -1
  return a[sortField.value] > b[sortField.value] ? modifier : -modifier
}))
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedUsers.value.slice(start, start + pageSize.value)
})
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize.value))

async function fetchUsers() { loading.value = true; try { users.value = await api.users.getAll() } catch (e) { error.value = e.message } finally { loading.value = false } }
function selectUser(user) { selectedUser.value = user; isModalOpen.value = true }
function closeModal() { isModalOpen.value = false; selectedUser.value = null }
async function deleteUser(id) { await api.users.delete(id); await fetchUsers() }
function changePage(page) { currentPage.value = page }

watch(searchQuery, () => { currentPage.value = 1 })
onMounted(fetchUsers)
</script>

// ========================================
// YAXSHI: Well-organized, grouped logically
// ========================================

<script setup>
// ──────────────────────────────────────
// Imports - grouped by type
// ──────────────────────────────────────

// Vue core
import { ref, computed, watch, onMounted } from 'vue'

// Router & Stores
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

// API & Utils
import { usersApi } from '@/api/users'
import { formatDate } from '@/utils/date'

// Components
import BaseButton from '@/components/BaseButton.vue'
import UserModal from './UserModal.vue'
import UserTable from './UserTable.vue'

// ──────────────────────────────────────
// Props & Emits
// ──────────────────────────────────────

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['user-selected', 'user-deleted'])

// ──────────────────────────────────────
// Composables & External State
// ──────────────────────────────────────

const router = useRouter()
const userStore = useUserStore()

// ──────────────────────────────────────
// State - Data
// ──────────────────────────────────────

const users = ref([])
const selectedUser = ref(null)

// ──────────────────────────────────────
// State - UI
// ──────────────────────────────────────

const loading = ref(false)
const error = ref(null)
const isModalOpen = ref(false)

// ──────────────────────────────────────
// State - Filters & Pagination
// ──────────────────────────────────────

const searchQuery = ref(props.initialFilters.search ?? '')
const sortField = ref('name')
const sortOrder = ref('asc')
const currentPage = ref(1)
const pageSize = ref(20)

// ──────────────────────────────────────
// Computed - Data Transformations
// ──────────────────────────────────────

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

const sortedUsers = computed(() => {
  return [...filteredUsers.value].sort((a, b) => {
    const aValue = a[sortField.value]
    const bValue = b[sortField.value]
    const modifier = sortOrder.value === 'asc' ? 1 : -1

    if (typeof aValue === 'string') {
      return aValue.localeCompare(bValue) * modifier
    }
    return (aValue - bValue) * modifier
  })
})

const paginatedUsers = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return sortedUsers.value.slice(startIndex, endIndex)
})

// ──────────────────────────────────────
// Computed - UI State
// ──────────────────────────────────────

const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / pageSize.value)
)

const isEmpty = computed(() =>
  !loading.value && users.value.length === 0
)

const hasNoResults = computed(() =>
  !loading.value && users.value.length > 0 && filteredUsers.value.length === 0
)

// ──────────────────────────────────────
// Methods - Data Fetching
// ──────────────────────────────────────

async function fetchUsers() {
  loading.value = true
  error.value = null

  try {
    users.value = await usersApi.getAll()
  } catch (err) {
    error.value = err.message
    console.error('Failed to fetch users:', err)
  } finally {
    loading.value = false
  }
}

async function deleteUser(userId) {
  try {
    await usersApi.delete(userId)
    emit('user-deleted', userId)
    await fetchUsers()
  } catch (err) {
    error.value = `Failed to delete user: ${err.message}`
  }
}

// ──────────────────────────────────────
// Methods - UI Interactions
// ──────────────────────────────────────

function selectUser(user) {
  selectedUser.value = user
  isModalOpen.value = true
  emit('user-selected', user)
}

function closeModal() {
  isModalOpen.value = false
  selectedUser.value = null
}

function changePage(page) {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
}

function changeSort(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

// ──────────────────────────────────────
// Watchers
// ──────────────────────────────────────

// Reset to first page when search changes
watch(searchQuery, () => {
  currentPage.value = 1
})

// ──────────────────────────────────────
// Lifecycle
// ──────────────────────────────────────

onMounted(() => {
  fetchUsers()
})

// ──────────────────────────────────────
// Expose (if needed by parent)
// ──────────────────────────────────────

defineExpose({
  refresh: fetchUsers,
})
</script>
```

### 6. TypeScript for Maintainability

```typescript
// ========================================
// YOMON: Any everywhere, no types
// ========================================

function processData(data: any): any {
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    total: item.price * item.quantity,
  }))
}

const user: any = await fetchUser(id)

// ========================================
// YAXSHI: Strong typing
// ========================================

// types/user.ts - Centralized type definitions
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  profile?: UserProfile
}

export interface UserProfile {
  avatar?: string
  bio?: string
  location?: string
}

export type UserRole = 'admin' | 'moderator' | 'user' | 'guest'

export interface CreateUserDTO {
  email: string
  name: string
  password: string
  role?: UserRole
}

export interface UpdateUserDTO {
  name?: string
  email?: string
  profile?: Partial<UserProfile>
}

// types/api.ts - API response types
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

// api/users.ts - Typed API client
import type { User, CreateUserDTO, UpdateUserDTO, PaginatedResponse, ApiResponse } from '@/types'

export const usersApi = {
  async getAll(params?: {
    page?: number
    pageSize?: number
    search?: string
    role?: UserRole
  }): Promise<PaginatedResponse<User>> {
    const response = await http.get<PaginatedResponse<User>>('/users', { params })
    return response.data
  },

  async getById(id: string): Promise<User> {
    const response = await http.get<ApiResponse<User>>(`/users/${id}`)
    return response.data.data
  },

  async create(data: CreateUserDTO): Promise<User> {
    const response = await http.post<ApiResponse<User>>('/users', data)
    return response.data.data
  },

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const response = await http.patch<ApiResponse<User>>(`/users/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await http.delete(`/users/${id}`)
  },
}

// composables/useUser.ts - Typed composable
import type { User, UpdateUserDTO } from '@/types'

interface UseUserReturn {
  user: Ref<User | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetch: (id: string) => Promise<void>
  update: (data: UpdateUserDTO) => Promise<void>
}

export function useUser(userId?: string): UseUserReturn {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetch(id: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      user.value = await usersApi.getById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  async function update(data: UpdateUserDTO): Promise<void> {
    if (!user.value) throw new Error('No user loaded')

    loading.value = true
    try {
      user.value = await usersApi.update(user.value.id, data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Update failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  if (userId) {
    onMounted(() => fetch(userId))
  }

  return {
    user,
    loading,
    error,
    fetch,
    update,
  }
}
```

## Real-World Case Study

### Case: Legacy Codebase Refactoring

**Vaziyat:** 4 yillik Vue 2 loyiha. Options API, mixins, Vuex, hech qanday TypeScript. Yangi developer'lar kodga tushunish uchun 3+ hafta sarflaydi.

**Maintainability Muammolari:**
1. 50+ mixin - qaysi method qaerdan kelayapti?
2. Vuex store 5000+ qator - hamma narsa bitta faylda
3. Komponentlar 1000+ qator - monolitik
4. Hech qanday type - runtime xatolar production'da

**Yechim - Incremental Refactoring:**

```
Phase 1: Add TypeScript (2 hafta)
────────────────────────────────────
├── tsconfig.json strict: false
├── JSDoc type annotations
├── Critical files → .ts
└── Natija: IDE intellisense ishlaydi

Phase 2: Extract Composables (4 hafta)
────────────────────────────────────
├── Mixins → Composables (1:1)
├── Tests yozildi
├── Mixins deprecate
└── Natija: Clear dependency graph

Phase 3: Split Store (3 hafta)
────────────────────────────────────
├── Vuex modules → Pinia stores
├── Domain-based splitting
├── TypeScript strict
└── Natija: Testable, typed state

Phase 4: Component Decomposition (6 hafta)
────────────────────────────────────
├── God components split
├── Composition API
├── Max 300 lines per file
└── Natija: Readable, focused components

Metrics Before → After:
├── Onboarding: 3 weeks → 1 week
├── Bug fix time: 4 hours → 1 hour
├── Test coverage: 12% → 68%
├── TypeScript errors caught: 200+ per month
└── Developer satisfaction: 3.2 → 4.6
```

## Interview Savollari

### 1. Junior-Middle Level
**Savol:** "Clean code" deb nimaga aytiladi? 3 ta asosiy xususiyatini ayting.

**Javob:**
1. **Readability** - Kod o'qilishi oson, aniq nomlar, strukturalangan
2. **Simplicity** - Kerakli murakkablik, KISS prinsipi
3. **Testability** - Pure functions, dependency injection, mockable

### 2. Middle-Senior Level
**Savol:** Katta faylni qanday refactor qilasiz? Qadamlarni tushuntiring.

**Javob:**
```
1. SAFETY NET
   ├── Testlar yozish (agar yo'q bo'lsa)
   ├── Git branch
   └── CI pipeline check

2. IDENTIFY CONCERNS
   ├── SRP buzilgan joylar
   ├── Takrorlanuvchi kod
   └── Nested conditionals

3. EXTRACT INCREMENTALLY
   ├── Utilities first (pure functions)
   ├── Composables second (stateful logic)
   ├── Components last (UI)
   └── Each extraction → test → commit

4. VERIFY
   ├── Tests pass
   ├── Manual QA
   └── Performance metrics unchanged
```

### 3. Senior Level
**Savol:** "Technical debt" ni qanday boshqarasiz?

**Javob:**
```
1. DOCUMENTATION
   ├── Debt inventory (backlog)
   ├── Impact assessment
   └── Cost estimation

2. PRIORITIZATION
   ├── Pain frequency (daily/weekly/monthly)
   ├── Developer velocity impact
   ├── Bug correlation
   └── Business impact

3. ALLOCATION
   ├── 20% sprint capacity for debt
   ├── "Boy scout rule" - leave code better
   ├── Refactoring tickets in sprint planning

4. PREVENTION
   ├── Code review standards
   ├── Definition of Done includes quality
   ├── Architecture Decision Records
   └── Regular audits
```

### 4. Senior/Lead Level
**Savol:** Jamoa code quality'ni qanday oshiradi?

**Javob:**
```
1. AUTOMATED TOOLS
   ├── ESLint/Prettier - code style
   ├── TypeScript strict mode
   ├── Pre-commit hooks (husky)
   └── CI/CD checks

2. PROCESS
   ├── Mandatory code reviews
   ├── Review checklist
   ├── Pair programming
   └── Architecture reviews

3. CULTURE
   ├── Lead by example
   ├── Blameless postmortems
   ├── Knowledge sharing (tech talks)
   └── Celebrate quality wins

4. METRICS
   ├── Code coverage targets
   ├── Cyclomatic complexity limits
   ├── Bundle size budgets
   └── Performance budgets
```

### 5. Architect Level
**Savol:** Maintainability vs Delivery speed - qanday balanslashtirish kerak?

**Javob:**
```
1. CONTEXT MATTERS
   ├── Startup/MVP → Speed > Quality
   ├── Growth → Balance
   ├── Enterprise → Quality > Speed

2. MINIMUM QUALITY BAR
   ├── Tests for critical paths
   ├── Type safety for core domain
   ├── Documentation for public APIs
   └── Never skip: security, data integrity

3. TECHNICAL BUDGET
   ├── 80% features, 20% quality
   ├── Debt ceiling (max N items)
   ├── "Now or never" rule for small fixes

4. LONG-TERM VIEW
   ├── Speed now = Slow later (debt compounds)
   ├── Quality now = Speed later
   └── Investment mindset
```

## Senior vs Middle Farqi

| Aspekt | Middle | Senior |
|--------|--------|--------|
| **Naming** | Descriptive names | Domain language, consistent vocabulary |
| **Comments** | Explains what | Explains why, documents decisions |
| **Error handling** | Try/catch | Error taxonomy, recovery strategies |
| **Code organization** | Grouped logically | Architectural patterns, clear boundaries |
| **Refactoring** | When asked | Proactive, incremental |
| **Technical debt** | Fixes when obvious | Manages, prioritizes, prevents |

### Middle Developer
- Clean code principles biladi
- Refactoring texnikalarini ishlatadi
- Code review'da quality tekshiradi
- Testing yozadi

### Senior Developer
- Team-wide code standards belgilaydi
- Architectural decisions hujjatlashtiradi
- Technical debt strategiyasini boshqaradi
- Code quality culture yaratadi
- Mentorship orqali quality tarqatadi
- Automation tooling o'rnatadi

---

> **Eslatma:** Maintainability - bu sprint emas, marathon. Har kuni kichik yaxshilanishlar vaqt o'tishi bilan katta natija beradi.
