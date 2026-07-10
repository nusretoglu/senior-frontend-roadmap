# Maps & Geospatial - Xaritalar bilan Ishlash

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Bugungi kunda Yandex Go, Uzum Tezkor yoki Express24 kabi ilovalarni xaritasiz tasavvur qilib bo'lmaydi. Faqat xarita chizish emas, balki foydalanuvchi qayerda turganini aniqlash, manzilgacha bo'lgan masofani hisoblash va xaritaning ma'lum bir hududiga kirsagina (Geofencing) aksiya taklif qilish — zamonaviy Senior Frontend dasturchisidan talab qilinadigan muhim bilimlardir. Geospatial (Geofazoviy) dasturlash orqali siz oddiy sayt yaratuvchidan jiddiy muhandisga aylanasiz.

> [!NOTE]
> **Real-hayot analogiyasi: "Qog'oz xarita vs GPS Navigator"**  
> Oddiy rasmli xarita (Static Image) - bu devorga osib qo'yilgan qog'oz xaritadek gap: unga faqat qarash mumkin. Geospatial kutubxonalar (Leaflet, Mapbox) esa - qo'lingizdagi "Google Maps" kabi ishlaydi. Sizni qayerda ekaningizni biladi, siz xaritani aylantirsangiz binolar 3D ga aylanadi va hatto tirbandlikni (Traffic) real vaqtda ko'rsatib turadi. Siz foydalanuvchining vizual ko'zlari bo'lasiz.

Bu bo'lim xaritalar va geografik ma'lumotlar bilan ishlashni chuqur o'rganishga bag'ishlangan. Zamonaviy web ilovalar uchun geospatial funksionallik muhim bo'lib, yetkazib berish xizmatlari, transport ilovalari, va ko'plab sohalarda qo'llaniladi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

### Xarita o'zi qanday ishlaydi?
Odatda biz xaritani butun dunyoning bitta yirik rasmi deb o'ylaymiz, lekin aslida bunday emas. Butun dunyo xaritasini yuqori sifatda 1 ta rasm qilib bera oladigan internet tarmog'i yo'q. Shu sababli xaritalar minglab "Kafel" (Tiles) larga bo'lib tashlanadi. Odatda bu 256x256 pikselli kvadrat rasmlar bo'lib, brauzer faqat ekranga sig'adigan "Kafel"larnigina internetdan yuklaydi.

### Asosiy Tushunchalar
- **Koordinata:** Joylashuv nuqtasi (Kenglik - Lat, va Uzunlik - Lng orqali o'lchanadi. Masalan `[41.31, 69.27]`).
- **Marker:** Xaritadagi manzilga sanchilgan pin (yoki Icon).
- **Zoom Level:** Xaritani qanchalik yaqinlashtirish darajasi. (0 butun dunyo, 18-20 esa ko'chaning ichigacha).

### Bo'lim Tarkibi

| # | Mavzu | Tavsif |
|---|-------|--------|
| 01 | [Leaflet](./01-leaflet.md) | Eng mashhur open-source xarita kutubxonasi, asosiy tushunchalar |
| 02 | [Mapbox GL JS](./02-mapbox.md) | WebGL asosidagi xaritalar, custom styling, 3D |
| 03 | [OpenLayers](./03-openlayers.md) | Enterprise-grade GIS kutubxonasi |

---

## 🟡 Middle (Amaliyot va Detallar)

### Kutubxonalar Taqqoslash
Qaysi loyihada qaysi xarita dasturini ishlatgan yaxshiroq?

| Xususiyat | Leaflet | Mapbox GL JS | OpenLayers |
|-----------|---------|-----------|------------|
| **O'lcham (Hajm)** | 42KB (Eng yengil) | 230KB | 180KB |
| **Rendering texnologiyasi** | DOM / HTML Canvas (2D) | WebGL (3D) | Canvas / WebGL |
| **Boshqarish** | Oson | O'rta | Murakkab |
| **Qachon ishlatiladi?** | Oddiy "Biz qayerdamiz" xaritalari, 10-100 tagacha markerlar uchun. | Murakkab dizayn, navigatsiya, 3D binolar, katta logistika ilovalari uchun. | Davlat kadastr va maxsus geografik xaritalari uchun. |

### GeoJSON formati
Geometrik ma'lumotlarni backend'dan olib frontend'ga uzatish standartidir. Agar butun boshli O'zbekiston viloyatlari chegarasini chizish kerak bo'lsa, uni minglab `[lat, lng]` to'plami bilan emas, tartibli GeoJSON orqali uzatiladi:
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [69.2797, 41.3111]
  },
  "properties": {
    "name": "Toshkent"
  }
}
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### Performance Metriklari
Katta transport va yetkazib berish (Delivery) loyihalarida xaritalar tez ishlashi, brauzer qotib qolmasligi shart. Senior developer quyidagi metrikalarni bilishi va ta'minlashi kerak:

| Metrika | Optimal natija | Yomon natija |
|---------|--------|----------|
| **Initial Load** (Xarita yuklanishi) | < 2s | > 4s |
| **Marker Render (1,000 ta)** | < 100ms | > 500ms |
| **Marker Render (100,000 ta)** | < 1s (clustered) | > 3s (Brauzer qotishi) |
| **Pan/Zoom FPS** (Aylantirish) | 60fps | < 30fps (Sekin qotib yurish) |

### Katta ma'lumotlarni ko'rsatish (Clustering & Rendering)
Xaritaga millionta do'kon lokatsiyasi (marker) ni joylash kerak bo'lsa `Leaflet` ni o'zi ko'tara olmay o'chib qoladi. Performance ni hal qilish:
1. **Clustering:** Masalan, ekranni uzoqlashtirganda barcha 10,000 markerni chizmasdan, o'rniga ichiga "10 000" yozilgan bitta aylana (Cluster) ko'rsatiladi.
2. **Viewport yondashuvi:** Foydalanuvchi ekrani qayerga qarab turgan bo'lsa (`map.getBounds()`), Faqat o'sha yerdagi koordinatalarnigina API dan olib kelish. Ekranga tushmagan qismlarni chizib o'tirmaslik.
3. **Hardware Acceleration:** DOM tugunlarini (minglab `div` va `img`) ishlatmaslik, va Leaflet `Canvas` rejimiga yoki Mapbox `WebGL` renderingga o'tish (Kompyuterning VideoKartasidan - GPU dan foydalanish).

### Intervyu Savollari (Qiyin daraja)
**1. Xaritada minglab nuqtalar va qalin marshrut chizish qachon Leaflet da sekinlashadi va Mapbox tavsiya qilinadi? Nega?**
*Javob:* Leaflet 2D DOM (yoki oddiy Canvas) elementlardan foydalanadi va har bir marker brauzer memory'sini oladi. Mapbox GL JS to'g'ridan-to'g'ri WebGL orqali video karta (GPU) yordamida chizadi. GPU minglab piksellarni bir xil vaqtda render qila olgani uchun u katta Big Data xaritalarida qotib qolmaydi.

**2. Turgan joydan ma'lum bir manzilgacha bo'lgan masofani aniq radiusini topish formulasi?**
*Javob:* Garchi biz Leafletning `distanceTo` metodini ishlatsak ham, u aslida Yerning sharsimon ekanligini hisobga oluvchi *Haversine formulasi* ga asoslangan. Agar oddiy Pifagor teoremasi ($c^2 = a^2 + b^2$) qilinsa yerning egriligi sababli masofa noto'g'ri chiqadi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Memory Leak oldini oling:** Single Page Applications (React/Vue/Nuxt) da boshqa sahifaga o'tib ketganda xarita instansiyasini albatta yo'q qiling (`map.remove()`).
2. **Klaviatura bilan navigatsiya:** A11y (Accessibility) qoidalariga ko'ra, xaritani faqat sichqoncha emas klaviatura bilan surish imkoniyatlarini yoqib qo'ying.
3. **Turf.js ni biling:** Katta geografik hisob-kitoblar (Poligonlarni qirqish, markazni topish, Buffer ochish) frontend da qilinishi kerak bo'lsa uni Turf.js degan kutubxona osongina echib beradi. Noldan matematik formulalar yozishga hojat yo'q.

---

## Xulosa

| Yondashuv / Xususiyat | Tavsif |
|------------------------|--------|
| **Loyiha turi** | Eng yengil va kichik dashboard xaritalari bo'lsa **Leaflet**. Uber kabi logistika murakkab dasturi bo'lsa **Mapbox GL JS**. |
| **Rendering** | Oddiy SVG markerlar (100 tagacha). Ko'p sonli ma'lumot bo'lsa Canvas. Big data bo'lsa Clustering texnikasini qo'llang. |
| **Formati** | Xaritalar uchun ma'lumotlarni doim backend bilan **GeoJSON** kelishuvi asosida uzating va qabul qiling. |

Keyingi qadam sifatida **[Leaflet](./01-leaflet.md)** ga o'tish tavsiya qilinadi, sababi u Xaritalashning alifbosidir.
