# Maintainability - Kodni Qo'llab-quvvatlash Osonligi

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchilar hayotida eng qo'rqinchli narsa — bu boshqa birov (yoki o'zining 6 oy oldingi) yozib ketgan tartibsiz, tushunarsiz kodga qo'shimcha qilishdir. Loyihalar doim o'sadi va o'zgaradi. Agar kod qoidalar va tartibga amal qilmasdan yozilgan bo'lsa, uni o'zgartirish (maintain) tobora qiyinlashib boradi. Oxir oqibat bir kichik xatoni tuzatish 5 ta yangi bug kelib chiqishiga sabab bo'ladi. Shu darajaga yetganda biznes to'xtab qoladi yoki loyiha noldan boshqatdan yoziladi (rewrite). Shuning uchun **Maintainable** kod yozish har qanday Senior dasturchi uchun birinchi raqamli qoida hisoblanadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Sartaroshxona asboblari va Shkaf"**  
> Tasavvur qiling siz sartaroshsiz va asboblaringizni (qaychi, mashinka, taroq) hammasini bitta qutiga aralashtirib tashlab qo'yasiz. Ishlayotganingizda kerakli qaychini topish uchun ancha vaqt ketadi (Maintainability juda yomon). Lekin agar asboblaringizni maxsus shkafga, har birini o'z tortmasiga chiroyli yorliqlar yopishtirib (Clean Code) tartiblasangiz, siz yoki sizning o'rningizda ishlaydigan boshqa sartarosh istalgan payt ko'zini yumib ham kerakli asbobni topa oladi. Kod ham xuddi shunday — kelajakdagi o'zingiz yoki jamoangiz uchun "o'qiladigan" shkaf bo'lishi kerak.

```mermaid
graph TD
    CleanCode[Clean Code] --> Readability[O'qilish osonligi]
    CleanCode --> Modularity[Modullilik]
    CleanCode --> Predictability[Bashorat qilinuvchanlik]
    
    Readability --> Naming[Tushunarli Nomlar]
    Readability --> Formatting[Bir xil Format (Prettier)]
    
    Modularity --> SRP[Single Responsibility]
    Modularity --> Composables[Mantiq ajratish]
    
    Predictability --> TypeScript[Tiplar (Types)]
    Predictability --> ErrorHandling[To'g'ri Xato boshqaruv]
    
    style CleanCode fill:#e8eaf6,stroke:#3f51b5
    style Readability fill:#c8e6c9,stroke:#388e3c
    style Modularity fill:#bbdefb,stroke:#1976d2
    style Predictability fill:#ffe0b2,stroke:#f57c00
```

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi kodni qanday qilib "O'qiladigan" qilishni (Readability), o'zgaruvchilar va funksiyalarga to'g'ri nom berishni o'rganishi kerak.

### 1. Meaningful Naming (Ma'noli Nomlar)
Eng keng tarqalgan xato bu kodni juda qisqa qilib (masalan `x`, `y`, `data`) atashdir.

```javascript
// ========================================
// YOMON: Tushunarsiz nomlar
// ========================================
function calc(d, r) {
  const t = d.filter(i => i.s === 'a')
  return t.reduce((a, c) => a + c.p * c.q, 0) * (1 - r)
}
const btnClkHndlr = () => {}

// ========================================
// YAXSHI: Aniq va izohli nomlar
// ========================================
function calculateDiscountedTotal(items, discountRate) {
  const activeItems = items.filter(item => item.status === 'active')
  const subtotal = activeItems.reduce((total, item) => total + item.price * item.quantity, 0)
  return subtotal * (1 - discountRate)
}
const handleButtonClick = () => {}
```

