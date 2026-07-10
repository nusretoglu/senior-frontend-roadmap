# Polling Strategies

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchilar real-time (jonli) ma'lumotlar bilan ishlaganda ko'pincha darhol WebSocket yoki SSE ga yugurishadi. Biroq, ba'zida server infratuzilmasi bunga mos kelmaydi (masalan, serverless/AWS Lambda serverlarida doimiy ochiq connection ushlab turish qimmat va cheklangan). Shunday paytda an'anaviy, ammo aqlli tarzda yozilgan **Polling (Muntazam So'rov yuborish)** eng yaxshi yechimga aylanadi. Polling turlarini va ularni qanday to'g'ri boshqarishni bilish — loyiha sharoitiga qarab eng to'g'ri texnologik qarorni qabul qilish imkonini beradi.

> [!NOTE]
> **Real-hayot analogiyasi: "Sayohatdagi Bola va Ota (Short vs Long Polling)"**  
> Tasavvur qiling, mashinada sayohatga ketyapsiz va orqada bola (Kliyent) o'tiribdi.  
> - **Short Polling:** Bola har 5 daqiqada "Yetib keldikmi?" deb so'raydi (Request). Ota (Server) darhol "Yo'q" deb javob beradi (Response). Bola 5 daqiqa kutadi va yana so'raydi. Bu otaning asabini buzadi (Server yuki juda yuqori).
> - **Long Polling:** Bola so'raydi: "Yetib keldikmi?". Ota darhol javob bermaydi. U jim ketadi (Request held on). Qachonki rostdan ham manzilga yetib kelgandagina (Data ready) ota "Ha, yetib keldik!" deb javob beradi. Bola javobni olib, yana yangi so'rov beradi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi WebSocket ni o'rnatish imkoni bo'lmaganda va ma'lumot uncha tez o'zgarmaganda **Short Polling** dan qanday to'g'ri foydalanishni bilishi kerak.

### Short Polling nima?
Bu eng oddiy usul. Brauzer `setInterval` orqali serverga doimiy qat'iy intervalda (masalan, har 10 soniyada) ma'lumot o'zgardimi deb so'rov beraveradi.

### Oddiy Implementation (Lekin bu xato yo'l)
```javascript
// BUNI ISHLATMANG! (Xato yo'l)
setInterval(async () => {
  const data = await fetch('/api/notifications');
  console.log(data);
}, 5000);
```
**Nega bu xato?** Agar foydalanuvchining interneti sekinlashib, 1-so'rov javobi 8 soniyada kelsa nima bo'ladi? 5 soniyadan keyin 2-so'rov ham ketib bo'ladi. Ular ustma-ust tushib, kodni chalg'itib (Race condition) yuboradi!

### To'g'ri Implementation (Recursive setTimeout)
Har doim avvalgi so'rovning **javobi kelib bo'lgach**, keyingisini chaqiring! Buni `setTimeout` orqali qilish kerak.

```javascript
// TO'G'RI YECHIM:
async function startShortPolling() {
  try {
    const response = await fetch('/api/notifications');
    const data = await response.json();
    console.log("Yangi ma'lumot:", data);
  } catch (error) {
    console.error("Tarmoq xatosi", error);
  } finally {
    // So'rov qanday tugashidan qat'i nazar (muvaffaqiyatli yoki xato), 
    // keyingi so'rovni 5 soniyadan keyin yuboramiz.
    setTimeout(startShortPolling, 5000);
  }
}

// Pollingni boshlash
startShortPolling();
```

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi serverni bo'g'ib qo'ymaslik uchun **Adaptive Polling** (Moslashuvchan polling) va Frontendda **Visibility API** integratsiyasini qila olishi kerak.

### Adaptive Polling (Moslashuvchan interval)
Tasavvur qiling, soat tungi 3. Foydalanuvchi saytingizni tab (oyna) da ochiq qoldirib ketgan. Saytingiz har 5 soniyada yangilik tekshirib yotibdi (Garchi hech narsa o'zgarmayotgan bo'lsa ham). Bu millionlab keraksiz requestlar degani!
**Adaptive Polling:** Agar serverdan ketma-ket "Yangi narsa yo'q" (yoki bir xil narsa) degan javob kelaversa, intervalni sekinlashtiring. Foydalanuvchi saytda harakat qilsa yana tezlashtiring.

```javascript
let currentInterval = 5000; // Boshlang'ich 5 soniya
const MAX_INTERVAL = 60000; // Maksimum 1 daqiqa
let lastDataHash = null;

async function adaptivePoll() {
  const response = await fetch('/api/live-score');
  const data = await response.json();
  const currentHash = JSON.stringify(data);

  if (currentHash === lastDataHash) {
    // Ma'lumot o'zgarmagan bo'lsa, kutish vaqtini sekin oshirib boramiz (+2 soniya)
    currentInterval = Math.min(currentInterval + 2000, MAX_INTERVAL);
  } else {
    // O'zgarish bo'lsa darhol tezlikni asl holiga qaytaramiz
    currentInterval = 5000;
    lastDataHash = currentHash;
    console.log("Yangi hisob:", data);
  }

  setTimeout(adaptivePoll, currentInterval);
}
```

### Visibility API integratsiyasi
Saytingiz ochiq bo'lsa ham, agar u **Background Tab** (orqa fondagi oyna) da turgan bo'lsa, Polling qilish umuman mantiqsiz!
```javascript
// Vue.js Component misoli
import { useDocumentVisibility } from '@vueuse/core';
import { watch, onMounted, onUnmounted } from 'vue';

const visibility = useDocumentVisibility();
let timeoutId = null;

async function poll() {
  // So'rov yuborish mantiqi...
  timeoutId = setTimeout(poll, 5000);
}

// Faqatgina sayt ko'zga ko'rinib turgandagina polling ishlaydi
watch(visibility, (current) => {
  if (current === 'visible') {
    poll(); // Darhol so'rovni boshlash
  } else {
    clearTimeout(timeoutId); // Tab yashirilsa to'xtatish
  }
});
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi Load Balancer muammolarini (Thundering Herd) biladi va **Long Polling** arxitekturasini Node.js da yoza oladi.

### Long Polling (Arxitektura darajasidagi yechim)
Long polling bu HTTP ning chegaralarini chetlab o'tuvchi va deyarli WebSocket bilan bir xil natija beruvchi hiyladir. Kliyent so'rov yuboradi, server esa "Javob yo'q" deb darhol qaytarmaydi, u shunchaki so'rovni ochiq (pending) holda ushlab turadi. Ma'lumot kelgan paytdagina server javobni yuboradi va ulanish yopiladi. Kliyent darhol yana yangi ulanish ochadi.

#### Kliyent (Frontend) tomon:
```javascript
async function longPoll() {
  try {
    // Bu so'rov serverda 30 soniyagacha kutib turishi mumkin
    const response = await fetch('/api/chat/sync'); 
    const message = await response.json();
    console.log("Yangi xabar:", message);
  } catch (error) {
    // Agar server timeout qilib javobsiz yopsa (502, 504)
    console.log("Qayta ulanmoqda...");
  } finally {
    // Javob kelgan zahoti kutmasdan yana so'rov yuboramiz
    longPoll();
  }
}
```

#### Server (Node.js/Express) tomon:
```javascript
// Serverda xabarlarni kutayotgan kliyentlarni saqlab turamiz
const clients = new Map();

// Kliyent Long Polling so'rovi yuborganda:
app.get('/api/chat/sync', (req, res) => {
  const userId = req.query.userId;
  
  // Darhol javob bermaymiz. So'rovni (res) Map ga saqlaymiz.
  clients.set(userId, res);

  // Ammo HTTP so'rov abadiy ochiq qola olmaydi (Brauzer/Proksi uni uzib qo'yadi). 
  // Odatda 30 soniyadan keyin bo'sh javob bilan uzib yuboriladi.
  req.on('close', () => {
    clients.delete(userId);
  });
});

// Qachonki shu User ga kimdir yangi xabar yozsa:
app.post('/api/chat/send', (req, res) => {
  const { toUserId, message } = req.body;
  
  // Kutib turgan res bormi tekshiramiz
  if (clients.has(toUserId)) {
    const clientRes = clients.get(toUserId);
    // Kutib turgan so'rovga javobni "otib" yuboramiz
    clientRes.json({ text: message }); 
    clients.delete(toUserId);
  } else {
    // Agar kutib turgan ulanish bo'lmasa, uni Redis yoki DB ga saqlash kerak
    saveToDB(toUserId, message);
  }
  
  res.send('Xabar yetkazildi');
});
```

### Thundering Herd (Momaqaldiroq podasi) muammosi va Jitter
Tasavvur qiling, sizning 10,000 ta foydalanuvchingiz Long polling qilyapti. Kutilmaganda Server restart bo'ldi va barcha 10,000 ulanish bir vaqtda uzildi. Brauzerlar bir xil sekundda (bir vaqtda) darhol qayta ulanishga harakat qiladi! Yangi yongan server birdaniga 10,000 ta "GET /sync" so'rovini ko'tarolmay o'lib qoladi.
**Yechim:** "Jitter" qo'shish kerak. Har bir kliyentning qayta ulanish vaqtiga biroz tasodifiylik (randomness) aralashtiring:
```javascript
const JITTER = Math.random() * 2000; // 0 dan 2 soniyagacha tasodifiy son
setTimeout(longPoll, JITTER); // Hammaga har xil vaqtda ulanish buyuriladi
```

### Intervyu Savoli
**"Nima uchun Long Polling o'rniga shunchaki WebSocket ishlatib qo'yaqolmaymiz? Long Polling hozirgi kunda ham ishlatiladimi?"**
*Javob:*
Ha, Long Polling hozir ham keng ishlatiladi. Katta sabablardan biri Serverless (AWS Lambda, Vercel Functions, Cloudflare Workers) texnologiyalaridir. Serverless muhitida sizda doimiy ishlovchi Node.js serveri bo'lmaydi, har bir qisqa so'rovdan keyin server "uxlaydi". Bunday joyda doimiy ochiq WebSocket yoki SSE ni umuman yozib bo'lmaydi! Bunday infratuzilmalarda va ma'lumotlar juda siyrak keladigan joylarda Long Polling (yoki Adaptive Short Polling) - "Real-time" illyuziyasini yaratish uchun birdan-bir maqbul arxitekturadir. Shuningdek, qat'iy korporativ Firewall lar ko'pincha WebSocket protokoli ulanishlarini to'sib qo'yadi, bunday joylarda HTTP ustida ishlovchi Polling muammosiz o'tib ketadi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Visibility API dan majburiy foydalaning:** Foydalanuvchi sahifangizni yopib, boshqa tabda ishlayotgan bo'lsa (yoki kompyuterni tark etgan bo'lsa), pollingni butunlay to'xtating (yoki intervalni 1 daqiqa qilib qo'ying). Buning uchun brauzerning `document.visibilityState` hodisasini kuzatib boring. Bu bekorchi server so'rovlarini 80% gacha kamaytiradi.
2. **Interval o'rniga setTimeout ishlating:** Hech qachon polling uchun `setInterval` ishlatmang. Sababi, agar tarmoq sekinlashib so'rov 10 soniya javob bermasa, `setInterval` baribir har 3 soniyada yangi so'rov yuboraveradi va natijada so'rovlar navbatga (race conditions) to'planib qoladi. Har doim avvalgi so'rov javobi (`resolve` yoki `reject`) kelgandan keyingina yangi `setTimeout` chaqiring (Recursive setTimeout).
3. **Race Conditionlarni bekor qiling:** Yangi so'rov yuborishdan oldin, agar oldingi so'rov hali yakunlanmagan bo'lsa, `AbortController` yordamida uni bekor qilib yuboring.

---

## Xulosa

Polling Strategies bo'yicha yakuniy xulosa:

| Strategiya | Qachon ishlatiladi? | Tarmoq yuki | Murakkabligi |
| --- | --- | --- | --- |
| **Short Polling** | Fallback yoki oddiy, juda kam yangilanadigan datalar uchun | 🔴 Juda yuqori |  Juda oson |
| **Long Polling** | WebSocket/SSE qo'llab-quvvatlamaydigan serverless loyihalarda |  O'rtacha |  O'rtacha |
| **Adaptive Polling**| Foydalanuvchi faolligiga qarab dynamic o'zgaruvchi panellarda | 🟢 Kam |  Murakkab |

Keyingi bo'lim: [Reconnect Strategies](./04-reconnect-strategies.md) - Tarmoq uzilib qolganda mijozlarni aqlli tarzda qanday qilib serverga qaytarish haqida.
