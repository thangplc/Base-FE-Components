<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { CascaderOption } from './cascader-utils'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, Loader2Icon, SearchIcon, XIcon } from '@lucide/vue'
import { computed, ref, useId } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { applyCheckedStrategy, conductChecked, halfCheckedOf, toggleChecked } from '../tree/tree-utils'
import { canExpand, indexCascader, keyPath, optionsAt, pathKey, searchPaths } from './cascader-utils'

/**
 * Pick a path through nested options, column by column (one column at a time
 * on small screens). `v-model`: a path (string[]), or paths (string[][]) with
 * `multiple`. `@change` also gets the selected options.
 */
const props = withDefaults(defineProps<{
  options: CascaderOption[]
  /** Checkboxes on every level; parents are tri-state. */
  multiple?: boolean
  /** multiple: which checked paths form the value: 'parent' (default), 'child' (leaves) or 'all'. */
  showCheckedStrategy?: 'all' | 'parent' | 'child'
  /** Single: pick a non-leaf option too (every click on a parent sets the value). */
  changeOnSelect?: boolean
  /** 'click' (default) or 'hover' opens the next column. */
  expandTrigger?: 'click' | 'hover'
  /** Trigger text for a path (default: labels joined with `separator`). */
  displayRender?: (labels: string[], options: CascaderOption[]) => string
  separator?: string
  /** Search over whole paths, listed flat ("Hà Nội / Ba Đình"). */
  showSearch?: boolean
  searchPlaceholder?: string
  /** Load an option's children when it is opened (set them in `options`). */
  loadData?: (selectedOptions: CascaderOption[]) => Promise<unknown>
  placeholder?: string
  /** Show an × to clear the value (default true). */
  allowClear?: boolean
  /** Chips shown before "+N" (multiple, default 3). */
  maxTagCount?: number
  disabled?: boolean
  id?: string
  invalid?: boolean
  class?: HTMLAttributes['class']
}>(), {
  multiple: false,
  showCheckedStrategy: 'parent',
  changeOnSelect: false,
  expandTrigger: 'click',
  separator: ' / ',
  showSearch: false,
  searchPlaceholder: 'Search…',
  placeholder: 'Select',
  allowClear: true,
  maxTagCount: 3,
  disabled: false,
})

const emit = defineEmits<{ change: [value: string[] | string[][] | undefined, selectedOptions: CascaderOption[] | CascaderOption[][]] }>()
const model = defineModel<string[] | string[][] | null>()

const contentId = useId()
const open = ref(false)
const query = ref('')
// Values of the opened options, one per column after the first.
const activePath = ref<string[]>([])
const loading = ref<string>()

const single = computed(() => !props.multiple && model.value ? model.value as string[] : [])
const paths = computed(() => props.multiple && model.value ? model.value as string[][] : [])
const index = computed(() => indexCascader(props.options))
const checked = computed(() => props.multiple ? conductChecked(paths.value.map(pathKey), index.value) : new Set<string>())
const half = computed(() => props.multiple ? halfCheckedOf(checked.value, index.value) : new Set<string>())
const hasValue = computed(() => props.multiple ? paths.value.length > 0 : single.value.length > 0)
const shown = computed(() => paths.value.slice(0, props.maxTagCount))
const lazy = computed(() => !!props.loadData)

function label(path: string[]) {
  const opts = optionsAt(props.options, path)
  const labels = opts.map(o => o.label)
  return props.displayRender ? props.displayRender(labels, opts) : labels.join(props.separator)
}

function emitSingle(path: string[] | undefined) {
  model.value = path ?? null
  emit('change', path, path ? optionsAt(props.options, path) : [])
}

function emitChecked(next: Set<string>) {
  const value = applyCheckedStrategy(next, index.value, props.showCheckedStrategy).map(keyPath)
  model.value = value
  emit('change', value, value.map(path => optionsAt(props.options, path)))
}

const columns = computed(() => {
  const list: { parentPath: string[], options: CascaderOption[] }[] = [{ parentPath: [], options: props.options }]
  activePath.value.forEach((_, depth) => {
    const path = activePath.value.slice(0, depth + 1)
    const children = optionsAt(props.options, path).at(-1)?.children
    if (children?.length)
      list.push({ parentPath: path, options: children })
  })
  return list
})

async function openOption(path: string[], option: CascaderOption) {
  activePath.value = path
  if (props.loadData && !option.isLeaf && !option.children) {
    loading.value = pathKey(path)
    try {
      await props.loadData(optionsAt(props.options, path))
    }
    finally {
      loading.value = undefined
    }
  }
}

function pick(path: string[], option: CascaderOption) {
  if (option.disabled)
    return
  const expandable = canExpand(option, lazy.value)
  if (props.multiple) {
    if (expandable)
      openOption(path, option)
    else emitChecked(toggleChecked(pathKey(path), checked.value, index.value))
    return
  }
  if (expandable) {
    openOption(path, option)
    if (props.changeOnSelect)
      emitSingle(path)
  }
  else {
    emitSingle(path)
    open.value = false
  }
}

const matches = computed(() => props.showSearch && query.value.trim()
  ? searchPaths(props.options, query.value, props.separator, !props.multiple && props.changeOnSelect)
  : undefined)

function pickMatch(path: CascaderOption[]) {
  const values = path.map(o => o.value)
  if (props.multiple) {
    emitChecked(toggleChecked(pathKey(values), checked.value, index.value))
  }
  else {
    emitSingle(values)
    open.value = false
  }
}

function onOpenChange(next: boolean) {
  open.value = next
  if (!next)
    return
  query.value = ''
  // Reopen on the current path (single) so its columns show.
  const last = optionsAt(props.options, single.value).at(-1)
  activePath.value = props.multiple ? [] : last && canExpand(last, lazy.value) ? single.value : single.value.slice(0, -1)
}

