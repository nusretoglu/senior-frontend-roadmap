# Global vs Local State

## Mundarija
1. [Kirish](#kirish)
2. [Local State Nima?](#local-state-nima)
3. [Global State Nima?](#global-state-nima)
4. [Qachon Qaysi Birini Tanlash](#qachon-qaysi-birini-tanlash)
5. [State Lifting Pattern](#state-lifting-pattern)
6. [Provide/Inject Pattern](#provideinject-pattern)
7. [Composables bilan State Management](#composables-bilan-state-management)
8. [To'g'ri va Noto'g'ri Yondashuvlar](#togri-va-notogri-yondashuvlar)
9. [Real-World Patterns](#real-world-patterns)
10. [Interview Savollari](#interview-savollari)

---

## Kirish

State management'da eng muhim qaror - bu state'ni qayerda saqlash. Noto'g'ri qaror:
- Keraksiz murakkablik
- Performance muammolari
- Debugging qiyinlashuvi
- Code maintenance muammolari

```
┌─────────────────────────────────────────────────────────────┐
│                      STATE SPECTRUM                         │
│                                                             │
│  Local ◄──────────────────────────────────────────► Global  │
│                                                             │
│  ref()    props     provide/    composable    pinia/vuex   │
│  reactive emit      inject      with state    store        │
│                                                             │
│  Scope:   Scope:    Scope:      Scope:        Scope:       │
│  1 comp   parent-   subtree     multiple      entire app   │
│           child                  comps                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Local State Nima?

Local state - faqat bitta komponent ichida saqlanadigan va boshqariladigan holat.

### Options API bilan

```vue
<script>
export default {
  data() {
    return {
      // Local state
      count: 0,
      isOpen: false,
      formData: {
        name: '',
        email: ''
      },
      items: []
    }
  },

  methods: {
    increment() {
      this.count++
    },

    toggleModal() {
      this.isOpen = !this.isOpen
    },

    submitForm() {
      // formData bilan ish
    }
  }
}
</script>
```

### Composition API bilan

```vue
<script setup>
import { ref, reactive, computed } from 'vue'

// Local state
const count = ref(0)
const isOpen = ref(false)

const formData = reactive({
  name: '',
  email: ''
})

const items = ref([])

// Local computed
const doubleCount = computed(() => count.value * 2)

// Local methods
function increment() {
  count.value++
}

function toggleModal() {
  isOpen.value = !isOpen.value
}
</script>
```

### Local State Foydalanish Holatlari

1. **UI State** - modal ochiq/yopiq, tab tanlovi, accordion holati
2. **Form State** - input qiymatlari, validation xatolari
3. **Temporary State** - loading, hover, focus
4. **Component-specific** - faqat shu komponentga tegishli ma'lumot

```vue
<script setup>
import { ref, computed } from 'vue'

// UI State - faqat bu komponentga kerak
const isDropdownOpen = ref(false)
const activeTab = ref('details')
const isHovered = ref(false)

// Form State - forma faqat bu yerda
const searchQuery = ref('')
const filters = reactive({
  category: null,
  priceRange: [0, 1000],
  sortBy: 'newest'
})

// Validation
const errors = ref({})

// Temporary State
const isSubmitting = ref(false)

// Computed - local state'ga bog'liq
const hasFilters = computed(() =>
  filters.category || filters.priceRange[0] > 0 || filters.priceRange[1] < 1000
)
</script>
```

---

## Global State Nima?

Global state - butun ilova bo'ylab ishlatilishi kerak bo'lgan holat.

### Pinia bilan

```javascript
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    // Global user state - hamma joyda kerak
    profile: null,
    isAuthenticated: false,
    permissions: [],
    preferences: {
      theme: 'light',
      language: 'uz',
      notifications: true
    }
  }),

  getters: {
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    },

    isAdmin() {
      return this.hasPermission('admin')
    }
  },

  actions: {
    async login(credentials) {
      const response = await api.login(credentials)
      this.profile = response.data.user
      this.isAuthenticated = true
      this.permissions = response.data.permissions
    },

    logout() {
      this.profile = null
      this.isAuthenticated = false
      this.permissions = []
    }
  }
})
```

### Global State Foydalanish Holatlari

1. **User/Auth State** - login holati, profil, permissions
2. **App Settings** - theme, language, preferences
3. **Shared Data** - ko'p komponentda kerak bo'lgan ma'lumot
4. **Cache** - API response'larni keshlash
5. **Notifications** - global notification queue

```javascript
// stores/app.js
export const useAppStore = defineStore('app', {
  state: () => ({
    // Theme - hamma joyda kerak
    theme: 'light',

    // Language - hamma joyda kerak
    locale: 'uz',

    // Sidebar state - layout'da kerak
    isSidebarOpen: true,

    // Global notifications
    notifications: [],

    // Feature flags
    features: {
      darkMode: true,
      newDashboard: false
    }
  })
})

// stores/cart.js
export const useCartStore = defineStore('cart', {
  state: () => ({
    // Cart - header, sidebar, checkout'da kerak
    items: [],

    // Discount code
    appliedCoupon: null
  }),

  getters: {
    itemCount: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),

    subtotal: (state) => state.items.reduce(
      (sum, i) => sum + i.price * i.quantity, 0
    ),

    total() {
      const discount = this.appliedCoupon?.discount || 0
      return this.subtotal * (1 - discount / 100)
    }
  }
})
```

---

## Qachon Qaysi Birini Tanlash

### Decision Tree

```
Ma'lumot kerakmi?
    │
    ├─► Faqat 1 komponentda? ──► LOCAL STATE (ref/reactive)
    │
    ├─► Parent-child o'rtasida? ──► PROPS/EMIT
    │
    ├─► Bir nechta sibling komponentda?
    │       │
    │       ├─► Yaqin komponentlar? ──► LIFT STATE UP
    │       │
    │       └─► Uzoq komponentlar? ──► PROVIDE/INJECT yoki STORE
    │
    ├─► Chuqur nested komponentlarda? ──► PROVIDE/INJECT
    │
    └─► Butun ilovada? ──► GLOBAL STORE (Pinia/Vuex)
```

### Local State Tanlang Qachon:

| Holat | Misol |
|-------|-------|
| UI holati | Modal ochiq/yopiq, dropdown |
| Forma qiymatlari | Input values, validation |
| Vaqtinchalik holat | Loading, hover, animation |
| Komponent-specific | Local filter, sort |

```vue
<!-- LOCAL - to'g'ri -->
<script setup>
// Modal holati - faqat bu komponentda
const isModalOpen = ref(false)

// Form validation - faqat forma komponentida
const errors = reactive({
  email: null,
  password: null
})

// Hover holati - faqat bu element uchun
const isHovered = ref(false)
</script>
```

### Global State Tanlang Qachon:

| Holat | Misol |
|-------|-------|
| User/Auth | Profile, permissions, token |
| App-wide | Theme, language, settings |
| Shared data | Cart, wishlist |
| Cache | API response cache |

```javascript
// GLOBAL - to'g'ri
export const useAuthStore = defineStore('auth', {
  state: () => ({
    // User - hamma joyda kerak
    user: null,

    // Token - API calls uchun
    token: null,

    // Permissions - route guard, UI uchun
    permissions: []
  })
})
```

### Anti-Patterns

```javascript
// NOTO'G'RI - local bo'lishi kerak edi
export const useModalStore = defineStore('modal', {
  state: () => ({
    isOpen: false,
    content: null
  })
})
// Bu modal faqat bitta joyda ishlatiladi

// NOTO'G'RI - global bo'lishi kerak edi
const UserCard = {
  data() {
    return {
      user: null // Har komponent o'zi fetch qiladi
    }
  },
  async mounted() {
    this.user = await api.getUser()
  }
}
// User ma'lumoti 10 ta komponentda takrorlanadi
```

---

## State Lifting Pattern

Ikkita sibling komponent state'ni almashishi kerak bo'lganda, state'ni umumiy parent'ga ko'tarish.

### Muammo

```
┌─────────────────────────────────────────────┐
│                  Parent                      │
│  ┌─────────────────┐  ┌─────────────────┐   │
│  │  ComponentA     │  │  ComponentB     │   │
│  │                 │  │                 │   │
│  │  count = 5  ?───┼──┼─► count = ?     │   │
│  │                 │  │                 │   │
│  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────┘
ComponentA'dan ComponentB'ga ma'lumot qanday o'tadi?
```

### Yechim - State Lifting

```
┌─────────────────────────────────────────────┐
│                  Parent                      │
│              count = 5                       │
│                  │                           │
│        ┌─────────┴─────────┐                │
│        ▼                   ▼                │
│  ┌─────────────┐     ┌─────────────┐        │
│  │ ComponentA  │     │ ComponentB  │        │
│  │ :count="5"  │     │ :count="5"  │        │
│  │ @update     │     │             │        │
│  └─────────────┘     └─────────────┘        │
└─────────────────────────────────────────────┘
```

### Kod Misoli

```vue
<!-- Parent.vue -->
<script setup>
import { ref } from 'vue'
import Counter from './Counter.vue'
import Display from './Display.vue'

// Lifted state - ikkala child uchun
const count = ref(0)

function increment() {
  count.value++
}

function decrement() {
  count.value--
}
</script>

<template>
  <div class="parent">
    <Counter
      :count="count"
      @increment="increment"
      @decrement="decrement"
    />
    <Display :count="count" />
  </div>
</template>
```

```vue
<!-- Counter.vue -->
<script setup>
defineProps({
  count: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['increment', 'decrement'])
</script>

<template>
  <div class="counter">
    <button @click="emit('decrement')">-</button>
    <span>{{ count }}</span>
    <button @click="emit('increment')">+</button>
  </div>
</template>
```

```vue
<!-- Display.vue -->
<script setup>
defineProps({
  count: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <div class="display">
    <p>Current count: {{ count }}</p>
    <p>Double: {{ count * 2 }}</p>
  </div>
</template>
```

### Murakkab Misol - Todo List

```vue
<!-- TodoApp.vue -->
<script setup>
import { ref, computed } from 'vue'
import TodoInput from './TodoInput.vue'
import TodoList from './TodoList.vue'
import TodoFilters from './TodoFilters.vue'
import TodoStats from './TodoStats.vue'

// Lifted state
const todos = ref([
  { id: 1, text: 'Learn Vue', completed: true },
  { id: 2, text: 'Build app', completed: false }
])

const filter = ref('all') // 'all' | 'active' | 'completed'

// Derived state
const filteredTodos = computed(() => {
  switch (filter.value) {
    case 'active':
      return todos.value.filter(t => !t.completed)
    case 'completed':
      return todos.value.filter(t => t.completed)
    default:
      return todos.value
  }
})

const stats = computed(() => ({
  total: todos.value.length,
  completed: todos.value.filter(t => t.completed).length,
  active: todos.value.filter(t => !t.completed).length
}))

// Actions
function addTodo(text) {
  todos.value.push({
    id: Date.now(),
    text,
    completed: false
  })
}

function toggleTodo(id) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
}

function deleteTodo(id) {
  todos.value = todos.value.filter(t => t.id !== id)
}

function clearCompleted() {
  todos.value = todos.value.filter(t => !t.completed)
}
</script>

<template>
  <div class="todo-app">
    <TodoInput @add="addTodo" />

    <TodoFilters
      :current="filter"
      @change="filter = $event"
    />

    <TodoList
      :todos="filteredTodos"
      @toggle="toggleTodo"
      @delete="deleteTodo"
    />

    <TodoStats
      :stats="stats"
      @clear-completed="clearCompleted"
    />
  </div>
</template>
```

---

## Provide/Inject Pattern

Chuqur nested komponentlarga props drilling'siz state uzatish.

### Muammo - Props Drilling

```
App
 └─► Layout (props: user)
      └─► Sidebar (props: user)
           └─► UserMenu (props: user)
                └─► Avatar (props: user)  ◄─ 4 qavat!
```

### Yechim - Provide/Inject

```
App (provide: user)
 └─► Layout
      └─► Sidebar
           └─► UserMenu
                └─► Avatar (inject: user)  ◄─ To'g'ridan oladi
```

### Asosiy Foydalanish

```vue
<!-- App.vue - Provider -->
<script setup>
import { provide, ref, readonly } from 'vue'

const user = ref({
  id: 1,
  name: 'John',
  avatar: '/avatars/john.jpg'
})

const theme = ref('light')

// Provide - readonly tavsiya etiladi
provide('user', readonly(user))
provide('theme', readonly(theme))

// Agar o'zgartirish kerak bo'lsa
provide('setTheme', (newTheme) => {
  theme.value = newTheme
})
</script>

<template>
  <Layout>
    <router-view />
  </Layout>
</template>
```

```vue
<!-- Avatar.vue - Consumer (chuqur nested) -->
<script setup>
import { inject } from 'vue'

// Inject - default qiymat bilan
const user = inject('user', { name: 'Guest', avatar: null })
const theme = inject('theme', 'light')
</script>

<template>
  <div :class="['avatar', `theme-${theme}`]">
    <img
      v-if="user.avatar"
      :src="user.avatar"
      :alt="user.name"
    />
    <span v-else>{{ user.name[0] }}</span>
  </div>
</template>
```

### Typed Provide/Inject

```typescript
// types/injection-keys.ts
import type { InjectionKey, Ref } from 'vue'

export interface User {
  id: number
  name: string
  email: string
}

export interface ThemeContext {
  theme: Ref<'light' | 'dark'>
  toggleTheme: () => void
}

// Type-safe injection keys
export const userKey: InjectionKey<Ref<User | null>> = Symbol('user')
export const themeKey: InjectionKey<ThemeContext> = Symbol('theme')
```

```vue
<!-- Provider.vue -->
<script setup lang="ts">
import { provide, ref } from 'vue'
import { userKey, themeKey, type User } from '@/types/injection-keys'

const user = ref<User | null>({
  id: 1,
  name: 'John',
  email: 'john@example.com'
})

const theme = ref<'light' | 'dark'>('light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

// Type-safe provide
provide(userKey, user)
provide(themeKey, { theme, toggleTheme })
</script>
```

```vue
<!-- Consumer.vue -->
<script setup lang="ts">
import { inject } from 'vue'
import { userKey, themeKey } from '@/types/injection-keys'

// Type-safe inject
const user = inject(userKey)
const themeContext = inject(themeKey)

if (!themeContext) {
  throw new Error('Theme context not provided')
}

const { theme, toggleTheme } = themeContext
</script>
```

### Composable Provide Pattern

```javascript
// composables/useUserProvider.js
import { provide, inject, ref, readonly } from 'vue'

const USER_KEY = Symbol('user')

export function provideUser(initialUser = null) {
  const user = ref(initialUser)
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchUser() {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.getUser()
      user.value = response.data
    } catch (e) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function updateUser(updates) {
    const response = await api.updateUser(updates)
    user.value = response.data
  }

  const context = {
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchUser,
    updateUser
  }

  provide(USER_KEY, context)

  return context
}

export function useUser() {
  const context = inject(USER_KEY)

  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
```

```vue
<!-- App.vue -->
<script setup>
import { provideUser } from '@/composables/useUserProvider'

const { fetchUser } = provideUser()

onMounted(fetchUser)
</script>
```

```vue
<!-- DeepChild.vue -->
<script setup>
import { useUser } from '@/composables/useUserProvider'

const { user, isLoading, updateUser } = useUser()
</script>
```

---

## Composables bilan State Management

Composables - local va shared state o'rtasida o'rta yo'l.

### Local Composable

```javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const doubleCount = computed(() => count.value * 2)
  const isPositive = computed(() => count.value > 0)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = initialValue
  }

  return {
    count,
    doubleCount,
    isPositive,
    increment,
    decrement,
    reset
  }
}
```

```vue
<script setup>
import { useCounter } from '@/composables/useCounter'

// Har komponent o'z instance'iga ega
const { count, increment, decrement, reset } = useCounter(10)
</script>
```

### Shared Composable (Singleton)

```javascript
// composables/useSharedCounter.js
import { ref, computed } from 'vue'

// Module-level state - SINGLETON
const count = ref(0)

export function useSharedCounter() {
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset
  }
}
```

```vue
<!-- ComponentA.vue -->
<script setup>
import { useSharedCounter } from '@/composables/useSharedCounter'

const { count, increment } = useSharedCounter()
// count har ikkala komponentda bir xil
</script>

<!-- ComponentB.vue -->
<script setup>
import { useSharedCounter } from '@/composables/useSharedCounter'

const { count, decrement } = useSharedCounter()
// A'dagi increment B'da ham ko'rinadi
</script>
```

### Advanced Shared State Composable

```javascript
// composables/useNotifications.js
import { ref, computed, readonly } from 'vue'

// Singleton state
const notifications = ref([])
let nextId = 1

export function useNotifications() {
  const unreadCount = computed(
    () => notifications.value.filter(n => !n.read).length
  )

  const hasUnread = computed(() => unreadCount.value > 0)

  function add(notification) {
    const id = nextId++
    notifications.value.push({
      id,
      ...notification,
      read: false,
      timestamp: Date.now()
    })

    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        remove(id)
      }, notification.duration || 5000)
    }

    return id
  }

  function remove(id) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function markAsRead(id) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => {
      n.read = true
    })
  }

  function clear() {
    notifications.value = []
  }

  // Convenience methods
  function success(message, options = {}) {
    return add({ type: 'success', message, ...options })
  }

  function error(message, options = {}) {
    return add({ type: 'error', message, duration: 0, ...options })
  }

  function warning(message, options = {}) {
    return add({ type: 'warning', message, ...options })
  }

  function info(message, options = {}) {
    return add({ type: 'info', message, ...options })
  }

  return {
    notifications: readonly(notifications),
    unreadCount,
    hasUnread,
    add,
    remove,
    markAsRead,
    markAllAsRead,
    clear,
    success,
    error,
    warning,
    info
  }
}
```

### Composable vs Store - Qachon Qaysi Biri?

```javascript
// COMPOSABLE - oddiy shared state
// composables/useTheme.js
const theme = ref('light')

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggleTheme }
}

