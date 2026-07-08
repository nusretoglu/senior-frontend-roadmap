# Profiling Tools

Performance optimization'ning birinchi qadami - muammoni aniqlash. Profiling tools orqali bottleneck'larni topish va ularni hal qilish strategiyalarini ko'rib chiqamiz.

## Nazariya

### Performance Profiling Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. MEASURE (O'lchash)                                       │
│    └── Baseline metrics olish                               │
│                                                             │
│ 2. ANALYZE (Tahlil)                                         │
│    └── Bottleneck aniqlash                                  │
│                                                             │
│ 3. OPTIMIZE (Optimallashtirish)                             │
│    └── Muammoni hal qilish                                  │
│                                                             │
│ 4. VERIFY (Tekshirish)                                      │
│    └── Yaxshilanishni tasdiqlash                            │
│                                                             │
│ 5. MONITOR (Kuzatish)                                       │
│    └── Production'da davom ettirish                         │
└─────────────────────────────────────────────────────────────┘
```

### Asosiy Metrikalar

```
Core Web Vitals:
├── LCP (Largest Contentful Paint) < 2.5s
├── FID (First Input Delay) < 100ms
├── CLS (Cumulative Layout Shift) < 0.1
└── INP (Interaction to Next Paint) < 200ms

Other Metrics:
├── FCP (First Contentful Paint) < 1.8s
├── TTFB (Time to First Byte) < 800ms
├── TTI (Time to Interactive) < 3.8s
└── TBT (Total Blocking Time) < 200ms
```

## Chrome DevTools

### Performance Panel

```javascript
// 1. Recording
// - F12 → Performance tab
// - Click Record (⚫)
// - Perform actions
// - Stop recording

// 2. Simulating conditions
// - CPU: 4x/6x slowdown
// - Network: Fast 3G, Slow 3G
// - Disable cache

// 3. Key sections:
// - Summary: Overview pie chart
// - Bottom-Up: Time by function
// - Call Tree: Execution hierarchy
// - Event Log: Chronological events
```

### Performance Insights

```javascript
// Chrome 102+ - Performance insights panel
// Automatically identifies issues:

// 1. Render blocking resources
// 2. Layout shifts
// 3. Long tasks
// 4. Large images
// 5. JavaScript execution time
```

### Lighthouse

```javascript
// Built-in audit tool
// F12 → Lighthouse tab

// Categories:
// - Performance (Core Web Vitals)
// - Accessibility
// - Best Practices
// - SEO
// - PWA

// CLI usage
npm install -g lighthouse
lighthouse https://example.com --view

// Programmatic
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    onlyCategories: ['performance']
  });

  await chrome.kill();
  return result;
}
```

### Memory Panel

```javascript
// Memory profiling
// F12 → Memory tab

// 1. Heap Snapshot
// - Current memory state
// - Object allocation
// - Detached DOM nodes

// 2. Allocation instrumentation
// - Track allocations over time
// - Find memory growth

// 3. Allocation sampling
// - Lightweight profiling
// - Function attribution
```

### Coverage Tool

```javascript
// Find unused CSS/JS
// F12 → More tools → Coverage

// 1. Click reload button
// 2. See used vs unused code
// 3. Click file to see line-by-line

// Results:
// - Red: unused code
// - Green: used code
// - Percentage of unused
```

## Performance API

### Navigation Timing

```javascript
// Page load timing
const timing = performance.getEntriesByType('navigation')[0];

const metrics = {
  // DNS lookup
  dns: timing.domainLookupEnd - timing.domainLookupStart,

  // TCP connection
  tcp: timing.connectEnd - timing.connectStart,

  // TLS handshake (HTTPS)
  tls: timing.requestStart - timing.secureConnectionStart,

  // TTFB
  ttfb: timing.responseStart - timing.requestStart,

  // Content download
  download: timing.responseEnd - timing.responseStart,

  // DOM processing
  domProcessing: timing.domComplete - timing.domInteractive,

  // Total page load
  pageLoad: timing.loadEventEnd - timing.navigationStart
};

