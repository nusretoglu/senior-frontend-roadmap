# GraphQL

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> REST ajoyib, lekin u har doim bir xil ma'lumot qolipini qaytaradi. Masalan, sizga faqat foydalanuvchining ismi kerak bo'lsa ham, REST butun boshli foydalanuvchi profilini (yoshi, manzili, paroli) yuklab keladi (Over-fetching). Yoki foydalanuvchi va uning postlarini olish uchun 2 xil API ga zapros yuborish kerak bo'ladi (Under-fetching). GraphQL shu ikkita katta muammoni hal qiladi va frontend dasturchiga faqat o'ziga kerakli ma'lumotni so'rash imkoniyatini beradi.

> [!NOTE]
> **Real-hayot analogiyasi: "Set menyu vs Shved stoli (Buffet)"**  
> **REST (Set menyu):** Restoranga borasiz va 1-raqamli menyuni buyurasiz. Sizga sho'rva, ikkinchi ovqat va salat olib kelishadi. Siz faqat salat yemoqchi bo'lsangiz ham, barini olasiz va pulini to'laysiz (Over-fetching).
> **GraphQL (Shved stoli):** Likopchani olib, faqatgina o'zingiz yemoqchi bo'lgan narsadan ozgina solib olasiz. Xohlasangiz sho'rvani o'zi, xohlasangiz faqat shirinlik. Aynan o'zingiz so'ragan narsa keladi.

GraphQL - Facebook tomonidan 2012-yilda yaratilgan va 2015-yilda ommaga taqdim etilgan, API lar uchun maxsus so'rov (query) tili.

---

## 🟢 Junior (Asoslar va Tushunchalar)

### GraphQL vs REST
Asosiy farq shundaki, REST da har bir ish uchun alohida manzil (endpoint) bor. GraphQL da esa faqat BITTA manzil bor (masalan `/graphql`). Hamma savollar o'sha bitta manzilga yuboriladi, farqi siz qanday formatda so'rayotganingizda.

```mermaid
graph TD
    subgraph REST API
        R_Client[Client] -->|GET /users| R_Users[Users Endpoint]
        R_Client -->|GET /posts| R_Posts[Posts Endpoint]
        R_Users -.-> |Full User Data| R_Client
        R_Posts -.-> |Full Posts Data| R_Client
    end

    subgraph GraphQL API
        G_Client[Client] -->|query { users, posts }| G_Endpoint[Bitta /graphql Endpoint]
        G_Endpoint -.-> |Faqat so'ralgan Data| G_Client
    end
    
    style REST API fill:#ffebee,stroke:#c62828
    style GraphQL API fill:#e8f5e9,stroke:#2e7d32
```

### GraphQL Amallari (Operations)
REST dagi GET, POST, PUT tushunchalari GraphQL da biroz o'zgacharoq ataladi:

| Amallar | Ma'nosi | REST ekvivalenti |
| --- | --- | --- |
| **Query** | Ma'lumotlarni so'rash va o'qish | `GET` |
| **Mutation** | Ma'lumot qo'shish, o'zgartirish, o'chirish | `POST`, `PUT`, `DELETE` |
| **Subscription** | Server bilan jonli (real-time) aloqada bo'lish | WebSocket ulash |

### Qanday so'raladi va qanday keladi?
Eng zo'r tarafi siz qanday shaklda so'rov (Query) yozsangiz javob xuddi shunday shaklda qaytadi:

**Siz so'raysiz:**
```graphql
query {
  user(id: 1) {
    name
    email
  }
}
```

