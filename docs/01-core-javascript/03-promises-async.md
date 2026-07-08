# Promises va Async/Await

## Nazariya

### Promise Nima?

Promise — bu asinxron operatsiya natijasini ifodalovchi ob'ekt. U uchta holatdan birida bo'ladi:

1. **Pending** — boshlang'ich holat, natija hali ma'lum emas
2. **Fulfilled** — operatsiya muvaffaqiyatli tugadi
3. **Rejected** — operatsiya xato bilan tugadi

```javascript
const promise = new Promise((resolve, reject) => {
  // Asinxron operatsiya
  setTimeout(() => {
    const success = Math.random() > 0.5;
    if (success) {
      resolve('Muvaffaqiyat!');
    } else {
      reject(new Error('Xato yuz berdi'));
    }
  }, 1000);
});

promise
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

### Promise State Machine

```
                    ┌─────────────┐
                    │   PENDING   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ↓            │            ↓
       ┌────────────┐      │      ┌────────────┐
       │ FULFILLED  │      │      │  REJECTED  │
       │ (resolved) │      │      │            │
       └────────────┘      │      └────────────┘
                           │
              SETTLED (o'zgarmas holat)
```

**Muhim:** Promise bir marta settled bo'lgandan keyin, holati HECH QACHON o'zgarmaydi.

### Promise Chaining

Har bir `.then()` YANGI Promise qaytaradi:

```javascript
fetch('/api/user/1')
  .then(response => {
    // Promise<Response> -> Promise<Object>
    return response.json();
  })
  .then(user => {
    // Promise<Object> -> Promise<Response>
    return fetch(`/api/posts?userId=${user.id}`);
  })
  .then(response => response.json())
  .then(posts => {
    console.log(posts);
  })
  .catch(error => {
    // Barcha xatolarni tutish
    console.error('Error:', error);
  });
```

### Async/Await

`async/await` — Promise'lar ustida sintaktik shakar. Asinxron kodni sinxron ko'rinishda yozish imkonini beradi.

```javascript
async function fetchUserPosts(userId) {
  try {
    const userResponse = await fetch(`/api/user/${userId}`);
    const user = await userResponse.json();

    const postsResponse = await fetch(`/api/posts?userId=${user.id}`);
    const posts = await postsResponse.json();

    return posts;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### Async Function Qaytarish Qiymati

`async` funksiya DOIM Promise qaytaradi:

```javascript
async function returnNumber() {
  return 42;
}

// Teng
function returnNumberPromise() {
  return Promise.resolve(42);
}

returnNumber().then(n => console.log(n)); // 42
```

---

## Kod Misollari

### To'g'ri: Promise.all — Parallel Execution

```javascript
async function fetchMultipleUsers(userIds) {
  // XATO: Sequential (sekin)
  // for (const id of userIds) {
  //   const user = await fetchUser(id);
  //   users.push(user);
  // }

  // TO'G'RI: Parallel (tez)
  const userPromises = userIds.map(id => fetchUser(id));
  const users = await Promise.all(userPromises);

  return users;
}

// Promise.all xususiyatlari:
// - Barcha Promise'lar fulfill bo'lganda resolve
// - BITTA Promise reject bo'lsa, HAMMASI reject
// - Natija tartibi kirish tartibiga mos
```

### To'g'ri: Promise.allSettled — Har Bir Natijani Olish

```javascript
async function fetchUsersWithStatus(userIds) {
  const results = await Promise.allSettled(
    userIds.map(id => fetchUser(id))
  );

  return results.map((result, index) => ({
    userId: userIds[index],
    status: result.status,
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null
  }));
}

// Promise.allSettled xususiyatlari:
// - Barcha Promise'lar settled bo'lganda resolve
// - HECH QACHON reject bo'lmaydi
// - Har bir natija: { status: 'fulfilled'|'rejected', value|reason }
```

### To'g'ri: Promise.race — Birinchi Natija

```javascript
async function fetchWithTimeout(url, timeoutMs) {
  const fetchPromise = fetch(url);

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  // Qaysi biri birinchi tugasa
  return Promise.race([fetchPromise, timeoutPromise]);
}

// Ishlatish
try {
  const response = await fetchWithTimeout('/api/data', 5000);
  const data = await response.json();
} catch (error) {
  if (error.message.includes('timeout')) {
    console.log('Request timed out');
  }
}
```

### To'g'ri: Promise.any — Birinchi Muvaffaqiyat

```javascript
async function fetchFromMirrors(resource) {
  const mirrors = [
    'https://cdn1.example.com',
    'https://cdn2.example.com',
    'https://cdn3.example.com'
  ];

  try {
    // Birinchi muvaffaqiyatli javob
    const response = await Promise.any(
      mirrors.map(mirror => fetch(`${mirror}/${resource}`))
    );
    return response;
  } catch (error) {
    // AggregateError - barcha Promise'lar reject bo'ldi
    console.error('All mirrors failed:', error.errors);
    throw error;
  }
}

// Promise.any xususiyatlari:
// - Birinchi fulfilled Promise'ni qaytaradi
// - Barcha reject bo'lsa, AggregateError
```

### To'g'ri: Sequential vs Parallel

```javascript
// Sequential — har biri ketma-ket
async function sequential(urls) {
  const results = [];
  for (const url of urls) {
    const response = await fetch(url);
    results.push(await response.json());
  }
  return results;
}

// Parallel — hammasi bir vaqtda
async function parallel(urls) {
  const responses = await Promise.all(
    urls.map(url => fetch(url))
  );
  return Promise.all(responses.map(r => r.json()));
}

// Controlled Concurrency — chegaralangan parallellik
async function controlledParallel(urls, concurrency = 3) {
  const results = [];
  const executing = [];

  for (const url of urls) {
    const promise = fetch(url).then(r => r.json());
    results.push(promise);

    if (urls.length >= concurrency) {
      const e = promise.then(() => {
        executing.splice(executing.indexOf(e), 1);
      });
      executing.push(e);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(results);
}
```

### Noto'g'ri: Unhandled Rejection

```javascript
// XATO: Xato tutilmagan
async function badFetch() {
  const response = await fetch('/api/data');
  return response.json();
}

badFetch(); // Agar xato bo'lsa, UnhandledPromiseRejection

// TO'G'RI: Har doim xatoni tutish
async function goodFetch() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

// Yoki chaqiruvchi tomonida
goodFetch()
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### To'g'ri: Retry Logic

```javascript
async function fetchWithRetry(url, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2 // Exponential backoff multiplier
  } = options;

  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(backoff, attempt);
        console.log(`Retry ${attempt + 1} after ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} retries: ${lastError.message}`);
}

// Ishlatish
const data = await fetchWithRetry('/api/data', {
  maxRetries: 5,
  delay: 500,
  backoff: 2
});
```

---

## Real-World Cases

### 1. API Client with Error Handling

```javascript
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);

      // HTTP error handling
      if (!response.ok) {
        const error = await this.parseError(response);
        throw error;
      }

      // Empty response handling
      const text = await response.text();
      return text ? JSON.parse(text) : null;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      throw error;
    }
  }

  async parseError(response) {
    try {
      const body = await response.json();
      const error = new Error(body.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.body = body;
      return error;
    } catch {
      return new Error(`HTTP ${response.status}`);
    }
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Ishlatish
const api = new APIClient('https://api.example.com');

try {
  const users = await api.get('/users');
  const newUser = await api.post('/users', { name: 'Ali' });
} catch (error) {
  if (error.status === 401) {
    redirectToLogin();
  } else if (error.status === 404) {
    showNotFound();
  } else {
    showError(error.message);
  }
}
```

### 2. Cancellable Requests with AbortController

```javascript
class CancellableRequest {
  constructor() {
    this.controller = null;
  }

  async fetch(url, options = {}) {
    // Oldingi so'rovni bekor qilish
    if (this.controller) {
      this.controller.abort();
    }

    this.controller = new AbortController();

    try {
      const response = await fetch(url, {
        ...options,
        signal: this.controller.signal
      });

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled');
        return null;
      }
      throw error;
    }
  }

  cancel() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }
}

