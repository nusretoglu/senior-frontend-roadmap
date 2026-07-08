# GPU Acceleration - Hardware-Accelerated Rendering

## Kirish

Zamonaviy brauzerlar GPU (Graphics Processing Unit) dan foydalanib rendering'ni tezlashtiradi. GPU acceleration to'g'ri ishlatilsa 60fps animatsiyalar va silliq scrolling ta'minlanadi. Noto'g'ri ishlatilsa - memory leak va jank.

---

## Brauzer Rendering Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           MAIN THREAD                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │   DOM    │─▶│  Style   │─▶│  Layout  │─▶│  Paint   │─▶│ Layer Tree   │ │
│  │  Parse   │  │  Calc    │  │          │  │ Records  │  │ Construction │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│                                                                   │        │
└───────────────────────────────────────────────────────────────────┼────────┘
                                                                    │
                    ┌───────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                        COMPOSITOR THREAD                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────┐ │
│  │    Layer     │─▶│    Tile      │─▶│      Raster (GPU or CPU)         │ │
│  │  Management  │  │  Management  │  │                                  │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────────────┘ │
│                                                         │                  │
└─────────────────────────────────────────────────────────┼──────────────────┘
                                                          │
                    ┌─────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                            GPU PROCESS                                     │
│            ┌──────────────────────────────────────────────────┐           │
│            │              COMPOSITING                          │           │
│            │   Layer textures → Final pixels on screen         │           │
│            └──────────────────────────────────────────────────┘           │
└────────────────────────────────────────────────────────────────────────────┘
```

### Thread Roles

| Thread | Vazifasi | Blocking Effect |
|--------|----------|-----------------|
| **Main Thread** | JS, DOM, Layout, Paint records | UI freeze |
| **Compositor Thread** | Layer management, tile raster | Smooth |
| **GPU Process** | Hardware rendering | Very fast |

---

## Compositor Layers

### Layer nima?
Brauzer sahifani alohida "qatlamlarga" (layers) bo'ladi. Har layer GPU texture sifatida saqlanadi va mustaqil transform/composite qilinishi mumkin.

### Layer yaratilish sabablari

```css
/* 1. 3D yoki perspective transform */
.layer-3d {
    transform: translateZ(0);
    transform: translate3d(0, 0, 0);
    transform: rotateY(45deg);
    perspective: 1000px;
}

/* 2. will-change property */
.layer-will-change {
    will-change: transform;
    will-change: opacity;
    will-change: transform, opacity;
}

/* 3. CSS animation/transition (transform/opacity) */
.layer-animated {
    animation: slide 1s infinite;
}
@keyframes slide {
    from { transform: translateX(0); }
    to { transform: translateX(100px); }
}

/* 4. position: fixed/sticky */
.layer-fixed {
    position: fixed;
    top: 0;
}

/* 5. opacity < 1 */
.layer-opacity {
    opacity: 0.99;
}

/* 6. filter, backdrop-filter */
.layer-filter {
    filter: blur(5px);
    backdrop-filter: blur(10px);
}

/* 7. mix-blend-mode */
.layer-blend {
    mix-blend-mode: multiply;
}

/* 8. clip-path */
.layer-clip {
    clip-path: circle(50%);
}

/* 9. mask */
.layer-mask {
    mask-image: linear-gradient(to bottom, black, transparent);
}

/* 10. video, canvas, iframe */
.layer-media {
    /* video va canvas avtomatik alohida layer */
}
```

### Layer Hierarchy
```
┌─────────────────────────────────────────────┐
│            Root Layer (document)            │
│  ┌───────────────────────────────────────┐ │
│  │         Scrollable content            │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │     Card (will-change: transform)│ │ │
│  │  └─────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │     Image (opacity animation)   │ │ │
│  │  └─────────────────────────────────┘ │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │     Fixed header (position: fixed)    │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │     Modal (transform: translateZ)     │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Composite-Only Properties

### Faqat GPU'da ishlaydigan xossalar
Bu xossalar main thread'ni band qilmaydi:

