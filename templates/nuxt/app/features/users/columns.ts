import type { ColumnDef } from '@tanstack/vue-table'
import type { User } from './data'
import type { DataTableFilter, RowAction } from '@/components/common/data-table/types'
import { CopyIcon, PencilIcon, ShieldCheckIcon, ShieldOffIcon, Trash2Icon } from '@lucide/vue'
import { h } from 'vue'
import { toast } from 'vue-sonner'
import { sortableHeader } from '@/components/common/data-table/helpers'
import { Badge } from '@/components/ui/badge'

const statusVariant = {
  active: 'default',
  invited: 'secondary',
  suspended: 'destructive',
} as const

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB')
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
}

// Every column has its own id (accessorKey): ids are used as v-for keys,
// sorting / filter / visibility state, so they must be unique.
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: sortableHeader('Name'),
    meta: { label: 'Name' },
    size: 160,
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.original.name),
  },
  {
    accessorKey: 'email',
    header: sortableHeader('Email'),
    meta: { label: 'Email' },
    size: 240,
    cell: ({ row }) => h('span', { class: 'text-muted-foreground' }, row.original.email),
  },
  { accessorKey: 'phone', header: 'Phone', meta: { label: 'Phone' }, size: 150 },
  {
    accessorKey: 'role',
    header: sortableHeader('Role'),
    meta: { label: 'Role' },
    size: 100,
    cell: ({ row }) => h('span', { class: 'capitalize' }, row.original.role),
  },
  {
    accessorKey: 'status',
    header: sortableHeader('Status'),
    meta: { label: 'Status', fixedWidth: true },
    size: 110,
    cell: ({ row }) =>
      h(Badge, { variant: statusVariant[row.original.status], class: 'capitalize' }, () => row.original.status),
  },
  { accessorKey: 'company', header: sortableHeader('Company'), meta: { label: 'Company' }, size: 200 },
  { accessorKey: 'department', header: sortableHeader('Department'), meta: { label: 'Department' }, size: 140 },
  { accessorKey: 'jobTitle', header: 'Job title', meta: { label: 'Job title' }, size: 190 },
  { accessorKey: 'city', header: sortableHeader('City'), meta: { label: 'City' }, size: 150 },
  { accessorKey: 'country', header: sortableHeader('Country'), meta: { label: 'Country' }, size: 140 },
  {
    accessorKey: 'plan',
    header: sortableHeader('Plan'),
    meta: { label: 'Plan', fixedWidth: true },
    size: 110,
    cell: ({ row }) =>
      h(Badge, { variant: row.original.plan === 'free' ? 'outline' : 'secondary', class: 'capitalize' }, () => row.original.plan),
  },
  {
    accessorKey: 'twoFactor',
    header: '2FA',
    meta: { label: '2FA', fixedWidth: true },
    size: 80,
    enableGlobalFilter: false,
    cell: ({ row }) => row.original.twoFactor
      ? h(ShieldCheckIcon, { 'class': 'size-4 text-success', 'aria-label': 'Enabled' })
      : h(ShieldOffIcon, { 'class': 'size-4 text-muted-foreground', 'aria-label': 'Disabled' }),
  },
  {
    accessorKey: 'storageMb',
    header: sortableHeader('Storage'),
    meta: { label: 'Storage', className: 'text-right', fixedWidth: true },
    size: 110,
    enableGlobalFilter: false,
    cell: ({ row }) => h('span', { class: 'tabular-nums' }, `${(row.original.storageMb / 1024).toFixed(1)} GB`),
  },
  {
    accessorKey: 'logins',
    header: sortableHeader('Logins'),
    meta: { label: 'Logins', className: 'text-right', fixedWidth: true },
    size: 100,
    enableGlobalFilter: false,
    cell: ({ row }) => h('span', { class: 'tabular-nums' }, row.original.logins),
  },
  {
    accessorKey: 'lastLoginAt',
    header: sortableHeader('Last login'),
    meta: { label: 'Last login', fixedWidth: true },
    size: 150,
    enableGlobalFilter: false,
    cell: ({ row }) => formatDateTime(row.original.lastLoginAt),
  },
  { accessorKey: 'timezone', header: 'Timezone', meta: { label: 'Timezone' }, size: 170 },
  {
    accessorKey: 'createdAt',
    header: sortableHeader('Created'),
    meta: { label: 'Created', fixedWidth: true },
    size: 120,
    cell: ({ row }) => formatDate(row.original.createdAt),
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
