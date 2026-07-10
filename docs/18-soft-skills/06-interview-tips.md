# Interview Tips - Texnik Intervyudan Muvaffaqiyatli O'tish

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Intervyu — bu Dasturchining "Sotuv (Sales) jarayoni"dir. Sizning texnik bilimlaringiz juda zo'r bo'lishi mumkin, lekin agar uni Intervyu paytida sotishni bilmasangiz, sizdan ko'ra texnik bilimi pastroq, lekin intervyuda o'zini yaxshi ko'rsatgan boshqa nomzod ishga qabul qilinadi. Senior dasturchi bo'lish uchun Intervyudan o'tishni ham, Intervyu olishni ham (Interviewing) chuqur bilish talab qilinadi. Kompaniyaga kirish yoki yangi a'zoni jamoaga qabul qilish butun loyiha taqdirini hal qiladi.

> [!NOTE]
> **Real-hayot analogiyasi: "Birinchi Uchrashuv (First Date)"**  
> Intervyu huddi birinchi uchrashuvga o'xshaydi.  
> Agar siz doim o'zingizni maqtasangiz, qarshingizdagiga savol bermasangiz yoki u sizga savol berganda qisqa "Ha/Yo'q" deb o'tiraversangiz, ikkinchi uchrashuv (Next Stage) bo'lmaydi. Kompaniya sizni intervyu qilganda faqat "JS ni biladimi?" deb emas, "Bu odam bilan har kuni 8 soat ishlash yoqimlimi? Agar qiyin muammo chiqsa u qanday yo'l tutadi?" deb baholaydi. Shuning uchun "Madaniyat (Culture Fit)" va muammoga yondashuv (Problem Solving) ko'pincha kodning o'zidan ham muhimroqdir.

```mermaid
graph TD
    Start(Intervyu Boshlandi) --> Q1{Behavioral\n(Xulq-atvor)}
    Q1 -->|Yomon| Fail1[Rad etildi\nCulture Fit emas]
    Q1 -->|STAR Metodi| Q2{Technical\n(Nazariya)}
    
    Q2 -->|Bilmayman| Fail2[Rad etildi\nBilim past]
    Q2 -->|Trade-offlar| Q3{Live Coding\n(Amaliyot)}
    
    Q3 -->|Jim yozish / Xato| Fail3[Rad etildi\nCommunication yo'q]
    Q3 -->|Ovozli fikrlash| Q4{Nomzodning\nSavollari}
    
    Q4 -->|Savol yo'q| Pass1[Qabul qilinishi mumkin\n(Junior)]
    Q4 -->|Arxitektura / Tech Debt| Pass2[Offer!\n(Senior yondashuv)]
    
    style Start fill:#e1bee7,stroke:#8e24aa
    style Fail1 fill:#ffcdd2,stroke:#d32f2f
    style Fail2 fill:#ffcdd2,stroke:#d32f2f
    style Fail3 fill:#ffcdd2,stroke:#d32f2f
    style Pass1 fill:#bbdefb,stroke:#1976d2
    style Pass2 fill:#c8e6c9,stroke:#388e3c
```

Texnik intervyu - bu nafaqat kod yozish imtihoni, balki **muammolarni hal qilish, kommunikatsiya va professional mindset** ko'rsatish imkoniyati hisoblanadi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

### Intervyu Turlari
Dasturchilar intervyusi asosan 3 qismdan iborat bo'ladi:
1. **Behavioral (Xulq-atvor):** "O'zingiz haqingizda gapirib bering", "Qiyin vaziyatda nima qilasiz?". Maqsad - sizning fe'l-atvoringiz jamoaga tushishini tekshirish.
2. **Technical (Texnik savollar):** "Event Loop nima?", "React va Vue farqi?". Nazariy bilimlarni tekshirish.
3. **Live Coding (Jonli kodlash) yoki Take-home (Uyga vazifa):** Amaliyotda kodni qanday yozishingizni ko'rish.

