import type { StorybookConfig } from '@storybook/vue3-vite'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

const appDir = fileURLToPath(new URL('../app', import.meta.url))

// Plain Vue + Vite (no Nuxt runtime): stories cover components/ui and
// components/common, which import everything explicitly. Components that
// use Nuxt composables (layout/, ThemeToggle) are previewed in the app.
const config: StorybookConfig = {
  stories: ['../app/**/*.stories.@(ts|mdx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  async viteFinal(config) {
    config.plugins = [...(config.plugins ?? []), vue(), tailwindcss()]
    config.resolve ??= {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': appDir,
      '~': appDir,
    }
    return config
  },
}

export default config
