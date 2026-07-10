# Deployment

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dastur tuzib bo'lingach, uni faqat o'zingizning kompyuteringizda emas, butun dunyo ko'rishi uchun internetga joylashingiz kerak (Deployment). An'anaviy Vue dasturlarini odatda faqat bitta usulda — Statik fayllar (`index.html`, `js`, `css`) sifatida hostingga joylash mumkin. Ammo Nuxt sizga tanlov erkinligini beradi: uni an'anaviy statik hostda, haqiqiy Node.js serverida, Serverless (Vercel kabi) platformalarda yoki hatto Edge (Cloudflare kabi) tarmoqlarida ham yurgiza olasiz. Bu Nuxt ichidagi **Nitro** server motori sharofatidir.

> [!NOTE]
> **Real-hayot analogiyasi: "Restoran Ochish"**  
> - **Static Hosting (SSG):** Ovqatlarni oldindan pishirib qo'yib (generate), faqat tarqatib beradigan kiosk. (Juda tez, arzon, lekin menyu o'zgarsa qayta pishirish kerak).
> - **Node.js Server (SSR):** Haqiqiy oshpaz (Server) buyurtma tushganda joyida pishirib beradi (Har doim issiq va yangi, lekin oshpaz ushlab turish qimmat va sekinroq).
> - **Serverless:** Oshpazingiz faqat buyurtma tushgandagina ishga keladi va pishirib bo'lib yana g'oyib bo'ladi. (Tezkor va tejamkor).

---

## 🟢 Junior (Asoslar va Tushunchalar)

### Deployment Turlari
Nuxt loyihasini asosan ikki xil yo'l bilan "qurish" (build) mumkin. Bunga qarab loyiha turli joylarga yuklanadi:

| Qurish (Build) Buyrug'i | Natijasi | Qayerga yuklanadi? | Farqi nimada? |
| --- | --- | --- | --- |
| `npm run generate` | `.output/public` papkasi ichida faqat HTML, CSS, JS fayllar hosil bo'ladi. | Netlify, GitHub Pages, Oddiy Cpanel hosting (Statik) | Sayt nihoyatda tez ishlaydi, bepul hostingga qo'ysa bo'ladi. Ammo har o'zgarishda qayta qurish kerak. |
| `npm run build` | `.output/server` papkasi ichida Node.js dasturi hosil bo'ladi. | Vercel, Digital Ocean, AWS (Server bor joyga) | Sayt ma'lumoti real vaqtda yangilanib turadi. SEO uchun eng zo'r. Ammo pullik server talab qilinadi. |

### Vercel ga joylash (Eng oson yo'li)
Nuxt ni Vercel kabi zamonaviy (Serverless) platformaga yuklash nihoyatda oson:
1. GitHub ga kodingizni yuklaysiz.
2. Vercel saytiga kirib "New Project" deysiz va o'sha repozitoriyni tanlaysiz.
3. Vercel sizni Nuxt ishlatayotganingizni o'zi bilib olib, hammasini o'zi to'g'rilaydi. "Deploy" tugmasini bosish kifoya!

```mermaid
graph LR
    A[Sizning kodingiz] -->|git push| B[GitHub]
    B -->|Avtomatik| C[Vercel Serverless]
    C --> D(((Foydalanuvchi)))
```

---

## 🟡 Middle (Amaliyot va Detallar)

### Atrof-muhit o'zgaruvchilari (Environment Variables)
Loyihada hech qachon maxfiy parollar (Backend API kalitlari, Bazaga ulanish kodi) ni ochiq yozib qoldirmang! Nuxt `.env` fayllari bilan ishlashni juda osonlashtirgan.

```bash
# .env fayl (Buni aslo Git ga qo'shmang - .gitignore da bo'lsin)
API_SECRET=maxfiy_parol_123
NUXT_PUBLIC_API_BASE=https://mening-backendim.uz/api
```

E'tibor bering, `NUXT_PUBLIC_` bilan boshlangan o'zgaruvchilar brauzerga (klientga) ham yetib boradi. Ularni bemalol Fetch uchun ishlatsa bo'ladi. Ammo oddiy yozilgan (masalan `API_SECRET`) o'zgaruvchilar FAQAT server ichidagina qoladi (xavfsiz).

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    apiSecret: '', // .env dagi API_SECRET ni avtomatik shu yerga oladi
    public: {
      apiBase: '' // .env dagi NUXT_PUBLIC_API_BASE ni avtomatik oladi
    }
  }
})
```

Uni sahifada o'qib olish:
```vue
<script setup>
const config = useRuntimeConfig()

console.log(config.public.apiBase) // 'https://mening-backendim.uz/api'
console.log(config.apiSecret) // Brauzerda ishlatilsa UNDEFINED chiqadi! Xavfsiz!
</script>
```

### An'anaviy Serverga (VPS/Ubuntu) o'rnatish
Agar kodingizni maxsus server (masalan, Digital Ocean Droplet) ga yuklamoqchi bo'lsangiz `pm2` kabi process manager kerak bo'ladi. Chunki terminalni yopsangiz ham dastur ishlashda davom etishi zarur.

```bash
npm run build
pm2 start .output/server/index.mjs --name mening-nuxt-saytim
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### Nitro Presets (Arxitekturani tanlash)
Nuxt orqa fonda Node.js uchun mo'ljallangan **Nitro** dvigatelidan foydalanadi. Nitro ning o'ziga xosligi shundaki, u bitta yozilgan kodni turli xil platformalarga (AWS Lambda, Cloudflare Workers, Node.js) moslab "tarjima" qilib (Build qilib) bera oladi. Bu xususiyat **Presets** deb ataladi.

