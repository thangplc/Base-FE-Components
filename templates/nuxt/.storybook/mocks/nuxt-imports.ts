// Stand-ins for the Nuxt composables used by components/ (aliased to
// `#imports` in .storybook/main.ts). Storybook renders plain Vue, without
// the Nuxt runtime.
import { reactive, watchEffect } from 'vue'

/** Current route; set per story with `parameters: { route: '/users' }`. */
export const mockRoute = reactive({ path: '/' })

export function useRoute() {
  return mockRoute
}

const colorMode = reactive({ preference: 'system', value: 'light' })

watchEffect(() => {
  if (typeof document === 'undefined')
    return
  const dark = colorMode.preference === 'dark'
    || (colorMode.preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  colorMode.value = dark ? 'dark' : 'light'
  document.documentElement.classList.toggle('dark', dark)
})

export function useColorMode() {
  return colorMode
}
