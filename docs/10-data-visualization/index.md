# Data Visualization - Ma'lumotlarni Vizualizatsiya Qilish

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturlashda ko'pincha "Ma'lumotlar juda ko'p bo'lsa, ularni ko'rsatishdan foyda yo'q" deyishadi, sababi inson miyasi quruq raqamlarni qabul qilishga qiynaladi. Katta Dashboard'lar yasayotganingizda, ma'lumotlarni to'g'ri grafik (chart) larga ajrata olish biznes uchun juda katta qiymat (value) olib keladi. Qaysi joyda Pie Chart, qaysi joyda Bar Chart kerakligini bilmaslik mahsulotingizni tushunarsiz qilib qo'yadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Buxgalteriya daftari vs Spidometr"**  
> Agar mashinaning tezligini bilish uchun mashina kompyuteri har soniyada sizga `v = 110.5 km/h` deb qog'ozda yozib berganda, siz tezlikka baho berishga ulgurmasdingiz. Buning o'rniga sizga oddiy chiziqli Spidometr (Data Visualization) berilgan. Siz strelkaning qizil zonaga o'tganini bir marta ko'rish bilanoq sekinlashish kerakligini tushunasiz. Vizualizatsiya – quruq axborotni oson hazm bo'ladigan xulosaga aylantirishdir.

Ma'lumotlarni vizualizatsiya qilish — murakkab ma'lumotlarni grafik, diagramma va boshqa vizual elementlar orqali tushunarli ko'rinishga keltirish san'ati va fanidir. Zamonaviy web ilovalarida bu juda muhim bo'lib, foydalanuvchilar katta hajmdagi ma'lumotlarni bir qarashda tushunishlari kerak.

---

## 🟢 Junior (Asoslar va Tushunchalar)

### Asosiy Chart Turlari
Qaysi paytda qanday grafik ishlatilishini bilish muhim:

| Data Turi | Chart Nomi | Qachon ishlatiladi? |
|-----------|------------|---------------------|
| **Kategorik** | Bar Chart / Column Chart | Turli kategoriyalarni bir-biri bilan solishtirish uchun. (Masalan, qaysi maxsulot ko'p sotilgani). |
| **Kategorik** | Pie / Donut Chart | Umumiy butunning (100%) qismlarini ko'rsatish uchun (5 dan kam kategoriya bo'lganda). |
| **Vaqt (Time)** | Line Chart / Area Chart | Vaqt o'tishi bilan o'sish/tushish tendensiyalarini (trend) ko'rsatish. (Masalan, 1 yillik daromad o'zgarishi). |

### Bo'lim Tuzilishi

| Fayl | Mavzu | Qiyinlik |
|------|-------|----------|
| [01-chartjs.md](./01-chartjs.md) | Chart.js — oddiy va yengil kutubxona | Boshlang'ich |
| [02-echarts.md](./02-echarts.md) | ECharts — Apache'ning kuchli vizualizatsiya vositasi | O'rta |
| [03-highcharts.md](./03-highcharts.md) | Highcharts — enterprise-darajadagi yechim | Yuqori |
| [04-d3js.md](./04-d3js.md) | D3.js — low-level vizualizatsiya kutubxonasi | Ekspert |

---

## 🟡 Middle (Amaliyot va Detallar)

### Kutubxonalar Qiyosiy Tahlili
Frontend loyihada to'g'ri vizualizatsiya kutubxonasini tanlash katta ahamiyatga ega. Loyihaning hajmiga va qiyinchiligiga qarab tanlanadi:

| Xususiyat | Chart.js | ECharts | Highcharts | D3.js |
|-----------|----------|---------|------------|-------|
| **O'rganish** | Oson (1 soat) | O'rta | O'rta | Juda qiyin (Oyliklar) |
| **Moslashuvchanlik**| Cheklangan | Yaxshi | Yuqori | Cheksiz |
| **Performance**| O'rta (10k gacha data) | Juda Yaxshi (100k+ data) | Yaxshi | Zo'r, lekin qo'lda optimizatsiya kerak |
| **Pullikmi?** | Bepul (MIT) | Bepul (Apache) | Tijorat loyihalarga pullik | Bepul (BSD) |

