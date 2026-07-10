# Responsive Layouts (Moslashuvchan Dizayn)

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Bugungi kunda foydalanuvchilarning aksariyati veb-saytlarga mobil qurilmalardan kiradi. Agar veb-sahifangiz faqat kompyuter ekrani uchun mo'ljallangan bo'lsa, siz foydalanuvchilarning teng yarmini yo'qotasiz. Responsive (moslashuvchan) dizayn — bu shunchaki yaxshi xususiyat emas, balki har bir professional frontend dasturchi bilishi shart bo'lgan majburiyatdir.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Responsive Design** — bu veb-saytning foydalanuvchi ekrani o'lchamiga (telefon, planshet, noutbuk) o'z-o'zidan moslashish xususiyati. Buni "Media Queries" (`@media`) deb nomlangan CSS qoidalari yordamida amalga oshiramiz.

> [!NOTE]
> **Hayotiy o'xshatish: "Suv va Idish"**  
> Responsive dizayn xuddi suvga o'xshaydi. Suvni qanday idishga (mobil telefon, planshet, kompyuter) quysangiz, u o'sha idishning shaklini oladi va bo'shliqni to'ldiradi. Elementlar ham xuddi shunday ekranga qarab o'z o'lchamini, joylashuvini yoki ko'rinishini (katta/kichik, yonma-yon/ustma-ust) o'zgartirishi kerak.

### Sodda Misol (Media Query)
Saytdagi matn kompyuterda katta, telefonda esa kichikroq bo'lishi kerak deylik:

```css
/* Default holat (Kompyuterlar uchun) */
.matn {
  font-size: 24px;
}

/* Ekran kengligi 768px dan kichik bo'lsa (Telefon va planshetlar) */
@media (max-width: 768px) {
  .matn {
    font-size: 16px; /* Matn kichrayadi! */
  }
}
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Mobile-First Yondashuvi (Mobile-First Approach)
Saytni avval telefonga moslab (default), keyin kompyuterga kengaytirib borish — **Mobile-First** deyiladi. Buning siri `min-width` ishlatishda.
Nega bu muhim? Telefon protsessori zaifroq bo'ladi, agar siz CSS da millionta kompyuter qoidalarini yozib keyin telefonda ularni o'chirib chiqish bilan shug'ullansangiz, telefon saytni ochishda qiynaladi.

```css
/* MOBILE FIRST (To'g'ri yo'l) */

/* 1. Avval telefon uchun (Default) */
.quti {
  display: block; /* Ustma-ust */
  padding: 10px;
}

/* 2. Keyin Planshet va Kompyuter uchun */
@media (min-width: 768px) {
  .quti {
    display: flex; /* Yonma-yon */
    padding: 20px;
  }
}
```

### Sehrli o'lchov birliklari (Viewport Units)
Ekranning to'liq balandligi yoki kengligiga qarab moslashish uchun `%` (foiz) har doim ham ishlayvermaydi. Buning uchun `vh` (Viewport Height) va `vw` (Viewport Width) bor.
- `100vh` = Ekranning 100% balandligi
- `100vw` = Ekranning 100% kengligi

### Ko'p uchraydigan xatolar va muammolar (Pitfalls)
**Telefon brauzeridagi "Address Bar" muammosi (100vh bug)**
Mobil Safari (iPhone) da ekranning pastidagi qidiruv paneli ekranni siqadi va `100vh` bergan sahifangiz yarmi kesilib qoladi!
*Yechim:* Yangi chiqqan `dvh` (Dynamic Viewport Height) ni ishlating. U panel paydo bo'lsa darhol kichrayadi.
```css
.hero-qism {
  height: 100vh; /* Eski brauzerlar uchun */
  height: 100dvh; /* Yangi brauzerlar uchun moslashuvchan */
}
```

## Eng Yaxshi Amaliyotlar (Best Practices)
- **Responsive Rasmlar:** Katta rasmni telefonga yuklash — bu jinoyat! Buning o'rniga HTML ning `<picture>` tegini ishlating.
```html
<picture>
  <source media="(max-width: 768px)" srcset="kichik-rasm.jpg">
  <img src="katta-rasm.jpg" alt="Rasm">
