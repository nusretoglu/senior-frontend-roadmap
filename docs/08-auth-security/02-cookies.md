# Cookies (Kukilar)

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Veb-saytingiz xavfsizligini ta'minlashda cookielarni to'g'ri sozlash eng muhim omillardan biridir. Agar siz auth tokenlarni (masalan JWT) cookie-da saqlab, unga `HttpOnly` va `Secure` bayroqlarini (flags) qo'ymasangiz, xakerlar oddiygina XSS hujumi orqali foydalanuvchining sessiyasini osongina o'g'irlashi mumkin. Yoki `SameSite` atributini noto'g'ri belgilasangiz, saytingiz CSRF hujumlariga osonlikcha taslim bo'ladi. Cookie xavfsizligini chuqur tushunish — sizni professional darajadagi xavfsiz frontend dasturchiga aylantiradi.

> [!NOTE]
> **Real-hayot analogiyasi: "Mehmonxona Kalit-Kartasi (Key-Card)"**  
> Siz mehmonxonaga bordingiz va ro'yxatdan o'tdingiz (Login). Admin sizga xonangizning plastik kalitini (Cookie) berdi.  
> - **HttpOnly yo'qligi:** Kalitingizni stol ustida ochiq qoldirdingiz, uni istalgan odam (XSS - zararli skript) ko'rib, nusxa olib ketishi mumkin.  
> - **HttpOnly borligi:** Kalit maxsus quti ichida bo'lib, uni faqat eshik qulfi (Server) o'qiy oladi, siz ham, boshqalar ham qutini ocha olmaysiz.  
> - **Secure borligi:** Bu kalit faqat mehmonxonaning maxsus xavfsiz liftlarida (HTTPS) ishlaydi, ko'chadagi zinalarda (HTTP) ishlamaydi.  
> - **SameSite:** Kalit faqat shu mehmonxona hududida (Same-Site) ishlaydi, uni ko'chada boshqa birov (boshqa domen) sizni aldab ishlata olmaydi (CSRF hujumi).

Cookie - bu server tomonidan yuborilgan va brauzer tomonidan kompyuter xotirasida saqlanadigan kichik ma'lumot parchasidir (Max: 4KB). Har safar brauzer o'sha serverga murojaat qilganda, ushbu cookie'larni ham qo'shib yuboradi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi Cookielarning asosiy vazifasi va u Frontend (JS) dan ko'ra asosan Backend tomonidan boshqarilishini tushunishi kerak.

### Cookie vs LocalStorage
Nimaga biz Tokenni shunchaki LocalStorage da saqlamaymiz?
Chunki LocalStorage dagi ma'lumotni saytdagi xohlagan JS kodi (hattoki siz ishlatgan qandaydir shubhali NPM package) o'qib olishi mumkin `localStorage.getItem('token')`.
Cookie ni esa Backend shunday yuboradiki (HttpOnly deb), JS kod yordamida `document.cookie` deb uni UMUMAN o'qib bo'lmaydi. U kadr ortida (shadow) brauzer va server orasida harakatlanadi.

### Qanday o'rnatiladi?
Server (masalan Express.js) foydalanuvchi login qilganda, unga javob qaytarishda quyidagi Header'ni (Sarlavha) qo'shib yuboradi:
```http
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict
```
Shu ondayoq brauzer buni o'z xotirasiga yozadi va endi har doim serverga nimadir so'rov (masalan `/profile`) jo'natsa bu ma'lumotni jimgina qo'shib yuboradi.

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi har bir Cookie atributi nimaga javob berishini yaxshi biladi.

### Asosiy Atributlar

1. **HttpOnly (JS uchun yopiq):** 
Ushbu bayroq (flag) yoqilganda, Frontend tarafda `document.cookie` deb uni o'qish imkonsiz bo'lib qoladi. Bu XSS (Cross Site Scripting - birov saytingizga tushunarsiz javascript yozib tokeningizni o'g'irlashi) ga qarshi 1-raqamli qalqon hisoblanadi.

