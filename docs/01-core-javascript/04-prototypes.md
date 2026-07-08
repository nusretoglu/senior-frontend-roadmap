# Prototypes

## Nazariya

### Prototype Nima?

JavaScript'da har bir ob'ekt maxfiy `[[Prototype]]` xususiyatiga ega. Bu xususiyat boshqa ob'ektga yoki `null`ga ishora qiladi. Ob'ektdan xususiyat o'qilganda, agar u ob'ektda topilmasa, JavaScript avtomatik ravishda prototype chain bo'ylab qidiradi.

```javascript
const animal = {
  eats: true,
  walk() {
    console.log('Animal walks');
  }
};

const rabbit = {
  jumps: true,
  __proto__: animal // animal ni prototype sifatida o'rnatish
};

console.log(rabbit.jumps); // true (o'zining xususiyati)
console.log(rabbit.eats);  // true (prototype'dan meros)
rabbit.walk();             // "Animal walks" (prototype'dan meros)
```

### Prototype Chain

```
rabbit → animal → Object.prototype → null
   ↓        ↓            ↓
 jumps    eats     toString, hasOwnProperty, ...
```

```javascript
const rabbit = { jumps: true };

// Prototype chain tekshirish
console.log(rabbit.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__); // null

// Xususiyat qidirish tartibi:
// 1. rabbit.jumps → topildi ✓
// 2. rabbit.toString → rabbit'da yo'q → Object.prototype'da topildi ✓
// 3. rabbit.fly → hech qayerda yo'q → undefined
```

### Constructor Function va prototype

```javascript
function User(name) {
  this.name = name;
}

User.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`);
};

const user1 = new User('Ali');
const user2 = new User('Vali');

// Prototype chain:
// user1 → User.prototype → Object.prototype → null

user1.sayHi(); // "Hi, I'm Ali"
user2.sayHi(); // "Hi, I'm Vali"

// Muhim: sayHi BIR MARTA xotiraga yoziladi
// Barcha instance'lar uni prototype orqali share qiladi
console.log(user1.sayHi === user2.sayHi); // true
```

### `new` Operatori Ichki Ishlashi

```javascript
function User(name) {
  // new chaqirilganda:
  // 1. this = {}; (yangi bo'sh ob'ekt)
  // 2. this.__proto__ = User.prototype;

  this.name = name;

  // 3. return this; (avtomatik)
}

// Qo'lda simulatsiya
function createUser(name) {
  const obj = {};
  Object.setPrototypeOf(obj, User.prototype);
  User.call(obj, name);
  return obj;
}
```

### Object.create()

Prototypeni to'g'ridan-to'g'ri belgilash:

```javascript
const animal = {
  eats: true,
  sleep() {
    console.log('Sleeping...');
  }
};

// animal ni prototype sifatida yangi ob'ekt yaratish
const rabbit = Object.create(animal);
rabbit.jumps = true;

console.log(rabbit.eats); // true
rabbit.sleep(); // "Sleeping..."

// Object.create(null) - "toza" ob'ekt
const dict = Object.create(null);
// dict.toString yo'q! prototype chain yo'q
```

### ES6 Class Syntax

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Animal.call(this, name)
    this.breed = breed;
  }

  speak() {
    console.log(`${this.name} barks`);
  }

  // Static method
  static isDog(animal) {
    return animal instanceof Dog;
  }
}

const dog = new Dog('Rex', 'German Shepherd');

// Class aslida prototype-based
console.log(typeof Dog); // "function"
console.log(dog.__proto__ === Dog.prototype); // true
console.log(Dog.prototype.__proto__ === Animal.prototype); // true
```

---

## Kod Misollari

### To'g'ri: Prototype Inheritance

```javascript
function Shape(x, y) {
  this.x = x;
  this.y = y;
}

Shape.prototype.move = function(dx, dy) {
  this.x += dx;
  this.y += dy;
  return this;
};

Shape.prototype.toString = function() {
  return `Shape at (${this.x}, ${this.y})`;
};

function Circle(x, y, radius) {
  Shape.call(this, x, y); // Parent constructor chaqirish
  this.radius = radius;
}

// Prototype chain o'rnatish
Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle; // constructor ni tiklash

Circle.prototype.area = function() {
  return Math.PI * this.radius ** 2;
};

Circle.prototype.toString = function() {
  return `Circle at (${this.x}, ${this.y}) with radius ${this.radius}`;
};

const circle = new Circle(0, 0, 5);
circle.move(10, 10);
console.log(circle.toString()); // "Circle at (10, 10) with radius 5"
console.log(circle.area()); // ~78.54
```

