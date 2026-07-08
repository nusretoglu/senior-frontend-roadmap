# TypeScript Type Guards va Type Narrowing

## Mundarija

1. [Type Narrowing Nima?](#type-narrowing-nima)
2. [typeof Type Guards](#typeof-type-guards)
3. [instanceof Type Guards](#instanceof-type-guards)
4. [in Operator](#in-operator)
5. [Equality Narrowing](#equality-narrowing)
6. [Custom Type Guards](#custom-type-guards)
7. [Discriminated Unions](#discriminated-unions)
8. [Assertion Functions](#assertion-functions)
9. [Control Flow Analysis](#control-flow-analysis)
10. [Real-world Cases](#real-world-cases)
11. [Interview Savollari](#interview-savollari)
12. [Common Mistakes](#common-mistakes)

---

## Type Narrowing Nima?

Type narrowing - bu TypeScript'ning **tipni aniqroq qilish** jarayoni. Union type'dan aniq tipga o'tish.

### Muammo

```typescript
function processValue(value: string | number): void {
  // value bu yerda string yoki number
  // Qaysi metodlarni ishlatish mumkin?

  // value.toUpperCase(); // ERROR: Property 'toUpperCase' does not exist on type 'number'
  // value.toFixed();     // ERROR: Property 'toFixed' does not exist on type 'string'
}
```

### Yechim: Type Narrowing

```typescript
function processValue(value: string | number): void {
  if (typeof value === "string") {
    // Bu blokda value: string
    console.log(value.toUpperCase()); // OK
  } else {
    // Bu blokda value: number
    console.log(value.toFixed(2)); // OK
  }
}
```

### Narrowing Visualizatsiyasi

```
┌─────────────────────────────────────┐
│  value: string | number             │
└─────────────────────────────────────┘
                │
                ▼
        typeof value === "string"?
               / \
              /   \
             ▼     ▼
┌─────────────┐   ┌─────────────┐
│value: string│   │value: number│
└─────────────┘   └─────────────┘
```

---

## typeof Type Guards

JavaScript'ning `typeof` operatori TypeScript'da type guard sifatida ishlaydi.

### Asosiy Ishlatish

```typescript
function printValue(value: string | number | boolean | undefined): void {
  if (typeof value === "string") {
    console.log(`String: ${value.toUpperCase()}`);
  } else if (typeof value === "number") {
    console.log(`Number: ${value.toFixed(2)}`);
  } else if (typeof value === "boolean") {
    console.log(`Boolean: ${value ? "Yes" : "No"}`);
  } else {
    console.log("Undefined");
  }
}
```

### typeof Qaytarishi Mumkin Bo'lgan Qiymatlar

```typescript
// typeof faqat 8 ta qiymat qaytaradi:
typeof undefined === "undefined"
typeof true === "boolean"
typeof 42 === "number"
typeof 42n === "bigint"
typeof "hello" === "string"
typeof Symbol() === "symbol"
typeof function() {} === "function"
typeof {} === "object" // null ham "object"!

// DIQQAT: typeof null === "object" (JavaScript bug)
function processObject(value: object | null): void {
  if (typeof value === "object") {
    // value: object | null (null hali ham shu yerda!)
    // value.toString(); // ERROR: Object is possibly 'null'
  }
}

// TO'G'RI null check
function processObject2(value: object | null): void {
  if (value !== null && typeof value === "object") {
    // value: object (null yo'q)
    console.log(value.toString()); // OK
  }
}
```

### Array Tekshiruvi

```typescript
// typeof array'ni "object" deb ko'rsatadi
function processData(data: string | string[]): void {
  if (typeof data === "string") {
    console.log(data.toUpperCase());
  } else {
    // data: string[] (deduction)
    console.log(data.join(", "));
  }
}

// Array.isArray() - aniqroq usul
function processData2(data: unknown): void {
  if (Array.isArray(data)) {
    // data: any[] (isArray bilan narrowing)
    console.log(data.length);
  }
}

// Generic bilan
function processArray<T>(data: T | T[]): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  return [data];
}
```

---

## instanceof Type Guards

`instanceof` class instance'larini tekshiradi.

### Asosiy Ishlatish

```typescript
class Dog {
  bark(): void {
    console.log("Woof!");
  }
}

class Cat {
  meow(): void {
    console.log("Meow!");
  }
}

function speak(animal: Dog | Cat): void {
  if (animal instanceof Dog) {
    animal.bark(); // OK - animal: Dog
  } else {
    animal.meow(); // OK - animal: Cat
  }
}
```

### Built-in Types bilan

```typescript
function processValue(value: Date | string | RegExp): string {
  if (value instanceof Date) {
    return value.toISOString();
  } else if (value instanceof RegExp) {
    return value.source;
  } else {
    return value;
  }
}

// Error handling
function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else if (error instanceof TypeError) {
    return `Type Error: ${error.message}`;
  } else if (typeof error === "string") {
    return error;
  }
  return "Unknown error";
}
```

### Inheritance bilan

```typescript
class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Dog extends Animal {
  breed: string;
  constructor(name: string, breed: string) {
    super(name);
    this.breed = breed;
  }
}

class Cat extends Animal {
  indoor: boolean;
  constructor(name: string, indoor: boolean) {
    super(name);
    this.indoor = indoor;
  }
}

function describe(animal: Animal): string {
  if (animal instanceof Dog) {
    return `${animal.name} is a ${animal.breed}`; // Dog properties
  } else if (animal instanceof Cat) {
    return `${animal.name} is ${animal.indoor ? "indoor" : "outdoor"}`; // Cat properties
  }
  return animal.name;
}
```

### Limitations

```typescript
// instanceof faqat class'lar bilan ishlaydi, interface'lar bilan EMAS
interface Printable {
  print(): void;
}

function process(item: Printable): void {
  // item instanceof Printable; // ERROR: 'Printable' only refers to a type
}

// Interface uchun in operator yoki custom type guard kerak
```

---

## in Operator

`in` operator property mavjudligini tekshiradi.

### Asosiy Ishlatish

```typescript
interface Dog {
  bark(): void;
  breed: string;
}

interface Cat {
  meow(): void;
  indoor: boolean;
}

function speak(animal: Dog | Cat): void {
  if ("bark" in animal) {
    // animal: Dog
    animal.bark();
    console.log(animal.breed);
  } else {
    // animal: Cat
    animal.meow();
    console.log(animal.indoor);
  }
}
```

### Optional Properties bilan

```typescript
interface BaseUser {
  name: string;
}

interface Admin extends BaseUser {
  adminLevel: number;
  permissions: string[];
}

interface RegularUser extends BaseUser {
  subscriptionTier: string;
}

function getAccess(user: Admin | RegularUser): string[] {
  if ("adminLevel" in user) {
    // user: Admin
    return user.permissions;
  } else {
    // user: RegularUser
    return [`tier-${user.subscriptionTier}`];
  }
}
```

### Nested Property Check

```typescript
interface Response {
  data?: {
    user?: {
      name: string;
    };
  };
  error?: string;
}

function getUserName(response: Response): string {
  // in operator bilan
  if ("data" in response && response.data) {
    if ("user" in response.data && response.data.user) {
      return response.data.user.name;
    }
  }
  return "Unknown";

  // Yoki optional chaining
  // return response.data?.user?.name ?? "Unknown";
}
```

---

## Equality Narrowing

`===`, `!==`, `==`, `!=` operatorlari bilan narrowing.

### Literal Types bilan

```typescript
type Status = "pending" | "approved" | "rejected";

function handleStatus(status: Status): void {
  if (status === "pending") {
    // status: "pending"
    console.log("Waiting for approval...");
  } else if (status === "approved") {
    // status: "approved"
    console.log("Approved!");
  } else {
    // status: "rejected"
    console.log("Rejected");
  }
}
```

### null/undefined Check

```typescript
function processValue(value: string | null | undefined): string {
  // null va undefined ni tekshirish
  if (value == null) {
    // value: null | undefined (== loose equality)
    return "No value";
  }
  // value: string
  return value.toUpperCase();
}

// Strict equality bilan
function processValue2(value: string | null | undefined): string {
  if (value === null) {
    return "Null";
  }
  if (value === undefined) {
    return "Undefined";
  }
  // value: string
  return value.toUpperCase();
}
```

### switch bilan

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // shape: { kind: "circle"; radius: number }
      return Math.PI * shape.radius ** 2;

    case "rectangle":
      // shape: { kind: "rectangle"; width: number; height: number }
      return shape.width * shape.height;

    case "triangle":
      // shape: { kind: "triangle"; base: number; height: number }
      return (shape.base * shape.height) / 2;

    default:
      // Exhaustive check
      const _exhaustive: never = shape;
      throw new Error(`Unknown shape: ${_exhaustive}`);
  }
}
```

---

## Custom Type Guards

`is` keyword bilan o'z type guard'ingizni yozing.

### Type Predicate Syntax

```typescript
// function name(param: Type): param is NarrowedType
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// Ishlatish
function process(value: unknown): void {
  if (isString(value)) {
    // value: string
    console.log(value.toUpperCase());
  }
}
```

### Object Type Guards

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

interface Admin extends User {
  adminLevel: number;
  permissions: string[];
}

// Type guard for User
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "email" in value &&
    typeof (value as User).id === "number" &&
    typeof (value as User).name === "string" &&
    typeof (value as User).email === "string"
  );
}

// Type guard for Admin
function isAdmin(user: User): user is Admin {
  return "adminLevel" in user && "permissions" in user;
}

// Ishlatish
function processUser(data: unknown): void {
  if (isUser(data)) {
    console.log(`User: ${data.name}`);

    if (isAdmin(data)) {
      console.log(`Admin level: ${data.adminLevel}`);
    }
  }
}
```

### Array Type Guards

```typescript
// Array of specific type
function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(item => typeof item === "string")
  );
}

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every(item => typeof item === "number")
  );
}

// Generic array type guard
function isArrayOf<T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(itemGuard);
}

// Ishlatish
const isUserArray = (value: unknown): value is User[] =>
  isArrayOf(value, isUser);
```

### Union Type Discrimination

```typescript
type ApiResponse =
  | { type: "success"; data: unknown }
  | { type: "error"; error: string }
  | { type: "loading" };

function isSuccess(response: ApiResponse): response is { type: "success"; data: unknown } {
  return response.type === "success";
}

function isError(response: ApiResponse): response is { type: "error"; error: string } {
  return response.type === "error";
}

function handleResponse(response: ApiResponse): void {
  if (isSuccess(response)) {
    console.log("Data:", response.data);
  } else if (isError(response)) {
    console.log("Error:", response.error);
  } else {
    console.log("Loading...");
  }
}
```

---

## Discriminated Unions

Discriminated union - bu **umumiy property (tag)** orqali farqlanadigan union.

### Asosiy Pattern

```typescript
// Har tipda "kind" (tag) bor
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

### Exhaustive Checking

```typescript
// never type bilan exhaustive check
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      // Agar yangi shape qo'shilsa, bu yerda error bo'ladi
      return assertNever(shape);
  }
}

// Yangi shape qo'shsak
interface Square {
  kind: "square";
  side: number;
}

type Shape = Circle | Rectangle | Triangle | Square;

// Endi getArea da error:
// ERROR: Argument of type '{ kind: "square"; side: number; }'
// is not assignable to parameter of type 'never'
```

### State Machine Pattern

```typescript
// Loading states
type LoadingState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: string };

function renderState(state: LoadingState): string {
  switch (state.status) {
    case "idle":
      return "Click to load";
    case "loading":
      return "Loading...";
    case "success":
      return `Loaded ${state.data.length} users`;
    case "error":
      return `Error: ${state.error}`;
  }
}

// Form validation
type ValidationResult =
  | { valid: true; value: string }
  | { valid: false; errors: string[] };

function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email) {
    errors.push("Email is required");
  } else if (!email.includes("@")) {
    errors.push("Invalid email format");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true, value: email };
}

function handleValidation(result: ValidationResult): void {
  if (result.valid) {
    console.log("Valid email:", result.value);
  } else {
    console.log("Errors:", result.errors.join(", "));
  }
}
```

### Action Types (Redux-like)

```typescript
interface User {
  id: number;
  name: string;
}

type Action =
  | { type: "ADD_USER"; payload: User }
  | { type: "REMOVE_USER"; payload: { id: number } }
  | { type: "UPDATE_USER"; payload: { id: number; updates: Partial<User> } }
  | { type: "CLEAR_USERS" };

function reducer(state: User[], action: Action): User[] {
  switch (action.type) {
    case "ADD_USER":
      return [...state, action.payload];

    case "REMOVE_USER":
      return state.filter(u => u.id !== action.payload.id);

    case "UPDATE_USER":
      return state.map(u =>
        u.id === action.payload.id
          ? { ...u, ...action.payload.updates }
          : u
      );

    case "CLEAR_USERS":
      return [];

    default:
      const _exhaustive: never = action;
      return state;
  }
}
```

---

## Assertion Functions

Assertion function - shartni tekshirib, false bo'lsa throw qiladi.

### asserts Keyword

```typescript
// Traditional assertion
function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function process(value: string | null): void {
  assert(value !== null, "Value cannot be null");
  // value: string (narrowed)
  console.log(value.toUpperCase());
}

// Type assertion
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Value must be a string");
  }
}

function process2(value: unknown): void {
  assertIsString(value);
  // value: string
  console.log(value.toUpperCase());
}
```

### NonNull Assertion

```typescript
function assertNonNull<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error("Value cannot be null or undefined");
  }
}

function process(user: User | null): void {
  assertNonNull(user);
  // user: User
  console.log(user.name);
}
```

### Object Property Assertion

```typescript
function assertHasProperty<T, K extends string>(
  obj: T,
  key: K
): asserts obj is T & Record<K, unknown> {
  if (!(key in (obj as object))) {
    throw new Error(`Object must have property: ${key}`);
  }
}

function process(data: unknown): void {
  assertHasProperty(data, "name");
  assertHasProperty(data, "email");
  // data: unknown & Record<"name", unknown> & Record<"email", unknown>
  console.log(data.name, data.email);
}
```

### is vs asserts

```typescript
// is - boolean qaytaradi, narrowing if block ichida
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "name" in value;
}

