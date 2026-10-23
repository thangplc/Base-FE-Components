<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:kit-rules -->

# Project rules: FE starter kit (Next.js)

Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui (Radix) · react-hook-form + **zod 4** · TanStack Table · sonner · lucide-react.

## 1. Reuse the kit before writing UI

This project ships a component kit. **Never hand-roll a component, or use a raw HTML control, when the kit already has one.**

- Catalog: `ai/components.md` (every component, its import line and prop names).
- Exact props / examples: the `kit-components` MCP server (`search_components`, `get_component`, `get_component_examples`), or `ai/components.json`.
- Canonical usage: the stories in `stories/{ui,common,layout}/*.stories.tsx`. Copy patterns from there.

| Need | Use | Not |
|---|---|---|
| Select, simple | `Select` (ui) · in forms `FormSelect` | native `<select>` |
| Select with search, multi-select, tags, creatable, server search | `Combobox` · in forms `FormSelect` with `searchable` / `multiple` | a new Popover + list |
| List / table with search, sort, filters, paging, row actions, selection | `DataTable` (+ `sortableHeader`, `rowActions`, `filters`) | `Table` (ui) with hand-written state |
| Confirm a destructive action | `ConfirmDialog` (async `onConfirm`), or `confirm` on a `rowActions` item | `window.confirm`, a custom Dialog |
| Form field | `Form*` wrappers (`FormInput`, `FormTextarea`, `FormSelect`, `FormSwitch`, `FormCheckboxGroup`, `FormDatePicker`, `FormDateRangePicker`, `FormRate`, `FormTransfer`, `FormTreeSelect`, `FormCascader`) inside `<FieldGroup>`; any other control through `FormField` (render prop) | `<Label>` + `<Input>` + hand-written error text |
| Date / time | `DatePicker`, `DateTimePicker`, `DateRangePicker`, `DateTimeRangePicker` | `<input type="date">` |
| Tree / nested data | `Tree`, `TreeSelect`, `Cascader` (path: province → district), `Transfer` (two lists) | |
| Text that may overflow | `TruncatedText` (tooltip only when cut) | `title=` attributes, custom tooltips |
| No data | `EmptyState` | |
| Page title + actions | `PageHeader` | |
| Multi-step flow | `Stepper` · collapsible panels: `Collapse` · progress: `ProgressBar`, `ProgressCircle` | |
| Toast | `import { toast } from "sonner"` (the Toaster is already in `providers.tsx`) | a second `<Toaster>` |
| Side panel / drawer | `Sheet` · modal: `Dialog` · menu: `DropdownMenu` | |
| Loading | `Spinner`, `Skeleton`, `DataTable isLoading` | |
| Icons | `lucide-react`; inside a `Button` mark them `data-icon="inline-start"` / `"inline-end"` | other icon sets |

If nothing fits, build a new component (section 5). Don't fork an existing one for a small variation; add a prop instead.

## 2. Layers

- `src/components/ui/`: shadcn base components. Look and variants only, **no business logic**. Edit them to match the brand.
- `src/components/common/`: composed from `ui/`, reusable across features.
- `src/components/layout/`: AppShell, AppSidebar, AppHeader. Sidebar menu: `src/config/site.ts`.
- Pages / feature code (`src/app/...`): composes `common/` + `ui/` and holds the business logic. Feature-only pieces live next to the page (see `src/app/(app)/users/columns.tsx`).
- Imports use the `@/` alias (`@/components/common/data-table`). Folders with an `index.ts` are imported by folder.

## 3. Styling

- Tailwind classes on **design tokens** only: `bg-background`, `bg-primary`, `text-muted-foreground`, `border-border`, `text-destructive`, `bg-success`, `bg-warning`, `rounded-lg`...
- No hex / rgb / arbitrary colours (`bg-[#3b82f6]`), no inline colour styles. Dark mode comes from the `.dark` tokens; don't add `dark:` colour overrides when a token exists.
- Tokens live in `src/styles/tokens.css` (generated from `packages/tokens/tokens.css` inside the kit monorepo; edit that one there, or this file once the template is standalone).
- Merge classes with `cn()` from `@/lib/utils`. Components take a `className` prop.

## 4. Next.js specifics

- Interactive components need `"use client"`. Functions passed from a Server Component to a client component (`rowActions`, `getRowId`, `columns` with cell renderers) must be exported from a `"use client"` file; see `src/app/(app)/users/columns.tsx`.
- `cacheComponents` is on: a client component that reads unstable values while rendering must sit inside `<Suspense>`. `DataTable` already wraps itself.
- Forms: `useForm({ resolver: zodResolver(schema), defaultValues })` + `Form*` wrappers. This project uses **zod 4**: `z.email()`, not `z.string().email()`.
- Date-only values: `valueFormat="yyyy-MM-dd"`. `"iso"` converts local midnight to UTC and shifts the day in UTC+ timezones.
- Range rules (`from <= to`) go on the object itself (`.refine(...)` without `path`).

## 5. When you add or change a component

1. Put it in the right layer; keep the API consistent with similar kit components (controlled `value` + change callback, `defaultValue`, `disabled`, `className`, `aria-invalid`).
2. Add a one-line JSDoc on the component and on non-obvious props: it becomes the description in `ai/components.*` and in Storybook Docs.
3. Add or update its story in `stories/` (not inside `src/components/`).
4. Run `npm run ai:manifest` to refresh `ai/components.json` + `ai/components.md`. Don't edit those two files by hand.

## 6. Before you finish

```bash
npm run typecheck && npm run lint && npm run ai:check
```

Check the UI in the browser (`npm run dev`, port 3000) or Storybook (`npm run storybook`, port 6006), in light and dark mode.

<!-- END:kit-rules -->
