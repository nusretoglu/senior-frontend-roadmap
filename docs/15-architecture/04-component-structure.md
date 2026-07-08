# Component Structure - Komponentlar Arxitekturasi

## Kirish

Component Structure - bu UI elementlarini qanday tashkil qilish, ular orasidagi aloqalarni qanday boshqarish va qayta ishlatiluvhanlikni qanday ta'minlash haqidagi prinsiplar to'plamidir. Yaxshi komponent arxitekturasi loyihaning barqarorligini, test qilish osonligini va jamoa samaradorligini oshiradi.

## Nazariy Asos

### Atomic Design Methodology

```
┌─────────────────────────────────────────────────────────────────┐
│                      ATOMIC DESIGN                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐ │
│   │  ATOMS  │→ │MOLECULES│→ │ORGANISMS│→ │TEMPLATES│→ │ PAGES │ │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘  └───────┘ │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ ATOMS                                                    │   │
│   │ • Button, Input, Label, Icon, Avatar                    │   │
│   │ • Eng kichik, bo'linmas UI element                      │   │
│   │ • Hech qanday business logic yo'q                       │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ MOLECULES                                                │   │
│   │ • SearchBox (Input + Button)                            │   │
│   │ • FormField (Label + Input + ErrorMessage)              │   │
│   │ • Card (Image + Title + Description)                    │   │
│   │ • Atomlardan tuzilgan oddiy kombinatsiyalar             │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ ORGANISMS                                                │   │
│   │ • Header (Logo + Navigation + SearchBox + UserMenu)     │   │
│   │ • ProductCard (Image + Info + AddToCart)                │   │
│   │ • CommentSection (Form + List + Pagination)             │   │
│   │ • Mustaqil, o'zini o'zi ta'minlovchi bo'limlar          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ TEMPLATES                                                │   │
│   │ • DashboardLayout, AuthLayout, BlogLayout               │   │
│   │ • Page struktura - organisms joylashuvi                 │   │
│   │ • Placeholder'lar bilan - data yo'q                     │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ PAGES                                                    │   │
│   │ • HomePage, ProductPage, CheckoutPage                   │   │
│   │ • Template + Real data                                  │   │
│   │ • Route components                                      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Types

| Tur | Vazifa | Ma'lumot | State | Side Effects |
|-----|--------|----------|-------|--------------|
| **Presentational** | UI render | Props orqali | Local UI only | Yo'q |
| **Container** | Data fetching | Store/API | App state | Ha |
| **Layout** | Page structure | Children | Minimal | Yo'q |
| **Utility** | Logic wrapper | Props/Slots | Depends | Ha |

### Component Responsibility Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│              COMPONENT RESPONSIBILITY MATRIX                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   LEVEL          │  RESPONSIBILITIES                            │
│   ───────────────┼────────────────────────────────────────────  │
│                  │                                               │
│   Page           │  • Route matching                            │
│                  │  • Page-level data fetching                  │
│                  │  • SEO meta tags                             │
│                  │  • Error boundaries                          │
│                  │                                               │
│   Container      │  • Business logic                            │
│                  │  • Store connections                         │
│                  │  • Data transformations                      │
│                  │  • Child orchestration                       │
│                  │                                               │
│   Presentational │  • UI rendering                              │
│                  │  • User interactions (emit)                  │
│                  │  • Local UI state only                       │
│                  │  • Accessibility                             │
│                  │                                               │
│   Base/UI        │  • Design system atoms                       │
│                  │  • Zero business logic                       │
│                  │  • Highly configurable                       │
│                  │  • Documented API                            │
│                  │                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Code Misollari

### 1. Atomic Components - Base Layer

```vue
<!-- ========================================
     ATOMS - Eng kichik UI elementlar
     ======================================== -->

<!-- components/base/BaseButton.vue -->
<template>
  <button
    :type="type"
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      {
        'base-button--loading': loading,
        'base-button--disabled': disabled,
        'base-button--full-width': fullWidth,
      }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="base-button__spinner">
      <BaseSpinner :size="spinnerSize" />
    </span>

    <span v-if="$slots.prefix" class="base-button__prefix">
      <slot name="prefix" />
    </span>

    <span class="base-button__content">
      <slot />
    </span>

    <span v-if="$slots.suffix" class="base-button__suffix">
      <slot name="suffix" />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import BaseSpinner from './BaseSpinner.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'ghost', 'link'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
  },
  type: {
    type: String,
    default: 'button',
  },
  loading: Boolean,
  disabled: Boolean,
  fullWidth: Boolean,
})

