# Testing Patterns

Testing patterns - bu takrorlanadigan test muammolarini hal qilish uchun ishlatiladigan yondashuvlar va best practice'lar. Bu bo'limda eng muhim testing pattern'larni o'rganamiz.

## Arrange-Act-Assert (AAA)

Eng keng tarqalgan test strukturasi pattern. Testni uch qismga ajratadi.

### AAA Pattern

```typescript
test('user registration creates new account', async () => {
  // ARRANGE - Test uchun kerakli ma'lumotlarni tayyorlash
  const userService = new UserService(mockRepository)
  const userData = {
    email: 'test@example.com',
    password: 'SecurePass123!',
    name: 'Test User'
  }

  // ACT - Test qilinayotgan kodni chaqirish
  const result = await userService.register(userData)

  // ASSERT - Natijani tekshirish
  expect(result.success).toBe(true)
  expect(result.user.email).toBe('test@example.com')
  expect(result.user.id).toBeDefined()
})
```

### Complex AAA Example

```typescript
describe('ShoppingCart', () => {
  test('checkout calculates total with discount', async () => {
    // ARRANGE
    const cart = new ShoppingCart()
    const products = [
      { id: 1, name: 'Laptop', price: 1000 },
      { id: 2, name: 'Mouse', price: 50 }
    ]
    const coupon = { code: 'SAVE20', discountPercent: 20 }

    products.forEach(p => cart.addItem(p))

    // ACT
    const result = await cart.checkout(coupon)

    // ASSERT
    expect(result.subtotal).toBe(1050)
    expect(result.discount).toBe(210)
    expect(result.total).toBe(840)
    expect(result.appliedCoupon).toBe('SAVE20')
  })
})
```

## Given-When-Then (BDD)

Behavior-Driven Development pattern. Test natural language'ga yaqin bo'ladi.

### GWT Pattern

```typescript
describe('Login Feature', () => {
  describe('Given valid credentials', () => {
    const credentials = {
      email: 'user@example.com',
      password: 'validPassword123'
    }

    describe('When user submits login form', () => {
      let result: LoginResult

      beforeEach(async () => {
        result = await authService.login(credentials)
      })

      it('Then user is authenticated', () => {
        expect(result.authenticated).toBe(true)
      })

      it('Then access token is returned', () => {
        expect(result.accessToken).toBeDefined()
        expect(typeof result.accessToken).toBe('string')
      })

      it('Then user session is created', () => {
        expect(result.session).toBeDefined()
        expect(result.session.userId).toBeDefined()
      })
    })
  })

  describe('Given invalid credentials', () => {
    const credentials = {
      email: 'user@example.com',
      password: 'wrongPassword'
    }

    describe('When user submits login form', () => {
      it('Then error is returned', async () => {
        const result = await authService.login(credentials)

        expect(result.authenticated).toBe(false)
        expect(result.error).toBe('Invalid credentials')
      })

      it('Then no token is returned', async () => {
        const result = await authService.login(credentials)

        expect(result.accessToken).toBeUndefined()
      })
    })
  })
})
```

### GWT with Cucumber-style

```typescript
// More explicit GWT
describe('Order Processing', () => {
  let order: Order
  let paymentResult: PaymentResult

  // GIVEN
  function givenAnOrderWithItems(items: OrderItem[]) {
    order = new Order()
    items.forEach(item => order.addItem(item))
  }

  function givenValidPaymentMethod() {
    order.setPaymentMethod({
      type: 'card',
      token: 'valid_token'
    })
  }

  // WHEN
  async function whenOrderIsProcessed() {
    paymentResult = await orderService.processPayment(order)
  }

  // THEN
  function thenPaymentIsSuccessful() {
    expect(paymentResult.success).toBe(true)
  }

  function thenOrderStatusIsConfirmed() {
    expect(order.status).toBe('confirmed')
  }

  // Tests
  test('successful order processing', async () => {
    // Given
    givenAnOrderWithItems([
      { productId: 1, quantity: 2, price: 100 }
    ])
    givenValidPaymentMethod()

    // When
    await whenOrderIsProcessed()

    // Then
    thenPaymentIsSuccessful()
    thenOrderStatusIsConfirmed()
  })
})
```

