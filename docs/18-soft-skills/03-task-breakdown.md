# Task Breakdown - Katta Muammolarni Kichik Qismlarga Bo'lish

## Kirish

Task breakdown - bu katta, murakkab vazifalarni kichik, boshqariladigan qismlarga bo'lish san'ati. Bu ko'nikma **estimation, planning va delivery** uchun kritik muhim.

## Nega Task Breakdown Muhim?

### Muammo: "Big Bang" Approach

```
Task: "E-commerce sayt qilish"
Estimate: "3 oy"

↓

2 oy o'tdi, hech narsa tayyor emas.
"Deyarli tayyor" deyiladi, lekin aslida 50% ham emas.
```

### Yechim: Incremental Delivery

```
Task: "E-commerce sayt qilish"

Bo'lingan:
Week 1: Product listing page (Demo qilish mumkin)
Week 2: Product detail page (Demo qilish mumkin)
Week 3: Shopping cart (Demo qilish mumkin)
Week 4: Checkout flow (Demo qilish mumkin)
...

Har haftada working software.
Progress ko'rinadi.
Risk erta aniqlanadi.
```

---

## Task Breakdown Tamoyillari

### 1. INVEST Prinsipi (User Stories uchun)

```
I - Independent (Mustaqil)
    Boshqa story'ga bog'liq bo'lmasin

N - Negotiable (Muhokama qilinadigan)
    Detail'lar flexible

V - Valuable (Qimmatli)
    Foydalanuvchiga value beradi

E - Estimable (Baholanadigan)
    Qancha vaqt ketishini aytish mumkin

S - Small (Kichik)
    1 sprint'ga sig'adi

T - Testable (Test qilinadigan)
    Done criteria aniq
```

### 2. SMART Prinsipi (Har qanday task uchun)

```
S - Specific (Aniq)
    "Saytni yaxshilash" ❌
    "Login page'ga remember me qo'shish" ✅

M - Measurable (O'lchanadigan)
    "Tezroq qilish" ❌
    "API response < 200ms" ✅

A - Achievable (Amalga oshiriladigan)
    Real imkoniyatlarga mos

R - Relevant (Tegishli)
    Biznes maqsadga bog'liq

T - Time-bound (Muddatli)
    Aniq deadline
```

### 3. Vertical Slicing

```
YOMON (Horizontal):
Layer 1: Barcha UI
Layer 2: Barcha API
Layer 3: Barcha DB

Muammo: 3-layer tugamaguncha hech narsa ishlamaydi

YAXSHI (Vertical):
Slice 1: User registration (UI + API + DB)
Slice 2: User login (UI + API + DB)
Slice 3: User profile (UI + API + DB)

Har slice - working feature.
```

```
┌─────────────────────────────────────────┐
│              HORIZONTAL                  │
├─────────────────────────────────────────┤
│  UI    │  UI    │  UI    │  UI    │ UI  │
├─────────────────────────────────────────┤
│  API   │  API   │  API   │  API   │ API │
├─────────────────────────────────────────┤
│  DB    │  DB    │  DB    │  DB    │ DB  │
└─────────────────────────────────────────┘
        ❌ Hech narsa ishlamaydi 3 layer tugamaguncha

┌─────┬─────┬─────┬─────┬─────┐
│  F  │  F  │  F  │  F  │  F  │
│  e  │  e  │  e  │  e  │  e  │  VERTICAL
│  a  │  a  │  a  │  a  │  a  │
│  t  │  t  │  t  │  t  │  t  │
│  1  │  2  │  3  │  4  │  5  │
└─────┴─────┴─────┴─────┴─────┘
        ✅ Har feature mustaqil ishlaydi
```

---

## User Story Yozish

### Format

```
As a [role]
I want [feature]
So that [benefit]

Acceptance Criteria:
- Given [context]
- When [action]
- Then [result]
```

### Misol: E-commerce

