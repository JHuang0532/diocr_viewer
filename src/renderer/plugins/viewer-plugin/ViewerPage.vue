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
          <div class="image-container">
            <img 
              ref="previewImg"
              :src="`data:image/jpeg;base64,${previewBase64}`" 
              class="preview-img-original" 
            />
            <svg 
              v-if="activeBoxes.length > 0 && ocrData" 
              class="overlay-svg"
              :viewBox="`0 0 ${ocrData.image_size.width} ${ocrData.image_size.height}`"
              preserveAspectRatio="none"
            >
              <rect 
                v-for="(box, idx) in activeBoxes"
                :key="idx"
                :x="box.x"
                :y="box.y"
                :width="box.width"
                :height="box.height"
                style="fill:rgba(255, 255, 0, 0.2); stroke:red; stroke-width:5" 
              />
            </svg>
          </div>
        </div>
        <div v-else class="empty-placeholder">請從左側選擇檔案</div>
      </section>

      <section class="results-column section-card">
        <h3 class="panel-title">textList</h3>
        <div class="results-scroll-box" v-if="ocrData">
          <div v-for="(val, key) in ocrData.ocr_data" :key="key" class="ocr-item-group">
            <div class="field-header">
              <label class="field-key">{{ key }}:</label>
              <span v-if="val[0]" class="conf-tag-inline">{{ (val[0].ocr_confidence * 100).toFixed(1) }}%</span>
            </div>
            <div v-for="(item, idx) in val" :key="idx" class="ocr-edit-container">
              <textarea 
                v-model="item.text" 
                class="ocr-edit-input" 
                rows="2"
                @focus="highlightBox(item)"
                @blur="clearHighlight"
              ></textarea>
            </div>
          </div>
        </div>
        <div v-else class="empty-placeholder">暫無 OCR 資料</div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'

// Viewer 相關資料
const rootPath = ref('')
const directories = ref([])
const selectedDir = ref('')
const previewBase64 = ref('')
const ocrData = ref(null)

// 圖片與方框相關
const previewImg = ref(null)
const activeBoxes = ref([])

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
    activeBox.value = null
    
    // 等待圖片載入完成
    await nextTick()
  }
}

/**
 * 點擊文字框時觸發高亮
 * 直接使用 origin_offset 畫出 YOLO 的原始切割框
 * @param {Object} item - OCR 的 item 物件
 */
const highlightBox = (item) => {
  // 防呆檢查：確認是否有 origin_offset 資訊
  if (!item || !item.origin_offset) {
    activeBoxes.value = []
    return
  }
  
  const offset = item.origin_offset
  
  // 直接將 origin_offset 的資訊存入 activeBoxes
  // 這是最準確的，因為這是後端 Python 驗證過的位置
  activeBoxes.value = [{
    x: offset.x,
    y: offset.y,
    width: offset.width,
    height: offset.height
  }]
  
  console.log('Highlighting Origin Offset:', activeBoxes.value[0])
  
  // 自動捲動到框的位置
  scrollToBox(activeBoxes.value[0])
}

const clearHighlight = () => {
  activeBoxes.value = []
}

const scrollToBox = (box) => {
  if (!box) return
  
  const container = document.querySelector('.image-scroll-box')
  const imgElement = document.querySelector('.preview-img-original')
  
  if (container && imgElement && ocrData.value) {
    // 計算縮放比例：當前顯示寬度 / 原始圖片寬度
    const originalWidth = ocrData.value.image_size.width
    const currentWidth = imgElement.clientWidth
    const scale = (originalWidth > 0 && currentWidth > 0) ? (currentWidth / originalWidth) : 1
    
    console.log(`Scroll - Original: ${originalWidth}, Current: ${currentWidth}, Scale: ${scale.toFixed(3)}`)
    console.log(`Target Y (Original): ${box.y}, Scaled: ${(box.y * scale).toFixed(1)}`)
    
    // 將原始座標轉換為當前渲染座標，並預留緩衝空間
    const buffer = 100
    const targetTop = Math.max(0, (box.y * scale) - buffer)
    
    container.scrollTo({
      left: 0,
      top: targetTop,
      behavior: 'smooth'
    })
  }
}
</script>

<style scoped>
@import './ViewerPage.css';
</style>
