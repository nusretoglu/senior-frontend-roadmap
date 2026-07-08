# Code Review - Professional Kod Ko'rib Chiqish

## Kirish

Code review - bu jamoa a'zolari tomonidan yozilgan kodni ko'rib chiqish jarayoni. Bu faqat xatolarni topish emas - bu **bilim almashish, standartlarni saqlash va jamoa sifatini oshirish** vositasi.

## Nega Code Review Muhim?

### 1. Sifat Nazorati
```javascript
// Review'siz merge qilingan kod
function getUser(id) {
  return fetch('/api/user/' + id)  // SQL Injection xavfi!
}

// Review orqali aniqlangan va tuzatilgan
function getUser(id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Invalid user ID')
  }
  return fetch(`/api/user/${encodeURIComponent(id)}`)
}
```

### 2. Bilim Almashish
- Junior'lar senior'lardan o'rganadi
- Har kim codebase'ning turli qismlarini tushunadi
- "Bus factor" kamayadi (bitta odam ketsa loyiha to'xtamaydi)

### 3. Consistency
- Yagona kod uslubi
- Arxitektura qarorlariga rioya
- Naming conventions

### 4. Xavfsizlik
- Security vulnerabilities
- Data leakage
- Authentication bypass

## Code Review Turlari

### 1. PR Review (Pull Request)
```
Feature branch → PR → Review → Approve → Merge → Main
```

**Eng keng tarqalgan.** GitHub, GitLab, Bitbucket orqali.

### 2. Pair Programming
```
Driver (kod yozadi) + Navigator (ko'rib turadi)
```

**Real-time review.** Murakkab masalalar uchun yaxshi.

### 3. Over-the-Shoulder
```
"Hey, bu kodga bir qarab ber"
```

**Informal review.** Tez feedback uchun.

### 4. Mob Programming
```
Butun jamoa bitta ekran oldida
```

**Juda murakkab masalalar yoki o'rganish uchun.**

---

## Samarali Review Berish

### Yondashuv: "Nima uchun" ni Tushuntiring

```diff
# Yomon comment
- "Bu noto'g'ri"
- "O'zgartir"
- "???"

# Yaxshi comment
+ "Bu yerda `null` kelishi mumkin. `?.` operatori qo'shsak,
+  xavfsizroq bo'ladi. Masalan: `user?.profile?.avatar`"
```

### Review Kategoriyalari

#### 1. Blocker (MUST)
```javascript
// BLOCKER: Security vulnerability
// SQL Injection xavfi. Parametrized query ishlatish kerak.
const query = `SELECT * FROM users WHERE id = ${userId}`
```

**Merge QILINMASLIGI kerak. Albatta tuzatilishi shart.**

#### 2. Suggestion (SHOULD)
```javascript
// SUGGESTION: Performance optimization
// filter().map() o'rniga reduce() ishlatsa,
// array'ni 1 marta iterate qiladi
const result = items
  .filter(x => x.active)
  .map(x => x.name)
```

**Yaxshiroq variant bor, lekin kritik emas.**

#### 3. Nitpick (COULD)
```javascript
// NITPICK: Naming
// `data` juda umumiy. `userProfiles` aniqroq bo'lardi
const data = await fetchProfiles()
```

**Minor improvement. Blocking emas.**

#### 4. Question (?)
```javascript
// QUESTION: Bu yerda caching kerak emasmi?
// Har safar API call qilish expensive bo'lishi mumkin
async function getSettings() {
  return await api.get('/settings')
}
```

**Tushunish uchun savol. Balki muallif biladi, balki yo'q.**

#### 5. Praise (++)
```javascript
// ++: Juda yaxshi abstraction!
// Bu helper boshqa joylarda ham foydali bo'ladi
function formatCurrency(amount, locale = 'uz-UZ') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'UZS'
  }).format(amount)
}
```

**Ijobiy feedback ham muhim!**

---

## Review Checklist

### Functionality
- [ ] Kod kutilgan natijani beradimi?
- [ ] Edge case'lar handle qilinganmi?
- [ ] Error handling mavjudmi?

### Security
- [ ] Input validation bormi?
- [ ] SQL/XSS/CSRF himoyasi?
- [ ] Sensitive ma'lumotlar log qilinmayaptimi?

### Performance
- [ ] N+1 query yo'qmi?
- [ ] Katta ma'lumotlar pagination bilan?
- [ ] Memory leak xavfi yo'qmi?

### Maintainability
- [ ] Kod o'qilishi osonmi?
- [ ] Naming aniqmi?
- [ ] DRY prinsipi saqlanganmi?
- [ ] Testlar yozilganmi?

### Consistency
- [ ] Kod style guide'ga mosmi?
- [ ] Existing patterns'ga muvofiqmi?

---

## Real-World Misollar

### Misol 1: API Error Handling

```javascript
// PR: User profile update
async function updateProfile(userId, data) {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
  return response.json()
}
```

**Review:**
```markdown
## Review Comments

### [BLOCKER] Error handling yo'q

Network error yoki 4xx/5xx response bo'lsa, bu kod xato bermaydi:

```javascript
async function updateProfile(userId, data) {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(response.status, error.message || 'Update failed')
  }

  return response.json()
}
```

### [SUGGESTION] Input validation

`data` ichida nima borligini tekshirish kerak:
- Bo'sh object?
- Ruxsat etilmagan fieldlar?
- Field uzunligi?

### [NITPICK] Content-Type header

`headers: { 'Content-Type': 'application/json' }` qo'shish kerak.
```

