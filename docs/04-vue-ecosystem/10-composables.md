# Composables - Qayta Ishlatiluvchi Mantiq

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturlashning Oltin Qoidasi - **DRY (Don't Repeat Yourself)**. Agar bitta funksionallik (masalan modal oynani ochish yopish) loyihaning 10 xil joyida kerak bo'lsa, siz uni 10 marta yozmaysiz. Vue 2 da bu muammo "Mixins" orqali hal qilingan edi, lekin u kodni chalkashlashtirardi (Nima qayerdan kelayotgani noma'lum edi). Composables — bu sizning mantiq (logic) ni qutiga solib, istalgan joyda toza import qilib ishlata olishingiz uchun eng mukammal yechimdir.

> [!NOTE]
> **Real-hayot analogiyasi: "Pazanda va Retsept"**  
> Agar siz har safar osh qilmoqchi bo'lsangiz, avval guruch yetishtirishni, sabzi ekishni o'rganmaysiz. Siz shunchaki tayyor "Osh Retsepti" ni olasiz.  
> Composable ham xuddi shunday "Retsept". Bir dasturchi `usePagination()` degan retseptni yozib qo'yadi. Endi loyihadagi 15 ta jadvalni (table) sahifalash uchun hech kim kodni boshidan yozmaydi, shunchaki `const { page, nextPage } = usePagination()` qilib retseptni ishlatib ketaveradi.

Composables - Vue 3 Composition API yordamida yaratilgan qayta ishlatiluvchi mantiq funksiyalari. Ular Options API'dagi mixins muammolarini hal qiladi va kod organizatsiyasini yaxshilaydi.

## Asosiy Tushuncha

### Composable Nima?

```mermaid
graph LR
    subgraph Composable [useFetch.js]
        State[Reaktiv Holat<br/>data, error, loading]
        Logic[Mantiq<br/>fetch(), abort()]
        Life[Lifecycle<br/>onMounted]
    end
    
    Comp1[Komponent 1] -->|import useFetch| Composable
    Comp2[Komponent 2] -->|import useFetch| Composable
    Comp3[Komponent 3] -->|import useFetch| Composable
    
    style Composable fill:#e3f2fd,stroke:#1565c0
```

```javascript
// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  // Reactive state
  const x = ref(0)
  const y = ref(0)

  // Logic
  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  // Lifecycle
  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  // Return reactive state
  return { x, y }
}

// Component'da ishlatish
<script setup>
import { useMouse } from '@/composables/useMouse'

const { x, y } = useMouse()
</script>

<template>
  <p>Mouse position: {{ x }}, {{ y }}</p>
</template>
```

### Nima Uchun Composables?

```javascript
// MUAMMO: Options API - mantiq tarqalgan
export default {
  data() {
    return {
      // Mouse tracking
      mouseX: 0,
      mouseY: 0,
      // Form
      formData: {},
      formErrors: {},
      // Fetch
      userData: null,
      userLoading: false
    }
  },

  computed: {
    fullName() { /* ... */ }
  },

  watch: {
    userId: 'fetchUser'
  },

  methods: {
    updateMouse() { /* ... */ },
    validateForm() { /* ... */ },
    fetchUser() { /* ... */ }
  },

  mounted() {
    window.addEventListener('mousemove', this.updateMouse)
  }
}

// YECHIM: Composables - mantiq guruhlangan
<script setup>
import { useMouse } from '@/composables/useMouse'
import { useForm } from '@/composables/useForm'
import { useUser } from '@/composables/useUser'

const { x, y } = useMouse()
const { formData, errors, validate } = useForm()
const { user, loading, fetchUser } = useUser(props.userId)
</script>
```

## Composable Patterns

### State + Methods Pattern

```javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const doubled = computed(() => count.value * 2)
  const isEven = computed(() => count.value % 2 === 0)

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
    doubled,
    isEven,
    increment,
    decrement,
    reset
  }
}
```

### Async Data Pattern

```javascript
// composables/useFetch.js
import { ref, shallowRef, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = shallowRef(null)
  const error = shallowRef(null)
  const loading = ref(false)

  async function execute() {
    // Reset
    data.value = null
    error.value = null
    loading.value = true

    try {
      const urlValue = toValue(url) // ref yoki getter bo'lishi mumkin
      const response = await fetch(urlValue)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      data.value = await response.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  // URL o'zgarganda qayta fetch
  watchEffect(() => {
    execute()
  })

  return { data, error, loading, execute }
}

// Ishlatish
const { data: users, loading, error } = useFetch('/api/users')
const { data: user } = useFetch(() => `/api/users/${userId.value}`)
```

### Async with Abort Pattern

```javascript
// composables/useAsyncData.js
import { ref, shallowRef, watch, onBeforeUnmount } from 'vue'

export function useAsyncData(asyncFn, options = {}) {
  const {
    immediate = true,
    resetOnExecute = true
  } = options

  const data = shallowRef(null)
  const error = shallowRef(null)
  const loading = ref(false)

  let abortController = null

  async function execute(...args) {
    // Cancel previous request
    abortController?.abort()
    abortController = new AbortController()

    if (resetOnExecute) {
      data.value = null
      error.value = null
    }

    loading.value = true

    try {
      const result = await asyncFn({
        signal: abortController.signal,
        args
      })
      data.value = result
    } catch (e) {
      if (e.name !== 'AbortError') {
        error.value = e
      }
    } finally {
      loading.value = false
    }
  }

  function cancel() {
    abortController?.abort()
    loading.value = false
  }

  if (immediate) {
    execute()
  }

  // Cleanup on unmount
  onBeforeUnmount(() => {
    cancel()
  })

  return {
    data,
    error,
    loading,
    execute,
    cancel
  }
}
```

### Form Handling Pattern

```javascript
// composables/useForm.js
import { reactive, ref, computed } from 'vue'

export function useForm(initialValues, validationRules = {}) {
  const values = reactive({ ...initialValues })
  const errors = reactive({})
  const touched = reactive({})
  const isSubmitting = ref(false)
  const submitCount = ref(0)

  const isValid = computed(() =>
    Object.keys(errors).every(key => !errors[key])
  )

  const isDirty = computed(() =>
    Object.keys(initialValues).some(
      key => values[key] !== initialValues[key]
    )
  )

  function validate(field = null) {
    const fieldsToValidate = field
      ? [field]
      : Object.keys(validationRules)

    let valid = true

    for (const fieldName of fieldsToValidate) {
      const rules = validationRules[fieldName]
      if (!rules) continue

      const fieldRules = Array.isArray(rules) ? rules : [rules]

      for (const rule of fieldRules) {
        const result = rule(values[fieldName], values)
        if (result !== true) {
          errors[fieldName] = result
          valid = false
          break
        }
        errors[fieldName] = null
      }
    }

    return valid
  }

  function setFieldValue(field, value) {
    values[field] = value
    if (touched[field]) {
      validate(field)
    }
  }

  function setFieldTouched(field, isTouched = true) {
    touched[field] = isTouched
    if (isTouched) {
      validate(field)
    }
  }

  function reset() {
    Object.assign(values, initialValues)
    Object.keys(errors).forEach(key => delete errors[key])
    Object.keys(touched).forEach(key => delete touched[key])
    submitCount.value = 0
  }

  async function handleSubmit(onSubmit) {
    submitCount.value++

    // Mark all fields as touched
    Object.keys(values).forEach(key => {
      touched[key] = true
    })

    if (!validate()) {
      return
    }

    isSubmitting.value = true
    try {
      await onSubmit(values)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    isSubmitting,
    submitCount,
    validate,
    setFieldValue,
    setFieldTouched,
    reset,
    handleSubmit
  }
}

// Validation helpers
export const required = (message = 'Majburiy maydon') =>
  value => (value !== null && value !== undefined && value !== '') || message

export const minLength = (min, message) =>
  value => !value || value.length >= min || message || `Kamida ${min} ta belgi`

export const email = (message = "Noto'g'ri email") =>
  value => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || message

export const matches = (fieldName, message = 'Qiymatlar mos emas') =>
  (value, values) => value === values[fieldName] || message
```

### Event Listener Pattern

```javascript
// composables/useEventListener.js
import { onMounted, onBeforeUnmount, unref, watch } from 'vue'

export function useEventListener(target, event, handler, options) {
  // target ref yoki element bo'lishi mumkin
  let cleanup

  const register = () => {
    const el = unref(target)
    if (!el) return

    el.addEventListener(event, handler, options)
    cleanup = () => el.removeEventListener(event, handler, options)
  }

  const unregister = () => {
    cleanup?.()
    cleanup = null
  }

  // Watch for target changes
  watch(
    () => unref(target),
    () => {
      unregister()
      register()
    },
    { immediate: true, flush: 'post' }
  )

  onBeforeUnmount(unregister)

  return unregister
}

// Ishlatish
const buttonRef = ref(null)
useEventListener(buttonRef, 'click', handleClick)
useEventListener(window, 'resize', handleResize)
useEventListener(document, 'keydown', handleKeydown)
```

### Local Storage Pattern

```javascript
// composables/useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  // Initial value from localStorage
  const storedValue = localStorage.getItem(key)
  const data = ref(
    storedValue !== null ? JSON.parse(storedValue) : defaultValue
  )

  // Sync to localStorage
  watch(data, (newValue) => {
    if (newValue === null || newValue === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(newValue))
    }
  }, { deep: true })

  // Listen for changes in other tabs
  const handleStorage = (event) => {
    if (event.key === key) {
      data.value = event.newValue ? JSON.parse(event.newValue) : defaultValue
    }
  }

  window.addEventListener('storage', handleStorage)

  onBeforeUnmount(() => {
    window.removeEventListener('storage', handleStorage)
  })

  return data
}

// Ishlatish
const theme = useLocalStorage('theme', 'light')
const user = useLocalStorage('user', null)
```

### Debounce Pattern

```javascript
// composables/useDebounce.js
import { ref, watch } from 'vue'

export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value)
  let timeout

  watch(value, (newValue) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}

export function useDebouncedFn(fn, delay = 300) {
  let timeout

  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

// Ishlatish
const searchQuery = ref('')
const debouncedQuery = useDebounce(searchQuery, 500)

watch(debouncedQuery, (query) => {
  fetchResults(query)
})
```

## Real-World Composables

### useAuth

```javascript
// composables/useAuth.js
import { ref, computed, readonly } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

// Global state (singleton)
const user = ref(null)
const token = ref(localStorage.getItem('token'))
const loading = ref(false)

export function useAuth() {
  const router = useRouter()

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(credentials) {
    loading.value = true
    try {
      const response = await api.post('/auth/login', credentials)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      return response
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      router.push('/login')
    }
  }

  async function fetchUser() {
    if (!token.value) return

    loading.value = true
    try {
      user.value = await api.get('/auth/me')
    } catch {
      await logout()
    } finally {
      loading.value = false
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    loading: readonly(loading),
    isAuthenticated,
    isAdmin,
    login,
    logout,
    fetchUser
  }
}
```

### usePagination

```javascript
// composables/usePagination.js
import { ref, computed, watch } from 'vue'

export function usePagination(fetchFn, options = {}) {
  const {
    pageSize = 20,
    initialPage = 1
  } = options

  const items = ref([])
  const currentPage = ref(initialPage)
  const totalItems = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const totalPages = computed(() =>
    Math.ceil(totalItems.value / pageSize)
  )

  const hasNextPage = computed(() =>
    currentPage.value < totalPages.value
  )

  const hasPrevPage = computed(() =>
    currentPage.value > 1
  )

  const pageInfo = computed(() => ({
    current: currentPage.value,
    total: totalPages.value,
    from: (currentPage.value - 1) * pageSize + 1,
    to: Math.min(currentPage.value * pageSize, totalItems.value),
    totalItems: totalItems.value
  }))

  async function fetch(page = currentPage.value) {
    loading.value = true
    error.value = null

    try {
      const result = await fetchFn({
        page,
        pageSize,
        offset: (page - 1) * pageSize
      })

      items.value = result.items
      totalItems.value = result.total
      currentPage.value = page
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  function nextPage() {
    if (hasNextPage.value) {
      fetch(currentPage.value + 1)
    }
  }

  function prevPage() {
    if (hasPrevPage.value) {
      fetch(currentPage.value - 1)
    }
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      fetch(page)
    }
  }

  // Initial fetch
  fetch()

  return {
    items,
    currentPage,
    totalPages,
    totalItems,
    loading,
    error,
    hasNextPage,
    hasPrevPage,
    pageInfo,
    fetch,
    nextPage,
    prevPage,
    goToPage
  }
}
```

### useInfiniteScroll

```javascript
// composables/useInfiniteScroll.js
import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useInfiniteScroll(fetchFn, options = {}) {
  const {
    threshold = 100,
    pageSize = 20,
    container = null
  } = options

  const items = ref([])
  const page = ref(1)
  const loading = ref(false)
  const hasMore = ref(true)
  const error = ref(null)

  async function loadMore() {
    if (loading.value || !hasMore.value) return

    loading.value = true
    error.value = null

    try {
      const newItems = await fetchFn({
        page: page.value,
        pageSize
      })

      if (newItems.length < pageSize) {
        hasMore.value = false
      }

      items.value = [...items.value, ...newItems]
      page.value++
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  function reset() {
    items.value = []
    page.value = 1
    hasMore.value = true
    error.value = null
  }

  function handleScroll() {
    const scrollContainer = container?.value || document.documentElement
    const scrollTop = scrollContainer.scrollTop
    const scrollHeight = scrollContainer.scrollHeight
    const clientHeight = scrollContainer.clientHeight

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMore()
    }
  }

  onMounted(() => {
    loadMore()
    const target = container?.value || window
    target.addEventListener('scroll', handleScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    const target = container?.value || window
    target.removeEventListener('scroll', handleScroll)
  })

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    reset
  }
}
```

### useWebSocket

```javascript
// composables/useWebSocket.js
import { ref, onBeforeUnmount } from 'vue'

export function useWebSocket(url, options = {}) {
  const {
    autoConnect = true,
    reconnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000
  } = options

  const data = ref(null)
  const status = ref('CLOSED')
  const error = ref(null)

  let ws = null
  let reconnectCount = 0
  let reconnectTimer = null

  function connect() {
    if (ws?.readyState === WebSocket.OPEN) return

    ws = new WebSocket(url)
    status.value = 'CONNECTING'

    ws.onopen = () => {
      status.value = 'OPEN'
      reconnectCount = 0
      error.value = null
    }

    ws.onmessage = (event) => {
      try {
        data.value = JSON.parse(event.data)
      } catch {
        data.value = event.data
      }
    }

    ws.onerror = (e) => {
      error.value = e
    }

    ws.onclose = () => {
      status.value = 'CLOSED'

      if (reconnect && reconnectCount < reconnectAttempts) {
        reconnectTimer = setTimeout(() => {
          reconnectCount++
          connect()
        }, reconnectInterval)
      }
    }
  }

  function send(message) {
    if (ws?.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected')
    }

    const data = typeof message === 'string'
      ? message
      : JSON.stringify(message)

    ws.send(data)
  }

  function close() {
    clearTimeout(reconnectTimer)
    reconnectCount = reconnectAttempts // Prevent reconnect
    ws?.close()
  }

  if (autoConnect) {
    connect()
  }

  onBeforeUnmount(() => {
    close()
  })

  return {
    data,
    status,
    error,
    connect,
    send,
    close
  }
}
```

## Best Practices

### Naming Convention

```javascript
// use prefix
useMouse()
useFetch()
useAuth()
useLocalStorage()

// NOT: getMouse, fetchData, authHelpers
```

### Return Pattern

```javascript
// Object qaytarish - destructuring friendly
export function useCounter() {
  const count = ref(0)

  return {
    count,           // Reactive state
    increment,       // Methods
    decrement,
    reset
  }
}

// Array qaytarish - kam ishlatiladi
export function useState(initial) {
  const state = ref(initial)
  const setState = (val) => state.value = val

  return [state, setState] // React-like
}
```

### Input Flexibility

```javascript
// ref yoki getter qabul qilish
export function useTitle(title) {
  watchEffect(() => {
    document.title = toValue(title) // ref yoki getter
  })
}

// Ishlatish
useTitle('Static Title')
useTitle(ref('Reactive Title'))
useTitle(() => `User: ${user.value.name}`)
```

### Cleanup

```javascript
export function useInterval(fn, interval) {
  const id = setInterval(fn, interval)

  // MUHIM: cleanup
  onBeforeUnmount(() => {
    clearInterval(id)
  })

  // Manual stop
  return () => clearInterval(id)
}
```

### Readonly for External State

```javascript
export function useCounter() {
  const count = ref(0)

  return {
    // External code o'zgartira olmaydi
    count: readonly(count),
    // Faqat method orqali
    increment: () => count.value++
  }
}
```

## Vue 2 vs Vue 3

```javascript
// Vue 2 - Mixins (muammoli)
const mouseMixin = {
  data() {
    return {
      mouseX: 0, // Nom to'qnashuvi xavfi
      mouseY: 0
    }
  },
  mounted() {
    window.addEventListener('mousemove', this.updateMouse)
  },
  methods: {
    updateMouse(e) {
      this.mouseX = e.pageX
      this.mouseY = e.pageY
    }
  }
}

// Vue 3 - Composables (yaxshi)
export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  return { x, y }
}
```

| Mixins Muammosi | Composables Yechimi |
|-----------------|---------------------|
| Nom to'qnashuvi | Destructuring orqali nomi tanlash |
| Implicit dependencies | Explicit imports |
| Property source noaniq | Qayerdan kelgani aniq |
| TypeScript qiyin | To'liq type inference |

## Interview Savollari

### 1. Composable nima va mixin'dan farqi?

**Javob:**

Composable - Composition API bilan yaratilgan qayta ishlatiluvchi mantiq funksiyasi.

| Jihat | Mixin | Composable |
|-------|-------|------------|
| Syntax | Options object | Function |
| Nom to'qnashuvi | Ha | Yo'q (destructuring) |
| Dependencies | Implicit | Explicit (import) |
| TypeScript | Qiyin | To'liq support |
| Source tracking | Noaniq | Aniq |

### 2. Composable yaratishda best practices?

**Javob:**

1. **Naming**: `use` prefix (`useMouse`, `useFetch`)
2. **Return**: Object qaytarish (destructuring uchun)
3. **Input**: `toValue()` - ref yoki plain value
4. **Cleanup**: `onBeforeUnmount` da cleanup
5. **Readonly**: External state readonly qilish
6. **TypeScript**: Generic types ishlatish

### 3. Composable'da global state qanday yaratiladi?

**Javob:**

```javascript
// composables/useAuth.js

// Module scope - global (singleton)
const user = ref(null)
const token = ref(null)

export function useAuth() {
  // Har chaqiruvda bir xil state
  return {
    user: readonly(user),
    token: readonly(token),
    login,
    logout
  }
}
```

### 4. Async composable qanday yaratiladi?

**Javob:**

```javascript
export function useAsyncData(asyncFn) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function execute(...args) {
    loading.value = true
    try {
      data.value = await asyncFn(...args)
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    execute
  }
}
```

### 5. Composable vs utility function farqi?

**Javob:**

```javascript
// Utility - oddiy function (reactive emas)
function formatDate(date) {
  return new Intl.DateTimeFormat('uz').format(date)
}

// Composable - reactive state + lifecycle
function useDate() {
  const now = ref(new Date())

  onMounted(() => {
    setInterval(() => {
      now.value = new Date()
    }, 1000)
  })

  return {
    now,
    formatted: computed(() => formatDate(now.value))
  }
}
```

Composable xususiyatlari:
- Reactive state (`ref`, `reactive`)
- Lifecycle hooks (`onMounted`, etc.)
- Vue context (`inject`, `provide`)

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **"use" bilan boshlang:** Har doim fayl va funksiya nomini `use` so'zi bilan boshlang (`useMouse`, `useFetch`). Bu React Hooks'dan qolgan global standartdir.
2. **VueUse kutubxonasi:** O'zingiz `useWindowScroll` yoki `useLocalStorage` yozishga shoshilmang. Vue hamjamiyatida 200+ tayyor composables yig'ilgan eng zo'r **VueUse** kutubxonasi bor. Avval shuni tekshiring!
3. **Parametrlarda moslashuvchanlik:** Composable argument sifatida ham oddiy qiymat, ham `ref` qabul qila olishi kerak. Buning uchun argumentni ichkarida `toValue()` orqali o'qib oling.

---

## Xulosa

Composables Vue 3 ning eng muhim pattern'laridan biri:

- **Qayta ishlatish** - Mantiqni komponentlar orasida ulashish
- **Organizatsiya** - Feature bo'yicha kod guruhlash
- **TypeScript** - To'liq type inference
- **Testing** - Oson test qilish

VueUse kutubxonasi 200+ tayyor composable taqdim etadi.
