import { normalizeText } from "../combobox/combobox-utils"

/** Fields the tree logic needs; the components add `icon`. */
export type TreeNodeBase = {
  key: string
  title: string
  children?: TreeNodeBase[]
  disabled?: boolean
  /** Hide this node's checkbox (it still counts for its parent). */
  disableCheckbox?: boolean
  /** Can't be selected (clicking only expands). */
  selectable?: boolean
  /** No children, not even lazily loaded ones. */
  isLeaf?: boolean
}

export type DropPosition = "before" | "after" | "inside"

export type TreeIndex<T extends TreeNodeBase> = {
  nodes: Map<string, T>
  parent: Map<string, string | undefined>
  /** Keys in tree order (depth first). */
  order: string[]
}

/** Lookups for a tree: node by key, parent of each key, depth-first order. */
export function indexTree<T extends TreeNodeBase>(tree: T[]): TreeIndex<T> {
  const index: TreeIndex<T> = { nodes: new Map(), parent: new Map(), order: [] }
  const walk = (nodes: T[], parent?: string) => {
    for (const node of nodes) {
      index.nodes.set(node.key, node)
      index.parent.set(node.key, parent)
      index.order.push(node.key)
      if (node.children) walk(node.children as T[], node.key)
    }
  }
  walk(tree)
  return index
}

export const hasChildren = (node: TreeNodeBase) => !!node.children?.length

/** Every descendant key of `key` (not including it). */
export function descendantsOf<T extends TreeNodeBase>(key: string, index: TreeIndex<T>): string[] {
  const out: string[] = []
  const walk = (node: TreeNodeBase) => {
    for (const child of node.children ?? []) {
      out.push(child.key)
      walk(child)
    }
  }
  const node = index.nodes.get(key)
  if (node) walk(node)
  return out
}

export function ancestorsOf<T extends TreeNodeBase>(key: string, index: TreeIndex<T>): string[] {
  const out: string[] = []
  let parent = index.parent.get(key)
  while (parent !== undefined) {
    out.push(parent)
    parent = index.parent.get(parent)
  }
  return out
}

export type VisibleRow<T extends TreeNodeBase> = {
  node: T
  depth: number
  expanded: boolean
  /** Is this the last child of its parent (for the guide lines)? */
  isLast: boolean
}

/** Rows to render: nodes whose ancestors are all expanded, filtered by `visible` when searching. */
export function visibleRows<T extends TreeNodeBase>(
  tree: T[],
  expanded: Set<string>,
  visible?: Set<string>
): VisibleRow<T>[] {
  const rows: VisibleRow<T>[] = []
  const walk = (nodes: T[], depth: number) => {
    const shown = visible ? nodes.filter((node) => visible.has(node.key)) : nodes
    shown.forEach((node, i) => {
      const isExpanded = expanded.has(node.key)
      rows.push({ node, depth, expanded: isExpanded, isLast: i === shown.length - 1 })
      if (isExpanded && node.children) walk(node.children as T[], depth + 1)
    })
  }
  walk(tree, 0)
  return rows
}

const checkable = (node: TreeNodeBase | undefined) => !!node && !node.disabled && !node.disableCheckbox

/**
 * Checked keys after the parent ↔ child rules: a checked node checks all its
 * (enabled) descendants, and a parent whose children are all checked is
 * checked too. Disabled nodes keep their state.
 */
export function conductChecked<T extends TreeNodeBase>(keys: Iterable<string>, index: TreeIndex<T>): Set<string> {
  const checked = new Set<string>()
  for (const key of keys) {
    if (!index.nodes.has(key)) continue
    checked.add(key)
    for (const child of descendantsOf(key, index)) if (checkable(index.nodes.get(child))) checked.add(child)
  }
  // Bottom-up: a parent is checked when every checkable child is.
  for (const key of [...index.order].reverse()) {
    const node = index.nodes.get(key)!
    const children = (node.children ?? []).filter(checkable)
    if (children.length && children.every((child) => checked.has(child.key))) checked.add(key)
  }
  return checked
}