### Misol 2: Vue Component

```vue
<!-- PR: UserCard component -->
<template>
  <div class="card">
    <img :src="user.avatar" />
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
    <button @click="deleteUser">Delete</button>
  </div>
</template>

<script setup>
const props = defineProps(['user'])

async function deleteUser() {
  await fetch(`/api/users/${props.user.id}`, { method: 'DELETE' })
  location.reload()
}
</script>
```

**Review:**
```markdown
## Review Comments

### [BLOCKER] Confirmation yo'q

Delete tugmasini bosishda hech qanday tasdiqlash yo'q.
Foydalanuvchi tasodifan bossa ham delete bo'ladi.

```javascript
async function deleteUser() {
  const confirmed = await confirm('Haqiqatan o'chirmoqchimisiz?')
  if (!confirmed) return

  try {
    await fetch(`/api/users/${props.user.id}`, { method: 'DELETE' })
    emit('deleted', props.user.id)
  } catch (error) {
    toast.error('O\'chirishda xato yuz berdi')
  }
}
```

### [BLOCKER] location.reload() antipattern

`location.reload()` juda yomon UX:
- Butun sahifa qayta yuklanadi
- State yo'qoladi
- Sekin ishlaydi

Event emit qilib, parent component'da state'ni yangilang.

### [SUGGESTION] Props validation

```javascript
const props = defineProps({
  user: {
    type: Object,
    required: true,
    validator: (u) => u.id && u.name && u.email
  }
})
```

### [SUGGESTION] Accessibility

- `img` ga `alt` kerak
- Button'ga `aria-label` kerak
- Keyboard navigation?

### [++] Struktura yaxshi

Component kichik va focused. Single responsibility saqlanayapti.
```

### Misol 3: State Management

```javascript
// PR: Cart store (Pinia)
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    total: 0
  }),

  actions: {
    addItem(product) {
      this.items.push(product)
      this.total += product.price
    },

    removeItem(productId) {
      const index = this.items.findIndex(i => i.id === productId)
      this.total -= this.items[index].price
      this.items.splice(index, 1)
    }
  }
})
```

**Review:**
```markdown
## Review Comments

### [BLOCKER] Race condition va xato hisoblash

`total` alohida saqlanishi xavfli. Agar `items` o'zgarsa lekin
`total` yangilanmasa, inconsistent state bo'ladi.

```javascript
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),

  getters: {
    // total COMPUTED bo'lishi kerak
    total: (state) => state.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    )
  },

  actions: {
    addItem(product) {
      const existing = this.items.find(i => i.id === product.id)
      if (existing) {
        existing.quantity++
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
    },

    removeItem(productId) {
      const index = this.items.findIndex(i => i.id === productId)
      if (index === -1) {
        console.warn(`Product ${productId} not found in cart`)
        return
      }
      this.items.splice(index, 1)
    }
  }
})
```

### [BLOCKER] `removeItem` da xato

Agar `productId` topilmasa, `index = -1` bo'ladi.
`this.items[-1]` undefined qaytaradi va `.price` ga murojaat xato beradi.

### [SUGGESTION] Persistence

Cart ma'lumotlari localStorage'da saqlanishi kerakmi?
Sahifa refresh bo'lsa, cart yo'qoladi.

### [QUESTION] Quantity

Bir xil mahsulotni ikki marta qo'shsak nima bo'ladi?
Duplicate item yoki quantity increment?
```

---

## Review Qabul Qilish

### To'g'ri Yondashuv

```
DON'T:
- "Bu mening kodim, sen tushunmayapsan"
- "Vaqtim yo'q, shu ishlaydi"
- Comment'larni e'tiborsiz qoldirish

DO:
- "Tushundim, rahmat. Tuzataman"
- "Bu yerda shunday qildim chunki... Sizning variantingiz ham yaxshi"
- "Savol: bu case'da ham shunday qilishim kerakmi?"
```

### Javob Berish Namunasi

