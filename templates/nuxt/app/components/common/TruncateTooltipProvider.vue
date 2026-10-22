<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { TRUNCATE_TOOLTIP_KEY } from './truncate'

/**
 * One tooltip for the whole app: when the pointer rests on an element with
 * `data-truncate` whose text is actually cut off, show its full text above
 * it (below near the top edge). Mount once at the root (app.vue).
 */
provide(TRUNCATE_TOOLTIP_KEY, true)

const SHOW_DELAY_MS = 300
const MAX_WIDTH = 384 // max-w-sm

// Anchored with top (below the element) or bottom (above it), not a
// transform: the zoom-in animation owns `transform` while it runs.
const tip = ref<{ text: string, left: number, top?: number, bottom?: number } | null>(null)
let current: HTMLElement | null = null
let timer: ReturnType<typeof setTimeout> | undefined

/** Cut off horizontally (one line) or vertically (line-clamp). */
function isTruncated(element: HTMLElement) {
  return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight
}

function hide() {
  clearTimeout(timer)
  current = null
  tip.value = null
}

function onPointerOver(event: PointerEvent) {
  const target = event.target instanceof Element ? event.target : null
  const element = target?.closest<HTMLElement>('[data-truncate]') ?? null
  if (element === current)
    return
  hide()
  if (!element || !isTruncated(element))
    return
  current = element
  timer = setTimeout(() => {
    const rect = element.getBoundingClientRect()
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - MAX_WIDTH - 8))
    const text = element.innerText
    tip.value = rect.top < 48
      ? { text, left, top: rect.bottom + 6 }
      : { text, left, bottom: window.innerHeight - rect.top + 6 }
  }, SHOW_DELAY_MS)
}

onMounted(() => {
  document.addEventListener('pointerover', onPointerOver)
  document.documentElement.addEventListener('pointerleave', hide)
  // Any scroll moves the element away from the tooltip.
  window.addEventListener('scroll', hide, true)
})

onBeforeUnmount(() => {
  hide()
  document.removeEventListener('pointerover', onPointerOver)
  document.documentElement.removeEventListener('pointerleave', hide)
  window.removeEventListener('scroll', hide, true)
})
</script>

<template>
  <slot />
  <Teleport to="body">
    <div
      v-if="tip"
      role="tooltip"
      class="pointer-events-none fixed z-50 w-max max-w-sm rounded-md bg-foreground px-3 py-1.5 text-xs break-words whitespace-pre-wrap text-background animate-in fade-in-0 zoom-in-95"
      :style="{
        left: `${tip.left}px`,
        top: tip.top === undefined ? undefined : `${tip.top}px`,
        bottom: tip.bottom === undefined ? undefined : `${tip.bottom}px`,
      }"
    >
      {{ tip.text }}
    </div>
  </Teleport>
</template>
