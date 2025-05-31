<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  collection,
  getDocs,
  updateDoc,
  addDoc,
  doc,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { grantAdminRole, revokeAdminRole } from '@/firebase/functions';
import type { UserProfile, Article } from '@/types';
import { formatDate } from '@/utils/formatters'; // Re-added formatDate

const admins = ref<UserProfile[]>([]);
const nonAdmins = ref<UserProfile[]>([]);
const articles = ref<Article[]>([]);
const loadingUsers = ref(true);
const loadingArticles = ref(true);
const updatingUid = ref<string | null>(null);
const currentUid = ref<string | null>(null); // This is assigned but not used for any logic, consider removing if not needed

const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    const allDocs = await getDocs(collection(db, 'users'));
    const usersData = allDocs.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<UserProfile, 'id'>)
    })) as UserProfile[];
    admins.value = usersData.filter(u => u.isAdmin);
    nonAdmins.value = usersData.filter(u => !u.isAdmin);
  } catch (error) {
    console.error("Error loading users:", error);
  } finally {
    loadingUsers.value = false;
  }
};

const loadArticles = async () => {
  loadingArticles.value = true;
  try {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const allDocs = await getDocs(q);
    articles.value = allDocs.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<Article, 'id'>)
    })) as Article[]; // Ensure type assertion for the whole object array
  } catch (error) {
    console.error("Error loading articles:", error);
  } finally {
    loadingArticles.value = false;
  }
};

const toggleAdmin = async (user: UserProfile) => {
  if (updatingUid.value) return;

  updatingUid.value = user.id;
  try {
    if (user.isAdmin) {
      await revokeAdminRole(user.id);
      alert('已降為一般用戶');
    } else {
      await grantAdminRole(user.id);
      alert('已設為管理員！');
    }
    await loadUsers(); // Reload user list
  } catch (e: any) {
    alert(e.message || '操作失敗');
    console.error("Error toggling admin role:", e);
  }
  updatingUid.value = null;
};

const toggleStatus = async (article: Article) => {
  const articleRef = doc(db, 'articles', article.id);
  const newStatus = article.status === 'approved' ? 'pending' : 'approved';
  try {
    await updateDoc(articleRef, { status: newStatus, reviewedAt: Timestamp.now() });

    await addDoc(collection(db, 'notifications'), {
      uid: article.uid,
      message: newStatus === 'approved'
        ? `您的文章「${article.title}」已通過審核 🎉`
        : `您的文章「${article.title}」已被管理員退回為「待審核」狀態。`,
      type: newStatus === 'approved' ? 'article_approved' : 'status_changed', // Corrected type for pending
      read: false,
      createdAt: Timestamp.now(),
      articleId: article.id
    });

    alert('狀態已更新，並發送通知');
    const index = articles.value.findIndex(a => a.id === article.id);
    if (index !== -1) {
      articles.value[index].status = newStatus;
      articles.value[index].reviewedAt = Timestamp.now().toDate(); // Update reviewedAt locally
    }
  } catch (error) {
    console.error("Error toggling article status:", error);
    alert("更新文章狀態失敗");
  }
};

const toggleFeatured = async (article: Article) => {
  const articleRef = doc(db, 'articles', article.id);
  const newFeaturedStatus = !article.isFeatured;
  try {
    await updateDoc(articleRef, {
      isFeatured: newFeaturedStatus
    });
    alert('精選狀態已更新');
    const index = articles.value.findIndex(a => a.id === article.id);
    if (index !== -1) {
      articles.value[index].isFeatured = newFeaturedStatus;
    }
  } catch (error) {
    console.error("Error toggling featured status:", error);
    alert("更新精選狀態失敗");
  }
};

const checkMyClaims = async () => {
  if (auth.currentUser) {
    try {
      // true 會強制刷新 token
      const idTokenResult = await auth.currentUser.getIdTokenResult(true);
      console.log('Firebase ID Token Claims:', idTokenResult.claims);
      if (idTokenResult.claims.admin === true) {
        console.log('User HAS admin custom claim.');
      } else {
        console.log('User DOES NOT have admin custom claim, or it is not true.');
        alert('偵測到目前使用者沒有管理員自訂宣告，或宣告不為 true。請確認 Firebase Function "grantAdminRole" 是否已成功為此帳號設定權限，並已重新登入以刷新 Token。');
      }
    } catch (error) {
      console.error('Error getting ID token result:', error);
    }
  } else {
    console.log('No current user found.');
  }
};

