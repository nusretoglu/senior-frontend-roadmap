# SCSS/Sass - CSS Preprocessor

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Oddiy CSS katta loyihalarda tezda yozish, o'qish va boshqarish qiyin bo'lgan yuzlab qatorlarga aylanib ketadi. SCSS (Sass) - bu CSS'ga "dasturlash tili" xususiyatlarini qo'shadi. O'zgaruvchilar (variables), funksiyalar (mixins) va takrorlanishlardan qochish (nesting) orqali yozadigan kodingiz hajmi qisqaradi va professional ko'rinishga keladi.

> [!NOTE]
> **Real-hayot analogiyasi: "Pishiriq qolipi"**  
> Tasavvur qiling siz yuzta bir xil pechenye pishirmoqchisiz. CSS da siz har bir pechenyeni qo'lda alohida shaklga keltirishingiz kerak bo'ladi (takroriy kod). SCSS esa xuddi tayyor "pechenye qolipi" ga (mixin) o'xshaydi: siz bir marta shaklni yaratib qo'yasiz va qolgan barchasini shunchaki bitta bosish (include) bilan shakllantirasiz. Natijada yuzlab tayyor va bir xil kiyingan kod bloklariga ega bo'lasiz.
## Mundarija

1. [SCSS vs Sass vs CSS](#scss-vs-sass-vs-css)
2. [Variables](#variables)
3. [Nesting](#nesting)
4. [Partials va Import](#partials-va-import)
5. [Mixins](#mixins)
6. [Functions](#functions)
7. [Extend va Inheritance](#extend-va-inheritance)
8. [Operators](#operators)
9. [Control Directives](#control-directives)
10. [Real-world Architecture](#real-world-architecture)
11. [Interview savollari](#interview-savollari)
12. [Best Practices](#best-practices)

---

## SCSS vs Sass vs CSS

### Sintaksis farqi

```scss
// SCSS (Sassy CSS) - CSS-like sintaksis
$primary-color: #007bff;

.button {
  background: $primary-color;
  padding: 1rem 2rem;

  &:hover {
    background: darken($primary-color, 10%);
  }
}
```

```sass
// Sass (indented syntax) - qavssiz
$primary-color: #007bff

.button
  background: $primary-color
  padding: 1rem 2rem

  &:hover
    background: darken($primary-color, 10%)
```

```css
/* Compiled CSS */
.button {
  background: #007bff;
  padding: 1rem 2rem;
}
.button:hover {
  background: #0069d9;
}
```

### Qaysi birini tanlash?

| Aspekt | SCSS | Sass |
|--------|------|------|
| Sintaksis | CSS-like | Indentation-based |
| Learning curve | Osonroq | Qiyinroq |
| CSS copy-paste | Ishlaydi | Ishlamaydi |
| Popularity | Ko'proq | Kamroq |
| File extension | `.scss` | `.sass` |

**Tavsiya:** SCSS - CSS bilan mos keladi va kengroq qo'llaniladi.

### Setup

```bash
# npm
npm install -D sass

# Compile
npx sass src/styles:dist/css

# Watch mode
npx sass --watch src/styles:dist/css

# Vite da avtomatik support
# PostCSS bilan
npm install -D sass postcss autoprefixer
```

---

## Variables

### Asosiy sintaksis

```scss
// Variables e'lon qilish
$font-family-base: 'Inter', system-ui, sans-serif;
$font-size-base: 1rem;
$line-height-base: 1.5;

$color-primary: #007bff;
$color-secondary: #6c757d;
$color-success: #28a745;
$color-danger: #dc3545;

$spacing-unit: 8px;
$border-radius: 4px;

// Ishlatish
body {
  font-family: $font-family-base;
  font-size: $font-size-base;
  line-height: $line-height-base;
}

.button {
  background: $color-primary;
  padding: $spacing-unit * 2;
  border-radius: $border-radius;
}
```

### Variable Scope

```scss
$global-var: blue; // Global

.element {
  $local-var: red; // Local - faqat shu block ichida

  color: $local-var;
  background: $global-var;
}

.other {
  color: $global-var; // OK
  // color: $local-var; // ERROR - undefined
}
```

### !default Flag

```scss
// Library/framework da default values
$brand-color: #007bff !default;

// User override (library import dan OLDIN)
$brand-color: #ff6b6b;
@import 'library';

// Endi library $brand-color = #ff6b6b ishlatadi
```

### !global Flag

```scss
$theme: light;

.dark-mode {
  $theme: dark !global; // Global ni o'zgartiradi
}
```

### Maps (Object-like)

```scss
// Map e'lon qilish
$colors: (
  'primary': #007bff,
  'secondary': #6c757d,
  'success': #28a745,
  'danger': #dc3545,
  'warning': #ffc107,
  'info': #17a2b8
);

$breakpoints: (
  'sm': 640px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px
);

// Map functions
.button-primary {
  background: map-get($colors, 'primary');
}

// Loop through map
@each $name, $color in $colors {
  .bg-#{$name} {
    background-color: $color;
  }

  .text-#{$name} {
    color: $color;
  }
}

// Map merge
$extended-colors: map-merge($colors, (
  'purple': #6f42c1,
  'pink': #e83e8c
));
```

### Lists (Array-like)

```scss
// List e'lon qilish
$font-stack: 'Helvetica', 'Arial', sans-serif;
$sizes: 0.5rem, 1rem, 1.5rem, 2rem, 3rem;

// List functions
body {
  font-family: $font-stack;
  padding: nth($sizes, 2); // 1rem (1-based index)
}

// Loop through list
@each $size in $sizes {
  .p-#{index($sizes, $size)} {
    padding: $size;
  }
}
// Natija: .p-1 { padding: 0.5rem; } ...
```

---

## Nesting

### Asosiy Nesting

```scss
.card {
  padding: 1.5rem;
  border-radius: 8px;

  .card-header {
    margin-bottom: 1rem;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .card-body {
    line-height: 1.6;
  }
}

// Compiled CSS:
// .card { ... }
// .card .card-header { ... }
// .card .card-title { ... }
// .card .card-body { ... }
```

### Parent Selector (&)

```scss
.button {
  background: #007bff;
  color: white;

  // Pseudo-classes
  &:hover {
    background: #0069d9;
  }

  &:focus {
    outline: 2px solid #80bdff;
    outline-offset: 2px;
  }

  &:active {
    background: #0056b3;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  // Pseudo-elements
  &::before {
    content: '';
  }

  // BEM modifiers
  &--primary {
    background: #007bff;
  }

  &--secondary {
    background: #6c757d;
  }

  &--large {
    padding: 1rem 2rem;
    font-size: 1.25rem;
  }

  // BEM elements
  &__icon {
    margin-right: 0.5rem;
  }

  // Append to parent
  .dark-theme & {
    background: #0056b3;
  }
}

// Compiled:
// .button { ... }
// .button:hover { ... }
// .button--primary { ... }
// .button__icon { ... }
// .dark-theme .button { ... }
```

### Nesting Depth Warning

```scss
// YOMON - Haddan tashqari chuqur nesting
.page {
  .container {
    .row {
      .col {
        .card {
          .card-body {
            .card-title {
              // 7 level! Specificity juda yuqori
            }
          }
        }
      }
    }
  }
}

// YAXSHI - Flat va BEM
.card {
  &__body { }
  &__title { }
}

// Qoida: 3 level dan oshirma!
```

### Property Nesting

```scss
.element {
  // Font properties
  font: {
    family: 'Inter', sans-serif;
    size: 1rem;
    weight: 500;
  }

  // Margin
  margin: {
    top: 1rem;
    bottom: 1rem;
  }

  // Background
  background: {
    color: #f5f5f5;
    image: url('bg.png');
    repeat: no-repeat;
    position: center;
  }
}

// Compiled:
// .element {
//   font-family: 'Inter', sans-serif;
//   font-size: 1rem;
//   font-weight: 500;
//   margin-top: 1rem;
//   margin-bottom: 1rem;
//   ...
// }
```

---

## Partials va Import

### File Structure

```
styles/
├── main.scss              # Entry point
├── _variables.scss        # Variables
├── _mixins.scss           # Mixins
├── _functions.scss        # Functions
├── base/
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _index.scss
├── components/
│   ├── _button.scss
│   ├── _card.scss
│   ├── _modal.scss
│   └── _index.scss
├── layout/
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _sidebar.scss
│   └── _index.scss
└── pages/
    ├── _home.scss
    ├── _about.scss
    └── _index.scss
```

### Partials (_filename.scss)

```scss
// _variables.scss - Underscore = partial (compile qilinmaydi)
$primary-color: #007bff;
$secondary-color: #6c757d;

// _mixins.scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### @use (Modern - Recommended)

```scss
// main.scss
@use 'variables';
@use 'mixins';
@use 'base';
@use 'components';
@use 'layout';
@use 'pages';

// Variables ishlatish - namespace bilan
body {
  color: variables.$primary-color;
}

// Yoki namespace o'zgartirish
@use 'variables' as vars;
body {
  color: vars.$primary-color;
}

// Yoki namespace yo'q qilish
@use 'variables' as *;
body {
  color: $primary-color;
}
```

### @forward (Re-export)

```scss
// components/_index.scss
@forward 'button';
@forward 'card';
@forward 'modal';

// main.scss
@use 'components';

// Endi components.button-style(), etc. available
```

### @import (Deprecated - lekin hali ishlatiladi)

```scss
// Eski yondashuv
@import 'variables';
@import 'mixins';
@import 'base/reset';
@import 'components/button';

// Muammo: Global scope, name collisions
```

---

## Mixins

### Asosiy Mixin

```scss
// E'lon qilish
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// Ishlatish
.hero {
  @include flex-center;
  min-height: 100vh;
}

.modal {
  @include flex-center;
  position: fixed;
  inset: 0;
}
```

### Arguments bilan Mixin

```scss
// Required arguments
@mixin button-variant($bg-color, $text-color) {
  background-color: $bg-color;
  color: $text-color;
  border: 2px solid $bg-color;

  &:hover {
    background-color: darken($bg-color, 10%);
    border-color: darken($bg-color, 10%);
  }
}

.button-primary {
  @include button-variant(#007bff, white);
}

.button-danger {
  @include button-variant(#dc3545, white);
}

// Default values
@mixin button-size($padding: 0.75rem 1.5rem, $font-size: 1rem) {
  padding: $padding;
  font-size: $font-size;
}

.button {
  @include button-size; // Defaults
}

.button-large {
  @include button-size(1rem 2rem, 1.25rem);
}

// Named arguments
.button-small {
  @include button-size($font-size: 0.875rem);
}
```

### Variadic Arguments (...)

```scss
@mixin box-shadow($shadows...) {
  box-shadow: $shadows;
}

.card {
  @include box-shadow(
    0 2px 4px rgba(0,0,0,0.1),
    0 4px 8px rgba(0,0,0,0.1)
  );
}
```

### @content - Block Pass

```scss
@mixin breakpoint($size) {
  @if $size == 'sm' {
    @media (min-width: 640px) { @content; }
  } @else if $size == 'md' {
    @media (min-width: 768px) { @content; }
  } @else if $size == 'lg' {
    @media (min-width: 1024px) { @content; }
  }
}

.element {
  font-size: 1rem;

  @include breakpoint('md') {
    font-size: 1.25rem;
  }

  @include breakpoint('lg') {
    font-size: 1.5rem;
  }
}

// Compiled:
// .element { font-size: 1rem; }
// @media (min-width: 768px) { .element { font-size: 1.25rem; } }
// @media (min-width: 1024px) { .element { font-size: 1.5rem; } }
```

### Common Mixins Collection

```scss
// Truncate text
@mixin truncate($lines: 1) {
  @if $lines == 1 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// Aspect ratio
@mixin aspect-ratio($width, $height) {
  aspect-ratio: #{$width} / #{$height};

  // Fallback for older browsers
  @supports not (aspect-ratio: 1) {
    &::before {
      content: '';
      float: left;
      padding-top: calc(#{$height} / #{$width} * 100%);
    }
    &::after {
      content: '';
      display: block;
      clear: both;
    }
  }
}

// Visually hidden (accessibility)
@mixin visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Focus ring
@mixin focus-ring($color: #007bff, $offset: 2px) {
  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid $color;
    outline-offset: $offset;
  }
}

// Smooth scroll container
@mixin smooth-scroll {
  scroll-behavior: smooth;

  @media (prefers-reduced-motion: reduce) {
    scroll-behavior: auto;
  }
}
```

---

## Functions

### Built-in Functions

```scss
// Color functions
$color: #007bff;

.element {
  background: $color;
  border-color: darken($color, 10%);   // 10% qorong'iroq
  color: lighten($color, 20%);         // 20% ochroq
  box-shadow: 0 2px 4px rgba($color, 0.2); // Alpha qo'shish

  // Adjust
  &:hover {
    background: adjust-hue($color, 15deg);   // Hue o'zgartirish
    background: saturate($color, 20%);       // Saturate
    background: desaturate($color, 20%);     // Desaturate
  }

  // Mix
  background: mix($color, white, 50%);       // 50% aralashma
  background: complement($color);            // Komplementar rang

  // Grayscale
  background: grayscale($color);
}

// String functions
$name: 'button';
.#{$name}-primary { }  // .button-primary

$str: 'Hello World';
$length: str-length($str);        // 11
$upper: to-upper-case($str);      // HELLO WORLD
$lower: to-lower-case($str);      // hello world
$slice: str-slice($str, 1, 5);    // Hello

// Number functions
$value: 15.7px;
$rounded: round($value);    // 16px
$ceil: ceil($value);        // 16px
$floor: floor($value);      // 15px
$abs: abs(-10);             // 10
$min: min(10px, 20px);      // 10px
$max: max(10px, 20px);      // 20px
$percentage: percentage(0.5); // 50%

// List functions
$list: 1rem, 2rem, 3rem;
$length: length($list);         // 3
$first: nth($list, 1);          // 1rem
$last: nth($list, -1);          // 3rem
$appended: append($list, 4rem); // 1rem, 2rem, 3rem, 4rem
$index: index($list, 2rem);     // 2
```

### Custom Functions

```scss
// rem to px converter
@function rem-to-px($rem, $base: 16px) {
  @return $rem / 1rem * $base;
}

// px to rem converter
@function px-to-rem($px, $base: 16px) {
  @return $px / $base * 1rem;
}

.element {
  font-size: px-to-rem(20px);    // 1.25rem
  padding: px-to-rem(16px);      // 1rem
}

// Spacing scale generator
@function spacing($multiplier) {
  $base: 0.25rem; // 4px
  @return $base * $multiplier;
}

.element {
  padding: spacing(4);           // 1rem
  margin-bottom: spacing(6);     // 1.5rem
}

// Z-index manager
$z-layers: (
  'modal': 1000,
  'dropdown': 100,
  'header': 50,
  'default': 1
);

@function z($layer) {
  @if map-has-key($z-layers, $layer) {
    @return map-get($z-layers, $layer);
  }
  @warn "Unknown z-index layer: #{$layer}";
  @return 1;
}

.modal {
  z-index: z('modal');     // 1000
}

.header {
  z-index: z('header');    // 50
}

// Color contrast checker
@function contrast-color($bg-color) {
  $brightness: (red($bg-color) * 299 + green($bg-color) * 587 + blue($bg-color) * 114) / 1000;

  @if $brightness > 128 {
    @return #000000;
  } @else {
    @return #ffffff;
  }
}

@each $name, $color in $colors {
  .bg-#{$name} {
    background-color: $color;
    color: contrast-color($color);
  }
}
```

---

## Extend va Inheritance

### @extend

```scss
// Base style
%button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

// Extend
.button-primary {
  @extend %button-base;
  background: #007bff;
  color: white;

  &:hover {
    background: #0069d9;
  }
}

.button-secondary {
  @extend %button-base;
  background: #6c757d;
  color: white;
}

// Compiled:
// .button-primary, .button-secondary {
//   display: inline-flex;
//   ...
// }
// .button-primary { background: #007bff; ... }
// .button-secondary { background: #6c757d; ... }
```

### Placeholder Selectors (%)

```scss
// Placeholder - faqat extend uchun, compile qilinmaydi
%flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// Ishlatish
.hero {
  @extend %flex-center;
  min-height: 100vh;
}

.modal-overlay {
  @extend %flex-center;
  position: fixed;
  inset: 0;
}

// %flex-center o'zi compile qilinmaydi
// Faqat ishlatilgan joyda qo'shiladi
```

### @extend vs @mixin

| Aspekt | @extend | @mixin |
|--------|---------|--------|
| Output | Selectors gruppalanadi | Duplicate code |
| Arguments | Yo'q | Bor |
| Dynamic | Yo'q | Ha |
| Media queries | Muammo bo'lishi mumkin | Ishlaydi |
| Use case | Simple shared styles | Complex, configurable |

```scss
// @extend - static, shared styles
%card-shadow {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card { @extend %card-shadow; }
.dropdown { @extend %card-shadow; }

// @mixin - dynamic, configurable
@mixin shadow($level: 1) {
  @if $level == 1 {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  } @else if $level == 2 {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  } @else if $level == 3 {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
}

.card { @include shadow(1); }
.modal { @include shadow(3); }
```

---

## Operators

### Matematik Operators

```scss
$base-spacing: 1rem;

.element {
  padding: $base-spacing * 2;        // 2rem
  margin: $base-spacing / 2;         // 0.5rem (deprecated, use math.div)
  width: 100% - 20px;                // Ishlamaydi! Turli units
  width: calc(100% - 20px);          // To'g'ri

  // math module (modern)
  @use 'sass:math';
  margin: math.div($base-spacing, 2); // 0.5rem
}

// Unit manipulation
$value: 16px;
$unitless: math.div($value, 1px);    // 16
$with-unit: $unitless * 1rem;         // 16rem
```

### Comparison Operators

```scss
$width: 100px;

@if $width > 50px {
  // True
}

@if $width >= 100px {
  // True
}

@if $width < 200px {
  // True
}

@if $width == 100px {
  // True
}

@if $width != 50px {
  // True
}
```

### Logical Operators

```scss
$dark-mode: true;
$high-contrast: false;

@if $dark-mode and $high-contrast {
  // Both true
}

@if $dark-mode or $high-contrast {
  // At least one true
}

@if not $high-contrast {
  // True
}
```

### String Operators

```scss
$prefix: 'btn';
$modifier: 'primary';

.#{$prefix}-#{$modifier} {
  // .btn-primary
}

$class: $prefix + '-' + $modifier;
// 'btn-primary'
```

---

## Control Directives

### @if / @else

```scss
@mixin button-variant($type) {
  @if $type == 'primary' {
    background: #007bff;
    color: white;
  } @else if $type == 'secondary' {
    background: #6c757d;
    color: white;
  } @else if $type == 'outline' {
    background: transparent;
    border: 2px solid #007bff;
    color: #007bff;
  } @else {
    background: #e9ecef;
    color: #333;
  }
}

.btn-primary {
  @include button-variant('primary');
}

.btn-outline {
  @include button-variant('outline');
}
```

### @for Loop

```scss
// through - oxirgi qiymat HAM kiradi
@for $i from 1 through 5 {
  .mt-#{$i} {
    margin-top: $i * 0.25rem;
  }
}
// .mt-1, .mt-2, .mt-3, .mt-4, .mt-5

// to - oxirgi qiymat KIRMAYDI
@for $i from 0 to 5 {
  .p-#{$i} {
    padding: $i * 0.25rem;
  }
}
// .p-0, .p-1, .p-2, .p-3, .p-4
```

### @each Loop

```scss
// Simple list
$sizes: sm, md, lg, xl;

@each $size in $sizes {
  .text-#{$size} {
    @if $size == sm { font-size: 0.875rem; }
    @else if $size == md { font-size: 1rem; }
    @else if $size == lg { font-size: 1.25rem; }
    @else if $size == xl { font-size: 1.5rem; }
  }
}

// Map
$colors: (
  'primary': #007bff,
  'secondary': #6c757d,
  'success': #28a745,
  'danger': #dc3545
);

@each $name, $color in $colors {
  .bg-#{$name} {
    background-color: $color;
  }

  .text-#{$name} {
    color: $color;
  }

  .border-#{$name} {
    border-color: $color;
  }
}

// Multiple values
$icons: (
  'home': '\e900',
  'user': '\e901',
  'settings': '\e902'
);

@each $name, $code in $icons {
  .icon-#{$name}::before {
    content: $code;
  }
}
```

### @while Loop

```scss
$i: 1;

@while $i <= 5 {
  .col-#{$i} {
    width: 100% / 12 * $i;
  }
  $i: $i + 1;
}
```

---

## Real-world Architecture

### 7-1 Pattern

```
sass/
├── abstracts/
│   ├── _variables.scss
│   ├── _functions.scss
│   ├── _mixins.scss
│   └── _index.scss
├── base/
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _index.scss
├── components/
│   ├── _button.scss
│   ├── _card.scss
│   ├── _form.scss
│   └── _index.scss
├── layout/
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _sidebar.scss
│   ├── _grid.scss
│   └── _index.scss
├── pages/
│   ├── _home.scss
│   ├── _about.scss
│   └── _index.scss
├── themes/
│   ├── _light.scss
│   ├── _dark.scss
│   └── _index.scss
├── vendors/
│   ├── _normalize.scss
│   └── _index.scss
└── main.scss
```

### main.scss

```scss
// Abstracts (no output)
@use 'abstracts';

// Vendors
@use 'vendors';

// Base
@use 'base';

// Layout
@use 'layout';

// Components
@use 'components';

// Pages
@use 'pages';

// Themes
@use 'themes';
```

### Design Tokens

```scss
// abstracts/_tokens.scss

// Spacing scale
$spacing: (
  0: 0,
  1: 0.25rem,   // 4px
  2: 0.5rem,    // 8px
  3: 0.75rem,   // 12px
  4: 1rem,      // 16px
  5: 1.25rem,   // 20px
  6: 1.5rem,    // 24px
  8: 2rem,      // 32px
  10: 2.5rem,   // 40px
  12: 3rem,     // 48px
  16: 4rem,     // 64px
  20: 5rem,     // 80px
  24: 6rem      // 96px
);

// Typography scale
$font-sizes: (
  xs: 0.75rem,    // 12px
  sm: 0.875rem,   // 14px
  base: 1rem,     // 16px
  lg: 1.125rem,   // 18px
  xl: 1.25rem,    // 20px
  2xl: 1.5rem,    // 24px
  3xl: 1.875rem,  // 30px
  4xl: 2.25rem,   // 36px
  5xl: 3rem       // 48px
);

// Border radius
$radii: (
  none: 0,
  sm: 0.125rem,
  base: 0.25rem,
  md: 0.375rem,
  lg: 0.5rem,
  xl: 0.75rem,
  2xl: 1rem,
  full: 9999px
);

// Shadows
$shadows: (
  sm: (0 1px 2px 0 rgba(0, 0, 0, 0.05)),
  base: (0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)),
  md: (0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)),
  lg: (0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)),
  xl: (0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1))
);
```

### Utility Generator

```scss
// Generate spacing utilities
@each $prop, $abbrev in (margin: m, padding: p) {
  @each $size, $value in $spacing {
    .#{$abbrev}-#{$size} {
      #{$prop}: $value;
    }

    .#{$abbrev}t-#{$size} {
      #{$prop}-top: $value;
    }

    .#{$abbrev}r-#{$size} {
      #{$prop}-right: $value;
    }

    .#{$abbrev}b-#{$size} {
      #{$prop}-bottom: $value;
    }

    .#{$abbrev}l-#{$size} {
      #{$prop}-left: $value;
    }

    .#{$abbrev}x-#{$size} {
      #{$prop}-left: $value;
      #{$prop}-right: $value;
    }

    .#{$abbrev}y-#{$size} {
      #{$prop}-top: $value;
      #{$prop}-bottom: $value;
    }
  }
}
```

---

## Interview savollari

### 1. SCSS va CSS Variables farqi nima?

**Javob:**

| Aspekt | SCSS Variables | CSS Custom Properties |
|--------|---------------|----------------------|
| Compile time | Ha | Yo'q (runtime) |
| Scope | Static | Cascading |
| Change runtime | Yo'q | Ha (JavaScript) |
| Calculations | Sass functions | Limited |
| Browser | Compile kerak | Native |
| Theming | Compile vaqtida | Runtime |

```scss
// SCSS - compile time
$color: blue;
.element { color: $color; }

