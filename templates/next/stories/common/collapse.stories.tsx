import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState, type ComponentType } from "react"
import { BellIcon, CreditCardIcon, SettingsIcon, UserIcon } from "lucide-react"

import { Collapse, type CollapseBaseProps, type CollapseItem } from "@/components/common/collapse"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const items: CollapseItem[] = [
  { key: "account", title: "Account", icon: <UserIcon />, content: "Name, email and avatar shown on your profile." },
  { key: "billing", title: "Billing", icon: <CreditCardIcon />, content: "Plan, invoices and payment methods." },
  { key: "notifications", title: "Notifications", icon: <BellIcon />, content: "Choose what we email you about." },
  { key: "advanced", title: "Advanced", icon: <SettingsIcon />, content: "Danger zone.", disabled: true },
]

// Docs table with both value shapes (string with `accordion`, string[] without).
type CollapseStoryProps = CollapseBaseProps & { accordion?: boolean; defaultValue?: string | string[] }

/** Expandable panels on the shadcn Accordion: several open at once, or one with `accordion`. */
const meta = {
  title: "Common/Collapse",
  component: Collapse as ComponentType<CollapseStoryProps>,
  args: { items, defaultValue: ["account"] },
  decorators: [(Story) => <div className="w-[28rem]"><Story /></div>],
} satisfies Meta<CollapseStoryProps>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** `accordion`: opening a panel closes the others. */
export const Accordion: Story = { args: { accordion: true, defaultValue: "billing" } }

export const Separated: Story = { args: { variant: "separated" } }

export const Ghost: Story = { args: { variant: "ghost" } }

/** `expandIcon="plus-minus"` with the icon at the start. */
export const PlusMinus: Story = { args: { expandIcon: "plus-minus", expandIconPosition: "start" } }

/** `collapsible="icon"`: only the icon toggles; `extra` adds actions to the header. */
export const IconOnlyWithExtra: Story = {
  args: {
    collapsible: "icon",
    expandIconPosition: "start",
    items: items.slice(0, 3).map((item, i) => ({
      ...item,
      extra:
        i === 1 ? (
          <Badge variant="secondary">Pro</Badge>
        ) : (
          <Button size="xs" variant="ghost">
            Edit
          </Button>
        ),
    })),
  },
}

export const Small: Story = { args: { size: "sm" } }

function ControlledDemo() {
  const [open, setOpen] = useState<string[]>(["account"])
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setOpen(items.filter((i) => !i.disabled).map((i) => i.key))}>
          Expand all
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen([])}>
          Collapse all
        </Button>
      </div>
      <Collapse items={items} value={open} onValueChange={setOpen} />
      <code className="text-xs text-muted-foreground">{JSON.stringify(open)}</code>
    </div>
  )
}

/** Controlled `value` for expand / collapse all. */
export const Controlled: Story = { render: () => <ControlledDemo /> }

/** `forceMount`: closed panels stay in the DOM, so typed text survives. */
export const ForceMount: Story = {
  args: {
    forceMount: true,
    items: [
      { key: "a", title: "Step 1", content: <Input placeholder="Type, collapse, expand…" /> },
      { key: "b", title: "Step 2", content: <Input placeholder="Still here" /> },
    ],
    defaultValue: ["a"],
  },
}