## Test Doubles

Test double - bu real dependency o'rniga test uchun ishlatiladigan object.

### Dummy

Hech qanday ish qilmaydi, faqat parameter to'ldirish uchun.

```typescript
// Dummy - faqat kerak bo'lgan joyga qo'yish uchun
class DummyLogger implements Logger {
  log(message: string): void {}
  error(message: string): void {}
  warn(message: string): void {}
}

test('service works without logging', () => {
  // Logger kerak, lekin hech narsa qilmasin
  const service = new UserService(realRepo, new DummyLogger())

  const result = service.createUser({ name: 'Test' })

  expect(result).toBeDefined()
})
```

### Stub

Oldindan belgilangan qiymatlar qaytaradi.

```typescript
// Stub - belgilangan javoblar
class StubUserRepository implements UserRepository {
  async findById(id: number): Promise<User | null> {
    if (id === 1) {
      return { id: 1, name: 'Stub User', email: 'stub@example.com' }
    }
    return null
  }

  async findAll(): Promise<User[]> {
    return [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' }
    ]
  }
}

test('user service returns user from stub', async () => {
  const service = new UserService(new StubUserRepository())

  const user = await service.getUser(1)

  expect(user.name).toBe('Stub User')
})
```

### Mock

Chaqiruvlarni kuzatadi va verify qiladi.

```typescript
import { vi, expect, test, describe, beforeEach } from 'vitest'

describe('Mock example', () => {
  test('verifies method calls', async () => {
    // Mock
    const mockEmailService = {
      send: vi.fn().mockResolvedValue({ success: true })
    }

    const notificationService = new NotificationService(mockEmailService)

    await notificationService.sendWelcomeEmail({
      email: 'user@example.com',
      name: 'John'
    })

    // Verify mock was called correctly
    expect(mockEmailService.send).toHaveBeenCalledTimes(1)
    expect(mockEmailService.send).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: expect.stringContaining('Welcome'),
      body: expect.stringContaining('John')
    })
  })

  test('mock with different responses', async () => {
    const mockApi = {
      fetch: vi.fn()
        .mockResolvedValueOnce({ data: 'first' })
        .mockResolvedValueOnce({ data: 'second' })
        .mockRejectedValueOnce(new Error('Failed'))
    }

    const result1 = await mockApi.fetch()
    const result2 = await mockApi.fetch()

    expect(result1.data).toBe('first')
    expect(result2.data).toBe('second')

    await expect(mockApi.fetch()).rejects.toThrow('Failed')
  })
})
```

### Spy

Real funksiyani chaqiradi, lekin kuzatadi.

```typescript
import { vi, expect, test, afterEach } from 'vitest'

const calculator = {
  add(a: number, b: number) {
    return a + b
  },
  multiply(a: number, b: number) {
    return a * b
  }
}

test('spy tracks real function calls', () => {
  const addSpy = vi.spyOn(calculator, 'add')

  const result = calculator.add(2, 3)

  // Real function executed
  expect(result).toBe(5)

  // But calls are tracked
  expect(addSpy).toHaveBeenCalledWith(2, 3)
  expect(addSpy).toHaveBeenCalledTimes(1)

  addSpy.mockRestore()
})

test('spy can override behavior', () => {
  const multiplySpy = vi.spyOn(calculator, 'multiply')
    .mockReturnValue(100)

  const result = calculator.multiply(2, 3)

  expect(result).toBe(100) // Mocked value
  expect(multiplySpy).toHaveBeenCalledWith(2, 3)

  multiplySpy.mockRestore()
})
```

