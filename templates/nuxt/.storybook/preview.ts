import type { Preview } from '@storybook/vue3-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import { Toaster } from '../app/components/ui/sonner'
import { TooltipProvider } from '../app/components/ui/tooltip'
import { mockRoute } from './mocks/nuxt-imports'
import '../app/assets/css/main.css'

const preview: Preview = {
  // Every component gets an auto-generated Docs page (props table + all stories).
  tags: ['autodocs'],
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
    (story, context) => {
      mockRoute.path = context.parameters.route ?? '/'
      return {
        components: { story, Toaster, TooltipProvider },
        template: '<TooltipProvider><story /></TooltipProvider><Toaster rich-colors />',
      }
    },
  ],
}

export default preview
