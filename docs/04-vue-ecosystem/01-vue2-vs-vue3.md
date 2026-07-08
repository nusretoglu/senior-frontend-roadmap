# Vue 2 vs Vue 3 - Fundamental Farqlar

## Kirish

Vue 3 2020-yil sentabrda chiqarildi va Vue.js ekotizimida katta o'zgarishlar olib keldi. Bu hujjat ikkala versiya orasidagi asosiy farqlarni chuqur tahlil qiladi.

## Arxitektura Farqlari

### Reaktivlik Tizimi

```
Vue 2: Object.defineProperty()          Vue 3: Proxy
─────────────────────────────          ─────────────────
✗ Yangi property qo'shish kuzatilmaydi  ✓ Barcha o'zgarishlar kuzatiladi
✗ Array index o'zgarishi kuzatilmaydi   ✓ Array index kuzatiladi
✗ delete operator kuzatilmaydi          ✓ delete operator kuzatiladi
✗ Map, Set, WeakMap qo'llab-quvvatlanmaydi  ✓ Collection'lar qo'llanadi
```

#### Vue 2 Reaktivlik (Muammo)

```javascript
// Vue 2 - Reaktivlik cheklovlari
export default {
  data() {
    return {
      user: {
        name: 'Ali'
      },
      items: ['a', 'b', 'c']
    }
  },
  methods: {
    // NOTO'G'RI - Reaktiv emas!
    addAge() {
      this.user.age = 25 // Yangi property - reaktiv emas
    },

    // NOTO'G'RI - Reaktiv emas!
    updateItem() {
      this.items[0] = 'new' // Index orqali - reaktiv emas
    },

    // TO'G'RI - Vue 2 da maxsus metodlar kerak
    addAgeCorrect() {
      this.$set(this.user, 'age', 25) // Vue.set() ishlatish
      // yoki
      this.user = { ...this.user, age: 25 }
    },

    updateItemCorrect() {
      this.$set(this.items, 0, 'new') // Vue.set() ishlatish
      // yoki
      this.items.splice(0, 1, 'new')
    }
  }
}
```

#### Vue 3 Reaktivlik (Yechim)

```javascript
// Vue 3 - Proxy asosida to'liq reaktivlik
import { reactive, ref } from 'vue'

const user = reactive({
  name: 'Ali'
})

const items = reactive(['a', 'b', 'c'])

// TO'G'RI - Hammasi reaktiv!
function addAge() {
  user.age = 25 // Avtomatik reaktiv
}

function updateItem() {
  items[0] = 'new' // Avtomatik reaktiv
}

function deleteProperty() {
  delete user.name // Avtomatik reaktiv
}
```

### Proxy vs Object.defineProperty Ichki Ishlashi

```javascript
// Vue 2 - Object.defineProperty
// Har bir property uchun alohida getter/setter
function defineReactive(obj, key, val) {
  const dep = new Dep() // Dependency collector

  Object.defineProperty(obj, key, {
    get() {
      dep.depend() // Track dependency
      return val
    },
    set(newVal) {
      if (newVal === val) return
      val = newVal
      dep.notify() // Trigger updates
    }
  })
}

// Muammo: Yangi property qo'shilganda defineReactive() chaqirilmaydi
// Shuning uchun Vue.$set() kerak bo'ladi
```

```javascript
// Vue 3 - Proxy
// Ob'ekt ustidan to'liq nazorat
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key) // Track dependency
      const result = Reflect.get(target, key, receiver)
      if (isObject(result)) {
        return reactive(result) // Lazy deep reactivity
      }
      return result
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      if (oldValue !== value) {
        trigger(target, key) // Trigger updates
      }
      return result
    },
    deleteProperty(target, key) {
      const hadKey = hasOwn(target, key)
      const result = Reflect.deleteProperty(target, key)
      if (hadKey && result) {
        trigger(target, key) // delete ham kuzatiladi
      }
      return result
    }
  })
}
```

## API Farqlari

### Application Initialization

```javascript
// Vue 2 - Global Vue instance
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

// Global component
Vue.component('MyButton', MyButton)

// Global directive
Vue.directive('focus', focusDirective)

// Global mixin - XAVFLI!
Vue.mixin(globalMixin)

// Global plugin
Vue.use(VueRouter)
Vue.use(Vuex)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
```

