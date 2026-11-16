import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { CheckCircle2, Ship, Clock, Package, ArrowRight, Landmark, Info, Settings2, Printer, MessageSquare, FlaskConical } from 'lucide-react'
import { catById, findItem } from '@/data/catalog'
import { DUTY, LC_TERMS, PAYMENT_HEADLINE, STEPS, TRANSIT, SITE } from '@/data/site'
import { PHOTOS, photoAbs } from '@/data/photos'
import { pageHead } from '@/lib/head'
import { Photo } from '@/components/photo'
import { ItemTile, inSeason } from '@/components/item-tile'
import { DataTable, Pill, TrustRow } from '@/components/site-shell'
import { basket, useBasket } from '@/lib/quote-basket'
import { defaultPicks, priceFor, tierMin, unitName } from '@/lib/pricing'
import { money, slug, usd } from '@/lib/slug'
import { cn } from '@/lib/utils'
import { catStyle } from '@/lib/cat-style'

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
          title: `${loaderData.s.n} — ${loaderData.f.name} from Bangladesh, price & specs | ${SITE.name}`,
          description: `${loaderData.s.d} Indicative FOB ${money(loaderData.s.p[0])}–${loaderData.s.p[1].toFixed(2)} per ${loaderData.s.u ?? 'pc'}. Minimum order ${loaderData.f.moq}. Firm offer in 24 hours, payment by LC.`,
          image: photoAbs(loaderData.s.photo),
        })
      : pageHead('/products'),
  component: ItemPage,
})

function shipsFrom(cat: string) {
  if (cat === 'produce') return 'By air from Dhaka, or reefer container from Chattogram'
  if (cat === 'food') return 'Container from Chattogram port'
  return 'Container from Chattogram port, or air from Dhaka'
}

type Tab = 'details' | 'shipping' | 'duty' | 'quality' | 'order'

function ItemPage() {
  const { f, s } = Route.useLoaderData()
  // Keyed by product so photo, quantity and options reset when moving between products.
  return <ItemBody key={`${f.id}/${s.n}`} />
}