// CSS - runtime
:root { --color: blue; }
.element { color: var(--color); }
// JavaScript: document.documentElement.style.setProperty('--color', 'red');
```

**Best practice:** Ikkalasini birga ishlatish:
```scss
$primary: #007bff;
:root {
  --color-primary: #{$primary};
}
.button {
  background: var(--color-primary);
}
```

### 2. @mixin va @extend farqi? Qachon qaysi birini ishlatish?

**Javob:**

```scss
// @mixin - duplicate code, arguments bor
@mixin button($bg) {
  padding: 1rem;
  background: $bg;
}
.btn-a { @include button(blue); }
.btn-b { @include button(red); }
// Output: .btn-a { padding: 1rem; background: blue; }
//         .btn-b { padding: 1rem; background: red; }

// @extend - group selectors, arguments yo'q
%btn-base { padding: 1rem; }
.btn-a { @extend %btn-base; background: blue; }
.btn-b { @extend %btn-base; background: red; }
// Output: .btn-a, .btn-b { padding: 1rem; }
//         .btn-a { background: blue; }
//         .btn-b { background: red; }
```

**Qachon @mixin:** Arguments kerak, dynamic styles.
**Qachon @extend:** Simple shared base styles, smaller output.

### 3. @use va @import farqi?

**Javob:**

```scss
// @import (deprecated)
@import 'variables';
// Global scope, multiple imports, no namespacing

