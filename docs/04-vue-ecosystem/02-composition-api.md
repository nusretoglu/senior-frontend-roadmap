# Composition API - Vue 3 ning Yangi Reaktiv Tizimi

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Agar sizda 1000 qatordan iborat `Options API` da yozilgan Vue 2 komponentingiz bo'lsa, uni o'qish naqadar azob ekanini bilasiz. Chunki bitta logikaga tegishli bo'lgan "State (data)", "Function (methods)" va "Computed" larni ko'rish uchun faylning boshidan oxirigacha scroll qilaverib charchaysiz. Vue 3 ning Composition API'si - xuddi shu mantiqlarni "joylar" bo'yicha emas, "vazifalar" bo'yicha bitta joyga guruhlash imkonini beradi. React Hooks ni biladiganlar uchun, bu deyarli o'sha narsa, faqat ancha ishonchli (Vue da reactivity dependency-arraylarsiz ishlaydi).

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**`ref()`** — Ichiga oddiy ma'lumot (son, matn, true/false) qabul qiluvchi reaktiv o'zgaruvchi. Uni JS da chaqirish yoki o'zgartirish uchun `.value` yozish shart.
**`reactive()`** — Ichiga faqat ob'ekt (Object, Array) qabul qiluvchi reaktiv o'zgaruvchi. Unga `.value` kerak emas, to'g'ridan to'g'ri ishlatiladi.

> [!NOTE]
> **Hayotiy o'xshatish: "Supermarketdagi Tartib"**  
> **Options API:** Supermarket hamma narsani turiga qarab terib chiqqan: "Meva", "Sabzavot", "Go'sht". Agar siz "Moshkichiri" qilmoqchi bo'lsangiz, go'shtni 1-qatordan, guruchni 5-qatordan, sabzini 10-qatordan qidirib sarson bo'lasiz.
> **Composition API:** Supermarketda "Moshkichiri", "Osh", "Shashlik" degan tayyor mahsulotli bo'limlar ochilgan. Moshkichiri uchun kerakli hamma narsa bitta bo'limda turibdi. Shuningdek, retseptni (composable) olib uyga ketsangiz ham bo'ladi!

### Sodda Misol
```vue
<script setup>
import { ref, reactive, computed } from 'vue'

// Juniorlar uchun ref ishlatish eng zo'r variant
const ism = ref("Ali")
const yosh = ref(20)

// Obyektlar uchun reactive
const mashina = reactive({ marka: "Gentra", yil: 2023 })

function yoshniOshirish() {
  yosh.value++ // .value esdan chiqmasin!
  mashina.yil++ // Bunda .value kerak emas
}
</script>

<template>
  <!-- Template ichida .value yozish shart emas, Vue o'zi ochib beradi -->
  <div>Ism: {{ ism }} Yoshi: {{ yosh }}</div>
</template>
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Composable nima?
`Composable` bu maxsus mantiqni (state, funksiyalar) alohida `.js` faylga chiqarishdir. Bu Vue 2 dagi `Mixin` larning muammolarini (qayerdan kelayotgani nomalum, nomlar to'qnashuvi) to'liq hal qiladi. Nomi har doim `use` so'zi bilan boshlanadi.

```javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(boshlangich = 0) {
  const count = ref(boshlangich)
  const double = computed(() => count.value * 2)

  function increment() { count.value++ }

  return { count, double, increment }
}
```

Buni istalgan komponentda shunday chaqiramiz:
```vue
<script setup>
import { useCounter } from './composables/useCounter'

const { count, double, increment } = useCounter(10)
</script>
```

### Ko'p uchraydigan xatolar (Pitfalls)
**Reactive ni Destructuring (Parchalash) qilmang!**
Agar `reactive()` bilan yasalgan obyektni parchalab (destructure qilib) olsangiz, u reaktivlikni butunlay yo'qotadi (oddiy JS ma'lumotga aylanib qoladi).

```javascript
import { reactive, toRefs } from 'vue'

const state = reactive({ x: 1, y: 2 })

// YOMON: Reaktivlik o'ladi
const { x, y } = state 

