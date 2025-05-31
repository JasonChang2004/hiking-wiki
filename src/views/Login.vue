<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 背景裝飾 -->
      <div class="background-decoration">
        <div class="mountain-bg"></div>
        <div class="floating-elements">
          <div class="cloud cloud-1">☁️</div>
          <div class="cloud cloud-2">☁️</div>
          <div class="tree tree-1">🌲</div>
          <div class="tree tree-2">🌲</div>
        </div>
      </div>

      <!-- 主要登入區域 -->
      <div class="login-content">
        <!-- 登入表單區域 -->
        <div class="forms-container">
          <!-- 電子郵件登入表單 -->
          <div v-if="!showRegister" class="email-form">
            <h3 class="form-title">電子郵件登入</h3>
            <form @submit.prevent="loginWithEmail" class="login-form">
              <div class="form-group">
                <label for="login-email" class="form-label">電子郵件</label>
                <div class="input-wrapper">
                  <span class="input-icon">📧</span>
                  <input
                    id="login-email"
                    v-model="loginForm.email"
                    type="email"
                    class="form-input"
                    placeholder="請輸入您的電子郵件"
                    required
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="login-password" class="form-label">密碼</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔑</span>
                  <input
                    id="login-password"
                    v-model="loginForm.password"
                    type="password"
                    class="form-input"
                    placeholder="請輸入您的密碼"
                    required
                  />
                </div>
              </div>
              
              <button type="submit" class="submit-button" :disabled="emailLoading">
                <span v-if="emailLoading">⏳ 登入中...</span>
                <span v-else>🚪 登入</span>
              </button>
            </form>
            
            <!-- Google 登入 -->
            <div class="google-login-section">
              <div class="divider">
                <span class="divider-text">或</span>
              </div>
              <button @click="loginWithGoogle" class="google-login-btn" :disabled="loading">
                <span class="google-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </span>
                <span v-if="loading">登入中...</span>
                <span v-else>使用 Google 帳號登入</span>
              </button>
            </div>
            
            <!-- 註冊按鈕 -->
            <div class="register-section">
              <div class="register-row">
                <p class="register-text">還沒有帳號？</p>
                <button @click="showRegister = true" class="register-button">
                  🎯 立即註冊
                </button>
              </div>
            </div>
          </div>

          <!-- 電子郵件註冊表單 -->
          <div v-if="showRegister" class="email-form">
            <div class="form-header">
              <button @click="showRegister = false" class="back-button">
                <span>←</span>
                <span>返回登入</span>
              </button>
              <h3 class="form-title">建立新帳號</h3>
            </div>
            
            <form @submit.prevent="registerWithEmail" class="login-form">
              <div class="form-group">
                <label for="register-name" class="form-label">顯示名稱</label>
                <div class="input-wrapper">
                  <span class="input-icon">👤</span>
                  <input
                    id="register-name"
                    v-model="registerForm.displayName"
                    type="text"
                    class="form-input"
                    placeholder="請輸入您的顯示名稱"
                    required
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="register-email" class="form-label">電子郵件</label>
                <div class="input-wrapper">
                  <span class="input-icon">📧</span>
                  <input
                    id="register-email"
                    v-model="registerForm.email"
                    type="email"
                    class="form-input"
                    placeholder="請輸入您的電子郵件"
                    required
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="register-password" class="form-label">密碼</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔑</span>
                  <input
                    id="register-password"
                    v-model="registerForm.password"
                    type="password"
                    class="form-input"
                    placeholder="請輸入密碼 (至少6位數)"
                    required
                    minlength="6"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="confirm-password" class="form-label">確認密碼</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔒</span>
                  <input
                    id="confirm-password"
                    v-model="registerForm.confirmPassword"
                    type="password"
                    class="form-input"
                    placeholder="請再次輸入密碼"
                    required
                  />
                </div>
              </div>
              
              <button type="submit" class="submit-button" :disabled="registerLoading">
                <span v-if="registerLoading">⏳ 註冊中...</span>
                <span v-else>🎯 建立帳號</span>
              </button>
            </form>
          </div>
        </div>

        <!-- 底部連結 -->
        <div class="footer-links">
          <router-link to="/" class="back-link">
            <span>←</span>
            <span>返回首頁</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 錯誤/成功訊息 -->
    <div v-if="message" class="message-overlay" @click="message = ''">
      <div class="message-box" :class="{ error: messageType === 'error', success: messageType === 'success' }">
        <div class="message-content">
          <span class="message-icon">{{ messageType === 'error' ? '❌' : '✅' }}</span>
          <span class="message-text">{{ message }}</span>
        </div>
        <button @click="message = ''" class="close-message">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, provider, db } from '../firebase'
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import type { UserProfile } from '../types'

const router = useRouter()
const loading = ref(false)
const emailLoading = ref(false)
const registerLoading = ref(false)
const message = ref('')
const messageType = ref<'error' | 'success'>('error')
const showRegister = ref(false)

