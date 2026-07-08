# ECharts — Apache'ning Kuchli Vizualizatsiya Platformasi

## Kirish

ECharts (Enterprise Charts) — Apache Software Foundation tomonidan qo'llab-quvvatlanadigan bepul, kuchli va moslashuvchan JavaScript vizualizatsiya kutubxonasi. Baidu tomonidan 2013-yilda yaratilgan, hozirda dunyo bo'ylab millionlab loyihalarda ishlatiladi.

## Nega ECharts?

### Afzalliklari
```
+ Juda boy chart turlari (50+ turdagi chart)
+ Zo'r performance (Canvas + WebGL)
+ Kuchli interaktivlik
+ Server-side rendering (SSR)
+ Katta ma'lumotlar bilan ishlash
+ I18n support (40+ til)
+ Apache 2.0 litsenziya (bepul)
+ Keng customization imkoniyatlari
```

### Kamchiliklari
```
- Katta bundle size (~400KB min)
- Murakkab API (o'rganish ko'proq vaqt oladi)
- Documentation ba'zan chalkash
- Overengineered kichik loyihalar uchun
```

## O'rnatish va Sozlash

### NPM orqali
```bash
npm install echarts
# Vue uchun wrapper
npm install vue-echarts echarts
```

### Modular Import (Tree-shaking)
```javascript
// Faqat kerakli komponentlar
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// SVG renderer (accessibility uchun)
// import { SVGRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

export default echarts;
```

### CDN orqali
```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
```

## Asosiy Tushunchalar

### 1. Option Object

ECharts'ning barcha konfiguratsiyasi bitta `option` obyekt orqali boshqariladi:

```javascript
const option = {
  // Sarlavha
  title: {
    text: 'Asosiy sarlavha',
    subtext: 'Qo\'shimcha ma\'lumot',
    left: 'center',
  },

  // Tooltip (hover qilganda ko'rinadigan info)
  tooltip: {
    trigger: 'axis', // 'item' | 'axis' | 'none'
    axisPointer: {
      type: 'shadow', // 'line' | 'shadow' | 'cross'
    },
  },

  // Legend (dataset nomlari)
  legend: {
    data: ['Savdo', 'Xarajat'],
    bottom: 10,
  },

  // Grid (chart maydoni)
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    containLabel: true,
  },

  // X o'qi
  xAxis: {
    type: 'category',
    data: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun'],
  },

  // Y o'qi
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value} $',
    },
  },

  // Ma'lumotlar
  series: [
    {
      name: 'Savdo',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110],
      itemStyle: {
        color: '#3B82F6',
      },
    },
    {
      name: 'Xarajat',
      type: 'bar',
      data: [60, 80, 70, 50, 40, 60],
      itemStyle: {
        color: '#EF4444',
      },
    },
  ],
};
```

### 2. Instance Management

```javascript
// Chart yaratish
const chartDom = document.getElementById('main');
const myChart = echarts.init(chartDom, null, {
  renderer: 'canvas', // 'canvas' | 'svg'
  useDirtyRect: true, // Incremental rendering
  width: 'auto',
  height: 400,
});

// Option o'rnatish
myChart.setOption(option);

// Resize handling
window.addEventListener('resize', () => {
  myChart.resize();
});

// Dispose (memory leak oldini olish)
function cleanup() {
  myChart.dispose();
}
```

## Asosiy Chart Turlari

### 1. Line Chart — Trend Vizualizatsiya

```javascript
const lineOption = {
  title: {
    text: 'Haftalik Trafik',
  },
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: ['Tashriflar', 'Unique'],
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: 'Tashriflar',
      type: 'line',
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
          ],
        },
      },
      lineStyle: {
        width: 3,
        color: '#3B82F6',
      },
      symbol: 'circle',
      symbolSize: 8,
    },
    {
      name: 'Unique',
      type: 'line',
      data: [620, 732, 701, 734, 1090, 1130, 1120],
      smooth: true,
      lineStyle: {
        width: 3,
        color: '#10B981',
        type: 'dashed',
      },
    },
  ],
};
```

### 2. Bar Chart — Grouped va Stacked

