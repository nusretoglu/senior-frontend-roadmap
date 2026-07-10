# Chat Implementation

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Chat tizimlari dastlab oddiy bo'lib ko'rinadi (so'rov yuborilsa, uni boshqaga uzatish). Ammo uning real-world (ishlab chiqarish) talablari juda murakkab: agar internet yomon bo'lsa, xabarning yuborilayotganini ko'rsatish (Optimistic UI), xabar serverga yetib borganini va o'qilganini belgilash (Single/Double Check), va oflayn rejimda yuborilgan xabarlarni qayta tiklash (Offline Queue). Bu bilimlarni chuqur egallash sizga Telegram kabi millionlab foydalanuvchiga ega tezkor chat tizimlarini yaratish imkonini beradi.

> [!NOTE]
> **Real-hayot analogiyasi: "Pochta orqali xat yuborish (Xabar Lifecycle)"**  
> - **Composing (Yozilmoqda...):** Siz xat yozishni boshladingiz (Typing indicator).
> - **Sending (Yuborilmoqda... - Optimistic UI):** Xatni pochtachiga topshirdingiz (Kliyentda soat belgisi).
> - **Sent (Yuborildi - 1 check):** Xat pochta bo'limiga (Serverga) yetib bordi va ro'yxatdan o'tdi (1 ta kulrang galchka).
> - **Delivered (Yetkazildi - 2 checks):** Pochtachi xatni do'stingizning pochta qutisiga tashlab ketdi (2 ta kulrang galchka).
> - **Read (O'qildi - Seen/Blue checks):** Do'stingiz xatni ochib o'qidi (2 ta ko'k galchka).

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi chatning eng sodda variantini — foydalanuvchi xabar yozganda uni serverga yetkazish va ekranga chiqarishni yozadi. Ammo bunda asosan server javobiga qarab UI chiziladi (Pessimistic UI).

### Yomon (Pessimistic) Chat UX
Oddiy dasturlashda xabarni yuboramiz, server bazaga saqlab "OK" degandan keyin ekranga chiqaramiz.

```javascript
// Junior usuli: Xabar yuborishda serverni kutish
async function sendMessage() {
  const text = chatInput.value;
  
  // 1. Loading... ko'rsatamiz
  showLoadingSpinner();
  
  try {
    // 2. Serverga xabar ketdi (Kutish boshlandi...)
    const savedMessage = await api.post('/chat', { message: text });
    
    // 3. Server saqladi, endi uni ekranga chizamiz
    hideLoadingSpinner();
    addMessageToScreen(savedMessage);
  } catch (error) {
    alert("Xato! Xabar ketmadi");
  }
}
```
**Muammo:** Agar foydalanuvchining interneti "E" (Edge) bo'lsa, xabari 3 soniyada boradi. U 3 soniya ekranida Loader aylanib yotganini ko'radi. Bu juda asabni buzuvchi "Qotadigan Chat" ga olib keladi.

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi **Optimistic UI** (Optimizm interfeys) va **Local ID (Kliyent ID)** tushunchalarini kiritadi. Xabar qotmaydi, birzumda ekranga chiqadi.

### Optimistic UI nima?
Biz server qabul qilishini kutib o'tirmaymiz. Foydalanuvchi "Send" tugmasini bosishi bilanoq, xabarni ekranga "Soat" (Pending) belgisi bilan chiqaramiz va orqa fonda sekin serverga jo'natamiz.

```javascript
// Middle usuli: Optimistic yondashuv
async function sendMessage() {
  const text = chatInput.value;
  
  // 1. Kliyent tomonida vaqtinchalik yagona ID (UUID) yaratamiz
  const localId = crypto.randomUUID(); 
  
  // 2. Darhol ekranga chizamiz! (Kutish YO'Q)
  const tempMsg = { id: localId, text, status: 'pending' };
  addMessageToScreen(tempMsg);
  
  try {
    // 3. Orqa fonda serverga yuboramiz
    const serverResult = await api.post('/chat', { 
      localId: localId, // ID ni ham qo'shib beramiz
      message: text 
    });
    
    // 4. Server javob bergach, ekrandagi "soat" belgisini bitta galchkaga (Sent) o'zgartiramiz
    updateMessageStatus(localId, 'sent');
  } catch (error) {
    // 5. Agar ulanish uzilib qolsa, "Qizil X" chizamiz
    updateMessageStatus(localId, 'failed');
  }
}
```

### Serverda dublikatlarning oldini olish (Idempotency)
Middle dasturchi yuborgan `localId` endi serverda ham saqlanadi. Agar Kliyentning interneti yomonlashib xabarni 2 marta yuborib yuborsa (Retry qilsa), server "Bu `localId` bazamda bor-ku!" deydi va qayta saqlamaydi (Deduplication).

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi **Offline Queue** (Oflayn navbat), **Message Sync** (Yo'qolgan xabarlarni tiklash), va aniq **Read Receipts** (O'qilganlikni tasdiqlash) arxitekturasini yaratadi.

### Offline Queue (Oflayn xabarlar xazinasi)
Internet umuman yo'q paytida foydalanuvchi 5 ta xabar yozsa, ular qizil xato bo'lib qolmasligi yoki yo'qolib ketmasligi kerak. Ular kliyent xotirasida (IndexedDB) navbatda kutib turadi va internet kelganda o'z-o'zidan otiladi.

```javascript
const messageQueue = [];

function sendMessageReliably(text) {
  const message = { id: crypto.randomUUID(), text, status: 'pending' };
  addMessageToScreen(message); // Optimistic

  if (navigator.onLine && ws.readyState === WebSocket.OPEN) {
    // Internet bor bo'lsa to'g'ridan-to'g'ri yuboramiz
    ws.send(JSON.stringify(message));
  } else {
    // Internet yo'q bo'lsa navbatga (Queue) qo'shamiz
    messageQueue.push(message);
    updateMessageStatus(message.id, 'queued'); // Ekranda alohida oflayn belgi ko'rsatish mumkin
  }
}

// Qachonki tarmoq tiklansa:
window.addEventListener('online', () => {
  console.log(`${messageQueue.length} ta oflayn xabar topildi. Yuborish...`);
  while(messageQueue.length > 0) {
    const msg = messageQueue.shift(); // Navbatdan birinchi xabarni olib
    ws.send(JSON.stringify(msg)); // Serverga yuboramiz
  }
});
```

### Read Receipts (Ko'k galchka siri - IntersectionObserver)
Ikkita ko'k galchka xabarni ochgan zahoti yonib ketmasligi kerak. Faqat foydalanuvchining ekranida Katta xabarning eng quyi qismi ko'ringandagina o'qildi deyiladi.
Buning uchun sahifani Scroll qilganda emas (bu qotishlarga olib keladi), zamonaviy `IntersectionObserver` ishlatiladi. Kliyent "O'qidi" degan signalni har bir xabar uchun alohida emas, blokka (Batch) yig'ib yuboradi.

```javascript
// O'qilgan xabarlar ID larini vaqtincha yig'amiz
const pendingReadIds = new Set();

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // Agar xabar foydalanuvchiga ko'rinsa
    if (entry.isIntersecting) {
      const messageId = entry.target.dataset.id;
      pendingReadIds.add(messageId); // Set ga qo'shamiz
      observer.unobserve(entry.target); // Qayta o'qidi deb jo'natmaslik uchun
      
      debouncedSendReadReceipts(); // Serverga bildirishni boshlaymiz
    }
  });
});

// Throttle/Debounce: Bitta xabar o'qildi degandan 500ms o'tgach qolganlarini ham qo'shib (Batch) jo'natamiz
const debouncedSendReadReceipts = debounce(() => {
  if (pendingReadIds.size > 0) {
    ws.send(JSON.stringify({
      type: 'messages_read',
      messageIds: Array.from(pendingReadIds)
    }));
    pendingReadIds.clear(); // Jo'natgach tozalaymiz
  }
}, 500);
```

### Intervyu Savoli
**"Telegram yoki WhatsApp da yuborgan xabaringiz qanday qilib darhol ikkinchi odamga yetib boradi? Agar qabul qiluvchi o'sha paytda oflayn bo'lsa tizim buni qanday boshqaradi?"**
*Javob:*
Birinchidan, yuboruvchi xabarni bosishi bilan Kliyent tomon **Optimistic Update** orqali UI ni yashiradi (UX uchun). Server xabarni Kliyent 1 dan WebSocket orqali qabul qiladi, uni bazaga (PostgreSQL + UUID bilan) saqlab xavfsizlikni ta'minlaydi. 
Ikkinchidan, Server Kliyent 2 ni "Active Connections" Map dan izlaydi.
- Agar topsa: Unga to'g'ridan-to'g'ri WebSocket orqali yetkazadi va Kliyent 1 ga `Delivered` xabarini push qiladi.
- Agar Kliyent 2 oflayn bo'lsa: Xabarni Server o'zining bazasida (Pending/Unread) qoldiradi. Qachonki Kliyent 2 internetga ulanib, ro'yxatdan o'tishi bilan "Message Sync" (Menga oxirgi kirmagan vaqtimdagi xabarlarni ber) so'rovini tashlaydi va barcha oflayn xabarlar yuklab olinadi. Agar foydalanuvchiga darhol bildirgi kerak bo'lsa, xabar APNs/FCM kabi Push Notification xizmatlariga yo'naltiriladi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Optimistic UI dan foydalaning:** Foydalanuvchi xabar yuborganda, uni serverga jo'natish bilan bir vaqtda darhol ekranda "Sending..." (yuborilmoqda) holati bilan ko'rsating. Serverdan javob (acknowledgment) kelgach, holatni "Sent" ga o'zgartiring. Bu chat ilovasining ulanish sekin bo'lganda ham juda tez va silliq ishlashini ta'minlaydi.
2. **Kliyent tomonda Idempotentlik (Deduplication):** Har bir xabar uchun kliyent tomonida unique `clientGeneratedId` (UUID) yarating. Agar tarmoq uzilib, kliyent qayta ulansa va bir xil xabarni ikki marta yuborsa, server o'sha ID bo'yicha dublikat xabarni bazaga yozmaydi va kliyentga avvalgi saqlangan xabarni qaytaradi.
3. **Oflayn rejimlarni qo'llab-quvvatlang (Offline Queue):** Agar internet yo'q bo'lsa, xabarlarni o'chirmasdan `IndexedDB` yoki local storage navbatida (queue) saqlang. Internet qaytishi bilanoq ularni navbati bilan serverga yuboring (Reconciliation).

---

## Xulosa

Chat Implementation bo'yicha yakuniy xulosa:

| Xususiyati | Optimistic UI | Idempotent ID | Offline Queue |
| --- | --- | --- | --- |
| **Muammo** | Tarmoq sekinligi tufayli xabar yuborishda foydalanuvchi kutib qolishi | Qayta ulanishda bir xil xabar 2 marta ketib qolishi | Internet yo'qolganda yozilgan xabarlar yo'qolishi |
| **Yechim** | Xabarni darhol ekranda "soat" belgisi bilan chizish | Kliyentda UUID yaratib, serverda dublikatni tekshirish | Xabarlarni IndexedDB navbatida saqlab, internet kelganda yuborish |
| **Tavsiya** | Majburiy (UX uchun) | Majburiy (Data integrity uchun) | Tavsiya etiladi |

Keyingi bo'lim: [Live Notifications](./07-live-notifications.md) - Foydalanuvchi diqqatini tortish uchun Toast, Badge va Push xabarnomalar qoidalari.
