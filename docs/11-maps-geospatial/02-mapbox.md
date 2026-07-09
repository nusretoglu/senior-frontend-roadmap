# Mapbox GL JS - WebGL Asosidagi Professional Xaritalar

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Agar siz zamonaviy taxi (Yandex, Uber), yetkazib berish (Uzum Tezkor, Glovo) kabi professional ilova yaratmoqchi bo'lsangiz, Leaflet'ning kuchi yetmaydi. Sizga real-vaqtda chiziladigan (Vector), binolarni 3D da ko'rsata oladigan va xaritani har tomonga burish imkonini beradigan WebGL dvigateli kerak. Mapbox — butun dunyo geolokatsiya sanoatida (GPS, Logistics) Oltin Standart (Gold Standard) hisoblanadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Rasm ko'rish vs 3D O'yin o'ynash"**  
> Leaflet - bu tayyor chizilgan rasmlar (Rasmli kitob) galereyasi. Siz uni yaqinlashtirganda sifat xiralashishi (pixelate) mumkin, chunki u oddiy rasm (Raster).  
> Mapbox - bu GTA kabi 3D o'yin. Siz xaritaga qaramaysiz, uning ichidasiz. Yo'llar, binolar va daryolar matematik formula orqali sizning brauzeringizning (Video kartasi - WebGL) o'zida real-vaqtda chiziladi (Vector). Shu sababli uni istalgancha aylantirib (Pitch/Bearing), sifatini yo'qotmasdan cheksiz yaqinlashtirishingiz mumkin.

Mapbox GL JS - WebGL texnologiyasidan foydalanadigan zamonaviy xarita kutubxonasi. Vector tiles, 3D binolar, custom styling va smooth zoom/pan tajribasi bilan ajralib turadi. Uber, Strava, Facebook kabi kompaniyalar tomonidan ishlatiladi.
## Leaflet'dan Farqi

| Xususiyat | Leaflet | Mapbox GL JS |
|-----------|---------|--------------|
| Rendering | DOM/Canvas | WebGL |
| Tiles | Raster | Vector |
| 3D | Plugin kerak | Native |
| Custom Style | Cheklangan | To'liq |
| Zoom | Diskret | Continuous |
| Pitch/Bearing | Yo'q | Native |
| O'lcham | 42KB | 230KB |
| Narx | Bepul | Freemium |

## Asosiy Tushunchalar

### Map Initialization

```javascript
// Mapbox GL JS import
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Access token (Mapbox dashboard'dan olinadi)
mapboxgl.accessToken = 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsXXXYYY...';

// Xarita yaratish
const map = new mapboxgl.Map({
  container: 'map', // DOM element ID
  style: 'mapbox://styles/mapbox/streets-v12', // Map style
  center: [69.2797, 41.3111], // [lng, lat] - Leaflet'dan farqli!
  zoom: 12,
  pitch: 45, // 3D burchak (0-85)
  bearing: -17.6, // Aylanish burchagi
  antialias: true
});

// Map ready event
map.on('load', () => {
  console.log('Map loaded');
  // Layer'lar qo'shish shu yerda
});
```

### Style Variants

```javascript
// Built-in styles
const styles = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12',
  navigationDay: 'mapbox://styles/mapbox/navigation-day-v1',
  navigationNight: 'mapbox://styles/mapbox/navigation-night-v1'
};

// Style o'zgartirish
map.setStyle(styles.dark);

// Custom style (Mapbox Studio'da yaratilgan)
map.setStyle('mapbox://styles/yourusername/custom-style-id');
```

### Vector Tiles vs Raster Tiles

```javascript
// Vector tiles - ma'lumot point sifatida keladi, client-side render
// - Kichik bandwidth
// - Dynamic styling
// - Interactive (click, hover)
// - Smooth zoom (no pixelation)

// Raster tiles - oldindan render qilingan image'lar
// - Katta bandwidth
// - Static styling
// - Limited interaction
// - Zoom da pixelation

// Mapbox vector tiles - PBF format
// https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/12/1234/5678.vector.pbf
```

## Sources va Layers

