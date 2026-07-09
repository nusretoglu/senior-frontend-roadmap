# GeoJSON - Geografik Ma'lumotlar Formati

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchilar uchun oddiy Array yoki Object lar (JSON) hammaga tushunarli. Lekin geografik nuqtalar (masalan O'zbekistonning butun chegarasi) ni shunchaki Array larda uzatib bo'lmaydi, chunki qaysi son Uzunlik (Longitude) va qaysi son Kenglik (Latitude) ekanligi, yoki qayerdan chiziq boshlanib tugashi chalkashib ketadi. Butun dunyodagi GIS mutaxassislari, xarita dasturlari (Google, Yandex, Mapbox) o'zaro bir xil tilda gaplashishi uchun ixtiro qilingan standart — bu **GeoJSON** dir.

> [!NOTE]
> **Real-hayot analogiyasi: "Umumiy Til (Lingua Franca)"**  
> Tasavvur qiling, Xitoylik, Rus va Amerikalik muhandislar uchrashishdi. Ular o'z tillarida gapirsa bir-birini tushunmaydi. Shuning uchun hammasi "Ingliz tilida" gapirishga kelishishadi. GeoJSON xuddi shu "Ingliz tili" dir. Server PostgreSQL (PostGIS) da yozilganmi, Frontend React (Mapbox) dami yoki QGIS dasturidami — ular ma'lumot almashganda aynan GeoJSON formatida almashishadi.

GeoJSON - geografik ma'lumotlarni ifodalash uchun JSON asosidagi ochiq standart format. 2008 yilda yaratilgan bo'lib, 2016 yilda RFC 7946 sifatida standartlashtirilgan. Barcha zamonaviy xarita kutubxonalari va GIS tizimlari tomonidan qo'llab-quvvatlanadi.
## GeoJSON Tuzilishi

### Geometry Types

```javascript
// 1. Point
{
  "type": "Point",
  "coordinates": [69.2797, 41.3111] // [longitude, latitude]
}

// 2. MultiPoint
{
  "type": "MultiPoint",
  "coordinates": [
    [69.2797, 41.3111],
    [66.9597, 39.6547],
    [64.4223, 39.7747]
  ]
}

// 3. LineString
{
  "type": "LineString",
  "coordinates": [
    [69.2797, 41.3111],
    [66.9597, 39.6547],
    [64.4223, 39.7747]
  ]
}

// 4. MultiLineString
{
  "type": "MultiLineString",
  "coordinates": [
    [[69.27, 41.31], [69.30, 41.35]],
    [[66.95, 39.65], [67.00, 39.70]]
  ]
}

// 5. Polygon
{
  "type": "Polygon",
  "coordinates": [
    // Outer ring (counter-clockwise)
    [[69.20, 41.35], [69.35, 41.35], [69.35, 41.25], [69.20, 41.25], [69.20, 41.35]],
    // Inner ring / hole (clockwise) - optional
    [[69.25, 41.32], [69.30, 41.32], [69.30, 41.28], [69.25, 41.28], [69.25, 41.32]]
  ]
}

// 6. MultiPolygon
{
  "type": "MultiPolygon",
  "coordinates": [
    [[[69.20, 41.35], [69.25, 41.35], [69.25, 41.30], [69.20, 41.30], [69.20, 41.35]]],
    [[[69.30, 41.35], [69.35, 41.35], [69.35, 41.30], [69.30, 41.30], [69.30, 41.35]]]
  ]
}

// 7. GeometryCollection
{
  "type": "GeometryCollection",
  "geometries": [
    { "type": "Point", "coordinates": [69.27, 41.31] },
    { "type": "LineString", "coordinates": [[69.27, 41.31], [69.30, 41.35]] }
  ]
}
```

### Feature va FeatureCollection

```javascript
// Feature - geometriya + properties
{
  "type": "Feature",
  "id": "tashkent-001", // Optional, unique identifier
  "geometry": {
    "type": "Point",
    "coordinates": [69.2797, 41.3111]
  },
  "properties": {
    "name": "Toshkent",
    "population": 2500000,
    "country": "Uzbekistan",
    "timezone": "Asia/Tashkent",
    "tags": ["capital", "megacity"]
  }
}

// FeatureCollection - feature'lar to'plami
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [69.2797, 41.3111] },
      "properties": { "name": "Toshkent", "population": 2500000 }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [66.9597, 39.6547] },
      "properties": { "name": "Samarqand", "population": 500000 }
    }
  ]
}
```

### Coordinate System (CRS)

```javascript
// GeoJSON standart: WGS84 (EPSG:4326)
// [longitude, latitude, altitude?]
// longitude: -180 to 180
// latitude: -90 to 90

// MUHIM: GeoJSON = [lng, lat] (Google Maps/Leaflet = [lat, lng])

// Altitude bilan
{
  "type": "Point",
  "coordinates": [69.2797, 41.3111, 450] // 450 metr balandlik
}

// Bounding Box (optional)
{
  "type": "FeatureCollection",
  "bbox": [55.99, 37.18, 73.14, 45.59], // [minLng, minLat, maxLng, maxLat]
  "features": [...]
}
```

## GeoJSON bilan Ishlash

### Parsing va Validation

```javascript
// JSON.parse bilan
const geojson = JSON.parse(geojsonString);

// Validation
function isValidGeoJSON(obj) {
  if (!obj || typeof obj !== 'object') return false;

  const validTypes = [
    'Point', 'MultiPoint', 'LineString', 'MultiLineString',
    'Polygon', 'MultiPolygon', 'GeometryCollection',
    'Feature', 'FeatureCollection'
  ];

  if (!validTypes.includes(obj.type)) return false;

  if (obj.type === 'Feature') {
    return obj.geometry === null || isValidGeometry(obj.geometry);
  }

  if (obj.type === 'FeatureCollection') {
    return Array.isArray(obj.features) &&
           obj.features.every(f => isValidGeoJSON(f));
  }

  return isValidGeometry(obj);
}

function isValidGeometry(geom) {
  if (!geom || !geom.type) return false;

  if (geom.type === 'GeometryCollection') {
    return Array.isArray(geom.geometries) &&
           geom.geometries.every(g => isValidGeometry(g));
  }

  return Array.isArray(geom.coordinates);
}

// Coordinate validation
function isValidCoordinate(coord) {
  if (!Array.isArray(coord) || coord.length < 2) return false;
  const [lng, lat] = coord;
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}

// Advanced validation with @turf/boolean-valid
import { booleanValid } from '@turf/boolean-valid';

const isValid = booleanValid(polygon);
```

### GeoJSON Yaratish

```javascript
// Turf.js bilan
import * as turf from '@turf/turf';

// Point
const point = turf.point([69.2797, 41.3111], { name: 'Toshkent' });

// LineString
const line = turf.lineString([
  [69.2797, 41.3111],
  [66.9597, 39.6547]
], { name: 'Ipak yo\'li' });

// Polygon
const polygon = turf.polygon([[
  [69.20, 41.35],
  [69.35, 41.35],
  [69.35, 41.25],
  [69.20, 41.25],
  [69.20, 41.35]
]], { name: 'Toshkent shahri' });

// FeatureCollection
const collection = turf.featureCollection([point, line, polygon]);

// Circle (approximated polygon)
const circle = turf.circle([69.2797, 41.3111], 5, {
  steps: 64,
  units: 'kilometers'
});

// Buffer
const buffered = turf.buffer(line, 1, { units: 'kilometers' });

// Bounding box polygon
const bboxPolygon = turf.bboxPolygon([69.20, 41.25, 69.35, 41.35]);
```

### GeoJSON O'zgartirish

```javascript
// Properties qo'shish/o'zgartirish
function addProperties(geojson, properties) {
  if (geojson.type === 'FeatureCollection') {
    return {
      ...geojson,
      features: geojson.features.map(f => ({
        ...f,
        properties: { ...f.properties, ...properties }
      }))
    };
  }

  if (geojson.type === 'Feature') {
    return {
      ...geojson,
      properties: { ...geojson.properties, ...properties }
    };
  }

  // Geometry → Feature
  return {
    type: 'Feature',
    properties: properties,
    geometry: geojson
  };
}

// Koordinatalarni transform qilish
function transformCoordinates(geojson, transformFn) {
  const transform = (coords) => {
    if (typeof coords[0] === 'number') {
      return transformFn(coords);
    }
    return coords.map(transform);
  };

  return {
    ...geojson,
    coordinates: transform(geojson.coordinates)
  };
}

// Masalan: WGS84 → Web Mercator
import proj4 from 'proj4';

const toWebMercator = (coord) => {
  return proj4('EPSG:4326', 'EPSG:3857', coord);
};

const transformed = transformCoordinates(polygon.geometry, toWebMercator);
```

## Import va Export

### Fetch dan yuklash

```javascript
async function loadGeoJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load GeoJSON: ${response.status}`);
  }

  const data = await response.json();

  // Validate
  if (!isValidGeoJSON(data)) {
    throw new Error('Invalid GeoJSON format');
  }

  return data;
}

