import type { ColumnDef } from '@tanstack/vue-table'
import type { DataTableFilter } from '@/components/common/data-table/types'
import { CheckCircle2Icon, CircleDashedIcon, XCircleIcon } from '@lucide/vue'
import { h } from 'vue'
import { sortableHeader } from '@/components/common/data-table/helpers'
import { Badge } from '@/components/ui/badge'

/** Mock data shared by the DataTable stories. */
export interface Payment {
  id: string
  customer: string
  email: string
  status: 'paid' | 'pending' | 'failed'
  method: 'card' | 'bank' | 'paypal'
  amount: number
  createdAt: string
}

const customers = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark', 'Wayne', 'Wonka']
const statuses: Payment['status'][] = ['paid', 'pending', 'failed']
const methods: Payment['method'][] = ['card', 'bank', 'paypal']

export function makePayments(count: number): Payment[] {
  return Array.from({ length: count }, (_, i) => {
    const customer = customers[i % customers.length]!
    return {
      id: `PAY-${String(i + 1).padStart(4, '0')}`,
      customer: `${customer} ${Math.floor(i / customers.length) + 1}`,
      email: `billing${i}@${customer.toLowerCase()}.com`,
      status: statuses[(i * 7) % 3]!,
      method: methods[(i * 5) % 3]!,
      amount: ((i * 137) % 990) + 10,
      createdAt: new Date(Date.UTC(2026, i % 10, (i % 27) + 1)).toISOString(),
    }
  })
}

export const payments = makePayments(64)

const statusVariant = { paid: 'default', pending: 'secondary', failed: 'destructive' } as const

export const paymentColumns: ColumnDef<Payment>[] = [
  { accessorKey: 'id', header: sortableHeader('Invoice'), meta: { label: 'Invoice' }, size: 120 },
  { accessorKey: 'customer', header: sortableHeader('Customer'), meta: { label: 'Customer' }, size: 160 },
  {
    accessorKey: 'email',
    header: 'Email',
    size: 240,
    cell: ({ row }) => h('span', { class: 'text-muted-foreground' }, row.original.email),
  },
  {
    accessorKey: 'status',
    header: sortableHeader('Status'),
    meta: { label: 'Status' },
    size: 120,
    cell: ({ row }) =>
      h(Badge, { variant: statusVariant[row.original.status], class: 'capitalize' }, () => row.original.status),
  },
  {
    accessorKey: 'method',
    header: 'Method',
    size: 110,
    cell: ({ row }) => h('span', { class: 'capitalize' }, row.original.method),
  },
  {
    accessorKey: 'amount',
    header: sortableHeader('Amount'),
    meta: { label: 'Amount', className: 'text-right' },
    size: 120,
    cell: ({ row }) => h('span', { class: 'tabular-nums' }, `$${row.original.amount.toFixed(2)}`),
  },
  {
    accessorKey: 'createdAt',
    header: sortableHeader('Created'),
    meta: { label: 'Created' },
    size: 130,
    enableGlobalFilter: false,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('en-GB'),
  },
]

export const paymentFilters: DataTableFilter[] = [
  {
    columnId: 'status',
    title: 'Status',
    type: 'multi-select',
    options: [
      { label: 'Paid', value: 'paid', icon: CheckCircle2Icon },
      { label: 'Pending', value: 'pending', icon: CircleDashedIcon },
      { label: 'Failed', value: 'failed', icon: XCircleIcon },
    ],
  },
  {
    columnId: 'method',
    title: 'Method',
    type: 'select',
    options: [
      { label: 'Card', value: 'card' },
      { label: 'Bank', value: 'bank' },
      { label: 'PayPal', value: 'paypal' },
    ],
  },
  { columnId: 'amount', title: 'Amount', type: 'number-range' },
  { columnId: 'createdAt', title: 'Created', type: 'date-range' },
]
