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
import FormFieldLayout from './FormFieldLayout.vue'

export interface SelectOption { label: string, value: string, disabled?: boolean }

const props = withDefaults(defineProps<{
  name: string
  options: SelectOption[]
  label?: string
  description?: string
  placeholder?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>(), {
  placeholder: 'Select an option',
})

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
    <Select
      v-model="value"
      :name="name"
      :disabled="disabled"
      @update:open="(open) => !open && handleBlur()"
    >
      <SelectTrigger :id="id" :aria-invalid="!!errorMessage" class="w-full">
        <SelectValue :placeholder="placeholder" />
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
