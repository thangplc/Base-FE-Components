<!-- BEGIN:kit-rules -->

# Project rules: FE starter kit (Nuxt)

Nuxt 4 · Vue 3.5 (`<script setup lang="ts">`) · Tailwind v4 · shadcn-vue (Reka UI) · vee-validate + **zod 3** · TanStack Table · vue-sonner · @lucide/vue.

## 1. Reuse the kit before writing UI

This project ships a component kit. **Never hand-roll a component, or use a raw HTML control, when the kit already has one.**

- Catalog: `ai/components.md` (every component, its import line and prop names).
- Exact props, events, slots and examples: the `kit-components` MCP server (`search_components`, `get_component`, `get_component_examples`), or `ai/components.json`.
- Canonical usage: the stories in `stories/{ui,common,layout}/*.stories.ts`. Copy patterns from there.

| Need | Use | Not |
|---|---|---|
| Select, simple | `Select` (ui) · in forms `FormSelect` | native `<select>` |
| Select with search, multi-select, tags, creatable, server search | `Combobox` · in forms `FormSelect` with `searchable` / `multiple` | a new Popover + list |
| List / table with search, sort, filters, paging, row actions, selection | `DataTable` (+ `sortableHeader` from `@/components/common/data-table/helpers`, `row-actions`, `filters`) | `Table` (ui) with hand-written state |
| Confirm a destructive action | `ConfirmDialog` (async `on-confirm`), or `confirm` on a row action | `window.confirm`, a custom Dialog |
| Form field | `Form*` wrappers (`FormInput`, `FormTextarea`, `FormSelect`, `FormSwitch`, `FormCheckboxGroup`, `FormDatePicker`, `FormDateRangePicker`, `FormRate`, `FormTransfer`, `FormTreeSelect`, `FormCascader`) inside `<FieldGroup>`; a new control: copy `FormInput.vue` (`useField` + `FormFieldLayout`) | `<Label>` + `<Input>` + hand-written error text |
| Date / time | `DatePicker`, `DateTimePicker`, `DateRangePicker`, `DateTimeRangePicker` | `<input type="date">` |
| Tree / nested data | `Tree`, `TreeSelect`, `Cascader` (path: province → district), `Transfer` (two lists) | |
| Text that may overflow | `TruncatedText` (tooltip only when cut) | `title=` attributes, custom tooltips |
| No data | `EmptyState` | |
| Page title + actions | `PageHeader` | |
| Multi-step flow | `Stepper` · collapsible panels: `Collapse` · progress: `ProgressBar`, `ProgressCircle` | |
| Toast | `import { toast } from 'vue-sonner'` (the Toaster is already mounted in `app.vue`) | a second `<Toaster>` |
| Side panel / drawer | `Sheet` · modal: `Dialog` · menu: `DropdownMenu` | |
| Loading | `Spinner`, `Skeleton`, `DataTable :is-loading` | |
| Icons | `@lucide/vue`; inside a `Button` mark them `data-icon="inline-start"` / `"inline-end"` | other icon sets |

If nothing fits, build a new component (section 5). Don't fork an existing one for a small variation; add a prop instead.

## 2. Layers

- `app/components/ui/`: shadcn-vue base components (one folder per component, `index.ts` exports). Look and variants only, **no business logic**. Edit them to match the brand.
- `app/components/common/`: composed from `ui/`, reusable across features.
- `app/components/layout/`: AppShell, AppSidebar, AppHeader. Sidebar menu: `app/config/site.ts`.
- Pages (`app/pages/`) compose `common/` + `ui/`; feature logic lives in `app/features/<feature>/` (see `features/users/`).
- Imports use the `@/` alias. `ui/` is registered by shadcn-nuxt and `common/` + `layout/` are auto-imported without a path prefix (`<DataTable>`), so pages may skip imports. **Inside `components/` always import explicitly**, including Nuxt composables (`import { useRoute } from '#imports'`, `import { NuxtLink } from '#components'`): Storybook runs plain Vue and mocks those two modules.

## 3. Styling

- Tailwind classes on **design tokens** only: `bg-background`, `bg-primary`, `text-muted-foreground`, `border-border`, `text-destructive`, `bg-success`, `bg-warning`, `rounded-lg`...
- No hex / rgb / arbitrary colours (`bg-[#3b82f6]`), no inline colour styles. Dark mode comes from the `.dark` tokens; don't add `dark:` colour overrides when a token exists.
- Tokens live in `app/assets/css/tokens.css` (generated from `packages/tokens/tokens.css` inside the kit monorepo; edit that one there, or this file once the template is standalone).
- Merge classes with `cn()` from `@/lib/utils`. Components take a `class` prop.

## 4. Vue / Nuxt specifics

- Two-way binding through `v-model` (`v-model:search`, `v-model:pagination`... on DataTable); events are kebab-case (`@row-click`, `@hover-change`). Customisation goes through slots (`#toolbar-actions`, `#empty`, `#option`...); check `get_component` for the list.
- Forms: `useForm({ validationSchema: toTypedSchema(schema), initialValues })` from vee-validate + `@vee-validate/zod`, then `Form*` wrappers with a `name`. This project uses **zod 3**: `z.string().email()`, not `z.email()`.
- Date-only values: `value-format="yyyy-MM-dd"`. `"iso"` converts local midnight to UTC and shifts the day in UTC+ timezones.
- Range rules (`from <= to`) go on the object itself (`.refine(...)` without `path`).

## 5. When you add or change a component

1. Put it in the right layer; keep the API consistent with similar kit components (`v-model`, `disabled`, `class`, `invalid`, kebab-case events).
2. Add a JSDoc comment right before `defineProps` (component description) and on non-obvious props: it becomes the description in `ai/components.*` and in Storybook Docs.
3. Add or update its story in `stories/` (not inside `app/components/`).
4. Run `npm run ai:manifest` to refresh `ai/components.json` + `ai/components.md`. Don't edit those two files by hand.

## 6. Before you finish

```bash
npm run typecheck && npm run ai:check
```

Check the UI in the browser (`npm run dev`, port 3001) or Storybook (`npm run storybook`, port 6007), in light and dark mode.

<!-- END:kit-rules -->