// YAXSHI: toRefs yordamida har bir propertini alohida ref ga o'girish
const { x, y } = toRefs(state)
```

## Eng Yaxshi Amaliyotlar (Best Practices)
1. **Faqat `<script setup>` ishlating:** Hozirgi kunda `setup()` metodini ochib, hamma narsani return qilib o'tirish eskirgan yondashuv. To'g'ridan to'g'ri `<script setup>` tagi ishlatilsa kod ancha qisqa va qulay bo'ladi.
2. **`ref` ga ustunlik bering:** Ko'pchilik obyektlarga ham `ref()` ni tavsiya qiladi, sababi `.value` orqali yozilsa, bu oddiy JS o'zgaruvchi emas, balki Vue reaktiv obyekti ekanligi aniq ko'rinib turadi va parchalashdagi xatoliklar (destructuring reactivity loss) yuz bermaydi.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### Advanced Reactivity API lari
Ba'zan ma'lumotlar juda katta bo'lganda (10 ming qatorli Array list, yoki 3D rendering obyekti) uni `ref()` yoki `reactive()` qilish brauzerga juda katta yuk tushiradi. Vue Proxy orqali minglab xossalarni kuzatishga uradi.
Shu paytda **`shallowRef`** va **`markRaw`** yordamga keladi.

```javascript
import { shallowRef, markRaw, triggerRef } from 'vue'

// 1. shallowRef: Faqat eng tashqi .value o'zgargandagina render qiladi
const kattaData = shallowRef([{ id: 1 }, { id: 2 } /*...10000ta*/])
kattaData.value[0].id = 99 // REAKTIV EMAS! Ekranda o'zgarmaydi.
triggerRef(kattaData) // Majburan yangilab yuborish (qo'lda)

// 2. markRaw: Vue ga bu obyektni hech qachon reaktiv qilmasligini aytish
import { Chart } from 'chart.js'
const chartInstance = markRaw(new Chart()) // Vue bu uchinchi tomon klassiga kirmaydi
```

### Dependency Injection (Provide / Inject) bilan State boshqarish
Ba'zan Pinia ulamasdan ham, ilovada Global State yasash mumkin. Buni Composition API dagi `provide` va `inject` orqali qilamiz.

```javascript
// App.vue (Katta Ota)
import { provide, ref, readonly } from 'vue'

const lang = ref('uz')
function toggleLang() { lang.value = lang.value === 'uz' ? 'en' : 'uz' }

// Farzandlarga Readonly qilib beramiz, faqat toggle orqali o'zgartirilsin
provide('appLanguage', { lang: readonly(lang), toggleLang })
```

### Intervyu Savollari (Qiyin daraja)
**1. `watchEffect` va `watch` ning asosiy farqi nima?**
*Javob:* `watch` qaysi o'zgaruvchini kuzatayotganini ochiq aytishingizni so'raydi. U o'zgaruvchi o'zgarganda ishlaydi va eski hamda yangi qiymatni (`oldVal, newVal`) bera oladi.
`watchEffect` esa avtomatik (sehr kabi) ishlaydi. Uning ichidagi callback da qaysi reaktiv o'zgaruvchini ishlatsangiz, Vue o'zini o'zi shu o'zgaruvchiga ulab qo'yadi. Yana bir farqi, `watchEffect` komponent yuklanganda darhol (immediate) bir marta ishlab oladi. Eski qiymatni (oldVal) qaytarmaydi.

**2. Script setup ichida `this.$emit` yoki `this.$slots` qanday olinadi (`this` yo'qku)?**
*Javob:* `script setup` ichida komponent instanciyasi yaralishidan oldin yozilganni uchun `this` bo'lmaydi. Ularni o'rniga maxsus compiler makrolari ishlatiladi:
- Emit uchun: `const emit = defineEmits(['update'])`
- Props uchun: `const props = defineProps({ id: Number })`
- Slot va Attr uchun: `import { useSlots, useAttrs } from 'vue'` ishlash orqali chaqirib olinadi. O'rnatilgan makrolarni (defineEmits/Props) import qilish ham shart emas, brauzerga kompilyatsiya bo'layotganda Vue o'zi o'qib oladi.

---

## Xulosa

| Tushuncha | Ta'rifi va Foydasi | Asosiy qoidalar |
|-----------|--------------------|-----------------|
| **`ref()`** | Har qanday turni qabul qiluvchi reaktiv wrapper. | Kod ichida `.value` bilan ishlash shart. |
| **`reactive()`** | Obyektlarni Deep (ichigacha) Proxy qilib reaktivga aylantiradi. | Destructure qilib bo'lmaydi (reaktivlik o'ladi). |
| **`toRefs()`** | `reactive` obyektini havfsiz destructure qilishga yordam beradi. | Obyekt ichidagi hamma xossalarni bittadan `ref` ga aylanitrib beradi. |
| **`Composables`** | Hook (Maxsus funksiyalar). `useXXX` deb nomlanadi. | UI bilan logika aralashib ketmasligi uchun zo'r arxitektura qatlami. |
| **`shallowRef()`** | Katta massivlar/obyektlarni performans(tezlik) ga salbiy ta'sir qilmasdan ishlatish. | Eng katta datalar, 3D liblar yoki Map/Set larni Vue da saqlash uchun ideal. |
