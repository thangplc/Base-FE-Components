// AUTO-GENERATED from packages/ai/mcp-server.mjs — edit there, then run `npm run sync:ai`.
// (Once this template is pulled out on its own, edit this file directly.)
// MCP server (stdio) that lets AI assistants look up the kit's components:
// what exists, its props, and real usage taken from the story files. It reads
// ai/components.json (built by ai/build-manifest.mjs) and has no dependencies,
// so it runs anywhere Node does:
//
//   node ai/mcp-server.mjs [projectDir]
//
// Wired up in .mcp.json (Claude Code), .cursor/mcp.json and .vscode/mcp.json.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

const root = process.argv[2] ? resolve(process.argv[2]) : resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifestFile = join(root, 'ai/components.json')
const SERVER = { name: 'kit-components', version: '1.0.0' }
const PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05']
const MAX_EXAMPLE_CHARS = 16000

// ------------------------------------------------------------ Manifest ----

let cache = { mtime: 0, manifest: null }

function loadManifest() {
  if (!existsSync(manifestFile)) {
    throw new Error('ai/components.json not found. Run `npm run ai:manifest` in the project root.')
  }
  const { mtimeMs } = statSync(manifestFile)
  if (mtimeMs !== cache.mtime) cache = { mtime: mtimeMs, manifest: JSON.parse(readFileSync(manifestFile, 'utf8')) }
  return cache.manifest
}

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.'))
    .flatMap((entry) => (entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)]))
    .sort()
}

// Same hash as build-manifest.mjs. Components edited after the manifest was
// built: say so instead of serving outdated props silently.
function staleNote(manifest) {
  const dir = join(root, manifest.componentsDir)
  if (!manifest.sourceHash || !existsSync(dir)) return ''
  const hash = createHash('sha256')
  for (const file of listFiles(dir)) {
    const content = readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
    hash.update(relative(dir, file).split(sep).join('/')).update('\0').update(content).update('\0')
  }
  if (hash.digest('hex').slice(0, 16) === manifest.sourceHash) return ''
  return '> Note: components changed after ai/components.json was built; props may be outdated. Run `npm run ai:manifest`.\n\n'
}

const key = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, '')
const fold = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()
const oneLine = (text) => (text ?? '').replace(/\s+/g, ' ').trim()
const firstSentence = (text) => oneLine((text ?? '').split(/\n\n/)[0])
const cell = (text) => oneLine(text).replace(/\|/g, '\\|')

function findModule(manifest, name) {
  const k = key(name)
  return (
    manifest.modules.find((m) => key(m.name) === k) ??
    manifest.modules.find((m) => m.components.some((c) => key(c.name) === k))
  )
}

// --------------------------------------------------------------- Search ----

// Everyday words (English + Vietnamese, without diacritics) → kit names.
const SYNONYMS = {
  dropdown: ['select', 'combobox', 'dropdownmenu'],
  autocomplete: ['combobox'],
  typeahead: ['combobox'],
  multiselect: ['combobox', 'multiple'],
  tag: ['badge', 'combobox'],
  chip: ['badge', 'combobox'],
  modal: ['dialog'],
  popup: ['dialog', 'popover'],
  drawer: ['sheet'],
  toast: ['sonner', 'toast'],
  notification: ['sonner', 'toast'],
  snackbar: ['sonner'],
  alert: ['alertdialog', 'confirmdialog'],
  confirm: ['confirmdialog'],
  grid: ['datatable', 'table'],
  table: ['datatable'],
  list: ['datatable'],
  paging: ['pagination'],
  calendar: ['datepicker', 'calendar'],
  date: ['datepicker'],
  time: ['datetimepicker'],
  rating: ['rate'],
  star: ['rate'],
  wizard: ['stepper'],
  step: ['stepper'],
  accordion: ['collapse', 'accordion'],
  loading: ['spinner', 'skeleton'],
  ellipsis: ['truncatedtext'],
  truncate: ['truncatedtext'],
  overflow: ['truncatedtext'],
  hierarchy: ['tree', 'treeselect', 'cascader'],
  nested: ['tree', 'cascader'],
  shuttle: ['transfer'],
  toggle: ['switch'],
  radio: ['radiogroup'],
  empty: ['emptystate'],
  theme: ['themetoggle'],
  progress: ['progressbar', 'progresscircle'],
  'bang': ['datatable'],
  'danh sach': ['datatable'],
  'phan trang': ['pagination'],
  'ngay': ['datepicker'],
  'gio': ['datetimepicker'],
  'chon': ['select', 'combobox'],
  'nut': ['button'],
  'hop thoai': ['dialog'],
  'thong bao': ['sonner', 'toast'],
  'xac nhan': ['confirmdialog'],
  'danh gia': ['rate'],
  'cay': ['tree'],
  'bieu mau': ['form'],
  'tim kiem': ['search', 'combobox'],
  'tien trinh': ['progressbar'],
  'tinh thanh': ['cascader'],
}

