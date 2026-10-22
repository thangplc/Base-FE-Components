import type { ColumnDef } from '@tanstack/vue-table'
import type { User } from './data'
import type { DataTableFilter, RowAction } from '@/components/common/data-table/types'
import { CopyIcon, PencilIcon, Trash2Icon } from '@lucide/vue'
import { h } from 'vue'
import { toast } from 'vue-sonner'
import { sortableHeader } from '@/components/common/data-table/helpers'
import { Badge } from '@/components/ui/badge'

const statusVariant = {
  active: 'default',
  invited: 'secondary',
  suspended: 'destructive',
} as const

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: sortableHeader('Name'),
    meta: { label: 'Name' },
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.original.name),
  },
  {
    accessorKey: 'email',
    header: sortableHeader('Email'),
    meta: { label: 'Email' },
    cell: ({ row }) => h('span', { class: 'text-muted-foreground' }, row.original.email),
  },
  {
    accessorKey: 'role',
    header: sortableHeader('Role'),
    meta: { label: 'Role' },
    cell: ({ row }) => h('span', { class: 'capitalize' }, row.original.role),
  },
  {
    accessorKey: 'status',
    header: sortableHeader('Status'),
    meta: { label: 'Status' },
    cell: ({ row }) =>
      h(Badge, { variant: statusVariant[row.original.status], class: 'capitalize' }, () => row.original.status),
  },
  {
    accessorKey: 'createdAt',
    header: sortableHeader('Created'),
    meta: { label: 'Created' },
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('en-GB'),
    enableGlobalFilter: false,
  },
]

export const filters: DataTableFilter[] = [
  {
    columnId: 'role',
    title: 'Role',
    type: 'multi-select',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'Editor', value: 'editor' },
      { label: 'Viewer', value: 'viewer' },
    ],
  },
  {
    columnId: 'status',
    title: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Invited', value: 'invited' },
      { label: 'Suspended', value: 'suspended' },
    ],
  },
  { columnId: 'createdAt', title: 'Created', type: 'date-range' },
]

export function rowActions(user: User): RowAction<User>[] {
  return [
    { label: 'Edit', icon: PencilIcon, onClick: () => toast(`Edit ${user.name}`) },
    {
      label: 'Copy ID',
      icon: CopyIcon,
      onClick: () => {
        navigator.clipboard.writeText(user.id)
        toast.success('ID copied')
      },
    },
    {
      label: 'Delete',
      icon: Trash2Icon,
      variant: 'destructive',
      confirm: { title: `Delete ${user.name}?`, description: 'This user will lose access immediately.' },
      onClick: () => {
        toast.success(`${user.name} deleted`)
      },
    },
  ]
}
