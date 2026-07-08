# Architecture Discussion - Arxitektura Qarorlarini Muhokama Qilish

## Kirish

Arxitektura qarorlari - bu tizim qanday qurilishini belgilaydigan fundamental decisions. Senior developer sifatida siz bu qarorlarni **taklif qilish, muhokama qilish va himoya qilish**ni bilishingiz kerak.

## Arxitektura Muhokamasi Nima?

```
CODING:        "Bu funksiya qanday ishlaydi?"
ARCHITECTURE:  "Bu tizim qanday tuzilgan va nima uchun?"

CODING:        1 kun ta'sir
ARCHITECTURE:  1+ yil ta'sir
```

### Arxitektura Qarorlariga Misollar

```
- Monolith vs Microservices
- SQL vs NoSQL
- REST vs GraphQL
- Server-side vs Client-side rendering
- Synchronous vs Asynchronous processing
- Build vs Buy
- Cloud provider tanlash
```

---

## RFC (Request for Comments)

### RFC Nima?

RFC - bu katta texnik qarorlarni documented tarzda taklif qilish va muhokama qilish jarayoni.

```
Developer → RFC yozadi → Team ko'rib chiqadi →
Feedback → O'zgartirishlar → Approve/Reject →
Implementation
```

### RFC Template

```markdown
# RFC: [Qisqa sarlavha]

## Status
Draft | In Review | Approved | Rejected | Superseded

## Author(s)
[Ismlar]

## Date
[Sana]

## Summary
[2-3 jumla - bu RFC nima haqida]

## Motivation
Nima muammo hal qilinmoqda?
Nima uchun hozirgi holat yomon?

## Detailed Design

### Overview
[High-level yondashuv]

### Technical Details
[Implementation tafsilotlari]

### API Changes
[Agar API o'zgarsa]

### Data Model
[Agar data model o'zgarsa]

### Migration Strategy
[Qanday migrate qilasiz]

## Alternatives Considered

### Alternative 1: [Nomi]
- Description
- Pros
- Cons
- Nima uchun tanlalmadi

### Alternative 2: [Nomi]
- Description
- Pros
- Cons
- Nima uchun tanlalmadi

## Trade-offs
- [Trade-off 1]
- [Trade-off 2]

## Risks
- [Risk 1 va mitigation]
- [Risk 2 va mitigation]

## Timeline
- Phase 1: [nima] - [qachon]
- Phase 2: [nima] - [qachon]

## Success Metrics
- [Qanday o'lchaymiz muvaffaqiyatni]

## Open Questions
- [Hali javob topilmagan savollar]

## References
- [Linklar, resurslar]
```

### Real RFC Misol

```markdown
# RFC: Payment Service Extraction

## Status
In Review

## Author(s)
Ahmad Karimov

## Date
2024-01-15

## Summary
Monolith'dan Payment modulni alohida microservice'ga
chiqarish. Bu scaling va deployment flexibility beradi.

## Motivation

### Current Problems
1. Payment bug fix deploy qilish uchun butun app deploy kerak
2. Payment traffic spike butun tizimga ta'sir qiladi
3. PCI compliance auditi qiyin - scope katta
4. Payment team'ning velocity past - code entangled

### Expected Benefits
1. Independent deployment
2. Better scaling
3. Smaller PCI scope
4. Team autonomy

## Detailed Design

### Architecture
```
┌─────────────┐      ┌──────────────────┐
│   Main App  │ ───► │  Payment Service │
└─────────────┘      └────────┬─────────┘
                              │
                     ┌────────┴─────────┐
                     │  Stripe/PayPal   │
                     └──────────────────┘
```

### API Contract
```
POST /api/v1/payments
{
  "order_id": "uuid",
  "amount": 10000,
  "currency": "USD",
  "method": "card"
}

