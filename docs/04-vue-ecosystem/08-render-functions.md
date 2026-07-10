# Render Functions - Template'siz Render

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchilar odatda Vue da UI ni `<template>` orqali yozishni yaxshi ko'rishadi. Lekin ba'zan shunday holatlar bo'ladiki, `v-if` va `v-for` ni o'n marta yozib chiqishga yoki moslashuvchan "UI kutubxonalar" yaratishga to'g'ri keladi. Shunday vaqtda to'g'ridan-to'g'ri JavaScript ishlatib DOM elementlarini yaratish (Render qilish) ancha moslashuvchan usul hisoblanadi.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Template** — Vue tushunadigan HTML ga o'xshash qolip (bu oson usul).
**Render Function** (`h()`) — JavaScript orqali HTML element (Node) yaratadigan funksiya (bu qiyin, lekin erkin usul).
**VNode (Virtual Node)** — JavaScript da yozilgan HTML ning "chizmasi" (maketi).

> [!NOTE]
> **Hayotiy o'xshatish: "Rassom va Mashina"**  
> Tasavvur qiling, sizga 10 xil mashina chizmasi kerak. `<template>` da ishlash — bu tayyor rangli stencillar (trafaretlar) orqali mashina chizishdek gap (juda qulay va tez). Lekin Render functions — bu qo'lga mo'yqalam olib uni toza oq qog'ozda erkin shaklda o'zingiz chizib chiqishga o'xshaydi. Oson emas, lekin erkinlik chegarasiz.

### Sodda Misol
Agar biz HTML da sarlavha yozmoqchi bo'lsak:
```html
<h1 class="salom">Salom Dunyo!</h1>
```
Xuddi shuni JavaScript da yozish uchun biz `h()` (HyperScript) funksiyasidan foydalanamiz. U uchta narsa so'raydi: Tegi, Atributlari va Ichidagi matni (yoki elementlari).

```vue
<script setup>
import { h } from 'vue'

// O'zimiz qo'lda Komponent yasaymiz
const Sarlavha = () => {
  return h(
    'h1', // Tegi
    { class: 'salom', id: 's1' }, // Atributlari
    'Salom Dunyo!' // Matni
  )
}
</script>

<template>
  <Sarlavha />
</template>
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Qachon ishlatish kerak?
Aytaylik, Ota komponentdan (props) kiritilgan raqamga qarab har xil Sarlavha (h1, h2, h3) chizmoqchisiz. `template` da buni yozish juda xunuk bo'ladi:
```vue
<!-- YOMON USUL (Template da) -->
<template>
  <h1 v-if="level === 1">Sarlavha</h1>
  <h2 v-else-if="level === 2">Sarlavha</h2>
  <h3 v-else-if="level === 3">Sarlavha</h3>
  <h4 v-else-if="level === 4">Sarlavha</h4>
</template>
```
Lekin aynan shu joyda `h()` funksiyasi o'zining kuchini ko'rsatadi:
```vue
<script setup>
import { h } from 'vue'

const DinamikSarlavha = (props) => {
  return h(
    `h${props.level}`, // Tegi avtomat yasaladi: h1, h2, h3...
    {},
    'Sarlavha'
  )
}
</script>

<template>
  <DinamikSarlavha :level="2" /> <!-- Ekranda <h2> chiziladi -->
</template>
```

### Ko'p uchraydigan xatolar (Pitfalls)
**1. Matn o'rniga HTML ni render qilish**
Agar `h()` uchinchi parametr sifatida oddiy matn emas, html string bersangiz xato bo'ladi.
```javascript
// XATO: <span> matn bo'lib ekranga chiqib qoladi
h('div', {}, '<span>Salom</span>') 

