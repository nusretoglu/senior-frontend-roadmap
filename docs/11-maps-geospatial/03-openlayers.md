# OpenLayers - Enterprise-Grade GIS Kutubxonasi

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Agar siz hukumat, harbiylar, meteorologiya yoki ilmiy-tadqiqot institutlari kabi jiddiy tashkilotlar uchun dastur yozayotgan bo'lsangiz, ularga Leaflet yoki Mapbox yetarli bo'lmaydi. Chunki ular OGC (Open Geospatial Consortium) standartlaridagi Maxsus Proyeksiyalar (WMS/WFS) formatidagi maxfiylashtirilgan yoki o'ta ilmiy ma'lumotlarni berishadi. OpenLayers - xuddi shunday maxsus ilmiy/geografik standartlarni ko'tara oladigan, "Og'ir artilleriya" va Enterprise-Grade darajasidagi yagona kuchli kutubxonadir.

> [!NOTE]
> **Real-hayot analogiyasi: "O'yinchoq kompas vs Professional Teodolit"**  
> Leaflet - bu oddiy kompas, qayer shimol, qayer janub ekanini tez topib beradi (tez va oson).  
> OpenLayers - bu topograflar yer o'lchashda ishlatadigan juda murakkab **Teodolit** qurilmasi. Uni qanday ishlatishni o'rganish uchun uzoq vaqt ketadi (Learning Curve), lekin u bilan siz millimetrgacha aniqlikdagi hudud, turli standartdagi xaritalarni (Proyeksiyalar) va o'ta ilmiy-geologik rasmlarni tahlil qila olasiz.

OpenLayers - professional GIS (Geographic Information System) ilovalar uchun mo'ljallangan open-source kutubxona. WMS, WFS, WMTS kabi standart GIS protokollarini qo'llab-quvvatlaydi. Murakkab proyeksiyalar, ko'p qatlamli xaritalar va ilmiy-texnik ilovalar uchun ideal.
## Qachon OpenLayers Tanlash?

| Use Case | OpenLayers | Leaflet | Mapbox GL |
|----------|------------|---------|-----------|
| Enterprise GIS | ✅ | ❌ | ❌ |
| OGC Standards (WMS/WFS) | ✅ Native | Plugin | ❌ |
| Custom Projections | ✅ Native | Plugin | Cheklangan |
| Scientific Data | ✅ | ❌ | ❌ |
| Government/Military | ✅ | ❌ | ❌ |
| Custom Styling | ✅ | Cheklangan | ✅ |
| Learning Curve | Murakkab | Oson | O'rta |

## Asosiy Tushunchalar

### Map Initialization

```javascript
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

// Xarita yaratish
const map = new Map({
  target: 'map', // DOM element ID
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([69.2797, 41.3111]), // [lon, lat] → EPSG:3857
    zoom: 12,
    minZoom: 3,
    maxZoom: 19,
    rotation: 0
  }),
  controls: [], // Default controls'ni o'chirish
  interactions: [] // Default interactions'ni o'chirish
});
```

### Projection System (Proyeksiya Tizimi)

OpenLayers'ning eng kuchli tomoni - proyeksiyalar bilan ishlash.

```javascript
import { fromLonLat, toLonLat, transform, transformExtent } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

// Built-in projections
// EPSG:4326 - WGS84 (lat/lon)
// EPSG:3857 - Web Mercator (meters, Google Maps/OSM standart)

// Koordinata konvertatsiya
const tashkentLonLat = [69.2797, 41.3111]; // WGS84
const tashkentMercator = fromLonLat(tashkentLonLat); // Web Mercator
console.log(tashkentMercator); // [7710723.27, 5066313.77]

// Teskariga
const backToLonLat = toLonLat(tashkentMercator);

// Custom projection (O'zbekiston uchun UTM Zone 42N)
proj4.defs('EPSG:32642', '+proj=utm +zone=42 +datum=WGS84 +units=m +no_defs');
register(proj4);

// Transform between projections
const utmCoords = transform(
  tashkentLonLat,
  'EPSG:4326',
  'EPSG:32642'
);
console.log('UTM coords:', utmCoords); // [484293.12, 4574283.45]

// Extent transformatsiya
const uzbekistanExtent = [55.99, 37.18, 73.14, 45.59]; // WGS84
const mercatorExtent = transformExtent(uzbekistanExtent, 'EPSG:4326', 'EPSG:3857');
```

### Layers (Qatlamlar)

OpenLayers'da uch turdagi layer mavjud: Tile, Vector va Image.

