# Axios vs Fetch

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Loyiha boshida tarmoq (network) kutubxonasini to'g'ri tanlash juda muhim, chunki keyinchalik butun loyihani o'zgartirish katta mehnat talab qiladi. Fetch bu quruq fundament (brauzerga o'rnatilgan), Axios esa tayyor imorat. Ikkalasining afzalliklari va cheklovlarini tushunish, loyihaning hajmiga qarab to'g'ri qaror qabul qilishingizga yordam beradi.

> [!NOTE]
> **Real-hayot analogiyasi: "Pitsa tayyorlash vs Tayyor pitsa buyurtma qilish"**  
> **Fetch (Pitsa tayyorlash):** Xamiri, pomidori, pishlog'ini alohida-alohida o'zingiz sotib olasiz va o'zingiz pishirasiz. Arzon tushadi (Bundle size = 0 kb), lekin mehnat ko'p (Manual JSON parse, error handling).  
> **Axios (Tayyor pitsa):** Kuryer tayyor quti bilan olib keladi. Barcha xizmatlar ichida bor (Automatic JSON parse, Interceptors). Lekin kuryerga ozgina haq to'laysiz (Bundle size ~11kb qo'shiladi).

HTTP so'rovlar yuborish uchun JavaScript'da ikki asosiy variant mavjud: browser native `fetch()` API va third-party `axios` kutubxonasi. Bu bo'limda ularni chuqur solishtiramiz.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Eng asosiy farqi kod yozish jarayonida bilinadi. 

**Fetch** brauzerda avvaldan bor bo'lgan narsa. Biron narsa o'rnatish shart emas.
Lekin siz Backend dan ma'lumotni darhol o'qiy olmaysiz. Avval uni JSON ga aylantirish uchun alohida 1 qator kod (va `await`) yozasiz.

```javascript
// Fetch
const response = await fetch('/api/users');
const data = await response.json(); // Qo'shimcha qadam
console.log(data);
```

**Axios** - bu begona NPM paket (`npm install axios`).
Lekin u aqlli, nima kelsa o'zi to'g'ridan to'g'ri JSON ga aylantirib, `data` degan kalit (key) ichiga solib beradi.

```javascript
// Axios
import axios from 'axios';
const response = await axios.get('/api/users');
console.log(response.data); // Darhol tayyor
```

Yana bitta muhim narsa - **Xatoliklar (Errors)**.
Agar backend "User topilmadi (404)" yoki "Server quladi (500)" deb javob qilsa, Axios darhol qizarib, `catch` blokiga otadi. Fetch esa "Xudoga shukur Internet bor ekan, men xatni yetkazdim" deydi va `catch` ga TUSHMAYDI (Faqat internetingiz uzilib qolsagina catch'ga tushadi). 

---

## 🟡 Middle (Amaliyot va Detallar)

Middle darajada dasturchi kodni qisqartirish, interceptors, va default xususiyatlardan foydalanadi.

### Error Handling (Xatolarni ushlash) dagi Farq
Yuqorida aytganimizdek, Fetch barcha "Network bor" holatlarni 200 (Yaxshi) deb qabul qiladi.

```javascript
// Fetch - Manual Error Checking
async function fetchUser() {
  try {
    const res = await fetch('/api/user');
    // Middle developer bu qatorni qo'shishi shart:
    if (!res.ok) throw new Error(`Xato: ${res.status}`); 
    return await res.json();
  } catch (error) {
    console.log(error); // 404 yoki 500 lar ham endi shu yerga keladi
  }
}
```

Axios da bunday tashvish yo'q.

```javascript
// Axios - Auto Error Checking
async function fetchUser() {
  try {
    const res = await axios.get('/api/user');
    return res.data;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status); // 404, 500, 401 barchasi shu yerda ushlanadi
    }
  }
}
```

### Timeout va Interceptors
Sizning apiingiz 10 soniyada javob bermasa "uzib" qoyish (Timeout) funksiyasi:
- **Axios:** Bitta qator: `axios.get(url, { timeout: 10000 })`
- **Fetch:** `AbortController` (Signal uzgich) orqali yoziladigan 5-6 qator kod.

Shuningdek, oldingi boblarda o'tganimiz **Interceptors** (Har bir so'rovga token qoshuvchi bojxona) Axios da default mavjud (`axios.interceptors.request.use`), Fetch da esa uni qo'lda o'zingiz yasab chiqishingiz kerak.

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchilar Fetch vs Axios deb talashmaydilar, balki loyihaning "Bundle Size" (Hajmi) va kerakli xususiyatlaridan kelib chiqib arxitektura tanlaydilar.

