<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import type { DropPosition, TreeNodeBase } from './tree-utils'
import { ChevronRightIcon, Loader2Icon, MinusIcon, PlusIcon } from '@lucide/vue'
import { computed, ref, useId } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import TreeHighlight from './TreeHighlight.vue'
import {
  ancestorsOf,
  canDropOn,
  conductChecked,
  dropPositionAt,
  filterTree,
  halfCheckedOf,
  hasChildren,
  indexTree,
  moveNode,
  toggleChecked,
  visibleRows,
} from './tree-utils'

export interface TreeNode extends Omit<TreeNodeBase, 'children'> {
  children?: TreeNode[]
  /** Icon before the title. */
  icon?: Component
}

export interface TreeDropInfo {
  dragKey: string
  dropKey: string
  position: DropPosition
  /** The tree with the node already moved: set it as `tree-data`. */
  treeData: TreeNode[]
}

/**
 * Tree with expand / select / check (tri-state), drag and drop, lazy loading
 * and search. v-model:expanded-keys / selected-keys / checked-keys are
 * optional; events: @select, @check, @drop, @expand. Slot: #title="{ node }".
 */
const props = withDefaults(defineProps<{
  treeData: TreeNode[]
  defaultExpandAll?: boolean
  /** 'chevron' (default) or a +/− box. */
  expandIcon?: 'chevron' | 'plus-minus'
  /** Guide lines between parents and children. */
  showLine?: boolean
  /** Click selects a node (default true). */
  selectable?: boolean
  multiple?: boolean
  /** Checkboxes; a parent shows a dash when only some children are checked. */
  checkable?: boolean
  /** Parent and children are checked independently. */
  checkStrictly?: boolean
  /** Drag nodes to reorder / re-parent them (all, or a test per node). */
  draggable?: boolean | ((node: TreeNode) => boolean)
  allowDrop?: (info: { dragNode: TreeNode, dropNode: TreeNode, position: DropPosition }) => boolean
  /** Load children when a node without them is expanded (set them in `tree-data`). */
  loadData?: (node: TreeNode) => Promise<unknown>
  /** Filter: matching nodes and their parents stay visible, the parents open. */
  searchValue?: string
  filterNode?: (node: TreeNode, searchValue: string) => boolean
  /** Scroll inside this height (number = px). */
  height?: number | string
  ariaLabel?: string
  class?: HTMLAttributes['class']
}>(), {
  defaultExpandAll: false,
  expandIcon: 'chevron',
  showLine: false,
  selectable: true,
  multiple: false,
  checkable: false,
  checkStrictly: false,
  draggable: false,
  ariaLabel: 'Tree',
})

const emit = defineEmits<{
  expand: [expandedKeys: string[]]
  select: [selectedKeys: string[], node: TreeNode]
  check: [checkedKeys: string[], halfCheckedKeys: string[]]
  drop: [info: TreeDropInfo]
}>()

const allParents = (nodes: TreeNode[]): string[] =>
  nodes.flatMap(node => hasChildren(node) ? [node.key, ...allParents(node.children!)] : [])

const expandedModel = defineModel<string[]>('expandedKeys')
const selectedModel = defineModel<string[]>('selectedKeys')
const checkedModel = defineModel<string[]>('checkedKeys')
expandedModel.value ??= props.defaultExpandAll ? allParents(props.treeData) : []
selectedModel.value ??= []
checkedModel.value ??= []

const id = useId()
const index = computed(() => indexTree(props.treeData))
const checked = computed(() => props.checkStrictly ? new Set(checkedModel.value) : conductChecked(checkedModel.value!, index.value))
const halfChecked = computed(() => props.checkStrictly ? new Set<string>() : halfCheckedOf(checked.value, index.value))
const search = computed(() => props.searchValue?.trim() ? filterTree(index.value, props.searchValue, props.filterNode) : undefined)
const expanded = computed(() => new Set([...expandedModel.value!, ...(search.value?.expand ?? [])]))
const rows = computed(() => visibleRows(props.treeData, expanded.value, search.value?.visible))

const loading = ref(new Set<string>())
const active = ref<string>()
const drag = ref<{ key: string, over?: string, position?: DropPosition }>()

function setExpanded(next: string[]) {
  expandedModel.value = next
  emit('expand', next)
}

async function toggleExpand(node: TreeNode) {
  if (expanded.value.has(node.key))
    return setExpanded(expandedModel.value!.filter(k => k !== node.key))
  if (props.loadData && !node.isLeaf && !hasChildren(node)) {
    loading.value = new Set(loading.value).add(node.key)
    try {
      await props.loadData(node)
    }
    finally {
      const next = new Set(loading.value)
      next.delete(node.key)
      loading.value = next
    }
  }
  setExpanded([...expandedModel.value!, node.key])
}

