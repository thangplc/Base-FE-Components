<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, useId } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { cn } from '@/lib/utils'

export interface CheckboxGroupOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

/** A list of checkboxes with an optional tri-state "select all" (`v-model`: string[], or a string with `separator`). */
const props = withDefaults(defineProps<{
  options: CheckboxGroupOption[]
  legend?: string
  /**
   * Adds a "select all" checkbox on top (pass a label, or `true` for
   * "Select all"). It shows a dash when only some options are selected.
   */
  selectAll?: boolean | string
  orientation?: 'vertical' | 'horizontal'
  /**
   * Emit the values joined into one string (e.g. "," → "email,sms")
   * instead of an array; `v-model` is then split the same way.
   */
  separator?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>(), {
  orientation: 'vertical',
  selectAll: false,
})

const model = defineModel<string[] | string | null>({ default: () => [] })

// Work with an array inside; join it on the way out when there's a separator.
const selected = computed({
  get: () => Array.isArray(model.value)
    ? model.value
    : model.value && props.separator ? model.value.split(props.separator) : [],
  set: (values: string[]) => (model.value = props.separator === undefined ? values : values.join(props.separator)),
})
const id = useId()

// "Select all" only toggles enabled options; disabled ones keep their state.
const enabled = computed(() =>
  props.options.filter(option => !option.disabled && !props.disabled).map(option => option.value),
)
const allState = computed<boolean | 'indeterminate'>(() => {
  const count = enabled.value.filter(v => selected.value.includes(v)).length
  return count === 0 ? false : count === enabled.value.length ? true : 'indeterminate'
})

function toggleAll() {
  selected.value = allState.value === true
    ? selected.value.filter(v => !enabled.value.includes(v))
    : [...new Set([...selected.value, ...enabled.value])]
}

function toggle(value: string, checked: boolean | 'indeterminate') {
  selected.value = checked === true ? [...selected.value, value] : selected.value.filter(v => v !== value)
}
</script>

<template>
  <FieldSet :class="props.class">
    <FieldLegend v-if="legend" variant="label">
      {{ legend }}
    </FieldLegend>
    <Field v-if="selectAll" orientation="horizontal">
      <Checkbox
        :id="`${id}-all`"
        :model-value="allState"
        :disabled="disabled || enabled.length === 0"
        @update:model-value="toggleAll"
      />
      <FieldLabel :for="`${id}-all`">
        {{ selectAll === true ? 'Select all' : selectAll }}
      </FieldLabel>
    </Field>
    <FieldGroup
      data-slot="checkbox-group"
      :class="cn(selectAll && 'pl-6', orientation === 'horizontal' && 'flex-row flex-wrap gap-x-6')"
    >
      <Field
        v-for="(option, i) in options"
        :key="option.value"
        orientation="horizontal"
        :data-disabled="option.disabled || disabled || undefined"
      >
        <Checkbox
          :id="`${id}-${i}`"
          :model-value="selected.includes(option.value)"
          :disabled="option.disabled || disabled"
          @update:model-value="(checked: boolean | 'indeterminate') => toggle(option.value, checked)"
        />
        <FieldContent v-if="option.description">
          <FieldLabel :for="`${id}-${i}`">
            {{ option.label }}
          </FieldLabel>
          <FieldDescription>{{ option.description }}</FieldDescription>
        </FieldContent>
        <FieldLabel v-else :for="`${id}-${i}`" class="font-normal">
          {{ option.label }}
        </FieldLabel>
      </Field>
    </FieldGroup>
  </FieldSet>
</template>
