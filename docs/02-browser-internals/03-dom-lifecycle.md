# DOM Lifecycle - Hujjat Hayot Sikli

## Kirish

Brauzer HTML'ni qabul qilganidan to'liq yuklangunga qadar bir necha bosqichlardan o'tadi. Har bir bosqichda turli eventlar trigger bo'ladi. Bu eventlarni tushunish to'g'ri script yuklash va resurslarni boshqarish uchun muhim.

---

## Document Ready States

```javascript
// document.readyState qiymatlari
console.log(document.readyState);
// "loading"     - HTML hali parse qilinmoqda
// "interactive" - HTML parse tugadi, resurslar yuklanmoqda
// "complete"    - Barcha resurslar yuklandi
```

### Timeline
```
┌──────────────────────────────────────────────────────────────────────┐
│                        DOCUMENT LIFECYCLE                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  HTML Start                                                          │
│      │                                                               │
│      ▼                                                               │
│  ┌─────────────────────────────────────────┐                        │
│  │         readyState: "loading"           │                        │
│  │         HTML Parsing...                 │                        │
│  └─────────────────────────────────────────┘                        │
│      │                                                               │
│      │  <script> (blocking)                                         │
│      │  Images/CSS/fonts start loading (parallel)                   │
│      │                                                               │
│      ▼                                                               │
│  ┌─────────────────────────────────────────┐                        │
│  │      readyState: "interactive"          │                        │
│  │      DOM ready, resources loading...    │                        │
│  │                                         │                        │
│  │      ★ DOMContentLoaded event           │                        │
│  └─────────────────────────────────────────┘                        │
│      │                                                               │
│      │  Images, iframes, fonts loading...                           │
│      │                                                               │
│      ▼                                                               │
│  ┌─────────────────────────────────────────┐                        │
│  │       readyState: "complete"            │                        │
│  │       All resources loaded              │                        │
│  │                                         │                        │
│  │       ★ window.load event               │                        │
│  └─────────────────────────────────────────┘                        │
│      │                                                               │
│      │  User interaction...                                         │
│      │                                                               │
│      ▼                                                               │
│  ┌─────────────────────────────────────────┐                        │
│  │       ★ beforeunload event              │                        │
│  │       (Can prevent navigation)          │                        │
│  └─────────────────────────────────────────┘                        │
│      │                                                               │
│      ▼                                                               │
│  ┌─────────────────────────────────────────┐                        │
│  │       ★ unload event                    │                        │
│  │       (Page is being unloaded)          │                        │
│  └─────────────────────────────────────────┘                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Asosiy Events

### 1. DOMContentLoaded

```javascript
// DOM tayyor, lekin images/styles yuklanmagan bo'lishi mumkin
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM tayyor!');
    console.log(document.readyState); // "interactive"

    // DOM elementlariga kirish XAVFSIZ
    const header = document.querySelector('header');
    const buttons = document.querySelectorAll('button');

    // Event listeners qo'shish
    buttons.forEach(btn => {
        btn.addEventListener('click', handleClick);
    });
});

// defer scripts DOMContentLoaded dan OLDIN execute bo'ladi
// async scripts DOMContentLoaded ni kutmaydi
```

### 2. window.load

```javascript
// BARCHA resurslar yuklandi (images, iframes, fonts)
window.addEventListener('load', () => {
    console.log('Hammasi yuklandi!');
    console.log(document.readyState); // "complete"

    // Rasm o'lchamlarini olish XAVFSIZ
    const img = document.querySelector('img');
    console.log(img.naturalWidth, img.naturalHeight);

    // Font-based layout XAVFSIZ
    const element = document.querySelector('.custom-font');
    console.log(element.offsetWidth); // Font yuklangan

    // Loading spinner yashirish
    document.querySelector('.loader').classList.add('hidden');
});
```

### 3. beforeunload

```javascript
// Sahifadan chiqishdan OLDIN - foydalanuvchiga ogohlantirish
window.addEventListener('beforeunload', (event) => {
    // Foydalanuvchida saqlanmagan o'zgarishlar bormi?
    if (hasUnsavedChanges()) {
        // Standart dialog ko'rsatish
        event.preventDefault();
        // Chrome uchun (eski)
        event.returnValue = '';
        // Firefox uchun
        return '';
    }
});

