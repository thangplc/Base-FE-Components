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
  { accessorKey: "name", header: sortableHeader("Name"), meta: { label: "Name" } },
  { accessorKey: "amount", header: sortableHeader("Amount"), meta: { className: "text-right" } },
]

<DataTable
  columns={columns}
  data={users}
  getRowId={(u) => u.id}
  searchPlaceholder="Search..."
  filters={[{ columnId: "status", title: "Status", type: "multi-select", options: statusOptions }]}
  rowActions={(u) => [
    { label: "Edit", icon: PencilIcon, onClick: () => edit(u) },
    { label: "Delete", variant: "destructive", confirm: { title: "Delete?" }, onClick: () => api.delete(u.id) },
  ]}
  maxBodyHeight={480}            // header cố định, scrollbar chỉ trong body
  toolbarActions={<Button>Add</Button>}
/>
```

Bảng đầy đủ các props nằm ở mục DataTable trong README gốc. Lưu ý: trong Server Component, hàm truyền vào (`rowActions`, `getRowId`...) phải export từ một file `"use client"`, xem `app/(app)/users/columns.tsx`.

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

## Dùng với AI

`AGENTS.md` chứa quy tắc cho AI (Claude Code, Cursor, Copilot...). `ai/components.md` là danh mục component sinh từ code, còn MCP server `kit-components` (`ai/mcp-server.mjs`, khai báo trong `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`) cho AI tra props và code mẫu. Sau khi thêm hoặc sửa component thì chạy `npm run ai:manifest`. Chi tiết ở mục "Dùng với AI" trong README gốc.
