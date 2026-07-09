# Memory Management

## Nazariya

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturingiz qancha uzoq ishlasa, shuncha ko'p xotira (RAM) talab qila boshlaydi. JS da xotirani siz qo'lda boshqarmaysiz, buni avtomatik tarzda *Garbage Collector (Axlat yig'ishtiruvchi)* bajaradi. Lekin GC ko'r-ko'rona ishlamaydi. U faqat sizga endi "kerak bo'lmay qolgan" (hech qayerdan havola qilinmagan - unreachable) narsalarnigina tozalaydi. Agar siz esdan chiqarib DOM elementini ob'ekt ichida saqlab qo'ysangiz yoki timer'larni o'chirmasangiz, GC ularni "hali ham kerak" deb o'ylab tozalolmaydi. Buni **Memory Leak (Xotira sizib chiqishi)** deyiladi va oxir-oqibat u brauzerni qotirib, qulatib yuboradi.

> [!NOTE]
> **Real-hayot analogiyasi: "Restoran stoli va Ofitsiant"**  
> Foydalanuvchi restoranga kelib stulga o'tirdi (Variable yaratildi, Xotira ajratildi). U ovqatlandi (Xotiradan foydalanildi). Keyin u o'rnidan turib ketdi (Xotiraga bo'lgan ehtiyoj yo'qoldi).
> **Garbage Collector (Ofitsiant)** stol bo'shaganini (Unreachable) ko'rgach, kelib idishlarni yig'ishtirib oladi va keyingi mijoz uchun bo'shatadi (Xotirani tozalash). Lekin mijoz sumkasini stulga tashlab ketsa, ofitsiant "Bu stol hali band ekan" deb unga tegmaydi. Agar bunday holat ko'p marta takrorlansa, restoranda bo'sh joy qolmaydi (Memory Leak).

### JavaScript Memory Model

JavaScript avtomatik memory management ishlatadi. Dasturchi qo'lda xotira ajratish/bo'shatish bilan shug'ullanmaydi, lekin memory leak'larni tushunish muhim.

```mermaid
graph LR
    subgraph Stack [Stack Memory]
        Prim[Primitivlar<br/>let age = 25]
        Ref[Referencelar<br/>let user = ●]
    end
    
    subgraph Heap [Heap Memory]
        Obj[Ob'ektlar<br/>{name: 'Ali'}]
        Arr[Massivlar<br/>1, 2, 3]
        Func[Funksiyalar]
    end
    
    Ref -->|Pointer| Obj
    
    style Stack fill:#e3f2fd,stroke:#1565c0
    style Heap fill:#fff3e0,stroke:#e65100
```

### Memory Lifecycle

1. **Allocation** — o'zgaruvchi yaratilganda xotira ajratiladi
2. **Use** — xotira o'qiladi/yoziladi
3. **Release** — xotira bo'shatiladi (Garbage Collection)

```javascript
// 1. Allocation
let user = { name: 'Ali' };     // Heap'da ob'ekt yaratildi
let numbers = [1, 2, 3, 4, 5];  // Heap'da array yaratildi
let name = 'Vali';              // Stack'da primitive

// 2. Use
console.log(user.name);
numbers.push(6);

// 3. Release (avtomatik)
user = null;      // { name: 'Ali' } ga reference yo'q - GC yig'adi
numbers = null;   // Array ham GC tomonidan yig'iladi
```

### Garbage Collection

JavaScript **Mark-and-Sweep** algoritmini ishlatadi:

1. **Mark phase** — root'lardan (global, stack) boshlab barcha reachable ob'ektlarni belgilash
2. **Sweep phase** — belgilanmagan ob'ektlarni xotiradan o'chirish

```javascript
// Root'lar:
// - Global ob'ektlar (window, global)
// - Hozirgi call stack'dagi o'zgaruvchilar
// - Closures

function example() {
  let a = { x: 1 };  // a reachable (stack'da)
  let b = { y: 2 };  // b reachable

  a.ref = b;         // a → b
  b.ref = a;         // b → a (circular reference)

  return a;
}

const result = example();  // a qaytarildi, b endi unreachable
// GC b ni yig'adi (circular reference bo'lsa ham)
```

### WeakMap va WeakSet

**Weak references** — GC'ga to'sqinlik qilmaydigan reference'lar.

```javascript
// Map - strong reference
const map = new Map();
let obj = { data: 'important' };
map.set(obj, 'metadata');
obj = null;  // Ob'ekt hali ham map ichida - GC yig'maydi!

// WeakMap - weak reference
const weakMap = new WeakMap();
let obj2 = { data: 'important' };
weakMap.set(obj2, 'metadata');
obj2 = null;  // Ob'ekt GC tomonidan yig'iladi!
              // weakMap entry ham avtomatik o'chadi
```

**WeakMap qoidalari:**
- Faqat ob'ektlar key bo'lishi mumkin (primitive emas)
- Key'lar enumerable emas (iterate qilib bo'lmaydi)
- `.size` property yo'q

