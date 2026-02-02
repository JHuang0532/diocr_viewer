## 需求問題
可以看見我點到的'集任股份有限公司'這個文字明明就在最上面卻被劃在圖片中間,

我可以感受到我點擊右側辨識文字時整個畫面有移動並將該位置顯示在中間預覽區塊的左上角,可是黃框確畫在底下

請分析並修正這個問題
## 解決方式
根據您的描述與提供的代碼分析，黃框位移的主要原因在於 「座標系不一致」 與 「模板邏輯錯誤」。問題分析解析度不匹配 (Resolution Mismatch)：您的原始圖片寬度為 $2496px$，但瀏覽器顯示的預覽圖（bbox_mask_preview.jpg）可能經過縮放，或者 SVG 標籤沒有設定 viewBox，導致 SVG 內部的 $1$ 單位不等於圖片的 $1$ 像素。當您在 $2496px$ 的畫布上畫在 $Y=708$ 的位置時，如果 SVG 容器縮放了，框就會飄到錯誤的地方。Offset 引用錯誤：在您的 ViewerPage.vue 模板中，@focus="highlightBox(item, val[0].origin_offset)" 始終使用該欄位組（val）中 第一個項目 的偏移量。對於多行欄位（如 branch_address_4），每一行的偏移量可能不同，這會導致點擊第二行時卻套用了第一行的位移。SVG 坐標參考系缺失：<svg> 標籤缺少 viewBox 屬性，這使得內部的 polygon 點位無法根據圖片的原始解析度進行自動縮放對齊。修正方案1. 修正 ViewerPage.vue (模板與邏輯)我們需要修正 offset 的傳遞方式，並為 SVG 加入 viewBox 以鎖定原始解析度。程式碼片段<template>
  <section class="preview-column section-card">
    <h3 class="panel-title">imgpreview</h3>
    <div class="image-scroll-box" v-if="previewBase64">
      <div class="canvas-container">
        <img 
          ref="previewImg"
          :src="`data:image/jpeg;base64,${previewBase64}`" 
          class="preview-img-original" 
        />
        <svg 
          v-if="activeBox && ocrData" 
          class="overlay-svg"
          :viewBox="`0 0 ${ocrData.image_size.width} ${ocrData.image_size.height}`"
          preserveAspectRatio="none"
        >
          <polygon 
            :points="activeBoxPoints" 
            style="fill:rgba(255, 255, 0, 0.3); stroke:yellow; stroke-width:3" 
          />
        </svg>
      </div>
    </div>
    </section>

  <section class="results-column section-card">
    <h3 class="panel-title">textList</h3>
    <div class="results-scroll-box" v-if="ocrData">
      <div v-for="(val, key) in ocrData.ocr_data" :key="key" class="ocr-item-group">
        <div class="field-header">
          <label class="field-key">{{ key }}:</label>
        </div>
        <div v-for="(item, idx) in val" :key="idx" class="ocr-edit-container">
          <textarea 
            v-model="item.text" 
            class="ocr-edit-input" 
            rows="2"
            @focus="highlightBox(item, item.origin_offset)"
            @blur="activeBox = null"
          ></textarea>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// ... 其餘邏輯保持不變，highlightBox 內的 globalBox 計算是正確的 ...
</script>
2. 修正 ViewerPage.css (佈局對齊)確保畫布容器緊貼圖片，不產生額外的偏移。CSS/* 修改 ViewerPage.css */

.canvas-container {
  position: relative;
  display: inline-block; /* 讓容器寬度精確等於圖片寬度 */
  line-height: 0;
  vertical-align: top;
}

.preview-img-original {
  display: block;
  width: auto;
  max-width: none !important; /* 強制不縮放圖片，維持原始像素比例 */
  height: auto;
}

.overlay-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; /* 會自動拉伸至 .canvas-container (即圖片) 的寬度 */
  height: 100%; /* 會自動拉伸至圖片高度 */
  pointer-events: none;
  z-index: 10;
}