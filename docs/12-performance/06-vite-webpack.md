# Vite vs Webpack

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchi har safar bitta kodni o'zgartirganda natijani ko'rish uchun 10-20 soniya kutishi asabni buzadi va unumdorlikni tushiradi. Oldinlari Webpack barcha fayllarni bitta qilib yig'gandan keyingina (Bundle) brauzerga berardi. Zamonaviy Vite esa kodni hech qanaqa yig'masdan (No-bundle), shunchaki ES Modul sifatida brauzerning o'ziga berib yuboradi. Natijada loyiha qanchalik katta bo'lmasin, kod yozilganda natija soniyaning mingdan bir ulushida (HMR) yangilanadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Restoranda ovqat tayyorlash"**  
> - **Webpack (Eski usul):** Siz 5 xil ovqat buyurdingiz. Oshpaz 5 ta ovqatning hammasini to'liq pishirib, katta laganga solib hammasini birdaniga stolingizga olib keladi. Bitta ovqat retseptini o'zgartirsangiz, hammasini boshqatdan pishiradi. (Barchasini bundle qilish).
> - **Vite (Yangi usul):** Siz menyuni ko'rib turibsiz. Siz qaysi ovqatni so'rasangiz, oshpaz faqat o'shani pishirib olib keladi (On-demand). Siz boshqasini xohlasangiz, tezda o'shani o'zini tayyorlaydi. Hamma narsani boshidan pishirib o'tirmaydi.

## Nazariya

### Build Tools Evolyutsiyasi

| Yil | Asbob (Tool) | Asosiy funksiyasi |
| --- | --- | --- |
| **2012** | Grunt | Vazifalarni bajaruvchi (Task runner) |
| **2014** | Gulp | Oqim bilan ishlovchi (Streaming) |
| **2014** | Webpack 1 | Fayllarni yig'uvchi (Bundler) |
| **2019** | Webpack 5 | Optimallashtirilgan Bundler |
| **2020** | **Vite** | ES Module ga asoslangan (No-bundle dev) |
| **2021** | Turbopack | Rust tilida yozilgan Webpack vorisi |

### Asosiy Farqlar (Qanday ishlaydi?)

```mermaid
graph TD
    subgraph Webpack_Usuli [Webpack: Barchasini Yig'ish]
        W1[Kod fayllari] --> W2[Barchasini o'qish, tahlil qilish, yig'ish]
        W2 --> W3[1-2 ta Katta Bundle]
        W3 --> W4[Brauzerga berish]
    end
    
    subgraph Vite_Usuli [Vite: So'rovga qarab berish]
        V1[Kod fayllari] -->|Brauzer so'raganda| V2[Native ESM orqali berish]
        V2 --> V3[Brauzer (On-demand)]
    end
    
    style Webpack_Usuli fill:#ffebee,stroke:#c62828
    style Vite_Usuli fill:#e8f5e9,stroke:#2e7d32
```

**Natijada:** Webpack da dev server ishga tushishi 1-2 daqiqa olsa, Vite da bu 1 soniyadan ham kam vaqt oladi. HMR (Hot Module Replacement) Vite da bir zumda ishlaydi.

## Vite

### Asosiy Konfiguratsiya

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],

  // Path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  },

  // Dev server
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // Build settings
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  },

  // CSS
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
});
```

### Vite Plugins

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    // Vue SFC support
    vue(),

    // JSX support
    vueJsx(),

    // Bundle analyzer
    visualizer({
      filename: 'dist/stats.html',
      open: true
    }),

    // Gzip/Brotli compression
    viteCompression({ algorithm: 'gzip' }),
    viteCompression({ algorithm: 'brotliCompress' }),

    // PWA
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});
```

### Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=My App

# .env.production
VITE_API_URL=https://api.production.com
VITE_APP_TITLE=My App (Production)
```

```javascript
// Foydalanish
const apiUrl = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
const mode = import.meta.env.MODE;
```

```typescript
// env.d.ts - TypeScript support
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## Webpack

