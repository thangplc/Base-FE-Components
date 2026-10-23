import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { CascaderOption } from '@/components/common/cascader'
import { ref } from 'vue'
import { Cascader } from '@/components/common/cascader'
import { locations } from '../_data/locations'

/** Pick a path through nested options (province → district → ward), column by column. */
const meta = {
  title: 'Common/Cascader',
  component: Cascader,
  args: { options: locations },
} satisfies Meta<typeof Cascader>

export default meta
type Story = StoryObj<typeof meta>

function story(props: Record<string, unknown>, initial: unknown = undefined): Story {
  return {
    render: () => ({
      components: { Cascader },
      setup: () => ({ props: { options: locations, placeholder: 'Tỉnh / Quận / Phường', ...props }, value: ref(initial) }),
      template: `
        <div class="flex w-80 flex-col gap-2">
          <Cascader v-bind="props" v-model="value" />
          <code class="text-xs text-muted-foreground">{{ JSON.stringify(value ?? null) }}</code>
        </div>
      `,
    }),
  }
}

/** Click through the columns; picking a leaf sets the value and closes. */
export const Default: Story = story({})

/** `change-on-select`: a province or district can be the value too. */
export const ChangeOnSelect: Story = story({ changeOnSelect: true })

/** `expand-trigger="hover"`: columns open on hover. */
export const HoverExpand: Story = story({ expandTrigger: 'hover' })

/** `show-search`: search whole paths ("ba dinh" finds "Hà Nội / Ba Đình / …"). */
export const Search: Story = story({ showSearch: true })

/** `multiple`: checkboxes on every level (tri-state parents); the default 'parent' strategy. */
export const Multiple: Story = story({ multiple: true, showSearch: true }, [['hn', 'ba-dinh']])

/** `multiple` + `show-checked-strategy="child"`: leaves only. */
export const MultipleLeaves: Story = story({ multiple: true, showSearch: true, showCheckedStrategy: 'child' }, [['hn', 'ba-dinh']])

/** `load-data`: each level loads when opened (spinner meanwhile). */
export const LazyLoad: Story = {
  render: () => ({
    components: { Cascader },
    setup() {
      const options = ref<CascaderOption[]>([
        { value: 'north', label: 'Miền Bắc' },
        { value: 'south', label: 'Miền Nam' },
      ])
      const load = async (selected: CascaderOption[]) => {
        await new Promise(resolve => setTimeout(resolve, 600))
        const target = selected.at(-1)!
        const depth = selected.length
        const children = [1, 2, 3].map(i => ({ value: `${target.value}-${i}`, label: `${target.label} ${i}`, isLeaf: depth >= 2 }))
        const add = (list: CascaderOption[]): CascaderOption[] =>
          list.map(o => o.value === target.value ? { ...o, children } : o.children ? { ...o, children: add(o.children) } : o)
        options.value = add(options.value)
      }
      return { options, load, value: ref<string[]>() }
    },
    template: `
      <div class="flex w-80 flex-col gap-2">
        <Cascader v-model="value" :options="options" :load-data="load" />
        <code class="text-xs text-muted-foreground">{{ JSON.stringify(value ?? null) }}</code>
      </div>
    `,
  }),
}

/** `display-render`: show only the last label. */
export const DisplayRender: Story = story({ displayRender: (labels: string[]) => labels.at(-1) ?? '' }, ['hn', 'ba-dinh', 'kim-ma'])
