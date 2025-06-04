<template>
  <div class="about-page">
    <!-- Hero 區塊 - 簡潔版本 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="title-emoji">🏔️</span>
            台灣登山知識庫
            <span class="title-accent">開放協作的山林智慧平台</span>
          </h1>
          <p class="hero-description">
            由登山愛好者共同維護的協作平台，致力於整理、分享與保存台灣山林的珍貴知識與實務經驗。
            讓我們一起建構最完整的台灣登山知識庫！
          </p>
        </div>
      </div>
    </section>

    <!-- 主要內容區 -->
    <div class="main-content">
      <div class="container">
        <!-- 平台統計 -->
        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-number">1000+</div>
              <div class="stat-label">知識條目</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🥾</div>
              <div class="stat-number">500+</div>
              <div class="stat-label">登山路線</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-number">10000+</div>
              <div class="stat-label">社群成員</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-number">4.9</div>
              <div class="stat-label">使用者評分</div>
            </div>
          </div>
        </section>

        <!-- 平台介紹與特色 -->
        <section class="intro-section">
          <div class="two-column-layout">
            <!-- 左欄：關於我們 -->
            <div class="intro-content">
              <h2 class="section-title">關於我們</h2>
              <div class="intro-text">
                <p>
                  山林知識庫成立於2023年，是一個開放協作的登山知識平台。我們採用維基百科式的內容組織方式，讓所有登山愛好者都能參與知識的建構與分享。
                </p>
                <p>
                  平台強調內容的準確性、實用性與系統化，為台灣登山社群提供可靠的知識來源，幫助登山者更安全地享受山林之美。
                </p>
              </div>
              
              <h3 class="subsection-title">我們的使命</h3>
              <div class="mission-box">
                <p>透過建立開放、可靠的登山知識平台，提升台灣登山社群的安全意識、環境保護理念與技術水平。</p>
              </div>

              <h3 class="subsection-title">核心價值</h3>
              <ul class="value-list">
                <li><strong>開放性</strong> - 任何人都能存取並貢獻內容</li>
                <li><strong>可靠性</strong> - 所有資訊經過社群審核與查證</li>
                <li><strong>系統化</strong> - 以結構化方式組織知識</li>
                <li><strong>實用性</strong> - 提供實際可應用的登山資訊</li>
              </ul>
            </div>

            <!-- 右欄：平台特色 -->
            <div class="features-content">
              <h2 class="section-title">平台特色</h2>
              <div class="features-list">
                <div class="feature-item">
                  <div class="feature-icon-small gradient-mountain">🗺️</div>
                  <div class="feature-content">
                    <h4>詳細路線指南</h4>
                    <p>完整的登山路線資訊，包含難度分析、注意事項及最新路況更新</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon-small gradient-earth">🎒</div>
                  <div class="feature-content">
                    <h4>裝備推薦系統</h4>
                    <p>根據不同登山需求，提供專業的裝備選擇建議和使用心得分享</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon-small gradient-sky">🌤️</div>
                  <div class="feature-content">
                    <h4>天氣資訊整合</h4>
                    <p>整合氣象資料，提供山區天氣預報和最佳登山時機建議</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon-small gradient-forest">👥</div>
                  <div class="feature-content">
                    <h4>社群協作平台</h4>
                    <p>連結登山愛好者，分享經驗、組隊登山，建立安全的登山網路</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon-small gradient-stone">🔍</div>
                  <div class="feature-content">
                    <h4>智慧搜尋功能</h4>
                    <p>快速精準地找到所需資訊，支援多種搜尋方式和過濾條件</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon-small gradient-sunset">🏆</div>
                  <div class="feature-content">
                    <h4>成就系統</h4>
                    <p>記錄登山歷程，獲得成就徽章，與社群分享登山里程碑</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 如何參與 -->
        <section class="participation-section">
          <h2 class="section-title text-center">如何參與我們</h2>
          <div class="participation-grid">
            <div class="participation-card">
              <div class="participation-icon">✍️</div>
              <h3>投稿文章</h3>
              <p>分享您的登山經驗與知識，幫助更多登山者學習成長</p>
              <router-link to="/submit-article" class="card-link">開始投稿 →</router-link>
            </div>
            <div class="participation-card">
              <div class="participation-icon">🔧</div>
              <h3>內容審核</h3>
              <p>協助審核內容品質，確保資訊的準確性與可靠性</p>
              <div class="card-note">需要一定貢獻值</div>
            </div>
            <div class="participation-card">
              <div class="participation-icon">🐛</div>
              <h3>回報問題</h3>
              <p>發現錯誤或有改進建議？幫助我們讓平台變得更好</p>
              <div class="card-link">聯絡我們 →</div>
            </div>
            <div class="participation-card">
              <div class="participation-icon">💬</div>
              <h3>社群交流</h3>
              <p>參與討論、分享心得，與其他登山愛好者交流互動</p>
              <div class="card-link">加入社群 →</div>
            </div>
          </div>
        </section>

        <!-- 聯絡資訊 -->
        <section class="contact-section">
          <div class="contact-container">
            <div class="contact-info">
              <h2 class="section-title">聯絡我們</h2>
              <p class="contact-description">
                有任何問題、建議或合作提案，歡迎透過以下方式與我們聯絡：
              </p>
              <div class="contact-methods">
                <div class="contact-item">
                  <span class="contact-icon">📧</span>
                  <div>
                    <div class="contact-label">電子郵件</div>
                    <div class="contact-value">contact@hikingwiki.tw</div>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="contact-icon">📘</span>
                  <div>
                    <div class="contact-label">Facebook</div>
                    <div class="contact-value">台灣登山知識庫</div>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="contact-icon">📷</span>
                  <div>
                    <div class="contact-label">Instagram</div>
                    <div class="contact-value">@hiking_wiki_taiwan</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="quick-links">
              <h3>快速連結</h3>
              <ul class="links-list">
                <li><router-link to="/">返回首頁</router-link></li>
                <li><router-link to="/knowledge">知識庫</router-link></li>
                <li><router-link to="/submit-article">投稿文章</router-link></li>
                <li><a href="#top">回到頂部</a></li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 頁面底部資訊 -->
        <footer class="page-footer">
          <div class="footer-content">
            <div class="footer-text">
              © 2023-2025 台灣登山知識庫 | 由社群愛好者共同維護
            </div>
            <div class="footer-meta">
              最後更新: 2025年1月15日
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  font-family: var(--font-body);
  background: linear-gradient(to bottom, var(--mountain-50), white);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Hero 區塊 - 簡化版 */