```css
/* COMPOSITE ONLY - Eng tezkor */
.gpu-only {
    /* Position */
    transform: translateX(100px);
    transform: translateY(50px);
    transform: translate(100px, 50px);
    transform: translate3d(100px, 50px, 0);

    /* Scale */
    transform: scale(1.5);
    transform: scaleX(2);
    transform: scaleY(0.5);

    /* Rotation */
    transform: rotate(45deg);
    transform: rotateX(30deg);
    transform: rotateY(60deg);
    transform: rotate3d(1, 1, 0, 45deg);

    /* Skew */
    transform: skew(10deg);

    /* Opacity */
    opacity: 0.5;
}
```

### Comparison: Layout vs Paint vs Composite

```css
/* LAYOUT TRIGGER - Eng qimmat */
.layout {
    width: 200px;
    height: 100px;
    padding: 20px;
    margin: 10px;
    top: 50px;
    left: 100px;
    border-width: 2px;
    font-size: 18px;
}

/* PAINT TRIGGER - O'rta qimmat */
.paint {
    color: red;
    background-color: blue;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-color: green;
    border-radius: 10px;
}

/* COMPOSITE TRIGGER - Eng arzon */
.composite {
    transform: translateX(100px);
    opacity: 0.8;
}
```

---

## will-change Property

### Nima qiladi?
Brauzerga "bu element tez orada o'zgaradi" deb xabar beradi. Brauzer oldindan GPU layer yaratadi.

### To'g'ri ishlatish

```css
/* STATIK - doim will-change (kam element uchun OK) */
.animated-card {
    will-change: transform;
    transition: transform 0.3s;
}
.animated-card:hover {
    transform: scale(1.05);
}

/* DINAMIK - faqat kerak paytda (ko'p element uchun) */
.card {
    transition: transform 0.3s;
}
.card:hover {
    will-change: transform;
    transform: scale(1.05);
}
```

```javascript
// JavaScript bilan dinamik boshqarish
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    // Hover boshlanishida layer yaratish
    card.addEventListener('mouseenter', () => {
        card.style.willChange = 'transform';
    });

    // Animatsiya tugagach layer yo'q qilish
    card.addEventListener('mouseleave', () => {
        // Transition tugashini kutish
        card.addEventListener('transitionend', () => {
            card.style.willChange = 'auto';
        }, { once: true });
    });
});
```

### Noto'g'ri ishlatish

```css
/* YOMON: Barcha elementlarga will-change */
* {
    will-change: transform; /* Memory disaster! */
}

/* YOMON: Kerak bo'lmagan xossalarga */
.static-element {
    will-change: transform; /* Hech qachon animatsiya qilmaydi */
}

/* YOMON: Juda ko'p xossalar */
.over-optimized {
    will-change: transform, opacity, top, left, width, height;
    /* Ortiqcha memory */
}
```

### will-change vs transform: translateZ(0)

```css
/* Eski hack - hali ham ishlaydi */
.old-hack {
    transform: translateZ(0);
    /* yoki */
    transform: translate3d(0, 0, 0);
    /* Layer yaratadi, lekin niyat noaniq */
}

/* Zamonaviy yondashuv */
.modern {
    will-change: transform;
    /* Niyat aniq, brauzer optimizatsiya qila oladi */
}
```

---

## Animatsiya Best Practices

### CSS Animation (Afzal)

```css
/* CSS animatsiya - Compositor thread'da */
.slide-in {
    animation: slideIn 0.5s ease-out forwards;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Hover effect */
.card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}
```

### Web Animations API

```javascript
// JavaScript control bilan CSS performance
const element = document.querySelector('.animated');

// Composite-only properties
const animation = element.animate([
    { transform: 'translateX(0)', opacity: 1 },
    { transform: 'translateX(100px)', opacity: 0.5 }
], {
    duration: 300,
    easing: 'ease-out',
    fill: 'forwards'
});

// Control
animation.pause();
animation.play();
animation.reverse();
animation.cancel();

// Events
animation.onfinish = () => console.log('Done');
```

### requestAnimationFrame

