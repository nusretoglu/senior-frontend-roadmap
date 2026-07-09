# Plugins

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Nuxt.js loyihalarida butun dastur bo'ylab (Global darajada) kerak bo'ladigan kutubxonalar, komponentlar yoki sozlamalar bo'lishi mumkin. Masalan, tahliliy vosita (Google Analytics), yagona API mijozi (Axios/Fetch), yoki til tarjimoni (i18n). Bularni har bir sahifaga alohida-alohida ulab chiqish noqulay va xato qilish ehtimoli baland. **Plugins** (Plaginlar) orqali biz ularni dastur eng boshida bir martagina ulaymiz va butun dastur bo'ylab bemalol foydalanamiz.

> [!NOTE]
> **Real-hayot analogiyasi: "Yangi avtomobilga qo'shimcha uskunalar o'rnatish"**  
> Nuxt dasturingizni zavoddan endi chiqqan yangi avtomobil deb faraz qiling. U yurishga tayyor, lekin sizga GPS navigatori, avtomagnitola yoki o'rindiq isitgich kerak. Siz bu qo'shimchalarni **Plaginlar (Plugins)** orqali o'rnatasiz. Ular avtomobil harakatlanishni boshlashidan (App mounted) oldin ulanadi.

## Nazariya

### Plugin Nima?

Plugin - Nuxt app yaratilganda ishga tushadigan kod. Vue app instance'ga functionality qo'shish yoki global state/service'lar taqdim etish uchun ishlatiladi.

```mermaid
graph TD
    A([1. Nuxt App Yaratildi]) --> B[2. Plaginlar Ishga tushadi<br>plugins/01.auth.ts -> 02.api.ts]
    B --> C[3. App O'rnatildi<br>Vue mounted]
    C --> D[4. Marshrutlar (Routes) Aniqlanadi<br>Middleware runs]
    D --> E(((5. Sahifa Ko'rsatiladi)))
    
    style A fill:#e3f2fd,stroke:#1976d2
    style B fill:#ffe0b2,stroke:#f57c00
    style E fill:#c8e6c9,stroke:#388e3c
```

### Plugin Turlari

| Turi | Fayl Nomi Namunasi | Tushuntirish |
| --- | --- | --- |
| **Universal Plugins** | `plugins/api.ts` | Ham serverda, ham mijoz (brauzer) da ishlaydi. Odatiy tanlov. |
| **Client-Only Plugins** | `plugins/analytics.client.ts` | `.client.ts` qo'shimchasi bilan faqat brauzerda ishlaydi (M: Google Analytics, Browser API lar). |
| **Server-Only Plugins** | `plugins/serverInit.server.ts` | `.server.ts` qo'shimchasi bilan faqat serverda ishlaydi. |
| **Tartiblangan Plugins** | `plugins/01.auth.ts` | Agar plaginlar bir-biriga bog'liq bo'lsa (Auth API dan oldin ishlashi kerak), raqam bilan boshlanadi. |

### Plugin vs Composable vs Module

| Xususiyat | Plugin | Composable | Module |
| --- | --- | --- | --- |
| **Darajasi** | App-level (Butun Ilova) | Component-level (Lokal) | Build-time (Qurish vaqtida) |
| **Maqsadi** | Side effects, 3rd party libs | Qayta ishlatiluvchi mantiq | Konfiguratsiya / Kengaytirish |
| **Qamrovi (Scope)**| Global | Lokal (O'zgaruvchan) | Ko'p ilovalar uchun |
| **Qo'llanilishi** | `provide`, Directives, Axios | State boshqaruvi, Utilities | Nuxt config, Auto-imports |

## Kod Misollari

### Basic Plugin

```typescript
// plugins/hello.ts
export default defineNuxtPlugin((nuxtApp) => {
  // Simple plugin - console log
  console.log('Hello from plugin!')

  // Access Vue app
  console.log('Vue app:', nuxtApp.vueApp)
})
```

### Provide/Inject Pattern

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // Create API client
  const api = {
    baseURL: config.public.apiBase,

    async get<T>(url: string): Promise<T> {
      return await $fetch<T>(`${this.baseURL}${url}`)
    },

    async post<T>(url: string, body: unknown): Promise<T> {
      return await $fetch<T>(`${this.baseURL}${url}`, {
        method: 'POST',
        body
      })
    },

    async put<T>(url: string, body: unknown): Promise<T> {
      return await $fetch<T>(`${this.baseURL}${url}`, {
        method: 'PUT',
        body
      })
    },

    async delete(url: string): Promise<void> {
      await $fetch(`${this.baseURL}${url}`, { method: 'DELETE' })
    }
  }

  // Provide globally
  return {
    provide: {
      api
    }
  }
})
```

```vue
<!-- pages/users.vue -->
<script setup>
// Access via useNuxtApp()
const { $api } = useNuxtApp()

