<script setup lang="ts" generic="TData">
import type { Column } from '@tanstack/vue-table'
import type { DataTableFilter, DateRange, NumberRange } from './types'
import { PlusCircleIcon, XIcon } from '@lucide/vue'
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

/** One toolbar filter button; its UI depends on `filter.type`. */
const props = defineProps<{
  column: Column<TData, unknown>
  filter: DataTableFilter
}>()

const options = computed(() => props.filter.options ?? [])
const multiple = computed(() => props.filter.type === 'multi-select')
const raw = computed(() => props.column.getFilterValue())

// select / multi-select
const selected = computed<string[]>(() =>
  multiple.value ? ((raw.value as string[] | undefined) ?? []) : raw.value ? [raw.value as string] : [],
)
const selectedOptions = computed(() => options.value.filter(option => selected.value.includes(option.value)))
const facets = computed(() => props.column.getFacetedUniqueValues())

function toggle(value: string, checked: boolean) {
  const next = checked ? [...selected.value, value] : selected.value.filter(v => v !== value)
  props.column.setFilterValue(next.length ? next : undefined)
}

// number-range
const range = computed(() => (raw.value as NumberRange | undefined) ?? [undefined, undefined])
const facetMinMax = computed(() => props.column.getFacetedMinMaxValues())
const toNumber = (value: string | number) => (value === '' ? undefined : Number(value))
function setRange(next: NumberRange) {
  props.column.setFilterValue(next[0] === undefined && next[1] === undefined ? undefined : next)
}

// date-range
const dates = computed(() => (raw.value as DateRange | undefined) ?? {})
function setDates(next: DateRange) {
  props.column.setFilterValue(next.from || next.to ? next : undefined)
}

const summary = computed(() => {
  switch (props.filter.type) {
    case 'number-range':
      return raw.value ? [`${range.value[0] ?? '…'} – ${range.value[1] ?? '…'}`] : []
    case 'date-range':
      return raw.value ? [`${dates.value.from ?? '…'} → ${dates.value.to ?? '…'}`] : []
    default:
      return selected.value.length > 2
        ? [`${selected.value.length} selected`]
        : selectedOptions.value.map(option => option.label)
  }
})

const clear = () => props.column.setFilterValue(undefined)
</script>

<template>
  <!-- select / multi-select -->
  <DropdownMenu v-if="filter.type === 'select' || filter.type === 'multi-select'">
    <DropdownMenuTrigger as-child>
      <Button variant="outline" class="border-dashed">
        <PlusCircleIcon data-icon="inline-start" />
        {{ filter.title }}
        <template v-if="summary.length">
          <Separator orientation="vertical" class="mx-1 data-[orientation=vertical]:h-4" />
          <Badge v-for="text in summary" :key="text" variant="secondary">
            {{ text }}
          </Badge>
        </template>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="min-w-48">
      <DropdownMenuLabel>{{ filter.title }}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <template v-if="multiple">
        <!-- @select prevented: keep the menu open while picking several values. -->
        <DropdownMenuCheckboxItem
          v-for="option in options"
          :key="option.value"
          :model-value="selected.includes(option.value)"
          @update:model-value="(checked: boolean | 'indeterminate') => toggle(option.value, checked === true)"
          @select="(event: Event) => event.preventDefault()"
        >
          <component :is="option.icon" v-if="option.icon" />
          {{ option.label }}
          <span v-if="facets.get(option.value) !== undefined" class="ml-auto pl-4 font-mono text-xs text-muted-foreground">
            {{ facets.get(option.value) }}
          </span>
        </DropdownMenuCheckboxItem>
      </template>
      <DropdownMenuRadioGroup
        v-else
        :model-value="selected[0] ?? ''"
        @update:model-value="(value) => column.setFilterValue(value || undefined)"
      >
        <DropdownMenuRadioItem v-for="option in options" :key="option.value" :value="option.value">
          <component :is="option.icon" v-if="option.icon" />
          {{ option.label }}
          <span v-if="facets.get(option.value) !== undefined" class="ml-auto pl-4 font-mono text-xs text-muted-foreground">
            {{ facets.get(option.value) }}
          </span>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <template v-if="selected.length">
        <DropdownMenuSeparator />
        <DropdownMenuItem @select="clear">
          <XIcon />
          Clear filter
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>

  <!-- number-range / date-range -->
  <Popover v-else>
    <PopoverTrigger as-child>
      <Button variant="outline" class="border-dashed">
        <PlusCircleIcon data-icon="inline-start" />
        {{ filter.title }}
        <template v-if="summary.length">
          <Separator orientation="vertical" class="mx-1 data-[orientation=vertical]:h-4" />
          <Badge variant="secondary">
            {{ summary[0] }}
          </Badge>
        </template>
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" :class="filter.type === 'date-range' ? 'w-72' : 'w-64'">
      <div v-if="filter.type === 'number-range'" class="grid grid-cols-2 gap-2">
        <Field>
          <FieldLabel :for="`${column.id}-min`">
            Min
          </FieldLabel>
          <Input
            :id="`${column.id}-min`"
            type="number"
            :placeholder="facetMinMax?.[0] === undefined ? undefined : String(facetMinMax[0])"
            :model-value="range[0] ?? ''"
            @update:model-value="(value) => setRange([toNumber(value), range[1]])"
          />
        </Field>
        <Field>
          <FieldLabel :for="`${column.id}-max`">
            Max
          </FieldLabel>
          <Input
            :id="`${column.id}-max`"
            type="number"
            :placeholder="facetMinMax?.[1] === undefined ? undefined : String(facetMinMax[1])"
            :model-value="range[1] ?? ''"
            @update:model-value="(value) => setRange([range[0], toNumber(value)])"
          />
        </Field>
      </div>
      <div v-else class="grid grid-cols-2 gap-2">
        <Field>
          <FieldLabel :for="`${column.id}-from`">
            From
          </FieldLabel>
          <Input
            :id="`${column.id}-from`"
            type="date"
            :max="dates.to"
            :model-value="dates.from ?? ''"
            @update:model-value="(value) => setDates({ ...dates, from: String(value) || undefined })"
          />
        </Field>
        <Field>
          <FieldLabel :for="`${column.id}-to`">
            To
          </FieldLabel>
          <Input
            :id="`${column.id}-to`"
            type="date"
            :min="dates.from"
            :model-value="dates.to ?? ''"
            @update:model-value="(value) => setDates({ ...dates, to: String(value) || undefined })"
          />
        </Field>
      </div>
      <Button v-if="summary.length" variant="ghost" size="sm" @click="clear">
        <XIcon data-icon="inline-start" />
        Clear filter
      </Button>
    </PopoverContent>
  </Popover>
</template>
