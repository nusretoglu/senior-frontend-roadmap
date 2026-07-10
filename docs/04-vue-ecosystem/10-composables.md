# Composables - Qayta Ishlatiluvchi Mantiq

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturlashning Oltin Qoidasi - **DRY (Don't Repeat Yourself)**. Agar bitta funksionallik (masalan foydalanuvchining ekrandagi scroll pozitsiyasini o'lchash yoki API dan data olib kelish) loyihaning 10 xil joyida kerak bo'lsa, siz uni 10 marta yozmaysiz. Vue 2 da bu muammo "Mixins" orqali hal qilingan edi, lekin u kodni chalkashlashtirardi. Vue 3 da **Composables** orqali siz mantiqni (logic) qutiga solib, istalgan joyda toza import qilib ishlata olasiz. 

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Composable** — Vue 3 Composition API (`ref`, `onMounted`, `watch`) dagi imkoniyatlardan foydalanib yozilgan, boshqa komponentlarda osongina qayta ishlatsa bo'ladigan oddiy JavaScript funksiyasi. Ular doim `use` so'zi bilan boshlanadi (masalan, `useFetch`, `useMouse`).

> [!NOTE]
> **Hayotiy o'xshatish: "Pazanda va Retsept"**  
> Agar siz har safar osh qilmoqchi bo'lsangiz, avval guruch yetishtirishni, sabzi ekishni o'rganmaysiz. Siz shunchaki tayyor "Osh Retsepti" ni olasiz.  
> Composable ham xuddi shunday "Retsept". Bir dasturchi `usePagination()` degan retseptni yozib qo'yadi. Endi loyihadagi 15 ta jadvalni (table) sahifalash uchun hech kim kodni boshidan yozmaydi, shunchaki `const { page, nextPage } = usePagination()` qilib retseptni ishlatib ketaveradi.

### Sodda Misol
Deylik bizga sichqonchaning kordinatalarini (X va Y) ko'rsatuvchi xususiyat kerak. 
*Birinchi qadam: `composables/useMouse.js` faylini ochamiz.*

```javascript
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  // 1. Reaktiv state (holat)
  const x = ref(0)
  const y = ref(0)

  // 2. Mantiq
  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  // 3. Lifecycle hooklar
  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  // 4. Qaytarish (Boshqa joyda ishlatish uchun)
  return { x, y }
}
```

*Ikkinchi qadam: Uni Vue komponentida ishlatish.*
```vue
<script setup>
import { useMouse } from './composables/useMouse'

// Shunchaki o'zimizga kerakli xususiyatni "sug'urib" olamiz
const { x, y } = useMouse()
</script>

<template>
  <p>Sichqoncha manzili: {{ x }}, {{ y }}</p>
</template>
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Custom Composable yozish turlari (Patterns)
Composables asosan quyidagi naqshlarda (patterns) ko'p ishlatiladi:

**1. Async Data (Ma'lumot tortish) Pattern'i**
Backend bilan ishlovchi deyarli har bir loyihada `useFetch` composable'i yoziladi:
```javascript
import { ref } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    try {
      const response = await fetch(url)
      data.value = await response.json()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Avtomat chaqirib yuboramiz
  fetchData()

  return { data, error, loading, qaytaYuklash: fetchData }
}
```
**Ishlatish:**
```javascript
const { data: users, loading, error } = useFetch('https://api.site.com/users')
```

**2. Form Handling (Formani boshqarish)**
O'nlab inputlari bor formani o'zgaruvchilarga saqlash va tekshirishni (validation) alohida ajratib olish qulay. Buni `useForm()` qilib saqlasangiz barcha UI elementlaringiz orqa fonidan xabardor bo'lmasdan faqat dizayn uchun xizmat qilishi ta'minlanadi.

### Eng Yaxshi Amaliyotlar (Best Practices)
1. **"use" bilan boshlang:** Har doim fayl va funksiya nomini `use` so'zi bilan boshlang (`useMouse`, `useFetch`). Bu React Hooks'dan qolgan global standartdir.
2. **VueUse kutubxonasi:** O'zingiz noldan `useWindowScroll` yoki `useLocalStorage` yozishga shoshilmang. Vue hamjamiyatida 200+ tayyor composables yig'ilgan eng zo'r **[VueUse](https://vueuse.org/)** kutubxonasi bor. Avval shuni tekshiring!
3. **Ob'ekt qaytaring (Return Object):** Composable dan qiymat qaytarayotganda, ularni array `[x, y]` ko'rinishida emas (Garchi Reactda shunday bo'lsada), doim Ob'ekt `{ x, y }` qilib qaytaring. Chunki Destructuring paytida qaysi qiymat nima ekanligi aniqroq bo'ladi va kutubxonangiz kengayganda tartib buzilmaydi.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### Moslashuvchan Argumentlar (`toValue`)
Zo'r yozilgan Composable o'ziga argument sifatida ham oddiy `String/Number` larni, ham reaktiv `ref()` larni qabul qila olishi kerak. Va o'sha argument reaktiv tarzda o'zgarganda ichkaridagi ishlarni avtomatik takrorlashi kerak. Buni Vue 3.3 da kelgan `toValue()` orqali qilinadi:

```javascript
import { ref, watchEffect, toValue } from 'vue'

