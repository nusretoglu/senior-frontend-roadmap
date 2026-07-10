# DevTools va Workflow (Asboblar va Ish jarayoni)

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Bugungi kunda qanchalik zo'r kod yozishingizdan qat'iy nazar, agar o'sha kodni boshqalar (Jamoa) bilan to'qnashuvlarsiz birlashtira olmasangiz (Git), uni avtomatik serverga jo'nata olmasangiz (CI/CD) va dasturni barcha xodimlarning kompyuterida bir xil ishlaydigan muhitga o'ray olmasangiz (Docker), sizni qimmatbaho Senior deb hisoblashmaydi. DevTools va Workflow bu shunchaki "yordamchi vositalar" emas, bu butun boshli loyiha "Infratuzilmasi" dir.

> [!NOTE]
> **Real-hayot analogiyasi: "Oshpaz va Oshxona"**  
> Zo'r algoritmlar va Vue/React bilimlari — bu oshpazning mazali taom pishira olish mahoratidir.  
> Lekin DevTools (Git, Docker, CI/CD) — bu 100 ta odamga taom chiqarish kerak bo'lgan katta restoran oshxonasidagi Infratuzilmadir (muzlatgichlar tizimi, mahsulotlarni avtomatik konveyerdan yetkazib berish, buyurtmalarni oshpazlarga to'g'ri taqsimlash). Taomingiz qanchalik maza bo'lmasin, konveyer (Workflow) ishlamasa, restoran (Loyiha) bankrot bo'ladi.

Zamonaviy web dasturlash faqat kod yozishdan iborat emas. Professional dasturchi "Version Control", avtomatlashtirish, qadoqlash (Containerization) kabi "Developer Tools" larni professional darajada bilishi kerak. Bu bo'lim sizni oddiy kod yozuvchidan Haqiqiy Muhandis darajasiga olib chiqadigan jarayonlarni o'rgatadi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

### Nima nima uchun kerak?
Junior dasturchi sifatida siz avvalo jamoaviy ishlash qoidalarini va "qanday qilib loyihani o'z kompyuterimda yurgizaman?" degan savolni hal qilishingiz kerak:
- **Git / GitHub:** Jamoa bitta fayl ustida urushib qolmasdan birgalikda ishlashi uchun mo'ljallangan kod xotirasi.
- **npm / yarn:** Boshqa aqlli dasturchilar yozib qo'ygan "Tayyor kod qismlari" (Kutubxonalar) ni loyihaga ko'chirib olish va o'rnatish vositasi (Package Manager).
- **VS Code Setup:** Tez va xatosiz kod yozish uchun muharrirni (IDE) to'g'ri moslash.

### Bo'lim Tarkibi

| # | Mavzu | Tavsif |
|---|-------|--------|
| 01 | [Git Advanced](./01-git-advanced.md) | Faqat `commit` va `push` emas, balki konfliktlarni yechish, Branching strategiyalari. |
| 02 | [CI/CD](./02-ci-cd.md) | Kodni yozib bo'lgach, uni avtomatik Serverga (Jonli saytga) chiqarib yuborish konveyeri. |
| 03 | [Docker Basics](./03-docker-basics.md) | Loyihani Windows, Mac va Linux da bir xil ishlatish uchun "Konteynerga qadoqlash". |
| 04 | [Package Managers](./04-package-managers.md) | npm, Yarn, pnpm va ularning xotirani boshqarish sirlari. |

---

## 🟡 Middle (Amaliyot va Detallar)

