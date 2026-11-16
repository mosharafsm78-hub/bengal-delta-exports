import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Leaf, FileText, ShieldCheck, Ship, BadgeCheck, Headset, ClipboardList, ClipboardCheck, Network } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { HeroBanner } from '@/components/hero-banner'
import { CATS, FAMILIES } from '@/data/catalog'
import { Photo } from '@/components/photo'
import { ItemTile, inSeason } from '@/components/item-tile'
import { CAT_PHOTO, catStyle } from '@/lib/cat-style'

export const Route = createFileRoute('/')({
  head: () => pageHead('/'),
  component: Home,
})

const MONTH_NAME = new Date().toLocaleString('en-GB', { month: 'long' })
const arrow = <ArrowRight className="size-4" aria-hidden="true" />

/** A few best sellers from every category, for the "Popular" row. */
const POPULAR: [string, string][] = [
  ['tshirts', 'Crew-neck basic tee'], ['casual-footwear', 'EVA / PU slides'], ['vegetables', 'Potato (alu)'], ['fruits', 'Mango (aam)'],
  ['denim', 'Slim-fit jeans'], ['jute-bags', 'Jute shopping tote'], ['towels', 'Bath towel'], ['spices', 'Turmeric powder'],
  ['fleece', 'Pullover hoodie'], ['vegetables', 'Green chili (kacha morich)'],
]

