# Component Structure - Komponentlar Arxitekturasi

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dastlabki kunlarda frontend faqat bitta katta HTML fayl va uzun jQuery kodlaridan iborat bo'lgan. Bugungi kunda esa frontend butunlay **Komponentlarga** asoslangan. Komponentlarni to'g'ri maydalash (strukturasi) va ularni papkalarga to'g'ri joylashtirish loyihaning kengayishi (scalability) uchun poydevor hisoblanadi. Agar komponentlar noto'g'ri bo'linsa, "Prop Drilling" (propni o'nlab bosqich pastga uzatish), haddan tashqari qaramlik (tight coupling) va qotib qolgan UI kabi bosh og'riqlarga duch kelasiz.

> [!NOTE]
> **Real-hayot analogiyasi: "Avtomobil zavodi (Atomic Design)"**  
> - **Atomlar:** Vintlar, lampochkalar, temir bo'laklari (Button, Input). Ular o'z-o'zicha hech qanday vazifa bajarmaydi, lekin eng asosiy qurilish ashyosidir.
> - **Molekulalar:** Vint va plastmassadan yasalgan "Rul" yoki "O'rindiq" (SearchForm = Input + Button). Bular bir qancha atomlardan tashkil topadi va qandaydir bitta aniq ishni bajaradi.
> - **Organizmlar:** Dvigatel, Kuzov, Salon (Header, Sidebar, ProductCard). Bular ancha murakkab va ichida ko'plab molekulalarni saqlaydi.
> - **Page (Sahifa):** Tayyor avtomobil! Siz faqat tayyor organizmlarni (kuzov, dvigatel) biriktirasiz, atomlar bilan ovora bo'lmaysiz. Agar siz avtomobilni to'g'ridan-to'g'ri vintlardan yig'sangiz (Spaghetti code), bir joyi buzilsa butun mashinani qismlarga ajratishga to'g'ri keladi.

```mermaid
graph TD
    UI[Foydalanuvchi Interfeysi] --> Pages[Pages]
    Pages --> Organisms[Organisms (Murakkab qismlar)]
    Organisms --> Molecules[Molecules (Guruhlangan elementlar)]
    Molecules --> Atoms[Atoms (Asosiy elementlar)]
    
    Atoms --> BaseButton[BaseButton.vue]
    Atoms --> BaseInput[BaseInput.vue]
    
    Molecules --> SearchForm[SearchForm.vue]
    Molecules --> UserCard[UserCard.vue]
    
    Organisms --> TheHeader[TheHeader.vue]
    Organisms --> SidebarNav[SidebarNav.vue]
    
    style UI fill:#e1bee7,stroke:#8e24aa
    style Pages fill:#ffcdd2,stroke:#d32f2f
    style Organisms fill:#c8e6c9,stroke:#388e3c
    style Molecules fill:#bbdefb,stroke:#1976d2
    style Atoms fill:#ffe0b2,stroke:#f57c00
```

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi komponentni qanday qilib oddiy va qayta ishlatsa bo'ladigan qilib tuzishni tushunishi kerak.

### 1. Komponentlarni Kichraytirish
Hech qachon yuzlab qatorlik gigant `.vue` yoki `.jsx` fayl yozmang. Uni kichik-kichik mustaqil fayllarga bo'ling.

```vue
<!-- YOMON: Hamma narsa bitta faylda -->
<template>
  <div class="user-page">
    <div class="header">
      <img :src="user.avatar"> <h2>{{ user.name }}</h2>
    </div>
    <div class="info">
      Email: {{ user.email }}, Telefon: {{ user.phone }}
    </div>
    <div class="actions">
      <button @click="editUser">Tahrirlash</button>
      <button @click="deleteUser">O'chirish</button>
    </div>
  </div>
</template>

<!-- YAXSHI: Komponentlarga bo'lingan -->
<template>
  <div class="user-page">
    <UserHeader :user="user" />
    <UserInfo :user="user" />
    <UserActions @edit="editUser" @delete="deleteUser" />
  </div>
</template>
```

### 2. Base (Asosiy) Komponentlar
Loyiha boshida UI-kit'ni (tugmalar, inputlar, checkboxlar) `Base` prefix bilan yaratib olish kerak.
- `BaseButton.vue`
- `BaseInput.vue`
- `BaseIcon.vue`

Ushbu komponentlarda biznes logika (masalan API'ga ulanish) bo'lmasligi qat'iyan man etiladi!

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi Container/Presentational (Smart/Dumb) arxitekturasini biladi va ma'lumotlarni komponentlararo (Props, Events, Provide/Inject) to'g'ri boshqaradi.

### 1. Smart va Dumb Komponentlar
**Dumb (Presentational) Komponent:** Faqat prop qabul qiladi va UI chizadi. Hech narsani bilmaydi.
**Smart (Container) Komponent:** Data olib keladi (API/Store), logika bajaradi va datani Dumb komponentlarga beradi.

```vue
<!-- SMART COMPONENT (UserDashboard.vue) -->
<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import UserProfileCard from './UserProfileCard.vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.fetchUsers() // API dan ma'lumot oladi
})

function handleDelete(id) {
  userStore.deleteUser(id) // Logikani boshqaradi
}
</script>

<template>
  <div>
    <UserProfileCard 
      v-for="user in userStore.users" 
      :key="user.id" 
      :user="user"
      @delete="handleDelete" 
    />
  </div>
</template>


<!-- DUMB COMPONENT (UserProfileCard.vue) -->
<script setup>
defineProps(['user'])
const emit = defineEmits(['delete']) // API ga ulanmaydi, faqat otasiga aytadi!
</script>

<template>
  <div class="card">
    <h3>{{ user.name }}</h3>
    <button @click="emit('delete', user.id)">O'chirish</button>
  </div>
</template>
```

### 2. Prop Drilling va Slots
Agar siz prop ni `A -> B -> C -> D` kabi o'ziga kerak bo'lmagan komponentlar orqali uzatayotgan bo'lsangiz (Prop Drilling), bu arxitektura xatosi.
Yechim: `Provide/Inject` ishlatish yoki `Slots` orqali Composition yaratish.

```vue
<!-- Composition orqali yechim -->
<AppLayout>
  <template #header>
    <UserMenu :user="userData" /> <!-- B to'g'ridan-to'g'ri oladi! -->
  </template>
</AppLayout>
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi yirik loyihalarda "Compound Components", "Renderless Components" kabi patternlarni va keng qamrovli UI tizimlarini (Design System) qurishni biladi.

### 1. Compound Components (Murakkab Komponentlar)
Bir-biriga kuchli bog'langan komponentlar guruhini yaratish (masalan Select va uning Option lari). Bu pattern API ni juda toza va sodda qiladi. (Vue'da `provide/inject` yoki React'da `Context` orqali amalga oshadi).

```vue
<!-- Foydalanilishi qanchalik chiroyli: -->
<template>
  <Tabs v-model="activeTab">
    <TabsList>
      <TabsTrigger value="overview">Umumiy ko'rinish</TabsTrigger>
      <TabsTrigger value="settings">Sozlamalar</TabsTrigger>
    </TabsList>

    <TabsContent value="overview">
      <OverviewPanel />
    </TabsContent>
    <TabsContent value="settings">
      <SettingsPanel />
    </TabsContent>
  </Tabs>
</template>
<!-- Bu yerda Tabs komponenti Provide orqali qaysi tab aktiv ekanligini 
ichidagi boshqa komponentlarga bildirmasdan uzatmoqda. -->
```

### 2. Renderless Components
UI'ni umuman chizmaydigan (HTML yo'q), faqat ichki mantiqni hisoblab uni ishlatish uchun (Scoped Slots orqali) child komponentlarga uzatadigan komponentlar. Ular hozirda Composables (Vue) yoki Custom Hooks (React) ga o'z o'rnini ko'p bo'shatgan bo'lsada, shablonlarda hamon kuchli.

### Intervyu Savoli
**"Loyihada bir xil tuzilishga ega (masalan header va footerli) lekin logikasi butunlay boshqa-boshqa bo'lgan 10 ta har xil Card (karta) komponenti kerak. Buni qanday qurasiz?"**
*Javob:* 
Men "BaseCard" degan bitta Dumb (Presentational) komponent yarataman. Unga juda ko'p prop'lar qo'shmayman. Uning ichida uchta asosiy Slot (masalan `#header`, `#default`, `#footer`) ochaman. Qolgan 10 ta Card komponentini shu "BaseCard" ga asosan (Wrapper sifatida) qilib, logikani ularning o'zida yozib `#header` va `#footer` slotlariga kerakli ma'lumotni tashlayman. Bu Configuration over Composition tamoyili o'rniga "Composition over Configuration" ni ta'minlaydi. 

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Aqliy (Smart) va Ahmoq (Dumb) komponentlarni ajrating:** API dan ma'lumot oluvchi yoki State (Redux/Pinia) ga ulanuvchi komponentlarni faqat logika (Container) uchun ishlating. UI (Presentational) komponentlarga esa ma'lumotni faqat Prop orqali berib, ularning sof vizual bo'lishini ta'minlang.
2. **Prop Drilling'dan qoching:** Agar Prop ni A komponentdan C komponentga B orqali uzatayotgan bo'lsangiz (A -> B -> C), `Provide/Inject` (Vue) yoki `Context` (React) dan, yoki Global State'dan foydalaning. Yoki yaxshirog'i, Slots (Composition) yordamida UI ni parentda yig'ing.
3. **Komponent nomlanishi (Naming):** Komponentlarni ikki yoki undan ortiq so'z bilan nomlang (masalan, `BaseButton.vue` yoki `UserProfile.vue`). Bu kelajakda HTML'ga xuddi shunday standart teg qo'shilganda nomlar to'qnashuvini (collision) oldini oladi.

---

## Xulosa

| Komponent Arxitekturasi | Vazifasi / Ishlatilishi | Afzalligi |
| --- | --- | --- |
| **Atomic Design** | Komponentlarni kichik elementlardan (Atom) tortib murakkab sahifalargacha (Page) bo'lish tizimi | Tizimli yondashuv, Design System bilan mukammal moslik |
| **Smart / Dumb** | Mantiqiy boshqaruvchi (Container) va faqat ko'rsatuvchi (Presentational) komponentlarga ajratish | UI komponentlarini 100% qayta ishlatish imkoniyati |
| **Compound Components** | Bitta guruh bo'lib ishlaydigan komponentlar (masalan, `Select` va uning ichidagi `Option`lar) | Ota-bola aloqasi yashirin tarzda (Context/Provide) hal qilinadi, API juda toza bo'ladi |
| **Renderless / Headless** | Hech qanday HTML (UI) render qilmaydigan, faqat hisob-kitob (Logic) qaytaruvchi komponentlar | Istalgan dizayn bilan qiyin mantiqlarni qayta ishlata olasiz |
