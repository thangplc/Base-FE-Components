import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PlusIcon } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppShell } from "./app-shell"

/**
 * Sidebar (from config/site.ts) + sticky header + content. The active menu
 * item and breadcrumb follow the current pathname.
 */
const meta = {
  title: "Layout/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

export const Dashboard: Story = {
  args: {
    children: (
      <>
        <PageHeader
          title="Overview"
          description="Everything at a glance."
          actions={<Button><PlusIcon data-icon="inline-start" />New item</Button>}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {["Revenue", "Users", "Orders"].map((label) => (
            <Card key={label}>
              <CardHeader>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-2xl">1,234</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </>
    ),
  },
}

export const UsersPageEmpty: Story = {
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: "/users" } } },
  args: {
    children: (
      <>
        <PageHeader title="Users" description="Invite people to your workspace." />
        <EmptyState
          className="border border-dashed"
          title="No users yet"
          description="Invite your team to start collaborating."
          action={<Button>Invite users</Button>}
        />
      </>
    ),
  },
}
