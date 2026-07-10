# Reconnect Strategies

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Foydalanuvchilar har doim barqaror internet tarmoqda o'tirishmaydi. Wi-Fi dan mobil internetga o'tganda, liftga kirganda yoki server restart bo'lganda WebSocket/SSE ulanishlar uziladi. Agar loyihangizda to'g'ri qayta ulanish (reconnection) mantiqi yozilmagan bo'lsa, foydalanuvchi sahifani qo'lda yangilamaguncha yangi xabarlarni ololmay qoladi. Professional reconnection yozish — bu shunchaki `ws.connect()` ni takror chaqirish emas, balki foydalanuvchi interfeysi (UI) ni buzmagan holda, serverni so'rovlar bilan charchatmay (backoff) ishni tashkil qilishdir.

> [!NOTE]
> **Real-hayot analogiyasi: "Quloqchin taqqan odam bilan suhbat"**  
> Tasavvur qiling, shovqinli ko'chada do'stingiz bilan gaplashyapsiz. Do'stingizning qulog'ida shovqinni to'suvchi quloqchin (Instability) bor.  
> - **Strategiyasiz (Yomon):** Do'stingiz har soniyada sizga "Nima deding?" deb baqiraveradi. Bu sizni gapirishdan to'xtatadi va charchatadi (Server DDOS/Crash).
> - **Exponential Backoff bilan (Yaxshi):** Do'stingiz birinchi marta uzilishda 1 soniya kutadi va so'raydi. Agar yana shovqin bo'lsa, keyingi safar 2 soniya, keyin 4 soniya, keyin 8 soniya kutib so'raydi. U vaqt oralig'ini uzaytiradi va siz nafas olib gapirishingiz uchun joy beradi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi WebSocket yoki Polling xatolik berganda darhol (Immediate) emas, balki qanday qilib taymer orqali qayta ulanishni bilishi kerak.

### Qayta Ulanish Nima O'zi?
Qachonki WebSocket yopilsa (`onclose`), biz ulanish funksiyasini qaytadan chaqirishimiz kerak.

```javascript
// YOMON USUL (Infinite Loop xavfi bor)
function connect() {
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.onclose = () => {
    // Agar server rostdan ham o'chgan bo'lsa, bu kod
    // 1 soniyada minglab marta chaqirilib kompyuterni qotirib qo'yadi!
    connect(); 
  };
}
```

### To'g'ri Vaqt Oralig'i (Fixed Delay)
Qayta ulanishda eng kamida taymer (masalan 3 soniya) ishlatish shart. Shuningdek, cheksiz urinishlardan saqlanish uchun maksimal urinishlar sonini (Max attempts) belgilash kerak.

```javascript
let attempts = 0;
const MAX_ATTEMPTS = 5;

function connect() {
  if (attempts >= MAX_ATTEMPTS) {
    console.log("Serverga ulanib bo'lmadi. Sahifani yangilang.");
    return;
  }

  const ws = new WebSocket('ws://localhost:3000');
  
  ws.onopen = () => {
    console.log("Ulandi!");
    attempts = 0; // Ulangach xatoliklar sonini nolga tushiramiz
  };
  
  ws.onclose = () => {
    attempts++;
    console.log(`${attempts}-urinish: 3 soniyadan so'ng qayta ulanamiz...`);
    setTimeout(connect, 3000); // Har doim 3 soniya kutadi
  };
}
connect();
```

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi **Exponential Backoff** nima ekanini va **Network Visibility** (Tarmoq mavjudligi) larni inobatga olishni o'rganadi.

### Exponential Backoff (O'sib boruvchi kutish)
Yuqoridagi kod har doim 3 soniya kutadi. Agar server katta yuklama (O'ta ko'p foydalanuvchilar) ostida o'chib qolgan bo'lsa, u yonishi bilan yana o'sha millionlab odamlar birdan yopishadi. Shuning uchun aqlli dasturlar qayta ulanish vaqtini o'stirib boradi: 1s, 2s, 4s, 8s, 16s... va u ma'lum bir maksimal vaqtga yetganda to'xtaydi (masalan, 30 soniyada).

```javascript
let attempts = 0;
const BASE_DELAY = 1000; // 1 soniya
const MAX_DELAY = 30000; // 30 soniya

