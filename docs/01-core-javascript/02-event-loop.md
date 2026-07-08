# Event Loop

## Nazariya

### JavaScript Single-Threaded

JavaScript bitta thread'da ishlaydi. Bu degani bir vaqtda faqat bitta operatsiya bajariladi. Lekin browser/Node.js muhiti async operatsiyalarni qo'llab-quvvatlaydi. Bu qanday ishlaydi?

### Event Loop Komponentlari

```
┌─────────────────────────────────────────────────────┐
│                     Call Stack                       │
│  (Hozir bajarilayotgan kod)                         │
└─────────────────────────────────────────────────────┘
                        ↑
                        │
┌───────────────────────┴─────────────────────────────┐
│                    Event Loop                        │
│  (Call Stack bo'sh bo'lganda queue'larni tekshiradi)│
└───────────────────────┬─────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Microtask    │ │   Task        │ │  Animation    │
│  Queue        │ │   Queue       │ │  Callbacks    │
│ (Promise,     │ │ (setTimeout,  │ │ (requestAnim- │
│  queueMicro-  │ │  setInterval, │ │  ationFrame)  │
│  task)        │ │  I/O, events) │ │               │
└───────────────┘ └───────────────┘ └───────────────┘
```

### Call Stack

Call Stack — bu LIFO (Last In, First Out) tuzilmasi. Funksiya chaqirilganda stack'ga qo'shiladi, tugaganda chiqariladi.

```javascript
function first() {
  console.log('first');
  second();
  console.log('first end');
}

function second() {
  console.log('second');
  third();
  console.log('second end');
}

function third() {
  console.log('third');
}

first();

// Call Stack holati:
// 1. first()
// 2. first() → second()
// 3. first() → second() → third()
// 4. first() → second()
// 5. first()
// 6. (bo'sh)
```

### Web APIs

Browser tomonidan taqdim etilgan API'lar (setTimeout, fetch, DOM events). Ular JavaScript engine'dan tashqarida ishlaydi.

```javascript
console.log('Start');

setTimeout(() => {
  console.log('Timeout');
}, 0);

console.log('End');

// Natija:
// Start
// End
// Timeout

// setTimeout callback Task Queue'ga 0ms dan keyin qo'shiladi,
// lekin faqat Call Stack bo'shaganda bajariladi
```

### Task Queue (Macrotask Queue)

Task Queue'ga qo'shiladigan operatsiyalar:
- `setTimeout` / `setInterval`
- I/O operatsiyalar
- UI rendering
- DOM events (click, scroll, etc.)

### Microtask Queue

Microtask Queue YUQORI prioritetga ega. Call Stack bo'shagandan keyin, keyingi task'dan OLDIN barcha microtask'lar bajariladi.

Microtask'lar:
- `Promise.then/catch/finally`
- `queueMicrotask()`
- `MutationObserver`

```javascript
console.log('Script start');

setTimeout(() => console.log('setTimeout'), 0);

Promise.resolve()
  .then(() => console.log('Promise 1'))
  .then(() => console.log('Promise 2'));

queueMicrotask(() => console.log('queueMicrotask'));

console.log('Script end');

// Natija:
// Script start
// Script end
// Promise 1
// queueMicrotask
// Promise 2
// setTimeout
```

### Event Loop Algoritmi

```
1. Call Stack'dagi barcha sinxron kodni bajaring
2. Call Stack bo'sh bo'lganda:
   a. Microtask Queue'dagi BARCHA task'larni bajaring
      (yangi microtask'lar ham shu bosqichda bajariladi)
   b. Rendering kerakmi? (≈16ms o'tdi, repaint kerak)
      - Ha: requestAnimationFrame callback'larni bajaring
      - Style, Layout, Paint
   c. Task Queue'dan BITTA task oling va bajaring
3. 2-bosqichga qayting
```

---

## Kod Misollari

### To'g'ri: Event Loop Ketma-ketligini Tushunish

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => {
  console.log('3');
  setTimeout(() => console.log('4'), 0);
});

Promise.resolve().then(() => console.log('5'));

console.log('6');

// Natija: 1, 6, 3, 5, 2, 4

// Tushuntirish:
// 1. Sinxron: 1, 6
// 2. Microtask: 3, 5 (Promise'lar)
//    - '3' chiqganda yangi setTimeout qo'shiladi
// 3. Task: 2 (birinchi setTimeout)
// 4. Task: 4 (3 ichida qo'shilgan setTimeout)
```

### To'g'ri: Microtask Starvation Ehtiyotkorlik

```javascript
// XAVFLI: Microtask cheksiz loop
function createInfiniteMicrotasks() {
  Promise.resolve().then(() => {
    console.log('microtask');
    createInfiniteMicrotasks(); // XATO: UI freeze!
  });
}

