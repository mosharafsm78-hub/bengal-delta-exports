import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Search, PackageCheck, PenTool, Compass, Globe2, Ship, ShieldCheck, ArrowRight, Leaf, Factory, FileCheck2, Landmark, CheckCircle2 } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { CATS, FAMILIES } from '@/data/catalog'
import { STEPS } from '@/data/site'
import { Photo } from '@/components/photo'
import { ItemTile, inSeason } from '@/components/item-tile'

export const Route = createFileRoute('/')({
  head: () => pageHead('/'),
  component: Home,
})

const CAT_PHOTO: Record<string, string> = {
  garments: 'tshirt-family', footwear: 'slides', home: 'bath-towels', jute: 'jute-tote', produce: 'produce-market', food: 'turmeric-powder', crafts: 'seagrass-basket',
}
const MONTH_NAME = new Date().toLocaleString('en-GB', { month: 'long' })

function SectionHead({ eyebrow, title, link }: { eyebrow: string; title: string; link?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="eyebrow mb-2">{eyebrow}</div>
        <h2 className="m-0 text-[clamp(1.7rem,3.2vw,2.4rem)]">{title}</h2>
      </div>
      {link}
    </div>
  )
}

const arrow = <ArrowRight className="size-4" aria-hidden="true" />

function Home() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const typeCount = FAMILIES.reduce((n, f) => n + f.styles.length, 0)
  const featured = ['tshirts', 'casual-footwear', 'denim', 'vegetables', 'jute-bags', 'towels', 'fruits', 'spices']
  const produce = FAMILIES.filter((f) => f.cat === 'produce').flatMap((f) => f.styles.map((s) => ({ f, s })))
  const seasonal = [...produce.filter(({ s }) => inSeason(s)), ...produce.filter(({ s }) => !inSeason(s))].slice(0, 10)

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <div>
            <div className="eyebrow mb-4">Export hub · Chattogram, Bangladesh</div>
            <h1 className="m-0 text-[clamp(2.4rem,5.4vw,4rem)] leading-[1.04]">Buy anything Bangladesh makes or grows, from one exporter.</h1>
            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted-foreground">
              Garments, footwear, home textiles, jute, fresh vegetables and fruit, food and handicrafts. See every product with its specs and FOB price, work out your order total, and get a priced quote within 24 hours.
            </p>
            <form
              className="mt-8 flex max-w-xl gap-2 rounded-full border border-input bg-background p-1.5 shadow-sm"
              role="search"
              onSubmit={(e) => {
                e.preventDefault()
                void navigate({ to: '/products', search: { q: q.trim() || undefined } })
              }}
            >
              <label htmlFor="hub-search" className="sr-only">Search products</label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input id="hub-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try hoodie, okra, jute bag, slides…" className="w-full rounded-full border-0 bg-transparent py-2.5 pr-3 pl-11 text-base outline-none" />
              </div>
              <button type="submit" className="rounded-full bg-brand px-6 font-semibold text-brand-ink hover:opacity-90">Search</button>
            </form>
            <ul className="mt-5 flex list-none flex-wrap gap-x-5 gap-y-1.5 p-0 text-[14px]">
              {['Priced quote in 24 hours', 'Samples before bulk', 'Pay by bank LC or 30% advance'].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-ok" aria-hidden="true" />{t}</li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[13.5px]">
              <span className="text-muted-foreground">Popular:</span>
              {[['T-shirts', 'tshirts'], ['Fresh vegetables', 'vegetables'], ['Mango', 'fruits'], ['Jute bags', 'jute-bags'], ['Sneakers', 'casual-footwear']].map(([l, id]) => (
                <Link key={id} to="/products/$familyId" params={{ familyId: id }} className="rounded-full border border-border px-2.5 py-0.5 text-foreground no-underline hover:border-brand hover:text-brand">{l}</Link>
              ))}
            </div>
          </div>
          <div className="grid aspect-[5/4] grid-cols-6 grid-rows-6 gap-3">
            <Photo id="produce-market" alt="Fresh vegetables at a market in Dhaka" className="col-span-4 row-span-4 rounded-lg" eager />
            <Photo id="tshirt-family" alt="Cotton T-shirts on hangers" className="col-span-2 row-span-3 rounded-lg" eager />
            <Photo id="slides" alt="Slide sandals" className="col-span-2 row-span-3 rounded-lg" eager />
            <Photo id="jute-tote" alt="Jute bags" className="col-span-2 row-span-2 rounded-lg" />
            <Photo id="mango" alt="Mangoes" className="col-span-2 row-span-2 rounded-lg" />
          </div>
        </div>
        <div className="border-t border-border">
          <dl className="mx-auto my-0 grid max-w-7xl grid-cols-2 px-4 sm:grid-cols-4 sm:divide-x sm:divide-border">
            {[[String(typeCount), 'products across 7 categories'], ['24 h', 'priced quote turnaround'], ['0%', 'import duty: EU, UK, Canada, Australia, China'], ['FOB · CFR · CIF', 'Chattogram sea port and Dhaka air cargo']].map(([b, s]) => (
              <div key={s} className="py-5 sm:px-6 sm:first:pl-0">
                <dt className="num font-display text-2xl font-semibold">{b}</dt>
                <dd className="m-0 mt-0.5 text-[13.5px] text-muted-foreground">{s}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <SectionHead eyebrow="Catalogue" title="Seven categories, one exporter" link={<Link to="/products" className="inline-flex items-center gap-1 text-[15px] font-semibold text-brand no-underline">All products {arrow}</Link>} />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {CATS.map((c) => {
            const n = FAMILIES.filter((f) => f.cat === c.id).reduce((s, f) => s + f.styles.length, 0)
            return (
              <Link key={c.id} to="/products" search={{ cat: c.id }} className="group text-foreground no-underline">
                <Photo id={CAT_PHOTO[c.id]} alt={c.name} className="aspect-[4/3] rounded-lg transition group-hover:opacity-90" />
                <h3 className="mt-3 mb-0 text-[17px] group-hover:text-brand">{c.name}</h3>
                <p className="mt-0.5 mb-0 text-[14px] text-muted-foreground">{c.blurb}</p>
                <p className="num mt-1.5 mb-0 text-[13px] font-semibold text-jute">{n} products</p>
              </Link>
            )
          })}
          <Link to="/quote" search={{ tab: 'requirement' }} className="flex aspect-[4/3] flex-col justify-end rounded-lg border border-dashed border-jute bg-jute-soft p-5 text-foreground no-underline">
            <h3 className="m-0 text-[17px]">Something else?</h3>
            <p className="mt-1 mb-0 text-[14px] text-muted-foreground">Tell us the product and quantity. We source across Bangladesh.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-brand">Send a requirement {arrow}</span>
          </Link>
        </div>
      </section>

      {/* Fresh produce */}
      <section className="mt-20 bg-ok-soft">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="eyebrow mb-2 inline-flex items-center gap-1.5"><Leaf className="size-3.5" aria-hidden="true" /> Fresh vegetables & fruit</div>
              <h2 className="m-0 text-[clamp(1.7rem,3.2vw,2.4rem)]">From Bangladeshi farms, in season in {MONTH_NAME}</h2>
              <p className="mt-3 mb-0 max-w-[62ch] text-muted-foreground">
                {produce.length} vegetables and fruits: potato, gourds, okra, chili, brinjal, leafy greens, mango, jackfruit and more. Residue-tested, phytosanitary-certified, shipped by air from Dhaka or reefer from Chattogram.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" search={{ cat: 'produce' }} className="btn btn-primary">All {produce.length} items</Link>
              <Link to="/season-calendar" className="btn btn-outline">Season calendar</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {seasonal.map(({ f, s }) => <ItemTile key={f.id + s.n} f={f} s={s} />)}
          </div>
        </div>
      </section>

      {/* Buying paths */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <SectionHead eyebrow="Three ways to buy" title="How do you want to buy?" />
        <div className="grid gap-5 md:grid-cols-3">
          <div className="flex flex-col rounded-lg border border-border bg-card p-7">
            <PackageCheck className="size-7 text-brand" aria-hidden="true" />
            <h3 className="mt-5 mb-0 text-xl">Ready styles</h3>
            <p className="mt-2 text-[15px] text-muted-foreground">Pick from the standard types we already make, in standard fabrics and packing. Fastest to quote and ship.</p>
            <Link to="/products" className="mt-auto inline-flex items-center gap-1 pt-4 font-semibold text-brand no-underline">Browse products {arrow}</Link>
          </div>
          <div className="flex flex-col rounded-lg border border-border bg-card p-7">
            <PenTool className="size-7 text-brand" aria-hidden="true" />
            <h3 className="mt-5 mb-0 text-xl">Your own spec or brand</h3>
            <p className="mt-2 text-[15px] text-muted-foreground">Choose fabric, weight, colour, print, labels and packaging. Every product page shows the price and order total as you choose.</p>
            <Link to="/products/$familyId" params={{ familyId: 'tshirts' }} hash="builder" className="mt-auto inline-flex items-center gap-1 pt-4 font-semibold text-brand no-underline">Try the T-shirt calculator {arrow}</Link>
          </div>
          <div className="flex flex-col rounded-lg border border-border bg-card p-7">
            <Compass className="size-7 text-brand" aria-hidden="true" />
            <h3 className="mt-5 mb-0 text-xl">Something not listed</h3>
            <p className="mt-2 text-[15px] text-muted-foreground">Tell us the product and quantity. We source across Bangladesh from audited mills, farms and artisans.</p>
            <Link to="/quote" search={{ tab: 'requirement' }} className="mt-auto inline-flex items-center gap-1 pt-4 font-semibold text-brand no-underline">Send a requirement {arrow}</Link>
          </div>
        </div>
      </section>

      {/* Popular */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <SectionHead eyebrow="Best sellers" title="Popular with importers" link={<Link to="/products" className="inline-flex items-center gap-1 text-[15px] font-semibold text-brand no-underline">Full catalogue {arrow}</Link>} />
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {featured.map((id) => {
            const f = FAMILIES.find((x) => x.id === id)!
            const lo = Math.min(...f.styles.map((s) => s.p[0]))
            const unit = f.styles[0].u ?? 'pc'
            return (
              <Link key={id} to="/products/$familyId" params={{ familyId: id }} className="group text-foreground no-underline">
                <Photo id={f.photo} alt={f.name} className="aspect-[4/3] rounded-lg transition group-hover:opacity-90" />
                <h3 className="mt-3 mb-0 text-[17px] group-hover:text-brand">{f.name}</h3>
                <p className="m-0 text-[14px] text-muted-foreground">{f.styles.length} types · from <span className="num font-semibold text-foreground">${lo.toFixed(2)}</span> / {unit} FOB</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Why us */}
      <section className="mt-20 border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-3">
          {[
            { icon: Globe2, t: 'Duty-free into most big markets', d: 'Bangladesh keeps least-developed-country status until 24 November 2029: 0% import duty in the EU, UK, Canada, Australia and China, and on most goods in Japan, Korea and India.', to: '/duty-free-markets' as const, cta: 'See the duty table' },
            { icon: Ship, t: 'Sea, reefer and air', d: 'Containers from Chattogram, fresh produce by air from Dhaka, samples by courier. Typical transit times for 13 destinations, with live route advisories.', to: '/shipping' as const, cta: 'Shipping and transit' },
            { icon: ShieldCheck, t: 'Checked before it ships', d: 'AQL inspection, lab tests, residue testing for produce and the official certificates each market requires.', to: '/quality' as const, cta: 'Quality and compliance' },
          ].map((c) => (
            <div key={c.t}>
              <c.icon className="size-7 text-jute" aria-hidden="true" />
              <h3 className="mt-4 mb-0 text-xl">{c.t}</h3>
              <p className="mt-2 text-[15px] text-muted-foreground">{c.d}</p>
              <Link to={c.to} className="inline-flex items-center gap-1 font-semibold text-brand no-underline">{c.cta} {arrow}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <SectionHead eyebrow="Buy with confidence" title="Safe for first-time buyers" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Landmark, 'Bank-secured payment', 'Letter of Credit at sight through your bank, or 30% advance with the balance against shipping documents.'],
            [FileCheck2, 'Registered exporter', 'Export Registration Certificate, trade licence, TIN and BIN. Official certificates travel with every shipment.'],
            [ShieldCheck, 'Independent inspection', 'Book SGS, Intertek or Bureau Veritas, or get our photo and video inspection report before you pay the balance.'],
            [Factory, 'Own factories', 'We make footwear in our own factories and audit every partner mill, farm and artisan group we source from.'],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Landmark
            return (
              <div key={t as string} className="rounded-lg border border-border bg-card p-6">
                <I className="size-6 text-brand" aria-hidden="true" />
                <h3 className="mt-4 mb-0 text-[17px]">{t as string}</h3>
                <p className="mt-2 mb-0 text-[14.5px] text-muted-foreground">{d as string}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <SectionHead eyebrow="Process" title="From inquiry to your port" link={<Link to="/how-we-work" className="inline-flex items-center gap-1 text-[15px] font-semibold text-brand no-underline">Full process {arrow}</Link>} />
        <ol className="m-0 grid list-none gap-px overflow-hidden rounded-lg border border-border bg-border p-0 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([t, d, time], i) => (
            <li key={t} className="bg-card p-6">
              <span className="num font-display text-3xl font-semibold text-jute">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 mb-0 text-[17px]">{t}</h3>
              <p className="mt-1 mb-0 text-[14.5px] text-muted-foreground">{d}</p>
              <span className="mt-3 block text-[13px] font-semibold text-brand">{time}</span>
            </li>
          ))}
        </ol>
        <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-lg bg-brand p-10 text-brand-ink md:flex-row md:items-center">
          <div>
            <h2 className="m-0 text-[clamp(1.6rem,3vw,2.2rem)]">Send one inquiry, get a priced quote in 24 hours.</h2>
            <p className="mt-2 mb-0 opacity-85">List several products, or describe anything you need sourced.</p>
          </div>
          <Link to="/quote" className="btn bg-brand-ink text-brand">Request a quote</Link>
        </div>
      </section>
    </div>
  )
}