```javascript
const barOption = {
  title: {
    text: 'Choraklik Savdo',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  legend: {
    data: ['Online', 'Offline', 'B2B'],
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: ['Q1', 'Q2', 'Q3', 'Q4'],
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '${value}K',
    },
  },
  series: [
    {
      name: 'Online',
      type: 'bar',
      stack: 'total', // Stacked qilish uchun
      data: [320, 332, 301, 334],
      itemStyle: {
        color: '#3B82F6',
        borderRadius: [4, 4, 0, 0],
      },
    },
    {
      name: 'Offline',
      type: 'bar',
      stack: 'total',
      data: [120, 132, 101, 134],
      itemStyle: {
        color: '#10B981',
      },
    },
    {
      name: 'B2B',
      type: 'bar',
      stack: 'total',
      data: [220, 182, 191, 234],
      itemStyle: {
        color: '#F59E0B',
        borderRadius: [4, 4, 0, 0],
      },
    },
  ],
};
```

### 3. Pie va Doughnut Chart

```javascript
const pieOption = {
  title: {
    text: 'Trafik Manbaalari',
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
  },
  series: [
    {
      name: 'Manba',
      type: 'pie',
      radius: ['40%', '70%'], // Doughnut
      center: ['50%', '60%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 24,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 1048, name: 'Organic Search', itemStyle: { color: '#3B82F6' } },
        { value: 735, name: 'Direct', itemStyle: { color: '#10B981' } },
        { value: 580, name: 'Social', itemStyle: { color: '#F59E0B' } },
        { value: 484, name: 'Referral', itemStyle: { color: '#8B5CF6' } },
        { value: 300, name: 'Email', itemStyle: { color: '#EF4444' } },
      ],
    },
  ],
};
```

### 4. Scatter Plot — Korrelyatsiya Tahlili

```javascript
const scatterOption = {
  title: {
    text: 'Narx vs Sifat',
  },
  tooltip: {
    trigger: 'item',
    formatter: (params) => {
      return `${params.seriesName}<br/>
              Narx: $${params.value[0]}<br/>
              Reyting: ${params.value[1]}<br/>
              Sotilgan: ${params.value[2]}`;
    },
  },
  xAxis: {
    name: 'Narx ($)',
    nameLocation: 'middle',
    nameGap: 30,
  },
  yAxis: {
    name: 'Reyting',
    nameLocation: 'middle',
    nameGap: 40,
    max: 5,
  },
  series: [
    {
      name: 'Mahsulotlar',
      type: 'scatter',
      symbolSize: (data) => Math.sqrt(data[2]) * 2, // Bubble size
      data: [
        [10.0, 4.5, 100],
        [25.0, 4.2, 250],
        [15.0, 3.8, 80],
        [45.0, 4.8, 400],
        [30.0, 4.0, 200],
        [20.0, 3.5, 150],
        [55.0, 4.9, 500],
        [35.0, 4.3, 300],
      ],
      itemStyle: {
        color: '#3B82F6',
        opacity: 0.7,
      },
      emphasis: {
        itemStyle: {
          opacity: 1,
        },
      },
    },
  ],
};
```

### 5. Heatmap — Matritsa Vizualizatsiya

```javascript
const heatmapOption = {
  title: {
    text: 'Haftalik Aktivlik',
  },
  tooltip: {
    position: 'top',
    formatter: (params) => {
      const days = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
      const hours = params.value[1];
      return `${days[params.value[0]]} ${hours}:00 - ${params.value[2]} faol`;
    },
  },
  grid: {
    height: '70%',
    top: '10%',
  },
  xAxis: {
    type: 'category',
    data: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
    splitArea: {
      show: true,
    },
  },
  yAxis: {
    type: 'category',
    data: ['0', '4', '8', '12', '16', '20'],
    splitArea: {
      show: true,
    },
  },
  visualMap: {
    min: 0,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '5%',
    inRange: {
      color: ['#E5E7EB', '#93C5FD', '#3B82F6', '#1D4ED8'],
    },
  },
  series: [
    {
      name: 'Aktivlik',
      type: 'heatmap',
      data: generateHeatmapData(),
      label: {
        show: true,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
};

function generateHeatmapData() {
  const data = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      data.push([i, j, Math.floor(Math.random() * 100)]);
    }
  }
  return data;
}
```

### 6. Radar Chart — Ko'p O'lchovli Taqqoslash

