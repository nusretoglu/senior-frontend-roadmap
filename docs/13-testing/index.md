# Testing

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturlash - bu doimiy o'zgarish (Refactoring) jarayoni. Bir joyni o'zgartirsangiz, boshqa yerdagi "kimningdir" kodi sinishi ehtimoli katta. Agar siz loyihaga test yozmasangiz, har qanday kichik o'zgarish qilishdan oldin "Qo'rqoq"qa aylanasiz. Dasturingiz xatosiz ekanini qo'lda tekshirib chiqishga vaqtingiz ham yetmaydi. Testlar - bu sizning dasturchi sifatidagi ishonch va obro'yingizdir!

> [!NOTE]
> **Real-hayot analogiyasi: "Aviakompaniya"**  
> Agar siz samolyot biletlari sotadigan sayt qilsangiz va kodni o'zgartirib bitta joyda "qatoriga kelgan ikkita bir xil raqamni bitta deb tushunadigan" xatolikka yo'l qo'ysangiz (masalan 100 o'rniga 10 deb hisoblasa), aviakompaniya millionlab dollar zarar ko'rishi mumkin. Testlar — bu har safar siz kod qo'shganingizda u samolyotni pastga qulatib yubormasligini avtomatik kafolatlovchi maxsus komissiya (botlar) dir.

Bu bo'lim JavaScript/TypeScript loyihalarini test qilish bo'yicha chuqur bilimlarni o'z ichiga oladi. Unit testlardan E2E testlargacha, zamonaviy testing toollar va patternlarni qamrab olamiz.

## Bo'lim Tarkibi

| # | Mavzu | Tavsif |
|---|-------|--------|
| 01 | [Unit Testing](./01-unit-testing.md) | Isolated testing, mocking, test doubles, coverage |
| 02 | [Integration Testing](./02-integration-testing.md) | Component integration, API testing, database testing |
| 03 | [E2E Testing](./03-e2e-testing.md) | End-to-end flows, user scenarios, visual testing |
| 04 | [Vitest](./04-vitest.md) | Modern test runner, Vue/React testing, snapshot testing |
| 05 | [Cypress](./05-cypress.md) | Browser automation, component testing, network stubbing |
| 06 | [Playwright](./06-playwright.md) | Cross-browser testing, mobile emulation, tracing |
| 07 | [Testing Patterns](./07-testing-patterns.md) | AAA, Given-When-Then, test doubles, fixture patterns |

## Nima Uchun Testing?

### Biznes Qiymati
- **Regression Prevention**: Yangi kod eski funksionallikni buzmaydi
- **Confidence in Refactoring**: Kodni xavfsiz o'zgartirish imkoniyati
- **Documentation**: Testlar living documentation sifatida
- **Faster Development**: Bug'larni erta bosqichda ushlash

### Testing Pyramid

```mermaid
pyramid
    title Testlash Piramidasi (Testing Pyramid)
    "E2E Testlar (10%) - Sekin, qimmat, user UI ni tekshiradi"
    "Integratsiya Testlari (20%) - Componentlar o'zaro ishlashi, API/DB"
    "Unit Testlar (70%) - Juda tez, Business logikalar, sof funksiyalar"
```

### Test Coverage Strategiyasi

| Qatlam | Coverage Maqsad | Fokus |
|--------|-----------------|-------|
| Unit | 80%+ | Business logic, utilities |
| Integration | 60%+ | API, database, external services |
| E2E | Critical paths | User journeys, happy paths |

## Testing Terminologiyasi

### Test Types

```javascript
// Unit Test - isolated, fast
test('formatPrice 1000 ni "1,000" ga format qiladi', () => {
  expect(formatPrice(1000)).toBe('1,000')
})

// Integration Test - multiple units together
test('OrderService to'g'ri order yaratadi', async () => {
  const order = await orderService.create({
    items: [{ productId: 1, quantity: 2 }],
    userId: 123
  })
  expect(order.total).toBe(2000)
  expect(await db.orders.findById(order.id)).toBeDefined()
})

// E2E Test - full user flow
test('User mahsulot sotib oladi', async ({ page }) => {
  await page.goto('/products')
  await page.click('[data-testid="product-1"]')
  await page.click('[data-testid="add-to-cart"]')
  await page.click('[data-testid="checkout"]')
  await expect(page.locator('.order-success')).toBeVisible()
})
```

### Test Doubles

```javascript
// Stub - predefined return values
const userServiceStub = {
  getUser: () => ({ id: 1, name: 'Test User' })
}

// Mock - expectations on calls
const loggerMock = vi.fn()
loggerMock('error', 'Something went wrong')
expect(loggerMock).toHaveBeenCalledWith('error', expect.any(String))

// Spy - track real function calls
const fetchSpy = vi.spyOn(global, 'fetch')
await fetchData()
expect(fetchSpy).toHaveBeenCalledTimes(1)

// Fake - working implementation
class FakeUserRepository {
  private users = new Map()

  async save(user) {
    this.users.set(user.id, user)
    return user
  }

  async findById(id) {
    return this.users.get(id)
  }
}
```

## Framework Tanlash

### Vitest vs Jest