### Ranglar bilan ishlash
Dashboard chizishda ranglar katta ahamiyatga ega. Ishlatish mumkin bo'lgan semantik ranglar:
```javascript
const colors = {
  positive: '#10B981',  // Yashil — o'sish, foyda, muvaffaqiyat
  negative: '#EF4444',  // Qizil — tushish, zarar, xato
  neutral: '#6B7280',   // Kulrang — orqa fon, qo'shimcha ma'lumot
  primary: '#3B82F6',   // Ko'k — asosiy e'tibor qaratiladigan ma'lumot
};
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### Data-Ink Ratio (Tufte Qoidasi)
Senior darajali dizayn va vizualizatsiyada bitta oltin qoida bor: "Data-Ink Ratio" (Ma'lumot-Siyoh nisbati).
Bu shuni anglatadiki, grafikdagi piksellarning (siyohning) katta qismi PURE MA'LUMOT ko'rsatishga ketishi kerak, bezaklarga emas. Buni to'g'rilash uchun:
- 3D effektlarni olib tashlang (Grafikni tushunishni qiyinlashtiradi).
- Keraksiz tuman/gradient effektlarini kamaytiring.
- Katta, ko'zga tashlanadigan Ramkalar (Border) va orqa fon grid (Kataklar) ni och kulrangga o'tkazing yoki olib tashlang.
- Legend va o'q yozuvlarini imkon qadar qisqa (1M, 10K kabi) qiling.

### Intervyu Savollari (Qiyin daraja)
**1. SVG va Canvas (yoki WebGL) vizualizatsiya kutubxonalari orasidagi farq nima va qaysi holatda qaysi birini tanlash kerak?**
*Javob:*
- **SVG (D3.js, Highcharts kabi):** DOM ga har bir nuqta va chiziq alohida tag sifatida tushadi. Bu CSS orqali ularga osongina hover effekti qo'shish va aniq animatsiyalar berish imkonini yaratadi. Lekin ma'lumotlar soni 5,000-10,000 tadan oshib ketsa, DOM o'ta og'irlashib ketadi va brauzer qotishni boshlaydi (Performance bottleneck).
- **Canvas / WebGL (ECharts, Chart.js):** DOM ga faqat bitta `<canvas>` tegi tushadi va hamma grafik uning ichida oddiy rasm piksellari sifatida chizib tashlanadi. Browser o'n minglab ma'lumotlarni rendering qilishda qotmaydi (Performance a'lo). Biroq individual elementlarga maxsus stil yoki event (click) yozish ancha murakkab tortadi.
Demak, interaktivlik muhim va data kam bo'lsa - SVG, data o'ta katta bo'lsa - Canvas.

**2. Accessibility (A11y) nuqtai nazaridan Grafik chizishda qanday muammolar bor va yechimlari qanday?**
*Javob:* 
- **Muammo 1:** Ko'rishida nuqsoni bor (Colorblind) foydalanuvchilar qizil va yashil rangni bir xil ko'radi.
*Yechim:* Hech qachon farqlash uchun faqatgina rangga tayanmang. Rang bilan birga shakllardan (Masalan chiziqlarni uzuq-yuluq `border-dash` qilish, yoki grafiklarga pattern/texture qo'shish) foydalaning.
- **Muammo 2:** Screen Reader lar Canvas ichidagi rasmlarni o'qiy olmaydi.
*Yechim:* Canvas larning yoniga alohida HTML table (`<table class="sr-only">`) joylab, chart ma'lumotlarini o'sha yerda takrorlang yoki Canvas larga to'g'ri `aria-label` hamda `role="img"` bering.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Formatlashni Yodda Tuting:** Hech qachon uzun raqamlarni (masalan `1530400`) shundayligicha qoldirmang. Yoki uni probel bilan bo'ling (`1 530 400`), yoki qisqartiring (`1.5M`). Grafikni o'qilishi osonlashadi.
2. **Pie Chart qoidasi:** Pie Chartlarning ichiga 5-6 tadan ortiq kategoriyani aslo tiqmang, qolgan kichiklarni "Boshqalar" degan bitta guruhga birlashtirib qo'ying, aks holda u o'qib bo'lmas daxshatga aylanadi.
3. **Kontekst bering:** Har bir grafikning tepasida u qanday vaqt oralig'ida olingani, Y o'qidagi sonlar nima ekani (Dollardami, donadami, foizdami) aniq ko'rinib turishi kerak.

---

## Xulosa

| Vizualizatsiya Qoidasi | Yaxshi yondashuv | Yomon yondashuv |
|------------------------|------------------|-----------------|
| **Solishtirish** | Bar Chart (Ustunli) ishlating | Pie chart da solishtirmang |
| **Ranglar** | Aniq semantik (masalan Yashil va Qizil) ranglar | Bitta grafikda 10 xil aralash rang ishlash |
| **Trend** | Line Chart ishlating va chiziqni biroz qalinlashtiring | Nuqtali diagramma chizish |

**Keyingi Qadamlar:** Boshlanishiga [Chart.js](./01-chartjs.md) eng optimal va sodda yechim hisoblanadi. Undan so'ng [ECharts](./02-echarts.md) orqali og'ir ma'lumotlar bilan ishlashni o'rganishingiz tavsiya etiladi.
