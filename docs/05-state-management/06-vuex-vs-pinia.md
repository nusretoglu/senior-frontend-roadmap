# Vuex vs Pinia - To'liq Taqqoslash

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Ko'plab eski Vue loyihalari Vuex'dan foydalanadi, yangi loyihalar esa Pinia'ni tanlaydi. Ushbu ikki texnologiyaning farqini tushunish, loyihani to'g'ri baholash, xatolarni tezda topish va agar kerak bo'lsa Vuex'dan Pinia'ga og'riqsiz migratsiya qilish uchun eng kerakli bilimdir.

> [!NOTE]
> **Real-hayot analogiyasi: "Qattiqqo'l menejer va O'z-o'ziga xizmat do'koni"**  
> **Vuex (Eski uslub):** Do'kondan nimadir olmoqchi yoki o'zgartirmoqchi bo'lsangiz, menejerga (Action) borishingiz kerak. U ishchilarga (Mutation) buyruq beradi va ishchilar omborni (State) o'zgartiradi. Juda xavfsiz, lekin ortiqcha qadamlar ko'p.
> **Pinia (Yangi uslub):** O'z-o'ziga xizmat do'koni. Qoidalarga (Action) amal qilgan holda o'zingiz to'g'ridan-to'g'ri omborni (State) o'zgartira olasiz. O'rtakashlar (Mutation) yo'q, tez va oson.

Vue 3 chiqishi bilan State Management arxitekturasida inqilob bo'ldi va Evan You (Vue yaratuvchisi) o'zi Pinia ni Vuex 5 ning rasmiy vorisi ekanligini e'lon qildi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

### Asosiy Farqlar

| Xususiyat | Vuex (Eski) | Pinia (Yangi) |
|-----------|-------------|---------------|
| **Mutations** | Majburiy (Kodni ko'paytiradi) | Yo'q (Sodda va tez) |
| **Arxitektura** | Yagona katta daraxt (Root Store) | Ko'plab kichik store'lar (Modullar) |
| **TypeScript** | Juda yomon, yozish qiyin | First-class qo'llab-quvvatlash |
| **O'rnatish hajmi** | Og'irroq (~10KB) | Yengil (~1.5 KB) |

### Sodda Kod Taqqoslashi

**Vuex dagi uzoq yo'l:**
```javascript
// VUEX
const store = createStore({
  state: { count: 0 },
  mutations: {
    SET_COUNT(state, val) { state.count = val } // Majburiy qadam
  },
  actions: {
    increment({ commit }) {
      commit('SET_COUNT', 10) // Avval commit
    }
  }
})
```

**Pinia dagi oson yo'l:**
```javascript
// PINIA
const useStore = defineStore('main', {
  state: () => ({ count: 0 }),
  // Mutations butkul yo'q
  actions: {
    increment() {
      this.count = 10 // To'g'ridan-to'g'ri o'zgartirish
    }
  }
})
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Module va Store Arxitekturasi
Vuex'da hamma modullar bitta "Gigant Store" ichiga joylashgan (`modules: { user, cart, post }`). Bir moduldagi holatni ikkinchisidan topish uchun siz ildizga (Root) qaytishingiz kerak bo'lardi.

Pinia'da esa har bir Store alohida-alohida mustaqil yashaydi. Boshqa store dagi ma'lumot kerakmi? Shunchaki uni chaqiring.

```javascript
// PINIA - Store ichida boshqa Store ni ishlatish
import { useUserStore } from './user'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] }),
  actions: {
    checkout() {
      // Boshqa Store'ni ishlatish juda oson
      const userStore = useUserStore() 
      if (!userStore.isLoggedIn) {
        alert('Avval kiring!')
        return
      }
      // Sotib olish...
    }
  }
})
```

### Type Inference (Avtomat turlarni topish)
Agar loyihada TypeScript ishlatsangiz, Vuex bilan ishlash haqiqiy do'zaxdir (`RootState`, qo'lda yozilgan interfeyslar, vs). Pinia da siz hechnima yozmaysiz — barchasi o'zi siz uchun tiplarni topadi! O'zgaruvchilarga ham IDE avtomatik taklif (autocomplete) beradi.

### $patch orqali guruhlab o'zgartirish
Agar obyektdagi bir qancha qatorlarni o'zgartirmoqchi bo'lsangiz to'g'ridan-to'g'ri `state` dagi nomga murojaat qilish o'rniga guruhlashtirganingiz ma'qul, shunda Vue ularni 1 martada render qilib ulguradi.
```javascript
const store = useUserStore()

