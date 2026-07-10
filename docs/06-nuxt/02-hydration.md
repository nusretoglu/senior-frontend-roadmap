# Hydration

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Agar siz "Hydration Mismatch" degan yashil/qizil xatoni ko'rgan bo'lsangiz, demak bu bo'lim aynan siz uchun. Hydration - Nuxt yoki Next.js dagi eng sehrli, shu bilan birga eng asabni buzadigan jarayon. Server chizib bergan o'lik HTML sahifani "tiriltirish" (Reactivity va Event Listenerlarni ulash) amaliyotini Hydration deb ataymiz. Buni tushunmaslik "Nega DOM taglarim takrorlanib qolyapti?" degan savolni tug'diradi.

> [!NOTE]
> **Real-hayot analogiyasi: "Skelet va Ruh (Jon berish)"**  
> - **Server:** Shifokor odamning suyaklari va terisini qotirib bitta "Skelet" yasadi va yubordi. Bu **Static HTML** (u o'lik, bossangiz hech narsa qilmaydi, faqat ko'rinishi odamga o'xshaydi).
> - **Brauzer:** Bu skeletni darhol mijozga ko'rsatadi (FCP zo'r!).
> - **Hydration:** Endi "Ruh" uchib keladi (JavaScript) va bu skeletning har bir uzvini tanib chiqib, qon yugurtiradi (Event Listeners ulaydi). Shundan keyingina u qo'lini qimirlata oladigan haqiqiy insonga aylanadi.
> **Hydration Mismatch:** Agar server "O'ng qo'li tepada bo'lsin" deb skelet yasagan bo'lsa-yu, ruh uchib kelib "Yo'q, o'ng qo'l pastda bo'lishi kerak" deb tortishsa, "Hydration Mismatch" (Mos kelmaslik) xatosi kelib chiqadi. Ikkalasi bir xil narsani ko'rishi shart.

Hydration - bu SSR'da server tomonidan yaratilgan statik HTML'ni client'da (brauzerda) interaktiv Vue ilovasiga aylantirish jarayoni. Bu jarayon to'g'ri tushunilmasa, unumdorlik (performance) muammolari va xatolar (buglar) kelib chiqadi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

### Hydration O'zi Nima?

Hydration so'zi "suv qo'shish" degan ma'noni anglatadi. Server'dan kelgan "quruq" HTML'ga JavaScript "suv qo'shib" uni jonli (interaktiv) qilish jarayonidir.

```mermaid
sequenceDiagram
    participant Browser
    participant Server
    
    Browser->>Server: URL ga so'rov
    Server-->>Browser: 1. Tayyor HTML + State (window.__NUXT__) yuboradi
    Note over Browser: Foydalanuvchi darhol HTML ni ko'radi<br/>Lekin u o'lik (bosish ishlamaydi)
    Browser->>Browser: 2. JavaScript (JS) fayllarni yuklaydi
    Browser->>Browser: 3. HYDRATION boshlanadi
    Note right of Browser: - Virtual DOM quriladi<br/>- Haqiqiy DOM bilan solishtiriladi<br/>- Event Listener'lar ulanadi
    Note over Browser: Sahifa endi to'liq interaktiv!
```

### Hydration vs Re-render (Qayta chizish) farqi

**HYDRATION (To'g'ri):**
Brauzer server bergan tugmani (`<button>Count: 0</button>`) o'chirib yubormaydi, balki o'shani o'ziga `@click` quloqchinini ilib qo'yadi. DOM element *SAQLANADI*, faqat xulq-atvor qo'shiladi. Bu juda tez ishlaydi.

