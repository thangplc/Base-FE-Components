import type { HeaderContext } from '@tanstack/vue-table'
import type { Component } from 'vue'
import { h } from 'vue'
import DataTableColumnHeader from './DataTableColumnHeader.vue'

/** Column `header` renderer with a sort toggle: `header: sortableHeader('Name')`. */
export function sortableHeader<TData, TValue = unknown>(title: string) {
  // Generic SFCs lose their type params through h(), so widen once here.
  return ({ column }: HeaderContext<TData, TValue>) =>
    h(DataTableColumnHeader as Component, { column, title })
}
