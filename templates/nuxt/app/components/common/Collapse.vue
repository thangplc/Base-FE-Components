<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { ChevronDownIcon, ChevronRightIcon, MinusIcon, PlusIcon } from '@lucide/vue'
import { AccordionHeader, AccordionTrigger } from 'reka-ui'
import { computed } from 'vue'
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export interface CollapseItem {
  key: string
  title: string
  /** Text content; or use the `#[key]` slot. */
  content?: string
  /** Icon before the title. */
  icon?: Component
  disabled?: boolean
}

/**
 * Panels that expand and collapse, on the shadcn Accordion. `v-model`:
 * string with `accordion` (one open), string[] otherwise. Slots: `#[key]`
 * (content), `#title="{ item }"`, `#extra="{ item }"` (header actions).
 */
const props = withDefaults(defineProps<{
  items: CollapseItem[]
  /** Only one panel open at a time. */
  accordion?: boolean
  /** 'bordered' (one box, default), 'separated' (a card per panel) or 'ghost' (no borders). */
  variant?: 'bordered' | 'separated' | 'ghost'
  size?: 'sm' | 'default'
  /** Chevron (default) or a +/− box. */
  expandIcon?: 'chevron' | 'plus-minus'
  expandIconPosition?: 'start' | 'end'
  /** 'header': the whole row toggles (default); 'icon': only the icon does. */
  collapsible?: 'header' | 'icon'
  /** Keep closed panels in the DOM (e.g. to preserve form state). */
  forceMount?: boolean
  class?: HTMLAttributes['class']
}>(), {
  accordion: false,
  variant: 'bordered',
  size: 'default',
  expandIcon: 'chevron',
  expandIconPosition: 'end',
  collapsible: 'header',
  forceMount: false,
})

const model = defineModel<string | string[]>()

const variantClass = {
  // The shadcn AccordionItem draws the divider (not-last:border-b).
  bordered: { root: 'rounded-lg border', item: '', pad: 'px-4' },
  separated: { root: 'gap-2', item: 'rounded-lg border', pad: 'px-4' },
  ghost: { root: '', item: 'not-last:border-b-0', pad: 'px-2' },
}
const styles = computed(() => variantClass[props.variant])
const headerClass = computed(() => cn(
  'flex items-center gap-2 text-sm font-medium',
  styles.value.pad,
  props.size === 'sm' ? 'py-2' : 'py-3',
  props.variant === 'ghost' && 'rounded-md hover:bg-muted/50',
))
const triggerClass = 'rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none'

// Reka wants `undefined` (not '') for "nothing open" in single mode.
const value = computed({
  get: () => model.value ?? (props.accordion ? undefined : []),
  set: next => (model.value = props.accordion ? (next || undefined) : next),
})
</script>

<template>
  <Accordion
    v-model="value"
    :type="accordion ? 'single' : 'multiple'"
    :collapsible="accordion || undefined"
    data-slot="collapse"
    :class="cn('flex w-full flex-col', styles.root, props.class)"
  >
    <AccordionItem
      v-for="item in items"
      :key="item.key"
      :value="item.key"
      :disabled="item.disabled"
      :class="cn('group/panel data-disabled:opacity-50', styles.item)"
    >
      <!-- Shared pieces: the toggle icon and the title. -->
      <AccordionHeader data-slot="collapse-header" :class="headerClass">
        <component :is="collapsible === 'icon' ? 'span' : AccordionTrigger" :class="cn('flex flex-1 items-center gap-2', collapsible === 'header' && triggerClass)">
          <component :is="collapsible === 'icon' ? AccordionTrigger : 'span'" v-if="expandIconPosition === 'start'" aria-label="Toggle" :class="collapsible === 'icon' ? triggerClass : 'contents'">
            <span aria-hidden="true" data-slot="collapse-icon" class="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
              <span v-if="expandIcon === 'plus-minus'" class="flex size-4 items-center justify-center rounded-[4px] border border-input">
                <PlusIcon class="size-3 group-data-[state=open]/panel:hidden" />
                <MinusIcon class="hidden size-3 group-data-[state=open]/panel:block" />
              </span>
              <ChevronRightIcon v-else class="size-4 transition-transform duration-200 group-data-[state=open]/panel:rotate-90" />
            </span>
          </component>
          <span class="flex min-w-0 flex-1 items-center gap-2">
            <component :is="item.icon" v-if="item.icon" class="size-4 shrink-0 text-muted-foreground" />
            <span class="min-w-0 flex-1"><slot name="title" :item="item">{{ item.title }}</slot></span>
          </span>
          <component :is="collapsible === 'icon' ? AccordionTrigger : 'span'" v-if="expandIconPosition === 'end'" aria-label="Toggle" :class="collapsible === 'icon' ? triggerClass : 'contents'">
            <span aria-hidden="true" data-slot="collapse-icon" class="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
              <span v-if="expandIcon === 'plus-minus'" class="flex size-4 items-center justify-center rounded-[4px] border border-input">
                <PlusIcon class="size-3 group-data-[state=open]/panel:hidden" />
                <MinusIcon class="hidden size-3 group-data-[state=open]/panel:block" />
              </span>
              <ChevronDownIcon v-else class="size-4 transition-transform duration-200 group-data-[state=open]/panel:rotate-180" />
            </span>
          </component>
        </component>
        <span v-if="$slots.extra" class="flex shrink-0 items-center gap-1 font-normal">
          <slot name="extra" :item="item" />
        </span>
      </AccordionHeader>
      <AccordionContent :force-mount="forceMount || undefined" :class="cn('text-muted-foreground', styles.pad, 'pb-3', forceMount && 'group-data-[state=closed]/panel:hidden')">
        <slot :name="item.key">
          {{ item.content }}
        </slot>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
