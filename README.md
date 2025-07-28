# 🏔️ 台灣登山知識庫 (Hiking Wiki Taiwan)

> 台灣登山知識庫是一個專為台灣登山愛好者打造的協作知識分享平台。

---

## 📁 目錄結構簡介

- `src/`：前端主要程式碼（Vue 3 + TypeScript）
  - `components/`：各類 Vue 元件
    - `admin/`：管理員審核相關元件（如審核文章）
    - `articles/`：文章清單、分類、精選、最新等文章展示元件
    - `auth/`：登入按鈕等認證元件
    - `common/`：通用元件（錯誤訊息、圖片上傳、載入動畫、富文本編輯器、用戶歡迎語等）
    - `layout/`：整體佈局元件（導覽列、行動選單、輪播等）
  - `views/`：各頁面組件
    - `Home.vue`：首頁
    - `About.vue`：關於頁面
    - `Login.vue`：登入頁面
    - `Knowledge.vue`：知識庫主頁
    - `ArticleDetail.vue`：文章詳情頁
    - `Category.vue`：分類瀏覽頁
    - `MyArticles.vue`：我的文章管理
    - `Notifications.vue`：通知中心
    - `SubmitArticlePage.vue`：投稿頁面
    - `Review.vue`：審核頁面
    - `AdminPanel.vue`：管理員後台
    - `NotFound.vue`：404 頁面
  - `composables/`：組合式 API（如認證、文章管理等）
  - `firebase/`：Firebase 前端初始化與工具
  - `store/`：Pinia 狀態管理
  - `assets/`、`utils/`、`types/`、`config/`：靜態資源、工具、型別、環境設定
- `functions/`：Firebase Cloud Functions（後端邏輯，TypeScript）
  - `src/`：雲端函式原始碼
  - `lib/`：編譯後檔案l
- `public/`：靜態資源（favicon、manifest 等）
- `images/`：專案用圖片
- 其他根目錄檔案：專案設定、環境變數、建置設定等

---

## 🚀 本地開發快速指南

### 1. 環境需求
- Node.js 18 以上
- npm 9 以上
- Git

### 2. 下載專案
```bash
# 以 HTTPS 方式
 git clone https://github.com/your-username/hiking-wiki.git
# 或以 SSH 方式
 git clone git@github.com:your-username/hiking-wiki.git
cd hiking-wiki
```

### 3. 安裝依賴
```bash
npm install
# 或
# yarn install
```

### 4. 設定環境變數
```bash
copy .env.example .env.local
# 或手動建立 .env.local 並依照 .env.example 填寫
```

### 5. Firebase 設定
1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Authentication（Google 登入）、Cloud Firestore、Cloud Functions、Hosting
4. 將專案設定填入 `.env.local`

### 6. 啟動開發伺服器
```bash
npm run dev
```
開啟瀏覽器至 http://localhost:3000

---

## ⚙️ 其他常用指令
- `npm run build`：建置生產版本
- `npm run preview`：預覽建置結果
- `npm run lint`：程式碼檢查
- `npm run test`：執行單元測試

---

## 📄 授權
本專案採用 MIT License 授權，詳見 [LICENSE](LICENSE)。