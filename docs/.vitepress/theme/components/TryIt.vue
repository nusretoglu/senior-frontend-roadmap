<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** Playground turi: 'js' | 'vue' | 'ts' */
  type?: 'js' | 'vue' | 'ts'
  /** Kod matni (URL-safe encoded bo'lishi kerak emas) */
  code?: string
  /** Tashqi URL (to'g'ridan-to'g'ri link) */
  href?: string
  /** Button matni */
  label?: string
}>()

const playgroundUrl = computed(() => {
  if (props.href) return props.href

  if (!props.code) return ''

  const encoded = encodeURIComponent(props.code)

  switch (props.type) {
    case 'vue':
      // Vue SFC Playground
      return `https://play.vuejs.org/#eNp${btoa(props.code)}`
    case 'ts':
      // TypeScript Playground
      return `https://www.typescriptlang.org/play?#code/${encoded}`
    case 'js':
    default:
      // StackBlitz - JS
      return `https://stackblitz.com/edit/js-playground?file=index.js`
  }
})

const buttonLabel = computed(() => {
  if (props.label) return props.label

  switch (props.type) {
    case 'vue': return "Vue Playground'da ochish"
    case 'ts': return "TS Playground'da ochish"
    default: return "Sinab ko'rish"
  }
})

const icon = computed(() => {
  switch (props.type) {
    case 'vue': return '⚡'
    case 'ts': return '🔷'
    default: return '▶️'
  }
})
</script>

<template>
  <a
    v-if="playgroundUrl || href"
    :href="playgroundUrl || href"
    target="_blank"
    rel="noopener noreferrer"
    class="try-it-btn"
  >
    <span class="try-it-icon">{{ icon }}</span>
    <span class="try-it-label">{{ buttonLabel }}</span>
    <svg class="try-it-arrow" viewBox="0 0 24 24" width="14" height="14">
      <path fill="currentColor" d="M5 12h14m-7-7 7 7-7 7"/>
    </svg>
  </a>
</template>

<style scoped>
.try-it-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 16px;
  padding: 8px 14px;
  background: linear-gradient(135deg, var(--vp-c-bg-soft) 0%, var(--vp-c-bg-mute) 100%);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-decoration: none !important;
  transition: all 0.2s ease;
  cursor: pointer;
}

.try-it-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
}

.try-it-icon {
  font-size: 1rem;
}

.try-it-arrow {
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s ease;
}

.try-it-btn:hover .try-it-arrow {
  opacity: 1;
  transform: translateX(0);
}

.try-it-arrow path {
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

/* Dark mode */
.dark .try-it-btn {
  background: linear-gradient(135deg, var(--slate-900) 0%, var(--slate-800) 100%);
}

.dark .try-it-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  box-shadow: 0 2px 12px rgba(99, 102, 241, 0.2);
}
</style>
