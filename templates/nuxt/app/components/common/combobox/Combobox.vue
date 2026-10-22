<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ComboboxLabels, ComboboxOption } from './combobox-utils'
import { CheckIcon, ChevronDownIcon, Loader2Icon, PlusIcon, SearchIcon, XIcon } from '@lucide/vue'
import { computed, getCurrentInstance, nextTick, ref, useId, watch } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import ComboboxCheck from './ComboboxCheck.vue'
import { DEFAULT_COMBOBOX_LABELS, filterOptions, moveActive, normalizeText, toRows } from './combobox-utils'

/**
 * Searchable select on a Popover, single or `multiple` (chips).
 * `v-model`: string (single) or string[] (multiple). Slot `#option="{ option, selected }"`.
 */
const props = withDefaults(defineProps<{
  options: ComboboxOption[]
  /** Pick several values (string[]). */
  multiple?: boolean
  placeholder?: string
  /** Search box on top of the list (default true). */
  searchable?: boolean
  searchPlaceholder?: string
  emptyText?: string
  /** Spinner in the list while `@search` results load. */
  loading?: boolean
  /** Most options that can be selected (multiple). */
  maxCount?: number
  /** Chips shown in the trigger before "+N" (multiple, default 3). */
  maxTagCount?: number
  /** 'chips' (default) or 'count' ("3 selected") in the trigger. */
  tagMode?: 'chips' | 'count'
  /** A "Select all" row on top (multiple). */
  showSelectAll?: boolean
  /** Close after picking (default: true for single, false for multiple). */
  closeOnSelect?: boolean
  /** Offer to add the typed text as a new option. */
  creatable?: boolean
  /** Show an × to clear the value (default true). */
  clearable?: boolean
  disabled?: boolean
  size?: 'sm' | 'default'
  labels?: Partial<ComboboxLabels>
  id?: string
  invalid?: boolean
  class?: HTMLAttributes['class']
}>(), {
  multiple: false,
  searchable: true,
  searchPlaceholder: 'Search…',
  emptyText: 'No results.',
  loading: false,
  maxTagCount: 3,
  tagMode: 'chips',
  showSelectAll: false,
  closeOnSelect: undefined,
  creatable: false,
  clearable: true,
  disabled: false,
  size: 'default',
})

/** Listening to `@search` turns on server-side search: the list is shown unfiltered. */
const emit = defineEmits<{ search: [query: string] }>()
const serverSearch = !!getCurrentInstance()?.vnode.props?.onSearch
const model = defineModel<string | string[] | null>()

const listId = useId()
const labels = computed(() => ({ ...DEFAULT_COMBOBOX_LABELS, ...props.labels }))
const open = ref(false)
const query = ref('')
const active = ref(0)
const created = ref<ComboboxOption[]>([])
const list = ref<HTMLElement>()

const selected = computed(() => Array.isArray(model.value) ? model.value : model.value ? [model.value] : [])
const placeholderText = computed(() => props.placeholder ?? (props.multiple ? 'Select options' : 'Select an option'))
const shouldClose = computed(() => props.closeOnSelect ?? !props.multiple)

const allOptions = computed(() => [
  ...props.options,
  ...created.value.filter(c => !props.options.some(o => o.value === c.value)),
])
// Every option seen so far: selected values keep their label even when
// server-side search no longer returns them.
const known = new Map<string, ComboboxOption>()
watch(allOptions, options => options.forEach(o => known.set(o.value, o)), { immediate: true })
const optionOf = (value: string) => allOptions.value.find(o => o.value === value) ?? known.get(value) ?? { value, label: value }

// Rendered order (grouped); keyboard indexes follow it.
const rows = computed(() => toRows(serverSearch ? allOptions.value : filterOptions(allOptions.value, query.value)))
const visible = computed(() => rows.value.flatMap(row => row.kind === 'option' ? [row.option] : []))
const canCreate = computed(() => props.creatable && query.value.trim() !== ''
  && !allOptions.value.some(o => normalizeText(o.label) === normalizeText(query.value)))
const limitReached = computed(() => props.multiple && props.maxCount !== undefined && selected.value.length >= props.maxCount)
const isDisabled = (option: ComboboxOption) => !!option.disabled || (limitReached.value && !selected.value.includes(option.value))

