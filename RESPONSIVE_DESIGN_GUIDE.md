# 登山知識Wiki - 響應式設計系統指南

## 總覽

本專案已全面升級為現代化的響應式設計系統，支援從極小手機到超大桌面的所有設備，並提供優秀的觸控體驗和無障礙支援。

## 設計原則

### 移動優先 (Mobile First)
- 所有設計從最小螢幕開始規劃
- 逐步增強到更大螢幕
- 確保核心功能在所有設備上可用

### 觸控友好
- 所有可點擊元素最小尺寸 44x44px
- 適當的間距避免誤觸
- 觸控反饋和動畫效果

### 漸進式增強
- 基礎功能在所有設備上可用
- 高級功能在支援的設備上提供
- 降級策略確保相容性

## 響應式斷點系統

### 斷點定義
```css
--breakpoint-xs: 320px    /* 極小手機 */
--breakpoint-sm: 480px    /* 小手機 */
--breakpoint-md: 768px    /* 平板 */
--breakpoint-lg: 1024px   /* 小桌面 */
--breakpoint-xl: 1280px   /* 大桌面 */
--breakpoint-2xl: 1536px  /* 超大桌面 */
```

### 容器最大寬度
```css
--container-xs: 100%
--container-sm: 100%
--container-md: 100%
--container-lg: 1024px
--container-xl: 1280px
--container-2xl: 1536px
```

## 間距系統

### 統一間距標準
```css
--space-xs: 0.25rem     /* 4px */
--space-sm: 0.5rem      /* 8px */
--space-md: 1rem        /* 16px */
--space-lg: 1.5rem      /* 24px */
--space-xl: 2rem        /* 32px */
--space-2xl: 3rem       /* 48px */
--space-3xl: 4rem       /* 64px */
--space-4xl: 6rem       /* 96px */
```

### 使用原則
- 組件內間距：使用 `--space-xs` 到 `--space-md`
- 組件間間距：使用 `--space-lg` 到 `--space-xl`
- 區塊間距：使用 `--space-2xl` 到 `--space-4xl`

## 字體大小系統

### 響應式字體大小
```css
--text-xs: 0.75rem      /* 12px */
--text-sm: 0.875rem     /* 14px */
--text-base: 1rem       /* 16px */
--text-lg: 1.125rem     /* 18px */
--text-xl: 1.25rem      /* 20px */
--text-2xl: 1.5rem      /* 24px */
--text-3xl: 1.875rem    /* 30px */
--text-4xl: 2.25rem     /* 36px */
--text-5xl: 3rem        /* 48px */
```

### 移動端字體縮放
在極小螢幕 (<480px) 上，字體會自動縮小 10-15% 以提升可讀性。

## 網格系統

### CSS Grid 類別
```css
.grid                    /* 基礎網格容器 */
.grid-cols-1            /* 1列網格 */
.grid-cols-2            /* 2列網格 */
.grid-cols-3            /* 3列網格 */
.grid-cols-4            /* 4列網格 */
```

### 響應式網格
```css
.xs:grid-cols-1         /* 極小螢幕：1列 */
.sm:grid-cols-2         /* 小螢幕：2列 */
.md:grid-cols-3         /* 平板：3列 */
.lg:grid-cols-4         /* 桌面：4列 */
```

## 導航系統

### 桌面導航 (≥768px)
- 傳統頂部導航欄
- 固定定位
- 完整功能選單

### 移動端導航 (<768px)
- 固定頂部欄位
- 漢堡選單 + 側邊欄
- 底部導航欄（快速存取）
- 全螢幕搜索覆蓋層

### 導航特色
- 順滑動畫轉場
- 觸控優化
- 手勢支援（滑動關閉）
- 鍵盤導航支援

## 組件響應式設計

### 按鈕 (.btn)
```css
/* 基礎樣式 */
.btn {
  min-height: 44px;        /* 觸控友好 */
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
}

/* 移動端調整 */
@media (max-width: 768px) {
  .btn {
    width: 100%;           /* 全寬按鈕 */
    padding: 1rem;
  }
}
```

### 卡片 (.card)
```css
/* 桌面：3列網格 */
@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 平板：2列網格 */
@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 手機：1列網格 */
@media (max-width: 767px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
```

### 表單
```css
/* 標籤和輸入框響應式 */
@media (max-width: 768px) {
  .form-group {
    margin-bottom: var(--space-lg);
  }
  
  .form-input {
    font-size: 16px;        /* 避免iOS縮放 */
    min-height: 44px;
  }
}
```

## 圖片響應式