### Noto'g'ri: Prototype Mutation

```javascript
// XATO: Prototype'ni qayta tayinlash
function User(name) {
  this.name = name;
}

const user1 = new User('Ali');

User.prototype = {
  sayHi() {
    console.log(`Hi, ${this.name}`);
  }
};

const user2 = new User('Vali');

user1.sayHi(); // TypeError: user1.sayHi is not a function!
user2.sayHi(); // "Hi, Vali" - ishlaydi

// Nega? user1 ESKI prototype'ga ulangan
// user2 YANGI prototype'ga ulangan
```

### To'g'ri: Prototype'ga Method Qo'shish

```javascript
function User(name) {
  this.name = name;
}

const user1 = new User('Ali');

// TO'G'RI: Mavjud prototype'ga qo'shish
User.prototype.sayHi = function() {
  console.log(`Hi, ${this.name}`);
};

user1.sayHi(); // "Hi, Ali" - ishlaydi!

// Barcha mavjud instance'lar yangi method'ni ko'radi
```

### To'g'ri: hasOwnProperty Tekshirish

```javascript
const animal = { eats: true };
const rabbit = Object.create(animal);
rabbit.jumps = true;

// XATO: for...in prototype xususiyatlarini ham oladi
for (let key in rabbit) {
  console.log(key); // "jumps", "eats"
}

// TO'G'RI: faqat o'z xususiyatlari
for (let key in rabbit) {
  if (rabbit.hasOwnProperty(key)) {
    console.log(key); // faqat "jumps"
  }
}

// Yoki Object.keys (faqat own enumerable)
Object.keys(rabbit).forEach(key => {
  console.log(key); // faqat "jumps"
});

// Object.getOwnPropertyNames (own, shu jumladan non-enumerable)
console.log(Object.getOwnPropertyNames(rabbit)); // ["jumps"]
```

### To'g'ri: Mixin Pattern

```javascript
// Mixin - bir nechta manba'dan xususiyatlarni olish
const canEat = {
  eat(food) {
    console.log(`${this.name} eats ${food}`);
    this.energy += 10;
  }
};

const canWalk = {
  walk() {
    console.log(`${this.name} walks`);
    this.energy -= 1;
  }
};

const canSwim = {
  swim() {
    console.log(`${this.name} swims`);
    this.energy -= 2;
  }
};

class Animal {
  constructor(name) {
    this.name = name;
    this.energy = 100;
  }
}

class Duck extends Animal {}

// Mixin'larni qo'shish
Object.assign(Duck.prototype, canEat, canWalk, canSwim);

const duck = new Duck('Donald');
duck.eat('bread');  // "Donald eats bread"
duck.walk();        // "Donald walks"
duck.swim();        // "Donald swims"
```

### To'g'ri: Symbol.species

```javascript
class MyArray extends Array {
  // map, filter kabi metodlar MyArray qaytarsin
  static get [Symbol.species]() {
    return MyArray;
  }

  sum() {
    return this.reduce((a, b) => a + b, 0);
  }
}

const arr = new MyArray(1, 2, 3, 4, 5);
const doubled = arr.map(x => x * 2);

console.log(doubled instanceof MyArray); // true
console.log(doubled.sum()); // 30

// Symbol.species bo'lmasa
class PlainArray extends Array {}
const plain = new PlainArray(1, 2, 3);
const mapped = plain.map(x => x * 2);
console.log(mapped instanceof PlainArray); // false (Array)
```

---

## Real-World Cases

### 1. DOM Element Extension

