import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ThemeProvider } from "next-themes"

import { ThemeToggle } from "@/components/common/theme-toggle"

const STORAGE_KEY = "storybook-theme-toggle"

/**
 * Switches light / dark / system through next-themes (sets the `dark` class
 * on `<html>`). In Storybook the toolbar theme switcher does the same thing.
 */
const meta = {
  title: "Common/ThemeToggle",
  component: ThemeToggle,
  decorators: [
    (Story) => {
      // Start every visit in light mode, in sync with the toolbar default,
      // instead of whatever was picked last time.
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {}
      return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey={STORAGE_KEY}>
          <Story />
        </ThemeProvider>
      )
    },
  ],
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
