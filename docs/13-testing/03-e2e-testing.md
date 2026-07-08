# E2E Testing (End-to-End)

E2E testing - bu foydalanuvchi nuqtai nazaridan butun applicationni test qilish. Real browser'da, real user flow'larni simulyatsiya qilib, butun tizim to'g'ri ishlashini tekshiradi.

## E2E Test Nima?

E2E (End-to-End) test - bu foydalanuvchi qanday qilib applicationdan foydalanishini to'liq simulyatsiya qiladigan test. Frontend, backend, database, va barcha external service'lar birgalikda test qilinadi.

### Testing Pyramid'da E2E

```
         /\
        /  \        E2E Tests (10-20%)
       / E2E\       - User flows
      /------\      - Critical paths
     /        \     - Smoke tests
    /  Integ   \
   /    Tests   \   Integration (20-30%)
  /--------------\
 /                \
/   Unit Tests     \ Unit Tests (60-70%)
--------------------
```

### E2E Test Xususiyatlari

| Xususiyat | Tavsif |
|-----------|--------|
| **Scope** | Butun application stack |
| **Speed** | Sekin (sekundlar, minutlar) |
| **Reliability** | Flaky bo'lishi mumkin |
| **Maintenance** | Yuqori effort |
| **Value** | Eng yuqori confidence |

## E2E Test Anatomy

```javascript
// playwright example
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login and clear cart
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'user@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('user can complete purchase', async ({ page }) => {
    // Navigate to products
    await page.goto('/products')

    // Add item to cart
    await page.click('[data-testid="product-1-add"]')
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')

    // Go to cart
    await page.click('[data-testid="cart-icon"]')
    await expect(page).toHaveURL('/cart')

    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]')
    await expect(page).toHaveURL('/checkout')

    // Fill shipping info
    await page.fill('[data-testid="address"]', '123 Main St')
    await page.fill('[data-testid="city"]', 'New York')
    await page.fill('[data-testid="zip"]', '10001')

    // Fill payment info
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="expiry"]', '12/25')
    await page.fill('[data-testid="cvv"]', '123')

    // Complete purchase
    await page.click('[data-testid="pay-button"]')

    // Verify success
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
  })
})
```

## Critical User Flows

### Authentication Flow

```javascript
test.describe('Authentication', () => {
  test('user registration flow', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    await page.fill('[data-testid="name"]', 'John Doe')
    await page.fill('[data-testid="email"]', `test-${Date.now()}@example.com`)
    await page.fill('[data-testid="password"]', 'SecurePass123!')
    await page.fill('[data-testid="password-confirm"]', 'SecurePass123!')

    // Accept terms
    await page.check('[data-testid="terms-checkbox"]')

    // Submit
    await page.click('[data-testid="register-button"]')

    // Verify redirect to verification page
    await expect(page).toHaveURL('/verify-email')
    await expect(page.locator('text=Verification email sent')).toBeVisible()
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="email"]', 'wrong@example.com')
    await page.fill('[data-testid="password"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toHaveText(
      'Invalid email or password'
    )
    await expect(page).toHaveURL('/login') // Still on login page
  })

  test('password reset flow', async ({ page }) => {
    await page.goto('/forgot-password')

    await page.fill('[data-testid="email"]', 'user@example.com')
    await page.click('[data-testid="reset-button"]')

    await expect(page.locator('text=Reset link sent')).toBeVisible()

    // In real test, you'd check email or use a test endpoint
    // await page.goto('/reset-password?token=test-token')
  })

  test('logout clears session', async ({ page }) => {
    // Login first
    await loginAsUser(page)

    // Logout
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout"]')

    // Verify logged out
    await expect(page).toHaveURL('/login')

    // Try accessing protected route
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })
})
```

### E-commerce Flow

