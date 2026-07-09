# Responsive Layouts - Adaptiv Dizayn

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Bugungi kunda foydalanuvchilarning aksariyati veb-saytlarga mobil qurilmalardan kiradi. Agar veb-sahifangiz faqat kompyuter ekrani uchun mo'ljallangan bo'lsa, siz foydalanuvchilarning yarmini yo'qotasiz. Responsive (moslashuvchan) dizayn — bu shunchaki yaxshi xususiyat emas, balki har bir professional frontend dasturchi mukammal bilishi shart bo'lgan majburiyatdir.

> [!NOTE]
> **Real-hayot analogiyasi: "Suv va Idish"**  
> Responsive dizayn xuddi suvga o'xshaydi. Suvni qanday idishga (mobil telefon, planshet, kompyuter) quysangiz, u o'sha idishning shaklini oladi va bo'shliqni to'ldiradi. Elementlar ham xuddi shunday ekranga qarab o'z o'lchamini, joylashuvini yoki ko'rinishini (katta/kichik, yonma-yon/ustma-ust) o'zgartirishi kerak.
## Mundarija

1. [Responsive Design asoslari](#responsive-design-asoslari)
2. [Media Queries](#media-queries)
3. [Container Queries](#container-queries)
4. [Viewport Units](#viewport-units)
5. [Responsive Images](#responsive-images)
6. [Mobile-First Approach](#mobile-first-approach)
7. [Breakpoints strategiyasi](#breakpoints-strategiyasi)
8. [Dark Mode](#dark-mode)
9. [Retina Displays](#retina-displays)
10. [Real-world patterns](#real-world-patterns)
11. [Interview savollari](#interview-savollari)
12. [Best Practices](#best-practices)

---

## Responsive Design asoslari

### Viewport Meta Tag

```html
<!-- MAJBURIY - har HTML sahifada bo'lishi kerak -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**Noto'g'ri viewport:**
```html
<!-- XATO - zoom ni bloklaydi (accessibility muammo) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### Fluid vs Fixed Layout

```css
/* FIXED - Responsive emas */
.container {
  width: 1200px;
}

/* FLUID - Responsive */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

### Flexible Units

| Unit | Tavsif | Ishlatish |
|------|--------|-----------|
| `%` | Parent ga nisbatan | Width, padding |
| `em` | Font-size ga nisbatan | Spacing, media queries |
| `rem` | Root font-size ga nisbatan | Typography, spacing |
| `vw/vh` | Viewport ga nisbatan | Full-screen sections |
| `vmin/vmax` | Viewport min/max | Responsive typography |
| `ch` | "0" belgisi kengligi | Text width |
| `fr` | Grid fraction | Grid layouts |

```css
/* Kombinatsiya */
.container {
  width: min(90%, 1200px);  /* 90% yoki 1200px - qaysi kichik */
  padding: clamp(1rem, 5vw, 3rem); /* Min 1rem, max 3rem, optimal 5vw */
}
```

---

## Media Queries

### Asosiy sintaksis

```css
/* Width-based */
@media (min-width: 768px) {
  /* 768px va undan katta */
}

@media (max-width: 767px) {
  /* 767px va undan kichik */
}

/* Range syntax (modern) */
@media (width >= 768px) {
  /* 768px va undan katta */
}

@media (768px <= width <= 1024px) {
  /* 768px dan 1024px gacha */
}
```

### Media Types

```css
@media screen { /* Ekran */ }
@media print { /* Print */ }
@media all { /* Hammasi (default) */ }
```

### Media Features

```css
/* Orientation */
@media (orientation: portrait) { }
@media (orientation: landscape) { }

/* Aspect ratio */
@media (aspect-ratio: 16/9) { }
@media (min-aspect-ratio: 1/1) { }

/* Resolution (Retina) */
@media (min-resolution: 2dppx) { }
@media (-webkit-min-device-pixel-ratio: 2) { }

/* Hover capability */
@media (hover: hover) { /* Mouse bor */ }
@media (hover: none) { /* Touch device */ }

/* Pointer precision */
@media (pointer: fine) { /* Mouse */ }
@media (pointer: coarse) { /* Touch */ }

/* Color scheme preference */
@media (prefers-color-scheme: dark) { }
@media (prefers-color-scheme: light) { }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) { }

/* High contrast */
@media (prefers-contrast: high) { }
```

### Combining Media Queries

```css
/* AND */
@media (min-width: 768px) and (max-width: 1024px) { }
@media screen and (orientation: landscape) { }

/* OR (comma) */
@media (max-width: 600px), (orientation: portrait) { }

/* NOT */
@media not print { }
@media not (hover: hover) { }

/* Complex */
@media screen and (min-width: 768px) and (hover: hover) { }
```

### Print Styles

```css
@media print {
  /* Keraksiz elementlarni yashirish */
  .nav,
  .sidebar,
  .footer,
  .no-print {
    display: none !important;
  }

  /* Sahifa sozlamalari */
  @page {
    margin: 2cm;
    size: A4;
  }

  /* Linklar ko'rsatish */
  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
  }

  /* Background colors print qilish */
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

---

## Container Queries

Container queries - element o'zi joylashgan container o'lchamiga qarab style o'zgartiradi.

### Asosiy sintaksis

```css
/* Container belgilash */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Yoki shorthand */
.card-container {
  container: card / inline-size;
}

/* Container query */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}

@container card (min-width: 600px) {
  .card {
    grid-template-columns: 250px 1fr 150px;
  }
}
```

### Container Types

```css
/* inline-size - faqat width */
container-type: inline-size;

/* size - width va height */
container-type: size;

/* normal - query qilolmaydi, faqat style containment */
container-type: normal;
```

### Container Units

```css
@container (min-width: 400px) {
  .card-title {
    font-size: 5cqw;  /* Container query width ning 5% */
  }
}

/* Container units */
/* cqw - container query width */
/* cqh - container query height */
/* cqi - container query inline */
/* cqb - container query block */
/* cqmin - cqi yoki cqb ning kichigi */
/* cqmax - cqi yoki cqb ning kattasi */
```

### Amaliy misol

```html
<div class="sidebar">
  <div class="card-container">
    <article class="card">
      <img src="image.jpg" alt="">
      <div class="card-content">
        <h3>Title</h3>
        <p>Description</p>
      </div>
    </article>
  </div>
</div>

<div class="main-content">
  <div class="card-container">
    <article class="card">
      <!-- Same card, different container -->
    </article>
  </div>
</div>
```

```css
.card-container {
  container-type: inline-size;
}

/* Default: stacked layout */
.card {
  display: flex;
  flex-direction: column;
}

.card img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}

/* Container 400px+ bo'lsa: horizontal layout */
@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }

  .card img {
    width: 40%;
    aspect-ratio: 1;
  }
}

/* Container 600px+ bo'lsa: featured layout */
@container (min-width: 600px) {
  .card {
    position: relative;
  }

  .card img {
    width: 100%;
    aspect-ratio: 21/9;
  }

  .card-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
    color: white;
    padding: 2rem;
  }
}
```

---

## Viewport Units

### Basic Viewport Units

```css
/* vw - viewport width */
.full-width {
  width: 100vw;
}

/* vh - viewport height */
.full-height {
  min-height: 100vh;
}

/* vmin - viewport minimum */
/* vmax - viewport maximum */
.square {
  width: 50vmin;
  height: 50vmin;
}
```

### Mobile Safari muammosi

iOS Safari da `100vh` address bar ni hisobga olmaydi.

```css
/* MUAMMO */
.hero {
  height: 100vh; /* Address bar tagida content yo'qoladi */
}

/* YECHIM 1: Modern - dvh/svh/lvh */
.hero {
  height: 100dvh; /* Dynamic viewport height */
  /* svh - small viewport height (address bar collapsed) */
  /* lvh - large viewport height (address bar visible) */
}

/* YECHIM 2: CSS variable fallback */
.hero {
  height: 100vh;
  height: 100dvh;
}

/* YECHIM 3: JavaScript */
```

```javascript
// Mobile viewport fix
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);
```

```css
.hero {
  height: calc(var(--vh, 1vh) * 100);
}
```

### New Viewport Units (2023+)

```css
/* Dynamic Viewport */
.element {
  height: 100dvh; /* Address bar resize bilan o'zgaradi */
  width: 100dvw;
}

/* Small Viewport */
.element {
  height: 100svh; /* Minimum viewport (address bar collapsed) */
}

/* Large Viewport */
.element {
  height: 100lvh; /* Maximum viewport (address bar visible) */
}
```

---

## Responsive Images

### srcset va sizes

```html
<!-- Width-based selection -->
<img
  srcset="
    image-320w.jpg 320w,
    image-640w.jpg 640w,
    image-960w.jpg 960w,
    image-1280w.jpg 1280w
  "
  sizes="
    (max-width: 320px) 280px,
    (max-width: 640px) 600px,
    (max-width: 960px) 900px,
    1200px
  "
  src="image-640w.jpg"
  alt="Responsive image"
>

<!-- Pixel density selection -->
<img
  srcset="
    image.jpg 1x,
    image@2x.jpg 2x,
    image@3x.jpg 3x
  "
  src="image.jpg"
  alt="Retina image"
>
```

### Picture element

```html
<!-- Art direction -->
<picture>
  <!-- Mobile: portrait crop -->
  <source
    media="(max-width: 767px)"
    srcset="hero-mobile.jpg"
  >
  <!-- Tablet: square crop -->
  <source
    media="(max-width: 1023px)"
    srcset="hero-tablet.jpg"
  >
  <!-- Desktop: landscape -->
  <img src="hero-desktop.jpg" alt="Hero image">
</picture>

<!-- Format selection -->
<picture>
  <source type="image/avif" srcset="image.avif">
  <source type="image/webp" srcset="image.webp">
  <img src="image.jpg" alt="Modern format image">
</picture>

<!-- Combined -->
<picture>
  <source
    media="(min-width: 1024px)"
    type="image/avif"
    srcset="hero-desktop.avif 1x, hero-desktop@2x.avif 2x"
  >
  <source
    media="(min-width: 1024px)"
    type="image/webp"
    srcset="hero-desktop.webp 1x, hero-desktop@2x.webp 2x"
  >
  <source
    media="(min-width: 768px)"
    type="image/avif"
    srcset="hero-tablet.avif"
  >
  <img src="hero-mobile.jpg" alt="Hero">
</picture>
```

### CSS Background Images

```css
.hero {
  background-image: url('hero-mobile.jpg');
  background-size: cover;
  background-position: center;
}

@media (min-width: 768px) {
  .hero {
    background-image: url('hero-tablet.jpg');
  }
}

@media (min-width: 1024px) {
  .hero {
    background-image: url('hero-desktop.jpg');
  }
}

/* Retina */
@media (min-resolution: 2dppx) {
  .hero {
    background-image: url('hero@2x.jpg');
  }
}

/* Modern: image-set() */
.hero {
  background-image: image-set(
    url('hero.avif') type('image/avif'),
    url('hero.webp') type('image/webp'),
    url('hero.jpg') type('image/jpeg')
  );
}
```

### Aspect Ratio

```css
/* Modern aspect-ratio */
.video-container {
  aspect-ratio: 16 / 9;
  width: 100%;
}

.square-image {
  aspect-ratio: 1;
  object-fit: cover;
}

/* Old padding hack (fallback) */
.video-container-old {
  position: relative;
  padding-bottom: 56.25%; /* 9/16 = 0.5625 */
  height: 0;
}

.video-container-old iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

---

## Mobile-First Approach

### Nima uchun Mobile-First?

1. **Performance:** Mobile uchun kamroq CSS yuklash
2. **Progressive Enhancement:** Asosiy funksionallik hamma uchun
3. **Focus:** Eng muhim content birinchi
4. **Statistics:** Mobile traffic 60%+

### Mobile-First vs Desktop-First

```css
/* DESKTOP-FIRST (Eski yondashuv) */
.container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 1024px) {
  .container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .container {
    grid-template-columns: 1fr;
  }
}

/* MOBILE-FIRST (Zamonaviy) */
.container {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 480px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .container {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Mobile-First Struktura

```css
/* 1. Base styles (Mobile) */
.card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.card-image {
  width: 100%;
  aspect-ratio: 16/9;
}

.nav {
  display: none; /* Mobile da hamburger menu */
}

.mobile-menu-button {
  display: block;
}

/* 2. Tablet (768px+) */
@media (min-width: 768px) {
  .card {
    flex-direction: row;
    padding: 1.5rem;
  }

  .card-image {
    width: 40%;
  }
}

/* 3. Desktop (1024px+) */
@media (min-width: 1024px) {
  .nav {
    display: flex;
  }

  .mobile-menu-button {
    display: none;
  }

  .card {
    padding: 2rem;
  }
}

/* 4. Large Desktop (1280px+) */
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## Breakpoints strategiyasi

### Standard Breakpoints

```css
/* Mobile First Breakpoints */
:root {
  --breakpoint-sm: 640px;   /* Small phones landscape */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Laptops */
  --breakpoint-xl: 1280px;  /* Desktops */
  --breakpoint-2xl: 1536px; /* Large desktops */
}

/* Tailwind-style */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }

/* Bootstrap-style */
@media (min-width: 576px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 992px) { /* lg */ }
@media (min-width: 1200px) { /* xl */ }
@media (min-width: 1400px) { /* xxl */ }
```

### Content-Based Breakpoints

```css
/* YAXSHI: Content ga qarab breakpoint */
.article {
  max-width: 65ch; /* Optimal o'qish kengligi */
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  /* Breakpoint kerak emas - auto-fit o'zi hal qiladi */
}

/* YOMON: O'zboshimcha breakpoint */
@media (min-width: 873px) { /* Nima uchun 873? */ }
```

### SCSS Breakpoint Mixin

```scss
$breakpoints: (
  'sm': 640px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px,
  '2xl': 1536px
);

@mixin breakpoint($size) {
  @if map-has-key($breakpoints, $size) {
    @media (min-width: map-get($breakpoints, $size)) {
      @content;
    }
  } @else {
    @media (min-width: $size) {
      @content;
    }
  }
}

// Ishlatish
.element {
  font-size: 1rem;

  @include breakpoint('md') {
    font-size: 1.25rem;
  }

  @include breakpoint('lg') {
    font-size: 1.5rem;
  }

  // Custom breakpoint
  @include breakpoint(900px) {
    padding: 2rem;
  }
}
```

---

## Dark Mode

### prefers-color-scheme

```css
/* Light mode (default) */
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #007bff;
  --color-border: #e0e0e0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a1a;
    --color-text: #ffffff;
    --color-primary: #4da3ff;
    --color-border: #333333;
  }
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}
```

### Manual Toggle

```html
<button id="theme-toggle">Toggle Theme</button>
```

```css
/* Data attribute bilan */
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
}

[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #ffffff;
}

/* Yoki class bilan */
.dark-mode {
  --color-bg: #1a1a1a;
  --color-text: #ffffff;
}
```

```javascript
const toggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// System preference
function setThemeFromSystem() {
  document.documentElement.dataset.theme = prefersDark.matches ? 'dark' : 'light';
}

// Manual toggle
toggle.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme;
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = newTheme;
  localStorage.setItem('theme', newTheme);
});

// Init
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.dataset.theme = savedTheme;
} else {
  setThemeFromSystem();
}

// Listen for system changes
prefersDark.addEventListener('change', setThemeFromSystem);
```

### Color Scheme Best Practices

```css
/* 1. Semantic color names */
:root {
  /* YOMON */
  --white: #ffffff;
  --black: #000000;

  /* YAXSHI */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666666;
}

/* 2. color-scheme property */
:root {
  color-scheme: light dark;
}

[data-theme="light"] {
  color-scheme: light;
}

[data-theme="dark"] {
  color-scheme: dark;
}

/* 3. Image inversion for dark mode */
@media (prefers-color-scheme: dark) {
  img.invertable {
    filter: invert(1) hue-rotate(180deg);
  }
}

/* 4. Dark mode specific images */
.logo {
  content: url('logo-light.svg');
}

@media (prefers-color-scheme: dark) {
  .logo {
    content: url('logo-dark.svg');
  }
}

/* 5. Picture element */
```

```html
<picture>
  <source srcset="logo-dark.svg" media="(prefers-color-scheme: dark)">
  <img src="logo-light.svg" alt="Logo">
</picture>
```

---

## Retina Displays

### Device Pixel Ratio

```css
/* Standard resolution */
.logo {
  background-image: url('logo.png');
  width: 200px;
  height: 100px;
}

/* 2x Retina */
@media (min-resolution: 2dppx),
       (-webkit-min-device-pixel-ratio: 2) {
  .logo {
    background-image: url('logo@2x.png');
    background-size: 200px 100px;
  }
}

/* 3x Retina (iPhone Pro) */
@media (min-resolution: 3dppx),
       (-webkit-min-device-pixel-ratio: 3) {
  .logo {
    background-image: url('logo@3x.png');
    background-size: 200px 100px;
  }
}
```

### Vector Graphics

```css
/* SVG - eng yaxshi variant Retina uchun */
.icon {
  background-image: url('icon.svg');
  /* Har qanday resolution da sharp */
}

/* Font icons */
.icon {
  font-family: 'Material Icons';
  /* Vector-based, sharp */
}
```

### Image Naming Convention

```
images/
├── hero.jpg          (1x - 1200x600)
├── hero@2x.jpg       (2x - 2400x1200)
├── hero@3x.jpg       (3x - 3600x1800)
├── hero-mobile.jpg   (1x - 640x480)
├── hero-mobile@2x.jpg
└── hero-mobile@3x.jpg
```

---

## Real-world patterns

### 1. Responsive Navigation

```html
<header class="header">
  <a href="/" class="logo">Logo</a>

  <nav class="nav" id="nav">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Services</a>
    <a href="#">Contact</a>
  </nav>

  <button class="menu-toggle" aria-label="Menu" aria-expanded="false">
    <span></span>
  </button>
</header>
```

```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  position: sticky;
  top: 0;
  background: var(--color-bg);
  z-index: 100;
}

/* Mobile Nav */
.nav {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background: var(--color-bg);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 5rem 2rem 2rem;
  box-shadow: -4px 0 10px rgba(0, 0, 0, 0.1);
}

.nav.is-open {
  transform: translateX(0);
}

.nav a {
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}

/* Menu Toggle */
.menu-toggle {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
}

.menu-toggle span,
.menu-toggle::before,
.menu-toggle::after {
  content: '';
  display: block;
  width: 24px;
  height: 2px;
  background: var(--color-text);
  transition: 0.3s;
}

/* Desktop */
@media (min-width: 768px) {
  .nav {
    position: static;
    transform: none;
    flex-direction: row;
    width: auto;
    padding: 0;
    box-shadow: none;
    gap: 2rem;
  }

  .nav a {
    padding: 0.5rem 0;
    border: none;
  }

  .menu-toggle {
    display: none;
  }
}
```

### 2. Responsive Grid Cards

```css
.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

@media (min-width: 640px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1280px) {
  .cards {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}

/* Yoki auto-fit bilan */
.cards-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(1rem, 3vw, 2rem);
  padding: clamp(1rem, 3vw, 2rem);
}
```

### 3. Responsive Typography

```css
:root {
  /* Fluid typography */
  --font-size-sm: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --font-size-lg: clamp(1.25rem, 1rem + 1vw, 1.5rem);
  --font-size-xl: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  --font-size-2xl: clamp(2rem, 1rem + 4vw, 4rem);
}

h1 { font-size: var(--font-size-2xl); }
h2 { font-size: var(--font-size-xl); }
h3 { font-size: var(--font-size-lg); }
p { font-size: var(--font-size-base); }
small { font-size: var(--font-size-sm); }

/* Line length control */
.prose {
  max-width: 65ch;
}

.prose p {
  line-height: 1.7;
}
```

### 4. Responsive Table

```css
/* Mobile: stack layout */
.responsive-table {
  width: 100%;
}

.responsive-table thead {
  display: none;
}

.responsive-table tr {
  display: block;
  margin-bottom: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
}

.responsive-table td {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

.responsive-table td:last-child {
  border-bottom: none;
}

.responsive-table td::before {
  content: attr(data-label);
  font-weight: 600;
}

/* Desktop: normal table */
@media (min-width: 768px) {
  .responsive-table thead {
    display: table-header-group;
  }

  .responsive-table tr {
    display: table-row;
    margin: 0;
    border: none;
    border-radius: 0;
    padding: 0;
  }

  .responsive-table td {
    display: table-cell;
    border-bottom: 1px solid var(--color-border);
    padding: 1rem;
  }

  .responsive-table td::before {
    display: none;
  }
}
```

```html
<table class="responsive-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-label="Name">John Doe</td>
      <td data-label="Email">john@example.com</td>
      <td data-label="Role">Admin</td>
    </tr>
  </tbody>
</table>
```

---

## Interview savollari

### 1. Mobile-first va desktop-first yondashuvlar farqi nima?

**Javob:**

| Aspekt | Mobile-First | Desktop-First |
|--------|--------------|---------------|
| Default | Mobile styles | Desktop styles |
| Media query | `min-width` | `max-width` |
| CSS size | Kichikroq (mobile kamroq style) | Kattaroq |
| Performance | Yaxshiroq mobile | Yaxshiroq desktop |
| Approach | Progressive enhancement | Graceful degradation |

**Mobile-first afzalliklari:**
- Mobile device'lar ko'proq
- Performance yaxshiroq
- Essential content fokus
- Kamroq override kerak

### 2. Container queries va media queries farqi?

**Javob:**

```css
/* Media query - VIEWPORT ga qaraydi */
@media (min-width: 768px) {
  .card { /* viewport 768px+ */ }
}

/* Container query - CONTAINER ga qaraydi */
@container (min-width: 400px) {
  .card { /* container 400px+ */ }
}
```

**Container query afzalliklari:**
- Component-level responsive
- Context-aware
- Reusable components
- Sidebar va main content da bir xil component turlicha ko'rinadi

### 3. srcset va sizes atributlari qanday ishlaydi?

**Javob:**

```html
<img
  srcset="small.jpg 320w, medium.jpg 640w, large.jpg 1280w"
  sizes="(max-width: 320px) 280px, (max-width: 640px) 600px, 1200px"
  src="medium.jpg"
  alt=""
>
```

- **srcset:** Mavjud rasmlar va ularning kengligi
- **sizes:** Qaysi viewport da qancha joy egallaydi
- Browser DPR va viewport ga qarab eng mos rasmni tanlaydi

### 4. 100vh mobile Safari da muammo qiladi. Yechimi nima?

**Javob:**

```css
/* Muammo: Address bar hisobga olinmaydi */
.hero {
  height: 100vh;
}

/* Yechim 1: dvh (Dynamic Viewport Height) */
.hero {
  height: 100dvh;
}

/* Yechim 2: JavaScript fallback */
.hero {
  height: calc(var(--vh, 1vh) * 100);
}
```

```javascript
function setVH() {
  document.documentElement.style.setProperty(
    '--vh',
    `${window.innerHeight * 0.01}px`
  );
}
setVH();
window.addEventListener('resize', setVH);
```

### 5. clamp() function qanday ishlaydi?

**Javob:**

```css
/* clamp(MIN, PREFERRED, MAX) */
.element {
  font-size: clamp(1rem, 2vw + 0.5rem, 2rem);
  /* Min: 1rem
     Preferred: 2vw + 0.5rem
     Max: 2rem */

  width: clamp(200px, 50%, 800px);
  /* Min 200px, max 800px, optimal 50% */
}
```

**Ishlatish:**
- Fluid typography
- Responsive spacing
- Flexible containers

---

## Best Practices

### 1. Mobile-first yozing

```css
/* Default = mobile */
.element {
  padding: 1rem;
}

/* Kattaroq ekranlar */
@media (min-width: 768px) {
  .element {
    padding: 2rem;
  }
}
```

### 2. Content-based breakpoints

```css
/* YOMON: Device-based */
@media (min-width: 768px) { /* iPad */ }

/* YAXSHI: Content-based */
.card-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```

### 3. Fluid values ishlatish

```css
/* Clamp for typography */
font-size: clamp(1rem, 2vw + 0.5rem, 1.5rem);

/* Clamp for spacing */
padding: clamp(1rem, 5vw, 3rem);

/* Min/max for containers */
width: min(90%, 1200px);
```

### 4. Touch targets 44px minimum

```css
.button,
.link {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}
```

### 5. Test real devices da

- iOS Safari
- Android Chrome
- Tablet
- Different screen sizes
- Landscape/Portrait

### 6. Reduced motion support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 7. Print styles unutmang

```css
@media print {
  .no-print { display: none; }
  body { font-size: 12pt; }
}
```

---

## Xulosa

| Yondashuv/Texnologiya | Qachon ishlatiladi? | Qisqacha Ta'rifi |
|----------------------|---------------------|------------------|
| **Mobile-First** | Har doim tavsiya etiladi | Avval kichik ekranlar uchun CSS yozish, so'ng katta ekranlarga qarab kengaytirish |
| **Media Queries** | Ekran o'lchami o'zgarganda | Ma'lum bir breakpoint'larda (masalan, `@media (min-width: 768px)`) dizaynni o'zgartirish |
| **Container Queries** | Komponent-bazali dizayn | Element o'zining ota-onasining (container) kengligiga qarab moslashishi (`@container`) |
| **Viewport Units** | To'liq ekranlik qismlar | `vh` va `vw` orqali ekranning 100% hajmini egallash |
| **Responsive Images** | Rasm optimallashtirish | Ekranga mos keladigan hajmdagi rasmni yuklash (`srcset`, `<picture>`) |
| **Dark Mode** | Mavzu (Theme) almashtirish | Foydalanuvchining qurilma mavzusini inobatga olish (`@media (prefers-color-scheme: dark)`) |

---

## Keyingi mavzu

SCSS/Sass: [04-scss.md](./04-scss.md)
