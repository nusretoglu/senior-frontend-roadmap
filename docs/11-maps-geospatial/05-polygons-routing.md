# Polygons va Routing - Hududlar va Marshrutlar

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchilar uchun xaritaga oddiygina piktogramma (Marker) qo'yish unchalik qiyin emas. Lekin "Yandex.Eda da yetkazib berish zonasini chizish" yoki "Yandex.Taxi da mashina hozirgi nuqtadan sizgacha yetib keladigan eng qisqa marshrut chizig'i (Routing)" kabi real biznes muammolari faqatgina Polygon'lar va Marshrutlash algoritmlari (Routing) yordamida hal qilinadi. Bularni bilish logistika yoki yetkazib berish domenlarida ishlaydigan Senior mutaxassis uchun hayotiy zaruratdir.

> [!NOTE]
> **Real-hayot analogiyasi: "Hovli o'rash va Manzilga borish"**  
> Polygon — bu hovlingiz atrofini devor bilan o'rashga o'xshaydi. Devor ichida bo'lsangiz xavfsizsiz (ichkarida), tashqarida bo'lsangiz boshqa zona (tashqarida). Geofencing (Geo-hudud) huddi shu devor. Siz aytilgan devor (Polygon) ichiga kirsangiz telefoningizga sms kelishi yoki yetkazib berish narxi o'zgarishi shunga asoslangan.  
> Routing — bu shunchaki ikkita nuqtani to'g'ri chiziq bilan tutashtirish emas, balki haqiqiy yo'llar, ko'chalar, qayrilishlar va svetoforlarni hisobga olib qilingan GPS yo'riqnomasidir.

Geospatial ilovalarning muhim qismi - hududlar (polygons) va marshrutlar (routing) bilan ishlash. Yetkazib berish zonalari, geofencing, marshrut optimizatsiyasi va boshqa ko'plab amaliy vazifalar uchun bu bilimlar zarur.
## Polygons Nazariyasi

### Polygon Turlari

```
1. Simple Polygon (Oddiy polygon)
   - Kesishmaydigan qirralar
   - Bitta tashqi chegarasi
   ┌───────────┐
   │           │
   │           │
   └───────────┘

2. Convex Polygon (Qavariq)
   - Barcha ichki burchaklar < 180°
   - Istalgan ikki nuqta orasidagi chiziq ichida
       /\
      /  \
     /    \
    /______\

3. Concave Polygon (Botiq)
   - Kamida bitta ichki burchak > 180°
   - "L" shakli, yulduz, murakkab shakllar
    ____
   |    |___
   |        |
   |________|

4. Multi-Polygon
   - Bir nechta alohida polygon
   - Ko'pgina davlatlar, orollar
   [Polygon1] [Polygon2] [Polygon3]

5. Polygon with Holes (Teshikli)
   - Ichida bo'sh joy
   - Ring: tashqi chegarasi, holes: ichki chegaralar
   ┌──────────────┐
   │  ┌────────┐  │
   │  │ (hole) │  │
   │  └────────┘  │
   └──────────────┘
```

### Koordinata Tartib (Winding Order)

```javascript
// GeoJSON standarti:
// - Outer ring: Counter-clockwise (soat miliga qarshi)
// - Inner ring (holes): Clockwise (soat mili bo'yicha)

// To'g'ri tartib
const polygon = {
  type: 'Polygon',
  coordinates: [
    // Outer ring (CCW)
    [
      [69.20, 41.35], // Top-left
      [69.35, 41.35], // Top-right
      [69.35, 41.25], // Bottom-right
      [69.20, 41.25], // Bottom-left
      [69.20, 41.35]  // Close (= start)
    ],
    // Hole (CW) - optional
    [
      [69.25, 41.32],
      [69.25, 41.28],
      [69.30, 41.28],
      [69.30, 41.32],
      [69.25, 41.32]
    ]
  ]
};

// Winding order tekshirish
function isClockwise(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    sum += (x2 - x1) * (y2 + y1);
  }
  return sum > 0;
}

// Ring'ni reverse qilish
function reverseRing(ring) {
  return [...ring].reverse();
}
```

## Polygon Chizish va Tahrirlash

### Leaflet Draw