```javascript
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import ImageLayer from 'ol/layer/Image';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import VectorSource from 'ol/source/Vector';
import ImageWMS from 'ol/source/ImageWMS';
import GeoJSON from 'ol/format/GeoJSON';

// 1. Tile Layer - plitka xaritalar
const osmLayer = new TileLayer({
  source: new OSM(),
  opacity: 1,
  visible: true,
  zIndex: 0
});

// Custom tile source
const customTiles = new TileLayer({
  source: new XYZ({
    url: 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=YOUR_KEY',
    tileSize: 512,
    maxZoom: 22
  })
});

// 2. WMS Layer - GeoServer, MapServer
const wmsLayer = new TileLayer({
  source: new TileWMS({
    url: 'https://geoserver.example.com/geoserver/wms',
    params: {
      'LAYERS': 'topomap:uzbekistan',
      'TILED': true,
      'FORMAT': 'image/png'
    },
    serverType: 'geoserver',
    crossOrigin: 'anonymous'
  })
});

// 3. Vector Layer - GeoJSON, KML, etc.
const vectorLayer = new VectorLayer({
  source: new VectorSource({
    url: '/data/districts.geojson',
    format: new GeoJSON()
  }),
  style: styleFunction
});

// 4. Image Layer (single image, no tiling)
const imageLayer = new ImageLayer({
  source: new ImageWMS({
    url: 'https://geoserver.example.com/geoserver/wms',
    params: { 'LAYERS': 'myworkspace:mylayer' },
    ratio: 1,
    serverType: 'geoserver'
  })
});

const map = new Map({
  target: 'map',
  layers: [osmLayer, wmsLayer, vectorLayer],
  view: new View({
    center: fromLonLat([69.2797, 41.3111]),
    zoom: 8
  })
});
```

### Layer Groups

```javascript
import LayerGroup from 'ol/layer/Group';

// Layer'larni guruhlash
const baseMaps = new LayerGroup({
  title: 'Base Maps',
  layers: [
    new TileLayer({
      title: 'OpenStreetMap',
      type: 'base',
      visible: true,
      source: new OSM()
    }),
    new TileLayer({
      title: 'Satellite',
      type: 'base',
      visible: false,
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      })
    })
  ]
});

const overlays = new LayerGroup({
  title: 'Overlays',
  layers: [
    new VectorLayer({
      title: 'Districts',
      source: districtsSource
    }),
    new VectorLayer({
      title: 'Cities',
      source: citiesSource
    })
  ]
});

const map = new Map({
  layers: [baseMaps, overlays]
});

// Layer control (custom yoki ol-layerswitcher plugin)
function toggleLayer(layer, visible) {
  layer.setVisible(visible);
}
```

## Features va Styling

### Vector Features

```javascript
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import Circle from 'ol/geom/Circle';
import { fromLonLat } from 'ol/proj';

// Point feature
const pointFeature = new Feature({
  geometry: new Point(fromLonLat([69.2797, 41.3111])),
  name: 'Toshkent',
  population: 2500000
});

// LineString feature
const lineFeature = new Feature({
  geometry: new LineString([
    fromLonLat([69.2797, 41.3111]),
    fromLonLat([66.9597, 39.6547]),
    fromLonLat([64.4223, 39.7747])
  ]),
  name: 'Ipak yo\'li'
});

// Polygon feature
const polygonFeature = new Feature({
  geometry: new Polygon([[
    fromLonLat([69.20, 41.35]),
    fromLonLat([69.35, 41.35]),
    fromLonLat([69.35, 41.25]),
    fromLonLat([69.20, 41.25]),
    fromLonLat([69.20, 41.35]) // Yopiq bo'lishi kerak
  ]]),
  name: 'Toshkent shahri'
});

// Circle feature (radius metrda)
const circleFeature = new Feature({
  geometry: new Circle(fromLonLat([69.2797, 41.3111]), 5000) // 5km radius
});
```

### Styling

```javascript
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';
import Icon from 'ol/style/Icon';
import Text from 'ol/style/Text';

// Point style
const pointStyle = new Style({
  image: new Circle({
    radius: 8,
    fill: new Fill({ color: 'rgba(34, 197, 94, 0.8)' }),
    stroke: new Stroke({
      color: '#ffffff',
      width: 2
    })
  }),
  text: new Text({
    text: 'Toshkent',
    font: 'bold 14px sans-serif',
    offsetY: -20,
    fill: new Fill({ color: '#333' }),
    stroke: new Stroke({
      color: '#fff',
      width: 3
    })
  })
});

// Icon style
const iconStyle = new Style({
  image: new Icon({
    src: '/images/marker.png',
    scale: 0.5,
    anchor: [0.5, 1], // Anchor point (center bottom)
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction'
  })
});

// Line style
const lineStyle = new Style({
  stroke: new Stroke({
    color: '#3b82f6',
    width: 4,
    lineCap: 'round',
    lineJoin: 'round',
    lineDash: [10, 10] // Chiziqli
  })
});

// Polygon style
const polygonStyle = new Style({
  fill: new Fill({
    color: 'rgba(59, 130, 246, 0.3)'
  }),
  stroke: new Stroke({
    color: '#3b82f6',
    width: 2
  })
});

// Dynamic style function
function styleFunction(feature, resolution) {
  const type = feature.getGeometry().getType();
  const population = feature.get('population') || 0;

  if (type === 'Point') {
    const radius = Math.min(20, Math.max(5, population / 100000));
    return new Style({
      image: new Circle({
        radius: radius,
        fill: new Fill({
          color: population > 1000000 ? '#ef4444' : '#22c55e'
        }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      })
    });
  }

  if (type === 'Polygon') {
    return polygonStyle;
  }

  return null;
}

// Layer'ga style qo'llash
vectorLayer.setStyle(styleFunction);
```

