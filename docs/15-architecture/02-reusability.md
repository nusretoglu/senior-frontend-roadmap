# Reusability - Kodni Qayta Ishlatish Prinsiplari

## Kirish

Reusability (qayta ishlatiluvhanlik) - bu bir marta yozilgan kodni bir nechta joylarda, loyihalarda va kontekstlarda samarali ishlatish qobiliyatidir. Yaxshi reusability DRY (Don't Repeat Yourself) prinsipiga asoslanadi, lekin haddan tashqari abstraksiya ham muammo keltirib chiqaradi.

## Nazariy Asos

### Reusability Piramidasi

```
                         ▲
                        /│\
                       / │ \
                      /  │  \    Cross-Project
                     /   │   \   (npm packages)
                    /────┼────\
                   /     │     \
                  /      │      \   Cross-Feature
                 /       │       \  (shared folder)
                /────────┼────────\
               /         │         \
              /          │          \   Within Feature
             /           │           \  (local reuse)
            ▼────────────┴────────────▼
```

### Abstraction Levels

| Daraja | Misol | Qayta ishlatish soni | Complexity |
|--------|-------|---------------------|------------|
| **Utility** | formatDate, debounce | 50+ | Low |
| **Component** | Button, Input, Modal | 20-50 | Medium |
| **Composable** | useAuth, useForm | 5-20 | Medium-High |
| **Module** | Auth module, Payment module | 2-5 | High |
| **Library** | Design system, SDK | Cross-project | Very High |

### Rule of Three

```
┌─────────────────────────────────────────────────────────────────┐
│                     RULE OF THREE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1-chi bor → Yoz                                                │
│   2-chi bor → E'tibor ber, hali copy OK                         │
│   3-chi bor → Abstraksiya qil                                   │
│                                                                  │
│   Nima uchun?                                                    │
│   • Premature abstraction → wrong abstraction                   │
│   • 3 ta pattern → to'g'ri abstraksiya topiladi                 │
│   • YAGNI (You Aren't Gonna Need It)                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Code Misollari

### 1. Utility Functions - Eng Kichik Reusable Unit

```javascript
// ========================================
// YOMON: Inline repeated logic
// ========================================

// Component A
const formattedDate = new Date(user.createdAt).toLocaleDateString('uz-UZ', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

// Component B
const orderDate = new Date(order.date).toLocaleDateString('uz-UZ', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

// Component C
const publishedDate = new Date(post.publishedAt).toLocaleDateString('uz-UZ', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

// Muammo: 3 joyda bir xil kod
// Muammo: Format o'zgartirish kerak bo'lsa 3 joyni o'zgartirish kerak

// ========================================
// YAXSHI: Reusable utility
// ========================================

// utils/date.js
export const dateFormats = {
  full: { year: 'numeric', month: 'long', day: 'numeric' },
  short: { year: '2-digit', month: '2-digit', day: '2-digit' },
  monthYear: { year: 'numeric', month: 'long' },
}

export function formatDate(date, format = 'full', locale = 'uz-UZ') {
  if (!date) return ''

  const dateObj = date instanceof Date ? date : new Date(date)

  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date:', date)
    return ''
  }

  const formatOptions = typeof format === 'string'
    ? dateFormats[format] ?? dateFormats.full
    : format

  return dateObj.toLocaleDateString(locale, formatOptions)
}

export function formatRelativeTime(date, locale = 'uz-UZ') {
  const now = new Date()
  const dateObj = date instanceof Date ? date : new Date(date)
  const diffMs = now - dateObj
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Bugun'
  if (diffDays === 1) return 'Kecha'
  if (diffDays < 7) return `${diffDays} kun oldin`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta oldin`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} oy oldin`

  return formatDate(date, 'full', locale)
}

// Foydalanish - consistent across app
import { formatDate, formatRelativeTime } from '@/utils/date'

const formattedDate = formatDate(user.createdAt)
const relativeDate = formatRelativeTime(order.date)
```

### 2. Reusable Components - Different Abstraction Levels

```vue
// ========================================
// YOMON: Juda specific, qayta ishlatib bo'lmaydi
// ========================================
<!-- UserProfileButton.vue -->
<template>
  <button
    class="bg-blue-500 text-white px-4 py-2 rounded-lg
           hover:bg-blue-600 transition-colors"
    @click="goToProfile"
  >
    <UserIcon class="w-5 h-5 mr-2" />
    View Profile
  </button>
</template>

<!-- ProductAddToCartButton.vue -->
<template>
  <button
    class="bg-green-500 text-white px-4 py-2 rounded-lg
           hover:bg-green-600 transition-colors"
    @click="addToCart"
  >
    <CartIcon class="w-5 h-5 mr-2" />
    Add to Cart
  </button>
</template>

// Muammo: Har bir use-case uchun yangi komponent
// Muammo: Dizayn o'zgarsa barcha buttonlarni o'zgartirish kerak

// ========================================
// YAXSHI: Flexible, configurable component
// ========================================

<!-- BaseButton.vue -->
<template>
  <button
    :class="[
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      { 'opacity-50 cursor-not-allowed': disabled || loading }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="animate-spin mr-2">
      <LoadingIcon class="w-4 h-4" />
    </span>

    <span v-if="$slots.icon && iconPosition === 'left'" class="mr-2">
      <slot name="icon" />
    </span>

    <slot />

    <span v-if="$slots.icon && iconPosition === 'right'" class="ml-2">
      <slot name="icon" />
    </span>
  </button>
</template>

<script setup>
defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'ghost'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  disabled: Boolean,
  loading: Boolean,
  iconPosition: {
    type: String,
    default: 'left',
  },
})

const baseClasses = `
  inline-flex items-center justify-center
  font-medium rounded-lg
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-offset-2
`

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}
</script>

