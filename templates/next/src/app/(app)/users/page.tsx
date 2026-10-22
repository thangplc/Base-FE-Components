import { PlusIcon } from "lucide-react"

import { DataTable } from "@/components/common/data-table"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { columns, filters, getRowId, rowActions } from "./columns"
import { users } from "./data"

export default function UsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        description="DataTable with search, sorting, filters, row actions and pagination."
      />
      <DataTable
        columns={columns}
        data={users}
        getRowId={getRowId}
        searchPlaceholder="Search users..."
        filters={filters}
        rowActions={rowActions}
        defaultSorting={[{ id: "createdAt", desc: true }]}
        maxBodyHeight="calc(100vh - 20rem)"
        toolbarActions={
          <Button>
            <PlusIcon data-icon="inline-start" />
            Add user
          </Button>
        }
      />
    </>
  )
}
