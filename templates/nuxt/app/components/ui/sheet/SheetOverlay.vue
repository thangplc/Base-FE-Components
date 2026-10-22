<script setup lang="ts">
import type { DialogOverlayProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { DialogOverlay } from 'reka-ui'

/**
 * Backdrop behind the sheet: 'blur' (default: light tint + blur), 'dim'
 * (darker tint, no blur) or 'none' (transparent, still catches outside clicks).
 * For a page that stays usable behind it, use `:modal="false"` on the root.
 */
const props = withDefaults(defineProps<DialogOverlayProps & { class?: HTMLAttributes['class'], variant?: 'blur' | 'dim' | 'none' }>(), {
  variant: 'blur',
})

const overlayVariants = {
  blur: 'bg-black/10 supports-backdrop-filter:backdrop-blur-xs',
  dim: 'bg-black/40',
  none: 'bg-transparent',
}

const delegatedProps = reactiveOmit(props, 'class', 'variant')
</script>

<template>
  <DialogOverlay
    data-slot="sheet-overlay"
    :class="cn('fixed inset-0 z-50 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0', overlayVariants[variant], props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </DialogOverlay>
</template>