console.table(metrics);
```

### Resource Timing

```javascript
// Individual resource timing
const resources = performance.getEntriesByType('resource');

resources.forEach(resource => {
  console.log({
    name: resource.name,
    type: resource.initiatorType,
    duration: resource.duration,
    size: resource.transferSize,
    cached: resource.transferSize === 0
  });
});

// Filter by type
const scripts = resources.filter(r => r.initiatorType === 'script');
const images = resources.filter(r => r.initiatorType === 'img');
```

### User Timing API

```javascript
// Custom performance marks
function expensiveOperation() {
  performance.mark('expensive-start');

  // ... operation ...

  performance.mark('expensive-end');
  performance.measure('expensive-operation', 'expensive-start', 'expensive-end');
}

// Get measurements
const measurements = performance.getEntriesByType('measure');
measurements.forEach(m => {
  console.log(`${m.name}: ${m.duration}ms`);
});

// Vue composable
function usePerformance() {
  function measureAsync(name, fn) {
    return async (...args) => {
      const start = performance.now();
      try {
        return await fn(...args);
      } finally {
        const duration = performance.now() - start;
        performance.measure(name, {
          start,
          duration
        });
        console.log(`${name}: ${duration.toFixed(2)}ms`);
      }
    };
  }

  return { measureAsync };
}

// Ishlatish
const { measureAsync } = usePerformance();

const fetchData = measureAsync('fetchData', async () => {
  const response = await fetch('/api/data');
  return response.json();
});
```

### Long Tasks API

```javascript
// Detect long tasks (>50ms)
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.warn('Long Task detected:', {
      duration: entry.duration,
      startTime: entry.startTime,
      attribution: entry.attribution
    });

    // Analytics'ga yuborish
    analytics.track('long_task', {
      duration: entry.duration,
      url: window.location.href
    });
  });
});

observer.observe({ entryTypes: ['longtask'] });
```

### Layout Shift API

```javascript
// Track CLS
let clsValue = 0;
let clsEntries = [];

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Foydalanuvchi harakati tufayli emas
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
      clsEntries.push(entry);
    }
  }
});

observer.observe({ type: 'layout-shift', buffered: true });

// Report
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    console.log('Final CLS:', clsValue);
    // Analytics'ga yuborish
  }
});
```

## Web Vitals Library

```javascript
// Installation
npm install web-vitals

// Usage
import { onCLS, onFID, onLCP, onINP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good', 'needs-improvement', 'poor'
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType
  });

  // Beacon API - page unload'da ham yuboriladi
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body);
  } else {
    fetch('/analytics', { body, method: 'POST', keepalive: true });
  }
}

// All metrics
onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

### Vue Integration

```javascript
// plugins/webVitals.js
import { onCLS, onFID, onLCP, onINP, onTTFB } from 'web-vitals';

export function initWebVitals() {
  const vitals = {};

  function handleMetric(metric) {
    vitals[metric.name] = {
      value: metric.value,
      rating: metric.rating
    };

    // Debug mode'da console'ga
    if (import.meta.env.DEV) {
      console.log(`[Web Vital] ${metric.name}:`, metric.value, metric.rating);
    }

    // Production'da analytics'ga
    if (import.meta.env.PROD) {
      sendToAnalytics(metric);
    }
  }

  onCLS(handleMetric);
  onFID(handleMetric);
  onLCP(handleMetric);
  onINP(handleMetric);
  onTTFB(handleMetric);

  return vitals;
}

// main.js
import { initWebVitals } from './plugins/webVitals';
initWebVitals();
```

## React/Vue Profiler

### Vue DevTools Performance

```javascript
// Vue DevTools
// 1. F12 → Vue tab
// 2. Performance section

// Component render timing
// - Mount time
// - Update time
// - Component tree

// Timeline
// - Component lifecycle events
// - State changes
// - Event emissions
```

