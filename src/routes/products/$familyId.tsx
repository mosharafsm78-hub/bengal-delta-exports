import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { CheckCircle2, ArrowRight, ShieldCheck, Landmark, Ship } from 'lucide-react'
import { FAMILIES, catById } from '@/data/catalog'
import { pageHead } from '@/lib/head'
import { Photo } from '@/components/photo'
import { DataTable, Pill } from '@/components/site-shell'
import { PriceBuilder } from '@/components/price-builder'
import { inSeason } from '@/components/item-tile'
import { basket, useBasket } from '@/lib/quote-basket'
import { money, slug } from '@/lib/slug'
import { PHOTOS, photoAbs } from '@/data/photos'
import { catStyle } from '@/lib/cat-style'
import { QuickQuote } from '@/components/quick-quote'
import { MARKETS } from '@/data/markets'
import { TrustPoints } from '@/components/trust-points'
import { BuyerReviews } from '@/components/buyer-reviews'

export const Route = createFileRoute('/products/$familyId')({
  loader: ({ params }) => {
    const family = FAMILIES.find((f) => f.id === params.familyId)
    if (!family) throw notFound()
    return { family }
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(`/products/${loaderData.family.id}`, {
          title: `${loaderData.family.name} from Bangladesh — prices, types, specs | BengalExport`,
          description: `${loaderData.family.tag} ${loaderData.family.styles.length} types with indicative prices, minimum order ${loaderData.family.moq}, lead times and shipping.`,
          image: photoAbs(loaderData.family.photo),
        })
      : pageHead('/products'),
  component: FamilyPage,
})

function FamilyPage() {
  const { family: f } = Route.useLoaderData()
  return <FamilyBody key={f.id} />
}

function FamilyBody() {
  const { family: f } = Route.useLoaderData()
  const cat = catById(f.cat)
  const [styleIndex, setStyleIndex] = useState(0)
  const items = useBasket()
  const lo = Math.min(...f.styles.map((s) => s.p[0]))
  const hi = Math.max(...f.styles.map((s) => s.p[1]))
  const unit = f.styles[0].u ?? 'pc'
  const leadMin = f.lead.reduce((s, l) => s + l[1], 0)
  const leadMax = f.lead.reduce((s, l) => s + l[2], 0)
  const isProduce = f.cat === 'produce'
  const related = FAMILIES.filter((x) => x.cat === f.cat && x.id !== f.id)
  const sections = [['types', `All ${f.styles.length} types`], ['builder', 'Price calculator'], ['specs', 'Specs and options'], ['packing', 'Packing and shipping'], ['lead-time', 'Lead time'], ['quality', 'Quality']]

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-10">
          <nav aria-label="Breadcrumb" className="mb-6 text-[13.5px] text-muted-foreground">
            <Link to="/products" className="text-muted-foreground no-underline hover:text-brand">Products</Link>
            <span className="mx-1.5">/</span>
            <Link to="/products" search={{ cat: f.cat }} className="text-muted-foreground no-underline hover:text-brand">{cat?.name}</Link>
            <span className="mx-1.5">/</span>
            <span className="text-foreground">{f.name}</span>
          </nav>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <Photo id={f.photo} alt={f.name} className="aspect-[4/3] rounded-lg" credit eager />
              <ul className="m-0 mt-4 grid list-none grid-cols-3 gap-2 p-0 text-[13px] text-muted-foreground">
                {[[ShieldCheck, 'Inspected before shipment'], [Landmark, 'Settled by LC at sight'], [Ship, 'Insured to your port']].map(([Icon, t]) => {
                  const I = Icon as typeof ShieldCheck
                  return <li key={t as string} className="flex items-center gap-2"><I className="size-4 flex-none text-brand" aria-hidden="true" />{t as string}</li>
                })}
              </ul>
            </div>
            <div>
              <p className="eyebrow m-0 mb-2" style={catStyle(f.cat)}><span className="cat-text">{cat?.name}</span></p>
              <h1 className="m-0 text-[clamp(2.1rem,4.4vw,3.2rem)]">{f.name}</h1>
              <p className="mt-3 max-w-[62ch] text-[17px] text-muted-foreground">{f.intro}</p>

              <div className="mt-6 overflow-hidden rounded-lg border border-border">
                <div className="flex items-center justify-between bg-ink px-4 py-2 text-[12.5px] font-semibold tracking-wide text-paper uppercase">
                  <span>Commercial terms</span>
                  <span className="font-normal normal-case tracking-normal opacity-70">Indicative · confirmed by proforma invoice</span>
                </div>
                <dl className="m-0 grid grid-cols-2 gap-px bg-border text-sm sm:grid-cols-3">
                  {([
                    ['Indicative price', <span className="num font-display text-xl font-semibold">{money(lo)}–{hi.toFixed(2)} <span className="font-sans text-sm font-normal text-muted-foreground">/ {unit}</span></span>],
                    [isProduce ? 'Order to dispatch' : 'Lead time', <span className="num font-display text-xl font-semibold">{leadMin}–{leadMax} <span className="font-sans text-sm font-normal text-muted-foreground">days</span></span>],
                    ['Minimum order', <span className="font-semibold">{f.moq}</span>],
                    ['HS code', <span className="num font-semibold">{f.hs}</span>],
                    ['Price basis', <span className="font-semibold">CIF your port · Incoterms 2020</span>],
                    ['Payment', <span className="font-semibold">Irrevocable LC at sight · UCP 600</span>],
                  ] as const).map(([k, v]) => (
                    <div key={k} className="bg-card p-3.5"><dt className="text-[12.5px] text-muted-foreground">{k}</dt><dd className="m-0 mt-0.5 leading-snug">{v}</dd></div>
                  ))}
                </dl>
                <div className="border-t border-border bg-paper px-4 py-2.5 text-[13.5px] text-muted-foreground">
                  Import duty <b className="text-foreground">0%</b> in the EU, UK, Canada, Australia and China{isProduce ? ', and on fresh produce in the Gulf' : ''}. <Link to="/duty-free-markets" className="font-semibold text-brand">All markets</Link>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/quote" className="btn btn-primary">Request a quotation</Link>
                <a href="#types" className="btn btn-outline">All {f.styles.length} types</a>
                <a href="#builder" className="btn btn-outline">Price calculator</a>
              </div>
              <p className="mt-3 mb-0 text-[13.5px] text-muted-foreground">Proforma invoice within 24 hours. Samples dispatched within 24 hours of the sample invoice.</p>
              <QuickQuote familyId={f.id} familyName={f.name} unit={unit} />

              <p className="mt-5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">Import guide by market:{MARKETS.filter((k) => k.cats.includes(f.cat)).map((k) => <Link key={k.id} to="/export-to/$market/$familyId" params={{ market: k.id, familyId: f.id }} className="rounded-full border border-border px-2 py-0.5 text-[12.5px] text-foreground no-underline hover:border-brand">{k.name}</Link>)}</p>
            </div>
          </div>
        </div>
        <nav aria-label="On this page" className="sticky top-16 z-20 border-t border-border bg-card/95 backdrop-blur">
          <div className="scroll-row mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2">
            {sections.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap text-foreground no-underline hover:bg-muted">{label}</a>
            ))}
          </div>
        </nav>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-10"><TrustPoints compact /></div>

      <div className="mx-auto max-w-7xl px-4">
        <section id="types" className="scroll-mt-32 py-12">
          <h2 className="mb-2 text-[clamp(1.6rem,3vw,2.1rem)]">{f.styles.length} types of {f.name.toLowerCase()}</h2>
          <p className="mb-6 text-muted-foreground">Each type has its own specification, packing data and quantity-based price. Add any of them to one request for quotation.</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {f.styles.map((s, i) => {
              const inBasket = items.some((b) => b.familyId === f.id && b.style === s.n)
              const id = slug(s.n)
              return (
                <article key={s.n} id={id} className="group flex scroll-mt-32 flex-col overflow-hidden rounded-lg border border-border bg-card transition hover:border-brand hover:shadow-md">
                  <Link to="/products/$familyId/$itemId" params={{ familyId: f.id, itemId: id }} className="relative block" aria-label={`${s.n} details`}>
                    <Photo id={s.photo} alt={s.n} className="aspect-[4/3]" />
                    {s.cal && inSeason(s) && <span className="absolute top-2 left-2 rounded-full bg-ok px-2 py-0.5 text-[11px] font-semibold text-card">In season</span>}
                  </Link>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="m-0 text-lg">
                      <Link to="/products/$familyId/$itemId" params={{ familyId: f.id, itemId: id }} className="text-foreground no-underline group-hover:text-brand">{s.n}</Link>
                    </h3>
                    <p className="m-0 text-[14.5px] text-muted-foreground">{s.d}</p>
                    <div className="num text-xl font-semibold">{money(s.p[0])}–{s.p[1].toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ {s.u ?? 'pc'}</span></div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.b === 'M' ? <Pill>Market-checked price</Pill> : <Pill tone="jute">Indicative</Pill>}
                      {s.season && <Pill tone="ok">Season: {s.season}</Pill>}
                    </div>
                    <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
                      <Link to="/products/$familyId/$itemId" params={{ familyId: f.id, itemId: id }} className="btn btn-primary px-3 py-2 text-sm">View details</Link>
                      <button type="button" onClick={() => { basket.add({ familyId: f.id, family: f.name, style: s.n, itemId: id, estimate: `${money(s.p[0])}–${s.p[1].toFixed(2)}/${s.u ?? 'pc'}` }); setStyleIndex(i) }} className="btn btn-outline px-3 py-2 text-sm">
                        {inBasket ? <><CheckCircle2 className="size-4" aria-hidden="true" /> In RFQ</> : 'Add to RFQ'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section id="builder" className="scroll-mt-32 py-8">
          <h2 className="mb-2 text-[clamp(1.6rem,3vw,2.1rem)]">Price calculator</h2>
          <p className="mb-6 text-muted-foreground">Pick a type, your options and quantity. The unit price and order total update as you go.</p>
          <PriceBuilder family={f} styleIndex={styleIndex} onStyleChange={setStyleIndex} />
        </section>

        <section id="specs" className="scroll-mt-32 py-12">
          <h2 className="mb-6 text-[clamp(1.6rem,3vw,2.1rem)]">Specs and options</h2>
          <div className="grid gap-8">
            {f.tables.map((t) => (
              <div key={t.title}>
                <h3 className="mb-2 text-lg">{t.title}</h3>
                <DataTable cols={t.cols} rows={t.rows} />
              </div>
            ))}
            {f.sizes && <p className="m-0"><b>Sizes:</b> {f.sizes}</p>}
          </div>
        </section>

        <section id="packing" className="scroll-mt-32 py-8">
          <h2 className="mb-6 text-[clamp(1.6rem,3vw,2.1rem)]">Packing and shipping</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <DataTable cols={['Item', 'Detail']} rows={f.packing} />
              <p className="mt-2 text-xs text-muted-foreground">Container loads are approximate and depend on size ratio, folding and carton size.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5 text-[15px]">
              <p className="mt-0"><b>Ships from:</b> {isProduce ? 'Dhaka air cargo (most fresh produce); seaport by reefer for potato, cabbage and other hardy crops.' : f.cat === 'food' ? 'Bangladesh seaport by container or reefer.' : 'Bangladesh seaport by container; Dhaka by air for urgent orders.'}</p>
              <p><b>Price basis:</b> product prices shown; your offer is CIF to your port (sea) or CIP (air), with freight and insurance included.</p>
              <p><b>Transit:</b> 7–12 days to Malaysia and Singapore, 32–42 days to Europe and the UK, 28–45 days to the USA by sea; 1–4 days by air.</p>
              <Link to="/shipping" className="inline-flex items-center gap-1 font-semibold text-brand no-underline">All routes and transit times <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section id="lead-time" className="scroll-mt-32 py-12">
          <h2 className="mb-2 text-[clamp(1.6rem,3vw,2.1rem)]">Lead time: {leadMin}–{leadMax} days</h2>
          <p className="mb-6 text-muted-foreground">{isProduce ? 'From order confirmation to the goods leaving Bangladesh.' : 'From order confirmation and sample approval to shipment. Stock fabrics and repeat orders are faster.'}</p>
          <ol className="m-0 grid list-none gap-3 p-0">
            {f.lead.map(([stage, a, b]) => (
              <li key={stage} className="grid items-center gap-3 sm:grid-cols-[18rem_1fr]">
                <span className="text-[15px] font-medium">{stage}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 flex-none rounded-full bg-brand" style={{ width: `${Math.max(3, (b / leadMax) * 70)}%` }} />
                  <span className="num text-sm text-muted-foreground">{a === b ? a : `${a}–${b}`} days</span>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">Some stages run in parallel, so the total is often shorter than the sum.</p>
        </section>

        <section id="quality" className="scroll-mt-32 py-8">
          <h2 className="mb-6 text-[clamp(1.6rem,3vw,2.1rem)]">Quality, tests and certificates</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mt-0 mb-3">Tests and inspections</h3>
              <ul className="m-0 grid list-none gap-2 p-0 text-[15px]">{f.tests.map((t) => <li key={t} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 flex-none text-ok" aria-hidden="true" />{t}</li>)}</ul>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mt-0 mb-3">Certificates available</h3>
              <div className="flex flex-wrap gap-2">{f.certs.map((c) => <Pill key={c}>{c}</Pill>)}</div>
              <p className="mt-4 mb-0 text-sm text-muted-foreground">Ask for the certificate copies of the factory or farm that makes your order.</p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="flex flex-col items-start justify-between gap-6 rounded-lg bg-brand p-8 text-brand-ink md:flex-row md:items-center">
            <div>
              <h2 className="m-0 text-[clamp(1.5rem,3vw,2rem)]">Request a proforma invoice for {f.name.toLowerCase()}</h2>
              <p className="mt-2 mb-0 opacity-85">Priced CIF to your port with specifications, packing, shipment date and LC terms. Within 24 hours.</p>
            </div>
            <Link to="/quote" className="btn bg-brand-ink text-brand">Request a quotation{items.length ? ` (${items.length})` : ''}</Link>
          </div>
        </section>

        <BuyerReviews />
        {related.length > 0 && (
          <section className="pb-4">
            <h2 className="mb-5 text-[clamp(1.4rem,2.6vw,1.8rem)]">More {cat?.name.toLowerCase()}</h2>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {related.map((r) => (
                <Link key={r.id} to="/products/$familyId" params={{ familyId: r.id }} className="group text-foreground no-underline">
                  <Photo id={r.photo} alt={r.name} className="aspect-[4/3] rounded-lg transition group-hover:opacity-90" />
                  <div className="mt-2 font-semibold group-hover:text-brand">{r.name}</div>
                  <div className="text-[13px] text-muted-foreground">{r.styles.length} types</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