// Bitta $patch call barcha xususiyatlarni bir marta o'zgartiradi
store.$patch({
  name: 'Ali',
  age: 25,
  isActive: true
})
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### Pinia da Mutation'lar nima uchun olib tashlandi?
Vuex davrida Mutation lar kerak edi, chunki Vue ni reaktiv tizimi (Vue 2 dagi `Object.defineProperty`) har bir o'zgarishni ishonchli ushlab ololmasdi va DevTools da xatolikni ushlash uchun yagona "darvoza" (Mutation) yasalgan edi. 
Vue 3 bilan `Proxy` obyekti paydo bo'ldi. U obyektdagi har qanday yashirin o'zgarishni (`store.items.push()`) ham ilib ololadi (intercept). Evan You "Endi Proxy varkän Mutation kabi keraksiz qadamning keragi yo'q" dedi va uni bekor qildi.

### Vuex dan Pinia ga migratsiya qilish
Loyiha kattalashib ketgan bo'lsa Vuex dan Pinia ga o'tish sekin-asta, komponentma-komponent tarzida qilinishi kerak:
1. Loyihaga bitta `.js` faylda Vuex, boshqa `.js` faylda Pinia ni biriktirish (Vue bir paytda ikkalasini ishlata oladi).
2. Osonroq modullarni Pinia `defineStore` ko'rinishiga tushirish.
3. Mutations larni o'chirib ularning mantiqini Actions ga olib kirish.
4. Namespaced chaqiruvlarni (`this.$store.commit('cart/add')`) Pinia importiga almashtirish.

### Store larni tozalash - `$reset()`
Foydalanuvchi tizimdan chiqqanda hamma Store larni avvalgi holatiga tozalab yuborish kerak bo'ladi. Vuex da buni qo'lda birma-bir qilardik. Pinia Option API da bu bitta qator:
```javascript
const store = useUserStore()
store.$reset() // State initial holatga qaytadi
```
*(Izoh: Agar Setup (Composition API) da yozilgan bo'lsa, `$reset` funksiyasi avtomatik ishlamaydi, siz uni custom tarzda action sifatida qayta yozishingiz kerak).*

### Intervyu Savollari (Qiyin daraja)
**1. Pinia Actions ichida Setup/Composition API (masalan `watch`) ishlatsa bo'ladimi?**
*Javob:* Ha, agar Pinia store `Setup API` uslubida yozilgan bo'lsa, xuddi komponent ichidagidek bemalol ishlata olasiz. Chunki Store ning o'zi aslini olganda bir Custom Composable hisoblanadi.

**2. Nima uchun qachonlardir hali ham Vuex 4 tanlanishi mumkin?**
*Javob:* Hech qachon yangi loyihaga tanlanmaydi. Faqat eski loyiha va migratsiyaga pul (yoki vaqt) ajratilmagan taqdirdagina Vuex 4 da qolinadi. Bu Legacy code support holati sanaladi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Yangi loyiha = Pinia**: Vue 2 da ishlaysizmi yoki Vue 3 da farqi yo'q. Hozirda barcha yangi loyihalar uchun Pinia ishlatish standarti tavsiya etiladi. Vuex yangilanmaydi.
2. **State mutate qilmang (Vuex)**: Agar loyiha eski va Vuex ishlatsa, hech qachon stateni to'g'ridan-to'g'ri o'zgartirmang (doim mutation ishlating). Pinia da bo'lsa buni to'g'ridan-to'g'ri qilsangiz bo'ladi.
3. **Module o'rniga bir nechta Pinia Store**: Vuex'dagi katta bir daraxt va namespace'lar o'rniga, Pinia'da turli kichik fayllarda alohida-alohida do'konlar (`useUserStore`, `useCartStore`) saqlash afzal. Bu TypeScript ga tiplarni tezroq topishga yordam beradi.

---

## Xulosa

| Xususiyat | Vuex (Eski) | Pinia (Yangi) |
|-----------|-------------|---------------|
| **Mutations** | Majburiy (Kodni ko'paytiradi) | Yo'q (Sodda va tez) |
| **Arxitektura** | Yagona katta daraxt (Root Store) | Ko'plab kichik store'lar (Modullar) |
| **TypeScript** | Juda yomon, yozish qiyin | First-class qo'llab-quvvatlash |
| **O'rnatish hajmi** | Og'irroq (~10KB) | ~1.5 KB (Juda yengil) |

### Final Recommendation

> [!TIP]
> **2024+ Loyihalar uchun: PINIA**
> 
> Sabablar:
> - Vue core team tomonidan rasmiy
> - Sodda API (no mutations)
> - TypeScript first-class
> - ~7x kichikroq bundle
> - Yaxshi DevTools
> - Evan You: "Pinia is effectively Vuex 5"

Vuex hali ham eskilarni qo'llab-quvvatlash uchun bor, lekin barcha yangi loyihalar uchun qat'iy Pinia tavsiya etiladi.
