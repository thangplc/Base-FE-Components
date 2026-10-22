<script setup lang="ts">
import type { ProgressRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ProgressVariants } from '.'
import { cn } from 'cn'
import { ProgressIndicator, ProgressRoot } from 'reka-ui'
import { computed } from 'vue'
import { indicatorVariants, progressVariants } from '.'

const props = withDefaults(
  defineProps<Omit<ProgressRootProps, 'modelValue'> & {
    /** 0–`max` (default 100). */
    modelValue?: number | null
    size?: ProgressVariants['size']
    variant?: ProgressVariants['variant']
    /** Unknown progress: a bar sliding back and forth. */
    indeterminate?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    modelValue: 0,
    max: 100,
    indeterminate: false,
  },
)

const percent = computed(() => Math.min(100, Math.max(0, ((props.modelValue ?? 0) / props.max) * 100)))
</script>

<template>
  <ProgressRoot
    data-slot="progress"
    :model-value="indeterminate ? null : (modelValue ?? 0)"
    :max="max"
    :class="cn(progressVariants({ size }), props.class)"
  >
    <ProgressIndicator
      data-slot="progress-indicator"
      :class="cn(indicatorVariants({ variant }), indeterminate ? 'w-2/5 animate-progress-indeterminate' : 'w-full')"
      :style="indeterminate ? undefined : { transform: `translateX(-${100 - percent}%)` }"
    />
  </ProgressRoot>
</template>
