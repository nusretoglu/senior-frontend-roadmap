# Folder Structure - Loyiha Tuzilmasi va Fayl Organizatsiyasi

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> "Afsuski, barcha loyihalar papkalar betartibligidan (Spaghetti folder structure) o'ladi". Boshlang'ich loyihalarda hammani papkasi bir xil `components/`, `views/` va `utils/` bo'ladi. Lekin fayllar soni 100 tadan oshgach, kerakli komponentni yoki logikani topish uchun butun loyihani kovlab chiqishga to'g'ri keladi. Qaysi komponent qayerniki ekanligini tushunib bo'lmay qoladi. Yaxshi Arxitektura (masalan Feature-Driven Design) - fayllarni ma'nosiga qarab emas, ularning biznes mantiqiga (feature) qarab joylashtirishni talab qiladi.

> [!NOTE]
> **Real-hayot analogiyasi: "Kutubxona vs Kiyim javoni"**  
> Tasavvur qiling, uyingizda kiyim javoni bor (By Type strukturasi). Siz hamma shimlarni bir tortmaga, hamma ko'ylaklarni boshqa tortmaga shtoqasiz (`components/`, `views/`, `styles/`). Endi siz toqqa chiqmoqchisiz, sizga qishki kurtka, issiq shim va etik kerak. Siz uchta har xil tortmani ochib, yozgi kiyimlar orasidan qishkilarini qidirishingiz kerak.  
> Lekin agar siz kiyimlarni fasllarga yoki voqealarga qarab ajratsangiz (By Feature strukturasi) — "To'y uchun", "Qishki sport uchun", "Yozgi ta'til uchun" papkalari bo'ladi. Toqqa ketayotganda faqat bitta tortmani ochasiz va ichidan hamma kerakli narsa chiqadi! Folder structure ham huddi shunday — funksionallikka qarab bo'linishi kerak.