```markdown
## User Story: Add to Cart

**As a** customer
**I want** to add products to my cart
**So that** I can purchase multiple items at once

### Acceptance Criteria:

1. **Given** I am on a product page
   **When** I click "Add to Cart"
   **Then** product is added to my cart

2. **Given** product is already in cart
   **When** I click "Add to Cart" again
   **Then** quantity increases by 1

3. **Given** product is out of stock
   **When** I view the product
   **Then** "Add to Cart" button is disabled

4. **Given** I am not logged in
   **When** I add to cart
   **Then** cart is saved in localStorage

### Technical Notes:
- Cart state: Pinia store
- API: POST /api/cart/items
- Optimistic UI update

### Estimate: 3 story points (1-2 days)
```

---

## Breakdown Texnikasi

### 1. Feature → Epic → Story → Task

```
FEATURE: User Authentication
│
├── EPIC: User Registration
│   ├── STORY: Email registration
│   │   ├── TASK: Registration form UI
│   │   ├── TASK: Form validation
│   │   ├── TASK: API integration
│   │   └── TASK: Email verification
│   │
│   └── STORY: Social registration
│       ├── TASK: Google OAuth
│       └── TASK: GitHub OAuth
│
├── EPIC: User Login
│   ├── STORY: Email login
│   └── STORY: Social login
│
└── EPIC: Password Management
    ├── STORY: Forgot password
    └── STORY: Change password
```

### 2. Complexity Indicators

Task'ni bo'lish kerak bo'lgan belgilar:

```diff
! "va" so'zi ko'p ishlatilgan
  "Login qilish VA registration VA password reset"
  → 3 ta alohida task

! Estimate 1 haftadan katta
  → Bo'lish kerak

! Bir nechta acceptance criteria
  → Har criteria alohida task bo'lishi mumkin

! Bir nechta odam kerak
  → Parallel tasks

! "Murakkab", "katta", "to'liq" so'zlari
  → Bo'lish kerak
```

### 3. Questions to Ask

```markdown
## Task ni bo'lish uchun savollar:

1. Bu task'ning eng kichik deliverable qismi nima?
2. Bu task'ni 2 soatda qilsa bo'ladimi?
3. Progress qanday o'lchanadi?
4. Dependency'lar bormi?
5. Parallel qilish mumkinmi?
6. Risk qayerda?
```

---

## Real-World Misollar

### Misol 1: Dashboard Feature

**YOMON BREAKDOWN:**
```
Task: Dashboard qilish
Estimate: 2 hafta
```

**YAXSHI BREAKDOWN:**
```markdown
## Epic: Analytics Dashboard

### Story 1: Dashboard Layout (2 points)
- Task: Page structure va routing
- Task: Responsive grid layout
- Task: Empty states

### Story 2: User Stats Widget (3 points)
- Task: API endpoint creation
- Task: Widget UI component
- Task: Data fetching va caching
- Task: Loading va error states

### Story 3: Sales Chart (3 points)
- Task: Chart library integration
- Task: Chart component
- Task: Date range filter
- Task: Export to PNG

### Story 4: Recent Orders Table (2 points)
- Task: Table component
- Task: Pagination
- Task: Search va filter
- Task: Row actions

### Story 5: Real-time Updates (3 points)
- Task: WebSocket connection
- Task: State sync logic
- Task: Notification badge
- Task: Reconnection handling

Total: 13 points ≈ 2 sprints
```

### Misol 2: Payment Integration

**YOMON BREAKDOWN:**
```
Task: Stripe integration
Estimate: 1 hafta
```

**YAXSHI BREAKDOWN:**
```markdown
## Epic: Payment System

### Phase 1: Foundation (Sprint 1)

#### Story: Payment Configuration (2 points)
- Task: Stripe account setup
- Task: Environment variables
- Task: Stripe SDK integration
- Task: Test/Live mode switching

#### Story: Card Input UI (3 points)
- Task: Stripe Elements integration
- Task: Card validation UI
- Task: Error handling UI
- Task: Mobile responsiveness

### Phase 2: Core Flow (Sprint 2)

#### Story: One-time Payment (3 points)
- Task: Create payment intent (backend)
- Task: Confirm payment (frontend)
- Task: Success/failure handling
- Task: Receipt email

#### Story: Save Payment Method (2 points)
- Task: SetupIntent flow
- Task: Customer creation
- Task: Card list UI

### Phase 3: Advanced (Sprint 3)

#### Story: Subscription (3 points)
- Task: Price/Product setup
- Task: Subscription creation
- Task: Billing portal link
- Task: Webhook: subscription.created

#### Story: Webhooks (3 points)
- Task: Webhook endpoint setup
- Task: Signature verification
- Task: Event handlers (5 events)
- Task: Retry/failure handling

### Phase 4: Polish (Sprint 4)

#### Story: Error Recovery (2 points)
- Task: Payment retry logic
- Task: Card update flow
- Task: Decline handling

Total: 18 points ≈ 4 sprints
```

