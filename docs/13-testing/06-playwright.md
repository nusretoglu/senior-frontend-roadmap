# Playwright

Playwright - bu Microsoft tomonidan yaratilgan zamonaviy E2E testing framework. Cross-browser testing, mobile emulation va powerful automation uchun eng yaxshi tool.

## Playwright Nima?

Playwright - bu Chromium, Firefox va WebKit browser'larini avtomatlashtirish uchun yaratilgan library. Bir API bilan barcha zamonaviy browser'larda test yozish imkonini beradi.

### Playwright Xususiyatlari

| Feature | Tavsif |
|---------|--------|
| Cross-browser | Chrome, Firefox, Safari, Edge |
| Auto-wait | Elementlarni avtomatik kutish |
| Web-first assertions | Reliable assertions |
| Tracing | Vizual debugging |
| Codegen | Test avtomatik generatsiya |
| Component testing | Vue, React, Svelte |
| API testing | REST/GraphQL |
| Mobile emulation | iOS, Android |

### Playwright vs Cypress

| Feature | Playwright | Cypress |
|---------|------------|---------|
| Browsers | All + Safari | Chrome, Firefox, Edge |
| Speed | Tezroq | Yaxshi |
| Parallelization | Native | Limited |
| Mobile | Better | Basic |
| API | Async/await | Chaining |
| iFrames | Full support | Limited |
| Multiple tabs | Yes | No |

## O'rnatish va Sozlash

### Installation

```bash
# Create new project
npm init playwright@latest

# Or add to existing project
npm install -D @playwright/test
npx playwright install
```

### Project Structure

```
tests/
├── e2e/
│   ├── auth.spec.ts
│   └── checkout.spec.ts
├── fixtures/
│   ├── users.json
│   └── test-fixtures.ts
├── pages/
│   ├── login.page.ts
│   └── dashboard.page.ts
└── utils/
    └── helpers.ts

playwright.config.ts
```

### Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results.xml' }]
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',

    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    locale: 'en-US',
    timezoneId: 'America/New_York',

    // Timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] }
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
})
```

## Basic Syntax

### Writing Tests

```typescript
import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays welcome message', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Welcome')
  })

  test('navigates to products', async ({ page }) => {
    await page.click('[data-testid="nav-products"]')
    await expect(page).toHaveURL(/.*products/)
  })

  test('searches for products', async ({ page }) => {
    await page.fill('[data-testid="search"]', 'laptop')
    await page.press('[data-testid="search"]', 'Enter')

    await expect(page.locator('[data-testid="product-card"]'))
      .toHaveCount(5)
  })
})
```

### Locators

```typescript
test('locator strategies', async ({ page }) => {
  // CSS Selector
  page.locator('.btn-primary')
  page.locator('#submit')
  page.locator('[data-testid="submit"]')

  // Text
  page.getByText('Submit')
  page.getByText('Submit', { exact: true })

  // Role
  page.getByRole('button', { name: 'Submit' })
  page.getByRole('link', { name: 'Home' })
  page.getByRole('heading', { level: 1 })
  page.getByRole('textbox', { name: 'Email' })
  page.getByRole('checkbox', { name: 'Accept terms' })

  // Label
  page.getByLabel('Email')
  page.getByLabel('Password')

  // Placeholder
  page.getByPlaceholder('Enter your email')

  // Alt text
  page.getByAltText('Company logo')

  // Title
  page.getByTitle('Settings')

  // Test ID
  page.getByTestId('submit-button')

  // Combining locators
  page.locator('article').filter({ hasText: 'Featured' })
  page.locator('article').filter({ has: page.locator('.highlight') })

  // Chaining
  page.locator('.card').first()
  page.locator('.card').last()
  page.locator('.card').nth(2)

  // Within
  const modal = page.locator('[data-testid="modal"]')
  await modal.getByRole('button', { name: 'Close' }).click()
})
```

### Actions

```typescript
test('user actions', async ({ page }) => {
  // Click
  await page.click('button')
  await page.dblclick('button')
  await page.click('button', { button: 'right' })
  await page.click('button', { force: true })
  await page.click('button', { position: { x: 10, y: 10 } })

  // Type
  await page.fill('input', 'Hello World')
  await page.fill('input', '') // Clear
  await page.type('input', 'Hello', { delay: 100 }) // Slow typing

  // Keyboard
  await page.press('input', 'Enter')
  await page.press('input', 'Control+a')
  await page.keyboard.press('Escape')
  await page.keyboard.type('Hello')

  // Select
  await page.selectOption('select', 'value')
  await page.selectOption('select', { label: 'Option 1' })
  await page.selectOption('select', ['value1', 'value2'])

  // Checkbox/Radio
  await page.check('[type="checkbox"]')
  await page.uncheck('[type="checkbox"]')
  await page.check('[type="radio"][value="option1"]')

  // File upload
  await page.setInputFiles('input[type="file"]', 'file.pdf')
  await page.setInputFiles('input[type="file"]', ['file1.pdf', 'file2.pdf'])
  await page.setInputFiles('input[type="file"]', []) // Clear

  // Drag and drop
  await page.dragAndDrop('#source', '#target')

  // Hover
  await page.hover('.menu-item')

  // Focus
  await page.focus('input')

  // Scroll
  await page.locator('.container').scrollIntoViewIfNeeded()
})
```

### Assertions

```typescript
import { test, expect } from '@playwright/test'