Response:
{
  "payment_id": "uuid",
  "status": "pending|completed|failed"
}
```

### Data Migration
1. payments table → Payment Service DB
2. Double-write period (2 hafta)
3. Read from new, write to both
4. Cutover

### Communication
- Synchronous: REST for payment creation
- Asynchronous: Events for status updates (Kafka)

## Alternatives Considered

### Alternative 1: Modular Monolith
- Separate module but same deployment
- Pros: Simpler, no network overhead
- Cons: Still coupled deployment, PCI scope same
- Rejected: Doesn't solve main problems

### Alternative 2: Full Microservices
- Extract all modules
- Pros: Full flexibility
- Cons: Too much complexity now, team not ready
- Rejected: Start small, iterate

## Trade-offs

| Aspect | Before | After |
|--------|--------|-------|
| Complexity | Low | Medium |
| Deployment | Coupled | Independent |
| Latency | 0ms | +5-10ms |
| Debugging | Easy | Harder |
| Scaling | Together | Independent |

## Risks

### Risk 1: Network Latency
- Impact: +5-10ms per payment
- Mitigation: Acceptable for payment flow
- Monitoring: Latency alerts

### Risk 2: Data Inconsistency
- Impact: Payment status mismatch
- Mitigation: Saga pattern, idempotency
- Monitoring: Reconciliation job

### Risk 3: Operational Complexity
- Impact: More services to manage
- Mitigation: Kubernetes, observability
- Training: DevOps session

## Timeline
- Week 1-2: API design, contracts
- Week 3-4: Payment Service MVP
- Week 5-6: Integration, double-write
- Week 7-8: Migration, monitoring
- Week 9-10: Cutover, old code cleanup

## Success Metrics
- Payment deploy time: 1h → 10min
- Payment uptime: 99.9% → 99.99%
- PCI audit scope: -60%
- Payment team velocity: +30%

## Open Questions
1. Qaysi events Kafka orqali yuboriladi?
2. Payment Service uchun alohida on-call kerakmi?
3. Legacy payment methods (bank transfer) ham migrate bo'ladimi?

## References
- [Strangler Fig Pattern](https://martinfowler.com/...)
- [PCI DSS requirements](...)
- Similar: Shopify's payment extraction (link)
```

---

## ADR (Architecture Decision Record)

### ADR Nima?

ADR - qaror qilingandan **keyin** uni documented qilish. Kelajakda "nima uchun shunday qilindi?" degan savolga javob.

### ADR Template

```markdown
# ADR-[number]: [Sarlavha]

## Date
[YYYY-MM-DD]

## Status
Proposed | Accepted | Deprecated | Superseded by ADR-X

## Context
Qanday muammo/vaziyat bor edi?
Qanday constraints mavjud edi?

## Decision
Nimaga qaror qildik?

## Consequences

### Positive
- [Yaxshi natija 1]
- [Yaxshi natija 2]

### Negative
- [Yomon natija 1]
- [Yomon natija 2]

### Neutral
- [Ta'sirsiz o'zgarish]
```

### Real ADR Misol

```markdown
# ADR-007: Use PostgreSQL instead of MongoDB

## Date
2024-01-20

## Status
Accepted

## Context

We need to choose a database for our e-commerce platform.

Requirements:
- Complex queries (joins, aggregations)
- ACID transactions for payments
- Team familiar with SQL
- Budget: managed service $500/mo

Constraints:
- Team has no MongoDB experience
- Need strong consistency for orders
- Already using PostgreSQL for auth service

Options considered:
1. MongoDB (document)
2. PostgreSQL (relational)
3. CockroachDB (distributed SQL)

## Decision

We will use PostgreSQL (managed on AWS RDS).

Reasons:
1. Team expertise - 3/4 developers know SQL
2. Complex queries - e-commerce needs joins
3. ACID - payment consistency critical
4. Cost - RDS cheaper than MongoDB Atlas for our scale
5. Ecosystem - ORMs, tools, community

## Consequences

### Positive
- Faster development (familiar tech)
- Strong data integrity
- Good tooling (Prisma, pgAdmin)
- Cost predictable

### Negative
- Schema migrations required
- Less flexible for unstructured data
- Scaling needs more planning (read replicas)

### Neutral
- Need to design schema upfront
- Will evaluate again at 10x scale
```

