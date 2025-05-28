<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  collection,
  getDocs,
  updateDoc,
  addDoc,
  doc,
  collection as col
} from 'firebase/firestore'
import { db } from '../firebase'
import { grantAdminRole, revokeAdminRole } from '../firebase/functions'
import { auth } from '../firebase'

const admins = ref<UserInfo[]>([])
const nonAdmins = ref<UserInfo[]>([])
const articles = ref<ArticleInfo[]>([])
const loading = ref(true)
const updatingUid = ref<string | null>(null)
const currentUid = ref<string | null>(null)

const loadUsers = async () => {
  loading.value = true
  const allDocs = await getDocs(collection(db, 'users'))
  const allUsers = allDocs.docs.map(d => ({
    id: d.id,
    ...(d.data() as Omit<UserInfo, 'id'>)
  })) as UserInfo[]
  admins.value = allUsers.filter(u => u.isAdmin)
  nonAdmins.value = allUsers.filter(u => !u.isAdmin)
  loading.value = false
}

const loadArticles = async () => {
  const allDocs = await getDocs(collection(db, 'articles'))
  articles.value = allDocs.docs.map(d => ({
    id: d.id,
    ...(d.data() as Omit<ArticleInfo, 'id'>)
  }))
}

const inviteAdmin = async (uid: string) => {
  if (updatingUid.value) return
  updatingUid.value = uid
  try {
    await grantAdminRole(uid)
    alert('已設為管理員！')
    await loadUsers()
  } catch (e: any) {
    alert(e.message || '設定失敗')
  }
  updatingUid.value = null
}

const demoteAdmin = async (uid: string) => {
  if (updatingUid.value) return
  updatingUid.value = uid
  try {
    await revokeAdminRole(uid)
    alert('已降為一般用戶')
    await loadUsers()
  } catch (e: any) {
    alert(e.message || '操作失敗')
  }
  updatingUid.value = null
}

const toggleAdmin = (user: UserInfo) => {
  if (user.isAdmin) {
    demoteAdmin(user.id)
  } else {
    inviteAdmin(user.id)
  }
}

const toggleStatus = async (article: ArticleInfo) => {
  const ref = doc(db, 'articles', article.id)
  const newStatus = article.status === 'approved' ? 'pending' : 'approved'
  await updateDoc(ref, { status: newStatus })

  // 寫入通知
  await addDoc(col(db, 'notifications'), {
    uid: article.uid,
    message: newStatus === 'approved'
      ? `你的文章「${article.title}」已通過審核 🎉`
      : `你的文章「${article.title}」被退回為「待審核」`,
    type: 'status',
    read: false,
    createdAt: new Date(),
  })

  alert('狀態已更新，並發送通知')
  await loadArticles()
}

const toggleFeatured = async (article: ArticleInfo) => {
  const ref = doc(db, 'articles', article.id)
  await updateDoc(ref, {
    isFeatured: !article.isFeatured
  })
  alert('精選狀態已更新')
  await loadArticles()
}

onMounted(() => {
  loadUsers()
  loadArticles()
  if (auth.currentUser) {
    currentUid.value = auth.currentUser.uid
  } else {
    auth.onAuthStateChanged((user) => {
      if (user) currentUid.value = user.uid
    })
  }
})

interface UserInfo {
  id: string
  displayName?: string
  email?: string
  isAdmin?: boolean
}

interface ArticleInfo {
  id: string
  title: string
  content: string
  category?: string
  displayName?: string
  createdAt?: any
  status: 'pending' | 'approved' | 'rejected'
  isFeatured?: boolean
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-6 space-y-8">
    <h1 class="text-2xl font-bold mb-4">🔧 管理後台</h1>

    <!-- 🔽 管理員帳號管理 -->
    <section>
      <h2 class="text-xl font-semibold mb-2">👑 管理員帳號</h2>
      <p class="text-sm text-gray-500 mb-4">可切換使用者的管理權限</p>
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="user in [...admins, ...nonAdmins]"
          :key="user.id"
          class="p-4 bg-white rounded shadow space-y-2"
        >
          <p class="font-semibold">{{ user.displayName }}</p>
          <p class="text-sm text-gray-600">{{ user.email }}</p>
          <button
            class="px-3 py-1 text-sm rounded"
            :class="user.isAdmin ? 'bg-red-500 text-white' : 'bg-green-500 text-white'"
            @click="toggleAdmin(user)"
          >
            {{ user.isAdmin ? '取消管理員' : '設為管理員' }}
          </button>
        </div>
      </div>
    </section>

    <!-- 🔽 文章狀態管理 -->
    <section>
      <h2 class="text-xl font-semibold mt-10 mb-2">📝 文章管理</h2>
      <p class="text-sm text-gray-500 mb-4">你可以變更精選與審核狀態</p>
      <div class="space-y-4">
        <div
          v-for="article in articles"
          :key="article.id"
          class="p-4 bg-gray-50 rounded border flex flex-col gap-1"
        >
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold">{{ article.title }}</h3>
              <p class="text-sm text-gray-600">
                by {{ article.displayName }} / {{ article.category }}
              </p>
            </div>
            <router-link :to="`/article/${article.id}`" class="text-blue-500 text-sm">檢視</router-link>
          </div>
          <div class="flex gap-2 mt-2">
            <button
              class="px-2 py-1 text-sm rounded"
              :class="article.status === 'approved' ? 'bg-yellow-500 text-white' : 'bg-green-600 text-white'"
              @click="toggleStatus(article)"
            >
              {{ article.status === 'approved' ? '退回審核' : '通過審核' }}
            </button>
            <button
              class="px-2 py-1 text-sm rounded"
              :class="article.isFeatured ? 'bg-gray-500 text-white' : 'bg-indigo-600 text-white'"
              @click="toggleFeatured(article)"
            >
              {{ article.isFeatured ? '取消精選' : '設為精選' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