const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 檢查用戶是否已登入
onMounted(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // 如果已登入，重導向到首頁
      router.push('/')
    }
  })
  // 組件銷毀時取消監聽
  return unsubscribe
})

const showMessage = (text: string, type: 'error' | 'success' = 'error') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

const loginWithGoogle = async () => {
  loading.value = true
  try {
    const result = await signInWithPopup(auth, provider)
    if (result.user) {
      const userDocRef = doc(db, 'users', result.user.uid)
      const userDocSnap = await getDoc(userDocRef)

      let isAdmin = false
      if (userDocSnap.exists()) {
        isAdmin = userDocSnap.data()?.isAdmin || false
      }
      
      const userProfileData: Omit<UserProfile, 'id'> = {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        isAdmin: isAdmin,
      }
      await setDoc(userDocRef, userProfileData, { merge: true })
      
      showMessage('Google 登入成功！歡迎回來！', 'success')
      setTimeout(() => {
        router.push('/')
      }, 1500)
    }
  } catch (err: any) {
    console.error('Google 登入失敗', err)
    showMessage('Google 登入失敗，請稍後重試')
  } finally {
    loading.value = false
  }
}

const loginWithEmail = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    showMessage('請填寫完整的電子郵件和密碼')
    return
  }

  emailLoading.value = true
  try {
    const result = await signInWithEmailAndPassword(auth, loginForm.value.email, loginForm.value.password)
    if (result.user) {
      const userDocRef = doc(db, 'users', result.user.uid)
      const userDocSnap = await getDoc(userDocRef)

      let isAdmin = false
      if (userDocSnap.exists()) {
        isAdmin = userDocSnap.data()?.isAdmin || false
      }
      
      const userProfileData: Omit<UserProfile, 'id'> = {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        isAdmin: isAdmin,
      }
      await setDoc(userDocRef, userProfileData, { merge: true })
      
      showMessage('登入成功！歡迎回來！', 'success')
      setTimeout(() => {
        router.push('/')
      }, 1500)
    }
  } catch (err: any) {
    console.error('電子郵件登入失敗', err)
    let errorMessage = '登入失敗'
    
    switch (err.code) {
      case 'auth/user-not-found':
        errorMessage = '找不到此電子郵件帳號'
        break
      case 'auth/wrong-password':
        errorMessage = '密碼錯誤'
        break
      case 'auth/invalid-email':
        errorMessage = '電子郵件格式不正確'
        break
      case 'auth/too-many-requests':
        errorMessage = '嘗試次數過多，請稍後重試'
        break
      default:
        errorMessage = '登入失敗，請檢查您的電子郵件和密碼'
    }
    
    showMessage(errorMessage)
  } finally {
    emailLoading.value = false
  }
}

const registerWithEmail = async () => {
  if (!registerForm.value.displayName || !registerForm.value.email || !registerForm.value.password) {
    showMessage('請填寫所有必填欄位')
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    showMessage('密碼與確認密碼不符')
    return
  }

  if (registerForm.value.password.length < 6) {
    showMessage('密碼長度至少需要6位數')
    return
  }

  registerLoading.value = true
  try {
    const result = await createUserWithEmailAndPassword(auth, registerForm.value.email, registerForm.value.password)
    if (result.user) {
      await updateProfile(result.user, {
        displayName: registerForm.value.displayName
      })
      
      const userProfileData: Omit<UserProfile, 'id'> = {
        displayName: registerForm.value.displayName,
        email: result.user.email,
        photoURL: null,
        isAdmin: false,
      }
      
      const userDocRef = doc(db, 'users', result.user.uid)
      await setDoc(userDocRef, userProfileData, { merge: true })
      
      showMessage('註冊成功！歡迎加入台灣山林知識庫！', 'success')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  } catch (err: any) {
    console.error('註冊失敗', err)
    let errorMessage = '註冊失敗'
    
    switch (err.code) {
      case 'auth/email-already-in-use':
        errorMessage = '此電子郵件已被註冊'
        break
      case 'auth/invalid-email':
        errorMessage = '電子郵件格式不正確'
        break
      case 'auth/weak-password':
        errorMessage = '密碼強度不足'
        break
      default:
        errorMessage = '註冊失敗，請稍後重試'
    }
    
    showMessage(errorMessage)
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, 
    var(--mountain-50) 0%,
    var(--sky-50) 50%,
    var(--earth-50) 100%
  );
  position: relative;
  overflow: hidden;
}

/* 背景裝飾 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.mountain-bg {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300"><path fill="%2316a34a" opacity="0.6" d="M0,300V200c50-20,100-40,200-30s150,30,250,20s180-30,280-20s200,30,250,20s180-30,220-20v130Z"/><path fill="%2322c55e" opacity="0.4" d="M0,300V230c60-15,120-30,200-25s140,25,220,15s160-25,240-15s180,25,220,15s140-25,180-15v105Z"/></svg>');
  background-size: cover;
  background-position: bottom;
  background-repeat: no-repeat;
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.cloud {
  position: absolute;
  font-size: 2rem;
  opacity: 0.4;
  animation: float 6s ease-in-out infinite;
}

.cloud-1 {
  top: 20%;
  left: 10%;
  animation-delay: -2s;
}

.cloud-2 {
  top: 30%;
  right: 15%;
  animation-delay: -4s;
}

.tree {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.3;
  animation: sway 4s ease-in-out infinite;
}

.tree-1 {
  bottom: 15%;
  left: 20%;
  animation-delay: -1s;
}

.tree-2 {
  bottom: 20%;
  right: 25%;
  animation-delay: -3s;
}

/* 主要內容 */
.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 28rem;
}

