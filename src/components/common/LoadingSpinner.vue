<template>
  <div class="loading-container" :class="containerClass">
    <div class="loading-spinner" :class="spinnerClass">
      <svg
        class="animate-spin"
        :class="sizeClass"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <p v-if="message" class="loading-message" :class="messageClass">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  overlay?: boolean
  fullScreen?: boolean
  color?: 'blue' | 'gray' | 'green' | 'red'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  overlay: false,
  fullScreen: false,
  color: 'blue'
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  return sizes[props.size]
})

const containerClass = computed(() => {
  let classes = ['flex', 'flex-col', 'items-center', 'justify-center']
  
  if (props.fullScreen) {
    classes.push('fixed', 'inset-0', 'z-50')
  }
  
  if (props.overlay) {
    classes.push('bg-white', 'bg-opacity-90')
  }
  
  return classes.join(' ')
})

const spinnerClass = computed(() => {
  const colors = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600'
  }
  return colors[props.color]
})

const messageClass = computed(() => {
  const colors = {
    blue: 'text-blue-700',
    gray: 'text-gray-700',
    green: 'text-green-700',
    red: 'text-red-700'
  }
  return `mt-3 text-sm font-medium ${colors[props.color]}`
})
</script>

<style scoped>
.loading-container {
  min-height: 60px;
}

.loading-message {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 無障礙動畫設定 */
@media (prefers-reduced-motion: reduce) {
  .animate-spin {
    animation: none;
  }
  
  .loading-message {
    animation: none;
  }
}
</style> 