export function useDynamicTitle(title) {
  // watchEffect o'zi bilib ichidagi reaktiv ob'ektlarga obuna bo'ladi
  watchEffect(() => {
    // toValue(title) - agar u ref bo'lsa .value sini oladi, string bo'lsa o'zini beradi
    document.title = toValue(title)
  })
}

// Qanday ishlatsak ham ishlayveradi:
useDynamicTitle('Mening Saytim') // Oddiy String

const user = ref('Shuhrat')
useDynamicTitle(() => `Xush kelibsiz, ${user.value}`) // Getter (Dynamic)
```

### Global State (Singleton Composable)
Ba'zida bitta composable funksiyani 5 xil komponent ishlatganda ularning barchasi uzoq serverga yana 5 marta so'rov jo'natmasdan, hammalari Bitta umumiy Ma'lumotlar omboriga qarashini xohlaysiz (Xuddi Pinia/Vuex kabi).
Buni amalga oshirish juda onson: Reaktiv state'ni funksiyaning **ichida emas**, tashqarisida e'lon qilasiz!

```javascript
// composables/useAuth.js
import { ref, readonly } from 'vue'

// Bu "Global Scope" da qoladi! Necha marta fayl chaqirilsa ham bitta yashaydi.
const currentUser = ref(null)

export function useAuth() {
  const login = async (credentials) => {
    // API call va hokazo...
    currentUser.value = { name: 'Admin' }
  }

  return {
    // Tashqaridan kimdir currentUser.value = null qilib qo'ymasligi uchun readonly qilamiz
    user: readonly(currentUser), 
    login
  }
}
```

### Intervyu Savollari (Qiyin daraja)
**1. Vue 2 dagi Mixins larning Composables (Composition API) dan qanday kamchiligi bor edi?**
*Javob:* 
- **Nomlar to'qnashuvi (Name collisions):** Ikkita Mixin `data()` da `name` degan o'zgaruvchi qaytarsa kim yutishi noaniq edi. Composable da esa `const { name: fName } = useFetch()` qilib o'zimiz nom beramiz.
- **Noma'lum manba (Implicit Dependencies):** Komponentga qarab `this.fetchData()` ni qaysi mixin olib kelganini topish do'zax azobi edi. Composable da `import { fetchData } from './useFetch'` degan qator orqali hamma narsa aniq ko'rinadi.

**2. Composable va Utility Function (yordamchi funksiya) farqi nima?**
*Javob:* Yordamchi funksiya (masalan `formatDate(date)`) shunchaki JS da yozilgan, hech qanday Vue ga aloqasi yo'q, ichida `ref`, `onMounted` yo'q toza funksiyadir. Composable esa o'z ichida "State" (holat) ushlab tura oladigan, Vue Lifecycle lariga ulana oladigan (Stateful) komponentning kichikroq bo'lagidir.

---

## Xulosa

| Yondashuv / Xususiyat | Nima uchun ishlatiladi? |
|-----------------------|-------------------------|
| **Qayta ishlatuvchanlik** | Bitta logikani (API so'rov, form validatsiya) yuzlab joyda qayta yozmasdan ishlatish. |
| **Guruhlash** | Bitta ishga javobgar barcha kod (data, function, hooks) turli xil Options (`data`, `methods`) larga sochilib ketmasdan faqat bitta `.js` faylda yig'iladi. |
| **O'qilish (Readability)** | Komponentlar keskin qisqaradi, `setup()` ichida faqat qisqa ko'rinishli `const { data } = useFetch()` chaqiruvlari qoladi. |
| **Global State** | `ref` ni composable funksiyasidan tashqarida elon qilish orqali butun loyihaga mos keladigan Mitti-Vuex/Pinia yasash imkoniyati. |

Loyihangizda Composables larni qo'lda yozishga shoshilmang, balki dunyodagi eng mashhur **[VueUse](https://vueuse.org/)** kutubxonasida aynan sizga keraklisi tayyor turgan bo'lishi mumkin!