const STOPWORDS = new Set(
  (
    'a an and the of to in on for with without by from before after when that this it is are be can should ' +
    'co cho va la cac mot nhung cua khi thi de duoc trong ngoai voi'
  ).split(' '),
)

// term → weight. A two-word Vietnamese phrase ("tinh thanh") is a stronger
// hint than a single word, so its targets weigh more.
function searchTerms(query) {
  const folded = fold(query)
  const terms = new Map()
  const add = (term, weight) => terms.set(term, Math.max(terms.get(term) ?? 0, weight))
  const words = folded.split(/[^a-z0-9]+/).filter((t) => t.length >= 2 && !STOPWORDS.has(t))
  words.forEach((t) => add(t, 1))
  for (const [word, targets] of Object.entries(SYNONYMS)) {
    const phrase = word.includes(' ')
    const hit = phrase
      ? new RegExp(`(^|[^a-z0-9])${word}([^a-z0-9]|$)`).test(folded)
      : words.some((t) => t === word || t.replace(/s$/, '') === word)
    if (hit) targets.forEach((t) => add(t, phrase ? 2 : 1))
  }
  return terms
}

function search(manifest, query, limit) {
  const terms = searchTerms(query)
  const scored = manifest.modules.map((mod) => {
    let score = 0
    const description = fold(mod.components.map((c) => c.description).join(' '))
    const props = mod.components.flatMap((c) => c.props.map((p) => fold(`${p.name} ${p.description}`)))
    for (const [term, weight] of terms) {
      let s = 0
      if (key(mod.name) === term) s += 10
      else if (key(mod.name).includes(term)) s += 6
      else if (mod.components.some((c) => key(c.name).includes(term))) s += 4
      if (description.includes(term)) s += 2
      s += Math.min(3, props.filter((p) => p.includes(term)).length) * 0.5
      score += s * weight
    }
    // Prefer the composed kit component over the raw primitive on ties.
    if (score > 0 && mod.layer === 'common') score += 0.5
    return { mod, score }
  })
  const best = Math.max(0, ...scored.map((s) => s.score))
  return scored
    .filter((s) => s.score > 0 && s.score >= best * 0.25) // drop weak tails ("before" in a description)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.mod)
}

function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const next = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = row[j]
      row[j] = next
    }
  }
  return row[b.length]
}

// For typos ("DialogContnt"): the closest component names.
function closestNames(manifest, name) {
  const k = key(name)
  const names = [...new Set(manifest.modules.flatMap((m) => [m.name, ...m.components.map((c) => c.name)]))]
  return names
    .map((n) => ({ n, d: distance(k, key(n)) }))
    .filter(({ d }) => d <= Math.max(2, Math.floor(k.length / 4)))
    .sort((a, b) => a.d - b.d)
    .slice(0, 5)
    .map(({ n }) => n)
}

// -------------------------------------------------------------- Stories ----

function readStories(mod) {
  if (!mod.story) return null
  const source = readFileSync(join(root, mod.story.file), 'utf8')
  const marks = [...source.matchAll(/^(?:\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*\n)?export const (\w+)/gm)]
  const stories = marks.map((mark, i) => ({
    name: mark[2],
    description: oneLine((mark[1] ?? '').replace(/^\s*\*\s?/gm, '')),
    code: source.slice(mark.index, marks[i + 1]?.index ?? source.length).trim(),
  }))
  return { preamble: source.slice(0, marks[0]?.index ?? source.length).trim(), stories }
}

// ------------------------------------------------------------ Rendering ----