| Feature | Vitest | Jest |
|---------|--------|------|
| Speed | Juda tez (Vite-based) | Tezroq (v29+) |
| ESM Support | Native | Configuration kerak |
| Vue/React | First-class | Plugin orqali |
| TypeScript | Native | Transform kerak |
| Watch Mode | Instant | Sekinroq |

### Cypress vs Playwright

| Feature | Cypress | Playwright |
|---------|---------|------------|
| Browsers | Chrome, Firefox, Edge | Chrome, Firefox, Safari, Edge |
| Mobile | Emulation only | Native emulation |
| Speed | Sekinroq | Tezroq |
| Debugging | Excellent | Very Good |
| Component Testing | Yes | Yes |
| API Testing | Yes | Yes |

## Testing Best Practices

### 1. Test Naming Convention

```javascript
// Bad
test('test1', () => {})

// Good - describes behavior
test('validateEmail invalid email uchun false qaytaradi', () => {})

// Better - BDD style
describe('validateEmail', () => {
  it('valid email uchun true qaytaradi', () => {})
  it('@ belgisi yo\'q bo\'lsa false qaytaradi', () => {})
  it('domain yo\'q bo\'lsa false qaytaradi', () => {})
})
```

### 2. Arrange-Act-Assert (AAA)

```javascript
test('Cart item qo\'shganda total yangilanadi', () => {
  // Arrange
  const cart = new ShoppingCart()
  const product = { id: 1, price: 100 }

  // Act
  cart.addItem(product, 2)

  // Assert
  expect(cart.total).toBe(200)
  expect(cart.itemCount).toBe(2)
})
```

### 3. Test Isolation

```javascript
// Bad - tests share state
let counter = 0
test('test 1', () => { counter++ })
test('test 2', () => { expect(counter).toBe(0) }) // Fails!

// Good - isolated tests
describe('Counter', () => {
  let counter

  beforeEach(() => {
    counter = 0
  })

  test('increment', () => {
    counter++
    expect(counter).toBe(1)
  })

  test('starts at zero', () => {
    expect(counter).toBe(0)
  })
})
```

### 4. Avoid Implementation Details

```javascript
// Bad - testing implementation
test('button click handler', () => {
  const component = mount(Button)
  expect(component.vm.handleClick).toBeDefined()
})

// Good - testing behavior
test('button click shows modal', async () => {
  const component = mount(Button)
  await component.find('button').trigger('click')
  expect(component.find('.modal').exists()).toBe(true)
})
```

## Testing in CI/CD

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:unit -- --coverage

      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Real-World Testing Strategy

### E-commerce Loyiha Misoli

```
src/
├── utils/
│   └── __tests__/           # Unit tests
│       ├── formatPrice.test.ts
│       └── validateCard.test.ts
├── composables/
│   └── __tests__/           # Unit/Integration tests
│       └── useCart.test.ts
├── components/
│   └── __tests__/           # Component tests
│       └── ProductCard.test.ts
├── services/
│   └── __tests__/           # Integration tests
│       └── OrderService.test.ts
└── e2e/
    ├── checkout.spec.ts     # E2E tests
    ├── search.spec.ts
    └── auth.spec.ts
```

### Test Priority Matrix

| Scenario | Priority | Test Type |
|----------|----------|-----------|
| Payment processing | Critical | E2E + Integration |
| User registration | High | E2E + Unit |
| Product search | High | Integration |
| Cart calculations | High | Unit |
| Newsletter signup | Medium | Integration |
| Theme switching | Low | Unit |

## Interview Savollari

1. **Unit test va integration test orasidagi farq nima?**
   - Unit: isolated, bir unit, mocked dependencies
   - Integration: multiple units together, real dependencies

2. **Mock va stub orasidagi farq?**
   - Stub: predefined return values
   - Mock: expectations on calls + verification

3. **Testing pyramid nima va nima uchun muhim?**
   - Base: ko'p unit tests (tez, isolated)
   - Middle: kam integration tests
   - Top: juda kam E2E tests (sekin, brittle)

4. **Test coverage 100% bo'lsa, bug yo'q deb aytish mumkinmi?**
   - Yo'q, coverage faqat kod execute bo'lganini ko'rsatadi
   - Edge cases, integration issues, race conditions coverage'da ko'rinmaydi

5. **Flaky test nima va qanday oldini olish mumkin?**
   - Vaqti-vaqti bilan fail bo'ladigan test
   - Sabablari: timing issues, shared state, external dependencies
   - Yechim: isolation, proper waits, deterministic data

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **"100% Coverage" afsonasi**: Barcha fayllarni qamrab olish (100% coverage) shart emas. Business-critical joylarga (to'lov, savat, ro'yxatdan o'tish) urg'u bering. UI dagi matn rangi uchun test yozish vaqtni o'ldirishdir.
2. **Kodni buzishdan oldin yozing (TDD)**: Testlarni kod yoqmasdan oldin yozish (Test Driven Development) sizga interfeys haqida aniqroq o'ylash imkonini beradi.
3. **Piramida qoidasini asrang**: O'ylagan har bir kodingizni avval Unit test bilan yoping. E2E testlarni faqat eng katta, umumlashgan foydalanuvchi "sayohati" (masalan "mahsulot topish va sotib olish") uchungina ishlating.

---

## Foydali Resurslar

- [Testing JavaScript](https://testingjavascript.com/) - Kent C. Dodds kursi
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Library](https://testing-library.com/)
