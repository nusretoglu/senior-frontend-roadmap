# GPU Acceleration (Hardware-Accelerated Rendering)

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Foydalanuvchilar silliq, hech qanday "qotish"larsiz ishlaydigan animatsiyalarni kutishadi. Agar barcha hisob-kitoblar va animatsiyalar brauzerning CPU (Markaziy protsessor - Main Thread) zimmasida qolsa, sahifa har qanday yuklamada (masalan, orqada kattaroq JS kodi ishlaganda) qotib qoladi (jank). **GPU Acceleration (GPU orqali tezlashtirish)** bizga animatsiyalarni GPU (Video karta) ga o'tkazib, kompyuter protsessorini yuklamadan xalos qilish va 60 FPS tezlikdagi o'ta silliq interfeyslar qurish imkonini beradi.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**GPU Acceleration** — ekrandagi siljishlar, ranglarning o'zgarishi va xiralashish kabi effektlarni markaziy protsessorga (CPU) emas, balki qotmasdan tez chiza oladigan video kartaga (GPU) topshirish.

> [!NOTE]
> **Hayotiy o'xshatish: "Teatrdagi fon ko'rgazmasi"**  
> - **CPU Rendering (Barcha rasmni bitta qog'ozga chizish):** Siz bitta katta qog'ozga daraxt, uy va osmonni chizdingiz. Agar daraxtni qimirlatmoqchi bo'lsangiz (Animatsiya), butun qog'ozni o'chirib, barcha narsalarni yana boshqatdan chizishingiz kerak (Juda og'ir va qiyin).
> - **GPU Rendering (Shaffof qatlamlar - Layers):** Siz shaffof (plyonka) ning birinchi qatlamiga uyni, ikkinchisiga daraxtni, uchinchisiga osmonni chizdingiz. Agar endi daraxtni siljitmoqchi bo'lsangiz, faqat ikkinchi plyonkaning o'zini o'ngga surib qoyasiz. Qolganlariga tegish shart emas. Video karta (GPU) aynan shu plyonkalarni tez surish bilan shug'ullanadi.

### Sodda Misol
Agar siz menyu yonidan chiqib keladigan (Sidebar) animatsiya qilmoqchi bo'lsangiz margin ishlatsangiz u butun ekranni titratadi. Transform ishlatsangiz u plyonka qatlam kabi siljiydi.

```css
/* YOMON (CPU qiynaladi, qotadi) */
.sidebar {
  transition: margin-left 0.3s;
  margin-left: -300px;
}

/* YAXSHI (GPU chizadi, 60 FPS silliq) */
.sidebar {
  transition: transform 0.3s;
  transform: translateX(-100%);
}
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Qaysi qoidalar GPU ni ishga tushiradi? (Composite Only)
Barcha CSS xususiyatlari ham video kartani ishlatavermaydi. Asosan 2 tasigina to'g'ridan to'g'ri Composite (qatlamlarni biriktirish) bosqichida GPU tomonidan o'qiladi. Bu xossalarga animatsiya berilganda Main Thread ga tegmasdan o'ta silliq ishlaydi:

1. `transform` (translate, scale, rotate, skew)
2. `opacity` (Xiralashish va paydo bo'lish)

### Qatlam yaratilish sabablari (Layer Creation)
Siz qaysidir element shaffof plyonka (GPU Layer) ga aylanishini xohlasangiz quyidagi holatlarda brauzer buni avtomatik qiladi:
- 3D transformlar (`translate3d`, `translateZ`)
- `position: fixed` yoki `sticky` ishlatilsa
- `<video>`, `<canvas>` elementlari
- Va eng asosiysi: `will-change` atributi orqali

### Ko'p uchraydigan xatolar va muammolar (Pitfalls)
**Memory (Xotira) to'lib ketishi**
Har bir GPU Layer xotirada joy egallaydi. Katta ekranli telefonda 1 ta rasm layeriga 10 MB gacha joy ketishi mumkin.

```css
/* XATO: 1000 ta ro'yxatni (List) hammasiga berib tashlash 
   Siz RAMni qotirib brauzerni o'ldirib qo'yasiz (Crash) */
