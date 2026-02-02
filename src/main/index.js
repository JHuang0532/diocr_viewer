import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, resolve } from 'path'
import { pathToFileURL } from 'url'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import path from 'path'
import chokidar from 'chokidar'

class PluginManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow
    this.plugins = new Map()
    this.pluginsDir = resolve(app.getAppPath(), 'src', 'renderer', 'plugins')
    this.watcher = null
  }

  async loadPlugins() {
    console.log('[PluginManager] Loading plugins from:', this.pluginsDir)
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true })
    }

    const pluginFolders = fs.readdirSync(this.pluginsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    for (const folder of pluginFolders) {
      const pluginPath = resolve(this.pluginsDir, folder)
      this.loadPlugin(pluginPath)
    }
  }

  loadPlugin(pluginPath) {
    const packageJsonPath = resolve(pluginPath, 'package.json')
    if (!fs.existsSync(packageJsonPath)) {
      console.error(`[PluginManager] No package.json found for plugin at ${pluginPath}`)
      return
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      const mainFile = resolve(pluginPath, packageJson.main)

      if (!fs.existsSync(mainFile)) {
        console.error(`[PluginManager] Main file not found for plugin ${packageJson.name} at ${mainFile}`)
        return
      }

      // ESM import
      import(`${pathToFileURL(mainFile).href}?t=${Date.now()}`).then(module => {
        const pluginInstance = module.activate(this.getApiForPlugin(packageJson.name))
        this.plugins.set(packageJson.name, {
          ...packageJson,
          path: pluginPath,
          instance: pluginInstance,
          // renderer is already in packageJson, no need to resolve it here
        })
        console.log(`[PluginManager] Plugin "${packageJson.name}" loaded.`)
        this.broadcastPluginList()
      }).catch(err => {
         console.error(`[PluginManager] Error loading plugin ${packageJson.name}:`, err)
      });

    } catch (error) {
      console.error(`[PluginManager] Error loading plugin at ${pluginPath}:`, error)
    }
  }
  
  unloadPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName)
    if(plugin && plugin.instance && typeof plugin.instance.deactivate === 'function') {
      plugin.instance.deactivate()
    }
    this.plugins.delete(pluginName)
    // Clear module cache
    // This is tricky with ESM. For now, we'll rely on the timestamp query string.
    console.log(`[PluginManager] Plugin "${pluginName}" unloaded.`)
    this.broadcastPluginList()
  }

  watchPlugins() {
    this.watcher = chokidar.watch(this.pluginsDir, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      depth: 1 // watch subdirectories
    });

    this.watcher.on('addDir', (path) => {
        if (path === this.pluginsDir) return;
        console.log(`[PluginManager] Detected new plugin directory: ${path}. Loading...`);
        // A short delay to allow all files to be created
        setTimeout(() => this.loadPlugin(path), 1000);
    });

    this.watcher.on('unlinkDir', (path) => {
        const pluginName = this.findPluginNameByPath(path);
        if (pluginName) {
            console.log(`[PluginManager] Detected plugin removal: ${pluginName}. Unloading...`);
            this.unloadPlugin(pluginName);
        }
    });

    // For file changes, we'll just log for now. A more robust solution would be to unload/reload.
     this.watcher.on('change', (path) => {
      console.log(`[PluginManager] File changed: ${path}. Reloading plugin...`);
      const pluginName = this.findPluginNameByPath(path);
      if (pluginName) {
        this.unloadPlugin(pluginName);
        // A short delay to ensure files are written
        setTimeout(() => this.loadPlugin(this.getPluginPathByName(pluginName)), 1000);
      }
    });
  }
  
  findPluginNameByPath(filePath) {
      for (const [name, plugin] of this.plugins.entries()) {
          if (filePath.startsWith(plugin.path)) {
              return name;
          }
      }
      return null;
  }
  
  getPluginPathByName(pluginName) {
    const plugin = this.plugins.get(pluginName)
    return plugin ? plugin.path : null;
  }

  getApiForPlugin(pluginName) {
    // This is where you would provide a sandboxed API to your plugins
    console.log(`[PluginManager] Providing API for plugin: ${pluginName}`)
    return {
      // Example API
      app: {
        getVersion: () => app.getVersion()
      },
      ipc: {
        send: (channel, ...args) => this.mainWindow.webContents.send(channel, ...args),
        invoke: (channel, ...args) => ipcMain.invoke(channel, ...args)
      }
    }
  }

  broadcastPluginList() {
    const serializablePlugins = Array.from(this.plugins.values()).map(p => ({
      name: p.name,
      version: p.version,
      description: p.description,
      renderer: p.renderer,
      icon: p.icon // Assuming icon is part of package.json
    }))
    console.log('[PluginManager] Broadcasting plugin list to renderer.')
    this.mainWindow.webContents.send('plugins-updated', serializablePlugins)
  }
  
  getPlugins() {
     const serializablePlugins = Array.from(this.plugins.values()).map(p => ({
      name: p.name,
      version: p.version,
      description: p.description,
      renderer: p.renderer,
      icon: p.icon 
    }))
    return serializablePlugins;
  }

  stopWatching() {
    if (this.watcher) {
      this.watcher.close()
    }
  }
}


function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1000,
    minHeight: 600,
    center: true,
    show: false,
    autoHideMenuBar: true,
    resizable: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false, // Keep this false
      contextIsolation: true, // Keep this true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  
  return mainWindow;
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  

  const mainWindow = createWindow()

  

    const pluginManager = new PluginManager(mainWindow);

  

  pluginManager.loadPlugins().then(() => {    pluginManager.watchPlugins();
  });


  // IPC handlers
  ipcMain.handle('get-plugins', () => {
    return pluginManager.getPlugins();
  })

  ipcMain.handle('select-folder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: '選擇 OCR 根目錄'
    })
    return canceled ? null : filePaths[0]
  })

  ipcMain.handle('get-directories', async (event, rootPath) => {
    const items = await fs.promises.readdir(rootPath, { withFileTypes: true })
    return items.filter(item => item.isDirectory()).map(item => item.name)
  })

  ipcMain.handle('get-ocr-data', async (event, rootPath, dirName) => {
    const dirPath = path.join(rootPath, dirName)
    const jsonPath = path.join(dirPath, 'simple_results.json')
    const imgPath = path.join(dirPath, 'bbox_mask_preview.jpg')

    const jsonData = await fs.promises.readFile(jsonPath, 'utf-8')
    const imgBuffer = await fs.promises.readFile(imgPath)
    
    return {
      jsonData: JSON.parse(jsonData),
      imgBase64: imgBuffer.toString('base64')
    }
  })


  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  
  app.on('before-quit', () => {
    pluginManager.stopWatching();
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})