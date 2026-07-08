# TypeScript Utility Types

## Mundarija

1. [Utility Types Nima?](#utility-types-nima)
2. [Property Modifiers](#property-modifiers)
3. [Property Selection](#property-selection)
4. [Union Manipulation](#union-manipulation)
5. [Function Types](#function-types)
6. [String Manipulation](#string-manipulation)
7. [Custom Utility Types](#custom-utility-types)
8. [Real-world Cases](#real-world-cases)
9. [Interview Savollari](#interview-savollari)
10. [Common Mistakes](#common-mistakes)

---

## Utility Types Nima?

TypeScript'da utility types - bu **mavjud tiplarni transformatsiya qilish** uchun tayyor "toollar". Ular generic asosida qurilgan va yangi tiplar yaratishda vaqt tejaydi.

### Nima Uchun Kerak?

```typescript
// Muammo: har safar yangi interface yozish kerakmi?
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

// Create user uchun - id va createdAt kerak emas
interface CreateUserDto {
  name: string;
  email: string;
}

// Update user uchun - hamma field optional
interface UpdateUserDto {
  name?: string;
  email?: string;
}

// YECHIM: Utility types!
type CreateUserDto = Omit<User, "id" | "createdAt">;
type UpdateUserDto = Partial<Omit<User, "id" | "createdAt">>;
```

---

## Property Modifiers

### `Partial<T>` - Barcha Propertylarni Optional Qilish

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Barcha propertylar optional bo'ladi
type PartialUser = Partial<User>;
// {
//   id?: number;
//   name?: string;
//   email?: string;
// }

// Qo'llanilishi: Update operations
function updateUser(id: number, updates: Partial<User>): User {
  const user = findUser(id);
  return { ...user, ...updates };
}

updateUser(1, { name: "New Name" }); // Faqat name o'zgaradi
updateUser(1, { email: "new@email.com" }); // Faqat email
updateUser(1, {}); // Hech narsa o'zgarmaydi

// Ichki implementatsiya
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};
```

### `Required<T>` - Barcha Propertylarni Required Qilish

```typescript
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

// Barcha propertylar required bo'ladi
type RequiredConfig = Required<Config>;
// {
//   host: string;
//   port: number;
//   debug: boolean;
// }

// Qo'llanilishi: Default values bilan merge
function createConfig(options: Config): RequiredConfig {
  return {
    host: options.host ?? "localhost",
    port: options.port ?? 3000,
    debug: options.debug ?? false
  };
}

// Ichki implementatsiya
type MyRequired<T> = {
  [K in keyof T]-?: T[K]; // -? removes optionality
};
```

### `Readonly<T>` - Barcha Propertylarni Readonly Qilish

```typescript
interface State {
  count: number;
  items: string[];
}

// Barcha propertylar readonly
type ReadonlyState = Readonly<State>;
// {
//   readonly count: number;
//   readonly items: string[];
// }

const state: ReadonlyState = {
  count: 0,
  items: ["a", "b"]
};

// state.count = 1; // ERROR: Cannot assign to 'count'
// state.items = []; // ERROR

// DIQQAT: Shallow readonly!
state.items.push("c"); // Bu ishlaydi! Array o'zi o'zgarmaydi

// Deep readonly uchun
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

// Ichki implementatsiya
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};
```

### `Mutable<T>` (Custom) - Readonly'ni Olib Tashlash

```typescript
// TypeScript'da built-in emas, lekin oson yaratish mumkin
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

interface ReadonlyUser {
  readonly id: number;
  readonly name: string;
}

type MutableUser = Mutable<ReadonlyUser>;
// {
//   id: number;
//   name: string;
// }
```

---

## Property Selection

### `Pick<T, K>` - Aniq Propertylarni Tanlash

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Faqat tanlangan propertylar
type UserPublicInfo = Pick<User, "id" | "name" | "email">;
// {
//   id: number;
//   name: string;
//   email: string;
// }

// API response uchun (password'siz)
type UserResponse = Pick<User, "id" | "name" | "email" | "createdAt">;

// Form uchun
type UserFormData = Pick<User, "name" | "email">;

// Ichki implementatsiya
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

### `Omit<T, K>` - Aniq Propertylarni Olib Tashlash

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// password va createdAt'siz
type CreateUserDto = Omit<User, "id" | "createdAt">;
// {
//   name: string;
//   email: string;
//   password: string;
// }

// Sensitive ma'lumotlarsiz
type SafeUser = Omit<User, "password">;

// Pick bilan kombinatsiya
type UserSummary = Pick<Omit<User, "password">, "id" | "name">;

// Ichki implementatsiya
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

### `Record<K, V>` - Key-Value Map Yaratish

```typescript
// String keys, any values
type StringMap = Record<string, string>;

const translations: StringMap = {
  hello: "Salom",
  goodbye: "Xayr"
};

// Specific keys
type Status = "pending" | "approved" | "rejected";

type StatusMessages = Record<Status, string>;

const messages: StatusMessages = {
  pending: "Kutilmoqda",
  approved: "Tasdiqlangan",
  rejected: "Rad etilgan"
};

// Complex values
interface UserInfo {
  name: string;
  age: number;
}

type UserRegistry = Record<string, UserInfo>;

const users: UserRegistry = {
  user1: { name: "John", age: 25 },
  user2: { name: "Jane", age: 30 }
};

// Ichki implementatsiya
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};
```

---

## Union Manipulation

### `Exclude<T, U>` - Union'dan Tiplarni Olib Tashlash

```typescript
type AllStatus = "draft" | "pending" | "approved" | "rejected" | "deleted";

// "draft" va "deleted" ni olib tashlash
type ActiveStatus = Exclude<AllStatus, "draft" | "deleted">;
// "pending" | "approved" | "rejected"

// Primitives bilan
type NonNullable = Exclude<string | number | null | undefined, null | undefined>;
// string | number

// Practical example
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type SafeMethod = Exclude<HttpMethod, "DELETE">;
// "GET" | "POST" | "PUT" | "PATCH"

// Ichki implementatsiya
type MyExclude<T, U> = T extends U ? never : T;
```

### `Extract<T, U>` - Union'dan Tiplarni Ajratib Olish

```typescript
type AllEvents = "click" | "focus" | "blur" | "submit" | "reset";
type FormEvents = "submit" | "reset" | "change";

// Ikkala union'da bor eventlar
type CommonEvents = Extract<AllEvents, FormEvents>;
// "submit" | "reset"

// Object types bilan
type AllTypes = string | number | { x: number } | { y: string };
type OnlyObjects = Extract<AllTypes, object>;
// { x: number } | { y: string }

// Ichki implementatsiya
type MyExtract<T, U> = T extends U ? T : never;
```

### `NonNullable<T>` - null va undefined'ni Olib Tashlash

```typescript
type MaybeString = string | null | undefined;

type DefiniteString = NonNullable<MaybeString>;
// string

// Practical usage
interface User {
  id: number;
  name: string;
  email: string | null;
  phone?: string;
}

type UserEmail = NonNullable<User["email"]>;
// string

// Function bilan
function processValue<T>(value: T): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined");
  }
  return value as NonNullable<T>;
}

// Ichki implementatsiya
type MyNonNullable<T> = T extends null | undefined ? never : T;
```

---

## Function Types

### `Parameters<T>` - Funksiya Parametrlarini Olish

```typescript
function createUser(name: string, age: number, isAdmin: boolean): void {
  // ...
}

type CreateUserParams = Parameters<typeof createUser>;
// [string, number, boolean]

// Individual parameter
type FirstParam = CreateUserParams[0]; // string
type SecondParam = CreateUserParams[1]; // number

// Generic function bilan
type FetchParams = Parameters<typeof fetch>;
// [input: RequestInfo | URL, init?: RequestInit | undefined]

// Practical usage: wrapper function
function loggedCreateUser(...args: Parameters<typeof createUser>): void {
  console.log("Creating user:", args);
  return createUser(...args);
}

// Ichki implementatsiya
type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;
```

### `ReturnType<T>` - Funksiya Return Tipini Olish

```typescript
function getUser(): { id: number; name: string } {
  return { id: 1, name: "John" };
}

type User = ReturnType<typeof getUser>;
// { id: number; name: string }

// Async function
async function fetchUser(): Promise<User> {
  return { id: 1, name: "John" };
}

type FetchUserReturn = ReturnType<typeof fetchUser>;
// Promise<{ id: number; name: string }>

// Unwrap Promise
type AwaitedUser = Awaited<ReturnType<typeof fetchUser>>;
// { id: number; name: string }

// Ichki implementatsiya
type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;
```

### `ConstructorParameters<T>` - Constructor Parametrlarini Olish

```typescript
class User {
  constructor(
    public name: string,
    public age: number,
    public email?: string
  ) {}
}

type UserConstructorParams = ConstructorParameters<typeof User>;
// [name: string, age: number, email?: string | undefined]

// Factory function
function createInstance<T extends new (...args: any) => any>(
  Ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new Ctor(...args);
}

const user = createInstance(User, "John", 25, "john@example.com");

// Ichki implementatsiya
type MyConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never;
```

### `InstanceType<T>` - Constructor'dan Instance Tipini Olish

```typescript
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

type UserInstance = InstanceType<typeof User>;
// User

// Abstract class bilan
abstract class BaseEntity {
  abstract id: string;
}

type Entity = InstanceType<typeof BaseEntity>;
// BaseEntity (abstract ham ishlaydi)

// Ichki implementatsiya
type MyInstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : any;
```

### `ThisParameterType<T>` va `OmitThisParameter<T>`

```typescript
function greet(this: { name: string }, greeting: string): string {
  return `${greeting}, ${this.name}!`;
}

type GreetThisType = ThisParameterType<typeof greet>;
// { name: string }

type GreetWithoutThis = OmitThisParameter<typeof greet>;
// (greeting: string) => string

// Practical usage: bind simulation
function bindThis<T extends (this: any, ...args: any[]) => any>(
  fn: T,
  thisArg: ThisParameterType<T>
): OmitThisParameter<T> {
  return fn.bind(thisArg);
}

const boundGreet = bindThis(greet, { name: "John" });
boundGreet("Hello"); // "Hello, John!"
```

---

## String Manipulation

TypeScript 4.1+ dan string literal type transformations mavjud:

### `Uppercase<T>` va `Lowercase<T>`

```typescript
type Shout = Uppercase<"hello">; // "HELLO"
type Whisper = Lowercase<"HELLO">; // "hello"

// Practical usage
type EventName = "click" | "focus" | "blur";
type UpperEventName = Uppercase<EventName>;
// "CLICK" | "FOCUS" | "BLUR"

// Event handler naming
type EventHandler<T extends string> = `on${Capitalize<T>}`;
type ClickHandler = EventHandler<"click">; // "onClick"
```

### `Capitalize<T>` va `Uncapitalize<T>`

```typescript
type Title = Capitalize<"hello world">; // "Hello world"
type Untitled = Uncapitalize<"Hello World">; // "hello World"

// Practical: property to getter
type PropertyName = "name" | "age" | "email";
type GetterName<T extends string> = `get${Capitalize<T>}`;
type Getters = GetterName<PropertyName>;
// "getName" | "getAge" | "getEmail"
```

### Template Literal Types

```typescript
// Event system
type EventName = "click" | "focus" | "blur";
type Handler = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur"

// CSS properties
type CSSUnit = "px" | "em" | "rem" | "%";
type CSSValue = `${number}${CSSUnit}`;

const width: CSSValue = "100px";
const margin: CSSValue = "1.5em";
// const bad: CSSValue = "100"; // ERROR

// API endpoints
type Resource = "users" | "posts" | "comments";
type Method = "GET" | "POST" | "PUT" | "DELETE";
type Endpoint = `/${Resource}`;
type Route = `${Method} ${Endpoint}`;
// "GET /users" | "POST /users" | ... (12 combinations)
```

---

## Custom Utility Types

### `DeepPartial<T>` - Chuqur Optional

```typescript
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

interface Config {
  database: {
    host: string;
    port: number;
    credentials: {
      user: string;
      password: string;
    };
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
}

type PartialConfig = DeepPartial<Config>;

const config: PartialConfig = {
  database: {
    host: "localhost"
    // port, credentials optional
  }
  // cache optional
};
```

### `DeepReadonly<T>` - Chuqur Readonly

```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K];
};

interface State {
  user: {
    name: string;
    settings: {
      theme: string;
      notifications: boolean;
    };
  };
}

type ImmutableState = DeepReadonly<State>;

const state: ImmutableState = {
  user: {
    name: "John",
    settings: {
      theme: "dark",
      notifications: true
    }
  }
};

// state.user.settings.theme = "light"; // ERROR
```

### `Nullable<T>` - Null bo'lishi Mumkin

```typescript
type Nullable<T> = T | null;

// Object uchun
type NullableProps<T> = {
  [K in keyof T]: Nullable<T[K]>;
};

interface User {
  name: string;
  email: string;
}

type NullableUser = NullableProps<User>;
// {
//   name: string | null;
//   email: string | null;
// }
```

### `PartialBy<T, K>` - Aniq Keylarni Optional Qilish

```typescript
type PartialBy<T, K extends keyof T> =
  Omit<T, K> & Partial<Pick<T, K>>;

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

// Faqat email optional
type UserWithOptionalEmail = PartialBy<User, "email">;
// {
//   id: number;
//   name: string;
//   email?: string;
//   createdAt: Date;
// }
```

### `RequiredBy<T, K>` - Aniq Keylarni Required Qilish

```typescript
type RequiredBy<T, K extends keyof T> =
  Omit<T, K> & Required<Pick<T, K>>;

interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

// host va port required, debug optional
type ProductionConfig = RequiredBy<Config, "host" | "port">;
// {
//   host: string;
//   port: number;
//   debug?: boolean;
// }
```

### `ValueOf<T>` - Object Valualarning Tipini Olish

```typescript
type ValueOf<T> = T[keyof T];

interface User {
  id: number;
  name: string;
  isActive: boolean;
}

type UserValue = ValueOf<User>;
// number | string | boolean

// Const object bilan
const STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
} as const;

type StatusValue = ValueOf<typeof STATUS>;
// "pending" | "approved" | "rejected"
```

### `Entries<T>` - Object.entries() tipi

```typescript
type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

interface User {
  name: string;
  age: number;
}

type UserEntries = Entries<User>;
// (["name", string] | ["age", number])[]
```

---

## Real-world Cases

### Case 1: Form State Management

```typescript
// Base form interface
interface UserForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

// Form field states
type FormFieldState<T> = {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
};

// Full form state
type FormState<T> = {
  [K in keyof T]: FormFieldState<T[K]>;
};

// Create initial state utility
function createFormState<T extends Record<string, unknown>>(
  initial: T
): FormState<T> {
  const state = {} as FormState<T>;

  for (const key in initial) {
    state[key] = {
      value: initial[key],
      error: null,
      touched: false,
      dirty: false
    } as FormFieldState<T[typeof key]>;
  }

  return state;
}

// Validation errors type
type ValidationErrors<T> = Partial<Record<keyof T, string>>;

// Submit data type (only values)
type FormSubmitData<T> = T;

// Usage
const initialForm: UserForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false
};

const formState = createFormState(initialForm);
// FormState<UserForm>

type UserValidationErrors = ValidationErrors<UserForm>;
// { name?: string; email?: string; ... }
```

### Case 2: API Response Handling

```typescript
// Base API response
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: number;
    requestId: string;
  };
}

