# Debounce va Throttle

## Nazariya

### Muammo

Ba'zi hodisalar juda tez-tez sodir bo'ladi (masalan, `scroll`, `resize`, `input`). Har bir hodisada og'ir operatsiya bajarish performance muammolariga olib keladi.

```javascript
// MUAMMO: Har keystroke'da API chaqiruvi
input.addEventListener('input', (e) => {
  fetchSearchResults(e.target.value); // 100 ta harf = 100 ta API call!
});

// MUAMMO: Har scroll'da hisoblash
window.addEventListener('scroll', () => {
  calculateScrollPosition(); // Sekundiga 100+ marta chaqirilishi mumkin
});
```

### Debounce

**Debounce** — funksiyani faqat hodisalar to'xtagandan keyin chaqirish. Agar belgilangan vaqt ichida yangi hodisa sodir bo'lsa, taymer qayta boshlanadi.

```
Hodisalar:  ─●─●─●─●─●────────────●─●─●─────────
Debounce:   ────────────────────●─────────────●─
                        ↑ 300ms                ↑ 300ms
                        keyin                  keyin
```

**Qachon ishlatish:**
- Search input (yozish tugagandan keyin qidirish)
- Form validation (yozish tugagandan keyin tekshirish)
- Window resize (o'zgarish tugagandan keyin layout hisoblash)
- Auto-save (yozish tugagandan keyin saqlash)

### Throttle

**Throttle** — funksiyani belgilangan vaqt oralig'ida maksimum bir marta chaqirish. Hodisalar davom etsa ham, funksiya muntazam ravishda chaqiriladi.

```
Hodisalar:  ─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●──
Throttle:   ─●─────────●─────────●─────────●───
             ↑          ↑          ↑          ↑
             0ms       300ms      600ms      900ms
```

**Qachon ishlatish:**
- Scroll event (scrolling paytida muntazam tekshirish)
- Mouse move (drag paytida pozitsiya yangilash)
- Game loop (doimiy yangilanish)
- API rate limiting (sekundiga X ta so'rov)

### Farq

| Xususiyat | Debounce | Throttle |
|-----------|----------|----------|
| Chaqirish | Hodisalar TO'XTAGANDA | Muntazam INTERVAL |
| Foyda | Ortiqcha chaqiruvlarni YO'Q qilish | Chaqiruvlarni KAMAYTIRISH |
| Misol | Search input | Scroll tracking |

---

## Kod Misollari

### Debounce Implementation

```javascript
function debounce(fn, delay) {
  let timeoutId = null;

  return function(...args) {
    // Oldingi taymerни bekor qilish
    clearTimeout(timeoutId);

    // Yangi taymer o'rnatish
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Ishlatish
const searchInput = document.getElementById('search');
const debouncedSearch = debounce((query) => {
  console.log('Searching for:', query);
  // API call
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

### Advanced Debounce (Leading/Trailing)

```javascript
function debounce(fn, delay, options = {}) {
  let timeoutId = null;
  let lastArgs = null;

  const { leading = false, trailing = true } = options;

  return function(...args) {
    const isFirstCall = timeoutId === null;

    lastArgs = args;
    clearTimeout(timeoutId);

    // Leading edge: birinchi chaqiruvda darhol bajarish
    if (leading && isFirstCall) {
      fn.apply(this, args);
    }

    timeoutId = setTimeout(() => {
      // Trailing edge: oxirgi argumentlar bilan chaqirish
      if (trailing && lastArgs) {
        fn.apply(this, lastArgs);
      }
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };
}

// Leading: birinchi click darhol, keyingilari debounce
const handleClick = debounce(
  () => console.log('clicked'),
  1000,
  { leading: true, trailing: false }
);

// Trailing (default): oxirgi click 1s keyin
const handleInput = debounce(
  (value) => console.log('input:', value),
  300,
  { trailing: true }
);
```

### Throttle Implementation

```javascript
function throttle(fn, interval) {
  let lastTime = 0;

  return function(...args) {
    const now = Date.now();

    if (now - lastTime >= interval) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// Ishlatish
const throttledScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 100);

window.addEventListener('scroll', throttledScroll);
```

### Advanced Throttle (Leading/Trailing)

```javascript
function throttle(fn, interval, options = {}) {
  let lastTime = 0;
  let timeoutId = null;

  const { leading = true, trailing = true } = options;

  return function(...args) {
    const now = Date.now();
    const elapsed = now - lastTime;

    // Leading edge
    if (leading && elapsed >= interval) {
      fn.apply(this, args);
      lastTime = now;
    }

    // Trailing edge
    if (trailing) {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        if (Date.now() - lastTime >= interval) {
          fn.apply(this, args);
          lastTime = Date.now();
        }
      }, interval - elapsed);
    }
  };
}
```

### Throttle with requestAnimationFrame

```javascript
function throttleRAF(fn) {
  let rafId = null;

  return function(...args) {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      fn.apply(this, args);
      rafId = null;
    });
  };
}

// Scroll animatsiya uchun ideal
const throttledScrollHandler = throttleRAF(() => {
  // ~60fps (16.67ms) ga throttle qilingan
  updateScrollProgress();
});

window.addEventListener('scroll', throttledScrollHandler);
```

### Cancel qilish imkoniyati

```javascript
function debounce(fn, delay) {
  let timeoutId = null;

  function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  }

  debounced.cancel = function() {
    clearTimeout(timeoutId);
    timeoutId = null;
  };

  debounced.flush = function() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      fn.apply(this);
      timeoutId = null;
    }
  };

  return debounced;
}

