## 系統規格書
OCR系統已經辨識完成了,我們需要將這些結果顯示在畫面上,讀取特定目錄下所有圖片辨識結果,並讀取每一張圖片內的json檔案及子圖片,顯示在畫面上



目錄範例如下
1. 根目錄 (base) PS F:\WorkSpace\yolov7-seg\output\yolov7-seg_tbb_resize1280_09134>
2. 遍例下面所有檔名目錄,這邊有兩個目錄tbb08_300 & tbb15_300,這就是以檔案名稱來建立目錄
3. 每個圖片資料匣內容固定為,
```
(base) PS F:\WorkSpace\yolov7-seg\output\yolov7-seg_tbb_resize1280_09134> tree
Folder PATH listing for volume 新增磁碟區
Volume serial number is B026-DCFE
F:.
├───tbb08_300
│   └───bbox
└───tbb15_300
    └───bbox
(base) PS F:\WorkSpace\yolov7-seg\output\yolov7-seg_tbb_resize1280_09134> cd .\tbb08_300\
(base) PS F:\WorkSpace\yolov7-seg\output\yolov7-seg_tbb_resize1280_09134\tbb08_300> tree
Folder PATH listing for volume 新增磁碟區
Volume serial number is B026-DCFE
F:.
└───bbox
(base) PS F:\WorkSpace\yolov7-seg\output\yolov7-seg_tbb_resize1280_09134\tbb08_300> dir


    Directory: F:\WorkSpace\yolov7-seg\output\yolov7-seg_tbb_resize1280_09134\tbb08_300


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         2025/10/2  下午 10:22                bbox
-a----         2025/10/2  下午 10:22        2380800 bbox_mask_preview.jpg
-a----         2025/10/2  下午 10:22          23029 simple_results.json
-a----         2025/10/2  下午 10:24           9664 tbb08_300.xlsx


(base) PS F:\WorkSpace\yolov7-seg\output\yolov7-seg_tbb_resize1280_09134\tbb08_300>
```
   1. bbox(資料夾,裡面是每一個需要辨識的子圖片)
   2. bbox_mask_preview.jpg(表單被框取的位置圖片)
   3. simple_results.json (辨識結果)
   4. tbb08_300.xlsx(與正確答案相比的辨識結果統計)


1. bbox內容
    Directory: F:\WorkSpace\yolov7-seg\output\yolov7-seg_tbb_resize1280_09134\tbb08_300\bbox


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         2025/10/2  下午 10:22          23182 amount_8_conf0.95.jpg                                                                   
-a----         2025/10/2  下午 10:22          65265 benrficiary_11_conf0.94.jpg                                                             
-a----         2025/10/2  下午 10:22          47097 branch_address_5_conf0.96_line1.jpg                                                     
-a----         2025/10/2  下午 10:22          40491 branch_address_5_conf0.96_line2.jpg                                                     
-a----         2025/10/2  下午 10:22          19191 cust_account_10_conf0.94.jpg                                                            
-a----         2025/10/2  下午 10:22          42216 cust_address_2_conf0.96_line1.jpg                                                       
-a----         2025/10/2  下午 10:22          33434 cust_address_2_conf0.96_line2.jpg                                                       
-a----         2025/10/2  下午 10:22          24951 detail_of_payment_6_conf0.96.jpg                                                        
-a----         2025/10/2  下午 10:22          22786 id_no_0_conf0.99.jpg                                                                    
-a----         2025/10/2  下午 10:22          75225 name_ch_4_conf0.96.jpg                                                                  
-a----         2025/10/2  下午 10:22          58540 ordering_7_conf0.96.jpg                                                                 
-a----         2025/10/2  下午 10:22          42190 recive_account_9_conf0.94.jpg                                                           
-a----         2025/10/2  下午 10:22          62525 recive_address_1_conf0.96_line1.jpg                                                     
-a----         2025/10/2  下午 10:22          18350 recive_address_1_conf0.96_line2.jpg                                                     
-a----         2025/10/2  下午 10:22          21277 swift_code_3_conf0.96.jpg      


2. 部分json內容
   1. 可以在ocr_data中的每一個key,例如amount_8,就表示在bbox這個目錄裡面有一個這樣檔名開頭的對應的圖片
   2. 而"text": "16500000", 就是OCR的結果
   3. socre就是信心度

