# Qaysi Vizualizatsiya Kutubxonasini Tanlash Kerak?

## Kirish

To'g'ri kutubxona tanlash loyiha muvaffaqiyati uchun kritik qaror. Noto'g'ri tanlov vaqt yo'qotish, performance muammolar va texnik qarzga olib keladi. Bu bo'limda har bir kutubxonani qachon tanlashni batafsil ko'rib chiqamiz.

## Tezkor Qaror Daraxti

```
Loyiha turi nima?
│
├── Dashboard/Admin Panel
│   ├── Oddiy chartlar yetarli? → Chart.js
│   ├── Ko'p chart turlari kerak? → ECharts
│   └── Enterprise + Support kerak? → Highcharts
│
├── E-commerce/Marketing
│   ├── Byudjet cheklangan? → Chart.js / ECharts
│   └── Premium UI kerak? → Highcharts
│
├── Finance/Trading
│   ├── Candlestick + Volume? → Highcharts Stock / TradingView
│   └── Custom indicators? → D3.js
│
├── Scientific/Research
│   ├── Standard plots? → Plotly.js
│   └── Custom visualization? → D3.js
│
├── Journalism/Storytelling
│   └── → D3.js (Scrollytelling + Custom)
│
├── Geographic/Maps
│   ├── Choropleth? → ECharts / Highcharts Maps
│   └── Custom projection? → D3.js + D3-geo
│
└── Real-time Streaming
    ├── < 10K points/sec? → ECharts
    └── > 10K points/sec? → D3.js + Canvas/WebGL
```

## Batafsil Qiyoslash

### 1. Chart.js

**Ideal holat:**
```
+ Oddiy loyihalar (blog, portfolio, kichik dashboard)
+ Tez prototiplash
+ Yengil bundle size muhim
+ Team tajribasi past
+ Standard chart turlari yetarli
```

**Qiyinchilik:**
```
- Murakkab customization
- Katta ma'lumotlar (> 5K points)
- Exotic chart turlari
- Animation nazorati
```

**Real-world misol:**
```javascript
// Admin panel — haftalik statistika
const weeklyStats = {
  type: 'line',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Visitors',
      data: [1200, 1900, 1500, 2500, 2200, 3000, 2800],
      borderColor: '#3B82F6',
      tension: 0.4,
    }],
  },
};
// 5 daqiqada tayyor
```

**Narx:** Bepul (MIT)

**Bundle:** ~65KB gzipped

---

### 2. ECharts

**Ideal holat:**
```
+ Katta ma'lumotlar (10K-100K points)
+ Ko'p chart turlari kerak (50+)
+ Geographic visualizations
+ Server-side rendering
+ Chinese/Asian market
```

**Qiyinchilik:**
```
- Katta bundle size (~400KB)
- Murakkab API
- Documentation chalkash
```

**Real-world misol:**
```javascript
// E-commerce dashboard — real-time metrics
const realtimeDashboard = {
  tooltip: { trigger: 'axis' },
  dataZoom: [{ type: 'inside' }],
  series: [
    { type: 'line', data: revenueData, smooth: true },
    { type: 'bar', data: ordersData },
    { type: 'scatter', data: sessionData, large: true }, // 50K points
  ],
};
// WebGL acceleration built-in
```

**Narx:** Bepul (Apache 2.0)

**Bundle:** ~400KB full, ~150KB modular

---

### 3. Highcharts

**Ideal holat:**
```
+ Enterprise loyihalar
+ Premium support kerak
+ Accessibility kritik (WCAG 2.1 AA)
+ PDF/PNG export muhim
+ Financial applications
```

**Qiyinchilik:**
```
- Tijorat litsenziya ($520+/yil)
- Bundle o'rtacha (~200KB)
```

**Real-world misol:**
```javascript
// Financial reporting — quarterly breakdown
Highcharts.chart('container', {
  chart: { type: 'column' },
  exporting: { enabled: true }, // Built-in PDF/PNG
  accessibility: { enabled: true }, // WCAG compliant
  series: [{
    name: 'Revenue',
    data: quarterlyData,
  }],
  drilldown: {
    series: monthlyBreakdown, // Click to drill
  },
});
// Enterprise features out-of-box
```

