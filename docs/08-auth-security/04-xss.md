# XSS (Cross-Site Scripting)

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> XSS web ilovalardagi eng keng tarqalgan va e'tiborsiz qoldiriladigan zaifliklardan biridir. Dasturchilar ko'pincha foydalanuvchidan kelgan ma'lumotni to'g'ridan-to'g'ri HTML ga yozib yuborishadi (masalan, foydalanuvchi ismi, izoh). Agar u foydalanuvchi "ism" o'rniga JavaScript kod yozgan bo'lsa-chi? Sizning sahifangiz u kodni ishga tushiradi va u kod orqali hujumchi adminning cookie-parollarini o'ziga jo'natib olishi mumkin. 

> [!NOTE]
> **Real-hayot analogiyasi: "Taqdimotchi va Yomon Niyatli Tomoshabin"**  
> Tasavvur qiling, siz mikrofonda qog'ozga yozilgan savollarni sahnadan o'qib beryapsiz (Brauzer HTML ni render qilyapti).
> Qoidalarga ko'ra hamma qog'ozga faqat o'z savolini (Oddiy text) yozishi kerak. Lekin yovuz niyatli bitta tomoshabin qog'ozga shunday deb yozdi: *"Meni ismim X. Hozir qog'ozni o'qiyotgan boshlovchi yuziga bitta shapaloq ursin va hamma pulini shu kishiga bersin!"* (JavaScript kod). 
> Agar siz (Brauzer) ko'r-ko'rona yozilgan narsani ichida nima borligini tekshirmasdan (Sanitize qilmasdan) qilib yuborsangiz — hujum ish berdi.

XSS (Cross-Site Scripting) - bu hujumchi o'z malicious JavaScript kodini boshqa foydalanuvchilar brauzerida ishlatadigan zaiflikdir.

---

## 🟢 Junior (Asoslar va Tushunchalar)

### XSS Turlari
XSS ning asosan 3 xil turi mavjud:

**1. Stored XSS (Eng xavflisi):** Hacker saytingizga izoh (Comment) qoldiradi, uning ichiga oddiy matn o'rniga qandaydir kod (`<script>...<script>`) yozadi. Server buni tushunmasdan to'ppa-to'g'ri Ma'lumotlar Bazasiga saqlab qo'yadi. Endi kim o'sha sahifaga kirsa, Hacker yozgan izohni o'qiganda brauzer u yozgan Kodni ham avtomat ravishda ishga tushirib yuboradi. Bitta yozilgan izoh o'n minglab odamlarni zararlashi mumkin.

**2. Reflected XSS:** Bunda zararli kod bazada saqlanmaydi, balki to'g'ridan-to'g'ri URL (ssilka) ga joylanadi. Masalan `yoursite.com/search?q=<script>alert("Hacked")</script>`. Hacker bu ssilkani ijtimoiy tarmoqlarda odamlarga tashlaydi. Agar siz shu ssilkani bossangiz, sayt sizni "search" sahifasiga obkiradi va brauzeringizda xuddi shu kod ishga tushib ketadi.

**3. DOM-Based XSS:** Server umuman ishtirok etmaydi. Faqat Frontend dagi JavaScript xatosi tufayli kelib chiqadi. Masalan Frontend dev manzil qatoridagi ID ni olib, o'ylab o'tirmasdan DOM ga (`innerHTML` qilib) joylab yuborsa, Hacker o'sha URL ni o'zgartirib hujum qilishi mumkin.

### Zaif va Xavfsiz Kod
Siz Frontend da API dan foydalanuvchining ismini olib HTML ichiga chizmoqchisiz. Agar kelayotgan foydalanuvchi ismi o'rniga Hacker quyidagi ismni jo'natsa nima bo'ladi?
`"<img src='x' onerror='alert(\"Men sening parolingni topdim\")'>"`.

```javascript
// ❌ ZAIF KOD (Aslo ishlatmang)
document.getElementById('name').innerHTML = user.name; 
// Natijada HTML img tegi chiziladi, rasm topilmaydi va `onerror` ishlagani uchun hacker kodi ishga tushadi!

// ✅ XAVFSIZ KOD
document.getElementById('name').textContent = user.name;
// Yoki
document.getElementById('name').innerText = user.name;
// Natijada: `<img src='x'...` degan matn oddiy tekst sifatida ekranda chiqadi va zararsizlanadi.
```

