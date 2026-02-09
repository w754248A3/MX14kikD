<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'

const input = useStorage('tool-text-displayer-input', '')
const mode = ref('normal') // normal, uppercase, lowercase, json

const output = computed(() => {
  if (!input.value) return ''
  
  try {
    switch (mode.value) {
      case 'uppercase':
        return input.value.toUpperCase()
      case 'lowercase':
        return input.value.toLowerCase()
      case 'json':
        return JSON.stringify(JSON.parse(input.value), null, 2)
      case 'lines':
        return input.value.split('\n').map((line, i) => `${i + 1}: ${line}`).join('\n')
      default:
        return input.value
    }
  } catch (e) {
    return `Error: ${(e as Error).message}`
  }
})

const stats = computed(() => {
  return {
    chars: input.value.length,
    words: input.value.trim() ? input.value.trim().split(/\s+/).length : 0,
    lines: input.value.split('\n').length
  }
})

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(output.value)
    alert('Copied!')
  } catch (e) {
    alert('Failed to copy')
  }
}
</script>

<template>
  <div class="text-tool">
    <div class="controls">
      <div class="mode-select">
        <button 
          v-for="m in ['normal', 'uppercase', 'lowercase', 'json', 'lines']" 
          :key="m"
          :class="{ active: mode === m }"
          @click="mode = m"
        >
          {{ m.charAt(0).toUpperCase() + m.slice(1) }}
        </button>
      </div>
      <div class="actions">
        <button @click="input = ''">Clear</button>
        <button @click="copyToClipboard" class="primary">Copy Result</button>
      </div>
    </div>

    <div class="editor-layout">
      <div class="pane">
        <label>Input</label>
        <textarea v-model="input" placeholder="Enter text here..."></textarea>
        <div class="stats">
          {{ stats.chars }} chars | {{ stats.words }} words | {{ stats.lines }} lines
        </div>
      </div>
      <div class="pane">
        <label>Output</label>
        <textarea readonly :value="output" class="output-area"></textarea>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-tool {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 600px;
}

.controls {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.mode-select, .actions {
  display: flex;
  gap: var(--spacing-xs);
}

button {
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-background);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  transition: all 0.2s;
}

button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

button.primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

button.primary:hover {
  background: var(--color-primary-hover);
}

.editor-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .editor-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
}

.pane {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

label {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

textarea {
  flex: 1;
  resize: none;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: monospace;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  background: var(--color-background-soft);
}

textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-background);
}

.output-area {
  background: #f1f5f9;
}

.stats {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  text-align: right;
}
</style>
