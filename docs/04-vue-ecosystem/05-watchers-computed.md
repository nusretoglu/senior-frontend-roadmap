# Watchers va Computed Properties - Reaktiv Hisoblashlar

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturlashda ko'pincha bitta ma'lumotning o'zgarishi boshqalariga ham ta'sir qilishi kerak bo'ladi. Agar hisob-kitoblarni oddiy metodlar orqali qilsangiz, ular keraksiz marta qayta ishlayveradi (performance muammosi). `computed` va `watch` - bu qachon va qanday qilib o'zgarishlarga reaksiya bildirishni aniq boshqarishga imkon beradigan eng kuchli qurollardir.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Computed** (Hisoblanuvchi) — Mavjud o'zgaruvchilar ustida qandaydir hisob-kitob bajarib, o'zidan bitta tayyor qiymat qaytaradigan quti.
**Watch** (Kuzatuvchi) — Qaysidir o'zgaruvchi o'zgarsa, uyg'onib ketib biror ish (funksiya) bajarib yuboradigan poyloqchi.

> [!NOTE]
> **Hayotiy o'xshatish: "Soliqchi va Jurnalist"**  
> - **Computed (Soliqchi):** U faqat sizning sof daromadingiz (unga kerakli ma'lumot) o'zgarsagina soliqlaringizni qayta hisoblab chiqadi. Agar ismingiz o'zgarsa, u soliqlarni qayta hisoblamaydi. Hisoblash oxirida doim yangi qiymat (summa) qaytaradi.
> - **Watch (Jurnalist):** Sizning har bir harakatingizni kuzatib turadi. Agar siz mashina sotib olsangiz, u salkam doston yozib yuboradi, yangiliklar tarqatadi (API chaqiradi) yoki boshqa "side-effect" larni bajaradi. U albatta qandaydir qat'iy qiymat qaytarishi shart emas.

### Sodda Misol
```vue
<script setup>
import { ref, computed, watch } from 'vue'

const ism = ref("Ali")
const familiya = ref("Valiyev")
const til = ref("uz")

// COMPUTED: Ism va Familiyani qo'shib yaxlit qaytaradi
const toliqIsm = computed(() => {
  return `${ism.value} ${familiya.value}`
})

// WATCH: "til" o'zgaruvchisini kuzatamiz
watch(til, (yangiTil) => {
  console.log(`Foydalanuvchi tilni o'zgartirdi: ${yangiTil}`)
  // Backendga so'rov jo'natamiz
})
</script>

<template>
  <h1>{{ toliqIsm }}</h1>
</template>
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Keshlanish mo'jizasi (Caching)
Nima uchun template da `filterlanganObyektlar()` deb oddiy metodni ishlatsak bo'lmaydimi?
Bo'ladi. Lekin sahifada masalan "yosh" o'zgaruvchisi +1 ga oshsa, sahifa qayta render bo'ladi va `filterlanganObyektlar()` qanaqadir yirik massiv ichidan o'ziga umuman tegishli bo'lmasa ham qaytadan filterlash ishlarini bajaradi. `computed` ishlatsangiz, Vue uni ichidagi datalar (items.value) ga qarab, o'zgarmaganini sezib tayyor eski natijani qaytarib beradi. Bu dasturni million marta tezlashtiradi.

### Getter va Setter
Computed faqat nimanidir o'qib beruvchi emas, qiymat qabul qiluvchi o'zgaruvchiga aylanishi ham mumkin. Buni v-model da ishlatsa bo'ladi.
```javascript
const narxDollar = ref(10)

const narxSom = computed({
  get() { // O'qish (Dollar -> So'm)
    return narxDollar.value * 12500
  },
  set(yangiSom) { // Yozish (So'm -> Dollar)
    narxDollar.value = yangiSom / 12500
  }
})
```

### Ko'p uchraydigan xatolar (Pitfalls)
**Computed ichida "Side Effect" yaratish**
Computed ichida API ga zapros jo'natish, LocalStorage ga narsa yozish yoki qanaqadir arrayni teskari qilib (reverse qilib originalini buzib qo'yish) QATIYAN TAqiqlanadi! Computed mutloqo "Toza" (Pure function) bo'lishi kerak.
```javascript
// YOMON
const yoshlar = computed(() => {
  return array.value.sort() // Mutatsiyaga uchradi!
})

// YAXSHI
const yoshlar = computed(() => {
  return [...array.value].sort() // Yangi massivga ko'chirib oldik
})
```

