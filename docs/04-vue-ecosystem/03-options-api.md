# Options API - Vue ning Klassik Yondashuvi

## Kirish

Options API - Vue.js ning original va eng ko'p ishlatiladigan API sifati. Komponent mantiqini oldindan belgilangan options (data, methods, computed, watch, lifecycle) orqali tashkil qiladi.

## Asosiy Tuzilma

```javascript
export default {
  // Komponent nomi (DevTools da ko'rinadi)
  name: 'UserProfile',

  // Komponent ro'yxatdan o'tkazish
  components: {
    UserAvatar,
    UserStats
  },

  // Direktivalar
  directives: {
    focus: focusDirective
  },

  // Mixins (Vue 2/3)
  mixins: [validationMixin],

  // Extends (single inheritance)
  extends: BaseComponent,

  // Provide/Inject
  provide() {
    return {
      theme: this.theme
    }
  },
  inject: ['locale'],

  // Props
  props: {
    userId: {
      type: Number,
      required: true
    }
  },

  // Emits (Vue 3)
  emits: ['update', 'delete'],

  // Reactive data
  data() {
    return {
      user: null,
      loading: false
    }
  },

  // Computed properties
  computed: {
    fullName() {
      return `${this.user?.firstName} ${this.user?.lastName}`
    }
  },

  // Watchers
  watch: {
    userId: {
      handler: 'fetchUser',
      immediate: true
    }
  },

  // Methods
  methods: {
    async fetchUser() {
      // ...
    }
  },

  // Lifecycle hooks
  created() {},
  mounted() {},
  beforeUnmount() {},

  // Render (optional)
  render() {
    return h('div', this.fullName)
  }
}
```

## Data Option

### Asosiy Qoidalar

```javascript
export default {
  // NOTO'G'RI - Object literal
  // Bu barcha instancelar o'rtasida share bo'ladi
  data: {
    count: 0
  },

  // TO'G'RI - Function qaytaradi
  // Har bir instance uchun yangi object
  data() {
    return {
      count: 0,
      user: null,
      items: []
    }
  }
}
```

### Reaktivlik Qoidalari

```javascript
export default {
  data() {
    return {
      user: {
        name: 'Ali',
        // Vue 2: age keyinroq qo'shilsa reaktiv EMAS
        // Vue 3: problem yo'q
      },
      items: ['a', 'b', 'c']
    }
  },

  methods: {
    // Vue 2 da muammo
    addAge() {
      // NOTO'G'RI (Vue 2)
      this.user.age = 25 // Reaktiv emas!

      // TO'G'RI (Vue 2)
      this.$set(this.user, 'age', 25)
      // yoki
      this.user = { ...this.user, age: 25 }
    },

    updateItem() {
      // NOTO'G'RI (Vue 2)
      this.items[0] = 'new' // Reaktiv emas!

      // TO'G'RI (Vue 2)
      this.$set(this.items, 0, 'new')
      // yoki
      this.items.splice(0, 1, 'new')
    },

    // Vue 3 da hammasi ishlaydi
    updateVue3() {
      this.user.age = 25 // OK
      this.items[0] = 'new' // OK
      delete this.user.name // OK
    }
  }
}
```

### Arrow Function Xatosi

```javascript
export default {
  data() {
    return {
      count: 0
    }
  },

  methods: {
    // NOTO'G'RI - Arrow function
    // `this` window/undefined bo'ladi
    increment: () => {
      this.count++ // TypeError!
    },

    // TO'G'RI - Regular function
    increment() {
      this.count++
    },

    // TO'G'RI - Shorthand
    decrement() {
      this.count--
    }
  },

  computed: {
    // NOTO'G'RI - Arrow function
    doubled: () => this.count * 2, // NaN

    // TO'G'RI
    doubled() {
      return this.count * 2
    }
  }
}
```

## Props

### Deklaratsiya Usullari

```javascript
export default {
  // 1. Array syntax (sodda)
  props: ['title', 'count', 'isActive'],

  // 2. Object syntax (type only)
  props: {
    title: String,
    count: Number,
    isActive: Boolean
  },

  // 3. Full syntax (tavsiya etiladi)
  props: {
    // Required prop
    userId: {
      type: Number,
      required: true
    },

    // Default value
    title: {
      type: String,
      default: 'Untitled'
    },

    // Multiple types
    id: {
      type: [String, Number],
      required: true
    },

    // Object/Array default - factory function
    config: {
      type: Object,
      default() {
        return { theme: 'light' }
      }
      // yoki Vue 3 da
      // default: () => ({ theme: 'light' })
    },

    // Custom validator
    status: {
      type: String,
      validator(value) {
        return ['pending', 'active', 'completed'].includes(value)
      }
    },

    // Boolean coercion
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
```

