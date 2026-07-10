# Plugins

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Nuxt.js loyihalarida butun dastur bo'ylab (Global darajada) kerak bo'ladigan kutubxonalar, komponentlar yoki sozlamalar bo'lishi mumkin. Masalan, tahliliy vosita (Google Analytics), yagona API mijozi (Axios/Fetch), yoki til tarjimoni (i18n). Bularni har bir sahifaga alohida-alohida ulab chiqish noqulay va xato qilish ehtimoli baland. **Plugins** (Plaginlar) orqali biz ularni dastur eng boshida bir martagina ulaymiz va butun dastur bo'ylab bemalol foydalanamiz.

> [!NOTE]
> **Real-hayot analogiyasi: "Yangi avtomobilga qo'shimcha uskunalar o'rnatish"**  
> Nuxt dasturingizni zavoddan endi chiqqan yangi avtomobil deb faraz qiling. U yurishga tayyor, lekin sizga GPS navigatori, avtomagnitola yoki o'rindiq isitgich kerak. Siz bu qo'shimchalarni **Plaginlar (Plugins)** orqali o'rnatasiz. Ular avtomobil harakatlanishni boshlashidan (App mounted) oldin ulanadi.

Plugin - Nuxt app yaratilganda ishga tushadigan kod bo'lib, ilovaga global imkoniyatlarni (functionality) qo'shish uchun xizmat qiladi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

### Plugin Qanday Ishlaydi?
Nuxt plaginlari `plugins/` papkasida yaratiladi va Nuxt ularni avtomatik topib, ilovaga ulab qo'yadi.

```mermaid
graph TD
    A([1. Nuxt App Yaratildi]) --> B[2. Plaginlar Ishga tushadi<br>plugins/01.auth.ts -> 02.api.ts]
    B --> C[3. App O'rnatildi<br>Vue mounted]
    C --> D[4. Marshrutlar (Routes) Aniqlanadi<br>Middleware runs]
    D --> E(((5. Sahifa Ko'rsatiladi)))
```

### Eng Sodda Plugin
```typescript
// plugins/hello.ts
export default defineNuxtPlugin((nuxtApp) => {
  // Bu kod ilova har safar yuklanganda ishga tushadi
  console.log('Hello from plugin!')
})
```

### Plugin Turlari
Nomlanishiga qarab plagin qayerda ishlashi aniqlanadi:

| Turi | Fayl Nomi Namunasi | Tushuntirish |
| --- | --- | --- |
| **Universal Plugins** | `plugins/api.ts` | Ham serverda (SSR), ham mijoz (brauzer) da ishlaydi. Odatiy tanlov. |
| **Client-Only Plugins** | `plugins/analytics.client.ts` | `.client.ts` qo'shimchasi bilan faqat brauzerda ishlaydi (M: Google Analytics, Browser API lar). |
| **Server-Only Plugins** | `plugins/serverInit.server.ts` | `.server.ts` qo'shimchasi bilan faqat serverda ishlaydi. |
| **Tartiblangan Plugins** | `plugins/01.auth.ts` | Agar plaginlar bir-biriga bog'liq bo'lsa (Auth API dan oldin ishlashi kerak), fayl raqam bilan boshlanadi. |

---

## 🟡 Middle (Amaliyot va Detallar)

### Provide / Inject Pattern (Global o'zgaruvchilar yaratish)
Nuxt da plagin orqali ilovaning istalgan joyidan (sahifa yoki komponentlardan) kirish mumkin bo'lgan maxsus "helper" funksiyalar yoki o'zgaruvchilarni yaratish (`provide`) mumkin. Odatda bunday funksiyalar oldiga `$` belgisi qo'yiladi.

```typescript
// plugins/toast.client.ts
export default defineNuxtPlugin(() => {
  return {
    provide: {
      toast: (xabar) => {
        alert(xabar); // Eng oddiy misol
      }
    }
  }
})
```

Endi komponent ichida undan qanday foydalanamiz?
```vue
<!-- components/Login.vue -->
<script setup>
const { $toast } = useNuxtApp() // Provide qilingan narsani olish

const doLogin = () => {
  $toast("Tizimga kirdingiz!") // Istalgan joyda ishlaydi
}
</script>
```

### Vue Plaginlarini O'rnatish (masalan Vuetify)
Agar Vue jamoasi yaratgan tayyor UI kutubxonalarni (Vuetify, Element Plus) o'rnatmoqchi bo'lsak, `nuxtApp.vueApp.use()` funksiyasidan foydalanamiz.

