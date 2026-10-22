"use client"

import type { Column } from "@tanstack/react-table"
import { PlusCircleIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import type { DataTableFilter, DateRange, NumberRange } from "./types"

type DataTableFilterControlProps<TData> = {
  column: Column<TData, unknown>
  filter: DataTableFilter
}

/** One toolbar filter button; its UI depends on `filter.type`. */
export function DataTableFilterControl<TData>({ column, filter }: DataTableFilterControlProps<TData>) {
  "use no memo" // reads live TanStack column state

  switch (filter.type) {
    case "select":
    case "multi-select":
      return <OptionsFilter column={column} filter={filter} />
    case "number-range":
      return <NumberRangeFilter column={column} filter={filter} />
    case "date-range":
      return <DateRangeFilter column={column} filter={filter} />
  }
}

function FilterTrigger({ title, summary }: { title: string; summary?: React.ReactNode }) {
  return (
    <>
      <PlusCircleIcon data-icon="inline-start" />
      {title}
      {summary && (
        <>
          <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
          {summary}
        </>
      )}
    </>
  )
}

function OptionsFilter<TData>({ column, filter }: DataTableFilterControlProps<TData>) {
  "use no memo"

  const options = filter.options ?? []
  const multiple = filter.type === "multi-select"
  const raw = column.getFilterValue()
  const selected = multiple ? ((raw as string[] | undefined) ?? []) : raw ? [raw as string] : []
  const facets = column.getFacetedUniqueValues()

  const summary =
    selected.length === 0 ? undefined : selected.length > 2 ? (
      <Badge variant="secondary">{selected.length} selected</Badge>
    ) : (
      options
        .filter((option) => selected.includes(option.value))
        .map((option) => (
          <Badge key={option.value} variant="secondary">
            {option.label}
          </Badge>
        ))
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-dashed">
          <FilterTrigger title={filter.title} summary={summary} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuLabel>{filter.title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {multiple ? (
          options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selected.includes(option.value)}
              // Keep the menu open while picking several values.
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) => {
                const next = checked
                  ? [...selected, option.value]
                  : selected.filter((value) => value !== option.value)
                column.setFilterValue(next.length ? next : undefined)
              }}
            >
              {option.icon && <option.icon />}
              {option.label}
              <FacetCount count={facets.get(option.value)} />
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <DropdownMenuRadioGroup
            value={selected[0] ?? ""}
            onValueChange={(value) => column.setFilterValue(value || undefined)}
          >
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.icon && <option.icon />}
                {option.label}
                <FacetCount count={facets.get(option.value)} />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )}
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => column.setFilterValue(undefined)}>
              <XIcon />
              Clear filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function FacetCount({ count }: { count?: number }) {
  if (count === undefined) return null
  return <span className="ml-auto pl-4 font-mono text-xs text-muted-foreground">{count}</span>
}

function NumberRangeFilter<TData>({ column, filter }: DataTableFilterControlProps<TData>) {
  "use no memo"

  const [min, max] = (column.getFilterValue() as NumberRange | undefined) ?? []
  const [facetMin, facetMax] = column.getFacetedMinMaxValues() ?? []
  const active = min !== undefined || max !== undefined
  const toNumber = (value: string) => (value === "" ? undefined : Number(value))
  const set = (next: NumberRange) =>
    column.setFilterValue(next[0] === undefined && next[1] === undefined ? undefined : next)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-dashed">
          <FilterTrigger
            title={filter.title}
            summary={active && <Badge variant="secondary">{`${min ?? "…"} – ${max ?? "…"}`}</Badge>}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <div className="grid grid-cols-2 gap-2">
          <Field>
            <FieldLabel htmlFor={`${column.id}-min`}>Min</FieldLabel>
            <Input
              id={`${column.id}-min`}
              type="number"
              placeholder={facetMin === undefined ? undefined : String(facetMin)}
              value={min ?? ""}
              onChange={(event) => set([toNumber(event.target.value), max])}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${column.id}-max`}>Max</FieldLabel>
            <Input
              id={`${column.id}-max`}
              type="number"
              placeholder={facetMax === undefined ? undefined : String(facetMax)}
              value={max ?? ""}
              onChange={(event) => set([min, toNumber(event.target.value)])}
            />
          </Field>
        </div>
        {active && (
          <Button variant="ghost" size="sm" onClick={() => column.setFilterValue(undefined)}>
            <XIcon data-icon="inline-start" />
            Clear filter
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}

function DateRangeFilter<TData>({ column, filter }: DataTableFilterControlProps<TData>) {
  "use no memo"

  const value = (column.getFilterValue() as DateRange | undefined) ?? {}
  const active = Boolean(value.from || value.to)
  const set = (next: DateRange) =>
    column.setFilterValue(next.from || next.to ? next : undefined)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-dashed">
          <FilterTrigger
            title={filter.title}
            summary={
              active && <Badge variant="secondary">{`${value.from ?? "…"} → ${value.to ?? "…"}`}</Badge>
            }
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="grid grid-cols-2 gap-2">
          <Field>
            <FieldLabel htmlFor={`${column.id}-from`}>From</FieldLabel>
            <Input
              id={`${column.id}-from`}
              type="date"
              value={value.from ?? ""}
              max={value.to}
              onChange={(event) => set({ ...value, from: event.target.value || undefined })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${column.id}-to`}>To</FieldLabel>
            <Input
              id={`${column.id}-to`}
              type="date"
              value={value.to ?? ""}
              min={value.from}
              onChange={(event) => set({ ...value, to: event.target.value || undefined })}
            />
          </Field>
        </div>
        {active && (
          <Button variant="ghost" size="sm" onClick={() => column.setFilterValue(undefined)}>
            <XIcon data-icon="inline-start" />
            Clear filter
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
