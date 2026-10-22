import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ArrowRightIcon, PlusIcon } from '@lucide/vue'
import { Button } from '.'

const meta = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'icon-xs', 'icon-sm', 'icon', 'icon-lg'],
    },
  },
  render: args => ({
    components: { Button },
    setup: () => ({ args }),
    template: '<Button v-bind="args">Button</Button>',
  }),
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: args => ({
    components: { Button },
    setup: () => ({ args }),
    template: `
      <div class="flex flex-wrap gap-2">
        <Button v-bind="args">Default</Button>
        <Button v-bind="args" variant="secondary">Secondary</Button>
        <Button v-bind="args" variant="outline">Outline</Button>
        <Button v-bind="args" variant="ghost">Ghost</Button>
        <Button v-bind="args" variant="destructive">Destructive</Button>
        <Button v-bind="args" variant="link">Link</Button>
      </div>
    `,
  }),
}

export const WithIcon: Story = {
  render: args => ({
    components: { Button, PlusIcon, ArrowRightIcon },
    setup: () => ({ args }),
    template: `
      <div class="flex gap-2">
        <Button v-bind="args"><PlusIcon data-icon="inline-start" />Create</Button>
        <Button v-bind="args" variant="outline">Next<ArrowRightIcon data-icon="inline-end" /></Button>
        <Button v-bind="args" size="icon" aria-label="Add"><PlusIcon /></Button>
      </div>
    `,
  }),
}
