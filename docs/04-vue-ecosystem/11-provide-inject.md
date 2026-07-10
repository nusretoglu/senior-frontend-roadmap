# Provide/Inject - Dependency Injection Pattern

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturlashda ota komponentdan bolaga ma'lumot uzatish oddiy ish (Props orqali). Ammo nabiraga yoki yanada uzoqroq nevaraga o'tkazish kerak bo'lsa, har bir oraliq qatlamga ma'lumotni berib o'tish "Prop Drilling" (Prop teshilishi) muammosini keltirib chiqaradi. Bu oraliq qatlamlar aslida bu ma'lumotga mutlaqo qiziqmasligi mumkin! Provide/Inject orqali biz ota-bobodan to'g'ridan-to'g'ri nevaraga aloqa o'rnatamiz.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Prop Drilling** — Ma'lumotni (Propni) tepadan eng pastga yetkazish uchun o'rtadagi barcha beayb komponentlardan o'tkazish muammosi.
**Provide** (Ta'minlash) — Ota komponent ma'lumotni barcha vorislar uchun umumiy "havoga" uzatishi.
**Inject** (Qabul qilish) — Nevara komponent o'sha "havodagi" ma'lumotni ushlab olib ishlatishi.

> [!NOTE]
> **Real-hayot analogiyasi: "Quduq va Quvur"**  
> Tasavvur qiling siz tog'ning tepasida (GrandParent) suvingiz bor. Pastdagi uchinchi uyga (Child) suv kerak. Uni 1-uyga, undan 2-uyga paqirda tashib kelish (Prop drilling) juda noqulay va be'mani. Buning o'rniga siz tog'dan to'g'ridan-to'g'ri o'sha 3-uyga suv quvuri (Provide/Inject) tortasiz. Oraliqdagi uylar bu suvdan bexabar qolaveradi.

### Sodda Misol
Bizda Tema (dark/light) ma'lumoti bor. Uni eng pastdagi tugmaga (Button.vue) yetkazmoqchimiz.

```vue
<!-- BoboKomponent.vue -->
<script setup>
import { provide } from 'vue'

// 1. Provide ("theme" degan nom bilan "dark" ni uzatdik)
provide('theme', 'dark')
</script>

<template>
  <OtaKomponent /> <!-- Ota hech narsa qabul qilmaydi -->
</template>
```

```vue
<!-- NevaraButton.vue (Otaning ichidagi ichidagi komponent) -->
<script setup>
import { inject } from 'vue'

// 2. Inject (Yuqorida "theme" nomi bilan berilgan ma'lumotni ushlaymiz)
const temaRangi = inject('theme') // 'dark' ni oladi
</script>

<template>
  <button :class="temaRangi">Tugma</button>
</template>
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Reaktivlikni o'tkazish (Reactive Provide)
Yuqoridagi misolda ma'lumot statik (o'zgarmas) edi. Agar `theme` nomi o'zgarsa, pastdagilar qanday xabar topadi? Buning uchun ma'lumotni `ref` qilib uzatamiz.

```vue
<!-- BoboKomponent.vue -->
<script setup>
import { provide, ref } from 'vue'

const joriyTema = ref('light')

// Reaktiv holatni (ref) o'zini uzatamiz
provide('theme', joriyTema)

const temaniOzgartir = () => {
  joriyTema.value = 'dark' // Buni o'zgartirsak...
}
</script>
```

```vue
<!-- NevaraButton.vue -->
<script setup>
import { inject } from 'vue'

const temaRangi = inject('theme') 
// ...pastda (temaRangi) ham avtomatik o'zgaradi!
</script>
```

### Mutatsiyani Taqiqlash (Readonly himoyasi)
Biror yomon Nevara komponent uzatilgan `inject('theme')` ni o'ziga olib uni `temaRangi.value = 'red'` qilib o'zgartirib qo'yishi mumkin! Bu arxitekturani buzadi. Shu sababli Bobo ma'lumotni uzatayotganda uni qulflab (readonly qilib) qo'yishi shart!

```vue
<!-- BoboKomponent.vue -->
<script setup>
import { provide, ref, readonly } from 'vue'

const joriyTema = ref('light')

function temaniAlmashtirish() {
  joriyTema.value = 'dark'
}

// 1. Data ni o'zgartirib bo'lmas qilib (readonly) jo'natish
provide('theme', readonly(joriyTema))
// 2. Uni o'zgartirmoqchi bo'lganlar uchun maxsus funksiyani jo'natish
provide('toggleTheme', temaniAlmashtirish)
</script>
```

Endi Nevara uni o'zgartirmoqchi bo'lsa, xatoga uchraydi. O'zgartirishi uchun u `toggleTheme` funksiyasini chaqirishga majbur bo'ladi.

## Eng Yaxshi Amaliyotlar (Best Practices)
1. **Reaktivlikni nazorat qiling:** `provide` orqali yuborilayotgan ma'lumotni nevaralar o'zboshimchalik bilan o'zgartirib qo'yishini oldini oling. Uning yagona yechimi State ni `readonly()` bilan o'rab yuborishdir.
2. **Keng qo'llanilmang:** Provide/Inject'ni har qadamda ishlatish dastur arxitekturasini tushunarsiz qiladi (Data qayerdan kelayotganini topish do'zaxga aylanadi). Katta loyihalardagi global ma'lumotlar uchun **Pinia** ishlating. Provide/Inject faqatgina tayyor komponentlar kutubxonasi (Masalan `<Tabs>` ichida `<Tab>` lar ishlashi kabi) yaratish uchungina yaxshi.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### Symbol Kalitlardan Foydalanish (Collisions)
Agar ilovada bir xil nomli 2 ta Provide bo'lib qolsachi? Masalan siz uchinchi tomon kutubxonasini o'rnatdingiz, u ham o'zining ichida `provide('theme', 'blue')` ishlatgan, siz ham loyihangizda `provide('theme', 'dark')` yozdingiz. Ikkalasi bir-biriga qo'shilib ishlamay qoladi.
Buning oldini olish uchun String o'rniga JavaScript ning Unikal (takrorlanmas) tipi — `Symbol` dan foydalaniladi.

```javascript
// keys.js (Alohida faylda kalitlarni saqlaymiz)
export const TemaKaliti = Symbol('theme')
```

```vue
<!-- Provider -->
<script setup>
import { provide } from 'vue'
import { TemaKaliti } from './keys.js'

provide(TemaKaliti, 'dark') // Endi String ('theme') emas
</script>
```

```vue
<!-- Injector -->
<script setup>
import { inject } from 'vue'
import { TemaKaliti } from './keys.js'

const theme = inject(TemaKaliti)
</script>
```
Shunda nomlar aynan bir xil bo'lsa ham kompyuter xotirasida ular butunlay ikki xil manzilda yotgani uchun adashmaydi. (TypeScript bilan Types kiritish uchun aynan shu usul qo'llaniladi - `InjectionKey`)

### App-Level (Global) Provide
Loyiha miqyosidagi bir xil narsalarni (Masalan, tarjima API si yoki global konfiglarni) eng asosiy `main.js` dan turib butun loyihaga e'lon qilish mumkin.

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// Endi loyihadagi BAAARCHA komponentlar inject('globalConfig') qila oladi!
app.provide('globalConfig', {
  apiUrl: 'https://api.mysite.com',
  isDev: true
})

app.mount('#app')
```

### Intervyu Savollari (Qiyin daraja)
**1. Provide/Inject va Pinia (Store) ning farqi nimada va qachon qay birini ishlatish kerak?**
*Javob:* Ikkalasi ham "Prop Drilling" muammosini hal qiladi. Lekin Provide/Inject asosan Parent-Child strukturasining muayyan bo'lagida (lokal kontekstda) ishlaydi (Masalan Modal komponenti o'zining ichidagi mittigina qismlariga data tarqatishda). Pinia esa loyihadagi hamma komponentlarga Global tarzda xizmat qiladi, uning ichida Maxsus DevTools bor, u holatlarni vaqt bo'yicha ko'rishga imkon beradi. Xulosa: Bitta izolyatsiya qilingan (boshqalarga daxli yo'q) UI to'plami yasash uchun Provide/Inject oling, qolgan barcha biznes logika uchun Pinia ishlating.

**2. Inject ni komponent default qiymat bilan kutib olishi mumkinmi?**
*Javob:* Ha, agar yuqoridagi Ota komponentlarda Provide e'lon qilinmagan bo'lsa, dastur xato bermasligi uchun Inject ning ikkinchi parametriga default qiymat beriladi.
```javascript
// Agar tepadagilar 'theme' bermagan bo'lsa, avtomat 'light' bo'ladi
const theme = inject('theme', 'light') 
```

---

## Xulosa

| Tushuncha | Nima qiladi? | Qachon ishlatiladi? |
|-----------|--------------|---------------------|
| **Prop Drilling (Muammo)** | Ma'lumotni Ota `->` Bola `->` Nevara qilib zanjir kabi uzatish. | Qochish kerak bo'lgan yomon pattern (Loyiha keraksiz dataga botib ketadi). |
| **`provide()`** | Yuqoridagi Ota komponent ma'lumotni "havoga (kontekstga) otadi". | Ota komponent ichidagi o'nlab chuqur qatlamli komponentlarga bir ma'lumotni berish kerak bo'lganda. |
| **`inject()`** | Ixtiyoriy nevara komponent o'sha "havodagi" ma'lumotni ushlab oladi. | Chuqurda joylashgan komponent ma'lumotni to'g'ridan to'g'ri (faqat o'qish uchun) ishlatishi kerak bo'lganda. |
| **`readonly()` bilan himoya** | Nevara uzatilgan ma'lumotni o'zgartira olmasligini (mutate) kafolatlaydi. | Doim qilinishi kerak bo'lgan eng muhim `Best Practice`. |

Provide/Inject kichik ko'lamli holatlar uchun (masalan, izolyatsiya qilingan Form/Tab UI qutilari uchun) ideal. Lekin butun loyiha (App) miqyosida holatni boshqarish uchun **Pinia** ancha kuchli va mosroqdir.