## Interactions (Interaksiyalar)

### Map Controls

```javascript
import { defaults as defaultControls, ZoomSlider, ScaleLine, FullScreen, OverviewMap, MousePosition } from 'ol/control';
import { createStringXY } from 'ol/coordinate';

const map = new Map({
  controls: defaultControls().extend([
    new ZoomSlider(),
    new ScaleLine({
      units: 'metric',
      bar: true,
      steps: 4,
      minWidth: 140
    }),
    new FullScreen(),
    new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: 'EPSG:4326',
      className: 'mouse-position',
      target: document.getElementById('mouse-position')
    }),
    new OverviewMap({
      collapsed: false,
      layers: [new TileLayer({ source: new OSM() })]
    })
  ])
});
```

### Draw Interaction

```javascript
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';

// Draw source
const drawSource = new VectorSource();
const drawLayer = new VectorLayer({
  source: drawSource,
  style: polygonStyle
});
map.addLayer(drawLayer);

// Draw interaction
let draw;

function addDrawInteraction(type) {
  // Oldingi draw'ni o'chirish
  if (draw) {
    map.removeInteraction(draw);
  }

  draw = new Draw({
    source: drawSource,
    type: type, // Point, LineString, Polygon, Circle
    style: new Style({
      fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
      stroke: new Stroke({
        color: '#ffcc33',
        lineDash: [10, 10],
        width: 2
      }),
      image: new Circle({
        radius: 5,
        stroke: new Stroke({ color: '#ffcc33' }),
        fill: new Fill({ color: '#ffcc33' })
      })
    })
  });

  draw.on('drawstart', (event) => {
    console.log('Drawing started');
  });

  draw.on('drawend', (event) => {
    const feature = event.feature;
    const geometry = feature.getGeometry();

    // Area yoki length hisoblash
    if (geometry.getType() === 'Polygon') {
      const area = getArea(geometry);
      console.log(`Area: ${(area / 1000000).toFixed(2)} km²`);
    } else if (geometry.getType() === 'LineString') {
      const length = getLength(geometry);
      console.log(`Length: ${(length / 1000).toFixed(2)} km`);
    }
  });

  map.addInteraction(draw);
}

// Modify interaction
const modify = new Modify({ source: drawSource });
map.addInteraction(modify);

// Snap interaction (vertex'larga yopishish)
const snap = new Snap({ source: drawSource });
map.addInteraction(snap);

// UI controls
document.getElementById('draw-point').onclick = () => addDrawInteraction('Point');
document.getElementById('draw-line').onclick = () => addDrawInteraction('LineString');
document.getElementById('draw-polygon').onclick = () => addDrawInteraction('Polygon');
```

### Select Interaction

```javascript
import Select from 'ol/interaction/Select';
import { click, pointerMove } from 'ol/events/condition';

// Click select
const selectClick = new Select({
  condition: click,
  style: new Style({
    fill: new Fill({ color: 'rgba(255, 0, 0, 0.3)' }),
    stroke: new Stroke({ color: '#ff0000', width: 3 })
  })
});

selectClick.on('select', (event) => {
  const selected = event.selected;
  const deselected = event.deselected;

  selected.forEach(feature => {
    console.log('Selected:', feature.get('name'));
    showFeatureInfo(feature);
  });
});

map.addInteraction(selectClick);

// Hover highlight
const selectHover = new Select({
  condition: pointerMove,
  style: highlightStyle
});
map.addInteraction(selectHover);
```

### Drag and Drop

```javascript
import DragAndDrop from 'ol/interaction/DragAndDrop';
import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML';

const dragAndDropInteraction = new DragAndDrop({
  formatConstructors: [GeoJSON, KML]
});

dragAndDropInteraction.on('addfeatures', (event) => {
  const vectorSource = new VectorSource({
    features: event.features
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource
  });

  map.addLayer(vectorLayer);
  map.getView().fit(vectorSource.getExtent());
});

map.addInteraction(dragAndDropInteraction);
```