.hero-section {
  position: relative;
  min-height: 60vh;
  display: flex;
  align-items: center;
  padding: var(--space-2xl) 0;
  background: linear-gradient(135deg, 
    var(--mountain-50) 0%,
    var(--sky-50) 50%,
    var(--earth-50) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.hero-text {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: var(--text-5xl);
  font-weight: 700;
  color: var(--stone-dark);
  margin-bottom: var(--space-lg);
  font-family: var(--font-display);
  line-height: var(--leading-tight);
}

.title-emoji {
  display: block;
  font-size: 4rem;
  margin-bottom: var(--space-md);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.title-accent {
  display: block;
  font-size: var(--text-xl);
  font-weight: 400;
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

/* 主要內容區 */
.main-content {
  background: white;
  position: relative;
  z-index: 5;
}

/* 統計區塊 */
.stats-section {
  padding: var(--space-2xl) 0;
  margin-top: -4rem;
  position: relative;
  z-index: 10;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
  max-width: 800px;
  margin: 0 auto;
}

.stat-card {
  background: white;
  padding: var(--space-xl);
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: var(--space-sm);
}

.stat-number {
  display: block;
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--mountain-primary);
  font-family: var(--font-display);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--stone-medium);
}

/* 介紹區塊 */
.intro-section {
  padding: var(--space-2xl) 0;
}

.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
  align-items: start;
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--stone-dark);
  margin-bottom: var(--space-lg);
  font-family: var(--font-display);
}

.section-title.text-center {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.subsection-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--stone-dark);
  margin: var(--space-lg) 0 var(--space-md);
  font-family: var(--font-display);
}

