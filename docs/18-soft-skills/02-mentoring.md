# Mentoring - Boshqalarni O'stirish San'ati

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchilar orasida yozilmagan qonun bor: "Siz o'z o'rningizga odam tayyorlamaguningizcha, sizni hech qachon lavozimingizni ko'tarishmaydi (Promote)". Chunki agar siz kompaniyadagi eng murakkab loyihani faqat o'zingiz tushunsangiz, sizni u yerdan hech kim ololmaydi (Lider bo'lolmaysiz). Juniorlarga ustozlik qilish (Mentoring) — bu o'z ustingizdan og'ir yukni olib tashlash, vaqtingizni arxitektura qurishga ajratish va Kompaniya ko'z o'ngida haqiqiy "Team Lead" darajasiga chiqishning yagona yo'lidir.

> [!NOTE]
> **Real-hayot analogiyasi: "Baliq va Qarmoq"**  
> Agar Junior "Menda shu xato chiqyapti, tuzatib bering" desa:  
> **Yomon Mentor (Baliq beradi):** "Qochib tur" deydi, o'zi klaviaturaga yopishib 5 minutda kodni to'g'rilab berib ketadi. Junior nima bo'lganini tushunmaydi va ertaga yana shu xato bilan keladi.  
> **Yaxshi Mentor (Qarmoq beradi):** O'zi kod yozmaydi. "Xatoni qayerdan qidirish kerakligini bilasanmi? Qani Network tabni och-chi, qanday Status Code kelyapti?" deb to'g'ri savollar beradi. Junior javobni O'ZI topadi va bu xatoni boshqa hech qachon takrorlamaydi.

Mentoring - bu tajribali dasturchi sifatida boshqalarni professional o'sishiga yordam berish. Bu nafaqat texnik bilim ulashish, balki **karera yo'nalishi, soft skills va muammolarni hal qilish usullarini** o'rgatish.
## Nega Mentoring Muhim?

### Senior Developer Uchun

```
1. Knowledge Consolidation
   O'rgatayotganda o'zingiz ham chuqurroq tushunasiz

2. Leadership Skills
   Mentoring - management'ga yo'l

3. Team Multiplication
   Siz 1 odam. 3 junior'ni o'stirsangiz = 4 odam kuchi

4. Legacy
   Siz ketganingizda bilim qoladi
```

### Junior Developer Uchun

```
1. Tez o'sish
   6 oy mentor bilan = 2 yil yolg'iz

2. Real-world knowledge
   Tutorial'da yo'q narsalar

3. Network
   Mentor orqali boshqa senior'lar bilan tanishish

4. Confidence
   "Men to'g'ri yo'ldaman" ishonchi
```

### Kompaniya Uchun

```
1. Retention
   Mentored developers 2x kam ketadi

2. Culture
   Bilim almashish madaniyati

3. Hiring
   "Bizda mentorship bor" - kuchli argument

4. Bus Factor
   Bir odam ketsa, loyiha to'xtamaydi
```

---

## Mentor Turlari

### 1. Technical Mentor
```
Fokus: Kod, arxitektura, best practices
Misol: "React'da state management qanday qilinadi?"
```

### 2. Career Mentor
```
Fokus: Karera yo'nalishi, o'sish
Misol: "Senior bo'lish uchun nima kerak?"
```

### 3. Peer Mentor
```
Fokus: Bir xil darajadagi hamkasblar bir-birini o'stiradi
Misol: Mid-level developer boshqa mid-level'ga CSS o'rgatadi
```

### 4. Reverse Mentor
```
Fokus: Junior senior'ga yangi texnologiyalarni o'rgatadi
Misol: Junior senior'ga TypeScript o'rgatadi
```

---

## Samarali Mentoring Metodlari

### 1. Socratic Method (Savol orqali o'rgatish)

```
YOMON:
Mentor: "Bu yerda useMemo ishlatish kerak"
Junior: "OK" (nima uchunligini tushunmadi)

YAXSHI:
Mentor: "Bu component sekin render bo'lyapti. Nima sabab bo'lishi mumkin?"
Junior: "Har renderda computeExpensiveValue qayta ishlaydi"
Mentor: "To'g'ri. Buni qanday optimize qilish mumkin?"
Junior: "Hmm... memoization?"
Mentor: "Ha! React'da buning uchun nima bor?"
Junior: "useMemo!"
```

**Nima uchun ishlaydi?**
- Junior O'ZI topadi, shuning uchun eslab qoladi
- Critical thinking rivojlanadi
- Keyingi muammoni ham o'zi hal qila oladi

