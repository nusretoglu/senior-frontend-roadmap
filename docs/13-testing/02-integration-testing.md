# Integration Testing

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Unit testlar tizimning alohida qismlari (funksiyalar) qanday ishlashini kafolatlasa-da, bu qismlar bir-biriga ulanganda ham to'g'ri ishlashini kafolatlamaydi. Ko'pincha 100% unit test coverage'ga ega ilovalar aynan integratsiya nuqtalarida (baza bilan ulanish, tarmoq so'rovlari) sinadi. Shuning uchun "Integration Test" (Integratsiya testi) eng muhim xavfsizlik yostig'idir.

> [!NOTE]
> **Real-hayot analogiyasi: "Avtomobil qismlarini yig'ish"**  
> **Unit Test:** Zavodda mashinaning g'ildiraklarini alohida aylantirib ko'rishdi - a'lo darajada. Rulni alohida burab ko'rishdi - muammosiz.  
> **Integration Test:** Endi g'ildirakni o'qqa kiydirib, rulni ulashdi. Rulni o'ngga burganda g'ildirak ham o'ngga burilyaptimi? Shuni tekshirish — integratsiya testidir. Agar rul chapga, g'ildirak o'ngga burilsa, alohida qismlar soz bo'lsa ham butun tizim xato hisoblanadi.

Integration testing - bu bir nechta komponentlarning birgalikda to'g'ri ishlashini tekshirish. Unit testlardan farqli o'laroq, bu yerda real yoki partial dependency'lar (Mock qilinmagan modullar) ishlatiladi.

## Integration Test Nima?

```mermaid
graph TD
    subgraph Unit Tests
        U1[Tugma component]
        U2[API funksiya]
        U3[Forma validation]
    end

    subgraph Integration Test
        I[Foydalanuvchi Ro'yxatdan o'tish jarayoni]
        I --> U1
        I --> U3
        I --> U2
    end
    
    style Unit Tests fill:#f5f5f5,stroke:#9e9e9e
    style Integration Test fill:#e3f2fd,stroke:#1565c0
```

Integration test ikki yoki undan ortiq unit'larning o'zaro aloqasini test qiladi. Bu testlar tashqi tizimlar (database, API, file system) bilan integratsiyani ham qamrab oladi.

### Unit vs Integration Test

| Xususiyat | Unit Test | Integration Test |
|-----------|-----------|------------------|
| Scope | Bitta unit | Bir nechta unit |
| Dependencies | Mock/Stub | Real yoki partial |
| Speed | Juda tez (ms) | Sekinroq (s) |
| Isolation | To'liq | Partial |
| Setup | Minimal | Ko'proq |

```javascript
// Unit Test - isolated
test('validateEmail format tekshiradi', () => {
  expect(validateEmail('test@example.com')).toBe(true)
})

// Integration Test - multiple components
test('user registration full flow', async () => {
  const userService = new UserService(realUserRepository, realEmailService)

  const user = await userService.register({
    email: 'test@example.com',
    password: 'secure123'
  })

  // Database'da saqlangan
  const savedUser = await db.users.findByEmail('test@example.com')
  expect(savedUser).toBeDefined()

  // Email yuborilgan
  const sentEmails = await emailService.getSentEmails()
  expect(sentEmails).toContainEqual(
    expect.objectContaining({ to: 'test@example.com' })
  )
})
```

## Database Integration Testing

### Test Database Setup

```javascript
// setup/test-db.js
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL
    }
  }
})

export async function setupTestDatabase() {
  // Reset database
  execSync('npx prisma migrate reset --force --skip-seed', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.TEST_DATABASE_URL
    }
  })
}

export async function cleanupTestDatabase() {
  // Delete all data in reverse order of dependencies
  const tables = ['orders', 'products', 'users']

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM ${table}`)
  }
}

export { prisma }
```

### Repository Testing

```javascript
// user-repository.test.js
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { prisma, setupTestDatabase, cleanupTestDatabase } from './setup/test-db'
import { UserRepository } from '../repositories/user-repository'

