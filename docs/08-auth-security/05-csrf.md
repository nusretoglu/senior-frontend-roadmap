# CSRF (Cross-Site Request Forgery)

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Agar ma'lumotlarni saqlashda faqat Cookie lardan foydalansangiz, brauzer o'zining "xizmat vazifasi" ga ko'ra Cookielarni har bir HTTP so'rovida avtomat qo'shib yuboradi. Agar biron foydalanuvchi joriy brauzerida saytingizga login qilgan bo'lsa va u bilmasdan boshqa bir zararli saytga (masalan, kinolarni bepul ko'rish saytiga) kirsayu, u yerdagi biror tugmani bossa - u sahifa maxfiy ravishda sizning serveringizga so'rov (POST) yuborishi mumkin (masalan, "Parolni o'zgartirish"). Brauzer bu so'rovga foydalanuvchining cookielarini avtomat qo'shib yuboradi! Server esa cookieni ko'rib, so'rovni foydalanuvchining o'zi yubordi deb o'ylab, uni amalga oshiradi. Bu **CSRF (Saytlararo so'rovlarni soxtalashtirish)** deb ataladi va bunga qarshi himoyalanish eng muhim qoidalardan biridir.

> [!NOTE]
> **Real-hayot analogiyasi: "Sohibjamol va uning imzosi (Muhrlangan xat)"**  
> Tasavvur qiling, sizning shaxsiy muhr-imzongiz (Cookie) bor va bank har doim bu muhr tushirilgan har qanday to'lov topshiriqnomasini qabul qiladi.  
> - **CSRF (Aldov):** Bir kun ofisdagi ofitsiant (Xaker) sizga chiroyli hujjat ko'rsatib shunga muhr bosib berishni so'radi. Lekin qog'ozning ichida "Ofitsiant hisobiga $1000 pul o'tkazilsin" degan yozuv bor edi va siz bilmasdan unga muhr bosdingiz. Bank muhrni ko'rib pulni o'tkazib yubordi. Siz esa aldandingiz!
> - **CSRF Token (Himoya):** Bank endi faqat muhrga qarab ish bitirmaydi. Har safar pul o'tkazmoqchi bo'lsangiz, bank sizga bir martalik maxfiy kod (CSRF Token) beradi. Xat yuborilganda ham muhr (Cookie), ham o'sha bir martalik maxfiy kod (Token) qog'ozda birgalikda taqdim etilishi shart. O'g'ri esa bu maxfiy kodni bilmaydi!

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi CSRF muammosi qayerdan paydo bo'lishini tushunishi kerak.

### Qanday ishlaydi?
CSRF faqat Cookielarga asoslangan saytlarda yuz beradi (JWT Localstorageda tursa CSRF xavfi umuman yo'q). 
Tasavvur qiling:
1. Men `my-bank.uz` da o'z hisobimga kirdim (Cookie saqlandi).
2. Keyin menga telegramda kimgadir ovoz berish bo'yicha link tashlashdi va men u saytga kirdim: `ovoz-ber.com`
3. Men "Ovoz berish" tugmasini bosdim. Lekin aslida xaker bu tugmaning orqasiga yashirin forma qo'ygan edi:
```html
<form action="https://my-bank.uz/transfer-money" method="POST">
  <input name="to" value="xaker_karta_raqami">
  <input name="amount" value="100000">
</form>
<!-- Tugma bosilsa aslida form yuboriladi -->
```
4. Forma mening bankimga qarab uchdi. Brauzer esa aqlli, qayerga so'rov ketyapti? "Bankka". Men bankda bormanmi? "Ha, mana cookie". U Cookieni o'zi forma ichiga qo'shib yubordi!
5. Bank qarasa mening Cookiem (Muhrim) turibdi, so'rovni bajaradi.

Shu yashirin holatda mening nomimdan Bankka buyruq borishi CSRF deb ataladi.

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi bunga qarshi zamonaviy himoya usullarini qanday qo'llashni biladi.

### 1. SameSite Cookie Atributi (Eng Oson Yo'l)
Brauzerlar bu muammoni anglab, Cookielarga yangi "SameSite" atributini qo'shdilar. Backend Cookie yuborayotgan vaqtda shunday deyishi kerak:
```javascript
res.cookie('session', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'Lax' // <-- Mana shu CSRF dan himoyalaydi
});
```
`SameSite: Lax` degani: "Agar mening saytimga boshqa domen (masalan `ovoz-ber.com`) dan turib POST so'rov kelsa (form yuborilsa), unga mening cookiemni qo'shib yuborma!". Shu kichkina qator kod sizni CSRF dan katta ehtimol bilan himoya qiladi.

### 2. Double Submit Cookie Pattern
Lekin hamma brauzerlar ham (eskilar) SameSite ni tushunmaydi yoki ba'zida API boshqa domenda joylashgan bo'lishi mumkin. Buning uchun qanday himoyalanamiz?
Backend har doim o'zi bitta ixtiyoriy 1 martalik String yozadi va uni Ham HTTPOnly bo'lmagan oddiy Cookie ga (`csrf=123`), ham Formani ichiga yashirin Input qilib yuboradi. 

Frontend (React/Vue) bu Formani yana qaytib POST qilganda u nima qiladi? Javascript oddiy Cookie dan `123` yozuvini o'qib olib uni Header ga qo'shib yuboradi:
```javascript
// Frontend da:
const csrfToken = getCookieValue('csrf'); // Cookie dan o'qib olinadi
axios.post('/transfer-money', data, {
    headers: { 'X-CSRF-Token': csrfToken } // Headerga qoshib beramiz
});
```

Backend nima qiladi? U so'rov kelgan vaqtda 2 ta narsani tekshiradi:
1. Cookie orqali kelgan maxfiy kod (`123`)
2. Header orqali kelgan maxfiy kod (`123`)
Agar xaker `ovoz-ber.com` dan hujum qilsa, brauzer Cookieni yuboradi (1-shart bajarildi), lekin Xaker Header ga token qo'sha olmaydi, chunki u Javascript (SOP - Same Origin Policy) tufayli boshqa domendagi Cookielarni o'qiy olmaydi (2-shart bajarilmadi). Backend bu narsani Fake (Soxta) ekanini shundan darhol sezib qoladi.

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi faqatgina himoyalanish bilan qolmaydi, balki arxitekturaning to'g'ri qurilganligini (REST qoidalariga amal qilinganini) ham nazorat qiladi.

### GET vs POST (Safe vs Unsafe Methods)
Ba'zi junior/middle dasturchilar shoshqaloqlik qilib ma'lumotni o'zgartirish so'rovlarini ham `GET` qilib yozib qo'yishadi. 
Masalan `GET /api/user/delete-account`
Agar siz Backend da GET bilan ish bitiradigan qilib qo'ysangiz CSRF dan himoyalanish befoyda bo'ladi. Xaker o'z saytida oddiygina Image (rasm) qoyib uning manziliga sizning API ni yozadi:
```html
<img src="https://my-bank.uz/api/user/delete-account" />
```
Foydalanuvchi saytga kirganda brauzer rasmni ochish uchun GET so'rov yuboradi. Va foydalanuvchining akkaunti g'oyib bo'ladi! Shuning uchun ma'lumot o'zgartiriluvchi BARCHA amallar `POST/PUT/DELETE` da bo'lishi shart. Chunki brauzer rasm uchun hech qachon POST so'rov jo'natmaydi.

### Origin va Referer tekshirish
Senior darajadagi xavfsizlik arxitekturasida bitta CSRF tokenning o'zi yetarli hisoblanmaydi. Qo'shimcha qatlam sifatida API da har doim `Origin` yoki `Referer` HTTP Headerlari tekshiriladi.
Backend quyidagi mantiqni tekshiradi:
- So'rov qayerdan kelayotganini ko'r! U bizning domain (O'zimizni UI) dan kelyaptimi yoki qandaydir `ovoz-ber.com` dan kelyaptimi?
Agar tashqi saytdan (ruxsatsiz domendan) kelsa so'rov bekor qilinadi.

### Intervyu Savoli
**"Agar men Tokenlarimni JWT ko'rinishida faqat Authorization header da jo'natsam va Cookielarni umuman ishlatmasam men CSRF ga qarshi nima qilishim kerak?"**
*Javob:*
Hech narsa qilmaysiz! Chunki CSRF to'liq Brauzerning Cookielarni "avtomatik ravishda" har qanday holatda ham (aynan qaysi domendan jo'natilishiga qaramasdan) so'rovga tirkab yuborishiga asoslanadi. Agar siz Cookielardan foydalanmasangiz, so'rov Header iga JWT ni Javascript kod yordamida har safar o'zingiz qo'lda qo'shishingiz kerak bo'ladi (`Authorization: Bearer ...`). Haker esa boshqa domendan turib sizning Memory da yotgan JWT tokeningizni o'qiy olmaydi (Bunga SOP to'sqinlik qiladi) va so'rovga tokenni tirkolmaydi. Demak uning yuborgan so'rovi avtomatik tarzda 401 Unauthorized deya bekor qilinadi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **SameSite cookie atributlaridan foydalaning:** Cookie orqali autentifikatsiyani amalga oshirayotganda SameSite atributini `Lax` yoki `Strict` deb belgilash ko'plab CSRF xavflarini butunlay bartaraf etadi.
2. **Kliyent va Server orasida CSRF Token qo'shing:** Agar siz SameSite dan to'liq foydalana olmasangiz (eski brauzerlar tufayli yoki arxitektura sabab) yoki qo'shimcha xavfsizlik zarur bo'lsa, har bir o'zgarish qiluvchi so'rovda (`POST`, `PUT`, `DELETE`) server tomonidan berilgan bir martalik **CSRF Token** ni headers (masalan, `X-CSRF-Token`) orqali yuborishni va uni serverda tekshirishni yo'lga qo'ying.
3. **Safe va Unsafe metodlarni ajrating:** GET, HEAD, OPTIONS kabi metodlar serverda holatni o'zgartirmasligi (safe) shart. Hech qachon `GET` so'rovi orqali ma'lumotni o'chirish yoki tahrirlash kabi ishlarni bajarmang. Haker shunchaki rasmni (img) yo'liga yozish orqali buni ishga tushirishi mumkin.

---

## Xulosa

| Himoya Usuli | Qanday ishlaydi | Afzalligi | Kamchiligi |
| --- | --- | --- | --- |
| **SameSite Cookie** | Brauzer boshqa saytlardan kelgan so'rovlarga cookie qo'shmaydi | Nol konfiguratsiya (brauzer bajaradi) | Eski brauzerlarda ishlamasligi mumkin |
| **Double Submit Cookie**| Token ham cookie, ham headerda yuborilib solishtiriladi | Stateless (serverda xotira talab qilmaydi) | Subdomenlar buzilsa, cookie qayta yozib yuborilishi mumkin |
| **CORS / Origin Check** | So'rov kelgan Asl manzilni tekshiradi | Ishonchli 2-darajali xavfsizlik | Ba'zan tarmoq xatolarida (yoki proxy) referer o'chib ketadi |

CSRF (Cross-Site Request Forgery) asosan Cookielar o'z ishi (avtomatik qo'shilish)ni bajarishi oqibatida yuzaga keladigan zaiflikdir. SameSite Lax qilish va CSRF-Token larni jo'natish (va Headerda ushlash) uni 100% bartaraf etadi.

**Keyingi qadam:** [07-best-practices.md](./07-best-practices.md) - Auth va Xavfsizlik bo'yicha yakuniy qoidalar va Best Practices.
