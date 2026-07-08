# Closures

## Nazariya

### Closure Nima?

Closure — bu funksiya o'zining leksik muhitini (lexical environment) "eslab qoladigan" mexanizm. Boshqacha aytganda, funksiya yaratilgan joyidagi o'zgaruvchilarga keyinchalik ham murojaat qila oladi.

```javascript
function outer() {
  const message = "Salom";

  function inner() {
    console.log(message); // outer funksiyaning o'zgaruvchisiga murojaat
  }

  return inner;
}

const greet = outer();
greet(); // "Salom" - outer allaqachon tugagan bo'lsa ham!
```

### Leksik Muhit (Lexical Environment)

JavaScript'da har bir funksiya yaratilganda, u o'zi yaratilgan muhitga reference saqlaydi:

```javascript
// Global Environment
const globalVar = "global";

function createCounter() {
  // createCounter Environment <- Global Environment
  let count = 0;

  return function increment() {
    // increment Environment <- createCounter Environment <- Global Environment
    count++;
    return count;
  };
}
```

**Muhim:** Closure reference saqlaydi, copy emas. Ya'ni o'zgaruvchi qiymati o'zgarsa, closure yangi qiymatni ko'radi.

### Scope Chain

```javascript
const a = 1;

function first() {
  const b = 2;

  function second() {
    const c = 3;

    function third() {
      console.log(a, b, c); // 1, 2, 3 - barcha outer scope'larga kirish
    }

    return third;
  }

  return second;
}

const fn = first()();
fn(); // 1, 2, 3
```

---

## Kod Misollari

### To'g'ri: Counter Pattern

```javascript
function createCounter(initialValue = 0) {
  let count = initialValue;

  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getValue() {
      return count;
    },
    reset() {
      count = initialValue;
      return count;
    }
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.decrement()); // 11
console.log(counter.getValue());  // 11
console.log(counter.reset());     // 10

// count o'zgaruvchisiga to'g'ridan-to'g'ri kirish imkoni yo'q
// Bu data encapsulation!
```

### Noto'g'ri: Loop Variable Capture

```javascript
// XATO: Klassik closure muammo
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 3, 3, 3 - hammasi 3!
  }, 100);
}

// Nega? var function-scoped, loop tugaganda i = 3
// Barcha callback'lar BIR XUD i ga reference qiladi
```

### To'g'ri: Loop Variable Capture Yechimi

```javascript
// Yechim 1: let ishlatish (block-scoped)
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 0, 1, 2
  }, 100);
}

// Yechim 2: IIFE bilan yangi scope yaratish
for (var i = 0; i < 3; i++) {
  (function(index) {
    setTimeout(function() {
      console.log(index); // 0, 1, 2
    }, 100);
  })(i);
}

// Yechim 3: forEach ishlatish
[0, 1, 2].forEach(function(i) {
  setTimeout(function() {
    console.log(i); // 0, 1, 2
  }, 100);
});
```

### To'g'ri: Private Variables (Module Pattern)

```javascript
const userModule = (function() {
  // Private
  let users = [];
  let nextId = 1;

  function validateEmail(email) {
    return email.includes('@');
  }

  // Public API
  return {
    addUser(name, email) {
      if (!validateEmail(email)) {
        throw new Error('Invalid email');
      }
      const user = { id: nextId++, name, email };
      users.push(user);
      return user;
    },

    getUser(id) {
      return users.find(u => u.id === id);
    },

    getAllUsers() {
      return [...users]; // Copy qaytarish, original emas
    },

    get userCount() {
      return users.length;
    }
  };
})();

userModule.addUser('Ali', 'ali@example.com');
console.log(userModule.userCount); // 1
console.log(userModule.users);     // undefined - private!
```

### Noto'g'ri: Memory Leak

```javascript
// XATO: Closure katta object'ni ushlab turadi
function createHandler() {
  const hugeData = new Array(1000000).fill('x');

  return function handler(event) {
    // hugeData ishlatilmayapti, lekin closure uni ushlab turadi!
    console.log(event.type);
  };
}

const handler = createHandler();
// hugeData memory'da qoladi!
```

### To'g'ri: Memory Leak Oldini Olish

```javascript
// TO'G'RI: Faqat kerakli ma'lumotni capture qilish
function createHandler() {
  const hugeData = new Array(1000000).fill('x');
  const neededValue = hugeData.length; // Faqat kerakli qiymat

  return function handler(event) {
    console.log(`${event.type}, data size: ${neededValue}`);
  };
}

// Yoki: WeakRef ishlatish (advanced)
function createHandlerWithWeakRef() {
  const hugeData = new Array(1000000).fill('x');
  const weakRef = new WeakRef(hugeData);

  return function handler(event) {
    const data = weakRef.deref();
    if (data) {
      console.log(data.length);
    }
  };
}
```