```javascript
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

// FeatureGroup - chizilgan elementlar uchun
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Draw Control
const drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems,
    remove: true
  },
  draw: {
    polygon: {
      allowIntersection: false, // Kesishishni taqiqlash
      showArea: true, // Area ko'rsatish
      shapeOptions: {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.3,
        weight: 2
      },
      metric: true, // Metrik tizim
      feet: false
    },
    polyline: {
      shapeOptions: {
        color: '#22c55e',
        weight: 4
      }
    },
    circle: {
      shapeOptions: {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.3
      }
    },
    rectangle: true,
    marker: true,
    circlemarker: false
  }
});

map.addControl(drawControl);

// Events
map.on('draw:created', function(event) {
  const layer = event.layer;
  const type = event.layerType;

  if (type === 'polygon') {
    const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
    layer.bindPopup(`Area: ${(area / 1000000).toFixed(2)} km²`);
  }

  if (type === 'polyline') {
    const length = calculateLength(layer.getLatLngs());
    layer.bindPopup(`Length: ${(length / 1000).toFixed(2)} km`);
  }

  drawnItems.addLayer(layer);

  // GeoJSON export
  const geojson = layer.toGeoJSON();
  console.log(JSON.stringify(geojson));

  // Server'ga saqlash
  savePolygon(geojson);
});

map.on('draw:edited', function(event) {
  const layers = event.layers;
  layers.eachLayer(function(layer) {
    updatePolygon(layer.toGeoJSON());
  });
});

map.on('draw:deleted', function(event) {
  const layers = event.layers;
  layers.eachLayer(function(layer) {
    deletePolygon(layer.toGeoJSON().properties.id);
  });
});

// Length hisoblash
function calculateLength(latlngs) {
  let length = 0;
  for (let i = 0; i < latlngs.length - 1; i++) {
    length += latlngs[i].distanceTo(latlngs[i + 1]);
  }
  return length;
}
```

### Mapbox GL Draw

```javascript
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    line_string: true,
    point: true,
    trash: true
  },
  defaultMode: 'simple_select',

  // Custom styles
  styles: [
    // Active polygon
    {
      id: 'gl-draw-polygon-fill-active',
      type: 'fill',
      filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
      paint: {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.3
      }
    },
    // Inactive polygon
    {
      id: 'gl-draw-polygon-fill-inactive',
      type: 'fill',
      filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
      paint: {
        'fill-color': '#22c55e',
        'fill-opacity': 0.2
      }
    },
    // Polygon stroke
    {
      id: 'gl-draw-polygon-stroke',
      type: 'line',
      filter: ['all', ['==', '$type', 'Polygon']],
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2
      }
    },
    // Vertex points
    {
      id: 'gl-draw-vertex',
      type: 'circle',
      filter: ['all', ['==', 'meta', 'vertex']],
      paint: {
        'circle-radius': 6,
        'circle-color': '#ffffff',
        'circle-stroke-color': '#3b82f6',
        'circle-stroke-width': 2
      }
    }
  ]
});

map.addControl(draw);

// Events
map.on('draw.create', updateArea);
map.on('draw.delete', updateArea);
map.on('draw.update', updateArea);

function updateArea(e) {
  const data = draw.getAll();

  if (data.features.length > 0) {
    const area = turf.area(data); // Turf.js
    console.log(`Total area: ${(area / 1000000).toFixed(2)} km²`);
  }
}

// Programmatic drawing
draw.changeMode('draw_polygon');

// Get drawn features
const allFeatures = draw.getAll();
const specificFeature = draw.get('feature_id');

// Delete feature
draw.delete('feature_id');
draw.deleteAll();

// Add feature programmatically
draw.add({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [69.20, 41.35],
      [69.35, 41.35],
      [69.35, 41.25],
      [69.20, 41.25],
      [69.20, 41.35]
    ]]
  }
});
```

## Geospatial Operatsiyalar (Turf.js)

### Point-in-Polygon

```javascript
import * as turf from '@turf/turf';

// Nuqta polygon ichida ekanligini tekshirish
const point = turf.point([69.2797, 41.3111]);
const polygon = turf.polygon([[
  [69.20, 41.35],
  [69.35, 41.35],
  [69.35, 41.25],
  [69.20, 41.25],
  [69.20, 41.35]
]]);

const isInside = turf.booleanPointInPolygon(point, polygon);
console.log('Inside:', isInside);

// Multiple polygons tekshirish
function findContainingZone(point, zones) {
  for (const zone of zones.features) {
    if (turf.booleanPointInPolygon(point, zone)) {
      return zone;
    }
  }
  return null;
}
```

### Buffer va Offset