if (isUser(data)) {
  // data: User (faqat bu block ichida)
}
// data: unknown (tashqarida yana eski tip)

// asserts - throw qiladi, narrowing keyingi kodda
function assertUser(value: unknown): asserts value is User {
  if (!(typeof value === "object" && value !== null && "name" in value)) {
    throw new Error("Not a user");
  }
}

assertUser(data);
// data: User (shu qatordan boshlab)
```

---

## Control Flow Analysis

TypeScript kod oqimini tahlil qilib, tiplarni avtomatik narrow qiladi.

### Assignment Narrowing

```typescript
let value: string | number;

value = "hello";
// value: string
console.log(value.toUpperCase()); // OK

value = 42;
// value: number
console.log(value.toFixed(2)); // OK
```

### Truthiness Narrowing

```typescript
function process(value: string | null | undefined): void {
  if (value) {
    // value: string (null, undefined, "" falsy)
    console.log(value.toUpperCase());
  }
}

// Boolean conversion
function processBoolean(value: string | null): void {
  const hasValue = Boolean(value);
  if (hasValue) {
    // DIQQAT: Bu narrowing qilmaydi!
    // value: string | null (hali ham)
  }
}

// Double negation
function processDoubleNeg(value: string | null): void {
  if (!!value) {
    // Bu ham narrowing qilmaydi
    // value: string | null
  }
}