// Katta fayllar uchun streaming
async function loadLargeGeoJSON(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let data = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    data += decoder.decode(value, { stream: true });
  }

  return JSON.parse(data);
}
```

### Fayl yuklash (File Input)

```javascript
function setupGeoJSONUpload(inputElement, callback) {
  inputElement.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const geojson = JSON.parse(text);

      if (!isValidGeoJSON(geojson)) {
        throw new Error('Invalid GeoJSON');
      }

      callback(null, geojson, file.name);
    } catch (error) {
      callback(error, null, null);
    }
  });
}

// Vue component
<template>
  <input
    type="file"
    accept=".geojson,.json"
    @change="handleFileUpload"
  />
</template>

<script setup>
const emit = defineEmits(['loaded', 'error']);

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const geojson = JSON.parse(text);
    emit('loaded', geojson);
  } catch (error) {
    emit('error', error);
  }
}
</script>
```

### Export

```javascript
// JSON string
function exportGeoJSON(geojson) {
  return JSON.stringify(geojson, null, 2);
}

// File download
function downloadGeoJSON(geojson, filename = 'data.geojson') {
  const json = JSON.stringify(geojson, null, 2);
  const blob = new Blob([json], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

// Minified export (production)
function exportMinified(geojson) {
  // Remove unnecessary precision
  const rounded = roundCoordinates(geojson, 6);
  return JSON.stringify(rounded);
}

function roundCoordinates(geojson, precision) {
  const round = (num) => Number(num.toFixed(precision));

  const processCoords = (coords) => {
    if (typeof coords[0] === 'number') {
      return coords.map(round);
    }
    return coords.map(processCoords);
  };

  if (geojson.type === 'FeatureCollection') {
    return {
      ...geojson,
      features: geojson.features.map(f => roundCoordinates(f, precision))
    };
  }

  if (geojson.type === 'Feature') {
    return {
      ...geojson,
      geometry: geojson.geometry ? roundCoordinates(geojson.geometry, precision) : null
    };
  }

  return {
    ...geojson,
    coordinates: processCoords(geojson.coordinates)
  };
}
```

### Boshqa Formatlardan Konvertatsiya

```javascript
// KML → GeoJSON
import { kml } from '@tmcw/togeojson';

async function kmlToGeoJSON(kmlString) {
  const parser = new DOMParser();
  const kmlDoc = parser.parseFromString(kmlString, 'text/xml');
  return kml(kmlDoc);
}

// GPX → GeoJSON
import { gpx } from '@tmcw/togeojson';

async function gpxToGeoJSON(gpxString) {
  const parser = new DOMParser();
  const gpxDoc = parser.parseFromString(gpxString, 'text/xml');
  return gpx(gpxDoc);
}

// Shapefile → GeoJSON
import shp from 'shpjs';

async function shapefileToGeoJSON(shpBuffer) {
  return shp(shpBuffer);
}

// CSV → GeoJSON
function csvToGeoJSON(csvString, latColumn = 'lat', lngColumn = 'lng') {
  const lines = csvString.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  const latIndex = headers.indexOf(latColumn);
  const lngIndex = headers.indexOf(lngColumn);

  if (latIndex === -1 || lngIndex === -1) {
    throw new Error('Lat/lng columns not found');
  }

  const features = lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',');
      const properties = {};

      headers.forEach((header, i) => {
        if (i !== latIndex && i !== lngIndex) {
          properties[header] = values[i]?.trim();
        }
      });

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(values[lngIndex]),
            parseFloat(values[latIndex])
          ]
        },
        properties
      };
    });

  return { type: 'FeatureCollection', features };
}
```

## TopoJSON

TopoJSON - GeoJSON'ning optimallashtirilgan versiyasi. Umumiy chegaralarni bir marta saqlash orqali hajmni 80%+ kamaytiradi.

```javascript
// GeoJSON → TopoJSON
import * as topojson from 'topojson-client';
import * as topoServer from 'topojson-server';

