# Data Visualization - Ma'lumotlarni Vizualizatsiya Qilish

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturlashda ko'pincha "Ma'lumotlar juda ko'p bo'lsa, ularni ko'rsatishdan foyda yo'q" deyishadi, sababi inson miyasi quruq raqamlarni qabul qilishga qiynaladi. Katta Dashboard'lar yasayotganingizda, ma'lumotlarni to'g'ri grafik (chart) larga ajrata olish biznes uchun juda katta qiymat (value) olib keladi. Qaysi joyda Pie Chart, qaysi joyda Bar Chart kerakligini bilmaslik mahsulotingizni tushunarsiz qilib qo'yadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Buxgalteriya daftari vs Spidometr"**  
> Agar mashinaning tezligini bilish uchun mashina kompyuteri har soniyada sizga `v = 110.5 km/h` deb qog'ozda yozib berganda, siz tezlikka baho berishga ulgurmasdingiz. Buning o'rniga sizga oddiy chiziqli Spidometr (Data Visualization) berilgan. Siz strelkaning qizil zonaga o'tganini bir marta ko'rish bilanoq sekinlashish kerakligini tushunasiz. Vizualizatsiya – quruq axborotni oson hazm bo'ladigan xulosaga aylantirishdir.

Ma'lumotlarni vizualizatsiya qilish — murakkab ma'lumotlarni grafik, diagramma va boshqa vizual elementlar orqali tushunarli ko'rinishga keltirish san'ati va fanidir. Zamonaviy web ilovalarida bu juda muhim bo'lib, foydalanuvchilar katta hajmdagi ma'lumotlarni bir qarashda tushunishlari kerak.
## Nega Data Visualization Muhim?

### 1. Kognitiv Yuklama Kamaytirish
Odam miyasi vizual ma'lumotni matndan 60,000 marta tezroq qayta ishlaydi. 1000 qatorli Excel jadvalni ko'rish o'rniga, bitta line chart butun tendensiyani ko'rsatadi.

### 2. Pattern Recognition
Vizualizatsiya yashirin patternlarni ochib beradi:
- Anomaliyalar (outliers)
- Trendlar va tsikllar
- Korrelyatsiyalar
- Klasterlar

### 3. Decision Making
Biznes qarorlarini qabul qilishda vizualizatsiya kritik rol o'ynaydi:
- Real-time dashboardlar
- KPI monitoring
- A/B test natijalari
- Financial reporting

## Bo'lim Tuzilishi

| Fayl | Mavzu | Qiyinlik |
|------|-------|----------|
| [01-chartjs.md](./01-chartjs.md) | Chart.js — oddiy va yengil kutubxona | Boshlang'ich |
| [02-echarts.md](./02-echarts.md) | ECharts — Apache'ning kuchli vizualizatsiya vositasi | O'rta |
| [03-highcharts.md](./03-highcharts.md) | Highcharts — enterprise-darajadagi yechim | Yuqori |
| [04-d3js.md](./04-d3js.md) | D3.js — low-level vizualizatsiya kutubxonasi | Ekspert |
| [05-choosing-library.md](./05-choosing-library.md) | Qaysi kutubxonani tanlash kerak? | Barcha |
| [06-performance-tips.md](./06-performance-tips.md) | Performance optimization strategiyalari | Yuqori |

## Asosiy Chart Turlari

