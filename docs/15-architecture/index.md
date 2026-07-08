# Frontend Architecture - Chuqur O'rganish

## Kirish

Frontend Architecture - bu loyihaning barqaror, kengaytiriladigan va samarali bo'lishi uchun zarur bo'lgan tuzilma, prinsiplar va qarorlar to'plami. Yaxshi arxitektura faqat kod yozish emas, balki loyihaning butun hayot sikli davomida qanday rivojlanishini oldindan ko'ra bilishdir.

## Ushbu Bo'lim Tarkibi

| # | Mavzu | Tavsif |
|---|-------|--------|
| 01 | [Scalability](./01-scalability.md) | Loyihani kengaytirish strategiyalari va pattern'lar |
| 02 | [Reusability](./02-reusability.md) | Kodni qayta ishlatish prinsiplari va texnikalari |
| 03 | [Maintainability](./03-maintainability.md) | Kodni qo'llab-quvvatlash osonligi |
| 04 | [Component Structure](./04-component-structure.md) | Komponentlar arxitekturasi va organizatsiyasi |
| 05 | [Folder Structure](./05-folder-structure.md) | Loyiha tuzilmasi va fayl organizatsiyasi |
| 06 | [Design Patterns](./06-design-patterns.md) | Frontend design pattern'lar va ularni qo'llash |
| 07 | [Monorepo](./07-monorepo.md) | Mono-repository arxitekturasi va boshqaruvi |

## Architecture Falsafasi

### 1. Arxitektura Piramidasi
```
                    ▲
                   /│\
                  / │ \
                 /  │  \    Business Logic
                /   │   \   (Domain Layer)
               /────┼────\
              /     │     \
             /      │      \   Application Logic
            /       │       \  (Use Cases)
           /────────┼────────\
          /         │         \
         /          │          \   Infrastructure
        /           │           \  (UI, API, DB)
       ▼────────────┴────────────▼
```

### 2. Yaxshi Arxitektura Belgilari

| Xususiyat | Ta'rif | O'lchov |
|-----------|--------|---------|
| **Scalability** | Loyiha o'sishi bilan murakkablik chiziqli o'smaydi | O(n) vs O(n²) |
| **Testability** | Har bir qism mustaqil test qilinadi | Coverage % |
| **Maintainability** | Kod tushunarligi va o'zgartirish osonligi | Time to fix |
| **Flexibility** | Yangi talablarga moslashish qobiliyati | Change cost |
| **Performance** | Tezlik va resurs samaradorligi | Core Web Vitals |

### 3. Arxitektura Evolyutsiyasi
```
Boshlang'ich                    O'rta                         Katta
Loyiha                          Loyiha                        Loyiha
─────────────────────────────────────────────────────────────────────►

Single File          Feature-based              Domain-Driven
Components           Modules                    Architecture
     │                    │                          │
     ▼                    ▼                          ▼
Flat Structure       Layered                    Micro-frontends
(simple)             Architecture               (distributed)
     │                    │                          │
     ▼                    ▼                          ▼
Local State          Centralized                Event-Driven
                     State                      Communication
```

## Arxitektura Qaror Matritsasi

| Vaziyat | Kichik Loyiha | O'rta Loyiha | Katta Loyiha |
|---------|---------------|--------------|--------------|
| **Komponenter** | Flat structure | Feature folders | Domain modules |
| **State** | Local/Context | Pinia/Vuex | Distributed stores |
| **Routing** | File-based | Modular routes | Micro-frontend routing |
| **Testing** | Unit tests | Integration tests | E2E + Contract tests |
| **Build** | Single bundle | Code splitting | Module federation |
| **Team** | 1-3 dev | 3-10 dev | 10+ dev, multiple teams |

## SOLID Prinsiplari Frontend'da

### Single Responsibility Principle (SRP)
```javascript
// YOMON - Bir komponent juda ko'p vazifani bajaradi
const UserDashboard = {
  // Fetch, render, format, validation - hammasi bir joyda
}

// YAXSHI - Har bir komponent bitta vazifaga javobgar
const UserProfile = { /* faqat profil render */ }
const UserStats = { /* faqat statistika render */ }
const useUserData = () => { /* faqat data fetching */ }
```

