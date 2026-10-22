<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from 'cn'
import { computed } from 'vue'
import { CharacterCount } from '@/components/ui/character-count'

// Extra attrs (placeholder, type, name, data-slot...) go to the <input>.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
  minlength?: number
  maxlength?: number
  /**
   * Show "12/100" at the end of the field. Defaults to true when
   * `maxlength` or `minlength` is set.
   */
  showCount?: boolean
}>(), {
  showCount: undefined,
})

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const counted = computed(() => props.showCount ?? (props.minlength !== undefined || props.maxlength !== undefined))
const length = computed(() => String(modelValue.value ?? '').length)

const inputClass = 'dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-8 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors file:h-6 file:text-sm file:font-medium focus-visible:ring-3 aria-invalid:ring-3 md:text-sm w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
</script>

<template>
  <input
    v-if="!counted"
    v-model="modelValue"
    data-slot="input"
    :minlength="minlength"
    :maxlength="maxlength"
    :class="cn(inputClass, props.class)"
    v-bind="$attrs"
  >
  <!-- With a counter, `class` sizes the wrapper and the input fills it. -->
  <div v-else data-slot="input-wrapper" :class="cn('relative w-full', props.class)">
    <input
      v-model="modelValue"
      data-slot="input"
      :minlength="minlength"
      :maxlength="maxlength"
      :class="cn(inputClass, 'pr-16')"
      v-bind="$attrs"
    >
    <CharacterCount
      :length="length"
      :minlength="minlength"
      :maxlength="maxlength"
      class="absolute inset-y-0 right-2.5 flex items-center"
    />
  </div>
</template>
