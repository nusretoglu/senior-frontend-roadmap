# Modules

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Plaginlar (Plugins) faqat mijozning brauzeriga yetib borganidan keyingina ishlay boshlaydi (Runtime). Ammo siz shunday bir kutubxona yasamoqchisizki, u kodlaringizni qurish jarayonida (Build time) fayllarni yaratib berishi, Vue komponentlarini avto-import qilib qo'yishi, yoki Nuxt ni qanday ishlashini o'zgartirishi kerak. Bunga Plaginlar orqali erishib bo'lmaydi. **Modules (Modullar)** shu maqsadda — Nuxt'ning qurish (build) jarayoniga aralashish va uni kengaytirish uchun ishlatiladi. Masalan: `@nuxtjs/tailwindcss`, `@nuxtjs/i18n`, `@pinia/nuxt` kabilarning hammasi Modullardir.

> [!NOTE]
> **Real-hayot analogiyasi: "Zavod va Aksessuar"**  
> - **Plaginlar (Aksessuar):** Mashina yig'ilib bo'ldi, endi uni ichiga gul va xushbo'y hid beruvchi sprey sepib qo'ydingiz (Mashina ishlashiga tayyor bo'lganidan keyingi qadam - Runtime).
> - **Modullar (Zavod):** Mashina yig'ilayotgan konveyer liniyasiga aralashib, zavod stanoklarini o'zgartirib, mashina dvigatelini kuchaytirish jarayoni (Build time).

---

## 🟢 Junior (Asoslar va Tushunchalar)

### Module nima o'zi?
Module - Nuxt ilovasi qurilayotgan (build bo'layotgan) vaqtda ishga tushadigan kod blokidir. Ular Nuxt imkoniyatlarini yanada kengaytirish (masalan Tailwind o'rnatish) uchun tayyor pakejlar ko'rinishida keladi.

### Module vs Plugin farqi

| Xususiyat | Module (Modul) | Plugin (Plagin) |
| --- | --- | --- |
| **Qachon ishlaydi?** | Build time (npm run dev/build paytida) | Runtime (Browser/Serverda dastur ishga tushganda) |
| **Nima qila oladi?** | Nuxt configuration'ni kengaytiradi, avto-importlar qo'shadi, papkalar yaratadi | Vue app instance'ga globallar qo'shadi (Provide/Inject) |
| **Qayerda ro'yxatdan o'tadi?**| `nuxt.config.ts` ning `modules: []` qismida | `plugins/` papkasiga tashlab qo'yilsa o'zi topiladi |

### Ommabop Modullarni o'rnatish
Tayyor modullarni `nuxt.config.ts` faylida chaqirib qoyamiz:
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss', // CSS freymvork uchun
    '@pinia/nuxt',         // State management uchun
    '@nuxt/image'          // Rasmlarni optimizatsiya qilish uchun
  ],

  // Har bir modul o'ziga xos konfiguratsiya kutishi mumkin
  image: {
    domains: ['example.com']
  }
})
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Mahalliy Modul Yaratish (Local Module)
Siz har doim ham NPM dan tayyor modulni tortib olmaysiz. Loyihangiz ichida faqat sizga kerak bo'lgan, qurish jarayonini (Build) o'zgartiradigan mantiqni Mahalliy Modul sifatida yozishingiz mumkin.

Nuxt 3 da `@nuxt/kit` kutubxonasi modul yozish uchun maxsus asboblarni beradi.
`modules/hello/index.ts` degan fayl ochamiz:

```typescript
// modules/hello/index.ts
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  // Modul haqida ma'lumot
  meta: {
    name: 'hello-module',
    configKey: 'hello' // nuxt.config da shunday nom ostida kutamiz
  },

  // Modul ishga tushganda shu funksiya ishlaydi
  setup(options, nuxt) {
    console.log("Nuxt build bo'lyapti... Mening birinchi modulin ishga tushdi!")
  }
})
```