describe('UserRepository Integration Tests', () => {
  let userRepository

  beforeAll(async () => {
    await setupTestDatabase()
    userRepository = new UserRepository(prisma)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await cleanupTestDatabase()
  })

  describe('create', () => {
    test('yangi user yaratadi va ID qaytaradi', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed_password'
      }

      const user = await userRepository.create(userData)

      expect(user.id).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.createdAt).toBeInstanceOf(Date)
    })

    test('duplicate email uchun error', async () => {
      const userData = {
        email: 'duplicate@example.com',
        name: 'User 1',
        passwordHash: 'hash1'
      }

      await userRepository.create(userData)

      await expect(
        userRepository.create({ ...userData, name: 'User 2' })
      ).rejects.toThrow(/unique constraint/i)
    })
  })

  describe('findByEmail', () => {
    test('mavjud user topadi', async () => {
      const created = await userRepository.create({
        email: 'findme@example.com',
        name: 'Find Me',
        passwordHash: 'hash'
      })

      const found = await userRepository.findByEmail('findme@example.com')

      expect(found).toEqual(created)
    })

    test('mavjud bo\'lmagan email uchun null', async () => {
      const found = await userRepository.findByEmail('notexists@example.com')
      expect(found).toBeNull()
    })
  })

  describe('update', () => {
    test('user ma\'lumotlarini yangilaydi', async () => {
      const user = await userRepository.create({
        email: 'update@example.com',
        name: 'Old Name',
        passwordHash: 'hash'
      })

      const updated = await userRepository.update(user.id, {
        name: 'New Name'
      })

      expect(updated.name).toBe('New Name')
      expect(updated.email).toBe('update@example.com') // o'zgarmagan
    })
  })

  describe('delete', () => {
    test('userni o\'chiradi', async () => {
      const user = await userRepository.create({
        email: 'delete@example.com',
        name: 'Delete Me',
        passwordHash: 'hash'
      })

      await userRepository.delete(user.id)

      const found = await userRepository.findById(user.id)
      expect(found).toBeNull()
    })
  })
})
```

### Transaction Testing

```javascript
describe('OrderService with Transactions', () => {
  let orderService
  let productRepository
  let inventoryRepository

  beforeEach(async () => {
    await cleanupTestDatabase()

    // Create test products
    await prisma.product.createMany({
      data: [
        { id: 1, name: 'Product A', price: 100, inventory: 10 },
        { id: 2, name: 'Product B', price: 200, inventory: 5 }
      ]
    })

    orderService = new OrderService(prisma)
  })

  test('muvaffaqiyatli order inventory ni kamaytiradi', async () => {
    const order = await orderService.createOrder({
      userId: 1,
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
      ]
    })

    expect(order.total).toBe(400) // 2*100 + 1*200

    // Inventory yangilangan
    const productA = await prisma.product.findUnique({ where: { id: 1 } })
    const productB = await prisma.product.findUnique({ where: { id: 2 } })

    expect(productA.inventory).toBe(8) // 10 - 2
    expect(productB.inventory).toBe(4) // 5 - 1
  })

  test('inventory yetarli bo\'lmasa transaction rollback', async () => {
    await expect(
      orderService.createOrder({
        userId: 1,
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 100 } // Inventory 5, 100 kerak
        ]
      })
    ).rejects.toThrow('Insufficient inventory')

    // Transaction rollback - hech narsa o'zgarmagan
    const productA = await prisma.product.findUnique({ where: { id: 1 } })
    const productB = await prisma.product.findUnique({ where: { id: 2 } })

    expect(productA.inventory).toBe(10) // O'zgarmagan
    expect(productB.inventory).toBe(5)  // O'zgarmagan

    // Order yaratilmagan
    const orders = await prisma.order.findMany()
    expect(orders).toHaveLength(0)
  })
})
```

## API Integration Testing

### HTTP Client Testing

```javascript
// api-client.test.js
import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { ApiClient } from '../api-client'

