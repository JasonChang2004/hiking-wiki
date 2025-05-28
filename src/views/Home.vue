<template>
  <div class="space-y-8 px-4 py-8 max-w-6xl mx-auto">
    <UserGreeting />
    <FeaturedCarousel />
    <CategoryGrid />
    <section>
      <h2 class="text-lg font-semibold mb-2">🆕 最新文章</h2>
      <ArticleList />
    </section>
  </div>
</template>

<script setup lang="ts">
import ArticleList from '../components/ArticleList.vue'
import FeaturedCarousel from '../components/FeaturedCarousel.vue'
import CategoryGrid from '../components/CategoryGrid.vue'
import UserGreeting from '../components/UserGreeting.vue'
</script>