**Narx:**
- Personal: Bepul
- Single Dev: $520/yil
- Team (5): $1,950/yil
- Enterprise: Custom

**Bundle:** ~200KB core

---

### 4. D3.js

**Ideal holat:**
```
+ To'liq custom vizualizatsiya
+ Yangi chart turi yaratish
+ Animation/transitions muhim
+ Journalism/storytelling
+ Team tajribali (senior+)
```

**Qiyinchilik:**
```
- Juda qiyin o'rganish (hafta/oylar)
- Ko'p boilerplate kod
- Built-in charts yo'q
- Accessibility manual
```

**Real-world misol:**
```javascript
// NYTimes-style scrollytelling
const scrollytelling = d3.select('#story')
  .selectAll('.step')
  .data(storyData)
  .join('section')
  .each(function(d, i) {
    const chart = createCustomChart(this, d);

    // Scroll-triggered animation
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        chart.animate();
      }
    });
    observer.observe(this);
  });
// To'liq nazorat, lekin ko'p kod
```

**Narx:** Bepul (BSD)

**Bundle:** ~85KB core

---

## Use-Case Bo'yicha Tanlov

### Admin Dashboard

| Talab | Tanlov |
|-------|--------|
| Oddiy, tez | Chart.js |
| Ko'p widgets | ECharts |
| Enterprise | Highcharts |

```javascript
// Tavsiya: ECharts — moslashuvchan va kuchli
const dashboardConfig = {
  charts: [
    { type: 'line', position: 'top-left' },
    { type: 'pie', position: 'top-right' },
    { type: 'bar', position: 'bottom' },
    { type: 'heatmap', position: 'sidebar' },
  ],
  dataZoom: true,
  brush: true,
  export: true,
};
```

### E-commerce Analytics

| Talab | Tanlov |
|-------|--------|
| Startup (budget) | Chart.js |
| Scale-up | ECharts |
| Enterprise | Highcharts |

```javascript
// Tavsiya: ECharts — katta data + geographic
const ecommerceAnalytics = {
  revenueChart: 'echarts.line', // Trend
  categoryBreakdown: 'echarts.treemap', // Hierarchical
  customerMap: 'echarts.map', // Geographic
  funnelChart: 'echarts.funnel', // Conversion
  cohortAnalysis: 'echarts.heatmap', // Retention
};
```

### Financial Trading Platform

| Talab | Tanlov |
|-------|--------|
| Standard candlestick | Highcharts Stock |
| Custom indicators | D3.js |
| Real-time streaming | LightweightCharts / TradingView |

```javascript
// Tavsiya: Highcharts Stock — professional, export
const tradingChart = Highcharts.stockChart('container', {
  rangeSelector: { selected: 1 },
  series: [{
    type: 'candlestick',
    name: 'AAPL',
    data: ohlcData,
  }, {
    type: 'column',
    name: 'Volume',
    data: volumeData,
    yAxis: 1,
  }],
  navigator: { enabled: true },
  scrollbar: { enabled: true },
});
```

### Scientific Visualization

| Talab | Tanlov |
|-------|--------|
| Standard plots | Plotly.js |
| 3D visualizations | Three.js / Plotly |
| Custom diagrams | D3.js |

```javascript
// Tavsiya: Plotly.js — scientific community standard
Plotly.newPlot('container', [{
  type: 'scatter3d',
  x: xData,
  y: yData,
  z: zData,
  mode: 'markers',
  marker: {
    size: 5,
    color: colorScale,
  },
}], {
  scene: {
    xaxis: { title: 'X Axis' },
    yaxis: { title: 'Y Axis' },
    zaxis: { title: 'Z Axis' },
  },
});
```

### Data Journalism

| Talab | Tanlov |
|-------|--------|
| Scrollytelling | D3.js + Scrollama |
| Interactive maps | D3.js + D3-geo |
| Annotations | D3.js |

```javascript
// Tavsiya: D3.js — to'liq nazorat
// NYTimes, Washington Post, Guardian approach
const storytelling = {
  init: () => {
    const scroller = scrollama();
    scroller
      .setup({ step: '.step', offset: 0.5 })
      .onStepEnter(handleStepEnter)
      .onStepExit(handleStepExit);
  },
  charts: {
    map: d3.geoPath(d3.geoAlbersUsa()),
    line: d3.line().curve(d3.curveMonotoneX),
    annotations: d3.annotation(),
  },
};
```