| Data Turi | Chart Nomi | Qachon ishlatiladi? |
|-----------|------------|---------------------|
| **Kategorik** | Bar Chart / Column Chart | Turli kategoriyalarni bir-biri bilan solishtirish uchun. |
| **Kategorik** | Pie / Donut Chart | Umumiy butunning (100%) qismlarini ko'rsatish uchun (5 dan kam kategoriya). |
| **Vaqt (Time)** | Line Chart / Area Chart | Vaqt o'tishi bilan o'sish/tushish tendensiyalarini (trend) ko'rsatish. |
| **Vaqt (Time)** | Candlestick | Moliyaviy ma'lumotlar (Birja, Kriptovalyuta - OHLC). |
| **Taqsimlanish**| Histogram / Box Plot | Ma'lumotlarning qay darajada tarqalganini (min, max, median) baholash. |
| **Korrelyatsiya**| Scatter Plot / Bubble | Ikki (yoki uch) o'zgaruvchi bir-biriga qanday ta'sir qilishini ko'rish. |
| **Ierarxik** | Treemap / Sunburst | Katta kategoriyalar ichidagi kichik ulushlarni ierarxik tasvirlash. |
| **Geografik** | Choropleth / Flow Map | Hududlar va lokatsiyalardagi aktivlikni (masalan: qaysi davlatda ko'p xarid bo'ldi) rang orqali ifodalash. |

## Kutubxonalar Qiyosiy Tahlili

| Xususiyat | Chart.js | ECharts | Highcharts | D3.js |
|-----------|----------|---------|------------|-------|
| **Bundle Size** | ~65KB | ~400KB | ~200KB | ~85KB |
| **Learning Curve** | Oson | O'rta | O'rta | Qiyin |
| **Customization** | O'rta | Yuqori | Yuqori | Cheksiz |
| **Performance** | Yaxshi | Zo'r | Yaxshi | O'zgaruvchan |
| **Animation** | Ha | Ha | Ha | Manual |
| **Responsive** | Ha | Ha | Ha | Manual |
| **Accessibility** | Asosiy | O'rta | Yaxshi | Manual |
| **Litsenziya** | MIT | Apache 2.0 | Tijorat | BSD |
| **Vue Support** | vue-chartjs | vue-echarts | highcharts-vue | - |

## Vizualizatsiya Tamoyillari

### 1. Data-Ink Ratio (Edward Tufte)
```
Data-Ink Ratio = Ma'lumot ko'rsatadigan ink / Jami ink

Maqsad: Keraksiz dekoratsiyalarni olib tashlash
- 3D effectlar → 2D
- Gradient to'ldirishlar → Solid ranglar
- Shadow va border → Minimal
```

### 2. Gestalt Principles
```
Proximity   — Yaqin elementlar guruhlanadi
Similarity  — O'xshash elementlar bog'liq ko'rinadi
Continuity  — Uzluksiz chiziqlar kuzatiladi
Closure     — To'liqlanmagan shakllar to'ldiriladi
```

### 3. Color Theory
```javascript
// Semantik ranglar
const colors = {
  positive: '#10B981',  // Yashil — o'sish, muvaffaqiyat
  negative: '#EF4444',  // Qizil — tushish, xato
  neutral: '#6B7280',   // Kulrang — neytral
  primary: '#3B82F6',   // Ko'k — asosiy ma'lumot
  warning: '#F59E0B',   // Sariq — ogohlantirish
};

// Colorblind-safe palitra
const colorblindSafe = [
  '#0077BB', // ko'k
  '#33BBEE', // cyan
  '#009988', // teal
  '#EE7733', // to'q sariq
  '#CC3311', // qizil
  '#EE3377', // magenta
];
```

### 4. Typography va Labeling
```javascript
// Best practices
const labelingRules = {
  // Axis labels
  axisLabel: {
    fontSize: 12,
    fontWeight: 500,
    rotate: 0, // Gorizontal yaxshiroq
    maxLength: 15, // Qisqartirish
  },

  // Data labels
  dataLabel: {
    show: true, // Faqat zarur bo'lganda
    position: 'top',
    formatter: (value) => {
      if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
      if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
      return value;
    },
  },

  // Title
  title: {
    fontSize: 16,
    fontWeight: 600,
    subtext: 'Data source va vaqt oralig'ini ko\'rsating',
  },
};
```

## Accessibility (A11y)

### WCAG 2.1 Talablari

