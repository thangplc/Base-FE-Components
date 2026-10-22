# Next.js starter

Next.js 16 · React 19 · Tailwind v4 · shadcn/ui (Radix, style `nova`) · react-hook-form + zod · TanStack Table · Storybook 10.

```bash
npm install
npm run dev              # http://localhost:3000
npm run storybook        # http://localhost:6006
npm run typecheck && npm run lint && npm run build
```

## Cách dùng nhanh

### Form

```tsx
const schema = z.object({ email: z.email(), role: z.string().min(1) })
const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", role: "" } })

<form onSubmit={form.handleSubmit(onSubmit)}>
  <FieldGroup>
    <FormInput control={form.control} name="email" label="Email" type="email" />
    <FormSelect control={form.control} name="role" label="Role" options={roles} />
  </FieldGroup>
</form>
```

Cần control mới (DatePicker, Combobox...)? Dùng trực tiếp `FormField`:

```tsx
<FormField control={form.control} name="date" label="Date">
  {(field, { id, invalid }) => <DatePicker id={id} value={field.value} onChange={field.onChange} aria-invalid={invalid} />}
</FormField>
```

### DataTable

```tsx
const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Name" /> },
]

<DataTable columns={columns} data={users} searchPlaceholder="Search..." toolbarActions={<Button>Add</Button>} />
```

### ConfirmDialog

```tsx
<ConfirmDialog
  trigger={<Button variant="destructive">Delete</Button>}
  title="Delete this item?"
  variant="destructive"
  onConfirm={async () => { await api.delete(id) }}   // dialog giữ nguyên + spinner cho tới khi xong
/>
```

## Ghi chú

- `src/styles/tokens.css` được sinh tự động từ `packages/tokens` của monorepo. Khi đã tách template ra project riêng thì cứ sửa trực tiếp file này.
- `next.config.ts` bật `cacheComponents`. Component client đọc giá trị không ổn định khi render (như TanStack Table) phải nằm trong `<Suspense>`. `DataTable` đã tự bọc sẵn.
- Toast: `import { toast } from "sonner"`. Provider gồm theme, tooltip và toaster, nằm ở `src/components/providers.tsx`.
