<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { PickerLabels } from './date-time'
import { CalendarIcon, XIcon } from '@lucide/vue'
import { nextTick, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PopoverAnchor, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { maskDateInput } from './date-time'

/** Outline button (or a masked input with `editable`) showing the value, with an optional ×. */
const props = defineProps<{
  id?: string
  text?: string
  placeholder: string
  disabled?: boolean
  clearable?: boolean
  invalid?: boolean
  labels: PickerLabels
  /** Typing: the mask pattern, and a commit that returns false for text it can't use. */
  editable?: { pattern: string, onCommit: (text: string) => boolean }
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{ clear: [] }>()

const draft = ref(props.text ?? '')
const error = ref(false)
// Follow the value when it changes from outside (calendar, clear, form reset).
watch(() => props.text, (text) => {
  draft.value = text ?? ''
  error.value = false
})

function onInput(raw: string | number) {
  // Set the raw text first so the masked one always re-renders the <input>.
  draft.value = String(raw)
  error.value = false
  nextTick(() => (draft.value = maskDateInput(draft.value, props.editable!.pattern)))
}

// Enter keeps bad text (marked invalid) so it can be fixed; blur reverts it.
function commit(revertOnError: boolean) {
  if (draft.value === (props.text ?? ''))
    return (error.value = false)
  if (!draft.value.trim())
    return emit('clear')
  if (props.editable!.onCommit(draft.value))
    return (error.value = false)
  if (revertOnError)
    revert()
  else error.value = true
}

function revert() {
  draft.value = props.text ?? ''
  error.value = false
}

const periodPattern = (pattern: string) => /a/.test(pattern.replace(/'[^']*'/g, ''))
</script>

<template>
  <PopoverAnchor v-if="editable" as-child>
    <div :class="cn('relative w-full', props.class)">
      <PopoverTrigger as-child>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          :aria-label="labels.openCalendar"
          :disabled="disabled"
          class="absolute top-1/2 left-1.5 z-10 -translate-y-1/2 text-muted-foreground"
        >
          <CalendarIcon />
        </Button>
      </PopoverTrigger>
      <Input
        :id="id"
        :model-value="draft"
        :placeholder="placeholder"
        :disabled="disabled"
        autocomplete="off"
        :inputmode="periodPattern(editable.pattern) ? 'text' : 'numeric'"
        :aria-invalid="invalid || error || undefined"
        :class="cn('pl-9', clearable && draft && 'pr-8')"
        @update:model-value="onInput"
        @blur="commit(true)"
        @keydown.enter.prevent="commit(false)"
        @keydown.esc="revert"
      />
      <Button
        v-if="clearable && draft && !disabled"
        type="button"
        variant="ghost"
        size="icon-xs"
        :aria-label="labels.clear"
        class="absolute top-1/2 right-1.5 -translate-y-1/2"
        @click="emit('clear')"
      >
        <XIcon />
      </Button>
    </div>
  </PopoverAnchor>
  <div v-else :class="cn('relative w-full', props.class)">
    <PopoverTrigger as-child>
      <Button
        :id="id"
        type="button"
        variant="outline"
        :disabled="disabled"
        :aria-invalid="invalid || undefined"
        :class="cn('w-full justify-start font-normal', !text && 'text-muted-foreground', clearable && text && 'pr-8')"
      >
        <CalendarIcon data-icon="inline-start" />
        <span class="truncate">{{ text ?? placeholder }}</span>
      </Button>
    </PopoverTrigger>
    <Button
      v-if="clearable && text && !disabled"
      type="button"
      variant="ghost"
      size="icon-xs"
      :aria-label="labels.clear"
      class="absolute top-1/2 right-1.5 -translate-y-1/2"
      @click="emit('clear')"
    >
      <XIcon />
    </Button>
  </div>
</template>
