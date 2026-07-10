# Dynamic Components - Dinamik Komponent Almashtirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturlashda ko'pincha bitta joyning o'zida har xil qismlarni ko'rsatishga to'g'ri keladi (masalan, Tablar, Dialoglar, Forma bosqichlari). Bularning hammasini bitta joyga yozib, `v-if` bilan o'n xil komponentni yashirib-ko'rsatish kodni xunuk va o'qib bo'lmas darajaga olib keladi. **Dynamic Components** (Dinamik Komponentlar) orqali bittagina joy ajratib qo'yib, o'sha joyga "istalgan" komponentni joylashtirish imkoniyati paydo bo'ladi.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Dynamic Component** — Vue ning maxsus `<component>` tegi orqali o'zini qaysi komponentga aylantirishni sharoitga qarab (dinamik tarzda) hal qiladigan texnologiya.

> [!NOTE]
> **Hayotiy o'xshatish: "Televizor ekrani"**  
> Dynamic Component (`<component :is="...">`) bu xuddi televizorning bo'sh ekrani. U o'z-o'zidan hech narsa ko'rsatmaydi. Lekin pult orqali kanalni (komponentni) o'zgartirsangiz, ekran o'zida har xil ko'rsatuvlarni (Home komponentsi, Profile komponenti, Settings komponenti) namoyish eta boshlaydi.

### Sodda Misol
Tasavvur qiling bizda 3 ta oddiy fayl bor: `Home.vue`, `About.vue` va `Contact.vue`. Ularni Tablar kabi almashtirmoqchimiz.
```vue
<script setup>
import { shallowRef } from 'vue'
// Komponentlarni fayl sifatida import qilamiz
import Uy from './Home.vue'
import Haqida from './About.vue'
import Aloqa from './Contact.vue'

// Qaysi biri hozir ko'rinishi kerakligini saqlaymiz (Default: Uy)
const hozirgiKanal = shallowRef(Uy) 
</script>

<template>
  <button @click="hozirgiKanal = Uy">Uyga o'tish</button>
  <button @click="hozirgiKanal = Haqida">Biz haqimizda</button>
  <button @click="hozirgiKanal = Aloqa">Aloqa</button>

  <hr />
  
  <!-- "Televizor ekrani" -->
  <component :is="hozirgiKanal" />
</template>
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Props va Voqealar uzatish
Dynamic komponent xuddi oddiy komponent kabi Props qabul qilib, o'zidan Event (Emit) chiqarishi mumkin. Faqat qiziq joyi, u qaysi komponentga aylansa, Props lar o'shanga qarab ketadi.

```vue
<template>
  <!-- Agar hozirgiKanal UserForm ga teng bo'lsa userId unga ketadi -->
  <!-- ProductForm ga teng bo'lsa productId qabul qiladi -->
  <component
    :is="hozirgiKanal"
    :userId="123"
    :productId="456"
    @saqlandi="xabarniKorsatish"
  />
</template>
```

### `<KeepAlive>` (Muzlatgich)
Siz bitta Tab dan ikkinchi Tab ga o'tganingizda, Vue birinchi Tab dagi komponentni butunlay o'chirib yuboradi (Unmounted bo'ladi). Siz yana orqaga qaytsangiz, u noldan qayta quriladi. Bu degani API ga yana so'rov ketadi, yozib qoldirgan inputlaringiz tozalanib ketadi! Buni oldini olish uchun "Televizor ekrani" ni `<KeepAlive>` muzlatgichiga solib qo'yamiz.

```vue
<template>
  <KeepAlive>
    <component :is="hozirgiKanal" />
  </KeepAlive>
</template>
```
Endi siz Tab ni almashtirsangiz u o'chmaydi, "muzlatiladi" va qachon qaytib kelsangiz yozgan narsalaringiz shu turishicha (keshda) saqlanib turadi.

### KeepAlive Lifecycle Hooklari
Komponent o'lmasdan muzlatilganda `onUnmounted` ishlamaydi! Shuning uchun u uxlab qolganda yoki qayta uyg'onganda quyidagi hooklar ishlatiladi:
```javascript
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  console.log("Men muzlatgichdan chiqdim, ko'rinyapman!")
})

