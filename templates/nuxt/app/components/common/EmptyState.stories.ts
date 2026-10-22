import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlusIcon, SearchXIcon, WifiOffIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import EmptyState from './EmptyState.vue'

const meta = {
  title: 'Common/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  args: {
    title: 'No projects yet',
    description: 'Create your first project to get started.',
  },
  render: args => ({
    components: { EmptyState },
    setup: () => ({ args }),
    template: '<EmptyState v-bind="args" />',
  }),
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithAction: Story = {
  render: args => ({
    components: { EmptyState, Button, PlusIcon },
    setup: () => ({ args }),
    template: `
      <EmptyState v-bind="args">
        <template #action><Button><PlusIcon data-icon="inline-start" />Create project</Button></template>
      </EmptyState>
    `,
  }),
}

export const NoSearchResults: Story = {
  args: {
    title: 'No results found',
    description: 'Try a different keyword or clear the filters.',
  },
  render: args => ({
    components: { EmptyState, Button, SearchXIcon },
    setup: () => ({ args }),
    template: `
      <EmptyState v-bind="args">
        <template #icon><SearchXIcon /></template>
        <template #action><Button variant="outline">Clear filters</Button></template>
      </EmptyState>
    `,
  }),
}

export const Offline: Story = {
  args: {
    title: 'You are offline',
    description: 'Check your connection and try again.',
    class: 'border border-dashed',
  },
  render: args => ({
    components: { EmptyState, Button, WifiOffIcon },
    setup: () => ({ args }),
    template: `
      <EmptyState v-bind="args">
        <template #icon><WifiOffIcon /></template>
        <template #action><Button variant="outline">Retry</Button></template>
      </EmptyState>
    `,
  }),
}
