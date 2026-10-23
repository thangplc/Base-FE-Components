import type { Column, ColumnDef, Header, HeaderContext, Row, Table } from '@tanstack/vue-table'
import type { Component } from 'vue'
import type { RowAction, RowActionDisplay } from './types'
import { h } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

/** Column `header` renderer with a sort toggle: `header: sortableHeader('Name')`. */
export function sortableHeader<TData, TValue = unknown>(title: string) {
  // Generic SFCs lose their type params through h(), so widen once here.
  return ({ column }: HeaderContext<TData, TValue>) =>
    h(DataTableColumnHeader as Component, { column, title })
}

export function selectionColumn<TData>(
  type: 'checkbox' | 'radio',
  selectAllMode: 'page' | 'all',
  pinned: boolean,
): ColumnDef<TData> {
  return {
    id: 'select',
    size: 40,
    enableSorting: false,
    enableHiding: false,
    enableGrouping: false,
    meta: { className: cn('w-10', pinned && pinnedLeftClass), fixedWidth: true, overflow: 'visible' },
    header: ({ table }) => {
      if (type === 'radio')
        return h('span', { class: 'sr-only' }, 'Select')
      const all = selectAllMode === 'all'
      return h(Checkbox, {
        'aria-label': all ? 'Select all rows' : 'Select all rows on this page',
        'modelValue': all
          ? table.getIsAllRowsSelected() || (table.getIsSomeRowsSelected() && 'indeterminate')
          : table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate'),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          all ? table.toggleAllRowsSelected(value === true) : table.toggleAllPageRowsSelected(value === true),
      })
    },
    cell: ({ row }) => {
      if (type === 'radio') {
        if (row.getIsGrouped())
          return null
        return h('button', {
          'type': 'button',
          'role': 'radio',
          'aria-label': 'Select row',
          'aria-checked': row.getIsSelected(),
          'disabled': !row.getCanSelect(),
          'class': 'flex size-4 items-center justify-center rounded-full border border-input outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-checked:border-primary',
          'onClick': () => row.toggleSelected(true),
        }, row.getIsSelected() ? [h('span', { class: 'size-2 rounded-full bg-primary' })] : [])
      }
      // Group rows: checked when all children are, a dash when some are.
      return h(Checkbox, {
        'aria-label': row.getIsGrouped() ? 'Select group' : 'Select row',
        'modelValue': row.getIsGrouped()
          ? row.getIsAllSubRowsSelected() || (row.getIsSomeSelected() && 'indeterminate')
          : row.getIsSelected(),
        'disabled': !row.getCanSelect(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(value === true),
      })
    },
  }
}

// Mirror of pinnedRightClass for the checkbox column (divider on its right).
const pinnedLeftClass = [
  'group-data-[overflow-x=true]/table:sticky',
  'group-data-[overflow-x=true]/table:left-0',
  'group-data-[overflow-x=true]/table:z-[1]',
  'group-data-[overflow-x=true]/table:bg-background',
  'group-data-[overflow-x=true]/table:shadow-[inset_-1px_0_0_var(--border)]',
  'group-data-[overflow-x=true]/table:group-hover/row:bg-[color-mix(in_oklch,var(--muted)_50%,var(--background))]',
  'group-data-[overflow-x=true]/table:group-data-[state=selected]/row:bg-muted',
].join(' ')

export interface HeaderCell<TData> {
  key: string
  /** The header to render (a placeholder above is replaced by the real one below). */
  header: Header<TData, unknown>
  colSpan: number
  rowSpan: number
  isGroup: boolean
  atRightEdge: boolean
}

/**
 * Header rows for grouped column defs (`columns: [...]`): group headers
 * span their children (colSpan, centered); a column without a group above
 * it spans the empty rows instead of leaving holes (rowSpan).
 */
export function headerLayout<TData>(table: Table<TData>): HeaderCell<TData>[][] {
  const groups = table.getHeaderGroups()
  const rendered = new Set<string>()
  const lastColumnId = table.getVisibleLeafColumns().at(-1)?.id
  return groups.map((group, depth) => group.headers.flatMap((header) => {
    if (rendered.has(header.column.id))
      return []
    rendered.add(header.column.id)
    // Rows further down where this column shows again (as a placeholder or for real).
    let rowSpan = 1
    let real = header
    for (const below of groups.slice(depth + 1)) {
      const same = below.headers.find(h => h.column.id === header.column.id)
      if (!same)
        break
      rowSpan++
      if (!same.isPlaceholder)
        real = same
    }
    return [{
      key: header.id,
      header: real,
      colSpan: header.colSpan,
      rowSpan,
      isGroup: real.subHeaders.length > 0 && !real.isPlaceholder,
      atRightEdge: header.getLeafHeaders().at(-1)?.column.id === lastColumnId,
    }]
  }))
}

/**
 * rowSpan of each body cell for columns with `meta.mergeRows`, keyed
 * `${rowId}:${columnId}`: n on the first row of a run of equal values, 0 on
 * the rows it covers. A merged column only merges inside the runs of the
 * merged columns before it.
 */
export function mergedRowSpans<TData>(rows: Row<TData>[], columns: Column<TData, unknown>[]) {
  const merged = columns.filter(column => column.columnDef.meta?.mergeRows)
  if (!merged.length || !rows.length)
    return undefined
  const spans = new Map<string, number>()
  const breaks = new Set<number>([0])
  for (const column of merged) {
    let start = 0
    const value = (i: number) => rows[i]!.getValue(column.id)
    for (let i = 1; i <= rows.length; i++) {
      if (i < rows.length && !breaks.has(i) && Object.is(value(i), value(start)))
        continue
      spans.set(`${rows[start]!.id}:${column.id}`, i - start)
      for (let j = start + 1; j < i; j++)
        spans.set(`${rows[j]!.id}:${column.id}`, 0)
      breaks.add(i)
      start = i
    }
  }
  return spans
}

// Only while the table overflows horizontally (data-overflow-x on the
// wrapper): stick to the right with a divider, in colors that match
// TableRow's hover / selected states but opaque, so content scrolling
// underneath stays hidden. Otherwise it is a plain column.
const pinnedRightClass = [
  'group-data-[overflow-x=true]/table:sticky',
  'group-data-[overflow-x=true]/table:right-0',
  'group-data-[overflow-x=true]/table:z-[1]',
  'group-data-[overflow-x=true]/table:bg-background',
  'group-data-[overflow-x=true]/table:shadow-[inset_1px_0_0_var(--border)]',
  'group-data-[overflow-x=true]/table:group-hover/row:bg-[color-mix(in_oklch,var(--muted)_50%,var(--background))]',
  'group-data-[overflow-x=true]/table:group-data-[state=selected]/row:bg-muted',
].join(' ')

export function actionsColumn<TData>(
  rowActions: (row: TData) => RowAction<TData>[],
  display: RowActionDisplay,
  size: number,
  pinned: boolean,
): ColumnDef<TData> {
  return {
    id: 'actions',
    size,
    enableSorting: false,
    enableHiding: false,
    // w-px: shrink to the buttons in the auto layout (no maxBodyHeight).
    meta: {
      className: cn('w-px whitespace-nowrap text-right', pinned && pinnedRightClass),
      fixedWidth: true,
      overflow: 'visible',
    },
    header: () => h('span', { class: 'sr-only' }, 'Actions'),
    cell: ({ row }) =>
      h(DataTableRowActions as Component, { row: row.original, actions: rowActions(row.original), display }),
  }
}
