export type ComboboxOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
  /** Options with the same `group` are listed under that heading. */
  group?: string
}

/** Texts inside the dropdown; override to translate. */
export type ComboboxLabels = {
  selectAll: string
  /** Trigger text with `tagMode: "count"`. */
  selected: (count: number) => string
  create: (query: string) => string
  loading: string
  clear: string
}

export const DEFAULT_COMBOBOX_LABELS: ComboboxLabels = {
  selectAll: "Select all",
  selected: (count) => `${count} selected`,
  create: (query) => `Create "${query}"`,
  loading: "Loading…",
  clear: "Clear",
}

/** Lower-case and strip accents, so "ha noi" finds "Hà Nội". */
export const normalizeText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()

/** Options whose label, value or description contains `query` (accent-insensitive). */
export function filterOptions(options: ComboboxOption[], query: string) {
  const q = normalizeText(query)
  if (!q) return options
  return options.filter((option) =>
    [option.label, option.value, option.description ?? ""].some((text) => normalizeText(text).includes(q))
  )
}

export type ComboboxRow =
  | { kind: "group"; label: string }
  | { kind: "option"; option: ComboboxOption; index: number }

/** Flat list for rendering: group headings followed by their options (order of first appearance). */
export function toRows(options: ComboboxOption[]): ComboboxRow[] {
  const groups = new Map<string, ComboboxOption[]>()
  for (const option of options) {
    const key = option.group ?? ""
    groups.set(key, [...(groups.get(key) ?? []), option])
  }
  const rows: ComboboxRow[] = []
  let index = 0
  for (const [group, items] of groups) {
    if (group) rows.push({ kind: "group", label: group })
    for (const option of items) rows.push({ kind: "option", option, index: index++ })
  }
  return rows
}

/** Next enabled index from `from` in `direction` (wraps around), or -1. */
export function moveActive(options: { disabled?: boolean }[], from: number, direction: 1 | -1) {
  const count = options.length
  for (let step = 1; step <= count; step++) {
    const index = (((from + direction * step) % count) + count) % count
    if (!options[index]?.disabled) return index
  }
  return -1
}
