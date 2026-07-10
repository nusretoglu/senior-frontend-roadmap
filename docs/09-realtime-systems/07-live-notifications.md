# Live Notifications

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Foydalanuvchilarni yangi xabarlar, to'lov muvaffaqiyatli o'tganligi yoki xavfsizlik ogohlantirishlari haqida vaqtida xabardor qilish (Notifications) ilovaning qayta ishlatilishini (Retention) 40% gacha oshiradi. Notification tizimini to'g'ri loyihalashtirish — foydalanuvchining asabiga tegmaydigan qilib unga kerakli kanallar (In-App Toast, Web Push, SMS, Email) orqali xabar yuborish, hamda tizim yuki oshib ketmasligi uchun xabarlarni guruhlash (Batching) va filtrlash (Deduplication) mantiqini to'g'ri tashkil qilishdir.

> [!NOTE]
> **Real-hayot analogiyasi: "Mehmonxona xizmati (In-App, Push, Email, SMS)"**  
> - **In-App Notification (Toast - Mehmonxonadagi ichki radio):** Siz mehmonxona xonangizda o'tiribsiz, ichki radiodan "Kechki ovqat boshlandi" degan e'lon berildi. Bu faqat bino ichida bo'lganingizda (Ilova ochiq turganda) eshitiladi.
> - **Web Push Notification (FCM - Telefoningizga kelgan sms):** Siz mehmonxonadan chiqib shaharga ketdingiz, lekin telefoningizga mehmonxona tizimidan "Xonangiz tozalandi" degan xabar keldi. Buning uchun ilova ochiq bo'lishi shart emas (Service Worker orqali ishlaydi).
> - **Email / SMS (Katta bildirishnoma):** Muhim shartnomalar yoki hisob-kitoblar kelganda, ularni qog'ozda pochtangizga yoki uyingizga yuborish.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi WebSocket yoki SSE yordamida eng sodda In-App (Ilova ichidagi) bildirishnomalarni ekranga chiqarishni o'rganadi. Buni ko'pincha "Toast" deb ataymiz.

### Oddiy Toast Chizish
Foydalanuvchiga xabar kelganda uni ekranning o'ng burchagida ko'rsatamiz. Ammo massivga shunchaki xabarlarni qo'shib boraversak nima bo'ladi?

```vue
<!-- Junior yozgan Toast UI (Vue.js) -->
<script setup>
import { ref } from 'vue'

const notifications = ref([])

// WebSocket dan xabar kelsa
socket.on('new_notification', (data) => {
  notifications.value.push(data); // Xabarni qo'shamiz
})
</script>

<template>
  <div class="toast-container">
    <div v-for="notif in notifications" :key="notif.id" class="toast">
      {{ notif.message }}
    </div>
  </div>
</template>
```
**Muammo:** Foydalanuvchiga bir vaqtning o'zida 20 ta xabar kelsa, ekranni 20 ta Toast to'ldirib yuboradi (UI Overflow). Ularning o'chib ketish (Timeout) mantiqi ham yozilmagan.

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi bildirishnomalarni navbatga (Queue) qo'yishni, maksimal sonni (Max Toasts) chegaralashni va **Web Push Notifications** qanday ishlashini o'rganadi.

### To'g'ri In-App Toast arxitekturasi
Bunda ekranda faqat maksimal belgilangan miqdordagi (masalan, 3 ta) bildirishnomalar ko'rsatiladi. Qolganlari navbatda kutib turadi va oldingilari o'chgandan keyingina chiqadi.

```javascript
// Middle usuli: Queue va Limit orqali boshqarish
const MAX_TOASTS = 3;
const activeToasts = ref([]); // Ekranda ko'rinib turganlar
const toastQueue = [];        // Navbatda kutayotganlar

function showNotification(message) {
  const notif = { id: crypto.randomUUID(), message };
  
  if (activeToasts.value.length < MAX_TOASTS) {
    displayToast(notif);
  } else {
    toastQueue.push(notif); // Joy yo'q bo'lsa navbatga o'tadi
  }
}

function displayToast(notif) {
  activeToasts.value.push(notif);
  
  // 5 soniyadan keyin avtomatik ekrandan tozalash
  setTimeout(() => {
    activeToasts.value = activeToasts.value.filter(t => t.id !== notif.id);
    
    // Agar o'rniga joy bo'shasa va navbatda xabar kutayotgan bo'lsa
    if (toastQueue.length > 0) {
      displayToast(toastQueue.shift());
    }
  }, 5000);
}
```

### Web Push (OS Notifications)
Foydalanuvchi sizning saytingizda emas, Youtube ko'rib o'tirgan paytida ekranning burchagidan bildirishnoma chiqarish uchun Brauzerning **Notification API** si ishlatiladi.

