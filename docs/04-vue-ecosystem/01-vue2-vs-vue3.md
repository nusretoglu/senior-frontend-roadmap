# Vue 2 vs Vue 3 - Fundamental Farqlar

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Bugungi kunda ham ko'plab eskirgan (legacy) proyektlar Vue 2 da ishlayapti va ularni Vue 3 ga ko'chirish talab qilinmoqda. Vue 2 va Vue 3 qanday farq qilishini (ayniqsa Reactivity tizimi va Composition API qanday ustunliklar berishini) bilish sizni intervyularda qutqaradi va eski proyektlar bilan muammosiz ishlashga tayyorlaydi.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Vue 2 (Options API)** — ma'lumotlar, funksiyalar va kuzatuvchilarni maxsus bloklarga (`data`, `methods`, `computed`) bo'lib yozadigan klassik uslub.
**Vue 3 (Composition API)** — xuddi oddiy JavaScript kabi, kerakli funksiyalarni chaqirib olib (`ref`, `computed`), bir xil mantiqqa ega bo'lgan kodlarni bitta joyga yig'ib yozish imkonini beruvchi zamonaviy uslub.

> [!NOTE]
> **Hayotiy o'xshatish: "Kuzatuvchi Kameralar"**  
> **Vue 2 (`Object.defineProperty`):** Uyingizga har bir xona uchun alohida kuzatuv kamerasi qo'ydingiz. Lekin siz uyni qurgach, hovliga yangi garaj qo'shsangiz (ob'ektga yangi propery qo'shish), unga oldindan kamera o'rnatilmagani uchun ekraningizda u ko'rinmaydi. Siz uni ro'yxatga kiritish uchun maxsus usta chaqirishingiz kerak (`this.$set`).
> **Vue 3 (`Proxy`):** Siz butun boshli "Aqlli Uy" tizimini sotib oldingiz. Uyga nima qo'shmang (yangi garaj, basseyn - ob'ektning yangi xossalari) yoki uyni qayta qurmang (Array indexlar), tizim markaziy darvoza (`Proxy`) orqali hamma narsani ko'ra oladi va avtomatik nazorat qiladi.

### Fragment Support (Bir nechta ona element)
Vue 2 da har bir komponent faqat bitta `<div>` (ona element) ichiga o'ralgan bo'lishi shart edi. Vue 3 da esa xohlagancha elementni ketma-ket qo'yaverishingiz mumkin (Fragment).

```vue
<!-- Vue 2 (Xato beradi, ota div kerak) -->
<template>
  <h1>Sarlavha</h1>
  <p>Matn</p>
</template>

<!-- Vue 3 (To'g'ri ishlaydi) -->
<template>
  <h1>Sarlavha</h1>
  <p>Matn</p>
</template>
```

<TryIt type="vue" href="https://play.vuejs.org/#eNp9kE1qwzAQha9iZhUHnLhZBkqhhS66aNddyJKcTGJJSCO3IfgGPURP0oN0Jv5J0kCX8+Z9M8OrYOO0g4rZ4MjZoKMwkUGIHcJOhAxxhEowkbqxqLo2KKZUiuAA3osYcYIy4cF6sJZh1mQcZskj+kR+N5Y47KAk1DElkCTvuNFpQDJLGrj/zM8PxwQrnBKnTK7dP+n1j7/pA8m+Q7DfWUO2TqmINqF9OHMVrNmLH6fYq/QNu9VVCm95xWXRFf+/uI8fhEv3bXqwobT8T9+P0g==" label="Vue 3 Fragmentni sinab ko'ring" />

---

## 🟡 Middle (Amaliyot va Detallar)

### Composition API vs Options API
Options API kichik komponentlar uchun ajoyib, lekin kod ko'payganda u o'qib bo'lmas darajaga keladi. Bitta qidiruv (Search) qutisiga tegishli kodlarning yarmi fayl boshida (`data`), qolgan yarmi fayl oxirida (`methods`) bo'lib qoladi.

Vue 3 dagi Composition API yordamida har bir funksiyani alohida faylga chiqarish mumkin (Composables).

```vue
<!-- Vue 3: Script Setup (Zamonaviy yondashuv) -->
<script setup>
import { ref, computed } from 'vue'

const sanagich = ref(0) // Data

const ikkigaKopaytir = computed(() => sanagich.value * 2) // Computed

function oshirish() { // Method
  sanagich.value++
}
</script>
```

<TryIt type="vue" href="https://play.vuejs.org/#eNp9UU1rwzAM/SvCl7aQpIdeDKVs0MMO2253xYmdOHVs40+6EPLfJztpug52svT09PT0tGJX59xsCQk2Ny4oyXWCMFWOiFIVGFOsEaVKqjhEoZRNEHWg7LzCKWkYkwVnTMJWBJ0h5xYJvCIR7J0xJG4xBzhk4WBE+G7JCQpNKOgFIdPfIIVb6t3MzPVHXrz4Tpnrfx4LDLNA/D7EyC5Cp0Loy8C/L9GRa7e+QIqL1wZrBdpAxWG3QoYBm45jcLKedNQ7Tb4g0N54VDkCpK8qfI/oJqaL0JqbVoTm8T4C5mY=" label="Composition API sinab ko'ring" />

