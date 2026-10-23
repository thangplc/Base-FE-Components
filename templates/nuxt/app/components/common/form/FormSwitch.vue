<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useField } from 'vee-validate'
import { useId } from 'vue'
import { Switch } from '@/components/ui/switch'
import FormFieldLayout from './FormFieldLayout.vue'

/** On / off field; the form value is a boolean. The label sits next to the switch. */
const props = defineProps<{
  name: string
  label?: string
  description?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const { value, errorMessage, handleBlur } = useField<boolean>(() => props.name)
const id = useId()
</script>

<template>
  <FormFieldLayout
    :id="id"
    :label="label"
    :description="description"
    :error="errorMessage"
    orientation="horizontal"
    :class="props.class"
  >
    <Switch
      :id="id"
      v-model="value"
      :name="name"
      :disabled="disabled"
      :aria-invalid="!!errorMessage"
      @blur="handleBlur"
    />
  </FormFieldLayout>
</template>
