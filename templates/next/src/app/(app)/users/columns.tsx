"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { CopyIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { sortableHeader, type DataTableFilter, type RowAction } from "@/components/common/data-table"
import { Badge } from "@/components/ui/badge"
import type { User } from "./data"

const statusVariant = {
  active: "default",
  invited: "secondary",
  suspended: "destructive",
} as const

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: sortableHeader("Name"),
    meta: { label: "Name" },
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "email",
    header: sortableHeader("Email"),
    meta: { label: "Email" },
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
  },
  {
    accessorKey: "role",
    header: sortableHeader("Role"),
    meta: { label: "Role" },
    cell: ({ row }) => <span className="capitalize">{row.original.role}</span>,
  },
  {
    accessorKey: "status",
    header: sortableHeader("Status"),
    meta: { label: "Status" },
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: sortableHeader("Created"),
    meta: { label: "Created" },
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("en-GB"),
    enableGlobalFilter: false,
  },
]

export const filters: DataTableFilter[] = [
  {
    columnId: "role",
    title: "Role",
    type: "multi-select",
    options: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
    ],
  },
  {
    columnId: "status",
    title: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Invited", value: "invited" },
      { label: "Suspended", value: "suspended" },
    ],
  },
  { columnId: "createdAt", title: "Created", type: "date-range" },
]

export const rowActions = (user: User): RowAction<User>[] => [
  { label: "Edit", icon: PencilIcon, onClick: () => toast(`Edit ${user.name}`) },
  {
    label: "Copy ID",
    icon: CopyIcon,
    onClick: () => {
      navigator.clipboard.writeText(user.id)
      toast.success("ID copied")
    },
  },
  {
    label: "Delete",
    icon: Trash2Icon,
    variant: "destructive",
    confirm: { title: `Delete ${user.name}?`, description: "This user will lose access immediately." },
    onClick: () => {
      toast.success(`${user.name} deleted`)
    },
  },
]

// Functions passed from the (server) page must live in this client module.
export const getRowId = (user: User) => user.id
