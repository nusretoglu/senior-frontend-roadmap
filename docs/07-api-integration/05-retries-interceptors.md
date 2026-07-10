# Retries & Interceptors

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturingiz qanchalik mukammal bo'lmasin, internet ulanishi va server barqarorligi sizning qo'lingizda emas. Xatolarni (masalan Wi-Fi uzilishi) "graceful" (chiroyli) tarzda hal qila olish, foydalanuvchiga xatolik qaytarish o'rniga bildirmasdan yana bir marta urinib ko'rish — Senior va Junior dasturchining eng katta farqlaridan biridir. Interceptor'lar esa ushbu operatsiyalarni takror-takror yozmaslikka va bitta markaziy nuqtadan boshqarishga yordam beradi.

> [!NOTE]
> **Real-hayot analogiyasi: "Pochtachi va Bojxona"**  
> **Retry (Qayta urinish):** Pochtachi eshikni taqillatdi, hech kim ochmadi. U posilkani tashlab ketib qolmaydi, ertasi kuni yana keladi, keyin yana. Faqatgina 3-marta ham hech kim chiqmasa u qaytarib olib ketadi (Max Retries).  
> **Interceptor (Bojxona tekshiruvi):** Mamlakatdan chiqib ketayotgan barcha xatlar bojxonadan (Request Interceptor) o'tib, ularga "Tasdiqlangan" muhri bosiladi. Mamlakatga kirib kelayotgan barcha javoblar ham bojxonadan (Response Interceptor) o'tadi va ichida xavfli narsa yo'qligi tekshiriladi. Siz har bir xat uchun alohida bojxonachi yollamaysiz, bitta markaziy bojxona yetarli.

Network request'lar har doim ham muvaffaqiyatli bo'lavermaydi (server qulashi, connection timeout). Bunga to'g'ri tayyorgarlik ko'rishimiz muhim.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior sifatida tasavvur qiling: API ga murojaat qildingiz va xato kedi (`catch`). Siz srazu ekranda "Xatolik" deb qizil yozuv chiqarasiz. Ammo bu vaqtinchalik xato (server bir soniyaga qotib qolgan) bo'lishi ham mumkin-ku?
Buning uchun oddiy **Retry (Qayta urinish)** qilinadi. Dastur yiqilishdan oldin, indamasdan 3 marta urinib ko'radi.

```javascript
// Oddiy Retry funksiyasi
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Server xatosi");
      return await res.json();
    } catch (err) {
      if (i === maxRetries - 1) throw err; // Oxirgi imkoniyat ham tugadi
      console.log(`${i+1}-marta urinib ko'rildi...`);
    }
  }
}
```

**Axios Interceptor** nima?
Sizda 50 ta joyda API ga so'rov bor. Ularning har biriga alohida `token` qo'shishingiz kerak:
`headers: { Authorization: "Bearer token..." }`
50 marta buni qayta-qayta yozmaslik uchun **Axios Request Interceptor** (Bojxona) ishlatamiz. U dasturdan chiqib ketayotgan Hamma so'rovlarga token'ni avtomat qo'shib yuboradi.

---

## 🟡 Middle (Amaliyot va Detallar)

### Exponential Backoff
Middle dasturchi "oddiy" qilib 3 marta ketma-ket, bir xil vaqtda qayta urinish - Serverga og'irlik qilishini biladi (Ayniqsa 10,000 odam bir vaqtda qayta uringanida). 
Buning yechimi: **Exponential Backoff (Kutish vaqtini ko'paytirish)**
Ya'ni, 1-xatoda 1 soniya kutamiz, 2-xatoda 2 soniya, 3-xatoda 4 soniya va hokazo.

### Axios Interceptors Amaliyotda

```javascript
import axios from 'axios';

const api = axios.create({ baseURL: 'https://api.example.com' });

// 1. Request Interceptor (Ketayotgan so'rov bojxonasi)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // So'rov tilini ham shu yerda qo'shamiz
  config.headers['Accept-Language'] = 'uz'; 
  return config;
});

