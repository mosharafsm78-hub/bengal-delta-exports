import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Family } from '@/data/types'
import { basket } from '@/lib/quote-basket'
import { defaultPicks, priceFor, tierMin, unitName } from '@/lib/pricing'
import { money, slug, usd } from '@/lib/slug'
import { cn } from '@/lib/utils'

export function PriceBuilder({ family, styleIndex, onStyleChange }: { family: Family; styleIndex: number; onStyleChange: (i: number) => void }) {
  const tierGroup = family.config.groups.find((g) => g.tiers)
  const optGroups = family.config.groups.filter((g) => g.opts)
  const suggested = tierGroup ? Array.from(new Set(tierGroup.tiers!.map((t) => tierMin(t[0])).filter((n) => n > 0))) : []
  const [picks, setPicks] = useState(() => defaultPicks(family))
  const [qty, setQty] = useState(String(suggested[1] ?? suggested[0] ?? ''))
  const [added, setAdded] = useState(false)
  const style = family.styles[styleIndex]
  const unit = style.u ?? 'pc'
  const q = parseFloat(qty.replace(/,/g, '')) || 0
  const quote = useMemo(() => priceFor(family, style, picks, q), [family, style, picks, q])

  return (
    <div className="grid gap-6 rounded-lg border border-border bg-card p-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid content-start gap-5">
        <div>
          <label htmlFor="pb-style" className="mb-1.5 block text-sm font-semibold">Product type</label>
          <select id="pb-style" className="field" value={styleIndex} onChange={(e) => { onStyleChange(Number(e.target.value)); setAdded(false) }}>
            {family.styles.map((s, i) => <option key={s.n} value={i}>{s.n}</option>)}
          </select>
        </div>
        {optGroups.map((g) => (
          <fieldset key={g.name} className="m-0 border-0 p-0">
            <legend className="mb-1.5 text-sm font-semibold">{g.name}</legend>
            <div className="flex flex-wrap gap-2">
              {g.opts!.map((o, oi) => {
                const on = (picks[g.name] ?? 0) === oi
                return (
                  <button key={o[0]} type="button" aria-pressed={on} onClick={() => { setPicks((p) => ({ ...p, [g.name]: oi })); setAdded(false) }} className={cn('rounded-md border px-3 py-1.5 text-left text-[13.5px]', on ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-border bg-card hover:border-brand')}>
                    {o[0]} {o[1] !== 0 && <span className="num ml-1 text-xs text-muted-foreground">{o[1] > 0 ? '+' : '−'}${Math.abs(o[1]).toFixed(2)}</span>}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}
        <div>
          <label htmlFor="pb-qty" className="mb-1.5 block text-sm font-semibold">Quantity ({unitName(unit)})</label>
          <input id="pb-qty" inputMode="numeric" value={qty} onChange={(e) => { setQty(e.target.value.replace(/[^\d.,]/g, '')); setAdded(false) }} className="field num" />
          {suggested.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {suggested.map((n) => (
                <button key={n} type="button" onClick={() => setQty(String(n))} className={cn('num rounded-full border px-2.5 py-0.5 text-[13px]', q === n ? 'border-brand bg-brand-soft text-brand' : 'border-border hover:border-brand')}>{n.toLocaleString('en-US')}</button>
              ))}
            </div>
          )}
          {quote.belowMoq && <p className="mt-2 text-[13px] font-semibold text-warn">Below the usual minimum. We may still quote it as a trial order.</p>}
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-lg bg-brand-soft p-5">
        <div>
          <div className="text-[13px] text-muted-foreground">{style.n} · product price per unit</div>
          <div className="num font-display text-4xl font-semibold text-brand">{money(quote.lo)}–{quote.hi.toFixed(2)}</div>
          <div className="text-[13px] text-muted-foreground">per {unitName(unit, 1)}{quote.tierLabel ? ` · volume band ${quote.tierLabel}` : ''}</div>
        </div>
        <div className="border-t border-brand/15 pt-3">
          <div className="text-[13px] text-muted-foreground">Estimated order value</div>
          <div className="num font-display text-2xl font-semibold">{quote.total ? `${usd(quote.total[0])} – ${usd(quote.total[1])}` : '—'}</div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            basket.add({ familyId: family.id, family: family.name, style: style.n, itemId: slug(style.n), qty: q > 0 ? `${q.toLocaleString('en-US')} ${unitName(unit, q)}` : undefined, spec: quote.specParts.join(' · ') || undefined, estimate: `${money(quote.lo)}–${quote.hi.toFixed(2)}/${unit}`, unitMid: (quote.lo + quote.hi) / 2, qtyNum: q > 0 ? q : undefined, unit })
            setAdded(true)
          }}
        >
          {added ? 'Added to your quote' : 'Add this spec to my quote'}
        </button>
        {added && <Link to="/quote" className="text-center font-semibold text-brand">Go to quote request →</Link>}
        <Link to="/products/$familyId/$itemId" params={{ familyId: family.id, itemId: slug(style.n) }} className="text-center text-[14px] text-brand">Full details for {style.n} →</Link>
        <p className="m-0 text-xs text-muted-foreground">Estimate only, from November 2026 market data and our costings. Your proforma invoice confirms the price.</p>
      </div>
    </div>
  )
}
