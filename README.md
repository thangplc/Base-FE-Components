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

## Phát triển chính kit này (monorepo)

```bash
npm install            # cài cho toàn bộ workspace

npm run dev:next       # http://localhost:3000
npm run dev:nuxt       # http://localhost:3000 (chạy riêng từng cái hoặc đổi port)
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
| Data | `DataTable` (search, sort, ẩn/hiện cột, phân trang), `DataTableColumnHeader` | `DataTable`, `DataTableColumnHeader`, helper `sortableHeader()` |
| Khác | `ConfirmDialog` (hỗ trợ async), `EmptyState`, `PageHeader`, `ThemeToggle` | Giống bên Next |
| Layout | `AppShell` = Sidebar (thu gọn được) + Header (breadcrumb, theme toggle) | Giống bên Next (`layouts/default.vue`) |

Chi tiết cách dùng nằm trong README của từng template và trong Storybook.