### Fake

Ishlaydig'an, lekin soddalashtirilgan implementation.

```typescript
// Fake - working but simplified implementation
class FakeUserRepository implements UserRepository {
  private users = new Map<number, User>()
  private nextId = 1

  async save(userData: Omit<User, 'id'>): Promise<User> {
    const user = { ...userData, id: this.nextId++ }
    this.users.set(user.id, user)
    return user
  }

  async findById(id: number): Promise<User | null> {
    return this.users.get(id) || null
  }

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values())
      .find(u => u.email === email) || null
  }

  async delete(id: number): Promise<boolean> {
    return this.users.delete(id)
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values())
  }

  // Test helper
  clear(): void {
    this.users.clear()
    this.nextId = 1
  }
}

describe('UserService with Fake', () => {
  let fakeRepo: FakeUserRepository
  let userService: UserService

  beforeEach(() => {
    fakeRepo = new FakeUserRepository()
    userService = new UserService(fakeRepo)
  })

  test('creates and retrieves user', async () => {
    const created = await userService.createUser({
      name: 'John',
      email: 'john@example.com'
    })

    const retrieved = await userService.getUser(created.id)

    expect(retrieved).toEqual(created)
  })

  test('prevents duplicate emails', async () => {
    await userService.createUser({
      name: 'John',
      email: 'john@example.com'
    })

    await expect(
      userService.createUser({
        name: 'Jane',
        email: 'john@example.com'
      })
    ).rejects.toThrow('Email already exists')
  })
})
```

## Builder Pattern

Test data yaratish uchun fluent API.

```typescript
// User Builder
class UserBuilder {
  private user: Partial<User> = {
    id: 1,
    name: 'Default User',
    email: 'default@example.com',
    role: 'user',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    settings: {
      notifications: true,
      theme: 'light'
    }
  }

  withId(id: number): this {
    this.user.id = id
    return this
  }

  withName(name: string): this {
    this.user.name = name
    return this
  }

  withEmail(email: string): this {
    this.user.email = email
    return this
  }

  asAdmin(): this {
    this.user.role = 'admin'
    return this
  }

  asModerator(): this {
    this.user.role = 'moderator'
    return this
  }

  inactive(): this {
    this.user.isActive = false
    return this
  }

  withDarkTheme(): this {
    this.user.settings = { ...this.user.settings, theme: 'dark' }
    return this
  }

  build(): User {
    return { ...this.user } as User
  }
}

// Order Builder
class OrderBuilder {
  private order: Partial<Order> = {
    id: 1,
    userId: 1,
    items: [],
    status: 'pending',
    createdAt: new Date()
  }

  withId(id: number): this {
    this.order.id = id
    return this
  }

  forUser(userId: number): this {
    this.order.userId = userId
    return this
  }

  withItem(productId: number, quantity: number, price: number): this {
    this.order.items!.push({ productId, quantity, price })
    return this
  }

  withStatus(status: OrderStatus): this {
    this.order.status = status
    return this
  }

  confirmed(): this {
    return this.withStatus('confirmed')
  }

  shipped(): this {
    return this.withStatus('shipped')
  }

  build(): Order {
    return {
      ...this.order,
      total: this.order.items!.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
    } as Order
  }
}

// Usage in tests
describe('Order Processing', () => {
  test('confirmed order can be shipped', () => {
    const user = new UserBuilder()
      .withId(1)
      .withName('Customer')
      .build()

    const order = new OrderBuilder()
      .forUser(user.id)
      .withItem(1, 2, 100)
      .withItem(2, 1, 50)
      .confirmed()
      .build()

    const result = orderService.ship(order)

    expect(result.status).toBe('shipped')
  })

  test('admin user has full access', () => {
    const admin = new UserBuilder()
      .withName('Admin User')
      .asAdmin()
      .build()

    expect(hasFullAccess(admin)).toBe(true)
  })
})
```

