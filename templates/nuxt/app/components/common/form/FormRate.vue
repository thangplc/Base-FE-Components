<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useField } from 'vee-validate'
import { useId } from 'vue'
import Rate from '../Rate.vue'
import FormFieldLayout from './FormFieldLayout.vue'

/** Star rating field; the form value is a number (0 = not rated). Other attrs go to Rate. */
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  name: string
  label?: string
  description?: string
  class?: HTMLAttributes['class']
}>()

const { value, errorMessage, handleBlur } = useField<number>(() => props.name)
const id = useId()
</script>

<template>
  <FormFieldLayout :id="id" :label="label" :description="description" :error="errorMessage" :class="props.class">
    <Rate
      v-bind="$attrs"
      :id="id"
      :model-value="value ?? 0"
      :invalid="!!errorMessage"
      @update:model-value="(next) => { value = next; handleBlur() }"
    />
  </FormFieldLayout>
</template>
