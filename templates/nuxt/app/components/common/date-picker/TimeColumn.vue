<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { cn } from '@/lib/utils'

export interface TimeColumnItem {
  key: string | number
  label: string
  selected: boolean
  disabled: boolean
  /** What a click picks (seconds since midnight). */
  seconds: number
}

/** One scrollable column of TimeColumns; the picked option scrolls to the top. */
const props = defineProps<{ label: string, items: TimeColumnItem[] }>()
const emit = defineEmits<{ select: [seconds: number] }>()

const column = ref<HTMLElement>()
const selected = computed(() => props.items.findIndex(item => item.selected))

function scroll(behavior: ScrollBehavior) {
  const option = column.value?.querySelector<HTMLElement>('[data-selected=true]')
  if (column.value && option)
    column.value.scrollTo({ top: option.offsetTop - 4, behavior })
}

onMounted(() => scroll('instant'))
watch(selected, () => nextTick(() => scroll('smooth')))
</script>

<template>
  <div
    ref="column"
    role="listbox"
    :aria-label="label"
    class="relative flex-1 overflow-y-auto overscroll-contain p-1 [scrollbar-width:none] after:block after:h-[calc(100%-2.25rem)] after:content-['']"
  >
    <button
      v-for="option in items"
      :key="option.key"
      type="button"
      role="option"
      :aria-selected="option.selected"
      :data-selected="option.selected"
      :disabled="option.disabled"
      :class="cn(
        'flex h-7 w-full items-center justify-center rounded-md text-sm tabular-nums outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-35',
        option.selected && 'bg-primary text-primary-foreground hover:bg-primary',
      )"
      @click="emit('select', option.seconds)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