// Paginated response
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

// Result type (success or error)
type ApiResult<T> = ApiResponse<T> | ApiError;

// Extract data type from response
type ExtractData<T> = T extends ApiResponse<infer D> ? D : never;

// Make API endpoints type-safe
interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
}

// Endpoint definitions
interface ApiEndpoints {
  "/users": {
    GET: ApiResponse<User[]>;
    POST: ApiResponse<User>;
  };
  "/users/:id": {
    GET: ApiResponse<User>;
    PUT: ApiResponse<User>;
    DELETE: ApiResponse<{ success: boolean }>;
  };
  "/posts": {
    GET: PaginatedResponse<Post>;
    POST: ApiResponse<Post>;
  };
}

// Type-safe fetch wrapper
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type EndpointResponse<
  Path extends keyof ApiEndpoints,
  Method extends keyof ApiEndpoints[Path]
> = ApiEndpoints[Path][Method];

// Usage example
type UsersGetResponse = EndpointResponse<"/users", "GET">;
// ApiResponse<User[]>

type PostsGetResponse = EndpointResponse<"/posts", "GET">;
// PaginatedResponse<Post>
```

### Case 3: Event System with Type Safety

```typescript
// Event map
interface EventMap {
  userLogin: { userId: string; timestamp: number };
  userLogout: { userId: string };
  pageView: { path: string; referrer?: string };
  purchase: { productId: string; amount: number; currency: string };
}

