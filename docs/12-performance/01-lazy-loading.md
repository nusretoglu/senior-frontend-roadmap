# Lazy Loading

Lazy loading - bu resurslarni faqat kerak bo'lganda yuklash texnikasi. Bu initial load vaqtini kamaytiradi va foydalanuvchi tajribasini yaxshilaydi.

## Nazariya

### Lazy Loading Turlari

```
1. Component Lazy Loading - Vue/React komponentlar
2. Route Lazy Loading - Sahifalar
3. Image Lazy Loading - Rasmlar
4. Module Lazy Loading - ES modules
5. Data Lazy Loading - API ma'lumotlari
```

### Qanday Ishlaydi?

```
Initial Load:
┌─────────────────────────────────┐
│ Critical Resources Only         │
│ - HTML                          │
│ - Critical CSS                  │
│ - Main JS (minimal)             │
└─────────────────────────────────┘

On Demand:
┌─────────────────────────────────┐
│ User triggers action            │
│        ↓                        │
│ Dynamic import()                │
│        ↓                        │
│ Resource loaded                 │
│        ↓                        │
│ Rendered to user                │
└─────────────────────────────────┘
```

## Component Lazy Loading

### Sekin Variant (Eager Loading)

```javascript
// Barcha komponentlar bir vaqtda yuklanadi
import HomePage from './pages/HomePage.vue';
import AboutPage from './pages/AboutPage.vue';
import ProductsPage from './pages/ProductsPage.vue';
import ContactPage from './pages/ContactPage.vue';
import AdminDashboard from './pages/AdminDashboard.vue';

// Initial bundle: 500KB
const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/products', component: ProductsPage },
  { path: '/contact', component: ContactPage },
  { path: '/admin', component: AdminDashboard }
];
```

**Muammo:** Foydalanuvchi faqat home sahifani ko'rmoqchi, lekin 500KB yuklanadi.

### Tez Variant (Lazy Loading)

```javascript
// Vue Router bilan lazy loading
const routes = [
  {
    path: '/',
    component: () => import('./pages/HomePage.vue')
  },
  {
    path: '/about',
    component: () => import('./pages/AboutPage.vue')
  },
  {
    path: '/products',
    component: () => import('./pages/ProductsPage.vue')
  },
  {
    path: '/contact',
    component: () => import('./pages/ContactPage.vue')
  },
  {
    path: '/admin',
    // Faqat admin uchun - alohida chunk
    component: () => import(
      /* webpackChunkName: "admin" */
      './pages/AdminDashboard.vue'
    )
  }
];

// Initial bundle: 100KB
// Har bir sahifa alohida chunk: 50-100KB
```

### Vue 3 defineAsyncComponent

```vue
<script setup>
import { defineAsyncComponent, ref } from 'vue';

// Loading state bilan
const HeavyChart = defineAsyncComponent({
  loader: () => import('./components/HeavyChart.vue'),
  loadingComponent: () => import('./components/ChartSkeleton.vue'),
  errorComponent: () => import('./components/ChartError.vue'),
  delay: 200, // Loading ko'rsatishdan oldin kutish
  timeout: 10000, // 10 soniyadan keyin error
  onError(error, retry, fail, attempts) {
    if (error.message.includes('fetch') && attempts <= 3) {
      retry(); // Tarmoq xatosida qayta urinish
    } else {
      fail();
    }
  }
});

const showChart = ref(false);
</script>

<template>
  <button @click="showChart = true">Grafikni Ko'rsatish</button>
  <HeavyChart v-if="showChart" />
</template>
```

### Conditional Loading

```vue
<script setup>
import { defineAsyncComponent, computed } from 'vue';

const props = defineProps<{
  userRole: 'admin' | 'user' | 'guest';
}>();

// Role bo'yicha komponent
const DashboardComponent = computed(() => {
  const componentMap = {
    admin: () => import('./dashboards/AdminDashboard.vue'),
    user: () => import('./dashboards/UserDashboard.vue'),
    guest: () => import('./dashboards/GuestDashboard.vue')
  };

  return defineAsyncComponent(componentMap[props.userRole]);
});
</script>

<template>
  <Suspense>
    <component :is="DashboardComponent" />
    <template #fallback>
      <DashboardSkeleton />
    </template>
  </Suspense>
</template>
```

## Image Lazy Loading

### Native Lazy Loading

```html
<!-- Brauzer native lazy loading (Chrome 76+) -->
<img
  src="large-image.jpg"
  loading="lazy"
  alt="Description"
  width="800"
  height="600"
>

<!-- Above-the-fold uchun eager -->
<img
  src="hero-image.jpg"
  loading="eager"
  alt="Hero"
  fetchpriority="high"
>
```

### Intersection Observer bilan