Mapbox GL JS'da ma'lumotlar Source (manba) va Layer (vizualizatsiya) sifatida ajratilgan.

### GeoJSON Source

```javascript
map.on('load', () => {
  // GeoJSON source qo'shish
  map.addSource('restaurants', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: 'Plov Markazi',
            rating: 4.8,
            cuisine: 'uzbek'
          },
          geometry: {
            type: 'Point',
            coordinates: [69.2797, 41.3111]
          }
        }
      ]
    },
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  });

  // Ma'lumotlarni dinamik yangilash
  map.getSource('restaurants').setData(newGeoJSON);
});
```

### Layer Types

```javascript
// 1. Circle Layer (nuqtalar)
map.addLayer({
  id: 'restaurants-circle',
  type: 'circle',
  source: 'restaurants',
  filter: ['!', ['has', 'point_count']], // Cluster'larni exclude
  paint: {
    'circle-radius': [
      'interpolate', ['linear'], ['get', 'rating'],
      3, 4,  // rating 3 = radius 4
      5, 10  // rating 5 = radius 10
    ],
    'circle-color': [
      'match', ['get', 'cuisine'],
      'uzbek', '#22c55e',
      'korean', '#ef4444',
      'italian', '#3b82f6',
      '#6b7280' // default
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff'
  }
});

// 2. Symbol Layer (icon + text)
map.addLayer({
  id: 'restaurants-labels',
  type: 'symbol',
  source: 'restaurants',
  layout: {
    'icon-image': 'restaurant-icon',
    'icon-size': 0.5,
    'text-field': ['get', 'name'],
    'text-font': ['Open Sans Bold'],
    'text-size': 12,
    'text-offset': [0, 1.5],
    'text-anchor': 'top',
    'icon-allow-overlap': false,
    'text-allow-overlap': false
  },
  paint: {
    'text-color': '#333333',
    'text-halo-color': '#ffffff',
    'text-halo-width': 1
  }
});

// 3. Fill Layer (polygon)
map.addLayer({
  id: 'districts',
  type: 'fill',
  source: 'districts',
  paint: {
    'fill-color': [
      'interpolate', ['linear'], ['get', 'population'],
      0, '#f7fbff',
      100000, '#6baed6',
      500000, '#08519c'
    ],
    'fill-opacity': 0.7
  }
});

// 4. Line Layer
map.addLayer({
  id: 'routes',
  type: 'line',
  source: 'routes',
  layout: {
    'line-join': 'round',
    'line-cap': 'round'
  },
  paint: {
    'line-color': '#3b82f6',
    'line-width': 4,
    'line-opacity': 0.8
  }
});

// 5. Fill-extrusion Layer (3D buildings)
map.addLayer({
  id: 'buildings-3d',
  type: 'fill-extrusion',
  source: 'composite',
  'source-layer': 'building',
  paint: {
    'fill-extrusion-color': '#aaaaaa',
    'fill-extrusion-height': ['get', 'height'],
    'fill-extrusion-base': ['get', 'min_height'],
    'fill-extrusion-opacity': 0.6
  }
});
```

### Expressions (Data-Driven Styling)

```javascript
// Expressions - Mapbox'ning DSL'i (domain-specific language)

// Match expression
['match', ['get', 'type'],
  'restaurant', '#22c55e',
  'cafe', '#f59e0b',
  'bar', '#ef4444',
  '#6b7280' // fallback
]

// Interpolate expression
['interpolate', ['linear'], ['zoom'],
  10, 2,  // zoom 10 da size 2
  15, 10, // zoom 15 da size 10
  20, 20  // zoom 20 da size 20
]

// Step expression
['step', ['get', 'point_count'],
  '#51bbd6', // 0 dan kam
  100, '#f1f075', // 100+
  750, '#f28cb1'  // 750+
]

// Conditional expression
['case',
  ['<', ['get', 'price'], 50000], '#22c55e', // arzon
  ['<', ['get', 'price'], 100000], '#f59e0b', // o'rta
  '#ef4444' // qimmat
]

// Coalesce (null handling)
['coalesce', ['get', 'name_uz'], ['get', 'name_ru'], ['get', 'name']]

// Format (rich text)
['format',
  ['get', 'name'], { 'font-scale': 1.2, 'text-font': ['literal', ['Open Sans Bold']] },
  '\n', {},
  ['get', 'address'], { 'font-scale': 0.8, 'text-color': '#666666' }
]
```

