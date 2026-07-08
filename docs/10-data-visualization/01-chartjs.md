# Chart.js — Oddiy va Kuchli Vizualizatsiya

## Kirish

Chart.js — eng mashhur open-source JavaScript charting kutubxonasi. 2013-yilda yaratilgan, hozirda GitHub'da 60,000+ star va haftalik 2 million+ npm download. Oddiy API, yaxshi performance va chiroyli default stillar bilan ajralib turadi.

## Nega Chart.js?

### Afzalliklari
```
+ Juda yengil (~65KB gzipped)
+ Oson o'rganish (30 daqiqada boshlash mumkin)
+ Responsive by default
+ Chiroyli animatsiyalar
+ Canvas-based (tez rendering)
+ Keng plugin ekosistemi
+ MIT litsenziya (bepul)
```

### Kamchiliklari
```
- Cheklangan customization (D3 ga nisbatan)
- Murakkab chart turlari yo'q (Sankey, Chord)
- Canvas limitation (SVG export qiyin)
- Large dataset'larda performance muammolar
```

## O'rnatish va Sozlash

### NPM orqali
```bash
npm install chart.js
# Vue uchun wrapper
npm install vue-chartjs
```

### CDN orqali
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

### ES Modules (Tree-shaking)
```javascript
// Faqat kerakli komponentlarni import qilish
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Registratsiya
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);
```

## Asosiy Chart Turlari

### 1. Line Chart — Trend Vizualizatsiya

```javascript
// Vanilla JS
const ctx = document.getElementById('lineChart').getContext('2d');

const lineChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun'],
    datasets: [
      {
        label: '2024 Savdo',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4, // Curved line
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: '2023 Savdo',
        data: [10000, 15000, 13000, 20000, 18000, 24000],
        borderColor: '#9CA3AF',
        borderDash: [5, 5], // Dashed line
        fill: false,
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Oylik Savdo Dinamikasi',
        font: { size: 16, weight: '600' },
      },
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + value.toLocaleString(),
        },
      },
    },
  },
});
```

### 2. Bar Chart — Kategoriyalarni Solishtirish

```javascript
const barChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Elektronika', 'Kiyim', 'Oziq-ovqat', 'Kitoblar', 'Sport'],
    datasets: [
      {
        label: 'Sotilgan',
        data: [450, 320, 280, 150, 200],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  },
  options: {
    indexAxis: 'y', // Horizontal bar chart
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        grid: { display: false },
      },
    },
  },
});
```

### 3. Doughnut/Pie Chart — Ulushlar

```javascript
const doughnutChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [
      {
        data: [55, 35, 10],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        borderWidth: 0,
        cutout: '70%', // Donut hole size
      },
    ],
  },
  options: {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      // Center text plugin
      centerText: {
        display: true,
        text: '100K',
        subtext: 'Jami tashriflar',
      },
    },
  },
});

// Center text uchun custom plugin
const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: (chart) => {
    const { ctx, width, height } = chart;
    const centerConfig = chart.config.options.plugins.centerText;

    if (centerConfig?.display) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Main text
      ctx.font = 'bold 24px Inter';
      ctx.fillStyle = '#1F2937';
      ctx.fillText(centerConfig.text, width / 2, height / 2 - 10);

      // Subtext
      ctx.font = '12px Inter';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(centerConfig.subtext, width / 2, height / 2 + 15);

      ctx.restore();
    }
  },
};

Chart.register(centerTextPlugin);
```

### 4. Area Chart — Kümülatif Ma'lumotlar

```javascript
const areaChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: generateDateLabels(30), // Oxirgi 30 kun
    datasets: [
      {
        label: 'Organic Traffic',
        data: generateRandomData(30, 1000, 3000),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: '#3B82F6',
        order: 2,
      },
      {
        label: 'Paid Traffic',
        data: generateRandomData(30, 500, 1500),
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: '#10B981',
        order: 1,
      },
    ],
  },
  options: {
    plugins: {
      filler: {
        propagate: false, // Stacked effect
      },
    },
    scales: {
      y: {
        stacked: true,
      },
    },
  },
});
```

### 5. Radar Chart — Ko'p O'lchovli Taqqoslash

