"use client"

import { useState, type ReactNode, type Ref } from "react"
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, XIcon } from "lucide-react"

import { normalizeText } from "@/components/common/combobox"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export type TransferItem = {
  key: string
  title: string
  description?: string
  disabled?: boolean
}

export type TransferDirection = "left" | "right"

export type TransferProps = {
  dataSource: TransferItem[]
  /** Keys in the right-hand list (the value, e.g. of a form field). */
  targetKeys?: string[]
  defaultTargetKeys?: string[]
  onValueChange?: (targetKeys: string[], direction: TransferDirection, movedKeys: string[]) => void
  /** Ticked items on both sides (controlled); default: managed inside. */
  selectedKeys?: string[]
  onSelectChange?: (sourceSelected: string[], targetSelected: string[]) => void
  /** Titles of the two lists (default "Source", "Target"). */
  titles?: [ReactNode, ReactNode]
  showSearch?: boolean
  searchPlaceholder?: string
  /** Custom match for the search (default: title / description, accent-insensitive). */
  filterOption?: (input: string, item: TransferItem) => boolean
  /** Tri-state "select all" in each list header (default true). */
  showSelectAll?: boolean
  /** Only move to the right; items on the right have an × to remove them. */
  oneWay?: boolean
  renderItem?: (item: TransferItem) => ReactNode
  /** Height of each list's scrolling area (default "18rem"). */
  listHeight?: number | string
  /** Texts for the move buttons (default: arrow icons only). */
  operations?: [string, string]
  /** Under each list, e.g. a "Reload" button. */
  footer?: (direction: TransferDirection) => ReactNode
  disabled?: boolean
  "aria-invalid"?: boolean
  id?: string
  className?: string
  /** The first list (react-hook-form focuses it on a validation error). */
  ref?: Ref<HTMLDivElement>
}

const defaultFilter = (input: string, item: TransferItem) => {
  const q = normalizeText(input)
  return normalizeText(item.title).includes(q) || normalizeText(item.description ?? "").includes(q)
}

/** Two lists side by side: tick items and move them across (on small screens they stack). */
export function Transfer({
  dataSource,
  targetKeys: targetProp,
  defaultTargetKeys = [],
  onValueChange,
  selectedKeys: selectedProp,
  onSelectChange,
  titles = ["Source", "Target"],
  showSearch = false,
  searchPlaceholder = "Search…",
  filterOption = defaultFilter,
  showSelectAll = true,
  oneWay = false,
  renderItem,
  listHeight = "18rem",
  operations,
  footer,
  disabled = false,
  "aria-invalid": invalid,
  id,
  className,
  ref,
}: TransferProps) {
  const [innerTarget, setInnerTarget] = useState(defaultTargetKeys)
  const targetKeys = targetProp ?? innerTarget
  const [innerSelected, setInnerSelected] = useState<string[]>([])
  const selected = selectedProp ?? innerSelected

  const byKey = new Map(dataSource.map((item) => [item.key, item]))
  const targetSet = new Set(targetKeys)
  const source = dataSource.filter((item) => !targetSet.has(item.key))
  // The right list keeps the order items were moved in.
  const target = targetKeys.map((key) => byKey.get(key)).filter((item): item is TransferItem => !!item)

  const setSelected = (next: string[]) => {
    if (selectedProp === undefined) setInnerSelected(next)
    onSelectChange?.(
      next.filter((key) => !targetSet.has(key)),
      next.filter((key) => targetSet.has(key))
    )
  }

  const move = (direction: TransferDirection, keys?: string[]) => {
    const fromList = direction === "right" ? source : target
    const moving = (keys ?? fromList.filter((item) => selected.includes(item.key)).map((item) => item.key)).filter(
      (key) => !byKey.get(key)?.disabled
    )
    if (!moving.length) return
    const next = direction === "right" ? [...targetKeys, ...moving] : targetKeys.filter((key) => !moving.includes(key))
    if (targetProp === undefined) setInnerTarget(next)
    onValueChange?.(next, direction, moving)
    setSelected(selected.filter((key) => !moving.includes(key)))
  }

  const sourceSelected = source.filter((item) => selected.includes(item.key)).length
  const targetSelected = target.filter((item) => selected.includes(item.key)).length

  return (
    <div
      id={id}
      data-slot="transfer"
      aria-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn("flex flex-col items-stretch gap-2 sm:flex-row sm:items-center", disabled && "opacity-50", className)}
    >
      <TransferList
        ref={ref}
        direction="left"
        title={titles[0]}
        items={source}
        selected={selected}
        onSelectedChange={setSelected}
        onItemMove={(key) => move("right", [key])}
        showSearch={showSearch}
        searchPlaceholder={searchPlaceholder}
        filterOption={filterOption}
        showSelectAll={showSelectAll}
        renderItem={renderItem}
        listHeight={listHeight}
        footer={footer?.("left")}
        disabled={disabled}
        invalid={invalid}
      />
      <div className="flex justify-center gap-2 sm:flex-col">
        <Button
          type="button"
          size={operations ? "sm" : "icon-sm"}
          variant="outline"
          aria-label="Move to the right"
          disabled={disabled || sourceSelected === 0}
          onClick={() => move("right")}
        >
          <ChevronRightIcon className="rotate-90 sm:rotate-0" />
          {operations?.[0]}
        </Button>
        {!oneWay && (
          <Button
            type="button"
            size={operations ? "sm" : "icon-sm"}
            variant="outline"
            aria-label="Move to the left"
            disabled={disabled || targetSelected === 0}
            onClick={() => move("left")}
          >
            <ChevronLeftIcon className="rotate-90 sm:rotate-0" />
            {operations?.[1]}
          </Button>
        )}
      </div>
      <TransferList
        direction="right"
        title={titles[1]}
        items={target}
        selected={selected}
        onSelectedChange={setSelected}
        onItemMove={(key) => move("left", [key])}
        onRemove={oneWay ? (key) => move("left", [key]) : undefined}
        showSearch={showSearch}
        searchPlaceholder={searchPlaceholder}
        filterOption={filterOption}
        showSelectAll={showSelectAll && !oneWay}
        renderItem={renderItem}
        listHeight={listHeight}
        footer={footer?.("right")}
        disabled={disabled}
        invalid={invalid}
      />
    </div>
  )
}