## Factory Pattern

Test data yaratish uchun factory functions.

```typescript
// Simple factory
function createUser(overrides: Partial<User> = {}): User {
  return {
    id: Math.floor(Math.random() * 10000),
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    ...overrides
  }
}

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: Math.floor(Math.random() * 10000),
    name: 'Test Product',
    price: 100,
    category: 'general',
    stock: 10,
    ...overrides
  }
}

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: Math.floor(Math.random() * 10000),
    userId: 1,
    items: [],
    status: 'pending',
    total: 0,
    createdAt: new Date(),
    ...overrides
  }
}

// Advanced factory with traits
interface FactoryTraits<T> {
  [key: string]: Partial<T>
}

class Factory<T> {
  private defaults: () => T
  private traits: FactoryTraits<T> = {}

  constructor(defaults: () => T) {
    this.defaults = defaults
  }

  trait(name: string, attributes: Partial<T>): this {
    this.traits[name] = attributes
    return this
  }

  build(...traitsAndOverrides: (string | Partial<T>)[]): T {
    let result = this.defaults()

    for (const item of traitsAndOverrides) {
      if (typeof item === 'string') {
        result = { ...result, ...this.traits[item] }
      } else {
        result = { ...result, ...item }
      }
    }

    return result
  }

  buildList(count: number, ...traitsAndOverrides: (string | Partial<T>)[]): T[] {
    return Array.from({ length: count }, () =>
      this.build(...traitsAndOverrides)
    )
  }
}

// Define factories
const userFactory = new Factory(() => ({
  id: Math.floor(Math.random() * 10000),
  name: 'Test User',
  email: `test-${Date.now()}@example.com`,
  role: 'user' as const,
  isActive: true,
  createdAt: new Date()
}))
  .trait('admin', { role: 'admin' })
  .trait('inactive', { isActive: false })
  .trait('moderator', { role: 'moderator' })

// Usage
test('factory usage', () => {
  const regularUser = userFactory.build()
  const adminUser = userFactory.build('admin')
  const inactiveAdmin = userFactory.build('admin', 'inactive')
  const customUser = userFactory.build({ name: 'Custom Name' })

  const users = userFactory.buildList(5, 'admin')

  expect(adminUser.role).toBe('admin')
  expect(inactiveAdmin.isActive).toBe(false)
  expect(users).toHaveLength(5)
})
```

## Object Mother Pattern

Predefined test objects collection.

```typescript
// Object Mother - predefined test data
class TestUsers {
  static admin(): User {
    return {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2024-01-01')
    }
  }

  static customer(): User {
    return {
      id: 2,
      name: 'Customer',
      email: 'customer@example.com',
      role: 'user',
      isActive: true,
      createdAt: new Date('2024-01-15')
    }
  }

  static inactiveUser(): User {
    return {
      id: 3,
      name: 'Inactive User',
      email: 'inactive@example.com',
      role: 'user',
      isActive: false,
      createdAt: new Date('2023-01-01')
    }
  }

  static newUser(): User {
    return {
      id: 4,
      name: 'New User',
      email: `new-${Date.now()}@example.com`,
      role: 'user',
      isActive: true,
      createdAt: new Date()
    }
  }
}

class TestOrders {
  static pendingOrder(): Order {
    return {
      id: 1,
      userId: TestUsers.customer().id,
      items: [
        { productId: 1, quantity: 2, price: 100 }
      ],
      status: 'pending',
      total: 200,
      createdAt: new Date()
    }
  }

  static confirmedOrder(): Order {
    return {
      ...this.pendingOrder(),
      id: 2,
      status: 'confirmed'
    }
  }

  static emptyOrder(): Order {
    return {
      id: 3,
      userId: TestUsers.customer().id,
      items: [],
      status: 'pending',
      total: 0,
      createdAt: new Date()
    }
  }
}

// Usage
describe('Order Service', () => {
  test('admin can cancel any order', () => {
    const admin = TestUsers.admin()
    const order = TestOrders.confirmedOrder()

    const result = orderService.cancel(order, admin)

    expect(result.success).toBe(true)
  })

  test('customer can only cancel pending orders', () => {
    const customer = TestUsers.customer()
    const confirmedOrder = TestOrders.confirmedOrder()

    expect(() => orderService.cancel(confirmedOrder, customer))
      .toThrow('Cannot cancel confirmed order')
  })
})
```

