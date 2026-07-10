# Options API - Vue ning Klassik Yondashuvi

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Garchand hozirda `Composition API` standartga aylangan bo'lsa ham, dunyodagi minglab o'rta va yirik loyihalar aynan Vue 2 / Options API da yozilgan. Ularni qo'llab-quvvatlash, xatolarini to'g'rilash (bugfix) yoki Vue 3 ga ko'chirish (migration) vazifalari uchun Options API ning "Under the hood" qismini va `this` qanday ishlashini bilish juda muhimdir.

## 🟢 Junior (Asoslar va Tushunchalar)

### Terminologiya
**Options API** — Komponentni "Tanlovlar" (Options) orqali yasash. Bunda siz Vue instansiyasiga o'z ma'lumotlaringizni maxsus bloklar orqali berib yuborasiz (`data`, `methods`, `computed`, `watch`). 

> [!NOTE]
> **Hayotiy o'xshatish: "Restoran Oshxonasi"**  
> Restoran oshxonasini tasavvur qiling. Unda har bir ish uchun maxsus xonalar va qoidalar bor:
> - **Muzlatgich qismi (`data()`):** Bu yerda faqat mahsulotlar saqlanadi. 
> - **Kesish va Pishirish taxtasi (`methods`):** Bu yerda oshpaz qo'l mehnati bilan ishlaydi (funksiyalar).
> - **Retseptlar kitobi (`computed`):** Qanday pishirish yozilgan, tayyor retsept asosida tezda natija olinadi (keshlanadi).
> - **Qorovul (`watch`):** Kim kelib ketayotganini, nima o'zgarganini poylab turadi.
> Oshpazlar bu tartibga qat'iy rioya qilishi shart. Options API ham aynan shunday, har bir vazifa uchun alohida o'zining joyi bor.

### Sodda Misol
```vue
<script>
export default {
  // 1. Data (Holat)
  // Har doim function bo'lishi shart!
  data() {
    return {
      ism: 'Ali',
      yosh: 20
    }
  },

  // 2. Metodlar (Harakatlar)
  methods: {
    yoshniOshirish() {
      // this kalit so'zi majburiy
      this.yosh++ 
    }
  }
}
</script>
```

---

## 🟡 Middle (Amaliyot va Detallar)

### `computed` vs `methods`
Nima uchun hammasini `methods` da yozib qo'yaqolmaymiz? Nega bizga `computed` kerak?
**Javob: Kesh (Cache) uchun.** `methods` ichidagi funksiya sahifada arzimagan narsa o'zgarsa ham boshqatdan ishga tushaveradi. `computed` esa faqat o'ziga kerakli bo'lgan o'zgaruvchi o'zgarsagina qaytadan hisoblaydi.

```javascript
export default {
  data() {
    return { items: [1, 2, 3, 4, 5], boshqaSanoq: 0 }
  },
  computed: {
    // Faqat "items" o'zgarsa qaytadan hisoblaydi (Juda tez)
    juftSonlar() {
      return this.items.filter(n => n % 2 === 0)
    }
  },
  methods: {
    // "boshqaSanoq" o'zgarganda ham ekranda render bo'lgani uchun boshqatdan hisoblayveradi (Sekin)
    juftSonlarMetodi() {
      return this.items.filter(n => n % 2 === 0)
    }
  }
}
```

### Ko'p uchraydigan xatolar (Pitfalls)
**1. Arrow Function xatosi:**
Options API bloklarida `=>` (Arrow function) larni ishlatib bo'lmaydi.
```javascript
// YOMON: "this" yo'qolib qoladi (window / undefined ga teng bo'ladi)
methods: {
  oshirish: () => { this.sanoq++ } 
}

// YAXSHI: Oddiy funksiya
methods: {
  oshirish() { this.sanoq++ } 
}
```

**2. Obyektlarni kuzatish (`watch` deep):**
Oddiy `watch` obyektning ichiga kirmaydi, uni yuzaki qaraydi xolos. Agar `user.yosh` o'zgarsa u ishlamaydi. Obyekt ichini kuzatish uchun `deep: true` yozilishi shart.
```javascript
watch: {
  user: {
    handler(yangiQiymat) { /*...*/ },
    deep: true // Obyekt ichiga kirib kuzatish
  }
}
```