### Asosiy Konfiguratsiya

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/main.js',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction
        ? 'js/[name].[contenthash].js'
        : 'js/[name].js',
      chunkFilename: isProduction
        ? 'js/[name].[contenthash].js'
        : 'js/[name].js',
      clean: true
    },

    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components')
      }
    },

    module: {
      rules: [
        // Vue
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },

        // JavaScript
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },

        // CSS/SCSS
        {
          test: /\.(css|scss)$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'vue-style-loader',
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },

        // Images
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[hash][ext]'
          }
        },

        // Fonts
        {
          test: /\.(woff2?|ttf|eot)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash][ext]'
          }
        }
      ]
    },

    plugins: [
      new VueLoaderPlugin(),

      new HtmlWebpackPlugin({
        template: './index.html',
        minify: isProduction
      }),

      new MiniCssExtractPlugin({
        filename: isProduction
          ? 'css/[name].[contenthash].css'
          : 'css/[name].css'
      }),

      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false
      })
    ],

    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },

    devServer: {
      port: 3000,
      hot: true,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },

    devtool: isProduction ? 'source-map' : 'eval-source-map'
  };
};
```

### Webpack 5 Optimization

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    // Tree shaking
    usedExports: true,
    sideEffects: true,

    // Code splitting
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        // Vue core
        vue: {
          test: /[\\/]node_modules[\\/](vue|vue-router|pinia)[\\/]/,
          name: 'vue',
          chunks: 'all',
          priority: 20
        },
        // Other vendors
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        // Common modules
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },

    // Module IDs
    moduleIds: 'deterministic',

    // Runtime chunk
    runtimeChunk: 'single',

    // Minification
    minimize: true,
    minimizer: [
      // JS
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      }),
      // CSS
      new CssMinimizerPlugin()
    ]
  },

  // Caching
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack_cache')
  }
};
```

## Performance Comparison

### Cold Start

```
┌────────────────────────────────────────────────┐
│ Project: 500 components, 200 routes            │
│                                                │
│ Vite:                                          │
│ └── Cold start: 400ms                          │
│                                                │
│ Webpack 5:                                     │
│ └── Cold start: 45,000ms (45s)                 │
│                                                │
│ Ratio: Vite 112x faster                        │
└────────────────────────────────────────────────┘
```

### HMR (Hot Module Replacement)

```
┌────────────────────────────────────────────────┐
│ Single component change                        │
│                                                │
│ Vite:                                          │
│ └── HMR: 20-50ms (instant)                     │
│                                                │
│ Webpack 5:                                     │
│ └── HMR: 500-2000ms                            │
│                                                │
│ Ratio: Vite 10-40x faster                      │
└────────────────────────────────────────────────┘
```

### Production Build

```
┌────────────────────────────────────────────────┐
│ Large project build                            │
│                                                │
│ Vite (Rollup):                                 │
│ └── Build: 30-60s                              │
│ └── Output: Optimized                          │
│                                                │
│ Webpack 5:                                     │
│ └── Build: 60-120s                             │
│ └── Output: Optimized                          │
│                                                │
│ Ratio: Similar (Vite slightly faster)          │
└────────────────────────────────────────────────┘
```

## Migration: Webpack to Vite

### Step 1: Dependencies

```bash
# Remove Webpack
npm uninstall webpack webpack-cli webpack-dev-server
npm uninstall vue-loader babel-loader css-loader
npm uninstall html-webpack-plugin mini-css-extract-plugin

# Install Vite
npm install -D vite @vitejs/plugin-vue
```

### Step 2: Config Files

```javascript
// vite.config.js (yangi)
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### Step 3: index.html

```html
<!-- Webpack: public/index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>App</title>
</head>
<body>
  <div id="app"></div>
  <!-- Webpack auto-injects scripts -->
</body>
</html>

<!-- Vite: index.html (root) -->
<!DOCTYPE html>
<html>
<head>
  <title>App</title>
</head>
<body>
  <div id="app"></div>
  <!-- Vite: explicit script -->
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### Step 4: Environment Variables

```javascript
// Webpack
process.env.VUE_APP_API_URL
process.env.NODE_ENV

// Vite
import.meta.env.VITE_API_URL
import.meta.env.MODE
import.meta.env.DEV
import.meta.env.PROD
```

### Step 5: require() to import

```javascript
// Webpack (CommonJS)
const icon = require('@/assets/icon.png');
const Component = require('@/components/Component.vue').default;

// Vite (ESM only)
import icon from '@/assets/icon.png';
import Component from '@/components/Component.vue';

// Dynamic imports
// Webpack
const Component = () => import(
  /* webpackChunkName: "chunk" */
  '@/components/Component.vue'
);

// Vite
const Component = () => import('@/components/Component.vue');
```

## Advanced Vite Features

### Glob Import

```javascript
// Webpack: require.context
const modules = require.context('./modules', true, /\.js$/);
modules.keys().forEach(key => {
  const module = modules(key);
});

// Vite: import.meta.glob
const modules = import.meta.glob('./modules/*.js');
// { './modules/a.js': () => import('./modules/a.js'), ... }

// Eager loading
const modules = import.meta.glob('./modules/*.js', { eager: true });
// { './modules/a.js': { default: ... }, ... }

// With patterns
const images = import.meta.glob('./assets/**/*.{png,jpg,svg}');
```

### Worker Support

