# Markers va Clustering - Ko'p Nuqtalar bilan Ishlash

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> DOM da bitta tugmani (`<button>`) chizish qancha resurs talab qilsa, Leaflet xaritasida bitta Marker (`<img>` yoki `<div>`) qo'shish shuncha operativ xotirani yeydi. Tasavvur qiling, siz butun Toshkentdagi "Paynet" shoxobchalarini (ular 15,000+ ta) xaritaga chiqarmog'chisiz. Brauzer 15,000 ta DOM element chizishga harakat qilsa, sahifa o'sha zahoti o'ladi (Crash). Clustering va Canvas usullari aynan shu - Big Data'ni xaritada ifodalashning eng asosiy echimi sanaladi.

> [!NOTE]
> **Real-hayot analogiyasi: "Kosmosdan Yerga qarash"**  
> Kosmosdan turib Yerdagi alohida daraxtlarni (Markerlarni) ko'rib bo'lmaydi, siz faqat yashil massiv (O'rmon - Cluster) ni ko'rasiz. Samolyotdan qarasangiz, o'rmon kichikroq zonalarga bo'linadi (Kichik Clusterlar). Parashyutda yerga yaqinlashganingizdagina, alohida daraxtlarni (Individual Marker) ko'ra boshlaysiz. Clustering aynan shu qoidaga asoslanadi - balanddan faqat yig'indi son ko'rsatiladi, yaqinlashgan sari alohida detallar.

Xarita ilovalarida ko'p marker bilan ishlash eng katta performance muammolaridan biri. 1000+ marker DOM'ni sezilarli darajada sekinlashtiradi. Bu bo'limda marker optimizatsiya strategiyalarini, clustering algoritmlarini va real-world yondashuvlarni o'rganamiz.
## Muammo Tahlili

### Nima Uchun Ko'p Marker Sekin?

```javascript
// MUAMMO: 10,000 marker yaratish
// Har bir marker = 1 DOM element
// 10,000 DOM element = browser memory + reflow + repaint

// Sekin yondashuv - ISHLATMANG
locations.forEach(loc => {
  const marker = L.marker([loc.lat, loc.lng])
    .bindPopup(loc.name)
    .addTo(map);
});

// Muammolar:
// 1. DOM overload (10K+ element)
// 2. Event listeners (10K+)
// 3. Memory consumption (~50KB per marker)
// 4. Render time (seconds)
// 5. Pan/zoom lag
```

### Performance Benchmarks

| Marker soni | DOM Rendering | Canvas Rendering | Clustering |
|-------------|---------------|------------------|------------|
| 100 | 50ms | 10ms | - |
| 1,000 | 500ms | 50ms | 30ms |
| 10,000 | 5s+ | 200ms | 50ms |
| 100,000 | Crash | 1s | 100ms |
| 1,000,000 | Crash | 5s | 500ms |

## Clustering Nazariyasi

### Clustering Algoritmlari

1. **Grid-Based Clustering**
   - Xaritani grid'ga bo'lish
   - Har bir cell'dagi nuqtalarni birlashtirish
   - O(n) complexity
   - Tez, lekin vizual natija yomon

2. **Distance-Based Clustering (Leaflet.markercluster)**
   - Yaqin nuqtalarni birlashtirish
   - R-tree spatial index
   - O(n log n) complexity
   - Yaxshi vizual natija

3. **Supercluster (Mapbox)**
   - Hierarchical clustering
   - Precomputed cluster tree
   - Zoom level bo'yicha optimallashtirilgan
   - Katta datasetlar uchun ideal

### Clustering Qanday Ishlaydi

```
Zoom 1:  [████████████████] 1 cluster (all points)
         |
Zoom 5:  [████] [████] [████] 3 clusters
         |       |       |
Zoom 10: [██][██][██][██][██] 5 clusters
         | | | | | | | | | |
Zoom 15: Individual markers
```

## Leaflet Clustering

### Asosiy Implementation

```javascript
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Marker cluster group yaratish
const markers = L.markerClusterGroup({
  chunkedLoading: true, // Progressive loading
  chunkInterval: 200, // ms between chunks
  chunkDelay: 50, // ms delay
  spiderfyOnMaxZoom: true, // Max zoom'da spider
  showCoverageOnHover: true, // Cluster area ko'rsatish
  zoomToBoundsOnClick: true, // Click'da zoom
  maxClusterRadius: 80, // px - clustering radius

  // Performance options
  disableClusteringAtZoom: 18, // Shu zoom'da clustering o'chadi
  animate: true, // Animation
  animateAddingMarkers: false, // Yangi marker animatsiyasi (false = tezroq)
  removeOutsideVisibleBounds: true, // Viewport tashqaridagilarni remove

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
      html: `<div><span>${formatCount(count)}</span></div>`,
      className: `marker-cluster ${className}`,
      iconSize: L.point(40, 40)
    });
  }
});

// Marker'larni qo'shish
locations.forEach(loc => {
  const marker = L.marker([loc.lat, loc.lng], {
    icon: createCustomIcon(loc)
  });
  marker.bindPopup(createPopupContent(loc));
  markers.addLayer(marker);
});

// Xaritaga qo'shish
map.addLayer(markers);

// Helper functions
function formatCount(count) {
  if (count >= 1000000) return Math.round(count / 1000000) + 'M';
  if (count >= 1000) return Math.round(count / 1000) + 'K';
  return count;
}

function createCustomIcon(loc) {
  const color = loc.category === 'restaurant' ? '#22c55e' :
                loc.category === 'hotel' ? '#3b82f6' : '#6b7280';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg width="24" height="36" viewBox="0 0 24 36">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
              fill="${color}"/>
        <circle cx="12" cy="12" r="6" fill="white"/>
      </svg>
    `,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
  });
}
```

### Chunked Loading (Progressive Rendering)

```javascript
// Ko'p marker uchun chunked loading
const markers = L.markerClusterGroup({
  chunkedLoading: true,
  chunkInterval: 200,
  chunkDelay: 50,
  chunkProgress: updateProgressBar
});

