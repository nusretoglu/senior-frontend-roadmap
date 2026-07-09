# Interview Tips - Texnik Intervyudan Muvaffaqiyatli O'tish

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Intervyu — bu Dasturchining "Sotuv (Sales) jarayoni"dir. Sizning texnik bilimlaringiz juda zo'r bo'lishi mumkin, lekin agar uni Intervyu paytida sotishni bilmasangiz, sizdan ko'ra texnik bilimi pastroq, lekin intervyuda o'zini yaxshi ko'rsatgan boshqa nomzod ishga qabul qilinadi. Senior dasturchi bo'lish uchun Intervyudan o'tishni ham, Intervyu olishni ham (Interviewing) chuqur bilish talab qilinadi. Kompaniyaga kirish yoki yangi a'zoni jamoaga qabul qilish butun loyiha taqdirini hal qiladi.

> [!NOTE]
> **Real-hayot analogiyasi: "Birinchi Uchrashuv (First Date)"**  
> Intervyu huddi birinchi uchrashuvga o'xshaydi.  
> Agar siz doim o'zingizni maqtasangiz, qarshingizdagiga savol bermasangiz yoki u sizga savol berganda qisqa "Ha/Yo'q" deb o'tiraversangiz, ikkinchi uchrashuv (Next Stage) bo'lmaydi. Kompaniya sizni intervyu qilganda faqat "JS ni biladimi?" deb emas, "Bu odam bilan har kuni 8 soat ishlash yoqimlimi? Agar qiyin muammo chiqsa u qanday yo'l tutadi?" deb baholaydi. Shuning uchun "Madaniyat (Culture Fit)" va muammoga yondashuv (Problem Solving) ko'pincha kodning o'zidan ham muhimroqdir.

Texnik intervyu - bu nafaqat kod yozish imtihoni, balki **muammolarni hal qilish, kommunikatsiya va professional mindset** ko'rsatish imkoniyati. Bu bo'limda intervyudan o'tish va intervyu olish ko'nikmalarini o'rganasiz.
## Intervyu Turlari

```
┌─────────────────────────────────────────────────────────┐
│                    INTERVIEW TYPES                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  TECHNICAL                    BEHAVIORAL                 │
│  ├── Coding                   ├── Past experience        │
│  ├── System Design            ├── Conflict resolution    │
│  ├── Frontend-specific        ├── Leadership             │
│  ├── Live coding              └── Culture fit            │
│  └── Take-home                                           │
│                                                          │
│  COMPANY-SPECIFIC                                        │
│  ├── Google: Strong algorithms focus                     │
│  ├── Facebook: Practical coding + system design          │
│  ├── Amazon: Leadership principles                       │
│  └── Startups: Practical skills + culture                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Coding Interview

### Approach Framework: UMPIRE

```
U - Understand the problem
M - Match with known patterns
P - Plan your approach
I - Implement the solution
R - Review and test
E - Evaluate complexity
```

### Step-by-Step Process

```javascript
// PROBLEM: Find two numbers that sum to target

// STEP 1: UNDERSTAND (2-3 min)
// - Input: Array of numbers, target sum
// - Output: Indices of two numbers
// - Constraints: Each input has exactly one solution
// - Edge cases: Negative numbers? Duplicates?

// STEP 2: MATCH (1-2 min)
// - Two Sum = Classic hash map problem
// - Pattern: Store complements

// STEP 3: PLAN (2-3 min)
// Bruteforce: O(n²) - check every pair
// Optimized: O(n) - use hash map
//
// Approach:
// 1. Iterate through array
// 2. For each num, check if (target - num) exists in map
// 3. If yes, return indices
// 4. If no, add num to map

// STEP 4: IMPLEMENT (10-15 min)
function twoSum(nums, target) {
  const map = new Map()  // num -> index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]

    if (map.has(complement)) {
      return [map.get(complement), i]
    }

    map.set(nums[i], i)
  }

  return []  // No solution found
}

// STEP 5: REVIEW (2-3 min)
// Test cases:
// [2, 7, 11, 15], target = 9 → [0, 1]
// [3, 2, 4], target = 6 → [1, 2]
// [3, 3], target = 6 → [0, 1]

// STEP 6: EVALUATE
// Time: O(n) - single pass
// Space: O(n) - hash map storage
```

### Live Coding Tips

```markdown
## BEFORE CODING