function describeModule(manifest, mod) {
  const vue = manifest.framework === 'vue'
  const out = [`# ${mod.name} (${mod.layer})`, '']
  const main = mod.components[0]
  if (main.description) out.push(main.description, '')
  out.push(`Import: \`${mod.import}\``)
  if (vue && mod.layer !== 'ui') out.push('(Auto-imported in pages/layouts; import explicitly inside components/.)')
  if (vue && mod.layer === 'ui') out.push('(Auto-registered by shadcn-nuxt in pages/layouts; import explicitly inside components/.)')
  out.push(`Source: \`${mod.file}\``)
  const stories = readStories(mod)
  if (stories) {
    out.push(
      `Story: \`${mod.story.file}\` (${mod.story.title}): ${stories.stories.map((s) => s.name).join(', ')}`,
      'Call get_component_examples for the code.',
    )
  }

  for (const component of mod.components) {
    out.push('', `## ${component.name}`)
    if (component !== main && component.description) out.push('', component.description)
    if (component.props.length > 0) {
      out.push('', '| Prop | Type | Default | Description |', '|---|---|---|---|')
      for (const p of component.props) {
        const name = `\`${p.name}\`${p.required ? ' (required)' : ''}`
        out.push(`| ${name} | \`${cell(p.type)}\` | ${p.default !== undefined ? `\`${cell(p.default)}\`` : ''} | ${cell(p.description)} |`)
      }
    } else {
      out.push('', 'No props of its own.')
    }
    if (component.inherits.length > 0) out.push('', `Also accepts: ${component.inherits.join(', ')}${component.inherits.includes('HTML attributes') ? '' : ' props'}.`)
    if (component.events?.length > 0) {
      out.push('', '| Event | Payload | Description |', '|---|---|---|')
      for (const e of component.events) out.push(`| \`@${e.name}\` | \`${cell(e.type)}\` | ${cell(e.description)} |`)
    }
    if (component.slots?.length > 0) {
      out.push('', '| Slot | Props | Description |', '|---|---|---|')
      for (const s of component.slots) out.push(`| \`#${s.name}\` | \`${cell(s.type)}\` | ${cell(s.description)} |`)
    }
  }
  return out.join('\n')
}

function summaryLine(mod) {
  const description = firstSentence(mod.components[0].description)
  if (description) return `- **${mod.name}**: ${description.length > 160 ? `${description.slice(0, 157)}...` : description}`
  const parts = mod.components.map((c) => c.name)
  return `- **${mod.name}**${parts.length > 1 ? `: ${parts.join(', ')}` : ''}`
}

// ---------------------------------------------------------------- Tools ----

