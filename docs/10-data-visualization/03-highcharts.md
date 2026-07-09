# Highcharts — Enterprise-Grade Vizualizatsiya

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Garchi u ochiq manbali (Open Source) va tekin bo'lmasa-da, Highcharts dunyodagi Fortune 500 kompaniyalari (gigantlar) tomonidan eng ko'p ishlatiladigan charting kutubxonasidir. Katta korporativ (Enterprise) ilovalarda muammolar chiqqanda ularni zudlik bilan hal qilib beradigan **Kafolatlangan Pullik Support** va barcha davlat standartlariga (A11y - Nogironlar uchun qulaylik) mos kelishi orqali u qadrlanadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Besh yulduzli Mehmonxona vs Kvartira ijarasi"**  
> Chart.js (tekin) xuddi ijaraga olingan kvartiradek – arzon, ishni bitiradi, lekin hammasini o'zingiz tozalab, idishlarni yuvishingiz kerak, buzilsa o'zingiz tuzatasiz. Highcharts esa – Besh Yulduzli Mehmonxona. Siz uning litsenziyasi uchun pul to'laysiz, lekin sizga VIP xizmat, mukammal xavfsizlik va muammo tug'ilganda 24/7 yordam kafolatlanadi.

Highcharts — 2009-yildan beri bozorda bo'lgan, eng ishonchli va professional charting kutubxonalaridan biri. Fortune 500 kompaniyalarining 80%+ foizi ishlatadi. SVG-based rendering, zo'r accessibility va premium support bilan ajralib turadi.
## Nega Highcharts?

### Afzalliklari
```
+ Eng yaxshi documentation
+ Premium support mavjud
+ A11y (Accessibility) — WCAG 2.1 AA
+ Exporting (PDF, PNG, SVG, CSV)
+ Server-side rendering
+ Mobile-optimized
+ 20+ yillik tajriba
+ Stocks, Maps, Gantt modullar
```

### Kamchiliklari
```
- Tijorat litsenziya (non-commercial bepul)
- O'rta bundle size (~200KB)
- Murakkab customization
- D3 ga nisbatan kam flexibility
```

## Litsenziya Modeli

```
Personal/Non-commercial: BEPUL
Single Developer: $520/yil
Team (5 dev): $1,950/yil
Enterprise: Custom pricing

Qo'shimcha modullar:
- Highstock (financial): +$520
- Highmaps (geographic): +$520
- Highcharts Gantt: +$520
```

## O'rnatish va Sozlash

### NPM orqali
```bash
npm install highcharts
# Vue wrapper
npm install highcharts-vue
```

### ES Modules
```javascript
// Core
import Highcharts from 'highcharts';

// Qo'shimcha modullar
import HighchartsMore from 'highcharts/highcharts-more';
import Accessibility from 'highcharts/modules/accessibility';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import Drilldown from 'highcharts/modules/drilldown';

// Modullarni init
HighchartsMore(Highcharts);
Accessibility(Highcharts);
Exporting(Highcharts);
ExportData(Highcharts);
Drilldown(Highcharts);
```

### CDN orqali
```html
<script src="https://code.highcharts.com/highcharts.js"></script>
<script src="https://code.highcharts.com/modules/accessibility.js"></script>
<script src="https://code.highcharts.com/modules/exporting.js"></script>
```

## Asosiy Tushunchalar

### 1. Chart Configuration

```javascript
const chart = Highcharts.chart('container', {
  // Chart turi va umumiy sozlamalar
  chart: {
    type: 'line',
    height: 400,
    backgroundColor: '#ffffff',
    style: {
      fontFamily: 'Inter, sans-serif',
    },
    zooming: {
      type: 'xy',
    },
  },

  // Sarlavha
  title: {
    text: 'Oylik Savdo Statistikasi',
    align: 'left',
    style: {
      fontSize: '18px',
      fontWeight: '600',
    },
  },

  subtitle: {
    text: '2024-yil ma\'lumotlari',
    align: 'left',
  },

  // Credits (Highcharts logo)
  credits: {
    enabled: false, // Production'da o'chirish
  },

  // Legend
  legend: {
    layout: 'horizontal',
    align: 'center',
    verticalAlign: 'bottom',
    itemStyle: {
      fontWeight: 'normal',
    },
  },

  // Tooltip
  tooltip: {
    shared: true,
    crosshairs: true,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadow: true,
    formatter: function() {
      let html = `<b>${this.x}</b><br/>`;
      this.points.forEach(point => {
        html += `<span style="color:${point.color}">\u25CF</span> `;
        html += `${point.series.name}: <b>$${point.y.toLocaleString()}</b><br/>`;
      });
      return html;
    },
  },

  // X o'qi
  xAxis: {
    categories: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun'],
    crosshair: true,
    labels: {
      style: {
        color: '#6B7280',
      },
    },
    lineColor: '#E5E7EB',
    tickColor: '#E5E7EB',
  },

  // Y o'qi
  yAxis: {
    title: {
      text: 'Savdo ($)',
      style: {
        color: '#6B7280',
      },
    },
    labels: {
      formatter: function() {
        return '$' + this.value.toLocaleString();
      },
      style: {
        color: '#6B7280',
      },
    },
    gridLineColor: '#F3F4F6',
  },

  // Ranglar
  colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],

  // Plot options
  plotOptions: {
    series: {
      animation: {
        duration: 1000,
      },
      marker: {
        radius: 4,
      },
    },
    line: {
      lineWidth: 2,
    },
  },

  // Ma'lumotlar
  series: [
    {
      name: 'Online',
      data: [29000, 71000, 106000, 129000, 144000, 176000],
    },
    {
      name: 'Offline',
      data: [14000, 26000, 42000, 50000, 69000, 91000],
    },
  ],

  // Accessibility
  accessibility: {
    enabled: true,
    description: 'Oylik savdo trendi ko\'rsatuvchi grafik.',
    point: {
      valueDescriptionFormat: '{index}. {xDescription}, {seriesName}: {value}.',
    },
  },

  // Responsive
  responsive: {
    rules: [{
      condition: {
        maxWidth: 500,
      },
      chartOptions: {
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom',
        },
      },
    }],
  },
});
```