```markdown
> **Reviewer:** Bu yerda memoization kerak. Har renderda
> heavy calculation qayta ishlaydi.

**Author:** Rahmat! `useMemo` qo'shdim:

```javascript
const sortedItems = useMemo(() => {
  return items.slice().sort((a, b) => a.name.localeCompare(b.name))
}, [items])
```

E'tibor uchun rahmat, men bu haqda o'ylamagan edim.
```

### Rozi Bo'lmasangiz

```markdown
> **Reviewer:** Bu logic'ni alohida utility function'ga chiqarish kerak.

**Author:** Tushundim, lekin bu logic faqat shu componentda ishlatiladi
va boshqa joyda kerak emas. Agar kelajakda boshqa joyda ham kerak bo'lsa,
o'shanda refactor qilsak bo'ladimi?

Alternative: Agar siz qat'iy talab qilsangiz, albatta chiqaraman.
```

---

## Do's and Don'ts

### DO's (Qiling)

```diff
+ Konstruktiv bo'ling
  "Bu o'rniga X qilsak yaxshiroq, chunki Y sababi bor"

+ Savollar bering
  "Bu yerda caching qilish haqida o'yladingizmi?"

+ Yaxshi narsalarni ham ayting
  "Bu abstraction juda yaxshi chiqibdi!"

+ Tezkor bo'ling
  PR ochilgandan 24 soat ichida review qiling

+ Kichik PR'larni rag'batlantiring
  500+ qatorli PR review qilish qiyin

+ Link bering
  "Bu pattern haqida batafsil: [link]"
```

### DON'Ts (Qilmang)

```diff
- Shaxsiy tanqid
  "Sen nima qilyapsan?" ❌
  "Bu kod xavfsiz emas" ✓

- Vague feedback
  "Bu yomon" ❌
  "Bu error handling yo'qligi sababli xavfli" ✓

- Bikeshading
  Muhim muammolarni qoldirib, tab vs space haqida bahslashmang

- Gatekeeper bo'lish
  Review'ni o'z kuchingizni ko'rsatish uchun ishlatmang

- Uzoq kutish
  1 hafta review kutgan PR = demotivated developer

- Ego
  "Men shunday qilardim" = yaxshi sabab emas
```

---

## Review Tezligi va Sifati

### Maqsadli Metrikalar

| Metrika | Maqsad | Kritik |
|---------|--------|--------|
| Review boshlanishi | 4 soat | 24 soat |
| Birinchi feedback | 1 kun | 2 kun |
| Merge ready | 2 kun | 1 hafta |
| Review o'lchami | 200-400 qator | 500+ qator |

### Katta PR'lar Bilan Ishlash

```
1000+ qatorli PR keldi. Nima qilasiz?

1. APPROVE qilmang
   "Bu juda katta, mayda qismlarga bo'lib yuborish mumkinmi?"

2. Milestone review
   Dastlab arxitektura qarorlari
   Keyin detail implementation

3. Prioritetlashtiring
   Security → Logic → Performance → Style
```

---

## Review Tools va Automation

### Linting (Style Avtomatlashtiriladi)

```json
// .eslintrc.json
{
  "extends": ["@vue/typescript/recommended"],
  "rules": {
    "no-console": "error",
    "no-unused-vars": "error"
  }
}
```

**Style muammolarini mashina tekshirsin. Siz logic'ga fokuslan.**

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,vue}": ["eslint --fix", "prettier --write"]
  }
}
```

### CI/CD Checks

```yaml
# .github/workflows/pr-check.yml
name: PR Check
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run type-check
```

**Bu tekshiruvlar pass bo'lmasa, review boshlamang.**

---

## Senior Developer Mindset

### 1. Teacher, Not Gatekeeper

```
Junior yomonmi yozdi. Nima qilasiz?

WRONG: Block qilish va o'zingiz qayta yozish
RIGHT: Tushuntirish, resource berish, next time yaxshiroq yozishiga yordam
```

### 2. Context Matters

```
Startup'da: Tezlik muhim, perfect code emas
Enterprise'da: Stability muhim, tez merge emas
```

### 3. Pick Your Battles

```
100 ta comment yozishdan ko'ra,
3 ta muhim masalaga fokuslanish yaxshiroq
```

### 4. Trust but Verify

```
Senior developer PR yubordi.
Siz ham senior review qilasiz.

Ishonasiz, lekin tekshirasiz.
Senior ham xato qilishi mumkin.
```

### 5. Review O'zingizning Kodingizni

```
PR yaratishdan oldin o'zingiz ko'rib chiqing.
50% muammolarni o'zingiz topasiz.
Reviewer'ning vaqtini tejaysiz.
```

---

## Interview Savollari

### 1. "Qanday code review berarsiz?"

**Yaxshi javob:**
```
Men avval PR description'ni o'qiyman - nima muammo hal qilinayapti.
Keyin kodni yuqoridan pastga o'qiyman: arxitektura, keyin detail.