Uni ishlatish:
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Fayl manzilini yozib qoyamiz
  modules: [
    './modules/hello/index'
  ]
})
```

### Auto-Import qo'shish (Nuxt Kit)
Modulning eng zo'r tarafi siz qandaydir tayyor mantiqni olib, uni Nuxt global qilib (import qilish shart emas qilib) qo'shib bera olasiz.

```typescript
// modules/my-composable/index.ts
import { defineNuxtModule, addImports, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  setup() {
    const resolver = createResolver(import.meta.url)

    // O'zimizni yasagan maxsus useFormat funksiyasini auto-import ro'yxatiga qo'shamiz
    addImports({
      name: 'useFormat', 
      from: resolver.resolve('./runtime/format') // Fayl joylashuvi
    })
  }
})
```
Shu modul ulangandan so'ng, istalgan Vue komponentida `import { useFormat } from '...'` qilib yozish shart bo'lmay qoladi.

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### Nuxt Lifecycle Hooks (Modul orqali)
Modullar qurish jarayoniga (Build) aralasha olishining sababi shundaki ular Nuxt ning o'zida bo'layotgan voqealarni (Hooks) eshitib tura oladi.

```typescript
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup(options, nuxt) {
    
    // Nuxt pagedan route larni generatsiya qilib bo'lganda
    nuxt.hook('pages:extend', (pages) => {
      // Biz ham bitta qo'shimcha sahifa qo'shib yuboramiz!
      pages.push({
        name: 'yashirin-sahifa',
        path: '/hidden',
        file: '~/components/Secret.vue' // Faqat komponent bor edi xolos, endi unga url ulandi!
      })
    })

    // Vite yoki Webpack kompilatsiyani boshlashidan avval
    nuxt.hook('build:before', () => {
      console.log('Builddan oldingi qandaydir tozalash ishlari...')
    })

  }
})
```

### Modullar ichidan Plugin qo'shish
Eng zo'r kutubxonalar ham modul, ham plagin sifatida keladi. O'rnatilish jarayonini (Build) Modul hal qiladi, ishga tushgandagi (Runtime) holatini esa Plagin.
Modulning o'zidan turib avtomatik Plagin qo'shib yuborish mumkin:

```typescript
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Ushbu modul ulanishi bilanoq, uning ichidagi plugin ham Nuxt ga ulansin!
    addPlugin({
      src: resolver.resolve('./runtime/my-plugin'),
      mode: 'client' // Faqat client da ishlashini aytyapmiz
    })
  }
})
```
Bu qadam `@nuxtjs/i18n` kabi murakkab paketlarda keng qo'llaniladi. Modul `nuxt.config.ts` dan foydalanuvchi sozlamalarini (Tillar ro'yxati) o'qiydi va shular asosida yasalgan Plaginni Nuxt appga taqdim etadi.

### Intervyu Savollari (Qiyin daraja)
**1. Nuxt module nima va uning plugindan printsipial farqi nimada?**
*Javob:* Module bu Build Time da (Loyiha Node js da qurilayotgan vaqt) ishlaydigan kod bo'lib u ilovaning konfigatsiyasini (Vite sozlamalari, auto importlar) manipulyatsiya qila oladi. Plugin esa Runtime da (Qurilib bo'lgan tayyor dastur brauzer/serverda ishlab turgan vaqtda) ishlaydigan kod bo'lib, Vue ilovasini o'zini kengaytiradi xolos.

**2. `@nuxt/kit` ni qanday vazifasi bor? Nega tayyor Node.js ning FS modulidan emas, shundan foydalanishni maslahat berishadi?**
*Javob:* `@nuxt/kit` bu Nuxt ekotizimi uchun standartlashtirilgan asboblar to'plami. Modul yozayotganda `addPlugin`, `addComponent`, `addImports` kabi funksiyalar orqali ishonchli (Xatolarsiz va har xil Nuxt versiyalari bilan ishlay oladigan) modul yozish imkonini beradi. U yozilgan modulning ham Nuxt 2, ham Nuxt 3 bilan (Bridge orqali) ishlay olish darajasini ham nazorat qila oladi.

**3. Module yozayotganda Runtime va Build Time kodlarini nima uchun bir faylda yozish qat'iyan man etiladi?**
*Javob:* Agar siz modulning asosiy `index.ts` faylida ham Nuxt konfiguratsiyasi, ham qandaydir UI komponent kodlarini (`document.getElementById` kabi) ishlatsangiz xatolik yuzaga keladi. Sababi Modul build qilinayotganda brauzer ob'ektlari (window, document) umuman mavjud bo'lmaydi. Shuning uchun Component yoki Composable kabi runtime kodlarni alohida `runtime/` jildiga qo'yib uni modul orqali yo'naltirib (Resolve) ulash standart hisoblanadi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **`@nuxt/kit` dan to'liq foydalaning:** Modul yozayotganda standart Node.js asboblaridan ko'ra, har doim Nuxt jamoasi yaratgan `@nuxt/kit` ni ishlating (masalan fayl yaratish, plagin qo'shish kabi ishlar uchun u xavfsiz va kafolatlangan usul).
2. **Kodni ikkiga ajrating:** Modul kodi faqat build time da ishlashi kerak. Agar modul dastur runtime da nimanidir ko'rsatishi (masalan, Component) kutilsa, uni runtime jildiga olib, `addPlugin` yoki `addComponent` orqali moduldan turib chaqirib qo'ying. Hech qachon brauzer kodini modulni asosiy qismida yozmang.
3. **Konfliktlardan himoyalaning:** Modulingiz konfiguratsiya opsiyalarini va qo'shilgan plaginlar nomini takrorlanmas qiling. Boshqa uchinchi tomon modullari bilan to'qnash kelib qolmasligi uchun modul ismingizni prevfiks (prefix) sifatida qo'shing.

---

## Xulosa

| Tushuncha | Modul (Module) | Plagin (Plugin) |
|-----------|----------------|-----------------|
| **Qachon ishlashi?** | Build vaqtida (npm run dev/build) | Dastur ishlash vaqtida (Runtime) |
| **Qanday yoziladi?** | `defineNuxtModule()` orqali | `defineNuxtPlugin()` orqali |
| **Asosiy maqsadi** | Nuxt imkoniyatlarini kengaytirish (Avto-importlar, Papkalar avtomatizatsiyasi) | Tayyor loyihaga Global holatlar qo'shish |
| **Misol** | `@nuxtjs/tailwindcss`, `@pinia/nuxt` | `Google Analytics`, `v-tooltip` direktivasi |

Module vs Plugin farqini tushunish o'ta muhim. Modullar Nuxt loyihasining yuragiga o'zgartirish kiritib, Dasturchining ishlash tezligini (Developer Experience) oshirishga yordam beradi. Oddiy mantiq yoki kichik API integratsiyalari uchun plagin yetarli, lekin Vue/Nuxt tizimini avtomatlashtirish kerak bo'lsa - Modul yoziladi.
