# Caching Strategies

## Mundarija
1. [Caching Nima va Nima Uchun Kerak?](#caching-nima-va-nima-uchun-kerak)
2. [Caching Turlari](#caching-turlari)
3. [In-Memory Caching](#in-memory-caching)
4. [Persistent Caching](#persistent-caching)
5. [API Response Caching](#api-response-caching)
6. [Cache Invalidation](#cache-invalidation)
7. [Stale-While-Revalidate Pattern](#stale-while-revalidate-pattern)
8. [To'g'ri va Noto'g'ri Yondashuvlar](#togri-va-notogri-yondashuvlar)
9. [Real-World Patterns](#real-world-patterns)
10. [Interview Savollari](#interview-savollari)

---

## Caching Nima va Nima Uchun Kerak?

Caching - tez-tez ishlatiladigan ma'lumotlarni vaqtincha saqlash, qayta fetch qilmaslik uchun.

### Muammo

```
Cachesiz:

User opens page ──► API call ──► Wait 500ms ──► Render
User navigates   ──► API call ──► Wait 500ms ──► Render
User returns     ──► API call ──► Wait 500ms ──► Render
                     ▲
                     │
              Har safar 500ms kutish!
```

### Yechim

```
Cache bilan:

User opens page ──► API call ──► Wait 500ms ──► Render + Cache
User navigates   ──► Cache hit ──► Instant ──► Render
User returns     ──► Cache hit ──► Instant ──► Render
                     ▲
                     │
              Faqat 1 marta kutish!
```

### Caching Afzalliklari

1. **Tezlik** - Ma'lumot darhol mavjud
2. **Tarmoq tejash** - Kamroq API calls
3. **Server yuki** - Kamroq so'rovlar
4. **Offline support** - Internet yo'q bo'lsa ham ishlaydi
5. **UX** - Instant UI response

### Caching Xavflari

1. **Stale data** - Eskirgan ma'lumot
2. **Memory usage** - Ko'p cache = ko'p RAM
3. **Complexity** - Invalidation murakkab
4. **Inconsistency** - Turli cache'lar sinxron emas

---

## Caching Turlari

### 1. Memory Cache (Runtime)
```javascript
// JavaScript object/Map da saqlash
const cache = new Map()
cache.set('user:123', userData)

// Afzalliklari: Juda tez
// Kamchiliklari: Page refresh = yo'qoladi
```

### 2. LocalStorage/SessionStorage
```javascript
// Browser storage
localStorage.setItem('user', JSON.stringify(userData))

// Afzalliklari: Persist, 5-10MB
// Kamchiliklari: Sinxron, string only
```

### 3. IndexedDB
```javascript
// Browser database
const db = await openDB('myApp', 1)
await db.put('users', userData)

// Afzalliklari: Katta hajm, structured data
// Kamchiliklari: Async, murakkab API
```

### 4. HTTP Cache
```javascript
// Browser built-in
// Cache-Control, ETag, If-Modified-Since

// Afzalliklari: Avtomatik, standart
// Kamchiliklari: Server configuration kerak
```

### Cache Darajalari

```
┌─────────────────────────────────────────────────────────────┐
│                     Request Flow                             │
│                                                              │
│  Component ──► Store Cache ──► Memory Cache ──► HTTP Cache   │
│      │              │               │               │        │
│      ▼              ▼               ▼               ▼        │
│   Fastest      Very Fast         Fast           Network      │
│   (computed)    (Map)         (localStorage)     (API)       │
└─────────────────────────────────────────────────────────────┘
```

---

## In-Memory Caching

### Oddiy Map Cache

```javascript
// utils/cache.js
class SimpleCache {
  constructor() {
    this.cache = new Map()
  }

  get(key) {
    return this.cache.get(key)
  }

  set(key, value) {
    this.cache.set(key, value)
  }

  has(key) {
    return this.cache.has(key)
  }

  delete(key) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }
}

export const cache = new SimpleCache()
```

### TTL (Time-To-Live) Cache

```javascript
// utils/ttlCache.js
class TTLCache {
  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes
    this.cache = new Map()
    this.defaultTTL = defaultTTL
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl

    this.cache.set(key, {
      value,
      expiresAt
    })
  }

  get(key) {
    const item = this.cache.get(key)

    if (!item) {
      return undefined
    }

    // Expired?
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return undefined
    }

    return item.value
  }

  has(key) {
    return this.get(key) !== undefined
  }

  delete(key) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // Cleanup expired items
  prune() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  // Get remaining TTL
  getTTL(key) {
    const item = this.cache.get(key)
    if (!item) return 0

    const remaining = item.expiresAt - Date.now()
    return remaining > 0 ? remaining : 0
  }
}

export const cache = new TTLCache()
```

### LRU (Least Recently Used) Cache

```javascript
// utils/lruCache.js
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) {
      return undefined
    }

    // Move to end (most recently used)
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)

    return value
  }

  set(key, value) {
    // Remove if exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // Add to end
    this.cache.set(key, value)

    // Evict oldest if over limit
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
  }

  has(key) {
    return this.cache.has(key)
  }

  delete(key) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  get size() {
    return this.cache.size
  }
}

export const cache = new LRUCache(100)
```

### Pinia Store bilan Cache

```javascript
// stores/cache.js
import { defineStore } from 'pinia'

export const useCacheStore = defineStore('cache', {
  state: () => ({
    data: {},
    timestamps: {},
    ttl: 5 * 60 * 1000 // 5 minutes
  }),

  getters: {
    get: (state) => (key) => {
      const timestamp = state.timestamps[key]

      // Check expiry
      if (!timestamp || Date.now() - timestamp > state.ttl) {
        return null
      }

      return state.data[key]
    },

    isExpired: (state) => (key) => {
      const timestamp = state.timestamps[key]
      if (!timestamp) return true
      return Date.now() - timestamp > state.ttl
    }
  },

  actions: {
    set(key, value, customTTL) {
      this.data[key] = value
      this.timestamps[key] = Date.now()

      // Auto-expire
      if (customTTL) {
        setTimeout(() => {
          this.delete(key)
        }, customTTL)
      }
    },

    delete(key) {
      delete this.data[key]
      delete this.timestamps[key]
    },

    clear() {
      this.data = {}
      this.timestamps = {}
    },

    async getOrFetch(key, fetchFn) {
      const cached = this.get(key)
      if (cached !== null) {
        return cached
      }

      const data = await fetchFn()
      this.set(key, data)
      return data
    }
  }
})
```

---

## Persistent Caching

### LocalStorage Wrapper

```javascript
// utils/storage.js
class StorageCache {
  constructor(prefix = 'app_', storage = localStorage) {
    this.prefix = prefix
    this.storage = storage
  }

  _key(key) {
    return `${this.prefix}${key}`
  }

  get(key) {
    try {
      const item = this.storage.getItem(this._key(key))
      if (!item) return null

      const { value, expiresAt } = JSON.parse(item)

      if (expiresAt && Date.now() > expiresAt) {
        this.delete(key)
        return null
      }

      return value
    } catch (e) {
      console.error('Storage get error:', e)
      return null
    }
  }

  set(key, value, ttl = null) {
    try {
      const item = {
        value,
        expiresAt: ttl ? Date.now() + ttl : null,
        createdAt: Date.now()
      }

      this.storage.setItem(this._key(key), JSON.stringify(item))
      return true
    } catch (e) {
      console.error('Storage set error:', e)
      // Storage full - try to clear expired items
      this.prune()
      return false
    }
  }

  delete(key) {
    this.storage.removeItem(this._key(key))
  }

  clear() {
    // Only clear items with our prefix
    const keys = []
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key?.startsWith(this.prefix)) {
        keys.push(key)
      }
    }
    keys.forEach(key => this.storage.removeItem(key))
  }

  prune() {
    const now = Date.now()
    for (let i = this.storage.length - 1; i >= 0; i--) {
      const key = this.storage.key(i)
      if (!key?.startsWith(this.prefix)) continue

      try {
        const item = JSON.parse(this.storage.getItem(key))
        if (item.expiresAt && now > item.expiresAt) {
          this.storage.removeItem(key)
        }
      } catch (e) {
        // Invalid JSON - remove
        this.storage.removeItem(key)
      }
    }
  }
}

export const storage = new StorageCache('myapp_')
export const sessionCache = new StorageCache('myapp_', sessionStorage)
```

### IndexedDB Cache

```javascript
// utils/idbCache.js
import { openDB } from 'idb'

class IDBCache {
  constructor(dbName = 'appCache', storeName = 'cache') {
    this.dbName = dbName
    this.storeName = storeName
    this.dbPromise = this._initDB()
  }

  async _initDB() {
    return openDB(this.dbName, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' })
          store.createIndex('expiresAt', 'expiresAt')
        }
      }
    })
  }

  async get(key) {
    const db = await this.dbPromise
    const item = await db.get(this.storeName, key)

    if (!item) return null

    if (item.expiresAt && Date.now() > item.expiresAt) {
      await this.delete(key)
      return null
    }

    return item.value
  }

  async set(key, value, ttl = null) {
    const db = await this.dbPromise
    const item = {
      key,
      value,
      expiresAt: ttl ? Date.now() + ttl : null,
      createdAt: Date.now()
    }

    await db.put(this.storeName, item)
  }

  async delete(key) {
    const db = await this.dbPromise
    await db.delete(this.storeName, key)
  }

  async clear() {
    const db = await this.dbPromise
    await db.clear(this.storeName)
  }

  async prune() {
    const db = await this.dbPromise
    const tx = db.transaction(this.storeName, 'readwrite')
    const store = tx.objectStore(this.storeName)
    const index = store.index('expiresAt')

    const now = Date.now()
    let cursor = await index.openCursor()

    while (cursor) {
      if (cursor.value.expiresAt && cursor.value.expiresAt < now) {
        await cursor.delete()
      }
      cursor = await cursor.continue()
    }

    await tx.done
  }

  async getOrFetch(key, fetchFn, ttl = null) {
    const cached = await this.get(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetchFn()
    await this.set(key, data, ttl)
    return data
  }
}

export const idbCache = new IDBCache()
```

### Hybrid Cache (Memory + Storage)

```javascript
// utils/hybridCache.js
class HybridCache {
  constructor(options = {}) {
    this.memoryCache = new Map()
    this.memoryTTL = options.memoryTTL || 60 * 1000 // 1 minute
    this.storageTTL = options.storageTTL || 24 * 60 * 60 * 1000 // 24 hours
    this.prefix = options.prefix || 'cache_'
  }

  _memoryKey(key) {
    return key
  }

  _storageKey(key) {
    return `${this.prefix}${key}`
  }

  get(key) {
    // 1. Check memory cache first
    const memoryItem = this.memoryCache.get(this._memoryKey(key))
    if (memoryItem && Date.now() < memoryItem.expiresAt) {
      return memoryItem.value
    }

    // 2. Check localStorage
    try {
      const storageItem = localStorage.getItem(this._storageKey(key))
      if (storageItem) {
        const parsed = JSON.parse(storageItem)

        if (!parsed.expiresAt || Date.now() < parsed.expiresAt) {
          // Refresh memory cache
          this.memoryCache.set(this._memoryKey(key), {
            value: parsed.value,
            expiresAt: Date.now() + this.memoryTTL
          })

          return parsed.value
        }

        // Expired - clean up
        localStorage.removeItem(this._storageKey(key))
      }
    } catch (e) {
      console.error('Storage read error:', e)
    }

    return null
  }

  set(key, value, options = {}) {
    const memoryTTL = options.memoryTTL || this.memoryTTL
    const storageTTL = options.storageTTL || this.storageTTL
    const persist = options.persist !== false

    // Set in memory
    this.memoryCache.set(this._memoryKey(key), {
      value,
      expiresAt: Date.now() + memoryTTL
    })

    // Persist to storage
    if (persist) {
      try {
        localStorage.setItem(this._storageKey(key), JSON.stringify({
          value,
          expiresAt: Date.now() + storageTTL,
          createdAt: Date.now()
        }))
      } catch (e) {
        console.error('Storage write error:', e)
      }
    }
  }

  delete(key) {
    this.memoryCache.delete(this._memoryKey(key))
    localStorage.removeItem(this._storageKey(key))
  }

  clear() {
    this.memoryCache.clear()

    // Clear prefixed localStorage items
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    }
  }
}

export const hybridCache = new HybridCache()
```

---

## API Response Caching

### Basic API Cache

```javascript
// api/cachedApi.js
import { cache } from '@/utils/ttlCache'

class CachedAPI {
  constructor(baseURL, defaultTTL = 5 * 60 * 1000) {
    this.baseURL = baseURL
    this.defaultTTL = defaultTTL
  }

  _cacheKey(endpoint, params) {
    const paramStr = params ? JSON.stringify(params) : ''
    return `api:${endpoint}:${paramStr}`
  }

  async get(endpoint, params = null, options = {}) {
    const cacheKey = this._cacheKey(endpoint, params)
    const ttl = options.ttl ?? this.defaultTTL
    const forceRefresh = options.forceRefresh ?? false

    // Check cache
    if (!forceRefresh) {
      const cached = cache.get(cacheKey)
      if (cached) {
        return cached
      }
    }

    // Fetch from API
    const url = new URL(endpoint, this.baseURL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Cache response
    if (ttl > 0) {
      cache.set(cacheKey, data, ttl)
    }

    return data
  }

  invalidate(endpoint, params = null) {
    const cacheKey = this._cacheKey(endpoint, params)
    cache.delete(cacheKey)
  }

  invalidateAll(endpoint) {
    // Invalidate all cached responses for this endpoint
    for (const key of cache.cache.keys()) {
      if (key.startsWith(`api:${endpoint}`)) {
        cache.delete(key)
      }
    }
  }
}

export const api = new CachedAPI('https://api.example.com')
```

### Pinia Store bilan API Cache

```javascript
// stores/products.js
import { defineStore } from 'pinia'

export const useProductStore = defineStore('products', {
  state: () => ({
    // Data
    products: [],
    productDetails: {},

    // Cache metadata
    lastFetch: null,
    detailsFetchTime: {},

    // Config
    cacheTimeout: 5 * 60 * 1000 // 5 minutes
  }),

  getters: {
    isStale: (state) => {
      if (!state.lastFetch) return true
      return Date.now() - state.lastFetch > state.cacheTimeout
    },

    isDetailStale: (state) => (productId) => {
      const fetchTime = state.detailsFetchTime[productId]
      if (!fetchTime) return true
      return Date.now() - fetchTime > state.cacheTimeout
    },

    getProductById: (state) => (id) => {
      return state.productDetails[id] || state.products.find(p => p.id === id)
    }
  },

  actions: {
    async fetchProducts(forceRefresh = false) {
      // Return cached if fresh
      if (!forceRefresh && !this.isStale && this.products.length > 0) {
        return this.products
      }

      const response = await api.get('/products')
      this.products = response.data
      this.lastFetch = Date.now()

      return this.products
    },

    async fetchProductDetails(productId, forceRefresh = false) {
      // Return cached if fresh
      if (!forceRefresh && !this.isDetailStale(productId)) {
        const cached = this.productDetails[productId]
        if (cached) return cached
      }

      const response = await api.get(`/products/${productId}`)
      this.productDetails[productId] = response.data
      this.detailsFetchTime[productId] = Date.now()

      return response.data
    },

    invalidateProducts() {
      this.lastFetch = null
    },

    invalidateProductDetails(productId) {
      delete this.detailsFetchTime[productId]
    }
  }
})
```

### Request Deduplication

```javascript
// utils/requestDedup.js
class RequestDeduplicator {
  constructor() {
    this.pending = new Map()
  }

  async dedupe(key, requestFn) {
    // Check if request already in flight
    if (this.pending.has(key)) {
      return this.pending.get(key)
    }

    // Create promise and store
    const promise = requestFn()
      .finally(() => {
        // Clean up after completion
        this.pending.delete(key)
      })

    this.pending.set(key, promise)
    return promise
  }
}

export const dedup = new RequestDeduplicator()

// Usage
async function fetchUser(id) {
  return dedup.dedupe(`user:${id}`, async () => {
    const response = await api.get(`/users/${id}`)
    return response.data
  })
}

// 3 components call fetchUser(123) simultaneously
// Only 1 API request is made
// All 3 receive the same result
```

---

## Cache Invalidation

Cache invalidation - eng qiyin muammo. Qachon cache'ni yangilash kerak?

### Manual Invalidation

```javascript
// stores/posts.js
export const usePostStore = defineStore('posts', {
  state: () => ({
    posts: [],
    lastFetch: null
  }),

  actions: {
    async fetchPosts() {
      if (!this.isStale) return this.posts

      const response = await api.get('/posts')
      this.posts = response.data
      this.lastFetch = Date.now()
      return this.posts
    },

    async createPost(postData) {
      const response = await api.post('/posts', postData)

      // Option 1: Add to cache
      this.posts.unshift(response.data)

      // Option 2: Invalidate cache
      // this.lastFetch = null

      return response.data
    },

    async updatePost(id, updates) {
      const response = await api.patch(`/posts/${id}`, updates)

      // Update in cache
      const index = this.posts.findIndex(p => p.id === id)
      if (index !== -1) {
        this.posts[index] = response.data
      }

      return response.data
    },

    async deletePost(id) {
      await api.delete(`/posts/${id}`)

      // Remove from cache
      this.posts = this.posts.filter(p => p.id !== id)
    },

    // Manual invalidation
    invalidate() {
      this.lastFetch = null
    }
  }
})
```

### Event-Based Invalidation

```javascript
// utils/cacheEvents.js
import mitt from 'mitt'

export const cacheEvents = mitt()

// Events
export const CACHE_EVENTS = {
  USER_UPDATED: 'user:updated',
  POST_CREATED: 'post:created',
  POST_DELETED: 'post:deleted',
  CART_CHANGED: 'cart:changed'
}

// Store listening to events
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    lastFetch: null
  }),

  actions: {
    setupListeners() {
      cacheEvents.on(CACHE_EVENTS.USER_UPDATED, () => {
        this.lastFetch = null
        this.fetchUser()
      })
    },

    async updateProfile(updates) {
      const response = await api.patch('/user/profile', updates)
      this.user = response.data

      // Emit event for other stores
      cacheEvents.emit(CACHE_EVENTS.USER_UPDATED, response.data)
    }
  }
})

// Initialize in app
const userStore = useUserStore()
userStore.setupListeners()
```

### Tag-Based Invalidation

```javascript
// utils/taggedCache.js
class TaggedCache {
  constructor() {
    this.cache = new Map()
    this.tags = new Map() // tag -> Set of keys
  }

  set(key, value, tags = []) {
    this.cache.set(key, value)

    // Associate tags
    tags.forEach(tag => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set())
      }
      this.tags.get(tag).add(key)
    })
  }

  get(key) {
    return this.cache.get(key)
  }

  invalidateTag(tag) {
    const keys = this.tags.get(tag)
    if (!keys) return

    keys.forEach(key => {
      this.cache.delete(key)
    })

    this.tags.delete(tag)
  }

  invalidateTags(tags) {
    tags.forEach(tag => this.invalidateTag(tag))
  }
}

export const taggedCache = new TaggedCache()

// Usage
taggedCache.set('user:123', userData, ['users', 'user:123'])
taggedCache.set('user:123:posts', userPosts, ['users', 'user:123', 'posts'])
taggedCache.set('all-posts', allPosts, ['posts'])

// User updated - invalidate all their data
taggedCache.invalidateTag('user:123')

// All posts need refresh
taggedCache.invalidateTag('posts')
```

---

## Stale-While-Revalidate Pattern

Eskirgan ma'lumotni ko'rsatib, fonda yangilash.

### Basic SWR

```javascript
// composables/useSWR.js
import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useSWR(key, fetcher, options = {}) {
  const {
    ttl = 5 * 60 * 1000,
    dedupe = true,
    refreshInterval = 0,
    revalidateOnFocus = true,
    revalidateOnReconnect = true
  } = options

  const data = ref(null)
  const error = ref(null)
  const isValidating = ref(false)

  const cache = new Map()
  const pending = new Map()

  const isStale = computed(() => {
    const cached = cache.get(key)
    if (!cached) return true
    return Date.now() - cached.timestamp > ttl
  })

  async function revalidate() {
    // Dedupe concurrent requests
    if (dedupe && pending.has(key)) {
      return pending.get(key)
    }

    isValidating.value = true

    const promise = (async () => {
      try {
        const result = await fetcher()

        data.value = result
        error.value = null

        cache.set(key, {
          data: result,
          timestamp: Date.now()
        })

        return result
      } catch (e) {
        error.value = e
        throw e
      } finally {
        isValidating.value = false
        pending.delete(key)
      }
    })()

    if (dedupe) {
      pending.set(key, promise)
    }

    return promise
  }

  function mutate(newData) {
    data.value = newData
    cache.set(key, {
      data: newData,
      timestamp: Date.now()
    })
  }

  // Initial load
  onMounted(() => {
    // Return cached data immediately
    const cached = cache.get(key)
    if (cached) {
      data.value = cached.data
    }

    // Revalidate in background if stale
    if (isStale.value) {
      revalidate()
    }

    // Focus revalidation
    if (revalidateOnFocus) {
      window.addEventListener('focus', revalidate)
    }

    // Reconnect revalidation
    if (revalidateOnReconnect) {
      window.addEventListener('online', revalidate)
    }

    // Interval revalidation
    let intervalId
    if (refreshInterval > 0) {
      intervalId = setInterval(revalidate, refreshInterval)
    }
  })

  onUnmounted(() => {
    if (revalidateOnFocus) {
      window.removeEventListener('focus', revalidate)
    }
    if (revalidateOnReconnect) {
      window.removeEventListener('online', revalidate)
    }
  })

  return {
    data,
    error,
    isValidating,
    isStale,
    revalidate,
    mutate
  }
}
```

### Usage

```vue
<script setup>
import { useSWR } from '@/composables/useSWR'
import { api } from '@/api'

const {
  data: user,
  error,
  isValidating,
  revalidate
} = useSWR('user', () => api.get('/user/profile'), {
  ttl: 60 * 1000,
  revalidateOnFocus: true
})
</script>

<template>
  <div>
    <div v-if="error">Error: {{ error.message }}</div>

    <div v-else-if="user">
      <p>{{ user.name }}</p>
      <span v-if="isValidating">Updating...</span>
    </div>

    <div v-else>Loading...</div>

    <button @click="revalidate">Refresh</button>
  </div>
</template>
```

### TanStack Query (Vue Query)

```javascript
// Recommended: Use @tanstack/vue-query
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

// Query - automatic caching, SWR, dedup
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => api.get(`/users/${userId}`),
  staleTime: 5 * 60 * 1000,
  cacheTime: 30 * 60 * 1000,
  refetchOnWindowFocus: true
})

// Mutation with cache invalidation
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: (data) => api.patch('/user/profile', data),
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['user'] })
  }
})
```

---

## To'g'ri va Noto'g'ri Yondashuvlar

### 1. Over-Caching

```javascript
// NOTO'G'RI - hamma narsani cache qilish
async function fetchData() {
  const cached = localStorage.getItem('all-data')
  if (cached) return JSON.parse(cached)

  const data = await api.get('/data')
  localStorage.setItem('all-data', JSON.stringify(data))
  return data
}
// Muammo: data eskiradi, foydalanuvchi sezmaydi

// TO'G'RI - TTL bilan
async function fetchData() {
  const cached = cache.get('all-data')
  if (cached) return cached

  const data = await api.get('/data')
  cache.set('all-data', data, 5 * 60 * 1000) // 5 min
  return data
}
```

### 2. Under-Caching

```javascript
// NOTO'G'RI - cache yo'q
async function fetchProducts() {
  // Har safar API call
  return api.get('/products')
}

// TO'G'RI - cache bilan
async function fetchProducts(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = cache.get('products')
    if (cached) return cached
  }

  const data = await api.get('/products')
  cache.set('products', data)
  return data
}
```

### 3. Cache Key Management

```javascript
// NOTO'G'RI - noaniq key
cache.set('data', response) // Qaysi data?

// TO'G'RI - aniq, unique key
cache.set(`products:${categoryId}:page:${page}`, response)
cache.set(`user:${userId}:profile`, response)

// Helper function
function cacheKey(resource, params = {}) {
  const paramStr = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(':')

  return paramStr ? `${resource}:${paramStr}` : resource
}

// Usage
cacheKey('products', { category: 'electronics', page: 2 })
// => 'products:category:electronics:page:2'
```

### 4. Stale Data Problems

```javascript
// NOTO'G'RI - stale data ko'rsatiladi, foydalanuvchi bilmaydi
const cached = cache.get('user')
if (cached) {
  this.user = cached
  return
}

// TO'G'RI - stale indicator + background refresh
const cached = cache.get('user')
if (cached) {
  this.user = cached.data
  this.isStale = Date.now() - cached.timestamp > 60000

  // Background refresh if stale
  if (this.isStale) {
    this.fetchUser()
  }
}
```

### 5. Memory Leaks

```javascript
// NOTO'G'RI - cleanup yo'q
const cache = new Map()

function cacheResponse(key, data) {
  cache.set(key, data)
  // Cache cheksiz o'sadi!
}

// TO'G'RI - LRU yoki TTL bilan
const cache = new LRUCache(100) // Max 100 items

// yoki TTL bilan
const cache = new TTLCache(5 * 60 * 1000) // 5 min

// yoki periodic cleanup
setInterval(() => {
  cache.prune()
}, 60 * 1000)
```

---

## Real-World Patterns

### 1. Multi-Layer Cache

```javascript
// utils/multiLayerCache.js
class MultiLayerCache {
  constructor() {
    this.l1 = new Map() // Memory - fastest
    this.l2 = localStorage // Persist - slower
    this.l1TTL = 60 * 1000 // 1 min
    this.l2TTL = 24 * 60 * 60 * 1000 // 24 hours
  }

  get(key) {
    // L1 - Memory
    const l1Item = this.l1.get(key)
    if (l1Item && Date.now() < l1Item.expiresAt) {
      return l1Item.value
    }

    // L2 - LocalStorage
    const l2Raw = this.l2.getItem(`cache:${key}`)
    if (l2Raw) {
      try {
        const l2Item = JSON.parse(l2Raw)
        if (Date.now() < l2Item.expiresAt) {
          // Promote to L1
          this.l1.set(key, {
            value: l2Item.value,
            expiresAt: Date.now() + this.l1TTL
          })
          return l2Item.value
        }
      } catch (e) {}
    }

    return null
  }

  set(key, value) {
    // Write to both layers
    this.l1.set(key, {
      value,
      expiresAt: Date.now() + this.l1TTL
    })

    this.l2.setItem(`cache:${key}`, JSON.stringify({
      value,
      expiresAt: Date.now() + this.l2TTL
    }))
  }

  invalidate(key) {
    this.l1.delete(key)
    this.l2.removeItem(`cache:${key}`)
  }
}
```

### 2. Optimistic Cache Update

```javascript
// stores/todos.js
export const useTodoStore = defineStore('todos', {
  state: () => ({
    todos: []
  }),

  actions: {
    async addTodo(text) {
      // Create optimistic todo
      const optimisticTodo = {
        id: `temp-${Date.now()}`,
        text,
        completed: false,
        _optimistic: true
      }

      // Add to state immediately
      this.todos.push(optimisticTodo)

      try {
        // Send to server
        const response = await api.post('/todos', { text })

        // Replace optimistic with real
        const index = this.todos.findIndex(t => t.id === optimisticTodo.id)
        if (index !== -1) {
          this.todos[index] = response.data
        }

        return response.data
      } catch (error) {
        // Rollback on error
        this.todos = this.todos.filter(t => t.id !== optimisticTodo.id)
        throw error
      }
    },

    async toggleTodo(id) {
      const todo = this.todos.find(t => t.id === id)
      if (!todo) return

      // Save original state
      const originalCompleted = todo.completed

      // Optimistic update
      todo.completed = !todo.completed

      try {
        await api.patch(`/todos/${id}`, { completed: todo.completed })
      } catch (error) {
        // Rollback
        todo.completed = originalCompleted
        throw error
      }
    },

    async deleteTodo(id) {
      const index = this.todos.findIndex(t => t.id === id)
      if (index === -1) return

      // Save for rollback
      const deletedTodo = this.todos[index]

      // Optimistic delete
      this.todos.splice(index, 1)

      try {
        await api.delete(`/todos/${id}`)
      } catch (error) {
        // Rollback
        this.todos.splice(index, 0, deletedTodo)
        throw error
      }
    }
  }
})
```

### 3. Pagination Cache

```javascript
// stores/feed.js
export const useFeedStore = defineStore('feed', {
  state: () => ({
    pages: {}, // { 1: [...], 2: [...] }
    pagesFetchTime: {},
    currentPage: 1,
    hasMore: true,
    isLoading: false
  }),

  getters: {
    allItems() {
      // Flatten all pages
      return Object.keys(this.pages)
        .sort((a, b) => Number(a) - Number(b))
        .flatMap(page => this.pages[page])
    },

    isPageStale: (state) => (page) => {
      const fetchTime = state.pagesFetchTime[page]
      if (!fetchTime) return true
      return Date.now() - fetchTime > 5 * 60 * 1000
    }
  },

  actions: {
    async fetchPage(page, forceRefresh = false) {
      // Return cached if fresh
      if (!forceRefresh && !this.isPageStale(page) && this.pages[page]) {
        return this.pages[page]
      }

      this.isLoading = true

      try {
        const response = await api.get('/feed', { params: { page, limit: 20 } })

        this.pages[page] = response.data.items
        this.pagesFetchTime[page] = Date.now()
        this.hasMore = response.data.hasMore

        return response.data.items
      } finally {
        this.isLoading = false
      }
    },

    async loadMore() {
      if (!this.hasMore || this.isLoading) return

      this.currentPage++
      return this.fetchPage(this.currentPage)
    },

    async refresh() {
      // Clear all pages
      this.pages = {}
      this.pagesFetchTime = {}
      this.currentPage = 1
      this.hasMore = true

      return this.fetchPage(1)
    },

    prependItem(item) {
      // Add new item to first page
      if (this.pages[1]) {
        this.pages[1] = [item, ...this.pages[1]]
      }
    }
  }
})
```

### 4. Entity Normalization Cache

```javascript
// stores/entities.js
export const useEntityStore = defineStore('entities', {
  state: () => ({
    // Normalized entities
    users: {},
    posts: {},
    comments: {},

    // Fetch timestamps
    fetchTimes: {
      users: {},
      posts: {},
      comments: {}
    }
  }),

  getters: {
    getUser: (state) => (id) => state.users[id],
    getPost: (state) => (id) => state.posts[id],

    getPostWithAuthor: (state) => (postId) => {
      const post = state.posts[postId]
      if (!post) return null

      return {
        ...post,
        author: state.users[post.authorId]
      }
    },

    isEntityStale: (state) => (type, id) => {
      const fetchTime = state.fetchTimes[type]?.[id]
      if (!fetchTime) return true
      return Date.now() - fetchTime > 5 * 60 * 1000
    }
  },

  actions: {
    // Normalize and cache entities from any response
    cacheEntities(data) {
      const now = Date.now()

      // Handle single entity
      if (data.user) {
        this.users[data.user.id] = data.user
        this.fetchTimes.users[data.user.id] = now
      }

      // Handle arrays
      if (data.users) {
        data.users.forEach(user => {
          this.users[user.id] = user
          this.fetchTimes.users[user.id] = now
        })
      }

      if (data.posts) {
        data.posts.forEach(post => {
          this.posts[post.id] = post
          this.fetchTimes.posts[post.id] = now

          // Also cache embedded author
          if (post.author) {
            this.users[post.author.id] = post.author
            this.fetchTimes.users[post.author.id] = now
          }
        })
      }
    },

    async fetchUser(id, forceRefresh = false) {
      if (!forceRefresh && !this.isEntityStale('users', id)) {
        return this.users[id]
      }

      const response = await api.get(`/users/${id}`)
      this.cacheEntities({ user: response.data })
      return response.data
    },

    async fetchPost(id, forceRefresh = false) {
      if (!forceRefresh && !this.isEntityStale('posts', id)) {
        return this.getPostWithAuthor(id)
      }

      const response = await api.get(`/posts/${id}`)
      this.cacheEntities({ posts: [response.data] })
      return this.getPostWithAuthor(id)
    }
  }
})
```

---

## Interview Savollari

### 1. Cache invalidation strategiyalari qanday?

**Javob:**

```javascript
// 1. TIME-BASED (TTL)
cache.set('data', value, 5 * 60 * 1000) // 5 min expiry

// 2. EVENT-BASED
eventBus.on('user:updated', () => {
  cache.delete('user')
})

// 3. MANUAL
async function updateUser(data) {
  await api.patch('/user', data)
  cache.delete('user') // Manual invalidation
}

// 4. TAG-BASED
cache.set('post:1', post, ['posts', 'user:1:posts'])
cache.invalidateTag('posts') // Invalidate all posts

// 5. VERSION-BASED
const cacheKey = `data:${version}`
// Version o'zgarsa, yangi key

// 6. WRITE-THROUGH
async function updateUser(data) {
  const result = await api.patch('/user', data)
  cache.set('user', result.data) // Update cache immediately
}
```

**Eng qiyin muammo:**
> "There are only two hard things in Computer Science: cache invalidation and naming things."

---

### 2. Stale-While-Revalidate pattern nima?

**Javob:**

SWR - eskirgan cache'dan javob berib, fonda yangi ma'lumot olish.

```
Traditional:
Request ──► Check Cache ──► Cache Miss ──► Fetch ──► Wait... ──► Response
                                                      │
                                                   (slow)

SWR:
Request ──► Check Cache ──► Return Stale ──► Response (instant!)
                │
                └──► Background Fetch ──► Update Cache ──► Update UI
```

```javascript
async function fetchWithSWR(key, fetcher) {
  const cached = cache.get(key)

  if (cached) {
    // Return stale immediately
    updateUI(cached.data)

    // Check if needs revalidation
    if (isStale(cached)) {
      // Revalidate in background
      fetcher().then(data => {
        cache.set(key, data)
        updateUI(data)
      })
    }
  } else {
    // No cache - must wait
    const data = await fetcher()
    cache.set(key, data)
    updateUI(data)
  }
}
```

**Afzalliklari:**
1. Instant response (from cache)
2. Eventually fresh data
3. Better UX

---

### 3. Memory leak cache'da qanday oldini olish mumkin?

**Javob:**

```javascript
// 1. LRU CACHE - eng kam ishlatilganini o'chirish
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize
    this.cache = new Map()
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest (first item)
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }
}

// 2. TTL CACHE - vaqt o'tsa o'chirish
class TTLCache {
  set(key, value, ttl) {
    this.cache.set(key, { value, expiresAt: Date.now() + ttl })
  }

  get(key) {
    const item = this.cache.get(key)
    if (item && Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return item?.value
  }
}

// 3. PERIODIC CLEANUP
setInterval(() => {
  cache.prune() // Remove expired items
}, 60 * 1000)

// 4. WEAK MAP (for object keys)
const cache = new WeakMap()
// Object garbage collected -> cache entry removed

// 5. SIZE LIMIT
const MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB

function checkSize() {
  const size = JSON.stringify([...cache.entries()]).length
  if (size > MAX_CACHE_SIZE) {
    cache.prune()
  }
}
```

---

### 4. Optimistic update nima va qanday implement qilinadi?

**Javob:**

Optimistic update - server javobini kutmasdan UI'ni yangilash.

```javascript
// Traditional - pessimistic
async function likePost(postId) {
  // 1. Send request
  await api.post(`/posts/${postId}/like`)
  // 2. Wait for response...
  // 3. Update UI after success
  post.likes++
}
// UX: User clicks → waits → sees change (slow)

// Optimistic
async function likePost(postId) {
  const originalLikes = post.likes

  // 1. Update UI immediately
  post.likes++

  try {
    // 2. Send request in background
    await api.post(`/posts/${postId}/like`)
  } catch (error) {
    // 3. Rollback on error
    post.likes = originalLikes
    showError('Failed to like')
  }
}
// UX: User clicks → sees change instantly → (request in background)
```

**Implement qilish:**
```javascript
actions: {
  async updateItem(id, updates) {
    // 1. Save original
    const item = this.items.find(i => i.id === id)
    const original = { ...item }

    // 2. Optimistic update
    Object.assign(item, updates)
    item._pending = true

    try {
      // 3. API call
      const response = await api.patch(`/items/${id}`, updates)

      // 4. Apply server response
      Object.assign(item, response.data)
      delete item._pending
    } catch (error) {
      // 5. Rollback
      Object.assign(item, original)
      delete item._pending
      throw error
    }
  }
}
```

---

### 5. LocalStorage va IndexedDB qachon ishlatiladi?

**Javob:**

| Xususiyat | LocalStorage | IndexedDB |
|-----------|--------------|-----------|
| Hajm | 5-10MB | 50MB+ |
| API | Sinxron | Asinxron |
| Data type | String only | Any (Blob, File) |
| Query | Key only | Index, cursor |
| Transaction | Yo'q | Ha |

```javascript
// LOCALSTORAGE - kichik, sodda data
// - User preferences
// - Auth tokens
// - Simple cache
localStorage.setItem('theme', 'dark')
localStorage.setItem('token', 'abc123')
localStorage.setItem('cache:user', JSON.stringify(user))

// INDEXEDDB - katta, murakkab data
// - Offline data sync
// - Large datasets
// - Binary data (images, files)
// - Complex queries
const db = await openDB('myApp', 1)
await db.put('documents', largeDocument)
await db.put('images', imageBlob)

// Query with index
const posts = await db
  .transaction('posts')
  .store
  .index('authorId')
  .getAll(userId)
```

**Tavsiya:**
- Kichik config/settings → LocalStorage
- Katta data/offline → IndexedDB
- API cache → Memory + LocalStorage hybrid

---

## Qachon Qanday Caching Tanlash

### Memory Cache
- **Qachon:** Tez kirish kerak, persist kerak emas
- **Misol:** API response, computed results
- **Hajm:** Kichik-o'rta

### LocalStorage
- **Qachon:** Persist kerak, kichik data
- **Misol:** Settings, tokens, simple cache
- **Hajm:** < 5MB

### IndexedDB
- **Qachon:** Katta data, offline support
- **Misol:** Documents, images, sync data
- **Hajm:** 50MB+

### HTTP Cache
- **Qachon:** Static assets, API responses
- **Misol:** Images, CSS, GET requests
- **Hajm:** Browser managed

---

## Xulosa

Samarali caching:

1. **Kerakli joyda** - hamma narsani cache qilmang
2. **To'g'ri TTL** - data freshness vs performance
3. **Invalidation strategy** - eskirgan data = xato
4. **Memory management** - LRU, TTL, cleanup
5. **User feedback** - stale indicator, loading state

Cache = tezlik + murakkablik trade-off. Ehtiyotkorlik bilan ishlating.