// Search input uchun ishlatish
const searchRequest = new CancellableRequest();

searchInput.addEventListener('input', async (e) => {
  const query = e.target.value;

  if (query.length < 3) {
    return;
  }

  // Har yangi input oldingi so'rovni bekor qiladi
  const results = await searchRequest.fetch(`/api/search?q=${query}`);

  if (results) {
    displayResults(results);
  }
});
```

### 3. Promise-based Queue

```javascript
class AsyncQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

// Ishlatish
const uploadQueue = new AsyncQueue(3); // 3 ta parallel upload

async function uploadFiles(files) {
  const results = await Promise.all(
    files.map(file =>
      uploadQueue.add(() => uploadFile(file))
    )
  );

  return results;
}
```

### 4. Polling with Async/Await

```javascript
async function pollForResult(jobId, options = {}) {
  const {
    interval = 1000,
    timeout = 30000,
    checkFn = (result) => result.status === 'completed'
  } = options;

  const startTime = Date.now();

  while (true) {
    const result = await fetch(`/api/jobs/${jobId}`).then(r => r.json());

    if (checkFn(result)) {
      return result;
    }

    if (Date.now() - startTime > timeout) {
      throw new Error('Polling timeout');
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

// Ishlatish
const job = await fetch('/api/start-job', { method: 'POST' });
const jobId = job.id;

try {
  const result = await pollForResult(jobId, {
    interval: 2000,
    timeout: 60000,
    checkFn: (r) => r.status === 'done' || r.status === 'failed'
  });

  if (result.status === 'done') {
    console.log('Success:', result.data);
  } else {
    console.log('Failed:', result.error);
  }
} catch (error) {
  console.log('Timeout waiting for job');
}
```

### 5. Promise.withResolvers (ES2024)

```javascript
// Yangi ES2024 feature
function createDeferredPromise() {
  // ES2024 dan oldin
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };

  // ES2024 bilan
  // return Promise.withResolvers();
}

// Ishlatish: Event-based async
class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  once(event) {
    const { promise, resolve } = createDeferredPromise();

    const handler = (data) => {
      this.off(event, handler);
      resolve(data);
    };

    this.on(event, handler);
    return promise;
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  off(event, handler) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    }
  }

  emit(event, data) {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
}

// Ishlatish
const emitter = new EventEmitter();

async function waitForUser() {
  const user = await emitter.once('user-login');
  console.log('User logged in:', user);
}

waitForUser();
emitter.emit('user-login', { id: 1, name: 'Ali' });
```

---

## Interview Savollari

### 1. Promise.all va Promise.allSettled farqi nima?

**Javob:**

| Xususiyat | Promise.all | Promise.allSettled |
|-----------|------------|-------------------|
| Bitta reject bo'lsa | Darhol reject | Davom etadi |
| Natija | Qiymatlar massivi | Status ob'ektlari massivi |
| Qachon ishlatish | Barcha kerak, bitta xato = fail | Har bir natija kerak |

```javascript
// Promise.all - fail-fast
const result = await Promise.all([
  fetch('/api/1'),
  fetch('/api/2') // Bu fail bo'lsa, hammasi fail
]);

// Promise.allSettled - har bir natijani bilish
const results = await Promise.allSettled([
  fetch('/api/1'),
  fetch('/api/2')
]);
// results: [
//   { status: 'fulfilled', value: Response },
//   { status: 'rejected', reason: Error }
// ]
```

### 2. Async/await ni try/catch siz ishlatish mumkinmi?

**Javob:** Ha, lekin xavfli. Xatoni `.catch()` bilan yoki yuqori darajadagi handler bilan tutish kerak.

```javascript
// Variant 1: .catch() chaining
const data = await fetchData().catch(err => {
  console.error(err);
  return null;
});

// Variant 2: Wrapper function
async function safeAsync(promise) {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error];
  }
}