---

## Kod Misollari

### Memory Leak: Global Variables

```javascript
// XATO: Global o'zgaruvchilar
function leak() {
  // 'use strict' bo'lmasa, bu global bo'ladi
  leakedVariable = new Array(1000000);
}

leak();
// leakedVariable global'da qoladi - hech qachon GC'lanmaydi

// TO'G'RI: 'use strict' va local variable
'use strict';
function noLeak() {
  const localVariable = new Array(1000000);
  // Funksiya tugaganda GC yig'adi
}
```

### Memory Leak: Forgotten Timers

```javascript
// XATO: Timer tozalanmagan
class Component {
  constructor() {
    this.data = new Array(1000000);

    // Bu interval to'xtatilmasa, this.data hech qachon GC'lanmaydi
    setInterval(() => {
      this.update();
    }, 1000);
  }

  update() {
    console.log(this.data.length);
  }
}

// TO'G'RI: Cleanup qilish
class ComponentFixed {
  constructor() {
    this.data = new Array(1000000);
    this.intervalId = setInterval(() => {
      this.update();
    }, 1000);
  }

  update() {
    console.log(this.data.length);
  }

  destroy() {
    clearInterval(this.intervalId);
    this.data = null;
  }
}
```

### Memory Leak: Event Listeners

```javascript
// XATO: Event listener olib tashlanmagan
class Modal {
  constructor() {
    this.element = document.createElement('div');
    this.data = new Array(1000000); // Katta data

    // Handler reference saqlanmagan
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  close() {
    this.element.remove();
    // Listener hali ham mavjud - this.data GC'lanmaydi!
  }
}

// TO'G'RI: Handler reference saqlash va cleanup
class ModalFixed {
  constructor() {
    this.element = document.createElement('div');
    this.data = new Array(1000000);

    // Handler reference saqlash
    this.handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };

    document.addEventListener('keydown', this.handleKeydown);
  }

  close() {
    document.removeEventListener('keydown', this.handleKeydown);
    this.element.remove();
    this.data = null;
  }
}
```

### Memory Leak: Closures

```javascript
// XATO: Closure katta ob'ektni ushlab turadi
function createHandler() {
  const hugeData = new Array(1000000).fill('x');

  // hugeData closure ichida, handler mavjud ekan GC'lanmaydi
  return function handler() {
    console.log('Handler called');
    // hugeData ISHLATILMAYAPTI, lekin hali ham reference bor
  };
}

const handler = createHandler();
// hugeData xotirada qoladi

// TO'G'RI: Faqat kerakli qiymatni saqlash
function createHandlerFixed() {
  const hugeData = new Array(1000000).fill('x');
  const summary = hugeData.length; // Faqat kerakli qiymat

  return function handler() {
    console.log(`Data length: ${summary}`);
  };
}
```

### WeakMap: Metadata Saqlash

```javascript
// DOM element'larga metadata qo'shish
const elementMetadata = new WeakMap();

function trackElement(element, data) {
  elementMetadata.set(element, {
    createdAt: Date.now(),
    ...data
  });
}

function getElementData(element) {
  return elementMetadata.get(element);
}

// Ishlatish
const div = document.createElement('div');
trackElement(div, { type: 'container' });

// Element DOM'dan o'chirilganda
document.body.removeChild(div);
// WeakMap entry avtomatik o'chadi - memory leak yo'q!
```

### WeakSet: Object Tracking

```javascript
// Ob'ektlarni bir marta ishlov berish
const processed = new WeakSet();

function processObject(obj) {
  if (processed.has(obj)) {
    console.log('Already processed');
    return;
  }

  // Ishlov berish
  console.log('Processing:', obj);

  processed.add(obj);
}

const item = { id: 1 };
processObject(item); // "Processing: {id: 1}"
processObject(item); // "Already processed"

// item = null bo'lganda, WeakSet entry ham o'chadi
```

### FinalizationRegistry (ES2021)

```javascript
// Ob'ekt GC'langanda callback chaqirish
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Object with ${heldValue} was garbage collected`);
});

function createTrackedObject(id) {
  const obj = { id, data: new Array(1000) };

  registry.register(obj, `id=${id}`);

  return obj;
}

let obj1 = createTrackedObject(1);
let obj2 = createTrackedObject(2);