const spinnerSize = computed(() => {
  const sizeMap = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 }
  return sizeMap[props.size]
})
</script>

<style scoped>
.base-button {
  @apply inline-flex items-center justify-center gap-2
         font-medium rounded-lg transition-all duration-200
         focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.base-button--primary {
  @apply bg-blue-600 text-white
         hover:bg-blue-700 active:bg-blue-800
         focus:ring-blue-500;
}

.base-button--secondary {
  @apply bg-gray-100 text-gray-900
         hover:bg-gray-200 active:bg-gray-300
         focus:ring-gray-500;
}

.base-button--sm { @apply px-3 py-1.5 text-sm; }
.base-button--md { @apply px-4 py-2 text-base; }
.base-button--lg { @apply px-6 py-3 text-lg; }

.base-button--disabled {
  @apply opacity-50 cursor-not-allowed;
}

.base-button--loading {
  @apply relative;
}

.base-button--loading .base-button__content {
  @apply opacity-0;
}

.base-button__spinner {
  @apply absolute inset-0 flex items-center justify-center;
}
</style>

<!-- components/base/BaseInput.vue -->
<template>
  <div :class="['base-input', { 'base-input--error': error }]">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>

    <div class="base-input__wrapper">
      <span v-if="$slots.prefix" class="base-input__prefix">
        <slot name="prefix" />
      </span>

      <input
        :id="inputId"
        ref="inputRef"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="[
          'base-input__field',
          { 'base-input__field--with-prefix': $slots.prefix },
          { 'base-input__field--with-suffix': $slots.suffix },
        ]"
        v-bind="$attrs"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />

      <span v-if="$slots.suffix" class="base-input__suffix">
        <slot name="suffix" />
      </span>
    </div>

    <p v-if="error" class="base-input__error">{{ error }}</p>
    <p v-else-if="hint" class="base-input__hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref, computed, useId } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  error: String,
  hint: String,
  disabled: Boolean,
  readonly: Boolean,
  required: Boolean,
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputRef = ref(null)
const inputId = useId()

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Expose for parent access
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  inputElement: inputRef,
})
</script>
```

### 2. Molecules - Atom Combinations

```vue
<!-- ========================================
     MOLECULES - Atomlardan tuzilgan
     ======================================== -->

<!-- components/molecules/SearchBox.vue -->
<template>
  <form
    class="search-box"
    role="search"
    @submit.prevent="handleSubmit"
  >
    <BaseInput
      v-model="query"
      :placeholder="placeholder"
      type="search"
      aria-label="Qidiruv"
      @input="handleInput"
    >
      <template #prefix>
        <SearchIcon class="w-5 h-5 text-gray-400" />
      </template>

      <template v-if="query" #suffix>
        <button
          type="button"
          class="clear-button"
          @click="clear"
        >
          <XIcon class="w-4 h-4" />
        </button>
      </template>
    </BaseInput>

    <BaseButton
      v-if="showButton"
      type="submit"
      :loading="loading"
      :disabled="!query.trim()"
    >
      Qidirish
    </BaseButton>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { SearchIcon, XIcon } from '@/components/icons'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Qidirish...' },
  loading: Boolean,
  showButton: Boolean,
  debounce: { type: Number, default: 300 },
})

const emit = defineEmits(['update:modelValue', 'search'])

const query = ref(props.modelValue)

// Sync with parent
watch(() => props.modelValue, (newVal) => {
  query.value = newVal
})

// Debounced search for auto-search
const debouncedSearch = useDebounceFn((value) => {
  emit('search', value)
}, props.debounce)

function handleInput() {
  emit('update:modelValue', query.value)

  if (!props.showButton) {
    debouncedSearch(query.value)
  }
}

function handleSubmit() {
  emit('search', query.value)
}

