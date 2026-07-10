# Profiling Tools

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturingiz qotib ishlayotganini sezsangiz, ko'r-ko'rona "kodni tezlashtirishga" harakat qilish yomon oqibatlarga olib keladi. Sababi siz xato joyni (masalan UI ni) to'g'irlamoqchi bo'lishingiz mumkin, vaholanki asl muammo serverdan ma'lumot kech kelishida bo'lishi mumkin. **Profiling Tools (Tahlil Asboblari)** orqali kasallikning aniq o'chog'ini topib, faqatgina o'sha qismni jarrohlik usulida davolash kerak.

> [!NOTE]
> **Real-hayot analogiyasi: "Shifokor va Bemor"**  
> - **Profilingsiz (Yomon):** Bemor "qornim og'riyapti" dedi. Shifokor uni rentgen qilib ko'rmasdan barcha a'zolarini (oshqozon, jigar, buyrak) kesib tekshira boshladi. (Taxmin qilib optimizatsiya qilish).
> - **Profiling bilan (Yaxshi):** Shifokor bemorni UZI yoki MRT apparatiga (Profiling Tool) soldi. Apparat faqatgina buyrakda muammo borligini ko'rsatdi (Bottleneck). Shifokor faqat buyrakni davoladi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchilar uchun sayt qotayotganligini aniqlashning eng oson usuli **Google Lighthouse** dan foydalanishdir.

### Google Lighthouse qanday ishlaydi?
Chrome brauzerida F12 tugmasini bossangiz, `Lighthouse` bo'limi bor. "Analyze page load" tugmasini bossangiz, brauzer saytingizni simulyatsiya qilib (go'yoki oddiy foydalanuvchi kirgandek) tekshiradi va sizga 100 ballik tizimda baho beradi.

### Asosiy Metrikalar (Vebning hayotiy ko'rsatkichlari)
Siz yodlashingiz kerak bo'lgan 3 ta asosiy so'z:
| Metrika qisqartmasi | To'liq nomi | Yaxshi ko'rsatkich | Ma'nosi |
| --- | --- | --- | --- |
| **LCP** | Largest Contentful Paint | **< 2.5s** | Ekranda eng katta rasm yoki matn qachon to'liq chiqdi? (Sayt tezligini bildiradi). |
| **FID (INP)** | First Input Delay | **< 100ms** | Tugmani bosganingizda brauzer qanchalik tez reaksiya berdi? (Qotib qolmadimi?). |
| **CLS** | Cumulative Layout Shift | **< 0.1** | Sayt yuklanayotganda tugma yoki matnlar pastga qarab "sakrab" ketmadimi? (Rasm keyin yuklanib joy surilishi). |

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi kod darajasida (kodning qaysi qatori sekin ishlashini) aniqlash uchun **Chrome DevTools Performance Panel** dan foydalanadi va brauzerni Sekin tarmoq rejimiga o'tkazishni (Throttling) biladi.

### Performance Panel (O'lchash)
F12 dagi `Performance` bo'limi orqali yozib olish (Record) ni bosib, saytda biror ish qilasiz. Stop qilganingizda sizga barcha funksiyalar yozilgan karta (Flame chart) chiqadi. 

```javascript
// Kod ichida o'lchash uchun o'rnatilgan API:
function expensiveOperation() {
  // 1. Sekundomerni yoqish
  performance.mark('expensive-start');

  // Qandaydir qiyin kod (masalan 1 millionta tsikl)
  for(let i=0; i<1000000; i++) {}

  // 2. Sekundomerni to'xtatish
  performance.mark('expensive-end');
  
  // 3. Oradagi farqni hisoblash
  performance.measure('Natija:', 'expensive-start', 'expensive-end');
}
```

### Tarmoq va CPU ni susaytirish (Throttling)
Sizning MacBook kompyuteringiz juda kuchli, lekin foydalanuvchida 5 yillik Android bo'lishi mumkin. Saytingiz aslida qanday ishlashini ko'rish uchun F12 (Network) bo'limida internetni "Fast 3G" ga, Performance bo'limida CPU ni "4x slowdown" ga qilib tekshirish kerak.

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi **Memory Leaks** (Xotira oqib ketishi) ni `Memory Panel` orqali aniqlaydi, **Long Tasks** (Uzoq vaqt oluvchi vazifalar) ni optimizatsiya qiladi hamda Live (Jonli) foydalanuvchilardan Real User Monitoring (RUM) orqali metrikalar yig'adi.

### Xotira tahlili (Memory Leaks)
Xotira oqishi — sayt ishlatilgan sari RAM xotirani band qilib boraverishi va oxiri qotib qolishi. Buni F12 -> Memory tab -> Heap Snapshot orqali topamiz.