function TransferList({
  ref,
  direction,
  title,
  items,
  selected,
  onSelectedChange,
  onItemMove,
  onRemove,
  showSearch,
  searchPlaceholder,
  filterOption,
  showSelectAll,
  renderItem,
  listHeight,
  footer,
  disabled,
  invalid,
}: {
  ref?: Ref<HTMLDivElement>
  direction: TransferDirection
  title: ReactNode
  items: TransferItem[]
  selected: string[]
  onSelectedChange: (keys: string[]) => void
  onItemMove: (key: string) => void
  /** One-way target list: an × per item instead of checkboxes. */
  onRemove?: (key: string) => void
  showSearch: boolean
  searchPlaceholder: string
  filterOption: (input: string, item: TransferItem) => boolean
  showSelectAll: boolean
  renderItem?: (item: TransferItem) => ReactNode
  listHeight: number | string
  footer?: ReactNode
  disabled: boolean
  invalid?: boolean
}) {
  const [query, setQuery] = useState("")
  const visible = query ? items.filter((item) => filterOption(query, item)) : items
  // "Select all" works on the visible, enabled items.
  const selectable = visible.filter((item) => !item.disabled)
  const checkedCount = items.filter((item) => selected.includes(item.key)).length
  const visibleChecked = selectable.filter((item) => selected.includes(item.key)).length
  const allState = visibleChecked === 0 ? false : visibleChecked === selectable.length ? true : "indeterminate"
  const keys = selectable.map((item) => item.key)

  const toggle = (key: string) =>
    onSelectedChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key])

  return (
    <div
      ref={ref}
      data-slot="transfer-list"
      data-direction={direction}
      tabIndex={-1}
      className={cn(
        "flex min-w-0 flex-1 flex-col rounded-lg border outline-none",
        invalid && "border-destructive ring-3 ring-destructive/20"
      )}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2 text-sm">
        {showSelectAll && (
          <Checkbox
            aria-label="Select all"
            checked={allState}
            disabled={disabled || selectable.length === 0}
            onCheckedChange={() =>
              onSelectedChange(
                allState === true
                  ? selected.filter((key) => !keys.includes(key))
                  : [...new Set([...selected, ...keys])]
              )
            }
          />
        )}
        <span className="text-muted-foreground tabular-nums">
          {onRemove ? items.length : `${checkedCount}/${items.length}`} {items.length === 1 ? "item" : "items"}
        </span>
        <span className="ml-auto truncate font-medium">{title}</span>
      </div>
      {showSearch && (
        <div className="flex items-center gap-2 border-b px-3">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            disabled={disabled}
            className="h-8 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}
      <ul role="listbox" aria-multiselectable className="overflow-y-auto p-1" style={{ height: listHeight }}>
        {visible.map((item) => {
          const isDisabled = disabled || item.disabled
          return (
            <li
              key={item.key}
              role="option"
              aria-selected={selected.includes(item.key)}
              aria-disabled={isDisabled || undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                isDisabled ? "pointer-events-none opacity-50" : "cursor-pointer"
              )}
              onClick={() => !onRemove && toggle(item.key)}
              // Double-click moves the item straight across.
              onDoubleClick={() => onItemMove(item.key)}
            >
              {!onRemove && (
                <Checkbox
                  aria-label={item.title}
                  checked={selected.includes(item.key)}
                  disabled={isDisabled}
                  onClick={(event) => event.stopPropagation()}
                  onCheckedChange={() => toggle(item.key)}
                />
              )}
              <div className="flex min-w-0 flex-1 flex-col">
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <>
                    <span className="truncate">{item.title}</span>
                    {item.description && <span className="truncate text-xs text-muted-foreground">{item.description}</span>}
                  </>
                )}
              </div>
              {onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${item.title}`}
                  onClick={() => onRemove(item.key)}
                >
                  <XIcon />
                </Button>
              )}
            </li>
          )
        })}
        {visible.length === 0 && (
          <li className="flex h-full items-center justify-center text-sm text-muted-foreground">No items</li>
        )}
      </ul>
      {footer && <div className="border-t px-3 py-2">{footer}</div>}
    </div>
  )
}
