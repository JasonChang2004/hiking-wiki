<template>
  <div class="featured-carousel-container">
    <div v-if="isLoading" class="text-center py-4">
      <div class="animate-pulse">載入精選文章中...</div>
    </div>
    <div v-if="error" class="text-center text-red-500 py-4">{{ error }}</div>
    <div v-if="!isLoading && !error && articles.length === 0" class="text-center py-4">
      <p class="text-gray-500">目前沒有精選文章</p>
    </div>
    <div v-if="!isLoading && !error && articles.length > 0" class="carousel">
      <div v-for="article in articles" :key="article.id" class="carousel-item">
        <router-link :to="{ name: 'ArticleDetail', params: { id: article.id } }" class="block h-full">
          <div class="carousel-content">
            <div class="featured-badge">🌟 精選</div>
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-excerpt">{{ article.content.substring(0, 100) }}...</p>
            <div class="article-meta">
              <span class="author">👤 {{ article.displayName || '匿名' }}</span>
              <span class="date">📅 {{ formatDate(article.createdAt) }}</span>
              <span class="category">🏷️ {{ article.category }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.featured-carousel-container {
  max-width: 100%;
  margin: 0 auto;
}

.carousel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  padding: 0;
}

@media (max-width: 768px) {
  .carousel {
    grid-template-columns: 1fr;
  }
}

.carousel-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  background: white;
  height: 200px;
}

.carousel-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-color: #3b82f6;
}

.carousel-content {
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.featured-badge {
  align-self: flex-start;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  margin-bottom: 0.75rem;
}

.article-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-excerpt {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.carousel-item:hover .article-title {
  color: #3b82f6;
}

.carousel-item:hover .featured-badge {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

/* 載入動畫 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '@/firebase'; // Corrected import path
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import type { Article } from '@/types';
import { formatDate } from '@/utils/formatters';

const articles = ref<Article[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchFeaturedArticles = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const articlesCollection = collection(db, 'articles');
    // Query for articles, order by creation date in descending order, limit to 5
    // Filter for status 'approved' and isFeatured true.
    const q = query(
      articlesCollection, 
      where('status', '==', 'approved'), 
      where('isFeatured', '==', true), 
      orderBy('createdAt', 'desc'), 
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    articles.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt // This might need conversion if not already a string
    } as Article));
  } catch (err) {
    console.error("Error fetching featured articles:", err);
    error.value = "Failed to load featured articles.";
  }
  isLoading.value = false;
};

onMounted(() => {
  fetchFeaturedArticles();
});
</script>
