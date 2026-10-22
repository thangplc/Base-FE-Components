import type { Preview } from '@storybook/vue3-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import { Toaster } from '../app/components/ui/sonner'
import '../app/assets/css/main.css'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
    }),
    story => ({
      components: { story, Toaster },
      template: '<story /><Toaster rich-colors />',
    }),
  ],
}

export default preview