// MSW server setup
const server = setupServer(
  http.get('https://api.example.com/users/:id', ({ params }) => {
    if (params.id === '1') {
      return HttpResponse.json({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.post('https://api.example.com/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      { id: 2, ...body },
      { status: 201 }
    )
  })
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

describe('ApiClient', () => {
  const apiClient = new ApiClient('https://api.example.com')

  describe('getUser', () => {
    test('mavjud user ma\'lumotlarini qaytaradi', async () => {
      const user = await apiClient.getUser(1)

      expect(user).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      })
    })

    test('mavjud bo\'lmagan user uchun 404', async () => {
      await expect(apiClient.getUser(999)).rejects.toThrow('User not found')
    })
  })

  describe('createUser', () => {
    test('yangi user yaratadi', async () => {
      const newUser = await apiClient.createUser({
        name: 'Jane Doe',
        email: 'jane@example.com'
      })

      expect(newUser.id).toBe(2)
      expect(newUser.name).toBe('Jane Doe')
    })
  })
})
```

### Real API Testing (with fixtures)

```javascript
// external-api.test.js
import { describe, test, expect, beforeAll } from 'vitest'
import { WeatherApiClient } from '../weather-api-client'

describe('WeatherApiClient (Real API)', () => {
  let client

  beforeAll(() => {
    // Skip if no API key
    if (!process.env.WEATHER_API_KEY) {
      console.warn('Skipping real API tests - no API key')
      return
    }
    client = new WeatherApiClient(process.env.WEATHER_API_KEY)
  })

  test('real weather data olish', async () => {
    if (!client) return

    const weather = await client.getCurrentWeather('London')

    expect(weather).toMatchObject({
      city: 'London',
      temperature: expect.any(Number),
      humidity: expect.any(Number),
      description: expect.any(String)
    })

    // Reasonable temperature range
    expect(weather.temperature).toBeGreaterThan(-50)
    expect(weather.temperature).toBeLessThan(60)
  })

  test('mavjud bo\'lmagan shahar uchun xato', async () => {
    if (!client) return

    await expect(
      client.getCurrentWeather('NonExistentCity12345')
    ).rejects.toThrow()
  })
})
```

## Component Integration Testing (Vue)

```javascript
// ProductList.integration.test.js
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProductList from '../components/ProductList.vue'
import { useProductStore } from '../stores/product'
import { useCartStore } from '../stores/cart'

// Mock API
vi.mock('../api/products', () => ({
  fetchProducts: vi.fn(() => Promise.resolve([
    { id: 1, name: 'Product 1', price: 100, stock: 10 },
    { id: 2, name: 'Product 2', price: 200, stock: 5 },
    { id: 3, name: 'Product 3', price: 300, stock: 0 }
  ]))
}))

describe('ProductList Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('productlarni yuklaydi va ko\'rsatadi', async () => {
    const wrapper = mount(ProductList)

    // Loading state
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)

    await flushPromises()

    // Products rendered
    const products = wrapper.findAll('[data-testid="product-card"]')
    expect(products).toHaveLength(3)

    // First product details
    expect(wrapper.text()).toContain('Product 1')
    expect(wrapper.text()).toContain('100')
  })

  test('cartga qo\'shish store ni yangilaydi', async () => {
    const wrapper = mount(ProductList)
    await flushPromises()

    const cartStore = useCartStore()
    expect(cartStore.items).toHaveLength(0)

    // Add first product
    await wrapper.find('[data-testid="add-to-cart-1"]').trigger('click')

    expect(cartStore.items).toHaveLength(1)
    expect(cartStore.items[0].productId).toBe(1)
    expect(cartStore.total).toBe(100)
  })

  test('stock 0 bo\'lsa add button disabled', async () => {
    const wrapper = mount(ProductList)
    await flushPromises()

    const outOfStockButton = wrapper.find('[data-testid="add-to-cart-3"]')
    expect(outOfStockButton.attributes('disabled')).toBeDefined()
  })

  test('filter products by price', async () => {
    const wrapper = mount(ProductList)
    await flushPromises()

    // Set max price filter
    await wrapper.find('[data-testid="max-price"]').setValue(150)
    await wrapper.find('[data-testid="apply-filter"]').trigger('click')

    const products = wrapper.findAll('[data-testid="product-card"]')
    expect(products).toHaveLength(1)
    expect(wrapper.text()).toContain('Product 1')
    expect(wrapper.text()).not.toContain('Product 2')
  })
})
```

## Service Layer Integration

```javascript
// order-service.integration.test.js
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { OrderService } from '../services/order-service'
import { PaymentService } from '../services/payment-service'
import { InventoryService } from '../services/inventory-service'
import { NotificationService } from '../services/notification-service'
import { prisma, cleanupTestDatabase } from './setup/test-db'