### Open/Closed Principle (OCP)
```javascript
// YOMON - Yangi type qo'shish uchun komponentni o'zgartirish kerak
const Button = ({ type }) => {
  if (type === 'primary') return <PrimaryButton />
  if (type === 'secondary') return <SecondaryButton />
  // Har safar yangi type qo'shilsa o'zgartirish kerak
}

// YAXSHI - Kengaytirish uchun ochiq, o'zgartirish uchun yopiq
const Button = ({ variant: Variant = DefaultButton, ...props }) => {
  return <Variant {...props} />
}
```

## Dependency Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Views     │  │  Composables │  │  Store (State)         │  │
│  │   (UI)      │──│  (Logic)     │──│  (Data)                │  │
│  │             │  │              │  │                         │  │
│  │  Components │  │  useAuth()   │  │  Pinia/Vuex            │  │
│  │  Pages      │  │  useApi()    │  │  Actions/Mutations     │  │
│  │  Layouts    │  │  useForm()   │  │  Getters               │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                │                     │                 │
│         ▼                ▼                     ▼                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Services Layer                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │  │
│  │  │  API Client │  │  Validators │  │  Transformers   │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                     External Dependencies                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Backend    │  │  3rd Party  │  │  Browser APIs           │  │
│  │  API        │  │  Services   │  │  (Storage, Network)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Senior Developer Uchun Muhim Mavzular

1. **Architecture Decision Records (ADR)** - Arxitektura qarorlarini hujjatlashtirish
2. **Technical Debt Management** - Texnik qarzni boshqarish strategiyalari
3. **Migration Strategies** - Eski arxitekturadan yangisiga o'tish
4. **Performance Budgets** - Arxitektura darajasidagi performance nazorat
5. **Security by Design** - Xavfsizlikni arxitektura darajasida o'ylash
6. **Observability** - Monitoring, logging, tracing arxitekturasi

## Anti-Patterns

| Anti-Pattern | Muammo | Yechim |
|--------------|--------|--------|
| **Big Ball of Mud** | Strukturasiz, o'zaro bog'liq kod | Modular arxitektura |
| **Spaghetti Code** | Mantiqiy oqim tushunarsiz | Clear separation of concerns |
| **God Component** | Bir komponent hamma narsani qiladi | Single Responsibility |
| **Copy-Paste Programming** | Kod takrorlanishi | DRY, abstractions |
| **Premature Optimization** | Kerak bo'lmagan murakkablik | YAGNI, profiling first |
| **Not Invented Here** | Barcha narsani o'zi yozish | Leverage existing solutions |

## O'rganish Yo'l Xaritasi

```
Asoslar                     Amaliyot                      Mutaxassislik
──────────────────────────────────────────────────────────────────────────►

SOLID Principles        Feature Modules              Micro-frontends
Clean Code              State Architecture           Module Federation
Component Design        API Design                   Event-Driven Arch
     │                       │                            │
     ▼                       ▼                            ▼
Folder Structure        Testing Strategy             Performance Tuning
Naming Conventions      CI/CD Integration            Security Hardening
Basic Patterns          Code Review                  Team Scaling
     │                       │                            │
     ▼                       ▼                            ▼
Git Workflow            Monorepo Setup               Architecture Docs
Code Organization       Build Optimization           ADR Writing
                        Dependency Management        Tech Radar
```

## Foydali Resurslar

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Patterns.dev - Modern Web App Design Patterns](https://patterns.dev/)
- [Vue.js Style Guide](https://vuejs.org/style-guide/)
- [Atomic Design - Brad Frost](https://atomicdesign.bradfrost.com/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

---

> **Eslatma:** Arxitektura qarorlari kontekstga bog'liq. "Eng yaxshi" arxitektura mavjud emas - faqat loyiha talablariga mos arxitektura bor.