// Konvertatsiya
const topology = topoServer.topology({
  districts: districtsGeoJSON,
  cities: citiesGeoJSON
});

// Compression - quantization
const quantized = topoServer.quantize(topology, {
  coordinate_system: 'EPSG:4326',
  quantization: 1e6 // precision
});

// TopoJSON → GeoJSON
const districtsBack = topojson.feature(topology, topology.objects.districts);
const citiesBack = topojson.feature(topology, topology.objects.cities);

// Mesh - shared borders only
const borders = topojson.mesh(
  topology,
  topology.objects.districts,
  (a, b) => a !== b // filter function
);
```

### TopoJSON Afzalliklari

```
GeoJSON: 10 MB
TopoJSON: 1.5 MB (85% kichikroq)

Use cases:
- Choropleth xaritalar
- Admin boundaries
- Slow connections
```

## GeoJSON Xaritada Ko'rsatish

### Leaflet

```javascript
// GeoJSON layer
const geojsonLayer = L.geoJSON(geojsonData, {
  // Point uchun
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: feature.properties.color || '#3388ff',
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });
  },

  // Polygon/Line uchun style
  style: function(feature) {
    return {
      fillColor: getColor(feature.properties.value),
      weight: 2,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  },

  // Har bir feature uchun
  onEachFeature: function(feature, layer) {
    // Popup
    if (feature.properties?.name) {
      layer.bindPopup(`
        <strong>${feature.properties.name}</strong><br>
        ${feature.properties.description || ''}
      `);
    }

    // Events
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  },

  // Filter
  filter: function(feature) {
    return feature.properties.show !== false;
  }
}).addTo(map);