```javascript
const radarChart = new Chart(ctx, {
  type: 'radar',
  data: {
    labels: ['Tezlik', 'Xavfsizlik', 'UX', 'SEO', 'Performance', 'A11y'],
    datasets: [
      {
        label: 'Bizning Sayt',
        data: [85, 90, 75, 80, 70, 65],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
        pointBackgroundColor: '#3B82F6',
      },
      {
        label: 'Raqobatchi',
        data: [70, 75, 85, 70, 80, 70],
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: '#EF4444',
        pointBackgroundColor: '#EF4444',
      },
    ],
  },
  options: {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
  },
});
```

## Vue.js Integration (vue-chartjs)

### Composables Pattern (Vue 3)

```javascript
// composables/useChart.js
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Chart } from 'chart.js';

export function useChart(canvasRef, config) {
  const chart = ref(null);

  const createChart = () => {
    if (canvasRef.value && !chart.value) {
      chart.value = new Chart(canvasRef.value, config.value);
    }
  };

  const updateChart = () => {
    if (chart.value) {
      chart.value.data = config.value.data;
      chart.value.options = config.value.options;
      chart.value.update('active');
    }
  };

  const destroyChart = () => {
    if (chart.value) {
      chart.value.destroy();
      chart.value = null;
    }
  };

  onMounted(createChart);
  onUnmounted(destroyChart);

  watch(
    () => config.value.data,
    () => updateChart(),
    { deep: true }
  );

  return {
    chart,
    updateChart,
    destroyChart,
  };
}
```

### Reusable Chart Component

```vue
<!-- components/charts/BaseLineChart.vue -->
<template>
  <div class="chart-container" :style="{ height: height + 'px' }">
    <canvas ref="canvasRef"></canvas>
    <div v-if="loading" class="chart-loading">
      <LoadingSpinner />
    </div>
    <div v-if="error" class="chart-error">
      <span>{{ error }}</span>
      <button @click="$emit('retry')">Qayta urinish</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Tree-shakable registration
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps({
  labels: {
    type: Array,
    required: true,
  },
  datasets: {
    type: Array,
    required: true,
  },
  height: {
    type: Number,
    default: 300,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['click', 'hover', 'retry']);

const canvasRef = ref(null);
let chart = null;

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8,
      titleFont: { size: 14, weight: '600' },
      bodyFont: { size: 13 },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
  },
};

const mergedOptions = computed(() => ({
  ...defaultOptions,
  ...props.options,
  onClick: (event, elements) => {
    if (elements.length > 0) {
      const element = elements[0];
      emit('click', {
        datasetIndex: element.datasetIndex,
        index: element.index,
        value: props.datasets[element.datasetIndex].data[element.index],
        label: props.labels[element.index],
      });
    }
  },
}));

const createChart = () => {
  if (!canvasRef.value) return;

  chart = new Chart(canvasRef.value, {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: props.datasets.map(ds => ({
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
        ...ds,
      })),
    },
    options: mergedOptions.value,
  });
};

const updateChart = () => {
  if (!chart) return;

  chart.data.labels = props.labels;
  chart.data.datasets = props.datasets.map(ds => ({
    tension: 0.4,
    pointRadius: 3,
    pointHoverRadius: 6,
    borderWidth: 2,
    ...ds,
  }));
  chart.options = mergedOptions.value;
  chart.update('active');
};

const destroyChart = () => {
  if (chart) {
    chart.destroy();
    chart = null;
  }
};

// Lifecycle
onMounted(createChart);
onUnmounted(destroyChart);

// Reactivity
watch(
  () => [props.labels, props.datasets],
  () => {
    if (chart) {
      updateChart();
    }
  },
  { deep: true }
);

// Export methods
defineExpose({
  getChart: () => chart,
  update: updateChart,
  reset: () => {
    destroyChart();
    createChart();
  },
});
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
}

.chart-loading,
.chart-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
}

.chart-error {
  flex-direction: column;
  gap: 12px;
  color: #ef4444;
}
</style>
```

### Dashboard'da Ishlatish

