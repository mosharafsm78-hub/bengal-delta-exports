// Writes dist/client/catalog.json: a compact catalogue the buyer AI agent reads.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
const root = resolve(import.meta.dirname, '..')
const dir = mkdtempSync(join(tmpdir(), 'bde-cat-'))
writeFileSync(join(dir, 'slug.ts'), readFileSync(join(root, 'src/lib/slug.ts'), 'utf8'))
writeFileSync(join(dir, 'types.ts'), 'export {}')
writeFileSync(join(dir, 'catalog.ts'), readFileSync(join(root, 'src/data/catalog.ts'), 'utf8').replace("'@/lib/slug'", "'./slug.ts'").replace("from './types'", "from './types.ts'"))
const { FAMILIES } = await import(pathToFileURL(join(dir, 'catalog.ts')).href)
const out = FAMILIES.map((f) => ({ id: f.id, cat: f.cat, name: f.name, moq: f.moq, lead: f.lead.map((l) => `${l[0]} ${l[1]}-${l[2]}d`).join('; '), certs: f.certs.slice(0, 6), styles: f.styles.map((s) => [s.n, s.p[0], s.p[1], s.u ?? 'pc']) }))
writeFileSync(join(root, 'dist/client/catalog.json'), JSON.stringify(out))
console.log(`catalog.json: ${out.length} families, ${out.reduce((a, f) => a + f.styles.length, 0)} items, ${JSON.stringify(out).length} bytes`)
