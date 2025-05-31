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
      // console.warn("NavBar element not found or offsetHeight is not available.");
      // 考慮設定一個預設的 paddingTop，或者讓用戶知道出現了問題
      mainContentRef.value.style.paddingTop = '140px'; // 預設值，對應導航欄總高度(90+50)
    }
  } else {
    // Fallback if refs are not available
    if (mainContentRef.value) {
        mainContentRef.value.style.paddingTop = '140px'; // 預設值
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
  <div class="min-h-screen wiki-theme">
    <NavBar ref="navBarRef" />
    <main class="main-content" ref="mainContentRef">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* 主內容區域 - 動態適應導航欄高度 */
.main-content {
  max-width: 72rem; /* max-w-6xl equivalent */
  margin: 0 auto;
  padding-left: 0.75rem; /* 手機版較小的間距 */
  padding-right: 0.75rem;
  padding-bottom: 1rem; /* 保持底部 padding */
  /* paddingTop is now set dynamically */
}

/* 響應式設計 */
@media (min-width: 640px) {
  .main-content {
    padding-left: 1rem; /* 桌面版恢復正常間距 */
    padding-right: 1rem;
  }
}
</style>
