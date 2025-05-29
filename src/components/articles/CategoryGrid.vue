<template>
  <div class="w-full wiki-categories">
    <div class="wiki-category-table">
      <table class="wiki-table w-full border-collapse">
        <tbody>
          <tr v-for="(row, rowIndex) in categoryRows" :key="rowIndex">
            <td v-for="(cat, colIndex) in row" :key="colIndex" class="wiki-category-cell">
              <div v-if="cat" class="wiki-category-content">
                <router-link
                  :to="`/category/${cat.name}`"
                  class="wiki-category-link hover:underline"
                >
                  <div class="flex items-center">
                    <span class="wiki-category-icon mr-2">{{ cat.icon }}</span>
                    <span class="wiki-category-label">{{ cat.label }}</span>
                  </div>
                </router-link>
                <div class="text-xs text-gray-500 ml-7">
                  {{ cat.count }}+ 條目
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-5 text-xs text-gray-500 border-t border-gray-200 pt-3">
      類別索引包含所有登山知識庫中的主題分類。點擊類別名稱可瀏覽該類別下的所有文章。
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface Category {
  name: string;
  label: string;
  icon: string;
  count: number;
}

const categories = ref<Category[]>([
  { name: '登山路線', label: '登山路線', icon: '🗻', count: 0 },
  { name: '裝備心得', label: '裝備心得', icon: '🎒', count: 0 },
  { name: '登山知識', label: '登山知識', icon: '📚', count: 0 },
  { name: '緊急應變', label: '緊急應變', icon: '🚨', count: 0 },
  { name: '野外生存', label: '野外生存', icon: '🏕️', count: 0 },
  { name: '保育生態', label: '保育生態', icon: '🌱', count: 0 },
  { name: '登山飲食', label: '登山飲食', icon: '🍱', count: 0 },
  { name: '入門指南', label: '入門指南', icon: '👣', count: 0 },
]);

const categoryRows = computed(() => {
  const itemsPerRow = 4;
  const rows: (Category | null)[][] = [];
  const cats = [...categories.value];

  while (cats.length % itemsPerRow !== 0) {
    cats.push(null);
  }

  for (let i = 0; i < cats.length; i += itemsPerRow) {
    rows.push(cats.slice(i, i + itemsPerRow));
  }

  return rows;
});

onMounted(async () => {
  for (const category of categories.value) {
    const q = query(
      collection(db, 'articles'),
      where('category', '==', category.name),
      where('status', '==', 'approved')
    );
    const snapshot = await getDocs(q);
    category.count = snapshot.size;
  }
});
</script>

<style scoped>
.wiki-categories {
  font-family: 'Liberation Serif', 'Linux Libertine', Georgia, Times, serif;
}

.wiki-table {
  border-collapse: collapse;
}

.wiki-category-cell {
  padding: 0.75rem;
  vertical-align: top;
  border: 1px solid #eaecef;
}

.wiki-category-content {
  min-height: 3rem;
}

.wiki-category-link {
  color: #0645ad;
  transition: color 0.15s ease;
}

.wiki-category-link:visited {
  color: #0b0080;
}

.wiki-category-link:hover {
  color: #3366bb;
  text-decoration: underline;
}

.wiki-category-icon {
  font-size: 1.25rem;
  opacity: 0.9;
}

.wiki-category-label {
  font-weight: 500;
}
</style>