// TO'G'RI usul
function processCorrect(value: string | null): void {
  if (value !== null && value !== "") {
    // value: string
    console.log(value.toUpperCase());
  }
}
```

### never Type va Narrowing

```typescript
function process(value: string | number): void {
  if (typeof value === "string") {
    // value: string
  } else if (typeof value === "number") {
    // value: number
  } else {
    // value: never (bu yerga yetib bo'lmaydi)
    const _never: never = value;
  }
}
```

### Return va Throw Narrowing

```typescript
function process(value: string | null): string {
  if (value === null) {
    throw new Error("Value is null");
  }
  // value: string (null case throw qildi)
  return value.toUpperCase();
}

function process2(value: string | null): string {
  if (value === null) {
    return "default";
  }
  // value: string (null case return qildi)
  return value.toUpperCase();
}
```

### Aliased Conditions

```typescript
// TypeScript 4.4+ aliased conditions ni tushunadi
function process(value: string | number): void {
  const isString = typeof value === "string";

  if (isString) {
    // value: string (aliased condition ishlaydi)
    console.log(value.toUpperCase());
  }
}

// Lekin murakkab aliaslar ishlamasligi mumkin
function process2(value: string | number): void {
  const checks = {
    isString: typeof value === "string"
  };

  if (checks.isString) {
    // value: string | number (narrowing ishlamaydi)
    // console.log(value.toUpperCase()); // ERROR
  }
}
```

---

## Real-world Cases

### Case 1: API Response Handling

```typescript
// API response types
interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: number;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Type guards
function isSuccess<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.success === true;
}