## Eng Yaxshi Amaliyotlar (Best Practices)
1. **Imkon boricha Computed ishlating:** Ko'pchilik o'zgaruvchini kuzatib (`watch` qilib) unga qarab boshqa o'zgaruvchiga ma'lumot yozib qo'yishni odat qilgan. Buning o'rniga to'g'ridan-to'g'ri `computed` ishlatsa, kod qisqa va bug'larsiz bo'ladi.
2. **Watch dagi "Immediate" xossasi:** Sahifa ochilishi bilanoq ham `watch` ning ichidagi mantiq 1 marta darhol ishlab ketishi uchun ungacha qiyin yo'llar qidirmasdan `{ immediate: true }` opsiyasini yozib yuborish kifoya.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### Avtomatik kuzatuvchi (`watchEffect`)
Vue 3 da oddiy `watch` bilan bir qatorda `watchEffect` kiritildi. Qaysi o'zgaruvchini kuzatayotganingizni aniq aytishingiz kerak bo'lgan `watch` dan farqli o'laroq, `watchEffect` ning ichiga yozilgan har qanday reaktiv o'zgaruvchini Vue avtomatik tarzda o'zi ulap oladi va kuzatishni boshlaydi. Shuningdek, u har doim Immediate (sahifa yuklanganda) ishlaydi. Bu React dagi `useEffect` ga juda o'xshaydi, lekin Dependency Array larsiz (xavfsizroq)!

```javascript
import { ref, watchEffect } from 'vue'
const poytaxt = ref("Toshkent")

watchEffect(() => {
  // Vue avtomatik tarzda bu blok "poytaxt"ga tobe ekanini sezadi
  // Uni alohida ko'rsatish shart emas
  fetch(`/api/weather?city=${poytaxt.value}`)
})
```

### Katta ob'ektlar bilan muammo (Deep Watch)
Aytaylik, sizda xotirasida minglab ma'lumoti bor "Obyekt" (Dictionary kabi) bor. Siz uni `watch(() => bigObject, callback, { deep: true })` qilsangiz, Vue ob'ektning minglab parametrlariga bittadan rekursiv tarzda kirib kuzatuv o'rnatib chiqadi. Bu esa Brauzerni tamomlaydi.
Yechim: Faqat aniq yo'lni (path) kuzating.
```javascript
// SENIOR YONDASHUV
watch(() => bigObject.value.settings.theme, (theme) => {
  console.log("Faqat tema o'zgarganda ishlaydi")
})
```

### Intervyu Savollari (Qiyin daraja)
**1. `watchEffect` qachon ishlaydi: DOM yangilanishidan oldinmi yoki keyinmi (`flush` opsiyasi nima)?**
*Javob:* Odatda, `watchEffect` ham, `watch` ham Vue da DOM yangilanishidan (render) **oldin** ishga tushadi. Agar siz ichida sahifadagi qaysidir `<div>` ning kengligini o'lchamoqchi bo'lsangiz, u hali DOM da chizilmagani uchun xato olasiz. Shunday paytda Vue sizga uchinchi parametr `flush: 'post'` ni taklif qiladi (yoki tayyor `watchPostEffect` dan foydalansa ham bo'ladi).

**2. Asinxron amaliyotlarda (API call lar ulanib ketsa) qanday qilib yig'ishtirib olish (Cleanup) amalga oshiriladi?**
*Javob:* Odamlar qidiruv (Search) yozayotganda tez-tez xarflarni terishadi. Har bir harfda watch ishga tushib API ga so'rov jo'nataveradi (Race Condition muammosi yuzaga keladi - oxirgi jo'natilgan so'rov emas, serverdan eng sekin kelgan xato javob birinchi bo'lib qoladi). 
Buning uchun `watch` da `onCleanup` funksiyasi qabul qilinadi. Har gal yangi watch yurganda u eskisini o'ldiradi. Backendga jo'natilgan so'rovlarni abort qilish uchun `AbortController` o'sha `onCleanup` orqali ulap qo'yiladi.
```javascript
watch(query, async (yangi, eski, onCleanup) => {
  const tormoz = new AbortController()
  onCleanup(() => tormoz.abort()) // Keyingi watch kelsa oldingisini o'ldir
  await fetch(`.../?q=${yangi}`, { signal: tormoz.signal })
})
```

---

## Xulosa

| Vosita | Nima u o'zi? | Qachon ishlatiladi? | Asosiy cheklovlar |
|--------|--------------|---------------------|-------------------|
| **Computed** | Hisoblab tayyor qiymat beruvchi quti | Template da nimanidir tozalab, filterlab ekranga chiqarishda | Ichida ma'lumotni o'zgartirmang (mutatsiya va Side-effect mumkin emas). |
| **Watch** | Kuzatuvchi poyloqchi | O'zgaruvchi o'zgarganda logikani yurgizish (API chaqirish, local storage'ga yozish) | Array yoki Obyektlarning ichini kuzatish uchun `deep: true` yoqilishi shart. |
| **watchEffect**| Avtomatik kuzatuvchi poyloqchi | Kichik va murakkab logikalarda, kuzatilishi kerak bo'lgan datalar soni ko'p bo'lsa | Eski (oldValue) qiymatni bilish imkonsiz, u darhol (immediate) ishlaydi. |