```javascript
test.describe('E-commerce', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page)
  })

  test('search and filter products', async ({ page }) => {
    await page.goto('/products')

    // Search
    await page.fill('[data-testid="search"]', 'laptop')
    await page.keyboard.press('Enter')

    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(5)

    // Filter by price
    await page.fill('[data-testid="min-price"]', '500')
    await page.fill('[data-testid="max-price"]', '1500')
    await page.click('[data-testid="apply-filters"]')

    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(3)

    // Sort by price
    await page.selectOption('[data-testid="sort"]', 'price-asc')

    const prices = await page.locator('[data-testid="product-price"]').allTextContents()
    const priceNumbers = prices.map(p => parseFloat(p.replace('$', '')))

    // Verify ascending order
    expect(priceNumbers).toEqual([...priceNumbers].sort((a, b) => a - b))
  })

  test('add to cart and update quantity', async ({ page }) => {
    await page.goto('/products/1')

    // Add to cart
    await page.click('[data-testid="add-to-cart"]')
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')

    // Go to cart
    await page.goto('/cart')

    // Increase quantity
    await page.click('[data-testid="quantity-plus"]')
    await expect(page.locator('[data-testid="item-quantity"]')).toHaveValue('2')

    // Verify total updated
    await expect(page.locator('[data-testid="cart-total"]')).toContainText('200')

    // Remove item
    await page.click('[data-testid="remove-item"]')
    await expect(page.locator('[data-testid="empty-cart"]')).toBeVisible()
  })

  test('apply coupon code', async ({ page }) => {
    // Add item to cart
    await addItemToCart(page, 1)
    await page.goto('/cart')

    // Apply valid coupon
    await page.fill('[data-testid="coupon-input"]', 'SAVE20')
    await page.click('[data-testid="apply-coupon"]')

    await expect(page.locator('[data-testid="discount"]')).toContainText('-$20')
    await expect(page.locator('[data-testid="coupon-applied"]')).toBeVisible()

    // Try invalid coupon
    await page.fill('[data-testid="coupon-input"]', 'INVALID')
    await page.click('[data-testid="apply-coupon"]')

    await expect(page.locator('[data-testid="coupon-error"]')).toHaveText(
      'Invalid coupon code'
    )
  })
})
```

### Multi-step Form Flow

```javascript
test.describe('Multi-step Application Form', () => {
  test('complete application process', async ({ page }) => {
    await page.goto('/apply')

    // Step 1: Personal Info
    await expect(page.locator('[data-testid="step-indicator"]')).toHaveText('Step 1 of 4')

    await page.fill('[data-testid="first-name"]', 'John')
    await page.fill('[data-testid="last-name"]', 'Doe')
    await page.fill('[data-testid="email"]', 'john@example.com')
    await page.fill('[data-testid="phone"]', '1234567890')

    await page.click('[data-testid="next-step"]')

    // Step 2: Address
    await expect(page.locator('[data-testid="step-indicator"]')).toHaveText('Step 2 of 4')

    await page.fill('[data-testid="street"]', '123 Main St')
    await page.fill('[data-testid="city"]', 'New York')
    await page.selectOption('[data-testid="state"]', 'NY')
    await page.fill('[data-testid="zip"]', '10001')

    await page.click('[data-testid="next-step"]')

    // Step 3: Documents
    await expect(page.locator('[data-testid="step-indicator"]')).toHaveText('Step 3 of 4')

    // Upload file
    const fileInput = page.locator('[data-testid="document-upload"]')
    await fileInput.setInputFiles('test-fixtures/document.pdf')

    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible()
    await page.click('[data-testid="next-step"]')

    // Step 4: Review
    await expect(page.locator('[data-testid="step-indicator"]')).toHaveText('Step 4 of 4')

    // Verify summary
    await expect(page.locator('[data-testid="summary-name"]')).toHaveText('John Doe')
    await expect(page.locator('[data-testid="summary-email"]')).toHaveText('john@example.com')

    // Submit
    await page.click('[data-testid="submit-application"]')

    // Verify success
    await expect(page).toHaveURL(/\/application\/\d+/)
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('form validation on each step', async ({ page }) => {
    await page.goto('/apply')

    // Try to proceed without filling required fields
    await page.click('[data-testid="next-step"]')

    // Verify errors shown
    await expect(page.locator('[data-testid="first-name-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()

    // Still on step 1
    await expect(page.locator('[data-testid="step-indicator"]')).toHaveText('Step 1 of 4')
  })

  test('back navigation preserves data', async ({ page }) => {
    await page.goto('/apply')

    // Fill step 1
    await page.fill('[data-testid="first-name"]', 'John')
    await page.fill('[data-testid="last-name"]', 'Doe')
    await page.fill('[data-testid="email"]', 'john@example.com')
    await page.fill('[data-testid="phone"]', '1234567890')
    await page.click('[data-testid="next-step"]')

    // Fill step 2
    await page.fill('[data-testid="street"]', '123 Main St')
    await page.click('[data-testid="next-step"]')

    // Go back to step 1
    await page.click('[data-testid="prev-step"]')
    await page.click('[data-testid="prev-step"]')

    // Verify data preserved
    await expect(page.locator('[data-testid="first-name"]')).toHaveValue('John')
    await expect(page.locator('[data-testid="email"]')).toHaveValue('john@example.com')
  })
})
```

