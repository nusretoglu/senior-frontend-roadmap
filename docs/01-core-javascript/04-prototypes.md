# Prototypes (Protiplar)

> [!IMPORTANT]
> **Nima uchun muhim?**  
> JavaScript qolgan tillar (Java, C++) kabi "Class" (sinf) arxitekturasiga ega emas. Garchi ES6 da `class` so'zi qo'shilgan bo'lsa-da, bu shunchaki "sintaktik shakar" (syntax sugar) hisoblanadi. Tag zaminida JS **Prototype-based** (Prototipga asoslangan) tildir. Prototip zanjirini tushunmasangiz, nega `[1, 2].push()` ishlashi, yoki qanday qilib bir obyekt boshqasidan o'zlashtirishi (inheritance) siz uchun butunlay qorong'ulik bo'lib qoladi.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Prototype (Prototip)** — bu bir obyektning boshqa obyektga bog'lanib, undan ma'lumot va xususiyatlarni meros qilib oladigan zanjirli tizimdir. Barcha JavaScript obyektlari yashirin `[[Prototype]]` degan xususiyatga ega bo'ladi.

### Nima uchun kerak?
Har bir yaratilgan obyekt o'ziga alohida funksiyalarni nusxalab xotirani to'ldirib yubormasligi uchun kerak. Prototip yordamida metodlar bir joyda (ota obyektda) saqlanadi va hamma bolalar o'sha yerdan foydalanadi.

> [!NOTE]
> **Hayotiy o'xshatish: "Merosxo'rlik va Buvilar"**  
> Tasavvur qiling sizda ("child object") avtomobil yasash bilimi yo'q, lekin otangiz ("prototype") bu ishni zo'r biladi. 
> Kimdir sizdan: "Mashina qanday yasaladi?" deb so'rasa, siz o'zingizda javob bo'lmagani uchun otangizga yuzlanasiz. Agar otangiz ham bilmasa, u o'z otasiga (sizning bobongizga, ya'ni keyingi "prototype" ga) yuzlanadi.  
> JavaScript da obyektdan qandaydir metodni (masalan `obj.toString()`) chaqirganingizda, JS uni avval o'sha obyektdan qidiradi. Topolmasa, uning ota-onasidan (`__proto__`), keyin bobosidan, to uzoq ajdod (`Object.prototype`) ga yetib borguniga qadar yuqoriga qarab ketaveradi. Bu **Prototype Chain (Prototip zanjiri)** deyiladi.

### Sodda Misol

```javascript
const hayvon = {
  yurish: true,
  ovqatlanish: function() {
    console.log("Men ovqat yeyapman");
  }
};

const quyon = {
  sakrash: true
};

// quyon ning otasi (prototipi) - hayvon qilib belgilaymiz
quyon.__proto__ = hayvon;

console.log(quyon.sakrash); // true (o'zining xususiyati)
console.log(quyon.yurish);  // true (otasidan oldi)
quyon.ovqatlanish();        // "Men ovqat yeyapman" (otasining funksiyasini ishlatdi)
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Qanday ishlaydi? (Constructor va prototype)
Obyektni qo'lda `__proto__` bilan bog'lash juda sekin ishlaydi. Amalda `Constructor function` yoki `class` dan foydalaniladi.

```javascript
function User(ism) {
  this.ism = ism;
}

// Barcha User lar uchun umumiy metodni prototipga yozamiz
User.prototype.salomlash = function() {
  console.log(`Salom, mening ismim ${this.ism}`);
};

const user1 = new User("Ali");
const user2 = new User("Vali");

user1.salomlash(); // Salom, mening ismim Ali
user2.salomlash(); // Salom, mening ismim Vali

// Ikkala user ham bitta funksiyani ishlatyapti (Xotira tejaldi!)
console.log(user1.salomlash === user2.salomlash); // true
```

### Ko'p uchraydigan xatolar va muammolar (Pitfalls)

**1. Prototipni butunlay almashtirib qo'yish**
Prototipga yangi funksiya qo'shganda hech qachon `=` bilan butun ob'ektni tenglashtirmang. ESKI yaratilgan obyektlar aloqani yo'qotib qo'yadi.

```javascript
// XATO:
User.prototype = { xayrlash: function() {} }; 
// Bu oldingi User.prototype ni o'chirib tashlaydi.

// TO'G'RI:
User.prototype.xayrlash = function() {}; 
```

**2. `for...in` halqasidagi xavf**
`for...in` nafaqat obyektning o'zini, balki prototipdagi barcha maydonlarni ham aylanib chiqadi.
```javascript
const parent = { familiya: "Eshmatov" };
const child = { ism: "Ali", __proto__: parent };

for(let key in child) {
  console.log(key); // "ism" va "familiya" chiqadi!
}

// Yechim:
for(let key in child) {
  if (child.hasOwnProperty(key)) {
    console.log(key); // Faqat "ism" chiqadi
  }
}
// Yoki hozirgi zamonda Object.keys(child) ishlating.
```

### Keng tarqalgan real use-caselar
**1. Eski massiv funksiyalarini yaratish (Polyfilling)**
Agar eski brauzerda yangi funksiya yo'q bo'lsa, uni prototipga o'zimiz qo'shib qo'yamiz:
```javascript
if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
}
console.log([1, 2, 3].last()); // 3
```

## Eng Yaxshi Amaliyotlar (Best Practices)
- **`__proto__` ishlatmang:** `__proto__` juda eskirgan va yomon performans beruvchi xususiyat. Uning o'rniga obyekt yaratishda `Object.create(parent)`, o'qishda esa `Object.getPrototypeOf(obj)` ishlating.
- **O'rnatilgan ob'ektlarni o'zgartirmang:** `Array.prototype` yoki `Object.prototype` ga tiyinmang. Agar hammaga qulay deb o'ylab `.last()` ni qo'shsangiz, ertaga boshqa kutubxona ham aynan shunday nom qo'shsa kod "sinadi". (Monkey Patching yomon amaliyot).
- **Class ishlating:** Iloji boricha sintaktik jihatdan toza bo'lishi uchun ES6 `class` laridan foydalaning, u orqa fonda aynan shu prototype larni tartibli va xatosiz yaratib beradi.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### "Under the hood" (Qopqoq ostida nimalar ro'y beradi)
V8 dvigateli property (maydon) ni o'qiyotganda doim "Inline Caches (IC)" va "Hidden Classes" texnologiyasidan foydalanadi. 
Agar siz ishlayotgan loyihada dinamik ravishda obyektning `__proto__` sini almashtirsangiz (yoki o'zgartirsangiz), JS dvigateli barcha keshlarini yo'qotib, obyekt tuzilishini boshqatdan hisoblashga majbur bo'ladi. Bu butun dastur tezligini juda katta miqdorda tushirib yuboradi. Prototype zanjiri yaratilishi obyekt instansiyasi qilinmasdan avval, statik bo'lishi shart.

**Object.create(null) nima?**
Bu haqiqiy "bo'm-bo'sh" Dictionary (Lug'at) yasash usuli. Oddiy `{}` obyekt ham ichida `toString()`, `hasOwnProperty()` degan metodlarni olib yuradi, chunki u `Object.prototype` ga ulangan.
Agar sizga toza hash-map kerak bo'lsa:
```javascript
const map = Object.create(null);
// Endi u map.toString = undefined (hech qanday ajdodi yo'q)
```

### Xotira (Memory) va Unumdorlik (Performance)
Prototip orqali metod yozganimizda u Memory(Heap) da faqat 1 ta yashaydi. Agar uni constructor ichida ko'rsatsak (arrow function qilib yozsak), 1 millionta obyekt uchun 1 millionta alohida xotira ajratiladi.

```javascript
class User {
  constructor() {
    // XATO (Xotira qotili): Har bir obyekt uchun alohida funksiya yasaladi
    this.xayrlash = () => console.log('Xayr'); 
  }
  
