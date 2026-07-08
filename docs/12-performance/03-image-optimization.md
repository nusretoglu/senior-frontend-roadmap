# Image Optimization

Rasmlar web sahifalarning o'rtacha 50% hajmini tashkil qiladi. Image optimization - bu performance yaxshilashning eng samarali usullaridan biri.

## Nazariya

### Rasmlar Nima Uchun Muammo?

```
O'rtacha web sahifa:
┌─────────────────────────────────┐
│ Total: 2MB                      │
│ ├── Images: 1MB (50%)           │
│ ├── JavaScript: 500KB (25%)     │
│ ├── CSS: 200KB (10%)            │
│ ├── Fonts: 200KB (10%)          │
│ └── HTML: 100KB (5%)            │
└─────────────────────────────────┘
```

### Image Format Comparison

| Format | Best For | Compression | Transparency | Animation |
|--------|----------|-------------|--------------|-----------|
| JPEG | Fotografiya | Lossy | Yo'q | Yo'q |
| PNG | Graphics, screenshots | Lossless | Ha | Yo'q |
| WebP | Hammasi | Both | Ha | Ha |
| AVIF | Hammasi (yangi) | Both | Ha | Ha |
| SVG | Icons, logos | Vector | Ha | Ha |
| GIF | Simple animation | Lossless | Ha | Ha |

### Size Comparison (1920x1080 foto)

```
JPEG (quality 80): 250KB
PNG: 1.5MB
WebP (quality 80): 150KB  (-40% vs JPEG)
AVIF (quality 80): 100KB  (-60% vs JPEG)
```

## Modern Image Formats

### WebP

```html
<!-- Basic WebP with fallback -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="Description" width="800" height="600">
</picture>
```

### AVIF (Eng Yangi)

```html
<!-- AVIF > WebP > JPEG fallback -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" width="800" height="600">
</picture>
```

### Vue Component

```vue
<!-- OptimizedImage.vue -->
<script setup>
interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  lazy?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  lazy: true
});

// Format variants
const webpSrc = computed(() => props.src.replace(/\.(jpg|png)$/, '.webp'));
const avifSrc = computed(() => props.src.replace(/\.(jpg|png)$/, '.avif'));
</script>

<template>
  <picture>
    <source :srcset="avifSrc" type="image/avif">
    <source :srcset="webpSrc" type="image/webp">
    <img
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="lazy ? 'lazy' : 'eager'"
      decoding="async"
    >
  </picture>
</template>
```

## Responsive Images

### Sekin Variant

```html
<!-- Barcha qurilmalarga 1920px rasm -->
<img src="hero-1920.jpg" alt="Hero">

<!-- 4G mobile'da 1920px = 5+ soniya! -->
```

### Tez Variant: srcset

```html
<!-- Brauzer mos o'lchamni tanlaydi -->
<img
  src="hero-800.jpg"
  srcset="
    hero-400.jpg 400w,
    hero-800.jpg 800w,
    hero-1200.jpg 1200w,
    hero-1920.jpg 1920w
  "
  sizes="
    (max-width: 400px) 400px,
    (max-width: 800px) 800px,
    (max-width: 1200px) 1200px,
    1920px
  "
  alt="Hero image"
  width="1920"
  height="1080"
>
```

### Picture Element (Art Direction)

```html
<!-- Turli viewportlar uchun turli rasmlar -->
<picture>
  <!-- Mobile: portret, yaqin crop -->
  <source
    media="(max-width: 640px)"
    srcset="
      hero-mobile.avif 640w,
      hero-mobile@2x.avif 1280w
    "
    type="image/avif"
  >

  <!-- Tablet: landscape -->
  <source
    media="(max-width: 1024px)"
    srcset="
      hero-tablet.avif 1024w,
      hero-tablet@2x.avif 2048w
    "
    type="image/avif"
  >

  <!-- Desktop: to'liq -->
  <source
    srcset="
      hero-desktop.avif 1920w,
      hero-desktop@2x.avif 3840w
    "
    type="image/avif"
  >

  <!-- Fallback -->
  <img
    src="hero-desktop.jpg"
    alt="Hero"
    width="1920"
    height="1080"
    fetchpriority="high"
  >
</picture>
```

