<template>
  <div class="flex items-center space-x-2">
    <button
      v-if="!user"
      @click="login"
      class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      使用 Google 登入
    </button>
    <div v-else class="flex items-center space-x-2">
      <img v-if="user.photoURL" :src="user.photoURL" alt="avatar" class="w-8 h-8 rounded-full" />
      <span>{{ user.displayName }}</span>
      <button @click="logout" class="ml-2 text-red-500 hover:underline">登出</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auth, provider, db } from '../firebase'
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