```typescript
// plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components
  })

  // Vue app instance'ga plaginni ulash
  nuxtApp.vueApp.use(vuetify)
})
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### Asinxron Plaginlar va Performance (Tezlik)
Agar sizning plaginigiz ichida `await` bor bo'lsa, u Asinxron Plagin hisoblanadi. Asinxron plaginlar xavfli bo'lishi mumkin, chunki **ular to'liq ishlab tugamagunicha Nuxt ilovani render qilishni kutib turadi**.
Buning oqibatida oq ekran (White screen) holati kuzatiladi.

```typescript
// YOMON PATTERN: API dan javob kelishini kutish dasturni sekinlashtiradi
export default defineNuxtPlugin(async () => {
  const data = await fetch('https://uzoq-server.com/sekin-api') // KUTIB TURADI!
  return { provide: { xabarlar: data } }
})
```

Agar API juda muhim bo'lmasa, uni background da ishlashi uchun `await` ni olib tashlash yoki Lifecycle Hook'lardan foydalanish kerak.

### Nuxt App Hooks (Hayot tsikliga aralashish)
Nuxt sizga ilova hayotining eng muhim nuqtalarida o'z kodingizni ishga tushirish imkonini beradi. Bu monitoring vositalari (masalan Sentry) uchun juda muhim.

```typescript
// plugins/monitoring.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  // Vue xatoliklarni ushlash
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    Sentry.captureException(error)
  }

  // Nuxt marshrutlar orasida o'tishni boshlaganda
  nuxtApp.hook('page:start', () => {
    console.log('Yangi sahifaga o'tilmoqda...')
  })

  // Marshrut o'tib bo'linganda
  nuxtApp.hook('page:finish', () => {
    console.log('Sahifa to'liq ochildi!')
  })
})
```

### Intervyu Savollari (Qiyin daraja)
**1. `plugin` va `composable` o'rtasida qanday farq bor? Ularni qachon ishlatish kerak?**
*Javob:* Plugin - bu App-level (ilova darajasidagi) kod bo'lib, loyiha yuklanishidan oldin bir marta ishga tushadi (Third-party library larni ulash, global interceptor lar o'rnatish). Composable esa Component-level (Lokal) kod bo'lib, kerak bo'lganda eksport qilib olinadigan toza funksiyadir.

**2. Agar sizda brauzerning `window` obyektiga bog'langan plagin bo'lsa uni qanday ro'yxatga olasiz?**
*Javob:* Ikkita yo'li bor. Yoki fayl nomini `.client.ts` qilib yozaman (masalan: `analytics.client.ts`), o'shanda Nuxt uni faqat brauzerda yuklaydi. Yoki plugin ichida mantiqni `if (process.client)` sharti bilan o'rab qo'yaman.

**3. Plaginlarning ishlash ketma-ketligi (Ordering) qanday belgilanadi? Nega bu muhim?**
*Javob:* Nuxt plaginlarni alifbo tartibida o'qib ishga tushiradi. Lekin ba'zida bitta plagin boshqasiga bog'liq bo'lishi mumkin (masalan API cliyent auth tokenga muhtoj bo'lishi mumkin). Bunday paytda fayl nomi oldiga raqam qo'yaman: `01.auth.ts` va `02.api.ts`. Nuxt avval raqamli plaginlarni o'qib tugatadi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Client / Server ga e'tibor bering:** Agar plagin ichida brauzer xossalaridan (`window`, `document`) foydalanmoqchi bo'lsangiz, fayl nomini albatta `.client.ts` deb yozing yoki ichkarida `import.meta.client` bilan tekshiring. Bo'lmasa server xatosi (500) yuzaga keladi.
2. **Kechiktirib yuklash (Defer):** Dasturning eng asosiy ishlashiga daxldor bo'lmagan plaginlarni (masalan tahliliy skriptlarni) iloji boricha kechiktirib (timeout yoki scroll bo'lganda) ishga tushiring. Bu saytning First Contentful Paint (FCP) ko'rsatkichini yaxshilaydi.
3. **Plaginlar Composable emas:** Komponent darajasidagi (lokal) ishlarni yoki qayta-qayta ishlatiluvchi mantiqni plagin emas, Composable (`composables/`) shaklida ishlating. Plagin asosan 3-tomon integratsiyalari va global sozlamalar (Vue.use() kabi) uchun mos keladi.

---

## Xulosa

| Yondashuv / Tushuncha | Ma'nosi | Asosiy Vazifasi |
|-----------------------|---------|-----------------|
| **`.client.ts`** | Faqat Brauzer uchun | Tahlil skriptlari, LocalStorage, Custom UI Kutubxonalarini ulash |
| **`.server.ts`** | Faqat Server uchun | Ma'lumotlar bazasi, Auth logikalari, Maxfiy tokenlar uchun |
| **`provide (injection)`**| O'zgaruvchini Global qilish | `$api`, `$toast` kabi global yordamchi funksiyalar yaratish |
| **`01.plugin.ts`** | Plagin ishlash ketma-ketligi | Oldin ishlashi shart bo'lgan fayllarni tartibga solish |

Plaginlarni Vue.js da dastlabki ko'rinish beradigan "Ustalar" deb tushunish mumkin. To'g'ri ulangan plaginlar kod hajmini keskin kamaytiradi, lekin keragidan ortiq plaginlar saytning boshlang'ich yuklanish (FCP) tezligiga salbiy ta'sir ko'rsatadi.
