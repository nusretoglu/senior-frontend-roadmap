# this Binding

## Nazariya

### this Nima?

`this` — JavaScript'da kontekstni bildiruvchi maxsus kalit so'z. Uning qiymati funksiya QANDAY chaqirilganiga bog'liq, QAYERDA aniqlangan bo'lishiga emas.

```javascript
function showThis() {
  console.log(this);
}

const obj = {
  name: 'Ali',
  show: showThis
};

showThis();    // window (browser) yoki undefined (strict mode)
obj.show();    // { name: 'Ali', show: f } - obj
```

### 4 Ta Binding Qoidasi

JavaScript'da `this` qiymati 4 ta qoidaga asosan aniqlanadi (ustuvorlik tartibi bo'yicha):

#### 1. new Binding (Eng yuqori ustuvorlik)

```javascript
function User(name) {
  // new bilan chaqirilganda:
  // this = {} (yangi ob'ekt)
  this.name = name;
  // return this; (avtomatik)
}

const user = new User('Ali');
console.log(user.name); // "Ali"
```

#### 2. Explicit Binding (call, apply, bind)

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: 'Ali' };

// call - argumentlar alohida
greet.call(person, 'Salom', '!'); // "Salom, Ali!"

// apply - argumentlar massiv sifatida
greet.apply(person, ['Hello', '?']); // "Hello, Ali?"

// bind - yangi funksiya qaytaradi
const boundGreet = greet.bind(person, 'Hi');
boundGreet('!!!'); // "Hi, Ali!!!"
```

#### 3. Implicit Binding (Method chaqiruvi)

```javascript
const obj = {
  name: 'Ali',
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

obj.greet(); // "Hello, Ali" - this = obj

// EHTIYOT: Reference yo'qolishi
const greetFn = obj.greet;
greetFn(); // "Hello, undefined" - this = global/undefined
```

#### 4. Default Binding (Eng past ustuvorlik)

```javascript
function showThis() {
  console.log(this);
}

showThis(); // window (non-strict) yoki undefined (strict mode)

// Strict mode
'use strict';
function showThisStrict() {
  console.log(this);
}
showThisStrict(); // undefined
```

### Arrow Functions va this

Arrow function'lar o'z `this`'iga ega emas. Ular tashqi (lexical) scope'dan `this`'ni oladi.

```javascript
const obj = {
  name: 'Ali',

  // Oddiy funksiya
  regularMethod() {
    console.log(this.name); // "Ali"

    setTimeout(function() {
      console.log(this.name); // undefined - this = window
    }, 100);

    setTimeout(() => {
      console.log(this.name); // "Ali" - lexical this
    }, 100);
  },

  // Arrow method
  arrowMethod: () => {
    console.log(this.name); // undefined - tashqi scope'dan
  }
};
```

### this Ustuvorligi

```
new > call/apply/bind > method > default

1. new bilan chaqirildimi? → this = yangi ob'ekt
2. call/apply/bind bilan? → this = berilgan ob'ekt
3. Ob'ekt method sifatida? → this = ob'ekt
4. Default → this = global/undefined
```

---

## Kod Misollari

### To'g'ri: Event Handler'larda this

```javascript
class Button {
  constructor(element) {
    this.element = element;
    this.clickCount = 0;

    // XATO: this yo'qoladi
    // this.element.addEventListener('click', this.handleClick);

    // TO'G'RI: Arrow function
    this.element.addEventListener('click', (e) => this.handleClick(e));

    // Yoki: bind
    this.element.addEventListener('click', this.handleClick.bind(this));

    // Yoki: class field arrow function
    // handleClick = (e) => { ... }
  }

  handleClick(event) {
    this.clickCount++;
    console.log(`Clicked ${this.clickCount} times`);
  }
}
```

### To'g'ri: Method Chaining

```javascript
class Calculator {
  constructor(initialValue = 0) {
    this.value = initialValue;
  }

  add(n) {
    this.value += n;
    return this; // Chaining uchun
  }

  subtract(n) {
    this.value -= n;
    return this;
  }

  multiply(n) {
    this.value *= n;
    return this;
  }

  divide(n) {
    if (n !== 0) {
      this.value /= n;
    }
    return this;
  }

  result() {
    return this.value;
  }
}

const calc = new Calculator(10)
  .add(5)
  .multiply(2)
  .subtract(10)
  .divide(2)
  .result();

console.log(calc); // 10
```

### Noto'g'ri: Callback'da this yo'qolishi

```javascript
// XATO
class DataFetcher {
  constructor() {
    this.data = [];
  }

  fetch(url) {
    fetch(url)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        this.data = data; // TypeError: Cannot set property 'data' of undefined
      });
  }
}

