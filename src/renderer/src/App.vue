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
        <img v-if="selectedDirDetails && selectedDirDetails.imageUrl" :src="selectedDirDetails.imageUrl" alt="Preview" />
        <p v-else>Select a directory from the left to see the preview.</p>
      </section>

      <aside class="sidebar right-panel">
        <h2>OCR Results</h2>
        <div v-if="selectedDirDetails && selectedDirDetails.ocrData">
          <ul>
            <li v-for="(value, key) in selectedDirDetails.ocrData" :key="key">
              <strong>{{ key }}:</strong> {{ value[0].text }} (Confidence: {{ (value[0].ocr_confidence * 100).toFixed(2) }}%)
            </li>
          </ul>
        </div>
        <p v-else>OCR results will appear here.</p>
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
      selectedDirDetails: null, // To store image and OCR data
      ipcRemoval: null // To store the IPC listener cleanup function
    };
  },
  mounted() {
    // Register the IPC listener when the component is mounted
    this.ipcRemoval = window.api.onImageDirectoriesLoaded((directories) => {
      this.imageDirectories = directories;
      this.selectedDirectory = null; // Reset selection when new directories are loaded
      this.selectedDirDetails = null; // Clear details
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
    async selectDirectory(dir) {
      this.selectedDirectory = dir;
      console.log('Selected directory:', dir);
      try {
        const result = await window.api.getDirectoryDetails(this.rootDirectory, dir);
        if (result.success) {
          this.selectedDirDetails = result.details;
        } else {
          console.error('Failed to get directory details:', result.error);
          this.selectedDirDetails = null;
        }
      } catch (error) {
        console.error('Error getting directory details:', error);
        this.selectedDirDetails = null;
      }
    },
  },
};
</script>

<style>
/* Basic styling for the new layout will go here */
/* Moved to index.css for global styles */
</style>