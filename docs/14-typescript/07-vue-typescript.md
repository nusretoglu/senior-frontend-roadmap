# Vue + TypeScript

## Mundarija

1. [Setup va Configuration](#setup-va-configuration)
2. [Script Setup bilan TypeScript](#script-setup-bilan-typescript)
3. [Props va Emits Typing](#props-va-emits-typing)
4. [Composables Typing](#composables-typing)
5. [Pinia bilan TypeScript](#pinia-bilan-typescript)
6. [Vue Router bilan TypeScript](#vue-router-bilan-typescript)
7. [Template Refs](#template-refs)
8. [Provide/Inject Typing](#provideinject-typing)
9. [Component Instances](#component-instances)
10. [Real-world Cases](#real-world-cases)
11. [Interview Savollari](#interview-savollari)
12. [Common Mistakes](#common-mistakes)

---

## Setup va Configuration

### Yangi Loyiha Yaratish

```bash
# Vue CLI bilan
npm create vue@latest my-project
# TypeScript tanlang

# Yoki Vite bilan
npm create vite@latest my-project -- --template vue-ts
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Vue specific */
    "types": ["vite/client"],

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@composables/*": ["src/composables/*"],
      "@stores/*": ["src/stores/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

### Global Types

```typescript
// src/types/global.d.ts

// Global type declarations
declare global {
  interface Window {
    myGlobalVar: string;
  }
}

// Vue component augmentation
declare module 'vue' {
  interface ComponentCustomProperties {
    $myProperty: string;
    $myMethod: (arg: string) => void;
  }
}

// Vite env variables
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {}
```

---

## Script Setup bilan TypeScript

### Basic Component

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Reactive state with types
const count = ref<number>(0)
const message = ref<string>('Hello')
const items = ref<string[]>([])

// Complex object
interface User {
  id: number
  name: string
  email: string
}

const user = ref<User | null>(null)

// Computed with explicit type
const doubleCount = computed<number>(() => count.value * 2)

// Methods
function increment(): void {
  count.value++
}

async function fetchUser(id: number): Promise<void> {
  const response = await fetch(`/api/users/${id}`)
  user.value = await response.json()
}

// Lifecycle
onMounted(() => {
  console.log('Component mounted')
})
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

### Generic Components

```vue
<!-- GenericList.vue -->
<script setup lang="ts" generic="T extends { id: number }">
import { computed } from 'vue'

// Generic props
interface Props {
  items: T[]
  selected?: T | null
}

const props = defineProps<Props>()

// Generic emit
const emit = defineEmits<{
  select: [item: T]
  delete: [id: number]
}>()

// Computed with generic
const sortedItems = computed<T[]>(() =>
  [...props.items].sort((a, b) => a.id - b.id)
)

function handleSelect(item: T): void {
  emit('select', item)
}
</script>

<template>
  <ul>
    <li
      v-for="item in sortedItems"
      :key="item.id"
      :class="{ selected: selected?.id === item.id }"
      @click="handleSelect(item)"
    >
      <slot :item="item">
        {{ item.id }}
      </slot>
      <button @click.stop="emit('delete', item.id)">Delete</button>
    </li>
  </ul>
</template>
```

Usage:

```vue
<script setup lang="ts">
import GenericList from './GenericList.vue'

interface Product {
  id: number
  name: string
  price: number
}

const products = ref<Product[]>([
  { id: 1, name: 'Apple', price: 1.5 },
  { id: 2, name: 'Banana', price: 0.75 }
])

const selectedProduct = ref<Product | null>(null)

function handleSelect(product: Product): void {
  selectedProduct.value = product
}
</script>

<template>
  <GenericList
    :items="products"
    :selected="selectedProduct"
    @select="handleSelect"
    @delete="(id) => console.log('Delete', id)"
  >
    <template #default="{ item }">
      {{ item.name }} - ${{ item.price }}
    </template>
  </GenericList>
</template>
```

---

## Props va Emits Typing

### defineProps

```vue
<script setup lang="ts">
// 1. Runtime declaration (with defaults)
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  items: {
    type: Array as PropType<string[]>,
    default: () => []
  }
})

// 2. Type-based declaration (recommended)
interface Props {
  title: string
  count?: number
  items?: string[]
  user?: User | null
  onUpdate?: (value: string) => void
}

const props = defineProps<Props>()

// 3. With defaults (using withDefaults)
interface Props {
  title: string
  count?: number
  items?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => []
})

// props.count is number (not number | undefined)
</script>
```

### defineEmits

```vue
<script setup lang="ts">
// 1. Runtime declaration
const emit = defineEmits(['update', 'delete', 'select'])

// 2. Type-based declaration (recommended)
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
  (e: 'select', item: User, index: number): void
}>()

// 3. Named tuple syntax (Vue 3.3+)
const emit = defineEmits<{
  update: [value: string]
  delete: [id: number]
  select: [item: User, index: number]
}>()

// Usage
emit('update', 'new value')
emit('delete', 123)
emit('select', user, 0)

// Type error
// emit('update', 123) // ERROR: number is not string
// emit('unknown', 'test') // ERROR: unknown event
</script>
```

### defineModel (Vue 3.4+)

```vue
<!-- ChildComponent.vue -->
<script setup lang="ts">
// v-model binding with TypeScript
const modelValue = defineModel<string>({ required: true })

// Named models
const firstName = defineModel<string>('firstName')
const lastName = defineModel<string>('lastName')

// With default
const count = defineModel<number>('count', { default: 0 })
</script>

<template>
  <input v-model="modelValue" />
  <input v-model="firstName" placeholder="First name" />
  <input v-model="lastName" placeholder="Last name" />
</template>
```

Parent usage:

```vue
<script setup lang="ts">
import ChildComponent from './ChildComponent.vue'

const text = ref('')
const first = ref('')
const last = ref('')
</script>

<template>
  <ChildComponent
    v-model="text"
    v-model:firstName="first"
    v-model:lastName="last"
  />
</template>
```

### defineSlots (Vue 3.3+)

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
}

// Define slot types
const slots = defineSlots<{
  default(props: { item: User; index: number }): any
  header(props: { title: string }): any
  footer(): any
}>()
</script>

<template>
  <div>
    <header>
      <slot name="header" :title="'Users List'" />
    </header>

    <ul>
      <li v-for="(user, index) in users" :key="user.id">
        <slot :item="user" :index="index">
          {{ user.name }}
        </slot>
      </li>
    </ul>

    <footer>
      <slot name="footer" />
    </footer>
  </div>
</template>
```

---

## Composables Typing

### Basic Composable

```typescript
// src/composables/useCounter.ts
import { ref, computed, type Ref, type ComputedRef } from 'vue'

interface UseCounterOptions {
  initialValue?: number
  min?: number
  max?: number
}

interface UseCounterReturn {
  count: Ref<number>
  doubleCount: ComputedRef<number>
  increment: () => void
  decrement: () => void
  reset: () => void
}

export function useCounter(options: UseCounterOptions = {}): UseCounterReturn {
  const { initialValue = 0, min = -Infinity, max = Infinity } = options

  const count = ref(initialValue)

  const doubleCount = computed(() => count.value * 2)

  function increment(): void {
    if (count.value < max) {
      count.value++
    }
  }

  function decrement(): void {
    if (count.value > min) {
      count.value--
    }
  }

  function reset(): void {
    count.value = initialValue
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

### Async Composable

```typescript
// src/composables/useFetch.ts
import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'

interface UseFetchOptions<T> {
  immediate?: boolean
  initialData?: T
}

interface UseFetchReturn<T> {
  data: ShallowRef<T | null>
  error: ShallowRef<Error | null>
  isLoading: Ref<boolean>
  execute: () => Promise<void>
}

export function useFetch<T>(
  url: string | Ref<string>,
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const { immediate = true, initialData = null } = options

  const data = shallowRef<T | null>(initialData)
  const error = shallowRef<Error | null>(null)
  const isLoading = ref(false)

  async function execute(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const urlValue = typeof url === 'string' ? url : url.value
      const response = await fetch(urlValue)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      data.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      isLoading.value = false
    }
  }

  if (immediate) {
    execute()
  }

  return {
    data,
    error,
    isLoading,
    execute
  }
}
```

### Composable with Generics

```typescript
// src/composables/useLocalStorage.ts
import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): Ref<T> {
  // Read from localStorage
  const storedValue = localStorage.getItem(key)
  const initialValue = storedValue ? JSON.parse(storedValue) : defaultValue

  const data = ref<T>(initialValue) as Ref<T>

  // Watch and sync to localStorage
  watch(
    data,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  return data
}

// Usage
const settings = useLocalStorage('settings', {
  theme: 'dark',
  notifications: true
})
// settings: Ref<{ theme: string; notifications: boolean }>
```

### Composable with Events

```typescript
// src/composables/useEventListener.ts
import { onMounted, onUnmounted, type Ref, unref } from 'vue'

type MaybeRef<T> = T | Ref<T>

export function useEventListener<K extends keyof WindowEventMap>(
  target: MaybeRef<Window | null>,
  event: K,
  handler: (e: WindowEventMap[K]) => void
): void

export function useEventListener<K extends keyof HTMLElementEventMap>(
  target: MaybeRef<HTMLElement | null>,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void
): void

export function useEventListener(
  target: MaybeRef<EventTarget | null>,
  event: string,
  handler: (e: Event) => void
): void {
  onMounted(() => {
    const el = unref(target)
    el?.addEventListener(event, handler)
  })

  onUnmounted(() => {
    const el = unref(target)
    el?.removeEventListener(event, handler)
  })
}

// Usage
useEventListener(window, 'resize', (e) => {
  console.log(e.target) // e is UIEvent
})

useEventListener(buttonRef, 'click', (e) => {
  console.log(e.clientX) // e is MouseEvent
})
```

---

## Pinia bilan TypeScript

### Store Definition

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Types
export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
}

export interface LoginCredentials {
  email: string
  password: string
}

// Setup store (recommended for TypeScript)
export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const userName = computed(() => currentUser.value?.name ?? 'Guest')

  // Actions
  async function login(credentials: LoginCredentials): Promise<boolean> {
    isLoading.value = true

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      currentUser.value = data.user
      token.value = data.token

      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout(): void {
    currentUser.value = null
    token.value = null
  }

  async function updateProfile(updates: Partial<User>): Promise<void> {
    if (!currentUser.value) return

    const response = await fetch(`/api/users/${currentUser.value.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(updates)
    })

    if (response.ok) {
      const updatedUser = await response.json()
      currentUser.value = updatedUser
    }
  }

  return {
    // State
    currentUser,
    token,
    isLoading,
    // Getters
    isAuthenticated,
    isAdmin,
    userName,
    // Actions
    login,
    logout,
    updateProfile
  }
})
```

### Options Store (Alternative)

```typescript
// src/stores/products.ts
import { defineStore } from 'pinia'

interface Product {
  id: number
  name: string
  price: number
  category: string
}

interface ProductState {
  products: Product[]
  selectedCategory: string | null
  isLoading: boolean
}

export const useProductStore = defineStore('products', {
  state: (): ProductState => ({
    products: [],
    selectedCategory: null,
    isLoading: false
  }),

  getters: {
    filteredProducts(state): Product[] {
      if (!state.selectedCategory) {
        return state.products
      }
      return state.products.filter(p => p.category === state.selectedCategory)
    },

    totalPrice(): number {
      return this.filteredProducts.reduce((sum, p) => sum + p.price, 0)
    },

    productById: (state) => {
      return (id: number): Product | undefined =>
        state.products.find(p => p.id === id)
    }
  },

  actions: {
    async fetchProducts(): Promise<void> {
      this.isLoading = true
      try {
        const response = await fetch('/api/products')
        this.products = await response.json()
      } finally {
        this.isLoading = false
      }
    },

    setCategory(category: string | null): void {
      this.selectedCategory = category
    },

    addProduct(product: Omit<Product, 'id'>): void {
      const newId = Math.max(...this.products.map(p => p.id), 0) + 1
      this.products.push({ ...product, id: newId })
    }
  }
})
```

### Store Usage in Components

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/products'

const userStore = useUserStore()
const productStore = useProductStore()

// Reactive refs (keeps reactivity)
const { currentUser, isAuthenticated, isLoading } = storeToRefs(userStore)

// Actions (no storeToRefs needed)
const { login, logout } = userStore

// Or direct access
async function handleLogin(): Promise<void> {
  const success = await userStore.login({
    email: 'user@example.com',
    password: 'password'
  })

  if (success) {
    await productStore.fetchProducts()
  }
}
</script>
```

---

## Vue Router bilan TypeScript

### Route Definitions

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { Component } from 'vue'

// Route meta types
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: ('admin' | 'user')[]
    title?: string
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'Home'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: 'Login'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Dashboard'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: 'Admin Panel'
    }
  },
  {
    path: '/users/:id',
    name: 'UserProfile',
    component: () => import('@/views/UserProfileView.vue'),
    props: true,
    meta: {
      requiresAuth: true,
      title: 'User Profile'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const roles = to.meta.roles

  // Type-safe meta access
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Auth check
  const userStore = useUserStore()

  if (requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (roles && !roles.includes(userStore.currentUser?.role ?? 'guest')) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
```

### Route Params Typing

```vue
<script setup lang="ts">
import { useRoute, useRouter, type RouteLocationNormalized } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Typed params
const userId = computed(() => route.params.id as string)

// Or with type assertion
interface UserRouteParams {
  id: string
}

const params = route.params as UserRouteParams

// Programmatic navigation
function goToUser(id: number): void {
  router.push({
    name: 'UserProfile',
    params: { id: String(id) }
  })
}

function goBack(): void {
  router.back()
}

// With query params
function search(query: string): void {
  router.push({
    name: 'Search',
    query: { q: query }
  })
}
</script>
```

### Typed Route Names

```typescript
// src/router/routes.ts
export const routeNames = {
  Home: 'Home',
  Login: 'Login',
  Dashboard: 'Dashboard',
  UserProfile: 'UserProfile',
  Admin: 'Admin'
} as const

export type RouteName = typeof routeNames[keyof typeof routeNames]

// Usage
import { routeNames, type RouteName } from '@/router/routes'

function navigateTo(name: RouteName): void {
  router.push({ name })
}

navigateTo(routeNames.Dashboard)
// navigateTo('Unknown') // ERROR: not in RouteName
```

---

## Template Refs

### Basic Refs

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// DOM element ref
const inputRef = ref<HTMLInputElement | null>(null)

// Focus on mount
onMounted(() => {
  inputRef.value?.focus()
})

function handleSubmit(): void {
  const value = inputRef.value?.value
  console.log('Input value:', value)
}
</script>

<template>
  <input ref="inputRef" type="text" />
  <button @click="handleSubmit">Submit</button>
</template>
```

### Component Refs

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

// Component ref with InstanceType
const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)

function callChildMethod(): void {
  childRef.value?.someMethod()
}
</script>

<template>
  <ChildComponent ref="childRef" />
  <button @click="callChildMethod">Call Child Method</button>
</template>
```

### defineExpose

```vue
<!-- ChildComponent.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const internalState = ref(0)

function someMethod(): void {
  console.log('Called from parent')
}

function reset(): void {
  internalState.value = 0
}

// Expose to parent
defineExpose({
  someMethod,
  reset,
  // Can also expose refs
  internalState
})
</script>
```

### Array of Refs

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const items = ref(['a', 'b', 'c'])
const itemRefs = ref<HTMLLIElement[]>([])

// Template: ref="el => itemRefs.push(el)"
function setItemRef(el: HTMLLIElement | null, index: number): void {
  if (el) {
    itemRefs.value[index] = el
  }
}

onMounted(() => {
  console.log('Item refs:', itemRefs.value)
})
</script>

<template>
  <ul>
    <li
      v-for="(item, index) in items"
      :key="index"
      :ref="(el) => setItemRef(el as HTMLLIElement, index)"
    >
      {{ item }}
    </li>
  </ul>
</template>
```

---

## Provide/Inject Typing

### Basic Provide/Inject

```typescript
// src/injection-keys.ts
import type { InjectionKey, Ref } from 'vue'

export interface UserContext {
  user: Ref<User | null>
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

export interface ThemeContext {
  theme: Ref<'light' | 'dark'>
  toggle: () => void
}

// Typed injection keys
export const userKey: InjectionKey<UserContext> = Symbol('user')
export const themeKey: InjectionKey<ThemeContext> = Symbol('theme')
```

### Provider Component

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref, provide } from 'vue'
import { userKey, themeKey, type UserContext, type ThemeContext } from './injection-keys'

// User context
const user = ref<User | null>(null)

async function login(credentials: LoginCredentials): Promise<void> {
  // Login logic
}

function logout(): void {
  user.value = null
}

provide<UserContext>(userKey, {
  user,
  login,
  logout
})

// Theme context
const theme = ref<'light' | 'dark'>('light')

function toggleTheme(): void {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

provide<ThemeContext>(themeKey, {
  theme,
  toggle: toggleTheme
})
</script>
```

### Consumer Component

```vue
<script setup lang="ts">
import { inject } from 'vue'
import { userKey, themeKey } from '@/injection-keys'

// With type safety
const userContext = inject(userKey)
// userContext: UserContext | undefined

// With default value
const themeContext = inject(themeKey, {
  theme: ref('light'),
  toggle: () => {}
})
// themeContext: ThemeContext (always defined)

// Non-null assertion (if guaranteed to be provided)
const userContext2 = inject(userKey)!
// userContext2: UserContext

// Usage
if (userContext?.user.value) {
  console.log('Logged in as:', userContext.user.value.name)
}
</script>
```

---

## Component Instances

### defineComponent with TypeScript

```typescript
// For non-script-setup components
import { defineComponent, PropType, ref, computed } from 'vue'

interface User {
  id: number
  name: string
}

export default defineComponent({
  name: 'UserCard',

  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    showDetails: {
      type: Boolean,
      default: false
    }
  },

  emits: {
    select: (user: User) => true,
    delete: (id: number) => true
  },

  setup(props, { emit }) {
    const isExpanded = ref(false)

    const displayName = computed(() => props.user.name.toUpperCase())

    function handleSelect(): void {
      emit('select', props.user)
    }

    function handleDelete(): void {
      emit('delete', props.user.id)
    }

    return {
      isExpanded,
      displayName,
      handleSelect,
      handleDelete
    }
  }
})
```

### ExtractPropTypes

```typescript
import { ExtractPropTypes, PropType } from 'vue'

const buttonProps = {
  variant: {
    type: String as PropType<'primary' | 'secondary' | 'danger'>,
    default: 'primary'
  },
  size: {
    type: String as PropType<'sm' | 'md' | 'lg'>,
    default: 'md'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  onClick: {
    type: Function as PropType<(e: MouseEvent) => void>
  }
} as const

// Extract props type
export type ButtonProps = ExtractPropTypes<typeof buttonProps>
// {
//   variant: 'primary' | 'secondary' | 'danger'
//   size: 'sm' | 'md' | 'lg'
//   disabled: boolean
//   onClick?: (e: MouseEvent) => void
// }
```

---

## Real-world Cases

### Case 1: Form Component with Validation

```vue
<!-- FormInput.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type ValidationRule = (value: string) => string | true

interface Props {
  modelValue: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number'
  rules?: ValidationRule[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  rules: () => [],
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
  focus: []
}>()

const touched = ref(false)
const focused = ref(false)

const errors = computed<string[]>(() => {
  if (!touched.value) return []

  return props.rules
    .map(rule => rule(props.modelValue))
    .filter((result): result is string => result !== true)
})

const hasError = computed(() => errors.value.length > 0)

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleBlur(): void {
  touched.value = true
  focused.value = false
  emit('blur')
}

function handleFocus(): void {
  focused.value = true
  emit('focus')
}

// Expose for parent
defineExpose({
  validate: () => {
    touched.value = true
    return !hasError.value
  },
  reset: () => {
    touched.value = false
  }
})
</script>

<template>
  <div class="form-field" :class="{ 'has-error': hasError, 'is-focused': focused }">
    <label>{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :disabled="disabled"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <div v-if="hasError" class="errors">
      <span v-for="error in errors" :key="error">{{ error }}</span>
    </div>
  </div>
</template>
```

### Case 2: Data Table Component

```vue
<!-- DataTable.vue -->
<script setup lang="ts" generic="T extends { id: string | number }">
import { computed, ref } from 'vue'

interface Column<TData> {
  key: keyof TData | string
  label: string
  sortable?: boolean
  render?: (value: any, row: TData) => string
}

interface Props {
  data: T[]
  columns: Column<T>[]
  selectable?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  loading: false
})

const emit = defineEmits<{
  select: [items: T[]]
  rowClick: [item: T]
  sort: [key: string, direction: 'asc' | 'desc']
}>()

const selectedIds = ref<Set<T['id']>>(new Set())
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

const allSelected = computed(() =>
  props.data.length > 0 && selectedIds.value.size === props.data.length
)

const selectedItems = computed(() =>
  props.data.filter(item => selectedIds.value.has(item.id))
)

function toggleSelect(item: T): void {
  if (selectedIds.value.has(item.id)) {
    selectedIds.value.delete(item.id)
  } else {
    selectedIds.value.add(item.id)
  }
  emit('select', selectedItems.value)
}

function toggleSelectAll(): void {
  if (allSelected.value) {
    selectedIds.value.clear()
  } else {
    selectedIds.value = new Set(props.data.map(item => item.id))
  }
  emit('select', selectedItems.value)
}

function handleSort(column: Column<T>): void {
  if (!column.sortable) return

  const key = String(column.key)

  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }

  emit('sort', key, sortDirection.value)
}

function getCellValue(row: T, column: Column<T>): string {
  const value = row[column.key as keyof T]

  if (column.render) {
    return column.render(value, row)
  }

  return String(value ?? '')
}
</script>

<template>
  <table class="data-table">
    <thead>
      <tr>
        <th v-if="selectable">
          <input
            type="checkbox"
            :checked="allSelected"
            @change="toggleSelectAll"
          />
        </th>
        <th
          v-for="column in columns"
          :key="String(column.key)"
          :class="{ sortable: column.sortable }"
          @click="handleSort(column)"
        >
          {{ column.label }}
          <span v-if="sortKey === column.key">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="loading">
        <td :colspan="columns.length + (selectable ? 1 : 0)">
          Loading...
        </td>
      </tr>
      <tr
        v-else
        v-for="row in data"
        :key="row.id"
        @click="emit('rowClick', row)"
      >
        <td v-if="selectable" @click.stop>
          <input
            type="checkbox"
            :checked="selectedIds.has(row.id)"
            @change="toggleSelect(row)"
          />
        </td>
        <td v-for="column in columns" :key="String(column.key)">
          <slot :name="`cell-${String(column.key)}`" :row="row" :value="getCellValue(row, column)">
            {{ getCellValue(row, column) }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

---

## Interview Savollari

### 1. Vue 3'da `script setup` bilan TypeScript qanday ishlaydi?

**Javob:**

```vue
<script setup lang="ts">
// script setup - Composition API uchun syntax sugar
// lang="ts" - TypeScript yoqiladi

import { ref, computed } from 'vue'

// 1. Reactive state
const count = ref<number>(0) // Ref<number>
const user = ref<User | null>(null) // Ref<User | null>

// 2. Props - defineProps
interface Props {
  title: string
  items?: string[]
}

const props = defineProps<Props>()

// With defaults
const props2 = withDefaults(defineProps<Props>(), {
  items: () => []
})

// 3. Emits - defineEmits
const emit = defineEmits<{
  update: [value: string]
  delete: [id: number]
}>()

// 4. Slots - defineSlots (Vue 3.3+)
const slots = defineSlots<{
  default(props: { item: string }): any
}>()

// 5. Expose - defineExpose
defineExpose({
  someMethod: () => {},
  count
})

// 6. Model - defineModel (Vue 3.4+)
const modelValue = defineModel<string>()
</script>
```

### 2. Pinia store'larni TypeScript bilan qanday yoziladi?

**Javob:**

```typescript
// Setup syntax (tavsiya)
export const useUserStore = defineStore('user', () => {
  // State - ref
  const user = ref<User | null>(null)
  const loading = ref(false)

  // Getters - computed
  const isLoggedIn = computed(() => user.value !== null)

  // Actions - functions
  async function login(credentials: LoginCredentials): Promise<boolean> {
    loading.value = true
    try {
      user.value = await api.login(credentials)
      return true
    } finally {
      loading.value = false
    }
  }

  return { user, loading, isLoggedIn, login }
})

// Options syntax (alternative)
export const useUserStore = defineStore('user', {
  state: (): { user: User | null } => ({
    user: null
  }),

  getters: {
    isLoggedIn(): boolean {
      return this.user !== null
    }
  },

  actions: {
    async login(credentials: LoginCredentials): Promise<void> {
      this.user = await api.login(credentials)
    }
  }
})

// Usage
const store = useUserStore()
const { user, isLoggedIn } = storeToRefs(store) // Reactive
store.login({ email, password }) // Action
```

### 3. Template refs'ni TypeScript bilan qanday ishlatiladi?

**Javob:**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

// 1. DOM element ref
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  inputRef.value?.focus()
})

// 2. Component ref
const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)

function callChildMethod(): void {
  childRef.value?.someMethod()
}

// 3. Array of refs
const itemRefs = ref<HTMLLIElement[]>([])

function setItemRef(el: HTMLLIElement | null, index: number): void {
  if (el) itemRefs.value[index] = el
}

// 4. defineExpose - child component'da
// expose qilingan metodlar/state'lar InstanceType orqali accessible
</script>

<template>
  <input ref="inputRef" />
  <ChildComponent ref="childRef" />
  <li
    v-for="(item, i) in items"
    :ref="el => setItemRef(el as HTMLLIElement, i)"
  >
    {{ item }}
  </li>
</template>
```

### 4. Provide/Inject'ni TypeScript bilan qanday type-safe qilinadi?

**Javob:**

```typescript
// 1. InjectionKey ishlatish
import { InjectionKey, Ref } from 'vue'

interface UserContext {
  user: Ref<User | null>
  login: (creds: Credentials) => Promise<void>
}

// Typed key
export const userKey: InjectionKey<UserContext> = Symbol('user')

// 2. Provider
provide(userKey, {
  user,
  login
})

// 3. Consumer - type safe
const ctx = inject(userKey)
// ctx: UserContext | undefined

// With default
const ctx2 = inject(userKey, {
  user: ref(null),
  login: async () => {}
})
// ctx2: UserContext (always defined)

// Non-null assertion
const ctx3 = inject(userKey)!
// ctx3: UserContext
```

### 5. Generic components (Vue 3.3+) nima?

**Javob:**

```vue
<!-- GenericList.vue -->
<script setup lang="ts" generic="T extends { id: number }">
// generic attribute bilan type parameter
// T extends - constraint

interface Props {
  items: T[]
  selected?: T
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [item: T]
}>()

// T bu yerda ishlatiladi
function handleSelect(item: T): void {
  emit('select', item)
}
</script>

<template>
  <ul>
    <li
      v-for="item in items"
      :key="item.id"
      @click="handleSelect(item)"
    >
      <slot :item="item" />
    </li>
  </ul>
</template>

<!-- Usage -->
<script setup lang="ts">
interface Product {
  id: number
  name: string
  price: number
}

const products: Product[] = [...]
</script>

<template>
  <!-- T is inferred as Product -->
  <GenericList :items="products" @select="(p) => console.log(p.price)">
    <template #default="{ item }">
      {{ item.name }} - ${{ item.price }}
    </template>
  </GenericList>
</template>
```

---

## Common Mistakes

### 1. Ref Unwrapping'ni Tushunmaslik

```vue
<script setup lang="ts">
// YOMON: template'da .value
const count = ref(0)
</script>

<template>
  <!-- .value kerak EMAS template'da -->
  <p>{{ count.value }}</p> <!-- YOMON -->
  <p>{{ count }}</p> <!-- YAXSHI - auto unwrap -->
</template>

<script setup lang="ts">
// Script'da .value KERAK
function increment(): void {
  count.value++ // .value kerak
}
</script>
```

### 2. storeToRefs Unutish

```vue
<script setup lang="ts">
const store = useUserStore()

// YOMON: reactivity yo'qoladi
const { user, isLoggedIn } = store
// user va isLoggedIn reactive emas!

// YAXSHI: storeToRefs ishlatish
const { user, isLoggedIn } = storeToRefs(store)
// Endi reactive

// Actions uchun storeToRefs kerak EMAS
const { login, logout } = store // OK
</script>
```

### 3. Props Default Factory

```vue
<script setup lang="ts">
interface Props {
  items?: string[]
  config?: { theme: string }
}

// YOMON: object/array default to'g'ridan
const props = withDefaults(defineProps<Props>(), {
  items: [], // Bu bir xil reference bo'ladi barcha instance'larda!
  config: { theme: 'light' } // Xato
})

// YAXSHI: factory function
const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  config: () => ({ theme: 'light' })
})
</script>
```

### 4. Inject'da Undefined Check Unutish

```vue
<script setup lang="ts">
// YOMON: undefined tekshirmaslik
const ctx = inject(userKey)
ctx.user.value // ERROR: ctx possibly undefined

