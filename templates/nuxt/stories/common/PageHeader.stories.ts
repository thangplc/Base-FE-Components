import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { DownloadIcon, PlusIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/common/PageHeader.vue'

const meta = {
  title: 'Common/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded' },
  args: {
    title: 'Projects',
    description: 'Manage all projects in your workspace.',
  },
  render: args => ({
    components: { PageHeader },
    setup: () => ({ args }),
    template: '<PageHeader v-bind="args" />',
  }),
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TitleOnly: Story = { args: { description: undefined } }

export const WithActions: Story = {
  render: args => ({
    components: { PageHeader, Button, DownloadIcon, PlusIcon },
    setup: () => ({ args }),
    template: `
      <PageHeader v-bind="args">
        <template #actions>
          <Button variant="outline"><DownloadIcon data-icon="inline-start" />Export</Button>
          <Button><PlusIcon data-icon="inline-start" />New project</Button>
        </template>
      </PageHeader>
    `,
  }),
}