## Asosiy Chart Turlari

### 1. Area Chart — Trend va Hajm

```javascript
Highcharts.chart('container', {
  chart: {
    type: 'area',
  },
  title: {
    text: 'Trafik Manbaalari',
  },
  xAxis: {
    categories: getLast12Months(),
    tickmarkPlacement: 'on',
  },
  yAxis: {
    title: {
      text: 'Tashriflar',
    },
    labels: {
      formatter: function() {
        return this.value / 1000 + 'K';
      },
    },
  },
  tooltip: {
    split: true,
    valueSuffix: ' tashrif',
  },
  plotOptions: {
    area: {
      stacking: 'normal',
      lineColor: '#fff',
      lineWidth: 1,
      marker: {
        enabled: false,
      },
      fillOpacity: 0.7,
    },
  },
  series: [
    {
      name: 'Organic',
      data: [502, 635, 809, 947, 1402, 3634, 5268, 4400, 3200, 2800, 3100, 4200],
      color: '#3B82F6',
    },
    {
      name: 'Paid',
      data: [106, 107, 111, 133, 221, 767, 1766, 1500, 1200, 900, 1100, 1400],
      color: '#10B981',
    },
    {
      name: 'Social',
      data: [163, 203, 276, 408, 547, 729, 628, 550, 400, 350, 420, 580],
      color: '#F59E0B',
    },
  ],
});
```

### 2. Column Chart — Kategorik Solishtirish

```javascript
Highcharts.chart('container', {
  chart: {
    type: 'column',
  },
  title: {
    text: 'Choraklik Natijalar',
  },
  xAxis: {
    categories: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'],
    crosshair: true,
  },
  yAxis: {
    min: 0,
    title: {
      text: 'Daromad (million $)',
    },
  },
  tooltip: {
    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
      '<td style="padding:0"><b>${point.y:.1f}M</b></td></tr>',
    footerFormat: '</table>',
    shared: true,
    useHTML: true,
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
      borderRadius: 4,
      groupPadding: 0.1,
    },
  },
  series: [
    {
      name: 'Mahsulot A',
      data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0],
      color: '#3B82F6',
    },
    {
      name: 'Mahsulot B',
      data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5],
      color: '#10B981',
    },
    {
      name: 'Mahsulot C',
      data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3],
      color: '#F59E0B',
    },
  ],
});
```

### 3. Pie va Semi-Circle

```javascript
// Standard Pie
Highcharts.chart('container', {
  chart: {
    type: 'pie',
  },
  title: {
    text: 'Bozor Ulushi',
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
  },
  accessibility: {
    point: {
      valueSuffix: '%',
    },
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b>: {point.percentage:.1f}%',
        connectorColor: '#6B7280',
      },
      showInLegend: true,
    },
  },
  series: [{
    name: 'Ulush',
    colorByPoint: true,
    data: [
      { name: 'Chrome', y: 61.04, sliced: true, selected: true },
      { name: 'Safari', y: 11.84 },
      { name: 'Edge', y: 10.85 },
      { name: 'Firefox', y: 4.67 },
      { name: 'Boshqa', y: 11.6 },
    ],
  }],
});

// Semi-circle donut
Highcharts.chart('container', {
  chart: {
    type: 'pie',
  },
  title: {
    text: 'Performance Score',
    align: 'center',
    verticalAlign: 'middle',
    y: 60,
  },
  plotOptions: {
    pie: {
      startAngle: -90,
      endAngle: 90,
      center: ['50%', '75%'],
      size: '110%',
      innerSize: '60%',
      dataLabels: {
        enabled: false,
      },
    },
  },
  series: [{
    name: 'Score',
    data: [
      { name: 'Completed', y: 78, color: '#10B981' },
      { name: 'Remaining', y: 22, color: '#E5E7EB' },
    ],
  }],
});
```

### 4. Scatter va Bubble