function ItemBody() {
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
  const [photo, setPhoto] = useState(s.photo)
  const [tab, setTab] = useState<Tab>('details')
  const [added, setAdded] = useState(false)
  const items = useBasket()

  const q = parseFloat(qty.replace(/,/g, '')) || 0
  const quote = useMemo(() => priceFor(f, s, picks, q), [f, s, picks, q])
  const mid = Math.round(((quote.lo + quote.hi) / 2) * 100) / 100
  const inBasket = items.some((b) => b.familyId === f.id && b.style === s.n)
  const leadMin = f.lead.reduce((a, l) => a + l[1], 0)
  const leadMax = f.lead.reduce((a, l) => a + l[2], 0)
  const siblings = f.styles.filter((x) => x.n !== s.n)
  // Only this product's own photo: the family photo shows a different product (e.g. potato on every vegetable).
  const gallery = [s.photo].filter((p) => PHOTOS[p])
  const custom = quote.specParts.length
  const productJson = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: s.n,
    description: s.d,
    category: f.name,
    image: photoAbs(s.photo),
    brand: { '@type': 'Brand', name: SITE.name },
    offers: { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: s.p[0].toFixed(2), highPrice: s.p[1].toFixed(2), availability: 'https://schema.org/InStock' },
  }

  const add = () => {
    basket.add({ familyId: f.id, family: f.name, style: s.n, itemId: slug(s.n), qty: q > 0 ? `${q.toLocaleString('en-US')} ${unitName(unit, q)}` : undefined, spec: quote.specParts.join(' · ') || undefined, estimate: `≈${money(mid)}/${unit}`, unitMid: mid, qtyNum: q > 0 ? q : undefined, unit })
    setAdded(true)
  }

  const tabs: [Tab, string][] = [['details', 'Details'], ['shipping', 'Packing & shipping'], ['duty', 'Import duty'], ['quality', 'Quality'], ['order', 'How to order & pay']]

  return (
    <div className="pb-24 lg:pb-0 print:pb-0" style={catStyle(f.cat)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJson) }} />
      <div className="mx-auto max-w-7xl px-4 pt-5">
        <nav aria-label="Breadcrumb" className="text-[13.5px] text-muted-foreground">
          <Link to="/products" className="text-muted-foreground no-underline hover:text-brand">Products</Link>
          <span className="mx-1.5">›</span>
          <Link to="/products" search={{ cat: f.cat }} className="text-muted-foreground no-underline hover:text-brand">{cat?.name}</Link>
          <span className="mx-1.5">›</span>
          <Link to="/products/$familyId" params={{ familyId: f.id }} className="text-muted-foreground no-underline hover:text-brand">{f.name}</Link>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pt-5 pb-12 lg:grid-cols-[1.05fr_1fr]">
        {/* Photos */}
        <div>
          <Photo id={photo} alt={s.n} className="aspect-[4/3] rounded-xl" credit eager />
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3">
              {gallery.map((p) => (
                <button key={p} type="button" onClick={() => setPhoto(p)} aria-label="Show this photo" className={cn('overflow-hidden rounded-lg border-2 p-0', photo === p ? 'border-[hsl(var(--c))]' : 'border-transparent opacity-75 hover:opacity-100')}>
                  <Photo id={p} alt="" className="size-20" />
                </button>
              ))}
            </div>
          )}
          <p className="mt-3 flex items-start gap-2 text-[13px] text-muted-foreground">
            <Info className="mt-0.5 size-4 flex-none" aria-hidden="true" />
            Catalogue sample image: it shows the product type, not your exact lot. Order a paid sample to see the real goods, and before shipping we send photos and video of your order.
          </p>
          <TrustRow className="mt-4" />
        </div>

        {/* Buy box */}
        <div>
          <span className="cat-bg inline-block rounded-full px-3 py-1 text-[12.5px] font-semibold">{f.name}</span>
          <h1 className="mt-3 mb-0 text-[clamp(2rem,4vw,2.8rem)]">{s.n}</h1>
          <p className="mt-2 text-[17px] text-muted-foreground">{s.d}</p>
          {s.cal && (
            <p className={cn('mt-2 mb-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold', inSeason(s) ? 'bg-ok-soft text-ok' : 'bg-warn-soft text-warn')}>
              {inSeason(s) ? '● Available now' : `● Out of season now — pre-book for ${s.season}`}
            </p>
          )}

          <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="num font-display text-[42px] leading-none font-semibold">{money(mid)}</span>
              <span className="text-muted-foreground">per {unitName(unit, 1)}</span>
            </div>
            <p className="mt-1.5 mb-0 text-[13px] text-muted-foreground">Estimated price, FOB Bangladesh. Your offer confirms the exact price.</p>

            <label htmlFor="qty" className="mt-5 mb-1.5 block font-semibold">How many {unitName(unit)}?</label>
            <div className="flex flex-wrap gap-2">
              {suggested.map((n) => (
                <button key={n} type="button" onClick={() => { setQty(String(n)); setAdded(false) }} className={cn('num rounded-lg border-2 px-3.5 py-2 text-[15px] font-semibold', q === n ? 'cat-soft cat-text border-[hsl(var(--c))]' : 'border-border bg-card hover:border-[hsl(var(--c))]')}>
                  {n.toLocaleString('en-US')}
                </button>
              ))}
              <input id="qty" inputMode="numeric" value={suggested.includes(q) ? '' : qty} onChange={(e) => { setQty(e.target.value.replace(/[^\d.,]/g, '')); setAdded(false) }} placeholder="Other" aria-label={`Quantity in ${unitName(unit)}`} className="num w-32 rounded-lg border-2 border-border bg-card px-3 py-2 text-[15px] outline-none focus:border-[hsl(var(--c))]" />
            </div>
            {quote.belowMoq && <p className="mt-2 mb-0 text-[13px] font-semibold text-warn">Usual minimum is {moq.toLocaleString('en-US')} {unitName(unit)}. We can still quote a trial order.</p>}

            <div className="cat-soft mt-5 flex items-center justify-between gap-3 rounded-lg px-4 py-3.5">
              <span className="font-medium">Estimated total</span>
              <span className="num font-display text-[28px] leading-none font-semibold">{q > 0 ? usd(mid * q) : '—'}</span>
            </div>

            {optGroups.length > 0 && (
              <details className="mt-4 rounded-lg border border-border">
                <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 font-semibold">
                  <Settings2 className="size-4" aria-hidden="true" /> Customise (optional){custom > 0 && <span className="cat-bg ml-1 rounded-full px-2 text-xs">{custom}</span>}
                </summary>
                <div className="grid gap-4 border-t border-border px-4 py-4">
                  {optGroups.map((g) => (
                    <fieldset key={g.name} className="m-0 border-0 p-0">
                      <legend className="mb-1.5 text-sm font-semibold">{g.name}</legend>
                      <div className="flex flex-wrap gap-2">
                        {g.opts!.map((o, oi) => {
                          const on = (picks[g.name] ?? 0) === oi
                          return (
                            <button key={o[0]} type="button" aria-pressed={on} onClick={() => { setPicks((p) => ({ ...p, [g.name]: oi })); setAdded(false) }} className={cn('rounded-md border px-3 py-1.5 text-left text-[13.5px]', on ? 'cat-soft cat-text border-[hsl(var(--c))] font-semibold' : 'border-border bg-card hover:border-[hsl(var(--c))]')}>
                              {o[0]}
                              {o[1] !== 0 && <span className="num ml-1 text-xs opacity-70">{o[1] > 0 ? '+' : '−'}${Math.abs(o[1]).toFixed(2)}</span>}
                            </button>
                          )
                        })}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </details>
            )}

            <div className="mt-5 grid gap-2.5">
              <Link to="/quote" onClick={() => { if (!inBasket && !added) add() }} className="btn btn-primary py-3.5 text-base">Get my firm price <ArrowRight className="size-4" aria-hidden="true" /></Link>
              <button type="button" onClick={add} className="btn btn-outline">{added || inBasket ? <><CheckCircle2 className="size-4" aria-hidden="true" /> Added to your list</> : 'Add to list and keep shopping'}</button>
            </div>
            {(added || inBasket) && <p className="mt-2 mb-0 text-center text-[13.5px]"><Link to="/quote" className="font-semibold text-brand">View your list ({items.length}) →</Link></p>}

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center text-[12.5px] print:hidden">
              <Link to="/quote" search={{ samples: true }} onClick={() => { if (!inBasket && !added) add() }} className="flex flex-col items-center gap-1 rounded-md p-2 text-foreground no-underline hover:bg-muted"><FlaskConical className="size-5 text-brand" aria-hidden="true" />Order a sample</Link>
              <Link to="/quote" search={{ tab: 'requirement', msg: `Question about ${s.n} (${f.name}): ` }} className="flex flex-col items-center gap-1 rounded-md p-2 text-foreground no-underline hover:bg-muted"><MessageSquare className="size-5 text-brand" aria-hidden="true" />Ask a question</Link>
              <button type="button" onClick={() => window.print()} className="flex flex-col items-center gap-1 rounded-md p-2 hover:bg-muted"><Printer className="size-5 text-brand" aria-hidden="true" />Spec sheet (PDF)</button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-xl border-2 border-jute/40 bg-jute-soft p-4 sm:flex-row sm:items-center">
            <FlaskConical className="size-6 flex-none text-jute" aria-hidden="true" />
            <div className="flex-1 text-[14px]">
              <b>{isProduce ? 'See it before you order.' : 'Samples in 24 hours.'}</b>{' '}
              {isProduce ? 'We send photos and video of the actual lot, or an air sample on request.' : 'Pay the sample invoice and ready-style samples ship by express courier within 24 hours. Cost credited on your order.'}
            </div>
            <Link to="/quote" search={{ samples: true }} onClick={() => { if (!inBasket && !added) add() }} className="btn bg-jute px-4 py-2.5 text-sm text-white">Request samples</Link>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl bg-brand-soft p-4 text-[14px]">
            <Landmark className="mt-0.5 size-5 flex-none text-brand" aria-hidden="true" />
            <span><b>Safe payment:</b> {PAYMENT_HEADLINE} through your own bank. Your money is released only after the goods ship. <Link to="/how-we-work" className="font-semibold text-brand">How it works</Link></span>
          </div>
        </div>
      </section>

      {/* Key facts */}
      <section className="border-y border-border bg-card">
        <dl className="mx-auto my-0 grid max-w-7xl gap-x-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Package, 'Minimum order', f.moq],
            [Clock, 'Ready to ship', `${leadMin}–${leadMax} days after your LC`],
            [Ship, 'Shipping', shipsFrom(f.cat)],
            [CheckCircle2, 'Import duty', isProduce ? '0% in EU, UK, Canada, Australia, China, Gulf' : '0% in EU, UK, Canada, Australia, China'],
          ].map(([Icon, k, v]) => {
            const I = Icon as typeof Package
            return (
              <div key={k as string} className="flex gap-3 py-5">
                <span className="cat-soft cat-text grid size-10 flex-none place-items-center rounded-lg"><I className="size-5" aria-hidden="true" /></span>
                <div>
                  <dt className="text-[13px] text-muted-foreground">{k as string}</dt>
                  <dd className="m-0 text-[14.5px] font-semibold">{v as string}</dd>
                </div>
              </div>
            )
          })}
        </dl>
      </section>

      {/* Tabs */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="scroll-row mb-6 flex gap-2 overflow-x-auto border-b border-border print:hidden" role="tablist">
          {tabs.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn('-mb-px border-b-[3px] px-4 py-3 text-[15px] font-semibold whitespace-nowrap', tab === id ? 'cat-text border-[hsl(var(--c))]' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'details' && (
          <div className="grid gap-6">
            <p className="m-0 max-w-[75ch] text-[16px] text-muted-foreground">{f.intro}</p>
            {f.tables.map((t) => (
              <div key={t.title}>
                <h3 className="mb-2 text-lg">{t.title}</h3>
                <DataTable cols={t.cols} rows={t.rows} />
              </div>
            ))}
            {f.sizes && <p className="m-0"><b>Sizes:</b> {f.sizes}</p>}
            {s.cal && (
              <div>
                <h3 className="mb-2 text-lg">Season</h3>
                <div className="grid max-w-3xl grid-cols-6 gap-2 sm:grid-cols-12">
                  {s.cal.map((v, m) => {
                    const peak = s.peak?.includes(m + 1)
                    return (
                      <div key={m} className="text-center">
                        <div className={cn('h-8 rounded', v ? (peak ? 'bg-jute' : 'bg-ok') : 'bg-muted')} style={{ opacity: v && v < 1 && !peak ? 0.45 : 1 }} />
                        <span className="text-[12px] text-muted-foreground">{MONTHS[m]}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">Green = available, gold = peak season (best price), faded = limited.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'shipping' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mt-0 mb-3 text-lg">Packing</h3>
              <DataTable cols={['Item', 'Detail']} rows={[...f.packing, ['Ships from', shipsFrom(f.cat)], ['Price basis', 'FOB by default; CFR and CIF on request']]} />
            </div>
            <div>
              <h3 className="mt-0 mb-3 text-lg">Days at sea from Chattogram</h3>
              <DataTable cols={['Destination', 'Days', 'Route']} rows={TRANSIT.map((t) => [t[0], <span className="num">{t[2]}</span>, <Pill tone={t[3] === 'ok' ? 'ok' : t[3] === 'watch' ? 'warn' : 'danger'}>{t[4]}</Pill>])} />
              <p className="mt-2 text-[13px] text-muted-foreground">Air freight from Dhaka takes 1–4 days.</p>
            </div>
          </div>
        )}

        {tab === 'duty' && (
          <div>
            <p className="mt-0 max-w-[75ch] text-muted-foreground">Bangladesh is a Least Developed Country until 24 November 2029, so most big markets charge no import duty on this product. We supply the origin certificate you need.</p>
            <DataTable cols={['Market', 'Import duty', 'Proof we supply']} rows={DUTY.map((d) => [d.short, <Pill tone={d.zero ? 'ok' : 'warn'}>{isProduce && /Gulf/.test(d.short) ? '0% on fresh produce' : d.duty}</Pill>, <span className="text-[14px]">{d.proof}</span>])} />
          </div>
        )}

        {tab === 'quality' && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mt-0 mb-3 text-lg">Tests and inspections</h3>
              <ul className="m-0 grid list-none gap-2 p-0 text-[15px]">{f.tests.map((t) => <li key={t} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 flex-none text-ok" aria-hidden="true" />{t}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mt-0 mb-3 text-lg">Certificates available</h3>
              <div className="flex flex-wrap gap-2">{f.certs.map((c) => <Pill key={c}>{c}</Pill>)}</div>
            </div>
          </div>
        )}

        {tab === 'order' && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <ol className="m-0 grid list-none gap-3 p-0">
              {STEPS.map(([t, d, time], i) => (
                <li key={t} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                  <span className="cat-bg num grid size-8 flex-none place-items-center rounded-full text-sm font-semibold">{i + 1}</span>
                  <div>
                    <div className="font-semibold">{t} <span className="ml-1 text-[13px] font-normal text-muted-foreground">· {time}</span></div>
                    <div className="text-[14.5px] text-muted-foreground">{d}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div>
              <h3 className="mt-0 mb-3 text-lg">What your LC should say</h3>
              <DataTable cols={['LC field', 'What to write']} rows={LC_TERMS} />
              <Link to="/how-we-work" className="mt-3 inline-flex items-center gap-1 font-semibold text-brand no-underline">Full payment guide <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
          </div>
        )}
      </section>

      {siblings.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h2 className="m-0 text-[clamp(1.5rem,3vw,2rem)]">More {f.name.toLowerCase()}</h2>
            <Link to="/products/$familyId" params={{ familyId: f.id }} className="inline-flex items-center gap-1 font-semibold text-brand no-underline">See all {f.styles.length} <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {siblings.slice(0, 10).map((x) => <ItemTile key={x.n} f={f} s={x} />)}
          </div>
        </section>
      )}

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden print:hidden">
        <div className="min-w-0 flex-1">
          <div className="num font-semibold">{money(mid)} / {unitName(unit, 1)}</div>
          <div className="num truncate text-[13px] text-muted-foreground">{q > 0 ? `${q.toLocaleString('en-US')} ${unitName(unit, q)} ≈ ${usd(mid * q)}` : s.n}</div>
        </div>
        <Link to="/quote" onClick={() => { if (!inBasket && !added) add() }} className="btn btn-primary px-4 py-2.5 text-sm">Get firm price</Link>
      </div>
    </div>
  )
}
