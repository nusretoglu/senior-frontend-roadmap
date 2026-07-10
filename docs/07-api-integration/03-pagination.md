# Pagination (Sahifalash)

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Minglab yoki millionlab ma'lumotlarni birdaniga yuklash frontend'ni ham, backend'ni ham, foydalanuvchining internet trafiki-yu brauzerini ham "o'ldirishi" aniq. Shuning uchun ma'lumotlarni qismlarga bo'lib (masalan har bir sahifada 20 tadan) yuklash arxitekturasini bilish frontend dasturchi uchun zarur. Noto'g'ri tanlangan pagination strategiyasi foydalanuvchi tajribasini (UX) buzadi yoki ma'lumotlar dublikatsiyasiga olib keladi.

> [!NOTE]
> **Real-hayot analogiyasi: "Kitob o'qish"**  
> Tasavvur qiling siz ming sahifalik kitobni butunlay bir kunda, bitta varaqda o'qiy olmaysiz. Sahifalarga bo'lib o'qiysiz. 
> - **Offset (An'anaviy):** Men aynan 55-sahifani ochaman deb birdan o'sha sahifani ochish. Lekin kimdir kitobning boshiga yangi varaq qo'shsa, siz kutgan matn 56-sahifaga ko'chib qoladi.
> - **Cursor (Zamonaviy):** Men "Qizil xatcho'p" (cursor) qo'ygan joyimdan keyingi sahifani o'qiyman. Kimdir kitob boshiga nima qo'shishidan qat'i nazar, siz xatcho'pdan keyingisini xatosiz o'qiysiz.

Pagination - katta data to'plamlarini kichik, boshqariladigan bo'laklarga bo'lish usulidir. Keling, uning bosqichlarini ko'rib chiqamiz.

---

## 🟢 Junior (Asoslar va Tushunchalar)

Eng keng tarqalgan an'anaviy yondashuv **Offset-based (Sahifaga asoslangan)** pagination hisoblanadi. U SQL dagi `OFFSET` va `LIMIT` kalit so'zlariga asoslangan. Backend'dan so'raymiz: "Menga 2-sahifadagi 20 ta ma'lumotni ber" (`?page=2&limit=20`).

```javascript
// Backend sizga shunga o'xshash obyekt qaytaradi
{
  "data": [ { id: 21, name: "Item 21" }, /* ... 20 ta obyekt ... */ ],
  "pagination": {
    "total": 1000,
    "page": 2,
    "limit": 20,
    "totalPages": 50
  }
}
```

Bunday usulda frontend barcha sahifalarni raqamlar orqali ko'rsata oladi (Masalan: `[1] [2] [3] ... [50]`).
Biroq uning eng katta muammosi bor:
- **Ma'lumot siljishi:** Agar siz 1-sahifani ko'rayotganingizda kimdir bazaga 1 ta yangi narsa qo'shsa, siz 2-sahifaga o'tganingizda 1-sahifaning oxirgi elementi 2-sahifaning boshida **takror** ko'rinib qoladi (Duplicate).

---

## 🟡 Middle (Amaliyot va Detallar)

Middle developer paginationning qachon qaysi turi ishlashini va Infinite Scroll (Cheksiz skroll) qanday qilinishini bilishi kerak.

### Cursor-based (Keyset) Pagination
Real-time tarmoqlarda (Twitter, Instagram) Offset bilan ishlab bo'lmaydi. Uning o'rniga **Cursor-based** ishlatiladi. Backend sizga qaysi sahifada ekanligingizni emas, eng oxirgi ko'rgan elementingizning ID'sini (Cursor) beradi. Siz keyingi so'rovda shu ID dan keyingilarini so'raysiz.

```javascript
// Backend javobi:
{
  "data": [...],
  "pageInfo": {
    "hasNextPage": true,
    "endCursor": "eyJpZCI6MjB9" // (Base64 encoding qilingan so'nggi ID)
  }
}

// Keyingi so'rov:
// GET /api/posts?after=eyJpZCI6MjB9&limit=20
```
Bu usul tezroq ishlaydi, chunki DataBase `OFFSET 999980` deb million qatorni sanab o'tirmaydi, u shunchaki `WHERE id > 12345` deb darhol topadi. Lekin kamchiligi — foydalanuvchi to'g'ridan-to'g'ri 5-sahifaga sakrab o'tolmaydi.

### Vue 3 da Infinite Scroll yozish (Intersection Observer)
Tugma bosib keyingi sahifani ochish o'rniga, foydalanuvchi pastga skroll qilganda keyingi sahifa avtomat yuklanishi — **Infinite Scroll** deyiladi. Buni `IntersectionObserver` orqali samarali qilish mumkin.

```javascript
import { ref, onMounted, onUnmounted } from 'vue';

export function useInfiniteScroll(fetchFn) {
  const items = ref([]);
  const cursor = ref(null);
  const hasMore = ref(true);
  const loading = ref(false);
  const sentinelRef = ref(null); // Kuzatiluvchi HTML element (masalan, ro'yxat oxiridagi <div>)

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return;
    loading.value = true;
    const response = await fetchFn(cursor.value);
    items.value.push(...response.data);
    cursor.value = response.endCursor;
    hasMore.value = response.hasNextPage;
    loading.value = false;
  };

  onMounted(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    });
    if (sentinelRef.value) observer.observe(sentinelRef.value);
  });

  return { items, sentinelRef, loading };
}
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior developer katta hajmli ma'lumotlarni qanday chizish, muammoli nuqtalar va intervyuda keladigan murakkab ssenariylar haqida o'ylaydi.

### Virtual Scrolling
Brauzer xotirasi va DOM (Document Object Model) cheksiz emas. Infinite Scroll qilib 10,000 ta qator ma'lumotni DOM ga tiqsangiz brauzer qotib, "Lag" bera boshlaydi.
Buni oldini olish uchun **Virtual Scrolling (yoki Windowing)** ishlatiladi.
Uning ishlash prinsipi: Jami 10,000 ta ma'lumot bo'lsa ham, faqat ekranga sig'adigan 20 tasinigina DOM ga chizadi, skroll qilinganda tepaga o'tib ketgan `<div>` larni o'chirib, o'rniga yangilarini chizadi.
Buning uchun Vue da `vue-virtual-scroller`, React da `react-window` kabi kutubxonalardan foydalaniladi.

### Intervyu Savoli
**"Offset vs Cursor pagination: Qachon qaysi birini tanlash kerak?"**
*Javob:* 
- **Offset pagination** — agar bizda admin panel, dashboard yoki E-commerce dagi tovarlar ro'yxati bo'lsa kerak. Chunki bu joylarda SEO muhim (`?page=5` linkini indekslash kerak) va foydalanuvchi ma'lumotning o'rtasiga yoki oxirgi sahifasiga tez sakrab o'tishni hohlaydi. Shuningdek, ma'lumotlarning o'zgarish tezligi ancha sekin.
- **Cursor pagination** — agar bizda Twitter, Facebook lentasi (feed), chatdagi xabarlar yoki log tizimlari bo'lsa kerak. Bu yerda ma'lumot sekund sayin o'zgaradi, shuning uchun Offset ishlatsak data duplicated (takror) bo'lib qoladi. Qolaversa, jadvaldagi ma'lumot milliondan oshib ketganda Cursor DB uchun tezroq ishlaydi. Va u doim Infinite scroll uchun mukammal yechimdir.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Jadvallar (Tables) uchun Offset/Page-based**: Foydalanuvchi aynan qaysi sahifaga o'tishni tanlashi kerak bo'lgan boshqaruv panellari (admin panels) uchun eng maqbul usul.
2. **Ijtimoiy tarmoqlar (Feeds) uchun Cursor-based**: Doimiy tarzda yangilanib turuvchi ro'yxatlar uchun (masalan Twitter lentalari) cursor ishlating. Aks holda foydalanuvchi sahifani o'zgartirganda ayni bir xabar ikki marta ko'rinib qolishi mumkin.
3. **Infinite Scroll (Cheksiz skroll) ni to'g'ri ishlating**: Cheksiz skroll ostiga hech qachon Footer qismini qo'ymang (chunki foydalanuvchi unga yetib bora olmaydi). Uni o'rniga virtual scrolling ishlating (masalan `vue-virtual-scroller`).

---

## Xulosa

| Turi | Qanday ishlaydi? | Kamchiligi | Qayerda ishlatiladi? |
|------|------------------|------------|----------------------|
| **Offset/Page-based** | URL da sahifa raqami (`?page=2`) | Yangi ma'lumot qo'shilsa siljiydi (Takrorlanish) | E-commerce, Admin panellar |
| **Cursor-based** | Oxirgi element ID sini eslab qolish | Boshqa sahifaga sakrab o'tish imkonsiz | Facebook, Twitter (Infinite Scroll) |
| **Virtual Scrolling**| Faqat ekranga sig'gan qismini chizish | Setup qilish birmuncha qiyinroq | Juda ko'p qatorli ro'yxatlarda |

Pagination - katta data bilan ishlashning asosiy usuli. Cursor-based pagination real-time va katta dataset'lar uchun eng yaxshi, lekin offset-based oddiyroq va SEO-friendly. Virtual scrolling million element'lar uchun zarur.

**Keyingi qadam:** [Caching](./04-caching.md) - API javoblarini qanday qilib keshga olamiz?
