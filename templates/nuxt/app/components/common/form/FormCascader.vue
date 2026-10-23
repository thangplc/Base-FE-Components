<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { CascaderOption } from '../cascader/cascader-utils'
import { useField } from 'vee-validate'
import { useId } from 'vue'
import Cascader from '../cascader/Cascader.vue'
import FormFieldLayout from './FormFieldLayout.vue'

/** Cascader field: a path (string[]), or paths (string[][]) with `multiple`. Other attrs go to Cascader. */
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  name: string
  options: CascaderOption[]
  label?: string
  description?: string
  class?: HTMLAttributes['class']
}>()

const { value, errorMessage, handleBlur } = useField<string[] | string[][]>(() => props.name)
const id = useId()
</script>

<template>
  <FormFieldLayout :id="id" :label="label" :description="description" :error="errorMessage" :class="props.class">
    <!-- The dropdown has no blur of its own: picking marks the field touched. -->
    <Cascader
      v-bind="$attrs"
      :id="id"
      :options="options"
      :model-value="value"
      :invalid="!!errorMessage"
      @update:model-value="(next) => { value = next ?? []; handleBlur() }"
    />
  </FormFieldLayout>
</template>