Nuxt ko'pincha siz qaysi platformadan foydalanayotganingizni o'zi topib oladi (Masalan Vercel da ishlasa Vercel Preset). Ammo uni o'zingiz majburlab belgilashingiz ham mumkin:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare-pages' // Yoki 'node-server', 'netlify', 'aws-lambda'
  }
})
```

### ISR (Incremental Static Regeneration) - Tejamkorlik va Tezlik gibridi
Saytingizda 1 millionta tovar bor deylik. Hammasini `generate` qilib (SSG) statik html chiqarishga soatlar ketadi. Lekin har safar foydalanuvchi kirganda SSR qilib render qilsangiz, serveriz "qulab tushishi" mumkin. Shu yerda **ISR** ishlatiladi! U ma'lumotni keshlaydi (SSG kabi) va aytilgan vaqtda fonda bildirmay yangilab oladi (SSR kabi).

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // /mahsulotlar sahifasi har 1 soatda (3600 sek) fonda yangilanadi
    '/mahsulotlar/**': { isr: 3600 },
    
    // /admin qismi har doim (SSR) yangi render bo'lishi shart
    '/admin/**': { ssr: true },
    
    // /haqimizda sahifasi bir marta (SSG) qilinadi, o'zgarmaydi
    '/haqimizda': { prerender: true }
  }
})
```
Bu sayt tezligini nihoyatda oshirib yuboradi! Ammo bu funksionallik (hozircha) asosan Vercel, Netlify kabi serverless platformalardagina yaxshi ishlaydi.

### Intervyu Savollari (Qiyin daraja)
**1. Nuxt dasturini `build` qilganda `node_modules` papkasini serverga tashlash kerakmi? Nega?**
*Javob:* Yo'q, kerak emas. Nuxt o'zidagi Nitro yordamida barcha kerakli qaramliklarni (dependencies) bitta yengil `.output` papkasi ichiga jamlab beradi (Standalone build). Serverga faqat ushbu `.output` papkasi yuklansa va ishga tushirilsa bo'ldi, `npm install` qilish shart emas.

**2. Ilovada ham `.env` dan kelgan, ham `nuxt.config.ts` ning `runtimeConfig` ida ko'rsatilgan bir xil parametr (masalan, Base URL) bo'lsa, ishlab turgan holatida qay birining ustunligi baland bo'ladi?**
*Javob:* `.env` faylidagi qiymat har doim (Runtime paytida ham) ustun hisoblanadi. Bu degani siz loyihani qurib bo'lgach (build), production serverida ham `.env` fayli orqali parametrni (API manzilni) qayta qurishsiz o'zgartira olasiz. Ular Environment Variable lar bilan osongina almashtiriladi (Overwrite).

**3. PM2 orqali Nuxt ilovalarida Cluster Mode dan foydalanishning foyda va zararlari nimada?**
*Javob:* Cluster mode (masalan `pm2 start ... -i max`) serverdagi barcha protsessor yadro (CPU Core) larini ishga solib yuklamani taqsimlaydi va loyiha buzilsa (crash) avtomatik qayta tiklaydi. Ammo eng katta zarar - xotira muammosi. Agar bitta ilova ichida (masalan server API larida) qandaydir fayllarga ma'lumot yozsangiz (sessions) u faqat o'sha klastergagina tegishli bo'lib qoladi. Klasterlar o'rtasida Redis kabi tashqi xotira bazasi orqali bog'lanish qurishga to'g'ri keladi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Atrof-muhit o'zgaruvchilari (Env Variables):** Hech qachon API kalitlarni kod ichida saqlamang. `.env` fayl ishlating va hosting platformangizda (Vercel/Netlify) Env variables bo'limiga kiriting. `runtimeConfig` ularni Nuxt dasturiga xavfsiz bog'lashga yordam beradi.
2. **SSG yoki SSR ni to'g'ri tanlash:** Agar saytingiz asosan blog, portfel yoki landing page bo'lsa `generate` (SSG) ishlating. Bu arzon va eng tezkor usul. Ammo har daqiqada yangilanuvchi e-commerce platformasi bo'lsa `build` (SSR) yondashuvi to'g'ri bo'ladi.
3. **Avtomatlashtirish (CI/CD):** Har doim GitHub/GitLab ga kod push qilinganida avtomatik deploy bo'ladigan qilib sozlang. O'z kompyuteringizdan FTP yordamida qo'lda fayl yuklamang. Bu xatolar xavfini nolga tushiradi.

---

## Xulosa

| Joylash Turi (Hosting) | Platformalar | Qachon tanlanadi? | Qanday o'rnatiladi? |
|------------------------|--------------|-------------------|---------------------|
| **Statik Hosting (SSG)**| Vercel, Netlify, GH Pages | Tez-tez o'zgarmaydigan saytlar (Landing page, Blog) | `npm run generate` qilib `.output/public` ga joylash |
| **Server (SSR)** | DigitalOcean, AWS, VPS | Foydalanuvchiga mos o'zgaruvchi saytlar (E-commerce) | `npm run build` so'ngra Node.js da ishga tushirish |
| **Serverless/Edge** | Vercel Edge, Cloudflare | Juda tez va server boshqaruvisiz joylash | Platforma bilan to'g'ridan-to'g'ri bog'lanish |

Dasturni qurish qanchalik muhim bo'lsa, uni to'g'ri joylashtirish (Deployment) ham shunchalik muhim. Platformani loyiha ehtiyoji (tezlik, xavfsizlik, xarajat) ga qarab to'g'ri tanlang va `.env` sirlaringizni GitHub da saqlashdan saqlaning.