onDeactivated(() => {
  console.log("Meni muzlatishdi, sahni tark etyapman!")
})
```

## Eng Yaxshi Amaliyotlar (Best Practices)
1. **`shallowRef` ishlating:** Komponentni o'zini (ob'ektni) saqlayotganda hech qachon `ref` ishlatmang. Chunki `ref` komponentning barcha chuqur ichak-chavoqlarini reaktiv qilishga urinib tizimni (performance ni) sekinlashtiradi. `shallowRef` faqat tashqi qatlamni yuzaki reaktiv qilib tezroq ishlaydi.
2. **Keshlashtirish:** Foydalanuvchi ma'lumot kiritayotgan har qanday dinamik formalar / wizard bosqichlari (Step 1, Step 2) atrofini albatta `<KeepAlive>` bilan o'rang.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### Async Components (Kechiktirib yuklash - Lazy Load)
Loyiha kattalashgan sari hamma narsani asosiy faylda `import` qilish "Bundle Size" ni shishirib yuboradi. Natijada foydalanuvchiga veb-sayt birinchi ochilishda juda sekin yuklanadi.
Biz og'ir (masalan, grafika chizadigan) komponentni darhol emas, "faqat qachon kerak bo'lsa shundagina" (foydalanuvchi bosganda) serverdan yuklab keladigan (Dynamic Import) qilishimiz mumkin. Buni Vue da `defineAsyncComponent` qiladi.

```vue
<script setup>
import { defineAsyncComponent, shallowRef } from 'vue'

// Komponent zudlik bilan import QILINMAYDI. Sayt tez ochiladi.
const OgarGrafika = defineAsyncComponent(() => import('./Og'irChart.vue'))

const hozirgi = shallowRef(null)
</script>

<template>
  <button @click="hozirgi = OgarGrafika">Grafikani ko'rish</button>

  <component :is="hozirgi" />
</template>
```

### Async Loading va Error Handle
Komponent internet tezligi tufayli sekin yuklansa nima bo'ladi? Vue bunga mukammal yechim beradi:

```javascript
const AsyncModal = defineAsyncComponent({
  // Komponentning o'zi
  loader: () => import('./KattaModal.vue'),
  
  // Yuklanayotganda ko'rsatiladigan vaqtinchalik Spinner/Skeleton
  loadingComponent: LoadingSpinner,
  delay: 200, // 200ms dan tez tushsa loading umuman chiqmaydi (miltillashni oldini oladi)

  // Internet uzilib qolsa yuz beradigan xato ekrani
  errorComponent: ErrorXabarnomasi,
  timeout: 5000 // Agar 5 soniyada kelmasa ErrorComponent ga o'tadi
})
```

### Intervyu Savollari (Qiyin daraja)
**1. `<KeepAlive include="UserTab">` dagi `include` qanday ishlaydi?**
*Javob:* Ba'zida biz 10 ta Tab dan 2 tasinini keshlab qolganini o'ldirmoqchi bo'lamiz. `<KeepAlive>` ning `include` atributiga biz o'zimiz xohlagan komponentlarning ismlarini beramiz (Masalan regex yoki array ko'rinishida). Lekin diqqat qiling: u ishlashi uchun komponentning ichida uning nomi berilgan bo'lishi shart! (`<script>` da `defineOptions({ name: 'UserTab' })` yozilgan bo'lishi shart).

**2. `<Suspense>` nima va uning dinamik komponentlarga aloqasi qanday?**
*Javob:* Async Component (yoki ichida `await` yozilgan Setup) yuklanguncha ma'lum vaqt o'tadi. O'sha o'tayotgan vaqtda umuman boshqa bir Loading oynasi ko'rsatib turish uchun bu komponentlarning otasiga `<Suspense>` o'rab qo'yiladi. Uning ikkita sloti bor: `#default` da kutish ob'ekti yotadi, `#fallback` da esa kutish vaqtida ekranga ko'rinib turadigan Skeleton / Spinner ko'rinadi. Asl ob'ekt serverdan to'liq yetib kelgach (resolve bo'lgach), avtomatik tarzda Spinner yashirinib Asl ob'ekt namoyon bo'ladi.

---

## Xulosa

| Komponent/Sintaksis | Vazifasi | Qachon ishlatiladi? |
|---------------------|----------|---------------------|
| `<component :is="...">`| Berilgan shartga qarab har xil komponentni chaqiradi. | Tablar almashtirishda, har xil form elementlari chizishda (dinamik formalar). |
| `<KeepAlive>` | O'chib ketayotgan komponentni state'ini yo'qotmay keshlaydi. | Tablar orasida ma'lumot yo'qolmasligi uchun yoki qimmat API call ni qayta takrorlanishini oldini olishda. |
| `defineAsyncComponent`| Komponentni sahifa birinchi yuklanganda emas, faqat o'zi ko'ringandagina yuklab oladi. | Katta hajmdagi modallar, chartlar, murakkab komponentlarni yuklashda (bundle size kamayadi). |
| `<Suspense>` | Async komponentlar (yoki async `setup`) yuklanguncha Loading oynasini ko'rsatib turadi. | Dashboard yuklanish jarayonida chiroyli Spinner yoki Skeleton Loader ko'rsatish uchun. |
