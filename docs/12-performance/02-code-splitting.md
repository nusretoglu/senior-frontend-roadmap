# Code Splitting

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Foydalanuvchi sizning saytingizga kirganda barcha kodlar jamlangan bitta ulkan JS faylni (bundle.js) tortib olsa, bu sayt qotishiga olib keladi. Code Splitting "Hamma narsani bitta sumkaga tiqmasdan, faqat kerakli qismlarini alohida jildlarga solish" degani. 500KB o'rniga faqat joriy sahifaga kerakli 50KB kod yuklanadi. Qolgani - foydalanuvchi boshqa sahifaga o'tgandagina (Lazy Loading bilan birga) yuklanadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Pitseriya va Retseptlar Kitobi"**  
> - **Monolitik Bundle (Yomon):** Pitseriyaga ishga kirdingiz. Sizga dunyodagi hamma ovqatlar (Pitsa, Palov, Sushi) retsepti bor 10 ming sahifali kitobni qo'lingizga berishdi. Uni ko'tarib yurish og'ir, o'qishga vaqt ketadi, vaholanki siz faqat Pitsa tayyorlaysiz.
> - **Code Splitting (Yaxshi):** Sizga faqatgina Pitsa bo'limi yirtib olingan 10 varaqli kitobcha berishdi. Vaqti kelib sizga Sushi buyurtma qilishsagina, Sushi retsepti yozilgan qo'shimcha varaqni olib kelasiz.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchilar "Code Splitting" faqatgina Build (yig'ish) jarayoniga taalluqli qiyin narsa deb qo'rqishadi. Aslida bu juda oddiy: Vue/React kabi freymvorklar va bundlerlar (Webpack/Vite) buning qanday qilinishini siz uchun osonlashtirgan.

### Route-Based Splitting (Sahifa bo'yicha ajratish)
Biz barcha sahifalarni statik import qilsak bitta katta kod hosil bo'ladi. Ularni asinxron (`() => import(...)`) qilib yozsak, Vite/Webpack har bir sahifani **alohida JavaScript fayl** (chunk) qilib kesib beradi.

```javascript
// Vite bularning har birini alohida faylga ajratadi: 
// masalan: index-4f3b2.js, about-7g2c1.js
const routes = [
  {
    path: '/',
    component: () => import('./pages/Home.vue') 
  },
  {
    path: '/about',
    component: () => import('./pages/About.vue')
  },
  {
    path: '/dashboard',
    // Chunklarga aniq ism berish (Magic Comments - Webpack uchun)
    component: () => import(/* webpackChunkName: "admin-dashboard" */ './pages/Dashboard.vue')
  }
];
```
Natijada loyihangiz boshlang'ich yuklanganda bitta 2MB fayl emas, Asosiy qism (150KB) va joriy sahifa (masalan Home 30KB) yuklanadi.

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchilar NPM kutubxonalarni (node_modules) qanday bo'lishni (`Vendor Splitting`) bilishi va Code Splittingning nozik tomonlarini sozlashi kutiladi.

### Vendor Splitting nima?
`node_modules` ichidagi fayllar o'zimiz yozgan kodlarga nisbatan juda kam o'zgaradi. Masalan Vue, Vue-Router, Axios yillab bir xil versiyada turishi mumkin. Shuning uchun ularni o'zimizning `app.js` ga qo'shib yubormasdan, alohida `vendor.js` ga bo'lishimiz kerak. Shunda foydalanuvchi ularni 1-marta yuklab keshga (Cache) oladi, keyin saytimizga 100 marta kirganda ham o'sha eskisi ishlayveradi (tez ochiladi).

### Vite Konfiguratsiyasi (RollupOptions)
Vite da "manualChunks" orqali nimani qaysi faylga "tiqish"ni aytishimiz mumkin:

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Eng asosiylari alohida "vendor-core.js" faylga tushadi
          'vendor-core': ['vue', 'vue-router', 'pinia'],

          // UI komponentlar va ikonlar "vendor-ui.js" faylga tushadi
          'vendor-ui': ['@headlessui/vue', '@heroicons/vue'],

          // Grafika kutubxonasi faqat kerak paytda yuklanadi
          'vendor-charts': ['chart.js', 'vue-chartjs']
        }
      }
    }
  }
});
```
Ushbu bo'linish orqali bitta katta `vendor.js` o'rniga, foydalanuvchi faqat kerakli qismlarni (va ularni HTTP/2 orqali parallel ravishda) yuklaydi.

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi **Bundle Analyzer** vositalaridan foydalanib muammolarni topadi, va qachon Code Splitting zarar qilib qo'yishini (Haddan tashqari ko'p kesishni) biladi.

### Visualizer va Tahlil
Loyiha nega sekin ishlayotganini bilish uchun `rollup-plugin-visualizer` ishlatiladi. U sizga qaysi kutubxona qancha joy egallayotganini chiroyli diagramma (xarita) ko'rinishida beradi.

```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true, // Build qilganda brauzerda ochadi
      gzipSize: true // Siqilgandan keyingi asl og'irligi
    })
  ]
});
```

### Haddan tashqari Splitting (Over-splitting muammosi)
Ko'p dasturchilar hamma narsani asinxron import (`()=>import()`) qilib qo'yishadi (hatto 1-2 KB lik tugmalarni ham). Bu yomon amaliyot. 
Nima uchun? Chunk (fayl) hajmi juda kichkina bo'lib, ular soni 200-300 taga yetib borsa, brauzer HTTP request yuborishga (DNS, TCP, TLS handshake) vaqt yo'qotadi va sayt baribir sekinlashadi.
*Optimal yechim:* Bitta chunk (bo'lingan fayl) 30KB - 100KB atrofida (gzip qilinganda) bo'lishi eng yaxshi balans hisoblanadi.

### Intervyu Savoli
**"Nima uchun biz `node_modules` ni `vendor` chunk'larga ajratamiz? Va HTTP/2 buni qanday qilib yanada yaxshilaydi?"**
*Javob:*
`node_modules` ichidagi fayllar (kutubxonalar) deyarli o'zgarmaydi, leki biz yozadigan biznes-logika fayllari har kuni yangilanadi. Ularni ajratish brauzer keshlanishidan unumli foydalanish (Long-term caching) degani.  
HTTP/2 bilan esa, biz fayllarni yanada maydaroq chunk larga ajratish imkoniga egamiz. HTTP/1.1 bitta domen orqali parallel faqat 6 tagacha fayl yuklay olar edi (Bottleneck). HTTP/2 dagi "Multiplexing" orqali bitta ulanish ustidan 100+ parallel request tashlash mumkin. Shuning uchun Vite/Rollup kichik va ko'p sonli chunklar bilan ham mukammal ishlay oladi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Vite da manualChunks:** Barcha NPM kutubxonalaringizni (Vue, Router, Pinia) bitta `vendor` chunk ga, e-commerce qismlari (Stripe, Axios) ni `ecommerce` chunk ga bo'lishni unutmang. Aks holda Vite/Webpack barini aralashtirib yuborishi mumkin.
2. **Qancha Kichik, Shuncha Yaxshi... emasmikan?:** Juda ko'p kichik fayllarga (masalan, har bir fayl 1-2KB) ajratib yubormang. Brauzer yuzlab fayllarni yuklash o'rniga, bitta 50KB faylni yuklagani afzal. Optimal chunk hajmi 30KB - 100KB atrofida bo'lishi tavsiya etiladi.
3. **Kutubxonalarni Code Splitting qilish:** Og'ir kutubxonalarni (masalan ECharts, Moment.js, xlsx) hamma joyda global import qilmang. Ularni faqatgina shu kutubxona kerak bo'ladigan komponentlardagina `await import()` qilib (Dynamic Import) ishlating.

---

## Xulosa

Code splittingni samarali qo'llash ssenariylari:

| Splitting Turi | Nima u? | Maqsad |
|----------------|---------|--------|
| **Route-level** | Sahifalar bo'yicha (`/about` alohida fayl) | Initial load ni kamaytirish |
| **Component-level** | Og'ir komponentlar bo'yicha | Xotirani asrash va render tezligi |
| **Vendor (Library)**| `node_modules` bo'yicha | Brauzer caching va yangilanishni optimallash |

```text
# Optimal tuzilma namunasi:
├── vendor-vue.js (80KB) - Asosiy framework, doim keshlangan
├── main-app.js (50KB) - O'zimizning global mantiq
├── chunk-home.js (20KB) - Bosh sahifa uchungina
└── chunk-dashboard.js (45KB) - Admin bosgandagina tortib kelinadi
```
