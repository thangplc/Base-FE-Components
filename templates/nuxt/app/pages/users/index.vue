<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'
import DataTable from '@/components/common/data-table/DataTable.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { columns } from '@/features/users/columns'
import { users } from '@/features/users/data'
</script>

<template>
  <PageHeader
    title="Users"
    description="DataTable with search, sorting, column visibility and pagination."
  />
  <DataTable :columns="columns" :data="users" search-placeholder="Search users...">
    <template #toolbar-actions>
      <Button>
        <PlusIcon data-icon="inline-start" />
        Add user
      </Button>
    </template>
  </DataTable>
</template>
