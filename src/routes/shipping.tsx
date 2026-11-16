import { createFileRoute } from '@tanstack/react-router'
import { pageHead } from '@/lib/head'
import { ADVISORY, INCOTERMS, SHIP_MODES, TRANSIT } from '@/data/site'
import { DataTable, PageHead, Pill, WhoDoesWhat } from '@/components/site-shell'

export const Route = createFileRoute('/shipping')({
  head: () => pageHead('/shipping'),
  component: Shipping,
})

const tone = { ok: 'ok', watch: 'warn', disrupted: 'danger' } as const

function Shipping() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <PageHead eyebrow="Shipping" title="How we ship to your country" lead="Sea freight from Bangladesh for containers, air freight from Dhaka for fresh produce and urgent goods, courier for samples." />
      <div className="mb-12 rounded-lg border border-warn/40 bg-warn-soft p-6">
        <Pill tone="warn">Route advisory · November 2026</Pill>
        <p className="mt-3 mb-0">{ADVISORY} Since 28 February 2026 the conflict around Iran has limited container service to Persian Gulf ports and cargo through Gulf air hubs. We route Europe and US air cargo through Far East hubs, ship Saudi orders to Jeddah and Riyadh, and confirm Gulf delivery dates only at booking.</p>
      </div>
      <h2 className="mb-4 text-[clamp(1.6rem,3vw,2.1rem)]">Shipping modes</h2>
      <DataTable className="mb-12" cols={['Mode', 'From', 'Best for', 'Typical transit', 'Notes']} rows={SHIP_MODES.map((r) => [r[0], r[1], r[2], <span className="num whitespace-nowrap">{r[3]}</span>, <span className="text-sm">{r[4]}</span>])} />
      <h2 className="mb-4 text-[clamp(1.6rem,3vw,2.1rem)]">Typical sea transit from Bangladesh</h2>
      <DataTable cols={['Destination', 'Example port', 'Transit (days)', 'Route status']} rows={TRANSIT.map((r) => [r[0], r[1], <span className="num">{r[2]}</span>, <Pill tone={tone[r[3]]}>{r[4]}</Pill>])} />
      <p className="mb-12 text-sm text-muted-foreground">Typical port-to-port ranges via transshipment hubs; they vary by carrier and season. Air freight takes 1–4 days.</p>
      <h2 className="mb-4 text-[clamp(1.6rem,3vw,2.1rem)]">Who handles what, including customs</h2>
      <WhoDoesWhat />
      <h2 className="mt-12 mb-4 text-[clamp(1.6rem,3vw,2.1rem)]">Delivery terms we offer</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {INCOTERMS.map(([t, d]) => <div key={t} className="rounded-lg border border-border bg-card p-6"><b className="font-display text-lg">{t}</b><p className="mt-2 mb-0 text-[15px] text-muted-foreground">{d}</p></div>)}
      </div>
    </div>
  )
}
