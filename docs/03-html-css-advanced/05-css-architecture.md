# CSS Architecture - Metodologiyalar va Patterns

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dastlab loyihada CSS ni xohlagancha yozish oson, lekin loyiha kattalashgani sari bitta o'zgarish boshqa joylarni ham buzib qo'yishni boshlaydi. CSS arxitekturasi (BEM, SMACSS kabi) aynan mana shu tartibsizlikni yo'qotadi va jamoa bo'lib ishlashda "hamma bitta tilda gaplashishini" ta'minlaydi. Senior dasturchi bo'lish shunchaki CSS yozish emas, balki uni qanday qilib barqaror tashkil etishni bilishdir.

> [!NOTE]
> **Real-hayot analogiyasi: "Kutubxona"**  
> Agar kutubxonada minglab kitoblar shunchaki yerga tashlab qo'yilsa, keraklisini topish imkonsiz. Kitoblarni avval fanlarga (SMACSS/ITCSS), so'ngra mualliflarga ko'ra javonlarga terib, ularga yorliqlar (BEM) yopishtirilsa, istalgan kitob 10 soniyada topiladi. CSS arxitekturasi ham sizning kodingiz uchun ana shunday "javon va yorliqlar" tizimidir.
## Mundarija

1. [CSS Architecture muammolari](#css-architecture-muammolari)
2. [BEM Methodology](#bem-methodology)
3. [OOCSS - Object Oriented CSS](#oocss---object-oriented-css)
4. [SMACSS](#smacss)
5. [ITCSS](#itcss)
6. [Atomic CSS / Utility-First](#atomic-css--utility-first)
7. [CSS Modules](#css-modules)
8. [CSS-in-JS](#css-in-js)
9. [Design Tokens](#design-tokens)
10. [Specificity Management](#specificity-management)
11. [Interview savollari](#interview-savollari)
12. [Best Practices](#best-practices)

---

## CSS Architecture muammolari

### Global Scope Problem

```css
/* File: header.css */
.title {
  font-size: 2rem;
  color: blue;
}

/* File: card.css */
.title {
  font-size: 1rem;
  color: black;
}

/* MUAMMO: Qaysi .title ishlaydi? */
```

### Specificity Wars

```css
/* Developer A */
.header .nav .nav-item a {
  color: blue;
}

/* Developer B - A ni override qilish uchun */
.header .nav .nav-item a.active {
  color: red;
}

/* Developer C - B ni override qilish uchun */
.header .nav .nav-item a.active:hover {
  color: green;
}

/* Desperation */
.header .nav .nav-item a.active:hover {
  color: purple !important;
}
```

### Scaling Issues

```
Kichik loyiha: 500 qator CSS - OK
O'rta loyiha: 5,000 qator CSS - Qiyin
Katta loyiha: 50,000+ qator CSS - Nightmare

Muammolar:
- Qaysi CSS ishlatilmoqda?
- Qaysi CSS o'chirilishi mumkin?
- Bu o'zgarish boshqa joyga ta'sir qiladimi?
```

### Solution: Naming Conventions + Architecture

---

## BEM Methodology

**BEM = Block Element Modifier**

Eng keng tarqalgan CSS naming convention.

### Asosiy Tushunchalar

```
Block:    Mustaqil component (.card, .nav, .form)
Element:  Block ning bir qismi (.card__title, .card__image)
Modifier: Block/Element ning varianti (.card--featured, .card__title--large)
```

### Sintaksis

```css
/* Block */
.block { }

/* Element: block__element */
.block__element { }

/* Modifier: block--modifier yoki block__element--modifier */
.block--modifier { }
.block__element--modifier { }
```

### Amaliy Misol

```html
<article class="card card--featured">
  <div class="card__header">
    <img class="card__image" src="image.jpg" alt="">
  </div>
  <div class="card__body">
    <h2 class="card__title card__title--large">Title</h2>
    <p class="card__description">Description text...</p>
  </div>
  <div class="card__footer">
    <button class="card__button card__button--primary">Read More</button>
  </div>
</article>
```

```scss
// SCSS bilan BEM
.card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  // Elements
  &__header {
    position: relative;
  }

  &__image {
    width: 100%;
    height: auto;
    display: block;
  }

  &__body {
    padding: 1.5rem;
  }

  &__title {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;

    // Element modifier
    &--large {
      font-size: 1.5rem;
    }
  }

  &__description {
    color: #666;
    line-height: 1.6;
  }

  &__footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #eee;
  }

  &__button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &--primary {
      background: #007bff;
      color: white;
    }

    &--secondary {
      background: #6c757d;
      color: white;
    }
  }

  // Block modifiers
  &--featured {
    border: 2px solid #007bff;

    .card__title {
      color: #007bff;
    }
  }

  &--compact {
    .card__body {
      padding: 1rem;
    }
  }
}
```

### BEM Qoidalari

```scss
// 1. Element Block ichida bo'lishi shart emas DOM da
// YOMON - Nested element names
.card__header__title { }

// YAXSHI - Flat element names
.card__title { }

// 2. Modifier hech qachon yolg'iz ishlatilmaydi
// YOMON
<div class="card--featured">

// YAXSHI
<div class="card card--featured">

// 3. Element modifier ham element bilan birga
// YOMON
<h2 class="card__title--large">

// YAXSHI
<h2 class="card__title card__title--large">
```

### BEM Naming Variations

```css
/* Standard BEM */
.block__element--modifier { }

/* CamelCase BEM */
.blockName__elementName--modifierName { }

/* Kebab-case BEM */
.block-name__element-name--modifier-name { }

/* SUIT CSS (variation) */
.BlockName-elementName--modifierName { }
```

---

## OOCSS - Object Oriented CSS

**OOCSS = Object Oriented CSS**

Ikki asosiy prinsip:
1. **Structure va Skin ajratish**
2. **Container va Content ajratish**

### Principle 1: Structure vs Skin

```css
/* YOMON - Hamma narsa bitta class da */
.button-primary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  font-weight: 500;
}

.button-secondary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background: #6c757d;
  color: white;
  font-weight: 500;
}

/* YAXSHI - OOCSS: Structure va Skin ajratilgan */

/* Structure */
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
}

/* Skins */
.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-outline {
  background: transparent;
  border: 2px solid currentColor;
}
```

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline">Outline</button>
```

### Principle 2: Container vs Content

```css
/* YOMON - Content container ga bog'liq */
.sidebar h2 {
  font-size: 1.25rem;
  color: #333;
}

.main-content h2 {
  font-size: 1.5rem;
  color: #333;
}

/* YAXSHI - Content mustaqil */
.heading-md {
  font-size: 1.25rem;
  color: #333;
}

.heading-lg {
  font-size: 1.5rem;
  color: #333;
}
```

```html
<aside class="sidebar">
  <h2 class="heading-md">Sidebar Title</h2>
</aside>

<main class="main-content">
  <h2 class="heading-lg">Main Title</h2>
</main>
```

### OOCSS Objects

```css
/* Media Object - Content + Image */
.media {
  display: flex;
  gap: 1rem;
}

.media__image {
  flex-shrink: 0;
}

.media__body {
  flex: 1;
}

/* Flag Object - Media but centered */
.flag {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Box Object */
.box {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.box--flush {
  padding: 0;
}

.box--shaded {
  background: #f5f5f5;
}
```

---

## SMACSS

**SMACSS = Scalable and Modular Architecture for CSS**

CSS ni 5 kategoriyaga bo'lish.

### Kategoriyalar

```
1. Base      - Element selectors, resets
2. Layout    - Major layout sections (l-)
3. Module    - Reusable components
4. State     - State changes (is-)
5. Theme     - Visual appearance (theme-)
```

### 1. Base

```css
/* Normalize va element styles */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  line-height: 1.5;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
  height: auto;
}
```

### 2. Layout (l- prefix)

```css
.l-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
}

.l-main {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

.l-sidebar {
  background: #1a1a2e;
}

.l-content {
  padding: 2rem;
  overflow-y: auto;
}

.l-footer {
  background: #333;
  color: white;
  padding: 2rem;
}

.l-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

### 3. Module

```css
/* Card module */
.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.card-body {
  padding: 1.5rem;
}

/* Navigation module */
.nav {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  padding: 0.5rem 1rem;
}

.nav-link {
  display: block;
  padding: 0.5rem;
}
```

### 4. State (is- prefix)

```css
/* States - JavaScript orqali toggle qilinadi */
.is-hidden {
  display: none !important;
}

.is-visible {
  display: block !important;
}

.is-active {
  font-weight: bold;
  color: #007bff;
}

.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.is-loading {
  position: relative;
  pointer-events: none;
}

.is-loading::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
}

.is-expanded {
  max-height: 1000px;
  overflow: visible;
}

.is-collapsed {
  max-height: 0;
  overflow: hidden;
}

/* Module-specific states */
.nav-item.is-active {
  background: #e9ecef;
}

.card.is-loading {
  min-height: 200px;
}
```

### 5. Theme (theme- prefix)

```css
/* Theme variations */
.theme-dark {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --border-color: #333;
}

.theme-light {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
}

/* Apply theme */
body {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.card {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}
```

---

## ITCSS

**ITCSS = Inverted Triangle CSS**

Specificity va reach bo'yicha CSS ni tashkil qilish.

### Triangle Structure

```
          Settings    - Variables, config (no CSS output)
         Tools       - Mixins, functions (no CSS output)
        Generic     - Reset, normalize
       Elements    - Bare HTML elements (h1, a, p)
      Objects     - Layout patterns (OOCSS)
     Components  - UI components (BEM)
    Trumps      - Utilities, helpers (!important OK)

Tepadan pastga:
- Reach (ta'sir doirasi): Keng → Tor
- Specificity: Past → Yuqori
- Explicitness: Umumiy → Aniq
```

### File Structure

```
styles/
├── 1-settings/
│   ├── _colors.scss
│   ├── _typography.scss
│   ├── _spacing.scss
│   └── _breakpoints.scss
├── 2-tools/
│   ├── _mixins.scss
│   └── _functions.scss
├── 3-generic/
│   ├── _reset.scss
│   └── _box-sizing.scss
├── 4-elements/
│   ├── _headings.scss
│   ├── _links.scss
│   └── _images.scss
├── 5-objects/
│   ├── _container.scss
│   ├── _grid.scss
│   └── _media.scss
├── 6-components/
│   ├── _button.scss
│   ├── _card.scss
│   └── _nav.scss
├── 7-trumps/
│   ├── _utilities.scss
│   └── _overrides.scss
└── main.scss
```

### main.scss

```scss
// 1. Settings - No CSS output
@use '1-settings/colors' as colors;
@use '1-settings/typography' as type;
@use '1-settings/spacing' as space;
@use '1-settings/breakpoints' as bp;

// 2. Tools - No CSS output
@use '2-tools/mixins' as mix;
@use '2-tools/functions' as fn;

// 3. Generic - Low specificity, high reach
@use '3-generic/reset';
@use '3-generic/box-sizing';

// 4. Elements - Type selectors
@use '4-elements/headings';
@use '4-elements/links';
@use '4-elements/images';

// 5. Objects - Class selectors, layout
@use '5-objects/container';
@use '5-objects/grid';
@use '5-objects/media';

// 6. Components - Class selectors, UI
@use '6-components/button';
@use '6-components/card';
@use '6-components/nav';

// 7. Trumps - Highest specificity
@use '7-trumps/utilities';
@use '7-trumps/overrides';
```

---

## Atomic CSS / Utility-First

### Atomic CSS Concept

Har bir class bitta CSS property.

```css
/* Atomic/Utility classes */
.d-flex { display: flex; }
.d-block { display: block; }
.d-none { display: none; }

.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }

.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }

.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-4 { padding: 1rem; }
.p-8 { padding: 2rem; }

.m-auto { margin: auto; }
.mx-auto { margin-left: auto; margin-right: auto; }

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.font-bold { font-weight: bold; }
.font-normal { font-weight: normal; }

.bg-primary { background-color: var(--color-primary); }
.bg-white { background-color: white; }

.text-primary { color: var(--color-primary); }
.text-white { color: white; }

.rounded { border-radius: 0.25rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-full { border-radius: 9999px; }

.shadow { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
.shadow-lg { box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); }

.w-full { width: 100%; }
.h-full { height: 100%; }
```

### Tailwind CSS Example

```html
<!-- Tailwind CSS - Utility-first -->
<div class="max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
  <div class="md:flex">
    <div class="md:shrink-0">
      <img class="h-48 w-full object-cover md:h-full md:w-48"
           src="image.jpg" alt="">
    </div>
    <div class="p-8">
      <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
        Case study
      </div>
      <a href="#" class="block mt-1 text-lg leading-tight font-medium text-black hover:underline">
        Finding customers for your new business
      </a>
      <p class="mt-2 text-slate-500">
        Getting a new business off the ground is a lot of hard work.
      </p>
    </div>
  </div>
</div>
```

### Pros va Cons

**Afzalliklar:**
- Dead CSS yo'q - faqat ishlatilgan classes compile
- Naming muammo yo'q
- Rapid prototyping
- Consistent design system
- Small bundle size (purge bilan)

**Kamchiliklar:**
- HTML "iflos" ko'rinadi
- Learning curve
- Semantic emas
- Extract component kerak

### Hybrid Approach

```html
<!-- Component + Utilities -->
<div class="card p-4 md:p-6">
  <h2 class="card__title mb-2">Title</h2>
  <p class="card__text text-gray-600">Description</p>
  <button class="btn btn--primary mt-4">Action</button>
</div>
```

```css
/* Base component styles */
.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
}

/* Tailwind for spacing, colors, responsive */
@tailwind utilities;
```

---

## CSS Modules

CSS Modules - build vaqtida class names hash qilinadi, local scope yaratiladi.

### Setup

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      }
    ]
  }
};
```

### Usage

```css
/* Button.module.css */
.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary {
  background: #007bff;
  color: white;
}

.secondary {
  background: #6c757d;
  color: white;
}

.large {
  padding: 1rem 2rem;
  font-size: 1.25rem;
}
```

```jsx
// Button.jsx (React)
import styles from './Button.module.css';

function Button({ variant = 'primary', size, children }) {
  return (
    <button
      className={`
        ${styles.button}
        ${styles[variant]}
        ${size === 'large' ? styles.large : ''}
      `}
    >
      {children}
    </button>
  );
}

// Compiled output:
// <button class="Button_button_x7f3s Button_primary_k2m4n">
```

### Composition

```css
/* base.module.css */
.flex {
  display: flex;
}

.center {
  composes: flex;
  justify-content: center;
  align-items: center;
}

/* Button.module.css */
.button {
  composes: center from './base.module.css';
  padding: 1rem;
}
```

### Vue.js Scoped CSS

```vue
<template>
  <button class="btn" :class="{ 'btn--primary': primary }">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
}

.btn--primary {
  background: #007bff;
  color: white;
}
</style>

<!-- Compiled: -->
<!-- <button class="btn btn--primary" data-v-f3f3eg9> -->
```

---

## CSS-in-JS

JavaScript ichida CSS yozish.

### Styled Components (React)

```jsx
import styled from 'styled-components';

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
  cursor: pointer;

  &:hover {
    background: ${props => props.primary ? '#0069d9' : '#5a6268'};
  }

  ${props => props.large && `
    padding: 1rem 2rem;
    font-size: 1.25rem;
  `}
`;

// Usage
<Button primary>Primary</Button>
<Button large>Large</Button>
```

### Emotion

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

const buttonStyles = css`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const primaryStyles = css`
  background: #007bff;
  color: white;
`;

function Button({ primary, children }) {
  return (
    <button css={[buttonStyles, primary && primaryStyles]}>
      {children}
    </button>
  );
}
```

### Pros va Cons

**Afzalliklar:**
- Dynamic styles (props based)
- Automatic vendor prefixing
- Dead code elimination
- Colocated with component
- TypeScript support

**Kamchiliklar:**
- Runtime overhead
- Bundle size
- Learning curve
- Server-side rendering complexity

---

## Design Tokens

Design tokens - design system ning atomic values.

### Token Categories

```scss
// 1. Colors
$color-primary-50: #e3f2fd;
$color-primary-100: #bbdefb;
$color-primary-500: #2196f3;
$color-primary-900: #0d47a1;

// Semantic tokens
$color-text-primary: $color-neutral-900;
$color-text-secondary: $color-neutral-600;
$color-bg-primary: $color-neutral-50;
$color-border: $color-neutral-200;

// 2. Typography
$font-family-sans: 'Inter', system-ui, sans-serif;
$font-family-mono: 'Fira Code', monospace;

$font-size-xs: 0.75rem;
$font-size-sm: 0.875rem;
$font-size-base: 1rem;
$font-size-lg: 1.125rem;
$font-size-xl: 1.25rem;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

$line-height-tight: 1.25;
$line-height-normal: 1.5;
$line-height-loose: 1.75;

// 3. Spacing
$space-0: 0;
$space-1: 0.25rem;
$space-2: 0.5rem;
$space-3: 0.75rem;
$space-4: 1rem;
$space-6: 1.5rem;
$space-8: 2rem;
$space-12: 3rem;
$space-16: 4rem;

// 4. Borders
$border-radius-none: 0;
$border-radius-sm: 0.125rem;
$border-radius-base: 0.25rem;
$border-radius-md: 0.375rem;
$border-radius-lg: 0.5rem;
$border-radius-full: 9999px;

$border-width-1: 1px;
$border-width-2: 2px;

// 5. Shadows
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

// 6. Transitions
$transition-fast: 150ms;
$transition-base: 200ms;
$transition-slow: 300ms;

$easing-default: cubic-bezier(0.4, 0, 0.2, 1);
$easing-in: cubic-bezier(0.4, 0, 1, 1);
$easing-out: cubic-bezier(0, 0, 0.2, 1);

// 7. Z-index
$z-dropdown: 1000;
$z-sticky: 1100;
$z-fixed: 1200;
$z-modal-backdrop: 1300;
$z-modal: 1400;
$z-popover: 1500;
$z-tooltip: 1600;
```

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary: #007bff;
  --color-primary-dark: #0056b3;
  --color-secondary: #6c757d;

  /* Semantic */
  --color-text: #1a1a1a;
  --color-text-muted: #666666;
  --color-bg: #ffffff;
  --color-bg-muted: #f5f5f5;
  --color-border: #e0e0e0;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;

  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --font-size-base: 1rem;
  --line-height: 1.5;

  /* Misc */
  --radius: 0.25rem;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --transition: 200ms ease;
}

/* Dark mode */
[data-theme="dark"] {
  --color-text: #ffffff;
  --color-text-muted: #a0a0a0;
  --color-bg: #1a1a1a;
  --color-bg-muted: #2d2d2d;
  --color-border: #404040;
}
```

### Token Usage

```css
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--space-4);
  box-shadow: var(--shadow);
}

.card-title {
  font-family: var(--font-sans);
  font-size: var(--font-size-lg);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.card-text {
  color: var(--color-text-muted);
  line-height: var(--line-height);
}
```

---

## Specificity Management

### Specificity Calculation

```
Inline styles:     1,0,0,0
ID selectors:      0,1,0,0
Class/attr/pseudo: 0,0,1,0
Element/pseudo-el: 0,0,0,1

#header .nav .active a:hover
= 0,1,0,0 + 0,0,1,0 + 0,0,1,0 + 0,0,0,1 + 0,0,1,0
= 0,1,3,1
```

### Specificity Best Practices

```css
/* YOMON - ID selectors */
#header { }
#main-nav { }

/* YOMON - Deeply nested */
.page .container .row .col .card .title { }

/* YAXSHI - Single class */
.header { }
.nav-primary { }
.card-title { }

/* YAXSHI - BEM */
.card { }
.card__title { }
.card--featured { }
```

### Specificity Layers (CSS Layers)

```css
/* CSS Cascade Layers - Modern approach */
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; padding: 0; }
}

@layer base {
  body { font-family: sans-serif; }
  a { color: inherit; }
}

@layer components {
  .btn { padding: 1rem; }
  .card { border-radius: 8px; }
}

@layer utilities {
  .mt-4 { margin-top: 1rem; }
  .text-center { text-align: center; }
}

/* Layer tartibi: reset < base < components < utilities */
/* Utilities har doim g'alaba qiladi (oxirgi layer) */
```

---

## Interview savollari

### 1. BEM nima va nima uchun kerak?

**Javob:**

BEM = Block Element Modifier.

```css
.block { }              /* Mustaqil component */
.block__element { }     /* Block ning qismi */
.block--modifier { }    /* Block ning varianti */
```

**Afzalliklar:**
- Specificity past va teng
- Self-documenting
- Scalable
- Maintainable
- No conflicts

### 2. Specificity qanday hisoblanadi?

**Javob:**

```
Inline:  1,0,0,0
ID:      0,1,0,0
Class:   0,0,1,0
Element: 0,0,0,1

.nav .active a = 0,0,2,1
#header nav a  = 0,1,0,2

0,1,0,2 > 0,0,2,1 (ID bor)
```

### 3. OOCSS va BEM farqi?

**Javob:**

| OOCSS | BEM |
|-------|-----|
| Principles | Naming convention |
| Structure/Skin separation | Block/Element/Modifier |
| Abstract objects | Concrete components |
| Multiple classes | Meaningful class names |

```css
/* OOCSS */
<button class="btn btn-primary btn-large">

/* BEM */
<button class="button button--primary button--large">
```

### 4. CSS Modules qanday ishlaydi?

**Javob:**

Build vaqtida class names hash qilinadi:

```css
/* Input */
.button { color: red; }

/* Output */
.Button_button_x7f3s { color: red; }
```

Foydalanish:
```jsx
import styles from './Button.module.css';
<button className={styles.button}>
```

### 5. Utility-first CSS afzalliklari va kamchiliklari?

**Javob:**

**Afzalliklar:**
- No dead CSS
- Rapid development
- Consistent system
- Small final bundle

**Kamchiliklari:**
- HTML verbose
- Not semantic
- Learning curve
- Need extraction for complex components

---

## Best Practices

### 1. Single source of truth

```scss
// Variables bitta joyda
$colors: ( ... );
$spacing: ( ... );

// Barcha componentlar shu variables ishlatadi
```

### 2. Low specificity

```css
/* YOMON */
#header .nav ul li a.active { }

/* YAXSHI */
.nav-link--active { }
```

### 3. Component-based thinking

```css
/* Har component mustaqil */
.card { /* self-contained */ }
.button { /* self-contained */ }
```

### 4. Consistent naming

```css
/* Bitta convention */
.component-name { }
.component-name__element { }
.component-name--modifier { }
```

### 5. Documentation

```scss
/**
 * Button Component
 *
 * Variants: primary, secondary, outline
 * Sizes: small, medium, large
 *
 * @example
 * <button class="btn btn--primary btn--large">
 */
.btn { }
```

### 6. No !important

```css
/* !important faqat utilities da */
.u-hidden { display: none !important; }

/* Componentlarda HECH QACHON */
```

### 7. Mobile-first

```css
/* Default = mobile */
.component { }

/* Desktop */
@media (min-width: 768px) {
  .component { }
}
```

---

## Xulosa

| Metodologiya | Asosiy g'oyasi | Afzalligi |
|--------------|----------------|-----------|
| **BEM** | `Block__Element--Modifier` | CSS klasslari qanday vazifa bajarishini faqat nomiga qarab tushunish mumkin |
| **OOCSS** | Tuzilma va Dizaynni ajratish | Kod qayta ishlatiluvchanligi oshadi, fayl hajmi kamayadi |
| **SMACSS** | CSS ni 5 ta toifaga bo'lish (Base, Layout, Module...) | Loyiha strukturasi juda aniq bo'ladi |
| **ITCSS** | Teskari uchburchak strukturasi | O'ziga xoslik (specificity) mojarolarining oldini oladi |
| **Atomic/Utility** | Har bir klass faqat 1 ta ish qiladi (`mt-4`, `text-center`) | Hech qachon CSS yozmaslikka imkon beradi (TailwindCSS) |
| **CSS Modules** | Har bir komponent o'zining "ajratilgan" CSSiga ega bo'ladi | Klass nomlari to'qnashib ketishi (conflict) umuman ro'y bermaydi |

---

## Keyingi mavzu

CSS Animations: [06-animations.md](./06-animations.md)