```javascript
// Manual animation - faqat murakkab logic uchun
function animate() {
    const element = document.querySelector('.box');
    let position = 0;

    function frame() {
        position += 2;
        // Composite-only property!
        element.style.transform = `translateX(${position}px)`;

        if (position < 200) {
            requestAnimationFrame(frame);
        }
    }

    requestAnimationFrame(frame);
}

// Easing function bilan
function animateWithEasing(element, from, to, duration) {
    const startTime = performance.now();

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function frame(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);

        const current = from + (to - from) * easedProgress;
        element.style.transform = `translateX(${current}px)`;

        if (progress < 1) {
            requestAnimationFrame(frame);
        }
    }

    requestAnimationFrame(frame);
}
```

---

## Real-World Cases

### Case 1: Parallax Effect

```javascript
// MUAMMO: top/left = Layout har frame
window.addEventListener('scroll', () => {
    parallaxLayers.forEach(layer => {
        const speed = layer.dataset.speed;
        layer.style.top = window.scrollY * speed + 'px';
    });
});

// YECHIM: transform = Composite only
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            parallaxLayers.forEach(layer => {
                const speed = parseFloat(layer.dataset.speed);
                layer.style.transform = `translateY(${scrollY * speed}px)`;
            });
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });
```

### Case 2: Modal Animation

```css
/* MUAMMO: height/scale mixed = Paint */
.modal-bad {
    height: 0;
    overflow: hidden;
    transition: height 0.3s;
}
.modal-bad.open {
    height: auto;
}

/* YECHIM: Pure transform */
.modal-overlay {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
}
.modal-overlay.open {
    opacity: 1;
    pointer-events: auto;
}

.modal-content {
    transform: scale(0.95) translateY(20px);
    opacity: 0;
    transition: transform 0.3s, opacity 0.3s;
}
.modal-overlay.open .modal-content {
    transform: scale(1) translateY(0);
    opacity: 1;
}
```

### Case 3: Infinite Carousel

```css
/* Hardware accelerated carousel */
.carousel-track {
    display: flex;
    will-change: transform;
}

.carousel-slide {
    flex-shrink: 0;
    width: 100%;
}
```

```javascript
class GPUCarousel {
    constructor(element) {
        this.track = element.querySelector('.carousel-track');
        this.slides = element.querySelectorAll('.carousel-slide');
        this.currentIndex = 0;

        // Touch support
        this.setupTouch();
    }

    goTo(index) {
        this.currentIndex = index;
        const offset = -index * 100;

        // GPU accelerated
        this.track.style.transform = `translateX(${offset}%)`;
    }

    setupTouch() {
        let startX, currentX;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            this.track.style.transition = 'none';
        }, { passive: true });

        this.track.addEventListener('touchmove', (e) => {
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            const offset = -this.currentIndex * 100 + (diff / this.track.offsetWidth) * 100;

            // Real-time GPU transform
            this.track.style.transform = `translateX(${offset}%)`;
        }, { passive: true });

        this.track.addEventListener('touchend', () => {
            this.track.style.transition = 'transform 0.3s ease-out';
            // Snap to nearest slide
            this.goTo(Math.round(this.currentIndex));
        });
    }
}
```

### Case 4: Sticky Header Shadow

```css
/* MUAMMO: JavaScript ile box-shadow = Paint */
.header {
    position: sticky;
    top: 0;
}

/* YECHIM: Pseudo-element with opacity */
.header {
    position: sticky;
    top: 0;
}

.header::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    right: 0;
    height: 10px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
}

.header.scrolled::after {
    opacity: 1; /* Composite only! */
}
```

```javascript
// Scroll detection
const header = document.querySelector('.header');
const observer = new IntersectionObserver(
    ([entry]) => {
        header.classList.toggle('scrolled', !entry.isIntersecting);
    },
    { threshold: 1, rootMargin: '-1px 0px 0px 0px' }
);

// Sentinel element
const sentinel = document.createElement('div');
sentinel.style.cssText = 'height: 1px; position: absolute; top: 0;';
document.body.prepend(sentinel);
observer.observe(sentinel);
```

### Case 5: Card Flip Animation

```css
.card-container {
    perspective: 1000px;
}

.card {
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s;
}

.card.flipped {
    transform: rotateY(180deg);
}

.card-front,
.card-back {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
}

.card-back {
    transform: rotateY(180deg);
}
```