  // TO'G'RI: Bu prototype da yashaydi (xotira tejaladi)
  salomlash() {
    console.log('Salom');
  }
}
```

### Intervyu Savollari (Qiyin daraja)
**1. `__proto__` va `prototype` ning farqi nima?**
- `__proto__`: bu Har qanday Obyektning ota-onasiga ishora qiluvchi silka (pointer).
- `prototype`: bu faqat Function(konstruktor)larda bo'ladigan xususiyat. U "shu funksiyadan yasalgan bolalarning `__proto__` si nimaga teng bo'lishini" belgilaydi.
*(Esda tuting: `User.prototype === userObj.__proto__`)*

**2. `new` operatori qopqoq ostida qanday ishlaydi?**
```javascript
function yasalish(Konstruktor, ...args) {
  // 1. Yangi bo'sh obyekt ochib, uning __proto__ sini bog'laydi
  const obj = Object.create(Konstruktor.prototype);
  // 2. This ni o'sha yangi obyektga qaratib, funksiyani ishga tushiradi
  const result = Konstruktor.apply(obj, args);
  // 3. Agar funksiya obyekt qaytarsa o'shani, yo'qsa yangi yaratilgan obj ni beradi
  return result instanceof Object ? result : obj;
}
```

### Vizualizatsiya (Prototype Chain)
```mermaid
graph BT
    Rabbit[rabbit<br/>jumps: true] -->|__proto__| Animal[animal<br/>eats: true]
    Animal -->|__proto__| ObjProto[Object.prototype<br/>toString(), hasOwnProperty()]
    ObjProto -->|__proto__| NullObj[null]

    style Rabbit fill:#e3f2fd,stroke:#1565c0
    style Animal fill:#c8e6c9,stroke:#388e3c
    style ObjProto fill:#fff9c4,stroke:#fbc02d
    style NullObj fill:#f5f5f5,stroke:#9e9e9e
```

---

## Xulosa

| Daraja | Yondashuv va Fokus | Nimalarga qodir bo'lish kerak? |
| --- | --- | --- |
| **Junior** | **Mantiq:** Boshqa obyektdan nusxa/xususiyat o'zlashtirishni tushunadi. | `__proto__` qanday ketma-ketlikda tepaga qarab ishlashini va nega bizda doim `.toString()` borligini biladi. |
| **Middle** | **Qo'llash:** Constructor va ES6 Class ni bir-biridan farqlay oladi. | Prototipga ulanishlarni buzmadi, ES6 Class ishlatadi, xotira tejash uchun arrow metodlarni constructor ichida yozmaslikka harakat qiladi. |
| **Senior** | **Arxitektura & V8:** Hidden Classes va IC lar ishlash tartibini biladi. | Prototype mutatsiyalaridan qochadi, Hash maplar uchun `Object.create(null)` ishlatib o'ta optimal ma'lumotlar tuzilmalarini yaratadi. |