2. **Secure (Faqat HTTPS):** 
Ushbu bayroq yoqilsa, Cookie faqatgina yopiq (HTTPS) tarmoqlardagina serverga qarab uchadi. Agar sayt HTTP (xavfli, himoyasiz) bo'lsa, brauzer Cookieni o'zida saqlab qoladi va yubormaydi (Demak Man-in-the-Middle - O'rtakash tarmoq qaroqchilari uni tutib ololmaydi). Localhost (HTTP) uchun bu qoida istisno.

3. **Max-Age va Expires (Muddati):**
Qachon cookie o'chib ketishi. Agar bular kiritilmasa Cookie "Session" (Vaqtinchalik) cookie hisoblanadi va foydalanuvchi brauzerni yopishi bilan o'chib ketadi.

### SameSite (Boshqa saytlarga munosabat)
Tasavvur qiling siz `bank.com` ga login qildingiz.
Sizga Cookielar o'rnatildi. Keyin siz `hacker.com` ga kirdingiz. Xaker sayt ichida tugma bor: "Menga bos!". Tugmani bossangiz u aslida fonda `bank.com/transferMoney` API siga so'rov jo'natadi. Siz Bankka login qilib bo'lganingiz uchun brauzeringiz srazu "Kalitingiz"ni (Cookieni) ham qo'shib yuboradi va pulingiz ketadi. Bu — CSRF (Cross-Site Request Forgery) hujumi.

Buni to'xtatish uchun **SameSite** atributi bor:
- **SameSite=Strict**: "Agar so'rov boshqa saytdan (hacker.com) dan kelayotgan bo'lsa, qat'iyan Cookielarni unga qo'shib jo'natma!"
- **SameSite=Lax**: "Tashqaridan form/tugma bosilganda jo'natma, lekin tashqaridan kimdir link orqali bizning saytimizga qarab kirsa (masalan telegramdan link bosib) unda jo'nat (Aks holda u odam telegramdan o'tganida saytda logout bo'lib qoladi)". Bu eng balansli yechim (Default).
- **SameSite=None**: "Hammasiga ruxsat" (Faqat iframe ichida 3-party ishlar uchun kerak. Bunda Secure=true qilish majburiy).

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchilar Cookie Prefixes (Old qo'shimchalar) va Arxitektura dizaynini quradilar.

### Cookie Tossing va Prefixlar
Aytaylik sizning ajoyib saytingiz `example.com`. 
Uning e'tiborsiz qoldirilgan, xavfsizligi past bo'lgan sub-domeni bor: `forum.example.com`.
Agar xaker o'sha sub-domen orqali buzib kirsa, u JS kod yozib `domain=.example.com` uchun (Ya'ni hamma domeningiz uchun) o'zining "Zaharli" cookiesini barcha sub-domenlarga sochib (Toss) yuborishi mumkin. Natijada sizning asosiy `example.com` dagi foydalanuvchilar ham uning zaharli cookiesidan ta'sirlanadilar.

Buning yechimi Cookie nomiga maxsus **Prefix (old qo'shimcha)** qo'shishdir:
1. **`__Secure-`** prefiksi (Masalan: `__Secure-sessionId=123`): Bu cookieni faqaaat HTTPS tarmoqdangina o'rnatish mumkin (HTTP dan turib o'rnatib bo'lmaydi).
2. **`__Host-`** prefiksi (Masalan: `__Host-sessionId=123`): Bu eng xavfsizi. Bunda 3 ta shart qat'iy talab qilinadi: Secure=true bo'lishi shart, Path=/ bo'lishi shart, va u hech qanday Sub-domenga o'tib ketolmaydi (Domain atributini o'rnatish taqiqlanadi). Shuning uchun xaker qandaydir sub-domendan turib uni siza tiqishtira olmaydi.

### Intervyu Savoli
**"Auth token (JWT) larni saqlashda LocalStorage, SessionStorage va Cookie larning xavfsizlik jihatidan farqi nima?"**
*Javob:*
- **LocalStorage / SessionStorage**: Bularga istalgan javascript kodi yordamida kirish mumkin. Agar loyihada ishlatilayotgan biron bir kutubxonada (masalan npm paketda) zaharli kod bo'lsa, u tokenni osongina o'qib, o'g'irlab ketishi mumkin (XSS hujumi). CSRF xavfi esa yo'q, chunki u brauzer tomonidan avtomat qo'shilmaydi (qo'lda yoziladi).
- **Cookie (HttpOnly=true bilan)**: Bu eng xavfsiz joy. JavaScript uni umuman ko'rmaydi, shuning uchun XSS orqali uni o'g'irlashni imkoni yo'q. U kadr ortidan jimgina backendga borib kelaveradi. Lekin bunda CSRF xavfi yuzaga keladi (boshqa saytdan turib yuborilganda), uni oldini olish uchun Cookie ga albatta `SameSite=Strict` yoki `Lax` o'rnatish zarur.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **HttpOnly va Secure bayroqlarini doim yoqing:** Maxfiy ma'lumotlar saqlanadigan cookielarga (masalan, auth token) har doim `HttpOnly; Secure;` atributlarini o'rnating. Bu XSS orqali sessiyangizni o'g'irlashlarini deyarli to'liq bloklaydi.
2. **SameSite=Strict yoki Lax ishlatish:** CSRF (Cross-Site Request Forgery) hujumlaridan himoyalanish uchun SameSite atributini `Lax` (tavsiya etilgan eng normal variant) yoki `Strict` deb sozlang. `SameSite=None` ni faqat alohida domenlararo (cross-site) aloqa zarur bo'lsagina ishlating va bunda `Secure` majburiyligini unutmang.
3. **Prefixlardan foydalaning:** Eng yuqori xavfsizlik uchun muhim session cookielar nomiga `__Host-` prefiksini qo'shing (masalan `__Host-token=...`). Bu cookie-faylni faqat HTTPS orqali va faqat joriy domendagina ishlashini kafolatlaydi (subdomenlar ta'sir qilolmaydi).

---

## Xulosa

| Xavfsizlik darajasi | Atributlar | Natija |
| --- | --- | --- |
| **Xavfli (Zaif)** | `sessionId=123` | XSS va CSRF hujumlariga ochiq, hamma js uni o'qiy oladi |
| **O'rtacha** | `sessionId=123; HttpOnly; Secure` | XSS dan himoyalangan, biroq CSRF xavfi bor |
| **Yuqori (Tavsiya etiladi)**| `__Host-sessionId=123; HttpOnly; Secure; SameSite=Lax; Path=/` | XSS va CSRF dan maksimal himoya |

Cookielar zamonaviy Web ilovalarning asosi hisoblanadi. JWT tokenlarni LocalStorage ga saqlashdan ko'ra, HttpOnly Cookie da saqlash sizning ehtiyotkor va bilimli developer ekanligingizni bildiradi.

**Keyingi qadam:** [06-cors.md](./06-cors.md) - Brauzerlarda ruxsatsiz domenlarga so'rov jo'natish xavfsizligi va CORS qoidalari.
