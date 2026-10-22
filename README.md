# FE Starter Kit

Bộ starter kit cá nhân: **base components dựng sẵn** cho React (Next.js) và Vue (Nuxt), dùng chung một bộ design tokens. Mục tiêu là khi vào dự án mới chỉ cần clone về, đổi màu brand rồi bắt tay làm feature ngay, không phải dừng lại để build base component.

| Template | Stack |
|---|---|
| [`templates/next`](templates/next) | Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui (Radix) · react-hook-form + zod · TanStack Table · next-themes · Storybook 10 |
| [`templates/nuxt`](templates/nuxt) | Nuxt 4 · Vue 3.5 · Tailwind v4 · shadcn-vue (Reka UI) · vee-validate + zod · TanStack Table · @nuxtjs/color-mode · Storybook 10 |

## Cấu trúc

```
.
├── packages/tokens/tokens.css   ← NGUỒN DUY NHẤT của design tokens (màu, radius, dark mode)
├── scripts/sync-tokens.mjs      ← copy tokens.css vào từng template
└── templates/
    ├── next/src/
    │   ├── components/ui/       ← Tầng 2: base components (shadcn) — sở hữu & sửa trực tiếp
    │   ├── components/common/   ← Tầng 3: component chung (Form*, DataTable, ConfirmDialog...)
    │   ├── components/layout/   ← AppShell, AppSidebar, AppHeader
    │   ├── config/site.ts       ← tên app + menu sidebar
    │   ├── styles/tokens.css    ← (auto-generated, đừng sửa tay)
    │   └── app/(app)/           ← trang demo: /, /form, /users
    └── nuxt/app/
        ├── components/ui/       ← Tầng 2: base components (shadcn-vue)
        ├── components/common/   ← Tầng 3
        ├── components/layout/
        ├── config/site.ts
        ├── assets/css/tokens.css (auto-generated)
        ├── features/users/      ← code theo feature (columns, data...)
        └── pages/               ← trang demo: /, /form, /users
```

**Quy ước phân tầng** (giống nhau ở cả 2 template):

1. `ui/`: chỉ có giao diện và các variant, **không** chứa logic nghiệp vụ. Được phép sửa để khớp brand.
2. `common/`: ghép từ `ui/`, dùng lại được giữa nhiều feature.
3. Feature/page: ghép từ `common/` + `ui/`, chứa logic nghiệp vụ.

## Bắt đầu dự án mới

Mỗi template là một project **độc lập** (tokens đã được copy sẵn vào trong), nên chỉ cần lấy đúng thư mục mình cần:

```bash
# React / Next.js
npx degit <github-user>/<repo>/templates/next my-app

# hoặc Vue / Nuxt
npx degit <github-user>/<repo>/templates/nuxt my-app
```

```bash
cd my-app
npm install
npm run dev
```

Sau đó:

1. **Đổi tên**: `name` trong `package.json`, `siteConfig` trong `config/site.ts`.
2. **Đổi brand**: sửa các biến `:root` / `.dark` trong file `tokens.css` của template (màu nên viết theo `oklch`, có thể lấy từ [ui.shadcn.com/themes](https://ui.shadcn.com/themes)).
3. **Xoá trang demo**: Next xoá `src/app/(app)/form`, `users`; Nuxt xoá `pages/form.vue`, `pages/users`, `features/users`.
4. Bắt đầu làm feature, chỉ việc ghép component.

## Chỉ lấy folder `ui` sang project có sẵn

Khi project đã có sẵn và bạn chỉ muốn lấy bộ base component, hãy copy những thứ sau.

**Next / React**

| Copy | Vào project mới |
|---|---|
| `src/components/ui/` | `src/components/ui/` |
| `src/hooks/use-mobile.ts` | `src/hooks/use-mobile.ts` (Sidebar cần) |
| `src/styles/tokens.css` | Import trong CSS chính, sau `@import "tailwindcss"` (xem `src/app/globals.css`) |
| `components.json` | Gốc project, để sau này dùng `npx shadcn add` tiếp |

```bash
npm i radix-ui class-variance-authority cn lucide-react cmdk sonner next-themes tw-animate-css shadcn
```

**Nuxt / Vue**

| Copy | Vào project mới |
|---|---|
| `app/components/ui/` | `app/components/ui/` |
| `app/assets/css/tokens.css` + `main.css` | `app/assets/css/` (khai báo `css: ['~/assets/css/main.css']`) |
| `components.json` | Gốc project |

```bash
npm i reka-ui class-variance-authority cn @lucide/vue @vueuse/core vue-sonner vee-validate @vee-validate/zod zod
npm i -D shadcn-nuxt tailwindcss @tailwindcss/vite tw-animate-css shadcn
```

Sau đó thêm `shadcn-nuxt` vào `modules` và đặt `shadcn: { prefix: '', componentDir: '@/components/ui' }` như trong `nuxt.config.ts`.

Hai template đều cần alias `@/` trỏ tới `src/` (Next) hoặc `app/` (Nuxt); đây là cấu hình mặc định của create-next-app và Nuxt 4.

## Phát triển chính kit này (monorepo)

```bash
npm install            # cài cho toàn bộ workspace

npm run dev:next       # http://localhost:3000
npm run dev:nuxt       # http://localhost:3001 (chạy song song với Next được)
npm run storybook:next # http://localhost:6006
npm run storybook:nuxt # http://localhost:6007
npm run build          # sync tokens + build cả 2 template
```

### Đổi design tokens cho cả kit

Sửa `packages/tokens/tokens.css`, sau đó chạy:

```bash
npm run sync:tokens
```

### Thêm base component mới

```bash
# Next
npx shadcn@latest add accordion -c templates/next

# Nuxt
npx shadcn-vue@latest add accordion -c templates/nuxt
```

Nhớ thêm vào **cả hai** template để chúng không lệch nhau.

## Có sẵn gì

| Nhóm | Next (`components/…`) | Nuxt (`components/…`) |
|---|---|---|
| Base (ui) | Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Label, Field, InputGroup, Dialog, AlertDialog, Sheet, DropdownMenu, Popover, Tooltip, Command, Sonner (toast), Card, Badge, Avatar, Table, Tabs, Breadcrumb, Pagination, Sidebar, ScrollArea, Separator, Skeleton, Spinner, Empty | Giống bên Next, cộng thêm `form` (vee-validate) |
| Form | `FormField` (render-prop generic), `FormInput`, `FormTextarea`, `FormSelect`, `FormSwitch` | `FormFieldLayout`, `FormInput`, `FormTextarea`, `FormSelect`, `FormSwitch` |
| Data | `DataTable`: search, sort, filter, cột action, chọn dòng, sticky header, phân trang, chế độ server-side (xem [mục DataTable](#datatable)) | Giống bên Next |
| Khác | `ConfirmDialog` (hỗ trợ async), `EmptyState`, `PageHeader`, `ThemeToggle` | Giống bên Next |
| Layout | `AppShell` = Sidebar (thu gọn được) + Header (breadcrumb, theme toggle) | Giống bên Next (`layouts/default.vue`) |

Chi tiết cách dùng nằm trong README của từng template và trong Storybook.

## DataTable

Cùng một bộ props cho cả hai template. Chỗ nào Vue khác thì được ghi chú trong cột cuối.

| Nhóm | Prop | Mặc định | Vue |
|---|---|---|---|
| Dữ liệu | `columns`, `data` (bắt buộc) | | |
| | `getRowId(row)` | index | |
| | `isLoading`: skeleton trong body | `false` | |
| | `emptyState` | `"No results."` | string, hoặc slot `#empty` |
| | `onRowClick(row)` (bỏ qua click vào button, link, checkbox) | | `@row-click` |
| Search | `searchPlaceholder`: hiện ô tìm kiếm | | |
| | `searchColumns`: chỉ tìm trong các cột này | mọi cột text/số | |
| | `searchValue` / `onSearchChange` | tự quản lý | `v-model:search` |
| | `searchDebounceMs` | `300` | |
| Sort | `defaultSorting`, `enableMultiSort` (Shift + click) | `[]`, `false` | |
| | `sorting` / `onSortingChange`, `manualSorting` | tự quản lý | `v-model:sorting` |
| Filter | `filters: DataTableFilter[]`: `select` · `multi-select` · `number-range` · `date-range` | | |
| | `columnFilters` / `onColumnFiltersChange`, `manualFiltering` | tự quản lý | `v-model:column-filters` |
| Cột action | `rowActions(row) => RowAction[]`: label, icon, variant, disabled, hidden, `confirm`, `display` | | |
| | `rowActionsDisplay`: `"menu"` (gom vào "…") hoặc `"inline"` (mỗi action một nút) | `"menu"` | |
| | `actionsColumnSize`: độ rộng cột action (px) | tự ước lượng | |
| | `actionsColumnPinned`: khi cột nhiều quá chiều ngang (có thanh cuộn ngang), cột action đứng yên bên phải; khi vừa đủ thì là cột bình thường | `true` | |
| Layout | `maxBodyHeight`: body cuộn, **scrollbar chỉ trong body** | | |
| | `stickyHeader` (khi có `maxBodyHeight`) | `true` | |
| Phân trang | `pageSize`, `pageSizeOptions`, `showPagination` | `10`, `[10,20,50,100]`, `true` | |
| | `pagination` / `onPaginationChange`, `manualPagination` + `rowCount` | tự quản lý | `v-model:pagination` |
| Toolbar | `toolbarActions` | | slot `#toolbar-actions` |
| | `enableColumnVisibility`, `defaultColumnVisibility` | `true`, `{}` | |
| Chọn dòng | `enableRowSelection` (boolean hoặc `(row) => boolean`) | `false` | |
| | `onRowSelectionChange(rows)` | | `@selection-change` |
| | `bulkActions(rows, { clear })` | | slot `#bulk-actions="{ rows, clear }"` |

**Vị trí của action:** `rowActionsDisplay` đặt kiểu mặc định cho cả bảng. Từng action có thể ghi đè bằng `display`:
- `"inline"`: nếu có `icon` thì là nút icon kèm tooltip là `label`; nếu không có icon thì là nút chữ.
- `"menu"`: nằm trong menu "…". Menu chỉ xuất hiện khi còn ít nhất một action dạng menu.

Ví dụ: `rowActionsDisplay="menu"` và gắn `display: "inline"` cho Edit/Delete thì hai nút này hiện ra ngoài, các action còn lại nằm trong "…". `confirm` dùng được cho cả hai kiểu.

Trong `columns`, có thể dùng thêm:
- `meta.label`: tên cột trong menu "View".
- `meta.className`: class cho cả ô header lẫn ô body, ví dụ `"text-right"`.
- `size`: độ rộng cột, dùng khi có `maxBodyHeight`. Khi bảng rộng hơn tổng `size`, phần dư chỉ chia cho các cột dữ liệu theo tỷ lệ. Cột checkbox và cột action giữ nguyên độ rộng.
- `meta.fixedWidth: true`: giữ đúng `size` cho cột đó, không nhận thêm phần dư (ví dụ cột Status, cột ngày).
- `enableSorting: false` / `enableGlobalFilter: false`: tắt sort hoặc tìm kiếm cho cột đó.
- `sortableHeader("Tên")`: tạo nhanh header có nút sort.

**Hai chế độ dùng:**
- **Tự quản lý:** chỉ truyền `data`. Search, sort, filter và phân trang đều chạy ở client.
- **Server-side:** điều khiển state từ ngoài và bật `manualSorting` / `manualFiltering` / `manualPagination`, truyền thêm `rowCount`. Khi search hoặc filter thay đổi, bảng tự quay về trang 1.

Story `Common/DataTable` có ví dụ cho từng tính năng, gồm cả một "API" giả lập 1.234 dòng.

## Storybook

Mọi component đều có story, và mỗi component có thêm một trang **Docs** sinh tự động (bảng props + toàn bộ biến thể). Nút đổi theme trên toolbar giúp xem cả light lẫn dark.

```bash
npm run storybook:next   # http://localhost:6006
npm run storybook:nuxt   # http://localhost:6007
```

| Nhóm | Nội dung |
|---|---|
| `UI/*` | Toàn bộ base component trong `components/ui` (31 component; Nuxt có thêm `Form (vee-validate)`), mỗi cái gồm các variant, size và state (disabled, invalid, loading...) |
| `Common/*` | ConfirmDialog (kể cả async và lỗi), DataTable, EmptyState, Form, PageHeader, ThemeToggle |
| `Layout/*` | AppShell: sidebar + header, đổi trang active qua `parameters` |

Story nằm trong folder `stories/` riêng của mỗi template, **không** nằm trong `components/`, nên `components/ui` luôn chỉ chứa code component và copy đi dùng được ngay:

```
templates/next/stories/{ui,common,layout}/*.stories.tsx
templates/nuxt/stories/{ui,common,layout}/*.stories.ts
```

Khi thêm component mới, bạn copy một story có sẵn trong `stories/` rồi sửa lại (import qua alias `@/components/...`).

Với Nuxt, Storybook chạy Vue thuần (không có Nuxt runtime). Component nào cần composable của Nuxt thì import tường minh từ `#imports` / `#components`, và hai module này được mock trong `.storybook/mocks/`.
