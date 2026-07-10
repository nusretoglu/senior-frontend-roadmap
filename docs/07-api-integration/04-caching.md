# Caching (Kesh xotira)

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Foydalanuvchi bir xil ma'lumotni ko'rish uchun har safar serverga so'rov yuborishi va kutishi kerak emas. Kesh xotiradan foydalanish (Caching) orqali biz dastur tezligini 10 barobargacha oshiramiz, server xarajatlarini kamaytiramiz va foydalanuvchiga muammosiz UX taqdim etamiz. Lekin, "eski" (stale) ma'lumotni ko'rsatib qo'ymaslik juda nozik masala bo'lib, uning yechimi sizning darajangizni belgilaydi.

> [!NOTE]
> **Real-hayot analogiyasi: "Oziq-ovqat do'koni va Muzlatgich"**  
> **Keshsiz holat:** Har safar suvsaganingizda uyga qarab yugurib borib emas, to'g'ri supermarketga (Server) borib bitta suv sotib olib kelasiz. Sekin va charchatadigan jarayon.  
> **Kesh bilan holat:** Supermarketdan bir quti suv olib kelib muzlatgichingizga (Cache) qo'yib qo'yasiz. Suvsaganda, shunchaki muzlatgichni ochib olasiz (Juda tez). Lekin ma'lum vaqtdan so'ng suvning muddati o'tsa (Cache expiry), siz muzlatgichdagi eski suvni to'kib tashlab, yana yangisini olib kelishingiz (Cache invalidation) kerak bo'ladi.

Caching - tez-tez ishlatiladigan ma'lumotni vaqtinchalik xotirada saqlash texnikasi hisoblanadi.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchilar uchun Cache asosan HTTP bosqichida qanday bo'lishini tushunishdir.

### HTTP Caching (Brauzer keshi)
Hech e'tibor berganmisiz, sahifa birinchi marta 3 soniyada ochiladi, keyingi marta esa 0.5 soniyada. Nega? Chunki brauzer rasm, CSS, va JavaScript fayllarini o'zining "Muzlatgichi" (Disk Cache) ga solib qo'yadi.

Buni kim boshqaradi? **Backend (Server)**. 
Server faylni yuborayotganda `Cache-Control` sarlavhasini (header) qo'shib yuboradi:
- `Cache-Control: max-age=3600` (Bu ma'lumot 1 soat davomida eskimaydi, shu vaqtgacha mendan so'rab o'tirma, keshdan ishlataver).
- `Cache-Control: no-store` (Bu ma'lumot maxfiy, masalan bank balansi. Uni umuman keshlamang!).

```javascript
// Fetch API orqali brauzer keshini boshqarish
async function getData() {
  const response = await fetch('/api/data', {
    cache: 'no-cache' // Brauzerga keshni pisand qilmay, serverdan yangisini olishni buyurish
  });
}
```

---

## 🟡 Middle (Amaliyot va Detallar)

Dastur (SPA) ichidagi API so'rovlarni optimizatsiya qilish Middle darajasining ishidir.

### SWR (Stale-While-Revalidate) Pattern
Tasavvur qiling, siz Instagramni ochdingiz. Eski postlar srazu (keshdan) ko'rinadi va siz skroll qilishni boshlaysiz. U esa orqa fonda jimgina yangi postlarni yuklaydi va tayyor bo'lgach ular sizga ko'rinadi. Bu SWR (Eskisini ko'rsat, orqa fonda yangila) texnikasi.

Agar biz Vue (yoki React) ishlatsak, buning uchun eng zo'r yechim — **TanStack Query (Vue Query/React Query)** dir.

```javascript
import { useQuery } from '@tanstack/vue-query';
import { ref } from 'vue';

// TanStack Query avtomat keshlaydi
export function useUser(userId) {
  return useQuery({
    queryKey: ['user', userId.value], // Cache nomi (ID bilan)
    queryFn: () => fetch(`/api/users/${userId.value}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 daqiqagacha kesh "yangidek" qabul qilinadi
  });
}
```
**Afzalligi:** Agar siz bir sahifadan ikkinchisiga o'tib yana qaytib kelsangiz, `Loading...` spinerni umuman ko'rmaysiz. O'sha zaxoti keshdagi eski data ko'rsatiladi va bildirmay yangilanadi.

### Invalidation (Keshni tozalash)
Foydalanuvchi ismini o'zgartirdi va Saqlash (Save) tugmasini bosdi. Backend da ism o'zgardi. Lekin u profilingizga qaytsa, **Keshlangan Eski ism** ko'rinib qoladi! 
Buning yechimi — Keshni invalidatsiya qilish (Yaroqsiz deb e'lon qilish):

```javascript
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const queryClient = useQueryClient();

