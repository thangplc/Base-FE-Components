<script setup lang="ts">
import type { DialogOverlayProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { DialogOverlay } from 'reka-ui'

/**
 * Backdrop behind the dialog: 'blur' (default: light tint + blur), 'dim'
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
    data-slot="dialog-overlay"
    v-bind="delegatedProps"
    :class="cn('data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 duration-100 fixed inset-0 isolate z-50', overlayVariants[variant], props.class)"
  >
    <slot />
  </DialogOverlay>
</template>
