<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
import ToolCard from '@/components/ToolCard.vue'
import { useToolStore } from '@/stores/toolRegistry'

const store = useToolStore()
</script>

<template>
  <MainLayout>
    <div class="home-view">
      <!-- Recent Tools Section -->
      <section v-if="store.recentTools.length > 0 && !store.searchQuery" class="section">
        <h2 class="section-title">Recently Used</h2>
        <div class="tool-grid">
          <ToolCard 
            v-for="tool in store.recentTools" 
            :key="tool.id" 
            :tool="tool" 
          />
        </div>
      </section>

      <!-- All Tools Section -->
      <section class="section">
        <h2 class="section-title">
          {{ store.searchQuery ? 'Search Results' : 'All Tools' }}
        </h2>
        
        <div v-if="store.filteredTools.length === 0" class="empty-state">
          No tools found matching "{{ store.searchQuery }}"
        </div>

        <div v-else class="tool-grid">
          <ToolCard 
            v-for="tool in store.filteredTools" 
            :key="tool.id" 
            :tool="tool" 
          />
        </div>
      </section>
    </div>
  </MainLayout>
</template>

<style scoped>
.section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-light);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border);
}
</style>