// TO'G'RI: Arrow function
class DataFetcherFixed {
  constructor() {
    this.data = [];
  }

  fetch(url) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        this.data = data; // this to'g'ri
      });
  }

  // Yoki async/await
  async fetchAsync(url) {
    const response = await fetch(url);
    this.data = await response.json();
  }
}
```

### To'g'ri: Partial Application with bind

```javascript
function multiply(a, b) {
  return a * b;
}

// Partial application
const double = multiply.bind(null, 2);
const triple = multiply.bind(null, 3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// Real-world misol: Logging
function log(level, message, data) {
  console.log(`[${level}] ${message}`, data || '');
}

const logError = log.bind(null, 'ERROR');
const logInfo = log.bind(null, 'INFO');
const logDebug = log.bind(null, 'DEBUG');

logError('Something went wrong', { code: 500 });
logInfo('User logged in');
logDebug('Variable value', { x: 42 });
```

### To'g'ri: call/apply Practical Usage

```javascript
// Array metodlarini array-like ob'ektlarda ishlatish
function convertArguments() {
  // arguments array-like, lekin array emas
  const args = Array.prototype.slice.call(arguments);
  // Modern: const args = Array.from(arguments);
  // Yoki: const args = [...arguments];

  return args.map(x => x * 2);
}

console.log(convertArguments(1, 2, 3)); // [2, 4, 6]

// Math.max bilan apply
const numbers = [5, 2, 9, 1, 7];
const max = Math.max.apply(null, numbers); // 9
// Modern: Math.max(...numbers)

// Object method borrowing
const arrayLike = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3
};

const arr = Array.prototype.map.call(arrayLike, x => x.toUpperCase());
console.log(arr); // ['A', 'B', 'C']
```

### To'g'ri: Class Field Arrow Functions

```javascript
class Component {
  state = { count: 0 };

  // Arrow function class field - this avtomatik bind
  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  decrement = () => {
    this.setState({ count: this.state.count - 1 });
  };

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  render() {
    console.log('Count:', this.state.count);
  }
}

const comp = new Component();

// Event handler sifatida ishlatish mumkin
document.getElementById('inc').addEventListener('click', comp.increment);
document.getElementById('dec').addEventListener('click', comp.decrement);
// this to'g'ri ishlaydi!
```

---

## Real-World Cases

### 1. Vue/React Component Methods

```javascript
// Vue 3 Composition API
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);

    // Arrow function - this kerak emas
    const increment = () => {
      count.value++;
    };

    return { count, increment };
  }
};

// Vue 2 Options API
export default {
  data() {
    return { count: 0 };
  },
  methods: {
    // Oddiy funksiya - this = component instance
    increment() {
      this.count++;
    },

    // XATO: Arrow function
    // incrementBad: () => {
    //   this.count++; // undefined!
    // }
  }
};

// React Class Component
class Counter extends React.Component {
  state = { count: 0 };

  // Arrow function - this avtomatik bind
  increment = () => {
    this.setState(prev => ({ count: prev.count + 1 }));
  };

  render() {
    return (
      <button onClick={this.increment}>
        {this.state.count}
      </button>
    );
  }
}
```

### 2. Event Delegation

```javascript
class TodoList {
  constructor(container) {
    this.container = container;
    this.todos = [];

    // Event delegation - bitta handler
    this.container.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    const target = event.target;

    if (target.classList.contains('todo-delete')) {
      const todoId = target.closest('.todo-item').dataset.id;
      this.deleteTodo(todoId);
    }

    if (target.classList.contains('todo-toggle')) {
      const todoId = target.closest('.todo-item').dataset.id;
      this.toggleTodo(todoId);
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.render();
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.render();
    }
  }

  render() {
    this.container.innerHTML = this.todos.map(todo => `
      <div class="todo-item" data-id="${todo.id}">
        <span class="${todo.completed ? 'completed' : ''}">${todo.text}</span>
        <button class="todo-toggle">Toggle</button>
        <button class="todo-delete">Delete</button>
      </div>
    `).join('');
  }
}
```

### 3. Mixin with this

```javascript
const timerMixin = {
  startTimer(callback, interval) {
    this._timerId = setInterval(() => {
      callback.call(this); // this ni saqlash
    }, interval);
    return this;
  },

  stopTimer() {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
    return this;
  }
};

const counterMixin = {
  initCounter(initial = 0) {
    this.count = initial;
    return this;
  },

  increment() {
    this.count++;
    return this;
  },

  decrement() {
    this.count--;
    return this;
  }
};

class AutoCounter {
  constructor() {
    Object.assign(this, timerMixin, counterMixin);
    this.initCounter(0);
  }