### Avtomatlashtirish (Automation)
Middle dasturchining asosiy dushmani - bu har kuni takrorlanuvchi ishlarni "qo'lda" qilishdir. O'z ishini avtomatlashtirish (Workflow) eng muhim qadamdir:
- **Linter va Formatter:** Jamoaning hamma a'zosi bir xil standartda kod yozishi uchun kompyuterga Prettier va ESLint qo'yish (va ularni commit qilishdan oldin ishlashga majburlash - *Husky / pre-commit hooks*).
- **Code Review:** Do'stingizning kodini Master branchga o'tib ketishidan oldin Pull Request (PR) orqali tekshirish.
- **Lock fayllar:** `package-lock.json` yoki `yarn.lock` nima uchun muhimligini tushunish (Hech qachon lock faylni o'chirib yubormang, aks holda boshqa kompyuterda sayt ishlashdan to'xtaydi!).

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### Jamoaviy Strategiyalar
Senior muhandis butun boshli loyihaning "Qon aylanish tizimini" (Pipeline) loyihalaydi:
1. **Branching Strategy:** Loyihada "GitFlow" (Qat'iy release tizimi) ishlatamizmi yoki "Trunk-based" (Tezkor va xavfli) strategiyasimi?
2. **Containerization (Docker):** Bizning Frontend dasturimiz Node.js o'rnatilmagan serverda ham ishlashi kerak. Buning uchun 10 MB lik minimal "Alpine Linux" konteyneri ichiga Nginx va bizning Vue/React kodni joylab bitta Docker Image yasaymiz.
3. **Monorepo (TurboRepo / Nx):** Agar bizda "Foydalanuvchilar Sayti", "Admin Panel" va "Haydovchilar IlovasI" bo'lsa, ularni 3 ta alohida repoda emas, 1 ta katta Monorepo da saqlab, UI-Kit ni hammasiga bitta joydan ulashib beramiz.

### Intervyu Savollari (Qiyin daraja)
**1. `npm install` va `npm ci` o'rtasidagi farq nima? Serverda CI/CD uchun qaysi birini ishlatasiz?**
*Javob:* 
- `npm install` hozirgi `package.json` dagi versiyalarga qarab eng yangi mos minor versiyalarni tortib oladi va ehtimol `package-lock.json` ni ham o'zgartirib yuborishi mumkin. Bu lokal kompyuterda ishlatiladi.
- `npm ci` (Clean Install) esa faqatgina va qat'iy ravishda `package-lock.json` dagi aniq versiyalarni o'rnatadi, hech narsani yangilamaydi. Serverda (CI/CD konveyerida) har doim `npm ci` ishlatilishi shart, aks holda oldindan test qilinmagan kutubxona versiyasi serverga tushib saytni buzadi.

**2. Docker da Multi-stage build nima va nega Frontend loyihalarga u muhim?**
*Javob:*
Multi-stage build Docker image ni juda kichik qilish uchun kerak. 1-bosqichda bizga katta Node.js (qariyb 1GB) kerak bo'ladi (Kutubxonalarni o'rnatib `npm run build` qilish uchun). 2-bosqichda biz o'sha Node ni tashlab yuboramizda, faqat eng yengil Nginx (10MB) serverini olib, uning ichiga 1-bosqichdagi faqat tayyor `dist` papkasini solamiz. Natijada Production serveriga 1 Gb lik og'ir yuk emas, 15 MB lik yengilgina Nginx yuboriladi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Terminal bilan do'stlashing:** Barcha GUI (sichqonchali) dasturlar qulay bo'lishi mumkin, lekin haqiqiy Senior dasturchi buyruqlarni CLI (Command Line) orqali tez yozadi va kerakli jarayonni bash script lari bilan avtomatlashtira oladi.
2. **Commitlarni tushunarli yozing (Conventional Commits):** `fixed bug`, `updated` kabi xabarlar o'rniga `fix(auth): solved token expire issue` deb aniq va standartlangan Git komandalarini yozishga odatlaning.
3. **CI/CD dagi "Tez qulash" qoidasi:** Serverdagi tekshiruvlar uzoq vaqt olmasligi kerak. Pipeline da oldin 5 soniya oluvchi eng tez Linter tekshiruvi, keyin Unit testlar, keyin Build qo'yiladi. Linter o'tmagan bo'lsa Build gacha yetib bormasligi va pulni / vaqtni tejashi kerak.

---

## Xulosa

| Jarayon | Qaysi muammoni yechadi? | Kim uchun? |
|---------|------------------------|------------|
| **Git / GitHub** | Bizning kodlarimiz kim qachon o'zgartirganini saqlovchi arxiv va jamoa muzokarasi joyi. | Barcha darajadagi dasturchilar |
| **Package Managers** | Chet eldan olib kelinadigan tayyor kodlar (Kutubxonalar) ro'yxatini to'g'ri o'rnatish. | Junior / Middle |
| **CI / CD** | Qo'lda test qilish va serverga FTP orqali yuklashdek azoblardan qutqaradi. Konveyer! | Middle / Senior |
| **Docker** | "Mening kompyuterimda ishlagandi, serverda ishlamayapti" muammosining 100% yechimi. | Senior |

Siz kodingizni qanchalik tez yoza olganingiz bilan emas, uni qanchalik sifatli Infratuzilma orqali yashab qolishini (Maintainability) ta'minlaganingiz bilan qadrlanasiz. Keyingi qadamda [Git Advanced](./01-git-advanced.md) ga kiring va kodni qutqarish (Revert, Bisect) sirlarini o'rganing.
