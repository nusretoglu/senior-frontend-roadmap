# Monorepo - Mono-Repository Arxitekturasi

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturlashda ko'pincha bitta loyiha ichida bir nechta dasturlar (masalan, Web App, Admin Panel va Mobile App) bo'ladi. Ular odatda bir xil ranglar, UI komponentlari (Button, Modal) yoki biznes mantiqlaridan (masalan, valyutani hisoblash funksiyasi) foydalanadi. Agar har bir loyiha alohida repozitoriyada (Polyrepo) tursa, siz bir marta yozilgan kodni hamma loyihaga nusxalab (copy-paste) chiqishingiz kerak bo'ladi. Monorepo esa yuzlab alohida loyihalarni **bitta Git omborxonasida** saqlab, kodlarni to'g'ridan-to'g'ri ulashish (Code Sharing) va hammasini bitta joydan boshqarish imkonini beradi. Google, Facebook kabi gigantlar o'zlarining butun kompaniya kodlarini bitta gigant Monorepo'da saqlashadi!

> [!NOTE]
> **Real-hayot analogiyasi: "Ko'p xonali uy va Umumiy oshxona"**  
> Agar har bir farzandingiz uchun alohida hovli qursangiz (Polyrepo), har bir hovliga alohida oshxona, alohida gaz, suv o'tkazishingiz kerak. Ular orasida masofa uzoq bo'ladi va narsalarni bo'lishish qiyinlashadi.  
> Lekin bitta katta uy qurib, har bir farzandga alohida xona bersangiz va o'rtada bitta katta **Umumiy Oshxona** (Shared Packages) qilsangiz — bu **Monorepo** bo'ladi. Har kim o'z xonasida yashaydi (Web App, Admin Panel), lekin hammalari bitta umumiy oshxonadan (UI Components, Utils) kelib foydalanaveradi. Bu ham arzon, ham samarali!

```mermaid
graph TD
    Repo[Git Repository (Monorepo)] --> Apps[Apps (Dasturlar)]
    Repo --> Packages[Packages (Umumiy Kodlar)]
    
    Apps --> WebApp[Web Ilova (Vue/Nuxt)]
    Apps --> AdminPanel[Admin Panel (Vue)]
    Apps --> MobileApp[Mobile (React Native)]
    
    Packages --> UI[UI Components (Button, Modal)]
    Packages --> Core[Biznes Mantiq (API, Helpers)]
    Packages --> Config[Sozlamalar (ESLint, TS)]
    
    WebApp -. "Foydalanadi" .-> UI
    WebApp -. "Foydalanadi" .-> Core
    AdminPanel -. "Foydalanadi" .-> UI
    AdminPanel -. "Foydalanadi" .-> Core
    MobileApp -. "Foydalanadi" .-> Core
    
    style Repo fill:#e1bee7,stroke:#8e24aa
    style Apps fill:#bbdefb,stroke:#1976d2
    style Packages fill:#c8e6c9,stroke:#388e3c
```

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi loyihalar faqat bitta papka ichidagi bitta saytdan iborat bo'lmasligini, kattaroq proyektlarda `Monorepo` (Bitta Git omborxonasida ko'plab proyektlar yashashi) strukturasini bilishi kerak.

### 1. Monorepo o'zi qanday ko'rinadi?
Monorepolarda odatda 2 ta asosiy qism bo'ladi: `apps` (to'liq ishlovchi saytlar) va `packages` (shu saytlar ishlatadigan umumiy kod qismlari).

```text
my-monorepo/
├── apps/
│   ├── client-app/      # Mijozlar uchun veb-sayt (Vue 3)
│   └── admin-panel/     # Adminlar uchun sayt (Vue 3)
│
├── packages/
│   ├── shared-ui/       # Hamma sayt uchun umumiy UI-Kit (Button, Input)
│   └── shared-utils/    # Pul hisoblash, sanani to'g'rilash funksiyalari
│
└── package.json         # Barcha loyihalar uchun yagona boshqaruv fayli
```

### 2. Polyrepo (Ko'p repoli) strukturadan farqi
Agar bularni Polyrepo'da qilsak, bizda 4 ta alohida Git repositoriya va 4 marta `npm install` qilinishi kerak bo'lardi. Shared UI'ni yangilasak, har bir saytga borib yangi versiyani o'rnatib chiqishimiz kerak bo'ladi. Monorepoda esa hamma narsa ulangan — bitta o'zgarish shu zahoti barcha loyihalarda aks etadi.

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi Monoreponi qanday o'rnatishni (masalan `Turborepo` va `pnpm workspaces` yordamida) va qaramliklarni to'g'ri boshqarishni biladi.