// Ishlatish
const debouncedSave = debounce(saveData, 1000);

// Komponent unmount bo'lganda
onUnmount(() => {
  debouncedSave.cancel();
});

// Darhol saqlash kerak bo'lganda
saveButton.addEventListener('click', () => {
  debouncedSave.flush();
});
```

---

## Real-World Cases

### 1. Search Input with Loading State

```javascript
class SearchComponent {
  constructor(inputEl, resultsEl) {
    this.input = inputEl;
    this.results = resultsEl;
    this.abortController = null;

    this.debouncedSearch = debounce(
      this.performSearch.bind(this),
      300
    );

    this.input.addEventListener('input', this.handleInput.bind(this));
  }

  handleInput(e) {
    const query = e.target.value.trim();

    // Bo'sh input - natijalarni tozalash
    if (!query) {
      this.clearResults();
      this.debouncedSearch.cancel();
      return;
    }

    // Loading ko'rsatish
    this.showLoading();

    // Debounced search
    this.debouncedSearch(query);
  }

  async performSearch(query) {
    // Oldingi so'rovni bekor qilish
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        signal: this.abortController.signal
      });

      const results = await response.json();
      this.renderResults(results);
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.showError(error.message);
      }
    }
  }

  showLoading() {
    this.results.innerHTML = '<div class="loading">Qidirilmoqda...</div>';
  }

  renderResults(results) {
    if (results.length === 0) {
      this.results.innerHTML = '<div class="empty">Natija topilmadi</div>';
      return;
    }

    this.results.innerHTML = results
      .map(r => `<div class="result">${r.title}</div>`)
      .join('');
  }

  clearResults() {
    this.results.innerHTML = '';
  }

  showError(message) {
    this.results.innerHTML = `<div class="error">${message}</div>`;
  }
}
```

### 2. Infinite Scroll

```javascript
class InfiniteScroll {
  constructor(options) {
    this.container = options.container;
    this.loadMore = options.loadMore;
    this.threshold = options.threshold || 200; // px
    this.loading = false;
    this.hasMore = true;

    // Throttle scroll handler
    this.throttledCheck = throttle(
      this.checkScroll.bind(this),
      100
    );

    this.container.addEventListener('scroll', this.throttledCheck);
  }

