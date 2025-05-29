<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { db } from '@/firebase';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { getAuth, type Unsubscribe } from 'firebase/auth'; // Corrected Unsubscribe import
import type { Article } from '@/types';
import { formatDate } from '@/utils/formatters';
import { useRouter } from 'vue-router';

const articles = ref<Article[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const auth = getAuth();
const user = computed(() => auth.currentUser);
const router = useRouter();

let authUnsubscribe: Unsubscribe | null = null; // Defined authUnsubscribe

// Helper functions for status class and text
const getStatusClass = (status: Article['status']) => {
  switch (status) {
    case 'pending': return 'text-yellow-500';
    case 'approved': return 'text-green-500';
    case 'rejected': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

const getStatusText = (status: Article['status']) => {
  switch (status) {
    case 'pending': return '審核中';
    case 'approved': return '已發布';
    case 'rejected': return '已拒絕';
    default: return '未知';
  }
};

const fetchUserArticles = async () => {
  if (!user.value) {
    error.value = "User not logged in.";
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  error.value = null;
  try {
    const articlesCollection = collection(db, 'articles');
    const q = query(articlesCollection, where('uid', '==', user.value.uid), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    articles.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Article));
  } catch (err) {
    console.error("Error fetching user articles:", err);
    error.value = "無法載入您的文章";
  }
  isLoading.value = false;
};

const deleteArticle = async (articleId: string) => {
  if (!confirm("確定要刪除這篇文章嗎？此操作無法復原。")) return;
  try {
    await deleteDoc(doc(db, 'articles', articleId));
    articles.value = articles.value.filter(article => article.id !== articleId);
    alert("文章已刪除");
  } catch (err) {
    console.error("Error deleting article:", err);
    alert("刪除文章失敗");
    error.value = "刪除文章失敗";
  }
};

const editArticle = (articleId: string) => {
  router.push({ name: 'SubmitArticle', query: { edit: 'true', id: articleId } });
};

onMounted(() => {
  authUnsubscribe = auth.onAuthStateChanged(newUser => {
    if (newUser) {
      fetchUserArticles();
    } else {
      articles.value = [];
      error.value = "請先登入以查看您的文章。";
      isLoading.value = false;
      // router.push('/login'); // Optional: redirect to login
    }
  });
});

onUnmounted(() => {
  if (authUnsubscribe) {
    authUnsubscribe(); // Unsubscribe when component is unmounted
  }
});

</script>

<template>
  <div class="my-articles-container p-4">
    <h1 class="text-2xl font-bold mb-4">我的文章</h1>
    <div v-if="isLoading" class="text-center">載入中...</div>
    <div v-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-if="!isLoading && articles.length === 0 && !error" class="text-center">
      您尚未發布任何文章。
      <router-link to="/submit-article" class="text-blue-500 hover:underline">現在就去發布</router-link>
    </div>
    <div v-if="!isLoading && articles.length > 0">
      <ul>
        <li v-for="article in articles" :key="article.id" class="mb-4 p-4 border rounded shadow-sm">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-xl font-semibold">{{ article.title }}</h2>
              <p class="text-sm text-gray-600">分類: {{ article.category }}</p>
              <p class="text-sm text-gray-600">建立日期: {{ formatDate(article.createdAt) }}</p>
              <p class="text-sm" :class="getStatusClass(article.status)">狀態: {{ getStatusText(article.status) }}</p>
              <p v-if="article.status === 'rejected' && article.reviewComment" class="text-sm text-red-400">拒絕原因: {{ article.reviewComment }}</p>
            </div>
            <div class="actions">
              <button @click="editArticle(article.id)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">編輯</button>
              <button @click="deleteArticle(article.id)" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">刪除</button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.my-articles-container {
  max-width: 800px;
  margin: 0 auto;
}
.actions button {
  transition: background-color 0.3s ease;
}
</style>