function isError(response: ApiResponse<unknown>): response is ErrorResponse {
  return response.success === false;
}

// Validation error check
function hasValidationErrors(
  response: ErrorResponse
): response is ErrorResponse & { error: { details: Record<string, string[]> } } {
  return response.error.details !== undefined;
}

// Usage
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const result: ApiResponse<User> = await response.json();

  if (isError(result)) {
    if (hasValidationErrors(result)) {
      const errors = Object.entries(result.error.details)
        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        .join("\n");
      throw new Error(`Validation failed:\n${errors}`);
    }
    throw new Error(result.error.message);
  }

  return result.data;
}
```

### Case 2: Form Validation System

```typescript
// Validation result types
type ValidationSuccess<T> = {
  valid: true;
  value: T;
};

type ValidationError = {
  valid: false;
  errors: string[];
};

type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

// Type guards
function isValid<T>(result: ValidationResult<T>): result is ValidationSuccess<T> {
  return result.valid === true;
}

// Validators
type Validator<T> = (value: unknown) => ValidationResult<T>;

const validateString: Validator<string> = (value) => {
  if (typeof value !== "string") {
    return { valid: false, errors: ["Must be a string"] };
  }
  return { valid: true, value };
};

const validateEmail: Validator<string> = (value) => {
  const stringResult = validateString(value);
  if (!isValid(stringResult)) return stringResult;

  const email = stringResult.value;
  if (!email.includes("@")) {
    return { valid: false, errors: ["Invalid email format"] };
  }
  return { valid: true, value: email };
};

