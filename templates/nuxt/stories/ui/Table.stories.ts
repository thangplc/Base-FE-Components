import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const invoices = [
  { id: 'INV001', status: 'Paid', method: 'Credit Card', amount: 250 },
  { id: 'INV002', status: 'Pending', method: 'PayPal', amount: 150 },
  { id: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: 350 },
  { id: 'INV004', status: 'Paid', method: 'Credit Card', amount: 450 },
]

const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    docs: {
      description: { component: 'Static table markup. For sorting / search / pagination use Common/DataTable.' },
    },
  },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow },
    setup: () => ({ invoices, total: invoices.reduce((sum, i) => sum + i.amount, 0) }),
    template: `
      <Table class="w-[32rem]">
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead class="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="invoice in invoices" :key="invoice.id">
            <TableCell class="font-medium">{{ invoice.id }}</TableCell>
            <TableCell>{{ invoice.status }}</TableCell>
            <TableCell>{{ invoice.method }}</TableCell>
            <TableCell class="text-right">\${{ invoice.amount.toFixed(2) }}</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell :colspan="3">Total</TableCell>
            <TableCell class="text-right">\${{ total.toFixed(2) }}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    `,
  }),
}
