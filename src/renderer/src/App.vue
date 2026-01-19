<template>
  <div id="app-container">
    <header class="app-header">
      <div class="load-section">
        <input type="text" v-model="rootDirectory" placeholder="Enter root directory path" class="directory-input" />
        <button @click="loadDirectory" class="load-button">Load Directory</button>
      </div>
    </header>

    <main class="app-main">
      <aside class="sidebar left-panel">
        <h2>Image Directories</h2>
        <ul class="directory-list" v-if="imageDirectories.length > 0">
          <li v-for="dir in imageDirectories" :key="dir" @click="selectDirectory(dir)" :class="{ active: selectedDirectory === dir }">
            {{ dir }}
          </li>
        </ul>
        <p v-else>No image directories found.</p>
      </aside>

      <section class="content-panel image-preview">
        <h2>Image Preview</h2>
        <!-- Image will be displayed here -->
        <p>Select a directory from the left to see the preview.</p>
      </section>

      <aside class="sidebar right-panel">
        <h2>OCR Results</h2>
        <!-- OCR results will be displayed here -->
        <p>OCR results will appear here.</p>
      </aside>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      rootDirectory: '',
      imageDirectories: [],
      selectedDirectory: null,
      ipcRemoval: null // To store the IPC listener cleanup function
    };
  },
  mounted() {
    // Register the IPC listener when the component is mounted
    this.ipcRemoval = window.api.onImageDirectoriesLoaded((directories) => {
      this.imageDirectories = directories;
      this.selectedDirectory = null; // Reset selection when new directories are loaded
    });
  },
  beforeUnmount() {
    // Clean up the IPC listener before the component is unmounted
    if (this.ipcRemoval) {
      this.ipcRemoval();
    }
  },
  methods: {
    async loadDirectory() {
      console.log('Loading directory:', this.rootDirectory);
      try {
        await window.api.loadDirectory(this.rootDirectory);
        // The imageDirectories will be updated via the IPC listener
      } catch (error) {
        console.error('Error loading directory:', error);
        alert('Failed to load directory. Check console for details.');
        this.imageDirectories = [];
      }
    },
    selectDirectory(dir) {
      this.selectedDirectory = dir;
      console.log('Selected directory:', dir);
      // TODO: Implement loading image and JSON for the selected directory
    },
  },
};
</script>

<style>
/* Basic styling for the new layout will go here */
/* Moved to index.css for global styles */
</style>