// @use (modern)
@use 'variables';
// Namespaced, single import, better for modules
```

| Aspekt | @import | @use |
|--------|---------|------|
| Scope | Global | Namespaced |
| Multiple imports | Ha (duplicate) | Yo'q (cached) |
| Private members | Yo'q | Ha (_prefix) |
| Configuration | Yo'q | Ha (with) |

### 4. SCSS da nesting depth nechta bo'lishi kerak?

**Javob:**

**Tavsiya: Maksimum 3 level.**

```scss
// YOMON - 5+ level
.page {
  .container {
    .row {
      .col {
        .card {
          .title { } // Specificity: .page .container .row .col .card .title
        }
      }
    }
  }
}

// YAXSHI - BEM, flat
.card { }
.card__title { }
.card--featured { }
.card--featured .card__title { } // Max 2 level
```

### 5. Sass da color functions qanday ishlaydi?

**Javob:**

```scss
$color: #007bff;

// Lighten/Darken
lighten($color, 20%);  // Ochroq
darken($color, 20%);   // To'qroq

// Saturate/Desaturate
saturate($color, 20%);
desaturate($color, 20%);

// Mix
mix($color, white, 50%);    // 50% oq bilan
mix($color, black, 20%);    // 20% qora bilan

// Adjust
adjust-hue($color, 180deg); // Komplementar
complement($color);         // Opposite

