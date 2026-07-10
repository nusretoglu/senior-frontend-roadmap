# Vite vs Webpack

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchi har safar bitta kodni o'zgartirganda natijani ko'rish uchun 10-20 soniya kutishi asabni buzadi va unumdorlikni tushiradi. Oldinlari Webpack barcha fayllarni bitta qilib yig'gandan keyingina (Bundle) brauzerga berardi. Zamonaviy Vite esa kodni hech qanaqa yig'masdan (No-bundle), shunchaki ES Modul sifatida brauzerning o'ziga berib yuboradi. Natijada loyiha qanchalik katta bo'lmasin, kod yozilganda natija soniyaning mingdan bir ulushida (HMR) yangilanadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Restoranda ovqat tayyorlash"**  
> - **Webpack (Eski usul):** Siz 5 xil ovqat buyurdingiz. Oshpaz 5 ta ovqatning hammasini to'liq pishirib, katta laganga solib hammasini birdaniga stolingizga olib keladi. Bitta ovqat retseptini o'zgartirsangiz, hammasini boshqatdan pishiradi. (Barchasini bundle qilish).
> - **Vite (Yangi usul):** Siz menyuni ko'rib turibsiz. Siz qaysi ovqatni so'rasangiz, oshpaz faqat o'shani pishirib olib keladi (On-demand). Siz boshqasini xohlasangiz, tezda o'shani o'zini tayyorlaydi. Hamma narsani boshidan pishirib o'tirmaydi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchilar uchun "Build tool" nimaligini bilish muhim. Siz `.vue` yoki `.jsx` da yozgan kodingizni brauzer to'g'ridan-to'g'ri tushunmaydi. Unga oddiy HTML, CSS va JS kerak. Aynan shu o'girish ishini Build Tool lar (Vite yoki Webpack) qilib beradi.

### Qanday ishlaydi?

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

