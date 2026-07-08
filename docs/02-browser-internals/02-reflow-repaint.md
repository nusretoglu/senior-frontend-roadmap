# Reflow va Repaint - Layout Thrashing va Optimizatsiya

## Kirish

**Reflow** (Layout) va **Repaint** brauzer rendering pipeline'ning eng "qimmat" operatsiyalari. Noto'g'ri foydalanish 60fps o'rniga 10fps hosil qiladi.

---

## Asosiy Tushunchalar

### Reflow (Layout)
Element geometriyasi (position, size, margin, padding) o'zgarganda butun yoki qisman sahifa qayta hisoblanadi.

### Repaint (Paint)
Element ko'rinishi (color, background, visibility) o'zgarganda piksellar qayta chiziladi.

### Qoida
```
Reflow → doim Repaint trigger qiladi
Repaint → Reflow trigger QILMAYDI
```

---

## Trigger Qiladigan Operatsiyalar

### Layout (Reflow) Trigger

```javascript
// GEOMETRY O'ZGARISHI
element.style.width = '100px';
element.style.height = '50px';
element.style.padding = '10px';
element.style.margin = '20px';
element.style.border = '1px solid';
element.style.top = '100px';
element.style.left = '50px';
element.style.position = 'absolute';
element.style.display = 'block';
element.style.float = 'left';
element.style.fontSize = '16px';
element.style.fontFamily = 'Arial';
element.style.lineHeight = '1.5';
element.style.textAlign = 'center';
element.style.overflow = 'hidden';

// DOM MANIPULYATSIYA
element.appendChild(child);
element.removeChild(child);
element.insertBefore(newNode, referenceNode);
element.innerHTML = 'new content';
element.textContent = 'new text';

// CLASS O'ZGARISHI (agar geometry o'zgarsa)
element.className = 'new-class';
element.classList.add('wide');
```

### Layout O'QISH (Forced Synchronous Layout)

```javascript
// BU OPERATSIYALAR PENDING LAYOUT'NI MAJBURAN EXECUTE QILADI
element.offsetTop;
element.offsetLeft;
element.offsetWidth;
element.offsetHeight;
element.offsetParent;

element.clientTop;
element.clientLeft;
element.clientWidth;
element.clientHeight;

element.scrollTop;
element.scrollLeft;
element.scrollWidth;
element.scrollHeight;

element.getClientRects();
element.getBoundingClientRect();

window.getComputedStyle(element);
window.getComputedStyle(element).getPropertyValue('height');

element.focus(); // Scrolling kerak bo'lsa
element.scrollTo();
element.scrollIntoView();

// Input elements
input.select();
input.selectionStart;
input.selectionEnd;
```

### Paint (Repaint) Trigger

```css
/* Bu xossalar FAQAT paint trigger qiladi (layout emas) */
.repaint-only {
    color: red;
    background-color: blue;
    background-image: url(...);
    border-color: green;
    border-style: dashed;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    outline: 1px solid;
    visibility: visible; /* hidden ham */
    text-decoration: underline;
}
```

### Composite Only (Eng tezkor)

```css
/* Bu xossalar NA layout NA paint trigger qiladi */
.composite-only {
    transform: translateX(100px);
    transform: scale(1.5);
    transform: rotate(45deg);
    transform: skew(10deg);
    opacity: 0.5;
    /* filter ham composite, lekin ba'zi brauzerlarda paint */
}
```

---

## Layout Thrashing

### Muammo
```javascript
// HAR ITERATSIYADA READ → WRITE → READ → WRITE...
// Bu "layout thrashing" - har o'qishda layout qayta hisoblanadi

function badLoop(elements) {
    elements.forEach(el => {
        // READ: layout trigger
        const width = el.offsetWidth;
        // WRITE: layout invalidate
        el.style.width = width + 10 + 'px';
        // Keyingi READ uchun layout qayta hisoblanadi
    });
}
// 100 element = 100 layout!
```

### Vizualizatsiya
```
BAD Pattern (Layout Thrashing):
├─ Read offsetWidth  → Layout #1
├─ Write style.width → Invalidate
├─ Read offsetWidth  → Layout #2
├─ Write style.width → Invalidate
├─ Read offsetWidth  → Layout #3
└─ ... (N marta)

GOOD Pattern (Batched):
├─ Read offsetWidth  ─┐
├─ Read offsetWidth   │→ Layout #1 (bir marta)
├─ Read offsetWidth  ─┘
├─ Write style.width ─┐
├─ Write style.width  │→ Layout #2 (bir marta, keyingi frame'da)
└─ Write style.width ─┘
```