// STORE - murakkab state + devtools kerak
// stores/theme.js
export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'light',
    customColors: {},
    presets: []
  }),

  actions: {
    async loadPresets() { /* ... */ },
    applyPreset(name) { /* ... */ },
    saveCustomTheme() { /* ... */ }
  }
})
```

---

## To'g'ri va Noto'g'ri Yondashuvlar

### 1. Over-globalizing

```javascript
// NOTO'G'RI - hamma narsa global
export const useModalStore = defineStore('modal', {
  state: () => ({
    isOpen: false  // Faqat 1 joyda kerak!
  })
})

export const useFormStore = defineStore('form', {
  state: () => ({
    name: '',      // Local bo'lishi kerak!
    email: ''
  })
})

// TO'G'RI
// Modal - local
const isModalOpen = ref(false)

// Form - local
const formData = reactive({
  name: '',
  email: ''
})
```

### 2. Under-globalizing

```javascript
// NOTO'G'RI - shared data har joyda fetch
// UserCard.vue
const user = ref(null)
onMounted(async () => {
  user.value = await api.getUser()  // 10 komponent = 10 API call
})

// TO'G'RI - global store
export const useUserStore = defineStore('user', {
  state: () => ({ user: null }),
  actions: {
    async fetchUser() {
      if (!this.user) {
        this.user = await api.getUser()
      }
    }
  }
})
```

### 3. Props Drilling vs Provide/Inject

```vue
<!-- NOTO'G'RI - 5 qavat props -->
<GrandParent :user="user">
  <Parent :user="user">
    <Child :user="user">
      <GrandChild :user="user">
        <Avatar :user="user" />
      </GrandChild>
    </Child>
  </Parent>