// Event handlers
function highlightFeature(e) {
  const layer = e.target;
  layer.setStyle({
    weight: 5,
    color: '#666',
    fillOpacity: 0.9
  });
  layer.bringToFront();
}

function resetHighlight(e) {
  geojsonLayer.resetStyle(e.target);
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}
```

### Mapbox GL JS

```javascript
map.on('load', () => {
  // Source
  map.addSource('data', {
    type: 'geojson',
    data: geojsonData,
    generateId: true // Hover uchun
  });

  // Fill layer (polygons)
  map.addLayer({
    id: 'data-fill',
    type: 'fill',
    source: 'data',
    filter: ['==', '$type', 'Polygon'],
    paint: {
      'fill-color': [
        'interpolate', ['linear'], ['get', 'value'],
        0, '#f7fbff',
        50, '#6baed6',
        100, '#08306b'
      ],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.9,
        0.6
      ]
    }
  });

  // Line layer
  map.addLayer({
    id: 'data-line',
    type: 'line',
    source: 'data',
    filter: ['==', '$type', 'LineString'],
    paint: {
      'line-color': '#3388ff',
      'line-width': 2
    }
  });

  // Circle layer (points)
  map.addLayer({
    id: 'data-point',
    type: 'circle',
    source: 'data',
    filter: ['==', '$type', 'Point'],
    paint: {
      'circle-radius': ['get', 'size'],
      'circle-color': ['get', 'color']
    }
  });

  // Hover effect
  let hoveredId = null;

  map.on('mousemove', 'data-fill', (e) => {
    if (e.features.length > 0) {
      if (hoveredId !== null) {
        map.setFeatureState({ source: 'data', id: hoveredId }, { hover: false });
      }
      hoveredId = e.features[0].id;
      map.setFeatureState({ source: 'data', id: hoveredId }, { hover: true });
    }
  });

  map.on('mouseleave', 'data-fill', () => {
    if (hoveredId !== null) {
      map.setFeatureState({ source: 'data', id: hoveredId }, { hover: false });
    }
    hoveredId = null;
  });
});
```

## Real-World Case: Viloyatlar Choropleth Xaritasi

```javascript
class ChoroplethMap {
  constructor(containerId) {
    this.map = new mapboxgl.Map({
      container: containerId,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [64.5853, 41.3775], // O'zbekiston markazi
      zoom: 5
    });

    this.colorScale = [
      '#f7fbff', '#deebf7', '#c6dbef', '#9ecae1',
      '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'
    ];

    this.map.on('load', () => this.initialize());
  }

  async initialize() {
    // Viloyatlar GeoJSON
    const regions = await fetch('/data/uzbekistan-regions.geojson');
    const geojson = await regions.json();

    // Statistik ma'lumotlar
    const stats = await fetch('/api/region-stats');
    const statsData = await stats.json();

    // Ma'lumotlarni birlashtirish
    this.mergedData = this.mergeData(geojson, statsData);

    this.addLayers();
    this.addLegend();
    this.addTooltip();
  }