```javascript
// Polygon atrofida buffer yaratish
const zone = turf.polygon([[/* coords */]]);

// 500 metr buffer
const buffered = turf.buffer(zone, 500, { units: 'meters' });

// Negative buffer (ichiga tortish)
const shrunk = turf.buffer(zone, -100, { units: 'meters' });

// Line buffer
const road = turf.lineString([[69.25, 41.30], [69.30, 41.35]]);
const roadBuffer = turf.buffer(road, 50, { units: 'meters' });
```

### Boolean Operations

```javascript
// Union - birlashish
const zone1 = turf.polygon([[/* coords1 */]]);
const zone2 = turf.polygon([[/* coords2 */]]);
const union = turf.union(turf.featureCollection([zone1, zone2]));

// Intersection - kesishish
const intersection = turf.intersect(turf.featureCollection([zone1, zone2]));

// Difference - ayirish
const difference = turf.difference(turf.featureCollection([zone1, zone2]));

// Real example: Yetkazib berish zonasidan exclude qilish
const deliveryZone = turf.polygon([[/* main zone */]]);
const restrictedArea = turf.polygon([[/* park, etc */]]);
const effectiveZone = turf.difference(
  turf.featureCollection([deliveryZone, restrictedArea])
);
```

### Area va Perimeter

```javascript
// Area (m²)
const area = turf.area(polygon);
console.log(`Area: ${(area / 1000000).toFixed(2)} km²`);

// Perimeter
const perimeter = turf.length(turf.polygonToLine(polygon), { units: 'kilometers' });
console.log(`Perimeter: ${perimeter.toFixed(2)} km`);

// Centroid (markaz nuqtasi)
const centroid = turf.centroid(polygon);

// Bounding box
const bbox = turf.bbox(polygon);
// [minX, minY, maxX, maxY]
```

### Simplification

```javascript
// Polygon simplification (performance uchun)
const simplified = turf.simplify(polygon, {
  tolerance: 0.01, // Tolerans (degree)
  highQuality: true
});

// Adaptive simplification
function adaptiveSimplify(polygon, zoom) {
  const tolerances = {
    5: 0.1,
    10: 0.01,
    15: 0.001,
    20: 0.0001
  };

  const tolerance = tolerances[Math.floor(zoom)] || 0.001;
  return turf.simplify(polygon, { tolerance });
}
```

## Geofencing

### Geofence Implementation

```javascript
class Geofence {
  constructor(options) {
    this.zones = new Map();
    this.onEnter = options.onEnter || (() => {});
    this.onExit = options.onExit || (() => {});
    this.onDwell = options.onDwell || (() => {});

    this.currentZones = new Set();
    this.dwellTimers = new Map();
    this.dwellThreshold = options.dwellThreshold || 60000; // 1 minute
  }

  addZone(id, polygon, metadata = {}) {
    this.zones.set(id, {
      polygon: turf.polygon(polygon),
      metadata
    });
  }

  removeZone(id) {
    this.zones.delete(id);
    this.dwellTimers.delete(id);
  }

  checkPosition(lat, lng) {
    const point = turf.point([lng, lat]);
    const newZones = new Set();

    for (const [id, zone] of this.zones) {
      const isInside = turf.booleanPointInPolygon(point, zone.polygon);

      if (isInside) {
        newZones.add(id);

        // Enter event
        if (!this.currentZones.has(id)) {
          this.onEnter({
            zoneId: id,
            metadata: zone.metadata,
            timestamp: Date.now()
          });

          // Start dwell timer
          this.dwellTimers.set(id, setTimeout(() => {
            this.onDwell({
              zoneId: id,
              metadata: zone.metadata,
              dwellTime: this.dwellThreshold
            });
          }, this.dwellThreshold));
        }
      }
    }

    // Exit events
    for (const id of this.currentZones) {
      if (!newZones.has(id)) {
        const zone = this.zones.get(id);
        this.onExit({
          zoneId: id,
          metadata: zone?.metadata,
          timestamp: Date.now()
        });

        // Clear dwell timer
        if (this.dwellTimers.has(id)) {
          clearTimeout(this.dwellTimers.get(id));
          this.dwellTimers.delete(id);
        }
      }
    }

    this.currentZones = newZones;

    return {
      inside: Array.from(newZones),
      outside: Array.from(this.zones.keys()).filter(id => !newZones.has(id))
    };
  }
}

// Foydalanish
const geofence = new Geofence({
  onEnter: (event) => {
    console.log(`Entered zone: ${event.zoneId}`);
    sendNotification(`Siz ${event.metadata.name} zonasiga kirdingiz`);
  },
  onExit: (event) => {
    console.log(`Exited zone: ${event.zoneId}`);
  },
  onDwell: (event) => {
    console.log(`Dwelling in zone: ${event.zoneId} for ${event.dwellTime}ms`);
  },
  dwellThreshold: 30000 // 30 seconds
});

// Add delivery zones
geofence.addZone('zone-1', [[
  [69.20, 41.35],
  [69.25, 41.35],
  [69.25, 41.30],
  [69.20, 41.30],
  [69.20, 41.35]
]], { name: 'Toshkent markaz', deliveryFee: 10000 });

// Watch position
navigator.geolocation.watchPosition((position) => {
  const result = geofence.checkPosition(
    position.coords.latitude,
    position.coords.longitude
  );

  updateUI(result);
});
```

