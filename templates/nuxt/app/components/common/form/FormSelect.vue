<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useField } from 'vee-validate'
import { useId } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Combobox } from '../combobox'
import FormFieldLayout from './FormFieldLayout.vue'

export interface SelectOption { label: string, value: string, disabled?: boolean, description?: string, group?: string }

/**
 * Select field: the shadcn Select, or a Combobox when `multiple` /
 * `searchable` (other attrs such as max-tag-count, creatable, @search go to it).
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  name: string
  options: SelectOption[]
  label?: string
  description?: string
  placeholder?: string
  disabled?: boolean
  /** Pick several values (string[]); renders a Combobox with chips. */
  multiple?: boolean
  /** Single value with a search box; renders a Combobox. */
  searchable?: boolean
  class?: HTMLAttributes['class']
}>(), {
  multiple: false,
  searchable: false,
})

const { value, errorMessage, handleBlur } = useField<string | string[]>(() => props.name)
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
    <!-- The list has no blur of its own: picking marks the field touched. -->
    <Combobox
      v-if="multiple || searchable"
      v-bind="$attrs"
      :id="id"
      :model-value="value ?? (multiple ? [] : null)"
      :options="options"
      :multiple="multiple"
      :placeholder="placeholder"
      :disabled="disabled"
      :invalid="!!errorMessage"
      @update:model-value="(next) => { value = next ?? ''; handleBlur() }"
    />
    <Select
      v-else
      :model-value="value as string"
      @update:model-value="(next) => (value = next as string)"
      :name="name"
      :disabled="disabled"
      @update:open="(open) => !open && handleBlur()"
    >
      <SelectTrigger :id="id" :aria-invalid="!!errorMessage" class="w-full">
        <SelectValue :placeholder="placeholder ?? 'Select an option'" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </FormFieldLayout>
</template>
