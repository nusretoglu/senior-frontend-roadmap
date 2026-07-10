# Image Optimization

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Bugungi kunda veb-sayt og'irligining deyarli 50% dan ko'prog'ini rasmlar tashkil qiladi. Qanchalik chiroyli va qiziqarli sayt qilmang, agar uni ichidagi bitta 5MB lik HD rasm tufayli sayt 10 soniyada yuklansa, mijozlar kutib o'tirmay chiqib ketishadi. **Rasmlarni optimallashtirish (Image Optimization)** orqali saytning yuklanish vaqtini sekundlardan millisekundlargacha tushirish, server xarajatlarini tejash va Google Qidiruvida (SEO) oldingi o'rinlarga chiqish mumkin.

> [!NOTE]
> **Real-hayot analogiyasi: "Pochtada Yuk Jo'natish"**  
> Siz Amerikaga katta kitob jo'natmoqchisiz.  
> - **Optimizatsiyasiz (Yomon):** Kitobni katta va og'ir temir sandiqqa solib jo'natyapsiz. Yo'lkira qimmat va yetib borishi sekin bo'ladi.  
> - **Optimizatsiya qilingan (Yaxshi):** Kitobni ixcham, yengil karton qutiga joylaysiz, bo'sh joylarni olib tashlaysiz va ustiga "Faqat manzilga yetganda oling" (Lazy load) degan stiker yopishtirasiz. U arzon va tez yetib boradi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchilar rasmlarni ko'pincha "qanday bo'lsa shundayligicha" (Jpg/Png formatda, 3-4 MB hajmda) serverga yoki saytga yuklab qo'yishadi. Bu eng ko'p tarqalgan xato. Dastlabki qadam formatlarni bilishdir.

