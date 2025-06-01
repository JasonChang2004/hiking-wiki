<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue' // Added onUnmounted
import { auth } from '@/firebase' // Corrected path
import { onAuthStateChanged, type User } from 'firebase/auth'
import { checkIsAdmin } from '@/firebase/authUtils' // Corrected path
import ReviewArticles from '@/components/admin/ReviewArticles.vue' // Corrected path

const isAdmin = ref<boolean | null>(null)
const currentUser = ref<User | null>(null);
const isLoadingAuth = ref(true);
let unsubscribeAuth: (() => void) | null = null; // Declare unsubscribeAuth

onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, async (user) => { // Assign to unsubscribeAuth
    currentUser.value = user;
    if (user) {
      try {
        const result = await checkIsAdmin(user.uid);
        isAdmin.value = result;
      } catch (error) {
        console.error("Error checking admin status on mount:", error);
        isAdmin.value = false;
      }
    } else {
      isAdmin.value = false;
    }
    isLoadingAuth.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribeAuth) {
    unsubscribeAuth(); // Call unsubscribeAuth if it exists
  }
});
</script>

<template>
  <div class="mountain-review">
    <div class="container">
      <!-- 頁面標題區塊 -->
      <div class="review-header">
        <div class="header-content">
          <h1 class="review-title">
            <span class="title-icon">📋</span>
            內容審核
          </h1>
          <p class="review-description">
            審核登山知識文章，確保內容品質與準確性
          </p>
        </div>
      </div>

      <!-- 載入中狀態 -->
      <div v-if="isLoadingAuth || isAdmin === null" class="loading-section">
        <div class="loading-card">
          <div class="loading-spinner"></div>
          <p class="loading-text">🔄 正在驗證身份...</p>
        </div>
      </div>

      <!-- 審核內容區域 -->
      <div v-else-if="isAdmin" class="review-content">
        <ReviewArticles />
      </div>

      <!-- 無權限提示 -->
      <div v-else class="access-denied">
        <div class="access-icon">🚫</div>
        <h3 class="access-title">存取受限</h3>
        <p class="access-description">
          很抱歉，只有管理員可以存取此頁面。
        </p>
        <div class="access-actions">
          <router-link to="/" class="btn btn-primary">
            <span class="btn-icon">🏠</span>
            返回首頁
          </router-link>
          <router-link v-if="!currentUser" to="/login" class="btn btn-outline">
            <span class="btn-icon">👤</span>
            登入帳號
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mountain-review {
  font-family: var(--font-body);
  min-height: 100vh;
  background: linear-gradient(135deg, 
    var(--mountain-50) 0%,
    var(--sky-50) 50%,
    var(--earth-50) 100%
  );
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* 頁面標題區塊 */
.review-header {
  text-align: center;
  margin-bottom: 3rem;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.review-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--stone-dark);
  margin-bottom: 1rem;
  font-family: var(--font-display);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.title-icon {
  font-size: 2rem;
}

.review-description {
  font-size: 1.1rem;
  color: var(--stone-medium);
  line-height: 1.6;
  margin: 0;
}

/* 載入狀態 */
.loading-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-card {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  margin: 0 auto 1rem;
  border: 3px solid rgba(34, 197, 94, 0.3);
  border-top: 3px solid var(--mountain-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: var(--stone-medium);
  font-size: 1rem;
  margin: 0;
}

/* 審核內容區域 */
.review-content {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 無權限提示 */
.access-denied {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  max-width: 500px;
  margin: 3rem auto;
}

.access-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.access-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: 1rem;
  font-family: var(--font-display);
}

.access-description {
  color: var(--stone-medium);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.access-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* 按鈕樣式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--mountain-primary), var(--mountain-accent));
  color: white;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);
}

.btn-outline {
  background: rgba(255, 255, 255, 0.8);
  color: var(--stone-dark);
  border-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: var(--mountain-primary);
  color: var(--mountain-primary);
}

.btn-icon {
  font-size: 1rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .review-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .access-actions {
    flex-direction: column;
    align-items: center;
  }

  .container {
    padding: 1rem;
  }
}
</style>
