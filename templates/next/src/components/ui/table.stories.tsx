import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

const invoices = [
  { id: "INV001", status: "Paid", method: "Credit Card", amount: 250 },
  { id: "INV002", status: "Pending", method: "PayPal", amount: 150 },
  { id: "INV003", status: "Unpaid", method: "Bank Transfer", amount: 350 },
  { id: "INV004", status: "Paid", method: "Credit Card", amount: 450 },
]

const meta = {
  title: "UI/Table",
  component: Table,
  parameters: {
    docs: {
      description: {
        component: "Static table markup. For sorting / search / pagination use Common/DataTable.",
      },
    },
  },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Table className="w-[32rem]">
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">${invoice.amount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">
            ${invoices.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}