const validateMinLength = (min: number): Validator<string> => (value) => {
  const stringResult = validateString(value);
  if (!isValid(stringResult)) return stringResult;

  const str = stringResult.value;
  if (str.length < min) {
    return { valid: false, errors: [`Must be at least ${min} characters`] };
  }
  return { valid: true, value: str };
};

// Compose validators
function compose<T>(...validators: Validator<T>[]): Validator<T> {
  return (value) => {
    const errors: string[] = [];

    for (const validator of validators) {
      const result = validator(value);
      if (!isValid(result)) {
        errors.push(...result.errors);
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Return last valid result
    return validators[validators.length - 1](value);
  };
}

// Usage
const validatePassword = compose(
  validateString,
  validateMinLength(8)
);

const result = validatePassword("short");
if (isValid(result)) {
  console.log("Password:", result.value);
} else {
  console.log("Errors:", result.errors);
}
```

### Case 3: Event System

```typescript
// Event types
interface MouseClickEvent {
  type: "click";
  x: number;
  y: number;
  button: "left" | "right" | "middle";
}

interface KeyboardEvent {
  type: "keypress";
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
}

interface TouchEvent {
  type: "touch";
  touches: Array<{ x: number; y: number }>;
}

interface ScrollEvent {
  type: "scroll";
  deltaX: number;
  deltaY: number;
}

type AppEvent = MouseClickEvent | KeyboardEvent | TouchEvent | ScrollEvent;

// Type guards
function isMouseEvent(event: AppEvent): event is MouseClickEvent {
  return event.type === "click";
}

function isKeyboardEvent(event: AppEvent): event is KeyboardEvent {
  return event.type === "keypress";
}

function isTouchEvent(event: AppEvent): event is TouchEvent {
  return event.type === "touch";
}

// Event handler
function handleEvent(event: AppEvent): void {
  switch (event.type) {
    case "click":
      console.log(`Click at (${event.x}, ${event.y}) with ${event.button} button`);
      break;

    case "keypress":
      const modifiers = [
        event.ctrlKey && "Ctrl",
        event.shiftKey && "Shift"
      ].filter(Boolean).join("+");
      console.log(`Key: ${modifiers ? modifiers + "+" : ""}${event.key}`);
      break;

    case "touch":
      console.log(`Touch with ${event.touches.length} fingers`);
      break;

    case "scroll":
      console.log(`Scroll: dx=${event.deltaX}, dy=${event.deltaY}`);
      break;

    default:
      const _exhaustive: never = event;
      throw new Error(`Unknown event type`);
  }
}

// Filter events
function filterMouseEvents(events: AppEvent[]): MouseClickEvent[] {
  return events.filter(isMouseEvent);
}

function filterKeyboardShortcuts(events: AppEvent[]): KeyboardEvent[] {
  return events
    .filter(isKeyboardEvent)
    .filter(e => e.ctrlKey || e.shiftKey);
}
```

---

## Interview Savollari

### 1. Type guard nima va qanday turları bor?

**Javob:**

```typescript
// Type guard - runtime'da tipni tekshirish va TypeScript'ga narrowing qilishga yordam berish

// 1. typeof guard - primitive tiplar uchun
function process(value: string | number) {
  if (typeof value === "string") {
    // value: string
  }
}

// 2. instanceof guard - class instance'lar uchun
function handle(error: Error | string) {
  if (error instanceof Error) {
    // error: Error
  }
}

// 3. in operator - property mavjudligi uchun
interface Dog { bark(): void; }
interface Cat { meow(): void; }

function speak(animal: Dog | Cat) {
  if ("bark" in animal) {
    // animal: Dog
  }
}

// 4. Custom type guard - murakkab tiplar uchun
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "name" in value;
}

// 5. Discriminated union - tag property bilan
type Result = { success: true; data: string } | { success: false; error: string };

function handle(result: Result) {
  if (result.success) {
    // result: { success: true; data: string }
  }
}
```

### 2. `is` va `asserts` keyword'lari o'rtasidagi farq nima?

**Javob:**

```typescript
// is - type predicate, boolean qaytaradi
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// Ishlatish: if block ichida narrowing
if (isString(data)) {
  // data: string (faqat bu block ichida)
  console.log(data.toUpperCase());
}
// data: unknown (tashqarida eski tip)

// asserts - assertion function, throw qiladi yoki void
function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Not a string");
  }
}

