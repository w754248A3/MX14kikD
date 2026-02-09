<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useToolStore } from '@/stores/toolRegistry'
import { computed, defineAsyncComponent, onMounted, watch } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import MainLayout from '@/layouts/MainLayout.vue'

const route = useRoute()
const router = useRouter()
const store = useToolStore()

const toolId = computed(() => route.params.id as string)
const tool = computed(() => store.getToolById(toolId.value))

// Load component asynchronously
const ToolComponent = computed(() => {
  if (tool.value?.component) {
    return defineAsyncComponent(tool.value.component)
  }
  return null
})

onMounted(() => {
  if (tool.value) {
    store.addToRecent(tool.value.id)
  }
})

watch(toolId, (newId) => {
  if (store.getToolById(newId)) {
    store.addToRecent(newId)
  }
})

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <MainLayout>
    <div v-if="tool" class="tool-view">
      <div class="tool-header">
        <button class="back-btn" @click="goBack">
          <ArrowLeft :size="20" />
          <span>Back</span>
        </button>
        <h1 class="tool-title">{{ tool.name }}</h1>
      </div>

      <div class="tool-content">
        <component :is="ToolComponent" />
      </div>
    </div>

    <div v-else class="not-found">
      <h2>Tool not found</h2>
      <button @click="goBack">Return Home</button>
    </div>
  </MainLayout>
</template>

<style scoped>
.tool-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: none;
  border: none;
  color: var(--color-text-light);
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.back-btn:hover {
  background-color: var(--color-background);
  color: var(--color-primary);
}

.tool-title {
  margin: 0;
  font-size: var(--font-size-xl);
}

.tool-content {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  min-height: 400px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.not-found {
  text-align: center;
  padding: var(--spacing-xl);
}
</style>
