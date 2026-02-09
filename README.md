# Static Toolkit Framework

A scalable, client-side toolkit application built with Vue 3, TypeScript, and Vite.

## Features

- **Extensible Architecture**: Easily add new tools by creating a folder.
- **Dynamic Registry**: Tools are automatically discovered and registered.
- **Offline Capable**: PWA support for offline access.
- **Responsive Design**: Mobile-first UI with a clean styling system.
- **Local Persistence**: "Recently Used" tools are saved in local storage.

## Project Structure

```
src/
  ├── components/    # Shared UI components
  ├── layouts/       # Page layouts (MainLayout)
  ├── router/        # Routing configuration
  ├── stores/        # State management (Tool Registry)
  ├── styles/        # Global CSS and variables
  ├── tools/         # The collection of tools
  │   ├── text-displayer/
  │   └── number-calculator/
  ├── types/         # TypeScript interfaces
  └── views/         # Page views
```

## How to Add a New Tool

1. Create a new folder in `src/tools/` (e.g., `my-tool`).
2. Create `config.ts` inside that folder:
   ```typescript
   import type { ToolConfig } from '@/types/tool'

   const config: ToolConfig = {
     name: 'My Tool',
     description: 'A short description.',
     icon: 'Box', // Lucide icon name or Component
     path: '/tools/my-tool',
     category: 'My Category'
   }

   export default config
   ```
3. Create `index.vue` inside that folder for your tool's UI.
4. That's it! The tool will automatically appear in the registry and list.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```