### 2. Show, Don't Tell

```javascript
// YOMON: Faqat gapirish
"Redux'da actions, reducers va store bo'ladi..."

// YAXSHI: Birga qilish
"Keling, birga todo app qilamiz.
Avval store yaratamiz... endi action yozamiz...
Ko'ryapsanmi, dispatch qilganda reducer ishlaydi..."
```

### 3. Rubber Duck Debugging Extended

```
Junior: "Bu kod ishlamayapti, nima qilishni bilmayapman"

Mentor: "Menga tushuntir - bu kod nima qilishi kerak?"
Junior: "Bu fetch qiladi... keyin... hmm... aslida bu yerda await yo'q!"

// Junior muammoni o'zi topdi, tushuntirayotganda
```

### 4. Graduated Difficulty

```
Hafta 1: HTML/CSS static page
Hafta 2: JavaScript interactivity
Hafta 3: API integration
Hafta 4: State management
Hafta 5: Testing
...

Progressiv qiyinlashtirish - overwhelm qilmaslik
```

### 5. Pair Programming Sessions

```
Session 1: Mentor driver, junior navigator
Session 2: Junior driver, mentor navigator
Session 3: Junior driver, mentor faqat kuzatadi

Progressiv mustaqillik
```

---

## Mentoring Session Strukturasi

### 1-on-1 Meeting Template

```markdown
## Weekly 1-on-1 (30-45 daqiqa)

### 1. Check-in (5 min)
- Qanday o'tyapti?
- Biror muammo bormi?

### 2. Progress Review (10 min)
- O'tgan haftadagi maqsadlar
- Nima qildik?
- Nima qiynadi?

### 3. Learning Topic (15 min)
- Haftaning texnik mavzusi
- Amaliy mashq

### 4. Q&A (10 min)
- Junior'ning savollari

### 5. Next Steps (5 min)
- Keyingi hafta maqsadlari
- O'qish/qilish kerak narsalar
```

### Deep Dive Session (Murakkab mavzu)

```markdown
## Deep Dive: State Management (2 soat)

### Nazariya (30 min)
- State nima?
- Local vs Global state
- State management patterns

### Demo (30 min)
- Pinia setup
- Actions, Getters
- Devtools

### Hands-on (45 min)
- Junior o'zi qiladi
- Mentor kuzatadi va yordam beradi

### Review (15 min)
- Nima o'rgandik?
- Savollar
- Keyingi mavzu
```

---

## Real-World Misollar

### Misol 1: Junior Xatosini Tuzatish

**Vaziyat:** Junior production'ga bug merge qildi

```
YOMON YONDASHUV:
"Nima qilding! Butun production yiqildi!
Sen avval test qilishing kerak edi!"

↓

Junior: Qo'rqib ketadi, xato qilishdan qo'rqadi,
kamroq initiative oladi.
```

```
YAXSHI YONDASHUV:

1. AVVAL TUZATISH
   "Hozir birgalikda tuzatamiz"

2. KEYIN TAHLIL (blame-free)
   "Keling, nima bo'lganini ko'raylik.
   Bu xato qanday yuz berdi?"

3. TIZIMIY O'YLASH
   "Buni qanday oldini olish mumkin edi?
   CI'da test bo'lsaydi, ushlab qolarmidi?"

4. ACTION ITEM
   "Keling, birgalikda test yozamiz.
   Keyingi safar bunday bo'lmaydi"

↓

Junior: Xatosidan o'rganadi, qo'rqmaydi,
keyingi safar yaxshiroq qiladi.
```

### Misol 2: Stuck Bo'lgan Developer

**Vaziyat:** Junior 3 kun bir muammoni hal qila olmayapti

```
YOMON YONDASHUV:
"Ber menga, o'zim qilaman"

↓

Junior: O'rganmaydi, dependency bo'lib qoladi.
```

```
YAXSHI YONDASHUV:

1. MUAMMONI TUSHUNISH
   "Menga tushuntir, nima qilmoqchisan?"

2. QAYERDA QOTIB QOLDI
   "Qaysi qismda to'xtab qolding?"

3. DEBUGGING TOGETHER
   "Keling, console.log qo'yib ko'ramiz...
   Hmm, bu undefined. Nima uchun?"

4. HINT BERISH (JAVOB EMAS)
   "async/await ishlatganmisan? Promise chain'ga e'tibor ber"

5. JUNIOR O'ZI TOPADI
   "Ohhh, await qo'yishni unutibman!"

↓

Junior: Debugging qilishni o'rgandi,
keyingi muammoni o'zi hal qiladi.
```