```javascript
Highcharts.chart('container', {
  chart: {
    type: 'bubble',
    plotBorderWidth: 1,
    zoomType: 'xy',
  },
  title: {
    text: 'Mahsulot Tahlili',
  },
  subtitle: {
    text: 'X: Narx, Y: Reyting, Bubble: Sotilgan soni',
  },
  xAxis: {
    gridLineWidth: 1,
    title: {
      text: 'Narx ($)',
    },
    labels: {
      format: '${value}',
    },
  },
  yAxis: {
    startOnTick: false,
    endOnTick: false,
    title: {
      text: 'Reyting',
    },
    labels: {
      format: '{value}',
    },
    maxPadding: 0.2,
    max: 5,
  },
  tooltip: {
    useHTML: true,
    headerFormat: '<table>',
    pointFormat:
      '<tr><th colspan="2"><h3>{point.name}</h3></th></tr>' +
      '<tr><th>Narx:</th><td>${point.x}</td></tr>' +
      '<tr><th>Reyting:</th><td>{point.y}</td></tr>' +
      '<tr><th>Sotilgan:</th><td>{point.z}</td></tr>',
    footerFormat: '</table>',
    followPointer: true,
  },
  plotOptions: {
    bubble: {
      minSize: 20,
      maxSize: 80,
    },
  },
  series: [{
    name: 'Mahsulotlar',
    data: [
      { x: 29, y: 4.2, z: 500, name: 'Budget Phone' },
      { x: 49, y: 4.5, z: 800, name: 'Mid-range Phone' },
      { x: 99, y: 4.7, z: 1200, name: 'Premium Phone' },
      { x: 19, y: 3.8, z: 300, name: 'Basic Earbuds' },
      { x: 79, y: 4.6, z: 600, name: 'Pro Earbuds' },
      { x: 149, y: 4.8, z: 400, name: 'Elite Earbuds' },
    ],
    colorByPoint: true,
  }],
});
```

### 5. Combination Charts

```javascript
Highcharts.chart('container', {
  title: {
    text: 'Savdo va Konversiya',
  },
  xAxis: [{
    categories: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun'],
    crosshair: true,
  }],
  yAxis: [
    {
      // Primary yAxis (Daromad)
      labels: {
        format: '${value}',
        style: {
          color: '#3B82F6',
        },
      },
      title: {
        text: 'Daromad',
        style: {
          color: '#3B82F6',
        },
      },
    },
    {
      // Secondary yAxis (Konversiya)
      title: {
        text: 'Konversiya',
        style: {
          color: '#F59E0B',
        },
      },
      labels: {
        format: '{value}%',
        style: {
          color: '#F59E0B',
        },
      },
      opposite: true,
      max: 10,
    },
  ],
  tooltip: {
    shared: true,
  },
  legend: {
    layout: 'vertical',
    align: 'left',
    x: 80,
    verticalAlign: 'top',
    y: 55,
    floating: true,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  series: [
    {
      name: 'Daromad',
      type: 'column',
      yAxis: 0,
      data: [49000, 71000, 106000, 129000, 144000, 176000],
      tooltip: {
        valueSuffix: ' $',
      },
      color: '#3B82F6',
    },
    {
      name: 'Buyurtmalar',
      type: 'column',
      yAxis: 0,
      data: [29000, 41000, 56000, 69000, 74000, 96000],
      tooltip: {
        valueSuffix: ' $',
      },
      color: '#10B981',
    },
    {
      name: 'Konversiya',
      type: 'spline',
      yAxis: 1,
      data: [3.5, 4.2, 5.1, 4.8, 5.5, 6.2],
      tooltip: {
        valueSuffix: '%',
      },
      color: '#F59E0B',
      lineWidth: 3,
      marker: {
        radius: 6,
      },
    },
  ],
});
```

### 6. Drilldown

```javascript
Highcharts.chart('container', {
  chart: {
    type: 'column',
  },
  title: {
    text: 'Savdo bo\'yicha Drilldown',
  },
  subtitle: {
    text: 'Bosing tafsilotlar uchun',
  },
  xAxis: {
    type: 'category',
  },
  yAxis: {
    title: {
      text: 'Savdo ($)',
    },
  },
  legend: {
    enabled: false,
  },
  plotOptions: {
    series: {
      borderWidth: 0,
      dataLabels: {
        enabled: true,
        format: '${point.y:,.0f}',
      },
    },
  },
  tooltip: {
    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>${point.y:,.0f}</b>',
  },
  series: [{
    name: 'Kategoriyalar',
    colorByPoint: true,
    data: [
      { name: 'Elektronika', y: 320000, drilldown: 'electronics' },
      { name: 'Kiyim', y: 180000, drilldown: 'clothing' },
      { name: 'Oziq-ovqat', y: 120000, drilldown: 'food' },
      { name: 'Kitoblar', y: 60000, drilldown: 'books' },
    ],
  }],
  drilldown: {
    breadcrumbs: {
      position: {
        align: 'right',
      },
    },
    series: [
      {
        name: 'Elektronika',
        id: 'electronics',
        data: [
          ['Smartphone', 150000],
          ['Laptop', 100000],
          ['Tablet', 45000],
          ['Aksessuarlar', 25000],
        ],
      },
      {
        name: 'Kiyim',
        id: 'clothing',
        data: [
          ['Erkaklar', 80000],
          ['Ayollar', 70000],
          ['Bolalar', 30000],
        ],
      },
      {
        name: 'Oziq-ovqat',
        id: 'food',
        data: [
          ['Ichimliklar', 50000],
          ['Snacklar', 40000],
          ['Asosiy', 30000],
        ],
      },
      {
        name: 'Kitoblar',
        id: 'books',
        data: [
          ['Texnik', 30000],
          ['Badiiy', 20000],
          ['Bolalar', 10000],
        ],
      },
    ],
  },
});
```

## Vue.js Integration

### Vue 3 Component