## Network Mocking

```javascript
test.describe('API Mocking', () => {
  test('handle slow network', async ({ page }) => {
    // Intercept API calls with delay
    await page.route('**/api/products', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 3000))
      await route.fulfill({
        status: 200,
        body: JSON.stringify([{ id: 1, name: 'Product 1' }])
      })
    })

    await page.goto('/products')

    // Verify loading state shown
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()

    // Wait for data
    await expect(page.locator('[data-testid="product-card"]')).toBeVisible({
      timeout: 5000
    })
  })

  test('handle API error', async ({ page }) => {
    await page.route('**/api/products', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      })
    })

    await page.goto('/products')

    await expect(page.locator('[data-testid="error-message"]')).toHaveText(
      'Failed to load products. Please try again.'
    )
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test('handle network offline', async ({ page, context }) => {
    await page.goto('/products')
    await expect(page.locator('[data-testid="product-card"]')).toBeVisible()

    // Go offline
    await context.setOffline(true)

    // Try to load more
    await page.click('[data-testid="load-more"]')

    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible()

    // Go back online
    await context.setOffline(false)

    await page.click('[data-testid="retry-button"]')
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(20)
  })

  test('mock specific API response', async ({ page }) => {
    await page.route('**/api/user/profile', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin',
          permissions: ['read', 'write', 'delete']
        })
      })
    })

    await page.goto('/profile')

    // Verify admin features visible
    await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible()
    await expect(page.locator('[data-testid="delete-button"]')).toBeVisible()
  })
})
```

## Visual Testing

```javascript
test.describe('Visual Regression', () => {
  test('homepage visual comparison', async ({ page }) => {
    await page.goto('/')

    // Full page screenshot
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true
    })
  })

  test('component visual states', async ({ page }) => {
    await page.goto('/components/button')

    // Default state
    const button = page.locator('[data-testid="primary-button"]')
    await expect(button).toHaveScreenshot('button-default.png')

    // Hover state
    await button.hover()
    await expect(button).toHaveScreenshot('button-hover.png')

    // Focus state
    await button.focus()
    await expect(button).toHaveScreenshot('button-focus.png')

    // Disabled state
    await page.goto('/components/button?disabled=true')
    await expect(button).toHaveScreenshot('button-disabled.png')
  })

  test('responsive layouts', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ]

    for (const { width, height, name } of viewports) {
      await page.setViewportSize({ width, height })
      await page.goto('/dashboard')

      await expect(page).toHaveScreenshot(`dashboard-${name}.png`)
    }
  })

  test('dark mode', async ({ page }) => {
    // Light mode
    await page.goto('/')
    await expect(page).toHaveScreenshot('homepage-light.png')

    // Toggle dark mode
    await page.click('[data-testid="theme-toggle"]')
    await expect(page).toHaveScreenshot('homepage-dark.png')
  })
})
```

## Accessibility Testing

```javascript
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('form accessibility', async ({ page }) => {
    await page.goto('/register')

    const results = await new AxeBuilder({ page })
      .include('[data-testid="registration-form"]')
      .analyze()

    // Log violations for debugging
    if (results.violations.length > 0) {
      console.log('Accessibility violations:', results.violations)
    }

    expect(results.violations).toEqual([])
  })

  test('keyboard navigation', async ({ page }) => {
    await page.goto('/')

    // Tab through focusable elements
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'nav-home')

    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'nav-products')

    // Enter to activate
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/products')
  })

  test('screen reader labels', async ({ page }) => {
    await page.goto('/products')

    // Verify ARIA labels
    const searchInput = page.locator('[data-testid="search"]')
    await expect(searchInput).toHaveAttribute('aria-label', 'Search products')

    // Verify button has accessible name
    const addButton = page.locator('[data-testid="add-to-cart"]').first()
    await expect(addButton).toHaveAttribute('aria-label', /Add .+ to cart/)

    // Verify images have alt text
    const images = page.locator('[data-testid="product-image"]')
    for (const img of await images.all()) {
      await expect(img).toHaveAttribute('alt', /.+/)
    }
  })

  test('focus management in modal', async ({ page }) => {
    await page.goto('/products')

    // Open modal
    await page.click('[data-testid="product-1"]')

    // Focus should be in modal
    const modal = page.locator('[data-testid="product-modal"]')
    await expect(modal).toBeFocused()

    // Tab should stay within modal
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'close-modal')

    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'add-to-cart')

    // Escape closes modal
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible()

    // Focus returns to trigger
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'product-1')
  })
})
```

## Mobile Testing