---

## Trade-off Tahlili

### Trade-off Matrix

```
| Criteria        | Option A | Option B | Option C |
|-----------------|----------|----------|----------|
| Performance     | +++      | ++       | +        |
| Simplicity      | +        | ++       | +++      |
| Cost            | +        | ++       | +++      |
| Scalability     | +++      | ++       | +        |
| Team expertise  | +        | +++      | ++       |
| Time to market  | +        | ++       | +++      |
|-----------------|----------|----------|----------|
| TOTAL           | 10       | 13       | 12       |

+ = 1, ++ = 2, +++ = 3
```

### Common Trade-offs

```
CONSISTENCY vs AVAILABILITY
  - Strong consistency = slower, less available
  - Eventual consistency = faster, more available

SIMPLICITY vs FLEXIBILITY
  - Simple solution = faster now, harder to change
  - Flexible solution = slower now, easier to change

BUILD vs BUY
  - Build = control, maintenance burden
  - Buy = fast start, vendor lock-in

MONOLITH vs MICROSERVICES
  - Monolith = simple, coupled
  - Microservices = complex, decoupled

SYNCHRONOUS vs ASYNCHRONOUS
  - Sync = simple, blocking
  - Async = complex, scalable
```

### Trade-off Discussion Frameworki

```markdown
## 1. Clarify Requirements

"Bu qaror uchun eng muhim nima?"
- Performance?
- Time to market?
- Maintainability?
- Cost?

## 2. Identify Options

"Qanday yo'llar bor?"
- Option A
- Option B
- Option C

## 3. Analyze Each

"Har birining yaxshi/yomon tomonlari?"

## 4. Make Decision

"X tanlaymiz chunki Y bizning kontekstda muhimroq"

## 5. Document

"Kelajakda tushunish uchun yozib qo'yamiz"
```

---

## Real-World Architecture Discussions

### Misol 1: REST vs GraphQL

**Context:**
- Mobile app va web app
- 20+ API endpoints
- Mobile = slow network, battery sensitive

```markdown
## Discussion Points

### REST Advocat
"REST bizga yetarli:
- Team biladi
- Caching oson (HTTP cache)
- Simple tooling
- Industry standard

GraphQL overhead:
- Learning curve
- Query complexity attacks
- No HTTP caching out of box"

### GraphQL Advocat
"GraphQL mobile uchun ideal:
- Under-fetching yo'q (1 query, all data)
- Over-fetching yo'q (faqat kerakli fields)
- Type safety
- Real-time subscriptions

Mobile use case juda mos"

### Resolution
"Hybrid approach:
- Public API: REST (simple, cacheable)
- Mobile BFF: GraphQL (flexible queries)
- Increment: REST'dan boshlaymiz, kerak bo'lsa GraphQL"
```

### Misol 2: Monolith vs Microservices

**Context:**
- Startup, 5 developers
- MVP bosqichda
- Tez iterate qilish kerak

```markdown
## Discussion

### Microservices Advocat
"Kelajakda scale qilish kerak bo'ladi.
Hozirdan microservices qilsak, keyinroq refactor kerak emas."

### Monolith Advocat
"Hozir 5 kishi. Microservices qilsak:
- Operational complexity +500%
- Development velocity -50%
- 3 oy feature o'rniga infra

'Premature optimization is the root of all evil'

Amazon, Netflix ham monolith'dan boshlagan."

### Resolution
"Modular Monolith:
1. Clear module boundaries
2. Separate DB schemas per module
3. Refactor to microservices when:
   - Team > 20
   - Traffic > 10K RPS
   - Independent scaling needed"
```

### Misol 3: Build vs Buy

**Context:**
- Authentication system kerak
- Budget: $5000/month
- Timeline: 2 hafta