</picture>
```
- **Matnlarni Responsive qilish (`clamp()`):** Fontlarni `@media` orqali qayta-qayta yozmaslik uchun `clamp()` dan foydalaning.
```css
h1 {
  /* Eng kami 16px, O'rtacha hisob 5vw ga qarab o'sadi, Eng ko'pi 32px */
  font-size: clamp(16px, 5vw, 32px);
}
```

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### "Under the hood" (Qopqoq ostida nimalar ro'y beradi)
`@media` query ishlaganda nima ro'y beradi? Brauzer oyna (window resize) o'zgarganda **Layout Trashing** qiladi. Ya'ni barcha elementlarning joylashuvini qayta hisoblab chizadi. Lekin bizda hozir **Container Queries** nomli juda zo'r yangi asbob bor. 
Agar bizning sahifamizda 3 ta `Card` bo'lsa va ulardan biri kichik yonga yopishib qolgan (Sidebar) ichida yashasa, `@media` uni "Ekran kattalashdi!" deb yoyib yuboradi. Lekin aslidachi? U yashab turgan quti hali ham mitti!

### Container Queries (Inqilob)
Container queries ekran o'lchamiga emas, o'zi yashab turgan **Ota Quti** ning o'lchamiga qarab ishlaydi!

```css
/* 1. Ota qutiga ism qo'yamiz va uning o'lchamini kuzatamiz */
.kardning-otasi {
  container-type: inline-size;
  container-name: karta;
}

/* 2. Bola karta o'z otasi 400px dan oshsagina o'zgaradi! (Ekran emas) */
@container karta (min-width: 400px) {
  .karta-bolasi {
    display: flex; /* Katta bo'lib yonma-yon o'tadi */
  }
}
```
Bu kelajak arxitekturasining asosidir (Component-driven design). Siz bitta komponent yasaysiz, uni xohlagan joyingizga qo'yasiz va u o'z joyiga qarab qanday shaklga kirishni o'zi hal qiladi.

### Dark Mode (Tungi rejim) Integratsiyasi
Tungi rejim ham zamonaviy Responsivlik qatoriga kiradi (Muhitga moslashish). JavaScript bilan uzun kod yozmasdan, CSS ni o'zi orqali foydalanuvchining telefonidagi rejimni ushlash mumkin:

```css
/* Standart (Kunduzgi) */
:root {
  --bg-rang: white;
  --text-rang: black;
}

/* Tungi rejim aniqlansa (OS level) */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-rang: #1a1a1a;
    --text-rang: white;
  }
}

body {
  background: var(--bg-rang);
  color: var(--text-rang);
}
```

### Intervyu Savollari (Qiyin daraja)
**1. `<meta name="viewport" content="width=device-width, initial-scale=1.0">` nima uchun yozilishi shart va u yo'q bo'lsa nima bo'ladi?**
*Javob:* U bo'lmasa, mobil brauzer saytingizni kompyuter sayti deb o'ylaydi va uni (masalan 980px lik ekran shaklida) chizadi, keyin esa telefonga siqish uchun butun saytni kichraytirib (zoom out) yuboradi. Foydalanuvchi barmoqlari bilan matnni kattalashtirib o'qishiga to'g'ri keladi.

**2. `@media` va `@container` o'rtasidagi tafovut qachon namoyon bo'ladi?**
*Javob:* `@media` har doim global `Window` (ekran) kengligiga bog'liq. `@container` esa lokal konteynerga. Micro-frontendlar yoki Reusable UI kutubxonalar yozayotganda, komponentni turli layutlarga qo'yilganda to'g'ri ishlashi uchun doimo `@container` ishlatish xavfsizroq va to'g'riroq.

---

## Xulosa

| Daraja | Yondashuv va Fokus | Nimalarga qodir bo'lish kerak? |
| --- | --- | --- |
| **Junior** | **Mantiq:** CSS da `@media` orqali moslashishni biladi. | Ekranga qarab fontlarni va qutilarni kichraytira oladi. |
| **Middle** | **Qo'llash:** Mobile-first yondashuvi va moslashuvchan rasmlarni biladi. | `clamp()`, `100dvh` va `<picture>` yordamida tezkor va sifatli dizayn yig'adi. |
| **Senior** | **Arxitektura:** Container Queries va Preferencelarni yaxshi ko'radi. | Sayt muhitini (Dark/Light mode) va har qanday murakkab komponentning o'zini-o'zi boshqarishini (Container) tizimlashtira oladi. |
