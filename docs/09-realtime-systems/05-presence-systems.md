# Presence Systems

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Foydalanuvchilarning tarmoqda faolligini kuzatish (Online/Offline statusi) har qanday collaborative (birgalikda ishlaydigan) yoki ijtimoiy ilovalarda (masalan, Telegram, Slack, Google Docs) juda muhim. Agar foydalanuvchining interneti uzilsa-yu, uni boshqalarga 10 daqiqa davomida "Online" deb ko'rsatib tursangiz, boshqa foydalanuvchilar javob kutaverib charchashadi va ilova sifatsiz ko'rinadi. **Presence System** orqali foydalanuvchining faolligini millisekundlarda aniqlab, uning statusini real-vaqtda boshqalarga ko'rsatish mumkin.

> [!NOTE]
> **Real-hayot analogiyasi: "Ofisdagi Ishchi (Online, Idle, Away)"**  
> Tasavvur qiling, ofisdagi bitta ishchining statusini kuzatyapsiz.  
> - **Online (Faol):** Ishchi stolda o'tiribdi, kompyuterda nimadir yozmoqda (Kliyent voqealari: click, mousemove, keydown).
> - **Idle (Harakatsiz):** Ishchi stolda o'tiribdi, lekin ko'zini yumib dam olyapti (5 daqiqa davomida hech qanday klaviaturada yoki sichqonchada faollik yo'q). Status avtomatik "Idle" ga o'tadi.
> - **Away (Ketgan):** Ishchi tushlik qilishga yoki majlisga ketgan (30 daqiqadan ko'proq faollik yo'q).
> - **Offline (Binoda yo'q):** U binodan chiqib ketdi (WebSocket ulanishi uzildi).

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi foydalanuvchining qachon online va qachon offline bo'lishining eng sodda logikasini WebSocket ulanishi asosida yozishni o'rganishi kerak.

### Eng oddiy Online/Offline mantiqi
Foydalanuvchi serverga ulanganda u "Online", ulanishni uzib ketganda u "Offline" bo'ladi. Buni server tomonda qanday tutamiz?

```javascript
// Node.js (Socket.io) server qismi:
const connectedUsers = new Map(); // Foydalanuvchilarni xotirada saqlash uchun

io.on('connection', (socket) => {
  // 1. Foydalanuvchi ulandi
  const userId = socket.handshake.query.userId;
  connectedUsers.set(userId, { status: 'online' });
  
  // Boshqalarga xabar berish
  io.emit('user_status_changed', { userId, status: 'online' });

  // 2. Foydalanuvchi chiqib ketdi (Brauzerni yopdi yoki interneti uzildi)
  socket.on('disconnect', () => {
    connectedUsers.delete(userId);
    io.emit('user_status_changed', { userId, status: 'offline' });
  });
});
```
Bu kod ishlaydi, lekin juda ko'p "Edge Case" (kutilmagan muammolar) si bor.

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi Multiple Connections (Bir nechta oynalar muammosi) ni va Client tomonda Idle (Faolsizlik) qanday yozilishini biladi.

### Multiple Connections Muammosi
Foydalanuvchi kompyuterda chatni ochdi. Keyin o'sha chatni noutbukida ham ochdi. Unda hozir 2 ta WebSocket ulanishi bor. 
U noutbukdagi oynani yopganda, serverdagi `disconnect` ishlab uni darhol "Offline" deb hammaga ko'rsatib qo'yadi. Aslida u kompyuterda hali ham online edi!
**Yechim (Connection Counting):** 
Foydalanuvchini faqatgina barcha ulanishlari `0` ga teng bo'lgandagina offline deb hisoblaymiz.

```javascript
const userConnections = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  
  // Ulanishlar sonini oshirish
  const currentCount = userConnections.get(userId) || 0;
  userConnections.set(userId, currentCount + 1);
  
  if (currentCount === 0) {
    io.emit('presence', { userId, status: 'online' }); // Faqat birinchi ulanishda "online" deymiz
  }

  socket.on('disconnect', () => {
    const newCount = userConnections.get(userId) - 1;
    userConnections.set(userId, newCount);
    
    // Faqatgina oxirgi oyna yopilganda "offline" qilamiz
    if (newCount === 0) {
      io.emit('presence', { userId, status: 'offline' });
    }
  });
});
```

### Idle va Away (Faolsizlikni aniqlash - Kliyent tomonda)
Brauzer uzoq vaqt harakatsiz tursa, uni "Online" emas "Away" deb ko'rsatish kerak.

```javascript
// Kliyent tomondagi logika:
let idleTimer = null;
let isAway = false;

function resetIdleTimer() {
  if (isAway) {
    isAway = false;
    socket.emit('status_update', 'online'); // Qaytib keldi
  }
  
  clearTimeout(idleTimer);
  
  // Agar 5 daqiqa hech narsa qilmasa, Away ga o'tkazish
  idleTimer = setTimeout(() => {
    isAway = true;
    socket.emit('status_update', 'away');
  }, 5 * 60 * 1000);
}

// Barcha harakatlarni tinglaymiz
document.addEventListener('mousemove', resetIdleTimer);
document.addEventListener('keydown', resetIdleTimer);
document.addEventListener('click', resetIdleTimer);

resetIdleTimer(); // Dastlabki ishga tushirish
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi Throttling (Yuklamani kamaytirish), Heartbeats (O'lik ulanishlarni tozalash) va Redis orqali Scalable (kengayuvchi) Presence qanday qilinishini biladi.

### Heartbeats (Zombie Connection'larni o'ldirish)
Ba'zida foydalanuvchining interneti shunday yomon uziladiki, serverga `disconnect` voqeasi ham bormaydi. Socket ochiqqa o'xshab turadi (Stale connection), uni server "Online" deb saqlab yotaveradi. Bunga qarshi *Heartbeat* yozamiz.
- Kliyent har 30 soniyada "Men tirikman (Ping)" deb xabar yuboradi.
- Server buni qayd etadi. Agar server qaysidir kliyentdan 45 soniyadan beri "Tirikman" signalini olmasa, uni shafqatsizlarcha xotiradan tozalaydi va "Offline" deydi.

### Typing Indicator (Yozmoqda...) va Throttling
"Ali xabar yozmoqda..." degan xabar yuborish Presence ning bir qismidir. Ammo foydalanuvchi klaviaturada sekundiga 10 ta harf ursa, har bir harfga serverga so'rov ketaversa server nima ahvolga tushadi? Bunga qarshi Debounce va Throttle ishlatamiz.

```javascript
// Typing Indicator (Vue.js dagi to'g'ri yozilishi)
let isTyping = false;
let stopTypingTimeout = null;

function onUserKeyPress() {
  // Faqat 1 marta serverga xabar ketadi
  if (!isTyping) {
    isTyping = true;
    socket.emit('typing_start');
  }

  // Har bir bosilganda taymer yangilanadi (Debounce)
  clearTimeout(stopTypingTimeout);
  stopTypingTimeout = setTimeout(() => {
    isTyping = false;
    socket.emit('typing_stop'); // 3 soniya jim qolsa, "Yozishdan to'xtadi" signalini beradi
  }, 3000);
}
```

### Redis orqali Kengaytirish (Distributed Presence)
Agar bizda Node.js serverlari soni 5 ta bo'lsa (Load Balancer ostida), Memory (`Map`) ishlatib bo'lmaydi. Alisher 1-serverga ulanib online bo'lsa, Bobur (2-serverdagi) buni bilmaydi.
Shuning uchun barcha serverlar o'z mijozlarining statuslarini bitta markaziy Redis ga yozib borishi kerak!

1. Kliyent "Tirikman" deganda, server Redis dagi `presence:user_id_123` kalitini (Hash) yangilaydi.
2. Bu kalitga Redis da `Expire = 45 sekund` (TTL) qo'yiladi. Agar Heartbeat kelmasa Redis ni o'zi uni o'chirib yuboradi! (Bu dahshatli va mukammal arxitektura).
3. Va Redis Pub/Sub orqali boshqa serverlarga status o'zgargani (yoki o'chib ketgani) haqida signal (Event) tashlaydi.

### Intervyu Savoli
**"Millionlab online foydalanuvchilari bor ilovada Presence System qanday scale (kengaytirish) qilinadi? Hammaga hammamizning statusimizni birdaniga broadcast qilish to'g'rimi?"**
*Javob:*
Yo'q, mutlaqo noto'g'ri. Million foydalanuvchi qachon online/offline bo'lganini barchaga (broadcast) tashlash tarmoqni ham, kliyentni ham o'ldiradi. 
Zo'r yechim — bu **Pub/Sub (Subscription)** modelidir. Kliyent ekranida faqat kimlar (masalan, 10 ta kontakt) ko'rinib turgan bo'lsa, kliyent faqat o'shalar ID siga "Subscribe" qiladi xolos. Server ham faqat shu ro'yxatdagi odamlarning statusigina o'zgarganda xabar beradi. Ekrandan chiqib ketganlarni "Unsubscribe" qilib tashlanadi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Ko'p qurilmalarni (Multiple Tabs/Devices) to'g'ri hisoblang:** Foydalanuvchi bir vaqtning o'zida ham telefonda, ham kompyuterda (yoki brauzerda 3 ta tabda) saytingizni ochishi mumkin. Agar u bitta tabni yopsa, uni darhol "Offline" qilib qo'ymang. Serverda foydalanuvchining umumiy ulanishlar sonini hisoblang (Active connection count). Faqatgina barcha ulanishlar soni `0` ga teng bo'lgandagina uni "Offline" deb e'lon qiling.
2. **Typing Indicatorni (Yozmoqda...) throttle qiling:** Foydalanuvchi xabar yozayotganda, har bir harf bosilganda serverga "yozmoqda" degan xabar yuboravermang. `Throttle` (masalan har 3 soniyada bir marta jo'natish) va harf yozishdan to'xtaganidan keyin 3 soniyadan so'ng avtomatik o'chadigan `Debounce` taymerini qo'llang.
3. **Redis SET/GET o'rniga TTL ishlating:** Katta ilovalarda foydalanuvchilarning online statusini Memory da emas, Redis da saqlang. Har bir statusga `TTL (Time to Live)` ya'ni umr uzunligi bering (masalan 60 soniya). Har safar Ping kelganda bu vaqtni yana 60 soniyaga uzaytiring. Agar server umuman qulab tushsa ham, ulanishi uzilgan kontaktlarning statusini Redis o'zi vaqti tugagani uchun bittada o'chirib, tozalab boradi (Zombie o'lik connectionlar qolmaydi).

---

## Xulosa

Presence Systems bo'yicha yakuniy xulosa:

| Holat | Qachon o'tadi? | UI Ko'rinishi | Kliyent faolligi |
| --- | --- | --- | --- |
| **Online** | Ulanish o'rnatilganda va faol bo'lganda | Yashil nuqta (Active) | Klaviatura / sichqoncha harakati bor |
| **Idle** | 5 daqiqa davomida harakatsiz bo'lsa | Sariq nuqta (Idle) | Sahifa ochiq, lekin harakat yo'q |
| **Away** | 30 daqiqadan ko'p harakatsiz bo'lsa | Kulrang nuqta (Away) | Kompyuter tark etilgan |
| **Offline** | WebSocket/SSE uzilganda (0 active connection) | Kulrang nuqta / "Offline" | Ulanish butunlay uzilgan |

Keyingi bo'lim: [Chat Implementation](./06-chat-implementation.md) - Oldingi bilimlarni jamlab qanday qilib tayyor arxitekturaga ega chat yozish.
