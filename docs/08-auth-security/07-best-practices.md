# Security Best Practices

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchi sifatida biz yozayotgan ilovalarda yuzlab ulanish nuqtalari, formalar, API chaqiriqlar va ma'lumot saqlash joylari bo'ladi. Xavfsizlik bo'yicha eng yaxshi amaliyotlarni (Best Practices) bilmaslik va tizimni faqat bitta himoya vositasiga (masalan, faqat auth tokenga) ishonib topshirish — uyni faqatgina eshik qulfi bilan himoya qilishga o'xshaydi. Ko'p qatlamli xavfsizlik (Defense in depth) usullarini bilish va ularni har kuni qo'llash loyihamizni har qanday professional kiberhujumdan saqlab qoladi.

> [!NOTE]
> **Real-hayot analogiyasi: "Bankni Himoya Qilish (Defense in Depth)"**  
> Tasavvur qiling, siz bank binosini himoya qilishingiz kerak.  
> - **Faqat bitta himoya (Yomon):** Faqatgina bankning old eshigiga kalit o'rnatgansiz (masalan, oddiy login-parol). Agar o'g'ri kalitni o'g'irlasa yoki eshikni buzsa, to'g'ridan-to'g'ri pul seyfiga kirib oladi.  
> - **Ko'p qatlamli himoya (Yaxshi - Defense in depth):** Bank oldida qorovul bor (Layer 1 - WAF/Network). Eshikda kalit bor (Layer 2 - Auth). Ichkarida kameralar bor (Layer 3 - Audit/Monitoring). Pul seyfining o'zida ham alohida seyf kodi va barmoq izi tekshiruvi bor (Layer 4 - Data Encryption/Authorization). Agar o'g'ri birinchi va ikkinchi qatlamdan o'tsa ham, baribir seyfni ocha olmaydi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchilar ko'pincha kod yozish va funksionallik qo'shishga e'tibor berishadi, xavfsizlik esa chetda qoladi. Asosiy e'tibor Parollar va Formadagi ma'lumotlarda bo'lishi kerak.

### Parollarni Saqlash
Parollarni hech qachon Oddiy Matn (Plain Text) holatida saqlamang. Agar sizning DataBaza(DB)ngizni kimdir ko'chirib olsa barcha userlar paroli ochiq oydin ko'rinib qoladi!
```javascript
// ❌ XATO
db.users.create({ password: "mysecretpassword" })

// ✅ TO'G'RI: Bcrypt orqali Hash qilib saqlash
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash("mysecretpassword", 12);
db.users.create({ password: hashedPassword })
```

### Inputlarni Tekshirish (Input Validation)
Foydalanuvchi "Yosh" (Age) degan joyga harf yozishi mumkin, "Ism" degan joyga HTML tag `<script>` yozishi mumkin. 
Har doim Backend da ma'lumotni to'liq tekshiring! (Joi, Zod kabi kutubxonalardan foydalaning). Frontend dagi tekshiruv (HTML `required` yoki JS form validation) - bu Xavfsizlik emas, u faqat UX uchun. Haker Frontendni aylanib o'tib Postman dan to'g'ri API ga so'rov tashlay oladi.

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi Dastur darajasidagi (Application Layer) xavfsizlik va ruxsatlar (Authorization) ni to'g'ri shakllantirishi kerak.

### 1. IDOR (Insecure Direct Object Reference)
Foydalanuvchilar orasidagi ma'lumotlar ajratilishi.
Tasavvur qiling, sizning tizimingizda cheklar (invoices) beradigan API bor: `GET /api/invoices/105`
Agar foydalanuvchi (id=1) 105 raqamini 106 ga o'zgartirib so'rov jo'natsa u birovning chekini ko'ra oladimi?
```javascript
// ❌ ZAIF API
app.get('/api/invoices/:id', async (req, res) => {
  const invoice = await db.invoices.findById(req.params.id); 
  // U barchani Invoice ni oqiy oladi!
  res.json(invoice);
});

// ✅ XAVFSIZ API
app.get('/api/invoices/:id', async (req, res) => {
  const invoice = await db.invoices.findOne({
    id: req.params.id,
    userId: req.user.id  // QAT'IY ShART: Faqat o'ziga tegishlilarini oxtar!
  });
  res.json(invoice);
});
```

### 2. Dependency Scan (Kutubxonalar xavfsizligi)
Biz npm orqali minglab paketlarni yuklab olamiz. Ularning birortasida teshik bo'lsa butun tizim qulaydi. Shuning uchun loyihada muntazam ravishda `npm audit` komandasini ishga tushirish (CI/CD ga qoshib qoyish) kerak. U barcha paketlarning eskirgan yoki xavfli versiyalari haqida ogohlantiradi.

