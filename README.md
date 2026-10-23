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
├── packages/ai/                 ← NGUỒN của bộ công cụ AI (manifest + MCP server)
├── scripts/sync-tokens.mjs      ← copy tokens.css vào từng template
├── scripts/sync-ai.mjs          ← copy packages/ai vào từng template + sinh manifest
├── AGENTS.md                    ← quy tắc cho AI khi phát triển chính kit này
└── templates/
    ├── next/ai/                 ← components.json / .md (auto-generated) + mcp-server.mjs
    ├── next/AGENTS.md           ← quy tắc cho AI khi viết code trong template
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

## Dùng với AI (Claude Code, Cursor, Copilot)

AI hay tự viết lại `<button>`, `<table>`, `<input type="date">` thay vì dùng component có sẵn, vì nó không biết kit này tồn tại. Mỗi template có sẵn 3 thứ để AI dùng đúng kit:

| Thành phần | Vai trò |
|---|---|
| `AGENTS.md` (+ `CLAUDE.md` trỏ tới nó) | Quy tắc: cần gì thì dùng component nào, phân tầng, chỉ dùng token màu, form, kiểm tra trước khi xong. Claude Code, Cursor, Copilot, Codex đều tự đọc |
| `ai/components.md` + `ai/components.json` | Danh mục **sinh tự động từ code**: mọi component, dòng import, props (kiểu, mặc định, mô tả từ JSDoc), events/slots (Vue), file story |
| `ai/mcp-server.mjs` | MCP server `kit-components`, không cần dependency. Đã khai báo sẵn trong `.mcp.json` (Claude Code), `.cursor/mcp.json`, `.vscode/mcp.json` |

Tool của MCP server:

| Tool | Ví dụ |
|---|---|
| `search_components` | `"chọn tỉnh thành"` → Cascader; `"bảng có phân trang"` → DataTable; `"confirm before delete"` → ConfirmDialog |
| `get_component` | Toàn bộ props / events / slots của `DataTable`; gõ sai tên (`DialogContnt`) thì gợi ý tên đúng |
| `get_component_examples` | Code mẫu lấy thẳng từ story (`DataTable` + `story: "ServerSide"`) |
| `list_components`, `get_project_guidelines` | Danh sách theo tầng; phần quy tắc trong `AGENTS.md` |

Mở project bằng Claude Code hoặc Cursor là tool tự xuất hiện (lần đầu sẽ hỏi cho phép server). Nếu component đã sửa mà chưa sinh lại manifest, server sẽ nhắc trong kết quả (so hash nội dung `components/`).

**Khi thêm hoặc sửa component**: viết JSDoc một dòng cho component (Vue: đặt ngay trước `defineProps`) và cho các prop khó hiểu, sau đó chạy:

```bash
npm run sync:ai    # ở gốc monorepo: copy packages/ai + sinh lại manifest cho cả 2 template
npm run check:ai   # cho CI: báo lỗi nếu manifest cũ
```

Khi đã tách template ra project riêng thì dùng `npm run ai:manifest` / `npm run ai:check` ngay trong project đó.

## Có sẵn gì

