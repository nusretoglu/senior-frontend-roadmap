# Data Visualization Performance Optimization

## Kirish

Vizualizatsiya performance — foydalanuvchi tajribasi uchun kritik. 60 FPS (16ms per frame) maqsad, lekin katta ma'lumotlar bilan bu qiyin. Bu bo'limda barcha kutubxonalar uchun umumiy va maxsus optimizatsiya texnikalarini ko'rib chiqamiz.

## Performance Metrics

### Asosiy Ko'rsatkichlar

```javascript
// Performance o'lchash
const measurePerformance = {
  // Frame rate
  fps: () => {
    let frames = 0;
    let lastTime = performance.now();

    function tick() {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        console.log(`FPS: ${frames}`);
        frames = 0;
        lastTime = now;
      }
      requestAnimationFrame(tick);
    }
    tick();
  },

  // Render time
  renderTime: (fn) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`Render time: ${end - start}ms`);
  },

  // Memory usage
  memory: () => {
    if (performance.memory) {
      const mb = bytes => (bytes / 1024 / 1024).toFixed(2);
      console.log({
        used: mb(performance.memory.usedJSHeapSize) + 'MB',
        total: mb(performance.memory.totalJSHeapSize) + 'MB',
        limit: mb(performance.memory.jsHeapSizeLimit) + 'MB',
      });
    }
  },
};
```

### Performance Budget

```
Target FPS: 60 (16ms per frame)
Acceptable FPS: 30 (33ms per frame)
Warning FPS: < 20

Initial render:
- Small data (<1K): < 100ms
- Medium data (1K-10K): < 500ms
- Large data (10K+): < 2s (with loading indicator)

Interaction (hover, zoom):
- Response time: < 100ms
- Animation: Smooth (no jank)
```

## Umumiy Optimizatsiya Texnikalari

### 1. Data Preprocessing

```javascript
// Server-side aggregation
// Katta ma'lumotlarni server'da qayta ishlash

// Backend API
app.get('/api/chart-data', async (req, res) => {
  const { granularity, dateRange } = req.query;

  // Raw data: 1M rows
  // Aggregated: 1K rows

  const data = await db.query(`
    SELECT
      DATE_TRUNC('${granularity}', timestamp) as period,
      AVG(value) as avg_value,
      SUM(count) as total_count
    FROM metrics
    WHERE timestamp BETWEEN $1 AND $2
    GROUP BY period
    ORDER BY period
  `, [dateRange.start, dateRange.end]);

  res.json(data);
});

// Client-side downsampling
function downsample(data, targetPoints) {
  if (data.length <= targetPoints) return data;

  const factor = Math.ceil(data.length / targetPoints);
  const result = [];

  for (let i = 0; i < data.length; i += factor) {
    const chunk = data.slice(i, i + factor);
    result.push({
      x: chunk[0].x,
      y: d3.mean(chunk, d => d.y),
    });
  }

  return result;
}
```

### 2. LTTB (Largest Triangle Three Buckets) Algorithm

```javascript
// Vizual sifatni saqlagan holda nuqtalarni kamaytirish
function LTTB(data, threshold) {
  if (data.length <= threshold) return data;

  const sampled = [];
  const bucketSize = (data.length - 2) / (threshold - 2);

  // Always keep first point
  sampled.push(data[0]);

  let a = 0; // Previous selected point

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate bucket range
    const bucketStart = Math.floor((i + 1) * bucketSize) + 1;
    const bucketEnd = Math.floor((i + 2) * bucketSize) + 1;
    const bucketEndClamped = Math.min(bucketEnd, data.length);

    // Calculate average point in next bucket
    let avgX = 0, avgY = 0;
    const nextBucketStart = Math.floor((i + 2) * bucketSize) + 1;
    const nextBucketEnd = Math.min(Math.floor((i + 3) * bucketSize) + 1, data.length);
    const nextBucketSize = nextBucketEnd - nextBucketStart;

    for (let j = nextBucketStart; j < nextBucketEnd; j++) {
      avgX += data[j].x;
      avgY += data[j].y;
    }
    avgX /= nextBucketSize;
    avgY /= nextBucketSize;

    // Find point with largest triangle area
    let maxArea = -1;
    let maxIndex = bucketStart;

    for (let j = bucketStart; j < bucketEndClamped; j++) {
      const area = Math.abs(
        (data[a].x - avgX) * (data[j].y - data[a].y) -
        (data[a].x - data[j].x) * (avgY - data[a].y)
      );
      if (area > maxArea) {
        maxArea = area;
        maxIndex = j;
      }
    }

    sampled.push(data[maxIndex]);
    a = maxIndex;
  }

  // Always keep last point
  sampled.push(data[data.length - 1]);

  return sampled;
}

// Ishlatish
const fullData = generateData(100000); // 100K points
const sampledData = LTTB(fullData, 500); // 500 pointga kamaytirish
```

