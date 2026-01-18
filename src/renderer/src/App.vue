<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
console.log('👋 This message is being logged by "App.vue", included via Vite')
</script>

<template>
  <div id="app">
    <div class="container">
      <h1>DIOCR Viewer</h1>
      <h2>Welcome to your Electron + Vue.js app!</h2>
      
      <div class="actions">
        <button @click="greetings">Send greeting</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    greetings() {
      console.log('Hello from Vue!')
      alert('Hello from DIOCR Viewer!')
    }
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f0f0f0;
}

#app {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  text-align: center;
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

h1 {
  color: #333;
  margin: 0 0 1rem 0;
}

h2 {
  color: #666;
  font-weight: 400;
  margin: 0 0 2rem 0;
}

.actions {
  margin-top: 2rem;
}

button {
  background: #007acc;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background: #005a9e;
}
</style>