```javascript
const radarOption = {
  title: {
    text: 'Xodim Baholash',
  },
  legend: {
    data: ['Reja', 'Haqiqat'],
    bottom: 10,
  },
  radar: {
    indicator: [
      { name: 'Texnik', max: 100 },
      { name: 'Kommunikatsiya', max: 100 },
      { name: 'Leadership', max: 100 },
      { name: 'Kreativlik', max: 100 },
      { name: 'Teamwork', max: 100 },
      { name: 'O\'z-o\'zini rivojlantirish', max: 100 },
    ],
    shape: 'polygon',
    splitNumber: 5,
    axisName: {
      color: '#666',
    },
    splitLine: {
      lineStyle: {
        color: '#E5E7EB',
      },
    },
    splitArea: {
      show: true,
      areaStyle: {
        color: ['#fff', '#F9FAFB'],
      },
    },
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: [80, 90, 70, 85, 95, 75],
          name: 'Reja',
          lineStyle: {
            color: '#9CA3AF',
            type: 'dashed',
          },
          areaStyle: {
            color: 'rgba(156, 163, 175, 0.2)',
          },
        },
        {
          value: [90, 85, 80, 90, 88, 85],
          name: 'Haqiqat',
          lineStyle: {
            color: '#3B82F6',
          },
          areaStyle: {
            color: 'rgba(59, 130, 246, 0.3)',
          },
        },
      ],
    },
  ],
};
```

### 7. Treemap — Ierarxik Ma'lumotlar

```javascript
const treemapOption = {
  title: {
    text: 'Byudjet Taqsimoti',
  },
  tooltip: {
    formatter: (params) => {
      return `${params.name}: $${params.value.toLocaleString()}`;
    },
  },
  series: [
    {
      type: 'treemap',
      data: [
        {
          name: 'Marketing',
          value: 50000,
          children: [
            { name: 'Digital Ads', value: 25000 },
            { name: 'Content', value: 15000 },
            { name: 'Events', value: 10000 },
          ],
        },
        {
          name: 'Development',
          value: 80000,
          children: [
            { name: 'Frontend', value: 30000 },
            { name: 'Backend', value: 35000 },
            { name: 'DevOps', value: 15000 },
          ],
        },
        {
          name: 'Operations',
          value: 30000,
          children: [
            { name: 'HR', value: 15000 },
            { name: 'Admin', value: 10000 },
            { name: 'Legal', value: 5000 },
          ],
        },
      ],
      levels: [
        {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            gapWidth: 2,
          },
        },
        {
          colorSaturation: [0.35, 0.5],
          itemStyle: {
            borderWidth: 1,
            gapWidth: 1,
          },
        },
      ],
    },
  ],
};
```

### 8. Sankey Diagram — Oqim Vizualizatsiya

```javascript
const sankeyOption = {
  title: {
    text: 'Trafik Oqimi',
  },
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove',
  },
  series: [
    {
      type: 'sankey',
      layout: 'none',
      emphasis: {
        focus: 'adjacency',
      },
      data: [
        { name: 'Google' },
        { name: 'Facebook' },
        { name: 'Twitter' },
        { name: 'Landing Page' },
        { name: 'Product Page' },
        { name: 'Cart' },
        { name: 'Checkout' },
        { name: 'Purchase' },
        { name: 'Exit' },
      ],
      links: [
        { source: 'Google', target: 'Landing Page', value: 1000 },
        { source: 'Facebook', target: 'Landing Page', value: 500 },
        { source: 'Twitter', target: 'Landing Page', value: 200 },
        { source: 'Landing Page', target: 'Product Page', value: 1200 },
        { source: 'Landing Page', target: 'Exit', value: 500 },
        { source: 'Product Page', target: 'Cart', value: 800 },
        { source: 'Product Page', target: 'Exit', value: 400 },
        { source: 'Cart', target: 'Checkout', value: 600 },
        { source: 'Cart', target: 'Exit', value: 200 },
        { source: 'Checkout', target: 'Purchase', value: 500 },
        { source: 'Checkout', target: 'Exit', value: 100 },
      ],
      lineStyle: {
        color: 'gradient',
        curveness: 0.5,
      },
    },
  ],
};
```

## Vue.js Integration

### Vue 3 + Composition API

