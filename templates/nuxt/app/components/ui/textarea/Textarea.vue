<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from 'cn'
import { computed } from 'vue'
import { CharacterCount } from '@/components/ui/character-count'

// Extra attrs (placeholder, type, name, data-slot...) go to the <textarea>.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
  minlength?: number
  maxlength?: number
  /**
   * Show "12/100" in the bottom-right corner. Defaults to true when
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

const textareaClass = 'border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors focus-visible:ring-3 aria-invalid:ring-3 md:text-sm flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
</script>

<template>
  <textarea
    v-if="!counted"
    v-model="modelValue"
    data-slot="textarea"
    :minlength="minlength"
    :maxlength="maxlength"
    :class="cn(textareaClass, props.class)"
    v-bind="$attrs"
   />
  <!-- With a counter, `class` sizes the wrapper and the textarea fills it. -->
  <div v-else data-slot="textarea-wrapper" :class="cn('relative w-full', props.class)">
    <textarea
      v-model="modelValue"
      data-slot="textarea"
      :minlength="minlength"
      :maxlength="maxlength"
      :class="cn(textareaClass, 'pb-6')"
      v-bind="$attrs"
     />
    <CharacterCount
      :length="length"
      :minlength="minlength"
      :maxlength="maxlength"
      class="absolute right-5 bottom-1.5"
    />
  </div>
</template>