// Amaliy misol: Form editing
let formDirty = false;
const form = document.querySelector('form');

form.addEventListener('input', () => {
    formDirty = true;
});

form.addEventListener('submit', () => {
    formDirty = false;
});

window.addEventListener('beforeunload', (e) => {
    if (formDirty) {
        e.preventDefault();
        e.returnValue = '';
    }
});
```

### 4. unload

```javascript
// Sahifa yopilmoqda - cleanup
window.addEventListener('unload', () => {
    // Analytics yuborish (sendBeacon ishlatish!)
    navigator.sendBeacon('/analytics', JSON.stringify({
        timeOnPage: Date.now() - pageLoadTime,
        scrollDepth: getScrollDepth()
    }));

    // LocalStorage cleanup
    localStorage.removeItem('tempData');

    // WebSocket yopish
    socket.close();
});

// MUHIM: unload eventda async operatsiyalar ISHLAMAYDI
// fetch, setTimeout, Promise - barchasi bekor qilinadi
// FAQAT sendBeacon ishlaydi
```

### 5. pagehide (Modern alternative)

```javascript
// unload o'rniga - bfcache bilan yaxshi ishlaydi
window.addEventListener('pagehide', (event) => {
    if (event.persisted) {
        // Page bfcache'ga kirmoqda
        console.log('Page cached for back/forward');
    } else {
        // Page haqiqatan yopilmoqda
        navigator.sendBeacon('/analytics', data);
    }
});

// pageshow - bfcache'dan qaytganda
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // bfcache'dan tiklandi
        console.log('Restored from cache');
        // State yangilash kerak bo'lishi mumkin
        refreshData();
    }
});
```

---

## readystatechange Event

```javascript
// Har bir state o'zgarishini kuzatish
document.addEventListener('readystatechange', () => {
    console.log(`State: ${document.readyState}`);

    switch (document.readyState) {
        case 'loading':
            // HTML parsing
            break;
        case 'interactive':
            // DOM ready, DOMContentLoaded fired
            initializeApp();
            break;
        case 'complete':
            // All loaded, window.load fired
            hideLoader();
            break;
    }
});
```

---

## Script Loading Strategiyalari

### Comparison
```html
<!-- 1. Default (Blocking) -->
<script src="app.js"></script>
<!-- HTML parsing to'xtaydi, script yuklanib execute bo'ladi -->

<!-- 2. defer -->
<script src="app.js" defer></script>
<!-- Parallel yuklash, DOMContentLoaded dan oldin execute -->

<!-- 3. async -->
<script src="app.js" async></script>
<!-- Parallel yuklash, yuklanganda darhol execute -->

<!-- 4. type="module" -->
<script type="module" src="app.js"></script>
<!-- defer ga o'xshash + ES modules support -->
```

### Visual Comparison
```
DEFAULT:
HTML:  ═══|parse|═══|blocked|═══|blocked|═══|parse|═══
JS:              |download|     |execute|

DEFER:
HTML:  ═══|parse|═══════════════════════════|═════════|DOMContentLoaded|
JS:              |download|                 |execute|

ASYNC:
HTML:  ═══|parse|═══════|blocked|═══════════|parse|═══|DOMContentLoaded|
JS:              |download|      |execute|

MODULE:
HTML:  ═══|parse|═══════════════════════════|═════════|DOMContentLoaded|
JS:              |download + parse deps|    |execute|
```

### Qachon qaysi birini ishlatish

```html
<!-- DEFER: Ko'pgina scriptlar uchun -->
<!-- DOM kerak, ketma-ketlik muhim -->
<script src="framework.js" defer></script>
<script src="app.js" defer></script>