---

## Memory Management

### Layer Memory Cost

```javascript
// Har layer ~width × height × 4 bytes (RGBA)
// 1920×1080 layer ≈ 8MB

// DevTools: Layers panel → Memory usage

// Katta elementlarda layer yaratmaslik
const hugeElement = document.querySelector('.huge');
// hugeElement.style.willChange = 'transform'; // 50MB+ memory!
```

### Excessive Layers Prevention

```javascript
// Layer sonini monitoring
function countLayers() {
    // DevTools Protocol orqali
    // chrome://tracing da "cc" category

    // Manual check
    const layerTriggers = document.querySelectorAll(`
        [style*="will-change"],
        [style*="transform: translate"],
        [style*="translateZ"],
        [style*="translate3d"]
    `);

    console.log('Potential layers:', layerTriggers.length);

    if (layerTriggers.length > 50) {
        console.warn('Too many layers! Check memory usage.');
    }
}
```

### Layer Promotion Control

```css
/* Keraksiz layer oldini olish */
.no-layer {
    will-change: auto;
    transform: none;
}

/* Contain bilan izolyatsiya */
.isolated-widget {
    contain: strict;
    /* Layer yaratadi, lekin chegaralangan */
}
```

---

## DevTools Debugging

### Layers Panel

```
1. DevTools → More Tools → Layers
2. 3D view orqali layerlarni ko'rish
3. Har layer uchun:
   - Size (memory usage)
   - Compositing reasons
   - Paint count
   - Slow scroll regions
```

### Rendering Panel

```
1. DevTools → More Tools → Rendering
2. Enable:
   - Paint flashing (repaint = qizil)
   - Layer borders (sariq = GPU layer)
   - Scrolling performance issues
   - Frame Rendering Stats (FPS meter)
```

### Performance Panel

```javascript
// Custom performance marks
performance.mark('animation-start');

element.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.5)' }
], 300);

setTimeout(() => {
    performance.mark('animation-end');
    performance.measure('animation', 'animation-start', 'animation-end');
    console.log(performance.getEntriesByType('measure'));
}, 300);
```

### Frame Budget Check

```javascript
// 60fps = 16.67ms per frame
let lastTime = performance.now();
let frameCount = 0;
let worstFrame = 0;

function measureFrame() {
    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;
    frameCount++;

    if (delta > worstFrame) {
        worstFrame = delta;
    }

    if (delta > 16.67) {
        console.warn(`Slow frame: ${delta.toFixed(2)}ms`);
    }

    requestAnimationFrame(measureFrame);
}

requestAnimationFrame(measureFrame);

// Report after 5 seconds
setTimeout(() => {
    console.log({
        totalFrames: frameCount,
        averageFPS: frameCount / 5,
        worstFrame: worstFrame.toFixed(2) + 'ms'
    });
}, 5000);
```

---

## Interview Savollari

### 1. Savol: GPU acceleration qanday ishlaydi?
**Javob:**
Brauzer ba'zi elementlarni alohida GPU texture (layer) sifatida saqlaydi. Bu layerlar GPU'da parallel transform va composite qilinadi.

**Layer yaratish:**
- `transform: translateZ(0)` yoki `translate3d()`
- `will-change: transform`
- `position: fixed/sticky`
- `opacity < 1`, `filter`, `backdrop-filter`

**Afzallik:** Main thread free, 60fps animatsiya.
**Kamchilik:** Har layer memory sarflaydi.

### 2. Savol: Nima uchun transform: translateX() left dan tezroq?
**Javob:**
| Property | Triggers | Thread |
|----------|----------|--------|
| `left` | Layout → Paint → Composite | Main |
| `transform` | Composite only | Compositor |

`transform` main thread'ni band qilmaydi, faqat GPU'da ishlaydi.

### 3. Savol: will-change nima va qachon ishlatish kerak?
**Javob:**
`will-change` brauzerga element tez orada o'zgarishini bildiradi. Brauzer oldindan GPU layer yaratadi.

**Qachon:**
```css
/* Animatsiya qilinadigan element */
.animated {
    will-change: transform;
}
```

