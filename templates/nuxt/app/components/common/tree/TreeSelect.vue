<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TreeNode } from './Tree.vue'
import { ChevronDownIcon, SearchIcon, XIcon } from '@lucide/vue'
import { computed, ref, useId } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import Tree from './Tree.vue'
import { applyCheckedStrategy, conductChecked, indexTree, toggleChecked } from './tree-utils'

/**
 * Dropdown field with a Tree inside: one node, several (`multiple`), or
 * checkboxes (`tree-checkable`) with a parent / child strategy.
 * `v-model`: string, or string[] with multiple / tree-checkable.
 */
const props = withDefaults(defineProps<{
  treeData: TreeNode[]
  /** Pick several nodes by clicking them. */
  multiple?: boolean
  /** Pick with checkboxes (implies multiple). */
  treeCheckable?: boolean
  /**
   * With tree-checkable, which checked keys form the value: 'all' (default),
   * 'parent' (a fully checked parent stands for its children) or 'child' (leaves only).
   */
  showCheckedStrategy?: 'all' | 'parent' | 'child'
  placeholder?: string
  /** Search box on top of the tree. */
  showSearch?: boolean
  searchPlaceholder?: string
  /** Show an × to clear the value (default true). */
  allowClear?: boolean
  /** Chips shown before "+N" (multiple, default 3). */
  maxTagCount?: number
  treeDefaultExpandAll?: boolean
  expandIcon?: 'chevron' | 'plus-minus'
  showLine?: boolean
  loadData?: (node: TreeNode) => Promise<unknown>
  /** Height of the tree inside the dropdown (default '18rem'). */
  dropdownHeight?: number | string
  disabled?: boolean
  id?: string
  invalid?: boolean
  class?: HTMLAttributes['class']
}>(), {
  multiple: false,
  treeCheckable: false,
  showCheckedStrategy: 'all',
  placeholder: 'Select',
  showSearch: false,
  searchPlaceholder: 'Search…',
  allowClear: true,
  maxTagCount: 3,
  treeDefaultExpandAll: false,
  expandIcon: 'chevron',
  showLine: false,
  dropdownHeight: '18rem',
  disabled: false,
})

const model = defineModel<string | string[] | null>()
const open = ref(false)
const query = ref('')
const contentId = useId()

const many = computed(() => props.treeCheckable || props.multiple)
const index = computed(() => indexTree(props.treeData))
const value = computed(() => Array.isArray(model.value) ? model.value : model.value ? [model.value] : [])
// The value may hold only parents ('parent' strategy): expand it to every checked key for the tree.
const checkedKeys = computed(() => props.treeCheckable ? [...conductChecked(value.value, index.value)] : [])
const shown = computed(() => value.value.slice(0, props.maxTagCount))
const titleOf = (key: string) => index.value.nodes.get(key)?.title ?? key

function emitValue(next: string[]) {
  model.value = many.value ? next : (next[0] ?? null)
}

// Removing a chip unchecks its subtree and re-checks the parents (tree rules).
function removeChip(key: string) {
  if (props.treeCheckable)
    emitValue(applyCheckedStrategy(toggleChecked(key, conductChecked(value.value, index.value), index.value), index.value, props.showCheckedStrategy))
  else emitValue(value.value.filter(k => k !== key))
}

function onSelect(keys: string[]) {
  emitValue(keys)
  if (!many.value)
    open.value = false
}

function onOpenChange(next: boolean) {
  open.value = next
  if (next)
    query.value = ''
}

function onTriggerKeyDown(event: KeyboardEvent) {
  if (!open.value && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
    event.preventDefault()
    onOpenChange(true)
  }
}
</script>

<template>
  <Popover :open="open" @update:open="onOpenChange">
    <PopoverTrigger as-child :disabled="disabled">
      <div
        :id="id"
        role="combobox"
        :tabindex="disabled ? -1 : 0"
        :aria-expanded="open"
        :aria-controls="contentId"
        aria-haspopup="tree"
        :aria-disabled="disabled || undefined"
        :aria-invalid="invalid || undefined"
        data-slot="tree-select-trigger"
        :class="cn(
          'flex min-h-8 w-full min-w-0 cursor-default items-center gap-1.5 rounded-lg border border-input bg-transparent py-1 pr-2 pl-2.5 text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30',
          props.class,
        )"
        @keydown="onTriggerKeyDown"
      >
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          <span v-if="!value.length" class="truncate text-muted-foreground">{{ placeholder }}</span>
          <span v-else-if="!many" class="truncate">{{ titleOf(value[0]!) }}</span>
          <template v-else>
            <span
              v-for="key in shown"
              :key="key"
              data-slot="tree-select-chip"
              class="inline-flex h-5 max-w-40 items-center gap-0.5 rounded-md bg-secondary pr-0.5 pl-1.5 text-xs text-secondary-foreground"
            >
              <span class="truncate">{{ titleOf(key) }}</span>
              <button
                v-if="!disabled"
                type="button"
                :aria-label="`Remove ${titleOf(key)}`"
                class="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                @pointerdown.stop
                @click.stop="removeChip(key)"
              >
                <XIcon class="size-3" />
              </button>
            </span>
            <span v-if="value.length > shown.length" class="inline-flex h-5 items-center rounded-md bg-secondary px-1.5 text-xs">
              +{{ value.length - shown.length }}
            </span>
          </template>
        </div>
        <button
          v-if="allowClear && value.length && !disabled"
          type="button"
          aria-label="Clear"
          class="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
          @pointerdown.stop
          @click.stop="emitValue([])"
        >
          <XIcon class="size-3.5" />
        </button>
        <ChevronDownIcon class="size-4 shrink-0 text-muted-foreground" />
      </div>
    </PopoverTrigger>
    <PopoverContent :id="contentId" align="start" class="w-(--reka-popover-trigger-width) min-w-56 gap-0 p-0">
      <div v-if="showSearch" class="flex items-center gap-2 border-b px-2.5">
        <SearchIcon class="size-4 shrink-0 text-muted-foreground" />
        <input
          v-model="query"
          :placeholder="searchPlaceholder"
          class="h-9 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        >
      </div>
      <Tree
        :tree-data="treeData"
        :default-expand-all="treeDefaultExpandAll"
        :expand-icon="expandIcon"
        :show-line="showLine"
        :load-data="loadData"
        :search-value="query"
        :height="dropdownHeight"
        class="p-1"
        :selectable="!treeCheckable"
        :multiple="multiple && !treeCheckable"
        :selected-keys="treeCheckable ? [] : value"
        :checkable="treeCheckable"
        :checked-keys="checkedKeys"
        @select="onSelect"
        @check="keys => emitValue(applyCheckedStrategy(new Set(keys), index, showCheckedStrategy))"
      />
    </PopoverContent>
  </Popover>
</template>