## Routing (Marshrut)

### Routing API'lar

```javascript
// 1. OSRM (Open Source Routing Machine)
async function getOSRMRoute(start, end, profile = 'driving') {
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/${profile}/` +
    `${start[0]},${start[1]};${end[0]},${end[1]}?` +
    `overview=full&geometries=geojson&steps=true`
  );

  const data = await response.json();

  if (data.code !== 'Ok') {
    throw new Error('Routing failed');
  }

  const route = data.routes[0];

  return {
    distance: route.distance, // meters
    duration: route.duration, // seconds
    geometry: route.geometry, // GeoJSON LineString
    steps: route.legs[0].steps.map(step => ({
      instruction: step.maneuver.modifier ?
        `${step.maneuver.type} ${step.maneuver.modifier}` :
        step.maneuver.type,
      distance: step.distance,
      duration: step.duration,
      name: step.name
    }))
  };
}

// 2. Mapbox Directions API
async function getMapboxRoute(start, end, profile = 'driving') {
  const accessToken = 'YOUR_MAPBOX_TOKEN';

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/${profile}/` +
    `${start[0]},${start[1]};${end[0]},${end[1]}?` +
    `geometries=geojson&steps=true&overview=full&` +
    `access_token=${accessToken}`
  );

  const data = await response.json();
  return data.routes[0];
}

// 3. GraphHopper (self-hosted mumkin)
async function getGraphHopperRoute(start, end, profile = 'car') {
  const response = await fetch(
    `https://graphhopper.com/api/1/route?` +
    `point=${start[1]},${start[0]}&point=${end[1]},${end[0]}&` +
    `vehicle=${profile}&locale=ru&` +
    `key=YOUR_API_KEY`
  );

  const data = await response.json();
  return data.paths[0];
}
```

### Multi-stop Routing

```javascript
// Ko'p nuqtali marshrut
async function getMultiStopRoute(waypoints, options = {}) {
  const {
    profile = 'driving',
    optimize = false // Waypoints tartibi optimizatsiya
  } = options;

  const coords = waypoints.map(wp => `${wp[0]},${wp[1]}`).join(';');

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}?` +
    `geometries=geojson&overview=full&steps=true&` +
    `access_token=${MAPBOX_TOKEN}`
  );

  const data = await response.json();

  return {
    totalDistance: data.routes[0].distance,
    totalDuration: data.routes[0].duration,
    geometry: data.routes[0].geometry,
    legs: data.routes[0].legs.map((leg, i) => ({
      from: waypoints[i],
      to: waypoints[i + 1],
      distance: leg.distance,
      duration: leg.duration,
      steps: leg.steps
    }))
  };
}

// Optimized route (Traveling Salesman Problem - TSP)
async function getOptimizedRoute(waypoints) {
  // Mapbox Optimization API
  const coords = waypoints.map(wp => `${wp[0]},${wp[1]}`).join(';');

  const response = await fetch(
    `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coords}?` +
    `geometries=geojson&overview=full&roundtrip=false&` +
    `source=first&destination=last&` +
    `access_token=${MAPBOX_TOKEN}`
  );

  const data = await response.json();

  return {
    optimizedOrder: data.waypoints.map(wp => wp.waypoint_index),
    route: data.trips[0]
  };
}
```

### Isochrones (Yetib Borish Hududi)

```javascript
// Isochrone - ma'lum vaqt ichida yetib boriladigan hudud
async function getIsochrone(center, minutes, profile = 'driving') {
  const response = await fetch(
    `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/` +
    `${center[0]},${center[1]}?` +
    `contours_minutes=${minutes.join(',')}&` +
    `polygons=true&` +
    `access_token=${MAPBOX_TOKEN}`
  );

  const data = await response.json();

  // Returns FeatureCollection with polygons
  return data.features;
}

// Visualization
async function showDeliveryZones() {
  const restaurant = [69.2797, 41.3111];

  const zones = await getIsochrone(restaurant, [10, 20, 30], 'driving');

  // Add to map
  map.addSource('isochrone', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: zones }
  });

  map.addLayer({
    id: 'isochrone-fill',
    type: 'fill',
    source: 'isochrone',
    paint: {
      'fill-color': [
        'match', ['get', 'contour'],
        10, '#22c55e',
        20, '#f59e0b',
        30, '#ef4444',
        '#6b7280'
      ],
      'fill-opacity': 0.3
    }
  });
}
```

