<template>
  <div class="results-panel">
    <div class="results-header">📋 辨識結果</div>
    <div v-if="Object.keys(results).length === 0" class="empty-results">
      <div class="empty-icon">⏳</div>
      <div>等待辨識結果...</div>
    </div>
    <div v-else class="result-list">
      <div v-for="(items, key) in results" :key="key" class="field-group">
        <div class="field-key">{{ key }}:</div>
        <div v-for="(item, i) in items" :key="i" class="field-card">
          <div class="field-text">{{ item.text || '(未辨識到文字)' }}</div>
          <div class="field-conf">
            信心度: <span :style="{ color: getConfidenceColor(item.ocr_confidence) }">
              {{ (item.ocr_confidence * 100).toFixed(1) }}%
            </span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (item.ocr_confidence * 100) + '%', backgroundColor: getConfidenceColor(item.ocr_confidence) }"></div>
          </div>
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

const getConfidenceColor = (confidence) => {
  if (confidence > 0.8) return '#2e7d32'
  if (confidence > 0.5) return '#f57c00'
  return '#d32f2f'
}
</script>

<style scoped>
@import './OcrResultDisplay.css';
</style>
