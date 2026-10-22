import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "./data-table"
import { DataTableColumnHeader } from "./data-table-column-header"

type Invoice = { id: string; customer: string; amount: number; status: "paid" | "pending" }

const invoices: Invoice[] = Array.from({ length: 23 }, (_, i) => ({
  id: `INV-${String(i + 1).padStart(4, "0")}`,
  customer: ["Acme", "Globex", "Initech", "Umbrella"][i % 4],
  amount: ((i * 37) % 500) + 50,
  status: i % 3 === 0 ? "pending" : "paid",
}))

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />,
  },
  {
    accessorKey: "customer",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => `$${row.original.amount.toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "paid" ? "default" : "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
]

const meta = {
  title: "Common/DataTable",
  component: DataTable<Invoice, unknown>,
  parameters: { layout: "padded" },
  args: {
    columns,
    data: invoices,
    searchPlaceholder: "Search invoices...",
    pageSize: 5,
  },
} satisfies Meta<typeof DataTable<Invoice, unknown>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: { data: [], emptyMessage: "No invoices found." },
}