```vue
<!-- components/EChart.vue -->
<template>
  <div ref="chartRef" :style="{ width: '100%', height: height + 'px' }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

const props = defineProps({
  option: {
    type: Object,
    required: true,
  },
  height: {
    type: Number,
    default: 400,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  theme: {
    type: String,
    default: null, // 'dark' | custom theme name
  },
});

const emit = defineEmits(['click', 'mouseover', 'mouseout']);

const chartRef = ref(null);
// shallowRef ECharts instance uchun (deep reactivity kerak emas)
const chart = shallowRef(null);

// Resize handler
let resizeObserver = null;

const initChart = () => {
  if (!chartRef.value) return;

  chart.value = echarts.init(chartRef.value, props.theme, {
    renderer: 'canvas',
  });

  chart.value.setOption(props.option);

  // Event handlers
  chart.value.on('click', (params) => emit('click', params));
  chart.value.on('mouseover', (params) => emit('mouseover', params));
  chart.value.on('mouseout', (params) => emit('mouseout', params));

  // ResizeObserver
  resizeObserver = new ResizeObserver(() => {
    chart.value?.resize();
  });
  resizeObserver.observe(chartRef.value);
};

const updateChart = () => {
  if (chart.value) {
    chart.value.setOption(props.option, {
      notMerge: false,
      lazyUpdate: true,
    });
  }
};

// Loading state
watch(
  () => props.loading,
  (loading) => {
    if (chart.value) {
      if (loading) {
        chart.value.showLoading('default', {
          text: 'Yuklanmoqda...',
          maskColor: 'rgba(255, 255, 255, 0.8)',
          textColor: '#3B82F6',
        });
      } else {
        chart.value.hideLoading();
      }
    }
  }
);

// Option reactivity
watch(
  () => props.option,
  () => updateChart(),
  { deep: true }
);

// Theme change
watch(
  () => props.theme,
  () => {
    chart.value?.dispose();
    initChart();
  }
);

onMounted(initChart);

onUnmounted(() => {
  resizeObserver?.disconnect();
  chart.value?.dispose();
});

// Expose methods
defineExpose({
  getChart: () => chart.value,
  resize: () => chart.value?.resize(),
  clear: () => chart.value?.clear(),
  dispatchAction: (action) => chart.value?.dispatchAction(action),
});
</script>
```

### Dashboard Composition

