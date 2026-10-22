<script setup lang="ts" generic="TData">
import type { RowAction } from './types'
import { MoreHorizontalIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/** The "…" menu rendered in the actions column for one row. */
const props = defineProps<{
  row: TData
  actions: RowAction<TData>[]
}>()

const confirming = ref<RowAction<TData> | null>(null)
const visible = computed(() => props.actions.filter(action => !action.hidden))

function select(action: RowAction<TData>) {
  if (action.confirm)
    confirming.value = action
  else
    action.onClick(props.row)
}

async function confirm() {
  await confirming.value?.onClick(props.row)
}
</script>

<template>
  <template v-if="visible.length">
    <!-- Non-modal so a ConfirmDialog can open right after the menu closes. -->
    <DropdownMenu :modal="false">
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon-sm">
          <span class="sr-only">Open actions</span>
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="min-w-40">
        <template v-for="(action, index) in visible" :key="action.label">
          <!-- Separate the destructive group from the rest. -->
          <DropdownMenuSeparator
            v-if="action.variant === 'destructive' && index > 0 && visible[index - 1]?.variant !== 'destructive'"
          />
          <DropdownMenuItem
            :variant="action.variant"
            :disabled="action.disabled"
            @select="select(action)"
          >
            <component :is="action.icon" v-if="action.icon" />
            {{ action.label }}
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>
    <ConfirmDialog
      v-if="confirming?.confirm"
      :open="true"
      :title="confirming.confirm.title"
      :description="confirming.confirm.description"
      :confirm-text="confirming.confirm.confirmText ?? confirming.label"
      :variant="confirming.variant"
      :on-confirm="confirm"
      @update:open="(open: boolean) => !open && (confirming = null)"
    />
  </template>
</template>