Comment'larni kategoriyalarga bo'laman:
- Blocker (security, critical bug)
- Suggestion (yaxshiroq variant)
- Question (tushunish uchun)

Muallif bilan dialog quraman, diktator bo'lmayman.
Yaxshi yechimlarni ham ta'kidlayman.
```

### 2. "Kod review'da kelishmovchilik bo'lsa nima qilasiz?"

**Yaxshi javob:**
```
1. Avval tushunishga harakat qilaman - nima uchun u shunday yozdi?
2. O'z pozitsiyamni dalillar bilan tushuntiraman
3. Trade-off'larni ochiq muhokama qilamiz
4. Agar hal bo'lmasa, uchinchi kishini jalb qilamiz
5. Eng muhimi - bu shaxsiy emas, kod haqida
```

### 3. "500+ qatorli PR kelsa nima qilasiz?"

**Yaxshi javob:**
```
Odatda bunday PR'ni approve qilmayman.

1. Muallif bilan gaplashaman - nima uchun katta?
2. Logical qismlarga bo'lish mumkinmi?
3. Agar bo'linmasa - milestone review:
   - Birinchi pass: arxitektura va security
   - Ikkinchi pass: implementation details
4. Kelajakda kichik PR'lar uchun team agreement
```

### 4. "Junior developer noto'g'ri yondashgan. Qanday feedback berasiz?"

**Yaxshi javob:**
```
Shaxsiy emas, kod haqida gaplashaman.
Nima uchun bu yondashuv muammoli - tushuntiraman.
Alternative ko'rsataman, faqat tanqid emas.
O'rganish resurslari beraman.
1-on-1 da verbal tushuntirsam yaxshiroq bo'ladi.
Maqsad - keyingi safar o'zi to'g'ri yozishi.
```

### 5. "Code review qancha vaqt olishi kerak?"

**Yaxshi javob:**
```
PR hajmiga bog'liq:
- 100 qator: 15-30 daqiqa
- 300 qator: 1 soat
- 500+ qator: bo'linishi kerak

Muhim faktorlar:
- Complexity of changes
- Risk level (security, data)
- Author experience

Rush qilish mumkin emas - review sifati muhim.
Lekin 2 kundan ortiq kutish ham yomon.
```

---

## Amaliy Mashqlar

### Mashq 1: Review Yozing

Quyidagi kodga review yozing:

```javascript
// User authentication
async function login(username, password) {
  const user = await db.query(
    `SELECT * FROM users WHERE username = '${username}'`
  )

  if (user && user.password === password) {
    return { success: true, token: Math.random().toString() }
  }

  return { success: false }
}
```

<details>
<summary>Javobni ko'rish</summary>

```markdown
### [BLOCKER] SQL Injection
`'${username}'` - bu SQL injection uchun ochiq.
Parametrized query kerak:
```javascript
const user = await db.query(
  'SELECT * FROM users WHERE username = ?',
  [username]
)
```

### [BLOCKER] Plain text password comparison
Parollar hash qilinishi kerak:
```javascript
const bcrypt = require('bcrypt')
const validPassword = await bcrypt.compare(password, user.passwordHash)
```

### [BLOCKER] Insecure token generation
`Math.random()` kriptografik xavfsiz emas:
```javascript
const crypto = require('crypto')
const token = crypto.randomBytes(32).toString('hex')
// Yoki JWT ishlatish
```

### [SUGGESTION] Rate limiting
Brute force attack'dan himoya kerak

### [SUGGESTION] Logging
Failed login attempts log qilinishi kerak
```
</details>

### Mashq 2: Review Javob Yozing

Sizning PR'ingizga bunday comment keldi:

> "Bu yondashuv noto'g'ri. Butunlay qayta yoz."

Qanday javob berasiz?

<details>
<summary>Javobni ko'rish</summary>

```markdown
Rahmat feedbackingiz uchun. Nima qismini qayta yozish kerakligini
aniqroq tushuntirsangiz bo'ladimi?

Men bu yondashuvni tanladim chunki:
1. [Sabab 1]
2. [Sabab 2]

Agar sizning yondashuvingiz boshqacha bo'lsa,
misolini ko'rsatsangiz, muhokama qilamiz.
```

**Eslatma:** Vague tanqidga vague javob bermang.
Konkret savol bering.
</details>

---

## Xulosa

Code review - bu:

1. **Sifat vositasi** - xatolarni topish
2. **O'rganish vositasi** - bilim almashish
3. **Kommunikatsiya vositasi** - jamoa birlikda ishlashi
4. **Madaniyat vositasi** - professional standartlar

> "Code review yoqmasa, yolg'iz ishlang.
> Jamoa bilan ishlasangiz - review majburiy."

---

**Keyingi:** [Mentoring](./02-mentoring.md)
