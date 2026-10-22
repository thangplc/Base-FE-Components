<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { DateLike } from '../date-picker/date-value'
import { useField } from 'vee-validate'
import { useId } from 'vue'
import DatePicker from '../date-picker/DatePicker.vue'
import DateTimePicker from '../date-picker/DateTimePicker.vue'
import FormFieldLayout from './FormFieldLayout.vue'

/**
 * Date (or date + time) field. The form value has the shape set by
 * `value-format`: a Date by default, or e.g. "yyyy-MM-dd" for a string.
 * Other attrs (min-date, locale, minute-step...) go to the picker.
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  name: string
  label?: string
  description?: string
  /** Also pick a time (DateTimePicker). */
  withTime?: boolean
  class?: HTMLAttributes['class']
}>(), {
  withTime: false,
})

const { value, errorMessage, handleBlur } = useField<DateLike | undefined>(() => props.name)
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
    <!-- The popover has no blur of its own: picking a value marks the field touched. -->
    <component
      :is="withTime ? DateTimePicker : DatePicker"
      v-bind="$attrs"
      :id="id"
      v-model="value"
      :invalid="!!errorMessage"
      @update:model-value="() => handleBlur()"
    />
  </FormFieldLayout>
</template>