function clear() {
  query.value = ''
  emit('update:modelValue', '')
  emit('search', '')
}
</script>

<!-- components/molecules/FormField.vue -->
<template>
  <div :class="['form-field', { 'form-field--inline': inline }]">
    <label
      v-if="label"
      :for="fieldId"
      class="form-field__label"
    >
      {{ label }}
      <span v-if="required" class="form-field__required">*</span>
    </label>

    <div class="form-field__control">
      <slot :id="fieldId" :error="error" :aria-describedby="errorId" />
    </div>

    <Transition name="fade">
      <p
        v-if="error"
        :id="errorId"
        class="form-field__error"
        role="alert"
      >
        {{ error }}
      </p>
    </Transition>

    <p v-if="hint && !error" class="form-field__hint">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { useId } from 'vue'

const props = defineProps({
  label: String,
  error: String,
  hint: String,
  required: Boolean,
  inline: Boolean,
})

const fieldId = useId()
const errorId = `${fieldId}-error`
</script>

<!-- components/molecules/UserAvatar.vue -->
<template>
  <div
    :class="[
      'user-avatar',
      `user-avatar--${size}`,
      { 'user-avatar--clickable': clickable }
    ]"
    @click="handleClick"
  >
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="alt"
      class="user-avatar__image"
      @error="imageError = true"
    />

    <span v-else class="user-avatar__fallback">
      {{ initials }}
    </span>

    <span
      v-if="status"
      :class="[
        'user-avatar__status',
        `user-avatar__status--${status}`
      ]"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src: String,
  name: { type: String, required: true },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
  },
  status: {
    type: String,
    validator: (v) => ['online', 'offline', 'away', 'busy'].includes(v),
  },
  clickable: Boolean,
})

const emit = defineEmits(['click'])

const imageError = ref(false)

const alt = computed(() => `${props.name} avatar`)