## GeoJSON va Formatlar

```javascript
import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML';
import GPX from 'ol/format/GPX';
import WKT from 'ol/format/WKT';
import TopoJSON from 'ol/format/TopoJSON';

// GeoJSON o'qish
const geojsonFormat = new GeoJSON();

// URL dan yuklash
const vectorSource = new VectorSource({
  url: '/data/districts.geojson',
  format: geojsonFormat
});

// String'dan o'qish
const features = geojsonFormat.readFeatures(geojsonString, {
  dataProjection: 'EPSG:4326',
  featureProjection: 'EPSG:3857'
});

// Feature'larni GeoJSON'ga yozish
const geojsonOutput = geojsonFormat.writeFeatures(features, {
  dataProjection: 'EPSG:4326',
  featureProjection: 'EPSG:3857'
});

// KML (Google Earth format)
const kmlFormat = new KML({
  extractStyles: true
});
const kmlFeatures = kmlFormat.readFeatures(kmlString);

// GPX (GPS format)
const gpxFormat = new GPX();
const gpxFeatures = gpxFormat.readFeatures(gpxString);

// WKT (Well-Known Text)
const wktFormat = new WKT();
const wktFeature = wktFormat.readFeature('POINT(69.2797 41.3111)');
const wktString = wktFormat.writeGeometry(feature.getGeometry());

// TopoJSON (optimized GeoJSON)
const topoFormat = new TopoJSON();
const topoFeatures = topoFormat.readFeatures(topoJsonData);
```

## WMS/WFS Integration

### WMS (Web Map Service)

```javascript
import TileWMS from 'ol/source/TileWMS';
import ImageWMS from 'ol/source/ImageWMS';

// Tiled WMS (katta datasetlar uchun)
const wmsSource = new TileWMS({
  url: 'https://geoserver.example.com/geoserver/wms',
  params: {
    'LAYERS': 'workspace:layername',
    'TILED': true,
    'FORMAT': 'image/png',
    'STYLES': 'default_style',
    'CQL_FILTER': "region='Toshkent'" // GeoServer filter
  },
  serverType: 'geoserver',
  crossOrigin: 'anonymous'
});

// GetFeatureInfo (click info)
map.on('singleclick', async (event) => {
  const viewResolution = map.getView().getResolution();
  const url = wmsSource.getFeatureInfoUrl(
    event.coordinate,
    viewResolution,
    'EPSG:3857',
    { 'INFO_FORMAT': 'application/json' }
  );

  if (url) {
    const response = await fetch(url);
    const data = await response.json();
    showFeatureInfo(data.features[0]);
  }
});
```

### WFS (Web Feature Service)

```javascript
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';

// WFS source - vector ma'lumotlarni server'dan olish
const wfsSource = new VectorSource({
  format: new GeoJSON(),
  url: function(extent) {
    return 'https://geoserver.example.com/geoserver/wfs?' +
      'service=WFS&' +
      'version=1.1.0&' +
      'request=GetFeature&' +
      'typename=workspace:layername&' +
      'outputFormat=application/json&' +
      'srsname=EPSG:3857&' +
      'bbox=' + extent.join(',') + ',EPSG:3857';
  },
  strategy: bboxStrategy // Faqat viewport ichidagi ma'lumotlarni yuklash
});

// WFS-T (Transactional) - ma'lumot yozish
async function saveFeatureToWFS(feature) {
  const formatWFS = new WFS();
  const formatGML = new GML({
    featureNS: 'http://example.com/workspace',
    featureType: 'layername',
    srsName: 'EPSG:3857'
  });

  const xml = formatWFS.writeTransaction(
    [feature], // insert
    null, // update
    null, // delete
    formatGML
  );

  const response = await fetch('https://geoserver.example.com/geoserver/wfs', {
    method: 'POST',
    body: new XMLSerializer().serializeToString(xml),
    headers: {
      'Content-Type': 'text/xml'
    }
  });

  return response.text();
}
```

## Vue.js Integratsiya