```vue
<!-- components/HighChart.vue -->
<template>
  <div ref="chartContainer" :style="containerStyle"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import Accessibility from 'highcharts/modules/accessibility';
import Exporting from 'highcharts/modules/exporting';

// Initialize modules
HighchartsMore(Highcharts);
Accessibility(Highcharts);
Exporting(Highcharts);

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
  height: {
    type: [Number, String],
    default: 400,
  },
  width: {
    type: [Number, String],
    default: '100%',
  },
  updateArgs: {
    type: Array,
    default: () => [true, true, true],
  },
});

const emit = defineEmits(['chartReady', 'click', 'selection']);

const chartContainer = ref(null);
let chart = null;

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}));

// Deep merge for options
const mergeOptions = (base, custom) => {
  return Highcharts.merge(base, custom);
};

// Default options
const defaultOptions = {
  credits: { enabled: false },
  accessibility: { enabled: true },
  exporting: {
    buttons: {
      contextButton: {
        menuItems: ['downloadPNG', 'downloadSVG', 'downloadPDF', 'separator', 'downloadCSV'],
      },
    },
  },
  chart: {
    style: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    },
  },
};

const initChart = () => {
  if (!chartContainer.value) return;

  const mergedOptions = mergeOptions(defaultOptions, props.options);

  // Add event listeners
  mergedOptions.chart = mergedOptions.chart || {};
  mergedOptions.chart.events = {
    ...mergedOptions.chart.events,
    click: (e) => emit('click', e),
    selection: (e) => emit('selection', e),
  };

  chart = Highcharts.chart(chartContainer.value, mergedOptions);
  emit('chartReady', chart);
};

const updateChart = () => {
  if (chart) {
    chart.update(props.options, ...props.updateArgs);
  }
};

const destroyChart = () => {
  if (chart) {
    chart.destroy();
    chart = null;
  }
};

// Lifecycle
onMounted(initChart);
onUnmounted(destroyChart);

// Watch for option changes
watch(
  () => props.options,
  () => updateChart(),
  { deep: true }
);

// Expose chart instance
defineExpose({
  chart: () => chart,
  refresh: () => {
    destroyChart();
    initChart();
  },
  addSeries: (series, redraw = true) => chart?.addSeries(series, redraw),
  removeSeries: (index) => chart?.series[index]?.remove(),
  reflow: () => chart?.reflow(),
});
</script>
```

### Composable Pattern

```javascript
// composables/useHighcharts.js
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Highcharts from 'highcharts';

export function useHighcharts(containerRef, getOptions) {
  const chart = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const create = () => {
    if (!containerRef.value) {
      error.value = 'Container not found';
      return;
    }

    try {
      chart.value = Highcharts.chart(containerRef.value, getOptions());
    } catch (e) {
      error.value = e.message;
    }
  };

  const destroy = () => {
    if (chart.value) {
      chart.value.destroy();
      chart.value = null;
    }
  };

  const update = (newOptions) => {
    if (chart.value) {
      chart.value.update(newOptions, true, true);
    }
  };

  const setData = (seriesIndex, data, redraw = true) => {
    if (chart.value?.series[seriesIndex]) {
      chart.value.series[seriesIndex].setData(data, redraw);
    }
  };

  const addPoint = (seriesIndex, point, redraw = true, shift = false) => {
    if (chart.value?.series[seriesIndex]) {
      chart.value.series[seriesIndex].addPoint(point, redraw, shift);
    }
  };

  const showLoading = (message = 'Loading...') => {
    loading.value = true;
    chart.value?.showLoading(message);
  };

  const hideLoading = () => {
    loading.value = false;
    chart.value?.hideLoading();
  };

  const exportChart = (type = 'image/png') => {
    if (chart.value) {
      chart.value.exportChart({ type });
    }
  };

  onMounted(create);
  onUnmounted(destroy);

  return {
    chart,
    loading,
    error,
    create,
    destroy,
    update,
    setData,
    addPoint,
    showLoading,
    hideLoading,
    exportChart,
  };
}
```

### Dashboard Integration

