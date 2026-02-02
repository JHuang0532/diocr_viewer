<template>
  <div class="results-panel">
    <div class="panel-title">📋 辨識結果</div>
    <div v-if="Object.keys(results).length === 0" class="empty-placeholder">
      <div>等待辨識結果...</div>
    </div>
    <div v-else class="results-scroll-box">
      <div v-for="(items, key) in results" :key="key" class="ocr-item-group">
        <label class="field-key">{{ key }}:</label>
        <div v-for="(item, idx) in items" :key="idx" class="ocr-value-card">
          <p class="ocr-text">{{ item.text || '(未辨識到文字)' }}</p>
          <p class="ocr-meta">信心度: <span class="conf-tag">{{ (item.ocr_confidence * 100).toFixed(1) }}%</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  results: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.results-panel {
  width: 380px;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  flex-shrink: 0;
  min-height: 0;
}

.panel-title {
  padding: 12px;
  background-color: #ebeef5;
  font-size: 14px;
  color: #303133;
  border-bottom: 1px solid #dcdfe6;
  margin: 0;
  font-weight: 500;
  flex-shrink: 0;
}

.results-scroll-box {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
}

.empty-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

.ocr-item-group {
  margin-bottom: 15px;
  padding: 0 15px;
}

.ocr-item-group:first-child {
  padding-top: 15px;
}

.ocr-item-group:last-child {
  padding-bottom: 15px;
}

.field-key {
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
  font-size: 13px;
  display: block;
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
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  color: #303133;
}

.ocr-meta {
  margin: 8px 0 0;
  font-size: 12px;
  color: #909399;
}

.conf-tag {
  color: #67c23a;
  font-weight: bold;
}
</style>
