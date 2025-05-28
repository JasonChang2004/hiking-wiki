<template>
  <div class="wiki-theme max-w-4xl mx-auto">
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
</template>

<style scoped>
/* 維基風格的區段間隔 */
section {
  margin-bottom: 1.5em;
}
</style>
