# Refs va Reactive - Vue 3 Reaktivlik Asoslari

## Kirish

Vue 3 ning reaktivlik tizimi JavaScript Proxy asosida qurilgan. Ikki asosiy primitive mavjud: `ref()` va `reactive()`. Ularning farqlarini tushunish Vue 3 bilan samarali ishlash uchun muhim.

## ref() - Reference Wrapper

### Asosiy Tushuncha

`ref()` har qanday qiymatni reactive wrapper'ga o'raydi. Qiymatga `.value` orqali kiriladi.

```javascript
import { ref } from 'vue'

// Primitive values
const count = ref(0)
const message = ref('Hello')
const isActive = ref(true)

// Access va update
console.log(count.value) // 0
count.value++
console.log(count.value) // 1

// Objects ham ref bo'lishi mumkin
const user = ref({
  name: 'Ali',
  age: 25
})
console.log(user.value.name) // 'Ali'
user.value.name = 'Vali'

// Arrays
const items = ref(['a', 'b', 'c'])
items.value.push('d')
items.value[0] = 'A'
```

### Template da ref

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const user = ref({ name: 'Ali' })
</script>

<template>
  <!-- Template da .value kerak EMAS -->
  <p>Count: {{ count }}</p>
  <p>Name: {{ user.name }}</p>

  <!-- Event handler -->
  <button @click="count++">+</button>
</template>
```

### ref() Internal Mechanism

```javascript
// Simplified ref implementation
function ref(value) {
  const refObject = {
    get value() {
      track(refObject, 'value')
      return value
    },
    set value(newValue) {
      value = newValue
      trigger(refObject, 'value')
    }
  }

  // Object bo'lsa, ichini reactive qilish
  if (isObject(value)) {
    value = reactive(value)
  }

  return refObject
}
```

### isRef va unref

```javascript
import { ref, isRef, unref } from 'vue'

const count = ref(0)
const plain = 5

// isRef - ref ekanligini tekshirish
console.log(isRef(count)) // true
console.log(isRef(plain)) // false

// unref - ref bo'lsa .value, bo'lmasa o'zi
console.log(unref(count)) // 0
console.log(unref(plain)) // 5

// Composable'larda foydali
function useDouble(value) {
  return computed(() => unref(value) * 2)
}

// Ikkalasi ham ishlaydi
useDouble(count)  // ref
useDouble(5)      // plain value
```

## reactive() - Reactive Object

### Asosiy Tushuncha

`reactive()` ob'ektni to'liq reactive qiladi. `.value` kerak emas.

```javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  user: {
    name: 'Ali',
    age: 25
  },
  items: ['a', 'b', 'c']
})

// Direct access (no .value)
console.log(state.count) // 0
state.count++

// Nested reactivity
state.user.name = 'Vali' // Reaktiv
state.items.push('d')    // Reaktiv

// Yangi property qo'shish - Vue 3 da reaktiv!
state.newProp = 'value'  // Reaktiv (Vue 2 da emas!)
```

### reactive() Cheklovlari

```javascript
import { reactive, ref } from 'vue'

// 1. Faqat ob'ektlar uchun ishlaydi
const count = reactive(0)    // ISHLAMAYDI! Returns 0, not reactive
const str = reactive('hello') // ISHLAMAYDI!

// 2. Destructuring reaktivlikni yo'qotadi
const state = reactive({ count: 0, name: 'Ali' })

// NOTO'G'RI - reaktiv emas!
const { count, name } = state
count++ // Original state o'zgarmaydi!

// TO'G'RI - toRefs ishlatish
import { toRefs } from 'vue'
const { count, name } = toRefs(state)
count.value++ // state.count ham o'zgaradi

// 3. Replacement reaktivlikni yo'qotadi
let state = reactive({ count: 0 })
state = reactive({ count: 1 }) // Yangi reactive, eski bog'lanish uzildi

// 4. Function argument sifatida
function update(state) {
  state.count++ // OK, reference saqlanadi
}
update(state)

