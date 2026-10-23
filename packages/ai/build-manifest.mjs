// Builds ai/components.json + ai/components.md for the template it runs in:
// every public component with its props (read from the TypeScript types and
// JSDoc), import path and story file. AI assistants read these (directly or
// through ai/mcp-server.mjs) so they reuse the kit instead of re-inventing it.
//
//   node ai/build-manifest.mjs           write the files
//   node ai/build-manifest.mjs --check   exit 1 when they are out of date
//
// React uses react-docgen-typescript, Vue uses vue-component-meta (the same
// extractors Storybook uses for its Docs tab).
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')
const require = createRequire(join(root, 'package.json'))

const vue = existsSync(join(root, 'nuxt.config.ts'))
const componentsDir = join(root, vue ? 'app/components' : 'src/components')
const storiesDir = join(root, 'stories')
const LAYERS = ['common', 'layout', 'ui']

const posix = (path) => path.split(sep).join('/')
const rel = (path) => posix(relative(root, path))
const pascal = (name) => name.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase())
const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '')
const clean = (text) => (text ?? '').trim()
const stripUndefined = (type) => type.replace(/\s*\|\s*undefined\b/g, '').trim()
const jsdocText = (body) =>
  (body ?? '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, ''))
    .join('\n')
    .trim()

function walk(dir, ext) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.')) // .DS_Store & co. differ per machine
    .flatMap((entry) => {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) return walk(path, ext)
      return !ext || extname(entry.name) === ext ? [path] : []
    })
    .sort()
}

// Lets ai/mcp-server.mjs notice components edited after the last build
// (content-based: clone / checkout times don't matter).
function sourceHash() {
  const hash = createHash('sha256')
  for (const file of walk(componentsDir)) {
    const content = readFileSync(file, 'utf8').replace(/\r\n/g, '\n') // CRLF checkouts hash the same
    hash.update(posix(relative(componentsDir, file))).update('\0').update(content).update('\0')
  }
  return hash.digest('hex').slice(0, 16)
}

// A component inside a folder that has an index.ts is public only when the
// index re-exports it; the rest (PickerTrigger, TreeHighlight...) are parts.
const indexCache = new Map()
function folderIndex(dir) {
  if (!indexCache.has(dir)) {
    const file = join(dir, 'index.ts')
    indexCache.set(dir, existsSync(file) ? readFileSync(file, 'utf8') : null)
  }
  return indexCache.get(dir)
}
const exportedFrom = (index, name) => new RegExp(`\\b${name}\\b`).test(index)

// Where inherited props come from: "@radix-ui/react-dialog", "reka-ui"...
// React's own attribute types read better as "HTML attributes".
function packageOf(file) {
  const name = posix(file).match(/node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1] ?? 'external'
  return name === '@types/react' ? 'HTML attributes' : name
}

function layerOf(file) {
  const [layer] = posix(relative(componentsDir, file)).split('/')
  return LAYERS.includes(layer) ? layer : null
}

// ---------------------------------------------------------------- React ----

function extractReact() {
  const docgen = require('react-docgen-typescript')
  const inherited = new Map()
  const parser = docgen.withCustomConfig(join(root, 'tsconfig.json'), {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    // Keep the kit's own props; only remember where the rest come from
    // (Radix, native element attributes...).
    propFilter: (prop, component) => {
      const parent = prop.parent ?? prop.declarations?.[0]
      if (!parent || !/node_modules/.test(parent.fileName)) return true
      if (!inherited.has(component.name)) inherited.set(component.name, new Set())
      inherited.get(component.name).add(packageOf(parent.fileName))
      return false
    },
  })

  const files = walk(componentsDir, '.tsx').filter(layerOf)
  const docs = parser.parse(files).map((doc) => ({
    file: resolve(root, doc.filePath),
    name: doc.displayName,
    description: clean(doc.description),
    props: Object.values(doc.props).map((prop) => ({
      name: prop.name,
      type:
        prop.type.name === 'enum' && Array.isArray(prop.type.value)
          ? prop.type.value.map((v) => v.value).join(' | ')
          : prop.type.name,
      required: prop.required,
      default: prop.defaultValue?.value ?? undefined,
      description: clean(prop.description),
    })),
    inherits: [...(inherited.get(doc.displayName) ?? [])].sort(),
  }))

  // react-docgen-typescript skips components without a props parameter
  // (ThemeToggle(), AppHeader()...): pick those up from the source.
  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    for (const match of source.matchAll(/(?:\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*)?export function ([A-Z]\w*)\s*\(\s*\)/g)) {
      if (docs.some((d) => d.file === file && d.name === match[2])) continue
      docs.push({ file, name: match[2], description: jsdocText(match[1]), props: [], inherits: [] })
    }
  }

  const modules = new Map()
  for (const { file, ...component } of docs) {
    const dir = dirname(file)
    const index = dir !== join(componentsDir, layerOf(file)) ? folderIndex(dir) : null
    if (index !== null && !exportedFrom(index, component.name)) continue

    const id = rel(file)
    if (!modules.has(id)) {
      const importPath = posix(relative(componentsDir, index !== null ? dir : file.slice(0, -4)))
      modules.set(id, {
        name: pascal(basename(file, '.tsx')),
        layer: layerOf(file),
        file: id,
        importFrom: `@/components/${importPath}`,
        components: [],
      })
    }
    modules.get(id).components.push(component)
  }
  return [...modules.values()]
}

