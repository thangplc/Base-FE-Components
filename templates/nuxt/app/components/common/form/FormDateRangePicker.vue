<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { DateLike, DateRange } from '../date-value'
import { useField } from 'vee-validate'
import { useId } from 'vue'
import DateRangePicker from '../DateRangePicker.vue'
import FormFieldLayout from './FormFieldLayout.vue'

/**
 * `{ from, to }` field; each side has the shape set by `value-format`.
 * Put range rules on the object itself (a zod `.refine` without `path`):
 * the error is read at the field's own path, not at `period.to`.
 */
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  name: string
  label?: string
  description?: string
  class?: HTMLAttributes['class']
}>()

const { value, errorMessage, handleBlur } = useField<DateRange<DateLike> | undefined>(() => props.name)
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
    <DateRangePicker
      v-bind="$attrs"
      :id="id"
      v-model="value"
      :invalid="!!errorMessage"
      @update:model-value="() => handleBlur()"
    />
  </FormFieldLayout>
</template>