```vue
<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container" />
    <div class="map-controls">
      <button @click="setDrawMode('Point')">Nuqta</button>
      <button @click="setDrawMode('Polygon')">Polygon</button>
      <button @click="clearDrawings">Tozalash</button>
    </div>
    <div class="mouse-position" ref="mousePosition" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import { fromLonLat, toLonLat } from 'ol/proj';
import { defaults as defaultControls, MousePosition, ScaleLine } from 'ol/control';
import { createStringXY } from 'ol/coordinate';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';
import 'ol/ol.css';

const props = defineProps({
  center: {
    type: Array,
    default: () => [69.2797, 41.3111]
  },
  zoom: {
    type: Number,
    default: 12
  },
  features: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['featureDrawn', 'mapClick', 'featureSelect']);

const mapContainer = ref(null);
const mousePosition = ref(null);
const map = shallowRef(null);
const drawSource = shallowRef(null);
let currentDraw = null;

// Styles
const defaultStyle = new Style({
  fill: new Fill({ color: 'rgba(59, 130, 246, 0.3)' }),
  stroke: new Stroke({ color: '#3b82f6', width: 2 }),
  image: new Circle({
    radius: 7,
    fill: new Fill({ color: '#3b82f6' }),
    stroke: new Stroke({ color: '#fff', width: 2 })
  })
});

onMounted(() => {
  // Vector source
  drawSource.value = new VectorSource();

  // Map initialization
  map.value = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({ source: new OSM() }),
      new VectorLayer({
        source: drawSource.value,
        style: defaultStyle
      })
    ],
    view: new View({
      center: fromLonLat(props.center),
      zoom: props.zoom
    }),
    controls: defaultControls().extend([
      new MousePosition({
        coordinateFormat: createStringXY(6),
        projection: 'EPSG:4326',
        target: mousePosition.value
      }),
      new ScaleLine({ units: 'metric' })
    ])
  });

  // Modify interaction
  const modify = new Modify({ source: drawSource.value });
  map.value.addInteraction(modify);

  // Click event
  map.value.on('click', (event) => {
    const coordinate = toLonLat(event.coordinate);
    emit('mapClick', { lng: coordinate[0], lat: coordinate[1] });
  });

  // Load initial features
  if (props.features.length > 0) {
    loadFeatures(props.features);
  }
});

onUnmounted(() => {
  if (map.value) {
    map.value.setTarget(null);
    map.value = null;
  }
});

// Watch features prop
watch(() => props.features, loadFeatures, { deep: true });

function loadFeatures(features) {
  if (!drawSource.value) return;

  drawSource.value.clear();

  const geojsonFormat = new GeoJSON();
  const olFeatures = geojsonFormat.readFeatures({
    type: 'FeatureCollection',
    features
  }, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  });

  drawSource.value.addFeatures(olFeatures);
}

function setDrawMode(type) {
  // Remove existing draw interaction
  if (currentDraw) {
    map.value.removeInteraction(currentDraw);
  }

  if (!type) {
    currentDraw = null;
    return;
  }

  currentDraw = new Draw({
    source: drawSource.value,
    type: type
  });

  currentDraw.on('drawend', (event) => {
    const feature = event.feature;
    const geojsonFormat = new GeoJSON();
    const geojsonFeature = geojsonFormat.writeFeatureObject(feature, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });

    emit('featureDrawn', geojsonFeature);
  });

  map.value.addInteraction(currentDraw);
}

function clearDrawings() {
  drawSource.value.clear();
}

// Exported methods
defineExpose({
  getMap: () => map.value,
  setView: (center, zoom) => {
    map.value?.getView().animate({
      center: fromLonLat(center),
      zoom,
      duration: 500
    });
  },
  fitExtent: (extent) => {
    map.value?.getView().fit(extent, { padding: [50, 50, 50, 50] });
  },
  getFeatures: () => {
    const format = new GeoJSON();
    return format.writeFeaturesObject(drawSource.value.getFeatures(), {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
  }
});
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  gap: 8px;
}

.map-controls button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.mouse-position {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}
</style>
```

## Real-World Case: Land Cadastre System (Yer Kadastri)