**Asosiy farqi:** Webpack siz dasturlayotgan paytingizda (Development mode) ham hamma kodingizni "Bundle" qiladi (Yig'adi). Bu ko'p vaqt oladi. Vite esa sizning kodingizni yig'maydi, brauzer o'ziga keraklisini o'zi so'rab oladi (Native ESM). 

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi Vite konfiguratsiyasi (`vite.config.js`) yozishni, Path Alias (Yo'l qisqartmalari) va Proxy (CORS muammolarini chetlab o'tish uchun) o'rnatishni biladi.

### Vite Konfiguratsiyasi namunasi
Vite da sozlamalar Webpack ga nisbatan juda oson:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],

  // Path aliases (../components o'rniga @components yozish uchun)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components')
    }
  },

  // Dev server
  server: {
    port: 3000,
    open: true, // Run qilganda brauzerni o'zi ochadi
    // Backend CORS muammosi bo'lmasligi uchun Proxy
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Backend manzili
        changeOrigin: true
      }
    }
  }
});
```

### Environment Variables (.env)
Middle dasturchi maxfiy kalitlarni to'g'ri ishlata olishi kerak:
- Webpack da o'zgaruvchilar: `process.env.VUE_APP_API_URL` deb yozilardi.
- Vite da esa: `import.meta.env.VITE_API_URL` tarzida o'qiladi. (E'tibor bering, Vite da o'zgaruvchi nomi albatta `VITE_` bilan boshlanishi shart).

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi Vite'ning kapoti ostida `esbuild` va `Rollup` qanday ishlashini, `optimizeDeps` nimaligini va nega Vite development'da boshqayu, production'da boshqa texnologiya ishlatishini aniq tushunadi.

### Ikki xil qit'a: Development va Production
Vite ning asosiy g'oyasi – Development paytida tezlik. Shu sabab u **esbuild** (Go tilida yozilgan o'ta tezkor kompilyator) dan foydalanadi va kutubxonalarni (node_modules) oldindan siqib qo'yadi (Pre-bundling). 
Lekin kodni jonli serverga (Production) chiqarayotganda, Native ESM yordam bermaydi (chunki HTTP so'rovlar soni 100+ taga yetib borsa sayt qotadi). Shuning uchun Vite Production build uchun **Rollup** (Mukammal Tree shaking qiluvchi bundler) dan foydalanadi. Vite – aslini olganda Esbuild va Rollup o'rtasidagi aqlli ko'prikdir.

### optimizeDeps nima?
Garchand Vite Native ESM ishlatsa ham, barcha NPM kutubxonalar ham ESM da yozilmagan (Ba'zilari eski CommonJS da). Agar siz loyihangizda `lodash` ni ulasangiz, brauzer minglab kichik fayllarni so'rashni boshlaydi. `optimizeDeps` buni oldini oladi.

```javascript
// vite.config.js
export default defineConfig({
  // Vite node_modules ni ichiga kirib quyidagilarni bitta qilib 
  // Cache'ga olib qo'yadi (esbuild yordamida)
  optimizeDeps: {
    include: ['vue', 'lodash-es', 'axios']
  }
});
```

### Intervyu Savoli
**"Nima uchun Vite Development paytida judayam tez ishlashiga qaramay, Production build uchun Rollup'dan (Bundle qilib) foydalanadi?"**
*Javob:*
Development (dasturlash) vaqtida biz Native ESM dan foydalanamiz, brauzer qaysi fayl o'zgargan bo'lsa faqat o'shani o'zini yuklab oladi (No-bundle yondashuvi). Bu HMR ni sekundning mingdan bir ulushida ishlashini ta'minlaydi. Ammo Production (Jonli server) da Native ESM dan foydalanish xato. Tasavvur qiling, Node_modules ichida 500 ta kichik fayl bor. Sahifani ochish uchun brauzer 500 ta HTTP so'rov yuborishi kerak (Waterfall muammosi). Bu o'ta sekin. Shuning uchun biz Production ga chiqqanda fayllarni 2-3 ta optimal JS fayl qilib siqishimiz (Bundle), Tree Shaking va Code Splitting qilishimiz shart. Buning uchun eng yaxshi vosita hozirda Rollup hisoblanadi. (Balki kelajakda Rolldown uning o'rnini bosar).

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Yangi loyihalar uchun VITE dan foydalaning:** Bugungi kunda (2024+) Vue 3 yoki React uchun yangi loyiha boshlayotgan bo'lsangiz, ikkilanmasdan Vite ni tanlang. Uning tezligi komandangizning vaqtini 10 barobarga tejaydi.
2. **Eski Webpack loyihalarni migratsiya qilmang (agar zarurat bo'lmasa):** Webpack da 3 yildan beri ishlab kelayotgan, minglab plaginlar ulangan juda katta (Legacy) loyihangiz bo'lsa, uni Vite ga ko'chirish katta azob bo'lishi mumkin. Bunday hollarda yaxshisi Webpack ni o'zini optimallashtiring.
3. **Module Federation (Micro-frontend) uchun Webpack/Rspack:** Garchand Vite qulay bo'lsa ham, murakkab micro-frontend arxitekturasida hamon Webpack 5 ning Module Federation ekotizimi barqarorroq. Ammo hozirda Rust da yozilgan Rspack ham yaxshi muqobil bo'lmoqda.

---

## Xulosa

Build tool tanlash bo'yicha yakuniy taqqoslash:

| Kriteriya | Vite | Webpack |
|-----------|------|---------|
| **Dasturchi tezligi (Dev Speed)** | Ajoyib (Soniyadan kam) | Yaxshi (Loyha kattalashsa qotadi) |
| **Kodni yangilash (HMR)** | Lahzada (Instant) | Sekinroq |
| **Production Build** | Tez (Rollup) | Yaxshi |
| **Ekotizim** | O'sib bormoqda | Eng yetuk va katta |
| **Sozlamalar (Config)** | Oddiy, qisqa | Murakkab, uzun |
| **Legacy Brauzerlar (IE11)** | Cheklangan | To'liq qo'llab-quvvatlaydi |

**Qachon qaysi birini tanlash kerak?**
- Yangi Vue/React loyihalar (SPA): **Vite**
- Legacy (eski) loyihalar maintenance qismi: **Webpack**
- Micro-frontends arxitekturasi: **Webpack (yoki Rspack)**
- SSR frameworklar: Ularning o'zining ichidagi maxsus texnologiyalari (masalan, Nuxt Nitro, Next.js Turbopack) ishlatiladi.