**Javob keladi:**
```json
{
  "data": {
    "user": {
      "name": "Ali",
      "email": "ali@mail.com"
    }
  }
}
```
*(E'tibor bering, faqat name va email keldi, parollar yoki id lar emas)*

---

## 🟡 Middle (Amaliyot va Detallar)

### GraphQL Frontend da ishlatish (Apollo Client)
Garchi GraphQL ni oddiy `fetch` yordamida ham yuborish mumkin bo'lsa-da, haqiqiy loyihalarda **Apollo Client** kabi kutubxonalar ishlatiladi. Ular sizga Loading state, error handling, va eng muhimi Data Caching (Keshlash) imkonini beradi.

```javascript
// Vue va Apollo Client orqali so'rov yuborish
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

// Query ni alohida o'zgaruvchiga yozib olamiz
const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      author {
        name
      }
    }
  }
`

// Setup ichida ishlatamiz
const { result, loading, error } = useQuery(GET_POSTS)
```

### Mutatsiya (Mutation) qilish
Endi bazaga nimadir qo'shib ko'ramiz (masalan, yangi post). Buning uchun Mutatsiyaga o'zgaruvchi (Variables) berib yuborish kerak bo'ladi.

```javascript
const ADD_POST = gql`
  # $ belgisi orqali funksiya argumentlarini belgilaymiz
  mutation CreatePost($title: String!, $content: String!) {
    createPost(title: $title, content: $content) {
      id
      title
    }
  }
`

const { mutate: createPost, loading } = useMutation(ADD_POST)

// Saqlash tugmasi bosilganda:
const handleSave = async () => {
  await createPost({
    title: "Yangi post",
    content: "Bu mening birinchi postim"
  })
}
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

### Fragment (Bo'laklar) nima va nega kerak?
Tasavvur qiling, sizda ikkita har xil Query bor: biri bitta po'stni ko'rsatish uchun, ikkinchisi postlar ro'yxati uchun. Ammo ikkalasida ham muallifning (Author) rasmiga, ismiga, profil linkiga extiyoj bor. Bir narsani ikki marta yozish o'rniga, **Fragment** ishlatiladi.

```graphql
# Qayta ishlatiladigan User bo'lagini yozamiz
fragment UserFields on User {
  id
  name
  avatar
  email
}

# 1-Query: Bitta Post
query GetPost($id: ID!) {
  post(id: $id) {
    title
    author {
      ...UserFields  # Shu yerga tiqib qo'yamiz
    }
  }
}

# 2-Query: Hamma Postlar
query GetAllPosts {
  posts {
    title
    author {
      ...UserFields  # Bu yerga ham!
    }
  }
}
```

### N+1 Muammosi (Backend taraf)
GraphQL da intervyu savollarining "Shohi".
Frontedchi "Foydalanuvchilar va ularning xabarlarini bering" desa:
1. Backend bazaga borib hamma foydalanuvchini oladi (1 ta Query).
2. Keyin har bir (N ta) foydalanuvchi uchun alohida-alohida qaytib bazaga borib, uning xabarlarini so'ray boshlaydi (N ta Query).
Jami 1 + N marta bazaga so'rov ketib qoladi. REST da bu bitta SQL `JOIN` orqali hal bo'lardi, lekin GraphQL ning tabiatidan kelib chiqib har bir "Node" o'ziga javobgar.
Buni hal qilish uchun Backendchilar **DataLoader** degan narsadan foydalanadilar. U alohida borayotgan so'rovlarni "pachka" (batch) qilib jamlaydi va bazaga faqat 1 marta yuboradi.

### Intervyu Savollari (Qiyin daraja)
**1. REST da ma'lumotlarni Kesh (Cache) qilish juda oson, URL bo'yicha keshlanadi. GraphQL da bu qanday qilinadi?**
*Javob:* GraphQL da hamma so'rovlar faqat bitta URL (`/graphql`) va faqat `POST` metod orqali borgani uchun brauzer darajasidagi oddiy keshlash ishlamaydi. Shuning uchun biz Apollo Client kabi asboblarga muhtojmiz. Apollo "Normalized Cache" dan foydalanadi: ya'ni qaytgan javobdagi har bir ob'ektni uning `__typename` va `id` si orqali (masalan `User:123`) bo'laklab alohida-alohida yodlab qoladi va keyingi so'rovlarda faqat yetishmayotgan qisminigina serverdan so'raydi.

**2. Optimistic UI (Optimistik Interfeys) nima va GraphQL da uni qanday qilinadi?**
*Javob:* Foydalanuvchi "Like" tugmasini bosa, serverdan u muvaffaqiyatli saqlandi degan javobni kutib o'tirmasdan, layk sonini bittaga ko'paytirib qo'yish Optimistik UI deyiladi (Agar server xato bersa orqaga qaytariladi). Apollo dagi `useMutation` hookida maxsus `optimisticResponse` degan obyekt beriladi. Unga qanday formatda kutilayotgan javobni yozsak, Apollo Keshni darhol o'sha obyekt bilan vaqtincha yangilab turadi va ekranda o'zgarish seziladi.

**3. Frontend da Persisted Queries nima va u qanday foyda beradi?**
*Javob:* Odatda GraphQL da frontend katta-katta Query text larini backendga yuboradi. Bu network trafikni ko'paytirib yuboradi. Buni oldini olish uchun "Persisted Queries" (Muxrlangan so'rovlar) tizimi yoziladi: Backend va Frontend avvaldan kelishib barcha uzun Query larni Qisqa Hesh (Hash) kodlariga aylantirib yodlab oladi (Masalan, `abc123_hash`). Shundan so'ng frontend faqat hesh jo'natadi, backend uni tanib nima kerakligini tushunib oladi.

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Faqat keraklisini so'rang**: Qulay bo'lishi uchun har doim `...UserFields` deb barcha narsani so'ravermang. Qaysi komponentga aynan qaysi qator (field) kerak bo'lsa o'shanigina query qiling.
2. **Fragmentlardan foydalaning**: UI komponentlarga qarab ma'lumot so'rang. Har bir Vue komponenti o'ziga kerakli GraphQL fragmentini define qilishi va ota komponent bu fragmentlarni birlashtirib (compose qilib) query yuborishi afzal.
3. **Optimistic UI yarating**: Mutatsiyalar yuborilayotgan paytda, server javobini kutmasdan UI ni birdan yangilab qo'ying (Apollo'ning `optimisticResponse` opsiyasi orqali).
4. **Caching imkoniyatlaridan foydalaning**: GraphQL Apollo Client yoki Urql kabi kuchli kesh xotira tizimiga ega. Har bir ma'lumotning o'z identifikatori (masalan `User:123`) bor. Keshni ehtiyotkorlik bilan boshqaring.

---

## Xulosa

| Tushuncha | Vazifasi | REST dagi analogi |
|-----------|----------|-------------------|
| **Query** | Ma'lumotlarni o'qib olish | `GET` request |
| **Mutation** | Yangi yaratish, o'zgartirish, o'chirish | `POST`, `PUT`, `DELETE` |
| **Subscription**| Real-vaqtda ma'lumotlarni eshitib turish | WebSockets yoki Server-Sent Events |
| **Fragment** | Query'ni qayta ishlatiladigan bo'laklarga bo'lish | - (Yo'q) |
| **Apollo Client**| Ma'lumot tortish, keshlash va boshqarish | Axios + React Query / SWR |

GraphQL - murakkab va ichma-ich ketgan munosabatli ma'lumotlar bor loyihalar uchun kuchli quroldir. U Frontend dasturchilarga haqiqiy erkinlik beradi: endi Backend dan o'ziga mos API ochib berishini kutib o'tirish shart emas. Apollo Client orqali Optimistik UI va aqlli Keshlash loyihani juda sifatli darajaga olib chiqadi.