### Yechim: Read/Write Separation
```javascript
// TO'G'RI: Avval barcha READ, keyin barcha WRITE
function goodLoop(elements) {
    // PHASE 1: Barcha o'qishlar
    const widths = elements.map(el => el.offsetWidth);

    // PHASE 2: Barcha yozishlar
    elements.forEach((el, i) => {
        el.style.width = widths[i] + 10 + 'px';
    });
}
// 100 element = 2 layout (1 read phase + 1 write phase)
```

---

## Forced Synchronous Layout

### Muammo
```javascript
// JavaScript pending layout'ni majburan execute qiladi
function forcedLayout() {
    element.style.width = '100px';     // Layout pending
    console.log(element.offsetWidth);   // Forced layout NOW
    element.style.width = '200px';     // Layout pending
    console.log(element.offsetWidth);   // Forced layout NOW again
}
```

### DevTools'da Ko'rish
```
Performance panel'da:
- "Recalculate Style" dan keyin "Layout"
- Warning: "Forced reflow is a likely performance bottleneck"
```

### Yechim Patterns

#### Pattern 1: FastDOM kutubxonasi
```javascript
import fastdom from 'fastdom';

function optimizedUpdate() {
    // Reads va writes avtomatik batch qilinadi
    fastdom.measure(() => {
        const width = element.offsetWidth;

        fastdom.mutate(() => {
            element.style.width = width + 10 + 'px';
        });
    });
}
```

#### Pattern 2: requestAnimationFrame
```javascript
function rafBatching(elements) {
    // Read phase - sync
    const measurements = elements.map(el => ({
        width: el.offsetWidth,
        height: el.offsetHeight
    }));

    // Write phase - next frame
    requestAnimationFrame(() => {
        elements.forEach((el, i) => {
            el.style.width = measurements[i].width + 10 + 'px';
        });
    });
}
```

#### Pattern 3: DocumentFragment
```javascript
// Ko'p element qo'shishda
function appendManyElements(container, items) {
    // YOMON: Har appendChild da layout
    items.forEach(item => {
        const div = document.createElement('div');
        div.textContent = item;
        container.appendChild(div); // Layout har safar
    });

    // YAXSHI: DocumentFragment
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
        const div = document.createElement('div');
        div.textContent = item;
        fragment.appendChild(div); // Layout yo'q
    });
    container.appendChild(fragment); // Bitta layout
}
```

#### Pattern 4: CSS Class Toggle
```javascript
// YOMON: Inline styles
function updateStyles(elements) {
    elements.forEach(el => {
        el.style.width = '200px';
        el.style.height = '100px';
        el.style.padding = '20px';
    });
}

// YAXSHI: CSS class
function updateStylesOptimized(elements) {
    elements.forEach(el => {
        el.classList.add('expanded');
    });
}
```

```css
.expanded {
    width: 200px;
    height: 100px;
    padding: 20px;
}
```

---

## Real-World Cases

### Case 1: Infinite Scroll List

```javascript
// MUAMMO: Layout thrashing scroll'da
window.addEventListener('scroll', () => {
    items.forEach(item => {
        // Forced layout har item uchun
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            item.classList.add('visible');
        }
    });
});

// YECHIM: IntersectionObserver
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { rootMargin: '100px' });

items.forEach(item => observer.observe(item));
```

### Case 2: Form Validation

```javascript
// MUAMMO: Har input da layout
function validateForm() {
    inputs.forEach(input => {
        const isValid = validate(input.value);
        // Layout trigger
        input.style.borderColor = isValid ? 'green' : 'red';
        errorSpan.style.display = isValid ? 'none' : 'block';
    });
}

// YECHIM: CSS classes + requestAnimationFrame
function validateFormOptimized() {
    // Validation logic (no DOM)
    const results = inputs.map(input => ({
        element: input,
        isValid: validate(input.value)
    }));

    // Batch DOM updates
    requestAnimationFrame(() => {
        results.forEach(({ element, isValid }) => {
            element.classList.toggle('invalid', !isValid);
        });
    });
}
```

```css
.input {
    border: 2px solid #ccc;
    transition: border-color 0.2s;
}
.input.invalid {
    border-color: red;
}
.input.invalid + .error-message {
    display: block;
}
```

### Case 3: Resize Animation

