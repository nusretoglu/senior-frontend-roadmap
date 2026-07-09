# Performance Optimization

Frontend ilovalar uchun performance optimallashtirish - bu foydalanuvchi tajribasini yaxshilash va biznes maqsadlariga erishishning eng muhim qismlaridan biri.

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Foydalanuvchilar soniyalar o'tgan sari sabrsizlanib borishadi. Amazon kompaniyasi tadqiqotlariga ko'ra, saytning yuklanishi atigi 100 millisoniyaga sekinlashishi ularga 1% savdoni yo'qotishga olib keladi. Qolaversa, Google sekin saytlarni qidiruv natijalarida ancha pastga tushirib yuboradi (SEO). Shuning uchun, chiroyli kod yozish o'z yo'liga, tez ishlaydigan kod yozish esa sizni haqiqiy "Senior" darajaga olib chiqadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Poyga avtomobili"**  
> - **Optimizatsiyasiz (Yomon):** Poyga mashinasining yukxonasiga og'ir toshlar, g'ishtlar va keraksiz asbob-uskunalarni tashlab olgansiz. Motori (Algoritm) qanchalik kuchli bo'lmasin, mashina sekin yuradi.
> - **Optimizatsiya qilingan (Yaxshi):** Mashina karbonat angidriddan ishlangan (eng yengil qismlar - Code Splitting, Compression), orqa o'rindiqlari umuman yo'q (Dead Code Elimination). Mashina qushdek uchadi.

## Nega Performance Muhim?

### Biznes Ta'siri

| Kechikish | Biznesga Ta'siri |
| --- | --- |
| **+1 soniya** yuklanish vaqti | Konversiya -7% gacha pasayadi |
| **+3 soniya** kutish | Mijozlarning 53% saytdan chiqib ketadi (Bounce Rate) |

### Google Core Web Vitals (Hayotiy Ko'rsatkichlar)

| Metrika | Qisqartma | Yaxshi | Yomon | Ma'nosi |
|---------|--------|-------|--------|--------|
| **Largest Contentful Paint** | LCP | < 2.5s | > 4s | Asosiy kontent qachon ko'rindi? |
| **First Input Delay** | FID | < 100ms | > 300ms | Birinchi reaksiyaga qancha vaqt ketdi? |
| **Cumulative Layout Shift** | CLS | < 0.1 | > 0.25 | Sayt kutilmaganda "sakrab" ketdimi? |
| **Interaction to Next Paint** | INP | < 200ms | > 500ms | Tugma bosilganda darhol ishladimi? |

## Bo'lim Tarkibi

| # | Mavzu | Tavsif | Muhimlik |
|---|-------|--------|----------|
| 01 | [Lazy Loading](./01-lazy-loading.md) | Komponent, rasm va resurslarni kerak paytda yuklash | Critical |
| 02 | [Code Splitting](./02-code-splitting.md) | Bundle'ni mantiqiy qismlarga bo'lish | Critical |
| 03 | [Image Optimization](./03-image-optimization.md) | Rasm formatlari, sizing, lazy loading | Very Important |
| 04 | [Virtual Scrolling](./04-virtual-scrolling.md) | Katta ro'yxatlarni samarali render qilish | Important |
| 05 | [Bundle Optimization](./05-bundle-optimization.md) | Tree shaking, dead code elimination | Critical |
| 06 | [Vite vs Webpack](./06-vite-webpack.md) | Build tool'lar va ularning konfiguratsiyasi | Important |
| 07 | [Profiling Tools](./07-profiling-tools.md) | Chrome DevTools, Lighthouse, Performance API | Must Have |

## Performance Mindset

### 1. O'lchash Birinchi

```javascript
// XATO: "Sekin bo'lishi kerak" deb o'ylash
function slowFunction() {
  // optimizatsiya...
}

// TO'G'RI: Avval o'lchash
performance.mark('start');
slowFunction();
performance.mark('end');
performance.measure('slowFunction', 'start', 'end');
```

### 2. Bottleneck (To'siqlar) ni Topish

Dastur tezligini oshirish zanjiri va uning yechimlari:

```mermaid
flowchart LR
    A[Network <br/> (Tarmoq)] --> B[Parsing <br/> (O'qish)]
    B --> C[Scripting <br/> (Bajarish)]
    C --> D[Rendering <br/> (Joylashtirish)]
    D --> E[Painting <br/> (Chizish)]
    
    A1((CDN, Compression)) -. Yechim .-> A
    B1((Minify, Tree Shaking)) -. Yechim .-> B
    C1((Code Splitting, Lazy Load)) -. Yechim .-> C
    D1((Virtual DOM, Virtual Scroll)) -. Yechim .-> D
    E1((GPU Layers, CSS Opt)) -. Yechim .-> E
```

### 3. Progressive Enhancement

```javascript
// Asosiy funksionallik birinchi
const basicFeature = () => {
  // har doim ishlaydi
};

// Qo'shimcha - faqat imkon bo'lsa
if ('IntersectionObserver' in window) {
  // advanced lazy loading
}
```

## Performance Budget

### JavaScript Budget

```javascript
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/js/*.js",
      "maxSize": "170 kB",
      "compression": "gzip"
    }
  ]
}
```

### Recommended Limits

| Resurs | Budget (gzip) |
|--------|---------------|
| Total JS | < 170 KB |
| Per route JS | < 50 KB |
| Total CSS | < 50 KB |
| Hero image | < 100 KB |
| Total page | < 500 KB |

## Quick Wins

### 1. Build Time

```javascript
// vite.config.js
export default {
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          utils: ['lodash-es', 'date-fns']
        }
      }
    }
  }
}
```

### 2. Runtime

```javascript
// Debounce expensive operations
import { useDebounceFn } from '@vueuse/core';

const search = useDebounceFn((query) => {
  // API call
}, 300);

// Virtualize long lists
import { useVirtualList } from '@vueuse/core';

const { list, containerProps, wrapperProps } = useVirtualList(items, {
  itemHeight: 50
});
```

### 3. Network

```html
<!-- Preload critical resources -->
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://analytics.example.com">
```

## Monitoring

### Real User Monitoring (RUM)

```javascript
// web-vitals kutubxonasi
import { onLCP, onFID, onCLS, onINP } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    navigationType: metric.navigationType
  });

  // Beacon API - sahifa yopilganda ham yuboriladi
  navigator.sendBeacon('/analytics', body);
}

onLCP(sendToAnalytics);
onFID(sendToAnalytics);
onCLS(sendToAnalytics);
onINP(sendToAnalytics);
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Premature optimization (O'z vaqtidan oldin optimallashtirish) qilmang:** "Barcha yomonliklarning ildizi - hali xato kuzatilmagan va sekin ishlamayotgan kodni tezlaturaman deb murakkablashtirishdir". Faqatgina `Performance Profiler` (Tahlil vositasi) sizga qaysi kod sekin ekanligini ko'rsatsagina o'sha joyni optimizatsiya qiling.
2. **Kodni bo'lib tashlang (Code Splitting va Lazy Loading):** 5MB JS faylni bir urinishda yuklagandan ko'ra, 500KB lik 10 ta faylga bo'lish va faqat kerak bo'lgan sahifalarga keraklisini yuklash - eng yaxshi strategiya.
3. **Rasmlar - Eng katta dushman va do'st:** Ko'pincha saytning 70% og'irligini rasmlar egallaydi. Barcha rasmlarni `.webp` yoki `.avif` formatga o'tkazing va hammasiga `loading="lazy"` atributini qo'shib chiqing. Faqat birinchi ko'rinadigan qismdagi (Hero) rasm bundan mustasno.

---

## O'rganish Tartibi

Siz bu qismda quyidagi tartibda darslarni ko'rib chiqasiz:

1. **Profiling Tools** - avval o'lchashni o'rganing
2. **Bundle Optimization** - build vaqtida optimallashtirish
3. **Code Splitting** - bundle'ni bo'lish strategiyalari
4. **Lazy Loading** - on-demand yuklash
5. **Image Optimization** - eng katta ta'sir
6. **Virtual Scrolling** - katta ma'lumotlar
7. **Build Tools** - Vite/Webpack chuqur

## Interview Uchun Muhim Mavzular

- Core Web Vitals nima va qanday o'lchanadi?
- Tree shaking qanday ishlaydi?
- Code splitting strategiyalari
- Memory leak qanday topiladi?
- Critical rendering path
- HTTP/2 va performance
- Service Worker caching

---

> **Qoida:** Premature optimization - barcha yomonliklarning ildizi. Avval o'lcha, keyin optimallash.