.hamma-narsa {
  will-change: transform; 
}
```

## Eng Yaxshi Amaliyotlar (Best Practices)
- **will-change ni faqat kerakli paytda vaqtinchalik ishlating:** JS orqali elementga animatsiya boshlanishidan oldin (masalan, hover bo'lganda) `willChange = 'transform'` ni bering va animatsiya to'liq tugashi bilan uni yana `willChange = 'auto'` ga o'zgartirib, video xotirani bo'shating.
- **Z-Index larni to'g'ri bering:** Agar siz GPU qatlam (masalan transform qilingan quti) ning tepasiga oddiy matnni `z-index: 10` bilan qo'ysangiz, matn qatlam ostida qolib ketmasligi uchun brauzer uni ham majburan og'ir GPU qatlamiga aylantiradi (Implicit Compositing). 

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### "Under the hood" (Qopqoq ostida nimalar ro'y beradi)
Chromium (va Blink) engine arxitekturasida 3 ta asosiy jarayon mavjud:
1. **Main Thread (CPU)** - JS ni ishlatadi, Layout va Paint ni tayyorlab barchasini "Paint Records" degan formatda yig'adi.
2. **Compositor Thread** - Layerlarni qabul qilib oladi va ekranni mayda to'rtburchaklarga (Tiles) bo'lib Rasterizatsiya qilishga jo'natadi.
3. **GPU Process** - To'rtburchaklarni (Tiles) piksel formatda videokarta orqali ekranga biriktiradi (Compositing).

Siz `transform` yoki `opacity` ishlatsangiz jarayon **Compositor Thread** dagi mustaqil ishlash bilan kifoyalanadi. Ammo `left` yoki `margin` qilsangiz, signal yana boshiga Main Thread ga borishi kerak bo'ladi va o'rtada JS da og'ir array hisoblanayotgan bo'lsa... tamom animatsiya qotadi!

### Passive Event Listeners (Scroll Performance)
Scroll hodisasi asinxron, ya'ni ekranni surganingizda UI Main Thread dan qat'iy nazar surilishi kerak. Ammo eski `window.addEventListener('scroll', fn)` ishlatilganda brauzer JS ichida qachondir `e.preventDefault()` (scroll ni to'xtatish) qilinib qolishi mumkinligini kutib turadi. Natijada Scroll GPU silliqligida emas, CPU kutishida ishlaydi.
**Yechim:** Brauzerga "Men preventDefault qilmayman!" deb va'da bering:
`window.addEventListener('scroll', onScroll, { passive: true })`

### Intervyu Savollari (Qiyin daraja)
**1. Eski davrdagi `transform: translateZ(0)` bilan `will-change: transform` ning farqi nimada?**
*Javob:* Ikkalasi ham elementni Hardware Accelerated (GPU) Layerga o'tkazadi. Lekin `translateZ(0)` bu Brauzerni aldash (Hack) hisoblanadi. Unda brauzer asl niyatimiz nimaligini tushunmaydi va xotirani band qilib qo'yadi. `will-change` esa aniq maqsadli bo'lib, uning yordamida brauzer oldindan qaysi xususiyat optimallashishini tayyorlaydi.

**2. Nima sababdan CSS Animatsiyalari JS animatsiyalariga qaraganda tezroq ishlaydi?**
*Javob:* JS orqali (`requestAnimationFrame` bilan) qilingan har bir animatsiya freymi Main Thread da ishlaydi (UI to'silishi xavfi bor). CSS dagi keyframelar esa e'lon qilingandan so'ng deklarativ tarzda Compositor Thread ga oshiriladi va GPU da Main thread ga deyarli tegmasdan aylanib yotaveradi. Zamonaviy JS alternativi — **Web Animations API** (`element.animate()`) ham Composite Layerda silliq ishlash xususiyatiga ega.

### Vizualizatsiya (Compositor Pipeline)
```mermaid
graph TD
    subgraph Main Thread (CPU)
        DOM[DOM Parse] --> Style[Style Calc]
        Style --> Layout[Layout]
        Layout --> Paint[Paint Records]
        Paint --> LT[Layer Tree Construction]
    end

    subgraph Compositor Thread
        LT --> LM[Layer Management]
        LM --> TM[Tile Management]
        TM --> Raster[Rasterization CPU/GPU]
    end

    subgraph GPU Process
        Raster --> Comp[Compositing: Textures to screen]
    end

    style Main Thread fill:#ffebee,stroke:#c62828
    style Compositor Thread fill:#e8f5e9,stroke:#2e7d32
    style GPU Process fill:#e3f2fd,stroke:#1565c0
```

---

## Xulosa

| Daraja | Yondashuv va Fokus | Nimalarga qodir bo'lish kerak? |
| --- | --- | --- |
| **Junior** | **Mantiq:** CSS dagi barcha stil qoidalari ham bir xil tezlikda ishlamasligini biladi. | Hover effektlarda margin o'rniga doim transform dan foydalanadi. |
| **Middle** | **Qo'llash:** Layer nima ekanini va CPU bilan GPU farqini tushunadi. | `will-change` ni suiiste'mol qilmaydi. CSS Animation va JS o'rtasidagi chegara qayerdaligini biladi. |
| **Senior** | **Arxitektura & V8:** Main, Compositor va GPU process lari qanday xabar almashishini biladi. | DevTools "Layers" panelida GPU qatlamlarini Audit qiladi (Memory). Event listenerlarga doimo `{ passive: true }` yozadi. |
