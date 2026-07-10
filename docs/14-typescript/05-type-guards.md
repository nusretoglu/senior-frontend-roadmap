# TypeScript Type Guards va Type Narrowing

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturlashda ko'pincha sizga noma'lum tipdagi ma'lumotlar keladi (masalan, API'dan, Event'dan yoki ixtiyoriy funktsiya argumentidan). Dastur xavfsiz ishlashi uchun TypeScript sizdan "Iltimos, avval bu ma'lumot rostdan ham o'sha tipdami, tekshirib olgin" deb so'raydi. Type Narrowing (Tipni Toraytirish) — kengroq va mavhum tipni (masalan `string | number`), tekshiruvlar yordamida aniq bir tipga (`string` yoki `number`) aylantirib, undan xavfsiz foydalanish usulidir.

> [!NOTE]
> **Real-hayot analogiyasi: "Bojxona tekshiruvi"**  
> Bojxona darvozasiga kelgan har qanday odam "Yo'lovchi" degan katta (Union) tipga kiradi. Uning qo'lida pasporti va deklaratsiyasi bor. 
> 1. Xodim so'raydi: "Pasportingizda O'zbekiston fuqarosi deyilganmi?" (Bu `typeof` yoki `in` kabi Type Guard).
> 2. Agar "Ha" desa, xodim u bilan Mahalliy fuqaro (Aniq Tip) kabi muomala qiladi va viza haqida so'ramaydi (Narrowing).
> 3. Agar "Yo'q" desa, avtomatik u Xorijlik ekani aniqlanadi va undan Viza talab qilinadi.

Type narrowing - bu TypeScript'ning **tipni aniqroq qilish** jarayoni. Union type'dan aniq tipga o'tish qadamlari Type Guards deyiladi.

```mermaid
graph TD
    V[value: string | number] -->|typeof value === 'string'| S(value: string)
    V -->|typeof value === 'number'| N(value: number)
    
    style V fill:#f5f5f5,stroke:#9e9e9e
    style S fill:#e3f2fd,stroke:#1565c0
    style N fill:#e8f5e9,stroke:#2e7d32
```

---

## 🟢 Junior (Asoslar va Tushunchalar)

Junior dasturchi standart JavaScript operatorlari (`typeof`, `instanceof`) orqali tiplarni qanday ajratib olishni va buni TypeScript qanday qilib darhol payqashini bilishi kerak.

### 1. `typeof` Guard (Oddiy tiplar uchun)
Agar o'zgaruvchi `string`, `number` yoki `boolean` kabi oddiy qiymat bo'lsa, uni ajratib olishning eng yaxshi yo'li `typeof`.

```typescript
function printID(id: string | number) {
  // id.toUpperCase(); // XATO! number da toUpperCase yo'q
  
  if (typeof id === "string") {
    // Bu if blokining ichida TypeScript id ning yuz foiz STRING ekanligini biladi!
    console.log(id.toUpperCase()); 
  } else {
    // else qismida u aniq NUMBER ekanligini ham o'zi bilib oladi
    console.log(id.toFixed(2));
  }
}
```

### 2. `instanceof` Guard (Klasslar uchun)
Agar siz `new Date()` yoki shaxsiy klasslaringizdan (masalan `new User()`) foydalangan bo'lsangiz `instanceof` ishlatasiz.

```typescript
class Dog { bark() { console.log("Woof!"); } }
class Cat { meow() { console.log("Meow!"); } }

function playWith(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // animal bu yerda aniq Dog
  } else {
    animal.meow(); // bu yerda aniq Cat
  }
}
```

---

## 🟡 Middle (Amaliyot va Detallar)

Middle dasturchi Interface lar bilan qanday ishlashni (ular kompayl bo'lganda yo'qolib ketadi, shu sababli `instanceof` ishlamaydi) va buning o'rniga `in` operatori yoki `is` (Custom Type Guard) yozishni biladi.

### 1. `in` Operator (Interface lar uchun)
Interface'lar JS da umuman mavjud emas, shuning uchun `instanceof` ishlata olmaysiz. Buning o'rniga obyekt ichida qaysidir "kalit so'z" borligini izlaysiz.

```typescript
interface Admin { name: string; privileges: string[]; }
interface Employee { name: string; startDate: Date; }

function printRole(user: Admin | Employee) {
  // if (user instanceof Admin) - ISHLAMAYDI! Admin bu interface.
  
  // O'rniga: "privileges" degan maydon user ni ichida bormi deb so'raymiz
  if ("privileges" in user) {
    console.log("Admin privileges:", user.privileges.join(', '));
  } else {
    console.log("Employee start date:", user.startDate);
  }
}
```

### 2. Custom Type Guard (`is` kalit so'zi)
Bitta tekshiruvni qayta-qayta yozmaslik uchun o'zimiz xuddi `typeof` ga o'xshagan maxsus funksiya yasab olamiz. Bu funksiya oddiy `boolean` qaytarmaydi, u TypeScript'ga "Bu qanday ob'ekt ekanligi" haqida imzo chekadi.

```typescript
interface Fish { swim: () => void; }
interface Bird { fly: () => void; }

// 'pet is Fish' - bu oddiy true/false emas, u sehrli so'z!
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim(); // TS ishonadi va pet ni Fish deb oladi
  } else {
    pet.fly(); // qolgani aniq Bird
  }
}
```