### Boolean Props

```vue
<!-- Boolean prop coercion -->
<MyButton disabled />        <!-- disabled = true -->
<MyButton :disabled="true" /> <!-- disabled = true -->
<MyButton :disabled="false" /> <!-- disabled = false -->
<MyButton />                  <!-- disabled = false (default) -->

<script>
export default {
  props: {
    disabled: Boolean
  }
}
</script>
```

### Prop Validation

```javascript
export default {
  props: {
    // Custom class instance
    author: {
      type: Person,
      required: true
    },

    // Complex validation
    email: {
      type: String,
      validator(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      }
    },

    // Conditional required
    phone: {
      type: String,
      required(props) {
        return !props.email // email yo'q bo'lsa required
      }
    }
  }
}
```

## Computed Properties

### Getter Only

```javascript
export default {
  data() {
    return {
      firstName: 'Ali',
      lastName: 'Valiyev',
      items: [
        { name: 'Apple', price: 10 },
        { name: 'Banana', price: 5 }
      ]
    }
  },

  computed: {
    // Simple computed
    fullName() {
      return `${this.firstName} ${this.lastName}`
    },

    // Array computed
    totalPrice() {
      return this.items.reduce((sum, item) => sum + item.price, 0)
    },

    // Filtered array
    expensiveItems() {
      return this.items.filter(item => item.price > 7)
    },

    // Conditional
    greeting() {
      const hour = new Date().getHours()
      if (hour < 12) return 'Good morning'
      if (hour < 18) return 'Good afternoon'
      return 'Good evening'
    }
  }
}
```

### Getter va Setter

```javascript
export default {
  data() {
    return {
      firstName: 'Ali',
      lastName: 'Valiyev'
    }
  },

  computed: {
    fullName: {
      get() {
        return `${this.firstName} ${this.lastName}`
      },
      set(newValue) {
        const parts = newValue.split(' ')
        this.firstName = parts[0]
        this.lastName = parts.slice(1).join(' ')
      }
    }
  },

  methods: {
    updateName() {
      this.fullName = 'Vali Karimov' // setter chaqiriladi
    }
  }
}
```

### Computed vs Methods

```javascript
export default {
  data() {
    return {
      items: [1, 2, 3, 4, 5]
    }
  },

  computed: {
    // CACHED - faqat items o'zgarganda qayta hisoblanadi
    evenItems() {
      console.log('Computing even items...')
      return this.items.filter(n => n % 2 === 0)
    }
  },

  methods: {
    // NOT CACHED - har safar chaqirilganda hisoblanadi
    getEvenItems() {
      console.log('Calculating even items...')
      return this.items.filter(n => n % 2 === 0)
    }
  }
}
```

```vue
<template>
  <!-- Computed - 1 marta hisoblanadi, cached -->
  <div>{{ evenItems }}</div>
  <div>{{ evenItems }}</div>
  <div>{{ evenItems }}</div>

  <!-- Method - 3 marta hisoblanadi! -->
  <div>{{ getEvenItems() }}</div>
  <div>{{ getEvenItems() }}</div>
  <div>{{ getEvenItems() }}</div>
</template>
```

## Watchers

### Basic Watch

```javascript
export default {
  data() {
    return {
      query: '',
      userId: 1,
      user: { name: 'Ali' }
    }
  },

  watch: {
    // Simple watcher
    query(newValue, oldValue) {
      console.log(`Query changed: ${oldValue} -> ${newValue}`)
      this.search(newValue)
    },

    // Method name as string
    userId: 'fetchUser',

    // Immediate - darhol chaqiriladi
    userId: {
      handler: 'fetchUser',
      immediate: true
    },

    // Deep watch - nested o'zgarishlarni kuzatish
    user: {
      handler(newValue, oldValue) {
        console.log('User changed:', newValue)
      },
      deep: true
    },

    // Specific nested property
    'user.name'(newValue) {
      console.log('Name changed:', newValue)
    }
  },

  methods: {
    fetchUser() {
      // API call
    },
    search(query) {
      // Search logic
    }
  }
}
```

### Watch with $watch