</GrandParent>

<!-- TO'G'RI - provide/inject -->
<!-- GrandParent.vue -->
<script setup>
provide('user', user)
</script>

<!-- Avatar.vue -->
<script setup>
const user = inject('user')
</script>
```

### 4. Computed vs Getter

```javascript
// NOTO'G'RI - store getter local data uchun
export const useProductStore = defineStore('products', {
  getters: {
    // Bu faqat 1 komponentda kerak
    searchResults: (state) => state.products.filter(...)
  }
})

// TO'G'RI - local computed
const store = useProductStore()
const searchResults = computed(() =>
  store.products.filter(p => p.name.includes(searchQuery.value))
)
```

### 5. State Mutation

```javascript
// NOTO'G'RI - child'da state mutate
// Child.vue
const user = inject('user')
user.name = 'New Name'  // XATO! Readonly buzildi

// TO'G'RI - action orqali
// Parent.vue
provide('updateUser', (updates) => {
  Object.assign(user.value, updates)
})

// Child.vue
const updateUser = inject('updateUser')
updateUser({ name: 'New Name' })
```

---

## Real-World Patterns

### 1. Feature Module Pattern

```
features/
├── products/
│   ├── components/
│   │   ├── ProductList.vue      # Local: filters, sort
│   │   ├── ProductCard.vue      # Props: product
│   │   └── ProductFilters.vue   # Local: UI state
│   ├── composables/
│   │   └── useProductSearch.js  # Shared: search state
│   ├── stores/
│   │   └── products.js          # Global: products cache
│   └── index.js
│
├── cart/
│   ├── components/
│   │   ├── CartSidebar.vue      # Inject: cart
│   │   └── CartItem.vue         # Props: item
│   ├── stores/
│   │   └── cart.js              # Global: cart items
│   └── index.js
```

```javascript
// features/products/stores/products.js
export const useProductStore = defineStore('products', {
  state: () => ({
    // GLOBAL - cache, shared data
    items: [],
    categories: [],
    lastFetch: null
  }),

  actions: {
    async fetchProducts() {
      // Cache logic
      if (this.lastFetch && Date.now() - this.lastFetch < 60000) {
        return
      }
      // ...
    }
  }
})

