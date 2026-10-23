<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TreeNode } from '../tree/Tree.vue'
import { useField } from 'vee-validate'
import { useId } from 'vue'
import TreeSelect from '../tree/TreeSelect.vue'
import FormFieldLayout from './FormFieldLayout.vue'

/**
 * TreeSelect field: a key (string), or keys (string[]) with `multiple` /
 * `tree-checkable`. Other attrs (show-checked-strategy, show-search...) go to TreeSelect.
 */
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  name: string
  treeData: TreeNode[]
  label?: string
  description?: string
  class?: HTMLAttributes['class']
}>()

const { value, errorMessage, handleBlur } = useField<string | string[]>(() => props.name)
const id = useId()
</script>

<template>
  <FormFieldLayout :id="id" :label="label" :description="description" :error="errorMessage" :class="props.class">
    <!-- The dropdown has no blur of its own: picking marks the field touched. -->
    <TreeSelect
      v-bind="$attrs"
      :id="id"
      :tree-data="treeData"
      :model-value="value"
      :invalid="!!errorMessage"
      @update:model-value="(next) => { value = next ?? ''; handleBlur() }"
    />
  </FormFieldLayout>
</template>