```javascript
// Vue 3 - Application instance
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)

// Application-scoped (global pollution yo'q)
app.component('MyButton', MyButton)
app.directive('focus', focusDirective)

// Global properties
app.config.globalProperties.$http = axios

// Plugins
app.use(router)
app.use(createPinia())

app.mount('#app')

// Bir nechta ilovalar mumkin!
const adminApp = createApp(AdminApp)
adminApp.mount('#admin')
```

### Composition API vs Options API

```javascript
// Vue 2 - Faqat Options API
export default {
  name: 'UserProfile',

  props: {
    userId: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      user: null,
      loading: false,
      error: null
    }
  },

  computed: {
    fullName() {
      return this.user
        ? `${this.user.firstName} ${this.user.lastName}`
        : ''
    }
  },

  watch: {
    userId: {
      handler: 'fetchUser',
      immediate: true
    }
  },

  methods: {
    async fetchUser() {
      this.loading = true
      try {
        this.user = await api.getUser(this.userId)
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    }
  },

  // Lifecycle - bu joyda mantiq tarqalgan
  mounted() {
    console.log('Component mounted')
  },

  beforeDestroy() {
    // Cleanup
  }
}
```

```javascript
// Vue 3 - Composition API (mantiq guruhlangan)
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

// Composable - qayta ishlatiluvchi mantiq
function useUser(userId) {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fullName = computed(() => {
    return user.value
      ? `${user.value.firstName} ${user.value.lastName}`
      : ''
  })

  async function fetchUser() {
    loading.value = true
    try {
      user.value = await api.getUser(userId.value)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  watch(userId, fetchUser, { immediate: true })

  return { user, loading, error, fullName, fetchUser }
}

// Component
export default {
  props: {
    userId: {
      type: Number,
      required: true
    }
  },

  setup(props) {
    const { user, loading, error, fullName } = useUser(
      toRef(props, 'userId')
    )

    onMounted(() => {
      console.log('Component mounted')
    })

    onBeforeUnmount(() => {
      // Cleanup
    })

    return { user, loading, error, fullName }
  }
}
```

```vue
<!-- Vue 3.2+ - <script setup> (eng qisqa sintaksis) -->
<script setup>
import { toRef, onMounted, onBeforeUnmount } from 'vue'
import { useUser } from '@/composables/useUser'

const props = defineProps({
  userId: {
    type: Number,
    required: true
  }
})

const { user, loading, error, fullName } = useUser(
  toRef(props, 'userId')
)

onMounted(() => {
  console.log('Component mounted')
})

onBeforeUnmount(() => {
  // Cleanup
})
</script>
```

## Fragment Support

```vue
<!-- Vue 2 - Bitta root element MAJBURIY -->
<template>
  <div class="wrapper"> <!-- Keraksiz wrapper -->
    <header>Header</header>
    <main>Content</main>
    <footer>Footer</footer>
  </div>
</template>
```

```vue
<!-- Vue 3 - Ko'p root element (Fragment) -->
<template>
  <header>Header</header>
  <main>Content</main>
  <footer>Footer</footer>
</template>
```

## Teleport (Portal)

```vue
<!-- Vue 2 - Uchinchi tomon kutubxona kerak (portal-vue) -->

<!-- Vue 3 - Built-in Teleport -->
<template>
  <button @click="showModal = true">Open Modal</button>

  <Teleport to="body">
    <div v-if="showModal" class="modal">
      <h2>Modal Title</h2>
      <button @click="showModal = false">Close</button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
const showModal = ref(false)
</script>
```

## Suspense (Async Components)

```vue
<!-- Vue 3 - Built-in Suspense -->
<template>
  <Suspense>
    <!-- Async component -->
    <template #default>
      <AsyncUserProfile :id="userId" />
    </template>

    <!-- Loading state -->
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<script setup>
// Async component - setup() async bo'lishi mumkin
const AsyncUserProfile = defineAsyncComponent(() =>
  import('./UserProfile.vue')
)
</script>
```

