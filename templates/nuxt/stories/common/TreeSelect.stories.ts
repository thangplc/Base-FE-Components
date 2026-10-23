import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { TreeSelect } from '@/components/common/tree'
import { orgTree } from '../_data/tree'

/** A dropdown with a Tree inside: one node, several, or checkboxes with a parent / child strategy. */
const meta = {
  title: 'Common/TreeSelect',
  component: TreeSelect,
  args: { treeData: orgTree },
} satisfies Meta<typeof TreeSelect>

export default meta
type Story = StoryObj<typeof meta>

function story(props: Record<string, unknown>, initial: unknown): Story {
  return {
    render: () => ({
      components: { TreeSelect },
      setup: () => ({ props: { treeData: orgTree, treeDefaultExpandAll: true, ...props }, value: ref(initial) }),
      template: `
        <div class="flex w-80 flex-col gap-2">
          <TreeSelect v-bind="props" v-model="value" />
          <code class="text-xs text-muted-foreground">{{ JSON.stringify(value ?? null) }}</code>
        </div>
      `,
    }),
  }
}

/** One node; `show-search` filters the tree. */
export const Single: Story = story({ showSearch: true, placeholder: 'Pick a team' }, undefined)

/** `tree-checkable` with the default 'all': every checked key is in the value. */
export const Checkable: Story = story({ treeCheckable: true, placeholder: 'Pick departments' }, ['eng'])

/** `show-checked-strategy="parent"`: a fully checked parent stands for its children. */
export const StrategyParent: Story = story({ treeCheckable: true, showCheckedStrategy: 'parent' }, ['eng'])

/** `show-checked-strategy="child"`: leaves only. */
export const StrategyChild: Story = story({ treeCheckable: true, showCheckedStrategy: 'child' }, ['eng'])

/** `multiple`: click nodes to add them; `:max-tag-count="2"`. */
export const Multiple: Story = story({ multiple: true, maxTagCount: 2 }, ['fe', 'sales'])