// LEKIN primitive olish
function updateCount(count) {
  count++ // Ishlamaydi! Local copy
}
updateCount(state.count)
```

### reactive() Internal Mechanism

```javascript
// Simplified reactive implementation
function reactive(target) {
  if (!isObject(target)) {
    return target // Primitive bo'lsa, o'zi
  }

  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)

      // Dependency tracking
      track(target, key)

      // Nested object bo'lsa, uni ham reactive qilish (lazy)
      if (isObject(result)) {
        return reactive(result)
      }

      return result
    },

    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)

      // Trigger updates if changed
      if (oldValue !== value) {
        trigger(target, key)
      }

      return result
    },

    deleteProperty(target, key) {
      const hadKey = hasOwn(target, key)
      const result = Reflect.deleteProperty(target, key)

      if (hadKey && result) {
        trigger(target, key)
      }

      return result
    }
  })
}
```

## toRef va toRefs

### toRef - Bitta Property

```javascript
import { reactive, toRef, watch } from 'vue'

const state = reactive({
  count: 0,
  name: 'Ali'
})

// toRef - bitta property uchun ref yaratish
const countRef = toRef(state, 'count')

// Ikki tomonlama bog'langan
countRef.value++
console.log(state.count) // 1

state.count++
console.log(countRef.value) // 2

// Watch bilan ishlatish
watch(toRef(state, 'name'), (newName) => {
  console.log('Name changed:', newName)
})
```

### toRefs - Barcha Properties

```javascript
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  name: 'Ali',
  age: 25
})

// toRefs - barcha properties uchun refs
const { count, name, age } = toRefs(state)

// Har biri state bilan bog'langan ref
count.value++
console.log(state.count) // 1

// Composable'dan qaytarish
function useCounter() {
  const state = reactive({
    count: 0,
    doubled: computed(() => state.count * 2)
  })

  function increment() {
    state.count++
  }

  // toRefs bilan qaytarish - destructuring safe
  return {
    ...toRefs(state),
    increment
  }
}

// Ishlatish
const { count, doubled, increment } = useCounter()
```

### Props bilan toRef

```vue
<script setup>
import { toRef, watch } from 'vue'

const props = defineProps({
  userId: Number
})

// Props dan ref yaratish
const userIdRef = toRef(props, 'userId')

// Composable'ga uzatish
import { useUser } from '@/composables/useUser'
const { user, loading } = useUser(toRef(props, 'userId'))

// Watch
watch(toRef(props, 'userId'), async (id) => {
  await fetchUser(id)
})
</script>
```

## shallowRef va shallowReactive

### shallowRef - Shallow Reactivity

```javascript
import { shallowRef, triggerRef } from 'vue'

// shallowRef - faqat .value o'zgarishi kuzatiladi
const state = shallowRef({
  count: 0,
  nested: {
    value: 1
  }
})

// Bu reaktiv EMAS!
state.value.count++          // UI yangilanmaydi
state.value.nested.value++   // UI yangilanmaydi

// Bu reaktiv
state.value = { count: 1, nested: { value: 2 } } // UI yangilanadi

// Manual trigger
state.value.count++
triggerRef(state) // UI yangilanadi
```

### shallowReactive - Shallow Object Reactivity

```javascript
import { shallowReactive } from 'vue'

const state = shallowReactive({
  count: 0,
  nested: {
    value: 1
  }
})

// Top-level reaktiv
state.count++           // UI yangilanadi

// Nested reaktiv EMAS
state.nested.value++    // UI yangilanmaydi

// Nested ob'ektni almashtirish reaktiv
state.nested = { value: 2 } // UI yangilanadi
```

### Qachon Shallow ishlatish?

```javascript
// 1. Katta ob'ektlar - performance uchun
const bigData = shallowRef(largeDataSet)

// 2. Third-party class instance
const chart = shallowRef(new Chart(config))

// 3. Immutable patterns
const state = shallowRef({ items: [] })

function addItem(item) {
  state.value = {
    ...state.value,
    items: [...state.value.items, item]
  }
}
```

## readonly va shallowReadonly

### readonly - Deep Immutable

```javascript
import { reactive, readonly } from 'vue'

const original = reactive({
  count: 0,
  nested: {
    value: 1
  }
})

const copy = readonly(original)

// O'qish mumkin
console.log(copy.count) // 0

// Yozish mumkin EMAS (development warning)
copy.count++ // Warning: target is readonly
copy.nested.value++ // Warning: target is readonly

// Original o'zgarsa, copy ham o'zgaradi
original.count++
console.log(copy.count) // 1
```

### Props-like Readonly

```javascript
// Composable da state himoya qilish
function useCounter() {
  const state = reactive({
    count: 0
  })

  function increment() {
    state.count++
  }

  return {
    // Tashqaridan o'zgartirib bo'lmaydi
    state: readonly(state),
    // Faqat method orqali
    increment
  }
}

