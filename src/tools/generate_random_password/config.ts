import type { ToolConfig } from '@/types/tool'

const config: ToolConfig = {
  name: '生成随机密码',
  description: '生成随机密码',
  icon: 'lock-keyhole', // Lucide icon name or Component
  path: '/tools/generate_random_password',
  category: 'My Category'
}

export default config