## Lazy Loading

### Native Lazy Loading

```html
<!-- Above-the-fold - EAGER -->
<img
  src="hero.jpg"
  alt="Hero"
  loading="eager"
  fetchpriority="high"
  decoding="async"
>

<!-- Below-the-fold - LAZY -->
<img
  src="product.jpg"
  alt="Product"
  loading="lazy"
  decoding="async"
  width="400"
  height="300"
>
```

### Intersection Observer Advanced

```javascript
// Progressive image loading
class ProgressiveImageLoader {
  constructor() {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '100px 0px',
        threshold: 0.01
      }
    );
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  async loadImage(container) {
    const lowRes = container.querySelector('.low-res');
    const highRes = container.querySelector('.high-res');

    // Low-res allaqachon ko'rinadi
    // High-res yuklanmoqda
    const img = new Image();
    img.src = highRes.dataset.src;

    img.onload = () => {
      highRes.src = img.src;
      highRes.classList.add('loaded');

      // Low-res'ni yashirish
      setTimeout(() => {
        lowRes.style.display = 'none';
      }, 300);
    };
  }

  observe(selector) {
    document.querySelectorAll(selector).forEach(el => {
      this.observer.observe(el);
    });
  }
}
```

```vue
<!-- ProgressiveImage.vue -->
<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps<{
  src: string;
  placeholder: string;
  alt: string;
  width: number;
  height: number;
}>();

const containerRef = ref<HTMLElement>();
const isLoaded = ref(false);
const isInView = ref(false);

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isInView.value = true;
        observer.disconnect();
      }
    },
    { rootMargin: '100px' }
  );

  if (containerRef.value) {
    observer.observe(containerRef.value);
  }
});

function onHighResLoad() {
  isLoaded.value = true;
}
</script>

<template>
  <div
    ref="containerRef"
    class="progressive-image"
    :style="{ aspectRatio: `${width}/${height}` }"
  >
    <!-- Blur placeholder -->
    <img
      :src="placeholder"
      :alt="alt"
      class="placeholder"
      :class="{ 'fade-out': isLoaded }"
    >

    <!-- Full resolution -->
    <img
      v-if="isInView"
      :src="src"
      :alt="alt"
      class="full-res"
      :class="{ 'fade-in': isLoaded }"
      @load="onHighResLoad"
    >
  </div>
</template>

<style scoped>
.progressive-image {
  position: relative;
  overflow: hidden;
  background: #f0f0f0;
}

.placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(20px);
  transform: scale(1.1);
  transition: opacity 0.3s ease;
}

.placeholder.fade-out {
  opacity: 0;
}

.full-res {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.full-res.fade-in {
  opacity: 1;
}
</style>
```

## Image CDN & Services

### Cloudinary

```javascript
// Cloudinary URL transformation
function cloudinaryUrl(publicId, options = {}) {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  const transforms = [
    `q_${quality}`,
    `f_${format}`,
    width && `w_${width}`,
    height && `h_${height}`,
    crop && `c_${crop}`
  ].filter(Boolean).join(',');

  return `https://res.cloudinary.com/your-cloud/${transforms}/${publicId}`;
}

// Ishlatish
const productImage = cloudinaryUrl('products/shoe-1', {
  width: 400,
  height: 400,
  quality: 80
});
// => https://res.cloudinary.com/your-cloud/q_80,f_auto,w_400,h_400,c_fill/products/shoe-1
```

### imgix

```javascript
// imgix URL builder
class ImgixBuilder {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  build(path, params = {}) {
    const url = new URL(path, this.baseUrl);

