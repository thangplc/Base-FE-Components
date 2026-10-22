<script setup lang="ts" generic="TData">
import type { RowAction, RowActionDisplay } from './types'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { splitRowActions } from './row-actions'

/** The actions cell: inline buttons and/or a "…" menu for one row. */
const props = withDefaults(defineProps<{
  row: TData
  actions: RowAction<TData>[]
  /** Default placement for actions without their own `display`. */
  display?: RowActionDisplay
}>(), {
  display: 'menu',
})

const confirming = ref<RowAction<TData> | null>(null)
const groups = computed(() => splitRowActions(props.actions, props.display))

function run(action: RowAction<TData>) {
  if (action.confirm)
    confirming.value = action
  else
    action.onClick(props.row)
}

async function confirm() {
  await confirming.value?.onClick(props.row)
}

const destructiveGhost = 'text-destructive hover:bg-destructive/10 hover:text-destructive'
</script>

<template>
  <div v-if="groups.inline.length || groups.menu.length" class="flex items-center justify-end gap-1">
    <TooltipProvider v-if="groups.inline.length">
      <template v-for="action in groups.inline" :key="action.label">
        <!-- Icon button with a tooltip, or a small text button when there is no icon. -->
        <Tooltip v-if="action.icon">
          <TooltipTrigger as-child>
            <Button
              variant="ghost"
              size="icon-sm"
              :aria-label="action.label"
              :disabled="action.disabled"
              :class="cn(action.variant === 'destructive' && destructiveGhost)"
              @click="run(action)"
            >
              <component :is="action.icon" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{{ action.label }}</TooltipContent>
        </Tooltip>
        <Button
          v-else
          variant="ghost"
          size="sm"
          :disabled="action.disabled"
          :class="cn(action.variant === 'destructive' && destructiveGhost)"
          @click="run(action)"
        >
          {{ action.label }}
        </Button>
      </template>
    </TooltipProvider>

    <!-- Non-modal so a ConfirmDialog can open right after the menu closes. -->
    <DropdownMenu v-if="groups.menu.length" :modal="false">
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon-sm">
          <span class="sr-only">Open actions</span>
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="min-w-40">
        <template v-for="(action, index) in groups.menu" :key="action.label">
          <!-- Separate the destructive group from the rest. -->
          <DropdownMenuSeparator
            v-if="action.variant === 'destructive' && index > 0 && groups.menu[index - 1]?.variant !== 'destructive'"
          />
          <DropdownMenuItem
            :variant="action.variant"
            :disabled="action.disabled"
            @select="run(action)"
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
  </div>
</template>