.intro-text p {
  font-size: var(--text-base);
  color: var(--stone-medium);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-md);
}

.mission-box {
  background: linear-gradient(135deg, var(--mountain-50), var(--sky-50));
  padding: var(--space-lg);
  border-radius: 1rem;
  border-left: 4px solid var(--mountain-primary);
  margin-bottom: var(--space-lg);
}

.mission-box p {
  font-size: var(--text-base);
  color: var(--stone-dark);
  font-weight: 500;
  margin: 0;
  line-height: var(--leading-relaxed);
}

.value-list {
  list-style: none;
  padding: 0;
}

.value-list li {
  padding: var(--space-sm) 0;
  color: var(--stone-medium);
  line-height: var(--leading-relaxed);
}

.value-list strong {
  color: var(--mountain-primary);
}

/* 特色功能列表 */
.features-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.feature-item {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
}

.feature-icon-small {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
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

.gradient-forest {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.gradient-stone {
  background: linear-gradient(135deg, #64748b, #475569);
}

.gradient-sunset {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.feature-content h4 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: var(--space-xs);
  font-family: var(--font-display);
}

.feature-content p {
  font-size: var(--text-sm);
  color: var(--stone-medium);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* 參與方式區塊 */
.participation-section {
  padding: var(--space-2xl) 0;
  background: var(--mountain-50);
}

.participation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-xl);
  margin-top: var(--space-xl);
}

.participation-card {
  background: white;
  padding: var(--space-xl);
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.participation-card:hover {
  transform: translateY(-4px);
}

.participation-icon {
  font-size: 3rem;
  margin-bottom: var(--space-lg);
}

.participation-card h3 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: var(--space-md);
  font-family: var(--font-display);
}

.participation-card p {
  font-size: var(--text-base);
  color: var(--stone-medium);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-lg);
}

.card-link {
  display: inline-block;
  color: var(--mountain-primary);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s ease;
}

.card-link:hover {
  color: var(--mountain-accent);
}

.card-note {
  font-size: var(--text-sm);
  color: var(--stone-light);
  font-style: italic;
}

/* 聯絡區塊 */
.contact-section {
  padding: var(--space-2xl) 0;
}

.contact-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-2xl);
  align-items: start;
}

.contact-description {
  font-size: var(--text-base);
  color: var(--stone-medium);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-xl);
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.contact-icon {
  font-size: 1.5rem;
  width: 3rem;
  text-align: center;
}

.contact-label {
  font-size: var(--text-sm);
  color: var(--stone-light);
  margin-bottom: var(--space-xs);
}

.contact-value {
  font-size: var(--text-base);
  color: var(--stone-dark);
  font-weight: 500;
}

.quick-links h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--stone-dark);
  margin-bottom: var(--space-md);
  font-family: var(--font-display);
}

.links-list {
  list-style: none;
  padding: 0;
}

.links-list li {
  margin-bottom: var(--space-sm);
}

.links-list a {
  color: var(--mountain-primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.links-list a:hover {
  color: var(--mountain-accent);
}

/* 頁面底部 */
.page-footer {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--stone-border);
  margin-top: var(--space-2xl);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.footer-text {
  color: var(--stone-medium);
  font-size: var(--text-sm);
}

.footer-meta {
  color: var(--stone-light);
  font-size: var(--text-xs);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .two-column-layout {
    grid-template-columns: 1fr;
    gap: var(--space-xl);
  }
  
  .contact-container {
    grid-template-columns: 1fr;
    gap: var(--space-xl);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .participation-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: var(--text-3xl);
  }
  
  .title-emoji {
    font-size: 3rem;
  }
  
  .section-title {
    font-size: var(--text-2xl);
  }
  
  .hero-description {
    font-size: var(--text-lg);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: var(--text-2xl);
  }
  
  .title-emoji {
    font-size: 2.5rem;
  }
  
  .contact-methods {
    gap: var(--space-md);
  }
  
  .contact-item {
    flex-direction: column;
    text-align: center;
    gap: var(--space-sm);
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