function onTriggerKeyDown(event: KeyboardEvent) {
  if (!open.value && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
    event.preventDefault()
    onOpenChange(true)
  }
}

const checkState = (key: string) => checked.value.has(key) ? true : half.value.has(key) ? 'indeterminate' : false
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
        aria-haspopup="listbox"
        :aria-disabled="disabled || undefined"
        :aria-invalid="invalid || undefined"
        data-slot="cascader-trigger"
        :class="cn(
          'flex min-h-8 w-full min-w-0 cursor-default items-center gap-1.5 rounded-lg border border-input bg-transparent py-1 pr-2 pl-2.5 text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30',
          props.class,
        )"
        @keydown="onTriggerKeyDown"
      >
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          <span v-if="!hasValue" class="truncate text-muted-foreground">{{ placeholder }}</span>
          <span v-else-if="!multiple" class="truncate">{{ label(single) }}</span>
          <template v-else>
            <span
              v-for="path in shown"
              :key="pathKey(path)"
              data-slot="cascader-chip"
              class="inline-flex h-5 max-w-48 items-center gap-0.5 rounded-md bg-secondary pr-0.5 pl-1.5 text-xs text-secondary-foreground"
            >
              <span class="truncate">{{ label(path) }}</span>
              <button
                v-if="!disabled"
                type="button"
                aria-label="Remove"
                class="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                @pointerdown.stop
                @click.stop="emitChecked(toggleChecked(pathKey(path), checked, index))"
              >
                <XIcon class="size-3" />
              </button>
            </span>
            <span v-if="paths.length > shown.length" class="inline-flex h-5 items-center rounded-md bg-secondary px-1.5 text-xs">
              +{{ paths.length - shown.length }}
            </span>
          </template>
        </div>
        <button
          v-if="allowClear && hasValue && !disabled"
          type="button"
          aria-label="Clear"
          class="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
          @pointerdown.stop
          @click.stop="multiple ? emitChecked(new Set()) : emitSingle(undefined)"
        >
          <XIcon class="size-3.5" />
        </button>
        <ChevronDownIcon class="size-4 shrink-0 text-muted-foreground" />
      </div>
    </PopoverTrigger>
    <PopoverContent :id="contentId" align="start" class="w-auto max-w-[calc(100vw-2rem)] gap-0 p-0">
      <div v-if="showSearch" class="flex items-center gap-2 border-b px-2.5">
        <SearchIcon class="size-4 shrink-0 text-muted-foreground" />
        <input
          v-model="query"
          :placeholder="searchPlaceholder"
          class="h-9 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        >
      </div>
      <div v-if="matches" role="listbox" class="max-h-72 min-w-56 overflow-y-auto p-1">
        <div
          v-for="match in matches"
          :key="pathKey(match.path.map(o => o.value))"
          role="option"
          :aria-selected="multiple ? checked.has(pathKey(match.path.map(o => o.value))) : pathKey(single) === pathKey(match.path.map(o => o.value))"
          class="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
          @click="pickMatch(match.path)"
        >
          <Checkbox v-if="multiple" tabindex="-1" aria-hidden="true" :model-value="checked.has(pathKey(match.path.map(o => o.value)))" />
          {{ match.text }}
        </div>
        <div v-if="!matches.length" class="px-2 py-6 text-center text-sm text-muted-foreground">
          No results.
        </div>
      </div>
      <div v-else class="flex">
        <!-- Small screens: only the deepest column, with a way back. -->
        <div
          v-for="(column, depth) in columns"
          :key="pathKey(column.parentPath)"
          role="listbox"
          data-slot="cascader-column"
          :class="cn('max-h-72 min-w-40 flex-col overflow-y-auto border-l p-1 first:border-l-0', depth === columns.length - 1 ? 'flex' : 'hidden sm:flex')"
        >
          <button
            v-if="depth > 0"
            type="button"
            class="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent sm:hidden"
            @click="activePath = column.parentPath.slice(0, -1)"
          >
            <ChevronLeftIcon class="size-3.5" />
            {{ optionsAt(options, column.parentPath).at(-1)?.label }}
          </button>
          <div
            v-for="option in column.options"
            :key="option.value"
            role="option"
            :aria-selected="multiple ? checked.has(pathKey([...column.parentPath, option.value])) : pathKey(single.slice(0, depth + 1)) === pathKey([...column.parentPath, option.value])"
            :aria-disabled="option.disabled || undefined"
            :data-active="activePath[depth] === option.value || undefined"
            :class="cn(
              'flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent data-active:bg-accent',
              !multiple && pathKey(single.slice(0, depth + 1)) === pathKey([...column.parentPath, option.value]) && 'font-medium',
              option.disabled && 'pointer-events-none opacity-50',
            )"
            @click="pick([...column.parentPath, option.value], option)"
            @pointerenter="expandTrigger === 'hover' && canExpand(option, lazy) && !option.disabled && openOption([...column.parentPath, option.value], option)"
          >
            <Checkbox
              v-if="multiple"
              tabindex="-1"
              :aria-label="option.label"
              :model-value="checkState(pathKey([...column.parentPath, option.value]))"
              :disabled="option.disabled"
              @click.stop
              @update:model-value="emitChecked(toggleChecked(pathKey([...column.parentPath, option.value]), checked, index))"
            />
            <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
            <Loader2Icon v-if="loading === pathKey([...column.parentPath, option.value])" class="size-3.5 animate-spin text-muted-foreground" />
            <ChevronRightIcon v-else-if="canExpand(option, lazy)" class="size-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