function select(node: TreeNode) {
  if (!props.selectable || node.disabled || node.selectable === false)
    return
  const current = selectedModel.value!
  const next = props.multiple
    ? current.includes(node.key) ? current.filter(k => k !== node.key) : [...current, node.key]
    : [node.key]
  selectedModel.value = next
  emit('select', next, node)
}

function check(node: TreeNode) {
  if (node.disabled || node.disableCheckbox)
    return
  const next = toggleChecked(node.key, checked.value, index.value, props.checkStrictly)
  const keys = index.value.order.filter(k => next.has(k))
  checkedModel.value = keys
  const half = props.checkStrictly ? [] : index.value.order.filter(k => halfCheckedOf(next, index.value).has(k))
  emit('check', keys, half)
}

function canDrag(node: TreeNode) {
  return !node.disabled && (typeof props.draggable === 'function' ? props.draggable(node) : props.draggable)
}

function dropAllowed(dragKey: string, dropNode: TreeNode, position: DropPosition) {
  return canDropOn(dragKey, dropNode.key, index.value)
    && (!props.allowDrop || props.allowDrop({ dragNode: index.value.nodes.get(dragKey)!, dropNode, position }))
}

function onDragStart(event: DragEvent, node: TreeNode) {
  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/plain', node.key)
  drag.value = { key: node.key }
}

function onDragOver(event: DragEvent, node: TreeNode) {
  if (!drag.value)
    return
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const position = dropPositionAt(event.clientY - rect.top, rect.height)
  if (!dropAllowed(drag.value.key, node, position)) {
    drag.value = { key: drag.value.key }
    return
  }
  event.preventDefault()
  if (drag.value.over !== node.key || drag.value.position !== position)
    drag.value = { key: drag.value.key, over: node.key, position }
}

function onDragLeave(event: DragEvent) {
  if (drag.value && !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node))
    drag.value = { key: drag.value.key }
}

function onDrop(event: DragEvent, node: TreeNode) {
  event.preventDefault()
  const current = drag.value
  if (!current?.position || current.over !== node.key)
    return
  const treeData = moveNode(props.treeData, current.key, node.key, current.position)
  emit('drop', { dragKey: current.key, dropKey: node.key, position: current.position, treeData })
  if (current.position === 'inside' && !expanded.value.has(node.key))
    setExpanded([...expandedModel.value!, node.key])
  drag.value = undefined
}

function isLastChild(key: string) {
  const parent = index.value.parent.get(key)
  const siblings = parent === undefined ? props.treeData : index.value.nodes.get(parent)?.children ?? []
  return siblings.at(-1)?.key === key
}

/**
 * Indent columns. With showLine, column `level` continues the line of the
 * ancestor at that depth while the path below it (depth level + 1) has
 * siblings further down; the last column links to this node.
 */
function guides(key: string, depth: number, isLast: boolean) {
  const ancestors = ancestorsOf(key, index.value)
  return Array.from({ length: depth }, (_, level) => {
    const pathKey = level < depth - 1 ? ancestors[depth - 2 - level] : undefined
    const continues = level === depth - 1 || (!!pathKey && !isLastChild(pathKey))
    return { level, line: props.showLine && continues, half: level === depth - 1 && isLast, stub: props.showLine && level === depth - 1 }
  })
}

const expandable = (node: TreeNode) => hasChildren(node) || (!!props.loadData && !node.isLeaf && !node.children)
const checkState = (key: string) => checked.value.has(key) ? true : halfChecked.value.has(key) ? 'indeterminate' : false

// Keyboard: ↑ ↓ move, → open / first child, ← close / parent, Enter select, Space check.
function onKeyDown(event: KeyboardEvent) {
  const list = rows.value
  const i = list.findIndex(row => row.node.key === active.value)
  const row = list[i]
  const go = (key?: string) => {
    if (!key)
      return
    event.preventDefault()
    active.value = key
    document.getElementById(`${id}-${key}`)?.scrollIntoView({ block: 'nearest' })
  }
  if (event.key === 'ArrowDown')
    go(list[Math.min(list.length - 1, i + 1)]?.node.key)
  else if (event.key === 'ArrowUp')
    go(list[Math.max(0, i - 1)]?.node.key)
  else if (event.key === 'Home')
    go(list[0]?.node.key)
  else if (event.key === 'End')
    go(list.at(-1)?.node.key)
  else if (!row)
    go(list[0]?.node.key)
  else if (event.key === 'ArrowRight') {
    event.preventDefault()
    if (!row.expanded && expandable(row.node))
      toggleExpand(row.node)
    else if (row.expanded)
      go(list[i + 1]?.node.key)
  }
  else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    if (row.expanded)
      toggleExpand(row.node)
    else go(index.value.parent.get(row.node.key))
  }
  else if (event.key === 'Enter') {
    event.preventDefault()
    select(row.node)
  }
  else if (event.key === ' ' && props.checkable) {
    event.preventDefault()
    check(row.node)
  }
}