// Event names
type EventName = keyof EventMap;

// Event payload
type EventPayload<E extends EventName> = EventMap[E];

// Event handler
type EventHandler<E extends EventName> = (payload: EventPayload<E>) => void;

// Event listener registration
type EventListeners = {
  [E in EventName]?: EventHandler<E>[];
};

// Event emitter class
class TypedEventEmitter {
  private listeners: EventListeners = {};

  on<E extends EventName>(event: E, handler: EventHandler<E>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    (this.listeners[event] as EventHandler<E>[]).push(handler);

    return () => this.off(event, handler);
  }

  off<E extends EventName>(event: E, handler: EventHandler<E>): void {
    const handlers = this.listeners[event] as EventHandler<E>[] | undefined;
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    }
  }

  emit<E extends EventName>(event: E, payload: EventPayload<E>): void {
    const handlers = this.listeners[event] as EventHandler<E>[] | undefined;
    handlers?.forEach(handler => handler(payload));
  }
}

// Usage
const emitter = new TypedEventEmitter();

emitter.on("userLogin", ({ userId, timestamp }) => {
  // userId: string, timestamp: number - fully typed
  console.log(`User ${userId} logged in at ${timestamp}`);
});

emitter.emit("userLogin", { userId: "123", timestamp: Date.now() });

