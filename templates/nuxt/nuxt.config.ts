import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Next.js uses 3000, so both templates can run side by side.
  devServer: { port: 3001 },
  modules: ['shadcn-nuxt', '@nuxtjs/color-mode'],
  css: ['~/assets/css/main.css'],
  // components/ui is registered by shadcn-nuxt; common + layout are
  // auto-imported without a path prefix (<DataTable>, <AppShell>, ...).
  components: [
    { path: '~/components/common', pathPrefix: false, extensions: ['.vue'] },
    { path: '~/components/layout', pathPrefix: false, extensions: ['.vue'] },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },
  typescript: {
    // Typecheck Storybook stories (they live outside app/) with the app types.
    tsConfig: { include: ['../stories/**/*'] },
  },
  colorMode: {
    classSuffix: '',
  },
})