// Alpha
rgba($color, 0.5);          // 50% transparent
transparentize($color, 0.3); // 30% transparent

// Color components
red($color);                // Red value
green($color);
blue($color);
hue($color);
saturation($color);
lightness($color);
```

---

## Best Practices

### 1. Variable naming convention

```scss
// YOMON
$blue: #007bff;
$padding: 1rem;

// YAXSHI - semantic naming
$color-primary: #007bff;
$color-secondary: #6c757d;
$spacing-4: 1rem;
$font-size-base: 1rem;
```

### 2. BEM bilan nesting

```scss
// BEM + SCSS
.card {
  &__header { }
  &__body { }
  &__footer { }

  &--featured {
    .card__header { }
  }
}
```

### 3. Mixins vs Extends vs Functions

```scss
// Function - value qaytaradi
@function spacing($n) { @return $n * 0.25rem; }
padding: spacing(4); // 1rem

// Mixin - style block
@mixin flex-center { display: flex; ... }
@include flex-center;

// Extend - shared base
%button-base { padding: 1rem; }
@extend %button-base;
```

### 4. @use bilan namespace

```scss
@use 'variables' as vars;
@use 'mixins' as mix;

.element {
  color: vars.$primary;
  @include mix.flex-center;
}
```

### 5. Avoid !global

```scss
// YOMON
.element {
  $color: red !global;
}