  mergeData(geojson, stats) {
    return {
      ...geojson,
      features: geojson.features.map(feature => {
        const regionStats = stats.find(s =>
          s.region_code === feature.properties.code
        );

        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...regionStats
          }
        };
      })
    };
  }

  addLayers() {
    this.map.addSource('regions', {
      type: 'geojson',
      data: this.mergedData
    });

    // Fill
    this.map.addLayer({
      id: 'regions-fill',
      type: 'fill',
      source: 'regions',
      paint: {
        'fill-color': this.getColorExpression('population'),
        'fill-opacity': 0.8
      }
    });

    // Border
    this.map.addLayer({
      id: 'regions-border',
      type: 'line',
      source: 'regions',
      paint: {
        'line-color': '#ffffff',
        'line-width': 1
      }
    });

    // Labels
    this.map.addLayer({
      id: 'regions-labels',
      type: 'symbol',
      source: 'regions',
      layout: {
        'text-field': ['get', 'name_uz'],
        'text-size': 12,
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#1f2937',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    });
  }

  getColorExpression(property) {
    // Ma'lumotlar asosida breakpoints
    const values = this.mergedData.features.map(f => f.properties[property] || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const step = (max - min) / 9;

    const stops = [];
    for (let i = 0; i < 9; i++) {
      stops.push(min + step * i, this.colorScale[i]);
    }

    return [
      'interpolate', ['linear'], ['get', property],
      ...stops
    ];
  }

  addLegend() {
    const legend = document.createElement('div');
    legend.className = 'map-legend';

    const values = this.mergedData.features.map(f => f.properties.population || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);

    legend.innerHTML = `
      <h4>Aholi soni</h4>
      <div class="legend-scale">
        ${this.colorScale.map((color, i) => {
          const value = min + ((max - min) / 9) * i;
          return `
            <div class="legend-item">
              <span class="legend-color" style="background: ${color}"></span>
              <span class="legend-value">${this.formatNumber(value)}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.map.getContainer().appendChild(legend);
  }

  addTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    tooltip.style.display = 'none';
    this.map.getContainer().appendChild(tooltip);

    this.map.on('mousemove', 'regions-fill', (e) => {
      if (e.features.length === 0) return;

      const feature = e.features[0];
      const props = feature.properties;

      tooltip.innerHTML = `
        <h3>${props.name_uz}</h3>
        <p>Aholi: ${this.formatNumber(props.population)}</p>
        <p>Maydon: ${this.formatNumber(props.area_km2)} km²</p>
        <p>Zichlik: ${Math.round(props.population / props.area_km2)} kishi/km²</p>
      `;

      tooltip.style.display = 'block';
      tooltip.style.left = e.point.x + 10 + 'px';
      tooltip.style.top = e.point.y + 10 + 'px';

      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'regions-fill', () => {
      tooltip.style.display = 'none';
      this.map.getCanvas().style.cursor = '';
    });
  }

  // Indikatorni o'zgartirish
  changeIndicator(property, title) {
    this.map.setPaintProperty('regions-fill', 'fill-color',
      this.getColorExpression(property)
    );

    // Legend yangilash
    this.updateLegend(property, title);
  }

  formatNumber(num) {
    return new Intl.NumberFormat('uz-UZ').format(Math.round(num));
  }

  // Export
  exportData() {
    return this.mergedData;
  }
}

// CSS
const styles = `
.map-legend {
  position: absolute;
  bottom: 30px;
  right: 10px;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.2);
}

.map-tooltip {
  position: absolute;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  pointer-events: none;
  z-index: 10;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 4px 0;
}

.legend-color {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}
`;
```

## Performance Optimization

### 1. Simplification

```javascript
import { simplify } from '@turf/simplify';

function optimizeForZoom(geojson, zoom) {
  // Zoom levelga qarab tolerance
  const tolerances = {
    0: 1,
    5: 0.1,
    10: 0.01,
    15: 0.001,
    20: 0.0001
  };

  const tolerance = tolerances[Math.floor(zoom)] || 0.001;

  return simplify(geojson, { tolerance, highQuality: true });
}

// Batch simplification
function simplifyFeatureCollection(fc, tolerance) {
  return {
    ...fc,
    features: fc.features.map(f => simplify(f, { tolerance }))
  };
}
```

### 2. Tiling

```javascript
// Tippecanoe (CLI) - vector tiles yaratish
// tippecanoe -o output.mbtiles -z 14 input.geojson

// Client-side tiling
import Protobuf from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';

async function loadVectorTile(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const pbf = new Protobuf(new Uint8Array(buffer));
  return new VectorTile(pbf);
}
```

### 3. Streaming Parser

```javascript
// Katta GeoJSON fayllar uchun
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';

async function* parseGeoJSONStream(readableStream) {
  const pipeline = readableStream
    .pipe(parser())
    .pipe(pick({ filter: 'features' }))
    .pipe(streamArray());

  for await (const { value } of pipeline) {
    yield value;
  }
}

// Browser version
async function parseGeoJSONInChunks(url, onFeature) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  let inFeatures = false;
  let depth = 0;
  let featureStart = -1;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Simple state machine to extract features
    for (let i = 0; i < buffer.length; i++) {
      const char = buffer[i];

      if (char === '{') {
        if (depth === 1 && inFeatures) featureStart = i;
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 1 && featureStart !== -1) {
          const featureJson = buffer.slice(featureStart, i + 1);
          try {
            const feature = JSON.parse(featureJson);
            onFeature(feature);
          } catch (e) {
            // Incomplete feature, continue
          }
          featureStart = -1;
        }
      }
    }

    // Keep only unprocessed part
    if (featureStart !== -1) {
      buffer = buffer.slice(featureStart);
      featureStart = 0;
    } else {
      buffer = '';
    }
  }
}
```

### 4. Web Worker Processing

```javascript
// geojson-worker.js
self.onmessage = function(e) {
  const { type, data } = e.data;

  switch (type) {
    case 'simplify':
      importScripts('https://unpkg.com/@turf/turf@6/turf.min.js');
      const simplified = turf.simplify(data.geojson, {
        tolerance: data.tolerance
      });
      self.postMessage({ type: 'simplified', data: simplified });
      break;

    case 'filter':
      const filtered = {
        ...data.geojson,
        features: data.geojson.features.filter(f =>
          f.properties[data.property] === data.value
        )
      };
      self.postMessage({ type: 'filtered', data: filtered });
      break;

    case 'aggregate':
      const aggregated = aggregateByProperty(data.geojson, data.property);
      self.postMessage({ type: 'aggregated', data: aggregated });
      break;
  }
};

