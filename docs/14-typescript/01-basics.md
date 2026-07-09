# TypeScript Asoslari: Types va Interfaces

## Mundarija

1. [Primitive Types](#primitive-types)
2. [Arrays va Tuples](#arrays-va-tuples)
3. [Objects](#objects)
4. [Type Aliases](#type-aliases)
5. [Interfaces](#interfaces)
6. [Type vs Interface](#type-vs-interface)
7. [Union va Intersection](#union-va-intersection)
8. [Literal Types](#literal-types)
9. [Functions](#functions)
10. [Real-world Cases](#real-world-cases)
11. [Interview Savollari](#interview-savollari)
12. [Common Mistakes](#common-mistakes)

---

## Primitive Types

> [!IMPORTANT]
> **Nima uchun muhim?**  
> TypeScript JavaScript'ga tiplar (types) qo'shadi. Bu xuddi qoidalari qat'iy yozilgan shartnomaga o'xshaydi: qanday ma'lumot kiritish kerakligi oldindan aytiladi. Shunda siz kod ishlamasdan oldin (yozish jarayonidayoq) xatolarni ko'rasiz, ilovangiz buzilmaydi.

> [!NOTE]
> **Real-hayot analogiyasi: "Pochtachi va Posilka"**  
> **JavaScript:** Pochtachi (Funksiya) har qanday posilkani olib ketaveradi. Agar siz unga televizor qutisini ichida suv yuborsangiz, yo'lda u suv oqib ketib hamma narsani buzadi (Runtime Error).
> **TypeScript:** Pochtachi oldida tekshiruvchi (Compiler) turibdi. U qutining ustiga yozilgan yorliqqa (Type) qaraydi: "Bu qutida faqat televizor bo'lishi kerak!". Ichini ochib tekshiradi va agar suv bo'lsa, qutini pochtachiga bermaydi (Compile-time Error).

TypeScript JavaScript'ning barcha primitive tiplarini qo'llab-quvvatlaydi va qo'shimcha tiplar qo'shadi.

### Asosiy Primitivelar

```typescript
// string
let name: string = "John";
let greeting: string = `Hello, ${name}`;

// number (integer va float farqi yo'q)
let age: number = 25;
let price: number = 99.99;
let hex: number = 0xff;
let binary: number = 0b1010;
let octal: number = 0o744;

// boolean
let isActive: boolean = true;
let hasPermission: boolean = false;

// null va undefined
let empty: null = null;
let notDefined: undefined = undefined;

// symbol (unique identifiers)
const id: symbol = Symbol("id");
const anotherId: symbol = Symbol("id");
console.log(id === anotherId); // false - har biri unique

// bigint (katta sonlar uchun)
let bigNumber: bigint = 9007199254740991n;
let anotherBig: bigint = BigInt("9007199254740991");
```

### JavaScript vs TypeScript Comparison

```javascript
// JavaScript - tiplar runtime'da aniqlanadi
let value = "hello";
value = 123;        // OK, lekin xavfli
value = true;       // OK, lekin xavfli
value.toUpperCase(); // Runtime Error: value.toUpperCase is not a function
```

```typescript
// TypeScript - tiplar compile-time'da tekshiriladi
let value: string = "hello";
value = 123;        // ERROR: Type 'number' is not assignable to type 'string'
value = true;       // ERROR: Type 'boolean' is not assignable to type 'string'
value.toUpperCase(); // OK - TypeScript biladi bu string
```

### `any`, `unknown`, `never`, `void`

```typescript
// any - barcha tiplarni qabul qiladi (EHTIYOT BO'LING!)
let anything: any = "hello";
anything = 123;
anything = { foo: "bar" };
anything.nonExistentMethod(); // No error, but runtime crash!

// unknown - xavfsiz "any" (tekshirish majburiy)
let unknownValue: unknown = "hello";
// unknownValue.toUpperCase(); // ERROR: Object is of type 'unknown'

// Avval tekshirish kerak
if (typeof unknownValue === "string") {
  console.log(unknownValue.toUpperCase()); // OK
}

// never - hech qachon qaytmaydigan funksiyalar
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {
    // ...
  }
}

// void - hech narsa qaytarmaydigan funksiyalar
function logMessage(message: string): void {
  console.log(message);
  // return undefined; // implicitly
}
```

### Type Inference (Avtomatik Tip Aniqlash)

TypeScript ko'p hollarda tipni o'zi aniqlaydi:

```typescript
// Explicit typing (aniq belgilash)
let explicitName: string = "John";

// Type inference (avtomatik aniqlash)
let inferredName = "John"; // TypeScript biladi: string

// Inference misollari
let num = 42;              // number
let bool = true;           // boolean
let arr = [1, 2, 3];       // number[]
let obj = { x: 10 };       // { x: number }

// Qachon explicit yozish kerak?
// 1. Funksiya parametrlari
function greet(name: string): string {
  return `Hello, ${name}`;
}

// 2. O'zgaruvchi keyinroq qiymat olsa
let laterValue: string;
// ... kod
laterValue = "now assigned";

// 3. Murakkab tiplar
let complexData: Map<string, number[]> = new Map();
```

---

## Arrays va Tuples

### Arrays

```typescript
// Array sintaksis - ikki usul
let numbers: number[] = [1, 2, 3, 4, 5];
let strings: Array<string> = ["a", "b", "c"];

// Mixed array (union type bilan)
let mixed: (string | number)[] = [1, "two", 3, "four"];

// Readonly array
let readonlyNumbers: readonly number[] = [1, 2, 3];
// readonlyNumbers.push(4); // ERROR: Property 'push' does not exist

// ReadonlyArray type
let immutableArray: ReadonlyArray<number> = [1, 2, 3];

// 2D array
let matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];
```

### Tuples

Tuple - belgilangan uzunlik va har pozitsiyada aniq tip bo'lgan array:

```typescript
// Oddiy tuple
let person: [string, number] = ["John", 25];

// Named tuple (TypeScript 4.0+)
let employee: [name: string, age: number, active: boolean] = ["Jane", 30, true];

// Accessing elements
const employeeName: string = employee[0];
const employeeAge: number = employee[1];

// Destructuring
const [name, age, isActive] = employee;

// Tuple with optional elements
let flexible: [string, number?] = ["hello"];

// Tuple with rest elements
let tuple: [string, ...number[]] = ["header", 1, 2, 3, 4, 5];

// Readonly tuple
let readonlyTuple: readonly [string, number] = ["John", 25];
// readonlyTuple[0] = "Jane"; // ERROR
```

### Real-world Tuple Examples

```typescript
// Koordinatalar
type Coordinate = [x: number, y: number];
type Coordinate3D = [x: number, y: number, z: number];

function distance(point1: Coordinate, point2: Coordinate): number {
  const [x1, y1] = point1;
  const [x2, y2] = point2;
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// RGB rangi
type RGB = [red: number, green: number, blue: number];
type RGBA = [red: number, green: number, blue: number, alpha: number];

function rgbToHex([r, g, b]: RGB): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// useState pattern (React)
type UseStateReturn<T> = [T, (value: T) => void];

function useState<T>(initial: T): UseStateReturn<T> {
  let state = initial;
  const setState = (value: T) => { state = value; };
  return [state, setState];
}
```

---

## Objects

### Object Type Annotation

```typescript
// Inline object type
let user: { name: string; age: number } = {
  name: "John",
  age: 25
};

// Optional properties
let config: { host: string; port?: number } = {
  host: "localhost"
  // port is optional
};

// Readonly properties
let point: { readonly x: number; readonly y: number } = {
  x: 10,
  y: 20
};
// point.x = 5; // ERROR: Cannot assign to 'x' because it is a read-only property

// Index signatures
let dictionary: { [key: string]: number } = {
  apple: 1,
  banana: 2
};
dictionary.orange = 3; // OK
```

### Object Methods

```typescript
let calculator: {
  value: number;
  add(n: number): number;
  subtract: (n: number) => number;
} = {
  value: 0,
  add(n) {
    return this.value + n;
  },
  subtract: function(n) {
    return this.value - n;
  }
};
```

---

## Type Aliases

Type alias - yangi tip nomini yaratish:

```typescript
// Primitive alias
type ID = string | number;
type Email = string;

// Object alias
type User = {
  id: ID;
  name: string;
  email: Email;
  createdAt: Date;
};

// Function alias
type GreetFunction = (name: string) => string;

// Union alias
type Status = "pending" | "approved" | "rejected";

// Intersection alias
type Employee = User & {
  employeeId: string;
  department: string;
};

// Generic alias
type Container<T> = {
  value: T;
  getValue: () => T;
};

// Recursive alias
type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};
```

### Branded/Nominal Types

```typescript
// Problem: string va string bir-biridan farqlanmaydi
type UserId = string;
type ProductId = string;

function getUser(id: UserId) { /* ... */ }
function getProduct(id: ProductId) { /* ... */ }

const userId: UserId = "user-123";
const productId: ProductId = "product-456";

getUser(productId); // No error! But logically wrong

// Solution: Branded types
type UserId = string & { readonly __brand: "UserId" };
type ProductId = string & { readonly __brand: "ProductId" };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createProductId(id: string): ProductId {
  return id as ProductId;
}

const userId = createUserId("user-123");
const productId = createProductId("product-456");

getUser(productId); // ERROR now!
```

---

## Interfaces

Interface - object shape'ni aniqlash uchun:

```typescript
// Basic interface
interface User {
  id: number;
  name: string;
  email: string;
}

// Optional va readonly
interface Config {
  readonly apiKey: string;
  baseUrl: string;
  timeout?: number;
}

// Method signatures
interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  multiply: (a: number, b: number) => number;
}

// Index signatures
interface StringDictionary {
  [key: string]: string;
}

interface NumberOrStringDictionary {
  [key: string]: number | string;
  length: number;    // OK
  name: string;      // OK
}
```

### Interface Extension

```typescript
// Single inheritance
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  employeeId: string;
  department: string;
}

// Multiple inheritance
interface Printable {
  print(): void;
}

interface Loggable {
  log(): void;
}

interface Report extends Printable, Loggable {
  title: string;
  content: string;
}

// Implementation
const report: Report = {
  title: "Annual Report",
  content: "...",
  print() {
    console.log(this.content);
  },
  log() {
    console.log(`[Report] ${this.title}`);
  }
};
```

### Declaration Merging

TypeScript'da interface'lar bir xil nomda bo'lsa birlashadi:

```typescript
interface User {
  name: string;
}

interface User {
  age: number;
}

// User endi { name: string; age: number }
const user: User = {
  name: "John",
  age: 25
};
```

### Callable va Constructable Interfaces

```typescript
// Callable interface
interface SearchFunction {
  (query: string, limit?: number): string[];
}

const search: SearchFunction = (query, limit = 10) => {
  return [`Result for ${query}`];
};

// Constructable interface
interface UserConstructor {
  new (name: string, age: number): User;
}

class User {
  constructor(public name: string, public age: number) {}
}

function createUser(ctor: UserConstructor, name: string, age: number): User {
  return new ctor(name, age);
}

// Hybrid interface
interface Counter {
  (start: number): string;
  interval: number;
  reset(): void;
}

function createCounter(): Counter {
  const counter = function(start: number) {
    return `Started at ${start}`;
  } as Counter;

  counter.interval = 1000;
  counter.reset = () => console.log("Reset");

  return counter;
}
```

---

## Type vs Interface

### Asosiy Farqlar

| Xususiyat | Type | Interface |
|-----------|------|-----------|
| Primitives | `type ID = string` | Mumkin emas |
| Union/Intersection | `type A = B \| C` | Mumkin emas (extends bilan) |
| Tuple | `type Point = [number, number]` | Murakkab |
| Declaration Merging | Yo'q | Bor |
| Computed Properties | Bor | Yo'q |
| `extends` keyword | Yo'q (`&` ishlatiladi) | Bor |
| Class implements | Bor | Bor |

### Qachon Qaysi?

```typescript
// TYPE ishlatish kerak:

// 1. Union types
type Status = "pending" | "approved" | "rejected";

// 2. Tuples
type Coordinate = [number, number];

// 3. Primitive aliases
type ID = string | number;

// 4. Mapped types
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// 5. Conditional types
type Nullable<T> = T | null;

// 6. Function types
type Handler = (event: Event) => void;


// INTERFACE ishlatish kerak:

// 1. Object shapes (asosan)
interface User {
  name: string;
  age: number;
}

// 2. Class contracts
interface Repository<T> {
  find(id: string): T | null;
  save(entity: T): void;
  delete(id: string): boolean;
}

class UserRepository implements Repository<User> {
  find(id: string): User | null { /* ... */ }
  save(user: User): void { /* ... */ }
  delete(id: string): boolean { /* ... */ }
}

// 3. Library definitions (declaration merging kerak bo'lsa)
interface Window {
  myGlobalVar: string;
}

// 4. Extending third-party types
interface Express.Request {
  user?: User;
}
```

### Modern Recommendation

```typescript
// PREFER interface for object types
interface User {
  name: string;
  age: number;
}

// USE type for everything else
type Status = "active" | "inactive";
type Handler = (event: Event) => void;
type UserWithRoles = User & { roles: string[] };

// Both work for object types, but interface is clearer intent
```

---

## Union va Intersection

### Union Types (`|`)

"A **yoki** B" - qiymat bir necha tiplardan biri bo'lishi mumkin:

```typescript
// Basic union
type StringOrNumber = string | number;

let value: StringOrNumber = "hello";
value = 42; // OK

// Union with literals
type Direction = "up" | "down" | "left" | "right";
type HttpStatus = 200 | 201 | 400 | 404 | 500;

// Function with union parameter
function formatValue(value: string | number): string {
  // Type narrowing kerak
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

// Discriminated unions (tavsiya etiladi)
interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}
```

### Intersection Types (`&`)

"A **va** B" - qiymat barcha tiplarning xususiyatlariga ega:

```typescript
// Basic intersection
interface HasName {
  name: string;
}

interface HasAge {
  age: number;
}

type Person = HasName & HasAge;

const person: Person = {
  name: "John",
  age: 25
};

// Practical example: extending existing types
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  name: string;
  email: string;
}

type UserEntity = BaseEntity & User;

const userEntity: UserEntity = {
  id: "1",
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "John",
  email: "john@example.com"
};

// Function intersection (overloads alternative)
type LoggerFunction =
  ((message: string) => void) &
  ((message: string, level: "info" | "warn" | "error") => void);
```

### Never va Intersection

```typescript
// Conflicting intersection = never
type Impossible = string & number; // never

// Useful for exhaustive checks
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

type Status = "pending" | "approved" | "rejected";

function handleStatus(status: Status): string {
  switch (status) {
    case "pending":
      return "Waiting...";
    case "approved":
      return "Success!";
    case "rejected":
      return "Failed";
    default:
      return assertNever(status); // Compile error if case missed
  }
}
```

---

## Literal Types

Literal types - aniq qiymatlarni tip sifatida ishlatish:

```typescript
// String literals
type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction): void {
  console.log(`Moving ${direction}`);
}

move("north"); // OK
move("up");    // ERROR: Argument of type '"up"' is not assignable

// Number literals
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

function rollDice(): DiceValue {
  return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}

// Boolean literal
type True = true;
type False = false;

// Template literal types (TypeScript 4.1+)
type EventName = `on${Capitalize<string>}`;
// "onClick", "onChange", "onSubmit", etc.

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
type Endpoint = `/api/${string}`;
type Route = `${HTTPMethod} ${Endpoint}`;
// "GET /api/users", "POST /api/products", etc.

// Const assertion
const config = {
  host: "localhost",
  port: 3000
} as const;

// config.host is "localhost", not string
// config.port is 3000, not number

// Array const assertion
const directions = ["north", "south", "east", "west"] as const;
type Direction = typeof directions[number]; // "north" | "south" | "east" | "west"
```

---

## Functions

### Function Type Annotations

```typescript
// Parameter and return types
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Function type alias
type MathOperation = (a: number, b: number) => number;

const divide: MathOperation = (a, b) => a / b;

// Optional parameters
function greet(name: string, greeting?: string): string {
  return `${greeting || "Hello"}, ${name}!`;
}

// Default parameters
function createUser(name: string, role: string = "user"): User {
  return { name, role };
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}

// Void return
function logMessage(message: string): void {
  console.log(message);
}
```

### Function Overloads

```typescript
// Overload signatures
function format(value: string): string;
function format(value: number): string;
function format(value: Date): string;

// Implementation signature
function format(value: string | number | Date): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value.toISOString();
}

// Usage
format("  hello  "); // Returns "hello"
format(123.456);     // Returns "123.46"
format(new Date());  // Returns ISO string

// More complex overload
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: "span"): HTMLSpanElement;
function createElement(tag: "input"): HTMLInputElement;
function createElement(tag: string): HTMLElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

const div = createElement("div");   // HTMLDivElement
const input = createElement("input"); // HTMLInputElement
```

### `this` Parameter

```typescript
interface User {
  name: string;
  greet(this: User): void;
}

const user: User = {
  name: "John",
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

// Safe callback binding
function onClick(this: HTMLButtonElement, event: Event): void {
  console.log(this.textContent);
}
```

### Generic Functions

```typescript
// Simple generic
function identity<T>(value: T): T {
  return value;
}

identity<string>("hello"); // Explicit
identity(42);              // Inferred as number

// Multiple generics
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

// Constrained generic
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}

getLength("hello");     // OK
getLength([1, 2, 3]);   // OK
getLength({ length: 5 }); // OK
getLength(123);         // ERROR: number has no length

// Generic with default
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value);
}
```

---

## Real-world Cases

### Case 1: API Response Typing

```typescript
// Generic API response
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: number;
}

// Pagination
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// Error response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// Usage
type UserResponse = ApiResponse<User>;
type UsersResponse = PaginatedResponse<User>;

async function fetchUser(id: number): Promise<UserResponse | ApiError> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Type guard for response
function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    response.success === false
  );
}

// Usage with type guard
const result = await fetchUser(1);

if (isApiError(result)) {
  console.error(result.error.message);
} else {
  console.log(result.data.name);
}
```

### Case 2: Form State Management

```typescript
// Form field state
interface FormField<T> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

// Form state
interface FormState<T extends Record<string, unknown>> {
  fields: {
    [K in keyof T]: FormField<T[K]>;
  };
  isValid: boolean;
  isSubmitting: boolean;
}

// User registration form
interface RegistrationForm {
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

type RegistrationFormState = FormState<RegistrationForm>;

// Initial state factory
function createFormState<T extends Record<string, unknown>>(
  initial: T
): FormState<T> {
  const fields = {} as FormState<T>["fields"];

  for (const key in initial) {
    fields[key] = {
      value: initial[key],
      error: null,
      touched: false,
      dirty: false
    } as FormField<T[typeof key]>;
  }

  return {
    fields,
    isValid: false,
    isSubmitting: false
  };
}

// Usage
const formState = createFormState<RegistrationForm>({
  email: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false
});
```

### Case 3: Event System

```typescript
// Event map
interface EventMap {
  userLogin: { userId: string; timestamp: number };
  userLogout: { userId: string };
  pageView: { path: string; referrer?: string };
  buttonClick: { buttonId: string; label: string };
}

// Type-safe event emitter
class TypedEventEmitter<T extends Record<string, unknown>> {
  private listeners: {
    [K in keyof T]?: Array<(payload: T[K]) => void>;
  } = {};

  on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  off<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    const listeners = this.listeners[event];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit<K extends keyof T>(event: K, payload: T[K]): void {
    const listeners = this.listeners[event];
    if (listeners) {
      listeners.forEach(listener => listener(payload));
    }
  }
}

// Usage
const analytics = new TypedEventEmitter<EventMap>();

analytics.on("userLogin", ({ userId, timestamp }) => {
  console.log(`User ${userId} logged in at ${timestamp}`);
});

analytics.emit("userLogin", {
  userId: "123",
  timestamp: Date.now()
});

// Type error if payload doesn't match
analytics.emit("userLogin", { userId: "123" }); // ERROR: missing timestamp
```

---

## Interview Savollari

### 1. `type` va `interface` o'rtasidagi asosiy farqlar nimalar?

**Javob:**

```typescript
// 1. Declaration merging - faqat interface
interface User {
  name: string;
}
interface User {
  age: number;
}
// User = { name: string; age: number }

// Type bilan bu xato beradi
// type User = { name: string }
// type User = { age: number } // ERROR: Duplicate identifier

// 2. Union/Intersection - type bilan osonroq
type Status = "active" | "inactive"; // Union - faqat type
type UserWithRole = User & { role: string }; // Intersection - ikkalasi bilan

// 3. Primitives - faqat type
type ID = string | number;
// interface ID = string | number; // ERROR

// 4. Computed properties - faqat type
type Keys = "name" | "age";
type Person = { [K in Keys]: string };
// Interface bilan bevosita mumkin emas

// 5. Extends vs Intersection
interface Employee extends User {
  salary: number;
}
type EmployeeType = User & { salary: number };
```

### 2. `unknown` va `any` o'rtasidagi farq nima?

**Javob:**

```typescript
// any - barcha tip tekshiruvlarni o'chiradi
let anyValue: any = "hello";
anyValue.foo.bar.baz; // No error, but crashes at runtime
anyValue();           // No error, but crashes at runtime

// unknown - xavfsiz, tekshirish majburiy
let unknownValue: unknown = "hello";
// unknownValue.foo; // ERROR: Object is of type 'unknown'

// Tekshirish bilan ishlaydi
if (typeof unknownValue === "string") {
  console.log(unknownValue.toUpperCase()); // OK
}

// Qachon ishlatish:
// - unknown: tashqi ma'lumotlar (API, JSON.parse, user input)
// - any: HECH QACHON (faqat migration paytida vaqtincha)
```

### 3. Discriminated Union nima va qanday ishlaydi?

**Javob:**

```typescript
// Discriminated union - har tipda umumiy "tag" property bor
interface LoadingState {
  status: "loading";
}

interface SuccessState {
  status: "success";
  data: string;
}

interface ErrorState {
  status: "error";
  error: Error;
}

type State = LoadingState | SuccessState | ErrorState;

function handleState(state: State): string {
  // TypeScript har case'da to'g'ri tipni biladi
  switch (state.status) {
    case "loading":
      return "Loading...";
    case "success":
      return state.data; // TypeScript biladi: data bor
    case "error":
      return state.error.message; // TypeScript biladi: error bor
  }
}

// Afzalliklari:
// 1. Type narrowing avtomatik
// 2. Exhaustive check mumkin
// 3. IDE autocomplete ishlaydi
```

### 4. Type narrowing nima va qanday usullari bor?

**Javob:**

```typescript
// 1. typeof guard
function process(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase(); // string methods
  }
  return value.toFixed(2); // number methods
}

// 2. instanceof guard
function handleError(error: Error | string) {
  if (error instanceof Error) {
    return error.message;
  }
  return error;
}

// 3. in operator
interface Dog {
  bark(): void;
}
interface Cat {
  meow(): void;
}

function speak(animal: Dog | Cat) {
  if ("bark" in animal) {
    animal.bark();
  } else {
    animal.meow();
  }
}

// 4. Custom type guard
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// 5. Discriminated union
type Result = { ok: true; value: number } | { ok: false; error: string };

function handle(result: Result) {
  if (result.ok) {
    console.log(result.value);
  } else {
    console.log(result.error);
  }
}
```

### 5. `readonly` va `const` o'rtasidagi farq nima?

**Javob:**

```typescript
// const - o'zgaruvchi reassign qilinmaydi
const arr = [1, 2, 3];
// arr = [4, 5, 6]; // ERROR
arr.push(4); // OK - content o'zgarishi mumkin

// readonly - property o'zgartirilmaydi
interface Config {
  readonly apiKey: string;
  endpoints: string[];
}

const config: Config = {
  apiKey: "secret",
  endpoints: ["api.example.com"]
};

// config.apiKey = "new"; // ERROR
config.endpoints.push("api2.example.com"); // OK

// ReadonlyArray - array methodlarni bloklaydi
const readonlyArr: ReadonlyArray<number> = [1, 2, 3];
// readonlyArr.push(4); // ERROR

// as const - hamma narsa readonly va literal
const deepReadonly = {
  name: "John",
  roles: ["admin", "user"]
} as const;

// deepReadonly.name = "Jane"; // ERROR
// deepReadonly.roles.push("guest"); // ERROR
```

---

## Common Mistakes

### 1. `any` ni Haddan Tashqari Ishlatish

```typescript
// YOMON
function processData(data: any): any {
  return data.map((item: any) => item.value);
}

// YAXSHI
interface DataItem {
  value: number;
}

function processData(data: DataItem[]): number[] {
  return data.map(item => item.value);
}

// YAXSHI (unknown bilan)
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}
```

### 2. Type Assertion'ni Noto'g'ri Ishlatish

```typescript
// YOMON - xavfli assertion
const user = {} as User; // Empty object, but typed as User
console.log(user.name.toUpperCase()); // Runtime crash!

// YAXSHI - to'liq object yaratish
const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com"
};

// YAXSHI - unknown dan aniq conversion
function parseUser(data: unknown): User {
  if (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof (data as { name: unknown }).name === "string"
  ) {
    return data as User;
  }
  throw new Error("Invalid user data");
}
```

### 3. Optional va Nullable ni Chalkashtirish

```typescript
// Optional property - property yo'q bo'lishi mumkin
interface User {
  name: string;
  nickname?: string; // string | undefined
}

// Nullable - property bor, lekin qiymati null
interface User {
  name: string;
  deletedAt: Date | null;
}

// Farq
const user1: User = { name: "John" }; // nickname yo'q - OK
const user2: User = { name: "John", deletedAt: null }; // deletedAt kerak

// YOMON - ikkalasini aralashtirish
interface User {
  middleName?: string | null; // Confusing!
}

// YAXSHI - aniq semantic
interface User {
  middleName: string | null; // Always present, may be null
}
// yoki
interface User {
  middleName?: string; // May not exist
}
```

### 4. Object Mutability'ni E'tiborsiz Qoldirish

```typescript
// YOMON
interface Config {
  apiUrl: string;
  retries: number;
}

const config: Config = {
  apiUrl: "https://api.example.com",
  retries: 3
};

// Har joyda o'zgartirilishi mumkin
config.apiUrl = "malicious-url.com"; // No error!

// YAXSHI
interface Config {
  readonly apiUrl: string;
  readonly retries: number;
}

// Yoki Readonly utility type
type ImmutableConfig = Readonly<Config>;

// Eng yaxshi - as const
const config = {
  apiUrl: "https://api.example.com",
  retries: 3
} as const;
```

### 5. Function Overload'ni Noto'g'ri Ishlatish

```typescript
// YOMON - juda ko'p overload
function format(value: string): string;
function format(value: number): string;
function format(value: boolean): string;
function format(value: Date): string;
function format(value: string | number | boolean | Date): string {
  // ...
}

// YAXSHI - union type yetarli
function format(value: string | number | boolean | Date): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return value.toISOString();
}

// Overload faqat qaytish tipi farqli bo'lganda kerak
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: "input"): HTMLInputElement;
function createElement(tag: string): HTMLElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}
```

### 6. Index Signature bilan Strict Typing'ni Yo'qotish

```typescript
// YOMON - barcha propertylar uchun tip yo'qoladi
interface User {
  [key: string]: string;
  name: string;
  email: string;
}

const user: User = {
  name: "John",
  email: "john@example.com",
  typo: "anything" // No error for typos!
};

// YAXSHI - aniq propertylar
interface User {
  name: string;
  email: string;
}

// Agar dynamic keys kerak bo'lsa
interface UserWithMetadata extends User {
  metadata: Record<string, string>;
}
```

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **`any` ni ishlatavermang**: `any` yozdingizmi, TypeScript'ni o'chirib qo'ydingiz degani. Uning o'rniga nima kelishi noma'lum bo'lsa, `unknown` ishlating va Type Guard'lar bilan tekshirib keyin ishlating.
2. **Inference (Avtomatik tip topish)**: Hamma narsaga tip yozish shart emas. `let count = 0` yozganingizda TS uning son ekanini o'zi tushunadi (`let count: number = 0` deyish shart emas). O'zingizni kodga ko'mib yubormang.
3. **Type Alias vs Interface**: Umumiy qoida - obyektlar tuzilishini tasvirlash uchun har doim `interface` ishlating. Boshqa barcha holatlarda (masalan string yoki number'larni birlashtirish) `type` ishlating.
4. **Striktlikni saqlang**: TypeScript config faylida `strict: true` rejimini yoqing. Bu sizni ko'pgina yashirin xatolardan himoya qiladi (masalan, `null` ob'ektlardan field o'qish xatolari).

---

## Xulosa

TypeScript'ning tip tizimi juda kuchli va moslashuvchan. Asosiy qoidalar:

1. **`any` dan qoching** - `unknown` yoki aniq tiplarni ishlating
2. **Interface vs Type** - objectlar uchun interface, boshqasi uchun type
3. **Discriminated Unions** - murakkab state'lar uchun eng yaxshi pattern
4. **Readonly** - immutability uchun foydalaning
5. **Type narrowing** - union'larni xavfsiz handle qiling

Keyingi bo'limda Generics'ni chuqur o'rganamiz.
