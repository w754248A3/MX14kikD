<script setup lang="ts">
import type { Tool } from '@/types/tool'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

const props = defineProps<{
  tool: Tool
}>()

const router = useRouter()

const openTool = () => {
  router.push(`/tools/${props.tool.id}`)
}

// Dynamically resolve icon if it's a string name of a Lucide icon
const iconComponent = computed(() => {
  if (typeof props.tool.icon === 'string') {
    return (LucideIcons as any)[props.tool.icon] || LucideIcons.Box
  }
  return props.tool.icon
})
</script>

<template>
  <div class="tool-card" @click="openTool">
    <div class="card-icon">
      <component :is="iconComponent" :size="32" />
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ tool.name }}</h3>
      <p class="card-desc">{{ tool.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.tool-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: var(--color-primary);
}

.card-icon {
  color: var(--color-primary);
  background: var(--color-background-soft);
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}

.card-desc {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