```javascript
import { devices } from '@playwright/test'

test.describe('Mobile', () => {
  test.use({ ...devices['iPhone 13'] })

  test('mobile navigation', async ({ page }) => {
    await page.goto('/')

    // Desktop nav should be hidden
    await expect(page.locator('[data-testid="desktop-nav"]')).not.toBeVisible()

    // Mobile hamburger menu
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()

    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()

    // Navigate
    await page.click('[data-testid="nav-products"]')
    await expect(page).toHaveURL('/products')

    // Menu should close
    await expect(page.locator('[data-testid="mobile-nav"]')).not.toBeVisible()
  })

  test('touch gestures', async ({ page }) => {
    await page.goto('/gallery')

    const gallery = page.locator('[data-testid="image-gallery"]')

    // Swipe left
    await gallery.dispatchEvent('touchstart', { touches: [{ clientX: 300, clientY: 200 }] })
    await gallery.dispatchEvent('touchmove', { touches: [{ clientX: 100, clientY: 200 }] })
    await gallery.dispatchEvent('touchend')

    await expect(page.locator('[data-testid="slide-2"]')).toBeVisible()

    // Swipe right
    await gallery.dispatchEvent('touchstart', { touches: [{ clientX: 100, clientY: 200 }] })
    await gallery.dispatchEvent('touchmove', { touches: [{ clientX: 300, clientY: 200 }] })
    await gallery.dispatchEvent('touchend')

    await expect(page.locator('[data-testid="slide-1"]')).toBeVisible()
  })

  test('mobile form input', async ({ page }) => {
    await page.goto('/contact')

    // Fill form
    await page.fill('[data-testid="name"]', 'John')
    await page.fill('[data-testid="email"]', 'john@example.com')

    // Verify keyboard doesn't cover input
    const input = page.locator('[data-testid="message"]')
    await input.focus()

    // Input should be visible (not covered by keyboard)
    await expect(input).toBeInViewport()
  })
})
```

## Test Data Management

```javascript
// fixtures/test-data.js
export const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'AdminPass123!',
    role: 'admin'
  },
  customer: {
    email: 'customer@example.com',
    password: 'CustomerPass123!',
    role: 'customer'
  }
}

export const testProducts = [
  { id: 1, name: 'Laptop', price: 999.99, category: 'electronics' },
  { id: 2, name: 'Mouse', price: 29.99, category: 'electronics' },
  { id: 3, name: 'T-Shirt', price: 19.99, category: 'clothing' }
]

// Test helper functions
export async function loginAsUser(page, user = testUsers.customer) {
  await page.goto('/login')
  await page.fill('[data-testid="email"]', user.email)
  await page.fill('[data-testid="password"]', user.password)
  await page.click('[data-testid="login-button"]')
  await expect(page).toHaveURL('/dashboard')
}

export async function addItemToCart(page, productId) {
  await page.goto(`/products/${productId}`)
  await page.click('[data-testid="add-to-cart"]')
  await expect(page.locator('[data-testid="added-to-cart-toast"]')).toBeVisible()
}

export async function clearCart(page) {
  await page.goto('/cart')
  const clearButton = page.locator('[data-testid="clear-cart"]')
  if (await clearButton.isVisible()) {
    await clearButton.click()
  }
}

// Database seeding via API
export async function seedDatabase(request) {
  await request.post('/api/test/seed', {
    data: {
      users: Object.values(testUsers),
      products: testProducts
    }
  })
}

export async function cleanDatabase(request) {
  await request.post('/api/test/clean')
}
```

### Fixtures in Playwright

```javascript
// fixtures.ts
import { test as base } from '@playwright/test'
import { testUsers, loginAsUser, seedDatabase, cleanDatabase } from './test-data'

type MyFixtures = {
  loggedInPage: Page
  adminPage: Page
}

export const test = base.extend<MyFixtures>({
  loggedInPage: async ({ page }, use) => {
    await loginAsUser(page, testUsers.customer)
    await use(page)
  },

  adminPage: async ({ page }, use) => {
    await loginAsUser(page, testUsers.admin)
    await use(page)
  }
})

// Usage
test('customer can view orders', async ({ loggedInPage }) => {
  await loggedInPage.goto('/orders')
  await expect(loggedInPage.locator('[data-testid="orders-list"]')).toBeVisible()
})

test('admin can view all users', async ({ adminPage }) => {
  await adminPage.goto('/admin/users')
  await expect(adminPage.locator('[data-testid="users-table"]')).toBeVisible()
})
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgres://test:test@localhost:5432/test_db

      - name: Build application
        run: npm run build

      - name: Start server
        run: npm run start &
        env:
          DATABASE_URL: postgres://test:test@localhost:5432/test_db
          PORT: 3000

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run E2E tests
        run: npx playwright test
        env:
          BASE_URL: http://localhost:3000

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload screenshots
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: screenshots
          path: test-results/
```