const initials = computed(() => {
  return props.name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

function handleClick() {
  if (props.clickable) {
    emit('click')
  }
}
</script>
```

### 3. Organisms - Complex UI Sections

```vue
<!-- ========================================
     ORGANISMS - Mustaqil UI bo'limlari
     ======================================== -->

<!-- components/organisms/ProductCard.vue -->
<template>
  <article class="product-card">
    <!-- Image Section -->
    <div class="product-card__image-wrapper">
      <img
        :src="product.image"
        :alt="product.name"
        class="product-card__image"
        loading="lazy"
      />

      <div v-if="product.discount" class="product-card__badge">
        -{{ product.discount }}%
      </div>

      <button
        class="product-card__favorite"
        :aria-label="isFavorite ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo\'shish'"
        @click="toggleFavorite"
      >
        <HeartIcon :class="{ 'fill-red-500': isFavorite }" />
      </button>
    </div>

    <!-- Content Section -->
    <div class="product-card__content">
      <div class="product-card__category">
        {{ product.category }}
      </div>

      <h3 class="product-card__title">
        <router-link :to="`/products/${product.id}`">
          {{ product.name }}
        </router-link>
      </h3>

      <div class="product-card__rating">
        <StarRating :value="product.rating" readonly />
        <span class="product-card__reviews">
          ({{ product.reviewCount }})
        </span>
      </div>

      <!-- Price Section -->
      <div class="product-card__price">
        <span v-if="product.discount" class="product-card__price-old">
          {{ formatPrice(product.originalPrice) }}
        </span>
        <span class="product-card__price-current">
          {{ formatPrice(product.price) }}
        </span>
      </div>
    </div>

    <!-- Actions Section -->
    <div class="product-card__actions">
      <BaseButton
        :loading="isAddingToCart"
        :disabled="!product.inStock"
        full-width
        @click="addToCart"
      >
        <template #prefix>
          <CartIcon class="w-5 h-5" />
        </template>
        {{ product.inStock ? 'Savatga qo\'shish' : 'Tugagan' }}
      </BaseButton>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useFavoritesStore } from '@/stores/favorites'
import { formatPrice } from '@/utils/format'
import BaseButton from '@/components/base/BaseButton.vue'
import StarRating from '@/components/molecules/StarRating.vue'
import { HeartIcon, CartIcon } from '@/components/icons'

const props = defineProps({
  product: {
    type: Object,
    required: true,
    validator: (p) => p.id && p.name && p.price !== undefined,
  },
})

const emit = defineEmits(['add-to-cart', 'toggle-favorite'])

const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

const isAddingToCart = ref(false)

const isFavorite = computed(() =>
  favoritesStore.isFavorite(props.product.id)
)

async function addToCart() {
  isAddingToCart.value = true

  try {
    await cartStore.addItem(props.product)
    emit('add-to-cart', props.product)
  } finally {
    isAddingToCart.value = false
  }
}

function toggleFavorite() {
  favoritesStore.toggle(props.product.id)
  emit('toggle-favorite', props.product, isFavorite.value)
}
</script>

<!-- components/organisms/CommentSection.vue -->
<template>
  <section class="comment-section" aria-labelledby="comments-title">
    <header class="comment-section__header">
      <h2 id="comments-title" class="comment-section__title">
        Izohlar ({{ totalComments }})
      </h2>

      <div class="comment-section__sort">
        <BaseSelect
          v-model="sortBy"
          :options="sortOptions"
          size="sm"
        />
      </div>
    </header>

    <!-- Add Comment Form -->
    <CommentForm
      v-if="canComment"
      class="comment-section__form"
      :loading="isSubmitting"
      @submit="handleSubmit"
    />

    <div v-else class="comment-section__login-prompt">
      <p>Izoh qoldirish uchun tizimga kiring</p>
      <BaseButton variant="secondary" @click="$router.push('/login')">
        Kirish
      </BaseButton>
    </div>

    <!-- Comments List -->
    <div class="comment-section__list">
      <TransitionGroup name="list">
        <CommentItem
          v-for="comment in displayedComments"
          :key="comment.id"
          :comment="comment"
          :can-reply="canComment"
          @reply="handleReply"
          @delete="handleDelete"
          @edit="handleEdit"
        />
      </TransitionGroup>

      <!-- Empty State -->
      <div v-if="!loading && comments.length === 0" class="comment-section__empty">
        <MessageSquareIcon class="w-16 h-16 text-gray-300" />
        <p>Hali izohlar yo'q</p>
        <p class="text-sm text-gray-500">Birinchi bo'lib izoh qoldiring!</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="comment-section__loading">
        <CommentSkeleton v-for="i in 3" :key="i" />
      </div>
    </div>

    <!-- Load More -->
    <div v-if="hasMore" class="comment-section__load-more">
      <BaseButton
        variant="ghost"
        :loading="loadingMore"
        @click="loadMore"
      >
        Ko'proq ko'rsatish
      </BaseButton>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCommentsStore } from '@/stores/comments'
import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'
import CommentSkeleton from './CommentSkeleton.vue'

const props = defineProps({
  entityType: { type: String, required: true }, // 'product', 'post', etc.
  entityId: { type: String, required: true },
})

const authStore = useAuthStore()
const commentsStore = useCommentsStore()

const sortBy = ref('newest')
const isSubmitting = ref(false)
const loadingMore = ref(false)

const sortOptions = [
  { value: 'newest', label: 'Eng yangi' },
  { value: 'oldest', label: 'Eng eski' },
  { value: 'popular', label: 'Ommabop' },
]

const canComment = computed(() => authStore.isAuthenticated)

const { comments, loading, hasMore, totalComments } = commentsStore.useComments(
  props.entityType,
  props.entityId
)

const displayedComments = computed(() => {
  const sorted = [...comments.value]

  switch (sortBy.value) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    case 'popular':
      return sorted.sort((a, b) => b.likes - a.likes)
    default: // newest
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
})

async function handleSubmit(content) {
  isSubmitting.value = true

  try {
    await commentsStore.addComment({
      entityType: props.entityType,
      entityId: props.entityId,
      content,
    })
  } finally {
    isSubmitting.value = false
  }
}

async function handleReply(commentId, content) {
  await commentsStore.addReply(commentId, content)
}

async function handleDelete(commentId) {
  await commentsStore.deleteComment(commentId)
}

async function handleEdit(commentId, content) {
  await commentsStore.updateComment(commentId, content)
}