    // Default optimizations
    const defaults = {
      auto: 'format,compress',
      fit: 'crop',
      q: 75
    };

    const allParams = { ...defaults, ...params };

    Object.entries(allParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return url.toString();
  }
}

// Ishlatish
const imgix = new ImgixBuilder('https://your-domain.imgix.net');

const thumbnail = imgix.build('/products/shoe.jpg', {
  w: 200,
  h: 200
});

const hero = imgix.build('/banners/hero.jpg', {
  w: 1920,
  h: 600,
  fit: 'crop',
  crop: 'faces,entropy'
});
```

### Vue Directive

```javascript
// directives/vOptimizedImg.js
export const vOptimizedImg = {
  mounted(el, binding) {
    const { src, sizes = {} } = binding.value;

    // Default sizes
    const defaultSizes = {
      sm: 400,
      md: 800,
      lg: 1200,
      xl: 1920
    };

    const finalSizes = { ...defaultSizes, ...sizes };

    // Generate srcset
    const srcset = Object.entries(finalSizes)
      .map(([, width]) => `${src}?w=${width} ${width}w`)
      .join(', ');

    el.srcset = srcset;
    el.sizes = `
      (max-width: 400px) 400px,
      (max-width: 800px) 800px,
      (max-width: 1200px) 1200px,
      1920px
    `;

    // Lazy loading
    el.loading = 'lazy';
    el.decoding = 'async';
  }
};
```

## Build-Time Optimization

### Vite Plugin

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false
      },
      optipng: {
        optimizationLevel: 7
      },
      mozjpeg: {
        quality: 80
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false }
        ]
      },
      webp: {
        quality: 80
      }
    })
  ]
});
```

### Sharp (Node.js)

```javascript
// scripts/optimize-images.js
import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';

async function optimizeImages() {
  const images = await glob('src/assets/images/**/*.{jpg,jpeg,png}');

  for (const imagePath of images) {
    const dir = path.dirname(imagePath);
    const name = path.basename(imagePath, path.extname(imagePath));

    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Responsive sizes
    const sizes = [400, 800, 1200, 1920].filter(s => s <= metadata.width);

    for (const width of sizes) {
      // WebP
      await image
        .resize(width)
        .webp({ quality: 80 })
        .toFile(path.join(dir, `${name}-${width}.webp`));

      // AVIF
      await image
        .resize(width)
        .avif({ quality: 65 })
        .toFile(path.join(dir, `${name}-${width}.avif`));

      // JPEG fallback
      await image
        .resize(width)
        .jpeg({ quality: 80, progressive: true })
        .toFile(path.join(dir, `${name}-${width}.jpg`));
    }

    // Placeholder (tiny, blur)
    await image
      .resize(20)
      .blur(10)
      .jpeg({ quality: 50 })
      .toFile(path.join(dir, `${name}-placeholder.jpg`));
  }
}

optimizeImages();
```

## Real-World Case: E-commerce Product Gallery

### Muammo

```
Mahsulot sahifasi:
- 8 ta rasm
- Har biri 2MB JPEG
- Total: 16MB
- Load time: 12+ soniya (4G)
```

### Yechim

```vue
<!-- ProductGallery.vue -->
<script setup>
import { ref, computed } from 'vue';

interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

const props = defineProps<{
  images: ProductImage[];
}>();

const activeIndex = ref(0);
const activeImage = computed(() => props.images[activeIndex.value]);

// Image URL builder
function getImageUrl(image: ProductImage, size: number) {
  // CDN transformation
  return `${image.url}?w=${size}&q=80&f=auto`;
}

function getPlaceholder(image: ProductImage) {
  return `${image.url}?w=20&blur=20&q=30`;
}
</script>

<template>
  <div class="product-gallery">
    <!-- Main Image -->
    <div class="main-image">
      <picture>
        <source
          :srcset="`
            ${getImageUrl(activeImage, 600)} 600w,
            ${getImageUrl(activeImage, 900)} 900w,
            ${getImageUrl(activeImage, 1200)} 1200w
          `"
          sizes="(max-width: 600px) 100vw, 50vw"
          type="image/webp"
        >
        <img
          :src="getImageUrl(activeImage, 900)"
          :alt="activeImage.alt"
          width="900"
          height="900"
          fetchpriority="high"
          decoding="async"
        >
      </picture>
    </div>

    <!-- Thumbnails -->
    <div class="thumbnails">
      <button
        v-for="(image, index) in images"
        :key="image.id"
        @click="activeIndex = index"
        @mouseenter="prefetchImage(image)"
        :class="{ active: index === activeIndex }"
      >
        <img
          :src="getImageUrl(image, 100)"
          :alt="image.alt"
          width="100"
          height="100"
          loading="lazy"
          decoding="async"
        >
      </button>
    </div>
  </div>
</template>

<script setup>
// Prefetch on hover
function prefetchImage(image: ProductImage) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = getImageUrl(image, 900);
  link.as = 'image';
  document.head.appendChild(link);
}
</script>

<style scoped>
.product-gallery {
  display: grid;
  gap: 1rem;
}

.main-image {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnails {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
}

.thumbnails button {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
}

.thumbnails button.active {
  border-color: #3b82f6;
}

.thumbnails img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
```

### Natija

```
Before:
- 8 x 2MB = 16MB
- Load: 12+ soniya

After:
- Main image: 150KB (WebP, 900px)
- Thumbnails: 8 x 5KB = 40KB
- Total initial: ~200KB
- Load: 1.5 soniya

Improvement: 80x kam data, 8x tez!
```

## Performance Metrics

### Image Performance Tracking

```javascript
// Image load timing
function trackImagePerformance() {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      if (entry.initiatorType === 'img') {
        analytics.track('image_load', {
          url: entry.name,
          duration: entry.duration,
          transferSize: entry.transferSize,
          encodedBodySize: entry.encodedBodySize
        });
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
}

// LCP tracking
function trackLCP() {
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];

    if (lastEntry.element?.tagName === 'IMG') {
      analytics.track('lcp_image', {
        url: lastEntry.element.src,
        time: lastEntry.startTime,
        size: lastEntry.size
      });
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
}
```

## Interview Savollari

### 1. WebP va AVIF qachon ishlatiladi?

**Javob:**
```
WebP:
- 95%+ brauzer qo'llab-quvvatlash
- JPEG'dan 25-35% kichik
- Transparency + animation
- Production-ready

AVIF:
- 85%+ brauzer qo'llab-quvvatlash
- JPEG'dan 50%+ kichik
- Eng yaxshi sifat/hajm ratio
- Encode vaqti uzoqroq

Strategiya:
<picture>
  <source srcset="img.avif" type="image/avif">
  <source srcset="img.webp" type="image/webp">
  <img src="img.jpg">
</picture>

// AVIF uchun
- Hero images (sifat muhim)
- Fotografiya
- Build vaqtida generate

// WebP uchun
- Dynamic images
- User uploads
- Real-time resize
```

### 2. srcset va sizes qanday ishlaydi?

**Javob:**
```html
<img
  srcset="
    small.jpg 400w,   <!-- 400px kenglik -->
    medium.jpg 800w,  <!-- 800px kenglik -->
    large.jpg 1200w   <!-- 1200px kenglik -->
  "
  sizes="
    (max-width: 600px) 100vw,  <!-- Mobile: full width -->
    (max-width: 1200px) 50vw,  <!-- Tablet: yarmi -->
    600px                       <!-- Desktop: fixed -->
  "
  src="medium.jpg"
>

<!-- Brauzer qanday tanlaydi? -->

1. `sizes` dan actual size hisoblanadi
   - 500px viewport + 100vw = 500px kerak

2. Device pixel ratio
   - 2x Retina = 500 * 2 = 1000px kerak

3. `srcset` dan eng yaqin tanlash
   - 1000px kerak, 1200w eng yaqin

4. Download
   - large.jpg yuklanadi
```

### 3. Lazy loading above-the-fold rasmga qo'yish mumkinmi?

**Javob:**
```html
<!-- XATO! -->
<img src="hero.jpg" loading="lazy">
<!-- Hero rasm kechikmay yuklanishi kerak -->

<!-- TO'G'RI -->
<img
  src="hero.jpg"
  loading="eager"
  fetchpriority="high"
  decoding="async"
>

<!-- Qoida -->
Above-the-fold (viewport ichida):
- loading="eager" (yoki yo'q)
- fetchpriority="high" (LCP uchun)
- Preload ham mumkin

Below-the-fold:
- loading="lazy"
- fetchpriority="low"

<!-- LCP ni yaxshilash -->
<link
  rel="preload"
  href="hero.jpg"
  as="image"
  fetchpriority="high"
>
```

### 4. CLS (Cumulative Layout Shift) rasmlar bilan qanday oldini olinadi?

**Javob:**
```html
<!-- XATO: CLS keltirib chiqaradi -->
<img src="photo.jpg" alt="Photo">
<!-- Rasm yuklanganda layout shift -->

<!-- TO'G'RI: Width/Height berish -->
<img
  src="photo.jpg"
  alt="Photo"
  width="800"
  height="600"
>
<!-- Brauzer joy oldindan ajratadi -->

<!-- CSS aspect-ratio -->
<img
  src="photo.jpg"
  alt="Photo"
  style="aspect-ratio: 4/3; width: 100%;"
>

<!-- Container bilan -->
<div style="aspect-ratio: 16/9;">
  <img src="video-thumb.jpg" style="width: 100%; height: 100%; object-fit: cover;">
</div>

<!-- Modern CSS -->
img {
  max-width: 100%;
  height: auto;
  aspect-ratio: attr(width) / attr(height);
}
```

### 5. Image sprite vs individual images qachon?

**Javob:**
```
Image Sprite (bitta katta rasm):
+ HTTP/1.1 da kam so'rovlar
+ Cache bitta fayl
- HTTP/2 da afzalligi kam
- Maintenance qiyin
- Unused pixels
- Mobile'da ortiqcha data

Individual Images:
+ HTTP/2 multiplexing
+ Granular caching
+ Lazy loading mumkin
+ Maintenance oson
+ Tree shaking

2024+ Recommendation:
- Icons: SVG sprite yoki icon font
- UI elements: CSS (gradients, shadows)
- Photos: Individual + lazy load

<!-- SVG Sprite -->
<svg class="icon">
  <use href="icons.svg#search"></use>
</svg>

<!-- Iconify/Lucide -->
<Icon name="search" />
```

## Best Practices Checklist

```markdown
[ ] Modern formatlar (WebP/AVIF + fallback)
[ ] Responsive images (srcset + sizes)
[ ] Lazy loading (below-the-fold)
[ ] Width/Height attributes (CLS prevention)
[ ] Placeholder/skeleton (UX)
[ ] CDN usage
[ ] Build-time optimization
[ ] LCP image preload
[ ] Proper alt text (a11y)
[ ] decoding="async"
```

## Xulosa

Image optimization strategiyasi:

1. **Format** - WebP/AVIF ishlatish
2. **Size** - Viewport'ga mos o'lcham
3. **Loading** - Lazy load + prefetch
4. **Quality** - 75-85% yetarli
5. **CDN** - Edge delivery
6. **Metrics** - LCP, CLS tracking

```
Initial Load:
├── Hero: 150KB (preload, eager, high priority)
├── Above-fold: 200KB (eager)
└── Below-fold: lazy load on scroll

Total initial: ~350KB (vs 2MB+ unoptimized)
```
