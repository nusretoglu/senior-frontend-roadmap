# this Binding (Kontekst)

> [!IMPORTANT]
> **Nima uchun muhim?**  
> `this` JavaScript'ning eng ko'p chalkashliklar keltirib chiqaradigan va Intervyularda eng ko'p so'raladigan mavzusidir. U qaysi ob'ekt bilan ishlash kerakligini ko'rsatib beruvchi ko'rsatkich. Agar `this` nima ekanini to'g'ri tushunmasangiz, Vue, React Class Componentlari yoki oddiy vanilla JS da yozilgan DOM eventlaringiz hamisha qayergadir (masalan, `window` ga) xato qilib bog'lanib qolib, asabingizni egovlaydi.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**`this` (Bu / Men)** — JavaScript'da kod qaysi ob'ekt nomidan ishlayotganini bildiruvchi maxsus kalit so'z. Boshqa tillardan (masalan, Java) farqli o'laroq, JS da `this` qayerda yozilganiga qarab emas, qanday **chaqirilganiga** qarab o'zgaradi.

### Nima uchun kerak?
Bir xil funksiyani turli ob'ektlar uchun qayta-qayta yozavermasdan, bitta umumiy funksiyani turli ob'ektlarga moslashtirib ishlatish uchun kerak.

> [!NOTE]
> **Hayotiy o'xshatish: "Men o'zim"**  
> `this` inglizchada "bu narsa", bizning tildagi eng yaxshi ma'nosi esa "Men / O'zim" dir. 
> - Agar ko'chada oddiy odam "Men zo'rman!" desa, u o'zini nazarda tutyapti (`this = Global Window`).
> - Agar Apple kompaniyasidagi menejer yig'ilishda "Men zo'rman!" desa, u "Apple kompaniyasi zo'r" demoqchi bo'ladi (`this = Apple Object`).
> Ya'ni "Men" so'zining ma'nosi gapni KИM (qaysi ob'ekt) aytayotganiga qarab butunlay o'zgaradi!

### Sodda Misol

```javascript
const user = {
  ism: "Ali",
  salomlash: function() {
    // Bu yerda "this" user ob'ektiga teng
    console.log(`Salom, mening ismim ${this.ism}`); 
  }
};

user.salomlash(); // "Salom, mening ismim Ali"
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Qanday ishlaydi? (4 ta oltin qoida)
JavaScript'da `this` kimga tegishli ekanligini bilish uchun faqat bitta narsaga e'tibor qiling: **Funksiya qanday chaqirildi?**

**1. Implicit Binding (Avtomatik bog'lanish)**
Agar funksiya ob'ekt ichidan (nuqta orqali) chaqirilsa, `this` shu ob'ektga teng.
```javascript
const obj = { ism: 'Vali', chaqir() { console.log(this.ism) } };
obj.chaqir(); // "Vali"
```

**2. Explicit Binding (Majburiy bog'lanish: call, apply, bind)**
Biz kod orqali `this` kim bo'lishini o'zimiz majburlab ko'rsatishimiz mumkin.
```javascript
function kimman() { console.log(this.ism); }
const person = { ism: 'Hasan' };

kimman.call(person); // "Hasan"
kimman.apply(person); // "Hasan"
const yangiFunksiya = kimman.bind(person); // darhol ishlamaydi, kutadi
yangiFunksiya(); // "Hasan"
```

**3. New Binding (Yangi ob'ekt)**
Agar funksiya `new` kalit so'zi bilan chaqirilsa, `this` top-toza yangi ob'ekt `{}` ga teng bo'ladi.
```javascript
function User(ism) {
  this.ism = ism; // this = {}
}
const u = new User('Husan'); // u.ism = 'Husan'
```

**4. Default Binding (Standart / Xato)**
Agar yuqoridagi 3 tasi bo'lmasa, `this` global ob'ektga (`window`) qaratiladi. `strict mode` (qattiq rejim) yozilgan bo'lsa `undefined` bo'ladi.
```javascript
function oddiy() { console.log(this); }
oddiy(); // window (yoki undefined)
```

### Ko'p uchraydigan xatolar va muammolar (Pitfalls)

**1. Callbacklarda this ning yo'qolishi**
Eng mashhur xato `setTimeout` yoki DOM event handlerlarda ro'y beradi.
```javascript
const myObj = {
  name: "G'ishmat",
  greet() {
    // XATO: setTimeout o'zining ichidagi funksiyani window nomidan chaqiradi
    setTimeout(function() {
      console.log(this.name); // undefined
    }, 1000);

    // TO'G'RI: Arrow function (Yo'naltiruvchi) ishlatish
    setTimeout(() => {
      // Arrow funksiya o'zining 'this'ini yaratmaydi, tepadan (myObj) oladi!
      console.log(this.name); // "G'ishmat"
    }, 1000);
  }
};
myObj.greet();
```

**2. Arrow function ni metod sifatida ishlatish xatosi**
```javascript
const obj2 = {
  name: 'Toshmat',
  // XATO: Arrow function object metodida ishlatilsa tepaga, ya'ni window ga chiqib ketadi
  greet: () => { console.log(this.name) } 
};
obj2.greet(); // undefined
```

## Eng Yaxshi Amaliyotlar (Best Practices)
- **`class` yoki Ob'ekt metodlarini doim oddiy funksiyada yozing:** `metod() { ... }` ko'rinishida. Hech qachon metodni arrow function bilan boshlamang.
- **Asinxron callbacklarda doim Arrow Function ishlating:** `setTimeout`, `.map`, `.forEach` kabi ichki callbacklar beriladigan joyda tashqi kontekstni yo'qotmaslik uchun `() => {}` ishlating.
- **React Class Componentlari:** Agar React da class component ishlatsangiz, DOM eventlariga beriladigan funksiyalarni `onClick={this.handleClick.bind(this)}` kabi bind qiling yoki metodni arrow function sintaksisida yarating.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### "Under the hood" (Qopqoq ostida nimalar ro'y beradi)
V8 dvigateli `this` qanday bog'langanini tushunish uchun Execution Context (Bajarilish Konteksti) da `ThisBinding` qatorini tekshiradi. 
Arrow functionlar Lexical Scoping bilan ishlaydi. Ya'ni V8 kompilatsiyasi vaqtida ularga maxsus `ThisBinding` yaratilmaydi. Buning o'rniga dvigatel uni xuddi oddiy o'zgaruvchini qidirgandek (Closure orqali) outer environment (tashqi muhit) dan topadi. Shu sababli memory leak yoki kutilmagan object reference lar bilan ishlashda bind() dan ko'ra arrow functionlar xavfsizroq va tezroq ishlaydi.

### Xotira va Unumdorlik
`.bind(this)` ishlatganda nima bo'ladi?
`bind` har doim yangi funksiya ob'ektini (wrapper) yaratib, xotirada joy band qiladi. Agar siz listdagi 10,000 ta HTML elementning har birining click eventiga `.bind(this)` qilib chiqsangiz, xotirada 10,000 ta keraksiz funksiya nusxasi hosil bo'ladi.
```javascript
// Xavfli yechim (Memory leak xavfi bor)
elements.forEach(el => {
  el.addEventListener('click', this.handleClick.bind(this)); 
});

