<template>
  <div class="app-layout">
    <nav class="side-nav">
      <div 
        class="nav-item" 
        :class="{ active: currentView === 'upload' }" 
        @click="currentView = 'upload'"
        title="手動上傳 OCR"
      >
        <span class="icon">➕</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: currentView === 'viewer' }" 
        @click="currentView = 'viewer'"
        title="目錄預覽器"
      >
        <span class="icon">📁</span>
      </div>
    </nav>

    <main class="main-view">
      
      <div v-if="currentView === 'upload'" class="view-container upload-view">
        <!-- 上傳視圖：頂部按鈕 + 中間圖片 + 右邊結果 -->
        <div class="upload-header">
          <label class="upload-btn" :class="{ disabled: isProcessing }">
            <span v-if="!isProcessing">📤 選擇圖片並辨識</span>
            <span v-else>⏳ 辨識中...</span>
            <input 
              type="file" 
              multiple 
              @change="handleFileUpload" 
              hidden 
              accept="image/*"
              :disabled="isProcessing"
            />
          </label>
          <span v-if="isProcessing" class="processing-tag">處理中...</span>
        </div>

        <div class="upload-body">
          <!-- 中間：圖片滿版顯示 -->
          <div class="image-area">
            <img v-if="previewImage" :src="previewImage" class="preview-fullscreen" />
            <div v-else class="empty-state">
              <div class="empty-icon">🖼️</div>
              <div>請上傳圖片以顯示預覽</div>
            </div>
          </div>

          <!-- 右邊：辨識結果 -->
          <div class="results-panel">
            <div class="results-header">📋 辨識結果</div>
            <div v-if="Object.keys(ocrResults).length === 0" class="empty-results">
              <div class="empty-icon">⏳</div>
              <div>等待辨識結果...</div>
            </div>
            <div v-else class="result-list">
              <div v-for="(items, key) in ocrResults" :key="key" class="field-group">
                <div class="field-key">{{ key }}:</div>
                <div v-for="(item, i) in items" :key="i" class="field-card">
                  <div class="field-text">{{ item.text || '(未辨識到文字)' }}</div>
                  <div class="field-conf">
                    信心度: <span :style="{ color: item.ocr_confidence > 0.8 ? '#2e7d32' : item.ocr_confidence > 0.5 ? '#f57c00' : '#d32f2f' }">
                      {{ (item.ocr_confidence * 100).toFixed(1) }}%
                    </span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: (item.ocr_confidence * 100) + '%', backgroundColor: item.ocr_confidence > 0.8 ? '#4caf50' : item.ocr_confidence > 0.5 ? '#ff9800' : '#f44336' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentView === 'viewer'" class="view-container viewer-view">
        <header class="top-nav">
          <div class="path-input-container">
            <input type="text" :value="rootPath" readonly placeholder="請選擇 OCR 結果目錄..." />
            <button class="select-btn" @click="handleSelectFolder">選擇目錄並載入</button>
          </div>
        </header>

        <div class="viewer-content">
          <aside class="sidebar section-card">
            <h3 class="panel-title">Image Directories</h3>
            <div class="list-wrapper">
              <ul class="directory-list">
                <li v-for="dir in directories" :key="dir" :class="{ active: selectedDir === dir }" @click="loadData(dir)">
                  📁 {{ dir }}
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
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { batchOCRProcess } from './services/ocrService.js'

// --- 狀態定義 ---
const currentView = ref('upload') // 當前視圖: 'upload' 或 'viewer'
const ocrResults = ref({}) // 右側辨識結果
const previewImage = ref(null) // 中間圖片顯示
const isProcessing = ref(false)
const currentFileName = ref('')

// Viewer 相關資料
const rootPath = ref('')
const directories = ref([])
const selectedDir = ref('')
const previewBase64 = ref('')
const ocrData = ref(null)

// --- Upload 視圖功能 ---
const handleFileUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  isProcessing.value = true
  ocrResults.value = {}

  try {
    const result = await batchOCRProcess(files)
    ocrResults.value = result.results
    
    if (result.previewImage) {
      previewImage.value = `data:image/jpeg;base64,${result.previewImage}`
    }
    currentFileName.value = result.fileName
  } catch (error) {
    console.error('OCR 失敗:', error)
    alert(`錯誤: ${error.message}`)
  } finally {
    isProcessing.value = false
  }
}

