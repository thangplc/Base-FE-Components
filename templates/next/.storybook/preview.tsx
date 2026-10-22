import type { Preview } from "@storybook/nextjs-vite"
import { withThemeByClassName } from "@storybook/addon-themes"

import { Toaster } from "../src/components/ui/sonner"
import { TooltipProvider } from "../src/components/ui/tooltip"
import "../src/app/globals.css"
import "./preview.css"

const preview: Preview = {
  // Every component gets an auto-generated Docs page (props table + all stories).
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
    (Story) => (
      <TooltipProvider>
        <Story />
        <Toaster richColors />
      </TooltipProvider>
    ),
  ],
}

export default preview