### 1. Pnpm Workspaces
Monorepolarda eng ko'p ishlatiladigan package manager bu **pnpm** dir. Sababi `npm` va `yarn` dan ko'ra ancha tezroq ishlaydi va kompyuter xotirasini tejaydi. Pnpm `pnpm-workspace.yaml` fayli orqali qaysi papkalar Workspace ekanligini bilib oladi:

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```
Shu fayl orqali `apps/client-app` loyihasi o'zining `package.json` faylida to'g'ridan-to'g'ri `packages/shared-ui` ni chaqirib olishi mumkin:
```json
"dependencies": {
  "@my-project/shared-ui": "workspace:*" 
}
```

### 2. Turborepo (Vercel)
Bir nechta saytlarni bir vaqtda ishga tushirish (dev server) yoki build qilish (qurish) juda qiyinlashib ketishi mumkin. Shu joyda Turborepo ishga tushadi. U aqlli keshlashtirish (Caching) orqali faqat o'zgartirilgan loyihagagina ta'sir o'tkazadi va vaqtni 10 barobargacha tejaydi.

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"], // Oldin qaram (package) loyihalar build qilinadi
      "outputs": ["dist/**", ".output/**"] // Shu papkalarni turborepo keshlab qoladi
    },
    "dev": {
      "cache": false, // dev vaqtida kesh kerakmas
      "persistent": true
    }
  }
}
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi yirik Monorepolarda arxitektura qoidalarini (Dependency Rule), CI/CD qanday ishlashini va Micro-frontend imkoniyatlarini tushunadi.

### 1. Arxitektura va Qaramlik (Dependency Direction)
Monorepoda eng katta xato — Spaghetti Dependencies (Bir-biriga chigallashgan qaramliklar) yaratishdir. 
**Oltin Qoida:** Qaramlik faqatyuqoridan pastga harakatlanishi kerak!
- ✅ **To'g'ri:** `apps` qatlami `packages` ni import qiladi.
- ❌ **Xato:** `packages` qatlami `apps` qatlamidan nimadir import qiladi. (Circular dependency)
- ❌ **Xato:** Ikkita `apps` qatlamidagi sayt (Admin va Client) bir-biridan import qiladi (ular o'rtada API yoki `packages` orqali muloqot qilishi shart).

### 2. Katta Monorepolarda CI/CD
Agar sizda 10 ta ilova (app) bo'lsa va siz ulardan faqat bittasiga (masalan Admin Panelga) o'zgarish kiritsangiz, hamma 10 ta saytni qaytadan qurib (build), hammasini qayta serverga yuklash — pul va vaqt isrofidir.  
**Affected Builds:** Turborepo va Nx kabi vositalar orqali CI/CD dagi Github Actions faqat o'zgargan va o'zgarish ta'sir qilgan fayllarnigina build qilishini ta'minlash kerak.

```bash
# Faqat o'zgargan paketlarni va unga qaram bo'lgan ilovalarnigina build qilish:
npx turbo run build --filter="...[origin/main]"
```

### Intervyu Savoli
**"Bizda bitta katta Monorepo bor. Loyihaga yangi kelgan Junior dev `shared-ui` paketidagi BaseButton komponentining dizaynini o'zgartirdi (bu button Admin panelda ham ishlatiladi). Lekin u o'zgarishni faqat Client saytida tekshirdi. Qanday qilib arxitektura orqali Admin panel ham buzilmasligini kafolatlashimiz mumkin?"**
*Javob:*
Birinchidan, har bir shared UI komponentlari uchun Storybook o'rnatishimiz kerak, shunda u yakkalangan holatda (isolated) test qilinadi. Ikkinchidan, Monorepoda **Affected Testing** (Ta'sirlangan testlar) qoidasini yozishimiz shart. Ya'ni CI/CD da kimdir `shared-ui` ni o'zgartirsa, Github Actions avtomatik ravishda nafaqat `shared-ui` ning o'zini, balki shu `shared-ui` ga bog'langan barcha `apps` lar (Client ham, Admin ham) testlarini yuritishi (run) kerak. Agar Admin panel buzilgan bo'lsa, PR (Pull Request) avtomatik rad etiladi.  

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Turborepo yoki Nx ishlating:** Lerna eskirgan. Hozirgi kunda keshlashtirish qobiliyatiga ega (faqat o'zgargan fayllarnigina build qiladigan) **Turborepo** (Vercel) yoki **Nx** ishlating. Bu loyiha build bo'lishi uchun soatlab vaqt ketishini oldini oladi.
2. **Qaramliklarni tartibga soling (Dependency Graph):** `apps` papkasi ichidagi loyihalar (Web, Mobile) `packages` (UI, Utils) dagi kodlarni import qilishi mumkin. Lekin hech qachon `packages` ichidagi kod boshqa `apps` dan import qilmasligi shart (Circular Dependency va Tightly Coupled bo'lib qoladi).
3. **Pnpm Workspaces:** NPM yoki Yarn o'rniga aynan **pnpm** dan foydalaning. PNPM fayllarni har bir loyihaga nusxalamasdan, bitta joydan link (symlink) qiladi, bu kompyuter xotirasini tejaydi va "node_modules" hajmini keskin kamaytiradi.

---

## Xulosa

| Arxitektura Turi | Afzalligi | Kamchiligi |
| --- | --- | --- |
| **Polyrepo (Multi-repo)** | Har bir dastur alohida yashaydi, CI/CD juda tez bo'ladi, xato qilsangiz faqat o'sha loyiha buziladi. | Kodni boshqa loyihalarga ulashish deyarli imkonsiz, versiyalarni boshqarish qiyin. |
| **Monorepo (Bitta repo)** | Bir marta yozilgan kod (masalan Button) hamma loyihalarga birdaniga ta'sir qiladi, refactoring juda oson. | Repozitoriya hajmi katta bo'lib ketadi, CI/CD konfiguratsiyasi ancha murakkab. |