// Ishlatish: keyingi kodda narrowing
assertString(data);
// data: string (shu qatordan boshlab)
console.log(data.toUpperCase());

// QACHON QAYSI?
// is - agar false bo'lganda davom etish kerak bo'lsa
// asserts - agar false bo'lganda throw qilish kerak bo'lsa
```

### 3. Discriminated union nima va qanday afzalliklari bor?

**Javob:**

```typescript
// Discriminated union - umumiy "tag" property'ga ega union

// TAG property (discriminant)
type Shape =
  | { kind: "circle"; radius: number }     // kind = "circle"
  | { kind: "rectangle"; width: number; height: number } // kind = "rectangle"
  | { kind: "triangle"; base: number; height: number };  // kind = "triangle"

// AFZALLIKLARI:

// 1. Avtomatik narrowing
function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // shape: { kind: "circle"; radius: number }
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

// 2. Exhaustive checking
function getAreaExhaustive(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    // triangle case yo'q - ERROR!
    default:
      const _never: never = shape; // ERROR: Type '...' is not assignable to 'never'
      throw new Error("Unknown shape");
  }
}

// 3. IDE autocomplete
// shape.kind = yozganda "circle" | "rectangle" | "triangle" ko'rsatiladi

// 4. Refactoring xavfsizligi
// Yangi shape qo'shsak, barcha switch'larda error chiqadi
```

### 4. Control flow analysis qanday ishlaydi?

**Javob:**

```typescript
// TypeScript kod oqimini tahlil qilib, tiplarni avtomatik narrow qiladi