test('assertions', async ({ page }) => {
  // Page assertions
  await expect(page).toHaveURL('http://localhost:3000/dashboard')
  await expect(page).toHaveTitle('Dashboard')

  // Locator assertions
  const button = page.locator('button')

  // Visibility
  await expect(button).toBeVisible()
  await expect(button).toBeHidden()
  await expect(button).toBeAttached()

  // Enabled/Disabled
  await expect(button).toBeEnabled()
  await expect(button).toBeDisabled()

  // Text
  await expect(button).toHaveText('Submit')
  await expect(button).toContainText('Sub')
  await expect(button).not.toHaveText('Cancel')

  // Value
  await expect(page.locator('input')).toHaveValue('expected')
  await expect(page.locator('input')).toBeEmpty()

  // Attributes
  await expect(button).toHaveAttribute('type', 'submit')
  await expect(button).toHaveAttribute('disabled')

  // Class
  await expect(button).toHaveClass(/primary/)
  await expect(button).toHaveClass('btn btn-primary')

  // CSS
  await expect(button).toHaveCSS('display', 'flex')

  // Count
  await expect(page.locator('.item')).toHaveCount(5)

  // Checked
  await expect(page.locator('[type="checkbox"]')).toBeChecked()
  await expect(page.locator('[type="checkbox"]')).not.toBeChecked()

  // Focused
  await expect(page.locator('input')).toBeFocused()

  // Screenshot comparison
  await expect(page).toHaveScreenshot('dashboard.png')
  await expect(button).toHaveScreenshot('button.png')

  // Soft assertions (continue on failure)
  await expect.soft(button).toBeVisible()
  await expect.soft(button).toHaveText('Submit')

  // Polling assertions
  await expect(async () => {
    const response = await page.request.get('/api/status')
    expect(response.status()).toBe(200)
  }).toPass({ timeout: 30000 })
})
```

## Network Handling

### Route Interception

```typescript
test.describe('Network', () => {
  test('mock API response', async ({ page }) => {
    await page.route('**/api/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'User 1' },
          { id: 2, name: 'User 2' }
        ])
      })
    })

    await page.goto('/users')
    await expect(page.locator('.user-card')).toHaveCount(2)
  })

  test('modify request', async ({ page }) => {
    await page.route('**/api/data', async (route) => {
      const request = route.request()

      // Modify headers
      const headers = {
        ...request.headers(),
        'X-Custom-Header': 'test'
      }

      await route.continue({ headers })
    })
  })

  test('modify response', async ({ page }) => {
    await page.route('**/api/users', async (route) => {
      const response = await route.fetch()
      const json = await response.json()

      // Add extra data
      json.push({ id: 999, name: 'Injected User' })

      await route.fulfill({
        response,
        body: JSON.stringify(json)
      })
    })
  })

  test('simulate error', async ({ page }) => {
    await page.route('**/api/submit', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      })
    })

    await page.goto('/form')
    await page.click('[data-testid="submit"]')
    await expect(page.locator('.error')).toBeVisible()
  })

  test('delay response', async ({ page }) => {
    await page.route('**/api/slow', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 3000))
      await route.fulfill({ body: 'OK' })
    })

    await page.goto('/dashboard')
    await expect(page.locator('.loading')).toBeVisible()
    await expect(page.locator('.content')).toBeVisible({ timeout: 5000 })
  })

  test('abort request', async ({ page }) => {
    await page.route('**/api/analytics', (route) => route.abort())
    await page.goto('/') // Analytics won't load
  })

  test('wait for response', async ({ page }) => {
    const responsePromise = page.waitForResponse('**/api/users')

    await page.goto('/users')

    const response = await responsePromise
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveLength(10)
  })
})
```

### API Testing

```typescript
import { test, expect } from '@playwright/test'

