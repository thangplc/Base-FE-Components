import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { TreeDropInfo, TreeNode } from '@/components/common/tree'
import { ref } from 'vue'
import { Tree } from '@/components/common/tree'
import { Input } from '@/components/ui/input'
import { orgTree } from '../_data/tree'

/**
 * Tree: click to select, ▸ or +/− to expand, ↑ ↓ ← → Enter Space on the
 * keyboard. Checkboxes are tri-state; nodes can be dragged and loaded lazily.
 */
const meta = {
  title: 'Common/Tree',
  component: Tree,
  args: { treeData: orgTree, defaultExpandAll: true },
  render: args => ({
    components: { Tree },
    setup: () => ({ args }),
    template: '<div class="w-80"><Tree v-bind="args" /></div>',
  }),
} satisfies Meta<typeof Tree>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** `expand-icon="plus-minus"` with `show-line` guides. */
export const PlusMinusWithLines: Story = { args: { expandIcon: 'plus-minus', showLine: true } }

function checkableStory(checkStrictly: boolean): Story {
  return {
    render: () => ({
      components: { Tree },
      setup: () => ({ orgTree, checked: ref(['fe', 'sales']), half: ref<string[]>([]), checkStrictly }),
      template: `
        <div class="flex w-80 flex-col gap-2">
          <Tree v-model:checked-keys="checked" :tree-data="orgTree" default-expand-all checkable :check-strictly="checkStrictly" @check="(_, h) => (half = h)" />
          <code class="text-xs text-muted-foreground">checked {{ JSON.stringify(checked) }}</code>
          <code class="text-xs text-muted-foreground">half {{ JSON.stringify(half) }}</code>
        </div>
      `,
    }),
  }
}

/** `checkable`: parents check / uncheck their subtree and show a dash when partly checked. */
export const Checkable: Story = checkableStory(false)

/** `check-strictly`: parent and children are independent. */
export const CheckStrictly: Story = checkableStory(true)

/** `multiple`: click to select several nodes. */
export const MultipleSelect: Story = { args: { multiple: true, selectedKeys: ['fe'] } }

/** `draggable` + `@drop`: the tree comes back already moved; `allow-drop` blocks drops inside teams. */
export const Draggable: Story = {
  render: () => ({
    components: { Tree },
    setup() {
      const tree = ref<TreeNode[]>(orgTree)
      const log = ref('Drag a node onto another (top / middle / bottom of a row).')
      // Teams (leaves) can't contain other nodes.
      const allowDrop = ({ dropNode, position }: { dropNode: TreeNode, position: string }) => position !== 'inside' || !!dropNode.children
      const onDrop = (info: TreeDropInfo) => {
        tree.value = info.treeData
        log.value = `${info.dragKey} → ${info.position} ${info.dropKey}`
      }
      return { tree, log, allowDrop, onDrop }
    },
    template: `
      <div class="flex w-80 flex-col gap-2">
        <Tree :tree-data="tree" default-expand-all draggable :allow-drop="allowDrop" @drop="onDrop" />
        <code class="text-xs text-muted-foreground">{{ log }}</code>
      </div>
    `,
  }),
}

/** `load-data`: children load when a node is first expanded (spinner meanwhile). */
export const LazyLoad: Story = {
  render: () => ({
    components: { Tree },
    setup() {
      const tree = ref<TreeNode[]>([
        { key: 'a', title: 'Region A' },
        { key: 'b', title: 'Region B' },
        { key: 'c', title: 'Empty region', isLeaf: true },
      ])
      const load = async (node: TreeNode) => {
        await new Promise(resolve => setTimeout(resolve, 600))
        const children = [1, 2, 3].map(i => ({ key: `${node.key}-${i}`, title: `${node.title} · ${i}`, isLeaf: i === 3 }))
        const add = (nodes: TreeNode[]): TreeNode[] =>
          nodes.map(n => n.key === node.key ? { ...n, children } : n.children ? { ...n, children: add(n.children) } : n)
        tree.value = add(tree.value)
      }
      return { tree, load }
    },
    template: '<div class="w-80"><Tree :tree-data="tree" :load-data="load" /></div>',
  }),
}

/** `search-value`: matches and their parents stay visible and open (accent-insensitive). */
export const Search: Story = {
  render: () => ({
    components: { Tree, Input },
    setup: () => ({ orgTree, query: ref('end') }),
    template: `
      <div class="flex w-80 flex-col gap-2">
        <Input v-model="query" placeholder="Search…" />
        <Tree :tree-data="orgTree" :search-value="query" />
      </div>
    `,
  }),
}
