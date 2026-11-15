import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { CheckCircle2, FileCheck2, Factory, PackageCheck, BadgeCheck, Handshake, Globe2, Banknote, Truck } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { CATS } from '@/data/catalog'
import { SITE } from '@/data/site'
import { submitSupplier } from '@/lib/leads'
import { catStyle } from '@/lib/cat-style'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/suppliers')({
  head: () => pageHead('/suppliers'),
  component: Suppliers,
})

const VERIFY: [typeof FileCheck2, string, string][] = [
  [FileCheck2, 'Documents check', 'Trade licence, TIN and BIN; Export Registration Certificate (ERC) if you export yourself; any product certificates.'],
  [Factory, 'Factory or farm visit', 'Our team visits your site: capacity, working conditions, quality control, and for farms, growing practice and pesticide use.'],
  [PackageCheck, 'Sample check', 'You send samples of the products you want to sell. We check them against the specs buyers ask for.'],
  [BadgeCheck, 'Verified and listed', 'You become a verified supplier. We send you buyer orders that match your products and capacity.'],
]

const CERTS = ['BSCI / amfori', 'WRAP', 'OEKO-TEX', 'GOTS', 'SEDEX', 'GlobalGAP', 'HACCP', 'Halal', 'ISO 9001']
const label = 'mb-1.5 block text-sm font-semibold'

