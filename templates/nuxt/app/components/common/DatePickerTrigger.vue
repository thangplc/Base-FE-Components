<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { CalendarIcon, XIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/** Outline button showing the value, with an optional clear (×) on the right. */
defineProps<{
  id?: string
  text?: string
  placeholder: string
  disabled?: boolean
  clearable?: boolean
  invalid?: boolean
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{ clear: [] }>()
</script>

<template>
  <div :class="cn('relative w-full', $props.class)">
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
      aria-label="Clear"
      class="absolute top-1/2 right-1.5 -translate-y-1/2"
      @click="emit('clear')"
    >
      <XIcon />
    </Button>
  </div>
</template>