```vue
<!-- pages/AnalyticsDashboard.vue -->
<template>
  <div class="dashboard">
    <!-- KPI Cards -->
    <div class="kpi-grid">
      <KPICard
        v-for="kpi in kpis"
        :key="kpi.id"
        :title="kpi.title"
        :value="kpi.value"
        :change="kpi.change"
        :trend="kpi.trend"
      />
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <div class="chart-card span-2">
        <h3>Daromad Trendi</h3>
        <EChart
          :option="revenueChartOption"
          :height="350"
          :loading="isLoading"
          @click="handleRevenueClick"
        />
      </div>

      <div class="chart-card">
        <h3>Kategoriya Ulushi</h3>
        <EChart
          :option="categoryChartOption"
          :height="350"
          :loading="isLoading"
        />
      </div>

      <div class="chart-card">
        <h3>Trafik Manbaalari</h3>
        <EChart
          :option="trafficChartOption"
          :height="350"
          :loading="isLoading"
        />
      </div>

      <div class="chart-card span-2">
        <div class="chart-header">
          <h3>Haftalik Aktivlik</h3>
          <select v-model="selectedMetric">
            <option value="views">Ko'rishlar</option>
            <option value="clicks">Bosishlar</option>
            <option value="conversions">Konversiyalar</option>
          </select>
        </div>
        <EChart
          :option="heatmapOption"
          :height="300"
          :loading="isLoading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAnalyticsStore } from '@/stores/analytics';
import EChart from '@/components/EChart.vue';
import KPICard from '@/components/KPICard.vue';

const store = useAnalyticsStore();
const isLoading = ref(true);
const selectedMetric = ref('views');

// KPI data
const kpis = computed(() => [
  {
    id: 1,
    title: 'Jami Daromad',
    value: store.totalRevenue,
    change: store.revenueChange,
    trend: store.revenueChange >= 0 ? 'up' : 'down',
  },
  {
    id: 2,
    title: 'Foydalanuvchilar',
    value: store.totalUsers,
    change: store.usersChange,
    trend: store.usersChange >= 0 ? 'up' : 'down',
  },
  // ...
]);

// Chart options
const revenueChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      const date = params[0].axisValue;
      let html = `<div style="font-weight: 600">${date}</div>`;
      params.forEach(param => {
        html += `<div>${param.marker} ${param.seriesName}: $${param.value.toLocaleString()}</div>`;
      });
      return html;
    },
  },
  legend: {
    data: ['Daromad', 'Maqsad'],
    bottom: 0,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: store.revenueData.map(d => d.date),
    axisLine: {
      lineStyle: { color: '#E5E7EB' },
    },
    axisLabel: { color: '#6B7280' },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '${value}',
      color: '#6B7280',
    },
    splitLine: {
      lineStyle: { color: '#F3F4F6' },
    },
  },
  series: [
    {
      name: 'Daromad',
      type: 'line',
      data: store.revenueData.map(d => d.value),
      smooth: true,
      lineStyle: { width: 3, color: '#3B82F6' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
          ],
        },
      },
    },
    {
      name: 'Maqsad',
      type: 'line',
      data: store.revenueData.map(d => d.target),
      lineStyle: { width: 2, color: '#9CA3AF', type: 'dashed' },
    },
  ],
}));

const categoryChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
      },
      labelLine: {
        show: false,
      },
      data: store.categoryData.map((c, i) => ({
        value: c.value,
        name: c.name,
        itemStyle: {
          color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i],
        },
      })),
    },
  ],
}));

const trafficChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    axisLabel: { color: '#6B7280' },
    splitLine: { lineStyle: { color: '#F3F4F6' } },
  },
  yAxis: {
    type: 'category',
    data: store.trafficData.map(t => t.source),
    axisLabel: { color: '#6B7280' },
  },
  series: [
    {
      type: 'bar',
      data: store.trafficData.map((t, i) => ({
        value: t.value,
        itemStyle: {
          color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][i],
          borderRadius: [0, 4, 4, 0],
        },
      })),
      barWidth: 20,
    },
  ],
}));

const heatmapOption = computed(() => ({
  tooltip: {
    position: 'top',
  },
  grid: {
    height: '70%',
    top: '5%',
  },
  xAxis: {
    type: 'category',
    data: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
    splitArea: { show: true },
  },
  yAxis: {
    type: 'category',
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    splitArea: { show: true },
  },
  visualMap: {
    min: 0,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: 0,
    inRange: {
      color: ['#E5E7EB', '#93C5FD', '#3B82F6', '#1D4ED8'],
    },
  },
  series: [{
    type: 'heatmap',
    data: store.getHeatmapData(selectedMetric.value),
    label: { show: false },
  }],
}));

// Event handlers
const handleRevenueClick = (params) => {
  console.log('Clicked:', params);
  // Drill-down navigatsiya
};

// Fetch data
onMounted(async () => {
  isLoading.value = true;
  await store.fetchAnalytics();
  isLoading.value = false;
});
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background: #F9FAFB;
  min-height: 100vh;
}

.kpi-grid {
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

.chart-header select {
  padding: 6px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 13px;
}

.span-2 {
  grid-column: span 2;
}

@media (max-width: 1024px) {
  .kpi-grid {
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

### 1. DataZoom — Katta Ma'lumotlarni Navigatsiya

```javascript
const dataZoomOption = {
  xAxis: {
    type: 'category',
    data: generateDates(365), // 1 yillik ma'lumot
  },
  yAxis: {
    type: 'value',
  },
  dataZoom: [
    {
      type: 'inside', // Mouse wheel bilan zoom
      start: 80,
      end: 100,
    },
    {
      type: 'slider', // Slider control
      start: 80,
      end: 100,
      height: 20,
      bottom: 10,
    },
  ],
  series: [{
    type: 'line',
    data: generateData(365),
    sampling: 'lttb', // Downsampling algorithm
  }],
};
```

### 2. Brush — Ma'lumotlarni Tanlash

```javascript
const brushOption = {
  brush: {
    toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
    xAxisIndex: 0,
  },
  toolbox: {
    feature: {
      brush: {
        type: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
      },
    },
  },
  series: [{
    type: 'scatter',
    data: scatterData,
  }],
};

