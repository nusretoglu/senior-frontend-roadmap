# Refs va Reactive - Vue 3 Reaktivlik Asoslari

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Vue 3 da Composition API ni boshlagan har bir dasturchining birinchi savoli: "Qachon `ref` ishlataman, qachon `reactive`?". Agar siz buni farqiga bormasangiz, ertaga "Nega kodimdagi o'zgaruvchi o'zgaryapti, lekin ekranda o'zgarish bo'lmayapti?" deb bosh qotirishni boshlaysiz. Chunki JavaScript da oddiy ma'lumotlar (string, number, boolean) ob'ektlar kabi reference (manzil) orqali ishlolmaydi. `ref` o'sha primitivlarni ham reaktiv qila oladigan maxsus qutidir.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Reaktivlik** — Ma'lumot (o'zgaruvchi) o'zgarganda, ekrandagi ko'rinishining avtomatik ravishda unga moslashib o'zgarishi.
**ref** — Har qanday ma'lumotni saqlab, o'zgarishini kuzata oladigan quti (`.value` bilan ochiladi).
**reactive** — Obyekt yoki massivlarni to'g'ridan-to'g'ri kuzatadigan xona (`.value` siz ishlaydi).

> [!NOTE]
> **Hayotiy o'xshatish: "Quti va Uy"**  
> Tasavvur qiling sizda qog'oz pul (primitive value) bor. Uni to'g'ridan-to'g'ri birovga bersangiz, u ketib qoladi, unga nima bo'layotganini ko'rolmaysiz.  
> - **`ref()` (Maxsus Quti):** Siz pulni shaffof va har bir o'zgarishni yozib oluvchi kamerasi bor qutiga solib qo'ydingiz. Pulning miqdori o'zgarganini bilish yoki qo'shish uchun faqat qutini (`.value`) ochib qaraysiz. Oddiy narsalar faqat quti orqali ishlay oladi.  
> - **`reactive()` (Aqlli Uy):** Uy bu obyekt. Uyning ichida televizor, muzlatgich bor. Uyning o'zi kuzatuv tizimiga (Proxy) ulangan. Ichidagi narsani almashtirish uchun quti shart emas, to'g'ridan-to'g'ri `Uy.televizor = 'yangi'` qilaverasiz. Lekin televizorni ko'tarib uydan uzoqqa olib chiqib ketsangiz (destructuring), uyning kameralari unga nima bo'layotganini ko'rolmay qoladi.

### Sodda Misol
```vue
<script setup>
import { ref, reactive } from 'vue'

// 1. ref ishlatilishi (Primitive data)
const yosh = ref(20)
function ulgoyish() {
  yosh.value++ // JS fayl ichida albatta .value yoziladi
}

// 2. reactive ishlatilishi (Obyekt)
const foydalanuvchi = reactive({
  ism: "Ali",
  yosh: 25
})
function ismniOzgartir() {
  foydalanuvchi.ism = "Vali" // .value umuman kerak emas!
}
</script>

<template>
  <!-- E'tibor bering: Ekranga chiqarishda .value kerak emas, Vue o'zi ochib oladi -->
  <p>{{ yosh }}</p> 
  <button @click="ulgoyish">Kattalashish</button>
  
  <p>{{ foydalanuvchi.ism }}</p>
</template>
```

---

## 🟡 Middle (Amaliyot va Detallar)

### `reactive` ning zaif tomoni (Destructuring balosi)
Keling, aqlli uydagi televizorni misolini eslaymiz. JS dagi obyektlarni "parchalab" ajratib olish (destructuring) juda qulay. Lekin buni `reactive` da qilsangiz reaktivlik yo'qoladi!

```javascript
import { reactive, toRefs } from 'vue'

const state = reactive({ count: 0, title: "Vue" })

// NOTO'G'RI: Endi "count" shunchaki 0 raqamiga aylandi, Vue uni boshqa kuzatolmaydi
let { count } = state 
count++ // Ekranda hech narsa o'zgarmaydi!

// TO'G'RI: toRefs yordamida parchalash
// Bu xuddi har bir obyekt xossasiga alohida quti (ref) yasab beradi
const { count: xavfsizCount } = toRefs(state)
xavfsizCount.value++ // Ekranda ham o'zgaradi
```

### Obyektni to'liq almashtirish muammosi
Ba'zida API dan kelgan yangi ma'lumot bilan eski ma'lumotni to'liq almashtirmoqchi bo'lasiz.
```javascript
// REACTIVE DA MUAMMO
let data = reactive({ a: 1 })
data = reactive({ a: 2 }) // DIQQAT: Eski ulangan ekranlar endi ishlamaydi, chunki ob'ekt manzili butunlay o'zgarib ketdi!

// REF DA ESA OSON
const dataRef = ref({ a: 1 })
dataRef.value = { a: 2 } // .value ichidagi manzilni o'zgartirish reaktivlikka zarar yetkazmaydi!
```

Shuning uchun zamonaviy Vue komunitisida qat'iy oltin qoida bor: **"Ref all the things" (Har doim faqat `ref` dan foydalan)**. Obyekt bo'lsa ham unga `ref` qilib qo'ysangiz xatoliklar (buglar) 90% ga kamayadi.

## Eng Yaxshi Amaliyotlar (Best Practices)
1. **"Ref All The Things" qoidasi:** Faqat bitta sintaksisni ishlating - `ref`. Shunda qachon `.value` yozaman, qachon yo'q deb asablaringizni buzmaysiz. `ref` har qanday ma'lumotni o'zida ishonchli saqlaydi.
2. **Prop dan kelgan ma'lumotni destructure qilmang:** Ota komponentdan tushgan (props) obyekt `reactive` bo'ladi. Uni xuddi yuqoridagidek `const { id } = props` qilsangiz, id o'zgarganini farzand komponent sezmaydi. Har doim `props.id` qilib ishlating yoki `toRefs(props)` dan foydalaning.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### ShallowRef (Sayoz Reaktivlik)
Agar siz sahifada millionta elementdan iborat massivni yoki murakkab Graph ma'lumotlarini (masalan, Chart.js, Three.js) saqlayotgan bo'lsangiz oddiy `ref` ishlata ko'rmang! Oddiy `ref` ma'lumot ichidagi HAR BIR xossaga bittadan "Kuzatuvchi" (Proxy trap) yopishtirib chiqadi. Millionta narsaga millionta trap yopishtirish brauzer xotirasini pachoqlaydi (Memory limit exceeded).

Shunday paytda `shallowRef` o'yinga kiradi. U massiv ichiga umuman kirmaydi, u faqat eng ustki qatlam (`.value`) ni kuzatadi xolos.

```javascript
import { shallowRef, triggerRef } from 'vue'

const yirikGrafik = shallowRef({ nodes: [...100_000 elements] })

// Bu sahifani yangilamaydi, chunki shallowRef ichkariga qaramaydi
yirikGrafik.value.nodes[0] = "yangi qiymat" 

// UI ni yangilash uchun manual tarzda turtib yuboramiz
triggerRef(yirikGrafik) 
```

### Vue 3 da Proxy qanday ishlaydi?
Vue 2 da reaktivlik `Object.defineProperty` orqali qilingan, shuning uchun obyektga yangi kalit qo'shilsa (masalan `obj.yangiXossa = 1`) uni reaktiv qila olmasdi (buning uchun `$set` kerak bo'lardi).
Vue 3 esa JavaScript `Proxy` API dan foydalanadi. 
```javascript
function soddaReactive(target) {
  return new Proxy(target, {
    get(obyekt, xossa) {
      // Qaysi UI element shuni o'qiyotganini ro'yxatga olamiz (Track)
      track(obyekt, xossa)
      return obyekt[xossa]
    },
    set(obyekt, xossa, yangiQiymat) {
      obyekt[xossa] = yangiQiymat
      // O'zgarganini hamma UI elementlarga xabar beramiz (Trigger)
      trigger(obyekt, xossa)
      return true
    }
  })
}
```
Aynan shu `Proxy` tufayli Vue 3 da o'chirilgan (delete) yoki yangi qo'shilgan obyekt/massiv elementlari muammosiz reaktiv ishlaydi.