### Misol 3: Search Feature

```markdown
## Feature: Product Search

### MVP (Sprint 1)
- Basic text search
- Results list
- No filters

### Iteration 1 (Sprint 2)
- Category filter
- Price range filter
- Sort options

### Iteration 2 (Sprint 3)
- Autocomplete
- Search suggestions
- Recent searches

### Iteration 3 (Sprint 4)
- Elasticsearch integration
- Typo tolerance
- Synonym support

### Future
- Voice search
- Image search
- AI recommendations
```

---

## Estimation Texnikasi

### Story Points vs Hours

```
STORY POINTS (Relative):
1 = Juda oson (1-2 soat)
2 = Oson (yarim kun)
3 = O'rtacha (1 kun)
5 = Murakkab (2-3 kun)
8 = Juda murakkab (hafta)
13+ = Bo'lish kerak!

HOURS (Absolute):
- Aniq deadline kerak bo'lganda
- Kichik task'lar uchun
- Client bilan gaplashganda
```

### Planning Poker

```
Jamoa a'zolari bir vaqtda estimate ko'rsatadi:

Dev 1: 3 points
Dev 2: 5 points
Dev 3: 3 points
Dev 4: 8 points  ← Outlier

Muhokama:
"Dev 4, nima uchun 8 dedingiz?"
"Chunki caching logic murakkab"
"Ha, lekin bizda allaqachon cache helper bor"
"Oh, bilmasdim. Unda 3"

Final: 3 points
```

### Uncertainty Cone

```
Early Planning:  Estimate x4 yoki /4 bo'lishi mumkin
Design Done:     Estimate x2 yoki /2
Development:     Estimate x1.25 yoki /1.25
Testing:         Estimate ± 10%

↓

Aniq estimate uchun avval research/spike qiling
```

---

## Scope Creep Bilan Kurashish

### Scope Creep Nima?

```
Original:
"Login page qil"

After 2 weeks:
"Login + Registration + Social auth + 2FA +
Password reset + Remember me + Security questions + ..."

↓

Scope 5x kengaydi, deadline o'zgarmadi.
```

### Prevention Strategiyasi

#### 1. Clear Definition of Done

```markdown
## Login Feature - Done Criteria

IN SCOPE:
- Email/password login
- Form validation
- Error messages
- Redirect after login
- Remember me checkbox

OUT OF SCOPE (Future):
- Social login
- 2FA
- Captcha
- Biometric
```

#### 2. Change Request Process

```
Yangi talab keldi.

1. Yozib oling (ticket/story)
2. Estimate qiling
3. Trade-off ko'rsating:
   "Buni qo'shsak, deadline 3 kun kechikadi"
   yoki
   "Buni qo'shsak, X feature chiqib qoladi"
4. Stakeholder qaror qiladi
```

#### 3. MoSCoW Prioritization

```
MUST have:   Login/logout (shusiz ishlamaydi)
SHOULD have: Remember me (muhim, lekin shart emas)
COULD have:  Social login (nice to have)
WON'T have:  Biometric (keyingi sprint)
```

---

## Do's and Don'ts

### DO's (Qiling)

```diff
+ Vertikal slice qiling
  Har task = working feature

+ Uncertainty'ni acknowledge qiling
  "Research kerak" = spike task yarating

+ Buffer qo'ying
  Real estimate + 20-30% buffer

+ Dependencies'ni aniq ko'rsating
  "B task'ni boshlash uchun A tugashi kerak"

+ Done criteria yozing
  "Qachon done?" aniq bo'lsin

+ Regular refinement qiling
  Haftada 1 marta backlog grooming
```

### DON'Ts (Qilmang)