```javascript
// MUAMMO: Height animatsiya = layout har frame
function animateHeight(element, targetHeight) {
    const startHeight = element.offsetHeight;
    const startTime = performance.now();
    const duration = 300;

    function frame(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Layout har frame!
        element.style.height = startHeight + (targetHeight - startHeight) * progress + 'px';

        if (progress < 1) {
            requestAnimationFrame(frame);
        }
    }
    requestAnimationFrame(frame);
}

// YECHIM 1: FLIP technique
function animateHeightFLIP(element) {
    // First: Boshlang'ich holat
    const first = element.getBoundingClientRect();

    // Last: Oxirgi holat (class orqali)
    element.classList.add('expanded');
    const last = element.getBoundingClientRect();

    // Invert: Teskari transform
    const deltaY = first.height - last.height;
    element.style.transform = `scaleY(${first.height / last.height})`;
    element.style.transformOrigin = 'top';

    // Play: Animate back
    requestAnimationFrame(() => {
        element.style.transition = 'transform 0.3s ease-out';
        element.style.transform = '';
    });
}

// YECHIM 2: max-height trick
```

```css
.expandable {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out;
}
.expandable.expanded {
    max-height: 500px; /* Yetarlicha katta qiymat */
}
```

### Case 4: Parallax Effect

```javascript
// MUAMMO: top/left = layout har scroll
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    parallaxElements.forEach(el => {
        el.style.top = scrollY * el.dataset.speed + 'px';
    });
});

// YECHIM: transform + passive + rAF
let lastScrollY = 0;
let ticking = false;

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;

    if (!ticking) {
        requestAnimationFrame(() => {
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.speed);
                el.style.transform = `translateY(${lastScrollY * speed}px)`;
            });
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });
```

---

## CSS Containment

### contain Property
```css
/* Layout scope cheklash */
.widget {
    contain: layout; /* Bu element ichidagi layout tashqariga ta'sir qilmaydi */
}

.widget-full {
    contain: strict; /* layout + paint + size + style */
    /* Eng kuchli izolyatsiya, lekin size oldindan kerak */
}

.widget-content {
    contain: content; /* layout + paint (size emas) */
}
```

### content-visibility (Lazy Rendering)
```css
/* Viewport tashqarisidagi elementlar render qilinmaydi */
.section {
    content-visibility: auto;
    contain-intrinsic-size: 0 500px; /* Estimated size */
}
```

```javascript
// Performance natijasi
// 1000 card, har biri 500px
// Oddiy: 1000 ta layout
// content-visibility: ~10 ta layout (visible + buffer)
```

---

## DevTools Debugging

### 1. Performance Panel
```
1. DevTools → Performance → Record
2. Interaksiya qiling
3. Natijada:
   - "Recalculate Style" (purple) = Style calculation
   - "Layout" (purple) = Reflow
   - "Paint" (green) = Repaint
   - "Composite Layers" (green) = GPU composite

4. Warning icons:
   - "Forced reflow while executing JavaScript"
   - Ustiga bosing → source code ko'rsatadi
```

### 2. Console API
```javascript
// Layout trigger sabablarini topish
console.time('layout-check');

element.style.width = '100px';
// Qaysi operatsiya layout trigger qildi?
console.log('Before read');
const width = element.offsetWidth; // Bu yerda!
console.log('After read:', width);

console.timeEnd('layout-check');
```

### 3. Custom Performance Monitoring
```javascript
// Reflow counter
let reFlowCount = 0;
const originalOffsetWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetWidth'
);

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    get() {
        reFlowCount++;
        console.trace('offsetWidth accessed');
        return originalOffsetWidth.get.call(this);
    }
});

// Test
function myFunction() {
    const el = document.querySelector('.box');
    el.style.width = '100px';
    const w = el.offsetWidth; // Bu yerda log chiqadi
}

myFunction();
console.log('Total reflows triggered:', reFlowCount);
```

---

## Interview Savollari

### 1. Savol: Reflow va Repaint farqi nima?
**Javob:**
- **Reflow (Layout)**: Element geometriyasi o'zgarganda (width, height, position). Qimmat - butun yoki qisman sahifa qayta hisoblanadi.
- **Repaint (Paint)**: Element ko'rinishi o'zgarganda (color, background). Nisbatan arzonroq.

**Qoida:** Reflow doim Repaint trigger qiladi, lekin Repaint Reflow trigger qilmaydi.

### 2. Savol: Layout thrashing nima va qanday oldini olish mumkin?
**Javob:**
Layout thrashing - bu READ va WRITE operatsiyalarining navbatma-navbat bajarilishi natijasida har o'qishda majburiy layout hisoblanishi.