```javascript
// Vite - built-in worker support
import Worker from './worker?worker';

const worker = new Worker();
worker.postMessage({ type: 'calculate', data: [1, 2, 3] });

// Shared Worker
import SharedWorker from './worker?sharedworker';

// Inline worker
import InlineWorker from './worker?worker&inline';
```

### WASM Support

```javascript
// Vite - native WASM support
import init from './fibonacci.wasm?init';

const instance = await init();
const result = instance.exports.fibonacci(10);
```

### SSR Support

```javascript
// vite.config.js
export default defineConfig({
  build: {
    ssr: true
  },
  ssr: {
    external: ['some-external-package'],
    noExternal: ['some-dep-that-needs-transform']
  }
});

// server.js
import { createServer } from 'vite';

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'
});

app.use(vite.middlewares);
```

## Real-World Case: Large App Migration

### Muammo

```
Legacy Webpack Project:
- 800 components
- 150 routes
- Dev server start: 2 minutes
- HMR: 3-5 seconds
- Build: 4 minutes
```

### Migration Steps

```javascript
// 1. Vite config
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Webpack compatibility
      '~': path.resolve(__dirname, 'node_modules')
    }
  },

  // Legacy browser support
  build: {
    target: 'es2015'
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      // Pre-bundle heavy deps
      'element-plus',
      'echarts'
    ]
  }
});
```

```javascript
// 2. Scripts migration
// package.json
{
  "scripts": {
    // Before
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",

    // After
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

```javascript
// 3. Environment variables
// Replace all process.env.VUE_APP_*
// with import.meta.env.VITE_*

// scripts/migrate-env.js
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{js,vue}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /process\.env\.VUE_APP_(\w+)/g,
    'import.meta.env.VITE_$1'
  );
  fs.writeFileSync(file, content);
});
```

### Natija

```
After Migration:
- Dev server start: 500ms (240x faster)
- HMR: 20ms (150x faster)
- Build: 45 seconds (5x faster)

Developer Experience:
- Instant feedback
- No coffee breaks during rebuild
- Happier developers
```

## Interview Savollari

### 1. Vite nima uchun development'da tez?

**Javob:**
```
Vite tezlik sabablari:

1. Native ESM
   - Browser o'zi modullarni resolve qiladi
   - Bundle qilish SHART EMAS
   - Faqat so'ralgan fayllar transform

2. esbuild Pre-bundling
   - node_modules 10-100x tez pre-bundle
   - Go'da yozilgan (Webpack JS'da)

3. On-demand Transform
   - Faqat brauzer so'ragan fayllar
   - Har fayl alohida HTTP request

Webpack esa:
- Hammasi bundle qilinadi
- Dependency graph build
- Full re-bundle har o'zgarishda

Misol:
// 500 component project
// Vite: faqat bitta component transform (20ms)
// Webpack: butun graph analyze (2000ms)
```

### 2. Vite production'da Rollup ishlatishi sababi?

**Javob:**
```
Development: Native ESM
- Tez, chunki bundle yo'q
- Lekin production uchun XATO:
  - 100+ HTTP requests
  - Waterfall loading
  - No tree shaking
  - No minification

Production: Rollup Bundle
- Single/few HTTP requests
- Tree shaking
- Minification
- Code splitting
- Cache optimization

Nega Rollup (esbuild emas)?
1. Mature ecosystem
2. Better tree shaking
3. Plugin compatibility
4. Flexible output formats
5. Better code splitting

esbuild:
- Juda tez, lekin...
- Code splitting limited
- Plugin ecosystem kichik
- CSS splitting yo'q

Kelajak: Rolldown (Rust-based Rollup)
- Rollup API compatible
- esbuild tezligi
```

### 3. Webpack qachon Vite'dan yaxshiroq?

**Javob:**
```
Webpack yaxshiroq:

1. Legacy Browser Support
   - IE11 kerak
   - Vite: ES2015+ only

2. Complex Loaders
   - Custom loaders ko'p
   - Webpack loader ecosystem katta

3. Module Federation
   - Micro-frontends
   - Runtime module sharing
   - Vite: experimental

4. Mature Tooling
   - Profiling tools
   - Debug tools
   - Documentation

5. Enterprise Requirements
   - Proven track record
   - Security audits
   - Long-term support

Vite yaxshiroq:
- DX (Developer Experience)
- Modern browsers
- New projects
- Small-medium apps
- Fast iteration
```

### 4. Vite HMR Webpack'dan qanday farq qiladi?

**Javob:**
```javascript
// Webpack HMR
// 1. File changes
// 2. Rebuild affected modules
// 3. Rebuild dependent modules
// 4. Send patch to browser
// 5. Apply patch
// Time: 1-5 seconds

