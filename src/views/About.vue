<template>
  <div class="about-page">
    <!-- Hero 區塊 - 山林主題重新設計 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="title-emoji">🏔️</span>
            探索台灣山林之美
            <span class="title-accent">發現知識寶藏</span>
          </h1>
          <p class="hero-description">
            這是一個由登山愛好者共同維護的協作平台，致力於整理、分享與保存台灣山林的珍貴知識與實務經驗。
            讓我們一起建構最完整的台灣登山知識庫！
          </p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">1000+</span>
              <span class="stat-label">知識條目</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">500+</span>
              <span class="stat-label">登山路線</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">10000+</span>
              <span class="stat-label">社群成員</span>
            </div>
          </div>
          <div class="hero-actions">
            <router-link to="/submit-article" class="btn btn-primary hero-btn">
              <span class="btn-icon">✍️</span>
              開始投稿
            </router-link>
            <router-link to="/knowledge" class="btn btn-outline hero-btn">
              <span class="btn-icon">🔍</span>
              探索知識庫
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色功能區塊 -->
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">🌟 平台特色</h2>
        </div>
        <div class="features-grid">
          <div class="feature-card animate-slide-up">
            <div class="feature-icon gradient-mountain">🗺️</div>
            <h3 class="feature-title">詳細路線指南</h3>
            <p class="feature-description">提供完整的登山路線資訊，包含難度分析、注意事項及最新路況更新</p>
          </div>
          <div class="feature-card animate-slide-up">
            <div class="feature-icon gradient-earth">🎒</div>
            <h3 class="feature-title">裝備推薦</h3>
            <p class="feature-description">根據不同登山需求，提供專業的裝備選擇建議和使用心得分享</p>
          </div>
          <div class="feature-card animate-slide-up">
            <div class="feature-icon gradient-sky">🌤️</div>
            <h3 class="feature-title">天氣資訊</h3>
            <p class="feature-description">整合氣象資料，提供山區天氣預報和最佳登山時機建議</p>
          </div>
          <div class="feature-card animate-slide-up">
            <div class="feature-icon gradient-mountain">👥</div>
            <h3 class="feature-title">社群互動</h3>
            <p class="feature-description">連結登山愛好者，分享經驗、組隊登山，建立安全的登山網路</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 維基風格關於內容 -->
    <div class="wiki-theme max-w-4xl mx-auto mt-8">
      <!-- 維基風格頁面標題 -->
      <h1 class="text-3xl font-normal border-b border-wiki-border-light pb-2 mb-4">
        關於本站
      </h1>

      <!-- 維基百科風格的目錄 -->
      <div class="wiki-index mb-6">
        <div class="wiki-index-title">目錄</div>
        <ul class="wiki-index-list">
          <li><a href="#intro" class="text-wiki-link">簡介</a></li>
          <li><a href="#mission" class="text-wiki-link">我們的使命</a></li>
          <li><a href="#features" class="text-wiki-link">網站功能</a></li>
          <li><a href="#contribution" class="text-wiki-link">如何貢獻</a></li>
          <li><a href="#contact" class="text-wiki-link">聯絡我們</a></li>
          <li><a href="#references" class="text-wiki-link">參考資料</a></li>
        </ul>
      </div>

      <!-- 正文內容 - 維基風格 -->
      <div class="wiki-text">
        <section id="intro">
          <h2 class="text-2xl">簡介</h2>
          <p>
            山林知識庫是一個由台灣登山愛好者共同建立的開放知識平台，成立於2023年。本平台致力於系統性地收集、整理與分享登山相關知識，包括登山路線指南、裝備心得、安全知識、生態保育等資訊，為台灣登山社群提供可靠的知識來源。
          </p>
          <p>
            不同於一般登山論壇或社群媒體，本站採用維基百科式的內容組織方式，強調知識的結構化呈現、準確性與可靠來源，讓使用者能輕鬆找到所需資訊並了解其可信度。
          </p>
        </section>

        <section id="mission" class="mt-6">
          <h2 class="text-2xl">我們的使命</h2>
          <p>
            山林知識庫的核心使命是：透過建立一個開放、可靠的登山知識平台，提升台灣登山社群的安全意識、環境保護理念與技術水平。我們相信，透過知識的分享與傳播，能夠幫助登山者更安全地享受山林之美、更尊重地對待自然環境。
          </p>
          <div class="wiki-box wiki-box-info mt-4">
            <div class="wiki-box-title">平台核心價值</div>
            <ul>
              <li>開放性：任何人都能夠存取並貢獻內容</li>
              <li>可靠性：所有資訊經過社群審核與查證</li>
              <li>系統化：以結構化方式組織知識</li>
              <li>實用性：提供實際可應用的登山資訊</li>
            </ul>
          </div>
        </section>

        <section id="features" class="mt-6">
          <h2 class="text-2xl">網站功能</h2>
          <p>
            本平台提供以下主要功能：
          </p>
          <ul>
            <li><strong>知識條目</strong>：維基百科式的登山相關文章</li>
            <li><strong>分類索引</strong>：依主題分類的內容組織</li>
            <li><strong>會員投稿</strong>：註冊會員可提交新內容</li>
            <li><strong>社群審核</strong>：資深會員可審核內容確保品質</li>
            <li><strong>搜尋功能</strong>：快速找到相關資訊</li>
          </ul>
        </section>

        <section id="contribution" class="mt-6">
          <h2 class="text-2xl">如何貢獻</h2>
          <p>
            我們歡迎所有登山愛好者參與知識庫的建設。您可以通過以下方式貢獻：
          </p>
          <ol>
            <li>註冊會員後提交新文章</li>
            <li>修改或補充現有內容</li>
            <li>參與內容審核（需達到一定貢獻值）</li>
            <li>報告錯誤或提供改進建議</li>
          </ol>
          <p class="mt-2">
            所有貢獻者將在相應條目的歷史記錄中獲得署名，優質內容貢獻者還將獲得社群榮譽徽章。
          </p>
        </section>

        <section id="contact" class="mt-6">
          <h2 class="text-2xl">聯絡我們</h2>
          <p>
            如有任何問題、建議或合作提案，請通過以下方式聯絡我們：
          </p>
          <ul>
            <li>電子郵件：contact@hikingwiki.tw</li>
            <li>Facebook：台灣登山知識庫</li>
            <li>Instagram：@hiking_wiki_taiwan</li>
          </ul>
        </section>

        <section id="references" class="mt-6">
          <h2 class="text-2xl">參考資料</h2>
          <div class="wiki-reference-list">
            <div class="wiki-reference-item">
              [1] 台灣登山安全手冊，內政部消防署，2023
            </div>
            <div class="wiki-reference-item">
              [2] 高山環境生態保護指南，林務局，2022
            </div>
            <div class="wiki-reference-item">
              [3] 台灣百岳攀登歷史與現況，台灣山岳文化期刊，2021
            </div>
          </div>
        </section>
      </div>

      <!-- 頁面底部導航 -->
      <div class="mt-8 pt-4 border-t border-wiki-border-light flex justify-between text-sm">
        <router-link to="/" class="text-wiki-link hover:underline">
          返回首頁
        </router-link>
        <span class="text-gray-500">最後更新: 2025年5月15日</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  font-family: var(--font-body);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Hero 區塊 - 山林主題 */