```markdown
## Discussion

### Build Advocat
"Custom auth qilsak:
- Full control
- No vendor lock-in
- Long-term cheaper
- Custom features"

### Buy Advocat
"Auth0/Firebase:
- 2 hafta → 2 kun
- Security experts maintained
- MFA, SSO, RBAC out of box
- $500/month vs dev time

Auth xato qilish = breach.
Security ekspert bilan bahslashma."

### Resolution
"Buy (Auth0):
1. Time to market critical
2. Security too important to DIY
3. Cost-effective at our scale
4. Migration possible later

Review in 1 year:
- If > $3000/mo → consider build
- If custom needs grow → consider build"
```

---

## Stakeholderlar Bilan Ishlash

### Technical Stakeholders

```markdown
## Discussion with Tech Lead/Architect

PREPARE:
- Data va benchmarks
- Alternative analysis
- Risk assessment
- Implementation plan

DISCUSS:
- "Men X taklif qilaman"
- "Y variantini ham ko'rib chiqdim, lekin Z sabab..."
- "Trade-off'lar shunday..."
- "Savollaringiz?"

BE OPEN:
- "Bu yaxshi point, men o'ylamagan edim"
- "Keling, birgalikda tahlil qilamiz"
```

### Non-technical Stakeholders

```markdown
## Discussion with PM/Business

TRANSLATE:
"Microservices" → "Mustaqil yangilanishlar mumkin"
"Database sharding" → "Ma'lumotlar tezroq topiladi"
"Async processing" → "Foydalanuvchi kutmaydi"

FOCUS ON:
- Business impact
- Timeline
- Cost
- Risk

AVOID:
- Jargon
- Implementation details
- "Trust me, it's better"
```

### Executive Stakeholders

```markdown
## Discussion with CTO/VP

EXECUTIVE SUMMARY:
"3 ta asosiy gap:

1. Muammo: Hozirgi tizim 10x traffic ko'tarmaydi
2. Yechim: Payment service'ni ajratamiz
3. Investment: 2 hafta dev, $500/mo infra

ROI: 99.99% uptime, PCI audit -60%, faster releases"

BE READY FOR:
- "Arzonroq variant bormi?"
- "Tezroq qilsak bo'ladimi?"
- "Risk nima?"
```

---

## Architecture Review

### Review Checklist

```markdown
## Functional Requirements
- [ ] Use case'lar to'liq cover qilinganmi?
- [ ] Edge case'lar hisobga olinganmi?

## Non-Functional Requirements
- [ ] Performance targets aniq?
- [ ] Scalability plan bor?
- [ ] Security considerations?
- [ ] Availability/SLA defined?

## Operational
- [ ] Monitoring/observability?
- [ ] Deployment strategy?
- [ ] Rollback plan?
- [ ] Disaster recovery?

## Cost
- [ ] Infra cost estimated?
- [ ] Dev time estimated?
- [ ] Ongoing maintenance cost?

## Team
- [ ] Team expertise sufficient?
- [ ] Training needed?
- [ ] Documentation plan?
```

### Giving Architecture Feedback

```markdown
## GOOD FEEDBACK

"X qism haqida savol:
Bu yerda synchronous call qilyapsiz.
Agar downstream service down bo'lsa, nima bo'ladi?

Taklif: Circuit breaker yoki async queue.
Masalan: [link to pattern]"

## BAD FEEDBACK

"Bu noto'g'ri, microservices qilish kerak"
(No reasoning, no alternative analysis)
```

---

## Do's and Don'ts

### DO's (Qiling)

```diff
+ Data bilan gapiring
  Benchmark, metrics, evidence

+ Alternatives taqdim qiling
  "3 ta variant bor, men X ni taklif qilaman"

+ Trade-off'larni acknowledge qiling
  "Bu yaxshi, lekin X cost bilan keladi"

+ Reversibility o'ylang
  "Bu qarorni keyinroq o'zgartirish mumkinmi?"

+ Document everything
  RFC, ADR, meeting notes

+ Incremental approach
  Big bang o'rniga phased rollout
```

### DON'Ts (Qilmang)