| Nhóm | Next (`components/…`) | Nuxt (`components/…`) |
|---|---|---|
| Base (ui) | Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Label, Field, InputGroup, Dialog, AlertDialog, Sheet, DropdownMenu, Popover, Tooltip, Command, Sonner (toast), Card, Badge, Avatar, Table, Tabs, Breadcrumb, Pagination, Sidebar, ScrollArea, Separator, Skeleton, Spinner, Empty, Progress, Calendar | Giống bên Next, cộng thêm `form` (vee-validate) |
| Form | `FormField` (render-prop generic), `FormInput`, `FormTextarea`, `FormSelect` (cả `multiple` / `searchable`), `FormSwitch`, `FormCheckboxGroup`, `FormDatePicker`, `FormDateRangePicker`, `FormRate`, `FormTransfer`, `FormTreeSelect`, `FormCascader` | `FormFieldLayout` + các wrapper cùng tên |
| Data | `DataTable`: search, sort, filter, cột action, chọn dòng (checkbox / radio), header nhiều tầng, group dòng, gộp ô, sticky header, phân trang, chế độ server-side (xem [mục DataTable](#datatable)) | Giống bên Next |
| Chọn dữ liệu | `Combobox` (một / nhiều giá trị, xem [mục Chọn dữ liệu](#chọn-dữ-liệu)), `Transfer`, `Tree`, `TreeSelect`, `Cascader`, `Rate` | Giống bên Next |
| Khác | `ConfirmDialog` (hỗ trợ async), `EmptyState`, `PageHeader`, `ThemeToggle`, `TruncatedText` (xem [mục TruncatedText](#truncatedtext)), `CheckboxGroup`, `ProgressBar` + `ProgressCircle`, `Stepper`, `Collapse`, `DatePicker`, `DateTimePicker`, `DateRangePicker`, `DateTimeRangePicker` trong `common/date-picker/` (xem [mục Date picker](#date-picker)) | Giống bên Next |
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
| | `selectionType`: `"checkbox"` hoặc `"radio"` (mỗi lần một dòng) | `"checkbox"` | |
| | `selectAllMode`: checkbox ở header chọn trang hiện tại (`"page"`) hay mọi dòng đã lọc (`"all"`) | `"page"` | |
| | `selectionColumnPinned`: cột checkbox đứng yên bên trái khi bảng cuộn ngang | `true` | |
| | `rowSelection` (mảng id theo `getRowId`, giữ qua các trang, cả server-side) / `onRowSelectionChange(rows, ids)` | tự quản lý | `v-model:row-selection`, `@selection-change` |
| | `bulkActions(rows, { clear })` | | slot `#bulk-actions="{ rows, clear }"` |
| Header nhiều tầng | Lồng `columns: [...]` trong một column def; cột không thuộc nhóm tự kéo dài qua các hàng header. `bordered`: kẻ dọc giữa các ô | `false` | |
| Group dòng | `grouping` / `defaultGrouping` (mảng id cột, lồng theo thứ tự) / `onGroupingChange` | `[]` | `v-model:grouping` |
| | `enableGrouping`: menu "Group" trên toolbar | `false` | |
| | `defaultExpanded`, `paginateGroups` (phân trang theo nhóm cấp 1), `keepGroupedColumns` | `true`, `false`, `false` | |
| | `renderGroupRow(row)`: nhãn hàng nhóm (mặc định "Cột: giá trị") | | slot `#group-row="{ row }"` |

**Vị trí của action:** `rowActionsDisplay` đặt kiểu mặc định cho cả bảng. Từng action có thể ghi đè bằng `display`:
- `"inline"`: nếu có `icon` thì là nút icon kèm tooltip là `label`; nếu không có icon thì là nút chữ.
- `"menu"`: nằm trong menu "…". Menu chỉ xuất hiện khi còn ít nhất một action dạng menu.

Ví dụ: `rowActionsDisplay="menu"` và gắn `display: "inline"` cho Edit/Delete thì hai nút này hiện ra ngoài, các action còn lại nằm trong "…". `confirm` dùng được cho cả hai kiểu.

Trong `columns`, có thể dùng thêm:
- `meta.label`: tên cột trong menu "View".
- `meta.className`: class cho cả ô header lẫn ô body, ví dụ `"text-right"`.
- `size`: độ rộng cột, dùng khi có `maxBodyHeight`. Khi bảng rộng hơn tổng `size`, phần dư chỉ chia cho các cột dữ liệu theo tỷ lệ. Cột checkbox và cột action giữ nguyên độ rộng.
- `meta.fixedWidth: true`: giữ đúng `size` cho cột đó, không nhận thêm phần dư (ví dụ cột Status, cột ngày).
- `meta.overflow`: cách xử lý nội dung dài trong ô:
  - `"truncate"` (mặc định): một dòng, cắt bằng `…`; rê chuột vào ô bị cắt thì hiện tooltip đầy đủ nội dung. Đây chính là `TruncatedText`, dùng chung tooltip của cả app.
  - `"wrap"`: xuống nhiều dòng (hợp với cột mô tả, ghi chú).
  - `"visible"`: giữ nguyên (cột checkbox và cột action dùng mặc định này).

  Muốn cắt chữ thì cột phải có độ rộng giới hạn. Khi có `maxBodyHeight` thì luôn có giới hạn. Ở layout thường, cột tự giãn theo nội dung, nên cần tự giới hạn bằng `meta.className`, ví dụ `"max-w-60"`.
- `enableSorting: false` / `enableGlobalFilter: false`: tắt sort hoặc tìm kiếm cho cột đó.
- `sortableHeader("Tên")`: tạo nhanh header có nút sort.
- `aggregationFn` (`"sum"`, `"count"`, `"mean"`, `"min"`, `"max"` hoặc hàm) + `aggregatedCell`: giá trị tổng hợp trên hàng nhóm khi group dòng.
- `meta.mergeRows: true`: gộp các dòng liền nhau cùng giá trị thành một ô (rowSpan), kiểu Excel. Nhiều cột gộp thì lồng nhau theo thứ tự cột; không áp dụng khi đang group. Nên sort theo các cột gộp trước.

**Hai chế độ dùng:**
- **Tự quản lý:** chỉ truyền `data`. Search, sort, filter và phân trang đều chạy ở client.
- **Server-side:** điều khiển state từ ngoài và bật `manualSorting` / `manualFiltering` / `manualPagination`, truyền thêm `rowCount`. Khi search hoặc filter thay đổi, bảng tự quay về trang 1.

Story `Common/DataTable` có ví dụ cho từng tính năng, gồm cả một "API" giả lập 1.234 dòng.

## Form & tiến trình

| Component | Cách dùng |
|---|---|
| `Input` / `Textarea` + bộ đếm | Đặt `maxLength` / `minLength` (Vue: `maxlength` / `minlength`) là có bộ đếm `12/100` (hoặc `3 / min 10`), ở cuối ô Input và góc dưới bên phải Textarea. Chữ đỏ khi chưa đủ min hoặc khi chạm max. `showCount` để bật/tắt hẳn bộ đếm. Có bộ đếm thì `className` áp lên khung bao ngoài |
| `Checkbox` indeterminate | `checked="indeterminate"` (Vue: `model-value="indeterminate"`) hiện nền primary kèm dấu − |
| `CheckboxGroup` | `options`, `value` / `onValueChange` (Vue: `v-model`), `selectAll` (✓ / − / trống, bỏ qua item `disabled`), `orientation`. Mặc định giá trị là `string[]`; đặt `separator=","` thì thành chuỗi `"email,sms"` |
| `Progress` | `value`, `max`, `size` (sm/default/lg), `variant` (default/success/warning/destructive), `indeterminate` |
| `ProgressBar` | Progress kèm `label`, giá trị (`formatValue`, mặc định `42%`) và `description`; `type="circle"` để thành dạng tròn |
| `ProgressCircle` | Vòng tròn SVG: `value`, `max`, `variant`, `indeterminate` (vòng xoay), `size` (sm 40 / default 64 / lg 96 hoặc số px), `strokeWidth`, `lineCap`, `gapDegree` (vd 75 thành dạng gauge hở ở đáy), `showValue` / `formatValue`, nội dung ở giữa qua `children` (Vue: slot) |
| `Rate` | `value` (Vue: `v-model`), `count`, `allowHalf`, `allowClear` (bấm lại giá trị hiện tại thì về 0), `readOnly`, `disabled`, `size`, `character` (icon hoặc chữ), `renderCharacter(index)`, `tooltips`, `showValue`, `onHoverChange` (Vue: `@hover-change`); bàn phím ← → Home End |
| `Collapse` | Dựng trên shadcn Accordion. `items` ({ key, title, content, extra, icon, disabled }; Vue: nội dung qua slot `#[key]`, `#extra="{ item }"`), `accordion` (mỗi lần một panel), `variant` (bordered / separated / ghost), `size`, `expandIcon` (chevron / plus-minus), `expandIconPosition`, `collapsible` (`"icon"`: chỉ icon mới mở/đóng), `forceMount` |
| `Stepper` | `steps` ({ title, description, icon, status: "error" }), `current`, `onStepClick` (Vue: `@step-click`; mặc định chỉ bấm được bước đã xong, hoặc tất cả với `allowJumpAhead`), `orientation` |
| `DatePicker`, `DateTimePicker`, `DateRangePicker`, `DateTimeRangePicker` | Xem [mục Date picker](#date-picker) |
| `FormDatePicker` | DatePicker nối với react-hook-form / vee-validate. Thêm `withTime` (Vue: `with-time`) để thành DateTimePicker; các prop khác (`valueFormat`, `minDate`...) truyền thẳng xuống picker |
| `FormDateRangePicker` | DateRangePicker trong form, `withTime` để thành DateTimeRangePicker. Rule cho khoảng ngày đặt lên **chính object** (zod `.refine(...)` **không có `path`**): khi đang chọn, react-hook-form / vee-validate chỉ revalidate lỗi tại path của field (`period`), không phải `period.to` |
| `FormCheckboxGroup` | CheckboxGroup trong form; `label` thành legend của nhóm; hỗ trợ `separator` |
| `FormSelect` | `multiple` (string[]) hoặc `searchable` thì dùng Combobox; nhận thêm các prop của Combobox (`maxTagCount`, `creatable`, `onSearch`...) |
| `FormRate`, `FormTransfer`, `FormTreeSelect`, `FormCascader` | Nối các component cùng tên với form; value lần lượt là số, mảng key, key hoặc mảng key, đường dẫn hoặc mảng đường dẫn |

**Sheet / Dialog:** `overlay` trên `SheetContent` / `DialogContent`: `"blur"` (mặc định, tối nhẹ + blur), `"dim"` (tối hơn, không blur), `"none"` (trong suốt). Đặt `modal={false}` (Vue: `:modal="false"`) trên Sheet / Dialog thì không có overlay, trang phía sau vẫn bấm và cuộn được; muốn bấm ra ngoài không đóng thì chặn `onInteractOutside` (Vue: `@interact-outside`).

## Chọn dữ liệu

| Component | Cách dùng |
|---|---|
| `Combobox` | Select có ô tìm kiếm (không phân biệt dấu: "ha noi" tìm được "Hà Nội"), dựng trên Popover. `options` ({ value, label, description, disabled, group }), `multiple` (chip, "+N" sau `maxTagCount`, `tagMode="count"`), `value` / `onValueChange` (Vue: `v-model`), `maxCount`, `showSelectAll`, `creatable`, `closeOnSelect`, `clearable`, `onSearch` + `loading` (tìm phía server; Vue: `@search`), `renderOption` (Vue: slot `#option`), `labels`. Bàn phím ↑ ↓ Enter, Backspace xoá chip cuối |
| `Transfer` | Hai danh sách: `dataSource`, `targetKeys` / `onValueChange(keys, direction, moved)` (Vue: `v-model` + `@change`), `selectedKeys` / `onSelectChange` (Vue: `v-model:selected-keys`), `titles`, `showSearch`, `filterOption`, `showSelectAll`, `oneWay` (chỉ chuyển sang phải, bỏ bằng ×), `renderItem` / `footer` (Vue: slot), `listHeight`, `operations`. Double-click một item để chuyển nhanh |
| `Tree` | `treeData` ({ key, title, children, icon, disabled, disableCheckbox, selectable, isLeaf }), `expandedKeys` / `defaultExpandAll`, `expandIcon` (chevron / plus-minus), `showLine`, chọn (`selectable`, `multiple`, `selectedKeys`), checkbox 3 trạng thái (`checkable`, `checkedKeys`, `onCheck(checked, half)`, `checkStrictly`), kéo thả (`draggable`, `allowDrop`, `onDrop` trả về **cây đã di chuyển xong**, thả trước / sau / vào trong), `loadData` (tải con khi mở), `searchValue` / `filterNode`, `titleRender` (Vue: slot `#title`), `height`. Vue: `v-model:expanded-keys / selected-keys / checked-keys`, `@select`, `@check`, `@drop`. Bàn phím ↑ ↓ ← → Enter Space |
| `TreeSelect` | Dropdown chứa Tree: một node, `multiple`, hoặc `treeCheckable` với `showCheckedStrategy` (`"all"` mặc định, `"parent"`: cha đủ con thì chỉ lưu cha, `"child"`: chỉ lá), `showSearch`, `allowClear`, `maxTagCount`, `treeDefaultExpandAll`, `expandIcon`, `showLine`, `loadData`, `dropdownHeight` |
| `Cascader` | Chọn theo cột (tỉnh → quận → phường): `options` ({ value, label, children, disabled, isLeaf }), giá trị là đường dẫn `["hn", "ba-dinh"]` (`multiple`: mảng đường dẫn, checkbox 3 trạng thái, `showCheckedStrategy` mặc định `"parent"`), `changeOnSelect`, `expandTrigger` (click / hover), `displayRender`, `separator`, `showSearch` (tìm theo cả đường dẫn), `loadData`, `allowClear`, `maxTagCount`. Màn hình nhỏ hiện từng cột một kèm nút quay lại |

Logic không phụ thuộc framework nằm trong file TS dùng chung, giống nhau ở hai template: `combobox-utils.ts`, `tree-utils.ts` (lan trạng thái tick, chiến lược giá trị, lọc, `moveNode`), `cascader-utils.ts`.

## Date picker

Bốn component trong `components/common/date-picker/` (Next: react-day-picker, Nuxt: Reka Calendar / RangeCalendar), cùng API. Logic không phụ thuộc framework (format, timezone, giới hạn giờ, mask, preset) nằm trong `date-value.ts` và `date-time.ts`, giống nhau ở hai template.

| Component | Giá trị | Popover |
|---|---|---|
| `DatePicker` | 1 ngày | Lịch; chọn xong tự đóng |
| `DateTimePicker` | ngày + giờ | Lịch + cột giờ / phút (/ giây / AM-PM) cuộn được, footer **Now** / **Done**; đổi ngày giữ nguyên giờ và ngược lại |
| `DateRangePicker` | `{ from, to }` | 2 tháng (`numberOfMonths`), preset bên trái. Click 1 chọn `from`, click 2 chọn `to` (ngày sớm hơn thì tự đảo), click tiếp là khoảng mới |
| `DateTimeRangePicker` | `{ from, to }` kèm giờ | Lịch 1 tháng + cột **Start** / **End**; `to` mặc định 23:59; cùng ngày thì giờ kết thúc không thể trước giờ bắt đầu |

| Prop | Áp dụng | Ý nghĩa |
|---|---|---|
| `value` / `onChange` (Vue: `v-model`), `valueFormat` | tất cả | Format đầu ra, xem bảng bên dưới |
| `minDate` / `maxDate` | tất cả | Giới hạn theo ngày; với picker có giờ, giờ của `minDate` / `maxDate` cũng chặn trong chính ngày đó (vd `minDate={new Date()}` = không chọn quá khứ) |
| `disabledDates` | tất cả | Mảng ngày, hoặc hàm `(day) => boolean` (cuối tuần, ngày lễ...) |
| `displayFormat` | tất cả | Pattern cho chữ hiển thị, vd `"dd/MM/yyyy HH:mm"`; mặc định theo `locale` |
| `editable` | tất cả | Cho gõ tay, có mask theo `displayFormat` (mặc định `dd/MM/yyyy[ HH:mm]`): gõ `151020261430` → `15/10/2026 14:30`. Enter / blur để xác nhận; giá trị sai hoặc ngày bị chặn thì báo đỏ khi Enter, tự trả lại khi blur. Range gõ `dd/MM/yyyy – dd/MM/yyyy` |
| `timeZone` | tất cả | IANA, vd `"America/New_York"`: hiển thị và chọn theo giờ ở đó (có tính DST). `Date` / `"iso"` / `"timestamp"` vẫn là thời điểm tuyệt đối; pattern là giờ treo tường ở múi đó. Tên múi giờ hiện ở footer |
| `locale`, `placeholder`, `clearable`, `disabled`, `labels` | tất cả | `labels` để dịch Now / Done / Start / End / Clear |
| `minuteStep`, `secondStep`, `withSeconds`, `hourCycle` (24 / 12) | có giờ | Cột giờ; 12h thêm cột AM/PM |
| `minTime` / `maxTime` | có giờ | Khung giờ mỗi ngày, vd `"08:00"`–`"17:30"`; giờ ngoài khung bị disable, ngày không còn giờ hợp lệ (hôm nay sau 17:30) cũng bị disable |
| `numberOfMonths`, `maxDays`, `presets` | range | `maxDays`: số ngày tối đa tính cả 2 đầu. `presets`: `true` (Today, Yesterday, Last 7 / 30 days, This / Last month), `createRangePresets({ today: "Hôm nay", ... })` để dịch, hoặc mảng `{ label, range: (today) => ({ from, to }) }` tự định nghĩa |

**`valueFormat`: format của giá trị đầu ra** (cả 4 picker và các Form wrapper). Component nhận lại đúng format đó qua `value` / `v-model`:

| `valueFormat` | Giá trị (chọn 15/10/2026 09:45, giờ VN) |
|---|---|
| `"date"` (mặc định) | `Date` |
| `"iso"` | `"2026-10-15T02:45:00.000Z"` (UTC) |
| `"timestamp"` | `1792032300000` |
| pattern, vd `"yyyy-MM-dd"`, `"dd/MM/yyyy HH:mm"`, `"yyyy-MM-dd'T'HH:mm"` | `"2026-10-15"`, `"15/10/2026 09:45"`... (giờ địa phương, hoặc theo `timeZone`; token `yyyy MM M dd d HH H hh h mm ss a`, chữ cố định đặt trong `'...'`) |
| `{ format, parse }` | Tuỳ ý, vd dayjs hoặc Unix timestamp tính bằng giây |

Field chỉ có ngày thì nên dùng `"yyyy-MM-dd"`: `"iso"` đổi nửa đêm giờ địa phương sang UTC, nên ở VN sẽ ra ngày hôm trước (`…-14T17:00:00Z`). Các hàm `formatDateValue`, `parseDateValue`, `formatDatePattern`, `parseDatePattern`, `toZonedTime`, `fromZonedTime` được export từ `components/common/date-picker` nếu cần dùng ở chỗ khác.

## TruncatedText

Cắt chữ bằng `…` khi không đủ chỗ; rê chuột vào chữ **bị cắt** thì hiện tooltip đầy đủ nội dung, còn chữ vừa đủ thì không hiện gì. Dùng được ở bất kỳ đâu: ô bảng, Card, Sidebar, tên file, item của menu...

```tsx
<TruncatedText>{user.company}</TruncatedText>                // 1 dòng
<TruncatedText lines={2}>{product.description}</TruncatedText> // tối đa 2 dòng (line-clamp, 2–6)
<TruncatedText tooltip={false}>{label}</TruncatedText>         // chỉ cắt, không tooltip
```

- Cả app chỉ có **một tooltip** và một listener, do `TruncateTooltipProvider` quản lý. Provider này đặt sẵn trong `providers.tsx` (Next) và `app.vue` (Nuxt), nên gắn `TruncatedText` ở hàng nghìn chỗ vẫn nhẹ.
- Không muốn dùng component thì gắn thẳng attribute `data-truncate` cùng class `truncate` (hoặc `line-clamp-N`) lên phần tử có sẵn.
- Phần tử cha phải giới hạn độ rộng, ví dụ ô bảng, `w-48`, hoặc `flex-1` trong một hàng flex. `TruncatedText` đã có sẵn `min-w-0`.
- Tooltip hiển thị chữ thuần, lấy từ `innerText`. Nếu quên đặt Provider, chữ vẫn bị cắt nhưng không có tooltip, và ở chế độ dev sẽ có cảnh báo trong console.

## Storybook

Mọi component đều có story, và mỗi component có thêm một trang **Docs** sinh tự động (bảng props + toàn bộ biến thể). Nút đổi theme trên toolbar giúp xem cả light lẫn dark.

```bash
npm run storybook:next   # http://localhost:6006
npm run storybook:nuxt   # http://localhost:6007
```

| Nhóm | Nội dung |
|---|---|
| `UI/*` | Toàn bộ base component trong `components/ui` (31 component; Nuxt có thêm `Form (vee-validate)`), mỗi cái gồm các variant, size và state (disabled, invalid, loading...) |
| `Common/*` | Cascader, CheckboxGroup, Collapse, Combobox, ConfirmDialog (kể cả async và lỗi), DataTable, DatePicker, EmptyState, Form, PageHeader, ProgressBar, ProgressCircle, Rate, Stepper, ThemeToggle, Transfer, Tree, TreeSelect, TruncatedText |
| `Layout/*` | AppShell: sidebar + header, đổi trang active qua `parameters` |

Story nằm trong folder `stories/` riêng của mỗi template, **không** nằm trong `components/`, nên `components/ui` luôn chỉ chứa code component và copy đi dùng được ngay:

```
templates/next/stories/{ui,common,layout}/*.stories.tsx
templates/nuxt/stories/{ui,common,layout}/*.stories.ts
```

Khi thêm component mới, bạn copy một story có sẵn trong `stories/` rồi sửa lại (import qua alias `@/components/...`).

Với Nuxt, Storybook chạy Vue thuần (không có Nuxt runtime). Component nào cần composable của Nuxt thì import tường minh từ `#imports` / `#components`, và hai module này được mock trong `.storybook/mocks/`.
