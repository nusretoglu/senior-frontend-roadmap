# CORS (Cross-Origin Resource Sharing)

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Agar bitta saytdan (masalan `my-shop.com`) o'tirib boshqa bir saytning serveriga (masalan `bank-api.com`) to'g'ridan-to'g'ri so'rov yuborish hammaga ruxsat etilganida, internetdagi barcha pullar o'g'irlab ketilgan bo'lardi. CORS va SOP aynan shu narsani bloklash va himoya qilish uchun o'ylab topilgan brauzer qoidalari. Buning ishlashini tushunmaslik front-end dasturchilar eng ko'p duch keladigan "CORS Error" muammolariga olib keladi.

> [!NOTE]
> **Real-hayot analogiyasi: "Qo'shni davlatga vizasiz kirish"**  
> Tasavvur qiling, har bir Origin (Domen) bu alohida bir Davlat. 
> - **SOP (Same-Origin Policy):** Bu davlatning chegarasi. Siz o'z davlatingizda bemalol yura olasiz, lekin boshqa davlatga (boshqa domen API-ga) shunchaki o'tib keta olmaysiz. Chegarachilar (Brauzer) sizni o'tkazmaydi.
> - **CORS (Cross-Origin Resource Sharing):** Bu sizning VIZAngiz. Boshqa davlat (API Server) o'ziga xos viza qoidalarini (CORS Headers) joriy qilishi mumkin: "Faqat A davlatdan (Origin) kelgan mehmonlarni kiritaman". Agar vizangiz bo'lsa (Server Origin'izni tasdiqlasa), Brauzer sizni u davlatga o'tkazadi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

### SOP (Same-Origin Policy) nima?
Brauzerlarning oltin qoidasi: "Bir domenda ishlayotgan JavaScript boshqa domenning ma'lumotlarini o'qiy olmaydi". Bu qoida bizni qaroqchilardan himoya qiladi.

**Origin nima degani?**
Origin = Protocol + Host + Port. Ulardan bittasi farq qilsa ham u boshqa origin hisoblanadi.
- `https://sayt.com` (Sizning sayt)
- `https://sayt.com:8080` (Boshqa Origin - port farq qilyapti)
- `http://sayt.com` (Boshqa Origin - protocol farq qilyapti)
- `https://api.sayt.com` (Boshqa Origin - subdomain farq qilyapti)

### CORS (Cross-Origin Resource Sharing) Nima?
CORS bu — SOP degan qat'iy qoidani aylanib o'tish (ruxsat olish) mexanizmi. Agar siz `localhost:3000` dan turib `api.backend.com` ga fetch so'rov yuborsangiz, brauzer avval backenddan "Senga mana shu yerdan kelsam maylimi?" deb so'raydi. Agar backend "Ha, mayli" degan ruxsatnomani bermasa, brauzeringiz mashhur qizil xatoni beradi: `CORS Error`. 
Buni to'g'rilashning YAGONA yo'li - Backendchi kodni to'g'rilab, sizning domeningizga ruxsat berishi kerak. Frontentchi buni to'g'rilay olmaydi!

---

## 🟡 Middle (Amaliyot va Detallar)

### Simple Request vs Preflight (OPTIONS) So'rovlari

CORS da so'rovlar asosan 2 turga bo'linadi:

**1. Simple Request (Oddiy so'rovlar):**
Agar siz `GET` yoki oddiygina `POST` (faqat oddiy formalar bilan `application/x-www-form-urlencoded`) so'rovi yuborsangiz va uning ichiga hech qanday qiyin narsalar (masalan `Authorization: Bearer...`) qo'shmasangiz, bu "Simple Request" hisoblanadi. Brauzer so'rovni darhol backendga jo'natadi.

**2. Preflight Request (Oldindan tekshiruv):**
Lekin siz murakkabroq so'rov yuborsangiz (Masalan JSON jo'natish `Content-Type: application/json` yoki `PUT/DELETE` methodlar, yoki `Authorization` header), Brauzer haqiqiy so'rovni jo'natishdan oldin ehtiyotkorlik bilan **OPTIONS** degan method orqali kichkina tekshiruv so'rovini yuboradi. Bunga **Preflight** deyiladi.
1. Brauzer: `OPTIONS` "Senga PUT qilsam maylimi va Authorization yuborsamchi?"
2. Backend: `200 OK` "Ha, PUT ga ham ruxsat, Authorization ga ham".
3. Va faqatgina shundan keyingina brauzer haqiqiy PUT so'rovingizni yuboradi.

Demak, tarmog'ingizda (`Network` tabida) bitta so'rov 2 ta bo'lib ketayotgan bo'lsa (Biri OPTIONS, biri haqiqiy), bu muammo emas, bu Brauzerning Preflight yuborishi.

### CORS Headerlari
Backend sizga quyidagi headerlar orqali ruxsat beradi:
- `Access-Control-Allow-Origin: https://my-site.com` (Qaysi domen kirishiga ruxsat bor)
- `Access-Control-Allow-Methods: GET, POST, PUT` (Qaysi methodlarga ruxsat bor)
- `Access-Control-Allow-Headers: Authorization, Content-Type` (Qaysi custom headerlarga ruxsat bor)

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### Preflight ni Keshllash (Max-Age)
Har bir API so'rov uchun alohida OPTIONS so'rovi yuborilaversa, tizim ikki barobar ko'p yuklanadi (Backend ga ham, Internet tarmog'iga ham). Buning oldini olish uchun Backend `Access-Control-Max-Age` headerini yuborishi shart.
```http
Access-Control-Max-Age: 86400
```
Bu degani, brauzer OPTIONS dan olingan ijobiy javobni 24 soat (86400 soniya) davomida eslab qoladi. Va keyingi murakkab so'rovlarda to'ppa-to'g'ri haqiqiy requestni yuboraveradi.