```diff
- "Trust me, this is better"
  Sabab bo'lmasa, ishontirmang

- Hype-driven decisions
  "Netflix qilyapti" = yetarli sabab emas

- Over-engineering
  YAGNI - You Ain't Gonna Need It

- Ignoring team constraints
  Team bilmasa, eng yaxshi tech ham yomon

- Analysis paralysis
  Perfect yo'q, decide and iterate

- Blame future problems on others
  "Siz approve qildingiz" - siz ham mas'ul
```

---

## Senior Developer Mindset

### 1. Context is King

```
"X yaxshimi yomon" → "X bizning kontekstda qanday?"

Startup'da: Tezlik > perfection
Enterprise'da: Stability > innovation
```

### 2. Reversibility Matters

```
Type 1 Decision: Irreversible (cloud provider)
→ Ko'p vaqt ajrating, chuqur tahlil

Type 2 Decision: Reversible (framework)
→ Tez decide, iterate
```

### 3. Communicate Uncertainty

```
"Bu ishlaydi" → "Bu 80% confidence bilan ishlaydi"
"Problem yo'q" → "Shu ma'lumotlar bilan problem ko'rmayapman"
```

### 4. Own Your Decisions

```
Qaror qabul qildingiz.
Keyinroq noto'g'ri chiqdi.

WRONG: "Boshqalar approve qildi"
RIGHT: "Men xato qildim. Nima o'rgandim va qanday tuzataman"
```

### 5. Know When to Stop Discussing

```
Discussion foydali.
Endless discussion foydali emas.

"Yetarli ma'lumot bor. Decision qilamiz.
2 hafta data yig'amiz. Kerak bo'lsa, o'zgartiramiz."
```

---

## Interview Savollari

### 1. "Katta arxitektura qarorini qanday qabul qilasiz?"

**Yaxshi javob:**
```
Men 5 bosqichda yondashaman:

1. REQUIREMENTS
   "Muammo nima? Success criteria nima?"

2. OPTIONS
   "Kamida 3 ta variant ko'raman"

3. ANALYSIS
   "Har birini trade-off matrix bilan tahlil"

4. DECISION
   "Bizning kontekstda eng mos variant"

5. DOCUMENTATION
   "RFC yoki ADR - kelajak uchun"

Misol: Oldingi loyihada database tanlash kerak edi.
PostgreSQL vs MongoDB vs CockroachDB.
Team expertise + ACID requirements = PostgreSQL.
ADR yozdik, 2 yildan keyin ham tushuniladi.
```

### 2. "Arxitektura qaroriga rozi bo'lmasangiz nima qilasiz?"

**Yaxshi javob:**
```
1. AVVAL TUSHUNAMAN
   "Nima uchun bu tanlov? Men nima bilmayman?"

2. O'Z POZITSIYAMNI TAQDIM QILAMAN
   "Mening concern: [X]. Evidence: [Y]"

3. MUHOKAMA QILAMAN
   "Trade-off'larni birga ko'rib chiqamiz"

4. DISAGREE AND COMMIT
   "Agar team/lead qaror qilsa - 100% support"

Lekin:
- Security risk bo'lsa - escalate
- Legal/compliance issue bo'lsa - escalate
- Clear unethical bo'lsa - refuse
```

### 3. "Microservices vs Monolith - qachon qaysi?"

**Yaxshi javob:**
```
MONOLITH:
- Kichik team (< 10)
- MVP/early stage
- Simple domain
- Tight deadline

MICROSERVICES:
- Multiple teams (2+ pizza rule)
- Independent scaling kerak
- Different tech stacks kerak
- Organizational boundaries aniq

MENING YONDASHUVIM:
"Monolith'dan boshla, kerak bo'lganda ajrat"

Warning signs:
- Deploy conflicts ko'p
- One module scaling kerak
- Team blocking each other
- Codebase too big to understand
```

### 4. "Qanday texnik qaror keyinroq noto'g'ri chiqdi?"

