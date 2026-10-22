<script setup lang="ts">
import type { User } from '@/features/users/data'
import { PlusIcon } from '@lucide/vue'
import DataTable from '@/components/common/data-table/DataTable.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { columns, filters, rowActions } from '@/features/users/columns'
import { users } from '@/features/users/data'

const getRowId = (user: User) => user.id
</script>

<template>
  <PageHeader
    title="Users"
    description="DataTable with search, sorting, filters, row actions and pagination."
  />
  <DataTable
    :columns="columns"
    :data="users"
    :get-row-id="getRowId"
    :filters="filters"
    :row-actions="rowActions"
    :default-sorting="[{ id: 'createdAt', desc: true }]"
    search-placeholder="Search users..."
  >
    <template #toolbar-actions>
      <Button>
        <PlusIcon data-icon="inline-start" />
        Add user
      </Button>
    </template>
  </DataTable>
</template>