  start() {
    this.startTimer(function() {
      this.increment();
      console.log('Count:', this.count);
    }, 1000);
  }

  stop() {
    this.stopTimer();
  }
}

const counter = new AutoCounter();
counter.start();
setTimeout(() => counter.stop(), 5000);
```

### 4. Proxy with this

```javascript
function createObservable(target, onChange) {
  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];
      obj[prop] = value;

      // onChange callback'da this = proxy
      onChange.call(target, prop, value, oldValue);

      return true;
    },

    get(obj, prop) {
      const value = obj[prop];

      // Method bo'lsa, this ni to'g'ri bind qilish
      if (typeof value === 'function') {
        return value.bind(obj);
      }

      return value;
    }
  });
}

const user = createObservable(
  { name: 'Ali', age: 25 },
  function(prop, newVal, oldVal) {
    console.log(`${prop}: ${oldVal} → ${newVal}`);
    console.log('this.name:', this.name);
  }
);

user.name = 'Vali'; // "name: Ali → Vali", "this.name: Vali"
user.age = 26;      // "age: 25 → 26", "this.name: Vali"
```

### 5. Function Composition with Context

```javascript
function compose(...fns) {
  return function(initialValue) {
    return fns.reduceRight((value, fn) => {
      return fn.call(this, value); // this ni saqlash
    }, initialValue);
  };
}

function pipe(...fns) {
  return function(initialValue) {
    return fns.reduce((value, fn) => {
      return fn.call(this, value);
    }, initialValue);
  };
}

const calculator = {
  multiplier: 2,

  double(x) {
    return x * this.multiplier;
  },

  addTen(x) {
    return x + 10;
  },

  square(x) {
    return x * x;
  }
};

const process = pipe(
  calculator.double,
  calculator.addTen,
  calculator.square
).bind(calculator);

console.log(process(5)); // ((5 * 2) + 10)^2 = 400
```

---

## Interview Savollari

### 1. JavaScript'da this qanday aniqlanadi?

**Javob:** `this` qiymati funksiya chaqirilish usuliga bog'liq:

1. **new binding** — yangi ob'ekt
2. **explicit binding** (call/apply/bind) — berilgan ob'ekt
3. **implicit binding** (method) — ob'ekt
4. **default binding** — global/undefined

Arrow function'lar tashqi scope'dan `this` oladi.

### 2. call, apply, bind farqi nima?

**Javob:**

| Method | Natija | Argumentlar |
|--------|--------|-------------|
| call | Darhol chaqiradi | Alohida: fn.call(ctx, a, b, c) |
| apply | Darhol chaqiradi | Massiv: fn.apply(ctx, [a, b, c]) |
| bind | Yangi funksiya qaytaradi | Alohida: fn.bind(ctx, a, b) |

```javascript
function greet(a, b) {
  console.log(`${a} ${this.name} ${b}`);
}

const obj = { name: 'Ali' };

greet.call(obj, 'Hello', '!');  // Darhol: "Hello Ali !"
greet.apply(obj, ['Hi', '?']); // Darhol: "Hi Ali ?"

const bound = greet.bind(obj, 'Hey');
bound('!!!'); // Keyinroq: "Hey Ali !!!"
```

### 3. Bu kod nima chiqaradi?

```javascript
const obj = {
  name: 'Ali',
  greet: function() {
    console.log(this.name);
  },
  greetArrow: () => {
    console.log(this.name);
  }
};

obj.greet();       // ?
obj.greetArrow();  // ?

const greet = obj.greet;
greet();           // ?
```

**Javob:**
- `obj.greet()` — "Ali" (implicit binding)
- `obj.greetArrow()` — undefined (arrow function, tashqi scope = global)
- `greet()` — undefined (default binding, reference yo'qoldi)

### 4. Arrow function'da call/apply/bind ishlaydi mi?

**Javob:** Yo'q, arrow function'ning `this`'ini o'zgartirib bo'lmaydi.

```javascript
const arrow = () => console.log(this);

const obj = { name: 'Ali' };

arrow.call(obj);  // window/undefined - o'zgarmadi
arrow.apply(obj); // window/undefined
const bound = arrow.bind(obj);
bound();          // window/undefined
```

Arrow function `this`'ni yaratilgan paytda lexical scope'dan oladi va o'zgarmaydi.

### 5. Class method'ni callback sifatida qanday ishlatish mumkin?

**Javob:** Uchta usul bor:

```javascript
class Counter {
  count = 0;

  // 1. Arrow function class field
  increment = () => {
    this.count++;
  };

  // 2. Constructor'da bind
  constructor() {
    this.decrement = this.decrement.bind(this);
  }

  decrement() {
    this.count--;
  }

  // 3. Chaqiruvda arrow function
  getHandler() {
    return (e) => this.handleEvent(e);
  }