/** Toggle one node with the parent ↔ child rules; returns the new checked set. */
export function toggleChecked<T extends TreeNodeBase>(
  key: string,
  checked: Set<string>,
  index: TreeIndex<T>,
  strictly = false
): Set<string> {
  const next = new Set(checked)
  const on = !checked.has(key)
  if (strictly) {
    if (on) next.add(key)
    else next.delete(key)
    return next
  }
  const affected = [key, ...descendantsOf(key, index).filter((k) => checkable(index.nodes.get(k)))]
  for (const k of affected) {
    if (on) next.add(k)
    else next.delete(k)
  }
  // Re-evaluate the ancestors from the closest one up.
  for (const ancestor of ancestorsOf(key, index)) {
    const children = (index.nodes.get(ancestor)!.children ?? []).filter(checkable)
    if (children.length && children.every((child) => next.has(child.key))) next.add(ancestor)
    else next.delete(ancestor)
  }
  return next
}

/** Not checked, but with a checked descendant: shown with a dash. */
export function halfCheckedOf<T extends TreeNodeBase>(checked: Set<string>, index: TreeIndex<T>): Set<string> {
  const half = new Set<string>()
  for (const key of checked) for (const ancestor of ancestorsOf(key, index)) if (!checked.has(ancestor)) half.add(ancestor)
  return half
}

/**
 * Which checked keys make up the value:
 * - "all": every checked key
 * - "parent": a fully checked parent stands for its children
 * - "child": leaves only
 */
export function applyCheckedStrategy<T extends TreeNodeBase>(
  checked: Set<string>,
  index: TreeIndex<T>,
  strategy: "all" | "parent" | "child"
): string[] {
  const keys = index.order.filter((key) => checked.has(key))
  if (strategy === "parent") return keys.filter((key) => !ancestorsOf(key, index).some((a) => checked.has(a)))
  if (strategy === "child") return keys.filter((key) => !hasChildren(index.nodes.get(key)!))
  return keys
}

/**
 * Search: nodes matching `query` (title, accent-insensitive, or a custom
 * test) plus their ancestors are visible; the ancestors are expanded.
 */
export function filterTree<T extends TreeNodeBase>(
  index: TreeIndex<T>,
  query: string,
  match: (node: T, query: string) => boolean = (node, q) => normalizeText(node.title).includes(normalizeText(q))
) {
  const visible = new Set<string>()
  const expand = new Set<string>()
  for (const key of index.order) {
    const node = index.nodes.get(key)!
    if (!match(node, query)) continue
    visible.add(key)
    for (const ancestor of ancestorsOf(key, index)) {
      visible.add(ancestor)
      expand.add(ancestor)
    }
  }
  return { visible, expand }
}

/** A copy of the tree with `dragKey` moved before / after / inside `dropKey`. */
export function moveNode<T extends TreeNodeBase>(tree: T[], dragKey: string, dropKey: string, position: DropPosition): T[] {
  if (dragKey === dropKey) return tree
  let dragged: T | undefined
  const remove = (nodes: T[]): T[] =>
    nodes.flatMap((node) => {
      if (node.key === dragKey) {
        dragged = node
        return []
      }
      return node.children ? [{ ...node, children: remove(node.children as T[]) }] : [node]
    })
  const without = remove(tree)
  if (!dragged) return tree
  const insert = (nodes: T[]): T[] =>
    nodes.flatMap((node) => {
      if (node.key === dropKey) {
        if (position === "inside") return [{ ...node, children: [...((node.children as T[]) ?? []), dragged!] }]
        return position === "before" ? [dragged!, node] : [node, dragged!]
      }
      return node.children ? [{ ...node, children: insert(node.children as T[]) }] : [node]
    })
  return insert(without)
}

/** Can `dragKey` go to `dropKey` at all (not into itself or its own subtree)? */
export const canDropOn = <T extends TreeNodeBase>(dragKey: string, dropKey: string, index: TreeIndex<T>) =>
  dragKey !== dropKey && !descendantsOf(dragKey, index).includes(dropKey)

/** Drop position from the pointer's height inside the row: top / bottom quarter, else inside. */
export function dropPositionAt(offsetY: number, height: number): DropPosition {
  if (offsetY < height * 0.25) return "before"
  if (offsetY > height * 0.75) return "after"
  return "inside"
}
