# Flexbox - Flexible Box Layout

Flexbox - bir o'lchovli (one-dimensional) layout tizimi. Elementlarni qator (row) yoki ustun (column) bo'ylab joylashtirish uchun ishlatiladi.

## Mundarija

1. [Asosiy tushunchalar](#asosiy-tushunchalar)
2. [Container xususiyatlari](#container-xususiyatlari)
3. [Item xususiyatlari](#item-xususiyatlari)
4. [Real-world patterns](#real-world-patterns)
5. [Mobile va Responsive](#mobile-va-responsive)
6. [Xatolar va to'g'ri yechimlar](#xatolar-va-togri-yechimlar)
7. [Interview savollari](#interview-savollari)
8. [Best Practices](#best-practices)

---

## Asosiy tushunchalar

### Flex Container va Flex Items

```html
<div class="container">  <!-- Flex Container -->
  <div class="item">1</div>  <!-- Flex Item -->
  <div class="item">2</div>  <!-- Flex Item -->
  <div class="item">3</div>  <!-- Flex Item -->
</div>
```

```css
.container {
  display: flex; /* yoki inline-flex */
}
```

### Axis (O'qlar)

Flexbox ikki o'qda ishlaydi:

```
flex-direction: row (default)
┌─────────────────────────────────────────┐
│ ──────────────────────────────────────► │  Main Axis (asosiy o'q)
│ │                                       │
│ │                                       │
│ ▼                                       │
│ Cross Axis (ko'ndalang o'q)             │
└─────────────────────────────────────────┘

flex-direction: column
┌─────────────────────────────────────────┐
│ │  Main Axis (asosiy o'q)               │
│ │                                       │
│ ▼                                       │
│ ──────────────────────────────────────► │
│ Cross Axis (ko'ndalang o'q)             │
└─────────────────────────────────────────┘
```

**Muhim:** `justify-content` Main Axis bo'ylab, `align-items` Cross Axis bo'ylab ishlaydi.

---

## Container xususiyatlari

### 1. display

```css
.container {
  display: flex;        /* Block-level flex container */
  display: inline-flex; /* Inline-level flex container */
}
```

### 2. flex-direction

Elementlar qaysi yo'nalishda joylashadi:

```css
.container {
  flex-direction: row;            /* → Chapdan o'ngga (default) */
  flex-direction: row-reverse;    /* ← O'ngdan chapga */
  flex-direction: column;         /* ↓ Yuqoridan pastga */
  flex-direction: column-reverse; /* ↑ Pastdan yuqoriga */
}
```

**Visual:**
```
row:            row-reverse:     column:         column-reverse:
┌───┬───┬───┐   ┌───┬───┬───┐   ┌───┐           ┌───┐
│ 1 │ 2 │ 3 │   │ 3 │ 2 │ 1 │   │ 1 │           │ 3 │
└───┴───┴───┘   └───┴───┴───┘   ├───┤           ├───┤
                                │ 2 │           │ 2 │
                                ├───┤           ├───┤
                                │ 3 │           │ 1 │
                                └───┘           └───┘
```

### 3. flex-wrap

Elementlar bir qatorga sig'masa nima bo'ladi:

```css
.container {
  flex-wrap: nowrap;       /* Sig'diradi (default) - shrink */
  flex-wrap: wrap;         /* Keyingi qatorga o'tadi */
  flex-wrap: wrap-reverse; /* Teskari wrap */
}
```

**Visual:**
```
nowrap (default):          wrap:                    wrap-reverse:
┌───┬───┬───┬───┬───┐     ┌───┬───┬───┐            ┌───┬───┐
│ 1 │ 2 │ 3 │ 4 │ 5 │     │ 1 │ 2 │ 3 │            │ 4 │ 5 │
└───┴───┴───┴───┴───┘     ├───┼───┼───┘            ├───┼───┼───┐
(siqiladi)                │ 4 │ 5 │                │ 1 │ 2 │ 3 │
                          └───┴───┘                └───┴───┴───┘
```

### 4. flex-flow (shorthand)

```css
/* flex-direction va flex-wrap birgalikda */
.container {
  flex-flow: row wrap;
  /* flex-direction: row; flex-wrap: wrap; */
}
```

### 5. justify-content

Main axis bo'ylab alignment:

```css
.container {
  justify-content: flex-start;    /* Boshiga (default) */
  justify-content: flex-end;      /* Oxiriga */
  justify-content: center;        /* Markazga */
  justify-content: space-between; /* Orasida teng bo'shliq */
  justify-content: space-around;  /* Atrofida teng bo'shliq */
  justify-content: space-evenly;  /* Butunlay teng bo'shliq */
}
```

**Visual (row direction):**
```
flex-start:         flex-end:           center:
┌───┬───┬───┐       ┌───────┬───┬───┐   ┌───┬───┬───┐
│ 1 │ 2 │ 3 │       │       │ 1 │ 2 │ 3 │   │ 1 │ 2 │ 3 │
└───┴───┴───┘       └───────┴───┴───┘   └───┴───┴───┘

space-between:      space-around:       space-evenly:
┌───┬───────┬───┐   ┌─┬───┬──┬───┬─┐   ┌──┬───┬──┬───┬──┐
│ 1 │       │ 3 │   │ │ 1 │  │ 2 │ │   │  │ 1 │  │ 2 │  │
│   │   2   │   │   │ └───┘  └───┘ │   │  └───┘  └───┘  │
└───┴───────┴───┘   └─────────────┘   └────────────────┘
```

### 6. align-items

Cross axis bo'ylab alignment (bitta qator):

```css
.container {
  align-items: stretch;    /* To'liq cho'ziladi (default) */
  align-items: flex-start; /* Boshiga */
  align-items: flex-end;   /* Oxiriga */
  align-items: center;     /* Markazga */
  align-items: baseline;   /* Matn baseline bo'yicha */
}
```

**Visual (row direction):**
```
stretch:            flex-start:         center:             flex-end:
┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│┌───┬───┬───┐  │   │┌───┬───┬───┐  │   │               │   │               │
││ 1 │ 2 │ 3 │  │   ││ 1 │ 2 │ 3 │  │   │┌───┬───┬───┐  │   │               │
││   │   │   │  │   │└───┴───┴───┘  │   ││ 1 │ 2 │ 3 │  │   │┌───┬───┬───┐  │
│└───┴───┴───┘  │   │               │   │└───┴───┴───┘  │   ││ 1 │ 2 │ 3 │  │
└───────────────┘   └───────────────┘   └───────────────┘   │└───┴───┴───┘  │
                                                            └───────────────┘
```

### 7. align-content

Ko'p qator bo'lganda qatorlarni align qilish:

```css
.container {
  flex-wrap: wrap; /* Bu kerak! */
  align-content: flex-start;
  align-content: flex-end;
  align-content: center;
  align-content: space-between;
  align-content: space-around;
  align-content: stretch; /* default */
}
```

### 8. gap

Elementlar orasidagi bo'shliq:

```css
.container {
  gap: 20px;           /* row-gap va column-gap ikkalasi */
  gap: 20px 10px;      /* row-gap: 20px, column-gap: 10px */
  row-gap: 20px;       /* Qatorlar orasida */
  column-gap: 10px;    /* Ustunlar orasida */
}
```

**Noto'g'ri:**
```css
/* Eski yondashuv - margin bilan */
.item {
  margin: 10px;
}
.item:first-child {
  margin-left: 0;
}
.item:last-child {
  margin-right: 0;
}
```

**To'g'ri:**
```css
/* Zamonaviy yondashuv - gap bilan */
.container {
  display: flex;
  gap: 20px;
}
```

---

## Item xususiyatlari

### 1. order

Elementlarning vizual tartibi (DOM tartibini o'zgartirmaydi):

```css
.item {
  order: 0; /* default */
}

.item:nth-child(1) { order: 3; }
.item:nth-child(2) { order: 1; }
.item:nth-child(3) { order: 2; }

/* Natija: 2, 3, 1 ko'rinishda */
```

**Ogohlantirish:** `order` accessibility muammolarga olib kelishi mumkin (screen reader DOM tartibida o'qiydi).

### 2. flex-grow

Bo'sh joyni qanday taqsimlash:

```css
.item {
  flex-grow: 0; /* Bo'sh joyni olmaydi (default) */
  flex-grow: 1; /* Bo'sh joyni oladi */
}
```

**Visual:**
```
flex-grow: 0 (default):     flex-grow: 1 (all items):
┌───┬───┬───┬─────────┐     ┌─────────┬─────────┬─────────┐
│ 1 │ 2 │ 3 │ bo'sh   │     │    1    │    2    │    3    │
└───┴───┴───┴─────────┘     └─────────┴─────────┴─────────┘

Item 2 da flex-grow: 2:
┌─────┬───────────┬─────┐
│  1  │     2     │  3  │
└─────┴───────────┴─────┘
(2 ikki hissa ko'p bo'sh joy oladi)
```

### 3. flex-shrink

Joy yetmasa qanday siqiladi:

```css
.item {
  flex-shrink: 1; /* Siqiladi (default) */
  flex-shrink: 0; /* Siqilmaydi */
}
```

**Masalan:**
```css
/* Sidebar siqilmasin */
.sidebar {
  flex-shrink: 0;
  width: 250px;
}

/* Content siqilishi mumkin */
.content {
  flex-shrink: 1;
}
```

### 4. flex-basis

Elementning boshlang'ich o'lchami:

```css
.item {
  flex-basis: auto; /* width/height ga qaraydi (default) */
  flex-basis: 200px; /* Aniq o'lcham */
  flex-basis: 25%; /* Foiz */
  flex-basis: 0; /* flex-grow asosida hisoblaydi */
}
```

**flex-basis vs width:**
```css
/* flex-basis Main Axis bo'ylab ishlaydi */
.container { flex-direction: row; }
.item { flex-basis: 200px; } /* width kabi */

.container { flex-direction: column; }
.item { flex-basis: 200px; } /* height kabi */
```

### 5. flex (shorthand)

```css
.item {
  flex: 0 1 auto; /* default: grow shrink basis */
  flex: 1;        /* flex: 1 1 0 */
  flex: auto;     /* flex: 1 1 auto */
  flex: none;     /* flex: 0 0 auto */
  flex: 2;        /* flex: 2 1 0 */
}
```

**Eng ko'p ishlatiladigan:**
```css
/* Teng bo'linadi */
.item { flex: 1; }

/* Siqilmaydi, o'z o'lchami */
.item { flex: none; }

/* 2:1 ratio */
.item-large { flex: 2; }
.item-small { flex: 1; }
```

### 6. align-self

Individual item alignment (align-items ni override qiladi):

```css
.item {
  align-self: auto;       /* container dan meros (default) */
  align-self: flex-start;
  align-self: flex-end;
  align-self: center;
  align-self: baseline;
  align-self: stretch;
}
```

---

## Real-world patterns

### 1. Navbar

```html
<nav class="navbar">
  <div class="logo">Logo</div>
  <ul class="nav-links">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
  <button class="cta-button">Sign Up</button>
</nav>
```

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Mobile */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
}
```

### 2. Card Layout

```html
<div class="card">
  <img src="image.jpg" alt="Card image" class="card-image">
  <div class="card-content">
    <h3 class="card-title">Card Title</h3>
    <p class="card-text">Some description text here...</p>
    <button class="card-button">Read More</button>
  </div>
</div>
```

```css
.card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  flex: 1; /* Karta teng balandlikda bo'lishi uchun */
  padding: 1.5rem;
}

.card-text {
  flex: 1; /* Matn joyni egallaydi */
}

.card-button {
  margin-top: auto; /* Button har doim pastda */
}
```

### 3. Sidebar Layout

```html
<div class="app-layout">
  <aside class="sidebar">Sidebar</aside>
  <main class="main-content">Main Content</main>
</div>
```

```css
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  flex: 0 0 250px; /* Siqilmaydi, 250px */
  background: #1a1a2e;
  color: #fff;
}

.main-content {
  flex: 1; /* Qolgan joyni oladi */
  padding: 2rem;
  overflow-y: auto;
}

/* Mobile - Sidebar yuqorida */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .sidebar {
    flex-basis: auto;
  }
}
```

### 4. Centered Content (Holy Grail)

```css
/* Vertikal va gorizontal markazlashtirish */
.centered-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* Yoki shorthand */
.centered-container {
  display: flex;
  place-items: center; /* align-items + justify-items */
  min-height: 100vh;
}
```

### 5. Equal Height Cards

```html
<div class="cards-grid">
  <div class="card">Short content</div>
  <div class="card">Much longer content that takes more space</div>
  <div class="card">Medium content</div>
</div>
```

```css
.cards-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.card {
  flex: 1 1 300px; /* Min 300px, keyin o'sadi */
  display: flex;
  flex-direction: column;
}
```

### 6. Input with Button

```html
<div class="search-box">
  <input type="text" class="search-input" placeholder="Search...">
  <button class="search-button">Search</button>
</div>
```

```css
.search-box {
  display: flex;
  max-width: 500px;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-right: none;
  border-radius: 4px 0 0 4px;
}

.search-button {
  flex-shrink: 0;
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}
```

---

## Mobile va Responsive

### Mobile-First Approach

```css
/* Mobile (default) */
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .item {
    flex: 1 1 calc(50% - 0.5rem);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .item {
    flex: 1 1 calc(33.333% - 0.67rem);
  }
}
```

### Touch-Friendly Spacing

```css
/* Mobile da kattaroq touch targets */
.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-links a {
  padding: 0.5rem 1rem;
}

@media (max-width: 768px) {
  .nav-links {
    flex-direction: column;
  }

  .nav-links a {
    padding: 1rem; /* 44px minimum touch target */
    min-height: 44px;
    display: flex;
    align-items: center;
  }
}
```

### Dark Mode Support

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #1a1a1a;
  --border-color: #e0e0e0;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --text-primary: #ffffff;
    --border-color: #333333;
  }
}

.card {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

---

## Xatolar va to'g'ri yechimlar

### Xato 1: min-width: 0 unutish

```css
/* NOTO'G'RI - Matn overflow bo'ladi */
.container {
  display: flex;
}
.item {
  flex: 1;
}
.item p {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* TO'G'RI - min-width: 0 qo'shish */
.item {
  flex: 1;
  min-width: 0; /* Flex item'ning default min-width: auto ni bekor qiladi */
}
```

### Xato 2: 100% height ishlamaydi

```css
/* NOTO'G'RI */
.container {
  display: flex;
  height: 100%; /* Parent height yo'q */
}

/* TO'G'RI */
html, body {
  height: 100%;
  margin: 0;
}
.container {
  display: flex;
  min-height: 100vh; /* yoki height: 100% */
}
```

### Xato 3: margin: auto tushunmaslik

```css
/* Flexda margin: auto bo'sh joyni oladi */
.container {
  display: flex;
}

/* Oxirgi item o'ngga */
.item:last-child {
  margin-left: auto;
}

/* Birinchi item chapga, qolganlari o'ngga */
.item:first-child {
  margin-right: auto;
}

/* Markazga */
.item {
  margin: auto;
}
```

### Xato 4: flex-shrink: 0 qo'ymaslik

```css
/* NOTO'G'RI - Rasm siqiladi */
.card {
  display: flex;
}
.card-image {
  width: 200px;
}

/* TO'G'RI */
.card-image {
  flex-shrink: 0;
  width: 200px;
}
```

### Xato 5: height va flex-basis aralashishi

```css
/* NOTO'G'RI - column da height ishlamaydi */
.container {
  display: flex;
  flex-direction: column;
}
.item {
  height: 100px; /* flex-basis: auto bo'lgani uchun ishlaydi, lekin... */
}

/* TO'G'RI - flex-basis ishlatish */
.item {
  flex-basis: 100px;
  flex-shrink: 0; /* Agar siqilmasin desangiz */
}
```

---

## Interview savollari

### 1. Flexbox va Grid farqi nima? Qachon qaysi birini ishlatish kerak?

**Javob:**

| Xususiyat | Flexbox | Grid |
|-----------|---------|------|
| O'lcham | 1D (row YOKI column) | 2D (row VA column) |
| Use case | Component layout | Page layout |
| Content-based | Ha (flex-grow/shrink) | Yo'q (aniq cell) |
| Gap support | Ha | Ha |

**Qachon Flexbox:**
- Navbar, buttons row
- Card content
- Centering
- Dynamic content sizes

**Qachon Grid:**
- Page layouts
- Image galleries
- Dashboard
- Form layouts

### 2. `flex: 1` nimani anglatadi?

**Javob:**
```css
flex: 1;
/* Quyidagiga teng: */
flex-grow: 1;   /* Bo'sh joyni oladi */
flex-shrink: 1; /* Siqilishi mumkin */
flex-basis: 0;  /* Boshlang'ich o'lchami 0 */
```

`flex-basis: 0` muhim - bu elementlar teng bo'linishini ta'minlaydi.

```css
flex: auto;
/* Quyidagiga teng: */
flex: 1 1 auto; /* Boshlang'ich o'lcham: content size */
```

### 3. `align-items` va `align-content` farqi?

**Javob:**

- **align-items:** Bir qatordagi elementlarni align qiladi
- **align-content:** Ko'p qator bo'lganda qatorlarni align qiladi (flex-wrap: wrap kerak)

```css
/* align-items - har bir item */
.container {
  align-items: center; /* Har item qator ichida center */
}

/* align-content - qatorlar */
.container {
  flex-wrap: wrap;
  align-content: center; /* Barcha qatorlar container ichida center */
}
```

### 4. Flexbox da element overflow bo'lsa nima qilish kerak?

**Javob:**

```css
.flex-item {
  /* 1. min-width ni reset qilish */
  min-width: 0;

  /* 2. overflow ni handle qilish */
  overflow: hidden;

  /* 3. Text uchun */
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**Sabab:** Flex items default `min-width: auto` - content dan kichik bo'la olmaydi.

### 5. `order` property accessibility muammolari bormi?

**Javob:**

Ha, `order` faqat vizual tartibni o'zgartiradi:
- Screen readers DOM tartibida o'qiydi
- Keyboard navigation DOM tartibida ishlaydi

```css
/* Visual: 2, 3, 1 */
.item:nth-child(1) { order: 3; }
.item:nth-child(2) { order: 1; }
.item:nth-child(3) { order: 2; }

/* Screen reader: 1, 2, 3 */
/* Tab order: 1, 2, 3 */
```

**Yechim:** Imkon qadar DOM tartibini o'zgartiring, `order` faqat vizual dekoratsiya uchun ishlating.

---

## Best Practices

### 1. Semantic class names

```css
/* NOTO'G'RI */
.flex-center {
  display: flex;
  justify-content: center;
}

/* TO'G'RI */
.hero-content {
  display: flex;
  justify-content: center;
}
```

### 2. Gap ishlatish

```css
/* NOTO'G'RI - margin bilan */
.item {
  margin-right: 20px;
}
.item:last-child {
  margin-right: 0;
}

/* TO'G'RI - gap bilan */
.container {
  display: flex;
  gap: 20px;
}
```

### 3. flex shorthand

```css
/* NOTO'G'RI - alohida */
.item {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
}

/* TO'G'RI - shorthand */
.item {
  flex: 1;
}
```

### 4. min-width: 0 esdan chiqarmaslik

```css
.flex-item {
  flex: 1;
  min-width: 0; /* Text truncation ishlashi uchun */
}
```

### 5. Logical properties (RTL support)

```css
/* NOTO'G'RI - faqat LTR */
.item {
  margin-right: auto;
}

/* TO'G'RI - RTL ham ishlaydi */
.item {
  margin-inline-end: auto;
}
```

### 6. Mobile-first media queries

```css
/* Mobile (default) */
.container {
  flex-direction: column;
}

/* Tablet+ */
@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}
```

### 7. DevTools ishlatish

Chrome DevTools da:
1. Element inspect
2. `display: flex` yonida flexbox icon
3. Click - visual flexbox overlay
4. Container va item properties editor

---

## Qo'shimcha resurslar

- [A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Flexbox Froggy](https://flexboxfroggy.com/) - O'yin
- [MDN Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)

---

## Keyingi mavzu

CSS Grid bilan tanishing: [02-grid.md](./02-grid.md)