---

## Real-World Cases

### 1. React Hooks (useState simulation)

```javascript
// React useState qanday ishlashini tushunish
function createState(initialValue) {
  let state = initialValue;
  let listeners = [];

  function getState() {
    return state;
  }

  function setState(newValue) {
    if (typeof newValue === 'function') {
      state = newValue(state);
    } else {
      state = newValue;
    }
    listeners.forEach(listener => listener(state));
  }

  function subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }

  return [getState, setState, subscribe];
}

const [getCount, setCount, subscribe] = createState(0);
subscribe(value => console.log('Count changed:', value));

setCount(1);           // "Count changed: 1"
setCount(prev => prev + 1); // "Count changed: 2"
```

### 2. Memoization / Caching

```javascript
function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      console.log('Cache hit');
      return cache.get(key);
    }

    console.log('Computing...');
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveCalculation = memoize((n) => {
  // Og'ir hisoblash simulatsiyasi
  let result = 0;
  for (let i = 0; i < n * 1000000; i++) {
    result += i;
  }
  return result;
});

console.log(expensiveCalculation(10)); // Computing... (sekin)
console.log(expensiveCalculation(10)); // Cache hit (tez)
console.log(expensiveCalculation(20)); // Computing... (sekin)
```

### 3. Event Handler with State

```javascript
function createClickTracker(element) {
  let clickCount = 0;
  let lastClickTime = null;

  function handleClick(event) {
    clickCount++;
    const now = Date.now();
    const timeSinceLastClick = lastClickTime
      ? now - lastClickTime
      : 0;

    lastClickTime = now;

    console.log(`Click #${clickCount}, interval: ${timeSinceLastClick}ms`);

    // Double-click detection
    if (timeSinceLastClick > 0 && timeSinceLastClick < 300) {
      console.log('Double click detected!');
    }
  }

  function getStats() {
    return { clickCount, lastClickTime };
  }

  function reset() {
    clickCount = 0;
    lastClickTime = null;
  }

  element.addEventListener('click', handleClick);

  return { getStats, reset };
}

// const tracker = createClickTracker(document.getElementById('btn'));
```

### 4. Currying va Partial Application

```javascript
// Currying
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3));    // 6
console.log(curriedAdd(1, 2)(3));    // 6
console.log(curriedAdd(1)(2, 3));    // 6

// Partial Application - real case
const createAPIEndpoint = curry((baseURL, version, endpoint) => {
  return `${baseURL}/api/${version}/${endpoint}`;
});

const myAPI = createAPIEndpoint('https://api.example.com');
const v1API = myAPI('v1');
const v2API = myAPI('v2');

console.log(v1API('users'));    // https://api.example.com/api/v1/users
console.log(v2API('products')); // https://api.example.com/api/v2/products
```

### 5. Function Factory

```javascript
function createValidator(rules) {
  return function validate(data) {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];

      if (rule.required && !value) {
        errors.push(`${field} is required`);
        continue;
      }

      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };
}

const validateUser = createValidator({
  username: { required: true, minLength: 3 },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { required: true, minLength: 8 }
});

console.log(validateUser({
  username: 'ab',
  email: 'invalid',
  password: '123'
}));
// { isValid: false, errors: [...] }
```

---

## Interview Savollari

### 1. Closure nima va qanday ishlaydi?

**Javob:** Closure — bu funksiya o'zining leksik muhitini "eslab qoladigan" mexanizm. Funksiya yaratilganda, u o'zi yaratilgan scope'dagi o'zgaruvchilarga reference saqlaydi. Bu reference saqlanishi tufayli, tashqi funksiya tugagandan keyin ham ichki funksiya bu o'zgaruvchilarga murojaat qila oladi.

```javascript
function outer() {
  let x = 10;
  return function inner() {
    return x; // x closure orqali "yashaydi"
  };
}
const fn = outer();
console.log(fn()); // 10
```

### 2. Bu kod nima chiqaradi va nima uchun?

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

**Javob:** `3, 3, 3` chiqadi. Sababi:
1. `var` function-scoped, block-scoped emas
2. Loop tugaganda `i = 3`
3. setTimeout callback'lari keyinroq ishga tushadi
4. Barcha callback'lar BIR XUD `i` ga reference qiladi

**Yechim:** `let` ishlatish yoki IIFE.

### 3. Private o'zgaruvchilarni closure bilan qanday yaratish mumkin?

**Javob:**
```javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance; // Private

  return {
    deposit(amount) {
      if (amount > 0) balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > 0 && amount <= balance) {
        balance -= amount;
      }
      return balance;
    },
    getBalance() {
      return balance;
    }
  };
}

