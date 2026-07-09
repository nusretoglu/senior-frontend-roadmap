# CSS Animations - Transitions va Keyframes

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Animatsiyalar shunchaki "chiroyli dizayn" uchun qilinmaydi. Ular foydalanuvchiga tizim nima qilayotganini tushuntirib turuvchi asosiy muloqot vositasidir. (Masalan, knopkani bosganda yuklanayotganini ko'rsatuvchi spinner). Lekin noto'g'ri qilingan animatsiyalar telefon batareyasini tez tugatadi va sahifani qotirib qo'yadi. Yaxshi dasturchi GPU tezlashtiruvchi xususiyatlarni bilishi va 60 FPS da ishlaydigan animatsiyalar yarata olishi kerak.

> [!NOTE]
> **Real-hayot analogiyasi: "Teatr sahnasi"**  
> `transition` ni chiroqning asta-sekin yonishiga yoki o'chishiga o'xshatish mumkin. Faqatgina ikkita holat bor: Boshlanishi va Tugashi. 
> `keyframes` animatsiyasi esa teatr aktyorining butun bir sahnadagi o'yini: U qayerga boradi, qachon to'xtaydi, qachon aylanadi — barchasi minutma-minut, foizma-foiz (0%, 50%, 100%) yozib chiqiladi.
## Mundarija

1. [Transitions](#transitions)
2. [Keyframe Animations](#keyframe-animations)
3. [Animation Performance](#animation-performance)
4. [Transform Properties](#transform-properties)
5. [Timing Functions](#timing-functions)
6. [Advanced Techniques](#advanced-techniques)
7. [Accessibility Considerations](#accessibility-considerations)
8. [Real-world Examples](#real-world-examples)
9. [Interview savollari](#interview-savollari)
10. [Best Practices](#best-practices)

---

## Transitions

Transitions - property o'zgarishini silliq qiladi.

### Asosiy Sintaksis

```css
.element {
  /* Longhand */
  transition-property: background-color;
  transition-duration: 300ms;
  transition-timing-function: ease;
  transition-delay: 0ms;

  /* Shorthand */
  transition: background-color 300ms ease 0ms;

  /* Multiple properties */
  transition: background-color 300ms, transform 200ms ease-out;

  /* All properties */
  transition: all 300ms ease;
}

.element:hover {
  background-color: blue;
}
```

### Transition Properties

```css
.element {
  /* Animatable properties */
  transition: opacity 300ms;          /* 0 - 1 */
  transition: transform 300ms;        /* translate, scale, rotate */
  transition: background-color 300ms; /* colors */
  transition: width 300ms;            /* dimensions (performance issue) */
  transition: box-shadow 300ms;       /* shadows */
}
```

### Animatable vs Non-animatable

```css
/* ANIMATABLE */
opacity, transform, color, background-color, border-color,
width, height, top, left, right, bottom,
margin, padding, font-size, line-height,
box-shadow, text-shadow, border-radius

/* NON-ANIMATABLE */
display, visibility (sort of), position,
float, background-image (without gradient),
font-family, content
```

### Button Hover Example

```css
.button {
  background: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  /* Smooth transitions */
  transition:
    background-color 200ms ease,
    transform 150ms ease,
    box-shadow 200ms ease;
}

.button:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
}

.button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
}

/* Focus state for accessibility */
.button:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
```

### Card Hover Effect

```css
.card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 300ms ease,
    box-shadow 300ms ease;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 400ms ease;
}

.card:hover .card-image {
  transform: scale(1.05);
}
```

---

## Keyframe Animations

Keyframes - murakkab, ko'p bosqichli animatsiyalar.

### Asosiy Sintaksis

```css
/* Define animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Or with percentages */
@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply animation */
.element {
  animation: fadeIn 300ms ease forwards;
}
```

### Animation Properties

```css
.element {
  /* Longhand */
  animation-name: slideIn;
  animation-duration: 500ms;
  animation-timing-function: ease-out;
  animation-delay: 0ms;
  animation-iteration-count: 1;        /* 1, 2, infinite */
  animation-direction: normal;         /* normal, reverse, alternate */
  animation-fill-mode: forwards;       /* none, forwards, backwards, both */
  animation-play-state: running;       /* running, paused */

  /* Shorthand */
  animation: slideIn 500ms ease-out 0ms 1 normal forwards running;

  /* Minimal shorthand */
  animation: slideIn 500ms ease-out forwards;
}
```

### Animation Fill Mode

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* none - default state before and after */
.element {
  opacity: 0.5;
  animation: fadeIn 300ms ease;
  /* Animatsiyadan keyin opacity: 0.5 ga qaytadi */
}

/* forwards - end state saqlaydi */
.element {
  animation: fadeIn 300ms ease forwards;
  /* Animatsiyadan keyin opacity: 1 qoladi */
}

/* backwards - start state delay vaqtida */
.element {
  animation: fadeIn 300ms ease 1s backwards;
  /* 1s delay vaqtida opacity: 0 */
}

/* both - forwards + backwards */
.element {
  animation: fadeIn 300ms ease 1s both;
}
```

### Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade In Down */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Slide In Right */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Bounce */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

/* Pulse */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Shake */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Spin */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Ping (notification) */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
```

### Staggered Animations

```css
/* List items staggered */
.list-item {
  opacity: 0;
  animation: fadeInUp 400ms ease forwards;
}

.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 100ms; }
.list-item:nth-child(3) { animation-delay: 200ms; }
.list-item:nth-child(4) { animation-delay: 300ms; }
.list-item:nth-child(5) { animation-delay: 400ms; }

/* Or with custom property */
.list-item {
  animation: fadeInUp 400ms ease forwards;
  animation-delay: calc(var(--index, 0) * 100ms);
}
```

```html
<ul>
  <li class="list-item" style="--index: 0">Item 1</li>
  <li class="list-item" style="--index: 1">Item 2</li>
  <li class="list-item" style="--index: 2">Item 3</li>
</ul>
```

---

## Animation Performance

### GPU-Accelerated Properties

```css
/* TEZKOR - GPU accelerated */
transform: translateX(100px);
transform: translateY(50px);
transform: translate3d(100px, 50px, 0);
transform: scale(1.5);
transform: rotate(45deg);
opacity: 0.5;
filter: blur(5px);

/* SEKIN - Layout/Paint triggerlaydi */
width: 200px;       /* Layout */
height: 100px;      /* Layout */
top: 50px;          /* Layout */
left: 100px;        /* Layout */
margin: 20px;       /* Layout */
padding: 10px;      /* Layout */
border-width: 2px;  /* Layout */
font-size: 16px;    /* Layout */
background-color: red; /* Paint */
box-shadow: ...;    /* Paint */
```

### will-change Property

```css
/* Browser ga animatsiya bo'lishini aytish */
.element {
  will-change: transform, opacity;
}

/* Faqat kerak bo'lganda */
.element:hover {
  will-change: transform;
}

/* Hover tugagach o'chirish */
.element {
  will-change: auto;
}
```

**Ogohlantirish:** `will-change` ni ortiqcha ishlatmang - har element uchun alohida compositor layer yaratiladi.

### Transform Origin

```css
.element {
  /* Default: center center */
  transform-origin: center center;

  /* Custom */
  transform-origin: top left;
  transform-origin: 0 0;
  transform-origin: 100% 100%;
  transform-origin: 50px 30px;
}

/* Rotation from corner */
.card {
  transform-origin: bottom right;
  transition: transform 300ms;
}

.card:hover {
  transform: rotate(5deg);
}
```

### Composite Only Animations

```css
/* YOMON - width animation */
.bar {
  width: 0;
  transition: width 500ms;
}
.bar.active {
  width: 100%;
}

/* YAXSHI - transform animation */
.bar {
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 500ms;
}
.bar.active {
  transform: scaleX(1);
}
```

### contain Property

```css
/* Browser ga element boundaries aytish */
.animated-element {
  contain: layout style paint;
  /* yoki */
  contain: strict;
}
```

---

## Transform Properties

### 2D Transforms

```css
.element {
  /* Translate - move */
  transform: translateX(100px);
  transform: translateY(50px);
  transform: translate(100px, 50px);

  /* Scale - resize */
  transform: scaleX(1.5);
  transform: scaleY(0.8);
  transform: scale(1.5);      /* uniform */
  transform: scale(1.5, 0.8); /* x, y */

  /* Rotate */
  transform: rotate(45deg);
  transform: rotate(0.5turn);
  transform: rotate(3.14rad);

  /* Skew */
  transform: skewX(15deg);
  transform: skewY(10deg);
  transform: skew(15deg, 10deg);

  /* Combined */
  transform: translateX(100px) rotate(45deg) scale(1.2);
  /* Tartib muhim! O'ngdan chapga apply bo'ladi */
}
```

### 3D Transforms

```css
.element {
  /* Perspective - parent ga qo'yiladi */
  perspective: 1000px;
  perspective-origin: center center;
}

.child {
  /* 3D transforms */
  transform: translateZ(100px);
  transform: translate3d(100px, 50px, 30px);
  transform: rotateX(45deg);
  transform: rotateY(45deg);
  transform: rotateZ(45deg);
  transform: rotate3d(1, 1, 0, 45deg);
  transform: scaleZ(1.5);
  transform: scale3d(1, 1.5, 2);

  /* 3D space saqlash */
  transform-style: preserve-3d;

  /* Back face */
  backface-visibility: hidden; /* visible | hidden */
}
```

### Card Flip Effect

```html
<div class="flip-card">
  <div class="flip-card-inner">
    <div class="flip-card-front">
      Front Content
    </div>
    <div class="flip-card-back">
      Back Content
    </div>
  </div>
</div>
```

```css
.flip-card {
  width: 300px;
  height: 200px;
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 600ms;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.flip-card-front {
  background: #007bff;
  color: white;
}

.flip-card-back {
  background: #28a745;
  color: white;
  transform: rotateY(180deg);
}
```

---

## Timing Functions

### Built-in Timing Functions

```css
.element {
  /* Linear - tezlik o'zgarmas */
  transition: transform 300ms linear;

  /* Ease - default, slow start/end */
  transition: transform 300ms ease;

  /* Ease-in - slow start */
  transition: transform 300ms ease-in;

  /* Ease-out - slow end */
  transition: transform 300ms ease-out;

  /* Ease-in-out - slow start and end */
  transition: transform 300ms ease-in-out;

  /* Step functions */
  transition: transform 1s steps(5);
  transition: transform 1s steps(5, jump-start);
  transition: transform 1s step-start;
  transition: transform 1s step-end;
}
```

### Cubic Bezier

```css
.element {
  /* cubic-bezier(x1, y1, x2, y2) */

  /* Snappy */
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Bouncy */
  transition: transform 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Smooth deceleration */
  transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);

  /* Smooth acceleration */
  transition: transform 300ms cubic-bezier(0.4, 0, 1, 1);
}
```

### Named Timing Functions (CSS Custom)

```css
:root {
  --ease-in-quad: cubic-bezier(0.55, 0.085, 0.68, 0.53);
  --ease-in-cubic: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  --ease-in-quart: cubic-bezier(0.895, 0.03, 0.685, 0.22);
  --ease-in-quint: cubic-bezier(0.755, 0.05, 0.855, 0.06);
  --ease-in-expo: cubic-bezier(0.95, 0.05, 0.795, 0.035);
  --ease-in-circ: cubic-bezier(0.6, 0.04, 0.98, 0.335);

  --ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
  --ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-out-circ: cubic-bezier(0.075, 0.82, 0.165, 1);

  --ease-in-out-quad: cubic-bezier(0.455, 0.03, 0.515, 0.955);
  --ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
  --ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-in-out-quint: cubic-bezier(0.86, 0, 0.07, 1);
  --ease-in-out-expo: cubic-bezier(1, 0, 0, 1);
  --ease-in-out-circ: cubic-bezier(0.785, 0.135, 0.15, 0.86);

  /* Bounce */
  --ease-out-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-in-bounce: cubic-bezier(0.36, 0, 0.66, -0.56);
}

.element {
  transition: transform 300ms var(--ease-out-quart);
}
```

---

## Advanced Techniques

### Animation with scroll

```css
/* Scroll-driven animations (Chrome 115+) */
@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal-on-scroll {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

### JavaScript Integration

```javascript
// Animation end event
element.addEventListener('animationend', (e) => {
  console.log('Animation ended:', e.animationName);
  element.classList.remove('animate');
});

// Transition end event
element.addEventListener('transitionend', (e) => {
  console.log('Transition ended:', e.propertyName);
});

// Force reflow to restart animation
element.classList.remove('animate');
void element.offsetWidth; // Force reflow
element.classList.add('animate');

// Web Animations API
element.animate([
  { transform: 'translateX(0)', opacity: 1 },
  { transform: 'translateX(100px)', opacity: 0 }
], {
  duration: 500,
  easing: 'ease-out',
  fill: 'forwards'
});
```

### Multiple Animations

```css
.element {
  animation:
    fadeIn 300ms ease forwards,
    slideUp 400ms ease-out 100ms forwards,
    pulse 1s ease-in-out 500ms infinite;
}
```

### Animation States

```css
/* Pause on hover */
.continuous-animation {
  animation: spin 2s linear infinite;
}

.continuous-animation:hover {
  animation-play-state: paused;
}

/* Class-based control */
.animation.is-paused {
  animation-play-state: paused;
}

.animation.is-running {
  animation-play-state: running;
}
```

---

## Accessibility Considerations

### prefers-reduced-motion

```css
/* Full animations */
.element {
  transition: transform 300ms ease;
}

.element:hover {
  transform: scale(1.05);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Or per-element */
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
}

/* Provide alternative */
@media (prefers-reduced-motion: reduce) {
  .card:hover {
    /* Remove motion, keep feedback */
    transform: none;
    box-shadow: 0 0 0 3px #007bff;
  }
}
```

### Safe Animations

```css
/* XAVFSIZ - Attention grab qilmaydi */
.safe-animation {
  transition: opacity 200ms, background-color 200ms;
}

/* EHTIYOT - Ba'zi odamlar uchun qiyin */
.use-with-caution {
  animation: bounce 1s infinite; /* Continuous motion */
  animation: flash 0.5s;         /* Flashing */
  animation: shake 0.3s;         /* Rapid movement */
}
```

### Focus Animations

```css
/* Keyboard focus uchun animatsiya */
.button:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
  animation: focusPulse 1s ease infinite;
}

@keyframes focusPulse {
  0%, 100% {
    outline-offset: 2px;
  }
  50% {
    outline-offset: 4px;
  }
}

/* Reduced motion alternative */
@media (prefers-reduced-motion: reduce) {
  .button:focus-visible {
    animation: none;
    outline-offset: 2px;
  }
}
```

---

## Real-world Examples

### 1. Loading Spinner

```css
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Dots spinner */
.dots-spinner {
  display: flex;
  gap: 6px;
}

.dots-spinner span {
  width: 10px;
  height: 10px;
  background: #007bff;
  border-radius: 50%;
  animation: dotPulse 1.4s ease-in-out infinite;
}

.dots-spinner span:nth-child(1) { animation-delay: 0s; }
.dots-spinner span:nth-child(2) { animation-delay: 0.2s; }
.dots-spinner span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
```

### 2. Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-text {
  height: 1rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-text:last-child {
  width: 70%;
}
```

### 3. Modal Animation

```css
/* Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 300ms, visibility 300ms;
}

.modal-backdrop.is-open {
  opacity: 1;
  visibility: visible;
}

/* Modal */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  opacity: 0;
  visibility: hidden;
  transition:
    transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 300ms,
    visibility 300ms;
}

.modal.is-open {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  visibility: visible;
}
```

### 4. Navigation Menu

```css
/* Mobile menu slide */
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: white;
  transform: translateX(-100%);
  transition: transform 300ms ease;
  z-index: 1000;
}

.mobile-nav.is-open {
  transform: translateX(0);
}

/* Menu items stagger */
.mobile-nav .nav-item {
  opacity: 0;
  transform: translateX(-20px);
  transition:
    opacity 300ms ease,
    transform 300ms ease;
}

.mobile-nav.is-open .nav-item {
  opacity: 1;
  transform: translateX(0);
}

.mobile-nav.is-open .nav-item:nth-child(1) { transition-delay: 100ms; }
.mobile-nav.is-open .nav-item:nth-child(2) { transition-delay: 150ms; }
.mobile-nav.is-open .nav-item:nth-child(3) { transition-delay: 200ms; }
.mobile-nav.is-open .nav-item:nth-child(4) { transition-delay: 250ms; }
```

### 5. Page Transitions

```css
/* Page enter */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 400ms, transform 400ms;
}

/* Page exit */
.page-exit {
  opacity: 1;
  transform: translateY(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 400ms, transform 400ms;
}
```

### 6. Notification Toast

```css
.toast {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  padding: 1rem 1.5rem;
  background: #333;
  color: white;
  border-radius: 8px;
  transform: translateX(calc(100% + 1rem));
  opacity: 0;
  transition:
    transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 300ms;
}

.toast.is-visible {
  transform: translateX(0);
  opacity: 1;
}

/* Auto-dismiss progress */
.toast::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: #007bff;
  animation: progress 5s linear forwards;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0; }
}
```

---

## Interview savollari

### 1. Transitions va Animations farqi nima?

**Javob:**

| Aspekt | Transitions | Animations |
|--------|-------------|------------|
| Trigger | State change (hover, class) | Automatic yoki trigger |
| States | 2 ta (start, end) | Ko'p (keyframes) |
| Loop | Yo'q | infinite mumkin |
| Control | Kam | To'liq (pause, direction) |
| Use case | Simple interactions | Complex sequences |

```css
/* Transition - A dan B ga */
.button {
  transition: background 300ms;
}
.button:hover {
  background: blue;
}

/* Animation - murakkab ketma-ketlik */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
.button {
  animation: pulse 2s infinite;
}
```

### 2. Qaysi properties GPU-accelerated?

**Javob:**

```css
/* GPU-accelerated (Compositor only) */
transform
opacity
filter

/* CPU (Layout triggerlaydi) */
width, height, margin, padding, top, left, etc.

/* CPU (Paint triggerlaydi) */
background-color, box-shadow, border-color, etc.
```

**Qoida:** 60fps uchun faqat `transform` va `opacity` animate qiling.

### 3. will-change qanday ishlaydi va qachon ishlatish kerak?

**Javob:**

```css
/* Browser ga kelajakda o'zgarish bo'lishini aytadi */
.element {
  will-change: transform;
}
```

**Qachon ishlatish:**
- Heavy animations
- Performance issue bo'lganda

**Qachon ishlatMASLIK:**
- Har element uchun
- Statik elements
- Too many elements

**Best practice:**
```css
.element:hover {
  will-change: transform;
}
/* yoki JavaScript bilan mouseenter da qo'shish */
```

### 4. prefers-reduced-motion nima uchun kerak?

**Javob:**

Ba'zi odamlar (vestibular disorders, epilepsy) uchun animatsiyalar muammo:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition-duration: 0.001ms !important;
  }
}
```

**System settings:**
- macOS: System Preferences > Accessibility > Display > Reduce motion
- Windows: Settings > Ease of Access > Display > Show animations
- iOS: Settings > Accessibility > Motion > Reduce Motion

### 5. CSS animation performance qanday optimize qilish?

**Javob:**

1. **Faqat composite properties:**
   ```css
   /* Yaxshi */
   transform: translateX(100px);
   opacity: 0.5;

   /* Yomon */
   left: 100px;
   width: 200px;
   ```

2. **will-change (ehtiyotkorlik bilan):**
   ```css
   .animated { will-change: transform; }
   ```

3. **contain property:**
   ```css
   .animated { contain: layout style paint; }
   ```

4. **Hardware acceleration:**
   ```css
   .animated { transform: translateZ(0); }
   ```

5. **requestAnimationFrame (JS):**
   ```javascript
   requestAnimationFrame(() => {
     element.style.transform = 'translateX(100px)';
   });
   ```

---

## Best Practices

### 1. Performance first

```css
/* Faqat transform va opacity */
.performant {
  transition: transform 300ms, opacity 300ms;
}
```

### 2. Meaningful durations

```css
/* Too fast - sezilmaydi */
transition: 50ms;

/* Too slow - annoying */
transition: 2s;

/* Sweet spot */
transition: 200ms - 400ms; /* UI feedback */
transition: 300ms - 500ms; /* Larger elements */
```

### 3. Appropriate easing

```css
/* Enter - ease-out (tez boshlab sekin tugash) */
.modal-enter {
  animation: slideIn 300ms ease-out;
}

/* Exit - ease-in (sekin boshlab tez tugash) */
.modal-exit {
  animation: slideOut 200ms ease-in;
}

/* Continuous - linear yoki ease-in-out */
.spinner {
  animation: spin 1s linear infinite;
}
```

### 4. Reduced motion support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5. Test on real devices

```
- Mobile da 60fps?
- Battery drain?
- Older devices?
- Different browsers?
```

### 6. Animation tokens

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;

  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}

.element {
  transition: transform var(--duration-normal) var(--ease-out);
}
```

---

## Xulosa

| Xususiyat | Nimaga javobgar? | Qachon ishlatiladi? |
|-----------|------------------|---------------------|
| **Transition** | 2 holat orasidagi o'zgarish | Hover, focus effektlari, oddiy o'tishlar |
| **Animation (Keyframes)** | Murakkab, ko'p bosqichli harakat | Looping spinnerlar, murakkab harakatlar, ketma-ket animatsiyalar |
| **Transform** | O'lcham/Joylashuv/Burish | X, Y, Z o'qlari bo'yicha siljitish (`translate`), aylantirish (`rotate`), kattalashtirish (`scale`) |
| **Timing Function** | Harakat tezligi egri chizig'i | Animatsiyani tabiiy qilish uchun (`ease-in`, `ease-out`, `cubic-bezier`) |
| **GPU Acceleration** | Hardware tezlashtirish | Katta animatsiyalarda telefon/kompyuter qotib qolmasligi uchun (`transform`, `opacity`) |
| **prefers-reduced-motion** | A11y (Maxsus ehtiyojlilar) | Vestibulyar apparatida muammosi bor odamlarga animatsiyani o'chirib berish |

---

## Keyingi mavzu

Accessibility: [07-accessibility.md](./07-accessibility.md)
