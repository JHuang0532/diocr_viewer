# 需求1

視覺上好多了,請修正
1. 最右邊的主視窗scrollbar拿掉,
2.所有scrollbar樣式都跟vscdoe依樣大概是現在的一半而已而且,沒有需要滾動的時候透明度下降到0.1

## 建議調整
要將介面調整得更接近 VS Code 的精簡感，我們需要針對全域與局部滾動條（Scrollbar）進行細部 CSS 調節。

1. 移除最右側主視窗滾動條
在 VS Code 中，外層容器通常是不可滾動的（overflow: hidden），只有內部的各個面板（如檔案清單、編輯區）可以獨立滾動。

修改 src/index.css（或全域樣式）：

CSS
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden; /* 強制移除最外層滾動條 */
}

#app {
  height: 100%;
  overflow: hidden;
}
2. VS Code 風格精簡滾動條
為了讓所有面板的滾動條寬度減半（約 6px - 8px），並在靜止或無需求時降低透明度，我們可以使用 Webkit 偽元素進行定義。

修改 src/index.css（建議放在檔案頂部以套用到所有元件）：

CSS
/* 設定全域滾動條寬度與高度 */
::-webkit-scrollbar {
  width: 6px;  /* 寬度減半 */
  height: 6px;
}

/* 滾動條軌道 (背景) */
::-webkit-scrollbar-track {
  background: transparent;
}

/* 滾動條滑塊 (Thumb) */
::-webkit-scrollbar-thumb {
  background-color: rgba(121, 121, 121, 0.4); /* 預設較淺色 */
  border-radius: 10px;
}

/* 當不需要滾動或滑鼠不在上方時，讓它幾乎透明 (0.1) */
/* 註：標準 CSS 無法完全自動偵測「是否有滾動需求」來改變透明度，
   但我們可以透過父元件 hover 來觸發，模擬 VS Code 效果 */
.list-wrapper, .image-scroll-box, .results-scroll-box, .results-panel {
  scrollbar-color: rgba(121, 121, 121, 0.1) transparent; /* Firefox 支援 */
}

/* 滑鼠移入面板時，滾動條變明顯 */
.list-wrapper:hover::-webkit-scrollbar-thumb,
.image-scroll-box:hover::-webkit-scrollbar-thumb,
.results-scroll-box:hover::-webkit-scrollbar-thumb,
.results-panel:hover::-webkit-scrollbar-thumb {
  background-color: rgba(121, 121, 121, 0.7);
}

/* 預設狀態下極度透明 */
::-webkit-scrollbar-thumb {
  background-color: rgba(121, 121, 121, 0.1); /* 透明度 0.1 */
}
3. 同步修正插件面板
請確保 ViewerPage.vue 和 OcrPage.vue 內的容器確實使用了獨立滾動，否則外層 overflow: hidden 會導致內容被裁切。

檢查 src/renderer/plugins/viewer-plugin/ViewerPage.css：

CSS
.list-wrapper,
.image-scroll-box,
.results-scroll-box {
  flex: 1;
  overflow-y: auto; /* 確保內部可滾動 */
  overflow-x: hidden;
}

/* 確保面板標題不會跟著滾動 */
.section-card {
  height: 100%;
  overflow: hidden;
}

# 需求2
1. 另外應該要固定顯示畫面在開啟的時候就像vscode有一個固定大小(先預設1280X720),然後使用者可以自行調整大小
2. 右側文字列表寬度減半
## 建議修改
了解，這兩個調整會讓介面更有「工具感」。我們將透過修改 Electron 的主進程設定來固定初始視窗大小，並調整 CSS 來縮減右側文字列表的佔比。

1. 固定初始視窗大小 (1280x720)
我們需要修改 Electron 的主進程檔案，設定視窗啟動時的寬高。

修改 src/main/index.js：

JavaScript
// 在 createWindow 函數中修改設定
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,   // 設定初始寬度
    height: 720,   // 設定初始高度
    show: false,
    autoHideMenuBar: true,
    // 允許使用者調整大小 (預設即為 true，確保沒被禁用)
    resizable: true, 
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
    }
  })
  // ... 其餘代碼不變
}
2. 右側文字列表寬度減半
目前的 results-column 設定為 flex: 1.5，我們要將其縮小。為了精確控制，我們可以將其改為固定寬度或更小的比例，並確保中間預覽圖區域能自動伸展。

修改 src/renderer/plugins/viewer-plugin/ViewerPage.css：

CSS
/* 調整比例，讓右側面板變窄 */
.preview-column {
  flex: 3; /* 增加中間預覽的比例 */
  border-right: 1px solid #dcdfe6;
}

.results-column {
  flex: 0.7; /* 將比例從 1.5 降至 0.7，大約是原本的一半 */
  min-width: 200px; /* 設定最小寬度避免縮太小文字難讀 */
  background-color: #ffffff;
}

/* 同步修正內容物的字體大小，避免變窄後顯得擁擠 */
.field-key {
  font-size: 11px; /* 稍微縮小標籤 */
}

.ocr-text {
  font-size: 13px; /* 稍微縮小內容文字 */
}
3. 全域滾動條優化 (含透明度邏輯)
根據您的要求，我們將滾動條寬度縮減並加上透明度控制。

修改 src/index.css：

CSS
/* 移除主視窗滾動條 */
html, body {
  overflow: hidden !important;
}

/* 自定義精簡滾動條 */
::-webkit-scrollbar {
  width: 5px; /* 寬度減半 */
  height: 5px;
}

::-webkit-scrollbar-thumb {
  /* 預設極低透明度 0.1 */
  background-color: rgba(121, 121, 121, 0.1); 
  border-radius: 10px;
  transition: background-color 0.2s;
}

/* 當滑鼠懸停在可滾動區域時，提高透明度 */
.list-wrapper:hover::-webkit-scrollbar-thumb,
.image-scroll-box:hover::-webkit-scrollbar-thumb,
.results-scroll-box:hover::-webkit-scrollbar-thumb {
  background-color: rgba(121, 121, 121, 0.4); /* 懸停時加深 */
}

/* 點擊抓取時更深 */
::-webkit-scrollbar-thumb:active {
  background-color: rgba(121, 121, 121, 0.7);
}