// 2. Response Interceptor (Kelayotgan javob bojxonasi)
api.interceptors.response.use(
  (response) => {
    // Hammasi yaxshi bo'lsa (200 OK) datani beramiz
    return response.data;
  },
  (error) => {
    // Agar 401 (Ruxsat yo'q) bo'lsa
    if (error.response?.status === 401) {
      alert("Sessiya tugadi, qayta kiring");
      window.location.href = '/login';
    }
    // Barcha xatolarni o'ziga xos tarzda ushlash (Toast notification chiqarish va h.k.)
    return Promise.reject(error);
  }
);
```
Buning evaziga endi sizning barcha `.get()` yoki `.post()` funksiyalaringiz toza, hech qanday tokenlar yoki xatolik tekstlarisiz yoziladi.

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior darajasida siz har bir xatolikka farqli yondashish, Network holatini chuqur his qilish kabi mezonlarni nazorat qilasiz.

### Idempotency (Bir marta bajarilish)
Siz qanday so'rovni Retry qilasiz? 
Agar GET so'rov xato bersa, uni xotirjam yana qaytarish mumkin. Lekin agar siz "Xarid qilish (To'lov)" (POST) so'rovini yuborsangiz-u, u xato qaytarsa, uni ko'r-ko'rona Retry qilish (2 marta pul yechib olinishiga) xavfiga olib kelishi mumkin. Shuning uchun Senior dasturchilar **Idempotency Key** ishlatadilar (Har bir tranzaksiya o'zining yagona ID siga ega bo'ladi).

### Circuit Breaker Pattern (Elektr tokini to'xtatuvchi)
Agar server butunlay qulab yotgan bo'lsa, har bir user unga 5 martadan Retry qilib so'rov yo'llashi uni batartib "o'ldiradi".
Bunday holatda biz Circuit Breaker naqshini qo'llaymiz: API orqama-keyin 5 marta 500 error qaytarsa, Circuit (Zanjir) "Uziladi" (OPEN). Va keyingi 1 daqiqa davomida frontend umuman serverga so'rov yubormasdan, srazu mahalliy "Server uzilgan" xatosini (Local error) ko'rsatadi. Bu serverga o'ziga kelib olishi uchun vaqt beradi.

### Intervyu Savoli
**"Interceptor pattern qanday foyda beradi? Va Retry logikasi qanday holatda yomon oqibatlarga olib kelishi mumkin?"**
*Javob:*
Interceptor bizga DRY (Don't Repeat Yourself) qoidasini beradi, auth headerni, error logging ni bitta joyga markazlashtiradi va test qilishni osonlashtiradi.
Retry qachon yomon bo'lishiga kelsak, 2 ta sabab bor: Birinchisi "Thundering Herd" effekti — minglab odam bir paytda serverga takror so'rov jo'natishi, buni oldini olish uchun "Jitter" (tasodifiy kichik kechikishlar) qo'shish kerak. Ikkinchisi POST kabi Non-idempotent operatsiyalarni retry qilish (ikki marta hisobdan pul yechib olinishi). Ularga ehtiyotkor bo'lish zarur.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Jitter bilan Retry qiling**: Agar tizim ommaviy xatoga uchrasa va hamma foydalanuvchi bir vaqtda qayta so'rov yuborsa, server butunlay qulaydi (Thundering Herd muammosi). Shuning uchun kutish vaqtiga tasodifiy "jitter" (masalan 1 soniya + random milisekundlar) qo'shing.
2. **Faqat tarmoq yoki 5xx xatolarni Retry qiling**: Foydalanuvchi parolni xato kiritsa (401) yoki sahifa yo'q bo'lsa (404), qayta so'rov yuborishdan umuman foyda yo'q. Qayta urinishlar faqat 500, 502, 503 yoki Network Error (Internet yo'qolishi) holatlarida ishga tushishi kerak.
3. **Idempotent so'rovlar**: POST so'rovlarni (yangi buyurtma, to'lov) ehtiyotkorlik bilan takrorlang. Bir xil to'lovni 2 marta yechib olmaslik uchun header'ga `Idempotency-Key` qo'shish tavsiya etiladi.
4. **Tokenlarni Interceptor orqali yuboring**: Har bir so'rovga `Authorization: Bearer ...` deb yozish o'rniga uni bitta `Request Interceptor` da markazlashgan holda qo'shing.

---

## Xulosa

| Tushuncha | Ma'nosi | Asosiy Vazifasi |
|-----------|---------|-----------------|
| **Request Interceptor** | Yuborishdan oldingi nazorat | Barcha so'rovlarga Token (Auth) qo'shish, tilni (Language) kiritish |
| **Response Interceptor**| Kelgandan keyingi nazorat | 401 xatolik bo'lsa darhol login sahifasiga otish, global xatoliklarni ushlash |
| **Retry** | Qayta urinib ko'rish | Vaqtinchalik uzilishlar (500, 502) da 2-3 marta so'rovni takrorlash |
| **Exponential Backoff** | Kutish vaqtini uzaytirish | Server o'lib qolmasligi uchun 1s, 2s, 4s kutish oralig'ida qayta urinish |

Retry va interceptors - production-ready API client'ning asosiy qismlari. Exponential backoff va circuit breaker serverni himoya qiladi, interceptors esa kodni toza va boshqariladigan qiladi. Har bir holatda xatolik turiga qarab muomala qilish arxitekturangizni mustahkamlaydi.

**Keyingi qadam:** [06-token-refresh.md](./06-token-refresh.md) - JWT token'larni xavfsiz boshqarish va fonda bildirmasdan yangilash (silent refresh).