## Markers va Popups

### Custom Markers

```javascript
// DOM-based marker (HTMLElement)
const markerElement = document.createElement('div');
markerElement.className = 'custom-marker';
markerElement.innerHTML = `
  <div class="marker-inner">
    <img src="/images/restaurant.svg" alt="Restaurant" />
  </div>
`;

const marker = new mapboxgl.Marker({
  element: markerElement,
  anchor: 'bottom',
  offset: [0, 0],
  draggable: false,
  rotation: 0,
  pitchAlignment: 'viewport',
  rotationAlignment: 'viewport'
})
  .setLngLat([69.2797, 41.3111])
  .addTo(map);

// Popup
const popup = new mapboxgl.Popup({
  offset: 25,
  closeButton: true,
  closeOnClick: true,
  maxWidth: '300px'
})
  .setHTML(`
    <div class="popup-content">
      <h3>Plov Markazi</h3>
      <p>Rating: 4.8 ⭐</p>
      <button onclick="showDetails()">Batafsil</button>
    </div>
  `);

marker.setPopup(popup);

// Popup show/hide
marker.togglePopup();
popup.isOpen(); // boolean
```

### Programmatic Markers (ko'p marker uchun Symbol layer yaxshiroq)

```javascript
// Symbol layer - ko'p marker uchun performance
map.addSource('markers', {
  type: 'geojson',
  data: markersGeoJSON
});

// Custom icon yuklash
map.loadImage('/images/marker.png', (error, image) => {
  if (error) throw error;
  map.addImage('custom-marker', image);

  map.addLayer({
    id: 'markers-layer',
    type: 'symbol',
    source: 'markers',
    layout: {
      'icon-image': 'custom-marker',
      'icon-size': 0.5,
      'icon-anchor': 'bottom'
    }
  });
});
```

## 3D Xaritalar

### 3D Terrain

```javascript
map.on('load', () => {
  // Terrain source
  map.addSource('mapbox-dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
    maxzoom: 14
  });

  // Terrain qo'shish
  map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

  // Sky layer (osmon)
  map.addLayer({
    id: 'sky',
    type: 'sky',
    paint: {
      'sky-type': 'atmosphere',
      'sky-atmosphere-sun': [0.0, 0.0],
      'sky-atmosphere-sun-intensity': 15
    }
  });
});
```

### 3D Buildings

```javascript
// Built-in 3D buildings (Mapbox Streets style'da mavjud)
map.addLayer({
  id: '3d-buildings',
  source: 'composite',
  'source-layer': 'building',
  filter: ['==', 'extrude', 'true'],
  type: 'fill-extrusion',
  minzoom: 15,
  paint: {
    'fill-extrusion-color': [
      'interpolate', ['linear'], ['get', 'height'],
      0, '#d1d5db',
      50, '#9ca3af',
      100, '#6b7280',
      200, '#4b5563'
    ],
    'fill-extrusion-height': [
      'interpolate', ['linear'], ['zoom'],
      15, 0,
      15.05, ['get', 'height']
    ],
    'fill-extrusion-base': [
      'interpolate', ['linear'], ['zoom'],
      15, 0,
      15.05, ['get', 'min_height']
    ],
    'fill-extrusion-opacity': 0.9
  }
});
```

### Camera Animation

```javascript
// Smooth camera flight
map.flyTo({
  center: [69.2797, 41.3111],
  zoom: 16,
  pitch: 60,
  bearing: 45,
  duration: 3000,
  essential: true // Accessibility: animation o'chirilmagan bo'lsa ham ishlaydi
});

// Ease animation
map.easeTo({
  center: [69.2797, 41.3111],
  zoom: 14,
  duration: 1000
});

// Jump (animatsiyasiz)
map.jumpTo({
  center: [69.2797, 41.3111],
  zoom: 10
});

// Rotate animation
function rotateCamera(timestamp) {
  map.rotateTo((timestamp / 100) % 360, { duration: 0 });
  requestAnimationFrame(rotateCamera);
}
```

