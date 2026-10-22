<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from 'cn'
import { computed } from 'vue'

/**
 * "12/100" (or "3 / min 10") shown by Input and Textarea when they have
 * minlength / maxlength. Red while below the minimum (once typing started)
 * and when the maximum is reached.
 */
const props = defineProps<{
  length: number
  minlength?: number
  maxlength?: number
  class?: HTMLAttributes['class']
}>()

const warn = computed(() =>
  (props.minlength !== undefined && props.length > 0 && props.length < props.minlength)
  || (props.maxlength !== undefined && props.length >= props.maxlength),
)
</script>

<template>
  <span
    data-slot="character-count"
    aria-live="polite"
    :class="cn('pointer-events-none text-xs text-muted-foreground tabular-nums select-none', warn && 'text-destructive', props.class)"
  >
    {{ maxlength !== undefined ? `${length}/${maxlength}` : `${length} / min ${minlength}` }}
  </span>
</template>