describe('OrderService Integration', () => {
  let orderService
  let mockPaymentGateway
  let mockEmailSender

  beforeEach(async () => {
    await cleanupTestDatabase()

    // Seed test data
    await prisma.user.create({
      data: { id: 1, email: 'customer@example.com', name: 'Customer' }
    })

    await prisma.product.createMany({
      data: [
        { id: 1, name: 'Laptop', price: 1000, inventory: 5 },
        { id: 2, name: 'Mouse', price: 50, inventory: 100 }
      ]
    })

    // Mock external services
    mockPaymentGateway = {
      charge: vi.fn().mockResolvedValue({
        transactionId: 'txn_123',
        status: 'success'
      }),
      refund: vi.fn().mockResolvedValue({ status: 'refunded' })
    }

    mockEmailSender = {
      send: vi.fn().mockResolvedValue({ messageId: 'msg_123' })
    }

    // Real services with mocked external dependencies
    const paymentService = new PaymentService(mockPaymentGateway)
    const inventoryService = new InventoryService(prisma)
    const notificationService = new NotificationService(mockEmailSender)

    orderService = new OrderService(
      prisma,
      paymentService,
      inventoryService,
      notificationService
    )
  })

  test('full order flow: create -> confirm -> ship', async () => {
    // 1. Create order
    const order = await orderService.createOrder({
      userId: 1,
      items: [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 2 }
      ],
      paymentMethod: { type: 'card', token: 'tok_123' }
    })

    expect(order.status).toBe('confirmed')
    expect(order.total).toBe(1100) // 1000 + 50*2

    // Verify payment was charged
    expect(mockPaymentGateway.charge).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'tok_123' }),
      1100
    )

    // Verify inventory decreased
    const laptop = await prisma.product.findUnique({ where: { id: 1 } })
    expect(laptop.inventory).toBe(4)

    // Verify confirmation email sent
    expect(mockEmailSender.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'customer@example.com',
        template: 'order-confirmation'
      })
    )

    // 2. Ship order
    const shippedOrder = await orderService.shipOrder(order.id, {
      carrier: 'FedEx',
      trackingNumber: '123456789'
    })

    expect(shippedOrder.status).toBe('shipped')
    expect(shippedOrder.tracking.carrier).toBe('FedEx')

    // Verify shipping notification sent
    expect(mockEmailSender.send).toHaveBeenCalledWith(
      expect.objectContaining({
        template: 'order-shipped',
        data: expect.objectContaining({ trackingNumber: '123456789' })
      })
    )
  })

  test('order cancel: refund and restore inventory', async () => {
    // Create and confirm order
    const order = await orderService.createOrder({
      userId: 1,
      items: [{ productId: 1, quantity: 2 }],
      paymentMethod: { type: 'card', token: 'tok_123' }
    })

    // Verify inventory decreased
    let laptop = await prisma.product.findUnique({ where: { id: 1 } })
    expect(laptop.inventory).toBe(3)

    // Cancel order
    const cancelledOrder = await orderService.cancelOrder(order.id, {
      reason: 'Customer request'
    })

    expect(cancelledOrder.status).toBe('cancelled')

    // Verify refund processed
    expect(mockPaymentGateway.refund).toHaveBeenCalledWith(
      order.paymentTransactionId,
      2000
    )

    // Verify inventory restored
    laptop = await prisma.product.findUnique({ where: { id: 1 } })
    expect(laptop.inventory).toBe(5)

    // Verify cancellation email
    expect(mockEmailSender.send).toHaveBeenCalledWith(
      expect.objectContaining({ template: 'order-cancelled' })
    )
  })

  test('payment failure rollback', async () => {
    mockPaymentGateway.charge.mockRejectedValue(new Error('Card declined'))

    const initialInventory = await prisma.product.findUnique({
      where: { id: 1 }
    })

    await expect(
      orderService.createOrder({
        userId: 1,
        items: [{ productId: 1, quantity: 1 }],
        paymentMethod: { type: 'card', token: 'bad_tok' }
      })
    ).rejects.toThrow('Card declined')

    // Inventory unchanged (rollback)
    const currentInventory = await prisma.product.findUnique({
      where: { id: 1 }
    })
    expect(currentInventory.inventory).toBe(initialInventory.inventory)

    // No order created
    const orders = await prisma.order.findMany()
    expect(orders).toHaveLength(0)
  })
})
```

## Message Queue Integration

```javascript
// queue-integration.test.js
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'
import { EmailWorker } from '../workers/email-worker'

