<script setup lang="ts">
import { ref } from 'vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  /** May return a promise: the dialog stays open with a spinner until it settles. */
  onConfirm: () => void | Promise<void>
}>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'default',
})

defineSlots<{
  /** Element that opens the dialog, e.g. a <Button>. */
  trigger: () => unknown
}>()

const open = ref(false)
const pending = ref(false)

function onOpenChange(next: boolean) {
  if (!pending.value)
    open.value = next
}

async function handleConfirm() {
  pending.value = true
  try {
    await props.onConfirm()
    open.value = false
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <AlertDialog :open="open" @update:open="onOpenChange">
    <AlertDialogTrigger as-child>
      <slot name="trigger" />
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="description">
          {{ description }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="pending">
          {{ cancelText }}
        </AlertDialogCancel>
        <!-- A plain Button (not AlertDialogAction) so the dialog doesn't auto-close while pending. -->
        <Button :variant="variant" :disabled="pending" @click="handleConfirm">
          <Spinner v-if="pending" data-icon="inline-start" />
          {{ confirmText }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