// Vite HMR
// 1. File changes
// 2. Invalidate cache
// 3. Browser re-requests
// 4. Transform on-demand
// Time: 20-50ms

// Vite HMR API
if (import.meta.hot) {
  // Accept updates for this module
  import.meta.hot.accept((newModule) => {
    // Handle update
  });

  // Accept updates for dependencies
  import.meta.hot.accept('./dep.js', (newDep) => {
    // Handle dep update
  });

  // Cleanup
  import.meta.hot.dispose(() => {
    // Cleanup side effects
  });

  // Custom events
  import.meta.hot.on('custom-event', (data) => {
    // Handle
  });
}
```

### 5. optimizeDeps nima va qachon kerak?

**Javob:**
```javascript
// optimizeDeps - node_modules pre-bundling

// Muammo:
// node_modules - CommonJS, ESM aralash
// 1000+ fayllar
// Har request = slow

// Yechim: Pre-bundling
// 1. Scan all imports
// 2. Bundle to single ESM file
// 3. Cache in node_modules/.vite

// vite.config.js
export default {
  optimizeDeps: {
    // Force include (auto-detect o'tmasa)
    include: [
      'vue',
      'lodash-es',
      // Dynamic import'lar
      'moment/locale/ru'
    ],

    // Exclude (already ESM)
    exclude: [
      '@vueuse/core' // Pure ESM, pre-bundle kerak emas
    ],

    // Force re-bundle
    force: true, // dev: npm run dev --force

    // esbuild options
    esbuildOptions: {
      plugins: [/* custom plugins */]
    }
  }
};

// Qachon include kerak:
// 1. Auto-detect o'tmasa (error)
// 2. Dynamic import
// 3. Linked packages (npm link)
// 4. CommonJS modules
```

## Best Practices

### Vite

```javascript
// vite.config.js - Production ready
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => ({
  plugins: [vue()],

  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: mode === 'production' ? false : true,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          vendor: ['axios', 'date-fns']
        }
      }
    }
  },

  optimizeDeps: {
    include: ['vue', 'vue-router']
  },

  server: {
    hmr: {
      overlay: true
    }
  }
}));
```

### Webpack

```javascript
// webpack.config.js - Production ready
module.exports = {
  mode: 'production',

  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    minimize: true
  },

  cache: {
    type: 'filesystem'
  },

  performance: {
    hints: 'warning',
    maxAssetSize: 250000,
    maxEntrypointSize: 250000
  }
};
```

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Yangi loyihalar uchun VITE dan foydalaning:** Bugungi kunda (2024+) Vue 3 yoki React uchun yangi loyiha boshlayotgan bo'lsangiz, ikkilanmasdan Vite ni tanlang. Uning tezligi komandangizning vaqtini 10 barobarga tejaydi.
2. **Eski Webpack loyihalarni migratsiya qilmang (agar zarurat bo'lmasa):** Webpack da 3 yildan beri ishlab kelayotgan, minglab plaginlar ulangan juda katta (Legacy) loyihangiz bo'lsa, uni Vite ga ko'chirish katta azob bo'lishi mumkin. Bunday hollarda yaxshisi Webpack ni o'zini optimallashtiring.
3. **Module Federation (Micro-frontend) uchun Webpack/Rspack:** Garchand Vite qulay bo'lsa ham, murakkab micro-frontend arxitekturasida hamon Webpack 5 ning Module Federation ekotizimi barqarorroq. Ammo hozirda Rust da yozilgan Rspack ham yaxshi muqobil bo'lmoqda.

## Xulosa

Build tool tanlash bo'yicha yakuniy taqqoslash:

| Kriteriya | Vite | Webpack |
|-----------|------|---------|
| **Dasturchi tezligi (Dev Speed)** | Ajoyib (Soniyadan kam) | Yaxshi (Sekinroq) |
| **Kodni yangilash (HMR)** | Lahzada (Instant) | Tez, ammo loyiha kattalashsa qotadi |
| **Production Build** | Tez (Rollup) | Yaxshi |
| **Ekotizim** | O'sib bormoqda | Eng yetuk va katta |
| **Sozlamalar (Config)** | Oddiy, qisqa | Murakkab, uzun |
| **Legacy Brauzerlar** | Cheklangan | To'liq qo'llab-quvvatlaydi |
| **O'rganish qiyinligi** | Oson | Qiyin |

**Qachon qaysi birini tanlash kerak?**
- Yangi Vue/React loyihalar (SPA): **Vite**
- Legacy (eski) loyihalar maintenance qismi: **Webpack**
- Micro-frontends arxitekturasi: **Webpack (yoki Rspack)**
- SSR frameworklar: **Ularning o'zining ichidagi tool (masalan, Nuxt Nitro, Next.js Turbopack)**
