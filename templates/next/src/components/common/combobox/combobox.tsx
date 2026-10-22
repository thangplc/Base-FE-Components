"use client"

import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type Ref } from "react"
import { CheckIcon, ChevronDownIcon, Loader2Icon, PlusIcon, SearchIcon, XIcon } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  DEFAULT_COMBOBOX_LABELS,
  filterOptions,
  moveActive,
  normalizeText,
  toRows,
  type ComboboxLabels,
  type ComboboxOption,
} from "./combobox-utils"

type ComboboxBaseProps = {
  options: ComboboxOption[]
  placeholder?: string
  /** Search box on top of the list (default true). */
  searchable?: boolean
  searchPlaceholder?: string
  emptyText?: ReactNode
  /** Server-side search: called with the query, and the list is shown unfiltered. */
  onSearch?: (query: string) => void
  /** Spinner in the list while `onSearch` results load. */
  loading?: boolean
  /** Most options that can be selected (multiple). */
  maxCount?: number
  /** Chips shown in the trigger before "+N" (multiple, default 3). */
  maxTagCount?: number
  /** "chips" (default) or "count" ("3 selected") in the trigger. */
  tagMode?: "chips" | "count"
  /** A "Select all" row on top (multiple). */
  showSelectAll?: boolean
  /** Close after picking (default: true for single, false for multiple). */
  closeOnSelect?: boolean
  /** Offer to add the typed text as a new option. */
  creatable?: boolean
  renderOption?: (option: ComboboxOption, state: { selected: boolean }) => ReactNode
  /** Show an × to clear the value (default true). */
  clearable?: boolean
  disabled?: boolean
  size?: "sm" | "default"
  labels?: Partial<ComboboxLabels>
  id?: string
  className?: string
  "aria-invalid"?: boolean
  /** The trigger (react-hook-form focuses it on a validation error). */
  ref?: Ref<HTMLDivElement>
}

export type ComboboxSingleProps = ComboboxBaseProps & {
  multiple?: false
  value?: string | null
  defaultValue?: string
  onValueChange?: (value: string | undefined) => void
}

