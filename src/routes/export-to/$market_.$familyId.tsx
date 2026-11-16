import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { catById, FAMILIES } from '@/data/catalog'
import { dutyLine, MARKETS, marketById, marketDuty } from '@/data/markets'
import { photoAbs } from '@/data/photos'
import { PAYMENT_HEADLINE } from '@/data/site'
import { Photo } from '@/components/photo'
import { DataTable, Pill, TrustRow, WhoDoesWhat } from '@/components/site-shell'
import { money, slug } from '@/lib/slug'

function load(marketId: string, familyId: string) {
  const market = marketById(marketId)
  const family = FAMILIES.find((f) => f.id === familyId)
  if (!market || !family || !market.cats.includes(family.cat)) return null
  return { market, family }
}

function faq(m: NonNullable<ReturnType<typeof load>>) {
  const { market: k, family: f } = m
  const lead = [f.lead.reduce((s, l) => s + l[1], 0), f.lead.reduce((s, l) => s + l[2], 0)]
  const name = f.name.toLowerCase()
  return [
    [`What is the import duty on ${name} from Bangladesh in ${k.name}?`, dutyLine(k, f.cat) + ' Your customs broker confirms the exact rate for your HS code (' + f.hs + ').'],
    [`What is the minimum order for ${name}?`, `${f.moq}. Several styles or products can share one container.`],
    [`How long does an order take to reach ${k.name}?`, `About ${lead[0]}–${lead[1]} days from order confirmation to dispatch, then ${k.transit} to ${k.ports}. Urgent or fresh goods can go by air from Dhaka in 1–4 days.`],
    [`How do I pay safely?`, `Only by ${PAYMENT_HEADLINE.toLowerCase()} opened at your own bank. Your money is released only against the shipping documents after the goods have shipped.`],
    [`Can I see samples before ordering?`, f.cat === 'produce' ? 'We send photos and video of the actual lot, or an air sample on request.' : 'Yes. Pay the sample invoice and ready-style samples ship by express courier within 24 hours; the cost is credited on your order.'],
    [`Who handles customs?`, `We handle everything on the Bangladesh side: export customs, the ${marketDuty(k).proof.toLowerCase()}, freight and insurance to ${k.ports.split(',')[0]}. Your broker clears import customs in ${k.inText} with the documents we send in advance.`],
  ] as [string, string][]
}

export const Route = createFileRoute('/export-to/$market_/$familyId')({
  loader: ({ params }) => {
    const hit = load(params.market, params.familyId)
    if (!hit) throw notFound()
    return hit
  },
  head: ({ loaderData }) => {
    if (!loaderData) return pageHead('/export-to')
    const { market: k, family: f } = loaderData
    const lo = Math.min(...f.styles.map((s) => s.p[0]))
    const base = pageHead(`/export-to/${k.id}/${f.id}`, {
      title: `${f.name} supplier from Bangladesh for ${k.name} | BengalExport`,
      description: `${f.name} for ${k.buyer} importers, from ${money(lo)} per ${f.styles[0].u ?? 'pc'}. ${marketDuty(k).zero ? '0% import duty, ' : ''}delivered to ${k.ports.split(',')[0]} in ${k.transit}. Factory checked, inspected, paid by LC at sight.`,
      image: photoAbs(f.photo),
    })
    return { ...base, scripts: [{ type: 'application/ld+json', children: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq(loaderData).map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }) }] }
  },
  component: Page,
})