  checkScroll() {
    if (this.loading || !this.hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = this.container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < this.threshold) {
      this.load();
    }
  }

  async load() {
    this.loading = true;
    this.showLoader();

    try {
      const { items, hasMore } = await this.loadMore();

      this.appendItems(items);
      this.hasMore = hasMore;
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      this.loading = false;
      this.hideLoader();
    }
  }

  appendItems(items) {
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
      const el = this.createItemElement(item);
      fragment.appendChild(el);
    });
    this.container.appendChild(fragment);
  }

  createItemElement(item) {
    const div = document.createElement('div');
    div.className = 'item';
    div.textContent = item.title;
    return div;
  }

  showLoader() {
    // Loading indicator
  }

  hideLoader() {
    // Remove loading indicator
  }

  destroy() {
    this.container.removeEventListener('scroll', this.throttledCheck);
  }
}
```

### 3. Window Resize Handler

```javascript
class ResponsiveLayout {
  constructor() {
    this.breakpoints = {
      mobile: 480,
      tablet: 768,
      desktop: 1024
    };

    this.currentBreakpoint = this.getBreakpoint();

    // Debounce resize - faqat resize tugaganda
    this.debouncedResize = debounce(
      this.handleResize.bind(this),
      150
    );

    window.addEventListener('resize', this.debouncedResize);
  }

  getBreakpoint() {
    const width = window.innerWidth;

    if (width < this.breakpoints.mobile) return 'mobile';
    if (width < this.breakpoints.tablet) return 'tablet';
    if (width < this.breakpoints.desktop) return 'desktop';
    return 'wide';
  }

  handleResize() {
    const newBreakpoint = this.getBreakpoint();

    if (newBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = newBreakpoint;
      this.onBreakpointChange(newBreakpoint);
    }

    // Layout recalculation
    this.recalculateLayout();
  }

  onBreakpointChange(breakpoint) {
    document.body.dataset.breakpoint = breakpoint;
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('breakpointChange', {
      detail: { breakpoint }
    }));
  }

  recalculateLayout() {
    // Grid column widths, positions, etc.
  }

  destroy() {
    window.removeEventListener('resize', this.debouncedResize);
  }
}
```

### 4. Form Auto-Save

```javascript
class AutoSaveForm {
  constructor(form, saveEndpoint) {
    this.form = form;
    this.saveEndpoint = saveEndpoint;
    this.lastSavedData = null;
    this.saveStatus = document.getElementById('save-status');

    // 2 soniya keyin auto-save
    this.debouncedSave = debounce(
      this.save.bind(this),
      2000
    );

    this.form.addEventListener('input', this.handleInput.bind(this));
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  handleInput(e) {
    this.showStatus('saving', "O'zgarishlar saqlanmoqda...");
    this.debouncedSave();
  }

  handleSubmit(e) {
    e.preventDefault();
    this.debouncedSave.flush(); // Darhol saqlash
    this.submit();
  }

  async save() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    // O'zgarish borligini tekshirish
    if (JSON.stringify(data) === JSON.stringify(this.lastSavedData)) {
      this.showStatus('saved', 'Saqlangan');
      return;
    }

    try {
      await fetch(this.saveEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      this.lastSavedData = data;
      this.showStatus('saved', 'Saqlandi');
    } catch (error) {
      this.showStatus('error', 'Saqlashda xato');
    }
  }

  showStatus(type, message) {
    this.saveStatus.className = `status status-${type}`;
    this.saveStatus.textContent = message;
  }

  async submit() {
    // Final submit logic
  }
}
```

### 5. Mouse Move Performance

```javascript
class TooltipManager {
  constructor() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tooltip';
    document.body.appendChild(this.tooltip);

    // RAF-based throttle for smooth 60fps
    this.throttledMove = throttleRAF(
      this.updatePosition.bind(this)
    );

