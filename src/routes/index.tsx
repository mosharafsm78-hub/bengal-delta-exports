import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Leaf, FileText, ShieldCheck, Ship, BadgeCheck, Headset, ClipboardList, ClipboardCheck, Network } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { HeroBanner } from '@/components/hero-banner'
import { CATS, FAMILIES } from '@/data/catalog'
import { Photo } from '@/components/photo'
import { ItemTile, inSeason } from '@/components/item-tile'
import { CAT_PHOTO, catStyle } from '@/lib/cat-style'
import { BuyerReviews } from '@/components/buyer-reviews'
import { TrustPoints } from '@/components/trust-points'

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
          {([['10,000+', 'Audited suppliers on our onboard list'], ['172', 'Product lines, HS codes on each'], ['24 h', 'Proforma invoice turnaround'], ['110%', 'Cargo insurance on CIF orders']] as const).map(([n, l], i) => (
            <div key={l} className={`py-7 lg:py-9 ${i % 2 ? 'pl-6' : ''} ${i > 0 ? 'lg:border-l lg:border-border lg:pl-8' : ''} ${i > 1 ? 'border-t border-border lg:border-t-0' : ''}`}>
              <dt className="num font-display text-[clamp(2rem,4vw,3rem)] leading-none font-semibold text-ink">{n}</dt>
              <dd className="m-0 mt-2 text-[14.5px] text-muted-foreground">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Certifications */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 lg:flex-row lg:items-center lg:gap-8">
          <p className="m-0 flex-none text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">Partner factories certified to</p>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {['BSCI / amfori', 'WRAP', 'Sedex', 'OEKO-TEX', 'GOTS', 'ISO 9001', 'HACCP', 'ISO 22000', 'GlobalGAP', 'Halal'].map((c) => (
              <li key={c} className="rounded-md border border-border bg-card px-3 py-1.5 text-[13.5px] font-semibold text-ink">{c}</li>
            ))}
          </ul>
        </div>
      </section>

      <TrustPoints />

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
            <span className="mt-1 text-[14px] text-muted-foreground">Any product manufactured or grown in Bangladesh, in our catalogue or not.</span>
            <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-brand">Send a requirement {arrow}</span>
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="m-0 text-[clamp(1.8rem,3.4vw,2.5rem)]">We are the seller, not a directory.</h2>
          <p className="mt-3 mb-0 text-[17px] text-muted-foreground">You contract with BengalExport on one proforma invoice. We hold the supplier side: selection, compliance, inspection, documents and freight.</p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {([
            [Network, 'Supplier selection', 'Factories and farms matched to your product, volume and target price from 10,000+ on our onboard list.', '/suppliers'],
            [BadgeCheck, 'Reliability', 'Capacity, export history and on-time record verified before a supplier is allocated to your order.', '/suppliers'],
            [ShieldCheck, 'Compliance', 'BSCI/amfori, WRAP, Sedex, OEKO-TEX, GOTS, ISO, HACCP and GlobalGAP, matched to your market\'s requirements.', '/quality'],
            [ClipboardCheck, 'Quality control', 'In-house pre-shipment inspection on every order. SGS, Intertek and Bureau Veritas welcome at your request.', '/quality'],
            [Ship, 'Logistics', 'FCL, LCL, reefer and air freight, insured to 110% of invoice value and delivered to your port.', '/shipping'],
            [FileText, 'Documents and LC', 'Commercial invoice, packing list, B/L, certificate of origin or REX, phytosanitary and health certificates, presented through our bank.', '/how-we-work'],
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
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2 className="m-0 text-[clamp(1.8rem,3.4vw,2.5rem)]">How an order runs</h2>
          <Link to="/how-we-work" className="inline-flex items-center gap-1 font-semibold text-brand no-underline">All eight steps and LC terms {arrow}</Link>
        </div>
        <ol className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ['Requirement', 'You send products, quantities and destination port. We return a proforma invoice within 24 hours.'],
            ['Samples and contract', 'Samples dispatched within 24 hours of the sample invoice. You sign the proforma invoice.'],
            ['Letter of Credit', 'Your bank issues an irrevocable LC at sight for the proforma value. Production starts on acceptance.'],
            ['Inspection and shipment', 'Pre-shipment inspection, then shipment and document presentation through our bank. Your bank pays against compliant documents.'],
          ] as const).map(([t, d], i) => (
            <li key={t} className="border-t-2 border-brand pt-4">
              <span className="num text-[13px] font-semibold text-brand">0{i + 1}</span>
              <h3 className="mt-1 mb-0 text-[18px]">{t}</h3>
              <p className="mt-2 mb-0 text-[14.5px] text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </section>


      {/* Order protection */}
      <section className="mt-20 border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow m-0 mb-2">Order protection</p>
            <h2 className="m-0 text-[clamp(1.8rem,3.4vw,2.5rem)]">How your order is protected</h2>
            <p className="mt-3 mb-0 text-[17px] text-muted-foreground">Large orders need more than a promise. Each stage has a control you can verify.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {([
              ['Your funds', 'Nothing is paid in advance. Your bank holds the money under an irrevocable LC (UCP 600) and releases it only against documents that match the terms you set.'],
              ['Your goods', 'Our QC team inspects materials, in-line production and finished cartons before loading. You may appoint SGS, Intertek or Bureau Veritas, or visit the factory.'],
              ['Your documents', 'Commercial invoice, packing list, on-board B/L, certificate of origin or REX statement, and the phytosanitary, health or Halal certificates your market requires.'],
              ['Your timeline', 'Latest shipment date and expiry are written into the LC. We ship before that date or the credit lapses. Progress photos at every stage.'],
            ] as const).map(([t, d]) => (
              <div key={t} className="rounded-xl border border-border bg-paper p-6">
                <h3 className="mt-0 mb-2 text-[18px]">{t}</h3>
                <p className="m-0 text-[14.5px] text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <ul className="m-0 mt-8 flex list-none flex-wrap gap-x-8 gap-y-2 p-0 text-[14px] text-muted-foreground">
            {['Incoterms 2020 · CIF / CIP', 'UCP 600 documentary credits', 'Export proceeds via authorised-dealer bank, Bangladesh Bank rules', 'HS code stated on every product', 'Bangladesh Export Policy 2024–27'].map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Buyer desk */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="grid items-center gap-8 overflow-hidden rounded-2xl bg-ink p-8 text-paper md:grid-cols-[1.2fr_1fr] md:p-12">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1 text-[13px] font-semibold"><BadgeCheck className="size-4" aria-hidden="true" />Buyer desk · no fee</span>
            <h2 className="mt-4 mb-3 text-[clamp(1.8rem,3.4vw,2.5rem)] text-paper">A named account manager for your orders</h2>
            <p className="m-0 text-[17px] text-paper/80">Open a buyer account to track each request from proforma invoice to LC, production, inspection and shipment, with one person accountable throughout.</p>
            <Link to="/account" hash="signup" className="btn mt-6 bg-paper text-ink">Open a buyer account <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <ul className="m-0 grid gap-3 p-0">
            {([[Headset, 'Named account manager', 'One person who knows your specifications, markets and history'], [BadgeCheck, 'Verified buyer status', 'Granted after company checks; brings priority factory allocation'], [ClipboardList, 'Order tracking', 'Proforma invoice, samples, LC, production, inspection and shipment in one view']] as const).map(([Icon, t, d]) => (
              <li key={t} className="flex list-none gap-3 rounded-xl bg-paper/5 p-4"><Icon className="mt-0.5 size-5 flex-none text-[hsl(var(--brand-soft))]" aria-hidden="true" /><span><b className="block">{t}</b><span className="text-[14px] text-paper/70">{d}</span></span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* Popular */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2 className="m-0 text-[clamp(1.8rem,3.4vw,2.5rem)]">Frequently sourced</h2>
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
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-ok px-3 py-1 text-[13px] font-semibold text-white"><Leaf className="size-3.5" aria-hidden="true" /> In season</div>
                <h2 className="m-0 text-[clamp(1.8rem,3.4vw,2.5rem)]">Fresh produce available in {MONTH_NAME}</h2>
              </div>
              <Link to="/products" search={{ cat: 'produce' }} className="btn btn-primary">All {produce.length} fresh items</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {seasonal.map(({ f, s }) => <ItemTile key={f.id + s.n} f={f} s={s} price={false} />)}
            </div>
          </div>
        </section>
      )}

      <BuyerReviews />

      {/* Suppliers */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <Link to="/suppliers" className="flex flex-col items-start justify-between gap-4 rounded-2xl border-2 border-dashed border-jute bg-jute-soft p-7 text-foreground no-underline md:flex-row md:items-center">
          <div>
            <h3 className="m-0 text-xl">Manufacturer or grower in Bangladesh?</h3>
            <p className="mt-1 mb-0 text-muted-foreground">Apply to our onboard list. Audit, documentation and buyer allocation are handled by our team.</p>
          </div>
          <span className="btn bg-jute text-white">Apply as a supplier {arrow}</span>
        </Link>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-brand p-10 text-brand-ink md:flex-row md:items-center">
          <div>
            <h2 className="m-0 text-[clamp(1.6rem,3vw,2.3rem)]">Send your requirement. Proforma invoice within 24 hours.</h2>
            <p className="mt-2 mb-0 text-[15.5px] text-brand-ink/80">Priced CIF to your port, with specifications, packing, shipment date and LC terms.</p>
          </div>
          <Link to="/quote" className="btn bg-white px-7 py-3.5 text-base text-brand">Request a quotation</Link>
        </div>
      </section>
    </div>
  )
}
