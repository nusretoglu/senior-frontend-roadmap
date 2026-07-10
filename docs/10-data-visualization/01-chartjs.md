# Chart.js — Oddiy va Kuchli Vizualizatsiya

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturlashda ko'pincha murakkab ko'rinadigan Dashboard'larni qisqa vaqt ichida yasash talab qilinadi. Bunday vaqtlarda murakkab kutubxonalarni (D3.js kabi) o'rganishga vaqt bo'lmaydi. Chart.js — **"Plug and Play"** (O'rnat va Ishlat) darajasidagi eng zo'r vositadir. Siz HTML Canvas yordamida tez, chiroyli va responsiv grafiklar yaratasiz. Intervyularda vizualizatsiya so'ralsa, Chart.js ni bilish sizni darhol qutqaradi.

> [!NOTE]
> **Real-hayot analogiyasi: "Yarim tayyor pitssa"**  
> D3.js ni uyda un, xamir va masalliqlardan o'zingiz noldan pitssa tayyorlash (Juda moslashuvchan, xohlagan shaklingizda qilasiz, lekin ko'p vaqt va tajriba talab qiladi) deb faraz qilsak. Chart.js — bu magazindan olingan muzlatilgan, yarim tayyor pitssa. Pechga qo'yasiz (konfiguratsiyani berasiz) va 15 daqiqada ajoyib natija tayyor!

Chart.js — eng mashhur open-source JavaScript charting kutubxonasi. 2013-yilda yaratilgan bo'lib, oddiy API, yaxshi performance va chiroyli default stillar bilan ajralib turadi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

### Nega aynan Chart.js?
Vizualizatsiya kutubxonalari juda ko'p. Nega boshqasi emas aynan Chart.js ni o'rganishdan boshlash kerak?
- **Oson o'rganish:** Uni atigi 30 daqiqada tushunib, birinchi grafikingizni chizishingiz mumkin.
- **Yengil:** U brauzerda kam xotira yeydi va juda kichik hajmga ega (Taxminan 65KB).
- **Responsive by default:** Mobil qurilmalarga avtomat moslashadi.
- **Tayyor:** Eng ko'p ishlatiladigan (Line, Bar, Pie, Doughnut) grafiklari o'zi bilan tekin va chiroyli ko'rinishda keladi.

### Qanday o'rnatiladi?
Eng oddiy (CDN) orqali ulash:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<canvas id="myChart"></canvas>
```
NPM orqali (Vue/React loyihalarda):
```bash
npm install chart.js
```

### Oddiy Line Chart yasash
```javascript
const ctx = document.getElementById('myChart');

new Chart(ctx, {
  type: 'line', // Graf turi (bar, pie, doughnut)
  data: {
    labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma'], // X o'qi
    datasets: [{
      label: 'Sotuvlar soni',
      data: [12, 19, 3, 5, 2], // Y o'qi qiymatlari
      borderColor: 'blue',
      tension: 0.1 // Chiziqni sal egish
    }]
  }
});
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Canvas haqida tushuncha
Chart.js bu asosan HTML ning `<canvas>` elementi ustiga qurilgan qatlam. `Canvas` bu HTML ning shunday xususiyatiki, u oddiy oq qog'oz (rasm) vazifasini bajaradi va JS orqali piksel darajasida uning ustiga shakllar chiziladi. DOM bilan ishlashga (SVG) qaraganda uning plyusi: minglab ma'lumotlarni qotib qolmasdan tez chizib bera oladi. Minusi: uning ichidagi har bir chiziqcha aslida element emasligi uchun, individual hover yoki click effektlari murakkabroq bo'ladi.

### Tree-shaking (Bundle hajmini tejash)
Loyihada faqat "Line Chart" kerak bo'lsa butun Chart.js ni import qilish bu — isrof. Chart.js 4-versiyadan boshlab kerakli modullarni "ajratib" (Tree-shaking) import qilish imkoniyati berildi:

```javascript
// FAQAT keraklilarini import qilamiz:
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
} from 'chart.js';

// Ularni registratsiya qilamiz
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

// Shundan so'ng u odatdagidek ishlayveradi, lekin JS faylingiz ancha yengil bo'ladi!
```

### Vue 3 da ishlatish (Composables Pattern)
React yoki Vue da to'g'ridan-to'g'ri `new Chart()` qilib ishlatish xavfli, chunki Component o'chib ketganda Canvas obyekti xotirada qolib ketishi (Memory Leak) mumkin. Har doim komponent o'lganda uni o'ldirish kerak:

```vue
<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Chart } from 'chart.js/auto'; // Avtomatik registratsiya (Junior usul)

const chartCanvas = ref(null);
let myChart = null;

onMounted(() => {
  myChart = new Chart(chartCanvas.value, {
    type: 'bar',
    data: { /* data ... */ }
  });
});

onUnmounted(() => {
  if (myChart) {
    myChart.destroy(); // Xotirani tozalash!
  }
});
</script>
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### Performance Optimization (Katta ma'lumotlar bilan ishlash)
Agar sizda 10,000 yoki 100,000 ta "nuqta" lik data kelsa, oddiy Chart.js ham qiynalib qoladi. Performance ni saqlash uchun quyidagilarni qilish kerak:

**1. Animatsiyalarni o'chirish:**
```javascript
options: {
  animation: false, // Animatsiya keraksiz CPU yeydi
}
```

**2. Parsingni o'chirish:**
Agar ma'lumotlar to'ppa-to'g'ri `{x: 1, y: 10}` formatida kelsa, Chart.js uni o'ziga moslash uchun parser yurgizib o'tirmasligini aytish:
```javascript
options: {
  parsing: false,
  normalized: true // Ma'lumotlaringiz doim to'g'ri formatda ekanligini kafolatlaysiz
}
```

**3. Decimation (Siqish):**
Grafikda 100,000 nuqta sig'adigan piksellar o'zi yo'q. Decimation plaginini yozish orqali keraksiz ma'lumotlarni birlashtirib (downsampling) vizual ko'rsatiladi:
```javascript
plugins: {
  decimation: {
    enabled: true,
    algorithm: 'lttb', // Largest Triangle Three Buckets
    samples: 500 // 100,000 data kelsa ham uni 500 tasini ko'rsatadi (qolganini shunday birlashtiradiki ko'zga deyarli sezilmaydi)
  }
}
```

### Custom Plagin Yozish
Ba'zida Dizayner xuddi Pie Chartning o'rtasiga nimadir so'z yozish yoki orqasiga qandaydir Watermark qo'yishni talab qiladi. Chart.js ning default holatida bu narsalar yo'q. Senior developer o'z xohishiga qarab plagin yozishi kerak:

```javascript
// O'rtaga yozuv chiqaruvchi plagin
const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: (chart) => {
    // Canvas obyektiga murojaat qilish
    const { ctx, width, height } = chart;
    
    // Kontekstni saqlaymiz va shriftlarni to'g'rilaymiz
    ctx.save();
    ctx.font = 'bold 24px Inter';
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Piksellar orqali o'rtani topib yozamiz
    ctx.fillText('100K', width / 2, height / 2);
    ctx.restore();
  }
};

Chart.register(centerTextPlugin);
```

### Intervyu Savollari (Qiyin daraja)
**1. Chart.js da React/Vue ishlatganda nega Data o'zgargani bilan chart o'zgarmay qoladi? Buni eng to'g'ri qanday hal qilish kerak?**
*Javob:* Canvas DOM elementi kabi Reactive ishlamaydi. O'zgaruvchi (Masalan Vue ref) o'zgargani bilan Chartning ichidagi obyekt uni sezmaydi. Ko'pchilik buni hal qilish uchun Chartni `destroy()` qilib yangidan Canvas yaratadi. Bu yomon practice. Eng to'g'ri yechim: Data o'zgarganda yangi malumotni `chartInstance.data.datasets[0].data = newData` qilib tiqib, so'ng `chartInstance.update()` metodini chaqirish. Bu orqali chart silliq animatsiya bilan yangilanadi va ortiqcha xotira yeyilmaydi.

**2. SVG (masalan D3.js) va Canvas (Chart.js) farqi nimada? Qachon qaysi birini tanlash kerak?**
*Javob:* 
- **SVG:** Har bir nuqta va chiziq bu - DOM dagi haqiqiy teg (`<path>`, `<circle>`). CSS yoki JS yordamida har bir elementni individual boshqarish, hover effekti qo'shish oson. Kichik ma'lumotlar (1000 tagacha) va juda moslashtirilgan animatsiyalar uchun qulay.
- **Canvas:** Bittagina rasm (`<canvas>`) elementi bo'lib, hamma chiziqlar faqat rasm qatlami ustiga chizib tashlanadi. Minglab, yuz minglab ma'lumotlarni qotib qolmasdan o'qish uchun eng optimal variant (Chunki brauzer millionlab DOM elementlarni xotirada ushlab o'tirmaydi). 

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Tree-shaking ishlating:** Chart.js 3+ versiyadan boshlab kerakli qismlarni (LineController, CategoryScale kabi) alohida import qilishni qo'llab-quvvatlaydi. Butun kutubxonani emas, faqat o'zingizga kerak qismlarni import qilish orqali loyihangiz vaznini (bundle size) kichik tutasiz.
2. **Re-render'larni nazorat qiling:** Vue/React da ma'lumot o'zgarganda `chart.destroy()` qilib yangidan chart yasash sahifani sekinlashtiradi. Faqat data qismini o'zgartirib `.update()` metodini ishlating.
3. **Tooltip'larni formatlang:** Default kelgan tooltip qiymatlarini valyuta belgisi ($) yoki foiz (%) bilan chiroyini ochish (Custom Tooltip Callback) dastur sifatini sezilarli darajada oshiradi.

---

## Xulosa

| Xususiyat | Tavsif / Foydasi |
|-----------|------------------|
| **Asos (Texnologiya)** | `<canvas>` texnologiyasiga tayanadi. DOM elementlar sonini ko'paytirmaydi, natijada performance yaxshi. |
| **Yengillik** | Barcha tayyor vizualizatsiyalar ichida eng oson o'rganiladigan va eng kichik (bundle size) laridan biri. |
| **Turlari** | Line, Bar, Pie, Doughnut, Radar, Polar Area, Bubble, Scatter chartlari o'rnatilgan holatda tayyor keladi. |
| **Kamchiligi** | SVG kabi interaktiv emas, sichqoncha hodisalari ba'zan nozikroq tushishi mumkin (chunki u yagona rasm - canvas). |

Chart.js — boshlang'ich va o'rta darajadagi biznes loyihalar, Admin Dashboard'lar uchun "Oltin standart" (eng optimal) tanlovdir. Murakkab 3D grafikalar yoki 1 milliondan ortiq ma'lumotlar ustida ECharts yoki WebGL kutubxonalariga qarash tavsiya etiladi.
