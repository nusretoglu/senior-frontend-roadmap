# Token Refresh

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Xavfsizlik qoidalariga ko'ra, "Access Token" (ruxsatnoma) juda qisqa muddatli bo'lishi kerak. Ammo har safar u muddati o'tganda foydalanuvchidan qayta login qilishni so'rash UX (User Experience) ni butunlay buzadi. Shuning uchun orqa fonda sezdirmasdan "Refresh Token" orqali yangi ruxsatnoma olib kelish mexanizmini to'g'ri qurish kerak bo'ladi. Agar sizda race condition'lar (bir vaqtda 5 ta request API ga borib hammasi birdan refresh so'rashi) hal etilmagan bo'lsa, backend ortiqcha so'rovlardan bloklanib qolishi yoki tokenlar sinxronizatsiyasi buzilishi mumkin.

> [!NOTE]
> **Real-hayot analogiyasi: "Mehmonxona Kaliti"**  
> Tasavvur qiling siz mehmonxonadasiz.
> **Access Token:** Bu sizga xonaga kirish uchun berilgan va atigi 1 soat ishlashga dasturlangan elektron karta. Yo'qotib qo'ysangiz ham o'g'ri faqatgina 1 soat ichidagina xonaga kira oladi.
> **Refresh Token:** Bu sizning shaxsni tasdiqlovchi pasportingiz (HttpOnly cookie da saqlanadigan). Karta vaqti tugasa, resepshnga (Server) borib pasportni ko'rsatasiz va ular sizga yana 1 soatlik yangi karta berishadi. Bu ishni siz o'zingiz (kadr ortida) xonaga kirayotganingizda sezmagan holda amalga oshirish "Silent Refresh" deyiladi.

Zamonaviy web ilovalar asosan JWT (JSON Web Token) ishlatadi. Keling uning bosqichlarini ko'rib chiqamiz.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi "Access" va "Refresh" tokenlar farqini hamda nega aynan LocalStorage xavfli ekanligini tushunishi kerak.

### Qanday ishlaydi?
Foydalanuvchi tizimga kirganda (Login), server unga 2 ta token qaytaradi:
1. **Access Token (Ruxsatnoma):** Buni Vue/React da shunchaki o'zgaruvchi (variable) ichiga yoki Redux/Pinia ga saqlaysiz. Barcha API so'rovlarga qo'shib yuboriladi. Muddati: 15 daqiqadan 1 soatgacha.
2. **Refresh Token (Pasport):** Buni backend sizga bermaydi, o'zi to'g'ridan-to'g'ri brauzeringizning **HttpOnly Cookie** xotirasiga yozib qo'yadi. Muddati: haftalar yoki oylar.

Nega JS o'qiy olmaydigan HttpOnly Cookie da saqlanadi? Chunki saytga qandaydir xakerlik hujumi (XSS) uyushtirilsa ham, u JS kodi orqali Cookie ni o'g'irlay olmaydi. Access token memory da turaveradi, chunki uni o'g'irlasa ham atigi 15 daqiqa ishlaydi xolos.

```javascript
// Junior darajasidagi yondashuv: (Lekin bu XSS hujumiga eng zaif usul!)
// BUNI ISHLATMANG ❌
localStorage.setItem('accessToken', token); 
```

---

## 🟡 Middle (Amaliyot va Detallar)

Middle darajadagi dasturchi Axios interceptor yordamida Token eskirganda (401 kelganda) uni sezdirmasdan qanday yangilashni yozadi.

### Silent Refresh (Bildirmasdan Yangilash)
Siz qandaydir maqolani o'qiyotib 1 soat qolib ketdingiz. Keyin "Like" tugmasini bosdingiz. Access Token vaqti o'tib ketgan, shuning uchun Backend "401 Unauthorized" (Ruxsat yo'q) xatosini qaytaradi.
Middle dasturchi bu xatoni Interceptor da ushlab, Like bosish so'rovini **"Kutish rejimiga" (Queue)** o'tkazadi. So'ngra API dan yangi Token so'raydi. Yangi Token kelgach, Haligi "Kutishdagi" Like bosish so'roviga yangi tokenni biriktirib o'zi jo'natvoradi. Va foydalanuvchi bu jarayonda hech narsani sezmaydi (Silent).

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  withCredentials: true, // HttpOnly Cookie dagi Refresh tokenni jo'natishi uchun muhim
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config; // Boyagi "Like" so'rovi shu yerda

    // Agar 401 kelgan bo'lsa va bu birinchi xato bo'lsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Qayta urinyapmiz degan belgi

      try {
        // Backend ga Refresh qilishni aytamiz (Bunda Cookie o'zi ketadi)
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        
        const newAccessToken = res.data.accessToken;
        // Yangi tokenni Pinia/Vuex ga saqlaymiz (pseudo code)
        store.commit('setToken', newAccessToken);

        // Eski uzilib qolgan (Like) so'rovni yangi token bilan qaytaramiz
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh token ham eskirgan! Demak login page ga otvoramiz
        store.dispatch('logout');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi faqat "Happy Path" ni emas, "Burchakdagi (Edge cases)" muammolarni ham ko'ra oladi.

### 1. Race Condition (Talashib qolish)
Tasavvur qiling foydalanuvchi "Dashboard" (Bosh sahifa) ga kirdi. Sahifada 5 xil grafik (Chart) bor. Ular backend'ga 5 ta alohida so'rov jo'natadi. Agar shu vaqtda Token vaqti tugagan bo'lsa, 5 ta so'rov ham baravar "401" javob oladi va har biri ALOHIDA Refresh jo'natishni boshlaydi!
Natija: 5 marta `/refresh` so'rovi ketadi, 4 tasi bekor bo'lib 5-si yangi token olib beradi yoki Backend bloklab qo'yadi.

**Yechim:** Singleton naqshi (Promise navbati). Agar bitta so'rov Refresh jarayonini boshladimi, qolgan so'rovlar "Yangi token kelasin" deb navbat kutib turishi kerak.

### 2. Multi-Tab Muvofiqlashtirish
Tasavvur qiling Tab-1 va Tab-2 da bitta sayt ochiq. Tab-1 da siz Tokenni yangiladingiz (Refresh bo'ldi). Endi Tab-2 dagi Javascript kodining xotirasida Eski token qolib ketdi-ku? 
Bunday paytda **BroadcastChannel API** ishlatiladi. Tab-1 token yangilangach barcha ochiq Tab larga xabar jo'natadi va Tab-2 yangi tokenni olib oladi. Bu usul shuningdek bir tabda Logout qilinganda hamma tablardan ham chiqarib yuborish (redirect) uchun xizmat qiladi.

### Intervyu Savoli
**"Access Token nega uzoq muddatli qilinmaydi va nega u o'zi LocalStorage da emas, xotirada tursin deysiz?"**
*Javob:*
Access Token har qanday requestda ko'rinib (Header da) turgani uchun uni kimdir tarmoq orqali ushlab olishi (Man-in-the-middle) yoki kodingizdagi biror zaif npm paket o'g'irlashi (XSS) mumkin. Agar u umrbod qilib yozilgan bo'lsa, xaker sizning nomingizdan umrbod ish qila oladi. Qisqa vaqtli bo'lsa, o'g'ri faqatgina 15 daqiqa uni ishlata oladi holos, so'ng token expire bo'ladi.
LocalStorage xavfli bo'lishining sababi shuki, saytdagi xohlagan js skript uni o'qiy oladi. Agarda biz uni shunchaki JS o'zgaruvchisiga saqlasak va Refresh tokenni HttpOnly kuki orqali qilsak, u holda tokenlar XSS hujumlardan xavfsiz holatda bo'ladi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Memory'da saqlash xavfsizroq**: Xavfsizlik jihatidan eng to'g'ri arxitektura: Access Token'ni frontend xotirasida (Pinia/Vuex kabi state sifatida), Refresh Token'ni esa brauzerning `HttpOnly, Secure` cookielarida saqlash. `localStorage` - XSS (Cross Site Scripting) hujumlariga juda ham zaif.
2. **Race condition oldini olish**: Qachonki bitta API xatoga uchrab refresh'ga ketsa, aynan shu daqiqada kutilayotgan boshqa 10 ta API ham aynan shu narsani qilmasligi kerak. Token refresh jarayoni faqat bitta bo'lishi va qolgan API lar o'sha bitta jarayon yakunini kutib turishlari (Promise queue/Singleton) shart.
3. **Proactive (Oldindan) refresh**: 401 (Unauthorized) xatosini kutishdan ko'ra, Token'ni o'qib (Masalan `jwt-decode` kutubxonasi bilan) uning vaqti tugashiga 1-2 daqiqa qolganda setInterval yordamida orqa fonda yangilab qo'yish dastur ishlash tezligini ancha yaxshilaydi (Foydalanuvchida 401 dan qaytish tufayli kechikish bo'lmaydi).
4. **Tablar o'rtasida muvofiqlik**: Foydalanuvchi bitta tab'da login yoki logout qilsa, ochiq turgan qolgan tab'larda ham ayni shu operatsiyani yuzaga keltirish uchun `BroadcastChannel` dan foydalaning.

---

## Xulosa

| Tushuncha | Asosiy Mohiyati | Qachon/Qayerda ishlatish kerak? |
|-----------|-----------------|---------------------------------|
| **Access Token** | Asosiy ruxsatnoma (Qisqa muddatli) | Barcha API so'rovlarining `Authorization` header'ida (Memory da saqlash zo'r) |
| **Refresh Token** | Pasport (Uzoq muddatli) | Faqatgina yangi Access Token olishda (HttpOnly Cookie'da saqlash muhim) |
| **Reactive Refresh**| Xatolik bo'lganda (401) yangilash | Standart usul, o'rnatish oson lekin mijoz xatolikni birmuncha sezishi mumkin |
| **Proactive Refresh**| Xatolik bo'lishidan oldin yangilash | Eng yaxshi UX beruvchi professional yondashuv (SetInterval orqali) |

Token refresh - zamonaviy ilovalarning yuragi hisoblanadi. Race condition'lar hal etilgan va Multi-tab sinxronlash to'g'ri bajarilgan tizimgina barqaror ishlab foydalanuvchini keraksiz login oynalaridan xalos qiladi.

**Keyingi qadam:** [07-axios-vs-fetch.md](./07-axios-vs-fetch.md) - HTTP client tanlash va custom wrapper (Kutubxona qobig'ini) yaratish.