```javascript
// 1. Color contrast — minimum 4.5:1
const checkContrast = (foreground, background) => {
  // WCAG contrast ratio hisoblash
  const luminance = (color) => {
    const rgb = hexToRgb(color);
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = luminance(foreground);
  const l2 = luminance(background);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

// 2. Pattern va texture — rangga qo'shimcha
const accessibleDataset = {
  borderDash: [5, 5],      // Chiziqli pattern
  pointStyle: 'triangle',  // Shakl farqi
  fill: 'pattern',         // Hatch pattern
};

// 3. Screen reader uchun
const chartConfig = {
  plugins: {
    title: {
      display: true,
      text: 'Oylik Savdo Statistikasi 2024', // Aniq sarlavha
    },
  },
  // ARIA attributes
  options: {
    onHover: (event, elements) => {
      // Tooltip matnini screen reader uchun expose qilish
    },
  },
};
```

### Keyboard Navigation
```javascript
// Chart.js keyboard plugin
const keyboardNavigation = {
  onKeyDown: (event, chart) => {
    const { key } = event;
    const activeElements = chart.getActiveElements();

    if (key === 'ArrowRight') {
      // Keyingi data point'ga o'tish
    } else if (key === 'ArrowLeft') {
      // Oldingi data point'ga o'tish
    } else if (key === 'Enter') {
      // Detail ko'rsatish
    }
  },
};
```

## Real-World Misollar

### 1. E-Commerce Dashboard
```
- Revenue trend (Line Chart)
- Top products (Horizontal Bar)
- Category breakdown (Donut)
- Geographic sales (Choropleth Map)
- Conversion funnel (Funnel Chart)
```

### 2. Financial Trading Platform
```
- Price history (Candlestick)
- Volume (Bar Chart)
- Technical indicators (Multiple Line)
- Portfolio allocation (Treemap)
- Risk heatmap (Heatmap)
```

### 3. Healthcare Analytics
```
- Patient trends (Area Chart)
- Department load (Stacked Bar)
- Vital signs (Real-time Line)
- Disease correlation (Scatter)
- Resource utilization (Gauge)
```

### 4. Social Media Analytics
```
- Engagement over time (Line)
- Content performance (Bubble)
- Audience demographics (Pie)
- Sentiment analysis (Diverging Bar)
- Hashtag network (Force-directed Graph)
```

## O'quv Yo'li (Learning Path)

```
1. Boshlang'ich (2-3 hafta)
   └── Chart.js basics
   └── Asosiy chart turlari
   └── Responsive design
   └── Vue integration

2. O'rta (3-4 hafta)
   └── ECharts exploration
   └── Interactive features
   └── Custom tooltips
   └── Data transformation

3. Yuqori (4-6 hafta)
   └── D3.js fundamentals
   └── Custom visualizations
   └── Animation va transitions
   └── Performance optimization

4. Ekspert (davomiy)
   └── Complex dashboards
   └── Real-time streaming
   └── Canvas/WebGL rendering
   └── Custom chart types
```

## Keyingi Qadamlar

1. **[Chart.js](./01-chartjs.md)** bilan boshlang — eng oson kirish nuqtasi
2. Keyin **[ECharts](./02-echarts.md)** — ko'proq imkoniyatlar
3. Enterprise loyihalar uchun **[Highcharts](./03-highcharts.md)**
4. Custom vizualizatsiya uchun **[D3.js](./04-d3js.md)**
5. Tanlash qiyin bo'lsa **[Choosing Library](./05-choosing-library.md)**
6. Har doim **[Performance Tips](./06-performance-tips.md)** ni unutmang

## Foydali Resurslar

- [Observable](https://observablehq.com/) — D3.js misollari
- [Data Viz Project](https://datavizproject.com/) — Chart type selection
- [Chartopedia](https://www.anychart.com/chartopedia/) — Chart encyclopedia
- [ColorBrewer](https://colorbrewer2.org/) — Xarita va chart ranglari
- [Viz Palette](https://projects.susielu.com/viz-palette) — Accessibility check