```vue
<!-- pages/SalesDashboard.vue -->
<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Savdo Tahlili</h1>
      <div class="controls">
        <select v-model="selectedPeriod" @change="fetchData">
          <option value="7d">Oxirgi 7 kun</option>
          <option value="30d">Oxirgi 30 kun</option>
          <option value="90d">Oxirgi 90 kun</option>
          <option value="1y">Oxirgi 1 yil</option>
        </select>
        <button @click="exportAll" class="btn-export">
          <ExportIcon /> Export
        </button>
      </div>
    </header>

    <div class="kpi-row">
      <KPICard
        v-for="kpi in kpis"
        :key="kpi.id"
        v-bind="kpi"
      />
    </div>

    <div class="charts-grid">
      <!-- Revenue Trend -->
      <div class="chart-card span-2">
        <div class="chart-header">
          <h3>Daromad Trendi</h3>
          <ChartTypeToggle v-model="revenueChartType" />
        </div>
        <HighChart
          ref="revenueChart"
          :options="revenueOptions"
          :height="350"
          @click="handleRevenueClick"
        />
      </div>

      <!-- Category Distribution -->
      <div class="chart-card">
        <h3>Kategoriya Taqsimoti</h3>
        <HighChart
          :options="categoryOptions"
          :height="350"
        />
      </div>

      <!-- Top Products -->
      <div class="chart-card">
        <h3>Top Mahsulotlar</h3>
        <HighChart
          :options="topProductsOptions"
          :height="350"
        />
      </div>

      <!-- Sales by Region -->
      <div class="chart-card span-2">
        <h3>Mintaqa bo'yicha Savdo</h3>
        <HighChart
          :options="regionOptions"
          :height="300"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useSalesStore } from '@/stores/sales';
import HighChart from '@/components/HighChart.vue';
import KPICard from '@/components/KPICard.vue';
import ChartTypeToggle from '@/components/ChartTypeToggle.vue';

const store = useSalesStore();
const selectedPeriod = ref('30d');
const revenueChartType = ref('area');
const revenueChart = ref(null);

// KPIs
const kpis = computed(() => [
  {
    id: 'revenue',
    title: 'Jami Daromad',
    value: store.formatCurrency(store.totalRevenue),
    change: store.revenueChange,
    trend: store.revenueChange >= 0 ? 'up' : 'down',
    icon: 'dollar',
  },
  {
    id: 'orders',
    title: 'Buyurtmalar',
    value: store.totalOrders.toLocaleString(),
    change: store.ordersChange,
    trend: store.ordersChange >= 0 ? 'up' : 'down',
    icon: 'cart',
  },
  {
    id: 'aov',
    title: 'O\'rtacha Buyurtma',
    value: store.formatCurrency(store.averageOrderValue),
    change: store.aovChange,
    trend: store.aovChange >= 0 ? 'up' : 'down',
    icon: 'trending',
  },
  {
    id: 'conversion',
    title: 'Konversiya',
    value: store.conversionRate + '%',
    change: store.conversionChange,
    trend: store.conversionChange >= 0 ? 'up' : 'down',
    icon: 'percent',
  },
]);

// Chart Options
const revenueOptions = computed(() => ({
  chart: {
    type: revenueChartType.value,
    zooming: { type: 'x' },
  },
  title: { text: null },
  xAxis: {
    categories: store.salesData.map(d => d.date),
    crosshair: true,
  },
  yAxis: {
    title: { text: 'Daromad ($)' },
    labels: {
      formatter() {
        return '$' + (this.value / 1000) + 'K';
      },
    },
  },
  tooltip: {
    shared: true,
    valuePrefix: '$',
  },
  plotOptions: {
    area: {
      fillOpacity: 0.3,
    },
  },
  series: [
    {
      name: 'Daromad',
      data: store.salesData.map(d => d.revenue),
      color: '#3B82F6',
    },
    {
      name: 'Maqsad',
      data: store.salesData.map(d => d.target),
      color: '#9CA3AF',
      dashStyle: 'Dash',
    },
  ],
}));

const categoryOptions = computed(() => ({
  chart: { type: 'pie' },
  title: { text: null },
  plotOptions: {
    pie: {
      innerSize: '60%',
      dataLabels: {
        enabled: true,
        format: '{point.name}: {point.percentage:.1f}%',
      },
    },
  },
  series: [{
    name: 'Savdo',
    data: store.categoryData.map(c => ({
      name: c.name,
      y: c.value,
      color: c.color,
    })),
  }],
}));

const topProductsOptions = computed(() => ({
  chart: { type: 'bar' },
  title: { text: null },
  xAxis: {
    categories: store.topProducts.map(p => p.name),
  },
  yAxis: {
    title: { text: 'Sotilgan' },
  },
  legend: { enabled: false },
  plotOptions: {
    bar: {
      borderRadius: 4,
      dataLabels: {
        enabled: true,
      },
    },
  },
  series: [{
    name: 'Sotilgan',
    data: store.topProducts.map((p, i) => ({
      y: p.sold,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i],
    })),
  }],
}));

const regionOptions = computed(() => ({
  chart: { type: 'column' },
  title: { text: null },
  xAxis: {
    categories: store.regionData.map(r => r.region),
  },
  yAxis: {
    title: { text: 'Savdo ($)' },
  },
  tooltip: {
    valuePrefix: '$',
  },
  series: [{
    name: 'Savdo',
    data: store.regionData.map(r => r.sales),
    colorByPoint: true,
  }],
}));

// Methods
const fetchData = async () => {
  await store.fetchSalesData(selectedPeriod.value);
};

const handleRevenueClick = (e) => {
  if (e.point) {
    console.log('Clicked point:', e.point);
    // Drill-down logic
  }
};

const exportAll = () => {
  revenueChart.value?.chart()?.exportChart({
    type: 'application/pdf',
    filename: `sales-report-${selectedPeriod.value}`,
  });
};

// Lifecycle
onMounted(fetchData);

watch(selectedPeriod, fetchData);
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background: #F9FAFB;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1F2937;
}

.controls {
  display: flex;
  gap: 12px;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.chart-card h3 {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.span-2 {
  grid-column: span 2;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 1;
  }
}
</style>
```

## Advanced Features

### 1. Real-time Data Streaming

```javascript
// Real-time chart with streaming data
const realtimeChart = Highcharts.chart('container', {
  chart: {
    type: 'spline',
    animation: Highcharts.svg,
    events: {
      load: function() {
        const series = this.series[0];
        let time = (new Date()).getTime();

        // WebSocket connection
        const ws = new WebSocket('wss://api.example.com/stream');

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          series.addPoint([data.time, data.value], true, true);
        };

        // Fallback: simulated data
        setInterval(() => {
          time += 1000;
          series.addPoint([time, Math.random() * 100], true, true);
        }, 1000);
      },
    },
  },
  title: {
    text: 'Live Data Stream',
  },
  xAxis: {
    type: 'datetime',
    tickPixelInterval: 150,
  },
  yAxis: {
    title: {
      text: 'Value',
    },
  },
  series: [{
    name: 'Real-time Data',
    data: (() => {
      const data = [];
      const time = (new Date()).getTime();
      for (let i = -20; i <= 0; i++) {
        data.push({
          x: time + i * 1000,
          y: Math.random() * 100,
        });
      }
      return data;
    })(),
  }],
});
```

