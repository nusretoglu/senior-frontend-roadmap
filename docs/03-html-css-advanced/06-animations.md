# CSS Animations (Transitions va Keyframes)

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Animatsiyalar shunchaki "chiroyli dizayn" uchun qilinmaydi. Ular foydalanuvchiga tizim nima qilayotganini tushuntirib turuvchi asosiy muloqot vositasidir (Masalan, knopkani bosganda yuklanayotganini ko'rsatuvchi spinner). Lekin noto'g'ri qilingan animatsiyalar telefon batareyasini tez tugatadi va sahifani qotirib qo'yadi. Yaxshi dasturchi animatsiya turlarini va 60 FPS da ishlaydigan animatsiyalar yarata olishni bilishi shart.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Transition** — bir holatdan ikkinchi holatga o'tishni silliqlash (Masalan: rang qizildan ko'kka birdan emas, sekin o'zgarishi).
**Keyframes (Animation)** — ko'p bosqichli va avtomatik takrorlanadigan murakkab harakatlar (Masalan: to'xtovsiz aylanib turuvchi halqa).

> [!NOTE]
> **Hayotiy o'xshatish: "Teatr sahnasi"**  
> `transition` ni xonadagi chiroqning asta-sekin yonishiga o'xshatish mumkin. Faqatgina ikkita holat bor: Boshlanishi va Tugashi. U o'z-o'zidan ishlamaydi, tugmani bosish (hover/click) kerak.
> `keyframes` animatsiyasi esa teatr aktyorining butun bir sahnadagi o'yini: U qayerga boradi, qachon to'xtaydi, qachon aylanadi — barchasi minutma-minut, foizma-foiz (0%, 50%, 100%) yozib chiqiladi va o'z-o'zidan ijro etiladi.

### Sodda Misol
Tugmaga sichqoncha olib borganda (hover) silliq kattalashishi:

```css
.tugma {
  background: blue;
  /* Qaysi xususiyat o'zgaradi, Qancha vaqtda, Qanday ritmda */
  transition: transform 0.3s ease; 
}

.tugma:hover {
  transform: scale(1.1); /* 10% kattalashish */
}
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Keyframes (`@keyframes`) yozish
Agar transition sizga yetarli bo'lmasa, harakatni foizlarda rejalashtiramiz. Masalan yuklanayotgan (Loading) spinner:

```css
.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid gray;
  border-top-color: blue;
  border-radius: 50%;
  
  /* nomi, vaqti, ritmi, cheksiz takrorlanishi */
  animation: aylanish 1s linear infinite;
}