```javascript
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat, toLonLat } from 'ol/proj';
import { getArea, getLength } from 'ol/sphere';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Select from 'ol/interaction/Select';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';

class CadastreMap {
  constructor(containerId) {
    this.parcelSource = new VectorSource();
    this.initMap(containerId);
    this.initStyles();
    this.initInteractions();
  }

  initMap(containerId) {
    // WMS layer - cadastre data from GeoServer
    this.cadastreWMS = new TileLayer({
      source: new TileWMS({
        url: 'https://geoserver.cadastre.uz/geoserver/wms',
        params: {
          'LAYERS': 'cadastre:parcels',
          'TILED': true,
          'FORMAT': 'image/png'
        },
        serverType: 'geoserver'
      }),
      opacity: 0.7
    });

    // Parcel editing layer
    this.parcelLayer = new VectorLayer({
      source: this.parcelSource,
      style: (feature) => this.getParcelStyle(feature)
    });

    this.map = new Map({
      target: containerId,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          })
        }),
        this.cadastreWMS,
        this.parcelLayer
      ],
      view: new View({
        center: fromLonLat([69.2797, 41.3111]),
        zoom: 17,
        minZoom: 10,
        maxZoom: 21
      })
    });
  }

  initStyles() {
    this.styles = {
      default: new Style({
        fill: new Fill({ color: 'rgba(255, 255, 255, 0.4)' }),
        stroke: new Stroke({ color: '#3b82f6', width: 2 })
      }),

      selected: new Style({
        fill: new Fill({ color: 'rgba(255, 255, 0, 0.4)' }),
        stroke: new Stroke({ color: '#f59e0b', width: 3 })
      }),

      owned: new Style({
        fill: new Fill({ color: 'rgba(34, 197, 94, 0.4)' }),
        stroke: new Stroke({ color: '#22c55e', width: 2 })
      }),

      disputed: new Style({
        fill: new Fill({ color: 'rgba(239, 68, 68, 0.4)' }),
        stroke: new Stroke({ color: '#ef4444', width: 2 })
      })
    };
  }

  getParcelStyle(feature) {
    const status = feature.get('status') || 'default';
    const style = this.styles[status] || this.styles.default;

    // Add area label
    const geometry = feature.getGeometry();
    if (geometry && geometry.getType() === 'Polygon') {
      const area = getArea(geometry);
      const areaHa = (area / 10000).toFixed(2); // Hectares

      return [
        style,
        new Style({
          text: new Text({
            text: `${areaHa} ga`,
            font: 'bold 12px sans-serif',
            fill: new Fill({ color: '#333' }),
            stroke: new Stroke({ color: '#fff', width: 3 }),
            overflow: true
          })
        })
      ];
    }

    return style;
  }

  initInteractions() {
    // Select interaction
    this.select = new Select({
      layers: [this.parcelLayer],
      style: this.styles.selected
    });

    this.select.on('select', (event) => {
      if (event.selected.length > 0) {
        const feature = event.selected[0];
        this.showParcelInfo(feature);
      }
    });

    this.map.addInteraction(this.select);

    // Modify interaction
    this.modify = new Modify({
      source: this.parcelSource
    });

    this.modify.on('modifyend', (event) => {
      event.features.forEach(feature => {
        this.updateParcelArea(feature);
        this.saveParcel(feature);
      });
    });

    this.map.addInteraction(this.modify);
  }

  // Draw new parcel
  startDrawing() {
    this.draw = new Draw({
      source: this.parcelSource,
      type: 'Polygon'
    });

    this.draw.on('drawend', (event) => {
      const feature = event.feature;

      // Generate cadastral number
      const cadastralNumber = this.generateCadastralNumber();
      feature.set('cadastral_number', cadastralNumber);
      feature.set('status', 'default');

      // Calculate area
      this.updateParcelArea(feature);

      // Save to server
      this.saveParcel(feature);

      // Stop drawing
      this.stopDrawing();
    });

    this.map.addInteraction(this.draw);
  }

  stopDrawing() {
    if (this.draw) {
      this.map.removeInteraction(this.draw);
      this.draw = null;
    }
  }

  updateParcelArea(feature) {
    const geometry = feature.getGeometry();
    const area = getArea(geometry);
    feature.set('area_sqm', area);
    feature.set('area_ha', area / 10000);
  }

  generateCadastralNumber() {
    // Format: 10:01:0010001:0001 (region:district:quarter:parcel)
    const region = '10';
    const district = '01';
    const quarter = '0010001';
    const parcel = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
    return `${region}:${district}:${quarter}:${parcel}`;
  }

  showParcelInfo(feature) {
    const info = {
      cadastralNumber: feature.get('cadastral_number'),
      area: (feature.get('area_ha') || 0).toFixed(4) + ' ga',
      status: feature.get('status'),
      owner: feature.get('owner_name'),
      landUse: feature.get('land_use_type')
    };

    // Emit event or update UI
    document.dispatchEvent(new CustomEvent('parcelSelected', { detail: info }));
  }

  async saveParcel(feature) {
    const geojsonFormat = new GeoJSON();
    const geojson = geojsonFormat.writeFeatureObject(feature, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });

    try {
      const response = await fetch('/api/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geojson)
      });

      if (!response.ok) throw new Error('Save failed');

      const savedParcel = await response.json();
      feature.setId(savedParcel.id);

      return savedParcel;
    } catch (error) {
      console.error('Failed to save parcel:', error);
      throw error;
    }
  }

  async loadParcels(bounds) {
    const geojsonFormat = new GeoJSON();

    try {
      const response = await fetch(
        `/api/parcels?bbox=${bounds.join(',')}`
      );
      const data = await response.json();

      const features = geojsonFormat.readFeatures(data, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });

      this.parcelSource.clear();
      this.parcelSource.addFeatures(features);
    } catch (error) {
      console.error('Failed to load parcels:', error);
    }
  }

  // Point in polygon check
  checkPointOwnership(coords) {
    const point = fromLonLat(coords);

    const features = this.parcelSource.getFeatures();
    for (const feature of features) {
      const geometry = feature.getGeometry();
      if (geometry.intersectsCoordinate(point)) {
        return {
          inParcel: true,
          cadastralNumber: feature.get('cadastral_number'),
          owner: feature.get('owner_name')
        };
      }
    }

    return { inParcel: false };
  }

  // Export to various formats
  exportParcels(format = 'geojson') {
    const features = this.parcelSource.getFeatures();

    if (format === 'geojson') {
      const geojsonFormat = new GeoJSON();
      return geojsonFormat.writeFeaturesObject(features, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });
    }

    if (format === 'csv') {
      let csv = 'cadastral_number,area_sqm,area_ha,status,owner\n';
      features.forEach(f => {
        csv += `${f.get('cadastral_number')},${f.get('area_sqm')},${f.get('area_ha')},${f.get('status')},${f.get('owner_name')}\n`;
      });
      return csv;
    }
  }
}

// Foydalanish
const cadastre = new CadastreMap('map-container');
cadastre.loadParcels([69.2, 41.2, 69.4, 41.4]);
```