### 2. Synchronized Charts

```javascript
// Bir nechta chart'ni sinxronlashtirish
function syncCharts(charts) {
  charts.forEach((chart) => {
    chart.update({
      chart: {
        events: {
          mousemove: function(e) {
            charts.forEach((ch) => {
              if (ch !== this) {
                const event = ch.pointer.normalize(e);
                const point = ch.series[0].searchPoint(event, true);
                if (point) {
                  point.highlight(e);
                }
              }
            });
          },
        },
      },
      tooltip: {
        positioner: function() {
          return {
            x: this.chart.chartWidth - this.label.width - 20,
            y: 10,
          };
        },
        borderWidth: 0,
        backgroundColor: 'none',
        shadow: false,
      },
      xAxis: {
        crosshair: true,
      },
    });
  });

  // Reset function
  document.getElementById('container').addEventListener('mouseleave', () => {
    charts.forEach((chart) => {
      chart.series.forEach((series) => {
        series.points.forEach((point) => {
          point.setState();
        });
      });
      chart.tooltip.hide();
      chart.xAxis[0].hideCrosshair();
    });
  });
}

// Usage
const chart1 = Highcharts.chart('chart1', options1);
const chart2 = Highcharts.chart('chart2', options2);
const chart3 = Highcharts.chart('chart3', options3);
syncCharts([chart1, chart2, chart3]);
```

### 3. Custom Annotations

```javascript
Highcharts.chart('container', {
  // ... other options

  annotations: [{
    labels: [{
      point: {
        xAxis: 0,
        yAxis: 0,
        x: 3,
        y: 150,
      },
      text: 'Launch Event',
      backgroundColor: '#3B82F6',
      borderColor: '#1D4ED8',
      style: {
        color: 'white',
      },
    }],
    shapes: [{
      type: 'path',
      points: [
        { xAxis: 0, yAxis: 0, x: 3, y: 0 },
        { xAxis: 0, yAxis: 0, x: 3, y: 200 },
      ],
      stroke: '#3B82F6',
      strokeWidth: 2,
      dashStyle: 'dash',
    }],
  }],
});
```

## Real-World Case Studies

### Case 1: Simple KPI Card Chart

```javascript
// Sparkline-style mini chart
const sparklineOptions = {
  chart: {
    type: 'area',
    backgroundColor: 'transparent',
    margin: [0, 0, 0, 0],
    height: 60,
  },
  title: { text: '' },
  credits: { enabled: false },
  xAxis: {
    visible: false,
  },
  yAxis: {
    visible: false,
    endOnTick: false,
    startOnTick: false,
  },
  legend: { enabled: false },
  tooltip: { enabled: false },
  plotOptions: {
    area: {
      lineWidth: 2,
      marker: { enabled: false },
      fillOpacity: 0.3,
    },
  },
  series: [{
    data: [3, 5, 2, 7, 5, 8, 4, 9, 6, 10, 8, 12],
    color: '#10B981',
    fillColor: 'rgba(16, 185, 129, 0.2)',
  }],
};
```

### Case 2: Complex Financial Dashboard

```javascript
// Multi-axis financial chart
const financialOptions = {
  chart: {
    height: 500,
    zooming: { type: 'xy' },
  },
  title: {
    text: 'Financial Overview',
  },
  subtitle: {
    text: 'Revenue, Expenses, and Profit Margin',
  },
  xAxis: {
    categories: months,
    crosshair: true,
  },
  yAxis: [
    {
      // Primary Y-axis (Amount)
      title: { text: 'Amount ($)' },
      labels: {
        formatter() {
          return '$' + this.value.toLocaleString();
        },
      },
    },
    {
      // Secondary Y-axis (Percentage)
      title: { text: 'Margin (%)' },
      labels: { format: '{value}%' },
      opposite: true,
      max: 50,
    },
  ],
  tooltip: {
    shared: true,
  },
  plotOptions: {
    column: {
      grouping: true,
      borderRadius: 4,
    },
  },
  series: [
    {
      name: 'Revenue',
      type: 'column',
      yAxis: 0,
      data: revenueData,
      color: '#3B82F6',
    },
    {
      name: 'Expenses',
      type: 'column',
      yAxis: 0,
      data: expenseData,
      color: '#EF4444',
    },
    {
      name: 'Profit',
      type: 'column',
      yAxis: 0,
      data: profitData,
      color: '#10B981',
    },
    {
      name: 'Margin',
      type: 'spline',
      yAxis: 1,
      data: marginData,
      color: '#F59E0B',
      lineWidth: 3,
      marker: { radius: 6 },
      tooltip: { valueSuffix: '%' },
    },
  ],
};
```

### Case 3: Custom Infographic

```javascript
// Gauge chart for infographic
const gaugeOptions = {
  chart: {
    type: 'solidgauge',
    height: 250,
  },
  title: { text: null },
  pane: {
    startAngle: -90,
    endAngle: 90,
    background: [{
      outerRadius: '100%',
      innerRadius: '60%',
      backgroundColor: '#E5E7EB',
      borderWidth: 0,
      shape: 'arc',
    }],
  },
  yAxis: {
    min: 0,
    max: 100,
    lineWidth: 0,
    tickPositions: [],
  },
  plotOptions: {
    solidgauge: {
      innerRadius: '60%',
      dataLabels: {
        y: -30,
        borderWidth: 0,
        useHTML: true,
        format: '<div style="text-align:center">' +
          '<span style="font-size:32px;font-weight:bold">{y}</span>' +
          '<span style="font-size:16px;color:#6B7280">%</span><br/>' +
          '<span style="font-size:14px;color:#6B7280">Task Completion</span>' +
          '</div>',
      },
    },
  },
  series: [{
    name: 'Progress',
    data: [{
      color: {
        linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
        stops: [
          [0, '#3B82F6'],
          [1, '#10B981'],
        ],
      },
      y: 78,
    }],
  }],
};
```

