import type { ColumnDef, HeaderContext } from '@tanstack/vue-table'
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

export function selectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: 'select',
    size: 40,
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-10', fixedWidth: true },
    header: ({ table }) =>
      h(Checkbox, {
        'aria-label': 'Select all rows on this page',
        'modelValue': table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate'),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(value === true),
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        'aria-label': 'Select row',
        'modelValue': row.getIsSelected(),
        'disabled': !row.getCanSelect(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(value === true),
      }),
  }
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
    meta: { className: cn('w-px whitespace-nowrap text-right', pinned && pinnedRightClass), fixedWidth: true },
    header: () => h('span', { class: 'sr-only' }, 'Actions'),
    cell: ({ row }) =>
      h(DataTableRowActions as Component, { row: row.original, actions: rowActions(row.original), display }),
  }
}