export type ComboboxMultipleProps = ComboboxBaseProps & {
  multiple: true
  value?: string[] | null
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

const asArray = (value: string | string[] | null | undefined) =>
  Array.isArray(value) ? value : value ? [value] : []

type Item = { kind: "create"; label: string } | { kind: "option"; option: ComboboxOption }

/** Searchable select, single or `multiple` (chips), on a Popover. */
export function Combobox(props: ComboboxProps) {
  const {
    options,
    multiple = false,
    placeholder = multiple ? "Select options" : "Select an option",
    searchable = true,
    searchPlaceholder = "Search…",
    emptyText = "No results.",
    onSearch,
    loading = false,
    maxCount,
    maxTagCount = 3,
    tagMode = "chips",
    showSelectAll = false,
    closeOnSelect = !multiple,
    creatable = false,
    renderOption,
    clearable = true,
    disabled = false,
    size = "default",
    id,
    className,
    "aria-invalid": invalid,
    ref,
  } = props
  const labels = { ...DEFAULT_COMBOBOX_LABELS, ...props.labels }
  const listId = useId()

  const [inner, setInner] = useState<string[]>(() => asArray(props.defaultValue))
  const selected = props.value === undefined ? inner : asArray(props.value)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const [created, setCreated] = useState<ComboboxOption[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  const allOptions = useMemo(
    () => [...options, ...created.filter((c) => !options.some((o) => o.value === c.value))],
    [options, created]
  )
  // Every option seen so far: selected values keep their label even when
  // server-side search no longer returns them.
  const [known, setKnown] = useState<Record<string, ComboboxOption>>({})
  const [seenOptions, setSeenOptions] = useState<ComboboxOption[]>()
  if (seenOptions !== options) {
    setSeenOptions(options)
    setKnown((prev) => ({ ...prev, ...Object.fromEntries(options.map((o) => [o.value, o])) }))
  }
  const optionOf = (value: string) =>
    allOptions.find((o) => o.value === value) ?? known[value] ?? { value, label: value }

  // Rendered order (grouped); keyboard indexes follow it.
  const rows = toRows(onSearch ? allOptions : filterOptions(allOptions, query))
  const visible = rows.flatMap((row) => (row.kind === "option" ? [row.option] : []))
  const canCreate =
    creatable && query.trim() !== "" && !allOptions.some((o) => normalizeText(o.label) === normalizeText(query))
  const limitReached = multiple && maxCount !== undefined && selected.length >= maxCount
  const isDisabled = (option: ComboboxOption) =>
    !!option.disabled || (limitReached && !selected.includes(option.value))
  const items: Item[] = [
    ...(canCreate ? [{ kind: "create" as const, label: query.trim() }] : []),
    ...visible.map((option) => ({ kind: "option" as const, option })),
  ]
  const itemDisabled = items.map((item) => item.kind === "option" && isDisabled(item.option))

  const emit = (next: string[]) => {
    if (props.value === undefined) setInner(next)
    if (props.multiple) props.onValueChange?.(next)
    else props.onValueChange?.(next[0])
  }

  const toggle = (option: ComboboxOption) => {
    if (multiple) {
      if (selected.includes(option.value)) emit(selected.filter((v) => v !== option.value))
      else if (!limitReached) emit([...selected, option.value])
    } else {
      emit([option.value])
    }
    if (closeOnSelect) setOpen(false)
  }

  const pick = (item: Item | undefined) => {
    if (!item) return
    if (item.kind === "create") {
      const option = { value: item.label, label: item.label }
      setCreated((list) => [...list, option])
      setQuery("")
      onSearch?.("")
      toggle(option)
    } else if (!isDisabled(item.option)) {
      toggle(item.option)
    }
  }

  // "Select all" works on the visible, enabled options; it fills up to
  // maxCount, and once full (or all picked) it clears them.
  const selectable = visible.filter((o) => !o.disabled)
  const selectedVisible = selectable.filter((o) => selected.includes(o.value)).length
  const allState = selectedVisible === 0 ? false : selectedVisible === selectable.length ? true : "indeterminate"
  const toggleAll = () => {
    if (allState === true || limitReached) return emit(selected.filter((v) => !selectable.some((o) => o.value === v)))
    const added = selectable.map((o) => o.value).filter((v) => !selected.includes(v))
    const room = maxCount === undefined ? added.length : Math.max(0, maxCount - selected.length)
    emit([...selected, ...added.slice(0, room)])
  }

  const setSearch = (text: string) => {
    setQuery(text)
    setActive(0)
    onSearch?.(text)
  }

  // Keep the active option in view while moving with the keyboard.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>("[data-active=true]")?.scrollIntoView({ block: "nearest" })
  }, [active, open])

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const next = moveActive(itemDisabled.map((d) => ({ disabled: d })), active, event.key === "ArrowDown" ? 1 : -1)
      if (next !== -1) setActive(next)
    } else if (event.key === "Enter") {
      event.preventDefault()
      pick(items[active])
    } else if (event.key === "Backspace" && multiple && !query && selected.length) {
      emit(selected.slice(0, -1))
    }
  }

  const removeChip = (value: string) => (event: React.MouseEvent) => {
    event.stopPropagation()
    emit(selected.filter((v) => v !== value))
  }

  const triggerText = () => {
    if (!selected.length) return <span className="truncate text-muted-foreground">{placeholder}</span>
    if (!multiple) return <span className="truncate">{optionOf(selected[0]).label}</span>
    if (tagMode === "count") return <span className="truncate">{labels.selected(selected.length)}</span>
    const shown = selected.slice(0, maxTagCount)
    return (
      <>
        {shown.map((value) => (
          <span
            key={value}
            data-slot="combobox-chip"
            className="inline-flex h-5 max-w-40 items-center gap-0.5 rounded-md bg-secondary pr-0.5 pl-1.5 text-xs text-secondary-foreground"
          >
            <span className="truncate">{optionOf(value).label}</span>
            {!disabled && (
              <button
                type="button"
                aria-label={`${labels.clear} ${optionOf(value).label}`}
                className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={removeChip(value)}
              >
                <XIcon className="size-3" />
              </button>
            )}
          </span>
        ))}
        {selected.length > shown.length && (
          <span className="inline-flex h-5 items-center rounded-md bg-secondary px-1.5 text-xs text-secondary-foreground">
            +{selected.length - shown.length}
          </span>
        )}
      </>
    )
  }

  let itemIndex = canCreate ? 1 : 0

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setSearch("")
          // Start on the (first) selected option, or the first enabled one.
          const order = toRows(allOptions).flatMap((row) => (row.kind === "option" ? [row.option] : []))
          const first = order.findIndex((o) => selected.includes(o.value))
          setActive(first !== -1 ? first : Math.max(0, moveActive(order, -1, 1)))
        }
      }}
    >
      <PopoverTrigger asChild disabled={disabled}>
        <div
          id={id}
          ref={ref}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-disabled={disabled || undefined}
          aria-invalid={invalid || undefined}
          data-slot="combobox-trigger"
          data-size={size}
          onKeyDown={(event) => {
            if (!open && (event.key === "Enter" || event.key === " " || event.key === "ArrowDown")) {
              event.preventDefault()
              setOpen(true)
            }
          }}
          className={cn(
            "flex w-full min-w-0 cursor-default items-center gap-1.5 rounded-lg border border-input bg-transparent py-1 pr-2 pl-2.5 text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:min-h-8 data-[size=sm]:min-h-7 dark:bg-input/30 dark:hover:bg-input/50",
            className
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">{triggerText()}</div>
          {clearable && selected.length > 0 && !disabled && (
            <button
              type="button"
              aria-label={labels.clear}
              className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                emit([])
              }}
            >
              <XIcon className="size-3.5" />
            </button>
          )}
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-48 gap-0 p-0"
        onKeyDown={onKeyDown}
      >
        {searchable && (
          <div className="flex items-center gap-2 border-b px-2.5">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              aria-controls={listId}
              aria-activedescendant={items[active] ? `${listId}-${active}` : undefined}
              className="h-9 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        )}
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-multiselectable={multiple || undefined}
          tabIndex={searchable ? -1 : 0}
          className="max-h-64 overflow-y-auto p-1 outline-none"
        >
          {loading && (
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              {labels.loading}
            </div>
          )}
          {multiple && showSelectAll && selectable.length > 0 && (
            <div
              role="option"
              aria-selected={allState === true}
              onPointerDown={(event) => event.preventDefault()}
              onClick={toggleAll}
              className="flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm font-medium hover:bg-accent"
            >
              <CheckMark checked={allState} />
              {labels.selectAll}
            </div>
          )}
          {canCreate && (
            <div
              id={`${listId}-0`}
              role="option"
              aria-selected={false}
              data-active={active === 0}
              onPointerDown={(event) => event.preventDefault()}
              onPointerMove={() => setActive(0)}
              onClick={() => pick(items[0])}
              className="flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
            >
              <PlusIcon className="size-4 text-muted-foreground" />
              {labels.create(query.trim())}
            </div>
          )}
          {rows.map((row) => {
            if (row.kind === "group") {
              return (
                <div key={`group-${row.label}`} className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                  {row.label}
                </div>
              )
            }
            const index = itemIndex++
            const option = row.option
            const isSelected = selected.includes(option.value)
            const optionDisabled = isDisabled(option)
            return (
              <div
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={optionDisabled || undefined}
                data-active={active === index}
                onPointerDown={(event) => event.preventDefault()}
                onPointerMove={() => !optionDisabled && setActive(index)}
                onClick={() => pick(items[index])}
                className="flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                {multiple && <CheckMark checked={isSelected} />}
                <div className="flex min-w-0 flex-1 flex-col">
                  {renderOption ? (
                    renderOption(option, { selected: isSelected })
                  ) : (
                    <>
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span className="truncate text-xs text-muted-foreground">{option.description}</span>
                      )}
                    </>
                  )}
                </div>
                {!multiple && isSelected && <CheckIcon className="size-4 shrink-0" />}
              </div>
            )
          })}
          {!loading && items.length === 0 && (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Checkbox look for options (the whole row is the control). */
function CheckMark({ checked }: { checked: boolean | "indeterminate" }) {
  return (
    <span
      aria-hidden
      data-state={checked === "indeterminate" ? "indeterminate" : checked ? "checked" : "unchecked"}
      className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
    >
      {checked === true && <CheckIcon className="size-3" />}
      {checked === "indeterminate" && <span className="h-0.5 w-2 rounded-full bg-current" />}
    </span>
  )
}