### Misol 3: Code Review orqali O'rgatish

```javascript
// Junior PR yubordi
function getUsers() {
  let users = []
  fetch('/api/users')
    .then(res => res.json())
    .then(data => {
      users = data
    })
  return users  // MUAMMO: Promise hal bo'lmasdan return
}
```

**YOMON Review:**
```
"Bu noto'g'ri. async/await ishlatish kerak."
```

**YAXSHI Review:**
```markdown
Bu yerda asynchronous code bilan muammo bor.

Savollar:
1. `fetch` qachon tugaydi?
2. `return users` qachon ishlaydi?
3. `users` o'sha paytda nima qiymatga ega?

Maslahat: Konsolda `console.log(getUsers())` qilib ko'r.
Nima natija chiqadi?

Resource: [JavaScript Promises](link) o'qib chiq,
keyin birga gaplashamiz.
```

---

## Feedback Berish Texnikasi

### SBI Model (Situation-Behavior-Impact)

```
SITUATION: Kecha sprint planningda
BEHAVIOR: Sen task'ni break down qilmay, estimate berding
IMPACT: Bu task'ga 2 kun emas, 5 kun ketdi va sprint yiqildi

↓

Keyingi safar task'ni kichik qismlarga bo'lib,
har qismni alohida estimate qilsak yaxshi.
```

### Sandwich Method (Yaxshi-Yomon-Yaxshi)

```
YAXSHI: "PR strukturasi juda yaxshi, kichik focused commits"
YOMON: "Lekin error handling yo'q. Bu production'da muammo bo'ladi"
YAXSHI: "Test coverage 80%+ - bu ajoyib!"
```

**Diqqat:** Bu metod ba'zan manipulativ ko'rinishi mumkin.
Ishlatishda samimiy bo'ling.

### Direct Feedback (Senior uchun)

```
"Ahmad, bu kodda jiddiy security muammo bor.
SQL injection xavfi. Tuzatish kerak."

Senior'lar uchun sandwich shart emas.
To'g'ridan-to'g'ri va aniq bo'ling.
```

---

## Mentoring Challenges

### 1. Vaqt Yetishmasligi

```
MUAMMO: "Mening ishim ham bor, qanday mentor bo'lay?"

YECHIM:
1. Calendar'da fixed slot (masalan, juma 16:00)
2. Asinxron mentoring (PR review, documentation)
3. Grouped sessions (3 junior birga)
4. Self-service resources (wiki, video)
```

### 2. Junior Initiative Olmayapti

```
MUAMMO: "Junior faqat aytganimni qiladi, o'zi harakat qilmaydi"

YECHIM:
1. Aniq maqsadlar qo'ying
2. Mustaqil research topshiring
3. "Men bilmayman, sen qidir" deying
4. Natijani e'tirof eting
```

### 3. Bilim Farqi Juda Katta

```
MUAMMO: "Junior hali juda boshlovchi, nimadan boshlashni bilmayapman"

YECHIM:
1. Current level'ni aniqlang
2. Learning path yarating
3. Kichik, achievable goals
4. Har o'sishni celebrate qiling
```

### 4. Junior Qabul Qilmayapti

```
MUAMMO: "Junior mening maslahatimni qabul qilmayapti"

YECHIM:
1. "Nima uchun?"ni tushuntiring
2. O'zingiz amalga tatbiq qilganingizni ko'rsating
3. Majburlamang - tanlov bering
4. Consequences ko'rsating (yaxshi va yomon)
```

---

## Do's and Don'ts

### DO's (Qiling)

```diff
+ Sabr qiling
  Junior 3 soatda qilsa, siz 30 daqiqada qilardingiz.
  Bu normal.

+ Xavfsiz muhit yarating
  "Stupid savol yo'q. Savol ber."

+ O'zingizning xatolaringizni ulashing
  "Men ham bir paytlar production'ni yiqitganman"

+ Progress'ni recognize qiling
  "2 oy oldin bu qiyin edi. Hozir oson ko'rinyapti!"

+ Mustaqillikni rag'batlantiring
  "Sen nima deb o'ylaysan?"

+ Written record saqlang
  1-on-1 notes, learning path, progress
```

### DON'Ts (Qilmang)