const { state, increment } = useCounter()
state.count++ // Warning!
increment()   // OK
```

## toRaw va markRaw

### toRaw - Original Object

```javascript
import { reactive, toRaw } from 'vue'

const original = { count: 0 }
const state = reactive(original)

// toRaw - original ob'ektni olish
console.log(toRaw(state) === original) // true

// Use case: Third-party library ga uzatish
someLibrary.init(toRaw(state))

// Use case: Deep comparison
function isEqual(a, b) {
  return JSON.stringify(toRaw(a)) === JSON.stringify(toRaw(b))
}
```

### markRaw - Never Make Reactive

```javascript
import { reactive, markRaw } from 'vue'

// markRaw - hech qachon reactive bo'lmasin
const nonReactive = markRaw({
  someData: 'value'
})

const state = reactive({
  // Bu nested object reactive bo'lmaydi
  external: nonReactive
})

state.external.someData = 'new' // Reaktiv emas

// Use case: Third-party class instances
class BigLibrary {
  // Katta, complex class
}

const state = reactive({
  lib: markRaw(new BigLibrary())
})

// Use case: Immutable data
const config = markRaw(Object.freeze({
  apiUrl: 'https://api.example.com',
  timeout: 5000
}))
```

## customRef - Custom Reactivity

```javascript
import { customRef } from 'vue'

// Debounced ref
function useDebouncedRef(value, delay = 300) {
  let timeout

  return customRef((track, trigger) => {
    return {
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
    }
  })
}

// Ishlatish
const searchQuery = useDebouncedRef('', 500)

// Template da
// <input v-model="searchQuery" />
// 500ms delay bilan yangilanadi
```

```javascript
// LocalStorage synced ref
function useLocalStorageRef(key, defaultValue) {
  const storedValue = localStorage.getItem(key)
  let value = storedValue ? JSON.parse(storedValue) : defaultValue

  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        value = newValue
        localStorage.setItem(key, JSON.stringify(newValue))
        trigger()
      }
    }
  })
}

// Ishlatish
const theme = useLocalStorageRef('theme', 'light')
theme.value = 'dark' // localStorage ham yangilanadi
```

## triggerRef - Manual Trigger

```javascript
import { shallowRef, triggerRef } from 'vue'

const state = shallowRef({ count: 0 })

// Nested o'zgarish kuzatilmaydi
state.value.count++
// UI yangilanmaydi

// Manual trigger
triggerRef(state)
// UI yangilanadi

// Use case: Performance optimization
const items = shallowRef([])

function addItems(newItems) {
  // Batch update
  newItems.forEach(item => {
    items.value.push(item)
  })
  // Bir marta trigger
  triggerRef(items)
}
```

## Real-World Patterns

### Reactive Form State

```vue
<script setup>
import { reactive, computed, toRefs } from 'vue'

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const errors = reactive({
  email: null,
  password: null
})

const isValid = computed(() => {
  return !errors.email && !errors.password &&
         form.email && form.password
})

function validate() {
  errors.email = !form.email ? 'Email majburiy' : null
  errors.password = form.password.length < 8
    ? 'Parol kamida 8 ta belgi'
    : null
}

function submit() {
  validate()
  if (isValid.value) {
    // Submit logic
  }
}

// Template uchun
const formRefs = toRefs(form)
</script>
```

### State Management Pattern

```javascript
// stores/counter.js
import { ref, computed, readonly } from 'vue'

// Private state
const count = ref(0)

// Public readonly state
export const state = readonly({
  count
})

// Computed getters
export const doubled = computed(() => count.value * 2)

// Actions
export function increment() {
  count.value++
}

export function decrement() {
  count.value--
}

export function reset() {
  count.value = 0
}
```

### Ref vs Reactive Decision Guide

```javascript
// ref() ishlatish:
// 1. Primitives
const count = ref(0)
const name = ref('Ali')

// 2. Nullable values
const user = ref(null)

// 3. Replacement kerak
const items = ref([])
items.value = newItems // To'liq almashtirish

// 4. Composable return values
function useCounter() {
  const count = ref(0)
  return { count } // Destructuring safe
}

// reactive() ishlatish:
// 1. Complex nested state
const state = reactive({
  user: { name: '', email: '' },
  settings: { theme: 'dark' }
})

// 2. Form data
const form = reactive({
  firstName: '',
  lastName: '',
  email: ''
})

