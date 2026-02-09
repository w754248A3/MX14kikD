<script setup lang="ts">
import { useToolStore } from '@/stores/toolRegistry'
import { Search } from 'lucide-vue-next'

const store = useToolStore()
</script>

<template>
  <div class="search-bar">
    <Search class="search-icon" :size="20" />
    <input 
      v-model="store.searchQuery" 
      type="text" 
      placeholder="Search tools..." 
      class="search-input"
    />
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  transition: all 0.2s;
  width: 100%;
  max-width: 400px;
}

.search-bar:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.search-icon {
  color: var(--color-text-light);
  margin-right: 0.5rem;
}

.search-input {
  border: none;
  background: transparent;
  width: 100%;
  font-size: var(--font-size-base);
  color: var(--color-text);
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-light);
}
</style>