// TO'G'RI: Ichma-ich h() qilinadi
h('div', {}, [
  h('span', {}, 'Salom')
])
```

**2. Hodisalar (Events) qo'shish**
Vue da onclick degan narsa `onClick` ko'rinishida va faqat camelCase da yozilishi shart.
```javascript
h('button', { 
  onClick: () => console.log('Bosildi!'),
  onMouseover: () => console.log('Sichqoncha keldi')
}, 'Meni bos')
```

## Eng Yaxshi Amaliyotlar (Best Practices)
1. **Faoliyatni murakkablashtirmang:** Agar qaysidir ishni oddiy `<template>` bilan qilish iloji bo'lsa, uni albatta template da qiling! Render funksiyalar kodning "o'qilishini" qiyinlashtiradi.
2. **JSX haqida o'ylab ko'ring:** Agar loyihangizda Render Function ko'p bo'lsa, uni tinimsiz `h('div', ...)` tarzida yozishdan ko'ra, Vue JSX ni yoqing. Shunda xuddi React dagiga o'xshab osonroq kod yozasiz.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### Virtual DOM nima qilib beradi o'zi?
Browserning Haqiqiy (Real) DOM i bilan ishlash juda sekin va qimmat turadi. Shuning uchun Vue memory (xotira) da yengil qilib **VNode (Virtual Node)** degan obyektlar daraxtini yasaydi. Siz qaysidir matnni o'zgartirsangiz, u eski Daraxt bilan yangisini tezda solishtiradi (Diffing algoritm) va HAQIQIY DOM ni faqatgina o'zgargan kichik burchagini yangilab qo'yadi. Mana nima uchun h() funksiyasi "VNode" (Virtual Node) qaytaradi deymiz.

### Functional Components
Stateless (data si yo'q, lifecycle hooklari yo'q) bo'lgan, faqat "props" olib html qaytaruvchi kichkina UI qismlarini Vue da "Functional Components" deyiladi.
```javascript
import { h } from 'vue'

// Bu oddiy JavaScript funksiya xolos. (Instance yaratilmaydi)
function Badge(props) {
  return h('span', { class: `badge-${props.rang}` }, props.matn)
}

// Bular xuddi Vue optionlari kabi
Badge.props = ['rang', 'matn']
export default Badge
```
Lekin Vue 3 da normal `<script setup>` komponentlari shunchalik tezlashtirib optimizatsiya qilinganki, endi ko'p hollarda "Functional Components" ishlatsangiz ham katta tezlik (performance) yutmaysiz.

### Intervyu Savollari (Qiyin daraja)
**1. Render function qachon albatta ishlatilishi kerak (Template yordam bermaydigan joylar)?**
*Javob:* 
- Juda murakkab "dinamik tag" generatsiya qilish kerak bo'lganda (`<component :is>` ham yetarli bo'lmagan vaziyatlar).
- Boshqa biror UI kutubxona yasayotganda, barcha komponentlarni universal o'rash uchun HOC (Higher-Order Components) yaratganda.
- Renderless Componentlar (Faqat logikani qaytaradigan komponentlar) da slotlardan keng foydalanganda.

**2. Slotlar `h()` funksiyasida qanday yoziladi?**
*Javob:* Render funksiyada "Slotlar" aslida ichida funksiyalari bor Obyektdir. Ularni chaqirish kerak xolos:
```javascript
export default {
  setup(props, { slots }) {
    // Agar <slot name="header"> bo'lsa:
    return () => h('div', [
      slots.header ? slots.header() : null, // Slot kiritilgan bo'lsa uni render qilamiz
      slots.default() // Asosiy kontent
    ])
  }
}
```

---

## Xulosa

| Yondashuv | Nima u? | Qachon ishlatiladi? |
|-----------|---------|---------------------|
| **Template (`<template>`)** | Oddiy HTML ga o'xshash, o'rganish oson, Vue orqali kompilatsiya qilinadigan qolip. | Deyarli 95% hollarda, oddiy va tushunarli UI yasash uchun. |
| **Render Function (`h()`)** | JS funksiyasi orqali Virtual DOM yaratish usuli. | Yozish qiyin bo'lgan murakkab dinamik logikalarda (masalan ixtiyoriy tag nomini yasash `h(tagName)`). |
| **JSX / TSX** | React ga o'xshab JavaScript ichida to'g'ridan to'g'ri HTML yozish imkoniyati. | Render funksiyalar yozishga majbur bo'lib qolsangiz, lekin `h()` ni o'qish asablaringizni buzganda. |
| **Functional Component** | Faqat `props` olib UI qaytaradigan davlatsiz (stateless) va lifecycle siz funksiya-komponent. | Ilova kattaligini biroz bo'lsada kamaytirish istalganda (Vue 3 da performance farqi deyarli yo'q). |