describe('Email Queue Integration', () => {
  let queue
  let worker
  let redis
  let processedJobs

  beforeEach(async () => {
    redis = new Redis({
      host: 'localhost',
      port: 6379,
      db: 1 // Test database
    })

    // Clean queue
    await redis.flushdb()

    queue = new Queue('test-email', {
      connection: redis
    })

    processedJobs = []

    // Mock email sender
    const emailSender = {
      send: vi.fn().mockImplementation(async (email) => {
        processedJobs.push(email)
        return { messageId: `msg_${Date.now()}` }
      })
    }

    worker = new Worker(
      'test-email',
      async (job) => {
        return EmailWorker.process(job, emailSender)
      },
      { connection: redis }
    )
  })

  afterEach(async () => {
    await worker.close()
    await queue.close()
    await redis.quit()
  })

  test('email job processed', async () => {
    const job = await queue.add('send-email', {
      to: 'user@example.com',
      subject: 'Test Email',
      body: 'Hello World'
    })

    // Wait for job completion
    const result = await job.waitUntilFinished(queue.events, 5000)

    expect(result.status).toBe('sent')
    expect(processedJobs).toHaveLength(1)
    expect(processedJobs[0].to).toBe('user@example.com')
  })

  test('failed job retries', async () => {
    let attempts = 0
    const emailSender = {
      send: vi.fn().mockImplementation(async () => {
        attempts++
        if (attempts < 3) {
          throw new Error('Temporary failure')
        }
        return { status: 'sent' }
      })
    }

    // Replace worker with retry logic
    await worker.close()
    worker = new Worker(
      'test-email',
      async (job) => EmailWorker.process(job, emailSender),
      {
        connection: redis,
        settings: {
          backoffStrategy: () => 100 // Fast retry for tests
        }
      }
    )

    const job = await queue.add('send-email', {
      to: 'user@example.com',
      subject: 'Test'
    }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 100 }
    })

    await job.waitUntilFinished(queue.events, 10000)

    expect(attempts).toBe(3) // 2 failures + 1 success
  })

  test('dead letter queue for permanent failures', async () => {
    const dlq = new Queue('test-email-dlq', { connection: redis })

    const emailSender = {
      send: vi.fn().mockRejectedValue(new Error('Permanent failure'))
    }

    await worker.close()
    worker = new Worker(
      'test-email',
      async (job) => EmailWorker.process(job, emailSender),
      { connection: redis }
    )

    // Listen for failed events
    const failedJobs = []
    worker.on('failed', (job, err) => {
      failedJobs.push({ job, err })
      // Move to DLQ
      dlq.add('failed-email', job.data)
    })

    const job = await queue.add('send-email', {
      to: 'user@example.com',
      subject: 'Will Fail'
    }, {
      attempts: 1
    })

    // Wait for failure
    await new Promise(resolve => setTimeout(resolve, 1000))

    const dlqJobs = await dlq.getJobs()
    expect(dlqJobs).toHaveLength(1)

    await dlq.close()
  })
})
```

## Cache Integration Testing

```javascript
// cache-integration.test.js
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import Redis from 'ioredis'
import { CacheService } from '../services/cache-service'
import { UserService } from '../services/user-service'