```vue
<!-- UserProfile.vue - async setup -->
<script setup>
// Top-level await Suspense bilan ishlaydi
const user = await fetchUser(props.id)
</script>
```

## v-model O'zgarishlari

```vue
<!-- Vue 2 - Bitta v-model, .sync modifier -->
<template>
  <CustomInput v-model="value" />
  <CustomDialog :visible.sync="dialogVisible" />
</template>

<!-- CustomInput.vue (Vue 2) -->
<script>
export default {
  props: ['value'], // 'value' prop
  methods: {
    updateValue(newValue) {
      this.$emit('input', newValue) // 'input' event
    }
  }
}
</script>
```

```vue
<!-- Vue 3 - Ko'p v-model, .sync yo'q -->
<template>
  <CustomInput v-model="value" />
  <CustomInput v-model:title="title" v-model:content="content" />
  <CustomDialog v-model:visible="dialogVisible" />
</template>

<!-- CustomInput.vue (Vue 3) -->
<script setup>
// 'modelValue' prop, 'update:modelValue' event
defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function updateValue(newValue) {
  emit('update:modelValue', newValue)
}
</script>

<!-- Yoki defineModel (Vue 3.4+) -->
<script setup>
const model = defineModel()
// model.value = 'new value' - avtomatik emit
</script>
```

## Lifecycle Hooks O'zgarishlari

| Vue 2 | Vue 3 Options API | Vue 3 Composition API |
|-------|-------------------|----------------------|
| beforeCreate | beforeCreate | setup() |
| created | created | setup() |
| beforeMount | beforeMount | onBeforeMount |
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| beforeDestroy | **beforeUnmount** | onBeforeUnmount |
| destroyed | **unmounted** | onUnmounted |
| - | errorCaptured | onErrorCaptured |
| - | renderTracked | onRenderTracked |
| - | renderTriggered | onRenderTriggered |

```javascript
// Vue 2
export default {
  beforeDestroy() {
    // cleanup
  },
  destroyed() {
    // component destroyed
  }
}

// Vue 3 - Options API
export default {
  beforeUnmount() {
    // cleanup
  },
  unmounted() {
    // component unmounted
  }
}

// Vue 3 - Composition API
import { onBeforeUnmount, onUnmounted } from 'vue'

onBeforeUnmount(() => {
  // cleanup
})

onUnmounted(() => {
  // component unmounted
})
```

## Emits Declaration

```javascript
// Vue 2 - emits deklaratsiya qilish SHART EMAS
export default {
  methods: {
    handleClick() {
      this.$emit('custom-event', payload)
    }
  }
}
```

```javascript
// Vue 3 - emits deklaratsiya qilish TAVSIYA (validation uchun)
export default {
  emits: ['custom-event'],
  // yoki validation bilan
  emits: {
    'custom-event': (payload) => {
      return typeof payload === 'object'
    }
  }
}

// script setup
const emit = defineEmits(['custom-event'])
// yoki TypeScript bilan
const emit = defineEmits<{
  'custom-event': [payload: EventPayload]
}>()
```

## Filter → Computed/Method

```vue
<!-- Vue 2 - Filters mavjud -->
<template>
  <p>{{ message | capitalize | truncate(20) }}</p>
</template>

<script>
export default {
  filters: {
    capitalize(value) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    },
    truncate(value, length) {
      return value.length > length
        ? value.slice(0, length) + '...'
        : value
    }
  }
}
</script>
```

```vue
<!-- Vue 3 - Filters YO'Q, computed/method ishlatish -->
<template>
  <p>{{ formattedMessage }}</p>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['message'])

// Computed ishlatish
const formattedMessage = computed(() => {
  let result = props.message
  result = capitalize(result)
  result = truncate(result, 20)
  return result
})

// Helper functions
function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function truncate(value, length) {
  return value.length > length
    ? value.slice(0, length) + '...'
    : value
}
</script>
```

## TypeScript Qo'llab-quvvatlash

```typescript
// Vue 2 - TypeScript qo'llab-quvvatlash cheklangan
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      count: 0 as number
    }
  },
  computed: {
    doubled(): number {
      return this.count * 2
    }
  }
})

// yoki vue-class-component
@Component
export default class MyComponent extends Vue {
  count: number = 0

  get doubled(): number {
    return this.count * 2
  }
}
```

