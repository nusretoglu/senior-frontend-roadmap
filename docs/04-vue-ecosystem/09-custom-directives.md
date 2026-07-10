# Custom Directives - Maxsus Direktivalar

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchilar UI yaratayotganda iloji boricha elementlar bilan to'g'ridan-to'g'ri, sof JavaScript API lari (`document.getElementById()`) orqali ishlashdan qochishlari kerak. Buni Framework o'zi qilib beradi. Ammo ba'zan Input'ga avtomatik fokus berish, foydalanuvchi qayerga bosganini (Click outside) bilish yoki Element ekraning qayerida turganini (Scroll eventlarini) kuzatish kabi "pastki-daraja" (low-level) amallar kerak bo'ladi. Bunday holatlarda HTML atributlarga o'zimiz yasagan qo'shimcha "sehrli so'zlarni" (`v-focus`, `v-tooltip`) yopishtirib, o'sha elementni nazorat qilsak bo'ladi. Bu Vue da **Custom Directives** (Maxsus Direktivalar) deyiladi.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Custom Directive** — Elementga to'g'ridan-to'g'ri ta'sir ko'rsatuvchi, biz o'zimiz yaratgan maxsus HTML atribut. Ular doim `v-` bilan boshlanadi.

> [!NOTE]
> **Hayotiy o'xshatish: "Sehrli tumor"**  
> Tasavvur qiling, har safar eshikni ochish uchun qo'lingiz bilan tutqichga borish o'rniga, shunchaki eshikka "Ochil" degan tumorni yopishtirib qo'yasiz va u o'z-o'zidan ishlaydi. `v-focus` yoki `v-tooltip` ham xuddi shunday "tumor" — uni HTML tagga (masalan `<input>`) yopishtirsangiz, u darhol ishlashni boshlaydi.

### Sodda Misol (`v-focus`)
Tasavvur qiling, sahifa ochilganda yoki tugma bosilganda avtomatik ravishda bitta Input yonib tursin (Fokus olsin). 
Buni oddiy JavaScript dagi elementning qachon ekranga chizilganini ushlab olish orqali qilamiz:

```vue
<script setup>
// v-focus yaratamiz
const vFocus = {
  // Element ekranga (DOM ga) tushgan zahoti ishlaydi:
  mounted(el) {
    el.focus()
  }
}
</script>

<template>
  <!-- Sahifa ochilganda shu input yonib turadi -->
  <input v-focus placeholder="Men avtomat fokuslanaman" />
</template>
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Direktiva argumentlari va qiymatlari (Binding)
Direktiva nafaqat o'z nomi bilan, balki qo'shimcha parametrlar va nuqtalar orqali qiymatlar ham qabul qilishi mumkin: `v-direktiva:argument.modifikator="qiymat"`.
Bularning bari direktivaning hook (masalan `mounted()`) parametridagi `binding` deb nomlanuvchi obyekt ichida keladi.

```vue
<script setup>
const vRang = {
  mounted(el, binding) {
    // binding.value -> 'red' ni oladi
    el.style.color = binding.value 
  }
}
</script>

<template>
  <p v-rang="'red'">Qizil matn</p>
</template>
```

### Haqiqiy loyihadan misol: Click Outside
Ko'pincha dropdown yoki modallarni ochganimizdan keyin, ularning **tashqarisiga bosa** yopilib qolishini xohlaymiz.

```vue
<script setup>
import { ref } from 'vue'

const ochiq = ref(false)

const vTashqarigaBosish = {
  mounted(el, binding) {
    // Ekranga biron joy bosilsa ishlaydigan funksiya:
    el.klikTinglovchi = (voqea) => {
      // Agar bosilgan nuqta shu elementning ICHIDA BO'LMASA:
      if (!el.contains(voqea.target)) {
        binding.value() // Biz uzatgan funksiyani chaqiradi
      }
    }
    // Document ga quloq osamiz
    document.addEventListener('click', el.klikTinglovchi)
  },
  
  // ELEMENT O'CHIRILSA (Unmount) QULOQ OSISHNI TO'XTATAMIZ (Memory leak oldini olish)
  unmounted(el) {
    document.removeEventListener('click', el.klikTinglovchi)
  }
}

const yopish = () => { ochiq.value = false }
</script>

<template>
  <button @click.stop="ochiq = true">Ochish</button>
  
  <div v-if="ochiq" v-tashqariga-bosish="yopish" style="border:1px solid; padding:10px;">
    Bu Dropdown! Ochiq turganda tashqarisiga bosing, u yopiladi.
  </div>
</template>
```

### Global ro'yxatga olish (Global Registration)
Agar `v-focus` yoki shunga o'xshash direktivangizni butun loyihada istalgan faylda ishlatmoqchi bo'lsangiz, uni `main.js` da ro'yxatdan o'tkazib qo'yish kerak.
```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// Hamma fayllarda v-focus deb ishlataverasiz
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