## Eng Yaxshi Amaliyotlar (Best Practices)
1. **Parchalanmasdan biriktiring:** Bitta logikaga aloqador bo'lgan o'zgaruvchilar va metodlarni nomlayotganda ularni prefikslar (masalan, `userLoading`, `userList`, `userFetch()`) bilan nomlang. Shunda ular garchi har xil bloklarda yotsa ham vizual ravishda aloqador ekanligi ko'rinib turadi.
2. **Global Mixin lardan qoching:** Har xil fayllarda takrorlanuvchi metodlarni yig'ib `mixin` qilib hamma joyga yopishirish eski odat bo'lib, keyinchalik kodni debug qilishni (xatoni topishni) deyarli imkonsiz qiladi. Buning o'rniga "Composables" ga o'ting.

---

## 🔴 Senior (Arxitektura va Optimallashtirish)

### Mixin larning "O'lim Xochi"
Vue 2 da kodni qayta ishlatishning yagona yo'li Mixins edi. Lekin u juda katta me'moriy muammolarga olib keldi:
1. **Nomlar to'qnashuvi (Name collision):** Ikkita mixin da bitta xil nomdagi `data` yoki `method` kelib qolsa qaysi biri yutib chiqishini aniqlash qiyin.
2. **Yashirin Qaramlik (Implicit Dependencies):** Komponent ichida `this.openModal()` deb chaqiriladi, lekin bu metod na `methods` blokida va na faylda bor. U tashqaridagi qaysidir 5 ta mixinning bittasidan sehr kabi kelib qolgan bo'ladi. U qayerdan kelganini qidirish uchun IDE larni chalg'itadi.
Shu muammolar tufayli Vue 3 da Composition API ixtiro qilindi.

### `this.$nextTick()` anatomiyasi
Dasturchi `this.xabar = "Salom"` degan paytida ekranda o'sha zahotiyoq "Salom" yozuvi paydo bo'lmaydi. Vue hamma o'zgarishlarni yig'ib (Batching) komponentni faqat 1 marta re-render qiladi. Buni `Microtask Queue` yordamida `Promise` sifatida asinxron bajaradi. Agar biz ekrandagi o'zgarishni darhol hisoblamoqchi bo'lsak, Vue ning DOM update ni tugatishini kutishimiz kerak:

```javascript
methods: {
  async xabarniOzgartir() {
    this.xabar = "Salom"
    console.log(this.$refs.quti.innerHTML) // Hali ham eski xabar (bo'sh) ko'rinadi
    
    await this.$nextTick() // Vue DOM ni yangilashini kutish
    console.log(this.$refs.quti.innerHTML) // Endi "Salom" degan yozuv chiqadi
  }
}
```

### Intervyu Savollari (Qiyin daraja)
**1. Nima uchun `data` har doim funksiya (va obyekt qaytaruvchi) bo'lishi shart?**
*Javob:* Agar `data` shunchaki Obyekt tipida yozilsa (funksiya bo'lmasa), u xotirada 1 ta joyda yotgan bo'ladi. Agar siz ana shu bitta komponentdan sahnada 3 ta ishlatsangiz (masalan `<UserCard />` dan uchta), bittasining datasini o'zgartirsangiz avtomatik ravishda qolgan ikkitasiniki ham o'zgarib ketadi (Reference type sharing muammosi). `data() { return {} }` funksiyasi esa har bir komponent instansiyasi uchun xotiradan yepyangi mustaqil Obyekt ajratib berishni kafolatlaydi.

**2. Lifecycle Hook lar qanday o'zgardi (Vue 2 dan Vue 3 ga Options API da)?**
*Javob:* 
- `beforeDestroy` $\rightarrow$ `beforeUnmount` ga o'zgartirildi.
- `destroyed` $\rightarrow$ `unmounted` ga o'zgartirildi.
- Options API da barcha qolgan hooklar (`created`, `mounted`) o'zgarishsiz qolgan.

---

## Xulosa

| Option (Blok) | Vazifasi | Asosiy qoida |
|---------------|----------|--------------|
| **`data()`** | Komponentning ichki holati (state) | Har doim Obyekt qaytaradigan (return) funksiya bo'lishi kerak. |
| **`methods`** | Komponent bajaradigan harakatlar | Arrow funksiya (`=>`) ishlatmang, `this` yo'qoladi. |
| **`computed`** | Mavjud data asosida hisoblanuvchi yangi qiymat | Faqat qaytarishi (return) kerak, uni ichida ma'lumotni o'zgartirmang (mutatsiyasiz). |
| **`watch`** | Data o'zgarganda biror asinxron jarayonlarni bajarish (API) | Chuqur obyektlarni kuzatish uchun `deep: true` va sahifa yuklanganda ishlashi uchun `immediate: true` ishlating. |
| **`mixins`** | Kodni qayta ishlatish mexanizmi | Imkon qadar QOCHING! O'rniga Composables yozish tavsiya qilinadi. |