// Brush selection callback
chart.on('brushSelected', (params) => {
  const selectedData = params.batch[0].selected[0].dataIndex;
  console.log('Selected indices:', selectedData);
});
```

### 3. Graphic — Custom Shapes

```javascript
const graphicOption = {
  graphic: [
    {
      type: 'group',
      left: 'center',
      top: 'middle',
      children: [
        {
          type: 'rect',
          shape: {
            width: 200,
            height: 60,
            r: 8,
          },
          style: {
            fill: 'rgba(59, 130, 246, 0.1)',
            stroke: '#3B82F6',
            lineWidth: 2,
          },
        },
        {
          type: 'text',
          style: {
            text: 'Custom Annotation',
            x: 100,
            y: 30,
            textAlign: 'center',
            textVerticalAlign: 'middle',
            fontSize: 16,
            fill: '#3B82F6',
          },
        },
      ],
    },
    // Watermark
    {
      type: 'text',
      right: 20,
      bottom: 20,
      style: {
        text: 'CONFIDENTIAL',
        fontSize: 24,
        fill: 'rgba(0,0,0,0.1)',
      },
    },
  ],
};
```

### 4. Dataset — Ma'lumotlarni Ajratish

```javascript
const datasetOption = {
  dataset: {
    source: [
      ['product', '2022', '2023', '2024'],
      ['Laptop', 43.3, 85.8, 93.7],
      ['Phone', 83.1, 73.4, 55.1],
      ['Tablet', 86.4, 65.2, 82.5],
      ['Watch', 72.4, 53.9, 39.1],
    ],
  },
  xAxis: { type: 'category' },
  yAxis: {},
  series: [
    { type: 'bar', seriesLayoutBy: 'row' },
    { type: 'bar', seriesLayoutBy: 'row' },
    { type: 'bar', seriesLayoutBy: 'row' },
    { type: 'bar', seriesLayoutBy: 'row' },
  ],
};
```

## Real-World Case Studies

### Case 1: Simple Dashboard Chart

```javascript
// Oddiy KPI trend chart
const simpleKPIChart = {
  tooltip: {
    trigger: 'axis',
  },
  grid: {
    left: 0,
    right: 0,
    top: 10,
    bottom: 0,
    containLabel: false,
  },
  xAxis: {
    type: 'category',
    data: getLast7Days(),
    show: false,
  },
  yAxis: {
    type: 'value',
    show: false,
  },
  series: [{
    type: 'line',
    data: [120, 132, 101, 134, 90, 230, 210],
    smooth: true,
    symbol: 'none',
    lineStyle: {
      color: '#10B981',
      width: 2,
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
          { offset: 1, color: 'rgba(16, 185, 129, 0)' },
        ],
      },
    },
  }],
};
```

### Case 2: Complex Multi-Axis Dashboard

```javascript
// E-commerce analytics dashboard
const complexDashboard = {
  title: {
    text: 'E-Commerce Performance',
    subtext: 'Oxirgi 30 kun',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
    },
  },
  legend: {
    data: ['Daromad', 'Buyurtmalar', 'Konversiya'],
  },
  grid: [
    { left: '3%', right: '3%', top: '15%', height: '50%' },
    { left: '3%', right: '3%', top: '75%', height: '15%' },
  ],
  xAxis: [
    { type: 'category', data: dates, gridIndex: 0 },
    { type: 'category', data: dates, gridIndex: 1 },
  ],
  yAxis: [
    {
      type: 'value',
      name: 'Daromad ($)',
      position: 'left',
      gridIndex: 0,
      axisLabel: { formatter: '${value}' },
    },
    {
      type: 'value',
      name: 'Buyurtmalar',
      position: 'right',
      gridIndex: 0,
    },
    {
      type: 'value',
      name: 'Konversiya %',
      gridIndex: 1,
      max: 10,
      axisLabel: { formatter: '{value}%' },
    },
  ],
  dataZoom: [
    { type: 'inside', xAxisIndex: [0, 1] },
    { type: 'slider', xAxisIndex: [0, 1], top: '92%' },
  ],
  series: [
    {
      name: 'Daromad',
      type: 'bar',
      yAxisIndex: 0,
      data: revenueData,
      itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] },
    },
    {
      name: 'Buyurtmalar',
      type: 'line',
      yAxisIndex: 1,
      data: ordersData,
      lineStyle: { color: '#10B981', width: 2 },
    },
    {
      name: 'Konversiya',
      type: 'line',
      xAxisIndex: 1,
      yAxisIndex: 2,
      data: conversionData,
      lineStyle: { color: '#F59E0B', width: 2 },
      areaStyle: { color: 'rgba(245, 158, 11, 0.1)' },
    },
  ],
};
```

### Case 3: Custom Infographic

```javascript
// Gauge + Progress infographic
const infographicGauge = {
  series: [
    {
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      radius: '100%',
      center: ['50%', '75%'],
      progress: {
        show: true,
        width: 18,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#3B82F6' },
              { offset: 1, color: '#10B981' },
            ],
          },
        },
      },
      axisLine: {
        lineStyle: {
          width: 18,
          color: [[1, '#E5E7EB']],
        },
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      title: {
        offsetCenter: [0, '-30%'],
        fontSize: 14,
        color: '#6B7280',
      },
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '0%'],
        fontSize: 36,
        fontWeight: 'bold',
        formatter: '{value}%',
        color: '#1F2937',
      },
      data: [
        { value: 78, name: 'Task Completion' },
      ],
    },
  ],
};
```

## Performance Optimization

### 1. Large Dataset Handling

```javascript
// 100K+ nuqta uchun
const largeDataOption = {
  dataset: {
    source: largeData, // 100K rows
  },
  xAxis: { type: 'value' },
  yAxis: { type: 'value' },
  series: [{
    type: 'scatter',
    encode: { x: 0, y: 1 },
    large: true, // Large mode
    largeThreshold: 2000,
    progressive: 400, // Render 400 points per frame
    progressiveThreshold: 3000,
    symbolSize: 2,
  }],
};
```

### 2. WebGL Renderer

```javascript
// Millionlab nuqta uchun
import 'echarts-gl';