// Type error
// emitter.emit("userLogin", { userId: "123" }); // ERROR: missing timestamp
```

---

## Interview Savollari

### 1. `Partial<T>` va `Required<T>` qanday ishlaydi?

**Javob:**

```typescript
// Partial - barcha propertylarni optional qiladi
type MyPartial<T> = {
  [K in keyof T]?: T[K]; // ? qo'shadi
};

interface User {
  name: string;
  age: number;
}

type PartialUser = Partial<User>;
// { name?: string; age?: number }

// Required - barcha propertylarni required qiladi
type MyRequired<T> = {
  [K in keyof T]-?: T[K]; // -? olib tashlaydi (double negative)
};

interface Config {
  host?: string;
  port?: number;
}

type RequiredConfig = Required<Config>;
// { host: string; port: number }

// Amaliy qo'llanish
// Partial - update operations
function updateUser(id: number, updates: Partial<User>): void {
  // Faqat o'zgargan fieldlarni yangilash
}

// Required - validation keyin
function processConfig(config: Required<Config>): void {
  // Barcha field mavjudligiga ishonch
}
```

### 2. `Pick<T, K>` va `Omit<T, K>` farqi nima?

**Javob:**

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Pick - tanlangan keylarni OLADI
type UserPublic = Pick<User, "id" | "name" | "email">;
// { id: number; name: string; email: string }

// Omit - tanlangan keylarni OLIB TASHLAYDI
type UserPublic2 = Omit<User, "password">;
// { id: number; name: string; email: string }

// Pick implementation
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit implementation (Pick va Exclude kombinatsiyasi)
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// Qachon qaysi?
// - Pick: kam property kerak bo'lganda
// - Omit: ko'p property kerak, kam olib tashlash
```