```vue
<!-- pages/Dashboard.vue -->
<template>
  <div class="dashboard-grid">
    <div class="card">
      <h3>Oylik Daromad</h3>
      <BaseLineChart
        :labels="revenueData.labels"
        :datasets="revenueData.datasets"
        :loading="isLoading"
        :error="error"
        :height="280"
        @click="handleChartClick"
        @retry="fetchData"
      />
    </div>

    <div class="card">
      <h3>Kategoriyalar</h3>
      <BaseDoughnutChart
        :labels="categoryData.labels"
        :data="categoryData.values"
        :height="280"
      />
    </div>

    <div class="card span-2">
      <h3>Trafik Manbaalari</h3>
      <BaseBarChart
        :labels="trafficData.labels"
        :datasets="trafficData.datasets"
        :height="250"
        horizontal
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAnalyticsStore } from '@/stores/analytics';
import BaseLineChart from '@/components/charts/BaseLineChart.vue';
import BaseDoughnutChart from '@/components/charts/BaseDoughnutChart.vue';
import BaseBarChart from '@/components/charts/BaseBarChart.vue';

const store = useAnalyticsStore();

const isLoading = ref(true);
const error = ref(null);

const revenueData = computed(() => ({
  labels: store.monthlyRevenue.map(d => d.month),
  datasets: [
    {
      label: 'Daromad',
      data: store.monthlyRevenue.map(d => d.value),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
    },
    {
      label: 'Maqsad',
      data: store.monthlyRevenue.map(d => d.target),
      borderColor: '#10B981',
      borderDash: [5, 5],
    },
  ],
}));

const categoryData = computed(() => ({
  labels: store.categories.map(c => c.name),
  values: store.categories.map(c => c.sales),
}));

const trafficData = computed(() => ({
  labels: store.trafficSources.map(t => t.source),
  datasets: [
    {
      label: 'Tashriflar',
      data: store.trafficSources.map(t => t.visits),
      backgroundColor: '#3B82F6',
    },
  ],
}));

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    await store.fetchAnalytics();
  } catch (e) {
    error.value = 'Ma\'lumotlarni yuklashda xatolik';
  } finally {
    isLoading.value = false;
  }
};

const handleChartClick = (data) => {
  console.log('Clicked:', data);
  // Drill-down logic
};

onMounted(fetchData);
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.span-2 {
  grid-column: span 2;
}
</style>
```

## Custom Plugins

### 1. Watermark Plugin

```javascript
const watermarkPlugin = {
  id: 'watermark',
  beforeDraw: (chart) => {
    const { ctx, chartArea: { left, top, width, height } } = chart;

    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Diagonal watermark
    ctx.translate(left + width / 2, top + height / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.fillText('CONFIDENTIAL', 0, 0);

    ctx.restore();
  },
};

Chart.register(watermarkPlugin);
```

### 2. Threshold Line Plugin

```javascript
const thresholdPlugin = {
  id: 'threshold',
  afterDatasetsDraw: (chart) => {
    const threshold = chart.options.plugins.threshold;
    if (!threshold?.value) return;

    const { ctx, chartArea: { left, right }, scales: { y } } = chart;
    const yPosition = y.getPixelForValue(threshold.value);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(left, yPosition);
    ctx.lineTo(right, yPosition);
    ctx.strokeStyle = threshold.color || '#EF4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();

    // Label
    ctx.fillStyle = threshold.color || '#EF4444';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(threshold.label || 'Threshold', right, yPosition - 5);

    ctx.restore();
  },
};

// Ishlatish
new Chart(ctx, {
  type: 'line',
  data: { /* ... */ },
  options: {
    plugins: {
      threshold: {
        value: 500,
        color: '#EF4444',
        label: 'Kritik chegara',
      },
    },
  },
});
```

### 3. Data Labels Plugin

```javascript
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

const config = {
  type: 'bar',
  data: { /* ... */ },
  options: {
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (value) => {
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
          }
          return value;
        },
        font: {
          weight: 'bold',
          size: 11,
        },
        color: '#374151',
      },
    },
  },
};
```

## Real-World Case Studies

### Case 1: Simple Sales Chart

```javascript
// Oddiy savdo statistikasi
const salesChart = {
  type: 'line',
  data: {
    labels: getLast7Days(),
    datasets: [{
      label: 'Savdo ($)',
      data: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
    }],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => '$' + value,
        },
      },
    },
  },
};
```

