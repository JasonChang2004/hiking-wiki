<template>
  <div class="featured-carousel-container">
    <h2 class="text-2xl font-bold mb-4">精選文章</h2>
    <div v-if="isLoading" class="text-center">載入中...</div>
    <div v-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-if="!isLoading && !error && articles.length === 0" class="text-center">沒有精選文章</div>
    <div v-if="!isLoading && !error && articles.length > 0" class="carousel">
      <div v-for="article in articles" :key="article.id" class="carousel-item">
        <router-link :to="{ name: 'ArticleDetail', params: { id: article.id } }">
          <img :src="article.imageUrl || 'https://source.unsplash.com/random/800x600?hiking&' + article.id" alt="Article cover" class="carousel-image"/>
          <div class="carousel-caption">
            <h3 class="text-lg font-semibold">{{ article.title }}</h3>
            <p class="text-sm text-gray-200">作者：{{ article.displayName || '匿名' }}</p>
            <p class="text-xs text-gray-300">發布於：{{ formatDate(article.createdAt) }}</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.featured-carousel-container {
  max-width: 1000px;
  margin: 0 auto;
}

.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem; /* spacing between items */
  padding-bottom: 1rem; /* For scrollbar visibility if needed */
}

.carousel-item {
  flex: 0 0 auto; /* Prevent growing/shrinking, auto basis */
  width: 300px; /* Or your preferred width */
  scroll-snap-align: start;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.carousel-item:hover {
  transform: translateY(-5px);
}

.carousel-image {
  width: 100%;
  height: 200px; /* Or your preferred height */
  object-fit: cover;
  display: block;
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.75rem;
  text-align: left;
}

/* Scrollbar styling (optional) */
.carousel::-webkit-scrollbar {
  height: 8px;
}

.carousel::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

.carousel::-webkit-scrollbar-track {
  background-color: #f1f1f1;
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