### 3. `Exclude<T, U>` va `Extract<T, U>` nima qiladi?

**Javob:**

```typescript
// Ikkisi ham UNION tiplar bilan ishlaydi (object emas!)

type All = "a" | "b" | "c" | "d";

// Exclude - U'dagi tiplarni T'dan OLIB TASHLAYDI
type WithoutAB = Exclude<All, "a" | "b">;
// "c" | "d"

// Extract - U'dagi tiplarni T'dan AJRATIB OLADI
type OnlyAB = Extract<All, "a" | "b">;
// "a" | "b"

// Implementation
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;

// Practical example
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ReadMethod = Extract<HttpMethod, "GET">;
// "GET"
type WriteMethod = Exclude<HttpMethod, "GET">;
// "POST" | "PUT" | "DELETE"

// Object types bilan
type Mixed = string | number | { x: number } | null;
type OnlyObjects = Extract<Mixed, object>;
// { x: number }
type OnlyPrimitives = Exclude<Mixed, object>;
// string | number | null
```

### 4. `infer` keyword qanday ishlaydi utility types'da?

**Javob:**

```typescript
// infer - conditional type ichida yangi type variable yaratadi

// ReturnType implementation
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
//                                               ^^^^^
//                                               R - inferred return type

function greet(): string { return "hello"; }
type GreetReturn = ReturnType<typeof greet>; // string

// Parameters implementation
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
//                                      ^^^^^^^
//                                      P - inferred parameter tuple

function add(a: number, b: number): number { return a + b; }
type AddParams = Parameters<typeof add>; // [number, number]

// Custom: array element type
type ArrayElement<T> = T extends (infer E)[] ? E : never;

type NumEl = ArrayElement<number[]>; // number

// Custom: promise unwrap
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

type A = Awaited<Promise<Promise<string>>>; // string (recursive)

// Custom: first argument
type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

type First = FirstArg<(a: string, b: number) => void>; // string
```