// 1. Assignment narrowing
let value: string | number;
value = "hello";
// value: string (assignment'dan keyin)

// 2. Conditional narrowing
function process(value: string | null) {
  if (value === null) {
    return; // Early return
  }
  // value: string (null case return qildi)
}

// 3. Throw narrowing
function process2(value: string | null) {
  if (value === null) {
    throw new Error("Null!");
  }
  // value: string
}

// 4. Type guard narrowing
function process3(value: unknown) {
  if (typeof value === "string") {
    // value: string
  } else if (typeof value === "number") {
    // value: number
  } else {
    // value: unknown (qolgan tiplar)
  }
}

// 5. Aliased conditions (TS 4.4+)
function process4(value: string | number) {
  const isString = typeof value === "string";
  if (isString) {
    // value: string (alias orqali narrowing)
  }
}

// CHEKLOVLAR:
// - Murakkab aliaslar ishlamasligi mumkin
// - Boolean conversion narrowing qilmaydi (!!value, Boolean(value))
// - Object property'lari har doim narrowing qilmaydi
```

### 5. `never` type narrowing'da qanday ishlatiladi?

**Javob:**

```typescript
// never - "bo'lishi mumkin emas" tipni ifodalaydi

// 1. Exhaustive check
type Status = "pending" | "approved" | "rejected";

function handleStatus(status: Status): string {
  switch (status) {
    case "pending":
      return "Waiting";
    case "approved":
      return "Done";
    case "rejected":
      return "Failed";
    default:
      // Agar barcha case'lar qoplangan bo'lsa, bu yerga yetib bo'lmaydi
      const _never: never = status;
      throw new Error(`Unknown status: ${_never}`);
  }
}

// Yangi status qo'shilsa:
type Status = "pending" | "approved" | "rejected" | "cancelled";

// Endi default case da ERROR:
// Type '"cancelled"' is not assignable to type 'never'

// 2. assertNever helper
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

// 3. Impossible intersection
type A = string & number; // never - string va number bir vaqtda bo'lmaydi

// 4. Function that never returns
function throwError(): never {
  throw new Error("Error");
}

function infiniteLoop(): never {
  while (true) {}
}
```

---

## Common Mistakes

### 1. Type Guard'da Return Type Unutish

```typescript
// YOMON: return type yo'q, narrowing ishlamaydi
function isUser(value: unknown) {
  return typeof value === "object" && value !== null && "name" in value;
}

if (isUser(data)) {
  // data: unknown (narrowing ishlamadi!)
}