const account = createBankAccount(100);
account.deposit(50);  // 150
account.balance;      // undefined - private!
```

### 4. Closure memory leak'ga olib kelishi mumkinmi?

**Javob:** Ha. Closure o'zi reference qilgan barcha o'zgaruvchilarni memory'da ushlab turadi. Agar closure katta object'ni reference qilsa va closure uzoq vaqt yashasa, bu memory leak'ga olib keladi.

```javascript
// Muammo
function createLeak() {
  const huge = new Array(1000000);
  return () => huge.length; // huge memory'da qoladi
}

// Yechim
function noLeak() {
  const huge = new Array(1000000);
  const len = huge.length; // Faqat kerakli qiymat
  return () => len;
}
```

### 5. Quyidagi kod natijasini tushuntiring:

```javascript
function createFunctions() {
  const funcs = [];
  for (let i = 0; i < 3; i++) {
    funcs.push(function() {
      return i * 2;
    });
  }
  return funcs;
}

const funcs = createFunctions();
console.log(funcs[0](), funcs[1](), funcs[2]());
```

**Javob:** `0, 2, 4` chiqadi. `let` block-scoped bo'lgani uchun, har bir iteratsiyada yangi `i` o'zgaruvchisi yaratiladi. Har bir funksiya o'zining alohida `i` qiymatini closure orqali saqlaydi.

---

## Xatolar va To'g'ri Yechim

### Xato 1: this context yo'qolishi

```javascript
// XATO
const obj = {
  name: 'Ali',
  greet() {
    setTimeout(function() {
      console.log(`Hello, ${this.name}`); // undefined!
    }, 100);
  }
};

// TO'G'RI: Arrow function
const objFixed = {
  name: 'Ali',
  greet() {
    setTimeout(() => {
      console.log(`Hello, ${this.name}`); // "Hello, Ali"
    }, 100);
  }
};

// TO'G'RI: this ni closure bilan saqlash
const objFixed2 = {
  name: 'Ali',
  greet() {
    const self = this;
    setTimeout(function() {
      console.log(`Hello, ${self.name}`); // "Hello, Ali"
    }, 100);
  }
};
```

### Xato 2: Stale Closure (React'da keng tarqalgan)

```javascript
// XATO: React useEffect'da stale closure
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1); // XATO: count doim 0!
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Bo'sh dependency array
}

// TO'G'RI: Functional update
function CounterFixed() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1); // TO'G'RI: prev doim actual
    }, 1000);
    return () => clearInterval(interval);
  }, []);
}
```

### Xato 3: Closure ichida mutation

```javascript
// XATO
function createListManager() {
  const items = [];

  return {
    add(item) {
      items.push(item);
    },
    getItems() {
      return items; // Xavfli! Tashqaridan o'zgartirish mumkin
    }
  };
}

const manager = createListManager();
manager.add('a');
const items = manager.getItems();
items.push('hacked!'); // Original list o'zgaradi!

// TO'G'RI
function createListManagerSafe() {
  const items = [];

  return {
    add(item) {
      items.push(item);
    },
    getItems() {
      return [...items]; // Copy qaytarish
    }
  };
}
```

### Xato 4: Event listener'da closure

```javascript
// XATO: Har renderda yangi handler
function addListeners() {
  const buttons = document.querySelectorAll('button');

  buttons.forEach((btn, index) => {
    // XATO: Har safar yangi funksiya
    btn.addEventListener('click', () => {
      console.log(`Button ${index} clicked`);
    });
  });
}
// 10 marta addListeners() chaqirsak = 10 ta listener har buttonga!

// TO'G'RI: Handler'larni saqlash va cleanup
function addListenersSafe() {
  const buttons = document.querySelectorAll('button');
  const handlers = [];

  buttons.forEach((btn, index) => {
    const handler = () => console.log(`Button ${index} clicked`);
    handlers.push({ btn, handler });
    btn.addEventListener('click', handler);
  });

  // Cleanup funksiyasi
  return function cleanup() {
    handlers.forEach(({ btn, handler }) => {
      btn.removeEventListener('click', handler);
    });
  };
}
```

### Xato 5: Async loop'da closure

```javascript
// XATO
async function fetchAllUsers(ids) {
  const results = [];

  for (var i = 0; i < ids.length; i++) {
    const response = await fetch(`/api/users/${ids[i]}`);
    results.push({ index: i, data: await response.json() });
    // i qiymati to'g'ri bo'ladi, lekin var ishlatish xavfli
  }

  return results;
}

// TO'G'RI: let va modern patterns
async function fetchAllUsersSafe(ids) {
  const results = await Promise.all(
    ids.map(async (id, index) => {
      const response = await fetch(`/api/users/${id}`);
      return { index, data: await response.json() };
    })
  );

  return results;
}
```
