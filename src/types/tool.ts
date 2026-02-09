import type { Component } from 'vue'

export interface Tool {
  id: string
  name: string
  description: string
  icon: string | Component
  path: string
  component: () => Promise<any>
  category?: string
}

export interface ToolConfig {
  name: string
  description: string
  icon: string | Component
  path: string
  category?: string
}