describe('Cache Integration', () => {
  let redis
  let cacheService
  let userService
  let dbQueryCount

  beforeEach(async () => {
    redis = new Redis({ host: 'localhost', port: 6379, db: 2 })
    await redis.flushdb()

    cacheService = new CacheService(redis)

    // Mock database with query counting
    dbQueryCount = 0
    const mockDb = {
      users: {
        findById: vi.fn().mockImplementation(async (id) => {
          dbQueryCount++
          return { id, name: 'User ' + id, email: `user${id}@example.com` }
        })
      }
    }

    userService = new UserService(mockDb, cacheService)
  })

  afterEach(async () => {
    await redis.quit()
  })

  test('first request hits database, second hits cache', async () => {
    // First request - DB hit
    const user1 = await userService.getUser(1)
    expect(user1.name).toBe('User 1')
    expect(dbQueryCount).toBe(1)

    // Second request - cache hit
    const user2 = await userService.getUser(1)
    expect(user2.name).toBe('User 1')
    expect(dbQueryCount).toBe(1) // Still 1, no new DB query

    // Different user - new DB hit
    const user3 = await userService.getUser(2)
    expect(user3.name).toBe('User 2')
    expect(dbQueryCount).toBe(2)
  })

  test('cache invalidation', async () => {
    // Populate cache
    await userService.getUser(1)
    expect(dbQueryCount).toBe(1)

    // Invalidate
    await userService.invalidateUserCache(1)

    // Should hit DB again
    await userService.getUser(1)
    expect(dbQueryCount).toBe(2)
  })

  test('cache TTL expiration', async () => {
    vi.useFakeTimers()

    // Create cache with 1 second TTL
    const shortCacheService = new CacheService(redis, { ttl: 1 })
    const service = new UserService(mockDb, shortCacheService)

    await service.getUser(1)
    expect(dbQueryCount).toBe(1)

    // Before TTL
    await service.getUser(1)
    expect(dbQueryCount).toBe(1)

    // After TTL
    vi.advanceTimersByTime(2000)

    // Note: vi.useFakeTimers() doesn't affect Redis TTL
    // This test needs real timing or Redis mock
    vi.useRealTimers()
  })

  test('cache stampede prevention with locks', async () => {
    // Simulate slow database query
    const slowDb = {
      users: {
        findById: vi.fn().mockImplementation(async (id) => {
          await new Promise(resolve => setTimeout(resolve, 100))
          dbQueryCount++
          return { id, name: 'User ' + id }
        })
      }
    }

    const service = new UserService(slowDb, cacheService)

    // Concurrent requests for same user
    const results = await Promise.all([
      service.getUser(1),
      service.getUser(1),
      service.getUser(1),
      service.getUser(1),
      service.getUser(1)
    ])

    // All should return same data
    expect(results.every(r => r.name === 'User 1')).toBe(true)

    // Only one DB query should have been made
    expect(dbQueryCount).toBe(1)
  })
})
```

## File System Integration

```javascript
// file-service.integration.test.js
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import { FileService } from '../services/file-service'

describe('FileService Integration', () => {
  const testDir = path.join(__dirname, 'test-uploads')
  let fileService

  beforeEach(async () => {
    // Create test directory
    await fs.mkdir(testDir, { recursive: true })
    fileService = new FileService(testDir)
  })

  afterEach(async () => {
    // Cleanup test directory
    await fs.rm(testDir, { recursive: true, force: true })
  })

  test('file upload and retrieval', async () => {
    const content = Buffer.from('Hello, World!')
    const filename = 'test.txt'

    // Upload
    const result = await fileService.upload(filename, content)
    expect(result.path).toContain(filename)

    // Verify file exists
    const exists = await fileService.exists(filename)
    expect(exists).toBe(true)

    // Read back
    const retrieved = await fileService.read(filename)
    expect(retrieved.toString()).toBe('Hello, World!')
  })

  test('image processing integration', async () => {
    // Read test image
    const imagePath = path.join(__dirname, 'fixtures', 'test-image.jpg')
    const image = await fs.readFile(imagePath)

    // Upload and resize
    const result = await fileService.uploadImage(image, {
      filename: 'resized.jpg',
      width: 200,
      height: 200,
      quality: 80
    })

    // Verify thumbnail created
    expect(await fileService.exists(result.thumbnailPath)).toBe(true)

    // Verify dimensions (would need image library to check)
    expect(result.width).toBe(200)
    expect(result.height).toBe(200)
  })

  test('file deletion', async () => {
    await fileService.upload('to-delete.txt', Buffer.from('temp'))
    expect(await fileService.exists('to-delete.txt')).toBe(true)

    await fileService.delete('to-delete.txt')
    expect(await fileService.exists('to-delete.txt')).toBe(false)
  })

  test('concurrent uploads', async () => {
    const uploads = Array.from({ length: 10 }, (_, i) => ({
      filename: `file-${i}.txt`,
      content: Buffer.from(`Content ${i}`)
    }))

    const results = await Promise.all(
      uploads.map(({ filename, content }) =>
        fileService.upload(filename, content)
      )
    )

    // All uploads successful
    expect(results).toHaveLength(10)

    // All files exist
    for (const { filename } of uploads) {
      expect(await fileService.exists(filename)).toBe(true)
    }
  })
})
```

## Test Environment Setup

### Docker Compose for Tests

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test_db
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data

  redis-test:
    image: redis:7
    ports:
      - "6380:6379"

  localstack:
    image: localstack/localstack
    environment:
      - SERVICES=s3,sqs
      - DEFAULT_REGION=us-east-1
    ports:
      - "4566:4566"
```