```javascript
export default {
  data() {
    return {
      query: ''
    }
  },

  created() {
    // Dynamic watcher
    const unwatch = this.$watch('query', (newVal) => {
      console.log('Query:', newVal)
    })

    // 5 soniyadan keyin watch'ni to'xtatish
    setTimeout(() => {
      unwatch()
    }, 5000)

    // Conditional watcher
    this.$watch(
      // Getter function
      () => this.query.length > 3 ? this.query : null,
      (newVal) => {
        if (newVal) {
          this.search(newVal)
        }
      }
    )
  }
}
```

## Methods

### Async Methods

```javascript
export default {
  data() {
    return {
      user: null,
      loading: false,
      error: null
    }
  },

  methods: {
    async fetchUser(id) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`/api/users/${id}`)

        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }

        this.user = await response.json()
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    // Debounced method
    search: debounce(function(query) {
      // `this` ishlaydi chunki oddiy function
      this.performSearch(query)
    }, 300),

    performSearch(query) {
      // API call
    }
  }
}
```

### Event Handlers

```javascript
export default {
  methods: {
    // Event object
    handleClick(event) {
      console.log('Clicked:', event.target)
    },

    // Custom arguments + event
    handleItemClick(item, event) {
      console.log('Item:', item)
      console.log('Event:', event)
    },

    // Prevent default
    handleSubmit(event) {
      event.preventDefault()
      this.submit()
    }
  }
}
```

```vue
<template>
  <!-- Event object avtomatik -->
  <button @click="handleClick">Click</button>

  <!-- Custom argument + $event -->
  <button @click="handleItemClick(item, $event)">Click</button>

  <!-- Modifier bilan (preventDefault kerak emas) -->
  <form @submit.prevent="submit">
    <button type="submit">Submit</button>
  </form>
</template>
```

## Mixins

### Basic Mixin

```javascript
// mixins/validationMixin.js
export const validationMixin = {
  data() {
    return {
      errors: {}
    }
  },

  methods: {
    validateEmail(email) {
      if (!email) {
        this.errors.email = 'Email majburiy'
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this.errors.email = "Noto'g'ri email format"
        return false
      }
      delete this.errors.email
      return true
    },

    validateRequired(field, value) {
      if (!value) {
        this.errors[field] = `${field} majburiy`
        return false
      }
      delete this.errors[field]
      return true
    },

    clearErrors() {
      this.errors = {}
    }
  },

  computed: {
    hasErrors() {
      return Object.keys(this.errors).length > 0
    }
  }
}

// Component da ishlatish
import { validationMixin } from '@/mixins/validationMixin'

export default {
  mixins: [validationMixin],

  data() {
    return {
      email: '',
      name: ''
    }
  },

  methods: {
    submit() {
      const emailValid = this.validateEmail(this.email)
      const nameValid = this.validateRequired('name', this.name)

      if (emailValid && nameValid) {
        // Submit
      }
    }
  }
}
```

### Mixin Muammolari

```javascript
// Muammo 1: Nomlar to'qnashuvi
const mixinA = {
  data() {
    return { value: 'A' }
  },
  methods: {
    log() { console.log('A') }
  }
}

const mixinB = {
  data() {
    return { value: 'B' } // TO'QNASHADI!
  },
  methods: {
    log() { console.log('B') } // TO'QNASHADI!
  }
}

export default {
  mixins: [mixinA, mixinB],
  // value = 'B' (oxirgi yutadi)
  // log() = mixinB.log (oxirgi yutadi)
}

// Muammo 2: Implicit dependencies
const modalMixin = {
  methods: {
    openModal() {
      this.isModalOpen = true // Qayerdan keldi?
    }
  }
}

// Muammo 3: Debugging qiyinligi
// DevTools da mixin dan kelgan property ko'rinmaydi
```

### Global Mixin (Xavfli)

```javascript
// main.js
// EHTIYOT BO'LING - BARCHA komponentlarga ta'sir qiladi!
Vue.mixin({
  created() {
    console.log('Component created:', this.$options.name)
  }
})

// Bu o'rniga plugin ishlatish yaxshiroq
```

## Extends