// YAXSHI
// Global variables top-level da e'lon qilish
$color: red;
```

### 6. File structure maintain

```scss
// Har component o'z faylida
// components/_button.scss
// components/_card.scss

// Index files for forwarding
// components/_index.scss
@forward 'button';
@forward 'card';
```

---

## Xulosa

| SCSS Xususiyati | Sintaksisi | Qachon ishlatiladi? |
|-----------------|------------|---------------------|
| **Variables** | `$color: red;` | Ranglar, shriftlar, padding'lar kabi qayta-qayta ishlatiladigan qiymatlarni saqlashda |
| **Nesting** | `.parent { .child {} }` | HTML strukturasiga mos ravishda CSS yozishda, klasslarni qayta yozishdan qochish uchun |
| **Partials / Use** | `@use 'mixins';` | Kodni bir necha fayllarga bo'lish (`_header.scss`) va ularni bitta joyga yig'ish uchun |
| **Mixins** | `@mixin flex-center { ... }` | Argumentlar qabul qiladigan takroriy kod bloklarini yozishda (masalan, turli vendor prefixlar uchun) |
| **Functions** | `@function rem($px) { ... }` | Hisob-kitob qilib bitta qiymat qaytarish kerak bo'lganda (px ni rem ga o'tkazish, rangni to'qlashtirish) |
| **Extend** | `@extend .btn;` | Bir nechta element aynan bir xil stillarni ulashishini xohlaganda (kamroq CSS generatsiya qiladi) |

---

## Keyingi mavzu

CSS Architecture: [05-css-architecture.md](./05-css-architecture.md)
