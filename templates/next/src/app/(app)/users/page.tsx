import { PlusIcon } from "lucide-react"

import { DataTable } from "@/components/common/data-table"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { columns } from "./columns"
import { users } from "./data"

export default function UsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        description="DataTable with search, sorting, column visibility and pagination."
      />
      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Search users..."
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
