# Leaflet - Open Source Xarita Kutubxonasi

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Leaflet JavaScript ekotizimidagi xaritalar (maps) uchun yozilgan eng qadimgi, lekin hali ham eng ko'p ishlatiladigan open-source (tekin) kutubxonadir. Oddiyligi (faqat 42KB) va ishlashga tezligi uchun dasturchilar orasida juda mashhur. Agar loyihada maxsus uch o'lchamli (3D) render kerak bo'lmasa, Leaflet doimo "Default Tanlov" hisoblanadi. Undagi asosiy tushunchalar (Tile, Marker, Polygon) barcha boshqa kutubxonalar uchun ham fundamental poydevor hisoblanadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Pazl yig'ish (Tiles)"**  
> Xaritani birdaniga butun Yer sharining katta rasmi sifatida yuklab olish brauzerni o'ldirib qo'ygan bo'lardi. Shuning uchun Leaflet xaritani minglab kichik (odatda 256x256 px) kvadratlarga bo'lib yuboradi. Siz Toshkentga zoom (yaqinlashtirish) qilsangiz, Leaflet faqat Toshkent ustidagi kvadratlarni serverdan yuklaydi. Buni Pazl (Puzzle) yig'ishga o'xshatish mumkin: ekranga nima sig'sa, shu pazl bo'laklari (Tile Layers) joyiga qo'yiladi.

Leaflet - 2011 yilda yaratilgan bo'lib, hozirgacha millionlab saytlarda ishlatiladi. Kichik o'lcham va keng ekotizim plaginlar orqali uni kuchaytiradi. Mobile-friendly va barcha zamonaviy brauzerlarga to'liq mos keladi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

### Asosiy Tushunchalar
Leaflet ishlash qoidalari oson tushuniladi, u quyidagi narsalarni bilishni talab qiladi:
1. **Map Container:** Xarita qo'yiladigan oyna (HTML dagi `<div id="map"></div>`).
2. **TileLayer:** "Pazl bo'laklarini" beruvchi provayder, asosan OpenStreetMap (OSM) ni serveridan olinadi.
3. **Marker:** Xaritaga biror joyni belgilash ("Qizil nuqta").

### Xarita yaratish qadami
Oddiy xaritani HTML va JS da ishga tushirish:
```html
<!-- index.html -->
<div id="map" style="height: 400px; width: 100%;"></div>

<!-- CSS va JS ulashni unutmang -->
<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
```

```javascript
// app.js
// 1. Container ni tanlab, boshlang'ich joylashuv (Toshkent: lat, lng) ni kiritish
const map = L.map('map').setView([41.3111, 69.2797], 13);

// 2. Tile provayderini ulash (Tashqi rasm qatlami)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

// 3. Xaritaga nuqta (Marker) qo'yish
const marker = L.marker([41.3111, 69.2797]).addTo(map);

// 4. Nuqtaga bosganda yozuv chiqishi uchun (Popup)
marker.bindPopup("Salom Toshkent!").openPopup();
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Geometrik Shakllar chizish
Loyiha ichida doira (masalan radiusi 500m bo'lgan yetkazib berish zonasi) yoki to'rtburchak maydon chizish kerak bo'lsa Leaflet asboblarini yozamiz.

```javascript
// Aylanasi 500 metrlik radius chizish
const circle = L.circle([41.3111, 69.2797], {
  color: 'red',      // Cheti qizil
  fillColor: '#f03', // Ichki foni sal qizil
  fillOpacity: 0.5,
  radius: 500        // Metrda (500m)
}).addTo(map);

// Marshrut chizish (Yandex Go dagi yo'l chizig'i)
const route = L.polyline([
  [41.3111, 69.2797],
  [41.2995, 69.2401]
], {
  color: 'blue',
  weight: 4
}).addTo(map);
```

### Event Handling (Hodisalar)
Xaritaning ixtiyoriy joyiga bossa qandaydir amal (Event) bajarilishi. Masalan yangi manzil belgilash:

```javascript
// Xaritani biror joyini click qilsa nima bo'ladi?
map.on('click', function(e) {
  // e.latlng ichida foydalanuvchi bosgan koordinatalar qaytadi
  console.log(`Lat: ${e.latlng.lat}, Lng: ${e.latlng.lng}`);

  // O'sha bosgan joyiga yangi marker o'rnatib qo'yamiz
  L.marker(e.latlng).addTo(map);
});
```

### Vue.js Integratsiya (To'g'ri yondashuv)
Vue/React komponentlarga Leaflet ni ulayotganda Memory leak yuz bermasligi hamda uni reactive boshqarish tushunilishi kerak:

```vue
<template>
  <!-- Konteyner -->
  <div ref="mapContainer" style="height: 500px;"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
// Leaflet va uning css fayllarini js modullari tarzida olib kelish
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const mapContainer = ref(null);
let map = null;