  handleEvent(e) {
    console.log(this.count, e);
  }
}

const counter = new Counter();
document.addEventListener('click', counter.increment); // Ishlaydi
document.addEventListener('click', counter.decrement); // Ishlaydi
```

---

## Xatolar va To'g'ri Yechim

### Xato 1: setTimeout callback'da this

```javascript
// XATO
const user = {
  name: 'Ali',
  greetLater() {
    setTimeout(function() {
      console.log(`Hello, ${this.name}`);
    }, 1000);
  }
};

user.greetLater(); // "Hello, undefined"

// TO'G'RI: Arrow function
const userFixed = {
  name: 'Ali',
  greetLater() {
    setTimeout(() => {
      console.log(`Hello, ${this.name}`);
    }, 1000);
  }
};

// Yoki: bind
const userFixed2 = {
  name: 'Ali',
  greetLater() {
    setTimeout(function() {
      console.log(`Hello, ${this.name}`);
    }.bind(this), 1000);
  }
};

// Yoki: self/that pattern (eski usul)
const userFixed3 = {
  name: 'Ali',
  greetLater() {
    const self = this;
    setTimeout(function() {
      console.log(`Hello, ${self.name}`);
    }, 1000);
  }
};
```

### Xato 2: forEach/map callback'da this

```javascript
// XATO
const processor = {
  multiplier: 2,

  process(arr) {
    return arr.map(function(x) {
      return x * this.multiplier; // TypeError!
    });
  }
};

// TO'G'RI: Arrow function
const processorFixed = {
  multiplier: 2,

  process(arr) {
    return arr.map(x => x * this.multiplier);
  }
};

// Yoki: thisArg parametri
const processorFixed2 = {
  multiplier: 2,

  process(arr) {
    return arr.map(function(x) {
      return x * this.multiplier;
    }, this); // thisArg
  }
};
```

### Xato 3: Destructuring method

```javascript
// XATO
const api = {
  baseURL: 'https://api.example.com',

  get(endpoint) {
    return fetch(`${this.baseURL}${endpoint}`);
  }
};

const { get } = api;
get('/users'); // TypeError: Cannot read baseURL of undefined

// TO'G'RI: bind ishlatish
const { get: boundGet } = {
  get: api.get.bind(api)
};

// Yoki: wrapper
const { get: wrappedGet } = {
  get: (endpoint) => api.get(endpoint)
};
```

### Xato 4: Object method'ni arrow function qilish

```javascript
// XATO
const counter = {
  count: 0,

  // Arrow function method
  increment: () => {
    this.count++; // this = global, count yo'q
  }
};

counter.increment();
console.log(counter.count); // 0 - o'zgarmadi!

// TO'G'RI: Oddiy funksiya
const counterFixed = {
  count: 0,

  increment() {
    this.count++;
  }
};
```

### Xato 5: Prototype method'ni arrow function qilish

```javascript
// XATO
function User(name) {
  this.name = name;
}

User.prototype.greet = () => {
  console.log(`Hi, ${this.name}`);
};

const user = new User('Ali');
user.greet(); // "Hi, undefined"

// TO'G'RI
User.prototype.greet = function() {
  console.log(`Hi, ${this.name}`);
};
```

### Xato 6: this bilan IIFE

```javascript
// XATO
const module = {
  name: 'MyModule',

  init: (function() {
    console.log(`Initializing ${this.name}`);
  })()
};

// IIFE darhol chaqiriladi, this = global

// TO'G'RI: init ni method qilish
const moduleFixed = {
  name: 'MyModule',

  init() {
    console.log(`Initializing ${this.name}`);
  }
};

moduleFixed.init();

// Yoki: function expression
const moduleFixed2 = (function() {
  const name = 'MyModule';

  return {
    name,
    init() {
      console.log(`Initializing ${this.name}`);
    }
  };
})();
```

### Xato 7: Nested function'da this

```javascript
// XATO
const obj = {
  value: 42,

  getValue() {
    function innerFunction() {
      return this.value; // undefined
    }
    return innerFunction();
  }
};

console.log(obj.getValue()); // undefined

// TO'G'RI: Arrow function
const objFixed = {
  value: 42,

  getValue() {
    const innerFunction = () => {
      return this.value;
    };
    return innerFunction();
  }
};

// Yoki: call/apply
const objFixed2 = {
  value: 42,

  getValue() {
    function innerFunction() {
      return this.value;
    }
    return innerFunction.call(this);
  }
};

// Yoki: self pattern
const objFixed3 = {
  value: 42,

  getValue() {
    const self = this;
    function innerFunction() {
      return self.value;
    }
    return innerFunction();
  }
};
```