// Senior darajadagi yechim (Xotira tejaladi)
// Event Delegation yoki class field arrow function ishlating.
class Handlers {
  handleClick = (e) => { /* this avtomatik himoyalangan */ };
  bindEvents() {
    parentContainer.addEventListener('click', this.handleClick);
  }
}
```

### Intervyu Savollari (Qiyin daraja)
**1. Quyidagi kod qanday natija beradi?**
```javascript
const o = {
  name: 'Ali',
  greet() {
    return () => {
      console.log(this.name);
    };
  }
};
const fn = o.greet();
const o2 = { name: 'Vali' };
fn.call(o2);
```
**Javob:** Natija `Ali` chiqadi! Nega? Chunki `fn` bu arrow function. Arrow function ni `.call()`, `.bind()`, `.apply()` orqali ham umuman boshqarib yoki o'zgartirib bo'lmaydi. U o'zining Lexical `this`iga bir umrga qulflangan.

**2. Function borrowing nima?**
**Javob:** Boshqa ob'ektning funksiyasini olib, `.call()` yoki `.apply()` yordamida umuman boshqa ob'ektga qarzga berish. Array metodlarini oddiy NodeList larda ishlatish bunga zo'r misol.
```javascript
const ali = { pul: 100, xarjla(m) { this.pul -= m; } };
const vali = { pul: 50 };
ali.xarjla.call(vali, 10); // Vali'ning puli 40 qoldi.
```

### Vizualizatsiya (This ni Topish daraxti)
```mermaid
graph TD
    Start[Funksiya Chaqirildi] --> Q1{new yozilganmi?}
    Q1 -->|Ha| NewObj[this = Yangi yaratilgan Object]
    Q1 -->|Yo'q| Q2{call, apply, bind bormi?}
    
    Q2 -->|Ha| Explicit[this = Qo'lda kiritilgan Object]
    Q2 -->|Yo'q| Q3{obj.method() shunday chaqirildimi?}
    
    Q3 -->|Ha| Implicit[this = Nuqtadan oldingi Object obj]
    Q3 -->|Yo'q| Default[this = window / undefined]
    
    style Start fill:#f5f5f5,stroke:#9e9e9e
    style NewObj fill:#c8e6c9,stroke:#388e3c
    style Explicit fill:#c8e6c9,stroke:#388e3c
    style Implicit fill:#c8e6c9,stroke:#388e3c
    style Default fill:#ffcdd2,stroke:#d32f2f
```

---

## Xulosa

| Daraja | Yondashuv va Fokus | Nimalarga qodir bo'lish kerak? |
| --- | --- | --- |
| **Junior** | **Mantiq:** `this` qanday ishlashining umumiy tushunchasi. | Obyekt ichida `this` shu obyekt ekanligini, va array metodlarida (callback) yo'qolib qolishini biladi. |
| **Middle** | **Qo'llash:** `call`, `apply`, `bind` hamda Arrow funksiyalarning farqlarini to'liq anglaydi. | DOM eventlarida va Vue/React metodlarida to'g'ri kontekstni saqlab qola oladi. Obyekt metodlarini xato ishlatmaydi. |
| **Senior** | **Arxitektura & V8:** Lexical scoping, xotiradagi `bind()` ning zarari va Event Delegation arxitekturasini biladi. | Memory leaklarning oldini olish, Function borrowing orqali clean-code yozish. `call/apply` ni performance kritik joylarda to'g'ri qo'llash. |
