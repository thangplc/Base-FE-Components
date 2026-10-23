import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { RefreshCwIcon } from "lucide-react"

import { Transfer, type TransferItem } from "@/components/common/transfer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const permissions: TransferItem[] = [
  { key: "users.read", title: "Read users", description: "List and view user profiles" },
  { key: "users.write", title: "Edit users", description: "Create, update and disable users" },
  { key: "billing.read", title: "Read billing", description: "Invoices and payment methods" },
  { key: "billing.write", title: "Manage billing", description: "Change plans and refund" },
  { key: "reports", title: "Reports", description: "Export analytics" },
  { key: "audit", title: "Audit log", description: "Owner only", disabled: true },
  { key: "settings", title: "Settings", description: "Workspace settings" },
  { key: "api", title: "API keys", description: "Create and revoke tokens" },
]

/**
 * Two lists: tick items and move them with the arrows (or double-click an
 * item). The right list keeps the order items were moved in.
 */
const meta = {
  title: "Common/Transfer",
  component: Transfer,
  args: { dataSource: permissions, titles: ["Available", "Granted"] },
  decorators: [(Story) => <div className="w-[40rem] max-w-full"><Story /></div>],
} satisfies Meta<typeof Transfer>

export default meta
type Story = StoryObj<typeof meta>

function ControlledDemo(props: Partial<React.ComponentProps<typeof Transfer>>) {
  const [keys, setKeys] = useState<string[]>(["users.read", "reports"])
  return (
    <div className="flex flex-col gap-3">
      <Transfer dataSource={permissions} titles={["Available", "Granted"]} {...props} targetKeys={keys} onValueChange={setKeys} />
      <code className="text-xs text-muted-foreground">{JSON.stringify(keys)}</code>
    </div>
  )
}

export const Default: Story = { render: () => <ControlledDemo /> }

/** `showSearch`: a search box per list (accent-insensitive). */
export const Search: Story = { render: () => <ControlledDemo showSearch /> }

/** `oneWay`: only move right; remove with the × on each item. */
export const OneWay: Story = { render: () => <ControlledDemo oneWay /> }

/** `operations` labels, `renderItem`, `footer`, a shorter `listHeight`. */
export const Customized: Story = {
  render: () => (
    <ControlledDemo
      operations={["Grant", "Revoke"]}
      listHeight="12rem"
      renderItem={(item) => (
        <span className="flex items-center gap-2">
          {item.title}
          {item.key.endsWith(".write") && <Badge variant="secondary">write</Badge>}
        </span>
      )}
      footer={(direction) =>
        direction === "left" ? (
          <Button size="xs" variant="ghost">
            <RefreshCwIcon data-icon="inline-start" />
            Reload
          </Button>
        ) : null
      }
    />
  ),
}

export const Disabled: Story = { render: () => <ControlledDemo disabled /> }