// ------------------------------------------------------------------ Vue ----

// vue-component-meta has no component-level description, so read it from
// the kit's convention: the JSDoc block right before defineProps (a
// defineOptions call may sit in between), or, for a component without
// props, the first JSDoc block after the imports.
function vueDescription(source) {
  const script = source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? ''
  const beforeProps = script.match(
    /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*(?:defineOptions\([^)]*\)\s*)?(?:const\s+(?:\w+|\{[^}]*\})\s*=\s*)?(?:withDefaults\(\s*)?defineProps/,
  )
  if (beforeProps) return jsdocText(beforeProps[1])
  const first = script.indexOf('/**')
  if (first === -1) return ''
  const head = script
    .slice(0, first)
    .replace(/^import\s[\s\S]*?from\s+['"][^'"]+['"]\s*$/gm, '')
    .replace(/^import\s+['"][^'"]+['"]\s*$/gm, '')
  return head.trim() === '' ? jsdocText(script.slice(first + 3, script.indexOf('*/', first))) : ''
}

const fromNodeModules = (item) =>
  item.declarations?.length > 0 && item.declarations.every((d) => /node_modules/.test(d.file))

function extractVue() {
  const tsconfig = join(root, '.nuxt/tsconfig.app.json')
  if (!existsSync(tsconfig)) {
    console.error('Missing .nuxt/tsconfig.app.json: run `npx nuxt prepare` (or `npm install`) first.')
    process.exit(1)
  }
  const { createChecker } = require('vue-component-meta')
  const checker = createChecker(tsconfig, { schema: false, printer: { newLine: 1 } })

  const modules = new Map()
  for (const file of walk(componentsDir, '.vue').filter(layerOf)) {
    const layer = layerOf(file)
    const dir = dirname(file)
    const name = basename(file, '.vue')
    const index = dir !== join(componentsDir, layer) ? folderIndex(dir) : null
    if (index !== null && !exportedFrom(index, name)) continue

    // shadcn-vue puts one component per file; group a ui folder (dialog/*)
    // into one module like the single React file.
    const id = layer === 'ui' ? rel(dir) : rel(file)
    if (!modules.has(id)) {
      modules.set(id, {
        name: layer === 'ui' ? pascal(basename(dir)) : name,
        layer,
        file: id,
        importFrom: `@/components/${posix(relative(componentsDir, index !== null ? dir : file))}`,
        defaultExport: index === null,
        components: [],
      })
    }

    const meta = checker.getComponentMeta(file)
    const inherits = new Set()
    const props = []
    for (const prop of meta.props) {
      if (prop.global) continue
      if (fromNodeModules(prop)) {
        inherits.add(packageOf(prop.declarations[0].file))
        continue
      }
      props.push({
        name: prop.name,
        type: stripUndefined(prop.type),
        required: prop.required,
        default: prop.default ?? undefined,
        description: clean(prop.description),
      })
    }
    modules.get(id).components.push({
      name,
      description: vueDescription(readFileSync(file, 'utf8')),
      props,
      events: meta.events.map((event) => ({
        name: event.name,
        type: event.type,
        description: clean(event.description),
      })),
      slots: meta.slots.map((slot) => ({
        name: slot.name,
        type: slot.type,
        description: clean(slot.description),
      })),
      inherits: [...inherits].sort(),
    })
  }
  return [...modules.values()]
}

// -------------------------------------------------------------- Stories ----

// Match each module to the story whose title ends in its name (Common/Rate),
// falling back to its folder (Common/Form covers every form/* wrapper).
function attachStories(modules) {
  const stories = walk(storiesDir, vue ? '.ts' : '.tsx')
    .filter((file) => file.includes('.stories.'))
    .map((file) => {
      const title = readFileSync(file, 'utf8').match(/title:\s*['"`]([^'"`]*\/[^'"`]+)['"`]/)?.[1]
      return title && { file: rel(file), title, key: normalize(title.split('/').pop()) }
    })
    .filter(Boolean)

  for (const mod of modules) {
    const folder = basename(dirname(join(root, mod.file)))
    const story =
      stories.find((s) => s.key === normalize(mod.name)) ??
      stories.find((s) => s.key === normalize(folder) && s.title.toLowerCase().startsWith(mod.layer))
    if (story) mod.story = { file: story.file, title: story.title }
  }
}

