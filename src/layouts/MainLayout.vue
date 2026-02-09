<script setup lang="ts">
import SearchBar from '@/components/SearchBar.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="router.push('/')">
          <img src="/vite.svg" alt="Logo" class="logo-img" />
          <span class="logo-text">Toolkit</span>
        </div>
        
        <div class="header-search">
          <SearchBar />
        </div>
      </div>
    </header>

    <main class="main-content">
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 0 var(--spacing-md);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 700;
  font-size: var(--font-size-xl);
  color: var(--color-primary);
}

.logo-img {
  height: 32px;
  margin-right: var(--spacing-sm);
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md);
}

@media (max-width: 640px) {
  .header-content {
    gap: var(--spacing-md);
  }
  
  .logo-text {
    display: none;
  }
}
</style>