type Item = { kind: 'create', label: string } | { kind: 'option', option: ComboboxOption }
const items = computed<Item[]>(() => [
  ...(canCreate.value ? [{ kind: 'create' as const, label: query.value.trim() }] : []),
  ...visible.value.map(option => ({ kind: 'option' as const, option })),
])
// Index of each option row in `items` (after the "create" row).
const indexOf = (option: ComboboxOption) => visible.value.indexOf(option) + (canCreate.value ? 1 : 0)

function setValue(next: string[]) {
  model.value = props.multiple ? next : (next[0] ?? null)
}

function toggle(option: ComboboxOption) {
  if (props.multiple) {
    if (selected.value.includes(option.value))
      setValue(selected.value.filter(v => v !== option.value))
    else if (!limitReached.value)
      setValue([...selected.value, option.value])
  }
  else {
    setValue([option.value])
  }
  if (shouldClose.value)
    open.value = false
}

function pick(item: Item | undefined) {
  if (!item)
    return
  if (item.kind === 'create') {
    const option = { value: item.label, label: item.label }
    created.value = [...created.value, option]
    setSearch('')
    toggle(option)
  }
  else if (!isDisabled(item.option)) {
    toggle(item.option)
  }
}

// "Select all" works on the visible, enabled options; it fills up to
// maxCount, and once full (or all picked) it clears them.
const selectable = computed(() => visible.value.filter(o => !o.disabled))
const allState = computed<boolean | 'indeterminate'>(() => {
  const count = selectable.value.filter(o => selected.value.includes(o.value)).length
  return count === 0 ? false : count === selectable.value.length ? true : 'indeterminate'
})
function toggleAll() {
  if (allState.value === true || limitReached.value)
    return setValue(selected.value.filter(v => !selectable.value.some(o => o.value === v)))
  const added = selectable.value.map(o => o.value).filter(v => !selected.value.includes(v))
  const room = props.maxCount === undefined ? added.length : Math.max(0, props.maxCount - selected.value.length)
  setValue([...selected.value, ...added.slice(0, room)])
}

function setSearch(text: string) {
  query.value = text
  active.value = 0
  emit('search', text)
}

function onOpenChange(next: boolean) {
  open.value = next
  if (!next)
    return
  setSearch('')
  // Start on the (first) selected option, or the first enabled one.
  const order = toRows(allOptions.value).flatMap(row => row.kind === 'option' ? [row.option] : [])
  const first = order.findIndex(o => selected.value.includes(o.value))
  active.value = first !== -1 ? first : Math.max(0, moveActive(order, -1, 1))
}

// Keep the active option in view while moving with the keyboard.
watch([active, open], () => nextTick(() => list.value?.querySelector<HTMLElement>('[data-active=true]')?.scrollIntoView({ block: 'nearest' })))

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const disabled = items.value.map(item => ({ disabled: item.kind === 'option' && isDisabled(item.option) }))
    const next = moveActive(disabled, active.value, event.key === 'ArrowDown' ? 1 : -1)
    if (next !== -1)
      active.value = next
  }
  else if (event.key === 'Enter') {
    event.preventDefault()
    pick(items.value[active.value])
  }
  else if (event.key === 'Backspace' && props.multiple && !query.value && selected.value.length) {
    setValue(selected.value.slice(0, -1))
  }
}

function onTriggerKeyDown(event: KeyboardEvent) {
  if (!open.value && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
    event.preventDefault()
    onOpenChange(true)
  }
}

const shownChips = computed(() => selected.value.slice(0, props.maxTagCount))
</script>

