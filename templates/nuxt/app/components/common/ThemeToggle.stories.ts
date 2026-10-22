import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ThemeToggle from './ThemeToggle.vue'

/**
 * Switches light / dark / system through @nuxtjs/color-mode (mocked in
 * Storybook to toggle the `dark` class on <html>).
 */
const meta = {
  title: 'Common/ThemeToggle',
  component: ThemeToggle,
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
