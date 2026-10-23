"use client"

import { useId, useMemo, useState, type Ref } from "react"
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Tree, type TreeNode, type TreeProps } from "./tree"
import { applyCheckedStrategy, conductChecked, indexTree, toggleChecked } from "./tree-utils"

type TreeSelectBaseProps = {
  treeData: TreeNode[]
  placeholder?: string
  /** Search box on top of the tree. */
  showSearch?: boolean
  searchPlaceholder?: string
  /** Show an × to clear the value (default true). */
  allowClear?: boolean
  /** Chips shown before "+N" (multiple, default 3). */
  maxTagCount?: number
  treeDefaultExpandAll?: boolean
  expandIcon?: TreeProps["expandIcon"]
  showLine?: boolean
  loadData?: TreeProps["loadData"]
  /** Height of the tree inside the dropdown (default "18rem"). */
  dropdownHeight?: number | string
  disabled?: boolean
  id?: string
  className?: string
  "aria-invalid"?: boolean
  ref?: Ref<HTMLDivElement>
}

export type TreeSelectProps = TreeSelectBaseProps &
  (
    | {
        multiple?: false
        treeCheckable?: false
        value?: string | null
        defaultValue?: string
        onValueChange?: (value: string | undefined) => void
      }
    | {
        /** Pick several nodes by clicking them. */
        multiple?: boolean
        /** Pick with checkboxes (implies multiple). */
        treeCheckable?: boolean
        /**
         * With treeCheckable, which checked keys form the value: "all" (default),
         * "parent" (a fully checked parent stands for its children) or "child" (leaves only).
         */
        showCheckedStrategy?: "all" | "parent" | "child"
        value?: string[] | null
        defaultValue?: string[]
        onValueChange?: (value: string[]) => void
      }
  )

const asArray = (value: string | string[] | null | undefined) => (Array.isArray(value) ? value : value ? [value] : [])

/** Dropdown field with a Tree inside: one node, several, or checkboxes with a parent / child strategy. */
export function TreeSelect(props: TreeSelectProps) {
  const {
    treeData,
    placeholder = "Select",
    showSearch = false,
    searchPlaceholder = "Search…",
    allowClear = true,
    maxTagCount = 3,
    treeDefaultExpandAll = false,
    expandIcon,
    showLine,
    loadData,
    dropdownHeight = "18rem",
    disabled = false,
    id,
    className,
    "aria-invalid": invalid,
    ref,
  } = props
  const checkable = !!props.treeCheckable
  const multiple = checkable || !!props.multiple
  const strategy = "showCheckedStrategy" in props ? (props.showCheckedStrategy ?? "all") : "all"

  const index = useMemo(() => indexTree(treeData), [treeData])
  const [inner, setInner] = useState<string[]>(() => asArray(props.defaultValue))
  const value = props.value === undefined ? inner : asArray(props.value)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const contentId = useId()

  const emit = (next: string[]) => {
    if (props.value === undefined) setInner(next)
    if (multiple) (props.onValueChange as ((v: string[]) => void) | undefined)?.(next)
    else (props.onValueChange as ((v: string | undefined) => void) | undefined)?.(next[0])
  }

  // The value may hold only parents ("parent" strategy): expand it to every checked key for the tree.
  const checkedKeys = useMemo(() => (checkable ? [...conductChecked(value, index)] : []), [checkable, value, index])
  const titleOf = (key: string) => index.nodes.get(key)?.title ?? key
  const shown = value.slice(0, maxTagCount)

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setQuery("")
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
          aria-haspopup="tree"
          aria-disabled={disabled || undefined}
          aria-invalid={invalid || undefined}
          data-slot="tree-select-trigger"
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
            {!value.length ? (
              <span className="truncate text-muted-foreground">{placeholder}</span>
            ) : !multiple ? (
              <span className="truncate">{titleOf(value[0])}</span>
            ) : (
              <>
                {shown.map((key) => (
                  <span
                    key={key}
                    data-slot="tree-select-chip"
                    className="inline-flex h-5 max-w-40 items-center gap-0.5 rounded-md bg-secondary pr-0.5 pl-1.5 text-xs text-secondary-foreground"
                  >
                    <span className="truncate">{titleOf(key)}</span>
                    {!disabled && (
                      <button
                        type="button"
                        aria-label={`Remove ${titleOf(key)}`}
                        className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation()
                          // Removing a chip unchecks its subtree and re-checks the parents (tree rules).
                          if (checkable) {
                            emit(applyCheckedStrategy(toggleChecked(key, conductChecked(value, index), index), index, strategy))
                          } else {
                            emit(value.filter((k) => k !== key))
                          }
                        }}
                      >
                        <XIcon className="size-3" />
                      </button>
                    )}
                  </span>
                ))}
                {value.length > shown.length && (
                  <span className="inline-flex h-5 items-center rounded-md bg-secondary px-1.5 text-xs">
                    +{value.length - shown.length}
                  </span>
                )}
              </>
            )}
          </div>
          {allowClear && value.length > 0 && !disabled && (
            <button
              type="button"
              aria-label="Clear"
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
      <PopoverContent id={contentId} align="start" className="w-(--radix-popover-trigger-width) min-w-56 gap-0 p-0">
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
        <Tree
          treeData={treeData}
          defaultExpandAll={treeDefaultExpandAll}
          expandIcon={expandIcon}
          showLine={showLine}
          loadData={loadData}
          searchValue={query}
          height={dropdownHeight}
          className="p-1"
          selectable={!checkable}
          multiple={multiple && !checkable}
          selectedKeys={checkable ? [] : value}
          onSelect={(keys) => {
            emit(keys)
            if (!multiple) setOpen(false)
          }}
          checkable={checkable}
          checkedKeys={checkedKeys}
          onCheck={(keys) => emit(applyCheckedStrategy(new Set(keys), index, strategy))}
        />
      </PopoverContent>
    </Popover>
  )
}
