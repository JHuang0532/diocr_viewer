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
        <span class="icon">{{ plugin.icon || 'P' }}</span>
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
/* 側邊導航欄 */
.app-layout {
  display: flex;
  height: 100vh;
  background-color: #2c3e50;
  overflow: hidden;
}

.side-nav {
  width: 30px;
  background-color: #333333;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;
  gap: 8px;
  margin: 0;
  flex-shrink: 0;
}

.nav-item {
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-left 0.2s;
  font-size: 20px;
  color: #858585;
  border-left: 2px solid transparent;
  border-radius: 0;
}

.nav-item:hover {
  background-color: transparent;
  color: #ffffff;
}

.nav-item.active {
  background-color: transparent;
  color: #ffffff;
  border-left: 2px solid #ffffff;
}

/* 主內容區 */
.main-view {
  flex: 1;
  display: flex;
  background-color: #ffffff;
  margin: 0;
  overflow: hidden;
  flex-direction: column;
  overflow: hidden;
}
</style>