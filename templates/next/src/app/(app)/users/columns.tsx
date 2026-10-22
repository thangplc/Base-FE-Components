"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { CopyIcon, PencilIcon, ShieldCheckIcon, ShieldOffIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { sortableHeader, type DataTableFilter, type RowAction } from "@/components/common/data-table"
import { Badge } from "@/components/ui/badge"
import type { User } from "./data"

const statusVariant = {
  active: "default",
  invited: "secondary",
  suspended: "destructive",
} as const

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB")
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })

// Every column has its own id (accessorKey): ids are used as React keys,
// sorting / filter / visibility state, so they must be unique.
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: sortableHeader("Name"),
    meta: { label: "Name" },
    size: 160,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "email",
    header: sortableHeader("Email"),
    meta: { label: "Email" },
    size: 240,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
  },
  { accessorKey: "phone", header: "Phone", meta: { label: "Phone" }, size: 150 },
  {
    accessorKey: "role",
    header: sortableHeader("Role"),
    meta: { label: "Role" },
    size: 100,
    cell: ({ row }) => <span className="capitalize">{row.original.role}</span>,
  },
  {
    accessorKey: "status",
    header: sortableHeader("Status"),
    meta: { label: "Status", fixedWidth: true },
    size: 110,
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: "company", header: sortableHeader("Company"), meta: { label: "Company" }, size: 200 },
  { accessorKey: "department", header: sortableHeader("Department"), meta: { label: "Department" }, size: 140 },
  { accessorKey: "jobTitle", header: "Job title", meta: { label: "Job title" }, size: 190 },
  { accessorKey: "city", header: sortableHeader("City"), meta: { label: "City" }, size: 150 },
  { accessorKey: "country", header: sortableHeader("Country"), meta: { label: "Country" }, size: 140 },
  {
    accessorKey: "plan",
    header: sortableHeader("Plan"),
    meta: { label: "Plan", fixedWidth: true },
    size: 110,
    cell: ({ row }) => (
      <Badge variant={row.original.plan === "free" ? "outline" : "secondary"} className="capitalize">
        {row.original.plan}
      </Badge>
    ),
  },
  {
    accessorKey: "twoFactor",
    header: "2FA",
    meta: { label: "2FA", fixedWidth: true },
    size: 80,
    enableGlobalFilter: false,
    cell: ({ row }) =>
      row.original.twoFactor ? (
        <ShieldCheckIcon className="size-4 text-success" aria-label="Enabled" />
      ) : (
        <ShieldOffIcon className="size-4 text-muted-foreground" aria-label="Disabled" />
      ),
  },
  {
    accessorKey: "storageMb",
    header: sortableHeader("Storage"),
    meta: { label: "Storage", className: "text-right", fixedWidth: true },
    size: 110,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <span className="tabular-nums">{(row.original.storageMb / 1024).toFixed(1)} GB</span>
    ),
  },
  {
    accessorKey: "logins",
    header: sortableHeader("Logins"),
    meta: { label: "Logins", className: "text-right", fixedWidth: true },
    size: 100,
    enableGlobalFilter: false,
    cell: ({ row }) => <span className="tabular-nums">{row.original.logins}</span>,
  },
  {
    accessorKey: "lastLoginAt",
    header: sortableHeader("Last login"),
    meta: { label: "Last login", fixedWidth: true },
    size: 150,
    enableGlobalFilter: false,
    cell: ({ row }) => formatDateTime(row.original.lastLoginAt),
  },
  { accessorKey: "timezone", header: "Timezone", meta: { label: "Timezone" }, size: 170 },
  {
    accessorKey: "createdAt",
    header: sortableHeader("Created"),
    meta: { label: "Created", fixedWidth: true },
    size: 120,
    cell: ({ row }) => formatDate(row.original.createdAt),
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
