import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { pageHead } from '@/lib/head'
import { CATS, FAMILIES } from '@/data/catalog'
import { PageHead, Pill } from '@/components/site-shell'
import { money, slug } from '@/lib/slug'

export const Route = createFileRoute('/prices')({
  head: () => pageHead('/prices'),
  component: Prices,
})

function Prices() {
  const [cat, setCat] = useState<string>('all')
  const [q, setQ] = useState('')
  const fams = FAMILIES.filter((f) => cat === 'all' || f.cat === cat)
  const rows = fams.flatMap((f) => f.styles.filter((s) => !q || `${s.n} ${f.name}`.toLowerCase().includes(q.toLowerCase())).map((s) => ({ f, s })))
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <PageHead eyebrow="Price list · November 2026" title="Indicative FOB price list" lead="FOB means packed, cleared for export and loaded at Chattogram port (sea) or Dhaka airport (air). Freight and insurance are quoted per shipment. “Market data” prices come from published Bangladeshi supplier listings; “Estimate” prices are our costings, confirmed on quote." />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input aria-label="Filter price list" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by product…" className="field lg:w-72" />
        <div className="flex flex-wrap gap-2">
          {[{ id: 'all', name: 'All' }, ...CATS].map((c) => (
            <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)} className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${cat === c.id ? 'border-ink bg-ink text-paper' : 'border-border bg-card'}`}>{c.name}</button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full border-collapse text-[15px]">
          <thead>
            <tr className="text-left">
              {['Product', 'Family', 'FOB price (USD)', 'Unit', 'Minimum order', 'Lead time / season', 'Basis'].map((h) => <th key={h} className="border-b border-border bg-muted px-4 py-2.5 text-[13px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ f, s }) => {
              const lead = `${f.lead.reduce((a, l) => a + l[1], 0)}–${f.lead.reduce((a, l) => a + l[2], 0)} days`
              return (
                <tr key={f.id + s.n} className="border-b border-border last:border-0 hover:bg-paper">
                  <td className="px-4 py-2.5"><Link to="/products/$familyId/$itemId" params={{ familyId: f.id, itemId: slug(s.n) }} className="font-semibold text-foreground no-underline hover:text-brand">{s.n}</Link></td>
                  <td className="px-4 py-2.5 text-muted-foreground">{f.name}</td>
                  <td className="num px-4 py-2.5 text-right font-semibold whitespace-nowrap">{money(s.p[0])}–{s.p[1].toFixed(2)}</td>
                  <td className="px-4 py-2.5">{s.u ?? 'pc'}</td>
                  <td className="px-4 py-2.5 text-sm">{f.moq}</td>
                  <td className="px-4 py-2.5 text-sm">{s.season ?? lead}</td>
                  <td className="px-4 py-2.5">{s.b === 'M' ? <Pill>Market data</Pill> : <Pill tone="jute">Estimate</Pill>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[['Quantity', 'A full container is cheaper per unit than a part load or air freight. Garment prices fall noticeably above 3,000 pieces per style.'], ['Specification', 'Fabric weight, yarn, print, wash, labels, packing and certificates all change the FOB price. Each product page has a calculator.'], ['Season', 'Fresh produce is cheapest in its peak months; farm prices can swing several-fold within weeks.']].map(([t, d]) => (
          <div key={t} className="rounded-lg border border-border bg-card p-6"><h2 className="mt-0 mb-1 font-sans text-base font-semibold tracking-normal">What moves the price: {t.toLowerCase()}</h2><p className="m-0 text-[15px] text-muted-foreground">{d}</p></div>
        ))}
      </div>
    </div>
  )
}