## Fixture Pattern

Reusable test data va setup.

```typescript
// fixtures/auth.fixture.ts
import { test as base } from '@playwright/test'

interface AuthFixture {
  loggedInUser: User
  adminUser: User
  authToken: string
}

export const test = base.extend<AuthFixture>({
  loggedInUser: async ({ page }, use) => {
    const user = await createTestUser()
    await loginUser(page, user)
    await use(user)
    await cleanupUser(user)
  },

  adminUser: async ({ page }, use) => {
    const admin = await createTestAdmin()
    await loginUser(page, admin)
    await use(admin)
    await cleanupUser(admin)
  },

  authToken: async ({ request }, use) => {
    const response = await request.post('/api/auth/login', {
      data: { email: 'test@example.com', password: 'password' }
    })
    const { token } = await response.json()
    await use(token)
  }
})

// fixtures/database.fixture.ts
import { test as base } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface DatabaseFixture {
  db: PrismaClient
  seedUsers: () => Promise<User[]>
  seedProducts: () => Promise<Product[]>
}

export const test = base.extend<DatabaseFixture>({
  db: async ({}, use) => {
    // Start transaction
    await prisma.$executeRaw`BEGIN`

    await use(prisma)

    // Rollback
    await prisma.$executeRaw`ROLLBACK`
  },

  seedUsers: async ({ db }, use) => {
    const seedFn = async () => {
      return db.user.createMany({
        data: [
          { name: 'User 1', email: 'user1@test.com' },
          { name: 'User 2', email: 'user2@test.com' }
        ]
      })
    }
    await use(seedFn)
  }
})
```

## Parameterized Tests

Bir xil test, turli xil input'lar bilan.

```typescript
import { describe, test, expect } from 'vitest'

// test.each bilan
describe('Email Validation', () => {
  test.each([
    { email: 'valid@example.com', expected: true },
    { email: 'user.name@domain.org', expected: true },
    { email: 'user+tag@example.com', expected: true },
    { email: 'invalid', expected: false },
    { email: '@nodomain.com', expected: false },
    { email: 'missing.at.sign', expected: false },
    { email: '', expected: false },
    { email: 'spaces in@email.com', expected: false }
  ])('validateEmail($email) returns $expected', ({ email, expected }) => {
    expect(validateEmail(email)).toBe(expected)
  })
})

// Array format
describe('Calculator', () => {
  test.each([
    [1, 1, 2],
    [2, 3, 5],
    [-1, 1, 0],
    [100, 200, 300]
  ])('add(%i, %i) = %i', (a, b, expected) => {
    expect(add(a, b)).toBe(expected)
  })

  test.each([
    [10, 2, 5],
    [9, 3, 3],
    [100, 10, 10],
    [7, 2, 3.5]
  ])('divide(%i, %i) = %f', (a, b, expected) => {
    expect(divide(a, b)).toBe(expected)
  })
})

// Complex scenarios
describe('Order Pricing', () => {
  const testCases = [
    {
      name: 'regular order',
      items: [{ price: 100, quantity: 2 }],
      coupon: null,
      expectedTotal: 200
    },
    {
      name: 'with percentage discount',
      items: [{ price: 100, quantity: 2 }],
      coupon: { type: 'percentage', value: 10 },
      expectedTotal: 180
    },
    {
      name: 'with fixed discount',
      items: [{ price: 100, quantity: 2 }],
      coupon: { type: 'fixed', value: 50 },
      expectedTotal: 150
    },
    {
      name: 'discount cannot exceed total',
      items: [{ price: 10, quantity: 1 }],
      coupon: { type: 'fixed', value: 50 },
      expectedTotal: 0
    }
  ]

  test.each(testCases)(
    '$name: total should be $expectedTotal',
    ({ items, coupon, expectedTotal }) => {
      const order = createOrder(items)
      const result = calculateTotal(order, coupon)
      expect(result).toBe(expectedTotal)
    }
  )
})
```

