import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Badge } from '@/components/ui/badge'
import DataTable from './DataTable.vue'
import { sortableHeader } from './helpers'

interface Invoice { id: string, customer: string, amount: number, status: 'paid' | 'pending' }

const invoices: Invoice[] = Array.from({ length: 23 }, (_, i) => ({
  id: `INV-${String(i + 1).padStart(4, '0')}`,
  customer: ['Acme', 'Globex', 'Initech', 'Umbrella'][i % 4]!,
  amount: ((i * 37) % 500) + 50,
  status: i % 3 === 0 ? 'pending' : 'paid',
}))

const columns: ColumnDef<Invoice>[] = [
  { accessorKey: 'id', header: sortableHeader('Invoice') },
  { accessorKey: 'customer', header: sortableHeader('Customer') },
  {
    accessorKey: 'amount',
    header: sortableHeader('Amount'),
    cell: ({ row }) => `$${row.original.amount.toFixed(2)}`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(Badge, { variant: row.original.status === 'paid' ? 'default' : 'secondary' }, () => row.original.status),
  },
]

const meta = {
  title: 'Common/DataTable',
  parameters: { layout: 'padded' },
  args: {
    columns,
    data: invoices,
    searchPlaceholder: 'Search invoices...',
    pageSize: 5,
    emptyMessage: 'No results.',
  },
  render: args => ({
    components: { DataTable },
    setup: () => ({ args }),
    template: '<DataTable v-bind="args" />',
  }),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: { data: [], emptyMessage: 'No invoices found.' },
}