## Performance Tips

### 1. Large Dataset Optimization

```javascript
// 1. Spatial indexing
import RBush from 'rbush';

const spatialIndex = new RBush();
features.forEach(f => {
  const extent = f.getGeometry().getExtent();
  spatialIndex.insert({
    minX: extent[0],
    minY: extent[1],
    maxX: extent[2],
    maxY: extent[3],
    feature: f
  });
});

// Fast spatial query
function getFeaturesInExtent(extent) {
  return spatialIndex.search({
    minX: extent[0],
    minY: extent[1],
    maxX: extent[2],
    maxY: extent[3]
  }).map(item => item.feature);
}

// 2. Simplification for zoom levels
import { simplify } from 'ol/geom/flat/simplify';

function getSimplifiedGeometry(geometry, resolution) {
  const flatCoords = geometry.getFlatCoordinates();
  const tolerance = resolution * 5; // 5 pixels
  return simplify(flatCoords, 0, flatCoords.length, 2, tolerance);
}

// 3. Web Workers for heavy computation
const worker = new Worker('geo-worker.js');
worker.postMessage({ type: 'process', features: geojsonData });
worker.onmessage = (e) => {
  const processedFeatures = e.data;
  vectorSource.addFeatures(processedFeatures);
};
```

### 2. Rendering Optimization

```javascript
// 1. Use declutter for labels
const vectorLayer = new VectorLayer({
  source: vectorSource,
  declutter: true, // Overlapping label'larni yashirish
  renderBuffer: 200
});

// 2. Update while animating/interacting
vectorLayer.setProperties({
  updateWhileAnimating: false,
  updateWhileInteracting: false
});

// 3. Use Canvas renderer for simple shapes
import { createCanvasContext2D } from 'ol/dom';

// 4. Batch source updates
vectorSource.addFeatures(features); // Bir marta, har bir feature uchun emas
```

### 3. Tile Caching

```javascript
// Service Worker caching
const TILE_CACHE = 'ol-tiles-v1';

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.includes('/geoserver/') ||
      url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILE_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});
```

## Interview Savollari

### 1. OpenLayers vs Leaflet qachon tanlash kerak?

**Javob:**
```
OpenLayers tanlang:
- OGC standartlari (WMS, WFS, WCS, WMTS) kerak bo'lsa
- Murakkab proyeksiyalar (UTM, local CRS) kerak bo'lsa
- Enterprise GIS muhiti (GeoServer, ArcGIS Server)
- Ilmiy/texnik ilovalar (geodeziya, kartografiya)
- Ko'p formatlash (KML, GPX, WKT, GML)

Leaflet tanlang:
- Oddiy marker/polygon xaritalar
- Tezkor prototiplash
- Kichik bundle hajmi kerak
- Web Mercator (EPSG:3857) yetarli

OpenLayers uchun trade-off:
- Kattaroq learning curve
- Kattaroq bundle (~180KB vs 42KB)
- Ko'proq boilerplate kod
```

### 2. Proyeksiya nima va nima uchun muhim?

**Javob:**
```
Proyeksiya - 3D Yer sharini 2D tekislikka o'tkazish usuli.

Asosiy proyeksiyalar:
1. EPSG:4326 (WGS84) - Lat/Lon, GPS koordinatalari
2. EPSG:3857 (Web Mercator) - Google Maps, OSM
3. UTM Zones - Lokal aniqlik uchun (metrda)

Muammolar:
- Har bir proyeksiya nimanidir buzadi (shape, area, distance, direction)
- Web Mercator - area'ni buzadi (Qutblar katta ko'rinadi)
- Lokal proyeksiyalar - faqat ma'lum hududda aniq

OpenLayers'da:
- fromLonLat() / toLonLat() - konvertatsiya
- proj4.defs() - custom proyeksiya qo'shish
- transformExtent() - bounds konvertatsiya
```