const users = await $api.get('/users')
</script>

<!-- Or with auto-import -->
<script setup>
// TypeScript needs declaration
const { $api } = useNuxtApp()
const users = await $api.get<User[]>('/users')
</script>
```

```typescript
// types/plugins.d.ts
declare module '#app' {
  interface NuxtApp {
    $api: {
      get<T>(url: string): Promise<T>
      post<T>(url: string, body: unknown): Promise<T>
      put<T>(url: string, body: unknown): Promise<T>
      delete(url: string): Promise<void>
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: NuxtApp['$api']
  }
}

export {}
```

### Client-Only Plugin

```typescript
// plugins/analytics.client.ts
export default defineNuxtPlugin(() => {
  // Only runs in browser

  // Google Analytics
  const config = useRuntimeConfig()

  if (config.public.gaId) {
    // Load GA script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.public.gaId}`
    script.async = true
    document.head.appendChild(script)

    // Initialize
    window.dataLayer = window.dataLayer || []
    window.gtag = function() {
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', config.public.gaId)
  }

  // Track page views
  const router = useRouter()
  router.afterEach((to) => {
    window.gtag?.('event', 'page_view', {
      page_path: to.fullPath
    })
  })

  return {
    provide: {
      trackEvent: (name: string, params?: Record<string, unknown>) => {
        window.gtag?.('event', name, params)
      }
    }
  }
})
```

### Server-Only Plugin

```typescript
// plugins/serverInit.server.ts
export default defineNuxtPlugin(async (nuxtApp) => {
  // Only runs on server

  // Initialize server-side services
  const config = useRuntimeConfig()

  // Example: Fetch initial data for all pages
  const { data } = await useFetch('/api/config')

  // Store in payload for client
  nuxtApp.payload.serverConfig = data.value

  // Or use useState
  useState('serverConfig', () => data.value)
})
```

### Ordered Plugins

```typescript
// plugins/01.auth.ts
// Runs first
export default defineNuxtPlugin(async () => {
  const { fetchUser, token } = useAuth()

  // Initialize auth state
  if (token.value) {
    await fetchUser()
  }
})

// plugins/02.api.ts
// Runs second (after auth)
export default defineNuxtPlugin(() => {
  const { token } = useAuth()

  // API client with auth token
  const api = $fetch.create({
    baseURL: '/api',
    onRequest({ options }) {
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`
        }
      }
    }
  })

  return {
    provide: { api }
  }
})

// plugins/03.sentry.client.ts
// Runs third, client only
export default defineNuxtPlugin(() => {
  const { user } = useAuth()

  // Sentry initialization
  Sentry.init({
    dsn: useRuntimeConfig().public.sentryDsn
  })

  // Set user context
  if (user.value) {
    Sentry.setUser({ id: user.value.id })
  }
})
```

### Vue Plugin Integration

```typescript
// plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#1976D2',
            secondary: '#424242'
          }
        }
      }
    }
  })

  nuxtApp.vueApp.use(vuetify)
})
```

```typescript
// plugins/pinia-persist.client.ts
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin((nuxtApp) => {
  // Add Pinia plugin (client-only for localStorage)
  nuxtApp.$pinia.use(piniaPluginPersistedstate)
})
```

### Global Components

```typescript
// plugins/globalComponents.ts
import BaseButton from '~/components/base/BaseButton.vue'
import BaseInput from '~/components/base/BaseInput.vue'
import BaseModal from '~/components/base/BaseModal.vue'

export default defineNuxtPlugin((nuxtApp) => {
  // Register global components
  nuxtApp.vueApp.component('BaseButton', BaseButton)
  nuxtApp.vueApp.component('BaseInput', BaseInput)
  nuxtApp.vueApp.component('BaseModal', BaseModal)
})
```

### Directives

```typescript
// plugins/directives.ts
export default defineNuxtPlugin((nuxtApp) => {
  // v-focus directive
  nuxtApp.vueApp.directive('focus', {
    mounted(el) {
      el.focus()
    }
  })

  // v-click-outside directive
  nuxtApp.vueApp.directive('click-outside', {
    mounted(el, binding) {
      el._clickOutside = (event: MouseEvent) => {
        if (!el.contains(event.target as Node)) {
          binding.value(event)
        }
      }
      document.addEventListener('click', el._clickOutside)
    },
    unmounted(el) {
      document.removeEventListener('click', el._clickOutside)
    }
  })

  // v-lazy-load directive
  nuxtApp.vueApp.directive('lazy-load', {
    mounted(el, binding) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          el.src = binding.value
          observer.disconnect()
        }
      })
      observer.observe(el)
    }
  })
})
```

```vue
<!-- Usage -->
<template>
  <input v-focus />

  <div v-click-outside="closeDropdown">
    <Dropdown />
  </div>

  <img v-lazy-load="imageUrl" />
</template>
```

### Error Handling Plugin

```typescript
// plugins/errorHandler.ts
export default defineNuxtPlugin((nuxtApp) => {
  // Vue error handler
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.error('Vue Error:', error)
    console.error('Component:', instance)
    console.error('Info:', info)

    // Send to error tracking
    if (process.client) {
      // Sentry, LogRocket, etc.
    }
  }

  // Unhandled promise rejections
  if (process.client) {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise:', event.reason)
    })
  }

  // Nuxt hooks for SSR errors
  nuxtApp.hook('vue:error', (error) => {
    console.error('Nuxt Vue Error:', error)
  })

  nuxtApp.hook('app:error', (error) => {
    console.error('Nuxt App Error:', error)
  })
})
```

### Async Plugin

```typescript
// plugins/init.ts
export default defineNuxtPlugin(async (nuxtApp) => {
  // Async initialization

  // 1. Wait for some setup
  const config = await $fetch('/api/app-config')

  // 2. Store in state
  useState('appConfig', () => config)

  // 3. Continue with app
})
```

### Plugin with Hooks

```typescript
// plugins/performance.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  const metrics: Record<string, number> = {}

  // Page start
  nuxtApp.hook('page:start', () => {
    metrics.pageStart = performance.now()
  })

  // Page finish
  nuxtApp.hook('page:finish', () => {
    const duration = performance.now() - metrics.pageStart
    console.log(`Page load: ${duration.toFixed(2)}ms`)
  })

  // Route change
  nuxtApp.hook('page:transition:finish', () => {
    console.log('Transition complete')
  })

  // App mounted
  nuxtApp.hook('app:mounted', () => {
    console.log('App mounted')
  })
})
```

### Noto'g'ri Patterns

```typescript
// NOTO'G'RI: Plugin ichida component-specific logic
// plugins/bad.ts
export default defineNuxtPlugin(() => {
  // Bu composable bo'lishi kerak!
  const count = ref(0)
  const increment = () => count.value++

  return {
    provide: { count, increment }
  }
})

// TO'G'RI: Composable ishlatish
// composables/useCounter.ts
export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}
```

```typescript
// NOTO'G'RI: Client API server'da
// plugins/storage.ts
export default defineNuxtPlugin(() => {
  // Server'da crash!
  const theme = localStorage.getItem('theme')
})

// TO'G'RI: Client check
// plugins/storage.client.ts (yoki process.client)
export default defineNuxtPlugin(() => {
  const theme = localStorage.getItem('theme')
})
```

```typescript
// NOTO'G'RI: Heavy computation blocking
// plugins/heavy.ts
export default defineNuxtPlugin(() => {
  // Bu app start'ni sekinlashtiradi!
  for (let i = 0; i < 1000000; i++) {
    // heavy work
  }
})

// TO'G'RI: Defer yoki lazy
// plugins/heavy.client.ts
export default defineNuxtPlugin(() => {
  // Defer to next tick
  setTimeout(() => {
    // heavy work
  }, 0)

  // Or use requestIdleCallback
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // heavy work
    })
  }
})
```

## Real-World Cases

### Case 1: Authentication Plugin

```typescript
// plugins/01.auth.ts
import type { User } from '~/types'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')
  const user = useState<User | null>('user', () => null)

  // Create auth service
  const auth = {
    get isAuthenticated() {
      return !!user.value
    },

    get user() {
      return user.value
    },

    async login(email: string, password: string) {
      const response = await $fetch<{ token: string; user: User }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: { email, password }
        }
      )

      token.value = response.token
      user.value = response.user

      return response.user
    },

    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' })
      token.value = null
      user.value = null
      navigateTo('/login')
    },

    async fetchUser() {
      if (!token.value) return null

      try {
        const userData = await $fetch<User>('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        })
        user.value = userData
        return userData
      } catch {
        token.value = null
        user.value = null
        return null
      }
    }
  }

  // Initialize on server/client
  if (token.value && !user.value) {
    await auth.fetchUser()
  }

  return {
    provide: {
      auth
    }
  }
})
```

```typescript
// types/plugins.d.ts
declare module '#app' {
  interface NuxtApp {
    $auth: {
      isAuthenticated: boolean
      user: User | null
      login(email: string, password: string): Promise<User>
      logout(): Promise<void>
      fetchUser(): Promise<User | null>
    }
  }
}
```

### Case 2: Toast Notifications Plugin

```typescript
// plugins/toast.client.ts
import type { ToastOptions } from '~/types'

export default defineNuxtPlugin(() => {
  const toasts = useState<Toast[]>('toasts', () => [])
  let id = 0

  const toast = {
    show(message: string, options: ToastOptions = {}) {
      const toast: Toast = {
        id: ++id,
        message,
        type: options.type || 'info',
        duration: options.duration || 3000
      }

      toasts.value.push(toast)

      // Auto remove
      if (toast.duration > 0) {
        setTimeout(() => {
          this.remove(toast.id)
        }, toast.duration)
      }

      return toast.id
    },

    success(message: string, options?: ToastOptions) {
      return this.show(message, { ...options, type: 'success' })
    },

    error(message: string, options?: ToastOptions) {
      return this.show(message, { ...options, type: 'error' })
    },

    warning(message: string, options?: ToastOptions) {
      return this.show(message, { ...options, type: 'warning' })
    },

    remove(id: number) {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }
    },

    clear() {
      toasts.value = []
    }
  }

  return {
    provide: { toast }
  }
})
```

```vue
<!-- components/ToastContainer.vue -->
<script setup>
const toasts = useState<Toast[]>('toasts')
const { $toast } = useNuxtApp()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.type}`]"
        >
          {{ toast.message }}
          <button @click="$toast.remove(toast.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
```

### Case 3: API Client with Interceptors

```typescript
// plugins/02.api.ts
import { FetchError } from 'ofetch'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { $auth } = useNuxtApp()
  const { $toast } = useNuxtApp()

  const api = $fetch.create({
    baseURL: config.public.apiBase,

    onRequest({ options }) {
      // Add auth token
      if ($auth?.user) {
        const token = useCookie('auth_token').value
        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`
          }
        }
      }

      // Add request ID for tracing
      options.headers = {
        ...options.headers,
        'X-Request-ID': crypto.randomUUID()
      }
    },

    onRequestError({ error }) {
      console.error('Request error:', error)
    },

    onResponse({ response }) {
      // Log response time
      const duration = response.headers.get('X-Response-Time')
      if (duration) {
        console.log(`API response: ${duration}`)
      }
    },

    async onResponseError({ response }) {
      const status = response.status

      // Handle specific errors
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          await $auth?.logout()
          break

        case 403:
          $toast?.error('Access denied')
          break

        case 404:
          $toast?.error('Resource not found')
          break

        case 422:
          // Validation error - handled by caller
          break

        case 429:
          $toast?.warning('Too many requests. Please slow down.')
          break

        case 500:
          $toast?.error('Server error. Please try again later.')
          break
      }
    }
  })

  return {
    provide: {
      api
    }
  }
})
```

### Case 4: Feature Flags Plugin

```typescript
// plugins/featureFlags.ts
interface FeatureFlags {
  [key: string]: boolean
}

export default defineNuxtPlugin(async () => {
  const flags = useState<FeatureFlags>('featureFlags', () => ({}))

  // Fetch flags from API or config
  if (process.server) {
    const response = await $fetch<FeatureFlags>('/api/feature-flags')
    flags.value = response
  }

  const featureFlags = {
    isEnabled(flag: string): boolean {
      return flags.value[flag] ?? false
    },

    async refresh() {
      const response = await $fetch<FeatureFlags>('/api/feature-flags')
      flags.value = response
    }
  }

  return {
    provide: {
      featureFlags
    }
  }
})
```

```vue
<!-- Usage in components -->
<script setup>
const { $featureFlags } = useNuxtApp()
</script>

<template>
  <div>
    <NewFeature v-if="$featureFlags.isEnabled('new-feature')" />
    <OldFeature v-else />
  </div>
</template>
```

### Case 5: i18n Plugin

```typescript
// plugins/i18n.ts
interface Messages {
  [locale: string]: {
    [key: string]: string
  }
}

export default defineNuxtPlugin(async () => {
  const locale = useCookie('locale', { default: () => 'en' })
  const messages = useState<Messages>('i18n-messages', () => ({}))

  // Load initial messages
  if (process.server || !messages.value[locale.value]) {
    const localeMessages = await import(`~/locales/${locale.value}.json`)
    messages.value[locale.value] = localeMessages.default
  }

  const i18n = {
    get locale() {
      return locale.value
    },

    async setLocale(newLocale: string) {
      // Load messages if not cached
      if (!messages.value[newLocale]) {
        const localeMessages = await import(`~/locales/${newLocale}.json`)
        messages.value[newLocale] = localeMessages.default
      }

      locale.value = newLocale
    },

    t(key: string, params?: Record<string, string>): string {
      let message = messages.value[locale.value]?.[key] || key

      // Replace params
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          message = message.replace(`{${k}}`, v)
        })
      }

      return message
    }
  }

  // Provide to Vue
  return {
    provide: {
      i18n,
      t: i18n.t.bind(i18n)
    }
  }
})
```

## Plugin Hooks

```typescript
// plugins/hooks.ts
export default defineNuxtPlugin((nuxtApp) => {
  // App lifecycle hooks

  // Before app created
  nuxtApp.hook('app:created', (vueApp) => {
    console.log('Vue app created')
  })

  // After app mounted
  nuxtApp.hook('app:mounted', () => {
    console.log('App mounted in DOM')
  })

  // Before render (SSR)
  nuxtApp.hook('app:rendered', (ctx) => {
    console.log('App rendered (SSR)')
  })

  // Page hooks
  nuxtApp.hook('page:start', () => {
    console.log('Page navigation started')
  })

  nuxtApp.hook('page:finish', () => {
    console.log('Page navigation finished')
  })

  nuxtApp.hook('page:transition:finish', () => {
    console.log('Page transition complete')
  })

  // Vue hooks
  nuxtApp.hook('vue:setup', () => {
    console.log('Vue setup running')
  })

  nuxtApp.hook('vue:error', (error, instance, info) => {
    console.error('Vue error:', error)
  })

  // Link prefetch
  nuxtApp.hook('link:prefetch', (to) => {
    console.log('Prefetching:', to)
  })
})
```

## Interview Savollari

### Savol 1: Nuxt plugin nima va qachon ishlatiladi?

**Javob:**

Plugin - Nuxt app yaratilganda ishga tushadigan kod. Vue app instance'ga global functionality qo'shish uchun ishlatiladi.

**Ishlatiladi:**
1. **Third-party library** integratsiya (Vuetify, Sentry, Analytics)
2. **Global services** provide qilish (API client, auth)
3. **Vue directives** ro'yxatdan o'tkazish
4. **Global components** register qilish
5. **App hooks** bilan ishlash

**Ishlatilmaydi:**
1. Component-specific logic (composable kerak)
2. Page-specific code (page/middleware kerak)
3. Build-time configuration (module kerak)

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => {
  return {
    provide: {
      api: createApiClient()
    }
  }
})
```

### Savol 2: Plugin vs Composable farqi nima?

**Javob:**

| Plugin | Composable |
|--------|------------|
| App-level | Component-level |
| Bir marta ishlaydi | Har call'da yangi instance |
| Global side effects | Pure functions |
| Provide/inject | Return values |
| Third-party setup | Shared logic |

**Plugin:**
```typescript
// Global API client - bir marta yaratiladi
export default defineNuxtPlugin(() => {
  const api = createApiClient()
  return { provide: { api } }
})
```

**Composable:**
```typescript
// Component-level state - har component'da alohida
export function useCounter() {
  const count = ref(0)
  return { count, increment: () => count.value++ }
}
```

### Savol 3: .client.ts va .server.ts farqi?

**Javob:**

```
plugins/
├── analytics.client.ts    # Faqat browser'da
├── db.server.ts           # Faqat server'da
└── api.ts                 # Har ikkalasida
```

**Client-only (.client.ts):**
- Browser API (localStorage, window)
- Analytics (GA, Sentry)
- UI libraries (scroll, animation)

**Server-only (.server.ts):**
- Database connections
- File system
- Secrets/credentials

**Universal:**
- API clients
- State management
- Utilities

### Savol 4: Plugin'da async operatsiya qanday bajariladi?

**Javob:**

```typescript
// Async plugin
export default defineNuxtPlugin(async (nuxtApp) => {
  // 1. Await async operation
  const config = await $fetch('/api/config')

  // 2. Store in state
  useState('config', () => config)

  // 3. App continues after completion
})

// Parallel async
export default defineNuxtPlugin(async (nuxtApp) => {
  // Run in parallel
  const [users, products] = await Promise.all([
    $fetch('/api/users'),
    $fetch('/api/products')
  ])

  return {
    provide: { users, products }
  }
})
```

**Muhim:** Async plugin app start'ni kutib turadi. Heavy operations'ni defer qiling.

### Savol 5: Plugin ordering qanday ishlaydi?

**Javob:**

```
plugins/
├── 01.auth.ts       # First
├── 02.api.ts        # Second (auth kerak)
├── 03.sentry.ts     # Third
├── analytics.ts     # After numbered (alphabetical)
└── utils.ts         # Last
```

**Ordering rules:**
1. Numbered plugins (01, 02, ...) birinchi, tartib bo'yicha
2. Keyin numbered bo'lmaganlar, alifbo tartibida
3. `.server.ts` / `.client.ts` alohida filter qilinadi

**Dependencies:**
```typescript
// 01.auth.ts
export default defineNuxtPlugin(() => {
  // Auth setup
})

// 02.api.ts - 01 tugaganidan keyin ishlaydi
export default defineNuxtPlugin(() => {
  const { $auth } = useNuxtApp() // 01 dan
  // API with auth
})
```

## Best Practices

### 1. Naming Convention

```
plugins/
├── 01.auth.ts              # Ordered, universal
├── 02.api.ts               # Ordered, universal
├── analytics.client.ts     # Client-only
├── serverInit.server.ts    # Server-only
└── vuetify.ts              # Universal
```

### 2. TypeScript Declarations

```typescript
// types/plugins.d.ts
declare module '#app' {
  interface NuxtApp {
    $api: ApiClient
    $toast: ToastService
    $auth: AuthService
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: ApiClient
    $toast: ToastService
    $auth: AuthService
  }
}

export {}
```

### 3. Error Handling

```typescript
export default defineNuxtPlugin(async () => {
  try {
    const data = await riskyOperation()
    return { provide: { data } }
  } catch (error) {
    console.error('Plugin error:', error)
    // Graceful fallback
    return { provide: { data: null } }
  }
})
```

### 4. Performance

```typescript
// Defer non-critical plugins
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Load after interaction
    document.addEventListener('click', () => {
      loadHeavyAnalytics()
    }, { once: true })
  }
})

// Or use requestIdleCallback
export default defineNuxtPlugin(() => {
  if (process.client && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      initNonCriticalService()
    })
  }
})
```

### 5. Testing

```typescript
// tests/plugins/api.test.ts
import { describe, it, expect, vi } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('API Plugin', () => {
  it('provides $api', async () => {
    await setup({
      plugins: ['~/plugins/api.ts']
    })

    const nuxtApp = useNuxtApp()
    expect(nuxtApp.$api).toBeDefined()
    expect(typeof nuxtApp.$api.get).toBe('function')
  })
})
```

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Client / Server ga e'tibor bering:** Agar plagin ichida brauzer xossalaridan (`window`, `document`) foydalanmoqchi bo'lsangiz, fayl nomini albatta `.client.ts` deb yozing yoki ichkarida `import.meta.client` bilan tekshiring. Bo'lmasa server xatosi (500) yuzaga keladi.
2. **Kechiktirib yuklash (Defer):** Dasturning eng asosiy ishlashiga daxldor bo'lmagan plaginlarni (masalan tahliliy skriptlarni) iloji boricha kechiktirib (timeout yoki scroll bo'lganda) ishga tushiring. Bu saytning First Contentful Paint (FCP) ko'rsatkichini yaxshilaydi.
3. **Plaginlar Composable emas:** Komponent darajasidagi (lokal) ishlarni yoki qayta-qayta ishlatiluvchi mantiqni plagin emas, Composable (`composables/`) shaklida ishlating. Plagin asosan 3-tomon integratsiyalari va global sozlamalar (Vue.use() kabi) uchun mos keladi.

---

## Xulosa

Nuxt plugins app-level functionality uchun kuchli vosita:

1. **defineNuxtPlugin** - plugin yaratish API
2. **provide/inject** - global services
3. **.client.ts / .server.ts** - environment-specific
4. **Numbered (01, 02)** - ordering
5. **Hooks** - lifecycle events

Plugin'larni composable'lar bilan aralashtirmang - har birining o'z vazifasi bor. Third-party integration va global services uchun plugin, component logic uchun composable ishlatng.