```diff
- O'zingiz qilmang
  "Tezroq bo'ladi" deb o'zingiz yozsangiz,
  junior o'rganmaydi

- Blame qilmang
  "Sen buzmasan!" - bu qo'rquv yaratadi

- Compare qilmang
  "Boshqa junior 1 haftada o'rgandi" - demotivate

- Perfectionism talab qilmang
  Junior = learning. Xatolar normal.

- Savol uchun judge qilmang
  "Bu ham bilmaysanmi?" - savol berishni to'xtatadi

- Micromanage qilmang
  Har qadamni nazorat qilmang
```

---

## Mentoring Plan Yaratish

### 30-60-90 Day Plan

```markdown
## 30 Kunlik Plan: Foundation

### Week 1-2: Environment Setup
- [ ] Dev environment
- [ ] Git workflow
- [ ] Project structure tushunish
- [ ] First small PR

### Week 3-4: Core Skills
- [ ] Codebase'ni o'rganish
- [ ] Simple bug fix
- [ ] Code review qabul qilish
- [ ] Team processes

---

## 60 Kunlik Plan: Contribution

### Week 5-6: Feature Development
- [ ] Kichik feature implement
- [ ] Testing basics
- [ ] Documentation yozish

### Week 7-8: Independence
- [ ] Mustaqil task olish
- [ ] PR review berish
- [ ] On-call rotation (shadowing)

---

## 90 Kunlik Plan: Ownership

### Week 9-10: Complexity
- [ ] Murakkab feature
- [ ] Performance optimization
- [ ] Bug triage

### Week 11-12: Leadership
- [ ] Mini-presentation
- [ ] New hire onboarding yordam
- [ ] Technical decision making
```

### Skills Matrix

```markdown
| Skill | Start | 30-day | 60-day | 90-day |
|-------|-------|--------|--------|--------|
| Git | 1 | 3 | 4 | 5 |
| Vue.js | 2 | 3 | 4 | 4 |
| Testing | 1 | 2 | 3 | 4 |
| API Design | 1 | 2 | 3 | 3 |
| Code Review | 1 | 2 | 3 | 4 |
| Communication | 2 | 3 | 3 | 4 |

Scale: 1 (beginner) - 5 (expert)
```

---

## Senior Developer Mindset

### 1. Multiplier Thinking

```
Yolg'iz: 1 odam = 1x output

Mentor sifatida:
- 1 mentor + 3 junior (6 oy keyin)
- = 1 + 0.5 + 0.5 + 0.5 = 2.5x output

1 yildan keyin:
- Junior'lar mid-level bo'ladi
- = 1 + 0.8 + 0.8 + 0.8 = 3.4x output
```

### 2. Long-term Investment

```
"Menga yordam berganingiz uchun rahmat.
5 yildan keyin men ham birovga yordam beraman."

↓

Knowledge chain davom etadi.
```

### 3. Ego Check

```
"Men senior'man, men yaxshiroq bilaman"

↓

"Men tajribaliман, lekin junior'dan ham o'rganaman.
Fresh perspective muhim."
```

### 4. Patience is a Skill

```
Junior 5-chi marta bir xil savolni so'radi.

WRONG: "Buni aytdim-ku!"
RIGHT: "Keling, yana ko'raylik. Bu safar yozib qo'y."
```

---

## Interview Savollari

### 1. "Mentoring tajribangiz bormi?"

**Yaxshi javob:**
```
Ha, oxirgi kompaniyada 2 ta junior bilan ishladim.

Birinchisi web development'ga yangi edi.
3 oylik learning path yaratdim:
- HTML/CSS fundamentals
- JavaScript basics
- Vue.js introduction

Haftalik 1-on-1 qilardik. 6 oydan keyin
u mustaqil feature implement qila boshladi.

Eng qiyin qismi - sabr qilish va
"o'zim qilsam tezroq" degan fikrni yengish edi.
```

### 2. "Junior developer'ga texnik konsept'ni qanday tushuntirasiz?"

**Yaxshi javob:**
```
Men "explain like I'm 5" yondashuvini ishlataman.

Masalan, API'ni tushuntirish:
"Restoranga borasan. Ofitsiant bor - u sening buyurtmangni
oshpazga yetkazadi. Sen oshxonaga kirmaysan.
API ham shunday - frontend va backend o'rtasidagi ofitsiant."

Keyin real kodda ko'rsataman.
Keyin junior o'zi qilib ko'radi.
```

### 3. "Junior progress qilmayotganda nima qilasiz?"

