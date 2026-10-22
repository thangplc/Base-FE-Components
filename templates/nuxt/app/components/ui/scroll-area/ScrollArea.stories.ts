import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Separator } from '@/components/ui/separator'
import { ScrollArea, ScrollBar } from '.'

const tags = Array.from({ length: 40 }, (_, i) => `v1.2.0-beta.${40 - i}`)

const meta = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {
  render: () => ({
    components: { ScrollArea, Separator },
    setup: () => ({ tags }),
    template: `
      <ScrollArea class="h-72 w-48 rounded-md border">
        <div class="p-4">
          <h4 class="mb-4 text-sm font-medium">Tags</h4>
          <div v-for="tag in tags" :key="tag">
            <div class="text-sm">{{ tag }}</div>
            <Separator class="my-2" />
          </div>
        </div>
      </ScrollArea>
    `,
  }),
}

export const Horizontal: Story = {
  render: () => ({
    components: { ScrollArea, ScrollBar },
    template: `
      <ScrollArea class="w-96 rounded-md border whitespace-nowrap">
        <div class="flex w-max gap-4 p-4">
          <div v-for="i in 10" :key="i" class="flex h-32 w-40 shrink-0 items-center justify-center rounded-md bg-muted text-sm">
            Item {{ i }}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    `,
  }),
}