function Home() {
  const typeCount = FAMILIES.reduce((n, f) => n + f.styles.length, 0)
  const produce = FAMILIES.filter((f) => f.cat === 'produce').flatMap((f) => f.styles.map((s) => ({ f, s })))
  const seasonal = produce.filter(({ s }) => inSeason(s)).slice(0, 10)
  const popular = POPULAR.map(([fid, n]) => {
    const f = FAMILIES.find((x) => x.id === fid)
    const s = f?.styles.find((x) => x.n === n) ?? f?.styles[0]
    return f && s ? { f, s } : null
  }).filter(Boolean) as { f: (typeof FAMILIES)[number]; s: (typeof FAMILIES)[number]['styles'][number] }[]

  return (
    <div>
      <HeroBanner />

      {/* Proof */}
      <section className="border-b border-border bg-card">
        <dl className="mx-auto m-0 grid max-w-7xl grid-cols-2 px-4 lg:grid-cols-4">
          {([['10,000+', 'Suppliers in our network'], ['7', 'Export sectors'], ['24 h', 'Quotation turnaround'], ['100%', 'LC at sight']] as const).map(([n, l], i) => (
            <div key={l} className={`py-7 lg:py-9 ${i % 2 ? 'pl-6' : ''} ${i > 0 ? 'lg:border-l lg:border-border lg:pl-8' : ''} ${i > 1 ? 'border-t border-border lg:border-t-0' : ''}`}>
              <dt className="num font-display text-[clamp(2rem,4vw,3rem)] leading-none font-semibold text-ink">{n}</dt>
              <dd className="m-0 mt-2 text-[14.5px] text-muted-foreground">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2 className="m-0 text-[clamp(1.8rem,3.4vw,2.5rem)]">Sectors we export</h2>
          <Link to="/products" className="inline-flex items-center gap-1 font-semibold text-brand no-underline">See all {typeCount} products {arrow}</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATS.map((c) => {
            const n = FAMILIES.filter((f) => f.cat === c.id).reduce((s, f) => s + f.styles.length, 0)
            return (
              <Link key={c.id} to="/products" search={{ cat: c.id }} style={catStyle(c.id)} className="group overflow-hidden rounded-xl text-foreground no-underline shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg">
                <Photo id={CAT_PHOTO[c.id]} alt={c.name} className="aspect-[4/3]" />
                <div className="cat-bg flex items-center justify-between gap-2 px-4 py-3">
                  <span className="text-[16px] leading-tight font-semibold">{c.name}</span>
                  <span className="num flex-none rounded-full bg-white/20 px-2 py-0.5 text-[12px] font-semibold">{n}</span>
                </div>
              </Link>
            )
          })}
          <Link to="/quote" search={{ tab: 'requirement' }} className="flex flex-col justify-center rounded-xl border-2 border-dashed border-jute bg-jute-soft p-5 text-foreground no-underline">
            <span className="text-[17px] font-semibold">Custom sourcing</span>
            <span className="mt-1 text-[14px] text-muted-foreground">Any product made in Bangladesh.</span>
            <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-brand">Send a requirement {arrow}</span>
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="m-0 text-[clamp(1.8rem,3.4vw,2.5rem)]">One partner. End to end.</h2>
          <p className="mt-3 mb-0 text-[17px] text-muted-foreground">We manage the full chain, so you deal with one accountable team.</p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {([
            [Network, 'Supplier sourcing', 'Matched from 10,000+ suppliers to your product, volume and price.', '/suppliers'],
            [BadgeCheck, 'Reliability', 'Capacity, track record and delivery checked before every order.', '/suppliers'],
            [ShieldCheck, 'Compliance', 'Social and environmental audits, certificates and your code of conduct.', '/quality'],
            [ClipboardCheck, 'Quality control', 'Inline checks and pre-shipment inspection on every order.', '/quality'],
            [Ship, 'Logistics', 'FCL, LCL and air freight, insured to your port.', '/shipping'],
            [FileText, 'Documentation and LC', 'Export documents, certificates of origin and LC handled for you.', '/how-we-work'],
          ] as const).map(([Icon, t, d, to]) => (
            <Link key={t} to={to} className="group bg-card p-7 text-foreground no-underline transition hover:bg-brand-soft/40">
              <Icon className="size-7 text-brand" aria-hidden="true" />
              <h3 className="mt-5 mb-0 text-[19px]">{t}</h3>
              <p className="mt-2 mb-0 text-[15px] text-muted-foreground">{d}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <h2 className="m-0 mb-8 text-[clamp(1.8rem,3.4vw,2.5rem)]">How an order runs</h2>
        <ol className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {(['Requirement', 'Quotation and samples', 'LC and production', 'Inspection and shipment'] as const).map((t, i) => (
            <li key={t} className="border-t-2 border-brand pt-4">
              <span className="num text-[13px] font-semibold text-brand">0{i + 1}</span>
              <h3 className="mt-1 mb-0 text-[18px]">{t}</h3>
            </li>
          ))}
        </ol>
        <p className="mt-6 mb-0"><Link to="/how-we-work" className="inline-flex items-center gap-1 font-semibold text-brand no-underline">Full order process {arrow}</Link></p>
      </section>

      {/* Buyer desk */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="grid items-center gap-8 overflow-hidden rounded-2xl bg-ink p-8 text-paper md:grid-cols-[1.2fr_1fr] md:p-12">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1 text-[13px] font-semibold"><BadgeCheck className="size-4" aria-hidden="true" />Free for buyers</span>
            <h2 className="mt-4 mb-3 text-[clamp(1.8rem,3.4vw,2.5rem)] text-paper">Your dedicated sourcing agent</h2>
            <p className="m-0 text-[17px] text-paper/80">Instant answers and live tracking for every order. Free for buyers.</p>
            <Link to="/account" hash="signup" className="btn mt-6 bg-paper text-ink">Create free account <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <ul className="m-0 grid gap-3 p-0">
            {([[Headset, 'A named agent who knows your business', 'Plus instant AI answers, day and night'], [BadgeCheck, 'Verified buyer badge', 'Earned by checks on your company, never bought'], [ClipboardList, 'Every request tracked live', 'From offer to samples, LC, production and shipping']] as const).map(([Icon, t, d]) => (
              <li key={t} className="flex list-none gap-3 rounded-xl bg-paper/5 p-4"><Icon className="mt-0.5 size-5 flex-none text-[hsl(var(--brand-soft))]" aria-hidden="true" /><span><b className="block">{t}</b><span className="text-[14px] text-paper/70">{d}</span></span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* Popular */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2 className="m-0 text-[clamp(1.8rem,3.4vw,2.5rem)]">Popular with importers</h2>
          <Link to="/products" className="inline-flex items-center gap-1 font-semibold text-brand no-underline">All products {arrow}</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {popular.map(({ f, s }) => <ItemTile key={f.id + s.n} f={f} s={s} price={false} />)}
        </div>
      </section>

      {/* Fresh produce */}
      {seasonal.length > 0 && (
        <section className="mt-20 bg-ok-soft">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-ok px-3 py-1 text-[13px] font-semibold text-white"><Leaf className="size-3.5" aria-hidden="true" /> Fresh now</div>
                <h2 className="m-0 text-[clamp(1.8rem,3.4vw,2.5rem)]">Vegetables and fruit in season in {MONTH_NAME}</h2>
              </div>
              <Link to="/products" search={{ cat: 'produce' }} className="btn btn-primary">All {produce.length} fresh items</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {seasonal.map(({ f, s }) => <ItemTile key={f.id + s.n} f={f} s={s} price={false} />)}
            </div>
          </div>
        </section>
      )}

      {/* Suppliers */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <Link to="/suppliers" className="flex flex-col items-start justify-between gap-4 rounded-2xl border-2 border-dashed border-jute bg-jute-soft p-7 text-foreground no-underline md:flex-row md:items-center">
          <div>
            <h3 className="m-0 text-xl">Manufacturer or grower in Bangladesh?</h3>
            <p className="mt-1 mb-0 text-muted-foreground">Join our supplier network and reach buyers worldwide.</p>
          </div>
          <span className="btn bg-jute text-white">Join the network {arrow}</span>
        </Link>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-brand p-10 text-brand-ink md:flex-row md:items-center">
          <div>
            <h2 className="m-0 text-[clamp(1.6rem,3vw,2.3rem)]">Send your requirement. Quotation within 24 hours.</h2>
          </div>
          <Link to="/quote" className="btn bg-white px-7 py-3.5 text-base text-brand">Request a quotation</Link>
        </div>
      </section>
    </div>
  )
}
