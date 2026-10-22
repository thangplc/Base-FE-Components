import type { ColumnDef } from '@tanstack/vue-table'
import type { User } from './data'
import { h } from 'vue'
import { sortableHeader } from '@/components/common/data-table/helpers'
import { Badge } from '@/components/ui/badge'
import UserRowActions from './UserRowActions.vue'

const statusVariant = {
  active: 'default',
  invited: 'secondary',
  suspended: 'destructive',
} as const

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: sortableHeader('Name'),
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.original.name),
  },
  {
    accessorKey: 'email',
    header: sortableHeader('Email'),
    cell: ({ row }) => h('span', { class: 'text-muted-foreground' }, row.original.email),
  },
  {
    accessorKey: 'role',
    header: sortableHeader('Role'),
    cell: ({ row }) => h('span', { class: 'capitalize' }, row.original.role),
  },
  {
    accessorKey: 'status',
    header: sortableHeader('Status'),
    cell: ({ row }) =>
      h(Badge, { variant: statusVariant[row.original.status], class: 'capitalize' }, () => row.original.status),
  },
  {
    accessorKey: 'createdAt',
    header: sortableHeader('Created'),
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('en-GB'),
    enableGlobalFilter: false,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => h(UserRowActions, { user: row.original }),
  },
]