// features/products/composables/useProductSearch.js
export function useProductSearch() {
  // LOCAL instance - har komponent o'z search'iga ega
  const query = ref('')
  const filters = reactive({
    category: null,
    minPrice: 0,
    maxPrice: Infinity
  })

  const productStore = useProductStore()

  const results = computed(() => {
    return productStore.items.filter(product => {
      // filter logic
    })
  })

  return { query, filters, results }
}
```

### 2. Multi-Step Form Pattern

```vue
<!-- MultiStepForm.vue -->
<script setup>
import { provide, ref, computed, readonly } from 'vue'

// Form state - provided to all steps
const formData = reactive({
  // Step 1
  firstName: '',
  lastName: '',
  email: '',

  // Step 2
  address: '',
  city: '',
  country: '',

  // Step 3
  cardNumber: '',
  expiry: '',
  cvv: ''
})

const currentStep = ref(1)
const totalSteps = 3

const errors = reactive({})

const canGoNext = computed(() => {
  // Step-specific validation
  switch (currentStep.value) {
    case 1:
      return formData.firstName && formData.email
    case 2:
      return formData.address && formData.city
    case 3:
      return formData.cardNumber && formData.cvv
    default:
      return false
  }
})

function nextStep() {
  if (canGoNext.value && currentStep.value < totalSteps) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function updateField(field, value) {
  formData[field] = value
  // Clear error
  if (errors[field]) {
    delete errors[field]
  }
}

// Provide to steps
provide('formData', readonly(formData))
provide('errors', readonly(errors))
provide('updateField', updateField)
provide('currentStep', readonly(currentStep))
</script>

<template>
  <div class="multi-step-form">
    <FormProgress :current="currentStep" :total="totalSteps" />

    <Step1 v-if="currentStep === 1" />
    <Step2 v-else-if="currentStep === 2" />
    <Step3 v-else-if="currentStep === 3" />

    <div class="actions">
      <button @click="prevStep" :disabled="currentStep === 1">
        Back
      </button>
      <button @click="nextStep" :disabled="!canGoNext">
        {{ currentStep === totalSteps ? 'Submit' : 'Next' }}
      </button>
    </div>
  </div>
</template>
```

```vue
<!-- Step1.vue -->
<script setup>
const formData = inject('formData')
const errors = inject('errors')
const updateField = inject('updateField')
</script>

<template>
  <div class="step">
    <input
      :value="formData.firstName"
      @input="updateField('firstName', $event.target.value)"
      placeholder="First Name"
    />
    <span v-if="errors.firstName" class="error">
      {{ errors.firstName }}
    </span>

    <!-- ... -->
  </div>
</template>
```

### 3. Dashboard Layout Pattern

```javascript
// composables/useDashboardLayout.js
import { provide, inject, ref, computed } from 'vue'

const LAYOUT_KEY = Symbol('dashboardLayout')

export function provideDashboardLayout() {
  const isSidebarOpen = ref(true)
  const isSidebarCollapsed = ref(false)
  const activePanel = ref(null)
  const breadcrumbs = ref([])

  const sidebarWidth = computed(() => {
    if (!isSidebarOpen.value) return 0
    if (isSidebarCollapsed.value) return 64
    return 280
  })

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function collapseSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  function openPanel(panelId) {
    activePanel.value = panelId
  }

  function closePanel() {
    activePanel.value = null
  }

  function setBreadcrumbs(items) {
    breadcrumbs.value = items
  }

  const context = {
    isSidebarOpen,
    isSidebarCollapsed,
    activePanel,
    breadcrumbs,
    sidebarWidth,
    toggleSidebar,
    collapseSidebar,
    openPanel,
    closePanel,
    setBreadcrumbs
  }

  provide(LAYOUT_KEY, context)

  return context
}

export function useDashboardLayout() {
  const context = inject(LAYOUT_KEY)

  if (!context) {
    throw new Error('useDashboardLayout must be used within Dashboard')
  }

  return context
}
```

---

## Interview Savollari

### 1. Local va global state orasidagi asosiy farqlar nimada?

**Javob:**

| Xususiyat | Local State | Global State |
|-----------|-------------|--------------|
| Scope | 1 komponent | Butun ilova |
| Lifecycle | Komponent bilan | App bilan |
| Access | `ref`/`reactive` | Store |
| DevTools | Yo'q | Ha |
| Persistence | Qiyin | Oson |

```javascript
// LOCAL - component lifecycle bilan bog'liq
export default {
  setup() {
    const isOpen = ref(false)  // Komponent unmount = yo'qoladi
    return { isOpen }
  }
}

// GLOBAL - app lifecycle bilan
export const useUserStore = defineStore('user', {
  state: () => ({ user: null })  // App yopilguncha mavjud
})
```

**Qachon qaysi biri:**
- **Local**: UI state, form, temporary data
- **Global**: Auth, shared data, cache, settings

---

### 2. Props drilling nima va uni qanday hal qilish mumkin?

**Javob:**

Props drilling - ma'lumotni ko'p qavat props orqali uzatish.

```vue
<!-- MUAMMO -->
<App :user="user">
  <Layout :user="user">
    <Sidebar :user="user">
      <UserMenu :user="user">
        <Avatar :user="user" />  <!-- 5-chi qavat! -->
      </UserMenu>
    </Sidebar>
  </Layout>
</App>
```

**Yechimlari:**

1. **Provide/Inject**
```javascript
// App.vue
provide('user', user)

// Avatar.vue
const user = inject('user')
```

2. **Global Store**
```javascript
// stores/user.js
export const useUserStore = defineStore('user', { ... })

// Avatar.vue
const userStore = useUserStore()
```

3. **Composable**
```javascript
// composables/useUser.js
const user = ref(null)
export function useUser() {
  return { user }
}
```

**Qaysi birini tanlash:**
- 2-3 qavat: Props OK
- 4+ qavat, subtree: Provide/Inject
- App-wide: Global Store

---

### 3. Composable va Store orasidagi farq nima?

**Javob:**

```javascript
// COMPOSABLE - oddiy, har chaqiruvda yangi instance (default)
export function useCounter() {
  const count = ref(0)
  return { count }
}

// Har komponent o'z count'iga ega
const { count } = useCounter()  // count = 0
const { count } = useCounter()  // count = 0 (alohida)

// SINGLETON COMPOSABLE
const count = ref(0)  // Module-level
export function useSharedCounter() {
  return { count }
}

// STORE - singleton, devtools, persist
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 })
})
```

**Qachon Composable:**
- Oddiy shared state
- Devtools kerak emas
- Persist kerak emas
- Unit testing oson

**Qachon Store:**
- Murakkab state
- Devtools kerak
- Persistence kerak
- SSR

---

### 4. State lifting pattern qanday ishlaydi?

**Javob:**

Ikki sibling komponent state almashishi kerak bo'lganda, state'ni umumiy parent'ga ko'tarish.

```
OLDIN:                          KEYIN:
┌─────────────┐                 ┌─────────────┐
│   Parent    │                 │   Parent    │
│             │                 │  count = 5  │
└─────────────┘                 │   ↓    ↑    │
      │                         │   │    │    │
 ┌────┴────┐                    └───┼────┼────┘
 ↓         ↓                        ↓    ↓
