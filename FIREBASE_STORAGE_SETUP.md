# Firebase Storage 設置指南 - 整合版圖片上傳

本指南將協助您在登山知識Wiki專案中設置Firebase Storage，以支援整合在編輯器內的圖片上傳功能。

## 功能特色

✅ **無縫整合**：圖片上傳直接整合在 Markdown 編輯器中  
✅ **靈活插入**：可在任意文字位置插入圖片  
✅ **即時預覽**：上傳後立即在預覽區顯示  
✅ **Markdown 格式**：自動生成標準 Markdown 圖片語法  
✅ **多檔上傳**：支援一次選擇多張圖片  
✅ **檔案驗證**：自動檢查檔案格式和大小  

## 步驟一：啟用Firebase Storage

1. **前往Firebase控制台**
   - 打開 [Firebase Console](https://console.firebase.google.com/)
   - 選擇您的 `hiking-wiki` 專案

2. **啟用Storage服務**
   - 在左側導覽列中點擊「Storage」
   - 點擊「開始使用」按鈕
   - 選擇「以測試模式開始」（稍後會設置安全規則）
   - 選擇存儲位置（建議選擇 `asia-southeast1` 或其他亞洲區域）
   - 點擊「完成」

## 步驟二：設置安全規則

在Firebase控制台的Storage → Rules部分，將規則修改為：

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // 允許已登入用戶上傳圖片到 articles/ 目錄
    match /articles/{allPaths=**} {
      allow read: if true; // 所有人都可以讀取（圖片公開可見）
      allow write: if request.auth != null // 只有登入用戶可以上傳
                   && request.resource.size < 5 * 1024 * 1024 // 限制檔案大小為5MB
                   && request.resource.contentType.matches('image/.*'); // 只允許圖片格式
    }
    
    // 其他目錄禁止存取
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 步驟三：使用圖片上傳功能

### 編輯器操作方式

1. **插入圖片**
   - 在文章編輯器中，將游標移到要插入圖片的位置
   - 點擊工具欄中的 🖼️ 圖片按鈕
   - 選擇一張或多張圖片檔案
   - 圖片會自動上傳並插入到當前位置

2. **Markdown 格式**
   - 上傳後自動生成：`![檔案名稱](圖片URL)`
   - 可手動修改圖片描述文字
   - 支援標準 Markdown 圖片語法

3. **預覽效果**
   - 右側預覽區會即時顯示圖片
   - 支援響應式圖片顯示

### 使用技巧

- **位置插入**：先定位游標到要插入圖片的段落下方
- **批量上傳**：可一次選擇多張圖片進行上傳
- **圖片描述**：建議修改預設的檔案名稱為有意義的描述
- **版面配置**：圖片會自動換行，建議在段落間插入

## 步驟四：驗證功能

### 測試流程
1. 啟動開發服務器：`npm run dev`
2. 前往文章撰寫頁面
3. 在編輯器中輸入一些文字
4. 點擊圖片按鈕上傳圖片
5. 檢查預覽區是否正確顯示

### 檢查項目
- [ ] 圖片成功上傳到 Firebase Storage
- [ ] Markdown 語法正確生成
- [ ] 預覽區正確顯示圖片
- [ ] 文章提交時包含圖片內容

## 疑難排解

### 常見錯誤

1. **Storage bucket not configured**
   - 確認Firebase專案已啟用Storage
   - 檢查 `firebaseConfig.storageBucket` 設定

2. **Permission denied**
   - 確認已設置正確的Storage安全規則
   - 確認用戶已登入

3. **File too large**
   - 確認圖片大小在5MB以內
   - 檢查安全規則中的大小限制

4. **圖片無法顯示**
   - 檢查圖片URL是否有效
   - 確認Storage公開讀取權限

## 技術實現

### 檔案結構
```
src/
  views/
    SubmitArticlePage.vue     # 主要編輯頁面
  firebase/
    index.ts                  # Firebase配置
  types/
    index.ts                  # 類型定義
```

### 核心功能
- **圖片上傳**：使用 `uploadBytesResumable` 進行上傳
- **圖片壓縮**：自動壓縮大圖片，減少儲存空間
- **檔案命名**：時間戳 + 隨機字串 + 原檔名
- **插入位置**：基於 textarea 的 selectionStart/End
- **即時反饋**：上傳狀態與載入動畫

### 圖片壓縮設定
```javascript
// 壓縮參數（優化後）
const MAX_WIDTH = 800     // 最大寬度
const MAX_HEIGHT = 600    // 最大高度  
const QUALITY = 0.7       // 壓縮品質 (0.1-1.0)
```

**壓縮邏輯**：
- 自動偵測圖片尺寸
- 超過最大尺寸時按比例縮放
- 使用 Canvas API 重新繪製
- 保持原始檔案格式和名稱
- 壓縮失敗時自動使用原檔案
- **儲存空間優化**：相比原圖可節省 60-80% 的儲存空間

### 支援格式
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- 最大檔案大小：5MB

## 完成狀態

- [x] Firebase Storage 配置
- [x] 編輯器工具欄整合
- [x] 拖拽/點擊上傳介面移除（改為工具欄按鈕）
- [x] Markdown 語法自動生成
- [x] 即時預覽支援
- [x] 檔案驗證與錯誤處理
- [x] 上傳狀態視覺反饋
- [x] 多檔批量上傳

## 使用者體驗優化

### 編輯流程
1. 撰寫文字內容
2. 在需要的位置點擊圖片按鈕
3. 選擇圖片上傳
4. 繼續撰寫後續內容
5. 在預覽區確認效果

### 視覺反饋
- 🖼️ 正常狀態的圖片圖示
- ⏳ 上傳中的載入動畫
- ✅ 上傳完成自動插入
- ❌ 錯誤訊息提示 