### Credentials bilan ishlash (`Access-Control-Allow-Credentials`)
Agar bizning requestlarimiz ichida Cookie lar yoki maxsus Auth tokenlar borsa, u holda CORS xavfsizlik qoidalari ikki barobar qattiqlashadi.
1. Frontend fetch qilayotganda albatta `{ credentials: 'include' }` (yoki Axios da `withCredentials: true`) ni qo'shishi shart.
2. Backend albatta `Access-Control-Allow-Credentials: true` ni berishi shart.
3. **ENG MUHIMI:** Backend hech qachon `Access-Control-Allow-Origin: *` (Yulduzcha - hamma domen) deb ruxsat BERA OLMAYDI! Yulduzcha va Credentials ikkalasi bir paytda ishlamaydi. Backend domenni Aniq va Tiniq qilib nomma-nom qaytarishi kerak.

### Intervyu Savollari (Qiyin daraja)
**1. Frontendda kelib chiqayotgan CORS xatoni Frontendning o'zidan hal qilish (Aylanib o'tish) mumkinmi?**
*Javob:* Ishlab chiqarishda (Production) Yo'q! Chunki CORS - bu brauzerning backend bilan kelishib ishlaydigan qoidasi. Uni faqat backend to'g'rilaydi. Lekin, lokal rivojlantirish (Development) jarayonida, uni aylanib o'tish uchun Proxy server (Masalan Vite proxy yoki Webpack proxy) ishlatish mumkin. Bunda sizning lokal serveringiz backendga so'rov yuboradi, serverdan serverga jo'natilganda Brauzer o'rtada bo'lmagani uchun CORS xatosi umuman sodir bo'lmaydi.