```mermaid
graph TD
    Project[Loyiha Kengayishi] --> ByType[Stage 1: By Type]
    Project --> ByFeature[Stage 2: By Feature]
    Project --> FSD[Stage 3: Feature-Sliced Design]
    
    ByType --> Components[components/]
    ByType --> Views[views/]
    ByType --> Utils[utils/]
    
    ByFeature --> Auth[features/auth/]
    ByFeature --> Product[features/product/]
    ByFeature --> Shared[shared/]
    
    FSD --> App[app/ (Eng yuqori)]
    FSD --> Pages[pages/]
    FSD --> Widgets[widgets/]
    FSD --> Features[features/]
    FSD --> Entities[entities/]
    FSD --> SharedLayer[shared/ (Eng quyi)]
    
    style Project fill:#e1bee7,stroke:#8e24aa
    style ByType fill:#ffcdd2,stroke:#d32f2f
    style ByFeature fill:#bbdefb,stroke:#1976d2
    style FSD fill:#c8e6c9,stroke:#388e3c
```

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi standart "By Type" (turi bo'yicha) arxitekturani tushunishi kerak.

### 1. By Type Arxitekturasi (Kichik Loyihalar)
Kichik loyihalarda fayllarni nima ish qilishiga (Type) qarab bo'lish eng oson yo'l.

```
src/
├── assets/          # Rasmlar, fontlar, CSS
├── components/      # Barcha qayta ishlatiluvchi UI komponentlar
├── composables/     # Vue 3 hooks (Logika)
├── router/          # Vue-router sozlamalari
├── stores/          # Pinia / Vuex state
├── utils/           # Sof Javascript funksiyalar (formatters, parsers)
├── views/           # Sahifalar (Pages)
└── App.vue
```

### 2. Nomlash standartlari
Papkalarni nomi doim `kebab-case` bo'lishi kerak. Komponentlar fayl nomi esa `PascalCase` (masalan, `UserProfile.vue`).

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi "By Feature" (Modulli) yondashuvni, Colocation prinsipini va Path Aliases ni tushunadi.

### 1. By Feature Arxitekturasi (Katta Loyihalar)
Loyiha kattalashganda `components/` ichida 100 ta fayl bo'lib ketadi. Biz ularni vazifasiga (Feature) qarab bitta papkaga yig'amiz. Bunga **Colocation** (birgalikda joylashtirish) deyiladi.

```
src/
├── features/
│   ├── Auth/                # Avtorizatsiya bilan bog'liq HAMMA narsa
│   │   ├── components/      # (Login.vue, Register.vue)
│   │   ├── composables/     # (useAuth.js)
│   │   └── api.js           # Auth so'rovlari
│   │
│   └── UserProfile/         # Profil bilan bog'liq HAMMA narsa
│       ├── components/
│       └── store.js
│
├── shared/                  # Barcha Feature'lar ishlatadigan umumiy narsalar
│   ├── components/          # (BaseButton, BaseInput)
│   └── utils/               # (dateFormatter)
│
└── views/                   # Sahifalar (Featurelarni birlashtiradi)
```

### 2. Path Aliases (Yol qisqartmalari)
Chuqur papkalardagi fayllarni chaqirish uchun uzun nuqtalardan qoching:
```javascript
// YOMON
import BaseButton from '../../../../shared/components/BaseButton.vue'

// YAXSHI (vite.config.js da @ = src/ qilib o'rnatilgan)
import BaseButton from '@/shared/components/BaseButton.vue'
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi yirik Enterprise loyihalar uchun FSD (Feature-Sliced Design), Domain-Driven Design (DDD) kabi murakkab strukturalarni joriy qila oladi va Index.js (Barrel pattern) orqali fayllarni kapsulatsiyalaydi.

### 1. Kapsulatsiya (Barrel Exports)
Har bir Feature (Masalan `Auth/`) ichidagi fayllarni istalgan odam to'g'ridan-to'g'ri chaqirib ketaversa tartibsizlik boshlanadi. Har bir Feature o'zini qutidek (Blackbox) tutishi kerak.

```javascript
// features/Auth/index.js (Public API of the feature)
export { default as LoginForm } from './components/LoginForm.vue'
export { useAuth } from './composables/useAuth'

// QOLGAN fayllarni eksport QILMAYMIZ (ular faqat Auth ichida ishlaydi)
```
Va endi boshqa joydan shunday chaqiramiz:
```javascript
import { LoginForm, useAuth } from '@/features/Auth'
```

### 2. Feature-Sliced Design (FSD)
Bu hozirda frontend olamidagi eng mukammal arxitekturalardan biri. U qat'iy qoidalarga ega (Layers):
1. **app:** Global sozlamalar, providerlar.
2. **pages:** Sahifalar (faqat widget va feature'larni o'zida yig'adi).
3. **widgets:** Mustaqil va to'liq ishlaydigan UI bloklar (masalan `Header`).
4. **features:** Biznes qiymatga ega bo'lgan foydalanuvchi harakatlari (Masalan, `LikeTugmasi`, `AddToCart`).
5. **entities:** Biznes obyektlar (User, Product, Order).
6. **shared:** Butun loyiha uchun umumiy qismlar (UI-kit, API client).

**Eng muhim FSD qoidasi:** Quyi qatlamlar o'zidan yuqoridagi qatlam haqida bilmasligi kerak. (Ya'ni `shared` papkasi `features` dan hech narsa import qilolmaydi!)

### Intervyu Savoli
**"Aytaylik loyihamizda 'Mahsulotlar' va 'Foydalanuvchilar' ro'yxati bor. Agar User komponenti ichida Product ro'yxati kerak bo'lib qolsa (yoki aksincha), ularni Circular Dependency (bir-biriga qaramlik) qilmasdan FSD arxitekturasida qanday yechasiz?"**
*Javob:*
FSD da bir xil qatlamdagi modullar (slice'lar) bir-birini import qilishi mumkin emas (Ya'ni `features/user` `features/product` dan to'g'ridan to'g'ri ma'lumot ololmaydi). Buni yechish uchun biz ko'prik vazifasini o'tovchi yuqoriroq qatlamdan (masalan **Widgets** yoki **Pages**) foydalanamiz. Yoki ikkalasiga ham tegishli bo'lgan datani bitta pastdagi **Entities** qatlamiga tushiramiz, va u yerdan import qilamiz. Asosiy maqsad qatlamlar o'rtasidagi ma'lumotlar oqimini bir tomonlama (tepadan pastga) ushlab turishdir.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **"By Feature" (Funksiya bo'yicha) joylashtiring:** Komponentlarni, utils'larni va state'larni tiplari (type) bo'yicha emas, balki mantiqiy funksiyasi bo'yicha bitta papkaga (Masalan `features/UserProfile/`) jamlang (Colocation). Bu papkani ichida o'zining kichik `components/`, `utils/`, `api.ts` fayllari bo'lsin.
2. **Absolute Imports (Aliasing) ishlating:** `../../../../../utils/date.js` kabi uzun va xunuk yo'llardan voz keching. Tsconfig yoki Vite configs orqali `@/` aliasini sozlang va hamma joyda `@/features/UserProfile/api` shaklida ishlating.
3. **Index.ts fayllardan foydalaning (Barrel export):** Papka ichidagi hamma narsani to'g'ridan-to'g'ri chaqiravermaslik uchun, har bir `feature/` papkasi ichida faqat ruxsat berilgan fayllarnigina ommaga eksport qiluvchi `index.ts` (public API) yarating. Shunda boshqa komponentlar bu papkaning ichki sirlarini bila olmaydi (Encapsulation).

---

## Xulosa

| Yondashuv | Tavsifi | Afzalligi va Kamchiligi |
| --- | --- | --- |
| **By Type (Turi bo'yicha)** | Barcha UI'lar `components`da, mantiqlar `utils`da, hooklar `composables`da saqlanadi. | Kichik loyihalar uchun zo'r, lekin loyiha kattalashganda navigatsiya qilish azobga aylanadi. |
| **By Feature (Vazifasi bo'yicha)** | Bitta vazifani bajaradigan barcha fayllar bitta papkada (`Auth`, `Payment`). | Qidirish oson, bir qismni o'zgartirish boshqa qismni buzmaydi. |
| **FSD (Feature-Sliced Design)** | Standartlashtirilgan ruscha-arxitektura (`app`, `pages`, `widgets`, `features`, `entities`, `shared`). | Yirik jamoalar uchun juda qat'iy va mukammal standart, lekin o'rganish juda qiyin (Steep curve). |
| **Monorepo (Turborepo, Nx)** | Bitta repozitoriy ichida bir nechta mustaqil dasturlar (Web, Admin, Mobile) saqlanadi. | Shared kodlarni oson ulashish, lekin CI/CD konfiguratsiyasi juda og'ir. |