### Ko'p uchraydigan xatolar va muammolar (Pitfalls)
**Lifecycle (Hayot sikli) hook larning o'zgarishi**
Vue 2 dagi `beforeDestroy` va `destroyed` hook lari Vue 3 da `beforeUnmount` va `unmounted` ga o'zgartirildi. Agar siz eski nomlarni yozsangiz ular Vue 3 da umuman ishlamaydi va xotirada (memory leak) muammolar kelib chiqadi.

## Eng Yaxshi Amaliyotlar (Best Practices)
- **Yangi loyihada faqat Vue 3 + Composition API ishlating:** Hozirgi kunda Vue 2 yoki Options API da yangi proyekt boshlash tavsiya etilmaydi. Composition API Typescript bilan ajoyib tarzda birga ishlaydi.
- **`v-model` o'zgarishi:** Vue 3 da bitta komponentga bir nechta `v-model` ishlatish mumkin bo'ldi (`v-model:title`, `v-model:content`). `.sync` modifieri olib tashlandi.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### "Under the hood" (Qopqoq ostida nimalar ro'y beradi)
Vue 3 shunchaki sintaksis yangilanishi emas, uning ichki Compiler va Virtual DOM qismlari butunlay qayta yozildi.
Vue 3 Compiler **"Static Hoisting"** qila oladi. Ya'ni sahnada umuman o'zgarmaydigan (dinamik datsiz) matn va teglarni topib, ularni Virtual DOM yasalishidan tashqariga olib chiqib qo'yadi (`_hoisted_1`). State o'zgarganda faqat o'zgargan nuqtalarnigina patch qiladi (yangilaydi). Bu tezlikni bir necha barobarga oshiradi va React dan asosiy farqli yutug'iga aylandi.

### Reaktivlik Tizimi Arxitekturasi
Vue 2 `Object.defineProperty` ga tayanardi. U har bir mavjud propertini kuzatib yurishi (getter/setter o'rnatishi) kerak edi va Array larning ba'zi amallarini tushunmasdi (`arr[0] = 5`).
Vue 3 ES6 dagi `Proxy` ga tayanadi. Proxy ob'ektning O'ZINI to'liq nazorat ostiga oladi. Yangi property qo'shasizmi, Array elementini o'zgartirasizmi — farqi yo'q. Bundan tashqari Proxy faqat o'qilayotgan (access) ob'ektning qatlamlarigagina reaktivlik o'rnatadi (Lazy Reactivity). Bu inicializatsiya tezligi va xotira (RAM) dan unumli foydalanish imkonini beradi.

### Intervyu Savollari (Qiyin daraja)
**1. Vue 3 da Global API qanday o'zgardi va uning Tree-shaking ga qanday aloqasi bor?**
*Javob:* Vue 2 da `Vue.component`, `Vue.directive` kabi narsalar Global Vue ob'ektiga osilardi va bitta loyihada ikkita alohida Vue instansiyasi bir xil plaginlarni olishga majbur bo'lardi. Vue 3 da esa `const app = createApp()` yaratiladi va barcha plaginlar shu `app` instansiyasiga bog'lanadi (Global pollution yo'qoladi). Qo'shimchasiga, Vue 2 da hamma funksiyalar bitta yadroda kelgan bo'lsa, Vue 3 da ular alohida fayllardan olinadi (`import { ref } from 'vue'`). Agar siz ishlatmasangiz, ular oxirgi fayl hajmiga kirmaydi (Tree-shaking qo'llab-quvvatlanadi).

**2. Vue 2 dan Vue 3 ga proyektni bosqichma-bosqich qanday ko'chirib (migrate) o'tiladi?**
*Javob:* Katta loyihalarni birdaniga ko'chirish xavfli. 
1) Avval loyihani Vue 2.7 versiyasiga ko'tarish kerak. Bu versiyada Composition API o'rnatilgan.
2) Proyektdagi Options API kodlarini sekinlik bilan Composition API ga o'zgartirib chiqish.
3) Vite va yangi linting tizimiga moslashish (Vue CLI o'rniga).
4) Nihoyat, `@vue/compat` kutubxonasidan foydalanib Vue 3 ga o'tish va Vue 2 dan qolgan (buzilgan) kodlarni tozalash. (Vuex o'rniga Pinia ulanadi).

---

## Xulosa

| Xususiyat | Vue 2 | Vue 3 |
|-----------|--------|-------|
| **Reactivity** | `Object.defineProperty` (Yangi properti va Arraylarni to'liq sezmaydi) | `Proxy` (To'liq va o'ta tezkor qo'llab-quvvatlanadi) |
| **API uslubi** | Faqat Options API | Options API va Composition API |
| **TypeScript** | Juda yomon integratsiya | Ideal integratsiya (Vue o'zi TS da yozilgan) |
| **Root elements** | Faqat bitta (1 ta ota `div` kerak) | Xohlagancha (Fragment) |
| **Global API** | Bitta Global `Vue` ob'ekti | Har bir ilova o'zining `createApp` ob'ektiga ega |
| **Tezlik va Hajm** | O'rtacha (Kattaroq bundle) | Yuqori (Kichik hajm, Static Hoisting va Tree-shaking) |
