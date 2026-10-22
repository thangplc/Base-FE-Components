import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { CollapseItem } from '@/components/common/Collapse.vue'
import { BellIcon, CreditCardIcon, SettingsIcon, UserIcon } from '@lucide/vue'
import { ref } from 'vue'
import Collapse from '@/components/common/Collapse.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const items: CollapseItem[] = [
  { key: 'account', title: 'Account', icon: UserIcon, content: 'Name, email and avatar shown on your profile.' },
  { key: 'billing', title: 'Billing', icon: CreditCardIcon, content: 'Plan, invoices and payment methods.' },
  { key: 'notifications', title: 'Notifications', icon: BellIcon, content: 'Choose what we email you about.' },
  { key: 'advanced', title: 'Advanced', icon: SettingsIcon, content: 'Danger zone.', disabled: true },
]

/** Expandable panels on the shadcn Accordion: several open at once, or one with `accordion`. */
const meta = {
  title: 'Common/Collapse',
  component: Collapse,
  args: { items },
} satisfies Meta<typeof Collapse>

export default meta
type Story = StoryObj<typeof meta>

function story(props: Record<string, unknown>, initial: unknown = ['account']): Story {
  return {
    render: () => ({
      components: { Collapse },
      setup: () => ({ props: { items, ...props }, value: ref(initial) }),
      template: '<div class="w-[28rem]"><Collapse v-bind="props" v-model="value" /></div>',
    }),
  }
}

export const Default: Story = story({})

/** `accordion`: opening a panel closes the others. */
export const Accordion: Story = story({ accordion: true }, 'billing')

export const Separated: Story = story({ variant: 'separated' })

export const Ghost: Story = story({ variant: 'ghost' })

/** `expand-icon="plus-minus"` with the icon at the start. */
export const PlusMinus: Story = story({ expandIcon: 'plus-minus', expandIconPosition: 'start' })

/** `collapsible="icon"`: only the icon toggles; the `#extra` slot adds actions to the header. */
export const IconOnlyWithExtra: Story = {
  render: () => ({
    components: { Collapse, Badge, Button },
    setup: () => ({ items: items.slice(0, 3), value: ref(['account']) }),
    template: `
      <div class="w-[28rem]">
        <Collapse v-model="value" :items="items" collapsible="icon" expand-icon-position="start">
          <template #extra="{ item }">
            <Badge v-if="item.key === 'billing'" variant="secondary">Pro</Badge>
            <Button v-else size="xs" variant="ghost">Edit</Button>
          </template>
        </Collapse>
      </div>
    `,
  }),
}

export const Small: Story = story({ size: 'sm' })

/** Controlled `v-model` for expand / collapse all. */
export const Controlled: Story = {
  render: () => ({
    components: { Collapse, Button },
    setup: () => ({ items, open: ref<string[]>(['account']), all: items.filter(i => !i.disabled).map(i => i.key) }),
    template: `
      <div class="flex w-[28rem] flex-col gap-3">
        <div class="flex gap-2">
          <Button size="sm" variant="outline" @click="open = all">Expand all</Button>
          <Button size="sm" variant="outline" @click="open = []">Collapse all</Button>
        </div>
        <Collapse v-model="open" :items="items" />
        <code class="text-xs text-muted-foreground">{{ JSON.stringify(open) }}</code>
      </div>
    `,
  }),
}

/** `force-mount`: closed panels stay in the DOM, so typed text survives; content via `#[key]` slots. */
export const ForceMount: Story = {
  render: () => ({
    components: { Collapse, Input },
    setup: () => ({ items: [{ key: 'a', title: 'Step 1' }, { key: 'b', title: 'Step 2' }], value: ref(['a']) }),
    template: `
      <div class="w-[28rem]">
        <Collapse v-model="value" :items="items" force-mount>
          <template #a><Input placeholder="Type, collapse, expand…" /></template>
          <template #b><Input placeholder="Still here" /></template>
        </Collapse>
      </div>
    `,
  }),
}