**Yaxshi javob:**
```
Bir loyihada NoSQL (MongoDB) tanlagan edik.

REASON: "Schema flexibility kerak"
REALITY: Data aslida relational edi

RESULT:
- Murakkab aggregation query'lar
- Data consistency muammolari
- Performance issues

LEARNINGS:
1. Data model'ni chuqur tahlil qilish
2. "Flexibility" = real requirement emasligini tekshirish
3. Team expertise'ni hisobga olish

WHAT I'D DO DIFFERENTLY:
PostgreSQL + JSONB for flexible parts
Best of both worlds
```

### 5. "RFC yozing deyilsa, qanday structure qilasiz?"

**Yaxshi javob:**
```
Men PRFAQ inspired structure ishlataman:

1. SUMMARY (2-3 jumla)
   "Bu RFC nima haqida?"

2. MOTIVATION
   "Nima muammo? Nima uchun hozir?"

3. DETAILED DESIGN
   "Qanday qilamiz?"

4. ALTERNATIVES
   "Boshqa yo'llar va nima uchun emas"

5. TRADE-OFFS
   "Yaxshi/yomon tomonlar"

6. RISKS & MITIGATION
   "Nima xato bo'lishi mumkin"

7. TIMELINE
   "Qachon tayyor?"

8. SUCCESS METRICS
   "Qanday o'lchaymiz?"

Key principle: Reader 5 daqiqada tushunishi kerak.
Details appendix'da.
```

---

## Amaliy Mashqlar

### Mashq 1: Trade-off Tahlil

E-commerce uchun search qilish kerak:
- Option A: PostgreSQL full-text search
- Option B: Elasticsearch
- Option C: Algolia (SaaS)

Trade-off matrix tuzing.

<details>
<summary>Javobni ko'rish</summary>

```
| Criteria        | PostgreSQL | Elasticsearch | Algolia |
|-----------------|------------|---------------|---------|
| Setup time      | +++        | ++            | +++     |
| Performance     | ++         | +++           | +++     |
| Features        | +          | +++           | +++     |
| Cost (startup)  | +++        | ++            | +       |
| Cost (scale)    | +++        | ++            | +       |
| Maintenance     | +++        | +             | +++     |
| Team expertise  | +++        | +             | ++      |
|-----------------|------------|---------------|---------|
| TOTAL           | 18         | 14            | 16      |

RECOMMENDATION: PostgreSQL for MVP
- Team knows it
- "Good enough" for < 100K products
- Migrate to Elasticsearch at scale
```
</details>

### Mashq 2: ADR Yozing

"Client-side rendering o'rniga Server-side rendering tanladik" uchun ADR yozing.

<details>
<summary>Javobni ko'rish</summary>

```markdown
# ADR-012: Use Server-Side Rendering (Next.js)

## Date
2024-02-01

## Status
Accepted

## Context

Building an e-commerce site with:
- SEO critical (product pages)
- 10K+ product pages
- Marketing landing pages
- Mobile users 60%

Options:
1. SPA (Vue/React) + prerender
2. SSR (Next.js/Nuxt)
3. Static generation (Gatsby/Astro)

## Decision

We will use Next.js with hybrid rendering:
- SSR for product pages (SEO + fresh data)
- SSG for marketing pages (speed)
- CSR for user dashboard (no SEO needed)

Reasons:
1. SEO - Google bot gets full HTML
2. Performance - fast first contentful paint
3. Flexibility - hybrid approach
4. Team - 2/3 devs know React

## Consequences

### Positive
- Better SEO (proven by Vercel case studies)
- Faster perceived performance
- Incremental adoption

### Negative
- Server cost (vs static hosting)
- More complex deployment
- Hydration considerations

### Neutral
- Build time increases (acceptable)
- Need Node.js server
```
</details>

---

## Xulosa

Arxitektura discussion - bu:

1. **Structured thinking** - options, trade-offs, risks
2. **Clear communication** - RFC, ADR, presentations
3. **Collaborative** - team input, stakeholder alignment
4. **Documented** - decisions survive people

> "Arxitektura = decisions that are hard to change.
> Make them carefully, document them always."

---

**Keyingi:** [Interview Tips](./06-interview-tips.md)
