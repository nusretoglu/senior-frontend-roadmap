# E2E Testing (End-to-End)

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchilar ko'pincha "Mening kompyuterimda ishlagandi-ku!" deb aytishadi. Lekin foydalanuvchi tizimga kirib "Sotib olish" tugmasini bosa olmasa, dasturning kodlari qanchalik zo'r yozilgani hech kimni qiziqtirmaydi. E2E (End-to-End) testlar barcha narsani foydalanuvchi ko'zi bilan (haqiqiy brauzerni ochib, haqiqiy tugmalarni bosib) tekshiradi. Bu eng qimmat va sekin test bo'lsa ham, eng ishonchli usuldir.

> [!NOTE]
> **Real-hayot analogiyasi: "Sotib olingan Avtomobilni Test-Drayv Qilish"**  
> **Unit Test:** Zavodda motor ishlashini tekshirish.  
> **Integration Test:** Motor va uzatmalar qutisi (karobka) bir-biriga mos tushishini tekshirish.  
> **E2E Test:** Xaridor bo'lib mashinaga o'tirish, o't oldirish, ko'chaga chiqish va haqiqiy trassada 100 km/s tezlikda haydab ko'rish. Agar mashina joyidan jilmasa, motorning zo'r ishlashi befoyda.

E2E testing - bu foydalanuvchi nuqtai nazaridan butun applicationni (dasturni) test qilish. Real brauzerda (Chrome, Firefox), real ssenariylarni simulyatsiya qilib, butun tizim to'g'ri ishlashini tekshiradi.

```mermaid
pyramid
    title Testlash Piramidasi (Testing Pyramid)
    "E2E Testlar (10%) - Sekin, Lekin Foydalanuvchiga Eng Yaqin"
    "Integratsiya Testlari (30%) - O'rtacha Tezlik, Tizimlar Aloqasi"
    "Unit Testlar (60%) - Juda Tez, Kichik Qismlarni Tekshiradi"
```

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi E2E test vositalari yordamida (masalan Cypress yoki Playwright) foydalanuvchi qila oladigan sodda harakatlarni avtomatlashtirishni biladi.

### Playwright yordamida oddiy E2E Test
Eng asosiy harakatlar: sahifaga kirish, inputni to'ldirish, tugmani bosish.

```javascript
import { test, expect } from '@playwright/test';

test('Foydalanuvchi muvaffaqiyatli avtorizatsiyadan o\'tadi', async ({ page }) => {
  // 1. Sahifaga o'tamiz
  await page.goto('/login');

  // 2. Inputlarni to'ldiramiz (Doim data-testid ishlatish tavsiya qilinadi)
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.fill('[data-testid="password"]', 'password123');

  // 3. Tugmani bosamiz
  await page.click('[data-testid="login-button"]');

  // 4. Boshqa sahifaga o'tganimizni tasdiqlaymiz
  await expect(page).toHaveURL('/dashboard');
});
```

**Tavsiya:** Elementlarni qidirishda `.btn-primary` yoki `#submit` kabi CSS klasslarga emas, balki maxsus E2E atributlarga tayanish kerak. CSS tez-tez o'zgarib turadi.

```javascript
// YOMON
await page.click('.btn-primary'); // Klass nomi o'zgarsa test sinadi

// YAXSHI
await page.click('[data-testid="submit-button"]');
```

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi E2E testlarda asinxron jarayonlarni, uzoq yuklanadigan qismlarni (Loading) va tarmoq so'rovlarini (Network Intercepts) samarali boshqara oladi.

### API so'rovlarni soxtalashtirish (Network Mocking)
Biz qidiruv tizimini E2E test qilmoqchimiz, lekin Backend 3 soniya o'ylab yotibdi. Buni kutib tursak test sekinlashib ketadi. Middle darajada biz Backend so'rovini ilib olib, darhol "Yolg'on" (Mock) javob qaytaramiz.

```javascript
import { test, expect } from '@playwright/test';

test('Mahsulotlar ro\'yxati to\'g\'ri render qilinadi', async ({ page }) => {
  // Backenddan keladigan /api/products so'rovini ilib olamiz
  await page.route('**/api/products', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify([{ id: 1, name: 'Sotiladigan Noutbuk' }]) // Soxta javob
    });
  });

  await page.goto('/products');

  // Kutamiz: Ma'lumot ekranga chiqishini
  await expect(page.locator('text=Sotiladigan Noutbuk')).toBeVisible();
});
```

### Visual Testing (Ko'rinish Testi)
Tizim ishlayotgan bo'lishi mumkin, lekin dizayner chizgan tugma qizil emas, ko'k rangda chiqib qolgan bo'lsa-chi? Buni Screenshot solishtirish orqali bilish mumkin.