**Qachon EMAS:**
```css
/* Barcha elementlarga - memory disaster */
* { will-change: transform; }

/* Statik elementlarga */
.static { will-change: transform; }
```

### 4. Savol: CSS animation vs JavaScript animation - qaysi biri yaxshiroq?
**Javob:**
| Aspect | CSS Animation | JS Animation |
|--------|---------------|--------------|
| Thread | Compositor | Main |
| Control | Limited | Full |
| Performance | Better | Good (with rAF) |
| Use case | Simple | Complex logic |

**CSS afzal:** transform/opacity animatsiyalar.
**JS afzal:** Physics, gestures, complex sequences.

```css
/* CSS - Simple, performant */
.card { transition: transform 0.3s; }
.card:hover { transform: scale(1.05); }
```

```javascript
// JS - Complex control
element.animate(keyframes, {
    duration: 300,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
});
```

### 5. Savol: Qanday qilib 60fps animatsiya ta'minlash mumkin?
**Javob:**

1. **Faqat composite properties:**
   ```css
   .animate {
       transform: translateX(100px);
       opacity: 0.5;
   }
   ```

2. **will-change oldindan qo'shish:**
   ```javascript
   element.style.willChange = 'transform';
   // Animatsiya
   // Keyin olib tashlash
   ```

3. **requestAnimationFrame:**
   ```javascript
   requestAnimationFrame(() => {
       element.style.transform = `translateX(${x}px)`;
   });
   ```

4. **Layout thrashing oldini olish:**
   ```javascript
   // Avval READ, keyin WRITE
   const width = element.offsetWidth;
   element.style.transform = `translateX(${width}px)`;
   ```

5. **DevTools monitoring:**
   - Layers panel
   - Frame rate meter
   - Performance panel

---

## Performance Tips

### 1. Compositor-Only Animations
```css
/* HAR DOIM transform va opacity ishlating */
.optimized-animation {
    animation: moveAndFade 0.5s ease-out;
}

@keyframes moveAndFade {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
```

### 2. Passive Event Listeners
```javascript
// Scroll/touch events uchun
window.addEventListener('scroll', onScroll, { passive: true });
element.addEventListener('touchmove', onTouch, { passive: true });

// Bu brauzerga: "preventDefault() chaqirilmaydi"
// Natija: Compositor thread free, smooth scrolling
```

### 3. Contain Property
```css
/* Layout/paint izolyatsiya */
.widget {
    contain: layout paint;
}

/* Content visibility (lazy render) */
.below-fold {
    content-visibility: auto;
    contain-intrinsic-size: 0 500px;
}
```

### 4. Avoid Implicit Layers
```css
/* MUAMMO: Ko'p implicit layers */
.card {
    position: relative;
    z-index: 1; /* z-index = potential layer */
}

/* YECHIM: Faqat kerakli elementlarga */
.card-interactive {
    will-change: transform;
}
```

### 5. Animation Cleanup
```javascript
// SPA da animation cleanup
class AnimatedComponent {
    constructor(element) {
        this.element = element;
        this.animations = [];
    }

    animate(keyframes, options) {
        const animation = this.element.animate(keyframes, options);
        this.animations.push(animation);
        return animation;
    }

    destroy() {
        // Barcha animatsiyalarni cancel
        this.animations.forEach(a => a.cancel());
        this.animations = [];

        // will-change tozalash
        this.element.style.willChange = 'auto';
    }
}
```

---

## Xulosa

| Technique | Performance | Memory | Use Case |
|-----------|-------------|--------|----------|
| `transform` | Excellent | Low | Position, scale, rotate |
| `opacity` | Excellent | Low | Fade effects |
| `will-change` | Excellent | Medium | Known animations |
| CSS Animation | Excellent | Low | Simple animations |
| Web Animations API | Great | Low | Controlled animations |
| `requestAnimationFrame` | Good | Low | Complex logic |

**Asosiy qoidalar:**
1. Animatsiyada faqat `transform` va `opacity`
2. `will-change` faqat kerakli elementlarga
3. Layer sonini minimal saqlang
4. `passive: true` scroll/touch event'larda
5. DevTools bilan doim profiling qiling
