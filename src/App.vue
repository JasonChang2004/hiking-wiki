<script setup lang="ts">
import NavBar from './components/layout/NavBar.vue'
import { ref, onMounted, onUpdated, nextTick, onBeforeUnmount } from 'vue'

const navBarRef = ref<InstanceType<typeof NavBar> | null>(null)
const mainContentRef = ref<HTMLElement | null>(null)

const updateMainContentMargin = async () => {
  await nextTick() // 等待 DOM 更新完成
  if (navBarRef.value && mainContentRef.value) {
    // 確認 navBarRef.value.$el 存在並且是 HTMLElement
    const navBarElement = navBarRef.value.$el as HTMLElement
    if (navBarElement && typeof navBarElement.offsetHeight === 'number') {
      const navBarHeight = navBarElement.offsetHeight
      mainContentRef.value.style.paddingTop = `${navBarHeight}px` // 緊貼導航欄，無額外緩衝
    } else {
      // Fallback or error handling if navBarElement is not as expected
      // 更新預設值以匹配新的導航欄高度 (100px header + 60px nav)
      mainContentRef.value.style.paddingTop = '160px'; // 預設值，對應導航欄總高度
    }
  } else {
    // Fallback if refs are not available
    if (mainContentRef.value) {
        mainContentRef.value.style.paddingTop = '160px'; // 預設值
    }
  }
}

onMounted(() => {
  updateMainContentMargin()
  window.addEventListener('resize', updateMainContentMargin)
})

onUpdated(() => {
  updateMainContentMargin()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMainContentMargin)
})
</script>

<template>
  <div class="mountain-app">
    <NavBar ref="navBarRef" />
    <main class="main-content" ref="mainContentRef">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 背景裝飾元素 -->
    <div class="background-decoration">
      <div class="decoration-element element-1"></div>
      <div class="decoration-element element-2"></div>
      <div class="decoration-element element-3"></div>
    </div>
  </div>
</template>

<style>
/* 全局樣式重置與山林主題應用 */
.mountain-app {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* 主內容區域 - 動態適應導航欄高度 */
.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 0.75rem; /* 手機版較小的間距 */
  padding-right: 0.75rem;
  padding-bottom: 2rem; /* 保持底部 padding */
  position: relative;
  z-index: 5;
  /* paddingTop is now set dynamically */
}

/* 背景裝飾 */
.background-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.4;
}

.decoration-element {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.1) 0%,
    rgba(14, 165, 233, 0.1) 50%,
    rgba(249, 115, 22, 0.1) 100%
  );
  animation: float 20s ease-in-out infinite;
}

.element-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.element-2 {
  width: 200px;
  height: 200px;
  bottom: 10%;
  left: -100px;
  animation-delay: -7s;
}

.element-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 10%;
  animation-delay: -14s;
}

/* 頁面轉場動畫 */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 響應式設計 */
@media (min-width: 640px) {
  .main-content {
    padding-left: 1rem; /* 桌面版恢復正常間距 */
    padding-right: 1rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  .decoration-element {
    opacity: 0.2;
  }
  
  .element-1 {
    width: 200px;
    height: 200px;
  }
  
  .element-2 {
    width: 150px;
    height: 150px;
  }
  
  .element-3 {
    width: 100px;
    height: 100px;
  }
}

/* 滾動行為優化 */
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
  
  .decoration-element {
    animation: none;
  }
}

/* 選取文字的顏色 */
::selection {
  background-color: rgba(34, 197, 94, 0.2);
  color: var(--stone-dark);
}

::-moz-selection {
  background-color: rgba(34, 197, 94, 0.2);
  color: var(--stone-dark);
}

/* 聚焦狀態的無障礙設計 */
:focus-visible {
  outline: 2px solid var(--mountain-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* 改善文字清晰度 */
* {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
