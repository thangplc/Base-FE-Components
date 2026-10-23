"use client"

import { useId, useMemo, useState, type ReactNode } from "react"
import { ChevronRightIcon, Loader2Icon, MinusIcon, PlusIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  ancestorsOf,
  canDropOn,
  conductChecked,
  dropPositionAt,
  filterTree,
  halfCheckedOf,
  hasChildren,
  indexTree,
  moveNode,
  toggleChecked,
  visibleRows,
  type DropPosition,
  type TreeNodeBase,
} from "./tree-utils"

export type TreeNode = Omit<TreeNodeBase, "children"> & {
  children?: TreeNode[]
  /** Icon before the title. */
  icon?: ReactNode
}

export type TreeDropInfo = {
  dragKey: string
  dropKey: string
  position: DropPosition
  /** The tree with the node already moved: set it as `treeData`. */
  treeData: TreeNode[]
}

export type TreeProps = {
  treeData: TreeNode[]
  expandedKeys?: string[]
  defaultExpandedKeys?: string[]
  defaultExpandAll?: boolean
  onExpand?: (expandedKeys: string[]) => void
  /** "chevron" (default) or a +/− box. */
  expandIcon?: "chevron" | "plus-minus"
  /** Guide lines between parents and children. */
  showLine?: boolean

  /** Click selects a node (default true). */
  selectable?: boolean
  multiple?: boolean
  selectedKeys?: string[]
  defaultSelectedKeys?: string[]
  onSelect?: (selectedKeys: string[], node: TreeNode) => void

  /** Checkboxes; a parent shows a dash when only some children are checked. */
  checkable?: boolean
  checkedKeys?: string[]
  defaultCheckedKeys?: string[]
  onCheck?: (checkedKeys: string[], halfCheckedKeys: string[]) => void
  /** Parent and children are checked independently. */
  checkStrictly?: boolean

  /** Drag nodes to reorder / re-parent them (all, or a test per node). */
  draggable?: boolean | ((node: TreeNode) => boolean)
  allowDrop?: (info: { dragNode: TreeNode; dropNode: TreeNode; position: DropPosition }) => boolean
  onDrop?: (info: TreeDropInfo) => void

  /** Load children when a node without them is expanded (set them in `treeData`). */
  loadData?: (node: TreeNode) => Promise<unknown>
  /** Filter: matching nodes and their parents stay visible, the parents open. */
  searchValue?: string
  filterNode?: (node: TreeNode, searchValue: string) => boolean
  titleRender?: (node: TreeNode) => ReactNode
  /** Scroll inside this height (number = px). */
  height?: number | string
  "aria-label"?: string
  className?: string
}

const allParents = (nodes: TreeNode[]): string[] =>
  nodes.flatMap((node) => (hasChildren(node) ? [node.key, ...allParents(node.children!)] : []))