test.describe('API Tests', () => {
  test('GET request', async ({ request }) => {
    const response = await request.get('/api/users')

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const users = await response.json()
    expect(users).toHaveLength(10)
    expect(users[0]).toHaveProperty('name')
  })

  test('POST request', async ({ request }) => {
    const response = await request.post('/api/users', {
      data: {
        name: 'New User',
        email: 'new@example.com'
      }
    })

    expect(response.status()).toBe(201)

    const user = await response.json()
    expect(user.id).toBeDefined()
    expect(user.name).toBe('New User')
  })

  test('authenticated request', async ({ request }) => {
    // Login first
    const loginResponse = await request.post('/api/auth/login', {
      data: { email: 'user@example.com', password: 'password' }
    })
    const { token } = await loginResponse.json()

    // Use token in subsequent requests
    const response = await request.get('/api/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(response.ok()).toBeTruthy()
  })

  test('file upload', async ({ request }) => {
    const response = await request.post('/api/upload', {
      multipart: {
        file: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('Hello World')
        },
        description: 'Test file'
      }
    })

    expect(response.ok()).toBeTruthy()
  })
})
```

## Page Object Model

### Page Objects

```typescript
// pages/login.page.ts
import { type Page, type Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Login' })
    this.errorMessage = page.getByTestId('error-message')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message)
  }
}

// pages/dashboard.page.ts
export class DashboardPage {
  readonly page: Page
  readonly welcomeMessage: Locator
  readonly userMenu: Locator
  readonly logoutButton: Locator

  constructor(page: Page) {
    this.page = page
    this.welcomeMessage = page.getByTestId('welcome-message')
    this.userMenu = page.getByTestId('user-menu')
    this.logoutButton = page.getByRole('button', { name: 'Logout' })
  }

  async goto() {
    await this.page.goto('/dashboard')
  }

  async logout() {
    await this.userMenu.click()
    await this.logoutButton.click()
  }

  async expectWelcome(name: string) {
    await expect(this.welcomeMessage).toContainText(`Welcome, ${name}`)
  }
}
```

### Using Page Objects

```typescript
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { DashboardPage } from '../pages/dashboard.page'

test.describe('Authentication', () => {
  test('successful login', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)

    await loginPage.goto()
    await loginPage.login('user@example.com', 'password123')

    await expect(page).toHaveURL('/dashboard')
    await dashboardPage.expectWelcome('User')
  })

  test('login with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.login('wrong@example.com', 'wrongpassword')

    await loginPage.expectError('Invalid credentials')
    await expect(page).toHaveURL('/login')
  })

  test('logout', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)

    await loginPage.goto()
    await loginPage.login('user@example.com', 'password123')

    await dashboardPage.logout()

    await expect(page).toHaveURL('/login')
  })
})
```

## Fixtures

### Custom Fixtures

```typescript
// fixtures/test-fixtures.ts
import { test as base, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { DashboardPage } from '../pages/dashboard.page'

type MyFixtures = {
  loginPage: LoginPage
  dashboardPage: DashboardPage
  authenticatedPage: Page
}

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await use(loginPage)
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page)
    await use(dashboardPage)
  },

  authenticatedPage: async ({ page }, use) => {
    // Setup authentication
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'user@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="submit"]')
    await expect(page).toHaveURL('/dashboard')

    await use(page)
  }
})

export { expect }
```

### Using Fixtures

```typescript
import { test, expect } from '../fixtures/test-fixtures'