onMounted(() => {
  // Komponent ekranga tushganda yaratish
  map = L.map(mapContainer.value).setView([41.31, 69.27], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
});

onUnmounted(() => {
  // Komponent nobud bo'lganda MAP OBYEKTINI ham o'ldirish majburiy, aks holda hotirada osilib qoladi
  if (map) {
    map.remove();
    map = null;
  }
});
</script>
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### GeoJSON bilan ishlash
Davlatlar/Viloyatlar chegarasi, yoki katta ko'chalar kabi juda murakkab grafikalarni xaritaga chizishda koordinatalarni hardcoded yozish o'rniga, standartlashtirilgan `GeoJSON` farmatidan foydalaniladi. GeoJSON dagi poligonlar asosan back-end'dan yoki ochiq bazadan yuklab olinib, Leaflet ga beriladi:

```javascript
// O'zbekiston chegaralari kabi
const myGeoJsonData = {
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[69.2, 41.3], [69.5, 41.5], /* yana mingta pointlar */ ]]
  }
};

L.geoJSON(myGeoJsonData, {
  style: function (feature) {
    return { color: '#ff0000', weight: 2 };
  }
}).addTo(map);
```

### Katta ma'lumotlarda Performance Optimization
Tasavvur qiling, shaharda 10,000 ta do'kon bor va hamma do'konlarga Marker (nuqta) qo'yish kerak.
- **Xato Yo'l:** For-loop yordamida `L.marker()` ni 10 ming marta ishlatsangiz, brauzer qotib "o'ladi". Sababi har bir marker `<img />` yoki `<div>` tagi sifatida DOM ga qo'shiladi. 10,000 ta DOM tugunini chizish arzon emas.
- **Yechim (Marker Clustering):** Yoki guruhlab qo'yish kerak, yoki ma'lumotlarni Canvas renderingga o'girish kerak. `leaflet.markercluster` plagini ma'lumotlarni birlashtirib (10 ta o'rniga "10" yozuvli bitta katta aylanada) ko'rsatadi, zoom qilinganda ichki qismlar ko'rinadi. Yoki to'g'ridan to'g'ri Leaflet konfigini o'zgartirish kerak:

```javascript
// DOM Element o'rniga HTML5 Canvas elementga rasmlarni chizib tashlash. (Tezligi o'nlab marta oshadi)
const map = L.map('map', {
  preferCanvas: true // <- Juda kuchli parametr
});
```

### Intervyu Savollari (Qiyin daraja)
**1. Xaritada minglab nuqtalar va qalin marshrut chizish qachon Leaflet da sekinlashadi va Mapbox/Google Maps tavsiya qilinadi? Nega?**
*Javob:* Leaflet - default ravishda (Canvas option bo'lmaganda) chiziqlar, poligonlar va vektor obyektlarni SVG (yoki alohida DOM elementlari) sifatida render qiladi. Minglab markerlar va svg qatlamlar sahifa har zoom va surilgan paytda (pan) qayta hisob kitob qilinadi (Re-paint, Re-layout). Mapbox GL JS esa to'g'ridan-to'g'ri `WebGL` ga suyanadi. GPU quvvati orqali grafikalarni chizgani uchun 100 minglab obyektlarni ham juda tez va silliq, 60fps da chiza oladi.

**2. Point-in-Polygon muammosi. Yetkazib berish ilovasida foydalanuvchi tanlagan uyi sizning restoraningizning chizib qo'ygan "Polygon" chegarasi ichiga tushadimi yoki tashqariga chiqib ketganmi qanday aniqlanadi?**
*Javob:* Buning uchun backend da PostGIS kabi database asboblari ishlatilsa ideal. Ammo frontend da qilish kerak bo'lsa Leaflet ning `Turf.js` plagini yoki "Ray-casting Algorithm" yoziladi. Algoritm nuqtadan ixtiyoriy tomonga chiziq tortib ko'radi, agar chiziq poligonni TOQ marta (1, 3, 5) kesib o'tsa u markazda (ichkarida) hisoblanadi. JUFT marta (2, 4) yoki o'tmasa, u tashqarida hisoblanadi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Memory Leak (Xotira to'lishi) oldini olish:** Vue yoki React da komponent o'chayotganda (`onUnmounted` yoki `useEffect` return da) har doim `map.remove()` funksiyasini chaqirish esingizdan chiqmasin, bo'lmasa xarita xotirada osilib qolib, dasturni sekinlashtiradi.
2. **Katta ma'lumotlar ustida SVG ishlatmang:** Agar 1000 tadan ortiq Marker chizmoqchi bo'lsangiz, Leaflet qiynalib qoladi (har biri alohida DOM element bo'lgani uchun). Bunday hollarda `preferCanvas: true` rejimiga o'tish yoki `MarkerCluster` ishlatish shart.
3. **API Keys (Kalitlar):** TileLayer manzillari (masalan, Mapbox tiles) kalitlarni (API Key) talab qiladi. U kalitlarni frontend kodi ichida ochiq yozmang (Xavfsizlik), .env faylda saqlang.

---

## Xulosa

| Xususiyat | Tavsif / Foydasi |
|-----------|------------------|
| **Asos (Texnologiya)** | 2D DOM va Canvas rendering. 3D obyektlarni natively (tabiiy holatda) qo'llab-quvvatlamaydi. |
| **Qulayligi** | API si juda qisqa va aniq, o'rganish egriligi eng past (Juda oson). O'z og'irligi (bundle size) deyarli sezilmaydi. |
| **Tile System** | Mapbox, OpenStreetMap yoki Yandex kabi istalgan xarita serverini bitta urlda (TileLayer) ulab ketish mumkin. |
| **Kamchiligi** | Har bir element DOM Node (HTML tag) bo'lib yozilgani sababli yirik Big Data bilan ishlashda tezligi pasayadi. |

Leaflet - oddiy va o'rta murakkablikdagi xarita loyihalari (Lokatsiya tanlash, Adres belgilash, hududlarga bo'lish) uchun ideal tanlov. Kichik o'lcham, sodda API va keng plugin ekotizimi uni tezkor ishlab chiqish uchun qulay qiladi. Performance uchun clustering, canvas renderer va viewport-based loading strategiyalarini qo'llang.