### Custom Vue Performance Plugin

```javascript
// plugins/performance.js
export const performancePlugin = {
  install(app) {
    // Global mixin
    app.mixin({
      beforeCreate() {
        this.$_perfStart = performance.now();
      },
      mounted() {
        const duration = performance.now() - this.$_perfStart;

        if (duration > 16) { // 1 frame = 16ms
          console.warn(
            `[Perf] Slow component mount: ${this.$options.name || 'Anonymous'}`,
            `${duration.toFixed(2)}ms`
          );
        }
      }
    });

    // Performance directive
    app.directive('perf', {
      mounted(el, binding) {
        const name = binding.value || el.tagName;
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.name.includes(name)) {
              console.log(`[Perf] ${name}:`, entry.duration);
            }
          });
        });
        observer.observe({ entryTypes: ['measure'] });
      }
    });
  }
};
```

## Third-Party Tools

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: push

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build
        run: npm ci && npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          uploadArtifacts: true
          temporaryPublicStorage: true
          configPath: ./lighthouserc.json
```

```javascript
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/about"],
      "startServerCommand": "npm run preview"
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### SpeedCurve / Calibre

```javascript
// Real User Monitoring setup
// speedcurve.com / calibreapp.com

// Custom RUM
const rum = {
  init() {
    this.trackNavigationTiming();
    this.trackResourceTiming();
    this.trackWebVitals();
    this.trackErrors();
  },

  trackNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.getEntriesByType('navigation')[0];
        this.send('navigation', {
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          tcp: timing.connectEnd - timing.connectStart,
          ttfb: timing.responseStart - timing.requestStart,
          domLoad: timing.domContentLoadedEventEnd - timing.navigationStart,
          pageLoad: timing.loadEventEnd - timing.navigationStart
        });
      }, 0);
    });
  },

  trackResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 1000) {
          this.send('slow_resource', {
            url: entry.name,
            duration: entry.duration,
            type: entry.initiatorType
          });
        }
      });
    });
    observer.observe({ entryTypes: ['resource'] });
  },

  send(event, data) {
    navigator.sendBeacon('/rum', JSON.stringify({ event, data, timestamp: Date.now() }));
  }
};

rum.init();
```

### Bundle Analyzer

```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      filename: 'dist/bundle-stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
};

// webpack
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html'
    })
  ]
};
```

## Real-World Case: E-commerce Performance Audit

### Muammo

```
PageSpeed Score: 35/100
LCP: 8.5s
FID: 350ms
CLS: 0.45

User complaints:
- "Site juda sekin"
- "Mahsulotlar ko'rinmay qolyapti"
- "Scroll qilganda sakraydi"
```

### Audit Process

```javascript
// 1. Lighthouse audit
// npx lighthouse https://example.com --output=json > audit.json

// 2. Key findings:
const findings = {
  renderBlocking: [
    'https://example.com/css/all.css (150KB)',
    'https://example.com/js/vendor.js (500KB)'
  ],
  largeImages: [
    'hero-banner.jpg (2.5MB, should be 150KB)',
    'product-*.jpg (300KB each, should be 50KB)'
  ],
  longTasks: [
    'jQuery plugins init: 800ms',
    'Product carousel: 400ms',
    'Analytics scripts: 300ms'
  ],
  layoutShifts: [
    'Images without dimensions',
    'Fonts loading (FOUT)',
    'Ads loading late'
  ]
};

// 3. Performance marks
performance.mark('hero-start');
await loadHeroImage();
performance.mark('hero-end');
performance.measure('hero-load', 'hero-start', 'hero-end');
```

### Fixes Applied

