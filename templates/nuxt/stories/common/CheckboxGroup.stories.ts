import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import CheckboxGroup from '@/components/common/CheckboxGroup.vue'

const permissions = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'delete', label: 'Delete' },
  { value: 'admin', label: 'Admin', disabled: true },
]

/**
 * Checkboxes with a tri-state "select all": checked when all enabled options
 * are selected, a dash when only some are. Disabled options keep their state.
 */
const meta = {
  title: 'Common/CheckboxGroup',
  component: CheckboxGroup,
  args: { options: permissions, legend: 'Permissions', selectAll: 'All permissions' },
  render: args => ({
    components: { CheckboxGroup },
    setup: () => ({ args, value: ref(['read']) }),
    template: `
      <div class="flex flex-col gap-3">
        <CheckboxGroup v-bind="args" v-model="value" />
        <code class="text-xs text-muted-foreground">{{ JSON.stringify(value) }}</code>
      </div>
    `,
  }),
} satisfies Meta<typeof CheckboxGroup>

export default meta
type Story = StoryObj<typeof meta>

export const SelectAll: Story = {}

export const WithDescriptions: Story = {
  args: {
    legend: 'Notifications',
    selectAll: true,
    options: [
      { value: 'email', label: 'Email', description: 'Daily digest and mentions.' },
      { value: 'push', label: 'Push', description: 'Instant alerts on your phone.' },
      { value: 'sms', label: 'SMS', description: 'Only for security events.' },
    ],
  },
}

export const Horizontal: Story = {
  args: { orientation: 'horizontal', selectAll: false },
}

/** `separator=","`: the value is one string ("read,write") instead of an array. */
export const JoinedString: Story = {
  render: args => ({
    components: { CheckboxGroup },
    setup: () => ({ args, value: ref('read,write') }),
    template: `
      <div class="flex flex-col gap-3">
        <CheckboxGroup v-bind="args" v-model="value" separator="," />
        <code class="text-xs text-muted-foreground">{{ JSON.stringify(value) }}</code>
      </div>
    `,
  }),
}
