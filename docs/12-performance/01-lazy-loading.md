# Lazy Loading

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Tasavvur qiling loyihangiz 5MB js koddan iborat (Katta e-commerce). Agar foydalanuvchi saytga birinchi bor kirsayu siz bu 5MB lik kodni hammasini yuklashga urinsangiz saytingiz 10 soniyada ochiladi (Bounce rate > 90%). Foydalanuvchi "Biz haqimizda" sahifasini hech qachon ochmasligi mumkin, nima uchun o'sha sahifaning kodini boshidan yuklaysiz? **Lazy Loading** aynan shunga qarshi: *Narsa faqat so'ralgandagina yuklanishi kerak.*

> [!NOTE]
> **Real-hayot analogiyasi: "Restoranda Menyuni O'qish"**  
> - **Eager Loading (Yomon):** Siz restoranga kirdingiz. Ofitsiant kelib menyudagi hamma 100 ta ovqatni hammasini pishirib stolingizga olib keldi, toki siz tanlab olinguningizcha stolda joy qolmadi. Odam qochib ketadi!
> - **Lazy Loading (Yaxshi):** Siz restoranga kirdingiz. Ofitsiant menyuni (HTML/CSS) beradi. Siz "Shashlik" desa, keyingina u oshxonaga borib, faqat shashlik pishirib olib keladi (Dynamic Import). Eng zo'ri ham shu emasmi?

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchilar ko'pincha `import` qilishni eng oddiy usulida yozishadi. Bu kichik loyihalar uchun zararsiz bo'lishi mumkin, biroq loyiha kattalashgani sari u og'irlasha boshlaydi. Biz Vue Router'da barcha sahifalarni shunday statik tarzda import qilsak (Eager Loading), brauzer saytni ochishdan oldin **hamma sahifalarni** yuklab olishi shart bo'lib qoladi.

### Oddiy Import (Sekin)
```javascript
// YOMON USUL: Saytga kirish bilan 5 ta katta sahifa yuklanib olinadi
import HomePage from './pages/HomePage.vue';
import AboutPage from './pages/AboutPage.vue';
import AdminDashboard from './pages/AdminDashboard.vue'; // Oddiy userga bu kerak emasdi!

const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/admin', component: AdminDashboard }
];
```

### Lazy Import (Tez)
Biz shunchaki tepadan statik olib tashlab, kerakli joyda o'ziga funktsiya yozib beramiz: `() => import(...)`.
```javascript
// YAXSHI USUL: Foydalanuvchi qaysi silkani bossa, O'SHA payt yuklanadi
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
    path: '/admin',
    component: () => import('./pages/AdminDashboard.vue')
  }
];
```

<TryIt type="vue" href="https://stackblitz.com/edit/vue-router-lazy-loading?file=src/router/index.js" label="Vue Router Lazy Loading" />

Bunga **Route-based Lazy Loading** deyiladi. Bu sizni boshlang'ich yuklanish balosidan (initial load delay) 80% qutqaradi.

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi Vue komponentlarini va uchinchi tomon (third-party) kutubxonalarini ham faqatgina so'ralganida olib kelish (Component Lazy Loading va Module Lazy Loading) qoidalarini hamda Rasmlarni tejamkor qilishni biladi.

### 1. Component Lazy Loading (Vue 3 `defineAsyncComponent`)
Agar sizda bir sahifaning ichida yuzlab qatorli "Katta Grafika" (HeavyChart) komponenti bo'lsa-yu, uni foydalanuvchi faqat "Grafikni ko'rish" tugmasini bosgandagina chiqarishingiz kerak bo'lsa nima qilasiz?

```vue
<script setup>
import { defineAsyncComponent, ref } from 'vue';

// HeavyChart kodlari faqat ushbu o'zgaruvchi chaqirilganda yuklanadi
const HeavyChart = defineAsyncComponent(() => import('./components/HeavyChart.vue'));

const showChart = ref(false);
</script>

<template>
  <button @click="showChart = true">Grafikni Ko'rsatish</button>

  <!-- "showChart" true bo'lgandagina js fayl yuklanishni boshlaydi -->
  <HeavyChart v-if="showChart" />
</template>
```

<TryIt type="vue" href="https://stackblitz.com/edit/vue-define-async-component?file=src/App.vue" label="defineAsyncComponent sinab ko'ring" />

### 2. Module Lazy Loading (Dynamic Import)
Kutubxonalar juda og'ir. Masalan Excel generate qiluvchi kutubxona saytingizni "o'ldirishi" mumkin. Shuning uchun kutubxonalarni ham `async/await` qilib ichkarida tortamiz.

```javascript
async function exportToExcel(data) {
  // Faqat tugma bosilganda o'sha og'ir xlsx kutubxonasi tarmoqdan yuklanadi
  const XLSX = await import('xlsx');

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, 'report.xlsx');
}
```

<TryIt href="https://stackblitz.com/edit/js-dynamic-import-xlsx?file=index.js" label="Dynamic Import sinab ko'ring" />

### 3. Image Lazy Loading
Juda ko'p rasmlar bor ro'yxatda barcha rasmlar pastda bo'lsa ham birga yuklanaveradi. HTML ning o'zi buning oson yechimini bergan:

```html
<!-- loading="lazy" attributini qo'shsangiz kifoya -->
<img
  src="katta-rasm.jpg"
  loading="lazy"
  alt="Tavsif"
  width="800"
  height="600"
>
```
*Diqqat: Eni va bo'yi (`width`, `height`) ko'rsatilishi shart, aks holda sahifa sakrashlari (Layout Shift) yuz beradi.*

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi **Intersection Observer API** ni nozik biladi, **Prefetching/Preloading** o'rtasidagi farqni tushunib strategiya tuzadi. U loading (Suspense) va tarmoq uzilishlari holatlarini chiroyli ishlashga javobgar.