```
{
  "timestamp": "2025-10-02T22:22:28.654402",
  "image_path": "C:\\Users\\JHuang\\Downloads\\tbb\\tbb08_300.jpg",
  "ocr_service": "batch_ocr_api",
  "ocr_image_type": "bbox",
  "ocr_data": {
    "amount_8": [
      {
        "filename": "tbb08_300_amount_8_conf0.95.jpg",
        "text": "16500000",
        "yolo_confidence": 0.95,
        "ocr_confidence": 0.88748,
        "lines": [
          {
            "text": "16500000",
            "score": 0.88748,
            "box": null,
            "x": null,
            "y": null,
            "items": [
              {
                "index": 0,
                "x": 425.75,
                "y": 110.5,
                "text": "16500000",
                "score": 0.88748,
                "box": [
                  [
                    252.0,
                    66.0
                  ],
                  [
                    600.0,
                    67.0
                  ],
                  [
                    599.0,
                    155.0
                  ],
                  [
                    252.0,
                    154.0
                  ]
                ]
              }
            ]
          }
        ]
      }
    ],
    "benrficiary_11": [
      {
        "filename": "tbb08_300_benrficiary_11_conf0.94.jpg",
        "text": "*~Panasonic Industrial Devices Sale Ta",
        "yolo_confidence": 0.94,
        "ocr_confidence": 0.8469450000000001,
        "lines": [
          {
            "text": "*~Panasonic",
            "score": 0.84412,
            "box": null,
            "x": null,
            "y": null,
            "items": [
              {
                "index": 0,
                "x": 262.75,
                "y": 92.25,
                "text": "*~Panasonic",
                "score": 0.84412,
                "box": [
                  [
                    0.0,
                    32.0
                  ],
                  [
                    527.0,
                    45.0
                  ],
                  [
                    524.0,
                    146.0
                  ],
                  [
                    0.0,
                    146.0
                  ]
                ]
              }
            ]
          },
          {
            "text": "Industrial Devices Sale Ta",
            "score": 0.84977,
            "box": null,
            "x": null,
            "y": null,
            "items": [
              {
                "index": 1,
                "x": 1051.25,
                "y": 96.25,
                "text": "Industrial Devices Sale Ta",
                "score": 0.84977,
                "box": [
                  [
                    525.0,
                    45.0
                  ],
                  [
                    1578.0,
                    48.0
                  ],
                  [
                    1577.0,
                    146.0
                  ],
                  [
                    525.0,
                    146.0
                  ]
                ]
              }
            ]
          }
        ]
      }
    ],
```


結合上面的所有資料我希望我們的electron要功能為

1. 畫面左上角有一個載入功能,這個就是我們要輸入根目錄的地方,輸入之後點擊確認,系統開始輪巡該目錄,並找到上面的圖片資料夾,也就是上面提到的tbb08_300..
2. 將資料夾顯示在左側的清單上(簡單的資料夾列表,只是用來給使用者點選要檢視哪一張圖片的辨識結果,不需要像vscode那樣的摺疊展開功能)
3. 使用者點擊該筆圖片,例如他點到tbb08_300,那就讀取我上面提到的目錄內容,中間顯示bbox_mask_preview.jpg(表單被框取的位置圖片),右側顯示每一個欄位OCR的結果,

整個畫面從最左邊>>>最右邊

文件列表區塊 | 點擊的preovew.jpg | 個欄位辨識的文字內容&信心指數


## tasks
請先依序完成下面任務
1. 畫面左上角有一個載入功能,這個就是我們要輸入根目錄的地方,輸入之後點擊確認,系統開始輪巡該目錄,並找到上面的圖片資料夾,也就是上面提到的tbb08_300..

- 前端基礎畫面分割區塊,新增載入按鈕,點擊按鈕後可以貼上掃描目錄,點擊完成就會儲存這個目錄並且將目錄傳送後端noder,並進行目錄及仔目錄掃描
- 包含node.js讀檔, 透過icp傳送給前端顯示,最後將上面這一塊的所有目錄及內容都先打印出來,並且把圖片清單,傳到前台去,並顯示在左側

以上先完成這一塊