obj1 = null; // GC'langanda: "Object with id=1 was garbage collected"
```

---

## Real-World Cases

### 1. SPA Router Memory Management

```javascript
class Router {
  constructor() {
    this.routes = new Map();
    this.currentComponent = null;
    this.componentCache = new WeakMap();

    // popstate handler
    this.handlePopState = this.handlePopState.bind(this);
    window.addEventListener('popstate', this.handlePopState);
  }

  register(path, componentClass) {
    this.routes.set(path, componentClass);
  }

  navigate(path) {
    // Oldingi component'ni cleanup
    if (this.currentComponent) {
      this.currentComponent.destroy?.();
    }

    const ComponentClass = this.routes.get(path);
    if (!ComponentClass) {
      console.error('Route not found:', path);
      return;
    }

    // Yangi component yaratish
    this.currentComponent = new ComponentClass();
    this.currentComponent.mount(document.getElementById('app'));

    history.pushState(null, '', path);
  }

  handlePopState() {
    this.navigate(window.location.pathname);
  }

  destroy() {
    window.removeEventListener('popstate', this.handlePopState);
    if (this.currentComponent) {
      this.currentComponent.destroy?.();
    }
    this.routes.clear();
  }
}
```

### 2. Image Lazy Loading with Cleanup

```javascript
class LazyImageLoader {
  constructor() {
    this.observer = null;
    this.loadedImages = new WeakSet();
    this.init();
  }

  init() {
    this.observer = new IntersectionObserver(
      this.handleIntersect.bind(this),
      { rootMargin: '50px' }
    );

    document.querySelectorAll('img[data-src]').forEach(img => {
      this.observer.observe(img);
    });
  }

  handleIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
      }
    });
  }

  loadImage(img) {
    if (this.loadedImages.has(img)) return;

    const src = img.dataset.src;
    if (!src) return;

    // Preload
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      img.removeAttribute('data-src');
      this.loadedImages.add(img);
      this.observer.unobserve(img);
    };
    tempImg.src = src;
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
```

### 3. WebSocket Manager with Reconnect

```javascript
class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnects = 5;
    this.reconnectTimeout = null;
    this.messageQueue = [];
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected');
      this.reconnectAttempts = 0;
      this.flushQueue();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data.payload);
    };

    this.ws.onclose = () => {
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnects) {
      console.error('Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  send(type, payload) {
    const message = JSON.stringify({ type, payload });

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  flushQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws.send(message);
    }
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);

    // Unsubscribe funksiyasi qaytarish
    return () => {
      const callbacks = this.listeners.get(type);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }

  emit(type, payload) {
    const callbacks = this.listeners.get(type) || [];
    callbacks.forEach(cb => cb(payload));
  }

  destroy() {
    clearTimeout(this.reconnectTimeout);

    if (this.ws) {
      this.ws.onclose = null; // Reconnect'ni oldini olish
      this.ws.close();
      this.ws = null;
    }

    this.listeners.clear();
    this.messageQueue = [];
  }
}
```

### 4. Object Pool Pattern

```javascript
class ObjectPool {
  constructor(factory, initialSize = 10) {
    this.factory = factory;
    this.pool = [];
    this.active = new Set();

    // Pre-allocate
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  acquire() {
    let obj;

    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.factory();
    }

    this.active.add(obj);
    return obj;
  }

  release(obj) {
    if (!this.active.has(obj)) {
      console.warn('Object not from this pool');
      return;
    }

    this.active.delete(obj);

    // Reset va pool'ga qaytarish
    if (typeof obj.reset === 'function') {
      obj.reset();
    }

    this.pool.push(obj);
  }

  get stats() {
    return {
      available: this.pool.length,
      active: this.active.size,
      total: this.pool.length + this.active.size
    };
  }

  destroy() {
    this.pool = [];
    this.active.clear();
  }
}

// Ishlatish
class Particle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
  }
}

const particlePool = new ObjectPool(() => new Particle(), 100);

function emitParticle(x, y) {
  const particle = particlePool.acquire();
  particle.x = x;
  particle.y = y;
  particle.vx = Math.random() * 2 - 1;
  particle.vy = Math.random() * 2 - 1;

  // Animatsiya tugaganda
  setTimeout(() => {
    particlePool.release(particle);
  }, 1000);
}
```

### 5. Memory-Efficient Data Processing

```javascript
// Katta faylni chunk'larda o'qish
async function* readFileChunks(file, chunkSize = 1024 * 1024) {
  let offset = 0;

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    const text = await chunk.text();
    yield text;
    offset += chunkSize;
  }
}

