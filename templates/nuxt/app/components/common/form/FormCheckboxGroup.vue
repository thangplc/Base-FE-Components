<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { CheckboxGroupOption } from '../CheckboxGroup.vue'
import { useField } from 'vee-validate'
import { useId } from 'vue'
import CheckboxGroup from '../CheckboxGroup.vue'
import FormFieldLayout from './FormFieldLayout.vue'

/**
 * Checkbox list field: the form value is a string[] (or one joined string
 * with `separator`). `label` becomes the group's legend; other attrs
 * (select-all, orientation, separator...) go to the CheckboxGroup.
 */
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  name: string
  options: CheckboxGroupOption[]
  label?: string
  description?: string
  class?: HTMLAttributes['class']
}>()

const { value, errorMessage, handleBlur } = useField<string[] | string>(() => props.name)
const id = useId()
</script>

<template>
  <FormFieldLayout
    :id="id"
    :description="description"
    :error="errorMessage"
    :class="props.class"
  >
    <CheckboxGroup
      v-bind="$attrs"
      v-model="value"
      :options="options"
      :legend="label"
      @update:model-value="() => handleBlur()"
    />
  </FormFieldLayout>
</template>
