# 用戶通知徽章功能指南

## 功能概述

為了改善管理員和一般用戶的UI/UX體驗，我們在用戶頭像旁邊添加了通知徽章，即時顯示：
- 📨 未讀通知數量（所有用戶）
- 📋 待審核文章數量（僅管理員）

## 視覺效果

### 通知徽章位置
- 顯示在用戶頭像右上角
- 紅色圓形徽章，帶有脈衝動畫
- 數字超過99時顯示"99+"

### 顯示邏輯
- **一般用戶**：只顯示未讀通知數量
- **管理員用戶**：顯示未讀通知 + 待審核文章的總數

### 功能詳情

#### 未讀通知
- 來源：`src/store/notifications.ts`
- 計算：查詢 `notifications` 集合中 `read: false` 的文檔數量
- 更新時機：用戶登入時自動載入

#### 待審核文章（管理員專用）
- 來源：`src/store/admin.ts`
- 計算：查詢 `articles` 集合中 `status: 'pending'` 的文檔數量
- 更新時機：管理員登入時自動載入

## 技術實現

### 檔案結構
```
src/
  store/
    notifications.ts          # 通知計數管理
    admin.ts                 # 管理員待審核計數管理
  components/
    auth/
      LoginButton.vue        # 頭像通知徽章實現
```

### 核心邏輯

#### 總通知計數
```typescript
const totalNotificationCount = computed(() => {
  let count = notificationsStore.unreadCount
  
  // 如果是管理員，加上待審核文章數量
  if (userProfile.value?.isAdmin) {
    count += adminStore.pendingArticlesCount
  }
  
  return count
})
```

#### 提示文字
滑鼠懸停時顯示詳細內容：
- 一般用戶：「3 則未讀通知」
- 管理員：「2 則未讀通知，5 篇待審核文章」

### 下拉選單整合

#### 通知中心項目
- 顯示未讀通知計數徽章
- 點擊進入完整通知列表

#### 內容審核項目（管理員專用）
- 顯示待審核文章計數徽章
- 點擊進入文章審核頁面

## 使用場景

### 一般用戶工作流程
1. 登入後，頭像上方顯示未讀通知數量
2. 點擊頭像查看下拉選單
3. 點擊「通知中心」查看詳細通知

### 管理員工作流程
1. 登入後，頭像上方顯示總通知數（通知+待審核）
2. 點擊頭像查看下拉選單
3. 「通知中心」顯示個人通知徽章
4. 「內容審核」顯示待審核文章徽章
5. 分別點擊進入相應功能頁面

## 樣式特色

### 通知徽章動畫
```css
@keyframes notificationPulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
  }
  50% { 
    transform: scale(1.1);
    box-shadow: 0 3px 8px rgba(239, 68, 68, 0.6);
  }
}
```

### 色彩設計
- **通知徽章**：紅色漸層 (`#ef4444` → `#dc2626`)
- **待審核徽章**：橙色漸層 (`#f59e0b` → `#d97706`)
- **邊框**：白色邊框確保在各種背景下清晰可見

## 數據管理

### 自動更新時機
- 用戶登入時載入
- 用戶登出時清除
- 可手動觸發重新整理

### 效能優化
- 使用 `getCountFromServer` 只獲取計數，不載入完整文檔
- 防抖機制避免頻繁請求
- 錯誤處理確保介面穩定

### Store方法

#### 通知Store (`notifications.ts`)
```typescript
// 載入未讀計數
await notificationsStore.fetchUnreadCount()

// 手動調整計數
notificationsStore.decrementUnreadCount(1)
notificationsStore.incrementUnreadCount(1)

// 重置計數
notificationsStore.resetUnread()
```

#### 管理員Store (`admin.ts`)
```typescript
// 載入待審核計數
await adminStore.fetchPendingArticlesCount()

// 手動調整計數
adminStore.decrementPendingCount(1)
adminStore.incrementPendingCount(1)

// 重置計數
adminStore.resetPendingCount()
```

## 響應式設計

- 支援各種螢幕尺寸
- 徽章大小在小螢幕上自動調整
- 提示文字適應語言長度

## 無障礙設計

- 提供 `title` 屬性顯示詳細資訊
- 支援鍵盤導航
- 高對比度模式兼容
- 減少動畫模式支援

## 完成狀態

- [x] 頭像通知徽章實現
- [x] 總計數計算邏輯
- [x] 管理員待審核計數
- [x] 下拉選單徽章整合
- [x] 自動載入和重置機制
- [x] 視覺設計和動畫效果
- [x] 提示文字和無障礙支援 