// Copies packages/tokens/tokens.css into every template so each template
// stays self-contained (it can be pulled out alone with `npx degit`).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'packages/tokens/tokens.css')
const targets = [
  'templates/next/src/styles/tokens.css',
  'templates/nuxt/app/assets/css/tokens.css',
]

const banner =
  '/* AUTO-GENERATED from packages/tokens/tokens.css — edit there, then run `npm run sync:tokens`. */\n\n'
const css = banner + readFileSync(source, 'utf8')

for (const target of targets) {
  const file = join(root, target)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, css)
  console.log(`synced → ${target}`)
}
