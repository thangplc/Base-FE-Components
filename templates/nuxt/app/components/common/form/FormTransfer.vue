<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TransferItem } from '../transfer/Transfer.vue'
import { useField } from 'vee-validate'
import { useId } from 'vue'
import Transfer from '../transfer/Transfer.vue'
import FormFieldLayout from './FormFieldLayout.vue'

/** Transfer field: the form value is the right-hand list's keys (string[]). Other attrs go to Transfer. */
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  name: string
  dataSource: TransferItem[]
  label?: string
  description?: string
  class?: HTMLAttributes['class']
}>()

const { value, errorMessage, handleBlur } = useField<string[]>(() => props.name)
const id = useId()
</script>

<template>
  <FormFieldLayout :id="id" :label="label" :description="description" :error="errorMessage" :class="props.class">
    <Transfer
      v-bind="$attrs"
      :id="id"
      :data-source="dataSource"
      :model-value="value ?? []"
      :invalid="!!errorMessage"
      @update:model-value="(next) => { value = next; handleBlur() }"
    />
  </FormFieldLayout>
</template>