const [data, error] = await safeAsync(fetchData());
if (error) {
  console.error(error);
}
```

### 3. Bu kod qanday ishlaydi?

```javascript
async function test() {
  console.log(1);
  await Promise.resolve();
  console.log(2);
}

console.log('a');
test();
console.log('b');
```

**Javob:** `a, 1, b, 2`

Tushuntirish:
1. `'a'` chiqadi (sinxron)
2. `test()` chaqiriladi, `1` chiqadi
3. `await` ni ko'rganda funksiya to'xtaydi, qolgan qismi microtask sifatida schedule qilinadi
4. `'b'` chiqadi (sinxron davom)
5. Call stack bo'shaydi, microtask bajariladi
6. `2` chiqadi

### 4. Promise constructor ichida async/await ishlatish to'g'rimi?

**Javob:** Yomon amaliyot. Anti-pattern hisoblanadi.

```javascript
// XATO
const promise = new Promise(async (resolve, reject) => {
  try {
    const data = await fetchData();
    resolve(data);
  } catch (error) {
    reject(error); // Bu yerda xato tutilmasligi mumkin!
  }
});

// TO'G'RI - async funksiya o'zi Promise qaytaradi
async function getData() {
  return await fetchData();
}

// Yoki shunchaki
function getData() {
  return fetchData();
}
```

### 5. Qanday qilib Promise'ni timeout bilan ishlatish mumkin?

**Javob:**

```javascript
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });

  return Promise.race([promise, timeout]);
}

