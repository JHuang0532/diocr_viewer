<!-- ##問題

1. icon1(上傳並且辨識的畫面),選擇圖片並辨識,選好圖片之後要馬上更新圖片,並清空右側資料
2. 右邊的NAVIGATRIONBAR要在窄一點,要有VSCODE的高級感
3. 請將APP.VUE模組化,拆分成ocr_page.vue, ocr_reuslt_display.vue 兩個頁面,並且將css也單獨出來,未來容易擴充1ㄅ -->
不需要「整個重寫」，但確實需要對目前的架構進行**「解耦」與「抽象化」**。

目前的 diocr_viewer 架構是**硬編碼（Hard-coded）**的：App.vue 裡面直接寫死了 upload 和 viewer 兩個頁面。如果你想做到像 VS Code 那樣隨插即用、Hot Reload 的插件系統，你的 App.vue 就不應該知道「有哪些頁面」，它只需要負責「提供一個空的框架」並「渲染插件提供的內容」。

以下是將你目前的專案轉型為「插件化架構」的三個核心改動方向：

1. 主程序（Main Process）的轉變：從「執行者」變成「管理員」
目前你的 src/main/index.js 處理了所有的 IPC 邏輯（如 select-folder）。在插件化架構中，你需要加入一個 Extension Manager。

改動重點：

動態監聽： 使用 chokidar 監聽專屬的 plugins/ 資料夾。

生命週期管理： 當偵測到插件代碼變動時，執行 unload (清理快取) 並重新 load。

廣播變動： 當插件更新後，透過 IPC 通知 Renderer Process（Vue 畫面）說：「插件清單更新了，請重新載入元件」。

2. 渲染程序（Renderer Process）的轉變：動態組件載入
你現在的 App.vue 透過 v-if 來切換視圖。要插件化，你必須改用 Vue 的動態組件 (<component :is="...">) 或 非同步組件 (defineAsyncComponent)。

概念範例：

程式碼片段

<template>
  <div class="app-layout">
    <nav class="side-nav">
      <div 
        v-for="plugin in installedPlugins" 
        :key="plugin.id"
        class="nav-item"
        @click="activePlugin = plugin"
      >
        <span>{{ plugin.icon }}</span>
      </div>
    </nav>

    <main class="main-view">
      <component :is="activePluginComponent" v-if="activePlugin" />
    </main>
  </div>
</template>
Hot Reload 在這裡的實作： 當 Vite 偵測到插件源碼變動，它會自動處理 HMR。如果插件是外部載入的 .js，你需要一個機制動態重新 import 該檔案。

3. API 注入：建立「標準插件協定」
你目前的 ocrService.js 是直接在元件內 import 並使用的。為了讓第三方插件也能使用 OCR 功能，你需要把這些功能包裝成一個「SDK」或「API 物件」傳給插件。

你可以這樣封裝你的 ocrService 給插件用：

JavaScript

// 你的內部 API
const internalAPI = {
  ocr: {
    batchProcess: batchOCRProcess, // 來自你寫好的 ocrService.js
    parseKey: parseFilenameToKey
  },
  ui: {
    selectFolder: window.api.selectFolder // 來自 preload
  }
};
總結：你現在該做什麼？
你不需要推翻重寫，建議採取以下漸進式步驟：

將 OcrPage.vue 和 ViewerPage.vue 視為「內建插件」：練習不要在 App.vue 直接 import 它們，而是試著用一個清單物件來描述它們（名稱、圖示、元件名稱），並用 v-for 產生側邊欄。

實作主程序監聽器：在 src/main/index.js 加入 chokidar，嘗試監聽一個測試資料夾，只要裡面檔案變動，就在控制台印出 "Plugin updated!"。

定義插件介面：規定所有插件必須有一個 index.js 並 export activate() 函數，這就是邁向 VS Code 架構的第一步。

Electron 的魔力在於，你可以從「把一個 .js 檔案動態載入進來並執行」這麼簡單的事情開始，慢慢演變成一個複雜的 Extension Host。 你目前的代碼已經有很好的基礎（IPC、Service 分離），只需加上「動態載入」的邏輯即可。