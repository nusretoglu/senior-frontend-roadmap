# Lifecycle Hooks - Komponent Hayot Sikli

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Komponentlar ekranga chizilayotganda, holati o'zgarayotganda va ekrandan yo'qolayotganda (o'chirilayotganda) ma'lum bir bosqichlardan o'tadi. Lifecycle (Hayot sikli) hook'lari bizga ushbu bosqichlarning har biriga "quloq solish" (tutib olish) va aniq bir bosqichda kod ishga tushirish (masalan: sahifa ochilganda API dan ma'lumot yuklash yoki boshqa sahifaga o'tganda xotirani tozalash) imkonini beradi.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Lifecycle** — Tug'ilish (`mount`), Yashash (`update`) va O'lish (`unmount`). Komponentning ana shu 3 ta asosiy hayot bosqichidir.
**Hook** (Ilmoq) — Ana shu bosqichlar yuz berayotganda o'z funksiyangizni ishga tushirib olish imkoniyati. Masalan, Vue ga "Ekranga komponentni chizib bo'lganingdan keyin, mening mana bu funksiyamni ishga tushir (`onMounted`)" deyish.

> [!NOTE]
> **Hayotiy o'xshatish: "Teatr tomoshasi"**  
> - **`setup()` / `created`**: Aktyorlar ssenariyni o'qishmoqda, rollarni o'rganishmoqda (Ma'lumotlar xotirada bor, lekin sahna hali bo'sh).  
> - **`onMounted`**: Parda ochildi, aktyorlar sahnada. Tomoshabin ularni ko'rmoqda (Komponent DOM ga chizildi, ekranda ko'rindi. API so'rovlarni jo'natish yoki animatsiyani boshlash uchun eng zo'r vaqt).  
> - **`onUpdated`**: Aktyor kiyimini o'zgartirib chiqdi (Data o'zgardi, DOM ham unga moslashib o'zgardi).  
> - **`onUnmounted`**: Tomosha tugadi, parda yopildi. Aktyorlar kiyimlarini yechib, uylariga tarqalishdi (Komponent o'chdi. Taymerlar, sahifadagi qoldiq ishlarni o'chirish kerak).

### Sodda Misol
```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const foydalanuvchilar = ref([])

// Sahifa ochilishi bilan ishlashi kerak
onMounted(async () => {
  console.log("Komponent ekranga chiqdi!")
  // Backenddan datani so'raymiz
  const javob = await fetch('https://api.example.com/users')
  foydalanuvchilar.value = await javob.json()
})

// Sahifa yopilayotganda (Boshqa sahifaga o'tib ketganda)
onUnmounted(() => {
  console.log("Xayr, men o'chdim!")
})
</script>

<template>
  <ul>
    <li v-for="user in foydalanuvchilar">{{ user.name }}</li>
  </ul>
</template>
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Tozalash (Cleanup) san'ati
Ajam (Junior) dasturchilar odatda taymerlar (`setInterval`) yoki darchaning o'lchami o'zgarganini kuzatuvchi voqealar (`window.addEventListener`) ni o'rnatadilar, lekin ularni o'chirishni esdan chiqaradilar. Agar sahifa almashilganda (komponent yo'qolganda) bular tozalanmasa, ular brauzer xotirasida (RAM) ishlab yotaveradi va **Memory Leak** (xotira sizib chiqishi) ga olib keladi. Sahifa bora-bora qotib qoladi.

```javascript
import { onMounted, onBeforeUnmount, ref } from 'vue'

const kenglik = ref(window.innerWidth)
let taymerId = null // Taymer ID sini saqlaymiz

function oynaniOlchash() {
  kenglik.value = window.innerWidth
}

onMounted(() => {
  // 1. Event yozdik
  window.addEventListener('resize', oynaniOlchash)
  
  // 2. Taymer yoqdik
  taymerId = setInterval(() => console.log('Tik-tak'), 1000)
})

// MUHIM: Sahifa yopilayotganda hammasini o'chiramiz!
onBeforeUnmount(() => {
  window.removeEventListener('resize', oynaniOlchash)
  clearInterval(taymerId)
})
```

### KeepAlive bilan ishlash (`onActivated` / `onDeactivated`)
Ba'zida sahifalar orasida o'tganda, ma'lumotlar yana yuklanmasligi uchun Vue da `<KeepAlive>` dan foydalaniladi. Agar komponent `<KeepAlive>` ichida bo'lsa, u hech qachon o'lmaydi (ya'ni `onUnmounted` ishlamaydi!). Buning o'rniga u "muzlatib" qo'yiladi.

Bunday paytda qachon muzlatilgani va qachon qayta ko'rsatilganini bilish uchun:
```javascript
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  console.log("Men cache'dan uyg'ondim!") // mounted o'rniga ishlaydi
})