### Intervyu Savollari (Qiyin daraja)
**1. `markRaw` qachon ishlatiladi?**
*Javob:* Ba'zi narsalarni VUE aslo va hech qachon reaktiv qilmasligi kerak. Masalan, Uchinchi tomon kutubxonalari (Axios instance, Leaflet Map instance). Ularni reaktiv qilsangiz, ular ishlamay qoladi. Shunda obyekt atrofini `markRaw()` bilan o'rab qo'ysak, keyinchalik u `reactive` qutiga tushib qolsa ham baribir reaktiv bo'lmasdan xavfsiz qolaveradi.

**2. `customRef` nima? Uni Debounce uchun qanday ishlatish mumkin?**
*Javob:* Agar ref ning get va set jarayonlarini o'zimiz boshqarmoqchi bo'lsak, `customRef` ishlatamiz.
```javascript
export function useDebouncedRef(value, delay = 200) {
  let timeout
  return customRef((track, trigger) => {
    return {
      get() {
        track() // UI ulanganini bildirish
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger() // UI ga chizishni aytish
        }, delay)
      }
    }
  })
}
```

---

## Xulosa

| Reaktivlik Turi | Nima u o'zi? | Qachon ishlatiladi? | Kamchiligi |
|-----------------|--------------|---------------------|------------|
| **`ref()`** | Ixtiyoriy turdagi qiymatni kuzatuvchi Quti. | **Asosiy qoida sifatida - hamma joyda!** | JS faylida doim `.value` qo'shib yozish kerak. |
| **`reactive()`**| Faqat Obyekt/Massivni kuzatuvchi Oyna. | O'ta katta formalar va ko'p parametrli obyektlarda. | Destructure (parchalash) yoki tenglashtirish (reassign) qilinganda buzilib qoladi. |
| **`toRefs()`** | `reactive` dan olingan narsani qutiga (`ref`ga) aylantiruvchi vosita | `reactive` obyektdan qiymatlarni ajratib olayotganda aloqani uzmaslik uchun. | Har bir xossaga `ref` yasagani uchun sal performance oladi. |
| **`shallowRef()`**| Faqat ustki (`.value`) qatlamni kuzatadi, ichkarini emas. | Minglab elementlari bor massivlarni yoki Grafik kutubxona obyektlarini saqlashda. | Ichki o'zgarishni avtomatik sezmaydi. |