// --------------------------------------------------------------- Output ----

function sortModules(modules) {
  for (const mod of modules) {
    // The component named like the module first (Dialog before DialogContent).
    mod.components.sort((a, b) =>
      a.name === mod.name ? -1 : b.name === mod.name ? 1 : a.name.localeCompare(b.name),
    )
  }
  return modules.sort(
    (a, b) => LAYERS.indexOf(a.layer) - LAYERS.indexOf(b.layer) || a.name.localeCompare(b.name),
  )
}

function importLine(mod, framework) {
  const names = mod.components.map((c) => c.name)
  if (framework === 'vue' && mod.defaultExport) return `import ${names[0]} from '${mod.importFrom}'`
  return framework === 'vue'
    ? `import { ${names.join(', ')} } from '${mod.importFrom}'`
    : `import { ${names.join(', ')} } from "${mod.importFrom}"`
}

const firstSentence = (text) => text.split(/\n\n/)[0].replace(/\s+/g, ' ').trim()

function renderMarkdown(manifest) {
  const framework = manifest.framework
  const lines = [
    `# Components (${framework === 'vue' ? 'Nuxt / Vue' : 'Next.js / React'})`,
    '',
    '> Generated by `npm run ai:manifest` from the component source. Do not edit by hand.',
    '> Full props, events and slots: `ai/components.json`, or the `kit-components` MCP server',
    '> (`get_component`, `get_component_examples`). Usage examples: the story files.',
    '',
  ]
  if (framework === 'vue') {
    lines.push(
      '> In pages and layouts, components are auto-imported (`<DataTable>`, `<Button>`); inside',
      '> `components/` import them explicitly with the line shown, so Storybook can render them.',
      '',
    )
  }
  for (const layer of LAYERS) {
    const modules = manifest.modules.filter((m) => m.layer === layer)
    if (modules.length === 0) continue
    lines.push(`## ${layer}`, '')
    for (const mod of modules) {
      const main = mod.components[0]
      lines.push(`### ${mod.name}`)
      if (main.description) lines.push(firstSentence(main.description))
      lines.push(`- import: \`${mod.import}\``)
      for (const component of mod.components) {
        const vModel = framework === 'vue' && component.events?.some((e) => e.name === 'update:modelValue')
        const props = component.props
          .filter((p) => !(vModel && p.name === 'modelValue'))
          .map((p) => (p.required ? `${p.name}*` : p.name))
        if (vModel) props.unshift('v-model')
        const inherits = component.inherits.map((n) => (n === 'HTML attributes' ? n : `${n} props`))
        const extra = inherits.length > 0 ? ` (+ ${inherits.join(', ')})` : ''
        if (props.length > 0 || extra) {
          const label = mod.components.length > 1 ? component.name : 'props'
          lines.push(`- ${label}: ${props.join(', ') || 'no own props'}${extra}`)
        }
      }
      if (mod.story) lines.push(`- story: \`${mod.story.file}\``)
      lines.push('')
    }
  }
  return lines.join('\n')
}

function main() {
  const modules = sortModules(vue ? extractVue() : extractReact())
  attachStories(modules)
  const framework = vue ? 'vue' : 'react'
  for (const mod of modules) mod.import = importLine(mod, framework)
  const manifest = { framework, componentsDir: rel(componentsDir), sourceHash: sourceHash(), modules }

  const outputs = {
    'ai/components.json': JSON.stringify(manifest, null, 2) + '\n',
    'ai/components.md': renderMarkdown(manifest),
  }

  if (check) {
    const stale = Object.entries(outputs).filter(([file, content]) => {
      const path = join(root, file)
      return !existsSync(path) || readFileSync(path, 'utf8') !== content
    })
    if (stale.length > 0) {
      console.error(`Out of date: ${stale.map(([f]) => f).join(', ')}. Run \`npm run ai:manifest\`.`)
      process.exit(1)
    }
    console.log(`ai/components.* up to date (${modules.length} modules)`)
    return
  }

  const undocumented = modules.filter((m) => m.layer !== 'ui' && !m.components[0].description)
  if (undocumented.length > 0) {
    console.warn(
      `No description (add a JSDoc comment ${vue ? 'before defineProps, or after the imports when there are no props' : 'on the component'}): ` +
        undocumented.map((m) => m.name).join(', '),
    )
  }

  mkdirSync(join(root, 'ai'), { recursive: true })
  for (const [file, content] of Object.entries(outputs)) writeFileSync(join(root, file), content)
  const count = modules.reduce((n, m) => n + m.components.length, 0)
  console.log(`ai/components.json + ai/components.md: ${modules.length} modules, ${count} components`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
