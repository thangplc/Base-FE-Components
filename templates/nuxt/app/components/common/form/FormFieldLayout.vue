<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'

/**
 * Label + control + description + error, built on the shadcn `Field`
 * primitives. FormInput, FormSelect, ... render their control in the slot.
 */
const props = withDefaults(defineProps<{
  id: string
  label?: string
  description?: string
  error?: string
  orientation?: 'vertical' | 'horizontal'
  class?: HTMLAttributes['class']
}>(), {
  orientation: 'vertical',
})
</script>

<template>
  <Field
    v-if="orientation === 'horizontal'"
    orientation="horizontal"
    :data-invalid="!!error || undefined"
    :class="props.class"
  >
    <FieldContent>
      <FieldLabel v-if="label" :for="id">
        {{ label }}
      </FieldLabel>
      <FieldDescription v-if="description">
        {{ description }}
      </FieldDescription>
      <FieldError v-if="error" :errors="[error]" />
    </FieldContent>
    <slot />
  </Field>
  <Field
    v-else
    :data-invalid="!!error || undefined"
    :class="props.class"
  >
    <FieldLabel v-if="label" :for="id">
      {{ label }}
    </FieldLabel>
    <slot />
    <FieldDescription v-if="description">
      {{ description }}
    </FieldDescription>
    <FieldError v-if="error" :errors="[error]" />
  </Field>
</template>
