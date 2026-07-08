# Web Accessibility (a11y) - Barcha Foydalanuvchilar Uchun

Web accessibility - barcha odamlar, jumladan nogironligi bo'lgan kishilar ham web sahifalardan foydalana olishi.

## Mundarija

1. [Accessibility asoslari](#accessibility-asoslari)
2. [WCAG Standards](#wcag-standards)
3. [Semantic HTML](#semantic-html)
4. [ARIA - Accessible Rich Internet Applications](#aria---accessible-rich-internet-applications)
5. [Keyboard Navigation](#keyboard-navigation)
6. [Color va Contrast](#color-va-contrast)
7. [Forms va Inputs](#forms-va-inputs)
8. [Images va Media](#images-va-media)
9. [Screen Readers](#screen-readers)
10. [Testing Tools](#testing-tools)
11. [Interview savollari](#interview-savollari)
12. [Best Practices Checklist](#best-practices-checklist)

---

## Accessibility asoslari

### Nima uchun Accessibility muhim?

```
1. Ethical - Barcha odamlar teng huquqli
2. Legal - ADA, WCAG qonuniy talab (EU, USA)
3. Business - 15%+ foydalanuvchilar nogironlik bilan
4. SEO - Screen readers = Search engines
5. Usability - Accessibility = yaxshi UX hammaga
```

### Nogironlik turlari

```
Ko'rish:
- To'liq ko'rmaslik
- Kam ko'rish
- Rang ko'rmaslik (color blindness)

Eshitish:
- To'liq eshitmaslik
- Kam eshitish

Motor (Harakatlanish):
- Qo'l titroq (tremor)
- Paraliz
- Temporary injuries

Cognitive:
- Dyslexia
- ADHD
- Memory issues
- Learning disabilities

Temporal:
- Quyosh nuri (screen glare)
- Bir qo'l band
- Shovqinli muhit
```

### Accessibility Tree

```
DOM Tree → Accessibility Tree → Assistive Technology

<button class="btn" aria-label="Close">×</button>

DOM: HTMLButtonElement
A11y Tree:
  Role: button
  Name: "Close"
  State: focusable
```

---

## WCAG Standards

### WCAG 2.1 Levels

```
Level A   - Minimum (must have)
Level AA  - Standard (industry standard)
Level AAA - Enhanced (ideal, hard to achieve fully)
```

### POUR Principles

```
P - Perceivable   (Ko'rish/eshitish mumkin)
O - Operable      (Ishlatish mumkin)
U - Understandable (Tushunish mumkin)
R - Robust        (Barcha texnologiyalar bilan ishlaydi)
```

### Key Success Criteria

```
1.1.1 Non-text Content (A)
  - Rasmlar alt text bo'lishi kerak

1.3.1 Info and Relationships (A)
  - Semantic HTML ishlatish

1.4.3 Contrast (AA)
  - Text: 4.5:1 ratio
  - Large text: 3:1 ratio

1.4.11 Non-text Contrast (AA)
  - UI elements: 3:1 ratio

2.1.1 Keyboard (A)
  - Barcha funksiyalar keyboard bilan

2.4.1 Bypass Blocks (A)
  - Skip to main content link

2.4.4 Link Purpose (A)
  - Link matni ma'noli bo'lishi kerak

2.4.7 Focus Visible (AA)
  - Focus indicator ko'rinishi kerak

3.1.1 Language of Page (A)
  - lang attribute

3.3.2 Labels or Instructions (A)
  - Form labels
```

---

## Semantic HTML

### Semantic vs Non-semantic

```html
<!-- NON-SEMANTIC - Screen reader tushunmaydi -->
<div class="header">
  <div class="nav">
    <div class="nav-item">Home</div>
  </div>
</div>
<div class="main">
  <div class="article">
    <div class="title">Article Title</div>
  </div>
</div>

<!-- SEMANTIC - Screen reader tushunadi -->
<header>
  <nav>
    <a href="/">Home</a>
  </nav>
</header>
<main>
  <article>
    <h1>Article Title</h1>
  </article>
</main>
```

### Landmark Elements

```html
<header>      <!-- Banner landmark -->
<nav>         <!-- Navigation landmark -->
<main>        <!-- Main landmark (unique) -->
<aside>       <!-- Complementary landmark -->
<footer>      <!-- Content info landmark -->
<section>     <!-- Region (with aria-label) -->
<article>     <!-- Article -->
<form>        <!-- Form landmark -->
```

### Heading Hierarchy

```html
<!-- YOMON - Skip levels, multiple h1 -->
<h1>Page Title</h1>
<h3>Section</h3>  <!-- h2 skip! -->
<h1>Another h1</h1>  <!-- Multiple h1! -->

<!-- YAXSHI - Proper hierarchy -->
<h1>Page Title</h1>           <!-- 1 ta page da -->
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
    <h3>Subsection 1.2</h3>
  <h2>Section 2</h2>
    <h3>Subsection 2.1</h3>
```

### Interactive Elements

```html
<!-- Buttons - actions -->
<button type="button">Click me</button>
<button type="submit">Submit form</button>

<!-- Links - navigation -->
<a href="/page">Go to page</a>
<a href="#section">Jump to section</a>

<!-- YOMON - Div as button -->
<div onclick="handleClick()">Click me</div>

<!-- Agar div kerak bo'lsa (rare case) -->
<div
  role="button"
  tabindex="0"
  onclick="handleClick()"
  onkeydown="if(event.key==='Enter')handleClick()"
>
  Click me
</div>
```

### Lists

```html
<!-- Navigation -->
<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>

<!-- Definition list -->
<dl>
  <dt>Term</dt>
  <dd>Definition</dd>
</dl>

<!-- Ordered list -->
<ol>
  <li>First step</li>
  <li>Second step</li>
</ol>
```

### Tables

```html
<table>
  <caption>Monthly Sales Report</caption>
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Sales</th>
      <th scope="col">Revenue</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">January</th>
      <td>150</td>
      <td>$15,000</td>
    </tr>
    <tr>
      <th scope="row">February</th>
      <td>200</td>
      <td>$20,000</td>
    </tr>
  </tbody>
</table>
```

---

## ARIA - Accessible Rich Internet Applications

### ARIA Rules

```
1. Semantic HTML birinchi - ARIA kerak emas bo'lsa ishlatmang
2. Native semantics o'zgartirmang
3. Interactive elements keyboard accessible
4. Focusable elements role bo'lishi kerak
5. Visible labels ishlatish
```

### ARIA Roles

```html
<!-- Landmark roles -->
<div role="banner">Header</div>
<div role="navigation">Nav</div>
<div role="main">Content</div>
<div role="complementary">Sidebar</div>
<div role="contentinfo">Footer</div>

<!-- Widget roles -->
<div role="button">Button</div>
<div role="link">Link</div>
<div role="checkbox">Checkbox</div>
<div role="dialog">Modal</div>
<div role="alert">Alert message</div>
<div role="alertdialog">Alert dialog</div>
<div role="progressbar">Progress</div>
<div role="tablist">Tab container</div>
<div role="tab">Tab</div>
<div role="tabpanel">Tab content</div>

<!-- Live region roles -->
<div role="status">Status updates</div>
<div role="log">Log messages</div>
<div role="alert">Important alerts</div>
```

### ARIA States va Properties

```html
<!-- States -->
<button aria-pressed="true">Toggle</button>
<input aria-invalid="true">
<div aria-expanded="false">Collapsible</div>
<button aria-disabled="true">Disabled</button>
<li aria-selected="true">Selected item</li>
<div aria-hidden="true">Hidden from AT</div>
<input aria-checked="mixed"> <!-- Indeterminate -->

<!-- Properties -->
<input aria-label="Search"> <!-- Accessible name -->
<input aria-labelledby="label-id"> <!-- Reference to label -->
<input aria-describedby="hint-id"> <!-- Reference to description -->
<div aria-live="polite"> <!-- Live region -->
<div aria-atomic="true"> <!-- Announce whole region -->
<input aria-required="true">
<div aria-haspopup="true">
<button aria-controls="panel-id">
```

### ARIA Examples

```html
<!-- Custom checkbox -->
<div
  role="checkbox"
  aria-checked="false"
  tabindex="0"
  class="custom-checkbox"
>
  Accept terms
</div>

<!-- Expandable section -->
<button
  aria-expanded="false"
  aria-controls="section-content"
>
  Section title
</button>
<div id="section-content" hidden>
  Section content
</div>

<!-- Modal dialog -->
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-desc"
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-desc">Are you sure?</p>
  <button>Confirm</button>
  <button>Cancel</button>
</div>

<!-- Tab interface -->
<div role="tablist" aria-label="Sample Tabs">
  <button
    role="tab"
    aria-selected="true"
    aria-controls="panel-1"
    id="tab-1"
  >
    Tab 1
  </button>
  <button
    role="tab"
    aria-selected="false"
    aria-controls="panel-2"
    id="tab-2"
    tabindex="-1"
  >
    Tab 2
  </button>
</div>
<div
  role="tabpanel"
  id="panel-1"
  aria-labelledby="tab-1"
>
  Panel 1 content
</div>
<div
  role="tabpanel"
  id="panel-2"
  aria-labelledby="tab-2"
  hidden
>
  Panel 2 content
</div>

<!-- Live region -->
<div aria-live="polite" aria-atomic="true">
  <!-- Dynamic content here will be announced -->
</div>

<!-- Alert -->
<div role="alert">
  Form submitted successfully!
</div>
```

### aria-label vs aria-labelledby vs aria-describedby

```html
<!-- aria-label: Inline label -->
<button aria-label="Close dialog">×</button>

<!-- aria-labelledby: Reference visible label -->
<h2 id="dialog-title">Settings</h2>
<div role="dialog" aria-labelledby="dialog-title">
  ...
</div>

<!-- aria-describedby: Additional description -->
<label for="password">Password</label>
<input
  id="password"
  type="password"
  aria-describedby="password-hint"
>
<p id="password-hint">
  Must be at least 8 characters
</p>

<!-- Combined -->
<input
  aria-label="Search"
  aria-describedby="search-help"
>
<p id="search-help">
  Type to search products
</p>
```

---

## Keyboard Navigation

### Focus Management

```css
/* Default focus - never remove without replacement! */
:focus {
  outline: 2px solid blue;
  outline-offset: 2px;
}

/* Focus-visible - keyboard only */
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Custom focus styles */
.button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5);
}
```

### Tab Order

```html
<!-- Natural tab order (DOM order) -->
<button>First</button>
<button>Second</button>
<button>Third</button>

<!-- tabindex="0" - natural order, focusable -->
<div tabindex="0" role="button">Custom button</div>

<!-- tabindex="-1" - programmatically focusable only -->
<div tabindex="-1" id="error-message">Error!</div>
<script>
  document.getElementById('error-message').focus();
</script>

<!-- tabindex > 0 - AVOID! Breaks natural order -->
<button tabindex="3">Third</button>
<button tabindex="1">First</button>
<button tabindex="2">Second</button>
```

### Skip Links

```html
<body>
  <!-- First element, visually hidden until focused -->
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>

  <header>...</header>
  <nav>...</nav>

  <main id="main-content" tabindex="-1">
    ...
  </main>
</body>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #007bff;
  color: white;
  padding: 8px 16px;
  z-index: 100;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
}
```

### Keyboard Interactions

```javascript
// Modal keyboard trap
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }

    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

// Restore focus on modal close
let previouslyFocused;

function openModal() {
  previouslyFocused = document.activeElement;
  modal.showModal();
  modal.querySelector('button').focus();
}

function closeModal() {
  modal.close();
  previouslyFocused?.focus();
}
```

### Common Keyboard Patterns

```
Button/Link: Enter, Space
Checkbox: Space
Radio: Arrow keys
Select: Arrow keys, Enter
Tab list: Arrow keys
Menu: Arrow keys, Enter, Escape
Modal: Tab trap, Escape to close
```

---

## Color va Contrast

### Contrast Requirements

```
WCAG AA:
- Normal text: 4.5:1
- Large text (18pt/24px or 14pt/18.66px bold): 3:1
- UI components: 3:1
- Focus indicator: 3:1

WCAG AAA:
- Normal text: 7:1
- Large text: 4.5:1
```

### Color Contrast Examples

```css
/* FAIL - 2.5:1 ratio */
.low-contrast {
  color: #767676;
  background: #ffffff;
}

/* PASS - 4.6:1 ratio */
.good-contrast {
  color: #595959;
  background: #ffffff;
}

/* PASS - 7:1 ratio (AAA) */
.high-contrast {
  color: #333333;
  background: #ffffff;
}
```

### Don't Rely on Color Alone

```html
<!-- YOMON - Faqat rang bilan farqlash -->
<span style="color: red">Error</span>
<span style="color: green">Success</span>

<!-- YAXSHI - Rang + Icon + Text -->
<span class="error">
  <svg aria-hidden="true"><!-- X icon --></svg>
  Error: Invalid email
</span>
<span class="success">
  <svg aria-hidden="true"><!-- Check icon --></svg>
  Success: Form submitted
</span>
```

### Color Blindness Considerations

```css
/* Deuteranopia/Protanopia friendly palette */
:root {
  --color-error: #d32f2f;    /* Red */
  --color-warning: #f57c00;  /* Orange */
  --color-success: #1976d2;  /* Blue instead of green */
  --color-info: #7b1fa2;     /* Purple */
}

/* Pattern/texture for charts */
.chart-bar-1 {
  background: var(--color-1);
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    rgba(255,255,255,0.5) 5px,
    rgba(255,255,255,0.5) 10px
  );
}
```

### Focus Indicators

```css
/* YOMON - Focus o'chirilgan */
*:focus {
  outline: none;
}

/* YAXSHI - Custom focus with good contrast */
:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Yanada yaxshi - Multiple indicators */
.button:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.25);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :focus-visible {
    outline-color: #60a5fa;
  }
}
```

---

## Forms va Inputs

### Labels

```html
<!-- Explicit label (recommended) -->
<label for="email">Email address</label>
<input type="email" id="email" name="email">

<!-- Implicit label -->
<label>
  Email address
  <input type="email" name="email">
</label>

<!-- YOMON - Label yo'q -->
<input type="email" placeholder="Email">

<!-- aria-label when visual label not possible -->
<input type="search" aria-label="Search products">
```

### Required Fields

```html
<label for="name">
  Name
  <span aria-hidden="true">*</span>
  <span class="visually-hidden">(required)</span>
</label>
<input
  type="text"
  id="name"
  name="name"
  required
  aria-required="true"
>

<p class="form-hint">
  <span aria-hidden="true">*</span> Required fields
</p>
```

### Error Handling

```html
<!-- Form with error -->
<form novalidate>
  <div class="form-group">
    <label for="email">Email</label>
    <input
      type="email"
      id="email"
      name="email"
      aria-invalid="true"
      aria-describedby="email-error"
    >
    <p id="email-error" class="error" role="alert">
      Please enter a valid email address
    </p>
  </div>
</form>
```

```css
.error {
  color: #d32f2f;
}

input[aria-invalid="true"] {
  border-color: #d32f2f;
  box-shadow: 0 0 0 1px #d32f2f;
}
```

### Fieldsets va Legends

```html
<fieldset>
  <legend>Shipping Address</legend>

  <label for="street">Street</label>
  <input type="text" id="street" name="street">

  <label for="city">City</label>
  <input type="text" id="city" name="city">
</fieldset>

<fieldset>
  <legend>Payment Method</legend>

  <label>
    <input type="radio" name="payment" value="card">
    Credit Card
  </label>

  <label>
    <input type="radio" name="payment" value="paypal">
    PayPal
  </label>
</fieldset>
```

### Autocomplete

```html
<input
  type="text"
  name="name"
  autocomplete="name"
>

<input
  type="email"
  name="email"
  autocomplete="email"
>

<input
  type="tel"
  name="phone"
  autocomplete="tel"
>

<input
  type="text"
  name="address"
  autocomplete="street-address"
>
```

---

## Images va Media

### Alt Text

```html
<!-- Informative images - describe content -->
<img src="chart.png" alt="Sales increased 25% in Q3 2024">

<!-- Decorative images - empty alt -->
<img src="decorative-line.png" alt="">
<!-- Or CSS background -->

<!-- Complex images - longer description -->
<figure>
  <img
    src="complex-chart.png"
    alt="Quarterly revenue comparison"
    aria-describedby="chart-desc"
  >
  <figcaption id="chart-desc">
    Bar chart showing Q1: $100k, Q2: $150k, Q3: $125k, Q4: $200k.
    Q4 showed the highest revenue with 33% increase from Q3.
  </figcaption>
</figure>

<!-- Functional images (buttons, links) -->
<a href="/">
  <img src="logo.png" alt="Company Name - Go to homepage">
</a>

<button>
  <img src="print-icon.png" alt="Print this page">
</button>
```

### SVG Accessibility

```html
<!-- Decorative SVG -->
<svg aria-hidden="true" focusable="false">
  <!-- ... -->
</svg>

<!-- Informative SVG -->
<svg role="img" aria-labelledby="svg-title svg-desc">
  <title id="svg-title">Warning</title>
  <desc id="svg-desc">Triangle with exclamation mark</desc>
  <!-- ... -->
</svg>

<!-- Interactive SVG -->
<button>
  <svg aria-hidden="true" focusable="false">
    <!-- ... -->
  </svg>
  <span class="visually-hidden">Close</span>
</button>
```

### Video va Audio

```html
<!-- Video with captions -->
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track
    kind="captions"
    src="captions.vtt"
    srclang="en"
    label="English"
    default
  >
  <track
    kind="descriptions"
    src="descriptions.vtt"
    srclang="en"
    label="Audio descriptions"
  >
</video>

<!-- Audio with transcript -->
<audio controls>
  <source src="podcast.mp3" type="audio/mpeg">
</audio>
<details>
  <summary>Transcript</summary>
  <p>Full transcript of the podcast...</p>
</details>
```

---

## Screen Readers

### Common Screen Readers

```
Desktop:
- NVDA (Windows, free)
- JAWS (Windows, paid)
- VoiceOver (macOS, built-in)
- Narrator (Windows, built-in)
- Orca (Linux, free)

Mobile:
- VoiceOver (iOS)
- TalkBack (Android)
```

### Testing with VoiceOver (macOS)

```
Enable: Cmd + F5

Navigation:
- Next element: VO + Right Arrow
- Previous: VO + Left Arrow
- Interact with group: VO + Shift + Down Arrow
- Stop interact: VO + Shift + Up Arrow
- Rotor: VO + U (landmarks, headings, links)

VO = Control + Option
```

### Screen Reader Announcements

```html
<!-- Live regions -->
<div aria-live="polite">
  <!-- Changes here will be announced -->
</div>

<div aria-live="assertive">
  <!-- Important updates, interrupts -->
</div>

<!-- Status messages -->
<div role="status">
  3 items in cart
</div>

<!-- Alerts -->
<div role="alert">
  Your session will expire in 5 minutes
</div>
```

### Visually Hidden Content

```css
/* Screen reader only content */
.visually-hidden,
.sr-only {
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

/* Focusable visually hidden */
.visually-hidden-focusable:focus,
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

```html
<button>
  <svg aria-hidden="true"><!-- icon --></svg>
  <span class="visually-hidden">Delete item</span>
</button>

<a href="/cart">
  Cart
  <span class="visually-hidden">(3 items)</span>
</a>
```

---

## Testing Tools

### Automated Testing

```bash
# axe-core
npm install -D @axe-core/cli
npx axe https://example.com

# pa11y
npm install -g pa11y
pa11y https://example.com

# Lighthouse
# Chrome DevTools > Lighthouse > Accessibility
```

### Browser Extensions

```
- axe DevTools (Chrome, Firefox)
- WAVE (Chrome, Firefox)
- Accessibility Insights (Chrome, Edge)
- HeadingsMap (Chrome)
- NoCoffee (Chrome) - vision impairment simulation
```

### Manual Testing Checklist

```
1. Keyboard Navigation
   [ ] Tab through all interactive elements
   [ ] Focus visible at all times
   [ ] Logical tab order
   [ ] No keyboard traps
   [ ] Modal focus trap works

2. Screen Reader
   [ ] All content accessible
   [ ] Proper heading structure
   [ ] Links/buttons have names
   [ ] Images have alt text
   [ ] Forms have labels
   [ ] Live regions work

3. Visual
   [ ] Zoom 200% - content readable
   [ ] Color contrast passes
   [ ] Not relying on color alone
   [ ] Focus indicators visible
   [ ] Text resizable

4. Motion
   [ ] prefers-reduced-motion respected
   [ ] Auto-play can be paused
```

### Chrome DevTools Accessibility

```
1. Elements > Accessibility tab
   - Accessibility tree
   - ARIA attributes

2. Lighthouse > Accessibility audit

3. Rendering > Emulate vision deficiencies
   - Blurred vision
   - Color blindness types

4. CSS Overview > Contrast issues
```

---

## Interview savollari

### 1. WCAG nima va uning darajalari qanday?

**Javob:**

WCAG = Web Content Accessibility Guidelines

```
Level A - Minimum
  - Alt text
  - Keyboard accessible
  - No seizure triggers

Level AA - Standard (qonuniy talab)
  - 4.5:1 contrast
  - Resize text 200%
  - Focus visible
  - Error identification

Level AAA - Enhanced
  - 7:1 contrast
  - Sign language
  - Extended descriptions
```

### 2. Semantic HTML nima uchun accessibility uchun muhim?

**Javob:**

```html
<!-- Non-semantic - Screen reader tushunmaydi -->
<div onclick="...">Click</div>

<!-- Semantic - Built-in accessibility -->
<button>Click</button>
```

Semantic HTML:
- Screen readers tushunadi
- Keyboard navigation ishlaydi
- ARIA kerak emas
- SEO yaxshiroq

### 3. aria-label, aria-labelledby, aria-describedby farqi?

**Javob:**

```html
<!-- aria-label: Inline text -->
<button aria-label="Close">×</button>

<!-- aria-labelledby: Reference to element (name) -->
<dialog aria-labelledby="title">
  <h2 id="title">Settings</h2>
</dialog>

<!-- aria-describedby: Additional info -->
<input aria-describedby="hint">
<p id="hint">Must be 8+ characters</p>
```

- `aria-label`: Accessible name (o'zi)
- `aria-labelledby`: Accessible name (reference)
- `aria-describedby`: Description (additional)

### 4. Focus management nima va qachon kerak?

**Javob:**

Focus management - keyboard focus ni programmatically boshqarish.

**Kerak bo'lganda:**
- Modal ochilganda - focus modal ga
- Modal yopilganda - focus qaytarish
- SPA navigation - focus yangi content ga
- Error - focus error message ga

```javascript
// Modal example
const previousFocus = document.activeElement;
modal.showModal();
modal.querySelector('input').focus();

modal.addEventListener('close', () => {
  previousFocus.focus();
});
```

### 5. Color contrast qanday test qilish?

**Javob:**

**Tools:**
- WebAIM Contrast Checker
- Chrome DevTools (Elements > Computed > Contrast)
- axe DevTools

**Requirements:**
- Normal text: 4.5:1 (AA)
- Large text: 3:1 (AA)
- UI components: 3:1

```css
/* PASS: 4.52:1 */
color: #595959;
background: #ffffff;

/* FAIL: 2.45:1 */
color: #999999;
background: #ffffff;
```

---

## Best Practices Checklist

### HTML Structure

```
[ ] Semantic elements (header, nav, main, footer)
[ ] Single h1 per page
[ ] Logical heading hierarchy
[ ] Lists for list content
[ ] Tables with proper headers
[ ] lang attribute on html
```

### Keyboard

```
[ ] All interactive elements focusable
[ ] Visible focus indicator
[ ] Logical tab order
[ ] Skip links
[ ] No keyboard traps
[ ] Escape closes modals
```

### Images

```
[ ] Informative images have alt
[ ] Decorative images have alt=""
[ ] Complex images have long description
[ ] SVGs have role="img" and title
```

### Forms

```
[ ] All inputs have labels
[ ] Required fields marked
[ ] Error messages associated
[ ] Autocomplete where appropriate
[ ] Fieldsets for related inputs
```

### Color & Contrast

```
[ ] 4.5:1 text contrast
[ ] 3:1 large text contrast
[ ] 3:1 UI component contrast
[ ] Not relying on color alone
[ ] Focus indicators visible
```

### ARIA

```
[ ] Semantic HTML first
[ ] ARIA only when necessary
[ ] Valid ARIA usage
[ ] Live regions for dynamic content
[ ] Proper role usage
```

### Media

```
[ ] Videos have captions
[ ] Audio has transcript
[ ] No auto-play audio
[ ] Pause/stop controls
```

### Motion

```
[ ] prefers-reduced-motion respected
[ ] Auto-playing content pausable
[ ] No flashing content (3Hz)
```

### Responsive

```
[ ] Zoom to 200% - still usable
[ ] Reflow at 320px width
[ ] Touch targets 44x44px
[ ] Orientation not locked
```

---

## Foydali Resurslar

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)
- [WebAIM](https://webaim.org/)

---

## Xulosa

Accessibility - bu qo'shimcha feature emas, balki web development ning ajralmas qismi. Yaxshi accessibility = yaxshi UX hamma uchun.

```
"The power of the Web is in its universality.
Access by everyone regardless of disability
is an essential aspect."
— Tim Berners-Lee
```