onDeactivated(() => {
  console.log("Meni muzlatib qo'yishdi") // unmounted o'rniga ishlaydi
})
```

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### SSR (Nuxt) da Lifecycle Hook larning yurish tartibi
Server-Side Rendering (Nuxt) da hooklar bir oz g'alati ishlaydi. 
- `beforeCreate` va `created` (yoki `setup()`) Node.js serverida ham, Mijoz (Brauzer) da ham ishga tushadi. Agar u yerda Brauzer API sini ishlatsangiz (masalan, `window.localStorage`), xatolik olasiz. Chunki Node.js da `window` yo'q.
- `onMounted` va qolgan barcha hooklar **faqat Mijozda** ishlaydi. Server ularni umuman ko'rmaydi.
- Serverdan API ma'lumot yuklab olish uchun Nuxt da maxsus `useAsyncData` (yoki Vue 3 da `onServerPrefetch`) ishlatiladi.

### Custom Composable yozish va Auto-Cleanup
Katta loyihalarda har safar o'chirish-yoqish (`onBeforeUnmount` yozish) ni esdan chiqarmaslik uchun bu vazifani bitta `Composable` funksiya ichiga o'rab qo'yiladi. Composable funksiya o'zi turgan Komponentning Hooklariga ulana oladi!

```javascript
// composables/useEventListener.js (O'zimiz yasadik)
import { onMounted, onBeforeUnmount } from 'vue'

export function useEventListener(target, event, callback) {
  onMounted(() => {
    target.addEventListener(event, callback)
  })

  // Ushbu composable qayerda chaqirilsa, o'sha joy yopilayotganda avtomatik o'zini tozalaydi
  onBeforeUnmount(() => {
    target.removeEventListener(event, callback)
  })
}
```

Kompnentda ishlatilishi juda toza:
```vue
<script setup>
import { useEventListener } from './composables/useEventListener'

// Tugadi! Biz endi buni o'chirish haqida o'ylamaymiz
useEventListener(window, 'resize', () => {
  console.log('Oyna o'zgardi')
})
</script>
```

### Intervyu Savollari (Qiyin daraja)
**1. Vue 3 (Composition API) da nega `beforeCreate` va `created` hook'lari yo'q?**
*Javob:* Chunki ularga ehtiyoj qolmagan. Composition APIdagi `<script setup>` (yoki `setup()` funksiyasi) ning o'zi aynan `beforeCreate` va `created` lar o'rtasidagi vaqtda ishga tushadi. Reactiv o'zgaruvchilarni e'lon qilish, dastlabki API zaproslarni (DOM kerak bo'lmagan so'rovlarni) bevosita `setup` ni o'zida yozib ketaveramiz. 

**2. Ilova ichidagi qaysidir Child (farzand) komponentda fatal xatolik yuz bersa (API yiqilsa, xato tushsa), butun sahifa "Oq ekran" bo'lib qolmasligi uchun nima qilinadi?**
*Javob:* Buning uchun React dagi kabi "Error Boundaries" qilinadi. Vue da bu `onErrorCaptured` hook'i orqali amalga oshiriladi. Eng yuqori ota komponentda (masalan, `App.vue` da) shu hook yoziladi va u barcha farzandlarda chiqqan JS xatolarni tutib olib (Catch), ekranga chiroyli "Xatolik yuz berdi" degan fallback xabar chiqaradi. Kodda `return false` qilsa, o'sha xatolik Console ga tushib brauzerni qotirishini to'xtatadi.

---

## Xulosa

| Hook (Options API) | Hook (Vue 3 / Composition) | Asosiy maqsadi |
|--------------------|----------------------------|-----------------|
| `created` | Shunchaki `setup()` ni o'zi | Komponent yaratildi (data bor, DOM hali yo'q). Boshlang'ich (kuchsiz) sozlamalar uchun. |
| `mounted` | `onMounted()` | Komponent sahnaga chiqdi (DOM tayyor). **Asosiy API so'rovlarni qilish**, echarts kabi kutubxonalarni ulash uchun eng yaxshi joy. |
| `updated` | `onUpdated()` | Agar sizga DOM qayta chizilganidan keyin nimanidir o'qish (masalan width) kerak bo'lsa ishlatiladi. Kuchsiz alternativalari `watch` hisoblanadi. |
| `beforeDestroy` | `onBeforeUnmount()` | Kutish kerak bo'lmagan tozalash ishlari (event listeners, timers, intervals, webSockets uzish) ni yozish SHART bo'lgan joy. |
| `errorCaptured` | `onErrorCaptured()` | Farzand komponentlardagi kutilmagan xatoliklarni ushlab, dasturni qotib qolishdan asrash uchun. |