function updateProgressBar(processed, total, elapsed) {
  const progress = Math.round((processed / total) * 100);
  document.getElementById('progress').style.width = `${progress}%`;
  document.getElementById('progress-text').textContent =
    `Yuklanmoqda: ${processed}/${total} (${elapsed}ms)`;

  if (processed === total) {
    document.getElementById('progress-container').style.display = 'none';
  }
}

// Batch qo'shish
async function loadMarkersInBatches(locations, batchSize = 1000) {
  for (let i = 0; i < locations.length; i += batchSize) {
    const batch = locations.slice(i, i + batchSize);
    const markerBatch = batch.map(loc =>
      L.marker([loc.lat, loc.lng]).bindPopup(loc.name)
    );

    markers.addLayers(markerBatch);

    // UI thread'ga vaqt berish
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

### Cluster Events

```javascript
markers.on('clusterclick', function(event) {
  const cluster = event.layer;
  const childMarkers = cluster.getAllChildMarkers();
  const bounds = cluster.getBounds();

  console.log(`Cluster clicked: ${childMarkers.length} markers`);

  // Custom action
  showClusterSummary(childMarkers);
});

markers.on('clustermouseover', function(event) {
  const cluster = event.layer;
  cluster.setOpacity(0.7);
});

markers.on('clustermouseout', function(event) {
  event.layer.setOpacity(1);
});

// Spiderfy events
markers.on('spiderfied', function(event) {
  console.log('Markers spiderfied:', event.markers.length);
});

markers.on('unspiderfied', function(event) {
  console.log('Markers unspiderfied');
});

// Animation events
markers.on('animationend', function() {
  console.log('Cluster animation completed');
});
```

## Mapbox GL JS Clustering

### Native Clustering

```javascript
import mapboxgl from 'mapbox-gl';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [69.2797, 41.3111],
  zoom: 10
});

map.on('load', () => {
  // GeoJSON source with clustering
  map.addSource('locations', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: locations.map(loc => ({
        type: 'Feature',
        properties: {
          id: loc.id,
          name: loc.name,
          category: loc.category,
          rating: loc.rating
        },
        geometry: {
          type: 'Point',
          coordinates: [loc.lng, loc.lat]
        }
      }))
    },
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points
    clusterRadius: 50, // Cluster radius in pixels
    clusterMinPoints: 2, // Minimum points to cluster

    // Cluster properties (aggregations)
    clusterProperties: {
      // Sum of all ratings in cluster
      totalRating: ['+', ['get', 'rating']],
      // Count by category
      restaurantCount: [
        '+',
        ['case', ['==', ['get', 'category'], 'restaurant'], 1, 0]
      ],
      hotelCount: [
        '+',
        ['case', ['==', ['get', 'category'], 'hotel'], 1, 0]
      ],
      // Max rating in cluster
      maxRating: ['max', ['get', 'rating']]
    }
  });

  // Cluster circles
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'locations',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step', ['get', 'point_count'],
        '#51bbd6', // < 100
        100, '#f1f075', // 100-750
        750, '#f28cb1' // > 750
      ],
      'circle-radius': [
        'step', ['get', 'point_count'],
        20, // < 100
        100, 30, // 100-750
        750, 40 // > 750
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });

  // Cluster count labels
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'locations',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 14
    },
    paint: {
      'text-color': '#ffffff'
    }
  });

  // Individual markers (unclustered)
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'locations',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'match', ['get', 'category'],
        'restaurant', '#22c55e',
        'hotel', '#3b82f6',
        'cafe', '#f59e0b',
        '#6b7280'
      ],
      'circle-radius': 8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });

  // Click handlers
  map.on('click', 'clusters', async (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['clusters']
    });
    const clusterId = features[0].properties.cluster_id;

    // Zoom to cluster
    const zoom = await map.getSource('locations').getClusterExpansionZoom(clusterId);
    map.easeTo({
      center: features[0].geometry.coordinates,
      zoom: zoom
    });
  });

  map.on('click', 'unclustered-point', (e) => {
    const feature = e.features[0];
    const coordinates = feature.geometry.coordinates.slice();
    const { name, category, rating } = feature.properties;

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`
        <h3>${name}</h3>
        <p>Category: ${category}</p>
        <p>Rating: ${rating}</p>
      `)
      .addTo(map);
  });

  // Cursor styles
  map.on('mouseenter', 'clusters', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'clusters', () => {
    map.getCanvas().style.cursor = '';
  });
});
```

### Supercluster (Manual Clustering)

```javascript
import Supercluster from 'supercluster';

// Supercluster instance
const index = new Supercluster({
  radius: 40, // Cluster radius in pixels
  maxZoom: 16, // Max zoom to cluster
  minZoom: 0,
  minPoints: 2,
  nodeSize: 64, // R-tree node size
  log: false,

  // Custom reduce function
  map: (props) => ({
    sum: props.value || 0,
    count: 1
  }),
  reduce: (accumulated, props) => {
    accumulated.sum += props.sum;
    accumulated.count += props.count;
  }
});

// Ma'lumotlarni yuklash
const points = locations.map(loc => ({
  type: 'Feature',
  properties: { id: loc.id, name: loc.name, value: loc.value },
  geometry: { type: 'Point', coordinates: [loc.lng, loc.lat] }
}));

index.load(points);

// Viewport bo'yicha clusterlarni olish
function getClusters(bounds, zoom) {
  return index.getClusters(
    [bounds.west, bounds.south, bounds.east, bounds.north],
    Math.floor(zoom)
  );
}

// Cluster ichidagi nuqtalarni olish
function getClusterLeaves(clusterId, limit = 100, offset = 0) {
  return index.getLeaves(clusterId, limit, offset);
}

// Cluster expansion zoom
function getClusterExpansionZoom(clusterId) {
  return index.getClusterExpansionZoom(clusterId);
}

// Map moveend handler
map.on('moveend', () => {
  const bounds = map.getBounds();
  const zoom = map.getZoom();

  const clusters = getClusters({
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth()
  }, zoom);

  updateMapMarkers(clusters);
});

// Web Worker bilan Supercluster
// worker.js
importScripts('https://unpkg.com/supercluster@7.1.5/dist/supercluster.min.js');

let index;

self.onmessage = function(e) {
  if (e.data.type === 'load') {
    index = new Supercluster({
      radius: e.data.radius || 40,
      maxZoom: e.data.maxZoom || 16
    });
    index.load(e.data.points);
    self.postMessage({ type: 'loaded', count: e.data.points.length });
  }

  if (e.data.type === 'getClusters') {
    const clusters = index.getClusters(e.data.bbox, e.data.zoom);
    self.postMessage({ type: 'clusters', data: clusters });
  }
};

// main.js
const worker = new Worker('worker.js');

worker.postMessage({
  type: 'load',
  points: geojsonPoints,
  radius: 40,
  maxZoom: 16
});

map.on('moveend', () => {
  const bounds = map.getBounds();
  worker.postMessage({
    type: 'getClusters',
    bbox: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
    zoom: Math.floor(map.getZoom())
  });
});

worker.onmessage = (e) => {
  if (e.data.type === 'clusters') {
    renderClusters(e.data.data);
  }
};
```

## Canvas Rendering (Deck.gl)

```javascript
import { Deck } from '@deck.gl/core';
import { ScatterplotLayer, IconLayer } from '@deck.gl/layers';

const deck = new Deck({
  canvas: 'deck-canvas',
  initialViewState: {
    longitude: 69.2797,
    latitude: 41.3111,
    zoom: 12,
    pitch: 0,
    bearing: 0
  },
  controller: true,

  layers: [
    // 1M+ nuqta uchun ScatterplotLayer
    new ScatterplotLayer({
      id: 'scatterplot',
      data: locations,
      getPosition: d => [d.lng, d.lat],
      getRadius: d => Math.sqrt(d.value) * 10,
      getFillColor: d => {
        const colors = {
          restaurant: [34, 197, 94],
          hotel: [59, 130, 246],
          default: [107, 114, 128]
        };
        return colors[d.category] || colors.default;
      },
      radiusMinPixels: 2,
      radiusMaxPixels: 20,
      opacity: 0.8,
      pickable: true,

      onClick: (info) => {
        if (info.object) {
          showPopup(info.object, info.x, info.y);
        }
      }
    }),

    // Icon layer (custom icons)
    new IconLayer({
      id: 'icons',
      data: importantLocations,
      getPosition: d => [d.lng, d.lat],
      getIcon: d => ({
        url: `/icons/${d.category}.png`,
        width: 64,
        height: 64,
        anchorY: 64
      }),
      getSize: 40,
      pickable: true
    })
  ],

  // GPU acceleration
  parameters: {
    depthTest: false
  }
});

// Deck.gl + Mapbox GL JS integration
import { MapboxOverlay } from '@deck.gl/mapbox';

const map = new mapboxgl.Map({ /* ... */ });

const overlay = new MapboxOverlay({
  interleaved: true,
  layers: [
    new ScatterplotLayer({ /* ... */ })
  ]
});

map.addControl(overlay);
```

## Heatmaps

### Leaflet Heatmap

```javascript
import L from 'leaflet';
import 'leaflet.heat';

// Heat layer
const heat = L.heatLayer(
  locations.map(loc => [loc.lat, loc.lng, loc.intensity || 1]),
  {
    radius: 25,
    blur: 15,
    maxZoom: 17,
    max: 1.0,
    minOpacity: 0.4,
    gradient: {
      0.4: 'blue',
      0.6: 'lime',
      0.8: 'yellow',
      1.0: 'red'
    }
  }
).addTo(map);

// Dynamic update
function updateHeatmap(newData) {
  heat.setLatLngs(newData.map(d => [d.lat, d.lng, d.intensity]));
}
```

### Mapbox GL Heatmap

```javascript
map.on('load', () => {
  map.addSource('heatmap-data', {
    type: 'geojson',
    data: geojsonPoints
  });

  map.addLayer({
    id: 'heatmap',
    type: 'heatmap',
    source: 'heatmap-data',
    maxzoom: 15,
    paint: {
      // Weight based on property
      'heatmap-weight': [
        'interpolate', ['linear'], ['get', 'intensity'],
        0, 0,
        10, 1
      ],

      // Intensity (zoom based)
      'heatmap-intensity': [
        'interpolate', ['linear'], ['zoom'],
        0, 1,
        15, 3
      ],

      // Color ramp
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(33,102,172,0)',
        0.2, 'rgb(103,169,207)',
        0.4, 'rgb(209,229,240)',
        0.6, 'rgb(253,219,199)',
        0.8, 'rgb(239,138,98)',
        1, 'rgb(178,24,43)'
      ],

      // Radius
      'heatmap-radius': [
        'interpolate', ['linear'], ['zoom'],
        0, 2,
        15, 20
      ],

      // Opacity
      'heatmap-opacity': [
        'interpolate', ['linear'], ['zoom'],
        14, 1,
        15, 0
      ]
    }
  }, 'waterway-label');

  // Transition to circles at high zoom
  map.addLayer({
    id: 'heatmap-point',
    type: 'circle',
    source: 'heatmap-data',
    minzoom: 14,
    paint: {
      'circle-radius': [
        'interpolate', ['linear'], ['zoom'],
        14, 3,
        18, 10
      ],
      'circle-color': [
        'interpolate', ['linear'], ['get', 'intensity'],
        0, 'rgba(33,102,172,0.5)',
        10, 'rgb(178,24,43)'
      ]
    }
  });
});
```

## Real-World Case: Real Estate Map

```javascript
class RealEstateMap {
  constructor(containerId) {
    this.map = L.map(containerId).setView([41.3111, 69.2797], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    this.markers = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 60,
      iconCreateFunction: (cluster) => this.createClusterIcon(cluster)
    });

    this.map.addLayer(this.markers);
    this.setupEventListeners();
  }

  createClusterIcon(cluster) {
    const children = cluster.getAllChildMarkers();
    const prices = children.map(m => m.options.data.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const count = children.length;

    return L.divIcon({
      html: `
        <div class="cluster-icon">
          <span class="cluster-count">${count}</span>
          <span class="cluster-price">${this.formatPrice(avgPrice)}</span>
        </div>
      `,
      className: 'property-cluster',
      iconSize: L.point(60, 60)
    });
  }

  formatPrice(price) {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  }

  async loadProperties(filters = {}) {
    const response = await fetch('/api/properties?' + new URLSearchParams(filters));
    const properties = await response.json();

    this.markers.clearLayers();

    const markerArray = properties.map(prop => {
      const marker = L.marker([prop.lat, prop.lng], {
        icon: this.createPropertyIcon(prop),
        data: prop
      });

      marker.bindPopup(() => this.createPropertyPopup(prop), {
        maxWidth: 350,
        className: 'property-popup'
      });

      return marker;
    });

    this.markers.addLayers(markerArray);
  }

  createPropertyIcon(property) {
    const priceClass = property.price < 100000 ? 'cheap' :
                       property.price < 300000 ? 'medium' : 'expensive';

    return L.divIcon({
      html: `
        <div class="property-marker ${priceClass}">
          <span>${this.formatPrice(property.price)}</span>
        </div>
      `,
      className: 'property-marker-container',
      iconSize: [80, 30],
      iconAnchor: [40, 30]
    });
  }

  createPropertyPopup(property) {
    return `
      <div class="property-card">
        <img src="${property.image}" alt="${property.title}" />
        <div class="property-info">
          <h3>${property.title}</h3>
          <p class="price">${this.formatPrice(property.price)}</p>
          <p class="details">
            ${property.bedrooms} xona • ${property.area} m²
          </p>
          <p class="address">${property.address}</p>
          <button onclick="viewProperty(${property.id})">Batafsil</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Viewport based loading
    this.map.on('moveend', () => {
      const bounds = this.map.getBounds();
      this.loadProperties({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      });
    });

    // Cluster events
    this.markers.on('clusterclick', (e) => {
      const cluster = e.layer;
      const children = cluster.getAllChildMarkers();

      // Agar kam marker bo'lsa, list ko'rsatish
      if (children.length <= 10) {
        this.showPropertyList(children.map(m => m.options.data));
      }
    });
  }

  showPropertyList(properties) {
    const listHtml = properties.map(p => `
      <div class="property-list-item" onclick="viewProperty(${p.id})">
        <img src="${p.image}" />
        <div>
          <strong>${this.formatPrice(p.price)}</strong>
          <span>${p.bedrooms} xona</span>
        </div>
      </div>
    `).join('');

    L.popup()
      .setLatLng(this.map.getCenter())
      .setContent(`<div class="property-list">${listHtml}</div>`)
      .openOn(this.map);
  }

  // Filters
  filterByPrice(min, max) {
    this.markers.eachLayer(marker => {
      const price = marker.options.data.price;
      if (price >= min && price <= max) {
        marker.setOpacity(1);
      } else {
        marker.setOpacity(0.2);
      }
    });
  }

  // Search
  async searchLocation(query) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json`
    );
    const results = await response.json();

    if (results.length > 0) {
      const { lat, lon } = results[0];
      this.map.setView([lat, lon], 14);
    }
  }
}

// CSS
const styles = `
.property-cluster {
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.property-marker {
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  font-weight: bold;
  font-size: 12px;
}

.property-marker.cheap { border-left: 3px solid #22c55e; }
.property-marker.medium { border-left: 3px solid #f59e0b; }
.property-marker.expensive { border-left: 3px solid #ef4444; }
`;
```

## Performance Tips

### 1. Virtual Rendering

```javascript
// Faqat viewport ichidagi markerlarni render qilish
class VirtualMarkerLayer {
  constructor(map, data) {
    this.map = map;
    this.allData = data;
    this.visibleMarkers = new Map();

    map.on('moveend', () => this.updateVisibleMarkers());
    this.updateVisibleMarkers();
  }

  updateVisibleMarkers() {
    const bounds = this.map.getBounds();
    const zoom = this.map.getZoom();

    // Spatial index query (R-tree)
    const visibleData = this.queryBounds(bounds);

    // Remove markers outside viewport
    for (const [id, marker] of this.visibleMarkers) {
      if (!visibleData.has(id)) {
        marker.remove();
        this.visibleMarkers.delete(id);
      }
    }

    // Add new markers
    for (const item of visibleData.values()) {
      if (!this.visibleMarkers.has(item.id)) {
        const marker = this.createMarker(item);
        this.visibleMarkers.set(item.id, marker);
      }
    }
  }

  queryBounds(bounds) {
    // RBush query
    const results = this.spatialIndex.search({
      minX: bounds.getWest(),
      minY: bounds.getSouth(),
      maxX: bounds.getEast(),
      maxY: bounds.getNorth()
    });

    return new Map(results.map(r => [r.id, r.data]));
  }
}
```

### 2. Object Pooling

```javascript
// Marker object'larini qayta ishlatish
class MarkerPool {
  constructor(createFn, size = 100) {
    this.createFn = createFn;
    this.pool = [];
    this.active = new Set();

    // Pre-allocate
    for (let i = 0; i < size; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire(data) {
    let marker;

    if (this.pool.length > 0) {
      marker = this.pool.pop();
    } else {
      marker = this.createFn();
    }

    this.updateMarker(marker, data);
    this.active.add(marker);
    return marker;
  }

  release(marker) {
    marker.remove();
    this.active.delete(marker);
    this.pool.push(marker);
  }

  releaseAll() {
    for (const marker of this.active) {
      marker.remove();
      this.pool.push(marker);
    }
    this.active.clear();
  }

  updateMarker(marker, data) {
    marker.setLatLng([data.lat, data.lng]);
    marker.setPopupContent(data.name);
    marker.addTo(this.map);
  }
}
```

### 3. Debounced Updates

```javascript
import { debounce } from 'lodash-es';

const updateMarkers = debounce(async (bounds) => {
  const data = await fetch(`/api/markers?bbox=${bounds.toBBoxString()}`);
  const markers = await data.json();
  renderMarkers(markers);
}, 300);

map.on('moveend', () => {
  updateMarkers(map.getBounds());
});
```

### 4. Level of Detail (LOD)

```javascript
// Zoom levelga qarab marker detalligi
function getMarkerStyle(zoom, data) {
  if (zoom < 10) {
    // Faqat cluster
    return { type: 'cluster', radius: 5 };
  }

  if (zoom < 14) {
    // Oddiy marker
    return {
      type: 'simple',
      icon: L.circleMarker([data.lat, data.lng], { radius: 4 })
    };
  }

  // To'liq marker
  return {
    type: 'detailed',
    icon: createDetailedIcon(data)
  };
}
```

## Interview Savollari

### 1. 1 million marker'ni qanday ko'rsatasiz?

**Javob:**
```javascript
// Strategiyalar kombinatsiyasi

// 1. Server-side clustering
// - PostGIS: ST_ClusterKMeans, ST_ClusterWithin
// - Elasticsearch: geo_centroid aggregation
// - MongoDB: $geoNear + $bucket

// 2. Client-side
// - Supercluster (Web Worker)
// - Canvas rendering (Deck.gl)
// - Viewport-based loading

// 3. Optimization
// - Spatial indexing (R-tree)
// - Object pooling
// - Level of Detail

// Architecture
/*
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│  API Server  │────▶│   PostGIS   │
│  (Browser)  │     │   (Node.js)  │     │  Database   │
├─────────────┤     ├──────────────┤     └─────────────┘
│ Supercluster│     │ Cache (Redis)│
│ (WebWorker) │     │ Pre-computed │
│ Deck.gl     │     │   clusters   │
└─────────────┘     └──────────────┘
*/

// Real implementation
const worker = new Worker('cluster-worker.js');

map.on('moveend', () => {
  worker.postMessage({
    bounds: map.getBounds(),
    zoom: map.getZoom()
  });
});

worker.onmessage = (e) => {
  // GPU-accelerated rendering
  deckOverlay.setProps({
    layers: [
      new ScatterplotLayer({
        data: e.data.clusters,
        // ...
      })
    ]
  });
};
```

### 2. Clustering algoritmlari farqi?

**Javob:**
```
1. Grid-Based:
   - Xaritani grid'ga bo'lish
   - O(n) - eng tez
   - Yomon vizual natija (grid chegaralari)
   - Use: Real-time heatmap

2. Distance-Based (DBSCAN):
   - Yaqin nuqtalarni birlashtirish
   - O(n²) - sekin
   - Yaxshi vizual natija
   - Use: Kichik datasetlar

3. Hierarchical (Supercluster):
   - Tree structure
   - O(n log n)
   - Zoom level optimallashtirilgan
   - Use: Katta datasetlar

4. K-Means:
   - Oldindan belgilangan cluster soni
   - O(n * k * iterations)
   - Server-side preprocessing
   - Use: Statistik tahlil
```

### 3. Viewport-based loading qanday ishlaydi?

**Javob:**
```javascript
// 1. Bounding box hisoblash
map.on('moveend', async () => {
  const bounds = map.getBounds();

  // 2. API so'rov
  const data = await fetch('/api/markers?' + new URLSearchParams({
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
    zoom: Math.floor(map.getZoom())
  }));

  // 3. Render (faqat yangi markerlar)
  const markers = await data.json();
  updateVisibleMarkers(markers);
});

// Optimization
// - Buffer zone (viewport * 1.5)
// - Cache (yuklangan tiles)
// - Debounce (tez harakatda so'rovni kamaytirish)
// - Cancel (yangi so'rov kelganda eskisini bekor)
```

### 4. Heatmap vs Cluster qachon ishlatiladi?

**Javob:**
```
Heatmap:
- Zichlik vizualizatsiyasi
- Pattern ko'rish (qayerda ko'p)
- Click kerak emas
- Use cases: Traffic density, crime maps, population

Cluster:
- Individual point access
- Click/hover interaktivlik
- Exact data kerak
- Use cases: Store locator, property map, fleet tracking

Kombinatsiya:
- Low zoom: Heatmap
- Mid zoom: Clusters
- High zoom: Individual markers
```

### 5. Marker memory leak qanday oldini olinadi?

**Javob:**
```javascript
// 1. Proper cleanup
function clearMarkers() {
  markers.forEach(m => {
    m.unbindPopup();
    m.unbindTooltip();
    m.off(); // All events
    m.remove();
  });
  markers = [];
}

// 2. Event listener management
const handler = (e) => { /* ... */ };
marker.on('click', handler);
// Later...
marker.off('click', handler);

// 3. WeakMap for data
const markerData = new WeakMap();
markerData.set(marker, { id: 1, name: 'Test' });
// Marker o'chirilganda data ham GC qilinadi

// 4. Vue/React cleanup
onUnmounted(() => {
  markerLayer.clearLayers();
  map.removeLayer(markerLayer);
});

// 5. Memory profiling
// Chrome DevTools -> Memory -> Heap snapshot
// Detached DOM elements tekshirish
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **SVG vs Canvas qachon ishlatiladi:** Agar markerlar soni 500 tadan kam bo'lsa va ustiga bosganda CSS animatsiyalar qilinishi kerak bo'lsa SVG (DOM) ishlating. Agar markerlar soni 1,000+ bo'lsa va ularni tez chizish kerak bo'lsa, qoida bitta: Faqat Canvas rendering ishlatiladi (DOM emas).
2. **Viewport Filter:** Foydalanuvchi hozirgina ko'rib turgan ekranga (Viewport / Bounding Box) tushmaydigan markerlarni backenddan so'ramang ham, chizmang ham. Faqat ekran koordinatalari (NorthEast, SouthWest) ni serverga jo'nating, server o'sha hududdagi datani bersin (BBox filtering).
3. **Clustering - Faqat Visual yechim emas:** Frontendda MarkerCluster kutubxonasi 100 ming datani birlashtira oladi deb o'ylamang. Eng to'g'ri yechim (Google Maps ham shunday qiladi) - Zoom level uzoq bo'lganda (Masalan O'zbekiston darajasida) Backend'ning o'zi nuqtalarni klasterlab (guruhlab), "Toshkentda 50,000" degan bittagina obyekt jo'natishi kerak (Server-side Clustering).

---

## Xulosa

| Yondashuv | Nima u? | Qachon ishlatiladi? |
|-----------|---------|---------------------|
| **Oddiy Marker** | Standart HTML (`<img>` yoki `<div>`) formatidagi nuqta. | Markerlar soni 500 tadan oshmaganda, CSS animatsiya kerak bo'lganda. |
| **Marker Clustering** | Yaqin turgan nuqtalarni guruhlab, ustiga ularning umumiy sonini yozib qo'yadigan algoritmlar. | 1,000 - 50,000 oraliğidagi nuqtalar bilan ishlaganda eng yaxshi yechim. |
| **Canvas / WebGL** | SVG elementlar emas, balki birgina Canvas rasmiga millionlab piksellarni "bo'yash". | 100,000+ nuqtalar uchun, yoki GPS tracking (tez harakatlanadigan transportlar) uchun. |
| **Heatmap (Issiqlik)** | Markerlar o'rniga ranglar gradatsiyasi (Qizil - ko'p, Yashil - kam) ni ko'rsatish. | Aniq ma'lumot (ID yoki ism) kerak emas bo'lsa, faqat zichlik yoki trend (Masalan koronavirus o'choqlari) ni ko'rsatish uchun. |

Ko'p marker bilan ishlash xarita ilovalarining eng muhim performance muammosi. Clustering, canvas rendering va viewport-based loading strategiyalarini to'g'ri qo'llash orqali 1M+ marker'ni samarali ko'rsatish mumkin. Eng muhimi: Brauzerni zo'riqtirmang, katta hajmdagi guruhlashlarni Backend'ga topshiring.
