<template>
  <div class="app-layout">
    <nav class="side-nav">
      <div
        v-for="plugin in plugins"
        :key="plugin.name"
        class="nav-item"
        :class="{ active: activePlugin && activePlugin.name === plugin.name }"
        @click="setActivePlugin(plugin)"
        :title="plugin.description"
      >
        <div class="icon-container">
          <!-- 檔案總管 / 資料夾圖示 -->
          <svg v-if="plugin.name === 'viewer-plugin'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>

          <!-- OCR 文檔圖示 -->
          <svg v-else-if="plugin.name === 'ocr-plugin'" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>

          <!-- 預設圖示 (加號圓圈) -->
          <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </div>
      </div>
    </nav>

    <main class="main-view">
      <component :is="activePluginComponent" v-if="activePlugin" />
    </main>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, defineAsyncComponent, computed } from 'vue'

const plugins = ref([])
const activePlugin = ref(null)
const pluginComponents = shallowRef({})

// Use Vite's glob import to get all potential plugin components
const modules = import.meta.glob('../plugins/*/*.vue')

const loadPluginComponents = (pluginList) => {
  const components = {}
  for (const plugin of pluginList) {
    // Construct the path that matches the key in the `modules` object
    const path = `../plugins/${plugin.name}/${plugin.renderer}`
    if (modules[path]) {
      components[plugin.name] = defineAsyncComponent(modules[path])
    } else {
      console.error(`Component not found for plugin "${plugin.name}" at path: ${path}`)
    }
  }
  pluginComponents.value = components
}

const updatePlugins = (pluginList) => {
  console.log('Received plugin update:', pluginList)
  plugins.value = pluginList
  loadPluginComponents(pluginList)

  // If no plugin is active, or active plugin was removed, set a new one
  if (!activePlugin.value || !pluginList.some(p => p.name === activePlugin.value.name)) {
    setActivePlugin(pluginList[0] || null)
  }
}

const setActivePlugin = (plugin) => {
  activePlugin.value = plugin
}

const activePluginComponent = computed(() => {
  if (!activePlugin.value) return null
  return pluginComponents.value[activePlugin.value.name]
})

onMounted(async () => {
  // Get initial list of plugins
  const initialPlugins = await window.api.getPlugins()
  updatePlugins(initialPlugins)

  // Listen for updates
  window.api.onPluginsUpdated(updatePlugins)
})
</script>

<style scoped>
/* 應用程式佈局 */
.app-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #333333;
  margin: 0;
  padding: 0;
}

/* 側邊導航欄 - VS Code 風格 */
.side-nav {
  width: 50px;
  height: 100%;
  background-color: #333333;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0;
  margin: 0;
  flex-shrink: 0;
  border-right: 1px solid #252526;
  box-sizing: border-box;
  gap: 0;
}

/* 導航項目 */
.nav-item {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
}

/* 圖示容器與顏色控制 */
.icon-container {
  width: 24px;
  height: 24px;
  color: #858585;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  width: 100%;
  height: 100%;
}

/* Hover 狀態：圖示變亮 */
.nav-item:hover .icon-container {
  color: #e0e0e0;
}

/* Active 狀態：圖示變白 */
.nav-item.active .icon-container {
  color: #ffffff;
}

/* VS Code 風格的選中指示條 (左側白線) */
.nav-item.active {
  background-color: transparent;
  border-left: 2px solid #ffffff;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #ffffff;
  display: none;
}

/* 主內容區 */
.main-view {
  flex: 1;
  display: flex;
  background-color: #ffffff;
  margin: 0;
  padding: 0;
  overflow: hidden;
  flex-direction: column;
  box-sizing: border-box;
}
</style>