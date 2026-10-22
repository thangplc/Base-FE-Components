import type { StorybookConfig } from '@storybook/vue3-vite'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

const appDir = fileURLToPath(new URL('../app', import.meta.url))
const mocksDir = fileURLToPath(new URL('./mocks', import.meta.url))

// Plain Vue + Vite (no Nuxt runtime). Components import everything
// explicitly; the few Nuxt composables / components they use come from
// `#imports` / `#components`, which are mocked here.
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
      '#imports': `${mocksDir}/nuxt-imports.ts`,
      '#components': `${mocksDir}/nuxt-components.ts`,
      '@': appDir,
      '~': appDir,
    }
    return config
  },
}

export default config