### Hajmlarni taqqoslash (Masalan: 1920x1080 rasm)
| Format | Sifati | Taxminiy Hajm | JPEG ga nisbatan farq |
|--------|--------|---------------|-----------------------|
| **PNG**| Lossless (Yo'qotishsiz)| 1.5MB | Eng og'ir (Faqat logotiplar uchun yaxshi) |
| **JPEG**| 80% | 250KB | Standart |
| **WebP**| 80% | 150KB | -40% yengil (Zamonaviy standart) |
| **AVIF**| 80% | 100KB | -60% yengil (Eng yangi) |

### Asosiy `<picture>` tegi ishlatilishi
Rasmlarni faqat bitta `.jpg` o'rniga, uning optimal versiyalarini berish kerak.
```html
<!-- Brauzer tepadan pastga o'qiydi. Agar kompyuter avifni tushunsa uni oladi, 
tushunmasa webp, uyam bo'lmasa eski jpg ni oladi! -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Rasm tavsifi" width="800" height="600">
</picture>
```

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi har xil ekranlar (Telefon, Planshet, Kompyuter) uchun aynan bitta katta rasmni emas, mos o'lchamdagi rasmni qanday yuborishni biladi va *Lazy Loading* bilan shug'ullanadi.

### Responsive Images (Turli ekranlarga turli rasmlar)

```html
<!-- Katta ekran uchun 1920px rasm qilib, telefonni qiynamaymiz! -->
<!-- srcset orqali brauzerga o'ziga mosini tanlash imkonini beramiz -->
<img
  src="hero-800.jpg"
  srcset="
    hero-400.jpg 400w,   <!-- Telefon uchun -->
    hero-800.jpg 800w,   <!-- Planshet uchun -->
    hero-1920.jpg 1920w  <!-- Katta ekran uchun -->
  "
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1920px"
  alt="Hero"
  width="1920"
  height="1080"
>
```

### Lazy Loading vs Eager Loading
Ekranda srazu ko'rinmaydigan, foydalanuvchi pastga tushganda chiqadigan rasmlarni yuklash - pulni (megabaytni) ko'kka sovurish demak. HTML bu uchun tekinga shunday xususiyat bergan:
```html
<!-- Boshlang'ich rasm (Hero): Kutib o'tirmasligi uchun EAGER -->
<img src="hero.jpg" loading="eager" fetchpriority="high">

<!-- Eng pastdagi footer'dagi rasm: LAZY -->
<img src="footer-logo.jpg" loading="lazy" width="200" height="100">
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior arxitektor rasmlarning yuklanishi CLS (Cumulative Layout Shift) ga qanday ta'sir qilishi ustida ishlaydi, va loyihada Avtomatlashtirilgan Optimization yoki Image CDN'larni integratsiya qiladi.

### Cumulative Layout Shift (CLS) Muammosi
Agar siz `<img>` ga `width` va `height` bermasangiz, brauzer rasm kelmaguncha uning joyini (0px qilib) bo'sh qoldiradi. Rasm yuklangach esa matnlar surilib, ekran sakrab ketadi. Bunga CLS deyiladi (Google SEO uchun o'ta yomon baho).

**Yechim:** Har doim `width` va `height` ni bering, yoki CSS da `aspect-ratio` ishlating:
```css
img {
  max-width: 100%;
  height: auto;
  aspect-ratio: attr(width) / attr(height);
}
```

### Build-Time Optimizatsiya vs Cloudinary/Imgix
Loyiha ichidagi statik rasmlarni `vite-plugin-imagemin` kabi asboblar orqali avtomat WebP, AVIF qilib siqib yuborish mumkin (Build-time). Lekin foydalanuvchilar o'zlari yuklaydigan (User uploads) rasmlarni qanday siqamiz? 
Buning uchun CDN'lar (Cloudinary yoki Imgix) ishlatiladi:
```javascript
// Cloudinary URL orqali rasmni kesish va formatini o'zgartirish (Dynamic Image Optimization)
// Foydalanuvchi nima rasm yuklasa ham, biz faqat 400x400 sifatli va webp qilib olamiz.
const optimizedUrl = 'https://res.cloudinary.com/your-cloud/w_400,h_400,c_fill,q_80,f_auto/user-upload.jpg';
```

### Intervyu Savoli
**"WebP va AVIF qachon ishlatiladi? Ularning farqi nima?"**
*Javob:*
Ikkalasi ham eski JPEG/PNG larning "qotili". WebP - keng qo'llaniluvchi va deyarli barcha brauzerlar taniydigan (95%+) format. U o'zida ham animatsiyani (GIF kabi), ham shaffoflikni (PNG kabi) jamlaydi va JPEG dan o'rtacha 30% yengilroq. AVIF esa eng oxirgi avlod hisoblanib, WebP dan ham 20-30% yana yengilroq qilib siqa oladi, ammo AVIF eski brauzerlarda to'liq qo'llab quvvatlanmasligi mumkin hamda rasm qilib o'girish (encode) uchun server ko'proq resurs (CPU) sarflaydi. Shuning uchun `<picture>` da AVIF birinchi (ustuvor), WebP ikkinchi qo'yiladi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Zamonaviy formatlarni (WebP/AVIF) ishlating:** Har qanday `.jpg` yoki `.png` o'rniga `.webp` yoki `.avif` ni (va `<picture>` tegida eski brauzerlar uchun fallback variantini) ishlating.
2. **Width va Height atributlarini unutmang:** Har doim `<img>` tegiga ehtimoliy bo'yi va enini yozing (`width="800" height="600"`). Bu Layout Shift (CLS) ni oldini oladi (rasm yuklanishidan oldin sahifada joy band qilib turadi).
3. **Above-the-fold EAGER, qolganiga LAZY:** Ekranni ochganda darhol ko'rinadigan birinchi rasmni (Hero image) `loading="eager"` (yoki preload) qiling. Qolgan barcha ko'rinmaydigan pastdagi rasmlarga esa `loading="lazy"` qo'ying.

---

## Xulosa

Image optimization strategiyasi:

| Yuklanish bosqichi | Qaysi rasm? | Holati |
| --- | --- | --- |
| **Dastlabki yuklanish (Eager)** | Bosh sahifadagi eng yuqori rasm (Hero) | Preload, yuqori ustuvorlik (~150KB) |
| **Hover / Scroll qilganda (Lazy)** | Pastroqdagi yoki ko'rinmaydigan rasmlar | Sekin yuklanadi (`loading="lazy"`) |
| **Ekranga qarab (Responsive)** | Katta kompyuter vs Kichik telefon | `srcset` orqali optimal rasm tanlash |

*Natija: Sahifa 2MB emas, ~350KB bilan tez va yengil ochiladi.*