```javascript
// Brauzerdan ruxsat so'rash
async function requestPermission() {
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

// Ilova orqa fonda (yoki boshqa tabda) ekanligini tekshirib Notification chiqarish
if (document.hidden && Notification.permission === 'granted') {
  new Notification("Yangi xabar", {
    body: "Ali sizga yozdi!",
    icon: "/logo.png"
  });
}
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi **Batching** (Guruhlash), **FCM (Firebase Cloud Messaging)** bilan ishlash va barchasini markaziy Serverda (Notification Service) boshqarishni yaxshi biladi.

### FCM (Firebase Cloud Messaging) nima va nima uchun majburiy?
Agar brauzer umuman yopib tashlangan bo'lsa, sizning JavaScript kodingiz (hatto Service Worker ham) serveringiz bilan WebSocket qila olmaydi (sababi OS batareyani tejash uchun o'ldirgan bo'ladi).
Yagona yo'l — **Google/Apple serverlariga (FCM/APNs) so'rov yuborish**. OS doimiy ravishda Google bilan bitta ochiq ulanishga ega bo'ladi va xabar to'g'ridan to'g'ri operatsion tizim (Android/Windows/iOS) orqali ekranga chiqariladi.

**FCM Ishlash Jarayoni:**
1. Kliyent Firebase'dan **Token** oladi va sizning serveringizga jo'natadi.
2. Serveringiz bazaga yozib qo'yadi: `user_123_token: abc...`.
3. Foydalanuvchiga xabar kelganda Server Firebase API siga so'rov tashlaydi: *"Shu tokenga xabar yuborib ber"*.

### Spamming Muammosi va Batching (Guruhlash)
Agar bitta foydalanuvchining rasmi mashhur bo'lib ketib 1 daqiqada 1000 ta "Like" kelsa nima qilasiz? Har biriga Notification yuborsangiz, Serveringiz o'ladi, Google FCM sizni bloklaydi va foydalanuvchi ilovangizni o'chirib yuboradi. Bunga qarshi *Batching* qo'llaniladi.

```javascript
// Server tomonda Batching (Redis orqali)
async function onPostLiked(userId, postId) {
  const batchKey = `likes_batch:${postId}`;
  
  // Redis ro'yxatiga (queue) xabarni qo'shamiz
  await redis.incr(batchKey); 
}

// Orqa fondagi ishchi xizmat (Cron Job) har 5 daqiqada ishlaydi
setInterval(async () => {
  const count = await redis.get(`likes_batch:${postId}`);
  
  if (count > 0) {
    // 1000 ta alohida emas, bitta jamoaviy xabar yuboramiz!
    sendNotification(userId, {
      title: "Yangi layklar",
      body: `${count} ta odam rasmingizga layk bosdi.`
    });
    
    // Yuborilgach Redis ni tozalaymiz
    await redis.del(`likes_batch:${postId}`);
  }
}, 5 * 60 * 1000);
```

### Intervyu Savoli
**"Bildirishnomalarni o'qilganlik (Unread/Read count) statuslarini arxitekturada qanday sinxronizatsiya qilasiz? Brauzerda o'qiganingiz, telefonda ham darhol 'o'qildi' bo'lishi kerak."**
*Javob:*
Birinchidan, **Client-Authoritative (Kliyent o'zi sanaydigan) badge lardan voz kechamiz**. Ya'ni kliyentga yangi xabar kelsa brauzer o'zicha `count++` qilmaydi. Badge dagi raqamni (Qizil nuqta ichidagi sonni) doim server belgilab berishi kerak.  
Ikkinchidan, Server foydalanuvchi "O'qidi" so'rovini berganda, Redis dagi unread count ni tushiradi va u foydalanuvchiga ulangan barcha qurilmalarga (Brauzer, Mobil ilova) WebSocket / Pub-Sub orqali "Badge ni N ga o'zgartir" degan signal tashlaydi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **User Preferences (Foydalanuvchi sozlamalari) bo'lishi shart:** Foydalanuvchiga qaysi bildirishnomalarni qaysi kanallar orqali (masalan, emailni o'chirib, faqat in-app qoldirish) olishni o'zi tanlashiga ruxsat bering. Marketing xabarlarini o'chirish imkoniyati (Opt-out) qonuniy majburiyatdir.
2. **Batching (Guruhlash) qiling:** Agar foydalanuvchiga har 1 daqiqada 10 ta like kelsa, uning telefoniga 10 ta push notification yuborib bezovta qilmang. Ularni bitta qilib jamlang: "Ali va yana 9 kishi rasmingizga layk bosdi" (Notification Batching).
3. **Invalid tokenlarni tozalang:** Firebase (FCM) orqali push notification yuborganda, agar FCM serveri token nofaol (FCM token expired / uninstalled) ekanligini aytsa, o'sha tokenni ma'lumotlar bazangizdan darhol o'chirib tashlang. Bu server resurslari va keraksiz so'rovlarni tejaydi.

---

## Xulosa

Live Notifications bo'yicha yakuniy xulosa:

| Kanal | Latency (Tezlik) | Foydalanuvchi Oflayn Bo'lsa | Asosiy maqsadi |
| --- | --- | --- | --- |
| **In-App Toast** | Millisekundda | Xabarni ko'ra olmaydi | Ilova ochiq turganda tezkor feedback |
| **Web Push** | Real-time (soniyalar) | Brauzer yopiq bo'lsa ham telefon ekraniga chiqadi | Foydalanuvchini ilovaga qaytarish (Retention) |
| **Email** | Sekinroq | Pochtada saqlanib turadi | Katta hajmdagi hisobotlar, hisob-fakturalar |
| **SMS** | Tez (soniyalar) | Telefon yoqilishi bilanoq keladi | Kritik xabarlar (Tranzaksiyalar, 2FA kodlar) |

Keyingi bo'lim: [10-data-visualization/index.md](../10-data-visualization/index.md) - Ma'lumotlarni grafik va diagrammalarda ko'rsatish bo'yicha kirish qismi.