```javascript
// 1. Image optimization
// Before: 2.5MB hero image
// After: WebP, srcset, lazy loading
<picture>
  <source
    srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
    type="image/webp"
  >
  <img
    src="hero-800.jpg"
    srcset="hero-400.jpg 400w, hero-800.jpg 800w"
    sizes="100vw"
    alt="Hero"
    width="1200"
    height="600"
    fetchpriority="high"
  >
</picture>

// 2. Code splitting
// Before: 500KB vendor.js
// After: Lazy load non-critical
const Carousel = defineAsyncComponent(() =>
  import('./components/Carousel.vue')
);

// 3. Font loading
// Before: FOUT causing CLS
<link
  rel="preload"
  href="/fonts/main.woff2"
  as="font"
  type="font/woff2"
  crossorigin
>

<style>
@font-face {
  font-family: 'Main';
  src: url('/fonts/main.woff2') format('woff2');
  font-display: swap;
}
</style>

// 4. Layout stability
// Before: images without dimensions
// After: aspect-ratio defined
img {
  aspect-ratio: attr(width) / attr(height);
  width: 100%;
  height: auto;
}
```

### Natija

```
BEFORE:
- PageSpeed: 35/100
- LCP: 8.5s
- FID: 350ms
- CLS: 0.45

AFTER:
- PageSpeed: 92/100
- LCP: 1.8s (78% faster)
- FID: 45ms (87% faster)
- CLS: 0.02 (95% better)

Business Impact:
- Bounce rate: -35%
- Conversion: +22%
- Revenue: +18%
```

## Interview Savollari

### 1. LCP qanday o'lchanadi va yaxshilanadi?

**Javob:**
```javascript
// LCP = Largest Contentful Paint
// Eng katta element qachon render bo'ladi?

// O'lchash
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.startTime, lastEntry.element);
}).observe({ type: 'largest-contentful-paint', buffered: true });

// LCP elementlari:
// - <img>
// - <image> (SVG ichida)
// - <video> poster
// - CSS background-image
// - Block-level text

// Yaxshilash:
// 1. Critical resource preload
<link rel="preload" href="hero.jpg" as="image" fetchpriority="high">

// 2. Server response time (TTFB)
// CDN, caching, server optimization

// 3. Render-blocking resources
// Defer non-critical JS/CSS

// 4. Image optimization
// WebP, proper sizing, compression

// 5. Priority hints
<img src="hero.jpg" fetchpriority="high">
```

### 2. Memory leak qanday topiladi?

**Javob:**
```javascript
// Chrome DevTools Memory panel

// 1. Heap Snapshot comparison
// - Take snapshot
// - Perform action
// - Take another snapshot
// - Compare (Comparison view)

// 2. Look for:
// - Detached DOM nodes
// - Growing arrays/objects
// - Event listeners not removed
// - Closures holding references

// Common leaks:

// Leak 1: Event listener
// XATO
element.addEventListener('click', handler);
// Component unmount'da remove qilinmagan

// TO'G'RI
onUnmounted(() => {
  element.removeEventListener('click', handler);
});

// Leak 2: Interval/Timeout
// XATO
setInterval(update, 1000);

// TO'G'RI
const id = setInterval(update, 1000);
onUnmounted(() => clearInterval(id));

// Leak 3: Closure
// XATO
const data = fetchLargeData();
element.onclick = () => console.log(data);
// data hech qachon GC qilinmaydi

// TO'G'RI
element.onclick = null; // Clear when done
```

### 3. Long Task qanday aniqlanadi va hal qilinadi?

