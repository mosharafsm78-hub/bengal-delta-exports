import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { CheckCircle2, Trash2, Landmark, Plus, Lock } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { basket, useBasket } from '@/lib/quote-basket'
import { FAMILIES } from '@/data/catalog'
import { PAYMENT_HEADLINE, SITE, STEPS } from '@/data/site'
import { Photo } from '@/components/photo'
import { mailtoFor, submitLead, type LeadPayload } from '@/lib/leads'
import { slug, usd } from '@/lib/slug'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface QuoteSearch { tab?: 'requirement'; msg?: string; samples?: boolean }

export const Route = createFileRoute('/quote')({
  validateSearch: (s: Record<string, unknown>): QuoteSearch => ({ tab: s.tab === 'requirement' ? 'requirement' : undefined, msg: typeof s.msg === 'string' ? s.msg.slice(0, 300) : undefined, samples: s.samples === true || s.samples === 'true' ? true : undefined }),
  head: () => pageHead('/quote'),
  component: QuotePage,
})

const COUNTRIES = ['Australia', 'Austria', 'Bahrain', 'Belgium', 'Canada', 'China', 'Czech Republic', 'Denmark', 'Finland', 'France', 'Germany', 'Greece', 'Hong Kong', 'India', 'Indonesia', 'Ireland', 'Italy', 'Japan', 'Kuwait', 'Malaysia', 'Maldives', 'Nepal', 'Netherlands', 'New Zealand', 'Norway', 'Oman', 'Poland', 'Portugal', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam']
const CERTS = ['GlobalGAP', 'Halal', 'OEKO-TEX', 'GOTS / organic', 'BSCI', 'HACCP']
const label = 'mb-1.5 block text-sm font-semibold'

function photoFor(familyId: string, style: string) {
  const f = FAMILIES.find((x) => x.id === familyId)
  return f?.styles.find((s) => s.n === style)?.photo ?? f?.photo ?? ''
}

function QuotePage() {
  const search = Route.useSearch()
  const items = useBasket()
  const [kind, setKind] = useState<'quote' | 'requirement'>('quote')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<'' | 'saved' | 'email'>('')
  const [lastPayload, setLastPayload] = useState<LeadPayload | null>(null)
  const [ref, setRef] = useState('')
  const [pick, setPick] = useState('')
  const [certs, setCerts] = useState<string[]>([])
  const [wantSamples, setWantSamples] = useState(false)
  const [form, setForm] = useState({ quantity: '', unit: 'pieces', requirement: '', country: '', port: '', incoterm: 'CIF to my port (recommended)', neededBy: '', company: '', buyerType: 'Importer / distributor', name: '', email: '', phone: '', website: '', notes: '', hp: '' })
  // Apply ?tab / ?msg / ?samples after hydration (the static page is built without them).
  useEffect(() => {
    if (search.tab === 'requirement') setKind('requirement')
    if (search.samples) setWantSamples(true)
    if (search.msg) setForm((f) => ({ ...f, requirement: f.requirement || search.msg! }))
  }, [search.tab, search.samples, search.msg])
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const total = items.reduce((s, i) => s + (i.unitMid && i.qtyNum ? i.unitMid * i.qtyNum : 0), 0)

  if (done) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
          <span className="grid size-14 place-items-center rounded-full bg-ok-soft"><CheckCircle2 className="size-8 text-ok" aria-hidden="true" /></span>
          {done === 'saved' ? (
            <>
              <h1 className="mt-5 mb-0 text-3xl">Thank you, {form.name.split(' ')[0]}! We have your request.</h1>
              <p className="mt-3 text-lg text-muted-foreground">Your reference is <b className="text-foreground">{ref}</b>. We will email your firm price (proforma invoice) to <b className="text-foreground">{form.email}</b> within 24 hours.</p>
            </>
          ) : (
            <>
              <h1 className="mt-5 mb-0 text-3xl">Almost done: press Send in your email app.</h1>
              <p className="mt-3 text-lg text-muted-foreground">We opened an email to {SITE.email} with your request filled in.</p>
              {lastPayload && <a href={mailtoFor(lastPayload)} className="btn btn-outline mt-2">Open the email again</a>}
            </>
          )}
          <h2 className="mt-8 mb-3 font-sans text-base font-semibold tracking-normal">What happens next</h2>
          <ol className="m-0 grid list-none gap-3 p-0 text-[15px]">
            {STEPS.slice(1, 5).map(([t, d], i) => <li key={t} className="flex gap-3"><span className="num grid size-7 flex-none place-items-center rounded-full bg-brand text-xs font-semibold text-brand-ink">{i + 2}</span><span><b>{t}.</b> <span className="text-muted-foreground">{d}</span></span></li>)}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/how-we-work" hash="lc" className="btn btn-outline">How to open the LC</Link><Link to="/products" className="btn btn-primary">Keep browsing</Link></div>
        </div>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.hp) return
    if (kind === 'quote' && items.length === 0) return setError('Your list is empty. Add a product, or switch to “Describe your requirement”.')
    if (kind === 'requirement' && !form.requirement.trim()) return setError('Please tell us what you need.')
    if (!form.name.trim() || !form.country.trim()) return setError('Please enter your name and country.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError('Please enter a valid email address so we can send your price.')
    const qty = form.quantity.trim() ? `${form.quantity.trim()} ${form.unit}` : items.map((i) => i.qty).filter(Boolean).join(' + ') || 'to be advised'
    const reference = `BDE-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const payload: LeadPayload = {
      reference,
      kind,
      items: kind === 'quote' ? items.map((i) => ({ family: i.family, style: i.style, qty: i.qty, spec: i.spec, estimate: i.estimate })) : [],
      requirement: kind === 'requirement' ? form.requirement : undefined,
      quantity: qty, country: form.country, port: form.port || undefined, incoterm: form.incoterm,
      neededBy: form.neededBy || undefined, certificates: certs, company: form.company.trim() || '-', buyerType: form.buyerType,
      name: form.name.trim(), email: form.email.trim(), phone: form.phone || undefined, website: form.website || undefined,
      notes: [wantSamples ? 'SAMPLES REQUESTED FIRST' : '', total > 0 ? `Estimated product value ≈ ${usd(total)}` : '', form.notes].filter(Boolean).join(' · ') || undefined,
      sourcePage: typeof window !== 'undefined' ? window.location.pathname : undefined, consent: true,
    }
    setBusy(true)
    try {
      const r = await submitLead(payload)
      setRef(reference)
      setLastPayload(payload)
      if (r === 'saved' && kind === 'quote') basket.clear()
      setDone(r)
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again or email us.')
    } finally {
      setBusy(false)
    }
  }

  const tab = (on: boolean) => cn('flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold sm:flex-none', on ? 'bg-card shadow-sm' : 'text-muted-foreground')

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <div className="mb-8">
        <h1 className="m-0 text-[clamp(2rem,4vw,2.8rem)]">Request a quotation</h1>
        <p className="mt-2 mb-0 text-[17px] text-muted-foreground">Proforma invoice within 24 hours, priced CIF to your port.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_.7fr]">
        <form onSubmit={onSubmit} noValidate className="grid gap-6">
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <h2 className="mt-0 mb-4 flex items-center gap-2 font-sans text-lg font-semibold tracking-normal"><span className="grid size-7 place-items-center rounded-full bg-brand text-sm text-brand-ink">1</span> Requirement</h2>
            <div className="mb-5 inline-flex w-full gap-1 rounded-xl bg-muted p-1 sm:w-auto" role="tablist">
              <button type="button" role="tab" aria-selected={kind === 'quote'} onClick={() => setKind('quote')} className={tab(kind === 'quote')}>Selected products{items.length ? ` (${items.length})` : ''}</button>
              <button type="button" role="tab" aria-selected={kind === 'requirement'} onClick={() => setKind('requirement')} className={tab(kind === 'requirement')}>Describe your requirement</button>
            </div>

            {kind === 'quote' ? (
              <>
                {items.length > 0 ? (
                  <ul className="m-0 mb-4 grid list-none gap-2 p-0">
                    {items.map((i) => (
                      <li key={i.key} className="flex items-center gap-3 rounded-xl border border-border p-3">
                        <Photo id={photoFor(i.familyId, i.style)} alt="" className="size-16 flex-none rounded-lg" />
                        <div className="min-w-0 flex-1">
                          <Link to="/products/$familyId/$itemId" params={{ familyId: i.familyId, itemId: i.itemId ?? slug(i.style) }} className="font-semibold text-foreground no-underline hover:text-brand">{i.style}</Link>
                          <div className="text-[13px] text-muted-foreground">{[i.estimate, i.spec].filter(Boolean).join(' · ')}</div>
                          <label className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px]">
                            <span className="text-muted-foreground">Quantity</span>
                            <input defaultValue={i.qtyNum ? String(i.qtyNum) : (i.qty ?? '')} inputMode="numeric" placeholder="e.g. 3000" aria-label={`Quantity for ${i.style}`} onBlur={(e) => { const v = e.target.value.trim(); const n = parseFloat(v.replace(/,/g, '')) || undefined; basket.add({ familyId: i.familyId, family: i.family, style: i.style, itemId: i.itemId, spec: i.spec, estimate: i.estimate, unitMid: i.unitMid, unit: i.unit, qtyNum: n, qty: n ? `${n.toLocaleString('en-US')} ${i.unit ?? ''}`.trim() : v || undefined }) }} className="num w-28 rounded-md border border-input bg-card px-2 py-1" />
                            {i.unitMid && i.qtyNum ? <span className="num font-semibold">≈ {usd(i.unitMid * i.qtyNum)}</span> : null}
                          </label>
                        </div>
                        <button type="button" onClick={() => basket.remove(i.key)} className="rounded-lg p-2 text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={`Remove ${i.style}`}><Trash2 className="size-4" /></button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-0 mb-4 rounded-xl bg-muted px-4 py-3 text-[15px]">Your list is empty. <Link to="/products" className="font-semibold text-brand">Browse products</Link> or pick one here:</p>
                )}
                <label htmlFor="add-prod" className="sr-only">Add a product</label>
                <div className="relative">
                  <Plus className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand" aria-hidden="true" />
                  <select id="add-prod" className="field" style={{ paddingLeft: '2.25rem' }} value={pick} onChange={(e) => {
                    const [fid, si] = e.target.value.split('::')
                    const f = FAMILIES.find((x) => x.id === fid)
                    if (f) { const s = f.styles[Number(si)]; const m = (s.p[0] + s.p[1]) / 2; basket.add({ familyId: f.id, family: f.name, style: s.n, itemId: slug(s.n), estimate: `≈$${m.toFixed(2)}/${s.u ?? 'pc'}`, unitMid: m, unit: s.u ?? 'pc' }) }
                    setPick('')
                  }}>
                    <option value="">Add another product…</option>
                    {FAMILIES.map((f) => (
                      <optgroup key={f.id} label={f.name}>
                        {f.styles.map((s, i) => <option key={s.n} value={`${f.id}::${i}`}>{s.n}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                {total > 0 && (<>
                  <div className="mt-4 flex items-baseline justify-between gap-2 rounded-xl bg-brand-soft px-4 py-3">
                    <span className="font-medium">Approximate value</span>
                    <span className="num font-display text-2xl font-semibold">≈ {usd(total)} <span className="font-sans text-sm font-normal text-muted-foreground">products</span></span>
                  </div>
                  <p className="mt-1.5 mb-0 text-[12.5px] text-muted-foreground">Sending this request is free and you are not committing to anything. We reply with a firm offer; you pay only if you accept it, by LC at your bank.</p>
                </>)}
              </>
            ) : (
              <>
                <label htmlFor="req" className="sr-only">Requirement</label>
                <textarea id="req" rows={5} className="field" value={form.requirement} onChange={set('requirement')} placeholder="Product, quantity, specification, packing, target price, or any question." />
              </>
            )}
            <label className={cn('mt-5 flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4', wantSamples ? 'border-jute bg-jute-soft' : 'border-border')}>
              <input type="checkbox" className="mt-1 size-4 accent-[hsl(var(--jute))]" checked={wantSamples} onChange={(e) => setWantSamples(e.target.checked)} />
              <span className="text-[14.5px]"><b>Send me samples first.</b> We email a sample invoice (sample cost + express courier). Pay it and ready-style samples ship within 24 hours; custom samples take 5–10 days. The cost is credited on your order.</span>
            </label>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <h2 className="mt-0 mb-4 flex items-center gap-2 font-sans text-lg font-semibold tracking-normal"><span className="grid size-7 place-items-center rounded-full bg-brand text-sm text-brand-ink">2</span> Where should we send the proforma invoice?</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="name" className={label}>Your name *</label><input id="name" autoComplete="name" className="field" value={form.name} onChange={set('name')} /></div>
              <div><label htmlFor="email" className={label}>Email *</label><input id="email" type="email" autoComplete="email" className="field" value={form.email} onChange={set('email')} placeholder="you@company.com" /></div>
              <div><label htmlFor="country" className={label}>Country *</label><input id="country" list="countries" autoComplete="country-name" className="field" value={form.country} onChange={set('country')} placeholder="e.g. Germany" /><datalist id="countries">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist></div>
              <div><label htmlFor="company" className={label}>Company</label><input id="company" autoComplete="organization" className="field" value={form.company} onChange={set('company')} /></div>
              <div className="sm:col-span-2"><label htmlFor="phone" className={label}>WhatsApp / phone <span className="font-normal text-muted-foreground">(faster replies)</span></label><input id="phone" type="tel" autoComplete="tel" className="field" value={form.phone} onChange={set('phone')} placeholder="+49 …" /></div>
            </div>

            <details className="mt-5 rounded-xl border border-border">
              <summary className="cursor-pointer px-4 py-3 font-semibold">More details (optional)</summary>
              <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-2">
                <div><label htmlFor="qty" className={label}>Total quantity</label><input id="qty" className="field" value={form.quantity} onChange={set('quantity')} placeholder="e.g. 5000" /></div>
                <div><label htmlFor="unit" className={label}>Unit</label><select id="unit" className="field" value={form.unit} onChange={set('unit')}>{['pieces', 'pairs', 'sets', 'kg', 'metric tons', 'cartons', '20 ft containers', '40 ft containers'].map((u) => <option key={u}>{u}</option>)}</select></div>
                <div><label htmlFor="port" className={label}>Destination port or city</label><input id="port" className="field" value={form.port} onChange={set('port')} placeholder="e.g. Hamburg" /></div>
                <div><label htmlFor="inc" className={label}>Price basis</label><select id="inc" className="field" value={form.incoterm} onChange={set('incoterm')}>{['CIF to my port (recommended)', 'CIP by air', 'Door delivery (DAP)', 'CFR (I insure)', 'FOB (my own forwarder)', 'Not sure, advise me'].map((u) => <option key={u}>{u}</option>)}</select></div>
                <div><label htmlFor="when" className={label}>Needed by</label><input id="when" type="month" className="field" value={form.neededBy} onChange={set('neededBy')} /></div>
                <div><label htmlFor="btype" className={label}>You are a</label><select id="btype" className="field" value={form.buyerType} onChange={set('buyerType')}>{['Importer / distributor', 'Wholesaler', 'Retailer / supermarket', 'Brand', 'Restaurant / food service', 'Sourcing agent', 'Other'].map((u) => <option key={u}>{u}</option>)}</select></div>
                <fieldset className="m-0 border-0 p-0 sm:col-span-2">
                  <legend className="mb-2 text-sm font-semibold">Certificates needed</legend>
                  <div className="flex flex-wrap gap-2">
                    {CERTS.map((c) => {
                      const on = certs.includes(c)
                      return <button key={c} type="button" aria-pressed={on} onClick={() => setCerts((p) => (on ? p.filter((x) => x !== c) : [...p, c]))} className={cn('rounded-full border px-3 py-1 text-[13.5px]', on ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-border bg-card')}>{c}</button>
                    })}
                  </div>
                </fieldset>
                <div><label htmlFor="web" className={label}>Company website</label><input id="web" className="field" value={form.website} onChange={set('website')} placeholder="https://" /></div>
                <div className="sm:col-span-2"><label htmlFor="notes" className={label}>Notes</label><textarea id="notes" rows={3} className="field" value={form.notes} onChange={set('notes')} placeholder="Target price, packing, labels, sample needs…" /></div>
              </div>
            </details>
            <div className="hidden" aria-hidden="true"><label htmlFor="hp">Leave empty</label><input id="hp" tabIndex={-1} autoComplete="off" value={form.hp} onChange={set('hp')} /></div>

            {error && <p role="alert" className="mt-5 mb-0 rounded-lg bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{error}</p>}
            <button type="submit" disabled={busy} className="btn btn-primary mt-6 w-full py-4 text-base sm:w-auto sm:px-10">{busy ? 'Sending…' : 'Request proforma invoice'}</button>
            <p className="mt-3 mb-0 flex items-center gap-1.5 text-[13px] text-muted-foreground"><Lock className="size-3.5" aria-hidden="true" /> We only use your details to reply to this request. <Link to="/privacy" className="text-brand">Privacy policy</Link></p>
          </section>
        </form>

        <aside className="grid content-start gap-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mt-0 mb-4 font-sans text-base font-semibold tracking-normal">After you send</h2>
            <ol className="m-0 grid list-none gap-3 p-0 text-[14.5px]">
              {['Proforma invoice by email within 24 hours: product, freight and insurance to your port', 'Samples against sample invoice, dispatched within 24 hours by express courier', 'Your bank issues an irrevocable LC at sight for the proforma value', 'Production, pre-shipment inspection and shipment before the LC\'s latest date', 'Your bank pays against compliant shipping documents'].map((t, i) => (
                <li key={t} className="flex gap-2.5"><span className="num grid size-6 flex-none place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand">{i + 1}</span>{t}</li>
              ))}
            </ol>
          </div>
          <div className="flex gap-3 rounded-2xl bg-brand-soft p-6 text-[14.5px]">
            <Landmark className="mt-0.5 size-5 flex-none text-brand" aria-hidden="true" />
            <p className="m-0"><b>No payment at this stage.</b> Orders are settled by {PAYMENT_HEADLINE}, under UCP 600, after you accept the proforma invoice. <Link to="/how-we-work" className="font-semibold text-brand">Trade terms</Link></p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-[14.5px]">
            <p className="m-0 font-semibold">Prefer email?</p>
            <a href={`mailto:${SITE.email}`} className="text-brand">{SITE.email}</a>
            <p className="m-0 mt-1 text-muted-foreground">{SITE.hours}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
