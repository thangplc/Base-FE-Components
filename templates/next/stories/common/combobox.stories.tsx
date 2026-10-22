import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useEffect, useState, type ComponentType } from "react"

import { Combobox, type ComboboxOption, type ComboboxSingleProps } from "@/components/common/combobox"

const cities: ComboboxOption[] = [
  { value: "hn", label: "Hà Nội", group: "Miền Bắc" },
  { value: "hp", label: "Hải Phòng", group: "Miền Bắc" },
  { value: "qn", label: "Quảng Ninh", group: "Miền Bắc" },
  { value: "dn", label: "Đà Nẵng", group: "Miền Trung" },
  { value: "hue", label: "Huế", group: "Miền Trung" },
  { value: "kh", label: "Khánh Hoà", group: "Miền Trung", disabled: true },
  { value: "hcm", label: "TP. Hồ Chí Minh", group: "Miền Nam" },
  { value: "ct", label: "Cần Thơ", group: "Miền Nam" },
  { value: "vt", label: "Vũng Tàu", group: "Miền Nam" },
]

const frameworks: ComboboxOption[] = [
  { value: "next", label: "Next.js", description: "React framework" },
  { value: "nuxt", label: "Nuxt", description: "Vue framework" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "svelte", label: "SvelteKit" },
]

/**
 * Searchable select on a Popover, single or `multiple` (chips). The search
 * ignores accents ("ha noi" finds "Hà Nội"); ↑ ↓ Enter work in the list, and
 * Backspace in an empty search removes the last chip.
 */
// Docs table from the single-value props (the multiple ones only change value types).
const meta = {
  title: "Common/Combobox",
  component: Combobox as ComponentType<ComboboxSingleProps>,
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<ComboboxSingleProps>

export default meta
type Story = StoryObj<typeof meta>

function SingleDemo(props: { options?: ComboboxOption[]; searchable?: boolean }) {
  const [value, setValue] = useState<string>()
  return (
    <div className="flex flex-col gap-2">
      <Combobox options={props.options ?? frameworks} searchable={props.searchable} value={value ?? null} onValueChange={setValue} />
      <code className="text-xs text-muted-foreground">{JSON.stringify(value ?? null)}</code>
    </div>
  )
}

/** Single value with a search box. */
export const Single: Story = { args: { options: frameworks }, render: () => <SingleDemo /> }

/** Groups (`group` on each option); disabled options are skipped by the keyboard. */
export const Groups: Story = { args: { options: cities }, render: () => <SingleDemo options={cities} /> }

function MultipleDemo({ initial = ["hn", "dn"], ...props }: Partial<React.ComponentProps<typeof Combobox>> & { initial?: string[] }) {
  const [value, setValue] = useState<string[]>(initial)
  return (
    <div className="flex flex-col gap-2">
      <Combobox {...(props as object)} options={props.options ?? cities} multiple value={value} onValueChange={setValue} />
      <code className="text-xs text-muted-foreground">{JSON.stringify(value)}</code>
    </div>
  )
}

/** `multiple`: chips in the trigger, "+N" after `maxTagCount` (3). */
export const Multiple: Story = { args: { options: cities }, render: () => <MultipleDemo /> }

/** `showSelectAll` (tri-state) and `maxCount={4}`: other options disable at the limit. */
export const SelectAllAndMax: Story = {
  args: { options: cities },
  render: () => <MultipleDemo showSelectAll maxCount={4} />,
}

/** `tagMode="count"`: "3 selected" instead of chips. */
export const CountMode: Story = { args: { options: cities }, render: () => <MultipleDemo tagMode="count" /> }

/** `creatable`: type a new tag and press Enter. */
export const Creatable: Story = {
  args: { options: frameworks },
  render: () => <MultipleDemo options={frameworks} initial={["next"]} creatable placeholder="Add tags" />,
}

const users = Array.from({ length: 200 }, (_, i) => ({ value: `u${i + 1}`, label: `User ${i + 1}`, description: `user${i + 1}@example.com` }))

function ServerDemo() {
  const [query, setQuery] = useState("")
  const [options, setOptions] = useState<ComboboxOption[]>(users.slice(0, 8))
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState<string[]>([])
  // Fake API: 400ms debounce + latency.
  useEffect(() => {
    const timer = setTimeout(() => {
      setOptions(users.filter((u) => u.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8))
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [query])
  return (
    <div className="flex flex-col gap-2">
      <Combobox multiple options={options} onSearch={(q) => {
          setQuery(q)
          setLoading(true)
        }}
        loading={loading} value={value} onValueChange={setValue} />
      <code className="text-xs text-muted-foreground">{JSON.stringify(value)}</code>
    </div>
  )
}

/** `onSearch` + `loading`: server-side search; chips keep their labels. */
export const ServerSearch: Story = { args: { options: [] }, render: () => <ServerDemo /> }

export const Disabled: Story = { args: { options: frameworks, disabled: true, defaultValue: "next" } }
