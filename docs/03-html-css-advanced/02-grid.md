# CSS Grid - Ikki O'lchovli Layout Tizimi

CSS Grid - web sahifalarni ikki o'lchamda (row va column) bir vaqtda layout qilish uchun eng kuchli vosita.

## Mundarija

1. [Asosiy tushunchalar](#asosiy-tushunchalar)
2. [Container xususiyatlari](#container-xususiyatlari)
3. [Item xususiyatlari](#item-xususiyatlari)
4. [Grid areas va template](#grid-areas-va-template)
5. [Advanced patterns](#advanced-patterns)
6. [Responsive Grid](#responsive-grid)
7. [Subgrid](#subgrid)
8. [Real-world layouts](#real-world-layouts)
9. [Xatolar va yechimlar](#xatolar-va-yechimlar)
10. [Interview savollari](#interview-savollari)
11. [Best Practices](#best-practices)

---

## Asosiy tushunchalar

### Grid Terminologiya

```
┌─────────────────────────────────────────────────────────────┐
│                     Grid Container                          │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │              │              │              │  ← Row 1    │
│  │   Grid Cell  │   Grid Cell  │   Grid Cell  │            │
│  │              │              │              │            │
│  ├──────────────┼──────────────┼──────────────┤ ← Grid Line│
│  │              │              │              │  ← Row 2    │
│  │   Grid Cell  │   Grid Cell  │   Grid Cell  │            │
│  │              │              │              │            │
│  └──────────────┴──────────────┴──────────────┘            │
│       ↑              ↑              ↑                       │
│    Column 1       Column 2       Column 3                   │
│                                                             │
│  Grid Track = Row yoki Column                               │
│  Grid Area = Bir nechta cell'lar birlashmasi               │
└─────────────────────────────────────────────────────────────┘
```

### Grid Lines Numbering

```
    1         2         3         4     ← Column lines
    ↓         ↓         ↓         ↓
    ┌─────────┬─────────┬─────────┐
1 → │    A    │    B    │    C    │
    ├─────────┼─────────┼─────────┤
2 → │    D    │    E    │    F    │
    ├─────────┼─────────┼─────────┤
3 → │    G    │    H    │    I    │
    └─────────┴─────────┴─────────┘
4 →
    ↑
Row lines

Negative numbering (oxiridan):
-4   -3        -2        -1    ← Column lines (negative)
```

### Asosiy sintaksis

```css
.container {
  display: grid;
  /* yoki display: inline-grid; */
}
```

---

## Container xususiyatlari

### 1. grid-template-columns va grid-template-rows

```css
/* Aniq o'lchamlar */
.grid {
  display: grid;
  grid-template-columns: 200px 200px 200px;
  grid-template-rows: 100px 100px;
}

/* fr unit (fraction) - bo'sh joyni taqsimlaydi */
.grid {
  grid-template-columns: 1fr 2fr 1fr; /* 1:2:1 ratio */
}

/* Aralash */
.grid {
  grid-template-columns: 250px 1fr 1fr; /* Sidebar + 2 ta teng column */
}

/* repeat() */
.grid {
  grid-template-columns: repeat(3, 1fr);      /* 1fr 1fr 1fr */
  grid-template-columns: repeat(3, 100px);    /* 100px 100px 100px */
  grid-template-columns: repeat(2, 1fr 2fr);  /* 1fr 2fr 1fr 2fr */
}

/* minmax() */
.grid {
  grid-template-columns: minmax(200px, 1fr) 2fr 1fr;
  /* Birinchi column min 200px, max 1fr */
}

/* auto-fill va auto-fit */
.grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  /* Imkon qadar ko'p column, har biri min 250px */
}
```

**auto-fill vs auto-fit:**
```css
/* auto-fill: Bo'sh column yaratadi */
grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
/* 3 ta item, 5 ta sig'sa → 3 ta to'liq, 2 ta bo'sh column */

/* auto-fit: Bo'sh columnlarni collapse qiladi */
grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
/* 3 ta item, 5 ta sig'sa → 3 ta item to'liq kengayadi */
```

### 2. gap (grid-gap)

```css
.grid {
  gap: 20px;           /* row va column gap */
  gap: 20px 10px;      /* row-gap: 20px, column-gap: 10px */
  row-gap: 20px;
  column-gap: 10px;
}
```

### 3. grid-template-areas

```css
.grid {
  display: grid;
  grid-template-columns: 250px 1fr 1fr;
  grid-template-rows: 60px 1fr 50px;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  gap: 10px;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

**Visual:**
```
┌──────────────────────────────────────────┐
│               header                      │
├─────────┬────────────────────────────────┤
│         │                                │
│ sidebar │            main                │
│         │                                │
├─────────┴────────────────────────────────┤
│               footer                      │
└──────────────────────────────────────────┘
```

**Bo'sh cell (.):**
```css
grid-template-areas:
  "header header ."
  "sidebar main main"
  "footer footer footer";
```

### 4. justify-items va align-items

```css
/* justify-items: Inline (row) axis bo'ylab */
.grid {
  justify-items: start;   /* Chapga */
  justify-items: end;     /* O'ngga */
  justify-items: center;  /* Markazga */
  justify-items: stretch; /* To'liq (default) */
}

/* align-items: Block (column) axis bo'ylab */
.grid {
  align-items: start;
  align-items: end;
  align-items: center;
  align-items: stretch; /* default */
}

/* place-items: shorthand */
.grid {
  place-items: center; /* align-items va justify-items: center */
  place-items: start end; /* align-items: start, justify-items: end */
}
```

### 5. justify-content va align-content

Grid container ichida grid'ning o'zi qayerda joylashadi:

```css
.grid {
  height: 500px;
  grid-template-columns: repeat(3, 100px);
  grid-template-rows: repeat(2, 100px);

  /* justify-content: Grid'ni gorizontal joylash */
  justify-content: start;
  justify-content: end;
  justify-content: center;
  justify-content: space-between;
  justify-content: space-around;
  justify-content: space-evenly;

  /* align-content: Grid'ni vertikal joylash */
  align-content: start;
  align-content: end;
  align-content: center;
}

/* place-content: shorthand */
.grid {
  place-content: center; /* Grid markazda */
}
```

### 6. grid-auto-rows va grid-auto-columns

Implicit (avtomatik yaratilgan) track'lar uchun:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* Faqat column belgilangan, row'lar auto */

  grid-auto-rows: 100px;      /* Har bir auto row 100px */
  grid-auto-rows: minmax(100px, auto); /* Min 100px, content ga qarab o'sadi */
}
```

### 7. grid-auto-flow

Elementlar qanday joylashadi:

```css
.grid {
  grid-auto-flow: row;    /* Qatorma-qator (default) */
  grid-auto-flow: column; /* Ustunma-ustun */
  grid-auto-flow: dense;  /* Bo'shliqlarni to'ldiradi */
  grid-auto-flow: row dense;
}
```

**dense example:**
```
Normal:                  dense:
┌───┬───┬───┐           ┌───┬───┬───┐
│ 1 │ 1 │ 2 │           │ 1 │ 1 │ 2 │
├───┼───┼───┤           ├───┼───┼───┤
│ 3 │ 3 │   │ ← bo'sh   │ 3 │ 3 │ 4 │ ← 4 bo'shliqni to'ldirdi
├───┼───┼───┤           ├───┼───┼───┤
│ 4 │ 5 │ 5 │           │ 5 │ 5 │   │
└───┴───┴───┘           └───┴───┴───┘
```

---

## Item xususiyatlari

### 1. grid-column va grid-row

```css
.item {
  /* Line numbers bilan */
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;

  /* Shorthand */
  grid-column: 1 / 3;  /* start / end */
  grid-row: 1 / 2;

  /* span keyword */
  grid-column: 1 / span 2; /* 1-dan boshlab 2 ta column */
  grid-column: span 2;     /* Hozirgi pozitsiyadan 2 ta */

  /* Negative lines (oxiridan) */
  grid-column: 1 / -1; /* Birinchidan oxirigacha (full width) */
}
```

**Visual:**
```
grid-column: 2 / 4;
grid-row: 1 / 3;

     1    2    3    4
   ┌────┬─────────────┐
 1 │    │ ████████████│
   │    │ ████████████│
   ├────┼ ████████████┤
 2 │    │ ████████████│
   │    │ ████████████│
   ├────┼────┬────────┤
 3 │    │    │        │
   └────┴────┴────────┘
```

### 2. grid-area

```css
/* grid-template-areas bilan */
.header {
  grid-area: header;
}

/* Line numbers bilan */
.item {
  grid-area: 1 / 1 / 3 / 4;
  /* row-start / col-start / row-end / col-end */
}
```

### 3. justify-self va align-self

Individual item alignment:

```css
.item {
  justify-self: start;   /* Chapga */
  justify-self: end;     /* O'ngga */
  justify-self: center;  /* Markazga */
  justify-self: stretch; /* To'liq (default) */

  align-self: start;
  align-self: end;
  align-self: center;
  align-self: stretch;

  /* Shorthand */
  place-self: center; /* Ikkalasi center */
  place-self: start end;
}
```

### 4. Named Grid Lines

```css
.grid {
  grid-template-columns:
    [sidebar-start] 250px
    [sidebar-end main-start] 1fr
    [main-end];

  grid-template-rows:
    [header-start] 60px
    [header-end content-start] 1fr
    [content-end footer-start] 50px
    [footer-end];
}

.sidebar {
  grid-column: sidebar-start / sidebar-end;
  grid-row: header-end / footer-start;
}

.main {
  grid-column: main-start / main-end;
  grid-row: content-start / content-end;
}
```

---

## Grid areas va template

### Kompleks Layout

```css
.dashboard {
  display: grid;
  grid-template-columns: 80px 250px 1fr 300px;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "nav header header header"
    "nav sidebar main aside"
    "nav footer footer footer";
  height: 100vh;
  gap: 1px;
}

.nav     { grid-area: nav; }
.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

**Visual:**
```
┌─────┬───────────────────────────────────────────┐
│     │                  header                    │
│     ├──────────┬──────────────────────┬─────────┤
│ nav │          │                      │         │
│     │ sidebar  │        main          │  aside  │
│     │          │                      │         │
│     ├──────────┴──────────────────────┴─────────┤
│     │                  footer                    │
└─────┴───────────────────────────────────────────┘
```

### Responsive Areas

```css
.layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "main"
    "sidebar"
    "footer";
}

@media (min-width: 768px) {
  .layout {
    grid-template-columns: 250px 1fr;
    grid-template-areas:
      "header header"
      "sidebar main"
      "footer footer";
  }
}

@media (min-width: 1200px) {
  .layout {
    grid-template-columns: 250px 1fr 300px;
    grid-template-areas:
      "header header header"
      "sidebar main aside"
      "footer footer footer";
  }
}
```

---

## Advanced patterns

### 1. Auto-fit Cards

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

### 2. Masonry-like Layout

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 10px;
  gap: 10px;
}

.masonry-item {
  /* JavaScript bilan row span hisoblash kerak */
  grid-row: span var(--row-span, 20);
}
```

```javascript
// Row span hisoblash
function calculateRowSpan(item, rowHeight = 10, gap = 10) {
  const contentHeight = item.querySelector('.content').offsetHeight;
  const rowSpan = Math.ceil((contentHeight + gap) / (rowHeight + gap));
  item.style.setProperty('--row-span', rowSpan);
}
```

### 3. Overlap Layout

```css
.overlap-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto;
}

.image {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
}

.text-overlay {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
  align-self: end;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2rem;
  margin-left: 20%;
}
```

### 4. Holy Grail Layout

```css
.holy-grail {
  display: grid;
  grid-template:
    "header header header" auto
    "nav main aside" 1fr
    "footer footer footer" auto
    / 200px 1fr 200px;
  min-height: 100vh;
  gap: 1rem;
}

/* Mobile */
@media (max-width: 768px) {
  .holy-grail {
    grid-template:
      "header" auto
      "nav" auto
      "main" 1fr
      "aside" auto
      "footer" auto
      / 1fr;
  }
}
```

### 5. 12-Column Grid System

```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

.col-1  { grid-column: span 1; }
.col-2  { grid-column: span 2; }
.col-3  { grid-column: span 3; }
.col-4  { grid-column: span 4; }
.col-5  { grid-column: span 5; }
.col-6  { grid-column: span 6; }
.col-7  { grid-column: span 7; }
.col-8  { grid-column: span 8; }
.col-9  { grid-column: span 9; }
.col-10 { grid-column: span 10; }
.col-11 { grid-column: span 11; }
.col-12 { grid-column: span 12; }

/* Responsive */
@media (min-width: 768px) {
  .md-col-6 { grid-column: span 6; }
  .md-col-4 { grid-column: span 4; }
}
```

---

## Responsive Grid

### Mobile-First Approach

```css
/* Mobile: 1 column */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet: 2 columns */
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large: 4 columns */
@media (min-width: 1280px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Container Queries (Zamonaviy)

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  display: grid;
  grid-template-columns: 1fr;
}

@container card (min-width: 400px) {
  .card {
    grid-template-columns: 150px 1fr;
  }
}
```

### Fluid Typography with Grid

```css
.typography-grid {
  display: grid;
  grid-template-columns:
    1fr
    min(65ch, 100% - 2rem)
    1fr;
}

.typography-grid > * {
  grid-column: 2;
}

.typography-grid > .full-width {
  grid-column: 1 / -1;
}
```

---

## Subgrid

Subgrid - child element parent grid'ga moslashadi.

### Browser Support
2024 yilga kelib barcha zamonaviy brauzerlar qo'llab-quvvatlaydi.

```css
.parent {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.child {
  grid-column: span 3;
  display: grid;
  grid-template-columns: subgrid; /* Parent columns'ga moslashadi */
}
```

### Amaliy misol: Card with aligned content

```html
<div class="cards-grid">
  <article class="card">
    <h2>Title</h2>
    <p>Description...</p>
    <button>Action</button>
  </article>
  <article class="card">
    <h2>Longer Title Here</h2>
    <p>Longer description that takes more space...</p>
    <button>Action</button>
  </article>
</div>
```

```css
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.card {
  display: grid;
  grid-template-rows: auto 1fr auto;
  /* Subgrid yo'q - har card o'z rows'iga ega */
}

/* Subgrid bilan - barcha card'lar align bo'ladi */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-auto-rows: auto 1fr auto; /* 3 ta row har card uchun */
}

.card {
  grid-row: span 3;
  display: grid;
  grid-template-rows: subgrid; /* Parent rows'ga moslashadi */
}
```

---

## Real-world layouts

### 1. Dashboard Layout

```html
<div class="dashboard">
  <header class="header">Header</header>
  <nav class="sidebar">Sidebar</nav>
  <main class="main">
    <div class="stats">Stats Cards</div>
    <div class="chart">Chart</div>
    <div class="table">Table</div>
  </main>
</div>
```

```css
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  min-height: 100vh;
}

.header {
  grid-area: header;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar {
  grid-area: sidebar;
  background: #1a1a2e;
  color: #fff;
  padding: 1rem;
}

.main {
  grid-area: main;
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-auto-rows: minmax(200px, auto);
  gap: 1.5rem;
  overflow-y: auto;
}

/* Mobile */
@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
    grid-template-rows: 60px auto 1fr;
    grid-template-areas:
      "header"
      "sidebar"
      "main";
  }

  .sidebar {
    padding: 0.5rem 1rem;
  }
}
```

### 2. Blog Post Layout

```css
.blog-post {
  display: grid;
  grid-template-columns:
    1fr
    min(70ch, calc(100% - 2rem))
    1fr;
  row-gap: 2rem;
}

.blog-post > * {
  grid-column: 2;
}

.blog-post > .full-bleed {
  grid-column: 1 / -1;
  width: 100%;
}

.blog-post > blockquote {
  grid-column: 2;
  padding-left: 2rem;
  border-left: 4px solid #007bff;
  font-style: italic;
}

.blog-post > figure {
  grid-column: 1 / -1;
  margin: 2rem 0;
}

.blog-post > figure img {
  width: 100%;
  height: auto;
}
```

### 3. E-commerce Product Grid

```css
.products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.product-card {
  display: grid;
  grid-template-rows: 200px auto auto auto;
  gap: 1rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__title {
  padding: 0 1rem;
  margin: 0;
}

.product-card__price {
  padding: 0 1rem;
  font-weight: bold;
  color: #007bff;
}

.product-card__button {
  margin: 0 1rem 1rem;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

### 4. Gallery with Featured Image

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 200px);
  gap: 0.5rem;
}

.gallery__item:first-child {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
}

.gallery__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Mobile */
@media (max-width: 768px) {
  .gallery {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(auto-fill, 150px);
  }

  .gallery__item:first-child {
    grid-column: 1 / -1;
    grid-row: span 2;
  }
}
```

---

## Xatolar va yechimlar

### Xato 1: Grid items overflow

```css
/* NOTO'G'RI */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
.grid-item img {
  width: 100%; /* Overflow bo'lishi mumkin */
}

/* TO'G'RI */
.grid-item {
  min-width: 0; /* Flexbox kabi, grid da ham kerak */
}
.grid-item img {
  width: 100%;
  height: auto;
}
```

### Xato 2: Height 100% ishlamaydi

```css
/* NOTO'G'RI */
.container {
  display: grid;
  height: 100%;
}

/* TO'G'RI */
html, body {
  height: 100%;
  margin: 0;
}
.container {
  display: grid;
  min-height: 100vh;
}
```

### Xato 3: Auto-fill vs auto-fit

```css
/* Auto-fill - bo'sh columns yaratadi */
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

/* Auto-fit - bo'sh columns collapse */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

**Farq ko'rinadi:** 3 ta item, katta container:
- auto-fill: 3 ta item + 2 ta bo'sh column
- auto-fit: 3 ta item to'liq kengayadi

### Xato 4: gap bilan calc ishlamaydi

```css
/* NOTO'G'RI */
.grid {
  grid-template-columns: repeat(3, calc(33.33% - 20px));
  gap: 20px;
}

/* TO'G'RI */
.grid {
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

### Xato 5: grid-area sintaksis xatosi

```css
/* NOTO'G'RI */
.item {
  grid-area: 1 / 1 / 2 / 3; /* To'g'ri */
  grid-area: 1, 1, 2, 3;    /* XATO! Vergul emas */
}

/* grid-area tartibi: row-start / col-start / row-end / col-end */
```

---

## Interview savollari

### 1. CSS Grid va Flexbox farqi? Qachon qaysi birini ishlatish kerak?

**Javob:**

| Xususiyat | Flexbox | CSS Grid |
|-----------|---------|----------|
| O'lcham | 1D (row YOKI column) | 2D (row VA column) |
| Content vs Layout | Content-first | Layout-first |
| Use case | Component ichki | Page layout |
| Alignment | Bitta axis | Ikki axis |

**Flexbox qachon:**
- Navbar items
- Button groups
- Card content
- Centering
- Tartib noma'lum

**Grid qachon:**
- Page layout
- Card grids
- Form layouts
- Overlap kerak
- Aniq grid struktura

**Birgalikda:**
```css
.page {
  display: grid;
  grid-template-columns: 250px 1fr;
}

.nav {
  display: flex;
  flex-direction: column;
}
```

### 2. `fr` unit nima va qanday ishlaydi?

**Javob:**

`fr` (fraction) - bo'sh joyni taqsimlash uchun unit.

```css
/* 300px bo'sh joy bo'lsa */
grid-template-columns: 1fr 2fr;
/* 1fr = 100px, 2fr = 200px */

/* Aniq o'lcham bilan */
grid-template-columns: 200px 1fr 1fr;
/* 200px olinadi, qolgan 2 ga bo'linadi */
```

`fr` vs `%`:
- `%` - container ning foizi
- `fr` - BO'SH joyning foizi (gap hisobga olingan)

```css
/* 3 column, 20px gap */
grid-template-columns: repeat(3, 33.33%); /* Gap sig'maydi, overflow */
grid-template-columns: repeat(3, 1fr);    /* Gap hisobga olinadi */
```

### 3. `minmax()` nima uchun kerak?

**Javob:**

`minmax(min, max)` - minimum va maximum o'lcham belgilaydi.

```css
/* Min 200px, max 1fr */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

/* Min content size, max 300px */
grid-template-columns: minmax(min-content, 300px) 1fr;

/* Min 0, max content size */
grid-template-columns: minmax(0, max-content) 1fr;
```

**Use cases:**
1. Responsive cards - `minmax(250px, 1fr)`
2. Sidebar - `minmax(200px, 300px)`
3. Text column - `minmax(min-content, 65ch)`

### 4. `grid-auto-flow: dense` qachon ishlatiladi?

**Javob:**

`dense` - grid'da bo'shliqlarni to'ldiradi, lekin DOM tartibini buzmaydi.

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  grid-auto-flow: dense;
}

.large {
  grid-column: span 2;
  grid-row: span 2;
}
```

**Muammo:** Accessibility - visual tartib DOM tartibidan farq qiladi.

**Qachon ishlatish:**
- Image gallery (tartib muhim emas)
- Masonry layout

**Qachon ishlatmaslik:**
- Blog posts (tartib muhim)
- Navigation

### 5. Subgrid nima va qachon kerak?

**Javob:**

Subgrid - child element parent grid tracks'ga moslashadi.

```css
.parent {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.child {
  grid-column: span 3;
  display: grid;
  grid-template-columns: subgrid;
}
```

**Muammo subgrid'siz:**
```
Card 1:           Card 2:
┌──────────┐      ┌──────────┐
│ Title    │      │ Long     │
│          │      │ Title    │
├──────────┤      ├──────────┤
│ Desc     │      │ Short    │
├──────────┤      ├──────────┤
│ Button   │      │ Button   │
└──────────┘      └──────────┘
```
Titles align emas!

**Subgrid bilan:**
```
Card 1:           Card 2:
┌──────────┐      ┌──────────┐
│ Title    │      │ Long     │
│          │      │ Title    │ ← Aligned!
├──────────┤      ├──────────┤
│ Desc     │      │ Short    │
├──────────┤      ├──────────┤
│ Button   │      │ Button   │
└──────────┘      └──────────┘
```

---

## Best Practices

### 1. Named lines ishlatish

```css
.grid {
  grid-template-columns:
    [full-start] 1fr
    [content-start] minmax(0, 1200px)
    [content-end] 1fr
    [full-end];
}

.hero {
  grid-column: full-start / full-end;
}

.content {
  grid-column: content-start / content-end;
}
```

### 2. Grid areas complex layouts uchun

```css
/* Readable va maintainable */
grid-template-areas:
  "header header header"
  "nav    main   aside"
  "footer footer footer";

/* vs cryptic numbers */
.header { grid-column: 1 / 4; grid-row: 1; }
```

### 3. auto-fit responsive grids uchun

```css
/* Media queries kerak emas */
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
```

### 4. minmax() bilan flexible sizing

```css
/* Sidebar min 200px, max 300px */
grid-template-columns: minmax(200px, 300px) 1fr;
```

### 5. gap margin o'rniga

```css
/* NOTO'G'RI */
.grid-item {
  margin: 10px;
}

/* TO'G'RI */
.grid {
  gap: 20px;
}
```

### 6. min-width: 0 overflow oldini olish

```css
.grid-item {
  min-width: 0;
  overflow: hidden;
}
```

### 7. DevTools ishlatish

Chrome/Firefox DevTools:
- Grid overlay
- Line numbers
- Area names
- Track sizes

---

## Qo'shimcha resurslar

- [CSS Grid Garden](https://cssgridgarden.com/) - O'yin
- [Grid by Example](https://gridbyexample.com/)
- [MDN CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [Jen Simmons - Layout Land](https://www.youtube.com/c/LayoutLand)

---

## Keyingi mavzu

Responsive Layouts: [03-responsive-layouts.md](./03-responsive-layouts.md)