### Real-time Monitoring

| Talab | Tanlov |
|-------|--------|
| < 1K points/sec | Chart.js streaming |
| 1K-10K points/sec | ECharts + appendData |
| > 10K points/sec | D3.js + Canvas/WebGL |

```javascript
// Tavsiya: ECharts — balans
const realtimeChart = {
  series: [{
    type: 'line',
    data: [],
    showSymbol: false,
  }],
  animation: false, // Real-time uchun
};

// WebSocket stream
socket.onmessage = (event) => {
  const newPoint = JSON.parse(event.data);
  chart.appendData({
    seriesIndex: 0,
    data: [newPoint],
  });
};
```

## Team Tajribasi Bo'yicha Tanlov

### Junior/Mid Team

```
Tavsiya: Chart.js
Sabab:
- Oson API
- Yaxshi documentation
- Ko'p tutorial
- Community katta
```

### Senior Team

```
Tavsiya: ECharts yoki D3.js
Sabab:
- Ko'proq imkoniyatlar
- Performance optimallashtirish
- Custom components
```

### Mixed Team

```
Tavsiya: Highcharts
Sabab:
- Oson boshlash
- Murakkab features mavjud
- Premium support
- Consistent API
```

## Budget Bo'yicha Tanlov

### Nol Budget

```
1. Chart.js — oddiy loyihalar
2. ECharts — murakkab loyihalar
3. D3.js — custom kerak bo'lsa

Hammasini bepul
```

### Kichik Budget ($500-2000/yil)

```
1. Highcharts Single Dev — $520
2. Highcharts + Highstock — $1,040
3. Highcharts + Maps — $1,040

Professional support + enterprise features
```

### Enterprise Budget

```
1. Highcharts Team — $1,950+
2. Amcharts — $450+
3. Tableau (embedded) — $$$

Full support + SLA + compliance
```

## Performance Bo'yicha Tanlov

### Kichik Data (< 1K points)

```
Har qanday kutubxona OK
Tanlov: Chart.js — eng yengil
```

### O'rta Data (1K-10K points)

```
Canvas-based kerak
Tanlov: ECharts yoki Chart.js (decimation)
```

### Katta Data (10K-100K points)

```
WebGL kerak
Tanlov: ECharts (scatterGL) yoki D3.js + Canvas
```

### Massive Data (100K+ points)

```
WebGL majburiy + data aggregation
Tanlov: D3.js + deck.gl yoki Mapbox GL
```

```javascript
// Performance test natijalaridan
const performanceResults = {
  '1K_points': {
    'Chart.js': '60 FPS',
    'ECharts': '60 FPS',
    'D3_SVG': '60 FPS',
    'D3_Canvas': '60 FPS',
  },
  '10K_points': {
    'Chart.js': '30 FPS (decimation)',
    'ECharts': '60 FPS (large mode)',
    'D3_SVG': '15 FPS',
    'D3_Canvas': '60 FPS',
  },
  '100K_points': {
    'Chart.js': 'Not recommended',
    'ECharts_WebGL': '60 FPS',
    'D3_SVG': 'Not possible',
    'D3_Canvas': '45 FPS',
    'D3_WebGL': '60 FPS',
  },
  '1M_points': {
    'ECharts_WebGL': '30 FPS',
    'D3_WebGL': '60 FPS',
    'deck.gl': '60 FPS',
  },
};
```

## Framework Integration

### Vue.js

| Kutubxona | Wrapper | Maintainance |
|-----------|---------|--------------|
| Chart.js | vue-chartjs | Active |
| ECharts | vue-echarts | Active (Official) |
| Highcharts | highcharts-vue | Active (Official) |
| D3.js | Manual | - |

```javascript
// Vue.js uchun tavsiya: vue-echarts
// Rasmiy, reactive, TypeScript support

import { use } from 'echarts/core';
import VChart from 'vue-echarts';

app.component('v-chart', VChart);

// Usage
<v-chart :option="chartOption" autoresize />
```

### React

