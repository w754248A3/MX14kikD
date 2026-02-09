<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const inputText = ref('Hello from BroadcastChannel!')
const responseText = ref('')
const status = ref('Initializing...')
const channel = ref<BroadcastChannel | null>(null)

// Virtual path handled by Main SW
const SCOPE = '/tools/sw-interceptor/api/'

onMounted(() => {
  if (!('serviceWorker' in navigator)) {
    status.value = 'Service Worker not supported'
    return
  }

  // Check if Main SW is active
  if (!navigator.serviceWorker.controller) {
    status.value = 'Main Service Worker not ready. Please refresh.'
    return
  }

  status.value = 'Connected to Main Service Worker'

  // Initialize BroadcastChannel
  const bc = new BroadcastChannel('sw-interceptor')
  channel.value = bc

  bc.onmessage = (event) => {
    if (event.data.type === 'CONFIRM') {
      alert('Service Worker confirmed update!')
    }
  }
})

const sendToSW = () => {
  if (!channel.value) return
  
  channel.value.postMessage({
    type: 'SET_CONTENT',
    content: inputText.value
  })
}

const fetchFromSW = async () => {
  try {
    const res = await fetch(`${SCOPE}data?t=${Date.now()}`)
    if (res.ok) {
      responseText.value = await res.text()
    } else {
      responseText.value = `Error: ${res.status} ${res.statusText}`
    }
  } catch (e) {
    responseText.value = `Fetch failed: ${(e as Error).message}`
  }
}

onUnmounted(() => {
  channel.value?.close()
})
</script>

<template>
  <div class="sw-tool">
    <div class="status-bar" :class="{ error: status.startsWith('Error') }">
      Status: {{ status }}
    </div>

    <div class="panel">
      <h3>1. Configure Content (BroadcastChannel)</h3>
      <p>Send text to Main Service Worker via BroadcastChannel.</p>
      <div class="input-group">
        <input v-model="inputText" type="text" placeholder="Enter text..." />
        <button @click="sendToSW" class="primary">Send to SW</button>
      </div>
    </div>

    <div class="panel">
      <h3>2. Verify Interception</h3>
      <p>Fetch from virtual path: <code>{{ SCOPE }}data</code></p>
      <div class="input-group">
        <button @click="fetchFromSW">Fetch from Virtual Path</button>
      </div>
      
      <div v-if="responseText" class="result">
        <strong>Response:</strong>
        <pre>{{ responseText }}</pre>
      </div>
    </div>
    
    <div class="info">
      <p>
        <strong>Architecture:</strong> Uses <code>BroadcastChannel</code> to communicate with the Main Service Worker.
        Logic is imported from <code>src/tools/sw-interceptor/sw-handler.ts</code> into <code>sw.ts</code>.
      </p>
    </div>
  </div>
</template>

<style scoped>
.sw-tool {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.status-bar {
  padding: var(--spacing-md);
  background: var(--color-background-soft);
  border-radius: var(--radius-md);
  font-family: monospace;
  border: 1px solid var(--color-border);
}

.status-bar.error {
  background: #fef2f2;
  color: var(--color-danger);
  border-color: #fecaca;
}

.panel {
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background);
}

h3 {
  margin-top: 0;
  color: var(--color-text);
}

.input-group {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

button {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  transition: all 0.2s;
}

button.primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

button.primary:hover {
  color: white;
  background: var(--color-primary-hover);
}

.result {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-background-soft);
  border-radius: var(--radius-md);
}

pre {
  margin: var(--spacing-sm) 0 0 0;
  white-space: pre-wrap;
}

.info {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  font-style: italic;
}
</style>
