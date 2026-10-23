<script setup lang="ts">
import type { TransferDirection, TransferItem } from './Transfer.vue'
import { SearchIcon, XIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

/** One list of Transfer. Slots: #item="{ item }", #footer. */
const props = defineProps<{
  direction: TransferDirection
  title: string
  items: TransferItem[]
  selected: string[]
  /** One-way target list: an × per item instead of checkboxes. */
  removable?: boolean
  showSearch: boolean
  searchPlaceholder: string
  filterOption: (input: string, item: TransferItem) => boolean
  showSelectAll: boolean
  listHeight: string
  disabled: boolean
  invalid?: boolean
}>()

const emit = defineEmits<{ 'update:selected': [keys: string[]], 'move': [key: string], 'remove': [key: string] }>()

const query = ref('')
const visible = computed(() => query.value ? props.items.filter(item => props.filterOption(query.value, item)) : props.items)
// "Select all" works on the visible, enabled items.
const selectable = computed(() => visible.value.filter(item => !item.disabled))
const keys = computed(() => selectable.value.map(item => item.key))
const checkedCount = computed(() => props.items.filter(item => props.selected.includes(item.key)).length)
const allState = computed<boolean | 'indeterminate'>(() => {
  const count = selectable.value.filter(item => props.selected.includes(item.key)).length
  return count === 0 ? false : count === selectable.value.length ? true : 'indeterminate'
})

function toggle(key: string) {
  emit('update:selected', props.selected.includes(key) ? props.selected.filter(k => k !== key) : [...props.selected, key])
}
function toggleAll() {
  emit('update:selected', allState.value === true
    ? props.selected.filter(key => !keys.value.includes(key))
    : [...new Set([...props.selected, ...keys.value])])
}
</script>

<template>
  <div
    data-slot="transfer-list"
    :data-direction="direction"
    tabindex="-1"
    :class="cn('flex min-w-0 flex-1 flex-col rounded-lg border outline-none', invalid && 'border-destructive ring-3 ring-destructive/20')"
  >
    <div class="flex items-center gap-2 border-b px-3 py-2 text-sm">
      <Checkbox
        v-if="showSelectAll"
        aria-label="Select all"
        :model-value="allState"
        :disabled="disabled || selectable.length === 0"
        @update:model-value="toggleAll"
      />
      <span class="text-muted-foreground tabular-nums">
        {{ removable ? items.length : `${checkedCount}/${items.length}` }} {{ items.length === 1 ? 'item' : 'items' }}
      </span>
      <span class="ml-auto truncate font-medium">{{ title }}</span>
    </div>
    <div v-if="showSearch" class="flex items-center gap-2 border-b px-3">
      <SearchIcon class="size-4 shrink-0 text-muted-foreground" />
      <input
        v-model="query"
        :placeholder="searchPlaceholder"
        :disabled="disabled"
        class="h-8 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      >
    </div>
    <ul role="listbox" aria-multiselectable="true" class="overflow-y-auto p-1" :style="{ height: listHeight }">
      <li
        v-for="item in visible"
        :key="item.key"
        role="option"
        :aria-selected="selected.includes(item.key)"
        :aria-disabled="disabled || item.disabled || undefined"
        :class="cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent', disabled || item.disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer')"
        @click="!removable && toggle(item.key)"
        @dblclick="emit('move', item.key)"
      >
        <!-- Double-click moves the item straight across. -->
        <Checkbox
          v-if="!removable"
          :aria-label="item.title"
          :model-value="selected.includes(item.key)"
          :disabled="disabled || item.disabled"
          @click.stop
          @update:model-value="toggle(item.key)"
        />
        <div class="flex min-w-0 flex-1 flex-col">
          <slot name="item" :item="item">
            <span class="truncate">{{ item.title }}</span>
            <span v-if="item.description" class="truncate text-xs text-muted-foreground">{{ item.description }}</span>
          </slot>
        </div>
        <Button
          v-if="removable"
          type="button"
          variant="ghost"
          size="icon-xs"
          :aria-label="`Remove ${item.title}`"
          @click="emit('remove', item.key)"
        >
          <XIcon />
        </Button>
      </li>
      <li v-if="!visible.length" class="flex h-full items-center justify-center text-sm text-muted-foreground">
        No items
      </li>
    </ul>
    <div v-if="$slots.footer" class="border-t px-3 py-2">
      <slot name="footer" />
    </div>
  </div>
</template>
