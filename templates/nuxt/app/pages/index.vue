<script setup lang="ts">
import { PlusIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const stats = [
  { label: 'Revenue', value: '$45,231', change: '+20.1%' },
  { label: 'Subscriptions', value: '2,350', change: '+180' },
  { label: 'Active users', value: '573', change: '+12%' },
  { label: 'Churn', value: '1.2%', change: '-0.3%' },
]

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function deleteItem() {
  await wait(800)
  toast.success('Item deleted')
}
</script>

<template>
  <PageHeader
    title="Overview"
    description="A quick tour of the base and common components in this kit."
  >
    <template #actions>
      <Button @click="toast.success('Item created')">
        <PlusIcon data-icon="inline-start" />
        New item
      </Button>
    </template>
  </PageHeader>

  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <Card v-for="stat in stats" :key="stat.label">
      <CardHeader>
        <CardDescription>{{ stat.label }}</CardDescription>
        <CardTitle class="text-2xl tabular-nums">
          {{ stat.value }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary">
          {{ stat.change }}
        </Badge>
      </CardContent>
    </Card>
  </div>

  <Tabs default-value="buttons">
    <TabsList>
      <TabsTrigger value="buttons">
        Buttons
      </TabsTrigger>
      <TabsTrigger value="feedback">
        Feedback
      </TabsTrigger>
      <TabsTrigger value="empty">
        Empty state
      </TabsTrigger>
    </TabsList>

    <TabsContent value="buttons">
      <Card>
        <CardContent class="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">
            Secondary
          </Button>
          <Button variant="outline">
            Outline
          </Button>
          <Button variant="ghost">
            Ghost
          </Button>
          <Button variant="destructive">
            Destructive
          </Button>
          <Button variant="link">
            Link
          </Button>
          <ConfirmDialog
            title="Delete this item?"
            description="This action cannot be undone."
            confirm-text="Delete"
            variant="destructive"
            :on-confirm="deleteItem"
          >
            <template #trigger>
              <Button variant="destructive">
                <Trash2Icon data-icon="inline-start" />
                Delete (confirm)
              </Button>
            </template>
          </ConfirmDialog>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="feedback">
      <Card>
        <CardContent class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <Button variant="outline" @click="toast('Default toast')">
              Toast
            </Button>
            <Button variant="outline" @click="toast.success('Saved!')">
              Success
            </Button>
            <Button variant="outline" @click="toast.error('Something went wrong')">
              Error
            </Button>
            <Button
              variant="outline"
              @click="toast.promise(wait(1500), { loading: 'Saving...', success: 'Done', error: 'Failed' })"
            >
              Promise
            </Button>
          </div>
          <div class="flex flex-col gap-2">
            <Skeleton class="h-4 w-1/2" />
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="empty">
      <Card>
        <CardContent>
          <EmptyState
            title="No projects yet"
            description="Create your first project to get started."
          >
            <template #action>
              <Button>
                <PlusIcon data-icon="inline-start" />
                Create project
              </Button>
            </template>
          </EmptyState>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</template>