### Intersection Observer (Rasmlar yoki Skroll elementlar uchun API)
`scroll` hodisasini (event) ishlatish har bir skrollda kodni ming marta yurgizadi va animatsiyalarni yomonlashtiradi. Seniorlar o'rniga *Intersection Observer API* ishlatishadi. Bu brauzerning o'ziga xos mexanizmi bo'lib, elementning ekranda paydo bo'lganini 0 (hech qancha) CPU sarflab aniqlab beradi.

```javascript
// Tez: Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // Agar element ekran hududiga kirib kelsa (50px oldindan)
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src; // Yuklashni boshlash
      observer.unobserve(img);   // Keyin uni kuzatishni to'xtatamiz
    }
  });
}, { rootMargin: '50px 0px' }); // Ekranga chiqishiga 50px qolganda

// Domdagi barcha rasmlarni observerga beryapmiz
document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
```

<TryIt href="https://stackblitz.com/edit/js-intersection-observer-lazy?file=index.js" label="Intersection Observer sinab ko'ring" />

### Preloading vs Prefetching
Lazy load'ning muammosi bor: siz u faylni faqat click qilganingizda, keyin serverdan ola boshlaydi va yana 2 soniya o'ylab (Loading bo'lib) qoladi. Eager qilsangiz sayt tezligi yomonlashgan edi. *Oltin oraliq nima?*
- **Preload (Hozir kerak):** Asosiy CSS va Fontlar kabi birinchi sekunddayoq zarur bo'lgan resurslarni eng tez navbatda chaqirish.
- **Prefetch (Sal turib kerak):** Foydalanuvchi asosiy saytni to'liq yuklab (100% idle) bo'lganidan so'nggina, uni About page ga (click qilmay turib) bosishi mumkin degan gumonda orqa fonda AboutJS ni yuklash!

```html
<!-- Asosiy Font hech qachon kech qolmasin (Preload) -->
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>

<!-- Katta ehtimol bilan user o'tadigan 2-sahifaning kodlarini sekin yuklab qo'yish (Prefetch) -->
<link rel="prefetch" href="/js/about-page.js">
```

### Intervyu Savoli
**"defineAsyncComponent va Suspense o'rtasidagi munosabatni qanday tushuntirasiz? Tarmoq xatolari (Network Error) da qayta urinish (Retry logic) qanday yoziladi?"**
*Javob:*
`defineAsyncComponent` bitta ma'lum Vue komponentini asinxron tarzda yuklaydi, unda bevosita Error va Loading holatlarini tutib (fallback sifatida) nima chiqarishini sozlash mumkin. Lekin bizda 3 ta asinxron komponent bitta oyna (Parent) ichida bo'lsa va uchalasi ham 3 xil vaqtda kelsa, oyna sakrab ketishi (Waterfall) kuzatiladi. Shunday vaziyatlarda ular bitta qilib qavsab (Wrap), bitta katta `<Suspense>` ga olinadi. Suspense to ichkaridagi barcha 3 ta asinxron ish yakunlanmaguncha o'zining `<template #fallback>` dagi (masalan, Skeleton) qismini ko'rsatib turadi, so'ngra birato'la chizib beradi (UX jihatdan yutuq). Tarmoq xatolarini ushlash esa defineAsyncComponent ichidagi `onError(error, retry, fail, attempts)` qatorida `attempts <= 3` orqali mantiqiy hal etiladi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Above-the-fold EAGER, Below-the-fold LAZY:** Ekranning siz srazu (bosh sahifaga kirishingiz bilan) ko'radigan qismidagi narsalarni aslo lazy load qilmang (Banner, Header, Hero rasm). Chunki u LCP (Largest Contentful Paint) ni tushirib yuboradi. Barcha Lazy-loading mantiqlari sahifaning *pastki, ko'rinmaydigan* qismida bo'lishi shart.
2. **Qo'pol Loading UI:** Lazy loading'ning yomon tomoni shundaki, user tugma bosganda UI ozgina qotib keyin chiqadi. O'sha paytda hech bo'lmasa qandaydir Spinner, Skeleton kabi fallbacks ko'rsatishni unutmang.
3. **Route level is a must:** Vue Router'da istisnosiz hamma Route'lar lazy-loaded bo'lishi shart! Hech qachon sahifani yuqorida statik `import` qilmang.

---

## Xulosa

Lazy loading ni samarali qo'llash ssenariylari:

| Turi | Qachon ishlatsa bo'ladi? | Qanday ishlaydi | Foydasi |
|------|--------------------------|-----------------|---------|
| **Route Lazy Loading** | Barcha yirik SPA sahifalarida (Majburiy) | `() => import('page.vue')` | Initial bundle size ni tubdan kamaytiradi |
| **Component Lazy Loading**| Kam ishlatiladigan katta UI (Charts, Modals)| `defineAsyncComponent` | Xotirani faqat kerak bo'lganda sarflaydi |
| **Library Dynamic Import**| PDF, Excel export kabi og'ir kutubxonalar | `await import('xlsx')` | Main thread'ni keraksiz JavaScript'dan asraydi|
| **Image Lazy Loading** | Ekrandan tashqaridagi hamma rasmlar uchun | `loading="lazy"` yoki `IntersectionObserver` | Trafik (bandwidth) ni asraydi va tez ochadi |

**Oltin Qoida:** *Above-the-fold: EAGER. Below-the-fold: LAZY. Kutilayotgan navigatsiya: PREFETCH. Heavy libs: DYNAMIC IMPORT.*

**Keyingi qadam:** [Code Splitting](./02-code-splitting.md) - Build vaqtida kodni bo'laklarga qanday bo'lamiz?
