# Leaflet - Open Source Xarita Kutubxonasi

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Leaflet JavaScript ekotizimidagi xaritalar (maps) uchun yozilgan eng qadimgi, lekin hali ham eng ko'p ishlatiladigan open-source (tekin) kutubxonadir. Oddiyligi (faqat 42KB) va ishlashga tezligi uchun dasturchilar orasida juda mashhur. Agar loyihada maxsus uch o'lchamli (3D) render kerak bo'lmasa, Leaflet doimo "Default Tanlov" hisoblanadi. Undagi asosiy tushunchalar (Tile, Marker, Polygon) barcha boshqa kutubxonalar uchun ham fundamental poydevor hisoblanadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Pazl yig'ish (Tiles)"**  
> Xaritani birdaniga butun Yer sharining katta rasmi sifatida yuklab olish brauzerni o'ldirib qo'ygan bo'lardi. Shuning uchun Leaflet xaritani minglab kichik (odatda 256x256 px) kvadratlarga bo'lib yuboradi. Siz Toshkentga zoom (yaqinlashtirish) qilsangiz, Leaflet faqat Toshkent ustidagi kvadratlarni serverdan yuklaydi. Buni Pazl (Puzzle) yig'ishga o'xshatish mumkin: ekranga nima sig'sa, shu pazl bo'laklari (Tile Layers) joyiga qo'yiladi.

Leaflet - eng mashhur open-source JavaScript xarita kutubxonasi. 2011 yilda yaratilgan bo'lib, sodda API, kichik o'lcham (42KB gzipped) va keng plugin ekotizimi bilan ajralib turadi. Mobile-friendly dizayn va barcha zamonaviy brauzerlar uchun moslashgan.
## Asosiy Tushunchalar

### Map Container va Initialization

Leaflet xaritasi `L.map` class'i orqali yaratiladi. Xarita DOM element ichida render qilinadi.

```javascript
// HTML: <div id="map" style="height: 400px;"></div>

// Asosiy xarita yaratish
const map = L.map('map', {
  center: [41.3111, 69.2797], // Toshkent koordinatalari [lat, lng]
  zoom: 13,
  zoomControl: true,
  attributionControl: true
});

// Tile layer qo'shish (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
  minZoom: 3
}).addTo(map);
```

### Coordinate System

Leaflet WGS84 (EPSG:4326) koordinata tizimidan foydalanadi:
- **Latitude (kenglik)**: -90 dan +90 gacha, shimol/janub
- **Longitude (uzunlik)**: -180 dan +180 gacha, sharq/g'arb

```javascript
// LatLng object yaratish
const tashkent = L.latLng(41.3111, 69.2797);
const samarkand = L.latLng(39.6547, 66.9597);

// Ikki nuqta orasidagi masofa (metrda)
const distance = tashkent.distanceTo(samarkand);
console.log(`Masofa: ${(distance / 1000).toFixed(1)} km`); // ~270 km
```

### Tile System

Xaritalar tile (plitka) tizimida ishlaydi. Har bir zoom darajasida dunyoning 2^zoom x 2^zoom tile'ga bo'linadi.

```javascript
// Custom tile provider
const customTiles = L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=YOUR_KEY', {
  attribution: '&copy; MapTiler',
  tileSize: 512,
  zoomOffset: -1,
  crossOrigin: true
});

// Multiple tile layers
const baseMaps = {
  'Streets': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
  'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'),
  'Topographic': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png')
};

// Layer control
L.control.layers(baseMaps).addTo(map);
```

## Markers va Popups

### Oddiy Marker

```javascript
// Marker yaratish
const marker = L.marker([41.3111, 69.2797]).addTo(map);

// Popup qo'shish
marker.bindPopup('<strong>Toshkent</strong><br>O\'zbekiston poytaxti');

// Tooltip (hover da ko'rinadi)
marker.bindTooltip('Toshkent', {
  permanent: false,
  direction: 'top',
  offset: [0, -10]
});
```

### Custom Marker Icons

```javascript
// Custom icon yaratish
const customIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const marker = L.marker([41.3111, 69.2797], { icon: customIcon }).addTo(map);

// DivIcon - HTML/CSS asosidagi marker
const htmlIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div class="marker-pin">
      <span class="marker-number">1</span>
    </div>
  `,
  iconSize: [30, 42],
  iconAnchor: [15, 42]
});
```

### Draggable Marker

```javascript
const draggableMarker = L.marker([41.3111, 69.2797], {
  draggable: true,
  autoPan: true
}).addTo(map);