### 3. Rate Limiting (So'rovlar sonini cheklash)
Botlar tizimingizni "Brute Force" (parolni ming xil taxmin qilib ko'rish) orqali buzmasligi uchun har bir IP manziliga Check-lov qoyish kerak.
```javascript
// Express js misolida
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 5,  // Faqat 5 marta urinish mumkin
  message: { error: 'Too many login attempts' }
});
app.use('/api/auth/login', authLimiter);
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi butun boshli "Defense in Depth" arxitekturasini, Kriptografiya va Xavfsizlik Siyosati (Security Policies) ni loyihalashtiradi.

### Defense in Depth Arxitekturasi
Xavfsizlik 4 qatlamda (Layer) bo'lishi kerak:
1. **Network (Tarmoq qatlami):** WAF (Web Application Firewall), DDoS dan himoya (masalan, Cloudflare).
2. **Transport (Uzatish qatlami):** Majburiy HTTPS, HSTS (Strict-Transport-Security). Barcha HTTP so'rovlarni HTTPS ga redirect qilish.
3. **Application (Dastur qatlami):** XSS/CSRF himoyasi (HttpOnly, SameSite, CSP).
4. **Data (Ma'lumotlar qatlami):** Kriptografiya. Bazadagi Eng muhim narsalar (Masalan, Bank Karta raqamlari) ni Encrypt (AES-256) qilib saqlash (Plain text da EMAS). Bazani o'g'irlasa ham kodlarni o'qiy olmasligi uchun.

### Security Headers (Helmet)
Express.js da `helmet` paketi orqali brauzerga qat'iy Security Header larini jo'natish. Bu XSS, Clickjacking kabi 10 dan ortiq muammolarni bloklaydi.
```javascript
const helmet = require('helmet');

// Eng muximi: CSP (Content Security Policy)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"], // Faqat o'zimni domendan kelgan narsani yukla
    scriptSrc: ["'self'"],  // Tashqaridan (CDN) kelgan har qanday Javascript bloklanadi (XSS ga eng zo'r dori)
    objectSrc: ["'none'"],
  }
}));
```

### Xavfsizlik Auditi (Audit Logging)
Bank yoki yirik tizimlarda kim nima qilganini yozib borish (Audit Log) qonunan majburiydir.
- Foydalanuvchi qachon kirdi? Qaysi IP dan kirdi? Parolni necha marta xato kiritdi?
- Admin kimlarga qanday ruxsat berdi? Qachon bazadan nimanidir o'chirdi?
Bular oddiy bazaga emas, o'zgartirib bo'lmaydigan Maxsus Logger tizimlariga yozib boriladi va monitoring (Grafana/Kibana) orqali Anomaliyalar aniqlanadi (masalan bitta user 1 minutda 100 ta davlatdan kirdi).

### Intervyu Savoli
**"Defense in Depth nimani anglatadi va agar men tizimda JWT Token bilan Autorizatsiya ni to'g'ri qo'ygan bo'lsam, Defense in Depth ga qanday ehtiyoj bor?"**
*Javob:*
Defense in Depth - bu xavfsizlikni bitta emas, bir nechta mustaqil qatlamlar orqali ta'minlash strategiyasi. Siz faqat JWT ga ishonsangiz, bu Application (Dastur) qatlamidagi yagona himoya bo'ladi. Agar siz yozgan kodda (Application Layer) kichik mantiqiy xato (Bug) ketsa yoki npm paketdan zaiflik chiqib (Masalan, log4j) xaker Serveringiz ichiga kirib olsa (RCE), sizning JWT kodingiz hech narsani hal qila olmaydi. Chunki haker to'g'ridan to'g'ri DataBazaga (Data Layer) ulanib hamma narsani olib chiqib ketishi mumkin. Ammo sizda Data Layer (Kriptografiya qatlami) ham bo'lsa, ma'lumotlar bazada shifrlangan (Encrypted) holatda yotgan bo'ladi va haker bazani ko'chirib olsa ham uni o'qiy olmaydi. Network Layer (WAF) esa bunday g'ayritabiiy so'rovlarni boshidayoq bloklab qolishi mumkin. 

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Ko'p qatlamli xavfsizlik (Defense in Depth) madaniyatini shakllantiring:** Hech qachon xavfsizlik uchun faqatgina bitta qatlam (masalan, faqat input validation yoki faqat Token) etarli deb o'ylamang. Network, Transport, Application va Data darajasida himoyani barpo qiling.
2. **Uchinchi tomon paketlarini (NPM) muntazam tekshiring:** `npm audit` yoki Snyk toollari orqali loyihangizdagi kutubxonalarning zaifliklarini avtomatik tekshirib boring va ularni o'z vaqtida yangilang.
3. **Mijozlar maxfiyligini birinchi o'ringa qo'ying:** Foydalanuvchilarning parollarini serverda aslo ochiq holda saqlamang (`bcrypt` yoki `argon2` yordamida hashlang). Shuningdek, mijozning shaxsiy va moliyaviy ma'lumotlarini (PII) DataBazada shifrlangan (Encryption At Rest) holatda saqlang. Kliyent tomonida (brauzerda) esa hech qanday maxfiy API kalitlarni (Secret Keys) qoldirmang.

---

## Xulosa

Security Best Practices bo'yicha yakuniy xulosa:

| Xavfsizlik Qatlami | Asosiy Vositalar | Maqsadi |
| --- | --- | --- |
| **Network (Tarmoq)** | CDN, Cloudflare WAF, Rate limiting | DDoS, botlar hujumi va katta trafikli attacklarni to'sish |
| **Transport (Uzatish)** | HTTPS, HSTS, TLS 1.2+ | Ma'lumotlarni yo'lda o'g'irlash (MitM) dan himoyalash |
| **Application (Dastur)** | Input Validation (Joi), IDOR himoyasi, CSP, CSRF-Token | XSS, CSRF, Injection va ruxsatsiz kirishlarni (Bugs) to'sish |
| **Data (Ma'lumot)** | Hash (bcrypt), AES Encryption, Key vaults | Ma'lumotlar bazasi sizib chiqqanda ma'lumotlarni o'qib bo'lmasligini ta'minlash |

Xavfsizlik bir martalik qilinadigan ish emas, u muntazam tekshiruv, yangilanish va monitoring (Audit) ni talab qiladigan jarayondir.

**Keyingi qadam:** [09-realtime-systems](../09-realtime-systems/index.md) - Real vaqtda ma'lumot almashish va WebSockets, SSE kabi texnologiyalar orqali jonli ilovalar qurish.
