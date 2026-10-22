<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { StarIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const sizeClass = { sm: 'size-4 text-sm', default: 'size-5 text-base', lg: 'size-7 text-xl' }

/**
 * Star rating with half stars, custom characters and tooltips; ← → / Home / End
 * on the keyboard. `v-model`: number (0 = not rated). Slot `#character="{ index }"`.
 */
const props = withDefaults(defineProps<{
  /** Number of stars (default 5). */
  count?: number
  /** Pick half stars (click the left half). */
  allowHalf?: boolean
  /** Clicking the current value again resets to 0 (default true). */
  allowClear?: boolean
  /** Show the score only (no hover / click / keyboard). */
  readOnly?: boolean
  disabled?: boolean
  size?: keyof typeof sizeClass
  /** Icon component (default Star) or text ("A", "♥"). */
  character?: Component | string
  /** A different character per star, e.g. faces for 1–5. */
  renderCharacter?: (index: number) => Component | string
  /** Tooltip per star, e.g. ['Bad', 'Poor', 'OK', 'Good', 'Great']. */
  tooltips?: string[]
  /** Show the number ("3.5") after the stars. */
  showValue?: boolean
  id?: string
  name?: string
  ariaLabel?: string
  invalid?: boolean
  class?: HTMLAttributes['class']
}>(), {
  count: 5,
  allowHalf: false,
  allowClear: true,
  readOnly: false,
  disabled: false,
  size: 'default',
  character: () => StarIcon,
  showValue: false,
  ariaLabel: 'Rating',
})

/** `hover-change`: hovered value (undefined when the pointer leaves). */
const emit = defineEmits<{ 'hover-change': [value: number | undefined] }>()
const model = defineModel<number>({ default: 0 })

const hover = ref<number>()
// After clearing, don't preview the cleared value again until the pointer moves to another one.
const cleared = ref<number>()
const interactive = computed(() => !props.readOnly && !props.disabled)
const shown = computed(() => interactive.value && hover.value !== undefined ? hover.value : model.value)
const step = computed(() => props.allowHalf ? 0.5 : 1)

function setValue(next: number) {
  model.value = Math.min(props.count, Math.max(0, next))
}
function setHovered(next: number | undefined) {
  hover.value = next
  emit('hover-change', next)
}

// Value under the pointer on star `index`: the left half counts as .5 with allowHalf.
function pointerValue(event: MouseEvent, index: number) {
  if (!props.allowHalf)
    return index + 1
  const { left, width } = (event.currentTarget as HTMLElement).getBoundingClientRect()
  return event.clientX - left < width / 2 ? index + 0.5 : index + 1
}

function onMove(event: PointerEvent, index: number) {
  if (!interactive.value)
    return
  const next = pointerValue(event, index)
  if (next === cleared.value)
    return
  cleared.value = undefined
  if (next !== hover.value)
    setHovered(next)
}

function onClick(event: MouseEvent, index: number) {
  if (!interactive.value)
    return
  const next = pointerValue(event, index)
  if (props.allowClear && next === model.value) {
    setValue(0)
    cleared.value = next
    setHovered(undefined)
  }
  else {
    setValue(next)
  }
}

function onLeave() {
  if (!interactive.value)
    return
  setHovered(undefined)
  cleared.value = undefined
}

function onKeyDown(event: KeyboardEvent) {
  if (!interactive.value)
    return
  const keys: Record<string, number> = {
    ArrowRight: model.value + step.value,
    ArrowUp: model.value + step.value,
    ArrowLeft: model.value - step.value,
    ArrowDown: model.value - step.value,
    Home: 0,
    End: props.count,
  }
  const next = keys[event.key]
  if (next !== undefined) {
    event.preventDefault()
    setHovered(undefined)
    setValue(next)
  }
}

const stars = computed(() => Array.from({ length: props.count }, (_, index) => {
  // 0, 50 or 100% of this star filled.
  const fill = Math.min(1, Math.max(0, shown.value - index))
  return { index, fill, state: fill === 1 ? 'full' : fill > 0 ? 'half' : 'empty', icon: props.renderCharacter?.(index) ?? props.character }
}))
</script>

<template>
  <div
    :id="id"
    data-slot="rate"
    role="slider"
    :tabindex="interactive ? 0 : -1"
    :aria-label="ariaLabel"
    :aria-valuemin="0"
    :aria-valuemax="count"
    :aria-valuenow="model"
    :aria-valuetext="tooltips?.[Math.ceil(model) - 1] ?? `${model} / ${count}`"
    :aria-readonly="readOnly || undefined"
    :aria-disabled="disabled || undefined"
    :aria-invalid="invalid || undefined"
    :data-disabled="disabled || undefined"
    :class="cn('inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:opacity-50', props.class)"
    @keydown="onKeyDown"
    @pointerleave="onLeave"
  >
    <div class="flex items-center gap-1">
      <template v-for="star in stars" :key="star.index">
        <Tooltip :disabled="!tooltips?.[star.index]">
          <TooltipTrigger as-child>
            <span
              data-slot="rate-star"
              :data-fill="star.state"
              :class="cn('relative inline-flex text-muted transition-transform', interactive && 'cursor-pointer hover:scale-110')"
              @pointermove="onMove($event, star.index)"
              @click="onClick($event, star.index)"
            >
              <slot name="character" :index="star.index">
                <component :is="star.icon" v-if="typeof star.icon !== 'string'" :class="sizeClass[size]" fill="currentColor" :stroke-width="0" />
                <span v-else :class="cn('flex items-center justify-center leading-none', sizeClass[size])">{{ star.icon }}</span>
              </slot>
              <span aria-hidden="true" class="absolute inset-y-0 left-0 overflow-hidden text-warning" :style="{ width: `${star.fill * 100}%` }">
                <slot name="character" :index="star.index">
                  <component :is="star.icon" v-if="typeof star.icon !== 'string'" :class="sizeClass[size]" fill="currentColor" :stroke-width="0" />
                  <span v-else :class="cn('flex items-center justify-center leading-none', sizeClass[size])">{{ star.icon }}</span>
                </slot>
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent v-if="tooltips?.[star.index]">
            {{ tooltips[star.index] }}
          </TooltipContent>
        </Tooltip>
      </template>
    </div>
    <span v-if="showValue" class="text-sm text-muted-foreground tabular-nums">{{ shown }}</span>
    <input v-if="name" type="hidden" :name="name" :value="model">
  </div>
</template>