## Event Handling

### Layer Events

```javascript
// Click event
map.on('click', 'restaurants-circle', (e) => {
  const feature = e.features[0];
  const coordinates = feature.geometry.coordinates.slice();

  // Popup ko'rsatish
  new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML(`<h3>${feature.properties.name}</h3>`)
    .addTo(map);
});

// Hover effect
map.on('mouseenter', 'restaurants-circle', () => {
  map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'restaurants-circle', () => {
  map.getCanvas().style.cursor = '';
});

// Hover highlight
let hoveredId = null;

map.on('mousemove', 'districts', (e) => {
  if (e.features.length > 0) {
    if (hoveredId !== null) {
      map.setFeatureState(
        { source: 'districts', id: hoveredId },
        { hover: false }
      );
    }
    hoveredId = e.features[0].id;
    map.setFeatureState(
      { source: 'districts', id: hoveredId },
      { hover: true }
    );
  }
});

// Feature state bilan styling
map.addLayer({
  id: 'districts-fill',
  type: 'fill',
  source: 'districts',
  paint: {
    'fill-color': '#627BC1',
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1,
      0.5
    ]
  }
});
```

### Map Events

```javascript
// Zoom events
map.on('zoom', () => {
  console.log('Current zoom:', map.getZoom());
});

// Move event (pan + zoom)
map.on('moveend', () => {
  const center = map.getCenter();
  const bounds = map.getBounds();

  // Viewport ichidagi ma'lumotlarni yuklash
  loadDataForViewport(bounds);
});

// Render events
map.on('render', () => {
  // Har frame da chaqiriladi
});

map.on('idle', () => {
  // Xarita to'liq render bo'lgach
});
```

## Geocoding (Address Search)

```javascript
// Mapbox Geocoding API
async function geocode(query) {
  const accessToken = mapboxgl.accessToken;
  const endpoint = 'mapbox.places';

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/${endpoint}/${encodeURIComponent(query)}.json?` +
    `access_token=${accessToken}&` +
    `country=UZ&` +
    `language=uz&` +
    `limit=5`
  );

  const data = await response.json();

  return data.features.map(feature => ({
    name: feature.place_name,
    coordinates: feature.center, // [lng, lat]
    type: feature.place_type[0],
    context: feature.context
  }));
}

// Reverse geocoding
async function reverseGeocode(lng, lat) {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
    `access_token=${mapboxgl.accessToken}&` +
    `language=uz`
  );

  const data = await response.json();
  return data.features[0]?.place_name || 'Noma\'lum joy';
}

// Search box component
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  placeholder: 'Manzil qidirish...',
  countries: 'uz',
  language: 'uz',
  marker: true,
  proximity: {
    longitude: 69.2797,
    latitude: 41.3111
  }
});

map.addControl(geocoder);