const tools = [
  {
    name: 'list_components',
    description:
      "List every component in this project's UI kit, grouped by layer: `common` (composed, ready for features: DataTable, Form*, DatePicker, Combobox...), `layout` (AppShell...) and `ui` (shadcn base primitives). Check this before building UI so you reuse the kit instead of writing new components or raw HTML.",
    inputSchema: {
      type: 'object',
      properties: { layer: { type: 'string', enum: ['common', 'layout', 'ui'], description: 'Only this layer.' } },
    },
    run({ layer }) {
      const manifest = loadManifest()
      const out = [`${manifest.framework === 'vue' ? 'Nuxt / Vue' : 'Next.js / React'} kit. Use get_component for props.`]
      for (const name of ['common', 'layout', 'ui']) {
        if (layer && layer !== name) continue
        const modules = manifest.modules.filter((m) => m.layer === name)
        if (modules.length > 0) out.push('', `## ${name}`, ...modules.map(summaryLine))
      }
      return staleNote(manifest) + out.join('\n')
    },
  },
  {
    name: 'search_components',
    description:
      'Find kit components for a UI need, in plain words (English or Vietnamese), e.g. "searchable multi select", "table with server-side paging", "confirm before delete", "chọn tỉnh thành". Searches names, descriptions and props. Returns the best matches with their import line.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What the UI needs to do.' },
        limit: { type: 'number', description: 'Max results (default 6).' },
      },
      required: ['query'],
    },
    run({ query, limit = 6 }) {
      const manifest = loadManifest()
      const results = search(manifest, String(query), Math.max(1, Math.min(20, Number(limit) || 6)))
      if (results.length === 0) return `No component matches "${query}". Try list_components, or other words.`
      return (
        staleNote(manifest) +
        results.map((m) => `${summaryLine(m)}\n  \`${m.import}\``).join('\n') +
        '\n\nCall get_component with a name for its props.'
      )
    },
  },
  {
    name: 'get_component',
    description:
      'Full API of one kit component: description, import line, every prop (type, default, description), events and slots (Vue), the parts it is made of, and its story file. Accepts the component or a part name (e.g. "DataTable", "DialogContent", "FormSelect").',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'Component name, e.g. "DataTable".' } },
      required: ['name'],
    },
    run({ name }) {
      const manifest = loadManifest()
      const mod = findModule(manifest, String(name))
      if (!mod) {
        const near = closestNames(manifest, String(name))
        if (near.length === 0) near.push(...search(manifest, String(name), 5).map((m) => m.name))
        throw new Error(`No component "${name}".${near.length > 0 ? ` Did you mean: ${near.join(', ')}?` : ''}`)
      }
      return staleNote(manifest) + describeModule(manifest, mod)
    },
  },
  {
    name: 'get_component_examples',
    description:
      "Working usage code for a kit component, taken from its Storybook stories (the project's canonical examples). Without `story` it lists all stories and returns the first ones; pass `story` (e.g. \"ServerSide\") for one in particular.",
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Component name, e.g. "DataTable".' },
        story: { type: 'string', description: 'Story export name, e.g. "WithFilters".' },
      },
      required: ['name'],
    },
    run({ name, story }) {
      const manifest = loadManifest()
      const mod = findModule(manifest, String(name))
      if (!mod) {
        const near = closestNames(manifest, String(name))
        throw new Error(`No component "${name}".${near.length > 0 ? ` Did you mean: ${near.join(', ')}?` : ' Use search_components.'}`)
      }
      const parsed = readStories(mod)
      if (!parsed || parsed.stories.length === 0) return `${mod.name} has no story file. See get_component for its props.`

      const header = [`Stories in \`${mod.story.file}\`:`]
      for (const s of parsed.stories) header.push(`- ${s.name}${s.description ? `: ${s.description}` : ''}`)
      let picked = parsed.stories
      if (story) {
        picked = parsed.stories.filter((s) => key(s.name) === key(String(story)))
        if (picked.length === 0) throw new Error(`No story "${story}" in ${mod.story.file}.\n${header.join('\n')}`)
      }

      const lang = mod.story.file.endsWith('.tsx') ? 'tsx' : 'ts'
      const preamble = parsed.preamble.length > 4000 ? `${parsed.preamble.slice(0, 4000)}\n// ... (truncated)` : parsed.preamble
      const out = [...header, '', 'Imports and shared setup:', '```' + lang, preamble, '```']
      let size = out.join('\n').length
      const skipped = []
      for (const s of picked) {
        if (size + s.code.length > MAX_EXAMPLE_CHARS && s !== picked[0]) {
          skipped.push(s.name)
          continue
        }
        out.push('', `### ${s.name}`, '```' + lang, s.code, '```')
        size += s.code.length
      }
      if (skipped.length > 0) out.push('', `Not shown (size limit): ${skipped.join(', ')}. Ask for one with \`story\`.`)
      return out.join('\n')
    },
  },
  {
    name: 'get_project_guidelines',
    description:
      "This project's frontend rules: which component to use for what, layering (ui / common / features), styling with design tokens, forms, data tables, and the checks to run before finishing. Read once before writing UI code.",
    inputSchema: { type: 'object', properties: {} },
    run() {
      const file = join(root, 'AGENTS.md')
      if (!existsSync(file)) return 'No AGENTS.md in this project.'
      const text = readFileSync(file, 'utf8')
      const block = text.match(/<!-- BEGIN:kit-rules -->([\s\S]*?)<!-- END:kit-rules -->/)
      return (block ? block[1] : text).trim()
    },
  },
]

// ------------------------------------------------------------- Protocol ----

const INSTRUCTIONS =
  "Catalog of this project's UI kit. Before writing UI, look here (search_components / list_components) and reuse kit components instead of creating new ones or using raw HTML elements. get_component gives exact props; get_component_examples gives working code from the stories."

function handle(message) {
  const { id, method, params } = message
  switch (method) {
    case 'initialize': {
      const requested = params?.protocolVersion
      return {
        protocolVersion: PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER,
        instructions: INSTRUCTIONS,
      }
    }
    case 'ping':
      return {}
    case 'tools/list':
      return { tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) }
    case 'tools/call': {
      const tool = tools.find((t) => t.name === params?.name)
      if (!tool) throw Object.assign(new Error(`Unknown tool: ${params?.name}`), { code: -32602 })
      try {
        return { content: [{ type: 'text', text: tool.run(params.arguments ?? {}) }] }
      } catch (error) {
        return { content: [{ type: 'text', text: error.message }], isError: true }
      }
    }
    default:
      if (id === undefined) return undefined // notifications (initialized, cancelled...) need no reply
      throw Object.assign(new Error(`Method not found: ${method}`), { code: -32601 })
  }
}

const send = (message) => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', ...message }) + '\n')

createInterface({ input: process.stdin }).on('line', (line) => {
  if (!line.trim()) return
  let message
  try {
    message = JSON.parse(line)
  } catch {
    send({ id: null, error: { code: -32700, message: 'Parse error' } })
    return
  }
  try {
    const result = handle(message)
    if (message.id !== undefined && result !== undefined) send({ id: message.id, result })
  } catch (error) {
    if (message.id !== undefined) send({ id: message.id, error: { code: error.code ?? -32603, message: error.message } })
  }
})