function getBackoffDelay() {
  // Matematik formula: 1000 * (2 ning darajasi)
  const delay = BASE_DELAY * Math.pow(2, attempts); 
  return Math.min(delay, MAX_DELAY); // Qaysi biri kichik bo'lsa shuni oladi
}

function connect() {
  const ws = new WebSocket('ws://api.example.com');
  
  ws.onclose = () => {
    const delay = getBackoffDelay();
    console.log(`Uzilish! ${delay / 1000} soniyadan keyin qayta ulanamiz...`);
    
    setTimeout(() => {
      attempts++;
      connect();
    }, delay);
  };
  
  ws.onopen = () => { attempts = 0; };
}
```

### Network Awareness (Tarmoqni sezish)
Foydalanuvchi tuneldan o'tayotganda internet butunlay yo'qoladi. Bunday vaziyatda Brauzer hech qanday serverga ulana olmaydi, taymerlar orqali harakat qilish esa foydasiz zaryadni yeydi.
**Yechim:** Brauzerdagi tayyor `online` va `offline` eventlaridan foydalanib reconnect jarayonini aqlli qilish mumkin.

```javascript
let reconnectTimer = null;

// Internet butunlay yo'qolganda:
window.addEventListener('offline', () => {
  console.log("Internet yo'q!");
  clearTimeout(reconnectTimer); // Bekorga taymerni yurgizib o'tirmaymiz
});

// Internet qaytganda:
window.addEventListener('online', () => {
  console.log("Internet qaytdi! Zudlik bilan ulanamiz...");
  clearTimeout(reconnectTimer);
  attempts = 0; // Kutishni noldan boshlaymiz
  connect(); // Taymersiz darhol ulanamiz!
});
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi **Thundering Herd** (Momaqaldiroq podasi) muammosini hal qiluvchi **Jitter** yozishni, va Queue (Navbat) larni boshqarishni yaxshi biladi.

### Jitter (Tasodifiylik qo'shish)
Exponential backoff qanchalik yaxshi bo'lmasin, agar server 10:00:00 da o'chib yonsa, ulanish uzilgan millionlab foydalanuvchilar bir xil matematik formula bo'yicha hisoblaydi va barchasi roppa rosa 10:00:01 da yana serverga yopishadi. Bu yana serverni o'ldiradi. 
Buni oldini olish uchun har bir foydalanuvchining hisoblangan vaqtiga ozgina **random (jitter)** qo'shish kerak.

```javascript
function getJitteredBackoffDelay(attempts) {
  const BASE_DELAY = 1000;
  const MAX_DELAY = 30000;
  
  // Asosiy hisob (1s, 2s, 4s...)
  const exponentialDelay = Math.min(BASE_DELAY * Math.pow(2, attempts), MAX_DELAY);
  
  // Jitter: 0 dan 25% gacha bo'lgan tasodifiy o'zgarish
  const jitter = exponentialDelay * Math.random() * 0.25; 
  
  // Har bir kliyent har xil millisoniyalarda ulanadi (masalan, 1024ms, 1150ms, 1200ms)
  return exponentialDelay + jitter;
}
```

### Xabarlar Navbati (Message Queuing & Offline State)
Ulanish uzilgan paytda Foydalanuvchi "Jo'natish" tugmasini bossa nima bo'ladi? Oddiy tizimlarda xabar abadiy yo'qoladi. Professional tizimlarda esa ulanish qayta tiklangunga qadar xabarlar maxsus xotirada (Queue) yig'ib boriladi va ulanish o'rnatilishi bilanoq birdaniga otiladi.

