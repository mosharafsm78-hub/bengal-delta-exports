import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { CheckCircle2, Trash2, ShieldCheck, Clock, FileText } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { basket, useBasket } from '@/lib/quote-basket'
import { FAMILIES } from '@/data/catalog'
import { SITE } from '@/data/site'
import { PageHead } from '@/components/site-shell'
import { Photo } from '@/components/photo'
import { leadsOnline, mailtoFor, submitLead, type LeadPayload } from '@/lib/leads'
import { slug } from '@/lib/slug'
import { cn } from '@/lib/utils'

interface QuoteSearch { tab?: 'requirement' }

export const Route = createFileRoute('/quote')({
  validateSearch: (s: Record<string, unknown>): QuoteSearch => ({ tab: s.tab === 'requirement' ? 'requirement' : undefined }),
  head: () => pageHead('/quote'),
  component: QuotePage,
})

const CERTS = ['GlobalGAP', 'Halal', 'OEKO-TEX', 'GOTS / organic', 'BSCI', 'HACCP']
const label = 'mb-1.5 block text-sm font-semibold'

function photoFor(familyId: string, style: string) {
  const f = FAMILIES.find((x) => x.id === familyId)
  return f?.styles.find((s) => s.n === style)?.photo ?? f?.photo ?? ''
}