**Yaxshi javob:**
```
Avval root cause'ni topadim:
- Tushunmayaptimi?
- Motivatsiya yo'qmi?
- Shaxsiy muammolar bormi?

Keyin action:
1. Learning style'ni o'zgartirish (video vs text vs hands-on)
2. Maqsadlarni kichiklashtirish (overwhelm bo'lmasin)
3. 1-on-1 da ochiq gaplashish
4. Zarur bo'lsa, boshqa mentor jalb qilish

Ba'zan kimdir noto'g'ri role'da. Bu ham normal.
```

### 4. "Ko'p vaqt oladi. Qanday balance qilasiz?"

**Yaxshi javob:**
```
Mentoring - investment, expense emas.

Strategiyam:
1. Fixed time slot (juma 2 soat)
2. Async mentoring (PR review, docs)
3. Group sessions (3 junior birga)
4. Self-service resources yaratish

6 oydan keyin junior mustaqil bo'ladi.
O'sha 2 soat qaytadi.
```

### 5. "Eng qiyin mentoring tajribangiz?"

**Yaxshi javob:**
```
Bir junior bor edi, juda defensiv edi.
Har feedback'ga "lekin..." derdi.

Men yondashuvimni o'zgartirdim:
1. Avval uning fikrini so'radim
2. "Sen nima deb o'ylaysan?" dedim
3. Tanqid o'rniga savollar berdim

2 oydan keyin ochilib ketdi.
Muammo menda edi - men directive emas,
collaborative bo'lishim kerak edi.
```

---

## Mentoring Resources

### Kitoblar
- "The Manager's Path" - Camille Fournier
- "Radical Candor" - Kim Scott
- "Coaching Habit" - Michael Bungay Stanier

### Online
- [https://www.mentoring.org](https://www.mentoring.org)
- [Engineering Management resources](https://github.com/charlax/engineering-management)

### Templates
- [1-on-1 Template](https://github.com/LappleApple/awesome-leading-and-managing)
- [Learning Path Templates](https://roadmap.sh)

---

## Xulosa

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Javobni Aytmang, Yo'l Ko'rsating:** Mentoring bu darslik emas. "Miyaga sarmoya" tamoyilidan foydalaning. Menti (o'quvchi) savol berganda: "Sening fikring qanday?", "Documentation da bu haqida nima deyilgan ekan?", "Qaysi usullarni sinab ko'rding?" kabi Sokratik savollar bering.
2. **Kichik Yutuqlarni Nishonlang (Praise):** Junior dasturchilar ko'pincha "Imposter Syndrome" (O'zini noloyiqlik hissi) bilan og'riydi. Ularning to'g'ri yozgan kichik kodini yoki to'g'ri bergan savolini albatta Jamoa oldida maqtab qo'ying. Bu ularga juda katta motivatsiya beradi.
3. **Vaqtni Chegaralang (Timeboxing):** "Men har doim yordamga tayyorman" deyish xato, chunki o'z ishingiz qolib ketadi. O'rnatilgan qoidalar qiling: "Agar 15 daqiqa o'zingiz izlab yechim topolmasangiz, keyin menga murojaat qiling". Bu ularni mustaqil izlanishga (Googling) majbur qiladi.

---

## Xulosa

| Yondashuv | Yomon Mentor (Micromanager) | Yaxshi Mentor (Leader) |
|-----------|-----------------------------|------------------------|
| **Xatoga munosabat** | Asabiylashadi, "Men senga shuni aytgandimku" deydi. | Xatodan dars chiqarishiga yordam beradi. "Buni qanday qilib takrorlamaslik mumkin?" |
| **Yordam berish** | Uning o'rniga kodni o'zi yozib tashlaydi. | Ekranini ulashib, o'quvchining o'ziga yozdiradi (Pair Programming). |
| **Maqsad** | "Loyiha tezroq bitsin". | "Loyiha ham bitsin, jamoam a'zosi ham kuchaysin". |
| **Fikr bildirish** | Faqat texnik xatolarni aytadi. | Arxitektura, Jamoa madaniyati va Soft Skilllar bo'yicha ham yo'l ko'rsatadi. |

Mentoring - bu:
1. **Sabr** - progress sekin bo'lishi mumkin
2. **Investment** - vaqt sarflaysiz, keyinroq qaytadi
3. **Ikki tomonlama** - siz ham o'rganasiz
4. **Mas'uliyat** - boshqaning karerasi

> "Yaxshi mentor - bu boshqalar muvaffaqiyatidan xursand bo'ladigan odam. Haqiqiy Liderning maqsadi ergashuvchilar yig'ish emas, o'zidan zo'rroq Liderlar yetishtirishdir."

---

**Keyingi:** [Task Breakdown](./03-task-breakdown.md)