@keyframes aylanish {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); } /* Bir to'liq aylana */
}
```

### Animatsiya Ritmi (Timing Functions)
Siz qanday qilib `ease` yozishni bilasiz, lekin ularning arxitekturasi bor:
- `linear` - Mexanik o'zgarmas tezlik (Spinnerlar va cheksiz animatsiyalar uchun).
- `ease-out` - Tez boshlanadi, oxirida sekinlashib to'xtaydi. (Ekranga narsa kirib kelganda).
- `ease-in` - Sekin boshlanib tezlashib ketadi. (Ekranda narsa chiqib ketganda).
- `cubic-bezier()` - O'zingiz xohlagan grafikni chizishingiz mumkin (Masalan: Bounce/sakrash effekti).

### Ko'p uchraydigan xatolar va muammolar (Pitfalls)
**"Width" yoki "Margin" ni animatsiya qilish (Juda yomon!)**
Agar div ni kattalashtirish uchun `width: 200px` ni transition qilsangiz, brauzer ekrandagi barcha qutilarni joyini qayta o'lchab chizishga (Layout Recalculation) majbur bo'ladi va sahifa qotadi (jank). 
*Yechim:* O'lchamini o'zgartirish uchun faqat `transform: scale()` ishlating!

## Eng Yaxshi Amaliyotlar (Best Practices)
- **Faqat 2 ta narsani animatsiya qiling:** Performance yomonlashmasligi (60fps ushlab qolish) uchun faqat `transform` va `opacity` ni animatsiya qiling.
- **Kutish vaqti (Delay) ni me'yorida oling:** Biror narsani ko'rsatish uchun foydalanuvchini 1 sekunddan ortiq kuttirmang. Optimal animatsiya vaqti 200ms - 400ms.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### "Under the hood" (Qopqoq ostida nimalar ro'y beradi)
Veb-brauzer sahifani 3 bosqichda chizadi: Layout (O'lchamlarni hisoblash) -> Paint (Bo'yash) -> Composite (Qatlamlarni yig'ish va GPU ga jo'natish).
`width`, `top`, `margin` kabi elementlar birinchi bosqichda yashaydi. Ularni o'zgartirsangiz brauzer uchala bosqichni ham noldan bajaradi.
`transform` va `opacity` esa Composite bosqichida yashaydi. Siz ularni o'zgartirsangiz ish to'g'ridan-to'g'ri qurilmangizning Video Kartasiga (GPU) topshiriladi (Hardware Acceleration). Shuning uchun ham aynan shu ikkisi silliqroq ishlaydi.

### `will-change` (Ogohlantirish)
Agar sahnada juda og'ir va katta rasm animatsiya qilinishi kutilayotgan bo'lsa, brauzerni oldindan ogohlantirish mumkin:
```css
.ogir-animatsiya {
  will-change: transform;
}
```
Bu orqali brauzer o'sha elementni alohida grafik qatlamga olib chiqib qo'yadi. Lekin uni keragidan ortiq ishlatsangiz, RAM (Xotira) to'lib ketib sayt "qulab tushadi".

### Accessibility (Maxsus ehtiyojlar)
Ba'zi insonlarda vestibulyar apparat muammolari (bosh aylanishi, tutqanoq) mavjud. Operatsion tizimdan "Reduce Motion" ni yoqib qo'ygan odamlar uchun animatsiyalarni o'chirib berishingiz SENIOR darajangizni bildiradi.
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    /* Animatsiyalarni butunlay o'chirmasdan, juda qisqa qilib qo'yamiz (buglarni oldini olish uchun) */
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Intervyu Savollari (Qiyin daraja)
**1. `transition` qachon teskari tartibda (reverse) buzilib qolishi mumkin?**
*Javob:* Agar siz tugmaga hover qilganda `.btn:hover { transition: 1s; }` deb faqat hoverning ichiga yozsangiz, hover tugagach (sichqonchani olganda) element sakrab oldingi holatiga qaytadi, chunki unda orqaga qaytish uchun transition o'qilmay qoladi. Shuning uchun `transition` doim asosiy `.btn` klassining o'zida yozilishi shart.

**2. Nima uchun GPU-accelerated animatsiyalar ishlatganda ba'zi matnlar xiralashib (blurry) qoladi va yechimi nima?**
*Javob:* Bunga sabab, brauzer `transform` qo'llanilgan elementni rasm (bitmap) ga aylantirib GPU ga uzatadi va sub-pixel rendering (matnlarni o'tkir o'qish) ni vaqtincha o'chirib qo'yadi. Bunga qarshi yechim elementga `transform: translateZ(0)` yoki `backface-visibility: hidden` berish orqali qatlam renderini to'g'irlashdir. Ammo modern brauzerlarda bu bug asosan tuzatilgan.

---

## Xulosa

| Daraja | Yondashuv va Fokus | Nimalarga qodir bo'lish kerak? |
| --- | --- | --- |
| **Junior** | **Mantiq:** Asosiy holatlarga silliqlik qo'shish. | Hover, Focus effektlariga `transition` bera oladi. O'lchov vaqti formatlarini biladi (ms, s). |
| **Middle** | **Qo'llash:** Murakkab va zanjirli animatsiyalar. | `@keyframes` yordamida loader, spinnerlar chiza oladi. `ease-in-out` timing funksiyalaridan ongli foydalanadi. |
| **Senior** | **Arxitektura & V8:** Hardware Acceleration ni tushunish. | Reflow, Repaint zanjirini buzmaslik uchun faqat to'g'ri xususiyatlarni (`transform/opacity`) animatsiya qiladi. A11y (`prefers-reduced-motion`) ni inobatga oladi. |
