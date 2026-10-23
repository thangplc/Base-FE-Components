<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { normalizeText } from '@/components/common/combobox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import TransferList from './TransferList.vue'

export interface TransferItem {
  key: string
  title: string
  description?: string
  disabled?: boolean
}

export type TransferDirection = 'left' | 'right'

/**
 * Two lists side by side: tick items and move them across (on small screens
 * they stack). `v-model`: the right-hand list's keys; `v-model:selected-keys`
 * for the ticked items. Slots: #item="{ item }", #footer="{ direction }".
 */
const props = withDefaults(defineProps<{
  dataSource: TransferItem[]
  /** Titles of the two lists (default 'Source', 'Target'). */
  titles?: [string, string]
  showSearch?: boolean
  searchPlaceholder?: string
  /** Custom match for the search (default: title / description, accent-insensitive). */
  filterOption?: (input: string, item: TransferItem) => boolean
  /** Tri-state "select all" in each list header (default true). */
  showSelectAll?: boolean
  /** Only move to the right; items on the right have an × to remove them. */
  oneWay?: boolean
  /** Height of each list's scrolling area (default '18rem'). */
  listHeight?: number | string
  /** Texts for the move buttons (default: arrow icons only). */
  operations?: [string, string]
  disabled?: boolean
  invalid?: boolean
  id?: string
  class?: HTMLAttributes['class']
}>(), {
  titles: () => ['Source', 'Target'],
  showSearch: false,
  searchPlaceholder: 'Search…',
  filterOption: (input: string, item: TransferItem) => {
    const q = normalizeText(input)
    return normalizeText(item.title).includes(q) || normalizeText(item.description ?? '').includes(q)
  },
  showSelectAll: true,
  oneWay: false,
  listHeight: '18rem',
  disabled: false,
})

/** `change`: after each move, with the direction and the moved keys. */
const emit = defineEmits<{ change: [targetKeys: string[], direction: TransferDirection, movedKeys: string[]] }>()
const targetKeys = defineModel<string[]>({ default: () => [] })
const selectedModel = defineModel<string[]>('selectedKeys')
const innerSelected = ref<string[]>([])
const selected = computed({
  get: () => selectedModel.value ?? innerSelected.value,
  set: (next) => {
    innerSelected.value = next
    if (selectedModel.value !== undefined)
      selectedModel.value = next
  },
})

const byKey = computed(() => new Map(props.dataSource.map(item => [item.key, item])))
const source = computed(() => props.dataSource.filter(item => !targetKeys.value.includes(item.key)))
// The right list keeps the order items were moved in.
const target = computed(() => targetKeys.value.map(key => byKey.value.get(key)).filter((item): item is TransferItem => !!item))
const height = computed(() => typeof props.listHeight === 'number' ? `${props.listHeight}px` : props.listHeight)
const sourceSelected = computed(() => source.value.filter(item => selected.value.includes(item.key)).length)
const targetSelected = computed(() => target.value.filter(item => selected.value.includes(item.key)).length)

function move(direction: TransferDirection, keys?: string[]) {
  const fromList = direction === 'right' ? source.value : target.value
  const moving = (keys ?? fromList.filter(item => selected.value.includes(item.key)).map(item => item.key))
    .filter(key => !byKey.value.get(key)?.disabled)
  if (!moving.length)
    return
  const next = direction === 'right' ? [...targetKeys.value, ...moving] : targetKeys.value.filter(key => !moving.includes(key))
  targetKeys.value = next
  emit('change', next, direction, moving)
  selected.value = selected.value.filter(key => !moving.includes(key))
}

const shared = computed(() => ({
  showSearch: props.showSearch,
  searchPlaceholder: props.searchPlaceholder,
  filterOption: props.filterOption,
  listHeight: height.value,
  disabled: props.disabled,
  invalid: props.invalid,
}))
</script>

<template>
  <div
    :id="id"
    data-slot="transfer"
    :aria-invalid="invalid || undefined"
    :data-disabled="disabled || undefined"
    :class="cn('flex flex-col items-stretch gap-2 sm:flex-row sm:items-center', disabled && 'opacity-50', props.class)"
  >
    <TransferList
      v-bind="shared"
      v-model:selected="selected"
      direction="left"
      :title="titles[0]"
      :items="source"
      :show-select-all="showSelectAll"
      @move="key => move('right', [key])"
    >
      <template v-if="$slots.item" #item="{ item }">
        <slot name="item" :item="item" />
      </template>
      <template v-if="$slots.footer" #footer>
        <slot name="footer" direction="left" />
      </template>
    </TransferList>
    <div class="flex justify-center gap-2 sm:flex-col">
      <Button
        type="button"
        :size="operations ? 'sm' : 'icon-sm'"
        variant="outline"
        aria-label="Move to the right"
        :disabled="disabled || sourceSelected === 0"
        @click="move('right')"
      >
        <ChevronRightIcon class="rotate-90 sm:rotate-0" />
        {{ operations?.[0] }}
      </Button>
      <Button
        v-if="!oneWay"
        type="button"
        :size="operations ? 'sm' : 'icon-sm'"
        variant="outline"
        aria-label="Move to the left"
        :disabled="disabled || targetSelected === 0"
        @click="move('left')"
      >
        <ChevronLeftIcon class="rotate-90 sm:rotate-0" />
        {{ operations?.[1] }}
      </Button>
    </div>
    <TransferList
      v-bind="shared"
      v-model:selected="selected"
      direction="right"
      :title="titles[1]"
      :items="target"
      :removable="oneWay"
      :show-select-all="showSelectAll && !oneWay"
      @move="key => move('left', [key])"
      @remove="key => move('left', [key])"
    >
      <template v-if="$slots.item" #item="{ item }">
        <slot name="item" :item="item" />
      </template>
      <template v-if="$slots.footer" #footer>
        <slot name="footer" direction="right" />
      </template>
    </TransferList>
  </div>
</template>