### Turn-by-Turn Navigation

```javascript
class TurnByTurnNavigation {
  constructor(map) {
    this.map = map;
    this.route = null;
    this.currentStepIndex = 0;
    this.watchId = null;
  }

  async startNavigation(destination) {
    // Get current position
    const position = await this.getCurrentPosition();
    const start = [position.coords.longitude, position.coords.latitude];

    // Get route
    this.route = await getMapboxRoute(start, destination);

    // Display route
    this.displayRoute(this.route);

    // Start tracking
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.updatePosition(pos),
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  }

  updatePosition(position) {
    const currentPos = [position.coords.longitude, position.coords.latitude];

    // Update marker
    this.updateUserMarker(currentPos);

    // Check if on route
    const nearest = this.findNearestPointOnRoute(currentPos);

    if (nearest.distance > 50) {
      // Off route - recalculate
      this.recalculateRoute(currentPos, this.route.destination);
      return;
    }

    // Update current step
    const newStepIndex = this.findCurrentStep(currentPos);

    if (newStepIndex !== this.currentStepIndex) {
      this.currentStepIndex = newStepIndex;
      this.announceStep(this.route.legs[0].steps[newStepIndex]);
    }

    // Check arrival
    const distanceToEnd = turf.distance(
      turf.point(currentPos),
      turf.point(this.route.destination),
      { units: 'meters' }
    );

    if (distanceToEnd < 30) {
      this.onArrival();
    }
  }

  findNearestPointOnRoute(point) {
    const routeLine = turf.lineString(this.route.geometry.coordinates);
    const nearest = turf.nearestPointOnLine(routeLine, turf.point(point));

    return {
      point: nearest.geometry.coordinates,
      distance: nearest.properties.dist * 1000 // to meters
    };
  }

  findCurrentStep(position) {
    const steps = this.route.legs[0].steps;
    let accumulatedDistance = 0;

    for (let i = 0; i < steps.length; i++) {
      accumulatedDistance += steps[i].distance;

      const stepEnd = steps[i].geometry.coordinates.slice(-1)[0];
      const distToStepEnd = turf.distance(
        turf.point(position),
        turf.point(stepEnd),
        { units: 'meters' }
      );

      if (distToStepEnd < 50) {
        return Math.min(i + 1, steps.length - 1);
      }
    }

    return this.currentStepIndex;
  }

  announceStep(step) {
    const instruction = this.formatInstruction(step);

    // Voice announcement
    const utterance = new SpeechSynthesisUtterance(instruction);
    utterance.lang = 'uz-UZ';
    speechSynthesis.speak(utterance);

    // UI update
    this.updateInstructionUI(step);
  }

  formatInstruction(step) {
    const maneuvers = {
      'turn-right': 'O\'ngga buriling',
      'turn-left': 'Chapga buriling',
      'straight': 'To\'g\'ri boring',
      'arrive': 'Manzilga yetib keldingiz'
    };

    const distance = step.distance > 1000 ?
      `${(step.distance / 1000).toFixed(1)} km dan so'ng` :
      `${Math.round(step.distance)} metrdan so'ng`;

    return `${distance}, ${maneuvers[step.maneuver.type] || step.maneuver.instruction}`;
  }

  stopNavigation() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.clearRoute();
  }

  onArrival() {
    this.announceStep({ maneuver: { type: 'arrive', instruction: 'Manzilga yetib keldingiz' } });
    this.stopNavigation();
  }
}
```

## Real-World Case: Yetkazib Berish Zonalari

```javascript
class DeliveryZoneManager {
  constructor(map) {
    this.map = map;
    this.zones = [];
    this.zonesSource = null;

    this.initializeMap();
    this.setupDrawing();
  }

  initializeMap() {
    this.map.addSource('delivery-zones', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });

    // Zone fills
    this.map.addLayer({
      id: 'zones-fill',
      type: 'fill',
      source: 'delivery-zones',
      paint: {
        'fill-color': [
          'case',
          ['get', 'active'],
          ['get', 'color'],
          '#9ca3af'
        ],
        'fill-opacity': 0.3
      }
    });