async function loadMore() {
  loadingMore.value = true
  try {
    await commentsStore.loadMore()
  } finally {
    loadingMore.value = false
  }
}
</script>
```

### 4. Container vs Presentational Pattern

```vue
<!-- ========================================
     CONTAINER - Data/Logic bilan shug'ullanadi
     ======================================== -->

<!-- containers/UserProfileContainer.vue -->
<template>
  <UserProfileView
    v-if="user"
    :user="user"
    :is-own-profile="isOwnProfile"
    :loading-stats="loadingStats"
    :stats="userStats"
    @follow="handleFollow"
    @message="handleMessage"
    @edit-profile="handleEditProfile"
  />

  <UserProfileSkeleton v-else-if="loading" />

  <ErrorState
    v-else-if="error"
    :message="error"
    @retry="fetchUser"
  />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUser } from '@/composables/useUser'
import { useUserStats } from '@/composables/useUserStats'
import UserProfileView from './UserProfileView.vue'
import UserProfileSkeleton from './UserProfileSkeleton.vue'
import ErrorState from '@/components/common/ErrorState.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Data fetching
const {
  user,
  loading,
  error,
  fetch: fetchUser,
  followUser,
} = useUser(route.params.userId)

const {
  stats: userStats,
  loading: loadingStats,
} = useUserStats(route.params.userId)

// Computed
const isOwnProfile = computed(() =>
  authStore.user?.id === route.params.userId
)

// Handlers - Business logic
async function handleFollow() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  await followUser()
}

function handleMessage() {
  router.push({
    name: 'messages',
    params: { recipientId: user.value.id },
  })
}

function handleEditProfile() {
  router.push({ name: 'profile-edit' })
}

// Lifecycle
onMounted(fetchUser)
</script>

<!-- ========================================
     PRESENTATIONAL - Faqat UI render qiladi
     ======================================== -->

<!-- components/UserProfileView.vue -->
<template>
  <article class="user-profile">
    <!-- Header -->
    <header class="user-profile__header">
      <div class="user-profile__cover">
        <img v-if="user.coverImage" :src="user.coverImage" alt="" />
      </div>

      <UserAvatar
        :src="user.avatar"
        :name="user.name"
        size="xl"
        class="user-profile__avatar"
      />
    </header>

    <!-- Info Section -->
    <section class="user-profile__info">
      <h1 class="user-profile__name">{{ user.name }}</h1>

      <p v-if="user.bio" class="user-profile__bio">
        {{ user.bio }}
      </p>

      <div class="user-profile__meta">
        <span v-if="user.location">
          <MapPinIcon class="w-4 h-4" />
          {{ user.location }}
        </span>

        <span>
          <CalendarIcon class="w-4 h-4" />
          {{ formatDate(user.joinedAt) }} da qo'shilgan
        </span>
      </div>
    </section>

    <!-- Stats Section -->
    <section v-if="stats" class="user-profile__stats">
      <div class="stat-item">
        <span class="stat-value">{{ formatNumber(stats.posts) }}</span>
        <span class="stat-label">Post</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ formatNumber(stats.followers) }}</span>
        <span class="stat-label">Followers</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ formatNumber(stats.following) }}</span>
        <span class="stat-label">Following</span>
      </div>
    </section>

    <LoadingBar v-if="loadingStats" />

    <!-- Actions Section -->
    <section class="user-profile__actions">
      <template v-if="isOwnProfile">
        <BaseButton variant="secondary" @click="emit('edit-profile')">
          <template #prefix>
            <EditIcon class="w-4 h-4" />
          </template>
          Profilni tahrirlash
        </BaseButton>
      </template>

      <template v-else>
        <BaseButton
          :variant="user.isFollowing ? 'secondary' : 'primary'"
          @click="emit('follow')"
        >
          {{ user.isFollowing ? 'Unfollow' : 'Follow' }}
        </BaseButton>

        <BaseButton variant="ghost" @click="emit('message')">
          <MessageIcon class="w-4 h-4" />
        </BaseButton>
      </template>
    </section>
  </article>
</template>

<script setup>
// Pure presentational - no business logic, no data fetching
import { formatDate, formatNumber } from '@/utils/format'
import UserAvatar from '@/components/molecules/UserAvatar.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import LoadingBar from '@/components/common/LoadingBar.vue'

