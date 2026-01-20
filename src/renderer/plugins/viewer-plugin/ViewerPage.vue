<template>
  <div class="view-container viewer-view">
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
</template>

<script setup>
import { ref } from 'vue'

// Viewer 相關資料
const rootPath = ref('')
const directories = ref([])
const selectedDir = ref('')
const previewBase64 = ref('')
const ocrData = ref(null)

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
@import './ViewerPage.css';
</style>