    // Zone borders
    this.map.addLayer({
      id: 'zones-border',
      type: 'line',
      source: 'delivery-zones',
      paint: {
        'line-color': [
          'case',
          ['get', 'active'],
          ['get', 'color'],
          '#9ca3af'
        ],
        'line-width': 2
      }
    });

    // Zone labels
    this.map.addLayer({
      id: 'zones-label',
      type: 'symbol',
      source: 'delivery-zones',
      layout: {
        'text-field': [
          'concat',
          ['get', 'name'],
          '\n',
          ['number-format', ['get', 'deliveryFee'], { 'currency': 'UZS' }]
        ],
        'text-size': 14,
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#1f2937'
      }
    });
  }

  setupDrawing() {
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });

    this.map.addControl(this.draw);

    this.map.on('draw.create', (e) => this.onZoneCreated(e));
    this.map.on('draw.update', (e) => this.onZoneUpdated(e));
    this.map.on('draw.delete', (e) => this.onZoneDeleted(e));
  }

  onZoneCreated(event) {
    const feature = event.features[0];

    // Show zone configuration modal
    this.showZoneConfigModal(feature, (config) => {
      const zone = {
        ...feature,
        properties: {
          id: feature.id,
          name: config.name,
          deliveryFee: config.deliveryFee,
          minOrder: config.minOrder,
          deliveryTime: config.deliveryTime,
          active: true,
          color: config.color || '#22c55e'
        }
      };

      this.zones.push(zone);
      this.updateMapSource();
      this.saveZones();

      // Remove from draw layer
      this.draw.delete(feature.id);
    });
  }

  async loadZones() {
    const response = await fetch('/api/delivery-zones');
    this.zones = await response.json();
    this.updateMapSource();
  }

  updateMapSource() {
    const geojson = {
      type: 'FeatureCollection',
      features: this.zones
    };

    this.map.getSource('delivery-zones').setData(geojson);
  }

  // Manzil qaysi zonada ekanligini tekshirish
  findZoneForAddress(coordinates) {
    const point = turf.point(coordinates);

    for (const zone of this.zones) {
      if (!zone.properties.active) continue;

      const polygon = turf.polygon(zone.geometry.coordinates);

      if (turf.booleanPointInPolygon(point, polygon)) {
        return zone;
      }
    }

    return null;
  }

  // Yetkazib berish narxini hisoblash
  calculateDeliveryFee(coordinates, orderTotal) {
    const zone = this.findZoneForAddress(coordinates);

    if (!zone) {
      return {
        available: false,
        message: 'Bu manzilga yetkazib berish mavjud emas'
      };
    }

    if (orderTotal < zone.properties.minOrder) {
      return {
        available: false,
        message: `Minimal buyurtma: ${zone.properties.minOrder.toLocaleString()} so'm`,
        minOrder: zone.properties.minOrder
      };
    }

    return {
      available: true,
      fee: zone.properties.deliveryFee,
      deliveryTime: zone.properties.deliveryTime,
      zoneName: zone.properties.name
    };
  }

  // Zone statistikasi
  getZoneStatistics() {
    return this.zones.map(zone => {
      const polygon = turf.polygon(zone.geometry.coordinates);

      return {
        id: zone.properties.id,
        name: zone.properties.name,
        area: turf.area(polygon) / 1000000, // km²
        active: zone.properties.active,
        deliveryFee: zone.properties.deliveryFee
      };
    });
  }

  // Zone import/export
  exportZones() {
    return {
      type: 'FeatureCollection',
      features: this.zones
    };
  }

  importZones(geojson) {
    this.zones = geojson.features.map(f => ({
      ...f,
      properties: {
        ...f.properties,
        id: f.properties.id || crypto.randomUUID()
      }
    }));

    this.updateMapSource();
    this.saveZones();
  }

  async saveZones() {
    await fetch('/api/delivery-zones', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.zones)
    });
  }
}
```

## Performance Tips

### 1. Polygon Simplification

```javascript
// Server-side simplification
// PostGIS: ST_Simplify, ST_SimplifyPreserveTopology

// Client-side
import { simplify } from '@turf/simplify';

function getSimplifiedPolygon(polygon, zoom) {
  // Zoom levelga qarab tolerance
  const tolerances = {
    5: 0.1,
    10: 0.01,
    15: 0.001,
    20: 0.0001
  };

  const tolerance = tolerances[Math.floor(zoom)] || 0.001;

  return simplify(polygon, {
    tolerance,
    highQuality: zoom > 12,
    mutate: false
  });
}
```

### 2. Spatial Indexing

```javascript
import rbush from 'rbush';

