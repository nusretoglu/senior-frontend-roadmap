# Maps & Geospatial

Bu bo'lim xaritalar va geografik ma'lumotlar bilan ishlashni chuqur o'rganishga bag'ishlangan. Zamonaviy web ilovalar uchun geospatial funksionallik muhim bo'lib, yetkazib berish xizmatlari, transport ilovalari, real estate platformalari va boshqa ko'plab sohalarda qo'llaniladi.

## Bo'lim Tarkibi

| # | Mavzu | Tavsif |
|---|-------|--------|
| 01 | [Leaflet](./01-leaflet.md) | Eng mashhur open-source xarita kutubxonasi, asosiy tushunchalar |
| 02 | [Mapbox GL JS](./02-mapbox.md) | WebGL asosidagi xaritalar, custom styling, 3D |
| 03 | [OpenLayers](./03-openlayers.md) | Enterprise-grade GIS kutubxonasi, murakkab proyeksiyalar |
| 04 | [Markers & Clustering](./04-markers-clustering.md) | Ko'p markerlar bilan ishlash, clustering strategiyalari |
| 05 | [Polygons & Routing](./05-polygons-routing.md) | Hududlar chizish, marshrut hisoblash, geofencing |
| 06 | [GeoJSON](./06-geojson.md) | Geografik ma'lumotlar formati, import/export, optimizatsiya |

## Nima Uchun Bu Mavzular?

Geospatial dasturlash zamonaviy ilovalarning muhim qismidir. Bu bo'limdagi bilimlar quyidagi sohalarda qo'llaniladi:

### Real-World Use Cases

1. **Yetkazib berish xizmatlari** - Yandex.Eda, Uzum Tezkor
   - Real-time kuryer tracking
   - Yetkazib berish zonalari (geofencing)
   - Optimal marshrut hisoblash

2. **Transport ilovalari** - Yandex.Taxi, MyTaxi
   - Haydovchi va yo'lovchi joylashuvi
   - ETA (Estimated Time of Arrival)
   - Surge pricing zonalari

3. **Real Estate** - OLX, Zillow
   - Xaritada uy qidirish
   - Hududlar bo'yicha filtrlash
   - Infratuzilma tahlili

4. **Logistika** - Ombor joylashuvi, fleet management
   - Optimal ombor joylashuvi
   - Transport vositalari monitoring
   - Delivery zone optimization

### Texnik Bilimlar

- **Coordinate Systems**: WGS84, EPSG:3857, local projections
- **Tile Systems**: Raster vs Vector tiles, zoom levels
- **Spatial Indexing**: R-tree, QuadTree, GeoHash
- **Performance**: Canvas rendering, WebGL, clustering

## Kutubxonalar Taqqoslash

| Xususiyat | Leaflet | Mapbox GL | OpenLayers |
|-----------|---------|-----------|------------|
| **O'lcham** | 42KB | 230KB | 180KB |
| **Rendering** | DOM/Canvas | WebGL | Canvas/WebGL |
| **3D Support** | Plugin | Native | Plugin |
| **Learning Curve** | Oson | O'rta | Murakkab |
| **Narx** | Bepul | Freemium | Bepul |
| **Use Case** | Simple maps | Custom design | Enterprise GIS |

## O'rganish Tartibi

1. **Leaflet** - xaritalar asoslari, sodda API
2. **GeoJSON** - ma'lumotlar formati tushunish
3. **Markers & Clustering** - performance asoslari
4. **Polygons & Routing** - murakkab geometriya
5. **Mapbox GL** - professional xaritalar
6. **OpenLayers** - enterprise talablar

## Texnologiya Stack

```
┌─────────────────────────────────────────────────┐
│                   Application                    │
├─────────────────────────────────────────────────┤
│   Vue/React Component    │    Map Controls       │
├──────────────────────────┼──────────────────────┤
│   Leaflet / Mapbox GL / OpenLayers              │
├─────────────────────────────────────────────────┤
│   GeoJSON / TopoJSON / Vector Tiles             │
├─────────────────────────────────────────────────┤
│   Tile Server (OSM / Mapbox / Custom)           │
├─────────────────────────────────────────────────┤
│   PostGIS / MongoDB Geospatial / Elasticsearch  │
└─────────────────────────────────────────────────┘
```

## Performance Metriklari

Senior developer sifatida bilishingiz kerak:

| Metrika | Target | Critical |
|---------|--------|----------|
| Initial Load | < 2s | > 4s |
| Marker Render (1K) | < 100ms | > 500ms |
| Marker Render (100K) | < 1s (clustered) | > 3s |
| Pan/Zoom FPS | 60fps | < 30fps |
| Tile Load | < 200ms | > 1s |

## Interview Tayyorgarlik

Har bir faylda 3-5 ta interview savollari mavjud. Umumiy mavzular:

1. **Coordinate Systems** - WGS84 vs Web Mercator farqi
2. **Performance** - 1M marker qanday ko'rsatiladi?
3. **Algorithms** - Point-in-polygon, Haversine formula
4. **Architecture** - Offline maps, caching strategies
5. **Trade-offs** - Leaflet vs Mapbox qachon tanlash

## Amaliy Loyiha G'oyalari

1. **Delivery Zone Editor** - Admin panel uchun zona chizish
2. **Store Locator** - Yaqin do'konlarni topish
3. **Route Planner** - Ko'p nuqtali marshrut
4. **Heatmap Dashboard** - Real-time ma'lumotlar vizualizatsiya
5. **Offline Map App** - PWA bilan offline xarita

## Resurslar

- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [Mapbox GL JS Docs](https://docs.mapbox.com/mapbox-gl-js/)
- [OpenLayers Examples](https://openlayers.org/en/latest/examples/)
- [GeoJSON Specification](https://geojson.org/)
- [Turf.js - Geospatial Analysis](https://turfjs.org/)

**Eslatma:** Kod misollarini real xaritada sinab ko'ring. Har bir kutubxonaning playground'i mavjud - ulardan foydalaning.