let authUnsubscribe: (() => void) | null = null; // For unsubscribing

onMounted(async () => {
  loadUsers();
  loadArticles();
  const authInstance = auth; // Use the imported auth directly
  currentUid.value = authInstance.currentUser ? authInstance.currentUser.uid : null;
  authUnsubscribe = authInstance.onAuthStateChanged((user) => {
    currentUid.value = user ? user.uid : null;
  });
  await checkMyClaims(); // 在載入時檢查一次
});

onUnmounted(() => {
  if (authUnsubscribe) {
    authUnsubscribe();
  }
});

</script>

<template>
  <div class="max-w-6xl mx-auto p-6 space-y-8">
    <h1 class="text-2xl font-bold mb-4">🔧 管理後台</h1>

    <!-- 🔽 管理員帳號管理 -->
    <section>
      <h2 class="text-xl font-semibold mb-2">👑 管理員帳號</h2>
      <p class="text-sm text-gray-500 mb-4">可切換使用者的管理權限</p>
      <div v-if="loadingUsers" class="text-center">載入使用者中...</div>
      <div v-else class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="user in [...admins, ...nonAdmins]"
          :key="user.id"
          class="p-4 bg-white rounded shadow space-y-2"
        >
          <p class="font-semibold">{{ user.displayName || 'N/A' }}</p>
          <p class="text-sm text-gray-600">{{ user.email || 'N/A' }}</p>
          <p class="text-xs text-gray-400">UID: {{ user.id }}</p>
          <button
            class="px-3 py-1 text-sm rounded w-full disabled:opacity-50"
            :class="user.isAdmin ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'"
            @click="toggleAdmin(user)"
            :disabled="updatingUid === user.id || currentUid === user.id"
          >
            <span v-if="updatingUid === user.id">處理中...</span>
            <span v-else-if="currentUid === user.id">{{ user.isAdmin ? '無法取消自己' : '無法設自己' }}</span>
            <span v-else>{{ user.isAdmin ? '取消管理員' : '設為管理員' }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 🔽 文章狀態管理 -->
    <section>
      <h2 class="text-xl font-semibold mt-10 mb-2">📝 文章管理</h2>
      <p class="text-sm text-gray-500 mb-4">你可以變更精選與審核狀態</p>
      <div v-if="loadingArticles" class="text-center">載入文章中...</div>
      <div v-else class="space-y-4">
        <div
          v-for="article in articles"
          :key="article.id"
          class="p-4 bg-gray-50 rounded border flex flex-col gap-2"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold text-lg">{{ article.title }}</h3>
              <p class="text-sm text-gray-600">
                作者: {{ article.displayName || '匿名' }} | 分類: {{ article.category }}
              </p>
              <p class="text-xs text-gray-500">
                建立於: {{ formatDate(article.createdAt) }} |
                狀態: <span :class="{
                  'text-green-600': article.status === 'approved',
                  'text-yellow-600': article.status === 'pending',
                  'text-red-600': article.status === 'rejected'
                }">{{ article.status }}</span>
                <span v-if="article.reviewedAt"> | 審核於: {{ formatDate(article.reviewedAt) }}</span>
              </p>
            </div>
            <router-link :to="`/article/${article.id}`" class="text-blue-500 hover:text-blue-700 text-sm whitespace-nowrap ml-4">檢視文章</router-link>
          </div>
          <div class="flex gap-2 mt-2 items-center">
            <button
              class="px-3 py-1.5 text-sm rounded font-medium"
              :class="article.status === 'approved' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'"
              @click="toggleStatus(article)"
            >
              {{ article.status === 'approved' ? '退回審核' : '通過審核' }}
            </button>
            <button
              class="px-3 py-1.5 text-sm rounded font-medium"
              :class="article.isFeatured ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'"
              @click="toggleFeatured(article)"
            >
              {{ article.isFeatured ? '取消精選' : '設為精選' }}
            </button>
            <span v-if="article.isFeatured" class="text-xs text-indigo-600 ml-2">✨ 精選中</span>
          </div>
        </div>
        <div v-if="!loadingArticles && articles.length === 0" class="text-center text-gray-500 py-4">
          沒有需要管理的文章。
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Add any additional styling if needed */
button:disabled {
  cursor: not-allowed;
}
</style>