```diff
- "Qilaveraman" demang
  Aniq plan yo'q = chaos

- Horizontal slice qilmang
  "Barcha UI", "Barcha API" - bunday bo'lmaydi

- Optimistic estimate bermang
  "Ideal sharoitda 2 kun" reallikda 4 kun

- "va" so'zini ko'p ishlatmang
  "X va Y va Z" = 3 ta task

- Technical debt'ni ignore qilmang
  Refactoring ham task

- Spike'larni unutmang
  Noaniqlik = research task kerak
```

---

## Tools va Templates

### Task Template

```markdown
## Task: [Aniq nom]

### Description
[1-2 jumla nima qilish kerak]

### Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

### Technical Notes
- [Implementation detail]
- [Dependency]

### Dependencies
- Blocks: [task id]
- Blocked by: [task id]

### Estimate
- Story Points: X
- Time: X hours/days

### Assignee
[Name]

### Labels
[feature, frontend, high-priority]
```

### Sprint Planning Template

```markdown
## Sprint [N] Planning

### Sprint Goal
[1 jumla - bu sprintda nima achieve qilamiz]

### Capacity
- Dev 1: 8 points (5 kun - 1 kun PTO)
- Dev 2: 10 points (5 kun)
- Total: 18 points

### Committed Stories
1. [Story name] - 5 points - Dev 1
2. [Story name] - 3 points - Dev 2
3. [Story name] - 3 points - Dev 1
4. [Story name] - 5 points - Dev 2

### Risks
- [Risk 1 va mitigation]
- [Risk 2 va mitigation]

### Carryover from last sprint
- [Task name] - reason
```

---

## Senior Developer Mindset

### 1. "Perfect is the Enemy of Good"

```
MVP → Iterate → Improve

Birinchi versiya mukammal bo'lmaydi.
Shunday bo'lishi ham kerak emas.
```

### 2. Risk-First Planning

```
Noaniq/xavfli task'larni birinchi qiling.

Sprint boshi: "Bu integration murakkab bo'lishi mumkin"
Sprint oxiri: "Ha, murakkab edi, lekin endi bilaman"

vs

Sprint oxiri: "Voy, bu murakkab ekan, vaqt yo'q!"
```

### 3. Realistic Estimation

```
Junior: "2 kun"
Mid: "3 kun" (buffer)
Senior: "3 kun development + 1 kun testing + 1 kun buffer = 5 kun"
       "Agar X muammo bo'lsa, +2 kun"
```

### 4. Communication > Documentation

```
Task yozib qo'yish yetarli emas.

Har kuni: "Men bugun X qilaman"
Blocker: Darhol aytish
Done: Demo qilish
```

### 5. Learn from History

```
Retrospective savollar:

1. Estimate noto'g'ri bo'ldimi? Nima uchun?
2. Qanday risk'lar miss qildik?
3. Keyingi safar nima o'zgartiramiz?
```

---

## Interview Savollari

### 1. "Katta feature'ni qanday breakdown qilasiz?"

**Yaxshi javob:**
```
Men uch bosqichda qilaman:

1. UNDERSTAND
   - Biznes goal nima?
   - Foydalanuvchi kim?
   - Success criteria nima?

2. DECOMPOSE
   - Epic → Story → Task
   - Vertical slices (har slice = working feature)
   - Dependencies aniqlash

3. ESTIMATE & PRIORITIZE
   - Story points
   - MoSCoW prioritization
   - Risk-first sequencing

Masalan, e-commerce checkout:
- MVP: Basic checkout (1 hafta)
- V2: Guest checkout (3 kun)
- V3: Saved cards (1 hafta)
- V4: Promocodes (3 kun)

Har iteration = deployable feature.
```

### 2. "Estimate noto'g'ri chiqsa nima qilasiz?"

**Yaxshi javob:**
```
Avval sababni tushunaman:
- Requirements o'zgardimi?
- Technical blocker bo'ldimi?
- Skill gap bormi?

Keyin:
1. Darhol xabar beraman (sprint o'rtasida, oxirida emas)
2. Scope/timeline trade-off taklif qilaman
3. Retrospective'da tahlil qilaman
4. Keyingi estimate'larga o'rganilgan narsani qo'shaman

Estimate = taxmin. Har doim 100% to'g'ri bo'lmaydi.
Muhimi - transparency va adaptation.
```

### 3. "Scope creep qanday handle qilasiz?"