### 5. Mapped types nima va qanday ishlaydi?

**Javob:**

```typescript
// Mapped type - mavjud tipdan yangi tip yaratish
// Sintaksis: { [K in Keys]: ValueType }

// Basic example
type OptionsFlags<T> = {
  [K in keyof T]: boolean;
};

interface Features {
  darkMode: () => void;
  notifications: () => void;
}

type FeatureFlags = OptionsFlags<Features>;
// { darkMode: boolean; notifications: boolean }

// Modifier manipulation
// + / - (add or remove)
// ? (optional)
// readonly

type Mutable<T> = {
  -readonly [K in keyof T]: T[K]; // remove readonly
};

type Concrete<T> = {
  [K in keyof T]-?: T[K]; // remove optional
};

// Key remapping (as clause)
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface User {
  name: string;
  age: number;
}

type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number }

// Filter keys
type FilteredKeys<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type StringProps = FilteredKeys<User, string>;
// { name: string }
```

---

## Common Mistakes

### 1. Object uchun `Exclude` Ishlatish

```typescript
// YOMON - Exclude union uchun, object uchun emas
interface User {
  id: number;
  name: string;
  email: string;
}

type BadOmit = Exclude<User, "id">; // Bu ishlamaydi!
// User (hech narsa o'zgarmadi)

// YAXSHI - Omit ishlatish
type GoodOmit = Omit<User, "id">;
// { name: string; email: string }
```

