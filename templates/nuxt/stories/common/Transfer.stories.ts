import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { TransferItem } from '@/components/common/transfer'
import { RefreshCwIcon } from '@lucide/vue'
import { ref } from 'vue'
import { Transfer } from '@/components/common/transfer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const permissions: TransferItem[] = [
  { key: 'users.read', title: 'Read users', description: 'List and view user profiles' },
  { key: 'users.write', title: 'Edit users', description: 'Create, update and disable users' },
  { key: 'billing.read', title: 'Read billing', description: 'Invoices and payment methods' },
  { key: 'billing.write', title: 'Manage billing', description: 'Change plans and refund' },
  { key: 'reports', title: 'Reports', description: 'Export analytics' },
  { key: 'audit', title: 'Audit log', description: 'Owner only', disabled: true },
  { key: 'settings', title: 'Settings', description: 'Workspace settings' },
  { key: 'api', title: 'API keys', description: 'Create and revoke tokens' },
]

/**
 * Two lists: tick items and move them with the arrows (or double-click an
 * item). The right list keeps the order items were moved in.
 */
const meta = {
  title: 'Common/Transfer',
  component: Transfer,
  args: { dataSource: permissions },
} satisfies Meta<typeof Transfer>

export default meta
type Story = StoryObj<typeof meta>

function story(props: Record<string, unknown> = {}, template = '<Transfer v-bind="props" v-model="keys" />'): Story {
  return {
    render: () => ({
      components: { Transfer, Badge, Button, RefreshCwIcon },
      setup: () => ({ props: { dataSource: permissions, titles: ['Available', 'Granted'], ...props }, keys: ref(['users.read', 'reports']) }),
      template: `
        <div class="flex w-[40rem] max-w-full flex-col gap-3">
          ${template}
          <code class="text-xs text-muted-foreground">{{ JSON.stringify(keys) }}</code>
        </div>
      `,
    }),
  }
}

export const Default: Story = story()

/** `show-search`: a search box per list (accent-insensitive). */
export const Search: Story = story({ showSearch: true })

/** `one-way`: only move right; remove with the × on each item. */
export const OneWay: Story = story({ oneWay: true })

/** `operations` labels, the `#item` and `#footer` slots, a shorter `list-height`. */
export const Customized: Story = story({ operations: ['Grant', 'Revoke'], listHeight: '12rem' }, `
  <Transfer v-bind="props" v-model="keys">
    <template #item="{ item }">
      <span class="flex items-center gap-2">
        {{ item.title }}
        <Badge v-if="item.key.endsWith('.write')" variant="secondary">write</Badge>
      </span>
    </template>
    <template #footer="{ direction }">
      <Button v-if="direction === 'left'" size="xs" variant="ghost"><RefreshCwIcon data-icon="inline-start" />Reload</Button>
    </template>
  </Transfer>
`)

export const Disabled: Story = story({ disabled: true })
