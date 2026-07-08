# Vue.js Ecosystem - Chuqur O'rganish

## Kirish

Vue.js - progressiv JavaScript framework bo'lib, foydalanuvchi interfeyslarini yaratish uchun mo'ljallangan. "Progressiv" deganda, Vue.js loyihangiz o'sishi bilan birga o'sishi mumkinligini anglatadi - oddiy widget'dan murakkab SPA (Single Page Application) gacha.

## Ushbu Bo'lim Tarkibi

| # | Mavzu | Tavsif |
|---|-------|--------|
| 01 | [Vue 2 vs Vue 3](./01-vue2-vs-vue3.md) | Versiyalar orasidagi fundamental farqlar |
| 02 | [Composition API](./02-composition-api.md) | Vue 3 ning yangi reaktiv tizimi |
| 03 | [Options API](./03-options-api.md) | Klassik Vue yondashuvi |
| 04 | [Lifecycle Hooks](./04-lifecycle-hooks.md) | Komponent hayot sikli |
| 05 | [Watchers & Computed](./05-watchers-computed.md) | Reaktiv hisoblashlar va kuzatuvchilar |
| 06 | [Refs & Reactive](./06-refs-reactive.md) | Reaktivlik asoslari |
| 07 | [Dynamic Components](./07-dynamic-components.md) | Dinamik komponent almashtirish |
| 08 | [Render Functions](./08-render-functions.md) | Template'siz render |
| 09 | [Custom Directives](./09-custom-directives.md) | Maxsus direktivalar yaratish |
| 10 | [Composables](./10-composables.md) | Qayta ishlatiluvchi mantiq |
| 11 | [Provide/Inject](./11-provide-inject.md) | Dependency injection pattern |

## Vue.js Falsafasi

### 1. Progressiv Framework
```
Oddiy → Murakkab
─────────────────────────────────────────────────────►
CDN Script   →   Vue CLI   →   Nuxt.js   →   Enterprise
(widget)         (SPA)         (SSR/SSG)     (micro-frontends)
```

### 2. Reaktivlik Modeli
Vue.js reaktivlik tizimi JavaScript Proxy (Vue 3) yoki Object.defineProperty (Vue 2) asosida qurilgan:

```javascript
// Vue 3 reaktivlik - Proxy asosida
const state = reactive({ count: 0 })

// Vue ichki mexanizmi (soddalashtirilgan)
const reactiveHandler = {
  get(target, key) {
    track(target, key) // dependency tracking
    return target[key]
  },
  set(target, key, value) {
    target[key] = value
    trigger(target, key) // re-render trigger
    return true
  }
}
```

### 3. Virtual DOM
```
Template  →  Render Function  →  VNode Tree  →  DOM Patch
   ↓              ↓                  ↓              ↓
 .vue         JavaScript         Virtual DOM    Real DOM
```

## Vue 3 Arxitektura Diagrammasi

```
┌─────────────────────────────────────────────────────────────┐
│                     Vue Application                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Reactivity │  │  Compiler   │  │  Runtime            │  │
│  │  System     │  │             │  │                     │  │
│  │  ─────────  │  │  ─────────  │  │  ─────────────────  │  │
│  │  ref()      │  │  Template   │  │  createApp()        │  │
│  │  reactive() │  │  Parser     │  │  mount()            │  │
│  │  computed() │  │  Transform  │  │  patch()            │  │
│  │  watch()    │  │  Codegen    │  │  Component Instance │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                        VNode Layer                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  h() / createVNode() → VNode Tree → Diff Algorithm  │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                      Renderer Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  DOM Renderer   │  │  Custom Renderer │                  │
│  │  (Browser)      │  │  (Canvas, WebGL) │                  │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## Muhim Terminlar

| Termin | Ta'rif |
|--------|--------|
| **Reaktivlik** | Ma'lumot o'zgarganda avtomatik UI yangilanishi |
| **Komponent** | Qayta ishlatiluvchi, mustaqil UI bloki |
| **Props** | Ota komponentdan bolaga ma'lumot uzatish |
| **Emits** | Bola komponentdan otaga xabar yuborish |
| **Slots** | Komponent ichiga tashqi kontent kiritish |
| **Directive** | DOM elementlariga maxsus xatti-harakat berish |
| **Composable** | Qayta ishlatiluvchi reaktiv mantiq (Vue 3) |
| **Mixin** | Komponentlar orasida mantiq ulashish (Vue 2) |

## O'rganish Yo'l Xaritasi

```
Boshlang'ich                    O'rta                         Ilg'or
────────────────────────────────────────────────────────────────────►

Template Syntax          Composition API              Render Functions
v-bind, v-model         ref, reactive, computed       h(), createVNode()
v-if, v-for             watch, watchEffect           Custom Renderers
     │                        │                            │
     ▼                        ▼                            ▼
Props & Events          Composables                  Plugin Development
Component Basics        Provide/Inject               Compiler Macros
     │                        │                            │
     ▼                        ▼                            ▼
Vue Router              State Management             Performance Tuning
Basic Routing           Pinia Stores                 Tree-shaking
                                                     Code Splitting
```

## Senior Developer Uchun Muhim Mavzular

1. **Reaktivlik Chuqurligi** - Proxy traps, dependency tracking, effect scheduling
2. **Compiler Optimization** - Static hoisting, patch flags, block tree
3. **Memory Management** - Component unmounting, watcher cleanup, memory leaks
4. **Performance Patterns** - Lazy loading, virtual scrolling, memoization
5. **Testing Strategies** - Unit, integration, e2e testing patterns
6. **TypeScript Integration** - Generic components, type inference, defineComponent

## Foydali Resurslar

- [Vue.js Rasmiy Dokumentatsiya](https://vuejs.org/)
- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [VueUse - Composables Collection](https://vueuse.org/)
- [Pinia - State Management](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)

---

> **Eslatma:** Ushbu bo'limdagi barcha misollar Vue 3 uchun yozilgan, lekin Vue 2 farqlari ham ko'rsatilgan.