app.mount('#app')
```

## Eng Yaxshi Amaliyotlar (Best Practices)
1. **Juda ko'p ishlatavermang:** Agar muammoni oddiy Vue komponenti ichida Data (state) orqali hal qila olsangiz, ularni ishlating. Direktivalar faqat DOM bilan yalang'och ishlash kerak bo'lgandagina (fokus, tashqari klik, scroll, lazy load image) kerak. U logikani qadoqlaydigan joy emas.
2. **Nomlanish (Naming conventions):** O'z direktivangizga aniq va nima ish qilishini tushuntiruvchi nom bering (Masalan: `v-scroll-to-top`, `v-lazy-load`).
3. **Tozalashni (Cleanup) aslo unutmang:** Event listener qo'shgan bo'lsangiz (`addEventListener`), uni albatta `unmounted` hook'ida olib tashlang (`removeEventListener`). Aks holda ilovangiz xotirasida axlat yig'ilib qoladi (Memory leak).

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### Direktiva Hook'lari (Lifecycle Hooks)
Vue 3 da direktivaning bosqichlari (hook'lari) xuddi komponentlariniki bilan bir xil qilib o'zgartirildi. Bular asosiylari:
- `created`: Element endi yaratilganda (DOM ga tushmasidan oldin).
- `mounted`: Element ekranga chizib bo'linganda. (Eng ko'p ishlatiladi, listener'lar shu yerga yoziladi)
- `updated`: Elementning Otasi (va bolalari) biron data o'zgarishi tufayli yangilanganda.
- `unmounted`: Element ekrandan o'chib ketganda. (Listener'lar shu yerda o'chiriladi)

### Function Shorthand (Qisqartma)
Aksariyat hollarda direktivangiz `mounted` bo'lganda ham, va kelajakda qiymati `updated` bo'lganda ham huddi bir xil mantiqni ishga tushirishini xohlaysiz. (Masalan qiymatiga qarab fon rangini o'zgartirish). Shunday paytda ob'ekt emas, oddiygina funksiya eksport qilish mumkin:
```javascript
// Bu yozganingiz avtomat tarzda ham "mounted" ham "updated" hook'lariga tushadi
const vFonRangi = (el, binding) => {
  el.style.backgroundColor = binding.value
}
```

### Directive vs Composable (Farqi va qachon qay birini ishlatish kerak)
Katta loyihalarda odamlar ko'pincha "Menga yangi Directive kerakmi yoki Composable(Hook) yasaymi?" deb chalkashib ketishadi.
* **Composable (`useFocus()`)**: Vue ning state'lariga (ref, reactive) bo'gliq qandaydir murakkab biznes logika, API ga qilingan so'rovlar holatini bir joyga yig'ish. U HTML dan ancha uzoqda, faqat Data bilan ishlaydi.
* **Directive (`v-focus`)**: Faqat ulanayotgan yakka HTML Element ning to'g'ridan to'g'ri o'zining ustida jismoniy operatsiyalar o'tkazish. Data unchalik ham qiziq emas. Biron DOM kutubxonasini (Chart.js ni) o'rash, yoki `IntersectionObserver` yopishtirib rasmlarni LazyLoad qilish.

### Intervyu Savollari (Qiyin daraja)
**1. Directive cleanup nima uchun muhim?**
*Javob:* Agar DOM ga biror event (`addEventListener`) qushilgan bo'lsa va u `unmounted` bosqichida `removeEventListener` qilib uzib tashlanmasa, Vue o'sha elementni DOM dan o'chirganda ham u browser Memory'sida qolib ketadi va koda yashirin xatolar berishni boshlaydi. Bu ilova kattalashgan sari katta Performance tushishiga, hatto Crash ga (qotib qolishga) olib keladi. Buni Memory Leak deyiladi.

**2. `binding.modifiers` va `binding.arg` nima?**
*Javob:* `v-direktiva:argument.mod1.mod2="qiymat"` formatida yozilsa:
- `binding.arg` = `"argument"` degan String qaytaradi.
- `binding.modifiers` = `{ mod1: true, mod2: true }` degan Boolean Object qaytaradi.
- Ular direktivani turli xil rejimda ishlatish uchun konfiguratsiya vazifasini o'taydi.

---

## Xulosa

| Direktiva xususiyati | Nima vazifa bajaradi? |
|----------------------|-----------------------|
| **Lifecycle Hooks** | `mounted`, `updated`, `unmounted` kabi maxsus bosqichlarda DOM bilan to'g'ridan-to'g'ri ishlashga ruxsat beradi. |
| **`binding.value`** | Direktivaga berilgan qiymat (`v-color="'red'"` da `'red'` ni olib beradi). |
| **`binding.arg`** | Direktivadagi parametr (`v-on:click` da `click` ni olib beradi). |
| **`binding.modifiers`** | Direktivadagi maxsus kalitlar (`v-on.prevent` da `{ prevent: true }` obyektini beradi). |
| **Cleanup** | Direktiva o'chganda (unmounted hookida) event listener'larni olib tashlash jarayoni (Memory leak oldini olish uchun shart). |