### 3. Virtual Scrolling

```javascript
// Faqat ko'rinadigan qismni render qilish
class VirtualizedChart {
  constructor(container, data, options = {}) {
    this.container = container;
    this.fullData = data;
    this.pointWidth = options.pointWidth || 10;
    this.visibleBuffer = options.buffer || 50;

    this.setup();
  }

  setup() {
    const containerWidth = this.container.offsetWidth;
    const totalWidth = this.fullData.length * this.pointWidth;

    // Scrollable wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.style.cssText = `
      overflow-x: auto;
      position: relative;
    `;

    // Placeholder for total width
    this.placeholder = document.createElement('div');
    this.placeholder.style.width = totalWidth + 'px';
    this.placeholder.style.height = '1px';

    // Canvas for visible data
    this.canvas = document.createElement('canvas');
    this.canvas.width = containerWidth;
    this.canvas.height = this.container.offsetHeight;
    this.canvas.style.position = 'sticky';
    this.canvas.style.left = '0';

    this.wrapper.appendChild(this.placeholder);
    this.wrapper.appendChild(this.canvas);
    this.container.appendChild(this.wrapper);

    this.ctx = this.canvas.getContext('2d');

    // Scroll handler
    this.wrapper.addEventListener('scroll', () => {
      this.render();
    });

    this.render();
  }

  render() {
    const scrollLeft = this.wrapper.scrollLeft;
    const containerWidth = this.canvas.width;

    // Calculate visible range
    const startIndex = Math.max(
      0,
      Math.floor(scrollLeft / this.pointWidth) - this.visibleBuffer
    );
    const endIndex = Math.min(
      this.fullData.length,
      Math.ceil((scrollLeft + containerWidth) / this.pointWidth) + this.visibleBuffer
    );

    // Get visible data
    const visibleData = this.fullData.slice(startIndex, endIndex);

    // Clear and render
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderData(visibleData, startIndex);
  }

  renderData(data, startIndex) {
    const { ctx, canvas, pointWidth } = this;
    const scrollLeft = this.wrapper.scrollLeft;

    ctx.beginPath();
    data.forEach((d, i) => {
      const x = (startIndex + i) * pointWidth - scrollLeft;
      const y = canvas.height - d.value;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
}
```

### 4. Canvas vs SVG Selection