```javascript
// Sekin: scroll event listener
// HAR scroll event'da ishlaydi - juda og'ir
window.addEventListener('scroll', () => {
  document.querySelectorAll('img[data-src]').forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      img.src = img.dataset.src;
    }
  });
});
```

```javascript
// Tez: Intersection Observer
class LazyImageLoader {
  constructor(options = {}) {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: options.root || null,
        rootMargin: options.rootMargin || '50px 0px', // 50px oldindan yuklash
        threshold: options.threshold || 0.01
      }
    );
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (srcset) {
      img.srcset = srcset;
    }

    img.src = src;
    img.classList.add('loaded');
  }

  observe(selector) {
    document.querySelectorAll(selector).forEach(img => {
      this.observer.observe(img);
    });
  }

  disconnect() {
    this.observer.disconnect();
  }
}

// Ishlatish
const lazyLoader = new LazyImageLoader({
  rootMargin: '100px 0px' // 100px oldindan yuklash
});

lazyLoader.observe('img[data-src]');
```

### Vue Composable

```javascript
// composables/useLazyImage.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useLazyImage(options = {}) {
  const imageRef = ref(null);
  const isLoaded = ref(false);
  const isInView = ref(false);
  let observer = null;

  onMounted(() => {
    if (!imageRef.value) return;

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isInView.value = true;
          observer.disconnect();
        }
      },
      {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0
      }
    );

    observer.observe(imageRef.value);
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  const onLoad = () => {
    isLoaded.value = true;
  };

  return {
    imageRef,
    isLoaded,
    isInView,
    onLoad
  };
}
```

```vue
<!-- LazyImage.vue -->
<script setup>
import { useLazyImage } from '@/composables/useLazyImage';

const props = defineProps<{
  src: string;
  alt: string;
  placeholder?: string;
}>();

const { imageRef, isLoaded, isInView, onLoad } = useLazyImage();
</script>

<template>
  <div ref="imageRef" class="lazy-image-container">
    <!-- Placeholder -->
    <img
      v-if="!isLoaded"
      :src="placeholder || '/placeholder.svg'"
      :alt="alt"
      class="placeholder"
    />

    <!-- Actual image -->
    <img
      v-if="isInView"
      :src="src"
      :alt="alt"
      class="main-image"
      :class="{ 'loaded': isLoaded }"
      @load="onLoad"
    />
  </div>
</template>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
}

.placeholder {
  filter: blur(10px);
  transform: scale(1.1);
}

.main-image {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.main-image.loaded {
  opacity: 1;
}
</style>
```

## Module Lazy Loading

### Dynamic Import

```javascript
// Sekin: static import - hammasi yuklashda
import { heavyCalculation } from './utils/heavy-math';
import { pdfGenerator } from './utils/pdf-generator';
import { excelExporter } from './utils/excel-exporter';

// Tez: dynamic import - kerak bo'lganda
async function exportToPdf(data) {
  const { pdfGenerator } = await import('./utils/pdf-generator');
  return pdfGenerator.generate(data);
}

async function exportToExcel(data) {
  const { excelExporter } = await import('./utils/excel-exporter');
  return excelExporter.export(data);
}

// Foydalanuvchi PDF tugmasini bosganida
button.addEventListener('click', async () => {
  showLoader();
  await exportToPdf(tableData);
  hideLoader();
});
```

### Conditional Module Loading

```javascript
// Feature flag asosida
async function loadAnalytics() {
  if (process.env.ENABLE_ANALYTICS) {
    const { initAnalytics } = await import('./analytics');
    initAnalytics();
  }
}

// Brauzer qo'llab-quvvatlash asosida
async function loadPolyfills() {
  const polyfills = [];

  if (!('IntersectionObserver' in window)) {
    polyfills.push(import('intersection-observer'));
  }

  if (!('fetch' in window)) {
    polyfills.push(import('whatwg-fetch'));
  }

  if (!('ResizeObserver' in window)) {
    polyfills.push(import('@juggle/resize-observer'));
  }

  await Promise.all(polyfills);
}

// App boshlashda
async function initApp() {
  await loadPolyfills();
  loadAnalytics();
  // ... app init
}
```

## Prefetching & Preloading

### Link Prefetch

```html
<!-- Keyingi sahifa uchun prefetch -->
<link rel="prefetch" href="/js/about-page.js">

<!-- Critical resurs uchun preload -->
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
<link rel="preload" href="/css/critical.css" as="style">
```

### Vue Router Prefetch

```javascript
// router/index.js
const routes = [
  {
    path: '/',
    component: () => import('./pages/Home.vue'),
    meta: { prefetch: ['about', 'products'] }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./pages/About.vue')
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('./pages/Products.vue')
  }
];

// Prefetch logic
router.beforeEach((to, from) => {
  const prefetchRoutes = to.meta?.prefetch || [];

  prefetchRoutes.forEach(routeName => {
    const route = router.resolve({ name: routeName });
    // Brauzer idle vaqtda yuklaydi
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route.href;
    document.head.appendChild(link);
  });
});
```