```javascript
// Mavjud prototype'ni kengaytirish (ehtiyotkorlik bilan!)
// Faqat polyfill uchun tavsiya etiladi

if (!Element.prototype.matches) {
  Element.prototype.matches = function(selector) {
    const matches = document.querySelectorAll(selector);
    return Array.prototype.indexOf.call(matches, this) !== -1;
  };
}

// Custom Element Base Class
class BaseComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  // Template rendering
  render(template) {
    this.shadowRoot.innerHTML = template;
  }

  // Event delegation
  on(event, selector, handler) {
    this.shadowRoot.addEventListener(event, (e) => {
      if (e.target.matches(selector)) {
        handler.call(e.target, e);
      }
    });
  }

  // Lifecycle
  connectedCallback() {
    this.onMount?.();
  }

  disconnectedCallback() {
    this.onUnmount?.();
  }
}

// Ishlatish
class UserCard extends BaseComponent {
  static get observedAttributes() {
    return ['name', 'avatar'];
  }

  onMount() {
    this.render(`
      <div class="card">
        <img src="${this.getAttribute('avatar')}" />
        <h2>${this.getAttribute('name')}</h2>
      </div>
    `);
  }
}

customElements.define('user-card', UserCard);
```

### 2. Plugin System

```javascript
class EventEmitter {
  constructor() {
    this._events = {};
  }

  on(event, handler) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(handler);
    return this;
  }

  emit(event, ...args) {
    const handlers = this._events[event] || [];
    handlers.forEach(handler => handler.apply(this, args));
    return this;
  }

  off(event, handler) {
    const handlers = this._events[event];
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    }
    return this;
  }
}

class PluginManager extends EventEmitter {
  constructor() {
    super();
    this.plugins = new Map();
  }

  use(plugin) {
    if (typeof plugin.install === 'function') {
      plugin.install(this);
      this.plugins.set(plugin.name, plugin);
      this.emit('plugin:installed', plugin);
    }
    return this;
  }

  // Plugin'lar uchun prototype extension
  extend(name, method) {
    if (this[name]) {
      console.warn(`Method ${name} already exists`);
      return this;
    }
    this[name] = method;
    return this;
  }
}

// Plugin yaratish
const loggerPlugin = {
  name: 'logger',
  install(manager) {
    manager.extend('log', function(message) {
      console.log(`[${new Date().toISOString()}]`, message);
      this.emit('log', message);
    });
  }
};

const validatorPlugin = {
  name: 'validator',
  install(manager) {
    manager.extend('validate', function(data, rules) {
      const errors = [];
      for (const [field, rule] of Object.entries(rules)) {
        if (rule.required && !data[field]) {
          errors.push(`${field} is required`);
        }
      }
      return { isValid: errors.length === 0, errors };
    });
  }
};

// Ishlatish
const app = new PluginManager();
app.use(loggerPlugin);
app.use(validatorPlugin);

app.log('Application started');
const result = app.validate({ name: '' }, { name: { required: true } });
```

### 3. Prototype-based State Machine

```javascript
function StateMachine(config) {
  this.state = config.initial;
  this.states = config.states;
}

StateMachine.prototype.transition = function(event) {
  const currentStateConfig = this.states[this.state];

  if (!currentStateConfig) {
    throw new Error(`Invalid state: ${this.state}`);
  }

  const nextState = currentStateConfig.on?.[event];

  if (!nextState) {
    console.warn(`No transition for event "${event}" in state "${this.state}"`);
    return this.state;
  }

  // Exit action
  currentStateConfig.onExit?.();

  // Transition
  const previousState = this.state;
  this.state = nextState;

  // Entry action
  this.states[nextState]?.onEnter?.(previousState);

  return this.state;
};

StateMachine.prototype.can = function(event) {
  const currentStateConfig = this.states[this.state];
  return !!currentStateConfig?.on?.[event];
};

// Ishlatish
const trafficLight = new StateMachine({
  initial: 'green',
  states: {
    green: {
      on: { TIMER: 'yellow' },
      onEnter: () => console.log('Go!'),
      onExit: () => console.log('Prepare to stop...')
    },
    yellow: {
      on: { TIMER: 'red' },
      onEnter: () => console.log('Caution!')
    },
    red: {
      on: { TIMER: 'green' },
      onEnter: () => console.log('Stop!')
    }
  }
});

trafficLight.transition('TIMER'); // green → yellow
trafficLight.transition('TIMER'); // yellow → red
trafficLight.transition('TIMER'); // red → green
```

### 4. Prototype Chain Performance