```javascript
// Auto-select renderer based on data size
function selectRenderer(dataSize, requirements) {
  const thresholds = {
    svg: 1000,      // < 1K: SVG yaxshi
    canvas: 10000,  // 1K-10K: Canvas
    webgl: 100000,  // > 10K: WebGL
  };

  // Requirements override
  if (requirements.accessibility) {
    return dataSize < thresholds.svg ? 'svg' : 'canvas-with-overlay';
  }

  if (requirements.export) {
    return 'svg'; // SVG export oson
  }

  // Performance-based selection
  if (dataSize < thresholds.svg) return 'svg';
  if (dataSize < thresholds.webgl) return 'canvas';
  return 'webgl';
}

// Canvas rendering
function renderWithCanvas(ctx, data, scales) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.beginPath();
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 2;

  data.forEach((d, i) => {
    const x = scales.x(d.x);
    const y = scales.y(d.y);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

// WebGL rendering (with regl)
import createREGL from 'regl';

const regl = createREGL(canvas);

const drawPoints = regl({
  vert: `
    attribute vec2 position;
    uniform float pointSize;
    void main() {
      gl_Position = vec4(position, 0, 1);
      gl_PointSize = pointSize;
    }
  `,
  frag: `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }
  `,
  attributes: {
    position: regl.prop('positions'),
  },
  uniforms: {
    pointSize: 4.0,
    color: [0.23, 0.51, 0.96, 1.0], // #3B82F6
  },
  count: regl.prop('count'),
  primitive: 'points',
});

// Render
drawPoints({
  positions: transformedData,
  count: data.length,
});
```

### 5. Web Workers for Heavy Computation

```javascript
// main.js
class ChartWorker {
  constructor() {
    this.worker = new Worker('chart-worker.js');
    this.pending = new Map();
    this.nextId = 0;

    this.worker.onmessage = (e) => {
      const { id, result } = e.data;
      const resolve = this.pending.get(id);
      if (resolve) {
        resolve(result);
        this.pending.delete(id);
      }
    };
  }

  async process(operation, data) {
    const id = this.nextId++;

    return new Promise((resolve) => {
      this.pending.set(id, resolve);
      this.worker.postMessage({ id, operation, data });
    });
  }

  async aggregate(data, groupBy) {
    return this.process('aggregate', { data, groupBy });
  }

  async downsample(data, targetPoints) {
    return this.process('downsample', { data, targetPoints });
  }

  async statistics(data) {
    return this.process('statistics', { data });
  }
}

// chart-worker.js
self.onmessage = function(e) {
  const { id, operation, data } = e.data;

  let result;
  switch (operation) {
    case 'aggregate':
      result = aggregateData(data.data, data.groupBy);
      break;
    case 'downsample':
      result = LTTB(data.data, data.targetPoints);
      break;
    case 'statistics':
      result = calculateStatistics(data.data);
      break;
  }

  self.postMessage({ id, result });
};

function aggregateData(data, groupBy) {
  const groups = {};
  data.forEach(d => {
    const key = d[groupBy];
    if (!groups[key]) groups[key] = [];
    groups[key].push(d);
  });

  return Object.entries(groups).map(([key, values]) => ({
    [groupBy]: key,
    count: values.length,
    sum: values.reduce((acc, v) => acc + v.value, 0),
    avg: values.reduce((acc, v) => acc + v.value, 0) / values.length,
  }));
}

// Ishlatish
const worker = new ChartWorker();

async function renderChart() {
  showLoading();

  // Heavy computation worker'da
  const processedData = await worker.downsample(rawData, 1000);
  const stats = await worker.statistics(rawData);

  hideLoading();
  renderWithData(processedData, stats);
}
```

### 6. RequestAnimationFrame Optimization

```javascript
// Throttled rendering
class OptimizedChart {
  constructor(container) {
    this.container = container;
    this.pendingRender = false;
    this.renderScheduled = false;
  }

  scheduleRender() {
    if (this.renderScheduled) return;

    this.renderScheduled = true;
    requestAnimationFrame(() => {
      this.render();
      this.renderScheduled = false;
    });
  }

  // Debounced resize
  handleResize = debounce(() => {
    this.updateDimensions();
    this.scheduleRender();
  }, 100);

  // Throttled mouse move
  handleMouseMove = throttle((event) => {
    this.updateTooltip(event);
  }, 16); // ~60fps

  render() {
    // Actual rendering logic
  }
}

// Utility functions
function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

### 7. Memory Management

```javascript
// Proper cleanup
class ChartManager {
  constructor() {
    this.charts = new Map();
    this.eventListeners = new Map();
  }