// main.js
const worker = new Worker('geojson-worker.js');

worker.postMessage({
  type: 'simplify',
  data: { geojson: largeGeoJSON, tolerance: 0.01 }
});

worker.onmessage = (e) => {
  if (e.data.type === 'simplified') {
    renderGeoJSON(e.data.data);
  }
};
```

## Interview Savollari

### 1. GeoJSON koordinata tartibi qanday?

**Javob:**
```javascript
// GeoJSON: [longitude, latitude, altitude?]
// lon: -180 to 180
// lat: -90 to 90

// MUHIM FARQ:
// GeoJSON:        [lng, lat]  = [69.27, 41.31]
// Leaflet:        [lat, lng]  = [41.31, 69.27]
// Google Maps:    {lat, lng}  = {lat: 41.31, lng: 69.27}

// Konvertatsiya
const leafletCoords = geojsonCoords.map(([lng, lat]) => [lat, lng]);

// RFC 7946: WGS84 (EPSG:4326) MAJBURIY
// CRS specification (eski) - QO'LLAB-QUVVATLANMAYDI
```

### 2. Polygon winding order nima uchun muhim?

**Javob:**
```javascript
// Winding Order:
// - Outer ring: Counter-clockwise (CCW)
// - Inner ring (hole): Clockwise (CW)

// Noto'g'ri tartib = "inside-out" polygon
// Ba'zi rendererlar xato ko'rsatadi

// Tekshirish
function isCounterClockwise(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    sum += (x2 - x1) * (y2 + y1);
  }
  return sum < 0;
}

// To'g'rilash
import { rewind } from '@turf/rewind';
const corrected = rewind(polygon, { reverse: true });
```

### 3. GeoJSON vs TopoJSON qachon ishlatiladi?

**Javob:**
```
GeoJSON:
- Oddiy, oson o'qiladi
- Har bir geometriya mustaqil
- Editing uchun qulay
- Use: Dynamic data, editing, simple maps

