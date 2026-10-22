<script setup lang="ts">
import { CheckIcon } from '@lucide/vue'

/** Checkbox look for options (the whole row is the control). */
defineProps<{ checked: boolean | 'indeterminate' }>()
</script>

<template>
  <span
    aria-hidden="true"
    :data-state="checked === 'indeterminate' ? 'indeterminate' : checked ? 'checked' : 'unchecked'"
    class="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
  >
    <CheckIcon v-if="checked === true" class="size-3" />
    <span v-else-if="checked === 'indeterminate'" class="h-0.5 w-2 rounded-full bg-current" />
  </span>
</template>