┌───┐    ┌───┐                  ┌───┐  ┌───┐
│ A │    │ B │                  │ A │  │ B │
│5 ?│    │? ?│                  │ 5 │  │ 5 │
└───┘    └───┘                  └───┘  └───┘
```

```vue
<!-- Parent.vue -->
<script setup>
const count = ref(0)
const increment = () => count.value++
</script>

<template>
  <Counter :count="count" @increment="increment" />
  <Display :count="count" />
</template>
```

**Qachon ishlatiladi:**
- Sibling komponentlar bir xil state kerak
- State 1-2 qavat ko'tarilsa
- Global store keraksiz

---

### 5. readonly() nima uchun provide/inject bilan ishlatiladi?

**Javob:**

`readonly()` - consumer komponentlar state'ni o'zgartira olmasligini ta'minlaydi.

```javascript
// NOTO'G'RI - mutation imkoni
provide('user', user)

// Consumer qilishi mumkin:
const user = inject('user')
user.value.name = 'Hacker'  // State buzildi!

// TO'G'RI - readonly bilan
provide('user', readonly(user))

// Consumer:
const user = inject('user')
user.value.name = 'Hacker'  // Warning! + ishlamaydi
```

**Nima uchun kerak:**
1. **Single source of truth** - faqat provider o'zgartiradi
2. **Predictable** - state qayerda o'zgarishi aniq
3. **Debugging** - mutation qayerda bo'lganini topish oson

```javascript
// O'zgartirish uchun action provide qilish
provide('user', readonly(user))
provide('updateUser', (updates) => {
  Object.assign(user.value, updates)
})
```

---

## Qachon Qaysi Birini Tanlash - Xulosa

### Local State (`ref`/`reactive`)
- UI holati (modal, dropdown, hover)
- Form qiymatlari
- Komponent-specific data
- Temporary state

### Props/Emit
- Parent-child muloqot
- 1-2 qavat
- Aniq data flow kerak

### Provide/Inject
- Chuqur nested (3+ qavat)
- Subtree-scoped shared state
- Prop drilling oldini olish

### Composables
- Reusable state logic
- Cross-component utilities
- Oddiy shared state

### Global Store (Pinia/Vuex)
- App-wide state
- Auth, user data
- Cache, persistence
- DevTools kerak

---

## Xulosa

To'g'ri state management tanlov:

1. **Avval local** - eng sodda yechimdan boshlang
2. **Kerak bo'lganda ko'taring** - muammo paydo bo'lsa
3. **Global faqat kerak bo'lganda** - over-engineering'dan saqlaning
4. **Consistency** - bir xil pattern ishlating

State management - bu muvozanat:
- Soddalik vs Kengayuvchanlik
- Performance vs DX
- Local vs Global
