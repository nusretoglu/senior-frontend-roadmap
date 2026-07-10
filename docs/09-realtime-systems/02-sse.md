# Server-Sent Events (SSE)

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Agar loyihangizda faqatgina serverdan kliyentga ma'lumot uzatish kerak bo'lsa (masalan, bir tomonlama yangiliklar lentasi, monitoring panellari, yuklanish foizi - progress bar yoki ChatGPT kabi matnni stream qilib chiqarish), ikki tomonlama og'ir WebSocket protokolini sozlash shart emas. **SSE (Server-Sent Events)** shunchaki oddiy HTTP protokoli orqali ishlaydi, brauzerda tayyor `EventSource` obyekti bor va u tarmoq uzilsa o'z-o'zidan qayta ulanadi (auto-reconnect). U ancha yengil va xavfsizdir.

> [!NOTE]
> **Real-hayot analogiyasi: "Rassom va uning ko'rgazmasi vs Televideniye"**  
> - **WebSocket (Ikki tomonlama suhbat):** Ikki kishining telefon orqali gaplashishi. Ikkalasi ham bir-biriga gapira oladi.
> - **SSE (Televideniye):** Siz televizor ko'ryapsiz. Telekanal (Server) sizga doimiy ravishda ko'rsatuvlar (Data stream) yuboradi, lekin siz televizor orqali telekanalga javob qaytara olmaysiz. Siz faqat tinglaysiz (One-way client listen). ChatGPT matnni stream qilganda aynan shu usuldan foydalanadi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi WebSocket qila oladigan hamma ishlarni qiyinlashtirmasdan qanday qilib oddiy HTTP so'rov bilan yengil bajarishni o'rganadi.

### Qanday ishlaydi?
SSE bu shunchaki bitta katta "tugallanmagan" HTTP javobdir (Response). 
Brauzer oddiy HTTP GET so'rov yuboradi. Server esa qandaydir ma'lumot yuboradi, lekin aloqani yopmaydi (`Connection: keep-alive`). Oradan 5 soniya o'tib yana bitta ma'lumot yuboradi. Shu tarzda HTTP quvuri doim ochiq qoladi va server ichiga xohlagan vaqt ma'lumot tashlaydi.

### Asosiy API (Frontend)
Brauzerda tayyor `EventSource` obyekti bor. Hech qanday uchinchi tomon kutubxonasi kerak emas.

```javascript
// 1. Serverga ulanish (GET so'rov ketadi)
const sse = new EventSource('https://api.my-website.com/stream');

// 2. Xabar kelganda
sse.onmessage = (event) => {
  console.log("Server yuborgan ma'lumot:", event.data);
};

// 3. Xatolik (yoki internet uzilsa)
sse.onerror = (error) => {
  // Brauzer O'ZI avtomatik qayta ulanishga harakat qiladi!
  console.log("Xatolik. Brauzer qayta ulanyapti...");
};

// 4. Ulanishni butunlay yopish (komponentdan chiqqanda)
sse.close();
```
Ko'rib turganingizdek SSE da `send()` funksiyasi yo'q. Chunki SSE orqali faqat O'QISH mumkin!

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi SSE formatini, Custom Eventlar ajratishni va Node.js dagi to'g'ri integratsiyani o'rganadi.

### SSE Xabari Formati (Protokol qoidasi)
Serverdan qaytadigan matn shunchaki JSON yoki String bo'la olmaydi. U maxsus strukturaga ega bo'lishi shart (Text-based format). Har bir ma'lumot `data: ` bilan boshlanib, 2 ta yangi qator (`\n\n`) bilan tugaydi.
Server tomondan kelayotgan Raw Data:
```text
data: {"user":"Ali", "msg":"Salom"}

data: {"user":"Vali", "msg":"Ishlar qanday?"}

```

### Custom Eventlar yuborish
Server faqatgina `onmessage` ga emas, turli xil nomlangan eventlarga ham xabar yuborishi mumkin. Bu Frontend da qabul qilishni ancha osonlashtiradi.
Serverdan kelayotgan xabar:
```text
event: new_user
data: "Hasan"

event: user_leave
data: "Husan"

```
Frontend da qabul qilish:
```javascript
const sse = new EventSource('/api/events');

sse.addEventListener('new_user', (e) => {
  console.log(e.data + " kirdi");
});

sse.addEventListener('user_leave', (e) => {
  console.log(e.data + " chiqib ketdi");
});
```

