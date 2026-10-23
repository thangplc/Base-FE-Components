import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState, type ComponentType } from "react"

import { TreeSelect } from "@/components/common/tree"
import { orgTree } from "../_data/tree"

type Props = React.ComponentProps<typeof TreeSelect>

/** A dropdown with a Tree inside: one node, several, or checkboxes with a parent / child strategy. */
const meta = {
  title: "Common/TreeSelect",
  component: TreeSelect as ComponentType<Props>,
  args: { treeData: orgTree },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<Props>

export default meta
type Story = StoryObj<typeof meta>

function SingleDemo() {
  const [value, setValue] = useState<string>()
  return (
    <div className="flex flex-col gap-2">
      <TreeSelect treeData={orgTree} treeDefaultExpandAll showSearch value={value ?? null} onValueChange={setValue} placeholder="Pick a team" />
      <code className="text-xs text-muted-foreground">{JSON.stringify(value ?? null)}</code>
    </div>
  )
}

/** One node; `showSearch` filters the tree. */
export const Single: Story = { render: () => <SingleDemo /> }

function CheckableDemo({ strategy }: { strategy: "all" | "parent" | "child" }) {
  const [value, setValue] = useState<string[]>(["eng"])
  return (
    <div className="flex flex-col gap-2">
      <TreeSelect
        treeData={orgTree}
        treeCheckable
        showCheckedStrategy={strategy}
        treeDefaultExpandAll
        value={value}
        onValueChange={setValue}
        placeholder="Pick departments"
      />
      <code className="text-xs text-muted-foreground">{JSON.stringify(value)}</code>
    </div>
  )
}

/** `treeCheckable` with the default "all": every checked key is in the value. */
export const Checkable: Story = { render: () => <CheckableDemo strategy="all" /> }

/** `showCheckedStrategy="parent"`: a fully checked parent stands for its children. */
export const StrategyParent: Story = { render: () => <CheckableDemo strategy="parent" /> }

/** `showCheckedStrategy="child"`: leaves only. */
export const StrategyChild: Story = { render: () => <CheckableDemo strategy="child" /> }

function MultipleDemo() {
  const [value, setValue] = useState<string[]>(["fe", "sales"])
  return (
    <div className="flex flex-col gap-2">
      <TreeSelect treeData={orgTree} multiple treeDefaultExpandAll value={value} onValueChange={setValue} maxTagCount={2} />
      <code className="text-xs text-muted-foreground">{JSON.stringify(value)}</code>
    </div>
  )
}

/** `multiple`: click nodes to add them; `maxTagCount={2}`. */
export const Multiple: Story = { render: () => <MultipleDemo /> }
