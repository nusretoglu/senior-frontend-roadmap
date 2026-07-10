# CSS Grid (Ikki O'lchovli Layout Tizimi)

> [!IMPORTANT]
> **Nima uchun muhim?**  
> CSS Grid hozirgi kunda web sahifalar uchun eng mukammal layout (maket) yaratish tizimidir. Agar Flexbox bir o'lchamli (faqat qator yoki ustun) joylashtirishni hal qilsa, Grid bir vaqtning o'zida ham qator, ham ustunlarni boshqarishga imkon beradi. Murakkab dashboard'lar, jurnallar va responsiv sahifalarni Grid yordamida juda kam kod yozib qotib qolmaydigan qilib yaratish mumkin.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**CSS Grid** — bu virtual katakchalar panjarasi bo'lib, veb-saytning skeletini yaratish uchun ishlatiladi.

> [!NOTE]
> **Hayotiy o'xshatish: "Shaxmat taxtasi"**  
> Grid'ni xuddi shaxmat taxtasi yoki Excel jadvaliga o'xshatish mumkin. Siz oldindan ustunlar (A, B, C...) va qatorlar (1, 2, 3...) sonini belgilab olasiz. Elementlarni (shaxmat donalarini) esa aniq bir katakka yoki bir nechta kataklarni birlashtirib (masalan, 2x2 joyga) joylashtirishingiz mumkin. Flexbox kabi elementlar o'z-o'zidan surilib ketmaydi, ular siz chizgan qat'iy panjaraga tushadi.

### Sodda Misol
Agar biz 3 ta ustundan iborat rasm galereyasi qilmoqchi bo'lsak:

```html
<div class="galereya">
  <div>1-rasm</div>
  <div>2-rasm</div>
  <div>3-rasm</div>
  <div>4-rasm</div> <!-- Bu avtomatik pastga tushadi -->
</div>
```

```css
.galereya {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* 3 ta teng ustun (fraction) */
  gap: 10px; /* Rasmlar orasidagi bo'shliq */
}
```

---

## 🟡 Middle (Amaliyot va Detallar)

### `fr` (Fraction) o'lchov birligi
Grid ni boshqa CSS asboblaridan ajratib turuvchi eng zo'r tomoni — `fr` (ulush) birligidir. Piksel (`px`) yoki foiz (`%`) o'rniga, `fr` ishlatish orqali ekrandagi "bo'sh qolgan joy" qismlarga bo'linadi.

```css
.grid {
  display: grid;
  /* 1-ustun 200px qat'iy o'lchamda, qolgan joy esa 1 ga 2 nisbatda bo'linadi */
  grid-template-columns: 200px 1fr 2fr; 
}
```

### Elementlarni joylash (Grid Areas)
Saytning butun boshli loyihasini (Layout) yozuvlar yordamida chizib chiqish Grid orqali juda oson:

```css
.dashboard {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
}

.menyular { grid-area: sidebar; }
.asosiy-qism { grid-area: main; }
```

### Ko'p uchraydigan xatolar va muammolar (Pitfalls)
**Media Queries bilan qiynalish**
Kichik ekranlarda (`@media`) ustunlar sonini qo'lda o'zgartirib o'tirish eski usul. Agar telefon uchun 1 ta, planshet uchun 2 ta va kompyuter uchun ko'p ustun kerak bo'lsa, sehrli formulani yodlab oling:
```css
.responsive-kardlar {
  display: grid;
  /* Min-kenglik 250px, undan ortsa 1fr dan to'lib ketaveradi */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
```

## Eng Yaxshi Amaliyotlar (Best Practices)
- **Sahifa maketi uchun Grid, mayda detallar uchun Flexbox:** Saytning asosiy Header, Sidebar, Main va Footer qismlarini har doim Grid da quring. Uning ichidagi mayda ikonka, knopkalar qatorini esa Flexbox bilan bajaring.
- **`gap` ishlating:** Hech qachon kataklar orasini `margin` orqali ochmang. Faqat va faqat `gap` dan foydalaning.
- **Rasm toshib ketishining oldi:** Grid ichidagi rasm ba'zan katakdan ham kattalashib ketishi mumkin. Buning yechimi `img { max-width: 100%; height: auto; }` va ota katakka `min-width: 0;` qo'shishdir.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### "Under the hood" (Qopqoq ostida nimalar ro'y beradi)
Grid arxitekturasi Flexbox dan farqli o'laroq yuqoridan-pastga (Top-Down) hisoblanadi. Ya'ni brauzer oldin Ota elementdagi panjaralarning aniq o'lchamini hisoblab chiqadi, keyin uning ichidagi bolalarni o'sha tayyor katakka "soladi". Flexbox da esa aksincha, brauzer avval bolalar razmerini so'rab, keyin ota elementni moslashtiradi (Bottom-Up). Shu sababli, katta ekranli dashboardlar chizishda Grid sahifaning Paint jarayonini kamroq charchatadi.

