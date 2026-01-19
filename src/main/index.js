import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import path from 'path'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Handle folder selection dialog
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: '選擇 OCR 根目錄'
    })
    if (result.canceled) {
      return null
    }
    return result.filePaths[0]
  })

  // Handle IPC for getting directories
  ipcMain.handle('get-directories', async (event, rootPath) => {
    try {
      const items = await fs.promises.readdir(rootPath, { withFileTypes: true })
      const directories = items
        .filter(item => item.isDirectory())
        .map(item => item.name)
      return directories
    } catch (error) {
      console.error('Failed to read directory:', error)
      throw error
    }
  })

  // Handle IPC for getting OCR data
  ipcMain.handle('get-ocr-data', async (event, rootPath, dirName) => {
    try {
      const dirPath = path.join(rootPath, dirName)
      const jsonPath = path.join(dirPath, 'simple_results.json')
      const imgPath = path.join(dirPath, 'bbox_mask_preview.jpg')

      // Read JSON file
      const jsonData = await fs.promises.readFile(jsonPath, 'utf-8')
      const parsedData = JSON.parse(jsonData)

      // Read image and convert to base64
      const imgBuffer = await fs.promises.readFile(imgPath)
      const imgBase64 = imgBuffer.toString('base64')

      return {
        jsonData: parsedData,
        imgBase64: imgBase64
      }
    } catch (error) {
      console.error('Failed to get OCR data:', error)
      throw error
    }
  })

  // Handle IPC for loading directory (legacy, kept for compatibility)
  ipcMain.handle('load-directory', async (event, rootDirectory) => {
    try {
      const imageDirectories = []
      const files = await fs.promises.readdir(rootDirectory, { withFileTypes: true })

      for (const file of files) {
        if (file.isDirectory()) {
          const dirPath = path.join(rootDirectory, file.name)
          const jsonFilePath = path.join(dirPath, 'simple_results.json')
          if (fs.existsSync(jsonFilePath)) {
            imageDirectories.push(file.name)
          }
        }
      }
      mainWindow.webContents.send('image-directories-loaded', imageDirectories)
      return { success: true }
    } catch (error) {
      console.error('Failed to read directory:', error)
      mainWindow.webContents.send('image-directories-loaded', []) // Send empty array on error
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('get-directory-details', async (event, rootDirectory, selectedDir) => {
    try {
      const dirPath = path.join(rootDirectory, selectedDir)
      const jsonFilePath = path.join(dirPath, 'simple_results.json')
      const imagePath = path.join(dirPath, 'bbox_mask_preview.jpg')

      // Read and parse the JSON file
      const jsonData = await fs.promises.readFile(jsonFilePath, 'utf-8')
      const ocrData = JSON.parse(jsonData)

      // Read the image file and convert it to a data URL
      const imageBuffer = await fs.promises.readFile(imagePath)
      const imageBase64 = imageBuffer.toString('base64')
      const imageUrl = `data:image/jpeg;base64,${imageBase64}`

      return { success: true, details: { ocrData: ocrData.ocr_data, imageUrl: imageUrl } }
    } catch (error) {
      console.error('Failed to get directory details:', error)
      return { success: false, error: error.message }
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s main process
// code. You can also put them in separate files and require them here.