**Yaxshi javob:**
```
Prevention > Cure.

1. Aniq Done Criteria (boshidanoq)
2. Written requirements (og'zaki emas)
3. Change Request process

Agar scope creep bo'lsa:
- "Bu ajoyib idea! Hozirgi scope'da yo'q edi"
- "Qo'shsak, deadline X kunga kechikadi"
- "Yoki bu feature'ni keyingi sprint'ga qo'yamiz"

Trade-off ko'rsataman. Stakeholder qaror qiladi.
Men faqat "ha" demayman.
```

### 4. "Technical task va business task farqi nima?"

**Yaxshi javob:**
```
BUSINESS TASK:
- Foydalanuvchiga value beradi
- "Login page"
- Stakeholder tushunadi

TECHNICAL TASK:
- Infra, refactor, debt
- "Redis cache setup"
- Dev uchun value

Balans kerak:
- 80% business features
- 20% technical health

Technical task'ni business til'da explain qilaman:
"Redis = sayt 3x tez ishlaydi = users xursand"
```

### 5. "Noaniq requirements bilan qanday ishlaysiz?"

**Yaxshi javob:**
```
Noaniqlik = Risk. Darhol address qilaman.

1. CLARIFY
   "X deganda nimani nazarda tutyapsiz?"
   "Success criteria nima?"

2. ASSUMPTION DOCUMENT
   Javob olmasam, assumption yozaman:
   "Men X deb faraz qilyapman. To'g'rimi?"

3. SPIKE
   Juda noaniq bo'lsa, research task:
   "2 soat research, keyin estimate"

4. MVP FIRST
   "Avval eng oddiy variant qilamiz.
   Feedback'dan keyin yaxshilaymiz"

Noaniqlikni ignore qilish - eng katta xato.
```

---

## Amaliy Mashqlar

### Mashq 1: Feature Breakdown

Quyidagi feature'ni breakdown qiling:

```
"Blog platformasi qilish: postlar yozish, o'qish,
comment qilish, like bosish"
```

<details>
<summary>Javobni ko'rish</summary>

```markdown
## Epic: Blog Platform

### Story 1: Post Creation (5 points)
- Task: Rich text editor integration
- Task: Post form (title, content, cover)
- Task: Draft saving
- Task: Publish flow

### Story 2: Post Listing (3 points)
- Task: Post card component
- Task: Pagination
- Task: Category filter

### Story 3: Post Detail (3 points)
- Task: Post page layout
- Task: Related posts
- Task: Share buttons

### Story 4: Comments (5 points)
- Task: Comment form
- Task: Comment list
- Task: Reply to comment
- Task: Delete own comment

### Story 5: Likes (2 points)
- Task: Like button
- Task: Like count
- Task: Optimistic UI update

Total: 18 points ≈ 3 sprints
```
</details>

### Mashq 2: Story Yozing

"User o'z profilini edit qila olishi kerak" uchun to'liq User Story yozing.

<details>
<summary>Javobni ko'rish</summary>

```markdown
## User Story: Edit Profile

**As a** registered user
**I want** to edit my profile information
**So that** I can keep my data up-to-date

### Acceptance Criteria

1. **Given** I am logged in
   **When** I go to Settings > Profile
   **Then** I see my current profile data

2. **Given** I am on Profile page
   **When** I change my name and click Save
   **Then** name is updated and success message shown

3. **Given** I am on Profile page
   **When** I upload new avatar
   **Then** avatar is updated immediately (optimistic)

4. **Given** I enter invalid email
   **When** I click Save
   **Then** validation error is shown, form not submitted

5. **Given** another user has same email
   **When** I try to change to that email
   **Then** "Email already taken" error shown

### Technical Notes
- Avatar: max 2MB, jpg/png only
- API: PATCH /api/users/me
- Form: useForm composable

### Estimate: 3 points
```
</details>

---

## Xulosa

Task breakdown - bu:

1. **Clarity** - nima qilish kerakligini aniq tushunish
2. **Predictability** - qachon tugashini bilish
3. **Progress** - har kuni progress ko'rish
4. **Risk Management** - muammolarni erta aniqlash

> "Fil qanday yeyiladi? Bir luqma bilan."

---

**Keyingi:** [Communication](./04-communication.md)