  create(id, config) {
    // Eski chart'ni tozalash
    this.destroy(id);

    const chart = createChart(config);
    this.charts.set(id, chart);

    // Event listener'larni track qilish
    const listeners = [];
    this.eventListeners.set(id, listeners);

    return chart;
  }

  destroy(id) {
    // Chart instance
    const chart = this.charts.get(id);
    if (chart) {
      chart.destroy?.();
      this.charts.delete(id);
    }

    // Event listeners
    const listeners = this.eventListeners.get(id);
    if (listeners) {
      listeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.eventListeners.delete(id);
    }
  }

  destroyAll() {
    this.charts.forEach((_, id) => this.destroy(id));
  }

  // Memory monitoring
  checkMemory() {
    if (performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const limit = performance.memory.jsHeapSizeLimit;

      if (used / limit > 0.9) {
        console.warn('High memory usage detected');
        this.gc();
      }
    }
  }

  gc() {
    // Destroy unused charts
    // Clear caches
    // Force garbage collection (if available)
  }
}

// Vue composable with cleanup
export function useChart(containerRef) {
  const chartInstance = shallowRef(null);

  const createChart = (options) => {
    if (chartInstance.value) {
      chartInstance.value.destroy();
    }
    chartInstance.value = new Chart(containerRef.value, options);
  };

  // Auto cleanup
  onUnmounted(() => {
    chartInstance.value?.destroy();
    chartInstance.value = null;
  });

  return { chartInstance, createChart };
}
```

## Kutubxona-Specific Optimizatsiyalar

### Chart.js

```javascript
// 1. Decimation plugin
import { Chart } from 'chart.js';
import decimation from 'chartjs-plugin-decimation';

Chart.register(decimation);

const config = {
  type: 'line',
  data: largeDataset,
  options: {
    parsing: false, // Raw data format
    normalized: true,
    plugins: {
      decimation: {
        enabled: true,
        algorithm: 'lttb',
        samples: 500,
      },
    },
  },
};

// 2. Animation optimization
const performanceConfig = {
  animation: {
    duration: 0, // Disable animation
  },
  // Or limit animation
  transitions: {
    active: {
      animation: {
        duration: 0,
      },
    },
  },
  elements: {
    point: {
      radius: 0, // Hide points
      hoverRadius: 6, // Show on hover only
    },
    line: {
      tension: 0, // Straight lines (faster)
    },
  },
};

// 3. Efficient updates
function efficientUpdate(chart, newData) {
  // Direct data replacement
  chart.data.datasets[0].data = newData;
  chart.update('none'); // No animation
}
```

### ECharts

```javascript
// 1. Large mode
const largeOption = {
  series: [{
    type: 'scatter',
    large: true,
    largeThreshold: 2000,
    data: largeData,
    symbolSize: 2,
  }],
};

// 2. Progressive rendering
const progressiveOption = {
  series: [{
    type: 'scatter',
    progressive: 400,
    progressiveThreshold: 3000,
    data: veryLargeData,
  }],
};

// 3. WebGL renderer
import 'echarts-gl';

const webglOption = {
  series: [{
    type: 'scatterGL',
    data: massiveData,
    symbolSize: 2,
  }],
};

// 4. Efficient updates
function efficientUpdate(chart, newData) {
  chart.setOption({
    series: [{ data: newData }],
  }, {
    notMerge: false,
    lazyUpdate: true,
    silent: true, // No events
  });
}

// 5. Batch updates
function batchUpdate(chart, updates) {
  const options = updates.reduce((acc, { seriesIndex, data }) => {
    if (!acc.series) acc.series = [];
    acc.series[seriesIndex] = { data };
    return acc;
  }, {});

  chart.setOption(options, {
    replaceMerge: ['series'],
    lazyUpdate: true,
  });
}
```

### Highcharts

```javascript
// 1. Boost module
import Highcharts from 'highcharts';
import Boost from 'highcharts/modules/boost';

Boost(Highcharts);