### Case 2: Complex Dashboard Widget

```javascript
// Multi-metric widget
const dashboardWidget = {
  type: 'line',
  data: {
    labels: generateHourlyLabels(24),
    datasets: [
      {
        label: 'CPU',
        data: cpuMetrics,
        borderColor: '#3B82F6',
        yAxisID: 'y',
      },
      {
        label: 'Memory',
        data: memoryMetrics,
        borderColor: '#10B981',
        yAxisID: 'y',
      },
      {
        label: 'Requests',
        data: requestMetrics,
        borderColor: '#F59E0B',
        yAxisID: 'y1',
        type: 'bar',
      },
    ],
  },
  options: {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Server Metrics (Last 24h)',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label;
            const value = context.parsed.y;

            if (label === 'Requests') {
              return `${label}: ${value.toLocaleString()} req`;
            }
            return `${label}: ${value}%`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Percentage (%)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        title: {
          display: true,
          text: 'Requests',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  },
};
```

### Case 3: Custom Infographic Style

```javascript
// Infographic-style gauge
const gaugeChart = {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [75, 25], // 75% to'ldirilgan
      backgroundColor: [
        createGradient('#3B82F6', '#10B981'),
        '#E5E7EB',
      ],
      borderWidth: 0,
      cutout: '85%',
      circumference: 270,
      rotation: 225,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  },
  plugins: [{
    id: 'gaugeNeedle',
    afterDatasetsDraw: (chart) => {
      const { ctx, chartArea } = chart;
      const centerX = chartArea.width / 2 + chartArea.left;
      const centerY = chartArea.height / 2 + chartArea.top + 30;

      // Percentage text
      ctx.save();
      ctx.font = 'bold 48px Inter';
      ctx.fillStyle = '#1F2937';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('75%', centerX, centerY - 20);

      ctx.font = '14px Inter';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('Performance Score', centerX, centerY + 20);
      ctx.restore();
    },
  }],
};

function createGradient(color1, color2) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 200, 0);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}
```

## Performance Optimization

### 1. Decimation — Ma'lumotlarni Kamaytirish

```javascript
import { Chart } from 'chart.js';
import decimation from 'chartjs-plugin-decimation';

Chart.register(decimation);

const config = {
  type: 'line',
  data: {
    datasets: [{
      label: 'Large Dataset',
      data: generateData(100000), // 100K points
      borderColor: '#3B82F6',
    }],
  },
  options: {
    parsing: false, // Raw data format
    normalized: true,
    plugins: {
      decimation: {
        enabled: true,
        algorithm: 'lttb', // Largest Triangle Three Buckets
        samples: 500, // Render only 500 points
      },
    },
    scales: {
      x: {
        type: 'time',
      },
    },
  },
};
```

### 2. Lazy Animation

```javascript
const config = {
  type: 'bar',
  data: { /* ... */ },
  options: {
    animation: {
      // Faqat birinchi marta animate
      onComplete: (animation) => {
        animation.chart.options.animation = false;
      },
      duration: 750,
      easing: 'easeOutQuart',
    },
    // Update'larda animation yo'q
    transitions: {
      active: {
        animation: {
          duration: 0,
        },
      },
    },
  },
};
```

### 3. Memory Management

```javascript
// Component unmount'da tozalash
const charts = new Map();

function createChart(id, config) {
  // Eski chart'ni yo'q qilish
  if (charts.has(id)) {
    charts.get(id).destroy();
  }

  const canvas = document.getElementById(id);
  const chart = new Chart(canvas, config);
  charts.set(id, chart);

  return chart;
}

function destroyAllCharts() {
  charts.forEach(chart => chart.destroy());
  charts.clear();
}

// Vue/React cleanup
onUnmounted(() => {
  destroyAllCharts();
});
```

### 4. Efficient Updates