// --- Viewer 視圖功能 ---
const handleSelectFolder = async () => {
  const path = await window.api.selectFolder()
  if (path) {
    rootPath.value = path
    directories.value = await window.api.getDirectories(path)
  }
}

const loadData = async (dir) => {
  selectedDir.value = dir
  const result = await window.api.getOCRData(rootPath.value, dir)
  if (result) {
    previewBase64.value = result.imgBase64
    ocrData.value = result.jsonData
  }
}
</script>

<style scoped>
/* 側邊導航欄 */
.app-layout {
  display: flex;
  height: 100vh;
  background-color: #f4f7f9;
}

.side-nav {
  width: 60px;
  background-color: #2c3e50;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  gap: 15px;
}

.nav-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.3s;
  font-size: 20px;
  color: white;
}

.nav-item:hover {
  background-color: #34495e;
}

.nav-item.active {
  background-color: #409eff;
}

/* 主內容區 */
.main-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.view-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  gap: 12px;
}

.view-header {
  flex-shrink: 0;
  padding: 0;
  margin: 0;
}

.view-header h2 {
  margin: 0;
  padding: 12px;
  background: white;
  border-radius: 8px;
  color: #333;
  font-size: 18px;
}

/* Upload View 佈局 - 改進 */
.upload-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.upload-btn {
  background: #1e88e5;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 14px;
}

.upload-btn:hover:not(.disabled) {
  background: #1565c0;
  box-shadow: 0 2px 8px rgba(30, 136, 229, 0.3);
}

.upload-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.processing-tag {
  color: #f57c00;
  font-weight: bold;
  animation: pulse 1s infinite;
  font-size: 14px;
}

.upload-body {
  display: flex;
  flex: 1;
  gap: 12px;
  overflow: hidden;
}

.image-area {
  flex: 1;
  background: white;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.preview-fullscreen {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #999;
  font-size: 14px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.results-panel {
  width: 380px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.results-header {
  font-weight: bold;
  color: #1565c0;
  padding: 15px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
}

.empty-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
  gap: 10px;
  padding: 20px;
}

.result-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.field-group {
  margin-bottom: 20px;
}

.field-key {
  font-weight: bold;
  color: #1e88e5;
  margin-bottom: 8px;
  font-size: 13px;
}

.field-card {
  background: #f9fafc;
  border-left: 4px solid #1e88e5;
  padding: 12px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  margin-bottom: 8px;
}

.field-text {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  word-break: break-word;
  line-height: 1.4;
}

.field-conf {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #666;
}

/* 進度條樣式 */
.progress-bar {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

/* 動畫 */
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* Viewer View 佈局 */
.viewer-content {
  display: flex;
  flex: 1;
  gap: 12px;
  overflow: hidden;
}

/* 通用卡片樣式 */
.section-card {
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.panel-title {
  padding: 12px;
  background-color: #ebeef5;
  font-size: 14px;
  color: #303133;
  border-bottom: 1px solid #dcdfe6;
  margin: 0;
  font-weight: 500;
}

.image-scroll-box,
.results-scroll-box {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.preview-img {
  width: 100%;
  height: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.empty-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

/* 按鈕樣式 */
.primary-btn,
.select-btn {
  background: #409eff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.primary-btn:hover,
.select-btn:hover {
  background: #66b1ff;
}

.primary-btn:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

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
  padding: 8px 12px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

/* 欄位寬度 */
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

.directory-list li:hover {
  background-color: #ecf5ff;
}

.directory-list li.active {
  background-color: #409eff;
  color: white;
}

.preview-column {
  flex: 2;
}

.results-column {
  flex: 1.5;
}

.ocr-item-group {
  margin-bottom: 15px;
}

.field-key {
  font-weight: bold;
  color: #409eff;
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
}

.ocr-value-card {
  background: #f9fafc;
  padding: 10px;
  border-radius: 4px;
  border-left: 4px solid #409eff;
  margin-bottom: 8px;
}

.ocr-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
  word-break: break-word;
}

.ocr-meta {
  margin: 5px 0 0;
  font-size: 12px;
  color: #909399;
}

.conf-tag {
  color: #67c23a;
  font-weight: bold;
}

pre {
  margin: 0;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>