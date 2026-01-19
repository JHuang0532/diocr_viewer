/**
 * OCR 服務模組
 * 處理圖片上傳、Base64 轉換、API 調用
 */

// 輔助函數：從檔名提取欄位鑰值
export const parseFilenameToKey = (filename) => {
  // 從 "name_ch_2_conf0.97.jpg" 提取 "name_ch"
  const parts = filename.replace(/\.[^/.]+$/, '').split('_')
  return parts.length >= 2 ? `${parts[0]}_${parts[1]}` : 'unknown'
}

// 輔助函數：清理 OCR 文本
export const cleanOcrText = (text) => (text ? text.trim() : '')

// 將檔案轉換為 Base64
export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 批次 OCR 處理（對應 Python 的 new_ocr_service_batch）
export const batchOCRProcess = async (files) => {
  if (!files || files.length === 0) {
    throw new Error('沒有選擇檔案')
  }

  const imagesPayload = []
  const fileMapping = {}

  // 1. 將所有圖片轉為 Base64
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const base64 = await convertFileToBase64(file)

    imagesPayload.push({
      file_name: file.name,
      imgb64: base64.split(',')[1] // 移除 data:image/jpeg;base64, 前綴
    })

    fileMapping[i] = {
      filename: file.name,
      display_filename: file.name
    }
  }

  // 2. 調用 OCR API
  const response = await fetch('http://127.0.0.1:8001/api/v1/ocr/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tk: crypto.randomUUID(),
      imgs: imagesPayload
    })
  })

  if (!response.ok) {
    throw new Error(`API 錯誤: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const tempResults = {}

  // 3. 處理 API 返回結果
  if (data.results) {
    data.results.forEach((result, idx) => {
      if (!fileMapping[idx]) return

      const { filename, display_filename } = fileMapping[idx]
      const key = parseFilenameToKey(filename)

      let extractedText = ''
      let ocrConfidence = 0.0

      if (result.success) {
        const lines = result.lines || []
        // 優先處理 items 結構
        const lineTexts = lines.map((line) => {
          if (line.items && line.items.length > 0) {
            return line.items.map((it) => it.text || '').join(' ')
          }
          return line.text || ''
        })
        extractedText = lineTexts.join(' ')

        const scores = lines.map((l) => l.score || 0)
        ocrConfidence = scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0
      }

      if (!tempResults[key]) tempResults[key] = []
      tempResults[key].push({
        filename: display_filename,
        text: cleanOcrText(extractedText),
        ocr_confidence: ocrConfidence
      })
    })
  }

  return {
    results: tempResults,
    previewImage: imagesPayload[0] ? imagesPayload[0].imgb64 : null,
    fileName: fileMapping[0]?.filename || ''
  }
}

export default {
  parseFilenameToKey,
  cleanOcrText,
  convertFileToBase64,
  batchOCRProcess
}