### 基礎圖片樣式
```css
img {
  width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
}

@media (max-width: 768px) {
  img {
    margin: 0.75rem 0;
  }
}
```

### 圖片最佳化
- 自動壓縮（800x600px, 70%品質）
- 響應式尺寸調整
- 懶載入支援
- WebP格式支援

## 效能最佳化

### CSS 最佳化
- CSS變數系統減少重複
- 統一的動畫系統
- 條件載入CSS

### JavaScript 最佳化
- 組件懶載入
- 移動端特定邏輯
- 觸控事件最佳化

### 網路最佳化
- 圖片壓縮
- 字體預載入
- 關鍵CSS內聯

## 無障礙設計

### 鍵盤導航
```css
*:focus-visible {
  outline: 2px solid var(--mountain-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```

### 螢幕閱讀器支援
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### ARIA標籤
- 適當的語義HTML
- ARIA標籤和描述
- 角色定義

## 特殊環境支援

### 高對比度模式
```css
@media (prefers-contrast: high) {
  .card {
    border: 2px solid black;
    background: white;
  }
}
```

### 減少動畫模式
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 深色模式（預留）
```css
@media (prefers-color-scheme: dark) {
  /* 深色模式樣式 */
}
```

### 列印模式
```css
@media print {
  .no-print {
    display: none !important;
  }
  
  * {
    background: white !important;
    color: black !important;
  }
}
```

## 測試指南

### 設備測試
- [ ] iPhone SE (375x667)
- [ ] iPhone 12 (390x844)
- [ ] iPad (768x1024)
- [ ] 桌面 1920x1080
- [ ] 4K 3840x2160

### 功能測試
- [ ] 觸控導航
- [ ] 鍵盤導航
- [ ] 螢幕閱讀器
- [ ] 橫向模式
- [ ] 縮放 (200%)

### 效能測試
- [ ] Lighthouse 評分 >90
- [ ] Core Web Vitals
- [ ] 3G網路載入時間

## 開發工具

### 瀏覽器開發工具
- Chrome DevTools 設備模擬
- Firefox 響應式設計模式
- Safari Web Inspector

### 線上工具
- [Responsive Design Checker](https://responsivedesignchecker.com/)
- [BrowserStack](https://www.browserstack.com/)
- [LambdaTest](https://www.lambdatest.com/)

### VS Code 擴展
- Live Server
- Responsive Viewer
- CSS Grid Highlighter

## 最佳實踐

### CSS 編寫
```css
/* ✅ 好的做法 */
.component {
  padding: var(--space-md);
  font-size: var(--text-base);
}

@media (max-width: 768px) {
  .component {
    padding: var(--space-sm);
    font-size: var(--text-sm);
  }
}

/* ❌ 避免的做法 */
.component {
  padding: 16px;
  font-size: 14px;
}
```

### 組件設計
1. 從最小螢幕開始設計
2. 使用彈性單位 (rem, %, vw)
3. 避免固定寬度和高度
4. 考慮觸控目標大小
5. 提供載入狀態

### 圖片處理
1. 使用適當的格式 (WebP, AVIF)
2. 提供多種尺寸
3. 實現懶載入
4. 設定適當的壓縮率

## 維護指南

### 定期檢查
- 每月進行跨設備測試
- 監控效能指標
- 更新響應式斷點
- 檢查新設備支援

### 更新流程
1. 測試新功能的響應式行為
2. 更新相關文檔
3. 進行完整的設備測試
4. 監控線上表現

## 故障排除

### 常見問題

**問題：移動端選單無法開啟**
```css
/* 確保 z-index 正確 */
.mobile-menu {
  z-index: 1003;
}
```

**問題：iOS Safari 縮放問題**
```css
/* 設定正確的視口 */
input {
  font-size: 16px; /* 避免縮放 */
}
```

**問題：Android Chrome 觸控延遲**
```css
/* 移除點擊延遲 */
* {
  touch-action: manipulation;
}
```

## 效能指標

### 目標指標
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
- First Input Delay < 100ms

### 監控工具
- Google PageSpeed Insights
- Chrome DevTools Lighthouse
- Web Vitals Chrome Extension

## 總結

本響應式設計系統提供了：

✅ **完整的斷點系統** - 支援所有常見設備
✅ **統一的設計變數** - 確保一致性
✅ **觸控友好介面** - 優秀的移動體驗
✅ **無障礙支援** - 符合WCAG標準
✅ **效能最佳化** - 快速載入和順暢動畫
✅ **維護性佳** - 模組化和可擴展

這個設計系統將確保登山知識Wiki在所有設備上都能提供優秀的用戶體驗。 