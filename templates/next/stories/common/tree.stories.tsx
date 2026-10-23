import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { Tree, type TreeNode } from "@/components/common/tree"
import { Input } from "@/components/ui/input"
import { orgTree } from "../_data/tree"

/**
 * Tree: click to select, ▸ or +/− to expand, ↑ ↓ ← → Enter Space on the
 * keyboard. Checkboxes are tri-state; nodes can be dragged and loaded lazily.
 */
const meta = {
  title: "Common/Tree",
  component: Tree,
  args: { treeData: orgTree, defaultExpandAll: true },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof Tree>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** `expandIcon="plus-minus"` with `showLine` guides. */
export const PlusMinusWithLines: Story = { args: { expandIcon: "plus-minus", showLine: true } }

function CheckableDemo(props: { checkStrictly?: boolean }) {
  const [checked, setChecked] = useState<string[]>(["fe", "sales"])
  const [half, setHalf] = useState<string[]>([])
  return (
    <div className="flex flex-col gap-2">
      <Tree
        treeData={orgTree}
        defaultExpandAll
        checkable
        checkStrictly={props.checkStrictly}
        checkedKeys={checked}
        onCheck={(keys, halfKeys) => {
          setChecked(keys)
          setHalf(halfKeys)
        }}
      />
      <code className="text-xs text-muted-foreground">checked {JSON.stringify(checked)}</code>
      <code className="text-xs text-muted-foreground">half {JSON.stringify(half)}</code>
    </div>
  )
}

/** `checkable`: parents check / uncheck their subtree and show a dash when partly checked. */
export const Checkable: Story = { render: () => <CheckableDemo /> }

/** `checkStrictly`: parent and children are independent. */
export const CheckStrictly: Story = { render: () => <CheckableDemo checkStrictly /> }

/** `multiple`: click to select several nodes. */
export const MultipleSelect: Story = { args: { multiple: true, defaultSelectedKeys: ["fe"] } }

function DraggableDemo() {
  const [tree, setTree] = useState<TreeNode[]>(orgTree)
  const [log, setLog] = useState("Drag a node onto another (top / middle / bottom of a row).")
  return (
    <div className="flex flex-col gap-2">
      <Tree
        treeData={tree}
        defaultExpandAll
        draggable
        // Teams (leaves) can't contain other nodes.
        allowDrop={({ dropNode, position }) => position !== "inside" || !!dropNode.children}
        onDrop={({ dragKey, dropKey, position, treeData }) => {
          setTree(treeData)
          setLog(`${dragKey} → ${position} ${dropKey}`)
        }}
      />
      <code className="text-xs text-muted-foreground">{log}</code>
    </div>
  )
}

/** `draggable` + `onDrop`: the tree comes back already moved; `allowDrop` blocks drops inside teams. */
export const Draggable: Story = { render: () => <DraggableDemo /> }

function LazyDemo() {
  const [tree, setTree] = useState<TreeNode[]>([
    { key: "a", title: "Region A" },
    { key: "b", title: "Region B" },
    { key: "c", title: "Empty region", isLeaf: true },
  ])
  const load = async (node: TreeNode) => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const children = [1, 2, 3].map((i) => ({ key: `${node.key}-${i}`, title: `${node.title} · ${i}`, isLeaf: i === 3 }))
    const add = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((n) => (n.key === node.key ? { ...n, children } : n.children ? { ...n, children: add(n.children) } : n))
    setTree((t) => add(t))
  }
  return <Tree treeData={tree} loadData={load} />
}

/** `loadData`: children load when a node is first expanded (spinner meanwhile). */
export const LazyLoad: Story = { render: () => <LazyDemo /> }

function SearchDemo() {
  const [query, setQuery] = useState("end")
  return (
    <div className="flex flex-col gap-2">
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" />
      <Tree treeData={orgTree} searchValue={query} />
    </div>
  )
}

/** `searchValue`: matches and their parents stay visible and open (accent-insensitive). */
export const Search: Story = { render: () => <SearchDemo /> }