const webglOption = {
  grid3D: {},
  xAxis3D: { type: 'value' },
  yAxis3D: { type: 'value' },
  zAxis3D: { type: 'value' },
  series: [{
    type: 'scatter3D',
    data: generate3DData(1000000),
    symbolSize: 2,
    itemStyle: {
      opacity: 0.5,
    },
  }],
};

// 2D WebGL scatter
const scatter2DGL = {
  series: [{
    type: 'scatterGL', // WebGL accelerated
    data: generateData(1000000),
    symbolSize: 2,
  }],
};
```

### 3. Lazy Updates

```javascript
// Efficient updates
const updateChart = (newData) => {
  chart.setOption({
    series: [{
      data: newData,
    }],
  }, {
    notMerge: false, // Merge with existing
    lazyUpdate: true, // Defer rendering
    silent: true, // No events during update
  });
};

// Batch updates
const batchUpdate = () => {
  chart.setOption({
    series: [
      { data: data1 },
      { data: data2 },
      { data: data3 },
    ],
  }, {
    replaceMerge: ['series'], // Replace all series
  });
};
```

### 4. Memory Management

```javascript
class EChartsManager {
  constructor() {
    this.instances = new Map();
  }

  create(containerId, option, theme = null) {
    this.dispose(containerId);

    const container = document.getElementById(containerId);
    const chart = echarts.init(container, theme, {
      renderer: 'canvas',
      useDirtyRect: true,
    });

    chart.setOption(option);
    this.instances.set(containerId, chart);

    return chart;
  }

  dispose(containerId) {
    const chart = this.instances.get(containerId);
    if (chart) {
      chart.dispose();
      this.instances.delete(containerId);
    }
  }

  disposeAll() {
    this.instances.forEach(chart => chart.dispose());
    this.instances.clear();
  }

  resize(containerId) {
    const chart = this.instances.get(containerId);
    chart?.resize();
  }

  resizeAll() {
    this.instances.forEach(chart => chart.resize());
  }
}

// Global resize handler
const manager = new EChartsManager();
window.addEventListener('resize', () => manager.resizeAll());
```

## Interview Savollari

### 1. ECharts'da option merge qanday ishlaydi va qachon notMerge ishlatish kerak?

**Javob:**

```javascript
// Default: merge mode
chart.setOption({
  series: [{ data: newData }],
});
// Mavjud option bilan birlashtiriladi

// notMerge: to'liq almashtirish
chart.setOption(newOption, { notMerge: true });
// Barcha oldingi option yo'qoladi

// replaceMerge: selective almashtirish
chart.setOption({
  series: newSeriesArray,
}, {
  replaceMerge: ['series'], // Faqat series to'liq almashtiriladi
});

// Qachon notMerge ishlatish:
// 1. Chart turini o'zgartirganda (line → bar)
// 2. Series sonini kamaytirganda
// 3. Butunlay yangi konfiguratsiya kerak bo'lganda

// MUHIM: notMerge memory leak keltirib chiqarishi mumkin
// chunki eski series reference'lari qolishi mumkin
```

### 2. ECharts'da real-time streaming ma'lumotlarni qanday optimallashtirish kerak?

**Javob:**

```javascript
// 1. appendData — buffer'ga qo'shish
const appendRealTimeData = (newPoints) => {
  chart.appendData({
    seriesIndex: 0,
    data: newPoints,
  });
};

// 2. Ring buffer pattern
class RingBuffer {
  constructor(maxSize = 1000) {
    this.data = [];
    this.maxSize = maxSize;
  }

  push(item) {
    this.data.push(item);
    if (this.data.length > this.maxSize) {
      this.data.shift();
    }
    return this.data;
  }
}

// 3. Throttled updates
const throttledUpdate = throttle((data) => {
  chart.setOption({
    series: [{ data }],
  }, {
    lazyUpdate: true,
    silent: true,
  });
}, 100); // 10 FPS max

