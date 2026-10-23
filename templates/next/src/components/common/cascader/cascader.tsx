"use client"

import { useId, useMemo, useState, type ReactNode, type Ref } from "react"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, Loader2Icon, SearchIcon, XIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { applyCheckedStrategy, conductChecked, halfCheckedOf, toggleChecked } from "../tree/tree-utils"
import {
  canExpand,
  indexCascader,
  keyPath,
  optionsAt,
  pathKey,
  searchPaths,
  type CascaderOption,
} from "./cascader-utils"

type CascaderBaseProps = {
  options: CascaderOption[]
  /** "click" (default) or "hover" opens the next column. */
  expandTrigger?: "click" | "hover"
  /** Trigger text for a path (default: labels joined with `separator`). */
  displayRender?: (labels: string[], options: CascaderOption[]) => ReactNode
  separator?: string
  /** Search over whole paths, listed flat ("Hà Nội / Ba Đình"). */
  showSearch?: boolean
  searchPlaceholder?: string
  /** Load an option's children when it is opened (set them in `options`). */
  loadData?: (selectedOptions: CascaderOption[]) => Promise<unknown>
  placeholder?: string
  /** Show an × to clear the value (default true). */
  allowClear?: boolean
  /** Chips shown before "+N" (multiple, default 3). */
  maxTagCount?: number
  disabled?: boolean
  id?: string
  className?: string
  "aria-invalid"?: boolean
  ref?: Ref<HTMLDivElement>
}

export type CascaderProps = CascaderBaseProps &
  (
    | {
        multiple?: false
        /** Pick a non-leaf option too (every click on a parent sets the value). */
        changeOnSelect?: boolean
        /** A path of values, e.g. ["hn", "ba-dinh"]. */
        value?: string[] | null
        defaultValue?: string[]
        onValueChange?: (value: string[] | undefined, selectedOptions: CascaderOption[]) => void
      }
    | {
        /** Checkboxes on every level; parents are tri-state. */
        multiple: true
        /** Which checked paths form the value: "parent" (default), "child" (leaves) or "all". */
        showCheckedStrategy?: "all" | "parent" | "child"
        value?: string[][] | null
        defaultValue?: string[][]
        onValueChange?: (value: string[][], selectedOptions: CascaderOption[][]) => void
      }
  )

// Stable empty value, so the memos below don't recompute on every render.
const NO_PATHS: string[][] = []

