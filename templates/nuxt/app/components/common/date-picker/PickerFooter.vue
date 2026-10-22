<script setup lang="ts">
import type { PickerLabels } from './date-time'
import { Button } from '@/components/ui/button'

/** Bottom bar of the popover: "Now" (when `@now` is listened to), the time zone, "Done". */
defineProps<{
  labels: PickerLabels
  timeZone?: string
  showNow?: boolean
  nowDisabled?: boolean
}>()

const emit = defineEmits<{ now: [], done: [] }>()
</script>

<template>
  <div class="flex items-center gap-2 border-t p-2">
    <Button v-if="showNow" type="button" variant="ghost" size="sm" :disabled="nowDisabled" @click="emit('now')">
      {{ labels.now }}
    </Button>
    <span v-if="timeZone" class="truncate text-xs text-muted-foreground">{{ timeZone }}</span>
    <Button type="button" size="sm" class="ml-auto" @click="emit('done')">
      {{ labels.done }}
    </Button>
  </div>
</template>
