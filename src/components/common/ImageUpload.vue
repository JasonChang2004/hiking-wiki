<template>
  <div class="image-upload-container">
    <div class="upload-header mb-3">
      <label class="block text-sm text-gray-600 mb-1">
        文章圖片（選填）
      </label>
      <p class="text-xs text-gray-500">
        支援 JPG、PNG、WebP 格式，單檔最大 5MB，最多上傳 8 張圖片
      </p>
    </div>

    <!-- 上傳區域 -->
    <div
      @click="triggerFileInput"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
      :class="[
        'upload-zone',
        { 'drag-over': isDragOver },
        { 'uploading': uploading }
      ]"
    >
      <div v-if="!uploading" class="upload-content">
        <div class="upload-icon mb-2">📷</div>
        <p class="text-sm text-gray-600 mb-1">點擊或拖曳圖片至此處上傳</p>
        <p class="text-xs text-gray-400">支援多選上傳</p>
      </div>
      <div v-else class="upload-loading">
        <div class="spinner"></div>
        <p class="text-sm text-gray-600 mt-2">上傳中... {{ uploadProgress }}%</p>
      </div>
    </div>

    <!-- 隱藏的文件輸入 -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/jpeg,image/jpg,image/png,image/webp"
      @change="handleFileSelect"
      class="hidden"
    />

    <!-- 錯誤訊息 -->
    <div v-if="errorMessage" class="error-message mt-2">
      {{ errorMessage }}
    </div>

    <!-- 圖片預覽網格 -->
    <div v-if="imageUrls.length > 0" class="preview-grid mt-4">
      <div
        v-for="(url, index) in imageUrls"
        :key="index"
        class="preview-item"
      >
        <img :src="url" :alt="`圖片 ${index + 1}`" class="preview-image" />
        <button
          type="button"
          @click="removeImage(index)"
          class="remove-button"
          :title="`刪除圖片 ${index + 1}`"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storage } from '@/firebase'
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'

// Props 和 Emits
const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

// 響應式數據
const imageUrls = ref<string[]>([...props.modelValue])
const isDragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const fileInput = ref<HTMLInputElement>()

// 文件驗證設置
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_FILES = 8
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// 監聽 props 變化
watch(() => props.modelValue, (newVal) => {
  imageUrls.value = [...newVal]
})

// 監聽內部變化並 emit
watch(imageUrls, (newVal) => {
  emit('update:modelValue', [...newVal])
}, { deep: true })

// 觸發文件選擇
const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

// 處理文件選擇
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    handleFiles(Array.from(target.files))
  }
}

// 處理拖拽上傳
const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files) {
    handleFiles(Array.from(event.dataTransfer.files))
  }
}

// 處理文件
const handleFiles = async (files: File[]) => {
  errorMessage.value = ''
  
  // 檢查文件數量限制
  if (imageUrls.value.length + files.length > MAX_FILES) {
    errorMessage.value = `最多只能上傳 ${MAX_FILES} 張圖片`
    return
  }

  // 過濾和驗證文件
  const validFiles = files.filter(file => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      errorMessage.value = '僅支援 JPG、PNG、WebP 格式的圖片'
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      errorMessage.value = '圖片大小不能超過 5MB'
      return false
    }
    return true
  })

  if (validFiles.length === 0) return

  // 上傳文件
  uploading.value = true
  uploadProgress.value = 0

  try {
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      const url = await uploadFile(file)
      imageUrls.value.push(url)
      uploadProgress.value = Math.round(((i + 1) / validFiles.length) * 100)
    }
  } catch (error) {
    console.error('上傳失敗:', error)
    errorMessage.value = '圖片上傳失敗，請重試'
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// 上傳單個文件
const uploadFile = async (file: File): Promise<string> => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const fileName = `articles/${timestamp}_${randomString}_${file.name}`
  
  const fileRef = storageRef(storage, fileName)
  const uploadTask = uploadBytesResumable(fileRef, file)
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      () => {
        // 這裡可以更新單個文件的進度，目前使用整體進度
      },
      (error) => {
        reject(error)
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

// 刪除圖片
const removeImage = async (index: number) => {
  try {
    const url = imageUrls.value[index]
    
    // 從 Firebase Storage 刪除文件
    if (url.includes('firebase')) {
      const fileRef = storageRef(storage, getFilePathFromUrl(url))
      await deleteObject(fileRef)
    }
    
    // 從陣列中移除
    imageUrls.value.splice(index, 1)
  } catch (error) {
    console.error('刪除圖片失敗:', error)
    // 即使刪除失敗，也從陣列中移除 URL
    imageUrls.value.splice(index, 1)
  }
}

// 從 URL 提取文件路徑
const getFilePathFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/o\/(.+?)\?/)
    return pathMatch ? decodeURIComponent(pathMatch[1]) : ''
  } catch {
    return ''
  }
}
</script>

<style scoped>
.image-upload-container {
  @apply w-full;
}

.upload-zone {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-all duration-200;
}

.upload-zone:hover {
  @apply border-gray-400 bg-gray-50;
}

.upload-zone.drag-over {
  @apply border-blue-400 bg-blue-50;
}

.upload-zone.uploading {
  @apply cursor-not-allowed bg-gray-100;
}

.upload-content {
  @apply flex flex-col items-center;
}

.upload-icon {
  @apply text-2xl text-gray-400;
}

.upload-loading {
  @apply flex flex-col items-center;
}

.spinner {
  @apply w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin;
}

.error-message {
  @apply text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2;
}

.preview-grid {
  @apply grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3;
}

.preview-item {
  @apply relative group aspect-square bg-gray-100 rounded-lg overflow-hidden;
}

.preview-image {
  @apply w-full h-full object-cover transition-transform duration-200 group-hover:scale-105;
}

.remove-button {
  @apply absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-bold leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600;
}

.remove-button:hover {
  @apply scale-110;
}
</style>