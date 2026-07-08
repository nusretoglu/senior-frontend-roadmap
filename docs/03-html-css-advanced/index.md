# Advanced HTML + CSS

Zamonaviy web development uchun ilg'or HTML va CSS texnikalar.

## Bo'lim tarkibi

| # | Mavzu | Tavsif | Daraja |
|---|-------|--------|--------|
| 01 | [Flexbox](./01-flexbox.md) | Bir o'lchovli layout tizimi | Must Have |
| 02 | [CSS Grid](./02-grid.md) | Ikki o'lchovli layout tizimi | Must Have |
| 03 | [Responsive Layouts](./03-responsive-layouts.md) | Adaptiv dizayn va media queries | Must Have |
| 04 | [SCSS/Sass](./04-scss.md) | CSS preprocessor va metodologiya | Important |
| 05 | [CSS Architecture](./05-css-architecture.md) | BEM, OOCSS, Atomic CSS | Important |
| 06 | [Animations](./06-animations.md) | Transitions, keyframes, performance | Important |
| 07 | [Accessibility](./07-accessibility.md) | WCAG, ARIA, screen readers | Must Have |

---

## Nima uchun bu mavzular muhim?

### 1. Layout Mastery (Flexbox + Grid)
```
Oddiy developer: margin, padding, position bilan kurashadi
Senior developer: Flexbox va Grid bilan 5 daqiqada hal qiladi
```

Flexbox va Grid - zamonaviy CSS ning asosi. Float va clearfix davri tugadi.

### 2. Responsive Design
```
2024 statistika:
- Mobile traffic: 60%+
- Tablet traffic: 10%
- Desktop traffic: 30%

Mobile-first approach = zamonaviy standart
```

### 3. CSS Architecture
Katta loyihalarda CSS tezda boshqarib bo'lmaydigan holatga keladi:
- 10,000+ qator CSS
- Specificity wars
- !important overuse
- Dead code

Yechim: BEM, OOCSS, yoki Atomic CSS metodologiyasi.

### 4. Performance
CSS animations GPU accelerated bo'lishi kerak:
```css
/* Sekin - har frame'da layout hisoblaydi */
.bad {
  animation: move 1s;
}
@keyframes move {
  to { left: 100px; }
}

/* Tez - GPU ishlatadi */
.good {
  animation: move 1s;
}
@keyframes move {
  to { transform: translateX(100px); }
}
```

### 5. Accessibility
- 15% odamlar nogironlikka ega
- SEO uchun muhim
- Legal requirement (ADA, WCAG)

---

## Real-world Challenges

Bu bo'limda quyidagi muammolarni hal qilishni o'rganasiz:

### Challenge 1: Complex Layouts
```
Masala: Dashboard layout - sidebar, header, main content, footer
Muammo: Turli screen sizes'da ishlashi kerak
Yechim: CSS Grid + Flexbox kombinatsiyasi
```

### Challenge 2: Dark Mode
```
Masala: Light/dark theme support
Muammo: 50+ rang, component-level va global
Yechim: CSS Custom Properties + prefers-color-scheme
```

### Challenge 3: Retina Displays
```
Masala: Rasmlar blurred ko'rinadi
Muammo: 1x, 2x, 3x pixel density
Yechim: srcset, image-set(), vector graphics
```

### Challenge 4: Animation Performance
```
Masala: 60fps animations
Muammo: Jank va stuttering
Yechim: transform + opacity only, will-change
```

---

## O'rganish tartibi

```
Hafta 1:
├── Flexbox (1-2 kun)
│   ├── Container properties
│   ├── Item properties
│   └── Common patterns
├── Grid (2-3 kun)
│   ├── Grid template
│   ├── Grid areas
│   └── Subgrid
└── Responsive (1-2 kun)
    ├── Media queries
    ├── Container queries
    └── Mobile-first

Hafta 2:
├── SCSS (1-2 kun)
│   ├── Variables, nesting
│   ├── Mixins, functions
│   └── Module system
├── Architecture (1 kun)
│   ├── BEM naming
│   ├── File structure
│   └── Design tokens
├── Animations (1-2 kun)
│   ├── Transitions
│   ├── Keyframes
│   └── Performance
└── Accessibility (1 kun)
    ├── Semantic HTML
    ├── ARIA
    └── Testing
```

---

## Amaliy mashqlar

Har bo'limda quyidagi mashqlar mavjud:

1. **Code Examples** - To'g'ri va noto'g'ri yondashuvlar
2. **Real Components** - Button, Card, Modal, Navigation
3. **Full Layouts** - Dashboard, Landing page, E-commerce
4. **Debugging** - DevTools bilan ishlash

---

## Interview Preparation

Bu bo'limdagi interview savollari:
- Flexbox vs Grid - qachon qaysi birini ishlatish?
- CSS specificity qanday ishlaydi?
- BEM nima va nima uchun kerak?
- Qanday qilib 60fps animation qilish mumkin?
- WCAG AA va AAA farqi nima?

---

## Foydali resurslar

### Documentation
- [MDN CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS Tricks](https://css-tricks.com/)
- [Web.dev CSS](https://web.dev/learn/css/)

### Tools
- [Flexbox Froggy](https://flexboxfroggy.com/) - Flexbox o'yin
- [Grid Garden](https://cssgridgarden.com/) - Grid o'yin
- [Can I Use](https://caniuse.com/) - Browser support

### Design Systems
- [Tailwind CSS](https://tailwindcss.com/)
- [Open Props](https://open-props.style/)
- [Radix Colors](https://www.radix-ui.com/colors)

---

## Keyingi qadam

Flexbox bilan boshlang: [01-flexbox.md](./01-flexbox.md)