**RE-RENDER (Noto'g'ri - xato bo'lganda):**
Agar serverdagi ma'lumot (Count 0) va Brauzerdagi ma'lumot (Count 1) farq qilsa, Vue: "Eh, xato ketibdi, boshqadan yasaymiz!" deydi va Server bergan HTML ni O'CHIRIB tashlab, yangidan HTML element yaratadi. Bu qimmat va sekin jarayon.

---

## 🟡 Middle (Amaliyot va Detallar)

### Hydration Mismatch Xatolari va Ularning Yechimi
Eng keng tarqalgan muammo - server va client HTML'i farq qilganda paydo bo'ladi.

**Sabablari:**
1. **Sana va Vaqt:** Serverda rendering bo'lgan vaqt bilan, mijoz brauzerida sahifa ochilgan vaqt doim farq qiladi.
2. **Random:** Tasodifiy raqam yasaydigan kodlar.
3. **Browser API:** Faqat brauzerda bor bo'lgan narsalar (`window.innerWidth`, `localStorage`).

**Noto'g'ri yondashuv (Mismatch kelib chiqadi):**
```vue
<template>
  <div>
    <!-- Server va Client doim har xil raqam qaytaradi -->
    <span>{{ Math.random() }}</span>

    <!-- Server: 10:30:00, Client: 10:30:05 -->
    <span>{{ new Date().toISOString() }}</span>

    <!-- Serverda 'window' yo'q (Crash/Mismatch) -->
    <span>{{ window.innerWidth }}</span>
  </div>
</template>
```

**To'g'ri yondashuv (`<ClientOnly>` yoki onMounted):**
```vue
<template>
  <div>
    <!-- Bu qism serverda umuman chizilmaydi, faqat Client qismi o'ziga oladi -->
    <ClientOnly>
      <span>{{ Math.random() }}</span>
      <span>{{ windowWidth }}</span>

      <!-- Server nima chiqarishi kerak bo'lsa uni fallback ichiga yozasiz -->
      <template #fallback>
        <span class="skeleton">Yuklanmoqda...</span>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const windowWidth = ref(0)

// Faqat brauzerda (Client) ishga tushadi
onMounted(() => {
  windowWidth.value = window.innerWidth
})
</script>
```

### Double Fetch (Ikki marta tortish) Muammosi
Ma'lumotlar server'da bitta fetch qilinsa-yu, client'ga kelgach yana API dan qayta fetch qilinsa - bu isrofgarchilik. Nuxt da bu yechilgan.

`useFetch` dan foydalansangiz, Nuxt serverda APIdan ma'lumotni oladi, HTML ni yasaydi, va shu olingan JSON ni HTML ichiga yashirib qo'yadi (`window.__NUXT__`). Mijoz uni ochganda qayta API chaqirib o'tirmaydi, tayyor JSON dan foydalanib yuboradi. Shuning uchun standart fetch o'rniga doim `useFetch` ishlating!

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### Noto'g'ri HTML sababli Mismatch
Hydration mismatch faqatgina data larning xatoligi tufayli emas, balki HTML qoidalarining buzilishi sababli ham yuz beradi.

Masalan:
```vue
<!-- SSR dagi kod -->
<p>
  Mana bu matn <div>va uning ichidagi blok</div>
</p>
```
Server buni xuddi shunday jo'natadi. Brauzer esa aqlli, u biladiki `p` (paragraf) ichida blok darajasidagi `div` yozilishi mumkin emas! Brauzer HTMLni parse qilish jarayonida darhol bu xatoni to'g'rilab `div` ni `p` dan tashqariga irg'itadi. Endi Vue Virtual DOM ni Haqiqiy DOM bilan solishtirmoqchi bo'ladi:
**Vue:** "Iya, mening qog'ozimda `div` ichkarida edi, nega u tashqariga chiqib qoldi?"
Natijada **Hydration Node Mismatch** xatosi kelib chiqadi! Har doim Semantik to'g'ri HTML yozing!

### Qisman Hydration (Partial Hydration) / Lazy Hydration
Sahifada juda katta kod/grafika bo'lsa, foydalanuvchi qachon o'sha ekranga tushmaguncha uni Hydrate qilishni kechiktirib turish (Lazy) saytning First Load performance sini keskin oshiradi.

```vue
<!-- components/HeavyComponent.vue -->
<script setup>
const isVisible = ref(false)

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    isVisible.value = true // Foydalanuvchi ko'rganida ishga tushir
    observer.disconnect()
  }
})

const el = ref()

onMounted(() => {
  if (el.value) observer.observe(el.value)
})
</script>

<template>
  <div ref="el">
    <template v-if="isVisible">
      <!-- Haqiqiy og'ir komponent shu yerda turadi -->
      <ActualHeavyContent />
    </template>
    <template v-else>
      <div class="placeholder">Yuklanmoqda...</div>
    </template>
  </div>
</template>
```

### Intervyu Savollari (Qiyin daraja)
**1. Hydration nima va nima uchun kerak?**
*Javob:* Hydration - SSR'da server tomonidan yaratilgan o'lik (statik) HTML'ni client'da JS orqali interaktiv Vue application'ga aylantirish (Event listener larni ulash) jarayoni. Busiz tugmalar ishlamaydi, formalar yuborilmaydi. U qisqa FCP (Tez ko'rinish) va SEO uchun muhim.