// RBush - R-tree implementation
const tree = new rbush();

// Index polygons
function indexPolygons(polygons) {
  const items = polygons.map(p => {
    const bbox = turf.bbox(p);
    return {
      minX: bbox[0],
      minY: bbox[1],
      maxX: bbox[2],
      maxY: bbox[3],
      polygon: p
    };
  });

  tree.load(items);
}

// Fast spatial query
function findPolygonsInBounds(bounds) {
  return tree.search({
    minX: bounds[0],
    minY: bounds[1],
    maxX: bounds[2],
    maxY: bounds[3]
  });
}
```

### 3. Web Workers for Geometry Operations

```javascript
// geo-worker.js
importScripts('https://unpkg.com/@turf/turf@6/turf.min.js');

self.onmessage = function(e) {
  const { type, data } = e.data;

  switch (type) {
    case 'pointInPolygon':
      const result = turf.booleanPointInPolygon(
        turf.point(data.point),
        turf.polygon(data.polygon)
      );
      self.postMessage({ type: 'pointInPolygon', result });
      break;

    case 'buffer':
      const buffered = turf.buffer(data.feature, data.distance, {
        units: data.units || 'meters'
      });
      self.postMessage({ type: 'buffer', result: buffered });
      break;

    case 'simplify':
      const simplified = turf.simplify(data.feature, {
        tolerance: data.tolerance
      });
      self.postMessage({ type: 'simplify', result: simplified });
      break;
  }
};

// main.js
const geoWorker = new Worker('geo-worker.js');

geoWorker.postMessage({
  type: 'pointInPolygon',
  data: { point: [69.27, 41.31], polygon: zoneCoordinates }
});

geoWorker.onmessage = (e) => {
  console.log('Point in polygon:', e.data.result);
};
```

## Interview Savollari

### 1. Point-in-polygon algoritmi qanday ishlaydi?

**Javob:**
```javascript
// Ray Casting Algorithm
// Nuqtadan o'ngga ray (nur) yuboriladi
// Polygon qirralari bilan kesishishlar sanaladi
// Toq son = ichida, juft son = tashqarida

function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    // Qirra ray'ni kesadimi?
    const intersect = ((yi > y) !== (yj > y)) &&
                      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

// Time complexity: O(n), n = vertices
// Edge cases:
// - Point on edge
// - Point on vertex
// - Concave polygons
// - Multi-polygons
```

### 2. Geofencing performance qanday optimizatsiya qilinadi?

**Javob:**
```
1. Spatial Indexing:
   - R-tree (rbush)
   - QuadTree
   - GeoHash

2. Bounding Box Pre-check:
   // Avval bbox tekshirish (O(1))
   // Keyin polygon tekshirish (O(n))
   if (pointInBBox(point, bbox)) {
     return pointInPolygon(point, polygon);
   }
   return false;

3. Simplified Polygons:
   - Zoom levelga qarab simplification
   - Original faqat kerak bo'lganda

4. Server-side Processing:
   - PostGIS: ST_Contains, ST_Within
   - Spatial indexes (GIST)

5. Caching:
   - Zone membership cache
   - LRU cache for frequent checks
```

### 3. Routing API'lar qanday ishlaydi?

**Javob:**
```
1. Graph Representation:
   - Road network = Graph
   - Intersections = Nodes
   - Roads = Edges (weight: distance, time)

2. Algorithms:
   - Dijkstra (shortest path)
   - A* (heuristic - faster)
   - Contraction Hierarchies (precomputed)

3. Data Sources:
   - OpenStreetMap
   - Commercial (HERE, TomTom)

4. Typical Response:
   {
     distance: 5000,      // meters
     duration: 600,       // seconds
     geometry: {...},     // GeoJSON LineString
     steps: [...]         // Turn-by-turn
   }

5. Optimization:
   - TSP for multi-stop
   - Traffic data integration
   - Time-dependent routing
```

### 4. Convex vs Concave polygon farqi?

**Javob:**
```
Convex Polygon:
- Barcha ichki burchaklar < 180°
- Istalgan 2 nuqta orasidagi chiziq ichida
- Algorithms: Graham scan, Jarvis march
- Point-in-polygon: O(log n) binary search mumkin

Concave Polygon:
- Kamida 1 ichki burchak > 180°
- Chiziq tashqariga chiqishi mumkin
- "L" shakl, yulduz, murakkab
- Point-in-polygon: Ray casting O(n)