```javascript
// Performance test: prototype vs own property
function createWithPrototype(count) {
  function Obj() {
    this.id = Math.random();
  }

  Obj.prototype.getValue = function() {
    return this.id * 2;
  };

  const objects = [];
  for (let i = 0; i < count; i++) {
    objects.push(new Obj());
  }
  return objects;
}

function createWithOwnMethod(count) {
  const objects = [];
  for (let i = 0; i < count; i++) {
    objects.push({
      id: Math.random(),
      getValue() {
        return this.id * 2;
      }
    });
  }
  return objects;
}

// Prototype usuli:
// - Kamroq xotira (method bir marta saqlanadi)
// - Property lookup biroz sekinroq (prototype chain)

// Own method usuli:
// - Ko'proq xotira (har bir ob'ektda alohida funksiya)
// - Tezroq access (to'g'ridan-to'g'ri)

// Real-world: Prototype odatda yaxshi tanlov
// Instance'lar ko'p bo'lganda xotira tejaydi
```

### 5. Safe Prototype Extension

```javascript
// Built-in prototype'larni xavfsiz kengaytirish
const safeExtend = (prototype, name, implementation) => {
  // Mavjudligini tekshirish
  if (prototype[name]) {
    console.warn(`${name} already exists on ${prototype.constructor.name}`);
    return;
  }

  // Non-enumerable qilib qo'shish
  Object.defineProperty(prototype, name, {
    value: implementation,
    writable: true,
    configurable: true,
    enumerable: false // for...in da ko'rinmasin
  });
};

// Ishlatish
safeExtend(Array.prototype, 'unique', function() {
  return [...new Set(this)];
});

safeExtend(String.prototype, 'capitalize', function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
});

// Test
console.log([1, 2, 2, 3, 3, 3].unique()); // [1, 2, 3]
console.log('hello'.capitalize()); // "Hello"

// for...in test
for (let key in [1, 2, 3]) {
  console.log(key); // "0", "1", "2" (unique ko'rinmaydi)
}
```

---

## Interview Savollari

### 1. Prototype chain nima va qanday ishlaydi?

**Javob:** Prototype chain — JavaScript'da meros (inheritance) mexanizmi. Har bir ob'ekt `[[Prototype]]` xususiyatiga ega bo'lib, u boshqa ob'ektga ishora qiladi.

Xususiyat o'qilganda:
1. Ob'ektning o'zida qidiriladi
2. Topilmasa, `[[Prototype]]` da qidiriladi
3. Topilguncha yoki `null` ga yetguncha davom etadi

```javascript
const animal = { eats: true };
const rabbit = Object.create(animal);
rabbit.jumps = true;

// rabbit.eats qidirilishi:
// rabbit.eats → yo'q → rabbit.__proto__.eats → animal.eats → true
```

### 2. `__proto__` va `prototype` farqi nima?

**Javob:**

| `__proto__` | `prototype` |
|-------------|-------------|
| HAR BIR ob'ektda mavjud | Faqat FUNKSIYALARDA mavjud |
| Ob'ektning prototype'iga ishora | `new` bilan yaratilgan ob'ektlar prototype'i |
| `[[Prototype]]` ga accessor | Constructor uchun shablon |

```javascript
function User() {}

const user = new User();

// user.__proto__ === User.prototype // true
// User.__proto__ === Function.prototype // true
// User.prototype.__proto__ === Object.prototype // true
```

### 3. Object.create(null) nima beradi?

**Javob:** Prototype chain'siz "toza" ob'ekt yaratadi. `toString`, `hasOwnProperty` kabi o'rnatilgan metodlar yo'q.

```javascript
const dict = Object.create(null);
dict.name = 'Ali';

console.log(dict.toString); // undefined
console.log('name' in dict); // true
console.log(dict.hasOwnProperty); // undefined

// Qachon foydali:
// - Dictionary/Map sifatida (key collision yo'q)
// - "__proto__" key sifatida ishlatish kerak bo'lganda
```

### 4. ES6 class va prototype-based inheritance farqi bormi?

**Javob:** Yo'q, class faqat sintaktik shakar. Ichida prototype ishlatiladi.

```javascript
class Animal {
  speak() {}
}

// Teng
function Animal() {}
Animal.prototype.speak = function() {};

// Isbot
console.log(typeof Animal); // "function"
console.log(Animal.prototype.speak); // function
```

Farqlar:
- `class` faqat `new` bilan chaqiriladi
- `class` ichida avtomatik strict mode
- `class` hoisted emas

### 5. instanceof qanday ishlaydi?

**Javob:** `instanceof` prototype chain bo'ylab tekshiradi.

