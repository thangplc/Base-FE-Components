import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ThemeProvider } from "next-themes"

import { ThemeToggle } from "@/components/common/theme-toggle"

/**
 * Switches light / dark / system through next-themes (sets the `dark` class
 * on <html>). In Storybook the toolbar theme switcher does the same thing.
 */
const meta = {
  title: "Common/ThemeToggle",
  component: ThemeToggle,
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