**Oldini olish:**
```javascript
// YOMON
elements.forEach(el => {
    el.style.width = el.offsetWidth + 10 + 'px'; // Har safar layout
});

// YAXSHI
const widths = elements.map(el => el.offsetWidth); // Bir layout
elements.forEach((el, i) => {
    el.style.width = widths[i] + 10 + 'px';
});
```

### 3. Savol: Qaysi CSS properties layout trigger qiladi?
**Javob:**
- **Layout trigger:** width, height, padding, margin, border-width, top, left, position, display, font-size, float, overflow
- **Paint only:** color, background, visibility, border-color, box-shadow
- **Composite only:** transform, opacity

**Tool:** [CSS Triggers](https://csstriggers.com/)

### 4. Savol: Forced synchronous layout nima?
**Javob:**
JavaScript DOM yozishdan keyin darhol o'qiganda, brauzer pending layout'ni majburan execute qiladi:

```javascript
element.style.width = '100px'; // Write - layout pending
const width = element.offsetWidth; // Read - FORCED layout NOW
```

**DevTools:** Performance panel'da "Forced reflow" warning.

### 5. Savol: CSS contain property nima uchun kerak?
**Javob:**
`contain` property element ichidagi o'zgarishlar tashqariga ta'sir qilmasligini kafolatlaydi:

```css
.widget {
    contain: layout; /* Layout scope cheklash */
}
```

**Foyda:**
- Widget ichidagi reflow butun sahifaga tarqalmaydi
- Brauzer faqat widget ni qayta hisoblaydi
- Katta sahifalarda sezilarli performance yaxshilanish

---

## Performance Tips

### 1. Batch DOM Reads and Writes
```javascript
// FastDOM pattern
const reads = [];
const writes = [];

function scheduleRead(fn) {
    reads.push(fn);
    scheduleFlush();
}

function scheduleWrite(fn) {
    writes.push(fn);
    scheduleFlush();
}

let scheduled = false;
function scheduleFlush() {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
        // All reads first
        reads.forEach(fn => fn());
        reads.length = 0;

        // Then all writes
        writes.forEach(fn => fn());
        writes.length = 0;

        scheduled = false;
    });
}
```

### 2. Virtual DOM Concept
```javascript
// React/Vue qanday ishlaydi (simplified)
function updateUI(newState) {
    // 1. Virtual DOM yaratish (hech qanday real DOM)
    const virtualDOM = render(newState);

    // 2. Diff hisoblash (hech qanday real DOM)
    const patches = diff(previousVirtualDOM, virtualDOM);

    // 3. Minimal DOM o'zgarishlar (batched)
    requestAnimationFrame(() => {
        applyPatches(realDOM, patches);
    });

    previousVirtualDOM = virtualDOM;
}
```

### 3. CSS Animations vs JavaScript
```css
/* CSS - Compositor thread'da, main thread free */
.animate {
    transition: transform 0.3s;
}
.animate:hover {
    transform: scale(1.1);
}
```

```javascript
// JavaScript - faqat murakkab animatsiyalar uchun
// Web Animations API
element.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.1)' }
], {
    duration: 300,
    fill: 'forwards'
});
```

### 4. Avoid Layout Properties in Loops
```javascript
// Caching qiling
function processElements(elements) {
    // Cache viewport dimensions
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Cache element measurements
    const rects = elements.map(el => el.getBoundingClientRect());

    // Process without triggering layout
    rects.forEach((rect, i) => {
        if (rect.top < viewportHeight) {
            elements[i].classList.add('visible');
        }
    });
}
```

### 5. Use transform Instead of Position
```css
/* YOMON: position properties = layout */
.tooltip {
    position: absolute;
    top: 100px;
    left: 50px;
    transition: top 0.3s, left 0.3s;
}

/* YAXSHI: transform = composite only */
.tooltip {
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(50px, 100px);
    transition: transform 0.3s;
}
```

---

## Xulosa

| Operation | Cost | Trigger |
|-----------|------|---------|
| Layout (Reflow) | HIGH | Geometry change, DOM read after write |
| Paint (Repaint) | MEDIUM | Visual change (color, shadow) |
| Composite | LOW | transform, opacity |

**Eng muhim qoidalar:**
1. READ va WRITE operatsiyalarini ajrating
2. `transform` va `opacity` animatsiya uchun
3. `contain` bilan layout scope cheklang
4. `requestAnimationFrame` bilan batch qiling
5. DevTools Performance panel bilan profiling qiling