**2. useFetch va oddiy fetch farqi nima? Hydration bilan qanday bog'liq?**
*Javob:* Agar Nuxt da SSR da oddiy `fetch` ishlatsangiz, server uni o'qib ma'lumotni oladi, mijoz brauzeriga bergach u qism YANA o'sha fetch ni chaqirib API ga nagruzka (Double Fetch) beradi. `useFetch` esa SSR da bir marta ishlaydi, olingan javobni (JSON) payload orqali HTML orqasida browser ga berib yuboradi. Browser HTMLni o'qiyotganda "Bo'ldi, mana data kelibdi, API ni qayta chaqirmayman" deb resursni tejab qoladi.

**3. Hydration performance ni qanday optimize qilasiz?**
*Javob:* 1. Sahifadagi og'ir (masalan, sahifa oxiridagi grafikalar) elementlarni Lazy Hydrate qilaman. 2. `useFetch` ichida faqat o'zimga kerakli qismlarni (`transform` orqali) olib qolaman, bo'lmasa 10MB lik Data Payload ga aylanib HTML hajmini oshirib yuboradi. 3. Faqat serverda ishlaydigan sahifalar/router lar uchun `ssr: false` qilib qo'yaman (Admin panellar).

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Vaqt va Tasodifiylik:** Component ichida hech qachon `new Date()`, `Math.random()`, `uuid()` ishlata ko'rmang, chunki bu funksiyalar serverda bir xil, mijozda boshqa xil qiymat qaytaradi va Hydration Mismatch ga olib keladi.
2. **Qora quti (`<ClientOnly>`):** Agar qandaydir uchinchi tomon kutubxonasi (Masalan Carousel, Chart.js) document/window bilan ishlasa, uni har doim `<ClientOnly>` komponentiga o'rab qo'ying, shunda server uni umuman chizishga urinib ko'rmaydi.
3. **Semantik HTML:** `<p>` ichida `<div>` ochib qo'yish kabi oddiy HTML qoidalari buzilishlari ham hydration xatolariga olib kelishi mumkin. Brauzer yomon HTML ni o'zicha tuzatib (masalan, `div` ni `p` dan tashqariga chiqarib) oladi, Vue Virtual DOM esa hali ham eski xato HTML ni ko'radi - natijada Mismatch! HTML qoidalariga jiddiy rioya qiling.
4. **State boshqaruvi:** Agar SSR ishlatilayotgan bo'lsa Nuxt ning `useState` idan foydalaning, u server va mijoz o'rtasida reaktiv ma'lumotni saqlab bera oladigan xavfsiz (hydration-safe) usuldir.

---

## Xulosa

| Tushuncha | Ma'nosi | Asosiy Qoidasi |
|-----------|---------|----------------|
| **Hydration** | Serverdan kelgan quruq HTML ni interaktiv Vue ga aylantirish | Server va Client aynan bir xil kod yaratishi shart |
| **Mismatch** | Server va Client o'rtasidagi kelishmovchilik (HTML farq qilishi) | Tasodifiy qiymatlar (`Math.random`, date) va notog'ri HTML yozish sabab bo'ladi |
| **Double Fetch** | Ham server, ham client da bitta API ga so'rov jo'natish | Nuxt dagi `useFetch` dan foydalaning (u o'zi keshlash orqali buni hal qiladi) |
| **`<ClientOnly>`** | Faqat Brauzerda ishlaydigan kodlarni ajratish | Agar kutubxona `window` kabi default brauzer API larini ishlatsa, shu komponent ichida yoziladi |

Hydration muammolarini debug qilish uchun Vue DevTools va browser console warnings'ga e'tibor bering. SSR bilan ishlayotganda Hydration jarayoni eng nozik qismdir va buni tushungan dasturchi o'ta yuqori darajadagi mutaxassis hisoblanadi.