test('uses login page fixture', async ({ loginPage }) => {
  await loginPage.goto()
  await loginPage.login('user@example.com', 'password')
})

test('uses authenticated page', async ({ authenticatedPage }) => {
  // Already logged in
  await authenticatedPage.goto('/profile')
  await expect(authenticatedPage.locator('h1')).toContainText('Profile')
})
```

### Database Fixtures

```typescript
import { test as base } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type DatabaseFixtures = {
  testUser: { id: number; email: string }
  seedProducts: void
}

export const test = base.extend<DatabaseFixtures>({
  testUser: async ({}, use) => {
    // Setup
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User'
      }
    })

    await use(user)

    // Teardown
    await prisma.user.delete({ where: { id: user.id } })
  },

  seedProducts: async ({}, use) => {
    // Setup
    await prisma.product.createMany({
      data: [
        { name: 'Product 1', price: 100 },
        { name: 'Product 2', price: 200 }
      ]
    })

    await use()

    // Teardown
    await prisma.product.deleteMany()
  }
})
```

## Authentication

### Storage State

```typescript
// auth.setup.ts
import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[data-testid="email"]', 'user@example.com')
  await page.fill('[data-testid="password"]', 'password123')
  await page.click('[data-testid="submit"]')

  await expect(page).toHaveURL('/dashboard')

  // Save signed-in state
  await page.context().storageState({ path: authFile })
})
```

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    // Setup project
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use saved auth state
        storageState: 'playwright/.auth/user.json'
      },
      dependencies: ['setup']
    }
  ]
})
```

### Multiple Users

```typescript
// Setup different user roles
const adminAuthFile = 'playwright/.auth/admin.json'
const customerAuthFile = 'playwright/.auth/customer.json'

setup('admin auth', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[data-testid="email"]', 'admin@example.com')
  await page.fill('[data-testid="password"]', 'adminpass')
  await page.click('[data-testid="submit"]')
  await page.context().storageState({ path: adminAuthFile })
})

setup('customer auth', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[data-testid="email"]', 'customer@example.com')
  await page.fill('[data-testid="password"]', 'customerpass')
  await page.click('[data-testid="submit"]')
  await page.context().storageState({ path: customerAuthFile })
})

// Tests
test.describe('Admin tests', () => {
  test.use({ storageState: adminAuthFile })

  test('admin can access admin panel', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/admin')
  })
})

test.describe('Customer tests', () => {
  test.use({ storageState: customerAuthFile })

  test('customer cannot access admin panel', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/access-denied')
  })
})
```

## Visual Testing

```typescript
test.describe('Visual Testing', () => {
  test('full page screenshot', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true
    })
  })

  test('element screenshot', async ({ page }) => {
    await page.goto('/components')

    const card = page.locator('[data-testid="feature-card"]').first()
    await expect(card).toHaveScreenshot('feature-card.png')
  })

  test('with threshold', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveScreenshot('homepage.png', {
      maxDiffPixelRatio: 0.05 // 5% difference allowed
    })
  })

  test('mask dynamic content', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page).toHaveScreenshot('dashboard-masked.png', {
      mask: [
        page.locator('[data-testid="timestamp"]'),
        page.locator('[data-testid="random-content"]')
      ]
    })
  })

  test('responsive screenshots', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ]

    for (const { width, height, name } of viewports) {
      await page.setViewportSize({ width, height })
      await page.goto('/')

      await expect(page).toHaveScreenshot(`homepage-${name}.png`)
    }
  })
})
```

## Tracing & Debugging

### Tracing

```typescript
// Enable trace on failure
// playwright.config.ts
export default defineConfig({
  use: {
    trace: 'on-first-retry' // 'on', 'off', 'on-first-retry', 'retain-on-failure'
  }
})

// Manual trace
test('with manual trace', async ({ page, context }) => {
  await context.tracing.start({ screenshots: true, snapshots: true })

  await page.goto('/')
  await page.click('button')

  await context.tracing.stop({ path: 'trace.zip' })
})
```

### Debugging

```bash
# Debug mode
npx playwright test --debug

# Debug specific test
npx playwright test -g "test name" --debug

# Headed mode
npx playwright test --headed

# Slow motion
npx playwright test --headed --slowmo=1000
```