.hero-section {
  position: relative;
  min-height: 50vh;
  display: flex;
  align-items: center;
  padding: var(--space-xl) 0 var(--space-lg);
  background: linear-gradient(135deg, 
    var(--mountain-50) 0%,
    var(--sky-50) 50%,
    var(--earth-50) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.hero-text {
  text-align: center;
  max-width: 800px;
}

.hero-title {
  font-size: var(--text-5xl);
  font-weight: 700;
  color: var(--stone-dark);
  margin-bottom: var(--space-lg);
  font-family: var(--font-display);
  line-height: var(--leading-tight);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-emoji {
  display: block;
  font-size: 3rem;
  margin-bottom: var(--space-sm);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.title-accent {
  display: block;
  font-size: var(--text-3xl);
  background: linear-gradient(135deg, var(--mountain-primary), var(--sky-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: var(--space-sm);
}

.hero-description {
  font-size: var(--text-lg);
  color: var(--stone-medium);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-2xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-xl);
  margin-bottom: var(--space-2xl);
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  padding: var(--space-md);
  background: rgba(255, 255, 255, 0.7);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-number {
  display: block;
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--mountain-primary);
  font-family: var(--font-display);
}

.stat-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--stone-medium);
  margin-top: var(--space-xs);
}

.hero-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}

.hero-btn {
  padding: var(--space-md) var(--space-xl);
  font-size: var(--text-base);
  border-radius: 2rem;
  min-width: 160px;
  justify-content: center;
}

/* 特色功能區塊 */
.features-section {
  padding: var(--space-xl) 0;
  background: rgba(255, 255, 255, 0.8);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-xl);
  margin-top: var(--space-2xl);
  justify-content: center;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.feature-card {
  text-align: center;
  padding: var(--space-2xl) var(--space-lg);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto var(--space-lg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  font-weight: bold;
}

.gradient-mountain {
  background: linear-gradient(135deg, var(--mountain-primary), var(--mountain-accent));
}

.gradient-earth {
  background: linear-gradient(135deg, var(--earth-primary), var(--earth-secondary));
}

.gradient-sky {
  background: linear-gradient(135deg, var(--sky-primary), var(--sky-accent));
}

.feature-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: var(--space-md);
  font-family: var(--font-display);
}

.feature-description {
  font-size: var(--text-base);
  color: var(--stone-medium);
  line-height: var(--leading-relaxed);
}

/* 通用區塊樣式 */
.section-header {
  text-align: center;
  margin-bottom: var(--space-md);
}

.section-title {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--stone-dark);
  margin-bottom: var(--space-md);
  font-family: var(--font-display);
}

/* 動畫效果 */
.animate-slide-up {
  animation: slideUp 0.6s ease-out;
  animation-fill-mode: both;
}

.animate-slide-up:nth-child(1) { animation-delay: 0.1s; }
.animate-slide-up:nth-child(2) { animation-delay: 0.2s; }
.animate-slide-up:nth-child(3) { animation-delay: 0.3s; }
.animate-slide-up:nth-child(4) { animation-delay: 0.4s; }

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 維基風格的區段間隔 */
section {
  margin-bottom: 1.5em;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .hero-section {
    min-height: 40vh;
    padding: var(--space-lg) 0 var(--space-md);
  }
  
  .hero-title {
    font-size: var(--text-3xl);
  }
  
  .title-accent {
    font-size: var(--text-xl);
  }
  
  .hero-description {
    font-size: var(--text-base);
  }
  
  .hero-stats {
    gap: var(--space-md);
  }
  
  .stat-item {
    min-width: 100px;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-btn {
    width: 100%;
    max-width: 280px;
  }
  
  .section-title {
    font-size: var(--text-2xl);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  
  .feature-card {
    padding: var(--space-xl) var(--space-md);
  }
  
  .features-section {
    padding: var(--space-lg) 0;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--space-2xl) 0;
  }
  
  .hero-content {
    padding: 0 var(--space-sm);
  }
  
  .hero-title {
    font-size: var(--text-2xl);
  }
  
  .title-emoji {
    font-size: 2rem;
  }
  
  .title-accent {
    font-size: var(--text-lg);
  }
  
  .hero-stats {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .stat-item {
    width: 100%;
  }
  
  .section-title {
    font-size: var(--text-xl);
  }
}
</style>