### Express.js da Server yasash
```javascript
app.get('/api/events', (req, res) => {
  // 1. Brauzerga bu SSE ekanini tushuntiramiz
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 2. Birinchi ma'lumotni jo'natamiz
  res.write(`data: "Xush kelibsiz!"\n\n`);

  // 3. Har 3 soniyada vaqtni yuboramiz
  const intervalId = setInterval(() => {
    res.write(`data: "${new Date().toLocaleTimeString()}"\n\n`);
  }, 3000);

  // 4. Brauzer yopilganda (Kliyent ketganda) tozalash
  req.on('close', () => {
    clearInterval(intervalId);
  });
});
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi SSE dagi Yashirin Muammolar (Pitfalls), Nginx bilan kelishuvlar, Reconnection Loss va HTTP limitlarini hal qiladi.

### 1. HTTP ulanishlari Limiti (Eng Katta Muammo!)
Browserlarda bitta Domenga qilingan HTTP so'rovlar sonida cheklov bor. Odatda bu HTTP/1.1 uchun maksimum **6 ta parallel ulanish** demakdir.
Agar foydalanuvchi sizning saytingizni 6 ta Tab (Oyna) da ochsa va har bir tab `new EventSource()` orqali serverga bog'lanib osa, 7-tabni ochganida umuman ishlamay (Hang) qotib qoladi! Hech qanday so'rov serverga ketmaydi.
**Yechim:** 
Siz Serveringizda **HTTP/2** (yoki HTTP/3) ni yoqishingiz shart. HTTP/2 dagi Multiplexing texnologiyasi 1 ta ochiq ulanish (TCP connection) orqali yuzlab so'rovlarni (stream) bemalol ishlayveradi va bu limit batamom yo'q bo'ladi.

### 2. Nginx Buffering muammosi
Agar siz Express dagi loyihangizni Nginx ortiga qo'yib Deploy qilsangiz, SSE ishlamay qoladi. Nega? 
Chunki Nginx Serverdan kelayotgan kichik javoblarni (Chunk larni) o'zida yig'ib (Buffer qilib), "To'liq bitta katta javob shakllansin keyin jo'nataman" deb kutib o'tiradi. SSE dagi har 1 soniyalik ma'lumot brauzerga bormay turib qoladi.
**Yechim:** Express da Header ga quyidagi qatorni qo'shib yuboring (Bu Nginx ga buferlamaslikni buyuradi):
```javascript
res.setHeader('X-Accel-Buffering', 'no');
```

### 3. Last-Event-ID va Reconnection Loss
Brauzer internet uzilib qolsa o'zi avtomatik tarzda qayta ulanadi deydik. Ammo internet 5 soniyaga yo'qolib keyin kelgan bo'lsa, o'sha 5 soniyadagi xabarlar (Data) nima bo'ladi? Ular abadiy yo'qoldimi?
**Yechim (Aqlli Reconnect):**
Server har bir xabarga ID (tartib raqami) yozib yuborishi kerak:
```text
id: 101
data: {"msg": "Salom"}
```
Endi brauzer qayta ulanganda, backend ga avtomatik tarzda maxsus Header (`Last-Event-ID: 101`) qo'shib yuboradi. Backend shunda tushunadi: "Ha, u 101 ni olibdi, demak unga 102, 103, 104 larni birdaniga yuborishim kerak!". Bu arxitekturani Backend dasturchi o'zi Cache (masalan Redis da xabarlarni vaqtincha yig'ib) logikasi yordamida yozishi talab etiladi.

### Intervyu Savoli
**"Agar loyihamizda Chat yozish kerak bo'lsa, men WebSocket ishlatganim ma'qulmi yoki SSE? Qaysi biri yaxshiroq?"**
*Javob:*
Chat loyihasi ikki tomonlama aloqani — Kliyent serverga xabar yuborishini (Type qilish, statuslar) va Server kliyentga yuborishini (Xabar qabul qilish) talab etadi. Bunday stsenariyda WebSocket ishlatish ideal yechimdir.
Biroq SSE ni Chat uchun umuman ishlatib bo'lmaydi deyish noto'g'ri. Biz Kliyentdan Serverga xabarlarni odatiy `POST /messages` so'rovi orqali jo'natib, kelayotgan yangi xabarlarni esa faqat O'QISH uchun SSE ga tashlab qo'yishimiz ham mumkin. Lekin bunda siz HTTP POST so'rovlarining yuki (Overhead - headers va latency) ga chidashingizga to'g'ri keladi. SSE ko'proq Bir tomonlama Data-stream lar uchun (Monitoring, Live Score, AI text generation) ayni muddao!

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **HTTP/2 yoki HTTP/3 ni majburiy qiling:** Eski HTTP/1.1 protokoli ustida bitta brauzerda maksimum 6 ta parallel so'rov limiti mavjud. Agar foydalanuvchi saytingizni 6 ta tabda ochsa va ularning har biri SSE ulanishiga ega bo'lsa, 7-tab butunlay yuklanmay muzlab qoladi. HTTP/2 multiplexing yordamida bu limitni cheksiz qiling (yoki Shared Worker ishlating).
2. **Nginx/Proxy bufferingni o'chiring:** Agar oldinda Nginx kabi proksi serverlar tursa, ular serverdan kelayotgan stream ma'lumotlarni "buferlab" birdaniga kliyentga berishga harakat qiladi va real-time effekti yo'qoladi. Buni tuzatish uchun server javobiga `X-Accel-Buffering: no` sarlavhasini qo'shib yuboring.
3. **Heartbeat yuboring:** Tarmoqdagi oraliq proksi-serverlar agar ulanishda 30-60 soniya ma'lumot aylanmasa uni avtomatik (Timeout) yopib yuboradi. Buni oldini olish uchun serverdan har 15-20 soniyada shunchaki bo'sh izoh (comment: `:\n\n`) yuborib turing.

---

## Xulosa

Server-Sent Events bo'yicha yakuniy xulosa:

| Xususiyati | SSE (Server Sent Events) | WebSocket |
| --- | --- | --- |
| **Brauzer API** | Tayyor API (`EventSource`) | Tayyor API (`WebSocket`) |
| **Qayta ulanish** | Brauzer O'zi ulanadi (+ `Last-Event-ID`) | Kliyentda o'zingiz yozishingiz shart |
| **Resurs sarfi (Server)** | Kamroq (Oddiy HTTP request) | Ko'proq (Port va Handshake holati) |
| **Tarmoq mosligi** | Proxy va Firewall'ardan deyarli 100% o'tadi | Ba'zi Firewall'lar WebSocketni yopadi |

SSE - Bir tomonlama, WebSocket - Ikki tomonlama oqim. Ularning bir-biridan ustunligi yo'q, har birini o'z o'rnida ishlatish sizning darajangizni belgilaydi.

**Keyingi qadam:** [03-polling.md](./03-polling.md) - Eski lekin kuchli Polling (Long Polling) strategiyalari va ular qachon kerakligi haqida.
