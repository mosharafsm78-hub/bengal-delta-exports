import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Search, ArrowRight, Leaf, CheckCircle2, MousePointerClick, FileText, Landmark, Globe2, ShieldCheck, Factory, Ship, BadgeCheck, Headset, ClipboardList } from 'lucide-react'
import { pageHead } from '@/lib/head'
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
  const [q, setQ] = useState('')
  const navigate = useNavigate()
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
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-brand-soft/70 via-paper to-paper">
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-card px-3 py-1 text-[13px] font-semibold text-brand"><ShieldCheck className="size-4" aria-hidden="true" />Export house in Bangladesh · Since 2022</div>
            <h1 className="m-0 text-[clamp(2.3rem,5vw,3.9rem)] leading-[1.05]">Buy direct from Bangladesh. <span className="text-brand">Simple, safe, worldwide.</span></h1>
            <p className="mt-5 max-w-[54ch] text-lg leading-relaxed text-muted-foreground">
              Clothing, shoes, home textiles, jute, fresh produce and food from checked factories and farms. We inspect every order and deliver it insured to your port. Free offer in 24 hours.
            </p>
            <form
              className="mt-7 flex max-w-xl gap-2 rounded-full border border-border bg-card p-1.5 shadow-md"
              role="search"
              onSubmit={(e) => {
                e.preventDefault()
                void navigate({ to: '/products', search: { q: q.trim() || undefined } })
              }}
            >
              <label htmlFor="hub-search" className="sr-only">Search products</label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input id="hub-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="What do you want to buy?" className="w-full rounded-full border-0 bg-transparent py-2.5 pr-3 pl-11 text-base text-ink outline-none" />
              </div>
              <button type="submit" className="rounded-full bg-brand px-6 font-semibold text-white hover:opacity-90">Search</button>
            </form>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/quote" className="btn btn-primary">Get a free offer {arrow}</Link>
              <Link to="/how-we-work" className="btn btn-outline">How buying works</Link>
            </div>
            <ul className="mt-6 grid max-w-xl list-none grid-cols-2 gap-x-5 gap-y-2 p-0 text-[14.5px]">
              {['Pay by LC at sight, money safe', 'Inspected before shipment', 'Samples ship in 24 hours', '0% duty in EU, UK, Canada, Australia'].map((t) => (
                <li key={t} className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 size-4 flex-none text-brand" aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="grid grid-cols-3 gap-3">
              {([['tshirt-crew', 'T-shirts', 'col-span-2 row-span-2'], ['slides', 'Footwear', ''], ['bath-towels', 'Towels', ''], ['jute-tote', 'Jute bags', ''], ['polo-classic', 'Polos', ''], ['mango', 'Fresh produce', '']] as const).map(([id, label, span]) => (
                <div key={id} className={`group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${span}`}>
                  <Photo id={id} alt={label} className="aspect-square h-full w-full transition duration-500 group-hover:scale-[1.03]" eager />
                  <span className="absolute bottom-2 left-2 rounded-full bg-card/90 px-2.5 py-0.5 text-[12px] font-semibold text-ink shadow-sm">{label}</span>
                </div>
              ))}
            </div>
            <div className="absolute -bottom-5 -left-3 hidden max-w-[230px] items-start gap-2.5 rounded-xl border border-border bg-card p-3.5 shadow-lg sm:flex">
              <Landmark className="mt-0.5 size-5 flex-none text-brand" aria-hidden="true" />
              <span className="text-[13px] leading-snug"><b className="block">Your money stays safe</b>Paid by LC through your own bank, released only after shipment.</span>
            </div>
            <div className="absolute -top-4 -right-2 hidden items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-lg sm:flex">
              <Ship className="size-5 text-brand" aria-hidden="true" />
              <span className="text-[13px] leading-tight"><b className="block">Delivered to your port</b>Insured, export cleared</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2 className="m-0 text-[clamp(1.8rem,3.4vw,2.5rem)]">What do you want to buy?</h2>
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
            <span className="text-[17px] font-semibold">Something else?</span>
            <span className="mt-1 text-[14px] text-muted-foreground">Tell us. We find it in Bangladesh.</span>
            <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-brand">Ask us {arrow}</span>
          </Link>
        </div>
      </section>

      {/* Buyer desk */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="grid items-center gap-8 overflow-hidden rounded-2xl bg-ink p-8 text-paper md:grid-cols-[1.2fr_1fr] md:p-12">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1 text-[13px] font-semibold"><BadgeCheck className="size-4" aria-hidden="true" />Free for buyers</span>
            <h2 className="mt-4 mb-3 text-[clamp(1.8rem,3.4vw,2.5rem)] text-paper">Your own sourcing agent in Bangladesh</h2>
            <p className="m-0 text-[17px] text-paper/80">Open a free buyer account. Verified buyers get a named personal agent, an AI assistant that answers at any hour, and a live tracker for every offer, sample and shipment.</p>
            <Link to="/account" hash="signup" className="btn mt-6 bg-paper text-ink">Create free account <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <ul className="m-0 grid gap-3 p-0">
            {([[Headset, 'A named agent who knows your business', 'Plus instant AI answers, day and night'], [BadgeCheck, 'Verified buyer badge', 'Earned by checks on your company, never bought'], [ClipboardList, 'Every request tracked live', 'From offer to samples, LC, production and shipping']] as const).map(([Icon, t, d]) => (
              <li key={t} className="flex list-none gap-3 rounded-xl bg-paper/5 p-4"><Icon className="mt-0.5 size-5 flex-none text-[hsl(var(--brand-soft))]" aria-hidden="true" /><span><b className="block">{t}</b><span className="text-[14px] text-paper/70">{d}</span></span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <h2 className="m-0 mb-8 text-center text-[clamp(1.8rem,3.4vw,2.5rem)]">Buying is easy: 3 steps</h2>
        <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-3">
          {[
            { icon: MousePointerClick, color: 'garments', t: 'Choose', d: 'Pick products and quantity. You see the estimated price instantly.' },
            { icon: FileText, color: 'footwear', t: 'Get your offer', d: 'We send a firm price (proforma invoice) within 24 hours. Need samples? Pay the sample invoice and they ship within 24 hours.' },
            { icon: Landmark, color: 'produce', t: 'Pay safely and receive', d: 'Pay by 100% LC through your own bank. We ship; your bank pays only against shipping documents.' },
          ].map((s, i) => (
            <li key={s.t} style={catStyle(s.color)} className="cat-soft relative rounded-xl p-7">
              <span className="cat-bg grid size-12 place-items-center rounded-full"><s.icon className="size-6" aria-hidden="true" /></span>
              <span className="cat-text absolute top-6 right-7 font-display text-5xl font-semibold opacity-25">{i + 1}</span>
              <h3 className="mt-5 mb-0 text-xl">{s.t}</h3>
              <p className="mt-2 mb-0 text-[15.5px] text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-center"><Link to="/how-we-work" className="inline-flex items-center gap-1 font-semibold text-brand no-underline">See the full order process {arrow}</Link></p>
      </section>

      {/* Popular */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2 className="m-0 text-[clamp(1.8rem,3.4vw,2.5rem)]">Popular with importers</h2>
          <Link to="/prices" className="inline-flex items-center gap-1 font-semibold text-brand no-underline">Full price list {arrow}</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {popular.map(({ f, s }) => <ItemTile key={f.id + s.n} f={f} s={s} />)}
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
              {seasonal.map(({ f, s }) => <ItemTile key={f.id + s.n} f={f} s={s} />)}
            </div>
          </div>
        </section>
      )}

      {/* Why us */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <h2 className="m-0 mb-8 text-center text-[clamp(1.8rem,3.4vw,2.5rem)]">Why buyers choose us</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Landmark, 'produce', '100% LC payment', 'You pay through your own bank. Money is released only after we ship.', '/how-we-work'],
            [Globe2, 'home', '0% import duty', 'Duty-free into the EU, UK, Canada, Australia and China.', '/duty-free-markets'],
            [ShieldCheck, 'garments', 'Checked before shipping', 'Inspection, lab tests and official certificates for every order.', '/quality'],
            [Factory, 'footwear', 'Verified producers', 'Our team checks documents and visits every factory and farm before it supplies us.', '/suppliers'],
          ].map(([Icon, color, t, d, to]) => {
            const I = Icon as typeof Landmark
            return (
              <Link key={t as string} to={to as '/about'} style={catStyle(color as string)} className="group rounded-xl border border-border bg-card p-6 text-foreground no-underline transition hover:shadow-md">
                <span className="cat-soft cat-text grid size-11 place-items-center rounded-lg"><I className="size-5" aria-hidden="true" /></span>
                <h3 className="mt-4 mb-0 text-[17px]">{t as string}</h3>
                <p className="mt-1.5 mb-0 text-[14.5px] text-muted-foreground">{d as string}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Suppliers */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <Link to="/suppliers" className="flex flex-col items-start justify-between gap-4 rounded-2xl border-2 border-dashed border-jute bg-jute-soft p-7 text-foreground no-underline md:flex-row md:items-center">
          <div>
            <h3 className="m-0 text-xl">Are you a factory, farm or artisan in Bangladesh?</h3>
            <p className="mt-1 mb-0 text-muted-foreground">Become a verified supplier. We buy your products and handle the export.</p>
          </div>
          <span className="btn bg-jute text-white">Become a supplier {arrow}</span>
        </Link>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-brand p-10 text-brand-ink md:flex-row md:items-center">
          <div>
            <h2 className="m-0 text-[clamp(1.6rem,3vw,2.3rem)]">Tell us what you need. Get your price in 24 hours.</h2>
            <p className="mt-2 mb-0 opacity-90"><Ship className="mr-1 inline size-4" aria-hidden="true" />Sea from Chattogram, air from Dhaka, to any country.</p>
          </div>
          <Link to="/quote" className="btn bg-white px-7 py-3.5 text-base text-brand">Get a free quote</Link>
        </div>
      </section>
    </div>
  )
}