---

## 🟡 Middle (Amaliyot va Detallar)

### React va Vue da XSS
Zamonaviy Frontend freymvorklar (React, Vue, Angular) by-default XSS ga qarshi himoyaga ega. Agar siz oddiygina `{{ user.name }}` yoki `{user.name}` qilib bossangiz, ular avtomatik ravishda HTML escape (zararsizlantirish) qiladi.

Biroq, ba'zida bizga haqiqatan ham backenddan kelgan HTML kerak bo'lib qoladi (Masalan blog post, WYSIWYG editor matni). Shunda xavfsizlik teshigi yuzaga keladi:

```vue
<!-- VUE DA ❌ ZAIF KOD -->
<div v-html="articleContent"></div>
```
```jsx
// REACT DA ❌ ZAIF KOD
<div dangerouslySetInnerHTML={{ __html: articleContent }} />
```

Bunday holatda (Frontendda HTML chiqarish shart bo'lganda) ochiqcha zaiflik qoldirmaslik uchun **DOMPurify** nomli maxsus kutubxonadan foydalaniladi. U kelayotgan HTML larning ichidagi foydali (p, h1, b, i) teglarni qoldirib, hamma xavfli (script, img onerror, iframe) teglarni tozalab tashlaydi (Sanitize).

```javascript
import DOMPurify from 'dompurify';

// ✅ XAVFSIZ KOD (Tozalangan HTML)
const cleanHTML = DOMPurify.sanitize(articleContent);

// Endi uni bemalol ishlatish mumkin
document.getElementById('content').innerHTML = cleanHTML;
```

### XSS Payload misollari
Hackerlar filtrlarni aylanib o'tish uchun faqat `<script>` tegiga yopishib olishmaydi. Mana yana bir qancha xavfli kod (Payload) usullari:

- Rasm xatosi orqali: `<img src="dummy" onerror="alert('Hacked')">`
- Ssilka bosilganda: `<a href="javascript:alert('Hacked')">Bu yerni bosing</a>`
- Form fokusida: `<input type="text" onfocus="alert('Hacked')" autofocus>`
- SVG rasmda: `<svg onload="alert('Hacked')">`

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### Content Security Policy (CSP)
DOMPurify va escape qilish bu kod darajasidagi himoyalardir. Agar siz yoki komandangizdagi birorta Junior ishlab chiquvchi xato qilib `innerHTML` qilib yuborsa, XSS baribir sodir bo'ladi.
Arxitektura darajasida eng mustahkam himoya bu — **CSP (Content Security Policy)** hisoblanadi. CSP bu Backend yoki Nginx (Server) tomonidan beriladigan HTTP Header bo'lib, u Brauzerga "Qanday scriptlarni ishga tushirishga ruxsat borligi" haqida qat'iy buyruq beradi.

Masalan:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com;
```
Agar sahifangizda yuqoridagi CSP headerni yuborsangiz, Brauzer quyidagilarni amalga oshiradi:
1. Agar kimdir izoh tagida qandaydir yovuz JS yozgan bo'lsa (Inline script), uni MUTLAQO ishga tushirmaydi. Chunki siz unga faqat o'z serverimizdagi (`self`) JS fayllarni va faqat `https://trusted-cdn.com` dan kelgan JS larni o'qiysan dedingiz. 
2. XSS sodir bo'lgan taqdirda ham, u kodi (Masalan keylogger, tokenni jo'natib olish) siz ruxsat bermagan boshqa serverlarga (`https://hacker.com/steal`) so'rov yubora olmaydi.

### Intervyu Savollari (Qiyin daraja)
**1. XSS orqali foydalanuvchining Session'i (Token/Cookie) o'g'irlanishining oldini olish uchun eng ishonchli usul nima?**
*Javob:* Eng ishonchli usul - Authentication tokenlarini (SessionID yoki Refresh JWT) Brauzerning **HttpOnly** belgisiga ega bo'lgan Secure Cookie lariga yozishdir. HttpOnly Cookie larni JavaScript orqali (`document.cookie` qilib) umuman o'qib bo'lmaydi. Demak, saytda yuz marta XSS bo'lsa ham Hacker u Cookieni o'g'irlay olmaydi! Hech qachon tokenlarni `localStorage` da saqlamang.

