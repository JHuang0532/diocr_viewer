<template>
  <div class="app-container">
    <header class="top-nav">
      <div class="path-input-container">
        <input type="text" :value="rootPath" readonly placeholder="請點擊右側按鈕選擇 OCR 結果目錄..." />
        <button class="select-btn" @click="handleSelectFolder">選擇目錄並載入</button>
      </div>
    </header>

    <main class="main-content">
      <aside class="sidebar section-card">
        <h3 class="panel-title">Image Directories</h3>
        <div class="list-wrapper">
          <ul class="directory-list">
            <li 
              v-for="dir in directories" 
              :key="dir" 
              :class="{ active: selectedDir === dir }"
              @click="loadData(dir)"
            >
              <span class="folder-icon">📁</span> {{ dir }}
            </li>
          </ul>
        </div>
      </aside>

      <section class="preview-column section-card">
        <h3 class="panel-title">imgpreview</h3>
        <div class="image-scroll-box" v-if="previewBase64">
          <img :src="`data:image/jpeg;base64,${previewBase64}`" class="preview-img" />
        </div>
        <div v-else class="empty-placeholder">請從左側選擇檔案</div>
      </section>

      <section class="results-column section-card">
        <h3 class="panel-title">textList</h3>
        <div class="results-scroll-box" v-if="ocrData">
          <div v-for="(val, key) in ocrData.ocr_data" :key="key" class="ocr-item-group">
            <label class="field-key">{{ key }}:</label>
            <div v-for="(item, idx) in val" :key="idx" class="ocr-value-card">
              <p class="ocr-text">{{ item.text }}</p>
              <p class="ocr-meta">信心度: <span class="conf-tag">{{ (item.ocr_confidence * 100).toFixed(1) }}%</span></p>
            </div>
          </div>
        </div>
        <div v-else class="empty-placeholder">暫無 OCR 資料</div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const rootPath = ref('')
const directories = ref([])
const selectedDir = ref('')
const previewBase64 = ref('')
const ocrData = ref(null)

const handleSelectFolder = async () => {
  // 呼叫 Electron 提供的選擇資料夾 API
  const path = await window.api.selectFolder()
  if (path) {
    rootPath.value = path
    // 取得該路徑下的所有子資料夾清單
    directories.value = await window.api.getDirectories(path)
  }
}

const loadData = async (dir) => {
  selectedDir.value = dir
  // 取得對應資料夾內的 json 與圖片 base64
  const result = await window.api.getOCRData(rootPath.value, dir)
  if (result) {
    previewBase64.value = result.imgBase64
    ocrData.value = result.jsonData
  }
}
</script>

<style scoped>
/* 全域佈局設定 */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f4f7f9;
  padding: 12px;
  box-sizing: border-box;
  gap: 12px; /* 區塊間的間距 */
}

/* 頂部導覽列 */
.top-nav {
  flex-shrink: 0;
}
.path-input-container {
  display: flex;
  gap: 8px;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.path-input-container input {
  flex: 1;
  border: 1px solid #dcdfe6;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: #f5f7fa;
}
.select-btn {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

/* 主內容區 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden; /* 防止內容撐開視窗 */
  gap: 12px;
}

/* 卡片式容器樣式 */
.section-card {
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  overflow: hidden;
}
.panel-title {
  margin: 0;
  padding: 12px;
  background-color: #ebeef5;
  font-size: 14px;
  color: #303133;
  border-bottom: 1px solid #dcdfe6;
}

/* 1. 左欄：清單 */
.sidebar {
  width: 220px;
  flex-shrink: 0;
}
.list-wrapper {
  flex: 1;
  overflow-y: auto;
}
.directory-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.directory-list li {
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f2f6fc;
  transition: all 0.2s;
}
.directory-list li:hover { background-color: #ecf5ff; }
.directory-list li.active {
  background-color: #409eff;
  color: white;
}

/* 2. 中欄：圖片預覽 (等寬並可滾動) */
.preview-column {
  flex: 2; /* 佔據較大比例 */
}
.image-scroll-box {
  flex: 1;
  overflow-y: auto; /* 超過高度時滾動 */
  overflow-x: hidden;
  padding: 10px;
  display: flex;
  justify-content: center;
}
.preview-img {
  width: 100%; /* 圖片等寬顯示 */
  height: auto;
  border: 1px solid #ebeef5;
}

/* 3. 右欄：OCR 結果 */
.results-column {
  flex: 1.5;
}
.results-scroll-box {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

/* 文字細節樣式 */
.ocr-item-group { margin-bottom: 15px; }
.field-key {
  font-weight: bold;
  color: #409eff;
  display: block;
  margin-bottom: 5px;
}
.ocr-value-card {
  background: #f9fafc;
  padding: 10px;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}
.ocr-text { margin: 0; font-size: 15px; line-height: 1.4; }
.ocr-meta { margin: 5px 0 0; font-size: 12px; color: #909399; }
.conf-tag { color: #67c23a; font-weight: bold; }

.empty-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}
</style>