## Performance Optimization

### 1. Boost Module (Large Datasets)

```javascript
// 10K+ nuqta uchun
import Boost from 'highcharts/modules/boost';
Boost(Highcharts);

const boostedOptions = {
  chart: {
    type: 'scatter',
    zooming: { type: 'xy' },
  },
  boost: {
    useGPUTranslations: true,
    usePreallocated: true,
    seriesThreshold: 1,
  },
  series: [{
    boostThreshold: 1, // Har qanday hajmda boost
    data: generate100KPoints(),
    marker: {
      radius: 1,
    },
    turboThreshold: 0, // Cheklovsiz
  }],
};
```

### 2. Lazy Loading

```javascript
// Infinite scroll pattern
const lazyLoadChart = {
  chart: {
    events: {
      load: function() {
        const chart = this;
        let page = 1;

        // Scroll event
        chart.container.addEventListener('scroll', () => {
          const { scrollLeft, scrollWidth, clientWidth } = chart.container;
          if (scrollWidth - scrollLeft - clientWidth < 100) {
            loadMoreData(++page).then(data => {
              chart.series[0].setData(
                chart.series[0].data.map(p => p.y).concat(data),
                true
              );
            });
          }
        });
      },
    },
  },
};
```

### 3. Efficient Updates

```javascript
// Series update strategies
class ChartUpdater {
  constructor(chart) {
    this.chart = chart;
    this.updateQueue = [];
    this.rafId = null;
  }

  // Batch updates
  queueUpdate(seriesIndex, data) {
    this.updateQueue.push({ seriesIndex, data });
    this.scheduleFlush();
  }

  scheduleFlush() {
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => this.flush());
    }
  }

  flush() {
    const updates = this.updateQueue.splice(0);

    // Group by series
    const grouped = updates.reduce((acc, { seriesIndex, data }) => {
      acc[seriesIndex] = data;
      return acc;
    }, {});

    // Apply all updates at once
    Object.entries(grouped).forEach(([index, data]) => {
      this.chart.series[index].setData(data, false);
    });

    this.chart.redraw();
    this.rafId = null;
  }
}
```

## Interview Savollari

### 1. Highcharts SVG-based rendering ishlatadi. Canvas-based kutubxonalarga nisbatan qanday farqlari bor?

**Javob:**

```
SVG Afzalliklari:
1. DOM elements — har point alohida element
   - Event handling oson
   - Accessibility yaxshi
   - CSS styling mumkin

2. Vector graphics — zoom qilganda sifat yo'qolmaydi

3. Export — SVG/PDF to'g'ridan-to'g'ri

4. SEO — text searchable

SVG Kamchiliklari:
1. Performance — 10K+ nuqtada sekinlashadi
2. Memory — har element DOM'da

Highcharts yechimi — Boost module:
- WebGL rendering
- 100K+ nuqta
- Canvas fallback

// Boost enabled
chart.series[0].update({
  boostThreshold: 1000, // 1000 dan keyin WebGL
});
```

### 2. Highcharts'da memory leak qanday oldini olinadi va debug qilinadi?

**Javob:**

```javascript
// 1. Proper cleanup
class ChartManager {
  constructor() {
    this.charts = new Map();
  }

  create(id, options) {
    this.destroy(id); // Avval eski chart'ni yo'q qilish

    const chart = Highcharts.chart(id, options);
    this.charts.set(id, chart);

    return chart;
  }

  destroy(id) {
    const chart = this.charts.get(id);
    if (chart) {
      chart.destroy(); // MUHIM!
      this.charts.delete(id);
    }
  }

  destroyAll() {
    this.charts.forEach((chart, id) => {
      chart.destroy();
    });
    this.charts.clear();
  }
}

// 2. Event listener cleanup
chart.update({
  chart: {
    events: {
      destroy: function() {
        // Custom cleanup
        window.removeEventListener('resize', this.reflow);
      },
    },
  },
});

// 3. Debug tools
// Chrome DevTools → Memory → Heap Snapshot
// Highcharts.charts array'ni kuzatish
console.log('Active charts:', Highcharts.charts.filter(c => c));
```

### 3. Highcharts accessibility (a11y) qanday ishlaydi?

**Javob:**

```javascript
// WCAG 2.1 AA compliance
const accessibleOptions = {
  accessibility: {
    enabled: true,

    // Screen reader description
    description: 'Line chart showing monthly sales data',

    // Point descriptions
    point: {
      valueDescriptionFormat: '{index}. {xDescription}, {seriesName}: {value}.',
    },

    // Keyboard navigation
    keyboardNavigation: {
      enabled: true,
      mode: 'normal', // 'normal' | 'serialize'
      order: ['legend', 'series', 'zoom', 'rangeSelector'],
    },

    // Landmark regions
    landmarkVerbosity: 'all',

    // Custom screen reader section
    screenReaderSection: {
      beforeChartFormat: '<{headingTagName}>{chartTitle}</{headingTagName}>',
      afterChartFormat: '{endOfChartMarker}',
    },
  },

  // High contrast support
  chart: {
    styledMode: true, // CSS-based styling
  },

  // Color blind safe palette
  colors: [
    '#0077BB', '#33BBEE', '#009988',
    '#EE7733', '#CC3311', '#EE3377',
  ],
};

// Test tools:
// - axe DevTools
// - WAVE
// - VoiceOver (Mac)
// - NVDA (Windows)
```