## Test Isolation Patterns

### Database Isolation

```typescript
// Transaction-based isolation
describe('Database Tests', () => {
  let transaction: Transaction

  beforeEach(async () => {
    transaction = await db.beginTransaction()
  })

  afterEach(async () => {
    await transaction.rollback()
  })

  test('creates user', async () => {
    const user = await userRepo.create(
      { name: 'Test' },
      { transaction }
    )
    expect(user.id).toBeDefined()
    // Changes will be rolled back
  })
})

// Truncate-based isolation
describe('Integration Tests', () => {
  beforeEach(async () => {
    // Truncate in reverse order of dependencies
    await db.query('TRUNCATE orders CASCADE')
    await db.query('TRUNCATE products CASCADE')
    await db.query('TRUNCATE users CASCADE')
  })

  test('full order flow', async () => {
    // Fresh database state
  })
})

// Container-based isolation
describe('Docker Tests', () => {
  let container: StartedPostgres

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start()
    await runMigrations(container.getConnectionUri())
  })

  afterAll(async () => {
    await container.stop()
  })
})
```

### State Isolation

```typescript
// Module-level isolation
describe('Service Tests', () => {
  let service: UserService
  let mockRepo: MockRepository

  beforeEach(() => {
    // Fresh instances
    mockRepo = createMockRepository()
    service = new UserService(mockRepo)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
})

// Global state cleanup
describe('Global State', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  test('uses custom env', () => {
    process.env.API_URL = 'http://test-api.com'
    // Test with modified env
  })
})
```

## Error Testing Patterns

```typescript
describe('Error Handling', () => {
  // Sync errors
  test('throws on invalid input', () => {
    expect(() => validateEmail('')).toThrow('Email is required')
    expect(() => validateEmail('invalid')).toThrow(ValidationError)
  })

  // Async errors
  test('rejects on API failure', async () => {
    await expect(fetchUser(-1)).rejects.toThrow('Invalid user ID')

    await expect(fetchUser(-1)).rejects.toMatchObject({
      message: 'Invalid user ID',
      code: 'INVALID_INPUT'
    })
  })

  // Custom error properties
  test('error contains details', () => {
    try {
      validateForm({ email: 'bad', age: -5 })
      fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.errors).toContainEqual({
        field: 'email',
        message: 'Invalid email format'
      })
      expect(error.errors).toContainEqual({
        field: 'age',
        message: 'Age must be positive'
      })
    }
  })

  // Error boundaries
  test('component error boundary', () => {
    const wrapper = mount(
      <ErrorBoundary fallback={<div>Error</div>}>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(wrapper.text()).toContain('Error')
  })
})
```

## Async Testing Patterns

```typescript
describe('Async Patterns', () => {
  // Promise-based
  test('async/await', async () => {
    const result = await fetchData()
    expect(result).toBeDefined()
  })

  // Timeout
  test('with timeout', async () => {
    const result = await Promise.race([
      slowOperation(),
      timeout(5000)
    ])
    expect(result).not.toBe('timeout')
  }, 10000)

  // Polling
  test('polling for condition', async () => {
    startBackgroundJob()

    await vi.waitFor(async () => {
      const status = await getJobStatus()
      expect(status).toBe('completed')
    }, { timeout: 10000, interval: 500 })
  })

  // Event-based
  test('event emission', async () => {
    const emitter = new EventEmitter()
    const handler = vi.fn()

    emitter.on('data', handler)

    emitter.emit('data', { value: 42 })

    expect(handler).toHaveBeenCalledWith({ value: 42 })
  })

  // Stream-based
  test('stream processing', async () => {
    const chunks: string[] = []

    const stream = createReadStream('file.txt')

    for await (const chunk of stream) {
      chunks.push(chunk.toString())
    }

    expect(chunks.join('')).toContain('expected content')
  })
})
```

