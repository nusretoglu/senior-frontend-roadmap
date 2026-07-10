# Memory Management (Xotira Boshqaruvi)

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturingiz qancha uzoq ishlasa, shuncha ko'p xotira (RAM) talab qila boshlaydi. JS da xotirani siz qo'lda boshqarmaysiz, buni avtomatik tarzda *Garbage Collector (Axlat yig'ishtiruvchi, GC)* bajaradi. Lekin GC ko'r-ko'rona ishlamaydi. U faqat sizga endi "kerak bo'lmay qolgan" (hech qayerdan havola qilinmagan - unreachable) narsalarnigina tozalaydi. Agar siz esdan chiqarib o'chib ketgan DOM elementini ob'ekt ichida saqlab qo'ysangiz yoki timer'larni o'chirmasangiz, GC ularni "hali ham kerak" deb o'ylab tozalolmaydi. Buni **Memory Leak (Xotira sizib chiqishi)** deyiladi va oxir-oqibat u brauzerni qotirib, qulatib yuboradi.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
- **Garbage Collector (GC):** Xotirani tekshirib, ishlatilmay qolgan ma'lumotlarni o'chirib, RAM ni bo'shatadigan ichki dastur.
- **Memory Leak:** Dastur ishlashi davomida xotiraning to'lib borishi va oxiri dastur qotib qolishi.

### Nima uchun kerak?
Kompyuterda cheksiz xotira yo'q. Dastur tez ishlashi uchun eskirgan o'zgaruvchilarni tozalab, yangilariga joy hozirlash kerak.

> [!NOTE]
> **Hayotiy o'xshatish: "Restoran stoli va Ofitsiant"**  
> Mijoz restoranga kelib stulga o'tirdi (Variable yaratildi, Xotira band bo'ldi). U ovqatlandi va o'rnidan turib ketdi (Xotiraga ehtiyoj qolmadi).
> **Garbage Collector (Ofitsiant)** stol bo'shaganini ko'rgach, kelib idishlarni yig'ishtirib oladi (Xotirani tozalash). Lekin mijoz sumkasini stulga tashlab ketsa, ofitsiant "Bu stol hali band ekan" deb unga tegmaydi. Agar shunday qilib hamma stullarga sumka tashlab ketilsa, restoranda bo'sh joy qolmaydi (Memory Leak) va yangi mijozlar kela olmaydi!

### Sodda Misol

```javascript
// 1. Allocation (Xotira ajratish)
let foydalanuvchi = { ism: "Ali" }; 

// 2. Use (Ishlatish)
console.log(foydalanuvchi.ism);

// 3. Release (Xotirani bo'shatish uchun tayyorlash)
foydalanuvchi = null; 
// Endi { ism: "Ali" } ob'ektiga hech qanday havola (silka) qolmadi.
// Garbage Collector (Ofitsiant) kelib uni axlatga tashlab yuboradi.
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Qanday ishlaydi? (Mark-and-Sweep algoritmi)
JavaScript dvigateli (V8) **Mark-and-Sweep (Belgilash va Tozalash)** degan algoritm asosida ishlaydi.
1. **Root (Ildizlar):** Eng asosiy ob'ektlar (`window` yoki Global state) dan boshlaydi.
2. **Mark (Belgilash):** Shu ildizdan borish mumkin bo'lgan (reachable) barcha ob'ektlarni topib ustiga "kerakli" deb belgi uradi.
3. **Sweep (Tozalash):** Belgilanmagan (unreachable) ob'ektlarning barchasini xotiradan tozalab yuboradi.

### Ko'p uchraydigan xatolar (Memory Leaks qanday kelib chiqadi?)

**1. O'chirilmagan Interval va Timers**
Agar komponentingiz o'chib ketsa ham (masalan boshqa sahifaga o'tsangiz), `setInterval` ishlab yotaveradi.
```javascript
// XATO: 
function Boshlash() {
  const kattaData = new Array(100000);
  setInterval(() => {
    console.log("Men ishlayapman", kattaData.length);
  }, 1000);
}

// TO'G'RI: Tozalash
function Boshlash() {
  const kattaData = new Array(100000);
  const timer = setInterval(() => { ... }, 1000);
  
  // Qachondir o'chirish kerak!
  clearInterval(timer);
}
```

**2. DOM Elementlarga qolib ketgan havolalar**
React yoki oddiy JS da DOM ni ekrandan o'chirasiz, lekin u JS ob'ekti ichida qolib ketadi.
```javascript
let myElement = document.getElementById('button');
document.body.removeChild(myElement); // Ekrandan ketdi!