```typescript
// Pause in test
test('debug pause', async ({ page }) => {
  await page.goto('/')
  await page.pause() // Opens inspector
  await page.click('button')
})
```

## Parallel Execution

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined
})

// Serial tests
test.describe.configure({ mode: 'serial' })
test.describe('Order tests', () => {
  test('step 1', async ({ page }) => {})
  test('step 2', async ({ page }) => {})
})

// Parallel tests (default)
test.describe.configure({ mode: 'parallel' })
```

### Sharding

```bash
# Shard 1 of 4
npx playwright test --shard=1/4

# Shard 2 of 4
npx playwright test --shard=2/4
```

## Best Practices

### 1. Locator Strategy

```typescript
// Prefer user-facing locators
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email')
page.getByText('Welcome')

// Use test IDs for complex elements
page.getByTestId('complex-component')

// Avoid brittle selectors
// BAD
page.locator('.btn-primary-lg')
page.locator('div > span > button')

// GOOD
page.getByRole('button', { name: 'Save' })
page.getByTestId('save-button')
```

### 2. Waiting

```typescript
// Automatic waiting - no explicit waits needed
await page.click('button') // Waits for button to be actionable

// Wait for specific condition
await page.waitForSelector('[data-testid="loaded"]')
await page.waitForResponse('**/api/data')
await page.waitForURL('**/dashboard')
await page.waitForLoadState('networkidle')

// Avoid arbitrary waits
// BAD
await page.waitForTimeout(3000)

// GOOD
await expect(page.locator('.content')).toBeVisible()
```

### 3. Test Isolation

```typescript
// Each test should be independent
test.beforeEach(async ({ page, request }) => {
  // Reset database
  await request.post('/api/test/reset')

  // Clear storage
  await page.context().clearCookies()
})
```

## Interview Savollari

### 1. Playwright Cypress'dan nimasi bilan ustun?

**Javob:**
- **Cross-browser**: Safari (WebKit) support
- **Speed**: Tezroq parallelization
- **Multiple tabs**: Bir nechta tab bilan ishlash
- **iFrames**: To'liq support
- **Mobile emulation**: Yaxshiroq
- **API testing**: Built-in
- **Auto-wait**: Smarter waiting

### 2. Playwright'da authentication qanday saqlanadi?

**Javob:**
```typescript
// Save auth state
await page.context().storageState({ path: 'auth.json' })

// Reuse in other tests
test.use({ storageState: 'auth.json' })
```

Bu session cookies, localStorage ni saqlaydi va keyingi testlarda qayta ishlatadi.

### 3. Page Object Model nima va nima uchun ishlatiladi?

**Javob:**
Page Object Model (POM) - har sahifa uchun alohida class yaratish pattern:

```typescript
class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email)
    await this.page.fill('[data-testid="password"]', password)
    await this.page.click('[data-testid="submit"]')
  }
}
```

Afzalliklari:
- Code reusability
- Maintenance oson
- Test readability

### 4. Network request'larni qanday intercept qilish mumkin?

**Javob:**
```typescript
await page.route('**/api/users', async (route) => {
  // Mock response
  await route.fulfill({
    status: 200,
    body: JSON.stringify([{ id: 1, name: 'User' }])
  })
})

// Or modify real response
await page.route('**/api/data', async (route) => {
  const response = await route.fetch()
  const json = await response.json()
  json.modified = true
  await route.fulfill({ body: JSON.stringify(json) })
})
```

### 5. Playwright'da parallelization qanday ishlaydi?

**Javob:**
- `fullyParallel: true` - barcha testlar parallel
- `workers` - parallel worker soni
- Sharding - testlarni CI/CD da bo'lish
- Test isolation - har test alohida browser context

```typescript
// Config
export default defineConfig({
  fullyParallel: true,
  workers: 4
})

// CI sharding
// Job 1: npx playwright test --shard=1/4
// Job 2: npx playwright test --shard=2/4
```

## Xulosa

Playwright:
- Modern E2E testing framework
- Cross-browser support (Chrome, Firefox, Safari)
- Powerful automation API
- Built-in tracing and debugging
- Excellent TypeScript support

Keyingi bo'limda Testing Patterns haqida o'rganamiz.