### Global Test Setup

```javascript
// vitest.setup.js
import { beforeAll, afterAll } from 'vitest'
import { execSync } from 'child_process'

beforeAll(async () => {
  // Start test containers
  execSync('docker-compose -f docker-compose.test.yml up -d', {
    stdio: 'inherit'
  })

  // Wait for services
  await waitForPostgres()
  await waitForRedis()
})

afterAll(async () => {
  // Stop containers
  execSync('docker-compose -f docker-compose.test.yml down', {
    stdio: 'inherit'
  })
})

async function waitForPostgres(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const client = new Client({
        host: 'localhost',
        port: 5433,
        user: 'test',
        password: 'test',
        database: 'test_db'
      })
      await client.connect()
      await client.end()
      return
    } catch {
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  throw new Error('Postgres not ready')
}
```

## Best Practices

### 1. Test Data Management

```javascript
// fixtures/order-fixtures.js
export const validOrder = {
  userId: 1,
  items: [
    { productId: 1, quantity: 2, price: 100 },
    { productId: 2, quantity: 1, price: 50 }
  ],
  shippingAddress: {
    street: '123 Main St',
    city: 'Test City',
    zip: '12345'
  }
}

export const invalidOrders = {
  emptyItems: { ...validOrder, items: [] },
  negativeQuantity: {
    ...validOrder,
    items: [{ productId: 1, quantity: -1, price: 100 }]
  }
}

// seeds/test-data.js
export async function seedTestData(prisma) {
  await prisma.user.createMany({
    data: [
      { id: 1, email: 'user1@test.com', name: 'User 1' },
      { id: 2, email: 'user2@test.com', name: 'User 2' }
    ]
  })

  await prisma.product.createMany({
    data: [
      { id: 1, name: 'Product 1', price: 100, inventory: 50 },
      { id: 2, name: 'Product 2', price: 200, inventory: 30 }
    ]
  })
}
```

### 2. Test Isolation

```javascript
// Bad - tests affect each other
describe('UserService', () => {
  test('create user', async () => {
    await userService.create({ email: 'test@test.com' })
    // No cleanup!
  })

  test('unique email', async () => {
    // This might fail or pass depending on previous test
    await expect(
      userService.create({ email: 'test@test.com' })
    ).rejects.toThrow()
  })
})

// Good - isolated tests
describe('UserService', () => {
  beforeEach(async () => {
    await cleanupDatabase()
  })

  test('create user', async () => {
    const user = await userService.create({ email: 'test@test.com' })
    expect(user.id).toBeDefined()
  })

  test('unique email', async () => {
    await userService.create({ email: 'test@test.com' })

    await expect(
      userService.create({ email: 'test@test.com' })
    ).rejects.toThrow('Email already exists')
  })
})
```

### 3. Environment Configuration