**Asosiy Qoidalar:**
- Boolean qiymatlar `is`, `has`, `should`, `can` bilan boshlansin: `isLoading`, `hasPermission`.
- Funksiyalar harakat bilan (Fe'l) boshlansin: `getUser`, `calculateTotal`, `sendData`.
- Massivlar ko'plikda (Plural) bo'lsin: `users`, `products`.

### 2. Comments (Izohlar)
Faqat murakkab logikani yoki NIMA UCHUN bunday qilinganini tushuntiradigan izohlar yozing. Kod nima qilayotganini tushuntiradigan izoh yozish — bu kodingizni o'qib tushunib bo'lmaydi degani.

```javascript
// YOMON: Kod shundoq ham tushunarli
// User ni databazadan ID orqali olish
const user = db.users.findById(userId)

// YAXSHI: "Nima uchun?" degan savolga javob
// Backend vaqtincha eski API'ni ishlatayotgani uchun, biz null yuborolmaymiz
const payload = { ...data, status: data.status || 'unknown' } 
```

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi uzun kodlarni modullarga ajratish (Modularity), Error Handling (Xatolarni ushlash) va Framework best-practices larni qo'llaydi.

### 1. Single Responsibility (Yakka Mas'uliyat)
Bir funksiya yoki bitta Vue komponenti faqat bitta vazifani bajarishi kerak.

```vue
<!-- YOMON: API call, Validation, UI hammasi bitta faylda -->
<script setup>
import { ref } from 'vue'

const email = ref('')
const error = ref('')

async function submit() {
  // Validation logika (SRP buzilgan)
  if(!email.value.includes('@')) {
    error.value = 'Xato email'
    return
  }
  
  // API logika (SRP buzilgan)
  try {
    const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email: email.value }) })
    // ...
  } catch (e) {
    error.value = e.message
  }
}
</script>

<!-- YAXSHI: Logika Composables orqali olib chiqilgan -->
<script setup>
import { useAuth } from '@/composables/useAuth'
const { email, error, submit } = useAuth()
</script>
```

### 2. Xatolarni to'g'ri ushlash (Error Handling)
Jimjitgina xatoni o'tkazib yuborish (Silent failure) Maintainability'ni o'ldiradi. Xato qayerda va nega chiqqani ochiq aytilishi kerak.

```javascript
// YOMON
async function fetchUser() {
  try {
    return await api.get('/user')
  } catch (e) {
    return null // Hech kim xatodan xabar topmaydi!
  }
}

// YAXSHI
async function fetchUser() {
  try {
    return await api.get('/user')
  } catch (error) {
    console.error(`[fetchUser] API xatosi:`, error.message)
    // Analytics/Sentry ga yozish
    toast.error('Foydalanuvchi ma\'lumotlari yuklanmadi')
    throw error // Chaquvchi (caller) xatoni bilishi kerak
  }
}
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi yirik jamoa va loyiha (Technical Debt, Code Reviews, Tooling) miqyosida Maintainability ni kafolatlaydi.

### 1. Technical Debt (Texnik Qarz) boshqaruvi
Tezroq ishga tushirish (Release) maqsadida ataylab qoldirilgan "iflos kod" (yoki keyin qilinadigan tozalash) bu Technical Debt dir. Agar qarz yig'ilib qolsa, bankrotlikka olib boradi.
- Har 3-4 sprintda 1 ta sprint faqat "Refactoring" (qarzni to'lash) ga ajratilishi kerak.
- Kodni o'zgartirganingizda uni avvalgidan ko'ra tozaroq qilib ketish qoidasiga (Boy Scout Rule) amal qilish kerak.

### 2. Automated Tooling (Avtomatlashtirilgan vositalar)
Odamlar xato qiluvchidir. Qoidalarni (Code Style) odam emas, linterlar kuzatishi kerak.
- **ESLint / Prettier:** Kodning bir xil formatda (indents, quotes) yozilishini ta'minlaydi.
- **TypeScript:** Katta loyihalarni qo'llab quvvatlash TypeScript (Tiplar) siz umuman imkonsiz! TS sizning kodingizni qaysi qismini o'zgartirsangiz qayerlar sinishini Compile vaqtida ko'rsatib turadi.
- **Husky & Lint-Staged:** Dasturchi xunuk kod yozsa u Git ga push qilishiga (commit) avtomatik tarzda to'sqinlik qiladi.

### Intervyu Savoli
**"Katta fayllarni qanday refactor (qismlarga ajratish va tozalash) qilasiz, va uni qilishda nimalarga e'tibor berasiz?"**
*Javob:*
Birinchi navbatda men kodning nima ish qilishini to'liq tushunib olaman (agar iloji bo'lsa qog'ozga chizib olaman). So'ngra, xavfsizlik tarmog'i bo'lishi uchun mavjud kodning kutilgan natijalarini Unit/E2E Test qilib olaman. Shundan so'ng incremental (bosqichma-bosqich) refactoringni boshlayman:
1. Sof (pure) yordamchi funksiyalarni olib chiqaman (utils).
2. UI komponentlarini mayda qismlarga bo'laman (masalan Modal, Button).
3. Vue logika va API zaproslarni Composable yoki Store larga olib chiqaman.
Har bir kichik o'zgarishdan so'ng dastur ishlayotganini tekshirib, Git commit qilib boraman.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Jamoada Linter va Formatterlarni majburiy qiling:** ESLint, Prettier, TypeScript strict mode va Husky kabi vositalarni majburiy ishlatish "Code Style" munozaralarini tugatib, barcha dasturchilarni bir xil sintaksisda yozishga o'rgatadi. Bu esa kodni o'qishni va tushunishni yengillashtiradi.
2. **Kichik funksiya va komponentlar yozing:** Hech qachon 500 qatorlik Vue yoki React komponenti yozmang. Agar bitta funksiya yoki komponent bittadan ortiq ish qilyotgan bo'lsa (Masalan API so'rov jo'natish, ma'lumotni tozalash va uni UI'da ko'rsatish) uni qismlarga bo'ling (Single Responsibility Principle).
3. **Nima o'rniga Nima uchun (Why instead of What):** Kommentariylar kod "nima" qilayotganini emas, nima uchun aynan shunday yo'l tutilganini (Business logic decisions) tushuntirishi kerak. "Bu yerda ro'yxatni filtrlayapmiz" deb emas, "Foydalanuvchi faol bo'lmagani uchun filtrlayapmiz, chunki talab shunday" deb yozing.

---

## Xulosa

| Kod Holati | Tushuntirish | Oqibati |
| --- | --- | --- |
| **Spaghetti Code** | Mantiqlar, UI va API so'rovlari bir-biriga qorishib ketgan uzun kod. | Kichik o'zgarish butun tizimni buzadi. Tushunish uchun soatlar ketadi. |
| **Clean Code** | Funksiya va o'zgaruvchilar nomi to'g'ri qo'yilgan, qoidalar asosida qismlarga bo'lingan kod. | Jamoa bilan ishlash osonlashadi, yangi xodimlar tezroq moslashadi. |
| **Over-engineered** | Juda mayda qismlarga bo'linib tashlangan yoki keraksiz abstraktsiyaga boy kod. | Sodda narsani ham qilish qiyinlashib ketadi, fayllar oralab sakrab yuriladi. |
| **Legacy Code** | Test yozilmagan, eskirib qolgan kod. | O'zgartirishga qo'rqiladi, "ishlayaptimi, tegma" rejimiga o'tiladi. |

Maintainable kod yozish bir kunda o'rganilmaydi, lekin intizom bilan asta-sekin shakllanadi. Kelajakdagi o'zingiz sizga rahmat aytishi uchun har doim kodni o'qishga qulay shaklda yozing.