// Task'lar hech qachon bajarilmaydi!
// Rendering ham to'xtaydi!
```

### Noto'g'ri: Blocking the Main Thread

```javascript
// XATO: Sinxron og'ir hisoblash
function processLargeArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    // Og'ir hisoblash
    for (let j = 0; j < 10000; j++) {
      sum += arr[i] * j;
    }
  }
  return sum;
}

const hugeArray = new Array(100000).fill(1);
processLargeArray(hugeArray); // UI 5+ soniya freeze!
```

### To'g'ri: Chunking with setTimeout

```javascript
// TO'G'RI: Ishni bo'laklarga bo'lish
function processLargeArrayAsync(arr, callback) {
  const chunkSize = 1000;
  let index = 0;
  let sum = 0;

  function processChunk() {
    const end = Math.min(index + chunkSize, arr.length);

    for (let i = index; i < end; i++) {
      for (let j = 0; j < 10000; j++) {
        sum += arr[i] * j;
      }
    }

    index = end;

    if (index < arr.length) {
      // Keyingi chunk'ni task queue'ga qo'yish
      setTimeout(processChunk, 0);
    } else {
      callback(sum);
    }
  }

  processChunk();
}

// UI responsive qoladi!
processLargeArrayAsync(hugeArray, (result) => {
  console.log('Done:', result);
});
```

### To'g'ri: requestAnimationFrame Ishlatish

```javascript
// Animatsiya uchun eng to'g'ri usul
function animate(element) {
  let position = 0;

  function step() {
    position += 2;
    element.style.transform = `translateX(${position}px)`;

    if (position < 500) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// Nima uchun setTimeout emas?
// - rAF browser rendering cycle bilan sinxronlashgan
// - Tab inactive bo'lganda to'xtaydi (battery saving)
// - 60fps (16.67ms) ga optimallashtirilgan
```

### To'g'ri: requestIdleCallback

```javascript
// Kam muhim ishlarni bo'sh vaqtda bajarish
function processNonCriticalWork(tasks) {
  function processTask(deadline) {
    // deadline.timeRemaining() - qancha vaqt qolganini ko'rsatadi
    while (tasks.length > 0 && deadline.timeRemaining() > 0) {
      const task = tasks.shift();
      task();
    }

    if (tasks.length > 0) {
      requestIdleCallback(processTask);
    }
  }

  requestIdleCallback(processTask);
}

// Misol: Analytics yuborish
processNonCriticalWork([
  () => sendAnalytics('page_view'),
  () => prefetchResources(),
  () => updateServiceWorker()
]);
```

---

## Real-World Cases

### 1. Debounced Input bilan Search

```javascript
class SearchInput {
  constructor(inputEl, searchFn) {
    this.inputEl = inputEl;
    this.searchFn = searchFn;
    this.pendingSearch = null;

    this.inputEl.addEventListener('input', this.handleInput.bind(this));
  }

  handleInput(e) {
    const query = e.target.value;

    // Oldingi pending search'ni bekor qilish
    if (this.pendingSearch) {
      clearTimeout(this.pendingSearch);
    }

    // Yangi search'ni schedule qilish
    this.pendingSearch = setTimeout(() => {
      this.searchFn(query);
      this.pendingSearch = null;
    }, 300);
  }
}

// Event loop tushunish:
// 1. Har keystroke'da input event (Task Queue)
// 2. handleInput sinxron bajariladi
// 3. clearTimeout oldingi scheduled task'ni olib tashlaydi
// 4. Yangi setTimeout 300ms keyin Task Queue'ga qo'shiladi
// 5. 300ms ichida yangi keystroke bo'lmasa, search bajariladi
```

### 2. Virtual Scrolling Implementation

```javascript
class VirtualScroller {
  constructor(container, items, rowHeight) {
    this.container = container;
    this.items = items;
    this.rowHeight = rowHeight;
    this.scrollRAF = null;

    this.container.addEventListener('scroll', this.handleScroll.bind(this));
    this.render();
  }

  handleScroll() {
    // rAF bilan throttle qilish
    if (this.scrollRAF) return;

    this.scrollRAF = requestAnimationFrame(() => {
      this.render();
      this.scrollRAF = null;
    });
  }

  render() {
    const scrollTop = this.container.scrollTop;
    const viewportHeight = this.container.clientHeight;

    const startIndex = Math.floor(scrollTop / this.rowHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(viewportHeight / this.rowHeight) + 1,
      this.items.length
    );

    // Faqat ko'rinadigan elementlarni render qilish
    const visibleItems = this.items.slice(startIndex, endIndex);
    // ... DOM update
  }
}
```

### 3. Promise Chaining vs Microtask Understanding

```javascript
async function fetchUserWithPosts(userId) {
  console.log('1. Starting');

  // Bu microtask'larni yaratadi
  const user = await fetch(`/api/users/${userId}`).then(r => r.json());
  console.log('2. Got user');

  const posts = await fetch(`/api/users/${userId}/posts`).then(r => r.json());
  console.log('3. Got posts');

  return { user, posts };
}

console.log('A');
fetchUserWithPosts(1).then(() => console.log('B'));
console.log('C');

// Natija:
// A
// 1. Starting
// C
// (network so'rov kutish...)
// 2. Got user
// (network so'rov kutish...)
// 3. Got posts
// B

// await ni ko'rganda, funksiya to'xtaydi va
// qolgan qismi microtask sifatida schedule qilinadi
```

### 4. Avoiding Layout Thrashing

```javascript
// XATO: Layout thrashing
function badAnimateBoxes(boxes) {
  boxes.forEach(box => {
    // Read
    const height = box.offsetHeight;
    // Write (forces layout recalculation!)
    box.style.height = height * 2 + 'px';
  });
}

// TO'G'RI: Batch reads and writes
function goodAnimateBoxes(boxes) {
  // 1. Barcha read'larni yig'ish
  const heights = boxes.map(box => box.offsetHeight);

  // 2. Barcha write'larni bajarish
  requestAnimationFrame(() => {
    boxes.forEach((box, i) => {
      box.style.height = heights[i] * 2 + 'px';
    });
  });
}
```

### 5. Web Worker Integration

```javascript
// main.js
class HeavyTaskRunner {
  constructor() {
    this.worker = new Worker('worker.js');
    this.pendingTasks = new Map();
    this.taskId = 0;

    this.worker.onmessage = (e) => {
      const { id, result, error } = e.data;
      const task = this.pendingTasks.get(id);

      if (task) {
        if (error) {
          task.reject(new Error(error));
        } else {
          task.resolve(result);
        }
        this.pendingTasks.delete(id);
      }
    };
  }

  run(type, data) {
    return new Promise((resolve, reject) => {
      const id = this.taskId++;
      this.pendingTasks.set(id, { resolve, reject });
      this.worker.postMessage({ id, type, data });
    });
  }
}

// worker.js
self.onmessage = (e) => {
  const { id, type, data } = e.data;

  try {
    let result;

    switch (type) {
      case 'heavyCalculation':
        result = performHeavyCalculation(data);
        break;
      case 'parseJSON':
        result = JSON.parse(data);
        break;
    }

    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
```

---

## Interview Savollari

### 1. Event Loop nima va qanday ishlaydi?

**Javob:** Event Loop — JavaScript runtime'ning asinxron operatsiyalarni boshqarish mexanizmi. JavaScript single-threaded, lekin Event Loop tufayli non-blocking I/O mumkin.

Ishlash tartibi:
1. Call Stack'dagi sinxron kodni bajarish
2. Stack bo'shaganda Microtask Queue'dagi BARCHA task'larni bajarish
3. Kerak bo'lsa rendering
4. Task Queue'dan BITTA task olish va bajarish
5. Takrorlash

### 2. Microtask va Macrotask farqi nima?

**Javob:**

| Xususiyat | Microtask | Macrotask |
|-----------|-----------|-----------|
| Misol | Promise.then, queueMicrotask | setTimeout, setInterval, I/O |
| Prioritet | Yuqori | Past |
| Bajarilish | Call Stack bo'shaganda HAMMASI | Har cycle'da BITTA |
| Rendering | Microtask'lardan KEYIN | Macrotask'lardan OLDIN bo'lishi mumkin |

```javascript
setTimeout(() => console.log('macro'), 0);
Promise.resolve().then(() => console.log('micro'));
// micro, macro
```

### 3. Bu kod nima chiqaradi?

```javascript
console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve()
  .then(() => {
    console.log('C');
    return Promise.resolve();
  })
  .then(() => console.log('D'));

queueMicrotask(() => console.log('E'));

console.log('F');
```

**Javob:** `A, F, C, E, D, B`

Tushuntirish:
1. Sinxron: A, F
2. Microtask (birinchi batch): C (Promise), E (queueMicrotask)
3. Microtask (ikkinchi batch): D (C ichidagi return Promise.resolve() yangi microtask yaratadi)
4. Macrotask: B

### 4. requestAnimationFrame qachon ishlatiladi?

**Javob:** Animatsiya va vizual yangilanishlar uchun. Afzalliklari:
- Browser rendering cycle bilan sinxronlashgan (60fps = 16.67ms)
- Tab inactive bo'lganda to'xtaydi (battery/CPU tejash)
- setTimeout dan ko'ra smooth animatsiya

```javascript
function animate() {
  element.style.left = position++ + 'px';
  if (position < 100) {
    requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);
```

### 5. JavaScript'da blocking code yozmay turib qanday qilib og'ir hisoblashlarni bajarish mumkin?

**Javob:**
1. **Web Workers** — alohida thread'da ishlash
2. **Chunking** — ishni bo'laklarga bo'lib setTimeout bilan
3. **requestIdleCallback** — bo'sh vaqtda bajarish

```javascript
// Web Worker
const worker = new Worker('heavy-task.js');
worker.postMessage(data);
worker.onmessage = (e) => console.log(e.data);

// Chunking
function processChunk() {
  // 50ms dan ortiq ishlamaslik
  const start = Date.now();
  while (items.length && Date.now() - start < 50) {
    process(items.shift());
  }
  if (items.length) setTimeout(processChunk, 0);
}
```

---

## Xatolar va To'g'ri Yechim

### Xato 1: setTimeout(fn, 0) tushunmaslik

```javascript
// XATO tushuncha: "0ms dan keyin bajariladi"
console.log('start');
setTimeout(() => console.log('timeout'), 0);
console.log('end');

// Aslida "timeout" eng oxirida chiqadi
// 0ms degani "imkon qadar tez Task Queue'ga qo'sh"
// lekin Call Stack bo'shagandan keyingina bajariladi
```

### Xato 2: Promise.resolve() sinxron deb o'ylash

```javascript
// XATO
console.log('1');
Promise.resolve().then(() => console.log('2'));
console.log('3');

// Ba'zilar 1, 2, 3 kutadi
// Lekin natija: 1, 3, 2

// Promise.then callback DOIM microtask
```

### Xato 3: Async/await blocking deb o'ylash

```javascript
// XATO tushuncha
async function fetchData() {
  console.log('fetching...');
  const data = await fetch('/api');
  console.log('done'); // Bu "blocking" emas
  return data;
}

console.log('A');
fetchData();
console.log('B');

// Natija: A, fetching..., B, done
// await funksiyani "to'xtatadi", lekin main thread'ni emas!
```

### Xato 4: setInterval bilan animation

```javascript
// XATO: setInterval bilan animatsiya
setInterval(() => {
  element.style.left = position++ + 'px';
}, 16); // 60fps uchun 16ms

// Muammolar:
// 1. setInterval aniq emas (16ms kafolatlanmaydi)
// 2. Tab inactive bo'lganda ham ishlaydi
// 3. Callback vaqti hisobga olinmaydi

// TO'G'RI: requestAnimationFrame
function animate() {
  element.style.left = position++ + 'px';
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

### Xato 5: Microtask ichida recursive microtask

```javascript
// XATO: Infinite microtask loop
function scheduleWork() {
  Promise.resolve().then(() => {
    doSomeWork();
    scheduleWork(); // XAVFLI!
  });
}

// Bu UI ni butunlay freeze qiladi!
// Microtask'lar tugamaguncha hech narsa bajarilmaydi

// TO'G'RI: setTimeout bilan macrotask ishlatish
function scheduleWorkSafe() {
  doSomeWork();
  setTimeout(scheduleWorkSafe, 0); // Macrotask
}
```

### Xato 6: Layout thrashing

```javascript
// XATO: Read va Write'ni almashtirish
elements.forEach(el => {
  const width = el.offsetWidth; // Read - layout trigger
  el.style.width = width + 10 + 'px'; // Write
  // Keyingi read yana layout hisobini majbur qiladi!
});

// TO'G'RI: Batch reads, then batch writes
const widths = elements.map(el => el.offsetWidth); // All reads
elements.forEach((el, i) => {
  el.style.width = widths[i] + 10 + 'px'; // All writes
});
```

### Xato 7: Promise rejection'ni tutmaslik

```javascript
// XATO: Unhandled rejection
async function fetchData() {
  const response = await fetch('/api'); // Xato bo'lishi mumkin!
  return response.json();
}

fetchData(); // Rejection hech qachon tutilmaydi

// TO'G'RI: Error handling
async function fetchDataSafe() {
  try {
    const response = await fetch('/api');
    if (!response.ok) throw new Error('HTTP error');
    return response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    return null;
  }
}

// Yoki global handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
});
```
