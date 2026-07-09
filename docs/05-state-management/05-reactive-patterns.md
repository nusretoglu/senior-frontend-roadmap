# Reactive Patterns

## Mundarija
1. [Reaktivlik Nima?](#reaktivlik-nima)
2. [ref vs reactive](#ref-vs-reactive)
3. [computed Properties](#computed-properties)
4. [watch va watchEffect](#watch-va-watcheffect)
5. [shallowRef va shallowReactive](#shallowref-va-shallowreactive)
6. [toRef va toRefs](#toref-va-torefs)
7. [Advanced Reactive Patterns](#advanced-reactive-patterns)
8. [To'g'ri va Noto'g'ri Yondashuvlar](#togri-va-notogri-yondashuvlar)
9. [Real-World Patterns](#real-world-patterns)
10. [Interview Savollari](#interview-savollari)

---

## Reaktivlik Nima?

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Zamonaviy web-dasturlashda eng katta muammo DOM ni qo'lda yangilash (masalan `document.getElementById('...').innerText = ...`). Reaktivlik bizni bu azobdan qutqaradi. Siz faqat o'zgaruvchilarni (state) o'zgartirasiz, UI esa o'zi avtomatik yangilanadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Excel Jadvallari"**  
> Tasavvur qiling sizda Excel jadvali bor. A1 katakchada `10`, B1 katakchada `20` qiymati bor. C1 katakchaga `=A1+B1` formulasini yozdingiz (`30` chiqdi). Agar A1 ni `50` ga o'zgartirsangiz, siz C1 ni yangilab o'tirmaysiz — u avtomatik `70` bo'lib qoladi. Reaktivlik xuddi shunday ishlaydi! Ma'lumot (A1) o'zgarganda, unga bog'liq bo'lgan hamma narsa (C1) avtomatik qayta hisoblanadi.

Reaktivlik - ma'lumot o'zgarganda UI (yoki boshqa bog'langan logikalar) avtomatik yangilanishi.

### Vue 2 - Object.defineProperty

```javascript
// Vue 2 - property interception
Object.defineProperty(obj, 'count', {
  get() {
    // Dependency tracking
    track()
    return value
  },
  set(newValue) {
    value = newValue
    // Trigger updates
    trigger()
  }
})

// Cheklovlar:
// - Property qo'shish/o'chirish aniqlanmaydi
// - Array index o'zgartirish aniqlanmaydi
// - Vue.set() kerak
```

### Vue 3 - Proxy

```javascript
// Vue 3 - Proxy-based
const proxy = new Proxy(target, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, value) {
    target[key] = value
    trigger(target, key)
    return true
  },
  deleteProperty(target, key) {
    delete target[key]
    trigger(target, key)
    return true
  }
})

// Afzalliklari:
// - Property qo'shish/o'chirish aniqlanadi
// - Array to'liq qo'llab-quvvatlanadi
// - Vue.set() kerak emas
```

### Reaktivlik Diagrammasi

```
┌─────────────────────────────────────────────────────────────┐
│                    REACTIVITY SYSTEM                        │
│                                                             │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐            │
│  │   State  │────►│  Effect  │────►│    UI    │            │
│  │  (data)  │     │(computed)│     │ (render) │            │
│  └────┬─────┘     └──────────┘     └────┬─────┘            │
│       │                                  │                  │
│       │         ┌──────────┐            │                  │
│       └─────────┤  Trigger ├────────────┘                  │
│                 │ (update) │                               │
│                 └──────────┘                               │
└─────────────────────────────────────────────────────────────┘

1. State o'zgaradi
2. Trigger dependency'larni ogohlantiradi
3. Effect'lar qayta ishlaydi
4. UI yangilanadi
```

---

## ref vs reactive

### ref - Primitive va Reference Qiymatlar

```javascript
import { ref, isRef, unref } from 'vue'

// Primitive qiymatlar
const count = ref(0)
const name = ref('John')
const isActive = ref(true)

// Qiymatga kirish
console.log(count.value) // 0
console.log(name.value)  // 'John'

// Qiymatni o'zgartirish
count.value++
name.value = 'Jane'

// Object ham bo'lishi mumkin
const user = ref({ name: 'John', age: 30 })
user.value.name = 'Jane' // Reaktiv
user.value = { name: 'Bob', age: 25 } // To'liq almashtirish ham reaktiv

// Template'da .value kerak emas
// <template>{{ count }}</template>
```

### reactive - Objects va Arrays

```javascript
import { reactive, isReactive } from 'vue'

// Object
const state = reactive({
  count: 0,
  user: {
    name: 'John',
    email: 'john@example.com'
  },
  items: []
})

// Qiymatga kirish
console.log(state.count) // 0
console.log(state.user.name) // 'John'

// Qiymatni o'zgartirish
state.count++
state.user.name = 'Jane'
state.items.push({ id: 1, text: 'Item 1' })

// Property qo'shish (Vue 3'da ishlaydi)
state.newProperty = 'value'

// Array manipulyatsiya
state.items[0] = { id: 1, text: 'Updated' }
state.items.splice(0, 1)
```

### Qachon Qaysi Birini Ishlatish

```javascript
// REF ishlating:
// 1. Primitives
const count = ref(0)
const message = ref('')
const isLoading = ref(false)

// 2. To'liq almashtirish kerak bo'lganda
const user = ref(null)
user.value = await fetchUser() // Object to'liq almashadi

// 3. Composable'dan qaytarganda
function useCounter() {
  const count = ref(0)
  return { count } // ref sifatida qaytarish
}

// REACTIVE ishlating:
// 1. Murakkab state objects
const form = reactive({
  name: '',
  email: '',
  address: {
    city: '',
    country: ''
  }
})

// 2. Store-like state
const state = reactive({
  users: [],
  currentUser: null,
  isLoading: false
})

// 3. Grouped related data
const pagination = reactive({
  page: 1,
  perPage: 20,
  total: 0
})
```

### ref vs reactive Farqlari

| Xususiyat | ref | reactive |
|-----------|-----|----------|
| Primitive | Ha | Yo'q |
| Object | Ha (.value) | Ha |
| To'liq almashtirish | Ha | Yo'q* |
| Destructure | Reaktiv qoladi | Reaktivlik yo'qoladi |
| Template unwrap | Avtomatik | To'g'ridan |

```javascript
// * reactive to'liq almashtirilmaydi
const state = reactive({ count: 0 })
state = reactive({ count: 1 }) // XATO! const reassignment

// Yechim
const state = reactive({ data: { count: 0 } })
state.data = { count: 1 } // OK
```

---

## computed Properties

### Asosiy Computed

```javascript
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// Readonly computed
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

console.log(fullName.value) // 'John Doe'

// fullName.value = 'Jane Doe' // ERROR: readonly
```

### Writable Computed

```javascript
const firstName = ref('John')
const lastName = ref('Doe')

// Writable computed
const fullName = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(newValue) {
    const parts = newValue.split(' ')
    firstName.value = parts[0]
    lastName.value = parts.slice(1).join(' ')
  }
})

fullName.value = 'Jane Smith' // OK
console.log(firstName.value) // 'Jane'
console.log(lastName.value)  // 'Smith'
```

### Computed Caching

```javascript
// Computed - KESHLANADI
const expensiveComputation = computed(() => {
  console.log('Computing...')
  return items.value.reduce((sum, item) => sum + item.price, 0)
})

// 3 marta chaqirish
console.log(expensiveComputation.value) // Computing... 100
console.log(expensiveComputation.value) // 100 (keshdan)
console.log(expensiveComputation.value) // 100 (keshdan)

// Method - HAR SAFAR ISHLAYDI
function calculateTotal() {
  console.log('Calculating...')
  return items.value.reduce((sum, item) => sum + item.price, 0)
}

// 3 marta chaqirish
calculateTotal() // Calculating... 100
calculateTotal() // Calculating... 100
calculateTotal() // Calculating... 100
```

### Computed bilan Store

```javascript
// stores/cart.js
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    discountCode: null,
    discounts: {
      SAVE10: 0.1,
      SAVE20: 0.2
    }
  }),

  getters: {
    // Oddiy getter
    itemCount: (state) => state.items.length,

    // Hisob-kitob
    subtotal: (state) => {
      return state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
    },

    // Boshqa getter'ga bog'liq
    discount() {
      if (!this.discountCode) return 0
      const rate = this.discounts[this.discountCode] || 0
      return this.subtotal * rate
    },

    // Final calculation
    total() {
      return this.subtotal - this.discount
    },

    // Parametrli getter
    getItemById: (state) => (id) => {
      return state.items.find(item => item.id === id)
    }
  }
})
```

### Computed Chains

```javascript
const items = ref([
  { id: 1, name: 'Apple', price: 1.5, category: 'fruit', inStock: true },
  { id: 2, name: 'Banana', price: 0.5, category: 'fruit', inStock: true },
  { id: 3, name: 'Carrot', price: 0.8, category: 'vegetable', inStock: false }
])

const searchQuery = ref('')
const selectedCategory = ref(null)
const showOnlyInStock = ref(false)
const sortBy = ref('name')

// Chain of computed
const filteredByCategory = computed(() => {
  if (!selectedCategory.value) return items.value
  return items.value.filter(item => item.category === selectedCategory.value)
})

const filteredByStock = computed(() => {
  if (!showOnlyInStock.value) return filteredByCategory.value
  return filteredByCategory.value.filter(item => item.inStock)
})

const filteredBySearch = computed(() => {
  if (!searchQuery.value) return filteredByStock.value
  const query = searchQuery.value.toLowerCase()
  return filteredByStock.value.filter(item =>
    item.name.toLowerCase().includes(query)
  )
})

const sortedItems = computed(() => {
  return [...filteredBySearch.value].sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    }
    if (sortBy.value === 'price') {
      return a.price - b.price
    }
    return 0
  })
})

// Final result
const displayItems = computed(() => sortedItems.value)
```

---

## watch va watchEffect

### watch - Aniq Dependency

```javascript
import { ref, watch } from 'vue'

const count = ref(0)
const name = ref('John')

// Single source
watch(count, (newValue, oldValue) => {
  console.log(`Count changed: ${oldValue} → ${newValue}`)
})

// Multiple sources
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  console.log(`Count: ${oldCount} → ${newCount}`)
  console.log(`Name: ${oldName} → ${newName}`)
})

// Getter function
watch(
  () => count.value * 2,
  (doubled) => {
    console.log(`Doubled: ${doubled}`)
  }
)

// Deep watch
const user = ref({ name: 'John', settings: { theme: 'light' } })

watch(
  user,
  (newUser) => {
    console.log('User changed:', newUser)
  },
  { deep: true }
)

// Immediate
watch(
  count,
  (value) => {
    console.log(`Initial count: ${value}`)
  },
  { immediate: true }
)
```

### watch Options

```javascript
// Options
watch(source, callback, {
  // Darhol ishga tushirish
  immediate: true,

  // Chuqur kuzatish
  deep: true,

  // Callback qachon ishga tushadi
  flush: 'pre' | 'post' | 'sync',

  // Debug
  onTrack(e) {
    console.log('tracking', e)
  },
  onTrigger(e) {
    console.log('triggered', e)
  }
})
```

### watchEffect - Avtomatik Dependency

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)
const name = ref('John')

// Avtomatik dependency tracking
watchEffect(() => {
  console.log(`Count is ${count.value}`)
  // count o'zgarganda qayta ishlaydi
})

// Multiple dependencies
watchEffect(() => {
  console.log(`${name.value} has count ${count.value}`)
  // name YOKI count o'zgarganda qayta ishlaydi
})

// Cleanup function
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    count.value++
  }, 1000)

  onCleanup(() => {
    clearInterval(timer)
  })
})

// Stop watching
const stop = watchEffect(() => {
  console.log(count.value)
})

// Keyinroq...
stop()
```

### watch vs watchEffect

| Xususiyat | watch | watchEffect |
|-----------|-------|-------------|
| Dependency | Aniq ko'rsatiladi | Avtomatik |
| Old value | Ha | Yo'q |
| Lazy | Ha (default) | Yo'q (immediate) |
| Use case | Aniq trigger | Side effects |

```javascript
// watch - aniq, oldValue kerak
watch(userId, async (newId, oldId) => {
  console.log(`Changed from ${oldId} to ${newId}`)
  await fetchUser(newId)
})

// watchEffect - avtomatik, immediate
watchEffect(async () => {
  // userId ishlatilgani uchun kuzatiladi
  if (userId.value) {
    await fetchUser(userId.value)
  }
})
```

### watchPostEffect va watchSyncEffect

```javascript
import { watchPostEffect, watchSyncEffect } from 'vue'

// watchPostEffect - DOM update'dan keyin
watchPostEffect(() => {
  // DOM hozir yangilangan
  const el = document.querySelector('#my-element')
  console.log(el.textContent)
})

// watchSyncEffect - sinxron (immediate)
watchSyncEffect(() => {
  // Hech qanday batchingsiz darhol ishlaydi
  console.log(count.value)
})
```

---

## shallowRef va shallowReactive

### shallowRef - Faqat .value Reaktiv

```javascript
import { shallowRef, triggerRef } from 'vue'

// shallowRef - ichki property'lar reaktiv EMAS
const state = shallowRef({
  user: { name: 'John' },
  items: []
})

// Bu trigger qilmaydi!
state.value.user.name = 'Jane'
state.value.items.push({ id: 1 })

// Bu trigger qiladi
state.value = {
  user: { name: 'Jane' },
  items: [{ id: 1 }]
}

// Manual trigger
state.value.user.name = 'Bob'
triggerRef(state) // Force trigger
```

### shallowReactive - Faqat Root Reaktiv

```javascript
import { shallowReactive } from 'vue'

const state = shallowReactive({
  count: 0,           // Reaktiv
  user: {             // Object o'zi reaktiv
    name: 'John',     // Ichki property REAKTIV EMAS
    settings: {       // Nested object REAKTIV EMAS
      theme: 'light'
    }
  }
})

// Bu trigger qiladi
state.count++
state.user = { name: 'Jane' }

// Bu trigger QILMAYDI
state.user.name = 'Bob'
state.user.settings.theme = 'dark'
```

### Qachon Shallow Ishlatish

```javascript
// 1. Katta ob'ektlar - performance
const bigData = shallowRef(hugeArray)

// To'liq almashtirish
bigData.value = processData(newData)

// 2. External objects
const chart = shallowRef(null)

onMounted(() => {
  chart.value = new Chart(canvas, config)
})

// 3. Immutable data patterns
const items = shallowRef([])

function addItem(item) {
  items.value = [...items.value, item]
}

function removeItem(id) {
  items.value = items.value.filter(i => i.id !== id)
}
```

---

## toRef va toRefs

### toRef - Single Property

```javascript
import { reactive, toRef } from 'vue'

const state = reactive({
  name: 'John',
  age: 30
})

// toRef - bog'langan ref yaratadi
const nameRef = toRef(state, 'name')

console.log(nameRef.value) // 'John'

// O'zgartirish ikkalasiga ta'sir qiladi
nameRef.value = 'Jane'
console.log(state.name) // 'Jane'

state.name = 'Bob'
console.log(nameRef.value) // 'Bob'
```

### toRefs - All Properties

```javascript
import { reactive, toRefs } from 'vue'

const state = reactive({
  name: 'John',
  age: 30,
  email: 'john@example.com'
})

// toRefs - hamma property'larni ref qiladi
const { name, age, email } = toRefs(state)

// Endi reactivity saqlanadi
console.log(name.value) // 'John'
name.value = 'Jane'
console.log(state.name) // 'Jane'
```

### Composable Pattern bilan

```javascript
// composables/useUser.js
import { reactive, toRefs } from 'vue'

export function useUser() {
  const state = reactive({
    user: null,
    isLoading: false,
    error: null
  })

  async function fetchUser(id) {
    state.isLoading = true
    state.error = null

    try {
      const response = await api.get(`/users/${id}`)
      state.user = response.data
    } catch (e) {
      state.error = e.message
    } finally {
      state.isLoading = false
    }
  }

  // toRefs - destructure qilganda reactivity saqlanadi
  return {
    ...toRefs(state),
    fetchUser
  }
}

// Usage
const { user, isLoading, error, fetchUser } = useUser()
// user, isLoading, error - refs (reactive)
```

---

## Advanced Reactive Patterns

### 1. Debounced Ref

```javascript
import { ref, watch, customRef } from 'vue'

export function useDebouncedRef(value, delay = 300) {
  let timeout

  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        value = newValue
        trigger()
      }, delay)
    }
  }))
}

