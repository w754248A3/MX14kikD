import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tool, ToolConfig } from '@/types/tool'
import { useStorage } from '@vueuse/core'

export const useToolStore = defineStore('tool', () => {
  const tools = ref<Tool[]>([])
  const searchQuery = ref('')
  
  // Persist recent tools (store IDs)
  const recentToolIds = useStorage<string[]>('recent-tools', [])

  const registerTools = () => {
    const configFiles = import.meta.glob<{ default: ToolConfig }>('@/tools/*/config.ts', { eager: true })
    const componentFiles = import.meta.glob('@/tools/*/index.vue')

    const loadedTools: Tool[] = []

    for (const path in configFiles) {
      // path is like /src/tools/tool-name/config.ts
      // Extract folder name as ID
      const match = path.match(/\/tools\/([^/]+)\/config\.ts$/)
      if (match) {
        const id = match[1]
        if (!id) continue
        
        const module = configFiles[path]
        const config = module?.default
        
        if (!config) continue

        // Find corresponding component
        const componentPath = path.replace('config.ts', 'index.vue')
        const componentLoader = componentFiles[componentPath]

        if (componentLoader) {
          loadedTools.push({
            id,
            ...config,
            component: componentLoader
          })
        }
      }
    }
    
    tools.value = loadedTools
  }

  const filteredTools = computed(() => {
    if (!searchQuery.value) return tools.value
    const query = searchQuery.value.toLowerCase()
    return tools.value.filter((tool: Tool) => 
      tool.name.toLowerCase().includes(query) || 
      tool.description.toLowerCase().includes(query)
    )
  })

  const recentTools = computed(() => {
    return recentToolIds.value
      .map((id: string) => tools.value.find((t: Tool) => t.id === id))
      .filter((t: Tool | undefined): t is Tool => !!t)
      .slice(0, 4) // Keep last 4
  })

  const addToRecent = (id: string) => {
    // Remove if exists to push to top
    const index = recentToolIds.value.indexOf(id)
    if (index > -1) {
      recentToolIds.value.splice(index, 1)
    }
    recentToolIds.value.unshift(id)
    // Limit history size
    if (recentToolIds.value.length > 10) {
      recentToolIds.value.pop()
    }
  }

  const getToolById = (id: string) => {
    return tools.value.find((t: Tool) => t.id === id)
  }

  // Initialize
  registerTools()

  return {
    tools,
    searchQuery,
    filteredTools,
    recentTools,
    addToRecent,
    getToolById
  }
})
