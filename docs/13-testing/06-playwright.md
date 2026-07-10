# Playwright

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Garchi Cypress E2E olamida inqilob qilgan bo'lsa-da, uning ma'lum cheklovlari bor edi: faqat bitta tab bilan ishlash, o'zgaruvchan brauzer arxitekturasi va iframe'lar bilan ishlashdagi muammolar. Microsoft tomonidan yaratilgan Playwright bu muammolarni hal etib, barcha brauzerlarda (Chromium, Firefox, Safari) juda tez va parallel ishlaydigan yangi avlod test freymvorkini taqdim etdi.

> [!NOTE]
> **Real-hayot analogiyasi: "Pultli o'yinchoq mashina vs Aqlli avtopilot"**  
> **Eski usul (Selenium):** O'yinchoq mashinani pultda boshqarish. Mashina to'siqqa borib qolsa ham siz pultdan "oldiga yur" deb bosib turasiz, lekin u yura olmaydi va sinadi (Flaky tests).
> **Playwright (Avtopilot):** Mashina o'z-o'zini boshqaradi, to'siqni ko'rsa kutadi, yo'l ochilganda harakatni davom ettiradi. U barcha oynalar, tablar va ramkalarni bitta vaqtda kuzatib turadi.

Playwright - bu WebKit, Firefox va Chromium ni bitta API bilan boshqarishga imkon beruvchi Node.js kutubxonasi. U asinxron va har doim o'zgarib turadigan zamonaviy Web Applar uchun maxsus qurilgan.

```mermaid
graph TD
    subgraph Playwright Arxitekturasi
        N[Node.js Test Scriptlari] -->|WebSocket| C[Playwright Server]
        C -->|CDP (Chrome DevTools)| B1[Chromium]
        C -->|Juggler| B2[Firefox]
        C -->|WebKit Protocol| B3[Safari]
    end
    
    style N fill:#f5f5f5,stroke:#9e9e9e
    style C fill:#e3f2fd,stroke:#1565c0
    style B1 fill:#e8f5e9,stroke:#2e7d32
```

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi Playwright ni o'rnatish, sodda skriptlarni ishga tushirish, va UI (Code Generator) yordamida tezkor testlar yozishni bilishi kerak.

### O'rnatish

```bash
# Playwright ni loyihaga qo'shish va brauzerlarni o'rnatish
npm init playwright@latest
```

### Kodni o'zi yozib beruvchi sehrli uskunalar (Codegen)
Playwright ning eng zo'r tarafi - u sizning harakatlaringizni yozib olib, tayyor kod qilib beradi. Terminalda:
```bash
npx playwright codegen github.com
```
Buni yozsangiz, brauzer ochiladi va siz saytda nima tugma bossangiz, nima yozsangiz barchasi Playwright kodi ko'rinishida yozilib ketaveradi.

### Oddiy test kodi
O'sha yozilgan kod odatda shunga o'xshash bo'ladi:

```typescript
import { test, expect } from '@playwright/test';

test('Foydalanuvchi qidiruvdan foydalana oladi', async ({ page }) => {
  await page.goto('https://github.com/');
  
  // placeholder orqali inputni topish va "Playwright" yozish
  await page.getByPlaceholder('Search').fill('Playwright');
  await page.keyboard.press('Enter');

  // Natijada URL qidiruv sahifasiga o'tganini tekshirish
  await expect(page).toHaveURL(/.*search\?q=Playwright/);
});
```
*Junior e'tibor qaratishi kerak bo'lgan asosiy narsa: barcha komandalar oldida `await` borligiga ahamiyat bering.*

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi Playwright ning "Web-first Assertions" larini (qayta-qayta tekshiruvchi funksiyalari), tarmoq so'rovlarini aldashni (Intercept) va sahifalarni bir nechta tablarda tekshirishni yaxshi tushunadi.

### Auto-waiting va Assertions
Playwright element chiqishini avtomatik kutadi. Middle dasturchi qat'iy tekshiruvlardan foydalanadi:

```typescript
import { test, expect } from '@playwright/test';

test('Modal oyna to\'g\'ri ochiladi', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Playwright tugma paydo bo'lishini, va clickable (bosish mumkin) bo'lishini 
  // o'zi kutadi. Qo'shimcha wait shart emas.
  await page.getByRole('button', { name: 'Delete Account' }).click();

  const modal = page.getByTestId('confirmation-modal');
  
  // expect().toBeVisible() qat'iy tekshiruv emas, u Web-first tekshiruvdir. 
  // Ya'ni to modal chiqquncha belgilangan vaqtgacha tinmay tekshiraveradi.
  await expect(modal).toBeVisible();
  
  // Element ichidagi matnni tekshirish
  await expect(modal).toContainText('Are you absolutely sure?');
});
```

### Tarmoqni aldash (Mocking Network)
Backend umuman yo'q yoki o'chiq bo'lsa ham test yozish mumkin:

```typescript
test('Backend ishlamayotgan paytda xato xabari chiqadi', async ({ page }) => {
  // /api/data ga ketayotgan barcha so'rovlarni ilib, 500 (Server Error) qaytaramiz
  await page.route('**/api/data', async route => {
    await route.fulfill({ status: 500 });
  });

  await page.goto('/dashboard');
  
  // UI da qizil xato xabari chiqqanini kutamiz
  await expect(page.getByText('Serverda muammo yuz berdi')).toBeVisible();
});
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi Playwright testlarni **Parallel** (bir vaqtning o'zida bir nechta) ishga tushirishni arxitekturasini tuzadi. Page Object Model (POM) yaratadi va Auth state larni (sessiyalarni) to'g'ri boshqaradi.

### Page Object Model (POM)
Katta loyihalarda har bitta test ichida selectorlar (masalan `[data-testid="login"]`) yozilib ketaversa, ertaga bitta selector o'zgarganda 100 ta testni to'g'rilab chiqish kerak bo'ladi. POM bunga yechim:

```typescript
// pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passInput: Locator;
  readonly submitBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passInput = page.getByLabel('Password');
    this.submitBtn = page.getByRole('button', { name: 'Log in' });
  }

  async doLogin(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passInput.fill(pass);
    await this.submitBtn.click();
  }
}

// test.spec.ts ichida:
import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('Foydalanuvchi login qila oladi', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/login');
  // Kod toza va faqat biznes logikadan iborat
  await loginPage.doLogin('admin@test.com', 'secret'); 
});
```

### Authentication Holatini Saqlash (Storage State)
Har bir test o'zidan oldin UI dan login qilaversa testlar soatlab vaqt oladi. Bitta faylda (Global Setup) login qilib, uning holatini `.json` qilib saqlash va boshqa testlarga tarqatish kerak.

```typescript
// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Ayni paytdagi brauzer Cookies va LocalStorage larni faylga yozib qo'yamiz
  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();
}
export default globalSetup;
```

### Intervyu Savoli
**"Playwright va Cypress test runner'larining asosiy farqlari nimada?"**
*Javob:* 
1. **Arxitektura:** Cypress brauzerni ichida bitta iframe da JavaScript loop orqali ishlaydi. U faqat bitta tab bilan ishlay oladi. Playwright esa Node.js dan turib WebSocket orqali (CDP protokoli yordamida) brauzerlarni masofadan turib boshqaradi. Bu Playwrightga bitta vaqtda bir nechta Tab lar va Oynalar (Windows) ochib test qilish imkonini beradi.
2. **Tillarni qo'llashi:** Cypress asosan JavaScript/TypeScript da yoziladi. Playwright da JS/TS dan tashqari Python, Java va C# da ham test yozsa bo'ladi.
3. **Parallelizm:** Playwright Native (o'zidan-o'zi) testlarni alohida jarayonlarda parallel ishlatadi, bu Cypress dan ancha tezroq ishlashini ta'minlaydi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Auto-waiting ni buzmang**: Playwright o'zi element qachon bossa bo'ladigan holatga (clickable, visible) kelishini avtomatik kutadi. Siz qo'shimcha tarzda `page.waitForTimeout(5000)` kabi statik kutishlarni ishlatsangiz, bu ajoyib qobiliyatni yo'qqa chiqargan bo'lasiz.
2. **Web-first Assertions ishlating**: `expect(await page.textContent('.title')).toBe('Hello')` o'rniga, doimo `await expect(page.locator('.title')).toHaveText('Hello')` ishlating. Ikkinchi usul avtomatik ravishda text "Hello" bo'lguncha qayta-qayta tekshirib (retry) kutadi, birinchisi esa o'sha soniyada nima bo'lsa shuni olib asossiz test qulaydi.
3. **Trace Viewer dan foydalaning**: Testlaringiz CI da (masalan GitHub Actions da) qulaganda nima bo'lganini bilish qiyin. `trace: 'on-first-retry'` sozlamasi orqali Playwright sizga test qulagan vaqtdagi butun DOM, network, va konsol jurnallarini o'z ichiga olgan ZIP fayl yaratib beradi. Siz buni mahalliy kompyuterda vizual ko'rishingiz mumkin.

---

## Xulosa

Playwright - E2E olamidagi hozirgi kundagi eng kuchli va ko'p qirrali quroldir.

| Xususiyat | Qanday ishlaydi | Foydasi |
| --- | --- | --- |
| **Cross-browser** | WebKit, Chromium, Firefox ni o'zi yuklab oladi | Apple (Safari) da qanaqa chiqishini Windowsda tekshirish mumkin |
| **Codegen** | Sizning harakatlaringizni yozib kod qilib beradi | Yuzlab qator kodlarni 0 dan yozib yotmaysiz |
| **Storage State** | Barcha Cookies/Tokens lar faylga yoziladi | Auth/Login ga vaqt ketmaydi, testlar parvoz qiladi |
| **Auto-waiting** | Click qilishdan oldin element reaksiyasini tekshiradi | Flaky (o'zgaruvchan/mo'rt) testlarning oldi olinadi |
| **Parallel Execution** | CPU yadrolariga qarab bir vaqtda testlarni bajaradi | 15 daqiqalik test sikllari 2-3 daqiqaga tushadi |