<template>
  <Popover :open="open" @update:open="onOpenChange">
    <PopoverTrigger as-child :disabled="disabled">
      <div
        :id="id"
        role="combobox"
        :tabindex="disabled ? -1 : 0"
        :aria-expanded="open"
        :aria-controls="listId"
        aria-haspopup="listbox"
        :aria-disabled="disabled || undefined"
        :aria-invalid="invalid || undefined"
        data-slot="combobox-trigger"
        :data-size="size"
        :class="cn(
          'flex w-full min-w-0 cursor-default items-center gap-1.5 rounded-lg border border-input bg-transparent py-1 pr-2 pl-2.5 text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:min-h-8 data-[size=sm]:min-h-7 dark:bg-input/30 dark:hover:bg-input/50',
          props.class,
        )"
        @keydown="onTriggerKeyDown"
      >
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          <span v-if="!selected.length" class="truncate text-muted-foreground">{{ placeholderText }}</span>
          <span v-else-if="!multiple" class="truncate">{{ optionOf(selected[0]!).label }}</span>
          <span v-else-if="tagMode === 'count'" class="truncate">{{ labels.selected(selected.length) }}</span>
          <template v-else>
            <span
              v-for="value in shownChips"
              :key="value"
              data-slot="combobox-chip"
              class="inline-flex h-5 max-w-40 items-center gap-0.5 rounded-md bg-secondary pr-0.5 pl-1.5 text-xs text-secondary-foreground"
            >
              <span class="truncate">{{ optionOf(value).label }}</span>
              <button
                v-if="!disabled"
                type="button"
                :aria-label="`${labels.clear} ${optionOf(value).label}`"
                class="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                @pointerdown.stop
                @click.stop="setValue(selected.filter(v => v !== value))"
              >
                <XIcon class="size-3" />
              </button>
            </span>
            <span
              v-if="selected.length > shownChips.length"
              class="inline-flex h-5 items-center rounded-md bg-secondary px-1.5 text-xs text-secondary-foreground"
            >+{{ selected.length - shownChips.length }}</span>
          </template>
        </div>
        <button
          v-if="clearable && selected.length && !disabled"
          type="button"
          :aria-label="labels.clear"
          class="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
          @pointerdown.stop
          @click.stop="setValue([])"
        >
          <XIcon class="size-3.5" />
        </button>
        <ChevronDownIcon class="size-4 shrink-0 text-muted-foreground" />
      </div>
    </PopoverTrigger>
    <PopoverContent align="start" class="w-(--reka-popover-trigger-width) min-w-48 gap-0 p-0" @keydown="onKeyDown">
      <div v-if="searchable" class="flex items-center gap-2 border-b px-2.5">
        <SearchIcon class="size-4 shrink-0 text-muted-foreground" />
        <input
          :value="query"
          :placeholder="searchPlaceholder"
          :aria-controls="listId"
          :aria-activedescendant="items[active] ? `${listId}-${active}` : undefined"
          class="h-9 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          @input="setSearch(($event.target as HTMLInputElement).value)"
        >
      </div>
      <div
        :id="listId"
        ref="list"
        role="listbox"
        :aria-multiselectable="multiple || undefined"
        :tabindex="searchable ? -1 : 0"
        class="max-h-64 overflow-y-auto p-1 outline-none"
      >
        <div v-if="loading" class="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
          <Loader2Icon class="size-4 animate-spin" />
          {{ labels.loading }}
        </div>
        <div
          v-if="multiple && showSelectAll && selectable.length"
          role="option"
          :aria-selected="allState === true"
          class="flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm font-medium hover:bg-accent"
          @pointerdown.prevent
          @click="toggleAll"
        >
          <ComboboxCheck :checked="allState" />
          {{ labels.selectAll }}
        </div>
        <div
          v-if="canCreate"
          :id="`${listId}-0`"
          role="option"
          :aria-selected="false"
          :data-active="active === 0"
          class="flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
          @pointerdown.prevent
          @pointermove="active = 0"
          @click="pick(items[0])"
        >
          <PlusIcon class="size-4 text-muted-foreground" />
          {{ labels.create(query.trim()) }}
        </div>
        <template v-for="row in rows" :key="row.kind === 'group' ? `group-${row.label}` : row.option.value">
          <div v-if="row.kind === 'group'" class="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">
            {{ row.label }}
          </div>
          <div
            v-else
            :id="`${listId}-${indexOf(row.option)}`"
            role="option"
            :aria-selected="selected.includes(row.option.value)"
            :aria-disabled="isDisabled(row.option) || undefined"
            :data-active="active === indexOf(row.option)"
            class="flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
            @pointerdown.prevent
            @pointermove="!isDisabled(row.option) && (active = indexOf(row.option))"
            @click="pick(items[indexOf(row.option)])"
          >
            <ComboboxCheck v-if="multiple" :checked="selected.includes(row.option.value)" />
            <div class="flex min-w-0 flex-1 flex-col">
              <slot name="option" :option="row.option" :selected="selected.includes(row.option.value)">
                <span class="truncate">{{ row.option.label }}</span>
                <span v-if="row.option.description" class="truncate text-xs text-muted-foreground">{{ row.option.description }}</span>
              </slot>
            </div>
            <CheckIcon v-if="!multiple && selected.includes(row.option.value)" class="size-4 shrink-0" />
          </div>
        </template>
        <div v-if="!loading && !items.length" class="px-2 py-6 text-center text-sm text-muted-foreground">
          {{ emptyText }}
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
