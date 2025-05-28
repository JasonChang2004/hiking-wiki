# Hiking Wiki 開發進度總整理（至 2025/5/29）

## 📁 專案基本架構

- 技術棧：Vue 3 + Vite + TypeScript + Pinia + Vue Router + Tailwind CSS  
- Firebase：Auth（Google 登入）、Firestore、Cloud Functions、Hosting

---

## 📂 專案目錄結構與說明

### 🔸 `src/components/`

- `ArticleList.vue`：文章清單元件（含搜尋功能）
- `HelloWorld.vue`：預設 Vue 樣板
- `LoginButton.vue`：登入/登出按鈕，顯示頭像與名稱
- `ReviewArticles.vue`：審核文章頁（規劃中）
- `SubmitArticle.vue`：投稿表單，支援 Markdown 編輯與即時預覽
- `FeaturedCarousel.vue`：精選文章輪播（顯示 `isFeatured = true` 條目）
- `CategoryGrid.vue`：分類導覽按鈕區塊（如登山路線、裝備心得等）
- `UserGreeting.vue`：首頁歡迎語元件（登入者顯示打招呼）

### 🔸 `src/firebase/`

- `index.ts`：初始化 Firebase，export auth/db/functions
- `functions.ts`：封裝 Firebase Cloud Functions
- `admins.ts`：管理 UID 權限設定（預留用）
- `authUtils.ts`：登入狀態與權限驗證工具（可擴充）

### 🔸 `src/views/`

- `Home.vue`：首頁，結合歡迎詞、精選文章、分類網格與文章列表
- `About.vue`：關於本站介紹
- `AdminPanel.vue`：管理員後台頁面，包含：
  - 管理員帳號管理（切換 isAdmin 權限）
  - 審核文章（切換 `status` 為 approved/pending）
  - 設定文章為精選（切換 `isFeatured`）
- `MyArticles.vue`：顯示登入使用者投稿文章
- `ArticleDetail.vue`：Markdown 格式文章詳情頁
- `Category.vue`：分類瀏覽頁
- `Review.vue`：審核投稿頁（規劃中）
- `Notifications.vue`：通知中心，支援標記已讀/全部已讀/文章導向

### 🔸 `src/store/`

- `notifications.ts`：Pinia 模組，管理未讀通知數（`unreadCount`）

### 🔸 其他核心檔案

- `App.vue`：主畫面含導覽列與 `<router-view />`
- `main.ts`：初始化 Vue App，註冊 Pinia、Router
- `style.css`：Tailwind 自定樣式

---

## ✅ 已完成功能模組

### 1. 🔐 Firebase Auth 登入系統

- Google 登入、顯示頭像與名稱
- 登出功能
- Navbar 顯示登入狀態

### 2. 🏠 首頁與清單元件整合

- 顯示最新文章
- 精選文章輪播區塊（`isFeatured: true`）
- 分類導覽（使用 icon + router-link）

### 3. 📄 投稿系統（SubmitArticle.vue）

- 支援 Markdown 編輯
- 即時 preview
- 預設 `status: pending`

### 4. 🔍 搜尋功能

- 即時搜尋標題與內容（內嵌於 ArticleList）

### 5. 🏷️ 分類路由

- `/category/:name` 對應特定分類
- 與搜尋共用邏輯

### 6. 📘 條目詳情

- `marked` 套件解析 Markdown 格式

### 7. 📝 我的投稿列表

- 顯示個人投稿紀錄（根據 UID 過濾）

### 8. 👑 管理員後台 `/admin`

- 管理員權限切換
- 通過/退回投稿 (`status`)
- 設為/取消精選 (`isFeatured`)

### 9. 📬 通知系統

- 發文審核自動發送通知
- `/notifications` 顯示通知清單
- 「標記已讀」、「全部標記為已讀」功能
- 支援 `articleId` 導向文章
- 導覽列顯示未讀通知紅點（Pinia 狀態控制）

### 10. 🌐 Firebase Hosting

- 使用 `vite build` → `dist`
- 支援 SPA fallback rewrite

---

## 🔜 建議擴充模組與未來規劃

- 🔖 熱門標籤與多分類篩選
- 💾 收藏功能與使用者個人頁
- 📊 投稿統計後台
- 🔔 FCM 推播通知整合

---

## 📁 Firestore 結構

### 🔹 `articles` 集合

| 欄位         | 類型       | 說明                      |
|--------------|------------|---------------------------|
| `title`      | string     | 標題                      |
| `content`    | string     | Markdown 文章內容         |
| `uid`        | string     | 發文者 UID                |
| `displayName`| string     | 發文者名稱                |
| `createdAt`  | timestamp  | serverTimestamp()         |
| `status`     | string     | pending / approved        |
| `category`   | string     | 自訂分類名稱              |
| `isFeatured` | boolean    | 是否為精選（可選欄位）    |

### 🔹 `users` 集合

| 欄位         | 類型     | 備註                      |
|--------------|----------|---------------------------|
| `displayName`| string   | Firebase displayName      |
| `email`      | string   | Firebase email            |
| `isAdmin`    | boolean  | 是否為管理員              |

### 🔹 `notifications` 集合

| 欄位         | 類型       | 說明                             |
|--------------|------------|----------------------------------|
| `uid`        | string     | 通知接收者 UID                   |
| `message`    | string     | 通知內容                         |
| `type`       | string     | 通知類型（可擴充：info/approval）|
| `read`       | boolean    | 是否已讀                         |
| `createdAt`  | timestamp  | 建立時間                         |
| `articleId`  | string     | 可選，對應文章 ID               |

---

## 🧠 補充說明

- 所有通知狀態由 `notificationsStore`（Pinia）集中管理
- Firestore 安全規則：
  - 所有人可讀
  - 只有 `admin` 可修改 `status` 與 `isFeatured`
- 管理員權限由 Cloud Function 控制（`grantAdminRole` / `revokeAdminRole`）

---

## 📌 最後備註

本專案支援完整維基協作流程：投稿、分類、審核、精選、通知、權限管理，具備擴充性與行動裝置適應性，適合部署為登山/戶外知識社群平台。

---

## 🛠️ 最近優化記錄 (2025/5/29)

### 1. 🔄 UI/UX重構優化

#### 維基風格導航欄修復
- 🐛 修復了導航欄重複出現的問題
- ✅ 優化導航欄的z-index和定位，防止與其他元素重疊
- 🖥️ 改進桌面和移動裝置視圖的導航條顯示邏輯

#### 導航元素改進
- 🔗 為首頁導航項添加exact匹配，解決路由激活狀態問題
- 📱 優化移動版選單的折疊邏輯
- 💼 確保導航項目在不同尺寸的螢幕上正確顯示

#### CSS樣式增強
- 📏 添加了white-space: nowrap防止導航項目在窄螢幕上換行
- 🎨 統一了維基風格的連結和導航樣式
- 🔍 增強了高對比度和可讀性

#### 樣式系統整合
- 🧩 改進了wiki-theme.css與Vue Router整合
- 🌐 優化網站整體佈局，確保所有頁面一致性
- 📄 添加了router-link-exact-active樣式，提升用戶體驗

### 2. 📊 效能與可用性提升

- ⚡ 修復了可能導致渲染性能問題的CSS樣式
- 🔒 增強了z-index管理，確保介面元素正確堆疊
- 🔄 優化頁面過渡和導航體驗

### 3. 📱 跨裝置一致性

- 💻 確保桌面視圖顯示完整導航欄
- 📱 優化移動裝置視圖的摺疊選單
- 🔄 改進響應式設計的斷點處理