```typescript
// Vue 3 - To'liq TypeScript qo'llab-quvvatlash
import { defineComponent, ref, computed } from 'vue'

// defineComponent bilan
export default defineComponent({
  props: {
    title: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const count = ref<number>(0)
    const doubled = computed<number>(() => count.value * 2)

    return { count, doubled }
  }
})

// script setup bilan - ENG YAXSHI
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  'update': [value: number]
  'submit': [data: FormData]
}>()

const doubled = computed(() => props.count * 2)
</script>
```

## Performance Taqqoslash

### Bundle Size

```
Vue 2.x:  ~23kb (gzipped)
Vue 3.x:  ~10kb (gzipped, core only)
         ~22kb (gzipped, full build with compiler)
```

### Tree-shaking

```javascript
// Vue 2 - Global API, tree-shake qilib bo'lmaydi
import Vue from 'vue' // Hammasi import qilinadi

// Vue 3 - Named exports, tree-shakeable
import { ref, computed, watch } from 'vue' // Faqat kerakli
```

### Compiler Optimizations (Vue 3)

```vue
<template>
  <div>
    <span>Static text</span>           <!-- hoisted -->
    <span>{{ dynamic }}</span>         <!-- tracked -->
    <span :class="dynamicClass">Text</span>
  </div>
</template>

<!-- Vue 3 compiled output (soddalashtirilgan) -->
<script>
// Static content hoisting
const _hoisted_1 = /*#__PURE__*/ createVNode("span", null, "Static text")

function render() {
  return (
    openBlock(),
    createBlock("div", null, [
      _hoisted_1, // Reused, not recreated
      createVNode("span", null, toDisplayString(dynamic.value), 1 /* TEXT */),
      createVNode("span", { class: dynamicClass.value }, "Text", 2 /* CLASS */)
    ])
  )
}
</script>
```

## Migration Strategy

### 1. Compat Build (Migration Build)

```javascript
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.resolve.alias.set('vue', '@vue/compat')
  }
}

// main.js
import { createApp, configureCompat } from 'vue'

const app = createApp(App)

// Enable all Vue 2 behavior
configureCompat({
  MODE: 2
})

// yoki selective
configureCompat({
  COMPONENT_V_MODEL: false, // Vue 3 v-model
  RENDER_FUNCTION: false,   // Vue 3 render function
  // ...
})

app.mount('#app')
```

### 2. Incremental Migration

```javascript
// 1-qadam: Vue 2.7 ga yangilash (Composition API backport)
// package.json
{
  "dependencies": {
    "vue": "^2.7.0"
  }
}

// 2-qadam: Composition API ishlatishni boshlash
<script>
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    return { count }
  }
}
</script>

// 3-qadam: Vue 3 ga to'liq o'tish
```

## Real-World Migration Case Study

```javascript
// OLDIN: Vue 2 Vuex store
// store/modules/user.js
export default {
  namespaced: true,
  state: () => ({
    user: null,
    token: null
  }),
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const { user, token } = await api.login(credentials)
      commit('SET_USER', user)
      commit('SET_TOKEN', token)
    }
  },
  getters: {
    isAuthenticated: state => !!state.token
  }
}

// Component da ishlatish
export default {
  computed: {
    ...mapState('user', ['user']),
    ...mapGetters('user', ['isAuthenticated'])
  },
  methods: {
    ...mapActions('user', ['login'])
  }
}
```

```javascript
// KEYIN: Vue 3 Pinia store
// stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref(null)
  const token = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  async function login(credentials) {
    const response = await api.login(credentials)
    user.value = response.user
    token.value = response.token
  }

  function logout() {
    user.value = null
    token.value = null
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout
  }
})

// Component da ishlatish
<script setup>
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { user, isAuthenticated } = storeToRefs(userStore)
const { login, logout } = userStore
</script>
```

## Interview Savollari

### 1. Vue 3 da reaktivlik tizimi nima uchun Proxy'ga o'tkazildi?

**Javob:**
Vue 2 da `Object.defineProperty()` ishlatilgan, bu bir nechta cheklovlarga ega edi:

1. **Property qo'shish** - Yangi property qo'shilganda reaktiv emas (Vue.$set kerak)
2. **Array index** - `arr[0] = 'new'` reaktiv emas (splice kerak)
3. **delete operator** - Property o'chirilganda reaktiv emas
4. **Collection types** - Map, Set, WeakMap qo'llab-quvvatlanmaydi

Vue 3 da `Proxy` ishlatiladi:
- Ob'ekt ustidan to'liq nazorat (get, set, deleteProperty, has, ownKeys)
- Lazy reactivity - deep objects faqat kerak bo'lganda reactive qilinadi
- Memory efficient - getter/setter har property uchun emas, bitta proxy
- Native collection support

### 2. Composition API va Options API farqi nima? Qachon qaysi biri yaxshi?

**Javob:**

**Options API:**
- Mantiq turlar bo'yicha guruhlangan (data, methods, computed, watch)
- O'rganish oson, intuitiv
- Kichik komponentlar uchun yaxshi
- Mantiq tarqalgan - bitta feature kodi 4-5 joyda

**Composition API:**
- Mantiq feature bo'yicha guruhlangan
- Composables orqali qayta ishlatish oson
- TypeScript bilan yaxshi integratsiya
- Katta komponentlar uchun yaxshi
- Tree-shaking friendly

**Qachon qaysi:**
- Kichik loyiha, yangi dasturchilar → Options API
- Katta loyiha, TypeScript, mantiq qayta ishlatish → Composition API

### 3. Vue 3 da Fragment nima va nima uchun kerak?

**Javob:**
Fragment - bu komponentda bir nechta root element ishlatish imkoniyati.

Vue 2 da har bir komponent bitta root elementga ega bo'lishi SHART edi. Bu keraksiz wrapper div'lar yaratishga olib kelardi.

```vue
<!-- Vue 2 - wrapper kerak -->
<template>
  <div> <!-- keraksiz -->
    <td>Cell 1</td>
    <td>Cell 2</td>
  </div>
</template>

<!-- Vue 3 - Fragment -->
<template>
  <td>Cell 1</td>
  <td>Cell 2</td>
</template>
```

Bu ayniqsa table row, list item kabi elementlar uchun muhim.

### 4. v-model Vue 3 da qanday o'zgardi?

**Javob:**

| Jihat | Vue 2 | Vue 3 |
|-------|-------|-------|
| Default prop | `value` | `modelValue` |
| Default event | `input` | `update:modelValue` |
| Ko'p v-model | `.sync` modifier | `v-model:name` |
| Modifiers | `.lazy`, `.trim`, `.number` | Custom modifiers ham |

```vue
<!-- Vue 3 multiple v-model -->
<UserForm
  v-model:first-name="firstName"
  v-model:last-name="lastName"
  v-model.capitalize:title="title"
/>
```

### 5. Vue 3 ga migrate qilishda eng katta qiyinchiliklar qanday?

**Javob:**

1. **Global API o'zgarishlari** - `Vue.component()` → `app.component()`
2. **Render function** - `h` import qilish, slots o'zgarishi
3. **v-model** - prop/event nomlari o'zgarishi
4. **Filters o'chirildi** - computed/methods ga o'tkazish
5. **$listeners o'chirildi** - $attrs ga qo'shildi
6. **Lifecycle hooks** - beforeDestroy → beforeUnmount
7. **Vuex → Pinia** - state management o'zgarishi
8. **TypeScript** - yangi type definitions

**Migration strategy:**
1. Vue 2.7 ga yangilash (Composition API backport)
2. `@vue/compat` (compatibility build) ishlatish
3. Warning'larni birma-bir tuzatish
4. To'liq Vue 3 ga o'tish

---

## Xulosa

Vue 3 fundamental jihatdan yaxshilangan:
- **Performance:** Kichik bundle, tezroq render
- **TypeScript:** Birinchi darajali qo'llab-quvvatlash
- **Composition API:** Yaxshiroq kod organizatsiyasi
- **Reactivity:** To'liq, cheklovsiz
- **Tree-shaking:** Faqat kerakli kod

Vue 2 dan Vue 3 ga o'tish tavsiya etiladi, lekin migration path aniq bo'lishi kerak.