// 3. Component local state (ko'p properties)
const component = reactive({
  loading: false,
  error: null,
  data: null,
  page: 1
})
```

## Vue 2 vs Vue 3

### Reactivity System

```javascript
// Vue 2 - Object.defineProperty
// Cheklovlar:
// - Yangi property reaktiv emas
// - Array index o'zgarishi kuzatilmaydi
// - delete operator kuzatilmaydi

// Vue 2 workarounds
Vue.set(obj, 'newProp', value)
this.$set(obj, 'newProp', value)
this.$delete(obj, 'prop')
arr.splice(index, 1, newValue)

// Vue 3 - Proxy
// Barcha o'zgarishlar kuzatiladi
const state = reactive({})
state.newProp = 'value'  // Reaktiv!
delete state.newProp     // Reaktiv!
arr[0] = 'new'           // Reaktiv!
```

### Options API vs Composition API

```javascript
// Vue 2 - data option
export default {
  data() {
    return {
      count: 0,
      user: null
    }
  }
}

// Vue 3 - ref/reactive
import { ref, reactive } from 'vue'

const count = ref(0)
const user = ref(null)

// yoki
const state = reactive({
  count: 0,
  user: null
})
```

## Interview Savollari

### 1. ref va reactive farqi nima? Qachon qaysi birini ishlatish kerak?

**Javob:**

| Jihat | ref | reactive |
|-------|-----|----------|
| Value types | Har qanday | Faqat object |
| Access | `.value` kerak | Direct access |
| Reassignment | Mumkin | Yo'qotadi reaktivlikni |
| Destructuring | Safe | toRefs kerak |
| Template | Auto-unwrap | Direct |

**ref ishlatish:**
- Primitives (number, string, boolean)
- Nullable values
- Replacement kerak bo'lganda
- Composable return values

**reactive ishlatish:**
- Complex objects
- Form data
- Nested state

### 2. Nima uchun reactive destructure qilinganda reaktivlik yo'qoladi?

**Javob:**

```javascript
const state = reactive({ count: 0 })

// Destructuring primitive value copy qiladi
const { count } = state
count++ // state.count O'ZGARMAYDI!

// Chunki:
// const count = state.count
// Bu oddiy primitive copy (0)
// Proxy track qilish uziladi
```

**Yechim:**

```javascript
// toRefs - har bir property uchun ref yaratadi
const { count } = toRefs(state)
count.value++ // state.count ham o'zgaradi

// toRef - bitta property uchun
const count = toRef(state, 'count')
```

### 3. shallowRef qachon kerak?

**Javob:**

1. **Performance** - Katta ob'ektlar uchun deep reactivity kerak emas
```javascript
const bigData = shallowRef(largeDataset)
// Nested changes track qilinmaydi - tezroq
```

2. **Third-party instances** - External library objects
```javascript
const chart = shallowRef(new Chart(config))
const editor = shallowRef(new Monaco())
```

3. **Immutable updates** - Redux-like pattern
```javascript
const state = shallowRef({ items: [] })

function addItem(item) {
  state.value = {
    ...state.value,
    items: [...state.value.items, item]
  }
}
```

### 4. markRaw nima uchun kerak?

**Javob:**

`markRaw` ob'ektni hech qachon reactive qilmaslik uchun:

```javascript
const nonReactive = markRaw({ data: 'value' })

const state = reactive({
  // nested sifatida ham reactive bo'lmaydi
  external: nonReactive
})
```

**Use cases:**
- Third-party class instances (Chart.js, etc.)
- Immutable config objects
- Large readonly data
- Performance optimization

### 5. customRef qanday ishlaydi va qachon kerak?

**Javob:**

`customRef` o'z reaktivlik logikasini yozish uchun:

```javascript
function useDebouncedRef(value, delay) {
  let timeout
  return customRef((track, trigger) => ({
    get() {
      track() // Dependency track
      return value
    },
    set(newValue) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        value = newValue
        trigger() // Re-render trigger
      }, delay)
    }
  }))
}
```

**Use cases:**
- Debounced inputs
- Throttled values
- LocalStorage sync
- Validation on change
- Async operations

---

## Xulosa

Vue 3 reaktivlik tizimi Proxy asosida qurilgan va juda kuchli:

- **ref()** - Har qanday qiymat, `.value` orqali access
- **reactive()** - Ob'ektlar, direct access
- **toRef/toRefs** - Destructuring safe refs
- **shallowRef/shallowReactive** - Performance optimization
- **readonly** - Immutable wrappers
- **markRaw/toRaw** - Reactivity control

To'g'ri tool tanlash muhim - ref primitives uchun, reactive complex objects uchun.