<!-- ASYNC: Mustaqil scriptlar uchun -->
<!-- DOM kerak emas, ketma-ketlik muhim emas -->
<script src="analytics.js" async></script>
<script src="ads.js" async></script>

<!-- MODULE: Modern ES6+ apps -->
<script type="module" src="main.js"></script>

<!-- INLINE CRITICAL: First paint uchun kerak -->
<script>
    // Critical path JavaScript
    document.documentElement.classList.remove('no-js');
</script>
```

---

## MutationObserver

### Nima uchun kerak?
DOM o'zgarishlarini kuzatish - yangi elementlar qo'shilganda, atributlar o'zgarganda.

### Basic Usage
```javascript
// Observer yaratish
const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        console.log('Mutation type:', mutation.type);
        console.log('Target:', mutation.target);

        if (mutation.type === 'childList') {
            console.log('Added nodes:', mutation.addedNodes);
            console.log('Removed nodes:', mutation.removedNodes);
        }

        if (mutation.type === 'attributes') {
            console.log('Attribute changed:', mutation.attributeName);
            console.log('Old value:', mutation.oldValue);
        }
    });
});

// Kuzatishni boshlash
const targetNode = document.getElementById('container');
observer.observe(targetNode, {
    childList: true,      // Child elements qo'shilishi/o'chirilishi
    attributes: true,     // Attribute o'zgarishlari
    characterData: true,  // Text content o'zgarishi
    subtree: true,        // Barcha descendants
    attributeOldValue: true, // Eski attribute qiymatini saqlash
    characterDataOldValue: true // Eski text qiymatini saqlash
});

// To'xtatish
observer.disconnect();
```

### Real-World Cases

#### 1. Lazy Loading Images
```javascript
// Yangi qo'shilgan imagelarga lazy loading
const lazyObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Yangi qo'shilgan img larni topish
                const images = node.matches('img')
                    ? [node]
                    : node.querySelectorAll('img');

                images.forEach(img => {
                    if (img.dataset.src) {
                        intersectionObserver.observe(img);
                    }
                });
            }
        });
    });
});

lazyObserver.observe(document.body, {
    childList: true,
    subtree: true
});
```

#### 2. Third-party Script Detection
```javascript
// Tashqi scriptlar qo'shilishini kuzatish
const scriptObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.tagName === 'SCRIPT') {
                const src = node.src;
                if (src && !src.includes(window.location.origin)) {
                    console.warn('Third-party script injected:', src);
                    // Security check
                    if (isBlacklistedDomain(src)) {
                        node.remove();
                    }
                }
            }
        });
    });
});

scriptObserver.observe(document.head, { childList: true });
scriptObserver.observe(document.body, { childList: true });
```

#### 3. Auto-initialize Components
```javascript
// Yangi qo'shilgan componentlarni avtomatik initialize
const componentObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // data-component attributeli elementlarni topish
                const components = node.querySelectorAll('[data-component]');
                components.forEach(initComponent);

                if (node.dataset?.component) {
                    initComponent(node);
                }
            }
        });
    });
});

function initComponent(element) {
    const componentName = element.dataset.component;
    const ComponentClass = window.Components[componentName];

    if (ComponentClass && !element._initialized) {
        new ComponentClass(element);
        element._initialized = true;
    }
}