```javascript
// Xotira oqib ketishiga tipik misol:
let detechadNodes = [];

function memoryLeak() {
  // DOM elementni yaratamiz lekin Document'ga qo'shmaymiz
  let div = document.createElement('div');
  // Obyektni global massivda saqlab qolamiz. 
  // Natijada Garbage Collector buni tozalay olmaydi!
  detechadNodes.push(div); 
}
```

### Real User Monitoring (RUM)
Lighthouse bu faqat laboratoriya sharoitidagi test (Lab data). Haqiqiy odamlar saytingizdan qanday foydalanayotganini tahlil qilish uchun RUM tizimlari (masalan web-vitals) dan foydalaniladi.

```javascript
// main.js - Haqiqiy mijozlarning saytga ulanish sifatini o'lchash
import { onCLS, onLCP, onINP } from 'web-vitals';

function sendToAnalytics(metric) {
  // Olingan ma'lumotni Google Analytics yoki 
  // O'zingizning RUM serveringizga yuboring
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value, // LCP yoki CLS qiymati
    rating: metric.rating // 'good', 'poor'
  });

  navigator.sendBeacon('/api/analytics', body);
}

// Barcha jonli mijozlarda avtomatik o'lchaydi
onLCP(sendToAnalytics);
onCLS(sendToAnalytics);
onINP(sendToAnalytics);
```

### Intervyu Savoli
**"Cumulative Layout Shift (CLS) nima, u qanday kelib chiqadi va qanday hal qilinadi?"**
*Javob:*
CLS (Tartibning siljishi) — sahifa yuklanayotgan paytda yoki foydalanuvchi biror narsa o'qiyotgan paytda to'satdan rasm yoki reklama blokining yuklanishi oqibatida, qolgan elementlar pastga qarab sakrab tushishiga aytiladi. Bu foydalanuvchida boshqa tugmani xato bosib yuborish kabi yomon UX ni keltirib chiqaradi.
Buning **asosiy sabablari:**
1. Rasmlarda `width` va `height` atributlarining berilmaganligi (Brauzer rasm razmerini u yuklanmaguncha bilmaydi).
2. Dastlab shriftning o'zgarib qolishi (FOUT).
**Yechimi:** Har bir rasm, reklama yoki iframe taglariga aniq razmerlarni (`width="800" height="400"`) yoki CSS orqali `aspect-ratio` berish orqali oldindan bo'sh ramka tayyorlab qo'yish.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Incognito (Yashirin) rejimda ishlating:** Har qanday profilerni yoki Lighthouseni doimo Yashirin (Incognito) Chrome oynasida ishlating. Aks holda brauzeringizdagi Adblock, Grammarly kabi extensionlar o'zgarishlar kiritib, "saytingizni sekin deb o'ylab" sizni aldaydi.
2. **Sekin tarmoqni simulyatsiya qiling (Throttling):** Sayt sizning kuchli MacBook'ingizda moshindek ishlaydi. Lekin haqiqiy mijoz 3G da kirayotgan bo'lishi mumkin. Chrome DevTools da `Network -> Fast 3G` yoki `CPU -> 4x slowdown` qilib tahlil qilish eng to'g'ri o'lchovdir.
3. **CI/CD da byudjet o'rnating:** Jamoangizdagi dasturchilar sayt hajmini oshirib yubormasligi uchun Github Actions da Performance Budget o'rnating. Ya'ni kod LCP 2.5 sekunddan sekinlashsa avtomatik ravishda PR qizil bo'lib, deploy bo'lmay qolishi kerak.

---

## Xulosa

Performance profiling strategiyasi:

1. **Measure First** - O'lchamay turib tuzatmang. Avval aniq sonlarni (LCP, CLS) oling.
2. **Use Right Tools** - Chrome DevTools (Dasturchi tahlili uchun), Lighthouse (Audit uchun), Web Vitals (Real user kuzatuvi uchun).
3. **Focus on Real Users** - Laboratoriyada emas, RUM (Real User Monitoring) orqali jonli foydalanuvchilar qanday tezlikda ishlatyotganiga e'tibor qarating.

| Asbob (Tool) | Asosiy maqsadi | Qachon ishlatiladi? |
|------|---------|-------------|
| **Chrome DevTools** | Chuqur tahlil (Flame charts) | Har kuni dasturlash vaqtida qotish sababini izlashda |
| **Lighthouse** | Metrikalar va takliflar | Kodni Production'ga ulashdan oldin umumiy tekshiruvda |
| **web-vitals (RUM)** | Haqiqiy mijozlardan ma'lumot yig'ish | Dastur Live bo'lgandan so'ng doimiy ravishda |