**2. Tasavvur qiling API hammaga (Public) ochiq, `Access-Control-Allow-Origin: *` qilingan. Lekin shunda ham qandaydir ma'lumotlarni o'qiymiz desak o'qiy olmayapmiz, muammo nimada bo'lishi mumkin?**
*Javob:* Bunday muammo asosan `Access-Control-Expose-Headers` degan sozlama yo'qligida yuzaga keladi. SOP qoidasiga ko'ra, garchi origin ochiq bo'lsa ham, brauzer kelayotgan javobdagi ayrim headerlarnigina (Cache-Control, Content-Language, Content-Type) JavaScript ga o'qishga ruxsat beradi xolos. Agar bizning public API o'zining qandaydir maxsus headerida (masalan `X-Total-Count` paginatsiya uchun) ma'lumot yuborsa ham JS uni o'qiy olmaydi. Buni to'g'rilash uchun backend `Access-Control-Expose-Headers: X-Total-Count` ni ochiqchasiga yozib yuborishi kerak bo'ladi.

**3. CSRF va CORS ning farqi va bog'liqligi nimada?**
*Javob:* CORS ma'lumot o'qishni (Read) bloklasa, CSRF ma'lumot yuborishni (Write) suiiste'mol qilishdir. Hujumchi CORS sababli boshqa domen orqali sizning ma'lumotingizni o'qiy olmasligi mumkin (Qizil Error). Lekin o'ziga e'tibor bermasdan sizning domeningizdagi `/api/delete-user` degan URL ga rasm kabi (`<img src="/api/delete-user">`) zapros yuborsa, bu so'rov bemalol backendga yetib borib o'z ishini qilib qo'yadi. Ya'ni CORS hujumni manziliga yetib borishini bloklamaydi (U yetib boradi), faqat uning natijasini o'qishni bloklaydi xolos. Shuning uchun CSRF tokenlar orqali yozishni himoyalashimiz kerak bo'ladi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **`*` ishlata ko'rmang (Wildcard):** Serverda `Access-Control-Allow-Origin: *` qo'yish (hamma domenga ruxsat berish) eng katta xavfsizlik xatolaridan biridir, ayniqsa agar tizim credentials (cookie/token) ishlatsa. Haqiqiy originni aniq sanab o'ting (whitelist).
2. **Preflight Keshlang:** OPTIONS so'rovlari tarmog'ni juda sekinlashtiradi. Uni har safar qayta-qayta yubormasligi uchun server tarafda `Access-Control-Max-Age` header ni uzoqroq vaqtga (masalan 24 soat) sozlab qo'ying.
3. **Regex xatolari:** Backendda Origin'ni tekshirish uchun Regex yozayotganda, oxirini va boshini qat'iy belgilang (`^https:\/\/my-site\.com$`). Aks holda qaroqchi `https://my-site.com.attacker.com` kabi origin bilan tizimga kirib olishi mumkin.
4. **Faqatgina Brauzerlar:** Esdan chiqarmangki, CORS faqat Brauzerlar uchun yozilgan xavfsizlik cheklovidir. Postman, Curl yoki boshqa backend serverlar CORS ga mutlaqo bepisandlik bilan qaraydi va u yerda error chiqmaydi.

---

## Xulosa

| Tushuncha | Ta'rifi | Asosiy maqsadi |
|-----------|---------|----------------|
| **SOP (Same-Origin Policy)** | Brauzerning himoya devori | Boshqa saytlarning (Domenlar) ma'lumotlarini o'qishini bloklash |
| **CORS (Cross-Origin Resource Sharing)** | "Viza" berish tizimi | Istisno tariqasida ba'zi saytlarga ruxsat berish |
| **Simple Request** | Odatdagi (Oddiy) so'rovlar | `GET/POST` va faqat oddiy (safelisted) headerlar bilan |
| **Preflight Request**| Dastlabki (Tekshiruvchi) so'rov | Murakkab so'rovlardan oldin `OPTIONS` orqali server ruxsatini bilish |

CORS shunchaki ishlab chiquvchilarni qiynash uchun o'ylab topilmagan. U aslida foydalanuvchilar xavfsizligi va shaxsiy ma'lumotlar o'g'irlanmasligi uchun SOP ning qo'shimcha "viza" tizimidir. Uni to'g'ri ishlata bilish nafaqat frontend, balki backend uchun ham hayotiy ahamiyatga egadir.