### Modern Alternatives (Zamonaviy Muqobillar)
Bugungi kunda hamma narsa optimizatsiyaga qaratilgan. Axios'ning 13kb (minified+gzip) hajmi shunchaki API chaqirish uchun biroz og'irlik qilishi mumkin.
Shu sababli, Fetch API ustiga qurilgan, lekin Axios kabi qulay bo'lgan zamonaviy mitti kutubxonalar urfda:
- **ky**: Faqat brauzer uchun Fetch ustiga qurilgan, hajmi bor yo'g'i ~3kb.
- **ofetch**: Vue/Nuxt olamida standart hisoblangan, Fetch ustiga qurilgan (Interceptors va Auto-JSON xususiyatlari qo'shilgan) universal klient.

### Arxitekturada Abstracting (Mavhumlashtirish)
Senior dasturchi hech qachon komponentlar ichiga Axios ni import qilib tashlamaydi. U albatta `apiClient.js` nomli "Wrapper" (Qobiq) yaratadi. 
Siz butun loyihangizda `apiClient.get('/users')` ni ishlatasiz. Agar ertaga kompaniya Axios dan Fetch ga o'tishni hohlasa, 100 ta faylni emas, faqat o'sha `apiClient.js` degan 1 ta faylni o'zgartirasiz holos.

### Intervyu Savoli
**"Fetch vs Axios. Qaysi biri tezroq ishlaydi va Fetch'da 404 (Not Found) error qanday handle qilinadi?"**
*Javob:*
Ikkalasining ishlash tezligida (Network call nuqtai nazaridan) deyarli farq yo'q, chunki ikkalasi ham brauzer tarmoq resursidan foydalanadi (Axios XMLHTTPRequest ustida, Fetch API alohida). Lekin loyiha yuklanishida Fetch yutadi, chunki uning Bundle hajmi 0 kb, Axios esa JS kodini kattalashtiradi.
Fetch da 404 xatosi kelganda Promise `catch` blogiga tushmaydi! Biz uni `.then` ichida `if (!response.ok)` sharti orqali qo'lda ushlab (throw) olishimiz shart.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Native Fetch ni o'rganing**: Hozirgi kunda Fetch API ning o'zi ham juda ko'p loyihalarga yetarli. Zamonaviy framework'lar (masalan Nuxt) o'zining Fetch wrapper'iga (`ofetch`) ega, bu yerda Axios keraksiz ortiqcha yuk.
2. **Katta loyihalarga custom wrapper yozing**: Fetch yoki Axios ishlatishingizdan qat'i nazar, loyihangiz uchun `apiClient.js` nomli markazlashtirilgan qobiq ob'ekt yarating. Qachondir Axios dan Fetch ga o'tish kerak bo'lsa, faqat bitta faylni o'zgartirasiz.
3. **HTTP xatolarni Fetch da to'g'ri ushlang**: Har doim `if (!response.ok) throw new Error(...)` tekshiruvini yozishni unutmang. Aks holda `fetch` sizga 500 yoki 404 kelganda ham "hammasi joyida" (success) deb ko'rsatib chalg'itadi.
4. **Bundle size (Hajm) haqida qayg'uring**: Agar loyiha kichkina bo'lsa faqatgina API yuborish uchungina begona kutubxona qo'shmang (Fetch ishlatiling).

---

## Xulosa

| Xususiyat | Fetch API | Axios |
|-----------|-----------|-------|
| **Asos (Platforma)** | Brauzerni o'zida bor (Native) | Uchinchi tomon kutubxonasi (NPM package) |
| **JSON formatlash** | Qo'lda `.json()` qilish kerak | Avtomatik (o'zi o'qiydi) |
| **Xatoliklarni ushlash** | Faqat internet uzilsa `catch` ga tushadi | 400 va 500 statuslar ham `catch` ga tushadi |
| **Fayl yuborish/olinish** | Biroz noqulayroq, progressni ko'rish qiyin | Avtomatlashtirilgan taraqqiyot paneli (Upload Progress bar) bor |

**Tanlash qoidasi:**
- Oddiy so'rovlar, bundle hajmi muhim, qo'shimcha resurs kerakmas → **Fetch**
- Murakkab API, Error handling, Timeout'lar, jamoa Axios ga o'rganib qolgan → **Axios**
- Yangi avlod loyihalar, Vue/Nuxt tizimlari → **ky / ofetch**

---

## Bo'lim Yakunlandi

Bu bo'limda API integration'ning barcha asosiy jihatlarini ko'rib chiqdik:
1. **REST API** - fundamental tushunchalar va HTTP methods
2. **GraphQL** - flexible data fetching
3. **Pagination** - katta data bilan ishlash
4. **Caching** - performance optimization
5. **Retries & Interceptors** - robust network layer
6. **Token Refresh** - seamless authentication
7. **Axios vs Fetch** - to'g'ri tool tanlash

Bu bilimlar senior frontend dasturchi bo'lish uchun mustahkam poydevor hisoblanadi va barcha yirik proyektlarda doimiy ravishda kerak bo'ladi.