```javascript
// YOMON: har update'da qayta yaratish
function updateBad(newData) {
  chart.destroy();
  chart = new Chart(ctx, { ...config, data: newData });
}

// YAXSHI: data replacement
function updateGood(newData) {
  chart.data.labels = newData.labels;
  chart.data.datasets[0].data = newData.values;
  chart.update('none'); // Animation yo'q
}

// ENG YAXSHI: selective update
function updateBest(newData, datasetIndex = 0) {
  const dataset = chart.data.datasets[datasetIndex];

  // Faqat o'zgargan qismni yangilash
  newData.forEach((value, index) => {
    if (dataset.data[index] !== value) {
      dataset.data[index] = value;
    }
  });

  chart.update('active'); // Smooth animation
}
```

## Accessibility Best Practices

```javascript
const accessibleChart = {
  type: 'bar',
  data: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Daromad (million $)',
      data: [12, 19, 15, 25],
      backgroundColor: '#3B82F6',
      // Pattern uchun (colorblind)
      borderColor: '#1D4ED8',
      borderWidth: 2,
    }],
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: '2024-yil choraklik daromad', // Screen reader uchun
      },
      legend: {
        labels: {
          generateLabels: (chart) => {
            const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);
            return original.map(label => ({
              ...label,
              // ARIA label
              text: `${label.text}: ${chart.data.datasets[label.datasetIndex].data.reduce((a, b) => a + b, 0)} million dollar jami`,
            }));
          },
        },
      },
    },
  },
  plugins: [{
    id: 'a11y',
    afterRender: (chart) => {
      // Canvas'ga role va aria-label qo'shish
      chart.canvas.setAttribute('role', 'img');
      chart.canvas.setAttribute(
        'aria-label',
        generateChartDescription(chart)
      );
    },
  }],
};

function generateChartDescription(chart) {
  const { datasets, labels } = chart.data;
  const ds = datasets[0];
  const total = ds.data.reduce((a, b) => a + b, 0);
  const max = Math.max(...ds.data);
  const maxIndex = ds.data.indexOf(max);

  return `${chart.options.plugins.title.text}. ` +
    `Jami: ${total} million dollar. ` +
    `Eng yuqori: ${labels[maxIndex]} - ${max} million dollar.`;
}
```

## Interview Savollari

### 1. Chart.js Canvas vs SVG asosida ishlaydi. Bu qanday afzallik va kamchiliklar beradi?

**Javob:**

Canvas afzalliklari:
- **Performance:** Minglab data point'larni tez render qiladi
- **Memory:** DOM elementi yo'q, kam xotira ishlatadi
- **Animation:** Smooth animatsiyalar oson

Canvas kamchiliklari:
- **Accessibility:** Individual elementlarga kirish qiyin
- **Event handling:** Hit detection murakkab
- **Export:** SVG/PDF export uchun qo'shimcha qadam kerak
- **Resolution:** Retina display'larda blurry bo'lishi mumkin

```javascript
// Canvas resolution fix
const dpr = window.devicePixelRatio || 1;
canvas.width = width * dpr;
canvas.height = height * dpr;
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';
ctx.scale(dpr, dpr);
```

### 2. Chart.js'da real-time data streaming qanday implementatsiya qilinadi?

**Javob:**

```javascript
const streamingChart = {
  type: 'line',
  data: {
    datasets: [{
      label: 'Real-time',
      data: [],
      borderColor: '#3B82F6',
    }],
  },
  options: {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          duration: 20000, // 20 sekund ko'rsatish
          refresh: 1000, // Har sekundda yangilash
          delay: 1000, // 1 sekund kechikish
          onRefresh: (chart) => {
            chart.data.datasets.forEach(dataset => {
              dataset.data.push({
                x: Date.now(),
                y: Math.random() * 100,
              });
            });
          },
        },
      },
    },
  },
};

// chartjs-plugin-streaming kerak
import 'chartjs-adapter-date-fns';
import StreamingPlugin from 'chartjs-plugin-streaming';
Chart.register(StreamingPlugin);
```

### 3. Chart.js'da memory leak oldini olish uchun nima qilish kerak?

**Javob:**