/** Pick a path through nested options, column by column (one column at a time on small screens). */
export function Cascader(props: CascaderProps) {
  const {
    options,
    expandTrigger = "click",
    separator = " / ",
    displayRender = (labels) => labels.join(separator),
    showSearch = false,
    searchPlaceholder = "Search…",
    loadData,
    placeholder = "Select",
    allowClear = true,
    maxTagCount = 3,
    disabled = false,
    id,
    className,
    "aria-invalid": invalid,
    ref,
  } = props
  const multiple = props.multiple === true
  const changeOnSelect = !props.multiple && !!props.changeOnSelect
  const strategy = props.multiple ? (props.showCheckedStrategy ?? "parent") : "parent"
  const contentId = useId()

  const [innerSingle, setInnerSingle] = useState<string[]>(() => (!props.multiple ? (props.defaultValue ?? []) : []))
  const [innerMultiple, setInnerMultiple] = useState<string[][]>(() => (props.multiple ? (props.defaultValue ?? []) : []))
  const single = !props.multiple ? (props.value === undefined ? innerSingle : (props.value ?? [])) : []
  const paths = props.multiple ? (props.value === undefined ? innerMultiple : (props.value ?? NO_PATHS)) : NO_PATHS

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  // Values of the opened options, one per column after the first.
  const [activePath, setActivePath] = useState<string[]>([])
  const [loading, setLoading] = useState<string>()

  const index = useMemo(() => indexCascader(options), [options])
  const checked = useMemo(() => (multiple ? conductChecked(paths.map(pathKey), index) : new Set<string>()), [multiple, paths, index])
  const half = useMemo(() => (multiple ? halfCheckedOf(checked, index) : new Set<string>()), [multiple, checked, index])

  const emitSingle = (path: string[] | undefined) => {
    if (props.multiple) return
    if (props.value === undefined) setInnerSingle(path ?? [])
    props.onValueChange?.(path, path ? optionsAt(options, path) : [])
  }
  const emitChecked = (next: Set<string>) => {
    if (!props.multiple) return
    const value = applyCheckedStrategy(next, index, strategy).map(keyPath)
    if (props.value === undefined) setInnerMultiple(value)
    props.onValueChange?.(value, value.map((path) => optionsAt(options, path)))
  }

  const columns: { parentPath: string[]; options: CascaderOption[] }[] = [{ parentPath: [], options }]
  activePath.forEach((_, depth) => {
    const path = activePath.slice(0, depth + 1)
    const children = optionsAt(options, path).at(-1)?.children
    if (children?.length) columns.push({ parentPath: path, options: children })
  })

  const openOption = async (path: string[], option: CascaderOption) => {
    setActivePath(path)
    if (loadData && !option.isLeaf && !option.children) {
      setLoading(pathKey(path))
      try {
        await loadData(optionsAt(options, path))
      } finally {
        setLoading(undefined)
      }
    }
  }

  const pick = (path: string[], option: CascaderOption) => {
    if (option.disabled) return
    const expandable = canExpand(option, !!loadData)
    if (multiple) {
      if (expandable) openOption(path, option)
      else emitChecked(toggleChecked(pathKey(path), checked, index))
      return
    }
    if (expandable) {
      openOption(path, option)
      if (changeOnSelect) emitSingle(path)
    } else {
      emitSingle(path)
      setOpen(false)
    }
  }

  const matches = showSearch && query.trim() ? searchPaths(options, query, separator, changeOnSelect) : undefined
  const label = (path: string[]) => {
    const opts = optionsAt(options, path)
    return displayRender(opts.map((o) => o.label), opts)
  }
  const shown = paths.slice(0, maxTagCount)
  const hasValue = multiple ? paths.length > 0 : single.length > 0

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setQuery("")
          // Reopen on the current path (single) so its columns show.
          setActivePath(multiple ? [] : canExpandLast(options, single, !!loadData) ? single : single.slice(0, -1))
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
          aria-controls={contentId}
          aria-haspopup="listbox"
          aria-disabled={disabled || undefined}
          aria-invalid={invalid || undefined}
          data-slot="cascader-trigger"
          onKeyDown={(event) => {
            if (!open && (event.key === "Enter" || event.key === " " || event.key === "ArrowDown")) {
              event.preventDefault()
              setOpen(true)
            }
          }}
          className={cn(
            "flex min-h-8 w-full min-w-0 cursor-default items-center gap-1.5 rounded-lg border border-input bg-transparent py-1 pr-2 pl-2.5 text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30",
            className
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {!hasValue ? (
              <span className="truncate text-muted-foreground">{placeholder}</span>
            ) : !multiple ? (
              <span className="truncate">{label(single)}</span>
            ) : (
              <>
                {shown.map((path) => (
                  <span
                    key={pathKey(path)}
                    data-slot="cascader-chip"
                    className="inline-flex h-5 max-w-48 items-center gap-0.5 rounded-md bg-secondary pr-0.5 pl-1.5 text-xs text-secondary-foreground"
                  >
                    <span className="truncate">{label(path)}</span>
                    {!disabled && (
                      <button
                        type="button"
                        aria-label="Remove"
                        className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation()
                          emitChecked(toggleChecked(pathKey(path), checked, index))
                        }}
                      >
                        <XIcon className="size-3" />
                      </button>
                    )}
                  </span>
                ))}
                {paths.length > shown.length && (
                  <span className="inline-flex h-5 items-center rounded-md bg-secondary px-1.5 text-xs">+{paths.length - shown.length}</span>
                )}
              </>
            )}
          </div>
          {allowClear && hasValue && !disabled && (
            <button
              type="button"
              aria-label="Clear"
              className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                if (multiple) emitChecked(new Set())
                else emitSingle(undefined)
              }}
            >
              <XIcon className="size-3.5" />
            </button>
          )}
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent id={contentId} align="start" className="w-auto max-w-[calc(100vw-2rem)] gap-0 p-0">
        {showSearch && (
          <div className="flex items-center gap-2 border-b px-2.5">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        )}
        {matches ? (
          <div role="listbox" className="max-h-72 min-w-56 overflow-y-auto p-1">
            {matches.map(({ path, text }) => {
              const values = path.map((o) => o.value)
              const key = pathKey(values)
              const isChecked = multiple ? checked.has(key) : pathKey(single) === key
              return (
                <div
                  key={key}
                  role="option"
                  aria-selected={isChecked}
                  onClick={() => {
                    if (multiple) emitChecked(toggleChecked(key, checked, index))
                    else {
                      emitSingle(values)
                      setOpen(false)
                    }
                  }}
                  className={cn("flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent", isChecked && !multiple && "font-medium")}
                >
                  {multiple && <Checkbox tabIndex={-1} checked={isChecked} aria-hidden />}
                  {text}
                </div>
              )
            })}
            {matches.length === 0 && <div className="px-2 py-6 text-center text-sm text-muted-foreground">No results.</div>}
          </div>
        ) : (
          <div className="flex">
            {columns.map((column, depth) => {
              const last = depth === columns.length - 1
              const parent = optionsAt(options, column.parentPath).at(-1)
              return (
                <div
                  key={pathKey(column.parentPath)}
                  role="listbox"
                  data-slot="cascader-column"
                  // Small screens: only the deepest column, with a way back.
                  className={cn("max-h-72 min-w-40 flex-col overflow-y-auto border-l p-1 first:border-l-0", last ? "flex" : "hidden sm:flex")}
                >
                  {depth > 0 && (
                    <button
                      type="button"
                      onClick={() => setActivePath(column.parentPath.slice(0, -1))}
                      className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent sm:hidden"
                    >
                      <ChevronLeftIcon className="size-3.5" />
                      {parent?.label}
                    </button>
                  )}
                  {column.options.map((option) => {
                    const path = [...column.parentPath, option.value]
                    const key = pathKey(path)
                    const isActive = activePath[depth] === option.value
                    const isSelected = !multiple && pathKey(single.slice(0, depth + 1)) === key
                    const expandable = canExpand(option, !!loadData)
                    return (
                      <div
                        key={option.value}
                        role="option"
                        aria-selected={multiple ? checked.has(key) : isSelected}
                        aria-disabled={option.disabled || undefined}
                        data-active={isActive || undefined}
                        onClick={() => pick(path, option)}
                        onPointerEnter={() => expandTrigger === "hover" && expandable && !option.disabled && openOption(path, option)}
                        className={cn(
                          "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent data-active:bg-accent",
                          isSelected && "font-medium",
                          option.disabled && "pointer-events-none opacity-50"
                        )}
                      >
                        {multiple && (
                          <Checkbox
                            tabIndex={-1}
                            aria-label={option.label}
                            checked={checked.has(key) ? true : half.has(key) ? "indeterminate" : false}
                            disabled={option.disabled}
                            onClick={(event) => event.stopPropagation()}
                            onCheckedChange={() => emitChecked(toggleChecked(key, checked, index))}
                          />
                        )}
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                        {loading === key ? (
                          <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
                        ) : (
                          expandable && <ChevronRightIcon className="size-3.5 text-muted-foreground" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

/** Does the last option of `path` open another column? */
function canExpandLast(options: CascaderOption[], path: string[], lazy: boolean) {
  const last = optionsAt(options, path).at(-1)
  return !!last && canExpand(last, lazy)
}
