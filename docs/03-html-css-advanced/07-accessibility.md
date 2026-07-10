# Web Accessibility (A11y)

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Ko'plab yosh dasturchilar Accessibility (A11y) ni e'tiborsiz qoldirishadi va buni "faqat ko'zi ojizlar uchun" deb o'ylashadi. Aslida esa yomon contrast, juda kichik matnlar yoki klaviatura orqali ishlamaydigan menyular oddiy foydalanuvchilarni ham asabiylashtiradi. AQSh va Yevropada A11y qoidalariga rioya qilmagan saytlar ustidan sudga berish holatlari ko'paygan. Yaxshi A11y - bu qo'shimcha ish emas, bu sifat belgisidir.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Accessibility (A11y)** — Veb-saytni barcha turdagi insonlar (ko'zida, qulog'ida yoki harakatlanishida muammosi borlar) ham ishlata olishini ta'minlash qoidalari. "A" va "y" harflari orasida 11 ta harf bo'lgani uchun qisqacha A11y deyiladi.
**Screen Reader** — Ekranda nima borligini va qayerga bosish mumkinligini ko'zi ojizlarga ovoz chiqarib o'qib beruvchi dastur (Androidda TalkBack, iOS da VoiceOver).

> [!NOTE]
> **Hayotiy o'xshatish: "Pulsiz Eshik va Zina"**  
> Veb-saytingizni do'kon deb tasavvur qiling. Agar siz do'kon eshigi oldiga zina qo'yib, pandus (kolyaskalar uchun nishab yo'l) qo'ymasangiz, imkoniyati cheklangan mijozlarni yo'qotasiz. Web accessibility ham raqamli "pandus"dir. Klaviatura orqali saytni boshqarish (Tab tugmasi), ekran o'quvchilar (Screen readers) uchun ko'rinmas matnlar (alt tags) sizning raqamli do'koningiz eshigini hamma uchun ochiq qiladi.

### Sodda Misol (Semantik HTML o'zi kifoya)
A11y ning 80% qismi shunchaki to'g'ri HTML teglarini ishlatish bilan yopiladi.
```html
<!-- YOMON: Screen reader buni shunchaki "matn" deb o'qiydi. Unga bosib bo'lishini bilmaydi -->
<div class="tugma" onclick="saqlash()">Saqlash</div>

<!-- YAXSHI: Brauzer o'zi buni interaktiv elementligini va Tab orqali focus qilish mumkinligini biladi -->
<button onclick="saqlash()">Saqlash</button>
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Klaviatura bilan Navigatsiya (Keyboard Navigation)
Ko'p insonlar sichqonchadan foydalana olmaydi. Ular saytda faqat `Tab` tugmasi bilan harakatlanadi.

```css
/* YOMON: Dizaynni buzmasligi uchun ko'plab dasturchilar buni o'chirib qo'yishadi */
*:focus { outline: none; }

/* YAXSHI: Klaviatura bilan kelganda element ajralib turishi shart! */
:focus-visible {
  outline: 3px solid blue;
  outline-offset: 2px;
}
```

### Ranglar Kontrasti (Color Contrast)
Matn fonga nisbatan aniq o'qilishi kerak. WCAG standartiga ko'ra matn va fonning ranglar farqi kamida 4.5:1 bo'lishi shart. Oq fonga och kulrang yozuv yozish eng ko'p qilinadigan xatodir.

### Rasmlar va Formulalar (Alt Text & Labels)
Rasmlarni ko'ra olmaydigan insonlar uchun `alt` (muqobil matn) yozish shart.
```html
<!-- YAXSHI: Nima ekanligini tasvirlaymiz -->
<img src="mushuk.jpg" alt="Qora mushukcha o't ustida uxlab yotibdi">

<!-- DEKORATIV: Agar rasm faqat chiroyli dizayn uchun bo'lsa, alt bo'sh qoldiriladi -->
<img src="chiziq.png" alt=""> 

<!-- INPUTLAR: Har bir inputning o'ziga bog'langan qattiq yorlig'i bo'lishi kerak -->
<label for="ism">Ismingiz:</label>
<input type="text" id="ism" name="ism">
```

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### ARIA (Accessible Rich Internet Applications)
Bazan HTML ning o'zida tayyor teglar yo'q bo'ladi (masalan Tab, Modal, Dropdown). Ana shunday murakkab vidjetlar yasaganda JS bilan birga ARIA atributlarini boshqarishingiz kerak.
**Oltin qoida:** "Hech qanday ARIA yozmagan ma'qulroq, noto'g'ri ARIA yozgandan ko'ra".

```html
<!-- Maxsus yasalgan Modal (Popup) misoli -->
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Haqiqatdan ham o'chirasizmi?</h2>
  <button aria-label="Modaldan chiqish">X</button>
</div>
```

### Focus Trap (Qopqon)
Foydalanuvchi Modal (Popup) ochganida, uning klaviaturasi (`Tab`) modalning ichiga qulflanib qolishi kerak. Agar qulflanmasa, foydalanuvchi orqa fondagi (saytning o'zidagi) tugmalarni bosib yuborishi mumkin. Buni JS da `Focus Trap` yasash orqali hal qilinadi. Shuningdek, `Escape` tugmasi modallarni yopishga xizmat qilishi shart.

### Intervyu Savollari (Qiyin daraja)
**1. `aria-hidden="true"` va `display: none` o'rtasidagi farq nima?**
*Javob:* `display: none` elementni sahifadan butunlay olib tashlaydi (hech kim ko'rmaydi, Screen Reader ham o'qimaydi). `aria-hidden="true"` esa elementni ekranda oddiy odamlarga ko'rsataveradi, lekin Screen Reader ga "buni ko'zi ojizlarga o'qib berma, bu shunchaki dekoratsiya" deb uqtiradi. Bu asosan yonib-o'chadigan ikonkalarda (SVG) ishlatiladi.

**2. `aria-label`, `aria-labelledby` va `aria-describedby` qachon qaysi biri ishlatiladi?**
*Javob:* 
- `aria-label`: Elementning ichida yozuv bo'lmaganda o'ziga nom berish (Masalan bitta "X" rasmli tugmaga `aria-label="Yopish"` berish).
- `aria-labelledby`: Elementning nomi boshqa joyda yozilgan bo'lsa, o'sha yozuvning ID sini bog'lab qo'yish (Masalan Modal o'zining ichidagi `<h2>` ga bog'lanishi).
- `aria-describedby`: Asosiy nomdan tashqari qo'shimcha tushuntirish berish (Masalan, parol kiritish maydonining ostidagi "Kamida 8 ta harf" degan yozuv ID sini bog'lash).

---

## Xulosa

| Daraja | Yondashuv va Fokus | Nimalarga qodir bo'lish kerak? |
| --- | --- | --- |
| **Junior** | **Mantiq:** Semantik HTML va Asoslar. | `div` o'rniga `button`, `nav`, `main` ishlata oladi. Rasmlarga `alt` va Inputlarga `label` biriktira oladi. |
| **Middle** | **Qo'llash:** Klaviatura va Kontrast. | Saytni faqat klaviatura bilan muammosiz ishlata oladigan qilib sozlaydi. `:focus-visible` ni biladi. Ranglar kontrastini tekshira oladi. |
| **Senior** | **Arxitektura & V8:** ARIA va Kompleks Widgetlar. | Murakkab UI qismlarga (Tabs, Modals) to'g'ri `role` va `aria-*` state larni JS yordamida dinamik ulashni va Focus Trap yasashni biladi. |
