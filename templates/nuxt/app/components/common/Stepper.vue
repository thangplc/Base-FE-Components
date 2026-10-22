<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { CheckIcon, XIcon } from '@lucide/vue'
import { getCurrentInstance } from 'vue'
import { cn } from '@/lib/utils'

export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error'

export interface StepItem {
  title: string
  description?: string
  /** Shown instead of the step number. */
  icon?: Component
  /** Mark a step as failed (e.g. a validation error on that step). */
  status?: 'error'
}

/** Progress through a multi-step flow (checkout, onboarding, wizard). */
const props = withDefaults(defineProps<{
  steps: StepItem[]
  /** Index of the current step; earlier steps are complete. */
  current: number
  /** With `@step-click`: completed steps are clickable, or all of them with this. */
  allowJumpAhead?: boolean
  orientation?: 'horizontal' | 'vertical'
  class?: HTMLAttributes['class']
}>(), {
  allowJumpAhead: false,
  orientation: 'horizontal',
})

const emit = defineEmits<{ 'step-click': [index: number] }>()

// Steps are only buttons when someone listens to @step-click.
const listening = !!getCurrentInstance()?.vnode.props?.onStepClick

const indicatorClass: Record<StepStatus, string> = {
  complete: 'border-primary bg-primary text-primary-foreground',
  current: 'border-primary text-primary ring-3 ring-primary/20',
  upcoming: 'border-input text-muted-foreground',
  error: 'border-destructive bg-destructive/10 text-destructive',
}

function statusOf(index: number): StepStatus {
  if (props.steps[index]?.status === 'error')
    return 'error'
  return index < props.current ? 'complete' : index === props.current ? 'current' : 'upcoming'
}

function clickable(index: number) {
  return listening && index !== props.current && (statusOf(index) === 'complete' || props.allowJumpAhead)
}

function iconOf(step: StepItem, index: number) {
  const status = statusOf(index)
  return status === 'complete' ? CheckIcon : status === 'error' ? XIcon : step.icon
}
</script>

<template>
  <ol
    data-slot="stepper"
    :data-orientation="orientation"
    :class="cn(orientation === 'vertical' ? 'flex flex-col' : 'flex w-full items-start gap-3', props.class)"
  >
    <li
      v-for="(step, index) in steps"
      :key="index"
      data-slot="step"
      :data-status="statusOf(index)"
      :aria-current="statusOf(index) === 'current' ? 'step' : undefined"
      :class="cn(
        'relative flex',
        orientation === 'vertical' ? 'gap-3 pb-8 last:pb-0' : 'items-start gap-3',
        orientation === 'horizontal' && index < steps.length - 1 && 'flex-1',
      )"
    >
      <!-- Vertical connector, under the indicator. -->
      <span
        v-if="orientation === 'vertical' && index < steps.length - 1"
        aria-hidden="true"
        :class="cn('absolute top-10 bottom-2 left-4 w-0.5 -translate-x-1/2 rounded-full', index < current ? 'bg-primary' : 'bg-border')"
      />
      <component
        :is="clickable(index) ? 'button' : 'div'"
        :type="clickable(index) ? 'button' : undefined"
        :class="cn('flex gap-3', clickable(index) && 'rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&:hover_[data-slot=step-indicator]]:border-primary')"
        @click="clickable(index) && emit('step-click', index)"
      >
        <span
          data-slot="step-indicator"
          :class="cn('flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-background text-sm font-medium transition-colors', indicatorClass[statusOf(index)])"
        >
          <component :is="iconOf(step, index)" v-if="iconOf(step, index)" class="size-4" />
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span :class="cn('flex min-w-0 flex-col gap-0.5', orientation === 'vertical' ? 'pt-1' : 'pt-1.5')">
          <span
            :class="cn(
              'text-sm font-medium',
              statusOf(index) === 'upcoming' && 'text-muted-foreground',
              statusOf(index) === 'error' && 'text-destructive',
            )"
          >{{ step.title }}</span>
          <span v-if="step.description" class="text-xs text-muted-foreground">{{ step.description }}</span>
        </span>
      </component>
      <!-- Horizontal connector, between this step and the next. -->
      <span
        v-if="orientation === 'horizontal' && index < steps.length - 1"
        aria-hidden="true"
        :class="cn('mt-4 h-0.5 min-w-6 flex-1 rounded-full', index < current ? 'bg-primary' : 'bg-border')"
      />
    </li>
  </ol>
</template>