TopoJSON:
- 80%+ kichikroq hajm
- Umumiy chegaralar saqlanadi
- Mesh operations
- Use: Static boundaries, choropleth, slow network

Konvertatsiya:
- GeoJSON → TopoJSON: topojson-server
- TopoJSON → GeoJSON: topojson-client
```

### 4. Katta GeoJSON faylni qanday optimize qilasiz?

**Javob:**
```
1. Simplification:
   - Tolerance zoom levelga qarab
   - turf.simplify() / PostGIS ST_Simplify

2. TopoJSON:
   - Shared boundaries bir marta
   - Quantization

3. Tiling:
   - Vector tiles (MVT)
   - Tippecanoe

4. Streaming:
   - Chunked loading
   - Web Workers

5. Server-side:
   - Spatial indexing (R-tree)
   - Viewport-based query
   - Pre-aggregation

6. Caching:
   - Service Worker
   - IndexedDB
```

### 5. Feature ID qanday ishlatiladi?

**Javob:**
```javascript
// Feature ID - hover/select uchun kerak
{
  "type": "Feature",
  "id": "region-001", // String yoki number
  "geometry": {...},
  "properties": {...}
}

// Mapbox GL: generateId option
map.addSource('data', {
  type: 'geojson',
  data: geojson,
  generateId: true // Auto-generate from index
});

// Feature state (hover, select)
map.setFeatureState(
  { source: 'data', id: 'region-001' },
  { hover: true }
);

// Paint expression
'fill-opacity': [
  'case',
  ['boolean', ['feature-state', 'hover'], false],
  1, 0.5
]

// ID'siz feature state ISHLAMAYDI!
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Topologiya qoidasi (Right-Hand Rule):** GeoJSON spetsifikatsiyasiga (RFC 7946) ko'ra, poligonning tashqi chegarasi koordinatalari soat miliga qarshi (Counter-clockwise), ichki "teshiklar" (Holes) esa soat mili bo'yicha (Clockwise) yozilishi shart. Aks holda ba'zi GIS dasturlari (ayniqsa D3.js) ularni teskari - poligon ichi bo'm-bo'sh, butun dunyo esa qora qilib chizib qo'yadi.
2. **TopoJSON ishlatish:** Agar bitta mamlakatning viloyatlarini GeoJSON qilsangiz, ikkita viloyat tutashgan chegara (koordinatalar) ikki marta yoziladi (ikkalasining ichida ham). Bu fayl hajmini oshiradi. Buning o'rniga faqat chegaralarni bir marta e'lon qilib oluvchi `TopoJSON` formatidan foydalaning (U GeoJSON ga nisbatan fayl hajmini 80% gacha tejaydi).
3. **[Lng, Lat] vs [Lat, Lng] chalkashligi:** Frontend dasturchilar xatosi: Google Maps API da va Leaflet da odatda `[Kenglik (Lat), Uzunlik (Lng)]` qabul qilinadi. Lekin standart GeoJSON da QAT'IY ravishda `[Uzunlik (Lng), Kenglik (Lat)]` yozilishi kerak (ya'ni x o'qi oldin). Bu eng ko'p tarqalgan bug hisoblanadi.

---

## Xulosa

| Konsept | Ma'nosi | Misol |
|---------|---------|-------|
| **FeatureCollection** | Eng yuqori konteyner, barcha xarita obyektlarini (Feature) bitta array'da ushlaydi. | Butun bir shahardagi hamma bog'lar va binolar ro'yxati. |
| **Feature** | Bitta alohida mustaqil obyekt. Ichida Geometry va Properties saqlaydi. | Toshkent teleminorasi. |
| **Geometry** | Bu faqatgina raqamlar (Koordinatalar) va ularning turi (Point, Line, Polygon). | `[69.28, 41.33]` |
| **Properties** | Ushbu obyekt haqidagi qo'shimcha matnli, sonli atributlar. | `"name": "Toshkent teleminorasi", "height": 375` |

GeoJSON - geografik ma'lumotlar uchun standart format bo'lib, barcha zamonaviy xarita kutubxonalari tomonidan qo'llab-quvvatlanadi. Katta datasetlar uchun TopoJSON, simplification va tiling strategiyalarini qo'llash muhim. Eng ko'p qilinadigan xato: Koordinata tartibiga (lng, lat) e'tibor bermaslik.