### Hover-based Prefetch

```vue
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const prefetchedRoutes = new Set();

function prefetchOnHover(routeName) {
  if (prefetchedRoutes.has(routeName)) return;

  // Komponentni oldindan yuklash
  const route = router.resolve({ name: routeName });
  const matchedRoute = route.matched[0];

  if (matchedRoute?.components?.default) {
    const component = matchedRoute.components.default;
    if (typeof component === 'function') {
      component(); // Lazy component'ni trigger qilish
      prefetchedRoutes.add(routeName);
    }
  }
}
</script>

<template>
  <nav>
    <router-link
      to="/products"
      @mouseenter="prefetchOnHover('products')"
    >
      Mahsulotlar
    </router-link>

    <router-link
      to="/about"
      @mouseenter="prefetchOnHover('about')"
    >
      Biz haqimizda
    </router-link>
  </nav>
</template>
```

## Real-World Case: E-commerce Dashboard

### Muammo

```
Initial Load: 12 soniya
Bundle Size: 2.5MB
FCP: 8 soniya
```

### Tahlil

```javascript
// Muammoli kod
import Chart from 'chart.js/auto';
import XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Editor } from '@tiptap/vue-3';
import DataTable from 'primevue/datatable';

// Hammasi initial bundle'da = 2.5MB
```

### Yechim

```javascript
// router/index.js
const routes = [
  {
    path: '/dashboard',
    component: () => import('./layouts/DashboardLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('./pages/DashboardHome.vue')
      },
      {
        path: 'analytics',
        component: () => import(
          /* webpackChunkName: "analytics" */
          './pages/Analytics.vue'
        )
      },
      {
        path: 'reports',
        component: () => import(
          /* webpackChunkName: "reports" */
          './pages/Reports.vue'
        )
      },
      {
        path: 'editor',
        component: () => import(
          /* webpackChunkName: "editor" */
          './pages/ContentEditor.vue'
        )
      }
    ]
  }
];
```

```vue
<!-- pages/Reports.vue -->
<script setup>
import { ref } from 'vue';

const exportFormat = ref(null);

// Heavy libraries - faqat kerak bo'lganda
async function exportReport(format) {
  exportFormat.value = format;

  if (format === 'excel') {
    const XLSX = await import('xlsx');
    // Excel export logic
    const worksheet = XLSX.utils.json_to_sheet(reportData.value);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, 'report.xlsx');
  }
  else if (format === 'pdf') {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    // PDF export logic
    doc.text('Report', 10, 10);
    doc.save('report.pdf');
  }

  exportFormat.value = null;
}
</script>

<template>
  <div class="reports-page">
    <div class="export-buttons">
      <button
        @click="exportReport('excel')"
        :disabled="exportFormat !== null"
      >
        <span v-if="exportFormat === 'excel'">Yuklanmoqda...</span>
        <span v-else>Excel Export</span>
      </button>

      <button
        @click="exportReport('pdf')"
        :disabled="exportFormat !== null"
      >
        <span v-if="exportFormat === 'pdf'">Yuklanmoqda...</span>
        <span v-else>PDF Export</span>
      </button>
    </div>
  </div>
</template>
```

### Natija

```
Initial Load: 2.5 soniya (12s dan)
Bundle Size: 450KB (2.5MB dan)
FCP: 1.8 soniya (8s dan)
```

## Performance Metrics

### Lazy Loading Ta'siri

```javascript
// Performance monitoring
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.entryType === 'resource') {
      console.log(`${entry.name}: ${entry.duration}ms`);
    }
  });
});

observer.observe({ entryTypes: ['resource'] });

// Lazy load timing
function trackLazyLoad(componentName) {
  const startTime = performance.now();

  return () => {
    const loadTime = performance.now() - startTime;

    // Analytics'ga yuborish
    analytics.track('lazy_load', {
      component: componentName,
      duration: loadTime
    });
  };
}

// Ishlatish
const loadProfile = trackLazyLoad('ProfilePage');
import('./pages/Profile.vue').then(loadProfile);
```

## Interview Savollari

### 1. Lazy loading va code splitting farqi nima?

**Javob:**
```
Lazy Loading - strategiya (QACHON yuklash)
Code Splitting - texnika (QANDAY bo'lish)

Lazy Loading:
- Runtime'da resursni kerak bo'lganda yuklash
- Foydalanuvchi harakati trigger
- dynamic import() orqali

Code Splitting:
- Build vaqtida bundle'ni chunk'larga bo'lish
- Webpack/Vite avtomatik yoki manual
- Lazy loading uchun poydevor

Misol:
// Code splitting - build vaqtida alohida fayl
const About = () => import('./About.vue');

// Lazy loading - runtime'da yuklash
<router-link to="/about">About</router-link>
// Foydalanuvchi bosganida About.vue yukladi
```