.login-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: var(--shadow-elevated);
}

/* Google 登入 */
.google-login-section {
  margin: 1.5rem 0;
}

.google-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem;
  background: white;
  border: 1.5px solid rgba(66, 133, 244, 0.3);
  border-radius: 0.75rem;
  color: #1f2937;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-body);
  box-sizing: border-box;
}

.google-login-btn:hover:not(:disabled) {
  background: rgba(66, 133, 244, 0.05);
  border-color: #4285f4;
  transform: translateY(-1px);
  color: #1f2937;
}

.google-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  color: #6b7280;
}

.google-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(229, 231, 235, 0.5);
}

.divider-text {
  padding: 0 1rem;
  color: var(--stone-medium);
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.95);
}

/* 表單 */
.email-form {
  margin-bottom: 1.5rem;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(229, 231, 235, 0.3);
  position: relative;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid rgba(229, 231, 235, 0.5);
  border-radius: 0.5rem;
  color: var(--stone-medium);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-body);
  flex-shrink: 0;
}

.back-button:hover {
  background: rgba(34, 197, 94, 0.05);
  border-color: var(--mountain-primary);
  color: var(--mountain-primary);
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--stone-dark);
  margin: 0;
  text-align: center;
  font-family: var(--font-display);
}

.form-header .form-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 8rem);
}

/* 註冊區域 */
.register-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(229, 231, 235, 0.3);
  text-align: center;
}

.register-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.register-text {
  font-size: 0.875rem;
  color: var(--stone-medium);
  margin: 0;
}

.register-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f97316, #ea580c) !important;
  color: #ffffff !important;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.register-button * {
  color: #ffffff !important;
}

.register-button:hover {
  background: linear-gradient(135deg, #ea580c, #dc2626) !important;
  transform: translateY(-1px);
  color: #ffffff !important;
}

.register-button:hover * {
  color: #ffffff !important;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--stone-dark);
  font-family: var(--font-body);
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: var(--stone-medium);
  z-index: 2;
}

.form-input {
  width: 100%;
  padding: 0.875rem 0.875rem 0.875rem 2.75rem;
  border: 1.5px solid rgba(229, 231, 235, 0.8);
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-family: var(--font-body);
  background: white;
  color: var(--stone-dark);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: var(--stone-medium);
}

.form-input:focus {
  outline: none;
  border-color: var(--mountain-primary);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  color: var(--stone-dark);
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #22c55e, #16a34a) !important;
  color: #ffffff !important;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.submit-button * {
  color: #ffffff !important;
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #16a34a, #15803d) !important;
  transform: translateY(-1px);
  color: #ffffff !important;
}

.submit-button:hover:not(:disabled) * {
  color: #ffffff !important;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  color: #ffffff !important;
}

.submit-button:disabled * {
  color: #ffffff !important;
}

/* 底部連結 */
.footer-links {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(229, 231, 235, 0.3);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--stone-medium);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.3s ease;
  font-family: var(--font-body);
}

.back-link:hover {
  color: var(--mountain-primary);
}

/* 訊息彈窗 */
.message-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.message-box {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin: 1rem;
  max-width: 20rem;
  box-shadow: var(--shadow-elevated);
  position: relative;
}

.message-box.error {
  border-left: 4px solid #dc2626;
}

.message-box.success {
  border-left: 4px solid var(--mountain-primary);
}

.message-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.message-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.message-text {
  font-size: 0.875rem;
  color: var(--stone-dark);
  line-height: 1.5;
  font-family: var(--font-body);
}

.close-message {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  color: var(--stone-medium);
  font-size: 1.25rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.close-message:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--stone-dark);
}

/* 動畫 */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

/* 響應式設計 */
@media (max-width: 480px) {
  .login-content {
    padding: 1.5rem;
  }
  
  .site-logo {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .logo-text {
    text-align: center;
  }
  
  .site-title {
    font-size: 1.25rem;
  }
  
  .tab-button {
    padding: 0.625rem;
    font-size: 0.8rem;
  }
}

/* 無障礙設計 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style> 