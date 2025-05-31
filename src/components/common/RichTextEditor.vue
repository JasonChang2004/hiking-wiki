<template>
  <div class="rich-text-editor">
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <!-- 格式按鈕 -->
        <button
          type="button"
          @click="format('bold')"
          :class="{ 'active': isFormatActive('bold') }"
          class="format-btn"
          title="粗體 (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          @click="format('italic')"
          :class="{ 'active': isFormatActive('italic') }"
          class="format-btn"
          title="斜體 (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          @click="format('underline')"
          :class="{ 'active': isFormatActive('underline') }"
          class="format-btn"
          title="底線 (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          @click="format('strike')"
          :class="{ 'active': isFormatActive('strike') }"
          class="format-btn"
          title="刪除線"
        >
          <s>S</s>
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-group">
        <!-- 標題 -->
        <select @change="formatHeader" class="header-select" title="標題">
          <option value="">一般文字</option>
          <option value="1">標題 1</option>
          <option value="2">標題 2</option>
          <option value="3">標題 3</option>
          <option value="4">標題 4</option>
        </select>
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-group">
        <!-- 對齊 -->
        <button
          type="button"
          @click="format('align', '')"
          :class="{ 'active': isAlignActive('') }"
          class="format-btn"
          title="靠左對齊"
        >
          ⇤
        </button>
        <button
          type="button"
          @click="format('align', 'center')"
          :class="{ 'active': isAlignActive('center') }"
          class="format-btn"
          title="置中對齊"
        >
          ≡
        </button>
        <button
          type="button"
          @click="format('align', 'right')"
          :class="{ 'active': isAlignActive('right') }"
          class="format-btn"
          title="靠右對齊"
        >
          ⇥
        </button>
        <button
          type="button"
          @click="format('align', 'justify')"
          :class="{ 'active': isAlignActive('justify') }"
          class="format-btn"
          title="兩端對齊"
        >
          ≣
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-group">
        <!-- 列表 -->
        <button
          type="button"
          @click="format('list', 'ordered')"
          :class="{ 'active': isListActive('ordered') }"
          class="format-btn"
          title="數字列表"
        >
          1.
        </button>
        <button
          type="button"
          @click="format('list', 'bullet')"
          :class="{ 'active': isListActive('bullet') }"
          class="format-btn"
          title="項目列表"
        >
          •
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-group">
        <!-- 其他功能 -->
        <button
          type="button"
          @click="insertLink"
          class="format-btn"
          title="插入連結"
        >
          🔗
        </button>
        <button
          type="button"
          @click="format('blockquote')"
          :class="{ 'active': isFormatActive('blockquote') }"
          class="format-btn"
          title="引用"
        >
          "
        </button>
        <button
          type="button"
          @click="format('code-block')"
          class="format-btn"
          title="程式碼區塊"
        >
          { }
        </button>
      </div>
    </div>

    <QuillEditor
      ref="quillEditor"
      v-model:content="content"
      :options="editorOptions"
      @update:content="onContentChange"
      @selection-change="onSelectionChange"
      content-type="html"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

interface Props {
  modelValue: string
  placeholder?: string
  height?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '請輸入文章內容...',
  height: '400px'
})

const emit = defineEmits<Emits>()

const quillEditor = ref()
const content = ref(props.modelValue)
const currentFormat = ref<any>({})

const editorOptions = {
  theme: 'snow',
  placeholder: props.placeholder,
  modules: {
    toolbar: false, // 我們使用自定義工具欄
    keyboard: {
      bindings: {
        bold: {
          key: 'B',
          ctrlKey: true,
          handler: function() {
            format('bold');
            return false; // 防止預設行為
          }
        },
        italic: {
          key: 'I',
          ctrlKey: true,
          handler: function() {
            format('italic');
            return false; // 防止預設行為
          }
        },
        underline: {
          key: 'U',
          ctrlKey: true,
          handler: function() {
            format('underline');
            return false; // 防止預設行為
          }
        }
      }
    }
  }
}

// 監聽父組件的值變化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
  }
})

// 內容變化時通知父組件
const onContentChange = (value: string) => {
  content.value = value
  emit('update:modelValue', value)
}