```javascript
// BaseButton.js
export default {
  props: {
    variant: {
      type: String,
      default: 'primary'
    }
  },

  computed: {
    buttonClass() {
      return `btn btn-${this.variant}`
    }
  },

  methods: {
    handleClick(event) {
      this.$emit('click', event)
    }
  }
}

// IconButton.js - extends BaseButton
import BaseButton from './BaseButton'

export default {
  extends: BaseButton,

  props: {
    icon: {
      type: String,
      required: true
    }
  },

  computed: {
    // Override
    buttonClass() {
      // Parent computed'ni chaqirish
      const base = BaseButton.computed.buttonClass.call(this)
      return `${base} btn-icon`
    }
  }
}
```

## Lifecycle da this.$nextTick

```javascript
export default {
  data() {
    return {
      message: 'Hello'
    }
  },

  methods: {
    async updateMessage() {
      this.message = 'Updated'

      // DOM hali yangilanmagan!
      console.log(this.$el.textContent) // 'Hello'

      // DOM yangilanishini kutish
      await this.$nextTick()

      // Endi DOM yangilangan
      console.log(this.$el.textContent) // 'Updated'
    },

    // Callback style
    updateMessageCallback() {
      this.message = 'Updated'

      this.$nextTick(() => {
        console.log(this.$el.textContent) // 'Updated'
      })
    }
  }
}
```

## Real-World Example: CRUD Component

```javascript
export default {
  name: 'UserList',

  components: {
    UserCard,
    UserModal,
    Pagination,
    LoadingSpinner,
    ErrorMessage
  },

  props: {
    initialFilters: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['user-selected', 'user-deleted'],

  data() {
    return {
      users: [],
      selectedUser: null,
      loading: false,
      error: null,

      // Pagination
      currentPage: 1,
      totalPages: 0,
      pageSize: 20,

      // Filters
      filters: { ...this.initialFilters },

      // Modal
      isModalOpen: false,
      modalMode: 'create' // 'create' | 'edit'
    }
  },

  computed: {
    hasUsers() {
      return this.users.length > 0
    },

    filteredUsers() {
      return this.users.filter(user => {
        if (this.filters.search) {
          const search = this.filters.search.toLowerCase()
          return (
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
          )
        }
        return true
      })
    },

    paginationInfo() {
      const start = (this.currentPage - 1) * this.pageSize + 1
      const end = Math.min(this.currentPage * this.pageSize, this.users.length)
      return `${start}-${end} of ${this.users.length}`
    }
  },

  watch: {
    filters: {
      handler() {
        this.currentPage = 1
        this.fetchUsers()
      },
      deep: true
    },

    currentPage: 'fetchUsers'
  },

  async created() {
    await this.fetchUsers()
  },

  methods: {
    async fetchUsers() {
      this.loading = true
      this.error = null

      try {
        const response = await api.getUsers({
          page: this.currentPage,
          pageSize: this.pageSize,
          ...this.filters
        })

        this.users = response.data
        this.totalPages = response.totalPages
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    openCreateModal() {
      this.selectedUser = null
      this.modalMode = 'create'
      this.isModalOpen = true
    },

    openEditModal(user) {
      this.selectedUser = { ...user }
      this.modalMode = 'edit'
      this.isModalOpen = true
    },

    async handleSave(userData) {
      try {
        if (this.modalMode === 'create') {
          await api.createUser(userData)
        } else {
          await api.updateUser(this.selectedUser.id, userData)
        }

        this.isModalOpen = false
        await this.fetchUsers()
      } catch (e) {
        this.error = e.message
      }
    },

    async handleDelete(user) {
      if (!confirm(`${user.name} ni o'chirmoqchimisiz?`)) {
        return
      }

      try {
        await api.deleteUser(user.id)
        this.$emit('user-deleted', user)
        await this.fetchUsers()
      } catch (e) {
        this.error = e.message
      }
    },

    handleUserSelect(user) {
      this.$emit('user-selected', user)
    },

    goToPage(page) {
      this.currentPage = page
    }
  }
}
```

## Vue 2 vs Vue 3 Options API

```javascript
// Vue 2
export default {
  // beforeDestroy va destroyed
  beforeDestroy() {
    console.log('Before destroy')
  },
  destroyed() {
    console.log('Destroyed')
  }
}