geocoder.on('result', (e) => {
  console.log('Selected:', e.result);
});
```

## Directions (Routing)

```javascript
// Mapbox Directions API
async function getRoute(start, end, profile = 'driving') {
  // Profiles: driving, walking, cycling, driving-traffic
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/${profile}/` +
    `${start[0]},${start[1]};${end[0]},${end[1]}?` +
    `geometries=geojson&` +
    `steps=true&` +
    `overview=full&` +
    `language=ru&` + // O'zbek yo'q, ruscha yaxshiroq
    `access_token=${mapboxgl.accessToken}`
  );

  const data = await response.json();
  const route = data.routes[0];

  return {
    distance: route.distance, // meters
    duration: route.duration, // seconds
    geometry: route.geometry, // GeoJSON LineString
    steps: route.legs[0].steps.map(step => ({
      instruction: step.maneuver.instruction,
      distance: step.distance,
      duration: step.duration
    }))
  };
}

// Marshrutni xaritada ko'rsatish
async function displayRoute(start, end) {
  const route = await getRoute(start, end);

  // Route source
  if (map.getSource('route')) {
    map.getSource('route').setData(route.geometry);
  } else {
    map.addSource('route', {
      type: 'geojson',
      data: route.geometry
    });

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });
  }

  // Fit bounds
  const coordinates = route.geometry.coordinates;
  const bounds = coordinates.reduce((bounds, coord) => {
    return bounds.extend(coord);
  }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

  map.fitBounds(bounds, { padding: 50 });

  return route;
}
```

## Vue.js Integratsiya

```vue
<template>
  <div ref="mapContainer" class="map-container" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const props = defineProps({
  center: {
    type: Array,
    default: () => [69.2797, 41.3111]
  },
  zoom: {
    type: Number,
    default: 12
  },
  style: {
    type: String,
    default: 'mapbox://styles/mapbox/streets-v12'
  },
  pitch: {
    type: Number,
    default: 0
  },
  markers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['load', 'click', 'markerClick', 'moveend']);

const mapContainer = ref(null);
const map = shallowRef(null); // shallowRef - Mapbox object reactive bo'lmasligi kerak
const markersRef = shallowRef([]);

onMounted(() => {
  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: props.style,
    center: props.center,
    zoom: props.zoom,
    pitch: props.pitch
  });

  // Navigation control
  map.value.addControl(new mapboxgl.NavigationControl());

  // Geolocation control
  map.value.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true
  }));

  // Events
  map.value.on('load', () => {
    emit('load', map.value);
    renderMarkers();
  });

  map.value.on('click', (e) => {
    emit('click', {
      lngLat: e.lngLat,
      point: e.point
    });
  });

  map.value.on('moveend', () => {
    emit('moveend', {
      center: map.value.getCenter(),
      zoom: map.value.getZoom(),
      bounds: map.value.getBounds()
    });
  });
});

onUnmounted(() => {
  // Cleanup markers
  markersRef.value.forEach(m => m.remove());

  // Cleanup map
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

// Markers reactivity
watch(() => props.markers, renderMarkers, { deep: true });

function renderMarkers() {
  if (!map.value) return;

  // Eski markerlarni o'chirish
  markersRef.value.forEach(m => m.remove());
  markersRef.value = [];

  // Yangi markerlar
  props.markers.forEach(markerData => {
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(markerData.popup || `<strong>${markerData.name}</strong>`);

    const marker = new mapboxgl.Marker({ color: markerData.color || '#3b82f6' })
      .setLngLat([markerData.lng, markerData.lat])
      .setPopup(popup)
      .addTo(map.value);

    marker.getElement().addEventListener('click', () => {
      emit('markerClick', markerData);
    });

    markersRef.value.push(marker);
  });
}

// Watch style changes
watch(() => props.style, (newStyle) => {
  if (map.value) {
    map.value.setStyle(newStyle);
  }
});

// Exposed methods
defineExpose({
  getMap: () => map.value,
  flyTo: (center, zoom) => map.value?.flyTo({ center, zoom }),
  fitBounds: (bounds, options) => map.value?.fitBounds(bounds, options)
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>
```

## Real-World Case: Real-Time Fleet Tracking

```javascript
class FleetTracker {
  constructor(map) {
    this.map = map;
    this.vehicles = new Map();
    this.routeHistory = new Map();

    this.initializeLayers();
    this.connectWebSocket();
  }

  initializeLayers() {
    // Vehicles source
    this.map.addSource('vehicles', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });

    // Vehicle icon yuklash
    this.map.loadImage('/images/car-icon.png', (error, image) => {
      if (error) throw error;
      this.map.addImage('car-icon', image);

      // Vehicles layer
      this.map.addLayer({
        id: 'vehicles',
        type: 'symbol',
        source: 'vehicles',
        layout: {
          'icon-image': 'car-icon',
          'icon-size': 0.5,
          'icon-rotate': ['get', 'bearing'],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true
        }
      });
    });

    // Route history source
    this.map.addSource('routes', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });

    this.map.addLayer({
      id: 'routes',
      type: 'line',
      source: 'routes',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 3,
        'line-opacity': 0.6
      }
    });
  }

  connectWebSocket() {
    this.ws = new WebSocket('wss://api.fleet.example.com/tracking');

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleVehicleUpdate(data);
    };

    this.ws.onclose = () => {
      // Reconnect logic
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  handleVehicleUpdate(data) {
    const { vehicleId, position, bearing, speed, status } = data;

    // Vehicle ma'lumotlarini yangilash
    this.vehicles.set(vehicleId, {
      id: vehicleId,
      position,
      bearing,
      speed,
      status,
      timestamp: Date.now()
    });

    // Route history'ga qo'shish
    if (!this.routeHistory.has(vehicleId)) {
      this.routeHistory.set(vehicleId, []);
    }
    this.routeHistory.get(vehicleId).push(position);

    // Keep last 100 points
    if (this.routeHistory.get(vehicleId).length > 100) {
      this.routeHistory.get(vehicleId).shift();
    }

    this.updateMap();
  }

  updateMap() {
    // Vehicles GeoJSON
    const vehiclesGeoJSON = {
      type: 'FeatureCollection',
      features: Array.from(this.vehicles.values()).map(v => ({
        type: 'Feature',
        properties: {
          id: v.id,
          bearing: v.bearing,
          speed: v.speed,
          status: v.status
        },
        geometry: {
          type: 'Point',
          coordinates: v.position
        }
      }))
    };

    this.map.getSource('vehicles').setData(vehiclesGeoJSON);

    // Routes GeoJSON
    const routesGeoJSON = {
      type: 'FeatureCollection',
      features: Array.from(this.routeHistory.entries()).map(([id, coords]) => ({
        type: 'Feature',
        properties: {
          id,
          color: this.getVehicleColor(id)
        },
        geometry: {
          type: 'LineString',
          coordinates: coords
        }
      }))
    };

    this.map.getSource('routes').setData(routesGeoJSON);
  }

  getVehicleColor(vehicleId) {
    const vehicle = this.vehicles.get(vehicleId);
    const colors = {
      moving: '#22c55e',
      idle: '#f59e0b',
      offline: '#ef4444'
    };
    return colors[vehicle?.status] || '#6b7280';
  }

  // Vehicle'ga focus qilish
  focusVehicle(vehicleId) {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return;

    this.map.flyTo({
      center: vehicle.position,
      zoom: 16,
      pitch: 60
    });
  }

  // Barcha vehicle'larni ko'rish
  fitAllVehicles() {
    if (this.vehicles.size === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    this.vehicles.forEach(v => bounds.extend(v.position));
    this.map.fitBounds(bounds, { padding: 50 });
  }

  // Geofence tekshirish
  checkGeofence(vehicleId, geofencePolygon) {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return null;

    const point = turf.point(vehicle.position);
    const polygon = turf.polygon([geofencePolygon]);

    return turf.booleanPointInPolygon(point, polygon);
  }

  cleanup() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Foydalanish
const map = new mapboxgl.Map({ /* ... */ });
map.on('load', () => {
  const tracker = new FleetTracker(map);

  // UI controls
  document.getElementById('fit-all').onclick = () => tracker.fitAllVehicles();
});
```

## Performance Tips

### 1. Layer Optimization

```javascript
// Filter - keraksiz feature'larni exclude qilish
map.addLayer({
  id: 'my-layer',
  type: 'circle',
  source: 'my-source',
  filter: ['all',
    ['==', '$type', 'Point'],
    ['>=', ['get', 'rating'], 4]
  ]
});

// minzoom/maxzoom - zoom levelda ko'rsatish/yashirish
map.addLayer({
  id: 'detailed-layer',
  type: 'symbol',
  source: 'places',
  minzoom: 14,
  maxzoom: 20
});
```

### 2. Source Optimization

```javascript
// Cluster - ko'p nuqtalar uchun
map.addSource('points', {
  type: 'geojson',
  data: pointsGeoJSON,
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50,
  clusterProperties: {
    sum: ['+', ['get', 'value']],
    max: ['max', ['get', 'value']]
  }
});

// Buffer - viewport atrofidagi ma'lumotlarni oldindan yuklash
map.addSource('my-source', {
  type: 'geojson',
  data: myData,
  buffer: 128 // default 128, 0 = no buffer
});

// Tolerance - geometriya simplification
map.addSource('polygons', {
  type: 'geojson',
  data: polygonsGeoJSON,
  tolerance: 0.5 // zoom darajasiga qarab simplify
});
```

### 3. Dynamic Data Loading

```javascript
// Viewport-based loading
map.on('moveend', debounce(async () => {
  const bounds = map.getBounds();
  const zoom = map.getZoom();

  // Faqat yetarli zoom'da detailed ma'lumot
  if (zoom < 10) return;

  const data = await fetch(
    `/api/locations?bbox=${bounds.toArray().flat().join(',')}&zoom=${Math.floor(zoom)}`
  ).then(r => r.json());

  map.getSource('locations').setData(data);
}, 300));
```

### 4. Image/Icon Optimization

```javascript
// SDF icons - bitta icon, ko'p ranglar
map.loadImage('/icons/marker.png', { sdf: true }, (error, image) => {
  map.addImage('marker-sdf', image, { sdf: true });
});

// Sprite atlas - ko'p iconlarni bitta faylda
// style.json da: "sprite": "https://example.com/sprites/mapbox"

// Icon atlasni lazy load
map.on('styleimagemissing', (e) => {
  const id = e.id;
  loadIcon(id).then(image => {
    if (!map.hasImage(id)) {
      map.addImage(id, image);
    }
  });
});
```

## Interview Savollari

### 1. Vector tiles vs Raster tiles farqi?

**Javob:**
```
Vector Tiles:
- Ma'lumot vektor formatda (PBF/MVT)
- Client-side rendering (WebGL)
- Kichik fayl hajmi (10x kam)
- Dynamic styling (runtime'da rang o'zgartirish)
- Smooth zoom (fractional zoom)
- Interaktiv (click, hover)

Raster Tiles:
- Oldindan render qilingan PNG/JPG
- Server-side rendering
- Katta fayl hajmi
- Statik styling
- Discrete zoom (1, 2, 3...)
- Cheklangan interaktivlik

Qachon nima:
- Vector: Custom branding, interactive maps, mobile
- Raster: Satellite imagery, legacy systems
```

### 2. Mapbox Expression'lar qanday ishlaydi?

**Javob:**
```javascript
// Expressions - deklarativ DSL
// Array formatida: [operator, ...arguments]

// 1. Data expressions - feature properties'dan o'qish
['get', 'property_name'] // feature.properties.property_name
['has', 'property_name'] // property mavjudmi
['geometry-type'] // Point, LineString, Polygon

// 2. Decision expressions
['case', condition1, value1, condition2, value2, fallback]
['match', input, value1, output1, value2, output2, fallback]
['coalesce', value1, value2] // birinchi non-null

// 3. Math expressions
['+', 1, 2] // 3
['*', ['get', 'width'], ['get', 'height']]
['interpolate', ['linear'], ['zoom'], 10, 1, 20, 10]

// 4. String expressions
['concat', 'Hello ', ['get', 'name']]
['upcase', ['get', 'title']]

// Advantage: JSON-serializable, no eval(), declarative
```

### 3. 3D binolar qanday render qilinadi?

**Javob:**
```javascript
// Fill-extrusion layer type
// WebGL orqali 3D polygon render

// Kerakli ma'lumotlar:
// - height: bino balandligi
// - min_height: pastki qism (ko'tarma binolar uchun)
// - footprint: polygon koordinatalari

// Rendering pipeline:
// 1. Triangulation - polygon uchburchaklarga bo'linadi
// 2. Extrusion - 2D polygon 3D prizma'ga aylanadi
// 3. Shading - yorug'lik va soya
// 4. Z-ordering - to'g'ri tartibda render

// Performance:
// - Level of Detail (LOD) - zoom'ga qarab simplify
// - Frustum culling - viewport tashqaridasini skip
// - Batching - ko'p binolarni bitta draw call
```

### 4. Real-time tracking qanday implement qilinadi?

**Javob:**
```javascript
// 1. WebSocket connection
const ws = new WebSocket('wss://api.example.com/tracking');

// 2. GeoJSON source with setData
ws.onmessage = (e) => {
  const positions = JSON.parse(e.data);
  const geojson = positionsToGeoJSON(positions);
  map.getSource('vehicles').setData(geojson);
};

// 3. Smooth animation (optional)
function animateMarker(from, to, duration) {
  const start = Date.now();

  function frame() {
    const progress = (Date.now() - start) / duration;
    if (progress >= 1) return;

    const lng = from[0] + (to[0] - from[0]) * progress;
    const lat = from[1] + (to[1] - from[1]) * progress;

    marker.setLngLat([lng, lat]);
    requestAnimationFrame(frame);
  }

  frame();
}

// 4. Bearing calculation
function calculateBearing(from, to) {
  const dLng = (to[0] - from[0]) * Math.PI / 180;
  const lat1 = from[1] * Math.PI / 180;
  const lat2 = to[1] * Math.PI / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
```

### 5. Mapbox narxlash modeli qanday?

**Javob:**
```
Mapbox Pricing (2024):
- Map loads: $5 per 1,000 (50,000 bepul/oy)
- Geocoding: $5 per 1,000 (100,000 bepul/oy)
- Directions: $5 per 1,000 (100,000 bepul/oy)
- Static images: $5 per 1,000 (50,000 bepul/oy)

Optimization:
1. Tile caching (Service Worker)
2. Session-based billing (1 session = 1 user = unlimited tiles)
3. Self-hosted tiles (enterprise)
4. Batch geocoding vs real-time

Alternative:
- MapLibre GL (open-source fork, bepul)
- Self-hosted tiles (OpenMapTiles)
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Pullik xizmat (Billing) nazorati:** Mapbox - bu pullik xizmat (Freemium). Sizning obunangiz API Key (Token) orqali ishlaydi. Agar siz API Key ni frontend da himoyasiz qoldirsangiz, kimdir uni o'g'irlab, sizga minglab dollar zarar keltirishi mumkin. Har doim `URL Restriction` (Faqat sizning domeningizda ishlashi) ni Mapbox sozlamalarida yoqib qo'ying.
2. **MapLibre GL alternativi:** 2020-yilda Mapbox o'zining ochiq kodli litsenziyasini o'zgartirib yopiqroq (pullik) modelga o'tgach, hamjamiyat MapLibre GL ni yaratdi. Agar byudjetingiz nol bo'lsa va to'liq tekin, ochiq-kodli Mapbox ekvivalentini izlayotgan bo'lsangiz MapLibre GL ni tanlang.
3. **Layerlar ketma-ketligi (Z-Index):** Mapbox'da hamma narsa Canvas ichiga bitta rasm bo'lib chiziladi (DOM elementlar emas). Shuning uchun yo'llar, suv havzalari va poligonlarni qo'shayotganda ularning ID ketma-ketligiga (qaysi biri oldinda, qaysi biri orqada turishiga) qattiq e'tibor bering.

---

## Xulosa

| Xususiyat | Tavsif / Foydasi |
|-----------|------------------|
| **Asos (Texnologiya)** | Kompyuterning Video kartasidan (GPU) to'g'ridan-to'g'ri foydalanuvchi WebGL texnologiyasi. |
| **Data formati** | Vector Tiles (Vektor format). Ya'ni rasm (PNG) emas, balki "Yo'l chiz" degan kod keladi, brauzer o'zi chizadi. |
| **Katta ustunligi** | Kamera (Pitch/Bearing) ni burib 3D ko'rinishda (osmono'par binolar bilan) shaharni tomosha qilish imkoniyati. Smooth (Silliq) zoom. |
| **Kamchiligi** | Pullik xizmat (Bepul limiti tugagach pul yechadi). Mapbox Studio orqali ishlash boshlanishiga qiyin ko'rinishi mumkin. |

Mapbox GL JS - professional darajadagi (Enterprise, Logistics, Delivery) xaritalar uchun eng kuchli kutubxona. WebGL rendering, vector tiles va 3D qo'llab-quvvatlash uni katta loyihalar uchun ideal qiladi. Agar bepul va aynan shunday texnologiya kerak bo'lsa MapLibre GL alternativ sifatida ko'rib chiqilishi qat'iy tavsiya etiladi.