const boostedConfig = {
  boost: {
    useGPUTranslations: true,
    usePreallocated: true,
    seriesThreshold: 1,
  },
  series: [{
    boostThreshold: 1,
    data: hugeDataset,
  }],
};

// 2. Turbo threshold
const turboConfig = {
  plotOptions: {
    series: {
      turboThreshold: 0, // Unlimited
    },
  },
};

// 3. Efficient point update
function addPoint(chart, seriesIndex, point, shift = true) {
  chart.series[seriesIndex].addPoint(point, false, shift);
  chart.redraw(false); // No animation
}

// 4. Batch point updates
function batchAddPoints(chart, points) {
  points.forEach(({ seriesIndex, point }) => {
    chart.series[seriesIndex].addPoint(point, false, true);
  });
  chart.redraw(false);
}
```

### D3.js

```javascript
// 1. Canvas rendering
function renderWithCanvas(data) {
  const canvas = document.getElementById('chart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // High DPI support
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);

  // Render
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  data.forEach((d, i) => {
    const x = xScale(d.x);
    const y = yScale(d.y);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

// 2. Quadtree for fast lookups
const quadtree = d3.quadtree()
  .x(d => d.x)
  .y(d => d.y)
  .addAll(data);

// Fast nearest neighbor search
function findNearest(mouseX, mouseY, radius) {
  return quadtree.find(mouseX, mouseY, radius);
}

// 3. Efficient joins
function efficientJoin(svg, data) {
  svg.selectAll('circle')
    .data(data, d => d.id) // Key function
    .join(
      enter => enter.append('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 0)
        .call(enter => enter.transition()
          .attr('r', 5)),
      update => update
        .call(update => update.transition()
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))),
      exit => exit
        .call(exit => exit.transition()
          .attr('r', 0)
          .remove())
    );
}

// 4. Object pooling
class CirclePool {
  constructor(svg, maxSize = 1000) {
    this.svg = svg;
    this.pool = [];
    this.active = new Set();

    // Pre-create circles
    for (let i = 0; i < maxSize; i++) {
      const circle = svg.append('circle')
        .attr('display', 'none');
      this.pool.push(circle);
    }
  }

  acquire() {
    const circle = this.pool.pop();
    if (circle) {
      circle.attr('display', null);
      this.active.add(circle);
      return circle;
    }
    return null;
  }

  release(circle) {
    circle.attr('display', 'none');
    this.active.delete(circle);
    this.pool.push(circle);
  }

  releaseAll() {
    this.active.forEach(circle => this.release(circle));
  }
}
```

## Real-time Streaming Optimization

```javascript
// Ring buffer for streaming data
class RingBuffer {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.data = new Array(maxSize);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  push(item) {
    this.data[this.tail] = item;
    this.tail = (this.tail + 1) % this.maxSize;

    if (this.size < this.maxSize) {
      this.size++;
    } else {
      this.head = (this.head + 1) % this.maxSize;
    }
  }

  toArray() {
    const result = [];
    for (let i = 0; i < this.size; i++) {
      result.push(this.data[(this.head + i) % this.maxSize]);
    }
    return result;
  }
}

// Streaming chart
class StreamingChart {
  constructor(container, options = {}) {
    this.buffer = new RingBuffer(options.bufferSize || 1000);
    this.batchSize = options.batchSize || 10;
    this.renderInterval = options.renderInterval || 100;
    this.pendingData = [];

    this.setup(container);
    this.startRenderLoop();
  }

  setup(container) {
    // Chart initialization
  }

  addPoint(point) {
    this.pendingData.push(point);
  }

  startRenderLoop() {
    setInterval(() => {
      if (this.pendingData.length === 0) return;

      // Batch process pending data
      const batch = this.pendingData.splice(0, this.batchSize);
      batch.forEach(point => this.buffer.push(point));

      // Render
      this.render(this.buffer.toArray());
    }, this.renderInterval);
  }

  render(data) {
    // Render logic with Canvas
  }
}

// WebSocket integration
const ws = new WebSocket('wss://api.example.com/stream');
const chart = new StreamingChart('#chart', {
  bufferSize: 500,
  batchSize: 20,
  renderInterval: 50, // 20 FPS
});

ws.onmessage = (event) => {
  const point = JSON.parse(event.data);
  chart.addPoint(point);
};
```

## Mobile Performance

```javascript
// Mobile-specific optimizations
const mobileConfig = {
  // Reduce points
  decimation: {
    enabled: true,
    samples: window.innerWidth < 768 ? 100 : 500,
  },

  // Disable animations
  animation: window.innerWidth < 768 ? false : true,

  // Simplify interactions
  interaction: {
    mode: window.innerWidth < 768 ? 'nearest' : 'index',
    intersect: window.innerWidth < 768,
  },

  // Reduce visual complexity
  elements: {
    point: {
      radius: window.innerWidth < 768 ? 0 : 4,
    },
    line: {
      borderWidth: window.innerWidth < 768 ? 1 : 2,
    },
  },
};

// Touch optimization
const touchConfig = {
  events: ['touchstart', 'touchmove', 'touchend'],
  hover: { mode: null }, // Disable hover on mobile
};

// Lazy loading for mobile
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      initChart(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { rootMargin: '100px' });

document.querySelectorAll('.chart-container').forEach(container => {
  observer.observe(container);
});
```

## Debugging Performance Issues

```javascript
// Performance profiler
class ChartProfiler {
  constructor(chart) {
    this.chart = chart;
    this.metrics = [];
  }

  start(label) {
    this.currentLabel = label;
    this.startTime = performance.now();
    this.startMemory = performance.memory?.usedJSHeapSize;
  }

  end() {
    const endTime = performance.now();
    const endMemory = performance.memory?.usedJSHeapSize;

    this.metrics.push({
      label: this.currentLabel,
      duration: endTime - this.startTime,
      memoryDelta: endMemory - this.startMemory,
      timestamp: Date.now(),
    });
  }

  report() {
    console.table(this.metrics);

    const avgDuration = this.metrics.reduce((acc, m) => acc + m.duration, 0) / this.metrics.length;
    console.log(`Average duration: ${avgDuration.toFixed(2)}ms`);

    // Find bottlenecks
    const slowOperations = this.metrics.filter(m => m.duration > 16);
    if (slowOperations.length > 0) {
      console.warn('Slow operations detected:', slowOperations);
    }
  }
}

// Usage
const profiler = new ChartProfiler(chart);

profiler.start('data-processing');
processData(rawData);
profiler.end();

profiler.start('rendering');
chart.render();
profiler.end();

profiler.report();
```

## Interview Savollari

### 1. Katta dataset (100K+ nuqta) ni vizualizatsiya qilish strategiyasi qanday?

**Javob:**

```javascript
// 4-bosqichli strategiya:

// 1. Server-side aggregation
// API dan faqat kerakli darajadagi ma'lumotni oling
const fetchData = async (zoom, bounds) => {
  const granularity = zoom < 5 ? 'day' : zoom < 10 ? 'hour' : 'minute';
  return api.get('/data', { granularity, bounds });
};

// 2. Client-side downsampling
const displayData = LTTB(rawData, 500); // 500 nuqtaga kamaytirish

// 3. Canvas/WebGL rendering
// SVG emas, Canvas yoki WebGL ishlatish
const ctx = canvas.getContext('2d');
displayData.forEach(d => {
  ctx.fillRect(xScale(d.x), yScale(d.y), 2, 2);
});

// 4. Virtual scrolling/progressive loading
// Faqat ko'rinadigan qismni render qilish
const visibleRange = calculateVisibleRange(scrollPosition);
const visibleData = data.slice(visibleRange.start, visibleRange.end);
render(visibleData);
```

### 2. Real-time streaming chart'da 60 FPS saqlash qanday?

**Javob:**

```javascript
// 1. Batch updates
class BatchedChart {
  constructor() {
    this.pendingUpdates = [];
    this.rafId = null;
  }

  addPoint(point) {
    this.pendingUpdates.push(point);
    this.scheduleRender();
  }

  scheduleRender() {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.flush();
      this.rafId = null;
    });
  }

  flush() {
    if (this.pendingUpdates.length === 0) return;

    // Process all pending updates at once
    const updates = this.pendingUpdates.splice(0);
    this.buffer.pushMany(updates);
    this.render();
  }
}