```javascript
class ChartManager {
  constructor() {
    this.instances = new WeakMap();
  }

  create(canvas, config) {
    // Mavjud chart'ni yo'q qilish
    this.destroy(canvas);

    const chart = new Chart(canvas, config);
    this.instances.set(canvas, chart);

    return chart;
  }

  destroy(canvas) {
    const existing = this.instances.get(canvas);
    if (existing) {
      existing.destroy();
      this.instances.delete(canvas);
    }
  }

  destroyAll() {
    // WeakMap automatic garbage collection qiladi
    // Lekin explicit destroy qilish yaxshiroq
  }
}

// Vue Composition API pattern
export function useChart() {
  const chartRef = ref(null);
  const chartInstance = ref(null);

  const create = (config) => {
    destroy();
    chartInstance.value = new Chart(chartRef.value, config);
  };

  const destroy = () => {
    chartInstance.value?.destroy();
    chartInstance.value = null;
  };

  // MUHIM: Component unmount'da destroy
  onUnmounted(destroy);

  return { chartRef, chartInstance, create, destroy };
}
```

### 4. Chart.js'da custom tooltip qanday yaratiladi?

**Javob:**

```javascript
const customTooltip = {
  options: {
    plugins: {
      tooltip: {
        enabled: false, // Default tooltip o'chirish
        external: (context) => {
          const { chart, tooltip } = context;

          // Tooltip container
          let container = document.getElementById('custom-tooltip');
          if (!container) {
            container = document.createElement('div');
            container.id = 'custom-tooltip';
            container.innerHTML = '<table></table>';
            document.body.appendChild(container);
          }

          // Hide if no tooltip
          if (tooltip.opacity === 0) {
            container.style.opacity = 0;
            return;
          }

          // Set content
          if (tooltip.body) {
            const titleLines = tooltip.title || [];
            const bodyLines = tooltip.body.map(b => b.lines);

            let html = '<thead>';
            titleLines.forEach(title => {
              html += `<tr><th>${title}</th></tr>`;
            });
            html += '</thead><tbody>';

            bodyLines.forEach((body, i) => {
              const colors = tooltip.labelColors[i];
              const style = `background:${colors.backgroundColor};border-color:${colors.borderColor}`;
              html += `<tr><td><span class="dot" style="${style}"></span>${body}</td></tr>`;
            });
            html += '</tbody>';

            container.querySelector('table').innerHTML = html;
          }

          // Position
          const { offsetLeft, offsetTop } = chart.canvas;
          container.style.opacity = 1;
          container.style.left = offsetLeft + tooltip.caretX + 'px';
          container.style.top = offsetTop + tooltip.caretY + 'px';
        },
      },
    },
  },
};
```

### 5. Chart.js v4 ning v3 dan asosiy farqlari nimada?

**Javob:**

```javascript
// V3 → V4 o'zgarishlar:

// 1. Tree-shaking majburiy
// V3 - hammasi avtomatik register
import Chart from 'chart.js/auto';

// V4 - faqat kerakli modullar
import { Chart, LineController, LineElement } from 'chart.js';
Chart.register(LineController, LineElement);

// 2. Scales configuration
// V3
scales: {
  xAxes: [{ type: 'linear' }],
  yAxes: [{ type: 'linear' }],
}

// V4
scales: {
  x: { type: 'linear' },
  y: { type: 'linear' },
}

// 3. Tooltip callbacks
// V3
callbacks: {
  label: (tooltipItem, data) => { ... }
}

// V4
callbacks: {
  label: (context) => {
    const { dataset, parsed, dataIndex } = context;
  }
}

// 4. Plugin hooks
// V3 - afterInit, beforeUpdate, etc.
// V4 - yangi hooks: beforeBuildTicks, afterBuildTicks

// 5. TypeScript support
// V4 da to'liq TypeScript types
import type { ChartConfiguration, ChartData } from 'chart.js';
```

## Xulosa

Chart.js — boshlang'ich va o'rta darajadagi loyihalar uchun ideal tanlov. Uning kuchli tomonlari:

1. **Oson o'rganish** — 30 daqiqada birinchi chart
2. **Yaxshi performance** — Canvas-based rendering
3. **Responsive** — out-of-the-box mobile support
4. **Plugin ekosistemi** — kengaytirish oson
5. **Bepul** — MIT litsenziya

Murakkab vizualizatsiyalar yoki katta ma'lumotlar uchun ECharts yoki D3.js ko'rib chiqing.

## Keyingi Qadam

[ECharts](./02-echarts.md) — ko'proq chart turlari va murakkab interaktivlik uchun.
