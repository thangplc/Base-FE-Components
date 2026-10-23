<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useField } from 'vee-validate'
import { useId } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import FormFieldLayout from './FormFieldLayout.vue'

/**
 * Multi-line text field: label, description and error built in. Other attrs
 * (rows, placeholder, maxlength for the counter...) go to the Textarea.
 */
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  name: string
  label?: string
  description?: string
  class?: HTMLAttributes['class']
}>()

const { value, errorMessage, handleBlur } = useField<string>(() => props.name)
const id = useId()
</script>

<template>
  <FormFieldLayout
    :id="id"
    :label="label"
    :description="description"
    :error="errorMessage"
    :class="props.class"
  >
    <Textarea
      v-bind="$attrs"
      :id="id"
      v-model="value"
      :name="name"
      :aria-invalid="!!errorMessage"
      @blur="handleBlur"
    />
  </FormFieldLayout>
</template>