// 2. Ring buffer (O(1) insert)
// 3. Canvas rendering (no DOM manipulation)
// 4. Animation off for streaming
// 5. Fixed buffer size (no memory growth)
```

### 3. Memory leak chartlarda qanday aniqlanadi va oldini olinadi?

**Javob:**

```javascript
// 1. Chrome DevTools Memory tab
// - Heap snapshot before/after
// - Allocation timeline

// 2. Proper cleanup pattern
class ChartManager {
  charts = new Map();
  listeners = new Map();

  create(id, config) {
    this.destroy(id); // Avval tozalash

    const chart = new Chart(config);
    this.charts.set(id, chart);

    // Event listeners tracking
    const handler = () => {};
    window.addEventListener('resize', handler);
    this.listeners.set(id, [{ el: window, event: 'resize', handler }]);

    return chart;
  }

  destroy(id) {
    // Chart destroy
    const chart = this.charts.get(id);
    if (chart) {
      chart.destroy();
      this.charts.delete(id);
    }

    // Listeners cleanup
    const listeners = this.listeners.get(id);
    if (listeners) {
      listeners.forEach(({ el, event, handler }) => {
        el.removeEventListener(event, handler);
      });
      this.listeners.delete(id);
    }
  }
}

// 3. Vue/React cleanup
onUnmounted(() => {
  chart.value?.destroy();
  chart.value = null;
});