```javascript
test('Bosh sahifa ko\'rinishi o\'zgarmagan', async ({ page }) => {
  await page.goto('/');

  // Hozirgi holatni rasmga oladi va eskisiga solishtiradi. 
  // O'zgargan bo'lsa xato beradi.
  await expect(page).toHaveScreenshot('homepage-snapshot.png');
});
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi E2E testlarni **izolyatsiya** qiladi, tayyor Fixture'lardan foydalanadi va testlar sekinlashib ketmasligi uchun ularni asosan API orqali set-up (tayyorlash) qilishni biladi.

### Tayyor ma'lumotlar bilan ishlash (Fixtures)
Tasavvur qiling, "Foydalanuvchi sozlamalari" sahifasini test qilishingiz kerak. Buning uchun E2E test avval ro'yxatdan o'tish formasi orqali account ochishi, keyin login qilib tizimga kirishi va undan keyingina sozlamalarga kirishi shart emas. Bunday qilish E2E testni juda uzoqqa cho'zib yuboradi. 

Buning o'rniga maxsus **loginAsUser** API chaqiruvi qilinadi va tayyor tokenni brauzerga o'rnatib, ro'ppa-rosa sozlamalar sahifasidan test boshlanadi.

```javascript
// fixtures/test-data.ts
import { test as base } from '@playwright/test';

// Maxsus "loggedInPage" yaratamiz
export const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    // 1. Orqa fonda API orqali auth qilamiz (UI ni ishlatmasdan, tezgina)
    await page.request.post('/api/login', {
      data: { email: 'admin@test.com', password: '123' }
    });
    
    // 2. Tayyor login qilingan sahifani testga beramiz
    await use(page);
  }
});

// endi testlarda:
import { test } from './fixtures/test-data';

// Bu test boshlanishida foydalanuvchi allaqachon login qilgan bo'ladi!
test('admin user o\'z profili ma\'lumotlarini o\'zgartira oladi', async ({ loggedInPage }) => {
  await loggedInPage.goto('/settings');
  // ... test davomi
});
```

### Intervyu Savoli
**"Flaky E2E testlar nima va ularni qanday yechasiz?"**
*Javob:* Flaky testlar bu - tizim ishlayotgan bo'lsa ham test goh qizil (xato) goh yashil (to'g'ri) ko'rsatadigan asabni buzuvchi muammodir.
Yechimlari:
1. **Implicit Waits (Kutishlar):** `setTimeout(2000)` qat'iy vaqt bermaslik kerak. Buning o'rniga "Tugma ekranda paydo bo'lguncha kut" (`toBeVisible()`) kabi o'zi tushunadigan shartli kutishlardan foydalanish lozim.
2. **Izolyatsiya:** Bir test boshqa testga bog'liq bo'lmasin. A test foydalanuvchi yaratsa, B test o'sha foydalanuvchini nomini o'zgartirishi xato. B test ham o'ziga alohida mustaqil foydalanuvchi yaratib olib keyin ishni boshlashi kerak.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Testlarni mustaqil qiling**: Har bir test toza holatdan (clean state) boshlanishi kerak. Bitta test yaratgan userni boshqa test ishlatmasin, chunki birinchi test qulasa, ikkinchisi ham asossiz qulaydi.
2. **Setup'ni API orqali qiling**: Yuqorida aytilganidek, "Settings" sahifasini test qilish uchun har safar avval UI orqali login qilib o'tirmang. Loginni to'g'ridan-to'g'ri orqa fonda API orqali amalga oshirib, tayyor Cookie bilan darhol qilinadigan ishni bajaring.
3. **Piramida qoidasini unutmang**: Har bir mayda CSS ko'rinishi yoxud kalkulyator funksiyasini Cypress yoki Playwright'da test qilmang. Ularni E2E ga qaraganda 100 marta tezroq ishlaydigan Unit Testlarda tekshiring. E2E da faqat eng muhim ssenariylarni (To'lov, Login, Xarid) tekshiring.
4. **Data-TestId ishlatish**: Har doim HTML elementlariga `data-testid="submit-btn"` atributini bering va testlarda ularni klass yoki id orqali emas, shu test-id orqali chaqiring.

---

## Xulosa

E2E testing - tizimingiz yuzini yorug' qiladigan eng kuchli vositadir.

| Tushuncha | Ta'rifi | Qachon ishlatiladi? |
| --- | --- | --- |
| **Testing Pyramid** | E2E ning faqatgina 10% muhim joylarni qoplashi kerakligi haqida qoida | Umumiy test strategiyasini tuzayotganda |
| **Playwright/Cypress** | Brauzerni inson kabi boshqaradigan dasturlar | E2E test yozilayotganda |
| **data-testid** | Klasslarga bog'lanib qolmaslik uchun ishonchli marker | HTML elementni tanlayotganda |
| **Visual Testing** | Ilova tashqi ko'rinishining o'zgarib ketmasligini rasmlar orqali farqlash | CSS va Dizayn komponentlarida |
| **Fixtures** | Testni tezlatish uchun foydalanuvchi sessiyasini dastlabdan API orqali tayyorlash | Uzoq yo'lli jarayon (masalan checkout)ni tekshirishda |
