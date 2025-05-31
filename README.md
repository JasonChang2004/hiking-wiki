# Hiking Wiki 開發進度總整理（至 2025/6/1）

## 📁 專案基本架構

- 技術棧：Vue 3 + Vite + TypeScript + Pinia + Vue Router + Tailwind CSS  
- Firebase：Auth（Google 登入）、Firestore、Cloud Functions、Hosting

---

## 📂 專案目錄結構與說明

### 🔸 `src/components/`

- **`admin/`**
  - `ReviewArticles.vue`：審核文章頁（規劃中）
- **`articles/`**
  - `ArticleList.vue`：文章清單元件，包含即時搜尋功能，顯示文章列表。
  - `CategoryGrid.vue`：分類導覽按鈕區塊，提供分類瀏覽功能（如登山路線、裝備心得等）。
  - `SubmitArticle.vue`：投稿表單，支援 Markdown 編輯與即時預覽。
- **`auth/`**
  - `LoginButton.vue`：登入/登出按鈕，顯示使用者頭像與名稱。
- **`common/`**
  - `UserGreeting.vue`：首頁歡迎語元件，根據登入狀態顯示打招呼。
- **`layout/`**
  - `FeaturedCarousel.vue`：精選文章輪播，顯示 `isFeatured = true` 的文章。
  - `NavBar.vue`：導覽列元件，包含導航功能與登入狀態顯示。

### 🔸 `src/`

- **`components/`**
  - 包含各種 Vue 元件，例如 `NavBar.vue`、`FeaturedCarousel.vue` 等，負責 UI 顯示。
- **`composables/`**
  - 提供可重用的功能，例如 `useAuth.ts` 處理認證邏輯，`useArticles.ts` 管理文章。
- **`config/`**
  - 包含環境配置，例如 `environment.ts`。
- **`firebase/`**
  - Firebase 相關功能，例如 `index.ts` 初始化 Firebase，`functions.ts` 封裝後端邏輯。
- **`store/`**
  - Pinia 狀態管理，例如 `notifications.ts` 管理通知。
- **`views/`**
  - 包含主要頁面，例如 `Home.vue`、`AdminPanel.vue`。

### 🔸 `functions/`

- **`src/`**
  - 包含 Cloud Functions 的 TypeScript 源碼，例如 `index.ts`。
- **`lib/`**
  - 編譯後的 JavaScript 文件。

### 🔸 `interactive-feedback-mcp/`

- **`server.py`**
  - 提供互動式反饋功能的伺服器端邏輯。
- **`feedback_ui.py`**
  - 處理用戶界面邏輯。

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

---

## 🚀 台灣登山知識庫 - 全面優化總結

### 📋 優化概覽

本次優化涵蓋了 **效能**、**UI/UX**、**功能架構** 和 **開發體驗** 四個主要面向，共實施了 **11 項核心優化**。

#### ⚡ 效能優化 (Performance)

1. **TypeScript 配置優化**
   - 修復：移除無效的 `erasableSyntaxOnly` 編譯選項
   - 改善：更嚴格的類型檢查配置

2. **路由系統優化**
   - 新增：動態標題管理 (`meta.title`)
   - 新增：智能滾動行為 (`scrollBehavior`)
   - 新增：路由權限標記 (`requiresAuth`, `requiresAdmin`)
   - 新增：404 錯誤頁面

3. **Vite 構建優化**
   - 代碼分割：Vue、Firebase、UI 庫分離打包
   - 壓縮優化：Terser 壓縮，移除 console 和 debugger
   - 開發體驗：自動開啟瀏覽器，CORS 支持
   - 依賴預構建：加速開發服務器啟動

4. **樣式系統優化**
   - 合併 CSS：減少 HTTP 請求數量
   - 載入順序：優化樣式載入順序

5. **組件懶加載優化**
   - Suspense：添加加載狀態和錯誤邊界
   - 錯誤處理：統一的錯誤組件
   - 加載動畫：骨架屏加載效果

#### 🎨 UI/UX 優化

6. **響應式導航欄**
   - 移動端選單：完整的漢堡選單實現
   - 無障礙功能：ARIA 標籤和鍵盤導航
   - 動畫效果：流暢的展開/收合動畫
   - 點擊外部關閉：改善用戶體驗

7. **加載組件系統**
   - 多尺寸支持：sm, md, lg, xl 四種尺寸
   - 多顏色主題：blue, gray, green, red
   - 全屏遮罩：支持全屏加載狀態
   - 無障礙動畫：尊重用戶的動畫偏好設定

#### 🔧 功能架構優化

8. **Composables 架構**
   - useAuth：統一的認證狀態管理
   - useArticles：文章管理中心
   - useValidation：表單驗證系統

9. **環境配置管理**
   - 類型安全配置：完整的 TypeScript 類型定義
   - 環境變數驗證：啟動時檢查必要配置
   - 功能開關：基於環境的功能切換

10. **PWA 支持 (進行中)**
    - Service Worker：離線快取支持
    - App Manifest：可安裝的 Web 應用

---

## 🔧 導航欄問題修復總結

### 修復的問題

1. 重複顯示「山林知識庫」
   - 原因：App.vue 和 NavBar.vue 之間有樣式衝突
   - 解決方案：移除 App.vue 中重複的導航樣式

2. 通知計數錯誤顯示
   - 原因：通知 store 的初始化邏輯有問題
   - 解決方案：改進通知 store 的錯誤處理

3. 未知按鈕元素
   - 檢查項目：NavBar.vue SVG 標籤正確

---

## 🚨 快速修復指引

### 問題總結
剛才的優化導致了一些依賴問題，主要是 PWA 相關的包還沒有安裝就被使用了。

### 已修復的問題

1. **Vite 配置錯誤**
   - 移除了未安裝的 `vite-plugin-pwa` 依賴
   - 恢復基本的 Vite 配置

2. **Package.json 依賴**
   - 移除了未安裝的 PWA 相關包

3. **TypeScript 類型錯誤**
   - 修復了 `useValidation` composable 的類型問題

---

### 現在可以運行
請重新嘗試運行開發服務器：

```bash
npm run dev
```

---

### 核心優化仍然生效

- 更快的載入速度
- 完整的移動端支持
- 統一的錯誤處理
- 可重用的 Composables
- 改善的用戶體驗