// Lekin GC uni axlatga tashlay olmaydi, chunki "myElement" variable ushlab turibdi.
myElement = null; // Mana endi toza bo'ldi.
```

**3. O'chirilmagan Event Listenerlar**
```javascript
function tingla() {
  // Sahifadan chiqib ketsak ham bu listener RAMni band qilaveradi
  window.addEventListener('scroll', scrollFunc); 
  
  // Yechimi: window.removeEventListener('scroll', scrollFunc) ni chaqirish
}
```

### Keng tarqalgan real use-caselar (WeakMap & WeakSet)
Agar siz ob'ektni xotirada qulflab qolishni (memory leak) xohlamasangiz, `WeakMap` yoki `WeakSet` dan foydalanasiz.
- `Map`: Agar kalit ob'ekt bo'lsa, GC uni hecham o'chira olmaydi.
- `WeakMap`: Agar kalit ob'ekt ekrandan / boshqa joydan o'chib ketsa, GC u ob'ektni bemalol axlatga tashlayveradi.

## Eng Yaxshi Amaliyotlar (Best Practices)
- **Global o'zgaruvchilardan qoching:** Har doim `let` va `const` ishlating (chunki window da qolgan narsa dastur yopilguncha yashaydi).
- **Cleanup funksiyalar yozing:** React ning `useEffect` hook'ida `return () => {}` qismida timer, listener va WebSockket larni tozalab chiqing.
- **Chrome DevTools ishlatish:** Xotira qayerdan teshilib (leak bo'lib) qolganini ko'rish uchun Chrome inspektordagi `Memory` tabiga kirib `Take Heap Snapshot` tugmasini bosing.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### "Under the hood" (Qopqoq ostida nimalar ro'y beradi)
JavaScript xotirani ikkiga bo'ladi: **Stack** va **Heap**.
1. **Stack (Statik):** `Number`, `String`, `Boolean` kabi primivit tipdagi o'zgaruvchilar aniq baytga ega bo'lgani uchun tezkor Stack xotirada saqlanadi. Funksiya ishlashni tugatishi bilanoq stack avtomatik tozalanadi. (GC ga ehtiyoj yo'q).
2. **Heap (Dinamik):** `Object`, `Array`, `Function` kabi katta hajmli narsalar Heap da saqlanadi. Stackda faqat ularning "manzili (pointer/reference)" turadi. GC asosan mana shu Heap xotirani tekshirib tozalaydi.

### V8 ning GC arxitekturasi (Generational Hypothesis)
V8 GC si xotirani avlodi (yoshi) bo'yicha 2 ga bo'ladi:
- **New Space (Yoshlar):** Yangi yaratilgan hamma ob'ektlar shu yerga tushadi. Yoshlar joyi juda kichkina bo'ladi va tez-tez (Scavenger algoritmi yordamida) tekshirilib turiladi. Chunki yozilmagan qoidaga ko'ra: *"Ko'p ob'ektlar yaratilgan zahoti tezda o'ladi"*.
- **Old Space (Keksalar):** Agar ob'ekt 2 martadan ortiq tozalashdan eson-omon o'tib qolsa (demak u doimiy kerakli narsa), u Old Space ga o'tkaziladi. Bu yer juda kam tekshiriladi (Mark-and-Sweep orqali) va jarayon biroz vaqt (dastur qotishi) oladi.

### FinalizationRegistry (ES2021 Advanced Feature)
Bu yordamida ob'ekt axlatga yuborilganini (GC ishlaganini) aniqlab olish mumkin.
```javascript
// GC ishlasa qachondir xabar beradi
const registry = new FinalizationRegistry((xabar) => {
  console.log(`Garbage Collector ishladi: ${xabar}`);
});

function yasa() {
  let ob = { data: "Juda katta data" };
  registry.register(ob, "Ob'ekt o'ldi!");
}

yasa();
// Qachondir GC aylanib kelsa, "Ob'ekt o'ldi!" yozuvi consolga chiqadi.
```

### Intervyu Savollari (Qiyin daraja)
**1. Circular Reference (Aylanma bog'liqlik) bo'lsa GC tozalay oladimi?**
*Javob:* Ha. Eskirgan IE6 dagi (Reference Counting) algoritmlarda bu memory leak ga olib kelardi. Zamonaviy V8 (Mark-and-Sweep) da, agar A ob'ekt B ni, B ob'ekt A ni ushlab turgan bo'lsa ham, lekin Global Root dan ularga yo'l yo'q bo'lsa, GC ikkalasini bittada tozalab tashlaydi.

**2. Closure lar qanday qilib memory leak ga olib kelishi mumkin?**
*Javob:* Agar outer (tashqi) funksiyada juda katta xotira oluvchi ob'ekt bo'lsa va siz qaytargan inner (ichki) funksiya shu ob'ektga reference (silka) ushlab tursa, closure yashaguncha u katta ob'ekt ham o'lmaydi. Yechim: inner funksiya ichida ob'ektning faqat kerakli qisminigina oddiy o'zgaruvchiga olib (masalan: `const count = obj.length`), katta ob'ektni `null` qilib yuborish kerak.

### Vizualizatsiya (Heap va Stack)
```mermaid
graph LR
    subgraph Stack [Stack Memory (Tez va Avto tozalash)]
        Prim[Primitivlar<br/>let yosh = 25]
        Ref[Pointers<br/>let user = ●]
    end
    
    subgraph Heap [Heap Memory (Katta hajmli, GC yordamida tozalash)]
        Obj[Ob'ektlar<br/>{name: 'Ali'}]
        Arr[Massivlar<br/>1, 2, 3]
    end
    
    Ref -->|Pointer (Reference)| Obj
    
    style Stack fill:#e3f2fd,stroke:#1565c0
    style Heap fill:#fff3e0,stroke:#e65100
```

---

## Xulosa

| Daraja | Yondashuv va Fokus | Nimalarga qodir bo'lish kerak? |
| --- | --- | --- |
| **Junior** | **Mantiq:** GC o'zi ishlashini biladi. | Ob'ektlarning ishlatilmay qolgani va "null" qilib tozalanishini tushunadi. |
| **Middle** | **Qo'llash:** Memory Leak teshiklarini topadi. | React/Vue da component o'chganda (unmount), timer va listenerlarni tozalashni (cleanup) unutmaydi. Closure dagi havflarni biladi. |
| **Senior** | **Arxitektura & V8:** V8 Heap/Stack modelini, Old va New Spacelarni tushunadi. | Katta hajmga ega JS arxitekturalarida WeakMap yordamida state boshqaradi. Chrome DevTools orqali Memory Leaks diagnostika va profilaktikasini qila oladi. |