componentObserver.observe(document.body, {
    childList: true,
    subtree: true
});
```

#### 4. Form Dirty State Tracking
```javascript
// Form o'zgarishlarini kuzatish
function trackFormChanges(form) {
    const initialValues = new Map();

    // Boshlang'ich qiymatlarni saqlash
    form.querySelectorAll('input, textarea, select').forEach(input => {
        initialValues.set(input, input.value);
    });

    // Attribute o'zgarishlarini kuzatish
    const observer = new MutationObserver((mutations) => {
        let isDirty = false;

        form.querySelectorAll('input, textarea, select').forEach(input => {
            if (input.value !== initialValues.get(input)) {
                isDirty = true;
            }
        });

        form.classList.toggle('dirty', isDirty);
    });

    observer.observe(form, {
        subtree: true,
        attributes: true,
        attributeFilter: ['value']
    });

    // Input events ham kerak (attribute o'zgarishi bo'lmasligi mumkin)
    form.addEventListener('input', () => {
        // Check dirty state
    });

    return () => observer.disconnect();
}
```

---

## IntersectionObserver

### Nima uchun kerak?
Element viewport'ga kirganda/chiqqanda - lazy loading, infinite scroll, analytics.

### Basic Usage
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            console.log('Element visible:', entry.target);
            console.log('Visibility ratio:', entry.intersectionRatio);
        }
    });
}, {
    root: null,           // Viewport (default)
    rootMargin: '100px',  // Viewport ni kengaytirish
    threshold: [0, 0.5, 1] // Callback trigger qilish nuqtalari
});

observer.observe(document.querySelector('.lazy-section'));
```

### Lazy Loading Images
```javascript
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;

            // Src ni o'rnatish
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }

            // Observer'dan olib tashlash
            imageObserver.unobserve(img);
            img.classList.add('loaded');
        }
    });
}, {
    rootMargin: '200px' // 200px oldinroq yuklashni boshlash
});

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});
```

### Infinite Scroll
```javascript
function setupInfiniteScroll(container, loadMore) {
    // Sentinel element (list oxirida)
    const sentinel = document.createElement('div');
    sentinel.className = 'sentinel';
    container.appendChild(sentinel);

    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
            // Loading indicator
            sentinel.textContent = 'Loading...';

            // Yangi content yuklash
            const newItems = await loadMore();

            // Sentinel dan oldin qo'shish
            newItems.forEach(item => {
                container.insertBefore(item, sentinel);
            });

            sentinel.textContent = '';

            // Agar content tugagan bo'lsa
            if (newItems.length === 0) {
                observer.unobserve(sentinel);
                sentinel.textContent = 'No more items';
            }
        }
    }, {
        rootMargin: '200px'
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
}
```

### Section Analytics
```javascript
// Foydalanuvchi qaysi section'larni ko'rganini track qilish
const sectionViews = new Map();

const analyticsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const section = entry.target;
        const sectionId = section.id;

        if (entry.isIntersecting) {
            // Vaqtni boshlash
            sectionViews.set(sectionId, {
                startTime: Date.now(),
                viewed: true
            });
        } else {
            // View tugadi
            const data = sectionViews.get(sectionId);
            if (data?.startTime) {
                const viewDuration = Date.now() - data.startTime;

                // Analytics yuborish
                trackSectionView(sectionId, viewDuration);
            }
        }
    });
}, {
    threshold: 0.5 // 50% ko'rinsa
});

document.querySelectorAll('section[id]').forEach(section => {
    analyticsObserver.observe(section);
});
```

---

## ResizeObserver

### Nima uchun kerak?
Element o'lchami o'zgarganda - responsive components, charts.

### Basic Usage
```javascript
const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach(entry => {
        const { width, height } = entry.contentRect;
        console.log(`Element resized: ${width}x${height}`);

        // Border-box o'lchamlari
        const borderBoxSize = entry.borderBoxSize[0];
        console.log(`Border-box: ${borderBoxSize.inlineSize}x${borderBoxSize.blockSize}`);
    });
});

resizeObserver.observe(document.querySelector('.resizable'));
```

### Responsive Chart
```javascript
class ResponsiveChart {
    constructor(container) {
        this.container = container;
        this.canvas = container.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');

        // Resize kuzatish
        this.resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            this.resize(width, height);
        });

        this.resizeObserver.observe(container);
    }

    resize(width, height) {
        // Canvas resolution
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.ctx.scale(dpr, dpr);

        // Redraw
        this.draw();
    }

    destroy() {
        this.resizeObserver.disconnect();
    }
}
```