```javascript
// config/test.js
export default {
  database: {
    url: process.env.TEST_DATABASE_URL || 'postgres://test:test@localhost:5433/test_db'
  },
  redis: {
    url: process.env.TEST_REDIS_URL || 'redis://localhost:6380'
  },
  services: {
    payment: {
      useMock: true
    },
    email: {
      useMock: true
    }
  }
}
```

## Interview Savollari

### 1. Integration test va unit test qachon ishlatiladi?

**Javob:**
- **Unit test**: Pure business logic, utility functions, isolated calculations
- **Integration test**: Database operations, API calls, multiple service interaction, full feature flows

Integration test kerak bo'lganda:
- Real database bilan ishlash (transactions, constraints)
- External API chaqiruvlari
- Cache invalidation logic
- Message queue processing
- File system operations

### 2. Test database qanday manage qilinadi?

**Javob:**
1. **Dedicated test database** - production/dev dan alohida
2. **Docker containers** - har run uchun fresh state
3. **Migrations** - avval migrate, keyin test
4. **Cleanup** - har testdan keyin yoki oldin
5. **Transactions** - test tugagach rollback

```javascript
// Transaction-based cleanup
beforeEach(async () => {
  await prisma.$executeRaw`BEGIN`
})

afterEach(async () => {
  await prisma.$executeRaw`ROLLBACK`
})
```

### 3. External service'larni qanday mock qilish kerak?

**Javob:**
```javascript
// 1. HTTP level (MSW)
server.use(
  http.post('https://payment.api/charge', () => {
    return HttpResponse.json({ success: true })
  })
)

// 2. Service level (dependency injection)
const mockPaymentService = {
  charge: vi.fn().mockResolvedValue({ transactionId: 'test' })
}
const orderService = new OrderService(mockPaymentService)

// 3. Environment-based
if (process.env.NODE_ENV === 'test') {
  return new MockPaymentGateway()
}
```

### 4. Test data qanday yaratiladi?

**Javob:**
1. **Fixtures** - statik test data fayllari
2. **Factories** - dynamic data generation
3. **Builders** - fluent API bilan data yaratish
4. **Seeds** - initial database state

```javascript
// Factory
const userFactory = Factory.define(() => ({
  email: faker.internet.email(),
  name: faker.person.fullName()
}))

// Usage
const user = userFactory.build()
const users = userFactory.buildList(5)
```

### 5. Flaky integration testlar qanday oldini olinadi?

**Javob:**
1. **Proper waits** - polling instead of fixed delays
2. **Test isolation** - shared state yo'q
3. **Deterministic data** - random data cautiously
4. **Retry logic** - transient failures uchun
5. **Container health checks** - services ready bo'lguncha kutish

```javascript
// Bad
await new Promise(r => setTimeout(r, 1000))

// Good
await waitFor(() => {
  const status = await service.getStatus()
  return status === 'ready'
}, { timeout: 5000, interval: 100 })
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **"Arrange, Act, Assert" (AAA) pattern**: Testni aniq uch qismga bo'ling: Ma'lumotlarni tayyorlang (Arrange), harakat qiling (Act) va natijani tekshiring (Assert).
2. **Haqiqiy DOM'dan foydalaning**: Frontend integratsiya testlarida `jsdom` yoki shunga o'xshash kutubxonalardan foydalanib, foydalanuvchilar aslida brauzerda ko'radigan narsalarni test qiling. Component metodlarini emas, tugmalarni bosib tekshiring (masalan: `fireEvent.click(button)`).
3. **Flaky testlardan ehtiyot bo'ling**: Integratsiya testlari odatda sekinroq bo'ladi va timeout'larga tushishi mumkin. Kutishlarda (waits) belgilangan vaqtdan ko'ra "element paydo bo'lguncha kutish" (waitFor) funksiyalaridan foydalaning.

---

## Xulosa

Integration testing:
- Unit testlar yetarli emas - real interaction'larni test qilish kerak
- Database, cache, queue - bu komponentlar bilan ishlash muhim
- Test isolation - har test o'z state'ida
- External services - mock yoki container
- CI/CD - automated integration tests

Keyingi bo'limda E2E testing haqida batafsil o'rganamiz.
