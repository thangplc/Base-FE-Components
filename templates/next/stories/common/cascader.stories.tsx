import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState, type ComponentType } from "react"

import { Cascader, type CascaderOption } from "@/components/common/cascader"
import { locations } from "../_data/locations"

// Docs table from the single-path props (multiple only changes the value type).
type Props = Extract<React.ComponentProps<typeof Cascader>, { multiple?: false }>

/** Pick a path through nested options (province → district → ward), column by column. */
const meta = {
  title: "Common/Cascader",
  component: Cascader as ComponentType<Props>,
  args: { options: locations },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<Props>

export default meta
type Story = StoryObj<typeof meta>

function SingleDemo(props: { changeOnSelect?: boolean; expandTrigger?: "click" | "hover"; showSearch?: boolean }) {
  const [value, setValue] = useState<string[]>()
  return (
    <div className="flex flex-col gap-2">
      <Cascader options={locations} {...props} value={value ?? null} onValueChange={(v) => setValue(v)} placeholder="Tỉnh / Quận / Phường" />
      <code className="text-xs text-muted-foreground">{JSON.stringify(value ?? null)}</code>
    </div>
  )
}

/** Click through the columns; picking a leaf sets the value and closes. */
export const Default: Story = { render: () => <SingleDemo /> }

/** `changeOnSelect`: a province or district can be the value too. */
export const ChangeOnSelect: Story = { render: () => <SingleDemo changeOnSelect /> }

/** `expandTrigger="hover"`: columns open on hover. */
export const HoverExpand: Story = { render: () => <SingleDemo expandTrigger="hover" /> }

/** `showSearch`: search whole paths ("ba dinh" finds "Hà Nội / Ba Đình / …"). */
export const Search: Story = { render: () => <SingleDemo showSearch /> }

function MultipleDemo({ strategy }: { strategy?: "all" | "parent" | "child" }) {
  const [value, setValue] = useState<string[][]>([["hn", "ba-dinh"]])
  return (
    <div className="flex flex-col gap-2">
      <Cascader options={locations} multiple showCheckedStrategy={strategy} showSearch value={value} onValueChange={setValue} />
      <code className="text-xs text-muted-foreground">{JSON.stringify(value)}</code>
    </div>
  )
}

/** `multiple`: checkboxes on every level (tri-state parents); the default "parent" strategy. */
export const Multiple: Story = { render: () => <MultipleDemo /> }

/** `multiple` + `showCheckedStrategy="child"`: leaves only. */
export const MultipleLeaves: Story = { render: () => <MultipleDemo strategy="child" /> }

function LazyDemo() {
  const [options, setOptions] = useState<CascaderOption[]>([
    { value: "north", label: "Miền Bắc" },
    { value: "south", label: "Miền Nam" },
  ])
  const [value, setValue] = useState<string[]>()
  const load = async (selected: CascaderOption[]) => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const target = selected.at(-1)!
    const depth = selected.length
    const children = [1, 2, 3].map((i) => ({ value: `${target.value}-${i}`, label: `${target.label} ${i}`, isLeaf: depth >= 2 }))
    const add = (list: CascaderOption[]): CascaderOption[] =>
      list.map((o) => (o.value === target.value ? { ...o, children } : o.children ? { ...o, children: add(o.children) } : o))
    setOptions((list) => add(list))
  }
  return (
    <div className="flex flex-col gap-2">
      <Cascader options={options} loadData={load} value={value ?? null} onValueChange={(v) => setValue(v)} />
      <code className="text-xs text-muted-foreground">{JSON.stringify(value ?? null)}</code>
    </div>
  )
}

/** `loadData`: each level loads when opened (spinner meanwhile). */
export const LazyLoad: Story = { render: () => <LazyDemo /> }

/** `displayRender`: show only the last label. */
export const DisplayRender: Story = {
  args: { options: locations, defaultValue: ["hn", "ba-dinh", "kim-ma"], displayRender: (labels: string[]) => labels.at(-1) },
}
