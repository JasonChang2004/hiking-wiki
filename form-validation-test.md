# 表單驗證問題修復測試

## 問題描述
用戶反映在輸入文章標題或參考資料時，系統會強制要求先輸入文章內容。

## 修復內容

### 1. 問題根因
- 在 Vue 模板中直接對 reactive 變數調用 `.trim()` 方法
- 表單驗證邏輯錯誤，導致不當的必填欄位檢查

### 2. 修復方案
- 創建 `isFormValid` 計算屬性來處理表單驗證
- 修復提交按鈕的禁用邏輯
- 改進編輯模式下的同意條款顯示邏輯

### 3. 具體變更
```typescript
// 新增計算屬性
const isFormValid = computed(() => {
  const hasRequiredFields = title.value.trim() && content.value.trim() && category.value
  const hasAgreement = agreeTerms.value || articleId.value // 編輯時不需要重新同意條款
  return hasRequiredFields && hasAgreement && !submitting.value
})

const needsAgreement = computed(() => {
  return !articleId.value
})
```

```html
<!-- 修復後的提交按鈕 -->
<button
  type="submit"
  class="wiki-button"
  :disabled="!isFormValid"
  :class="{'opacity-50 cursor-not-allowed': !isFormValid}"
>
  {{ submitting ? '提交中...' : (articleId ? '更新文章' : '提交審核') }}
</button>

<!-- 條件式顯示同意條款 -->
<div v-if="needsAgreement" class="flex items-start mb-4">
  <!-- 同意條款內容 -->
</div>
```

## 測試步驟

### 測試 1: 新建文章
1. 開啟 http://localhost:3005
2. 登入帳戶
3. 點擊「撰寫新文章」
4. **測試重點**: 嘗試在「文章標題」欄位輸入文字
   - ✅ 應該可以正常輸入，不會被強制要求先填寫內容
5. **測試重點**: 嘗試在「參考資料」欄位輸入文字
   - ✅ 應該可以正常輸入，不會被強制要求先填寫內容
6. 觀察提交按鈕狀態
   - 只有當「標題」、「內容」、「分類」都填寫且勾選同意條款時才會啟用

### 測試 2: 編輯文章
1. 編輯一篇現有文章
2. **測試重點**: 確認不會顯示同意條款核取方塊
3. **測試重點**: 可以正常修改標題和參考資料
4. 提交按鈕邏輯正確

### 測試 3: 表單驗證
1. 嘗試各種欄位組合
2. 確認只有在必填欄位（標題、內容、分類）都填寫時才能提交
3. 新文章需要勾選同意條款，編輯文章不需要

## 預期結果
- ✅ 可以自由輸入標題和參考資料，不會被強制要求先填寫內容
- ✅ 表單驗證邏輯正確，只在真正需要時禁用提交按鈕
- ✅ 編輯模式下不會強制要求重新同意條款
- ✅ 所有輸入欄位都能正常工作

## 備註
此修復解決了 Vue 3 中 reactive 變數在模板中的正確使用方式，並改進了表單驗證的用戶體驗。