### STAR Metodi
Behavioral savollarga ("Qiyin muammoni qanday yechgansiz?") javob berishning Oltin qoidasi:
- **S (Situation):** Vaziyatni tushuntiring ("Oldingi loyihamda API juda sekin ishlayotgan edi").
- **T (Task):** Sizning vazifangiz nima edi? ("Menga shu sahifani tezlashtirish vazifasi tushdi").
- **A (Action):** Nima ish qildingiz? ("Men Profiling qilib ko'rdim va N+1 xatosi borligini topib, backendga murojaat qildim").
- **R (Result):** Natija nima bo'ldi? ("Natijada sahifa 3 soniya o'rniga 200 millisoniyada ochiladigan bo'ldi").

---

## 🟡 Middle (Amaliyot va Detallar)

### Live Coding (Jonli kodlash) Qoidalari
Intervyuer sizga "Arraydagi eng katta ikkinchi raqamni topuvchi funksiya yozing" deb topshiriq berdi.
- **Xato yondashuv:** Indamay, jim turib kod yozishni boshlab ketish. Oxirida "Mana bo'ldi" deyish.
- **To'g'ri yondashuv (Ovoz chiqarib o'ylash):**
  1. *Savol berish:* "Array ichida manfiy sonlar ham bo'lishi mumkinmi? Bo'sh array kelsa nima qaytaraman?"
  2. *Reja qilish:* "Men hozir avval arrayni sortirovka qilib, keyin 2-elementni olishim mumkin. Lekin bu O(N log N) vaqt oladi. Yaxshisi tsikl bilan aylanib chiqaman O(N)."
  3. *Kodlash:* Kod yozayotganda nima qilayotganingizni gapirib turing.

### Texnik Savollarga Chuqur Javob Berish
"Redux (yoki Pinia) nima?" degan savolga:
- *Junior javobi:* "Bu state menejer. Ma'lumotlarni saqlash uchun ishlatiladi."
- *Middle javobi:* "Bu global state menejer. Prop drilling muammosini hal qilish uchun kerak. Lekin uni hamma narsaga ishlatavermaslik kerak, masalan formadagi input qiymatlari uchun local state yaxshiroq." (Trade-offlarni, ya'ni qachon ishlatish va qachon ISHLATMASLIK ni bilishingizni ko'rsating).

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### System Design Interview (Tizim Arxitekturasi)
Senior darajasida sizdan "Twitter ning Frontend arxitekturasini qanday qurasiz?" deb so'rashadi.
Siz kod yozmaysiz, balki oq doskada tizim chizasiz.
1. **Requirements (Talablarni aniqlash):** "Kuniga nechta foydalanuvchi kiradi? Offline rejim kerakmi? Xabarlar real-time (WebSocket) keladimi yoki Polling orqalimi?"
2. **High-Level Design:** API Gateway qayerda turadi, Frontend qaysi freymvorkda (Next.js SSR vs React SPA) bo'ladi, CDN dan qanday foydalaniladi?
3. **Bottlenecks (Muammoli nuqtalar):** "Agar bir vaqtda 1 million kishi kirsa Node.js serverimiz bardosh bermaydi, shuning uchun Load Balancer va Redis Cache qo'yishimiz kerak".

### Interviewing (Intervyu Olish)
Senior sifatida siz kompaniyaga yangi kadrlarni suhbatdan o'tkazasiz.
- Diktator bo'lmang. Intervyu - bu stress. Nomzodga yordam bering, hintlar (ishoralar) bering.
- Uning xotirasini emas (masalan "CSS da position ning nechta xususiyati bor?"), muammo yechish qobiliyatini tekshiring ("Katta fayl yuklanayotganda brauzer qotib qolmasligi uchun nima qilasiz?").

### Intervyuerga Savollar Berish (Teskari intervyu)
Suhbat oxirida "Sizni savollaringiz bormi?" deyilganda, haqiqiy Senior shunday savollar beradi:
- "Jamoangizda Code Review madaniyati qanday shakllangan?"
- "Technical Debt (Texnik qarzlar) bilan qanday kurashasizlar? Refactoring uchun sprintda vaqt ajratiladimi?"
- "Arxitektura qarorlari kim tomonidan va qanday qabul qilinadi?"

---

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

Interview muvaffaqiyati = **Preparation (Tayyorgarlik) + Communication (Muloqot) + Mindset (To'g'ri fikrlash)**

> "Interview - bu ikki tomonlama uchrashuv. Siz ham kompaniyani baholayapsiz, ular ham sizni."