// YAXSHI: type predicate qo'shish
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "name" in value;
}

if (isUser(data)) {
  // data: User
}
```

### 2. Noto'g'ri Type Guard Logikasi

```typescript
// YOMON: logika tipi bilan mos kelmaydi
function isString(value: unknown): value is string {
  return typeof value === "number"; // XATO logika, lekin TypeScript xato bermaydi!
}

const value: unknown = 42;
if (isString(value)) {
  value.toUpperCase(); // Runtime crash! value aslida number
}

// YAXSHI: logika va tip mos kelishi kerak
function isString(value: unknown): value is string {
  return typeof value === "string";
}
```

### 3. Array.filter bilan Narrowing

```typescript
// YOMON: filter tipni narrow qilmaydi
const mixed: (string | number)[] = [1, "a", 2, "b"];

const strings = mixed.filter(item => typeof item === "string");
// strings: (string | number)[] - narrowing ishlamadi!

// YAXSHI: type predicate ishlatish
const strings2 = mixed.filter((item): item is string => typeof item === "string");
// strings2: string[]
```

### 4. Truthiness Narrowing Cheklovlari

```typescript
// YOMON: empty string ham falsy
function process(value: string | null): void {
  if (value) {
    // value: string, LEKIN "" (empty string) bu yerga kirmaydi!
    console.log(value.toUpperCase());
  }
}

process(""); // Hech narsa chop etilmaydi

// YAXSHI: aniq null check
function process2(value: string | null): void {
  if (value !== null) {
    // value: string (shu jumladan "")
    console.log(value.toUpperCase());
  }
}

// Yoki agar bo'sh string kerak emas bo'lsa
function process3(value: string | null): void {
  if (value !== null && value !== "") {
    console.log(value.toUpperCase());
  }
}
```

### 5. Object Property Narrowing

```typescript
interface User {
  name: string;
  email?: string;
}

// YOMON: property check keyinroq ishlamaydi
function process(user: User): void {
  if (user.email) {
    // user.email: string (OK)
  }

  setTimeout(() => {
    if (user.email) {
      // user.email: string | undefined
      // TypeScript bilmaydi user o'zgarmadi deb
    }
  }, 1000);
}

// YAXSHI: local variable ga saqlash
function process2(user: User): void {
  const email = user.email;

  if (email) {
    setTimeout(() => {
      // email: string (const variable o'zgarmaydi)
      console.log(email.toUpperCase());
    }, 1000);
  }
}
```

### 6. Union'dan Bitta Type ni Exclude Qilishda

```typescript
// YOMON: else branch keng qoladi
function process(value: string | number | boolean): void {
  if (typeof value === "string") {
    // value: string
  } else {
    // value: number | boolean (hali ham union)
    // value.toFixed(2); // ERROR
  }
}

// YAXSHI: barcha case'larni qoplash
function process2(value: string | number | boolean): void {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  } else if (typeof value === "number") {
    console.log(value.toFixed(2));
  } else {
    console.log(value ? "Yes" : "No");
  }
}
```

---

## Xulosa

Type guards va type narrowing TypeScript'ning asosiy kuchlaridan biri:

1. **Runtime xavfsizligi** - tiplarni tekshirish runtime'da ham bajariladi
2. **IDE qo'llab-quvvatlash** - to'g'ri narrowing bilan autocomplete ishlaydi
3. **Refactoring xavfsizligi** - yangi tip qo'shilganda xatolar ko'rsatiladi
4. **Kod oqilliyi** - discriminated unions bilan murakkab state'lar oson boshqariladi

Asosiy type guard'lar:
- `typeof` - primitive tiplar uchun
- `instanceof` - class instance'lar uchun
- `in` - property mavjudligi uchun
- Custom type guards (`is`) - murakkab tiplar uchun
- Assertion functions (`asserts`) - throw qiluvchi tekshiruvlar uchun

Keyingi bo'limda Advanced Patterns'ni o'rganamiz.