```javascript
class ReliableConnection {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.messageQueue = []; // Oflayn xabarlar xazinasi
    this.isConnected = false;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.isConnected = true;
      this.flushQueue(); // Oflayn xabarlarni birdaniga yuborish
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      this.reconnect(); // Reconnect mantiqi
    };
  }

  send(data) {
    if (this.isConnected) {
      // Aloqa bor bo'lsa darhol jo'natamiz
      this.ws.send(JSON.stringify(data));
    } else {
      // Aloqa yo'q bo'lsa navbatga qo'shamiz (Foydalanuvchi sezmaydi)
      console.log("Oflayn: Xabar navbatga saqlandi");
      this.messageQueue.push(data);
    }
  }

  flushQueue() {
    if (this.messageQueue.length > 0) {
      console.log(`${this.messageQueue.length} ta eski xabarlar yuborilmoqda...`);
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift(); // Navbatdan olib tashlaymiz
        this.ws.send(JSON.stringify(msg));
      }
    }
  }
}
```

### Intervyu Savoli
**"Nima uchun `Socket.io` kutubxonasida Native WebSocket'ga qaraganda osonroq? Aynan Qayta ulanish (Reconnection) nuqtai nazaridan uning qanday tayyor afzalliklari bor?"**
*Javob:*
`Socket.io` ichida noldan yozishimiz kerak bo'lgan barcha Reconnect mantiqlari (Exponential Backoff, Jitter tasodifiyligi) "out-of-the-box" (tayyor) keladi. Uning eng zo'r afzalliklaridan biri bu "Buffer" (Queue) tizimidir. Ya'ni ulanish vaqtincha uzilib qolganda emit qilingan barcha xabarlarni o'zi avtomat yig'adi va ulanish qaytganda uzatadi. Yana bir muhim texnik tarafi u Fallback usulida ishlaydi, ulanish qiyin bo'lsa oldin Polling qiladi va muvaffaqiyatli bo'lsa WebSocket ga upgrade bo'ladi. Shu kabi kichik ko'rinadigan, ammo asabni buzuvchi Edge Case larni u o'zi hal qiladi. Shuning uchun ham Native WebSocket o'rniga Socket.io ishlatiladi. Lekin loyiha hajmi juda kichik va yengil bo'lishi talab etilsa (masalan, faqat narxlar monitoringi), VueUse dagi tayyor `useWebSocket` composable idagi `autoReconnect` qoidalaridan foydalangan ma'qul, u ham Jitterlarni qo'llab-quvvatlaydi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Jitter qo'shish majburiy:** Reconnection yozganda shunchaki oddiy exponential backoff ishlatmang. Qayta ulanish vaqtiga ozgina tasodifiy o'zgarish (Jitter) qo'shing. Bu tarmoq o'chib yonganda millionlab kliyentlar serverga bir vaqtning o'zida yopishib olib, uni qayta o'ldirib qo'yishini (Thundering Herd) oldini oladi.
2. **Network/Offline holatlarini tinglang:** Brauzerning `navigator.onLine` holatini va `online` / `offline` hodisalarini kuzatib boring. Agar internet butunlay yo'q bo'lsa, backoff taymerini to'xtatib turing. Qachonki tarmoq qaytsa (`online` event), taymerni kutib o'tirmasdan darhol qayta ulanishni boshlang.
3. **Kliyent tomonda navbat (Offline Queue) yarating:** Kliyent oflayn bo'lganida yubormoqchi bo'lgan xabarlarini o'chirib yubormang. Ularni maxsus massivda saqlab turing va ulanish qayta tiklangach, avtomatik ravishda serverga jo'natib oling (Message queue reconciliation).

---

## Xulosa

Reconnection strategiyalari bo'yicha yakuniy xulosa:

| Xususiyati | Exponential Backoff | Jitter (Tasodifiy siljish) | Network Awareness |
| --- | --- | --- | --- |
| **Vazifasi** | Har safar ulanish o'xshamasa kutish vaqtini ko'paytirish | Qayta ulanish vaqtini har xil kliyentlarda har xil qilish | Tarmoq bor/yo'qligini tekshirish |
| **Natija** | Server yuklamasini kamaytiradi | Thundering Herd muammosini yo'qotadi | Keraksiz so'rovlarni to'xtatadi, tarmoq qaytganda tez ulanadi |
| **Tavsiya** | Majburiy | Juda tavsiya etiladi | Majburiy |

Keyingi bo'lim: [Presence Systems](./05-presence-systems.md) - Foydalanuvchilarning "Online", "Offline" yoki "Yozmoqda..." holatlarini to'g'ri kuzatish qoidalari.