defineProps({
  user: { type: Object, required: true },
  stats: Object,
  isOwnProfile: Boolean,
  loadingStats: Boolean,
})

const emit = defineEmits(['follow', 'message', 'edit-profile'])
</script>
```

### 5. Compound Components Pattern

```vue
<!-- ========================================
     COMPOUND COMPONENTS - Related components working together
     ======================================== -->

<!-- components/compound/Tabs/TabsRoot.vue -->
<template>
  <div class="tabs" :class="{ 'tabs--vertical': vertical }">
    <slot />
  </div>
</template>

<script setup>
import { provide, ref, readonly } from 'vue'
import { TABS_INJECTION_KEY } from './constants'

const props = defineProps({
  modelValue: { type: String, required: true },
  vertical: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const activeTab = ref(props.modelValue)

function setActiveTab(value) {
  activeTab.value = value
  emit('update:modelValue', value)
}

provide(TABS_INJECTION_KEY, {
  activeTab: readonly(activeTab),
  setActiveTab,
  vertical: props.vertical,
})
</script>

<!-- components/compound/Tabs/TabsList.vue -->
<template>
  <div
    class="tabs-list"
    role="tablist"
    :aria-orientation="context.vertical ? 'vertical' : 'horizontal'"
  >
    <slot />
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { TABS_INJECTION_KEY } from './constants'

const context = inject(TABS_INJECTION_KEY)
</script>

<!-- components/compound/Tabs/TabsTrigger.vue -->
<template>
  <button
    :id="`tab-${value}`"
    role="tab"
    :aria-selected="isActive"
    :aria-controls="`tabpanel-${value}`"
    :tabindex="isActive ? 0 : -1"
    :class="['tabs-trigger', { 'tabs-trigger--active': isActive }]"
    @click="context.setActiveTab(value)"
    @keydown="handleKeydown"
  >
    <slot />
  </button>
</template>

<script setup>
import { inject, computed } from 'vue'
import { TABS_INJECTION_KEY } from './constants'

const props = defineProps({
  value: { type: String, required: true },
})

const context = inject(TABS_INJECTION_KEY)

const isActive = computed(() => context.activeTab.value === props.value)

function handleKeydown(event) {
  // Keyboard navigation
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    // Implementation for keyboard navigation
  }
}
</script>

<!-- components/compound/Tabs/TabsContent.vue -->
<template>
  <div
    v-show="isActive"
    :id="`tabpanel-${value}`"
    role="tabpanel"
    :aria-labelledby="`tab-${value}`"
    :tabindex="isActive ? 0 : -1"
    class="tabs-content"
  >
    <slot />
  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
import { TABS_INJECTION_KEY } from './constants'

const props = defineProps({
  value: { type: String, required: true },
})

const context = inject(TABS_INJECTION_KEY)

const isActive = computed(() => context.activeTab.value === props.value)
</script>

<!-- components/compound/Tabs/index.js -->
export { default as Tabs } from './TabsRoot.vue'
export { default as TabsList } from './TabsList.vue'
export { default as TabsTrigger } from './TabsTrigger.vue'
export { default as TabsContent } from './TabsContent.vue'

<!-- ========================================
     Usage - Clean, declarative API
     ======================================== -->

<template>
  <Tabs v-model="activeTab">
    <TabsList>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="analytics">Analytics</TabsTrigger>
      <TabsTrigger value="settings">Settings</TabsTrigger>
    </TabsList>

    <TabsContent value="overview">
      <OverviewPanel />
    </TabsContent>

    <TabsContent value="analytics">
      <AnalyticsPanel />
    </TabsContent>

    <TabsContent value="settings">
      <SettingsPanel />
    </TabsContent>
  </Tabs>
</template>

<script setup>
import { ref } from 'vue'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/compound/Tabs'

const activeTab = ref('overview')
</script>
```

### 6. Component Communication Patterns

```vue
<!-- ========================================
     PATTERN 1: Props Down, Events Up
     ======================================== -->

<!-- Parent -->
<template>
  <ChildComponent
    :value="data"
    :loading="isLoading"
    @update="handleUpdate"
    @error="handleError"
  />
</template>

<!-- Child -->
<script setup>
const props = defineProps({
  value: { type: Object, required: true },
  loading: Boolean,
})

const emit = defineEmits({
  update: (payload) => typeof payload === 'object',
  error: (message) => typeof message === 'string',
})

function handleAction() {
  emit('update', { ...props.value, updated: true })
}
</script>

<!-- ========================================
     PATTERN 2: v-model for Two-way Binding
     ======================================== -->

<!-- Parent -->
<template>
  <ColorPicker v-model="selectedColor" v-model:opacity="opacity" />
</template>

<!-- ColorPicker.vue -->
<script setup>
const props = defineProps({
  modelValue: { type: String, required: true },
  opacity: { type: Number, default: 100 },
})

const emit = defineEmits(['update:modelValue', 'update:opacity'])

const color = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const opacityValue = computed({
  get: () => props.opacity,
  set: (value) => emit('update:opacity', value),
})
</script>

<!-- ========================================
     PATTERN 3: Provide/Inject for Deep Props
     ======================================== -->

<!-- FormProvider.vue -->
<script setup>
import { provide, reactive, readonly } from 'vue'
import { FORM_INJECTION_KEY } from './constants'

const props = defineProps({
  disabled: Boolean,
  readonly: Boolean,
  size: { type: String, default: 'md' },
})

const formState = reactive({
  disabled: props.disabled,
  readonly: props.readonly,
  size: props.size,
})

provide(FORM_INJECTION_KEY, readonly(formState))
</script>

<!-- Deep child component -->
<script setup>
import { inject } from 'vue'
import { FORM_INJECTION_KEY } from './constants'

const formContext = inject(FORM_INJECTION_KEY, {
  disabled: false,
  readonly: false,
  size: 'md',
})

// Now any form element can access form-wide settings
</script>

<!-- ========================================
     PATTERN 4: Event Bus for Siblings (use sparingly)
     ======================================== -->

// eventBus.js - using mitt
import mitt from 'mitt'
export const eventBus = mitt()

// ComponentA.vue
import { eventBus } from '@/lib/eventBus'

function notifySiblings() {
  eventBus.emit('data-updated', { id: 123 })
}

// ComponentB.vue
import { onMounted, onUnmounted } from 'vue'
import { eventBus } from '@/lib/eventBus'

function handleDataUpdate(data) {
  console.log('Data updated:', data)
}

onMounted(() => {
  eventBus.on('data-updated', handleDataUpdate)
})

onUnmounted(() => {
  eventBus.off('data-updated', handleDataUpdate)
})
```

## Real-World Case Study

### Case: Design System Implementation

**Vaziyat:** Kompaniyada 3 ta mahsulot bir xil brend ostida. Har birida o'zining UI komponentlari. Dizayn inkonsistentligi va takroriy kod.

**Yechim:**

```
Design System Architecture:
────────────────────────────────────────

packages/
├── design-tokens/          # Layer 1: Design foundations
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   └── build.js            # Token compiler

├── vue-components/         # Layer 2: Vue implementation
│   ├── base/               # Atoms
│   │   ├── Button/
│   │   │   ├── Button.vue
│   │   │   ├── Button.test.ts
│   │   │   ├── Button.stories.ts
│   │   │   └── index.ts
│   │   ├── Input/
│   │   └── ...
│   │
│   ├── compound/           # Molecules & Organisms
│   │   ├── Form/
│   │   ├── DataTable/
│   │   └── ...
│   │
│   └── index.ts            # Public API

└── docs/                   # Layer 3: Documentation
    └── storybook/

Benefits:
├── Single source of truth
├── Consistent UX across products
├── Faster development (70% less UI code)
├── Easier testing
└── Brand compliance guaranteed
```

## Interview Savollari

### 1. Junior-Middle Level
**Savol:** Atomic Design metodologiyasining asosiy qatlamlari nimalar?

**Javob:**
1. **Atoms** - Eng kichik UI elementlar (Button, Input)
2. **Molecules** - Atom kombinatsiyalari (SearchBox = Input + Button)
3. **Organisms** - Mustaqil UI bo'limlari (Header, ProductCard)
4. **Templates** - Page struktura (Layout)
5. **Pages** - Tayyor sahifalar (real data bilan)

### 2. Middle-Senior Level
**Savol:** Container va Presentational components o'rtasidagi farq nima? Qachon ajratish kerak?

**Javob:**
```
CONTAINER (Smart)          PRESENTATIONAL (Dumb)
├── Store connection       ├── Props qabul qiladi
├── API calls              ├── Events emit qiladi
├── Business logic         ├── Faqat UI render
├── Data transformation    ├── Local UI state only
└── Child orchestration    └── Highly reusable

Qachon ajratish:
├── Komponent 2+ joyda ishlatilsa
├── Testing osonlashtirish kerak
├── UI logikadan ajratilishi kerak
└── Team o'rtasida vazifa taqsimoti
```

### 3. Senior Level
**Savol:** Compound Components pattern'ning afzalliklari va kamchiliklari?

**Javob:**
```javascript
// Afzalliklar:
// 1. Declarative API
<Tabs>
  <TabsList>
    <TabsTrigger>Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent>Content 1</TabsContent>
</Tabs>

// 2. Flexibility - komponentlar almashtirish mumkin
// 3. Implicit state sharing via provide/inject
// 4. Separation of concerns

// Kamchiliklari:
// 1. Learning curve
// 2. Child komponentlar bog'liq
// 3. Debugging murakkab (inject errors)
// 4. Performance - context updates

// Qachon ishlatish:
// Complex, related komponentlar: Tabs, Accordion, Menu, Dialog
```

### 4. Senior/Lead Level
**Savol:** Komponent library'ni qanday versiyalaysiz va yangilaysiz?

**Javob:**
```
1. SEMANTIC VERSIONING
   ├── MAJOR: Breaking changes
   ├── MINOR: New features, backward compatible
   └── PATCH: Bug fixes

2. DEPRECATION STRATEGY
   ├── Console warnings (1 major version)
   ├── Migration guide
   ├── Codemod scripts
   └── Remove in next major

3. CHANGE MANAGEMENT
   ├── RFC process for breaking changes
   ├── Alpha/Beta releases
   ├── Canary releases for testing
   └── Changelog automation

4. BACKWARD COMPATIBILITY
   ├── Prop aliases for renamed props
   ├── Event name aliases
   ├── Default value preservation
   └── Optional new features
```

### 5. Architect Level
**Savol:** Micro-frontend arxitekturasida komponentlarni qanday share qilasiz?

**Javob:**
```
Options:
───────────────────────────────────────────

1. NPM PACKAGE
   + Versioned, tested, documented
   - Rebuild all MFEs on update
   - Version conflicts

2. MODULE FEDERATION (Webpack 5)
   + Runtime sharing
   + No rebuild needed
   + Singleton components
   - Build complexity
   - Runtime errors possible

3. WEB COMPONENTS
   + Framework agnostic
   + Browser native
   + Shadow DOM isolation
   - Limited Vue/React features
   - Bundle size

Recommendation:
├── Core UI Kit → Module Federation
├── Design Tokens → NPM
├── Complex widgets → per-MFE
└── Shared types → NPM
```

## Senior vs Middle Farqi

| Aspekt | Middle | Senior |
|--------|--------|--------|
| **Component design** | Working components | Reusable, documented API |
| **Patterns** | Knows patterns | Chooses right pattern for context |
| **Abstraction** | Creates when needed | Creates at right level |
| **Testing** | Tests happy path | Tests edge cases, accessibility |
| **Documentation** | Basic props docs | Storybook, usage examples |
| **Performance** | Works | Optimized (memo, lazy loading) |

### Middle Developer
- Atomic design tushunadi
- Container/Presentational pattern ishlatadi
- Props/Events bilan muloqot
- Composables yozadi

### Senior Developer
- Component API dizayni
- Compound components pattern
- Design system arxitekturasi
- Version va migration strategiyalari
- Cross-team component standardlari
- Performance optimization patterns

---

> **Eslatma:** Yaxshi komponent - bu kod emas, balki kontrakt. Props - input, Events - output, Slots - customization points.