### 2. `Readonly` Shallow Ekanini Unutish

```typescript
interface State {
  user: {
    name: string;
    settings: {
      theme: string;
    };
  };
}

type ReadonlyState = Readonly<State>;

const state: ReadonlyState = {
  user: {
    name: "John",
    settings: { theme: "dark" }
  }
};

// state.user = {}; // ERROR - to'g'ri

// LEKIN:
state.user.name = "Jane"; // Bu ishlaydi! (shallow readonly)
state.user.settings.theme = "light"; // Bu ham ishlaydi!

// YAXSHI - DeepReadonly ishlatish
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};
```

### 3. `Record` bilan Key Constraint'ni Yo'qotish

```typescript
// YOMON - barcha stringlar ruxsat
type StatusMap = Record<string, { label: string }>;

const statuses: StatusMap = {
  pending: { label: "Pending" },
  typo: { label: "Typo" } // No error for typos!
};

// YAXSHI - aniq keylar
type Status = "pending" | "approved" | "rejected";
type StatusMap = Record<Status, { label: string }>;

const statuses: StatusMap = {
  pending: { label: "Pending" },
  approved: { label: "Approved" },
  rejected: { label: "Rejected" }
  // typo: {} // ERROR - extra key
};
```

### 4. `Parameters` Tuple Destructuring

```typescript
function greet(name: string, age: number): void {}

// YOMON - tuple index
type Params = Parameters<typeof greet>;
const name: Params[0] = "John";
const age: Params[1] = 25;

// YAXSHI - agar alohida kerak bo'lsa, interface yozing
interface GreetParams {
  name: string;
  age: number;
}

// Yoki wrapper function bilan spread
function wrappedGreet(...args: Parameters<typeof greet>): void {
  greet(...args);
}
```

### 5. Utility Types'ni Haddan Tashqari Nesting Qilish

```typescript
// YOMON - o'qib bo'lmaydigan
type ComplexType = Required<Partial<Pick<Omit<User, "id">, "name" | "email">>>;

// YAXSHI - intermediate types
type UserWithoutId = Omit<User, "id">;
type UserNameEmail = Pick<UserWithoutId, "name" | "email">;
type PartialUserNameEmail = Partial<UserNameEmail>;
type FinalType = Required<PartialUserNameEmail>;

// Yoki type alias bilan
type CreateUserDto = Omit<User, "id" | "createdAt">;
type UpdateUserDto = Partial<CreateUserDto>;
```

### 6. `as const` ni Unutish

```typescript
// YOMON - widened types
const STATUS = {
  PENDING: "pending",
  APPROVED: "approved"
};

type Status = typeof STATUS[keyof typeof STATUS];
// string (too wide!)

// YAXSHI - as const
const STATUS = {
  PENDING: "pending",
  APPROVED: "approved"
} as const;

type Status = typeof STATUS[keyof typeof STATUS];
// "pending" | "approved" (precise!)
```

---

## Xulosa

Utility types TypeScript'ning eng kuchli xususiyatlaridan biri. Ular:

1. **DRY prinsipi** - bir interface'dan ko'p variant yaratish
2. **Type safety** - compile-time'da xatolarni ushlash
3. **Maintainability** - bir joyda o'zgarish, hamma joyda yangilanish
4. **IDE support** - mukammal autocomplete

Asosiy utility types:
- **Property modifiers:** `Partial`, `Required`, `Readonly`
- **Property selection:** `Pick`, `Omit`, `Record`
- **Union manipulation:** `Exclude`, `Extract`, `NonNullable`
- **Function types:** `Parameters`, `ReturnType`, `InstanceType`
- **String manipulation:** `Uppercase`, `Lowercase`, `Capitalize`

Keyingi bo'limda Strict Mode'ni chuqur o'rganamiz.
