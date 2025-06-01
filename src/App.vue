<script setup lang="ts">
import NavBar from './components/layout/NavBar.vue'
import MobileNavigation from './components/layout/MobileNavigation.vue'
import { ref, onMounted, onUpdated, nextTick, onBeforeUnmount } from 'vue'

const navBarRef = ref<InstanceType<typeof NavBar> | null>(null)
const mainContentRef = ref<HTMLElement | null>(null)

const updateMainContentMargin = async () => {
  await nextTick()
  if (mainContentRef.value) {
    const isMobile = window.innerWidth <= 768
    if (isMobile) {
      // 移動端：有80px的標題高度
      mainContentRef.value.style.paddingTop = '80px'
      mainContentRef.value.style.paddingBottom = 'calc(var(--space-2xl) + 80px)' // 考慮底部導航高度
    } else {
      // 桌面端：使用原有邏輯
      if (navBarRef.value) {
        const navBarElement = navBarRef.value.$el as HTMLElement
        if (navBarElement && typeof navBarElement.offsetHeight === 'number') {
          const navBarHeight = navBarElement.offsetHeight
          mainContentRef.value.style.paddingTop = `${navBarHeight}px`
        } else {
          mainContentRef.value.style.paddingTop = '160px'
        }
      } else {
        mainContentRef.value.style.paddingTop = '160px'
      }
      mainContentRef.value.style.paddingBottom = 'var(--space-2xl)'
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
    <!-- 桌面版導航 -->
    <NavBar ref="navBarRef" class="desktop-nav" />
    
    <!-- 移動端導航 -->
    <MobileNavigation class="mobile-nav" />
    
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
  overflow: hidden;
  font-family: var(--font-body);
}

/* 導航顯示控制 */
.desktop-nav {
  display: none;
}

.mobile-nav {
  display: block;
}

@media (min-width: 769px) {
  .desktop-nav {
    display: block;
  }
  
  .mobile-nav {
    display: none;
  }
}

/* 在移動端確保桌面導航完全隱藏 */
@media (max-width: 768px) {
  .desktop-nav {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
  }
  
  .mobile-nav {
    display: block !important;
  }
}

/* 主內容區域 */
.main-content {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding-left: var(--space-md);
  padding-right: var(--space-md);
  padding-bottom: var(--space-2xl);
  position: relative;
  z-index: 5;
  min-height: calc(100vh - 160px);
  min-height: calc(100dvh - 160px); /* 使用動態視窗高度 */
  overflow-x: hidden;
  box-sizing: border-box;
  /* 改善滾動體驗 */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  /* 防止橫向滾動 */
  width: 100%;
  max-width: 100%;
  /* 確保完全居中且對稱 */
  margin-left: auto;
  margin-right: auto;
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

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(5deg);
  }
  66% {
    transform: translateY(10px) rotate(-3deg);
  }
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

/* 響應式設計優化 */
@media (min-width: 320px) {
  .main-content {
    padding-left: var(--space-sm);
    padding-right: var(--space-sm);
    margin-left: auto;
    margin-right: auto;
  }
}

@media (min-width: 480px) {
  .main-content {
    padding-left: var(--space-md);
    padding-right: var(--space-md);
    margin-left: auto;
    margin-right: auto;
  }
}

@media (min-width: 768px) {
  .main-content {
    padding-left: var(--space-lg);
    padding-right: var(--space-lg);
    min-height: calc(100vh - 160px);
    margin-left: auto;
    margin-right: auto;
  }
}

@media (min-width: 1024px) {
  .main-content {
    padding-left: var(--space-xl);
    padding-right: var(--space-xl);
    margin-left: auto;
    margin-right: auto;
  }
}

@media (min-width: 1280px) {
  .main-content {
    padding-left: var(--space-2xl);
    padding-right: var(--space-2xl);
    margin-left: auto;
    margin-right: auto;
  }
}

/* 移動端優化 */
@media (max-width: 768px) {
  .main-content {
    padding-bottom: calc(var(--space-2xl) + 60px); /* 考慮底部導航 */
    min-height: calc(100vh - 120px);
    min-height: calc(100dvh - 120px);
    /* 確保移動端滾動順暢 */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    overscroll-behavior-x: none; /* 防止橫向彈跳 */
  }
  
  .background-decoration {
    opacity: 0.2;
  }
  
  .decoration-element {
    opacity: 0.5;
  }
  
  .element-1 {
    width: 200px;
    height: 200px;
    top: -100px;
    right: -100px;
  }
  
  .element-2 {
    width: 150px;
    height: 150px;
    bottom: 15%;
    left: -75px;
  }
  
  .element-3 {
    width: 100px;
    height: 100px;
    top: 60%;
    right: 5%;
  }
}

@media (max-width: 480px) {
  .main-content {
    min-height: calc(100vh - 100px);
    min-height: calc(100dvh - 100px);
  }
  
  .element-1 {
    width: 120px;
    height: 120px;
  }
  
  .element-2 {
    width: 100px;
    height: 100px;
  }
  
  .element-3 {
    width: 80px;
    height: 80px;
  }
}

/* 橫向模式優化 */
@media (max-width: 768px) and (orientation: landscape) {
  .main-content {
    padding-top: 50px !important;
    padding-bottom: 60px;
    min-height: calc(100vh - 100px);
    min-height: calc(100dvh - 100px);
  }
  
  .background-decoration {
    opacity: 0.1;
  }
}

/* 觸控設備優化 */
@media (hover: none) and (pointer: coarse) {
  .main-content {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    overscroll-behavior-x: none;
    /* 改善觸控滾動性能 */
    will-change: scroll-position;
  }
}

/* 減少動畫效果 */
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .page-enter-from,
  .page-leave-to {
    transform: none;
  }
  
  .decoration-element {
    animation: none;
  }
  
  @keyframes float {
    0%, 100% {
      transform: none;
    }
  }
}

/* 高對比度模式 */
@media (prefers-contrast: high) {
  .mountain-app {
    background: white;
  }
  
  .background-decoration {
    display: none;
  }
  
  .main-content {
    background: white;
    color: black;
  }
}

/* 列印模式 */
@media print {
  .desktop-nav,
  .mobile-nav,
  .background-decoration {
    display: none !important;
  }
  
  .main-content {
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
    min-height: auto !important;
  }
  
  .page-enter-active,
  .page-leave-active {
    transition: none !important;
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

/* 完全隱藏滾動條 */
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
  display: none;
}

::-webkit-scrollbar-track {
  background: transparent;
  display: none;
}

::-webkit-scrollbar-thumb {
  background: transparent;
  display: none;
}

::-webkit-scrollbar-thumb:hover {
  background: transparent;
  display: none;
}

/* Focus 樣式改進 */
*:focus-visible {
  outline: 2px solid var(--mountain-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* 無障礙隱藏 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 支援動態視窗單位 */
@supports (height: 100dvh) {
  .main-content {
    min-height: calc(100dvh - 160px);
  }
  
  @media (max-width: 768px) {
    .main-content {
      min-height: calc(100dvh - 120px);
    }
  }
  
  @media (max-width: 480px) {
    .main-content {
      min-height: calc(100dvh - 100px);
    }
  }
  
  @media (max-width: 768px) and (orientation: landscape) {
    .main-content {
      min-height: calc(100dvh - 100px);
    }
  }
}

/* 防止內容溢出 */
.main-content > * {
  max-width: 100%;
  overflow-x: hidden;
}

/* 確保所有子元素不會造成橫向滾動 */
.main-content img,
.main-content video,
.main-content iframe,
.main-content table {
  max-width: 100%;
  height: auto;
}

.main-content table {
  overflow-x: auto;
  display: block;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .main-content table {
    font-size: 0.875rem;
  }
}
</style>