// Usage
const searchQuery = useDebouncedRef('', 500)

// Template'da
// <input v-model="searchQuery" />

// searchQuery 500ms keyin trigger bo'ladi
```

### 2. Throttled Ref

```javascript
export function useThrottledRef(value, delay = 300) {
  let lastTrigger = 0

  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue) {
      const now = Date.now()
      if (now - lastTrigger >= delay) {
        value = newValue
        lastTrigger = now
        trigger()
      }
    }
  }))
}
```

### 3. Local Storage Ref

```javascript
export function useLocalStorageRef(key, defaultValue) {
  const stored = localStorage.getItem(key)
  const value = ref(stored ? JSON.parse(stored) : defaultValue)

  watch(value, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })

  return value
}

// Usage
const theme = useLocalStorageRef('theme', 'light')
const settings = useLocalStorageRef('settings', { notifications: true })
```

### 4. Async Computed

```javascript
import { ref, watchEffect } from 'vue'

export function useAsyncComputed(getter, defaultValue = null) {
  const result = ref(defaultValue)
  const isLoading = ref(false)
  const error = ref(null)

  watchEffect(async () => {
    isLoading.value = true
    error.value = null

    try {
      result.value = await getter()
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  })

  return { result, isLoading, error }
}

// Usage
const userId = ref(123)

const { result: user, isLoading, error } = useAsyncComputed(
  () => api.getUser(userId.value)
)

// userId o'zgarganda avtomatik refetch
```

### 5. Readonly State Pattern

```javascript
import { reactive, readonly } from 'vue'

export function createStore(initialState) {
  const state = reactive(initialState)

  function setState(updater) {
    if (typeof updater === 'function') {
      const updates = updater(state)
      Object.assign(state, updates)
    } else {
      Object.assign(state, updater)
    }
  }

  return {
    state: readonly(state),
    setState
  }
}

// Usage
const { state, setState } = createStore({
  count: 0,
  user: null
})

// Faqat setState orqali o'zgartirish
setState({ count: 1 })
setState(s => ({ count: s.count + 1 }))

// To'g'ridan o'zgartirish imkonsiz
state.count = 10 // Warning!
```

### 6. Effect Scope

```javascript
import { effectScope, ref, computed, watch, onScopeDispose } from 'vue'

export function useFeature() {
  const scope = effectScope()

  scope.run(() => {
    const count = ref(0)

    const doubled = computed(() => count.value * 2)

    watch(count, () => {
      console.log('Count changed')
    })

    // Scope cleanup
    onScopeDispose(() => {
      console.log('Scope disposed')
    })
  })

  // Stop all effects
  function cleanup() {
    scope.stop()
  }

  return { cleanup }
}
```

---

## To'g'ri va Noto'g'ri Yondashuvlar

### 1. Reactivity Yo'qolishi

```javascript
// NOTO'G'RI - reactivity yo'qoladi
const state = reactive({ count: 0 })
let { count } = state
count++ // Bu state'ni o'zgartirmaydi!

// TO'G'RI - toRefs ishlatish
const state = reactive({ count: 0 })
const { count } = toRefs(state)
count.value++ // Bu state'ni o'zgartiradi

// TO'G'RI - to'g'ridan kirish
state.count++
```

### 2. ref vs reactive Confusion

```javascript
// NOTO'G'RI - reactive ni to'liq almashtirish
const state = reactive({ user: null })
state = reactive({ user: newUser }) // XATO! const reassignment

// TO'G'RI - ref ishlatish
const user = ref(null)
user.value = newUser // OK

// TO'G'RI - property o'zgartirish
const state = reactive({ user: null })
state.user = newUser // OK
```

### 3. Computed Side Effects

```javascript
// NOTO'G'RI - computed'da side effect
const total = computed(() => {
  console.log('Computing...') // Side effect
  localStorage.setItem('total', sum) // Side effect
  return items.value.reduce((sum, i) => sum + i.price, 0)
})

// TO'G'RI - watch ishlatish
const total = computed(() => {
  return items.value.reduce((sum, i) => sum + i.price, 0)
})

watch(total, (newTotal) => {
  console.log('Total changed:', newTotal)
  localStorage.setItem('total', newTotal)
})
```

### 4. watchEffect Cleanup

```javascript
// NOTO'G'RI - cleanup yo'q
watchEffect(() => {
  const subscription = eventBus.subscribe(data => {
    // Handle data
  })
  // Memory leak! Subscription never cleaned up
})

// TO'G'RI - onCleanup ishlatish
watchEffect((onCleanup) => {
  const subscription = eventBus.subscribe(data => {
    // Handle data
  })

  onCleanup(() => {
    subscription.unsubscribe()
  })
})
```

### 5. Deep Watch Performance

```javascript
// NOTO'G'RI - keraksiz deep watch
watch(
  hugeArray,
  () => { /* ... */ },
  { deep: true } // Performance issue!
)

// TO'G'RI - specific property watch
watch(
  () => hugeArray.value.length,
  () => { /* ... */ }
)

// TO'G'RI - shallowRef + to'liq almashtirish
const items = shallowRef([])

function addItem(item) {
  items.value = [...items.value, item]
}

watch(items, () => { /* ... */ })
```

---

## Real-World Patterns

### 1. Form State Management

```javascript
// composables/useForm.js
import { reactive, ref, computed, watch } from 'vue'

export function useForm(initialValues, validate) {
  const values = reactive({ ...initialValues })
  const errors = reactive({})
  const touched = reactive({})
  const isSubmitting = ref(false)

  const isValid = computed(() => {
    return Object.keys(errors).length === 0
  })

  const isDirty = computed(() => {
    return Object.keys(values).some(
      key => values[key] !== initialValues[key]
    )
  })

  // Validate on change
  watch(values, () => {
    if (validate) {
      const validationErrors = validate(values)
      Object.keys(errors).forEach(key => delete errors[key])
      Object.assign(errors, validationErrors)
    }
  }, { deep: true })

  function setFieldValue(field, value) {
    values[field] = value
    touched[field] = true
  }

  function setFieldTouched(field) {
    touched[field] = true
  }

  function reset() {
    Object.keys(values).forEach(key => {
      values[key] = initialValues[key]
    })
    Object.keys(errors).forEach(key => delete errors[key])
    Object.keys(touched).forEach(key => delete touched[key])
    isSubmitting.value = false
  }

  async function handleSubmit(onSubmit) {
    // Touch all fields
    Object.keys(values).forEach(key => {
      touched[key] = true
    })

    // Validate
    if (validate) {
      const validationErrors = validate(values)
      Object.keys(errors).forEach(key => delete errors[key])
      Object.assign(errors, validationErrors)

      if (Object.keys(validationErrors).length > 0) {
        return false
      }
    }

    isSubmitting.value = true

    try {
      await onSubmit(values)
      return true
    } catch (e) {
      return false
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
    setFieldValue,
    setFieldTouched,
    reset,
    handleSubmit
  }
}

// Usage
const {
  values,
  errors,
  isValid,
  handleSubmit
} = useForm(
  { email: '', password: '' },
  (values) => {
    const errors = {}
    if (!values.email) errors.email = 'Email kerak'
    if (!values.password) errors.password = 'Parol kerak'
    return errors
  }
)
```

### 2. Infinite Scroll Pattern

```javascript
// composables/useInfiniteScroll.js
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export function useInfiniteScroll(fetchItems, options = {}) {
  const {
    threshold = 100,
    initialPage = 1,
    pageSize = 20
  } = options

  const items = ref([])
  const page = ref(initialPage)
  const isLoading = ref(false)
  const hasMore = ref(true)
  const error = ref(null)

  const isEmpty = computed(() => items.value.length === 0 && !isLoading.value)

  async function loadMore() {
    if (isLoading.value || !hasMore.value) return

    isLoading.value = true
    error.value = null

    try {
      const newItems = await fetchItems(page.value, pageSize)

      if (newItems.length < pageSize) {
        hasMore.value = false
      }

      items.value = [...items.value, ...newItems]
      page.value++
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    items.value = []
    page.value = initialPage
    hasMore.value = true
    error.value = null
    loadMore()
  }

  // Scroll handler
  function handleScroll() {
    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY
    const clientHeight = window.innerHeight

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMore()
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
    loadMore()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    items,
    isLoading,
    hasMore,
    isEmpty,
    error,
    loadMore,
    reset
  }
}
```

### 3. Undo/Redo Pattern

```javascript
// composables/useHistory.js
import { ref, watch, readonly } from 'vue'

export function useHistory(source, options = {}) {
  const { maxLength = 50 } = options

  const history = ref([])
  const future = ref([])
  const index = ref(-1)

  const canUndo = computed(() => index.value > 0)
  const canRedo = computed(() => future.value.length > 0)

  // Track changes
  watch(source, (newValue, oldValue) => {
    if (oldValue !== undefined) {
      // Clear future on new change
      future.value = []

      // Add to history
      history.value.push(JSON.parse(JSON.stringify(oldValue)))
      index.value++

      // Limit history size
      if (history.value.length > maxLength) {
        history.value.shift()
        index.value--
      }
    }
  }, { deep: true, immediate: true })

  function undo() {
    if (!canUndo.value) return

    // Save current for redo
    future.value.push(JSON.parse(JSON.stringify(source.value)))

    // Restore previous
    index.value--
    const previous = history.value[index.value]
    Object.assign(source.value, previous)
  }

  function redo() {
    if (!canRedo.value) return

    const next = future.value.pop()
    history.value.push(JSON.parse(JSON.stringify(source.value)))
    index.value++
    Object.assign(source.value, next)
  }

  function clear() {
    history.value = []
    future.value = []
    index.value = -1
  }

  return {
    history: readonly(history),
    canUndo,
    canRedo,
    undo,
    redo,
    clear
  }
}

// Usage
const document = reactive({
  title: 'Untitled',
  content: ''
})

const { canUndo, canRedo, undo, redo } = useHistory(document)
```

### 4. Reactive URL State

```javascript
// composables/useUrlState.js
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useUrlState(key, defaultValue) {
  const route = useRoute()
  const router = useRouter()

  const state = ref(defaultValue)

  // Sync from URL on mount
  onMounted(() => {
    const urlValue = route.query[key]
    if (urlValue !== undefined) {
      try {
        state.value = JSON.parse(urlValue)
      } catch {
        state.value = urlValue
      }
    }
  })

  // Sync to URL on change
  watch(state, (newValue) => {
    const query = { ...route.query }

    if (newValue === defaultValue || newValue === null) {
      delete query[key]
    } else {
      query[key] = typeof newValue === 'string'
        ? newValue
        : JSON.stringify(newValue)
    }

    router.replace({ query })
  })

  return state
}

// Usage
const page = useUrlState('page', 1)
const filters = useUrlState('filters', { category: null })

// URL: ?page=2&filters={"category":"electronics"}
```

---

## Interview Savollari

### 1. ref va reactive orasidagi farq nima?

**Javob:**

```javascript
// ref - har qanday qiymat uchun
const count = ref(0)       // primitive
const user = ref(null)     // object/null
console.log(count.value)   // .value kerak

// reactive - faqat objects
const state = reactive({ count: 0 })
console.log(state.count)   // .value kerak emas
```

| ref | reactive |
|-----|----------|
| .value kerak | .value kerak emas |
| To'liq almashtirish mumkin | To'liq almashtirish mumkin emas |
| Primitive uchun | Object uchun |
| Destructure reaktiv | Destructure reaktiv emas |

```javascript
// Asosiy farq - almashtirish
const userRef = ref(null)
userRef.value = { name: 'John' } // OK

const state = reactive({ user: null })
// state = reactive({ user: {...} }) // XATO!
state.user = { name: 'John' } // OK
```

---

### 2. computed qachon keshlanadi va qachon qayta ishlaydi?

**Javob:**

```javascript
const firstName = ref('John')
const lastName = ref('Doe')

const fullName = computed(() => {
  console.log('Computing...')
  return `${firstName.value} ${lastName.value}`
})

// 1. Birinchi kirish - ishlanadi
console.log(fullName.value) // Computing... John Doe

// 2. Qayta kirish - keshdan
console.log(fullName.value) // John Doe (log yo'q)

// 3. Dependency o'zgardi - qayta ishlanadi
firstName.value = 'Jane' // Mark as dirty
console.log(fullName.value) // Computing... Jane Doe

// 4. Keshlanmagan dependency o'zgardi
const unrelated = ref('test')
unrelated.value = 'changed'
console.log(fullName.value) // Jane Doe (log yo'q)
```

**Qoida:**
- Dependency o'zgarganda qayta ishlanadi
- Bir xil dependency bilan keshlanadi
- Faqat kirish paytida (lazy) ishlanadi

---

### 3. watch va watchEffect qachon ishlatiladi?

**Javob:**

```javascript
// WATCH - aniq dependency, oldValue kerak
watch(userId, async (newId, oldId) => {
  console.log(`User ${oldId} → ${newId}`)
  await fetchUser(newId)
})

// WATCHEFFECT - avtomatik dependency, immediate
watchEffect(async () => {
  if (userId.value && postId.value) {
    await fetchData(userId.value, postId.value)
  }
})
```

**watch ishlating:**
- oldValue kerak
- Aniq trigger kerak
- Lazy (immediate: false) kerak
- Specific dependency

**watchEffect ishlating:**
- Avtomatik dependency tracking
- Immediate run kerak
- Side effects
- Multiple dependencies

---

### 4. shallowRef va shallowReactive nima uchun kerak?

**Javob:**

Performance optimizatsiya uchun - chuqur reactivity kerak bo'lmaganda.

```javascript
// Muammo - katta object
const hugeData = ref(largeArray) // Deep reactive - sekin

// Yechim - shallow
const hugeData = shallowRef(largeArray)

// Ichki o'zgarish trigger qilmaydi
hugeData.value[0].name = 'New' // UI yangilanmaydi

// To'liq almashtirish trigger qiladi
hugeData.value = [...hugeData.value] // UI yangilanadi
```

**Qachon ishlatiladi:**
1. Katta arrays/objects
2. External libraries (Chart.js, etc.)
3. Immutable data patterns
4. Performance critical

---

### 5. toRef va toRefs qanday ishlaydi?

**Javob:**

reactive object'dan refs yaratish uchun.

```javascript
const state = reactive({
  count: 0,
  name: 'John'
})

// toRef - bitta property
const countRef = toRef(state, 'count')
countRef.value++ // state.count ham o'zgaradi

// toRefs - hamma properties
const { count, name } = toRefs(state)
count.value++ // state.count ham o'zgaradi
name.value = 'Jane' // state.name ham o'zgaradi
```

**Nima uchun kerak:**

```javascript
// Muammo - destructure reactivity buzadi
const { count } = state
count++ // state.count O'ZGARMAYDI!

// Yechim - toRefs
const { count } = toRefs(state)
count.value++ // state.count O'ZGARADI!
```

**Composable pattern:**
```javascript
function useUser() {
  const state = reactive({ user: null, loading: false })

  // toRefs bilan qaytarish
  return {
    ...toRefs(state), // { user: Ref, loading: Ref }
    fetchUser
  }
}

// Usage - destructure OK
const { user, loading } = useUser()
```

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **`ref` va `reactive` dan foydalanish**: Oddiy va primitive ma'lumotlar uchun doim `ref` ishlating. Kompleks obyektlar yoki guruhlangan ma'lumotlar uchungina `reactive` ishlating.
2. **Destructuring xavfi**: `reactive` obyektni komponent ichida oddiy `const { ... } = state` shaklida destructure qilsangiz reaktivlik buziladi! Reaktivlikni saqlab qolish uchun `toRefs(state)` ishlating.
3. **`computed` qiymatlarni o'zgartirmang**: `computed` qiymatlar faqat ma'lumotni o'qish va transformatsiya qilish uchun. Ularning ichida ma'lumotlarni o'zgartirish (side-effect) ga aslo yo'l qo'ymang.
4. **Shallow tiplardan to'g'ri foydalaning**: Katta o'lchamli massivlar (minglab elementlar) bilan ishlaganda `shallowRef` ishlating, bu Vue'ni har bir elementni kuzatish (deep watch) dan qutqarib performance'ni oshiradi.

---

## Xulosa

## Xulosa

| Reaktivlik Turi | Vazifasi | Qachon ishlatiladi? |
|-----------------|----------|---------------------|
| **`ref()`** | Har qanday tipdagi datani reaktiv qilish | String, Number kabi primitive tiplar va oddiy o'zgaruvchilar |
| **`reactive()`** | Obyekt va massivlarni chuqur reaktiv qilish | Formalar, Murakkab obyektlar va guruhlangan holatlar |
| **`computed()`** | Boshqa ma'lumotlarga asoslanib hisob-kitob qilish | Filtrlar, Formatlash, State'ga bog'liq formula qiymatlar |
| **`watch()`** | Ma'lum o'zgaruvchi o'zgarganida kod ishga tushirish | API ga o'zgarishni yuborish, Aniq o'zgarishga reaksiya bildirish |
| **`watchEffect()`**| Ichida ishlatilgan har qanday reaktiv data o'zgarganda ishlash | Fetch operatsiyalari, Dastlabki qiymatni avtomatik o'qish uchun |
| **`shallowRef()`**| Katta obyektning faqat o'zgaruvchini (root) reaktiv qilish | Katta API javoblari, Chart data (Performance optimizatsiya) |
| **`toRefs()`** | Reaktiv obyektni strukturasini buzmasdan qismlarga bo'lish | `reactive` dan destructuring orqali alohida ref lar olishda |

Reaktivlik Vue'ning asosiy kuchi hisoblanadi. O'zgaruvchilar va ularni ishlatish qoidalarini yaxshi bilgan dasturchi ortiqcha UI renderlarini oldini oladi va tezkor ilovalar yoza oladi.