/** Tree with expand / select / check (tri-state), drag and drop, lazy loading and search. */
export function Tree({
  treeData,
  expandedKeys: expandedProp,
  defaultExpandedKeys,
  defaultExpandAll = false,
  onExpand,
  expandIcon = "chevron",
  showLine = false,
  selectable = true,
  multiple = false,
  selectedKeys: selectedProp,
  defaultSelectedKeys = [],
  onSelect,
  checkable = false,
  checkedKeys: checkedProp,
  defaultCheckedKeys = [],
  onCheck,
  checkStrictly = false,
  draggable = false,
  allowDrop,
  onDrop,
  loadData,
  searchValue,
  filterNode,
  titleRender,
  height,
  "aria-label": ariaLabel = "Tree",
  className,
}: TreeProps) {
  const id = useId()
  const index = useMemo(() => indexTree(treeData), [treeData])

  const [innerExpanded, setInnerExpanded] = useState<string[]>(
    () => defaultExpandedKeys ?? (defaultExpandAll ? allParents(treeData) : [])
  )
  const expandedList = expandedProp ?? innerExpanded
  const [innerSelected, setInnerSelected] = useState(defaultSelectedKeys)
  const selected = selectedProp ?? innerSelected
  const [innerChecked, setInnerChecked] = useState(defaultCheckedKeys)
  const checkedList = checkedProp ?? innerChecked
  const checked = useMemo(
    () => (checkStrictly ? new Set(checkedList) : conductChecked(checkedList, index)),
    [checkedList, checkStrictly, index]
  )
  const halfChecked = useMemo(
    () => (checkStrictly ? new Set<string>() : halfCheckedOf(checked, index)),
    [checked, checkStrictly, index]
  )

  const search = searchValue?.trim() ? filterTree(index, searchValue, filterNode) : undefined
  const expanded = new Set([...expandedList, ...(search?.expand ?? [])])
  const rows = visibleRows(treeData, expanded, search?.visible)

  const [loading, setLoading] = useState<Set<string>>(new Set())
  const [active, setActive] = useState<string>()
  const [drag, setDrag] = useState<{ key: string; over?: string; position?: DropPosition }>()

  const setExpanded = (next: string[]) => {
    if (expandedProp === undefined) setInnerExpanded(next)
    onExpand?.(next)
  }

  const toggleExpand = async (node: TreeNode) => {
    if (expanded.has(node.key)) return setExpanded(expandedList.filter((k) => k !== node.key))
    if (loadData && !node.isLeaf && !hasChildren(node)) {
      setLoading((s) => new Set(s).add(node.key))
      try {
        await loadData(node)
      } finally {
        setLoading((s) => {
          const next = new Set(s)
          next.delete(node.key)
          return next
        })
      }
    }
    setExpanded([...expandedList, node.key])
  }

  const select = (node: TreeNode) => {
    if (!selectable || node.disabled || node.selectable === false) return
    const next = multiple
      ? selected.includes(node.key)
        ? selected.filter((k) => k !== node.key)
        : [...selected, node.key]
      : [node.key]
    if (selectedProp === undefined) setInnerSelected(next)
    onSelect?.(next, node)
  }

  const check = (node: TreeNode) => {
    if (node.disabled || node.disableCheckbox) return
    const next = toggleChecked(node.key, checked, index, checkStrictly)
    const keys = index.order.filter((k) => next.has(k))
    if (checkedProp === undefined) setInnerChecked(keys)
    const half = checkStrictly ? [] : index.order.filter((k) => halfCheckedOf(next, index).has(k))
    onCheck?.(keys, half)
  }

  const canDrag = (node: TreeNode) =>
    !node.disabled && (typeof draggable === "function" ? draggable(node) : draggable)

  const dropAllowed = (dragKey: string, dropNode: TreeNode, position: DropPosition) =>
    canDropOn(dragKey, dropNode.key, index) &&
    (!allowDrop || allowDrop({ dragNode: index.nodes.get(dragKey)!, dropNode, position }))

  // Keyboard: ↑ ↓ move, → open / first child, ← close / parent, Enter select, Space check.
  const onKeyDown = (event: React.KeyboardEvent) => {
    const i = rows.findIndex((row) => row.node.key === active)
    const row = rows[i]
    const go = (key?: string) => {
      if (!key) return
      event.preventDefault()
      setActive(key)
      document.getElementById(`${id}-${key}`)?.scrollIntoView({ block: "nearest" })
    }
    if (event.key === "ArrowDown") go(rows[Math.min(rows.length - 1, i + 1)]?.node.key)
    else if (event.key === "ArrowUp") go(rows[Math.max(0, i - 1)]?.node.key)
    else if (event.key === "Home") go(rows[0]?.node.key)
    else if (event.key === "End") go(rows.at(-1)?.node.key)
    else if (!row) go(rows[0]?.node.key)
    else if (event.key === "ArrowRight") {
      event.preventDefault()
      if (!row.expanded && (hasChildren(row.node) || (loadData && !row.node.isLeaf))) toggleExpand(row.node)
      else if (row.expanded) go(rows[i + 1]?.node.key)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      if (row.expanded) toggleExpand(row.node)
      else go(index.parent.get(row.node.key))
    } else if (event.key === "Enter") {
      event.preventDefault()
      select(row.node)
    } else if (event.key === " " && checkable) {
      event.preventDefault()
      check(row.node)
    }
  }

  return (
    <div
      role="tree"
      aria-label={ariaLabel}
      aria-multiselectable={multiple || checkable || undefined}
      tabIndex={0}
      aria-activedescendant={active ? `${id}-${active}` : undefined}
      onKeyDown={onKeyDown}
      onFocus={() => !active && rows[0] && setActive(rows[0].node.key)}
      data-slot="tree"
      className={cn("overflow-auto rounded-md text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50", className)}
      style={height !== undefined ? { maxHeight: height } : undefined}
    >
      {rows.map(({ node, depth, expanded: isExpanded, isLast }) => {
        const expandable = hasChildren(node) || (!!loadData && !node.isLeaf && !node.children)
        const isSelected = selected.includes(node.key)
        const dropHere = drag?.over === node.key ? drag.position : undefined
        const ancestors = ancestorsOf(node.key, index)
        return (
          <div
            key={node.key}
            id={`${id}-${node.key}`}
            role="treeitem"
            aria-level={depth + 1}
            aria-expanded={expandable ? isExpanded : undefined}
            aria-selected={selectable ? isSelected : undefined}
            aria-checked={checkable ? (checked.has(node.key) ? true : halfChecked.has(node.key) ? "mixed" : false) : undefined}
            aria-disabled={node.disabled || undefined}
            data-active={active === node.key || undefined}
            data-drop={dropHere}
            draggable={canDrag(node) || undefined}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move"
              event.dataTransfer.setData("text/plain", node.key)
              setDrag({ key: node.key })
            }}
            onDragOver={(event) => {
              if (!drag) return
              const rect = event.currentTarget.getBoundingClientRect()
              const position = dropPositionAt(event.clientY - rect.top, rect.height)
              if (!dropAllowed(drag.key, node, position)) return setDrag({ key: drag.key })
              event.preventDefault()
              if (drag.over !== node.key || drag.position !== position) setDrag({ key: drag.key, over: node.key, position })
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setDrag((d) => (d ? { key: d.key } : d))
            }}
            onDrop={(event) => {
              event.preventDefault()
              if (!drag?.position || drag.over !== node.key) return
              const next = moveNode(treeData, drag.key, node.key, drag.position)
              onDrop?.({ dragKey: drag.key, dropKey: node.key, position: drag.position, treeData: next })
              if (drag.position === "inside" && !expanded.has(node.key)) setExpanded([...expandedList, node.key])
              setDrag(undefined)
            }}
            onDragEnd={() => setDrag(undefined)}
            onClick={() => {
              setActive(node.key)
              select(node)
            }}
            className={cn(
              "relative flex h-8 items-center gap-1.5 rounded-md pr-2 select-none",
              node.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-accent",
              isSelected && "bg-accent font-medium",
              "data-active:ring-2 data-active:ring-ring/40 data-active:ring-inset",
              drag?.key === node.key && "opacity-40",
              dropHere === "inside" && "bg-primary/10 ring-2 ring-primary ring-inset",
              dropHere === "before" && "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-primary",
              dropHere === "after" && "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary"
            )}
          >
            {/*
              Indent. With showLine, column `level` continues the line of the
              ancestor at that depth while the path below it (depth level + 1)
              has siblings further down; the last column links to this node.
            */}
            {Array.from({ length: depth }, (_, level) => {
              const pathKey = level < depth - 1 ? ancestors[depth - 2 - level] : undefined
              const continues = level === depth - 1 || (!!pathKey && !isLastChild(pathKey, index))
              return (
                <span key={level} aria-hidden className="relative h-full w-4 shrink-0">
                  {showLine && continues && (
                    <span
                      className={cn(
                        "absolute left-1/2 w-px bg-foreground/15",
                        level === depth - 1 && isLast ? "top-0 h-1/2" : "inset-y-0"
                      )}
                    />
                  )}
                  {showLine && level === depth - 1 && <span className="absolute top-1/2 left-1/2 h-px w-2 bg-foreground/15" />}
                </span>
              )
            })}
            {expandable ? (
              <button
                type="button"
                tabIndex={-1}
                aria-label={isExpanded ? "Collapse" : "Expand"}
                onClick={(event) => {
                  event.stopPropagation()
                  toggleExpand(node)
                }}
                className="flex size-4 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {loading.has(node.key) ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : expandIcon === "plus-minus" ? (
                  <span className="flex size-3.5 items-center justify-center rounded-[3px] border border-input bg-background">
                    {isExpanded ? <MinusIcon className="size-2.5" /> : <PlusIcon className="size-2.5" />}
                  </span>
                ) : (
                  <ChevronRightIcon className={cn("size-4 transition-transform", isExpanded && "rotate-90")} />
                )}
              </button>
            ) : (
              <span aria-hidden className="size-4 shrink-0" />
            )}
            {checkable && !node.disableCheckbox && (
              <Checkbox
                tabIndex={-1}
                aria-label={node.title}
                checked={checked.has(node.key) ? true : halfChecked.has(node.key) ? "indeterminate" : false}
                disabled={node.disabled}
                onClick={(event) => event.stopPropagation()}
                onCheckedChange={() => check(node)}
              />
            )}
            {node.icon && <span className="flex shrink-0 text-muted-foreground [&_svg]:size-4">{node.icon}</span>}
            <span className="truncate">
              {titleRender ? titleRender(node) : <Highlight text={node.title} query={searchValue} />}
            </span>
          </div>
        )
      })}
      {rows.length === 0 && <div className="px-2 py-6 text-center text-muted-foreground">No data</div>}
    </div>
  )
}

function isLastChild<T extends TreeNodeBase>(key: string, index: ReturnType<typeof indexTree<T>>) {
  const parent = index.parent.get(key)
  const siblings = parent === undefined ? null : index.nodes.get(parent)?.children
  if (!siblings) {
    const roots = index.order.filter((k) => index.parent.get(k) === undefined)
    return roots.at(-1) === key
  }
  return siblings.at(-1)?.key === key
}

/** Bold the first case-insensitive match of the search in a title. */
function Highlight({ text, query }: { text: string; query?: string }) {
  const q = query?.trim().toLowerCase()
  const at = q ? text.toLowerCase().indexOf(q) : -1
  if (!q || at === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-sm bg-warning/30 text-foreground">{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  )
}
