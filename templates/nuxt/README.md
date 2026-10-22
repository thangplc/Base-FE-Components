# Nuxt starter

Nuxt 4 · Vue 3.5 · Tailwind v4 · shadcn-vue (Reka UI, style `nova`) · vee-validate + zod · TanStack Table · Storybook 10.

```bash
npm install
npm run dev              # http://localhost:3000
npm run storybook        # http://localhost:6007
npm run typecheck && npm run build
```

## Cách dùng nhanh

Component trong `components/ui` được `shadcn-nuxt` tự đăng ký. Component trong `components/common` và `components/layout` được auto-import mà không cần prefix (`<DataTable>`, `<FormInput>`...). Code trong kit thì vẫn import tường minh, để Storybook (chạy Vue thuần, không có Nuxt) dùng được.

### Form

```vue
<script setup lang="ts">
const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(z.object({ email: z.string().email(), role: z.string().min(1) })),
  initialValues: { email: '', role: '' },
})
const onSubmit = handleSubmit(values => { /* ... */ })
</script>

<template>
  <form @submit="onSubmit">
    <FieldGroup>
      <FormInput name="email" label="Email" type="email" />
      <FormSelect name="role" label="Role" :options="roles" />
    </FieldGroup>
  </form>
</template>
```

Cần control mới? Copy `FormInput.vue`, đổi `<Input>` thành control của bạn (`useField` + `FormFieldLayout`).

### DataTable

```ts
import { sortableHeader } from '@/components/common/data-table/helpers'

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: sortableHeader('Name') },
  { id: 'actions', cell: ({ row }) => h(UserRowActions, { user: row.original }) },
]
```

```vue
<DataTable :columns="columns" :data="users" search-placeholder="Search...">
  <template #toolbar-actions><Button>Add</Button></template>
</DataTable>
```

### ConfirmDialog

```vue
<ConfirmDialog title="Delete this item?" variant="destructive" :on-confirm="deleteItem">
  <template #trigger><Button variant="destructive">Delete</Button></template>
</ConfirmDialog>
```

## Ghi chú

- `app/assets/css/tokens.css` được sinh tự động từ `packages/tokens` của monorepo. Khi đã tách ra project riêng thì sửa trực tiếp file này.
- `main.css` import `shadcn/tailwind.css` để có các variant `data-open:`, `data-checked:`... mà style `nova` cần.
- Toast: `import { toast } from 'vue-sonner'`.
- Trong `components/`, composable và component của Nuxt được import tường minh (`import { useRoute } from '#imports'`, `import { NuxtLink } from '#components'`), để Storybook mock được qua `.storybook/mocks/`.