// 4. WeakMap for DOM references
const chartData = new WeakMap();
```

### 4. Canvas vs SVG qachon tanlash kerak?

**Javob:**

```
SVG qachon:
- < 1000 element
- Accessibility muhim
- CSS styling kerak
- Export/print kerak
- Individual element interaction
- Responsive scaling

Canvas qachon:
- > 1000 element
- Animation-heavy
- Real-time updates
- Performance-critical
- Pixel-level control
- WebGL transition imkoniyati

Hybrid approach:
- SVG: axes, labels, annotations
- Canvas: data points, lines
```

### 5. Kutubxona tanlashda performance qanday baholanadi?

**Javob:**

```javascript
// Benchmark script
async function benchmarkLibraries() {
  const dataSizes = [100, 1000, 10000, 100000];
  const libraries = ['chartjs', 'echarts', 'highcharts', 'd3'];
  const results = {};

  for (const lib of libraries) {
    results[lib] = {};

    for (const size of dataSizes) {
      const data = generateData(size);

      // Initial render time
      const startRender = performance.now();
      const chart = await createChart(lib, data);
      const endRender = performance.now();

      // Update time
      const startUpdate = performance.now();
      await chart.update(generateData(size));
      const endUpdate = performance.now();

      // Memory
      const memory = performance.memory?.usedJSHeapSize;

      results[lib][size] = {
        render: endRender - startRender,
        update: endUpdate - startUpdate,
        memory,
      };

      chart.destroy();
    }
  }

  return results;
}

// Mezonlar:
// 1. Initial render time
// 2. Update time
// 3. Memory usage
// 4. FPS during interaction
// 5. Bundle size
```

## Xulosa

Performance optimization — vizualizatsiyada kritik:

1. **Ma'lumot darajasida:** Server aggregation, LTTB downsampling
2. **Rendering darajasida:** Canvas/WebGL, virtual scrolling
3. **Memory darajasida:** Proper cleanup, ring buffers
4. **Interaction darajasida:** Throttle/debounce, RAF optimization

Har doim o'lchang, taxmin qilmang. DevTools Performance va Memory tab'lardan foydalaning.
