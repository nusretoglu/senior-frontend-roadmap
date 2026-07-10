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
| 01 | [Unit Testing](./01-unit-testing.md) | Alohida testlash (Isolated), Mocking, Jest |
| 02 | [Integration Testing](./02-integration-testing.md) | Componentlar birlashuvi, API testlash |
| 03 | [E2E Testing](./03-e2e-testing.md) | Browser testlari (Haqiqiy foydalanuvchi kabi) |
| 04 | [Vitest](./04-vitest.md) | Zamonaviy va juda tezkor Unit Test freymvorki |
| 05 | [Cypress](./05-cypress.md) | Vizual E2E testlash, tarmoqni boshqarish |
| 06 | [Playwright](./06-playwright.md) | Barcha brauzerlarni qo'llab-quvvatlovchi E2E tool |
| 07 | [Testing Patterns](./07-testing-patterns.md) | Testlarni sifatli va mustahkam yozish arxitekturasi |

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi Testlash Piramidasini tushunishi va nima uchun testlar yozilishini bilishi kerak.

### Nima Uchun Testing?
1. **Regressiyani oldini olish**: Yangi yozgan kodingiz kecha yozilgan kodni buzib qo'ymaydi.
2. **Qo'rqmasdan Refactoring qilish**: Eski va xunuk kodni chiroyli qilib tozalaganingizda tizim sinib qolganini darhol bilib olasiz.
3. **Dokumentatsiya**: Test o'qigan odam "Ha, bu funksiya mana bunday ishlashi kerak ekan" deb darhol anglaydi.

### Testlash Piramidasi (Testing Pyramid)

```mermaid
pyramid
    title Testlash Piramidasi
    "E2E Testlar (10%) - Sekin, qimmat, user UI ni tekshiradi"
    "Integratsiya Testlari (20%) - Componentlar o'zaro ishlashi, API/DB"
    "Unit Testlar (70%) - Juda tez, Business logikalar, sof funksiyalar"
```

- **Unit Test**: Bitta dona funksiyani alohida tekshirish (Masalan: Sonlarni qo'shadigan funksiya).
- **Integration Test**: 2 ta va undan ko'p tizimlarni birlashtirib tekshirish (Masalan: DB dan foydalanuvchini olib kelib hisoblash).
- **E2E Test**: Brauzerni ochib, haqiqiy foydalanuvchi kabi tugmalarni bosib tekshirish.

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi Frameworklarni qachon va qaysi birini ishlatishni, shuningdek testlardagi ko'rinmas ob'ektlarni (Test Doubles) farqlay oladi.

### Test Doubles (O'rinbosarlar) farqi
Test yozganda biz har doim ham bazaga ulanolmaymiz yoki sms yubora olmaymiz (pullik). Buning o'rniga soxta ob'ektlar ishlatamiz:
- **Stub**: Oldindan tayyorlangan javob beruvchi robot.
- **Mock**: Kodingiz unga ulandimi yoki yo'qmi sanab, "Ha, sms funksiyasi chaqirildi" deb hisobot beruvchi ayg'oqchi.
- **Spy**: Asl funksiyani buzmasdan, u chaqirilganida orqadan kuzatuvchi.

### Qaysi toollarni tanlash kerak?

| Asbob | Qachon ishlatiladi | Xususiyati |
| --- | --- | --- |
| **Vitest** | Vue, React (Vite-based) loyihalarda | Jest'dan 10x tezroq, TypeScript Native |
| **Jest** | Eski yoki Node.js (Backend) loyihalarda | Standart va eng ko'p hujjatga ega |
| **Cypress** | Frontend og'ir UI loyihalarda | Ko'z bilan ko'rib, oson debug qilinadi |
| **Playwright** | Bir vaqtda Chrome, Safari da tezkor test | Juda tez, bir nechta Oynalarda parallel ishlaydi |

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi testlarning loyiha darajasidagi qoplamasini (Coverage) strategik hal qiladi. CI/CD (GitHub Actions) ga ulaydi va arxitekturani moslashtiradi.

### Real-World Testing Strategy
Katta e-commerce loyihasi misolida nimalarni test qilish kerak:

| Ssenariy | Ustuvorlik | Test turi |
|----------|----------|-----------|
| To'lovni amalga oshirish | Juda Muhim | E2E + Integration |
| Ro'yxatdan o'tish | Yuqori | E2E + Unit |
| Qidiruv tizimi | Yuqori | Integration |
| Narxlarni (Chegirma) hisoblash | Yuqori | Unit (Matematika) |
| Temani o'zgartirish (Dark mode) | Past | Unit / UI Test |

### CI/CD da Testlar (GitHub Actions)
Katta loyihalarda hech kim testlarni o'zining kompyuterida tekshirib (run) o'tirmaydi. Har gal kod Main (Master) ga qo'shilganda server (CI) o'zi barcha testlarni yurgizadi va qizil yonib tursa kiritmaydi.

```yaml
# .github/workflows/test.yml
name: Tizimni Testlash
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      # Barcha Unit testlarni ishga tushirish (Vitest)
      - run: npm run test:unit
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      # Playwright browserlarni tortib oladi va E2E ni tekshiradi
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### Intervyu Savoli
**"Test coverage 100% bo'lsa, dasturda umuman bug yo'q deb aytish mumkinmi?"**
*Javob:* 
Aslo yo'q. Test Coverage bu — kodingizdagi jami qatorlarning (lines of code) necha foizi Test fayllari tomonidan hech bo'lmasa 1 marta o'qib (run qilib) chiqilganini anglatadi, xolos. U koddagi logikani yoki Race-conditionlarni (ikkita zapros birdan kelib qolishi) baholamaydi. Kodingizni 100% o'qigan taqdirda ham, Edge Case lar (kamdan-kam uchraydigan stsenariylar) tekshirilmagan bo'lsa, xato albatta chiqadi. 100% coverage - bu fanatizm. Asosiy maqsad 80% atrofida ushlab, qolgan vaqtni E2E larga sarflashdir.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **"100% Coverage" afsonasi**: Barcha fayllarni qamrab olish (100% coverage) shart emas. Business-critical joylarga (to'lov, savat, ro'yxatdan o'tish) urg'u bering. UI dagi matn rangi uchun test yozish vaqtni o'ldirishdir.
2. **Kodni buzishdan oldin yozing (TDD)**: Testlarni kod yozmasdan oldin yozish (Test Driven Development) sizga interfeys haqida aniqroq o'ylash imkonini beradi. "Bu funksiyam qanday parametrlarni qabul qiladi?" deb oldindan poydevor qurib olasiz.
3. **Piramida qoidasini asrang**: O'ylagan har bir kodingizni avval Unit test bilan yoping. E2E testlarni faqat eng katta, umumlashgan foydalanuvchi "sayohati" (masalan "mahsulot topish va sotib olish") uchungina ishlating. Chunki ularni sozlash va yurgizish (CI da) qimmatga tushadi.

---

## Xulosa

Yodingizda tuting: "Test yozilmagan kod - bu boshidanoq eskirgan koddir".
| Test turi | Xususiyati | Asbob (Tool) |
| --- | --- | --- |
| **Unit** | Bitta g'ishtni tekshirish | Vitest, Jest |
| **Integration** | G'ishtlar birikib devor bo'lganini tekshirish | Vitest, MSW, RTL |
| **E2E** | Devorlar butun bir uy bo'lganini va foydalanuvchi yashay olishini tekshirish | Playwright, Cypress |
