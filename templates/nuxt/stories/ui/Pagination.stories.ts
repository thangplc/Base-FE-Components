import type { Meta, StoryObj } from '@storybook/vue3-vite'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const components = {
  Pagination, PaginationContent, PaginationEllipsis, PaginationFirst, PaginationItem,
  PaginationLast, PaginationNext, PaginationPrevious,
}

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  args: { total: 100, itemsPerPage: 10 },
  parameters: {
    docs: {
      description: {
        component: 'Stateful pagination (Reka UI): pass `total`, `items-per-page`, read the page via v-model:page. DataTable has its own pagination.',
      },
    },
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components,
    template: `
      <Pagination v-slot="{ page }" :total="100" :items-per-page="10" :default-page="2">
        <PaginationContent v-slot="{ items }">
          <PaginationPrevious />
          <template v-for="(item, index) in items" :key="index">
            <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">
              {{ item.value }}
            </PaginationItem>
            <PaginationEllipsis v-else :index="index" />
          </template>
          <PaginationNext />
        </PaginationContent>
      </Pagination>
    `,
  }),
}

export const WithFirstAndLast: Story = {
  render: () => ({
    components,
    template: `
      <Pagination v-slot="{ page }" :total="300" :items-per-page="10" :sibling-count="1" show-edges :default-page="15">
        <PaginationContent v-slot="{ items }">
          <PaginationFirst />
          <PaginationPrevious />
          <template v-for="(item, index) in items" :key="index">
            <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">
              {{ item.value }}
            </PaginationItem>
            <PaginationEllipsis v-else :index="index" />
          </template>
          <PaginationNext />
          <PaginationLast />
        </PaginationContent>
      </Pagination>
    `,
  }),
}