function QuotePage() {
  const search = Route.useSearch()
  const items = useBasket()
  const [kind, setKind] = useState<'quote' | 'requirement'>(search.tab === 'requirement' ? 'requirement' : 'quote')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<'' | 'saved' | 'email'>('')
  const [lastPayload, setLastPayload] = useState<LeadPayload | null>(null)
  const [pick, setPick] = useState('')
  const [certs, setCerts] = useState<string[]>([])
  const [form, setForm] = useState({ quantity: '', unit: 'pieces', requirement: '', country: '', port: '', incoterm: 'FOB Bangladesh', neededBy: '', company: '', buyerType: 'Importer / distributor', name: '', email: '', phone: '', website: '', notes: '', consent: false, hp: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  if (done) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="rounded-lg border border-border bg-card p-10">
          <CheckCircle2 className="size-10 text-ok" aria-hidden="true" />
          {done === 'saved' ? (
            <>
              <h1 className="mt-4 mb-0 text-3xl">Thank you, your request is in.</h1>
              <p className="mt-3 text-lg text-muted-foreground">Our sales team will reply to {form.email} with a priced proforma invoice within 24 hours ({SITE.hours}).</p>
            </>
          ) : (
            <>
              <h1 className="mt-4 mb-0 text-3xl">Almost done: press Send in your email app.</h1>
              <p className="mt-3 text-lg text-muted-foreground">We opened an email to {SITE.email} with your request filled in. If it didn't open, use the button below.</p>
              {lastPayload && <a href={mailtoFor(lastPayload)} className="btn btn-outline mt-2">Open the email again</a>}
            </>
          )}
          <div className="mt-8 flex gap-3"><Link to="/products" className="btn btn-primary">Keep browsing</Link></div>
        </div>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.hp) return
    if (kind === 'quote' && items.length === 0) return setError('Add at least one product to your quote, or switch to “Send any requirement”.')
    if (kind === 'requirement' && !form.requirement.trim()) return setError('Describe what you need.')
    const qty = form.quantity.trim() || items.map((i) => i.qty).filter(Boolean).join(' + ')
    if (!qty || !form.country.trim() || !form.company.trim() || !form.name.trim()) return setError('Please fill in quantity, destination country, company and your name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError('Please enter a valid business email.')
    if (!form.consent) return setError('Please tick the box so we can send your quote by email.')
    const payload: LeadPayload = {
      kind,
      items: kind === 'quote' ? items.map((i) => ({ family: i.family, style: i.style, qty: i.qty, spec: i.spec, estimate: i.estimate })) : [],
      requirement: kind === 'requirement' ? form.requirement : undefined,
      quantity: qty, unit: form.quantity.trim() ? form.unit : undefined, country: form.country, port: form.port || undefined, incoterm: form.incoterm,
      neededBy: form.neededBy || undefined, certificates: certs, company: form.company, buyerType: form.buyerType,
      name: form.name, email: form.email.trim(), phone: form.phone || undefined, website: form.website || undefined, notes: form.notes || undefined,
      sourcePage: typeof window !== 'undefined' ? window.location.pathname : undefined, consent: form.consent,
    }
    setBusy(true)
    try {
      const r = await submitLead(payload)
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

  const tab = (on: boolean) => cn('rounded-full border px-4 py-2 text-sm font-semibold', on ? 'border-ink bg-ink text-paper' : 'border-border bg-card')

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <PageHead eyebrow="Request a quote" title="Tell us what you need" lead="One request can cover many products. We reply with a priced proforma invoice within 24 hours. No payment or commitment until you sign." />
      <div className="grid gap-8 lg:grid-cols-[1.45fr_.55fr]">
        <form onSubmit={onSubmit} noValidate className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap gap-2" role="tablist">
            <button type="button" role="tab" aria-selected={kind === 'quote'} onClick={() => setKind('quote')} className={tab(kind === 'quote')}>Quote for listed products</button>
            <button type="button" role="tab" aria-selected={kind === 'requirement'} onClick={() => setKind('requirement')} className={tab(kind === 'requirement')}>Send any requirement or question</button>
          </div>

          {kind === 'quote' ? (
            <div className="mb-6">
              <h2 className="mt-0 mb-3 font-sans text-base font-semibold tracking-normal">1. Products in your quote</h2>
              {items.length > 0 ? (
                <ul className="m-0 mb-3 grid list-none gap-2 p-0">
                  {items.map((i) => (
                    <li key={i.key} className="flex items-center gap-3 rounded-md border border-border bg-paper p-2.5 text-sm">
                      <Photo id={photoFor(i.familyId, i.style)} alt="" className="size-14 flex-none rounded" />
                      <div className="min-w-0 flex-1">
                        <Link to="/products/$familyId/$itemId" params={{ familyId: i.familyId, itemId: i.itemId ?? slug(i.style) }} className="font-semibold text-foreground no-underline hover:text-brand">{i.style}</Link>
                        <span className="text-muted-foreground"> · {i.family}</span>
                        <div className="text-xs text-muted-foreground">{[i.qty && `Qty ${i.qty}`, i.spec, i.estimate && `est. ${i.estimate}`].filter(Boolean).join(' · ')}</div>
                      </div>
                      <button type="button" onClick={() => basket.remove(i.key)} className="rounded p-2 text-danger hover:bg-danger-soft" aria-label={`Remove ${i.style}`}><Trash2 className="size-4" /></button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-3 text-sm text-muted-foreground">Nothing added yet. Pick products below, or use “Add to quote” on any product page.</p>
              )}
              <label htmlFor="add-prod" className="sr-only">Add a product</label>
              <select id="add-prod" className="field" value={pick} onChange={(e) => {
                const [fid, si] = e.target.value.split('::')
                const f = FAMILIES.find((x) => x.id === fid)
                if (f) { const s = f.styles[Number(si)]; basket.add({ familyId: f.id, family: f.name, style: s.n, itemId: slug(s.n), estimate: `$${s.p[0].toFixed(2)}–${s.p[1].toFixed(2)}/${s.u ?? 'pc'}` }) }
                setPick('')
              }}>
                <option value="">+ Add a product…</option>
                {FAMILIES.map((f) => (
                  <optgroup key={f.id} label={f.name}>
                    {f.styles.map((s, i) => <option key={s.n} value={`${f.id}::${i}`}>{s.n}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="req" className={label}>1. What do you need?</label>
              <textarea id="req" rows={5} className="field" value={form.requirement} onChange={set('requirement')} placeholder="Product, specification, packing, target price, or your question." />
            </div>
          )}

          <h2 className="mt-0 mb-3 font-sans text-base font-semibold tracking-normal">2. Quantity and delivery</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="qty" className={label}>Total quantity {items.some((i) => i.qty) && kind === 'quote' ? <span className="font-normal text-muted-foreground">(optional, per item set above)</span> : '*'}</label><input id="qty" className="field" value={form.quantity} onChange={set('quantity')} placeholder="e.g. 5000" /></div>
            <div><label htmlFor="unit" className={label}>Unit</label><select id="unit" className="field" value={form.unit} onChange={set('unit')}>{['pieces', 'pairs', 'sets', 'kg', 'metric tons', 'litres', 'cartons', '20 ft containers', '40 ft containers'].map((u) => <option key={u}>{u}</option>)}</select></div>
            <div><label htmlFor="country" className={label}>Destination country *</label><input id="country" autoComplete="country-name" className="field" value={form.country} onChange={set('country')} placeholder="e.g. Germany" /></div>
            <div><label htmlFor="port" className={label}>Destination port or city</label><input id="port" className="field" value={form.port} onChange={set('port')} placeholder="e.g. Hamburg" /></div>
            <div><label htmlFor="inc" className={label}>Price basis</label><select id="inc" className="field" value={form.incoterm} onChange={set('incoterm')}>{['FOB Bangladesh', 'CFR / CNF', 'CIF', 'DAP / DDP', 'Not sure, advise me'].map((u) => <option key={u}>{u}</option>)}</select></div>
            <div><label htmlFor="when" className={label}>Needed by</label><input id="when" type="month" className="field" value={form.neededBy} onChange={set('neededBy')} /></div>
          </div>

          <fieldset className="mt-5 border-0 p-0">
            <legend className="mb-2 text-sm font-semibold">Certificates needed</legend>
            <div className="flex flex-wrap gap-2">
              {CERTS.map((c) => {
                const on = certs.includes(c)
                return <button key={c} type="button" aria-pressed={on} onClick={() => setCerts((p) => (on ? p.filter((x) => x !== c) : [...p, c]))} className={cn('rounded-full border px-3 py-1 text-[13.5px]', on ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-border bg-card')}>{c}</button>
              })}
            </div>
          </fieldset>

          <h2 className="mt-8 mb-3 font-sans text-base font-semibold tracking-normal">3. Your details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="company" className={label}>Company *</label><input id="company" autoComplete="organization" className="field" value={form.company} onChange={set('company')} /></div>
            <div><label htmlFor="btype" className={label}>You are a</label><select id="btype" className="field" value={form.buyerType} onChange={set('buyerType')}>{['Importer / distributor', 'Wholesaler', 'Retailer / supermarket', 'Brand', 'Restaurant / food service', 'Sourcing agent', 'Other'].map((u) => <option key={u}>{u}</option>)}</select></div>
            <div><label htmlFor="name" className={label}>Your name *</label><input id="name" autoComplete="name" className="field" value={form.name} onChange={set('name')} /></div>
            <div><label htmlFor="email" className={label}>Business email *</label><input id="email" type="email" autoComplete="email" className="field" value={form.email} onChange={set('email')} /></div>
            <div><label htmlFor="phone" className={label}>WhatsApp / phone</label><input id="phone" type="tel" autoComplete="tel" className="field" value={form.phone} onChange={set('phone')} placeholder="+49 …" /></div>
            <div><label htmlFor="web" className={label}>Company website</label><input id="web" className="field" value={form.website} onChange={set('website')} placeholder="https://" /></div>
          </div>
          <div className="mt-4"><label htmlFor="notes" className={label}>Anything else?</label><textarea id="notes" rows={3} className="field" value={form.notes} onChange={set('notes')} placeholder="Target price, packing, labels, sample needs…" /></div>
          <div className="hidden" aria-hidden="true"><label htmlFor="hp">Leave empty</label><input id="hp" tabIndex={-1} autoComplete="off" value={form.hp} onChange={set('hp')} /></div>
          <label className="mt-5 flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={form.consent} onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))} />I agree to receive this quote and related product updates by email. I can unsubscribe at any time.</label>
          {error && <p role="alert" className="mt-4 rounded-md bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{error}</p>}
          <button type="submit" disabled={busy} className="btn btn-primary mt-6 px-8 py-3.5 text-base">{busy ? 'Sending…' : 'Send my request'}</button>
          {!leadsOnline && <p className="mt-2 text-xs text-muted-foreground">Your request opens in your email app, addressed to {SITE.email}.</p>}
        </form>

        <aside className="grid content-start gap-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mt-0 mb-3 font-sans text-base font-semibold tracking-normal">What happens next</h2>
            <ol className="m-0 grid list-none gap-3 p-0 text-[14.5px]">
              {[[Clock, 'Within 24 hours you get a priced proforma invoice.'], [FileText, 'We send samples, or photos and video, for approval.'], [ShieldCheck, 'Production or harvest starts only after your LC or deposit.']].map(([I, t]) => {
                const Icon = I as typeof Clock
                return <li key={t as string} className="flex gap-2.5"><Icon className="mt-0.5 size-4 flex-none text-brand" aria-hidden="true" />{t as string}</li>
              })}
            </ol>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mt-0 mb-2 font-sans text-base font-semibold tracking-normal">Direct contact</h2>
            <p className="m-0 text-[14.5px]"><a href={`mailto:${SITE.email}`} className="font-semibold text-brand">{SITE.email}</a><br /><span className="text-muted-foreground">{SITE.hours}</span></p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mt-0 mb-2 font-sans text-base font-semibold tracking-normal">Minimum orders</h2>
            <p className="m-0 text-[14.5px] text-muted-foreground">Garments 300–1,000 pcs per style · Footwear 300–600 pairs per design · Produce 300–500 kg by air or one reefer by sea · Mixed containers welcome.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