// YAXSHI 1: Optional chaining
ctx?.user.value

// YAXSHI 2: Default value
const ctx = inject(userKey, defaultValue)

// YAXSHI 3: Non-null assertion (faqat agar 100% provide qilingan)
const ctx = inject(userKey)!
</script>
```

### 5. Event Handler Types

```vue
<script setup lang="ts">
// YOMON: any ishlatish
function handleClick(e: any): void {
  console.log(e.target.value)
}

// YAXSHI: to'g'ri event type
function handleClick(e: MouseEvent): void {
  const target = e.target as HTMLButtonElement
  console.log(target.textContent)
}

function handleInput(e: Event): void {
  const target = e.target as HTMLInputElement
  console.log(target.value)
}
</script>

<template>
  <button @click="handleClick">Click</button>
  <input @input="handleInput" />
</template>
```

---

## Xulosa

Vue 3 + TypeScript kombinatsiyasi kuchli type-safe development tajribasini beradi:

1. **Script Setup** - eng zamonaviy va qulay syntax
2. **defineProps/defineEmits** - type-safe component API
3. **Generic Components** - qayta ishlatiladigan tipli komponentlar
4. **Pinia** - type-safe state management
5. **Vue Router** - typed routes va meta

Asosiy qoidalar:
- `lang="ts"` va strict mode ishlating
- `withDefaults` bilan default values
- `storeToRefs` bilan Pinia reactivity saqlang
- `InjectionKey` bilan type-safe provide/inject
- Generic components bilan qayta ishlatiladigan kod

Bu TypeScript bo'limining oxiri. Barcha mavzularni o'rganib, amalda qo'llang!