1. Clarify requirements (don't assume!)
   "Can there be duplicate values?"
   "What if array is empty?"
   "Should I handle invalid input?"

2. Think out loud
   "I'm thinking of using a hash map because..."

3. Discuss approach before coding
   "Does this approach make sense?"

## WHILE CODING

1. Write clean code
   - Meaningful variable names
   - Comments for complex logic

2. Keep talking
   "Now I'm iterating through..."
   "This handles the edge case where..."

3. Start simple, optimize later
   "Let me write bruteforce first, then optimize"

## AFTER CODING

1. Walk through with example
   "Let's trace through [2,7,11,15] with target 9"

2. Discuss edge cases
   "This handles empty array by returning []"

3. Complexity analysis
   "Time O(n), Space O(n)"

4. Potential improvements
   "If memory is constrained, we could sort and use two pointers"
```

### Common Mistakes

```diff
- Silent coding
  Intervyuer fikringizni bilmaydi

- Jumping to code
  Tushunmasdan yozish = qayta yozish

- Ignoring hints
  Intervyuer yordam bermoqchi

- Giving up
  "Bilmayman" emas, "Yana bir approach sinab ko'ray"

- Perfect solution immediately
  Bruteforce → Optimize = OK

- Not testing
  "Ishlaydi" demang, test qiling
```

---

## System Design Interview

### Framework: RESHADE

```
R - Requirements gathering
E - Estimation
S - System interface (API)
H - High-level design
A - Detailed design of components
D - Data model & storage
E - Edge cases & bottlenecks
```

### Misol: URL Shortener Design

```markdown
## 1. REQUIREMENTS (5 min)

FUNCTIONAL:
- Shorten URL
- Redirect to original
- Custom short URLs (optional)
- Analytics (optional)

NON-FUNCTIONAL:
- Availability > Consistency (AP)
- Low latency (< 100ms)
- Scalable (100M URLs/day)

OUT OF SCOPE:
- User accounts
- API rate limiting

## 2. ESTIMATION (3 min)

Traffic:
- Write: 100M URLs/day = 1200/sec
- Read: 100:1 ratio = 120K/sec (read-heavy)

Storage:
- 100M * 500 bytes = 50GB/day
- 5 years = 90TB

## 3. API DESIGN (3 min)

POST /api/v1/shorten
{
  "original_url": "https://...",
  "custom_alias": "my-link"  // optional
}
→ { "short_url": "https://short.ly/abc123" }

GET /api/v1/{short_code}
→ 302 Redirect to original_url

## 4. HIGH-LEVEL DESIGN (10 min)

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  Client  │────►│ Load Balancer│────►│  App Server │
└──────────┘     └──────────────┘     └──────┬──────┘
                                              │
                 ┌────────────────────────────┼────────────────────────────┐
                 │                            │                            │
                 ▼                            ▼                            ▼
          ┌────────────┐              ┌────────────┐              ┌────────────┐
          │   Cache    │              │  Database  │              │  Counter   │
          │  (Redis)   │              │ (Postgres) │              │  Service   │
          └────────────┘              └────────────┘              └────────────┘
```

## 5. DETAILED DESIGN (10 min)

### Short Code Generation

Option A: Hash (MD5/SHA)
- Pros: No coordination
- Cons: Collision handling needed

Option B: Counter-based (base62)
- Pros: No collision
- Cons: Predictable, single point

Option C: Distributed ID (Snowflake)
- Pros: Scalable, no collision
- Cons: Complex setup

CHOICE: Counter-based with range allocation
- Each server gets ID range
- Local counter within range
- No coordination needed

### Database Schema
```sql
CREATE TABLE urls (
  id BIGINT PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  click_count INT DEFAULT 0
);

CREATE INDEX idx_short_code ON urls(short_code);
```

### Caching Strategy
- Cache popular URLs in Redis
- TTL: 24 hours
- Cache-aside pattern
- 80/20 rule: 20% URLs = 80% traffic

## 6. EDGE CASES & BOTTLENECKS (5 min)

### What if database fails?
- Read replicas for reads
- Failover for writes
- Cache serves stale data temporarily

### What if URL expires?
- Background job cleans expired
- Return 410 Gone for expired URLs

### Hot URLs?
- CDN for redirect
- Multiple cache replicas

### Analytics at scale?
- Async processing (Kafka)
- Aggregate in batch
```

### System Design Tips

```markdown
## DO's

✅ Start with requirements
   "Before I design, let me understand scope"

✅ Back-of-envelope calculations
   "100M/day = 1200/sec, we need horizontal scaling"

✅ Trade-off discussions
   "We could use SQL or NoSQL. SQL gives us ACID but..."

✅ Draw diagrams
   Boxes and arrows help both you and interviewer

✅ Deep dive on critical components
   "Let me explain the ID generation in detail"

✅ Acknowledge limitations
   "This design handles 100K RPS. Beyond that, we'd need..."

## DON'Ts

❌ Jump to solution
   First understand what you're building

❌ Over-engineer
   Start simple, add complexity as needed

❌ Ignore non-functional requirements
   Latency, availability, consistency

❌ Monologue
   Check in: "Does this make sense so far?"

❌ Forget data
   Data model is critical for system design
```

---

## Behavioral Interview

### STAR Method

```
S - Situation (Context)
T - Task (Your responsibility)
A - Action (What you did)
R - Result (Outcome + learnings)
```

### Example Answers

#### "Tell me about a time you dealt with conflict"

```markdown
SITUATION:
"Oldingi kompaniyada men va boshqa senior dev
arxitektura haqida kelisha olmadik.
U microservices, men modular monolith taklif qilardim."

TASK:
"Men o'z pozitsiyamni himoya qilishim va
jamoa uchun eng yaxshi qarorni topishim kerak edi."

ACTION:
"1. Avval uning argumentlarini to'liq tushunishga harakat qildim
2. Ikkalamiz ham yozma taklif tayyorladik
3. Team bilan birga ikkalasini tahlil qildik
4. Trade-off matrix yaratdik
5. 3 oylik pilot taklif qildim"

RESULT:
"Modular monolith tanlandi. 1 yildan keyin u ham
bu to'g'ri qaror ekanini tan oldi.
Men o'rgandim: avval tushunish, keyin convince qilish."
```

#### "Describe a challenging project"

```markdown
SITUATION:
"Startup'da edim. 2 hafta ichida payment integration
qilish kerak edi. Hech kim Stripe bilan ishlamagan."

TASK:
"Men tech lead sifatida delivery va quality uchun
mas'ul edim."

ACTION:
"1. Stripe docs'ni bir kun o'rgandim
2. POC yozdim
3. Junior'larga pair programming orqali o'rgatdim
4. Daily check-in'lar qildim
5. Risk'larni PM'ga erta xabar berdim"

RESULT:
"13 kunda tugatdik. Production'da birinchi 6 oy
nol downtime. Team Stripe ekspert bo'ldi.
Lesson: Invest in learning, it pays off fast."
```

### Common Behavioral Questions

```markdown
## Leadership
- "Tell me about a time you led a project"
- "How do you mentor junior developers?"
- "Describe a situation where you had to make an unpopular decision"

## Problem Solving
- "Tell me about a difficult bug you solved"
- "Describe a time you improved a process"
- "How do you handle tight deadlines?"

## Teamwork
- "Tell me about a conflict with a teammate"
- "How do you handle disagreements?"
- "Describe working with a difficult person"

## Failure & Learning
- "Tell me about a mistake you made"
- "Describe a project that failed"
- "What would you do differently?"

## Self-awareness
- "What's your biggest weakness?"
- "How do you handle feedback?"
- "Where do you see yourself in 5 years?"
```

### Answering "Weakness" Question

```markdown
## BAD ANSWERS

"I work too hard" (Fake weakness)
"I have no weaknesses" (Arrogant)
"I'm bad at coding" (Disqualifying)

## GOOD ANSWER

"My weakness is public speaking.
Technical presentations qiyinlashardi.

I've been working on it:
1. Internal tech talks every month
2. Recorded myself and analyzed
3. Toastmasters club

I'm not perfect yet, but 6 months ago
bir kishi oldida ham qotib qolardim.
Hozir 20 kishilik team'ga presentation bera olaman."

## WHY IT'S GOOD
- Real weakness
- Self-aware
- Action taken
- Progress shown
```

---

## Frontend-Specific Interview

### Topics to Master

```markdown
## JavaScript Core
- Closures, hoisting, event loop
- Promises, async/await
- Prototypes, this binding
- ES6+ features

## Browser
- DOM manipulation
- Event handling
- Web APIs (Storage, Fetch, etc.)
- Performance (CWV, optimization)

## Framework (Vue/React)
- Component lifecycle
- State management
- Reactivity system
- Hooks/Composition API

## CSS
- Box model, flexbox, grid
- Responsive design
- CSS specificity
- Animations

## Tooling
- Bundlers (Vite, webpack)
- Testing (Jest, Vitest)
- TypeScript
```

### Sample Questions

#### "Explain Event Loop"

```javascript
// ANSWER STRUCTURE:
// 1. Concept
// 2. Visual/Analogy
// 3. Code example
// 4. Practical implication

/*
JavaScript single-threaded, lekin async operations
qila oladi. Event Loop - bu browser/Node bilan
JS engine o'rtasidagi coordinator.

   ┌────────────────────────────┐
   │       Call Stack          │  ← Sync code runs here
   └────────────────────────────┘
                │
                ▼
   ┌────────────────────────────┐
   │       Event Loop          │  ← Checks if stack empty
   └────────────────────────────┘
                │
   ┌────────────┴────────────────┐
   │                             │
   ▼                             ▼
┌──────────┐              ┌───────────────┐
│Microtasks│              │  Task Queue   │
│(Promises)│              │ (setTimeout)  │
└──────────┘              └───────────────┘
*/

console.log('1')

setTimeout(() => console.log('2'), 0)

Promise.resolve().then(() => console.log('3'))

console.log('4')

// Output: 1, 4, 3, 2
// Why:
// - Sync code first (1, 4)
// - Microtasks next (Promise → 3)
// - Task queue last (setTimeout → 2)

// PRACTICAL IMPLICATION:
// Vue/React'da nextTick/useEffect timing
// Async data loading order
// Performance optimization
```

#### "Vue vs React differences"

```markdown
## GOOD ANSWER STRUCTURE

"Men ikkalasini ham ishlatganman. Asosiy farqlar:

1. REACTIVITY
   React: Explicit (setState, hooks)
   Vue: Implicit (reactive system)

2. TEMPLATE
   React: JSX (JS ichida HTML)
   Vue: SFC (HTML, JS, CSS ajratilgan)

3. STATE MANAGEMENT
   React: External (Redux, Zustand)
   Vue: Built-in + Pinia

4. LEARNING CURVE
   React: Steep initially (hooks, patterns)
   Vue: Gradual (options → composition)

5. PERFORMANCE
   Both excellent, different trade-offs

MY PREFERENCE:
[Honest answer with reasoning]
'Vue because Composition API is elegant'
or
'React because larger ecosystem'

BUT:
Both are tools. Best one = team knows best."
```

---

## Take-Home Assignment

### How to Approach

```markdown
## 1. REQUIREMENTS ANALYSIS (30 min)
- Read twice
- List explicit requirements
- Identify implicit requirements
- Note any ambiguities

## 2. PLANNING (1 hour)
- Tech stack decision
- Architecture sketch
- Feature priority (MoSCoW)
- Time allocation

## 3. IMPLEMENTATION (allocated time)
- Start with core functionality
- Clean code from beginning
- Commit frequently
- Document as you go

## 4. POLISH (20% of time)
- Error handling
- Edge cases
- README
- Optional: tests, deployment

## 5. REVIEW (30 min)
- Run through requirements
- Test all features
- Check code quality
- Update documentation
```

### Take-Home Tips

```diff
+ README professional yozing
  Setup, features, decisions, limitations

+ Core features 100%
  Extra features 50% dan yaxshiroq

+ Clean code > clever code
  Reviewer o'qishi kerak

+ Commit history meaningful
  "WIP", "fix" emas; "Add user authentication"

+ Edge cases handle qiling
  Empty state, error state, loading state

+ Tests yozing (agar vaqt bo'lsa)
  Kamida happy path

- Over-engineering
  Simple va ishlaydi > Complex va perfect

- Dependency hell
  Juda ko'p library = red flag

- Blind copy-paste
  Stack Overflow code'ni tushunib qo'ying
```

---

## Intervyu Olish (Interviewer sifatida)

### Interview Structure

```markdown
## 1. INTRODUCTION (5 min)
- O'zingizni tanishtiring
- Intervyu formatini tushuntiring
- Savollarga javob bering

## 2. TECHNICAL (25-35 min)
- Muammo bering
- Kuzating va yordam bering
- Difficulty adjust qiling

## 3. Q&A (5-10 min)
- Candidate savollariga javob
- Company/team haqida

## 4. WRAP UP (2 min)
- Keyingi qadamlar
- Timeline
```

### Evaluation Criteria

```markdown
## TECHNICAL SKILLS
- Problem solving approach
- Code quality
- Best practices
- Debugging ability

## COMMUNICATION
- Clarifying questions
- Thought process explanation
- Listening to hints

## CULTURE FIT
- Collaboration style
- Growth mindset
- Alignment with values

## SCORING (1-4)
1 - Does not meet expectations
2 - Partially meets
3 - Meets expectations
4 - Exceeds expectations
```

### Interview Bias Avoidance

```diff
+ Structured interview
  Har candidate'ga bir xil savollar

+ Rubric-based evaluation
  "Yoqdi" emas, objective criteria

+ Multiple interviewers
  Turli perspektivalar

- Halo effect
  1 yaxshi javob ≠ yaxshi candidate

- Similar-to-me bias
  "U menga o'xshaydi" ≠ yaxshi hire

- Recency bias
  Oxirgi candidate esda qoladi
```

---

## Do's and Don'ts

### DO's (Intervyu berayotganda)

```diff
+ Prepare
  Company research, position requirements

+ Practice out loud
  Mirror yoki friend bilan

+ Ask clarifying questions
  Assumptions'ni tekshiring

+ Think out loud
  Process'ni ko'rsating

+ Be honest
  "Bilmayman, lekin shunday o'ylayman..."

+ Show enthusiasm
  "Bu muammo qiziq, chunki..."

+ Have questions ready
  Team, culture, growth haqida
```

### DON'Ts (Intervyu berayotganda)

```diff
- Lie about experience
  "Men qildim" vs "Men kuzatdim"

- Badmouth previous employer
  Professional qoling

- Give up easily
  "Bilmayman" o'rniga harakat qiling

- Over-explain
  Aniq va qisqa javob

- Ignore hints
  Interviewer yordam bermoqda

- Forget to ask questions
  "Savolim yo'q" = qiziqmayman
```

---

## Senior Developer Mindset

### 1. Show Depth and Breadth

```
Junior: "Men React bilaman"

Senior: "Men React bilaman - hooks, performance optimization,
testing. Vue va Svelte ham sinab ko'rganman.
Architecture qarorlari haqida o'ylash yaxshi ko'raman."
```

### 2. Discuss Trade-offs

```
Junior: "X eng yaxshi"

Senior: "X bu case'da yaxshi chunki Y.
Lekin Z vaziyatda A yaxshiroq bo'ladi."
```

### 3. Own Your Mistakes

```
"Bu loyihada men xato qildim.
Nima o'rgandim va qanday o'zgardim."
```

### 4. Think Beyond Code

```
"Bu feature texnik jihatdan qiyin emas.
Lekin user experience va business impact haqida o'yladim..."
```

### 5. Ask Good Questions

```
"Code review culture qanday?"
"Technical debt bilan qanday ishlaysizlar?"
"On-call rotation bormi?"
"Career growth qanday ko'rinadi?"
```

---

## Interview Savollari (Meta Level)

### 1. "Nega bu pozitsiyaga interest bor?"

**Yaxshi javob:**
```
"3 ta sabab:

1. PRODUCT
   Men [X mahsulot] ishlataman va yaxshi ko'raman.
   Uni qilish jamoasida bo'lish inspiring.

2. TEAM
   [Tech blog/conference] da ko'rganman -
   engineering culture juda kuchli.

3. GROWTH
   Men [Y skill] rivojlantirmoqchiman.
   Sizda [Z role] mavjud, bu trajectory to'g'ri."
```

### 2. "5 yildan keyin o'zingizni qayerda ko'rasiz?"

**Yaxshi javob:**
```
"Ikki yo'l ko'ryapman:

1. IC TRACK
   Staff/Principal engineer.
   Arxitektura qarorlari, mentoring, technical vision.

2. MANAGEMENT TRACK
   Engineering manager.
   Team building, delivery, people development.

Hozir men IC track'ni preferred qilaman.
Lekin bu kompaniyada experience orqali
qaysi path mos kelishini tushunaman."
```

### 3. "Kutilgan salary qancha?"

**Yaxshi javob:**
```
"Research qildim - bu role uchun market rate
[range] atrofida.

Men experience va skilllarimga qarab
[specific range] kutaman.

Lekin total compensation - salary, equity,
benefits, growth - hammasi muhim.

Sizning budget qanday ko'rinadi?"
```

### 4. "Savollaringiz bormi?" (Candidate'dan)

**Yaxshi savollar:**
```
TEAM/CULTURE:
"Typical kun qanday ko'rinadi?"
"Code review process qanday?"
"Junior va senior nisbati qanday?"

GROWTH:
"Keyingi 6 oyda bu role dan kutilgan nima?"
"Learning/conference budget bormi?"
"Mentorship opportunities bormi?"

PRODUCT:
"Keyingi yildagi eng katta challenge nima?"
"Tech debt bilan qanday ishlaysizlar?"

RED FLAGS (savol emas, signal):
"Overtime ko'pmi?" - burnout culture
"Bu role nima uchun ochiq?" - high turnover?
```

### 5. "Bizga savolingiz yo'qmi?" (Final question)

**Eng yaxshi:**
```
"Ha, bitta savol.

Siz bu kompaniyada X yil ishlaysiz.
Shu davomida eng yaxshi va eng qiyin
tajribalaringiz nima bo'ldi?

Bu menga culture haqida ko'p narsa aytadi."
```

---

## Interview Preparation Checklist

```markdown
## 1 WEEK BEFORE
- [ ] Company research (products, news, culture)
- [ ] Job description analysis
- [ ] Resume update
- [ ] STAR stories prepare (5-7)
- [ ] System design practice
- [ ] Algorithm practice (LeetCode medium)

## 1 DAY BEFORE
- [ ] Interview time/format confirm
- [ ] Clothes ready
- [ ] Technical setup (if virtual)
- [ ] Questions to ask ready
- [ ] Good sleep

## DAY OF
- [ ] 10 min early
- [ ] Water bottle
- [ ] Notebook/pen
- [ ] Relax, breathe
- [ ] Be yourself

## AFTER
- [ ] Thank you email (within 24h)
- [ ] Notes about interview
- [ ] Follow up if no response (1 week)
```

---

## Xulosa

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **STAR Metodi:** Behavior (Xulq-atvor) savollariga javob berishda "Ha/Yo'q" emas, Hikoya orqali javob bering. S (Situation - Qanday holat edi?), T (Task - Nima vazifa turardi?), A (Action - Siz nima qildingiz?), R (Result - Natija nima bo'ldi?). Bu sizni professional qilib ko'rsatadi.
2. **"Ovoz chiqarib o'ylang" (Think out loud):** Live Coding (Jonli kodlash) vaqtida jimgina qotib qolmang. Tushunmasangiz ham, "Hozir men Array ni aylanib chiqishni o'ylayapman, lekin Map ishlasak tezroq bo'larmikan" deb o'ylaringizni gapiring. Intervyuer sizning Javobingizni emas, Fikrlash jarayoningizni (Thought process) tekshiradi.
3. **Bilmasangiz tan oling (Lekin davomi bor):** "Buni bilmayman" deb jim o'tirish — Senior ga xos emas. "Buni ilgari ishlatmaganman, LEKIN u xuddi manabunga o'xshaydimi? Men uni Documentation ni o'qib 1-2 kunda o'rganib ola olaman" deng. O'rganishga tayyorligingiz bilimingizdan ustun.

---

## Xulosa

| Intervyu Qismi | Junior Yondashuvi | Senior Yondashuvi |
|----------------|-------------------|-------------------|
| **Kodlash (Live Coding)** | Birdaniga kod yozishga kirishib ketadi va yarmida xatoga tiqilib qoladi. | Avval Savolni yaxshilab aniqlab oladi (Clarification). Keyin Pseudo-code yozadi. Keyin haqiqiy kodni yozadi. |
| **Texnik Savol** | Faqat "Nima" ekanligini aytadi (Masalan: Redux bu state manager). | "Nima" ligini va "Nega" kerakligini, hamda "Qachon" ishlatmaslikni (Trade-off) aytadi. |
| **Xatoga qilinganda** | O'zini oqlashga harakat qiladi yoki uzr so'raydi. | Feedback ni qabul qiladi: "Ajoyib fikr, haqiqatan ham u yerda N+1 xatosi bor ekan, shunday to'g'rilaymiz" deydi. |
| **Sizning Savollaringiz** | "Oylik qancha? Qachon ish boshlayman?" (Yoki savolim yo'q deydi). | "Jamoada kod sifatini qanday ushlaysizlar? Eng katta texnik qarzingiz (Tech Debt) nima?" deb proyektni baholaydi. |

Interview muvaffaqiyati = **Preparation + Communication + Mindset**

> "Interview - bu ikki tomonlama ko'rish. Siz ham kompaniyani baholayapsiz."

---

**Orqaga:** [Soft Skills](./)