### Container Queries Polyfill
```javascript
// CSS Container Queries support bo'lmagan brauzerlar uchun
const containerObserver = new ResizeObserver((entries) => {
    entries.forEach(entry => {
        const container = entry.target;
        const width = entry.contentRect.width;

        // Size classes qo'shish
        container.classList.remove('sm', 'md', 'lg', 'xl');

        if (width < 400) {
            container.classList.add('sm');
        } else if (width < 600) {
            container.classList.add('md');
        } else if (width < 900) {
            container.classList.add('lg');
        } else {
            container.classList.add('xl');
        }
    });
});

document.querySelectorAll('[data-container]').forEach(container => {
    containerObserver.observe(container);
});
```

---

## To'g'ri va Noto'g'ri Misollar

### DOM Ready Check

```javascript
// NOTO'G'RI: Event o'tib ketgan bo'lishi mumkin
document.addEventListener('DOMContentLoaded', init);
// Agar script body oxirida yoki defer bilan bo'lsa, event allaqachon fire bo'lgan

// TO'G'RI: State tekshirish
function domReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        // DOM allaqachon tayyor
        callback();
    }
}

domReady(() => {
    console.log('DOM tayyor!');
});
```

### Resource Loading

```javascript
// NOTO'G'RI: Image o'lchami noto'g'ri
document.addEventListener('DOMContentLoaded', () => {
    const img = document.querySelector('img');
    console.log(img.naturalWidth); // 0! Image yuklanmagan
});

// TO'G'RI: Image yuklangan bo'lsa
function whenImageLoaded(img) {
    return new Promise((resolve) => {
        if (img.complete && img.naturalWidth > 0) {
            resolve(img);
        } else {
            img.addEventListener('load', () => resolve(img));
            img.addEventListener('error', () => resolve(null));
        }
    });
}

// Ishlatish
const img = document.querySelector('img');
whenImageLoaded(img).then(loadedImg => {
    if (loadedImg) {
        console.log(loadedImg.naturalWidth, loadedImg.naturalHeight);
    }
});
```

### Cleanup

```javascript
// NOTO'G'RI: Memory leak
class Component {
    constructor() {
        this.observer = new MutationObserver(this.handleMutation);
        this.observer.observe(document.body, { childList: true });
        window.addEventListener('resize', this.handleResize);
    }
    // Hech qachon cleanup qilinmaydi!
}

// TO'G'RI: Proper cleanup
class ComponentWithCleanup {
    constructor(element) {
        this.element = element;
        this.handleResize = this.handleResize.bind(this);

        this.mutationObserver = new MutationObserver(this.handleMutation);
        this.mutationObserver.observe(element, { childList: true });

        this.resizeObserver = new ResizeObserver(this.handleElementResize);
        this.resizeObserver.observe(element);

        window.addEventListener('resize', this.handleResize);
    }

    destroy() {
        this.mutationObserver.disconnect();
        this.resizeObserver.disconnect();
        window.removeEventListener('resize', this.handleResize);
        this.element = null;
    }
}
```

---

## Interview Savollari

### 1. Savol: DOMContentLoaded va load farqi nima?
**Javob:**
- **DOMContentLoaded**: HTML parse tugadi, DOM tayyor. Images, stylesheets, subframes hali yuklanmagan bo'lishi mumkin.
- **load**: BARCHA resurslar yuklandi - images, styles, fonts, iframes.

```javascript
// DOMContentLoaded - DOM manipulyatsiya uchun
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('button');
    button.addEventListener('click', handleClick);
});

// load - Image o'lchamlari, font metrics uchun
window.addEventListener('load', () => {
    const img = document.querySelector('img');
    console.log(img.naturalWidth); // Real o'lcham
});
```

### 2. Savol: defer va async script farqi nima?
**Javob:**
| Feature | defer | async |
|---------|-------|-------|
| Parsing blocking | Yo'q | Yo'q |
| Execution order | HTML tartibida | Yuklangan tartibda |
| DOMContentLoaded | Oldin execute | Kutmaydi |
| Use case | App scripts | Analytics, ads |

### 3. Savol: MutationObserver nima uchun kerak?
**Javob:**
DOM o'zgarishlarini kuzatish - deprecated `DOMNodeInserted` o'rniga. Use cases:
- Lazy loading (yangi elementlarga)
- Component auto-initialization
- Third-party script monitoring
- Form state tracking