// Convex hull - Eng kichik convex polygon
const hull = turf.convex(pointCollection);

// Concave hull (alpha shape)
const concaveHull = turf.concave(pointCollection, {
  maxEdge: 1, // km
  units: 'kilometers'
});
```

### 5. Multi-stop route optimization qanday amalga oshiriladi?

**Javob:**
```javascript
// Traveling Salesman Problem (TSP)
// NP-hard - exact solution O(n!)

// Heuristics:

// 1. Nearest Neighbor (greedy)
function nearestNeighbor(points) {
  const visited = [points[0]];
  const remaining = points.slice(1);

  while (remaining.length > 0) {
    const last = visited[visited.length - 1];
    let nearest = 0;
    let minDist = Infinity;

    remaining.forEach((p, i) => {
      const d = distance(last, p);
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
    });

    visited.push(remaining.splice(nearest, 1)[0]);
  }

  return visited;
}

// 2. 2-opt improvement
function twoOpt(route) {
  let improved = true;

  while (improved) {
    improved = false;

    for (let i = 0; i < route.length - 2; i++) {
      for (let j = i + 2; j < route.length; j++) {
        const d1 = distance(route[i], route[i + 1]) +
                   distance(route[j], route[j + 1] || route[0]);
        const d2 = distance(route[i], route[j]) +
                   distance(route[i + 1], route[j + 1] || route[0]);

        if (d2 < d1) {
          // Reverse segment
          route = [
            ...route.slice(0, i + 1),
            ...route.slice(i + 1, j + 1).reverse(),
            ...route.slice(j + 1)
          ];
          improved = true;
        }
      }
    }
  }

  return route;
}

// 3. Mapbox Optimization API
// Real-world: traffic, time windows
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Turf.js dan foydalaning:** Geometrik hisob-kitoblar (masalan: Ikkita polygon kesishganmi? Nuqta polygon ichidami?) ni noldan (Scratch) matematik formulalar yozib qilmang. Frontend da geospatial matematika uchun de facto standart bo'lgan **Turf.js** kutubxonasini ishlating.
2. **Katta poligonlarni soddalashtirish (Simplification):** Rossiya yoki Xitoy kabi juda katta davlat chegarasini chizish kerak bo'lsa, uni minglab koordinatalar bilan (Full detail) chizmang. Bu frontendni o'ldiradi. Backend dan chiziqlarni silliqlashtirgan (soddalashtirilgan) holda so'rang (Masalan: Douglas-Peucker algoritmi).
3. **Mapbox Routing xizmatlari pullik ekanligini unutmang:** Marshrut qurish API larining deyarli hammasi (Google, Mapbox) pullik va har bir marshrut hisobi uchun pul yechadi. Shu sababli foydalanuvchi har safar xaritani surganida API ga zapros ketavermasligi uchun Debounce qo'ying va xeshlashni (Caching) yo'lga qo'ying.

---

## Xulosa

| Tushuncha | Nima u? | Real loyihadagi o'rni |
|-----------|---------|-----------------------|
| **Polygon (Hudud)** | Uchta yoki undan ortiq nuqtalardan tashkil topgan yopiq geometrik shakl. | Yandex Eda da yetkazib berish zonasini (Zelioniy, Jyoltuy zonalari) belgilash. |
| **Geofencing** | Virtual geografik "Devor". Obyekt hududga kirdi/chiqdi hodisalarini tutish. | Avtomobil ma'lum bir shtat yoki shahar chegarasidan o'tishi bilan soliq hisoblashni boshlash. |
| **Routing (Marshrut)** | A nuqtadan B nuqtaga mavjud yo'l infratuzilmasi orqali (binolarni kesib o'tmasdan) yo'l chizish. | Haydovchiga mijoz oldiga borishi uchun navigator chizib berish. |
| **TSP (Traveling Salesman)** | Bitta emas, ko'plab nuqtalarga eng qisqa yo'l bilan aylanib chiqish (Optimal). | Kuryer pochtadan 10 ta posilka oldi, ularni qaysi ketma-ketlikda tarqatsa benzin eng kam ketishi. |

Polygons va routing - geospatial ilovalarning asosiy qismi. Geofencing uchun spatial indexing, routing uchun graph algorithms va performance uchun simplification muhim. Turf.js kabi tayyor kutubxonalar va maxsus API'lar (Mapbox Directions API) client-side operatsiyalarni qiyinchiliksiz va professional darajada qurishni soddalashtiradi.
