# FE starter kit: monorepo rules

This repo builds two **parallel** starter templates that share one design-token file:

- `templates/next`: Next.js 16 · React 19 · shadcn/ui (Radix) · react-hook-form + zod 4
- `templates/nuxt`: Nuxt 4 · Vue 3.5 · shadcn-vue (Reka UI) · vee-validate + zod 3

Each template has its own `AGENTS.md` with the rules for writing app code in it. Read it before touching that template. This file covers working on the kit itself.

## Keep the templates in parity

- A component added or changed in one template gets the same change in the other: same name, same props, same behaviour. The Vue API differs only where Vue does (`v-model` instead of `value` / `onValueChange`, slots instead of render props, kebab-case events). The root `README.md` documents the shared API; update it with the change.
- Framework-agnostic logic lives in plain TS files with the **same logic** in both templates, each written in its template's code style (Next: double quotes, `type`; Nuxt: single quotes, `interface`): `combobox-utils.ts`, `tree-utils.ts`, `cascader-utils.ts`, `date-value.ts`, `date-time.ts`, `filter-fns.ts`... Make the same change in both copies.
- Add shadcn base components to both: `npx shadcn@latest add <name> -c templates/next` and `npx shadcn-vue@latest add <name> -c templates/nuxt`.
- Stories live in `templates/*/stories/`, never inside `components/`, so `components/ui` stays copy-paste clean. Every component has one.

## Generated files: don't edit by hand

| File | Source | Regenerate |
|---|---|---|
| `templates/next/src/styles/tokens.css`, `templates/nuxt/app/assets/css/tokens.css` | `packages/tokens/tokens.css` | `npm run sync:tokens` |
| `templates/*/ai/build-manifest.mjs`, `templates/*/ai/mcp-server.mjs` | `packages/ai/*.mjs` | `npm run sync:ai` |
| `templates/*/ai/components.json`, `templates/*/ai/components.md` | the components' TS types + JSDoc | `npm run sync:ai` |
| The `nextjs-agent-rules` block in `templates/next/AGENTS.md` | `next dev` | automatic |

After changing any component, run `npm run sync:ai` and commit the updated `ai/` files.

## Before you finish

```bash
npm run typecheck && npm run lint && npm run check:ai
```

`npm run build` syncs tokens and the AI files, then builds both templates.

## AI tooling (`packages/ai`)

- `build-manifest.mjs` extracts each template's components with react-docgen-typescript (Next) or vue-component-meta (Nuxt) into `ai/components.json` + `ai/components.md`.
- `mcp-server.mjs` is a dependency-free stdio MCP server (`kit-components`) over that manifest: `list_components`, `search_components`, `get_component`, `get_component_examples` (code from the stories), `get_project_guidelines` (the `kit-rules` block of the template's `AGENTS.md`).
- `.mcp.json` at the root registers `kit-next` and `kit-nuxt` for working here; each template has its own `.mcp.json`, `.cursor/mcp.json` and `.vscode/mcp.json`.