// 4. Animation o'chirish
const streamingOption = {
  animation: false,
  series: [{
    type: 'line',
    data: [],
    showSymbol: false, // Points yo'q
    hoverAnimation: false,
  }],
};
```

### 3. ECharts vs Chart.js: qachon qaysi birini tanlash kerak?

**Javob:**

```
ECharts tanlang agar:
- 20+ chart turi kerak
- Katta ma'lumotlar (10K+ nuqta)
- Murakkab interaktivlik (brush, dataZoom)
- Geographic maps
- Server-side rendering
- Chinese/Asian market

Chart.js tanlang agar:
- Bundle size muhim (<100KB)
- Oddiy charts yetarli
- Tez prototiplash
- React/Vue ecosystem
- Kichik loyihalar
- Learning curve past bo'lsin

Performance qiyoslash:
- ECharts: 100K+ nuqta Canvas, 1M+ WebGL
- Chart.js: 10K nuqta optimal

Bundle size:
- ECharts full: ~400KB
- ECharts modular: ~150KB
- Chart.js: ~65KB
```

### 4. ECharts'da custom theme qanday yaratiladi?

**Javob:**

```javascript
// 1. Theme definition
const customTheme = {
  color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],

  backgroundColor: '#ffffff',

  textStyle: {
    fontFamily: 'Inter, sans-serif',
  },

  title: {
    textStyle: {
      color: '#1F2937',
      fontSize: 16,
      fontWeight: 600,
    },
    subtextStyle: {
      color: '#6B7280',
      fontSize: 12,
    },
  },

  line: {
    itemStyle: {
      borderWidth: 2,
    },
    lineStyle: {
      width: 2,
    },
    symbolSize: 6,
    smooth: true,
  },

  bar: {
    itemStyle: {
      borderRadius: [4, 4, 0, 0],
    },
  },

  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: '#E5E7EB',
      },
    },
    axisTick: {
      lineStyle: {
        color: '#E5E7EB',
      },
    },
    axisLabel: {
      color: '#6B7280',
    },
  },

  valueAxis: {
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      lineStyle: {
        color: '#F3F4F6',
      },
    },
    axisLabel: {
      color: '#6B7280',
    },
  },
};

// 2. Register theme
echarts.registerTheme('custom', customTheme);

// 3. Use theme
const chart = echarts.init(container, 'custom');

// 4. Dark mode support
const darkTheme = {
  ...customTheme,
  backgroundColor: '#1F2937',
  title: {
    textStyle: { color: '#F9FAFB' },
    subtextStyle: { color: '#9CA3AF' },
  },
  // ... dark overrides
};

echarts.registerTheme('custom-dark', darkTheme);

// Dynamic theme switching
const switchTheme = (isDark) => {
  const container = chart.getDom();
  chart.dispose();
  const newChart = echarts.init(
    container,
    isDark ? 'custom-dark' : 'custom'
  );
  newChart.setOption(option);
  return newChart;
};
```

### 5. ECharts'da Server-Side Rendering (SSR) qanday ishlaydi?

**Javob:**

```javascript
// Node.js muhitida SSR
const echarts = require('echarts');
const { createCanvas } = require('canvas');

// 1. Canvas yaratish
const canvas = createCanvas(800, 600);

// 2. ECharts init with canvas
const chart = echarts.init(canvas);

// 3. Option set
chart.setOption({
  title: { text: 'SSR Chart' },
  xAxis: { type: 'category', data: ['A', 'B', 'C'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [10, 20, 30] }],
});

// 4. Export
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('chart.png', buffer);

// Or SVG
const svgStr = chart.renderToSVGString();

// 5. Cleanup
chart.dispose();

// Express.js endpoint
app.get('/chart.png', (req, res) => {
  const canvas = createCanvas(800, 600);
  const chart = echarts.init(canvas);

  chart.setOption(getChartOption(req.query));

  const buffer = canvas.toBuffer('image/png');
  chart.dispose();

  res.set('Content-Type', 'image/png');
  res.send(buffer);
});
```

## Xulosa

ECharts — enterprise-darajadagi vizualizatsiya ehtiyojlari uchun ideal tanlov:

1. **Boy chart turlari** — 50+ turdagi chart
2. **Kuchli performance** — Canvas + WebGL
3. **Server-side rendering** — Node.js support
4. **Bepul** — Apache 2.0 litsenziya
5. **Keng customization** — har jihatni sozlash mumkin

Qachon ishlatish kerak:
- Dashboard loyihalar
- Katta ma'lumotlar
- Geographic visualizations
- Complex interactivity

## Keyingi Qadam

[Highcharts](./03-highcharts.md) — enterprise-ready, tijorat loyihalar uchun.
