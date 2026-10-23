"use client"

import { useEffect, useState, type ReactNode } from "react"
import type { Table } from "@tanstack/react-table"
import { GroupIcon, SearchIcon, Settings2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { DataTableFilterControl } from "./data-table-filter"
import type { DataTableFilter } from "./types"

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchDebounceMs?: number
  filters?: DataTableFilter[]
  enableColumnVisibility?: boolean
  actions?: ReactNode
  /** Rendered instead of the filters while rows are selected. */
  bulkActions?: (rows: TData[], helpers: { clear: () => void }) => ReactNode
  /** "Group by" menu for the groupable columns. */
  enableGrouping?: boolean
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder,
  searchDebounceMs = 300,
  filters,
  enableColumnVisibility = true,
  actions,
  bulkActions,
  enableGrouping = false,
}: DataTableToolbarProps<TData>) {
  "use no memo" // reads live TanStack table state

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)
  const isFiltered =
    table.getState().columnFilters.length > 0 || Boolean(table.getState().globalFilter)

  if (bulkActions && selectedRows.length > 0) {
    return (
      <div className="flex min-h-8 flex-wrap items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
        <span className="text-sm font-medium">{selectedRows.length} selected</span>
        <div className="flex flex-wrap items-center gap-2">
          {bulkActions(selectedRows, { clear: () => table.resetRowSelection() })}
        </div>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={() => table.resetRowSelection()}>
          <XIcon data-icon="inline-start" />
          Clear selection
        </Button>
      </div>
    )
  }

  // Leaf columns, so the children of grouped headers are listed too.
  const hideableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide() && column.accessorFn !== undefined)
  const groupableColumns = table.getAllLeafColumns().filter((column) => column.getCanGroup())
  const grouping = table.getState().grouping
  const columnLabel = (column: (typeof hideableColumns)[number]) =>
    column.columnDef.meta?.label ??
    (typeof column.columnDef.header === "string" ? column.columnDef.header : column.id)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {searchPlaceholder && (
        <SearchInput table={table} placeholder={searchPlaceholder} debounceMs={searchDebounceMs} />
      )}
      {filters?.map((filter) => {
        const column = table.getColumn(filter.columnId)
        return column ? <DataTableFilterControl key={filter.columnId} column={column} filter={filter} /> : null
      })}
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => {
            table.resetColumnFilters()
            table.setGlobalFilter("")
          }}
        >
          Reset
          <XIcon data-icon="inline-end" />
        </Button>
      )}
      <div className="ml-auto flex items-center gap-2">
        {enableGrouping && groupableColumns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <GroupIcon data-icon="inline-start" />
                Group{grouping.length > 0 && ` (${grouping.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Group by (in click order)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {groupableColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsGrouped()}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={() => column.toggleGrouping()}
                >
                  {columnLabel(column)}
                  {column.getIsGrouped() && (
                    <span className="ml-auto text-xs text-muted-foreground">{column.getGroupedIndex() + 1}</span>
                  )}
                </DropdownMenuCheckboxItem>
              ))}
              {grouping.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => table.resetGrouping(true)}>Clear grouping</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {enableColumnVisibility && hideableColumns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings2Icon data-icon="inline-start" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hideableColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {columnLabel(column)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {actions}
      </div>
    </div>
  )
}

function SearchInput<TData>({
  table,
  placeholder,
  debounceMs,
}: {
  table: Table<TData>
  placeholder: string
  debounceMs: number
}) {
  "use no memo"

  const applied = (table.getState().globalFilter as string | undefined) ?? ""
  const [text, setText] = useState(applied)
  const [lastApplied, setLastApplied] = useState(applied)

  // Follow external changes (Reset button, controlled `searchValue`).
  if (applied !== lastApplied) {
    setLastApplied(applied)
    setText(applied)
  }

  useEffect(() => {
    if (text === applied) return
    const timer = setTimeout(() => table.setGlobalFilter(text), debounceMs)
    return () => clearTimeout(timer)
  }, [text, applied, debounceMs, table])

  return (
    <InputGroup className="w-full sm:max-w-xs">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      {text && (
        <InputGroupAddon align="inline-end">
          <Button variant="ghost" size="icon-xs" aria-label="Clear search" onClick={() => setText("")}>
            <XIcon />
          </Button>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