async function processLargeFile(file) {
  const results = [];

  for await (const chunk of readFileChunks(file)) {
    // Har bir chunk'ni alohida ishlov berish
    const processed = processChunk(chunk);
    results.push(processed);

    // UI update
    updateProgress(offset / file.size);
  }

  return results;
}

// Streaming JSON parser
async function* parseJSONStream(stream) {
  const decoder = new TextDecoder();
  let buffer = '';

  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true });

    // Yangi qator bo'yicha ajratish (ndjson format)
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Oxirgi to'liq bo'lmagan qator

    for (const line of lines) {
      if (line.trim()) {
        yield JSON.parse(line);
      }
    }
  }

  // Qolgan buffer
  if (buffer.trim()) {
    yield JSON.parse(buffer);
  }
}
```

---

## Interview Savollari

### 1. JavaScript'da Garbage Collection qanday ishlaydi?

**Javob:** JavaScript Mark-and-Sweep algoritmi ishlatadi:

1. **Root'larni aniqlash** — global ob'ektlar, stack variables, closures
2. **Mark phase** — root'lardan boshlab barcha reachable ob'ektlarni belgilash
3. **Sweep phase** — belgilanmagan ob'ektlarni xotiradan o'chirish

```javascript
let a = { x: 1 };
let b = { y: 2 };
a.ref = b; // a → b

a = null;  // a unreachable, lekin b hali ham b orqali reachable
b = null;  // Endi ikkalasi ham unreachable - GC yig'adi
```

### 2. Memory leak qanday paydo bo'ladi?

**Javob:** Asosiy sabablar:

1. **Global variables** — `'use strict'` bo'lmasa
2. **Forgotten timers** — `setInterval` tozalanmagan
3. **Event listeners** — `removeEventListener` chaqirilmagan
4. **Closures** — katta ob'ektlarga keraksiz reference
5. **DOM references** — o'chirilgan elementlarga reference

```javascript
// Xato
let elements = [];
document.querySelectorAll('.item').forEach(el => {
  elements.push(el); // Reference saqlanadi
});
// Element DOM'dan o'chirilsa ham, elements array'da qoladi
```

### 3. WeakMap va Map farqi nima?

**Javob:**

| Map | WeakMap |
|-----|---------|
| Har qanday key | Faqat ob'ekt key |
| Strong reference | Weak reference |
| Enumerable | Enumerable emas |
| `.size` bor | `.size` yo'q |
| GC'ga to'sqinlik | GC'ga ruxsat |

```javascript
const map = new Map();
let obj = {};
map.set(obj, 'data');
obj = null; // Ob'ekt hali map'da - GC'lanmaydi

const weakMap = new WeakMap();
let obj2 = {};
weakMap.set(obj2, 'data');
obj2 = null; // Ob'ekt GC'lanadi, WeakMap entry o'chadi
```

### 4. Memory profiling qanday qilinadi?

**Javob:** Chrome DevTools ishlatiladi:

1. **Memory tab** → **Heap snapshot** — hozirgi xotira holati
2. **Allocation timeline** — vaqt bo'yicha allocation
3. **Allocation sampling** — profiling

Qadamlar:
1. Snapshot olish
2. Action bajarish
3. Yana snapshot olish
4. Comparison ko'rish — yangi ob'ektlar = potential leak

### 5. Closure memory leak qanday oldini olinadi?

**Javob:**

```javascript
// XATO
function createHandler() {
  const huge = new Array(1000000);
  return () => {
    // huge ishlatilmayapti, lekin reference bor
  };
}

// TO'G'RI
function createHandlerFixed() {
  const huge = new Array(1000000);
  const needed = huge.length; // Faqat kerakli qiymat

  return () => {
    console.log(needed);
  };
}

// Yoki: null qilish
function createHandlerWithCleanup() {
  let huge = new Array(1000000);
  const result = processData(huge);
  huge = null; // Reference yo'q qilish

  return () => {
    console.log(result);
  };
}
```

---

## Xatolar va To'g'ri Yechim

### Xato 1: DOM reference saqlash

```javascript
// XATO
const cache = {
  header: document.getElementById('header'),
  sidebar: document.getElementById('sidebar'),
  content: document.getElementById('content')
};

// Element DOM'dan o'chirilsa ham, cache'da qoladi

// TO'G'RI: WeakRef yoki lazy lookup
const getElement = (id) => document.getElementById(id);

// Yoki WeakRef (ehtiyotkorlik bilan)
const cache = {
  header: new WeakRef(document.getElementById('header'))
};

