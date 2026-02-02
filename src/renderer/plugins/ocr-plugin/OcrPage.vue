<template>
  <div class="view-container upload-view">
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
      <span v-if="elapsedTime > 0" class="elapsed-time">⏱️ {{ formatTime(elapsedTime) }}</span>
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
      <OcrResultDisplay :results="ocrResults" />
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { batchOCRProcess } from '../../src/services/ocrService.js'
import OcrResultDisplay from './OcrResultDisplay.vue'

// --- 狀態定義 ---
const ocrResults = ref({}) // 右側辨識結果
const previewImage = ref(null) // 中間圖片顯示
const isProcessing = ref(false)
const startTime = ref(null) // OCR 開始時間
const elapsedTime = ref(0) // 已經過時間（毫秒）
let timerInterval = null // 計時器 ID

// --- 時間格式化函數 ---
const formatTime = (ms) => {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`
  }
  const seconds = (ms / 1000).toFixed(2)
  return `${seconds}s`
}

// --- 開始計時 ---
const startTimer = () => {
  startTime.value = Date.now()
  elapsedTime.value = 0
  
  // 每100ms更新一次顯示
  timerInterval = setInterval(() => {
    elapsedTime.value = Date.now() - startTime.value
  }, 100)
}

// --- 停止計時 ---
const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// --- Upload 視圖功能 ---
const handleFileUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  // 1. 清空上次結果並設置預覽圖
  ocrResults.value = {}
  previewImage.value = URL.createObjectURL(files[0])
  isProcessing.value = true
  
  // 2. 開始計時
  startTimer()

  try {
    // 3. 執行 OCR
    const result = await batchOCRProcess(files)
    ocrResults.value = result.results
    
    // 如果需要，可以保留 API 回傳的 base64 圖像，但此處優先使用本地 URL
    // if (result.previewImage) {
    //   previewImage.value = `data:image/jpeg;base64,${result.previewImage}`
    // }

  } catch (error) {
    console.error('OCR 失敗:', error)
    alert(`錯誤: ${error.message}`)
  } finally {
    isProcessing.value = false
    // 4. 停止計時
    stopTimer()
  }
}

// --- 元件卸載時清理計時器 ---
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
@import './OcrPage.css';
</style>
