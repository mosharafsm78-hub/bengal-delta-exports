import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { CheckCircle2, ShieldCheck, FileText, Ship, Clock, Package, Globe2, Info, ArrowRight, Leaf } from 'lucide-react'
import { catById, findItem } from '@/data/catalog'
import { DUTY, DUTY_PRESETS, STEPS, TRANSIT, SITE, PAYMENT_TERMS } from '@/data/site'
import { PHOTOS } from '@/data/photos'
import { pageHead } from '@/lib/head'
import { Photo } from '@/components/photo'
import { ItemTile, inSeason } from '@/components/item-tile'
import { DataTable, Pill } from '@/components/site-shell'
import { basket, useBasket } from '@/lib/quote-basket'
import { defaultPicks, priceFor, tierMin, unitName } from '@/lib/pricing'
import { money, slug, usd } from '@/lib/slug'
import { cn } from '@/lib/utils'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const Route = createFileRoute('/products/$familyId_/$itemId')({
  loader: ({ params }) => {
    const hit = findItem(params.familyId, params.itemId)
    if (!hit) throw notFound()
    return hit
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(`/products/${loaderData.f.id}/${slug(loaderData.s.n)}`, {
          title: `${loaderData.s.n} — ${loaderData.f.name} from Bangladesh, FOB price & specs | ${SITE.name}`,
          description: `${loaderData.s.d} Indicative FOB ${money(loaderData.s.p[0])}–${loaderData.s.p[1].toFixed(2)} per ${loaderData.s.u ?? 'pc'}. Minimum order ${loaderData.f.moq}. Quote in 24 hours.`,
          image: PHOTOS[loaderData.s.photo]?.src,
        })
      : pageHead('/products'),
  component: ItemPage,
})

function shipsFrom(cat: string) {
  if (cat === 'produce') return 'Dhaka air cargo (most fresh produce) · Chattogram reefer for potato, cabbage and other hardy crops'
  if (cat === 'food') return 'Chattogram port, dry or reefer container'
  return 'Chattogram port by sea · Dhaka by air for urgent orders'
}

function ItemPage() {
  const { f, s } = Route.useLoaderData()
  const cat = catById(f.cat)
  const unit = s.u ?? 'pc'
  const isProduce = f.cat === 'produce'
  const tierGroup = f.config.groups.find((g) => g.tiers)
  const optGroups = f.config.groups.filter((g) => g.opts)
  const moq = tierGroup ? tierMin(tierGroup.tiers![0][0]) : 0
  const suggested = tierGroup ? Array.from(new Set(tierGroup.tiers!.map((t) => tierMin(t[0])).filter((n) => n > 0))) : []

  const [qty, setQty] = useState(String(suggested[1] ?? suggested[0] ?? ''))
  const [picks, setPicks] = useState(() => defaultPicks(f))
  const [market, setMarket] = useState(0)
  const [photo, setPhoto] = useState(s.photo)
  const items = useBasket()

  const q = parseFloat(qty.replace(/,/g, '')) || 0
  const quote = useMemo(() => priceFor(f, s, picks, q), [f, s, picks, q])
  const dutyPct = DUTY_PRESETS[market][isProduce ? 2 : 1]
  const spec = [...quote.specParts, q > 0 ? `Qty: ${q.toLocaleString('en-US')} ${unitName(unit, q)}` : ''].filter(Boolean).join(' · ')
  const inBasket = items.some((b) => b.familyId === f.id && b.style === s.n)
  const [added, setAdded] = useState(false)
  const leadMin = f.lead.reduce((a, l) => a + l[1], 0)
  const leadMax = f.lead.reduce((a, l) => a + l[2], 0)
  const siblings = f.styles.filter((x) => x.n !== s.n)
  const gallery = Array.from(new Set([s.photo, f.photo])).filter((p) => PHOTOS[p])
  const productJson = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: s.n,
    description: s.d,
    category: f.name,
    image: PHOTOS[s.photo]?.src,
    brand: { '@type': 'Brand', name: SITE.name },
    offers: { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: s.p[0].toFixed(2), highPrice: s.p[1].toFixed(2), availability: 'https://schema.org/InStock' },
  }

  const add = () => {
    basket.add({ familyId: f.id, family: f.name, style: s.n, itemId: slug(s.n), qty: q > 0 ? `${q.toLocaleString('en-US')} ${unitName(unit, q)}` : undefined, spec: quote.specParts.join(' · ') || undefined, estimate: `${money(quote.lo)}–${quote.hi.toFixed(2)}/${unit}` })
    setAdded(true)
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJson) }} />
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <nav aria-label="Breadcrumb" className="text-[13.5px] text-muted-foreground">
          <Link to="/products" className="text-muted-foreground no-underline hover:text-brand">Products</Link>
          <span className="mx-1.5">/</span>
          <Link to="/products" search={{ cat: f.cat }} className="text-muted-foreground no-underline hover:text-brand">{cat?.name}</Link>
          <span className="mx-1.5">/</span>
          <Link to="/products/$familyId" params={{ familyId: f.id }} className="text-muted-foreground no-underline hover:text-brand">{f.name}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">{s.n}</span>
        </nav>
      </div>

      {/* Product + buy box */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pt-6 pb-12 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <Photo id={photo} alt={s.n} className="aspect-[4/3] rounded-lg" credit eager />
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3">
              {gallery.map((p) => (
                <button key={p} type="button" onClick={() => setPhoto(p)} aria-label={`Show photo ${p === s.photo ? 'of this product' : `of ${f.name}`}`} className={cn('overflow-hidden rounded-md border-2 p-0', photo === p ? 'border-brand' : 'border-transparent opacity-80 hover:opacity-100')}>
                  <Photo id={p} alt="" className="size-20" />
                </button>
              ))}
            </div>
          )}
          <p className="mt-3 flex items-start gap-2 text-[13px] text-muted-foreground">
            <Info className="mt-0.5 size-4 flex-none" aria-hidden="true" />
            Photos show the product type. Before shipment we send you photos and video of your actual goods, and samples on request.
          </p>
        </div>

        <div>
          <Link to="/products/$familyId" params={{ familyId: f.id }} className="eyebrow no-underline hover:underline">{f.name}</Link>
          <h1 className="mt-2 mb-0 text-[clamp(2rem,4vw,2.8rem)]">{s.n}</h1>
          <p className="mt-3 text-[17px] text-muted-foreground">{s.d}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {s.b === 'M' ? <Pill>Price from market data</Pill> : <Pill tone="jute">Price: our estimate</Pill>}
            {s.cal && (inSeason(s) ? <Pill tone="ok">In season now</Pill> : <Pill tone="warn">Out of season now</Pill>)}
            {s.season && <Pill tone="ok">Season: {s.season}</Pill>}
            <Pill>HS {f.hs.replace(/\s*\(.*?\)/g, '').split('·')[0].trim()}</Pill>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <div className="text-[13px] text-muted-foreground">Unit price, FOB Bangladesh</div>
                <div className="num font-display text-[34px] leading-tight font-semibold text-brand">
                  {money(quote.lo)}–{quote.hi.toFixed(2)} <span className="font-sans text-base font-normal text-muted-foreground">/ {unitName(unit, 1)}</span>
                </div>
              </div>
              {quote.tierLabel && <span className="rounded-full bg-muted px-2.5 py-1 text-[12.5px]">Volume band: {quote.tierLabel}</span>}
            </div>

            <div className="mt-5">
              <label htmlFor="qty" className="mb-1.5 block text-sm font-semibold">Quantity ({unitName(unit)})</label>
              <input id="qty" inputMode="numeric" value={qty} onChange={(e) => { setQty(e.target.value.replace(/[^\d.,]/g, '')); setAdded(false) }} placeholder={moq ? `Minimum ${moq.toLocaleString('en-US')}` : 'Enter quantity'} className="field num text-lg" />
              {suggested.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {suggested.map((n) => (
                    <button key={n} type="button" onClick={() => { setQty(String(n)); setAdded(false) }} className={cn('num rounded-full border px-2.5 py-0.5 text-[13px]', q === n ? 'border-brand bg-brand-soft text-brand' : 'border-border bg-card hover:border-brand')}>
                      {n.toLocaleString('en-US')}
                    </button>
                  ))}
                </div>
              )}
              {quote.belowMoq && <p className="mt-2 text-[13px] font-semibold text-warn">Below the usual minimum ({moq.toLocaleString('en-US')} {unitName(unit)}). We may still quote it as a trial order.</p>}
            </div>

            {optGroups.map((g) => (
              <fieldset key={g.name} className="mt-4 border-0 p-0">
                <legend className="mb-1.5 text-sm font-semibold">{g.name}</legend>
                <div className="flex flex-wrap gap-2">
                  {g.opts!.map((o, oi) => {
                    const on = (picks[g.name] ?? 0) === oi
                    return (
                      <button key={o[0]} type="button" aria-pressed={on} onClick={() => { setPicks((p) => ({ ...p, [g.name]: oi })); setAdded(false) }} className={cn('rounded-md border px-3 py-1.5 text-left text-[13.5px]', on ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-border bg-card hover:border-brand')}>
                        {o[0]}
                        {o[1] !== 0 && <span className="num ml-1 text-xs text-muted-foreground">{o[1] > 0 ? '+' : '−'}${Math.abs(o[1]).toFixed(2)}</span>}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}

            <div className="mt-5 rounded-md bg-brand-soft p-4">
              <div className="text-[13px] text-muted-foreground">Estimated order value (FOB)</div>
              <div className="num font-display text-[28px] leading-tight font-semibold">
                {quote.total ? `${usd(quote.total[0])} – ${usd(quote.total[1])}` : 'Enter a quantity'}
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2 border-t border-brand/15 pt-3 text-[13.5px]">
                <label htmlFor="mk" className="text-muted-foreground">Import duty in</label>
                <select id="mk" value={market} onChange={(e) => setMarket(Number(e.target.value))} className="rounded-md border border-input bg-card px-2 py-1 text-[13.5px]">
                  {DUTY_PRESETS.map((d, i) => <option key={d[0]} value={i}>{d[0]}</option>)}
                </select>
                <span className="text-muted-foreground">Duty at your border</span>
                <span className="num text-right font-semibold">{dutyPct === null ? 'Ask your broker' : dutyPct === 0 ? '0% — duty-free' : `${dutyPct}% (≈ ${quote.total ? usd(((quote.total[0] + quote.total[1]) / 2) * dutyPct / 100) : '—'})`}</span>
              </div>
              <p className="mt-2 text-[12px] text-muted-foreground">Freight is quoted per shipment. Your proforma invoice confirms the final price.</p>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={add} className="btn btn-primary">{added || inBasket ? <><CheckCircle2 className="size-4" aria-hidden="true" /> {added ? 'Added — update anytime' : 'In your quote'}</> : 'Add to quote'}</button>
              <Link to="/quote" onClick={() => { if (!inBasket && !added) add() }} className="btn btn-outline">Get my price in 24 h <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
            {(added || inBasket) && <p className="mt-2 text-center text-[13px]"><Link to="/quote" className="font-semibold text-brand">Review your quote ({items.length} {items.length === 1 ? 'item' : 'items'}) →</Link></p>}
          </div>

          <ul className="mt-5 grid list-none gap-2 p-0 text-[14px] sm:grid-cols-2">
            {[
              [FileText, 'Priced proforma invoice within 24 hours'],
              [ShieldCheck, 'Pre-shipment inspection; SGS / Intertek on request'],
              [Globe2, '0% duty into the EU, UK, Canada, Australia, China'],
              [CheckCircle2, 'Pay by LC at sight or 30% T/T advance'],
            ].map(([Icon, t]) => {
              const I = Icon as typeof FileText
              return <li key={t as string} className="flex items-start gap-2"><I className="mt-0.5 size-4 flex-none text-ok" aria-hidden="true" />{t as string}</li>
            })}
          </ul>
        </div>
      </section>

      {/* Key facts */}
      <section className="border-y border-border bg-card">
        <dl className="mx-auto grid max-w-7xl gap-px px-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Package, 'Minimum order', f.moq],
            [Clock, isProduce ? 'Order to dispatch' : 'Production lead time', `${leadMin}–${leadMax} days`],
            [Ship, 'Ships from', shipsFrom(f.cat)],
            [isProduce ? Leaf : FileText, isProduce ? 'Season' : 'HS code', isProduce ? (s.season ?? 'All year') : f.hs],
          ].map(([Icon, k, v]) => {
            const I = Icon as typeof Package
            return (
              <div key={k as string} className="flex gap-3 py-5 lg:px-4 lg:first:pl-0">
                <I className="mt-0.5 size-5 flex-none text-jute" aria-hidden="true" />
                <div>
                  <dt className="text-[13px] text-muted-foreground">{k as string}</dt>
                  <dd className="m-0 text-[14.5px] font-semibold">{v as string}</dd>
                </div>
              </div>
            )
          })}
        </dl>
      </section>

      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-14">
        {/* Details */}
        <section aria-labelledby="details">
          <h2 id="details" className="mb-2 text-[clamp(1.6rem,3vw,2.1rem)]">Product details</h2>
          <p className="mb-6 max-w-[75ch] text-muted-foreground">{f.intro}</p>
          <div className="grid gap-6">
            {f.tables.map((t) => (
              <div key={t.title}>
                <h3 className="mb-2 text-lg">{t.title}</h3>
                <DataTable cols={t.cols} rows={t.rows} />
              </div>
            ))}
            {f.sizes && <p className="m-0 text-[15px]"><b>Sizes:</b> {f.sizes}</p>}
          </div>
        </section>

        {s.cal && (
          <section aria-labelledby="season">
            <h2 id="season" className="mb-2 text-[clamp(1.6rem,3vw,2.1rem)]">When it's available</h2>
            <p className="mb-5 text-muted-foreground">Teal = available, gold = peak season with the best prices, faded = limited supply.</p>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
              {s.cal.map((v, m) => {
                const peak = s.peak?.includes(m + 1)
                return (
                  <div key={m} className="text-center">
                    <div className={cn('h-10 rounded', v ? (peak ? 'bg-jute' : 'bg-brand') : 'bg-muted')} style={{ opacity: v && v < 1 && !peak ? 0.45 : 1 }} title={`${MONTHS[m]}: ${v ? (peak ? 'peak' : v < 1 ? 'limited' : 'available') : 'not available'}`} />
                    <span className="text-[12px] text-muted-foreground">{MONTHS[m]}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Packing & shipping */}
        <section aria-labelledby="shipping" className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 id="shipping" className="mb-4 text-[clamp(1.6rem,3vw,2.1rem)]">Packing and shipping</h2>
            <DataTable cols={['Item', 'Detail']} rows={[...f.packing, ['Ships from', shipsFrom(f.cat)], ['Price basis', 'FOB by default; CFR and CIF quoted per shipment']]} />
            <p className="mt-2 text-[13px] text-muted-foreground">Container loads are approximate and depend on size mix, folding and carton size.</p>
          </div>
          <div>
            <h3 className="mt-2 mb-4 text-lg lg:mt-[3.1rem]">Typical sea transit from Chattogram</h3>
            <DataTable
              cols={['Destination', 'Days', 'Route']}
              rows={TRANSIT.map((t) => [t[0], <span className="num">{t[2]}</span>, <Pill tone={t[3] === 'ok' ? 'ok' : t[3] === 'watch' ? 'warn' : 'danger'}>{t[4]}</Pill>])}
            />
            <p className="mt-2 text-[13px] text-muted-foreground">Air freight from Dhaka takes 1–4 days. <Link to="/shipping" className="text-brand">All shipping options</Link></p>
          </div>
        </section>

        {/* Duty */}
        <section aria-labelledby="duty">
          <h2 id="duty" className="mb-2 text-[clamp(1.6rem,3vw,2.1rem)]">Import duty in your country</h2>
          <p className="mb-5 max-w-[75ch] text-muted-foreground">Bangladesh is a Least Developed Country until 24 November 2029, so most large markets let this product in duty-free with the origin certificate we supply.</p>
          <DataTable
            cols={['Market', 'Duty on goods from Bangladesh', 'Proof we supply']}
            rows={DUTY.map((d) => [d.short, <Pill tone={d.zero ? 'ok' : 'warn'}>{isProduce && /Gulf/.test(d.short) ? '0% on fresh produce' : d.duty}</Pill>, <span className="text-[14px]">{d.proof}</span>])}
          />
          <p className="mt-2 text-[13px] text-muted-foreground">General guidance as of {SITE.updated}; your customs broker confirms the rate for your HS code. <Link to="/duty-free-markets" className="text-brand">Landed-cost calculator</Link></p>
        </section>

        {/* Quality */}
        <section aria-labelledby="quality" className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 id="quality" className="mb-4 text-2xl">Tests and inspections</h2>
            <ul className="m-0 grid list-none gap-2 p-0 text-[15px]">{f.tests.map((t) => <li key={t} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 flex-none text-ok" aria-hidden="true" />{t}</li>)}</ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-2xl">Certificates available</h2>
            <div className="flex flex-wrap gap-2">{f.certs.map((c) => <Pill key={c}>{c}</Pill>)}</div>
            <p className="mt-4 mb-0 text-[14px] text-muted-foreground">Ask for the certificate copies of the factory or farm that makes your order. Originals travel with your shipping documents.</p>
          </div>
        </section>

        {/* Process + payment */}
        <section aria-labelledby="process">
          <h2 id="process" className="mb-5 text-[clamp(1.6rem,3vw,2.1rem)]">How ordering works</h2>
          <ol className="m-0 grid list-none gap-px overflow-hidden rounded-lg border border-border bg-border p-0 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, d, time], i) => (
              <li key={t} className="bg-card p-5">
                <span className="num font-display text-2xl font-semibold text-jute">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 mb-1 text-[16px]">{t}</h3>
                <p className="m-0 text-[14px] text-muted-foreground">{d}</p>
                <span className="mt-2 block text-[13px] font-semibold text-brand">{time}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {PAYMENT_TERMS.slice(0, 2).map(([k, v]) => (
              <p key={k} className="m-0 rounded-lg border border-border bg-card p-4 text-[14.5px]"><b>{k}:</b> <span className="text-muted-foreground">{v}</span></p>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-start justify-between gap-6 rounded-lg bg-brand p-8 text-brand-ink md:flex-row md:items-center">
          <div>
            <h2 className="m-0 text-[clamp(1.5rem,3vw,2rem)]">Questions about {s.n.toLowerCase()}?</h2>
            <p className="mt-2 mb-0 opacity-85">Ask about specs, samples, packing or a target price. We reply within one working day.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/quote" search={{ tab: 'requirement' }} className="btn bg-brand-ink text-brand">Ask a question</Link>
            <a href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Question about ${s.n}`)}`} className="btn border border-brand-ink/40 text-brand-ink">Email sales</a>
          </div>
        </section>

        {siblings.length > 0 && (
          <section aria-labelledby="similar">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <h2 id="similar" className="m-0 text-[clamp(1.5rem,3vw,2rem)]">More {f.name.toLowerCase()}</h2>
              <Link to="/products/$familyId" params={{ familyId: f.id }} className="inline-flex items-center gap-1 font-semibold text-brand no-underline">All {f.styles.length} types <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {siblings.slice(0, 10).map((x) => <ItemTile key={x.n} f={f} s={x} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