draggableMarker.on('dragend', function(event) {
  const position = event.target.getLatLng();
  console.log(`Yangi joylashuv: ${position.lat}, ${position.lng}`);

  // Reverse geocoding qilish mumkin
  reverseGeocode(position.lat, position.lng);
});

draggableMarker.on('drag', function(event) {
  // Real-time position update
  const pos = event.target.getLatLng();
  document.getElementById('coords').textContent =
    `Lat: ${pos.lat.toFixed(6)}, Lng: ${pos.lng.toFixed(6)}`;
});
```

## Geometrik Shakllar

### Circle va CircleMarker

```javascript
// Circle - radius metrda
const circle = L.circle([41.3111, 69.2797], {
  radius: 500, // 500 metr
  color: '#3388ff',
  fillColor: '#3388ff',
  fillOpacity: 0.3,
  weight: 2
}).addTo(map);

// CircleMarker - radius pikselda (zoom da o'zgarmaydi)
const circleMarker = L.circleMarker([41.3111, 69.2797], {
  radius: 10,
  color: '#ff0000',
  fillColor: '#ff0000',
  fillOpacity: 0.5
}).addTo(map);
```

### Polygon

```javascript
// Polygon yaratish
const polygon = L.polygon([
  [41.35, 69.20],
  [41.35, 69.35],
  [41.25, 69.35],
  [41.25, 69.20]
], {
  color: '#ff7800',
  fillColor: '#ff7800',
  fillOpacity: 0.4,
  weight: 2
}).addTo(map);

// Polygon area hisoblash
const area = L.GeometryUtil.geodesicArea(polygon.getLatLngs()[0]);
console.log(`Area: ${(area / 1000000).toFixed(2)} km²`);

// Polygon ichida nuqta borligini tekshirish
function isPointInPolygon(point, polygon) {
  const polyPoints = polygon.getLatLngs()[0];
  const x = point.lat, y = point.lng;

  let inside = false;
  for (let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
    const xi = polyPoints[i].lat, yi = polyPoints[i].lng;
    const xj = polyPoints[j].lat, yj = polyPoints[j].lng;

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}
```

### Polyline

```javascript
// Polyline (marshrut)
const route = L.polyline([
  [41.3111, 69.2797],
  [41.2995, 69.2401],
  [41.2667, 69.2167],
  [39.6547, 66.9597]
], {
  color: '#0066cc',
  weight: 4,
  opacity: 0.8,
  lineJoin: 'round',
  dashArray: '10, 10' // Chiziqli
}).addTo(map);

// Polyline uzunligi
let totalDistance = 0;
const coords = route.getLatLngs();
for (let i = 0; i < coords.length - 1; i++) {
  totalDistance += coords[i].distanceTo(coords[i + 1]);
}
console.log(`Marshrut uzunligi: ${(totalDistance / 1000).toFixed(1)} km`);

// Xaritani polyline ga moslash
map.fitBounds(route.getBounds(), { padding: [50, 50] });
```

## Event Handling

### Map Events

```javascript
// Click event
map.on('click', function(e) {
  console.log(`Clicked at: ${e.latlng.lat}, ${e.latlng.lng}`);

  // Click joyiga marker qo'yish
  L.marker(e.latlng).addTo(map)
    .bindPopup(`Koordinata: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`)
    .openPopup();
});

// Zoom events
map.on('zoomstart', () => console.log('Zoom boshlandi'));
map.on('zoomend', () => console.log(`Zoom tugadi: ${map.getZoom()}`));

// Move events
map.on('moveend', function() {
  const center = map.getCenter();
  const bounds = map.getBounds();

  // Viewport ichidagi ma'lumotlarni yuklash
  loadDataForBounds(bounds);
});

// Viewport bounds olish
function loadDataForBounds(bounds) {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  fetch(`/api/locations?north=${ne.lat}&south=${sw.lat}&east=${ne.lng}&west=${sw.lng}`)
    .then(response => response.json())
    .then(data => renderMarkers(data));
}
```

### Layer Events

```javascript
// Marker events
marker.on('click', function(e) {
  this.openPopup();
});

marker.on('mouseover', function(e) {
  this.setIcon(highlightedIcon);
});

marker.on('mouseout', function(e) {
  this.setIcon(normalIcon);
});

// Polygon events
polygon.on('click', function(e) {
  // Polygon ma'lumotlarini ko'rsatish
  showPolygonInfo(this.options.data);
});
```

## Layer Groups va Feature Groups

```javascript
// LayerGroup - bir nechta layer'ni guruhlashtirish
const markersGroup = L.layerGroup();

cities.forEach(city => {
  const marker = L.marker([city.lat, city.lng])
    .bindPopup(city.name);
  markersGroup.addLayer(marker);
});

markersGroup.addTo(map);

// Guruhni boshqarish
markersGroup.clearLayers(); // Barcha layer'larni o'chirish
markersGroup.removeFrom(map); // Xaritadan olib tashlash

// FeatureGroup - LayerGroup + bounds va events
const featureGroup = L.featureGroup();

polygons.forEach(poly => {
  featureGroup.addLayer(L.polygon(poly.coords));
});

// Barcha layer'lar bounds'ini olish
map.fitBounds(featureGroup.getBounds());
```

## GeoJSON bilan Ishlash

```javascript
// GeoJSON ma'lumotlarini xaritaga qo'shish
const geojsonData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Toshkent', population: 2500000 },
      geometry: {
        type: 'Point',
        coordinates: [69.2797, 41.3111]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Samarqand', population: 500000 },
      geometry: {
        type: 'Point',
        coordinates: [66.9597, 39.6547]
      }
    }
  ]
};