### 4. Highcharts'da server-side rendering (SSR) qanday amalga oshiriladi?

**Javob:**

```javascript
// 1. Node.js + highcharts-export-server
const exporter = require('highcharts-export-server');

// Initialize
exporter.initPool({
  maxWorkers: 4,
  initialWorkers: 2,
  workLimit: 50,
});

// Export
exporter.export({
  type: 'png',
  options: {
    title: { text: 'Server Rendered Chart' },
    series: [{ data: [1, 2, 3, 4, 5] }],
  },
}, (err, res) => {
  if (err) throw err;

  // Base64 encoded image
  const imageData = res.data;

  // Or save to file
  fs.writeFileSync('chart.png', imageData, 'base64');

  // Cleanup
  exporter.killPool();
});

// 2. Express.js endpoint
app.get('/chart/:id', async (req, res) => {
  const options = await getChartOptions(req.params.id);

  exporter.export({ type: 'png', options }, (err, result) => {
    if (err) {
      return res.status(500).send('Export failed');
    }

    res.set('Content-Type', 'image/png');
    res.send(Buffer.from(result.data, 'base64'));
  });
});

// 3. PDF report generation
const PDFDocument = require('pdfkit');

async function generateReport(charts) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('report.pdf'));

  for (const chartOptions of charts) {
    const image = await exportChart(chartOptions);
    doc.image(image, { fit: [500, 300] });
    doc.addPage();
  }

  doc.end();
}
```

### 5. Highcharts vs ECharts vs D3.js — loyiha uchun qanday tanlash kerak?

**Javob:**

```
Highcharts tanlang agar:
- Enterprise/tijorat loyiha
- Premium support kerak
- A11y muhim (WCAG)
- Export/print muhim
- Team experience past
- Budget bor

ECharts tanlang agar:
- Bepul bo'lishi kerak
- Ko'p chart turlari
- Katta ma'lumotlar
- Geographic visualizations
- Chinese market

D3.js tanlang agar:
- To'liq custom kerak
- Murakkab vizualizatsiya
- Yangi chart turi yaratish
- Performance-critical
- Team tajribali

Qiyoslash:

| Mezon | Highcharts | ECharts | D3.js |
|-------|------------|---------|-------|
| Learning | O'rta | O'rta | Qiyin |
| Performance | Yaxshi | Zo'r | O'zgaruvchan |
| Customization | Yuqori | Yuqori | Cheksiz |
| A11y | WCAG AA | Basic | Manual |
| Export | Built-in | Plugin | Manual |
| Support | Premium | Community | Community |
| Narx | $520+ | Bepul | Bepul |
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **A11y (Accessibility) ni o'chirmang:** Highcharts'ning eng kuchli tomoni — imkoniyati cheklangan foydalanuvchilar (ko'zi ojizlar) uchun ekran o'qiydigan dasturlar (Screen Readers) ga moslashganligi. Uni default holatda saqlang, zarurat bo'lmasa o'chirib qo'ymang.
2. **Katta ma'lumotlarda Boost Modulini yoqing:** Agar siz 10,000 dan oshiq nuqtali (points) grafik chizmoqchi bo'lsangiz, SVG usulida u qotib qoladi. Buning uchun Highcharts tarkibida keluvchi **Boost Module** (WebGL ga o'tkazib beradi) ni yoqib qo'yish shart.
3. **Eksportni sozlash:** Odatda foydalanuvchilar (asosan moliya va biznes tahlilchilar) grafikni PDF yoki PNG qilib yuklab olishni istaydilar. Highcharts Exporting modulini ishga tushirish faqat bir qator kod talab qiladi va unga maxsus server kerak emas (offline-exporting).

---

## Xulosa

| Xususiyat | Tavsif / Foydasi |
|-----------|------------------|
| **Asos (Texnologiya)** | `<svg>` texnologiyasiga tayanadi (Lekin kerak bo'lganda WebGL ga - Boost modul orqali o'ta oladi). |
| **A11y (Imkoniyat)** | WCAG 2.1 AA standartini mukammal qondiradi. Hukumat va moliyaviy dasturlar uchun majburiy shartni bajaradi. |
| **Qamrov** | Moliyaviy birjalar (Highcharts Stock), xaritalar (Highcharts Maps), Loyiha boshqaruvi (Highcharts Gantt) kabi ixtisoslashgan modullari bor. |
| **Kamchiligi** | Tijorat loyihalari uchun pullik litsenziya talab qilinadi. SVG bo'lgani uchun o'ta yirik (millions of data) da qiynalishi mumkin. |

Highcharts — davlat tashkilotlari, bank tizimlari, tibbiyot (Healthcare) kabi yuqori darajadagi barqarorlik, litsenziyalangan kafolat va ko'zi ojizlar uchun o'qiluvchanlik majburiy bo'lgan Enterprise loyihalar uchun yagona ishonchli tanlovdir. Boshqa arzon yoki shaxsiy startup'larga ECharts tavsiya qilinadi.

## Keyingi Qadam

[D3.js](./04-d3js.md) — to'liq custom vizualizatsiya uchun low-level kutubxona.
