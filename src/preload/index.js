import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Folder selection API
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  // New simplified API
  getDirectories: (rootPath) => ipcRenderer.invoke('get-directories', rootPath),
  getOCRData: (rootPath, dirName) => ipcRenderer.invoke('get-ocr-data', rootPath, dirName),

  // Plugin API
  getPlugins: () => ipcRenderer.invoke('get-plugins'),
  onPluginsUpdated: (callback) => ipcRenderer.on('plugins-updated', (_event, plugins) => callback(plugins)),

  // Legacy API (kept for compatibility)
  loadDirectory: (rootDirectory) => ipcRenderer.invoke('load-directory', rootDirectory),
  getDirectoryDetails: (rootDirectory, selectedDir) =>
    ipcRenderer.invoke('get-directory-details', rootDirectory, selectedDir),
  onImageDirectoriesLoaded: (callback) =>
    ipcRenderer.on('image-directories-loaded', (_event, value) => callback(value))
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}