const updateMutation = useMutation({
  mutationFn: (newName) => updateNameOnServer(newName),
  onSuccess: () => {
    // Backend ga yozilgach, aynan shu userning keshini "yaroqsiz" deymiz
    // QueryClient orqa fonda avtomat yangisini tortib keladi
    queryClient.invalidateQueries({ queryKey: ['user', 123] });
  }
});
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior darajasida siz arxitektura tanlovlari va kesh barqarorligi (Consistency) haqida bosh qotirasiz.

### Offline-First Architecture va Service Workers
Foydalanuvchida internet uzilib qoldi. Uni `Dinazavr` yoki "No connection" degan oq ekran kutib olishi — Seniorlikka xos emas.

Internet yo'q paytda biz **Service Worker** va **IndexedDB** ishlata olamiz.
- **Service Worker** — brauzer orqasida ishlaydigan mitti proksi-server. Frontend va API o'rtasiga turib oladi.
- Agar internet o'chsa ham ishlayverishi uchun (Offline support) Requestlar avval Cache Storage / IndexedDB da saqlanadi. Internet qaytgan zaxoti u barcha yig'ilib qolgan o'zgarishlarni Serverga sinxronizatsiya qiladi.

### Optimistic Updates (Optimistik Yangilash)
Siz ijtimoiy tarmoqda "Like" tugmasini bosdingiz. Qizarishini 1 soniya (server javob berguncha) kutasizmi? Yo'q, u bosganingiz zaxotiyoq qizaradi. 
Siz aslida hali serverga yozilmasidan oldin Cache ni **optimistik tarzda (Yaxshi niyat qilib)** qo'lda o'zgartirib qo'yasiz.
Agar serverdan Error (xatolik) kelsa, keshni yana orqaga (Rollback) qaytarib qo'yasiz.

### Intervyu Savoli
**"Bir xil datani ko'rsatuvchi 3 xil Tab (oyna) ochiq. Bitta Tab da narx o'zgardi va u yerdagi kesh yangilandi. Qolgan 2 ta Tab dagi kesh qanday qilib darhol o'zgaradi?"**
*Javob:*
Bu erda `BroadcastChannel` API dan foydalanamiz (yoki LocalStorage event handler). Bitta tab o'zgarish sezganida `channel.postMessage({ type: 'invalidate', key: 'product-price' })` jo'natadi. Qolgan ochiq otablar buni eshitadi va o'zining ichki keshlarini (React Query da) qayta invalidate (tozalash) qilib yuboradi. Natijada boshqa tablar ham bir vaqtning o'zida serverdan yangi narxni oladi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **GET so'rovlarini keshlang**: Faqat o'qish (GET) operatsiyalarini keshga oling. Hech qachon POST, PUT, DELETE operatsiyalari javoblarini keshlashga urinmang.
2. **SWR (Stale-While-Revalidate) patternini ishlating**: Iloji boricha SWR'dan (VueUse'dagi `useFetch` yoki `@tanstack/vue-query`) foydalaning. Bu UX uchun eng ideal variant — foydalanuvchiga eski ma'lumotni darhol ko'rsatib, orqa fonda jimgina uni yangilab qo'yadi.
3. **Invalidation (Tozalash) muhim**: Agar ma'lumot qayerdadir o'zgargan bo'lsa (masalan foydalanuvchi ismini tahrirladi), butun foydalanuvchi profili keshini darhol tozalashingiz (`invalidateQueries`) shart, aks holda tahrirlangan profil sahifada eski ism bilan ko'rinib qoladi.
4. **ETag'dan foydalaning**: Katta o'lchamdagi fayllar yoki ma'lumotlar ro'yxatini yuklashda ETag'larni (If-None-Match) server sozlamalarida yoqtirib qo'ying (304 Not Modified statusida javob qaytishi tekinga server resursini tejaydi).

---

## Xulosa

| Kesh Turi | Qayerda saqlanadi? | Afzalligi |
|-----------|--------------------|-----------|
| **Brauzer Keshi (HTTP)** | Brauzerning Diskida | Dasturchidan qo'shimcha kod talab qilinmaydi (Server hal qiladi) |
| **In-Memory (JS)** | RAM da (TanStack Query) | Eng tez ishlaydi, UI da Reactivity ga bog'langan |
| **LocalStorage** | Brauzer Local xotirasi | Sahifa yangilansa ham ma'lumotlar o'chib ketmaydi |
| **Service Worker** | Brauzer fonida | Dasturni internet tarmog'isiz (Offline) ham ishlatish mumkin |

Caching - performance va UX (Foydalanuvchi tajribasi) uchun hayotiy zarur ko'nikma, biroq noto'g'ri qo'llanilishi "Men o'zgartirdim, lekin brauzerda eski ma'lumot turibdi" kabi bosh og'riqlarga olib keladi. Bunga Invalidation (Keshlashni yaroqsizlantirish) yechim.

**Keyingi qadam:** [05-retries-interceptors.md](./05-retries-interceptors.md) - network xatolarini ushlash va qayta so'rovlar yuborish.