### 3. WMS va WFS farqi nimada?

**Javob:**
```
WMS (Web Map Service):
- Raster image qaytaradi (PNG, JPEG)
- Server-side rendering
- Faqat visualization
- GetMap, GetFeatureInfo
- Tez, lekin read-only

WFS (Web Feature Service):
- Vector ma'lumot qaytaradi (GeoJSON, GML)
- Client-side rendering
- CRUD operatsiyalar (WFS-T)
- GetFeature, DescribeFeatureType
- Sekinroq, lekin to'liq kontrol

Qachon nima:
- WMS: Faqat ko'rsatish kerak, legacy data, katta dataset
- WFS: Tahrirlash kerak, filtering/querying, styling kerak
```

### 4. 100,000 polygon'ni qanday render qilasiz?

**Javob:**
```javascript
// 1. Server-side simplification
// GeoServer'da: viewparams=simplify:0.001

// 2. Client-side strategies
// a) Clustering (nuqtalar uchun)
import Cluster from 'ol/source/Cluster';

// b) Viewport-based loading
map.on('moveend', () => {
  const extent = map.getView().calculateExtent();
  loadFeaturesInExtent(extent);
});

// c) Level of Detail (LOD)
const zoom = map.getView().getZoom();
if (zoom < 10) {
  // Simplified version
  source.setUrl('/api/features?simplify=high');
} else {
  // Full detail
  source.setUrl('/api/features');
}

// d) Declutter
new VectorLayer({ declutter: true });

// e) Web Workers
// Heavy computation'ni main thread'dan chiqarish
```

### 5. Area va distance qanday hisoblanadi?

**Javob:**
```javascript
import { getArea, getLength } from 'ol/sphere';

// Geodetic (ellipsoid ustida, aniq)
const polygon = feature.getGeometry();
const area = getArea(polygon); // square meters
const areaKm2 = area / 1000000;

const line = lineFeature.getGeometry();
const length = getLength(line); // meters
const lengthKm = length / 1000;

// Cartesian (tekislikda, taxminiy)
// Faqat kichik hududlar uchun
const cartesianArea = polygon.getArea();

// Haversine formula (distance)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi/2)**2 +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Modullik:** OpenLayers juda katta kutubxona (bundle size). Shuning uchun uni hech qachon to'liq o'zini (`import * as ol from 'ol'`) import qilmang. Har doim faqat kerakli modulni (Masalan: `import Map from 'ol/Map'`) import qilish orqali loyiha hajmini oshib ketishini oldini oling.
2. **Proyeksiyalar bilan ehtiyot bo'lish:** OpenLayers default holatda Web Mercator (`EPSG:3857`) proyeksiyasidan foydalanadi. Lekin GPS koordinatalar (longitude, latitude) ko'pincha WGS84 (`EPSG:4326`) formatida keladi. Shuning uchun frontendga serverdan kelayotgan va frontenddan jo'natilayotgan koordinatalarni o'zaro aylantirishni (`fromLonLat()`, `toLonLat()`) esdan chiqarmang.
3. **Map Object ni Vue reaktivligidan uzoq tutish:** `Map` obyektini Vue dagi `ref()` yoki `reactive()` ichiga umuman qo'ymang. OpenLayers ning o'zida ichki holat (state) juda murakkab, Vue uning hamma property lari reaktiv qilishga urinsa, xarita mutlaqo qotib, "muzlab" qoladi. Unga `shallowRef()` ishlating yoki oddiy variable (`let map = null`) da saqlang.

---

## Xulosa

| Xususiyat | Tavsif / Foydasi |
|-----------|------------------|
| **Asos (Texnologiya)** | 2D/3D (WebGL orqali) obyektlarni chizish qobiliyatiga ega eng kompleks Geographic dvigatel. |
| **Integratsiya** | OGC xalqaro standartlari (WMS, WFS, WCS) ni to'g'ridan to'g'ri o'qib tasvirlash layoqati (Leaflet buni uddalay olmaydi). |
| **Qulayligi** | API yozilishi ancha uzun (verbose). O'rganish va kod yozish eng qiyin (Steep Learning Curve). |
| **Xavfsizlik & Autonomiya** | To'liq Open Source, offline serverlarda ham davlat tashkilotlari o'z yopiq xaritalarini ulashlari uchun juda mos. |

OpenLayers - enterprise-grade GIS ilovalar uchun eng kuchli JavaScript kutubxonasi. WMS/WFS integratsiya, murakkab proyeksiyalar va professional GIS amaliyotlari (Kadastr, Tabiat, Harbiylar, Geologiya) uchun ideal tanlov. Learning curve yuqori, lekin professional GIS loyihalar uchun yagona yo'l.
