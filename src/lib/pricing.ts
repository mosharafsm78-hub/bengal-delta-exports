import type { Family, Style } from '@/data/types'

/** Minimum quantity a tier label stands for, in the item's unit. "1–5 t" → 1000 (kg); "Full container" → 18000. */
export function tierMin(label: string): number {
  if (/container/i.test(label)) return 18000
  if (/\bft\b/i.test(label)) return /40/.test(label) ? 25000 : 12000
  const m = label.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  if (!m) return 0
  const n = parseFloat(m[1])
  return /\d\s*t\b|\btonnes?\b/i.test(label) && !/kg/i.test(label) ? n * 1000 : n
}

export function tierFor(tiers: [string, number][], qty: number): number {
  let idx = 0
  tiers.forEach((t, i) => {
    if (qty >= tierMin(t[0])) idx = i
  })
  return idx
}

export interface Quote {
  lo: number
  hi: number
  total: [number, number] | null
  tierLabel?: string
  belowMoq: boolean
  moqQty: number
  specParts: string[]
}

/** Unit price and order total for a style, with chosen options and a quantity. */
export function priceFor(f: Family, s: Style, picks: Record<string, number>, qty: number): Quote {
  let add = 0
  let mult = 1
  let tierLabel: string | undefined
  let moqQty = 0
  const specParts: string[] = []
  for (const g of f.config.groups) {
    if (g.opts) {
      const i = picks[g.name] ?? 0
      add += g.opts[i][1]
      const def = Math.max(0, g.opts.findIndex((o) => o[1] === 0))
      if (i !== def) specParts.push(`${g.name}: ${g.opts[i][0]}`)
    }
    if (g.tiers) {
      moqQty = tierMin(g.tiers[0][0])
      const i = qty > 0 ? tierFor(g.tiers, qty) : Math.min(1, g.tiers.length - 1)
      mult *= g.tiers[i][1]
      tierLabel = g.tiers[i][0]
    }
  }
  const lo = Math.max(0.05, (s.p[0] + add) * mult)
  const hi = Math.max(lo, (s.p[1] + add) * mult)
  return { lo, hi, total: qty > 0 ? [lo * qty, hi * qty] : null, tierLabel, belowMoq: qty > 0 && qty < moqQty, moqQty, specParts }
}

export function defaultPicks(f: Family): Record<string, number> {
  const p: Record<string, number> = {}
  for (const g of f.config.groups) if (g.opts) p[g.name] = Math.max(0, g.opts.findIndex((o) => o[1] === 0))
  return p
}

export const unitName = (u: string, n = 2) => {
  const map: Record<string, [string, string]> = { pc: ['piece', 'pieces'], pair: ['pair', 'pairs'], kg: ['kg', 'kg'], set: ['set', 'sets'], m: ['metre', 'metres'], litre: ['litre', 'litres'] }
  const v = map[u]
  return v ? (n === 1 ? v[0] : v[1]) : u
}
