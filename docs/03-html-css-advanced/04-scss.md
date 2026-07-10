# SCSS/Sass (CSS Preprocessor)

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Oddiy CSS katta loyihalarda yozish, o'qish va boshqarish qiyin bo'lgan yuzlab qatorlarga aylanib ketadi. SCSS (Sass) - bu CSS'ga "dasturlash tili" xususiyatlarini qo'shadi. O'zgaruvchilar (variables), funksiyalar (mixins) va takrorlanishlardan qochish (nesting) orqali yozadigan kodingiz hajmi qisqaradi va professional ko'rinishga keladi. Barcha katta kompaniyalar arxitekturani SCSS yoki CSS-in-JS bilan quradilar.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**SCSS** — oddiy CSS ning ustiga qurilgan, ko'proq imkoniyatlarga ega versiyasi. Brauzer SCSS ni tushunmaydi, shuning uchun maxsus dastur (compiler) siz yozgan SCSS kodini oxirida yana oddiy CSS ga o'girib (tarjima qilib) beradi.

> [!NOTE]
> **Hayotiy o'xshatish: "Pishiriq qolipi"**  
> Tasavvur qiling siz yuzta bir xil pechenye pishirmoqchisiz. CSS da siz har bir pechenyeni qo'lda alohida shaklga keltirishingiz kerak bo'ladi (takroriy kod). SCSS esa xuddi tayyor "pechenye qolipi" ga (`@mixin`) o'xshaydi: siz bir marta shaklni yaratib qo'yasiz va qolgan barchasini shunchaki bitta chaqirish (`@include`) bilan shakllantirasiz. Natijada yuzlab tayyor va bir xil kiyingan kod bloklariga ega bo'lasiz.

### Sodda Misol (O'zgaruvchilar va Nesting)
Ranglarni har bir joyga `#007bff` deb yozavermaslik uchun biz uni `$` bilan o'zgaruvchiga olamiz va elementlarni HTML dagidek ichma-ich (Nesting) yozamiz.

```scss
// SCSS kodi
$asosiy-rang: #007bff;

.navbar {
  background-color: $asosiy-rang;
  
  .logo { 
    color: white; 
    
    &:hover { // "&" belgisi .logo ning o'zini anglatadi (.logo:hover)
      color: red;
    }
  }
}
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Mixins (Qoliplar) va Arguments
Agar kod bloki turli joylarda ozgina o'zgarish bilan takrorlansa, `@mixin` eng zo'r yechim. Masalan, har xil rangli tugmalar (Buttons) yasash uchun:

```scss
// Qolip yaratish
@mixin tugma-yasash($rang) {
  padding: 10px 20px;
  border-radius: 5px;
  background-color: $rang;
  border: 1px solid darken($rang, 10%); // SCSS ni o'zining rang to'qlashtiruvchisi
}

// Qolipdan foydalanish
.btn-yashil {
  @include tugma-yasash(green);
}

.btn-qizil {
  @include tugma-yasash(red);
}
```

### Modules va `@use` (Eski `@import` o'rniga)
Bitta katta `style.css` yozish o'rniga kodni maydalaymiz.
```scss
// _variables.scss (Boshiga "_" qo'yilsa bu fayl faqat chaqirib olish uchun ishlatiladi)
$asosiy-shrift: 'Arial', sans-serif;

// main.scss
@use 'variables'; // Faylni ulaymiz

body {
  font-family: variables.$asosiy-shrift; // "variables" namespace bilan olinadi
}
```

### Ko'p uchraydigan xatolar va muammolar (Pitfalls)
**Haddan tashqari ichma-ich yozish (Nesting Hell)**
Nesting yaxshi, lekin 3 tadan ortiq ichiga kirib ketsangiz, hosil bo'lgan CSS ni brauzer o'qishi qiyinlashadi va dizayn bir-biriga minishib (Specificity muammosi) ketadi.
```scss
// YOMON:
.page { .container { .card { .title { color: red; } } } }