### Parallelization

```javascript
// playwright.config.js
export default {
  testDir: './e2e',
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results.xml' }],
    ['github'] // GitHub Actions annotations
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' }
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

  // Sharding for large test suites
  shard: process.env.CI ? {
    total: parseInt(process.env.SHARD_TOTAL) || 1,
    current: parseInt(process.env.SHARD_INDEX) || 1
  } : undefined
}
```

## Best Practices

### 1. Test Selectors

```javascript
// BAD - Brittle selectors
await page.click('.btn-primary')
await page.click('#submit')
await page.click('div > span > button')

// GOOD - Data test IDs
await page.click('[data-testid="submit-button"]')

// GOOD - Accessible selectors
await page.click('button[aria-label="Submit form"]')
await page.getByRole('button', { name: 'Submit' })
await page.getByText('Submit')
```

### 2. Waiting Strategies

```javascript
// BAD - Arbitrary sleep
await page.waitForTimeout(2000)

// GOOD - Wait for specific conditions
await page.waitForSelector('[data-testid="loaded"]')
await expect(page.locator('[data-testid="content"]')).toBeVisible()
await page.waitForResponse('**/api/data')
await page.waitForLoadState('networkidle')
```

### 3. Test Independence

```javascript
// BAD - Tests depend on each other
test('create user', async ({ page }) => {
  // Creates user
})

test('edit user', async ({ page }) => {
  // Assumes user exists from previous test
})

// GOOD - Independent tests
test.describe('User management', () => {
  test.beforeEach(async ({ request }) => {
    await seedTestUser(request)
  })

  test.afterEach(async ({ request }) => {
    await cleanupTestUser(request)
  })

  test('create user', async ({ page }) => {
    // Independent
  })

  test('edit user', async ({ page }) => {
    // Independent, uses seeded user
  })
})
```

### 4. Error Messages

```javascript
// BAD - Generic error
expect(result).toBe(true)

// GOOD - Descriptive assertion
await expect(
  page.locator('[data-testid="success-message"]'),
  'Success message should appear after form submission'
).toBeVisible()
```

## Interview Savollari

### 1. E2E test va integration test orasidagi farq nima?

**Javob:**
- **E2E**: Real browser, real user interactions, full stack (FE + BE + DB)
- **Integration**: Code level, multiple units, often mocked externals

```javascript
// E2E - real browser
test('user checkout', async ({ page }) => {
  await page.goto('/cart')
  await page.click('button')
  // Real network, real rendering
})

// Integration - code level
test('order service', async () => {
  const result = await orderService.createOrder(data)
  expect(result).toBeDefined()
})
```

### 2. Flaky E2E testlar qanday yechiladi?

**Javob:**
1. **Proper waits** - explicit conditions, not timeouts
2. **Retry logic** - CI da retries
3. **Test isolation** - har test o'z datasi
4. **Stable selectors** - data-testid
5. **Network mocking** - external dependencies uchun

### 3. E2E test qachon yozish kerak?

**Javob:**
- Critical user flows (login, checkout, signup)
- Business-critical features
- Smoke tests (deploy dan keyin basic sanity)
- Regression tests (bug fix verifylar)

E2E yozmaslik kerak:
- Edge cases (unit test bilan qoplash)
- Visual details (visual regression tools)
- Performance (dedicated perf tests)

### 4. E2E testlarni qanday tezlashtirish mumkin?

**Javob:**
1. **Parallelization** - concurrent test execution
2. **Sharding** - testlarni bo'lish
3. **API shortcuts** - UI o'rniga API bilan setup
4. **Test isolation** - shared state yo'q
5. **Selective running** - affected tests only

### 5. Test data qanday manage qilinadi?

**Javob:**
1. **API endpoints** - test data uchun maxsus endpoints
2. **Database seeds** - before hooks da
3. **Fixtures** - reusable test data
4. **Cleanup** - after hooks da
5. **Unique data** - timestamps/random strings

## Xulosa

E2E testing:
- User perspective dan application test qilish
- Critical flows uchun eng yuqori confidence
- Sekin va maintenance-heavy, lekin muhim
- Proper selectors, waits, isolation kerak
- CI/CD da automated run

Testing pyramid'ni yodda tuting: ko'p unit, o'rta integration, kam E2E.