| Kutubxona | Wrapper | Maintainance |
|-----------|---------|--------------|
| Chart.js | react-chartjs-2 | Active |
| ECharts | echarts-for-react | Active |
| Highcharts | highcharts-react | Active (Official) |
| D3.js | visx / Manual | Active |

```javascript
// React uchun tavsiya: echarts-for-react yoki visx (D3)
import ReactECharts from 'echarts-for-react';

function Chart({ data }) {
  const option = useMemo(() => ({
    series: [{ type: 'line', data }],
  }), [data]);

  return <ReactECharts option={option} />;
}
```

### Angular

| Kutubxona | Wrapper | Maintainance |
|-----------|---------|--------------|
| Chart.js | ng2-charts | Active |
| ECharts | ngx-echarts | Active |
| Highcharts | highcharts-angular | Active (Official) |
| D3.js | Manual | - |

## Kombinatsiya Strategiyasi

Ba'zan bitta kutubxona yetmaydi:

### Chart.js + D3.js

```javascript
// Chart.js — standard charts
// D3.js — custom annotations va interactions

const chart = new Chart(ctx, config);

// D3 orqali annotation
d3.select(chart.canvas.parentNode)
  .append('svg')
  .attr('class', 'annotation-layer')
  .call(addCustomAnnotations);
```

### ECharts + Mapbox

```javascript
// ECharts — business charts
// Mapbox — geographic visualizations

const dashboard = {
  charts: {
    revenue: echarts.init(container1),
    categories: echarts.init(container2),
  },
  map: new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
  }),
};
```

### Highcharts + D3.js

```javascript
// Highcharts — standard business charts
// D3.js — custom visualizations

Highcharts.chart('standard', {
  chart: { type: 'column' },
  series: [{ data: columnData }],
});

// D3 custom chord diagram
const chord = d3.chord()(matrix);
d3.select('#custom')
  .append('svg')
  .selectAll('path')
  .data(chord)
  .join('path')
  .attr('d', d3.ribbon());
```

## Migration Strategiyasi

### Chart.js → ECharts

```javascript
// Chart.js format
const chartJsConfig = {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{
      label: 'Sales',
      data: [10, 20, 30],
    }],
  },
};

// ECharts equivalent
const echartsOption = {
  xAxis: {
    type: 'category',
    data: ['Jan', 'Feb', 'Mar'],
  },
  yAxis: { type: 'value' },
  series: [{
    name: 'Sales',
    type: 'line',
    data: [10, 20, 30],
  }],
};
```

### ECharts → Highcharts

```javascript
// ECharts format
const echartsOption = {
  series: [{
    type: 'bar',
    data: [120, 200, 150],
  }],
};

// Highcharts equivalent
const highchartsConfig = {
  chart: { type: 'column' },
  series: [{
    data: [120, 200, 150],
  }],
};
```

## Yakuniy Tavsiyalar

### Startuplar uchun

```
1-bosqich: Chart.js (MVP)
2-bosqich: ECharts (scale)
3-bosqich: Custom (differentiation)
```

### Enterprise uchun

```
1-tanlov: Highcharts (support + compliance)
2-tanlov: ECharts (budget sababli)
3-tanlov: D3.js (custom kerak)
```

### Freelancer/Consultant uchun

```
Portfolio: Chart.js + ECharts + D3.js basics
Client work: Highcharts (professional)
Custom work: D3.js
```

## Xulosa Jadvali

| Mezon | Chart.js | ECharts | Highcharts | D3.js |
|-------|----------|---------|------------|-------|
| **O'rganish** | Oson | O'rta | O'rta | Qiyin |
| **Flexibility** | O'rta | Yuqori | Yuqori | Cheksiz |
| **Performance** | Yaxshi | Zo'r | Yaxshi | O'zgaruvchan |
| **Bundle** | 65KB | 150-400KB | 200KB | 85KB |
| **A11y** | Asosiy | O'rta | WCAG AA | Manual |
| **Export** | Plugin | Plugin | Built-in | Manual |
| **Support** | Community | Community | Premium | Community |
| **Narx** | Bepul | Bepul | $520+ | Bepul |
| **Vue** | vue-chartjs | vue-echarts | highcharts-vue | Manual |

## Keyingi Qadam

[Performance Tips](./06-performance-tips.md) — qaysi kutubxonani tanlasangiz ham, performance muhim.