// YAXSHI (BEM yondashuvi):
.card {
  &__title { color: red; }
}
```

## Eng Yaxshi Amaliyotlar (Best Practices)
- **7-1 Pattern:** Katta loyihalarda fayllarni `base/`, `components/`, `layout/`, `pages/` kabi 7 ta papkaga bo'lib, eng oxirida bitta `main.scss` ga yig'ib olish tavsiya etiladi.
- **Dinamik o'lchovlar:** Piksellar o'rniga `rem` ishlating va SCSS da maxsus matematika (`math.div(16px, 16px)`) funksiyalari yordamida pikselni avtomat `rem` ga o'tkazadigan funksiya yozib oling.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### "Under the hood" (Qopqoq ostida nimalar ro'y beradi)
SCSS compile bo'layotganda (Dart Sass orqali) brauzer uchun AST (Abstract Syntax Tree) quriladi. Siz yozgan har bir `@extend` yoki `@mixin` yakuniy fayl hajmini (CSS file size) o'zgartiradi. 
Agar siz bir xil kodni `@mixin` orqali 10 ta elementga bersangiz, hosil bo'lgan CSS da o'sha kod 10 marta ko'payadi (File size kattalashadi). Ammo `@extend` qilsangiz, u barcha 10 ta class ni vergul bilan bitta qilib yig'adi va joyni tejaydi.

### Mixin vs Extend (Qachon qaysi?)
- **`@mixin`**: Argument (parametr) o'zgarib turganda ishlating.
- **`@extend`**: Kodingiz hech qanday argument olmaydigan butunlay stastik blok bo'lsa ishlating. (CSS hajmini ancha tejaydi)

```scss
%soya-effekti { // Placeholder selector - u faqat extend qilinganda css ga yoziladi
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.karta { @extend %soya-effekti; }
.modal { @extend %soya-effekti; }
// Compile natijasi:
// .karta, .modal { box-shadow: 0 4px 6px rgba(0,0,0,0.1); } (Kod takrorlanmadi!)
```

### SCSS Maps (Xuddi JS Object kabi)
Dizayn tokenlarini (Design Tokens) to'liq avtomatlashtirish uchun Maps va tsikllardan (`@each`) foydalaniladi:

```scss
$ranglar: (
  "birlamchi": #007bff,
  "xavf": #dc3545,
  "muvaffaqiyat": #28a745
);

// Bitta tsikl bilan yuzlab classlarni avtomat yaratish:
@each $nom, $kod in $ranglar {
  .bg-#{$nom} { // .bg-xavf
    background-color: $kod; // background-color: #dc3545
  }
}
```

### Intervyu Savollari (Qiyin daraja)
**1. SCSS dagi Variable (`$rang`) bilan CSS dagi Custom Property (`--rang`) ning farqi nima? Qaysi biri kuchliroq?**
*Javob:* SCSS dagi o'zgaruvchilar Compile Time (tarjima vaqti) da o'rniga qiymat qo'yilib o'chib ketadi. Ya'ni brauzer ularni tanimaydi va keyin JavaScript bilan ularni o'zgartirib bo'lmaydi. CSS o'zgaruvchilari esa Runtime (brauzer ichida) yashaydi. Saytda "Dark Mode" qilish uchun har doim CSS o'zgaruvchilari ancha kuchli (ularni JS da o'zgartirish mumkin). Eng yaxshi usul — SCSS ni JS va CSS variables larni boshqarish vositasi sifatida birga ishlatishdir.

**2. Nega Dart Sass hozirgi kunda `node-sass` dan ustun ko'riladi va eski `@import` nima uchun qoralanmoqda?**
*Javob:* `node-sass` C++ da yozilgan va Node.js versiyalariga juda qaram bo'lib ko'p xatolik (build error) berardi. Dart Sass esa barqaror va hozirgi rasmiy compiler. Eski `@import` tizimi hamma o'zgaruvchilarni "Global Scope" ga (Hammaga ochiq qilib) to'kib yuborardi. `@use` esa ularni modul sifatida yopadi (Namespacing), xotirani kamroq eydi va bir xil nomli o'zgaruvchilar urishib ketmasligini ta'minlaydi.

---

## Xulosa

| Daraja | Yondashuv va Fokus | Nimalarga qodir bo'lish kerak? |
| --- | --- | --- |
| **Junior** | **Mantiq:** CSS ni qisqartirish va toza yozish. | `$` bilan o'zgaruvchilar yarata oladi va kodni Nesting (ichma-ich) yoza oladi. |
| **Middle** | **Qo'llash:** DRY (O'zingni takrorlama) prinsipi. | `@mixin` yozish, `@use` orqali fayllarni to'g'ri ulash va `darken/lighten` funksiyalaridan unumli foydalanish. |
| **Senior** | **Arxitektura & V8:** Loyihaning Design Token'larini boshqarish. | 7-1 pattern bo'yicha loyiha arxitekturasini qurish, `@extend` va `@each` yordamida utilita class'larni generator qila olish. CSS/SCSS variables chegarasini his qilish. |
