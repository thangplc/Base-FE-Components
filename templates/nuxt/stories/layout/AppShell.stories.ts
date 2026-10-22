import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlusIcon } from '@lucide/vue'
import EmptyState from '@/components/common/EmptyState.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppShell from '@/components/layout/AppShell.vue'

const components = { AppShell, Button, Card, CardDescription, CardHeader, CardTitle, EmptyState, PageHeader, PlusIcon }

/**
 * Sidebar (from config/site.ts) + sticky header + content. The active menu
 * item and breadcrumb follow the current route (`parameters.route`).
 */
const meta = {
  title: 'Layout/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen', route: '/' },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

export const Dashboard: Story = {
  render: () => ({
    components,
    template: `
      <AppShell>
        <PageHeader title="Overview" description="Everything at a glance.">
          <template #actions><Button><PlusIcon data-icon="inline-start" />New item</Button></template>
        </PageHeader>
        <div class="grid gap-4 sm:grid-cols-3">
          <Card v-for="label in ['Revenue', 'Users', 'Orders']" :key="label">
            <CardHeader>
              <CardDescription>{{ label }}</CardDescription>
              <CardTitle class="text-2xl">1,234</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </AppShell>
    `,
  }),
}

export const UsersPageEmpty: Story = {
  parameters: { route: '/users' },
  render: () => ({
    components,
    template: `
      <AppShell>
        <PageHeader title="Users" description="Invite people to your workspace." />
        <EmptyState class="border border-dashed" title="No users yet" description="Invite your team to start collaborating.">
          <template #action><Button>Invite users</Button></template>
        </EmptyState>
      </AppShell>
    `,
  }),
}