function Page() {
  const data = Route.useLoaderData()
  const { market: k, family: f } = data
  const cat = catById(f.cat)
  const d = marketDuty(k)
  const lo = Math.min(...f.styles.map((s) => s.p[0]))
  const hi = Math.max(...f.styles.map((s) => s.p[1]))
  const unit = f.styles[0].u ?? 'pc'
  const leadMin = f.lead.reduce((s, l) => s + l[1], 0)
  const leadMax = f.lead.reduce((s, l) => s + l[2], 0)
  const others = MARKETS.filter((x) => x.id !== k.id && x.cats.includes(f.cat))
  const related = FAMILIES.filter((x) => x.cat === f.cat && x.id !== f.id)
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-[13.5px] text-muted-foreground">
        <Link to="/export-to" className="text-muted-foreground no-underline hover:text-brand">Country guides</Link><span className="mx-1.5">/</span>
        <Link to="/export-to/$market" params={{ market: k.id }} className="text-muted-foreground no-underline hover:text-brand">{k.name}</Link><span className="mx-1.5">/</span>
        <span className="text-foreground">{f.name}</span>
      </nav>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr]">
        <Photo id={f.photo} alt={f.name} className="aspect-[4/3] rounded-lg" eager />
        <div>
          <div className="eyebrow mb-3">{cat?.name} · for {k.buyer} importers</div>
          <h1 className="m-0 text-[clamp(2rem,4.2vw,3rem)]">{f.name} from Bangladesh for {k.name}</h1>
          <p className="mt-4 text-[17px] text-muted-foreground">{f.tag} We check the factory, inspect every order before it ships, and deliver it insured to {k.ports}. One price covers the goods, export customs, freight and insurance.</p>
          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border text-sm">
            {[['Product price', `${money(lo)}–${hi.toFixed(2)} / ${unit}`], ['Minimum order', f.moq], ['Production', `${leadMin}–${leadMax} days`], [`Sea to ${k.ports.split(',')[0]}`, k.transit], ['Import duty', d.zero ? '0%' : 'See below'], ['Payment', 'LC at sight']].map(([a, b]) => (
              <div key={a} className="bg-paper p-3"><dt className="text-muted-foreground">{a}</dt><dd className="m-0 font-semibold">{b}</dd></div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/quote" className="btn btn-primary">Get my price to {k.ports.split(',')[0]} <ArrowRight className="size-4" aria-hidden="true" /></Link>
            <Link to="/products/$familyId" params={{ familyId: f.id }} className="btn btn-outline">Full specs and price calculator</Link>
          </div>
          <TrustRow className="mt-5 max-w-xl" />
        </div>
      </div>

      <section className="mt-14">
        <h2 className="mb-2 text-2xl">Import duty in {k.name}</h2>
        <p className="m-0 max-w-[75ch] text-[16px]"><Pill tone={d.zero ? 'ok' : 'warn'}>{d.duty}</Pill></p>
        <p className="max-w-[75ch] text-muted-foreground">{dutyLine(k, f.cat)} HS code: {f.hs}.</p>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl">{f.styles.length} types we supply</h2>
        <DataTable cols={['Type', 'What it is', 'Product price']} rows={f.styles.map((s) => [<Link to="/products/$familyId/$itemId" params={{ familyId: f.id, itemId: slug(s.n) }} className="text-brand">{s.n}</Link>, <span className="text-[14px] text-muted-foreground">{s.d}</span>, <span className="num whitespace-nowrap">{money(s.p[0])}–{s.p[1].toFixed(2)} / {s.u ?? 'pc'}</span>])} />
        <p className="mt-2 text-sm text-muted-foreground">Indicative product prices, November 2026. Your firm offer adds freight and insurance to {k.ports.split(',')[0]}.</p>
      </section>

      {f.certs.length > 0 && (
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div><h2 className="mb-3 text-2xl">Certificates available</h2><ul className="m-0 grid list-none gap-1.5 p-0">{f.certs.map((c) => <li key={c} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 flex-none text-brand" aria-hidden="true" />{c}</li>)}</ul></div>
          <div><h2 className="mb-3 text-2xl">Quality checks</h2><ul className="m-0 grid list-none gap-1.5 p-0">{f.tests.slice(0, 7).map((c) => <li key={c} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 flex-none text-brand" aria-hidden="true" />{c}</li>)}</ul></div>
        </section>
      )}

      <section className="mt-12"><h2 className="mb-4 text-2xl">Who does what</h2><WhoDoesWhat /></section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl">Questions from {k.buyer} buyers</h2>
        <div className="grid gap-3">{faq(data).map(([q, a]) => <details key={q} className="rounded-lg border border-border bg-card p-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mb-0 text-muted-foreground">{a}</p></details>)}</div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div><h2 className="mb-3 text-xl">More for {k.name}</h2><div className="flex flex-wrap gap-2">{related.map((r) => <Link key={r.id} to="/export-to/$market/$familyId" params={{ market: k.id, familyId: r.id }} className="rounded-full border border-border bg-card px-3 py-1 text-[14px] text-foreground no-underline hover:border-brand">{r.name}</Link>)}<Link to="/export-to/$market" params={{ market: k.id }} className="rounded-full border border-brand px-3 py-1 text-[14px] text-brand no-underline">All products for {k.name}</Link></div></div>
        <div><h2 className="mb-3 text-xl">{f.name} for other countries</h2><div className="flex flex-wrap gap-2">{others.map((o) => <Link key={o.id} to="/export-to/$market/$familyId" params={{ market: o.id, familyId: f.id }} className="rounded-full border border-border bg-card px-3 py-1 text-[14px] text-foreground no-underline hover:border-brand">{o.name}</Link>)}</div></div>
      </section>
    </div>
  )
}
