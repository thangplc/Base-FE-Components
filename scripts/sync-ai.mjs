// Copies packages/ai/*.mjs into every template's ai/ folder (so each template
// stays self-contained for `npx degit`), then rebuilds each template's
// component manifest (ai/components.json + ai/components.md).
//
//   node scripts/sync-ai.mjs           copy + rebuild
//   node scripts/sync-ai.mjs --check   fail when a copy or manifest is stale (CI)
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(import.meta.url), '../..')
const sourceDir = join(root, 'packages/ai')
const templates = ['templates/next', 'templates/nuxt']
const check = process.argv.includes('--check')

const banner = (file) =>
  `// AUTO-GENERATED from packages/ai/${file} — edit there, then run \`npm run sync:ai\`.\n` +
  '// (Once this template is pulled out on its own, edit this file directly.)\n'

let stale = false
for (const template of templates) {
  for (const file of readdirSync(sourceDir).filter((f) => f.endsWith('.mjs'))) {
    const target = join(root, template, 'ai', file)
    const content = banner(file) + readFileSync(join(sourceDir, file), 'utf8')
    if (check) {
      if (!existsSync(target) || readFileSync(target, 'utf8') !== content) {
        console.error(`stale copy → ${template}/ai/${file}`)
        stale = true
      }
      continue
    }
    mkdirSync(join(root, template, 'ai'), { recursive: true })
    writeFileSync(target, content)
    console.log(`synced → ${template}/ai/${file}`)
  }

  try {
    const args = ['ai/build-manifest.mjs', ...(check ? ['--check'] : [])]
    execFileSync(process.execPath, args, { cwd: join(root, template), stdio: 'inherit' })
  } catch {
    stale = true
  }
}

if (stale) {
  if (check) console.error('Run `npm run sync:ai` and commit the result.')
  process.exit(1)
}