```javascript
const observer = new MutationObserver(callback);
observer.observe(target, { childList: true, subtree: true });
```

### 4. Savol: IntersectionObserver scroll event dan qanday farq qiladi?
**Javob:**
| Feature | scroll event | IntersectionObserver |
|---------|--------------|---------------------|
| Performance | Har scroll da | Optimized, batched |
| Main thread | Blocking | Non-blocking |
| Threshold | Manual hisoblash | Built-in |
| Root margin | Manual | Built-in |

```javascript
// scroll - Har scroll da fire, main thread blocking
window.addEventListener('scroll', () => {
    const rect = element.getBoundingClientRect(); // Layout trigger!
});

// IntersectionObserver - Optimized
const observer = new IntersectionObserver((entries) => {
    // Faqat visibility o'zgarganda
});
```

### 5. Savol: beforeunload va unload farqi, qaysi biri yaxshiroq?
**Javob:**
- **beforeunload**: Navigatsiya ni TO'XTATISH mumkin (saqlanmagan o'zgarishlar)
- **unload**: Cleanup, lekin async ISHLAMAYDI
- **pagehide**: Modern alternative, bfcache bilan yaxshi ishlaydi

```javascript
// beforeunload - faqat saqlanmagan data uchun
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
        e.preventDefault();
    }
});

// pagehide - cleanup uchun (unload o'rniga)
window.addEventListener('pagehide', () => {
    navigator.sendBeacon('/analytics', data);
});
```

---

## Performance Tips

### 1. Script Loading Strategy
```html
<!-- Critical path -->
<script>
    // Inline critical JS (< 1KB)
    document.documentElement.classList.add('js');
</script>

<!-- Main app - defer -->
<script src="app.js" defer></script>

<!-- Analytics - async -->
<script src="analytics.js" async></script>

<!-- Lazy load -->
<script>
    // Dynamic import for non-critical features
    button.addEventListener('click', async () => {
        const { Modal } = await import('./modal.js');
        new Modal().show();
    });
</script>
```

### 2. Observer Cleanup
```javascript
// SPA da observer cleanup
class Page {
    observers = [];

    init() {
        const io = new IntersectionObserver(/*...*/);
        this.observers.push(io);

        const mo = new MutationObserver(/*...*/);
        this.observers.push(mo);
    }

    destroy() {
        this.observers.forEach(o => o.disconnect());
        this.observers = [];
    }
}
```

### 3. Debounced Observers
```javascript
// ResizeObserver debounce qilish
let resizeTimeout;
const debouncedResizeObserver = new ResizeObserver((entries) => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        entries.forEach(handleResize);
    }, 100);
});
```

### 4. Passive Event Listeners
```javascript
// Scroll/touch events uchun passive
window.addEventListener('scroll', handleScroll, { passive: true });

// Bu brauzerga aytadi: preventDefault() chaqirilmaydi
// Natija: Smooth scrolling
```

### 5. requestIdleCallback
```javascript
// Non-critical ishlarni idle paytda bajarish
function performNonCriticalWork() {
    requestIdleCallback((deadline) => {
        while (deadline.timeRemaining() > 0 && tasks.length > 0) {
            const task = tasks.shift();
            task();
        }

        if (tasks.length > 0) {
            requestIdleCallback(performNonCriticalWork);
        }
    });
}
```

---

## Xulosa

| Event/Observer | Qachon | Use Case |
|----------------|--------|----------|
| DOMContentLoaded | DOM ready | DOM setup, event listeners |
| load | All loaded | Image sizes, fonts |
| beforeunload | Before leaving | Unsaved changes warning |
| pagehide | Page hidden | Analytics, cleanup |
| MutationObserver | DOM changes | Auto-init, lazy load |
| IntersectionObserver | Visibility | Lazy load, infinite scroll |
| ResizeObserver | Size changes | Responsive components |