**Javob:**
```javascript
// Long Task = 50ms dan uzun task
// Main thread'ni bloklaydi
// User input'ga javob bermaydi

// Aniqlash
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log('Long task:', entry.duration);
  });
});
observer.observe({ entryTypes: ['longtask'] });

// Hal qilish:

// 1. Code splitting
// Katta JS'ni bo'lish
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);

// 2. Web Worker
const worker = new Worker('heavy-calc.js');
worker.postMessage(data);
worker.onmessage = (e) => console.log(e.data);

// 3. requestIdleCallback
function processItems(items) {
  requestIdleCallback((deadline) => {
    while (deadline.timeRemaining() > 0 && items.length) {
      processItem(items.shift());
    }
    if (items.length) {
      requestIdleCallback(/* continue */);
    }
  });
}

// 4. Chunking with scheduler
async function processLargeArray(items) {
  const CHUNK_SIZE = 100;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    processChunk(chunk);
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

### 4. CLS qanday debugging qilinadi?

**Javob:**
```javascript
// CLS = Cumulative Layout Shift
// Unexpected layout shift

// Debugging
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log('Layout shift:', {
      value: entry.value,
      sources: entry.sources?.map(s => ({
        node: s.node,
        previousRect: s.previousRect,
        currentRect: s.currentRect
      }))
    });
  });
}).observe({ type: 'layout-shift', buffered: true });

// Common causes:

// 1. Images without dimensions
// XATO
<img src="photo.jpg">

// TO'G'RI
<img src="photo.jpg" width="800" height="600">
// yoki CSS aspect-ratio

// 2. Fonts causing FOUT
// TO'G'RI
@font-face {
  font-family: 'Main';
  src: url(font.woff2);
  font-display: swap;
  /* yoki optional agar CLS muhimroq */
}

// 3. Dynamic content
// XATO
<div v-if="loaded">Content</div>

// TO'G'RI - placeholder
<div :style="{ minHeight: '200px' }">
  <template v-if="loaded">Content</template>
  <Skeleton v-else />
</div>

// 4. Ads/embeds
// Reserve space
.ad-container {
  min-height: 250px;
  contain: layout;
}
```

### 5. Performance monitoring production'da qanday qilinadi?

**Javob:**
```javascript
// Real User Monitoring (RUM)

// 1. Web Vitals
import { onCLS, onFID, onLCP, onINP, onTTFB } from 'web-vitals';

function sendMetric(metric) {
  // Beacon API - page close'da ham yuboriladi
  navigator.sendBeacon('/rum', JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    page: window.location.pathname,
    userAgent: navigator.userAgent,
    connection: navigator.connection?.effectiveType
  }));
}

onCLS(sendMetric);
onFID(sendMetric);
onLCP(sendMetric);
onINP(sendMetric);
onTTFB(sendMetric);

// 2. Error tracking
window.addEventListener('error', (event) => {
  sendMetric({
    name: 'js-error',
    value: event.message,
    stack: event.error?.stack
  });
});

// 3. Resource monitoring
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.duration > 3000) {
      sendMetric({
        name: 'slow-resource',
        value: entry.duration,
        url: entry.name
      });
    }
  });
}).observe({ entryTypes: ['resource'] });

// 4. Dashboard
// - Grafana + InfluxDB
// - Datadog
// - New Relic
// - SpeedCurve
```

## Tools Summary

| Tool | Purpose | When to Use |
|------|---------|-------------|
| Chrome DevTools | Development profiling | Every time |
| Lighthouse | Audit & recommendations | Before deploy |
| web-vitals | Core Web Vitals | Production RUM |
| Bundle Analyzer | Bundle size | Build time |
| Coverage Tool | Unused code | Optimization |
| Memory Panel | Memory leaks | Debug |
| Performance Panel | Runtime profiling | Debug |

## Xulosa

Performance profiling strategiyasi:

1. **Measure First** - Baseline metrikalar
2. **Use Right Tools** - Vazifaga mos tool
3. **Focus on User** - Real user metrics
4. **Automate** - CI/CD integration
5. **Monitor** - Production RUM

```javascript
// Performance culture
const performanceBudget = {
  LCP: 2500,    // ms
  FID: 100,     // ms
  CLS: 0.1,     // score
  INP: 200,     // ms
  bundleJS: 150, // KB (gzip)
  bundleCSS: 30  // KB (gzip)
};

// Every PR must pass performance budget
```