const geojsonLayer = L.geoJSON(geojsonData, {
  pointToLayer: function(feature, latlng) {
    // Point uchun custom marker
    const radius = Math.sqrt(feature.properties.population) / 100;
    return L.circleMarker(latlng, { radius: radius });
  },

  style: function(feature) {
    // Polygon uchun style
    return {
      color: '#ff0000',
      weight: 2,
      fillOpacity: 0.5
    };
  },

  onEachFeature: function(feature, layer) {
    // Har bir feature uchun popup
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`
        <strong>${feature.properties.name}</strong><br>
        Aholi: ${feature.properties.population.toLocaleString()}
      `);
    }
  },

  filter: function(feature) {
    // Faqat ma'lum feature'larni ko'rsatish
    return feature.properties.population > 100000;
  }
}).addTo(map);
```

## Vue.js Integratsiya

```vue
<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl
});

const props = defineProps({
  center: {
    type: Array,
    default: () => [41.3111, 69.2797]
  },
  zoom: {
    type: Number,
    default: 13
  },
  markers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['mapClick', 'markerClick', 'boundsChange']);

const mapContainer = ref(null);
let map = null;
let markersLayer = null;

onMounted(() => {
  // Xarita yaratish
  map = L.map(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Markers layer
  markersLayer = L.layerGroup().addTo(map);

  // Events
  map.on('click', (e) => {
    emit('mapClick', { lat: e.latlng.lat, lng: e.latlng.lng });
  });

  map.on('moveend', () => {
    emit('boundsChange', map.getBounds());
  });

  // Initial markers
  renderMarkers();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

// Markers reactivity
watch(() => props.markers, renderMarkers, { deep: true });

function renderMarkers() {
  if (!markersLayer) return;

  markersLayer.clearLayers();

  props.markers.forEach(markerData => {
    const marker = L.marker([markerData.lat, markerData.lng])
      .bindPopup(markerData.popup || markerData.name);

    marker.on('click', () => {
      emit('markerClick', markerData);
    });

    markersLayer.addLayer(marker);
  });
}

// Exposed methods
defineExpose({
  setView: (center, zoom) => map?.setView(center, zoom),
  fitBounds: (bounds) => map?.fitBounds(bounds),
  invalidateSize: () => map?.invalidateSize()
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
}
</style>
```

## Real-World Case: Yetkazib Berish Ilovasi

```javascript
class DeliveryMap {
  constructor(containerId) {
    this.map = L.map(containerId, {
      center: [41.3111, 69.2797],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    this.deliveryZones = L.layerGroup().addTo(this.map);
    this.couriers = L.layerGroup().addTo(this.map);
    this.activeOrders = L.layerGroup().addTo(this.map);

    this.courierIcons = {
      available: this.createCourierIcon('#22c55e'),
      busy: this.createCourierIcon('#ef4444'),
      offline: this.createCourierIcon('#6b7280')
    };
  }

  createCourierIcon(color) {
    return L.divIcon({
      className: 'courier-marker',
      html: `
        <svg width="32" height="32" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
          <path d="M16 8 L16 18 M11 13 L16 8 L21 13" stroke="white" stroke-width="2" fill="none"/>
        </svg>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  }

  // Yetkazib berish zonalarini yuklash
  async loadDeliveryZones() {
    const response = await fetch('/api/delivery-zones');
    const zones = await response.json();

    zones.forEach(zone => {
      const polygon = L.polygon(zone.coordinates, {
        color: zone.active ? '#22c55e' : '#ef4444',
        fillColor: zone.active ? '#22c55e' : '#ef4444',
        fillOpacity: 0.2,
        weight: 2
      });

      polygon.bindPopup(`
        <strong>${zone.name}</strong><br>
        Yetkazib berish: ${zone.deliveryTime} daqiqa<br>
        Minimal buyurtma: ${zone.minOrder.toLocaleString()} so'm
      `);

      this.deliveryZones.addLayer(polygon);
    });
  }

  // Kuryer joylashuvini yangilash (real-time)
  updateCourierPosition(courierId, position, status) {
    let courier = this.couriers.getLayers()
      .find(l => l.courierId === courierId);

    if (courier) {
      // Animatsiya bilan siljitish
      this.animateMarker(courier, position);
      courier.setIcon(this.courierIcons[status]);
    } else {
      // Yangi kuryer marker
      courier = L.marker(position, {
        icon: this.courierIcons[status]
      });
      courier.courierId = courierId;
      this.couriers.addLayer(courier);
    }
  }

  animateMarker(marker, targetPosition) {
    const start = marker.getLatLng();
    const end = L.latLng(targetPosition);
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const lat = start.lat + (end.lat - start.lat) * easeProgress;
      const lng = start.lng + (end.lng - start.lng) * easeProgress;

      marker.setLatLng([lat, lng]);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  // Buyurtma marshrutini ko'rsatish
  showOrderRoute(order) {
    // Oldingi marshrutni tozalash
    this.activeOrders.clearLayers();

    const routeCoords = [
      order.restaurant.coordinates,
      order.customer.coordinates
    ];

    // Marshrut chizig'i
    const route = L.polyline(routeCoords, {
      color: '#3b82f6',
      weight: 4,
      dashArray: '10, 10'
    });
    this.activeOrders.addLayer(route);

    // Restoran marker
    const restaurantMarker = L.marker(order.restaurant.coordinates, {
      icon: this.createRestaurantIcon()
    }).bindPopup(order.restaurant.name);
    this.activeOrders.addLayer(restaurantMarker);

    // Mijoz marker
    const customerMarker = L.marker(order.customer.coordinates, {
      icon: this.createCustomerIcon()
    }).bindPopup(order.customer.address);
    this.activeOrders.addLayer(customerMarker);

    // Xaritani marshrutga moslash
    this.map.fitBounds(route.getBounds(), { padding: [50, 50] });
  }

  // Nuqta zona ichida ekanligini tekshirish
  isInDeliveryZone(point) {
    const latLng = L.latLng(point);

    for (const layer of this.deliveryZones.getLayers()) {
      if (layer instanceof L.Polygon) {
        const bounds = layer.getBounds();

        if (bounds.contains(latLng)) {
          // Ray casting algorithm
          const polyPoints = layer.getLatLngs()[0];
          if (this.pointInPolygon(latLng, polyPoints)) {
            return {
              inZone: true,
              zone: layer.getPopup()?.getContent()
            };
          }
        }
      }
    }

    return { inZone: false };
  }

  pointInPolygon(point, polygon) {
    let inside = false;
    const x = point.lat, y = point.lng;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }
}

// Foydalanish
const deliveryMap = new DeliveryMap('map-container');
deliveryMap.loadDeliveryZones();

// WebSocket orqali kuryer joylashuvini real-time yangilash
const ws = new WebSocket('wss://api.example.com/tracking');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  deliveryMap.updateCourierPosition(data.courierId, data.position, data.status);
};
```

## Performance Tips

### 1. Marker Clustering (ko'p marker uchun)

```javascript
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const markers = L.markerClusterGroup({
  chunkedLoading: true,
  maxClusterRadius: 50,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,

  // Custom cluster icon
  iconCreateFunction: function(cluster) {
    const count = cluster.getChildCount();
    let size, className;

    if (count < 10) {
      size = 'small';
      className = 'marker-cluster-small';
    } else if (count < 100) {
      size = 'medium';
      className = 'marker-cluster-medium';
    } else {
      size = 'large';
      className = 'marker-cluster-large';
    }

    return L.divIcon({
      html: `<div><span>${count}</span></div>`,
      className: `marker-cluster ${className}`,
      iconSize: L.point(40, 40)
    });
  }
});

// Ko'p marker qo'shish
const markersArray = locations.map(loc =>
  L.marker([loc.lat, loc.lng]).bindPopup(loc.name)
);
markers.addLayers(markersArray);
map.addLayer(markers);
```

### 2. Canvas Renderer (ko'p geometriya uchun)

```javascript
// SVG o'rniga Canvas ishlatish
const map = L.map('map', {
  renderer: L.canvas(),
  preferCanvas: true
});

// Yoki ma'lum layer uchun
const polylines = L.layerGroup([], {
  renderer: L.canvas({ padding: 0.5 })
});
```

### 3. Lazy Loading

```javascript
class LazyMapLoader {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.observer = null;

    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.initializeMap();
          this.observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    this.observer.observe(document.getElementById(this.containerId));
  }

  async initializeMap() {
    // Leaflet'ni dinamik yuklash
    const L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');

    this.map = L.map(this.containerId).setView([41.3111, 69.2797], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  }
}
```

### 4. Tile Caching (Service Worker)

```javascript
// sw.js
const TILE_CACHE = 'map-tiles-v1';
const TILE_URLS = [
  'tile.openstreetmap.org',
  'api.mapbox.com'
];

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (TILE_URLS.some(domain => url.host.includes(domain))) {
    event.respondWith(
      caches.open(TILE_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            // Cache'dan qaytarish
            return response;
          }

          return fetch(event.request).then(networkResponse => {
            // Cache'ga saqlash
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});
```

### 5. Viewport-based Loading

```javascript
class ViewportLoader {
  constructor(map) {
    this.map = map;
    this.loadedBounds = [];
    this.markersLayer = L.layerGroup().addTo(map);

    map.on('moveend', () => this.loadVisibleData());
  }

  async loadVisibleData() {
    const bounds = this.map.getBounds();

    // Allaqachon yuklangan bounds'ni tekshirish
    if (this.isBoundsLoaded(bounds)) return;

    const data = await fetch(`/api/locations?bounds=${bounds.toBBoxString()}`);
    const locations = await data.json();

    locations.forEach(loc => {
      // Dublikatlarni tekshirish
      if (!this.markerExists(loc.id)) {
        const marker = L.marker([loc.lat, loc.lng])
          .bindPopup(loc.name);
        marker._locationId = loc.id;
        this.markersLayer.addLayer(marker);
      }
    });

    this.loadedBounds.push(bounds);
    this.cleanOldMarkers();
  }

  isBoundsLoaded(newBounds) {
    return this.loadedBounds.some(b => b.contains(newBounds));
  }

  markerExists(id) {
    return this.markersLayer.getLayers()
      .some(l => l._locationId === id);
  }

  cleanOldMarkers() {
    const currentBounds = this.map.getBounds();
    const padding = 0.5; // 50% buffer

    this.markersLayer.getLayers().forEach(marker => {
      const pos = marker.getLatLng();
      if (!currentBounds.pad(padding).contains(pos)) {
        this.markersLayer.removeLayer(marker);
      }
    });
  }
}
```

## Interview Savollari

### 1. Leaflet vs Mapbox GL JS farqi nimada?

**Javob:**
```
Leaflet:
- DOM/Canvas rendering (2D)
- Kichik o'lcham (42KB)
- Oddiy use case uchun ideal
- Plugin ekotizimi keng
- Bepul

Mapbox GL JS:
- WebGL rendering (3D, smooth zoom)
- Kattaroq (230KB)
- Custom styling, vector tiles
- Pitch/bearing (3D burchak)
- Freemium (1M so'rov bepul)

Tanlash:
- Oddiy xarita kerak → Leaflet
- Custom dizayn, 3D, ko'p ma'lumot → Mapbox GL
```

### 2. 1 million marker'ni qanday ko'rsatasiz?

**Javob:**
```javascript
// 1. Clustering
import 'leaflet.markercluster';

// 2. Canvas rendering
const map = L.map('map', { preferCanvas: true });

// 3. Viewport-based loading
map.on('moveend', () => {
  const bounds = map.getBounds();
  loadMarkersInBounds(bounds);
});

// 4. Data aggregation (backend)
// - Zoom level bo'yicha guruhlash
// - Grid-based aggregation

// 5. WebWorker da data processing
const worker = new Worker('map-worker.js');
worker.postMessage({ type: 'process', data: locations });
```

### 3. Ikki koordinata orasidagi masofani qanday hisoblaysiz?

**Javob:**
```javascript
// Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // meters
}

// Leaflet built-in
const distance = L.latLng(41.31, 69.28).distanceTo(L.latLng(39.65, 66.96));
```

### 4. Offline xarita qanday ishlaydi?

**Javob:**
```
1. Tile Caching:
   - Service Worker bilan tile'larni cache qilish
   - IndexedDB da saqlash

2. Offline Data:
   - GeoJSON lokal saqlash
   - SQLite/IndexedDB da koordinatalar

3. Offline-first arxitektura:
   - Cache birinchi, keyin network
   - Background sync

4. Storage limits:
   - ~50MB default
   - Storage API bilan kengaytirish
```

### 5. Point-in-polygon algoritmi qanday ishlaydi?

**Javob:**
```javascript
// Ray casting algorithm
function pointInPolygon(point, polygon) {
  const x = point[0], y = point[1];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    // Ray nuqtadan o'ngga yo'naltiriladi
    // Polygon qirrasi bilan kesishishlar sanalanadi
    // Toq son kesishish = ichida
    const intersect = ((yi > y) !== (yj > y)) &&
                      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

// O(n) complexity, n = polygon vertices
// Murakkab polygon uchun spatial index kerak (R-tree)
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Memory Leak (Xotira to'lishi) oldini olish:** Vue yoki React da komponent o'chayotganda (`onBeforeUnmount`) har doim `map.remove()` funksiyasini chaqirish esingizdan chiqmasin, bo'lmasa xarita xotirada osilib qolib, dasturni sekinlashtiradi.
2. **Katta ma'lumotlar ustida SVG ishlatmang:** Agar 1000 tadan ortiq Marker chizmoqchi bo'lsangiz, Leaflet qiynalib qoladi (har biri alohida DOM element bo'lgani uchun). Bunday hollarda `L.canvas()` rejimiga o'tish yoki `MarkerCluster` ishlatish shart.
3. **API Keys:** TileLayer manzillari (masalan, Mapbox tiles) kalitlarni (API Key) talab qiladi. U kalitlarni frontend kodi ichida ochiq yozmang (`.env` faylda saqlang).

---

## Xulosa

| Xususiyat | Tavsif / Foydasi |
|-----------|------------------|
| **Asos (Texnologiya)** | 2D DOM va Canvas rendering. 3D obyektlarni natively (tabiiy holatda) qo'llab-quvvatlamaydi. |
| **Qulayligi** | API si juda qisqa va aniq, o'rganish egriligi eng past (Juda oson). O'z og'irligi (bundle size) deyarli sezilmaydi. |
| **Tile System** | Mapbox, OpenStreetMap yoki Yandex kabi istalgan xarita serverini bitta urlda (TileLayer) ulab ketish mumkin. |
| **Kamchiligi** | Har bir element DOM Node (HTML tag) bo'lib yozilgani sababli yirik Big Data bilan ishlashda tezligi pasayadi. |

Leaflet - oddiy va o'rta murakkablikdagi xarita loyihalari (Lokatsiya tanlash, Adres belgilash, hududlarga bo'lish) uchun ideal tanlov. Kichik o'lcham, sodda API va keng plugin ekotizimi uni tezkor ishlab chiqish uchun qulay qiladi. Performance uchun clustering, canvas renderer va viewport-based loading strategiyalarini qo'llang.
