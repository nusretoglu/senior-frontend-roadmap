# Browser Internals - Brauzer Ichki Ishlash Mexanizmlari

> **Maqsad:** Brauzerning ichki arxitekturasi, rendering pipeline, va performance optimizatsiyalarini chuqur tushunish.

## Mundarija

| # | Mavzu | Tavsif |
|---|-------|--------|
| 01 | [Rendering Pipeline](./01-rendering-pipeline.md) | DOM, CSSOM, Render Tree, Layout, Paint, Composite |
| 02 | [Reflow va Repaint](./02-reflow-repaint.md) | Layout thrashing, forced synchronous layout |
| 03 | [DOM Lifecycle](./03-dom-lifecycle.md) | DOMContentLoaded, load, beforeunload, MutationObserver |
| 04 | [Critical Rendering Path](./04-critical-rendering-path.md) | Render-blocking resources, CRP optimization |
| 05 | [GPU Acceleration](./05-gpu-acceleration.md) | Compositor layers, will-change, transform tricks |

---

## Nega Bu Muhim?

### 1. Performance Debugging
```javascript
// Tushunmasdan yozilgan kod
function updatePositions(elements) {
    elements.forEach(el => {
        // HAR BIR ITERATSIYADA LAYOUT TRIGGER!
        el.style.left = el.offsetLeft + 10 + 'px';
    });
}

// Layout thrashing tushunib yozilgan kod
function updatePositionsOptimized(elements) {
    // 1. AVVAL BARCHA O'QISHLAR
    const positions = elements.map(el => el.offsetLeft);

    // 2. KEYIN BARCHA YOZISHLAR
    elements.forEach((el, i) => {
        el.style.left = positions[i] + 10 + 'px';
    });
}
```

### 2. Animation Performance
```css
/* YOMON: Layout trigger */
.animate-bad {
    animation: move-bad 1s infinite;
}
@keyframes move-bad {
    from { left: 0; }
    to { left: 100px; }
}

/* YAXSHI: GPU-accelerated */
.animate-good {
    animation: move-good 1s infinite;
}
@keyframes move-good {
    from { transform: translateX(0); }
    to { transform: translateX(100px); }
}
```

### 3. Initial Load Optimization
```html
<!-- YOMON: Render-blocking -->
<head>
    <link rel="stylesheet" href="huge-framework.css">
    <script src="analytics.js"></script>
</head>

<!-- YAXSHI: Optimized CRP -->
<head>
    <link rel="stylesheet" href="critical.css">
    <link rel="preload" href="fonts.woff2" as="font" crossorigin>
    <script src="analytics.js" defer></script>
</head>
```

---

## Brauzer Arxitekturasi

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER PROCESS                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ UI Thread   │  │ Network     │  │ Storage Thread      │ │
│  │             │  │ Thread      │  │ (IndexedDB, etc.)   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     RENDERER PROCESS                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    MAIN THREAD                       │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │   │
│  │  │ HTML    │  │ Style   │  │ Layout  │  │ Paint  │ │   │
│  │  │ Parser  │  │ Calc    │  │         │  │        │ │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └────────┘ │   │
│  │                      │                              │   │
│  │              ┌───────▼───────┐                     │   │
│  │              │   JavaScript  │                     │   │
│  │              │    Engine     │                     │   │
│  │              │   (V8, etc.)  │                     │   │
│  │              └───────────────┘                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│  ┌───────────────────────────▼──────────────────────────┐  │
│  │                 COMPOSITOR THREAD                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │  │
│  │  │ Layer       │  │ Tile        │  │ GPU Raster   │ │  │
│  │  │ Management  │  │ Management  │  │ (Optional)   │ │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       GPU PROCESS                           │
│           ┌─────────────────────────────────┐              │
│           │  Rasterization & Compositing    │              │
│           └─────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## Asosiy Tushunchalar

### Thread Model
| Thread | Vazifasi | Blocking Effect |
|--------|----------|-----------------|
| **Main Thread** | JS execution, DOM, Layout, Paint | UI freeze |
| **Compositor Thread** | Scrolling, CSS animations | Smooth |
| **Raster Threads** | Tile rasterization | Background |
| **GPU Process** | Hardware rendering | Fast |

### Rendering Steps
1. **Parse HTML** → DOM Tree
2. **Parse CSS** → CSSOM Tree
3. **Combine** → Render Tree
4. **Layout** → Position & Size
5. **Paint** → Pixel colors
6. **Composite** → Layer ordering

### Performance Metrics
| Metric | Target | Measures |
|--------|--------|----------|
| FCP | < 1.8s | First Contentful Paint |
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |
| TTI | < 3.8s | Time to Interactive |

---

## DevTools Workflow

### Performance Panel
```javascript
// Custom performance marks
performance.mark('feature-start');
// ... kod ...
performance.mark('feature-end');
performance.measure('feature-duration', 'feature-start', 'feature-end');

// Natijani ko'rish
console.log(performance.getEntriesByType('measure'));
```

### Layers Panel
1. DevTools → More Tools → Layers
2. 3D view orqali layerlarni ko'rish
3. Compositing reasons ni tekshirish

### Rendering Panel
1. DevTools → More Tools → Rendering
2. Paint flashing (qizil = repaint)
3. Layout Shift Regions
4. FPS meter

---

## Real-World Checklist

### Initial Load
- [ ] Critical CSS inline
- [ ] JavaScript defer/async
- [ ] Font preload
- [ ] Image lazy loading
- [ ] Resource hints (preconnect, prefetch)

### Runtime Performance
- [ ] Transform/opacity for animations
- [ ] will-change on animated elements
- [ ] Avoid layout thrashing
- [ ] Debounce/throttle event handlers
- [ ] Virtual scrolling for long lists

### Memory
- [ ] Event listener cleanup
- [ ] WeakMap/WeakSet for caches
- [ ] Avoid closures holding DOM refs
- [ ] Profile memory in DevTools

---

## Keyingi Qadamlar

1. **01-rendering-pipeline.md** - Rendering jarayonini batafsil o'rganish
2. **02-reflow-repaint.md** - Layout thrashing ni tushunish
3. **03-dom-lifecycle.md** - DOM events va timing
4. **04-critical-rendering-path.md** - Initial load optimization
5. **05-gpu-acceleration.md** - 60fps animatsiyalar

---

## Foydali Resurslar

- [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools/)
- [Web.dev Performance](https://web.dev/performance/)
- [Browser Rendering Pipeline - Google](https://developers.google.com/web/fundamentals/performance/rendering)
- [CSS Triggers](https://csstriggers.com/) - Qaysi CSS property qanday trigger qiladi