```javascript
function User() {}
const user = new User();

// user instanceof User
// = User.prototype user ning prototype chain'ida bormi?

console.log(user instanceof User);   // true
console.log(user instanceof Object); // true
console.log(user instanceof Array);  // false

// Symbol.hasInstance bilan customize qilish
class MyClass {
  static [Symbol.hasInstance](obj) {
    return obj.customProp === true;
  }
}

console.log({ customProp: true } instanceof MyClass); // true
```

---

## Xatolar va To'g'ri Yechim

### Xato 1: Prototype'ni to'liq qayta tayinlash

```javascript
// XATO
function User(name) {
  this.name = name;
}

const user1 = new User('Ali');

// Prototype'ni to'liq almashtirish
User.prototype = {
  sayHi() {
    console.log(`Hi, ${this.name}`);
  }
};

const user2 = new User('Vali');

user1.sayHi(); // TypeError!
user2.sayHi(); // "Hi, Vali"

// TO'G'RI: Mavjud prototype'ga qo'shish
User.prototype.sayHi = function() {
  console.log(`Hi, ${this.name}`);
};
```

### Xato 2: constructor yo'qolishi

```javascript
// XATO
function Animal() {}
function Dog() {}

Dog.prototype = Object.create(Animal.prototype);
// Dog.prototype.constructor endi Animal!

const dog = new Dog();
console.log(dog.constructor === Dog); // false!

// TO'G'RI: constructor ni tiklash
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// Yoki
Object.defineProperty(Dog.prototype, 'constructor', {
  value: Dog,
  enumerable: false
});
```

### Xato 3: Prototype'da mutable data

```javascript
// XATO: Prototype'da array/object
function User(name) {
  this.name = name;
}

User.prototype.friends = []; // Barcha instance'lar share qiladi!

const user1 = new User('Ali');
const user2 = new User('Vali');

user1.friends.push('Salim');
console.log(user2.friends); // ["Salim"] - Noto'g'ri!

// TO'G'RI: Instance'da yaratish
function UserFixed(name) {
  this.name = name;
  this.friends = []; // Har bir instance uchun alohida
}
```

### Xato 4: super() chaqirmaslik

```javascript
// XATO
class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    // super() chaqirmasa xato!
    this.breed = breed; // ReferenceError!
  }
}

// TO'G'RI
class DogFixed extends Animal {
  constructor(name, breed) {
    super(name); // BIRINCHI super() chaqirish
    this.breed = breed;
  }
}
```

### Xato 5: Arrow function prototype'da

```javascript
// XATO: Arrow function prototype method sifatida
function User(name) {
  this.name = name;
}

User.prototype.sayHi = () => {
  console.log(`Hi, ${this.name}`); // this = global/undefined!
};

const user = new User('Ali');
user.sayHi(); // "Hi, undefined"

// TO'G'RI: Oddiy funksiya
User.prototype.sayHi = function() {
  console.log(`Hi, ${this.name}`);
};

// Arrow function faqat instance method uchun OK (constructor ichida)
function UserWithArrow(name) {
  this.name = name;
  this.sayHi = () => console.log(`Hi, ${this.name}`);
  // Lekin har instance uchun yangi funksiya yaratadi!
}
```

### Xato 6: Object.prototype'ni o'zgartirish

```javascript
// XATO: Global prototype pollution
Object.prototype.log = function() {
  console.log(this);
};

// Butun dasturga ta'sir qiladi!
const obj = { a: 1 };
for (let key in obj) {
  console.log(key); // "a", "log" - kutilmagan!
}

// TO'G'RI: Hech qachon Object.prototype'ni o'zgartirmang
// Agar zarur bo'lsa, non-enumerable qiling

Object.defineProperty(Object.prototype, 'log', {
  value: function() { console.log(this); },
  enumerable: false,
  writable: true,
  configurable: true
});

// Yoki utility funksiya yarating
const log = (obj) => console.log(obj);
```

### Xato 7: setPrototypeOf performance

```javascript
// XATO: Runtime'da prototype o'zgartirish
const obj = { a: 1 };
const proto = { b: 2 };

Object.setPrototypeOf(obj, proto); // SEKIN!

// V8 va boshqa engine'lar ob'ekt strukturasini optimize qiladi
// setPrototypeOf bu optimizatsiyani buzadi

// TO'G'RI: Object.create bilan boshidan yaratish
const objFixed = Object.create(proto);
objFixed.a = 1;

// Yoki
const objFixed2 = Object.assign(Object.create(proto), { a: 1 });
```
