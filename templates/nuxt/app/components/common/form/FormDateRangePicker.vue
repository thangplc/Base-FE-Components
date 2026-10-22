<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { DateLike, DateRange } from '../date-picker/date-value'
import { useField } from 'vee-validate'
import { useId } from 'vue'
import DateRangePicker from '../date-picker/DateRangePicker.vue'
import DateTimeRangePicker from '../date-picker/DateTimeRangePicker.vue'
import FormFieldLayout from './FormFieldLayout.vue'

/**
 * `{ from, to }` field; each side has the shape set by `value-format`.
 * Put range rules on the object itself (a zod `.refine` without `path`):
 * the error is read at the field's own path, not at `period.to`.
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  name: string
  label?: string
  description?: string
  /** Also pick start / end times (DateTimeRangePicker). */
  withTime?: boolean
  class?: HTMLAttributes['class']
}>(), {
  withTime: false,
})

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
    <component
      :is="withTime ? DateTimeRangePicker : DateRangePicker"
      v-bind="$attrs"
      :id="id"
      v-model="value"
      :invalid="!!errorMessage"
      @update:model-value="() => handleBlur()"
    />
  </FormFieldLayout>
</template>