// 選擇變化時更新格式狀態
const onSelectionChange = (range: any) => {
  if (range && quillEditor.value) {
    const quill = quillEditor.value.getQuill()
    currentFormat.value = quill.getFormat(range.index, range.length)
  }
}

// 格式化函數
const format = (formatType: string, value?: any) => {
  if (!quillEditor.value) return
  
  const quill = quillEditor.value.getQuill()
  
  // 確保編輯器有焦點
  quill.focus()
  
  switch (formatType) {
    case 'bold':
    case 'italic':
    case 'underline':
    case 'strike':
      const currentState = currentFormat.value[formatType]
      quill.format(formatType, !currentState)
      break
    case 'align':
      quill.format('align', value || false)
      break
    case 'list':
      quill.format('list', value)
      break
    case 'blockquote':
      quill.format('blockquote', !currentFormat.value.blockquote)
      break
    case 'code-block':
      quill.format('code-block', !currentFormat.value['code-block'])
      break
  }
  
  // 重新獲取格式狀態
  setTimeout(() => {
    const range = quill.getSelection()
    if (range) {
      currentFormat.value = quill.getFormat(range.index, range.length)
    }
  }, 10)
}

// 格式化標題
const formatHeader = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const level = target.value
  
  if (!quillEditor.value) return
  
  const quill = quillEditor.value.getQuill()
  quill.format('header', level || false)
  
  // 重置選擇
  target.value = ''
}

// 插入連結
const insertLink = () => {
  if (!quillEditor.value) return
  
  const quill = quillEditor.value.getQuill()
  const range = quill.getSelection()
  
  if (range) {
    const url = prompt('請輸入連結網址:')
    if (url) {
      quill.format('link', url)
    }
  }
}

// 檢查格式是否啟用
const isFormatActive = (formatType: string) => {
  return currentFormat.value[formatType] === true
}

const isAlignActive = (align: string) => {
  return currentFormat.value.align === align || (!currentFormat.value.align && align === '')
}

const isListActive = (listType: string) => {
  return currentFormat.value.list === listType
}

// 組件掛載後設置編輯器高度
onMounted(() => {
  if (quillEditor.value && quillEditor.value.$el && typeof quillEditor.value.$el.querySelector === 'function') {
    const editor = quillEditor.value.$el.querySelector('.ql-editor')
    if (editor) {
      editor.style.minHeight = props.height
    }
  }
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 4px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: #d1d5db;
  margin: 0 8px;
}

.format-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
}

.format-btn:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.format-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
}

.header-select {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
}

.header-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

/* 編輯器樣式覆蓋 */
:deep(.ql-container) {
  font-family: 'Linux Libertine', Georgia, Times, serif;
  font-size: 16px;
  line-height: 1.6;
}

:deep(.ql-editor) {
  padding: 16px;
  color: #1f2937;
}

:deep(.ql-editor.ql-blank::before) {
  color: #9ca3af;
  font-style: normal;
}

:deep(.ql-editor h1) {
  font-size: 2em;
  font-weight: 600;
  margin: 0.5em 0;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

:deep(.ql-editor h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin: 0.5em 0;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 0.2em;
}

:deep(.ql-editor h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin: 0.5em 0;
}

:deep(.ql-editor h4) {
  font-size: 1.1em;
  font-weight: 600;
  margin: 0.5em 0;
}

:deep(.ql-editor blockquote) {
  border-left: 4px solid #e5e7eb;
  margin: 16px 0;
  padding-left: 16px;
  color: #6b7280;
  font-style: italic;
}

:deep(.ql-editor pre) {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  overflow-x: auto;
}

:deep(.ql-editor ul), :deep(.ql-editor ol) {
  margin: 8px 0;
  padding-left: 24px;
}

:deep(.ql-editor li) {
  margin: 4px 0;
}

:deep(.ql-editor a) {
  color: #3b82f6;
  text-decoration: underline;
}

:deep(.ql-editor a:hover) {
  color: #1d4ed8;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .editor-toolbar {
    padding: 6px 8px;
  }
  
  .format-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .toolbar-separator {
    height: 20px;
    margin: 0 4px;
  }
  
  .header-select {
    font-size: 11px;
  }
}
</style>