function Suppliers() {
  const [form, setForm] = useState({ company: '', contactName: '', email: '', phone: '', district: '', products: '', capacity: '', businessType: 'Manufacturer / factory', exportedBefore: 'No, not yet', website: '', notes: '', hp: '' })
  const [cats, setCats] = useState<string[]>([])
  const [certs, setCerts] = useState<string[]>([])
  const [tl, setTl] = useState(false)
  const [erc, setErc] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggle = (list: string[], setList: (v: string[]) => void, v: string) => setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.hp) return
    if (!form.company.trim() || !form.contactName.trim() || !form.phone.trim() || !form.products.trim()) return setError('Please fill in company, your name, phone and products.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError('Please enter a valid email address.')
    const reference = `SUP-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    setBusy(true)
    try {
      const r = await submitSupplier({ reference, company: form.company.trim(), contactName: form.contactName.trim(), email: form.email.trim(), phone: form.phone.trim(), district: form.district || undefined, categories: cats, products: form.products.trim(), capacity: form.capacity || undefined, businessType: form.businessType, hasTradeLicence: tl, hasErc: erc, certificates: certs, exportedBefore: form.exportedBefore, website: form.website || undefined, notes: form.notes || undefined })
      setDone(r === 'saved' ? reference : 'email')
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
          <span className="grid size-14 place-items-center rounded-full bg-ok-soft"><CheckCircle2 className="size-8 text-ok" aria-hidden="true" /></span>
          <h1 className="mt-5 mb-0 text-3xl">{done === 'email' ? 'Almost done: press Send in your email app.' : 'Thank you! Your application is in.'}</h1>
          {done !== 'email' && <p className="mt-3 text-lg text-muted-foreground">Reference <b className="text-foreground">{done}</b>. We will call or email you within 3 working days to arrange the documents check.</p>}
          <Link to="/" className="btn btn-primary mt-6">Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section className="bg-jute-soft">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <span className="inline-block rounded-full bg-jute px-3 py-1 text-[13px] font-semibold text-white">For Bangladeshi factories, farms and artisans</span>
            <h1 className="mt-4 mb-0 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05]">Sell to importers worldwide. We handle the export.</h1>
            <p className="mt-5 max-w-[58ch] text-lg text-muted-foreground">Become a verified supplier. We buy your goods at an agreed price and export them under our own contract, so you never deal with foreign buyers, LCs, freight or customs.</p>
            <a href="#apply" className="btn btn-primary mt-7 px-7 py-3.5 text-base">Apply to become a supplier</a>
          </div>
          <ul className="m-0 grid list-none gap-3 p-0">
            {[[Handshake, 'One buyer: us', 'You sell to BengalExport in Bangladesh, in Taka, under a simple purchase order.'], [Banknote, 'Secure orders', 'We place orders only after the overseas buyer has opened a 100% LC with us.'], [Truck, 'No export paperwork', 'We handle LC, inspection, certificates, freight and customs.'], [Globe2, 'Reach buyers worldwide', 'Your products appear in our catalogue for importers in Europe, the Gulf, Asia and America.']].map(([I, t, d]) => {
              const Icon = I as typeof Handshake
              return (
                <li key={t as string} className="flex gap-3 rounded-xl bg-card p-4 shadow-sm">
                  <Icon className="mt-0.5 size-5 flex-none text-jute" aria-hidden="true" />
                  <span><b>{t as string}.</b> <span className="text-muted-foreground">{d as string}</span></span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16">
        <h2 className="m-0 mb-2 text-[clamp(1.8rem,3.4vw,2.4rem)]">How a supplier gets verified</h2>
        <p className="mt-0 mb-8 max-w-[70ch] text-muted-foreground">Buyers trust us because we check every supplier ourselves. Four steps, usually within 2–3 weeks.</p>
        <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-4">
          {VERIFY.map(([Icon, t, d], i) => (
            <li key={t} className="relative rounded-xl border border-border bg-card p-6">
              <span className="grid size-11 place-items-center rounded-full bg-jute text-white"><Icon className="size-5" aria-hidden="true" /></span>
              <span className="absolute top-5 right-6 font-display text-4xl font-semibold text-jute/25">{i + 1}</span>
              <h3 className="mt-4 mb-0 text-[17px]">{t}</h3>
              <p className="mt-1.5 mb-0 text-[14.5px] text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-[14.5px] text-muted-foreground">Verification is free. We keep checking: every order is inspected before shipment, and suppliers with repeated quality problems are removed.</p>
      </section>

      <section id="apply" className="mx-auto max-w-4xl scroll-mt-24 px-4 pt-16">
        <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="mt-0 mb-1 text-[clamp(1.6rem,3vw,2.1rem)]">Apply to become a verified supplier</h2>
          <p className="mt-0 mb-6 text-muted-foreground">Takes 3 minutes. We reply within 3 working days.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="s-co" className={label}>Company name *</label><input id="s-co" className="field" value={form.company} onChange={set('company')} /></div>
            <div><label htmlFor="s-name" className={label}>Your name *</label><input id="s-name" className="field" value={form.contactName} onChange={set('contactName')} /></div>
            <div><label htmlFor="s-phone" className={label}>Mobile / WhatsApp *</label><input id="s-phone" type="tel" className="field" value={form.phone} onChange={set('phone')} placeholder="+880 1…" /></div>
            <div><label htmlFor="s-email" className={label}>Email *</label><input id="s-email" type="email" className="field" value={form.email} onChange={set('email')} /></div>
            <div><label htmlFor="s-dist" className={label}>District</label><input id="s-dist" className="field" value={form.district} onChange={set('district')} placeholder="e.g. Gazipur" /></div>
            <div><label htmlFor="s-type" className={label}>You are a</label><select id="s-type" className="field" value={form.businessType} onChange={set('businessType')}>{['Manufacturer / factory', 'Farm or farmer group', 'Artisan group', 'Processor / packer', 'Trader'].map((x) => <option key={x}>{x}</option>)}</select></div>
          </div>
          <fieldset className="mt-5 border-0 p-0">
            <legend className="mb-2 text-sm font-semibold">What do you make or grow?</legend>
            <div className="flex flex-wrap gap-2">
              {CATS.map((c) => {
                const on = cats.includes(c.name)
                return <button key={c.id} type="button" aria-pressed={on} onClick={() => toggle(cats, setCats, c.name)} style={catStyle(c.id)} className={cn('rounded-full border px-3 py-1 text-[13.5px]', on ? 'cat-bg border-transparent font-semibold' : 'border-border bg-card')}>{c.name}</button>
              })}
            </div>
          </fieldset>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label htmlFor="s-prod" className={label}>Products *</label><textarea id="s-prod" rows={3} className="field" value={form.products} onChange={set('products')} placeholder="e.g. Cotton crew-neck T-shirts 160–200 GSM, polo shirts" /></div>
            <div><label htmlFor="s-cap" className={label}>Monthly capacity</label><input id="s-cap" className="field" value={form.capacity} onChange={set('capacity')} placeholder="e.g. 50,000 pcs / 20 tons" /></div>
            <div><label htmlFor="s-exp" className={label}>Exported before?</label><select id="s-exp" className="field" value={form.exportedBefore} onChange={set('exportedBefore')}>{['No, not yet', 'Yes, directly', 'Yes, through a buying house'].map((x) => <option key={x}>{x}</option>)}</select></div>
          </div>
          <fieldset className="mt-5 border-0 p-0">
            <legend className="mb-2 text-sm font-semibold">Documents you have</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
              <label className="flex items-center gap-2"><input type="checkbox" checked={tl} onChange={(e) => setTl(e.target.checked)} /> Trade licence</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={erc} onChange={(e) => setErc(e.target.checked)} /> Export Registration Certificate (ERC)</label>
            </div>
          </fieldset>
          <fieldset className="mt-4 border-0 p-0">
            <legend className="mb-2 text-sm font-semibold">Certificates (if any)</legend>
            <div className="flex flex-wrap gap-2">
              {CERTS.map((c) => {
                const on = certs.includes(c)
                return <button key={c} type="button" aria-pressed={on} onClick={() => toggle(certs, setCerts, c)} className={cn('rounded-full border px-3 py-1 text-[13.5px]', on ? 'border-jute bg-jute-soft font-semibold text-jute' : 'border-border bg-card')}>{c}</button>
              })}
            </div>
          </fieldset>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="s-web" className={label}>Website or Facebook page</label><input id="s-web" className="field" value={form.website} onChange={set('website')} /></div>
            <div><label htmlFor="s-notes" className={label}>Anything else?</label><input id="s-notes" className="field" value={form.notes} onChange={set('notes')} /></div>
          </div>
          <div className="hidden" aria-hidden="true"><label htmlFor="s-hp">Leave empty</label><input id="s-hp" tabIndex={-1} autoComplete="off" value={form.hp} onChange={set('hp')} /></div>
          {error && <p role="alert" className="mt-5 mb-0 rounded-lg bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{error}</p>}
          <button type="submit" disabled={busy} className="btn btn-primary mt-6 w-full py-4 text-base sm:w-auto sm:px-10">{busy ? 'Sending…' : 'Send my application'}</button>
          <p className="mt-3 mb-0 text-[13px] text-muted-foreground">Questions? Email <a href={`mailto:${SITE.email}?subject=Supplier%20question`} className="text-brand">{SITE.email}</a></p>
        </form>
      </section>
    </div>
  )
}