---

## 🔴 Senior (Arxitektura va Optimizatsiya)

Senior dasturchi yirik State Management va arxitekturalarda Discriminated Unions (Farqlovchi Unionlar) dan qanday foydalanishni, hamda Assertion (`asserts`) funksiyalarini biladi.

### 1. Discriminated Unions (eng kuchli arxitektura)
Juda ko'p holatlar (masalan API dan keladigan javob) bir nechta ob'ektdan iborat bo'ladi. Har bir ob'ektda aniq bitta (masalan `status`, `type` yoki `kind` nomli) qat'iy literal (matnli) xususiyat qo'shib ketish "Discriminated Union" deyiladi. TypeScript buni switch/case bilan mukammal darajada bog'lay oladi.

```typescript
// Barcha xolatlarni "type" degan bitta maydon birlashtirib turibdi
type NetworkState =
  | { type: "loading" }
  | { type: "failed"; code: number; message: string }
  | { type: "success"; response: { users: string[] } };

function handleResponse(state: NetworkState) {
  // switch/case xuddi Type Guard kabi ishlaydi
  switch (state.type) {
    case "loading":
      return "Downloading...";
    case "failed":
      // state endi aniq "failed" obyekti, shuning uchun "code" ni o'qiy olamiz
      return `Error ${state.code}: ${state.message}`;
    case "success":
      // bu yerda esa response aniq mavjud
      return `Downloaded ${state.response.users.length} users`;
  }
}
```
**Exhaustive Check (never) bilan qat'iy nazorat:**
Yuqoridagi kodga ertaga yangi `timeout` holati qo'shilsachi? Switch case ni unutib qo'ysangiz dastur xato ishlaydi. Shuning oldini olish uchun "default" block ga `never` qilib qo'yish zo'r pattern:

```typescript
    default:
      // Agar state hamma switch lardan o'tsa va yana ortib qolsa demak biz qaysidir conditionni yozmaganmiz. 
      // TS bu yerda qizarib xato beradi!
      const _exhaustiveCheck: never = state; 
      return _exhaustiveCheck;
```

### 2. Assertion Functions (`asserts`)
Ba'zan bizga if/else yozish yoqmaydi, agar noto'g'ri narsa kelsa dastur srazi qulashini (`throw Error`) va shu bilan tugashini xohlaymiz.

```typescript
function assertIsString(val: any): asserts val is string {
  if (typeof val !== "string") {
    throw new Error("Xato! Bu string emas!");
  }
}

function yell(str: any) {
  assertIsString(str);
  // Shu joydan pastga qarab str yuz foiz STRING, type narrowing yuz berdi!
  console.log(str.toUpperCase()); 
}
```

### Intervyu Savoli
**"`is` (Type Predicate) va `as` (Type Assertion) ning farqi nimada?"**
*Javob:*
`as` bu TypeScript'ni ko'zini bog'lash. Ya'ni siz "TS, o'z ishingni qilma, bu o'zgaruvchi 100% User, menga ishon" deysiz (`const a = data as User`). Agar data aslid boshqa narsa bo'lsa dastur runtimeda qulaydi.
`is` esa bu funktsiyaning ishonchli natijasi. Funktsiya ichida haqiqatdan ham tekshiruv (JS mantig'i bilan) amalga oshadi va u faqat rost (`true`) qaytarsagina, TS buni qabul qiladi. Bu yondashuv Runtime xavfsizligini ta'minlaydi. 

---

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Custom Type Guard'lardan foydalaning (`is`)**: Agar bitta tekshiruv kodini (`typeof x === 'object' && x !== null && 'id' in x`) har joyda yozaversangiz, kod xunuklashadi. Uni `function isUser(x: any): x is User` kabi alohida funksiyaga o'rang.
2. **Discriminated Unions eng zo'ri**: React yoki Vue da turli UI holatlarini (loading, success, error) boshqarishda ularni bitta obyekt qilib yozmang. Alohida interfeyslar qilib, barchasiga umumiy `type: 'loading' | 'success'` kabi "qorovul maydon" (discriminant) qo'shing.
3. **`in` operatorida ehtiyot bo'ling**: Obyekt ichida qandaydir maydon (property) borligini tekshirish uchun `if(user.email)` emas, `if('email' in user)` dan foydalaning. Chunki birinchisi `email: ''` (bo'sh string) yoki `0` bo'lsa falsy bo'lib ishlamay qoladi.

---

## Xulosa

| Type Guard Usuli | Qachon ishlatiladi | Misol |
| --- | --- | --- |
| **`typeof`** | O'rnatilgan tiplar (`string`, `number`, `boolean`) uchun | `typeof x === "string"` |
| **`instanceof`** | Class lardan olingan objectlar uchun | `x instanceof Date` |
| **`in`** | Interface larni tekshirish va maydonni qidirish | `"role" in user` |
| **Custom (`is`)** | Murakkab ob'ektlarni va ko'p marta ishlatiladigan logikani o'rashda | `function isUser(x): x is User` |
| **Discriminated Union** | Har bir elementida o'zining "tag" belgisi bo'lganda (Eng xavfsiz yo'l) | `switch(action.type)` |

Keyingi bo'limda Advanced Patterns'ni o'rganamiz.