### Implicit vs Explicit Grid
Siz faqat 2 ta qatorni belgiladingiz deylik, lekin HTML da 30 ta quti bor. Qolgan 28 tasi nima bo'ladi? Ular **Implicit** (yashirin, avtomatik yaratilgan) Grid ga tushib qoladi.
Ularning o'lchami o'zgarib ketmasligi uchun siz `grid-auto-rows` va qayerga qarab siljishi kerakligini belgilovchi `grid-auto-flow` ni ishlatishingiz shart.

### Subgrid (Zamonaviy Texnologiya)
Ilgari Card (Karta) komponentlari Grid ichiga solinganda, Kartaning o'zini ichidagi Header, Body va Footer lari qo'shni kartanikiga tekislanmay qolardi (chunki ular Grid emas edi). Endilikda siz `grid-template-rows: subgrid;` yozish orqali barcha qatorlardagi ichki elementlar ham asosiy (Ota) panjaraning simmetriyasiga to'laqonli itoat etishini ta'minlashingiz mumkin.

### Intervyu Savollari (Qiyin daraja)
**1. `auto-fill` va `auto-fit` orasidagi farq nimada?**
*Javob:* Agar sizda atigi 3 ta element bo'lsa va ekraningiz keng bo'lsa:
- `auto-fill`: 3 ta elementni chizadi-da, qolgan bo'sh joyga "ko'rinmas" (xayoliy) ustunlarni chizib, joyni band qiladi. Elementlar kengaymaydi.
- `auto-fit`: 3 ta elementni chizadi, bo'sh ustunlarni siqib o'chirib yuboradi (collapse) va bu 3 ta elementni bo'sh qolgan joy bo'ylab yoyib yuboradi (kengaytiradi).

**2. Grid algoritmi `fr` ni qanday hisoblaydi va `calc()` yordamida qilingan foizli hisobdan qanday ustunliklari bor?**
*Javob:* `calc(33.33% - 20px)` kabi hisob-kitob qat'iydir va u padding/margin lar bilan buzilishi mumkin. `1fr` esa ekranning bo'sh qolgan sof (available) qismini anglatadi. Brauzer oldin qat'iy piksellar va `gap` larni hisoblab ularning joyini beradi. Qolgan joynigina `fr` ga asosan proporsional tarzda taqsimlaydi. Bu orqali overflow (toshish) muammolari umuman kuzatilmaydi.

### Vizualizatsiya
```mermaid
block-beta
  columns 3
  space:3
  block:row1
    columns 3
    C1["1-ustun (1fr)"] C2["2-ustun (1fr)"] C3["3-ustun (1fr)"]
  end
  space:3
  block:row2
    columns 3
    C4["Grid Cell"] C5["Grid Cell"] C6["Grid Cell"]
  end
  space:3
```

---

## Xulosa

| Daraja | Yondashuv va Fokus | Nimalarga qodir bo'lish kerak? |
| --- | --- | --- |
| **Junior** | **Mantiq:** CSS Grid va Flexbox farqini biladi. | Oddiy `grid-template-columns` bilan ustun yasay oladi va rasmlarni teradi. |
| **Middle** | **Qo'llash:** Area lar va Responsivlikda usta. | Ota maketlarni `grid-template-areas` orqali yasay oladi. `minmax()` ni erkin qollay oladi. |
| **Senior** | **Arxitektura & V8:** Brauzer rendering algorithmsini, Top-down tizimini tushunadi. | `subgrid` kabi zamonaviy usullarni qollab, UI da pikseligacha aniq mukammal Grid layout qura oladi. |