// Vue 3
export default {
  // beforeUnmount va unmounted (yangi nomlar)
  beforeUnmount() {
    console.log('Before unmount')
  },
  unmounted() {
    console.log('Unmounted')
  },

  // emits deklaratsiyasi (yangi)
  emits: ['update', 'delete'],

  // emits validation (yangi)
  emits: {
    update: (payload) => {
      return typeof payload === 'object'
    }
  }
}
```

| Feature | Vue 2 | Vue 3 |
|---------|-------|-------|
| beforeDestroy | ✓ | deprecated |
| destroyed | ✓ | deprecated |
| beforeUnmount | ✗ | ✓ |
| unmounted | ✗ | ✓ |
| emits option | ✗ | ✓ |
| $listeners | ✓ | $attrs ga qo'shildi |
| filters | ✓ | ✗ (o'chirildi) |

## Interview Savollari

### 1. data nima uchun function bo'lishi kerak?

**Javob:**
Agar `data` oddiy object bo'lsa, bir xil komponentning barcha instance'lari bir xil object'ga reference qiladi. Bu degani bir instance'dagi o'zgarish boshqalarga ham ta'sir qiladi.

```javascript
// NOTO'G'RI
data: {
  count: 0 // Barcha instancelar share qiladi!
}

// TO'G'RI
data() {
  return {
    count: 0 // Har instance uchun yangi object
  }
}
```

Function bo'lganda, har safar komponent yaratilganda yangi object return qilinadi.

### 2. Computed va method farqi nima?

**Javob:**

| Jihat | Computed | Method |
|-------|----------|--------|
| Caching | HA - dependency o'zgarmasa cache | YO'Q - har chaqiruvda hisoblash |
| Arguments | OLMAIYDI (getter pattern) | OLADI |
| Template da | `{{ computed }}` | `{{ method() }}` |
| Performance | Yaxshi (caching) | Yomon (har render da) |
| Side effects | Bo'LMASLIGI kerak | Bo'lishi MUMKIN |

Computed properties:
- Dependency-based caching
- Synchronous faqat
- Pure functions bo'lishi kerak (side effect yo'q)

### 3. Deep watch qachon kerak?

**Javob:**
Vue default bo'yicha faqat reference o'zgarishini kuzatadi. Nested properties o'zgarganda watch ishlamasligi mumkin:

```javascript
data() {
  return {
    user: { name: 'Ali', address: { city: 'Toshkent' } }
  }
},

watch: {
  // Bu ishlamaydi: user.address.city o'zgarganda
  user(newVal) {
    console.log('User changed')
  },

  // Bu ishlaydi
  user: {
    handler(newVal) {
      console.log('User changed')
    },
    deep: true // Nested o'zgarishlarni kuzatadi
  },

  // Yoki specific path
  'user.address.city'(newVal) {
    console.log('City changed:', newVal)
  }
}
```

**Eslatma:** `deep: true` performance'ga ta'sir qilishi mumkin katta ob'ektlarda.

### 4. Mixin muammolari nimada va alternativlar qanday?

**Javob:**

**Muammolar:**
1. **Nomlar to'qnashuvi** - Bir xil nomli property/method conflict
2. **Implicit dependencies** - Qayerdan kelganini bilish qiyin
3. **Debugging** - DevTools da ko'rinmaydi
4. **Type inference** - TypeScript bilan yomon ishlaydi

**Alternativlar:**
1. **Composition API (Composables)** - Vue 3 da eng yaxshi
2. **Higher-Order Components** - Component wrapping
3. **Renderless Components** - Slot-based logic sharing
4. **Provide/Inject** - Dependency injection

```javascript
// Mixin o'rniga Composable
// composables/useValidation.js
export function useValidation() {
  const errors = ref({})

  function validateEmail(email) {
    // ...
  }

  return { errors, validateEmail }
}
```

### 5. this.$nextTick() qachon ishlatiladi?

**Javob:**
Vue reaktiv data o'zgarganda DOM ni asinxron yangilaydi (batching). `$nextTick` DOM yangilanishidan keyin code ishlatish uchun:

```javascript
// Use cases:
// 1. DOM element'ga access olish
this.showInput = true
await this.$nextTick()
this.$refs.input.focus()

// 2. DOM o'lchamlarini o'qish
this.items.push(newItem)
await this.$nextTick()
const height = this.$el.offsetHeight

// 3. Third-party library bilan
this.chartData = newData
await this.$nextTick()
this.chart.update()
```

---

## Xulosa

Options API Vue ning original va stabil API sifati. U:
- O'rganish oson - strukturalangan options
- Kichik komponentlar uchun ideal
- Vue 2 dan o'tishda tanish
- TypeScript bilan ishlaganda Composition API yaxshiroq

Katta loyihalarda Composition API tavsiya etiladi, lekin Options API hali ham to'liq qo'llab-quvvatlanadi.