const maxHeight = computed(() => props.height === undefined ? undefined : typeof props.height === 'number' ? `${props.height}px` : props.height)
</script>

<template>
  <div
    role="tree"
    :aria-label="ariaLabel"
    :aria-multiselectable="multiple || checkable || undefined"
    tabindex="0"
    :aria-activedescendant="active ? `${id}-${active}` : undefined"
    data-slot="tree"
    :class="cn('overflow-auto rounded-md text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50', props.class)"
    :style="maxHeight ? { maxHeight } : undefined"
    @keydown="onKeyDown"
    @focus="!active && rows[0] && (active = rows[0].node.key)"
  >
    <div
      v-for="{ node, depth, expanded: isExpanded, isLast } in rows"
      :id="`${id}-${node.key}`"
      :key="node.key"
      role="treeitem"
      :aria-level="depth + 1"
      :aria-expanded="expandable(node) ? isExpanded : undefined"
      :aria-selected="selectable ? selectedModel!.includes(node.key) : undefined"
      :aria-checked="checkable ? (checked.has(node.key) ? true : halfChecked.has(node.key) ? 'mixed' : false) : undefined"
      :aria-disabled="node.disabled || undefined"
      :data-active="active === node.key || undefined"
      :data-drop="drag?.over === node.key ? drag.position : undefined"
      :draggable="canDrag(node) || undefined"
      :class="cn(
        'relative flex h-8 items-center gap-1.5 rounded-md pr-2 select-none',
        node.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent',
        selectedModel!.includes(node.key) && 'bg-accent font-medium',
        'data-active:ring-2 data-active:ring-ring/40 data-active:ring-inset',
        drag?.key === node.key && 'opacity-40',
        'data-[drop=inside]:bg-primary/10 data-[drop=inside]:ring-2 data-[drop=inside]:ring-primary data-[drop=inside]:ring-inset',
        'data-[drop=before]:before:absolute data-[drop=before]:before:inset-x-0 data-[drop=before]:before:top-0 data-[drop=before]:before:h-0.5 data-[drop=before]:before:bg-primary',
        'data-[drop=after]:after:absolute data-[drop=after]:after:inset-x-0 data-[drop=after]:after:bottom-0 data-[drop=after]:after:h-0.5 data-[drop=after]:after:bg-primary',
      )"
      @dragstart="onDragStart($event, node)"
      @dragover="onDragOver($event, node)"
      @dragleave="onDragLeave"
      @drop="onDrop($event, node)"
      @dragend="drag = undefined"
      @click="active = node.key; select(node)"
    >
      <span v-for="guide in guides(node.key, depth, isLast)" :key="guide.level" aria-hidden="true" class="relative h-full w-4 shrink-0">
        <span v-if="guide.line" :class="cn('absolute left-1/2 w-px bg-foreground/15', guide.half ? 'top-0 h-1/2' : 'inset-y-0')" />
        <span v-if="guide.stub" class="absolute top-1/2 left-1/2 h-px w-2 bg-foreground/15" />
      </span>
      <button
        v-if="expandable(node)"
        type="button"
        tabindex="-1"
        :aria-label="isExpanded ? 'Collapse' : 'Expand'"
        class="flex size-4 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
        @click.stop="toggleExpand(node)"
      >
        <Loader2Icon v-if="loading.has(node.key)" class="size-3.5 animate-spin" />
        <span v-else-if="expandIcon === 'plus-minus'" class="flex size-3.5 items-center justify-center rounded-[3px] border border-input bg-background">
          <MinusIcon v-if="isExpanded" class="size-2.5" />
          <PlusIcon v-else class="size-2.5" />
        </span>
        <ChevronRightIcon v-else :class="cn('size-4 transition-transform', isExpanded && 'rotate-90')" />
      </button>
      <span v-else aria-hidden="true" class="size-4 shrink-0" />
      <Checkbox
        v-if="checkable && !node.disableCheckbox"
        tabindex="-1"
        :aria-label="node.title"
        :model-value="checkState(node.key)"
        :disabled="node.disabled"
        @click.stop
        @update:model-value="check(node)"
      />
      <component :is="node.icon" v-if="node.icon" class="size-4 shrink-0 text-muted-foreground" />
      <span class="truncate">
        <slot name="title" :node="node">
          <TreeHighlight :text="node.title" :query="searchValue" />
        </slot>
      </span>
    </div>
    <div v-if="!rows.length" class="px-2 py-6 text-center text-muted-foreground">
      No data
    </div>
  </div>
</template>