// AbortController bilan (to'g'riroq)
async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## Xatolar va To'g'ri Yechim

### Xato 1: await ni loop ichida ketma-ket ishlatish

```javascript
// XATO: Sequential (sekin)
async function fetchAll(ids) {
  const results = [];
  for (const id of ids) {
    const data = await fetchById(id); // Har biri kutadi
    results.push(data);
  }
  return results;
}

// TO'G'RI: Parallel (tez)
async function fetchAllFast(ids) {
  return Promise.all(ids.map(id => fetchById(id)));
}
```

### Xato 2: Promise executor ichida throw

```javascript
// XATO: Bu tutilmaydi!
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    throw new Error('Xato'); // Uncaught error!
  }, 100);
});

// TO'G'RI: reject() ishlatish
const promiseFixed = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error('Xato'));
  }, 100);
});
```

### Xato 3: async funksiya ichida callback

```javascript
// XATO: async array metodlarida ishlamaydi
async function processItems(items) {
  items.forEach(async (item) => {
    await processItem(item); // Bu kutilmaydi!
  });
  console.log('Done'); // Oldin chiqadi!
}

// TO'G'RI: for...of yoki Promise.all
async function processItemsFixed(items) {
  // Sequential
  for (const item of items) {
    await processItem(item);
  }

  // Parallel
  await Promise.all(items.map(item => processItem(item)));

  console.log('Done'); // To'g'ri vaqtda
}
```

### Xato 4: .catch() dan keyin davom etish

```javascript
// XATO: catch dan keyin chain davom etadi
fetch('/api/data')
  .catch(err => console.error(err)) // undefined qaytaradi
  .then(data => data.json()); // TypeError: cannot read json of undefined

// TO'G'RI: catch da to'g'ri qiymat qaytarish yoki throw
fetch('/api/data')
  .catch(err => {
    console.error(err);
    throw err; // Chainni to'xtatish
  })
  .then(data => data.json());

// Yoki
fetch('/api/data')
  .then(data => data.json())
  .catch(err => {
    console.error(err);
    return { error: true, message: err.message };
  });
```

### Xato 5: finally da return

```javascript
// XATO: finally dagi return promise qiymatini o'zgartiradi
async function badFinally() {
  try {
    return 'success';
  } finally {
    return 'finally'; // Bu qaytadi!
  }
}

// await badFinally() => 'finally'

// TO'G'RI: finally da cleanup, return emas
async function goodFinally() {
  try {
    return 'success';
  } finally {
    cleanupResources(); // Side effect OK
    // return YOZMASLIK
  }
}
```

### Xato 6: Promise.resolve bilan object

```javascript
// XATO tushuncha
const obj = { then: (resolve) => resolve(42) };
const promise = Promise.resolve(obj);

// obj.then mavjud bo'lgani uchun, u thenable sifatida
// ko'riladi va unwrap qilinadi!
await promise; // 42, obj emas!

// TO'G'RI: Agar object kerak bo'lsa
const promiseFixed = Promise.resolve().then(() => obj);
await promiseFixed; // { then: ... }
```

### Xato 7: Bir nechta await ketma-ket

```javascript
// XATO: Har biri alohida kutadi
async function getData() {
  const user = await fetchUser();
  const posts = await fetchPosts(); // user tugaguncha kutadi
  const comments = await fetchComments(); // posts tugaguncha kutadi
  return { user, posts, comments };
}

// TO'G'RI: Parallel
async function getDataFast() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  return { user, posts, comments };
}

// Agar ba'zilari bog'liq bo'lsa
async function getDataMixed() {
  const user = await fetchUser(); // Birinchi user kerak

  const [posts, friends] = await Promise.all([
    fetchPosts(user.id), // user.id kerak
    fetchFriends(user.id)
  ]);

  return { user, posts, friends };
}
```