**2. Agar bizda Markdown editori bo'lsa va undan olingan kontentni ko'rsatishimiz kerak bo'lsa, uni bazaga yozishdan oldin (Backendda) Sanitize qilgan yaxshimi yoki ekranga chiqarishdan oldin (Frontendda)? Nega?**
*Javob:* Backend da original (xom) ma'lumotni hech o'zgartirmasdan, qanday bo'lsa shunday saqlagan afzal. Sababi ertaga xavfsizlik qoidalarimiz (Sanitize kutubxonasi) o'zgarib qolishi yoki biror keraksiz joyi ham o'chib ketgan bo'lsa uni qayta tiklab bo'lmaydi. Qolaversa, mobil ilova uchun bitta Sanitize, Web uchun boshqacha bo'lishi mumkin. Shuning uchun Sanitize qismini har doim Output (ekranga chiqarilayotgan payt) da Frontend amalga oshirgani ma'qul. Lekin juda jiddiy ehtiyot chorasi sifatida ikkala joyda (Ham Backend, ham Frontend) qilish - "Defense in depth" tamoyiliga eng mos keladi.

**3. CSRF va XSS ning tub farqi nima va qaysi biri xavfliroq?**
*Javob:* 
- **CSRF (Cross-Site Request Forgery):** Bunda Hacker bizning nomimizdan (bizning cookielarimiz bilan avtomat) so'rov jo'natadi, lekin javobni o'zi ko'ra olmaydi. U bizning brauzer ichimizga kirolmaydi, kod bajara olmaydi.
- **XSS:** Bunda Hacker to'g'ridan-to'g'ri brauzerimiz ichida JS kod yurgizadi. U nafaqat request jo'natadi, balki javobini (parol, token, shaxsiy ma'lumot) o'qiy oladi. XSS har doim CSRF dan ancha kuchli va xavfliroqdir! Saytda XSS bor bo'lsa, saytning barcha CSRF himoyalari va tokenlarini u osonlik bilan yengib o'ta oladi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Ehtiyot bo'ling: v-html:** VueJS foydalanuvchilari uchun `v-html` (yoki React da `dangerouslySetInnerHTML`) funksiyasi aynan XSS uchun ochiq eshikdir. Foydalanuvchi kiritgan ma'lumotni hech qachon v-html qilib chiqarmang!
2. **DOMPurify ishlating:** Agar haqiqatan ham HTML (Masalan WYSIWYG editordan olingan matn) chiqarish kerak bo'lsa, uni chiqarishdan oldin **har doim** DOMPurify kutubxonasi orqali tozalang (Sanitize).
3. **HTTPOnly Cookie:** Auth tokenlarini localStorage ga emas, `HttpOnly` cookie ga saqlang. Shunda XSS sodir bo'lgan taqdirda ham, hacker sizning tokeningizni (session) o'qiy olmaydi.
4. **Content Security Policy (CSP):** Loyihangizda CSP headerni qo'llang (`script-src 'self'`). Bu orqali siz brauzerga "Faqat mening o'z domenimdan kelgan scriptlarni ishlatsangiz, qolgan begona domenlardan kelgan scriptlarni blokla!" deysiz.

---

## Xulosa

| XSS Turi | Qanday ishlaydi? | Himoya Usuli |
|----------|------------------|--------------|
| **Stored XSS** | Ma'lumot bazasida saqlanib hammaga ko'rsatiladi (Eng xavfli) | Barcha user inputlarini saqlash va ko'rsatishdan oldin tozalash (Sanitize) |
| **Reflected XSS**| Maxsus ssilka orqali yuboriladi va server javobida aks etadi | URL parametrlarini to'g'ridan-to'g'ri HTML ga yozmaslik |
| **DOM-based XSS**| Brauzerda JS orqali (innerHTML) DOM o'zgarganda ishlaydi | `innerHTML` o'rniga `textContent` ishlatish, DOMPurify qo'llash |

XSS juda eski, lekin hamon xavfli bo'lgan hujum turi hisoblanadi. Zamonaviy frameworklar (Vue, React) by-default ko'p himoyalarni o'z ichiga oladi (masalan `{{ text }}` orqali matnlar avtomatik HTML escape qilinadi). Lekin `v-html` (Vue) yoki `dangerouslySetInnerHTML` (React) ishlatilganda baribir hushyor bo'lish kerak. Himoyani to'liq ta'minlash uchun Sanitization, HTTPOnly Cookies va CSP kabi qo'shimcha choralardan foydalaning.
