<script setup lang="ts">
import { computed } from 'vue'

/** Bold the first case-insensitive match of the search in a title. */
const props = defineProps<{ text: string, query?: string }>()

const parts = computed(() => {
  const q = props.query?.trim().toLowerCase()
  const at = q ? props.text.toLowerCase().indexOf(q) : -1
  if (!q || at === -1)
    return undefined
  return [props.text.slice(0, at), props.text.slice(at, at + q.length), props.text.slice(at + q.length)]
})
</script>

<template>
  <template v-if="parts">
    {{ parts[0] }}<mark class="rounded-sm bg-warning/30 text-foreground">{{ parts[1] }}</mark>{{ parts[2] }}
  </template>
  <template v-else>
    {{ text }}
  </template>
</template>