    document.addEventListener('mousemove', this.throttledMove);
  }

  updatePosition(e) {
    const x = e.clientX + 10;
    const y = e.clientY + 10;

    // GPU-accelerated positioning
    this.tooltip.style.transform = `translate(${x}px, ${y}px)`;
  }

  show(content) {
    this.tooltip.textContent = content;
    this.tooltip.classList.add('visible');
  }

  hide() {
    this.tooltip.classList.remove('visible');
  }

  destroy() {
    document.removeEventListener('mousemove', this.throttledMove);
    this.tooltip.remove();
  }
}
```

---

## Interview Savollari

### 1. Debounce va Throttle farqi nima?

**Javob:**

| Debounce | Throttle |
|----------|----------|
| Hodisalar TO'XTAGANDA chaqiradi | Muntazam INTERVAL bilan chaqiradi |
| Oxirgi chaqiruvdan N ms keyin | Har N ms da maksimum 1 marta |
| Search input, auto-save | Scroll, resize, drag |

```javascript
// Debounce: faqat 300ms sukut bo'lganda
debounce(search, 300);
// Keystroke: a...b...c...
// Chaqiruv:            ↑ (300ms keyin)

// Throttle: har 300ms da bir marta
throttle(track, 300);
// Scroll: ─────────────────────
// Chaqiruv: ↑────↑────↑────↑
//           0   300  600  900
```

### 2. Debounce implementatsiyasini yozing

**Javob:**

```javascript
function debounce(fn, delay) {
  let timeoutId;

  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

### 3. Leading va trailing debounce nima?

**Javob:**
- **Leading** — birinchi hodisada DARHOL chaqiradi
- **Trailing** — oxirgi hodisadan keyin chaqiradi (default)

```javascript
// Leading: birinchi click darhol, keyingilari ignore
const leadingDebounce = debounce(fn, 300, { leading: true, trailing: false });

// Trailing (default): oxirgi click 300ms keyin
const trailingDebounce = debounce(fn, 300, { trailing: true });

// Both: birinchi darhol + oxirgi 300ms keyin
const bothDebounce = debounce(fn, 300, { leading: true, trailing: true });
```

### 4. requestAnimationFrame bilan throttle qanday ishlaydi?

**Javob:**

```javascript
function throttleRAF(fn) {
  let rafId = null;

  return function(...args) {
    if (rafId) return; // Oldingi frame hali bajarilmagan

    rafId = requestAnimationFrame(() => {
      fn.apply(this, args);
      rafId = null;
    });
  };
}

// ~60fps (16.67ms) ga throttle qiladi
// Animatsiya va visual update uchun ideal
```

### 5. Qachon debounce, qachon throttle ishlatiladi?

**Javob:**

**Debounce:**
- Search input (yozish tugagandan keyin qidirish)
- Form validation (yozish to'xtaganda tekshirish)
- Window resize (tugagandan keyin layout hisoblash)
- Auto-save (yozish to'xtaganda saqlash)

**Throttle:**
- Scroll event (scrolling paytida muntazam tracking)
- Mouse/touch move (drag paytida pozitsiya)
- Game loop (doimiy yangilanish)
- API rate limiting (sekundiga max N ta so'rov)

---

## Xatolar va To'g'ri Yechim

### Xato 1: this konteksti yo'qolishi

```javascript
// XATO
const obj = {
  value: 42,

  getValue() {
    return this.value;
  }
};

const debouncedGet = debounce(obj.getValue, 100);
debouncedGet(); // undefined - this yo'qoldi

// TO'G'RI: bind ishlatish
const debouncedGetFixed = debounce(obj.getValue.bind(obj), 100);

// Yoki: arrow function
const debouncedGetFixed2 = debounce(() => obj.getValue(), 100);
```

### Xato 2: Memory leak - cleanup qilmaslik

```javascript
// XATO
class Component {
  constructor() {
    this.debouncedResize = debounce(this.handleResize.bind(this), 150);
    window.addEventListener('resize', this.debouncedResize);
  }

  handleResize() {
    // ...
  }

  // destroy() yo'q - memory leak!
}

// TO'G'RI
class ComponentFixed {
  constructor() {
    this.debouncedResize = debounce(this.handleResize.bind(this), 150);
    window.addEventListener('resize', this.debouncedResize);
  }

  handleResize() {
    // ...
  }

  destroy() {
    window.removeEventListener('resize', this.debouncedResize);
    this.debouncedResize.cancel?.(); // Pending callback'ni bekor qilish
  }
}
```

### Xato 3: Noto'g'ri delay tanlash

```javascript
// XATO: Juda katta delay - UX yomon
const debouncedSearch = debounce(search, 2000); // 2 soniya - juda uzoq

// XATO: Juda kichik delay - foyda yo'q
const throttledScroll = throttle(trackScroll, 5); // 5ms - deyarli throttle emas

// TO'G'RI qiymatlar:
// Search input: 200-500ms
// Auto-save: 1000-3000ms
// Scroll tracking: 50-200ms
// Resize: 100-250ms
// Mouse move: 16ms (1 frame) yoki RAF
```

### Xato 4: Async funksiya bilan debounce

```javascript
// XATO: Race condition
const debouncedFetch = debounce(async (query) => {
  const results = await fetchResults(query);
  displayResults(results); // Eski natija yangi ustiga yozilishi mumkin
}, 300);

// TO'G'RI: AbortController ishlatish
let abortController = null;

const debouncedFetchSafe = debounce(async (query) => {
  // Oldingi so'rovni bekor qilish
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();

  try {
    const results = await fetchResults(query, {
      signal: abortController.signal
    });
    displayResults(results);
  } catch (error) {
    if (error.name !== 'AbortError') {
      showError(error);
    }
  }
}, 300);
```

### Xato 5: Immediate execution kerak bo'lganda debounce

```javascript
// XATO: Button click uchun debounce
const debouncedSubmit = debounce(submitForm, 500);
submitButton.addEventListener('click', debouncedSubmit);
// Foydalanuvchi bosganda hech narsa bo'lmaydi (500ms kutish)

// TO'G'RI: Leading debounce yoki disable button
const debouncedSubmitLeading = debounce(submitForm, 500, { leading: true, trailing: false });

// Yoki: button disable qilish
async function handleSubmit() {
  submitButton.disabled = true;
  try {
    await submitForm();
  } finally {
    submitButton.disabled = false;
  }
}
```

### Xato 6: Throttle va scroll animation

```javascript
// XATO: setTimeout-based throttle animatsiya uchun
const throttledAnimate = throttle(animate, 16); // 60fps erishmoqchi
window.addEventListener('scroll', throttledAnimate);

// Lekin setTimeout aniq 16ms kafolatlamaydi!

// TO'G'RI: requestAnimationFrame
const rafThrottledAnimate = throttleRAF(animate);
window.addEventListener('scroll', rafThrottledAnimate);
```

### Xato 7: Har render'da yangi debounced funksiya

```javascript
// XATO: React component'da
function SearchComponent() {
  // Har render'da YANGI debounced funksiya yaratiladi!
  const debouncedSearch = debounce(search, 300);

  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}

// TO'G'RI: useMemo yoki useCallback
function SearchComponentFixed() {
  const debouncedSearch = useMemo(
    () => debounce(search, 300),
    [] // Bo'sh dependency - bir marta yaratiladi
  );

  // Cleanup
  useEffect(() => {
    return () => debouncedSearch.cancel?.();
  }, [debouncedSearch]);

  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}

// Yoki: useRef
function SearchComponentWithRef() {
  const debouncedSearchRef = useRef(debounce(search, 300));

  return <input onChange={(e) => debouncedSearchRef.current(e.target.value)} />;
}
```
