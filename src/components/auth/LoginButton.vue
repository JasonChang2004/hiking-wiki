<template>
  <template v-if="!user">
    <button @click="login" class="wiki-button">
      使用 Google 登入
    </button>
  </template>
  <template v-else>
    <span v-if="user.displayName" class="hidden sm:inline text-gray-600 mr-2">{{ user.displayName }}</span>
    <button @click="logout" class="text-wiki-link hover:underline">
      登出
    </button>
  </template>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auth, provider, db } from '../../firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

const user = ref<User | null>(null)

const login = async () => {
  try {
    const result = await signInWithPopup(auth, provider)

    // ✅ 將登入者寫入 Firestore 的 users 集合
    await setDoc(doc(db, 'users', result.user.uid), {
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
      isAdmin: false, // 預設為非管理員
    }, { merge: true })

    console.log('✅ 使用者資訊已同步寫入 Firestore')

  } catch (err) {
    console.error('登入失敗', err)
  }
}

const logout = async () => {
  await signOut(auth)
}

onMounted(() => {
  onAuthStateChanged(auth, (u) => {
    user.value = u
  })
})
</script>
