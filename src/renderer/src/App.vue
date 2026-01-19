<template>
  <div style="height: 100vh; display: flex; flex-direction: column; font-family: Arial, sans-serif;">
    <!-- Header -->
    <div style="display: flex; padding: 12px; gap: 10px; border-bottom: 1px solid #ddd; background: white;">
      <input 
        type="text" 
        v-model="rootPath" 
        placeholder="請輸入根目錄路徑..." 
        style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" 
      />
      <button 
        @click="loadDirectory" 
        style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        確認載入
      </button>
    </div>

    <!-- Main Container -->
    <div style="flex: 1; display: flex; overflow: hidden;">
      <!-- Left Panel -->
      <div style="width: 250px; background: #f8f9fa; border-right: 1px solid #ddd; display: flex; flex-direction: column;">
        <div style="margin: 0; padding: 12px; background: #e9ecef; border-bottom: 1px solid #ddd; font-weight: bold;">
          Image Directories
        </div>
        <div style="flex: 1; overflow-y: auto;">
          <div 
            v-for="item in directoryList" 
            :key="item" 
            :style="{
              padding: '10px 12px',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
              background: selectedDir === item ? '#007bff' : 'transparent',
              color: selectedDir === item ? 'white' : 'black'
            }"
            @click="handleSelectDir(item)"
            @mouseover="$event.target.style.background = selectedDir === item ? '#007bff' : '#e9ecef'"
            @mouseout="$event.target.style.background = selectedDir === item ? '#007bff' : 'transparent'"
          >
            {{ item }}
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div style="flex: 1; display: flex; flex-direction: column;">
        <!-- Image Preview -->
        <div style="flex: 1; display: flex; flex-direction: column; border-bottom: 1px solid #ddd;">
          <div style="margin: 0; padding: 12px; background: #e9ecef; border-bottom: 1px solid #ddd; font-weight: bold;">
            imgpreview
          </div>
          <div style="flex: 1; display: flex; justify-content: center; align-items: center; padding: 20px;">
            <img 
              v-if="selectedData" 
              :src="previewImageBase64" 
              style="max-width: 100%; max-height: 100%; object-fit: contain;" 
            />
            <div v-else style="text-align: center; color: #999;">請從左側選擇目錄</div>
          </div>
        </div>

        <!-- OCR Results -->
        <div style="height: 300px; display: flex; flex-direction: column;">
          <div style="margin: 0; padding: 12px; background: #e9ecef; border-bottom: 1px solid #ddd; font-weight: bold;">
            textList
          </div>
          <div style="flex: 1; overflow-y: auto; padding: 10px;">
            <div v-if="selectedData">
              <div v-for="(dataArr, key) in selectedData.ocr_data" :key="key" style="margin-bottom: 15px; padding: 8px; border: 1px solid #eee; border-radius: 4px;">
                <div style="font-weight: bold; color: #007bff; margin-bottom: 5px;">{{ formatFieldName(key) }}:</div>
                <div style="margin-bottom: 3px;">{{ dataArr[0].text }}</div>
                <div style="font-size: 12px; color: #666;">[{{ (dataArr[0].ocr_confidence * 100).toFixed(1) }}%]</div>
              </div>
            </div>
            <div v-else style="text-align: center; color: #999; padding: 20px;">OCR 結果將顯示在此</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      rootPath: '',
      directoryList: [],
      selectedDir: null,
      selectedData: null,
      previewImageBase64: ''
    }
  },
  methods: {
    async loadDirectory() {
      if (!this.rootPath) return
      try {
        const list = await window.api.getDirectories(this.rootPath)
        this.directoryList = list
      } catch (error) {
        console.error('Error loading directory:', error)
        alert('無法載入目錄')
      }
    },

    async handleSelectDir(dirName) {
      this.selectedDir = dirName
      try {
        const data = await window.api.getOCRData(this.rootPath, dirName)
        this.selectedData = data
        this.previewImageBase64 = `data:image/jpeg;base64,${data.previewImg}`
      } catch (error) {
        console.error('Error loading OCR data:', error)
        alert('無法載入數據')
      }
    },

    formatFieldName(fieldName) {
      return fieldName.replace(/_\d+$/, '').replace(/_/g, ' ')
    }
  }
}
</script>

<style scoped>
/* 清除全域樣式衝突 */
* {
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 0 !important;
}

html, body {
  height: 100% !important;
  overflow: hidden !important;
}
</style>