### 2. Intersection Observer va scroll event farqi?

**Javob:**
```javascript
// Scroll Event - XATO yondashuv
// HAR scroll'da ishlaydi - performance killer
window.addEventListener('scroll', () => {
  // Bu 60fps'da 16ms'da bir ishlaydi
  elements.forEach(el => {
    const rect = el.getBoundingClientRect(); // Reflow trigger
    // ...
  });
});

// Intersection Observer - TO'G'RI
// Brauzer optimize qiladi
// Faqat visibility o'zgarganda ishlaydi
// Main thread'ni bloklamaydi
const observer = new IntersectionObserver(callback, {
  rootMargin: '50px',
  threshold: 0.1
});

// Farqlar:
// 1. Performance: IO 10-100x tezroq
// 2. Accuracy: IO subpixel aniqlik
// 3. Battery: IO kamroq CPU
// 4. Throttling: Scroll - manual, IO - avtomatik
```

### 3. defineAsyncComponent vs Suspense qachon ishlatiladi?

**Javob:**
```vue
<!-- defineAsyncComponent - individual component -->
<script setup>
const HeavyChart = defineAsyncComponent({
  loader: () => import('./HeavyChart.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,
  timeout: 10000
});
</script>

<!-- Suspense - multiple async components -->
<template>
  <Suspense>
    <template #default>
      <!-- Bir nechta async component -->
      <AsyncHeader />
      <AsyncContent />
      <AsyncFooter />
    </template>
    <template #fallback>
      <PageSkeleton />
    </template>
  </Suspense>
</template>

<!-- Qachon nima:
defineAsyncComponent:
- Individual component loading state
- Granular error handling
- Timeout va retry logic

Suspense:
- Multiple async components
- Nested async operations
- Data fetching + component loading
- Waterfall prevention
-->
```

### 4. Prefetch, Preload, Preconnect farqi?

**Javob:**
```html
<!-- Preload - HOZIR kerak, HIGH priority -->
<!-- Critical path'da, render-blocking -->
<link rel="preload" href="/font.woff2" as="font" crossorigin>
<link rel="preload" href="/hero.jpg" as="image">
<link rel="preload" href="/critical.css" as="style">

<!-- Prefetch - KEYINCHALIK kerak, LOW priority -->
<!-- Idle vaqtda, cache'da saqlash -->
<link rel="prefetch" href="/page2.js">
<link rel="prefetch" href="/next-page-image.jpg">

<!-- Preconnect - Connection HOZIR, resource KEYINCHALIK -->
<!-- DNS + TCP + TLS handshake oldindan -->
<link rel="preconnect" href="https://api.example.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- DNS-prefetch - faqat DNS -->
<!-- Preconnect'dan yengil -->
<link rel="dns-prefetch" href="https://analytics.example.com">
```

### 5. Lazy loading'da loading state qanday boshqariladi?

**Javob:**
```vue
<script setup>
import { ref, defineAsyncComponent } from 'vue';

// 1. defineAsyncComponent built-in loading
const AsyncChart = defineAsyncComponent({
  loader: () => import('./Chart.vue'),
  loadingComponent: ChartSkeleton,
  delay: 200 // 200ms dan keyin loading ko'rsat
});

// 2. Manual loading state
const ChartComponent = ref(null);
const isLoading = ref(false);
const error = ref(null);

async function loadChart() {
  isLoading.value = true;
  error.value = null;

  try {
    const module = await import('./Chart.vue');
    ChartComponent.value = module.default;
  } catch (e) {
    error.value = e;
  } finally {
    isLoading.value = false;
  }
}

// 3. Suspense + async setup
// Child.vue
async function setup() {
  const data = await fetchData(); // Suspense kutadi
  return { data };
}
</script>

<template>
  <!-- Suspense pattern -->
  <Suspense>
    <AsyncChild />
    <template #fallback>
      <LoadingState />
    </template>
  </Suspense>
</template>
```

## Xulosa

Lazy loading samarali qo'llash uchun:

1. **Route-based splitting** - har sahifa alohida chunk
2. **Component-based** - og'ir komponentlar lazy
3. **Library lazy loading** - faqat kerak bo'lganda import
4. **Image lazy loading** - viewport tashqarisida
5. **Prefetch** - kutilgan navigatsiya uchun

```javascript
// Golden Rule
// Above-the-fold: EAGER
// Below-the-fold: LAZY
// Next page: PREFETCH
// Heavy libs: DYNAMIC IMPORT
```
