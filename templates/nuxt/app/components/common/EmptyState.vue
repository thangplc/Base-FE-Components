<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { InboxIcon } from '@lucide/vue'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

const props = defineProps<{
  title: string
  description?: string
  class?: HTMLAttributes['class']
}>()

defineSlots<{
  icon?: () => unknown
  /** Buttons / links shown under the text. */
  action?: () => unknown
}>()
</script>

<template>
  <Empty :class="props.class">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <slot name="icon">
          <InboxIcon />
        </slot>
      </EmptyMedia>
      <EmptyTitle>{{ title }}</EmptyTitle>
      <EmptyDescription v-if="description">
        {{ description }}
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent v-if="$slots.action">
      <slot name="action" />
    </EmptyContent>
  </Empty>
</template>