const header = cache.header.deref(); // null bo'lishi mumkin
```

### Xato 2: Event emitter cleanup yo'q

```javascript
// XATO
class Component {
  constructor(emitter) {
    this.data = new Array(1000000);

    emitter.on('update', (data) => {
      this.handleUpdate(data);
    });
  }

  handleUpdate(data) {
    console.log(data, this.data.length);
  }
}

// TO'G'RI: Unsubscribe saqlash
class ComponentFixed {
  constructor(emitter) {
    this.data = new Array(1000000);

    this.unsubscribe = emitter.on('update', (data) => {
      this.handleUpdate(data);
    });
  }

  handleUpdate(data) {
    console.log(data, this.data.length);
  }

  destroy() {
    this.unsubscribe();
    this.data = null;
  }
}
```

### Xato 3: Console.log katta ob'ektlar

```javascript
// XATO: DevTools ochiq bo'lsa, bu ob'ektlar memory'da qoladi
function processData() {
  const hugeData = new Array(1000000).fill({ x: 1, y: 2 });
  console.log(hugeData); // Reference saqlanadi!
  return hugeData.length;
}

// TO'G'RI: Production'da console.log olib tashlash
// Yoki summary log qilish
function processDataFixed() {
  const hugeData = new Array(1000000).fill({ x: 1, y: 2 });

  if (process.env.NODE_ENV === 'development') {
    console.log('Data length:', hugeData.length);
  }

  return hugeData.length;
}
```

### Xato 4: Array reference clearing

```javascript
// XATO: Yangi array tayinlash reference'ni buzmaydi
let items = [1, 2, 3, 4, 5];
const getItems = () => items;

items = []; // Yangi array, eski array hali getItems closure'da

// TO'G'RI: Array'ni tozalash
items.length = 0; // Xuddi shu array'ni tozalash

// Yoki: splice
items.splice(0, items.length);
```

### Xato 5: Recursive structure

```javascript
// XATO: Circular reference
const parent = { name: 'parent' };
const child = { name: 'child' };
parent.child = child;
child.parent = parent; // Circular!

// JSON.stringify xato beradi
// console.log ham muammo bo'lishi mumkin

// TO'G'RI: WeakRef yoki id bilan reference
const nodes = new Map();

const parent = { id: 1, name: 'parent', childId: 2 };
const child = { id: 2, name: 'child', parentId: 1 };

nodes.set(1, parent);
nodes.set(2, child);

// Lookup funksiya
const getParent = (node) => nodes.get(node.parentId);
const getChild = (node) => nodes.get(node.childId);
```

### Xato 6: Promise chain'da katta data

```javascript
// XATO: Har bir then katta data'ni saqlaydi
fetchLargeData()
  .then(data => {
    const processed = processData(data);
    return { data, processed }; // data hali ham reference'da
  })
  .then(({ data, processed }) => {
    return { data, processed, extra: computeExtra(data) };
    // data har then'da o'tadi
  });

// TO'G'RI: Faqat kerakli ma'lumotni o'tkazish
fetchLargeData()
  .then(data => {
    const processed = processData(data);
    const summary = data.length; // Faqat kerakli
    return { processed, summary };
  })
  .then(({ processed, summary }) => {
    return { processed, summary, extra: computeExtra(processed) };
  });
```

### Xato 7: React component'da subscription

```javascript
// XATO: useEffect cleanup yo'q
function Component() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://...');
    ws.onmessage = (e) => setData(JSON.parse(e.data));
    // Cleanup yo'q!
  }, []);

  return <div>{data}</div>;
}

// TO'G'RI: Cleanup funksiya
function ComponentFixed() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://...');
    ws.onmessage = (e) => setData(JSON.parse(e.data));

    return () => {
      ws.close(); // Cleanup!
    };
  }, []);

  return <div>{data}</div>;
}
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Komponent o'lganda tozalash ishlarini unutmang:** Vue'da `onUnmounted`, React'da `useEffect` return qismida event listenerlarni va taymerlarni o'chirishni doim odat qiling.
2. **Katta ro'yxatlarni to'g'ri ishlating:** Agar DOM'dan qandaydir `li` elementni o'chirib yuborgan bo'lsangiz-u, lekin u JS ob'ekti ichida ham saqlanayotgan bo'lsa (Detached DOM Element), u xotirada qolaveradi. DOM ni Node.js xotirasida zaxiralashga ehtiyot bo'ling.
3. **Chrome DevTools Heap Snapshot:** Brauzeringiz nega qotayotganini tekshirish uchun Chrome DevTools -> Memory tabidan foydalanishni, Heap Snapshot olib avvalgi va keyingi holatlardagi farqni (Retained Size) solishtirishni o'rganing.
