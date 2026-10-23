import { normalizeText } from '../combobox/combobox-utils'
import { indexTree, type TreeNodeBase } from '../tree/tree-utils'

export interface CascaderOption {
  value: string
  label: string
  children?: CascaderOption[]
  disabled?: boolean
  /** No children, not even lazily loaded ones. */
  isLeaf?: boolean
}

/** Joins a path into one key (a control character, so values may contain '/'). */
const SEP = '\u001F'
export const pathKey = (path: string[]) => path.join(SEP)
export const keyPath = (key: string) => key.split(SEP)

/** Options along `path` (stops at the first value it can't find). */
export function optionsAt(options: CascaderOption[], path: string[]): CascaderOption[] {
  const out: CascaderOption[] = []
  let level: CascaderOption[] | undefined = options
  for (const value of path) {
    const option: CascaderOption | undefined = level?.find((o) => o.value === value)
    if (!option) break
    out.push(option)
    level = option.children
  }
  return out
}

export const canExpand = (option: CascaderOption, lazy: boolean) =>
  !!option.children?.length || (lazy && !option.isLeaf && !option.children)

/** The options as a tree whose keys are paths, for the checkbox rules of tree-utils. */
export function toTree(options: CascaderOption[], parent: string[] = []): TreeNodeBase[] {
  return options.map((option) => {
    const path = [...parent, option.value]
    return {
      key: pathKey(path),
      title: option.label,
      disabled: option.disabled,
      children: option.children ? toTree(option.children, path) : undefined,
    }
  })
}

export const indexCascader = (options: CascaderOption[]) => indexTree(toTree(options))

export interface CascaderMatch { path: CascaderOption[], text: string }

/**
 * Search results: paths whose labels contain the query (accent-insensitive),
 * leaves only unless `includeParents` (changeOnSelect). Disabled branches are skipped.
 */
export function searchPaths(options: CascaderOption[], query: string, separator: string, includeParents: boolean) {
  const q = normalizeText(query)
  const out: CascaderMatch[] = []
  const walk = (level: CascaderOption[], parent: CascaderOption[]) => {
    for (const option of level) {
      if (option.disabled) continue
      const path = [...parent, option]
      const leaf = !option.children?.length
      const text = path.map((o) => o.label).join(separator)
      if ((leaf || includeParents) && normalizeText(text).includes(q)) out.push({ path, text })
      if (option.children) walk(option.children, path)
    }
  }
  walk(options, [])
  return out
}