## Best Practices Summary

### Nima Test Qilish Kerak

```typescript
// 1. Business logic
test('discount calculation', () => {
  expect(calculateDiscount(100, 20)).toBe(80)
})

// 2. Edge cases
test('empty input', () => {
  expect(processItems([])).toEqual([])
})

// 3. Error paths
test('invalid input throws', () => {
  expect(() => processItems(null)).toThrow()
})

// 4. State transitions
test('order status changes', () => {
  const order = createOrder()
  order.confirm()
  expect(order.status).toBe('confirmed')
})

// 5. Integration points
test('API contract', async () => {
  const response = await api.createUser(userData)
  expect(response).toMatchSchema(userSchema)
})
```

### Nima Test QILMASLIK Kerak

```typescript
// 1. Third-party code
test('axios works', () => {}) // NO

// 2. Language features
test('Array.map', () => {}) // NO

// 3. Implementation details
test('private method', () => {
  expect(obj._privateMethod()).toBe(1) // NO
})

// 4. Simple getters/setters
test('getName', () => {
  user.name = 'John'
  expect(user.name).toBe('John') // Unnecessary
})

// 5. Constants
test('PI value', () => {
  expect(Math.PI).toBeCloseTo(3.14159) // NO
})
```

## Interview Savollari

### 1. AAA pattern nima?

**Javob:**
Arrange-Act-Assert:
- **Arrange**: Test data va dependency'larni tayyorlash
- **Act**: Test qilinayotgan kodni chaqirish
- **Assert**: Natijani tekshirish

```typescript
test('user login', () => {
  // Arrange
  const credentials = { email: 'test@test.com', password: 'pass' }

  // Act
  const result = authService.login(credentials)

  // Assert
  expect(result.success).toBe(true)
})
```

### 2. Mock va stub orasidagi farq?

**Javob:**
- **Stub**: Oldindan belgilangan qiymatlar qaytaradi. "Bu so'rovga bu javobni ber."
- **Mock**: Chaqiruvlarni kuzatadi va verify qiladi. "Bu metod shu parametrlar bilan chaqirilganini tekshir."

### 3. Test isolation nima uchun muhim?

**Javob:**
- Testlar bir-biriga ta'sir qilmasligi
- Har test mustaqil ishlashi
- Har qanday ketma-ketlikda run bo'lishi
- Flaky test'larni kamaytirish

### 4. Builder pattern testda qanday ishlatiladi?

**Javob:**
Test data yaratishni fluent qiladi:

```typescript
const user = new UserBuilder()
  .withName('John')
  .asAdmin()
  .inactive()
  .build()
```

### 5. Parameterized test qachon ishlatiladi?

**Javob:**
Bir xil test logic, turli input'lar uchun:

```typescript
test.each([
  ['valid@email.com', true],
  ['invalid', false]
])('validateEmail(%s) = %s', (email, expected) => {
  expect(validateEmail(email)).toBe(expected)
})
```

## Xulosa

Testing patterns:
- **AAA/GWT**: Test strukturasi
- **Test Doubles**: Mock, Stub, Spy, Fake
- **Builder/Factory**: Test data yaratish
- **Isolation**: Testlar mustaqilligi
- **Parameterized**: Bir test, ko'p input

To'g'ri pattern tanlash - test'larni o'qilishi, maintenance'i va reliability'sini oshiradi.