<!-- Foydalanish -->
<template>
  <BaseButton variant="primary" @click="goToProfile">
    <template #icon>
      <UserIcon class="w-5 h-5" />
    </template>
    View Profile
  </BaseButton>

  <BaseButton variant="secondary" size="lg" :loading="isAdding" @click="addToCart">
    <template #icon>
      <CartIcon class="w-5 h-5" />
    </template>
    Add to Cart
  </BaseButton>

  <BaseButton variant="danger" :disabled="!canDelete" @click="deleteItem">
    Delete
  </BaseButton>
</template>
```

### 3. Composables - Logic Reusability

```javascript
// ========================================
// YOMON: Har komponentda takrorlanadigan mantiq
// ========================================

// ProductList.vue
export default {
  data() {
    return {
      products: [],
      loading: false,
      error: null,
      page: 1,
      hasMore: true,
    }
  },
  async mounted() {
    await this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      this.loading = true
      try {
        const response = await fetch(`/api/products?page=${this.page}`)
        const data = await response.json()
        this.products = [...this.products, ...data.items]
        this.hasMore = data.hasMore
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async loadMore() {
      this.page++
      await this.fetchProducts()
    }
  }
}

// Orders.vue - deyarli bir xil kod
// Users.vue - deyarli bir xil kod
// Comments.vue - deyarli bir xil kod

// ========================================
// YAXSHI: Generic composable
// ========================================

// composables/usePaginatedList.js
import { ref, reactive, onMounted } from 'vue'

export function usePaginatedList(fetchFn, options = {}) {
  const {
    pageSize = 20,
    immediate = true,
    initialPage = 1,
  } = options

  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const pagination = reactive({
    page: initialPage,
    pageSize,
    total: 0,
    hasMore: true,
  })

  async function fetch(reset = false) {
    if (loading.value) return
    if (!pagination.hasMore && !reset) return

    if (reset) {
      pagination.page = initialPage
      items.value = []
      pagination.hasMore = true
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetchFn({
        page: pagination.page,
        pageSize: pagination.pageSize,
      })

      items.value = reset
        ? response.items
        : [...items.value, ...response.items]

      pagination.total = response.total
      pagination.hasMore = items.value.length < response.total
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (!pagination.hasMore || loading.value) return
    pagination.page++
    await fetch()
  }

  async function refresh() {
    await fetch(true)
  }

  if (immediate) {
    onMounted(fetch)
  }

  return {
    items,
    loading,
    error,
    pagination,
    fetch,
    loadMore,
    refresh,
  }
}

// Foydalanish - turli kontekstlarda
// ProductList.vue
<script setup>
import { usePaginatedList } from '@/composables/usePaginatedList'
import { productsApi } from '@/api/products'

const {
  items: products,
  loading,
  error,
  pagination,
  loadMore,
  refresh,
} = usePaginatedList(
  ({ page, pageSize }) => productsApi.getAll({ page, pageSize }),
  { pageSize: 12 }
)
</script>

// Orders.vue
<script setup>
import { usePaginatedList } from '@/composables/usePaginatedList'
import { ordersApi } from '@/api/orders'

const {
  items: orders,
  loading,
  loadMore,
} = usePaginatedList(
  ({ page, pageSize }) => ordersApi.getUserOrders({ page, pageSize })
)
</script>

// Comments.vue - with additional filtering
<script setup>
import { usePaginatedList } from '@/composables/usePaginatedList'
import { commentsApi } from '@/api/comments'

const props = defineProps({
  postId: { type: String, required: true }
})

const {
  items: comments,
  loading,
  loadMore,
  refresh,
} = usePaginatedList(
  ({ page, pageSize }) => commentsApi.getByPost(props.postId, { page, pageSize }),
  { pageSize: 10 }
)

// Watch for postId changes
watch(() => props.postId, () => refresh())
</script>
```

### 4. Form Handling - Complex Reusable Logic

```javascript
// ========================================
// YOMON: Har formada takrorlanadigan validation
// ========================================

// LoginForm.vue
export default {
  data() {
    return {
      email: '',
      password: '',
      errors: {},
      touched: {},
      isSubmitting: false,
    }
  },
  methods: {
    validateEmail() {
      if (!this.email) {
        this.errors.email = 'Email kiritilishi shart'
      } else if (!/\S+@\S+\.\S+/.test(this.email)) {
        this.errors.email = 'Email formati xato'
      } else {
        delete this.errors.email
      }
    },
    validatePassword() {
      if (!this.password) {
        this.errors.password = 'Parol kiritilishi shart'
      } else if (this.password.length < 8) {
        this.errors.password = 'Parol 8 ta belgidan kam bolmasligi kerak'
      } else {
        delete this.errors.password
      }
    },
    // ... more repetitive code
  }
}

// ========================================
// YAXSHI: Reusable form composable
// ========================================

// composables/useForm.js
import { ref, reactive, computed, watch } from 'vue'

// Validation rules factory
export const rules = {
  required: (message = 'Bu maydon majburiy') =>
    (value) => (value !== null && value !== undefined && value !== '') || message,

  email: (message = 'Email formati xato') =>
    (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || message,

  minLength: (min, message) =>
    (value) => !value || value.length >= min || message || `Kamida ${min} ta belgi`,

  maxLength: (max, message) =>
    (value) => !value || value.length <= max || message || `Ko'pi bilan ${max} ta belgi`,

  pattern: (regex, message = 'Format xato') =>
    (value) => !value || regex.test(value) || message,

  match: (fieldGetter, message = "Maydonlar mos emas") =>
    (value) => value === fieldGetter() || message,
}

export function useForm(initialValues, validationSchema = {}) {
  // Form state
  const values = reactive({ ...initialValues })
  const errors = reactive({})
  const touched = reactive({})

  // Meta state
  const isSubmitting = ref(false)
  const isValidating = ref(false)
  const submitCount = ref(0)

  // Computed
  const isValid = computed(() => Object.keys(errors).length === 0)

  const isDirty = computed(() => {
    return Object.keys(initialValues).some(
      (key) => values[key] !== initialValues[key]
    )
  })

  // Validate single field
  function validateField(field) {
    const fieldRules = validationSchema[field]
    if (!fieldRules) return true

    const rulesArray = Array.isArray(fieldRules) ? fieldRules : [fieldRules]

    for (const rule of rulesArray) {
      const result = rule(values[field])
      if (result !== true) {
        errors[field] = result
        return false
      }
    }

    delete errors[field]
    return true
  }

  // Validate all fields
  function validateAll() {
    isValidating.value = true
    let valid = true

    Object.keys(validationSchema).forEach((field) => {
      touched[field] = true
      if (!validateField(field)) {
        valid = false
      }
    })

    isValidating.value = false
    return valid
  }

  // Field handlers
  function setFieldValue(field, value) {
    values[field] = value
    if (touched[field]) {
      validateField(field)
    }
  }

  function setFieldTouched(field, isTouched = true) {
    touched[field] = isTouched
    if (isTouched) {
      validateField(field)
    }
  }

  // Reset form
  function reset(newValues = initialValues) {
    Object.keys(values).forEach((key) => {
      values[key] = newValues[key] ?? initialValues[key]
    })
    Object.keys(errors).forEach((key) => delete errors[key])
    Object.keys(touched).forEach((key) => delete touched[key])
    isSubmitting.value = false
  }

  // Submit handler factory
  function handleSubmit(onSubmit, onError) {
    return async (event) => {
      event?.preventDefault()

      submitCount.value++

      if (!validateAll()) {
        onError?.(errors)
        return
      }

      isSubmitting.value = true

      try {
        await onSubmit(values)
      } catch (error) {
        onError?.(error)
      } finally {
        isSubmitting.value = false
      }
    }
  }

  // Watch fields for real-time validation (optional)
  function enableRealtimeValidation() {
    Object.keys(validationSchema).forEach((field) => {
      watch(
        () => values[field],
        () => {
          if (touched[field]) {
            validateField(field)
          }
        }
      )
    })
  }

  return {
    // State
    values,
    errors,
    touched,

    // Meta
    isSubmitting,
    isValidating,
    isValid,
    isDirty,
    submitCount,

    // Actions
    setFieldValue,
    setFieldTouched,
    validateField,
    validateAll,
    reset,
    handleSubmit,
    enableRealtimeValidation,
  }
}

// ========================================
// Foydalanish
// ========================================

// LoginForm.vue
<template>
  <form @submit="onSubmit">
    <BaseInput
      v-model="values.email"
      label="Email"
      type="email"
      :error="errors.email"
      @blur="setFieldTouched('email')"
    />

    <BaseInput
      v-model="values.password"
      label="Parol"
      type="password"
      :error="errors.password"
      @blur="setFieldTouched('password')"
    />

    <BaseButton
      type="submit"
      :loading="isSubmitting"
      :disabled="!isValid"
    >
      Kirish
    </BaseButton>
  </form>
</template>

<script setup>
import { useForm, rules } from '@/composables/useForm'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const {
  values,
  errors,
  isSubmitting,
  isValid,
  setFieldTouched,
  handleSubmit,
  enableRealtimeValidation,
} = useForm(
  {
    email: '',
    password: '',
  },
  {
    email: [rules.required('Email kiriting'), rules.email()],
    password: [rules.required('Parol kiriting'), rules.minLength(8)],
  }
)

enableRealtimeValidation()

const onSubmit = handleSubmit(
  async (formValues) => {
    await authStore.login(formValues)
  },
  (error) => {
    console.error('Form error:', error)
  }
)
</script>

// RegisterForm.vue - Same composable, different schema
<script setup>
const {
  values,
  errors,
  handleSubmit,
} = useForm(
  {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  {
    name: [rules.required(), rules.minLength(2), rules.maxLength(50)],
    email: [rules.required(), rules.email()],
    password: [rules.required(), rules.minLength(8)],
    confirmPassword: [
      rules.required('Parolni tasdiqlang'),
      rules.match(() => values.password, 'Parollar mos emas'),
    ],
  }
)
</script>
```

### 5. Higher-Order Components Pattern

```javascript
// ========================================
// Generic wrapper pattern
// ========================================

// components/withAuth.js - HOC pattern
import { h, defineComponent } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function withAuth(WrappedComponent, options = {}) {
  const {
    roles = [],
    redirectTo = '/login',
    fallback = null,
  } = options

  return defineComponent({
    name: `WithAuth(${WrappedComponent.name || 'Component'})`,

    setup(props, { slots }) {
      const authStore = useAuthStore()
      const router = useRouter()

      // Check auth
      if (!authStore.isAuthenticated) {
        router.push(redirectTo)
        return () => null
      }

      // Check roles
      if (roles.length && !roles.includes(authStore.userRole)) {
        return () => fallback ? h(fallback) : h('div', 'Access Denied')
      }

      return () => h(WrappedComponent, props, slots)
    },
  })
}

// Foydalanish
import AdminDashboard from './AdminDashboard.vue'
import { withAuth } from '@/components/withAuth'

export default withAuth(AdminDashboard, {
  roles: ['admin'],
  fallback: AccessDeniedPage,
})

// ========================================
// Renderless component pattern
// ========================================

// components/DataLoader.vue
<script>
import { ref, watch, onMounted } from 'vue'

export default {
  name: 'DataLoader',

  props: {
    fetchFn: {
      type: Function,
      required: true,
    },
    immediate: {
      type: Boolean,
      default: true,
    },
    watchDeps: {
      type: Array,
      default: () => [],
    },
  },

  setup(props, { slots }) {
    const data = ref(null)
    const loading = ref(false)
    const error = ref(null)

    async function load() {
      loading.value = true
      error.value = null

      try {
        data.value = await props.fetchFn()
      } catch (e) {
        error.value = e
      } finally {
        loading.value = false
      }
    }

    if (props.immediate) {
      onMounted(load)
    }

    // Watch dependencies for refetch
    if (props.watchDeps.length) {
      watch(props.watchDeps, load)
    }

    // Renderless - expose state via slot
    return () => slots.default?.({
      data: data.value,
      loading: loading.value,
      error: error.value,
      reload: load,
    })
  },
}
</script>

// Foydalanish
<template>
  <DataLoader :fetch-fn="fetchUser" v-slot="{ data: user, loading, error, reload }">
    <LoadingSpinner v-if="loading" />
    <ErrorMessage v-else-if="error" :error="error" @retry="reload" />
    <UserProfile v-else :user="user" />
  </DataLoader>
</template>
```

## Real-World Case Study

### Case: Design System Development

**Vaziyat:** Kompaniyada 5 ta turli loyiha bor, har biri o'z UI komponentlarini yaratgan. Dizayn izchilligi yo'q, har loyihada bir xil komponentlar qayta-qayta yozilmoqda.

**Yechim: Shared Design System**

```
Arxitektura:
──────────────────────────────────────────────────────

packages/
├── design-tokens/           # Colors, spacing, typography
│   ├── tokens.json
│   └── build.js             # Token transformer
│
├── ui-components/           # Base components
│   ├── Button/
│   │   ├── Button.vue
│   │   ├── Button.test.js
│   │   ├── Button.stories.js
│   │   └── index.js
│   ├── Input/
│   ├── Modal/
│   └── index.js             # Barrel export
│
├── composables/             # Shared logic
│   ├── useForm/
│   ├── usePagination/
│   └── index.js
│
└── utils/                   # Utility functions
    ├── date/
    ├── validation/
    └── index.js

Natijalar:
├── 60% kam duplicate kod
├── Consistent UX across all apps
├── Faster feature development
├── Single source of truth for design
└── Centralized bug fixes
```

## Interview Savollari

### 1. Junior-Middle Level
**Savol:** DRY prinsipining haddan tashqari qo'llanilishi qanday muammolarga olib keladi?

**Javob:** Haddan tashqari DRY quyidagi muammolarni keltirib chiqaradi:
- **Wrong abstraction** - Faqat syntactically o'xshash, lekin semantically farqli kodlarni abstract qilish
- **Tight coupling** - Abstraksiya juda ko'p joydan chaqirilsa, o'zgartirish qiyin
- **Complexity** - Oddiy narsani murakkablashtirish
- **WET is sometimes better** - "Write Everything Twice" - ikkinchi marta yozganda pattern aniq ko'rinadi

### 2. Middle-Senior Level
**Savol:** Composable va utility function o'rtasidagi farq nima? Qachon qaysini ishlatish kerak?

**Javob:**
```javascript
// Utility - stateless, pure function
export function formatPrice(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Composable - stateful, Vue reactivity
export function usePriceFormatter(initialCurrency = 'USD') {
  const currency = ref(initialCurrency)

  const format = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.value,
    }).format(amount)
  }

  function setCurrency(newCurrency) {
    currency.value = newCurrency
  }

  return { currency, format, setCurrency }
}

// Utility ishlatish: Stateless transformation
// Composable ishlatish: State, lifecycle, reactivity kerak bo'lganda
```

### 3. Senior Level
**Savol:** Cross-project reusability uchun npm package qilishda nimalarni hisobga olish kerak?

**Javob:**
```
1. API DESIGN
   ├── Minimal, focused API
   ├── Backward compatibility
   ├── Clear documentation
   └── TypeScript types

2. BUILD & DISTRIBUTION
   ├── Multiple formats (ESM, CJS, UMD)
   ├── Tree-shakeable exports
   ├── Peer dependencies (Vue, React)
   └── Minimal bundle size

3. VERSIONING
   ├── Semantic versioning
   ├── Changelog maintenance
   ├── Deprecation strategy
   └── Migration guides

4. QUALITY
   ├── 100% test coverage
   ├── Storybook/documentation
   ├── CI/CD pipeline
   └── Security audits
```

### 4. Senior/Lead Level
**Savol:** Reusable komponent yaratishda configuration vs composition qaysi yaxshiroq?

**Javob:**
```javascript
// Configuration approach - props orqali
<DataTable
  :data="users"
  :columns="columns"
  :sortable="true"
  :filterable="true"
  :paginated="true"
  :page-size="20"
  :selectable="true"
/>
// Pros: Simple API, one import
// Cons: Less flexible, prop explosion, hard to customize

// Composition approach - slots va composables
<DataTable :data="users">
  <template #header>
    <TableFilter @change="filter" />
    <TableSort @change="sort" />
  </template>

  <template #row="{ item }">
    <UserRow :user="item" @select="select" />
  </template>

  <template #footer>
    <Pagination :total="total" @change="paginate" />
  </template>
</DataTable>
// Pros: Flexible, customizable, explicit
// Cons: More code, steeper learning curve

// Best: Hybrid approach
// - Reasonable defaults via props
// - Escape hatches via slots
// - Logic via composables
```

### 5. Architect Level
**Savol:** Micro-frontend arxitekturasida komponentlarni qanday share qilasiz?

**Javob:**
```
Strategies:
───────────────────────────────────────────

1. NPM PACKAGE
   ├── Traditional distribution
   ├── Versioned, tested
   ├── Build-time integration
   └── Cons: Deploy all MFEs on update

2. MODULE FEDERATION
   ├── Runtime sharing
   ├── Singleton instances (Vue, React)
   ├── No rebuild needed
   └── Cons: Runtime complexity

3. WEB COMPONENTS
   ├── Framework agnostic
   ├── Native browser support
   ├── Shadow DOM isolation
   └── Cons: Limited Vue/React features

4. DESIGN TOKENS + DOCS
   ├── Share design, not code
   ├── Each MFE implements
   ├── Maximum flexibility
   └── Cons: Potential inconsistency

Recommendation:
├── Core UI → Module Federation
├── Design tokens → NPM package
├── Complex widgets → Web Components
└── Documentation → Storybook
```

## Senior vs Middle Farqi

| Aspekt | Middle | Senior |
|--------|--------|--------|
| **Abstraction timing** | 2-chi takrorlashda | Rule of Three |
| **API design** | Works | Intuitive, documented |
| **Testing** | Unit tests | Contract tests, edge cases |
| **Versioning** | Updates | Semver, migration paths |
| **Scope** | Within project | Cross-project, cross-team |

### Middle Developer
- DRY prinsipini biladi
- Composables yozadi
- Component props design
- Internal reuse

### Senior Developer
- Wrong abstraction'ni taniydi
- API design principles
- Backward compatibility planning
- Documentation culture
- Reusability vs flexibility trade-offs
- Cross-project package maintenance

---

> **Eslatma:** Eng yaxshi reusable kod - bu yozilmagan kod. Mavjud yechimlarni (VueUse, Lodash, etc.) ishlatishni avval ko'rib chiqing.
